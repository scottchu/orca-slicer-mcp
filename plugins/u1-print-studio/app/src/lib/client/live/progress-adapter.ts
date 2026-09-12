import { exact, number, record, string } from './validation';
import { field, focusedBase, integer, nonnegative } from './focused-validation';
import type { ProgressPresentation } from './focused-presentation';
export const adaptProgress = (value: unknown): ProgressPresentation => {
  const { module, base } = focusedBase(value, 'progress');
  exact(module, ['kind', 'state', 'capabilityEvidence', 'provenance', 'fields']);
  const values = record(module.fields);
  exact(values, ['percent', 'currentLayer', 'totalLayers', 'elapsedSeconds', 'estimatedRemainingSeconds', 'filename']);
  const fields = { percent: field(values.percent, value => number(value, 100)), currentLayer: field(values.currentLayer, integer), totalLayers: field(values.totalLayers, integer), elapsedSeconds: field(values.elapsedSeconds, nonnegative), estimatedRemainingSeconds: field(values.estimatedRemainingSeconds, nonnegative), filename: field(values.filename, value => string(value, 1_048_576)) };
  return { ...base, kind: 'progress', fields };
};
