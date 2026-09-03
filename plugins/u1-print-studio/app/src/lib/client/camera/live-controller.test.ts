import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { HostEvent } from '../host/rpc';
import { createLiveCameraController } from './live-controller';
import type { CameraPeerEvents } from './session';

const image = 'data:image/jpeg;base64,/9j/2Q==';
const observedAt = '2026-09-01T12:00:00.000Z';
const frame = (time = observedAt) => ({ structuredContent: { schemaVersion: 1, available: true, observedAt: time, mediaType: 'image/jpeg', byteLength: 4 }, _meta: { cameraFrame: { dataUrl: image }, cameraActivation: { token: 'fixture-activation-capability' } } });
const offered = { structuredContent: { schemaVersion: 2, available: true }, _meta: { cameraStream: { transport: 'mcp-apps-tools', sessionId: 'fixture-session-capability', offer: { type: 'offer', sdp: 'fixture-sdp' }, iceServers: [] } } };
const deferred = <T>() => { let resolve!: (value: T) => void, reject!: (reason?: unknown) => void; const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };
const flush = async () => { for (let index = 0; index < 30; index++) await Promise.resolve(); };
const setup = (initial?: unknown, initialSnapshot?: 'request' | 'host-result') => {
  let listener: ((event: HostEvent) => void) | undefined;
  const peers: CameraPeerEvents[] = [];
  const rpc = { requestDisplayMode: vi.fn(async () => 'inline' as const), subscribeContext: vi.fn(() => vi.fn()), start: vi.fn().mockResolvedValue(undefined), dispose: vi.fn(), subscribe: vi.fn((value: (event: HostEvent) => void) => {
    listener = value; if (initial) value({ kind: 'result', value: initial }); return vi.fn();
  }), callTool: vi.fn(async (name: string) => {
    if (name === 'get_u1_camera_frame') return frame();
    if (name === 'open_u1_camera_stream') return offered;
    return { structuredContent: { accepted: true, candidateCount: 1, closed: true } };
  }) };
  const decode = vi.fn().mockResolvedValue(true);
  const peerDispose = vi.fn();
  const controller = createLiveCameraController({ rpc, decode,
    initialSnapshot,
    scheduler: { now: () => Date.now(), timestamp: () => new Date().toISOString(), after: (ms, callback) => { const timer = setTimeout(callback, ms); return () => clearTimeout(timer); } },
    peer: (_offer, events) => { peers.push(events); return { answer: async () => 'fixture-answer', dispose: peerDispose }; },
  });
  return { controller, rpc, decode, peers, peerDispose, notify: (value: unknown) => listener?.({ kind: 'result', value }) };
};

describe('real Camera host/controller lifecycle without printer requests', () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date(observedAt)); });
  afterEach(() => { vi.clearAllTimers(); vi.useRealTimers(); });
  it('waits for a delayed MCP initial result without repeating snapshot acquisition', async () => {
    const app = setup(undefined, 'host-result'); app.controller.start(); await flush();
    await vi.advanceTimersByTimeAsync(1000); expect(app.rpc.callTool).not.toHaveBeenCalled();
    app.notify(frame()); await flush();
    expect(app.controller.state().camera.phase).toBe('snapshot'); expect(app.rpc.callTool).not.toHaveBeenCalled();
    app.controller.dispose(); await flush(); expect(vi.getTimerCount()).toBe(0);
  });
  it('bounds absent MCP delivery to neutral failure then quietly recovers through Auto', async () => {
    const app = setup(undefined, 'host-result'); app.controller.start(); await flush();
    await vi.advanceTimersByTimeAsync(15000);
    expect(app.controller.state().camera).toMatchObject({ phase: 'error', failure: 'snapshot', snapshot: null });
    expect(app.rpc.callTool).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1500); expect(app.rpc.callTool).toHaveBeenCalledExactlyOnceWith('get_u1_camera_frame', {});
    expect(app.controller.state().feedback).toBe('');
    expect(app.controller.state().camera.phase).toBe('snapshot'); app.controller.dispose(); await flush();
  });
  it('unidentified malformed delivery cannot settle Camera bootstrap and times out before Auto retries', async () => {
    const app = setup(undefined, 'host-result'); app.controller.start(); app.notify({ structuredContent: { schemaVersion: 1, available: true }, _meta: {} });
    await vi.advanceTimersByTimeAsync(15000);
    expect(app.controller.state().camera).toMatchObject({ phase: 'error', failure: 'snapshot', snapshot: null });
    expect(app.rpc.callTool).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1500);
    expect(app.rpc.callTool).toHaveBeenCalledExactlyOnceWith('get_u1_camera_frame', {});
    expect(app.controller.state().camera.mode).toBe('auto');
    app.controller.dispose(); await flush();
  });
  it('rejects bare opening host errors and cancels the delivery waiter on disposal', async () => {
    const app = setup(undefined, 'host-result'); app.controller.start();
    app.notify({ isError: true }); await flush();
    expect(app.controller.state().camera).toMatchObject({ phase: 'error', snapshot: null });
    expect(app.rpc.callTool).not.toHaveBeenCalled(); app.controller.dispose(); await flush();
    const pending = setup(undefined, 'host-result'); pending.controller.start(); pending.controller.dispose(); await flush();
    pending.notify(frame()); await vi.advanceTimersByTimeAsync(15000);
    expect(pending.rpc.callTool).not.toHaveBeenCalled(); expect(vi.getTimerCount()).toBe(0);
  });
  it('the newest initial host decode owns Auto startup without Live activation', async () => {
    const app = setup(undefined, 'host-result'); const first = deferred<boolean>(), second = deferred<boolean>();
    app.decode.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    app.controller.start(); app.notify(frame()); await flush();
    app.notify(frame('2026-09-01T12:00:01.000Z')); await flush();
    expect(app.rpc.callTool).not.toHaveBeenCalled();
    second.resolve(true); await flush();
    expect(app.rpc.callTool).not.toHaveBeenCalled(); expect(app.peers).toHaveLength(0);
    first.resolve(true); await flush(); expect(app.peers).toHaveLength(0); app.controller.dispose(); await flush();
  });
  it('renders an initial private snapshot after decode without acquiring or activating', async () => {
    const app = setup(frame()); app.controller.start(); app.controller.start(); await flush();
    expect(app.controller.state().camera).toMatchObject({ phase: 'snapshot', snapshot: { image, observedAt }, refreshing: false });
    expect(app.rpc.callTool).not.toHaveBeenCalled(); expect(app.rpc.subscribe).toHaveBeenCalledOnce();
    app.controller.dispose(); await flush(); expect(app.rpc.dispose).toHaveBeenCalledOnce(); expect(vi.getTimerCount()).toBe(0);
  });
  it('defaults to one snapshot request and a finite startup without authorizing live', async () => {
    const app = setup(); const pending = deferred<never>(); app.rpc.callTool.mockReturnValue(pending.promise);
    app.controller.start(); await flush();
    expect(app.rpc.callTool).toHaveBeenCalledExactlyOnceWith('get_u1_camera_frame', {});
    await vi.advanceTimersByTimeAsync(10000);
    expect(app.controller.state().camera).toMatchObject({ phase: 'error', refreshing: false, snapshot: null });
    expect(app.controller.state().feedback).toBe('');
    pending.reject(); await flush(); app.controller.dispose(); await flush();
  });
  it('starts each card in Auto and never reads or persists saved Live intent', async () => {
    const app = setup(frame());
    app.controller.start(); await flush();
    expect(app.controller.state().camera.mode).toBe('auto');
    expect(app.rpc.callTool).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1500);
    expect(app.rpc.callTool).toHaveBeenCalledExactlyOnceWith('get_u1_camera_frame', {});
    expect(app.controller.state().feedback).toBe('');
    app.controller.dispose(); await flush();
  });

  it('retains a newer notified frame when an older pending acquisition eventually rejects', async () => {
    const app = setup(frame()); app.controller.start(); await flush();
    const pending = deferred<never>(); app.rpc.callTool.mockReturnValue(pending.promise);
    const refresh = app.controller.refresh(); await flush(); app.notify(frame('2026-09-01T12:01:00.000Z')); await flush();
    pending.reject(); await refresh; await flush();
    expect(app.controller.state().camera).toMatchObject({ phase: 'snapshot', snapshot: { observedAt: '2026-09-01T12:01:00.000Z' }, refreshing: false });
    expect(app.controller.state().feedback).toBe('');
    app.notify(frame()); await flush(); expect(app.controller.state().camera.snapshot?.observedAt).toBe('2026-09-01T12:01:00.000Z');
    app.controller.dispose(); await flush();
  });
  it('new display feedback owns the overlay over an older pending refresh result', async () => {
    const app = setup(frame()); app.controller.start(); await flush();
    const pending = deferred<ReturnType<typeof frame>>(); app.rpc.callTool.mockReturnValue(pending.promise);
    const refresh = app.controller.refresh(); await flush(); app.controller.notify('Fullscreen unavailable; preview continues');
    pending.resolve(frame('2026-09-01T12:02:00.000Z')); await refresh;
    expect(app.controller.state().feedback).toBe('Fullscreen unavailable; preview continues');
    await vi.advanceTimersByTimeAsync(1800); expect(app.controller.state().feedback).toBe('');
    app.controller.dispose(); await flush();
  });
  it('pagehide stops this peer and pageshow restores prior intent only once', async () => {
    const app = setup(frame()); app.controller.start(); await flush(); await app.controller.goLive();
    app.controller.pageHide(); expect(app.peerDispose).toHaveBeenCalledOnce();
    const before = app.controller.state().camera; app.peers[0].frame({ kind: 'presented', count: 1, at: 0 }); expect(app.controller.state().camera).toBe(before);
    await app.controller.pageShow(); await app.controller.pageShow(); expect(app.peers).toHaveLength(2);
    app.controller.close(); app.controller.pageHide(); await app.controller.pageShow(); expect(app.peers).toHaveLength(2);
    app.controller.dispose(); await flush(); expect(vi.getTimerCount()).toBe(0);
  });
  it('keeps the RPC alive until a late allocated lease is closed after disposal', async () => {
    const app = setup(frame()); app.controller.start(); await flush();
    const pending = deferred<typeof offered>(); const original = app.rpc.callTool.getMockImplementation()!;
    app.rpc.callTool.mockImplementation((name) => name === 'open_u1_camera_stream' ? pending.promise : original(name));
    const live = app.controller.goLive(); await flush(); app.controller.dispose(); await flush();
    expect(app.rpc.dispose).not.toHaveBeenCalled(); pending.resolve(offered); await live; await flush();
    expect(app.rpc.callTool).toHaveBeenCalledWith('close_u1_camera_stream', { sessionId: 'fixture-session-capability' });
    expect(app.peers).toHaveLength(0); expect(app.rpc.dispose).toHaveBeenCalledOnce(); expect(vi.getTimerCount()).toBe(0);
  });
  it('retains a Live failure without a transient toast and keeps later display feedback independent', async () => {
    const app = setup(frame());
    app.controller.start(); await flush(); await app.controller.goLive();
    app.peers[0].connection('connecting');
    await vi.advanceTimersByTimeAsync(8000);
    const diagnostic = app.controller.state().camera.lastLiveFailure;
    expect(diagnostic).toMatchObject({ stage: 'first-frame', outcome: 'timeout' });
    expect(app.controller.state().feedback).toBe('');
    await vi.advanceTimersByTimeAsync(1500);
    expect(app.controller.state().camera.lastLiveFailure).toBe(diagnostic);
    expect(app.controller.state().feedback).toBe('');
    app.controller.notify('Fullscreen unavailable');
    await vi.advanceTimersByTimeAsync(1500);
    expect(app.controller.state().feedback).toBe('Fullscreen unavailable');
    app.controller.dispose(); await flush();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('failed Auto resume waits the full poll interval instead of immediately retrying', async () => {
    const app = setup(undefined, 'host-result');
    app.controller.start(); await vi.advanceTimersByTimeAsync(15000);
    app.controller.pageHide();
    app.rpc.callTool.mockRejectedValue(new Error('Synthetic failure'));
    await app.controller.pageShow();
    expect(app.rpc.callTool).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1499);
    expect(app.rpc.callTool).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(app.rpc.callTool).toHaveBeenCalledTimes(2);
    app.controller.dispose(); await flush();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('display feedback does not cancel the missing-host-result deadline or Auto recovery', async () => {
    const app = setup(undefined, 'host-result');
    app.controller.start();
    app.controller.notify('Fullscreen unavailable');
    await vi.advanceTimersByTimeAsync(15000);
    expect(app.controller.state().camera).toMatchObject({ mode: 'auto', phase: 'error', failure: 'snapshot' });
    expect(app.rpc.callTool).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1500);
    expect(app.rpc.callTool).toHaveBeenCalledExactlyOnceWith('get_u1_camera_frame', {});
    expect(app.controller.state().camera.phase).toBe('snapshot');
    expect(app.controller.state().feedback).toBe('');
    app.controller.dispose(); await flush();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('recognizable malformed Camera delivery fails immediately, while unrelated results wait', async () => {
    const app = setup(undefined, 'host-result');
    app.controller.start();
    app.notify({ structuredContent: { accepted: true } }); await flush();
    expect(app.controller.state().camera.phase).toBe('loading');
    app.notify({ structuredContent: { schemaVersion: 1, available: true }, _meta: { cameraFrame: {} } });
    await flush();
    expect(app.controller.state().camera).toMatchObject({ phase: 'error', failure: 'snapshot' });
    expect(app.rpc.callTool).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1499);
    expect(app.rpc.callTool).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(app.rpc.callTool).toHaveBeenCalledExactlyOnceWith('get_u1_camera_frame', {});
    app.controller.dispose(); await flush();
    expect(vi.getTimerCount()).toBe(0);
  });

});
