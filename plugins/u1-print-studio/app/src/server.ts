import { createServer, type IncomingMessage, type ServerResponse } from "node:http";

import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

import { createAppServer, WIDGET_HTML } from "./app.js";
import { createCameraTicketCodec } from "./adapters/camera-ticket-codec.js";
import {
  createCameraMediaHandler,
  createCameraStreamLocator,
} from "./adapters/camera-media-http.js";
import {
  CameraRelayService,
  type CameraStreamLocator,
} from "./application/camera-relay.js";
import {
  createPersonalOAuthFromEnvironment,
  MONITOR_SCOPE,
  type PersonalOAuthService,
} from "./personal-oauth.js";
import { readU1CameraJpeg } from "./u1-status.js";

const MCP_PATH = "/mcp";

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
};

export function createRequestHandler(
  oauth: PersonalOAuthService | null,
  cameraRelay: CameraRelayDependencies | null = null
) {
  const handleCameraMedia = cameraRelay
    ? createCameraMediaHandler(cameraRelay.relay)
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
      handleCameraMedia &&
      (await handleCameraMedia(req, res, pathname, url))
    ) {
      return;
    }
    const isMcpRoute =
      pathname === MCP_PATH || pathname.startsWith(MCP_PATH + "/");

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
      }).end(WIDGET_HTML);
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
          ? { openCameraStream: () => cameraRelay.relay.open(cameraRelay.locator) }
          : {},
        oauth
          ? {
              oauthScopes: [MONITOR_SCOPE],
              cameraResourceOrigin: oauth.publicBaseUrl.origin,
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
  const oauth = await createPersonalOAuthFromEnvironment();
  const port = Number(process.env.PORT ?? "8787");
  const host = "127.0.0.1";
  const cameraRelay = oauth
    ? {
        relay: new CameraRelayService(
          {
            readFrame: (signal) => readU1CameraJpeg(signal),
          },
          createCameraTicketCodec()
        ),
        locator: createCameraStreamLocator(oauth.publicBaseUrl),
      }
    : null;
  const server = createServer(createRequestHandler(oauth, cameraRelay));

  await new Promise<void>((resolve) => server.listen(port, host, resolve));
  console.log(`U1 Print Studio MCP server listening on http://${host}:${port}${MCP_PATH}`);
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
