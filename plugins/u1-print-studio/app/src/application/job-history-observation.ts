export const JOB_HISTORY_TTL_MS = 15_000;
export const JOB_HISTORY_PAGE_SIZE = 20;

export type JobHistoryReason = "not_requested" | "unsupported" | "unauthorized" |
  "http_error" | "timeout" | "network" | "malformed" | "too_large" | "not_configured";
export type JobHistoryStatus = "in_progress" | "completed" | "cancelled" | "error" |
  "klippy_shutdown" | "klippy_disconnect" | "interrupted" | "unknown";
export type JobHistoryItem = {
  position: number;
  filename: string;
  status: JobHistoryStatus;
  startTime: string | null;
  endTime: string | null;
  printDurationSeconds: number | null;
  totalDurationSeconds: number | null;
  filamentUsedMillimeters: number | null;
};
export type JobHistoryObservation = {
  state: "known" | "stale" | "unknown" | "unsupported" | "unavailable";
  freshness: "fresh" | "stale" | "unknown";
  sourceObservedAt: string | null;
  receivedAt: string | null;
  checkedAt: string | null;
  items: JobHistoryItem[];
  pageCount: number | null;
  reason: JobHistoryReason | null;
};
export type JobHistoryReader = () => Promise<JobHistoryObservation>;

export function unavailableJobHistory(
  reason: JobHistoryReason,
  checkedAt: string | null = null
): JobHistoryObservation {
  return {
    state: reason === "not_requested" ? "unknown" : reason === "unsupported" ? "unsupported" : "unavailable",
    freshness: "unknown", sourceObservedAt: null, receivedAt: null, checkedAt,
    items: [], pageCount: null, reason,
  };
}
