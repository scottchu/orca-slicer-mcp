import { readFileSync } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import embeddedCameraDashboardHostFile from "../public/camera-dashboard-host.html" with { type: "file" };
import embeddedDashboardHostFile from "../public/status-dashboard-host.html" with { type: "file" };
// Inline this static page in bundles so existing supervised releases keep their
// fixed asset inventory and remain verifiable rollback targets.
import dashboardIndexHtml from "../public/dashboard-index.html" with { type: "text" };
// This deterministic SvelteKit output is self-contained and compiled into the
// private dashboard bundle. It is not part of the public service or MCP assets.
import observationLabHtml from "../public/svelte-observation-lab.html" with { type: "text" };
import liveFansHtml from "../public/svelte-live-fans.html" with { type: "text" };
import liveCameraHtml from "../public/svelte-live-camera.html" with { type: "text" };
import cameraLabHtml from "../public/svelte-camera-lab.html" with { type: "text" };

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
const DASHBOARD_HOST_PATH = path.resolve(
  currentDirectory.startsWith("/$bunfs/")
    ? currentDirectory
    : path.resolve(currentDirectory, ".."),
  "public",
  "status-dashboard-host.html"
);
const CAMERA_DASHBOARD_HOST_PATH = path.resolve(
  currentDirectory.startsWith("/$bunfs/")
    ? currentDirectory
    : path.resolve(currentDirectory, ".."),
  "public",
  "camera-dashboard-host.html"
);
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
  "/dashboard/lab/bed_mesh",
]);
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

  return async (
    req: IncomingMessage,
    res: ServerResponse,
    pathname: string
  ): Promise<boolean> => {
    // WHATWG URL parsing removes dot segments. Inspect the original request
    // target first so literal and encoded traversal can never alias a lab URL.
    if (hasRawTraversal(req.url)) return false;
    if (pathname === LIVE_FANS_WIDGET_PATH) {
      if (req.method !== "GET") {
        res.setHeader("allow", "GET");
        json(res, 405, { error: "method_not_allowed" });
        return true;
      }
      res.writeHead(200, {
        "cache-control": "no-store",
        "content-security-policy": "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'self'",
        "content-type": "text/html; charset=utf-8",
        "referrer-policy": "no-referrer",
        "x-content-type-options": "nosniff",
      }).end(liveFansHtml);
      return true;
    }
    const isIndex = pathname === DASHBOARD_PATH || pathname === DASHBOARD_PATH + "/";
    const normalizedLabPath = pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
    if (OBSERVATION_LAB_PATHS.has(normalizedLabPath) || normalizedLabPath === CAMERA_LAB_PATH) {
      if (req.method !== "GET") {
        res.setHeader("allow", "GET");
        json(res, 405, { error: "method_not_allowed" });
        return true;
      }
      res.writeHead(200, {
        "cache-control": "no-store",
        "content-security-policy":
          "default-src 'none'; img-src data:; " +
          "script-src 'unsafe-inline'; style-src 'unsafe-inline'; " +
          "base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
        "content-type": "text/html; charset=utf-8",
        "referrer-policy": "no-referrer",
        "x-content-type-options": "nosniff",
      });
      res.end(normalizedLabPath === CAMERA_LAB_PATH ? cameraLabHtml : observationLabHtml);
      return true;
    }
    if (isIndex || FOCUSED_DASHBOARD_PATHS.has(pathname) ||
        pathname === CAMERA_DASHBOARD_PATH) {
      if (req.method !== "GET") {
        res.setHeader("allow", "GET");
        json(res, 405, { error: "method_not_allowed" });
        return true;
      }
      if (isIndex) {
        res.writeHead(200, {
          "cache-control": "no-store",
          "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
          "content-type": "text/html; charset=utf-8",
          "referrer-policy": "no-referrer",
          "x-content-type-options": "nosniff",
        }).end(dashboardIndexHtml);
        return true;
      }
      res.writeHead(200, {
        "cache-control": "no-store",
        "content-security-policy":
          "default-src 'self'; img-src 'self' data:; " +
          "frame-src 'self'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; " +
          "connect-src 'self'",
        "content-type": "text/html; charset=utf-8",
        "referrer-policy": "no-referrer",
        "x-content-type-options": "nosniff",
      });
      res.end(
        IS_COMPILED
          ? readFileSync(
              (pathname === CAMERA_DASHBOARD_PATH
                ? embeddedCameraDashboardHostFile
                : embeddedDashboardHostFile) as unknown as string,
              "utf8"
            )
          : readFileSync(
              pathname === CAMERA_DASHBOARD_PATH
                ? CAMERA_DASHBOARD_HOST_PATH
                : DASHBOARD_HOST_PATH,
              "utf8"
            )
      );
      return true;
    }

    if (pathname === CAMERA_WIDGET_PATH || pathname === LIVE_CAMERA_WIDGET_PATH) {
      if (req.method !== "GET") {
        res.setHeader("allow", "GET");
        json(res, 405, { error: "method_not_allowed" });
        return true;
      }
      res.writeHead(200, {
        "cache-control": "no-store",
        "content-security-policy":
          "default-src 'none'; img-src data:; media-src blob:; " +
          "script-src 'unsafe-inline'; style-src 'unsafe-inline'",
        "content-type": "text/html; charset=utf-8",
        "referrer-policy": "no-referrer",
        "x-content-type-options": "nosniff",
      });
      res.end(pathname === LIVE_CAMERA_WIDGET_PATH ? liveCameraHtml : readCameraWidgetHtml());
      return true;
    }

    if (pathname !== DASHBOARD_TOOL_PATH) return false;
    if (req.method !== "POST") {
      res.setHeader("allow", "POST");
      json(res, 405, { error: "method_not_allowed" });
      return true;
    }

    try {
      const body = await readJsonBody(req);
      const name =
        body && typeof body === "object" && "name" in body
          ? (body as { name?: unknown }).name
          : null;
      const argumentsValue =
        body && typeof body === "object" && "arguments" in body
          ? (body as { arguments?: unknown }).arguments
          : {};
      const argumentsObject =
        argumentsValue &&
        typeof argumentsValue === "object" &&
        !Array.isArray(argumentsValue)
          ? (argumentsValue as Record<string, unknown>)
          : {};

      if (name === "get_u1_status") {
        const snapshot = await observations.current({ refresh: true });
        json(res, 200, resultPayload(snapshot.status, snapshot.metadata));
        return true;
      }
      if (name === "refresh_printer_observation") {
        const view = argumentsObject.view;
        if (
          !OBSERVATION_VIEWS.includes(view as ObservationView) ||
          Object.keys(argumentsObject).some((key) => key !== "view")
        ) {
          json(res, 400, { error: "invalid_observation_view" });
          return true;
        }
        json(
          res,
          200,
          observationPayload(
            await observations.current({ refresh: true, includeBedMesh: view === "bed_mesh" || view === "overview", includeMaterials: view === "heads" || view === "overview", includeQueue: view === "queue" || view === "overview", includeEnvironment: view === "thermals" || view === "fans" || view === "overview", includeCurrentJob: view === "jobs" || view === "overview", includeJobHistory: view === "job_history" || view === "overview" }),
            view as ObservationView
          )
        );
        return true;
      }
      if (name === "get_u1_camera_frame") {
        const { frame, metadata } = await readCameraFrame();
        const activation =
          argumentsObject.authorizeLive === true && dependencies.cameraSessions
            ? dependencies.cameraSessions.authorize()
            : undefined;
        json(res, 200, cameraFramePayload(frame, metadata, activation));
        return true;
      }
      if (name === "open_u1_camera_stream" && dependencies.cameraSessions) {
        json(
          res,
          200,
          cameraStreamPayload(
            await dependencies.cameraSessions.open(
              String(argumentsObject.activationToken ?? "")
            )
          )
        );
        return true;
      }
      if (name === "answer_u1_camera_stream" && dependencies.cameraSessions) {
        json(
          res,
          200,
          await dependencies.cameraSessions.answer(
            String(argumentsObject.sessionId ?? ""),
            String(argumentsObject.sdp ?? "")
          )
        );
        return true;
      }
      if (
        name === "add_u1_camera_ice_candidates" &&
        dependencies.cameraSessions
      ) {
        json(
          res,
          200,
          await dependencies.cameraSessions.addCandidates(
            String(argumentsObject.sessionId ?? ""),
            Array.isArray(argumentsObject.candidates)
              ? argumentsObject.candidates as CameraIceCandidate[]
              : []
          )
        );
        return true;
      }
      if (name === "close_u1_camera_stream" && dependencies.cameraSessions) {
        json(
          res,
          200,
          dependencies.cameraSessions.close(
            String(argumentsObject.sessionId ?? "")
          )
        );
        return true;
      }

      json(res, 400, { error: "unsupported_read_only_tool" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown_error";
      json(res, message === "request_too_large" ? 413 : 400, {
        error: message === "request_too_large" ? message : "invalid_request",
      });
    }
    return true;
  };
}
