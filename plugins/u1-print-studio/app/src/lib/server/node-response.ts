import type { IncomingMessage, ServerResponse } from 'node:http';
import { getRequest, setResponse } from '@sveltejs/kit/node';

// Only the standalone enrollment listener and Node compatibility callers use
// this adapter. Production application routes return Web Responses through Kit.
export const serveNodeResponse = async (
  req: IncomingMessage, res: ServerResponse,
  action: (request: Request) => Promise<Response | null>
): Promise<boolean> => {
  if (!req.headers['content-type']) req.headers['content-type'] = 'application/octet-stream';
  const request = await getRequest({ request: req, base: `http://${req.headers.host ?? 'localhost'}` });
  const response = await action(request);
  if (!response) return false;
  res.once('finish', () => { if (!req.complete) req.destroy(); });
  await setResponse(res, response);
  return true;
};
