import { cleanup, render } from '@testing-library/svelte';
import { afterEach, describe, expect, test } from 'vitest';
import ProgressPanel from '../../../components/observation/ProgressPanel.svelte';
import { focusedResult, focusedSnapshot } from '../../../../tests/browser/fixtures/live-focused';
import { adaptProgress } from '../live/progress-adapter';

afterEach(cleanup);
const presentation = (state: string, freshness: 'fresh' | 'stale' | 'offline' = 'fresh', reachable = true) => {
  const snapshot = focusedSnapshot();
  return adaptProgress(focusedResult('progress', { ...snapshot, freshness, status: { ...snapshot.status!, state, reachable, filename: null, ...(state === 'unknown' ? { progressPercent: null, currentLayer: null, totalLayers: null, elapsedSeconds: null, remainingSeconds: null } : {}) } }).structuredContent);
};
describe('Progress semantic states', () => {
  test('fresh standby omits job metrics and canvas instead of showing a zero-percent job', () => {
    const view = render(ProgressPanel, { lab: false, live: presentation('standby') });
    expect(view.getByText('No active print')).toBeTruthy();
    expect(view.queryByRole('progressbar')).toBeNull();
    expect(view.queryByRole('radiogroup')).toBeNull();
    expect(view.container.querySelector('canvas,.timing,.progress-detail')).toBeNull();
    expect(view.queryByText('Unknown')).toBeNull();
  });
  test.each([['unknown', 'fresh', true, 'Print status unknown'], ['standby', 'stale', true, 'Last reported: no active print'], ['standby', 'offline', false, 'Printer unavailable']] as const)('does not infer present idle from %s %s %s', (state, freshness, reachable, title) => {
    const view = render(ProgressPanel, { lab: false, live: presentation(state, freshness, reachable) });
    expect(view.getByText(title)).toBeTruthy();
    expect(view.queryByText('No active print', { exact: true })).toBeNull();
    expect(view.container.querySelector('canvas,.timing')).toBeNull();
  });
  test('unknown state retains independently reported job facts', () => {
    const live = presentation('printing'); live.printerState = 'unknown';
    const view = render(ProgressPanel, { lab: false, live });
    expect(view.getByText('Print status unknown')).toBeTruthy();
    expect(view.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '42');
    expect(view.getByText('Elapsed')).toBeTruthy();
  });
  test.each(['printing', 'paused'])('missing filename or geometry keeps %s metrics with compact preview status', (state) => {
    const view = render(ProgressPanel, { lab: false, live: presentation(state) });
    expect(view.queryByText('No active print')).toBeNull();
    expect(view.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '42');
    expect(view.container.querySelector('canvas')).toBeNull();
    expect(view.queryByRole('radiogroup')).toBeNull();
    expect(view.getByText('Elapsed')).toBeTruthy();
    expect(view.getByText('Remaining')).toBeTruthy();
    expect(view.getByText(/About/)).toBeTruthy();
  });
  test.each(['complete', 'cancelled', 'error'])('terminal %s preserves reported percentage and print time, omits remaining', (state) => {
    const view = render(ProgressPanel, { lab: false, live: presentation(state) });
    expect(view.getByText('Last reported job')).toBeTruthy();
    expect(view.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '42');
    expect(view.getByText('Print time')).toBeTruthy();
    expect(view.queryByText('Remaining')).toBeNull();
    expect(view.queryByRole('button', { name: /Retry/ })).toBeNull();
  });
  test('idle acquisition failure masks accepted copy and retains compact anatomy through retry', async () => {
    const live = presentation('standby');
    const view = render(ProgressPanel, { lab: false, live });
    await view.rerender({ lab: false, live, failure: 'error' });
    expect(view.container.querySelector('[data-widget-body]')?.textContent).not.toContain('fixture.gcode');
    expect(view.container.querySelector('[data-text-skeleton]')).toHaveAttribute('aria-hidden', 'true');
    expect(view.container.querySelector('canvas,.timing,.progress-track')).toBeNull();
    expect(view.getByRole('button', { name: 'Retry Print Progress' })).toBeTruthy();
    await view.rerender({ lab: false, live, failure: 'error', refreshing: true });
    expect(view.container.querySelector('canvas,.timing')).toBeNull();
    await view.rerender({ lab: false, live, failure: undefined, refreshing: false });
    expect(view.getByText('No active print')).toBeVisible();
  });
});
