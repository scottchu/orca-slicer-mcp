import { bedMeshLabFixture } from '../fixtures/bed-mesh';
import { currentJobLabFixture, fansLabFixture, headsLabFixture, jobHistoryLabFixture, overviewLabFixture, progressLabFixture, queueLabFixture, thermalsLabFixture } from '../fixtures/observations';
import { validateBedMeshObservation, type BedMeshObservation } from '../bed-mesh/types';
import { validateCurrentJob, validateFans, validateHeads, validateJobHistory, validateOverview, validateProgress, validateQueue, validateThermals, type CurrentJobObservation, type FansObservation, type HeadsObservation, type JobHistoryObservation, type OverviewObservation, type ProgressObservation, type QueueObservation, type ThermalsObservation, type LabView } from '../observation/types';
import { readSelection, selectionSearch, type LabSelection } from './controller';
import type { WidgetState } from '../ui/state';

export type ObservationByView = { overview: OverviewObservation; progress: ProgressObservation; thermals: ThermalsObservation; heads: HeadsObservation; jobs: CurrentJobObservation; job_history: JobHistoryObservation; queue: QueueObservation; fans: FansObservation; bed_mesh: BedMeshObservation };
const numberValue = (value: string, fallback: number | null): number | null => value === 'scenario' ? fallback : value === 'unknown' ? null : Number(value);
const printPercent = (selection: LabSelection): number => selection.scenario === 'complete' ? 100 : selection.scenario === 'standby' ? 0 : numberValue(selection.values.percent, 64)!;
const printState = (selection: LabSelection): ProgressObservation['state'] => selection.scenario as ProgressObservation['state'];

const factories = {
  progress: (selection: LabSelection): ProgressObservation => {
    const percent = printPercent(selection);
    return validateProgress({ ...progressLabFixture, freshness: selection.freshness, state: printState(selection), percent,
      currentLayer: Math.round(percent * 6.5), elapsedSeconds: Math.round(percent * 180),
      etaSeconds: selection.scenario === 'standby' ? 0 : Math.round((100 - percent) * 180) });
  },
  jobs: (selection: LabSelection): CurrentJobObservation => {
    const percent = printPercent(selection);
    return validateCurrentJob({ ...currentJobLabFixture, freshness: selection.freshness, state: printState(selection), progressPercent: percent,
      storageActive: selection.scenario === 'printing' || selection.scenario === 'paused', elapsedSeconds: Math.round(percent * 180), filamentUsedMm: percent * 300 });
  },
  overview: (selection: LabSelection): OverviewObservation => validateOverview({ ...overviewLabFixture, freshness: selection.freshness,
    progress: { state: printState(selection), percent: printPercent(selection) }, jobs: { state: printState(selection) } }),
  thermals: (selection: LabSelection): ThermalsObservation => {
    const readings = thermalsLabFixture.readings.map((reading, index) => {
      const nominal = index < 4 ? 220 : index === 4 ? 55 : null;
      const targetC = selection.scenario === 'targets_off' ? 0 : selection.scenario === 'unknown_targets' ? null : nominal;
      const actualC = selection.scenario === 'at_target' ? targetC ?? 33 : selection.scenario === 'heating' ? index < 4 ? 100 : index === 4 ? 35 : 33 : reading.actualC;
      return { ...reading, actualC, targetC, active: targetC !== null && targetC > 0 };
    });
    const reading = readings[Number(selection.values.channel)];
    reading.actualC = numberValue(selection.values.actual, reading.actualC)!;
    reading.targetC = numberValue(selection.values.target, reading.targetC);
    reading.active = reading.targetC !== null && reading.targetC > 0;
    return validateThermals({ ...thermalsLabFixture, freshness: selection.freshness, readings });
  },
  heads: (selection: LabSelection): HeadsObservation => {
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
  job_history: (selection: LabSelection): JobHistoryObservation => {
    const count = numberValue(selection.values.count, selection.scenario === 'empty' ? 0 : 4)!;
    const statuses = ['completed', 'cancelled', 'error', 'interrupted'] as const;
    const items = Array.from({ length: count }, (_, index) => ({ ...jobHistoryLabFixture.items[index % 4], position: index + 1,
      status: selection.scenario === 'mixed_outcomes' ? statuses[index % 4] : 'completed' }));
    return validateJobHistory({ ...jobHistoryLabFixture, freshness: selection.freshness, items });
  },
  queue: (selection: LabSelection): QueueObservation => {
    const count = numberValue(selection.values.count, selection.scenario === 'empty' ? 0 : 3)!;
    return validateQueue({ ...queueLabFixture, freshness: selection.freshness, queueState: selection.values.queueState,
      items: Array.from({ length: count }, (_, index) => ({ ...queueLabFixture.items[index % 3], position: index + 1 })) });
  },
  fans: (selection: LabSelection): FansObservation => {
    const items = fansLabFixture.items.map((fan, index) => ({ ...fan,
      percent: selection.scenario === 'zero' ? 0 : selection.scenario === 'unknown' || (selection.scenario === 'mixed' && index % 2) ? null : fan.percent,
      rpm: selection.scenario === 'zero' ? 0 : selection.scenario === 'unknown' || (selection.scenario === 'mixed' && !(index % 2)) ? null : fan.rpm }));
    const fan = items[Number(selection.values.fan)];
    fan.percent = numberValue(selection.values.percent, fan.percent);
    fan.rpm = numberValue(selection.values.rpm, fan.rpm);
    const purifierMode = selection.values.mode === 'scenario' ? fansLabFixture.purifierMode : selection.values.mode === 'unknown' ? null : selection.values.mode;
    return validateFans({ ...fansLabFixture, freshness: selection.freshness, items, purifierMode });
  },
  bed_mesh: (selection: LabSelection): BedMeshObservation => {
    const matrix = bedMeshLabFixture.matrix.map((row, y) => row.map((value, x) => selection.scenario === 'flat' ? 0 : selection.scenario === 'tilted' ? Number(((x + y) / 100 - .1).toFixed(4)) : value));
    const minimum = Math.min(...matrix.flat()), maximum = Math.max(...matrix.flat());
    return validateBedMeshObservation({ ...bedMeshLabFixture, freshness: selection.freshness, matrix,
      summary: { ...bedMeshLabFixture.summary, minimum, maximum, range: maximum - minimum } });
  }
};

export const resolveFixture = <V extends LabView>(selection: LabSelection<V>): ObservationByView[V] => {
  // Revalidate the closed controller too: callers cannot bypass it with an
  // arbitrary object, unsafe numeric value or unsupported fixture parameter.
  const canonical = readSelection(selection.view, selectionSearch(selection));
  return factories[selection.view](canonical) as ObservationByView[V];
};
export const previewState = <V extends LabView>(selection: LabSelection<V>): WidgetState<ObservationByView[V]> =>
  selection.phase === 'ready' || selection.phase === 'refreshing'
    ? { kind: 'ready', observation: resolveFixture(selection), refreshing: selection.phase === 'refreshing' }
    : { kind: selection.phase };
