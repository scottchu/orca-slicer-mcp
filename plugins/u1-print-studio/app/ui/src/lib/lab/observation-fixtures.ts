import {
  currentJobLabFixture,
  fansLabFixture,
  headsLabFixture,
  jobHistoryLabFixture,
  overviewLabFixture,
  progressLabFixture,
  queueLabFixture,
  thermalsLabFixture
} from '../fixtures/observations';
import {
  validateCurrentJob,
  validateFans,
  validateHeads,
  validateJobHistory,
  validateOverview,
  validateProgress,
  validateQueue,
  validateThermals,
  type CurrentJobObservation,
  type FansObservation,
  type HeadsObservation,
  type JobHistoryObservation,
  type OverviewObservation,
  type ProgressObservation,
  type QueueObservation,
  type ThermalsObservation,
  type LabView
} from '../observation/types';
import { readSelection, selectionSearch, type LabSelection } from './controller';
import type { WidgetState } from '../ui/state';

export type ObservationLabView = Exclude<LabView, 'bed_mesh'>;
export const OBSERVATION_LAB_VIEWS = [
  'overview', 'progress', 'thermals', 'heads', 'jobs', 'job_history', 'queue', 'fans'
] as const satisfies readonly ObservationLabView[];
export type ObservationByView = {
  overview: OverviewObservation;
  progress: ProgressObservation;
  thermals: ThermalsObservation;
  heads: HeadsObservation;
  jobs: CurrentJobObservation;
  job_history: JobHistoryObservation;
  queue: QueueObservation;
  fans: FansObservation;
};

const numberValue = (value: string, fallback: number | null): number | null =>
  value === 'scenario' ? fallback : value === 'unknown' ? null : Number(value);
const printPercent = (selection: LabSelection<'overview' | 'progress' | 'jobs'>): number =>
  selection.scenario === 'complete' ? 100 : selection.scenario === 'standby' ? 0 : numberValue(selection.values.percent, 64)!;
const printState = (selection: LabSelection<'overview' | 'progress' | 'jobs'>): ProgressObservation['state'] => selection.scenario;

const factories: { [V in ObservationLabView]: (selection: LabSelection<V>) => ObservationByView[V] } = {
  progress: (selection) => {
    const percent = printPercent(selection);
    return validateProgress({ ...progressLabFixture, freshness: selection.freshness, state: printState(selection), percent,
      currentLayer: Math.round(percent * 6.5), elapsedSeconds: Math.round(percent * 180),
      etaSeconds: selection.scenario === 'standby' ? 0 : Math.round((100 - percent) * 180) });
  },
  jobs: (selection) => {
    const percent = printPercent(selection);
    return validateCurrentJob({ ...currentJobLabFixture, freshness: selection.freshness, state: printState(selection), progressPercent: percent,
      storageActive: selection.scenario === 'printing' || selection.scenario === 'paused', elapsedSeconds: Math.round(percent * 180), filamentUsedMm: percent * 300 });
  },
  overview: (selection) => validateOverview({ ...overviewLabFixture, freshness: selection.freshness,
    progress: { state: printState(selection), percent: printPercent(selection) }, jobs: { state: printState(selection) } }),
  thermals: (selection) => {
    const readings = thermalsLabFixture.readings.map((reading, index) => {
      const nominal = reading.targetC;
      const targetC = selection.scenario === 'targets_off' ? 0 : selection.scenario === 'unknown_targets' ? null : nominal;
      const actualC = selection.scenario === 'at_target' && targetC !== null && targetC > 0 ? targetC : selection.scenario === 'heating' && reading.active ? index === 4 ? 35 : 100 : reading.actualC;
      return { ...reading, actualC, targetC, active: targetC !== null && targetC > 0 };
    });
    const reading = readings[Number(selection.values.channel)];
    reading.actualC = numberValue(selection.values.actual, reading.actualC)!;
    reading.targetC = numberValue(selection.values.target, reading.targetC);
    reading.active = reading.targetC !== null && reading.targetC > 0;
    return validateThermals({ ...thermalsLabFixture, freshness: selection.freshness, readings });
  },
  heads: (selection) => {
    const items = headsLabFixture.items.map((head) => {
      if (selection.scenario === 'empty' || selection.scenario === 'unknown') return { ...head, presence: selection.scenario === 'empty' ? false : null, material: null, color: null };
      if (selection.scenario === 'loaded' && head.presence !== true) return { ...head, presence: true, material: 'Generic PLA', color: '#FFFFFF' };
      return { ...head };
    });
    const head = items[Number(selection.values.tool)];
    const material = selection.values.material;
    if (material === 'empty' || material === 'unknown') Object.assign(head, { presence: material === 'empty' ? false : null, material: null, color: null });
    else if (material !== 'scenario') Object.assign(head, { presence: true, material: material === 'petg_blue' ? 'Generic PETG' : 'Generic PLA', color: material === 'petg_blue' ? '#3487C8' : material === 'pla_black' ? '#111111' : '#FFFFFF' });
    return validateHeads({ ...headsLabFixture, freshness: selection.freshness, items });
  },
  job_history: (selection) => {
    const count = numberValue(selection.values.count, selection.scenario === 'empty' ? 0 : 4)!;
    const statuses = ['completed', 'cancelled', 'error', 'interrupted'] as const;
    const items = Array.from({ length: count }, (_, index) => ({ ...jobHistoryLabFixture.items[index % 4], position: index + 1,
      status: selection.scenario === 'mixed_outcomes' ? statuses[index % 4] : 'completed' }));
    return validateJobHistory({ ...jobHistoryLabFixture, freshness: selection.freshness, items });
  },
  queue: (selection) => {
    const count = numberValue(selection.values.count, selection.scenario === 'empty' ? 0 : 3)!;
    return validateQueue({ ...queueLabFixture, freshness: selection.freshness, queueState: selection.values.queueState,
      items: Array.from({ length: count }, (_, index) => ({ ...queueLabFixture.items[index % 3], position: index + 1 })) });
  },
  fans: (selection) => {
    const items = fansLabFixture.items.map((fan, index) => ({ ...fan,
      percent: selection.scenario === 'zero' ? 0 : selection.scenario === 'unknown' || (selection.scenario === 'mixed' && index % 2) ? null : fan.percent,
      rpm: selection.scenario === 'zero' ? 0 : selection.scenario === 'unknown' || (selection.scenario === 'mixed' && !(index % 2)) ? null : fan.rpm }));
    const fan = items[Number(selection.values.fan)];
    fan.percent = numberValue(selection.values.percent, fan.percent);
    fan.rpm = numberValue(selection.values.rpm, fan.rpm);
    const purifierMode = selection.values.mode === 'scenario' ? fansLabFixture.purifierMode : selection.values.mode === 'unknown' ? null : selection.values.mode;
    return validateFans({ ...fansLabFixture, freshness: selection.freshness, items, purifierMode });
  }
};

export const resolveObservationFixture = <V extends ObservationLabView>(selection: LabSelection<V>): ObservationByView[V] => {
  const canonical = readSelection(selection.view, selectionSearch(selection));
  return factories[selection.view](canonical);
};

export const previewObservationState = <V extends ObservationLabView>(selection: LabSelection<V>): WidgetState<ObservationByView[V]> =>
  selection.phase === 'ready' || selection.phase === 'refreshing'
    ? { kind: 'ready', observation: resolveObservationFixture(selection), refreshing: selection.phase === 'refreshing' }
    : { kind: selection.phase };
