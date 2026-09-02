import { describe, expect, it, vi } from 'vitest';
import { httpObservationPort } from './http-observation-port';

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
    first.dispose();
    expect(pending[0].signal.aborted).toBe(true);
    expect(pending[1].signal.aborted).toBe(false);
    for (const item of pending) item.resolve(new Response('{}'));
    await Promise.all([firstStart, secondStart]);
    expect(listener).not.toHaveBeenCalled();
    second.dispose();
  });
});
