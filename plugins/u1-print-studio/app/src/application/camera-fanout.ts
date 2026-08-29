import {
  MediaStreamTrack,
  RTCPeerConnection,
  type RTCIceCandidateInit,
  type RTCRtpCodecParameters,
  useH264,
} from "werift";

import type { CameraIceServerProvider } from "../camera-ice-config.js";
import type { CameraTicketCodec } from "./camera-relay.js";
import {
  CameraRelayClaimError,
  CameraRelayService,
  type CameraStreamLease,
} from "./camera-relay.js";
import {
  CameraWebRtcSessionError,
  type CameraIceCandidate,
  type CameraIceServer,
  type CameraWebRtcSessionController,
  type CameraViewerSessionStore,
  type CameraWebRtcSignalingSource,
  type OpenedCameraWebRtcSession,
} from "./camera-webrtc.js";

const DEFAULT_MAX_SDP_BYTES = 96 * 1024;
const DEFAULT_MAX_CANDIDATES_PER_CALL = 16;
const DEFAULT_MAX_CANDIDATES_PER_SESSION = 64;
const DEFAULT_MAX_CANDIDATE_BYTES = 8 * 1024;
const DEFAULT_MAX_ICE_FIELD_BYTES = 1_024;
const DEFAULT_TRACK_TIMEOUT_MILLISECONDS = 12_000;
const DEFAULT_ANSWER_TIMEOUT_MILLISECONDS = 15_000;

/** Opaque to application policy; the concrete adapter uses a werift track. */
export type CameraFanoutTrack = object;

export type CameraFanoutUpstream = {
  track: CameraFanoutTrack;
  close(): void;
  onTerminated(callback: () => void): () => void;
};

export type CameraFanoutViewer = {
  offerSdp: string;
  answer(sdp: string): Promise<void>;
  addCandidates(candidates: CameraIceCandidate[]): Promise<void>;
  close(): void;
  onTerminated(callback: () => void): () => void;
};

export type CameraFanoutPeerFactory = {
  openUpstream(
    signaling: CameraWebRtcSignalingSource,
    signal: AbortSignal
  ): Promise<CameraFanoutUpstream>;
  openViewer(
    track: CameraFanoutTrack,
    iceServers: CameraIceServer[]
  ): Promise<CameraFanoutViewer>;
};

type SharedUpstream = CameraFanoutUpstream & {
  viewers: number;
  unsubscribeTermination: () => void;
};

type ActiveViewer = {
  lease: CameraStreamLease;
  viewer: CameraFanoutViewer;
  expiryTimeout: ReturnType<typeof setTimeout>;
  answerTimeout: ReturnType<typeof setTimeout>;
  unsubscribeTermination: () => void;
  answer: string | null;
  candidateKeys: Set<string>;
};

export type CameraFanoutOptions = {
  maxSdpBytes?: number;
  maxCandidatesPerCall?: number;
  maxCandidatesPerSession?: number;
  maxCandidateBytes?: number;
  answerTimeoutMilliseconds?: number;
  now?: () => number;
};

function candidateKey(candidate: CameraIceCandidate): string {
  return JSON.stringify([
    candidate.candidate,
    candidate.sdpMid ?? null,
    candidate.sdpMLineIndex ?? null,
    candidate.usernameFragment ?? null,
  ]);
}

function validateSdp(value: unknown, maxSdpBytes: number): string {
  const sdp = typeof value === "string" ? value : "";
  if (!sdp || Buffer.byteLength(sdp) > maxSdpBytes) {
    throw new CameraWebRtcSessionError("invalid_answer");
  }
  return sdp;
}

/**
 * Server-terminated WebRTC fan-out. Exactly one printer peer is retained while
 * one or more viewers are active. Each viewer owns an independent downstream
 * peer, ICE credential set, expiry, answer deadline, and close lifecycle.
 */
export class CameraFanoutSessionService implements CameraViewerSessionStore {
  readonly privacyBoundary = "server-terminated-fanout" as const;
  private readonly sessions = new Map<string, ActiveViewer>();
  private upstream: SharedUpstream | null = null;
  private upstreamOpening: Promise<SharedUpstream> | null = null;
  private readonly maxSdpBytes: number;
  private readonly maxCandidatesPerCall: number;
  private readonly maxCandidatesPerSession: number;
  private readonly maxCandidateBytes: number;
  private readonly answerTimeoutMilliseconds: number;
  private readonly now: () => number;

  constructor(
    private readonly codec: CameraTicketCodec,
    private readonly signaling: CameraWebRtcSignalingSource,
    private readonly viewerIceServerProvider: Pick<CameraIceServerProvider, "issue">,
    private readonly peers: CameraFanoutPeerFactory,
    options: CameraFanoutOptions = {}
  ) {
    this.maxSdpBytes = options.maxSdpBytes ?? DEFAULT_MAX_SDP_BYTES;
    this.maxCandidatesPerCall =
      options.maxCandidatesPerCall ?? DEFAULT_MAX_CANDIDATES_PER_CALL;
    this.maxCandidatesPerSession =
      options.maxCandidatesPerSession ?? DEFAULT_MAX_CANDIDATES_PER_SESSION;
    this.maxCandidateBytes =
      options.maxCandidateBytes ?? DEFAULT_MAX_CANDIDATE_BYTES;
    this.answerTimeoutMilliseconds =
      options.answerTimeoutMilliseconds ?? DEFAULT_ANSWER_TIMEOUT_MILLISECONDS;
    this.now = options.now ?? Date.now;
  }

  async open(
    lease: CameraStreamLease,
    existingSessionId?: string
  ): Promise<OpenedCameraWebRtcSession> {
    const issued = existingSessionId
      ? { token: existingSessionId, digest: this.codec.digest(existingSessionId) }
      : this.codec.issue();
    if (this.sessions.has(issued.digest)) {
      lease.release();
      throw new CameraWebRtcSessionError("invalid_session");
    }

    let upstream: SharedUpstream | null = null;
    try {
      upstream = await this.acquireUpstream();
      // TURN REST usernames are per viewer. Never reuse the printer peer's ICE
      // credential set for downstream viewers.
      const iceServers = this.viewerIceServerProvider.issue();
      const viewer = await this.peers.openViewer(upstream.track, iceServers);
      if (
        !viewer.offerSdp ||
        Buffer.byteLength(viewer.offerSdp) > this.maxSdpBytes
      ) {
        viewer.close();
        throw new CameraWebRtcSessionError("invalid_offer");
      }
      const remaining = Math.max(0, Date.parse(lease.expiresAt) - this.now());
      if (remaining <= 0) {
        viewer.close();
        throw new CameraWebRtcSessionError("expired_session");
      }
      const expiryTimeout = setTimeout(
        () => this.closeDigest(issued.digest),
        remaining
      );
      const answerTimeout = setTimeout(
        () => this.closeDigest(issued.digest),
        Math.min(remaining, this.answerTimeoutMilliseconds)
      );
      expiryTimeout.unref?.();
      answerTimeout.unref?.();
      const unsubscribeTermination = viewer.onTerminated(() => {
        this.closeDigest(issued.digest);
      });
      this.sessions.set(issued.digest, {
        lease,
        viewer,
        expiryTimeout,
        answerTimeout,
        unsubscribeTermination,
        answer: null,
        candidateKeys: new Set(),
      });
      return {
        sessionId: issued.token,
        type: "offer",
        sdp: viewer.offerSdp,
        iceServers,
        expiresAt: lease.expiresAt,
        maxDurationSeconds: Math.ceil(remaining / 1_000),
      };
    } catch (error) {
      if (upstream) this.releaseUpstream();
      lease.release();
      throw error;
    }
  }

  async answer(sessionId: string, value: unknown): Promise<{ accepted: true }> {
    const session = this.requireSession(sessionId);
    const sdp = validateSdp(value, this.maxSdpBytes);
    if (session.answer !== null) {
      if (session.answer === sdp) return { accepted: true };
      throw new CameraWebRtcSessionError("answer_already_set");
    }
    try {
      await session.viewer.answer(sdp);
      session.answer = sdp;
      clearTimeout(session.answerTimeout);
      return { accepted: true };
    } catch (error) {
      this.close(sessionId);
      throw error;
    }
  }

  async addCandidates(
    sessionId: string,
    value: unknown
  ): Promise<{ accepted: true; candidateCount: number }> {
    const session = this.requireSession(sessionId);
    const candidates = this.sanitizeCandidates(value);
    const unique = candidates.filter((candidate) => {
      const key = candidateKey(candidate);
      if (session.candidateKeys.has(key)) return false;
      session.candidateKeys.add(key);
      return true;
    });
    if (session.candidateKeys.size > this.maxCandidatesPerSession) {
      this.close(sessionId);
      throw new CameraWebRtcSessionError("invalid_candidates");
    }
    try {
      if (unique.length > 0) await session.viewer.addCandidates(unique);
      return { accepted: true, candidateCount: unique.length };
    } catch (error) {
      this.close(sessionId);
      throw error;
    }
  }

  close(sessionId: string): { closed: boolean } {
    return { closed: this.closeDigest(this.codec.digest(sessionId)) };
  }

  private async acquireUpstream(): Promise<SharedUpstream> {
    if (this.upstream) {
      this.upstream.viewers += 1;
      return this.upstream;
    }
    if (!this.upstreamOpening) {
      const abortController = new AbortController();
      this.upstreamOpening = this.peers
        .openUpstream(this.signaling, abortController.signal)
        .then((opened) => {
          const shared = {
            ...opened,
            viewers: 0,
            unsubscribeTermination: () => {},
          } satisfies SharedUpstream;
          shared.unsubscribeTermination = opened.onTerminated(() => {
            this.closeSessionsForUpstream(shared);
          });
          return shared;
        })
        .catch((error) => {
          abortController.abort();
          throw error;
        })
        .finally(() => {
          this.upstreamOpening = null;
        });
    }
    const opened = await this.upstreamOpening;
    this.upstream ??= opened;
    this.upstream.viewers += 1;
    return this.upstream;
  }

  private releaseUpstream(): void {
    if (!this.upstream) return;
    this.upstream.viewers = Math.max(0, this.upstream.viewers - 1);
    if (this.upstream.viewers > 0) return;
    const upstream = this.upstream;
    this.upstream = null;
    upstream.unsubscribeTermination();
    upstream.close();
  }

  private closeSessionsForUpstream(upstream: SharedUpstream): void {
    if (this.upstream !== upstream) return;
    for (const digest of [...this.sessions.keys()]) {
      this.closeDigest(digest);
    }
  }

  private requireSession(sessionId: string): ActiveViewer {
    const digest = this.codec.digest(sessionId);
    const session = this.sessions.get(digest);
    if (!session) throw new CameraWebRtcSessionError("invalid_session");
    if (Date.parse(session.lease.expiresAt) <= this.now()) {
      this.closeDigest(digest);
      throw new CameraWebRtcSessionError("expired_session");
    }
    return session;
  }

  private sanitizeCandidates(value: unknown): CameraIceCandidate[] {
    if (
      !Array.isArray(value) ||
      value.length === 0 ||
      value.length > this.maxCandidatesPerCall
    ) {
      throw new CameraWebRtcSessionError("invalid_candidates");
    }
    return value.map((candidate) => {
      if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
        throw new CameraWebRtcSessionError("invalid_candidates");
      }
      const object = candidate as Record<string, unknown>;
      if (
        typeof object.candidate !== "string" ||
        !object.candidate ||
        Buffer.byteLength(object.candidate) > this.maxCandidateBytes ||
        (object.sdpMid !== undefined &&
          object.sdpMid !== null &&
          (typeof object.sdpMid !== "string" ||
            Buffer.byteLength(object.sdpMid) > DEFAULT_MAX_ICE_FIELD_BYTES)) ||
        (object.sdpMLineIndex !== undefined &&
          object.sdpMLineIndex !== null &&
          (typeof object.sdpMLineIndex !== "number" ||
            !Number.isInteger(object.sdpMLineIndex) ||
            object.sdpMLineIndex < 0)) ||
        (object.usernameFragment !== undefined &&
          object.usernameFragment !== null &&
          (typeof object.usernameFragment !== "string" ||
            Buffer.byteLength(object.usernameFragment) >
              DEFAULT_MAX_ICE_FIELD_BYTES))
      ) {
        throw new CameraWebRtcSessionError("invalid_candidates");
      }
      return {
        candidate: object.candidate,
        sdpMid: typeof object.sdpMid === "string" ? object.sdpMid : null,
        sdpMLineIndex:
          typeof object.sdpMLineIndex === "number" ? object.sdpMLineIndex : null,
        usernameFragment:
          typeof object.usernameFragment === "string"
            ? object.usernameFragment
            : null,
      };
    });
  }

  private closeDigest(digest: string): boolean {
    const session = this.sessions.get(digest);
    if (!session) return false;
    this.sessions.delete(digest);
    clearTimeout(session.expiryTimeout);
    clearTimeout(session.answerTimeout);
    session.unsubscribeTermination();
    session.viewer.close();
    session.lease.release();
    this.releaseUpstream();
    return true;
  }
}

function waitForTrack(
  peer: RTCPeerConnection,
  timeoutMilliseconds = DEFAULT_TRACK_TIMEOUT_MILLISECONDS
): Promise<MediaStreamTrack> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error("Printer WebRTC track unavailable")),
      timeoutMilliseconds
    );
    peer.onTrack.once((track) => {
      clearTimeout(timeout);
      resolve(track);
    });
  });
}

function createPeer(
  iceServers: CameraIceServer[],
  codecs: RTCRtpCodecParameters[],
  iceAdditionalHostAddresses: string[] = []
): RTCPeerConnection {
  return new RTCPeerConnection({
    iceServers,
    iceAdditionalHostAddresses,
    codecs: { audio: [], video: codecs },
  });
}

function cloneCodec(codec: RTCRtpCodecParameters): RTCRtpCodecParameters {
  return useH264({
    payloadType: codec.payloadType,
    clockRate: codec.clockRate,
    channels: codec.channels,
    parameters: codec.parameters,
    direction: codec.direction,
    rtcpFeedback: codec.rtcpFeedback.map((feedback) => ({ ...feedback })),
  });
}

class WeriftCameraFanoutSource {
  constructor(
    readonly track: MediaStreamTrack,
    readonly codec: RTCRtpCodecParameters
  ) {}
}

function requireNegotiatedH264(
  peer: RTCPeerConnection,
  track: MediaStreamTrack
): RTCRtpCodecParameters {
  // Receiver tracks do not receive `track.codec` during SDP negotiation in
  // werift. Read the negotiated remote codec from the owning transceiver so
  // the downstream offer preserves the printer's exact H264 profile/fmtp.
  const codec = peer
    .getTransceivers()
    .find((transceiver) => transceiver.receiver.track === track)
    ?.codecs.find(
      (candidate) => candidate.mimeType.toLowerCase() === "video/h264"
    );
  if (!codec || codec.mimeType.toLowerCase() !== "video/h264") {
    throw new Error("Printer WebRTC did not negotiate H264");
  }
  return cloneCodec(codec);
}

function terminationSubscription(peer: RTCPeerConnection, callback: () => void) {
  const subscription = peer.connectionStateChange.subscribe((state) => {
    if (state === "failed" || state === "closed") callback();
  });
  return subscription.unSubscribe;
}

export function createWeriftCameraFanoutPeerFactory(
  options: { downstreamAdditionalHostAddresses?: string[] } = {}
): CameraFanoutPeerFactory {
  const downstreamAdditionalHostAddresses =
    options.downstreamAdditionalHostAddresses ?? [];
  return {
    async openUpstream(signaling, signal) {
      const offer = await signaling.requestOffer(signal);
      // The upstream is receive-only and H264-only. Fan-out forwards encoded RTP;
      // it does not transcode between codecs or H264 profiles.
      const peer = createPeer(offer.iceServers, [useH264()]);
      const trackPromise = waitForTrack(peer);
      peer.addTransceiver("video", { direction: "recvonly" });
      peer.ondatachannel = ({ channel }) => {
        if (channel.label !== "keepalive") return;
        channel.onmessage = () => channel.send("pong");
      };
      try {
        await peer.setRemoteDescription({ type: "offer", sdp: offer.sdp });
        await peer.setLocalDescription(await peer.createAnswer());
        const answerSdp = peer.localDescription?.sdp;
        if (!answerSdp) throw new Error("Printer WebRTC answer unavailable");
        // setLocalDescription waits for ICE gathering in werift, so the answer
        // contains the server's gathered host/STUN/TURN candidates.
        await signaling.sendAnswer(offer.id, answerSdp, signal);
        const track = await trackPromise;
        const codec = requireNegotiatedH264(peer, track);
        return {
          track: new WeriftCameraFanoutSource(track, codec),
          close: () => {
            track.stop();
            void peer.close();
          },
          onTerminated: (callback) => terminationSubscription(peer, callback),
        };
      } catch (error) {
        void peer.close();
        throw error;
      }
    },

    async openViewer(value, iceServers) {
      if (!(value instanceof WeriftCameraFanoutSource)) {
        throw new CameraWebRtcSessionError("invalid_offer");
      }
      const upstreamTrack = value.track;
      const codec = cloneCodec(value.codec);
      const peer = createPeer(
        iceServers,
        [codec],
        downstreamAdditionalHostAddresses
      );
      // Never attach one upstream track to multiple senders: werift senders
      // rewrite RTP headers. Each viewer receives a dedicated forwarding track
      // and a cloned RTP packet/header stream.
      const forwardingTrack = new MediaStreamTrack({ kind: "video", codec });
      const forwarding = upstreamTrack.onReceiveRtp.subscribe((packet) => {
        forwardingTrack.writeRtp(packet.clone());
      });
      const transceiver = peer.addTransceiver("video", {
        direction: "sendonly",
      });
      try {
        await transceiver.sender.replaceTrack(forwardingTrack);
        await peer.setLocalDescription(await peer.createOffer());
        const offerSdp = peer.localDescription?.sdp;
        if (!offerSdp) throw new CameraWebRtcSessionError("invalid_offer");
        let closed = false;
        const close = () => {
          if (closed) return;
          closed = true;
          forwarding.unSubscribe();
          forwardingTrack.stop();
          void peer.close();
        };
        return {
          offerSdp,
          answer: async (sdp) => {
            await peer.setRemoteDescription({ type: "answer", sdp });
          },
          addCandidates: async (candidates) => {
            for (const candidate of candidates) {
              await peer.addIceCandidate(candidate as RTCIceCandidateInit);
            }
          },
          close,
          onTerminated: (callback) => terminationSubscription(peer, callback),
        };
      } catch (error) {
        forwarding.unSubscribe();
        forwardingTrack.stop();
        void peer.close();
        throw error;
      }
    },
  };
}

export const weriftCameraFanoutPeerFactory =
  createWeriftCameraFanoutPeerFactory();

export function createCameraFanoutController(
  relay: CameraRelayService,
  sessions: CameraFanoutSessionService
): CameraWebRtcSessionController {
  const safeFailure = (
    error: unknown,
    fallback: "invalid_offer" | "invalid_answer" | "invalid_candidates"
  ) => {
    if (
      error instanceof CameraRelayClaimError ||
      error instanceof CameraWebRtcSessionError
    ) {
      return error;
    }
    return new CameraWebRtcSessionError(fallback);
  };
  return {
    authorize: () => relay.authorize(),
    open: async (activationToken) => {
      try {
        return await sessions.open(relay.claim(activationToken));
      } catch (error) {
        throw safeFailure(error, "invalid_offer");
      }
    },
    answer: async (sessionId, sdp) => {
      try {
        return await sessions.answer(sessionId, sdp);
      } catch (error) {
        throw safeFailure(error, "invalid_answer");
      }
    },
    addCandidates: async (sessionId, candidates) => {
      try {
        return await sessions.addCandidates(sessionId, candidates);
      } catch (error) {
        throw safeFailure(error, "invalid_candidates");
      }
    },
    close: (sessionId) => sessions.close(sessionId),
  };
}
