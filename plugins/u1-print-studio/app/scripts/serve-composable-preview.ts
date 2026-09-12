import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { fileURLToPath } from 'node:url';

export const COMPOSABLE_PREVIEW_PATH = '/dashboard/lab/composition';
export const COMPOSABLE_PREVIEW_MANIFEST = 'd5165f7103ecf3170ee784a6fbe089b1522d66b0296ff5ad5ad1f79cfef9c73a';

const artifactName = 'build-kit-composable-v2';
const artifactRoot = fileURLToPath(new URL(`../${artifactName}/`, import.meta.url));
const pageRelativePath = 'prerendered/dashboard/lab/composition.html';
const immutableAssetPattern = /^\/_app\/immutable\/(?:assets|chunks|entry|nodes)\/[A-Za-z0-9_.-]+\.(?:css|js)$/;
const hydrationAssets = ['/_app/immutable/nodes/1.rPLmEOf4.js'] as const;

export type ComposablePreviewSnapshot = ReadonlyMap<string, Buffer>;

const collectArtifactFiles = (directory: string, prefix = ''): Array<readonly [string, Buffer]> =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const relativePath = `${prefix}${entry.name}`;
    const fixedPath = `${directory}${entry.name}`;
    if (entry.isDirectory()) return collectArtifactFiles(`${fixedPath}/`, `${relativePath}/`);
    if (!entry.isFile()) throw new Error('Composable preview artifact must contain only regular files');
    return [[relativePath, readFileSync(fixedPath)] as const];
  });

const digest = (bytes: Buffer | string): string => createHash('sha256').update(bytes).digest('hex');

export const collectComposablePreviewSnapshot = (): ComposablePreviewSnapshot =>
  new Map(collectArtifactFiles(artifactRoot));

export const canonicalComposablePreviewManifest = (snapshot = collectComposablePreviewSnapshot()): string => {
  const lines = [...snapshot.entries()]
    .sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0)
    .map(([relativePath, bytes]) => `${digest(bytes)}  ${artifactName}/${relativePath}\n`)
    .join('');
  return digest(lines);
};

export const assertComposablePreviewManifest = (actual: string): void => {
  if (actual !== COMPOSABLE_PREVIEW_MANIFEST) throw new Error('Composable preview artifact identity mismatch');
};

const loadPreview = (snapshot: ComposablePreviewSnapshot): { page: Buffer; assets: ReadonlyMap<string, Buffer> } => {
  assertComposablePreviewManifest(canonicalComposablePreviewManifest(snapshot));
  const pageBytes = snapshot.get(pageRelativePath);
  if (!pageBytes) throw new Error('Composable preview page is missing');
  const page = Buffer.from(pageBytes);
  const references = [...page.toString('utf8').matchAll(/\/_app\/immutable\/[A-Za-z0-9_./-]+/g)]
    .map(([value]) => value)
    .concat(hydrationAssets)
    .filter((value, index, values) => values.indexOf(value) === index)
    .sort();
  if (!references.length || references.some((value) => !immutableAssetPattern.test(value))) {
    throw new Error('Composable preview contains an invalid immutable asset reference');
  }
  const assets = new Map<string, Buffer>();
  for (const reference of references) {
    const bytes = snapshot.get(`client${reference}`);
    if (!bytes) throw new Error('Composable preview immutable asset is missing');
    assets.set(reference, Buffer.from(bytes));
  }
  return { page, assets };
};

const pageHeaders = (length: number): Record<string, string> => ({
  'cache-control': 'no-store',
  'content-length': String(length),
  'content-security-policy': "default-src 'none'; img-src data:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
  'content-type': 'text/html; charset=utf-8',
  'referrer-policy': 'no-referrer',
  'x-content-type-options': 'nosniff',
});

const assetHeaders = (pathname: string, length: number): Record<string, string> => ({
  'cache-control': 'public, max-age=31536000, immutable',
  'content-length': String(length),
  'content-type': pathname.endsWith('.css') ? 'text/css; charset=utf-8' : 'text/javascript; charset=utf-8',
  'referrer-policy': 'no-referrer',
  'x-content-type-options': 'nosniff',
});

const respond = (res: ServerResponse, method: string, status: number, headers: Record<string, string>, body: Buffer): void => {
  res.writeHead(status, headers);
  res.end(method === 'HEAD' ? undefined : body);
};

const notFound = (res: ServerResponse): void => {
  const body = Buffer.from('Not Found');
  res.writeHead(404, {
    'cache-control': 'no-store',
    'content-length': String(body.length),
    'content-type': 'text/plain; charset=utf-8',
    'referrer-policy': 'no-referrer',
    'x-content-type-options': 'nosniff',
  });
  res.end(body);
};

const closeSocketWith = (socket: NodeJS.WritableStream, status: '400 Bad Request' | '404 Not Found'): void => {
  socket.end(`HTTP/1.1 ${status}\r\nConnection: close\r\nContent-Length: 0\r\n\r\n`);
};

export const createComposablePreviewServer = (
  snapshot = collectComposablePreviewSnapshot(),
): Server => {
  const preview = loadPreview(snapshot);
  const server = createServer((req: IncomingMessage, res: ServerResponse) => {
    const method = req.method ?? '';
    const target = req.url ?? '';
    if ((method === 'GET' || method === 'HEAD') && target === COMPOSABLE_PREVIEW_PATH) {
      respond(res, method, 200, pageHeaders(preview.page.length), preview.page);
      return;
    }
    const asset = (method === 'GET' || method === 'HEAD') ? preview.assets.get(target) : undefined;
    if (asset) {
      respond(res, method, 200, assetHeaders(target, asset.length), asset);
      return;
    }
    notFound(res);
  });
  server.on('connect', (_req, socket) => closeSocketWith(socket, '404 Not Found'));
  server.on('upgrade', (_req, socket) => closeSocketWith(socket, '404 Not Found'));
  server.on('clientError', (_error, socket) => closeSocketWith(socket, '400 Bad Request'));
  return server;
};

const closeServer = (server: Server): void => {
  server.close();
  server.closeAllConnections();
};

if (import.meta.main) {
  const port = Number(process.env.PORT);
  if (!Number.isInteger(port) || port < 1024 || port > 65_535) throw new Error('PORT must be an explicit unprivileged port');
  const server = createComposablePreviewServer();
  process.once('SIGTERM', () => closeServer(server));
  process.once('SIGINT', () => closeServer(server));
  server.listen(port, '127.0.0.1');
}
