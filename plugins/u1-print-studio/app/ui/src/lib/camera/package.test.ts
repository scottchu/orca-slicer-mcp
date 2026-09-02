import { describe, expect, it } from 'vitest';
import { assertLabSizes, assertSelfContained } from '../../../scripts/private-lab-contract';

describe('three-artifact private lab integrity and isolation', () => {
  it('accepts positive measured sizes without individual or aggregate byte ceilings', () => {
    expect(() => assertLabSizes(250_001, 700_001, 100_001)).not.toThrow();
    expect(() => assertLabSizes(1_000_000, 1_000_000, 1_000_000)).not.toThrow();
  });
  it('rejects invalid measurements at every position', () => {
    for (const size of [0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
      expect(() => assertLabSizes(size, 1, 1)).toThrow('Invalid');
      expect(() => assertLabSizes(1, size, 1)).toThrow('Invalid');
      expect(() => assertLabSizes(1, 1, size)).toThrow('Invalid');
    }
  });
  it('rejects runtime script, stylesheet and media URLs', () => {
    for (const html of ['<script src="/module.js">', '<link rel="stylesheet" href="/style.css">', '<video src="https://example.test/feed">']) expect(() => assertSelfContained(html)).toThrow();
    expect(() => assertSelfContained('<video></video><canvas></canvas><script>void 0</script>')).not.toThrow();
  });
});
