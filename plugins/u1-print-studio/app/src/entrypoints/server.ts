import { createMcpHttp } from '../lib/server/mcp-http.js';
import { createCameraWebRtcResponse } from '../lib/server/adapters/camera-webrtc-http.js';
import { dashboardPage } from '../lib/server/status-dashboard.js';
import type { RuntimePort } from '../lib/server/runtime-port.js';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { callDashboardTool } from '../lib/server/dashboard-tools.js';
import { createKitTransport, type KitHandler } from '../lib/server/kit-transport.js';
import { execFileSync } from "node:child_process";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { loadKitHandler } from '../lib/server/kit-handler.js';


import { MCP_OBSERVATION_HTML } from "../lib/server/app.js";
import { createCameraIceServerProvider } from "../lib/server/camera-ice-config.js";
import {
  createCameraStreamLocator,
} from "../lib/server/adapters/camera-webrtc-http.js";
import type {
  CameraWebRtcSessionController,
  CameraViewerSessionStore,
} from "../lib/server/application/camera-webrtc.js";
import type {
  CameraRelayService,
  CameraStreamLocator,
} from "../lib/server/application/camera-relay.js";
import {
  cameraMaxViewersFromEnvironment,
  createCameraRuntime,
  tailscaleHostAddresses,
} from "../lib/server/camera-runtime.js";
import { defaultConfigPath, readOptionalLocalConfig } from "../lib/server/local-config.js";
import {
  createPersonalOAuthFromEnvironment,
  type PersonalOAuthService,
} from "../lib/server/personal-oauth.js";
import {
  type StatusDashboardDependencies,
} from "../lib/server/status-dashboard.js";
import {
  readU1CameraFrame,
  readU1Status,
  readU1BedMesh,
  readU1Materials,
  readU1Queue,
  readU1Environment,
  readU1CurrentJob,
  readU1JobHistory,
  u1ToolpathReader,
} from "../lib/server/u1-status.js";
import { runtimeHealth } from "../lib/server/runtime-contract.js";
import { PrinterObservationStore } from "../lib/server/observation-store.js";

const MCP_PATH = "/mcp";

export function tailscaleDashboardBaseUrl(
  status: unknown,
  port: number
): URL {
  const self = status && typeof status === "object" && "Self" in status
    ? (status as { Self?: unknown }).Self
    : null;
  const dnsName = self && typeof self === "object" && "DNSName" in self
    ? (self as { DNSName?: unknown }).DNSName
    : null;
  const host = typeof dnsName === "string" ? dnsName.replace(/\.$/, "") : "";
  if (!host.endsWith(".ts.net")) {
    throw new Error("A private Tailscale MagicDNS hostname is required");
  }
  if (!Number.isInteger(port) || port < 1024 || port > 65_535 || port === 443) {
    throw new Error("A dedicated nonstandard Tailscale Serve HTTPS port is required");
  }
  return new URL(`https://${host}:${port}`);
}

function statusDashboardBaseUrl(localPort: number): URL {
  const servePortRaw = process.env.U1_DASHBOARD_TAILSCALE_PORT?.trim();
  if (!servePortRaw) return new URL(`http://127.0.0.1:${localPort}`);
  const status = JSON.parse(
    execFileSync("tailscale", ["status", "--json"], { encoding: "utf8" })
  );
  return tailscaleDashboardBaseUrl(status, Number(servePortRaw));
}

type CameraRelayDependencies = {
  relay: CameraRelayService;
  locator: CameraStreamLocator;
  sessions: CameraViewerSessionStore;
  controller: CameraWebRtcSessionController;
  close?: () => void;
};

export function createRequestHandler(
  oauth: PersonalOAuthService | null,
  cameraRelay: CameraRelayDependencies | null = null,
  statusDashboard: StatusDashboardDependencies | null = null,
  observations = statusDashboard?.observations ??
    new PrinterObservationStore(
      statusDashboard?.readStatus ?? readU1Status, undefined,
      statusDashboard?.readBedMesh ?? (!statusDashboard?.readStatus || statusDashboard.readStatus === readU1Status ? readU1BedMesh : undefined),
      statusDashboard?.readMaterials ?? (!statusDashboard?.readStatus || statusDashboard.readStatus === readU1Status ? readU1Materials : undefined),
      statusDashboard?.readQueue ?? (!statusDashboard?.readStatus || statusDashboard.readStatus === readU1Status ? readU1Queue : undefined),
      statusDashboard?.readEnvironment ?? (!statusDashboard?.readStatus || statusDashboard.readStatus === readU1Status ? readU1Environment : undefined),
      statusDashboard?.readCurrentJob ?? (!statusDashboard?.readStatus || statusDashboard.readStatus === readU1Status ? readU1CurrentJob : undefined),
      statusDashboard?.readJobHistory ?? (!statusDashboard?.readStatus || statusDashboard.readStatus === readU1Status ? readU1JobHistory : undefined),
      !statusDashboard?.readStatus || statusDashboard.readStatus === readU1Status ? u1ToolpathReader : undefined
    )
) {
  let loaded: Promise<KitHandler> | undefined;
  return async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    loaded ??= (async () => {
      const file = new URL(import.meta.url.includes('/src/entrypoints/') ? '../../build-kit/handler.js' : './handler.js', import.meta.url).href;
      const handler = await loadKitHandler(file);
      return createUnifiedRequestHandler(handler, new Set(), oauth, cameraRelay, statusDashboard, observations);
    })();
    await (await loaded)(req, res);
  };
}

export function createEnrollmentRequestHandler(oauth: PersonalOAuthService) {
  return async (req: IncomingMessage, res: ServerResponse) => {
    if (!req.url) {
      res.writeHead(400).end("Missing URL");
      return;
    }
    const url = new URL(req.url, "http://" + (req.headers.host ?? "localhost"));
    if (req.method === "GET" && url.pathname === "/health") {
      res.writeHead(200, {
        "cache-control": "no-store",
        "content-type": "application/json; charset=utf-8",
      }).end(JSON.stringify({ ok: true, surface: "passkey-enrollment" }));
      return;
    }
    if (await oauth.handleEnrollment(req, res, url)) return;
    res.writeHead(404).end("Not Found");
  };
}

export function createServerCameraIceServerProvider(
  environment: NodeJS.ProcessEnv = process.env
) {
  const localConfig = readOptionalLocalConfig(defaultConfigPath(environment));
  return createCameraIceServerProvider(environment, {
    configuredStunUrls: localConfig?.camera.stunUrls ?? [],
  });
}

export function enrollmentPortFromEnvironment(
  publicPort: number,
  environment: NodeJS.ProcessEnv = process.env
): number {
  const enrollmentPort = Number(environment.U1_ENROLLMENT_PORT?.trim());
  if (
    !Number.isInteger(enrollmentPort) ||
    enrollmentPort < 1_024 ||
    enrollmentPort > 65_535 ||
    enrollmentPort === publicPort
  ) {
    throw new Error(
      "U1_ENROLLMENT_PORT must be a distinct loopback port from 1024 to 65535"
    );
  }
  return enrollmentPort;
}

export const createUnifiedRequestHandler = (
  kit: KitHandler,
  clientPaths: ReadonlySet<string>,
  oauth: PersonalOAuthService | null,
  cameraRelay: CameraRelayDependencies | null,
  dashboard: StatusDashboardDependencies | null,
  observations: PrinterObservationStore
): KitHandler => {
  const mcp = createMcpHttp(observations, oauth, cameraRelay?.controller);
  const camera = cameraRelay ? createCameraWebRtcResponse(cameraRelay.relay, cameraRelay.sessions) : null;
  const runtime: RuntimePort = {
    observations, dashboard,
    basePath: oauth?.basePath ?? '', hasOAuth: !!oauth, hasCamera: !!camera,
    callTool: (body, lifetime) => callDashboardTool(body, observations, dashboard ?? {}, lifetime),
    general: (pathname) => pathname === '/health'
      ? new Response(JSON.stringify(runtimeHealth(oauth ? 'personal-oauth' : 'local-only')), { headers: { 'cache-control': 'no-store', 'content-type': 'application/json; charset=utf-8' } })
      : pathname === '/widget' ? new Response(MCP_OBSERVATION_HTML, { headers: { 'cache-control': 'no-store', 'content-type': 'text/html; charset=utf-8' } })
      : new Response('U1 Print Studio MCP server', { headers: { 'cache-control': 'no-store', 'content-type': 'text/plain; charset=utf-8' } }),
    page: (pathname, method) => dashboardPage(pathname, method) ?? new Response('Not Found', { status: 404 }),
    oauth: async (request, url) => await oauth?.handleRequest(request, url) ?? new Response('Not Found', { status: 404 }),
    camera: async (request, lifetime) => camera ? camera(request, new URL(request.url), lifetime?.signal, lifetime) : new Response('Not Found', { status: 404 }),
    mcp: mcp.handle, close: async () => { observations.dispose(); cameraRelay?.close?.(); await mcp.close(); }
  };
  return createKitTransport(kit, runtime, clientPaths);
};

export async function startServer() {
  const statusDashboardEnabled = process.env.U1_STATUS_DASHBOARD === "1";
  const oauth = statusDashboardEnabled
    ? null
    : await createPersonalOAuthFromEnvironment();
  const port = Number(process.env.PORT ?? "8787");
  const host = "127.0.0.1";
  const dashboardBaseUrl = statusDashboardEnabled
    ? statusDashboardBaseUrl(port)
    : null;
  const iceServerProvider = createServerCameraIceServerProvider();
  const cameraRelay = (() => {
    if (!oauth && !statusDashboardEnabled) return null;
    const { relay, sessions, controller, close } = createCameraRuntime({
      iceServerProvider,
      maxViewers: cameraMaxViewersFromEnvironment(),
      downstreamAdditionalHostAddresses: tailscaleHostAddresses(),
    });
    return {
      relay,
      sessions,
      controller,
      close,
      locator: createCameraStreamLocator(
        oauth?.publicBaseUrl ?? dashboardBaseUrl!
      ),
    };
  })();
  const statusDashboard = statusDashboardEnabled && cameraRelay
    ? {
        readStatus: readU1Status,
        readBedMesh: readU1BedMesh,
        readMaterials: readU1Materials,
        readQueue: readU1Queue,
        readEnvironment: readU1Environment,
        readCurrentJob: readU1CurrentJob,
        readJobHistory: readU1JobHistory,
        readCameraFrame: readU1CameraFrame,
        cameraSessions: cameraRelay.controller,
      }
    : null;
  const observations = new PrinterObservationStore(
    readU1Status, undefined, readU1BedMesh, readU1Materials, readU1Queue,
    readU1Environment, readU1CurrentJob, readU1JobHistory, u1ToolpathReader
  );
  const outputRoot = new URL('./', import.meta.url);
  const manifest = JSON.parse(readFileSync(new URL('build-manifest.json', outputRoot), 'utf8')) as {
    staticRoutes: Record<string, { role: string }>;
  };
  const handlerFile = fileURLToPath(new URL('handler.js', outputRoot));
  const handler = await loadKitHandler(handlerFile);
  const clientPaths = new Set(Object.keys(manifest.staticRoutes).filter((route) => route.startsWith('/_app/')));
  const transport = createUnifiedRequestHandler(
    handler, clientPaths, oauth, cameraRelay, statusDashboard, observations
  );
  const server = createServer(transport);
  const shutdown = (): void => {
    process.emit('sveltekit:shutdown' as never);
    void transport.close?.();
    server.close();
    server.closeIdleConnections();
    setTimeout(() => server.closeAllConnections(), 500).unref();
  };
  process.once('SIGTERM', shutdown);
  process.once('SIGINT', shutdown);
  server.once('close', () => {
    void transport.close?.();
    (process as NodeJS.EventEmitter).removeListener('SIGTERM', shutdown);
    (process as NodeJS.EventEmitter).removeListener('SIGINT', shutdown);
  });

  await new Promise<void>((resolve) => server.listen(port, host, resolve));
  if (oauth?.enrollmentBaseUrl) {
    let enrollmentPort: number;
    try {
      enrollmentPort = enrollmentPortFromEnvironment(port);
    } catch (error) {
      server.close();
      throw error;
    }
    const enrollmentServer = createServer(createEnrollmentRequestHandler(oauth));
    try {
      await new Promise<void>((resolve, reject) => {
        enrollmentServer.once("error", reject);
        enrollmentServer.listen(enrollmentPort, host, resolve);
      });
    } catch (error) {
      server.close();
      throw error;
    }
    server.once("close", () => enrollmentServer.close());
    console.log(
      `U1 passkey enrollment listener bound to http://${host}:${enrollmentPort}`
    );
  }
  if (statusDashboardEnabled) {
    console.log(
      `U1 Status Dashboard: ${new URL("/dashboard", dashboardBaseUrl!).toString()}`
    );
    console.log(
      `U1 Camera Dashboard: ${new URL("/dashboard/camera", dashboardBaseUrl!).toString()}`
    );
  } else {
    console.log(`U1 Print Studio MCP server listening on http://${host}:${port}${MCP_PATH}`);
  }
  if (oauth) {
    console.log(`Remote resource: ${oauth.resource}`);
    if (oauth.enrollmentUrl) {
      console.log(`One-time passkey enrollment link: ${oauth.enrollmentLinkPath}`);
    }
  }
  return server;
}

if (import.meta.main) {
  await startServer();
}
