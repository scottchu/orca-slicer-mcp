import type { IncomingMessage, ServerResponse } from "node:http";

import {
  CameraWebRtcSessionError,
  type CameraViewerSessionStore,
} from "../application/camera-webrtc.js";
import {
  CameraRelayClaimError,
  type CameraRelayService,
} from "../application/camera-relay.js";

export const CAMERA_WEBRTC_PATH = "/media/camera.webrtc";
const MAX_SIGNAL_BYTES = 128 * 1024;

export function createCameraStreamLocator(publicBaseUrl: URL) {
  const basePath = publicBaseUrl.pathname === "/"
    ? ""
    : publicBaseUrl.pathname.replace(/\/$/, "");
  return {
    locate(token: string): string {
      const url = new URL(`${basePath}${CAMERA_WEBRTC_PATH}`, publicBaseUrl.origin);
      url.searchParams.set("ticket", token);
      return url.toString();
    },
  };
}

function respond(
  res: ServerResponse,
  status: number,
  payload: unknown
): void {
  res.writeHead(status, {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "POST, DELETE, OPTIONS",
    "access-control-allow-headers": "content-type",
    "cache-control": "no-store",
    "content-type": "application/json; charset=utf-8",
    "referrer-policy": "no-referrer",
    "x-content-type-options": "nosniff",
  });
  res.end(JSON.stringify(payload));
}

async function readJsonBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  let bytes = 0;
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    bytes += buffer.byteLength;
    if (bytes > MAX_SIGNAL_BYTES) throw new Error("signal_too_large");
    chunks.push(buffer);
  }
  const parsed = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("invalid_signal");
  }
  return parsed as Record<string, unknown>;
}

function signalingError(res: ServerResponse, error: unknown): void {
  if (error instanceof CameraRelayClaimError && error.reason === "busy") {
    respond(res, 429, { error: "camera_stream_busy" });
    return;
  }
  if (error instanceof CameraRelayClaimError && error.reason === "expired") {
    respond(res, 410, { error: "camera_stream_expired" });
    return;
  }
  if (error instanceof CameraWebRtcSessionError) {
    const status = error.reason === "expired_session" ? 410 : 400;
    respond(res, status, { error: error.reason });
    return;
  }
  respond(res, 401, { error: "invalid_camera_stream_ticket" });
}

export function createCameraWebRtcHandler(
  relay: CameraRelayService,
  sessions: CameraViewerSessionStore
) {
  return async (
    req: IncomingMessage,
    res: ServerResponse,
    pathname: string,
    url: URL
  ): Promise<boolean> => {
    if (pathname !== CAMERA_WEBRTC_PATH) return false;

    if (req.method === "OPTIONS") {
      res.writeHead(204, {
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "POST, DELETE, OPTIONS",
        "access-control-allow-headers": "content-type",
        "access-control-max-age": "600",
      });
      res.end();
      return true;
    }

    const token = url.searchParams.get("ticket") ?? "";
    if (req.method === "DELETE") {
      const result = sessions.close(token);
      if (!result.closed) {
        respond(res, 401, { error: "invalid_camera_stream_session" });
      } else {
        respond(res, 200, result);
      }
      return true;
    }

    if (req.method !== "POST") {
      res.setHeader("allow", "POST, DELETE, OPTIONS");
      respond(res, 405, { error: "method_not_allowed" });
      return true;
    }

    let body: Record<string, unknown>;
    try {
      body = await readJsonBody(req);
    } catch (error) {
      respond(
        res,
        error instanceof Error && error.message === "signal_too_large" ? 413 : 400,
        { error: error instanceof Error ? error.message : "invalid_signal" }
      );
      return true;
    }

    const type = typeof body.type === "string" ? body.type : "";
    try {
      if (type === "request") {
        const opened = await sessions.open(relay.claim(token), token);
        respond(res, 200, {
          type: opened.type,
          sdp: opened.sdp,
          iceServers: opened.iceServers,
          expiresAt: opened.expiresAt,
        });
        return true;
      }
      if (type === "answer") {
        respond(res, 200, await sessions.answer(token, body.sdp));
        return true;
      }
      if (type === "remote_candidate") {
        const result = await sessions.addCandidates(token, body.candidates);
        respond(res, 200, { accepted: result.accepted });
        return true;
      }
      respond(res, 400, { error: "unsupported_signal_type" });
    } catch (error) {
      signalingError(res, error);
    }
    return true;
  };
}
