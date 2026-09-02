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
  it.each(['unavailable', 'unsupported'])('retains same-epoch %s failures while advancing ordering, but clears on a new epoch', (kind) => {
    const { controller, notify } = setup();
    try {
      notify(liveFansResult()); const previous = controller.getState().observation;
      const failure = liveFansResult(14, '2026-09-01T12:00:14.000Z');
      const failed = { structuredContent: { ...failure.structuredContent, module: { ...failure.structuredContent.module, state: kind } } };
      notify(failed);
      expect(controller.getState().observation).toBe(previous);
      expect(controller.getState().feedback).toContain(kind === 'unsupported' ? 'endpoint unsupported' : 'unavailable');
      expect(controller.getState().feedback).toContain('showing previous observation');
      notify(liveFansResult(13, '2026-09-01T12:00:13.000Z'));
      expect(controller.getState().observation).toBe(previous);
      notify({ structuredContent: { ...failed.structuredContent, connectionEpoch: 4, receivedAt: '2026-09-01T12:00:15.000Z' } });
      expect(controller.getState().observation?.state).toBe(kind);
      expect(controller.getState().observation?.connectionEpoch).toBe(4);
      expect(controller.getState().feedback).toBe('');
    } finally { controller.dispose(); }
  });
  it.each(['unavailable', 'unsupported'])('repeated explicit Retry of the same %s receipt cannot erase its warning', async (kind) => {
    const { controller, notify, resolve } = setup();
    try {
      notify(liveFansResult()); const previous = controller.getState().observation;
      const value = liveFansResult(14, '2026-09-01T12:00:14.000Z');
      const failed = { structuredContent: { ...value.structuredContent, module: { ...value.structuredContent.module, state: kind } } };
      notify(failed);
      for (let attempt = 0; attempt < 2; attempt++) {
        const retry = controller.refresh(); resolve(failed); await retry;
        expect(controller.getState().observation).toBe(previous);
        expect(controller.getState()).toMatchObject({ refreshing: false, feedback: `Fans & Air ${kind === 'unsupported' ? 'endpoint unsupported' : 'unavailable'} · showing previous observation` });
      }
      const retry = controller.refresh(); resolve(liveFansResult(15, '2026-09-01T12:00:15.000Z')); await retry;
      expect(controller.getState().observation?.version).toBe(15);
      expect(controller.getState().feedback).toBe('');
    } finally { controller.dispose(); }
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
  it('keeps failure evidence while pending and after an older RPC, but clears on confirmed known success', async () => {
    const { controller, notify, resolve, reject } = setup();
    try {
      notify(liveFansResult()); const previous = controller.getState().observation;
      const failed = controller.refresh(); reject(); await failed;
      const warning = controller.getState().feedback;
      const old = controller.refresh();
      expect(controller.getState().feedback).toBe(warning);
      resolve(liveFansResult(11, '2026-09-01T12:00:11.000Z')); await old;
      expect(controller.getState()).toMatchObject({ observation: previous, refreshing: false, feedback: warning });
      const confirmed = controller.refresh(); resolve(liveFansResult()); await confirmed;
      expect(controller.getState()).toMatchObject({ observation: previous, refreshing: false, feedback: '' });
    } finally { controller.dispose(); }
  });
  it('rejects delayed older data, accepts real lower-version restart and same-version freshness', () => {
    const { controller, notify } = setup(); notify(liveFansResult());
    notify(liveFansResult(11, '2026-09-01T12:00:11.000Z')); expect(controller.getState().observation?.version).toBe(12);
    notify(liveFansResult(1, '2026-09-01T12:01:00.000Z')); expect(controller.getState().observation?.version).toBe(1);
    const stale = liveFansResult(1, '2026-09-01T12:01:01.000Z'); stale.structuredContent.module.freshness = 'stale';
    notify(stale); expect(controller.getState().observation?.receipt.freshness).toBe('stale'); controller.dispose();
  });
  it('a newer notification supersedes a pending RPC even when the old RPC claims a later receipt, then permits retry', async () => {
    const { controller, notify, resolve, port } = setup(); notify(liveFansResult()); const pending = controller.refresh();
    notify(liveFansResult(15, '2026-09-01T12:00:15.000Z')); const accepted = controller.getState().observation;
    resolve(liveFansResult(16, '2026-09-01T12:00:16.000Z')); await pending;
    expect(controller.getState()).toMatchObject({ observation: accepted, refreshing: false, feedback: '' });
    const retry = controller.refresh(); expect(port.refresh).toHaveBeenCalledTimes(2);
    resolve(liveFansResult(17, '2026-09-01T12:00:17.000Z')); await retry;
    expect(controller.getState()).toMatchObject({ observation: { version: 17 }, refreshing: false, feedback: '' }); controller.dispose();
  });
  it('duplicate does not supersede a pending response, while an accepted freshness notification does', async () => {
    const { controller, notify, resolve } = setup(); notify(liveFansResult()); const pending = controller.refresh();
    notify(liveFansResult()); expect(controller.getState().refreshing).toBe(true);
    const stale = liveFansResult(); stale.structuredContent.module.freshness = 'stale'; notify(stale);
    expect(controller.getState().refreshing).toBe(true);
    resolve(liveFansResult(13, '2026-09-01T12:00:13.000Z')); await pending;
    expect(controller.getState()).toMatchObject({ refreshing: false, observation: { version: 12, receipt: { freshness: 'stale' } } }); controller.dispose();
  });
  it('retains accepted values on failure and allows retry after rejection', async () => {
    const { controller, notify, reject, resolve } = setup(); notify(liveFansResult()); const previous = controller.getState().observation;
    const first = controller.refresh(); reject(); await first;
    expect(controller.getState()).toMatchObject({ observation: previous, refreshing: false, feedback: 'Refresh failed · showing previous observation' });
    const retry = controller.refresh(); resolve(liveFansResult(13, '2026-09-01T12:00:13.000Z')); await retry;
    expect(controller.getState().feedback).toBe(''); controller.dispose();
  });
  it.each(['newer observation', 'same-version freshness'])('settles a rejected refresh superseded by %s and permits another refresh', async (kind) => {
    const { controller, notify, reject, resolve, port } = setup(); notify(liveFansResult());
    const pending = controller.refresh();
    const newer = kind === 'newer observation' ? liveFansResult(15, '2026-09-01T12:00:15.000Z') : liveFansResult();
    if (kind === 'same-version freshness') newer.structuredContent.module.freshness = 'stale';
    notify(newer);
    const accepted = controller.getState().observation;
    expect(controller.getState().refreshing).toBe(true);
    reject(); await pending;
    expect(controller.getState().observation).toBe(accepted);
    expect(controller.getState()).toMatchObject({ phase: 'ready', refreshing: false, feedback: '' });
    const retry = controller.refresh(); expect(port.refresh).toHaveBeenCalledTimes(2);
    resolve(liveFansResult(16, '2026-09-01T12:00:16.000Z')); await retry;
    expect(controller.getState()).toMatchObject({ refreshing: false, observation: { version: 16 }, feedback: '' });
    controller.dispose();
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
