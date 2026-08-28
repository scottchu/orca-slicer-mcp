import { afterEach, describe, expect, test } from "bun:test";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";

import { CAMERA_WIDGET_HTML } from "./app.js";
import { createStatusDashboardHandler } from "./status-dashboard.js";
import { createRequestHandler, tailscaleDashboardBaseUrl } from "./server.js";
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
  filename: "dashboard-fixture.gcode",
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
  const handle = createStatusDashboardHandler({
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
    cameraSessions: {
      authorize: () => ({
        token: "private-activation-token",
        expiresAt: "2026-08-25T13:21:32.688Z",
      }),
      open: async (activationToken) => {
        expect(activationToken).toBe("private-activation-token");
        return ({
        sessionId: "dashboard-session-token",
        type: "offer",
        sdp: "v=0\r\ndashboard-offer\r\n",
        iceServers: [],
        expiresAt: "2026-08-26T12:01:00.000Z",
        maxDurationSeconds: 1800,
        });
      },
      answer: async () => ({ accepted: true }),
      addCandidates: async (_sessionId, candidates) => ({
        accepted: true,
        candidateCount: candidates.length,
      }),
      close: () => ({ closed: true }),
    },
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

describe("standalone status dashboard", () => {
  test("builds a private Tailscale Serve HTTPS origin without accepting arbitrary DNS", () => {
    expect(
      tailscaleDashboardBaseUrl(
        { Self: { DNSName: "u1-host.example-tailnet.ts.net." } },
        8444
      ).toString()
    ).toBe("https://u1-host.example-tailnet.ts.net:8444/");
    expect(() =>
      tailscaleDashboardBaseUrl(
        { Self: { DNSName: "attacker.example.com." } },
        8444
      )
    ).toThrow();
    expect(() =>
      tailscaleDashboardBaseUrl(
        { Self: { DNSName: "u1-host.example-tailnet.ts.net." } },
        443
      )
    ).toThrow();
  });

  test("is absent from the normal local server unless explicitly enabled", async () => {
    const server = createServer(createRequestHandler(null));
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    servers.push(server);
    const port = (server.address() as AddressInfo).port;

    const response = await fetch(`http://127.0.0.1:${port}/dashboard`);
    expect(response.status).toBe(404);
    expect(
      (await fetch(`http://127.0.0.1:${port}/dashboard/camera`)).status
    ).toBe(404);
    expect(
      (await fetch(`http://127.0.0.1:${port}/camera-widget`)).status
    ).toBe(404);
    expect(await (await fetch(`http://127.0.0.1:${port}/health`)).json()).toEqual({
      ok: true,
      auth: "local-only",
      runtimeVersion: "0.2.0",
      toolSchemaVersion: 3,
      cameraWidgetVersion: "camera-v2",
    });
  });

  test("does not expose the ordinary MCP route from the dashboard-only process", async () => {
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
    const response = await fetch(`${origin}/dashboard`);
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(html).toContain('src="/widget?standalone=1"');
    expect(html).toContain('message.method === "tools/call"');
  });

  test("serves the same camera-only widget behind a focused test host", async () => {
    const origin = await startFixture();
    const hostResponse = await fetch(`${origin}/dashboard/camera`);
    const hostHtml = await hostResponse.text();
    const widgetResponse = await fetch(`${origin}/camera-widget`);
    const widgetHtml = await widgetResponse.text();

    expect(hostResponse.status).toBe(200);
    expect(hostResponse.headers.get("cache-control")).toBe("no-store");
    expect(hostHtml).toContain('src="/camera-widget?standalone=1"');
    expect(hostHtml).toContain('message.method === "tools/call"');
    expect(widgetResponse.status).toBe(200);
    expect(widgetResponse.headers.get("cache-control")).toBe("no-store");
    expect(widgetResponse.headers.get("content-security-policy")).toContain(
      "default-src 'none'"
    );
    expect(widgetHtml).toBe(CAMERA_WIDGET_HTML);
    expect(widgetHtml).toContain('id="snapshot"');
    expect(widgetHtml).toContain('id="live-stream"');
    expect(widgetHtml).not.toContain("fetch(");
  });

  test("exposes only the widget's read-only status and camera calls", async () => {
    const origin = await startFixture();
    const call = async (name: string, argumentsValue = {}) => {
      const response = await fetch(`${origin}/dashboard/tools/call`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, arguments: argumentsValue }),
      });
      return { response, body: await response.json() };
    };

    const current = await call("get_u1_status");
    expect(current.response.status).toBe(200);
    expect(current.body.structuredContent).toEqual(status);

    const frame = await call("get_u1_camera_frame", { authorizeLive: true });
    expect(frame.response.status).toBe(200);
    expect(frame.body._meta.cameraFrame.dataUrl).toBe(
      "data:image/jpeg;base64,/9j/2Q=="
    );
    expect(frame.body._meta.cameraActivation.token).toBe(
      "private-activation-token"
    );

    const stream = await call("open_u1_camera_stream", {
      activationToken: frame.body._meta.cameraActivation.token,
    });
    expect(stream.response.status).toBe(200);
    expect(stream.body._meta.cameraStream).toMatchObject({
      transport: "mcp-apps-tools",
      sessionId: "dashboard-session-token",
    });

    const answer = await call("answer_u1_camera_stream", {
      sessionId: "dashboard-session-token",
      sdp: "v=0\r\nanswer\r\n",
    });
    expect(answer.response.status).toBe(200);

    const candidates = await call("add_u1_camera_ice_candidates", {
      sessionId: "dashboard-session-token",
      candidates: [{ candidate: "candidate:fixture" }],
    });
    expect(candidates.response.status).toBe(200);

    const close = await call("close_u1_camera_stream", {
      sessionId: "dashboard-session-token",
    });
    expect(close.response.status).toBe(200);

    const control = await call("start_print");
    expect(control.response.status).toBe(400);
    expect(control.body).toEqual({ error: "unsupported_read_only_tool" });
  });
});
