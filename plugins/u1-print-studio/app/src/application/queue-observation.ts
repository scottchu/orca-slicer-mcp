export const QUEUE_TTL_MS = 15_000;
export type QueueState = "ready" | "loading" | "starting" | "paused";
export type QueueReason = "not_requested" | "unsupported" | "unauthorized" |
  "http_error" | "timeout" | "network" | "malformed" | "too_large" | "not_configured";
export type QueueItem = {
  position: number;
  filename: string;
  timeAdded: string | null;
  /** Reported cumulative waiting time at receipt, never a print ETA or a live clock. */
  timeInQueueSeconds: number | null;
};
export type QueueObservation = {
  state: "known" | "stale" | "unknown" | "unsupported" | "unavailable";
  freshness: "fresh" | "stale" | "unknown";
  /** Connector receipt time; Moonraker supplies no queue snapshot timestamp. */
  sourceObservedAt: string | null;
  receivedAt: string | null;
  checkedAt: string | null;
  queueState: QueueState | null;
  items: QueueItem[];
  totalCount: number | null;
  truncated: boolean;
  reason: QueueReason | null;
};
export type QueueReader = () => Promise<QueueObservation>;

export function unavailableQueue(reason: QueueReason, checkedAt: string | null = null): QueueObservation {
  return {
    state: reason === "not_requested" ? "unknown" : reason === "unsupported" ? "unsupported" : "unavailable",
    freshness: "unknown", sourceObservedAt: null, receivedAt: null, checkedAt,
    queueState: null, items: [], totalCount: null, truncated: false, reason,
  };
}
