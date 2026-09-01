import { describe, expect, it, vi } from 'vitest';
import { createCurrentJobController } from './current-job-controller.js';
import { liveCurrentJobResult } from '../../../tests/fixtures/live-current-job.js';

const deferred = <T>() => {
  let resolve!: (value: T) => void, reject!: (error?: unknown) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
};

const setup = () => {
  let notify: (value: unknown) => void = () => {};
  const reads: ReturnType<typeof deferred<unknown>>[] = [];
  const port = {
    start: vi.fn(async () => {}),
    refresh: vi.fn(() => { const read = deferred<unknown>(); reads.push(read); return read.promise; }),
    subscribe: (listener: (value: unknown) => void) => { notify = listener; return vi.fn(); },
    dispose: vi.fn(),
  };
  const controller = createCurrentJobController(port, 100);
  return { controller, port, reads, notify: (value: unknown) => notify(value) };
};

describe('Current Job shared observation lifecycle', () => {
  it('fails initial loading immediately and retries without accepting wrong-view data', async () => {
    const { controller, notify, reads } = setup();
    notify({ isError: true }); expect(controller.getState()).toMatchObject({ phase: 'error', observation: null });
    const retry = controller.refresh(); notify({ structuredContent: { view: 'job_history' } });
    expect(controller.getState().phase).toBe('loading');
    reads[0].resolve(liveCurrentJobResult()); await retry;
    expect(controller.getState()).toMatchObject({ phase: 'ready', observation: { kind: 'jobs', version: 12 } });
    controller.dispose();
  });

  it('coalesces refresh and retains a stale accepted observation on failed refresh before retry', async () => {
    const { controller, notify, reads, port } = setup();
    const stale = liveCurrentJobResult();
    stale.structuredContent.module.state = 'stale'; stale.structuredContent.module.freshness = 'stale'; stale.structuredContent.module.reason = 'timeout';
    notify(stale);
    const previous = controller.getState().observation, first = controller.refresh();
    expect(controller.refresh()).toBe(first); expect(port.refresh).toHaveBeenCalledTimes(1);
    reads[0].reject(new Error('offline')); await first;
    expect(controller.getState().observation).toBe(previous);
    expect(controller.getState()).toMatchObject({
      phase: 'ready', refreshing: false,
      feedback: 'Refresh failed · showing previous observation',
      observation: { state: 'stale', receipt: { freshness: 'stale', reason: 'timeout' } },
    });
    const retry = controller.refresh(); reads[1].resolve(liveCurrentJobResult(13, '2026-09-01T12:00:13.000Z')); await retry;
    expect(controller.getState()).toMatchObject({ feedback: '', observation: { version: 13 } }); controller.dispose();
  });

  it('keeps a newer stale observation when an obsolete RPC rejects, then permits another refresh', async () => {
    const { controller, notify, reads, port } = setup(); notify(liveCurrentJobResult());
    const pending = controller.refresh();
    const stale = liveCurrentJobResult(15, '2026-09-01T12:00:15.000Z');
    stale.structuredContent.module.state = 'stale'; stale.structuredContent.module.freshness = 'stale'; stale.structuredContent.module.reason = 'timeout';
    notify(stale); const retained = controller.getState().observation;
    reads[0].reject(new Error('obsolete')); await pending;
    expect(controller.getState()).toMatchObject({ observation: retained, refreshing: false, feedback: '' });
    const retry = controller.refresh(); expect(port.refresh).toHaveBeenCalledTimes(2);
    reads[1].resolve(liveCurrentJobResult(16, '2026-09-01T12:00:16.000Z')); await retry;
    expect(controller.getState().observation?.version).toBe(16); controller.dispose();
  });

  it('retains one controller across a persisted-page lifecycle and disposes only on final teardown', () => {
    const { controller, notify, port } = setup(); const states: number[] = [];
    controller.subscribe((state) => { if (state.observation) states.push(state.observation.version); });
    controller.start(); notify(liveCurrentJobResult());
    // A persisted pagehide intentionally performs no controller disposal.
    notify(liveCurrentJobResult(13, '2026-09-01T12:00:13.000Z'));
    expect(states).toEqual([12, 13]); expect(port.start).toHaveBeenCalledTimes(1); expect(port.dispose).not.toHaveBeenCalled();
    controller.dispose(); expect(port.dispose).toHaveBeenCalledTimes(1);
  });
});
