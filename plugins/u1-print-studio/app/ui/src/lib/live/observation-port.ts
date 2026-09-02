import type { HostRpc } from '../host/rpc';
export type ObservationPort = {
  start: () => Promise<void>;
  refresh: () => Promise<unknown>;
  subscribe: (listener: (result: unknown) => void) => () => void;
  dispose: () => void;
};
export const observationPort = (rpc: HostRpc, view: 'fans' | 'thermals' | 'heads' | 'queue' | 'jobs'): ObservationPort => ({
  start: rpc.start,
  refresh: () => rpc.callTool('refresh_printer_observation', { view }),
  subscribe: (listener) => rpc.subscribe((event) => { if (event.kind === 'result') listener(event.value); }),
  dispose: rpc.dispose
});
export const resultObservation = (result: unknown): unknown => {
  if (!result || typeof result !== 'object' || Array.isArray(result)) throw new Error('Invalid tool result');
  const envelope = result as Record<string, unknown>;
  if (envelope.isError === true) throw new Error('Observation request failed');
  return envelope.structuredContent ?? result;
};
