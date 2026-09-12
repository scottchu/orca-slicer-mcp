export type RouteKind = 'general' | 'page' | 'data' | 'tools' | 'oauth' | 'mcp' | 'camera';
export type RoutePolicy = { kind: RouteKind; methods: readonly string[]; deniedMethod: 404 | 405 };
export const DASHBOARD_VIEWS = ['overview', 'progress', 'thermals', 'heads', 'jobs', 'job_history', 'queue', 'fans', 'bed_mesh', 'camera'] as const;
export const NATIVE_DASHBOARD_VIEWS = DASHBOARD_VIEWS.filter((view) => view !== 'camera');
export const NATIVE_DASHBOARD_PATHS = new Set<string>(NATIVE_DASHBOARD_VIEWS.map((view) => `/dashboard/${view}`));
export const NATIVE_LAB_PATHS = new Set(['/dashboard/lab/composition']);
export const NATIVE_LAB_DATA_PATHS = new Set(['/dashboard/lab/composition/__data.json']);
export const DASHBOARD_PAGES = new Set([
  '/dashboard', '/dashboard/',
  ...DASHBOARD_VIEWS.map((view) => `/dashboard/${view}`),
  ...DASHBOARD_VIEWS.map((view) => `/dashboard/${view}_widget`),
  ...['/dashboard/lab', ...DASHBOARD_VIEWS.map((view) => `/dashboard/lab/${view}`)].flatMap((route) => [route, route + '/']),
  ...NATIVE_LAB_PATHS,
]);
const oauthGet = new Set(['/.well-known/oauth-protected-resource', '/.well-known/oauth-protected-resource/mcp',
  '/.well-known/oauth-authorization-server', '/.well-known/jwks.json', '/oauth/authorize', '/oauth/authorize/options']);
const oauthPost = new Set(['/oauth/register', '/oauth/token', '/oauth/authorize/verify']);
export const routePolicy = (pathname: string, dashboard: boolean, oauth: boolean, camera: boolean): RoutePolicy | null => {
  if (['/', '/health', '/widget'].includes(pathname)) return { kind: 'general', methods: ['GET'], deniedMethod: 404 };
  if (dashboard && DASHBOARD_PAGES.has(pathname)) return { kind: 'page', methods: ['GET'], deniedMethod: 405 };
  if (dashboard && NATIVE_LAB_DATA_PATHS.has(pathname)) return { kind: 'data', methods: ['GET'], deniedMethod: 405 };
  if (dashboard && pathname === '/dashboard/tools/call') return { kind: 'tools', methods: ['POST'], deniedMethod: 405 };
  if (!dashboard && (pathname === '/mcp' || pathname.startsWith('/mcp/'))) return { kind: 'mcp', methods: ['GET', 'POST', 'DELETE', 'OPTIONS'], deniedMethod: 404 };
  if (camera && pathname === '/media/camera.webrtc') return { kind: 'camera', methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], deniedMethod: 405 };
  if (!dashboard && oauth) {
    if (oauthGet.has(pathname)) return { kind: 'oauth', methods: ['GET'], deniedMethod: 404 };
    if (oauthPost.has(pathname)) return { kind: 'oauth', methods: ['POST'], deniedMethod: 404 };
    if (pathname === '/auth/enroll' || pathname.startsWith('/auth/enroll/')) return { kind: 'oauth', methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], deniedMethod: 404 };
  }
  return null;
};
