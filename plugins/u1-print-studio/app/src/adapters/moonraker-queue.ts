import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { normalizePrinterBaseUrl } from "../local-config.js";
import { unavailableQueue, type QueueObservation, type QueueState } from "../application/queue-observation.js";

export const QUEUE_STATUS_ROUTE = "/server/job_queue/status";
export const QUEUE_MAX_BYTES = 512 * 1024;
export const QUEUE_MAX_RAW_ITEMS = 1000;
export const QUEUE_MAX_VISIBLE_ITEMS = 100;
const execute = promisify(execFile);
const states = new Set<QueueState>(["ready", "loading", "starting", "paused"]);
const object = (value: unknown): Record<string, unknown> | null =>
  value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
const seconds = (value: unknown): number | null =>
  typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : null;
// Recognizable provider prefixes with a substantial token-shaped body, not a
// general ban on provider words. Match before display truncation, anywhere in
// the basename; the raw filename already has a strict 4,096-character bound.
const providerCredential = /(?:^|[^a-z0-9])(?:gh[pousr]_[a-z0-9]{16,255}|github_pat_[a-z0-9_]{16,255}|glpat-[a-z0-9_-]{16,255}|xox[baprs]-[a-z0-9-]{16,255}|(?:AKIA|ASIA)[a-z0-9]{16})/i;

function displayFilename(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim() || value.length > 4096 ||
      /[\p{Cc}\p{Cf}\p{Zl}\p{Zp}]/u.test(value)) return null;
  const path = value.trim().replaceAll("\\", "/");
  // Only a basename leaves the adapter; URL-like input is not a G-code path.
  if (/^[a-z][a-z0-9+.-]*:/i.test(path) || path.startsWith("//")) return null;
  const basename = path.split("/").at(-1)!.trim();
  if (!basename || basename === "." || basename === ".." ||
      !/^[\p{L}\p{M}\p{N} ._()+-]+$/u.test(basename) ||
      providerCredential.test(basename) ||
      /\b(?:bearer|basic)\s+|\b(?:api[-_ ]?key|(?:access|refresh)[-_ ]?token|password|secret|credential)[ _.-]+\S|\bsk-(?:proj-)?[a-z0-9_-]{8,}|\beyJ[a-z0-9_-]+\.[a-z0-9_-]+\.[a-z0-9_-]+/i.test(basename)) return null;
  return Array.from(basename).slice(0, 160).join("");
}

export function normalizeQueueResponse(payload: unknown, observedAt: string): QueueObservation {
  const result = object(object(payload)?.result);
  if (!result || !states.has(result.queue_state as QueueState) || !Array.isArray(result.queued_jobs)) {
    return unavailableQueue("malformed", observedAt);
  }
  if (result.queued_jobs.length > QUEUE_MAX_RAW_ITEMS) return unavailableQueue("too_large", observedAt);
  const items: QueueObservation["items"] = [];
  // Validate even hidden rows; invalid data must not masquerade as an empty or partial success.
  for (const [index, value] of result.queued_jobs.entries()) {
    const job = object(value);
    const filename = displayFilename(job?.filename);
    if (filename === null) return unavailableQueue("malformed", observedAt);
    const added = seconds(job?.time_added);
    const date = added === null ? null : new Date(added * 1000);
    if (index < QUEUE_MAX_VISIBLE_ITEMS) items.push({
      position: index + 1, filename,
      timeAdded: date && Number.isFinite(date.valueOf()) ? date.toISOString() : null,
      timeInQueueSeconds: seconds(job?.time_in_queue),
    });
  }
  return {
    state: "known", freshness: "fresh", sourceObservedAt: observedAt,
    receivedAt: observedAt, checkedAt: observedAt,
    queueState: result.queue_state as QueueState, items, totalCount: result.queued_jobs.length,
    truncated: result.queued_jobs.length > QUEUE_MAX_VISIBLE_ITEMS, reason: null,
  };
}

export async function readMoonrakerQueue(baseUrl: string | URL, now: () => Date = () => new Date()): Promise<QueueObservation> {
  let url: URL;
  try { url = new URL(QUEUE_STATUS_ROUTE, normalizePrinterBaseUrl(String(baseUrl))); }
  catch { return unavailableQueue("not_configured", now().toISOString()); }
  try {
    const { stdout } = await execute("curl", [
      "--disable", "--noproxy", "*", "--silent", "--show-error", "--request", "GET",
      "--connect-timeout", "3", "--max-time", "6", "--header", "accept: application/json",
      "--write-out", "\n%{http_code}", url.toString(),
    ], { maxBuffer: QUEUE_MAX_BYTES + 4, timeout: 6500 });
    const checkedAt = now().toISOString();
    const separator = stdout.lastIndexOf("\n");
    const body = stdout.slice(0, separator);
    const status = Number(stdout.slice(separator + 1));
    if (Buffer.byteLength(body, "utf8") > QUEUE_MAX_BYTES) return unavailableQueue("too_large", checkedAt);
    if (status === 404 || status === 405) return unavailableQueue("unsupported", checkedAt);
    if (status === 401 || status === 403) return unavailableQueue("unauthorized", checkedAt);
    if (status !== 200) return unavailableQueue("http_error", checkedAt);
    let payload: unknown;
    try { payload = JSON.parse(body); }
    catch { return unavailableQueue("malformed", checkedAt); }
    const result = normalizeQueueResponse(payload, checkedAt);
    if (result.state !== "known") return result;
    const receipt = now().toISOString();
    return { ...result, sourceObservedAt: receipt, receivedAt: receipt, checkedAt: receipt };
  } catch (error) {
    const failure = object(error);
    return unavailableQueue(failure?.code === "ERR_CHILD_PROCESS_STDIO_MAXBUFFER" ? "too_large" :
      failure?.code === 28 || failure?.killed === true ? "timeout" : "network", now().toISOString());
  }
}
