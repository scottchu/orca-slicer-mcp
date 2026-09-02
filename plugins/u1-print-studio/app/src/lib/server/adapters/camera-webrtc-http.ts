import { readRequestBytes } from '../request-body.js';
import { serveNodeResponse } from '../node-response.js';
import type { IncomingMessage, ServerResponse } from "node:http";
import type { RequestLifetime } from '../request-lifetime.js';

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

const respond = (status: number, payload: unknown, extraHeaders: Record<string, string> = {}): Response => new Response(JSON.stringify(payload), {
  status, headers: {
    'access-control-allow-origin': '*', 'access-control-allow-methods': 'POST, DELETE, OPTIONS',
    'access-control-allow-headers': 'content-type', 'cache-control': 'no-store',
    'content-type': 'application/json; charset=utf-8', 'referrer-policy': 'no-referrer',
    'x-content-type-options': 'nosniff', ...extraHeaders
  }
});
const readJsonBody = async (req: Request): Promise<Record<string, unknown>> => {
  const parsed = JSON.parse(new TextDecoder().decode(await readRequestBytes(req, MAX_SIGNAL_BYTES, 'signal_too_large')));
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('invalid_signal');
  return parsed as Record<string, unknown>;
};

const signalingError = (error: unknown): Response => {
  if (error instanceof CameraRelayClaimError && error.reason === "busy") {
    return respond( 429, { error: "camera_stream_busy" });
  }
  if (error instanceof CameraRelayClaimError && error.reason === "expired") {
    return respond( 410, { error: "camera_stream_expired" });
  }
  if (error instanceof CameraWebRtcSessionError) {
    const status = error.reason === "expired_session" ? 410 : 400;
    return respond( status, { error: error.reason });
  }
  return respond( 401, { error: "invalid_camera_stream_ticket" });
}

export const createCameraWebRtcResponse = (
  relay: CameraRelayService,
  sessions: CameraViewerSessionStore
) => {
  return async (
    req: Request,
    url = new URL(req.url),
    signal = req.signal,
    lifetime?: RequestLifetime
  ): Promise<Response> => {

    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: {
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "POST, DELETE, OPTIONS",
        "access-control-allow-headers": "content-type",
        "access-control-max-age": "600",
      } });
    }

    const token = url.searchParams.get("ticket") ?? "";
    if (req.method === "DELETE") {
      const result = sessions.close(token);
      if (!result.closed) {
        return respond( 401, { error: "invalid_camera_stream_session" });
      } else {
        return respond( 200, result);
      }
    }

    if (req.method !== "POST") {
      return respond(405, { error: "method_not_allowed" }, { allow: "POST, DELETE, OPTIONS" });
    }

    let body: Record<string, unknown>;
    try {
      body = await readJsonBody(req);
    } catch (error) {
      return respond(
        error instanceof Error && error.message === "signal_too_large" ? 413 : 400,
        { error: error instanceof Error ? error.message : "invalid_signal" }
      );
    }

    const type = typeof body.type === "string" ? body.type : "";
    try {
      if (type === "request") {
        const opened = await sessions.open(relay.claim(token), token);
        lifetime?.onAborted(() => { sessions.close(token); });
        if (signal.aborted) {
          if (!lifetime) sessions.close(token);
          return respond(400, { error: 'invalid_signal' });
        }
        return respond( 200, {
          type: opened.type,
          sdp: opened.sdp,
          iceServers: opened.iceServers,
          expiresAt: opened.expiresAt,
        });
        }
      if (type === "answer") {
        return respond( 200, await sessions.answer(token, body.sdp));
        }
      if (type === "remote_candidate") {
        const result = await sessions.addCandidates(token, body.candidates);
        return respond( 200, { accepted: result.accepted });
        }
      return respond( 400, { error: "unsupported_signal_type" });
    } catch (error) {
      return signalingError(error);
    }
  };
}


export const createCameraWebRtcHandler = (relay: CameraRelayService, sessions: CameraViewerSessionStore) => {
  const response = createCameraWebRtcResponse(relay, sessions);
  return async (req: IncomingMessage, res: ServerResponse, pathname: string, url: URL): Promise<boolean> => {
    if (pathname !== CAMERA_WEBRTC_PATH) return false;
    return serveNodeResponse(req, res, (request) => response(request, url));
  };
};
