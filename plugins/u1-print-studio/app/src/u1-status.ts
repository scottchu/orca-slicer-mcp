import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";

import type {
  CameraIceCandidate,
  CameraIceServer,
  CameraWebRtcOffer,
  CameraWebRtcSignalingSource,
} from "./application/camera-webrtc.js";

const execFileAsync = promisify(execFile);

const QUERY_ROUTE =
  "/printer/objects/query?print_stats&virtual_sdcard&display_status&" +
  "heater_bed&extruder&extruder1&extruder2&extruder3&toolhead&webhooks";
const WEBCAMS_ROUTE = "/server/webcams/list";
export const CAMERA_FRAME_ATTEMPT_TIMEOUTS_SECONDS = [20, 10] as const;
const CAMERA_ICE_SERVERS: CameraIceServer[] = [
  { urls: ["stun:stun.l.google.com:19302"] },
];
let cachedSnapshotUrl: URL | null = null;
let cachedStreamUrl: URL | null = null;

type JsonObject = Record<string, unknown>;

type ToolheadStatus = {
  physicalTool: number;
  temperature: number;
  target: number;
  state: string;
  active: boolean;
};

export type U1Status = {
  schemaVersion: 1;
  stateVersion: number;
  observedAt: string;
  reachable: boolean;
  state: string;
  stateLabel: string;
  progressPercent: number;
  currentLayer: number | null;
  totalLayers: number | null;
  elapsedSeconds: number;
  remainingSeconds: number | null;
  refreshAfterSeconds: number;
  filename: string | null;
  activePhysicalTool: number | null;
  tools: ToolheadStatus[];
  bed: {
    temperature: number;
    target: number;
  };
  storage: {
    active: boolean;
    filePosition: number;
    fileSize: number;
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

function asObject(value: unknown): JsonObject {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonObject)
    : {};
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asBoolean(value: unknown): boolean {
  return value === true;
}

function printerBaseUrl(): URL {
  const raw = process.env.MOONRAKER_BASE_URL?.trim();
  if (!raw) {
    throw new Error("MOONRAKER_BASE_URL is not configured");
  }

  const url = new URL(raw);
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("MOONRAKER_BASE_URL must use http or https");
  }
  return url;
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
  return labels[state] ?? state.replace(/^./, (letter) => letter.toUpperCase());
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

function cameraIceServers(value: unknown): CameraIceServer[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((candidate) => {
    const object = asObject(candidate);
    const rawUrls = object.urls;
    const urls = typeof rawUrls === "string"
      ? rawUrls
      : Array.isArray(rawUrls) && rawUrls.every((url) => typeof url === "string")
        ? rawUrls as string[]
        : null;
    if (!urls) return [];
    const server: CameraIceServer = { urls };
    if (typeof object.username === "string") server.username = object.username;
    if (typeof object.credential === "string") server.credential = object.credential;
    return [server];
  });
}

export const u1CameraWebRtcSignaling: CameraWebRtcSignalingSource = {
  async requestOffer(signal) {
    const response = await postJson(
      await cameraWebRtcUrl(),
      {
        type: "request",
        // Match the printer's own webrtc-camerastreamer client so both peers
        // can gather server-reflexive candidates when the network permits it.
        iceServers: CAMERA_ICE_SERVERS,
        keepAlive: true,
        timeout_s: 1_800,
      },
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
    const iceServers = cameraIceServers(response.iceServers);
    return {
      type: "offer",
      id: asString(response.id),
      sdp: asString(response.sdp),
      iceServers: iceServers.length > 0 ? iceServers : CAMERA_ICE_SERVERS,
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
      return { bytes, observedAt: new Date().toISOString() };
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
    const { bytes } = await readU1CameraJpeg();

    return {
      frame: {
        schemaVersion: 1,
        observedAt,
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
        reason:
          error instanceof Error ? error.message : "Printer camera unavailable",
      },
      metadata: {},
    };
  }
}

export async function readU1Status(): Promise<{
  status: U1Status;
  metadata: U1WidgetMetadata;
}> {
  const observedAt = new Date().toISOString();

  try {
    const queryPayload = await fetchJson(QUERY_ROUTE);
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
    const rawState = asString(printStats.state) || "standby";
    const progress = Math.max(
      0,
      Math.min(1, asNumber(display.progress, asNumber(virtualSd.progress)))
    );
    const elapsedSeconds = asNumber(printStats.print_duration);
    const remainingSeconds =
      rawState === "printing" && progress > 0
        ? Math.max(0, elapsedSeconds * ((1 - progress) / progress))
        : rawState === "complete"
          ? 0
          : null;
    const exception = Object.keys(asObject(printStats.exception)).length > 0;

    const tools = ["extruder", "extruder1", "extruder2", "extruder3"].map(
      (objectName, index): ToolheadStatus => {
        const object = asObject(objects[objectName]);
        return {
          physicalTool: index + 1,
          temperature: asNumber(object.temperature),
          target: asNumber(object.target),
          state: asString(object.state) || "UNKNOWN",
          active: activeExtruder === objectName,
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
      status: {
        schemaVersion: 1,
        stateVersion: Date.now(),
        observedAt,
        reachable: true,
        state: rawState,
        stateLabel: stateLabel(rawState, true),
        progressPercent: Math.round(progress * 1_000) / 10,
        currentLayer:
          typeof info.current_layer === "number" ? info.current_layer : null,
        totalLayers: typeof info.total_layer === "number" ? info.total_layer : null,
        elapsedSeconds,
        remainingSeconds,
        refreshAfterSeconds: recommendedRefreshSeconds(
          rawState,
          progress,
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
          temperature: asNumber(bed.temperature),
          target: asNumber(bed.target),
        },
        storage: {
          active: asBoolean(virtualSd.is_active),
          filePosition: asNumber(virtualSd.file_position),
          fileSize: asNumber(virtualSd.file_size),
        },
        printerMessage: asString(printStats.message) || null,
        exception,
        camera: {
          available: Boolean(snapshotUrl || streamUrl),
          service: asString(webcam.service) || null,
          targetFps:
            typeof webcam.target_fps === "number" ? webcam.target_fps : null,
        },
      },
      metadata: {},
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Printer unavailable";
    return {
      status: {
        schemaVersion: 1,
        stateVersion: Date.now(),
        observedAt,
        reachable: false,
        state: "offline",
        stateLabel: stateLabel("offline", false),
        progressPercent: 0,
        currentLayer: null,
        totalLayers: null,
        elapsedSeconds: 0,
        remainingSeconds: null,
        refreshAfterSeconds: 15,
        filename: null,
        activePhysicalTool: null,
        tools: [],
        bed: { temperature: 0, target: 0 },
        storage: { active: false, filePosition: 0, fileSize: 0 },
        printerMessage: message,
        exception: true,
        camera: { available: false, service: null, targetFps: null },
      },
      metadata: {},
    };
  }
}
