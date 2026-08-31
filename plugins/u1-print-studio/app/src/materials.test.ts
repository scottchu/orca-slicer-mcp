import { describe, expect, test } from "bun:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { MATERIALS_MAX_BYTES, MATERIALS_ROUTE, normalizeMaterialResponse, readMoonrakerMaterials } from "./adapters/moonraker-materials.js";
import { unavailableMaterials } from "./application/material-observation.js";
import { PrinterObservationStore } from "./observation-store.js";
import { createObservationPresentation } from "./observation-presentation.js";
import { createAppServer } from "./app.js";
import { createRequestHandler } from "./server.js";
import type { U1Status } from "./u1-status.js";

const receipt = "2026-08-31T12:00:00.000Z";
const raw = (overrides: Record<string, unknown> = {}) => ({ result: { status: { print_task_config: {
  filament_exist: [true, false, true, true],
  filament_vendor: ["Fixture", "NONE", "Generic", "Other"],
  filament_type: ["PLA", "NONE", "PETG", "ABS"],
  filament_sub_type: ["Matte", "NONE", "", "Plus"],
  filament_color_rgba: ["ff0000ff", "00000000", "abcdef80", "000000ff"],
  ...overrides,
} } } });
const status = (observedAt = "2026-08-31T11:00:00.000Z"): U1Status => ({
  schemaVersion: 1, stateVersion: 1, observedAt, reachable: true,
  state: "printing", stateLabel: "Printing", progressPercent: 50,
  currentLayer: 5, totalLayers: 10, elapsedSeconds: 100, remainingSeconds: 100,
  refreshAfterSeconds: 15, filename: "fixture.gcode", activePhysicalTool: 1,
  tools: [{ physicalTool: 1, temperature: 210, target: 220, active: true, state: "ACTIVE" }],
  bed: { temperature: 60, target: 60 }, storage: { active: true, filePosition: null, fileSize: null },
  printerMessage: null, exception: false, camera: { available: false, service: null, targetFps: null },
});

describe("bounded printer-reported material normalization", () => {
  test("preserves four physical positions, metadata and boolean presence without remapping or profiles", () => {
    const result = normalizeMaterialResponse(raw({ extruder_map_table: [3, 2, 1, 0],
      filament_sku: ["private-sku"], printer_host: "private.local", credentials: "private-secret" }), receipt);
    expect(result).toMatchObject({ state: "known", freshness: "fresh", sourceObservedAt: receipt, receivedAt: receipt, checkedAt: receipt });
    expect(result.items).toEqual([
      { physicalTool: 1, vendor: "Fixture", type: "PLA", subtype: "Matte", color: "#FF0000FF", reportedPresence: true },
      { physicalTool: 2, vendor: null, type: null, subtype: null, color: "#00000000", reportedPresence: false },
      { physicalTool: 3, vendor: "Generic", type: "PETG", subtype: null, color: "#ABCDEF80", reportedPresence: true },
      { physicalTool: 4, vendor: "Other", type: "ABS", subtype: "Plus", color: "#000000FF", reportedPresence: true },
    ]);
    expect(JSON.stringify(result)).not.toMatch(/private|extruder_map|filament_sku|credentials|printer_host/);
  });

  test("missing fields/short arrays stay in position and unknown presence never discards metadata", () => {
    const result = normalizeMaterialResponse({ result: { status: { print_task_config: {
      filament_type: ["PLA", null, "PETG"], filament_exist: [null, false, 1, "true"],
    } } } }, receipt);
    expect(result.state).toBe("known");
    expect(result.items.map(item => item.type)).toEqual(["PLA", null, "PETG", null]);
    expect(result.items.map(item => item.reportedPresence)).toEqual([null, false, null, null]);
    expect(result.items.every(item => item.vendor === null && item.color === null)).toBe(true);
    expect(normalizeMaterialResponse(raw({ filament_exist: [0, 1, false, true] }), receipt).items.map(item => item.reportedPresence)).toEqual([null, null, false, true]);
    const none = normalizeMaterialResponse(raw({ filament_type: ["NONE", "unknown", " null ", ""], filament_vendor: ["NONE"], filament_color_rgba: [] }), receipt);
    expect(none.items.map(item => item.type)).toEqual([null, null, null, null]);
    expect(none.items.every(item => item.color === null)).toBe(true);
  });

  test("validates RGBA precedence, legacy numeric lower24 and strict hex, never default white", () => {
    const legacy = normalizeMaterialResponse(raw({ filament_color_rgba: [], filament_color: [0, 0xffffffff, "aabbcc", "abcdef80"] }), receipt);
    expect(legacy.items.map(item => item.color)).toEqual(["#000000", "#FFFFFF", "#AABBCC", null]);
    for (const value of [-1, 0x100000000, 1.5, NaN, Infinity, "#ff0000", "fff", "red", "url(https://private)", "000000;display:none", "000000ff\n", null]) {
      expect(normalizeMaterialResponse(raw({ filament_color_rgba: [], filament_color: [value] }), receipt).items[0]?.color).toBeNull();
    }
    const authoritative = normalizeMaterialResponse(raw({ filament_color_rgba: ["bad", "112233ff"], filament_color: [0xff0000, 0xff0000, 0xff0000] }), receipt);
    expect(authoritative.items.map(item => item.color)).toEqual([null, "#112233FF", null, null]);
  });

  test("rejects unsafe labels and malformed array shapes without raw errors or aliases", () => {
    for (const value of ["/private/profile", "relative/path", "C:\\private", "https://private.local", "192.168.1.2", "private.local", "printer.example.com", "sk-proj-abc123", "api_key_secret", "Bearer abc123", "Basic YWJjOmRlZg", "ghp_0123456789abcdefghijklmnopqrstuvwxyz", "github_pat_0123456789abcdef", "AKIAIOSFODNN7EXAMPLE", "label\nnext", "a\u202eb", "<img>", "a".repeat(65), {}, 123]) {
      const item = normalizeMaterialResponse(raw({ filament_vendor: [value], filament_type: [value], filament_sub_type: [value] }), receipt).items[0];
      expect(item).toMatchObject({ vendor: null, type: null, subtype: null });
    }
    expect(normalizeMaterialResponse(raw({ filament_vendor: ["  Fixture Brand  "] }), receipt).items[0]?.vendor).toBe("Fixture Brand");
    for (const value of [null, {}, "PLA", [1, 2, 3, 4, 5]]) {
      expect(normalizeMaterialResponse(raw({ filament_type: value }), receipt).reason).toBe("malformed");
    }
    for (const payload of [null, {}, { result: { status: { print_task_config: null } } }]) {
      expect(normalizeMaterialResponse(payload, receipt).state).toBe("unavailable");
    }
    for (const payload of [{ result: { status: {} } }, { result: { status: { print_task_config: {} } } }, { result: { status: { print_task_config: { vendor: ["Not the raw field"] } } } }, { result: { status: { print_task_config: { filament_type: [] } } } }]) {
      expect(normalizeMaterialResponse(payload, receipt)).toMatchObject({ state: "unknown", reason: "not_reported", sourceObservedAt: null });
    }
  });
});

describe("closed read-only material HTTP adapter", () => {
  test("one allowlisted GET bounds response and failures; redirects and details do not escape", async () => {
    const requests: string[] = []; let code = 200; let body = JSON.stringify(raw());
    const fixture = Bun.serve({ hostname: "127.0.0.1", port: 0, fetch(request) {
      const url = new URL(request.url); requests.push(`${request.method} ${url.pathname}${url.search}`);
      return new Response(body, { status: code, headers: code === 302 ? { location: "/forbidden" } : {} });
    } });
    try {
      expect((await readMoonrakerMaterials(fixture.url, () => new Date(receipt))).state).toBe("known");
      for (const [statusCode, reason] of [[404, "unsupported"], [405, "unsupported"], [401, "unauthorized"], [403, "unauthorized"], [500, "http_error"], [302, "http_error"]] as const) {
        code = statusCode; body = "private upstream details";
        const result = await readMoonrakerMaterials(fixture.url);
        expect(result.reason).toBe(reason); expect(JSON.stringify(result)).not.toContain(body);
      }
      code = 200; body = "broken json";
      expect((await readMoonrakerMaterials(fixture.url)).reason).toBe("malformed");
      body = "x".repeat(MATERIALS_MAX_BYTES + 100);
      expect((await readMoonrakerMaterials(fixture.url)).reason).toBe("too_large");
      expect(new Set(requests)).toEqual(new Set([`GET ${MATERIALS_ROUTE}`]));
      expect(requests).toHaveLength(9);
      expect((await readMoonrakerMaterials("https://example.com/")).reason).toBe("not_configured");
    } finally { fixture.stop(true); }
  });
});

describe("independent shared material observation", () => {
  test("Heads demand coalesces, cached reads age without requests and due refresh uses its own clock", async () => {
    let now = new Date(receipt); let statusReads = 0; let reads = 0;
    const store = new PrinterObservationStore(async () => { statusReads++; return { status: status(), metadata: {} }; }, () => now, undefined,
      async () => { reads++; await Promise.resolve(); return normalizeMaterialResponse(raw(), now.toISOString()); });
    const initial = await store.current({ refresh: true }); expect(reads).toBe(0);
    const [a, b] = await Promise.all([store.current({ includeMaterials: true }), store.current({ includeMaterials: true })]);
    expect(reads).toBe(1); expect(statusReads).toBe(1);
    expect(a.observationVersion).toBe(b.observationVersion); expect(a.observationVersion).toBeGreaterThan(initial.observationVersion);
    expect(a.sourceObservedAt).toBe(initial.sourceObservedAt);
    now = new Date(now.valueOf() + 15_000);
    expect((await store.current({ includeMaterials: true })).materials?.state).toBe("stale"); expect(reads).toBe(1);
    await Promise.all([store.current({ refresh: true, includeMaterials: true }), store.current({ refresh: true, includeMaterials: true })]);
    expect(reads).toBe(2); expect(statusReads).toBe(2);
    expect((await store.current()).materials?.sourceObservedAt).toBe(now.toISOString());
  });

  test("failed optional refresh retains stale materials despite fresh thermals, then successful absence clears old metadata", async () => {
    let now = new Date(receipt); let mode = "known";
    const store = new PrinterObservationStore(async () => ({ status: status(now.toISOString()), metadata: {} }), () => now, undefined,
      async () => mode === "fail" ? unavailableMaterials("network", now.toISOString()) : normalizeMaterialResponse(mode === "known" ? raw() : raw({ filament_exist: [false, false, false, false], filament_type: ["NONE"], filament_vendor: ["NONE"], filament_sub_type: ["NONE"], filament_color_rgba: [] }), now.toISOString()));
    await store.current({ includeMaterials: true }); mode = "fail"; now = new Date(now.valueOf() + 15_000);
    const failed = await store.current({ refresh: true, includeMaterials: true });
    expect(failed.freshness).toBe("fresh"); expect(failed.sourceObservedAt).toBe(now.toISOString());
    expect(failed.materials).toMatchObject({ state: "stale", sourceObservedAt: receipt, receivedAt: receipt, checkedAt: now.toISOString(), reason: "network" });
    const heads = createObservationPresentation(failed, "heads").module;
    if (heads.kind !== "heads") throw new Error("fixture view");
    expect(heads.items[0]).toMatchObject({ temperature: { state: "known" }, material: { state: "stale", value: "Fixture PLA Matte" }, materialProvenance: { sourceObservedAt: receipt } });
    expect(JSON.stringify(createObservationPresentation(failed, "progress"))).not.toMatch(/Fixture|reportedPresence|materialProvenance/);
    now = new Date(now.valueOf() + 15_000); mode = "none";
    const cleared = await store.current({ refresh: true, includeMaterials: true });
    expect(cleared.materials?.state).toBe("known");
    expect(cleared.materials?.items.every(item => item.type === null && item.vendor === null && item.color === null && item.reportedPresence === false)).toBe(true);
  });

  test("first optional failures cannot poison status; fixtures never fall back to live reads", async () => {
    const store = new PrinterObservationStore(async () => ({ status: status(), metadata: {} }), undefined, undefined, async () => { throw new Error("private error"); });
    const failed = await store.current({ includeMaterials: true });
    expect(failed.freshness).toBe("fresh"); expect(failed.materials).toMatchObject({ state: "unavailable", reason: "network" });
    expect(JSON.stringify(failed)).not.toContain("private error");
    const noReader = await new PrinterObservationStore(async () => ({ status: status(), metadata: {} })).current({ includeMaterials: true });
    expect(noReader.materials).toMatchObject({ state: "unknown", sourceObservedAt: null });
  });

  test("either completion order and status rejection preserve independently acquired material", async () => {
    for (const materialsFirst of [true, false]) {
      let releaseStatus!: () => void; let releaseMaterials!: () => void;
      const statusReady = new Promise<void>(resolve => { releaseStatus = resolve; });
      const materialsReady = new Promise<void>(resolve => { releaseMaterials = resolve; });
      const store = new PrinterObservationStore(async () => { await statusReady; throw new Error("private error"); }, () => new Date(receipt), undefined,
        async () => { await materialsReady; return normalizeMaterialResponse(raw(), receipt); });
      const waiting = store.current({ includeMaterials: true });
      (materialsFirst ? releaseMaterials : releaseStatus)(); await new Promise(resolve => setImmediate(resolve));
      (materialsFirst ? releaseStatus : releaseMaterials)();
      const result = await waiting;
      expect(result.freshness).toBe("offline"); expect(result.sourceObservedAt).toBeNull();
      expect(result.materials).toMatchObject({ state: "known", freshness: "fresh", sourceObservedAt: receipt });
      expect(result.observationVersion).toBe(2);
      const heads = createObservationPresentation(result, "heads").module;
      if (heads.kind !== "heads") throw new Error("fixture view");
      expect(heads.items[0]?.material).toMatchObject({ state: "known", value: "Fixture PLA Matte" });
      expect(JSON.stringify(result)).not.toContain("private error");
    }
  });
});

describe("material inbound composition", () => {
  test("MCP only selected Heads acquires materials with unchanged closed tools", async () => {
    let reads = 0;
    const server = createAppServer({ readStatus: async () => ({ status: status(), metadata: {} }), readMaterials: async () => { reads++; return normalizeMaterialResponse(raw(), new Date().toISOString()); } });
    const client = new Client({ name: "material-fixture", version: "1" });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
    try {
      for (const view of ["progress", "thermals", "bed_mesh", "jobs", "job_history", "queue", "fans"]) await client.callTool({ name: "observe_printer", arguments: { view } });
      expect(reads).toBe(0);
      const overview = await client.callTool({ name: "observe_printer", arguments: { view: "overview" } });
      const overviewContent = overview.structuredContent as { view: string; module: { tiles: Array<{ id: string }> } };
      expect(overviewContent.view).toBe("overview");
      expect(overviewContent.module.tiles.map(tile => tile.id)).toContain("heads");
      expect(reads).toBe(1);
      const result = await client.callTool({ name: "observe_printer", arguments: { view: "heads" } });
      expect(result.structuredContent).toMatchObject({ view: "heads", module: { materials: { state: "known" } } });
      const module = (result.structuredContent as { module: { items: unknown[] } }).module;
      expect(module.items).toHaveLength(4);
      expect(module.items[0]).toMatchObject({ physicalTool: 1, material: { value: "Fixture PLA Matte" } });
      expect(reads).toBe(1);
      await client.callTool({ name: "refresh_printer_observation", arguments: { view: "heads" } }); expect(reads).toBe(1);
      expect((await client.listTools()).tools.map(tool => tool.name).sort()).toEqual([
        "get_u1_camera_frame", "get_u1_status", "observe_printer", "open_printer_camera", "refresh_printer_observation", "show_u1_status",
      ]);
      expect((await client.callTool({ name: "observe_printer", arguments: { view: "filament_sync" } })).isError).toBe(true);
    } finally { await client.close(); await server.close(); }
  });

  test("HTTP static/other views acquire no material; requests share the one store", async () => {
    let reads = 0;
    const server = createServer(createRequestHandler(null, null, {
      readStatus: async () => ({ status: status(), metadata: {} }),
      readMaterials: async () => { reads++; return normalizeMaterialResponse(raw(), new Date().toISOString()); },
    }));
    await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
    const origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    try {
      for (const route of ["/health", "/dashboard/", "/dashboard/heads", "/dashboard/progress"]) expect((await fetch(origin + route)).status).toBe(200);
      const call = (view: string) => fetch(origin + "/dashboard/tools/call", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: "refresh_printer_observation", arguments: { view } }) });
      await call("progress"); expect(reads).toBe(0);
      const result = await (await call("heads")).json(); expect(result.structuredContent.module.materials.state).toBe("known");
      await call("heads"); expect(reads).toBe(1);
    } finally { await new Promise<void>(resolve => server.close(() => resolve())); }
  });
});
