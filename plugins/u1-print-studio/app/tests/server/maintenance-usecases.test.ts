import { describe, expect, test } from 'bun:test';
import { z } from 'zod';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createAppServer } from '../../src/lib/server/app.js';
import { callDashboardTool } from '../../src/lib/server/dashboard-tools.js';
import { CameraRelayClaimError } from '../../src/lib/server/application/camera-relay.js';
import { cameraActivation } from '../../src/lib/server/application/refresh-camera-frame.js';
import { PrinterObservationStore } from '../../src/lib/server/observation-store.js';
import { unavailableBedMesh } from '../../src/lib/server/application/bed-mesh-observation.js';
import { unavailableMaterials } from '../../src/lib/server/application/material-observation.js';
import { unavailableQueue } from '../../src/lib/server/application/queue-observation.js';
import { unavailableEnvironment } from '../../src/lib/server/application/environment-observation.js';
import { unavailableCurrentJob } from '../../src/lib/server/application/current-job-observation.js';
import { unavailableJobHistory } from '../../src/lib/server/application/job-history-observation.js';
import type { CameraWebRtcSessionController } from '../../src/lib/server/application/camera-webrtc.js';
import type { U1Status } from '../../src/lib/server/u1-status.js';

const at = '2026-09-05T12:00:00.000Z';
const status: U1Status = {
  schemaVersion: 1, stateVersion: 1, observedAt: at, reachable: true, state: 'idle', stateLabel: 'Idle',
  progressPercent: null, currentLayer: null, totalLayers: null, elapsedSeconds: null, remainingSeconds: null,
  refreshAfterSeconds: 30, filename: null, activePhysicalTool: null, tools: [], bed: { temperature: null, target: null },
  storage: { active: null, filePosition: null, fileSize: null }, printerMessage: null, exception: false,
  camera: { available: false, service: null, targetFps: null },
};
const factories = {
  bedMesh: unavailableBedMesh, materials: unavailableMaterials, queue: unavailableQueue,
  environment: unavailableEnvironment, currentJob: unavailableCurrentJob, jobHistory: unavailableJobHistory,
};
type Domain = keyof typeof factories;
const domains = Object.keys(factories) as Domain[];
const demand = { bedMesh: 'includeBedMesh', materials: 'includeMaterials', queue: 'includeQueue',
  environment: 'includeEnvironment', currentJob: 'includeCurrentJob', jobHistory: 'includeJobHistory' } as const;

describe('shared maintenance use cases', () => {
  test('one declaration preserves OAuth/catalog visibility, schemas and rejected-call acquisition boundaries', async () => {
    for (const oauth of [false, true]) for (const camera of [false, true]) {
      let reads = 0, actions = 0;
      const sessions: CameraWebRtcSessionController = {
        authorize: () => { actions++; throw Error('unexpected activation'); }, open: async () => { actions++; throw Error('unexpected open'); },
        answer: async () => { actions++; return { accepted: true }; }, addCandidates: async () => { actions++; return { accepted: true, candidateCount: 0 }; }, close: () => { actions++; return { closed: true }; },
      };
      const server = createAppServer({ readStatus: async () => { reads++; return { status, metadata: {} }; }, ...(camera ? { cameraSessions: sessions } : {}) }, oauth ? { oauthScopes: ['u1.monitor'] } : {});
      const client = new Client({ name: 'fixture', version: '1' }); const [a, b] = InMemoryTransport.createLinkedPair();
      try {
        await server.connect(a); await client.connect(b);
        // Client.listTools parses away top-level extension fields. Inspect the
        // actual in-memory wire response so the OAuth mirror is really covered.
        let wire: unknown;
        const send = a.send.bind(a);
        a.send = async (message, options) => {
          if ('result' in message && message.result && typeof message.result === 'object' && 'tools' in message.result) wire = message.result;
          return send(message, options);
        };
        await client.listTools();
        const { tools } = z.object({ tools: z.array(z.object({ name: z.string() }).passthrough()) }).parse(wire);
        const cameraTools = ['open_u1_camera_stream', 'answer_u1_camera_stream', 'add_u1_camera_ice_candidates', 'close_u1_camera_stream'];
        expect(tools.map(({ name }) => name)).toEqual(oauth
          ? ['get_print_monitor_snapshot', 'observe_printer', 'refresh_printer_observation', 'get_u1_camera_frame', 'open_printer_camera', ...(camera ? cameraTools : [])]
          : ['get_print_monitor_snapshot', 'observe_printer', 'refresh_printer_observation', ...(camera ? cameraTools : []), 'get_u1_camera_frame', 'open_printer_camera']);
        for (const tool of tools) {
          expect(tool).toHaveProperty('annotations.readOnlyHint', true);
          if (oauth) expect(tool).toHaveProperty('securitySchemes', [{ type: 'oauth2', scopes: ['u1.monitor'] }]);
          else expect(tool).not.toHaveProperty('securitySchemes');
          if (!['get_print_monitor_snapshot', 'observe_printer', 'open_printer_camera'].includes(tool.name)) expect(tool._meta).toHaveProperty('ui.visibility', ['app']);
        }
        if (camera && oauth) expect(tools.find(({ name }) => name === 'add_u1_camera_ice_candidates')?.inputSchema).toHaveProperty(
          'properties.candidates.items.properties.sdpMLineIndex', { type: ['integer', 'null'], minimum: 0 });
        for (const args of [{ view: 'unknown' }, { view: 'heads', url: 'https://invalid.example' }]) {
          expect((await client.callTool({ name: 'observe_printer', arguments: args })).isError).toBe(true);
        }
        if (camera) expect((await client.callTool({ name: 'add_u1_camera_ice_candidates', arguments: { sessionId: 'fixture-session-token', candidates: [{ candidate: 'fixture', sdpMLineIndex: -1 }] } })).isError).toBe(true);
        expect(reads).toBe(0); expect(actions).toBe(0);
      } finally { await Promise.all([client.close(), server.close()]); }
    }
  });

  for (const domain of domains) test(`${domain} retains independent receipts, TTL, single flight and failure recovery`, async () => {
    let time = Date.parse(at), mode: 'known' | 'failure' = 'known';
    const calls = Object.fromEntries(domains.map((key) => [key, 0])) as Record<Domain, number>;
    const reader = <K extends Domain>(key: K) => async (): Promise<ReturnType<typeof factories[K]>> => {
      calls[key]++;
      await Promise.resolve();
      if (mode === 'failure') throw new Error('private upstream failure');
      return { ...factories[key]('not_requested'), state: 'known', freshness: 'fresh', reason: null,
        sourceObservedAt: new Date(time).toISOString(), receivedAt: new Date(time).toISOString(), checkedAt: new Date(time).toISOString() } as ReturnType<typeof factories[K]>;
    };
    const store = new PrinterObservationStore(async () => ({ status, metadata: {} }), () => new Date(time),
      reader('bedMesh'), reader('materials'), reader('queue'), reader('environment'), reader('currentJob'), reader('jobHistory'));
    const request = { refresh: true, [demand[domain]]: true };
    const [first, duplicate] = await Promise.all([store.current(request), store.current(request)]);
    expect(first).toEqual(duplicate);
    expect(first.observationVersion).toBe(2);
    expect(calls[domain]).toBe(1);
    for (const other of domains.filter((key) => key !== domain)) expect(calls[other]).toBe(0);
    time += 14_999;
    expect((await store.current(request)).observationVersion).toBe(2);
    time += 1;
    expect((await store.current())[domain]?.state).toBe('stale');
    expect(calls[domain]).toBe(1);
    mode = 'failure';
    const failed = await store.current(request);
    expect(failed[domain]).toMatchObject({ state: 'stale', freshness: 'stale', sourceObservedAt: at, reason: 'network', checkedAt: new Date(time).toISOString() });
    expect(failed.observationVersion).toBe(3);
    expect(failed.connectionEpoch).toBe(1);
    mode = 'known'; time += 15_000;
    const recovered = await store.current(request);
    expect(recovered[domain]).toMatchObject({ state: 'known', reason: null, sourceObservedAt: new Date(time).toISOString() });
    expect(recovered.observationVersion).toBe(5);
    expect(calls[domain]).toBe(3);
  });

  test('all views share exactly the same acquisition and projection through MCP and dashboard', async () => {
    const expected: Record<string, Domain[]> = { progress: [], thermals: ['environment'], heads: ['materials'], jobs: ['currentJob'],
      job_history: ['jobHistory'], queue: ['queue'], fans: ['environment'], bed_mesh: ['bedMesh'], overview: domains };
    for (const [view, requested] of Object.entries(expected)) {
      const createStore = () => {
        const calls: Domain[] = [];
        const read = <K extends Domain>(domain: K) => async () => { calls.push(domain); return factories[domain]('network', at) as ReturnType<typeof factories[K]>; };
        return { calls, store: new PrinterObservationStore(async () => ({ status, metadata: {} }), () => new Date(at),
          read('bedMesh'), read('materials'), read('queue'), read('environment'), read('currentJob'), read('jobHistory')) };
      };
      const mcp = createStore(), dashboard = createStore();
      const server = createAppServer({ observations: mcp.store, readStatus: async () => { throw Error('must use store'); } });
      const client = new Client({ name: 'fixture', version: '1' });
      const [a, b] = InMemoryTransport.createLinkedPair();
      try {
        await server.connect(a); await client.connect(b);
        const result = await client.callTool({ name: 'observe_printer', arguments: { view } });
        const http = await callDashboardTool({ name: 'refresh_printer_observation', arguments: { view } }, dashboard.store, {});
        expect(http.status).toBe(200);
        expect(http.body).toEqual(result);
        expect(mcp.calls.sort()).toEqual([...requested].sort());
        expect(dashboard.calls.sort()).toEqual([...requested].sort());
      } finally { await Promise.all([client.close(), server.close()]); }
    }
  });

  test('MCP and dashboard keep a successful snapshot when optional activation reaches capacity', async () => {
    const sessions: CameraWebRtcSessionController = {
      authorize: () => { throw new CameraRelayClaimError('busy'); },
      open: async () => { throw Error('not requested'); }, answer: async () => ({ accepted: true }),
      addCandidates: async () => ({ accepted: true, candidateCount: 0 }), close: () => ({ closed: true }),
    };
    const readCameraFrame = async () => ({
      frame: { schemaVersion: 1 as const, observedAt: at, available: true, mediaType: 'image/jpeg' as const, byteLength: 4, reason: null },
      metadata: { cameraFrame: { dataUrl: 'data:image/jpeg;base64,/9j/2Q==' } },
    });
    const store = new PrinterObservationStore(async () => { throw Error('camera must not read status'); });
    const server = createAppServer({ observations: store, cameraSessions: sessions, readCameraFrame });
    const client = new Client({ name: 'fixture', version: '1' }); const [a, b] = InMemoryTransport.createLinkedPair();
    try {
      await server.connect(a); await client.connect(b);
      const result = await client.callTool({ name: 'get_u1_camera_frame', arguments: { authorizeLive: true } });
      const http = await callDashboardTool({ name: 'get_u1_camera_frame', arguments: { authorizeLive: true } }, store, { cameraSessions: sessions, readCameraFrame });
      expect(http.status).toBe(200); expect(http.body).toEqual(result);
      expect(result.structuredContent).toMatchObject({ available: true, byteLength: 4 });
      expect(result._meta).not.toHaveProperty('cameraActivation');
      expect(cameraActivation(sessions, true)).toEqual({ state: 'unavailable', reason: 'capacity' });
      expect(JSON.stringify(result)).not.toContain('busy');
    } finally { await Promise.all([client.close(), server.close()]); }
  });
});
