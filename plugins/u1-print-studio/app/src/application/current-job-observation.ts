export const CURRENT_JOB_TTL_MS = 15_000;

export type CurrentJobReason = "not_requested" | "unsupported" | "unauthorized" |
  "http_error" | "timeout" | "network" | "malformed" | "too_large" | "not_configured";
export type CurrentJobPrintState = "standby" | "printing" | "paused" |
  "complete" | "error" | "cancelled" | "unknown";
export type ReportedValue<T> = { reported: boolean; value: T | null };

export type CurrentJobObservation = {
  state: "known" | "stale" | "unknown" | "unsupported" | "unavailable";
  freshness: "fresh" | "stale" | "unknown";
  sourceObservedAt: string | null;
  receivedAt: string | null;
  checkedAt: string | null;
  printState: ReportedValue<CurrentJobPrintState>;
  filename: ReportedValue<string>;
  storageActive: ReportedValue<boolean>;
  filePositionBytes: ReportedValue<number>;
  fileSizeBytes: ReportedValue<number>;
  totalDurationSeconds: ReportedValue<number>;
  printDurationSeconds: ReportedValue<number>;
  filamentUsedMillimeters: ReportedValue<number>;
  reason: CurrentJobReason | null;
};
export type CurrentJobReader = () => Promise<CurrentJobObservation>;

const missing = <T>(): ReportedValue<T> => ({ reported: false, value: null });

export function unavailableCurrentJob(
  reason: CurrentJobReason,
  checkedAt: string | null = null
): CurrentJobObservation {
  return {
    state: reason === "not_requested" ? "unknown" : reason === "unsupported" ? "unsupported" : "unavailable",
    freshness: "unknown", sourceObservedAt: null, receivedAt: null, checkedAt,
    printState: missing(), filename: missing(), storageActive: missing(),
    filePositionBytes: missing(), fileSizeBytes: missing(), totalDurationSeconds: missing(),
    printDurationSeconds: missing(), filamentUsedMillimeters: missing(), reason,
  };
}
