import {
  MediaStreamTrack,
  RTCPeerConnection,
  type RTCIceCandidateInit,
  type RTCRtpCodecParameters,
  type RTCRtpReceiver,
  type RtpPacket,
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
const DEFAULT_PLI_INTERVAL_MILLISECONDS = 500;

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
  generation: number;
  alive: boolean;
  closed: boolean;
  viewers: number;
  unsubscribeTermination: () => void;
};

type ActiveViewer = {
  upstream: SharedUpstream;
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
  private nextUpstreamGeneration = 0;
  private activeUpstreamGeneration = 0;
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
    let viewer: CameraFanoutViewer | null = null;
    let viewerAlive = true;
    let sessionStored = false;
    let unsubscribeTermination = () => {};
    let expiryTimeout: ReturnType<typeof setTimeout> | null = null;
    let answerTimeout: ReturnType<typeof setTimeout> | null = null;
    try {
      upstream = await this.acquireUpstream();
      // TURN REST usernames are per viewer. Never reuse the printer peer's ICE
      // credential set for downstream viewers.
      const iceServers = this.viewerIceServerProvider.issue();
      viewer = await this.peers.openViewer(upstream.track, iceServers);
      if (!this.isCurrentUpstream(upstream)) {
        throw new CameraWebRtcSessionError("invalid_offer");
      }
      if (
        !viewer.offerSdp ||
        Buffer.byteLength(viewer.offerSdp) > this.maxSdpBytes
      ) {
        throw new CameraWebRtcSessionError("invalid_offer");
      }
      const remaining = Math.max(0, Date.parse(lease.expiresAt) - this.now());
      if (remaining <= 0) {
        throw new CameraWebRtcSessionError("expired_session");
      }
      expiryTimeout = setTimeout(
        () => this.closeDigest(issued.digest),
        remaining
      );
      answerTimeout = setTimeout(
        () => this.closeDigest(issued.digest),
        Math.min(remaining, this.answerTimeoutMilliseconds)
      );
      expiryTimeout.unref?.();
      answerTimeout.unref?.();
      unsubscribeTermination = viewer.onTerminated(() => {
        viewerAlive = false;
        this.closeDigest(issued.digest);
      });
      // A peer can fail synchronously while its termination observer is being
      // installed. Never publish a dead viewer, nor a viewer whose reserved
      // upstream generation was replaced while openViewer was awaiting.
      if (!viewerAlive || !this.isCurrentUpstream(upstream)) {
        throw new CameraWebRtcSessionError("invalid_offer");
      }
      this.sessions.set(issued.digest, {
        upstream,
        lease,
        viewer,
        expiryTimeout,
        answerTimeout,
        unsubscribeTermination,
        answer: null,
        candidateKeys: new Set(),
      });
      sessionStored = true;
      if (!viewerAlive || !this.isCurrentUpstream(upstream)) {
        this.closeDigest(issued.digest);
        throw new CameraWebRtcSessionError("invalid_offer");
      }
      return {
        sessionId: issued.token,
        type: "offer",
        sdp: viewer.offerSdp,
        iceServers,
        expiresAt: lease.expiresAt,
        maxDurationSeconds: Math.ceil(remaining / 1_000),
      };
    } catch (error) {
      if (sessionStored) {
        this.closeDigest(issued.digest);
      } else {
        if (expiryTimeout) clearTimeout(expiryTimeout);
        if (answerTimeout) clearTimeout(answerTimeout);
        unsubscribeTermination();
        viewer?.close();
        if (upstream) this.releaseUpstream(upstream);
        lease.release();
      }
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
    if (this.upstream && this.isCurrentUpstream(this.upstream)) {
      this.upstream.viewers += 1;
      return this.upstream;
    }
    if (!this.upstreamOpening) {
      const abortController = new AbortController();
      const generation = ++this.nextUpstreamGeneration;
      const opening = this.peers
        .openUpstream(this.signaling, abortController.signal)
        .then((opened) => {
          const shared = {
            ...opened,
            generation,
            alive: true,
            closed: false,
            viewers: 0,
            unsubscribeTermination: () => {},
          } satisfies SharedUpstream;
          const unsubscribeTermination = opened.onTerminated(() => {
            this.terminateUpstream(shared);
          });
          shared.unsubscribeTermination = unsubscribeTermination;
          if (!shared.alive) unsubscribeTermination();
          return shared;
        })
        .catch((error) => {
          abortController.abort();
          throw error;
        })
        .finally(() => {
          if (this.upstreamOpening === opening) this.upstreamOpening = null;
        });
      this.upstreamOpening = opening;
    }
    const opened = await this.upstreamOpening;
    if (!opened.alive) {
      this.closeSharedUpstream(opened);
      throw new CameraWebRtcSessionError("invalid_offer");
    }
    if (!this.upstream) {
      this.upstream = opened;
      this.activeUpstreamGeneration = opened.generation;
    }
    if (!this.isCurrentUpstream(opened)) {
      this.closeSharedUpstream(opened);
      throw new CameraWebRtcSessionError("invalid_offer");
    }
    opened.viewers += 1;
    return opened;
  }

  private releaseUpstream(upstream: SharedUpstream): void {
    upstream.viewers = Math.max(0, upstream.viewers - 1);
    if (upstream.viewers > 0) return;
    this.closeSharedUpstream(upstream);
  }

  private closeSharedUpstream(upstream: SharedUpstream): void {
    if (upstream.closed) return;
    upstream.closed = true;
    upstream.alive = false;
    if (this.upstream === upstream) {
      this.upstream = null;
      this.activeUpstreamGeneration = 0;
    }
    upstream.unsubscribeTermination();
    upstream.close();
  }

  private terminateUpstream(upstream: SharedUpstream): void {
    if (!upstream.alive) return;
    upstream.alive = false;
    if (this.upstream === upstream) {
      this.upstream = null;
      this.activeUpstreamGeneration = 0;
    }
    for (const [digest, session] of [...this.sessions.entries()]) {
      if (session.upstream === upstream) this.closeDigest(digest);
    }
    this.closeSharedUpstream(upstream);
  }

  private isCurrentUpstream(upstream: SharedUpstream): boolean {
    return (
      upstream.alive &&
      this.upstream === upstream &&
      this.activeUpstreamGeneration === upstream.generation
    );
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
    this.releaseUpstream(session.upstream);
    return true;
  }
}

export type CancellableTrackWait = {
  promise: Promise<MediaStreamTrack>;
  cancel(): void;
};

/**
 * A track wait owns both its event subscription and timer. Callers must cancel
 * it whenever SDP/signaling exits before the track arrives.
 */
export function waitForTrack(
  peer: RTCPeerConnection,
  timeoutMilliseconds = DEFAULT_TRACK_TIMEOUT_MILLISECONDS
): CancellableTrackWait {
  let settled = false;
  let unsubscribe = () => {};
  let timeout: ReturnType<typeof setTimeout> | null = null;
  const cleanup = () => {
    if (timeout) clearTimeout(timeout);
    timeout = null;
    unsubscribe();
    unsubscribe = () => {};
  };
  const promise = new Promise<MediaStreamTrack>((resolve, reject) => {
    const subscription = peer.onTrack.subscribe((track) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(track);
    });
    unsubscribe = subscription.unSubscribe;
    timeout = setTimeout(() => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error("Printer WebRTC track unavailable"));
    }, timeoutMilliseconds);
    timeout.unref?.();
  });
  return {
    promise,
    cancel: () => {
      if (settled) return;
      settled = true;
      cleanup();
    },
  };
}

type CancellableRtpWait = {
  promise: Promise<RtpPacket>;
  cancel(): void;
};

function waitForFirstRtp(
  track: MediaStreamTrack,
  timeoutMilliseconds = DEFAULT_TRACK_TIMEOUT_MILLISECONDS
): CancellableRtpWait {
  let settled = false;
  let unsubscribe = () => {};
  let timeout: ReturnType<typeof setTimeout> | null = null;
  const cleanup = () => {
    if (timeout) clearTimeout(timeout);
    timeout = null;
    unsubscribe();
    unsubscribe = () => {};
  };
  const promise = new Promise<RtpPacket>((resolve, reject) => {
    const subscription = track.onReceiveRtp.subscribe((packet) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(packet);
    });
    unsubscribe = subscription.unSubscribe;
    timeout = setTimeout(() => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error("Printer WebRTC RTP unavailable"));
    }, timeoutMilliseconds);
    timeout.unref?.();
  });
  return {
    promise,
    cancel: () => {
      if (settled) return;
      settled = true;
      cleanup();
    },
  };
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
  private readonly pli: CoalescedPliBridge;
  private readonly trackSourceSubscription: { unSubscribe(): void };
  private mediaSsrc: number;

  constructor(
    readonly track: MediaStreamTrack,
    readonly codec: RTCRtpCodecParameters,
    receiver: Pick<RTCRtpReceiver, "sendRtcpPLI">,
    mediaSsrc: number,
    pliIntervalMilliseconds = DEFAULT_PLI_INTERVAL_MILLISECONDS
  ) {
    this.mediaSsrc = mediaSsrc;
    this.trackSourceSubscription = track.onReceiveRtp.subscribe((packet) => {
      this.mediaSsrc = packet.header.ssrc;
    });
    this.pli = new CoalescedPliBridge(
      () => receiver.sendRtcpPLI(this.mediaSsrc),
      pliIntervalMilliseconds
    );
  }

  requestKeyFrame(): void {
    this.pli.request();
  }

  close(): void {
    this.pli.close();
    this.trackSourceSubscription.unSubscribe();
  }
}

export function selectH264CodecByPayloadType(
  codecs: RTCRtpCodecParameters[],
  payloadType: number
): RTCRtpCodecParameters {
  const matching = codecs.filter(
    (candidate) => candidate.payloadType === payloadType
  );
  if (
    matching.length !== 1 ||
    matching[0]?.mimeType.toLowerCase() !== "video/h264"
  ) {
    throw new Error("Printer RTP payload type is ambiguous or unsupported");
  }
  return cloneCodec(matching[0]);
}

function requireUpstreamBinding(
  peer: RTCPeerConnection,
  track: MediaStreamTrack,
  firstPacket: RtpPacket
): {
  codec: RTCRtpCodecParameters;
  receiver: RTCRtpReceiver;
  mediaSsrc: number;
} {
  const owning = peer
    .getTransceivers()
    .filter((transceiver) => transceiver.receiver.track === track);
  if (owning.length !== 1 || !owning[0]) {
    throw new Error("Printer WebRTC track binding is ambiguous");
  }
  return {
    codec: selectH264CodecByPayloadType(
      owning[0].codecs,
      firstPacket.header.payloadType
    ),
    receiver: owning[0].receiver,
    mediaSsrc: firstPacket.header.ssrc,
  };
}

/** Shared, bounded RTCP feedback path for every viewer of one upstream. */
class CoalescedPliBridge {
  private lastSentAt: number | null = null;
  private pending: ReturnType<typeof setTimeout> | null = null;
  private closed = false;

  constructor(
    private readonly send: () => Promise<void> | void,
    private readonly intervalMilliseconds = DEFAULT_PLI_INTERVAL_MILLISECONDS,
    private readonly now: () => number = Date.now
  ) {}

  request(): void {
    if (this.closed || this.pending) return;
    const elapsed =
      this.lastSentAt === null
        ? this.intervalMilliseconds
        : this.now() - this.lastSentAt;
    if (elapsed >= this.intervalMilliseconds) {
      this.flush();
      return;
    }
    this.pending = setTimeout(
      () => {
        this.pending = null;
        this.flush();
      },
      Math.max(0, this.intervalMilliseconds - elapsed)
    );
    this.pending.unref?.();
  }

  close(): void {
    this.closed = true;
    if (this.pending) clearTimeout(this.pending);
    this.pending = null;
  }

  private flush(): void {
    if (this.closed) return;
    this.lastSentAt = this.now();
    try {
      void Promise.resolve(this.send()).catch(() => {});
    } catch {
      // Feedback failure must not tear down any viewer or the upstream media.
    }
  }
}

function terminationSubscription(peer: RTCPeerConnection, callback: () => void) {
  let active = true;
  let notified = false;
  const notify = () => {
    if (!active || notified) return;
    notified = true;
    callback();
  };
  const subscription = peer.connectionStateChange.subscribe((state) => {
    if (state === "failed" || state === "closed") notify();
  });
  // Connection state is level-triggered here: werift may have entered a
  // terminal state before the observer was installed and emit no later event.
  if (peer.connectionState === "failed" || peer.connectionState === "closed") {
    notify();
  }
  return () => {
    if (!active) return;
    active = false;
    subscription.unSubscribe();
  };
}

export function createWeriftCameraFanoutPeerFactory(
  options: {
    downstreamAdditionalHostAddresses?: string[];
    createPeer?: typeof createPeer;
    pliIntervalMilliseconds?: number;
  } = {}
): CameraFanoutPeerFactory {
  const downstreamAdditionalHostAddresses =
    options.downstreamAdditionalHostAddresses ?? [];
  const peerFactory = options.createPeer ?? createPeer;
  return {
    async openUpstream(signaling, signal) {
      const offer = await signaling.requestOffer(signal);
      // The upstream is receive-only and H264-only. Fan-out forwards encoded RTP;
      // it does not transcode between codecs or H264 profiles.
      const peer = peerFactory(offer.iceServers, [useH264()]);
      const trackWait = waitForTrack(peer);
      let rtpWait: CancellableRtpWait | null = null;
      try {
        peer.addTransceiver("video", { direction: "recvonly" });
        peer.ondatachannel = ({ channel }) => {
          if (channel.label !== "keepalive") return;
          channel.onmessage = () => channel.send("pong");
        };
        await peer.setRemoteDescription({ type: "offer", sdp: offer.sdp });
        const track = await trackWait.promise;
        rtpWait = waitForFirstRtp(track);
        await peer.setLocalDescription(await peer.createAnswer());
        const answerSdp = peer.localDescription?.sdp;
        if (!answerSdp) throw new Error("Printer WebRTC answer unavailable");
        // setLocalDescription waits for ICE gathering in werift, so the answer
        // contains the server's gathered host/STUN/TURN candidates.
        await signaling.sendAnswer(offer.id, answerSdp, signal);
        const firstPacket = await rtpWait.promise;
        const binding = requireUpstreamBinding(peer, track, firstPacket);
        const source = new WeriftCameraFanoutSource(
          track,
          binding.codec,
          binding.receiver,
          binding.mediaSsrc,
          options.pliIntervalMilliseconds
        );
        return {
          track: source,
          close: () => {
            source.close();
            track.stop();
            void peer.close();
          },
          onTerminated: (callback) => terminationSubscription(peer, callback),
        };
      } catch (error) {
        trackWait.cancel();
        rtpWait?.cancel();
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
      const peer = peerFactory(
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
      const feedback = transceiver.sender.onPictureLossIndication.subscribe(
        () => value.requestKeyFrame()
      );
      try {
        await transceiver.sender.replaceTrack(forwardingTrack);
        await peer.setLocalDescription(await peer.createOffer());
        const offerSdp = peer.localDescription?.sdp;
        if (!offerSdp) throw new CameraWebRtcSessionError("invalid_offer");
        let closed = false;
        const close = () => {
          if (closed) return;
          closed = true;
          feedback.unSubscribe();
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
        feedback.unSubscribe();
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
