/** Parsed, component-private ports. No host envelopes, network URLs or DOM. */
export type CameraSnapshot = Readonly<{ image: string; observedAt: string | null }>;
export type CameraFrameResult = Readonly<{ snapshot: CameraSnapshot | null; activationToken?: string }>;
export type CameraIceServer = Readonly<{ urls: string | string[]; username?: string; credential?: string }>;
export type CameraOffer = Readonly<{ sessionId: string; sdp: string; iceServers: readonly CameraIceServer[] }>;
export type CameraCandidate = Readonly<{ candidate: string; sdpMid: string | null; sdpMLineIndex: number | null; usernameFragment?: string | null }>;
export type CameraTransport = {
  frame: (options: { authorizeLive: boolean }) => Promise<CameraFrameResult>;
  open: (activationToken: string) => Promise<CameraOffer>;
  answer: (sessionId: string, sdp: string) => Promise<void>;
  candidates: (sessionId: string, values: readonly CameraCandidate[]) => Promise<void>;
  close: (sessionId: string) => Promise<void>;
};
export type CameraScheduler = {
  now: () => number;
  timestamp: () => string;
  after: (milliseconds: number, callback: () => void) => () => void;
};
export type CameraFrameEvidence = { kind: 'presented' | 'decoded'; count: number; at: number };
export type CameraPeerEvents = {
  frame: (evidence: CameraFrameEvidence) => void;
  connection: (state: 'connected' | 'disconnected' | 'failed' | 'closed') => void;
  candidate: (candidate: CameraCandidate) => void;
  ended: () => void;
};
export type CameraPeer = {
  /** Applies the offer and creates a local answer; does not call the server. */
  answer: () => Promise<string>;
  /** Closes this viewer's peer and stops only its own tracks/observers. */
  dispose: () => void;
};
export type CameraSessionState = Readonly<{
  phase: 'loading' | 'snapshot' | 'connecting' | 'live' | 'fallback' | 'error';
  snapshot: CameraSnapshot | null;
  liveAt: string | null;
  fps: number | null;
  refreshing: boolean;
  feedback: 'snapshot-refreshed' | 'snapshot-unavailable' | 'live-unavailable' | null;
}>;
export type CameraSessionPorts = {
  transport: CameraTransport;
  scheduler: CameraScheduler;
  decode: (snapshot: CameraSnapshot) => Promise<boolean>;
  peer: (offer: CameraOffer, events: CameraPeerEvents) => CameraPeer;
  changed: (state: CameraSessionState) => void;
  persistLiveIntent: (requested: boolean) => void;
};

/** Mounted-session ownership; synthetic producers must not be wired here. */
export const createCameraSession = (ports: CameraSessionPorts) => {
  const { transport, scheduler } = ports;
  let state: CameraSessionState = { phase: 'loading', snapshot: null, liveAt: null, fps: null, refreshing: false, feedback: null };
  let disposed = false;
  let hidden = false;
  let liveIntent = false;
  let savedRestoreAttempted = false;
  let resumeAfterShow = false;
  let epoch = 0;
  let snapshotGeneration = 0;
  let peer: CameraPeer | null = null;
  let sessionId: string | null = null;
  let refreshFlight: Promise<void> | null = null;
  let liveFlight: Promise<void> | null = null;
  let fallbackTimer: (() => void) | null = null;
  let firstFrameTimer: (() => void) | null = null;
  let stallTimer: (() => void) | null = null;
  let disconnectTimer: (() => void) | null = null;
  let fpsTimer: (() => void) | null = null;
  let disconnected = false;
  let lastFrame: CameraFrameEvidence | null = null;
  let samples: CameraFrameEvidence[] = [];
  const snapshotPending = new Set<() => void>();
  const livePending = new Set<() => void>();

  const publish = (patch: Partial<CameraSessionState>) => {
    if (disposed) return;
    state = Object.freeze({ ...state, ...patch });
    ports.changed(state);
  };
  const isCurrent = (token: number) => !disposed && !hidden && liveIntent && epoch === token;
  const closeSession = (id: string) => { void Promise.resolve().then(() => transport.close(id)).catch(() => {}); };
  const cancelPending = (pending: Set<() => void>) => { [...pending].forEach((cancel) => cancel()); };
  const bounded = <T>(operation: () => Promise<T>, milliseconds: number, pending: Set<() => void>, late?: (value: T) => void): Promise<T> =>
    new Promise((resolve, reject) => {
      let settled = false;
      const finish = (callback: () => void) => {
        if (settled) return false;
        settled = true;
        timer();
        pending.delete(cancel);
        callback();
        return true;
      };
      const cancel = () => { finish(() => reject(new Error('Camera operation cancelled'))); };
      const timer = scheduler.after(milliseconds, () => { finish(() => reject(new Error('Camera operation expired'))); });
      pending.add(cancel);
      void Promise.resolve().then(() => {
        if (settled) throw new Error('Camera operation cancelled before dispatch');
        return operation();
      }).then(
        (value) => { if (!finish(() => resolve(value))) late?.(value); },
        () => { finish(() => reject(new Error('Camera operation unavailable'))); },
      );
    });
  const clearFps = () => {
    fpsTimer?.(); fpsTimer = null;
    samples = [];
    if (state.fps !== null) publish({ fps: null });
  };
  const stopLive = () => {
    ++epoch;
    cancelPending(livePending);
    liveFlight = null;
    fallbackTimer?.(); fallbackTimer = null;
    firstFrameTimer?.(); firstFrameTimer = null;
    stallTimer?.(); stallTimer = null;
    disconnectTimer?.(); disconnectTimer = null;
    clearFps();
    lastFrame = null;
    disconnected = false;
    const oldPeer = peer; peer = null;
    const oldSession = sessionId; sessionId = null;
    // Invalidate callbacks before adapters may synchronously report closure.
    try { oldPeer?.dispose(); } catch { /* Server lease still must be released. */ }
    if (oldSession) closeSession(oldSession);
  };
  const cancelSnapshot = () => {
    ++snapshotGeneration;
    cancelPending(snapshotPending);
    refreshFlight = null;
  };
  const acceptSnapshot = async (result: CameraFrameResult, generation: number) => {
    if (!result.snapshot || disposed || hidden || generation !== snapshotGeneration) return false;
    let decoded = false;
    try { decoded = await bounded(() => ports.decode(result.snapshot!), 1500, snapshotPending); } catch { return false; }
    if (!decoded || disposed || hidden || generation !== snapshotGeneration) return false;
    // Commit source time only together with a successfully decoded image.
    publish({ snapshot: Object.freeze({ ...result.snapshot }) });
    return true;
  };
  const scheduleFallback = () => {
    fallbackTimer?.(); fallbackTimer = null;
    if (!disposed && !hidden && liveIntent && state.phase === 'fallback') {
      fallbackTimer = scheduler.after(1500, () => { fallbackTimer = null; void refreshSnapshot(); });
    }
  };
  const refreshSnapshot = (): Promise<void> => {
    if (disposed || hidden) return Promise.resolve();
    if (refreshFlight) return refreshFlight;
    const generation = ++snapshotGeneration;
    publish({ refreshing: true, feedback: null });
    const flight = (async () => {
      try {
        const result = await bounded(() => transport.frame({ authorizeLive: false }), 10000, snapshotPending);
        const accepted = await acceptSnapshot(result, generation);
        if (disposed || hidden || generation !== snapshotGeneration) return;
        publish({
          phase: liveIntent ? state.phase : state.snapshot ? 'snapshot' : 'error',
          feedback: accepted ? 'snapshot-refreshed' : 'snapshot-unavailable',
        });
      } catch {
        if (!disposed && !hidden && generation === snapshotGeneration) publish({
          phase: liveIntent ? state.phase : state.snapshot ? 'snapshot' : 'error', feedback: 'snapshot-unavailable',
        });
      } finally {
        if (generation === snapshotGeneration && !disposed && !hidden) {
          refreshFlight = null;
          publish({ refreshing: false });
          scheduleFallback();
        }
      }
    })();
    refreshFlight = flight;
    return flight;
  };
  const fallback = (token: number) => {
    if (!isCurrent(token)) return;
    stopLive();
    publish({ phase: 'fallback', liveAt: null, fps: null, feedback: 'live-unavailable' });
    scheduleFallback();
  };
  const recordFrame = (token: number, evidence: CameraFrameEvidence) => {
    if (!isCurrent(token) || !peer || disconnected || !Number.isSafeInteger(evidence.count) || evidence.count < 0 || !Number.isFinite(evidence.at)) return;
    if (lastFrame && (evidence.kind !== lastFrame.kind || evidence.count <= lastFrame.count || evidence.at <= lastFrame.at)) {
      clearFps();
      // Duplicate callbacks are not evidence of a newly displayed frame.
      if (evidence.kind === lastFrame.kind && evidence.count === lastFrame.count) return;
      lastFrame = evidence;
      return;
    }
    const previous = lastFrame;
    lastFrame = evidence;
    if (evidence.kind === 'decoded' && !previous) return;
    firstFrameTimer?.(); firstFrameTimer = null;
    fallbackTimer?.(); fallbackTimer = null;
    stallTimer?.();
    stallTimer = scheduler.after(5000, () => fallback(token));
    samples = [...samples, evidence].filter((sample) => sample.at >= evidence.at - 5000).slice(-600);
    const first = samples[0];
    const elapsed = evidence.at - first.at;
    const fps = elapsed >= 1000 && evidence.count > first.count ? (evidence.count - first.count) * 1000 / elapsed : null;
    fpsTimer?.();
    fpsTimer = scheduler.after(1500, clearFps);
    publish({ phase: 'live', liveAt: scheduler.timestamp(), fps, feedback: null });
  };
  const openLive = (): Promise<void> => {
    if (disposed || hidden) return Promise.resolve();
    if (liveFlight) return liveFlight;
    if (liveIntent && (state.phase === 'live' || state.phase === 'connecting')) return Promise.resolve();
    stopLive();
    cancelSnapshot();
    liveIntent = true;
    const token = epoch;
    const generation = snapshotGeneration;
    publish({ phase: 'connecting', refreshing: false, liveAt: null, fps: null, feedback: null });
    const flight = (async () => {
      try {
        const frame = await bounded(() => transport.frame({ authorizeLive: true }), 10000, livePending);
        if (!isCurrent(token)) return;
        await acceptSnapshot(frame, generation);
        if (!isCurrent(token)) return;
        if (!frame.activationToken) throw new Error('Camera activation unavailable');
        const offer = await bounded(() => transport.open(frame.activationToken!), 10000, livePending, (late) => closeSession(late.sessionId));
        if (!isCurrent(token)) { closeSession(offer.sessionId); return; }
        sessionId = offer.sessionId;
        const created = ports.peer(offer, {
          frame: (evidence) => recordFrame(token, evidence),
          candidate: (candidate) => {
            if (!isCurrent(token) || sessionId !== offer.sessionId) return;
            void bounded(() => transport.candidates(offer.sessionId, [candidate]), 10000, livePending).catch(() => fallback(token));
          },
          ended: () => fallback(token),
          connection: (connection) => {
            if (!isCurrent(token)) return;
            if (connection === 'connected') { disconnected = false; disconnectTimer?.(); disconnectTimer = null; }
            else if (connection === 'disconnected') {
              disconnected = true;
              clearFps();
              if (!disconnectTimer) disconnectTimer = scheduler.after(3000, () => fallback(token));
            } else fallback(token);
          },
        });
        if (!isCurrent(token)) { created.dispose(); return; }
        peer = created;
        const sdp = await bounded(() => created.answer(), 10000, livePending);
        if (!isCurrent(token)) return;
        await bounded(() => transport.answer(offer.sessionId, sdp), 10000, livePending);
        if (isCurrent(token) && state.phase !== 'live') firstFrameTimer = scheduler.after(8000, () => fallback(token));
      } catch { fallback(token); }
      finally { if (epoch === token) liveFlight = null; }
    })();
    liveFlight = flight;
    return flight;
  };
  const close = () => {
    if (disposed) return;
    liveIntent = false;
    resumeAfterShow = false;
    ports.persistLiveIntent(false);
    stopLive();
    cancelSnapshot();
    publish({ phase: state.snapshot ? 'snapshot' : 'loading', liveAt: null, fps: null, refreshing: false, feedback: null });
  };
  return {
    state: () => state,
    refreshSnapshot,
    goLive: () => { if (!disposed && !hidden) ports.persistLiveIntent(true); return openLive(); },
    restoreSavedIntent: (previouslyAuthorized: boolean) => {
      if (disposed || hidden || savedRestoreAttempted || !previouslyAuthorized) return Promise.resolve();
      savedRestoreAttempted = true;
      return openLive();
    },
    close,
    pageHide: () => {
      if (disposed || hidden) return;
      resumeAfterShow = liveIntent;
      hidden = true;
      stopLive();
      cancelSnapshot();
      publish({ phase: state.snapshot ? 'snapshot' : 'loading', liveAt: null, fps: null, refreshing: false });
    },
    pageShow: () => {
      if (disposed || !hidden) return Promise.resolve();
      hidden = false;
      const restore = resumeAfterShow;
      resumeAfterShow = false;
      liveIntent = false;
      return restore ? openLive() : Promise.resolve();
    },
    dispose: () => {
      if (disposed) return;
      disposed = true;
      liveIntent = false;
      stopLive();
      cancelSnapshot();
    },
  };
};
