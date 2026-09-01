import type { Evidence, Provenance } from './presentation.js';
export const record = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid observation');
  return value as Record<string, unknown>;
};
export const exact = (value: Record<string, unknown>, keys: string[]) => {
  if (Object.keys(value).sort().join('|') !== [...keys].sort().join('|')) throw new Error('Invalid observation fields');
};
export const choice = <T extends string>(value: unknown, options: readonly T[]): T => {
  if (typeof value !== 'string' || !options.includes(value as T)) throw new Error('Invalid observation choice');
  return value as T;
};
export const number = (value: unknown, max: number, min = 0): number => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) throw new Error('Invalid observation number');
  return value;
};
export const time = (value: unknown): string | null => {
  if (value === null) return null;
  if (typeof value !== 'string' || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString() !== value) throw new Error('Invalid observation time');
  return value;
};
export const flag = (value: unknown): boolean => {
  if (typeof value !== 'boolean') throw new Error('Invalid observation flag');
  return value;
};
export const capability = (value: unknown) => choice(value, ['observed', 'advertised', 'unsupported', 'unknown'] as const);
export const string = (value: unknown, max = 512): string => {
  if (typeof value !== 'string' || value.length > max) throw new Error('Invalid observation text');
  return value;
};
export const evidence = (value: unknown): Evidence => choice(value, ['known', 'unknown', 'unavailable', 'unsupported', 'stale']);
export const reason = (value: unknown) => value === null ? null : choice(value, ['not_requested', 'unsupported', 'unauthorized', 'http_error', 'timeout', 'network', 'malformed', 'too_large', 'not_configured']);
export const provenance = (value: unknown): Provenance => {
  const data = record(value); exact(data, ['source', 'sourceObservedAt', 'detail']);
  return { source: choice(data.source, ['moonraker', 'derived', 'not_observed']), sourceObservedAt: time(data.sourceObservedAt), detail: string(data.detail) };
};
export const observationEnvelope = (value: unknown, view: 'fans' | 'thermals' | 'queue') => {
  const envelope = record(value);
  exact(envelope, ['schemaVersion', 'view', 'observationVersion', 'sourceObservedAt', 'receivedAt', 'freshness', 'connectionEpoch', 'reachable', 'printerState', 'printerStateLabel', 'refreshAfterSeconds', 'session', 'module']);
  if (envelope.schemaVersion !== 2 || envelope.view !== view) throw new Error('Wrong observation view');
  const version = number(envelope.observationVersion, Number.MAX_SAFE_INTEGER);
  const connectionEpoch = envelope.connectionEpoch === null ? null : number(envelope.connectionEpoch, Number.MAX_SAFE_INTEGER);
  if (!Number.isInteger(version) || (connectionEpoch !== null && !Number.isInteger(connectionEpoch))) throw new Error('Invalid observation version');
  const reachable = flag(envelope.reachable);
  string(envelope.printerState); string(envelope.printerStateLabel); number(envelope.refreshAfterSeconds, 3600);
  const session = record(envelope.session); exact(session, ['identity', 'provenance', 'detail']);
  if (session.identity !== null) throw new Error('Invalid observation session');
  choice(session.provenance, ['external', 'unknown']); string(session.detail);
  const receivedAt = time(envelope.receivedAt);
  if (receivedAt === null) throw new Error('Missing receipt');
  return { envelope, version, connectionEpoch, reachable, receivedAt, sourceObservedAt: time(envelope.sourceObservedAt), freshness: choice(envelope.freshness, ['fresh', 'stale', 'offline', 'unknown'] as const) };
};
