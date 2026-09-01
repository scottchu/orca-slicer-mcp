import { describe, expect, it } from 'vitest';
import { assertLabBudgets, assertSelfContained } from '../../../scripts/private-lab-contract';

describe('two-artifact private lab budget and isolation', () => {
  it('accepts exact independently reviewed limits', () => {
    for (const [observation, camera] of [[756_000, 80_000], [755_999, 80_000], [756_000, 79_999]]) expect(() => assertLabBudgets(observation, camera)).not.toThrow();
  });
  it('rejects individual or invalid sizes, regardless of aggregate room', () => {
    expect(() => assertLabBudgets(756_001, 1)).toThrow('Observation');
    expect(() => assertLabBudgets(1, 80_001)).toThrow('Camera');
    for (const size of [0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
      expect(() => assertLabBudgets(size, 1)).toThrow('Invalid');
      expect(() => assertLabBudgets(1, size)).toThrow('Invalid');
    }
  });
  it('rejects oversized aggregate bytes without treating each file as a new observation allowance', () => {
    expect(() => assertLabBudgets(756_000, 80_001)).toThrow('aggregate');
    expect(() => assertLabBudgets(749_000, 749_000)).toThrow();
  });
  it('rejects runtime script, stylesheet and media URLs', () => {
    for (const html of ['<script src="/module.js">', '<link rel="stylesheet" href="/style.css">', '<video src="https://example.test/feed">']) expect(() => assertSelfContained(html)).toThrow();
    expect(() => assertSelfContained('<video></video><canvas></canvas><script>void 0</script>')).not.toThrow();
  });
});
