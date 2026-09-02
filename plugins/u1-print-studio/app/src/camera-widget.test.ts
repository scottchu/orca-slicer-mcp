import { describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runInNewContext } from "node:vm";

const html = readFileSync(new URL("../public/camera-widget.html", import.meta.url), "utf8");
const script = html.split('<script type="module">')[1]!.split("</script>")[0]!;
const snapshotTime = "2026-08-31T10:00:00.000Z";
const nextSnapshotTime = "2026-08-31T10:00:10.000Z";
const frame = (observedAt: string | null = snapshotTime, data = "fixture") => ({
  structuredContent: { available: true, mediaType: "image/jpeg", observedAt },
  _meta: { cameraFrame: { dataUrl: `data:image/jpeg;base64,${data}` } },
});

const chromePath = [
  process.env.CHROME_BIN,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
].find((candidate): candidate is string => typeof candidate === "string" && existsSync(candidate));

function measureFullscreenLayout(mode: "local" | "native") {
  if (!chromePath) throw new Error("A Chromium browser is required for the camera fullscreen layout regression");
  const directory = mkdtempSync(join(tmpdir(), "u1-camera-layout-"));
  const fixturePath = join(directory, `${mode}.html`);
  const innerHtml = html.replace(/<script type="module">[\s\S]*?<\/script>/, "");
  writeFileSync(fixturePath, `<!doctype html><html><body><script>
    function measure(frame) {
      const view = frame.contentWindow;
      const document = frame.contentDocument;
      document.body.dataset.displayMode = "fullscreen";
      document.body.dataset.localFullscreen = String(${JSON.stringify(mode)} === "local");
      const dashboard = document.querySelector("#dashboard");
      dashboard.dataset.fullscreenLayout = ${JSON.stringify(mode)};
      const camera = document.querySelector("#camera");
      const video = document.querySelector("#live-stream");
      const result = document.createElement("pre");
      result.id = "layout-result";
      result.textContent = JSON.stringify({
        viewport: [view.innerWidth, view.innerHeight],
        dashboard: dashboard.getBoundingClientRect().height,
        body: document.querySelector(".camera-body").getBoundingClientRect().height,
        camera: camera.getBoundingClientRect().height,
        video: video.getBoundingClientRect().height,
      });
      window.document.body.append(result);
    }
    const frame = document.createElement("iframe");
    frame.width = "390"; frame.height = "844"; frame.style = "display:block;border:0";
    frame.onload = () => measure(frame);
    frame.srcdoc = atob("${Buffer.from(innerHtml).toString("base64")}");
    document.body.append(frame);
  </script></body></html>`);
  try {
    const result = spawnSync(chromePath, [
      "--headless=new", "--disable-gpu", "--no-sandbox", "--hide-scrollbars",
      "--force-device-scale-factor=1", "--window-size=800,1000", "--virtual-time-budget=1000",
      "--dump-dom", `file://${fixturePath}`,
    ], { encoding: "utf8", timeout: 15_000 });
    expect(result.status).toBe(0);
    const serialized = result.stdout.match(/<pre id="layout-result">([^<]+)<\/pre>/)?.[1];
    if (!serialized) throw new Error(`Camera layout result missing: ${result.stdout.slice(-1000)} ${result.stderr.slice(0, 500)}`);
    return JSON.parse(serialized.replaceAll("&quot;", '"')) as {
      viewport: [number, number]; dashboard: number; body: number; camera: number; video: number;
    };
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

function cameraHost(options: { openai?: Record<string, unknown>; frameCallbacks?: boolean; rtcPeer?: new (...args: any[]) => any; standalone?: boolean } = {}) {
  let clock = Date.parse("2026-08-31T10:10:00.000Z");
  let timerId = 0;
  const timers = new Map<number, { callback: () => void; at: number; delay: number; repeat: boolean }>();
  const messages: any[] = [];
  const handlers = new Map<string, Array<(event: any) => void>>();
  const addListener = (listeners: Map<string, Array<(event: any) => void>>, name: string, callback: (event: any) => void) => {
    const callbacks = listeners.get(name) ?? [];
    callbacks.push(callback);
    listeners.set(name, callbacks);
  };
  const emit = (listeners: Map<string, Array<(event: any) => void>>, name: string, event: any = {}) => {
    for (const callback of listeners.get(name) ?? []) callback(event);
  };
  const images: any[] = [];
  const callbacks = new Map<number, (time: number, metadata?: { presentedFrames: number }) => void>();
  let frameId = 0;
  const nodes: Record<string, any> = {};
  const node = (id: string) => nodes[id] ??= {
    dataset: {}, textContent: "", hidden: true, disabled: false, src: "", srcObject: null, paused: false,
    attributes: new Map<string, string>(), events: new Map<string, Array<(event?: any) => void>>(),
    classes: new Set<string>(),
    classList: {
      contains: (value: string) => node(id).classes.has(value),
      add: (value: string) => node(id).classes.add(value),
      remove: (value: string) => node(id).classes.delete(value),
    },
    setAttribute(name: string, value: string) { this.attributes.set(name, value); },
    getAttribute(name: string) { return this.attributes.get(name) ?? null; },
    removeAttribute(name: string) { this.attributes.delete(name); },
    append(child: any) { child.parentNode = this; },
    querySelector: (selector: string) => node(selector),
    addEventListener(name: string, callback: (event: any) => void) { addListener(this.events, name, callback); },
    emit(name: string, event: any = {}) { emit(this.events, name, event); },
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
    addEventListener: (name: string, callback: (event: any) => void) => addListener(handlers, `document:${name}`, callback),
  };
  const window: any = { openai: options.openai, addEventListener: (name: string, callback: (event: any) => void) => addListener(handlers, name, callback) };
  window.parent = options.standalone ? window : parent;
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
  if (options.rtcPeer) sandbox.RTCPeerConnection = options.rtcPeer;
  runInNewContext(`${script}\nglobalThis.api = {
    applyCameraFrame, refreshCameraFrame, setCameraMode, closeLive, applyHostContext, requestCameraDisplay, readSelectedIcePath,
    restartFrameObserver: observeRenderedFrames,
    prepareLive: () => { livePreview = true; livePeerConnection = { close() {} }; observeRenderedFrames(); },
    fallback: activateSnapshotFallback,
    state: () => ({ snapshotObservedAt, liveObservedAt, relayRendering, selectedIcePath, measuredLiveFps, cameraRefreshing, snapshotGeneration,
      livePeerConnection, liveFrameObserverGeneration, liveFrameCallback }),
  };`, sandbox);
  const flush = async () => { for (let count = 0; count < 8; count++) await Promise.resolve(); };
  const reply = async (request: any, result: any) => {
    emit(handlers, "message", { source: parent, data: { jsonrpc: "2.0", id: request.id, result } });
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
    api: sandbox.api, node, document, window, images, messages, timers, callbacks, handlers, flush, reply, advance,
    emitWindow: (name: string, event: any = {}) => emit(handlers, name, event),
    renderFrame: (presentedFrames?: number) => { const [id, callback] = [...callbacks][0]!; callbacks.delete(id); callback(clock, presentedFrames === undefined ? undefined : { presentedFrames }); },
    renderFrameBatch: (presentedFrames: number) => { const batch = [...callbacks.values()]; callbacks.clear(); for (const callback of batch) callback(clock, { presentedFrames }); },
    acceptSnapshot: (result = frame()) => { sandbox.api.applyCameraFrame(result); images.at(-1).onload(); },
  };
}

describe("camera widget presentation runtime", () => {
  test("keeps title, state and feedback in the white header outside genuine media", () => {
    expect(html).toContain("<title>U1 Camera</title>");
    expect(html).not.toContain("U1 Printer Camera");
    const body = html.split("<body")[1]!.split('<script type="module">')[0]!;
    const mediaStart = body.indexOf('id="camera"');
    expect(mediaStart).toBeGreaterThan(-1);
    const beforeMedia = body.slice(0, mediaStart); const media = body.slice(mediaStart);
    expect(beforeMedia).toContain('<h1 class="u1-title">U1 Camera</h1>');
    for (const id of ["camera-detail", "camera-detail-label", "camera-empty-message"]) {
      expect(beforeMedia).toContain(`id="${id}"`); expect(media).not.toContain(`id="${id}"`);
    }
    expect(beforeMedia).not.toContain('id="display-feedback"');
    expect(media).toContain('id="display-feedback"');
    expect(html).toContain("position: absolute; top: 12px; left: 12px;");
    expect(html).toContain("z-index: 3; max-width: calc(100% - 24px)");
    expect(html).toContain(".camera-bottom { position: absolute; right: 16px; bottom: 16px; left: 16px; z-index: 4;");
    expect(html).toContain('aria-live="polite" aria-atomic="true"');
    expect(beforeMedia).not.toContain("<button");
    const cluster = body.match(/<div class="camera-controls">([\s\S]*?)<\/div>/)![1]!;
    expect([...cluster.matchAll(/<button[^>]+id="([^"]+)"/g)].map(match => match[1]))
      .toEqual(["picture-in-picture", "fullscreen", "refresh-snapshot", "go-live", "close-live"]);
    expect(media).toContain('id="snapshot"'); expect(media).toContain('id="live-stream"');
    expect(html).not.toMatch(/camera::before|camera::after|prefers-color-scheme: dark/);
    expect(html).toContain("color-scheme: light;"); expect(html).toContain("--surface: var(--u1-surface);");
    expect(html).toContain("min-width: 44px; min-height: 44px;");
    expect(html).toContain("grid-template-columns: var(--u1-icon-tile-size) minmax(0, 1fr) auto");
    expect(html).toContain('class="camera-mode u1-meta u1-header-result"');
    expect(html).not.toContain(".camera-mode { flex-basis: 100%;");
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
    host.node("#refresh-snapshot").emit("click"); await host.flush();
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

  test("initial acquisition is single-flight and becomes a repeatable retry within the total deadline", async () => {
    const host = cameraHost();
    await host.reply(host.messages[0], { hostContext: {} });
    await host.api.refreshCameraFrame();
    expect(host.messages.filter((message: any) => message.params?.name === "get_u1_camera_frame")).toHaveLength(1);
    host.advance(10001, true); await host.flush();
    expect(host.node("#camera-status").textContent).toBe("Camera unavailable");
    expect(host.node("#refresh-snapshot").disabled).toBe(false);
    expect(host.node("#refresh-snapshot").getAttribute("aria-label")).toBe("Retry camera snapshot");
    host.node("#refresh-snapshot").emit("click"); await host.flush();
    const requests = host.messages.filter((message: any) => message.params?.name === "get_u1_camera_frame");
    expect(requests).toHaveLength(2);
    await host.reply(requests[1], frame(nextSnapshotTime, "retry")); host.images.at(-1).onload(); await host.flush();
    expect(host.node("#camera-status").textContent).toBe("Camera snapshot ready");
    expect(host.api.state().snapshotObservedAt).toBe(nextSnapshotTime);
  });

  test("a remounted live intent accepts a snapshot before one bounded restore and keeps failure truthful", async () => {
    const initial = frame();
    const host = cameraHost({ openai: {
      widgetState: { u1Camera: { liveRequested: true } },
      toolOutput: initial.structuredContent,
      toolResponseMetadata: initial._meta,
      setWidgetState() {},
    } });
    await host.reply(host.messages[0], { hostContext: { displayMode: "inline" } });
    expect(host.images).toHaveLength(1);
    host.images[0].onload(); await host.flush();
    expect(host.node("#snapshot").src).toEndWith("fixture");
    const restore = host.messages.find((message: any) => message.params?.name === "get_u1_camera_frame");
    expect(restore.params.arguments).toEqual({ authorizeLive: true });
    await host.reply(restore, { structuredContent: { available: false, reason: "activation unavailable" } });
    expect(host.node("#display-feedback").textContent).toContain("could not be restored");
    expect(host.node("#display-feedback").dataset.kind).toBe("error");
    expect(host.node("#snapshot").src).toEndWith("fixture");
    expect(host.api.state().measuredLiveFps).toBeNull();
    expect(host.messages.filter((message: any) => message.params?.name === "get_u1_camera_frame")).toHaveLength(1);
  });

  test("a remounted live intent restores once without claiming FPS before a rendered frame", async () => {
    class Peer {
      connectionState = "connected"; localDescription: any = null;
      addTransceiver() {} close() {} async setRemoteDescription() {}
      async createAnswer() { return { type: "answer", sdp: "answer" }; }
      async setLocalDescription(answer: any) { this.localDescription = answer; }
      async getStats() { return new Map(); }
    }
    const initial = frame();
    const host = cameraHost({ rtcPeer: Peer, openai: {
      widgetState: { u1Camera: { liveRequested: true } },
      toolOutput: initial.structuredContent,
      toolResponseMetadata: initial._meta,
      setWidgetState() {},
    } });
    await host.reply(host.messages[0], { hostContext: { displayMode: "inline" } });
    host.images[0].onload(); await host.flush();
    const restore = host.messages.find((message: any) => message.params?.name === "get_u1_camera_frame");
    await host.reply(restore, { ...frame(nextSnapshotTime, "restore"), _meta: {
      ...frame(nextSnapshotTime, "restore")._meta,
      cameraActivation: { token: "token" },
    } });
    host.images.at(-1).onload(); await host.flush();
    const open = host.messages.find((message: any) => message.params?.name === "open_u1_camera_stream");
    expect(open.params.arguments).toEqual({ activationToken: "token" });
    await host.reply(open, { structuredContent: { available: true }, _meta: { cameraStream: {
      sessionId: "session", transport: "mcp-apps-tools", offer: { type: "offer", sdp: "offer" }, iceServers: [],
    } } });
    const answer = host.messages.find((message: any) => message.params?.name === "answer_u1_camera_stream");
    expect(answer).toBeDefined();
    await host.reply(answer, { structuredContent: { accepted: true } });
    expect(host.api.state().livePeerConnection).toBeInstanceOf(Peer);
    expect(host.api.state().relayRendering).toBe(false);
    expect(host.api.state().measuredLiveFps).toBeNull();
    expect(host.node("#camera-detail-label").textContent).not.toContain("FPS");
    expect(host.messages.filter((message: any) => message.params?.name === "get_u1_camera_frame")).toHaveLength(1);
    expect(host.messages.filter((message: any) => message.params?.name === "open_u1_camera_stream")).toHaveLength(1);
  });

  test("decode timeout finishes inside twelve seconds and late decode cannot resurrect or restamp", async () => {
    const host = cameraHost(); host.acceptSnapshot();
    host.api.applyCameraFrame(frame(nextSnapshotTime, "hanging")); const late = host.images.at(-1);
    host.advance(1501, true); await host.flush();
    expect(host.api.state().snapshotObservedAt).toBe(snapshotTime);
    expect(host.node("#snapshot").src).toEndWith("fixture");
    late.onload();
    expect(host.api.state().snapshotObservedAt).toBe(snapshotTime);
    expect(host.node("#snapshot").src).toEndWith("fixture");
  });

  test("an older acquisition response cannot overwrite a newer host-delivered frame", async () => {
    const host = cameraHost(); await host.reply(host.messages[0], { hostContext: {} });
    const olderRequest = host.messages.find((message: any) => message.params?.name === "get_u1_camera_frame");
    host.acceptSnapshot(frame(nextSnapshotTime, "newer"));
    await host.reply(olderRequest, frame(snapshotTime, "older"));
    expect(host.images.at(-1).src).toContain("newer");
    expect(host.api.state().snapshotObservedAt).toBe(nextSnapshotTime);
    expect(host.node("#snapshot").src).toEndWith("newer");
  });

  test("feedback is an in-media timed toast while failures remain persistent", () => {
    const host = cameraHost(); host.acceptSnapshot();
    host.api.applyCameraFrame(frame(nextSnapshotTime, "fresh"), true); host.images.at(-1).onload();
    expect(host.node("#display-feedback").dataset.kind).toBe("success");
    host.advance(1801, true); expect(host.node("#display-feedback").textContent).toBe("");
    host.api.applyCameraFrame(frame(nextSnapshotTime, "bad"), true); host.images.at(-1).onerror();
    expect(host.node("#display-feedback").hidden).toBe(true);
    expect(host.node("#camera-footer-status").textContent).toBe("Could not load");
    host.advance(10000, true);
    expect(host.node("#camera-footer-status").textContent).toBe("Could not load");
  });

  test("progress feedback remains until the bounded request resolves", async () => {
    const host = cameraHost(); await host.reply(host.messages[0], { hostContext: {} });
    const initial = host.messages.find((message: any) => message.params?.name === "get_u1_camera_frame");
    await host.reply(initial, frame()); host.images.at(-1).onload(); await host.flush();
    host.node("#refresh-snapshot").emit("click"); await host.flush();
    expect(host.node("#display-feedback").dataset.kind).toBe("progress");
    host.advance(4001, true);
    expect(host.node("#display-feedback").textContent).toBe("Refreshing snapshot…");
  });

  test("failed user snapshot decode keeps the prior frame and reports failure", () => {
    const host = cameraHost(); host.acceptSnapshot();
    host.api.applyCameraFrame(frame(nextSnapshotTime, "bad"), true);
    host.images.at(-1).onerror();
    expect(host.api.state().snapshotObservedAt).toBe(snapshotTime);
    expect(host.node("#camera-footer-status").textContent).toBe("Could not load");
    expect(host.node("#camera").dataset.acquisitionFailed).toBe("true");
    expect(host.node("#snapshot").getAttribute("aria-hidden")).toBe("true");
    expect(host.node(".camera-controls").inert).toBe(true);
    expect(host.node("#refresh-snapshot").parentNode).toBe(host.node(".camera-footer"));
    expect(host.node("#camera-detail").title ?? "").toBe("");
  });

  test("commits time only after JPEG decode and retains it through mode changes", () => {
    const host = cameraHost();
    host.api.applyCameraFrame(frame());
    expect(host.api.state().snapshotObservedAt).toBeNull();
    host.images[0].onload();
    expect(host.api.state().snapshotObservedAt).toBe(snapshotTime);
    const label = host.node("#camera-detail-label").textContent;
    expect(label).toStartWith("Snapshot · ");
    host.node("#snapshot").emit("load");
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
    host.node("#live-stream").emit("playing");
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
    host.node("#live-stream").emit("pause");
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

  test("unsupported PiP is absent even when the host advertises PiP and preserves camera state", async () => {
    const hostCalls: string[] = [];
    const host = cameraHost({ openai: { requestDisplayMode: async ({ mode }: { mode: string }) => {
      hostCalls.push(mode);
      return { mode };
    } } });
    host.acceptSnapshot();
    const before = host.api.state();
    host.api.applyHostContext({ displayMode: "inline", availableDisplayModes: ["inline", "fullscreen", "pip"] });
    expect(host.node("#fullscreen").hidden).toBe(false);
    expect(host.node("#picture-in-picture").hidden).toBe(true);
    await host.api.requestCameraDisplay("pip");
    expect(host.document.body.dataset.displayMode).toBe("inline");
    expect(host.node("#display-feedback").textContent).toContain("unavailable");
    expect(host.node("#camera").classList.contains("has-snapshot")).toBe(true);
    expect(host.api.state()).toEqual(before);
    expect(hostCalls).toEqual([]);
    expect(host.messages.filter((message: any) => message.method === "ui/request-display-mode")).toHaveLength(0);
  });

  test("host fullscreen and PiP context events never drive continuity presentation state", () => {
    const host = cameraHost();
    host.acceptSnapshot();
    const before = host.api.state();
    host.api.applyHostContext({ displayMode: "fullscreen", availableDisplayModes: ["inline", "fullscreen", "pip"] });
    expect(host.document.body.dataset.displayMode).toBe("inline");
    expect(host.node("#picture-in-picture").getAttribute("aria-pressed")).toBe("false");
    expect(host.node("#fullscreen").getAttribute("aria-pressed")).toBe("false");
    expect(host.document.body.dataset.localFullscreen).not.toBe("true");
    expect(host.node("#dashboard").dataset.fullscreenLayout).toBe("inline");
    host.api.applyHostContext({ displayMode: "pip" });
    expect(host.document.body.dataset.displayMode).toBe("inline");
    expect(host.node("#picture-in-picture").getAttribute("aria-pressed")).toBe("false");
    expect(host.api.state()).toEqual(before);
  });

  test("hosted local fullscreen fallback preserves live identities with zero host or camera calls", async () => {
    const host = cameraHost(); host.acceptSnapshot(); host.api.prepareLive();
    const track = { id: "same-track" }; host.node("#live-stream").srcObject = { id: "same-media", getTracks: () => [track] };
    host.renderFrame(1); host.advance(1000); host.renderFrame(31);
    const before = host.api.state(); const media = host.node("#live-stream").srcObject;
    const liveNode = host.node("#live-stream"); const snapshotNode = host.node("#snapshot");
    const snapshotSrc = snapshotNode.src;
    const cameraCalls = () => host.messages.filter((message: any) => message.method === "tools/call").length;
    const displayCalls = () => host.messages.filter((message: any) => message.method === "ui/request-display-mode").length;
    const calls = cameraCalls();
    await host.api.requestCameraDisplay("fullscreen");
    expect(host.document.body.dataset.localFullscreen).toBe("true");
    expect(host.node("#dashboard").dataset.fullscreenLayout).toBe("local");
    await host.api.requestCameraDisplay("fullscreen");
    expect(host.document.body.dataset.localFullscreen).toBe("false");
    expect(host.node("#dashboard").dataset.fullscreenLayout).toBe("inline");
    expect(host.api.state()).toEqual(before);
    expect(host.api.state().livePeerConnection).toBe(before.livePeerConnection);
    expect(host.api.state().liveFrameObserverGeneration).toBe(before.liveFrameObserverGeneration);
    expect(host.api.state().liveFrameCallback).toBe(before.liveFrameCallback);
    expect(host.node("#live-stream")).toBe(liveNode);
    expect(host.node("#snapshot")).toBe(snapshotNode);
    expect(host.node("#live-stream").srcObject).toBe(media);
    expect(host.node("#live-stream").srcObject.getTracks()[0]).toBe(track);
    expect(host.node("#snapshot").src).toBe(snapshotSrc);
    expect(cameraCalls()).toBe(calls);
    expect(displayCalls()).toBe(0);
    expect(html).not.toContain("webkitEnterFullscreen");
  });

  test("hosted native fullscreen preserves peer, track, media nodes and frame observer", async () => {
    const host = cameraHost(); host.acceptSnapshot(); host.api.prepareLive();
    const track = { id: "hosted-native-track" };
    const media = { id: "hosted-native-media", getTracks: () => [track] };
    host.node("#live-stream").srcObject = media;
    host.renderFrame(1); host.advance(1000); host.renderFrame(31);
    const before = host.api.state();
    const liveNode = host.node("#live-stream");
    const snapshotNode = host.node("#snapshot");
    host.document.fullscreenEnabled = true;
    host.node("#dashboard").requestFullscreen = async () => { host.document.fullscreenElement = host.node("#dashboard"); };
    host.document.exitFullscreen = async () => { host.document.fullscreenElement = null; };
    await host.reply(host.messages[0], { hostContext: { displayMode: "inline", availableDisplayModes: ["inline", "fullscreen"] } });
    const messageCount = host.messages.length;
    await host.api.requestCameraDisplay("fullscreen");
    expect(host.document.fullscreenElement).toBe(host.node("#dashboard"));
    expect(host.node("#dashboard").dataset.fullscreenLayout).toBe("native");
    await host.api.requestCameraDisplay("fullscreen");
    expect(host.document.fullscreenElement).toBeNull();
    expect(host.node("#dashboard").dataset.fullscreenLayout).toBe("inline");
    expect(host.messages).toHaveLength(messageCount);
    expect(host.api.state()).toEqual(before);
    expect(host.api.state().livePeerConnection).toBe(before.livePeerConnection);
    expect(host.api.state().liveFrameCallback).toBe(before.liveFrameCallback);
    expect(host.node("#live-stream")).toBe(liveNode);
    expect(host.node("#snapshot")).toBe(snapshotNode);
    expect(host.node("#live-stream").srcObject).toBe(media);
    expect(host.node("#live-stream").srcObject.getTracks()[0]).toBe(track);
  });

  test("390 by 844 rendered layout keeps camera and video non-zero in local and native fullscreen", () => {
    for (const mode of ["local", "native"] as const) {
      const box = measureFullscreenLayout(mode);
      expect(box.viewport).toEqual([390, 844]);
      expect(box.dashboard).toBeGreaterThan(700);
      expect(box.body).toBeGreaterThan(600);
      expect(box.camera).toBeGreaterThan(600);
      expect(box.video).toBe(box.camera);
    }
  }, 20_000);

  test("hosted native PiP enter and exit preserve media identities and make zero host display requests", async () => {
    const host = cameraHost(); host.acceptSnapshot(); host.api.prepareLive();
    const track = { id: "same-pip-track" };
    const media = { id: "same-pip-media", getTracks: () => [track] };
    const liveNode = host.node("#live-stream");
    liveNode.srcObject = media;
    host.renderFrame(1); host.advance(1000); host.renderFrame(31);
    const before = host.api.state();
    const messageCount = host.messages.length;
    host.document.pictureInPictureEnabled = true;
    liveNode.requestPictureInPicture = async () => { host.document.pictureInPictureElement = liveNode; };
    host.document.exitPictureInPicture = async () => { host.document.pictureInPictureElement = null; };
    host.api.applyHostContext({ displayMode: "inline", availableDisplayModes: ["inline", "fullscreen", "pip"] });
    expect(host.node("#picture-in-picture").hidden).toBe(false);
    await host.api.requestCameraDisplay("pip");
    expect(host.document.pictureInPictureElement).toBe(liveNode);
    expect(host.node("#picture-in-picture").getAttribute("aria-pressed")).toBe("true");
    await host.api.requestCameraDisplay("pip");
    expect(host.document.pictureInPictureElement).toBeNull();
    expect(host.node("#picture-in-picture").getAttribute("aria-pressed")).toBe("false");
    expect(host.messages).toHaveLength(messageCount);
    expect(host.messages.filter((message: any) => message.method === "ui/request-display-mode")).toHaveLength(0);
    expect(host.api.state()).toEqual(before);
    expect(host.api.state().livePeerConnection).toBe(before.livePeerConnection);
    expect(host.api.state().liveFrameObserverGeneration).toBe(before.liveFrameObserverGeneration);
    expect(host.api.state().liveFrameCallback).toBe(before.liveFrameCallback);
    expect(host.node("#live-stream")).toBe(liveNode);
    expect(host.node("#live-stream").srcObject).toBe(media);
    expect(host.node("#live-stream").srcObject.getTracks()[0]).toBe(track);
  });

  test("native fullscreen and live-only PiP are feature-detected and not synthetic host modes", async () => {
    const host = cameraHost({ standalone: true });
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

  test("multi-listener pause and stalled recovery preserve peer, media and restore FPS", async () => {
    const host = cameraHost(); host.acceptSnapshot(); host.api.prepareLive();
    const peer = host.api.state().livePeerConnection;
    const media = { id: "same-media", getTracks: () => [] };
    host.node("#live-stream").srcObject = media;
    host.renderFrame(1); host.advance(1000); host.renderFrame(31);
    expect(host.node("#live-stream").events.get("pause")).toHaveLength(2);
    host.node("#live-stream").paused = true;
    host.node("#live-stream").emit("pause");
    host.node("#live-stream").emit("stalled");
    await host.flush();
    expect(host.api.state().livePeerConnection).toBe(peer);
    expect(host.node("#live-stream").srcObject).toBe(media);
    expect(host.api.state().relayRendering).toBe(true);
    expect(host.api.state().measuredLiveFps).toBeNull();
    host.node("#live-stream").paused = false;
    host.advance(1000); host.renderFrame(61);
    host.advance(1000); host.renderFrame(91);
    expect(host.node("#camera-detail-label").textContent).toContain("FPS");
  });

  test("pagehide and repeated pageshow restore live intent once", async () => {
    const host = cameraHost();
    await host.reply(host.messages[0], { hostContext: {} });
    const initial = host.messages.find((message: any) => message.params?.name === "get_u1_camera_frame");
    await host.reply(initial, frame()); host.images.at(-1).onload(); await host.flush();
    host.api.prepareLive();
    host.emitWindow("pagehide");
    expect(host.api.state().livePeerConnection).toBeNull();
    const before = host.messages.filter((message: any) => message.params?.name === "get_u1_camera_frame").length;
    host.emitWindow("pageshow"); host.emitWindow("pageshow"); await host.flush();
    const restores = host.messages.filter((message: any) => message.params?.name === "get_u1_camera_frame").slice(before);
    expect(restores).toHaveLength(1);
    expect(restores[0].params.arguments).toEqual({ authorizeLive: true });
  });

  test("FPS-only label ticks do not notify content height", () => {
    let notifications = 0;
    const host = cameraHost({ openai: { notifyIntrinsicHeight: () => { notifications++; } } });
    host.acceptSnapshot(); host.api.prepareLive();
    host.renderFrame(1);
    const baseline = notifications;
    host.advance(1000); host.renderFrame(31);
    expect(host.node("#camera-detail-label").textContent).toContain("FPS");
    expect(notifications).toBe(baseline);
  });
});
