import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import vm from "node:vm";

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

function mount(openai: Payload = {}) {
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
  const modules = {
    innerHTML: "Waiting for printer observation…",
    querySelectorAll: () => [button],
    querySelector: (selector: string) => selector === ".refresh-error" ? error : button,
  };
  const window = {
    openai, parent, addEventListener: (name: string, callback: (event: any) => void) => events.set(name, callback),
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
    expect(cards[2]!.modules.innerHTML).toContain("Jobs");
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

  test("each focused card owns one bottom timestamp and refresh without permission chrome", () => {
    for (const view of ["overview", "progress", "thermals", "heads", "jobs", "queue", "fans", "bed_mesh"]) {
      const card = mount({ toolOutput: fixture(view) });
      const markup = card.modules.innerHTML;
      expect((markup.match(/<footer /g) ?? []).length).toBe(1);
      expect((markup.match(/aria-label="Refresh observation"/g) ?? []).length).toBe(1);
      expect(markup.indexOf("<footer ")).toBeGreaterThan(markup.indexOf("</header>"));
      expect(markup).toContain("Observed ");
      expect(markup).not.toMatch(/Read only|Current reading|Printer telemetry/);
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
    for (const view of ["queue", "fans", "bed_mesh", "overview"]) {
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
