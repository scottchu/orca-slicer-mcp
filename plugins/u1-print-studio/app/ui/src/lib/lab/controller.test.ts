import { describe, expect, it } from 'vitest';
import { LAB_VIEWS } from '../observation/types';
import { defaultSelection, fieldsFor, readSelection, scenarios, selectionSearch, setSelection } from './controller';
import { previewState, resolveFixture } from './fixtures';

describe('closed synthetic lab controller', () => {
  for (const view of LAB_VIEWS) {
    it(`${view} validates every individual closed option and persists its state`, () => {
      for (const scenario of scenarios[view]) {
        const selected = setSelection(defaultSelection(view), 'scenario', scenario.value);
        for (const field of fieldsFor(selected)) for (const option of field.options) {
          const next = setSelection(selected, field.key, option.value);
          expect(() => resolveFixture(next)).not.toThrow();
          expect(readSelection(view, selectionSearch(next))).toEqual(next);
        }
      }
    });
    it(`${view} loading and terminal states contain no observation; refresh retains it`, () => {
      const initial = defaultSelection(view);
      for (const phase of ['loading', 'error', 'unavailable']) {
        expect(previewState(setSelection(initial, 'phase', phase))).toEqual({ kind: phase });
        const fields = fieldsFor(setSelection(initial, 'phase', phase));
        expect(fields.find((field) => field.key === 'scenario')!.disabled).not.toBe(true);
        expect(fields.find((field) => field.key === 'freshness')!.disabled).toBe(true);
      }
      expect(previewState(setSelection(initial, 'phase', 'refreshing'))).toEqual({ kind: 'ready', observation: resolveFixture(initial), refreshing: true });
    });
  }
  it('rejects unsafe/unknown/duplicate URL values without exposing a JSON harness', () => {
    const initial = defaultSelection('thermals');
    expect(readSelection('thermals', '?lab_actual=999999&lab_target=NaN&lab_scenario=<script>&lab_channel=../../&lab_phase=ready&lab_phase=loading&json=%7B%7D')).toEqual(initial);
    expect(setSelection(initial, '__proto__', 'polluted')).toBe(initial);
    expect(setSelection(initial, 'actual', '220;url(https://invalid)')).toBe(initial);
  });
  it('keeps complete and standby progress correlated despite a selected numeric value', () => {
    for (const [scenario, percent] of [['complete', 100], ['standby', 0]] as const) {
      const selected = setSelection(setSelection(defaultSelection('progress'), 'scenario', scenario), 'percent', '25');
      const fixture = resolveFixture(selected);
      expect(fixture.percent).toBe(percent);
      expect(fixture.currentLayer).toBe(percent * 6.5);
      expect(fixture.etaSeconds).toBe(0);
    }
  });
  it('keeps empty and unknown filament metadata neutral', () => {
    for (const scenario of ['empty', 'unknown']) {
      const fixture = resolveFixture(setSelection(defaultSelection('heads'), 'scenario', scenario));
      expect(fixture.items.every((item) => item.presence === (scenario === 'empty' ? false : null) && item.material === null && item.color === null)).toBe(true);
    }
  });
  it('recomputes all mesh summaries rather than fabricating empty grids', () => {
    const fixture = resolveFixture(setSelection(defaultSelection('bed_mesh'), 'scenario', 'flat'));
    expect(fixture.matrix).toHaveLength(11);
    expect(fixture.summary.range).toBe(0);
  });
});
