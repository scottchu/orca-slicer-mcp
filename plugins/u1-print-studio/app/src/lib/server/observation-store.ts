import type { MonitorEvidence } from "./application/print-monitor-observation.js";
import { createDomainObservationCache, type DomainObservationCache } from "./application/domain-observation-cache.js";
import type { U1Status, U1WidgetMetadata } from "./u1-status.js";
import { BED_MESH_TTL_MS, unavailableBedMesh, type BedMeshObservation, type BedMeshReader } from "./application/bed-mesh-observation.js";
import { MATERIAL_TTL_MS, unavailableMaterials, type MaterialObservation, type MaterialReader } from "./application/material-observation.js";
import { QUEUE_TTL_MS, unavailableQueue, type QueueObservation, type QueueReader } from "./application/queue-observation.js";
import { ENVIRONMENT_TTL_MS, unavailableEnvironment, type EnvironmentObservation, type EnvironmentReader } from "./application/environment-observation.js";
import { CURRENT_JOB_TTL_MS, unavailableCurrentJob, type CurrentJobObservation, type CurrentJobReader } from "./application/current-job-observation.js";
import { JOB_HISTORY_TTL_MS, unavailableJobHistory, type JobHistoryObservation, type JobHistoryReader } from "./application/job-history-observation.js";

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
  environment?: EnvironmentObservation;
  currentJob?: CurrentJobObservation;
  jobHistory?: JobHistoryObservation;
};

type StatusReader = () => Promise<{
  monitorEvidence?: MonitorEvidence;
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
    jobs: "unknown",
    history: "unknown",
    queue: "unknown",
    fans: "advertised",
    purifier: "advertised",
    bedMesh: "advertised",
  };
}

export class PrinterObservationStore {
  private snapshot: ObservationSnapshot | null = null;
  private statusAttempts = 0;
  private monitorEvidence: MonitorEvidence | null = null;
  private lastReachableSnapshot: ObservationSnapshot | null = null;
  private inFlight: Promise<ObservationSnapshot> | null = null;
  private observationVersion = 0;
  private connectionEpoch = 0;
  private previouslyReachable = false;
  private readonly bedMesh: DomainObservationCache<BedMeshObservation>;
  private readonly materials: DomainObservationCache<MaterialObservation>;
  private readonly queue: DomainObservationCache<QueueObservation>;
  private readonly environment: DomainObservationCache<EnvironmentObservation>;
  private readonly currentJob: DomainObservationCache<CurrentJobObservation>;
  private readonly jobHistory: DomainObservationCache<JobHistoryObservation>;

  constructor(
    private readonly readStatus: StatusReader,
    private readonly now: () => Date = () => new Date(),
    private readonly readBedMesh?: BedMeshReader,
    private readonly readMaterials?: MaterialReader,
    private readonly readQueue?: QueueReader,
    private readonly readEnvironment?: EnvironmentReader,
    private readonly readCurrentJob?: CurrentJobReader,
    private readonly readJobHistory?: JobHistoryReader
  ) {
    const received = () => {
      const version = ++this.observationVersion;
      if (this.snapshot) this.snapshot = { ...this.snapshot, observationVersion: version };
    };
    this.bedMesh = createDomainObservationCache({
      initial: unavailableBedMesh("not_requested"), read: this.readBedMesh,
      ttlMs: BED_MESH_TTL_MS, unavailable: (checkedAt) => unavailableBedMesh("network", checkedAt),
      now: this.now, received,
    });
    this.materials = createDomainObservationCache({
      initial: unavailableMaterials("not_requested"), read: this.readMaterials,
      ttlMs: MATERIAL_TTL_MS, unavailable: (checkedAt) => unavailableMaterials("network", checkedAt),
      now: this.now, received,
    });
    this.queue = createDomainObservationCache({
      initial: unavailableQueue("not_requested"), read: this.readQueue,
      ttlMs: QUEUE_TTL_MS, unavailable: (checkedAt) => unavailableQueue("network", checkedAt),
      now: this.now, received,
    });
    this.environment = createDomainObservationCache({
      initial: unavailableEnvironment("not_requested"), read: this.readEnvironment,
      ttlMs: ENVIRONMENT_TTL_MS, unavailable: (checkedAt) => unavailableEnvironment("network", checkedAt),
      now: this.now, received,
    });
    this.currentJob = createDomainObservationCache({
      initial: unavailableCurrentJob("not_requested"), read: this.readCurrentJob,
      ttlMs: CURRENT_JOB_TTL_MS, unavailable: (checkedAt) => unavailableCurrentJob("network", checkedAt),
      now: this.now, received,
    });
    this.jobHistory = createDomainObservationCache({
      initial: unavailableJobHistory("not_requested"), read: this.readJobHistory,
      ttlMs: JOB_HISTORY_TTL_MS, unavailable: (checkedAt) => unavailableJobHistory("network", checkedAt),
      now: this.now, received,
    });
  }

  async current(options: { refresh?: boolean; includeBedMesh?: boolean; includeMaterials?: boolean; includeQueue?: boolean; includeEnvironment?: boolean; includeCurrentJob?: boolean; includeJobHistory?: boolean } = {}): Promise<ObservationSnapshot> {
    await Promise.all([
      this.currentStatus(options),
      options.includeBedMesh ? this.bedMesh.current(options.refresh === true) : Promise.resolve(),
      options.includeMaterials ? this.materials.current(options.refresh === true) : Promise.resolve(),
      options.includeQueue ? this.queue.current(options.refresh === true) : Promise.resolve(),
      options.includeEnvironment ? this.environment.current(options.refresh === true) : Promise.resolve(),
      options.includeCurrentJob ? this.currentJob.current(options.refresh === true) : Promise.resolve(),
      options.includeJobHistory ? this.jobHistory.current(options.refresh === true) : Promise.resolve(),
    ]);
    // A concurrent status or mesh receipt may have advanced the shared version.
    // Attach the latest independent domain instead of a captured older snapshot.
    const bedMesh = this.bedMesh.value();
    const materials = this.materials.value();
    const queue = this.queue.value();
    const environment = this.environment.value();
    const currentJob = this.currentJob.value();
    const jobHistory = this.jobHistory.value();
    const snapshot = this.withCurrentFreshness(this.snapshot!);
    return { ...snapshot, bedMesh, materials, queue, environment, currentJob, jobHistory, capabilityEvidence: {
      ...snapshot.capabilityEvidence,
      bedMesh: bedMesh.sourceObservedAt !== null ? "observed" : bedMesh.state === "unsupported" ? "unsupported" : "unknown",
      materials: materials.sourceObservedAt !== null ? "observed" : materials.state === "unsupported" ? "unsupported" : "unknown",
      queue: queue.sourceObservedAt !== null ? "observed" : queue.state === "unsupported" ? "unsupported" : "unknown",
      cavity: environment.cavity.state === "known" ? "observed" : environment.state === "unsupported" ? "unsupported" : "unknown",
      fans: environment.fans.some(fan => fan.state === "known") ? "observed" : environment.state === "unsupported" ? "unsupported" : "unknown",
      purifier: environment.purifier.state === "known" ? "observed" : environment.state === "unsupported" ? "unsupported" : "unknown",
      jobs: currentJob.sourceObservedAt !== null ? "observed" : currentJob.state === "unsupported" ? "unsupported" : "unknown",
      history: jobHistory.sourceObservedAt !== null ? "observed" : jobHistory.state === "unsupported" ? "unsupported" : "unknown",
    } };
  }

  /** No force/read-through bypass: monitor and widgets share one due read. */
  async currentMonitor() {
    const previousReceipt = this.snapshot?.receivedAt;
    const attempts = this.statusAttempts, waiting = this.inFlight !== null;
    const snapshot = await this.current({ refresh: true });
    return { snapshot, evidence: this.monitorEvidence,
      acquisition: waiting || this.statusAttempts !== attempts || snapshot.receivedAt !== previousReceipt ? 'new' as const : 'cached' as const };
  }

  monitorFreshness(): Freshness {
    if (!this.snapshot) return 'unknown';
    const freshness = this.withCurrentFreshness(this.snapshot).freshness;
    if (freshness !== 'fresh' || !this.monitorEvidence) return freshness;
    const age = this.now().valueOf() - Date.parse(this.monitorEvidence.receivedAt);
    return !Number.isFinite(age) || age < 0 ? 'unknown' :
      age >= Math.max(15, this.snapshot.status.refreshAfterSeconds) * 1000 ? 'stale' : 'fresh';
  }

  monitorIdentity() {
    return { receivedAt: this.monitorEvidence?.receivedAt ?? null,
      jobKey: this.monitorEvidence?.exactJobKey ?? null,
      epoch: this.snapshot?.connectionEpoch ?? null };
  }

  private async currentStatus(options: { refresh?: boolean } = {}): Promise<ObservationSnapshot> {
    if (this.snapshot && (!options.refresh || !this.isDue(this.snapshot))) {
      return this.withCurrentFreshness(this.snapshot);
    }
    if (!this.inFlight) {
      this.inFlight = this.load()
        .catch((error: unknown) => {
          this.monitorEvidence = null;
          this.previouslyReachable = false;
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
    this.statusAttempts += 1;
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
    this.monitorEvidence = result.status.reachable && "monitorEvidence" in result
      ? result.monitorEvidence ?? null : null;
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
