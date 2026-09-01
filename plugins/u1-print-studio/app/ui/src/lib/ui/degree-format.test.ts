import { describe, expect, it } from 'vitest';
import { formatDegree } from './format';
describe('finite source-bound degree formatting', () => {
  it.each([Number.MAX_VALUE, -Number.MAX_VALUE, 1e20, -1e20, 1e6])('renders %s compactly without Infinity and retains exact accessible value', (value) => {
    for (const precision of [0, 1] as const) {
      const result = formatDegree(value, precision);
      expect(result.visible.length).toBeLessThanOrEqual(10);
      expect(result.visible).toMatch(/^-?\d\.\de\d+°$/);
      expect(result.visible).not.toContain('Infinity');
      expect(result.accessible).toBe(`${value} degrees Celsius`);
    }
  });
  it.each([[220, '220°'], [0, '0°'], [-0, '0°'], [-273.15, '-273°'], [999, '999°']])('keeps ordinary degrees unchanged', (value, visible) => {
    expect(formatDegree(value as number).visible).toBe(visible);
  });
});
