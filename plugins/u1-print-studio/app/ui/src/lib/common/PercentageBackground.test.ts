import { cleanup, fireEvent, render, screen } from '@testing-library/svelte';
import { afterEach, describe, expect, test, vi } from 'vitest';
import PercentageHarness from '../../../tests/fixtures/PercentageHarness.svelte';
import { percentageColor, percentageFill } from './percentage';

afterEach(cleanup);
describe('PercentageBackground', () => {
  test.each([[0, 100, 0], [25, 100, 25], [100, 200, 50], [200, 200, 100], [220, 200, 100], [Number.MAX_VALUE, Number.MIN_VALUE, 100]] as const)('bounds %s / %s to %s without replacing child values', (value, max, fill) => {
    expect(percentageFill(value, max)).toBe(fill);
    const { container } = render(PercentageHarness, { value, max });
    const background = container.querySelector('[data-percentage-background]')!;
    expect(background).toHaveAttribute('data-percentage-fill', String(fill));
    expect(screen.getByText(`Actual ${value} / Target ${max}`)).toBeVisible();
    expect(background).not.toHaveAttribute('aria-hidden');
    expect(background).not.toHaveAttribute('role');
    expect(screen.queryByRole('progressbar')).toBeNull();
  });
  test.each([[null, 100], [NaN, 100], [Infinity, 100], [-1, 100], [20, null], [20, 0], [20, -1], [20, Infinity], [20, NaN]] as const)('invalid %s / %s is neutral', (value, max) => {
    expect(percentageFill(value, max)).toBeNull();
    const { container } = render(PercentageHarness, { value, max });
    expect(container.querySelector('[data-percentage-background]')).toHaveAttribute('data-percentage-fill', '0');
    expect(container.querySelector('.filled')).toBeNull();
  });
  test('only omitted or exact six-digit hexadecimal colors are accepted', () => {
    expect(percentageColor(undefined)).toBeUndefined();
    expect(percentageColor('#A012EF')).toBe('#a012ef');
    for (const color of ['red', '#fff', '#112233ff', ' #112233', '#112233 ', 'var(--bad)', 'url(https://example.test/x)', '#123456;background:red', 'rgb(1,2,3)', '', '\n#123456', '#123456\n', '#123456\r', '#123456\u2028', '#123456\u2029']) {
      expect(percentageColor(color)).toBeNull();
      const { container } = render(PercentageHarness, { color });
      const background = container.querySelector('[data-percentage-background]')!;
      expect(background).toHaveAttribute('data-percentage-fill', '0');
      expect(background.getAttribute('style')).not.toContain(color || 'undefined');
      expect(container.querySelector('.filled')).toBeNull();
      cleanup();
    }
  });
  test('valid custom tint and children remain reactive and interactive', async () => {
    const onclick = vi.fn();
    const { container, rerender } = render(PercentageHarness, { value: 25, max: 100, color: '#A012EF', onclick });
    expect(container.querySelector('[data-percentage-background]')?.getAttribute('style')).toContain('#a012ef');
    await fireEvent.click(screen.getByRole('button', { name: 'Example action' }));
    expect(onclick).toHaveBeenCalledOnce();
    await rerender({ value: 220, max: 200, color: '#0055aa', onclick });
    expect(screen.getByText('Actual 220 / Target 200')).toBeVisible();
    expect(container.querySelector('[data-percentage-background]')).toHaveAttribute('data-percentage-fill', '100');
    await rerender({ value: 0, max: 200, color: '#0055aa', onclick });
    expect(container.querySelector('.filled')).toBeNull();
  });
});
