import type { IncomingMessage, ServerResponse } from "node:http";

import {
  CameraRelayClaimError,
  type CameraRelayService,
  type CameraStreamLocator,
} from "../application/camera-relay.js";

export const CAMERA_MEDIA_PATH = "/media/camera.mjpeg";
const BOUNDARY = "u1-camera-frame";

export function createCameraStreamLocator(publicBaseUrl: URL): CameraStreamLocator {
  const basePath = publicBaseUrl.pathname === "/"
    ? ""
    : publicBaseUrl.pathname.replace(/\/$/, "");
  return {
    locate(token: string): string {
      const url = new URL(`${basePath}${CAMERA_MEDIA_PATH}`, publicBaseUrl.origin);
      url.searchParams.set("ticket", token);
      return url.toString();
    },
  };
}

function reject(res: ServerResponse, status: number, message: string): void {
  res.writeHead(status, {
    "access-control-allow-origin": "*",
    "cache-control": "no-store",
    "content-type": "application/json; charset=utf-8",
    "referrer-policy": "no-referrer",
    "x-content-type-options": "nosniff",
  });
  res.end(JSON.stringify({ error: message }));
}

function writeOrClose(res: ServerResponse, chunk: Uint8Array | string): Promise<boolean> {
  if (res.destroyed) return Promise.resolve(false);
  if (res.write(chunk)) return Promise.resolve(true);
  return new Promise((resolve) => {
    let settled = false;
    const finish = (writable: boolean) => {
      if (settled) return;
      settled = true;
      res.off("drain", onDrain);
      res.off("close", onClose);
      resolve(writable);
    };
    const onDrain = () => finish(true);
    const onClose = () => finish(false);
    res.once("drain", onDrain);
    res.once("close", onClose);
  });
}

export function createCameraMediaHandler(relay: CameraRelayService) {
  return async (
    req: IncomingMessage,
    res: ServerResponse,
    pathname: string,
    url: URL
  ): Promise<boolean> => {
    if (pathname !== CAMERA_MEDIA_PATH) return false;
    if (req.method !== "GET") {
      res.setHeader("allow", "GET");
      reject(res, 405, "method_not_allowed");
      return true;
    }

    const token = url.searchParams.get("ticket") ?? "";
    let lease;
    try {
      lease = relay.claim(token);
    } catch (error) {
      if (error instanceof CameraRelayClaimError && error.reason === "busy") {
        reject(res, 429, "camera_stream_busy");
      } else if (
        error instanceof CameraRelayClaimError &&
        error.reason === "expired"
      ) {
        reject(res, 410, "camera_stream_expired");
      } else {
        reject(res, 401, "invalid_camera_stream_ticket");
      }
      return true;
    }

    const abortController = new AbortController();
    req.once("aborted", () => abortController.abort());
    res.once("close", () => abortController.abort());
    res.writeHead(200, {
      "access-control-allow-origin": "*",
      "cache-control": "no-store, no-cache, must-revalidate",
      connection: "keep-alive",
      "content-type": `multipart/x-mixed-replace; boundary=${BOUNDARY}`,
      expires: "0",
      pragma: "no-cache",
      "referrer-policy": "no-referrer",
      "x-content-type-options": "nosniff",
    });
    res.flushHeaders();

    try {
      for await (const frame of lease.frames(abortController.signal)) {
        if (abortController.signal.aborted || res.destroyed) break;
        const header = Buffer.from(
          `--${BOUNDARY}\r\n` +
          "Content-Type: image/jpeg\r\n" +
          `Content-Length: ${frame.bytes.byteLength}\r\n` +
          `X-Observed-At: ${frame.observedAt}\r\n\r\n`,
          "utf8"
        );
        if (!(await writeOrClose(res, header))) break;
        if (!(await writeOrClose(res, frame.bytes))) break;
        if (!(await writeOrClose(res, "\r\n"))) break;
      }
    } catch {
      // A downstream disconnect is an expected end to a user-opened preview.
    } finally {
      abortController.abort();
      lease.release();
      if (!res.destroyed) res.end();
    }
    return true;
  };
}
