import { cleanup, fireEvent, render } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import BedMeshWidget from '../../../components/bed-mesh/BedMeshWidget.svelte';
import { bedMeshLabFixture } from '../fixtures/bed-mesh';
const renderer = vi.hoisted(() => vi.fn());
vi.mock('../../../components/bed-mesh/BedMesh3D.svelte', () => ({ default: () => { renderer(); return {}; } }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe('Bed initial and retained failures', () => {
  it.each(['error', 'unavailable'] as const)('preserves neutral structure for initial %s without renderer/busy/fake telemetry', (failure) => {
    const view = render(BedMeshWidget, { failure });
    expect(view.container.querySelector('[data-widget-shell]')).toHaveAttribute('aria-busy', 'false');
    expect(view.container.querySelector('[data-widget-state-surface]')).toHaveClass('static-structure');
    expect(view.container.querySelector('[data-chart-frame]')).toBeTruthy();
    expect(view.container.querySelectorAll('[data-skeleton="chart"]')).toHaveLength(1);
    expect(view.container.querySelectorAll('[data-widget-header],[data-widget-footer]')).toHaveLength(2);
    expect(view.container.querySelectorAll('canvas,time,button')).toHaveLength(0);
    expect(view.container.querySelectorAll('[aria-live="polite"]')).toHaveLength(1);
    expect(view.container.querySelector('[aria-live="polite"]')).toHaveTextContent(failure === 'error' ? 'Could not load bed mesh' : 'Bed mesh unavailable');
    expect(view.container.textContent).not.toMatch(/Loading|11 × 11|-0\.175|0\.136/);
    expect(renderer).not.toHaveBeenCalled();
  });
  it('keeps shell/chart/footer and Retry DOM through local retry without stealing focus', async () => {
    const onretry = vi.fn();
    const view = render(BedMeshWidget, { failure: 'error', onretry });
    const button = view.getByRole('button', { name: 'Retry bed mesh' }); button.focus();
    const nodes = [...view.container.querySelectorAll('[data-widget-shell],[data-widget-header],[data-chart-frame],[data-widget-footer]')];
    await fireEvent.click(button); expect(onretry).toHaveBeenCalledOnce();
    await view.rerender({ failure: undefined, retrying: true, refreshing: true, onretry });
    expect(view.getByRole('button')).toBe(button); expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(view.getByRole('status')).toHaveTextContent('Could not load bed mesh');
    await fireEvent.click(button); expect(onretry).toHaveBeenCalledOnce();
    await view.rerender({ observation: bedMeshLabFixture, retrying: false, refreshing: false, onretry });
    expect(view.getByRole('button', { name: 'Reset bed mesh view' })).toBe(button);
    expect(document.activeElement).toBe(button);
    expect([...view.container.querySelectorAll('[data-widget-shell],[data-widget-header],[data-chart-frame],[data-widget-footer]')]).toEqual(nodes);
  });
  it('preserves masked renderer, clears receipt and no callback means no Retry', async () => {
    const view = render(BedMeshWidget, { observation: bedMeshLabFixture });
    const receipt = view.container.querySelector('[data-observed-meta]');
    const priorText = receipt!.textContent;
    const frame = view.container.querySelector('[data-chart-frame]');
    const calls = renderer.mock.calls.length;
    await view.rerender({ observation: bedMeshLabFixture, failure: 'error' });
    expect(renderer).toHaveBeenCalledTimes(calls);
    expect(view.container.querySelector('[data-chart-frame]')).toBe(frame);
    expect(view.container.querySelector('[data-observed-meta]')).toBe(receipt);
    expect(receipt!.textContent).not.toBe(priorText);
    expect(receipt!.querySelector('[data-loading-value]')).toBeTruthy();
    expect(view.container.querySelector('[data-retained-layer]')).toHaveProperty('inert', true);
    expect(view.container.querySelector('[data-retained-layer]')).toHaveAttribute('aria-hidden', 'true');
    expect(view.container.querySelector('[data-skeleton="chart"]')).toBeTruthy();
    expect(view.container.querySelector('[aria-live="polite"]')).toHaveTextContent('Could not load bed mesh');
    expect(view.queryByRole('button', { name: 'Retry bed mesh' })).toBeNull();
    expect(view.queryByRole('button', { name: 'Reset bed mesh view' })).toBeNull();
  });
});
