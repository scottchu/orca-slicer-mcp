import { expect, test } from 'bun:test';
import { createServer, type Server } from 'node:http';
import { readFileSync } from 'node:fs';
import { connect } from 'node:net';
import { createUnifiedRequestHandler } from '../../src/entrypoints/server.js';
import { PrinterObservationStore } from '../../src/lib/server/observation-store.js';
import type { U1Status } from '../../src/lib/server/u1-status.js';
import { loadKitHandler } from '../../src/lib/server/kit-handler.js';
import type { RuntimeRequest } from '../../src/lib/server/runtime-port.js';
import { CameraRelayService } from '../../src/lib/server/application/camera-relay.js';
import type { CameraWebRtcSessionController, CameraViewerSessionStore } from '../../src/lib/server/application/camera-webrtc.js';
const handlerFile = new URL('../../build-kit/handler.js', import.meta.url).href;
const handler = await loadKitHandler(handlerFile);
const status: U1Status = {
  schemaVersion: 1,
  stateVersion: 7,
  observedAt: "2026-08-26T12:00:00.000Z",
  reachable: true,
  state: "printing",
  stateLabel: "Printing",
  progressPercent: 42,
  currentLayer: 21,
  totalLayers: 50,
  elapsedSeconds: 600,
  remainingSeconds: 900,
  refreshAfterSeconds: 90,
  filename: "dashboard-fixture.gcode",
  activePhysicalTool: 1,
  tools: [
    {
      physicalTool: 1,
      temperature: 215,
      target: 215,
      state: "ACTIVE",
      active: true,
    },
  ],
  bed: { temperature: 55, target: 55 },
  storage: { active: true, filePosition: 42, fileSize: 100 },
  printerMessage: null,
  exception: false,
  camera: { available: true, service: "snapshot", targetFps: 15 },
};

const origin = 'http://127.0.0.1:4181';
const fetch = (input: string, init?: RequestInit): Promise<Response> => globalThis.fetch(input, { signal: AbortSignal.timeout(1500), ...init });
const close = async (server: Server): Promise<void> => {
  server.closeAllConnections();
  await new Promise<void>((resolve) => server.close(() => resolve()));
};
const listen = async (server: Server): Promise<void> => {
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject); server.listen(4181, '127.0.0.1', resolve);
  });
};
const request = (target: string, headers = '', body = ''): Promise<string> => new Promise((resolve, reject) => {
  const socket = connect(4181, '127.0.0.1');
  let output = '';
  socket.setTimeout(2_000, () => { socket.destroy(); reject(new Error('fixture timeout')); });
  socket.on('error', reject);
  socket.on('data', (chunk) => { output += chunk.toString(); });
  socket.on('end', () => resolve(output));
  socket.on('connect', () => socket.write(`${headers ? 'POST' : 'GET'} ${target} HTTP/1.1\r\nHost: 127.0.0.1:4181\r\nConnection: close\r\n${headers}\r\n${body}`));
});

test('actual Kit Fans page is acquisition-free and HTTP/MCP share one injected store', async () => {
  let reads = 0;
  const observations = new PrinterObservationStore(async () => { reads++; return { status, metadata: {} }; });
  const dashboard = createServer(createUnifiedRequestHandler(handler, new Set(), null, null, { observations }, observations));
  await listen(dashboard);
  try {
    const page = await fetch(`${origin}/dashboard/fans`);
    expect(page.status).toBe(200);
    const html = await page.text();
    expect(html).toBe(readFileSync(new URL('../../build-kit/prerendered/dashboard/fans.html', import.meta.url), 'utf8'));
    expect(html).toContain('Fans &amp; Air');
    expect(reads).toBe(0);
    const response = await fetch(`${origin}/dashboard/tools/call`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'refresh_printer_observation', arguments: { view: 'fans' } })
    });
    expect(response.status).toBe(200);
    expect((await response.json()).structuredContent.view).toBe('fans');
    expect(reads).toBe(1);
    const headerless = await fetch(`${origin}/dashboard/tools/call`, {
      method: 'POST', body: JSON.stringify({ name: 'refresh_printer_observation', arguments: { view: 'fans' } })
    });
    expect(headerless.status).toBe(200);
    expect((await headerless.json()).structuredContent.view).toBe('fans');
    expect(reads).toBe(1);
  } finally { await close(dashboard); }
  const publicServer = createServer(createUnifiedRequestHandler(handler, new Set(), null, null, null, observations));
  await listen(publicServer);
  try {
    const response = await fetch(`${origin}/mcp`, {
      method: 'POST', headers: { accept: 'application/json, text/event-stream', 'content-type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name: 'open_printer_view', arguments: { view: 'fans' } } })
    });
    expect(response.status).toBe(200);
    expect(reads).toBe(1);
    await response.arrayBuffer();
    for (const path of ['/dashboard/fans', '/dashboard/tools/call', '/_app/version.json', '/dashboard/fans/__data.json']) expect((await fetch(origin + path)).status).toBe(404);
  } finally { await close(publicServer); }
});

test('pre-handler guards preserve raw targets, exact aliases and methods', async () => {
  const observations = new PrinterObservationStore(async () => { throw new Error('unexpected acquisition'); });
  const server = createServer(createUnifiedRequestHandler(handler, new Set(), null, null, { observations }, observations));
  await listen(server);
  try {
    for (const target of ['/dashboard/x/../fans', '/dashboard/x/%2e%2e/fans', '/dashboard/%2e%2e/dashboard/fans', '/dashboard/fans/', '/dashboard/fans.html', '/dashboard/fans/__data.json', '/_app/unknown.js']) {
      expect(await request(target)).toMatch(/^HTTP\/1\.1 404 /);
    }
    for (const method of ['HEAD', 'OPTIONS']) {
      const response = await fetch(origin + '/dashboard/fans', { method });
      expect(response.status).toBe(405); expect(response.headers.get('allow')).toBe('GET');
    }
  } finally { await close(server); }
});

test('Kit body limit counts UTF8 bytes and flushes complete/unterminated chunked 413', async () => {
  const observations = new PrinterObservationStore(async () => { throw new Error('unexpected acquisition'); });
  const server = createServer(createUnifiedRequestHandler(handler, new Set(), null, null, { observations }, observations));
  await listen(server);
  try {
    const prefix = '{"name":"unsupported","padding":"';
    const suffix = '"}';
    const padding = 131072 - prefix.length - suffix.length;
    const exact = prefix + 'é'.repeat(Math.floor(padding / 2)) + ' '.repeat(padding % 2) + suffix;
    expect(Buffer.byteLength(exact)).toBe(131072);
    const accepted = await fetch(origin + '/dashboard/tools/call', { method: 'POST', headers: { 'content-type': 'application/json' }, body: exact });
    expect(accepted.status).toBe(400); expect((await accepted.json()).error).toBe('unsupported_read_only_tool');
    const oversized = exact + ' ';
    expect((await fetch(origin + '/dashboard/tools/call', { method: 'POST', body: oversized })).status).toBe(413);
    for (const ended of [true, false]) {
      const wire = Buffer.from(oversized).length.toString(16) + '\r\n' + oversized + '\r\n' + (ended ? '0\r\n\r\n' : '');
      const response = await request('/dashboard/tools/call', 'Transfer-Encoding: chunked\r\nContent-Type: application/json\r\n', wire);
      expect(response).toMatch(/^HTTP\/1\.1 413 /); expect(response).toContain('request_too_large');
    }
  } finally { await close(server); }
});

test('Kit MCP preserves methods, media negotiation and streamed cancellation', async () => {
  const observations = new PrinterObservationStore(async () => ({ status, metadata: {} }));
  const transport = createUnifiedRequestHandler(handler, new Set(), null, null, null, observations);
  const server = createServer(transport);
  await listen(server);
  try {
    const options = await fetch(origin + '/mcp', { method: 'OPTIONS' });
    expect(options.status).toBe(204);
    expect(options.headers.get('access-control-allow-methods')).toBe('POST, GET, DELETE, OPTIONS');
    expect((await fetch(origin + '/mcp', { method: 'DELETE' })).status).toBe(200);
    expect((await fetch(origin + '/mcp', { headers: { accept: 'application/json' } })).status).toBe(406);
    const jsonBody = JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'ping' });
    for (const contentType of [undefined, 'text/plain']) {
      const response = await fetch(origin + '/mcp', {
        method: 'POST', headers: { accept: 'application/json, text/event-stream', ...(contentType ? { 'content-type': contentType } : {}) }, body: jsonBody
      });
      expect(response.status).toBe(415); await response.arrayBuffer();
    }
    const malformed = await fetch(origin + '/mcp', { method: 'POST', headers: { accept: 'application/json, text/event-stream', 'content-type': 'application/json' }, body: '{' });
    expect(malformed.status).toBe(400); await malformed.arrayBuffer();
    // This endpoint supports an open SSE stream. Cancel the actual socket; it
    // must not block a subsequent independent MCP request or shutdown.
    const abort = new AbortController();
    const streamAborted = new Promise<void>((resolve) => {
      server.once('request', (request) => (request as RuntimeRequest).u1Lifetime!.signal.addEventListener('abort', () => resolve(), { once: true }));
    });
    const timer = setTimeout(() => abort.abort(), 25);
    try { await fetch(origin + '/mcp', { headers: { accept: 'text/event-stream' }, signal: abort.signal }); }
    catch (error) { expect((error as Error).name).toBe('AbortError'); }
    finally { clearTimeout(timer); abort.abort(); }
    await streamAborted;
    const after = await fetch(origin + '/mcp', { method: 'POST', headers: { accept: 'application/json, text/event-stream', 'content-type': 'application/json' }, body: jsonBody });
    expect(after.status).toBe(200); await after.arrayBuffer();
    const largePing = await fetch(origin + '/mcp', { method: 'POST', headers: { accept: 'application/json, text/event-stream', 'content-type': 'application/json' }, body: jsonBody + ' '.repeat(1024 * 1024) });
    expect(largePing.status).toBe(200); await largePing.arrayBuffer();
  } finally { await transport.close?.(); await close(server); }
});

test('one disconnected Kit request does not cancel another shared acquisition consumer', async () => {
  let reads = 0;
  let release!: () => void;
  let started!: () => void;
  const entered = new Promise<void>((resolve) => { started = resolve; });
  const pending = new Promise<void>((resolve) => { release = resolve; });
  const observations = new PrinterObservationStore(async () => { reads++; started(); await pending; return { status, metadata: {} }; });
  const transport = createUnifiedRequestHandler(handler, new Set(), null, null, { observations }, observations);
  const server = createServer(transport);
  await listen(server);
  const abort = new AbortController();
  const body = JSON.stringify({ name: 'refresh_printer_observation', arguments: { view: 'fans' } });
  try {
    const first = fetch(origin + '/dashboard/tools/call', { method: 'POST', body, signal: abort.signal }).catch((error: Error) => error);
    await entered;
    const second = fetch(origin + '/dashboard/tools/call', { method: 'POST', body });
    abort.abort();
    expect((await first) instanceof Error).toBe(true);
    release();
    const response = await second;
    expect(response.status).toBe(200); await response.arrayBuffer();
    expect(reads).toBe(1);
  } finally { release(); abort.abort(); await transport.close?.(); await close(server); }
});

for (const path of ['/dashboard/tools/call', '/mcp', '/media/camera.webrtc']) {
test(`a disconnected ${path} Camera offer releases only its late opened session`, async () => {
  let openEntered!: () => void;
  const entered = new Promise<void>((resolve) => { openEntered = resolve; });
  let finishOpen!: () => void;
  const pending = new Promise<void>((resolve) => { finishOpen = resolve; });
  const closed: string[] = [];
  let didClose!: () => void;
  const closure = new Promise<void>((resolve) => { didClose = resolve; });
  const observations = new PrinterObservationStore(async () => ({ status, metadata: {} }));
  const cameraSessions: CameraWebRtcSessionController = {
      authorize: () => ({ token: 'fixture-activation', expiresAt: '2030-01-01T00:00:00Z' }),
      open: async () => { openEntered(); await pending; return { sessionId: 'owned-late-session', type: 'offer', sdp: 'v=0', iceServers: [], expiresAt: '2030-01-01T00:00:00Z', maxDurationSeconds: 60 }; },
      answer: async () => ({ accepted: true }),
      addCandidates: async () => ({ accepted: true, candidateCount: 0 }),
      close: (id) => { closed.push(id); didClose(); return { closed: true }; }
  };
  const relay = new CameraRelayService({ issue: () => ({ token: 'fixture-activation', digest: 'fixture-digest' }), digest: () => 'fixture-digest' });
  relay.authorize();
  const sessions: CameraViewerSessionStore = {
    ...cameraSessions, privacyBoundary: 'server-terminated-fanout',
    open: async () => cameraSessions.open('fixture-activation'),
    answer: async (id, sdp) => cameraSessions.answer(id, String(sdp)),
    addCandidates: async () => ({ accepted: true, candidateCount: 0 })
  };
  const transport = createUnifiedRequestHandler(handler, new Set(), null, {
    relay, locator: { locate: () => '' }, sessions, controller: cameraSessions
  }, path === '/mcp' ? null : { observations, cameraSessions }, observations);
  const server = createServer(transport); await listen(server);
  const socket = connect(4181, '127.0.0.1');
  const disconnected = new Promise<void>((resolve) => {
    server.once('request', (request) => (request as RuntimeRequest).u1Lifetime!.signal.addEventListener('abort', () => resolve(), { once: true }));
  });
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    const tool = { name: 'open_u1_camera_stream', arguments: { activationToken: 'fixture-activation' } };
    const body = JSON.stringify(path === '/mcp' ? { jsonrpc: '2.0', id: 1, method: 'tools/call', params: tool } : path === '/media/camera.webrtc' ? { type: 'request' } : tool);
    await new Promise<void>((resolve, reject) => { socket.once('connect', resolve); socket.once('error', reject); });
    socket.write(`POST ${path}${path === '/media/camera.webrtc' ? '?ticket=fixture-activation' : ''} HTTP/1.1\r\nHost: 127.0.0.1:4181\r\nAccept: application/json, text/event-stream\r\nContent-Type: application/json\r\nContent-Length: ${Buffer.byteLength(body)}\r\n\r\n${body}`);
    await entered; socket.destroy();
    // Resolve the offer only after the server observes this socket's closure.
    await disconnected;
    finishOpen();
    await Promise.race([closure, new Promise<never>((_resolve, reject) => { timeout = setTimeout(() => reject(new Error('late Camera session leaked')), 1000); })]);
    expect(closed).toEqual([path === '/media/camera.webrtc' ? 'fixture-activation' : 'owned-late-session']);
    // A separately delivered offer stays owned by its consumer until explicit
    // close, even when that completed HTTP connection subsequently closes.
    const callTool = (value: unknown) => fetch(origin + (path === '/mcp' ? '/mcp' : '/dashboard/tools/call'), {
      method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream' },
      body: JSON.stringify(path === '/mcp' ? { jsonrpc: '2.0', id: 2, method: 'tools/call', params: value } : value)
    });
    const normal = await callTool(tool);
    expect(normal.status).toBe(200); await normal.arrayBuffer();
    expect(closed).toHaveLength(1);
    const closedNormal = await callTool({ name: 'close_u1_camera_stream', arguments: { sessionId: 'owned-late-session' } });
    expect(closedNormal.status).toBe(200); await closedNormal.arrayBuffer();
    expect(closed).toHaveLength(2);
  } finally { if (timeout) clearTimeout(timeout); finishOpen(); socket.destroy(); await transport.close?.(); await close(server); }
});
}
