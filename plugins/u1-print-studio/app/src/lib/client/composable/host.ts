import type { HostEvent, HostRpc } from '../host/rpc';
import { composableEnvelopeSchema, type ComposableEnvelope } from '../../composable/envelope';
import { canonicalPresentationSha256 } from '../../composable/hash';
import { canonicalizePresentationSpec, type PresentationSpec } from '../../composable/schema';
import type { ComposableViewModel } from '../../composable/view-model';
import { createPlaceholderPresentation } from './presentation';

const record = (value: unknown): Record<string, unknown> | null =>
  value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null;

export const eventComposableEnvelope = (event: HostEvent): ComposableEnvelope | null => {
  if (event.kind !== 'result') return null;
  const result = record(event.value);
  if (result?.isError === true) return null;
  const structured = record(result?.structuredContent);
  const parsed = composableEnvelopeSchema.safeParse(structured);
  return parsed.success ? parsed.data : null;
};

export const eventComposableViewModel = (event: HostEvent): ComposableViewModel | null =>
  eventComposableEnvelope(event)?.viewModel ?? null;

const eventPresentationSpec = (event: HostEvent): PresentationSpec | null => {
  if (event.kind !== 'input') return null;
  const input = record(event.value);
  const args = record(input?.arguments) ?? input;
  try { return canonicalizePresentationSpec(args?.spec); } catch { return null; }
};
const matchesInput = (envelope: ComposableEnvelope, spec: PresentationSpec): boolean =>
  envelope.canonicalSpecSha256 === canonicalPresentationSha256(spec) && JSON.stringify(envelope.canonicalSpec) === JSON.stringify(spec);

type ComposableHostState = { spec: PresentationSpec | null; presentation: ComposableViewModel | null; failed: boolean };
export const createComposableHost = (rpc: HostRpc, timeoutMs = 15_000) => {
  let state: ComposableHostState = { spec: null, presentation: null, failed: false };
  let disposed = false;
  let pendingEnvelope: ComposableEnvelope | null = null;
  const listeners = new Set<(state: ComposableHostState) => void>();
  const publish = (next: ComposableHostState): void => {
    state = next;
    listeners.forEach((listener) => listener(state));
  };
  const failure = (spec: PresentationSpec | null): ComposableViewModel | null => spec ? createPlaceholderPresentation(spec, 'error') : null;
  const deadline = setTimeout(() => { if (!disposed) publish({ ...state, presentation: failure(state.spec), failed: true }); }, timeoutMs);
  const unsubscribe = rpc.subscribe((event) => {
    if (disposed) return;
    if (event.kind === 'input') {
      const spec = eventPresentationSpec(event);
      if (!spec) { clearTimeout(deadline); publish({ spec: null, presentation: null, failed: true }); return; }
      if (pendingEnvelope && !matchesInput(pendingEnvelope, spec)) {
        clearTimeout(deadline); publish({ spec, presentation: failure(spec), failed: true }); return;
      }
      if (pendingEnvelope) clearTimeout(deadline);
      publish({ spec, presentation: pendingEnvelope?.viewModel ?? createPlaceholderPresentation(spec, 'loading'), failed: false });
      return;
    }
    const envelope = eventComposableEnvelope(event);
    if (!envelope) { clearTimeout(deadline); publish({ ...state, presentation: failure(state.spec), failed: true }); return; }
    pendingEnvelope = envelope;
    if (!state.spec) return;
    clearTimeout(deadline);
    publish(matchesInput(envelope, state.spec)
      ? { spec: state.spec, presentation: envelope.viewModel, failed: false }
      : { spec: state.spec, presentation: failure(state.spec), failed: true });
  });
  void rpc.start().catch(() => { if (!disposed) { clearTimeout(deadline); publish({ ...state, presentation: failure(state.spec), failed: true }); } });
  return {
    state: () => state,
    subscribe: (listener: (state: ComposableHostState) => void) => { listeners.add(listener); listener(state); return () => listeners.delete(listener); },
    dispose: () => { disposed = true; clearTimeout(deadline); unsubscribe(); listeners.clear(); rpc.dispose(); },
  };
};
