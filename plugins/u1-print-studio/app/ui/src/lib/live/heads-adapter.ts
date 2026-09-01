import { HEAD_IDS, type HeadField, type HeadState, type HeadsPresentation } from './heads-presentation.js';
import { parseColor } from '../ui/color.js';
import { record as object, exact, choice, flag as boolean, string as text, time, evidence, provenance, observationEnvelope, capability } from './validation.js';

const finite = (value: unknown): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error('Invalid Heads number');
  return value;
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
  const { envelope, version, connectionEpoch, sourceObservedAt, receivedAt, freshness } = observationEnvelope(input, 'heads');
  const module = object(envelope.module); exact(module, ['kind', 'state', 'capabilityEvidence', 'provenance', 'materials', 'items']);
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
    kind: 'heads', version, connectionEpoch, sourceObservedAt, receivedAt, freshness,
    state: evidence(module.state), capability: capability(module.capabilityEvidence), provenance: provenance(module.provenance),
    materials: { state: evidence(materials.state), freshness: choice(materials.freshness, ['fresh', 'stale', 'unknown']), sourceObservedAt: time(materials.sourceObservedAt), receivedAt: time(materials.receivedAt), checkedAt: time(materials.checkedAt), reason: materials.reason === null ? null : choice(materials.reason, ['not_requested', 'not_reported', 'unsupported', 'unauthorized', 'http_error', 'timeout', 'network', 'malformed', 'too_large', 'not_configured']) }, items,
  };
};
