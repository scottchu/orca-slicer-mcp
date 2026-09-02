import { createServer } from 'node:http';
import { readdirSync } from 'node:fs';
import path from 'node:path';
import { createUnifiedRequestHandler } from '../src/entrypoints/server';
import { PrinterObservationStore } from '../src/lib/server/observation-store';
import { normalizeEnvironmentResponse } from '../src/lib/server/adapters/moonraker-environment';
import type { U1Status } from '../src/lib/server/u1-status';
import { loadKitHandler } from '../src/lib/server/kit-handler';

const root = path.resolve(import.meta.dir, '..');
const handlerFile = path.join(root, 'build-kit/handler.js');
const handler = await loadKitHandler(handlerFile);
const list = (folder: string, prefix = ''): string[] => readdirSync(folder, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? list(path.join(folder, entry.name), `${prefix}${entry.name}/`) : [`/${prefix}${entry.name}`]);
let now = Date.parse('2026-09-01T12:00:00Z');
let failure = false;
let held = false;
let statusReads = 0;
let environmentReads = 0;
const waiting = new Set<() => void>();
const status = (): U1Status => ({
  schemaVersion: 1, stateVersion: 1, observedAt: new Date(now).toISOString(), reachable: true,
  state: 'standby', stateLabel: 'Ready', progressPercent: null, currentLayer: null,
  totalLayers: null, elapsedSeconds: null, remainingSeconds: null, refreshAfterSeconds: 90,
  filename: null, activePhysicalTool: null, tools: [], bed: { temperature: 0, target: 0 },
  storage: { active: null, filePosition: null, fileSize: null }, printerMessage: null,
  exception: false, camera: { available: false, service: null, targetFps: null }
});
const observations = new PrinterObservationStore(async () => { statusReads++; return { status: status(), metadata: {} }; }, () => new Date(now), undefined, undefined, undefined, async () => {
  environmentReads++;
  if (held) await new Promise<void>((resolve) => waiting.add(resolve));
  if (failure) throw new Error('Synthetic acquisition failure');
  return normalizeEnvironmentResponse({ result: { status: {
    fan: { speed: 0.5, rpm: 1200 }, purifier: { power_detected: true, mode: 2 }
  } } }, new Date(now).toISOString());
});
const transport = createUnifiedRequestHandler(handler, new Set(list(path.join(root, 'build-kit/client'))), null, null, { observations }, observations);
const server = createServer(async (req, res) => {
  if (req.url === '/__fixture/state') {
    if (req.method === 'POST') {
      const chunks: Buffer[] = [];
      for await (const chunk of req) chunks.push(Buffer.from(chunk));
      const value = JSON.parse(Buffer.concat(chunks).toString()) as { fail?: boolean; hold?: boolean; reset?: boolean };
      now += 300_000;
      if (value.reset) { statusReads = 0; environmentReads = 0; }
      failure = value.fail ?? false; held = value.hold ?? false;
      if (!held) { for (const resolve of waiting) resolve(); waiting.clear(); }
    }
    res.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify({ statusReads, environmentReads }));
    return;
  }
  await transport(req, res);
});
const shutdown = (): void => {
  for (const resolve of waiting) resolve(); waiting.clear();
  void transport.close?.(); server.close(); server.closeAllConnections();
};
process.once('SIGTERM', shutdown); process.once('SIGINT', shutdown);
server.listen(Number(process.env.PORT ?? '4181'), '127.0.0.1');
