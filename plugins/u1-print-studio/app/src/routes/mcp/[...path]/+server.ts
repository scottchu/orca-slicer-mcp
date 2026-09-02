import type { RequestHandler } from './$types';
import { requestRuntime, requestLifetime } from '../../../lib/server/runtime-port';
export const trailingSlash = 'ignore';
const handle: RequestHandler = ({ request, platform }) => requestRuntime(platform).mcp(request, requestLifetime(platform));
export const GET = handle;
export const POST = handle;
export const DELETE = handle;
export const OPTIONS = handle;
