import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  registerAppResource,
  registerAppTool,
  RESOURCE_MIME_TYPE,
} from "@modelcontextprotocol/ext-apps/server";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

import {
  readU1CameraFrame,
  readU1Status,
  type U1CameraFrame,
  type U1Status,
  type U1WidgetMetadata,
} from "./u1-status.js";
import { statusCardImageContent } from "./status-card-image.js";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.resolve(currentDirectory, "..");
export const WIDGET_URI = "ui://u1-print-studio/status-v2.html";
export const WIDGET_HTML = readFileSync(
  path.join(APP_ROOT, "public", "widget.html"),
  "utf8"
);

export function resultPayload(
  status: U1Status,
  metadata: U1WidgetMetadata,
  options: { includeImageCard?: boolean } = {}
) {
  const summary = status.reachable
    ? `U1 is ${status.stateLabel.toLowerCase()} at ${status.progressPercent}%.`
    : `U1 status is unavailable: ${status.printerMessage ?? "unknown error"}.`;

  return {
    content: [
      { type: "text" as const, text: summary },
      ...(options.includeImageCard ? [statusCardImageContent(status)] : []),
    ],
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
  } = {},
  options: {
    oauthScopes?: string[];
  } = {}
): McpServer {
  const readStatus = dependencies.readStatus ?? readU1Status;
  const readCameraFrame =
    dependencies.readCameraFrame ?? readU1CameraFrame;
  const server = new McpServer({ name: "u1-print-studio", version: "0.2.0" });
  const securitySchemes = options.oauthScopes
    ? [{ type: "oauth2" as const, scopes: options.oauthScopes }]
    : undefined;
  const securityConfig = securitySchemes ? { securitySchemes } : {};
  const securityMetadata = securitySchemes
    ? { securitySchemes }
    : {};

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
        "Show the current Snapmaker U1 observation as a visual status card; component-capable hosts also open the interactive dashboard.",
      inputSchema: {},
      ...securityConfig,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: false,
        idempotentHint: true,
      },
      _meta: {
        ...securityMetadata,
        ui: { resourceUri: WIDGET_URI },
        "openai/outputTemplate": WIDGET_URI,
        "openai/toolInvocation/invoking": "Reading U1 status",
        "openai/toolInvocation/invoked": "U1 dashboard ready",
      },
    },
    async () => {
      const { status, metadata } = await readStatus();
      return resultPayload(status, metadata, {
        includeImageCard: Boolean(securitySchemes),
      });
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
      ...securityConfig,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: false,
        idempotentHint: true,
      },
      _meta: {
        ...securityMetadata,
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
      ...securityConfig,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: false,
        idempotentHint: true,
      },
      _meta: {
        ...securityMetadata,
        "openai/toolInvocation/invoking": "Refreshing U1 camera",
        "openai/toolInvocation/invoked": "U1 camera refreshed",
      },
    },
    async () => {
      const { frame, metadata } = await readCameraFrame();
      return cameraFramePayload(frame, metadata);
    }
  );

  // The current MCP SDK preserves the compatibility mirror in `_meta` but
  // omits the newer top-level field from tools/list. Remote plugin clients
  // require both, so provide the exact descriptor list at the transport edge.
  if (securitySchemes) {
    const emptyInputSchema = {
      type: "object" as const,
      properties: {},
      additionalProperties: false,
    };
    const readOnlyAnnotations = {
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: false,
      idempotentHint: true,
    };
    server.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "show_u1_status",
          title: "Show U1 status",
          description:
            "Show the current Snapmaker U1 observation as a visual status card; component-capable hosts also open the interactive dashboard.",
          inputSchema: emptyInputSchema,
          annotations: readOnlyAnnotations,
          securitySchemes,
          _meta: {
            securitySchemes,
            ui: { resourceUri: WIDGET_URI },
            "openai/outputTemplate": WIDGET_URI,
            "openai/toolInvocation/invoking": "Reading U1 status",
            "openai/toolInvocation/invoked": "U1 dashboard ready",
          },
        },
        {
          name: "get_u1_status",
          title: "Refresh U1 status",
          description:
            "Use this when the U1 dashboard or user needs a fresh read-only printer observation without reopening the widget.",
          inputSchema: emptyInputSchema,
          annotations: readOnlyAnnotations,
          securitySchemes,
          _meta: {
            securitySchemes,
            "openai/toolInvocation/invoking": "Refreshing U1 status",
            "openai/toolInvocation/invoked": "U1 status refreshed",
          },
        },
        {
          name: "get_u1_camera_frame",
          title: "Refresh U1 camera frame",
          description:
            "Use this when the U1 dashboard needs a fresh read-only camera frame relayed through the printer operations boundary.",
          inputSchema: emptyInputSchema,
          annotations: readOnlyAnnotations,
          securitySchemes,
          _meta: {
            securitySchemes,
            "openai/toolInvocation/invoking": "Refreshing U1 camera",
            "openai/toolInvocation/invoked": "U1 camera refreshed",
          },
        },
      ],
    }));
  }

  return server;
}
