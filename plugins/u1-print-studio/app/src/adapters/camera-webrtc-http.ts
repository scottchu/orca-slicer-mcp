import type { IncomingMessage, ServerResponse } from "node:http";

import type {
  CameraIceCandidate,
  CameraWebRtcSignalingSource,
} from "../application/camera-webrtc.js";
import {
  CameraRelayClaimError,
  type CameraRelayService,
  type CameraStreamLease,
} from "../application/camera-relay.js";

export const CAMERA_WEBRTC_PATH = "/media/camera.webrtc";
const MAX_SIGNAL_BYTES = 128 * 1024;
const MAX_SDP_BYTES = 96 * 1024;
const MAX_CANDIDATES = 16;

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

type ActiveSession = {
  lease: CameraStreamLease;
  remoteId: string;
  abortController: AbortController;
  timeout: ReturnType<typeof setTimeout>;
};

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

function sanitizeCandidates(value: unknown): CameraIceCandidate[] {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_CANDIDATES) {
    throw new Error("invalid_candidates");
  }
  return value.map((candidate) => {
    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
      throw new Error("invalid_candidates");
    }
    const object = candidate as Record<string, unknown>;
    if (typeof object.candidate !== "string" || object.candidate.length > 8_192) {
      throw new Error("invalid_candidates");
    }
    return {
      candidate: object.candidate,
      sdpMid: typeof object.sdpMid === "string" ? object.sdpMid : null,
      sdpMLineIndex:
        typeof object.sdpMLineIndex === "number" ? object.sdpMLineIndex : null,
      usernameFragment:
        typeof object.usernameFragment === "string"
          ? object.usernameFragment
          : null,
    };
  });
}

function claimError(res: ServerResponse, error: unknown): void {
  if (error instanceof CameraRelayClaimError && error.reason === "busy") {
    respond(res, 429, { error: "camera_stream_busy" });
  } else if (
    error instanceof CameraRelayClaimError &&
    error.reason === "expired"
  ) {
    respond(res, 410, { error: "camera_stream_expired" });
  } else {
    respond(res, 401, { error: "invalid_camera_stream_ticket" });
  }
}

export function createCameraWebRtcHandler(
  relay: CameraRelayService,
  signaling: CameraWebRtcSignalingSource
) {
  const sessions = new Map<string, ActiveSession>();

  const closeSession = (token: string) => {
    const session = sessions.get(token);
    if (!session) return false;
    sessions.delete(token);
    clearTimeout(session.timeout);
    session.abortController.abort();
    session.lease.release();
    return true;
  };

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
      if (!closeSession(token)) {
        respond(res, 401, { error: "invalid_camera_stream_session" });
      } else {
        respond(res, 200, { closed: true });
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
      respond(res, error instanceof Error && error.message === "signal_too_large" ? 413 : 400, {
        error: error instanceof Error ? error.message : "invalid_signal",
      });
      return true;
    }

    const type = typeof body.type === "string" ? body.type : "";
    if (type === "request") {
      if (sessions.has(token)) {
        respond(res, 409, { error: "camera_stream_already_open" });
        return true;
      }

      let lease: CameraStreamLease;
      try {
        lease = relay.claim(token);
      } catch (error) {
        claimError(res, error);
        return true;
      }

      const abortController = new AbortController();
      try {
        const offer = await signaling.requestOffer(abortController.signal);
        const remaining = Math.max(0, Date.parse(lease.expiresAt) - Date.now());
        const timeout = setTimeout(() => closeSession(token), remaining);
        sessions.set(token, {
          lease,
          remoteId: offer.id,
          abortController,
          timeout,
        });
        respond(res, 200, {
          type: offer.type,
          sdp: offer.sdp,
          iceServers: offer.iceServers,
          expiresAt: lease.expiresAt,
        });
      } catch {
        abortController.abort();
        lease.release();
        respond(res, 502, { error: "camera_webrtc_offer_failed" });
      }
      return true;
    }

    const session = sessions.get(token);
    if (!session) {
      respond(res, 401, { error: "invalid_camera_stream_session" });
      return true;
    }

    try {
      if (type === "answer") {
        const sdp = typeof body.sdp === "string" ? body.sdp : "";
        if (!sdp || Buffer.byteLength(sdp) > MAX_SDP_BYTES) {
          throw new Error("invalid_answer");
        }
        await signaling.sendAnswer(
          session.remoteId,
          sdp,
          session.abortController.signal
        );
        respond(res, 200, { accepted: true });
        return true;
      }

      if (type === "remote_candidate") {
        await signaling.sendCandidates(
          session.remoteId,
          sanitizeCandidates(body.candidates),
          session.abortController.signal
        );
        respond(res, 200, { accepted: true });
        return true;
      }

      respond(res, 400, { error: "unsupported_signal_type" });
    } catch (error) {
      respond(res, 400, {
        error: error instanceof Error ? error.message : "invalid_signal",
      });
    }
    return true;
  };
}
