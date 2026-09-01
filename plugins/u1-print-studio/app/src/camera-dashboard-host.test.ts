import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const setup = (result: (name: string) => Promise<unknown> = async () => ({})) => {
  const script = readFileSync(new URL('../public/camera-dashboard-host.html', import.meta.url), 'utf8').match(/<script>([\s\S]*?)<\/script>/)![1];
  const origin = 'http://127.0.0.1:12345'; const messages: any[] = [], requests: any[] = [];
  const frame = { src: '', contentWindow: { postMessage: (message: unknown, target: string) => { expect(target).toBe(origin); messages.push(message); } } };
  const handlers: Record<string, (event?: any) => Promise<void> | void> = {};
  let reload = () => {};
  runInNewContext(script, {
    TextEncoder, location: { origin }, document: { querySelector: (selector: string) => selector === '#camera-widget' ? frame : selector === '#bridge-state' ? { textContent: '' } : { addEventListener: (_type: string, callback: () => void) => { reload = callback; } } },
    window: { addEventListener: (type: string, callback: typeof handlers[string]) => { handlers[type] = callback; } },
    fetch: async (url: string, options: { body: string }) => {
      expect(url).toBe('/dashboard/tools/call'); const body = JSON.parse(options.body); requests.push(body);
      const value = await result(body.name); return { ok: true, json: async () => value };
    },
  });
  return { frame, messages, requests, reload: () => reload(), hide: () => handlers.pagehide(), send: (data: unknown, eventOrigin = origin, source: unknown = frame.contentWindow) => handlers.message({ source, origin: eventOrigin, data: { jsonrpc: '2.0', ...data as object } }) };
};
const call = (name: string, args = {}) => ({ method: 'tools/call', id: 2, params: { name, arguments: args } });

describe('private Camera host owns one child epoch', () => {
  test('installs the bridge before navigating to the exact migrated child', async () => {
    const app = setup(); expect(app.frame.src).toBe('/dashboard/camera_widget');
    await app.send({ method: 'ui/initialize', id: 1 });
    expect(app.messages[0].result.protocolVersion).toBe('2026-01-26'); expect(app.requests).toHaveLength(0);
    await app.send(call('get_u1_camera_frame')); expect(app.requests).toEqual([{ name: 'get_u1_camera_frame', arguments: {} }]);
  });
  test('rejects wrong origins, sibling windows, extra arguments and non-camera tools', async () => {
    const app = setup();
    await app.send(call('get_u1_camera_frame'), 'https://unrelated.invalid'); await app.send(call('get_u1_camera_frame'), undefined, {});
    await app.send(call('refresh_printer_observation', { view: 'fans' })); await app.send(call('get_u1_camera_frame', { url: 'private.invalid' }));
    expect(app.requests).toHaveLength(0); expect(app.messages).toHaveLength(2);
    expect(app.messages.every((message) => message.error.message === 'tool_failed')).toBe(true);
  });
  test('drops old child replies on reload and releases a late allocated downstream lease', async () => {
    let release!: (value: unknown) => void;
    const app = setup((name) => name === 'open_u1_camera_stream' ? new Promise((resolve) => { release = resolve; }) : Promise.resolve({ structuredContent: { closed: true } }));
    const pending = app.send(call('open_u1_camera_stream', { activationToken: 'fixture-activation-capability' }));
    app.reload(); expect(app.frame.src).toContain('/dashboard/camera_widget?t=');
    release({ _meta: { cameraStream: { sessionId: 'fixture-session-capability' } } }); await pending;
    expect(app.messages).toHaveLength(0);
    expect(app.requests.at(-1)).toEqual({ name: 'close_u1_camera_stream', arguments: { sessionId: 'fixture-session-capability' } });
  });
  test('a reinitializing child and pagehide invalidate older ordinary replies', async () => {
    let release!: (value: unknown) => void;
    const app = setup(() => new Promise((resolve) => { release = resolve; }));
    const pending = app.send(call('get_u1_camera_frame')); await app.send({ method: 'ui/initialize', id: 1 }); app.hide();
    const before = app.messages.length; release({ structuredContent: {} }); await pending; expect(app.messages).toHaveLength(before);
  });
});
