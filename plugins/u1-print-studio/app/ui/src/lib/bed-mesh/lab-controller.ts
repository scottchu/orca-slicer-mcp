import type { Field, Option, Phase } from '../lab/controller';
import type { LabFreshness } from '../observation/types';

export type BedMeshLabSelection = {
  kind: 'observation';
  view: 'bed_mesh';
  phase: Phase;
  scenario: 'warped' | 'flat' | 'tilted';
  freshness: LabFreshness;
  values: { mode: '3d' | '2d' };
};

const option = (value: string, label: string): Option => ({ value, label });
const field = (key: string, label: string, options: readonly Option[]): Field => ({ key, label, options });
const phases = [
  option('ready', 'Ready'), option('loading', 'Loading'), option('refreshing', 'Refreshing'),
  option('unavailable', 'Unavailable'), option('error', 'Error')
];
const scenarios = [option('warped', 'Warped'), option('flat', 'Flat'), option('tilted', 'Tilted')];
const freshness = [option('fresh', 'Fresh'), option('stale', 'Stale'), option('offline', 'Offline'), option('unknown', 'Unknown')];
const modes = [option('3d', '3D surface'), option('2d', '2D grid')];

export const defaultBedMeshSelection = (): BedMeshLabSelection => ({
  kind: 'observation', view: 'bed_mesh', phase: 'ready', scenario: 'warped', freshness: 'fresh', values: { mode: '3d' }
});

export const bedMeshFields = (selection: BedMeshLabSelection): Field[] => {
  const unavailable = selection.phase !== 'ready' && selection.phase !== 'refreshing';
  return [
    field('phase', 'Preview state', phases),
    field('scenario', 'Scenario', scenarios),
    { ...field('freshness', 'Freshness', freshness), disabled: unavailable },
    { ...field('mode', 'View', modes), disabled: unavailable }
  ];
};

export const bedMeshSelectionValue = (selection: BedMeshLabSelection, key: string): string =>
  key === 'phase' ? selection.phase : key === 'scenario' ? selection.scenario : key === 'freshness' ? selection.freshness : selection.values.mode;

export const setBedMeshSelection = (selection: BedMeshLabSelection, key: string, value: string): BedMeshLabSelection => {
  const definition = bedMeshFields(selection).find((item) => item.key === key);
  if (!definition?.options.some((item) => item.value === value)) return selection;
  if (key === 'phase') return { ...selection, phase: value as Phase };
  if (key === 'scenario') return { ...selection, scenario: value as BedMeshLabSelection['scenario'], values: defaultBedMeshSelection().values };
  if (key === 'freshness') return { ...selection, freshness: value as LabFreshness };
  return { ...selection, values: { mode: value as BedMeshLabSelection['values']['mode'] } };
};

export const readBedMeshSelection = (search: string): BedMeshLabSelection => {
  let selection = defaultBedMeshSelection();
  const query = new URLSearchParams(search);
  for (const { key } of bedMeshFields(selection)) {
    const values = query.getAll(`lab_${key}`);
    if (values.length === 1) selection = setBedMeshSelection(selection, key, values[0]);
  }
  return selection;
};

export const bedMeshSelectionSearch = (selection: BedMeshLabSelection): string => {
  const query = new URLSearchParams();
  for (const { key } of bedMeshFields(selection)) query.set(`lab_${key}`, bedMeshSelectionValue(selection, key));
  return `?${query}`;
};
