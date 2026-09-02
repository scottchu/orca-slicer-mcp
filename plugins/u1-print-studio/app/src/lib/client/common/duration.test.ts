import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/svelte';
import { formatDurationValue } from './duration';
import DurationValue from '../../../components/common/DurationValue.svelte';
import DateTimeValue from '../../../components/common/DateTimeValue.svelte';
afterEach(cleanup);
describe('shared record time values', () => {
  it.each([null, -1, NaN, Infinity])('keeps invalid duration %s unknown', (value) => expect(formatDurationValue(value)).toEqual({ visible: '—', accessible: 'Duration not reported' }));
  it.each([[0, '0s'], [0.25, '0.25s'], [60, '1m 0s'], [3600, '1h 0m'], [86400, '1d 0h']] as const)('formats %s seconds compactly without changing exact evidence', (value, visible) => expect(formatDurationValue(value)).toEqual({ visible, accessible: `${value} seconds` }));
  it.each([Number.MIN_VALUE, Number.MAX_VALUE])('keeps extreme finite duration %s readable and exact in accessibility', (value) => {
    const actual = formatDurationValue(value); expect(actual.visible.length).toBeLessThan(14); expect(actual.visible).not.toMatch(/Infinity|NaN|^0s$/); expect(actual.accessible).toBe(`${value} seconds`);
  });
  it('loading exposes no fabricated metric and null is not zero', () => {
    const loading = render(DurationValue, { loading: true }); expect(loading.container.querySelector('[aria-label]')).toBeNull(); loading.unmount();
    const missing = render(DurationValue, { seconds: null }); expect(missing.getByRole('img')).toHaveAccessibleName('Duration not reported');
  });
  it.each(['1970-01-01T00:00:00.000Z', '+275760-09-13T00:00:00.000Z'])('date leaf retains exact source datetime %s', (value) => {
    const view = render(DateTimeValue, { value }); expect(view.container.querySelector('time')).toHaveAttribute('datetime', value); expect(view.container.textContent).not.toContain('Invalid');
  });
});
