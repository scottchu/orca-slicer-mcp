import { cleanup, render } from '@testing-library/svelte';
import { afterEach, describe, expect, it } from 'vitest';
import ObservedMeta from './ObservedMeta.svelte';
afterEach(cleanup);
describe('observation metadata slots', () => {
  it.each([false, true])('retains default or opt-in grouped slot structure, grouped=%s', (groupedTime) => {
    const observedAt = '2026-09-01T11:59:58.000Z';
    const ready = render(ObservedMeta, { observedAt, groupedTime });
    const slots = [...ready.container.querySelectorAll('.words > span')];
    expect(slots.map((slot) => (slot as HTMLElement).style.width)).toEqual(groupedTime ? ['8ch', '12ch'] : ['8ch', '9ch', '3ch']);
    const formatted = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit', second: '2-digit' }).format(new Date(observedAt));
    if (groupedTime) expect(slots[1].textContent).toBe(formatted);
    cleanup();
    const loading = render(ObservedMeta, { observedAt: null, loading: true, groupedTime });
    expect([...loading.container.querySelectorAll('.words > span')].map((slot) => (slot as HTMLElement).style.width)).toEqual(groupedTime ? ['8ch', '12ch'] : ['8ch', '9ch', '3ch']);
    expect(loading.container.textContent).not.toMatch(/Observed|AM|PM/);
    expect(loading.container.querySelector('[aria-hidden="true"]')).not.toBeNull();
  });
  it('unknown/offline metadata retains explicit evidence without fixed word slots', () => {
    const rendered = render(ObservedMeta, { observedAt: null, freshness: 'offline', groupedTime: true });
    expect(rendered.container.textContent).toContain('Observation time unavailable · Offline');
    expect(rendered.container.querySelector('.words')).toBeNull();
  });
});
