import { createServer } from 'node:http';
import { readdirSync } from 'node:fs';
import path from 'node:path';
import { createUnifiedRequestHandler } from '../src/entrypoints/server';
import { createKitObservationFixture } from '../tests/fixtures/kit-observation-store';
import { loadKitHandler } from '../src/lib/server/kit-handler';

const root = path.resolve(import.meta.dir, '..');
const kitOutput = process.env.COMPOSABLE_KIT_FIXTURE_DIR === 'build-kit-composable-v2'
  ? 'build-kit-composable-v2'
  : 'build-kit';
const handlerFile = path.join(root, kitOutput, 'handler.js');
const handler = await loadKitHandler(handlerFile);
const list = (folder: string, prefix = ''): string[] => readdirSync(folder, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? list(path.join(folder, entry.name), `${prefix}${entry.name}/`) : [`/${prefix}${entry.name}`]);
const fixture = createKitObservationFixture();
const { observations } = fixture;
const transport = createUnifiedRequestHandler(handler, new Set(list(path.join(root, kitOutput, 'client'))), null, null, { observations }, observations);
const server = createServer(async (req, res) => {
  if (req.url === '/__fixture/state') {
    if (req.method === 'POST') {
      const chunks: Buffer[] = [];
      for await (const chunk of req) chunks.push(Buffer.from(chunk));
      const value = JSON.parse(Buffer.concat(chunks).toString()) as { fail?: boolean; hold?: boolean; reset?: boolean };
      fixture.configure(value);
    }
    res.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify(fixture.counts()));
    return;
  }
  await transport(req, res);
});
const shutdown = (): void => {
  fixture.release();
  void transport.close?.(); server.close(); server.closeAllConnections();
};
process.once('SIGTERM', shutdown); process.once('SIGINT', shutdown);
server.listen(Number(process.env.PORT ?? '4181'), '127.0.0.1');
