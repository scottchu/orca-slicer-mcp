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
