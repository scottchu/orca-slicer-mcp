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
    ...overrides,
  };
}

describe("printer observation presentation", () => {
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
      capabilityEvidence: "advertised",
      actual: { state: "unknown", value: null },
    }));
    expect(result.module.readings).toContainEqual(expect.objectContaining({
      id: "heater-bed",
      heaterState: { state: "unknown", value: null },
      active: { state: "unknown", value: null },
    }));
    expect(JSON.stringify(result)).not.toContain('"modules"');
    expect(JSON.stringify(result)).not.toContain('"kind":"progress"');
    expect(JSON.stringify(result)).not.toContain('"actual":{"state":"known","value":0}');
  });

  test("marks advertised but unnormalized domains unknown", () => {
    for (const view of ["queue", "fans", "bed_mesh"] as const) {
      const result = createObservationPresentation(snapshot(), view);
      expect(result.module).toMatchObject({
        kind: view,
        state: "unknown",
        capabilityEvidence: "advertised",
      });
    }
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
    const jobs = createObservationPresentation(snapshot({ status: missingStatus }), "jobs");
    expect(jobs.module).toMatchObject({
      kind: "jobs",
      current: {
        storageActive: { state: "unknown", value: null },
        filePosition: { state: "unknown", value: null },
      },
    });
    expect(jobs).not.toHaveProperty("capabilityEvidence");
  });
});
