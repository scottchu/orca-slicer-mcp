import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createHostRpc } from '../host/rpc';
import { createLiveCameraController } from './live-controller';
import type { CameraPeerEvents } from './session';

const frame = {
  structuredContent: {
    schemaVersion: 1,
    available: true,
    observedAt: '2026-09-01T12:00:00.000Z',
    mediaType: 'image/jpeg',
    byteLength: 4,
  },
  _meta: {
    cameraFrame: { dataUrl: 'data:image/jpeg;base64,/9j/2Q==' },
    cameraActivation: { token: 'fixture-activation-capability' },
  },
};
const offered = {
  structuredContent: { schemaVersion: 2, available: true },
  _meta: {
    cameraStream: {
      transport: 'mcp-apps-tools',
      sessionId: 'fixture-session-capability',
      offer: { type: 'offer', sdp: 'fixture-sdp' },
      iceServers: [],
    },
  },
};
const flush = async () => {
  for (let index = 0; index < 40; index++) await Promise.resolve();
};
const cleanups: Array<() => void> = [];
const setup = (hangClose = false) => {
  const host = new EventTarget() as EventTarget & {
    parent: Window;
    openai: { toolOutput: unknown; toolResponseMetadata: unknown };
  };
  const calls: Array<{ id: number; name: string; arguments: Record<string, unknown> }> = [];
  const peers: CameraPeerEvents[] = [];
  const reply = (id: number, result: unknown) => {
    host.dispatchEvent(new MessageEvent('message', {
      source: host.parent,
      data: { jsonrpc: '2.0', id, result },
    }));
  };
  host.parent = {
    postMessage: (message: {
      id: number;
      method: string;
      params: { name: string; arguments: Record<string, unknown> };
    }) => {
      if (message.method === 'ui/initialize') queueMicrotask(() => reply(message.id, {}));
      if (message.method !== 'tools/call') return;
      calls.push({ id: message.id, ...message.params });
      if (message.params.name === 'open_u1_camera_stream') return;
      if (message.params.name === 'close_u1_camera_stream' && hangClose) return;
      queueMicrotask(() => reply(message.id, message.params.name === 'get_u1_camera_frame'
        ? frame
        : { structuredContent: { accepted: true, candidateCount: 1, closed: true } }));
    },
  } as unknown as Window;
  host.openai = { toolOutput: frame.structuredContent, toolResponseMetadata: frame._meta };
  const removed = vi.spyOn(host, 'removeEventListener');
  const rpc = createHostRpc(host);
  const disposeRpc = vi.spyOn(rpc, 'dispose');
  const controller = createLiveCameraController({
    rpc,
    initialSnapshot: 'host-result',
    savedLiveIntent: () => false,
    persistLiveIntent: () => {},
    decode: async () => true,
    scheduler: {
      now: () => Date.now(),
      timestamp: () => new Date().toISOString(),
      after: (milliseconds, callback) => {
        const timer = setTimeout(callback, milliseconds);
        return () => clearTimeout(timer);
      },
    },
    peer: (_offer, events) => {
      peers.push(events);
      return { answer: async () => 'fixture-answer', dispose: () => {} };
    },
  });
  const respondToOpen = () => {
    const open = calls.find(call => call.name === 'open_u1_camera_stream');
    expect(open).toBeDefined();
    reply(open!.id, offered);
  };
  const app = { controller, calls, peers, rpc, disposeRpc, removed, respondToOpen };
  cleanups.push(() => {
    controller.dispose();
    rpc.dispose();
  });
  controller.start();
  return app;
};
const startLive = async (app: ReturnType<typeof setup>) => {
  await flush();
  const flight = app.controller.goLive();
  await flush();
  expect(app.calls.filter(call => call.name === 'open_u1_camera_stream')).toHaveLength(1);
  return { flight };
};

describe('Camera opening deadlines through the real HostRpc and service', () => {
  beforeEach(() => vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] }));
  afterEach(async () => {
    for (const cleanup of cleanups.splice(0)) cleanup();
    await flush();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it.each([12_000, 16_000])('accepts an offer after %i ms and starts the existing frame deadline', async delay => {
    const app = setup();
    const { flight } = await startLive(app);
    await vi.advanceTimersByTimeAsync(delay);
    expect(app.controller.state().camera).toMatchObject({ mode: 'live', phase: 'connecting' });
    expect(app.peers).toHaveLength(0);
    app.respondToOpen();
    await flight;
    expect(app.peers).toHaveLength(1);
    expect(app.calls.filter(call => call.name === 'answer_u1_camera_stream')).toHaveLength(1);
    await vi.advanceTimersByTimeAsync(7_999);
    expect(app.controller.state().camera.phase).toBe('connecting');
    await vi.advanceTimersByTimeAsync(1);
    expect(app.controller.state().camera.mode).toBe('auto');
    expect(app.calls.filter(call => call.name === 'close_u1_camera_stream')).toHaveLength(1);
  });

  it('falls back at 40 seconds and closes a 45-second offer without creating a peer', async () => {
    const app = setup();
    const { flight } = await startLive(app);
    await vi.advanceTimersByTimeAsync(39_999);
    expect(app.controller.state().camera.phase).toBe('connecting');
    await vi.advanceTimersByTimeAsync(1);
    await flight;
    expect(app.controller.state().camera.mode).toBe('auto');
    await vi.advanceTimersByTimeAsync(5_000);
    app.respondToOpen();
    await flush();
    expect(app.peers).toHaveLength(0);
    expect(app.calls.filter(call => call.name === 'close_u1_camera_stream'))
      .toMatchObject([{ arguments: { sessionId: 'fixture-session-capability' } }]);
    expect(app.controller.state().camera.mode).toBe('auto');
  });

  it.each(['hide', 'dispose'] as const)('closes a late allocated lease after %s and releases bridge listeners', async action => {
    const app = setup();
    const { flight } = await startLive(app);
    if (action === 'hide') app.controller.pageHide();
    else app.controller.dispose();
    await flight;
    await vi.advanceTimersByTimeAsync(45_000);
    expect(app.disposeRpc).not.toHaveBeenCalled();
    app.respondToOpen();
    await flush();
    expect(app.calls.filter(call => call.name === 'close_u1_camera_stream')).toHaveLength(1);
    expect(app.peers).toHaveLength(0);
    if (action === 'hide') app.controller.dispose();
    await flush();
    expect(app.disposeRpc).toHaveBeenCalledOnce();
    expect(app.removed.mock.calls.map(([name]) => name)).toEqual(['message', 'openai:set_globals']);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('releases a disposed bridge after the 55-second response deadline when no offer arrives', async () => {
    const app = setup();
    const { flight } = await startLive(app);
    app.controller.dispose();
    await flight;
    await vi.advanceTimersByTimeAsync(54_999);
    expect(app.disposeRpc).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(app.disposeRpc).toHaveBeenCalledOnce();
    expect(app.peers).toHaveLength(0);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('bounds cleanup when the host never acknowledges the late lease close', async () => {
    const app = setup(true);
    const { flight } = await startLive(app);
    app.controller.dispose();
    await flight;
    await vi.advanceTimersByTimeAsync(54_000);
    app.respondToOpen();
    await flush();
    expect(app.calls.filter(call => call.name === 'close_u1_camera_stream')).toHaveLength(1);
    await vi.advanceTimersByTimeAsync(14_999);
    expect(app.disposeRpc).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(app.disposeRpc).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });
});
