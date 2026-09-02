import { describe, expect, it } from 'vitest';
import { cameraFields, cameraSelectionSearch, defaultCameraSelection, readCameraSelection, setCameraSelection } from './controller';

describe('closed synthetic camera lab controls', () => {
  it('round trips all seven scenarios and three restrictive capability policies', () => {
    for (const scenario of cameraFields[0].options) for (const capability of cameraFields[1].options) {
      const selection = setCameraSelection(setCameraSelection(defaultCameraSelection(), 'scenario', scenario.value), 'capability', capability.value);
      expect(readCameraSelection(cameraSelectionSearch(selection))).toEqual(selection);
    }
    expect(cameraFields[0].options.find(({ value }) => value === 'live')?.label).toBe('Simulated live');
  });
  it('ignores hostile, duplicate, unrelated and arbitrary data without evaluation', () => {
    for (const query of [
      '?lab_scenario=https%3A%2F%2Fevil.example%2Fvideo&lab_capability=force',
      '?lab_scenario=live&lab_scenario=loading&lab_capability=denied&lab_capability=native',
      '?lab_scenario=%3Cscript%3Ealert(1)%3C%2Fscript%3E&lab_capability=%7B%22native%22%3Atrue%7D',
      '?phase=live&lab_phase=ready&lab_temperature=220&src=https%3A%2F%2Fevil.example'
    ]) expect(readCameraSelection(query)).toEqual(defaultCameraSelection());
  });
  it('rejects unknown keys and preserves a valid selection', () => {
    const selected = readCameraSelection('?lab_scenario=fallback&lab_capability=unsupported');
    expect(setCameraSelection(selected, '__proto__', 'live')).toBe(selected);
    expect(setCameraSelection(selected, 'scenario', 'printer-live')).toBe(selected);
    expect(setCameraSelection(selected, 'capability', 'always-supported')).toBe(selected);
  });
});
