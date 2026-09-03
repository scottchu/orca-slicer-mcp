import { afterEach, describe, expect, it, vi } from 'vitest';
import type { HostEvent, HostRpc } from '../host/rpc';
import { createObservationHost, eventView } from './observation-host';

const setup = (replay: HostEvent[] = []) => {
  const listeners = new Set<(event: HostEvent) => void>();
  const rpc: HostRpc = {
    requestDisplayMode: vi.fn(async () => 'inline' as const),
    subscribeContext: vi.fn(() => vi.fn()),
    start: vi.fn(async () => {}),
    callTool: vi.fn(async () => ({})),
    subscribe: (listener) => {
      listeners.add(listener);
      replay.forEach(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    dispose: vi.fn(),
  };
  const host = createObservationHost(rpc, 100);
  return {
    rpc,
    host,
    emit: (event: HostEvent) => listeners.forEach((listener) => listener(event)),
  };
};
const input = (view: string): HostEvent => ({ kind: 'input', value: { arguments: { view } } });
const result = (view: string): HostEvent => ({
  kind: 'result',
  value: { structuredContent: { schemaVersion: 2, view, module: { kind: view } } },
});
afterEach(() => vi.useRealTimers());
describe('MCP observation view ownership', () => {
  it('selects only a bounded view and rejects malformed/failed result ownership', () => {
    for (const event of [
      input('camera'),
      input('heads<script>'),
      {
        kind: 'result',
        value: { isError: true, ...(result('heads').value as object) },
      } as HostEvent,
      {
        kind: 'result',
        value: {
          structuredContent: { schemaVersion: 1, view: 'heads', module: { kind: 'heads' } },
        },
      } as HostEvent,
    ])
      expect(eventView(event)).toBeNull();
    expect(eventView(input('heads'))).toBe('heads');
  });
  it('canonical input owns selection and other result notifications never switch controllers', () => {
    const { host, emit, rpc } = setup([input('queue'), result('heads')]);
    expect(host.state()).toEqual({ view: 'queue', failed: false });
    emit(result('thermals'));
    expect(host.state().view).toBe('queue');
    expect(rpc.callTool).not.toHaveBeenCalled();
    host.dispose();
  });
  it('result-first bootstrap accepts matching later input without extra acquisition', () => {
    const { host, emit, rpc } = setup([result('heads')]);
    emit(input('heads'));
    expect(host.state()).toEqual({ view: 'heads', failed: false });
    expect(rpc.callTool).not.toHaveBeenCalled();
    host.dispose();
  });
  it('contradictory late canonical input retires the provisional view and fails closed', () => {
    const { host, emit, rpc } = setup([result('heads')]);
    emit(input('queue'));
    expect(host.state()).toEqual({ view: null, failed: true });
    emit(result('heads'));
    emit(input('heads'));
    expect(host.state()).toEqual({ view: null, failed: true });
    expect(rpc.callTool).not.toHaveBeenCalled();
    host.dispose();
  });
  it('bounds absent delivery and releases the timer/subscription/transport', async () => {
    vi.useFakeTimers();
    const { host, emit, rpc } = setup();
    await vi.advanceTimersByTimeAsync(100);
    expect(host.state()).toEqual({ view: null, failed: true });
    host.dispose();
    emit(input('heads'));
    expect(host.state().view).toBeNull();
    expect(rpc.dispose).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });
});
