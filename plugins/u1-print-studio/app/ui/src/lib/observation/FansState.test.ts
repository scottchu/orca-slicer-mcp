import { cleanup, fireEvent, render, screen, within } from '@testing-library/svelte';
import { afterEach, expect, test } from 'vitest';
import FansWidget from './FansWidget.svelte';
import MetricValue from '../common/MetricValue.svelte';
import { fansLabFixture } from '../fixtures/observations';
import { fanNames } from './fan-labels';

afterEach(cleanup);
test.each([[0, '%', '0%', '0 percent'], [45.6, '%', '46%', '46 percent'], [9126, 'RPM', '9,126 RPM', '9126 revolutions per minute'], [0, 'RPM', '0 RPM', '0 revolutions per minute'], [null, '%', 'N/A', 'Percentage unavailable'], [null, 'RPM', 'N/A', 'Rotational speed unavailable']] as const)('metric %s %s keeps value and units', (value, unit, visible, accessible) => {
  render(MetricValue, { value, unit });
  expect(screen.getByRole('img', { name: accessible })).toHaveTextContent(visible);
});
test('loading has known structure but no telemetry, gradient or action', async () => {
  const { container, rerender } = render(FansWidget, { state: { kind: 'loading' } });
  expect(screen.getByRole('article')).toHaveAttribute('aria-busy', 'true');
  expect(screen.getByRole('status')).toHaveTextContent('Loading Fans & Air');
  expect(screen.getAllByRole('listitem').map((row) => row.getAttribute('aria-label'))).toEqual(Object.values(fanNames));
  expect(container.querySelectorAll('[data-metric-unit]')).toHaveLength(14);
  expect(container.querySelector('[data-percentage-background], button,input,a,[tabindex]')).toBeNull();
  expect(container.textContent).not.toMatch(/N\/A|RPM|%|Observed|Cool Chamber|9,126/);
  expect(container.querySelectorAll('[data-skeleton]')).toHaveLength(16);
  expect(container.querySelectorAll('[data-observed-meta] [data-loading-value]')).toHaveLength(1);
  await rerender({ state: { kind: 'ready', observation: fansLabFixture } });
  expect(screen.getByRole('status')).toHaveTextContent('Fans & Air loaded');
  expect(container.querySelector('[data-skeleton]')).toBeNull();
  expect(container.querySelectorAll('[data-percentage-background]')).toHaveLength(7);
});
test('percentage and RPM are independent; unknown differs from literal zero', () => {
  const observation = structuredClone(fansLabFixture);
  observation.items[0] = { id: 'tool-1-part', percent: null, rpm: 0 };
  observation.items[1] = { id: 'tool-2-part', percent: 0, rpm: null };
  observation.items[2] = { id: 'tool-3-part', percent: 33.3, rpm: 100_000 };
  observation.purifierMode = null;
  const { container } = render(FansWidget, { observation });
  const first = within(screen.getByRole('listitem', { name: 'Tool 1' }));
  expect(first.getByRole('img', { name: 'Percentage unavailable' })).toHaveTextContent('N/A');
  expect(first.getByRole('img', { name: '0 revolutions per minute' })).toHaveTextContent('0 RPM');
  const second = within(screen.getByRole('listitem', { name: 'Tool 2' }));
  expect(second.getByRole('img', { name: '0 percent' })).toHaveTextContent('0%');
  expect(second.getByRole('img', { name: 'Rotational speed unavailable' })).toHaveTextContent('N/A');
  expect(container.querySelectorAll('[data-percentage-background]')[2]).toHaveAttribute('data-percentage-fill', '33.3');
  expect(container).toHaveTextContent('100,000 RPM');
  expect(container.textContent).not.toMatch(/Commanded|Measured|Stopped|Running|Off|Fault/);
});
test('refresh preserves values/source time and terminal states clear prior feedback', async () => {
  const { container, rerender } = render(FansWidget, { state: { kind: 'ready', observation: fansLabFixture } });
  const observed = container.querySelector('[data-observed-meta]')!.textContent;
  const values = [...container.querySelectorAll('[data-metric-unit]')].map((node) => node.textContent);
  await fireEvent.click(screen.getByRole('button'));
  await rerender({ state: { kind: 'ready', observation: fansLabFixture, refreshing: true } });
  expect(screen.getByRole('status')).toHaveTextContent('Refreshing Fans & Air');
  expect(screen.getByRole('button')).toBeDisabled();
  expect(container.querySelector('[data-observed-meta]')!.textContent).toBe(observed);
  expect([...container.querySelectorAll('[data-metric-unit]')].map((node) => node.textContent)).toEqual(values);
  for (const kind of ['loading', 'error', 'unavailable'] as const) {
    await rerender({ state: { kind } });
    expect(screen.getAllByRole('status')).toHaveLength(1);
    expect(container.querySelector('[data-percentage-background]')).toBeNull();
    expect(container).not.toHaveTextContent('9,126 RPM');
  }
});
