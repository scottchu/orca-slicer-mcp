import type { HostEvent, HostRpc } from '../host/rpc';

export const observationViews = [
  'overview',
  'progress',
  'thermals',
  'heads',
  'jobs',
  'job_history',
  'queue',
  'fans',
  'bed_mesh',
] as const;
export type ObservationView = (typeof observationViews)[number];
export type ObservationHostState = { view: ObservationView | null; failed: boolean };
const record = (value: unknown): Record<string, unknown> | null =>
  value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
const view = (value: unknown): ObservationView | null =>
  observationViews.includes(value as ObservationView) ? (value as ObservationView) : null;
export const eventView = (event: HostEvent): ObservationView | null => {
  const value = record(event.value);
  if (event.kind === 'input') return view(record(value?.arguments)?.view ?? value?.view);
  if (value?.isError === true) return null;
  const content = record(value?.structuredContent);
  return content?.schemaVersion === 2 && record(content.module)?.kind === content.view
    ? view(content.view)
    : null;
};

/** Choose once from bounded host data. The selected controller owns its data. */
export const createObservationHost = (rpc: HostRpc, timeoutMs = 15_000) => {
  let state: ObservationHostState = { view: null, failed: false };
  let disposed = false;
  let conflicted = false;
  const listeners = new Set<(state: ObservationHostState) => void>();
  const publish = (next: ObservationHostState) => {
    state = next;
    listeners.forEach((listener) => listener(state));
  };
  const deadline = setTimeout(() => {
    if (!disposed && !state.view) publish({ view: null, failed: true });
  }, timeoutMs);
  const unsubscribe = rpc.subscribe((event) => {
    if (disposed || conflicted) return;
    const selected = eventView(event);
    if (state.view) {
      if (event.kind === 'input' && selected && selected !== state.view) {
        conflicted = true;
        publish({ view: null, failed: true });
      }
      return;
    }
    if (selected) {
      clearTimeout(deadline);
      publish({ view: selected, failed: false });
    }
  });
  void rpc.start().catch(() => {
    if (!disposed && !state.view) publish({ view: null, failed: true });
  });
  return {
    state: () => state,
    subscribe: (listener: (state: ObservationHostState) => void) => {
      listeners.add(listener);
      listener(state);
      return () => {
        listeners.delete(listener);
      };
    },
    dispose: () => {
      disposed = true;
      clearTimeout(deadline);
      unsubscribe();
      listeners.clear();
      rpc.dispose();
    },
  };
};
