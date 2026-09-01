import { afterEach, describe, expect, it, vi } from 'vitest';
import { createFansController } from './controller';
import { liveFansResult } from '../../../tests/fixtures/live-fans';
const setup = () => {
  let notify = (_value: unknown) => {};
  let resolve = (_value: unknown) => {};
  let reject = (_error: Error) => {};
  const port = { start: vi.fn(async () => {}), refresh: vi.fn(() => new Promise<unknown>((yes, no) => { resolve = yes; reject = no; })), subscribe: (listener: (value: unknown) => void) => { notify = listener; return vi.fn(); }, dispose: vi.fn() };
  const controller = createFansController(port, 100);
  return { controller, port, notify: (value: unknown) => notify(value), resolve: (value: unknown) => resolve(value), reject: () => reject(new Error('network')) };
};
afterEach(() => vi.useRealTimers());
describe('live Fans controller', () => {
  it('starts structurally loading and accepts source/domain times without fixtures', () => {
    const { controller, notify } = setup(); expect(controller.getState().phase).toBe('loading');
    notify(liveFansResult()); expect(controller.getState()).toMatchObject({ phase: 'ready', observation: { version: 12 } });
    controller.dispose();
  });
  it('coalesces refresh, retains identity and ignores malformed unrelated notifications', async () => {
    const { controller, notify, resolve, port } = setup(); notify(liveFansResult());
    const previous = controller.getState().observation, first = controller.refresh();
    expect(controller.refresh()).toBe(first); expect(port.refresh).toHaveBeenCalledTimes(1);
    notify({ structuredContent: { view: 'queue' } });
    expect(controller.getState()).toMatchObject({ observation: previous, refreshing: true, feedback: '' });
    resolve(liveFansResult(13, '2026-09-01T12:00:13.000Z')); await first;
    expect(controller.getState()).toMatchObject({ refreshing: false, observation: { version: 13 } }); controller.dispose();
  });
  it('rejects delayed older data, accepts real lower-version restart and same-version freshness', () => {
    const { controller, notify } = setup(); notify(liveFansResult());
    notify(liveFansResult(11, '2026-09-01T12:00:11.000Z')); expect(controller.getState().observation?.version).toBe(12);
    notify(liveFansResult(1, '2026-09-01T12:01:00.000Z')); expect(controller.getState().observation?.version).toBe(1);
    const stale = liveFansResult(1, '2026-09-01T12:01:01.000Z'); stale.structuredContent.module.freshness = 'stale';
    notify(stale); expect(controller.getState().observation?.receipt.freshness).toBe('stale'); controller.dispose();
  });
  it('a newer notification supersedes a pending response and error', async () => {
    const { controller, notify, resolve } = setup(); notify(liveFansResult()); const pending = controller.refresh();
    notify(liveFansResult(15, '2026-09-01T12:00:15.000Z')); resolve(liveFansResult(13, '2026-09-01T12:00:13.000Z')); await pending;
    expect(controller.getState().observation?.version).toBe(15); controller.dispose();
  });
  it('duplicate and same-version freshness notifications cannot cancel a newer pending response', async () => {
    const { controller, notify, resolve } = setup(); notify(liveFansResult()); const pending = controller.refresh();
    notify(liveFansResult()); expect(controller.getState().refreshing).toBe(true);
    const stale = liveFansResult(); stale.structuredContent.module.freshness = 'stale'; notify(stale);
    expect(controller.getState().refreshing).toBe(true);
    resolve(liveFansResult(13, '2026-09-01T12:00:13.000Z')); await pending;
    expect(controller.getState()).toMatchObject({ refreshing: false, observation: { version: 13 } }); controller.dispose();
  });
  it('retains accepted values on failure and allows retry after rejection', async () => {
    const { controller, notify, reject, resolve } = setup(); notify(liveFansResult()); const previous = controller.getState().observation;
    const first = controller.refresh(); reject(); await first;
    expect(controller.getState()).toMatchObject({ observation: previous, refreshing: false, feedback: 'Refresh failed · showing previous observation' });
    const retry = controller.refresh(); resolve(liveFansResult(13, '2026-09-01T12:00:13.000Z')); await retry;
    expect(controller.getState().feedback).toBe(''); controller.dispose();
  });
  it('bounds initial loading and ignores notifications and completions after disposal', async () => {
    vi.useFakeTimers(); const { controller, notify, resolve, port } = setup(); controller.start(); controller.start();
    await vi.advanceTimersByTimeAsync(100); expect(controller.getState().phase).toBe('error'); expect(port.start).toHaveBeenCalledTimes(1);
    const pending = controller.refresh(); controller.dispose(); const state = controller.getState();
    notify(liveFansResult()); resolve(liveFansResult()); await pending;
    expect(controller.getState()).toBe(state); expect(port.dispose).toHaveBeenCalledTimes(1);
  });
  it('shows an explicit initial tool failure without a long loading wait, but does not settle an active refresh', async () => {
    const { controller, notify, resolve } = setup();
    notify({ isError: true }); expect(controller.getState().phase).toBe('error');
    const retry = controller.refresh(); notify({ isError: true });
    expect(controller.getState().phase).toBe('loading');
    resolve(liveFansResult()); await retry; expect(controller.getState().phase).toBe('ready'); controller.dispose();
  });
});
