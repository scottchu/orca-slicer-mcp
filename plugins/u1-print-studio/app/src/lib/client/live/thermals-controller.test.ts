import { afterEach, describe, expect, it, vi } from 'vitest';
import { createThermalsController } from './thermals-controller';
import { liveThermalsResult } from '../../../../tests/browser/fixtures/live-thermals';
import { liveFansResult } from '../../../../tests/browser/fixtures/live-fans';
const setup = () => {
  let notify = (_value: unknown) => {}, resolve = (_value: unknown) => {}, reject = (_error: Error) => {};
  const port = { start: vi.fn(async () => {}), refresh: vi.fn(() => new Promise<unknown>((yes, no) => { resolve = yes; reject = no; })), subscribe: (listener: (value: unknown) => void) => { notify = listener; return vi.fn(); }, dispose: vi.fn() };
  const controller = createThermalsController(port, 100);
  return { controller, port, notify: (value: unknown) => notify(value), resolve: (value: unknown) => resolve(value), reject: () => reject(new Error('network')) };
};
afterEach(() => vi.useRealTimers());
describe('Thermals shares reviewed observation lifecycle', () => {
  it('starts empty, coalesces, ignores Fans/invalid notifications and retains separate receipts', async () => {
    const { controller, notify, resolve, port } = setup(); expect(controller.getState().observation).toBeNull();
    notify(liveThermalsResult()); const old = controller.getState().observation;
    const pending = controller.refresh(); expect(controller.refresh()).toBe(pending);
    notify(liveFansResult()); notify({ isError: true });
    expect(controller.getState()).toMatchObject({ observation: old, refreshing: true, feedback: '' });
    resolve(liveThermalsResult(13, '2026-09-01T12:00:13.000Z')); await pending;
    expect(controller.getState()).toMatchObject({ refreshing: false, observation: { version: 13, environment: { sourceObservedAt: '2026-09-01T11:59:58.000Z' } } });
    expect(port.refresh).toHaveBeenCalledTimes(1); controller.dispose();
  });
  it.each(['duplicate', 'newer', 'freshness'])('settles superseded rejection for %s and allows retry', async (variant) => {
    const { controller, notify, reject, resolve } = setup(); notify(liveThermalsResult()); const pending = controller.refresh();
    const next = variant === 'newer' ? liveThermalsResult(15, '2026-09-01T12:00:15.000Z') : liveThermalsResult();
    if (variant === 'freshness') next.structuredContent.module.environment.freshness = 'stale';
    notify(next); const accepted = controller.getState().observation;
    reject(); await pending; expect(controller.getState().observation).toBe(accepted);
    expect(controller.getState().refreshing).toBe(false);
    expect(controller.getState().feedback).toBe(variant === 'duplicate' ? 'Could not load Thermals' : '');
    const retry = controller.refresh(); resolve(liveThermalsResult(16, '2026-09-01T12:00:16.000Z')); await retry;
    expect(controller.getState()).toMatchObject({ observation: { version: 16 }, refreshing: false, feedback: '' }); controller.dispose();
  });
  it('rejects older arrival but accepts receipt-ordered process restart and independent cavity freshness', () => {
    const { controller, notify } = setup(); notify(liveThermalsResult());
    notify(liveThermalsResult(11, '2026-09-01T12:00:11.000Z')); expect(controller.getState().observation?.version).toBe(12);
    const restart = liveThermalsResult(1, '2026-09-01T12:01:00.000Z'); restart.structuredContent.module.environment.freshness = 'stale';
    notify(restart); expect(controller.getState().observation).toMatchObject({ version: 1, freshness: 'fresh', environment: { freshness: 'stale' } }); controller.dispose();
  });
  it('duplicate does not cancel a newer pending response; obsolete later-receipt response cannot replace a newer notification', async () => {
    const { controller, notify, resolve } = setup(); notify(liveThermalsResult()); const first = controller.refresh();
    notify(liveThermalsResult()); resolve(liveThermalsResult(13, '2026-09-01T12:00:13.000Z')); await first;
    expect(controller.getState().observation?.version).toBe(13);
    const second = controller.refresh(); notify(liveThermalsResult(15, '2026-09-01T12:00:15.000Z'));
    const accepted = controller.getState().observation;
    resolve(liveThermalsResult(16, '2026-09-01T12:00:16.000Z')); await second;
    expect(controller.getState()).toMatchObject({ observation: accepted, refreshing: false, feedback: '' });
    const retry = controller.refresh(); resolve(liveThermalsResult(17, '2026-09-01T12:00:17.000Z')); await retry;
    expect(controller.getState()).toMatchObject({ observation: { version: 17 }, refreshing: false }); controller.dispose();
  });
  it('bounds initial loading, shows actual failure and disposes without late publication', async () => {
    vi.useFakeTimers(); const { controller, notify, resolve, port } = setup(); controller.start(); controller.start();
    await vi.advanceTimersByTimeAsync(100); expect(controller.getState()).toMatchObject({ phase: 'error', feedback: 'Could not load Thermals' });
    const pending = controller.refresh(); controller.dispose(); const final = controller.getState();
    notify(liveThermalsResult()); resolve(liveThermalsResult()); await pending;
    expect(controller.getState()).toBe(final); expect(port.start).toHaveBeenCalledTimes(1); expect(port.dispose).toHaveBeenCalledTimes(1);
  });
});
