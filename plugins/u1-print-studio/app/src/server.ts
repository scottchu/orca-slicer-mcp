import { execFileSync } from "node:child_process";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";

import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

import { createAppServer, readWidgetHtml } from "./app.js";
import {
  createCameraStreamLocator,
  createCameraWebRtcHandler,
} from "./adapters/camera-webrtc-http.js";
import type {
  CameraWebRtcSessionController,
  CameraWebRtcSessionService,
} from "./application/camera-webrtc.js";
import type {
  CameraRelayService,
  CameraStreamLocator,
} from "./application/camera-relay.js";
import { createCameraRuntime } from "./camera-runtime.js";
import {
  createPersonalOAuthFromEnvironment,
  MONITOR_SCOPE,
  type PersonalOAuthService,
} from "./personal-oauth.js";
import {
  createStatusDashboardHandler,
  type StatusDashboardDependencies,
} from "./status-dashboard.js";
import {
  readU1CameraFrame,
  readU1Status,
} from "./u1-status.js";

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

function localPath(url: URL, oauth: PersonalOAuthService | null): string {
  const prefix = oauth?.basePath ?? "";
  if (prefix && url.pathname.startsWith(prefix)) {
    return url.pathname.slice(prefix.length) || "/";
  }
  return url.pathname;
}

function unauthorized(res: ServerResponse, oauth: PersonalOAuthService): void {
  res.writeHead(401, {
    "cache-control": "no-store",
    "content-type": "application/json; charset=utf-8",
    "www-authenticate": oauth.challenge(),
  });
  res.end(JSON.stringify({ error: "unauthorized" }));
}

type CameraRelayDependencies = {
  relay: CameraRelayService;
  locator: CameraStreamLocator;
  sessions: CameraWebRtcSessionService;
  controller: CameraWebRtcSessionController;
};

export function createRequestHandler(
  oauth: PersonalOAuthService | null,
  cameraRelay: CameraRelayDependencies | null = null,
  statusDashboard: StatusDashboardDependencies | null = null
) {
  const handleCameraWebRtc = cameraRelay
    ? createCameraWebRtcHandler(cameraRelay.relay, cameraRelay.sessions)
    : null;
  const handleStatusDashboard = statusDashboard
    ? createStatusDashboardHandler(statusDashboard)
    : null;
  return async (req: IncomingMessage, res: ServerResponse) => {
    if (!req.url) {
      res.writeHead(400).end("Missing URL");
      return;
    }

    const url = new URL(req.url, "http://" + (req.headers.host ?? "localhost"));
    if (oauth && (await oauth.handle(req, res, url))) return;

    const pathname = localPath(url, oauth);
    if (
      handleStatusDashboard &&
      (await handleStatusDashboard(req, res, pathname))
    ) {
      return;
    }
    if (
      handleCameraWebRtc &&
      (await handleCameraWebRtc(req, res, pathname, url))
    ) {
      return;
    }
    const isMcpRoute =
      pathname === MCP_PATH || pathname.startsWith(MCP_PATH + "/");

    if (statusDashboard && isMcpRoute) {
      res.writeHead(404).end("Not Found");
      return;
    }

    if (req.method === "OPTIONS" && isMcpRoute) {
      res.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, DELETE, OPTIONS",
        "Access-Control-Allow-Headers":
          "authorization, content-type, mcp-protocol-version, mcp-session-id",
        "Access-Control-Expose-Headers": "Mcp-Session-Id, WWW-Authenticate",
      });
      res.end();
      return;
    }

    if (req.method === "GET" && pathname === "/") {
      res.writeHead(200, {
        "cache-control": "no-store",
        "content-type": "text/plain; charset=utf-8",
      }).end("U1 Print Studio MCP server");
      return;
    }

    if (req.method === "GET" && pathname === "/health") {
      res.writeHead(200, {
        "cache-control": "no-store",
        "content-type": "application/json; charset=utf-8",
      }).end(JSON.stringify({ ok: true, auth: oauth ? "personal-oauth" : "local-only" }));
      return;
    }

    if (req.method === "GET" && pathname === "/widget") {
      res.writeHead(200, {
        "cache-control": "no-store",
        "content-type": "text/html; charset=utf-8",
      }).end(readWidgetHtml());
      return;
    }

    const transportMethods = new Set(["GET", "POST", "DELETE"]);
    if (isMcpRoute && req.method && transportMethods.has(req.method)) {
      let authInfo: AuthInfo | undefined;
      if (oauth) {
        try {
          authInfo = await oauth.authenticate(req);
        } catch {
          unauthorized(res, oauth);
          return;
        }
      }

      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Expose-Headers", "Mcp-Session-Id, WWW-Authenticate");

      const server = createAppServer(
        cameraRelay
          ? { cameraSessions: cameraRelay.controller }
          : {},
        oauth
          ? {
              oauthScopes: [MONITOR_SCOPE],
            }
          : {}
      );
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
        enableJsonResponse: true,
      });

      res.on("close", () => {
        transport.close();
        server.close();
      });

      try {
        await server.connect(transport);
        const authenticatedRequest = req as IncomingMessage & { auth?: AuthInfo };
        authenticatedRequest.auth = authInfo;
        await transport.handleRequest(authenticatedRequest, res);
      } catch (error) {
        console.error("Failed to handle MCP request:", error);
        if (!res.headersSent) {
          res.writeHead(500).end("Internal server error");
        }
      }
      return;
    }

    res.writeHead(404).end("Not Found");
  };
}

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
  const cameraRelay = (() => {
    if (!oauth && !statusDashboardEnabled) return null;
    const { relay, sessions, controller } = createCameraRuntime();
    return {
      relay,
      sessions,
      controller,
      locator: createCameraStreamLocator(
        oauth?.publicBaseUrl ?? dashboardBaseUrl!
      ),
    };
  })();
  const statusDashboard = statusDashboardEnabled && cameraRelay
    ? {
        readStatus: readU1Status,
        readCameraFrame: readU1CameraFrame,
        cameraSessions: cameraRelay.controller,
      }
    : null;
  const server = createServer(
    createRequestHandler(oauth, cameraRelay, statusDashboard)
  );

  await new Promise<void>((resolve) => server.listen(port, host, resolve));
  if (statusDashboardEnabled) {
    console.log(
      `U1 Status Dashboard: ${new URL("/dashboard", dashboardBaseUrl!).toString()}`
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
