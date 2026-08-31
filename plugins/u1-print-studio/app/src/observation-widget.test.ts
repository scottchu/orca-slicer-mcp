import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { normalizeBedMeshResponse, BED_MESH_MAX_DIMENSION } from "./adapters/moonraker-bed-mesh.js";
import { unavailableBedMesh } from "./application/bed-mesh-observation.js";
import { normalizeMaterialResponse } from "./adapters/moonraker-materials.js";

// Execute the exact production script against a deterministic host/DOM boundary.
// This is protocol/software evidence, not a browser-layout or mobile test.
const html = readFileSync(new URL("../public/widget.html", import.meta.url), "utf8");
const source = html.split('<script type="module">')[1]!.split("</script>")[0]!;
type Payload = Record<string, any>;
const tick = async () => {
  for (let index = 0; index < 8; index++) await Promise.resolve();
  await new Promise<void>(resolve => setImmediate(resolve));
};

function fixture(view = "queue", extra: Payload = {}): Payload {
  const field = (value: unknown) => ({ state: value === null ? "unknown" : "known", value });
  const module: Payload = {
    kind: view, state: "unknown", capabilityEvidence: "advertised",
    provenance: { source: "not_observed", sourceObservedAt: null, detail: "Data mapping is not implemented." },
    items: [], points: [], current: null, readings: [],
  };
  if (view === "overview") Object.assign(module, { state: "unavailable", status: "deferred", detail: "Overview is deferred." });
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
  return {
    schemaVersion: 2, view, observationVersion: 7,
    sourceObservedAt: "2026-08-31T11:00:00.000Z", receivedAt: "2026-08-31T11:00:00.100Z",
    freshness: "fresh", reachable: true, printerStateLabel: "Printing", module, ...extra,
  };
}

function mount(openai: Payload = {}, width = 720, mediaMode: "modern" | "legacy" | "static" | "absent" = "modern") {
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
  const modules = {
    innerHTML: "Waiting for printer observation…",
    querySelectorAll: (selector: string) => selector === ".refresh" ? [button] : selector === "[data-mesh-mode]" && modules.innerHTML.includes('class="mesh-chart"') ? [mode3d, mode2d] : [],
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
    window, document: { querySelector: () => modules }, __controls: controls,
    setTimeout: (callback: () => void, delay: number) => {
      const id = ++nextTimer;
      timers.set(id, { deadline: now + delay, callback });
      return id;
    },
    clearTimeout: (id: number) => timers.delete(id),
  });
  vm.runInContext(`${source}\n__controls.refresh = refresh; __controls.retry = retryLoad; __controls.meshView = meshView; __controls.meshGeometry = () => meshGeometry; __controls.meshProjection = meshProjection;`, context);
  const message = (data: Payload, sender: unknown = parent) => events.get("message")?.({ data, source: sender });
  const deliver = (result: Payload, sender?: unknown) => message({ jsonrpc: "2.0", method: "ui/notifications/tool-result", params: result }, sender);
  const respond = (request: Payload, result: Payload = {}) => message({ jsonrpc: "2.0", id: request.id, result });
  return {
    sent, modules, button, error, controls, message, deliver, respond, chart, mode3d, mode2d, height, reset,
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
  test("current job and history have separate content and selected-view refresh", async () => {
    const current = fixture("jobs");
    current.module.current = { state: "known", filename: { state: "known", value: "current-only.gcode" }, storageActive: { state: "known", value: true } };
    current.module.history = { items: [{ filename: "old-history.gcode" }] }; // Old payloads must not restore the combined panel.
    const history = fixture("job_history");
    history.module.current = current.module.current; // A foreign field must not leak into this focused view.
    history.module.items = [{ filename: "invented-history.gcode" }];
    for (const data of [current, history]) {
      const card = mount({ toolOutput: data });
      await card.initialize();
      const before = card.modules.innerHTML;
      if (data.view === "jobs") {
        expect(before).toContain("Current Job");
        expect(before).toContain("current-only.gcode");
        expect(before).not.toMatch(/History|history|Previous jobs|old-history.gcode/);
      } else {
        expect(before).toContain("Job History");
        expect(before).toContain("Not implemented yet");
        expect(before).toContain("Observation time unavailable");
        expect(before).not.toMatch(/Observed |current-only.gcode|invented-history.gcode|class="job-current"|No jobs|0 jobs/);
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
    data.module.current = { state: "stale", filename: { state: "stale", value: '<script>unsafe</script>.gcode' }, storageActive: { state: "unknown", value: null } };
    const markup = mount({ toolOutput: data }).modules.innerHTML;
    expect(markup).toContain("&lt;script&gt;unsafe&lt;/script&gt;.gcode");
    expect(markup).not.toContain("<script>");
    expect(markup).toContain("Storage unknown");
    expect(markup).toContain("Stale");
    expect(markup).not.toContain("History");
    data.module.current = null;
    const missing = mount({ toolOutput: data }).modules.innerHTML;
    expect(missing).toContain("Current job identity is unknown.");
    expect(missing).not.toMatch(/No active job|Idle|No jobs/);
  });

  test("cold mount completes a request/response initialization before announcing ready", async () => {
    const card = mount();
    expect(card.sent).toHaveLength(1);
    expect(card.sent[0]!.jsonrpc).toBe("2.0");
    expect(card.sent[0]!.method).toBe("ui/initialize");
    expect(typeof card.sent[0]!.id).toBe("number");
    expect(card.sent[0]!.params.protocolVersion).toBe("2026-01-26");
    expect(card.modules.innerHTML).toContain("Waiting");
    await card.initialize();
    expect(card.sent).toContainEqual(expect.objectContaining({ method: "ui/notifications/initialized" }));
    card.deliver({ structuredContent: fixture("progress") });
    expect(card.modules.innerHTML).toContain("42%");
    expect(card.modules.innerHTML).not.toContain("Waiting");
  });

  test("empty output does not mask either metadata envelope", () => {
    for (const key of ["mcp_tool_result", "call_tool_result"]) {
      const card = mount({ toolOutput: {}, toolResponseMetadata: { [key]: { structuredContent: fixture("queue") } } });
      expect(card.modules.innerHTML).toContain("Queue");
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
    expect(card.modules.innerHTML).toContain("Waiting");
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
      expect(header).toContain(view === "job_history" || view === "bed_mesh" ? "Observation time unavailable" : "Observed ");
      expect(header).toContain('class="refresh-error" role="status"');
      expect(header).not.toContain("<button");
      expect(footer).toMatch(/^<footer class="instrument-footer"><button[\s\S]*<\/button><\/footer>$/);
      expect(footer).not.toMatch(/<time|Observed|refresh-error|freshness-warning|role="status"/);
      expect(markup).toContain(view === "job_history" || view === "bed_mesh" ? "Observation time unavailable" : "Observed ");
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
        expect(markup.match(/<footer [\s\S]*?<\/footer>/)![0]).toBe('<footer class="instrument-footer"><button class="refresh" type="button" aria-label="Retry loading observation">Retry</button></footer>');
      } else {
        expect(markup).toContain("Reopen this card from the conversation");
        expect(markup).not.toContain("<footer");
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

  test("unimplemented domains are named, not empty success or synthetic charts", () => {
    for (const view of ["queue", "fans", "overview"]) {
      const markup = mount({ toolOutput: fixture(view) }).modules.innerHTML;
      expect(markup).toMatch(/Unknown|Unavailable|not implemented|deferred/i);
      if (view !== "overview") expect(markup).toContain("Not implemented yet");
      expect(markup).not.toContain("Waiting");
      expect(markup).not.toContain("mesh-placeholder");
    }
    const thermal = mount({ toolOutput: fixture("thermals") }).modules.innerHTML;
    expect(thermal).not.toContain('class="trace');
    expect(thermal).toContain("220°");
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
    const largest = mount({ toolOutput: data(mesh(Array.from({ length: BED_MESH_MAX_DIMENSION }, () => Array(BED_MESH_MAX_DIMENSION).fill(0)))) }).modules.innerHTML;
    expect(largest.match(/<circle class="mesh-vertex" /g)).toHaveLength(4096);
    expect(largest.match(/<polygon class="mesh-face" /g)).toHaveLength(7938);
    const invalid = mount({ toolOutput: data(mesh([[0, 0], [0, NaN]])) }).modules.innerHTML;
    expect(invalid).toContain("Bed mesh unavailable"); expect(invalid).not.toContain('<rect class="mesh-cell"');
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
      [unavailableBedMesh("network"), "Bed mesh unavailable"],
    ];
    for (const [module, expected] of cases) {
      const markup = mount({ toolOutput: data(module) }).modules.innerHTML;
      expect(markup).toContain(expected); expect(markup).not.toContain('<rect class="mesh-cell"');
      if (!module.sourceObservedAt) expect(markup).toContain("Observation time unavailable");
    }
    const stale = mount({ toolOutput: data({ ...mesh(), state: "stale", freshness: "stale", reason: "network" }) }).modules.innerHTML;
    expect(stale.match(/<header [\s\S]*?<\/header>/)![0]).toContain("Refresh unavailable");
    expect(stale).toContain("Stale"); expect(stale.match(/<circle class="mesh-vertex" /g)).toHaveLength(6);
  });
  test("untrusted malformed grids and profile injection fail closed without breaking the view", () => {
    for (const matrix of [null, [], [[0, 1]], [[0, 1], [2]], Array.from({ length: 65 }, () => [0, 0]), [[0, 0], [0, Infinity]]]) {
      const markup = mount({ toolOutput: data({ ...mesh(), matrix }) }).modules.innerHTML;
      expect(markup).toContain("Bed mesh unavailable"); expect(markup).not.toContain('<rect class="mesh-cell"');
    }
    const markup = mount({ toolOutput: data({ ...mesh(), profile: '<img src=x onerror="evil()">' }) }).modules.innerHTML;
    expect(markup).not.toContain("evil"); expect(markup).toContain("Reported probe grid");
  });
  test("surface uses only adjacent reported vertices and exposes actual XYZ with height disclosure", () => {
    const card = mount({ toolOutput: data(mesh()) }); const markup = card.modules.innerHTML;
    expect(markup).toContain('class="mesh-surface"');
    expect(markup.match(/class="mesh-face"/g)).toHaveLength(4);
    expect(markup.match(/class="mesh-vertex"/g)).toHaveLength(6);
    expect(markup).toContain("X 10.000 mm, Y 20.000 mm, Z -0.200 mm");
    expect(markup).toContain("X 110.000 mm, Y 220.000 mm, Z 0.400 mm");
    expect(markup).toContain("Height exaggerated 100x"); expect(markup).toContain("Z (mm)");
    expect(markup).toContain("Surface connects reported points; it adds no measurements.");
    const geometry = card.controls.meshGeometry();
    expect(geometry.vertices.map((p: Payload) => [p.x, p.y, p.z])).toEqual([[10, 20, -0.2], [60, 20, 0], [110, 20, 0.1], [10, 220, 0.3], [60, 220, -0.1], [110, 220, 0.4]]);
    for (const match of markup.matchAll(/data-vertices="([\d,]+)"/g)) {
      const indices = match[1]!.split(",").map(Number);
      expect(indices).toHaveLength(3); expect(indices.every(i => i >= 0 && i < 6)).toBe(true);
    }
  });
  test("local bottom controls, pointer and keyboard retain camera state across refresh without acquisition", async () => {
    const card = mount({ toolOutput: data(mesh()) }); await card.initialize();
    const before = card.chart.innerHTML;
    card.chart.emit("keydown", { key: "ArrowRight" }); expect(card.chart.innerHTML).not.toBe(before);
    card.height.emit("change", { target: { value: "300" } }); expect(card.modules.innerHTML).toContain("Height exaggerated 300x");
    const state = { ...card.controls.meshView };
    card.deliver({ structuredContent: data(mesh()) }); expect(card.controls.meshView).toEqual(state);
    card.mode2d.emit("click"); expect(card.height.disabled).toBe(true); expect(card.modules.innerHTML).toContain('class="mesh-map"');
    card.mode3d.emit("click"); expect(card.height.disabled).toBe(false);
    card.chart.emit("pointerdown", { pointerId: 1, button: 0, clientX: 50, clientY: 50 });
    card.chart.emit("pointermove", { pointerId: 1, clientX: 75, clientY: 35 });
    expect(card.controls.meshView.yaw).not.toBe(state.yaw);
    card.chart.emit("pointerup");
    for (let i = 0; i < 50; i++) card.chart.emit("keydown", { key: "ArrowUp" });
    expect(card.controls.meshView.pitch).toBeCloseTo(5 * Math.PI / 12);
    for (let i = 0; i < 50; i++) card.chart.emit("keydown", { key: "ArrowDown" });
    expect(card.controls.meshView.pitch).toBeCloseTo(Math.PI / 12);
    card.chart.emit("keydown", { key: "Home" }); expect(card.controls.meshView).toEqual({ mode: "3d", height: 100, yaw: -0.65, pitch: 0.55 });
    card.height.emit("change", { target: { value: "1" } }); expect(card.modules.innerHTML).toContain("Height scale 1x");
    card.reset.emit("click"); expect(card.controls.meshView.height).toBe(100);
    expect(card.sent.filter(item => item.method === "tools/call")).toHaveLength(0);
    const refresh = card.controls.refresh(); await tick();
    const request = card.sent.find(item => item.method === "tools/call")!;
    expect(request.params).toEqual({ name: "refresh_printer_observation", arguments: { view: "bed_mesh" } });
    card.respond(request, { structuredContent: data(mesh()) }); await refresh;
    expect(card.sent.filter(item => item.method === "tools/call")).toHaveLength(1);
  });
  test("projection stays finite and fits extreme or tiny accepted coordinates at every height scale", () => {
    for (const bounds of [
      { xMin: -1000000, xMax: 1000000, yMin: -0.00001, yMax: 0.00001 },
      { xMin: 0, xMax: Number.MIN_VALUE, yMin: 0, yMax: Number.MIN_VALUE },
    ]) for (const heights of [[[0, 0], [0, 0]], [[-1000000, 1000000], [0, 0.5]]]) {
      const card = mount({ toolOutput: data({ ...mesh(heights), bounds }) });
      for (const height of [1, 100, 300]) {
        card.height.emit("change", { target: { value: String(height) } });
        expect(card.chart.innerHTML).not.toMatch(/NaN|Infinity/);
        const p = card.controls.meshProjection(card.controls.meshGeometry(), card.controls.meshView);
        for (const vertex of p.vertices) {
          expect(Number.isFinite(vertex.x) && Number.isFinite(vertex.y) && Number.isFinite(vertex.depth)).toBe(true);
          expect(vertex.x).toBeGreaterThanOrEqual(67); expect(vertex.x).toBeLessThanOrEqual(305);
          expect(vertex.y).toBeGreaterThanOrEqual(42); expect(vertex.y).toBeLessThanOrEqual(224);
        }
      }
    }
  });
  test("height-field painter order puts the nearest triangle last at overlapping screen points", () => {
    const matrix = [[-0.5, 0.8, 0.2], [0.9, -0.9, 0.7], [-0.3, -0.9, -0.9]];
    const card = mount({ toolOutput: data({ ...mesh(matrix), bounds: { xMin: 0, xMax: 200, yMin: 0, yMax: 200 } }) });
    card.height.emit("change", { target: { value: "300" } });
    const hitsAt = (x: number, y: number) => {
      const geometry = card.controls.meshGeometry();
      const projected = card.controls.meshProjection(geometry, card.controls.meshView).vertices;
      const hits: Array<{ indices: string; depth: number }> = [];
      // Inspect actual SVG draw order; interpolate depth at this pixel, never at centroids.
      for (const match of card.chart.innerHTML.matchAll(/class="mesh-face" data-vertices="([\d,]+)"/g)) {
        const [a, b, c] = match[1]!.split(",").map((i: string) => projected[Number(i)]) as Payload[];
        const area = (b!.y - c!.y) * (a!.x - c!.x) + (c!.x - b!.x) * (a!.y - c!.y);
        if (Math.abs(area) < 1e-10) continue;
        const u = ((b!.y - c!.y) * (x - c!.x) + (c!.x - b!.x) * (y - c!.y)) / area;
        const v = ((c!.y - a!.y) * (x - c!.x) + (a!.x - c!.x) * (y - c!.y)) / area;
        const w = 1 - u - v;
        if (Math.min(u, v, w) > 1e-7) hits.push({ indices: match[1]!, depth: u * a!.depth + v * b!.depth + w * c!.depth });
      }
      return hits;
    };
    const regression = hitsAt(172, 63);
    expect(regression.map(hit => hit.indices)).toEqual(["1,2,5", "1,5,4"]);
    expect(regression[1]!.depth).toBeGreaterThan(regression[0]!.depth);
    let overlaps = 0;
    for (const [xMax, yMax] of [[200, 200], [80, 320], [320, 80]]) {
      Object.assign(card.controls.meshGeometry().bounds, { xMax, yMax });
      const geometry = card.controls.meshGeometry();
      for (const p of geometry.vertices) { p.x = p.column * xMax! / 2; p.y = p.row * yMax! / 2; }
      for (const yaw of [-0.65, 0, Math.PI / 4, Math.PI / 2, Math.PI, 3 * Math.PI / 2, 5.1]) {
        card.controls.meshView.yaw = yaw;
        for (const pitch of [Math.PI / 12, 0.55, 5 * Math.PI / 12]) {
          card.controls.meshView.pitch = pitch;
          card.height.emit("change", { target: { value: "300" } });
          for (let x = 73; x <= 301; x += 19) for (let y = 47; y <= 219; y += 17) {
            const hits = hitsAt(x, y);
            if (hits.length < 2) continue;
            overlaps++;
            expect(hits.at(-1)!.depth).toBeCloseTo(Math.max(...hits.map(hit => hit.depth)), 9);
          }
        }
      }
    }
    expect(overlaps).toBeGreaterThan(100);
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
    expect(html).toContain("--surface: #fff;"); expect(html).toContain(".progress-track { height: 8px;");
    expect(html).toContain("Feather Icons v4.29.2"); expect(html).toContain("Copyright (c) 2013-2023 Cole Bemis");
    const markup = progress(3, 5).modules.innerHTML;
    expect(markup).toContain('data-icon="feather-printer"');
  });

  test("large progress percentage meets 3:1 contrast against the actual card surface", () => {
    const token = (name: string) => {
      const value = html.match(new RegExp(`--${name}:\\s*(#[0-9a-f]{3,6});`, "i"))?.[1];
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

  test("renders four physical slots, metadata, safe visible colors and reported presence with its own time", () => {
    const card = mount({ toolOutput: materialFixture() });
    const rendered = card.modules.innerHTML;
    expect((rendered.match(/class="head-card/g) ?? [])).toHaveLength(4);
    for (const label of ["T1", "T2", "T3", "T4", "Fixture PLA Matte", "Generic PETG", "Other ABS", "Material unknown", "#FFFFFFFF", "#000000FF", "#6F4C2FFF", "No filament reported", "Presence unknown", "Active"]) expect(rendered).toContain(label);
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
      expect((missing.match(/Material unknown/g) ?? [])).toHaveLength(4);
    }
  });

  test("partial labels retain the reported subtype and explicitly name missing vendor and material", () => {
    const data = materialFixture();
    data.module.items[0].vendor.value = null;
    data.module.items[0].materialType.value = null;
    expect(mount({ toolOutput: data }).modules.innerHTML).toContain("Vendor unknown Material unknown Matte");
    data.module.items[0].materialType.value = "PLA";
    expect(mount({ toolOutput: data }).modules.innerHTML).toContain("Vendor unknown PLA Matte");
  });

  test("malicious host-delivered colors are not CSS and labels cannot inject HTML", async () => {
    const data = materialFixture();
    data.module.items[0].color.value = "#ff0000;background-image:url(https://private.invalid)";
    data.module.items[0].vendor.value = '<img src="https://private.invalid" onerror="alert(1)">';
    data.module.items[1].physicalTool = '<img onerror="alert(1)">';
    const card = mount({ toolOutput: data });
    expect(card.modules.innerHTML).toContain("Color unknown");
    expect(card.modules.innerHTML).toContain("&lt;img");
    expect(card.modules.innerHTML).not.toMatch(/background-image|<img|onerror="|class="material-swatch"[^>]*https:/);
    await card.initialize();
    const refreshing = card.controls.refresh(); await tick();
    const request = card.sent.find(item => item.method === "tools/call")!;
    expect(request.params).toEqual({ name: "refresh_printer_observation", arguments: { view: "heads" } });
    card.respond(request, { structuredContent: materialFixture() }); await refreshing;
    expect(card.modules.innerHTML).toContain("Fixture PLA Matte");
  });
});
