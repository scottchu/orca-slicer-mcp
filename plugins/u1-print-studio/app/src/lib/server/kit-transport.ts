import type { IncomingMessage, ServerResponse } from 'node:http';
import type { RuntimePort, RuntimeRequest } from './runtime-port.js';
import { NATIVE_DASHBOARD_PATHS, NATIVE_LAB_PATHS, routePolicy } from './route-policy.js';
import { createRequestLifetime } from './request-lifetime.js';

export type KitHandler = ((req: IncomingMessage, res: ServerResponse, next?: () => void) => void | Promise<void>) & { close?: () => Promise<void> };
export const invalidRawTarget = (target: string): boolean => {
  const pathname = target.split('?')[0];
  if (!pathname.startsWith('/') || pathname.includes('\\') || pathname.includes('#') || pathname.includes('%')) return true;
  return pathname.split('/').some((segment) => segment === '.' || segment === '..');
};
export const createKitTransport = (
  handler: KitHandler, runtime: RuntimePort, clientPaths: ReadonlySet<string>
): KitHandler => {
const serve: KitHandler = async (req, res) => {
  if (invalidRawTarget(req.url ?? '')) { res.writeHead(404).end('Not Found'); return; }
  const originalTarget = req.url!;
  const originalPath = originalTarget.split('?')[0];
  const prefixed = runtime.basePath && (originalPath === runtime.basePath || originalPath.startsWith(runtime.basePath + '/'));
  const pathname = prefixed ? originalPath.slice(runtime.basePath.length) || '/' : originalPath;
  const isClient = clientPaths.has(pathname);
  const policy = routePolicy(pathname, !!runtime.dashboard, runtime.hasOAuth, runtime.hasCamera);
  // This runs before the adapter's static/prerender handlers, which bypass hooks.
  if ((!policy && !isClient) || (isClient && !runtime.dashboard)) { res.writeHead(404).end('Not Found'); return; }
  const methods = isClient ? ['GET'] : policy!.methods;
  if (!methods.includes(req.method ?? '')) {
    const status = isClient ? 405 : policy!.deniedMethod;
    res.writeHead(status, { ...(status === 405 ? { allow: methods.join(', ') } : {}), 'cache-control': 'no-store' }).end(status === 404 ? 'Not Found' : 'Method Not Allowed'); return;
  }
  const request = req as RuntimeRequest;
  request.u1Runtime = runtime; request.u1OriginalTarget = originalTarget;
  request.u1Lifetime = createRequestLifetime(req, res);
  if (prefixed) {
    const target = originalTarget.slice(runtime.basePath.length);
    req.url = !target || target.startsWith('?') ? '/' + target : target;
  }
  // The old bounded body readers accepted headerless payloads. adapter-node
  // otherwise drops that body before a Kit endpoint can inspect it.
  if (policy?.kind !== 'mcp' && !req.headers['content-type'] && (req.headers['content-length'] || req.headers['transfer-encoding'])) req.headers['content-type'] = 'application/octet-stream';
  res.setHeader('cache-control', 'no-store');
  res.setHeader('referrer-policy', 'no-referrer');
  res.setHeader('x-content-type-options', 'nosniff');
  if (NATIVE_DASHBOARD_PATHS.has(pathname) || NATIVE_LAB_PATHS.has(pathname)) res.setHeader('content-security-policy', "default-src 'none'; img-src data:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'");
  res.once('finish', () => { if (!req.complete) req.destroy(); });
  try { await handler(req, res, () => res.writeHead(404).end('Not Found')); }
  catch { if (!res.headersSent) res.writeHead(500).end('Internal server error'); else res.destroy(); }
};
return Object.assign(serve, { close: runtime.close });
};
