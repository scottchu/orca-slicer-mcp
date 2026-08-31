import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

const html = readFileSync(new URL("../public/camera-widget.html", import.meta.url), "utf8");
const script = html.split('<script type="module">')[1]!.split("</script>")[0]!;
const snapshotTime = "2026-08-31T10:00:00.000Z";
const nextSnapshotTime = "2026-08-31T10:00:10.000Z";
const frame = (observedAt: string | null = snapshotTime, data = "fixture") => ({
  structuredContent: { available: true, mediaType: "image/jpeg", observedAt },
  _meta: { cameraFrame: { dataUrl: `data:image/jpeg;base64,${data}` } },
});

function cameraHost(options: { openai?: Record<string, unknown>; frameCallbacks?: boolean } = {}) {
  let clock = Date.parse("2026-08-31T10:10:00.000Z");
  let timerId = 0;
  const timers = new Map<number, { callback: () => void; at: number; delay: number; repeat: boolean }>();
  const messages: any[] = [];
  const handlers = new Map<string, (event: any) => void>();
  const images: any[] = [];
  const callbacks = new Map<number, (time: number) => void>();
  let frameId = 0;
  const nodes: Record<string, any> = {};
  const node = (id: string) => nodes[id] ??= {
    dataset: {}, textContent: "", hidden: true, disabled: false, src: "", srcObject: null, paused: false,
    attributes: new Map<string, string>(), events: new Map<string, (event?: any) => void>(),
    classes: new Set<string>(),
    classList: {
      contains: (value: string) => node(id).classes.has(value),
      add: (value: string) => node(id).classes.add(value),
      remove: (value: string) => node(id).classes.delete(value),
    },
    setAttribute(name: string, value: string) { this.attributes.set(name, value); },
    getAttribute(name: string) { return this.attributes.get(name) ?? null; },
    addEventListener(name: string, callback: (event: any) => void) { this.events.set(name, callback); },
  };
  const live = node("#live-stream");
  if (options.frameCallbacks !== false) {
    live.requestVideoFrameCallback = (callback: (time: number) => void) => { callbacks.set(++frameId, callback); return frameId; };
    live.cancelVideoFrameCallback = (id: number) => callbacks.delete(id);
  }
  live.play = async () => {};
  const parent = { postMessage: (message: any) => messages.push(message) };
  const document: any = {
    body: { dataset: { displayMode: "inline" } },
    documentElement: { style: { setProperty() {} } },
    querySelector: node,
    addEventListener: (name: string, callback: (event: any) => void) => handlers.set(`document:${name}`, callback),
  };
  const window: any = { parent, openai: options.openai, addEventListener: (name: string, callback: (event: any) => void) => handlers.set(name, callback) };
  const sandbox: any = {
    window, document, Map, Set, URLSearchParams, location: { search: "" }, performance: { now: () => clock },
    Date: class extends Date { constructor(value?: string | number) { super(value ?? clock); } static now() { return clock; } },
    Image: class { onload?: () => void; onerror?: () => void; src = ""; constructor() { images.push(this); } },
    MediaStream: class {},
    setTimeout: (callback: () => void, delay: number) => { timers.set(++timerId, { callback, delay, at: clock + delay, repeat: false }); return timerId; },
    clearTimeout: (id: number) => timers.delete(id),
    setInterval: (callback: () => void, delay: number) => { timers.set(++timerId, { callback, delay, at: clock + delay, repeat: true }); return timerId; },
    clearInterval: (id: number) => timers.delete(id),
  };
  runInNewContext(`${script}\nglobalThis.api = {
    applyCameraFrame, setCameraMode, closeLive, applyHostContext, requestCameraDisplay, readSelectedIcePath,
    prepareLive: () => { livePreview = true; livePeerConnection = { close() {} }; observeRenderedFrames(); },
    fallback: activateSnapshotFallback,
    state: () => ({ snapshotObservedAt, liveObservedAt, relayRendering, selectedIcePath }),
  };`, sandbox);
  const flush = async () => { for (let count = 0; count < 8; count++) await Promise.resolve(); };
  const reply = async (request: any, result: any) => {
    handlers.get("message")!({ source: parent, data: { jsonrpc: "2.0", id: request.id, result } });
    await flush();
  };
  const advance = (milliseconds: number, runTimers = false) => {
    clock += milliseconds;
    if (runTimers) for (const [id, timer] of [...timers]) if (timer.at <= clock) {
      if (!timers.has(id)) continue;
      if (timer.repeat) timer.at = clock + timer.delay; else timers.delete(id);
      timer.callback();
    }
  };
  return {
    api: sandbox.api, node, document, window, images, messages, timers, callbacks, flush, reply, advance,
    renderFrame: () => { const [id, callback] = [...callbacks][0]!; callbacks.delete(id); callback(clock); },
    acceptSnapshot: (result = frame()) => { sandbox.api.applyCameraFrame(result); images.at(-1).onload(); },
  };
}

describe("camera widget presentation runtime", () => {
  test("separates top camera information from bottom display and live controls", () => {
    const body = html.split("<body")[1]!.split('<script type="module">')[0]!;
    const cluster = body.match(/<div class="camera-controls">([\s\S]*?)<\/div>/)![1]!;
    const ids = [...cluster.matchAll(/<button[^>]+id="([^"]+)"/g)].map(match => match[1]);
    expect(ids).toEqual(["picture-in-picture", "fullscreen", "go-live", "close-live"]);
    expect(body.indexOf('class="camera-controls"')).toBeGreaterThan(body.indexOf('class="camera-bottom"'));
    expect(body.indexOf('class="camera-controls"')).toBeGreaterThan(body.indexOf('id="camera-detail-label"'));
    const information = body.split('<div class="camera-info">')[1]!.split('<div class="camera-bottom">')[0]!;
    const actions = body.split('<div class="camera-bottom">')[1]!;
    for (const id of ["camera-empty-message", "camera-detail", "camera-detail-label", "display-feedback"]) {
      expect(information).toContain(`id="${id}"`);
      expect(actions).not.toContain(`id="${id}"`);
    }
    expect(information).not.toContain("<button");
    expect(body.match(/id="picture-in-picture"/g)).toHaveLength(1);
    expect(body.match(/id="fullscreen"/g)).toHaveLength(1);
    expect(html).not.toContain("camera-top");
    const controlsStyle = html.match(/\.camera-controls \{([^}]+)\}/)![1]!;
    expect(controlsStyle).toContain("flex: none;");
    expect(controlsStyle).toContain("gap: 8px;");
    expect(controlsStyle).toContain("margin-left: auto;");
    expect(html.match(/\.camera-actions \{([^}]+)\}/)![1]).toContain("flex-wrap: wrap;");
    const displayStyle = html.match(/\.display-button \{([^}]+)\}/)![1]!;
    expect(displayStyle).toContain("width: 44px;");
    expect(displayStyle).toContain("height: 44px;");
    expect(displayStyle).toContain("flex: none;");
    const informationStyle = html.match(/\.camera-info \{([^}]+)\}/)![1]!;
    expect(informationStyle).toContain("top: 12px;");
    expect(informationStyle).toContain("flex-direction: column;");
    expect(informationStyle).toContain("gap: 8px;");
    expect(html.match(/\.display-feedback \{([^}]+)\}/)![1]).not.toContain("position:");
    expect(html).toContain('.camera.has-snapshot .camera-info-message,');
    expect(html).toContain('.camera[data-camera-status="unavailable"] .camera-mode { display: none; }');
    expect(html).toContain('.display-button[hidden] { display: none; }');
    expect(html).toContain('.camera-button[hidden] { display: none; }');
  });

  test("uses image-only chrome and does not announce each changing clock", () => {
    expect(html).not.toContain("Read only");
    expect(html).not.toContain('class="camera-heading"');
    expect(html).not.toContain('id="camera-observed"');
    expect(html).not.toContain(" FPS`");
    expect(html).toContain('id="camera-detail" data-mode="loading">');
    expect(html).toContain('id="camera-status" role="status" aria-live="polite"');
  });

  test("commits time only after JPEG decode and retains it through mode changes", () => {
    const host = cameraHost();
    host.api.applyCameraFrame(frame());
    expect(host.api.state().snapshotObservedAt).toBeNull();
    host.images[0].onload();
    expect(host.api.state().snapshotObservedAt).toBe(snapshotTime);
    const label = host.node("#camera-detail-label").textContent;
    expect(label).toStartWith("Snapshot · ");
    host.node("#snapshot").events.get("load")?.();
    expect(host.node("#camera-detail-label").textContent).toBe(label);
    host.api.setCameraMode("fallback");
    expect(host.node("#camera-detail-label").textContent.replace("Fallback", "Snapshot")).toBe(label);
    host.api.closeLive();
    expect(host.node("#camera-detail-label").textContent).toBe(label);
  });

  test("failed and out-of-order JPEGs cannot retimestamp a retained image", () => {
    const host = cameraHost();
    host.acceptSnapshot();
    host.api.applyCameraFrame(frame(nextSnapshotTime, "bad"));
    host.images.at(-1).onerror();
    expect(host.node("#snapshot").src).toEndWith("fixture");
    expect(host.api.state().snapshotObservedAt).toBe(snapshotTime);
    host.api.applyCameraFrame({ structuredContent: { available: false, observedAt: nextSnapshotTime } });
    expect(host.api.state().snapshotObservedAt).toBe(snapshotTime);
    host.api.applyCameraFrame(frame(snapshotTime, "old"));
    const older = host.images.at(-1);
    host.acceptSnapshot(frame(nextSnapshotTime, "new"));
    older.onload();
    expect(host.node("#snapshot").src).toEndWith("new");
    expect(host.api.state().snapshotObservedAt).toBe(nextSnapshotTime);
  });

  test("missing snapshot time is unknown, never epoch or wall clock", () => {
    const host = cameraHost();
    host.acceptSnapshot(frame(null));
    expect(host.node("#camera-detail-label").textContent).toBe("Snapshot · Time unavailable");
  });

  test("late ICE diagnostics after close never relabel the retained snapshot Live", async () => {
    const host = cameraHost();
    host.acceptSnapshot();
    host.api.prepareLive();
    host.renderFrame();
    let resolveStats!: (value: Map<string, unknown>) => void;
    const pending = host.api.readSelectedIcePath({ getStats: () => new Promise((resolve) => { resolveStats = resolve; }) });
    host.api.closeLive();
    const label = host.node("#camera-detail-label").textContent;
    resolveStats(new Map([
      ["transport", { type: "transport", selectedCandidatePairId: "pair" }],
      ["pair", { localCandidateId: "local", remoteCandidateId: "remote" }],
      ["local", { candidateType: "prflx", protocol: "udp" }],
      ["remote", { candidateType: "host" }],
    ]));
    await pending;
    expect(host.api.state().selectedIcePath).toBe("prflx→host/udp");
    expect(host.node("#camera-detail-label").textContent).toBe(label);
    expect(host.api.state().relayRendering).toBe(false);
  });

  test("live clock needs rendered frames, freezes without them, and falls back to snapshot time", () => {
    const host = cameraHost();
    host.acceptSnapshot();
    host.api.prepareLive();
    host.advance(2000);
    expect(host.api.state().relayRendering).toBe(false);
    host.renderFrame();
    expect(host.api.state().relayRendering).toBe(true);
    const first = host.api.state().liveObservedAt;
    const label = host.node("#camera-detail-label").textContent;
    host.advance(1000);
    expect(host.node("#camera-detail-label").textContent).toBe(label);
    host.renderFrame();
    expect(host.api.state().liveObservedAt).not.toBe(first);
    expect(host.node("#camera-detail-label").textContent).not.toContain("FPS");
    host.advance(5001, true);
    expect(host.api.state().relayRendering).toBe(false);
    expect(host.node("#camera-detail-label").textContent).toStartWith("Fallback · ");
    expect(host.api.state().snapshotObservedAt).toBe(snapshotTime);
  });

  test("playing alone is not frame evidence; advancing decoded counts support older hosts", () => {
    const host = cameraHost({ frameCallbacks: false });
    let count = 0;
    host.node("#live-stream").getVideoPlaybackQuality = () => ({ totalVideoFrames: count });
    host.acceptSnapshot();
    host.api.prepareLive();
    host.node("#live-stream").events.get("playing")?.();
    host.advance(250, true);
    expect(host.api.state().relayRendering).toBe(false);
    count = 2;
    host.advance(250, true);
    expect(host.api.state().relayRendering).toBe(true);
    const time = host.api.state().liveObservedAt;
    host.advance(250, true);
    expect(host.api.state().liveObservedAt).toBe(time);
    host.api.closeLive();
    expect(host.callbacks.size).toBe(0);
  });

  test("unsupported display controls are absent; rejected requests preserve camera", async () => {
    const host = cameraHost();
    host.acceptSnapshot();
    expect(host.node("#fullscreen").hidden).toBe(true);
    expect(host.node("#picture-in-picture").hidden).toBe(true);
    await host.api.requestCameraDisplay("pip");
    expect(host.document.body.dataset.displayMode).toBe("inline");
    expect(host.node("#display-feedback").textContent).toContain("unavailable");
    expect(host.node("#camera").classList.contains("has-snapshot")).toBe(true);
  });

  test("host-granted mode wins, including mobile PiP coercion and fullscreen exit", async () => {
    const modes: string[] = [];
    const host = cameraHost({ openai: { requestDisplayMode: async ({ mode }: { mode: string }) => { modes.push(mode); return { mode: mode === "pip" ? "fullscreen" : mode }; } } });
    host.acceptSnapshot();
    await host.api.requestCameraDisplay("pip");
    expect(host.document.body.dataset.displayMode).toBe("fullscreen");
    expect(host.node("#picture-in-picture").getAttribute("aria-pressed")).toBe("false");
    expect(host.node("#fullscreen").getAttribute("aria-pressed")).toBe("true");
    expect(host.node("#display-feedback").textContent).toContain("instead of picture in picture");
    await host.api.requestCameraDisplay("fullscreen");
    expect(modes).toEqual(["pip", "inline"]);
    expect(host.document.body.dataset.displayMode).toBe("inline");
  });

  test("MCP host display requests wait for an actual granted mode", async () => {
    const host = cameraHost();
    await host.reply(host.messages[0], { hostContext: { displayMode: "inline", availableDisplayModes: ["inline", "fullscreen", "pip"] } });
    host.acceptSnapshot();
    const pending = host.api.requestCameraDisplay("fullscreen");
    const request = host.messages.at(-1);
    expect(request.method).toBe("ui/request-display-mode");
    expect(host.document.body.dataset.displayMode).toBe("inline");
    await host.reply(request, { mode: "fullscreen" });
    await pending;
    expect(host.document.body.dataset.displayMode).toBe("fullscreen");
  });

  test("native fullscreen and live-only PiP are feature-detected and not synthetic host modes", async () => {
    const host = cameraHost();
    host.acceptSnapshot();
    host.document.fullscreenEnabled = true;
    host.node("#camera").requestFullscreen = async () => { host.document.fullscreenElement = host.node("#camera"); };
    host.document.exitFullscreen = async () => { host.document.fullscreenElement = null; };
    host.document.pictureInPictureEnabled = true;
    host.node("#live-stream").requestPictureInPicture = async () => { host.document.pictureInPictureElement = host.node("#live-stream"); };
    host.api.applyHostContext();
    expect(host.node("#fullscreen").hidden).toBe(false);
    expect(host.node("#picture-in-picture").hidden).toBe(true);
    await host.api.requestCameraDisplay("fullscreen");
    expect(host.node("#fullscreen").getAttribute("aria-pressed")).toBe("true");
    await host.api.requestCameraDisplay("fullscreen");
    expect(host.document.fullscreenElement).toBeNull();
    host.api.prepareLive();
    host.renderFrame();
    expect(host.node("#picture-in-picture").hidden).toBe(false);
    await host.api.requestCameraDisplay("pip");
    expect(host.node("#picture-in-picture").getAttribute("aria-pressed")).toBe("true");
  });
});
