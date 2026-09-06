import type { ObservationPort } from './observation-port';

// Match the observation controller's initial acquisition bound; this also owns
// refresh and response-body time, independently of the host RPC transport.
export const HTTP_OBSERVATION_TIMEOUT_MS = 20_000;

export const httpObservationPort = (
  view: 'fans' | 'thermals' | 'heads' | 'queue',
  request: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response> = (...args) => fetch(...args),
  timeoutMs = HTTP_OBSERVATION_TIMEOUT_MS,
): ObservationPort => {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) throw new Error('Invalid observation deadline');
  const requests = new Set<AbortController>();
  const listeners = new Set<(result: unknown) => void>();
  let disposed = false;
  let started: Promise<void> | undefined;
  const refresh = async (): Promise<unknown> => {
    if (disposed) throw new Error('Observation port disposed');
    const abort = new AbortController();
    requests.add(abort);
    let rejectAborted: () => void = () => {};
    const aborted = new Promise<never>((_resolve, reject) => {
      rejectAborted = () => reject(new Error('Observation request aborted'));
      abort.signal.addEventListener('abort', rejectAborted, { once: true });
    });
    const deadline = setTimeout(() => abort.abort(), timeoutMs);
    try {
      const acquisition = async () => {
        const response = await request('/dashboard/tools/call', {
          method: 'POST', headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ name: 'refresh_printer_observation', arguments: { view } }), signal: abort.signal
        });
        if (abort.signal.aborted) throw new Error('Observation request aborted');
        if (!response.ok) throw new Error('Observation request failed');
        const result: unknown = await response.json();
        if (abort.signal.aborted) throw new Error('Observation request aborted');
        return result;
      };
      // Abort the owned transport as well as settling the caller even when an
      // injected/nonconforming fetch ignores AbortSignal. Late data stays inert.
      return await Promise.race([acquisition(), aborted]);
    } finally {
      clearTimeout(deadline);
      abort.signal.removeEventListener('abort', rejectAborted);
      requests.delete(abort);
    }
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
