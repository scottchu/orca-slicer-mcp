import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { normalizeBedMeshResponse, BED_MESH_MAX_DIMENSION } from "./adapters/moonraker-bed-mesh.js";
import { unavailableBedMesh } from "./application/bed-mesh-observation.js";

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
  const trackPattern = /<div class="progress-track[\s\S]*?(?=<div class="progress-meta")/;
  const track = {
    get outerHTML() { return modules.innerHTML.match(trackPattern)?.[0] ?? ""; },
    set outerHTML(value: string) { modules.innerHTML = modules.innerHTML.replace(trackPattern, value); },
  };
  const modules = {
    innerHTML: "Waiting for printer observation…",
    querySelectorAll: () => [button],
    querySelector: (selector: string) => selector === ".refresh-error" ? error : selector === ".progress-track" ? track : button,
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
  vm.runInContext(`${source}\n__controls.refresh = refresh; __controls.retry = retryLoad;`, context);
  const message = (data: Payload, sender: unknown = parent) => events.get("message")?.({ data, source: sender });
  const deliver = (result: Payload, sender?: unknown) => message({ jsonrpc: "2.0", method: "ui/notifications/tool-result", params: result }, sender);
  const respond = (request: Payload, result: Payload = {}) => message({ jsonrpc: "2.0", id: request.id, result });
  return {
    sent, modules, button, error, controls, message, deliver, respond,
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
    const markup = card.modules.innerHTML;
    expect(markup).toContain("Reported probe grid · 3 × 2");
    expect(markup).toContain("-0.200 mm"); expect(markup).toContain("0.400 mm"); expect(markup).toContain("0.600 mm");
    expect(markup).toContain('data-row="1" data-column="0" x="60" y="18"');
    expect(markup).toContain('data-row="0" data-column="0" x="60" y="113"');
    expect(markup).toContain("X 10.000 mm, Y 220.000 mm, Z 0.300 mm");
    expect(markup).toContain("X (mm)"); expect(markup).toContain("Y (mm)");
    const top = markup.match(/<header [\s\S]*?<\/header>/)![0];
    expect(top).toContain("Observed "); expect(top).not.toContain("Offline");
    expect(markup.match(/<rect /g)).toHaveLength(6);
    expect(markup).not.toContain("tabindex");
    expect(markup.match(/<footer [\s\S]*?<\/footer>/)![0]).not.toMatch(/Observed|mm|grid|Stale/);
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
    expect(largest.match(/<rect /g)).toHaveLength(4096);
    const invalid = mount({ toolOutput: data(mesh([[0, 0], [0, NaN]])) }).modules.innerHTML;
    expect(invalid).toContain("Bed mesh unavailable"); expect(invalid).not.toContain("<rect ");
  });
  test("compacts extreme axis labels while preserving exact accessible bounds and quiet visible content", () => {
    const value = mesh();
    value.bounds = { xMin: -999999.123456, xMax: 999999.987654, yMin: -999999.123456, yMax: 999999.987654 };
    const markup = mount({ toolOutput: data(value) }, 320).modules.innerHTML;
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
      expect(markup).toContain(expected); expect(markup).not.toContain("<rect ");
      if (!module.sourceObservedAt) expect(markup).toContain("Observation time unavailable");
    }
    const stale = mount({ toolOutput: data({ ...mesh(), state: "stale", freshness: "stale", reason: "network" }) }).modules.innerHTML;
    expect(stale.match(/<header [\s\S]*?<\/header>/)![0]).toContain("Refresh unavailable");
    expect(stale).toContain("Stale"); expect(stale.match(/<rect /g)).toHaveLength(6);
  });
  test("untrusted malformed grids and profile injection fail closed without breaking the view", () => {
    for (const matrix of [null, [], [[0, 1]], [[0, 1], [2]], Array.from({ length: 65 }, () => [0, 0]), [[0, 0], [0, Infinity]]]) {
      const markup = mount({ toolOutput: data({ ...mesh(), matrix }) }).modules.innerHTML;
      expect(markup).toContain("Bed mesh unavailable"); expect(markup).not.toContain("<rect ");
    }
    const markup = mount({ toolOutput: data({ ...mesh(), profile: '<img src=x onerror="evil()">' }) }).modules.innerHTML;
    expect(markup).not.toContain("evil"); expect(markup).toContain("Reported probe grid");
  });
});

describe("segmented layer progress", () => {
  function progress(current: unknown, total: unknown, percent: unknown = 67.4, width = 390) {
    const data = fixture("progress");
    data.module.fields.currentLayer.value = current;
    data.module.fields.totalLayers.value = total;
    data.module.fields.percent.value = percent;
    return mount({ toolOutput: data }, width);
  }
  const fills = (markup: string) => [...markup.matchAll(/class="progress-block-fill" style="width:([\d.e+-]+)%"/g)].map(match => Number(match[1]));

  test("uses one block per layer for small totals without rounding forward", () => {
    for (const [current, total, width] of [[0, 5, 390], [1, 5, 390], [3, 5, 390], [5, 5, 390], [1, 1, 390], [23, 24, 480], [47, 48, 481]]) {
      const markup = progress(current, total, 67.4, width).modules.innerHTML;
      expect(fills(markup)).toEqual(Array.from({ length: total }, (_, index) => index < current ? 100 : 0));
      expect(markup).toContain(`Layer ${current} / ${total}`);
      expect(markup).toContain(`aria-valuemax="${total}" aria-valuenow="${current}"`);
      expect(markup).toContain(`aria-valuetext="Layer ${current} of ${total}"`);
      expect(markup).not.toContain("Grouped into");
    }
  });

  test("caps grouped blocks and represents only the current group fraction", () => {
    for (const width of [390, 720]) {
      const count = width === 390 ? 24 : 48;
      for (const current of [0, 1, 19, 20, 126, 460, 461]) {
        const markup = progress(current, 461, 67.4, width).modules.innerHTML;
        const actual = fills(markup);
        expect(actual).toHaveLength(count);
        for (let index = 0; index < count; index++) {
          const start = Math.floor(index * 461 / count);
          const end = Math.floor((index + 1) * 461 / count);
          expect(actual[index]).toBeCloseTo(Math.max(0, Math.min(1, (current - start) / (end - start))) * 100, 10);
        }
        expect(actual.filter(fill => fill > 0 && fill < 100).length).toBeLessThanOrEqual(1);
        expect(markup.match(/role="progressbar"/g)).toHaveLength(1);
        expect(markup.match(/class="progress-block" aria-hidden="true"/g)).toHaveLength(count);
        expect(markup).toContain(`aria-valuetext="Layer ${current} of 461. Grouped into ${count} blocks"`);
        expect(markup).toContain('class="progress-percent">67.4%</strong>');
        expect(markup).toContain(`Layer ${current} / 461`);
      }
    }
  });

  test("supports huge safe totals with bounded DOM and exact integer group boundaries", () => {
    const total = Number.MAX_SAFE_INTEGER;
    const current = Number(BigInt(total) * 23n / 48n);
    const markup = progress(current, total, 2, 720).modules.innerHTML;
    const actual = fills(markup);
    expect(actual).toHaveLength(48);
    for (let index = 0; index < 48; index++) {
      const start = Number(BigInt(index) * BigInt(total) / 48n);
      const end = Number(BigInt(index + 1) * BigInt(total) / 48n);
      expect(actual[index]).toBeCloseTo(Math.max(0, Math.min(1, (current - start) / (end - start))) * 100, 10);
    }
    expect(actual.slice(0, 23)).toEqual(Array(23).fill(100));
    expect(actual.slice(23)).toEqual(Array(25).fill(0));
    expect(fills(progress(total, total, 100, 720).modules.innerHTML)).toEqual(Array(48).fill(100));
  });

  test("invalid or missing layers remain unavailable despite a reported percentage", () => {
    for (const [current, total] of [[null, 461], [126, null], [0, 0], [-1, 461], [462, 461], [1.5, 461], [1, 4.5], ["126", 461], [126, "461"], [NaN, 461], [1, Infinity], [1, Number.MAX_SAFE_INTEGER + 1], [undefined, undefined]]) {
      const markup = progress(current, total, 100).modules.innerHTML;
      expect(markup).toContain('class="progress-track unavailable"');
      expect(markup).toContain('aria-valuetext="Layer progress unavailable"');
      expect(markup).toContain('<span>Layer progress unavailable</span>');
      expect(markup).not.toContain("aria-valuenow");
      expect(fills(markup)).toEqual([]);
      expect(markup).toContain('class="progress-percent">100%</strong>');
      expect(markup).toContain("Observed ");
      expect(markup).not.toContain("Waiting");
    }
    const unknown = fixture("progress");
    unknown.module.fields.currentLayer.state = "unknown";
    expect(mount({ toolOutput: unknown }).modules.innerHTML).toContain("Layer progress unavailable");
    delete unknown.module.fields;
    expect(mount({ toolOutput: unknown }).modules.innerHTML).toContain("Layer progress unavailable");
  });

  test("keeps reported percentage independent and tolerates malformed percentage fields", () => {
    for (const percent of [null, NaN, Infinity, "42", -1, 101, {}]) {
      const markup = progress(3, 5, percent).modules.innerHTML;
      expect(fills(markup)).toEqual([100, 100, 100, 0, 0]);
      expect(markup).toContain('class="progress-percent">Unknown</strong>');
      expect(markup).toContain('aria-valuenow="3"');
    }
    expect(fills(progress(0, 461, 100).modules.innerHTML)).toEqual(Array(24).fill(0));
    expect(fills(progress(461, 461, 0).modules.innerHTML)).toEqual(Array(24).fill(100));
    const missing = fixture("progress");
    delete missing.module.fields.percent.value;
    expect(mount({ toolOutput: missing }).modules.innerHTML).toContain('class="progress-percent">Unknown</strong>');
  });

  test("feature-detects media-query listeners without blocking initial widget render", () => {
    for (const mode of ["legacy", "static", "absent"] as const) {
      const card = mount({ toolOutput: fixture("progress") }, 390, mode);
      expect(fills(card.modules.innerHTML)).toHaveLength(mode === "absent" ? 48 : 24);
      expect(card.modules.innerHTML).toContain("Observed ");
      const requests = card.sent.length;
      card.resize(720);
      expect(fills(card.modules.innerHTML)).toHaveLength(mode === "static" ? 24 : 48);
      expect(card.sent).toHaveLength(requests);
    }
  });

  test("responsive regrouping preserves refresh state, header errors and no extra calls", async () => {
    const card = progress(126, 461);
    await card.initialize();
    const footer = card.modules.innerHTML.split("<footer ")[1];
    const header = card.modules.innerHTML.split("</header>")[0];
    const refresh = card.controls.refresh();
    await tick();
    const requests = card.sent.length;
    card.resize(720);
    expect(fills(card.modules.innerHTML)).toHaveLength(48);
    expect(card.button.disabled).toBe(true);
    expect(card.button.attributes["aria-busy"]).toBe("true");
    expect(card.modules.innerHTML.split("<footer ")[1]).toBe(footer);
    expect(card.modules.innerHTML.split("</header>")[0]).toBe(header);
    expect(card.sent).toHaveLength(requests);
    await card.advance(15001);
    await refresh;
    const failure = card.error.textContent;
    expect(failure).toMatch(/Refresh failed/);
    card.resize(390);
    expect(fills(card.modules.innerHTML)).toHaveLength(24);
    expect(card.error.textContent).toBe(failure);
    expect(card.modules.innerHTML.split("</header>")[0]).toBe(header);
    expect(card.button.disabled).toBe(false);
    expect(card.modules.innerHTML.split("<footer ")[1]).toBe(footer);
    expect(card.sent).toHaveLength(requests);
    expect(card.modules.innerHTML).not.toMatch(/Read only|Current reading|Printer telemetry/);
  });
});
