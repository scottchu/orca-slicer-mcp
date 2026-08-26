import { afterEach, describe, expect, test } from "bun:test";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";

import { createDebugDashboardHandler } from "./debug-dashboard.js";
import { createRequestHandler, isTailscaleIPv4 } from "./server.js";
import type { U1Status } from "./u1-status.js";

const status: U1Status = {
  schemaVersion: 1,
  stateVersion: 7,
  observedAt: "2026-08-26T12:00:00.000Z",
  reachable: true,
  state: "printing",
  stateLabel: "Printing",
  progressPercent: 42,
  currentLayer: 21,
  totalLayers: 50,
  elapsedSeconds: 600,
  remainingSeconds: 900,
  refreshAfterSeconds: 90,
  filename: "debug-fixture.gcode",
  activePhysicalTool: 1,
  tools: [
    {
      physicalTool: 1,
      temperature: 215,
      target: 215,
      state: "ACTIVE",
      active: true,
    },
  ],
  bed: { temperature: 55, target: 55 },
  storage: { active: true, filePosition: 42, fileSize: 100 },
  printerMessage: null,
  exception: false,
  camera: { available: true, service: "fixture", targetFps: 15 },
};

const servers: Server[] = [];

afterEach(async () => {
  await Promise.all(
    servers.splice(0).map(
      (server) => new Promise<void>((resolve) => server.close(() => resolve()))
    )
  );
});

async function startFixture() {
  const handle = createDebugDashboardHandler({
    readStatus: async () => ({ status, metadata: {} }),
    readCameraFrame: async () => ({
      frame: {
        schemaVersion: 1,
        observedAt: "2026-08-26T12:00:01.000Z",
        available: true,
        mediaType: "image/jpeg",
        byteLength: 4,
        reason: null,
      },
      metadata: { cameraFrame: { dataUrl: "data:image/jpeg;base64,/9j/2Q==" } },
    }),
    openCameraStream: () => ({
      url: "http://127.0.0.1:8788/media/camera.mjpeg?ticket=debug-ticket",
      expiresAt: "2026-08-26T12:01:00.000Z",
      maxDurationSeconds: 1800,
    }),
  });
  const server = createServer(async (req, res) => {
    const url = new URL(req.url ?? "/", "http://127.0.0.1");
    if (!(await handle(req, res, url.pathname))) res.writeHead(404).end();
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  servers.push(server);
  const port = (server.address() as AddressInfo).port;
  return `http://127.0.0.1:${port}`;
}

describe("standalone debug dashboard", () => {
  test("accepts only the private Tailscale IPv4 range for tailnet binding", () => {
    expect(isTailscaleIPv4("100.64.0.1")).toBe(true);
    expect(isTailscaleIPv4("100.127.255.255")).toBe(true);
    expect(isTailscaleIPv4("100.128.0.1")).toBe(false);
    expect(isTailscaleIPv4("0.0.0.0")).toBe(false);
    expect(isTailscaleIPv4("192.168.1.2")).toBe(false);
  });

  test("is absent from the normal local server unless explicitly enabled", async () => {
    const server = createServer(createRequestHandler(null));
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    servers.push(server);
    const port = (server.address() as AddressInfo).port;

    const response = await fetch(`http://127.0.0.1:${port}/debug`);
    expect(response.status).toBe(404);
  });

  test("does not expose the ordinary MCP route from the debug-only process", async () => {
    const server = createServer(
      createRequestHandler(null, null, {
        readStatus: async () => ({ status, metadata: {} }),
      })
    );
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    servers.push(server);
    const port = (server.address() as AddressInfo).port;

    const response = await fetch(`http://127.0.0.1:${port}/mcp`);
    expect(response.status).toBe(404);
  });

  test("serves a host bridge around the production widget", async () => {
    const origin = await startFixture();
    const response = await fetch(`${origin}/debug`);
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(html).toContain('src="/widget?debug=1"');
    expect(html).toContain('message.method === "tools/call"');
  });

  test("exposes only the widget's read-only status and camera calls", async () => {
    const origin = await startFixture();
    const call = async (name: string) => {
      const response = await fetch(`${origin}/debug/tools/call`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name }),
      });
      return { response, body: await response.json() };
    };

    const current = await call("get_u1_status");
    expect(current.response.status).toBe(200);
    expect(current.body.structuredContent).toEqual(status);

    const frame = await call("get_u1_camera_frame");
    expect(frame.response.status).toBe(200);
    expect(frame.body._meta.cameraFrame.dataUrl).toBe(
      "data:image/jpeg;base64,/9j/2Q=="
    );

    const stream = await call("open_u1_camera_stream");
    expect(stream.response.status).toBe(200);
    expect(stream.body._meta.cameraStream.url).toStartWith(
      "http://127.0.0.1:8788/media/camera.mjpeg"
    );

    const control = await call("start_print");
    expect(control.response.status).toBe(400);
    expect(control.body).toEqual({ error: "unsupported_read_only_tool" });
  });
});
