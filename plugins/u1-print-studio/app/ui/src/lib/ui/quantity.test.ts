import { describe, expect, it } from 'vitest';
import { formatQuantity } from './quantity';
describe('generic quantity facts', () => {
  it('preserves exact accessible zero, fractional, tiny, and extreme values', () => {
    for (const value of [0, .5, Number.MIN_VALUE, Number.MAX_SAFE_INTEGER]) for (const unit of ['seconds', 'mm'] as const) {
      const result = formatQuantity(value, unit);
      expect(result.label).toBe(`${value} ${unit}`);
      expect(result.text).not.toBe('—');
      if (value > 0) expect(result.text).not.toMatch(/^0 /);
    }
  });
  it('keeps missing quantities distinct and rejects invalid or fractional bytes', () => {
    expect(formatQuantity(Number.MAX_SAFE_INTEGER, 'bytes').text).toBe('9,007,199,254,740,991 B');
    expect(formatQuantity(null, 'bytes')).toEqual({ text: '—', label: 'bytes not reported' });
    for (const value of [-1, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1, .5]) expect(() => formatQuantity(value, 'bytes')).toThrow();
  });
});
