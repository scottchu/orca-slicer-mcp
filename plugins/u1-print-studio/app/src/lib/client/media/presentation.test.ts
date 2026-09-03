import { afterEach, describe, expect, it, vi } from 'vitest';
import { createHostRpc, type HostContext, type HostDisplayMode } from '../host/rpc';
import { createDocumentPresentation, createHostPresentation, type PresentationState } from './presentation';

const fixture = async (context: HostContext = {}) => {
  const host = new EventTarget() as EventTarget & { parent: Window };
  const send = vi.fn();
  host.parent = { postMessage: send } as unknown as Window;
  const rpc = createHostRpc(host as unknown as Parameters<typeof createHostRpc>[0], { timeoutMs: 100 });
  const receive = (message: Record<string, unknown>) => host.dispatchEvent(new MessageEvent('message', {
    source: host.parent, data: { jsonrpc: '2.0', ...message },
  }));
  const started = rpc.start();
  receive({ id: 1, result: { hostContext: context } });
  await started;
  const presentation = createHostPresentation(rpc);
  let state: PresentationState;
  presentation.subscribe(value => { state = value; });
  const flush = async () => { for (let i = 0; i < 8; i++) await Promise.resolve(); };
  const reply = async (mode: HostDisplayMode) => {
    const request = send.mock.calls.map(([value]) => value).findLast(value => value.method === 'ui/request-display-mode');
    receive({ id: request.id, result: { mode } });
    await flush();
  };
  return {
    rpc, presentation, send, receive, reply, flush, state: () => state!,
    dispose: () => { presentation.dispose(); rpc.dispose(); },
  };
};

afterEach(() => vi.useRealTimers());

describe('presentation uses acknowledged host state without owning media', () => {
  it('uses the standard request, actual grant and response-only context; Exit ignores capability omission', async () => {
    const app = await fixture({ availableDisplayModes: ['fullscreen'] });
    const context = vi.fn();
    app.rpc.subscribeContext(context);
    try {
      const enter = app.presentation.toggle();
      await app.flush();
      expect(app.state()).toMatchObject({ mode: 'inline', pending: true });
      expect(app.send).toHaveBeenLastCalledWith(expect.objectContaining({ method: 'ui/request-display-mode', params: { mode: 'fullscreen' } }), '*');
      await app.reply('fullscreen');
      expect(await enter).toBe(true);
      expect(context).toHaveBeenLastCalledWith({ availableDisplayModes: ['fullscreen'], displayMode: 'fullscreen' }, { displayMode: 'fullscreen' });
      const exit = app.presentation.toggle();
      await app.flush();
      expect(app.send).toHaveBeenLastCalledWith(expect.objectContaining({ params: { mode: 'inline' } }), '*');
      await app.reply('inline');
      expect(await exit).toBe(true);
    } finally { app.dispose(); }
  });

  it('keeps an inline grant inline and allows one request while pending', async () => {
    const app = await fixture();
    try {
      const enter = app.presentation.toggle();
      await app.presentation.toggle();
      await app.flush();
      expect(app.send.mock.calls.filter(([message]) => message.method === 'ui/request-display-mode')).toHaveLength(1);
      await app.reply('inline');
      expect(await enter).toBe(false);
      expect(app.state()).toMatchObject({ mode: 'inline', pending: false });
    } finally { app.dispose(); }
  });

  it('does not call an explicitly unsupported host', async () => {
    const app = await fixture({ availableDisplayModes: ['inline'] });
    try {
      expect(await app.presentation.toggle()).toBe(false);
      expect(app.send.mock.calls.filter(([message]) => message.method === 'ui/request-display-mode')).toHaveLength(0);
    } finally { app.dispose(); }
  });

  it.each([true, false])('distinguishes explicit same-mode Exit from a safeArea-only patch: %s', async explicitExit => {
    const app = await fixture({ displayMode: 'inline', availableDisplayModes: ['inline', 'fullscreen'] });
    const context = vi.fn();
    app.rpc.subscribeContext(context);
    try {
      const enter = app.presentation.toggle();
      await app.flush();
      const patch = explicitExit ? { displayMode: 'inline' } : { safeArea: { bottom: 12 } };
      app.receive({ method: 'ui/notifications/host-context-changed', params: patch });
      expect(context).toHaveBeenLastCalledWith(expect.objectContaining({ displayMode: 'inline', availableDisplayModes: ['inline', 'fullscreen'] }), patch);
      await app.reply('fullscreen');
      expect(await enter).toBe(!explicitExit);
      expect(app.state().mode).toBe(explicitExit ? 'inline' : 'fullscreen');
    } finally { app.dispose(); }
  });

  it.each(['timeout', 'reject', 'malformed', 'dispose'] as const)('bounds %s without granting fullscreen', async outcome => {
    vi.useFakeTimers();
    const app = await fixture();
    try {
      const enter = app.presentation.toggle();
      await app.flush();
      const request = app.send.mock.calls.at(-1)![0];
      if (outcome === 'timeout') await vi.advanceTimersByTimeAsync(100);
      if (outcome === 'reject') app.receive({ id: request.id, error: { code: -32000, message: 'Denied' } });
      if (outcome === 'malformed') app.receive({ id: request.id, result: { mode: 'invented' } });
      if (outcome === 'dispose') app.dispose();
      expect(await enter).toBe(outcome === 'dispose');
      app.receive({ id: request.id, result: { mode: 'fullscreen' } });
      expect(app.state().mode).toBe('inline');
      expect(vi.getTimerCount()).toBe(0);
    } finally { app.dispose(); }
  });
});

it('standalone uses actual native fullscreen and reports unavailable without a CSS fallback', async () => {
  const surface = document.createElement('div');
  const presentation = createDocumentPresentation(surface, document);
  let mode = '';
  presentation.subscribe(state => { mode = state.mode; });
  try {
    expect(await presentation.toggle()).toBe(false);
    expect(mode).toBe('inline');
    Object.defineProperty(document, 'fullscreenEnabled', { configurable: true, value: true });
    surface.requestFullscreen = vi.fn(async () => {
      Object.defineProperty(document, 'fullscreenElement', { configurable: true, value: surface });
      document.dispatchEvent(new Event('fullscreenchange'));
    });
    document.exitFullscreen = vi.fn(async () => {
      Object.defineProperty(document, 'fullscreenElement', { configurable: true, value: null });
      document.dispatchEvent(new Event('fullscreenchange'));
    });
    expect(await presentation.toggle()).toBe(true);
    expect(mode).toBe('fullscreen');
    expect(await presentation.toggle()).toBe(true);
    expect(mode).toBe('inline');
  } finally {
    presentation.dispose();
    delete (document as unknown as Record<string, unknown>).fullscreenEnabled;
    delete (document as unknown as Record<string, unknown>).fullscreenElement;
    delete (document as unknown as Record<string, unknown>).exitFullscreen;
  }
});
