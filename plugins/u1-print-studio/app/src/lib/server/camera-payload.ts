import { stripJpegMetadata, type U1CameraFrame, type U1WidgetMetadata } from "./u1-status.js";
import type { OpenedCameraWebRtcSession } from "./application/camera-webrtc.js";
import { U1_TOOL_SCHEMA_VERSION } from "./runtime-contract.js";

const sanitizeCameraMetadata = (metadata: U1WidgetMetadata): U1WidgetMetadata => {
  const dataUrl = metadata.cameraFrame?.dataUrl;
  const prefix = "data:image/jpeg;base64,";
  if (!dataUrl?.startsWith(prefix)) return {};
  try {
    const bytes = stripJpegMetadata(
      Buffer.from(dataUrl.slice(prefix.length), "base64")
    );
    return {
      cameraFrame: {
        dataUrl: `${prefix}${bytes.toString("base64")}`,
      },
    };
  } catch {
    return {};
  }
};

export const cameraFramePayload = (
  frame: U1CameraFrame,
  metadata: U1WidgetMetadata,
  activation?: { token: string; expiresAt: string }
) => {
  const publicMetadata = sanitizeCameraMetadata(metadata);
  const sanitizedBytes = publicMetadata.cameraFrame
    ? Buffer.from(
        publicMetadata.cameraFrame.dataUrl.slice(
          "data:image/jpeg;base64,".length
        ),
        "base64"
      ).length
    : 0;
  const publicFrame: U1CameraFrame = {
    schemaVersion: 1,
    observedAt: frame.observedAt,
    available: frame.available && sanitizedBytes > 0,
    mediaType:
      frame.available && sanitizedBytes > 0 ? "image/jpeg" as const : null,
    byteLength: frame.available && sanitizedBytes > 0 ? sanitizedBytes : 0,
    reason:
      frame.available && sanitizedBytes > 0 ? null : "camera_unavailable",
  };
  return {
    content: [
      {
        type: "text" as const,
        text: publicFrame.available
          ? "U1 camera frame refreshed."
          : "U1 camera frame unavailable.",
      },
    ],
    structuredContent: publicFrame,
    _meta: {
      ...publicMetadata,
      ...(activation
        ? {
            cameraActivation: {
              schemaVersion: U1_TOOL_SCHEMA_VERSION,
              token: activation.token,
              expiresAt: activation.expiresAt,
            },
          }
        : {}),
    },
  };
};

export const cameraStreamPayload = (opened: OpenedCameraWebRtcSession) => {
  const iceUrls = opened.iceServers.flatMap(({ urls }) =>
    Array.isArray(urls) ? urls : [urls]
  );
  const iceMode = iceUrls.some((url) => /^turns?:/i.test(url))
    ? "turn"
    : iceUrls.some((url) => /^stuns?:/i.test(url))
      ? "stun"
      : "local";
  return {
    content: [
      {
        type: "text" as const,
        text: "A short-lived read-only U1 camera relay session is ready.",
      },
    ],
    structuredContent: {
      schemaVersion: 2,
      available: true,
      expiresAt: opened.expiresAt,
      maxDurationSeconds: opened.maxDurationSeconds,
      iceMode,
      reason: null,
    },
    _meta: {
      cameraStream: {
        transport: "mcp-apps-tools",
        sessionId: opened.sessionId,
        offer: { type: opened.type, sdp: opened.sdp },
        iceServers: opened.iceServers,
      },
    },
  };
};
