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
const setup = (initial?: unknown) => {
  let listener: ((event: HostEvent) => void) | undefined;
  const peers: CameraPeerEvents[] = [];
  const rpc = { start: vi.fn().mockResolvedValue(undefined), dispose: vi.fn(), subscribe: vi.fn((value: (event: HostEvent) => void) => {
    listener = value; if (initial) value({ kind: 'result', value: initial }); return vi.fn();
  }), callTool: vi.fn(async (name: string) => {
    if (name === 'get_u1_camera_frame') return frame();
    if (name === 'open_u1_camera_stream') return offered;
    return { structuredContent: { accepted: true, candidateCount: 1, closed: true } };
  }) };
  const savedLiveIntent = vi.fn().mockReturnValue(false), persistLiveIntent = vi.fn(), decode = vi.fn().mockResolvedValue(true);
  const peerDispose = vi.fn();
  const controller = createLiveCameraController({ rpc, savedLiveIntent, persistLiveIntent, decode,
    scheduler: { now: () => Date.now(), timestamp: () => new Date().toISOString(), after: (ms, callback) => { const timer = setTimeout(callback, ms); return () => clearTimeout(timer); } },
    peer: (_offer, events) => { peers.push(events); return { answer: async () => 'fixture-answer', dispose: peerDispose }; },
  });
  return { controller, rpc, savedLiveIntent, persistLiveIntent, decode, peers, peerDispose, notify: (value: unknown) => listener?.({ kind: 'result', value }) };
};

describe('real Camera host/controller lifecycle without printer requests', () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date(observedAt)); });
  afterEach(() => { vi.clearAllTimers(); vi.useRealTimers(); });
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
    expect(app.controller.state().feedback).toBe('Camera unavailable');
    pending.reject(); await flush(); app.controller.dispose(); await flush();
  });
  it('restores saved authorized intent once, while Close forbids deferred restoration', async () => {
    const app = setup(frame()); app.savedLiveIntent.mockReturnValue(true); app.controller.start(); await flush();
    expect(app.rpc.callTool).toHaveBeenCalledWith('get_u1_camera_frame', { authorizeLive: true }); expect(app.peers).toHaveLength(1);
    app.controller.start(); await flush(); expect(app.peers).toHaveLength(1);
    app.controller.dispose(); await flush();
    const closed = setup(frame()); const decoding = deferred<boolean>(); closed.decode.mockReturnValue(decoding.promise); closed.savedLiveIntent.mockReturnValue(true);
    closed.controller.start(); await flush(); closed.controller.close(); decoding.resolve(true); await flush();
    expect(closed.rpc.callTool.mock.calls.some(([name]) => name === 'open_u1_camera_stream')).toBe(false);
    closed.controller.dispose(); await flush();
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
});
