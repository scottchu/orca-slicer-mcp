import type { U1Status, U1WidgetMetadata } from "./u1-status.js";

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
    queue: "advertised",
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

  constructor(
    private readonly readStatus: StatusReader,
    private readonly now: () => Date = () => new Date()
  ) {}

  async current(options: { refresh?: boolean } = {}): Promise<ObservationSnapshot> {
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
    const result = await this.readStatus();
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
