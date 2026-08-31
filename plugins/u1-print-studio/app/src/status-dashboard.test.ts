import { afterEach, describe, expect, test } from "bun:test";
import { createServer, type Server } from "node:http";
import { readFileSync } from "node:fs";
import type { AddressInfo } from "node:net";
import { runInNewContext } from "node:vm";

import { CAMERA_WIDGET_HTML } from "./app.js";
import { createStatusDashboardHandler } from "./status-dashboard.js";
import { createRequestHandler, tailscaleDashboardBaseUrl } from "./server.js";
import type { U1Status } from "./u1-status.js";
import { PrinterObservationStore } from "./observation-store.js";

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
  camera: { available: true, service: "snapshot", targetFps: 15 },
};

const servers: Server[] = [];

afterEach(async () => {
  await Promise.all(
    servers.splice(0).map(
      (server) => new Promise<void>((resolve) => server.close(() => resolve()))
    )
  );
});

async function startFixture(onStatusRead?: () => void) {
  const handle = createStatusDashboardHandler({
    readStatus: async () => {
      onStatusRead?.();
      return { status, metadata: {} };
    },
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

    for (const route of ["/dashboard", "/dashboard/", "/dashboard/progress",
      "/dashboard/thermals", "/dashboard/heads", "/dashboard/jobs", "/dashboard/job_history",
      "/dashboard/queue", "/dashboard/fans", "/dashboard/bed_mesh", "/dashboard/camera"]) {
      expect((await fetch(`http://127.0.0.1:${port}${route}`)).status).toBe(404);
    }
    expect(
      (await fetch(`http://127.0.0.1:${port}/camera-widget`)).status
    ).toBe(404);
    expect(await (await fetch(`http://127.0.0.1:${port}/health`)).json()).toEqual({
      ok: true,
      auth: "local-only",
      runtimeVersion: "0.3.2",
      toolSchemaVersion: 6,
      observationWidgetVersion: "observation-v4",
      cameraWidgetVersion: "camera-v5",
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

  test("serves a static directory without acquiring observations or camera media", async () => {
    const calls: string[] = [];
    const forbidden = (name: string) => () => {
      calls.push(name);
      throw new Error("Static directory must not acquire printer data");
    };
    const observations = new PrinterObservationStore(forbidden("status"));
    observations.current = forbidden("observation");
    const server = createServer(createRequestHandler(null, null, {
      observations,
      readStatus: forbidden("status"),
      readCameraFrame: forbidden("camera-frame"),
      cameraSessions: {
        authorize: forbidden("authorize"), open: forbidden("open"),
        answer: forbidden("answer"), addCandidates: forbidden("candidates"),
        close: forbidden("close"),
      },
    }));
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    servers.push(server);
    const origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    const expected = readFileSync(new URL("../public/dashboard-index.html", import.meta.url), "utf8");
    const routes = ["progress", "camera", "thermals", "heads", "jobs", "job_history", "queue", "fans", "bed_mesh"];
    for (const route of ["/dashboard", "/dashboard/", "/dashboard/?view=overview&tool=start_print"]) {
      const response = await fetch(origin + route, { redirect: "manual" });
      expect(response.status).toBe(200);
      expect(response.headers.get("location")).toBeNull();
      expect(response.headers.get("cache-control")).toBe("no-store");
      expect(response.headers.get("content-type")).toBe("text/html; charset=utf-8");
      expect(response.headers.get("content-security-policy")).toContain("default-src 'none'");
      expect(response.headers.get("content-security-policy")).not.toContain("script-src");
      expect(response.headers.get("referrer-policy")).toBe("no-referrer");
      expect(response.headers.get("x-content-type-options")).toBe("nosniff");
      const html = await response.text();
      expect(html).toBe(expected);
      expect([...html.matchAll(/href="([^"]+)"/g)].map((match) => match[1]))
        .toEqual(routes.map((view) => `/dashboard/${view}`));
      expect(html.match(/>Implemented<\/span>/g)).toHaveLength(2);
      expect(html.match(/>Partial<\/span>/g)).toHaveLength(3);
      expect(html.match(/>Not implemented<\/span>/g)).toHaveLength(4);
      expect(html).toContain("Availability describes this release, not printer status.");
      expect(html).not.toMatch(/<script|<iframe|<img|<video|<audio|<form|<button|fetch\(|setInterval|setTimeout|target=|Read.only|Current reading|Printer telemetry|Observed/i);
    }
    for (const route of ["/dashboard", "/dashboard/"]) {
      const response = await fetch(origin + route, { method: "POST" });
      expect(response.status).toBe(405);
      expect(response.headers.get("allow")).toBe("GET");
    }
    for (const view of routes) expect((await fetch(`${origin}/dashboard/${view}`)).status).toBe(200);
    expect(calls).toEqual([]);
  });

  test("serves a host bridge around each focused production widget", async () => {
    let reads = 0;
    const origin = await startFixture(() => { reads += 1; });
    const response = await fetch(`${origin}/dashboard/progress`);
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(html).toContain('src="/widget?standalone=1"');
    expect(html).toContain('message.method === "tools/call"');
    for (const view of ["progress", "thermals", "heads", "jobs", "job_history", "queue", "fans", "bed_mesh"]) {
      expect((await fetch(`${origin}/dashboard/${view}`)).status).toBe(200);
    }
    for (const view of ["overview", "unknown", "progress/more", "%70rogress", "index.html", "progress/", "/"]) {
      expect((await fetch(`${origin}/dashboard/${view}`)).status).toBe(404);
    }
    expect(reads).toBe(0);
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

  test("exposes only the widget's read-only observation and camera calls", async () => {
    let statusReads = 0;
    const origin = await startFixture(() => { statusReads += 1; });
    const call = async (name: string, argumentsValue = {}) => {
      const response = await fetch(`${origin}/dashboard/tools/call`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, arguments: argumentsValue }),
      });
      return { response, body: await response.json() };
    };

    const current = await call("refresh_printer_observation", {
      view: "overview",
    });
    expect(current.response.status).toBe(200);
    expect(current.body.structuredContent).toMatchObject({
      view: "overview",
      printerState: "printing",
      module: { kind: "overview", state: "unavailable", status: "deferred" },
    });

    const selector = await call("refresh_printer_observation", {
      view: "progress",
      selector: "printer.objects.query",
    });
    expect(selector.response.status).toBe(400);
    expect(selector.body).toEqual({ error: "invalid_observation_view" });

    const legacy = await call("get_u1_status");
    expect(legacy.response.status).toBe(200);
    expect(legacy.body.structuredContent).toMatchObject({ state: "printing" });
    expect(statusReads).toBe(1);

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

  test("shares an injected observation across dashboard requests and callers", async () => {
    let reads = 0;
    const observations = new PrinterObservationStore(async () => {
      reads += 1;
      return { status, metadata: {} };
    });
    const first = await observations.current({ refresh: true });
    const server = createServer(createRequestHandler(null, null, {
      observations,
      readStatus: async () => { throw new Error("must use shared store"); },
    }));
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    servers.push(server);
    const port = (server.address() as AddressInfo).port;
    const call = async (view: string) => (await fetch(`http://127.0.0.1:${port}/dashboard/tools/call`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "refresh_printer_observation", arguments: { view } }),
    })).json();
    const [progress, thermals] = await Promise.all([call("progress"), call("thermals")]);
    expect(reads).toBe(1);
    expect(progress.structuredContent.observationVersion).toBe(first.observationVersion);
    expect(thermals.structuredContent.observationVersion).toBe(first.observationVersion);
  });

  test("keeps one due-aware observation across distinct HTTP MCP requests", async () => {
    let reads = 0;
    let now = new Date("2026-08-30T12:00:00.000Z");
    const observations = new PrinterObservationStore(async () => {
      reads += 1;
      await new Promise<void>((resolve) => setTimeout(resolve, 15));
      return { status, metadata: {} };
    }, () => now);
    const server = createServer(createRequestHandler(null, null, null, observations));
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    servers.push(server);
    const port = (server.address() as AddressInfo).port;
    const origin = `http://127.0.0.1:${port}`;
    await fetch(`${origin}/health`);
    await fetch(`${origin}/widget`);
    expect(reads).toBe(0);
    const call = async (view: string) => {
      const response = await fetch(`${origin}/mcp`, {
        method: "POST",
        headers: {
          accept: "application/json, text/event-stream",
          "content-type": "application/json",
          "mcp-protocol-version": "2025-06-18",
        },
        body: JSON.stringify({ jsonrpc: "2.0", id: view, method: "tools/call",
          params: { name: "observe_printer", arguments: { view } } }),
      });
      expect(response.status).toBe(200);
      return (await response.json()).result.structuredContent;
    };
    const [progress, thermals] = await Promise.all([call("progress"), call("thermals")]);
    expect(reads).toBe(1);
    expect(progress.observationVersion).toBe(1);
    expect(thermals.observationVersion).toBe(1);
    expect(progress.receivedAt).toBe(thermals.receivedAt);
    expect((await call("heads")).observationVersion).toBe(1);
    expect(reads).toBe(1);
    now = new Date("2026-08-30T12:01:31.000Z");
    const [newProgress, newThermals] = await Promise.all([call("progress"), call("thermals")]);
    expect(reads).toBe(2);
    expect(newProgress.observationVersion).toBe(2);
    expect(newThermals.observationVersion).toBe(2);
  });
});

function hostFixture(pathname: string, fetchResult: () => Promise<unknown>) {
  const html = readFileSync(new URL("../public/status-dashboard-host.html", import.meta.url), "utf8");
  const script = html.match(/<script>([\s\S]*?)<\/script>/)![1]!;
  const messages: any[] = [];
  const requests: any[] = [];
  const origin = "http://127.0.0.1:12345";
  const frame = {
    src: "/widget?standalone=1",
    contentWindow: { postMessage: (message: unknown, targetOrigin: string) => {
      expect(targetOrigin).toBe(origin);
      messages.push(message);
    } },
  };
  const bridge = { textContent: "" };
  const title = { textContent: "" };
  let onMessage: (event: unknown) => Promise<void> = async () => {};
  let reload = () => {};
  runInNewContext(script, {
    location: { origin, pathname, search: "?view=overview&tool=start_print" },
    document: { title: "", querySelector: (selector: string) => {
      if (selector === "#widget") return frame;
      if (selector === "#bridge-state") return bridge;
      if (selector === "#view-title") return title;
      return { addEventListener: (_name: string, handler: () => void) => { reload = handler; } };
    } },
    window: { addEventListener: (_name: string, handler: typeof onMessage) => { onMessage = handler; } },
    fetch: async (_url: string, options: { body: string }) => {
      requests.push(JSON.parse(options.body));
      const result = await fetchResult();
      return { ok: true, json: async () => result };
    },
  });
  return {
    messages, requests, frame, bridge, title,
    reload: () => reload(),
    send: (data: unknown, eventOrigin = origin, source: unknown = frame.contentWindow) =>
      onMessage({ source, origin: eventOrigin, data: { jsonrpc: "2.0", ...data as object } }),
  };
}

describe("focused dashboard host bridge", () => {
  test("routes initial and widget refresh only to the selected closed view", async () => {
    for (const view of ["progress", "thermals", "heads", "jobs", "job_history", "queue", "fans", "bed_mesh"]) {
      const result = { structuredContent: { view } };
      const host = hostFixture(`/dashboard/${view}`, async () => result);
      await host.send({ method: "ui/notifications/initialized" }, "https://attacker.example");
      await host.send({ method: "ui/notifications/initialized" }, undefined, {});
      expect(host.requests).toHaveLength(0);
      await host.send({ method: "ui/initialize", id: 1 });
      await host.send({ method: "ui/notifications/initialized" });
      await host.send({ method: "ui/notifications/initialized" });
      expect(host.requests).toEqual([{ name: "refresh_printer_observation", arguments: { view } }]);
      expect(host.messages.at(-1)).toMatchObject({ method: "ui/notifications/tool-result", params: result });
      await host.send({ method: "tools/call", id: 2, params: {
        name: "refresh_printer_observation", arguments: { view },
      } });
      expect(host.requests).toHaveLength(2);
      for (const params of [
        { name: "start_print", arguments: { view } },
        { name: "get_u1_status", arguments: {} },
        { name: "refresh_printer_observation", arguments: { view: "overview" } },
        { name: "refresh_printer_observation", arguments: { view, selector: "anything" } },
      ]) {
        await host.send({ method: "tools/call", id: 3, params });
        expect(host.messages.at(-1)).toMatchObject({ id: 3, error: { message: "tool_failed" } });
      }
      expect(host.requests).toHaveLength(2);
    }
  });

  test("shows initial service failure and permits explicit reload retry", async () => {
    let attempts = 0;
    const host = hostFixture("/dashboard/thermals", async () => {
      if (++attempts === 1) throw new Error("private failure must not be shown");
      return { structuredContent: { view: "thermals", freshness: "offline" } };
    });
    await host.send({ method: "ui/notifications/initialized" });
    expect(host.bridge.textContent).toBe("Service unavailable — use Reload widget to retry");
    expect(host.messages).toHaveLength(0);
    host.reload();
    expect(host.frame.src).toContain("/widget?standalone=1&t=");
    await host.send({ method: "ui/notifications/initialized" });
    expect(attempts).toBe(2);
    expect(host.messages.at(-1).params.structuredContent.freshness).toBe("offline");
    expect(host.bridge.textContent).toBe("Observation received");
  });

  test("does not derive a view from unknown routes or query parameters", async () => {
    const host = hostFixture("/dashboard/overview", async () => ({}));
    await host.send({ method: "ui/notifications/initialized" });
    expect(host.requests).toHaveLength(0);
    expect(host.title.textContent).toBe("View unavailable");
  });
});
