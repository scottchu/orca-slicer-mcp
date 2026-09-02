import { afterEach, describe, expect, it, vi } from 'vitest';
import { createQueueController } from './queue-controller';
import { liveQueueResult } from '../../../tests/fixtures/live-queue';
import { liveFansResult } from '../../../tests/fixtures/live-fans';
const setup = () => {
  let notify = (_value: unknown) => {}, resolve = (_value: unknown) => {}, reject = (_error: Error) => {};
  const port = { start: vi.fn(async () => {}), refresh: vi.fn(() => new Promise<unknown>((yes, no) => { resolve = yes; reject = no; })), subscribe: (listener: (value: unknown) => void) => { notify = listener; return vi.fn(); }, dispose: vi.fn() };
  const controller = createQueueController(port, 100);
  return { controller, port, notify: (value: unknown) => notify(value), resolve: (value: unknown) => resolve(value), reject: () => reject(new Error('network')) };
};
afterEach(() => vi.useRealTimers());
describe('Print Queue shares reviewed observation lifecycle', () => {
  it('keeps machine loading as ready UI data and retains all rows/time during coalesced refresh', async () => {
    const { controller, notify, resolve, port } = setup();
    expect(controller.getState()).toMatchObject({ observation: null, phase: 'loading' });
    const initial = liveQueueResult(101); initial.structuredContent.module.queueState = 'loading'; notify(initial);
    expect(controller.getState()).toMatchObject({ phase: 'ready', observation: { totalCount: 101, queueState: 'loading' } });
    const old = controller.getState().observation, pending = controller.refresh(); expect(controller.refresh()).toBe(pending);
    notify(liveFansResult()); notify({ isError: true });
    expect(controller.getState()).toMatchObject({ observation: old, refreshing: true, feedback: '' });
    resolve(liveQueueResult(1, 13, '2026-09-01T12:00:13.000Z')); await pending;
    expect(controller.getState()).toMatchObject({ refreshing: false, observation: { version: 13, totalCount: 1, receipt: { sourceObservedAt: '2026-09-01T11:59:58.000Z' } } });
    expect(port.refresh).toHaveBeenCalledTimes(1); controller.dispose();
  });
  it.each(['duplicate', 'newer', 'freshness'])('settles superseded rejection for %s and permits retry', async (variant) => {
    const { controller, notify, reject, resolve } = setup(); notify(liveQueueResult(0)); const pending = controller.refresh();
    const next = variant === 'newer' ? liveQueueResult(3, 15, '2026-09-01T12:00:15.000Z') : liveQueueResult(0);
    if (variant === 'freshness') { next.structuredContent.module.freshness = 'stale'; next.structuredContent.module.state = 'stale'; }
    notify(next); const accepted = controller.getState().observation;
    reject(); await pending; expect(controller.getState().observation).toBe(accepted); expect(controller.getState().refreshing).toBe(false);
    expect(controller.getState().feedback).toBe(variant === 'duplicate' ? 'Could not load Print Queue' : '');
    const retry = controller.refresh(); resolve(liveQueueResult(1, 16, '2026-09-01T12:00:16.000Z')); await retry;
    expect(controller.getState()).toMatchObject({ observation: { version: 16 }, refreshing: false, feedback: '' }); controller.dispose();
  });
  it('rejects older arrival and accepts receipt-ordered restart', () => {
    const { controller, notify } = setup(); notify(liveQueueResult()); notify(liveQueueResult(1, 11, '2026-09-01T12:00:11.000Z'));
    expect(controller.getState().observation?.version).toBe(12);
    notify(liveQueueResult(0, 1, '2026-09-01T12:01:00.000Z')); expect(controller.getState().observation).toMatchObject({ version: 1, totalCount: 0 }); controller.dispose();
  });
  it('a duplicate cannot cancel newer response and an obsolete response cannot replace a newer notification despite a later receipt', async () => {
    const { controller, notify, resolve } = setup(); notify(liveQueueResult()); const first = controller.refresh(); notify(liveQueueResult());
    resolve(liveQueueResult(1, 13, '2026-09-01T12:00:13.000Z')); await first; expect(controller.getState().observation?.version).toBe(13);
    const second = controller.refresh(); notify(liveQueueResult(0, 15, '2026-09-01T12:00:15.000Z'));
    const accepted = controller.getState().observation;
    resolve(liveQueueResult(2, 16, '2026-09-01T12:00:16.000Z')); await second;
    expect(controller.getState()).toMatchObject({ observation: accepted, refreshing: false, feedback: '' });
    const retry = controller.refresh(); resolve(liveQueueResult(1, 17, '2026-09-01T12:00:17.000Z')); await retry;
    expect(controller.getState()).toMatchObject({ observation: { version: 17, totalCount: 1 }, refreshing: false }); controller.dispose();
  });
  it('observed wait does not become an advancing clock', async () => {
    vi.useFakeTimers(); const { controller, notify } = setup(); notify(liveQueueResult()); const original = controller.getState().observation;
    await vi.advanceTimersByTimeAsync(3_600_000); expect(controller.getState().observation).toBe(original); controller.dispose();
  });
  it('bounds initialization and ignores late work after disposal', async () => {
    vi.useFakeTimers(); const { controller, notify, resolve, port } = setup(); controller.start(); controller.start();
    await vi.advanceTimersByTimeAsync(100); expect(controller.getState()).toMatchObject({ phase: 'error', feedback: 'Could not load Print Queue' });
    const pending = controller.refresh(); controller.dispose(); const final = controller.getState(); notify(liveQueueResult()); resolve(liveQueueResult()); await pending;
    expect(controller.getState()).toBe(final); expect(port.start).toHaveBeenCalledTimes(1); expect(port.dispose).toHaveBeenCalledTimes(1);
  });
});
