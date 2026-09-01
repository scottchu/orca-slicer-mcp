import { describe, expect, test } from "bun:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { BED_MESH_MAX_BYTES, BED_MESH_ROUTE, normalizeBedMeshResponse, readMoonrakerBedMesh } from "./adapters/moonraker-bed-mesh.js";
import { unavailableBedMesh } from "./application/bed-mesh-observation.js";
import { PrinterObservationStore } from "./observation-store.js";
import { createObservationPresentation } from "./observation-presentation.js";
import { createAppServer } from "./app.js";
import { createRequestHandler } from "./server.js";
import type { U1Status } from "./u1-status.js";

const receipt = "2026-08-31T12:00:00.000Z";
const raw = (overrides: Record<string, unknown> = {}) => ({ result: { status: { bed_mesh: {
  profile_name: "fixture", mesh_min: [10, 20], mesh_max: [110, 220],
  probed_matrix: [[-0.2, 0, 0.1], [0.3, -0.1, 0.4]], ...overrides,
} } } });
const inactive = () => raw({ profile_name: "", mesh_min: [0, 0], mesh_max: [0, 0], probed_matrix: [[]] });
const status = (reachable = true): U1Status => ({
  schemaVersion: 1, stateVersion: 1, observedAt: "2026-08-31T11:00:00.000Z", reachable,
  state: reachable ? "printing" : "offline", stateLabel: reachable ? "Printing" : "Offline",
  progressPercent: 50, currentLayer: 5, totalLayers: 10, elapsedSeconds: 100,
  remainingSeconds: 100, refreshAfterSeconds: 90, filename: "fixture.gcode", activePhysicalTool: null,
  tools: [], bed: { temperature: null, target: null },
  storage: { active: null, filePosition: null, fileSize: null }, printerMessage: null,
  exception: false, camera: { available: false, service: null, targetFps: null },
});

describe("bounded reported bed-mesh normalization", () => {
  test("uses reported probe rows and XY bounds, never interpolated data", () => {
    const result = normalizeBedMeshResponse(raw({ mesh_matrix: [[999, 999], [999, 999]], profiles: { secret: "private" } }), receipt);
    expect(result).toMatchObject({ state: "known", status: "active", freshness: "fresh",
      sourceObservedAt: receipt, receivedAt: receipt, checkedAt: receipt,
      bounds: { xMin: 10, xMax: 110, yMin: 20, yMax: 220 },
      summary: { rows: 2, columns: 3, min: -0.2, max: 0.4 } });
    expect(result.summary?.range).toBeCloseTo(0.6);
    expect(result.matrix).toEqual([[-0.2, 0, 0.1], [0.3, -0.1, 0.4]]);
    expect(JSON.stringify(result)).not.toMatch(/999|profiles|private|secret|mesh_matrix/);
    expect(normalizeBedMeshResponse(raw({ probed_matrix: undefined, mesh_matrix: [[0, 0], [0, 0]] }), receipt).state).toBe("unavailable");
  });
  test("distinguishes exact inactive, omitted object, zero-valued grid and malformed empty", () => {
    expect(normalizeBedMeshResponse(inactive(), receipt)).toMatchObject({ state: "known", status: "no_active_mesh", matrix: null, summary: null, sourceObservedAt: receipt });
    expect(normalizeBedMeshResponse({ result: { status: {} } }, receipt)).toMatchObject({ state: "unsupported", reason: "not_reported", sourceObservedAt: null });
    expect(normalizeBedMeshResponse(raw({ probed_matrix: [[0, 0], [0, 0]] }), receipt)).toMatchObject({ state: "known", status: "active", summary: { min: 0, max: 0, range: 0 } });
    for (const matrix of [[], [[]], [[], []], [[1]], [[1, 2]], [[1], [2]], [[1, 2], [3]]]) {
      expect(normalizeBedMeshResponse(raw({ probed_matrix: matrix }), receipt).state).toBe("unavailable");
    }
    for (const payload of [null, {}, { result: {} }, { result: { status: { bed_mesh: null } } }]) {
      expect(normalizeBedMeshResponse(payload, receipt).reason).toBe("malformed");
    }
  });
  test("validates every cell, matrix dimensions and extents without truncation", () => {
    const maximum = Array.from({ length: 64 }, () => Array(64).fill(0));
    expect(normalizeBedMeshResponse(raw({ probed_matrix: maximum }), receipt).summary).toMatchObject({ rows: 64, columns: 64 });
    maximum[63]![63] = NaN;
    expect(normalizeBedMeshResponse(raw({ probed_matrix: maximum }), receipt).reason).toBe("malformed");
    for (const value of [NaN, Infinity, -Infinity, 1_000_001, -1_000_001, "0", null]) {
      expect(normalizeBedMeshResponse(raw({ probed_matrix: [[0, 0], [0, value]] }), receipt).reason).toBe("malformed");
    }
    for (const matrix of [Array.from({ length: 65 }, () => [0, 0]), [Array(65).fill(0), Array(65).fill(0)]]) {
      expect(normalizeBedMeshResponse(raw({ probed_matrix: matrix }), receipt).reason).toBe("too_large");
    }
    for (const bounds of [[0], [0, 0, 0], [NaN, 20], [110, 220], [200, 20], [-1_000_001, 0]]) {
      expect(normalizeBedMeshResponse(raw({ mesh_min: bounds }), receipt).state).toBe("unavailable");
    }
    const missing = raw(); delete (missing.result.status.bed_mesh as Record<string, unknown>).profile_name;
    expect(normalizeBedMeshResponse(missing, receipt).reason).toBe("malformed");
  });
  test("omits unsafe profile labels without discarding valid data", () => {
    for (const profile_name of ["/private/profile", "relative/profile", "C:\\profile", "https://private.local", "line\nnext", "a\u061cb", "a\u200eb", "a\u200fb", "a\u202eb", "a\u2066b", "a".repeat(81)]) {
      const result = normalizeBedMeshResponse(raw({ profile_name }), receipt);
      expect(result.state).toBe("known");
      expect(result).not.toHaveProperty("profile");
      expect(JSON.stringify(result)).not.toContain(profile_name);
    }
    expect(normalizeBedMeshResponse(raw({ profile_name: "Fixture 2" }), receipt).profile).toBe("Fixture 2");
  });
});

describe("fixed read-only bed-mesh HTTP adapter", () => {
  test("uses only the closed GET and classifies failures without redirects or raw errors", async () => {
    const requests: string[] = [];
    let code = 200; let body = JSON.stringify(raw());
    const fixture = Bun.serve({ hostname: "127.0.0.1", port: 0, fetch(request) {
      const url = new URL(request.url); requests.push(`${request.method} ${url.pathname}${url.search}`);
      return new Response(body, { status: code, headers: code === 302 ? { location: "/forbidden" } : {} });
    } });
    try {
      expect((await readMoonrakerBedMesh(fixture.url, () => new Date(receipt))).state).toBe("known");
      for (const [statusCode, reason] of [[404, "unsupported"], [405, "unsupported"], [401, "unauthorized"], [403, "unauthorized"], [500, "http_error"], [302, "http_error"]] as const) {
        code = statusCode; body = "private upstream details";
        const result = await readMoonrakerBedMesh(fixture.url);
        expect(result.reason).toBe(reason);
        expect(JSON.stringify(result)).not.toContain(body);
      }
      code = 200; body = "broken json";
      expect((await readMoonrakerBedMesh(fixture.url)).reason).toBe("malformed");
      body = "x".repeat(BED_MESH_MAX_BYTES + 100);
      expect((await readMoonrakerBedMesh(fixture.url)).reason).toBe("too_large");
      expect(new Set(requests)).toEqual(new Set([`GET ${BED_MESH_ROUTE}`]));
      expect(requests).toHaveLength(9);
      expect((await readMoonrakerBedMesh("https://example.com/")).reason).toBe("not_configured");
    } finally { fixture.stop(true); }
  });
});

describe("shared independent bed-mesh observations", () => {
  test("on-demand, bounded, coalesced and cache-only aging with independent status clocks", async () => {
    let now = new Date(receipt); let statusReads = 0; let meshReads = 0;
    const store = new PrinterObservationStore(async () => { statusReads++; return { status: status(), metadata: {} }; }, () => now,
      async () => { meshReads++; await Promise.resolve(); return normalizeBedMeshResponse(raw(), now.toISOString()); });
    const initial = await store.current({ refresh: true });
    expect(meshReads).toBe(0);
    const [a, b] = await Promise.all([store.current({ includeBedMesh: true }), store.current({ includeBedMesh: true })]);
    expect(meshReads).toBe(1); expect(statusReads).toBe(1);
    expect(a.observationVersion).toBe(b.observationVersion);
    expect(a.observationVersion).toBeGreaterThan(initial.observationVersion);
    expect(a.sourceObservedAt).toBe(initial.sourceObservedAt);
    now = new Date(now.valueOf() + 15_000);
    expect((await store.current({ includeBedMesh: true })).bedMesh?.state).toBe("stale");
    expect(meshReads).toBe(1);
    await Promise.all([store.current({ refresh: true, includeBedMesh: true }), store.current({ refresh: true, includeBedMesh: true })]);
    expect(meshReads).toBe(2); expect(statusReads).toBe(1);
    expect((await store.current()).bedMesh?.sourceObservedAt).toBe(now.toISOString());
  });
  test("retains active and inactive success on failure; successful inactive clears the grid", async () => {
    let now = new Date(receipt); let mode = "active";
    const store = new PrinterObservationStore(async () => ({ status: status(), metadata: {} }), () => now,
      async () => mode === "fail" ? unavailableBedMesh("network", now.toISOString()) : normalizeBedMeshResponse(mode === "active" ? raw() : inactive(), now.toISOString()));
    const first = await store.current({ includeBedMesh: true });
    mode = "fail"; now = new Date(now.valueOf() + 15_000);
    const failed = await store.current({ refresh: true, includeBedMesh: true });
    expect(failed.bedMesh).toMatchObject({ state: "stale", status: "active", sourceObservedAt: receipt, receivedAt: receipt, checkedAt: now.toISOString(), reason: "network" });
    expect(failed.bedMesh?.matrix).toEqual(first.bedMesh?.matrix);
    now = new Date(now.valueOf() + 100_000);
    expect((await store.current({ refresh: true })).bedMesh?.state).toBe("stale");
    mode = "inactive";
    const empty = await store.current({ refresh: true, includeBedMesh: true });
    expect(empty.bedMesh).toMatchObject({ state: "known", status: "no_active_mesh", matrix: null });
    mode = "fail"; now = new Date(now.valueOf() + 15_000);
    const retained = await store.current({ refresh: true, includeBedMesh: true });
    expect(retained.bedMesh).toMatchObject({ state: "stale", status: "no_active_mesh", matrix: null, sourceObservedAt: empty.bedMesh!.sourceObservedAt });
  });
  test("concurrent status and mesh completion cannot overwrite either receipt", async () => {
    for (const meshFirst of [true, false]) {
      let releaseStatus!: () => void; let releaseMesh!: () => void;
      const statusReady = new Promise<void>(resolve => { releaseStatus = resolve; });
      const meshReady = new Promise<void>(resolve => { releaseMesh = resolve; });
      const store = new PrinterObservationStore(async () => { await statusReady; return { status: status(false), metadata: {} }; }, () => new Date(receipt),
        async () => { await meshReady; return normalizeBedMeshResponse(raw(), receipt); });
      const waiting = store.current({ includeBedMesh: true });
      (meshFirst ? releaseMesh : releaseStatus)(); await new Promise(resolve => setImmediate(resolve));
      (meshFirst ? releaseStatus : releaseMesh)();
      const result = await waiting;
      expect(result.freshness).toBe("offline");
      expect(result.bedMesh?.freshness).toBe("fresh");
      expect(result.observationVersion).toBe(2);
      const presentation = createObservationPresentation(result, "bed_mesh");
      expect(presentation.module).toMatchObject({ kind: "bed_mesh", sourceObservedAt: receipt, provenance: { sourceObservedAt: receipt } });
      expect(presentation.sourceObservedAt).toBeNull();
      expect(JSON.stringify(createObservationPresentation(result, "progress"))).not.toContain("matrix");
    }
  });
  test("status-only fixtures remain unknown and failing mesh never poisons progress", async () => {
    const unknown = await new PrinterObservationStore(async () => ({ status: status(), metadata: {} })).current({ includeBedMesh: true });
    expect(unknown.bedMesh).toMatchObject({ state: "unknown", reason: "not_requested" });
    const store = new PrinterObservationStore(async () => ({ status: status(), metadata: {} }), undefined, async () => { throw new Error("private data"); });
    const result = await store.current({ includeBedMesh: true });
    expect(result.freshness).toBe("fresh");
    expect(result.bedMesh).toMatchObject({ state: "unavailable", reason: "network" });
    expect(JSON.stringify(result)).not.toContain("private data");
  });
  test("a first status rejection cannot hide an independently fresh mesh", async () => {
    const store = new PrinterObservationStore(async () => { throw new Error("private error"); }, () => new Date(receipt),
      async () => normalizeBedMeshResponse(raw(), receipt));
    const result = await store.current({ includeBedMesh: true });
    expect(result.sourceObservedAt).toBeNull();
    expect(result.freshness).toBe("offline");
    expect(result.bedMesh).toMatchObject({ state: "known", freshness: "fresh", sourceObservedAt: receipt });
    expect(JSON.stringify(result)).not.toContain("private error");
  });
});

describe("bed-mesh inbound composition", () => {
  test("MCP acquires only for selected bed mesh and preserves the closed tool surface", async () => {
    let reads = 0;
    const server = createAppServer({ readStatus: async () => ({ status: status(), metadata: {} }), readBedMesh: async () => { reads++; return normalizeBedMeshResponse(raw(), new Date().toISOString()); } });
    const client = new Client({ name: "bed-mesh-fixture", version: "1" });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
    try {
      for (const view of ["progress", "thermals", "heads", "jobs", "job_history", "queue", "fans"]) await client.callTool({ name: "observe_printer", arguments: { view } });
      expect(reads).toBe(0);
      const overview = (await client.callTool({ name: "observe_printer", arguments: { view: "overview" } })).structuredContent as
        { view: string; module: { tiles: Array<{ id: string }> } };
      expect(overview.view).toBe("overview");
      expect(overview.module.tiles.map(tile => tile.id)).toContain("bed_mesh");
      expect(reads).toBe(1);
      const result = await client.callTool({ name: "observe_printer", arguments: { view: "bed_mesh" } });
      expect(result.structuredContent).toMatchObject({ view: "bed_mesh", module: { status: "active", state: "known" } });
      expect(reads).toBe(1);
      await client.callTool({ name: "refresh_printer_observation", arguments: { view: "bed_mesh" } });
      expect(reads).toBe(1);
      expect((await client.listResources()).resources).toHaveLength(26);
      const tools = (await client.listTools()).tools;
      expect(tools.filter(tool => (tool._meta?.ui as { visibility?: string[] })?.visibility?.includes("app") !== true)).toHaveLength(2);
    } finally { await client.close(); await server.close(); }
  });
  test("private HTTP shares the mesh reader; static/other views acquire none", async () => {
    let reads = 0;
    const server = createServer(createRequestHandler(null, null, {
      readStatus: async () => ({ status: status(), metadata: {} }),
      readBedMesh: async () => { reads++; return normalizeBedMeshResponse(raw(), new Date().toISOString()); },
    }));
    await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
    const origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    try {
      for (const route of ["/health", "/dashboard/", "/dashboard/bed_mesh", "/dashboard/progress"]) expect((await fetch(origin + route)).status).toBe(200);
      const call = (view: string) => fetch(origin + "/dashboard/tools/call", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: "refresh_printer_observation", arguments: { view } }) });
      await call("progress"); expect(reads).toBe(0);
      const result = await (await call("bed_mesh")).json();
      expect(result.structuredContent.module.status).toBe("active");
      await call("bed_mesh"); expect(reads).toBe(1);
    } finally { await new Promise<void>(resolve => server.close(() => resolve())); }
  });
});
