import { createMcpHttp } from '../../src/lib/server/mcp-http.js';
import { readU1Status } from '../../src/lib/server/u1-status.js';
import { describe, expect, test } from 'bun:test';
import { randomUUID } from 'node:crypto';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createAppServer } from '../../src/lib/server/app.js';
import { normalizeMonitorEvidence } from '../../src/lib/server/adapters/u1-monitor-evidence.js';
import { sanitizeMonitorCamera } from '../../src/lib/server/adapters/monitor-camera.js';
import { observePrintMonitor } from '../../src/lib/server/application/observe-print-monitor.js';
import { terminalEvidence, assessMonitorRun, MONITOR_CONTINUITY_MS } from '../../src/lib/server/application/print-monitor-observation.js';
import { PrinterObservationStore } from '../../src/lib/server/observation-store.js';
import { monitorInputSchema, monitorOutputSchema } from '../../src/lib/server/print-monitor-schema.js';
import { monitorFixture, monitorJpeg, monitorQuery } from '../fixtures/monitor.js';
const date = '2026-09-08T12:00:00.000Z';
const ports = { issueToken: randomUUID, readCamera: async () => sanitizeMonitorCamera({ bytes: monitorJpeg, observedAt: date }) };
const input = { camera: 'omit' as const, expectedRunToken: null };

describe('monitor presence and terminal evidence', () => {
  test('normalizes same-query receipt, monotonic source clock and private exact job key', () => {
    const e = normalizeMonitorEvidence(monitorQuery(), date);
    expect(e.receivedAt).toBe(date); expect(e.sourceEventTimeSeconds).toBe(123.5);
    expect(e.exactJobKey).toHaveLength(64); expect(e.filename).toBe('fixture.gcode');
    const empty = normalizeMonitorEvidence({}, date);
    expect(empty.exceptionPresent).toBeNull(); expect(empty.controllerState).toBe('unknown');
    expect(empty.completeness).toBe('partial'); expect(empty.tools.every(t => t.state === null)).toBe(true);
  });
  test('reuses filename privacy policy for credentials, URLs and Unicode format characters', () => {
    for (const filename of ['ghp_abcdefghijklmnop123456.gcode', 'Bearer abc.gcode', 'secret example.gcode', 'https://private.invalid/file.gcode', 'bad\u200bname.gcode']) {
      const q = monitorQuery(); q.result.status.print_stats.filename = filename;
      const e = normalizeMonitorEvidence(q, date); expect(e.filename).toBeNull(); expect(e.exactJobKey).toBeNull();
    }
  });
  test('invalid, overshoot, missing and unsafe source fields cannot become safe defaults', () => {
    const q: any = monitorQuery();
    q.result.status.virtual_sdcard.file_position = 1001;
    q.result.status.print_stats.exception = false;
    q.result.status.print_stats.filename = 'folder/private\nsecret.gcode';
    q.result.status.extruder.target = Infinity;
    q.result.status.webhooks.state = ['ready'];
    const e = normalizeMonitorEvidence(q, date);
    expect(e.storage.filePositionBytes).toBeNull(); expect(e.exceptionPresent).toBeNull(); expect(e.filename).toBeNull();
    expect(e.exactJobKey).toBeNull(); expect(e.tools[0].target).toBeNull(); expect(e.controllerState).toBe('unknown');
  });
  test('complete is consistent only with every observed check, never physical/bound verification', () => {
    const e = normalizeMonitorEvidence(monitorQuery(), date);
    e.state = 'complete'; e.storage = { active: false, filePositionBytes: 1000, fileSizeBytes: 1000 };
    e.tools.forEach(t => { t.state = 'PARKED'; t.target = 0; }); e.bed.target = 0;
    expect(terminalEvidence(e, true).assessment).toBe('reported_consistent');
    expect(terminalEvidence(e, true).boundRunVerified).toBe(false);
    for (const mutate of [
      (x: typeof e) => { x.storage.active = true; }, (x: typeof e) => { x.storage.fileSizeBytes = 0; },
      (x: typeof e) => { x.storage.filePositionBytes = 999; }, (x: typeof e) => { x.exceptionPresent = null; },
      (x: typeof e) => { x.controllerState = 'unknown'; }, (x: typeof e) => { x.controllerState = 'shutdown'; },
      (x: typeof e) => { x.tools[0].state = null; }, (x: typeof e) => { x.bed.target = null; },
    ]) { const changed = structuredClone(e); mutate(changed); expect(terminalEvidence(changed, true).assessment).toBe('reported_pending_checks'); }
    expect(terminalEvidence(e, false).assessment).toBe('unknown');
    e.state = 'printing'; expect(terminalEvidence(e, true).assessment).toBe('not_terminal');
    e.state = 'paused'; expect(terminalEvidence(e, true).assessment).toBe('not_terminal');
    e.state = 'error'; expect(terminalEvidence(e, true).assessment).toBe('reported_consistent');
    e.storage.active = true; expect(terminalEvidence(e, true).assessment).toBe('reported_pending_checks');
  });
});

describe('monitor observational continuity', () => {
  test('initial active binding does not require native UUID; matching cache does not restamp it', () => {
    const e = normalizeMonitorEvidence(monitorQuery(), date), now = Date.parse(date);
    const first = assessMonitorRun(e, true, 1, null, null, now, randomUUID);
    expect(first.run.match).toBe('initial'); expect(first.run.printerRunIdentityAvailable).toBe(false);
    const same = assessMonitorRun(e, true, 1, first.run.token, first.context, now + 5000, randomUUID);
    expect(same.run.match).toBe('observed_continuity'); expect(same.context?.evidence.receivedAt).toBe(date);
    expect(assessMonitorRun(e, true, 1, first.run.token, first.context, now + MONITOR_CONTINUITY_MS + 1, randomUUID).run.reason).toBe('observation_gap');
  });
  test('changed/reset/epoch/token/missing evidence cannot create a replacement token', () => {
    const e = normalizeMonitorEvidence(monitorQuery(), date), now = Date.parse(date);
    const first = assessMonitorRun(e, true, 1, null, null, now, randomUUID);
    for (const [evidence, epoch, expected, reason] of [
      [{ ...e, exactJobKey: 'different-path' }, 1, first.run.token, 'job_changed'],
      [{ ...e, elapsedSeconds: 0 }, 1, first.run.token, 'progress_reset'],
      [e, 2, first.run.token, 'connection_changed'],
      [{ ...e, sourceEventTimeSeconds: 1 }, 1, first.run.token, 'source_clock_reset'], [e, 1, randomUUID(), 'token_unknown'],
      [null, 1, first.run.token, 'missing_evidence'],
    ] as const) {
      const next = assessMonitorRun(evidence, true, epoch, expected, first.context, now, randomUUID);
      expect(next.run.reason).toBe(reason); expect(next.run.token).toBeNull();
    }
    expect(assessMonitorRun(e, true, 1, first.run.token, null, now, randomUUID).run.reason).toBe('token_unknown');
    e.state = 'complete'; expect(assessMonitorRun(e, true, 1, null, null, now, randomUUID).run.match).toBe('unbound');
  });
});

describe('shared monitor use case and camera', () => {
  test('widget/monitor concurrent due calls coalesce; cached receipt is not new evidence', async () => {
    let reads = 0, clock = Date.parse(date);
    const now = () => new Date(clock);
    const store = new PrinterObservationStore(async () => { reads++; return monitorFixture(now().toISOString()); }, now);
    const [first] = await Promise.all([observePrintMonitor(store, input, { ...ports, now }), store.current({ refresh: true })]);
    expect(reads).toBe(1); expect(first.snapshot.receipt.acquisition).toBe('new');
    clock += 1000;
    const cached = await observePrintMonitor(store, { ...input, expectedRunToken: first.snapshot.run.token }, { ...ports, now });
    expect(reads).toBe(1); expect(cached.snapshot.receipt.observedAt).toBe(date); expect(cached.snapshot.receipt.acquisition).toBe('cached');
    clock += 15000; await observePrintMonitor(store, input, { ...ports, now }); expect(reads).toBe(2);
  });
  test('expected mismatch withholds camera; image failure keeps telemetry and strips private metadata', async () => {
    let cameraCalls = 0;
    const now = () => new Date(date), store = new PrinterObservationStore(async () => monitorFixture(date), now);
    const readCamera = async () => { cameraCalls++; throw new Error('http://private-printer/secret'); };
    const mismatch = await observePrintMonitor(store, { camera: 'snapshot', expectedRunToken: randomUUID() }, { ...ports, now, readCamera });
    expect(cameraCalls).toBe(0); expect(mismatch.snapshot.camera.state).toBe('withheld');
    const initial = await observePrintMonitor(store, { camera: 'snapshot', expectedRunToken: null }, { ...ports, now, readCamera });
    expect(initial.snapshot.telemetry.state).toBe('printing'); expect(initial.snapshot.camera.state).toBe('unavailable');
    expect(JSON.stringify(initial)).not.toContain('private-printer');
  });
  test('genuine JPEG sanitizer strips APP/COM/trailer and rejects marker-only/truncated/oversize', () => {
    const comment = Buffer.from('private network identifier');
    const segment = Buffer.alloc(4); segment[0] = 255; segment[1] = 254; segment.writeUInt16BE(comment.length + 2, 2);
    const image = Buffer.concat([monitorJpeg.subarray(0, 2), segment, comment, monitorJpeg.subarray(2), comment]);
    const clean = sanitizeMonitorCamera({ bytes: image, observedAt: date });
    expect(clean.bytes.toString('latin1')).not.toContain('private network');
    for (const bytes of [Buffer.from([255, 216, 255, 217]), monitorJpeg.subarray(0, 20), Buffer.alloc(4 * 1024 * 1024 + 1)]) {
      expect(() => sanitizeMonitorCamera({ bytes, observedAt: date })).toThrow();
    }
  });
  test('cancelling a consumer preserves the shared pending reader and releases independent camera', async () => {
    let release!: () => void;
    const ready = new Promise<void>(r => { release = r; });
    const now = () => new Date(date), store = new PrinterObservationStore(async () => { await ready; return monitorFixture(date); }, now);
    const controller = new AbortController();
    const cancelled = observePrintMonitor(store, input, { ...ports, now, signal: controller.signal });
    const peer = store.current(); controller.abort();
    expect((await cancelled).isError).toBe(true); release(); expect((await peer).status.reachable).toBe(true);
    let cameraAborted = false;
    const timed = await observePrintMonitor(store, { camera: 'snapshot', expectedRunToken: null }, { ...ports, now, budgetMs: 20,
      readCamera: signal => new Promise((_, reject) => signal.addEventListener('abort', () => { cameraAborted = true; reject(new Error('abort')); }, { once: true })) });
    expect(timed.snapshot.camera.state).toBe('unavailable'); expect(cameraAborted).toBe(true);
  });
});

for (const oauth of [false, true]) test(`MCP strict tool-only input/output + genuine model image, OAuth mirror=${oauth}`, async () => {
  const now = () => new Date(), store = new PrinterObservationStore(async () => monitorFixture(now().toISOString()), now);
  let images = 0;
  const server = createAppServer({ observations: store, readMonitorCamera: async () => { images++; return sanitizeMonitorCamera({ bytes: monitorJpeg, observedAt: now().toISOString() }); } }, oauth ? { oauthScopes: ['u1.monitor'] } : {});
  const client = new Client({ name: 'synthetic-monitor-client', version: '1' });
  const [ct, st] = InMemoryTransport.createLinkedPair();
  try {
    await Promise.all([server.connect(st), client.connect(ct)]);
    const listed = (await client.listTools()).tools.find(t => t.name === 'get_print_monitor_snapshot')!;
    expect(listed.outputSchema?.type).toBe('object'); expect(listed.inputSchema.additionalProperties).toBe(false);
    expect(listed._meta?.['openai/outputTemplate']).toBeUndefined(); expect(listed._meta?.ui).toBeUndefined();
    const response = await client.callTool({ name: listed.name, arguments: { camera: 'snapshot', expectedRunToken: null } });
    const parsed = monitorOutputSchema.parse(response.structuredContent);
    expect(parsed.camera.state).toBe('available'); expect(parsed.run.match).toBe('initial'); expect(images).toBe(1);
    const content = response.content as any[]; expect(content.map(c => c.type)).toEqual(['text', 'image']);
    expect(JSON.parse(content[0].text)).toEqual(response.structuredContent);
    expect(content[1].data).toBe(sanitizeMonitorCamera({ bytes: monitorJpeg, observedAt: date }).bytes.toString('base64'));
    expect(response._meta).toBeUndefined(); expect(JSON.stringify(response)).not.toContain('exactJobKey');
    for (const args of [{ camera: 'live', expectedRunToken: null }, { camera: 'snapshot', expectedRunToken: 'invalid' }, { ...input, force: true }]) {
      const invalid = await client.callTool({ name: listed.name, arguments: args }); expect(invalid.isError).toBe(true);
    }
    expect(images).toBe(1);
    expect(monitorInputSchema.safeParse({ ...input, url: 'http://other' }).success).toBe(false);
  } finally { await Promise.allSettled([client.close(), server.close()]); }
});

test('status reader adds same-query evidence at query receipt before webcam discovery', async () => {
  const before = process.env.MOONRAKER_BASE_URL;
  const calls: string[] = [];
  const fixture = Bun.serve({ hostname: '127.0.0.1', port: 0, fetch: async request => {
    const url = new URL(request.url); calls.push(url.pathname);
    if (url.pathname === '/printer/objects/query') return Response.json(monitorQuery());
    await new Promise(resolve => setTimeout(resolve, 30)); return Response.json({ result: { webcams: [] } });
  } });
  try {
    process.env.MOONRAKER_BASE_URL = 'http://127.0.0.1:' + fixture.port;
    const result = await readU1Status();
    expect(calls).toEqual(['/printer/objects/query', '/server/webcams/list']);
    expect(result.monitorEvidence?.sourceEventTimeSeconds).toBe(123.5);
    expect(Date.now() - Date.parse(result.monitorEvidence!.receivedAt)).toBeGreaterThanOrEqual(25);
    expect(result.status).not.toHaveProperty('monitorEvidence'); expect(result.metadata).not.toHaveProperty('exactJobKey');
  } finally { fixture.stop(true); if (before === undefined) delete process.env.MOONRAKER_BASE_URL; else process.env.MOONRAKER_BASE_URL = before; }
});

test('camera wait crossing telemetry TTL cannot report a fresh terminal or restamp the sample', async () => {
  let clock = Date.parse(date), reads = 0;
  const now = () => new Date(clock);
  const store = new PrinterObservationStore(async () => { reads++; return monitorFixture(date); }, now);
  const result = await observePrintMonitor(store, { camera: 'snapshot', expectedRunToken: null }, { ...ports, now,
    readCamera: async () => { clock += 16000; return sanitizeMonitorCamera({ bytes: monitorJpeg, observedAt: now().toISOString() }); } });
  expect(reads).toBe(1); expect(result.snapshot.receipt.observedAt).toBe(date);
  expect(result.snapshot.receipt.freshness).toBe('stale'); expect(result.snapshot.terminal.assessment).toBe('unknown');
  expect(result.snapshot.run.token).toBeNull(); expect(result.snapshot.camera.state).toBe('withheld'); expect(result.image).toBeNull();
});

test('HTTP requests share observational token lifetime without another status acquisition', async () => {
  let reads = 0;
  const store = new PrinterObservationStore(async () => { reads++; return monitorFixture(new Date().toISOString()); });
  const http = createMcpHttp(store, null);
  const request = async (expectedRunToken: string | null) => {
    const response = await http.handle(new Request('http://fixture.invalid/mcp', { method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name: 'get_print_monitor_snapshot', arguments: { camera: 'omit', expectedRunToken } } }) }));
    expect(response.status).toBe(200); return await response.json() as any;
  };
  try {
    const first = await request(null); const token = first.result.structuredContent.run.token;
    expect(typeof token).toBe('string');
    const next = await request(token); expect(next.result.structuredContent.run.match).toBe('observed_continuity');
    expect(next.result.structuredContent.receipt.acquisition).toBe('cached'); expect(reads).toBe(1);
  } finally { await http.close(); }
});

 test('MCP cancellation reaches independent camera work without a live activation', async () => {
  let entered!: () => void; const started = new Promise<void>(resolve => { entered = resolve; });
  let aborted = false, activated = 0;
  const server = createAppServer({ readStatus: async () => monitorFixture(new Date().toISOString()),
    readMonitorCamera: signal => new Promise((_, reject) => { entered(); signal.addEventListener('abort', () => { aborted = true; reject(new Error('aborted')); }, { once: true }); }),
    cameraSessions: { authorize: () => { activated++; throw new Error('must not activate'); } } as any });
  const client = new Client({ name: 'synthetic-cancel', version: '1' }); const [ct, st] = InMemoryTransport.createLinkedPair();
  try {
    await Promise.all([server.connect(st), client.connect(ct)]);
    const controller = new AbortController();
    const call = client.callTool({ name: 'get_print_monitor_snapshot', arguments: { camera: 'snapshot', expectedRunToken: null } }, undefined, { signal: controller.signal }).catch(() => null);
    await started; controller.abort(); await call;
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(aborted).toBe(true); expect(activated).toBe(0);
  } finally { await Promise.allSettled([client.close(), server.close()]); }
});

test('cancelling an expected-token consumer cannot invalidate a successful peer binding', async () => {
  let clock = Date.parse(date), hold = false, release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; }); const now = () => new Date(clock);
  const store = new PrinterObservationStore(async () => { if (hold) await gate; return monitorFixture(now().toISOString()); }, now);
  const shared = { ...ports, now }; const first = await observePrintMonitor(store, input, shared);
  clock += 16000; hold = true;
  const controller = new AbortController();
  const cancelled = observePrintMonitor(store, { ...input, expectedRunToken: first.snapshot.run.token }, { ...shared, signal: controller.signal });
  const peer = store.current({ refresh: true }); controller.abort(); await cancelled; release(); await peer;
  const next = await observePrintMonitor(store, { ...input, expectedRunToken: first.snapshot.run.token }, shared);
  expect(next.snapshot.run.match).toBe('observed_continuity'); expect(next.snapshot.run.token).toBe(first.snapshot.run.token);
});

test('the shared 160-code-point filename limit survives strict output validation', async () => {
  const q = monitorQuery(); q.result.status.print_stats.filename = 'folder/' + '𐐀'.repeat(160) + '.gcode';
  const now = () => new Date(date), store = new PrinterObservationStore(async () => monitorFixture(date, q), now);
  const result = await observePrintMonitor(store, input, { ...ports, now });
  expect([...result.snapshot.telemetry.filename!]).toHaveLength(160);
  expect(result.snapshot.telemetry.filename).toHaveLength(320);
  expect(monitorOutputSchema.safeParse(result.snapshot).success).toBe(true);
});
