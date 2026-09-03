import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createCameraSession, type CameraFrameResult, type CameraOffer, type CameraPeerEvents, type CameraSessionState } from './session';

const deferred = <T>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
};
const flush = async () => { for (let index = 0; index < 20; index++) await Promise.resolve(); };
const snapshot = { image: 'private-decoded-image', observedAt: '2026-09-01T12:00:00.000Z' };
const offer: CameraOffer = { sessionId: 'opaque-viewer', sdp: 'private-offer', iceServers: [] };
const setup = () => {
  const states: CameraSessionState[] = [];
  const peers: { events: CameraPeerEvents; answer: ReturnType<typeof vi.fn>; dispose: ReturnType<typeof vi.fn> }[] = [];
  const transport = {
    frame: vi.fn<(_: { authorizeLive: boolean }) => Promise<CameraFrameResult>>().mockResolvedValue({ snapshot, activationToken: 'private-once' }),
    open: vi.fn().mockResolvedValue(offer), answer: vi.fn().mockResolvedValue(undefined),
    candidates: vi.fn().mockResolvedValue(undefined), close: vi.fn().mockResolvedValue(undefined),
  };
  const decode = vi.fn().mockResolvedValue(true);
  const persistLiveIntent = vi.fn();
  const session = createCameraSession({ transport, decode, persistLiveIntent,
    scheduler: { now: () => Date.now(), timestamp: () => new Date().toISOString(), after: (ms, callback) => {
      const timer = setTimeout(callback, ms); return () => clearTimeout(timer);
    } },
    changed: (state) => states.push(state),
    peer: (_offer, events) => {
      const peer = { events, answer: vi.fn().mockResolvedValue('private-answer'), dispose: vi.fn() };
      peers.push(peer); return peer;
    },
  });
  return { session, states, peers, transport, decode, persistLiveIntent };
};

describe('injected real-camera session ownership (no host, device or network)', () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date('2026-09-01T12:00:00Z')); });
  afterEach(() => { vi.clearAllTimers(); vi.useRealTimers(); });

  it('starts snapshot-first and never authorizes live from a snapshot refresh', async () => {
    const app = setup();
    expect(app.session.state().phase).toBe('loading');
    expect(app.transport.frame).not.toHaveBeenCalled();
    await app.session.refreshSnapshot();
    expect(app.transport.frame).toHaveBeenCalledWith({ authorizeLive: false });
    expect(app.transport.open).not.toHaveBeenCalled();
    expect(app.persistLiveIntent).not.toHaveBeenCalled();
    expect(app.session.state()).toMatchObject({ phase: 'snapshot', snapshot, refreshing: false });
    expect(vi.getTimerCount()).toBe(0);
  });

  it('singleflights frame refresh and commits image/time only after successful decode', async () => {
    const app = setup();
    const decode = deferred<boolean>(); app.decode.mockReturnValue(decode.promise);
    const first = app.session.refreshSnapshot(); const second = app.session.refreshSnapshot();
    expect(second).toBe(first);
    await flush();
    expect(app.transport.frame).toHaveBeenCalledTimes(1);
    expect(app.session.state().snapshot).toBeNull();
    decode.resolve(true); await first;
    expect(app.session.state().snapshot).toEqual(snapshot);
    app.transport.frame.mockResolvedValue({ snapshot: { image: 'bad-new-image', observedAt: '2026-09-01T13:00:00Z' } });
    app.decode.mockResolvedValue(false);
    await app.session.refreshSnapshot();
    expect(app.session.state().snapshot).toEqual(snapshot);
    expect(app.session.state().feedback).toBe('snapshot-unavailable');
  });

  it('expires a frame at10s and ignores its later response', async () => {
    const app = setup(); const frame = deferred<CameraFrameResult>(); app.transport.frame.mockReturnValue(frame.promise);
    const flight = app.session.refreshSnapshot(); await flush();
    await vi.advanceTimersByTimeAsync(10000); await flight;
    expect(app.session.state().phase).toBe('error');
    frame.resolve({ snapshot }); await flush();
    expect(app.decode).not.toHaveBeenCalled();
    expect(app.session.state().snapshot).toBeNull();
  });

  it('keeps acquisition failure through retry and clears it only after accepted decoded data', async () => {
    const app = setup();
    await app.session.refreshSnapshot();
    app.transport.frame.mockRejectedValueOnce(new Error('fixture unavailable'));
    await app.session.refreshSnapshot();
    expect(app.session.state()).toMatchObject({ snapshot, failure: 'snapshot', refreshing: false });
    const pending = deferred<boolean>(); app.decode.mockReturnValueOnce(pending.promise);
    const retry = app.session.refreshSnapshot(); await flush();
    expect(app.session.state()).toMatchObject({ snapshot, failure: 'snapshot', refreshing: true });
    pending.resolve(true); await retry;
    expect(app.session.state()).toMatchObject({ snapshot, failure: null, refreshing: false });
    app.session.dispose();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('expires decode at1.5s without replacing the retained snapshot', async () => {
    const app = setup(); await app.session.refreshSnapshot();
    const decoded = deferred<boolean>(); app.decode.mockReturnValue(decoded.promise);
    app.transport.frame.mockResolvedValue({ snapshot: { image: 'late-image', observedAt: 'late-time' } });
    const flight = app.session.refreshSnapshot(); await flush();
    await vi.advanceTimersByTimeAsync(1500); await flight;
    decoded.resolve(true); await flush();
    expect(app.session.state()).toMatchObject({ phase: 'snapshot', snapshot, refreshing: false });
    expect(vi.getTimerCount()).toBe(0);
  });

  it('authorizes once, opens once, and answers before waiting for real frame evidence', async () => {
    const app = setup(); const first = app.session.goLive(); const second = app.session.goLive();
    expect(first).toBe(second); await first;
    expect(app.transport.frame).toHaveBeenCalledTimes(1);
    expect(app.transport.frame).toHaveBeenCalledWith({ authorizeLive: true });
    expect(app.transport.open).toHaveBeenCalledExactlyOnceWith('private-once');
    expect(app.transport.answer).toHaveBeenCalledExactlyOnceWith('opaque-viewer', 'private-answer');
    expect(app.session.state()).toMatchObject({ phase: 'connecting', liveAt: null, fps: null });
    expect(JSON.stringify(app.states)).not.toMatch(/opaque-viewer|private-offer|private-answer|private-once/);
    app.session.dispose(); await flush();
    expect(app.peers[0].dispose).toHaveBeenCalledTimes(1);
    expect(app.transport.close).toHaveBeenCalledExactlyOnceWith('opaque-viewer');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('never opens without activation and polls fallback at a bounded1.5s cadence', async () => {
    const app = setup(); app.transport.frame.mockResolvedValue({ snapshot });
    await app.session.goLive();
    expect(app.transport.open).not.toHaveBeenCalled();
    expect(app.session.state().phase).toBe('fallback');
    await vi.advanceTimersByTimeAsync(1499); expect(app.transport.frame).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1); expect(app.transport.frame).toHaveBeenCalledTimes(2);
    expect(app.transport.frame).toHaveBeenLastCalledWith({ authorizeLive: false });
    app.session.close(); await vi.advanceTimersByTimeAsync(5000);
    expect(app.transport.frame).toHaveBeenCalledTimes(2);
    expect(app.session.state().phase).toBe('snapshot');
  });

  it('closes a late opened opaque session after Close without resurrecting it', async () => {
    const app = setup(); const opened = deferred<CameraOffer>(); app.transport.open.mockReturnValue(opened.promise);
    const flight = app.session.goLive(); await flush(); app.session.close();
    opened.resolve(offer); await flight; await flush();
    expect(app.peers).toHaveLength(0);
    expect(app.transport.answer).not.toHaveBeenCalled();
    expect(app.transport.close).toHaveBeenCalledExactlyOnceWith('opaque-viewer');
    expect(app.session.state().phase).toBe('snapshot');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('releases an offer arriving after the40s open deadline', async () => {
    const app = setup(); const opened = deferred<CameraOffer>(); app.transport.open.mockReturnValue(opened.promise);
    const flight = app.session.goLive(); await flush(); await vi.advanceTimersByTimeAsync(40000); await flight;
    opened.resolve(offer); await flush();
    expect(app.session.state().phase).toBe('fallback');
    expect(app.transport.close).toHaveBeenCalledExactlyOnceWith('opaque-viewer');
    expect(app.peers).toHaveLength(0);
    app.session.dispose();
  });

  it('does not dispatch an operation cancelled before its first microtask', async () => {
    const app = setup(); const flight = app.session.goLive(); app.session.pageHide(); await flight;
    expect(app.transport.frame).not.toHaveBeenCalled();
    expect(app.transport.open).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('supersedes an older snapshot acquisition when explicit live activation starts', async () => {
    const app = setup(); const stale = deferred<CameraFrameResult>(); app.transport.frame.mockReturnValueOnce(stale.promise);
    const old = app.session.refreshSnapshot(); await flush(); await app.session.goLive();
    stale.resolve({ snapshot: { image: 'obsolete-image', observedAt: 'obsolete-time' } }); await old; await flush();
    expect(app.session.state().snapshot).toEqual(snapshot);
    expect(app.session.state().phase).toBe('connecting');
    app.session.dispose();
  });

  it('requires presented evidence, measures a full second, expiresFPS and ends a5s stall', async () => {
    const app = setup(); await app.session.goLive(); const events = app.peers[0].events;
    events.frame({ kind: 'presented', count: 1, at: 0 });
    expect(app.session.state()).toMatchObject({ phase: 'live', fps: null });
    await vi.advanceTimersByTimeAsync(1000); events.frame({ kind: 'presented', count: 31, at: 1000 });
    expect(app.session.state().fps).toBe(30);
    const lastTime = app.session.state().liveAt;
    await vi.advanceTimersByTimeAsync(1500);
    expect(app.session.state()).toMatchObject({ phase: 'live', fps: null, liveAt: lastTime });
    events.frame({ kind: 'presented', count: 31, at: 2500 });
    expect(app.session.state().liveAt).toBe(lastTime);
    await vi.advanceTimersByTimeAsync(3500);
    expect(app.session.state()).toMatchObject({ phase: 'fallback', fps: null, liveAt: null });
    expect(app.peers[0].dispose).toHaveBeenCalledTimes(1);
    app.session.dispose();
  });

  it('requires advancing decoded counts and does not mix counter families', async () => {
    const app = setup(); await app.session.goLive(); const events = app.peers[0].events;
    events.frame({ kind: 'decoded', count: 1, at: 0 }); expect(app.session.state().phase).toBe('connecting');
    events.frame({ kind: 'decoded', count: 2, at: 100 }); expect(app.session.state().phase).toBe('live');
    events.frame({ kind: 'presented', count: 100, at: 200 }); expect(app.session.state().fps).toBeNull();
    events.frame({ kind: 'presented', count: 130, at: 1200 }); expect(app.session.state().fps).toBeNull();
    events.frame({ kind: 'presented', count: 160, at: 2200 }); expect(app.session.state().fps).toBe(30);
    app.session.dispose();
  });

  it('times out first presentation at8s even when a peer says connected', async () => {
    const app = setup(); await app.session.goLive(); app.peers[0].events.connection('connected');
    await vi.advanceTimersByTimeAsync(7999); expect(app.session.state().phase).toBe('connecting');
    await vi.advanceTimersByTimeAsync(1); expect(app.session.state().phase).toBe('fallback');
    app.session.dispose();
  });

  it('allows a3s disconnect grace without repeated notifications extending it', async () => {
    const app = setup(); await app.session.goLive(); const events = app.peers[0].events;
    events.frame({ kind: 'presented', count: 1, at: 0 }); events.connection('disconnected');
    await vi.advanceTimersByTimeAsync(2000); events.connection('disconnected');
    await vi.advanceTimersByTimeAsync(999); expect(app.session.state().phase).toBe('live');
    await vi.advanceTimersByTimeAsync(1); expect(app.session.state().phase).toBe('fallback');
    app.session.dispose();
  });

  it('reconnect cancels disconnect expiry without allocating another peer', async () => {
    const app = setup(); await app.session.goLive(); const events = app.peers[0].events;
    events.frame({ kind: 'presented', count: 1, at: 0 }); events.connection('disconnected');
    await vi.advanceTimersByTimeAsync(2000); events.connection('connected');
    events.frame({ kind: 'presented', count: 61, at: 2000 });
    await vi.advanceTimersByTimeAsync(1500);
    expect(app.session.state().phase).toBe('live'); expect(app.peers).toHaveLength(1);
    app.session.dispose();
  });

  it('refresh during live retains the peer and does not alter live timestamp', async () => {
    const app = setup(); await app.session.goLive(); app.peers[0].events.frame({ kind: 'presented', count: 1, at: 0 });
    const liveAt = app.session.state().liveAt; await app.session.refreshSnapshot();
    expect(app.session.state()).toMatchObject({ phase: 'live', liveAt, snapshot });
    expect(app.peers).toHaveLength(1); expect(app.peers[0].dispose).not.toHaveBeenCalled();
    app.session.dispose();
  });

  it('pagehide invalidates callbacks and pageshow restores only prior intent once', async () => {
    const app = setup(); await app.session.goLive(); const old = app.peers[0];
    app.session.pageHide(); const hidden = app.session.state();
    old.events.frame({ kind: 'presented', count: 1, at: 0 }); old.events.connection('failed');
    expect(app.session.state()).toBe(hidden); expect(old.dispose).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
    await app.session.pageShow(); await app.session.pageShow();
    expect(app.transport.open).toHaveBeenCalledTimes(2);
    app.session.close(); app.session.pageHide(); await app.session.pageShow();
    expect(app.transport.open).toHaveBeenCalledTimes(2);
    expect(app.persistLiveIntent).toHaveBeenLastCalledWith(false);
  });

  it('restores a saved authorized intent once and never restores false', async () => {
    const app = setup(); await app.session.restoreSavedIntent(false);
    expect(app.transport.frame).not.toHaveBeenCalled();
    await app.session.restoreSavedIntent(true); app.session.close();
    await app.session.restoreSavedIntent(true); expect(app.transport.open).toHaveBeenCalledTimes(1);
  });

  it('late candidates/events from one closed viewer cannot mutate another viewer', async () => {
    const left = setup(); const right = setup(); await left.session.goLive(); await right.session.goLive();
    left.session.dispose(); const old = left.peers[0].events;
    old.candidate({ candidate: 'late-private-candidate', sdpMid: '0', sdpMLineIndex: 0 }); old.ended();
    expect(left.transport.candidates).not.toHaveBeenCalled();
    expect(right.peers[0].dispose).not.toHaveBeenCalled();
    right.peers[0].events.frame({ kind: 'presented', count: 1, at: 0 }); expect(right.session.state().phase).toBe('live');
    right.session.dispose(); await flush(); expect(vi.getTimerCount()).toBe(0);
  });
  it('keeps a proven connected stream when a supplemental candidate reaches its deadline', async () => {
    const app = setup(); const candidate = deferred<void>(); app.transport.candidates.mockReturnValue(candidate.promise);
    await app.session.goLive(); const events = app.peers[0].events;
    events.connection('connected'); events.candidate({ candidate: 'candidate:fixture.local', sdpMid: '0', sdpMLineIndex: 0 }); await flush();
    for (let count = 1; count <= 10; count++) { events.frame({ kind: 'presented', count, at: count * 1000 }); await vi.advanceTimersByTimeAsync(1000); }
    expect(app.session.state()).toMatchObject({ mode: 'live', phase: 'live' });
    expect(app.transport.close).not.toHaveBeenCalled();
    candidate.resolve(); await flush(); expect(app.session.state().phase).toBe('live');
    await vi.advanceTimersByTimeAsync(5000); expect(app.session.state()).toMatchObject({ mode: 'auto', phase: 'fallback' });
    app.session.dispose(); await flush(); expect(vi.getTimerCount()).toBe(0);
  });

  it.each(['unobserved', 'rejected'] as const)('does not waive candidate %s failure without proven connectivity', async kind => {
    const app = setup(); const candidate = deferred<void>(); app.transport.candidates.mockReturnValue(candidate.promise);
    await app.session.goLive(); const events = app.peers[0].events;
    if (kind === 'rejected') events.connection('connected');
    events.candidate({ candidate: 'candidate:fixture', sdpMid: '0', sdpMLineIndex: 0 }); await flush();
    for (let count = 1; count <= 10; count++) { events.frame({ kind: 'presented', count, at: count * 1000 }); if (kind === 'rejected' && count === 10) candidate.reject(new Error('Invalid Camera response')); await vi.advanceTimersByTimeAsync(1000); }
    expect(app.session.state()).toMatchObject({ mode: 'auto', phase: 'fallback' });
    expect(app.transport.close).toHaveBeenCalledOnce(); app.session.dispose();
  });

  it('selects real periodic Auto snapshots and stops all recurring work in Snapshot', async () => {
    const app = setup(); await app.session.selectMode('auto');
    expect(app.session.state()).toMatchObject({ mode: 'auto', phase: 'fallback', failure: null });
    expect(app.transport.frame).toHaveBeenCalledTimes(1); await app.session.selectMode('auto');
    expect(app.transport.frame).toHaveBeenCalledTimes(1); await vi.advanceTimersByTimeAsync(1500);
    expect(app.transport.frame).toHaveBeenCalledTimes(2); expect(app.transport.open).not.toHaveBeenCalled();
    await app.session.selectMode('snapshot'); expect(app.transport.frame).toHaveBeenCalledTimes(3);
    await vi.advanceTimersByTimeAsync(10000); expect(app.transport.frame).toHaveBeenCalledTimes(3);
    app.session.dispose(); expect(vi.getTimerCount()).toBe(0);
  });

  it('cancels a pending Live offer on mode switch, releases its late lease and resumes Auto after pagehide', async () => {
    const app = setup(); const opened = deferred<CameraOffer>(); app.transport.open.mockReturnValue(opened.promise);
    const live = app.session.selectMode('live'); await flush(); await app.session.selectMode('auto');
    opened.resolve(offer); await live; await flush();
    expect(app.peers).toHaveLength(0); expect(app.transport.close).toHaveBeenCalledExactlyOnceWith('opaque-viewer');
    expect(app.session.state().mode).toBe('auto'); app.session.pageHide(); const reads = app.transport.frame.mock.calls.length;
    await vi.advanceTimersByTimeAsync(10000); expect(app.transport.frame).toHaveBeenCalledTimes(reads);
    await app.session.pageShow(); await flush(); expect(app.session.state().mode).toBe('auto');
    expect(app.transport.open).toHaveBeenCalledTimes(1); app.session.dispose(); expect(vi.getTimerCount()).toBe(0);
  });

});
