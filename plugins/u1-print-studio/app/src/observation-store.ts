import type { U1Status, U1WidgetMetadata } from "./u1-status.js";
import { BED_MESH_TTL_MS, unavailableBedMesh, type BedMeshObservation, type BedMeshReader } from "./application/bed-mesh-observation.js";
import { MATERIAL_TTL_MS, unavailableMaterials, type MaterialObservation, type MaterialReader } from "./application/material-observation.js";
import { QUEUE_TTL_MS, unavailableQueue, type QueueObservation, type QueueReader } from "./application/queue-observation.js";

export type Freshness = "fresh" | "stale" | "offline" | "unknown";
export type CapabilityEvidence =
  | "observed"
  | "advertised"
  | "unsupported"
  | "unknown";

export type ObservationSnapshot = {
  schemaVersion: 1;
  observationVersion: number;
  sourceObservedAt: string | null;
  receivedAt: string;
  freshness: Freshness;
  connectionEpoch: number | null;
  session: {
    identity: null;
    provenance: "external" | "unknown";
    detail: string;
  };
  capabilityEvidence: {
    progress: CapabilityEvidence;
    thermals: CapabilityEvidence;
    cavity: CapabilityEvidence;
    heads: CapabilityEvidence;
    materials: CapabilityEvidence;
    jobs: CapabilityEvidence;
    history: CapabilityEvidence;
    queue: CapabilityEvidence;
    fans: CapabilityEvidence;
    purifier: CapabilityEvidence;
    bedMesh: CapabilityEvidence;
  };
  status: U1Status;
  metadata: U1WidgetMetadata;
  bedMesh?: BedMeshObservation;
  materials?: MaterialObservation;
  queue?: QueueObservation;
};

type StatusReader = () => Promise<{
  status: U1Status;
  metadata: U1WidgetMetadata;
}>;

function hasNumber(value: number | null): boolean {
  return typeof value === "number" && Number.isFinite(value);
}

function capabilityEvidence(status: U1Status): ObservationSnapshot["capabilityEvidence"] {
  const hasProgress = hasNumber(status.progressPercent) ||
    hasNumber(status.elapsedSeconds) || status.currentLayer !== null ||
    status.totalLayers !== null;
  const hasThermals = status.tools.some(
    (tool) => hasNumber(tool.temperature) || hasNumber(tool.target)
  ) || hasNumber(status.bed.temperature) || hasNumber(status.bed.target);
  const hasHeads = status.tools.some(
    (tool) => hasNumber(tool.temperature) || hasNumber(tool.target)
  );
  return {
    progress: status.reachable && hasProgress ? "observed" : "unknown",
    thermals: status.reachable && hasThermals ? "observed" : "unknown",
    cavity: "advertised",
    heads: status.reachable && hasHeads ? "observed" : "unknown",
    materials: "unknown",
    jobs: status.reachable && status.filename ? "observed" : "unknown",
    history: "advertised",
    queue: "unknown",
    fans: "advertised",
    purifier: "advertised",
    bedMesh: "advertised",
  };
}

export class PrinterObservationStore {
  private snapshot: ObservationSnapshot | null = null;
  private lastReachableSnapshot: ObservationSnapshot | null = null;
  private inFlight: Promise<ObservationSnapshot> | null = null;
  private observationVersion = 0;
  private connectionEpoch = 0;
  private previouslyReachable = false;
  private bedMesh = unavailableBedMesh("not_requested");
  private bedMeshInFlight: Promise<void> | null = null;
  private materials = unavailableMaterials("not_requested");
  private materialsInFlight: Promise<void> | null = null;
  private queue = unavailableQueue("not_requested");
  private queueInFlight: Promise<void> | null = null;

  constructor(
    private readonly readStatus: StatusReader,
    private readonly now: () => Date = () => new Date(),
    private readonly readBedMesh?: BedMeshReader,
    private readonly readMaterials?: MaterialReader,
    private readonly readQueue?: QueueReader
  ) {}

  async current(options: { refresh?: boolean; includeBedMesh?: boolean; includeMaterials?: boolean; includeQueue?: boolean } = {}): Promise<ObservationSnapshot> {
    await Promise.all([
      this.currentStatus(options),
      options.includeBedMesh ? this.currentBedMesh(options.refresh === true) : Promise.resolve(),
      options.includeMaterials ? this.currentMaterials(options.refresh === true) : Promise.resolve(),
      options.includeQueue ? this.currentQueue(options.refresh === true) : Promise.resolve(),
    ]);
    // A concurrent status or mesh receipt may have advanced the shared version.
    // Attach the latest independent domain instead of a captured older snapshot.
    const bedMesh = this.bedMeshWithCurrentFreshness();
    const materials = this.materialsWithCurrentFreshness();
    const queue = this.queueWithCurrentFreshness();
    const snapshot = this.withCurrentFreshness(this.snapshot!);
    return { ...snapshot, bedMesh, materials, queue, capabilityEvidence: {
      ...snapshot.capabilityEvidence,
      bedMesh: bedMesh.sourceObservedAt !== null ? "observed" : bedMesh.state === "unsupported" ? "unsupported" : "unknown",
      materials: materials.sourceObservedAt !== null ? "observed" : materials.state === "unsupported" ? "unsupported" : "unknown",
      queue: queue.sourceObservedAt !== null ? "observed" : queue.state === "unsupported" ? "unsupported" : "unknown",
    } };
  }

  private async currentQueue(refresh: boolean): Promise<void> {
    const checked = Date.parse(this.queue.checkedAt ?? "");
    const due = !Number.isFinite(checked) || this.now().valueOf() - checked >= QUEUE_TTL_MS;
    if (this.queue.checkedAt !== null && (!refresh || !due)) return;
    if (!this.readQueue) return;
    if (!this.queueInFlight) {
      this.queueInFlight = (async () => {
        let result: QueueObservation;
        try { result = await this.readQueue!(); }
        catch { result = unavailableQueue("network", this.now().toISOString()); }
        if (result.state === "known") this.queue = result;
        else if (this.queue.sourceObservedAt !== null) this.queue = {
          ...this.queue, state: "stale", freshness: "stale",
          checkedAt: result.checkedAt ?? this.now().toISOString(), reason: result.reason,
        };
        else this.queue = { ...result, checkedAt: result.checkedAt ?? this.now().toISOString() };
        const version = ++this.observationVersion;
        if (this.snapshot) this.snapshot = { ...this.snapshot, observationVersion: version };
      })().finally(() => { this.queueInFlight = null; });
    }
    await this.queueInFlight;
  }

  private queueWithCurrentFreshness(): QueueObservation {
    if (this.queue.state !== "known") return this.queue;
    const observed = Date.parse(this.queue.sourceObservedAt ?? "");
    return !Number.isFinite(observed) || this.now().valueOf() - observed >= QUEUE_TTL_MS
      ? { ...this.queue, state: "stale", freshness: "stale" } : this.queue;
  }

  private async currentMaterials(refresh: boolean): Promise<void> {
    const checked = Date.parse(this.materials.checkedAt ?? "");
    const due = !Number.isFinite(checked) || this.now().valueOf() - checked >= MATERIAL_TTL_MS;
    if (this.materials.checkedAt !== null && (!refresh || !due)) return;
    if (!this.readMaterials) return;
    if (!this.materialsInFlight) {
      this.materialsInFlight = (async () => {
        let result: MaterialObservation;
        try { result = await this.readMaterials!(); }
        catch { result = unavailableMaterials("network", this.now().toISOString()); }
        if (result.state === "known") this.materials = result;
        else if (this.materials.sourceObservedAt !== null) this.materials = {
          ...this.materials, state: "stale", freshness: "stale",
          checkedAt: result.checkedAt ?? this.now().toISOString(), reason: result.reason,
        };
        else this.materials = { ...result, checkedAt: result.checkedAt ?? this.now().toISOString() };
        const version = ++this.observationVersion;
        if (this.snapshot) this.snapshot = { ...this.snapshot, observationVersion: version };
      })().finally(() => { this.materialsInFlight = null; });
    }
    await this.materialsInFlight;
  }

  private materialsWithCurrentFreshness(): MaterialObservation {
    if (this.materials.state !== "known") return this.materials;
    const observed = Date.parse(this.materials.sourceObservedAt ?? "");
    return !Number.isFinite(observed) || this.now().valueOf() - observed >= MATERIAL_TTL_MS
      ? { ...this.materials, state: "stale", freshness: "stale" } : this.materials;
  }

  private async currentBedMesh(refresh: boolean): Promise<void> {
    const checked = Date.parse(this.bedMesh.checkedAt ?? "");
    const due = !Number.isFinite(checked) || this.now().valueOf() - checked >= BED_MESH_TTL_MS;
    if (this.bedMesh.checkedAt !== null && (!refresh || !due)) return;
    if (!this.readBedMesh) return;
    if (!this.bedMeshInFlight) {
      this.bedMeshInFlight = (async () => {
        let result: BedMeshObservation;
        try { result = await this.readBedMesh!(); }
        catch { result = unavailableBedMesh("network", this.now().toISOString()); }
        if (result.state === "known") this.bedMesh = result;
        else if (this.bedMesh.sourceObservedAt !== null) this.bedMesh = {
          ...this.bedMesh, state: "stale", freshness: "stale",
          checkedAt: result.checkedAt ?? this.now().toISOString(), reason: result.reason,
        };
        else this.bedMesh = { ...result, checkedAt: result.checkedAt ?? this.now().toISOString() };
        const version = ++this.observationVersion;
        if (this.snapshot) this.snapshot = { ...this.snapshot, observationVersion: version };
      })().finally(() => { this.bedMeshInFlight = null; });
    }
    await this.bedMeshInFlight;
  }

  private bedMeshWithCurrentFreshness(): BedMeshObservation {
    if (this.bedMesh.state !== "known") return this.bedMesh;
    const observed = Date.parse(this.bedMesh.sourceObservedAt ?? "");
    return !Number.isFinite(observed) || this.now().valueOf() - observed >= BED_MESH_TTL_MS
      ? { ...this.bedMesh, state: "stale", freshness: "stale" } : this.bedMesh;
  }

  private async currentStatus(options: { refresh?: boolean } = {}): Promise<ObservationSnapshot> {
    if (this.snapshot && (!options.refresh || !this.isDue(this.snapshot))) {
      return this.withCurrentFreshness(this.snapshot);
    }
    if (!this.inFlight) {
      this.inFlight = this.load()
        .catch((error: unknown) => {
          if (!this.snapshot) throw error;
          const stale = { ...this.snapshot, freshness: "stale" as const };
          this.snapshot = stale;
          return stale;
        })
        .finally(() => {
          this.inFlight = null;
        });
    }
    return this.inFlight;
  }

  private isDue(snapshot: ObservationSnapshot): boolean {
    const received = Date.parse(snapshot.receivedAt);
    if (!Number.isFinite(received)) return true;
    const minimumSeconds = Math.max(15, snapshot.status.refreshAfterSeconds);
    return this.now().valueOf() - received >= minimumSeconds * 1_000;
  }

  private withCurrentFreshness(snapshot: ObservationSnapshot): ObservationSnapshot {
    if (!snapshot.status.reachable) {
      return snapshot.freshness === "offline" || snapshot.freshness === "stale"
        ? snapshot
        : { ...snapshot, freshness: "offline" };
    }
    const freshness: Freshness = this.isDue(snapshot) ? "stale" : "fresh";
    return snapshot.freshness === freshness
      ? snapshot
      : { ...snapshot, freshness };
  }

  private async load(): Promise<ObservationSnapshot> {
    // A failed first status read must not discard an independently successful
    // mesh receipt. Normalize the absent status; never surface upstream errors.
    const result = await this.readStatus().catch((error: unknown) => {
      if (this.snapshot) throw error;
      return {
      status: {
        schemaVersion: 1, stateVersion: 0, observedAt: "", reachable: false,
        state: "offline", stateLabel: "Offline", progressPercent: null,
        currentLayer: null, totalLayers: null, elapsedSeconds: null, remainingSeconds: null,
        refreshAfterSeconds: 15, filename: null, activePhysicalTool: null, tools: [],
        bed: { temperature: null, target: null },
        storage: { active: null, filePosition: null, fileSize: null },
        printerMessage: null, exception: false,
        camera: { available: false, service: null, targetFps: null },
      } satisfies U1Status,
      metadata: {},
      };
    });
    const reachableBasis = this.lastReachableSnapshot;
    const retainedOffline = !result.status.reachable && reachableBasis !== null;
    const status = retainedOffline
      ? {
          ...reachableBasis.status,
          reachable: false,
          state: "offline",
          stateLabel: "Offline",
          refreshAfterSeconds: result.status.refreshAfterSeconds,
        }
      : result.status;
    const metadata = retainedOffline ? reachableBasis.metadata : result.metadata;
    const receivedAt = this.now().toISOString();
    if (status.reachable && !this.previouslyReachable) this.connectionEpoch += 1;
    this.previouslyReachable = status.reachable;
    const snapshot: ObservationSnapshot = {
      schemaVersion: 1,
      observationVersion: ++this.observationVersion,
      sourceObservedAt: retainedOffline
        ? reachableBasis.sourceObservedAt
        : status.reachable && status.observedAt
          ? status.observedAt
          : null,
      receivedAt,
      freshness: status.reachable ? "fresh" : retainedOffline ? "stale" : "offline",
      connectionEpoch: this.connectionEpoch > 0 ? this.connectionEpoch : null,
      session: retainedOffline
        ? reachableBasis.session
        : {
            identity: null,
            provenance: status.filename ? "external" : "unknown",
            detail: status.filename
              ? "Observed printer filename is not correlated to a prepared-job manifest"
              : "No correlated print-session identity is available",
          },
      capabilityEvidence: retainedOffline
        ? reachableBasis.capabilityEvidence
        : capabilityEvidence(status),
      status,
      metadata,
    };
    this.snapshot = snapshot;
    if (snapshot.status.reachable) this.lastReachableSnapshot = snapshot;
    return snapshot;
  }
}
