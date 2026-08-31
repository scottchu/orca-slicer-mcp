import type {
  CapabilityEvidence,
  Freshness,
  ObservationSnapshot,
} from "./observation-store.js";
import { normalizedPrintState, normalizedToolState } from "./u1-status.js";

export const OBSERVATION_VIEWS = [
  "overview", "progress", "thermals", "heads", "jobs", "job_history", "queue", "fans",
  "bed_mesh",
] as const;
export type ObservationView = (typeof OBSERVATION_VIEWS)[number];
export type EvidenceState =
  | "known"
  | "unknown"
  | "unavailable"
  | "unsupported"
  | "stale";

type Provenance = {
  source: "moonraker" | "derived" | "not_observed";
  sourceObservedAt: string | null;
  detail: string;
};
type Field<T> = { state: EvidenceState; value: T | null };
type ModuleBase = {
  kind: ObservationView;
  state: EvidenceState;
  capabilityEvidence: CapabilityEvidence;
  provenance: Provenance;
};

type OverviewModule = ModuleBase & {
  kind: "overview";
  status: "deferred";
  detail: string;
};
type ProgressModule = ModuleBase & {
  kind: "progress";
  fields: {
    percent: Field<number>;
    currentLayer: Field<number>;
    totalLayers: Field<number>;
    elapsedSeconds: Field<number>;
    estimatedRemainingSeconds: Field<number>;
    filename: Field<string>;
  };
};
type ThermalsModule = ModuleBase & {
  kind: "thermals";
  readings: Array<{
    id: string;
    label: string;
    state: EvidenceState;
    capabilityEvidence: CapabilityEvidence;
    actual: Field<number>;
    target: Field<number>;
    heaterState: Field<string>;
    active: Field<boolean>;
    provenance: Provenance;
  }>;
};
type HeadsModule = ModuleBase & {
  kind: "heads";
  items: Array<{
    physicalTool: number;
    state: EvidenceState;
    active: Field<boolean>;
    headState: Field<string>;
    temperature: Field<number>;
    target: Field<number>;
    material: Field<string>;
    color: Field<string>;
    provenance: Provenance;
  }>;
};
type JobsModule = ModuleBase & {
  kind: "jobs";
  current: null | {
    state: EvidenceState;
    filename: Field<string>;
    storageActive: Field<boolean>;
    filePosition: Field<number>;
    fileSize: Field<number>;
    provenance: Provenance;
  };
};
type JobHistoryModule = ModuleBase & {
  kind: "job_history";
  status: "not_implemented";
  items: never[];
};
type QueueModule = ModuleBase & { kind: "queue"; items: never[] };
type FansModule = ModuleBase & {
  kind: "fans";
  items: never[];
  purifier: { state: EvidenceState; capabilityEvidence: CapabilityEvidence };
};
type BedMeshModule = ModuleBase & {
  kind: "bed_mesh";
  profile: null;
  points: never[];
};

export type PrinterObservationPresentation = {
  schemaVersion: 2;
  view: ObservationView;
  observationVersion: number;
  sourceObservedAt: string | null;
  receivedAt: string;
  freshness: Freshness;
  connectionEpoch: number | null;
  reachable: boolean;
  printerState: string;
  printerStateLabel: string;
  refreshAfterSeconds: number;
  session: ObservationSnapshot["session"];
  module:
    | OverviewModule | ProgressModule | ThermalsModule | HeadsModule
    | JobsModule | JobHistoryModule | QueueModule | FansModule | BedMeshModule;
};

function finiteOrNull(value: number | null | undefined): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function labelForState(state: string, reachable: boolean): string {
  if (!reachable) return "Offline";
  return ({
    standby: "Ready", printing: "Printing", paused: "Paused",
    complete: "Complete", cancelled: "Cancelled", error: "Error",
  } as Record<string, string>)[state] ?? "Unknown";
}

function stateForKnown(snapshot: ObservationSnapshot, known: boolean): EvidenceState {
  if (!known) return "unknown";
  return snapshot.freshness === "stale" ? "stale" : "known";
}

function field<T>(snapshot: ObservationSnapshot, value: T | null): Field<T> {
  return { state: stateForKnown(snapshot, value !== null), value };
}

function provenance(
  snapshot: ObservationSnapshot,
  detail: string,
  source: Provenance["source"] = "moonraker"
): Provenance {
  return {
    source,
    sourceObservedAt: source === "not_observed" ? null : snapshot.sourceObservedAt,
    detail,
  };
}

function unknownProvenance(detail: string): Provenance {
  return { source: "not_observed", sourceObservedAt: null, detail };
}

function moduleBase(
  snapshot: ObservationSnapshot,
  kind: ObservationView,
  known: boolean,
  capabilityEvidence: CapabilityEvidence,
  detail: string
): ModuleBase {
  return {
    kind,
    state: stateForKnown(snapshot, known),
    capabilityEvidence,
    provenance: known ? provenance(snapshot, detail) : unknownProvenance(detail),
  };
}

function projectOverview(snapshot: ObservationSnapshot): OverviewModule {
  const detail = "Overview composition is deferred until every focused module is accepted";
  return {
    ...moduleBase(snapshot, "overview", false, "unsupported", detail),
    kind: "overview",
    state: "unavailable",
    status: "deferred",
    detail: "Use one focused view; overview is not accepted yet",
  };
}

function projectProgress(snapshot: ObservationSnapshot): ProgressModule {
  const status = snapshot.status;
  const percent = finiteOrNull(status.progressPercent);
  const elapsed = finiteOrNull(status.elapsedSeconds);
  const known = status.reachable && [
    percent, elapsed, status.currentLayer, status.totalLayers,
  ].some((value) => value !== null);
  return {
    ...moduleBase(snapshot, "progress", known, snapshot.capabilityEvidence.progress,
      "Current Moonraker print status and derived remaining time"),
    kind: "progress",
    fields: {
      percent: field(snapshot, percent),
      currentLayer: field(snapshot, status.currentLayer),
      totalLayers: field(snapshot, status.totalLayers),
      elapsedSeconds: field(snapshot, elapsed),
      estimatedRemainingSeconds: field(snapshot, finiteOrNull(status.remainingSeconds)),
      filename: field(snapshot, status.filename),
    },
  };
}

function projectThermals(snapshot: ObservationSnapshot): ThermalsModule {
  const status = snapshot.status;
  const tools = new Map(status.tools.map((tool) => [tool.physicalTool, tool]));
  const readings: ThermalsModule["readings"] = [1, 2, 3, 4].map((physicalTool) => {
    const tool = tools.get(physicalTool);
    const actual = finiteOrNull(tool?.temperature);
    const target = finiteOrNull(tool?.target);
    const known = status.reachable && (actual !== null || target !== null);
    return {
      id: `tool-${physicalTool}`,
      label: `Tool ${physicalTool}`,
      state: stateForKnown(snapshot, known),
      capabilityEvidence: known ? "observed" : "unknown",
      actual: field(snapshot, actual),
      target: field(snapshot, target),
      heaterState: tool?.state != null
        ? field(snapshot, normalizedToolState(tool.state))
        : field<string>(snapshot, null),
      active: tool ? field(snapshot, tool.active) : field<boolean>(snapshot, null),
      provenance: known
        ? provenance(snapshot, `Moonraker extruder${physicalTool === 1 ? "" : physicalTool - 1}`)
        : unknownProvenance("No current tool thermal reading was normalized"),
    };
  });
  const bedActual = finiteOrNull(status.bed.temperature);
  const bedTarget = finiteOrNull(status.bed.target);
  const bedKnown = status.reachable && (bedActual !== null || bedTarget !== null);
  readings.push({
    id: "heater-bed",
    label: "Heater bed",
    state: stateForKnown(snapshot, bedKnown),
    capabilityEvidence: bedKnown ? "observed" : "unknown",
    actual: field(snapshot, bedActual),
    target: field(snapshot, bedTarget),
    heaterState: field<string>(snapshot, null),
    active: field<boolean>(snapshot, null),
    provenance: bedKnown
      ? provenance(snapshot, "Moonraker heater_bed; heater power/state is not normalized")
      : unknownProvenance("No current bed thermal reading was normalized"),
  });
  readings.push({
    id: "cavity",
    label: "Cavity",
    state: "unknown",
    capabilityEvidence: snapshot.capabilityEvidence.cavity,
    actual: field<number>(snapshot, null),
    target: field<number>(snapshot, null),
    heaterState: field<string>(snapshot, null),
    active: field<boolean>(snapshot, null),
    provenance: unknownProvenance(
      "Cavity telemetry was advertised but has no accepted normalization"
    ),
  });
  const known = readings.some((reading) =>
    reading.state === "known" || reading.state === "stale"
  );
  return {
    ...moduleBase(snapshot, "thermals", known, snapshot.capabilityEvidence.thermals,
      "Four tool slots and heater bed share one cached observation"),
    kind: "thermals",
    readings,
  };
}

function projectHeads(snapshot: ObservationSnapshot): HeadsModule {
  const status = snapshot.status;
  const tools = new Map(status.tools.map((tool) => [tool.physicalTool, tool]));
  const items = [1, 2, 3, 4].map((physicalTool) => {
    const tool = tools.get(physicalTool);
    const temperature = finiteOrNull(tool?.temperature);
    const target = finiteOrNull(tool?.target);
    const known = status.reachable && (temperature !== null || target !== null);
    return {
      physicalTool,
      state: stateForKnown(snapshot, known),
      active: tool ? field(snapshot, tool.active) : field<boolean>(snapshot, null),
      headState: tool?.state != null
        ? field(snapshot, normalizedToolState(tool.state))
        : field<string>(snapshot, null),
      temperature: field(snapshot, temperature),
      target: field(snapshot, target),
      material: field<string>(snapshot, null),
      color: field<string>(snapshot, null),
      provenance: known
        ? provenance(snapshot, "Head state and temperature only; material/color remain unknown")
        : unknownProvenance("No accepted head, material, or color evidence was observed"),
    };
  });
  const known = items.some((item) => item.state === "known" || item.state === "stale");
  return {
    ...moduleBase(snapshot, "heads", known, snapshot.capabilityEvidence.heads,
      "Four physical head slots from one cached observation"),
    kind: "heads",
    items,
  };
}

function projectJobs(snapshot: ObservationSnapshot): JobsModule {
  const status = snapshot.status;
  const known = status.reachable && Boolean(status.filename);
  return {
    ...moduleBase(snapshot, "jobs", known, snapshot.capabilityEvidence.jobs,
      "Current printer job only; prepared-job correlation is not available"),
    kind: "jobs",
    current: known
      ? {
          state: stateForKnown(snapshot, true),
          filename: field(snapshot, status.filename),
          storageActive: field(snapshot, status.storage.active),
          filePosition: field(snapshot, finiteOrNull(status.storage.filePosition)),
          fileSize: field(snapshot, finiteOrNull(status.storage.fileSize)),
          provenance: provenance(snapshot, "Moonraker print_stats and virtual_sdcard"),
        }
      : null,
  };
}

function projectJobHistory(snapshot: ObservationSnapshot): JobHistoryModule {
  return {
    ...moduleBase(snapshot, "job_history", false, snapshot.capabilityEvidence.history,
      "Job history has no implemented read-only normalization"),
    kind: "job_history",
    state: "unknown",
    status: "not_implemented",
    items: [],
  };
}

function projectUnknown(
  snapshot: ObservationSnapshot,
  view: "queue" | "fans" | "bed_mesh"
): QueueModule | FansModule | BedMeshModule {
  const detail = {
    queue: "Queue was advertised but has no accepted read-only normalization",
    fans: "Fans and purifier were advertised but their semantics are not normalized",
    bed_mesh: "Bed mesh was advertised but no accepted profile grid is normalized",
  }[view];
  const capability = view === "bed_mesh"
    ? snapshot.capabilityEvidence.bedMesh
    : snapshot.capabilityEvidence[view];
  const base = {
    ...moduleBase(snapshot, view, false, capability, detail),
    state: "unknown" as const,
  };
  if (view === "queue") return { ...base, kind: "queue", items: [] };
  if (view === "fans") {
    return {
      ...base,
      kind: "fans",
      items: [],
      purifier: {
        state: "unknown",
        capabilityEvidence: snapshot.capabilityEvidence.purifier,
      },
    };
  }
  return { ...base, kind: "bed_mesh", profile: null, points: [] };
}

function projectModule(snapshot: ObservationSnapshot, view: ObservationView) {
  if (view === "overview") return projectOverview(snapshot);
  if (view === "progress") return projectProgress(snapshot);
  if (view === "thermals") return projectThermals(snapshot);
  if (view === "heads") return projectHeads(snapshot);
  if (view === "jobs") return projectJobs(snapshot);
  if (view === "job_history") return projectJobHistory(snapshot);
  return projectUnknown(snapshot, view);
}

export function createObservationPresentation(
  snapshot: ObservationSnapshot,
  view: ObservationView
): PrinterObservationPresentation {
  const status = snapshot.status;
  const printerState = status.reachable
    ? normalizedPrintState(status.state)
    : "offline";
  return {
    schemaVersion: 2,
    view,
    observationVersion: snapshot.observationVersion,
    sourceObservedAt: snapshot.sourceObservedAt,
    receivedAt: snapshot.receivedAt,
    freshness: snapshot.freshness,
    connectionEpoch: snapshot.connectionEpoch,
    reachable: status.reachable,
    printerState,
    printerStateLabel: labelForState(printerState, status.reachable),
    refreshAfterSeconds: status.refreshAfterSeconds,
    session: snapshot.session,
    module: projectModule(snapshot, view),
  };
}
