import { expect, test } from 'bun:test';
import { createServer, type Server } from 'node:http';
import { connect } from 'node:net';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { createUnifiedRequestHandler } from '../../src/entrypoints/server.js';
import { loadKitHandler } from '../../src/lib/server/kit-handler.js';
import { createKitObservationFixture } from '../fixtures/kit-observation-store.js';

const handler = await loadKitHandler(new URL('../../build-kit/handler.js', import.meta.url).href);
const port = 4182;
const origin = `http://127.0.0.1:${port}`;
const clientRoot = new URL('../../build-kit/client/', import.meta.url).pathname;
const files = (folder: string, prefix = ''): string[] => readdirSync(folder, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? files(path.join(folder, entry.name), `${prefix}${entry.name}/`) : [`/${prefix}${entry.name}`]);
const clientPaths = new Set(files(clientRoot));
const listen = (server: Server) => new Promise<void>((resolve, reject) => {
  server.once('error', reject); server.listen(port, '127.0.0.1', resolve);
});
const close = async (server: Server) => {
  server.closeAllConnections();
  await new Promise<void>((resolve) => server.close(() => resolve()));
};
const fetch = (target: string, init?: RequestInit) => globalThis.fetch(origin + target, { signal: AbortSignal.timeout(1500), ...init });
const raw = (target: string) => new Promise<string>((resolve, reject) => {
  const socket = connect(port, '127.0.0.1');
  let output = '';
  socket.setTimeout(1500, () => { socket.destroy(); reject(new Error('Fixture timeout')); });
  socket.on('error', reject);
  socket.on('data', (chunk) => { output += chunk.toString(); });
  socket.on('end', () => resolve(output));
  socket.on('connect', () => socket.end(`GET ${target} HTTP/1.1\r\nHost: 127.0.0.1:${port}\r\nConnection: close\r\n\r\n`));
});

for (const [view, title, domain] of [
  ['thermals', 'Thermals', 'environmentReads'],
  ['heads', 'Heads &amp; Filaments', 'materialsReads'],
  ['queue', 'Print Queue', 'queueReads']
] as const) {
  test(`native ${view} keeps exact prerender, zero SSR reads, scoped demand and route security`, async () => {
    const fixture = createKitObservationFixture();
    const { observations } = fixture;
    const transport = createUnifiedRequestHandler(handler, clientPaths, null, null, { observations }, observations);
    const dashboard = createServer(transport);
    await listen(dashboard);
    try {
      const route = `/dashboard/${view}`;
      for (const target of [route, `${route}?view=camera`]) {
        const response = await fetch(target);
        const html = await response.text();
        expect(response.status).toBe(200);
        expect(html).toBe(readFileSync(new URL(`../../build-kit/prerendered/dashboard/${view}.html`, import.meta.url), 'utf8'));
        expect(html).toContain(title);
        expect(html).not.toMatch(/<iframe\b/);
        expect(html).toContain('aria-busy="true"');
        expect(response.headers.get('content-security-policy')).toBe("default-src 'none'; img-src data:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'");
        expect(response.headers.get('referrer-policy')).toBe('no-referrer');
      }
      expect(fixture.counts()).toEqual({ statusReads: 0, environmentReads: 0, materialsReads: 0, queueReads: 0 });
      for (const suffix of ['/', '.html', '/__data.json', '/index.html', '/more']) expect((await fetch(route + suffix)).status).toBe(404);
      for (const target of [`/dashboard/x/../${view}`, `/dashboard/x/%2e%2e/${view}`, `/dashboard/%${view.charCodeAt(0).toString(16)}${view.slice(1)}`]) expect(await raw(target)).toMatch(/^HTTP\/1\.1 404 /);
      for (const method of ['HEAD', 'OPTIONS', 'POST']) {
        const response = await fetch(route, { method });
        expect(response.status).toBe(405); expect(response.headers.get('allow')).toBe('GET');
      }
      const response = await fetch('/dashboard/tools/call', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: 'refresh_printer_observation', arguments: { view } })
      });
      expect(response.status).toBe(200);
      expect((await response.json()).structuredContent.view).toBe(view);
      expect(fixture.counts()).toEqual({ statusReads: 1, environmentReads: 0, materialsReads: 0, queueReads: 0, [domain]: 1 });
    } finally { fixture.release(); await transport.close?.(); await close(dashboard); }
    const publicTransport = createUnifiedRequestHandler(handler, clientPaths, null, null, null, observations);
    const publicServer = createServer(publicTransport);
    await listen(publicServer);
    try {
      for (const target of [`/dashboard/${view}`, `/dashboard/${view}/__data.json`, ...clientPaths]) expect((await fetch(target)).status).toBe(404);
    } finally { await publicTransport.close?.(); await close(publicServer); }
  });
}
