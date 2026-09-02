import { THERMAL_IDS, type ThermalField, type ThermalsPresentation } from './presentation.js';
import { record, exact, choice, number, time, flag, capability, evidence, reason, provenance, observationEnvelope } from './validation.js';

const field = <T>(value: unknown, parse: (value: unknown) => T): ThermalField<T> => {
  const data = record(value); exact(data, ['state', 'value']);
  const state = evidence(data.state);
  // Preserve nullable value and evidence independently; offline status can
  // retain a previously normalized finite value with unknown evidence.
  return { state, value: data.value === null ? null : parse(data.value) };
};
const temperature = (value: unknown) => number(value, Number.MAX_VALUE, -Number.MAX_VALUE);
export const adaptThermals = (value: unknown): ThermalsPresentation => {
  const { envelope, ...base } = observationEnvelope(value, 'thermals');
  const module = record(envelope.module);
  exact(module, ['kind', 'state', 'capabilityEvidence', 'provenance', 'environment', 'readings']);
  if (module.kind !== 'thermals') throw new Error('Wrong module');
  const environment = record(module.environment);
  exact(environment, ['state', 'freshness', 'sourceObservedAt', 'receivedAt', 'checkedAt', 'reason']);
  if (!Array.isArray(module.readings) || module.readings.length !== THERMAL_IDS.length) throw new Error('Invalid thermal channels');
  const readings = module.readings.map((value, index): ThermalsPresentation['readings'][number] => {
    const row = record(value), cavity = index === 5;
    exact(row, cavity
      ? ['id', 'label', 'state', 'reportedState', 'capabilityEvidence', 'actual', 'provenance']
      : ['id', 'label', 'state', 'capabilityEvidence', 'actual', 'target', 'heaterState', 'active', 'provenance']);
    if (row.id !== THERMAL_IDS[index] || row.label !== (index < 4 ? `Tool ${index + 1}` : cavity ? 'Cavity' : 'Heater bed')) throw new Error('Invalid thermal identity');
    const actual = field(row.actual, cavity ? (value) => number(value, 999, -273.15) : temperature);
    const shared = { id: THERMAL_IDS[index], state: evidence(row.state), capability: capability(row.capabilityEvidence), actual, actualC: actual.value, provenance: provenance(row.provenance) };
    if (cavity) {
      const reportedState = choice(row.reportedState, ['known', 'not_reported'] as const);
      if (reportedState === 'not_reported' && actual.value !== null) throw new Error('Unreported cavity value');
      return { ...shared, targetC: null, active: null, reportedState };
    }
    const target = field(row.target, temperature), activeField = field(row.active, flag);
    const heaterState = field(row.heaterState, (value) => choice(value, ['ACTIVE', 'PARKED', 'HEATING', 'COOLING', 'STANDBY', 'IDLE', 'UNKNOWN']));
    return { ...shared, target, targetC: target.value, activeField, active: activeField.value, heaterState };
  });
  return { ...base, kind: 'thermals', state: evidence(module.state), capability: capability(module.capabilityEvidence), provenance: provenance(module.provenance),
    environment: { state: evidence(environment.state), freshness: choice(environment.freshness, ['fresh', 'stale', 'unknown']), sourceObservedAt: time(environment.sourceObservedAt), receivedAt: time(environment.receivedAt), checkedAt: time(environment.checkedAt), reason: reason(environment.reason) }, readings };
};
