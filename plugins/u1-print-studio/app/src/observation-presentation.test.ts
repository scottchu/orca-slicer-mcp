import { describe, expect, test } from "bun:test";

import { createObservationPresentation } from "./observation-presentation.js";
import type { ObservationSnapshot } from "./observation-store.js";
import type { U1Status } from "./u1-status.js";

const status: U1Status = {
  schemaVersion: 1,
  stateVersion: 1,
  observedAt: "2026-08-29T21:40:48.000Z",
  reachable: true,
  state: "printing",
  stateLabel: "Printing",
  progressPercent: 42,
  currentLayer: 21,
  totalLayers: 50,
  elapsedSeconds: 600,
  remainingSeconds: 828,
  refreshAfterSeconds: 90,
  filename: "fixture.gcode",
  activePhysicalTool: 2,
  tools: [{
    physicalTool: 2,
    temperature: 220,
    target: 220,
    state: "ACTIVE",
    active: true,
  }],
  bed: { temperature: 55, target: 55 },
  storage: { active: true, filePosition: 420, fileSize: 1000 },
  printerMessage: null,
  exception: false,
  camera: { available: true, service: "snapshot", targetFps: null },
};

function snapshot(overrides: Partial<ObservationSnapshot> = {}): ObservationSnapshot {
  return {
    schemaVersion: 1,
    observationVersion: 7,
    sourceObservedAt: status.observedAt,
    receivedAt: "2026-08-29T21:40:49.000Z",
    freshness: "fresh",
    connectionEpoch: 3,
    session: {
      identity: null,
      provenance: "external",
      detail: "Observed filename is not correlated",
    },
    capabilityEvidence: {
      progress: "observed",
      thermals: "observed",
      cavity: "advertised",
      heads: "observed",
      materials: "unknown",
      jobs: "observed",
      history: "advertised",
      queue: "advertised",
      fans: "advertised",
      purifier: "advertised",
      bedMesh: "advertised",
    },
    status,
    metadata: {},
    currentJob: {
      state: "known", freshness: "fresh", sourceObservedAt: "2026-08-29T21:40:50.000Z",
      receivedAt: "2026-08-29T21:40:50.000Z", checkedAt: "2026-08-29T21:40:50.000Z",
      printState: { reported: true, value: "printing" },
      filename: { reported: true, value: "fixture.gcode" },
      storageActive: { reported: true, value: true },
      filePositionBytes: { reported: true, value: 420 },
      fileSizeBytes: { reported: true, value: 1000 },
      totalDurationSeconds: { reported: true, value: 600 },
      printDurationSeconds: { reported: true, value: 590 },
      filamentUsedMillimeters: { reported: true, value: 1200 }, reason: null,
    },
    jobHistory: {
      state: "known", freshness: "fresh", sourceObservedAt: "2026-08-29T21:40:51.000Z",
      receivedAt: "2026-08-29T21:40:51.000Z", checkedAt: "2026-08-29T21:40:51.000Z",
      items: [{ position: 1, filename: "history-only.gcode", status: "completed",
        startTime: "2026-08-29T20:00:00.000Z", endTime: "2026-08-29T21:00:00.000Z",
        printDurationSeconds: 3500, totalDurationSeconds: 3600, filamentUsedMillimeters: 1234 }],
      pageCount: 1, reason: null,
    },
    ...overrides,
  };
}

describe("printer observation presentation", () => {
  test("separates independently observed Current Job and History projections", () => {
    for (const freshness of ["fresh", "stale", "offline"] as const) {
      const source = snapshot({ freshness });
      const current = createObservationPresentation(source, "jobs");
      const history = createObservationPresentation(source, "job_history");
      expect(current.module).toMatchObject({ kind: "jobs", filename: { value: "fixture.gcode" } });
      expect(current.module).not.toHaveProperty("history");
      expect(history.module).toMatchObject({ kind: "job_history", state: "known", pageCount: 1,
        items: [{ filename: "history-only.gcode", status: "completed" }],
        provenance: { source: "moonraker", sourceObservedAt: "2026-08-29T21:40:51.000Z" } });
      expect(history.module).not.toHaveProperty("current");
      expect(JSON.stringify(history)).not.toContain("fixture.gcode");
      expect(JSON.stringify(current.module)).not.toContain("history-only.gcode");
      expect(JSON.stringify(history.module)).not.toMatch(/storage|filePosition|fileSize/);
      expect(history.observationVersion).toBe(current.observationVersion);
      expect(history.sourceObservedAt).toBe(current.sourceObservedAt);
      expect(history.freshness).toBe(freshness);
    }
  });

  test("unrequested Current Job remains unknown and does not reuse main status filename", () => {
    const current = createObservationPresentation(snapshot({ currentJob: undefined }), "jobs");
    expect(current.module).toMatchObject({ kind: "jobs", state: "unknown",
      filename: { reported: false, value: null }, reason: "not_requested" });
    expect(current.module).not.toHaveProperty("history");
    expect(JSON.stringify(current.module)).not.toContain("fixture.gcode");
    expect(current.printerState).toBe("printing");
  });

  test("returns only the requested thermal module and shared envelope", () => {
    const result = createObservationPresentation(snapshot(), "thermals");
    expect(result).toMatchObject({
      schemaVersion: 2,
      view: "thermals",
      observationVersion: 7,
      sourceObservedAt: status.observedAt,
      receivedAt: "2026-08-29T21:40:49.000Z",
      freshness: "fresh",
      connectionEpoch: 3,
      session: { identity: null, provenance: "external" },
      module: { kind: "thermals", state: "known" },
    });
    expect(result.module.kind).toBe("thermals");
    if (result.module.kind !== "thermals") throw new Error("wrong module");
    expect(result.module.readings).toContainEqual(expect.objectContaining({
      id: "cavity",
      state: "unknown",
      reportedState: "not_reported",
      capabilityEvidence: "advertised",
      actual: { state: "unknown", value: null },
    }));
    const cavity = result.module.readings.find(reading => reading.id === "cavity")!;
    expect(cavity).not.toHaveProperty("target");
    expect(cavity).not.toHaveProperty("heaterState");
    expect(cavity).not.toHaveProperty("active");
    expect(result.module.readings).toContainEqual(expect.objectContaining({
      id: "heater-bed",
      heaterState: { state: "unknown", value: null },
      active: { state: "unknown", value: null },
    }));
    expect(JSON.stringify(result)).not.toContain('"modules"');
    expect(JSON.stringify(result)).not.toContain('"kind":"progress"');
    expect(JSON.stringify(result)).not.toContain('"actual":{"state":"known","value":0}');
  });

  test("keeps unrequested independent domains unknown", () => {
    const result = createObservationPresentation(snapshot(), "fans");
    expect(result.module).toMatchObject({ kind: "fans", state: "unknown", capabilityEvidence: "unknown", reason: "not_requested" });
    expect(createObservationPresentation(snapshot(), "queue").module).toMatchObject({
      kind: "queue", state: "unknown", capabilityEvidence: "unknown", reason: "not_requested",
    });
  });

  test("keeps overview explicitly deferred", () => {
    expect(createObservationPresentation(snapshot(), "overview").module).toEqual(
      expect.objectContaining({
        kind: "overview",
        state: "unavailable",
        capabilityEvidence: "unsupported",
        status: "deferred",
      })
    );
  });

  test("keeps missing live values unknown and retained values stale", () => {
    const missing = createObservationPresentation(snapshot({
      status: {
        ...status,
        progressPercent: null,
        currentLayer: null,
        totalLayers: null,
        elapsedSeconds: null,
        remainingSeconds: null,
      },
    }), "progress");
    expect(missing.module).toMatchObject({
      kind: "progress",
      state: "unknown",
      fields: {
        percent: { state: "unknown", value: null },
        elapsedSeconds: { state: "unknown", value: null },
      },
    });

    const stale = createObservationPresentation(snapshot({ freshness: "stale" }), "progress");
    expect(stale.module).toMatchObject({
      kind: "progress",
      state: "stale",
      fields: { percent: { state: "stale", value: 42 } },
    });
  });

  test("normalizes untrusted state labels and tool states", () => {
    const hostileStatus = {
      ...status,
      state: "private-hostname.local",
      stateLabel: "private diagnostic",
      tools: status.tools.map((tool) => ({ ...tool, state: "private-tool" })),
    };
    const result = createObservationPresentation(snapshot({ status: hostileStatus }), "heads");
    expect(result.printerState).toBe("unknown");
    expect(result.printerStateLabel).toBe("Unknown");
    expect(JSON.stringify(result)).not.toContain("private");
  });

  test("preserves missing state, active, and storage presence as unknown", () => {
    const missingStatus: U1Status = {
      ...status,
      state: "",
      stateLabel: "",
      tools: [{
        physicalTool: 2,
        temperature: 220,
        target: 220,
        state: null,
        active: null,
      }],
      storage: { active: null, filePosition: null, fileSize: null },
    };
    const heads = createObservationPresentation(snapshot({ status: missingStatus }), "heads");
    expect(heads.printerState).toBe("unknown");
    expect(heads.printerStateLabel).toBe("Unknown");
    expect(heads.module).toMatchObject({
      kind: "heads",
      items: expect.arrayContaining([expect.objectContaining({
        physicalTool: 2,
        active: { state: "unknown", value: null },
        headState: { state: "unknown", value: null },
      })]),
    });
    const jobs = createObservationPresentation(snapshot({ status: missingStatus, currentJob: {
      state: "known", freshness: "fresh", sourceObservedAt: "2026-08-29T21:40:50.000Z",
      receivedAt: "2026-08-29T21:40:50.000Z", checkedAt: "2026-08-29T21:40:50.000Z",
      printState: { reported: false, value: null }, filename: { reported: false, value: null },
      storageActive: { reported: false, value: null }, filePositionBytes: { reported: false, value: null },
      fileSizeBytes: { reported: false, value: null }, totalDurationSeconds: { reported: false, value: null },
      printDurationSeconds: { reported: false, value: null }, filamentUsedMillimeters: { reported: false, value: null }, reason: null,
    } }), "jobs");
    expect(jobs.module).toMatchObject({
      kind: "jobs",
      storageActive: { reported: false, value: null },
      filePositionBytes: { reported: false, value: null },
    });
    expect(jobs).not.toHaveProperty("capabilityEvidence");
  });
});
