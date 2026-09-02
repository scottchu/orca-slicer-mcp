import type { IncomingMessage } from 'node:http';
import type { PrinterObservationStore } from './observation-store.js';
import type { StatusDashboardDependencies } from './status-dashboard.js';
import type { ToolReply } from './dashboard-tools.js';
import type { RequestLifetime } from './request-lifetime.js';

export type RuntimePort = {
  observations: PrinterObservationStore;
  dashboard: StatusDashboardDependencies | null;
  callTool: (body: unknown, lifetime?: RequestLifetime) => Promise<ToolReply>;
  basePath: string;
  hasOAuth: boolean;
  hasCamera: boolean;
  general: (pathname: string) => Response;
  page: (pathname: string, method: string) => Response;
  oauth: (request: Request, url: URL) => Promise<Response>;
  camera: (request: Request, lifetime?: RequestLifetime) => Promise<Response>;
  mcp: (request: Request, lifetime?: RequestLifetime) => Promise<Response>;
  close: () => Promise<void>;
};
export type RuntimeRequest = IncomingMessage & { u1Runtime?: RuntimePort; u1OriginalTarget?: string; u1Lifetime?: RequestLifetime };

// The bootstrap owns the instance; independently compiled Kit routes only receive
// this explicit port. Importing this module never initializes printer services.
export const requestRuntime = (platform: { req?: IncomingMessage } | undefined): RuntimePort => {
  const runtime = (platform?.req as RuntimeRequest | undefined)?.u1Runtime;
  if (!runtime) throw new Error('Missing application runtime');
  return runtime;
};

export const requestLifetime = (platform: { req?: IncomingMessage } | undefined): RequestLifetime | undefined =>
  (platform?.req as RuntimeRequest | undefined)?.u1Lifetime;
