import { expect, test } from 'bun:test';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { createServer, type Server } from 'node:http';
import { connect, type AddressInfo } from 'node:net';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import type { createUnifiedRequestHandler } from '../../src/entrypoints/server.js';
import { loadKitHandler } from '../../src/lib/server/kit-handler.js';
import { createKitObservationFixture } from '../fixtures/kit-observation-store.js';

const app = path.resolve(import.meta.dir, '../..');
const native = ['overview', 'progress', 'thermals', 'heads', 'jobs', 'job_history', 'queue', 'fans', 'bed_mesh'];
const widgets = [...native, 'camera'];
const digest = (bytes: Buffer) => createHash('sha256').update(bytes).digest('hex');
type Manifest = { runtimeFiles: Record<string, string>; staticRoutes: Record<string, { file: string; sha256: string; role: string }> };

test('compiled production manifest and dispatcher deliver the exact nine native and ten widget routes', async () => {
  const builds = path.join(app, 'test-results/server-builds');
  mkdirSync(builds, { recursive: true });
  const prior = new Set(readdirSync(builds));
  const output = mkdtempSync(path.join(builds, 'route-contract-'));
  const child = Bun.spawn([process.execPath, '--no-env-file', '--config=/dev/null', 'run', 'scripts/build-server.ts', '--outdir', output], {
    cwd: app, stdin: 'ignore', stdout: 'pipe', stderr: 'pipe'
  });
  const stdout = new Response(child.stdout).text();
  const stderr = new Response(child.stderr).text();
  const fixture = createKitObservationFixture();
  const active = new Set<Server>();
  const transports = new Set<ReturnType<typeof createUnifiedRequestHandler>>();
  const listen = async (server: Server) => {
    active.add(server);
    await new Promise<void>((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
    return (server.address() as AddressInfo).port;
  };
  try {
    const code = await child.exited;
    expect(code, (await stdout) + (await stderr)).toBe(0);
    const manifest = JSON.parse(readFileSync(path.join(output, 'build-manifest.json'), 'utf8')) as Manifest;
    // Exercise the unchanged shipping schema, including required unrouted resources.
    execFileSync('uv', ['run', '--no-project', 'python', '-c',
      'import sys; from pathlib import Path; sys.path.insert(0, "scripts"); from u1_build_contract import read_current_build_manifest; read_current_build_manifest(Path(sys.argv[1]))', output],
    { cwd: path.resolve(app, '../../..'), timeout: 10_000, stdio: 'pipe' });
    const mapped = new Set(Object.values(manifest.staticRoutes).map(({ file }) => file));
    for (const [file, hash] of Object.entries(manifest.runtimeFiles)) {
      expect(digest(readFileSync(path.join(output, file))), file).toBe(hash);
      if (file.startsWith('prerendered/') || file.startsWith('client/')) expect(mapped.has(file), file).toBe(true);
    }
    expect(manifest.runtimeFiles['static-contract/status-dashboard-host.html']).toBe(digest(readFileSync(path.join(app, 'public/status-dashboard-host.html'))));
    expect(mapped.has('static-contract/status-dashboard-host.html')).toBe(false);
    expect(Object.keys(manifest.staticRoutes).filter((route) => /^\/dashboard\/[^/]+_widget$/.test(route)).sort()).toEqual(widgets.map((view) => `/dashboard/${view}_widget`).sort());
    expect(Object.entries(manifest.staticRoutes).filter(([, value]) => /^prerendered\/dashboard\/[^/]+\.html$/.test(value.file)).map(([route]) => route).sort()).toEqual(native.map((view) => `/dashboard/${view}`).sort());
    const compiled = await import(pathToFileURL(path.join(output, 'server.js')).href) as { createUnifiedRequestHandler: typeof createUnifiedRequestHandler };
    const handler = await loadKitHandler(pathToFileURL(path.join(output, 'handler.js')).href);
    const clientPaths = new Set(Object.keys(manifest.staticRoutes).filter((route) => route.startsWith('/_app/')));
    const routes = [...native.map((view) => `/dashboard/${view}`), ...widgets.map((view) => `/dashboard/${view}_widget`)];
    for (const dashboard of [true, false]) {
      const transport = compiled.createUnifiedRequestHandler(handler, clientPaths, null, null, dashboard ? { observations: fixture.observations } : null, fixture.observations);
      transports.add(transport);
      const port = await listen(createServer(transport));
      const request = (route: string, method = 'GET') => fetch(`http://127.0.0.1:${port}${route}`, { method, signal: AbortSignal.timeout(2000) });
      for (const route of routes) {
        const response = await request(route);
        if (!dashboard) { expect(response.status, route).toBe(404); await response.arrayBuffer(); continue; }
        const entry = manifest.staticRoutes[route];
        expect(entry.role, route).toBe('dashboard');
        expect(response.status, route).toBe(200);
        const bytes = Buffer.from(await response.arrayBuffer());
        expect(bytes, route).toEqual(readFileSync(path.join(output, entry.file)));
        expect(digest(bytes), route).toBe(entry.sha256);
        if (!route.endsWith('_widget')) {
          expect(entry.file).toBe(`prerendered${route}.html`);
          expect(bytes.toString()).not.toMatch(/<iframe\b/);
          expect(response.headers.get('content-security-policy')).toContain("default-src 'none'");
        }
        for (const method of ['HEAD', 'OPTIONS', 'POST']) {
          const denied = await request(route, method);
          expect(denied.status, `${method} ${route}`).toBe(405);
          expect(denied.headers.get('allow')).toBe('GET');
          await denied.arrayBuffer();
        }
        for (const suffix of ['/', '.html', '/__data.json']) {
          const denied = await request(route + suffix);
          expect(denied.status, route + suffix).toBe(404); await denied.arrayBuffer();
        }
      }
      const raw = await new Promise<string>((resolve, reject) => {
        const socket = connect(port, '127.0.0.1');
        let result = '';
        socket.setTimeout(2000, () => { socket.destroy(); reject(new Error('Route fixture timeout')); });
        socket.on('error', reject); socket.on('data', (chunk) => { result += chunk; }); socket.on('end', () => resolve(result));
        socket.on('connect', () => socket.end('GET /dashboard/x/%2e%2e/progress HTTP/1.1\r\nHost: localhost\r\nConnection: close\r\n\r\n'));
      });
      expect(raw).toMatch(/^HTTP\/1\.1 404 /);
    }
    expect(fixture.counts()).toEqual({ statusReads: 0, environmentReads: 0, materialsReads: 0, queueReads: 0 });
  } finally {
    if (child.exitCode === null) { child.kill(); await child.exited; }
    await Promise.all([stdout, stderr]);
    fixture.release();
    for (const transport of transports) await transport.close?.();
    for (const server of active) { server.closeAllConnections(); await new Promise<void>((resolve) => server.close(() => resolve())); }
    rmSync(output, { recursive: true, force: true });
    // This serial test owns the producer's single newly created staging folder.
    // Leave ambiguous concurrent output alone rather than remove another build.
    const stages = readdirSync(builds).filter((name) => !prior.has(name) && name.startsWith('build-'));
    if (stages.length === 1) rmSync(path.join(builds, stages[0]), { recursive: true, force: true });
  }
}, 60_000);
