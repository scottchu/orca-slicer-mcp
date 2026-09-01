import { describe, expect, it } from 'vitest';
import { assertLabBudgets, assertSelfContained } from '../../../scripts/private-lab-contract';

describe('three-artifact private lab budget and isolation', () => {
  it('accepts exact independently reviewed limits', () => {
    expect(() => assertLabBudgets(200_000, 700_000, 80_000)).not.toThrow();
  });
  it('rejects each individual cap at exactly plus one byte', () => {
    expect(() => assertLabBudgets(200_001, 1, 1)).toThrow('Light observation');
    expect(() => assertLabBudgets(1, 700_001, 1)).toThrow('Bed Mesh');
    expect(() => assertLabBudgets(1, 1, 80_001)).toThrow('Camera');
  });
  it('rejects every invalid position and exact aggregate plus one boundary', () => {
    for (const size of [0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
      expect(() => assertLabBudgets(size, 1, 1)).toThrow('Invalid');
      expect(() => assertLabBudgets(1, size, 1)).toThrow('Invalid');
      expect(() => assertLabBudgets(1, 1, size)).toThrow('Invalid');
    }
    expect(() => assertLabBudgets(200_000, 700_000, 80_000)).not.toThrow();
    expect(() => assertLabBudgets(200_000, 700_000, 80_001)).toThrow('aggregate');
  });
  it('rejects runtime script, stylesheet and media URLs', () => {
    for (const html of ['<script src="/module.js">', '<link rel="stylesheet" href="/style.css">', '<video src="https://example.test/feed">']) expect(() => assertSelfContained(html)).toThrow();
    expect(() => assertSelfContained('<video></video><canvas></canvas><script>void 0</script>')).not.toThrow();
  });
});
