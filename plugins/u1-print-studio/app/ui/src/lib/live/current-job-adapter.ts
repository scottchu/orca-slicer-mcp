import { CURRENT_JOB_STATES, type CurrentJobPresentation, type ReportedValue } from './presentation.js';
import { capability, choice, evidence, exact, flag, number, observationEnvelope, provenance, reason, record, string, time } from './validation.js';

const reported = <T>(input: unknown, parse: (value: unknown) => T, nullable = false): ReportedValue<T> => {
  const field = record(input);
  exact(field, ['reported', 'value']);
  const isReported = flag(field.reported);
  if (!isReported) {
    if (field.value !== null) throw new Error('Unreported Current Job value');
    return { reported: false, value: null };
  }
  if (field.value === null) {
    if (!nullable) throw new Error('Missing reported Current Job value');
    return { reported: true, value: null };
  }
  return { reported: true, value: parse(field.value) };
};

const safeFilename = (value: unknown): string => {
  // The producer bounds display names by Unicode code points, not UTF-16 code
  // units. 320 code units is the maximum representation of 160 code points.
  const filename = string(value, 320);
  if (Array.from(filename).length > 160 || !filename.trim() || filename !== filename.trim() || filename === '.' || filename === '..' ||
      /[\\/\p{Cc}\p{Cf}\p{Zl}\p{Zp}]/u.test(filename) ||
      !/^[\p{L}\p{M}\p{N} ._()+-]+$/u.test(filename) ||
      /(?:^|[^a-z0-9])(?:gh[pousr]_[a-z0-9]{16,255}|github_pat_[a-z0-9_]{16,255}|glpat-[a-z0-9_-]{16,255}|xox[baprs]-[a-z0-9-]{16,255}|(?:AKIA|ASIA)[a-z0-9]{16})/i.test(filename) ||
      /\b(?:bearer|basic)\s+|\b(?:api[-_ ]?key|(?:access|refresh)[-_ ]?token|password|secret|credential)[ _.-]+\S|\bsk-(?:proj-)?[a-z0-9_-]{8,}|\beyJ[a-z0-9_-]+\.[a-z0-9_-]+\.[a-z0-9_-]+/i.test(filename)) {
    throw new Error('Invalid Current Job filename');
  }
  return filename;
};

const metric = (input: unknown, integer = false): ReportedValue<number> => reported(input, (value) => {
  const parsed = number(value, Number.MAX_SAFE_INTEGER);
  if (integer && !Number.isSafeInteger(parsed)) throw new Error('Invalid Current Job byte count');
  return parsed;
});

/** Accept the privacy-minimized real Current Job projection, never lab data or raw Moonraker values. */
export const adaptCurrentJob = (input: unknown): CurrentJobPresentation => {
  const { envelope, ...base } = observationEnvelope(input, 'jobs');
  const module = record(envelope.module);
  exact(module, ['kind', 'state', 'freshness', 'sourceObservedAt', 'receivedAt', 'checkedAt', 'printState', 'filename', 'storageActive', 'filePositionBytes', 'fileSizeBytes', 'totalDurationSeconds', 'printDurationSeconds', 'filamentUsedMillimeters', 'reason', 'capabilityEvidence', 'provenance']);
  if (module.kind !== 'jobs') throw new Error('Wrong Current Job module');
  return {
    ...base, kind: 'jobs', sourceObservedAt: time(envelope.sourceObservedAt),
    freshness: choice(envelope.freshness, ['fresh', 'stale', 'offline', 'unknown']),
    state: evidence(module.state), capability: capability(module.capabilityEvidence), provenance: provenance(module.provenance),
    receipt: {
      sourceObservedAt: time(module.sourceObservedAt), receivedAt: time(module.receivedAt), checkedAt: time(module.checkedAt),
      freshness: choice(module.freshness, ['fresh', 'stale', 'unknown']), reason: reason(module.reason),
    },
    printState: reported(module.printState, (value) => choice(value, CURRENT_JOB_STATES)),
    filename: reported(module.filename, safeFilename, true), storageActive: reported(module.storageActive, flag),
    filePositionBytes: metric(module.filePositionBytes, true), fileSizeBytes: metric(module.fileSizeBytes, true),
    totalDurationSeconds: metric(module.totalDurationSeconds), printDurationSeconds: metric(module.printDurationSeconds),
    filamentUsedMillimeters: metric(module.filamentUsedMillimeters),
  };
};
