import type {
  CapabilityEvidence,
  Freshness,
  ObservationSnapshot,
} from "./observation-store.js";
import { normalizedPrintState, normalizedToolState } from "./u1-status.js";
import { unavailableBedMesh, type BedMeshObservation } from "./application/bed-mesh-observation.js";
import { unavailableMaterials, type MaterialObservation } from "./application/material-observation.js";
import { unavailableQueue, type QueueObservation } from "./application/queue-observation.js";
import { unavailableEnvironment, type EnvironmentFan, type EnvironmentObservation } from "./application/environment-observation.js";
import { unavailableCurrentJob, type CurrentJobObservation } from "./application/current-job-observation.js";
import { unavailableJobHistory, type JobHistoryObservation } from "./application/job-history-observation.js";

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

type OverviewCoverage = "complete" | "partial" | "none";
type OverviewReceipt = {
  state: EvidenceState;
  sourceObservedAt: string | null;
  freshness: Freshness;
  reason?: string | null;
};
type OverviewTileBase = {
  state: EvidenceState;
};
type OverviewModule = ModuleBase & {
  kind: "overview";
  coverage: OverviewCoverage;
  tiles: [
    OverviewTileBase & {
      id: "progress";
      receipts: { status: OverviewReceipt };
      printState: string;
      percent: number | null;
      currentLayer: number | null;
      totalLayers: number | null;
      estimatedRemainingSeconds: number | null;
    },
    OverviewTileBase & {
      id: "thermals";
      receipts: { status: OverviewReceipt; environment: OverviewReceipt };
      activeTool: number | null;
      activeActualC: number | null;
      activeTargetC: number | null;
      bedActualC: number | null;
      bedTargetC: number | null;
      cavityActualC: number | null;
    },
    OverviewTileBase & {
      id: "heads";
      receipts: { status: OverviewReceipt; materials: OverviewReceipt };
      activeTool: number | null;
      material: string | null;
      color: string | null;
      reportedPresence: boolean | null;
    },
    OverviewTileBase & {
      id: "jobs";
      receipts: { currentJob: OverviewReceipt };
      printState: CurrentJobObservation["printState"]["value"];
      storageActive: boolean | null;
    },
    OverviewTileBase & {
      id: "job_history";
      receipts: { jobHistory: OverviewReceipt };
      pageCount: number | null;
      statusCounts: Record<JobHistoryObservation["items"][number]["status"], number> | null;
    },
    OverviewTileBase & {
      id: "queue";
      receipts: { queue: OverviewReceipt };
      queueState: QueueObservation["queueState"];
      totalCount: number | null;
    },
    OverviewTileBase & {
      id: "fans";
      receipts: { environment: OverviewReceipt };
      reportedFanCount: number | null;
      purifierPowerDetected: boolean | null;
      purifierMode: EnvironmentObservation["purifier"]["mode"];
    },
    OverviewTileBase & {
      id: "bed_mesh";
      receipts: { bedMesh: OverviewReceipt };
      active: boolean | null;
      rows: number | null;
      columns: number | null;
      rangeMillimeters: number | null;
    },
  ];
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
  environment: Pick<EnvironmentObservation, "state" | "freshness" | "sourceObservedAt" | "receivedAt" | "checkedAt" | "reason">;
  readings: Array<{
    id: string;
    label: string;
    state: EvidenceState;
    reportedState?: "known" | "not_reported";
    capabilityEvidence: CapabilityEvidence;
    actual: Field<number>;
    target?: Field<number>;
    heaterState?: Field<string>;
    active?: Field<boolean>;
    provenance: Provenance;
  }>;
};
type HeadsModule = ModuleBase & {
  kind: "heads";
  materials: Omit<MaterialObservation, "items">;
  items: Array<{
    physicalTool: number;
    state: EvidenceState;
    active: Field<boolean>;
    headState: Field<string>;
    temperature: Field<number>;
    target: Field<number>;
    material: Field<string>;
    color: Field<string>;
    vendor: Field<string>;
    materialType: Field<string>;
    subtype: Field<string>;
    reportedPresence: Field<boolean>;
    materialProvenance: Provenance;
    provenance: Provenance;
  }>;
};
type JobsModule = ModuleBase & CurrentJobObservation & { kind: "jobs" };
type JobHistoryModule = ModuleBase & JobHistoryObservation & { kind: "job_history" };
type QueueModule = ModuleBase & QueueObservation & { kind: "queue" };
type FansModule = ModuleBase & {
  kind: "fans";
  freshness: EnvironmentObservation["freshness"];
  receivedAt: string | null;
  checkedAt: string | null;
  reason: EnvironmentObservation["reason"];
  items: EnvironmentFan[];
  purifier: EnvironmentObservation["purifier"] & { capabilityEvidence: CapabilityEvidence };
};
type BedMeshModule = ModuleBase & BedMeshObservation & {
  kind: "bed_mesh";
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

function statusReceipt(snapshot: ObservationSnapshot): OverviewReceipt {
  return {
    state: snapshot.status.reachable
      ? snapshot.freshness === "stale" ? "stale" : "known"
      : "unavailable",
    sourceObservedAt: snapshot.sourceObservedAt,
    freshness: snapshot.freshness,
  };
}

function domainReceipt(domain: {
  state: EvidenceState;
  sourceObservedAt: string | null;
  freshness: "fresh" | "stale" | "unknown";
  reason: string | null;
}): OverviewReceipt {
  return {
    state: domain.state,
    sourceObservedAt: domain.sourceObservedAt,
    freshness: domain.freshness,
    reason: domain.reason,
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
  const environment = snapshot.environment ?? unavailableEnvironment("not_requested");
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
  const cavityKnown = environment.cavity.state === "known" && environment.cavity.temperatureC !== null;
  readings.push({
    id: "cavity",
    label: "Cavity",
    state: cavityKnown ? environment.state === "stale" ? "stale" : "known" : "unknown",
    reportedState: environment.cavity.state,
    capabilityEvidence: snapshot.capabilityEvidence.cavity,
    actual: { state: cavityKnown ? environment.state === "stale" ? "stale" : "known" : "unknown", value: environment.cavity.temperatureC },
    provenance: cavityKnown ? { source: "moonraker", sourceObservedAt: environment.sourceObservedAt,
      detail: "Server receipt of temperature_sensor cavity; no cavity target was reported" } :
      unknownProvenance("Cavity temperature was not reported by the fixed environment query"),
  });
  const known = readings.some((reading) =>
    reading.state === "known" || reading.state === "stale"
  );
  return {
    ...moduleBase(snapshot, "thermals", known, known ? "observed" : snapshot.capabilityEvidence.thermals,
      "Four tool slots and heater bed share one cached observation"),
    kind: "thermals",
    environment: {
      state: environment.state, freshness: environment.freshness, sourceObservedAt: environment.sourceObservedAt,
      receivedAt: environment.receivedAt, checkedAt: environment.checkedAt, reason: environment.reason,
    },
    readings,
  };
}

function projectHeads(snapshot: ObservationSnapshot): HeadsModule {
  const status = snapshot.status;
  const { items: reportedMaterials, ...materials } = snapshot.materials ?? unavailableMaterials("not_requested");
  const materialSlots = new Map(reportedMaterials.map(material => [material.physicalTool, material]));
  const materialField = <T>(value: T | null): Field<T> => ({
    state: value === null ? "unknown" : materials.state === "stale" ? "stale" : "known", value,
  });
  const materialProvenance: Provenance = {
    source: materials.sourceObservedAt === null ? "not_observed" : "moonraker",
    sourceObservedAt: materials.sourceObservedAt,
    detail: "Printer-reported material metadata by physical head; not an Orca preset or profile sync",
  };
  const tools = new Map(status.tools.map((tool) => [tool.physicalTool, tool]));
  const items = [1, 2, 3, 4].map((physicalTool) => {
    const tool = tools.get(physicalTool);
    const temperature = finiteOrNull(tool?.temperature);
    const target = finiteOrNull(tool?.target);
    const known = status.reachable && (temperature !== null || target !== null);
    const material = materialSlots.get(physicalTool);
    const materialName = material?.type ? [material.vendor, material.type, material.subtype].filter(Boolean).join(" ") : null;
    return {
      physicalTool,
      state: stateForKnown(snapshot, known),
      active: tool ? field(snapshot, tool.active) : field<boolean>(snapshot, null),
      headState: tool?.state != null
        ? field(snapshot, normalizedToolState(tool.state))
        : field<string>(snapshot, null),
      temperature: field(snapshot, temperature),
      target: field(snapshot, target),
      material: materialField(materialName),
      color: materialField(material?.color ?? null),
      vendor: materialField(material?.vendor ?? null),
      materialType: materialField(material?.type ?? null),
      subtype: materialField(material?.subtype ?? null),
      reportedPresence: materialField(material?.reportedPresence ?? null),
      materialProvenance,
      provenance: known
        ? provenance(snapshot, "Head state and temperature; material has an independent observation time")
        : unknownProvenance("No accepted head state or temperature was observed"),
    };
  });
  const known = items.some((item) => item.state === "known" || item.state === "stale");
  return {
    ...moduleBase(snapshot, "heads", known, snapshot.capabilityEvidence.heads,
      "Four physical head slots from one cached observation"),
    kind: "heads",
    materials,
    items,
  };
}

function projectJobs(snapshot: ObservationSnapshot): JobsModule {
  const current = snapshot.currentJob ?? unavailableCurrentJob("not_requested");
  return {
    ...current,
    kind: "jobs",
    capabilityEvidence: current.sourceObservedAt !== null ? "observed" : current.state === "unsupported" ? "unsupported" : "unknown",
    provenance: {
      source: current.sourceObservedAt === null ? "not_observed" : "moonraker",
      sourceObservedAt: current.sourceObservedAt,
      detail: "Server receipt of the fixed Current Job print_stats and virtual_sdcard query",
    },
  };
}

function projectJobHistory(snapshot: ObservationSnapshot): JobHistoryModule {
  const history = snapshot.jobHistory ?? unavailableJobHistory("not_requested");
  return {
    ...history,
    kind: "job_history",
    capabilityEvidence: history.sourceObservedAt !== null ? "observed" : history.state === "unsupported" ? "unsupported" : "unknown",
    provenance: {
      source: history.sourceObservedAt === null ? "not_observed" : "moonraker",
      sourceObservedAt: history.sourceObservedAt,
      detail: "Server receipt of the fixed latest-20 descending History query",
    },
  };
}

function projectFans(snapshot: ObservationSnapshot): FansModule {
  const environment = snapshot.environment ?? unavailableEnvironment("not_requested");
  return {
    kind: "fans", state: environment.state, freshness: environment.freshness,
    capabilityEvidence: environment.sourceObservedAt !== null ? "observed" : environment.state === "unsupported" ? "unsupported" : "unknown",
    provenance: { source: environment.sourceObservedAt === null ? "not_observed" : "moonraker",
      sourceObservedAt: environment.sourceObservedAt,
      detail: "Server receipt of fixed fan and purifier status; speed is commanded power and RPM is separately reported" },
    receivedAt: environment.receivedAt, checkedAt: environment.checkedAt, reason: environment.reason,
    items: environment.fans,
    purifier: { ...environment.purifier, capabilityEvidence: snapshot.capabilityEvidence.purifier },
  };
}

function projectQueue(snapshot: ObservationSnapshot): QueueModule {
  const queue = snapshot.queue ?? unavailableQueue("not_requested");
  return {
    ...queue, kind: "queue",
    capabilityEvidence: queue.sourceObservedAt !== null ? "observed" : queue.state === "unsupported" ? "unsupported" : "unknown",
    provenance: {
      source: queue.sourceObservedAt === null ? "not_observed" : "moonraker",
      sourceObservedAt: queue.sourceObservedAt,
      detail: "Server receipt of reported queue order and waiting times, not print start acknowledgement or a print ETA",
    },
  };
}

function projectBedMesh(snapshot: ObservationSnapshot): BedMeshModule {
  const mesh = snapshot.bedMesh ?? unavailableBedMesh("not_requested");
  return {
    ...mesh, kind: "bed_mesh",
    capabilityEvidence: mesh.sourceObservedAt !== null ? "observed" : mesh.state === "unsupported" ? "unsupported" : "unknown",
    provenance: {
      source: mesh.sourceObservedAt === null ? "not_observed" : "moonraker",
      sourceObservedAt: mesh.sourceObservedAt,
      detail: "Server receipt of the reported probe grid, not calibration or probe capture time; rows Y and columns X ascend in millimeters",
    },
  };
}

function projectOverview(snapshot: ObservationSnapshot): OverviewModule {
  // Overview deliberately composes the accepted focused projectors. It does not
  // re-normalize adapter data or embed their privacy-sensitive rows and samples.
  const progress = projectProgress(snapshot);
  const thermals = projectThermals(snapshot);
  const heads = projectHeads(snapshot);
  const jobs = projectJobs(snapshot);
  const history = projectJobHistory(snapshot);
  const queue = projectQueue(snapshot);
  const fans = projectFans(snapshot);
  const mesh = projectBedMesh(snapshot);

  const activeThermal = thermals.readings.find(reading => reading.active?.value === true);
  const bed = thermals.readings.find(reading => reading.id === "heater-bed");
  const cavity = thermals.readings.find(reading => reading.id === "cavity");
  const activeHead = heads.items.find(item => item.active.value === true);
  const currentValues = [
    jobs.printState.reported ? jobs.printState.value : null,
    jobs.storageActive.reported ? jobs.storageActive.value : null,
  ];
  const historyStatuses = [
    "in_progress", "completed", "cancelled", "error", "klippy_shutdown",
    "klippy_disconnect", "interrupted", "unknown",
  ] as const;
  const statusCounts = history.pageCount === null ? null : Object.fromEntries(
    historyStatuses.map(status => [status, history.items.filter(item => item.status === status).length])
  ) as Record<(typeof historyStatuses)[number], number>;
  const reportedFanCount = fans.state === "known" || fans.state === "stale"
    ? fans.items.filter(item => item.state === "known").length
    : null;
  const purifierKnown = fans.purifier.state === "known";
  const meshActive = mesh.status === "active" ? true : mesh.status === "no_active_mesh" ? false : null;
  const status = statusReceipt(snapshot);
  const projected = [progress, thermals, heads, jobs, history, queue, fans, mesh];
  const available = projected.filter(module => module.state === "known" || module.state === "stale").length;
  const overviewCoverage: OverviewCoverage = available === 0 ? "none" : available === projected.length ? "complete" : "partial";

  return {
    ...moduleBase(snapshot, "overview", snapshot.status.reachable,
      snapshot.sourceObservedAt === null ? "unknown" : "observed",
      "Privacy-minimized headlines composed from eight accepted focused projections"),
    kind: "overview",
    coverage: overviewCoverage,
    tiles: [
      {
        id: "progress", state: progress.state,
        receipts: { status }, printState: normalizedPrintState(snapshot.status.state),
        percent: progress.fields.percent.value,
        currentLayer: progress.fields.currentLayer.value,
        totalLayers: progress.fields.totalLayers.value,
        estimatedRemainingSeconds: progress.fields.estimatedRemainingSeconds.value,
      },
      {
        id: "thermals", state: thermals.state,
        receipts: { status, environment: domainReceipt(thermals.environment) },
        activeTool: activeThermal ? Number(activeThermal.id.slice(5)) : null,
        activeActualC: activeThermal?.actual.value ?? null,
        activeTargetC: activeThermal?.target?.value ?? null,
        bedActualC: bed?.actual.value ?? null,
        bedTargetC: bed?.target?.value ?? null,
        cavityActualC: cavity?.actual.value ?? null,
      },
      {
        id: "heads", state: heads.state,
        receipts: { status, materials: domainReceipt(heads.materials) },
        activeTool: activeHead?.physicalTool ?? null,
        material: activeHead?.material.value ?? null,
        color: activeHead?.color.value ?? null,
        reportedPresence: activeHead?.reportedPresence.value ?? null,
      },
      {
        id: "jobs", state: jobs.state,
        receipts: { currentJob: domainReceipt(jobs) },
        printState: currentValues[0] as CurrentJobObservation["printState"]["value"],
        storageActive: currentValues[1] as boolean | null,
      },
      {
        id: "job_history", state: history.state,
        receipts: { jobHistory: domainReceipt(history) },
        pageCount: history.pageCount, statusCounts,
      },
      {
        id: "queue", state: queue.state,
        receipts: { queue: domainReceipt(queue) },
        queueState: queue.queueState, totalCount: queue.totalCount,
      },
      {
        id: "fans", state: fans.state,
        receipts: { environment: domainReceipt(thermals.environment) },
        reportedFanCount,
        purifierPowerDetected: purifierKnown ? fans.purifier.powerDetected : null,
        purifierMode: purifierKnown ? fans.purifier.mode : null,
      },
      {
        id: "bed_mesh", state: mesh.state,
        receipts: { bedMesh: domainReceipt(mesh) },
        active: meshActive,
        rows: mesh.summary?.rows ?? null,
        columns: mesh.summary?.columns ?? null,
        rangeMillimeters: mesh.summary?.range ?? null,
      },
    ],
  };
}

function projectModule(snapshot: ObservationSnapshot, view: ObservationView) {
  if (view === "overview") return projectOverview(snapshot);
  if (view === "progress") return projectProgress(snapshot);
  if (view === "thermals") return projectThermals(snapshot);
  if (view === "heads") return projectHeads(snapshot);
  if (view === "jobs") return projectJobs(snapshot);
  if (view === "job_history") return projectJobHistory(snapshot);
  if (view === "bed_mesh") return projectBedMesh(snapshot);
  if (view === "queue") return projectQueue(snapshot);
  return projectFans(snapshot);
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
