import type { RequestHandler } from './$types';
import { requestRuntime } from '../lib/server/runtime-port';
export const trailingSlash = 'ignore';
const handle: RequestHandler = ({ request, url, platform }) => requestRuntime(platform).general(url.pathname);
export const GET = handle;
