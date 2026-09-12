import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createAppServer, MCP_OBSERVATION_HTML } from '../src/lib/server/app.js';
import { createKitObservationFixture } from '../tests/fixtures/kit-observation-store.js';
import { readFileSync } from 'node:fs';
import { dashboardPage } from '../src/lib/server/status-dashboard.js';

const fixture = createKitObservationFixture();
let image = '';
let frameNumber = 0;
let failCamera = false;
let failLive = true;
const calls: { name: string; arguments: Record<string, unknown> }[] = [];
const app = createAppServer({
  observations: fixture.observations,
  readStatus: async () => {
    throw new Error('Use the isolated observation fixture');
  },
  readCameraFrame: async () => {
    frameNumber++;
    if (failCamera || !image) throw new Error('Synthetic Camera unavailable');
    return {
      frame: {
        schemaVersion: 1 as const,
        available: true,
        mediaType: 'image/jpeg' as const,
        observedAt: new Date(Date.parse('2026-09-01T12:00:00Z') + frameNumber * 1000).toISOString(),
        byteLength: Buffer.from(image.split(',')[1], 'base64').length,
        reason: null,
      },
      metadata: { cameraFrame: { dataUrl: image } },
    };
  },
  cameraSessions: {
    authorize: () => ({
      token: 'fixture-activation-capability',
      expiresAt: '2026-09-01T12:30:00.000Z',
    }),
    open: async () => {
      if (failLive) throw new Error('Synthetic Live unavailable');
      return {
        sessionId: 'fixture-session-capability',
        type: 'offer',
        sdp: 'fixture-downstream-offer',
        iceServers: [],
        expiresAt: '2026-09-01T12:30:00.000Z',
        maxDurationSeconds: 1800,
      };
    },
    answer: async () => ({ accepted: true }),
    addCandidates: async (_id, candidates) => ({
      accepted: true,
      candidateCount: candidates.length,
    }),
    close: () => ({ closed: true }),
  },
});
const client = new Client({ name: 'mcp-widget-fixture', version: '1' }, { capabilities: {} });
const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
await Promise.all([app.connect(serverTransport), client.connect(clientTransport)]);
const html = readFileSync(
  new URL('../tests/fixtures/mcp-widget-host.html', import.meta.url),
  'utf8',
);
const dashboardPaths = new Set(['overview', 'progress', 'jobs', 'job_history', 'bed_mesh']
  .flatMap(view => [`/dashboard/${view}`, `/dashboard/${view}_widget`]));
const server = Bun.serve({
  hostname: '127.0.0.1',
  port: Number(process.env.U1_MCP_FIXTURE_PORT ?? 4182),
  fetch: async (request) => {
    const url = new URL(request.url);
    try {
      if (dashboardPaths.has(url.pathname)) {
        const page = dashboardPage(url.pathname, request.method);
        if (page) return page;
      }
      if (request.method === 'GET' && url.pathname === '/widget') {
        return new Response(MCP_OBSERVATION_HTML, { headers: { 'content-type': 'text/html' } });
      }
      if (url.pathname === '/host')
        return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8' } });
      if (url.pathname === '/fixture/tools') return Response.json(await client.listTools());
      if (url.pathname === '/fixture/resource')
        return Response.json(await client.readResource({ uri: url.searchParams.get('uri') ?? '' }));
      if (url.pathname === '/fixture/call' || url.pathname === '/dashboard/tools/call') {
        const call = (await request.json()) as { name: string; arguments: Record<string, unknown> };
        calls.push(call);
        return Response.json(await client.callTool(call));
      }
      if (url.pathname === '/fixture/state')
        return Response.json({ calls, frameNumber, counts: fixture.counts() });
      if (url.pathname === '/fixture/configure') {
        const config = (await request.json()) as {
          image?: string;
          failCamera?: boolean;
          failLive?: boolean;
          fail?: boolean;
          hold?: boolean;
          reset?: boolean;
          bedMesh?: boolean;
        };
        if (config.image !== undefined) image = config.image;
        failCamera = config.failCamera ?? false;
        failLive = config.failLive ?? true;
        if (config.reset) {
          calls.length = 0;
          frameNumber = 0;
        }
        fixture.configure(config);
        return Response.json({ ok: true });
      }
      return new Response('Not found', { status: 404 });
    } catch {
      return Response.json({
        isError: true,
        content: [{ type: 'text', text: 'Synthetic request unavailable' }],
      });
    }
  },
});
let stopping = false;
const shutdown = async () => {
  if (stopping) return;
  stopping = true;
  fixture.release();
  await server.stop(true);
  await Promise.allSettled([client.close(), app.close()]);
};
process.on('SIGTERM', () => {
  void shutdown();
});
process.on('SIGINT', () => {
  void shutdown();
});
console.log(`MCP widget fixture listening on http://127.0.0.1:${server.port}`);
