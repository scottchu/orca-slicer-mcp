import { describe, expect, test } from "bun:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";

import { createAppServer } from "../../src/lib/server/app.js";
import {
  CURRENT_JOB_ROUTE, JOB_HISTORY_ROUTE, JOBS_MAX_BYTES,
  normalizeCurrentJobResponse, normalizeJobHistoryResponse,
  readMoonrakerCurrentJob, readMoonrakerJobHistory,
} from "../../src/lib/server/adapters/moonraker-jobs.js";
import { CURRENT_JOB_TTL_MS, unavailableCurrentJob } from "../../src/lib/server/application/current-job-observation.js";
import { JOB_HISTORY_PAGE_SIZE, JOB_HISTORY_TTL_MS, unavailableJobHistory } from "../../src/lib/server/application/job-history-observation.js";
import { createObservationPresentation } from "../../src/lib/server/observation-presentation.js";
import { PrinterObservationStore } from "../../src/lib/server/observation-store.js";
import type { U1Status } from "../../src/lib/server/u1-status.js";

const receipt = "2026-08-31T12:00:00.000Z";
const currentRaw = (printStats: Record<string, unknown> = {}, virtualSd: Record<string, unknown> = {}) => ({
  result: { status: { print_stats: {
    filename: "/private/fixture/current.gcode", state: "printing", total_duration: 20,
    print_duration: 18, filament_used: 12, ...printStats,
  }, virtual_sdcard: { is_active: true, file_position: 10, file_size: 100, ...virtualSd } } },
});
const historyRow = (overrides: Record<string, unknown> = {}) => ({
  filename: "/private/fixture/history.gcode", status: "completed", start_time: 0,
  end_time: 10, print_duration: 8, total_duration: 10, filament_used: 7,
  job_id: "private-id", user: "private-user", metadata: { secret: "synthetic" },
  auxiliary_data: [{ provider: "private" }], exists: true, ...overrides,
});
const historyRaw = (jobs: unknown[] = [historyRow()]) => ({ result: { count: jobs.length, jobs } });
const status = (): U1Status => ({
  schemaVersion: 1, stateVersion: 1, observedAt: "2026-08-31T11:00:00.000Z", reachable: true,
  state: "standby", stateLabel: "Ready", progressPercent: null, currentLayer: null,
  totalLayers: null, elapsedSeconds: null, remainingSeconds: null, refreshAfterSeconds: 15,
  filename: "must-not-be-current.gcode", activePhysicalTool: null, tools: [],
  bed: { temperature: null, target: null }, storage: { active: null, filePosition: null, fileSize: null },
  printerMessage: null, exception: false, camera: { available: false, service: null, targetFps: null },
});

describe("fixed Current Job normalization", () => {
  test("distinguishes lifecycle states, future strings, omitted state, empty filename and zero facts", () => {
    expect(CURRENT_JOB_TTL_MS).toBe(15_000);
    for (const state of ["standby", "printing", "paused", "complete", "error", "cancelled"] as const) {
      expect(normalizeCurrentJobResponse(currentRaw({ state }), receipt)).toMatchObject({
        state: "known", freshness: "fresh", printState: { reported: true, value: state },
        filename: { reported: true, value: "current.gcode" },
      });
    }
    expect(normalizeCurrentJobResponse(currentRaw({ state: "future_state" }), receipt).printState)
      .toEqual({ reported: true, value: "unknown" });
    expect(JSON.stringify(normalizeCurrentJobResponse(currentRaw({ state: "future_state" }), receipt))).not.toContain("future_state");
    expect(normalizeCurrentJobResponse(currentRaw({ state: null }), receipt).printState).toEqual({ reported: false, value: null });
    expect(normalizeCurrentJobResponse(currentRaw({ filename: "", print_duration: 0, filament_used: 0 }, { file_position: 0 }), receipt))
      .toMatchObject({ filename: { reported: true, value: null }, printDurationSeconds: { reported: true, value: 0 },
        filamentUsedMillimeters: { reported: true, value: 0 }, filePositionBytes: { reported: true, value: 0 } });
  });

  test("keeps optional invalid facts not reported and rejects structural or unsafe filename input", () => {
    for (const value of [null, "0", -1, NaN, Infinity, {}, []]) {
      const result = normalizeCurrentJobResponse(currentRaw({ print_duration: value }, { file_size: value }), receipt);
      expect(result).toMatchObject({ state: "known", printDurationSeconds: { reported: false, value: null },
        fileSizeBytes: { reported: false, value: null } });
    }
    for (const payload of [null, {}, { result: {} }, { result: { status: [] } },
      { result: { status: { print_stats: null } } }, { result: { status: { virtual_sdcard: [] } } }]) {
      expect(normalizeCurrentJobResponse(payload, receipt)).toMatchObject({ state: "unavailable", reason: "malformed" });
    }
    const unsafe = ["", "https://fixture.invalid/private.gcode", "Bearer synthetic.gcode",
      `ghp_${"a".repeat(36)}.gcode`, "<script>.gcode", `/${"a".repeat(4097)}`];
    for (const filename of unsafe.slice(1)) {
      const result = normalizeCurrentJobResponse(currentRaw({ filename }), receipt);
      expect(result).toMatchObject({ state: "unavailable", reason: "malformed", sourceObservedAt: null });
      expect(JSON.stringify(result)).not.toContain(filename);
    }
  });

  test("does not infer Current Job activity from a persisted filename or storage flag", () => {
    const standby = normalizeCurrentJobResponse(currentRaw({ state: "standby" }, { is_active: true }), receipt);
    expect(standby).toMatchObject({ printState: { value: "standby" }, filename: { value: "current.gcode" }, storageActive: { value: true } });
    expect(standby).not.toHaveProperty("active");
  });
});

describe("fixed latest-page History normalization", () => {
  test("preserves order, duplicates, status facts and exact page count without private fields", () => {
    expect(JOB_HISTORY_TTL_MS).toBe(15_000); expect(JOB_HISTORY_PAGE_SIZE).toBe(20);
    const statuses = ["in_progress", "completed", "cancelled", "error", "klippy_shutdown", "klippy_disconnect", "interrupted", "future_status"];
    const result = normalizeJobHistoryResponse(historyRaw(statuses.map((status, index) => historyRow({
      filename: `/private/${index}/duplicate.gcode`, status, end_time: index === 0 ? null : index,
    }))), receipt);
    expect(result.state).toBe("known"); expect(result.pageCount).toBe(8);
    expect(result.items.map(item => item.position)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(result.items.map(item => item.filename)).toEqual(Array(8).fill("duplicate.gcode"));
    expect(result.items.map(item => String(item.status))).toEqual([...statuses.slice(0, 7), "unknown"]);
    expect(result.items[0]?.endTime).toBeNull();
    expect(JSON.stringify(result)).not.toMatch(/private-id|private-user|metadata|auxiliary|exists|future_status|secret|provider/);
  });

  test("accepts observed zero and exactly 20 rows but rejects count mismatch, overflow and unsafe rows", () => {
    expect(normalizeJobHistoryResponse(historyRaw([]), receipt)).toMatchObject({ state: "known", pageCount: 0, items: [] });
    const twenty = Array.from({ length: 20 }, (_, index) => historyRow({ filename: `job ${index}.gcode` }));
    expect(normalizeJobHistoryResponse(historyRaw(twenty), receipt)).toMatchObject({ state: "known", pageCount: 20 });
    for (const payload of [
      { result: { count: 1, jobs: [] } }, historyRaw([...twenty, historyRow()]),
      historyRaw([null]), historyRaw([historyRow({ filename: "https://fixture.invalid/job.gcode" })]),
      { result: { count: "1", jobs: [historyRow()] } }, { result: { count: 0, jobs: null } },
    ]) expect(normalizeJobHistoryResponse(payload, receipt)).toMatchObject({ state: "unavailable", reason: expect.any(String), items: [], pageCount: null });
  });

  test("normalizes bounded Unix seconds and optional numeric facts without inventing end time", () => {
    const item = normalizeJobHistoryResponse(historyRaw([historyRow({ start_time: 0, end_time: null,
      print_duration: null, total_duration: -1, filament_used: "7" })]), receipt).items[0]!;
    expect(item).toEqual({ position: 1, filename: "history.gcode", status: "completed",
      startTime: "1970-01-01T00:00:00.000Z", endTime: null,
      printDurationSeconds: null, totalDurationSeconds: null, filamentUsedMillimeters: null });
    expect(normalizeJobHistoryResponse(historyRaw([historyRow({ start_time: 253_402_300_799 })]), receipt).items[0]?.startTime).not.toBeNull();
    expect(normalizeJobHistoryResponse(historyRaw([historyRow({ start_time: 253_402_300_800 })]), receipt).items[0]?.startTime).toBeNull();
  });
});

describe("fixed read-only job HTTP adapters", () => {
  test("issue only the two exact GETs and classify auth, unsupported, redirects and malformed responses", async () => {
    const requests: string[] = []; let code = 200; let body = JSON.stringify(currentRaw());
    const fixture = Bun.serve({ hostname: "127.0.0.1", port: 0, fetch(request) {
      const url = new URL(request.url); requests.push(`${request.method} ${url.pathname}${url.search}`);
      expect(request.headers.get("authorization")).toBeNull();
      return new Response(body, { status: code, headers: code === 302 ? { location: "/forbidden" } : {} });
    } });
    try {
      expect((await readMoonrakerCurrentJob(fixture.url, () => new Date(receipt))).state).toBe("known");
      body = JSON.stringify(historyRaw());
      expect((await readMoonrakerJobHistory(fixture.url, () => new Date(receipt))).state).toBe("known");
      for (const [statusCode, reason] of [[404, "unsupported"], [405, "unsupported"], [401, "unauthorized"],
        [403, "unauthorized"], [500, "http_error"], [302, "http_error"]] as const) {
        code = statusCode; body = "private upstream path /home/fixture?credential=synthetic";
        const result = await readMoonrakerCurrentJob(fixture.url, () => new Date(receipt));
        expect(result.reason).toBe(reason); expect(JSON.stringify(result)).not.toMatch(/private|credential|synthetic|home/);
      }
      code = 200; body = "broken json";
      expect((await readMoonrakerJobHistory(fixture.url, () => new Date(receipt))).reason).toBe("malformed");
      body = "x".repeat(JOBS_MAX_BYTES + 1);
      expect((await readMoonrakerJobHistory(fixture.url, () => new Date(receipt))).reason).toBe("too_large");
      expect(new Set(requests)).toEqual(new Set([`GET ${CURRENT_JOB_ROUTE}`, `GET ${JOB_HISTORY_ROUTE}`]));
    } finally { fixture.stop(true); }
  });

  test("rejects non-loopback and arbitrary base paths before contact", async () => {
    for (const url of ["https://example.com/", "file:///private/fixture", "not a URL", "http://127.0.0.1:9/arbitrary"])
      expect(await readMoonrakerCurrentJob(url, () => new Date(receipt))).toMatchObject({ state: "unavailable", reason: "not_configured" });
  });
});

describe("independent Current Job and History observations", () => {
  test("coalesces and ages each domain independently, retaining the last good facts after failure", async () => {
    let now = new Date(receipt); let currentReads = 0; let historyReads = 0; let failCurrent = false;
    const store = new PrinterObservationStore(async () => ({ status: status(), metadata: {} }), () => now,
      undefined, undefined, undefined, undefined,
      async () => { currentReads++; return failCurrent ? unavailableCurrentJob("timeout", now.toISOString()) : normalizeCurrentJobResponse(currentRaw(), now.toISOString()); },
      async () => { historyReads++; return normalizeJobHistoryResponse(historyRaw(), now.toISOString()); });
    const [a, b] = await Promise.all([store.current({ includeCurrentJob: true }), store.current({ includeCurrentJob: true })]);
    expect(currentReads).toBe(1); expect(historyReads).toBe(0); expect(a.currentJob).toEqual(b.currentJob);
    await store.current({ refresh: true, includeCurrentJob: true }); expect(currentReads).toBe(1);
    now = new Date(now.valueOf() + 15_000); failCurrent = true;
    const stale = await store.current({ refresh: true, includeCurrentJob: true });
    expect(currentReads).toBe(2); expect(stale.currentJob).toMatchObject({ state: "stale", freshness: "stale",
      sourceObservedAt: receipt, checkedAt: now.toISOString(), reason: "timeout", filename: { value: "current.gcode" } });
    expect(historyReads).toBe(0);
    expect((await store.current({ includeJobHistory: true })).jobHistory).toMatchObject({ state: "known", pageCount: 1 });
    expect(historyReads).toBe(1);
  });

  test("projects only the selected domain and never reuses the main status filename", async () => {
    const store = new PrinterObservationStore(async () => ({ status: status(), metadata: {} }), () => new Date(receipt),
      undefined, undefined, undefined, undefined,
      async () => normalizeCurrentJobResponse(currentRaw(), receipt),
      async () => normalizeJobHistoryResponse(historyRaw(), receipt));
    const empty = await store.current();
    expect(empty.currentJob).toMatchObject({ state: "unknown", reason: "not_requested" });
    expect(empty.jobHistory).toMatchObject({ state: "unknown", reason: "not_requested" });
    const current = createObservationPresentation(await store.current({ includeCurrentJob: true }), "jobs");
    expect(current.module).toMatchObject({ kind: "jobs", filename: { value: "current.gcode" } });
    expect(JSON.stringify(current.module)).not.toMatch(/must-not-be-current|history\.gcode/);
    const history = createObservationPresentation(await store.current({ includeJobHistory: true }), "job_history");
    expect(history.module).toMatchObject({ kind: "job_history", pageCount: 1, items: [{ filename: "history.gcode" }] });
    expect(JSON.stringify(history.module)).not.toMatch(/must-not-be-current|current\.gcode/);
  });
});

describe("Current Job and History inbound composition", () => {
  test("acquires only the selected fixed domain through the unchanged closed tool surface", async () => {
    let currentReads = 0; let historyReads = 0;
    const server = createAppServer({ readStatus: async () => ({ status: status(), metadata: {} }),
      readCurrentJob: async () => { currentReads++; return normalizeCurrentJobResponse(currentRaw(), new Date().toISOString()); },
      readJobHistory: async () => { historyReads++; return normalizeJobHistoryResponse(historyRaw(), new Date().toISOString()); } });
    const client = new Client({ name: "jobs-fixture", version: "1" });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
    try {
      for (const view of ["progress", "thermals", "heads", "queue", "fans", "bed_mesh"] as const)
        await client.callTool({ name: "observe_printer", arguments: { view } });
      expect(currentReads).toBe(0); expect(historyReads).toBe(0);
      const overview = (await client.callTool({ name: "observe_printer", arguments: { view: "overview" } })).structuredContent as
        { view: string; module: { tiles: Array<{ id: string }> } };
      expect(overview.view).toBe("overview");
      expect(overview.module.tiles.map(tile => tile.id)).toEqual(expect.arrayContaining(["jobs", "job_history"]));
      expect(currentReads).toBe(1); expect(historyReads).toBe(1);
      expect((await client.callTool({ name: "observe_printer", arguments: { view: "jobs" } })).structuredContent)
        .toMatchObject({ view: "jobs", module: { state: "known", filename: { value: "current.gcode" } } });
      expect(currentReads).toBe(1); expect(historyReads).toBe(1);
      expect((await client.callTool({ name: "observe_printer", arguments: { view: "job_history" } })).structuredContent)
        .toMatchObject({ view: "job_history", module: { state: "known", pageCount: 1 } });
      expect(currentReads).toBe(1); expect(historyReads).toBe(1);
      expect((await client.listTools()).tools.map(tool => tool.name).sort()).toEqual([
        "get_u1_camera_frame", "observe_printer", "open_printer_camera",
        "refresh_printer_observation",
      ]);
    } finally { await client.close(); await server.close(); }
  });
});
