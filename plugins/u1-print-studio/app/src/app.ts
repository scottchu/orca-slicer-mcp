import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  registerAppResource,
  registerAppTool,
  RESOURCE_MIME_TYPE,
} from "@modelcontextprotocol/ext-apps/server";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import {
  readU1CameraFrame,
  readU1Status,
  type U1CameraFrame,
  type U1Status,
  type U1WidgetMetadata,
} from "./u1-status.js";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.resolve(currentDirectory, "..");
export const WIDGET_URI = "ui://u1-print-studio/status-v2.html";
export const WIDGET_HTML = readFileSync(
  path.join(APP_ROOT, "public", "widget.html"),
  "utf8"
);

export function resultPayload(
  status: U1Status,
  metadata: U1WidgetMetadata
) {
  const summary = status.reachable
    ? `U1 is ${status.stateLabel.toLowerCase()} at ${status.progressPercent}%.`
    : `U1 status is unavailable: ${status.printerMessage ?? "unknown error"}.`;

  return {
    content: [{ type: "text" as const, text: summary }],
    structuredContent: status,
    _meta: metadata,
  };
}

type StatusReader = typeof readU1Status;
type CameraFrameReader = typeof readU1CameraFrame;

function cameraFramePayload(
  frame: U1CameraFrame,
  metadata: U1WidgetMetadata
) {
  return {
    content: [
      {
        type: "text" as const,
        text: frame.available
          ? "U1 camera frame refreshed."
          : `U1 camera frame unavailable: ${frame.reason ?? "unknown error"}.`,
      },
    ],
    structuredContent: frame,
    _meta: metadata,
  };
}

export function createAppServer(
  dependencies: {
    readStatus?: StatusReader;
    readCameraFrame?: CameraFrameReader;
  } = {}
): McpServer {
  const readStatus = dependencies.readStatus ?? readU1Status;
  const readCameraFrame =
    dependencies.readCameraFrame ?? readU1CameraFrame;
  const server = new McpServer({ name: "u1-print-studio", version: "0.2.0" });

  registerAppResource(
    server,
    "u1-status-widget",
    WIDGET_URI,
    {},
    async () => {
      return {
        contents: [
          {
            uri: WIDGET_URI,
            mimeType: RESOURCE_MIME_TYPE,
            text: WIDGET_HTML,
            _meta: {
              ui: {
                prefersBorder: false,
                csp: {
                  connectDomains: [],
                  resourceDomains: [],
                  frameDomains: [],
                },
              },
              "openai/widgetDescription":
                "A read-only live Snapmaker U1 dashboard with camera, progress, temperatures, adaptive refresh, and PiP/fullscreen controls.",
            },
          },
        ],
      };
    }
  );

  registerAppTool(
    server,
    "show_u1_status",
    {
      title: "Show U1 status",
      description:
        "Use this when the user wants to open the visual Snapmaker U1 status dashboard.",
      inputSchema: {},
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: false,
        idempotentHint: true,
      },
      _meta: {
        ui: { resourceUri: WIDGET_URI },
        "openai/outputTemplate": WIDGET_URI,
        "openai/toolInvocation/invoking": "Reading U1 status",
        "openai/toolInvocation/invoked": "U1 dashboard ready",
      },
    },
    async () => {
      const { status, metadata } = await readStatus();
      return resultPayload(status, metadata);
    }
  );

  registerAppTool(
    server,
    "get_u1_status",
    {
      title: "Refresh U1 status",
      description:
        "Use this when the U1 dashboard or user needs a fresh read-only printer observation without reopening the widget.",
      inputSchema: {},
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: false,
        idempotentHint: true,
      },
      _meta: {
        "openai/toolInvocation/invoking": "Refreshing U1 status",
        "openai/toolInvocation/invoked": "U1 status refreshed",
      },
    },
    async () => {
      const { status, metadata } = await readStatus();
      return resultPayload(status, metadata);
    }
  );

  registerAppTool(
    server,
    "get_u1_camera_frame",
    {
      title: "Refresh U1 camera frame",
      description:
        "Use this when the U1 dashboard needs a fresh read-only camera frame relayed through the printer operations boundary.",
      inputSchema: {},
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: false,
        idempotentHint: true,
      },
      _meta: {
        "openai/toolInvocation/invoking": "Refreshing U1 camera",
        "openai/toolInvocation/invoked": "U1 camera refreshed",
      },
    },
    async () => {
      const { frame, metadata } = await readCameraFrame();
      return cameraFramePayload(frame, metadata);
    }
  );

  return server;
}
