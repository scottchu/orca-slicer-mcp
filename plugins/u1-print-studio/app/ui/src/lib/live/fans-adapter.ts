import { FAN_IDS, type FansPresentation } from './presentation';
type RecordValue = Record<string, unknown>;
const record = (value: unknown): RecordValue => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid observation');
  return value as RecordValue;
};
const exact = (value: RecordValue, keys: string[]) => {
  if (Object.keys(value).sort().join('|') !== [...keys].sort().join('|')) throw new Error('Invalid observation fields');
};
const choice = <T extends string>(value: unknown, options: readonly T[]): T => {
  if (typeof value !== 'string' || !options.includes(value as T)) throw new Error('Invalid observation choice');
  return value as T;
};
const number = (value: unknown, max: number): number => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > max) throw new Error('Invalid observation number');
  return value;
};
const time = (value: unknown): string | null => {
  if (value === null) return null;
  if (typeof value !== 'string' || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString() !== value) throw new Error('Invalid observation time');
  return value;
};
const flag = (value: unknown): boolean => {
  if (typeof value !== 'boolean') throw new Error('Invalid observation flag');
  return value;
};
const capability = (value: unknown) => choice(value, ['observed', 'advertised', 'unsupported', 'unknown'] as const);
const string = (value: unknown, max = 512): string => {
  if (typeof value !== 'string' || value.length > max) throw new Error('Invalid observation text');
  return value;
};

/** Accept the existing server projection, not lab objects or raw device data. */
export const adaptFans = (value: unknown): FansPresentation => {
  const envelope = record(value);
  exact(envelope, ['schemaVersion', 'view', 'observationVersion', 'sourceObservedAt', 'receivedAt', 'freshness', 'connectionEpoch', 'reachable', 'printerState', 'printerStateLabel', 'refreshAfterSeconds', 'session', 'module']);
  if (envelope.schemaVersion !== 2 || envelope.view !== 'fans') throw new Error('Wrong observation view');
  const version = number(envelope.observationVersion, Number.MAX_SAFE_INTEGER);
  const epoch = envelope.connectionEpoch === null ? null : number(envelope.connectionEpoch, Number.MAX_SAFE_INTEGER);
  if (!Number.isInteger(version) || (epoch !== null && !Number.isInteger(epoch))) throw new Error('Invalid observation version');
  flag(envelope.reachable); string(envelope.printerState); string(envelope.printerStateLabel); number(envelope.refreshAfterSeconds, 3600);
  const session = record(envelope.session);
  exact(session, ['identity', 'provenance', 'detail']);
  if (session.identity !== null) throw new Error('Invalid observation session');
  choice(session.provenance, ['external', 'unknown']); string(session.detail);
  const receivedAt = time(envelope.receivedAt);
  if (receivedAt === null) throw new Error('Missing receipt');
  const module = record(envelope.module);
  exact(module, ['kind', 'state', 'freshness', 'capabilityEvidence', 'provenance', 'receivedAt', 'checkedAt', 'reason', 'items', 'purifier']);
  if (module.kind !== 'fans') throw new Error('Wrong module');
  const provenance = record(module.provenance);
  exact(provenance, ['source', 'sourceObservedAt', 'detail']); string(provenance.detail);
  const purifier = record(module.purifier);
  exact(purifier, ['state', 'powerDetected', 'mode', 'capabilityEvidence']);
  if (!Array.isArray(module.items) || module.items.length !== FAN_IDS.length) throw new Error('Invalid fan channels');
  const items = module.items.map((value, index) => {
    const row = record(value);
    exact(row, ['id', 'label', 'group', 'state', 'speedReported', 'speedFraction', 'rpmReported', 'rpm']);
    if (row.id !== FAN_IDS[index] || row.group !== (index < 4 ? 'part_cooling' : 'air_handling')) throw new Error('Invalid fan channel');
    string(row.label, 64);
    const speedReported = flag(row.speedReported), rpmReported = flag(row.rpmReported);
    const state = choice(row.state, ['known', 'not_reported'] as const);
    if ((state === 'known') !== (speedReported || rpmReported)) throw new Error('Inconsistent fan report');
    const percent = speedReported ? number(row.speedFraction, 1) * 100 : null;
    const rpm = rpmReported ? number(row.rpm, 1_000_000) : null;
    if ((!speedReported && row.speedFraction !== null) || (!rpmReported && row.rpm !== null)) throw new Error('Unreported fan value');
    return { id: FAN_IDS[index], state, speedReported, rpmReported, percent, rpm };
  });
  const purifierState = choice(purifier.state, ['known', 'not_reported'] as const);
  const powerDetected = purifier.powerDetected === null ? null : flag(purifier.powerDetected);
  const mode = purifier.mode === null ? null : choice(purifier.mode, ['idle', 'cool_chamber', 'preheat_chamber', 'hot_chamber'] as const);
  if (purifierState === 'not_reported' && (powerDetected !== null || mode !== null)) throw new Error('Unreported purifier value');
  return {
    kind: 'fans', version, connectionEpoch: epoch, sourceObservedAt: time(envelope.sourceObservedAt), receivedAt,
    freshness: choice(envelope.freshness, ['fresh', 'stale', 'offline', 'unknown'] as const),
    state: choice(module.state, ['known', 'unknown', 'unavailable', 'unsupported', 'stale'] as const), capability: capability(module.capabilityEvidence),
    receipt: {
      source: choice(provenance.source, ['moonraker', 'derived', 'not_observed'] as const), sourceObservedAt: time(provenance.sourceObservedAt),
      receivedAt: time(module.receivedAt), checkedAt: time(module.checkedAt), freshness: choice(module.freshness, ['fresh', 'stale', 'unknown'] as const),
      reason: module.reason === null ? null : choice(module.reason, ['not_requested', 'unsupported', 'unauthorized', 'http_error', 'timeout', 'network', 'malformed', 'too_large', 'not_configured'])
    }, items, purifier: { state: purifierState, powerDetected, mode, capability: capability(purifier.capabilityEvidence) }
  };
};
