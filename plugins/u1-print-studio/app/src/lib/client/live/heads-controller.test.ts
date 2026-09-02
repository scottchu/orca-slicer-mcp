import { describe, expect, it, vi } from 'vitest';
import { createHeadsController } from './heads-controller';
import { liveHeadsResult } from '../../../../tests/browser/fixtures/live-heads';
const deferred = <T>() => {
  let resolve!: (value: T) => void, reject!: (error?: unknown) => void;
  const promise = new Promise<T>((ok, fail) => { resolve = ok; reject = fail; });
  return { promise, resolve, reject };
};
const setup = () => {
  let notify: (value: unknown) => void = () => {};
  const refresh = vi.fn(), write = vi.fn();
  const controller = createHeadsController({ start: async () => {}, refresh, subscribe: (listener) => { notify = listener; return () => {}; }, dispose: vi.fn() }, write);
  controller.start(); notify(liveHeadsResult());
  return { controller, notify, refresh, write };
};
describe('Heads controller reuses ordered observation with independent Copy intent', () => {
  it('gates copying on exact currently loaded color; never copies Empty/N/A metadata', async () => {
    const { controller, notify, write } = setup(); write.mockResolvedValue(undefined);
    await controller.copy(1, '#FFFFFFFF'); expect(write).toHaveBeenCalledWith('#FFFFFFFF');
    await controller.copy(4, '#FFFFFFFF'); await controller.copy(1, '#000000'); expect(write).toHaveBeenCalledTimes(1);
    const next = liveHeadsResult(13, '2026-09-01T12:00:13.000Z'); next.structuredContent.module.items[0].reportedPresence.value = false;
    notify(next); await controller.copy(1, '#FFFFFFFF'); expect(write).toHaveBeenCalledTimes(1); controller.dispose();
  });
  it('coalesces a double Copy, retains failure truth and suppresses stale completion after new data', async () => {
    const { controller, notify, write } = setup(), pending = deferred<void>(); write.mockReturnValue(pending.promise);
    const copying = controller.copy(1, '#FFFFFFFF'); await controller.copy(1, '#FFFFFFFF');
    expect(write).toHaveBeenCalledTimes(1); expect(controller.getState().copying).toBe(1);
    notify(liveHeadsResult(13, '2026-09-01T12:00:13.000Z')); pending.reject(new Error('denied')); await copying;
    expect(controller.getState()).toMatchObject({ copying: null, feedback: '' });
    write.mockRejectedValue(new Error('denied')); await controller.copy(1, '#FFFFFFFF'); expect(controller.getState().feedback).toBe('#FFFFFFFF copy unavailable'); controller.dispose();
  });
  it('new refresh invalidates older Copy without restamping retained data or blocking retry', async () => {
    const { controller, refresh, write } = setup(), clip = deferred<void>(), read = deferred<unknown>();
    write.mockReturnValue(clip.promise); refresh.mockReturnValue(read.promise);
    const previous = controller.getState().observation, copying = controller.copy(1, '#FFFFFFFF');
    const pending = controller.refresh(); expect(controller.getState()).toMatchObject({ refreshing: true, copying: null, feedback: '' });
    await controller.copy(2, '#000000FF'); expect(write).toHaveBeenCalledTimes(1);
    clip.resolve(); await copying; expect(controller.getState().observation).toBe(previous); expect(controller.getState().feedback).toBe('');
    read.reject(new Error('read failed')); await pending; expect(controller.getState().feedback).toContain('Could not load Heads & Filaments'); controller.dispose();
  });
  it('newer notification wins over an obsolete later-receipt RPC, releases busy and permits retry', async () => {
    const { controller, notify, refresh } = setup(), read = deferred<unknown>(); refresh.mockReturnValue(read.promise);
    const pending = controller.refresh(); notify(liveHeadsResult(15, '2026-09-01T12:00:15.000Z')); const accepted = controller.getState().observation;
    read.resolve(liveHeadsResult(16, '2026-09-01T12:00:16.000Z')); await pending;
    expect(controller.getState().observation).toBe(accepted);
    expect(controller.getState()).toMatchObject({ refreshing: false, feedback: '', observation: { version: 15 } });
    const retryRead = deferred<unknown>(); refresh.mockReturnValue(retryRead.promise); const retry = controller.refresh();
    retryRead.resolve(liveHeadsResult(17, '2026-09-01T12:00:17.000Z')); await retry;
    expect(controller.getState()).toMatchObject({ refreshing: false, feedback: '', observation: { version: 17 } });
    notify(liveHeadsResult(1, '2026-09-01T12:01:00.000Z')); expect(controller.getState().observation?.version).toBe(1);
    notify(liveHeadsResult(14, '2026-09-01T12:00:14.000Z')); expect(controller.getState().observation?.version).toBe(1); controller.dispose();
  });
  it('does not publish after disposal or accept wrong views', async () => {
    const { controller, notify, write } = setup(), pending = deferred<void>(); write.mockReturnValue(pending.promise);
    const publish = vi.fn(), stop = controller.subscribe(publish), copying = controller.copy(1, '#FFFFFFFF');
    const wrong = liveHeadsResult(13); wrong.structuredContent.view = 'fans'; notify(wrong); expect(controller.getState().observation?.version).toBe(12);
    controller.dispose(); const count = publish.mock.calls.length; pending.resolve(); await copying; expect(publish).toHaveBeenCalledTimes(count); stop();
  });
});
