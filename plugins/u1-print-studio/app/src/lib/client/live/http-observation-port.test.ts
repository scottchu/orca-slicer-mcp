import { afterEach, describe, expect, it, vi } from 'vitest';
import { httpObservationPort } from './http-observation-port';
import { createObservationController } from './controller';

afterEach(() => { vi.useRealTimers(); });

describe('HTTP observation port lifecycle', () => {
  it('stays idle until start and publishes one initial result across repeated starts', async () => {
    const fetcher = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => new Response(JSON.stringify({ structuredContent: { view: 'fans' } })));
    const port = httpObservationPort('fans', fetcher);
    const listener = vi.fn();
    port.subscribe(listener);
    expect(fetcher).not.toHaveBeenCalled();
    await Promise.all([port.start(), port.start()]);
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(fetcher.mock.calls[0]?.[0]).toBe('/dashboard/tools/call');
    await port.refresh();
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(listener).toHaveBeenCalledTimes(1);
    port.dispose();
  });

  it('disposal aborts only its own requests and ignores a late initial result', async () => {
    const pending: { resolve: (response: Response) => void; signal: AbortSignal }[] = [];
    const fetcher = vi.fn((_input: RequestInfo | URL, init?: RequestInit) => new Promise<Response>((resolve) => pending.push({ resolve, signal: init!.signal! })));
    const first = httpObservationPort('fans', fetcher);
    const second = httpObservationPort('fans', fetcher);
    const listener = vi.fn(); first.subscribe(listener);
    const firstStart = first.start(); const secondStart = second.start();
    const rejected = expect(firstStart).rejects.toThrow('aborted');
    first.dispose();
    expect(pending[0].signal.aborted).toBe(true);
    expect(pending[1].signal.aborted).toBe(false);
    for (const item of pending) item.resolve(new Response('{}'));
    await Promise.all([rejected, secondStart]);
    expect(listener).not.toHaveBeenCalled();
    second.dispose();
  });

  it.each(['fetch', 'body'] as const)('bounds a stalled %s, releases refresh for retry, and ignores late completion', async (stage) => {
    vi.useFakeTimers();
    const initial = { version: 1, connectionEpoch: 1, receivedAt: '2026-09-05T12:00:00Z', state: 'known' };
    const recovered = { ...initial, version: 2, receivedAt: '2026-09-05T12:00:02Z' };
    let release: () => void = () => {};
    let stalledSignal: AbortSignal | undefined;
    const request = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      if (request.mock.calls.length === 1) return new Response(JSON.stringify(initial));
      if (request.mock.calls.length === 2) {
        stalledSignal = init!.signal!;
        if (stage === 'fetch') return await new Promise<Response>((resolve) => { release = () => resolve(new Response(JSON.stringify(initial))); });
        return { ok: true, json: () => new Promise((resolve) => { release = () => resolve(initial); }) } as Response;
      }
      return new Response(JSON.stringify(recovered));
    });
    const port = httpObservationPort('fans', request, 50);
    const controller = createObservationController(port, (value) => value as typeof initial, 'Fans');
    try {
      controller.start(); await vi.advanceTimersByTimeAsync(0);
      expect(controller.getState().observation).toEqual(initial);
      const refresh = controller.refresh();
      expect(controller.refresh()).toBe(refresh);
      await vi.advanceTimersByTimeAsync(50); await refresh;
      expect(stalledSignal?.aborted).toBe(true);
      expect(controller.getState()).toMatchObject({ refreshing: false, failure: 'error' });
      await controller.refresh();
      expect(controller.getState()).toMatchObject({ refreshing: false, failure: null, observation: recovered });
      release();
      await vi.advanceTimersByTimeAsync(0);
      expect(controller.getState().observation).toEqual(recovered);
      expect(vi.getTimerCount()).toBe(0);
    } finally { controller.dispose(); }
  });
});
