import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/svelte';
import ObservationSkeleton from './ObservationSkeleton.svelte';
import { loadingObservation, structureCount } from './loading';
import LoadingValue from '../common/LoadingValue.svelte';
import BedMeshWidget from '../bed-mesh/BedMeshWidget.svelte';
import HeadCards from './HeadCards.svelte';

const expectNoLoadingTelemetry = (container: HTMLElement, heads = false) => {
  const copy = container.cloneNode(true) as HTMLElement;
  for (const skeleton of heads ? copy.querySelectorAll('[data-text-skeleton]') : []) {
    expect(skeleton.tagName).toBe('SPAN');
    expect(skeleton.getAttributeNames().every((name) =>
      ['class', 'data-loading-value', 'data-text-skeleton', 'aria-hidden'].includes(name))).toBe(true);
    expect(skeleton).toHaveClass('text-skeleton');
    expect(skeleton).toHaveAttribute('data-loading-value');
    expect(skeleton).toHaveAttribute('aria-hidden', 'true');
    expect(skeleton.childElementCount).toBe(0);
    expect(skeleton.matches('[aria-label], [aria-description], [title], [alt]')).toBe(false);
    expect(['Generic PLA', '—']).toContain(skeleton.textContent);
    expect(skeleton.parentElement).toHaveClass('caption');
    expect(skeleton.parentElement?.parentElement?.querySelector('.lucide-spool')).not.toBeNull();
    expect(skeleton.closest('[data-inset-card]')).not.toBeNull();
    // Only this exact public, inaccessible leaf is excluded; all other text,
    // including unmarked or merely aria-hidden telemetry, remains checked.
    skeleton.remove();
  }
  expect(copy.textContent).not.toMatch(/2026|220°|64%|#F4B927|Generic PLA|Parked|completed/i);
  for (const node of copy.querySelectorAll('[aria-label], [aria-description], [title], [alt]')) {
    for (const name of ['aria-label', 'aria-description', 'title', 'alt']) {
      expect(node.getAttribute(name) ?? '').not.toMatch(/2026|220°|64%|#F4B927|Generic PLA|Parked|completed/i);
    }
  }
};

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
      expectNoLoadingTelemetry(container, view === 'heads');
    });
    it(`${view} reports explicit terminal states`, () => {
      if (view === 'bed_mesh') {
        const { container } = render(BedMeshWidget, { failure: 'unavailable' });
        expect(container.querySelector('[data-widget-shell]')).toHaveAttribute('aria-busy', 'false');
        expect(container.querySelector('[data-skeleton]')).not.toBeNull();
        return;
      }
      const { rerender, container } = render(ObservationSkeleton, { view, failure: 'unavailable' });
      expect(screen.getByRole('status')).toHaveTextContent('unavailable');
      expect(container.querySelector('[data-skeleton], [data-loading-value]')).not.toBeNull();
      return rerender({ view, failure: 'error' }).then(() => expect(screen.getByRole('status')).toHaveTextContent('Could not load'));
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

  it('permits only public nominal/empty skeletons when private head readings are injected', () => {
    const privateMaterial = 'Private vendor secret PETG';
    const { container } = render(HeadCards, {
      loading: true, materialShapes: ['nominal', 'empty', 'nominal', 'empty'],
      items: [{ physicalTool: 1, active: true, state: 'active', material: privateMaterial,
        presence: true, color: '#F4B927FF', actual: 220, target: 220 }],
    });
    expect([...container.querySelectorAll('[data-text-skeleton]')].map((node) => node.textContent))
      .toEqual(['Generic PLA', '—', 'Generic PLA', '—']);
    expect(container.innerHTML).not.toMatch(/Private vendor secret PETG|220|#F4B927/i);
    expect(container.querySelectorAll('button, canvas, video, time, [aria-valuenow], [data-percentage-fill], [data-copy-color]')).toHaveLength(0);
    expectNoLoadingTelemetry(container, true);
  });

  it.each(['private template', 'accessible template', 'unmarked template', 'template accessible label', 'visible label', 'hidden label', 'accessible label', 'tabindex', 'contenteditable', 'href', 'role', 'button tag'])(
    'keeps the loading privacy guard effective for %s', (violation) => {
      const { container } = render(ObservationSkeleton, { view: 'heads' });
      const skeleton = container.querySelector('[data-text-skeleton]')!;
      if (violation === 'private template') skeleton.textContent = 'Private vendor secret PETG';
      else if (violation === 'accessible template') skeleton.removeAttribute('aria-hidden');
      else if (violation === 'unmarked template') skeleton.removeAttribute('data-text-skeleton');
      else if (violation === 'template accessible label') skeleton.setAttribute('aria-label', 'Private vendor secret PETG');
      else if (violation === 'tabindex') skeleton.setAttribute('tabindex', '0');
      else if (violation === 'contenteditable') skeleton.setAttribute('contenteditable', 'true');
      else if (violation === 'href') skeleton.setAttribute('href', '#fixture');
      else if (violation === 'role') skeleton.setAttribute('role', 'button');
      else if (violation === 'button tag') {
        const button = document.createElement('button');
        for (const attribute of skeleton.attributes) button.setAttribute(attribute.name, attribute.value);
        button.textContent = skeleton.textContent;
        skeleton.replaceWith(button);
      }
      else {
        const label = document.createElement('span');
        if (violation === 'accessible label') label.setAttribute('aria-label', 'Generic PLA 220°');
        else label.textContent = 'Generic PLA 220°';
        if (violation === 'hidden label') label.setAttribute('aria-hidden', 'true');
        container.append(label);
      }
      expect(() => expectNoLoadingTelemetry(container, true)).toThrow();
    }
  );
});
