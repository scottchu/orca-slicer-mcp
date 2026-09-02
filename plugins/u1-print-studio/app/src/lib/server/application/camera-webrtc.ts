import type {
  CameraRelayService,
  CameraTicketCodec,
  CameraStreamLease,
  CameraStreamActivation,
} from "./camera-relay.js";

export type CameraIceServer = {
  urls: string | string[];
  username?: string;
  credential?: string;
};

export type CameraWebRtcOffer = {
  type: "offer";
  id: string;
  sdp: string;
  iceServers: CameraIceServer[];
};

export type CameraIceCandidate = {
  candidate: string;
  sdpMid?: string | null;
  sdpMLineIndex?: number | null;
  usernameFragment?: string | null;
};

export type CameraWebRtcSignalingSource = {
  requestOffer(signal?: AbortSignal): Promise<CameraWebRtcOffer>;
  sendAnswer(id: string, sdp: string, signal?: AbortSignal): Promise<void>;
  sendCandidates(
    id: string,
    candidates: CameraIceCandidate[],
    signal?: AbortSignal
  ): Promise<void>;
};

const DEFAULT_MAX_SDP_BYTES = 96 * 1024;
const DEFAULT_MAX_CANDIDATES_PER_CALL = 16;
const DEFAULT_MAX_CANDIDATES_PER_SESSION = 64;
const DEFAULT_MAX_CANDIDATE_BYTES = 8 * 1024;
const DEFAULT_MAX_ICE_SERVERS = 4;
const DEFAULT_MAX_ICE_URLS_PER_SERVER = 4;
const DEFAULT_MAX_ICE_FIELD_BYTES = 1_024;

export type OpenedCameraWebRtcSession = {
  sessionId: string;
  type: "offer";
  sdp: string;
  iceServers: CameraIceServer[];
  expiresAt: string;
  maxDurationSeconds: number;
};

export type CameraWebRtcSessionOptions = {
  maxSdpBytes?: number;
  maxCandidatesPerCall?: number;
  maxCandidatesPerSession?: number;
  maxCandidateBytes?: number;
  answerTimeoutMilliseconds?: number;
  now?: () => number;
};

export type CameraWebRtcSessionController = {
  authorize(): CameraStreamActivation;
  open(activationToken: string): Promise<OpenedCameraWebRtcSession>;
  answer(sessionId: string, sdp: string): Promise<{ accepted: true }>;
  addCandidates(
    sessionId: string,
    candidates: CameraIceCandidate[]
  ): Promise<{ accepted: true; candidateCount: number }>;
  close(sessionId: string): { closed: boolean };
};

/**
 * Transport-neutral session store used by both the MCP Apps signaling helpers
 * and the optional exact HTTP signaling adapter. The HTTP adapter supplies its
 * already-issued one-time ticket as the public session id; the MCP Apps path
 * lets the store issue a distinct opaque session id.
 */
export type CameraWebRtcSessionStore = {
  open(
    lease: CameraStreamLease,
    existingSessionId?: string
  ): Promise<OpenedCameraWebRtcSession>;
  answer(sessionId: string, sdp: unknown): Promise<{ accepted: true }>;
  addCandidates(
    sessionId: string,
    candidates: unknown
  ): Promise<{ accepted: true; candidateCount: number }>;
  close(sessionId: string): { closed: boolean };
};

/** Only server-owned downstream offers may cross the public HTTP boundary. */
export type CameraViewerSessionStore = CameraWebRtcSessionStore & {
  readonly privacyBoundary: "server-terminated-fanout";
};

export type CameraWebRtcSessionFailure =
  | "invalid_session"
  | "expired_session"
  | "invalid_offer"
  | "invalid_answer"
  | "answer_already_set"
  | "invalid_candidates";

export class CameraWebRtcSessionError extends Error {
  constructor(readonly reason: CameraWebRtcSessionFailure) {
    super(reason);
  }
}

type ActiveSession = {
  remoteId: string;
  lease: CameraStreamLease;
  abortController: AbortController;
  timeout: ReturnType<typeof setTimeout>;
  answerTimeout: ReturnType<typeof setTimeout>;
  answer: string | null;
  candidateKeys: Set<string>;
};

function candidateKey(candidate: CameraIceCandidate): string {
  return JSON.stringify([
    candidate.candidate,
    candidate.sdpMid ?? null,
    candidate.sdpMLineIndex ?? null,
    candidate.usernameFragment ?? null,
  ]);
}

export class CameraWebRtcSessionService {
  private readonly sessions = new Map<string, ActiveSession>();
  private readonly maxSdpBytes: number;
  private readonly maxCandidatesPerCall: number;
  private readonly maxCandidatesPerSession: number;
  private readonly maxCandidateBytes: number;
  private readonly answerTimeoutMilliseconds: number;
  private readonly now: () => number;

  constructor(
    private readonly codec: CameraTicketCodec,
    private readonly signaling: CameraWebRtcSignalingSource,
    options: CameraWebRtcSessionOptions = {}
  ) {
    this.maxSdpBytes = options.maxSdpBytes ?? DEFAULT_MAX_SDP_BYTES;
    this.maxCandidatesPerCall =
      options.maxCandidatesPerCall ?? DEFAULT_MAX_CANDIDATES_PER_CALL;
    this.maxCandidatesPerSession =
      options.maxCandidatesPerSession ?? DEFAULT_MAX_CANDIDATES_PER_SESSION;
    this.maxCandidateBytes =
      options.maxCandidateBytes ?? DEFAULT_MAX_CANDIDATE_BYTES;
    this.answerTimeoutMilliseconds = options.answerTimeoutMilliseconds ?? 15_000;
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

    const abortController = new AbortController();
    try {
      const offer = await this.signaling.requestOffer(abortController.signal);
      if (
        offer.type !== "offer" ||
        !offer.id ||
        Buffer.byteLength(offer.id) > DEFAULT_MAX_ICE_FIELD_BYTES ||
        !offer.sdp ||
        Buffer.byteLength(offer.sdp) > this.maxSdpBytes
      ) {
        throw new CameraWebRtcSessionError("invalid_offer");
      }
      const iceServers = this.sanitizeIceServers(offer.iceServers);
      const remaining = Math.max(0, Date.parse(lease.expiresAt) - this.now());
      if (remaining <= 0) {
        throw new CameraWebRtcSessionError("expired_session");
      }
      const timeout = setTimeout(() => this.closeDigest(issued.digest), remaining);
      const answerTimeout = setTimeout(
        () => this.closeDigest(issued.digest),
        Math.min(remaining, this.answerTimeoutMilliseconds)
      );
      (timeout as ReturnType<typeof setTimeout> & { unref?: () => void }).unref?.();
      (answerTimeout as ReturnType<typeof setTimeout> & { unref?: () => void }).unref?.();
      this.sessions.set(issued.digest, {
        remoteId: offer.id,
        lease,
        abortController,
        timeout,
        answerTimeout,
        answer: null,
        candidateKeys: new Set(),
      });
      return {
        sessionId: issued.token,
        type: offer.type,
        sdp: offer.sdp,
        iceServers,
        expiresAt: lease.expiresAt,
        maxDurationSeconds: Math.ceil(remaining / 1_000),
      };
    } catch (error) {
      abortController.abort();
      lease.release();
      throw error;
    }
  }

  async answer(sessionId: string, value: unknown): Promise<{ accepted: true }> {
    const session = this.requireSession(sessionId);
    const sdp = typeof value === "string" ? value : "";
    if (!sdp || Buffer.byteLength(sdp) > this.maxSdpBytes) {
      throw new CameraWebRtcSessionError("invalid_answer");
    }
    if (session.answer !== null) {
      if (session.answer === sdp) return { accepted: true };
      throw new CameraWebRtcSessionError("answer_already_set");
    }
    try {
      await this.signaling.sendAnswer(
        session.remoteId,
        sdp,
        session.abortController.signal
      );
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
    if (unique.length === 0) {
      return { accepted: true, candidateCount: 0 };
    }
    try {
      await this.signaling.sendCandidates(
        session.remoteId,
        unique,
        session.abortController.signal
      );
      return { accepted: true, candidateCount: unique.length };
    } catch (error) {
      this.close(sessionId);
      throw error;
    }
  }

  close(sessionId: string): { closed: boolean } {
    return { closed: this.closeDigest(this.codec.digest(sessionId)) };
  }

  private requireSession(sessionId: string): ActiveSession {
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

  private sanitizeIceServers(value: unknown): CameraIceServer[] {
    if (!Array.isArray(value) || value.length > DEFAULT_MAX_ICE_SERVERS) {
      throw new CameraWebRtcSessionError("invalid_offer");
    }
    return value.map((candidate) => {
      if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
        throw new CameraWebRtcSessionError("invalid_offer");
      }
      const object = candidate as Record<string, unknown>;
      const urls = typeof object.urls === "string"
        ? [object.urls]
        : Array.isArray(object.urls) &&
            object.urls.every((url) => typeof url === "string")
          ? object.urls
          : [];
      if (
        urls.length === 0 ||
        urls.length > DEFAULT_MAX_ICE_URLS_PER_SERVER ||
        urls.some(
          (url) =>
            Buffer.byteLength(url) > DEFAULT_MAX_ICE_FIELD_BYTES ||
            !/^(stun|stuns|turn|turns):/i.test(url)
        ) ||
        (object.username !== undefined &&
          (typeof object.username !== "string" ||
            Buffer.byteLength(object.username) > DEFAULT_MAX_ICE_FIELD_BYTES)) ||
        (object.credential !== undefined &&
          (typeof object.credential !== "string" ||
            Buffer.byteLength(object.credential) > DEFAULT_MAX_ICE_FIELD_BYTES))
      ) {
        throw new CameraWebRtcSessionError("invalid_offer");
      }
      const server: CameraIceServer = {
        urls: typeof object.urls === "string" ? urls[0] : urls,
      };
      if (typeof object.username === "string") server.username = object.username;
      if (typeof object.credential === "string") {
        server.credential = object.credential;
      }
      return server;
    });
  }

  private closeDigest(digest: string): boolean {
    const session = this.sessions.get(digest);
    if (!session) return false;
    this.sessions.delete(digest);
    clearTimeout(session.timeout);
    clearTimeout(session.answerTimeout);
    session.abortController.abort();
    session.lease.release();
    return true;
  }
}

export function createCameraWebRtcSessionController(
  relay: CameraRelayService,
  sessions: CameraWebRtcSessionService
): CameraWebRtcSessionController {
  return {
    authorize: () => relay.authorize(),
    open: async (activationToken) =>
      await sessions.open(relay.claim(activationToken)),
    answer: async (sessionId, sdp) => await sessions.answer(sessionId, sdp),
    addCandidates: async (sessionId, candidates) =>
      await sessions.addCandidates(sessionId, candidates),
    close: (sessionId) => sessions.close(sessionId),
  };
}
