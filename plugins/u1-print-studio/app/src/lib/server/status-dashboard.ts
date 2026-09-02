import { setResponse } from '@sveltejs/kit/node';
import { callDashboardTool } from './dashboard-tools.js';
import { readFileSync } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import embeddedCameraDashboardHostFile from "../../../public/camera-dashboard-host.html" with { type: "file" };
import embeddedDashboardHostFile from "../../../public/status-dashboard-host.html" with { type: "file" };
// Inline this static page in bundles so existing supervised releases keep their
// fixed asset inventory and remain verifiable rollback targets.
import dashboardIndexHtml from "../../../public/dashboard-index.html" with { type: "text" };
// This deterministic SvelteKit output is self-contained and compiled into the
// private dashboard bundle. It is not part of the public service or MCP assets.
import observationLabHtml from "../../../public/svelte-observation-lab.html" with { type: "text" };
import bedMeshLabHtml from "../../../public/svelte-bed-mesh-lab.html" with { type: "text" };
import liveFansHtml from "../../../public/svelte-live-fans.html" with { type: "text" };
import liveThermalsHtml from "../../../public/svelte-live-thermals.html" with { type: "text" };
import liveHeadsHtml from "../../../public/svelte-live-heads.html" with { type: "text" };
import liveQueueHtml from "../../../public/svelte-live-queue.html" with { type: "text" };
import liveCameraHtml from "../../../public/svelte-live-camera.html" with { type: "text" };
import cameraLabHtml from "../../../public/svelte-camera-lab.html" with { type: "text" };

import {
  readCameraWidgetHtml,
  cameraFramePayload,
  cameraStreamPayload,
  observationPayload,
  resultPayload,
} from "./app.js";
import {
  OBSERVATION_VIEWS,
  type ObservationView,
} from "./observation-presentation.js";
import { PrinterObservationStore } from "./observation-store.js";
import type {
  CameraIceCandidate,
  CameraWebRtcSessionController,
} from "./application/camera-webrtc.js";
import {
  readU1CameraFrame,
  readU1Status,
  readU1BedMesh,
  readU1Materials,
  readU1Queue,
  readU1Environment,
  readU1CurrentJob,
  readU1JobHistory,
} from "./u1-status.js";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const IS_COMPILED = currentDirectory.startsWith("/$bunfs/");
const ASSET_ROOT = currentDirectory.endsWith('/src/lib/server')
  ? path.resolve(currentDirectory, '../../../public') : currentDirectory;
const DASHBOARD_HOST_PATH = path.join(ASSET_ROOT, 'status-dashboard-host.html');
const CAMERA_DASHBOARD_HOST_PATH = path.join(ASSET_ROOT, 'camera-dashboard-host.html');
const DASHBOARD_PATH = "/dashboard";
const OBSERVATION_LAB_PATHS = new Set([
  "/dashboard/lab",
  "/dashboard/lab/overview",
  "/dashboard/lab/progress",
  "/dashboard/lab/thermals",
  "/dashboard/lab/heads",
  "/dashboard/lab/jobs",
  "/dashboard/lab/job_history",
  "/dashboard/lab/queue",
  "/dashboard/lab/fans",
]);
const BED_MESH_LAB_PATH = "/dashboard/lab/bed_mesh";
const CAMERA_LAB_PATH = "/dashboard/lab/camera";
const FOCUSED_DASHBOARD_PATHS = new Set([
  "/dashboard/overview",
  "/dashboard/progress",
  "/dashboard/thermals",
  "/dashboard/heads",
  "/dashboard/jobs",
  "/dashboard/job_history",
  "/dashboard/queue",
  "/dashboard/fans",
  "/dashboard/bed_mesh",
]);
const CAMERA_DASHBOARD_PATH = "/dashboard/camera";
const LIVE_FANS_WIDGET_PATH = "/dashboard/fans_widget";
const LIVE_THERMALS_WIDGET_PATH = "/dashboard/thermals_widget";
const LIVE_HEADS_WIDGET_PATH = "/dashboard/heads_widget";
const LIVE_QUEUE_WIDGET_PATH = "/dashboard/queue_widget";
const LIVE_CAMERA_WIDGET_PATH = "/dashboard/camera_widget";
const CAMERA_WIDGET_PATH = "/camera-widget";
const DASHBOARD_TOOL_PATH = "/dashboard/tools/call";
const MAX_REQUEST_BYTES = 128 * 1024;

function hasRawTraversal(requestTarget: string | undefined): boolean {
  if (!requestTarget) return false;
  let candidate = requestTarget.split(/[?#]/, 1)[0] ?? "";
  for (let pass = 0; pass < 3; pass += 1) {
    if (candidate.split("/").some((segment) => segment === "..")) return true;
    try {
      const decoded = decodeURIComponent(candidate);
      if (decoded === candidate) break;
      candidate = decoded;
    } catch {
      return true;
    }
  }
  return candidate.split("/").some((segment) => segment === "..");
}

type StatusReader = typeof readU1Status;
type CameraFrameReader = typeof readU1CameraFrame;

export type StatusDashboardDependencies = {
  readStatus?: StatusReader;
  readBedMesh?: typeof readU1BedMesh;
  readMaterials?: typeof readU1Materials;
  readQueue?: typeof readU1Queue;
  readEnvironment?: typeof readU1Environment;
  readCurrentJob?: typeof readU1CurrentJob;
  readJobHistory?: typeof readU1JobHistory;
  observations?: PrinterObservationStore;
  readCameraFrame?: CameraFrameReader;
  cameraSessions?: CameraWebRtcSessionController;
};

function json(
  res: ServerResponse,
  status: number,
  payload: unknown
): void {
  res.writeHead(status, {
    "cache-control": "no-store",
    "content-type": "application/json; charset=utf-8",
    "referrer-policy": "no-referrer",
    "x-content-type-options": "nosniff",
  });
  res.end(JSON.stringify(payload));
}

async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let bytes = 0;
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    bytes += buffer.byteLength;
    if (bytes > MAX_REQUEST_BYTES) throw new Error("request_too_large");
    chunks.push(buffer);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

export function createStatusDashboardHandler(
  dependencies: StatusDashboardDependencies = {}
) {
  const readStatus = dependencies.readStatus ?? readU1Status;
  const readCameraFrame =
    dependencies.readCameraFrame ?? readU1CameraFrame;
  const observations = dependencies.observations ?? new PrinterObservationStore(
    readStatus, undefined, dependencies.readBedMesh ?? (readStatus === readU1Status ? readU1BedMesh : undefined),
    dependencies.readMaterials ?? (readStatus === readU1Status ? readU1Materials : undefined),
    dependencies.readQueue ?? (readStatus === readU1Status ? readU1Queue : undefined),
    dependencies.readEnvironment ?? (readStatus === readU1Status ? readU1Environment : undefined),
    dependencies.readCurrentJob ?? (readStatus === readU1Status ? readU1CurrentJob : undefined),
    dependencies.readJobHistory ?? (readStatus === readU1Status ? readU1JobHistory : undefined)
  );

  return async (req: IncomingMessage, res: ServerResponse, pathname: string): Promise<boolean> => {
    if (hasRawTraversal(req.url)) return false;
    const page = dashboardPage(pathname, req.method ?? 'GET');
    if (page) { await setResponse(res, page); return true; }
    if (pathname !== DASHBOARD_TOOL_PATH) return false;
    if (req.method !== "POST") {
      res.setHeader("allow", "POST");
      json(res, 405, { error: "method_not_allowed" });
      return true;
    }

    try {
      const result = await callDashboardTool(await readJsonBody(req), observations, dependencies);
      json(res, result.status, result.body);
    } catch (error) {
      const oversized = error instanceof Error && error.message === 'request_too_large';
      json(res, oversized ? 413 : 400, { error: oversized ? 'request_too_large' : 'invalid_request' });
    }
    return true;
  };
}

const pageResponse = (html: unknown, csp: string): Response => new Response(html as string, {
  headers: { 'cache-control': 'no-store', 'content-security-policy': csp,
    'content-type': 'text/html; charset=utf-8', 'referrer-policy': 'no-referrer', 'x-content-type-options': 'nosniff' }
});
export const dashboardPage = (pathname: string, method = 'GET'): Response | null => {
  const normalized = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  const live = new Map([[LIVE_FANS_WIDGET_PATH, liveFansHtml], [LIVE_THERMALS_WIDGET_PATH, liveThermalsHtml],
    [LIVE_HEADS_WIDGET_PATH, liveHeadsHtml], [LIVE_QUEUE_WIDGET_PATH, liveQueueHtml]]);
  const isLab = OBSERVATION_LAB_PATHS.has(normalized) || normalized === BED_MESH_LAB_PATH || normalized === CAMERA_LAB_PATH;
  const isIndex = pathname === DASHBOARD_PATH || pathname === DASHBOARD_PATH + '/';
  const isFocused = FOCUSED_DASHBOARD_PATHS.has(pathname) || pathname === CAMERA_DASHBOARD_PATH;
  const isCamera = pathname === CAMERA_WIDGET_PATH || pathname === LIVE_CAMERA_WIDGET_PATH;
  if (!live.has(pathname) && !isLab && !isIndex && !isFocused && !isCamera) return null;
  if (method !== 'GET') return new Response(JSON.stringify({ error: 'method_not_allowed' }), {
    status: 405, headers: { allow: 'GET', 'cache-control': 'no-store', 'content-type': 'application/json; charset=utf-8', 'referrer-policy': 'no-referrer', 'x-content-type-options': 'nosniff' }
  });
  if (live.has(pathname)) return pageResponse(live.get(pathname)!, "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'self'");
  if (isLab) return pageResponse(normalized === CAMERA_LAB_PATH ? cameraLabHtml : normalized === BED_MESH_LAB_PATH ? bedMeshLabHtml : observationLabHtml,
    "default-src 'none'; img-src data:; script-src 'unsafe-inline'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'");
  if (isIndex) return pageResponse(dashboardIndexHtml, "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'");
  if (isCamera) return pageResponse(pathname === LIVE_CAMERA_WIDGET_PATH ? liveCameraHtml : readCameraWidgetHtml(),
    "default-src 'none'; img-src data:; media-src blob:; script-src 'unsafe-inline'; style-src 'unsafe-inline'");
  const camera = pathname === CAMERA_DASHBOARD_PATH;
  const html = readFileSync(IS_COMPILED ? (camera ? embeddedCameraDashboardHostFile : embeddedDashboardHostFile) as unknown as string : camera ? CAMERA_DASHBOARD_HOST_PATH : DASHBOARD_HOST_PATH, 'utf8');
  return pageResponse(html, "default-src 'self'; img-src 'self' data:; frame-src 'self'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self'");
};
