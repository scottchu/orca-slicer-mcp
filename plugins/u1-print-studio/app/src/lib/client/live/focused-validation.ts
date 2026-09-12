import { capability, choice, evidence, exact, flag, number, observationEnvelope, provenance, reason, record, string, time } from './validation';
import type { LiveObservationView } from './observation-port';
import type { Field, FocusedBase, Receipt, Reported } from './focused-presentation';
export const printStates = ['standby', 'printing', 'paused', 'complete', 'error', 'cancelled', 'unknown'] as const;
export const nullable = <T>(value: unknown, parse: (value: unknown) => T): T | null => value === null ? null : parse(value);
export const nonnegative = (value: unknown) => number(value, Number.MAX_VALUE);
export const integer = (value: unknown, max = Number.MAX_SAFE_INTEGER) => { const parsed = number(value, max); if (!Number.isInteger(parsed)) throw new Error('Invalid observation integer'); return parsed; };
export const basename = (value: unknown): string => {
  if (typeof value !== 'string' || !value.trim() || Array.from(value).length > 160 || value === '.' || value === '..' ||
      !/^[\p{L}\p{M}\p{N} ._()+-]+$/u.test(value) ||
      /(?:^|[^a-z0-9])(?:gh[pousr]_[a-z0-9]{16,255}|github_pat_[a-z0-9_]{16,255}|glpat-[a-z0-9_-]{16,255}|xox[baprs]-[a-z0-9-]{16,255}|(?:AKIA|ASIA)[a-z0-9]{16})/i.test(value) ||
      /\b(?:bearer|basic)\s+|\b(?:api[-_ ]?key|(?:access|refresh)[-_ ]?token|password|secret|credential)[ _.-]+\S|\bsk-(?:proj-)?[a-z0-9_-]{8,}|\beyJ[a-z0-9_-]+\.[a-z0-9_-]+\.[a-z0-9_-]+/i.test(value)) throw new Error('Invalid public filename');
  return value;
};
export const focusedBase = (value: unknown, view: LiveObservationView) => {
  const { envelope, ...metadata } = observationEnvelope(value, view);
  const module = record(envelope.module);
  if (module.kind !== view) throw new Error('Wrong observation module');
  const base: FocusedBase = { ...metadata, printerState: string(envelope.printerState), state: evidence(module.state), capability: capability(module.capabilityEvidence), provenance: provenance(module.provenance) };
  return { module, base };
};
export const field = <T>(value: unknown, parse: (value: unknown) => T): Field<T> => {
  const data = record(value); exact(data, ['state', 'value']);
  const state = evidence(data.state), parsed = nullable(data.value, parse);
  if ((state === 'known' || state === 'stale') !== (parsed !== null)) throw new Error('Invalid field evidence');
  return { state, value: parsed };
};
export const reported = <T>(value: unknown, parse: (value: unknown) => T): Reported<T> => {
  const data = record(value); exact(data, ['reported', 'value']);
  const isReported = flag(data.reported), parsed = nullable(data.value, parse);
  if (!isReported && parsed !== null) throw new Error('Unreported value');
  return { reported: isReported, value: parsed };
};
export const domainReceipt = (module: Record<string, unknown>, base: FocusedBase): Receipt => {
  const result: Receipt = { state: base.state, sourceObservedAt: time(module.sourceObservedAt), receivedAt: time(module.receivedAt), checkedAt: time(module.checkedAt), freshness: choice(module.freshness, ['fresh', 'stale', 'unknown']), reason: reason(module.reason) };
  const observed = base.state === 'known' || base.state === 'stale';
  if (observed) {
    if (!result.sourceObservedAt || !result.receivedAt || !result.checkedAt || result.freshness !== (base.state === 'known' ? 'fresh' : 'stale') || base.capability !== 'observed' || base.provenance.source !== 'moonraker' || (base.state === 'known' && result.reason !== null)) throw new Error('Invalid domain receipt');
  } else if (result.sourceObservedAt !== null || result.receivedAt !== null || result.freshness !== 'unknown' || base.capability !== (base.state === 'unsupported' ? 'unsupported' : 'unknown') || base.provenance.source !== 'not_observed') throw new Error('Invalid absent domain');
  if (base.provenance.sourceObservedAt !== result.sourceObservedAt || (base.state === 'unsupported' && result.reason !== 'unsupported') || (base.state === 'unknown' && result.reason !== 'not_requested')) throw new Error('Invalid domain provenance');
  return result;
};
export const domainKeys = ['kind', 'state', 'freshness', 'sourceObservedAt', 'receivedAt', 'checkedAt', 'reason', 'capabilityEvidence', 'provenance'];
