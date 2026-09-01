import { HEAD_IDS, type HeadField, type HeadProvenance, type HeadState, type HeadsPresentation } from './heads-presentation';
import { parseColor } from '../ui/color';

type ObjectValue = Record<string, unknown>;
const object = (value: unknown): ObjectValue => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid Heads object');
  return value as ObjectValue;
};
const exact = (value: ObjectValue, keys: readonly string[]): void => {
  if (Object.keys(value).sort().join('|') !== [...keys].sort().join('|')) throw new Error('Invalid Heads fields');
};
const choice = <T extends string>(value: unknown, choices: readonly T[]): T => {
  if (typeof value !== 'string' || !choices.includes(value as T)) throw new Error('Invalid Heads choice');
  return value as T;
};
const finite = (value: unknown): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error('Invalid Heads number');
  return value;
};
const integer = (value: unknown): number => {
  const result = finite(value);
  if (!Number.isSafeInteger(result) || result < 0) throw new Error('Invalid Heads sequence');
  return result;
};
const boolean = (value: unknown): boolean => {
  if (typeof value !== 'boolean') throw new Error('Invalid Heads flag');
  return value;
};
const text = (value: unknown, maximum = 512): string => {
  if (typeof value !== 'string' || value.length > maximum) throw new Error('Invalid Heads text');
  return value;
};
const time = (value: unknown): string | null => {
  if (value === null) return null;
  if (typeof value !== 'string' || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString() !== value) throw new Error('Invalid Heads time');
  return value;
};
const evidence = (value: unknown) => choice(value, ['known', 'stale', 'unknown', 'unsupported', 'unavailable'] as const);
const provenance = (input: unknown): HeadProvenance => {
  const value = object(input); exact(value, ['source', 'sourceObservedAt', 'detail']);
  return { source: choice(value.source, ['moonraker', 'derived', 'not_observed']), sourceObservedAt: time(value.sourceObservedAt), detail: text(value.detail) };
};
const field = <T>(input: unknown, parse: (value: unknown) => T): HeadField<T> => {
  const value = object(input); exact(value, ['state', 'value']);
  const state = evidence(value.state), parsed = value.value === null ? null : parse(value.value);
  if ((state === 'known' || state === 'stale') !== (parsed !== null)) throw new Error('Inconsistent Heads field');
  return { state, value: parsed };
};
const material = (value: unknown, maximum = 64): string => {
  const result = text(value, maximum);
  if (!/^[\p{L}\p{N} _+()-]+$/u.test(result) || result !== result.trim() || /^(NONE|UNKNOWN|NULL|N\/A)$/i.test(result) || /^sk[-_]/i.test(result) || /(?:api[-_ ]?key|password|secret|token|credential)/i.test(result) || /^(?:(?:Bearer|Basic)\s|gh[pousr]_|github_pat_|glpat-|xox[baprs]-|(?:AKIA|ASIA)[A-Z0-9]{16})/i.test(result)) throw new Error('Invalid material label');
  return result;
};
const color = (value: unknown): string => {
  const parsed = parseColor(value);
  if (!parsed) throw new Error('Invalid Heads color');
  return parsed.hex;
};

/** Boundary accepts the privacy-minimized real server DTO, never the lab envelope. */
export const adaptHeads = (input: unknown): HeadsPresentation => {
  const value = object(input);
  exact(value, ['schemaVersion', 'view', 'observationVersion', 'sourceObservedAt', 'receivedAt', 'freshness', 'connectionEpoch', 'reachable', 'printerState', 'printerStateLabel', 'refreshAfterSeconds', 'session', 'module']);
  if (value.schemaVersion !== 2 || value.view !== 'heads') throw new Error('Wrong Heads view');
  const version = integer(value.observationVersion), connectionEpoch = value.connectionEpoch === null ? null : integer(value.connectionEpoch);
  const receivedAt = time(value.receivedAt);
  if (receivedAt === null) throw new Error('Missing Heads receipt');
  boolean(value.reachable); text(value.printerState); text(value.printerStateLabel);
  if (finite(value.refreshAfterSeconds) < 0 || finite(value.refreshAfterSeconds) > 3600) throw new Error('Invalid Heads refresh');
  const session = object(value.session); exact(session, ['identity', 'provenance', 'detail']);
  if (session.identity !== null) throw new Error('Private Heads identity');
  choice(session.provenance, ['external', 'unknown']); text(session.detail);
  const module = object(value.module); exact(module, ['kind', 'state', 'capabilityEvidence', 'provenance', 'materials', 'items']);
  if (module.kind !== 'heads') throw new Error('Wrong Heads module');
  const materials = object(module.materials); exact(materials, ['state', 'freshness', 'sourceObservedAt', 'receivedAt', 'checkedAt', 'reason']);
  if (!Array.isArray(module.items) || module.items.length !== HEAD_IDS.length) throw new Error('Invalid Heads slots');
  const items = module.items.map((input, index) => {
    const row = object(input);
    exact(row, ['physicalTool', 'state', 'active', 'headState', 'temperature', 'target', 'material', 'color', 'vendor', 'materialType', 'subtype', 'reportedPresence', 'materialProvenance', 'provenance']);
    if (row.physicalTool !== HEAD_IDS[index]) throw new Error('Invalid Heads identity');
    return {
      physicalTool: HEAD_IDS[index], state: evidence(row.state), active: field(row.active, boolean),
      headState: field(row.headState, (value) => choice(value, ['ACTIVE', 'PARKED', 'HEATING', 'COOLING', 'STANDBY', 'IDLE', 'UNKNOWN']).toLowerCase() as HeadState),
      temperature: field(row.temperature, finite), target: field(row.target, finite),
      material: field(row.material, (value) => material(value, 194)), color: field(row.color, color), vendor: field(row.vendor, material), materialType: field(row.materialType, material), subtype: field(row.subtype, material), reportedPresence: field(row.reportedPresence, boolean),
      materialProvenance: provenance(row.materialProvenance), provenance: provenance(row.provenance),
    };
  });
  return {
    kind: 'heads', version, connectionEpoch, sourceObservedAt: time(value.sourceObservedAt), receivedAt,
    freshness: choice(value.freshness, ['fresh', 'stale', 'offline', 'unknown']), state: evidence(module.state), capability: choice(module.capabilityEvidence, ['observed', 'advertised', 'unsupported', 'unknown']), provenance: provenance(module.provenance),
    materials: { state: evidence(materials.state), freshness: choice(materials.freshness, ['fresh', 'stale', 'unknown']), sourceObservedAt: time(materials.sourceObservedAt), receivedAt: time(materials.receivedAt), checkedAt: time(materials.checkedAt), reason: materials.reason === null ? null : choice(materials.reason, ['not_requested', 'not_reported', 'unsupported', 'unauthorized', 'http_error', 'timeout', 'network', 'malformed', 'too_large', 'not_configured']) }, items,
  };
};
