import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { createAppServer } from './app.js';
import { MONITOR_SCOPE, type PersonalOAuthService } from './personal-oauth.js';
import type { PrinterObservationStore } from './observation-store.js';
import type { CameraWebRtcSessionController } from './application/camera-webrtc.js';
import type { RequestLifetime } from './request-lifetime.js';

const cors = {
  'access-control-allow-origin': '*',
  'access-control-expose-headers': 'Mcp-Session-Id, WWW-Authenticate'
};
export const createMcpHttp = (
  observations: PrinterObservationStore, oauth: PersonalOAuthService | null,
  cameraSessions?: CameraWebRtcSessionController
) => {
  const active = new Set<() => Promise<void>>();
  const handle = async (request: Request, lifetime?: RequestLifetime): Promise<Response> => {
    const signal = lifetime?.signal ?? request.signal;
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: {
      ...cors, 'access-control-allow-methods': 'POST, GET, DELETE, OPTIONS',
      'access-control-allow-headers': 'authorization, content-type, mcp-protocol-version, mcp-session-id'
    } });
    let authInfo;
    try { authInfo = oauth ? await oauth.authenticateHeader(request.headers.get('authorization') ?? '') : undefined; }
    catch { return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: {
      'cache-control': 'no-store', 'content-type': 'application/json; charset=utf-8',
      'www-authenticate': oauth!.challenge()
    } }); }
    const requestCamera = cameraSessions && {
      ...cameraSessions,
      open: async (token: string) => {
        const opened = await cameraSessions.open(token);
        lifetime?.onAborted(() => { cameraSessions.close(opened.sessionId); });
        return opened;
      }
    };
    const server = createAppServer({ observations, ...(requestCamera ? { cameraSessions: requestCamera } : {}) }, oauth ? { oauthScopes: [MONITOR_SCOPE] } : {});
    const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
    let closed = false;
    const close = async (): Promise<void> => {
      if (closed) return;
      closed = true; active.delete(close); signal.removeEventListener('abort', abort);
      await Promise.allSettled([transport.close(), server.close()]);
    };
    const abort = (): void => { void close(); };
    active.add(close); signal.addEventListener('abort', abort, { once: true });
    try {
      await server.connect(transport);
      if (signal.aborted) { await close(); throw new Error('Request aborted'); }
      const response = await transport.handleRequest(request, { authInfo });
      const headers = new Headers(response.headers);
      for (const [key, value] of Object.entries(cors)) headers.set(key, value);
      if (!response.body) { await close(); return new Response(null, { status: response.status, headers }); }
      const reader = response.body.getReader();
      const body = new ReadableStream<Uint8Array>({
        pull: async (controller) => {
          try {
            const result = await reader.read();
            if (result.done) { reader.releaseLock(); controller.close(); await close(); }
            else controller.enqueue(result.value);
          } catch (error) { controller.error(error); await close(); }
        },
        cancel: async () => { try { await reader.cancel(); } finally { await close(); } }
      });
      return new Response(body, { status: response.status, headers });
    } catch { await close(); return new Response('Internal server error', { status: 500, headers: cors }); }
  };
  return { handle, close: async (): Promise<void> => { await Promise.all([...active].map((close) => close())); } };
};
