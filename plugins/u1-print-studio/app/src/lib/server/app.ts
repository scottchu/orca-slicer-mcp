import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  registerAppResource,
  RESOURCE_MIME_TYPE,
} from "@modelcontextprotocol/ext-apps/server";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { monitorInputSchema, monitorOutputSchema } from "./print-monitor-schema.js";
import { observePrintMonitor, type MonitorCameraReader } from "./application/observe-print-monitor.js";
import { readMonitorCamera } from "./adapters/monitor-camera.js";
import { createToolRegistration } from "./tool-registration.js";
import embeddedMcpObservationFile from "../../../public/mcp-observation.html" with { type: "file" };
import embeddedMcpCameraFile from "../../../public/mcp-camera.html" with { type: "file" };

import {
  OBSERVATION_VIEWS,
  type ObservationView,
} from "./observation-presentation.js";
import {
  PrinterObservationStore,
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
} from "./u1-status.js";
import type {
  CameraIceCandidate,
  CameraWebRtcSessionController,
} from "./application/camera-webrtc.js";
import { CameraWebRtcSessionError } from "./application/camera-webrtc.js";
import { CameraRelayClaimError } from "./application/camera-relay.js";
import {
  U1_CAMERA_WIDGET_VERSION,
  U1_OBSERVATION_WIDGET_VERSION,
  U1_RUNTIME_VERSION,
} from "./runtime-contract.js";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const ASSET_ROOT = currentDirectory.endsWith('/src/lib/server')
  ? path.resolve(currentDirectory, '../../../public')
  : currentDirectory;
const IS_COMPILED = currentDirectory.startsWith("/$bunfs/");
export const WIDGET_URI = `ui://u1-print-studio/${U1_OBSERVATION_WIDGET_VERSION}.html`;
export const CAMERA_WIDGET_URI =
  `ui://u1-print-studio/${U1_CAMERA_WIDGET_VERSION}.html`;
export const MCP_OBSERVATION_HTML = readFileSync(IS_COMPILED ? embeddedMcpObservationFile as unknown as string : path.join(ASSET_ROOT, 'mcp-observation.html'), 'utf8');
export const MCP_CAMERA_HTML = readFileSync(IS_COMPILED ? embeddedMcpCameraFile as unknown as string : path.join(ASSET_ROOT, 'mcp-camera.html'), 'utf8');

export { observationPayload } from './observation-payload.js';
export { cameraFramePayload, cameraStreamPayload } from './camera-payload.js';
import { cameraFramePayload, cameraStreamPayload } from './camera-payload.js';
import { observePrinter } from './application/observe-printer.js';
import { refreshCameraFrame } from './application/refresh-camera-frame.js';
type StatusReader = typeof readU1Status;
type CameraFrameReader = typeof readU1CameraFrame;

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

export const createAppServer = (
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
    readMonitorCamera?: MonitorCameraReader;
    requestSignal?: AbortSignal;
    cameraSessions?: CameraWebRtcSessionController;
  } = {},
  options: {
    oauthScopes?: string[];
  } = {}
): McpServer => {
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

  const tools = createToolRegistration(server, !!securitySchemes);

  const resources = [
    {
      name: "u1-status-widget",
      uri: WIDGET_URI,
      html: MCP_OBSERVATION_HTML,
      description: "A compact read-only Snapmaker U1 focused instrument strip.",
    },
    {
      name: "u1-camera-widget",
      uri: CAMERA_WIDGET_URI,
      html: MCP_CAMERA_HTML,
      description: `A camera-only Snapmaker U1 view (${U1_CAMERA_WIDGET_VERSION}) with automatic snapshots, user-requested read-only live video, and automatic snapshot fallback.`,
    },
  ];
  for (const resource of resources) {
    registerAppResource(server, resource.name, resource.uri, {}, async () => ({
      contents: [{
        uri: resource.uri,
        mimeType: RESOURCE_MIME_TYPE,
        text: resource.html,
        _meta: {
          ui: {
            prefersBorder: false,
            csp: { connectDomains: [], resourceDomains: [], frameDomains: [] },
          },
          "openai/widgetDescription": resource.description,
        },
      }],
    }));
  }

  tools.register('get_printer_snapshot', {
    title: 'Get printer snapshot',
    description: 'Get one bounded read-only printer telemetry snapshot and optionally one model-readable camera image. Does not start background monitoring or control the printer. Run continuity is observational, not a durable printer-run identity. Use open_printer_view or open_printer_camera when a focused widget is wanted.',
    inputSchema: monitorInputSchema,
    outputSchema: monitorOutputSchema,
    ...securityConfig,
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false, idempotentHint: true },
    ...(securitySchemes ? { _meta: securityMetadata } : {}),
  }, async (input, extra) => {
    const result = await observePrintMonitor(observations, input, {
      readCamera: dependencies.readMonitorCamera ?? readMonitorCamera, issueToken: randomUUID, signal: dependencies.requestSignal ? AbortSignal.any([extra.signal, dependencies.requestSignal]) : extra.signal,
    });
    const structuredContent = monitorOutputSchema.parse(result.snapshot);
    const text = JSON.stringify(structuredContent);
    if (Buffer.byteLength(text, 'utf8') > 16 * 1024) throw new Error('Monitor output exceeded its bound');
    return { isError: result.isError, structuredContent,
      content: [{ type: 'text' as const, text }, ...(result.image ? [{ type: 'image' as const, mimeType: 'image/jpeg', data: Buffer.from(result.image).toString('base64') }] : [])] };
  });

  const observationViewSchema = z.enum(OBSERVATION_VIEWS);
  const observationInputSchema = z.object({ view: observationViewSchema }).strict();
  tools.register(
    "open_printer_view",
    ({
      title: "Open printer view",
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
    }),
    (async ({ view }: { view: ObservationView }) => {
      return observePrinter(observations, view);
    })
  );

  tools.register(
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
    }),
    (async ({ view }: { view: ObservationView }) => {
      return observePrinter(observations, view);
    })
  );

  if (dependencies.cameraSessions) {
    tools.register(
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
      }),
      (async ({ activationToken }: { activationToken: string }) =>
        cameraStreamPayload(await safeCameraAction(
          () => dependencies.cameraSessions!.open(activationToken)
        )))
    );

    const privateToolMetadata = {
      ...securityMetadata,
      ui: { visibility: ["app"] },
      "openai/visibility": "private",
    };
    const sessionId = z.string().min(16).max(512);
    tools.register(
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
      },
      (async ({ sessionId, sdp }: { sessionId: string; sdp: string }) => ({
        content: [{ type: "text" as const, text: "Camera answer accepted." }],
        structuredContent: await safeCameraAction(
          () => dependencies.cameraSessions!.answer(sessionId, sdp)
        ),
      }))
    );
    tools.register(
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
      },
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
      }))
    );
    tools.register(
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
      },
      (async ({ sessionId }: { sessionId: string }) => {
        try {
          return {
            content: [{ type: "text" as const, text: "Camera session closed." }],
            structuredContent: dependencies.cameraSessions!.close(sessionId),
          };
        } catch {
          throw new Error("camera_stream_unavailable");
        }
      })
    );
  }

  tools.register(
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
    }),
    (async ({ authorizeLive = false }: { authorizeLive?: boolean }) => {
      return refreshCameraFrame(readCameraFrame, dependencies.cameraSessions, authorizeLive);
    })
  );

  tools.register(
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

  tools.finish();

  return server;
};
