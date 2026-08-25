import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const QUERY_ROUTE =
  "/printer/objects/query?print_stats&virtual_sdcard&display_status&" +
  "heater_bed&extruder&extruder1&extruder2&extruder3&toolhead&webhooks";
const WEBCAMS_ROUTE = "/server/webcams/list";
let cachedSnapshotUrl: URL | null = null;

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

async function fetchJpeg(url: URL, maxTimeSeconds = 10): Promise<Buffer> {
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

    const finish = (jpeg?: Buffer) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
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

export async function readU1CameraFrame(): Promise<{
  frame: U1CameraFrame;
  metadata: U1WidgetMetadata;
}> {
  const observedAt = new Date().toISOString();

  try {
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

    let bytes: Buffer | null = null;
    const attemptTimeouts = [10, 3];
    for (const timeout of attemptTimeouts) {
      if (bytes) break;
      bytes = await fetchJpeg(snapshotUrl, timeout).catch(() => null);
    }
    if (!bytes) throw new Error("Printer camera request failed");

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
