import type { LabView, LabFreshness } from '../observation/types';

export type Option = { value: string; label: string };
export type Field = { key: string; label: string; options: readonly Option[]; disabled?: boolean };
export type Phase = 'loading' | 'ready' | 'refreshing' | 'unavailable' | 'error';
export type ScenarioByView = {
  overview: 'printing' | 'paused' | 'complete' | 'standby';
  progress: ScenarioByView['overview']; jobs: ScenarioByView['overview'] | 'error' | 'cancelled' | 'unknown';
  thermals: 'heating' | 'at_target' | 'targets_off' | 'unknown_targets';
  heads: 'mixed' | 'loaded' | 'empty' | 'unknown';
  job_history: 'populated' | 'empty' | 'mixed_outcomes';
  queue: 'populated' | 'empty'; fans: 'nominal' | 'zero' | 'unknown' | 'mixed';
  bed_mesh: 'warped' | 'flat' | 'tilted';
};
type PrintValues = { percent: 'scenario' | '0' | '25' | '50' | '75' | '100' };
export type ValuesByView = {
  overview: PrintValues; progress: PrintValues;
  jobs: { facts: 'scenario' | 'zero' | 'unknown' | 'extreme'; filename: 'scenario' | 'empty' | 'unreported' | 'long' };
  thermals: { channel: '0' | '1' | '2' | '3' | '4' | '5'; actual: 'scenario' | '0' | '25' | '100' | '200' | '220' | '300'; target: 'scenario' | 'unknown' | '0' | '55' | '200' | '220' | '300' };
  heads: { tool: '0' | '1' | '2' | '3'; material: 'scenario' | 'empty' | 'unknown' | 'pla_white' | 'petg_blue' | 'pla_black' };
  job_history: { count: 'scenario' | '0' | '1' | '4' | '20' };
  queue: { queueState: 'ready' | 'loading' | 'starting' | 'paused'; count: 'scenario' | '0' | '1' | '3' | '10' };
  fans: { fan: '0' | '1' | '2' | '3' | '4' | '5' | '6'; percent: 'scenario' | 'unknown' | '0' | '25' | '33.3' | '50' | '70' | '100'; rpm: 'scenario' | 'unknown' | '0' | '1200' | '9126' | '100000'; mode: 'scenario' | 'unknown' | 'idle' | 'cool_chamber' | 'preheat_chamber' | 'hot_chamber' };
  bed_mesh: { mode: '3d' | '2d' };
};
export type LabSelection<V extends LabView = LabView> = { [K in V]: {
  kind: 'observation'; view: K; phase: Phase; scenario: ScenarioByView[K];
  freshness: LabFreshness; values: ValuesByView[K];
} }[V];
// Camera supplies its own closed definition/reducer in its separately reviewed
// integration. It never combines camera-live with observation-loading.
export type LabControllerKind = 'observation' | 'camera';
const option = (value: string, label = value.replaceAll('_', ' ').replace(/^./, (letter) => letter.toUpperCase())): Option => ({ value, label });
const choices = (...values: string[]) => values.map((value) => option(value));
const field = (key: string, label: string, options: readonly Option[]): Field => ({ key, label, options });
const presets = (values: readonly (number | null)[], unit = '') => values.map((value) => option(value === null ? 'unknown' : String(value), value === null ? 'Unknown' : `${value}${unit}`));
const printStates = choices('printing', 'paused', 'complete', 'standby');
export const scenarios: Record<LabView, readonly Option[]> = {
  overview: printStates, progress: printStates, jobs: choices('printing', 'paused', 'complete', 'standby', 'error', 'cancelled', 'unknown'),
  thermals: choices('at_target', 'heating', 'targets_off', 'unknown_targets'),
  heads: choices('mixed', 'loaded', 'empty', 'unknown'),
  job_history: choices('populated', 'empty', 'mixed_outcomes'), queue: choices('populated', 'empty'),
  fans: choices('nominal', 'zero', 'unknown', 'mixed'), bed_mesh: choices('warped', 'flat', 'tilted')
};
const phases = choices('ready', 'loading', 'refreshing', 'unavailable', 'error');
const freshness = choices('fresh', 'stale', 'offline', 'unknown');
const defaultOption = option('scenario', 'Scenario default');
const optionalPresets = (values: readonly (number | null)[], unit = '') => [defaultOption, ...presets(values, unit)];
const percent = field('percent', 'Progress', optionalPresets([0, 25, 50, 75, 100], '%'));
const variables: Record<LabView, readonly Field[]> = {
  overview: [percent], progress: [percent], jobs: [field('facts', 'Reported facts', [defaultOption, ...choices('zero', 'unknown', 'extreme')]), field('filename', 'Filename', [defaultOption, ...choices('empty', 'unreported', 'long')])],
  thermals: [field('channel', 'Channel', ['Tool 1', 'Tool 2', 'Tool 3', 'Tool 4', 'Heater bed', 'Cavity'].map((label, index) => option(String(index), label))),
    field('actual', 'Actual', optionalPresets([0, 25, 100, 200, 220, 300], '°')),
    field('target', 'Target', optionalPresets([null, 0, 55, 200, 220, 300], '°'))],
  heads: [field('tool', 'Tool', [1, 2, 3, 4].map((value) => option(String(value - 1), `Tool ${value}`))),
    field('material', 'Material', [defaultOption, ...choices('empty', 'unknown'), option('pla_white', 'White PLA'), option('petg_blue', 'Blue PETG'), option('pla_black', 'Black PLA')])],
  job_history: [field('count', 'Records', optionalPresets([0, 1, 4, 20]))],
  queue: [field('queueState', 'Queue state', choices('ready', 'loading', 'starting', 'paused')), field('count', 'Queued items', optionalPresets([0, 1, 3, 10]))],
  fans: [field('fan', 'Fan', ['Tool 1', 'Tool 2', 'Tool 3', 'Tool 4', 'Cavity', 'Purifier exhaust', 'Purifier inner'].map((label, index) => option(String(index), label))),
    field('percent', 'Fan speed', optionalPresets([null, 0, 25, 33.3, 50, 70, 100], '%')),
    field('rpm', 'RPM', optionalPresets([null, 0, 1200, 9126, 100000])),
    field('mode', 'Purifier mode', [defaultOption, ...choices('idle', 'cool_chamber', 'preheat_chamber', 'hot_chamber', 'unknown')])],
  bed_mesh: [field('mode', 'View', [option('3d', '3D surface'), option('2d', '2D grid')])]
};
export const defaultSelection = <V extends LabView>(view: V): LabSelection<V> => ({
  kind: 'observation', view, phase: 'ready', scenario: scenarios[view][0].value as ScenarioByView[V], freshness: 'fresh',
  values: Object.fromEntries(variables[view].map(({ key, options }) => [key, options[0].value]))
} as LabSelection<V>);
export const fieldsFor = <V extends LabView>(selection: LabSelection<V>): Field[] => {
  const unavailable = selection.phase !== 'ready' && selection.phase !== 'refreshing';
  return [field('phase', 'Preview state', phases), field('scenario', 'Scenario', scenarios[selection.view]),
    { ...field('freshness', 'Freshness', freshness), disabled: unavailable },
    ...variables[selection.view].map((item) => ({ ...item, disabled: unavailable || (['overview', 'progress'].includes(selection.view) && ['complete', 'standby'].includes(selection.scenario)) }))];
};
export const selectionValue = <V extends LabView>(selection: LabSelection<V>, key: string): string =>
  key === 'phase' ? selection.phase : key === 'scenario' ? selection.scenario : key === 'freshness' ? selection.freshness : (selection.values as Record<string, string>)[key];
export const setSelection = <V extends LabView>(selection: LabSelection<V>, key: string, value: string): LabSelection<V> => {
  const definition = fieldsFor(selection).find((item) => item.key === key);
  if (!definition?.options.some((item) => item.value === value)) return selection;
  if (key === 'scenario') return { ...selection, scenario: value, values: defaultSelection(selection.view).values } as LabSelection<V>;
  if (key === 'phase') return { ...selection, phase: value as Phase };
  if (key === 'freshness') return { ...selection, freshness: value as LabFreshness };
  return { ...selection, values: { ...selection.values, [key]: value } };
};
export const readSelection = <V extends LabView>(view: V, search: string): LabSelection<V> => {
  let selection = defaultSelection(view);
  // Unknown, duplicated or invalid parameters are ignored, never interpreted as
  // code, JSON, a transport URL or a new observation shape.
  const query = new URLSearchParams(search);
  for (const { key } of fieldsFor(selection)) {
    const values = query.getAll(`lab_${key}`);
    if (values.length === 1) selection = setSelection(selection, key, values[0]);
  }
  return selection;
};
export const selectionSearch = <V extends LabView>(selection: LabSelection<V>): string => {
  const query = new URLSearchParams();
  for (const { key } of fieldsFor(selection)) query.set(`lab_${key}`, selectionValue(selection, key));
  return `?${query}`;
};
export const loadingRows = (selection: LabSelection): number | undefined => {
  if (selection.view !== 'queue' && selection.view !== 'job_history') return undefined;
  if (selection.values.count !== 'scenario') return Number(selection.values.count);
  return selection.scenario === 'empty' ? 0 : selection.view === 'queue' ? 3 : 4;
};
