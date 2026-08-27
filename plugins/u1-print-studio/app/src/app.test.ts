import { afterEach, describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";

import {
  createAppServer,
  WIDGET_HTML,
  WIDGET_URI,
} from "./app.js";
import type {
  U1CameraFrame,
  U1Status,
  U1WidgetMetadata,
} from "./u1-status.js";
import { CAMERA_FRAME_ATTEMPT_TIMEOUTS_SECONDS } from "./u1-status.js";

const MCP_CONFIG = JSON.parse(
  readFileSync(new URL("../../.mcp.json", import.meta.url), "utf8")
);

const status: U1Status = {
  schemaVersion: 1,
  stateVersion: 1,
  observedAt: "2026-08-25T13:21:01.688Z",
  reachable: true,
  state: "printing",
  stateLabel: "Printing",
  progressPercent: 67.4,
  currentLayer: 126,
  totalLayers: 188,
  elapsedSeconds: 1260,
  remainingSeconds: 610,
  refreshAfterSeconds: 90,
  filename: "fixture.gcode",
  activePhysicalTool: 2,
  tools: [
    {
      physicalTool: 2,
      temperature: 220,
      target: 220,
      state: "ACTIVE",
      active: true,
    },
  ],
  bed: { temperature: 55, target: 55 },
  storage: { active: true, filePosition: 674, fileSize: 1000 },
  printerMessage: null,
  exception: false,
  camera: {
    available: true,
    service: "webrtc-camerastreamer",
    targetFps: 15,
  },
};

const metadata: U1WidgetMetadata = {};

const cameraFrame: U1CameraFrame = {
  schemaVersion: 1,
  observedAt: "2026-08-25T13:21:02.688Z",
  available: true,
  mediaType: "image/jpeg",
  byteLength: 4,
  reason: null,
};

const cameraMetadata: U1WidgetMetadata = {
  cameraFrame: {
    dataUrl: "data:image/jpeg;base64,/9j/2Q==",
  },
};

const closeCallbacks: Array<() => Promise<void>> = [];

afterEach(async () => {
  await Promise.all(closeCallbacks.splice(0).map((close) => close()));
});

async function connectClient(options: { oauth?: boolean; relay?: boolean } = {}) {
  const server = createAppServer({
    readStatus: async () => ({ status, metadata }),
    readCameraFrame: async () => ({
      frame: cameraFrame,
      metadata: cameraMetadata,
    }),
    ...(options.relay
      ? {
          cameraSessions: {
            open: async () => ({
            sessionId: "private-session-token",
            type: "offer" as const,
            sdp: "v=0\r\nfixture-offer\r\n",
            iceServers: [{
              urls: ["turns:relay.example:5349?transport=tcp"],
              username: "1700001800:fixture-nonce",
              credential: "derived-turn-credential",
            }],
            expiresAt: "2026-08-25T13:22:02.688Z",
            maxDurationSeconds: 1800,
            }),
            answer: async () => ({ accepted: true as const }),
            addCandidates: async (_sessionId, candidates) => ({
              accepted: true as const,
              candidateCount: candidates.length,
            }),
            close: () => ({ closed: true }),
          },
        }
      : {}),
  }, options.oauth
    ? {
        oauthScopes: ["u1.monitor"],
      }
    : {});
  const client = new Client({ name: "u1-print-studio-test", version: "1.0.0" });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

  await Promise.all([
    server.connect(serverTransport),
    client.connect(clientTransport),
  ]);
  closeCallbacks.push(async () => {
    await client.close();
    await server.close();
  });

  return client;
}

describe("U1 status MCP App contract", () => {
  test("keeps the MCP tool budget above the bounded camera relay budget", () => {
    const serverConfig = MCP_CONFIG.mcpServers["u1-print-studio"];
    const cameraBudgetSeconds =
      3 + CAMERA_FRAME_ATTEMPT_TIMEOUTS_SECONDS.reduce(
        (total, seconds) => total + seconds,
        0
      );

    expect(serverConfig.tool_timeout_sec).toBeGreaterThan(cameraBudgetSeconds);
  });

  test("advertises the dashboard template on the render tool descriptor", async () => {
    const client = await connectClient();
    const listed = await client.listTools();
    const show = listed.tools.find((tool) => tool.name === "show_u1_status");
    const refresh = listed.tools.find((tool) => tool.name === "get_u1_status");
    const camera = listed.tools.find(
      (tool) => tool.name === "get_u1_camera_frame"
    );

    expect(show).toBeDefined();
    expect(show?.annotations).toMatchObject({
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    });
    expect(show?._meta?.ui).toEqual({ resourceUri: WIDGET_URI });
    expect(show?._meta?.["openai/outputTemplate"]).toBe(WIDGET_URI);
    expect(refresh?._meta?.ui).toBeUndefined();
    expect(refresh?._meta?.["openai/outputTemplate"]).toBeUndefined();
    expect(camera?.annotations).toMatchObject({
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    });
    expect(camera?._meta?.ui).toBeUndefined();
  });

  test("serves a self-contained MCP App resource without LAN origins", async () => {
    const client = await connectClient();
    const result = await client.readResource({ uri: WIDGET_URI });
    const resource = result.contents[0];

    expect(resource?.uri).toBe(WIDGET_URI);
    expect(resource?.mimeType).toBe("text/html;profile=mcp-app");
    expect(resource?._meta?.ui).toMatchObject({
      prefersBorder: false,
      csp: {
        connectDomains: [],
        resourceDomains: [],
        frameDomains: [],
      },
    });
    expect("text" in resource ? resource.text : "").toBe(WIDGET_HTML);
  });

  test("keeps external CSP empty when hosted signaling is composed", async () => {
    const client = await connectClient({ oauth: true, relay: true });
    const result = await client.readResource({ uri: WIDGET_URI });
    const resource = result.contents[0];

    expect(resource?._meta?.ui).toMatchObject({
      csp: {
        connectDomains: [],
        resourceDomains: [],
        frameDomains: [],
      },
    });
    expect("text" in resource ? resource.text : "").not.toContain(
      "MOONRAKER_BASE_URL"
    );
  });

  test("returns model-readable status and a portable PNG locally", async () => {
    const client = await connectClient();
    const result = await client.callTool({ name: "show_u1_status", arguments: {} });

    expect(result.structuredContent).toEqual(status);
    expect(result._meta).toEqual(metadata);
    expect(result._meta?.["openai/outputTemplate"]).toBeUndefined();
    expect(Array.isArray(result.content)).toBe(true);
    if (!Array.isArray(result.content)) throw new Error("Expected tool content");
    expect(result.content[0]).toEqual({
      type: "text",
      text: "U1 is printing at 67.4%.",
    });
    const image = result.content[1];
    expect(image?.type).toBe("image");
    if (image?.type !== "image") throw new Error("Expected image content");
    expect(image.mimeType).toBe("image/png");
  });

  test("adds a portable PNG status card to the remote render result", async () => {
    const client = await connectClient({ oauth: true });
    const result = await client.callTool({ name: "show_u1_status", arguments: {} });

    expect(result.structuredContent).toEqual(status);
    expect(Array.isArray(result.content)).toBe(true);
    if (!Array.isArray(result.content)) throw new Error("Expected tool content");
    expect(result.content[0]).toEqual({
      type: "text",
      text: "U1 is printing at 67.4%.",
    });
    const image = result.content[1];
    expect(image?.type).toBe("image");
    if (image?.type !== "image") throw new Error("Expected image content");
    expect(image.mimeType).toBe("image/png");
    const bytes = Buffer.from(image.data, "base64");
    expect(bytes.subarray(0, 8)).toEqual(
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
    );
    expect(bytes.readUInt32BE(16)).toBe(1200);
    expect(bytes.readUInt32BE(20)).toBe(1500);
  });

  test("keeps the remote refresh result data-only", async () => {
    const client = await connectClient({ oauth: true });
    const result = await client.callTool({ name: "get_u1_status", arguments: {} });

    expect(result.content).toEqual([
      { type: "text", text: "U1 is printing at 67.4%." },
    ]);
  });

  test("returns a relayed JPEG only in camera-frame result metadata", async () => {
    const client = await connectClient();
    const result = await client.callTool({
      name: "get_u1_camera_frame",
      arguments: {},
    });

    expect(result.structuredContent).toEqual(cameraFrame);
    expect(result._meta).toEqual(cameraMetadata);
    expect(result.content).toEqual([
      { type: "text", text: "U1 camera frame refreshed." },
    ]);
    expect(JSON.stringify(result.structuredContent)).not.toContain("base64");
  });

  test("keeps bounded signaling private and app-only helpers hidden from the model", async () => {
    const client = await connectClient({ oauth: true, relay: true });
    const listed = await client.listTools();
    const stream = listed.tools.find(
      (tool) => tool.name === "open_u1_camera_stream"
    );
    const visibility = (tool: (typeof listed.tools)[number]): string[] | undefined =>
      (tool._meta?.ui as { visibility?: string[] } | undefined)?.visibility;
    const modelVisible = listed.tools.filter((tool) =>
      !visibility(tool) || visibility(tool)?.includes("model")
    );
    expect(modelVisible.map((tool) => tool.name)).toEqual([
      "show_u1_status",
      "get_u1_status",
      "get_u1_camera_frame",
      "open_u1_camera_stream",
    ]);
    expect(
      listed.tools
        .filter((tool) => visibility(tool)?.includes("app") &&
          !visibility(tool)?.includes("model"))
        .map((tool) => tool.name)
    ).toEqual([
      "answer_u1_camera_stream",
      "add_u1_camera_ice_candidates",
      "close_u1_camera_stream",
    ]);
    expect(stream?.annotations).toMatchObject({
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: false,
    });

    const result = await client.callTool({
      name: "open_u1_camera_stream",
      arguments: {},
    });
    expect(result.structuredContent).toEqual({
      schemaVersion: 2,
      available: true,
      expiresAt: "2026-08-25T13:22:02.688Z",
      maxDurationSeconds: 1800,
      reason: null,
    });
    expect(result._meta).toEqual({
      cameraStream: {
        transport: "mcp-apps-tools",
        sessionId: "private-session-token",
        offer: { type: "offer", sdp: "v=0\r\nfixture-offer\r\n" },
        iceServers: [{
          urls: ["turns:relay.example:5349?transport=tcp"],
          username: "1700001800:fixture-nonce",
          credential: "derived-turn-credential",
        }],
      },
    });
    expect(JSON.stringify(result.content)).not.toContain("private-session-token");
    expect(JSON.stringify(result.structuredContent)).not.toContain("private-session-token");
    expect(JSON.stringify(result.content)).not.toContain("derived-turn-credential");
    expect(JSON.stringify(result.structuredContent)).not.toContain(
      "derived-turn-credential"
    );
  });
});

describe("camera-first widget contract", () => {
  test("keeps snapshot fallback and opens one continuous relay per live intent", () => {
    const cameraIndex = WIDGET_HTML.indexOf('class="camera"');
    const contentIndex = WIDGET_HTML.indexOf('class="content"');

    expect(cameraIndex).toBeGreaterThan(-1);
    expect(cameraIndex).toBeLessThan(contentIndex);
    expect(WIDGET_HTML).toContain('id="snapshot"');
    expect(WIDGET_HTML).toContain('id="go-live"');
    expect(WIDGET_HTML).toContain('id="close-live"');
    expect(WIDGET_HTML).toContain('name: "get_u1_camera_frame"');
    expect(WIDGET_HTML).toContain('name: "open_u1_camera_stream"');
    expect(WIDGET_HTML).toContain('data:image/jpeg;base64,');
    expect(WIDGET_HTML).toContain('snapshotFallbackTimer = setTimeout(refreshCameraFrame, 1500)');
    expect(WIDGET_HTML).toContain('name: "answer_u1_camera_stream"');
    expect(WIDGET_HTML).toContain('name: "add_u1_camera_ice_candidates"');
    expect(WIDGET_HTML).toContain('name: "close_u1_camera_stream"');
    expect(WIDGET_HTML).not.toContain("fetch(");
    expect(WIDGET_HTML).toContain('elements.snapshot.src = dataUrl');
    expect(WIDGET_HTML).toContain('referrerpolicy="no-referrer"');
    expect(WIDGET_HTML).toContain('name: "get_u1_status"');
    expect(WIDGET_HTML).toContain('requestDisplayMode("pip")');
    expect(WIDGET_HTML).toContain('requestDisplayMode("fullscreen")');
    expect(WIDGET_HTML).toContain('id="live-stream"');
    expect(WIDGET_HTML).not.toContain("snapshotUrl");
    expect(WIDGET_HTML).not.toContain("MOONRAKER_BASE_URL");
  });

  test("supports iPhone viewports, safe areas, and touch targets", () => {
    expect(WIDGET_HTML).toContain("viewport-fit=cover");
    expect(WIDGET_HTML).toContain("min-height: 100dvh");
    expect(WIDGET_HTML).toContain("env(safe-area-inset-top, 0px)");
    expect(WIDGET_HTML).toContain('@media (max-width: 540px)');
    expect(WIDGET_HTML).toContain('@media (max-width: 380px)');
    expect(WIDGET_HTML).toContain("min-height: 44px");
    expect(WIDGET_HTML).toContain("touch-action: manipulation");
    expect(WIDGET_HTML).toContain("window.openai?.safeArea");
    expect(WIDGET_HTML).toContain("notifyIntrinsicHeight");
  });

  test("keeps camera controls icon-only and gives major components loading states", () => {
    expect(WIDGET_HTML).toContain('id="camera-status"');
    expect(WIDGET_HTML).toContain('aria-label="Open live camera"');
    expect(WIDGET_HTML).toContain('aria-label="Close live camera"');
    expect(WIDGET_HTML).not.toContain(">Go Live</button>");
    expect(WIDGET_HTML).not.toContain(">Close</button>");
    expect(WIDGET_HTML).not.toContain(">Auto</button>");
    expect(WIDGET_HTML).not.toContain(".toggle::before");
    expect(WIDGET_HTML).not.toContain('.toggle[aria-pressed="false"]::before');
    expect(WIDGET_HTML).toContain(".camera::before");
    expect(WIDGET_HTML).toContain('data-camera-loading="true"');
    expect(WIDGET_HTML).toContain('id="status-row" data-loading="true"');
    expect(WIDGET_HTML).toContain('id="progress-section" data-loading="true"');
    expect(WIDGET_HTML).toContain('id="freshness" data-loading="true"');
    expect(WIDGET_HTML).toContain("setStatusLoading");
    expect(WIDGET_HTML).toContain("setCameraState");
  });

  test("uses a neutral camera icon and an explicit camera mode label", () => {
    expect(WIDGET_HTML).not.toContain('class="camera-status-dot"');
    expect(WIDGET_HTML).not.toContain('class="camera-status-slash"');
    expect(WIDGET_HTML).not.toContain('id="camera-title"');
    expect(WIDGET_HTML).not.toContain("Build plate view");
    expect(WIDGET_HTML).not.toContain("Secure snapshot");
    expect(WIDGET_HTML).not.toContain(
      '.camera[data-camera-status="live"] .camera-status'
    );
    expect(WIDGET_HTML).toContain('class="camera-mode" id="camera-detail"');
    expect(WIDGET_HTML).toContain('justify-content: space-between;');
    expect(WIDGET_HTML).toContain(
      "align-items: center;\n        gap: 8px;\n        padding: 0 12px;"
    );
    expect(WIDGET_HTML).toContain('Snapshot fallback · ${observedLabel}');
    expect(WIDGET_HTML).toContain('Live · ${fpsLabel} FPS');
    expect(WIDGET_HTML).toContain('setCameraMode("fallback")');
    expect(WIDGET_HTML).toContain('setCameraMode("live")');
  });

  test("uses the Snapmaker charcoal and yellow card theme", () => {
    expect(WIDGET_HTML).toContain("--ink: #1c1e20;");
    expect(WIDGET_HTML).toContain("--brand: #ffcd00;");
    expect(WIDGET_HTML).toContain("--brand-warm: #ff5f28;");
    expect(WIDGET_HTML).toContain(".eyebrow {\n        margin: 0 0 6px;\n        color: var(--muted);");
    expect(WIDGET_HTML).toContain("border-top: 5px solid var(--brand);");
    expect(WIDGET_HTML).toContain("background: var(--brand);");
    expect(WIDGET_HTML).toContain("body { background: #191919; }");
    expect(WIDGET_HTML).not.toContain("--green:");
    expect(WIDGET_HTML).not.toContain("--lime:");
  });

  test("keeps semantic connectivity separate and measures delivered live FPS", () => {
    const modeIndex = WIDGET_HTML.indexOf('id="camera-detail"');
    const actionIndex = WIDGET_HTML.indexOf('id="go-live"');

    expect(modeIndex).toBeGreaterThan(-1);
    expect(modeIndex).toBeLessThan(actionIndex);
    expect(WIDGET_HTML).toContain("--positive: #32c86e;");
    expect(WIDGET_HTML).toContain("--negative: #ff6161;");
    expect(WIDGET_HTML).toContain('class="camera-mode-live-dot"');
    expect(WIDGET_HTML).toContain('class="camera-mode-disconnected"');
    expect(WIDGET_HTML).toContain('@keyframes live-pulse');
    expect(WIDGET_HTML).not.toContain("fetch(");
    expect(WIDGET_HTML).toContain('recordLiveFrame');
    expect(WIDGET_HTML).toContain('performance.now()');
    expect(WIDGET_HTML).toContain('new RTCPeerConnection({');
    expect(WIDGET_HTML).toContain('peer.setRemoteDescription');
    expect(WIDGET_HTML).toContain('peer.ontrack');
    expect(WIDGET_HTML).toContain('requestVideoFrameCallback');
    expect(WIDGET_HTML).toContain('Live · measuring FPS');
    expect(WIDGET_HTML).not.toContain('findMarker');
    expect(WIDGET_HTML).not.toContain('jpegDataUrl');
    expect(WIDGET_HTML).not.toContain("up to ${Math.round(fps)} FPS");
  });

  test("retains a valid signaling session id before validating the stream envelope", () => {
    const sessionAssignmentIndex = WIDGET_HTML.indexOf(
      'if (typeof sessionId === "string") {\n            liveSessionId = sessionId;'
    );
    const streamValidationIndex = WIDGET_HTML.indexOf(
      "response?.structuredContent?.available !== true"
    );

    expect(sessionAssignmentIndex).toBeGreaterThan(-1);
    expect(streamValidationIndex).toBeGreaterThan(-1);
    expect(sessionAssignmentIndex).toBeLessThan(streamValidationIndex);
  });
});
