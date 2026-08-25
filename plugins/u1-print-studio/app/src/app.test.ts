import { afterEach, describe, expect, test } from "bun:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";

import {
  createAppServer,
  WIDGET_HTML,
  WIDGET_URI,
} from "./app.js";
import type { U1Status, U1WidgetMetadata } from "./u1-status.js";

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

const metadata: U1WidgetMetadata = {
  camera: {
    snapshotUrl: "http://printer.test/webcam/snapshot.jpg",
    streamUrl: "http://printer.test/webcam/webrtc",
  },
};

const closeCallbacks: Array<() => Promise<void>> = [];

afterEach(async () => {
  await Promise.all(closeCallbacks.splice(0).map((close) => close()));
});

async function connectClient() {
  const server = createAppServer({
    readStatus: async () => ({ status, metadata }),
    printerOrigin: () => "http://printer.test",
  });
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
  test("advertises the dashboard template on the render tool descriptor", async () => {
    const client = await connectClient();
    const listed = await client.listTools();
    const show = listed.tools.find((tool) => tool.name === "show_u1_status");
    const refresh = listed.tools.find((tool) => tool.name === "get_u1_status");

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
  });

  test("serves an MCP App resource with the printer origin allowlisted", async () => {
    const client = await connectClient();
    const result = await client.readResource({ uri: WIDGET_URI });
    const resource = result.contents[0];

    expect(resource?.uri).toBe(WIDGET_URI);
    expect(resource?.mimeType).toBe("text/html;profile=mcp-app");
    expect(resource?._meta?.ui).toMatchObject({
      prefersBorder: false,
      csp: {
        connectDomains: ["http://printer.test"],
        resourceDomains: ["http://printer.test"],
        frameDomains: ["http://printer.test"],
      },
    });
    expect("text" in resource ? resource.text : "").toBe(WIDGET_HTML);
  });

  test("returns model-readable status and camera URLs only in result metadata", async () => {
    const client = await connectClient();
    const result = await client.callTool({ name: "show_u1_status", arguments: {} });

    expect(result.structuredContent).toEqual(status);
    expect(result._meta).toEqual(metadata);
    expect(result._meta?.["openai/outputTemplate"]).toBeUndefined();
    expect(result.content).toEqual([
      { type: "text", text: "U1 is printing at 67.4%." },
    ]);
  });
});

describe("camera-first widget contract", () => {
  test("keeps snapshot, live, close, refresh, PiP, and fullscreen paths", () => {
    const cameraIndex = WIDGET_HTML.indexOf('class="camera"');
    const contentIndex = WIDGET_HTML.indexOf('class="content"');

    expect(cameraIndex).toBeGreaterThan(-1);
    expect(cameraIndex).toBeLessThan(contentIndex);
    expect(WIDGET_HTML).toContain('id="snapshot"');
    expect(WIDGET_HTML).toContain('id="live-stream"');
    expect(WIDGET_HTML).toContain('id="go-live"');
    expect(WIDGET_HTML).toContain('id="close-live"');
    expect(WIDGET_HTML).toContain('elements.liveStream.src = streamUrl');
    expect(WIDGET_HTML).toContain('elements.liveStream.src = "about:blank"');
    expect(WIDGET_HTML).toContain('name: "get_u1_status"');
    expect(WIDGET_HTML).toContain('requestDisplayMode("pip")');
    expect(WIDGET_HTML).toContain('requestDisplayMode("fullscreen")');
  });
});
