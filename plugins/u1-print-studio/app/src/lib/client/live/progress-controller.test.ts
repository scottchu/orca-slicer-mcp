import { afterEach, expect, it, vi } from 'vitest';
import { mountProgressRefresh } from './progress-controller';

afterEach(() => vi.useRealTimers());

it('schedules only settled visible Progress, stops during page suspension and releases listeners', async () => {
  vi.useFakeTimers();
  const page = new EventTarget(), document = new EventTarget();
  let hidden = false, refreshing = false, changed = () => {};
  Object.defineProperties(document, { hidden: { get: () => hidden }, defaultView: { value: page } });
  const refresh = vi.fn(async () => { refreshing = true; changed(); });
  const unsubscribe = vi.fn();
  const controller = {
    getState: () => ({ refreshing, observation: { refreshAfterSeconds: 15 } }), refresh,
    subscribe: (listener: () => void) => { changed = listener; listener(); return unsubscribe; },
  } as unknown as Parameters<typeof mountProgressRefresh>[0];
  const stop = mountProgressRefresh(controller, document as Document);
  try {
    await vi.advanceTimersByTimeAsync(14_999); expect(refresh).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1); expect(refresh).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(60_000); expect(refresh).toHaveBeenCalledTimes(1);
    refreshing = false; changed(); hidden = true; document.dispatchEvent(new Event('visibilitychange'));
    await vi.advanceTimersByTimeAsync(60_000); expect(refresh).toHaveBeenCalledTimes(1);
    hidden = false; document.dispatchEvent(new Event('visibilitychange')); expect(refresh).toHaveBeenCalledTimes(2);
    refreshing = false; changed(); page.dispatchEvent(new Event('pagehide'));
    await vi.advanceTimersByTimeAsync(60_000); expect(refresh).toHaveBeenCalledTimes(2);
    page.dispatchEvent(new Event('pageshow')); expect(refresh).toHaveBeenCalledTimes(3);
    refreshing = false; changed();
  } finally { stop(); }
  await vi.advanceTimersByTimeAsync(60_000);
  page.dispatchEvent(new Event('pageshow')); document.dispatchEvent(new Event('visibilitychange'));
  expect(refresh).toHaveBeenCalledTimes(3); expect(unsubscribe).toHaveBeenCalledOnce(); expect(vi.getTimerCount()).toBe(0);
});
