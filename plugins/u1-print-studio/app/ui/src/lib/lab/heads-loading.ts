import type { MaterialLoadingShape, MaterialLoadingShapes } from '../observation/heads-loading';
import type { LabSelection } from './controller';

// Only closed public controls choose neutral templates; never inspect a DTO.
export const headsLoadingShapes = (selection: LabSelection): MaterialLoadingShapes | undefined => {
  if (selection.view !== 'heads' || selection.phase !== 'loading') return undefined;
  const { scenario, values } = selection;
  if (!['mixed', 'loaded', 'empty', 'unknown'].includes(scenario) || !['0', '1', '2', '3'].includes(values.tool) || !['scenario', 'empty', 'unknown', 'pla_white', 'petg_blue', 'pla_black'].includes(values.material)) throw new Error('Invalid Heads preview selection');
  const shapes: [MaterialLoadingShape, MaterialLoadingShape, MaterialLoadingShape, MaterialLoadingShape] = scenario === 'empty' || scenario === 'unknown'
    ? ['empty', 'empty', 'empty', 'empty'] : ['nominal', 'nominal', 'nominal', scenario === 'mixed' ? 'empty' : 'nominal'];
  if (values.material !== 'scenario') shapes[Number(values.tool)] = values.material === 'empty' || values.material === 'unknown' ? 'empty' : 'nominal';
  return shapes;
};
