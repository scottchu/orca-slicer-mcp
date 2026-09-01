import { cleanup, fireEvent, render, screen, within } from '@testing-library/svelte';
import { afterEach, expect, test } from 'vitest';
import ThermalsWidget from './ThermalsWidget.svelte';
import ActualTarget from './ActualTarget.svelte';
import { thermalsLabFixture } from '../fixtures/observations';

afterEach(cleanup);
test('thermal composite retains actual/target order, units, zero and missing', () => {
  render(ActualTarget, { props: { actual: 0, target: null } });
  const images = screen.getAllByRole('img');
  expect(images[0]).toHaveAccessibleName('Actual: 0 degrees Celsius');
  expect(images[1]).toHaveAccessibleName('Target: Temperature unavailable');
});
test('loading is six rows, one announcer, no telemetry or actions', async () => {
  const { container, rerender } = render(ThermalsWidget, { state: { kind: 'loading' } });
  expect(screen.getByRole('article')).toHaveAttribute('aria-busy', 'true');
  expect(screen.getAllByRole('status')).toHaveLength(1);
  expect(screen.getByRole('status')).toHaveTextContent('Loading Thermals');
  expect(container.querySelectorAll('[data-reading-row]')).toHaveLength(6);
  expect(container.querySelectorAll('[data-skeleton="degree"]')).toHaveLength(12);
  expect(container.querySelectorAll('[data-reading-row] svg')).toHaveLength(6);
  expect(container.textContent).not.toMatch(/Observed|°|220|Active|Idle/);
  expect(container.querySelector('button,input,a,[tabindex]')).toBeNull();
  await rerender({ state: { kind: 'ready', observation: thermalsLabFixture } });
  expect(screen.getByRole('article')).toHaveAttribute('aria-busy', 'false');
  expect(screen.getByRole('status')).toHaveTextContent('Thermals loaded');
  expect(container.querySelectorAll('[data-skeleton]')).toHaveLength(0);
  expect(screen.getAllByRole('listitem')).toHaveLength(6);
  expect(screen.getByRole('listitem', { name: 'Tool 1 · Active' })).toHaveClass('active');
  expect(within(screen.getByRole('listitem', { name: 'Cavity · Idle' })).getByRole('img', { name: 'Target: Temperature unavailable' })).toHaveTextContent('—');
});
test('refresh retains data/source time and terminal states supersede feedback', async () => {
  const { container, rerender } = render(ThermalsWidget, { state: { kind: 'ready', observation: thermalsLabFixture } });
  const observed = container.querySelector('[data-observed-meta]')!.textContent;
  await fireEvent.click(screen.getByRole('button'));
  expect(screen.getByRole('status')).toHaveTextContent('Lab fixture refreshed');
  await rerender({ state: { kind: 'ready', observation: thermalsLabFixture, refreshing: true } });
  expect(screen.getByRole('status')).toHaveTextContent('Refreshing Thermals');
  expect(container.querySelector('[data-observed-meta]')!.textContent).toBe(observed);
  expect(screen.getAllByRole('listitem')).toHaveLength(6);
  expect(container.querySelector('[data-skeleton]')).toBeNull();
  expect(screen.getByRole('button')).toBeDisabled();
  for (const kind of ['loading', 'error', 'unavailable'] as const) {
    await rerender({ state: { kind: 'ready', observation: thermalsLabFixture } });
    await fireEvent.click(screen.getByRole('button'));
    await rerender({ state: { kind } });
    expect(screen.getAllByRole('status')).toHaveLength(1);
    expect(screen.getByRole('status')).not.toHaveTextContent('Lab fixture refreshed');
    expect(container.querySelector('.widget-feedback')).toBeNull();
    expect(container.textContent).not.toContain('220°');
  }
});
