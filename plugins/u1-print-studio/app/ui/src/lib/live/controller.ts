import { adaptFans } from './fans-adapter';
import { resultObservation, type ObservationPort } from './observation-port';
import type { FansPresentation } from './presentation';
export type LiveFansState = { observation: FansPresentation | null; phase: 'loading' | 'ready' | 'error'; refreshing: boolean; feedback: string };

type AcquisitionReceipt = { state?: string; reason: string | null };
export type OrderedObservation = { version: number; connectionEpoch: number | null; receivedAt: string; state: string; freshness?: string; receipt?: AcquisitionReceipt; materials?: AcquisitionReceipt; environment?: AcquisitionReceipt };
export type AcquisitionFailure = 'error' | 'unavailable' | 'unsupported';
// Age alone does not invalidate an accepted read. These codes identify an
// actual failed acquisition retained inside an otherwise successful envelope.
const failedReasons = new Set(['unsupported', 'unauthorized', 'http_error', 'timeout', 'network', 'malformed', 'too_large', 'not_configured']);
export const acquisitionFailure = (observation: OrderedObservation): AcquisitionFailure | null => {
  if (observation.state === 'unsupported' || observation.state === 'unavailable') return observation.state;
  if (observation.freshness === 'offline') return 'error';
  for (const receipt of [observation.receipt, observation.materials, observation.environment]) {
    if (receipt?.reason && failedReasons.has(receipt.reason)) return receipt.reason === 'unsupported' ? 'unsupported' : 'error';
  }
  return null;
};
export type LiveState<T> = { observation: T | null; phase: 'loading' | 'ready' | 'error'; refreshing: boolean; feedback: string; failure?: AcquisitionFailure | null };
export const createObservationController = <T extends OrderedObservation>(port: ObservationPort, adapt: (value: unknown) => T, title: string, timeoutMs = 20_000) => {
  let state: LiveState<T> = { observation: null, phase: 'loading', refreshing: false, feedback: '' };
  let disposed = false, started = false, generation = 0;
  let flight: Promise<void> | null = null;
  let deadline: ReturnType<typeof setTimeout> | undefined;
  let latest: T | null = null;
  const listeners = new Set<(state: LiveState<T>) => void>();
  const publish = (next: LiveState<T>) => { if (!disposed) { state = next; for (const listener of listeners) listener(state); } };
  const failure = () => publish({ ...state, phase: state.observation ? 'ready' : 'error', refreshing: false, failure: 'error', feedback: `Could not load ${title}` });
  const accept = (result: unknown, notification = false): 'accepted' | 'duplicate' | 'older' | 'invalid' => {
    try {
      const observation = adapt(resultObservation(result));
      if (disposed) return 'invalid';
      const previous = state.observation;
      const retainedFailure = (observation.state === 'unavailable' || observation.state === 'unsupported') &&
        previous && (previous.state === 'known' || previous.state === 'stale') &&
        observation.connectionEpoch !== null && observation.connectionEpoch === previous.connectionEpoch;
      const failureKind = acquisitionFailure(observation);
      const retainedFeedback = failureKind === 'error' ? `Could not load ${title}` : failureKind ? `${title} ${failureKind === 'unsupported' ? 'endpoint unsupported' : 'unavailable'}` : '';
      if (latest && JSON.stringify(observation) === JSON.stringify(latest)) {
        // A duplicate explicit response confirms only its own state. A failed
        // receipt must not clear the persistent last-success warning.
        if (!notification) publish({ ...state, failure: failureKind, feedback: retainedFeedback });
        return 'duplicate';
      }
      // Server receipt orders events across process-local version resets. A
      // later receipt can legitimately carry version 1 after a restart; a
      // delayed earlier receipt cannot replace newer accepted data.
      if (latest && (observation.receivedAt < latest.receivedAt ||
          (observation.receivedAt === latest.receivedAt && observation.connectionEpoch === latest.connectionEpoch && observation.version < latest.version))) return 'older';
      if (deadline) clearTimeout(deadline);
      latest = observation;
      // Keep display evidence only inside the same known connection epoch.
      // Ordering still advances on failure, so a delayed success cannot revive
      // superseded evidence. A new/unknown epoch never borrows prior data.
      if (retainedFailure) {
        publish({ observation: previous, phase: 'ready', refreshing: notification && !!flight,
          failure: failureKind, feedback: retainedFeedback });
        return 'accepted';
      }
      // Arrival/generation orders this mounted session, not process-local version.
      publish({ observation, phase: 'ready', refreshing: notification && !!flight, failure: failureKind, feedback: retainedFeedback });
      return 'accepted';
    } catch { return 'invalid'; }
  };
  const unsubscribe = port.subscribe((result) => {
    if (disposed) return;
    if (!state.observation && !flight && result && typeof result === 'object' && 'isError' in result && result.isError === true) {
      if (deadline) clearTimeout(deadline);
      failure();
      return;
    }
    if (accept(result, true) === 'accepted') generation += 1;
    // Invalid/wrong-view notifications do not settle another active request.
  });
  const refresh = (): Promise<void> => {
    if (disposed) return Promise.resolve();
    if (flight) return flight;
    const current = ++generation;
    // Pending or rejected older evidence cannot turn a previous failure into
    // apparent success. Only an accepted/confirmed successful result clears it.
    publish({ ...state, phase: state.failure ? 'error' : state.observation ? 'ready' : 'loading', refreshing: !!state.observation || !!state.failure });
    flight = port.refresh().then((result) => {
      // A notification accepted after this request started owns the mounted
      // session even when the older RPC claims a later server receipt/version.
      if (!disposed && current === generation) {
        const accepted = accept(result);
        if (accepted === 'invalid') failure();
        else if (accepted !== 'accepted') publish({ ...state, refreshing: false });
      }
    }).catch(() => { if (!disposed && current === generation) failure(); }).finally(() => {
      // A newer observation suppresses an obsolete request's error, not its
      // completion. Release single-flight before announcing the settled state.
      flight = null;
      if (!disposed && state.refreshing) publish({ ...state, refreshing: false });
    });
    return flight;
  };
  return {
    getState: () => state,
    subscribe: (listener: (state: LiveState<T>) => void) => { listeners.add(listener); listener(state); return () => { listeners.delete(listener); }; },
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
export const createFansController = (port: ObservationPort, timeoutMs = 20_000) => createObservationController(port, adaptFans, 'Fans & Air', timeoutMs);
