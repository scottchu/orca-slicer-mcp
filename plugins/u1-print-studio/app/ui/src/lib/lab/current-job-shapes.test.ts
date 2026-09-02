import { describe, expect, it } from 'vitest';
import { readSelection } from './controller';
import { currentJobLoadingShapes } from './current-job-shapes';

describe('closed Current Job public loading structure', () => {
  it.each([
    ['printing', 'Current job'], ['paused', 'Paused job'], ['standby', 'Loaded file'],
    ['complete', 'Last reported job'], ['error', 'Last reported job'],
    ['cancelled', 'Last reported job'], ['unknown', 'Reported file']
  ])('preserves intrinsic public %s context without numeric telemetry', (state, label) => {
    const shape = currentJobLoadingShapes(readSelection('jobs', `?lab_scenario=${state}`));
    expect(shape.fileLabel).toBe(label);
    expect(shape.quantities).toHaveLength(5);
    expect(shape.quantities.join('')).not.toMatch(/[1-9]/);
  });
  it('maps closed zero, unknown, extreme and filename variants without arbitrary input', () => {
    for (const facts of ['zero', 'unknown', 'extreme']) for (const filename of ['empty', 'unreported', 'long']) {
      const shape = currentJobLoadingShapes(readSelection('jobs', `?lab_facts=${facts}&lab_filename=${filename}`));
      for (const value of [shape.state, shape.fileLabel, shape.filename, shape.storage, ...shape.quantities]) {
        expect([...value].length).toBeGreaterThan(0);
        expect([...value].length).toBeLessThanOrEqual(320);
      }
    }
  });
});
