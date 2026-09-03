import { afterEach, describe, expect, it, vi } from 'vitest';
import { createHostRpc, type HostEvent } from './rpc';
const setup = (globals?: Record<string, unknown>) => {
  const host = new EventTarget() as EventTarget & { parent: Window; openai?: Record<string, unknown> };
  const send = vi.fn(); host.parent = { postMessage: send } as unknown as Window; host.openai = globals;
  const rpc = createHostRpc(host as unknown as Parameters<typeof createHostRpc>[0], { timeoutMs: 100 });
  const receive = (data: unknown, source = host.parent) => host.dispatchEvent(new MessageEvent('message', { source, data }));
  const reply = (id: number, result: unknown) => receive({ jsonrpc: '2.0', id, result });
  return { rpc, host, send, receive, reply };
};
afterEach(() => vi.useRealTimers());
describe('single shared host RPC', () => {
  it('keeps ordinary calls bounded by the default while one call uses its own deadline', async () => {
    vi.useFakeTimers();
    const { rpc, reply } = setup();
    try {
      const initialized = rpc.start();
      reply(1, {});
      await initialized;
      const ordinary = rpc.callTool('ordinary', {});
      const extended = rpc.callTool('extended', {}, { timeoutMs: 200 });
      const failure = expect(ordinary).rejects.toThrow('timed out');
      await vi.advanceTimersByTimeAsync(100);
      await failure;
      reply(3, 'completed');
      await expect(extended).resolves.toBe('completed');
      await expect(rpc.callTool('invalid', {}, { timeoutMs: Infinity })).rejects.toThrow('Invalid host deadline');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      rpc.dispose();
    }
  });
  it('delivers bounded host context through the same validated parent listener', async () => {
    const host = new EventTarget() as EventTarget & { parent: Window };
    const send = vi.fn(), context = vi.fn(); host.parent = { postMessage: send } as unknown as Window;
    const rpc = createHostRpc(host as unknown as Parameters<typeof createHostRpc>[0], { onHostContext: context });
    const start = rpc.start();
    host.dispatchEvent(new MessageEvent('message', { source: host.parent, data: { jsonrpc: '2.0', id: 1, result: { hostContext: { safeArea: { insets: { bottom: 12 } } } } } }));
    await start; expect(context).toHaveBeenLastCalledWith({ safeArea: { insets: { bottom: 12 } } });
    const message = { jsonrpc: '2.0', method: 'ui/notifications/host-context-changed', params: { safeArea: { bottom: 0 } } };
    host.dispatchEvent(new MessageEvent('message', { source: {} as Window, data: message })); expect(context).toHaveBeenCalledTimes(1);
    host.dispatchEvent(new MessageEvent('message', { source: host.parent, data: message })); expect(context).toHaveBeenLastCalledWith(message.params);
    rpc.dispose(); host.dispatchEvent(new MessageEvent('message', { source: host.parent, data: message })); expect(context).toHaveBeenCalledTimes(2);
  });
  it('initializes once and resolves reordered unique requests exactly once', async () => {
    const { rpc, send, reply } = setup(); const first = rpc.start(); expect(rpc.start()).toBe(first);
    expect(send).toHaveBeenCalledTimes(1); reply(1, { protocolVersion: '2026-01-26' }); await first;
    const one = rpc.callTool('one', {}), two = rpc.callTool('two', {}); await Promise.resolve();
    reply(3, 'second'); reply(2, 'first'); reply(2, 'duplicate');
    await expect(one).resolves.toBe('first'); await expect(two).resolves.toBe('second');
    expect(send.mock.calls.filter(([value]) => value.method === 'ui/initialize')).toHaveLength(1); rpc.dispose();
  });
  it('ignores wrong parents, malformed replies, unknown IDs and times out', async () => {
    vi.useFakeTimers(); const { rpc, receive, reply } = setup(); const first = rpc.start(); const failed = expect(first).rejects.toThrow('timed out');
    receive({ jsonrpc: '2.0', id: 1, result: {} }, {} as Window);
    receive({ jsonrpc: '2.0', id: 1, result: {}, error: {} }); reply(100, {});
    await vi.advanceTimersByTimeAsync(100); await failed; rpc.dispose();
  });
  it('can reinitialize after deadline without opening a second simultaneous transport', async () => {
    vi.useFakeTimers(); const { rpc, reply, send } = setup(); const first = rpc.start(); const failure = expect(first).rejects.toThrow();
    await vi.advanceTimersByTimeAsync(100); await failure;
    const retry = rpc.start(); reply(2, {}); await retry; expect(send.mock.calls.filter(([value]) => value.method === 'ui/initialize')).toHaveLength(2); rpc.dispose();
  });
  it('replays compatibility metadata intact, then standard events take precedence', () => {
    const hidden = { structuredContent: { view: 'camera' }, _meta: { activation: 'synthetic-only' } };
    const { rpc, host, receive } = setup({ toolInput: { view: 'camera' }, toolResponseMetadata: { mcp_tool_result: hidden } });
    const events: HostEvent[] = []; const unsubscribe = rpc.subscribe((event) => events.push(event));
    expect(events).toEqual([{ kind: 'input', value: { view: 'camera' } }, { kind: 'result', value: hidden }]);
    receive({ jsonrpc: '2.0', method: 'ui/notifications/tool-result', params: { structuredContent: 'newer' } });
    host.dispatchEvent(new CustomEvent('openai:set_globals', { detail: { globals: { toolOutput: 'older' } } }));
    expect(events.at(-1)?.value).toEqual({ structuredContent: 'newer' }); unsubscribe(); rpc.dispose();
  });
  it('disposal rejects pending requests and removes listeners and replayed data', async () => {
    const { rpc, receive } = setup(); const events = vi.fn(); rpc.subscribe(events); const first = rpc.start(); const failure = expect(first).rejects.toThrow('disposed');
    rpc.dispose(); rpc.dispose(); await failure;
    receive({ jsonrpc: '2.0', method: 'ui/notifications/tool-result', params: {} }); rpc.subscribe(events);
    expect(events).not.toHaveBeenCalled(); await expect(rpc.callTool('one', {})).rejects.toThrow('disposed');
  });
});
