import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/svelte';
import ObservationSkeleton from './ObservationSkeleton.svelte';
import ObservationState from './ObservationState.svelte';
import { loadingObservation, structureCount } from './loading';
import LoadingValue from '../ui/LoadingValue.svelte';
import BedMeshWidget from '../bed-mesh/BedMeshWidget.svelte';

afterEach(cleanup);
describe('shared legacy layout loading', () => {
  for (const view of ['overview', 'progress', 'heads', 'jobs', 'job_history', 'queue', 'bed_mesh'] as const) {
    it(`${view} renders structural loading without telemetry, focusable actions or WebGL`, () => {
      const { container } = view === 'bed_mesh'
        ? render(BedMeshWidget, { loading: true })
        : render(ObservationSkeleton, { view });
      expect(container.querySelector('[data-widget-shell]')).toHaveAttribute('aria-busy', 'true');
      expect(screen.getAllByRole('status')).toHaveLength(1);
      expect(screen.getByRole('status')).toHaveTextContent(/^Loading /);
      expect(container.querySelectorAll('button, canvas, video, time, [aria-valuenow], [data-percentage-fill], [data-copy-color]')).toHaveLength(0);
      expect(container.querySelector('[data-loading-value], [data-skeleton]')).not.toBeNull();
      expect(container.textContent).not.toMatch(/2026|220°|64%|#F4B927|Generic PLA|Parked|completed/i);
    });
    it(`${view} reports explicit terminal states`, () => {
      const { rerender } = render(ObservationState, { view, reason: 'unavailable' });
      expect(screen.getByRole('status')).toHaveTextContent('unavailable');
      return rerender({ view, reason: 'error' }).then(() => expect(screen.getByRole('status')).toHaveTextContent('Could not load'));
    });
  }
  it('admits only bounded structural count and never a loading observation', () => {
    expect(loadingObservation(true, undefined, () => { throw new Error('must not validate'); })).toBeNull();
    expect(() => loadingObservation(true, { percent: 20 }, () => 0)).toThrow();
    for (const rows of [-1, 21, NaN, Infinity, 2.5]) expect(() => structureCount(rows, 20)).toThrow();
    expect(structureCount(0, 20)).toBe(0);
  });
  it('rejects telemetry on the generic loading leaf', () => {
    expect(() => render(LoadingValue, { loading: true, text: '220°' })).toThrow('Loading values cannot carry telemetry');
  });
});
