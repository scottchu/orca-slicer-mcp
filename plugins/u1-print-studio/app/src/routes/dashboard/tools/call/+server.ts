import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requestRuntime, requestLifetime } from '../../../../lib/server/runtime-port';
import { readRequestJson } from '../../../../lib/server/request-body';

const headers = {
  'cache-control': 'no-store', 'referrer-policy': 'no-referrer',
  'x-content-type-options': 'nosniff'
};
export const POST: RequestHandler = async ({ request, platform }) => {
  const runtime = requestRuntime(platform);
  if (!runtime.dashboard) return new Response('Not Found', { status: 404 });
  try {
    const result = await runtime.callTool(await readRequestJson(request), requestLifetime(platform));
    return json(result.body, { status: result.status, headers });
  } catch (error) {
    const oversized = error instanceof Error && error.message === 'request_too_large';
    return json({ error: oversized ? 'request_too_large' : 'invalid_request' }, { status: oversized ? 413 : 400, headers });
  }
};
