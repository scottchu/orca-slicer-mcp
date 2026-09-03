import { randomUUID } from "node:crypto";
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
import embeddedCameraWidgetFile from "../../../public/camera-widget.html" with { type: "file" };
import embeddedLegacyCameraWidgetFile from "../../../public/legacy-camera-widget.html" with { type: "file" };
import embeddedLegacyWidgetFile from "../../../public/legacy-widget.html" with { type: "file" };
import embeddedWidgetFile from "../../../public/widget.html" with { type: "file" };
import embeddedMcpObservationFile from "../../../public/mcp-observation.html" with { type: "file" };
import embeddedMcpCameraFile from "../../../public/mcp-camera.html" with { type: "file" };
import embeddedMcpObservationV15File from "../../../public/mcp-observation-v15.html" with { type: "file" };
import embeddedMcpCameraV11File from "../../../public/mcp-camera-v11.html" with { type: "file" };

import {
  createObservationPresentation,
  OBSERVATION_VIEWS,
  type ObservationView,
} from "./observation-presentation.js";
import {
  PrinterObservationStore,
  type ObservationSnapshot,
} from "./observation-store.js";

import {
  readU1CameraFrame,
  readU1Status,
  readU1BedMesh,
  readU1Materials,
  readU1Queue,
  readU1Environment,
  readU1CurrentJob,
  readU1JobHistory,
  normalizedPrintState,
  normalizedToolState,
  stripJpegMetadata,
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
import { CameraWebRtcSessionError } from "./application/camera-webrtc.js";
import { CameraRelayClaimError } from "./application/camera-relay.js";
import {
  U1_CAMERA_WIDGET_VERSION,
  U1_OBSERVATION_WIDGET_VERSION,
  U1_RUNTIME_VERSION,
  U1_TOOL_SCHEMA_VERSION,
} from "./runtime-contract.js";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const ASSET_ROOT = currentDirectory.endsWith('/src/lib/server')
  ? path.resolve(currentDirectory, '../../../public')
  : currentDirectory;
const IS_COMPILED = currentDirectory.startsWith("/$bunfs/");
export const WIDGET_URI = `ui://u1-print-studio/${U1_OBSERVATION_WIDGET_VERSION}.html`;
export const CAMERA_WIDGET_URI =
  `ui://u1-print-studio/${U1_CAMERA_WIDGET_VERSION}.html`;
export const LEGACY_CAMERA_WIDGET_URIS = [
  "ui://u1-print-studio/camera-v3.html",
  "ui://u1-print-studio/camera-v2.html",
  "ui://u1-print-studio/camera-v1.html",
] as const;
export const LEGACY_FOCUSED_WIDGET_URIS = [
  "ui://u1-print-studio/observation-v14.html",
  "ui://u1-print-studio/observation-v13.html",
  "ui://u1-print-studio/observation-v12.html",
  "ui://u1-print-studio/observation-v11.html",
  "ui://u1-print-studio/observation-v10.html",
  "ui://u1-print-studio/observation-v9.html",
  "ui://u1-print-studio/observation-v8.html",
  "ui://u1-print-studio/observation-v7.html",
  "ui://u1-print-studio/observation-v6.html",
  "ui://u1-print-studio/observation-v5.html",
  "ui://u1-print-studio/observation-v4.html",
  "ui://u1-print-studio/observation-v3.html",
  "ui://u1-print-studio/observation-v2.html",
  "ui://u1-print-studio/observation-v1.html",
] as const;
export const LEGACY_WIDGET_URIS = [
  "ui://u1-print-studio/status-v4.html",
  "ui://u1-print-studio/status-v3.html",
] as const;
const WIDGET_PATH = path.join(ASSET_ROOT, "widget.html");
const LEGACY_WIDGET_PATH = path.join(ASSET_ROOT, "legacy-widget.html");
const CAMERA_WIDGET_PATH = path.join(ASSET_ROOT, "camera-widget.html");
const LEGACY_CAMERA_WIDGET_PATH = path.join(
  ASSET_ROOT,
  "legacy-camera-widget.html"
);
export const readWidgetHtml = () =>
  IS_COMPILED
    ? readFileSync(embeddedWidgetFile as unknown as string, "utf8")
    : readFileSync(WIDGET_PATH, "utf8");
export const WIDGET_HTML = readWidgetHtml();
export const readLegacyWidgetHtml = () =>
  IS_COMPILED
    ? readFileSync(embeddedLegacyWidgetFile as unknown as string, "utf8")
    : readFileSync(LEGACY_WIDGET_PATH, "utf8");
export const LEGACY_WIDGET_HTML = readLegacyWidgetHtml();
export const readCameraWidgetHtml = () =>
  IS_COMPILED
    ? readFileSync(embeddedCameraWidgetFile as unknown as string, "utf8")
    : readFileSync(CAMERA_WIDGET_PATH, "utf8");
export const CAMERA_WIDGET_HTML = readCameraWidgetHtml();
export const MCP_OBSERVATION_HTML = readFileSync(IS_COMPILED ? embeddedMcpObservationFile as unknown as string : path.join(ASSET_ROOT, 'mcp-observation.html'), 'utf8');
export const MCP_CAMERA_HTML = readFileSync(IS_COMPILED ? embeddedMcpCameraFile as unknown as string : path.join(ASSET_ROOT, 'mcp-camera.html'), 'utf8');
export const MCP_OBSERVATION_V15_HTML = readFileSync(IS_COMPILED ? embeddedMcpObservationV15File as unknown as string : path.join(ASSET_ROOT, 'mcp-observation-v15.html'), 'utf8');
export const MCP_CAMERA_V11_HTML = readFileSync(IS_COMPILED ? embeddedMcpCameraV11File as unknown as string : path.join(ASSET_ROOT, 'mcp-camera-v11.html'), 'utf8');
export const readLegacyCameraWidgetHtml = () =>
  IS_COMPILED
    ? readFileSync(embeddedLegacyCameraWidgetFile as unknown as string, "utf8")
    : readFileSync(LEGACY_CAMERA_WIDGET_PATH, "utf8");
export const LEGACY_CAMERA_WIDGET_HTML = readLegacyCameraWidgetHtml();

export function observationPayload(
  snapshot: ObservationSnapshot,
  view: ObservationView
) {
  const presentation = createObservationPresentation(snapshot, view);
  const module = view === "bed_mesh" ? "bed mesh" : view;
  const state = presentation.module.state;
  return {
    content: [{
      type: "text" as const,
      text: `U1 ${module} observation is ${state}.`,
    }],
    structuredContent: presentation,
    _meta: {},
  };
}

export function resultPayload(
  status: U1Status,
  metadata: U1WidgetMetadata,
  options: { includeImageCard?: boolean } = {}
) {
  const publicState = status.reachable
    ? normalizedPrintState(status.state)
    : "offline";
  const publicStatus: U1Status = {
    schemaVersion: 1,
    stateVersion: status.stateVersion,
    observedAt: status.observedAt,
    reachable: status.reachable,
    state: publicState,
    stateLabel: status.reachable
      ? {
          standby: "Ready",
          printing: "Printing",
          paused: "Paused",
          complete: "Complete",
          cancelled: "Cancelled",
          error: "Error",
          unknown: "Unknown",
        }[publicState] ?? "Unknown"
      : "Offline",
    progressPercent: status.progressPercent,
    currentLayer: status.currentLayer,
    totalLayers: status.totalLayers,
    elapsedSeconds: status.elapsedSeconds,
    remainingSeconds: status.remainingSeconds,
    refreshAfterSeconds: status.refreshAfterSeconds,
    filename: status.filename,
    activePhysicalTool: status.activePhysicalTool,
    tools: status.tools.map((tool) => ({
      physicalTool: tool.physicalTool,
      temperature: tool.temperature,
      target: tool.target,
      state: tool.state === null ? null : normalizedToolState(tool.state),
      active: tool.active,
    })),
    bed: {
      temperature: status.bed.temperature,
      target: status.bed.target,
    },
    storage: {
      active: status.storage.active,
      filePosition: status.storage.filePosition,
      fileSize: status.storage.fileSize,
    },
    printerMessage: status.printerMessage
      ? status.reachable
        ? status.exception
          ? "Printer reported an exception."
          : "Printer reported a status message."
        : "Printer unavailable"
      : null,
    exception: status.exception,
    camera: {
      available: status.camera.available,
      service:
        status.camera.service === "webrtc" ||
          status.camera.service === "snapshot"
          ? status.camera.service
          : null,
      targetFps: status.camera.targetFps,
    },
  };
  const summary = publicStatus.reachable
    ? publicStatus.progressPercent === null
      ? `U1 is ${publicStatus.stateLabel.toLowerCase()}; progress is unknown.`
      : `U1 is ${publicStatus.stateLabel.toLowerCase()} at ${publicStatus.progressPercent}%.`
    : "U1 status is unavailable.";

  return {
    content: [
      { type: "text" as const, text: summary },
      ...(options.includeImageCard ? [statusCardImageContent(publicStatus)] : []),
    ],
    structuredContent: publicStatus,
    _meta: sanitizeCameraMetadata(metadata),
  };
}

function sanitizeCameraMetadata(metadata: U1WidgetMetadata): U1WidgetMetadata {
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
}

type StatusReader = typeof readU1Status;
type CameraFrameReader = typeof readU1CameraFrame;

export function cameraFramePayload(
  frame: U1CameraFrame,
  metadata: U1WidgetMetadata,
  activation?: { token: string; expiresAt: string }
) {
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
}

export function cameraStreamPayload(opened: OpenedCameraWebRtcSession) {
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
}

function publicCameraFailure(error: unknown): string {
  if (error instanceof CameraRelayClaimError) {
    if (error.reason === "busy") return "camera_capacity_reached";
    if (error.reason === "expired") return "camera_activation_expired";
    return "camera_activation_invalid";
  }
  if (error instanceof CameraWebRtcSessionError) {
    if (error.reason === "expired_session") return "camera_session_expired";
    if (error.reason === "invalid_session") return "camera_session_invalid";
  }
  return "camera_stream_unavailable";
}

async function safeCameraAction<T>(action: () => Promise<T>): Promise<T> {
  try {
    return await action();
  } catch (error) {
    throw new Error(publicCameraFailure(error));
  }
}

export function createAppServer(
  dependencies: {
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
  } = {},
  options: {
    oauthScopes?: string[];
  } = {}
): McpServer {
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
  const server = new McpServer({
    name: "u1-print-studio",
    version: U1_RUNTIME_VERSION,
  });
  const securitySchemes = options.oauthScopes
    ? [{ type: "oauth2" as const, scopes: options.oauthScopes }]
    : undefined;
  const securityConfig = securitySchemes ? { securitySchemes } : {};
  const securityMetadata = securitySchemes
    ? { securitySchemes }
    : {};

  const observationResources = [
    { uri: WIDGET_URI, html: MCP_OBSERVATION_HTML, focused: true },
    { uri: 'ui://u1-print-studio/observation-v15.html', html: MCP_OBSERVATION_V15_HTML, focused: true },
    ...LEGACY_FOCUSED_WIDGET_URIS.map((uri) => ({
      uri,
      html: WIDGET_HTML,
      focused: true,
    })),
    ...LEGACY_WIDGET_URIS.map((uri) => ({
      uri,
      html: LEGACY_WIDGET_HTML,
      focused: false,
    })),
  ];
  for (const [index, resource] of observationResources.entries()) {
    const { uri: widgetUri, html, focused } = resource;
    registerAppResource(
      server,
      index === 0 ? "u1-status-widget" : `u1-status-widget-legacy-${index}`,
      widgetUri,
      {},
      async () => ({
        contents: [
          {
            uri: widgetUri,
            mimeType: RESOURCE_MIME_TYPE,
            text: html,
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
                focused
                  ? "A compact read-only Snapmaker U1 focused instrument strip."
                  : "The preserved legacy read-only Snapmaker U1 status dashboard.",
            },
          },
        ],
      })
    );
  }

  const cameraResources = [
    {
      uri: CAMERA_WIDGET_URI,
      html: MCP_CAMERA_HTML,
      version: U1_CAMERA_WIDGET_VERSION,
    },
    {
      uri: "ui://u1-print-studio/camera-v11.html",
      html: MCP_CAMERA_V11_HTML,
      version: "camera-v11",
    },
    {
      uri: "ui://u1-print-studio/camera-v10.html",
      html: CAMERA_WIDGET_HTML,
      version: "camera-v10",
    },
    {
      uri: "ui://u1-print-studio/camera-v9.html",
      html: CAMERA_WIDGET_HTML,
      version: "camera-v9",
    },
    {
      uri: "ui://u1-print-studio/camera-v8.html",
      html: CAMERA_WIDGET_HTML,
      version: "camera-v8",
    },
    {
      uri: "ui://u1-print-studio/camera-v7.html",
      html: CAMERA_WIDGET_HTML,
      version: "camera-v7",
    },
    {
      uri: "ui://u1-print-studio/camera-v6.html",
      html: CAMERA_WIDGET_HTML,
      version: "camera-v6",
    },
    {
      uri: "ui://u1-print-studio/camera-v5.html",
      html: CAMERA_WIDGET_HTML,
      version: "camera-v5",
    },
    {
      uri: "ui://u1-print-studio/camera-v4.html",
      html: CAMERA_WIDGET_HTML,
      version: "camera-v4",
    },
    ...LEGACY_CAMERA_WIDGET_URIS.map((uri) => ({
      uri,
      html: LEGACY_CAMERA_WIDGET_HTML,
      version: uri.slice(uri.lastIndexOf("/") + 1, -".html".length),
    })),
  ];
  for (const [index, resource] of cameraResources.entries()) {
    const { uri: widgetUri, html, version } = resource;
    registerAppResource(
      server,
      index === 0 ? "u1-camera-widget" : `u1-camera-widget-legacy-${index}`,
      widgetUri,
      {},
      async () => ({
        contents: [
          {
            uri: widgetUri,
            mimeType: RESOURCE_MIME_TYPE,
            text: html,
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
                `A camera-only Snapmaker U1 view (${version}) with a relayed snapshot, user-requested read-only live video, and an automatic snapshot fallback.`,
            },
          },
        ],
      })
    );
  }

  const observationViewSchema = z.enum(OBSERVATION_VIEWS);
  const observationInputSchema = z.object({ view: observationViewSchema }).strict();
  registerAppTool(
    server,
    "observe_printer",
    ({
      title: "Observe printer",
      description:
        "Open one focused read-only U1 observation strip. Choose overview, progress, thermals, heads, jobs (current job only), job_history, queue, fans, or bed_mesh. Current Job and Job History are separate observations. Use open_printer_camera for camera viewing.",
      inputSchema: observationInputSchema,
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
        "openai/toolInvocation/invoking": "Reading U1 observation",
        "openai/toolInvocation/invoked": "U1 observation ready",
      },
    } as any),
    (async ({ view }: { view: ObservationView }) => {
      return observationPayload(
        await observations.current({ refresh: true, includeBedMesh: view === "bed_mesh" || view === "overview", includeMaterials: view === "heads" || view === "overview", includeQueue: view === "queue" || view === "overview", includeEnvironment: view === "thermals" || view === "fans" || view === "overview", includeCurrentJob: view === "jobs" || view === "overview", includeJobHistory: view === "job_history" || view === "overview" }),
        view
      );
    }) as any
  );

  registerAppTool(
    server,
    "refresh_printer_observation",
    ({
      title: "Refresh printer observation",
      description:
        "Use this only from the mounted observation widget to refresh its selected read-only instrument strip without opening another widget.",
      inputSchema: observationInputSchema,
      ...securityConfig,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: false,
        idempotentHint: true,
      },
      _meta: {
        ...securityMetadata,
        ui: { visibility: ["app"] },
        "openai/visibility": "private",
      },
    } as any),
    (async ({ view }: { view: ObservationView }) => {
      return observationPayload(
        await observations.current({ refresh: true, includeBedMesh: view === "bed_mesh" || view === "overview", includeMaterials: view === "heads" || view === "overview", includeQueue: view === "queue" || view === "overview", includeEnvironment: view === "thermals" || view === "fans" || view === "overview", includeCurrentJob: view === "jobs" || view === "overview", includeJobHistory: view === "job_history" || view === "overview" }),
        view
      );
    }) as any
  );

  const legacyInputSchema = z.object({}).strict();
  const legacyToolMeta = {
    ...securityMetadata,
    ui: {
      visibility: ["app"],
      resourceUri: LEGACY_WIDGET_URIS[0],
    },
    "openai/visibility": "private",
    "openai/outputTemplate": LEGACY_WIDGET_URIS[0],
  };
  registerAppTool(
    server,
    "show_u1_status",
    ({
      title: "Show legacy U1 status",
      description: "Temporary app-only compatibility alias for retained status cards.",
      inputSchema: legacyInputSchema,
      ...securityConfig,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: false,
        idempotentHint: true,
      },
      _meta: legacyToolMeta,
    } as any),
    (async () => {
      const snapshot = await observations.current({ refresh: true });
      return resultPayload(snapshot.status, snapshot.metadata, {
        includeImageCard: true,
      });
    }) as any
  );
  registerAppTool(
    server,
    "get_u1_status",
    ({
      title: "Refresh legacy U1 status",
      description: "Temporary app-only compatibility refresh for retained status cards.",
      inputSchema: legacyInputSchema,
      ...securityConfig,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: false,
        idempotentHint: true,
      },
      _meta: {
        ...securityMetadata,
        ui: { visibility: ["app"] },
        "openai/visibility": "private",
      },
    } as any),
    (async () => {
      const snapshot = await observations.current({ refresh: true });
      return resultPayload(snapshot.status, snapshot.metadata);
    }) as any
  );

  if (dependencies.cameraSessions) {
    registerAppTool(
      server,
      "open_u1_camera_stream",
      ({
        title: "Open U1 camera stream",
        description:
          "Use this only from the camera widget after the user selects Go Live to start a bounded read-only relay session.",
        inputSchema: {
          activationToken: z.string().min(16).max(512),
        },
        ...securityConfig,
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          openWorldHint: false,
          idempotentHint: false,
        },
        _meta: {
          ...securityMetadata,
          ui: { visibility: ["app"] },
          "openai/visibility": "private",
          "openai/toolInvocation/invoking": "Opening U1 camera relay",
          "openai/toolInvocation/invoked": "U1 camera relay ready",
        },
      } as any),
      (async ({ activationToken }: { activationToken: string }) =>
        cameraStreamPayload(await safeCameraAction(
          () => dependencies.cameraSessions!.open(activationToken)
        ))) as any
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
        structuredContent: await safeCameraAction(
          () => dependencies.cameraSessions!.answer(sessionId, sdp)
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
        structuredContent: await safeCameraAction(
          () => dependencies.cameraSessions!.addCandidates(
            sessionId,
            candidates
          )
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
      (async ({ sessionId }: { sessionId: string }) => {
        try {
          return {
            content: [{ type: "text" as const, text: "Camera session closed." }],
            structuredContent: dependencies.cameraSessions!.close(sessionId),
          };
        } catch {
          throw new Error("camera_stream_unavailable");
        }
      }) as any
    );
  }

  registerAppTool(
    server,
    "get_u1_camera_frame",
    ({
      title: "Refresh U1 camera frame",
      description:
        "Use this when the U1 dashboard needs a fresh read-only camera frame relayed through the printer operations boundary.",
      inputSchema: {
        authorizeLive: z.boolean().optional(),
      },
      ...securityConfig,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: false,
        idempotentHint: true,
      },
      _meta: {
        ...securityMetadata,
        ui: { visibility: ["app"] },
        "openai/visibility": "private",
        "openai/toolInvocation/invoking": "Refreshing U1 camera",
        "openai/toolInvocation/invoked": "U1 camera refreshed",
      },
    } as any),
    (async ({ authorizeLive = false }: { authorizeLive?: boolean }) => {
      const { frame, metadata } = await readCameraFrame();
      let activation: { token: string; expiresAt: string } | undefined;
      if (authorizeLive && dependencies.cameraSessions) {
        try {
          activation = dependencies.cameraSessions.authorize();
        } catch {
          activation = undefined;
        }
      }
      return cameraFramePayload(frame, metadata, activation);
    }) as any
  );

  registerAppTool(
    server,
    "open_printer_camera",
    {
      title: "Open printer camera",
      description:
        "Open a new read-only, camera-only U1 widget. Use this for every explicit open, view, reopen, or additional printer-camera request, even when an earlier camera or status widget is already present. Do not substitute the full status dashboard. The widget begins with a snapshot and owns live video, close, retry, and automatic snapshot fallback.",
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
        ui: { resourceUri: CAMERA_WIDGET_URI },
        "openai/outputTemplate": CAMERA_WIDGET_URI,
        "openai/toolInvocation/invoking": "Opening U1 camera",
        "openai/toolInvocation/invoked": "U1 camera ready",
      },
    },
    async () => {
      const { frame, metadata } = await readCameraFrame();
      const result = cameraFramePayload(frame, metadata);
      return {
        ...result,
        structuredContent: {
          ...result.structuredContent,
          presentationId: randomUUID(),
        },
      };
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
          name: "observe_printer",
          title: "Observe printer",
          description:
            "Open one focused read-only U1 observation strip. Choose overview, progress, thermals, heads, jobs (current job only), job_history, queue, fans, or bed_mesh. Current Job and Job History are separate observations. Use open_printer_camera for camera viewing.",
          inputSchema: {
            type: "object",
            properties: {
              view: { type: "string", enum: [...OBSERVATION_VIEWS] },
            },
            required: ["view"],
            additionalProperties: false,
          },
          annotations: readOnlyAnnotations,
          securitySchemes,
          _meta: {
            securitySchemes,
            ui: { resourceUri: WIDGET_URI },
            "openai/outputTemplate": WIDGET_URI,
            "openai/toolInvocation/invoking": "Reading U1 observation",
            "openai/toolInvocation/invoked": "U1 observation ready",
          },
        },
        {
          name: "refresh_printer_observation",
          title: "Refresh printer observation",
          description:
            "Use this only from the mounted observation widget to refresh its selected read-only instrument strip without opening another widget.",
          inputSchema: {
            type: "object",
            properties: {
              view: { type: "string", enum: [...OBSERVATION_VIEWS] },
            },
            required: ["view"],
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
          name: "show_u1_status",
          title: "Show legacy U1 status",
          description:
            "Temporary app-only compatibility alias for retained status cards.",
          inputSchema: emptyInputSchema,
          annotations: readOnlyAnnotations,
          securitySchemes,
          _meta: {
            securitySchemes,
            ui: {
              visibility: ["app"],
              resourceUri: LEGACY_WIDGET_URIS[0],
            },
            "openai/visibility": "private",
            "openai/outputTemplate": LEGACY_WIDGET_URIS[0],
          },
        },
        {
          name: "get_u1_status",
          title: "Refresh legacy U1 status",
          description:
            "Temporary app-only compatibility refresh for retained status cards.",
          inputSchema: emptyInputSchema,
          annotations: readOnlyAnnotations,
          securitySchemes,
          _meta: {
            securitySchemes,
            ui: { visibility: ["app"] },
            "openai/visibility": "private",
          },
        },
        {
          name: "get_u1_camera_frame",
          title: "Refresh U1 camera frame",
          description:
            "Use this when the U1 dashboard needs a fresh read-only camera frame relayed through the printer operations boundary.",
          inputSchema: {
            type: "object",
            properties: { authorizeLive: { type: "boolean" } },
            additionalProperties: false,
          },
          annotations: readOnlyAnnotations,
          securitySchemes,
          _meta: {
            securitySchemes,
            ui: { visibility: ["app"] },
            "openai/visibility": "private",
            "openai/toolInvocation/invoking": "Refreshing U1 camera",
            "openai/toolInvocation/invoked": "U1 camera refreshed",
          },
        },
        {
          name: "open_printer_camera",
          title: "Open printer camera",
          description:
            "Open a new read-only, camera-only U1 widget. Use this for every explicit open, view, reopen, or additional printer-camera request, even when an earlier camera or status widget is already present. Do not substitute the full status dashboard. The widget begins with a snapshot and owns live video, close, retry, and automatic snapshot fallback.",
          inputSchema: emptyInputSchema,
          annotations: {
            ...readOnlyAnnotations,
            idempotentHint: false,
          },
          securitySchemes,
          _meta: {
            securitySchemes,
            ui: { resourceUri: CAMERA_WIDGET_URI },
            "openai/outputTemplate": CAMERA_WIDGET_URI,
            "openai/toolInvocation/invoking": "Opening U1 camera",
            "openai/toolInvocation/invoked": "U1 camera ready",
          },
        },
        ...(dependencies.cameraSessions
          ? [
              {
                name: "open_u1_camera_stream",
                title: "Open U1 camera stream",
                description:
                  "Use this only from the camera widget after the user selects Go Live to start a bounded read-only relay session.",
                inputSchema: {
                  type: "object",
                  properties: {
                    activationToken: {
                      type: "string",
                      minLength: 16,
                      maxLength: 512,
                    },
                  },
                  required: ["activationToken"],
                  additionalProperties: false,
                },
                annotations: {
                  ...readOnlyAnnotations,
                  idempotentHint: false,
                },
                securitySchemes,
                _meta: {
                  securitySchemes,
                  ui: { visibility: ["app"] },
                  "openai/visibility": "private",
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
