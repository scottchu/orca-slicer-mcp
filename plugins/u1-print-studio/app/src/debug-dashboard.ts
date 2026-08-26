import { readFileSync } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  cameraFramePayload,
  cameraStreamPayload,
  resultPayload,
} from "./app.js";
import type { OpenedCameraStream } from "./application/camera-relay.js";
import {
  readU1CameraFrame,
  readU1Status,
} from "./u1-status.js";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const DEBUG_HOST_PATH = path.resolve(
  currentDirectory,
  "..",
  "public",
  "debug-host.html"
);
const DEBUG_PATH = "/debug";
const DEBUG_TOOL_PATH = "/debug/tools/call";
const MAX_REQUEST_BYTES = 4 * 1024;

type StatusReader = typeof readU1Status;
type CameraFrameReader = typeof readU1CameraFrame;

export type DebugDashboardDependencies = {
  readStatus?: StatusReader;
  readCameraFrame?: CameraFrameReader;
  openCameraStream?: () => OpenedCameraStream;
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

export function createDebugDashboardHandler(
  dependencies: DebugDashboardDependencies = {}
) {
  const readStatus = dependencies.readStatus ?? readU1Status;
  const readCameraFrame =
    dependencies.readCameraFrame ?? readU1CameraFrame;

  return async (
    req: IncomingMessage,
    res: ServerResponse,
    pathname: string
  ): Promise<boolean> => {
    if (pathname === DEBUG_PATH) {
      if (req.method !== "GET") {
        res.setHeader("allow", "GET");
        json(res, 405, { error: "method_not_allowed" });
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
      res.end(readFileSync(DEBUG_HOST_PATH, "utf8"));
      return true;
    }

    if (pathname !== DEBUG_TOOL_PATH) return false;
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

      if (name === "get_u1_status") {
        const { status, metadata } = await readStatus();
        json(res, 200, resultPayload(status, metadata));
        return true;
      }
      if (name === "get_u1_camera_frame") {
        const { frame, metadata } = await readCameraFrame();
        json(res, 200, cameraFramePayload(frame, metadata));
        return true;
      }
      if (name === "open_u1_camera_stream" && dependencies.openCameraStream) {
        json(res, 200, cameraStreamPayload(dependencies.openCameraStream()));
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
