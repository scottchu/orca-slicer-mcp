import { cleanup, render } from '@testing-library/svelte';
import { tick } from 'svelte';
import { afterEach, describe, expect, it } from 'vitest';
import LiveObservationRoot from '../../../components/live/LiveObservationRoot.svelte';
import LiveThermalsRoot from '../../../components/live/LiveThermalsRoot.svelte';
import HeadsPanel from '../../../components/observation/HeadsPanel.svelte';
import { adaptFans } from '../live/fans-adapter';
import { adaptThermals } from '../live/thermals-adapter';
import type { LiveState } from '../live/controller';
import type { HeadsPresentation } from '../live/heads-presentation';
import type { Evidence } from '../live/presentation';
import { liveFansResult } from '../../../../tests/browser/fixtures/live-fans';
import { liveThermalsResult } from '../../../../tests/browser/fixtures/live-thermals';

afterEach(cleanup);

// A presentation-only state source: no ports, timers or acquisition effects.
const controllerFor = <T,>(observation: T | null) => {
  let state: LiveState<T> = { observation, phase: observation ? 'ready' : 'loading', refreshing: false, feedback: '' };
  const listeners = new Set<(state: LiveState<T>) => void>();
  return {
    getState: () => state,
    subscribe: (listener: (state: LiveState<T>) => void) => {
      listeners.add(listener);
      listener(state);
      return () => { listeners.delete(listener); };
    },
    start: () => {},
    refresh: async () => {},
    dispose: () => { listeners.clear(); },
    publish: (next: Partial<LiveState<T>>) => {
      state = { ...state, ...next };
      for (const listener of listeners) listener(state);
    },
  };
};
const clock = (value: string) => new Intl.DateTimeFormat(undefined, {
  hour: 'numeric', minute: '2-digit', second: '2-digit',
}).format(new Date(value));
const receipt = (container: HTMLElement, index = 0) => container.querySelectorAll('[data-observed-meta]')[index];
const copy = (element: Element | null | undefined) => element?.textContent?.replace(/\s+/g, ' ').trim();
const widths = (element: Element) => [...element.querySelectorAll('.words > span')].map((slot) => (slot as HTMLElement).style.width);

describe('receipt consumer policies', () => {
  it('keeps Fans receipt slots and healthy-refresh time, then masks settled failure', async () => {
    const observation = adaptFans(liveFansResult().structuredContent);
    const controller = controllerFor(observation);
    const view = render(LiveObservationRoot, { controller });
    const observed = copy(receipt(view.container)?.parentElement);
    expect(observed).toBe(`Observed ${clock(observation.receipt.sourceObservedAt!)}`);
    expect(widths(receipt(view.container)!)).toEqual(['8ch', '9ch', '3ch']);
    controller.publish({ refreshing: true });
    await tick();
    expect(copy(receipt(view.container)?.parentElement)).toBe(observed);
    controller.publish({ refreshing: false, failure: 'error', feedback: 'Could not load Fans & Air' });
    await tick();
    expect(copy(receipt(view.container)?.parentElement)).toBe('');
    expect(widths(receipt(view.container)!)).toEqual(['8ch', '9ch', '3ch']);
    expect(view.container.textContent).not.toContain(clock(observation.receipt.sourceObservedAt!));
  });

  it('does not add Unknown for a missing Fans observation', () => {
    const controller = controllerFor<ReturnType<typeof adaptFans>>(null);
    const view = render(LiveObservationRoot, { controller });
    expect(copy(receipt(view.container)?.parentElement)).toBe('');
    expect(view.container.querySelector('[data-widget-header]')?.textContent).not.toContain('Unknown');
  });

  it('keeps Materials independent time, grouped slots and explicit not_requested reason', async () => {
    const observedAt = '2026-09-01T12:00:00.000Z';
    const materials: HeadsPresentation['materials'] = {
      state: 'unknown', freshness: 'fresh', sourceObservedAt: '2026-09-01T11:59:58.000Z',
      receivedAt: null, checkedAt: null, reason: 'not_requested',
    };
    const view = render(HeadsPanel, { items: [], observedAt, freshness: 'fresh', materials, phase: 'ready' });
    expect(copy(receipt(view.container, 0))).toBe(`Observed ${clock(observedAt)}`);
    expect(copy(receipt(view.container, 1)?.parentElement)).toBe(`Observed ${clock(materials.sourceObservedAt!)} · Unknown· Not Requested`);
    expect(widths(receipt(view.container, 1)!)).toEqual(['8ch', '12ch']);
    await view.rerender({ items: [], observedAt, freshness: 'fresh', materials, phase: 'ready', refreshing: true });
    expect(copy(receipt(view.container, 1)?.parentElement)).toBe(`Observed ${clock(materials.sourceObservedAt!)} · Unknown· Not Requested`);
    await view.rerender({ items: [], observedAt, freshness: 'fresh', materials, phase: 'error' });
    expect(copy(receipt(view.container, 1)?.parentElement)).toBe('');
    expect(view.container.textContent).not.toContain('Not Requested');
  });

  it('keeps an absent Materials receipt free of an invented state suffix', () => {
    const view = render(HeadsPanel, { items: [], phase: 'ready' });
    expect(copy(receipt(view.container, 1)?.parentElement)).toBe('Observation time unavailable · Freshness unknown');
  });

  it.each([
    ['known', 'Not reported'], ['stale', 'Not reported'], ['unknown', 'Unknown'],
    ['unsupported', 'Unsupported'], ['unavailable', 'Unavailable'],
  ] satisfies [Evidence, string][])('keeps Cavity %s precedence and its independent receipt', (state, label) => {
    const observation = adaptThermals(liveThermalsResult().structuredContent);
    observation.environment.state = state;
    observation.environment.reason = 'not_requested';
    observation.readings[5].reportedState = 'not_reported';
    const controller = controllerFor(observation);
    const view = render(LiveThermalsRoot, { controller });
    expect(copy(receipt(view.container, 0))).toBe(`Observed ${clock(observation.sourceObservedAt!)}`);
    expect(copy(receipt(view.container, 1)?.parentElement)).toBe(`Observed ${clock(observation.environment.sourceObservedAt!)} · ${label}· Not Requested`);
    expect(widths(receipt(view.container, 1)!)).toEqual(['8ch', '12ch']);
  });

  it('masks Cavity fallback and reason during acquisition failure, retaining receipt slots', async () => {
    const observation = adaptThermals(liveThermalsResult().structuredContent);
    observation.environment.reason = 'not_requested';
    observation.readings[5].reportedState = 'not_reported';
    const controller = controllerFor(observation);
    const view = render(LiveThermalsRoot, { controller });
    controller.publish({ failure: 'error', feedback: 'Could not load Thermals' });
    await tick();
    expect(copy(receipt(view.container, 0))).toBe('');
    expect(copy(receipt(view.container, 1)?.parentElement)).toBe('');
    expect(widths(receipt(view.container, 1)!)).toEqual(['8ch', '12ch']);
    expect(view.container.textContent).not.toMatch(/Not reported|Not Requested|Observed/);
  });
});
