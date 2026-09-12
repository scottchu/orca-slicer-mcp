import { createObservationPresentation, type ObservationView } from '../../../src/lib/server/observation-presentation';
import type { ObservationSnapshot } from '../../../src/lib/server/observation-store';
import type { U1Status } from '../../../src/lib/server/u1-status';
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

export const focusedSnapshot = (overrides: Partial<ObservationSnapshot> = {}): ObservationSnapshot => {
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
};
export const focusedResult = (view: ObservationView, overrides: Partial<ObservationSnapshot> = {}) => ({ structuredContent: createObservationPresentation(focusedSnapshot(overrides), view) });
