import { expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { createServer, request } from 'node:http';
import type { AddressInfo } from 'node:net';
import { loadKitHandler } from '../../src/lib/server/kit-handler.js';
import { createKitTransport } from '../../src/lib/server/kit-transport.js';
import { DASHBOARD_PAGES, NATIVE_LAB_PATHS, routePolicy } from '../../src/lib/server/route-policy.js';
import type { RuntimePort } from '../../src/lib/server/runtime-port.js';
import { createKitObservationFixture } from '../fixtures/kit-observation-store.js';

const handler = await loadKitHandler(new URL('../../build-kit/handler.js', import.meta.url).href);
const pagePath = '/dashboard/lab/composition';
const dataPath = `${pagePath}/__data.json`;
const pageBytes = readFileSync(new URL('../../build-kit/prerendered/dashboard/lab/composition.html', import.meta.url), 'utf8');
const dataBytes = readFileSync(new URL('../../build-kit/prerendered/dashboard/lab/composition/__data.json', import.meta.url), 'utf8');

test('the single private Lab data policy is GET-only and separate from HTML pages', () => {
  expect(routePolicy(dataPath, true, false, false)).toEqual({ kind: 'data', methods: ['GET'], deniedMethod: 405 });
  expect(routePolicy(dataPath, false, true, true)).toBeNull();
  expect(DASHBOARD_PAGES.has(dataPath)).toBe(false);
  expect(NATIVE_LAB_PATHS.has(dataPath)).toBe(false);
});

for (const basePath of ['', '/private-fixture']) {
  for (const dashboard of [true, false]) {
    test(`actual Kit Lab page/data preserve exact targets and no acquisition (${dashboard ? 'dashboard' : 'public'}, base ${basePath || '/'})`, async () => {
      const fixture = createKitObservationFixture();
      const unexpected = (): never => { throw new Error('Unexpected runtime operation from static Lab'); };
      const runtime: RuntimePort = {
        observations: fixture.observations, dashboard: dashboard ? { observations: fixture.observations } : null,
        basePath, hasOAuth: false, hasCamera: false,
        callTool: unexpected, general: unexpected, page: unexpected, oauth: unexpected,
        camera: unexpected, mcp: unexpected, close: async () => {},
      };
      const transport = createKitTransport(handler, runtime, new Set());
      const server = createServer(transport);
      try {
        await new Promise<void>((resolve, reject) => {
          server.once('error', reject);
          server.listen(0, '127.0.0.1', resolve);
        });
        const port = (server.address() as AddressInfo).port;
        // node:http preserves the request target, including dot/encoded segments.
        const send = (target: string, method = 'GET') => new Promise<{ status: number; body: string; headers: import('node:http').IncomingHttpHeaders }>((resolve, reject) => {
          const req = request({ hostname: '127.0.0.1', port, path: target, method, agent: false }, (res) => {
            const chunks: Buffer[] = [];
            res.on('data', (chunk: Buffer) => chunks.push(chunk));
            res.on('error', reject);
            res.on('end', () => resolve({ status: res.statusCode!, body: Buffer.concat(chunks).toString(), headers: res.headers }));
          });
          req.setTimeout(1500, () => req.destroy(new Error('Lab fixture request timeout')));
          req.on('error', reject);
          req.end();
        });
        for (const [route, bytes] of [[pagePath, pageBytes], [dataPath, dataBytes]]) {
          for (const query of ['', '?view=camera', '?x-sveltekit-invalidated=11']) {
            const response = await send(basePath + route + query);
            expect(response.status).toBe(dashboard ? 200 : 404);
            if (dashboard) {
              expect(response.body).toBe(bytes);
              expect(response.headers['cache-control']).toBe('no-store');
              expect(response.headers['x-content-type-options']).toBe('nosniff');
              if (route === dataPath) {
                expect(response.headers['content-type']).toContain('application/json');
                expect(response.headers['content-security-policy']).toBeUndefined();
                expect(JSON.parse(response.body).type).toBe('data');
              } else {
                expect(response.headers['content-security-policy']).toContain("frame-ancestors 'none'");
              }
            }
          }
          for (const method of ['HEAD', 'OPTIONS', 'POST', 'PUT', 'PATCH', 'DELETE']) {
            const response = await send(basePath + route, method);
            expect(response.status).toBe(dashboard ? 405 : 404);
            expect(response.headers.allow).toBe(dashboard ? 'GET' : undefined);
          }
        }
        for (const target of [
          `${dataPath}/`, `${dataPath}/more`, `${pagePath}/__data.json.html`,
          '/dashboard/lab/heads/__data.json', '/dashboard/heads/__data.json',
          '/dashboard/lab/x/../composition/__data.json', '/dashboard/lab/x/%2e%2e/composition/__data.json',
          '/dashboard/lab/%63omposition/__data.json', '/dashboard/lab/composition/%5f_data.json',
          '/dashboard\\lab\\composition\\__data.json', `${dataPath}#fragment`,
          '/dashboard//lab/composition/__data.json',
        ]) expect((await send(basePath + target)).status).toBe(404);
        if (basePath) expect((await send(`${basePath}-other${dataPath}`)).status).toBe(404);
        expect(fixture.counts()).toEqual({ statusReads: 0, environmentReads: 0, materialsReads: 0, queueReads: 0 });
      } finally {
        fixture.release();
        await transport.close?.();
        server.closeAllConnections();
        await new Promise<void>((resolve) => server.close(() => resolve()));
      }
    });
  }
}
