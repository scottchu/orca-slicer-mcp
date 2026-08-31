import { describe, expect, test } from "bun:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";

import { createAppServer } from "./app.js";
import { ENVIRONMENT_MAX_BYTES, ENVIRONMENT_ROUTE, normalizeEnvironmentResponse, readMoonrakerEnvironment } from "./adapters/moonraker-environment.js";
import { unavailableEnvironment } from "./application/environment-observation.js";
import { PrinterObservationStore } from "./observation-store.js";
import { createObservationPresentation } from "./observation-presentation.js";
import { createRequestHandler } from "./server.js";
import type { U1Status } from "./u1-status.js";

const receipt = "2026-08-31T12:00:00.000Z";
const raw = (status: Record<string, unknown> = {}) => ({ result: { status: {
  "temperature_sensor cavity": { temperature: 31.5 },
  fan: { speed: 0.5, rpm: 1200 },
  "fan_generic e1_fan": { speed: 0, rpm: 0 },
  "fan_generic e2_fan": { speed: 0.25, rpm: null },
  "fan_generic e3_fan": {},
  "fan_generic cavity_fan": { speed: 1 },
  purifier: { power_detected: true, mode: 2, exhaust_fan: { speed: 0.4 },
    inner_fan: { speed: 0 }, inner_fan_rpm: 0 },
  ...status,
} } });
const status = (): U1Status => ({
  schemaVersion: 1, stateVersion: 1, observedAt: "2026-08-31T11:00:00.000Z", reachable: true,
  state: "standby", stateLabel: "Ready", progressPercent: null, currentLayer: null,
  totalLayers: null, elapsedSeconds: null, remainingSeconds: null, refreshAfterSeconds: 90,
  filename: null, activePhysicalTool: null, tools: [], bed: { temperature: 0, target: 0 },
  storage: { active: null, filePosition: null, fileSize: null }, printerMessage: null,
  exception: false, camera: { available: false, service: null, targetFps: null },
});

describe("bounded fixed environment normalization", () => {
  test("normalizes only fixed cavity, fan and purifier fields including zero and nullable RPM", () => {
    const result = normalizeEnvironmentResponse(raw({ private_object: { credential: "secret" } }), receipt);
    expect(result).toMatchObject({ state: "known", freshness: "fresh", sourceObservedAt: receipt,
      cavity: { state: "known", temperatureC: 31.5 },
      purifier: { state: "known", powerDetected: true, mode: "preheat_chamber" } });
    expect(result.fans).toEqual([
      expect.objectContaining({ id: "tool-1-part", state: "known", speedReported: true, speedFraction: 0.5, rpmReported: true, rpm: 1200 }),
      expect.objectContaining({ id: "tool-2-part", state: "known", speedFraction: 0, rpm: 0 }),
      expect.objectContaining({ id: "tool-3-part", state: "known", speedFraction: 0.25, rpmReported: true, rpm: null }),
      expect.objectContaining({ id: "tool-4-part", state: "not_reported", speedReported: false, rpmReported: false }),
      expect.objectContaining({ id: "cavity", state: "known", speedFraction: 1, rpmReported: false }),
      expect.objectContaining({ id: "purifier-exhaust", state: "known", speedFraction: 0.4, rpmReported: false }),
      expect.objectContaining({ id: "purifier-inner", state: "known", speedFraction: 0, rpmReported: true, rpm: 0 }),
    ]);
    expect(JSON.stringify(result)).not.toMatch(/private_object|credential|secret/);
  });

  test("keeps successful missing components and fields not reported and preserves independent inner RPM", () => {
    const partial = normalizeEnvironmentResponse({ result: { status: {
      "temperature_sensor cavity": {}, fan: {},
      purifier: { power_detected: true, inner_fan_rpm: 4321 },
    } } }, receipt);
    expect(partial).toMatchObject({ state: "known", cavity: { state: "not_reported", temperatureC: null } });
    expect(partial.fans[0]).toMatchObject({ state: "not_reported", speedReported: false, rpmReported: false });
    expect(partial.fans[6]).toMatchObject({ state: "known", speedReported: false, speedFraction: null, rpmReported: true, rpm: 4321 });
    expect(partial.purifier).toEqual({ state: "known", powerDetected: true, mode: null });
    for (const temperature of [0, -273.15, 999]) {
      expect(normalizeEnvironmentResponse(raw({ "temperature_sensor cavity": { temperature } }), receipt).cavity.temperatureC).toBe(temperature);
    }
  });

  test("distinguishes purifier power not detected and suppresses hidden values", () => {
    const result = normalizeEnvironmentResponse(raw({ purifier: { power_detected: false, mode: 3,
      exhaust_fan: { speed: "private" }, inner_fan: { speed: 2 }, inner_fan_rpm: 2_000_000 } }), receipt);
    expect(result.purifier).toEqual({ state: "known", powerDetected: false, mode: null });
    expect(result.fans.slice(5)).toEqual(expect.arrayContaining([
      expect.objectContaining({ state: "not_reported", speedFraction: null, rpm: null }),
    ]));
    expect(JSON.stringify(result)).not.toContain("private");
  });

  test("maps only finite numeric purifier mode integers zero through three", () => {
    const expected = ["idle", "cool_chamber", "preheat_chamber", "hot_chamber"] as const;
    for (const [mode, label] of expected.entries()) {
      expect(normalizeEnvironmentResponse(raw({ purifier: { power_detected: true, mode } }), receipt).purifier.mode).toBe(label);
    }
    for (const mode of ["1", NaN, Infinity, -Infinity, 1.5, -1, 4, undefined]) {
      expect(normalizeEnvironmentResponse(raw({ purifier: { power_detected: true, mode } }), receipt).purifier).toMatchObject({
        state: "known", powerDetected: true, mode: null,
      });
    }
  });

  test("rejects malformed structures, explicit nonnullable nulls and numeric bounds", () => {
    for (const payload of [null, {}, { result: {} }, { result: { status: [] } },
      raw({ fan: null }), raw({ fan: { speed: null } }), raw({ fan: { speed: -0.1 } }),
      raw({ fan: { speed: 1.1 } }), raw({ fan: { rpm: -1 } }), raw({ fan: { rpm: 1_000_001 } }),
      raw({ "temperature_sensor cavity": { temperature: null } }), raw({ "temperature_sensor cavity": { temperature: -273.16 } }),
      raw({ purifier: { power_detected: null } }), raw({ purifier: { power_detected: true, exhaust_fan: 0.5 } }),
    ]) expect(normalizeEnvironmentResponse(payload, receipt).reason).toBe("malformed");
    expect(normalizeEnvironmentResponse(raw({ fan: { rpm: null } }), receipt).fans[0]).toMatchObject({ state: "known", rpmReported: true, rpm: null });
  });
});

describe("fixed read-only environment HTTP adapter", () => {
  test("uses only the closed GET and classifies failures without redirects or raw errors", async () => {
    const requests: string[] = []; let code = 200; let body = JSON.stringify(raw());
    const fixture = Bun.serve({ hostname: "127.0.0.1", port: 0, fetch(request) {
      const url = new URL(request.url); requests.push(`${request.method} ${url.pathname}${url.search}`);
      return new Response(body, { status: code, headers: code === 302 ? { location: "/forbidden" } : {} });
    } });
    try {
      expect((await readMoonrakerEnvironment(fixture.url, () => new Date(receipt))).state).toBe("known");
      for (const [statusCode, reason] of [[404, "unsupported"], [405, "unsupported"], [401, "unauthorized"], [403, "unauthorized"], [500, "http_error"], [302, "http_error"]] as const) {
        code = statusCode; body = "private upstream path /home/secret";
        const result = await readMoonrakerEnvironment(fixture.url);
        expect(result.reason).toBe(reason); expect(JSON.stringify(result)).not.toContain(body);
      }
      code = 200; body = "broken json";
      expect((await readMoonrakerEnvironment(fixture.url)).reason).toBe("malformed");
      body = "x".repeat(ENVIRONMENT_MAX_BYTES + 100);
      expect((await readMoonrakerEnvironment(fixture.url)).reason).toBe("too_large");
      expect(new Set(requests)).toEqual(new Set([`GET ${ENVIRONMENT_ROUTE}`]));
      expect(requests).toHaveLength(9);
      expect((await readMoonrakerEnvironment("https://example.com/")).reason).toBe("not_configured");
    } finally { fixture.stop(true); }
  });
});

describe("independent shared environment observations", () => {
  test("coalesces Thermals and Fans, ages on a 15-second clock and retains last good data", async () => {
    let now = new Date(receipt); let reads = 0; let fail = false;
    const store = new PrinterObservationStore(async () => ({ status: status(), metadata: {} }), () => now,
      undefined, undefined, undefined, async () => { reads++; return fail ? unavailableEnvironment("timeout", now.toISOString()) : normalizeEnvironmentResponse(raw(), now.toISOString()); });
    const [thermals, fans] = await Promise.all([store.current({ includeEnvironment: true }), store.current({ includeEnvironment: true })]);
    expect(reads).toBe(1); expect(thermals.environment).toEqual(fans.environment);
    expect(createObservationPresentation(thermals, "thermals").module).toMatchObject({ kind: "thermals", environment: { state: "known", sourceObservedAt: receipt } });
    expect(createObservationPresentation(fans, "fans").module).toMatchObject({ kind: "fans", state: "known", provenance: { sourceObservedAt: receipt } });
    now = new Date(now.valueOf() + 15_000); fail = true;
    const stale = await store.current({ refresh: true, includeEnvironment: true });
    expect(reads).toBe(2); expect(stale.environment).toMatchObject({ state: "stale", freshness: "stale", sourceObservedAt: receipt, checkedAt: now.toISOString(), reason: "timeout" });
    expect(stale.environment?.cavity.temperatureC).toBe(31.5);
  });

  test("successful partial atomically replaces old values; unrelated domains never acquire environment", async () => {
    let reads = 0; let partial = false; let now = new Date(receipt);
    const store = new PrinterObservationStore(async () => ({ status: status(), metadata: {} }), () => now,
      undefined, undefined, undefined, async () => { reads++; return normalizeEnvironmentResponse(partial ? { result: { status: {} } } : raw(), now.toISOString()); });
    for (const options of [{}, { includeBedMesh: true }, { includeMaterials: true }, { includeQueue: true }]) await store.current(options);
    expect(reads).toBe(0);
    expect((await store.current({ includeEnvironment: true })).environment?.cavity.state).toBe("known");
    partial = true; now = new Date(now.valueOf() + 15_000);
    const next = await store.current({ refresh: true, includeEnvironment: true });
    expect(reads).toBe(2);
    expect(next.environment).toMatchObject({ state: "known", sourceObservedAt: now.toISOString(),
      cavity: { state: "not_reported", temperatureC: null }, purifier: { state: "not_reported" } });
    expect(next.environment?.fans.every(fan => fan.state === "not_reported")).toBe(true);
    const noReader = await new PrinterObservationStore(async () => ({ status: status(), metadata: {} })).current({ includeEnvironment: true });
    expect(noReader.environment).toMatchObject({ state: "unknown", reason: "not_requested" });
  });
});

describe("environment inbound composition", () => {
  test("only Thermals and Fans acquire one shared environment read through the closed tool surface", async () => {
    let reads = 0;
    const server = createAppServer({ readStatus: async () => ({ status: status(), metadata: {} }), readEnvironment: async () => { reads++; return normalizeEnvironmentResponse(raw(), new Date().toISOString()); } });
    const client = new Client({ name: "environment-fixture", version: "1" });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
    try {
      for (const view of ["progress", "heads", "jobs", "job_history", "queue", "bed_mesh"] as const) await client.callTool({ name: "observe_printer", arguments: { view } });
      expect(reads).toBe(0);
      const overview = (await client.callTool({ name: "observe_printer", arguments: { view: "overview" } })).structuredContent as
        { view: string; module: { tiles: Array<{ id: string }> } };
      expect(overview.view).toBe("overview");
      expect(overview.module.tiles.map(tile => tile.id)).toEqual(expect.arrayContaining(["thermals", "fans"]));
      expect(reads).toBe(1);
      expect((await client.callTool({ name: "observe_printer", arguments: { view: "thermals" } })).structuredContent).toMatchObject({ module: { environment: { state: "known" } } });
      expect((await client.callTool({ name: "observe_printer", arguments: { view: "fans" } })).structuredContent).toMatchObject({ module: { state: "known" } });
      expect(reads).toBe(1);
      const tools = (await client.listTools()).tools;
      expect(tools.map(tool => tool.name).sort()).toEqual([
        "get_u1_camera_frame", "get_u1_status", "observe_printer", "open_printer_camera",
        "refresh_printer_observation", "show_u1_status",
      ]);
    } finally { await client.close(); await server.close(); }
  });

  test("private HTTP shares the environment reader; static and unrelated views acquire none", async () => {
    let reads = 0;
    const server = createServer(createRequestHandler(null, null, { readStatus: async () => ({ status: status(), metadata: {} }),
      readEnvironment: async () => { reads++; return normalizeEnvironmentResponse(raw(), new Date().toISOString()); } }));
    await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
    const origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    try {
      for (const route of ["/health", "/dashboard/", "/dashboard/thermals", "/dashboard/fans", "/dashboard/progress"]) expect((await fetch(origin + route)).status).toBe(200);
      const call = (view: string) => fetch(origin + "/dashboard/tools/call", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: "refresh_printer_observation", arguments: { view } }) });
      await call("progress"); expect(reads).toBe(0);
      expect((await (await call("fans")).json()).structuredContent.module.state).toBe("known");
      expect((await (await call("thermals")).json()).structuredContent.module.environment.state).toBe("known");
      expect(reads).toBe(1);
    } finally { await new Promise<void>(resolve => server.close(() => resolve())); }
  });
});
