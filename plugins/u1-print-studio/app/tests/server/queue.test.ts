import { describe, expect, test } from "bun:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createAppServer } from "../../src/lib/server/app.js";
import { normalizeQueueResponse, QUEUE_MAX_VISIBLE_ITEMS } from "../../src/lib/server/adapters/moonraker-queue.js";
import { unavailableQueue } from "../../src/lib/server/application/queue-observation.js";
import { PrinterObservationStore } from "../../src/lib/server/observation-store.js";
import { createObservationPresentation } from "../../src/lib/server/observation-presentation.js";
import type { U1Status } from "../../src/lib/server/u1-status.js";

const receipt = "2026-08-31T12:00:00.000Z";
const status = (): U1Status => ({
  schemaVersion: 1, stateVersion: 1, observedAt: "2026-08-31T11:00:00.000Z", reachable: true,
  state: "standby", stateLabel: "Ready", progressPercent: null, currentLayer: null,
  totalLayers: null, elapsedSeconds: null, remainingSeconds: null, refreshAfterSeconds: 15,
  filename: null, activePhysicalTool: null, tools: [], bed: { temperature: null, target: null },
  storage: { active: null, filePosition: null, fileSize: null }, printerMessage: null,
  exception: false, camera: { available: false, service: null, targetFps: null },
});
const observedQueue = (when: string, count = 2) => normalizeQueueResponse({ result: {
  queue_state: "paused",
  queued_jobs: Array.from({ length: count }, (_, index) => ({
    filename: `/private/fixture-${index}/duplicate.gcode`, time_added: index, time_in_queue: index * 3,
    job_id: `private-${index}`,
  })),
} }, when);

describe("independent shared queue observation", () => {
  test("Queue demand coalesces, ages on its own 15-second clock and retains the last good FIFO after failure", async () => {
    let now = new Date(receipt); let reads = 0; let fail = false;
    const store = new PrinterObservationStore(async () => ({ status: status(), metadata: {} }), () => now,
      undefined, undefined, async () => { reads++; return fail ? unavailableQueue("timeout", now.toISOString()) : observedQueue(now.toISOString()); });
    const [a, b] = await Promise.all([store.current({ includeQueue: true }), store.current({ includeQueue: true })]);
    expect(reads).toBe(1); expect(a.queue).toEqual(b.queue);
    expect(a.queue?.items.map(item => item.filename)).toEqual(["duplicate.gcode", "duplicate.gcode"]);
    await store.current({ refresh: true, includeQueue: true }); expect(reads).toBe(1);
    now = new Date(now.valueOf() + 15_000); fail = true;
    const stale = await store.current({ refresh: true, includeQueue: true });
    expect(reads).toBe(2); expect(stale.queue).toMatchObject({ state: "stale", freshness: "stale", reason: "timeout", totalCount: 2 });
    expect(stale.queue?.sourceObservedAt).toBe(receipt);
    expect(JSON.stringify(stale)).not.toMatch(/private-|fixture-|job_id/);
  });

  test("unrelated domain reads never acquire Queue and injected fixtures never fall through", async () => {
    let reads = 0;
    const store = new PrinterObservationStore(async () => ({ status: status(), metadata: {} }), () => new Date(receipt),
      undefined, undefined, async () => { reads++; return observedQueue(receipt); });
    for (const options of [{}, { includeBedMesh: true }, { includeMaterials: true }]) await store.current(options);
    expect(reads).toBe(0);
    expect((await store.current({ includeQueue: true })).queue?.state).toBe("known"); expect(reads).toBe(1);
    const noReader = await new PrinterObservationStore(async () => ({ status: status(), metadata: {} })).current({ includeQueue: true });
    expect(noReader.queue).toMatchObject({ state: "unknown", reason: "not_requested", sourceObservedAt: null });
  });

  test("projection preserves bounded receipt, state, order, duplicates and truncation without IDs or paths", () => {
    const queue = observedQueue(receipt, QUEUE_MAX_VISIBLE_ITEMS + 1);
    const storeSnapshot: any = {
      schemaVersion: 1, observationVersion: 2, sourceObservedAt: status().observedAt,
      receivedAt: receipt, freshness: "fresh", connectionEpoch: 1,
      session: { identity: null, provenance: "unknown", detail: "fixture" },
      capabilityEvidence: { progress: "unknown", thermals: "unknown", cavity: "advertised", heads: "unknown", materials: "unknown", jobs: "unknown", history: "advertised", queue: "observed", fans: "advertised", purifier: "advertised", bedMesh: "advertised" },
      status: status(), metadata: {}, queue,
    };
    const module = createObservationPresentation(storeSnapshot, "queue").module;
    expect(module).toMatchObject({ kind: "queue", state: "known", queueState: "paused", totalCount: 101, truncated: true, capabilityEvidence: "observed" });
    if (module.kind !== "queue") throw new Error("fixture view");
    expect(module.items).toHaveLength(100); expect(module.items[99]?.position).toBe(100);
    expect(JSON.stringify(module)).not.toMatch(/private-|fixture-|job_id/);
  });
});

describe("queue inbound composition", () => {
  test("only selected Queue acquires queue status through the unchanged closed tool surface", async () => {
    let reads = 0;
    const server = createAppServer({ readStatus: async () => ({ status: status(), metadata: {} }), readQueue: async () => { reads++; return observedQueue(new Date().toISOString()); } });
    const client = new Client({ name: "queue-fixture", version: "1" });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
    try {
      for (const view of ["progress", "thermals", "heads", "bed_mesh", "jobs", "job_history", "fans"] as const) await client.callTool({ name: "open_printer_view", arguments: { view } });
      expect(reads).toBe(0);
      const overview = (await client.callTool({ name: "open_printer_view", arguments: { view: "overview" } })).structuredContent as
        { view: string; module: { tiles: Array<{ id: string }> } };
      expect(overview.view).toBe("overview");
      expect(overview.module.tiles.map(tile => tile.id)).toContain("queue");
      expect(reads).toBe(1);
      const result = await client.callTool({ name: "open_printer_view", arguments: { view: "queue" } });
      expect(result.structuredContent).toMatchObject({ view: "queue", module: { state: "known", queueState: "paused", totalCount: 2 } });
      expect(reads).toBe(1);
      await client.callTool({ name: "refresh_printer_observation", arguments: { view: "queue" } }); expect(reads).toBe(1);
      expect((await client.listTools()).tools.map(tool => tool.name).sort()).toEqual([
        "get_printer_snapshot", "get_u1_camera_frame", "open_printer_camera", "open_printer_view", "refresh_printer_observation",
      ]);
    } finally { await client.close(); await server.close(); }
  });
});
