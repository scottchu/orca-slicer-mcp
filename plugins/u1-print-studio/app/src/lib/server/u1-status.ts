import { normalizeMonitorEvidence } from "./adapters/u1-monitor-evidence.js";
import type { MonitorEvidence } from "./application/print-monitor-observation.js";
import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";

import type {
  CameraIceCandidate,
  CameraIceServer,
  CameraWebRtcOffer,
  CameraWebRtcSignalingSource,
} from "./application/camera-webrtc.js";
import type { CameraIceServerProvider } from "./camera-ice-config.js";
import { normalizePrinterBaseUrl, readLocalConfig } from "./local-config.js";
import { readMoonrakerBedMesh } from "./adapters/moonraker-bed-mesh.js";
import { unavailableBedMesh, type BedMeshObservation } from "./application/bed-mesh-observation.js";
import { readMoonrakerMaterials } from "./adapters/moonraker-materials.js";
import { unavailableMaterials, type MaterialObservation } from "./application/material-observation.js";
import { readMoonrakerQueue } from "./adapters/moonraker-queue.js";
import { unavailableQueue, type QueueObservation } from "./application/queue-observation.js";
import { readMoonrakerEnvironment } from "./adapters/moonraker-environment.js";
import { unavailableEnvironment, type EnvironmentObservation } from "./application/environment-observation.js";
import { readMoonrakerCurrentJob, readMoonrakerJobHistory } from "./adapters/moonraker-jobs.js";
import { unavailableCurrentJob, type CurrentJobObservation } from "./application/current-job-observation.js";
import { unavailableJobHistory, type JobHistoryObservation } from "./application/job-history-observation.js";

const execFileAsync = promisify(execFile);

const QUERY_ROUTE =
  "/printer/objects/query?print_stats&virtual_sdcard&display_status&" +
  "heater_bed&extruder&extruder1&extruder2&extruder3&toolhead&webhooks";
const WEBCAMS_ROUTE = "/server/webcams/list";
// Webcam discovery has its own 3-second cap. These attempts keep the server
// inside the widget's 10-second tool budget and leave 1.5 seconds for decode,
// so bridge-ready loading always terminates within twelve seconds.
export const CAMERA_FRAME_ATTEMPT_TIMEOUTS_SECONDS = [4, 2] as const;
let cachedSnapshotUrl: URL | null = null;
let cachedStreamUrl: URL | null = null;

type JsonObject = Record<string, unknown>;

type ToolheadStatus = {
  physicalTool: number;
  temperature: number | null;
  target: number | null;
  state: string | null;
  active: boolean | null;
};

export type U1Status = {
  schemaVersion: 1;
  stateVersion: number;
  observedAt: string;
  reachable: boolean;
  state: string;
  stateLabel: string;
  progressPercent: number | null;
  currentLayer: number | null;
  totalLayers: number | null;
  elapsedSeconds: number | null;
  remainingSeconds: number | null;
  refreshAfterSeconds: number;
  filename: string | null;
  activePhysicalTool: number | null;
  tools: ToolheadStatus[];
  bed: {
    temperature: number | null;
    target: number | null;
  };
  storage: {
    active: boolean | null;
    filePosition: number | null;
    fileSize: number | null;
  };
  printerMessage: string | null;
  exception: boolean;
  camera: {
    available: boolean;
    service: string | null;
    targetFps: number | null;
  };
};

export type U1WidgetMetadata = {
  cameraFrame?: {
    dataUrl: string;
  };
};

export type U1CameraFrame = {
  schemaVersion: 1;
  observedAt: string;
  available: boolean;
  mediaType: "image/jpeg" | null;
  byteLength: number;
  reason: string | null;
};

export type U1CameraJpeg = {
  bytes: Buffer;
  observedAt: string;
};

/**
 * Removes APP0-APP15, COM, and bytes trailing the first complete JPEG. Camera
 * identity can otherwise leak through EXIF, XMP, ICC/application segments, or
 * comments even when the pixels themselves are safe to relay.
 */
export function stripJpegMetadata(input: Buffer): Buffer {
  if (input.length < 4 || input[0] !== 0xff || input[1] !== 0xd8) {
    throw new Error("Printer camera image invalid");
  }
  const chunks: Buffer[] = [input.subarray(0, 2)];
  let offset = 2;
  let inEntropyData = false;

  while (offset < input.length) {
    if (inEntropyData) {
      let cursor = offset;
      let markerStart = -1;
      while (cursor < input.length) {
        if (input[cursor] !== 0xff) {
          cursor += 1;
          continue;
        }
        const candidateStart = cursor;
        while (cursor < input.length && input[cursor] === 0xff) cursor += 1;
        if (cursor >= input.length) break;
        const marker = input[cursor];
        if (marker === 0x00 || (marker >= 0xd0 && marker <= 0xd7)) {
          cursor += 1;
          continue;
        }
        markerStart = candidateStart;
        break;
      }
      if (markerStart < 0) throw new Error("Printer camera image invalid");
      chunks.push(input.subarray(offset, markerStart));
      offset = markerStart;
      inEntropyData = false;
      continue;
    }

    if (input[offset] !== 0xff) {
      throw new Error("Printer camera image invalid");
    }
    const markerStart = offset;
    while (offset < input.length && input[offset] === 0xff) offset += 1;
    if (offset >= input.length) throw new Error("Printer camera image invalid");
    const marker = input[offset];
    offset += 1;

    if (marker === 0xd9) {
      chunks.push(Buffer.from([0xff, 0xd9]));
      return Buffer.concat(chunks);
    }
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      chunks.push(input.subarray(markerStart, offset));
      continue;
    }
    if (offset + 2 > input.length) {
      throw new Error("Printer camera image invalid");
    }
    const segmentLength = input.readUInt16BE(offset);
    if (segmentLength < 2 || offset + segmentLength > input.length) {
      throw new Error("Printer camera image invalid");
    }
    const segmentEnd = offset + segmentLength;
    const isApplicationMetadata = marker >= 0xe0 && marker <= 0xef;
    const isComment = marker === 0xfe;
    if (!isApplicationMetadata && !isComment) {
      chunks.push(input.subarray(markerStart, segmentEnd));
    }
    offset = segmentEnd;
    if (marker === 0xda) inEntropyData = true;
  }

  throw new Error("Printer camera image invalid");
}

function asObject(value: unknown): JsonObject {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonObject)
    : {};
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asOptionalNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asBoolean(value: unknown): boolean {
  return value === true;
}

function printerBaseUrl(): URL {
  const raw = process.env.MOONRAKER_BASE_URL?.trim() ||
    readLocalConfig().printer.baseUrl;
  return new URL(normalizePrinterBaseUrl(raw));
}

export async function readU1BedMesh(): Promise<BedMeshObservation> {
  try { return await readMoonrakerBedMesh(printerBaseUrl()); }
  catch { return unavailableBedMesh("not_configured", new Date().toISOString()); }
}

export async function readU1Materials(): Promise<MaterialObservation> {
  try { return await readMoonrakerMaterials(printerBaseUrl()); }
  catch { return unavailableMaterials("not_configured", new Date().toISOString()); }
}

export async function readU1Queue(): Promise<QueueObservation> {
  try { return await readMoonrakerQueue(printerBaseUrl()); }
  catch { return unavailableQueue("not_configured", new Date().toISOString()); }
}

export async function readU1Environment(): Promise<EnvironmentObservation> {
  try { return await readMoonrakerEnvironment(printerBaseUrl()); }
  catch { return unavailableEnvironment("not_configured", new Date().toISOString()); }
}

export async function readU1CurrentJob(): Promise<CurrentJobObservation> {
  try { return await readMoonrakerCurrentJob(printerBaseUrl()); }
  catch { return unavailableCurrentJob("not_configured", new Date().toISOString()); }
}

export async function readU1JobHistory(): Promise<JobHistoryObservation> {
  try { return await readMoonrakerJobHistory(printerBaseUrl()); }
  catch { return unavailableJobHistory("not_configured", new Date().toISOString()); }
}

async function fetchJson(route: string, maxTimeSeconds = 6): Promise<JsonObject> {
  const url = new URL(route, printerBaseUrl());
  try {
    const { stdout } = await execFileAsync(
      "curl",
      [
        "--fail-with-body",
        "--silent",
        "--show-error",
        "--connect-timeout",
        "3",
        "--max-time",
        String(maxTimeSeconds),
        "--header",
        "accept: application/json",
        url.toString(),
      ],
      { maxBuffer: 2 * 1024 * 1024 }
    );
    return asObject(JSON.parse(stdout));
  } catch {
    throw new Error("Printer telemetry request failed");
  }
}

async function postJson(
  url: URL,
  payload: JsonObject,
  maxTimeSeconds = 8,
  signal?: AbortSignal
): Promise<JsonObject> {
  return await new Promise<JsonObject>((resolve, reject) => {
    const child = spawn(
      "curl",
      [
        "--fail-with-body",
        "--silent",
        "--show-error",
        "--connect-timeout",
        "3",
        "--max-time",
        String(maxTimeSeconds),
        "--header",
        "content-type: application/json",
        "--data-binary",
        JSON.stringify(payload),
        url.toString(),
      ],
      { stdio: ["ignore", "pipe", "ignore"] }
    );
    let settled = false;
    const chunks: Buffer[] = [];
    let bytes = 0;
    const timer = setTimeout(() => finish(), maxTimeSeconds * 1_000);

    const abort = () => finish();
    signal?.addEventListener("abort", abort, { once: true });

    const finish = (value?: JsonObject) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      signal?.removeEventListener("abort", abort);
      if (!child.killed) child.kill("SIGTERM");
      value ? resolve(value) : reject(new Error("Printer WebRTC signaling failed"));
    };

    child.stdout.on("data", (chunk: Buffer) => {
      if (settled) return;
      bytes += chunk.byteLength;
      if (bytes > 256 * 1024) {
        finish();
        return;
      }
      chunks.push(chunk);
    });
    child.on("error", () => finish());
    child.on("close", (code) => {
      if (code !== 0) {
        finish();
        return;
      }
      try {
        finish(asObject(JSON.parse(Buffer.concat(chunks).toString("utf8"))));
      } catch {
        finish();
      }
    });
  });
}

function basename(filename: string): string | null {
  const cleaned = filename.trim().replaceAll("\\", "/");
  return cleaned ? cleaned.split("/").at(-1) ?? null : null;
}

function recommendedRefreshSeconds(
  state: string,
  progress: number,
  remainingSeconds: number | null,
  hasException: boolean
): number {
  if (hasException || state === "error" || state === "cancelled") return 15;
  if (state !== "printing") return 30;
  if (progress <= 0.03) return 30;
  if (remainingSeconds !== null && remainingSeconds <= 180) return 30;
  if (remainingSeconds !== null && remainingSeconds <= 600) return 90;
  return 300;
}

function stateLabel(state: string, reachable: boolean): string {
  if (!reachable) return "Offline";
  const labels: Record<string, string> = {
    standby: "Ready",
    printing: "Printing",
    paused: "Paused",
    complete: "Complete",
    cancelled: "Cancelled",
    error: "Error",
  };
  return labels[state] ?? "Unknown";
}

const PRINT_STATES = new Set([
  "standby",
  "printing",
  "paused",
  "complete",
  "cancelled",
  "error",
]);

export function normalizedPrintState(value: unknown): string {
  const state = asString(value).trim().toLowerCase();
  return PRINT_STATES.has(state) ? state : "unknown";
}

const TOOL_STATES = new Set([
  "ACTIVE",
  "PARKED",
  "HEATING",
  "COOLING",
  "STANDBY",
  "IDLE",
  "UNKNOWN",
]);

export function normalizedToolState(value: unknown): string {
  const state = asString(value).trim().toUpperCase();
  return TOOL_STATES.has(state) ? state : "UNKNOWN";
}

export function normalizedCameraService(
  value: unknown,
  snapshotAvailable: boolean,
  streamAvailable: boolean
): string | null {
  if (streamAvailable && asString(value) === "webrtc-camerastreamer") {
    return "webrtc";
  }
  return snapshotAvailable ? "snapshot" : null;
}

export function resolveCameraUrl(value: unknown): URL | null {
  const route = asString(value).trim();
  if (!route) return null;

  const printerUrl = printerBaseUrl();
  const cameraUrl = new URL(route, printerUrl);
  return cameraUrl.origin === printerUrl.origin ? cameraUrl : null;
}

export function extractFirstJpeg(bytes: Buffer): Buffer | null {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
  const end = bytes.indexOf(Buffer.from([0xff, 0xd9]), 2);
  return end === -1 ? null : bytes.subarray(0, end + 2);
}

async function fetchJpeg(
  url: URL,
  maxTimeSeconds = 10,
  signal?: AbortSignal
): Promise<Buffer> {
  return await new Promise<Buffer>((resolve, reject) => {
    const child = spawn(
      "curl",
      [
        "--fail-with-body",
        "--silent",
        "--show-error",
        "--connect-timeout",
        "3",
        "--max-time",
        String(maxTimeSeconds),
        url.toString(),
      ],
      { stdio: ["ignore", "pipe", "ignore"] }
    );
    let settled = false;
    let body = Buffer.alloc(0);
    const timer = setTimeout(() => finish(), maxTimeSeconds * 1000);

    const abort = () => finish();
    signal?.addEventListener("abort", abort, { once: true });

    const finish = (jpeg?: Buffer) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      signal?.removeEventListener("abort", abort);
      if (!child.killed) child.kill("SIGTERM");
      if (jpeg) {
        resolve(jpeg);
      } else {
        reject(new Error("Printer camera request failed"));
      }
    };

    child.stdout.on("data", (chunk: Buffer) => {
      if (settled) return;
      body = Buffer.concat([body, chunk]);
      if (body.length > 4 * 1024 * 1024) {
        finish();
        return;
      }
      const jpeg = extractFirstJpeg(body);
      if (jpeg) finish(jpeg);
    });
    child.on("error", () => finish());
    child.on("close", () => finish(extractFirstJpeg(body) ?? undefined));
  });
}

async function cameraSnapshotUrl(): Promise<URL> {
  let snapshotUrl = cachedSnapshotUrl;
  if (!snapshotUrl) {
    const webcamPayload = await fetchJson(WEBCAMS_ROUTE, 3);
    const webcamResult = asObject(webcamPayload.result);
    const webcams = Array.isArray(webcamResult.webcams)
      ? webcamResult.webcams
      : [];
    const webcam =
      webcams.map(asObject).find((item) => item.enabled !== false) ?? {};
    snapshotUrl = resolveCameraUrl(webcam.snapshot_url);
    cachedSnapshotUrl = snapshotUrl;
  }
  if (!snapshotUrl) throw new Error("Printer camera snapshot unavailable");
  return snapshotUrl;
}

async function cameraWebRtcUrl(): Promise<URL> {
  let streamUrl = cachedStreamUrl;
  if (!streamUrl) {
    const webcamPayload = await fetchJson(WEBCAMS_ROUTE, 3);
    const webcamResult = asObject(webcamPayload.result);
    const webcams = Array.isArray(webcamResult.webcams)
      ? webcamResult.webcams
      : [];
    const webcam =
      webcams.map(asObject).find((item) => item.enabled !== false) ?? {};
    if (asString(webcam.service) !== "webrtc-camerastreamer") {
      throw new Error("Printer WebRTC camera unavailable");
    }
    streamUrl = resolveCameraUrl(webcam.stream_url);
    cachedStreamUrl = streamUrl;
  }
  if (!streamUrl) throw new Error("Printer WebRTC camera unavailable");
  return streamUrl;
}

const EMPTY_ICE_SERVER_PROVIDER: CameraIceServerProvider = {
  hasStun: false,
  hasTurn: false,
  turnCredentialTtlSeconds: null,
  issue: () => [],
};

export function createU1CameraWebRtcSignaling(
  iceServerProvider: CameraIceServerProvider = EMPTY_ICE_SERVER_PROVIDER
): CameraWebRtcSignalingSource {
  return {
  async requestOffer(signal) {
    const { iceServers, payload } = createCameraOfferRequest(iceServerProvider);
    const response = await postJson(
      await cameraWebRtcUrl(),
      payload,
      8,
      signal
    );
    if (
      asString(response.type) !== "offer" ||
      !asString(response.id) ||
      !asString(response.sdp)
    ) {
      throw new Error("Printer WebRTC offer invalid");
    }
    return {
      type: "offer",
      id: asString(response.id),
      sdp: asString(response.sdp),
      iceServers,
    } satisfies CameraWebRtcOffer;
  },

  async sendAnswer(id, sdp, signal) {
    await postJson(
      await cameraWebRtcUrl(),
      { type: "answer", id, sdp },
      8,
      signal
    );
  },

  async sendCandidates(id, candidates: CameraIceCandidate[], signal) {
    await postJson(
      await cameraWebRtcUrl(),
      { type: "remote_candidate", id, candidates },
      8,
      signal
    );
  },
  };
}

export function createCameraOfferRequest(
  iceServerProvider: CameraIceServerProvider
): { iceServers: CameraIceServer[]; payload: JsonObject } {
  const iceServers = iceServerProvider.issue();
  return {
    iceServers,
    payload: {
      type: "request",
      // This issue is private to the upstream printer peer. The fan-out service
      // obtains a separate issue for every downstream viewer, so credentials
      // are never shared across the upstream/downstream boundary. The
      // server-side shared secret enters neither request nor MCP results.
      iceServers,
      keepAlive: true,
      timeout_s: 1_800,
    },
  };
}

export const u1CameraWebRtcSignaling = createU1CameraWebRtcSignaling();

export async function readU1CameraJpeg(
  signal?: AbortSignal,
  attemptTimeoutsSeconds: readonly number[] = CAMERA_FRAME_ATTEMPT_TIMEOUTS_SECONDS
): Promise<U1CameraJpeg> {
  if (signal?.aborted) throw new Error("Printer camera request aborted");
  const snapshotUrl = await cameraSnapshotUrl();
  for (const timeout of attemptTimeoutsSeconds) {
    if (signal?.aborted) break;
    const bytes = await fetchJpeg(snapshotUrl, timeout, signal).catch(() => null);
    if (bytes) {
      return {
        bytes: stripJpegMetadata(bytes),
        observedAt: new Date().toISOString(),
      };
    }
    if (signal?.aborted) break;
  }
  throw new Error("Printer camera request failed");
}

export async function readU1CameraFrame(): Promise<{
  frame: U1CameraFrame;
  metadata: U1WidgetMetadata;
}> {
  const observedAt = new Date().toISOString();

  try {
    const { bytes, observedAt: receivedAt } = await readU1CameraJpeg();

    return {
      frame: {
        schemaVersion: 1,
        observedAt: receivedAt,
        available: true,
        mediaType: "image/jpeg",
        byteLength: bytes.length,
        reason: null,
      },
      metadata: {
        cameraFrame: {
          dataUrl: `data:image/jpeg;base64,${bytes.toString("base64")}`,
        },
      },
    };
  } catch (error) {
    return {
      frame: {
        schemaVersion: 1,
        observedAt,
        available: false,
        mediaType: null,
        byteLength: 0,
        reason: "Printer camera unavailable",
      },
      metadata: {},
    };
  }
}

export async function readU1Status(): Promise<{
  status: U1Status;
  monitorEvidence?: MonitorEvidence;
  metadata: U1WidgetMetadata;
}> {
  const observedAt = new Date().toISOString();

  try {
    const queryPayload = await fetchJson(QUERY_ROUTE);
    const monitorEvidence = normalizeMonitorEvidence(queryPayload, new Date().toISOString());
    const webcamPayload = await fetchJson(WEBCAMS_ROUTE, 3).catch(
      (): JsonObject => ({})
    );

    const queryResult = asObject(queryPayload.result);
    const objects = asObject(queryResult.status);
    const printStats = asObject(objects.print_stats);
    const info = asObject(printStats.info);
    const virtualSd = asObject(objects.virtual_sdcard);
    const display = asObject(objects.display_status);
    const bed = asObject(objects.heater_bed);
    const toolhead = asObject(objects.toolhead);
    const activeExtruder = asString(toolhead.extruder);
    const state = normalizedPrintState(printStats.state);
    const rawProgress = asOptionalNumber(display.progress) ??
      asOptionalNumber(virtualSd.progress);
    const progress = rawProgress === null
      ? null
      : Math.max(0, Math.min(1, rawProgress));
    const elapsedSeconds = asOptionalNumber(printStats.print_duration);
    const remainingSeconds =
      state === "printing" && progress !== null && progress > 0 &&
          elapsedSeconds !== null
        ? Math.max(0, elapsedSeconds * ((1 - progress) / progress))
        : state === "complete"
          ? 0
          : null;
    const exception = Object.keys(asObject(printStats.exception)).length > 0;

    const tools = ["extruder", "extruder1", "extruder2", "extruder3"].map(
      (objectName, index): ToolheadStatus => {
        const object = asObject(objects[objectName]);
        const objectObserved = Object.keys(object).length > 0;
        return {
          physicalTool: index + 1,
          temperature: asOptionalNumber(object.temperature),
          target: asOptionalNumber(object.target),
          state: typeof object.state === "string"
            ? normalizedToolState(object.state)
            : null,
          active: objectObserved && activeExtruder
            ? activeExtruder === objectName
            : null,
        };
      }
    );

    const webcamResult = asObject(webcamPayload.result);
    const webcams = Array.isArray(webcamResult.webcams) ? webcamResult.webcams : [];
    const webcam = webcams.map(asObject).find((item) => item.enabled !== false) ?? {};
    const snapshotUrl = resolveCameraUrl(webcam.snapshot_url);
    const streamUrl = resolveCameraUrl(webcam.stream_url);
    if (snapshotUrl) cachedSnapshotUrl = snapshotUrl;
    if (streamUrl && asString(webcam.service) === "webrtc-camerastreamer") {
      cachedStreamUrl = streamUrl;
    }

    return {
      monitorEvidence,
      status: {
        schemaVersion: 1,
        stateVersion: Date.now(),
        observedAt,
        reachable: true,
        state,
        stateLabel: stateLabel(state, true),
        progressPercent: progress === null
          ? null
          : Math.round(progress * 1_000) / 10,
        currentLayer:
          typeof info.current_layer === "number" ? info.current_layer : null,
        totalLayers: typeof info.total_layer === "number" ? info.total_layer : null,
        elapsedSeconds,
        remainingSeconds,
        refreshAfterSeconds: recommendedRefreshSeconds(
          state,
          progress ?? 0,
          remainingSeconds,
          exception
        ),
        filename: basename(asString(printStats.filename)),
        activePhysicalTool:
          activeExtruder === "extruder"
            ? 1
            : /^extruder[1-3]$/.test(activeExtruder)
              ? Number(activeExtruder.slice(-1)) + 1
              : null,
        tools,
        bed: {
          temperature: asOptionalNumber(bed.temperature),
          target: asOptionalNumber(bed.target),
        },
        storage: {
          active: typeof virtualSd.is_active === "boolean"
            ? virtualSd.is_active
            : null,
          filePosition: asOptionalNumber(virtualSd.file_position),
          fileSize: asOptionalNumber(virtualSd.file_size),
        },
        printerMessage: asString(printStats.message)
          ? exception
            ? "Printer reported an exception."
            : "Printer reported a status message."
          : null,
        exception,
        camera: {
          available: Boolean(snapshotUrl || streamUrl),
          service: normalizedCameraService(
            webcam.service,
            Boolean(snapshotUrl),
            Boolean(streamUrl)
          ),
          targetFps:
            typeof webcam.target_fps === "number" ? webcam.target_fps : null,
        },
      },
      metadata: {},
    };
  } catch (error) {
    return {
      status: {
        schemaVersion: 1,
        stateVersion: Date.now(),
        observedAt,
        reachable: false,
        state: "offline",
        stateLabel: stateLabel("offline", false),
        progressPercent: null,
        currentLayer: null,
        totalLayers: null,
        elapsedSeconds: null,
        remainingSeconds: null,
        refreshAfterSeconds: 15,
        filename: null,
        activePhysicalTool: null,
        tools: [],
        bed: { temperature: null, target: null },
        storage: { active: null, filePosition: null, fileSize: null },
        printerMessage: "Printer unavailable",
        exception: true,
        camera: { available: false, service: null, targetFps: null },
      },
      metadata: {},
    };
  }
}
