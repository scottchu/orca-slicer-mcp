import type { ObservationPort } from './observation-port';

export const httpObservationPort = (
  view: 'fans' | 'thermals' | 'heads' | 'queue',
  request: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response> = (...args) => fetch(...args)
): ObservationPort => {
  const requests = new Set<AbortController>();
  const listeners = new Set<(result: unknown) => void>();
  let disposed = false;
  let started: Promise<void> | undefined;
  const refresh = async (): Promise<unknown> => {
    if (disposed) throw new Error('Observation port disposed');
    const abort = new AbortController();
    requests.add(abort);
    try {
      const response = await request('/dashboard/tools/call', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: 'refresh_printer_observation', arguments: { view } }), signal: abort.signal
      });
      if (!response.ok) throw new Error('Observation request failed');
      return await response.json();
    } finally { requests.delete(abort); }
  };
  return {
    // The host RPC port receives its initial result from the host. HTTP owns
    // that initial request and publishes it through the same subscription port.
    start: () => started ??= refresh().then((result) => { if (!disposed) for (const listener of listeners) listener(result); }),
    subscribe: (listener) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    refresh,
    dispose: () => {
      disposed = true; listeners.clear();
      for (const request of requests) request.abort(); requests.clear();
    }
  };
};
