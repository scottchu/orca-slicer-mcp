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
import { z } from "zod";
import embeddedWidgetFile from "../public/widget.html" with { type: "file" };

import {
  readU1CameraFrame,
  readU1Status,
  type U1CameraFrame,
  type U1Status,
  type U1WidgetMetadata,
} from "./u1-status.js";
import { statusCardImageContent } from "./status-card-image.js";
import type {
  CameraIceCandidate,
  CameraWebRtcSessionController,
  OpenedCameraWebRtcSession,
} from "./application/camera-webrtc.js";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = currentDirectory.startsWith("/$bunfs/")
  ? currentDirectory
  : path.resolve(currentDirectory, "..");
const IS_COMPILED = currentDirectory.startsWith("/$bunfs/");
export const WIDGET_URI = "ui://u1-print-studio/status-v4.html";
const WIDGET_PATH = path.join(APP_ROOT, "public", "widget.html");
export const readWidgetHtml = () =>
  IS_COMPILED
    ? readFileSync(embeddedWidgetFile as unknown as string, "utf8")
    : readFileSync(WIDGET_PATH, "utf8");
export const WIDGET_HTML = readWidgetHtml();

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

export function cameraFramePayload(
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

export function cameraStreamPayload(opened: OpenedCameraWebRtcSession) {
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
}

export function createAppServer(
  dependencies: {
    readStatus?: StatusReader;
    readCameraFrame?: CameraFrameReader;
    cameraSessions?: CameraWebRtcSessionController;
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
        includeImageCard: true,
      });
    }
  );

  if (dependencies.cameraSessions) {
    registerAppTool(
      server,
      "open_u1_camera_stream",
      {
        title: "Open U1 camera stream",
        description:
          "Use this when the U1 dashboard starts a user-requested continuous read-only camera relay session.",
        inputSchema: {},
        ...securityConfig,
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          openWorldHint: false,
          idempotentHint: false,
        },
        _meta: {
          ...securityMetadata,
          ui: { visibility: ["model", "app"] },
          "openai/toolInvocation/invoking": "Opening U1 camera relay",
          "openai/toolInvocation/invoked": "U1 camera relay ready",
        },
      },
      async () => cameraStreamPayload(await dependencies.cameraSessions!.open())
    );

    const privateToolMetadata = {
      ...securityMetadata,
      ui: { visibility: ["app"] },
      "openai/visibility": "private",
    };
    const sessionId = z.string().min(16).max(512);
    registerAppTool(
      server,
      "answer_u1_camera_stream",
      {
        title: "Answer U1 camera stream",
        description:
          "Use this only from the U1 dashboard to submit the bounded WebRTC answer for its active read-only camera session.",
        inputSchema: { sessionId, sdp: z.string().min(1).max(96 * 1024) },
        ...securityConfig,
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          openWorldHint: false,
          idempotentHint: true,
        },
        _meta: privateToolMetadata,
      } as any,
      (async ({ sessionId, sdp }: { sessionId: string; sdp: string }) => ({
        content: [{ type: "text" as const, text: "Camera answer accepted." }],
        structuredContent: await dependencies.cameraSessions!.answer(
          sessionId,
          sdp
        ),
      })) as any
    );
    registerAppTool(
      server,
      "add_u1_camera_ice_candidates",
      {
        title: "Add U1 camera ICE candidates",
        description:
          "Use this only from the U1 dashboard to add bounded ICE candidates to its active read-only camera session.",
        inputSchema: {
          sessionId,
          candidates: z.array(z.object({
            candidate: z.string().min(1).max(8 * 1024),
            sdpMid: z.string().nullable().optional(),
            sdpMLineIndex: z.number().int().nonnegative().nullable().optional(),
            usernameFragment: z.string().nullable().optional(),
          })).min(1).max(16),
        },
        ...securityConfig,
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          openWorldHint: false,
          idempotentHint: true,
        },
        _meta: privateToolMetadata,
      } as any,
      (async ({ sessionId, candidates }: {
        sessionId: string;
        candidates: CameraIceCandidate[];
      }) => ({
        content: [{ type: "text" as const, text: "Camera candidates accepted." }],
        structuredContent: await dependencies.cameraSessions!.addCandidates(
          sessionId,
          candidates
        ),
      })) as any
    );
    registerAppTool(
      server,
      "close_u1_camera_stream",
      {
        title: "Close U1 camera stream",
        description:
          "Use this only from the U1 dashboard to idempotently close its bounded read-only camera session.",
        inputSchema: { sessionId },
        ...securityConfig,
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          openWorldHint: false,
          idempotentHint: true,
        },
        _meta: privateToolMetadata,
      } as any,
      (async ({ sessionId }: { sessionId: string }) => ({
        content: [{ type: "text" as const, text: "Camera session closed." }],
        structuredContent: dependencies.cameraSessions!.close(sessionId),
      })) as any
    );
  }

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
        ...(dependencies.cameraSessions
          ? [
              {
                name: "open_u1_camera_stream",
                title: "Open U1 camera stream",
                description:
                  "Use this when the U1 dashboard starts a user-requested continuous read-only camera relay session.",
                inputSchema: emptyInputSchema,
                annotations: {
                  ...readOnlyAnnotations,
                  idempotentHint: false,
                },
                securitySchemes,
                _meta: {
                  securitySchemes,
                  ui: { visibility: ["model", "app"] },
                  "openai/toolInvocation/invoking": "Opening U1 camera relay",
                  "openai/toolInvocation/invoked": "U1 camera relay ready",
                },
              },
              {
                name: "answer_u1_camera_stream",
                title: "Answer U1 camera stream",
                description:
                  "Use this only from the U1 dashboard to submit the bounded WebRTC answer for its active read-only camera session.",
                inputSchema: {
                  type: "object",
                  properties: {
                    sessionId: { type: "string", minLength: 16, maxLength: 512 },
                    sdp: { type: "string", minLength: 1, maxLength: 96 * 1024 },
                  },
                  required: ["sessionId", "sdp"],
                  additionalProperties: false,
                },
                annotations: readOnlyAnnotations,
                securitySchemes,
                _meta: {
                  securitySchemes,
                  ui: { visibility: ["app"] },
                  "openai/visibility": "private",
                },
              },
              {
                name: "add_u1_camera_ice_candidates",
                title: "Add U1 camera ICE candidates",
                description:
                  "Use this only from the U1 dashboard to add bounded ICE candidates to its active read-only camera session.",
                inputSchema: {
                  type: "object",
                  properties: {
                    sessionId: { type: "string", minLength: 16, maxLength: 512 },
                    candidates: {
                      type: "array",
                      minItems: 1,
                      maxItems: 16,
                      items: {
                        type: "object",
                        properties: {
                          candidate: { type: "string", minLength: 1, maxLength: 8 * 1024 },
                          sdpMid: { type: ["string", "null"] },
                          sdpMLineIndex: { type: ["integer", "null"], minimum: 0 },
                          usernameFragment: { type: ["string", "null"] },
                        },
                        required: ["candidate"],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ["sessionId", "candidates"],
                  additionalProperties: false,
                },
                annotations: readOnlyAnnotations,
                securitySchemes,
                _meta: {
                  securitySchemes,
                  ui: { visibility: ["app"] },
                  "openai/visibility": "private",
                },
              },
              {
                name: "close_u1_camera_stream",
                title: "Close U1 camera stream",
                description:
                  "Use this only from the U1 dashboard to idempotently close its bounded read-only camera session.",
                inputSchema: {
                  type: "object",
                  properties: {
                    sessionId: { type: "string", minLength: 16, maxLength: 512 },
                  },
                  required: ["sessionId"],
                  additionalProperties: false,
                },
                annotations: readOnlyAnnotations,
                securitySchemes,
                _meta: {
                  securitySchemes,
                  ui: { visibility: ["app"] },
                  "openai/visibility": "private",
                },
              },
            ]
          : []),
      ],
    }));
  }

  return server;
}
