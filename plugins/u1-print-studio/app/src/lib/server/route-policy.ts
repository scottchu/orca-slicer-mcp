export type RouteKind = 'general' | 'page' | 'tools' | 'oauth' | 'mcp' | 'camera';
export type RoutePolicy = { kind: RouteKind; methods: readonly string[]; deniedMethod: 404 | 405 };
export const DASHBOARD_VIEWS = ['overview', 'progress', 'thermals', 'heads', 'jobs', 'job_history', 'queue', 'fans', 'bed_mesh', 'camera'] as const;
export const DASHBOARD_PAGES = new Set([
  '/dashboard', '/dashboard/', '/camera-widget',
  ...DASHBOARD_VIEWS.map((view) => `/dashboard/${view}`),
  ...['fans', 'thermals', 'heads', 'queue', 'camera'].map((view) => `/dashboard/${view}_widget`),
  ...['/dashboard/lab', ...DASHBOARD_VIEWS.map((view) => `/dashboard/lab/${view}`)].flatMap((route) => [route, route + '/'])
]);
const oauthGet = new Set(['/.well-known/oauth-protected-resource', '/.well-known/oauth-protected-resource/mcp',
  '/.well-known/oauth-authorization-server', '/.well-known/jwks.json', '/oauth/authorize', '/oauth/authorize/options']);
const oauthPost = new Set(['/oauth/register', '/oauth/token', '/oauth/authorize/verify']);
export const routePolicy = (pathname: string, dashboard: boolean, oauth: boolean, camera: boolean): RoutePolicy | null => {
  if (['/', '/health', '/widget'].includes(pathname)) return { kind: 'general', methods: ['GET'], deniedMethod: 404 };
  if (dashboard && DASHBOARD_PAGES.has(pathname)) return { kind: 'page', methods: ['GET'], deniedMethod: 405 };
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
