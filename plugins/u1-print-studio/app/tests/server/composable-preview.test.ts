import { afterEach, expect, test } from 'bun:test';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { connect, type AddressInfo } from 'node:net';
import type { Server } from 'node:http';

import {
  assertComposablePreviewManifest,
  canonicalComposablePreviewManifest,
  collectComposablePreviewSnapshot,
  COMPOSABLE_PREVIEW_MANIFEST,
  COMPOSABLE_PREVIEW_PATH,
  createComposablePreviewServer,
} from '../../scripts/serve-composable-preview.js';

const active = new Set<Server>();
afterEach(async () => {
  await Promise.all([...active].map(async (server) => {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
    active.delete(server);
  }));
});

const start = async (): Promise<{ server: Server; origin: string }> => {
  const server = createComposablePreviewServer();
  active.add(server);
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  return { server, origin: `http://127.0.0.1:${(server.address() as AddressInfo).port}` };
};

const hash = (bytes: Buffer | string): string => createHash('sha256').update(bytes).digest('hex');
const rawExchange = (port: number, request: string): Promise<string> => new Promise((resolve, reject) => {
  const socket = connect(port, '127.0.0.1');
  let output = '';
  socket.setTimeout(1_500, () => { socket.destroy(); reject(new Error('Preview fixture timeout')); });
  socket.on('error', reject);
  socket.on('data', (chunk) => { output += chunk.toString(); });
  socket.on('end', () => resolve(output));
  socket.on('connect', () => socket.end(request));
});

const rawGet = (port: number, target: string): Promise<string> =>
  rawExchange(port, `GET ${target} HTTP/1.1\r\nHost: 127.0.0.1:${port}\r\nConnection: close\r\n\r\n`);

test('serves only the exact prerendered page and its referenced immutable asset graph', async () => {
  expect(canonicalComposablePreviewManifest()).toBe(COMPOSABLE_PREVIEW_MANIFEST);
  expect(() => assertComposablePreviewManifest('0'.repeat(64))).toThrow('artifact identity mismatch');
  const { origin } = await start();
  const expected = readFileSync(new URL('../../build-kit-composable-v2/prerendered/dashboard/lab/composition.html', import.meta.url));
  const response = await fetch(origin + COMPOSABLE_PREVIEW_PATH);
  const body = Buffer.from(await response.arrayBuffer());
  expect(response.status).toBe(200);
  expect(response.headers.get('content-security-policy')).toContain("default-src 'none'");
  expect(body).toEqual(expected);
  expect(hash(body)).toBe('e4be14ad79a115932609ddb86aa470dc797aa53b31b3caf9edda25e348ca1e7c');

  const head = await fetch(origin + COMPOSABLE_PREVIEW_PATH, { method: 'HEAD' });
  expect(head.status).toBe(200);
  expect(head.headers.get('content-length')).toBe(String(expected.length));
  expect(await head.text()).toBe('');

  const references = [...body.toString('utf8').matchAll(/\/_app\/immutable\/[A-Za-z0-9_./-]+/g)]
    .map(([value]) => value)
    .filter((value, index, values) => values.indexOf(value) === index);
  expect(references.length).toBeGreaterThan(0);
  for (const reference of references) {
    const asset = await fetch(origin + reference);
    expect(asset.status, reference).toBe(200);
    expect(Number(asset.headers.get('content-length')), reference).toBeGreaterThan(0);
    expect(asset.headers.get('cache-control'), reference).toContain('immutable');
    const assetHead = await fetch(origin + reference, { method: 'HEAD' });
    expect(assetHead.status, reference).toBe(200);
    expect(await assetHead.text()).toBe('');
  }
});

test('serves immutable bytes from the single validated construction snapshot', async () => {
  const snapshot = collectComposablePreviewSnapshot();
  const page = snapshot.get('prerendered/dashboard/lab/composition.html');
  expect(page).toBeDefined();
  const validatedPage = Buffer.from(page!);
  const server = createComposablePreviewServer(snapshot);
  active.add(server);
  page!.fill(0);
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const response = await fetch(origin + COMPOSABLE_PREVIEW_PATH);
  expect(response.status).toBe(200);
  expect(Buffer.from(await response.arrayBuffer())).toEqual(validatedPage);
  expect(canonicalComposablePreviewManifest(snapshot)).not.toBe(COMPOSABLE_PREVIEW_MANIFEST);
  expect(() => createComposablePreviewServer(snapshot)).toThrow('artifact identity mismatch');
});

test('denies every non-preview route, method and raw protocol variation without outbound acquisition', async () => {
  let outbound = 0;
  const canary = Bun.serve({ hostname: '127.0.0.1', port: 0, fetch: () => {
    outbound += 1;
    return new Response('must not be reached');
  } });
  const previousMoonraker = process.env.MOONRAKER_BASE_URL;
  process.env.MOONRAKER_BASE_URL = canary.url.toString();
  try {
    const { server, origin } = await start();
    const paths = [
      '/', '/health', '/widget', '/mcp', '/mcp/session',
      '/.well-known/oauth-authorization-server', '/.well-known/oauth-protected-resource',
      '/oauth/authorize', '/auth/enroll', '/media/camera.webrtc',
      '/dashboard', '/dashboard/overview', '/dashboard/composition', '/dashboard/tools/call',
      '/dashboard/camera', '/dashboard/camera_widget', '/dashboard/lab/camera', '/__fixture/state',
      `${COMPOSABLE_PREVIEW_PATH}/`, `${COMPOSABLE_PREVIEW_PATH}?state=known`,
    ];
    for (const path of paths) {
      for (const method of ['GET', 'HEAD', 'POST', 'OPTIONS']) {
        const response = await fetch(origin + path, {
          method,
          headers: method === 'POST' ? { 'content-type': 'application/json' } : undefined,
          body: method === 'POST' ? JSON.stringify({ name: 'get_u1_camera_frame', arguments: {} }) : undefined,
        });
        expect(response.status, `${method} ${path}`).toBe(404);
        expect(await response.text(), `${method} ${path}`).toBe(method === 'HEAD' ? '' : 'Not Found');
      }
    }
    for (const method of ['POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']) {
      expect((await fetch(origin + COMPOSABLE_PREVIEW_PATH, { method })).status, method).toBe(404);
    }
    const port = (server.address() as AddressInfo).port;
    for (const target of [
      '/dashboard/lab/%63omposition', '/dashboard/lab/x/../composition',
      '/dashboard/lab/x/%2e%2e/composition', '/dashboard\\lab\\composition',
    ]) expect(await rawGet(port, target), target).toMatch(/^HTTP\/1\.1 404 /);
    const rawAdversaries = [
      `TRACE ${COMPOSABLE_PREVIEW_PATH} HTTP/1.1\r\nHost: 127.0.0.1:${port}\r\nConnection: close\r\n\r\n`,
      `OPTIONS * HTTP/1.1\r\nHost: 127.0.0.1:${port}\r\nConnection: close\r\n\r\n`,
      `CONNECT example.invalid:443 HTTP/1.1\r\nHost: example.invalid:443\r\n\r\n`,
      `GET ${COMPOSABLE_PREVIEW_PATH} HTTP/1.1\r\nHost: 127.0.0.1:${port}\r\nConnection: Upgrade\r\nUpgrade: websocket\r\n\r\n`,
      `BREW ${COMPOSABLE_PREVIEW_PATH} HTTP/1.1\r\nHost: 127.0.0.1:${port}\r\nConnection: close\r\n\r\n`,
    ];
    for (const request of rawAdversaries) {
      const raw = await rawExchange(port, request);
      expect(raw).toMatch(/^HTTP\/1\.1 (?:400|404) /);
      expect(raw).not.toMatch(/^HTTP\/1\.1 2\d\d /);
      expect(raw).not.toContain('<!doctype html>');
    }
    expect((await fetch(origin + '/_app/immutable/nodes/3.UeRTUa7r.js')).status).toBe(404);
    expect((await fetch(origin + '/_app/immutable/nodes/1.BieyvGzI.js?cache=1')).status).toBe(404);
    expect(outbound).toBe(0);
  } finally {
    if (previousMoonraker === undefined) delete process.env.MOONRAKER_BASE_URL;
    else process.env.MOONRAKER_BASE_URL = previousMoonraker;
    canary.stop(true);
  }
});

test('has a closed built-in-only import graph and no production authority fallback', () => {
  const source = readFileSync(new URL('../../scripts/serve-composable-preview.ts', import.meta.url), 'utf8');
  const imports = [
    ...source.matchAll(/from ['"]([^'"]+)['"]/g),
    ...source.matchAll(/^\s*import\s*['"]([^'"]+)['"]/gm),
    ...source.matchAll(/\bimport\s*\(\s*['"]([^'"]+)['"]/g),
    ...source.matchAll(/\brequire\s*\(\s*['"]([^'"]+)['"]/g),
  ].map((match) => match[1]).sort();
  expect(imports).toEqual(['node:crypto', 'node:fs', 'node:http', 'node:url']);
  expect(source).not.toMatch(/entrypoints\/server|dashboard-tools|status-dashboard|mcp-http|PrinterObservationStore|u1-status|camera|auth|local-config|child_process|Bun\.spawn|\bfetch\s*\(|\bcurl\b/);
  expect(source).not.toContain('COMPOSABLE_KIT_FIXTURE_DIR');
  expect(source).not.toContain("'build-kit'");
});
