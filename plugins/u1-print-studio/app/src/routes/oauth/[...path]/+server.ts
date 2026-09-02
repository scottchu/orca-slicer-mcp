import type { RequestHandler } from './$types';
import { requestRuntime } from '../../../lib/server/runtime-port';
export const trailingSlash = 'ignore';
const handle: RequestHandler = ({ request, url, platform }) => requestRuntime(platform).oauth(request, new URL(platform?.req.u1OriginalTarget ?? request.url, request.url));
export const GET = handle;
export const POST = handle;
