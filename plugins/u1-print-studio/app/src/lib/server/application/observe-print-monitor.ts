import type { PrinterObservationStore } from '../observation-store.js';
import { assessMonitorRun, terminalEvidence, MONITOR_REQUEST_MS, MONITOR_CAMERA_MAX_BYTES, type MonitorContext, type MonitorEvidence } from './print-monitor-observation.js';

export type MonitorCameraReader = (signal: AbortSignal) => Promise<{ bytes: Uint8Array; observedAt: string }>;
export type MonitorCameraReason = 'not_requested' | 'camera_unavailable' | 'too_large' | 'invalid_image' | 'run_uncertain' | 'run_changed' | null;
export class MonitorCameraError extends Error {
  constructor(readonly reason: 'too_large' | 'invalid_image') { super(reason); }
}
const contexts = new WeakMap<PrinterObservationStore, MonitorContext>();
const emptyTelemetry = () => ({ state: 'unknown' as const, filename: null, percent: null,
  displayProgress: null, storageProgress: null, progressBasis: 'unknown' as const,
  currentLayer: null, totalLayers: null, elapsedSeconds: null, totalDurationSeconds: null,
  estimatedRemainingSeconds: null, estimateBasis: 'unknown' as const,
  storage: { active: null, filePositionBytes: null, fileSizeBytes: null }, tools: [],
  bed: { temperature: null, target: null }, exceptionPresent: null, controllerState: 'unknown' as const, messageCode: null });
const telemetry = (e: MonitorEvidence | null) => {
  if (!e) return emptyTelemetry();
  const progress = e.displayProgress ?? e.storageProgress;
  const remaining = e.state === 'printing' && progress !== null && progress > 0 && e.elapsedSeconds !== null
    ? e.elapsedSeconds * ((1 - progress) / progress) : null;
  // Only public allowlisted evidence fields leave the use case. Never spread e.
  return { state: e.state, filename: e.filename, percent: progress === null ? null : progress * 100,
    displayProgress: e.displayProgress, storageProgress: e.storageProgress,
    progressBasis: e.displayProgress !== null ? 'display' as const : e.storageProgress !== null ? 'storage' as const : 'unknown' as const,
    currentLayer: e.currentLayer, totalLayers: e.totalLayers, elapsedSeconds: e.elapsedSeconds, totalDurationSeconds: e.totalDurationSeconds,
    estimatedRemainingSeconds: remaining !== null && Number.isFinite(remaining) && remaining <= Number.MAX_SAFE_INTEGER ? remaining : null,
    estimateBasis: remaining !== null && Number.isFinite(remaining) && remaining <= Number.MAX_SAFE_INTEGER ? 'elapsed_progress_extrapolation' as const : 'unknown' as const,
    storage: e.storage, tools: e.tools, bed: e.bed, exceptionPresent: e.exceptionPresent, controllerState: e.controllerState, messageCode: e.messageCode };
};

/** One bounded demand, no timer-driven monitoring and no camera/live authority. */
export const observePrintMonitor = async (
  observations: PrinterObservationStore,
  input: { camera: 'omit' | 'snapshot'; expectedRunToken: string | null },
  ports: { readCamera: MonitorCameraReader; issueToken: () => string; now?: () => Date; signal?: AbortSignal; budgetMs?: number },
) => {
  const now = ports.now ?? (() => new Date());
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const abort = () => controller.abort();
  ports.signal?.addEventListener('abort', abort, { once: true });
  if (ports.signal?.aborted) abort();
  const cancelled = new Promise<never>((_, reject) => {
    controller.signal.addEventListener('abort', () => reject(new Error('monitor_unavailable')), { once: true });
    if (controller.signal.aborted) reject(new Error('monitor_unavailable'));
  });
  // This bound applies to the consumer. Shared status acquisition continues
  // within its adapter bounds; cancelling one caller never cancels its peers.
  timer = setTimeout(abort, ports.budgetMs ?? MONITOR_REQUEST_MS);
  try {
    let current: Awaited<ReturnType<PrinterObservationStore['currentMonitor']>> | null = null;
    if (!controller.signal.aborted) {
      try { current = await Promise.race([observations.currentMonitor(), cancelled]); } catch { /* typed unavailable below */ }
    }
    const evidence = current?.evidence ?? null;
    const freshness = current ? observations.monitorFreshness() : 'unknown';
    const fresh = freshness === 'fresh' && !!evidence && Date.parse(evidence.receivedAt) <= now().valueOf();
    const context = contexts.get(observations) ?? null;
    let assessed = assessMonitorRun(evidence, fresh, current?.snapshot.connectionEpoch ?? null, input.expectedRunToken, context, now().valueOf(), ports.issueToken);
    // A cancelled/timed-out consumer cannot invalidate a peer's shared binding
    // while that peer is still awaiting the same bounded status acquisition.
    if (!controller.signal.aborted && assessed.context) contexts.set(observations, assessed.context);
    const camera: { state: 'omitted' | 'available' | 'unavailable' | 'withheld'; observedAt: string | null; byteLength: number; mediaType: 'image/jpeg' | null;
      reason: MonitorCameraReason; association: 'same_request_time_window' | 'unverified'; visualAssessment: 'not_performed' } = {
      state: 'omitted', observedAt: null, byteLength: 0, mediaType: null, reason: 'not_requested', association: 'unverified', visualAssessment: 'not_performed',
    };
    let image: Uint8Array | null = null;
    if (input.camera === 'snapshot') {
      const uncertain = !fresh || (input.expectedRunToken !== null && assessed.run.match !== 'observed_continuity');
      if (uncertain) Object.assign(camera, { state: 'withheld', reason: assessed.run.match === 'changed' ? 'run_changed' : 'run_uncertain' });
      else {
        const before = observations.monitorIdentity();
        try {
          const frame = await Promise.race([ports.readCamera(controller.signal), cancelled]);
          if (frame.bytes.byteLength > MONITOR_CAMERA_MAX_BYTES) throw new MonitorCameraError('too_large');
          if (frame.bytes.byteLength === 0 || !Number.isFinite(Date.parse(frame.observedAt))) throw new MonitorCameraError('invalid_image');
          const after = observations.monitorIdentity();
          if (before.receivedAt !== after.receivedAt || before.epoch !== after.epoch || before.jobKey !== after.jobKey ||
              (assessed.run.token !== null && contexts.get(observations)?.token !== assessed.run.token)) {
            Object.assign(camera, { state: 'withheld', reason: 'run_uncertain' });
          } else {
            image = frame.bytes;
            Object.assign(camera, { state: 'available', observedAt: frame.observedAt, byteLength: frame.bytes.byteLength,
              mediaType: 'image/jpeg', reason: null, association: 'same_request_time_window' });
          }
        } catch (error) {
          Object.assign(camera, { state: 'unavailable', reason: error instanceof MonitorCameraError ? error.reason : 'camera_unavailable' });
        }
      }
    }
    // Camera acquisition is not atomic with telemetry and may cross the TTL.
    // Reassess only the stored receipt at response time; never issue a second read.
    const responseFreshness = observations.monitorFreshness();
    const finalIdentity = observations.monitorIdentity();
    const receiptUnchanged = finalIdentity.receivedAt === evidence?.receivedAt && finalIdentity.epoch === current?.snapshot.connectionEpoch;
    const responseFresh = fresh && responseFreshness === 'fresh' && receiptUnchanged;
    if (!responseFresh && assessed.run.token !== null) {
      const retained = contexts.get(observations);
      if (!controller.signal.aborted && retained === assessed.context && retained?.token === assessed.run.token) contexts.set(observations, { ...retained, invalidated: true });
      assessed = { ...assessed, run: { ...assessed.run, token: null, match: 'uncertain', reason: 'missing_evidence', identityBasis: 'unknown' } };
      if (camera.state === 'available') {
        image = null;
        Object.assign(camera, { state: 'withheld', reason: 'run_uncertain', observedAt: null, byteLength: 0, mediaType: null, association: 'unverified' });
      }
    }
    const snapshot = {
      schemaVersion: 1 as const,
      receipt: { observationVersion: current?.snapshot.observationVersion ?? 0, observedAt: evidence?.receivedAt ?? null, checkedAt: now().toISOString(),
        freshness: evidence ? receiptUnchanged ? responseFreshness : 'stale' as const : current?.snapshot.status.reachable === false ? 'offline' as const : 'unknown' as const,
        acquisition: current?.acquisition ?? 'cached' as const, completeness: evidence?.completeness ?? 'unavailable' as const,
        timestampBasis: 'connector_receipt' as const, sourceEventTimeSeconds: evidence?.sourceEventTimeSeconds ?? null,
        connectionEpoch: current?.snapshot.connectionEpoch ?? null },
      run: assessed.run, telemetry: telemetry(evidence), terminal: terminalEvidence(evidence, responseFresh), camera,
      retry: { retryable: !responseFresh || camera.state === 'unavailable', notBefore: !responseFresh ? new Date(now().valueOf() + 15_000).toISOString() : null,
        reason: !responseFresh ? 'telemetry_unavailable' as const : camera.state === 'unavailable' ? 'camera_unavailable' as const : null },
    };
    return { snapshot, image, isError: evidence === null };
  } finally {
    if (timer) clearTimeout(timer);
    ports.signal?.removeEventListener('abort', abort);
    controller.abort();
    // Promise.race installs handlers; cancellation never creates an unhandled rejection.
    void cancelled.catch(() => {});
  }
};
