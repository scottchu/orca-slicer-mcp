import { adaptFans } from './fans-adapter';
import { resultObservation, type ObservationPort } from './observation-port';
import type { FansPresentation } from './presentation';
export type LiveFansState = { observation: FansPresentation | null; phase: 'loading' | 'ready' | 'error'; refreshing: boolean; feedback: string };

export const createFansController = (port: ObservationPort, timeoutMs = 20_000) => {
  let state: LiveFansState = { observation: null, phase: 'loading', refreshing: false, feedback: '' };
  let disposed = false, started = false, generation = 0;
  let flight: Promise<void> | null = null;
  let deadline: ReturnType<typeof setTimeout> | undefined;
  const listeners = new Set<(state: LiveFansState) => void>();
  const publish = (next: LiveFansState) => { if (!disposed) { state = next; for (const listener of listeners) listener(state); } };
  const failure = () => publish({ ...state, phase: state.observation ? 'ready' : 'error', refreshing: false, feedback: state.observation ? 'Refresh failed · showing previous observation' : 'Could not load Fans & Air' });
  const accept = (result: unknown): boolean => {
    try {
      const observation = adaptFans(resultObservation(result));
      if (disposed) return false;
      if (deadline) clearTimeout(deadline);
      // Arrival/generation orders this mounted session, not process-local version.
      publish({ observation, phase: 'ready', refreshing: false, feedback: '' });
      return true;
    } catch { return false; }
  };
  const unsubscribe = port.subscribe((result) => {
    if (disposed) return;
    if (accept(result)) generation += 1;
    else failure();
  });
  const refresh = (): Promise<void> => {
    if (disposed) return Promise.resolve();
    if (flight) return flight;
    const current = ++generation;
    publish({ ...state, phase: state.observation ? 'ready' : 'loading', refreshing: !!state.observation, feedback: '' });
    flight = port.refresh().then((result) => {
      if (!disposed && current === generation && !accept(result)) failure();
    }).catch(() => { if (!disposed && current === generation) failure(); }).finally(() => { flight = null; });
    return flight;
  };
  return {
    getState: () => state,
    subscribe: (listener: (state: LiveFansState) => void) => { listeners.add(listener); listener(state); return () => { listeners.delete(listener); }; },
    start: () => {
      if (started || disposed) return;
      started = true;
      deadline = setTimeout(() => { if (!state.observation) failure(); }, timeoutMs);
      void port.start().catch(() => { if (!state.observation) failure(); });
    }, refresh,
    dispose: () => {
      if (disposed) return;
      disposed = true; generation += 1;
      if (deadline) clearTimeout(deadline);
      unsubscribe(); listeners.clear(); port.dispose();
    }
  };
};
