import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { normalizePrinterBaseUrl } from "../local-config.js";
import {
  unavailableCurrentJob,
  type CurrentJobObservation,
  type CurrentJobPrintState,
  type ReportedValue,
} from "../application/current-job-observation.js";
import {
  JOB_HISTORY_PAGE_SIZE,
  unavailableJobHistory,
  type JobHistoryObservation,
  type JobHistoryStatus,
} from "../application/job-history-observation.js";
import { safeDisplayFilename } from "./moonraker-queue.js";

export const CURRENT_JOB_ROUTE = "/printer/objects/query?print_stats=filename,state,total_duration,print_duration,filament_used&virtual_sdcard=is_active,file_position,file_size";
export const JOB_HISTORY_ROUTE = "/server/history/list?limit=20&start=0&order=desc";
export const JOBS_MAX_BYTES = 512 * 1024;
const execute = promisify(execFile);
const object = (value: unknown): Record<string, unknown> | null =>
  value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
const present = (record: Record<string, unknown>, key: string): boolean =>
  Object.prototype.hasOwnProperty.call(record, key);
const missing = <T>(): ReportedValue<T> => ({ reported: false, value: null });
const optionalNumber = (record: Record<string, unknown>, key: string, integer = false): ReportedValue<number> => {
  if (!present(record, key)) return missing();
  const value = record[key];
  return typeof value === "number" && Number.isFinite(value) && value >= 0 &&
      value <= Number.MAX_SAFE_INTEGER && (!integer || Number.isSafeInteger(value))
    ? { reported: true, value }
    : missing();
};
const historyStatuses = new Set<JobHistoryStatus>([
  "in_progress", "completed", "cancelled", "error", "klippy_shutdown",
  "klippy_disconnect", "interrupted",
]);
const currentStates = new Set<Exclude<CurrentJobPrintState, "unknown">>([
  "standby", "printing", "paused", "complete", "error", "cancelled",
]);

export function normalizeCurrentJobResponse(payload: unknown, observedAt: string): CurrentJobObservation {
  const result = object(object(payload)?.result);
  const status = object(result?.status);
  if (!result || !status) return unavailableCurrentJob("malformed", observedAt);
  const printStats = present(status, "print_stats") ? object(status.print_stats) : null;
  const virtualSd = present(status, "virtual_sdcard") ? object(status.virtual_sdcard) : null;
  if (present(status, "print_stats") && !printStats) return unavailableCurrentJob("malformed", observedAt);
  if (present(status, "virtual_sdcard") && !virtualSd) return unavailableCurrentJob("malformed", observedAt);

  let printState = missing<CurrentJobPrintState>();
  if (printStats && present(printStats, "state")) {
    printState = typeof printStats.state === "string"
      ? { reported: true, value: currentStates.has(printStats.state as Exclude<CurrentJobPrintState, "unknown">)
        ? printStats.state as Exclude<CurrentJobPrintState, "unknown"> : "unknown" }
      : missing();
  }
  let filename = missing<string>();
  if (printStats && present(printStats, "filename")) {
    if (typeof printStats.filename === "string") {
      if (printStats.filename.length === 0) filename = { reported: true, value: null };
      else {
        const display = safeDisplayFilename(printStats.filename);
        if (display === null) return unavailableCurrentJob("malformed", observedAt);
        filename = { reported: true, value: display };
      }
    }
  }
  const storageActive: ReportedValue<boolean> = virtualSd && typeof virtualSd.is_active === "boolean"
    ? { reported: true, value: virtualSd.is_active } : missing();
  return {
    state: "known", freshness: "fresh", sourceObservedAt: observedAt,
    receivedAt: observedAt, checkedAt: observedAt, printState, filename, storageActive,
    filePositionBytes: virtualSd ? optionalNumber(virtualSd, "file_position", true) : missing(),
    fileSizeBytes: virtualSd ? optionalNumber(virtualSd, "file_size", true) : missing(),
    totalDurationSeconds: printStats ? optionalNumber(printStats, "total_duration") : missing(),
    printDurationSeconds: printStats ? optionalNumber(printStats, "print_duration") : missing(),
    filamentUsedMillimeters: printStats ? optionalNumber(printStats, "filament_used") : missing(),
    reason: null,
  };
}

const optionalHistoryNumber = (record: Record<string, unknown>, key: string): number | null => {
  const value = record[key];
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= Number.MAX_SAFE_INTEGER
    ? value : null;
};
const optionalHistoryTime = (record: Record<string, unknown>, key: string): string | null => {
  const value = record[key];
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 253_402_300_799) return null;
  const date = new Date(value * 1000);
  return Number.isFinite(date.valueOf()) ? date.toISOString() : null;
};

export function normalizeJobHistoryResponse(payload: unknown, observedAt: string): JobHistoryObservation {
  const result = object(object(payload)?.result);
  if (!result || !Array.isArray(result.jobs) || !Number.isSafeInteger(result.count) ||
      (result.count as number) < 0 || result.count !== result.jobs.length || result.jobs.length > JOB_HISTORY_PAGE_SIZE) {
    return unavailableJobHistory("malformed", observedAt);
  }
  const items: JobHistoryObservation["items"] = [];
  for (const [index, value] of result.jobs.entries()) {
    const row = object(value);
    if (!row) return unavailableJobHistory("malformed", observedAt);
    const filename = safeDisplayFilename(row.filename);
    if (filename === null) return unavailableJobHistory("malformed", observedAt);
    const status = typeof row.status === "string" && historyStatuses.has(row.status as JobHistoryStatus)
      ? row.status as JobHistoryStatus : "unknown";
    items.push({
      position: index + 1, filename, status,
      startTime: optionalHistoryTime(row, "start_time"),
      endTime: optionalHistoryTime(row, "end_time"),
      printDurationSeconds: optionalHistoryNumber(row, "print_duration"),
      totalDurationSeconds: optionalHistoryNumber(row, "total_duration"),
      filamentUsedMillimeters: optionalHistoryNumber(row, "filament_used"),
    });
  }
  return {
    state: "known", freshness: "fresh", sourceObservedAt: observedAt,
    receivedAt: observedAt, checkedAt: observedAt, items,
    pageCount: result.count as number, reason: null,
  };
}

async function readFixed<T>(
  baseUrl: string | URL,
  route: string,
  now: () => Date,
  unavailable: (reason: Parameters<typeof unavailableCurrentJob>[0], checkedAt?: string | null) => T,
  normalize: (payload: unknown, observedAt: string) => T
): Promise<T> {
  let url: URL;
  try { url = new URL(route, normalizePrinterBaseUrl(String(baseUrl))); }
  catch { return unavailable("not_configured", now().toISOString()); }
  try {
    const { stdout } = await execute("curl", [
      "--disable", "--noproxy", "*", "--silent", "--show-error", "--request", "GET",
      "--connect-timeout", "3", "--max-time", "6", "--header", "accept: application/json",
      "--write-out", "\n%{http_code}", url.toString(),
    ], { maxBuffer: JOBS_MAX_BYTES + 4, timeout: 6500 });
    const checkedAt = now().toISOString();
    const separator = stdout.lastIndexOf("\n");
    const body = stdout.slice(0, separator); const status = Number(stdout.slice(separator + 1));
    if (Buffer.byteLength(body, "utf8") > JOBS_MAX_BYTES) return unavailable("too_large", checkedAt);
    if (status === 404 || status === 405) return unavailable("unsupported", checkedAt);
    if (status === 401 || status === 403) return unavailable("unauthorized", checkedAt);
    if (status !== 200) return unavailable("http_error", checkedAt);
    let payload: unknown;
    try { payload = JSON.parse(body); } catch { return unavailable("malformed", checkedAt); }
    const result = normalize(payload, checkedAt) as T & { state?: string };
    if (result.state !== "known") return result;
    const receipt = now().toISOString();
    return { ...result, sourceObservedAt: receipt, receivedAt: receipt, checkedAt: receipt };
  } catch (error) {
    const failure = object(error);
    return unavailable(failure?.code === "ERR_CHILD_PROCESS_STDIO_MAXBUFFER" ? "too_large" :
      failure?.code === 28 || failure?.killed === true ? "timeout" : "network", now().toISOString());
  }
}

export const readMoonrakerCurrentJob = (
  baseUrl: string | URL,
  now: () => Date = () => new Date()
): Promise<CurrentJobObservation> =>
  readFixed(baseUrl, CURRENT_JOB_ROUTE, now, unavailableCurrentJob, normalizeCurrentJobResponse);

export const readMoonrakerJobHistory = (
  baseUrl: string | URL,
  now: () => Date = () => new Date()
): Promise<JobHistoryObservation> =>
  readFixed(baseUrl, JOB_HISTORY_ROUTE, now, unavailableJobHistory, normalizeJobHistoryResponse);
