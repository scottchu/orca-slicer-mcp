/** Presence-aware evidence from one status query. exactJobKey is server-only. */
export type MonitorEvidence = {
  receivedAt: string;
  sourceEventTimeSeconds: number | null;
  completeness: 'complete' | 'partial';
  exactJobKey: string | null;
  state: 'standby' | 'printing' | 'paused' | 'complete' | 'error' | 'cancelled' | 'unknown';
  filename: string | null;
  displayProgress: number | null;
  storageProgress: number | null;
  currentLayer: number | null;
  totalLayers: number | null;
  elapsedSeconds: number | null;
  totalDurationSeconds: number | null;
  storage: { active: boolean | null; filePositionBytes: number | null; fileSizeBytes: number | null };
  tools: Array<{ physicalTool: number; temperature: number | null; target: number | null; state: 'ACTIVE' | 'PARKED' | 'HEATING' | 'COOLING' | 'STANDBY' | 'IDLE' | 'UNKNOWN' | null; active: boolean | null }>;
  bed: { temperature: number | null; target: number | null };
  exceptionPresent: boolean | null;
  controllerState: 'ready' | 'shutdown' | 'error' | 'unknown';
  messageCode: 'printer_message' | 'printer_exception' | 'controller_error' | null;
};
export type MonitorCheck = 'pass' | 'fail' | 'unknown';
export type MonitorRun = {
  token: string | null;
  match: 'initial' | 'observed_continuity' | 'changed' | 'uncertain' | 'unbound';
  reason: 'initial_observation' | 'consistent_samples' | 'token_unknown' | 'connection_changed' | 'observation_gap' | 'job_changed' | 'progress_reset' | 'missing_evidence' | 'no_active_run' | 'source_clock_reset';
  identityBasis: 'observational' | 'unknown';
  printerRunIdentityAvailable: false;
  provenance: 'external' | 'unknown';
  artifactHash: null;
};
export type MonitorContext = { token: string; jobKey: string; epoch: number; evidence: MonitorEvidence; invalidated: boolean };
export const MONITOR_CONTINUITY_MS = 12 * 60 * 1000;
export const MONITOR_CAMERA_MAX_BYTES = 1024 * 1024;
export const MONITOR_REQUEST_MS = 20_000;

const check = (value: boolean | null): MonitorCheck => value === null ? 'unknown' : value ? 'pass' : 'fail';
const everyKnown = (values: Array<boolean | null>): boolean | null => values.includes(false) ? false : values.includes(null) ? null : values.every(Boolean);

export const terminalEvidence = (e: MonitorEvidence | null, fresh: boolean) => {
  const reportedState = e && ['complete', 'error', 'cancelled'].includes(e.state) ? e.state as 'complete' | 'error' | 'cancelled' : null;
  const bytes = e?.storage;
  const checks = {
    fresh: check(e ? fresh : null),
    executionInactive: check(bytes?.active === undefined || bytes.active === null ? null : !bytes.active),
    fileFullyConsumed: check(!bytes || bytes.fileSizeBytes === null || bytes.filePositionBytes === null || bytes.fileSizeBytes <= 0 ? null : bytes.filePositionBytes === bytes.fileSizeBytes),
    noException: check(e?.exceptionPresent === null || !e ? null : !e.exceptionPresent),
    controllerReady: check(!e || e.controllerState === 'unknown' ? null : e.controllerState === 'ready'),
    toolsParked: check(!e || e.tools.length !== 4 ? null : everyKnown(e.tools.map(t => !t.state || t.state === 'UNKNOWN' ? null : t.state === 'PARKED'))),
    heaterTargetsZero: check(!e || e.tools.length !== 4 ? null : everyKnown([...e.tools.map(t => t.target === null ? null : t.target === 0), e.bed.target === null ? null : e.bed.target === 0])),
  };
  const assessment = !e || !fresh ? 'unknown' : !reportedState ? 'not_terminal' :
    reportedState === 'complete' ? e.completeness === 'complete' && Object.values(checks).every(c => c === 'pass') ? 'reported_consistent' : 'reported_pending_checks' :
    checks.executionInactive === 'pass' ? 'reported_consistent' : 'reported_pending_checks';
  return { reportedState, assessment, boundRunVerified: false as const, checks };
};

/** A token detects observed discontinuity; it cannot prove printer-native identity. */
export const assessMonitorRun = (
  e: MonitorEvidence | null, fresh: boolean, epoch: number | null, expected: string | null,
  context: MonitorContext | null, now: number, issueToken: () => string,
): { run: MonitorRun; context: MonitorContext | null } => {
  const output = (match: MonitorRun['match'], reason: MonitorRun['reason'], token: string | null = null): MonitorRun => ({
    token, match, reason, identityBasis: token ? 'observational' : 'unknown', printerRunIdentityAvailable: false,
    provenance: e?.filename ? 'external' : 'unknown', artifactHash: null,
  });
  const usable = e && fresh && e.completeness === 'complete' && e.exactJobKey && epoch !== null &&
    e.elapsedSeconds !== null && (e.storage.filePositionBytes !== null || e.currentLayer !== null);
  if (expected !== null) {
    const stop = (match: 'changed' | 'uncertain', reason: MonitorRun['reason']) => ({
      run: output(match, reason), context: context && expected === context.token ? { ...context, invalidated: true } : context,
    });
    if (!context || expected !== context.token) return stop('uncertain', 'token_unknown');
    if (context.invalidated) return stop('uncertain', 'missing_evidence');
    if (epoch !== context.epoch) return stop('uncertain', 'connection_changed');
    if (now - Date.parse(context.evidence.receivedAt) > MONITOR_CONTINUITY_MS) return stop('uncertain', 'observation_gap');
    if (!usable) return stop('uncertain', 'missing_evidence');
    if (e.exactJobKey !== context.jobKey || e.state === 'standby') return stop('changed', 'job_changed');
    if (e.sourceEventTimeSeconds !== null && context.evidence.sourceEventTimeSeconds !== null &&
        e.sourceEventTimeSeconds < context.evidence.sourceEventTimeSeconds) return stop('uncertain', 'source_clock_reset');
    const pairs = [[e.elapsedSeconds, context.evidence.elapsedSeconds], [e.totalDurationSeconds, context.evidence.totalDurationSeconds],
      [e.storage.filePositionBytes, context.evidence.storage.filePositionBytes], [e.currentLayer, context.evidence.currentLayer]];
    if (pairs.some(([next, last]) => next !== null && last !== null && next < last)) return stop('changed', 'progress_reset');
    if (Date.parse(e.receivedAt) < Date.parse(context.evidence.receivedAt)) return stop('uncertain', 'missing_evidence');
    return { run: output('observed_continuity', 'consistent_samples', context.token), context: { ...context, evidence: e } };
  }
  if (!usable) return { run: output('unbound', 'missing_evidence'), context };
  if (e.state !== 'printing' && e.state !== 'paused') return { run: output('unbound', 'no_active_run'), context };
  // Initial inspections reuse a still-consistent token, so concurrent model
  // callers do not rotate each other's observational context.
  if (context && !context.invalidated) {
    const repeated = assessMonitorRun(e, fresh, epoch, context.token, context, now, issueToken);
    if (repeated.run.match === 'observed_continuity') return { ...repeated, run: { ...repeated.run, match: 'initial', reason: 'initial_observation' } };
  }
  const next: MonitorContext = { token: issueToken(), jobKey: e.exactJobKey!, epoch: epoch!, evidence: e, invalidated: false };
  return { run: output('initial', 'initial_observation', next.token), context: next };
};
