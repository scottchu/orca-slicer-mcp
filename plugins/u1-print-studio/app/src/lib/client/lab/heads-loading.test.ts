import { describe, expect, it } from 'vitest';
import { headsLoadingShapes } from './heads-loading';
import { defaultSelection, setSelection, type LabSelection } from './controller';
import { resolveObservationFixture } from './observation-fixtures';
import { checkedMaterialShapes, materialLoadingTemplate, type MaterialLoadingShape, type MaterialLoadingShapes } from '../observation/heads-loading';

describe('closed public Heads loading shapes', () => {
  it('matches all public scenario/tool/material structures without a DTO input', () => {
    for (const scenario of ['mixed', 'loaded', 'empty', 'unknown']) for (const tool of ['0', '1', '2', '3']) for (const material of ['scenario', 'empty', 'unknown', 'pla_white', 'petg_blue', 'pla_black']) {
      let selection = setSelection(defaultSelection('heads'), 'scenario', scenario);
      selection = setSelection(setSelection(selection, 'tool', tool), 'material', material);
      const expected = resolveObservationFixture(selection).items.map((item) => item.material === null ? 'empty' : 'nominal');
      expect(headsLoadingShapes(setSelection(selection, 'phase', 'loading'))).toEqual(expected);
      expect(headsLoadingShapes(selection)).toBeUndefined();
    }
  });
  it('rejects invalid closed controls and ignores non-Heads selections', () => {
    const selection = setSelection(defaultSelection('heads'), 'phase', 'loading');
    for (const forged of [
      { ...selection, scenario: 'private material' },
      { ...selection, values: { ...selection.values, tool: '9' } },
      { ...selection, values: { ...selection.values, material: 'private material' } },
    ]) expect(() => headsLoadingShapes(forged as LabSelection<'heads'>)).toThrow('Invalid Heads preview selection');
    expect(headsLoadingShapes(setSelection(defaultSelection('queue'), 'phase', 'loading'))).toBeUndefined();
  });
  it('only accepts fixed loading templates and rejects ready overrides', () => {
    expect(materialLoadingTemplate(true)).toBe('Generic PLA');
    expect(materialLoadingTemplate(true, 'empty')).toBe('—');
    expect(materialLoadingTemplate(true, 'nominal')).toBe('Generic PLA');
    for (const invalid of ['', 'private material', null, {}, 1]) expect(() => materialLoadingTemplate(true, invalid as MaterialLoadingShape)).toThrow();
    for (const shape of ['empty', 'nominal'] as const) expect(() => materialLoadingTemplate(false, shape)).toThrow();
    expect(checkedMaterialShapes(false)).toBeUndefined();
    const valid = ['nominal', 'empty', 'nominal', 'empty'] as const;
    expect(checkedMaterialShapes(true, valid)).toBe(valid);
    expect(() => checkedMaterialShapes(false, valid)).toThrow();
    for (const invalid of [null, {}, [], ['nominal'], Array(4), ['nominal', 'empty', 'nominal', 'private material']]) expect(() => checkedMaterialShapes(true, invalid as MaterialLoadingShapes)).toThrow();
  });
});
