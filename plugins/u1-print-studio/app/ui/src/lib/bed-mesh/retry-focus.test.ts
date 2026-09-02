import { describe, expect, test, vi } from 'vitest';
import { createRetryFocusRecovery } from './retry-focus';

const setup = () => {
  let settle = () => {};
  const lease = { ownsFocus: vi.fn(() => true), release: vi.fn() };
  const ports = {
    captureFocus: vi.fn(() => lease), canRecoverFocus: vi.fn(() => true), focusSelected: vi.fn(),
    afterRender: vi.fn(() => new Promise<void>((resolve) => { settle = resolve; }))
  };
  const recovery = createRetryFocusRecovery(ports);
  const flush = async () => { settle(); await Promise.resolve(); };
  return { recovery, ports, lease, flush };
};
const initial = { retrying: false, mode: '2d' as const, ready: false };
const pending = { ...initial, retrying: true };
const ready = { ...initial, ready: true };

describe('Bed Retry focus handoff policy', () => {
  test('captures initiating ownership, releases before render, then focuses only selected 2D', async () => {
    const { recovery, ports, lease, flush } = setup();
    recovery.update(initial); expect(ports.captureFocus).not.toHaveBeenCalled();
    recovery.update(pending); expect(ports.captureFocus).toHaveBeenCalledOnce();
    recovery.update(ready); expect(lease.release).toHaveBeenCalledOnce();
    expect(ports.focusSelected).not.toHaveBeenCalled();
    await flush(); expect(ports.focusSelected).toHaveBeenCalledOnce();
    recovery.dispose(); expect(lease.release).toHaveBeenCalledOnce();
  });
  test.each(['moved', 'failed', 'mode-changed', 'disposed', 'new-generation', 'blurred-at-commit'] as const)('never steals after %s', async (reason) => {
    const { recovery, ports, lease, flush } = setup();
    recovery.update(initial); recovery.update(pending);
    if (reason === 'moved') lease.ownsFocus.mockReturnValue(false);
    if (reason === 'mode-changed') recovery.update({ ...pending, mode: '3d' });
    recovery.update(reason === 'failed' ? initial : ready);
    if (reason === 'disposed') recovery.dispose();
    if (reason === 'new-generation') recovery.update(initial);
    if (reason === 'blurred-at-commit') ports.canRecoverFocus.mockReturnValue(false);
    await flush(); expect(ports.focusSelected).not.toHaveBeenCalled();
    recovery.dispose(); expect(lease.release).toHaveBeenCalledOnce();
  });
  test('3D success does not move same Reset focus and later updates do not recover', async () => {
    const { recovery, ports, lease, flush } = setup();
    recovery.update({ ...pending, mode: '3d' });
    recovery.update({ ...ready, mode: '3d' });
    recovery.update(ready); await flush();
    expect(ports.focusSelected).not.toHaveBeenCalled();
    expect(lease.release).toHaveBeenCalledOnce();
  });
  test('unmount during retry releases its ownership listeners without scheduling focus', () => {
    const { recovery, ports, lease } = setup();
    recovery.update(pending); recovery.dispose();
    expect(lease.release).toHaveBeenCalledOnce();
    expect(ports.afterRender).not.toHaveBeenCalled();
  });
});
