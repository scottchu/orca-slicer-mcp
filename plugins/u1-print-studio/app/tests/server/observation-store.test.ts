import { describe, expect, test } from "bun:test";

import { PrinterObservationStore } from "../../src/lib/server/observation-store.js";
import type { U1Status } from "../../src/lib/server/u1-status.js";

function status(reachable = true): U1Status {
  return {
    schemaVersion: 1,
    stateVersion: 1,
    observedAt: "2026-08-29T21:40:48.000Z",
    reachable,
    state: reachable ? "printing" : "offline",
    stateLabel: reachable ? "Printing" : "Offline",
    progressPercent: reachable ? 42 : null,
    currentLayer: reachable ? 21 : null,
    totalLayers: reachable ? 50 : null,
    elapsedSeconds: reachable ? 600 : null,
    remainingSeconds: reachable ? 828 : null,
    refreshAfterSeconds: 30,
    filename: reachable ? "fixture.gcode" : null,
    activePhysicalTool: reachable ? 1 : null,
    tools: [],
    bed: { temperature: null, target: null },
    storage: { active: reachable ? false : null, filePosition: null, fileSize: null },
    printerMessage: null,
    exception: false,
    camera: { available: false, service: null, targetFps: null },
  };
}

describe("shared printer observation store", () => {
  test("coalesces cards onto one snapshot identity and read", async () => {
    let reads = 0;
    const store = new PrinterObservationStore(async () => {
      reads += 1;
      await Promise.resolve();
      return { status: status(), metadata: {} };
    }, () => new Date("2026-08-29T21:40:49.000Z"));

    const [progress, thermals, heads] = await Promise.all([
      store.current(), store.current(), store.current({ refresh: true }),
    ]);
    expect(reads).toBe(1);
    expect(new Set([progress.observationVersion, thermals.observationVersion,
      heads.observationVersion])).toEqual(new Set([1]));
    expect(progress.receivedAt).toBe(thermals.receivedAt);
    expect(progress.connectionEpoch).toBe(1);
  });

  test("does not reread for refresh until the shared snapshot is due", async () => {
    let reads = 0;
    let now = new Date("2026-08-29T21:40:49.000Z");
    const store = new PrinterObservationStore(async () => {
      reads += 1;
      return { status: status(), metadata: {} };
    }, () => now);

    const first = await store.current();
    now = new Date("2026-08-29T21:41:00.000Z");
    const shared = await store.current({ refresh: true });
    expect(reads).toBe(1);
    expect(shared.observationVersion).toBe(first.observationVersion);

    now = new Date("2026-08-29T21:41:20.000Z");
    const refreshed = await store.current({ refresh: true });
    expect(reads).toBe(2);
    expect(refreshed.observationVersion).toBe(2);
  });

  test("plain observation is cache-only while explicit refresh captures when due", async () => {
    let reads = 0;
    let now = new Date("2026-08-29T21:40:49.000Z");
    const store = new PrinterObservationStore(async () => {
      reads += 1;
      await Promise.resolve();
      return { status: status(), metadata: {} };
    }, () => now);
    await store.current();
    now = new Date("2026-08-29T21:41:20.000Z");
    const [progress, thermals] = await Promise.all([
      store.current(), store.current(),
    ]);
    expect(reads).toBe(1);
    expect(progress.observationVersion).toBe(1);
    expect(progress.freshness).toBe("stale");
    expect(thermals.observationVersion).toBe(1);

    const [refreshed, shared] = await Promise.all([
      store.current({ refresh: true }), store.current({ refresh: true }),
    ]);
    expect(reads).toBe(2);
    expect(refreshed.observationVersion).toBe(2);
    expect(shared.observationVersion).toBe(2);
  });

  test("marks retained values stale and advances connection epoch on reconnect", async () => {
    let now = new Date("2026-08-29T21:40:49.000Z");
    const results: Array<U1Status | Error> = [
      status(), new Error("temporary read failure"), status(false),
      status(false), status(),
    ];
    const store = new PrinterObservationStore(async () => {
      const result = results.shift()!;
      if (result instanceof Error) throw result;
      return { status: result, metadata: {} };
    }, () => now);

    const first = await store.current();
    now = new Date("2026-08-29T21:41:20.000Z");
    expect((await store.current()).freshness).toBe("stale");
    const failed = await store.current({ refresh: true });
    expect(failed.freshness).toBe("stale");
    const offline = await store.current({ refresh: true });
    expect(offline.freshness).toBe("stale");
    expect(offline.sourceObservedAt).toBe(first.sourceObservedAt);
    expect(offline.status).toMatchObject({
      reachable: false,
      state: "offline",
      stateLabel: "Offline",
      progressPercent: 42,
      filename: "fixture.gcode",
    });
    expect(offline.capabilityEvidence.progress).toBe("observed");
    now = new Date("2026-08-29T21:41:51.000Z");
    const offlineAgain = await store.current({ refresh: true });
    expect(offlineAgain.observationVersion).toBe(offline.observationVersion + 1);
    expect(offlineAgain.freshness).toBe("stale");
    expect(offlineAgain.sourceObservedAt).toBe(first.sourceObservedAt);
    expect(offlineAgain.status).toMatchObject({
      reachable: false,
      state: "offline",
      stateLabel: "Offline",
      progressPercent: 42,
      elapsedSeconds: 600,
      filename: "fixture.gcode",
    });
    expect(offlineAgain.session).toEqual(first.session);
    expect(offlineAgain.capabilityEvidence).toEqual(first.capabilityEvidence);
    now = new Date("2026-08-29T21:42:22.000Z");
    const reconnected = await store.current({ refresh: true });
    expect(first.connectionEpoch).toBe(1);
    expect(reconnected.connectionEpoch).toBe(2);
  });
});
