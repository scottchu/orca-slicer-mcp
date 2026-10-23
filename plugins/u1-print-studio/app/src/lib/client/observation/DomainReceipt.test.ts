import { cleanup, render } from '@testing-library/svelte';
import { afterEach, describe, expect, it } from 'vitest';
import DomainReceipt from '../../../components/observation/DomainReceipt.svelte';
import type { Evidence } from '../live/presentation';

afterEach(cleanup);

const observedAt = '2026-09-01T11:59:58.000Z';
const clock = new Intl.DateTimeFormat(undefined, {
  hour: 'numeric', minute: '2-digit', second: '2-digit',
}).format(new Date(observedAt));
const text = (container: HTMLElement) => container.textContent?.replace(/\s+/g, ' ').trim();

describe('domain receipt composition', () => {
  it.each([
    ['known', ''], ['stale', ''], ['unknown', ' · Unknown'],
    ['unsupported', ' · Unsupported'], ['unavailable', ' · Unavailable'],
    [undefined, ''],
  ] as const)('preserves explicit %s state without inventing absent evidence', (state, suffix) => {
    const view = render(DomainReceipt, { observedAt, freshness: 'fresh', state });
    expect(text(view.container)).toBe(`Observed ${clock}${suffix}`);
    expect(view.container.querySelector('.caption > [data-observed-meta]')).not.toBeNull();
    expect([...view.container.querySelectorAll('.words > span')].map((slot) => (slot as HTMLElement).style.width)).toEqual(['8ch', '12ch']);
  });

  it.each([false, true])('retains the caller not_requested policy, include=%s', (includeNotRequestedReason) => {
    const view = render(DomainReceipt, { observedAt, freshness: 'fresh', state: 'known', reason: 'not_requested', includeNotRequestedReason });
    expect(text(view.container)).toBe(`Observed ${clock}${includeNotRequestedReason ? ' · Not Requested' : ''}`);
  });

  it.each([
    ['known', ' · Not reported'], ['stale', ' · Not reported'],
    [undefined, ' · Not reported'], ['unknown', ' · Unknown'],
    ['unsupported', ' · Unsupported'], ['unavailable', ' · Unavailable'],
  ] as const)('keeps Cavity fallback below explicit %s state', (state, suffix) => {
    const view = render(DomainReceipt, { observedAt, freshness: 'fresh', state, fallbackState: 'not_reported', reason: 'not_requested', includeNotRequestedReason: true });
    expect(text(view.container)).toBe(`Observed ${clock}${suffix}· Not Requested`);
  });

  it('preserves Fans ungrouped ready/loading slots', async () => {
    const view = render(DomainReceipt, { observedAt, freshness: 'fresh', groupedTime: false });
    const widths = () => [...view.container.querySelectorAll('.words > span')].map((slot) => (slot as HTMLElement).style.width);
    expect(widths()).toEqual(['8ch', '9ch', '3ch']);
    await view.rerender({ observedAt, freshness: 'fresh', groupedTime: false, loading: true, state: 'unsupported', reason: 'network', fallbackState: 'not_reported' });
    expect(widths()).toEqual(['8ch', '9ch', '3ch']);
    expect(text(view.container)).toBe('');
    expect(view.container.querySelector('[data-loading-value]')).toHaveAttribute('aria-hidden', 'true');
  });

  it.each(['unknown', 'unsupported', 'unavailable', 'stale', 'known'] satisfies Evidence[])('masks time, state, reason and fallback while loading %s', (state) => {
    const view = render(DomainReceipt, { observedAt, freshness: 'offline', state, reason: 'not_requested', includeNotRequestedReason: true, fallbackState: 'not_reported', loading: true });
    expect(text(view.container)).toBe('');
    expect(view.container.querySelectorAll('time,[aria-label]')).toHaveLength(0);
    expect([...view.container.querySelectorAll('.words > span')].map((slot) => (slot as HTMLElement).style.width)).toEqual(['8ch', '12ch']);
  });

  it('keeps missing time/freshness distinct and never adds a fallback by default', () => {
    const view = render(DomainReceipt, { observedAt: null, freshness: 'offline', reason: 'not_reported' });
    expect(text(view.container)).toBe('Observation time unavailable · Offline· Not Reported');
    expect(view.container.querySelector('.words')).toBeNull();
  });
});
