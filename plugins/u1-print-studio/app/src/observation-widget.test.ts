import { describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import vm from "node:vm";
import { normalizeBedMeshResponse, BED_MESH_MAX_DIMENSION } from "./adapters/moonraker-bed-mesh.js";
import { unavailableBedMesh } from "./application/bed-mesh-observation.js";
import { normalizeMaterialResponse } from "./adapters/moonraker-materials.js";
import { normalizeEnvironmentResponse } from "./adapters/moonraker-environment.js";
import { PrinterObservationStore } from "./observation-store.js";
import { createObservationPresentation } from "./observation-presentation.js";
import type { U1Status } from "./u1-status.js";

// Execute the exact production script against a deterministic host/DOM boundary.
// The dedicated Chromium helper below adds the separately named thermal-layout evidence.
const html = readFileSync(new URL("../public/widget.html", import.meta.url), "utf8");
const source = html.split('<script type="module">')[1]!.split("</script>")[0]!;
const observationChromePath = [
  process.env.CHROME_BIN,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
].find((candidate): candidate is string => typeof candidate === "string" && existsSync(candidate));

function measureThermalRowHeights() {
  if (!observationChromePath) throw new Error("A Chromium browser is required for the thermal density regression");
  const directory = mkdtempSync(join(tmpdir(), "u1-thermal-layout-"));
  const fixturePath = join(directory, "thermals.html");
  const innerHtml = html.replace(/<script type="module">[\s\S]*?<\/script>/, "");
  const markup = '<div class="u1-body"><div class="strip-list"><div class="strip u1-data-row"><div class="identity"><span class="roundel">T1</span><span><strong>Tool 1</strong><span class="micro"><span class="dot"></span>Active</span></span></div><div class="reading"><small>Actual</small><strong>220°</strong></div><div class="reading"><small>Target</small><strong>220°</strong></div></div></div></div>';
  writeFileSync(fixturePath, `<!doctype html><html><body><script>
    const results = {};
    const widths = [320, 390, 590, 720];
    function measure(frame, width) {
      const document = frame.contentDocument;
      document.querySelector("#modules").innerHTML = ${JSON.stringify(markup)};
      results[width] = { viewport: frame.contentWindow.innerWidth, height: document.querySelector(".strip").getBoundingClientRect().height };
      if (Object.keys(results).length === widths.length) {
        const result = document.createElement("pre"); result.id = "layout-result"; result.textContent = JSON.stringify(results); window.document.body.append(result);
      }
    }
    for (const width of widths) {
      const frame = document.createElement("iframe"); frame.width = String(width); frame.height = "300"; frame.style = "display:block;border:0";
      frame.onload = () => measure(frame, width); frame.srcdoc = atob("${Buffer.from(innerHtml).toString("base64")}"); document.body.append(frame);
    }
  </script></body></html>`);
  try {
    const result = spawnSync(observationChromePath, [
      "--headless=new", "--disable-gpu", "--no-sandbox", "--hide-scrollbars", "--force-device-scale-factor=1",
      "--window-size=800,1400", "--virtual-time-budget=1000", "--dump-dom", `file://${fixturePath}`,
    ], { encoding: "utf8", timeout: 15_000 });
    expect(result.status).toBe(0);
    const serialized = result.stdout.match(/<pre id="layout-result">([^<]+)<\/pre>/)?.[1];
    if (!serialized) throw new Error(`Thermal layout result missing: ${result.stderr.slice(0, 500)}`);
    return JSON.parse(serialized.replaceAll("&quot;", '"')) as Record<string, { viewport: number; height: number }>;
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}
type Payload = Record<string, any>;
const tick = async () => {
  for (let index = 0; index < 8; index++) await Promise.resolve();
  await new Promise<void>(resolve => setImmediate(resolve));
};

const overviewStatus = (reachable: boolean, observedAt: string): U1Status => ({
  schemaVersion: 1, stateVersion: 1, observedAt: reachable ? observedAt : "", reachable,
  state: reachable ? "printing" : "offline", stateLabel: reachable ? "Printing" : "Offline",
  progressPercent: reachable ? 42 : null, currentLayer: reachable ? 21 : null,
  totalLayers: reachable ? 50 : null, elapsedSeconds: reachable ? 600 : null,
  remainingSeconds: reachable ? 828 : null, refreshAfterSeconds: 15,
  filename: reachable ? "must-not-render.gcode" : null, activePhysicalTool: reachable ? 1 : null,
  tools: reachable ? [{ physicalTool: 1, temperature: 220, target: 220, active: true, state: "active" }] : [],
  bed: { temperature: reachable ? 55 : null, target: reachable ? 55 : null },
  storage: { active: reachable ? true : null, filePosition: null, fileSize: null },
  printerMessage: null, exception: false,
  camera: { available: false, service: null, targetFps: null },
});

function fixture(view = "queue", extra: Payload = {}): Payload {
  const field = (value: unknown) => ({ state: value === null ? "unknown" : "known", value });
  const module: Payload = {
    kind: view, state: "unknown", capabilityEvidence: "advertised",
    provenance: { source: "not_observed", sourceObservedAt: null, detail: "Data mapping is not implemented." },
    items: [], points: [], current: null, readings: [],
  };
  if (view === "overview") {
    const statusReceipt = { state: "known", sourceObservedAt: "2026-08-31T11:00:00.000Z", freshness: "fresh" };
    const domainReceipt = { state: "known", sourceObservedAt: "2026-08-31T11:00:01.000Z", freshness: "fresh", reason: null };
    Object.assign(module, { state: "known", coverage: "complete", tiles: [
      { id: "progress", state: "known", receipts: { status: statusReceipt }, printState: "printing",
        percent: 42, currentLayer: 21, totalLayers: 50, estimatedRemainingSeconds: 828 },
      { id: "thermals", state: "known", receipts: { status: statusReceipt, environment: domainReceipt },
        activeTool: 2, activeActualC: 220, activeTargetC: 220, bedActualC: 55, bedTargetC: 55, cavityActualC: 31.5 },
      { id: "heads", state: "known", receipts: { status: statusReceipt, materials: domainReceipt },
        activeTool: 2, material: "Snapmaker PLA Matte", color: "#F4B927", reportedPresence: true },
      { id: "jobs", state: "known", receipts: { currentJob: domainReceipt }, printState: "printing", storageActive: true },
      { id: "job_history", state: "known", receipts: { jobHistory: domainReceipt }, pageCount: 2,
        statusCounts: { in_progress: 0, completed: 1, cancelled: 1, error: 0, klippy_shutdown: 0,
          klippy_disconnect: 0, interrupted: 0, unknown: 0 } },
      { id: "queue", state: "known", receipts: { queue: domainReceipt }, queueState: "ready", totalCount: 0 },
      { id: "fans", state: "known", receipts: { environment: domainReceipt }, reportedFanCount: 5,
        purifierPowerDetected: true, purifierMode: "cool_chamber" },
      { id: "bed_mesh", state: "known", receipts: { bedMesh: domainReceipt }, active: true,
        rows: 9, columns: 9, rangeMillimeters: 0.4075 },
    ] });
  }
  if (view === "progress") Object.assign(module, {
    state: "known", fields: {
      percent: field(42), currentLayer: field(21), totalLayers: field(50),
      elapsedSeconds: field(600), estimatedRemainingSeconds: field(828), filename: field("fixture.gcode"),
    },
  });
  if (view === "thermals") module.readings = [{
    id: "tool-1", label: "Tool 1", state: "known", actual: field(220),
    target: field(220), active: field(true), heaterState: field("ACTIVE"),
  }];
  if (view === "jobs") Object.assign(module, {
    state: "known", freshness: "fresh", sourceObservedAt: "2026-08-31T11:00:00.000Z",
    receivedAt: "2026-08-31T11:00:00.000Z", checkedAt: "2026-08-31T11:00:00.000Z",
    printState: { reported: true, value: "printing" },
    filename: { reported: true, value: "current-only.gcode" },
    storageActive: { reported: true, value: true },
    filePositionBytes: { reported: true, value: 420 }, fileSizeBytes: { reported: true, value: 1000 },
    totalDurationSeconds: { reported: true, value: 600 }, printDurationSeconds: { reported: true, value: 590 },
    filamentUsedMillimeters: { reported: true, value: 1200 }, reason: null,
  });
  if (view === "job_history") Object.assign(module, {
    state: "known", freshness: "fresh", sourceObservedAt: "2026-08-31T11:00:00.000Z",
    receivedAt: "2026-08-31T11:00:00.000Z", checkedAt: "2026-08-31T11:00:00.000Z",
    pageCount: 1, reason: null, items: [{ position: 1, filename: "history-only.gcode",
      status: "completed", startTime: "2026-08-31T10:00:00.000Z", endTime: "2026-08-31T10:30:00.000Z",
      printDurationSeconds: 1700, totalDurationSeconds: 1800, filamentUsedMillimeters: 900 }],
  });
  return {
    schemaVersion: 2, view, observationVersion: 7,
    sourceObservedAt: "2026-08-31T11:00:00.000Z", receivedAt: "2026-08-31T11:00:00.100Z",
    freshness: "fresh", reachable: true, printerStateLabel: "Printing", module, ...extra,
  };
}

function mount(openai: Payload = {}, width = 720, mediaMode: "modern" | "legacy" | "static" | "absent" = "modern", clipboard?: Payload) {
  const events = new Map<string, (event: any) => void>();
  const timers = new Map<number, { deadline: number; callback: () => void }>();
  let now = 0;
  let nextTimer = 0;
  const sent: Payload[] = [];
  const parent = { postMessage: (message: Payload) => sent.push(JSON.parse(JSON.stringify(message))) };
  const controls: Payload = {};
  const button = {
    disabled: false, attributes: {} as Record<string, string>,
    addEventListener() {},
    setAttribute(name: string, value: string) { this.attributes[name] = value; },
  };
  const error = { textContent: "" };
  const node = (dataset: Payload = {}) => {
    const listeners = new Map<string, (event: Payload) => void>();
    return { dataset, attributes: {} as Payload, value: "100", disabled: false, listeners,
      addEventListener: (name: string, callback: (event: Payload) => void) => listeners.set(name, callback),
      setAttribute(name: string, value: string) { this.attributes[name] = value; },
      setPointerCapture() {},
      emit(name: string, event: Payload = {}) { listeners.get(name)?.({ preventDefault() {}, ...event }); },
    };
  };
  const mode3d = node({ meshMode: "3d" }); const mode2d = node({ meshMode: "2d" });
  const height = node(); const reset = node();
  const chartPattern = /(<div class="mesh-chart"[^>]*>)[\s\S]*?(<\/div><div class="mesh-legend")/;
  const chart = { ...node(),
    get innerHTML() { return modules.innerHTML.match(chartPattern)?.[0] ?? ""; },
    set innerHTML(value: string) { modules.innerHTML = modules.innerHTML.replace(chartPattern, `$1${value}$2`); },
  };
  const help = {
    set textContent(value: string) { modules.innerHTML = modules.innerHTML.replace(/(<p class="mesh-help">)[\s\S]*?(<\/p>)/, `$1${value}$2`); },
  };
  const trackPattern = /<div class="progress-track[\s\S]*?(?=<div class="progress-meta")/;
  const track = {
    get outerHTML() { return modules.innerHTML.match(trackPattern)?.[0] ?? ""; },
    set outerHTML(value: string) { modules.innerHTML = modules.innerHTML.replace(trackPattern, value); },
  };
  let copyButtons: Payload[] = [];
  const modules = {
    innerHTML: "Waiting for printer observation…",
    querySelectorAll: (selector: string) => {
      if (selector === ".material-copy") {
        copyButtons.forEach(button => { button.isConnected = false; });
        copyButtons = [...modules.innerHTML.matchAll(/class="material-copy" data-color="([^"]+)"/g)].map(match => {
          const feedback = { textContent: "" };
          return { ...node({ color: match[1] }), feedback, isConnected: true, closest: () => ({ querySelector: () => feedback }) };
        });
        return copyButtons;
      }
      return selector === ".refresh" ? [button] : selector === "[data-mesh-mode]" && modules.innerHTML.includes('class="mesh-chart"') ? [mode3d, mode2d] : [];
    },
    querySelector: (selector: string) => selector === ".refresh-error" ? error : selector === ".progress-track" ? track : ({ ".mesh-chart": chart, ".mesh-height": height, ".mesh-reset": reset, ".mesh-help": help } as Payload)[selector] ?? button,
  };
  let onMediaChange = () => {};
  const media: Payload = { matches: width <= 480 };
  if (mediaMode === "modern") media.addEventListener = (_name: string, callback: () => void) => { onMediaChange = callback; };
  if (mediaMode === "legacy") media.addListener = (callback: () => void) => { onMediaChange = callback; };
  const window = {
    openai, parent, addEventListener: (name: string, callback: (event: any) => void) => events.set(name, callback),
    matchMedia: () => mediaMode === "absent" ? undefined : media,
  };
  const context = vm.createContext({
    window, document: { querySelector: () => modules }, navigator: { clipboard }, __controls: controls,
    setTimeout: (callback: () => void, delay: number) => {
      const id = ++nextTimer;
      timers.set(id, { deadline: now + delay, callback });
      return id;
    },
    clearTimeout: (id: number) => timers.delete(id),
  });
  vm.runInContext(`${source}\n__controls.refresh = refresh; __controls.retry = retryLoad; __controls.meshView = meshView; __controls.meshGeometry = () => meshGeometry; __controls.meshDisplayScale = meshDisplayScale; __controls.disposeMeshRenderer = disposeMeshRenderer;`, context);
  const message = (data: Payload, sender: unknown = parent) => events.get("message")?.({ data, source: sender });
  const deliver = (result: Payload, sender?: unknown) => message({ jsonrpc: "2.0", method: "ui/notifications/tool-result", params: result }, sender);
  const respond = (request: Payload, result: Payload = {}) => message({ jsonrpc: "2.0", id: request.id, result });
  return {
    sent, modules, button, error, controls, message, deliver, respond, chart, mode3d, mode2d, height, reset,
    get copyButtons() { return copyButtons; },
    resize(nextWidth: number) { const matches = nextWidth <= 480; if (media.matches !== matches) { media.matches = matches; onMediaChange(); } },
    globals: (globals: Payload) => events.get("openai:set_globals")?.({ detail: { globals } }),
    async initialize() {
      const request = sent.find(item => item.method === "ui/initialize")!;
      respond(request, { protocolVersion: "2026-01-26", hostCapabilities: {}, hostContext: {} });
      await tick();
    },
    async advance(milliseconds: number) {
      now += milliseconds;
      for (const [id, timer] of [...timers]) {
        if (timer.deadline <= now) { timers.delete(id); timer.callback(); }
      }
      await tick();
    },
  };
}

describe("production observation widget host boundary", () => {
  test('terminal legacy failure retains only known/stale data in an explicit matching epoch', () => {
    for (const previousState of ['known', 'stale', 'unknown']) for (const epoch of [3, 4, null]) {
      const initial = fixture('queue', { connectionEpoch: 3 });
      Object.assign(initial.module, { state: previousState, queueState: 'ready', totalCount: 0, truncated: false, items: [], sourceObservedAt: initial.sourceObservedAt, freshness: previousState === 'stale' ? 'stale' : 'fresh' });
      const card = mount({ toolOutput: initial }); const previous = card.modules.innerHTML;
      const failed = fixture('queue', { connectionEpoch: epoch }); failed.module.state = 'unavailable';
      card.deliver({ structuredContent: failed });
      if (previousState !== 'unknown' && epoch === 3) {
        expect(card.modules.innerHTML).toBe(previous);
        expect(card.error.textContent).toContain('showing previous observation');
      } else {
        expect(card.modules.innerHTML).toContain('data-observation-placeholder="unavailable"');
        expect(card.modules.innerHTML).not.toContain('Print queue empty');
      }
    }
  });
  test('all nine initial unavailable deliveries keep static public anatomy and explicit Retry reads once', async () => {
    for (const view of ['overview', 'progress', 'thermals', 'heads', 'jobs', 'job_history', 'queue', 'fans', 'bed_mesh']) {
      const unavailable = fixture(view); unavailable.module.state = 'unavailable';
      const card = mount({ toolInput: { view }, toolOutput: unavailable });
      await card.initialize();
      const before = card.modules.innerHTML;
      expect(before).toContain('data-observation-placeholder="unavailable"');
      expect(before).toContain('aria-busy="false"');
      expect(before).toContain('neutral-value');
      expect(before).not.toMatch(/<canvas|<video|<time|aria-valuenow|mesh-cell/);
      await card.advance(15001);
      expect(card.modules.innerHTML).toBe(before);
      const retry = card.controls.retry(); await tick();
      const request = card.sent.find(item => item.method === 'tools/call')!;
      expect(request.params).toEqual({ name: 'refresh_printer_observation', arguments: { view } });
      card.respond(request, { structuredContent: fixture(view) }); await retry;
      expect(card.sent.filter(item => item.method === 'tools/call')).toHaveLength(1);
    }
  });

  test('startup unsupported remains a distinct terminal result after the missing-host timeout', async () => {
    const unavailable = fixture('queue'); unavailable.module.state = 'unsupported';
    const card = mount({ toolOutput: unavailable }); await card.initialize();
    await card.advance(15001);
    expect(card.modules.innerHTML).toContain('Print Queue endpoint unsupported');
    expect(card.modules.innerHTML).not.toContain('Couldn’t load');
    expect(card.sent.filter(item => item.method === 'tools/call')).toHaveLength(0);
  });

  test("current job and history have separate content and selected-view refresh", async () => {
    const current = fixture("jobs");
    current.module.history = { items: [{ filename: "old-history.gcode" }] }; // Old payloads must not restore the combined panel.
    const history = fixture("job_history");
    history.module.current = current.module; // A foreign field must not leak into this focused view.
    for (const data of [current, history]) {
      const card = mount({ toolOutput: data });
      await card.initialize();
      const before = card.modules.innerHTML;
      if (data.view === "jobs") {
        expect(before).toContain("Current Job");
        expect(before).toContain("current-only.gcode");
        expect(before).toContain('<div class="u1-body"><div class="job-current">');
        expect(before).not.toContain("job-current u1-body");
        expect(before).not.toMatch(/History|history|Previous jobs|old-history.gcode/);
      } else {
        expect(before).toContain("Job History");
        expect(before).toContain("history-only.gcode");
        expect(before).toContain("Observed ");
        expect(before).not.toMatch(/current-only.gcode|class="job-current"/);
      }
      const refresh = card.controls.refresh();
      await tick();
      const request = card.sent.find(item => item.method === "tools/call")!;
      expect(request.params).toEqual({ name: "refresh_printer_observation", arguments: { view: data.view } });
      card.respond(request, { structuredContent: data });
      await refresh;
      expect(card.modules.innerHTML).toBe(before);
      expect(card.sent.filter(item => item.method === "tools/call")).toHaveLength(1);
    }
  });

  test("current job preserves escaped unknown and stale facts without a history panel", () => {
    const data = fixture("jobs", { freshness: "stale" });
    Object.assign(data.module, { state: "stale", freshness: "stale",
      filename: { reported: true, value: "safe-current.gcode" },
      storageActive: { reported: false, value: null }, reason: "network" });
    const markup = mount({ toolOutput: data }).modules.innerHTML;
    expect(markup).toContain("safe-current.gcode");
    expect(markup).toContain("Not reported");
    expect(markup).toContain("Stale");
    expect(markup).not.toContain("History");
    data.module = { kind: "jobs", state: "unknown", reason: "not_requested" };
    const missing = mount({ toolOutput: data }).modules.innerHTML;
    expect(missing).toContain("Current Job not observed");
    expect(missing).toContain('<div class="u1-body"><div class="empty-panel">');
    expect(missing).not.toContain("empty-panel u1-body");
    expect(missing).not.toMatch(/No active job|Idle|No jobs/);
  });

  test("History accepts the exact Unix timestamp maximum and rejects max-plus-one fail closed", () => {
    const maximum = fixture("job_history");
    maximum.module.items[0].startTime = "9999-12-31T23:59:59.000Z";
    maximum.module.items[0].endTime = "9999-12-31T23:59:59.000Z";
    const accepted = mount({ toolOutput: maximum }).modules.innerHTML;
    expect(accepted).toContain("history-only.gcode");
    expect(accepted).not.toContain("Job History not observed");
    for (const shorthand of ["attempted History endpoint", "Showing the last observed History page",
      "latest History page", "current History page", '"History endpoint unsupported"']) {
      expect(html).not.toContain(shorthand);
    }

    for (const field of ["startTime", "endTime"] as const) {
      const beyond = fixture("job_history");
      beyond.module.items[0][field] = "+010000-01-01T00:00:00.000Z";
      const rejected = mount({ toolOutput: beyond }).modules.innerHTML;
      expect(rejected).toContain("Job History not observed");
      expect(rejected).toContain("Observation time unavailable");
      expect(rejected).not.toContain("history-only.gcode");
    }
  });

  test("cold mount completes a request/response initialization before announcing ready", async () => {
    const card = mount();
    expect(card.sent).toHaveLength(1);
    expect(card.sent[0]!.jsonrpc).toBe("2.0");
    expect(card.sent[0]!.method).toBe("ui/initialize");
    expect(typeof card.sent[0]!.id).toBe("number");
    expect(card.sent[0]!.params.protocolVersion).toBe("2026-01-26");
    expect(card.modules.innerHTML).toContain('data-observation-placeholder="loading"');
    await card.initialize();
    expect(card.sent).toContainEqual(expect.objectContaining({ method: "ui/notifications/initialized" }));
    card.deliver({ structuredContent: fixture("progress") });
    expect(card.modules.innerHTML).toContain("42%");
    expect(card.modules.innerHTML).not.toContain("Waiting");
  });

  test("empty output does not mask either metadata envelope", () => {
    for (const key of ["mcp_tool_result", "call_tool_result"]) {
      const card = mount({ toolOutput: {}, toolResponseMetadata: { [key]: { structuredContent: fixture("queue") } } });
      expect(card.modules.innerHTML).toContain("Print Queue");
      expect(card.modules.innerHTML).not.toContain("Waiting");
    }
  });

  test("late globals support metadata-only, direct output, and nested result delivery", () => {
    const metadata = mount();
    metadata.globals({ toolResponseMetadata: { mcp_tool_result: { structuredContent: fixture("fans") } } });
    expect(metadata.modules.innerHTML).toContain("Fans &amp; Air");
    const direct = mount();
    direct.globals({ toolOutput: fixture("heads") });
    expect(direct.modules.innerHTML).toContain("Heads &amp; Filaments");
    const nested = mount();
    nested.deliver({ result: { structuredContent: fixture("bed_mesh") } });
    expect(nested.modules.innerHTML).toContain("Bed Mesh");
  });

  test("new metadata-only events win over an older valid global tool output", () => {
    for (const key of ["mcp_tool_result", "call_tool_result"]) {
      const card = mount({ toolOutput: fixture("progress") });
      expect(card.modules.innerHTML).toContain("42%");
      const updated = fixture("progress", { observationVersion: 8 });
      updated.module.fields.percent.value = 84;
      card.globals({ toolResponseMetadata: { [key]: { structuredContent: updated } } });
      expect(card.modules.innerHTML).toContain("84%");
      expect(card.modules.innerHTML).not.toContain("42%");
    }
  });

  test("independently initialized cards retain their selected module", async () => {
    const cards = ["progress", "thermals", "jobs"].map(view => mount({ toolInput: { view } }));
    await Promise.all(cards.map(card => card.initialize()));
    cards.forEach((card, index) => card.deliver({ structuredContent: fixture(["progress", "thermals", "jobs"][index]) }));
    expect(cards[0]!.modules.innerHTML).toContain("Print Progress");
    expect(cards[1]!.modules.innerHTML).toContain("Thermals");
    expect(cards[2]!.modules.innerHTML).toContain("Current Job");
    cards[0]!.deliver({ structuredContent: fixture("heads") });
    expect(cards[0]!.modules.innerHTML).toContain("Print Progress");
    expect(cards[0]!.modules.innerHTML).not.toContain("Heads &amp; Filaments");
  });

  test("ignores foreign messages and bounds missing host data", async () => {
    const card = mount();
    card.deliver({ structuredContent: fixture("progress") }, {});
    expect(card.modules.innerHTML).toContain('data-observation-placeholder="loading"');
    await card.advance(15001);
    expect(card.modules.innerHTML).not.toContain("Waiting for printer observation");
    expect(card.modules.innerHTML).toMatch(/reopen|open.*again/i);
    expect(card.sent.filter(item => item.method === "tools/call")).toHaveLength(0);
  });

  test("malformed values cannot throw and strand the loading shell", async () => {
    const card = mount();
    const malformed = fixture("progress");
    malformed.module.fields.percent.value = "not-a-number";
    expect(() => card.deliver({ structuredContent: malformed })).not.toThrow();
    await card.advance(15001);
    expect(card.modules.innerHTML).not.toContain("Waiting for printer observation");
    expect(card.modules.innerHTML).not.toContain("not-a-number%");
    const valid = fixture("progress");
    card.deliver({ structuredContent: valid });
    expect(card.modules.innerHTML).toContain("42%");
  });

  test("known-view timeout retry uses only the app-only selected-view helper", async () => {
    const card = mount({ toolInput: { view: "thermals" } });
    await card.initialize();
    await card.advance(15001);
    const retry = card.controls.retry();
    await tick();
    const request = card.sent.find(item => item.method === "tools/call")!;
    expect(request).toMatchObject({ params: { name: "refresh_printer_observation", arguments: { view: "thermals" } } });
    card.respond(request, { structuredContent: fixture("thermals") });
    await retry;
    expect(card.modules.innerHTML).toContain("220°");
    expect(card.button.disabled).toBe(false);
  });

  test("refresh timeout retains source time and values with visible failure", async () => {
    const data = fixture("progress", { freshness: "stale" });
    const card = mount({ toolOutput: data });
    await card.initialize();
    const before = card.modules.innerHTML;
    const refresh = card.controls.refresh();
    await tick();
    expect(card.button.disabled).toBe(true);
    await card.advance(15001);
    await refresh;
    expect(card.modules.innerHTML).toBe(before);
    expect(card.error.textContent).toMatch(/Refresh failed/i);
    expect(card.modules.innerHTML).toContain("Stale");
    expect(card.button.disabled).toBe(false);
    expect(card.button.attributes["aria-busy"]).toBe("false");
  });

  test("each focused card puts information in its header and only refresh in its footer", () => {
    for (const view of ["overview", "progress", "thermals", "heads", "jobs", "job_history", "queue", "fans", "bed_mesh"]) {
      const card = mount({ toolOutput: fixture(view) });
      const markup = card.modules.innerHTML;
      expect((markup.match(/<footer /g) ?? []).length).toBe(1);
      expect((markup.match(/aria-label="Refresh observation"/g) ?? []).length).toBe(1);
      expect(markup.indexOf("<footer ")).toBeGreaterThan(markup.indexOf("</header>"));
      const header = markup.match(/<header [\s\S]*?<\/header>/)![0];
      const footer = markup.match(/<footer [\s\S]*?<\/footer>/)![0];
      expect(header).toContain(view === "bed_mesh" || view === "queue" || view === "fans" ? "Observation time unavailable" : "Observed ");
      expect(header).toContain('class="refresh-error" role="status"');
      expect(header).not.toContain("<button");
      expect(footer).toMatch(/^<footer class="instrument-footer u1-footer"><div class="u1-primary-actions"><button class="refresh u1-action u1-action--round"[\s\S]*<\/button><\/div><\/footer>$/);
      expect(footer).not.toMatch(/<time|Observed|refresh-error|freshness-warning|role="status"/);
      expect(markup).toContain(view === "bed_mesh" || view === "queue" || view === "fans" ? "Observation time unavailable" : "Observed ");
      expect(markup).not.toMatch(/Read only|Current reading|Printer telemetry/);
    }
  });

  test("loading failure information stays above retry without inventing observation time", async () => {
    for (const hasView of [false, true]) {
      const card = mount(hasView ? { toolInput: { view: "progress" } } : {});
      await card.initialize();
      await card.advance(15001);
      const markup = card.modules.innerHTML;
      expect(markup).toContain("Couldn’t load this view");
      expect(markup).not.toMatch(/<time|Observed|Observation time unavailable/);
      if (hasView) {
        expect(markup.indexOf("Try loading the view again.")).toBeLessThan(markup.indexOf("<footer"));
        expect(markup.match(/<footer [\s\S]*?<\/footer>/)![0]).toMatch(/aria-label="Retry loading observation"><svg[\s\S]*<\/svg><\/button>/);
      } else {
        expect(markup).toContain("Reopen this card from the conversation");
        expect(markup).toContain('<span class="neutral-action" aria-hidden="true"></span>');
        expect(markup).not.toContain('<button');
      }
    }
  });

  test("missing time and freshness are explicit, not epoch time or invented current state", () => {
    for (const value of [null, "", "invalid"]) {
      const card = mount({ toolOutput: fixture("queue", { sourceObservedAt: value, freshness: "unknown" }) });
      expect(card.modules.innerHTML).toContain("Observation time unavailable");
      expect(card.modules.innerHTML).toContain("Freshness unknown");
      expect(card.modules.innerHTML).not.toContain("Observed ");
    }
    const offline = mount({ toolOutput: fixture("progress", { freshness: "offline", reachable: false, printerStateLabel: "Offline" }) });
    expect(offline.modules.innerHTML).toContain("Offline");
  });

  test("overview renders eight compact privacy-minimized headlines in one card", () => {
    const overview = mount({ toolOutput: fixture("overview") }).modules.innerHTML;
    for (const text of ["Overview", "Coverage complete", "Print Progress", "Thermals",
      "Heads &amp; Filaments", "Current Job", "Job History", "Print Queue", "Fans &amp; Air",
      "Bed Mesh", "42%", "Layer 21 / 50", "T2 220° / 220°", "Cavity 32°",
      "Snapmaker PLA Matte", "2 jobs returned",
      "1 completed · 1 cancelled", "0 jobs queued", "5 of 7 fans reported",
      "Purifier detected · Cool chamber", "9 × 9 · 0.407 mm range"]) expect(overview).toContain(text);
    expect((overview.match(/data-overview-tile=/g) ?? []).length).toBe(8);
    expect((overview.match(/<section class="instrument/g) ?? []).length).toBe(1);
    expect((overview.match(/aria-label="Refresh observation"/g) ?? []).length).toBe(1);
    expect(overview).not.toMatch(/fixture\.gcode|history-only\.gcode|file position|file size|mesh-surface|camera|health/i);
    expect(html).toContain("@media (max-width: 340px) { .head-grid, .overview-grid { grid-template-columns: minmax(0, 1fr); } }");

    const malformed = fixture("overview");
    malformed.module.tiles[2].material = "secret/access_token/private";
    malformed.module.tiles[4].pageCount = 21;
    const isolated = mount({ toolOutput: malformed }).modules.innerHTML;
    expect((isolated.match(/Data could not be read/g) ?? []).length).toBe(2);
    expect(isolated).toContain("Coverage partial");
    expect(isolated).toContain("42%");
    expect(isolated).toContain("0 jobs queued");
    expect(isolated).not.toContain("secret/access_token/private");
  });

  test("Overview rejects state, receipt and headline mismatches one tile at a time", () => {
    const cases: Array<{ id: string; leak: string; mutate: (tile: Payload) => void }> = [
      { id: "progress", leak: "42%", mutate: tile => { tile.state = "unknown"; } },
      { id: "progress", leak: "42%", mutate: tile => { tile.state = "unsupported"; tile.receipts.status = { state: "unsupported", sourceObservedAt: null, freshness: "unknown", reason: "unsupported" }; } },
      { id: "thermals", leak: "T2 220°", mutate: tile => { tile.state = "unavailable"; tile.receipts.status = { state: "unavailable", sourceObservedAt: null, freshness: "unknown", reason: "timeout" }; } },
      { id: "thermals", leak: "T2 220°", mutate: tile => { tile.state = "stale"; } },
      { id: "heads", leak: "Snapmaker PLA Matte", mutate: tile => { tile.state = "unsupported"; tile.receipts.status = { state: "unsupported", sourceObservedAt: null, freshness: "unknown", reason: "unsupported" }; } },
      { id: "heads", leak: "Snapmaker PLA Matte", mutate: tile => { tile.receipts.materials = { state: "unavailable", sourceObservedAt: null, freshness: "unknown", reason: "network" }; } },
      { id: "jobs", leak: "Storage active", mutate: tile => { tile.state = "unavailable"; tile.receipts.currentJob = { state: "unavailable", sourceObservedAt: null, freshness: "unknown", reason: "timeout" }; } },
      { id: "job_history", leak: "2 jobs returned", mutate: tile => { tile.state = "unknown"; tile.receipts.jobHistory = { state: "unknown", sourceObservedAt: null, freshness: "unknown", reason: "not_reported" }; } },
      { id: "queue", leak: "0 jobs queued", mutate: tile => { tile.state = "stale"; } },
      { id: "fans", leak: "5 of 7 fans reported", mutate: tile => { tile.state = "unsupported"; tile.receipts.environment = { state: "unsupported", sourceObservedAt: null, freshness: "unknown", reason: "unsupported" }; } },
      { id: "bed_mesh", leak: "9 × 9", mutate: tile => { tile.state = "unavailable"; tile.receipts.bedMesh = { state: "unavailable", sourceObservedAt: null, freshness: "unknown", reason: "malformed" }; } },
    ];
    for (const hostile of cases) {
      const data = fixture("overview");
      const tile = data.module.tiles.find((candidate: Payload) => candidate.id === hostile.id)!;
      hostile.mutate(tile);
      const available = data.module.tiles.filter((candidate: Payload) => candidate.state === "known" || candidate.state === "stale").length;
      data.module.coverage = available === 0 ? "none" : available === 8 ? "complete" : "partial";
      const markup = mount({ toolOutput: data }).modules.innerHTML;
      expect((markup.match(/Data could not be read/g) ?? []).length).toBe(1);
      expect(markup).toContain("Coverage partial");
      expect(markup).toContain("Current Job");
      expect(markup).not.toContain(hostile.leak);
    }
  });

  test("Overview receipt lines show complete bounded time, freshness and mapped reasons", () => {
    const unavailableReasons = {
      timeout: "Timed out", unauthorized: "Authorization required", malformed: "Invalid response",
      too_large: "Response too large", network: "Network unavailable", not_configured: "Not configured",
      http_error: "Service error",
    };
    for (const [reason, label] of Object.entries(unavailableReasons)) {
      const data = fixture("overview");
      const jobs = data.module.tiles[3];
      Object.assign(jobs, { state: "unavailable", printState: null, storageActive: null,
        receipts: { currentJob: { state: "unavailable", sourceObservedAt: null, freshness: "unknown", reason } } });
      data.module.coverage = "partial";
      const markup = mount({ toolOutput: data }).modules.innerHTML;
      expect(markup).toContain(`Current Job · Unavailable · Observation time unavailable · Freshness unknown · ${label}`);
      expect(markup).not.toContain(reason);
      expect((markup.match(/Data could not be read/g) ?? []).length).toBe(0);
    }

    const states = fixture("overview");
    Object.assign(states.module.tiles[3], { state: "stale", receipts: { currentJob: {
      state: "stale", sourceObservedAt: "2026-08-31T11:00:01.000Z", freshness: "stale", reason: "network",
    } } });
    Object.assign(states.module.tiles[4], { state: "unknown", pageCount: null, statusCounts: null,
      receipts: { jobHistory: { state: "unknown", sourceObservedAt: null, freshness: "unknown", reason: "not_requested" } } });
    Object.assign(states.module.tiles[5], { state: "unsupported", queueState: null, totalCount: null,
      receipts: { queue: { state: "unsupported", sourceObservedAt: null, freshness: "unknown", reason: "unsupported" } } });
    Object.assign(states.module.tiles[6], { state: "unknown", reportedFanCount: null, purifierPowerDetected: null, purifierMode: null,
      receipts: { environment: { state: "unknown", sourceObservedAt: null, freshness: "unknown", reason: "not_reported" } } });
    states.module.coverage = "partial";
    const markup = mount({ toolOutput: states }).modules.innerHTML;
    for (const line of [
      "Current Job · Stale · Observed ", " · Stale · Network unavailable",
      "Job History · Not observed · Observation time unavailable · Freshness unknown · Not requested",
      "Print Queue · Unsupported · Observation time unavailable · Freshness unknown · Endpoint unsupported",
      "Environment · Not observed · Observation time unavailable · Freshness unknown · Not reported",
    ]) expect(markup).toContain(line);
    expect((markup.match(/Data could not be read/g) ?? []).length).toBe(0);
    expect(html).toContain("overflow-wrap: anywhere");
  });

  test("Overview accepts initial and retained-offline status receipts without restoring headline facts", () => {
    const cases = [
      { freshness: "offline", sourceObservedAt: null },
      { freshness: "stale", sourceObservedAt: "2026-08-31T11:00:00.000Z" },
    ];
    for (const retained of cases) {
      const data = fixture("overview", { freshness: retained.freshness, sourceObservedAt: retained.sourceObservedAt, reachable: false });
      Object.assign(data.module.tiles[0], { state: "unknown", printState: "unknown", percent: null,
        currentLayer: null, totalLayers: null, estimatedRemainingSeconds: null,
        receipts: { status: { state: "unavailable", sourceObservedAt: retained.sourceObservedAt, freshness: retained.freshness } } });
      data.module.coverage = "partial";
      const markup = mount({ toolOutput: data }).modules.innerHTML;
      const progress = markup.match(/<article class="overview-tile u1-data-row" data-overview-tile="progress">[\s\S]*?<\/article>/)![0];
      expect(progress).toContain("Not observed");
      expect(progress).not.toContain("Data could not be read");
      expect(progress).not.toMatch(/42%|Layer 21|Printing/);
      expect(progress).toContain(retained.freshness === "stale" ? "Observed " : "Observation time unavailable");
      expect(progress).toContain(retained.freshness === "stale" ? "Stale" : "Offline");
    }
  });

  test("real store projections keep offline status facts neutral while preserving independent cavity evidence", async () => {
    const start = new Date("2026-08-31T11:00:00.000Z");
    const environment = (receipt: string) => normalizeEnvironmentResponse({ result: { status: {
      "temperature_sensor cavity": { temperature: 31.5 }, fan: {}, "fan_generic e1_fan": {},
      "fan_generic e2_fan": {}, "fan_generic e3_fan": {}, "fan_generic cavity_fan": {},
      purifier: { power_detected: false },
    } } }, receipt);

    let now = start;
    const firstFailure = new PrinterObservationStore(async () => { throw new Error("private"); }, () => now,
      undefined, undefined, undefined, async () => environment(now.toISOString()));
    const initial = createObservationPresentation(await firstFailure.current({ includeEnvironment: true }), "overview");
    const initialMarkup = mount({ toolOutput: initial }).modules.innerHTML;
    expect(initialMarkup).toContain("Cavity 32°");
    expect(initialMarkup).toContain("Cavity · Known · Observed ");
    expect(initialMarkup).not.toMatch(/42%|Layer 21|T1 220°|Data could not be read|must-not-render/);

    for (const withEnvironment of [false, true]) {
      now = start;
      let statusReads = 0;
      const store = new PrinterObservationStore(async () => ({
        status: overviewStatus(statusReads++ === 0, start.toISOString()), metadata: {},
      }), () => now, undefined, undefined, undefined,
      withEnvironment ? async () => environment(now.toISOString()) : undefined);
      await store.current({ includeEnvironment: withEnvironment });
      now = new Date(start.valueOf() + 16_000);
      const retained = createObservationPresentation(await store.current({ refresh: true, includeEnvironment: withEnvironment }), "overview");
      const markup = mount({ toolOutput: retained }).modules.innerHTML;
      expect(markup).not.toMatch(/42%|Layer 21|T1 220°|Bed 55°|must-not-render|Data could not be read/);
      expect(markup).toContain("Printer · Unavailable · Observed ");
      expect(markup).toContain(" · Stale");
      if (withEnvironment) expect(markup).toContain("Cavity 32°");
      else expect(markup).toContain("Cavity Unknown");
    }
  });

  test("unobserved Fans remain explicit, not empty success or synthetic charts", () => {
    const fans = mount({ toolOutput: fixture("fans") }).modules.innerHTML;
    expect(fans).toContain("Fans not observed");
    expect(fans).toContain("Refresh to request fan and purifier readings.");
    expect(fans).not.toMatch(/Not implemented|Waiting|mesh-placeholder/);
    const thermal = mount({ toolOutput: fixture("thermals") }).modules.innerHTML;
    expect(thermal).not.toContain('class="trace');
    expect(thermal).toContain("220°");
  });

  test("Fans renders only the exact reported fixed set with independent receipt and distinct missing, null and zero facts", () => {
    const observedAt = "2026-08-31T12:00:00.000Z";
    const environment = normalizeEnvironmentResponse({ result: { status: {
      fan: { speed: 0.5, rpm: 1200 }, "fan_generic e1_fan": { speed: 0, rpm: 0 },
      "fan_generic e2_fan": { speed: 0.25, rpm: null }, "fan_generic e3_fan": {},
      "fan_generic cavity_fan": { speed: 1 }, purifier: { power_detected: true, mode: 1,
        exhaust_fan: { speed: 0.4 }, inner_fan_rpm: null },
    } } }, observedAt);
    const data = fixture("fans");
    Object.assign(data.module, { kind: "fans", state: "known", freshness: "fresh",
      provenance: { source: "moonraker", sourceObservedAt: observedAt, detail: "fixed" },
      receivedAt: observedAt, checkedAt: observedAt, reason: null, items: environment.fans,
      purifier: { ...environment.purifier, capabilityEvidence: "observed" } });
    const markup = mount({ toolOutput: data }).modules.innerHTML;
    for (const text of ["Fans &amp; Air", "Part cooling", "Air handling", "Tool 1 part cooling",
      "Tool 4 part cooling", "Cavity fan", "Purifier exhaust", "Purifier inner fan", "50%",
      "Off", "N/A", "Cool chamber"]) expect(markup).toContain(text);
    const expectedTime = new Date(observedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    expect(markup).toContain(`Observed ${expectedTime}`);
    expect(markup).not.toMatch(/Control|View only|health|fault/i);
    expect(markup).not.toMatch(/Commanded|Measured|Command not reported|Stopped|Detected/);
    expect(markup.match(/data-icon="lucide-fan"/g)).toHaveLength(7);
    expect(markup).toContain('style="--fan-level:50%"');
    expect(markup).toContain('style="--fan-level:100%"');
    expect(markup).not.toContain('style="--fan-level:101%"');
    expect(markup.indexOf("Observed ")).toBeLessThan(markup.indexOf("Part cooling"));
    expect(markup.indexOf('aria-label="Refresh observation"')).toBeGreaterThan(markup.indexOf("Air handling"));

    for (const mutate of [
      (value: Payload) => value.module.items.pop(),
      (value: Payload) => { value.module.items[0].id = "private-fan"; },
      (value: Payload) => { value.module.items[0].label = "<img src=private>"; },
      (value: Payload) => { value.module.items[0].rpm = 1_000_001; },
      (value: Payload) => { value.module.items[0].state = "known"; value.module.items[0].speedReported = false; value.module.items[0].rpmReported = false; value.module.items[0].speedFraction = null; value.module.items[0].rpm = null; },
      (value: Payload) => { value.module.purifier.state = "known"; value.module.purifier.powerDetected = null; },
      (value: Payload) => { value.module.provenance.sourceObservedAt = null; },
    ]) {
      const malformed = structuredClone(data); mutate(malformed);
      const rejected = mount({ toolOutput: malformed }).modules.innerHTML;
      expect(rejected).toContain("Fan and purifier data could not be read.");
      expect(rejected).not.toMatch(/private-fan|<img|Tool 1 part cooling/);
    }
  });

  test("Thermals associates cavity receipt with an actual-only row and names omitted cavity explicitly", () => {
    const observedAt = "2026-08-31T12:00:00.000Z";
    const data = fixture("thermals");
    data.module.environment = { state: "known", freshness: "fresh", sourceObservedAt: observedAt,
      receivedAt: observedAt, checkedAt: observedAt, reason: null };
    data.module.readings.push({ id: "cavity", label: "Cavity", state: "known",
      reportedState: "known", actual: { state: "known", value: 31.5 } });
    const markup = mount({ toolOutput: data }).modules.innerHTML;
    const cavity = markup.match(/<div class="strip u1-data-row zone-row"><div class="identity"><span><strong>Cavity<\/strong>[\s\S]*?<\/div><\/div>/)?.[0] ?? "";
    expect(cavity).toContain("32°"); expect(cavity).toContain("Observed ");
    expect(cavity).not.toContain("Target");
    data.module.readings.at(-1).state = "unknown"; data.module.readings.at(-1).reportedState = "not_reported"; data.module.readings.at(-1).actual = { state: "unknown", value: null };
    expect(mount({ toolOutput: data }).modules.innerHTML).toContain("Temperature not reported");
    expect(html).toContain("padding: 5px 14px");
    expect(html).toContain("grid-template-columns: minmax(104px, 1.2fr) repeat(2, minmax(52px, 0.7fr)); gap: 6px; padding: 5px 8px;");
    expect(html).toContain(".roundel { width: 40px; height: 40px; }");
    expect(html).not.toContain(".strip .identity { grid-column: 1 / -1; }");
  });

  test("Thermal rows render at no more than 64 pixels across the frozen widths", () => {
    const rows = measureThermalRowHeights();
    for (const width of [320, 390, 590, 720]) {
      expect(rows[width]!.viewport).toBe(width);
      expect(rows[width]!.height).toBeGreaterThan(0);
      expect(rows[width]!.height).toBeLessThanOrEqual(64);
    }
  }, 20_000);

  test("Queue renders trusted FIFO receipts, duplicates, truncation and bottom-only Refresh", () => {
    const payload = fixture("queue");
    Object.assign(payload.module, {
      state: "known", freshness: "fresh", sourceObservedAt: "2026-08-31T12:00:00.000Z",
      checkedAt: "2026-08-31T12:00:00.000Z", receivedAt: "2026-08-31T12:00:00.000Z",
      queueState: "paused", totalCount: 101, truncated: true, reason: null,
      items: Array.from({ length: 100 }, (_, index) => ({ position: index + 1,
        filename: index < 2 ? "duplicate.gcode" : `fixture ${index + 1}.gcode`,
        timeAdded: index === 0 ? "2026-08-31T11:59:00.000Z" : null,
        timeInQueueSeconds: index === 0 ? 60 : null,
      })),
    });
    const markup = mount({ toolOutput: payload }).modules.innerHTML;
    expect(markup).toContain("Print Queue state"); expect(markup).toContain("Paused");
    expect(markup).toContain("101 jobs"); expect(markup).toContain("Showing 100 of 101");
    expect(markup).toContain("1 job is not displayed");
    expect((markup.match(/duplicate\.gcode/g) ?? []).length).toBe(2);
    expect(markup).toContain("Waited at observation 1m");
    const visibleText = markup.replace(/<[^>]+>/g, " ");
    expect(visibleText).not.toMatch(/\bETA\b|starts? in|live clock/i);
    expect(markup.indexOf("Observed ")).toBeLessThan(markup.indexOf("duplicate.gcode"));
    expect(markup.indexOf("duplicate.gcode")).toBeLessThan(markup.indexOf("<footer"));
  });

  test("Queue distinguishes observed empty, retained stale empty and all non-observations", () => {
    const empty = fixture("queue"); Object.assign(empty.module, { state: "known", freshness: "fresh", sourceObservedAt: "2026-08-31T12:00:00.000Z", queueState: "ready", totalCount: 0, truncated: false, reason: null });
    expect(mount({ toolOutput: empty }).modules.innerHTML).toContain("Print queue empty");
    const stale = structuredClone(empty); Object.assign(stale.module, { state: "stale", freshness: "stale", reason: "timeout" });
    const staleMarkup = mount({ toolOutput: stale }).modules.innerHTML;
    expect(staleMarkup).toContain("Last observed print queue was empty"); expect(staleMarkup).toContain("last observed print queue");
    for (const [state, reason, label] of [["unknown", "not_requested", "Print Queue not observed"], ["unsupported", "unsupported", "Print Queue endpoint unsupported"], ["unavailable", "network", "Print Queue unavailable"]]) {
      const unavailable = fixture("queue"); Object.assign(unavailable.module, { state, reason, sourceObservedAt: null, queueState: null, totalCount: null, truncated: false, items: [] });
      const markup = mount({ toolOutput: unavailable }).modules.innerHTML;
      expect(markup).toContain(label); expect(markup).not.toContain("Print queue empty");
    }
  });

  test("Queue fails closed for malformed host payloads and escapes filenames", () => {
    const unsafe = fixture("queue"); Object.assign(unsafe.module, { state: "known", freshness: "fresh", sourceObservedAt: "2026-08-31T12:00:00.000Z", queueState: "ready", totalCount: 1, truncated: false, reason: null,
      items: [{ position: 1, filename: '<img src=x onerror="private()">.gcode', timeAdded: null, timeInQueueSeconds: 0 }],
    });
    const escaped = mount({ toolOutput: unsafe }).modules.innerHTML;
    expect(escaped).toContain("Print Queue unavailable"); expect(escaped).not.toContain("&lt;img"); expect(escaped).not.toContain("<img src=x");
    for (const mutation of [{ totalCount: -1 }, { totalCount: 1, items: [] }, { queueState: "idle" }, { totalCount: 1, items: [{ position: 2, filename: "a.gcode" }] }]) {
      const malformed = structuredClone(unsafe); Object.assign(malformed.module, mutation);
      const markup = mount({ toolOutput: malformed }).modules.innerHTML;
      expect(markup).toContain("Print Queue unavailable"); expect(markup).not.toContain("Print queue empty");
    }
    const unsupported = fixture("queue"); Object.assign(unsupported.module, { state: "unsupported", reason: "unsupported", sourceObservedAt: null, queueState: null, totalCount: null, truncated: false, items: [] });
    const unsupportedMarkup = mount({ toolOutput: unsupported }).modules.innerHTML;
    expect(unsupportedMarkup).toContain("Print Queue endpoint unsupported");
    expect(unsupportedMarkup).not.toMatch(/printer (?:does not|did not) support/i);
  });
});

describe("reported bed mesh widget", () => {
  const receipt = "2026-08-31T12:34:56.000Z";
  const mesh = (matrix: unknown = [[-0.2, 0, 0.1], [0.3, -0.1, 0.4]]) => normalizeBedMeshResponse({ result: { status: { bed_mesh: {
    profile_name: "Fixture", mesh_min: [10, 20], mesh_max: [110, 220], probed_matrix: matrix,
  } } } }, receipt);
  const data = (module: Payload) => fixture("bed_mesh", { freshness: "offline", sourceObservedAt: null, module: { ...module, kind: "bed_mesh" } });

  test("renders reported rectangular grid in XY orientation with own receipt and numeric summary", async () => {
    const card = mount({ toolOutput: data(mesh()) });
    await card.initialize();
    card.mode2d.emit("click");
    const markup = card.modules.innerHTML;
    expect(markup).toContain("Reported probe grid · 3 × 2");
    expect(markup).toContain("-0.200 mm"); expect(markup).toContain("0.400 mm"); expect(markup).toContain("0.600 mm");
    expect(markup).toContain('data-row="1" data-column="0" x="60" y="18"');
    expect(markup).toContain('data-row="0" data-column="0" x="60" y="113"');
    expect(markup).toContain("X 10.000 mm, Y 220.000 mm, Z 0.300 mm");
    expect(markup).toContain("X (mm)"); expect(markup).toContain("Y (mm)");
    const top = markup.match(/<header [\s\S]*?<\/header>/)![0];
    expect(top).toContain("Observed "); expect(top).not.toContain("Offline");
    expect(markup.match(/<rect class="mesh-cell" /g)).toHaveLength(6);
    expect(markup).toContain('tabindex="0"');
    expect(markup.match(/<footer [\s\S]*?<\/footer>/)![0]).not.toMatch(/Observed|mm|Stale/);
    const pending = card.controls.refresh(); await tick();
    const request = card.sent.find(item => item.method === "tools/call")!;
    expect(request.params).toEqual({ name: "refresh_printer_observation", arguments: { view: "bed_mesh" } });
    card.respond(request, { structuredContent: data(mesh()) }); await pending;
  });
  test("all-zero is uniform valid data and maximum matrix remains bounded", () => {
    const zero = mount({ toolOutput: data(mesh([[0, 0], [0, 0]])) }).modules.innerHTML;
    expect(zero).toContain("0.000 mm"); expect(zero).not.toMatch(/NaN|Infinity|unavailable/);
    expect(new Set([...zero.matchAll(/fill="(hsl[^\"]+)"/g)].map(match => match[1])).size).toBe(1);
    const largestCard = mount({ toolOutput: data(mesh(Array.from({ length: BED_MESH_MAX_DIMENSION }, () => Array(BED_MESH_MAX_DIMENSION).fill(0)))) });
    largestCard.mode2d.emit("click");
    expect(largestCard.modules.innerHTML.match(/<rect class="mesh-cell" /g)).toHaveLength(4096);
    const invalid = mount({ toolOutput: data(mesh([[0, 0], [0, NaN]])) }).modules.innerHTML;
    expect(invalid).toContain("Bed Mesh unavailable"); expect(invalid).not.toContain('<rect class="mesh-cell"');
  });
  test("compacts extreme axis labels while preserving exact accessible bounds and quiet visible content", () => {
    const value = mesh();
    value.bounds = { xMin: -999999.123456, xMax: 999999.987654, yMin: -999999.123456, yMax: 999999.987654 };
    const card = mount({ toolOutput: data(value) }, 320); card.mode2d.emit("click");
    const markup = card.modules.innerHTML;
    const labels = [...markup.matchAll(/<text [^>]*>([^<]+)<\/text>/g)].map(match => match[1]);
    expect(labels).toEqual(["1.00e6", "-1.00e6", "Y (mm)", "-1.00e6", "1.00e6", "X (mm)"]);
    expect(markup).toContain("X -999999.123456 to 999999.987654 mm, Y -999999.123456 to 999999.987654 mm");
    expect(markup).toContain("Observation time is the server receipt, not a new calibration or probe capture time.");
    expect(markup).not.toContain('class="mesh-note"');
    expect(markup).not.toContain("<p>Reported grid values");
  });
  test("inactive, stale inactive, unsupported and unknown never become flat measured grids", () => {
    const inactive = { ...mesh(), status: "no_active_mesh", matrix: null, bounds: null, summary: null };
    const cases: Array<[Payload, string]> = [
      [inactive, "No active mesh"],
      [{ ...inactive, state: "stale", freshness: "stale", reason: "network" }, "Last observation: no active mesh"],
      [unavailableBedMesh("not_reported"), "Bed mesh not reported"],
      [unavailableBedMesh("not_requested"), "Bed mesh not observed"],
      [unavailableBedMesh("network"), "Bed Mesh unavailable"],
    ];
    for (const [module, expected] of cases) {
      const markup = mount({ toolOutput: data(module) }).modules.innerHTML;
      expect(markup).toContain(expected); expect(markup).not.toContain('<rect class="mesh-cell"');
      if (!module.sourceObservedAt) {
        if (module.state === 'unavailable' || module.state === 'unsupported') expect(markup).toContain('data-observation-placeholder="unavailable"');
        else expect(markup).toContain("Observation time unavailable");
      }
    }
    const stale = mount({ toolOutput: data({ ...mesh(), state: "stale", freshness: "stale", reason: "network" }) }).modules.innerHTML;
    expect(stale.match(/<header [\s\S]*?<\/header>/)![0]).toContain("Refresh unavailable");
    expect(stale).toContain("Stale"); expect(stale).toContain('class="mesh-map"');
  });
  test("untrusted malformed grids and profile injection fail closed without breaking the view", () => {
    for (const matrix of [null, [], [[0, 1]], [[0, 1], [2]], Array.from({ length: 65 }, () => [0, 0]), [[0, 0], [0, Infinity]]]) {
      const markup = mount({ toolOutput: data({ ...mesh(), matrix }) }).modules.innerHTML;
      expect(markup).toContain("Bed mesh unavailable"); expect(markup).not.toContain('<rect class="mesh-cell"');
    }
    const markup = mount({ toolOutput: data({ ...mesh(), profile: '<img src=x onerror="evil()">' }) }).modules.innerHTML;
    expect(markup).not.toContain("evil"); expect(markup).toContain("Reported probe grid");
  });
  test("3D surface preserves reported vertices and uses the bounded automatic display scale", () => {
    const card = mount({ toolOutput: data(mesh()) }); const markup = card.modules.innerHTML;
    expect(html).toContain('class="mesh-three"');
    expect(markup).toContain('class="mesh-map"');
    expect(markup).toContain("Z display ×40");
    expect(markup).not.toMatch(/Height ×|Height exaggerated|mesh-height|mesh-help|Surface connects/);
    const geometry = card.controls.meshGeometry();
    expect(geometry.vertices.map((p: Payload) => [p.x, p.y, p.z])).toEqual([[10, 20, -0.2], [60, 20, 0], [110, 20, 0.1], [10, 220, 0.3], [60, 220, -0.1], [110, 220, 0.4]]);
    expect(card.controls.meshDisplayScale(geometry)).toBeCloseTo(40);
  });
  test("icon-only bottom controls switch exact 2D fallback and Refresh is the only acquisition", async () => {
    const card = mount({ toolOutput: data(mesh()) }); await card.initialize();
    expect(html).toContain(".mesh-chart { position: relative; height: clamp(220px, 48vw, 320px);");
    expect(html).not.toMatch(/\.mesh-chart\[data-mode="(?:2d|3d)"\][^{]*\{[^}]*height:/);
    card.mode2d.emit("click"); expect(card.modules.innerHTML).toContain('class="mesh-map"');
    card.mode3d.emit("click"); expect(card.controls.meshView.mode).toBe("2d");
    card.reset.emit("click");
    expect(card.modules.innerHTML).toContain('aria-label="Show 3D bed mesh"');
    expect(card.modules.innerHTML).toContain('aria-label="Show 2D bed mesh"');
    expect(card.modules.innerHTML).toContain('aria-label="Reset bed mesh view"');
    expect(card.modules.innerHTML).not.toMatch(/>3D surface<|>2D grid<|>Reset view</);
    expect(card.sent.filter(item => item.method === "tools/call")).toHaveLength(0);
    const refresh = card.controls.refresh(); await tick();
    const request = card.sent.find(item => item.method === "tools/call")!;
    expect(request.params).toEqual({ name: "refresh_printer_observation", arguments: { view: "bed_mesh" } });
    card.respond(request, { structuredContent: data(mesh()) }); await refresh;
    expect(card.sent.filter(item => item.method === "tools/call")).toHaveLength(1);
  });
  test("display scale oracle is finite, automatic and bounded for flat and extreme grids", () => {
    for (const bounds of [
      { xMin: -1000000, xMax: 1000000, yMin: -0.00001, yMax: 0.00001 },
      { xMin: 0, xMax: Number.MIN_VALUE, yMin: 0, yMax: Number.MIN_VALUE },
    ]) for (const heights of [[[0, 0], [0, 0]], [[-1000000, 1000000], [0, 0.5]]]) {
      const card = mount({ toolOutput: data({ ...mesh(heights), bounds }) });
      const scale = card.controls.meshDisplayScale(card.controls.meshGeometry());
      expect(Number.isFinite(scale)).toBe(true); expect(scale).toBeGreaterThanOrEqual(1); expect(scale).toBeLessThanOrEqual(300);
      expect(card.modules.innerHTML).not.toMatch(/NaN|Infinity/);
    }
  });
  test("Three renderer uses deterministic adjacent triangles, real Z grid labels and bounded lifecycle", () => {
    expect(html).toContain("new THREE.OrthographicCamera");
    expect(html).toContain("indices.push(a, c, d, a, d, b)");
    expect(html).toContain("for (const value of meshTicks(geometry))");
    expect(html).toContain('label(`${meshAxis(value)} mm`');
    expect(html).toContain("new ResizeObserver(resize)");
    expect(html).toContain("controls.dispose()");
    expect(html).toContain("material.map?.dispose?.()");
    expect(html).toContain("renderer.forceContextLoss?.()");
    expect(html).toContain('new THREE.WebGLRenderer({ antialias: true');
    expect(html).not.toMatch(/meshProjection|meshSurface|height-field painter/);
  });
});

describe("continuous reported print progress", () => {
  function progress(current: unknown, total: unknown, percent: unknown = 67.4, width = 390) {
    const data = fixture("progress");
    data.module.fields.currentLayer.value = current;
    data.module.fields.totalLayers.value = total;
    data.module.fields.percent.value = percent;
    return mount({ toolOutput: data }, width);
  }
  const fills = (markup: string) => [...markup.matchAll(/class="progress-fill" style="width:([\d.e+-]+)%"/g)].map(match => Number(match[1]));

  test("one continuous bar uses only reported percentage at every viewport and layer position", () => {
    for (const width of [320, 390, 720]) for (const current of [0, 1, 126, 460, 461]) {
      const markup = progress(current, 461, 67.4, width).modules.innerHTML;
      expect(fills(markup)).toEqual([67.4]);
      expect(markup).toContain('aria-valuemax="100" aria-valuenow="67.4"');
      expect(markup).toContain(`Layer <strong class="layer-current">${current}</strong> / 461`);
      expect(markup.match(/role="progressbar"/g)).toHaveLength(1);
      expect(markup).not.toMatch(/progress-block|Grouped into/);
    }
    expect(fills(progress(461, 461, 0).modules.innerHTML)).toEqual([0]);
    expect(fills(progress(0, 461, 100).modules.innerHTML)).toEqual([100]);
    expect(fills(progress(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, 2).modules.innerHTML)).toEqual([2]);
  });

  test("invalid or absent percentage remains unknown independently of valid layers", () => {
    for (const percent of [null, NaN, Infinity, "42", -1, 101, {}]) {
      const markup = progress(3, 5, percent).modules.innerHTML;
      expect(fills(markup)).toEqual([]);
      expect(markup).toContain('class="progress-percent unknown">Unknown</strong>');
      expect(markup).toContain('aria-valuetext="Reported progress unavailable"');
      expect(markup).not.toContain("aria-valuenow");
      expect(markup).toContain('Layer <strong class="layer-current">3</strong> / 5');
    }
    const missing = fixture("progress"); delete missing.module.fields.percent.value;
    expect(mount({ toolOutput: missing }).modules.innerHTML).toContain('class="progress-percent unknown">Unknown</strong>');
  });

  test("invalid layers remain explicit without suppressing a valid reported percentage", () => {
    for (const [current, total] of [[null, 461], [126, null], [0, 0], [-1, 461], [462, 461], [1.5, 461], [1, 4.5], ["126", 461], [126, "461"], [NaN, 461], [1, Infinity], [1, Number.MAX_SAFE_INTEGER + 1]]) {
      const markup = progress(current, total, 100).modules.innerHTML;
      expect(fills(markup)).toEqual([100]); expect(markup).toContain("Layer progress unavailable");
    }
    const missing = fixture("progress"); delete missing.module.fields;
    expect(mount({ toolOutput: missing }).modules.innerHTML).toContain("Layer progress unavailable");
  });

  test("100 percent never invents completion and only supported lower metrics appear", () => {
    const data = fixture("progress"); data.module.fields.percent.value = 100;
    let markup = mount({ toolOutput: data }).modules.innerHTML;
    expect(markup).toContain('class="progress-state">Printing</span>'); expect(markup).not.toContain(">Complete<");
    expect(markup).toContain(">Elapsed</dt>"); expect(markup).toContain("<dd>10m</dd>");
    expect(markup).not.toMatch(/>Speed<|>Height<|>Nozzle<|>Bed</);
    data.printerStateLabel = "Complete";
    markup = mount({ toolOutput: data }).modules.innerHTML;
    expect(markup).toContain('class="progress-state">Complete</span>');
    data.module.fields.elapsedSeconds.value = null; data.module.fields.estimatedRemainingSeconds.value = -10;
    markup = mount({ toolOutput: data }).modules.innerHTML;
    expect(markup).not.toContain('class="progress-metrics"'); expect(markup).toContain("Estimate unknown");
  });

  test("white surface, library icons and thin track remain stable in a dark host", () => {
    expect(html).toContain("color-scheme: light;"); expect(html).not.toContain("prefers-color-scheme: dark");
    expect(html).toContain("--surface: var(--u1-surface);"); expect(html).toContain(".progress-track { height: 8px;");
    expect(html).toContain("Feather Icons v4.29.2"); expect(html).toContain("Copyright (c) 2013-2023 Cole Bemis");
    const markup = progress(3, 5).modules.innerHTML;
    expect(markup).toContain('data-icon="feather-printer"');
  });

  test("large progress percentage meets 3:1 contrast against the actual card surface", () => {
    const token = (name: string) => {
      const value = html.match(new RegExp(`--u1-${name}:\\s*(#[0-9a-f]{3,6});`, "i"))?.[1];
      expect(value).toBeDefined();
      return value!;
    };
    const luminance = (hex: string) => {
      const digits = hex.slice(1);
      const expanded = digits.length === 3 ? [...digits].map(digit => digit + digit).join("") : digits;
      const channels = expanded.match(/../g)!.map(pair => Number.parseInt(pair, 16) / 255)
        .map(channel => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
      return channels.reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index]!, 0);
    };
    const foreground = luminance(token("positive"));
    const background = luminance(token("surface"));
    const contrast = (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05);
    expect(html.match(/\.progress-percent \{[^}]+\}/)?.[0]).toContain("color: var(--positive)");
    expect(contrast).toBeGreaterThanOrEqual(3);
  });

  test("resizing leaves state, source time, refresh failures and request count unchanged", async () => {
    const card = progress(126, 461); await card.initialize();
    const initial = card.modules.innerHTML;
    const refresh = card.controls.refresh(); await tick();
    const requests = card.sent.length; card.resize(720);
    expect(fills(card.modules.innerHTML)).toEqual([67.4]); expect(card.button.disabled).toBe(true);
    expect(card.modules.innerHTML).toBe(initial); expect(card.sent).toHaveLength(requests);
    await card.advance(15001); await refresh;
    const failure = card.error.textContent; expect(failure).toMatch(/Refresh failed/);
    card.resize(390); expect(card.error.textContent).toBe(failure); expect(card.button.disabled).toBe(false);
    expect(card.modules.innerHTML).toBe(initial); expect(card.sent).toHaveLength(requests);
  });
});

describe("printer-reported material widget", () => {
  const materialFixture = (state = "known", reason: string | null = null) => {
    const materials = normalizeMaterialResponse({ result: { status: { print_task_config: {
      filament_exist: [true, false, true, null], filament_vendor: ["Fixture", "NONE", "Generic", "Other"],
      filament_type: ["PLA", "NONE", "PETG", "ABS"], filament_sub_type: ["Matte", "NONE", "", ""],
      filament_color_rgba: ["FFFFFFFF", "00000000", "000000FF", "6F4C2FFF"],
    } } } }, "2026-08-31T10:00:00.000Z");
    const field = (value: unknown) => ({ state: value === null ? "unknown" : state, value });
    return fixture("heads", { module: {
      kind: "heads", state: "known", materials: { ...materials, state, reason },
      items: materials.items.map((item) => ({
        physicalTool: item.physicalTool,
        material: field(item.type ? [item.vendor, item.type, item.subtype].filter(Boolean).join(" ") : null),
        vendor: field(item.vendor), materialType: field(item.type), subtype: field(item.subtype), color: field(item.color), reportedPresence: field(item.reportedPresence),
        temperature: { state: "known", value: 220 }, target: { state: "known", value: 220 },
        active: { state: "known", value: item.physicalTool === 1 }, headState: { state: "known", value: "PARKED" },
      })),
    } });
  };

  test("renders four physical slots with presence-first loaded, empty and unknown material states", () => {
    const card = mount({ toolOutput: materialFixture() });
    const rendered = card.modules.innerHTML;
    expect((rendered.match(/class="head-card/g) ?? [])).toHaveLength(4);
    for (const label of ["T1", "T2", "T3", "T4", "Fixture PLA Matte", "Generic PETG", "Empty", "N/A", "#FFFFFFFF", "#000000FF", "Active"]) expect(rendered).toContain(label);
    expect(rendered).not.toMatch(/No filament reported|Filament reported present|Presence unknown|Other ABS|#6F4C2FFF|NONE/);
    expect(rendered).toContain("Printer-reported material");
    expect(rendered).toContain('style="background-color:#FFFFFFFF"');
    expect(rendered).not.toContain("NONE");
    const expectedTime = new Date("2026-08-31T10:00:00.000Z").toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    expect(rendered).toContain(`Printer-reported material · Observed ${expectedTime}`);
    expect(rendered.indexOf("Printer-reported material")).toBeLessThan(rendered.indexOf("<footer"));
  });

  test("fresh thermals do not hide stale material or refresh failure", () => {
    const rendered = mount({ toolOutput: materialFixture("stale", "network") }).modules.innerHTML;
    expect(rendered).toContain("Stale material data");
    expect(rendered).toContain("Refresh failed; last observation retained");
    expect(rendered).toContain("Fixture PLA Matte");
    expect(rendered).toContain("220°");
    for (const state of ["unknown", "unsupported", "unavailable"]) {
      const data = materialFixture(); data.module.materials = { state, sourceObservedAt: null }; data.module.items = [];
      const missing = mount({ toolOutput: data }).modules.innerHTML;
      expect(missing).toContain(`Material data ${state}`);
      expect(missing).toContain("Printer-reported material · Observation time unavailable");
      expect((missing.match(/>N\/A</g) ?? []).length).toBeGreaterThanOrEqual(4);
    }
  });

  test("partial labels retain the reported subtype and explicitly name missing vendor and material", () => {
    const data = materialFixture();
    data.module.items[0].material.value = null;
    data.module.items[0].vendor.value = null;
    data.module.items[0].materialType.value = null;
    expect(mount({ toolOutput: data }).modules.innerHTML).toContain('class="material">N/A N/A Matte</div>');
    data.module.items[0].materialType.value = "PLA";
    expect(mount({ toolOutput: data }).modules.innerHTML).toContain('class="material">N/A PLA Matte</div>');
  });

  test("malicious host-delivered colors are not CSS and labels cannot inject HTML", async () => {
    const data = materialFixture();
    data.module.items[0].color.value = "#ff0000;background-image:url(https://private.invalid)";
    data.module.items[0].vendor.value = '<img src="https://private.invalid" onerror="alert(1)">';
    data.module.items[1].physicalTool = '<img onerror="alert(1)">';
    const card = mount({ toolOutput: data });
    expect(card.modules.innerHTML).toContain("N/A");
    expect(card.modules.innerHTML).toContain("&lt;img");
    expect(card.modules.innerHTML).not.toMatch(/background-image|<img|onerror="|class="material-swatch"[^>]*https:/);
    await card.initialize();
    const refreshing = card.controls.refresh(); await tick();
    const request = card.sent.find(item => item.method === "tools/call")!;
    expect(request.params).toEqual({ name: "refresh_printer_observation", arguments: { view: "heads" } });
    card.respond(request, { structuredContent: materialFixture() }); await refreshing;
    expect(card.modules.innerHTML).toContain("Fixture PLA Matte");
  });

  test("each actual RGB or RGBA color drives only a weak solid card wash and the exact swatch", () => {
    const cases = [
      ["#ffffff", "#FFFFFF"], ["#000000", "#F0F0F0"], ["#6f4c2f", "#F6F4F3"],
      ["#ff0000", "#FFF0F0"], ["#00ff00", "#F0FFF0"], ["#0000ff", "#F0F0FF"],
      ["#12345600", "#FFFFFF"], ["#00000080", "#F7F7F7"], ["#FFFFFFFF", "#FFFFFF"],
    ];
    for (const [color, tint] of cases) {
      const data = materialFixture(); data.module.items[0].color.value = color;
      const rendered = mount({ toolOutput: data }).modules.innerHTML;
      const card = rendered.match(/<article class="head-card u1-data-row active"[\s\S]*?<\/article>/)![0];
      expect(card).toContain(`aria-label="Tool 1" style="background-color:${tint}"`);
      expect(card).toContain(`class="material-swatch" aria-hidden="true" style="background-color:${color!.toUpperCase()}"`);
      expect(card).toContain(`data-color="${color!.toUpperCase()}"`);
      expect(card).toContain(`Copy Tool 1 color ${color!.toUpperCase()}`);
      expect(card).not.toMatch(/opacity|gradient|filter:/);
    }
    const data = materialFixture(); data.module.items[0].active.value = false;
    expect(mount({ toolOutput: data }).modules.innerHTML).toContain('aria-label="Tool 1" style="background-color:#FFFFFF"');
    expect(html.match(/\.head-card \{[^}]+\}/)?.[0]).toContain("background: var(--soft)");
    expect(html.match(/\.head-card\.active \{[^}]+\}/)?.[0]).not.toMatch(/background|opacity/);
  });

  test("missing, invalid and untrusted-state colors stay neutral without a copy action", () => {
    for (const raw of [null, "red", "#FFF", "#1234567", " #ffffff", "#ffffff\" onclick=\"bad", 123456]) {
      const data = materialFixture(); data.module.items[0].color.value = raw;
      const markup = mount({ toolOutput: data }).modules.innerHTML.match(/<article class="head-card u1-data-row active"[\s\S]*?<\/article>/)![0];
      expect(markup).toContain("N/A");
      expect(markup).not.toMatch(/style=|class="material-copy"|class="material-swatch"/);
    }
    const data = materialFixture(); data.module.items[0].color.state = "unknown";
    expect(mount({ toolOutput: data }).copyButtons).toHaveLength(1);
  });

  test("reference card hierarchy keeps identity, state, presence and current-target temperatures independent", () => {
    const data = materialFixture();
    data.module.items[0].temperature.value = 25; data.module.items[0].target.value = 0;
    data.module.items[1].temperature.value = null; data.module.items[1].target.value = null;
    data.module.items[2].active.value = null; data.module.items[2].headState.value = null;
    const rendered = mount({ toolOutput: data }).modules.innerHTML;
    const cards = [...rendered.matchAll(/<article class="head-card[\s\S]*?<\/article>/g)].map(match => match[0]);
    expect(cards[0]).toContain('<strong>T1</strong><span class="head-state">Active</span>');
    expect(cards[1]).toContain('<span class="head-state">Parked</span>');
    expect(cards[2]).toContain('<span class="head-state">Unknown</span>');
    expect(cards[0]).toContain("25° / 0°"); expect(cards[1]).toContain("Unknown / Unknown");
    expect(cards[0]).toContain('aria-label="Current 25°, target 0° Celsius"');
    for (const card of cards) {
      expect(card.indexOf('class="head-heading"')).toBeLessThan(card.indexOf('class="material"'));
      expect(card.indexOf('class="material"')).toBeLessThan(card.indexOf('class="temperature"'));
      expect(card.indexOf('class="temperature"')).toBeLessThan(card.indexOf('class="material-color"'));
    }
    expect(rendered.indexOf('aria-label="Refresh observation"')).toBeGreaterThan(rendered.lastIndexOf("</article>"));
    expect(html).toContain('@media (min-width: 760px) { .head-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); } }');
    expect(html).toContain('@media (max-width: 340px) { .head-grid, .overview-grid { grid-template-columns: minmax(0, 1fr); } }');
    expect(html.match(/\.material-copy \{[^}]+\}/)?.[0]).toMatch(/width: 44px; min-height: 44px/);
    expect(html).toContain('.material-copy:focus-visible { outline: 3px solid #64748b; outline-offset: 3px; }');
    expect(html).toContain('data-icon="feather-copy"');
  });

  test("copy writes the exact current normalized color only after a click, then announces actual success", async () => {
    const writes: string[] = [];
    let resolveCopy!: () => void;
    const card = mount({ toolOutput: materialFixture() }, 720, "modern", {
      writeText: (value: string) => { writes.push(value); return new Promise<void>(resolve => { resolveCopy = resolve; }); },
    });
    await card.initialize();
    expect(writes).toEqual([]);
    const button = card.copyButtons[1]!;
    button.emit("click");
    expect(writes).toEqual(["#000000FF"]);
    expect(button.disabled).toBe(true); expect(button.attributes["aria-busy"]).toBe("true");
    expect(button.feedback.textContent).toBe("Copying color…");
    button.emit("click"); expect(writes).toHaveLength(1);
    resolveCopy(); await tick();
    expect(button.feedback.textContent).toBe("Copied #000000FF");
    expect(button.disabled).toBe(false); expect(button.attributes["aria-busy"]).toBe("false");
    expect(card.sent.filter(item => item.method === "tools/call")).toHaveLength(0);
    expect(card.modules.innerHTML).toContain('role="status" aria-live="polite"');
  });

  test("clipboard denial, synchronous failure and absence keep manual-copy guidance without false success", async () => {
    for (const clipboard of [undefined, {}, { writeText: () => Promise.reject(new Error("Permission denied")) }, { writeText: () => { throw new Error("Permission denied"); } }]) {
      const card = mount({ toolOutput: materialFixture() }, 390, "modern", clipboard);
      const button = card.copyButtons[0]!; button.emit("click"); await tick();
      expect(button.feedback.textContent).toMatch(/Copy unavailable here|Couldn’t copy/);
      expect(button.feedback.textContent).toContain("Select the color code");
      expect(button.feedback.textContent).not.toContain("Copied");
      expect(button.disabled).toBe(false);
      expect(card.sent.filter(item => item.method === "tools/call")).toHaveLength(0);
    }
  });

  test("a late clipboard completion cannot announce success on a newer observation", async () => {
    let resolveCopy!: () => void;
    let heightUpdates = 0;
    const card = mount({ toolOutput: materialFixture(), notifyIntrinsicHeight: () => { heightUpdates++; } }, 720, "modern", {
      writeText: () => new Promise<void>(resolve => { resolveCopy = resolve; }),
    });
    const old = card.copyButtons[0]!; old.emit("click");
    const replacement = materialFixture(); replacement.module.items[0].color.value = "#123456";
    card.deliver({ structuredContent: replacement });
    const current = card.copyButtons[0]!; const before = heightUpdates;
    resolveCopy(); await tick();
    expect(current.dataset.color).toBe("#123456"); expect(current.feedback.textContent).toBe("");
    expect(old.feedback.textContent).toBe("Copying color…"); expect(heightUpdates).toBe(before);
  });
});
