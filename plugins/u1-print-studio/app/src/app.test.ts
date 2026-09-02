import { afterEach, describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";

import {
  CAMERA_WIDGET_HTML,
  CAMERA_WIDGET_URI,
  createAppServer,
  LEGACY_CAMERA_WIDGET_URIS,
  LEGACY_CAMERA_WIDGET_HTML,
  LEGACY_FOCUSED_WIDGET_URIS,
  LEGACY_WIDGET_HTML,
  LEGACY_WIDGET_URIS,
  WIDGET_HTML,
  WIDGET_URI,
} from "./app.js";
import type {
  U1CameraFrame,
  U1Status,
  U1WidgetMetadata,
} from "./u1-status.js";
import { CAMERA_FRAME_ATTEMPT_TIMEOUTS_SECONDS } from "./u1-status.js";
import { PrinterObservationStore } from "./observation-store.js";
import { unavailableBedMesh } from "./application/bed-mesh-observation.js";
import { unavailableMaterials } from "./application/material-observation.js";
import { unavailableQueue } from "./application/queue-observation.js";
import { unavailableEnvironment } from "./application/environment-observation.js";
import { unavailableCurrentJob } from "./application/current-job-observation.js";
import { unavailableJobHistory } from "./application/job-history-observation.js";

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
    service: "webrtc",
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

async function connectClient(options: {
  oauth?: boolean;
  relay?: boolean;
  onSessionOpen?: () => void;
  onStatusRead?: () => void;
  statusResult?: U1Status;
  cameraResult?: { frame: U1CameraFrame; metadata: U1WidgetMetadata };
  sessionFailure?: Error;
  observations?: PrinterObservationStore;
} = {}) {
  const server = createAppServer({
    readStatus: async () => {
      options.onStatusRead?.();
      return { status: options.statusResult ?? status, metadata };
    },
    readCameraFrame: async () => options.cameraResult ?? ({
      frame: cameraFrame,
      metadata: cameraMetadata,
    }),
    ...(options.observations ? { observations: options.observations } : {}),
    ...(options.relay
      ? {
          cameraSessions: {
            authorize: () => ({
              token: "private-activation-token",
              expiresAt: "2026-08-25T13:21:32.688Z",
            }),
            open: async () => {
              options.onSessionOpen?.();
              if (options.sessionFailure) throw options.sessionFailure;
              return {
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
              };
            },
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
  test("Overview alone acquires and coalesces all six optional domains without leaking demand to focused or static reads", async () => {
    const counts = { status: 0, mesh: 0, materials: 0, queue: 0, environment: 0, current: 0, history: 0 };
    const receipt = "2026-08-31T23:30:00.000Z";
    const store = new PrinterObservationStore(
      async () => { counts.status++; return { status, metadata }; },
      () => new Date(receipt),
      async () => { counts.mesh++; return unavailableBedMesh("not_reported", receipt); },
      async () => { counts.materials++; return unavailableMaterials("not_reported", receipt); },
      async () => { counts.queue++; return unavailableQueue("network", receipt); },
      async () => { counts.environment++; return unavailableEnvironment("network", receipt); },
      async () => { counts.current++; return unavailableCurrentJob("network", receipt); },
      async () => { counts.history++; return unavailableJobHistory("network", receipt); },
    );
    const client = await connectClient({ observations: store });
    const [first, second] = await Promise.all([1, 2].map(() => client.callTool({
      name: "observe_printer", arguments: { view: "overview" },
    })));
    expect(counts).toEqual({ status: 1, mesh: 1, materials: 1, queue: 1,
      environment: 1, current: 1, history: 1 });
    for (const result of [first, second]) expect(result.structuredContent).toMatchObject({
      view: "overview", module: { kind: "overview", tiles: [
        { id: "progress" }, { id: "thermals" }, { id: "heads" }, { id: "jobs" },
        { id: "job_history" }, { id: "queue" }, { id: "fans" }, { id: "bed_mesh" },
      ] },
    });
    await client.callTool({ name: "observe_printer", arguments: { view: "progress" } });
    await client.listResources();
    expect(counts).toEqual({ status: 1, mesh: 1, materials: 1, queue: 1,
      environment: 1, current: 1, history: 1 });

    let isolatedReads = 0;
    const isolated = new PrinterObservationStore(async () => {
      isolatedReads++; return { status, metadata };
    }, () => new Date(receipt));
    const isolatedClient = await connectClient({ observations: isolated });
    const isolatedResult = await isolatedClient.callTool({ name: "observe_printer", arguments: { view: "overview" } });
    expect(isolatedReads).toBe(1);
    expect(isolatedResult.structuredContent).toMatchObject({
      module: { kind: "overview", coverage: "partial", tiles: expect.arrayContaining([
        expect.objectContaining({ id: "queue", state: "unknown" }),
        expect.objectContaining({ id: "fans", state: "unknown" }),
        expect.objectContaining({ id: "bed_mesh", state: "unknown" }),
      ]) },
    });
  });

  test("keeps the MCP tool budget above the bounded camera relay budget", () => {
    const serverConfig = MCP_CONFIG.mcpServers["u1-print-studio"];
    const cameraBudgetSeconds =
      3 + CAMERA_FRAME_ATTEMPT_TIMEOUTS_SECONDS.reduce(
        (total, seconds) => total + seconds,
        0
      );

    expect(serverConfig.tool_timeout_sec).toBeGreaterThan(cameraBudgetSeconds);
  });

  test("advertises one focused observation tool and app-only refresh", async () => {
    const client = await connectClient();
    const listed = await client.listTools();
    const observe = listed.tools.find((tool) => tool.name === "observe_printer");
    const refresh = listed.tools.find(
      (tool) => tool.name === "refresh_printer_observation"
    );
    const camera = listed.tools.find(
      (tool) => tool.name === "get_u1_camera_frame"
    );

    expect(WIDGET_URI).toBe("ui://u1-print-studio/observation-v14.html");
    expect(LEGACY_FOCUSED_WIDGET_URIS).toEqual([
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
    ]);

    expect(observe).toBeDefined();
    expect(observe?.annotations).toMatchObject({
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    });
    expect(observe?._meta?.ui).toEqual({ resourceUri: WIDGET_URI });
    expect(observe?._meta?.["openai/outputTemplate"]).toBe(WIDGET_URI);
    expect(observe?.inputSchema).toMatchObject({
      required: ["view"],
      properties: {
        view: {
          enum: [
            "overview", "progress", "thermals", "heads", "jobs", "job_history", "queue",
            "fans", "bed_mesh",
          ],
        },
      },
    });
    expect(refresh?._meta?.ui).toEqual({ visibility: ["app"] });
    expect(refresh?._meta?.["openai/outputTemplate"]).toBeUndefined();
    expect(camera?.annotations).toMatchObject({
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    });
    expect(camera?._meta?.ui).toEqual({ visibility: ["app"] });
  });

  test("fails closed for unknown views and generic selector fields", async () => {
    const client = await connectClient();
    const unknown = await client.callTool({
      name: "observe_printer",
      arguments: { view: "camera" },
    });
    const generic = await client.callTool({
      name: "observe_printer",
      arguments: { view: "progress", selector: "printer.objects.query" },
    });

    expect(unknown.isError).toBe(true);
    expect(generic.isError).toBe(true);
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
    expect(LEGACY_WIDGET_HTML).not.toBe(WIDGET_HTML);
    expect(createHash("sha256").update(LEGACY_WIDGET_HTML).digest("hex")).toBe(
      "7181accfffb51057e5fcc4448961f0e7090834d6c17b91d910fff23979d1b0dd"
    );
    const focusedLegacy = await client.readResource({
      uri: LEGACY_FOCUSED_WIDGET_URIS[0],
    });
    expect(focusedLegacy.contents[0]).toMatchObject({
      uri: LEGACY_FOCUSED_WIDGET_URIS[0],
      text: WIDGET_HTML,
    });
  });

  test("serves a dedicated camera-only MCP App resource", async () => {
    const client = await connectClient({ oauth: true, relay: true });
    const listed = await client.listResources();
    const result = await client.readResource({ uri: CAMERA_WIDGET_URI });
    const resource = result.contents[0];

    expect(listed.resources.map(({ uri }) => uri)).toContain(CAMERA_WIDGET_URI);
    expect(resource?.uri).toBe(CAMERA_WIDGET_URI);
    expect(resource?.mimeType).toBe("text/html;profile=mcp-app");
    expect(resource?._meta?.ui).toMatchObject({
      prefersBorder: false,
      csp: {
        connectDomains: [],
        resourceDomains: [],
        frameDomains: [],
      },
    });
    expect("text" in resource ? resource.text : "").toBe(CAMERA_WIDGET_HTML);
    expect(CAMERA_WIDGET_URI).toBe("ui://u1-print-studio/camera-v10.html");
    expect(LEGACY_CAMERA_WIDGET_URIS[0]).toBe(
      "ui://u1-print-studio/camera-v3.html"
    );
    expect(LEGACY_CAMERA_WIDGET_HTML).not.toBe(CAMERA_WIDGET_HTML);
    expect(
      createHash("sha256").update(LEGACY_CAMERA_WIDGET_HTML).digest("hex")
    ).toBe("0c4b47cb836c80e1ecd61b28b07b191bfe49a4ea5672af641a0af0f8baef6f53");

    for (const legacyUri of LEGACY_CAMERA_WIDGET_URIS) {
      const legacy = await client.readResource({ uri: legacyUri });
      expect(listed.resources.map(({ uri }) => uri)).toContain(legacyUri);
      expect(legacy.contents[0]?.uri).toBe(legacyUri);
      expect(
        "text" in legacy.contents[0]! ? legacy.contents[0].text : ""
      ).toBe(LEGACY_CAMERA_WIDGET_HTML);
    }
  });

  test("retains previous current observation and camera aliases with exact frozen legacy resources", async () => {
    const client = await connectClient();
    const listed = await client.listResources();
    expect(listed.resources).toHaveLength(26);
    expect(LEGACY_FOCUSED_WIDGET_URIS[0]).toBe("ui://u1-print-studio/observation-v13.html");
    for (const uri of [...LEGACY_FOCUSED_WIDGET_URIS,
      "ui://u1-print-studio/camera-v9.html", "ui://u1-print-studio/camera-v8.html", "ui://u1-print-studio/camera-v7.html", "ui://u1-print-studio/camera-v6.html",
      "ui://u1-print-studio/camera-v5.html", "ui://u1-print-studio/camera-v4.html",
    ]) {
      expect(listed.resources.map(resource => resource.uri)).toContain(uri);
      const result = await client.readResource({ uri });
      const resource = result.contents[0]!;
      expect("text" in resource ? resource.text : "").toBe(uri.includes("camera-") ? CAMERA_WIDGET_HTML : WIDGET_HTML);
    }
  });

  test("keeps the previous widget URI readable for mounted cards during upgrades", async () => {
    const client = await connectClient();
    const legacyUri = LEGACY_WIDGET_URIS[0];
    const listed = await client.listResources();
    const result = await client.readResource({ uri: legacyUri });
    const resource = result.contents[0];

    expect(listed.resources.map(({ uri }) => uri)).toEqual(
      expect.arrayContaining([WIDGET_URI, legacyUri])
    );
    expect(resource?.uri).toBe(legacyUri);
    expect(resource?.mimeType).toBe("text/html;profile=mcp-app");
    expect(resource?._meta?.ui).toMatchObject({
      csp: {
        connectDomains: [],
        resourceDomains: [],
        frameDomains: [],
      },
    });
    expect("text" in resource ? resource.text : "").toBe(LEGACY_WIDGET_HTML);
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

  test("returns focused model-readable observations without a large PNG card", async () => {
    const client = await connectClient();
    const result = await client.callTool({
      name: "observe_printer",
      arguments: { view: "thermals" },
    });
    expect(result.structuredContent).toMatchObject({
      schemaVersion: 2,
      view: "thermals",
      freshness: "fresh",
      connectionEpoch: 1,
      module: {
        kind: "thermals",
        state: "known",
        readings: expect.arrayContaining([
          expect.objectContaining({
            id: "tool-2",
            actual: { state: "known", value: 220 },
            target: { state: "known", value: 220 },
          }),
          expect.objectContaining({
            id: "cavity",
            state: "unknown",
            capabilityEvidence: "unknown",
          }),
        ]),
      },
    });
    expect(result.content).toEqual([
      { type: "text", text: "U1 thermals observation is known." },
    ]);
    expect(result.structuredContent).not.toHaveProperty("capabilityEvidence");
    expect(JSON.stringify(result.content)).not.toContain('"type":"image"');
    expect(JSON.stringify(result.structuredContent)).not.toContain('"actual":0');
  });

  test("keeps the widget refresh focused and data-only", async () => {
    const client = await connectClient({ oauth: true });
    const result = await client.callTool({
      name: "refresh_printer_observation",
      arguments: { view: "queue" },
    });
    expect(result.structuredContent).toMatchObject({
      view: "queue",
      module: {
        kind: "queue",
        state: "unknown",
        capabilityEvidence: "unknown",
        items: [],
      },
    });
    expect(result.content).toEqual([
      { type: "text", text: "U1 queue observation is unknown." },
    ]);
  });

  test("projects multiple focused cards from one shared snapshot", async () => {
    let reads = 0;
    const client = await connectClient({ onStatusRead: () => { reads += 1; } });
    const progress = await client.callTool({
      name: "observe_printer",
      arguments: { view: "progress" },
    });
    const thermals = await client.callTool({
      name: "observe_printer",
      arguments: { view: "thermals" },
    });
    const refreshed = await client.callTool({
      name: "refresh_printer_observation",
      arguments: { view: "heads" },
    });
    const versions = [progress, thermals, refreshed].map((result) =>
      (result.structuredContent as { observationVersion?: number })
        .observationVersion
    );
    expect(reads).toBe(1);
    expect(new Set(versions)).toEqual(new Set([1]));
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
    let sessionOpenCount = 0;
    const client = await connectClient({
      oauth: true,
      relay: true,
      onSessionOpen: () => { sessionOpenCount += 1; },
    });
    const listed = await client.listTools();
    const stream = listed.tools.find(
      (tool) => tool.name === "open_u1_camera_stream"
    );
    const openCamera = listed.tools.find(
      (tool) => tool.name === "open_printer_camera"
    );
    const visibility = (tool: (typeof listed.tools)[number]): string[] | undefined =>
      (tool._meta?.ui as { visibility?: string[] } | undefined)?.visibility;
    const modelVisible = listed.tools.filter((tool) =>
      !visibility(tool) || visibility(tool)?.includes("model")
    );
    expect(modelVisible.map((tool) => tool.name)).toEqual([
      "observe_printer",
      "open_printer_camera",
    ]);
    expect(
      listed.tools
        .filter((tool) => visibility(tool)?.includes("app") &&
          !visibility(tool)?.includes("model"))
        .map((tool) => tool.name)
    ).toEqual([
      "refresh_printer_observation",
      "show_u1_status",
      "get_u1_status",
      "get_u1_camera_frame",
      "open_u1_camera_stream",
      "answer_u1_camera_stream",
      "add_u1_camera_ice_candidates",
      "close_u1_camera_stream",
    ]);
    expect(stream?.annotations).toMatchObject({
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: false,
    });
    expect(stream?._meta?.ui).toEqual({ visibility: ["app"] });
    expect(stream?._meta?.["openai/outputTemplate"]).toBeUndefined();
    expect(openCamera?.annotations).toMatchObject({
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: false,
    });
    expect(openCamera?._meta?.ui).toEqual({
      resourceUri: CAMERA_WIDGET_URI,
    });
    expect(openCamera?._meta?.["openai/outputTemplate"]).toBe(
      CAMERA_WIDGET_URI
    );
    expect(openCamera?.description).toContain("every explicit open");
    expect(openCamera?.description).toContain("camera-only");
    expect(
      listed.tools.find((tool) => tool.name === "observe_printer")?.description
    ).toContain("focused");

    const legacyShow = await client.callTool({
      name: "show_u1_status",
      arguments: {},
    });
    const legacyRefresh = await client.callTool({
      name: "get_u1_status",
      arguments: {},
    });
    expect(legacyShow.structuredContent).toMatchObject({ state: "printing" });
    expect(JSON.stringify(legacyShow.content)).toContain('"type":"image"');
    expect(legacyRefresh.structuredContent).toMatchObject({ state: "printing" });
    expect(JSON.stringify(legacyRefresh.content)).not.toContain('"type":"image"');

    const openedCamera = await client.callTool({
      name: "open_printer_camera",
      arguments: {},
    });
    expect(openedCamera.structuredContent).toMatchObject(cameraFrame);
    const openedPresentation = openedCamera.structuredContent as
      | { presentationId?: string }
      | undefined;
    expect(openedPresentation?.presentationId).toEqual(
      expect.any(String)
    );
    expect(openedCamera._meta).toEqual(cameraMetadata);
    expect(sessionOpenCount).toBe(0);

    const reopenedCamera = await client.callTool({
      name: "open_printer_camera",
      arguments: {},
    });
    const reopenedPresentation = reopenedCamera.structuredContent as
      | { presentationId?: string }
      | undefined;
    expect(reopenedPresentation?.presentationId).not.toBe(
      openedPresentation?.presentationId
    );
    expect(sessionOpenCount).toBe(0);

    const staleResult = await client.callTool({
      name: "open_u1_camera_stream",
      arguments: {},
    });
    expect(staleResult.isError).toBe(true);
    expect(sessionOpenCount).toBe(0);

    const activationResult = await client.callTool({
      name: "get_u1_camera_frame",
      arguments: { authorizeLive: true },
    });
    expect(activationResult._meta?.cameraActivation).toEqual({
      schemaVersion: 12,
      token: "private-activation-token",
      expiresAt: "2026-08-25T13:21:32.688Z",
    });
    expect(JSON.stringify(activationResult.content)).not.toContain(
      "private-activation-token"
    );
    expect(JSON.stringify(activationResult.structuredContent)).not.toContain(
      "private-activation-token"
    );

    const result = await client.callTool({
      name: "open_u1_camera_stream",
      arguments: { activationToken: "private-activation-token" },
    });
    expect(sessionOpenCount).toBe(1);
    expect(result.structuredContent).toEqual({
      schemaVersion: 2,
      available: true,
      expiresAt: "2026-08-25T13:22:02.688Z",
      maxDurationSeconds: 1800,
      iceMode: "turn",
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

  test("removes printer identity from status, JPEG metadata, and failure envelopes", async () => {
    const sentinels = [
      "printer.local",
      "192.168.50.44",
      "aa:bb:cc:dd:ee:ff",
      "private-printer-peer-id",
      "device-serial-private",
      "v=0-private-upstream-sdp",
    ];
    const appSegment = (marker: number, value: string) => {
      const payload = Buffer.from(value);
      const header = Buffer.alloc(4);
      header[0] = 0xff;
      header[1] = marker;
      header.writeUInt16BE(payload.length + 2, 2);
      return Buffer.concat([header, payload]);
    };
    const hostileJpeg = Buffer.concat([
      Buffer.from([0xff, 0xd8]),
      appSegment(0xe1, sentinels.join(" ")),
      Buffer.from([0xff, 0xd9]),
    ]);
    const client = await connectClient({
      oauth: true,
      relay: true,
      statusResult: {
        ...status,
        printerHost: sentinels[0],
        state: sentinels[0]!,
        stateLabel: sentinels[1]!,
        printerMessage: sentinels.join(" "),
        tools: status.tools.map((tool) => ({
          ...tool,
          state: sentinels[2]!,
          printerMac: sentinels[2],
        })),
        camera: {
          ...status.camera,
          service: sentinels[4]!,
          upstreamRoute: sentinels[5],
        },
      } as U1Status,
      cameraResult: {
        frame: {
          ...cameraFrame,
          byteLength: hostileJpeg.length,
          upstreamPeerId: sentinels[3],
        } as U1CameraFrame,
        metadata: {
          cameraFrame: {
            dataUrl:
              `data:image/jpeg;base64,${hostileJpeg.toString("base64")}`,
          },
        },
      },
      sessionFailure: new Error(sentinels.join(" ")),
    });

    const statusResult = await client.callTool({
      name: "observe_printer",
      arguments: { view: "overview" },
    });
    const cameraResult = await client.callTool({
      name: "open_printer_camera",
      arguments: {},
    });
    const activation = await client.callTool({
      name: "get_u1_camera_frame",
      arguments: { authorizeLive: true },
    });
    const activationToken = (
      activation._meta?.cameraActivation as { token?: string } | undefined
    )?.token;
    const streamFailure = await client.callTool({
      name: "open_u1_camera_stream",
      arguments: { activationToken },
    });

    const publicEnvelope = JSON.stringify([
      statusResult,
      cameraResult,
      streamFailure,
    ]);
    for (const sentinel of sentinels) {
      expect(publicEnvelope).not.toContain(sentinel);
    }
    expect(statusResult.structuredContent).toMatchObject({
      printerState: "unknown",
      printerStateLabel: "Unknown",
      module: { kind: "overview", state: "known", coverage: "partial" },
    });
    expect(streamFailure.isError).toBe(true);
    expect(publicEnvelope).toContain("camera_stream_unavailable");
  });
});

describe("camera-only widget contract", () => {
  test("parses its module script under strict-mode semantics", () => {
    const scriptStart = CAMERA_WIDGET_HTML.indexOf('<script type="module">');
    const sourceStart = scriptStart + '<script type="module">'.length;
    const scriptEnd = CAMERA_WIDGET_HTML.indexOf("</script>", sourceStart);
    const source = CAMERA_WIDGET_HTML.slice(sourceStart, scriptEnd);

    expect(scriptStart).toBeGreaterThan(-1);
    expect(scriptEnd).toBeGreaterThan(sourceStart);
    expect(() => new Function(`"use strict";\n${source}`)).not.toThrow();
  });

  test("contains only the snapshot, stream, and fallback camera experience", () => {
    expect(CAMERA_WIDGET_HTML).toContain('id="snapshot"');
    expect(CAMERA_WIDGET_HTML).toContain('id="live-stream"');
    expect(CAMERA_WIDGET_HTML).toContain('id="go-live"');
    expect(CAMERA_WIDGET_HTML).toContain('id="close-live"');
    expect(CAMERA_WIDGET_HTML).toContain('data-camera-mode="loading"');
    expect(CAMERA_WIDGET_HTML).toContain('setCameraMode("fallback"');
    expect(CAMERA_WIDGET_HTML).toContain(
      "snapshotFallbackTimer = setTimeout(refreshCameraFrame, 1500)"
    );
    expect(CAMERA_WIDGET_HTML).not.toContain('id="progress-section"');
    expect(CAMERA_WIDGET_HTML).not.toContain('name: "get_u1_status"');
  });

  test("uses the selected white camera shell without artificial image overlays", () => {
    expect(CAMERA_WIDGET_HTML).toContain('class="dashboard u1-card"');
    expect(CAMERA_WIDGET_HTML).not.toContain('<header class="camera-heading">');
    expect(CAMERA_WIDGET_HTML).not.toContain("<h1>Printer Camera</h1>");
    expect(CAMERA_WIDGET_HTML).not.toContain("Read only");
    expect(CAMERA_WIDGET_HTML).toContain('id="fullscreen"');
    expect(CAMERA_WIDGET_HTML).toContain('id="picture-in-picture"');
    expect(CAMERA_WIDGET_HTML).toContain("--brand: var(--u1-accent);");
    expect(CAMERA_WIDGET_HTML).toContain("width: min(100%, 1120px);");
    expect(CAMERA_WIDGET_HTML).not.toContain("background-size: 42px 42px;");
    expect(CAMERA_WIDGET_HTML).toContain('<header class="camera-header u1-header">');
    expect(CAMERA_WIDGET_HTML).toContain('<h1 class="u1-title">U1 Camera</h1>');
    expect(CAMERA_WIDGET_HTML).toContain('aria-label="Open live camera"');
    expect(CAMERA_WIDGET_HTML).not.toContain(">Go Live</button>");
    expect(WIDGET_HTML).not.toContain('class="camera"');
  });

  test("uses only the MCP Apps bridge for camera data and signaling", () => {
    expect(CAMERA_WIDGET_HTML).toContain('"tools/call",');
    expect(CAMERA_WIDGET_HTML).toContain('callTool("get_u1_camera_frame"');
    expect(CAMERA_WIDGET_HTML).toContain("authorizeLive: true");
    expect(CAMERA_WIDGET_HTML).toContain("activationToken: activation.token");
    expect(CAMERA_WIDGET_HTML).toContain('callTool("open_u1_camera_stream"');
    expect(CAMERA_WIDGET_HTML).toContain('callTool("answer_u1_camera_stream"');
    expect(CAMERA_WIDGET_HTML).toContain('callTool("add_u1_camera_ice_candidates"');
    expect(CAMERA_WIDGET_HTML).toContain('callTool("close_u1_camera_stream"');
    expect(CAMERA_WIDGET_HTML).not.toContain("fetch(");
    expect(CAMERA_WIDGET_HTML).not.toContain("MOONRAKER_BASE_URL");
    expect(CAMERA_WIDGET_HTML).not.toContain("snapshotUrl");
  });

  test("hydrates the opening snapshot from compatibility result envelopes", () => {
    expect(CAMERA_WIDGET_HTML).toContain("window.openai?.toolResponseMetadata");
    expect(CAMERA_WIDGET_HTML).toContain("metadata?.mcp_tool_result");
    expect(CAMERA_WIDGET_HTML).toContain("metadata?.call_tool_result");
    expect(CAMERA_WIDGET_HTML).toContain(
      "initial?.structuredContent?.mediaType !== undefined"
    );
    expect(CAMERA_WIDGET_HTML).toContain("applyCameraFrame(initial)");
    expect(CAMERA_WIDGET_HTML).not.toContain(
      "void openCameraStream(initial)"
    );
    const sessionAssignment = CAMERA_WIDGET_HTML.indexOf(
      'if (typeof sessionId === "string") liveSessionId = sessionId;'
    );
    const validation = CAMERA_WIDGET_HTML.indexOf(
      'response?.structuredContent?.available !== true'
    );
    expect(sessionAssignment).toBeGreaterThan(-1);
    expect(validation).toBeGreaterThan(sessionAssignment);
  });

  test("gates live state on a rendered frame and falls back when playback fails", () => {
    const onTrackStart = CAMERA_WIDGET_HTML.indexOf("peer.ontrack = (event)");
    const connectionStateStart = CAMERA_WIDGET_HTML.indexOf(
      "peer.onconnectionstatechange",
      onTrackStart
    );
    const onTrackSource = CAMERA_WIDGET_HTML.slice(
      onTrackStart,
      connectionStateStart
    );

    expect(CAMERA_WIDGET_HTML).toContain("markFirstRenderedFrame");
    expect(CAMERA_WIDGET_HTML).toContain("requestVideoFrameCallback");
    expect(CAMERA_WIDGET_HTML).toContain("no rendered video frames");
    expect(CAMERA_WIDGET_HTML).toContain("video playback rejected");
    expect(CAMERA_WIDGET_HTML).toContain("video track ended");
    expect(CAMERA_WIDGET_HTML).toContain('addEventListener("stalled"');
    expect(onTrackSource).not.toContain(
      'elements.camera.classList.add("has-live")'
    );
  });

  test("keeps activation snapshots in connecting state until success or failure", () => {
    for (const html of [CAMERA_WIDGET_HTML]) {
      const frameStart = html.indexOf("const applyCameraFrame = (result,");
      const frameEnd = html.indexOf("window.addEventListener", frameStart);
      const frameSource = html.slice(frameStart, frameEnd);
      const trackStart = html.indexOf("peer.ontrack = (event)");
      const trackEnd = html.indexOf("peer.onconnectionstatechange", trackStart);
      const trackSource = html.slice(trackStart, trackEnd);

      expect(frameSource).toContain(
        'livePreview ? (fallbackDetail ? "fallback" : "loading") : "loading"'
      );
      expect(frameSource).not.toContain('livePreview ? "fallback" : "snapshot"');
      expect(frameSource).toContain(
        'elements.camera.classList.contains("has-snapshot")'
      );
      expect(html).toContain('relayRendering ? "live" : fallbackDetail ? "fallback" : "loading"');
      expect(html).toContain("markFirstRenderedFrame");
      expect(html).toContain("no rendered video frames");
      expect(trackSource).not.toContain(
        'elements.camera.classList.add("has-live")'
      );
    }
  });

  test("shows one coherent waiting or unavailable state and gates Go Live on a usable snapshot", () => {
    expect(CAMERA_WIDGET_HTML).toContain(
      'id="camera-empty-message" role="status" aria-live="polite">Waiting for camera'
    );
    expect(CAMERA_WIDGET_HTML).toContain(
      'id="go-live" type="button" title="Open live camera" aria-label="Open live camera" disabled hidden'
    );
    expect(CAMERA_WIDGET_HTML).toContain(
      'state === "snapshot" &&\n          elements.camera.classList.contains("has-snapshot") && !livePreview'
    );
    expect(CAMERA_WIDGET_HTML).toContain(
      'elements.goLive.disabled = !canGoLive;'
    );
    expect(CAMERA_WIDGET_HTML).toContain(
      'elements.goLive.hidden = !canGoLive;'
    );
    expect(CAMERA_WIDGET_HTML).toContain(
      'state === "unavailable"\n          ? "Camera unavailable"\n          : "Waiting for camera"'
    );
    expect(CAMERA_WIDGET_HTML).not.toContain(
      '.camera[data-camera-status="unavailable"] .camera-bottom { display: none; }'
    );
    expect(CAMERA_WIDGET_HTML).toContain('id="refresh-snapshot"');
  });
});

describe("instrument-strip observation widget contract", () => {
  test("parses its module script under strict-mode semantics", () => {
    const scriptStart = WIDGET_HTML.indexOf('<script type="module">');
    const sourceStart = scriptStart + '<script type="module">'.length;
    const scriptEnd = WIDGET_HTML.indexOf("</script>", sourceStart);
    const source = WIDGET_HTML.slice(sourceStart, scriptEnd);

    expect(scriptStart).toBeGreaterThan(-1);
    expect(scriptEnd).toBeGreaterThan(sourceStart);
    expect(() => new Function(`"use strict";\n${source}`)).not.toThrow();
  });

  test("renders exactly one selected focused or composed Overview module", () => {
    expect(WIDGET_HTML).toContain('const VIEWS = ["overview", "progress", "thermals", "heads", "jobs", "job_history", "queue", "fans", "bed_mesh"]');
    expect(WIDGET_HTML).toContain("const renderers = {");
    expect(WIDGET_HTML).toContain("progress: renderProgress");
    expect(WIDGET_HTML).toContain("thermals: renderThermals");
    expect(WIDGET_HTML).toContain("bed_mesh: renderBedMesh");
    expect(WIDGET_HTML).toContain("overview: renderOverview");
    expect(WIDGET_HTML).toContain("renderers[view](observation.module)");
    expect(WIDGET_HTML).not.toContain("VIEWS.slice(1)");
    expect(WIDGET_HTML).not.toContain("refreshTimer");
    expect(WIDGET_HTML).not.toContain("setTimeout(() => void refresh()");
    expect(WIDGET_HTML).toContain('name: "refresh_printer_observation"');
    expect(WIDGET_HTML).not.toContain('id="snapshot"');
    expect(WIDGET_HTML).not.toContain('open_u1_camera_stream');
  });

  test("renders missing and advertised-only semantics as unknown", () => {
    expect(WIDGET_HTML).toContain('empty ? "Empty"');
    expect(WIDGET_HTML).toContain('loaded ? reportedMaterial || "N/A" : "N/A"');
    expect(WIDGET_HTML).toContain('header("Current Job", true, data.sourceObservedAt');
    expect(WIDGET_HTML).toContain('header("Job History", true, data.sourceObservedAt');
    expect(WIDGET_HTML).toContain("No history entries returned");
    expect(WIDGET_HTML).not.toContain("<span>Current job</span>");
    expect(WIDGET_HTML).not.toContain("${escapeHtml(data.current.state)}");
    expect(WIDGET_HTML).not.toContain("Advertised history has no accepted normalization.");
    expect(WIDGET_HTML).toContain("Queue");
    expect(WIDGET_HTML).toContain("Fans & Air");
    expect(WIDGET_HTML).toContain("Bed Mesh");
    expect(WIDGET_HTML).toContain("provenance");
  });

  test("uses header observation information and one footer with error status beside Refresh", () => {
    expect(WIDGET_HTML).toContain('class="instrument-footer u1-footer"');
    expect(WIDGET_HTML).toContain('class="instrument-info u1-meta"');
    expect(WIDGET_HTML).toContain('class="instrument-footer u1-footer"><div class="u1-primary-actions">${footerStatus()}<button class="refresh u1-action u1-action--round"');
    expect(WIDGET_HTML).toContain('const footerStatus = (message = "") => `<span class="refresh-error" role="status" aria-label="${escapeHtml(message)}">${message ? "Could not load" : ""}</span>`');
    expect(WIDGET_HTML).toContain('<footer class="instrument-footer u1-footer"><div class="u1-primary-actions">${footerStatus(message)}${action}</div></footer>');
    expect(WIDGET_HTML).toContain("Observed ${date.toLocaleTimeString");
    expect(WIDGET_HTML).toContain("Observation time unavailable");
    expect(WIDGET_HTML).toContain('stale: "Stale"');
    expect(WIDGET_HTML).toContain('offline: "Offline"');
    expect(WIDGET_HTML).toContain('--negative: var(--u1-negative);');
    expect(WIDGET_HTML).not.toContain('--negative: #ff8585;');
    expect(WIDGET_HTML).not.toContain("Read only");
    expect(WIDGET_HTML).not.toContain("Current reading");
    expect(WIDGET_HTML).not.toContain("Missing evidence stays Unknown");
    expect(WIDGET_HTML).not.toContain("value?.detail ?? \"Provenance unavailable\"");
    expect(WIDGET_HTML).not.toContain('<div class="provenance"><code>');
    expect(WIDGET_HTML).toContain("font-size: 12px; line-height: 1.5;");
  });

  test("keeps tool badges but renders bed and cavity as aligned text-only zones", () => {
    expect(WIDGET_HTML).toContain('const toolReading = reading.id.startsWith("tool-")');
    expect(WIDGET_HTML).toContain('toolReading ? `<span class="roundel">T');
    expect(WIDGET_HTML).toContain('toolReading ? "" : " zone-row"');
    expect(WIDGET_HTML).toContain(".strip.zone-row .identity { padding-left: 8px; }");
    expect(WIDGET_HTML).not.toContain('reading.id === "heater-bed" ? "BED" : "CAV"');
    expect(WIDGET_HTML).toContain('.active .reading strong { color: var(--ink); }');
    expect(WIDGET_HTML).not.toContain('.active .reading strong { color: #e8b600; }');
  });

  test("supports iPhone viewports, safe areas, and touch targets", () => {
    expect(WIDGET_HTML).toContain("viewport-fit=cover");
    const observationStyle = WIDGET_HTML.split("<style>")[1]!.split("</style>")[0]!;
    expect(observationStyle).not.toMatch(/body\s*\{[^}]*min-height:\s*100d?vh/s);
    expect(WIDGET_HTML).toContain("env(safe-area-inset-top, 0px)");
    expect(WIDGET_HTML).toContain('@media (max-width: 620px)');
    expect(WIDGET_HTML).toContain('@media (max-width: 480px)');
    expect(WIDGET_HTML).not.toContain('.strip .identity { grid-column: 1 / -1; }');
    expect(WIDGET_HTML).toContain("grid-template-columns: minmax(104px, 1.2fr) repeat(2, minmax(52px, 0.7fr))");
    expect(WIDGET_HTML).not.toContain('.strip .reading:nth-of-type(2) { display: none; }');
    expect(WIDGET_HTML).toContain("min-height: 44px");
    expect(WIDGET_HTML).toContain("touch-action: manipulation");
    expect(WIDGET_HTML).toContain("notifyIntrinsicHeight");
    expect(WIDGET_HTML).toContain("--ink: var(--u1-ink);");
    expect(WIDGET_HTML).toContain("--brand: var(--u1-accent);");
    const moduleScript = WIDGET_HTML.split('<script type="module">')[1]!.split("</script>")[0]!;
    expect(moduleScript).not.toContain("fetch(");
    expect(WIDGET_HTML).not.toContain("MOONRAKER_BASE_URL");
  });
});
