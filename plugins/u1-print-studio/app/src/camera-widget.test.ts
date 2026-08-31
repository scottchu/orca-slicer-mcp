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
  const callbacks = new Map<number, (time: number, metadata?: { presentedFrames: number }) => void>();
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
    live.requestVideoFrameCallback = (callback: (time: number, metadata?: { presentedFrames: number }) => void) => { callbacks.set(++frameId, callback); return frameId; };
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
    restartFrameObserver: observeRenderedFrames,
    prepareLive: () => { livePreview = true; livePeerConnection = { close() {} }; observeRenderedFrames(); },
    fallback: activateSnapshotFallback,
    state: () => ({ snapshotObservedAt, liveObservedAt, relayRendering, selectedIcePath, measuredLiveFps }),
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
    renderFrame: (presentedFrames?: number) => { const [id, callback] = [...callbacks][0]!; callbacks.delete(id); callback(clock, presentedFrames === undefined ? undefined : { presentedFrames }); },
    renderFrameBatch: (presentedFrames: number) => { const batch = [...callbacks.values()]; callbacks.clear(); for (const callback of batch) callback(clock, { presentedFrames }); },
    acceptSnapshot: (result = frame()) => { sandbox.api.applyCameraFrame(result); images.at(-1).onload(); },
  };
}

describe("camera widget presentation runtime", () => {
  test("keeps title, state and feedback in the white header outside genuine media", () => {
    const body = html.split("<body")[1]!.split('<script type="module">')[0]!;
    const mediaStart = body.indexOf('<section class="camera"');
    const beforeMedia = body.slice(0, mediaStart); const media = body.slice(mediaStart);
    expect(beforeMedia).toContain("<h1>U1 Camera</h1>");
    for (const id of ["camera-detail", "camera-detail-label", "camera-empty-message", "display-feedback"]) {
      expect(beforeMedia).toContain(`id="${id}"`); expect(media).not.toContain(`id="${id}"`);
    }
    expect(beforeMedia).not.toContain("<button");
    const cluster = body.match(/<div class="camera-controls">([\s\S]*?)<\/div>/)![1]!;
    expect([...cluster.matchAll(/<button[^>]+id="([^"]+)"/g)].map(match => match[1]))
      .toEqual(["picture-in-picture", "fullscreen", "refresh-snapshot", "go-live", "close-live"]);
    expect(media).toContain('id="snapshot"'); expect(media).toContain('id="live-stream"');
    expect(html).not.toMatch(/camera::before|camera::after|linear-gradient|prefers-color-scheme: dark/);
    expect(html).toContain("color-scheme: light;"); expect(html).toContain("--surface: #fff;");
    expect(html).toContain("min-width: 44px; min-height: 44px;");
    expect(html).toContain(".camera-mode { flex-basis: 100%;");
    expect(html).toContain('data-icon="feather-camera"'); expect(html).toContain("Copyright (c) 2013-2023 Cole Bemis");
    expect(html).toContain(".dashboard:fullscreen .camera");
  });

  test("does not announce every changing clock or expose ICE details", () => {
    expect(html).not.toContain("Read only");
    expect(html).not.toContain('id="camera-observed"');
    expect(html).not.toContain("Live · ${selectedIcePath}");
    expect(html).toContain('id="camera-detail" data-mode="loading">');
    expect(html).toContain('id="camera-status" role="status" aria-live="polite"');
    expect(html).not.toContain('id="camera-detail-label" aria-live');
  });

  test("snapshot refresh is a working bounded host request and announces decoded success while retaining live", async () => {
    const host = cameraHost();
    expect(host.node("#refresh-snapshot").disabled).toBe(true);
    await host.reply(host.messages[0], { hostContext: {} });
    // Initial automatic snapshot acquisition is separate from explicit refresh.
    let request = host.messages.find((m: any) => m.params?.name === "get_u1_camera_frame");
    await host.reply(request, frame()); host.images.at(-1).onload(); await host.flush();
    host.api.prepareLive(); host.renderFrame(1);
    host.node("#refresh-snapshot").events.get("click")(); await host.flush();
    expect(host.node("#refresh-snapshot").disabled).toBe(true);
    expect(host.node("#display-feedback").textContent).toBe("Refreshing snapshot…");
    request = host.messages.filter((m: any) => m.params?.name === "get_u1_camera_frame").at(-1);
    await host.reply(request, frame(nextSnapshotTime, "fresh"));
    expect(host.node("#display-feedback").textContent).not.toContain("Snapshot refreshed");
    host.images.at(-1).onload();
    expect(host.node("#display-feedback").textContent).toContain("Snapshot refreshed. Live view continues");
    expect(host.api.state().relayRendering).toBe(true);
    expect(host.api.state().snapshotObservedAt).toBe(nextSnapshotTime);
    expect(host.messages.filter((m: any) => m.params?.name === "close_u1_camera_stream")).toHaveLength(0);
  });

  test("failed user snapshot decode keeps the prior frame and reports failure", () => {
    const host = cameraHost(); host.acceptSnapshot();
    host.api.applyCameraFrame(frame(nextSnapshotTime, "bad"), true);
    host.images.at(-1).onerror();
    expect(host.api.state().snapshotObservedAt).toBe(snapshotTime);
    expect(host.node("#display-feedback").textContent).toContain("Snapshot refresh failed");
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

  test("Live FPS uses presented-frame deltas after one second and expires before the stall fallback", () => {
    const host = cameraHost(); host.acceptSnapshot(); host.api.prepareLive();
    host.renderFrame(10);
    expect(host.node("#camera-detail-label").textContent).not.toContain("FPS");
    host.advance(500); host.renderFrame(25);
    expect(host.node("#camera-detail-label").textContent).not.toContain("FPS");
    host.advance(500); host.renderFrame(40);
    expect(host.node("#camera-detail-label").textContent).toStartWith("Live · 30 FPS · ");
    const observedAt = host.api.state().liveObservedAt;
    host.advance(1501, true);
    expect(host.api.state().relayRendering).toBe(true);
    expect(host.api.state().liveObservedAt).toBe(observedAt);
    expect(host.node("#camera-detail-label").textContent).not.toContain("FPS");
    host.advance(3500, true);
    expect(host.node("#camera-detail-label").textContent).toStartWith("Fallback · ");
    expect(host.node("#camera-detail-label").textContent).not.toContain("FPS");
  });

  test("repeated track setup keeps one observer and obsolete same-peer callbacks cannot reset FPS", () => {
    const host = cameraHost(); host.acceptSnapshot(); host.api.prepareLive();
    const obsoleteCallback = [...host.callbacks.values()][0]!;
    host.api.restartFrameObserver();
    host.renderFrameBatch(1);
    for (let index = 1; index <= 30; index++) { host.advance(40); host.renderFrameBatch(index + 1); }
    expect(host.node("#camera-detail-label").textContent).toContain("25 FPS");
    expect(host.callbacks.size).toBe(1);
    const before = host.api.state();
    obsoleteCallback(999999, { presentedFrames: 999999 });
    expect(host.api.state()).toEqual(before);
    expect(host.callbacks.size).toBe(1);
  });

  test("repeated legacy track setup keeps one decoded-counter interval", () => {
    const host = cameraHost({ frameCallbacks: false }); let count = 0;
    host.node("#live-stream").getVideoPlaybackQuality = () => ({ totalVideoFrames: count });
    host.acceptSnapshot(); host.api.prepareLive(); host.api.restartFrameObserver();
    expect([...host.timers.values()].filter(timer => timer.repeat)).toHaveLength(1);
    count = 1; host.advance(250, true); count = 30; host.advance(1000, true);
    expect(host.node("#camera-detail-label").textContent).toContain("29 FPS");
  });

  test("decoded fallback measures frame count deltas, never its four polling ticks per second", () => {
    for (const quality of [true, false]) {
      const host = cameraHost({ frameCallbacks: false }); let count = 0;
      if (quality) host.node("#live-stream").getVideoPlaybackQuality = () => ({ totalVideoFrames: count });
      else Object.defineProperty(host.node("#live-stream"), "webkitDecodedFrameCount", { get: () => count });
      host.acceptSnapshot(); host.api.prepareLive(); count = 1; host.advance(250, true);
      expect(host.node("#camera-detail-label").textContent).not.toContain("FPS");
      for (let tick = 0; tick < 4; tick++) { count += 7; host.advance(250, true); }
      expect(host.node("#camera-detail-label").textContent).toStartWith("Live · 28 FPS · ");
      count = NaN; host.advance(250, true);
      expect(host.node("#camera-detail-label").textContent).not.toMatch(/FPS|NaN|Infinity/);
      count = 0; host.advance(250, true); count = 1; host.advance(250, true);
      expect(host.node("#camera-detail-label").textContent).not.toContain("FPS");
      count = 30; host.advance(1000, true);
      expect(host.node("#camera-detail-label").textContent).toStartWith("Live · 29 FPS · ");
      host.api.closeLive();
      expect(host.node("#camera-detail-label").textContent).toStartWith("Snapshot · ");
      expect(host.api.state().measuredLiveFps).toBeNull();
    }
  });

  test("missing/reset/invalid counters cannot invent FPS or mix presented and decoded counters", () => {
    for (const reset of [undefined, NaN, Infinity, -1, 3]) {
      const host = cameraHost(); host.acceptSnapshot(); host.api.prepareLive();
      host.node("#live-stream").getVideoPlaybackQuality = () => ({ totalVideoFrames: 10000 });
      host.renderFrame(100); host.advance(1000); host.renderFrame(129);
      expect(host.node("#camera-detail-label").textContent).toContain("29 FPS");
      host.advance(1000); host.renderFrame(reset);
      expect(host.node("#camera-detail-label").textContent).not.toMatch(/FPS|NaN|Infinity/);
      host.advance(100); host.renderFrame(10);
      expect(host.node("#camera-detail-label").textContent).not.toContain("FPS");
    }
    const missing = cameraHost(); missing.acceptSnapshot(); missing.api.prepareLive();
    missing.renderFrame(); missing.advance(1000); missing.renderFrame();
    expect(missing.api.state().relayRendering).toBe(true);
    expect(missing.node("#camera-detail-label").textContent).not.toContain("FPS");
  });

  test("decoded counter families never switch during a peer session", () => {
    const host = cameraHost({ frameCallbacks: false }); let count: number | undefined = 0;
    host.node("#live-stream").getVideoPlaybackQuality = () => ({ totalVideoFrames: count });
    host.node("#live-stream").webkitDecodedFrameCount = 10000;
    host.acceptSnapshot(); host.api.prepareLive(); count = 1; host.advance(250, true);
    count = 30; host.advance(1000, true);
    expect(host.node("#camera-detail-label").textContent).toContain("29 FPS");
    count = undefined; host.advance(250, true);
    expect(host.node("#camera-detail-label").textContent).not.toContain("FPS");
    host.node("#live-stream").webkitDecodedFrameCount = 20000;
    host.advance(1000, true);
    expect(host.node("#camera-detail-label").textContent).not.toContain("FPS");
  });

  test("pause, close and reopening reset FPS, and an old peer callback cannot restore it", () => {
    const host = cameraHost(); host.acceptSnapshot(); host.api.prepareLive();
    host.renderFrame(1); host.advance(1000); host.renderFrame(30);
    expect(host.node("#camera-detail-label").textContent).toContain("29 FPS");
    host.node("#live-stream").paused = true;
    host.node("#live-stream").events.get("pause")();
    expect(host.node("#camera-detail-label").textContent).not.toContain("FPS");
    host.node("#live-stream").paused = false;
    host.renderFrame(31); host.advance(1000); host.renderFrame(60);
    const oldCallback = [...host.callbacks.values()][0]!;
    host.api.closeLive(); host.api.prepareLive();
    oldCallback(999999, { presentedFrames: 999999 });
    expect(host.api.state().relayRendering).toBe(false);
    expect(host.api.state().measuredLiveFps).toBeNull();
    host.renderFrame(100);
    expect(host.node("#camera-detail-label").textContent).not.toContain("FPS");
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
    host.node("#dashboard").requestFullscreen = async () => { host.document.fullscreenElement = host.node("#dashboard"); };
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
