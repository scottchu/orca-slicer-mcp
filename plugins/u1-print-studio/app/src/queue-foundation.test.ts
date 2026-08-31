import { describe, expect, test } from "bun:test";
import {
  QUEUE_MAX_BYTES, QUEUE_MAX_RAW_ITEMS, QUEUE_MAX_VISIBLE_ITEMS, QUEUE_STATUS_ROUTE,
  normalizeQueueResponse, readMoonrakerQueue,
} from "./adapters/moonraker-queue.js";
import { QUEUE_TTL_MS, unavailableQueue } from "./application/queue-observation.js";

const receipt = "2026-08-31T12:00:00.000Z";
const raw = (queued_jobs: unknown[] = [], queue_state: unknown = "paused") => ({ result: { queue_state, queued_jobs } });
const job = (overrides: Record<string, unknown> = {}) => ({
  filename: "fixtures/cube.gcode", job_id: "private-id", time_added: 0, time_in_queue: 0, ...overrides,
});

describe("queue observation foundation", () => {
  test("not requested, unsupported and unavailable never claim an observed empty queue", () => {
    expect(QUEUE_TTL_MS).toBe(15_000);
    expect(unavailableQueue("not_requested")).toMatchObject({ state: "unknown", checkedAt: null });
    expect(unavailableQueue("unsupported", receipt).state).toBe("unsupported");
    for (const reason of ["unauthorized", "http_error", "timeout", "network", "malformed", "too_large", "not_configured"] as const) {
      expect(unavailableQueue(reason, receipt)).toEqual({ state: "unavailable", freshness: "unknown",
        sourceObservedAt: null, receivedAt: null, checkedAt: receipt, queueState: null,
        items: [], totalCount: null, truncated: false, reason });
    }
  });
  test("accepts all four documented states and observed empty including paused", () => {
    for (const state of ["ready", "loading", "starting", "paused"] as const) {
      expect(normalizeQueueResponse(raw([], state), receipt)).toEqual({ state: "known", freshness: "fresh",
        sourceObservedAt: receipt, receivedAt: receipt, checkedAt: receipt, queueState: state,
        items: [], totalCount: 0, truncated: false, reason: null });
    }
  });
  test("rejects missing, null, coercible and undocumented required fields", () => {
    for (const payload of [null, [], {}, { result: null }, { result: [] }, { result: {} },
      { result: { queue_state: "paused", queued_jobs: null } },
      { result: { queue_state: "paused", queued_jobs: {} } },
      { queue_state: "paused", queued_jobs: [] }, ...[null, 0, "idle", "PAUSED", "", {}, ["paused"]].map(state => raw([], state))]) {
      expect(normalizeQueueResponse(payload, receipt)).toMatchObject({ state: "unavailable", reason: "malformed", totalCount: null, sourceObservedAt: null });
    }
  });
  test("preserves FIFO, duplicate basenames, zero values and optional unknowns without IDs or private paths", () => {
    const result = normalizeQueueResponse(raw([
      job({ filename: "/private/fixture-a/cube.gcode", metadata: { api_key: "fixture-credential" }, url: "https://private.local" }),
      job({ filename: "fixture-b\\cube.gcode", time_added: 12.25, time_in_queue: 3.5 }),
      { filename: "  測試 (2) + cube.gcode  " },
    ]), receipt);
    expect(result.items).toEqual([
      { position: 1, filename: "cube.gcode", timeAdded: "1970-01-01T00:00:00.000Z", timeInQueueSeconds: 0 },
      { position: 2, filename: "cube.gcode", timeAdded: "1970-01-01T00:00:12.250Z", timeInQueueSeconds: 3.5 },
      { position: 3, filename: "測試 (2) + cube.gcode", timeAdded: null, timeInQueueSeconds: null },
    ]);
    expect(JSON.stringify(result)).not.toMatch(/private|fixture-a|fixture-b|job_id|metadata|api_key|credential|url|https|eta/i);
  });
  test("optional invalid times stay unknown, never coerced to zero", () => {
    for (const value of [undefined, null, "0", false, -1, NaN, Infinity, -Infinity, {}, []]) {
      expect(normalizeQueueResponse(raw([job({ time_added: value, time_in_queue: value })]), receipt).items[0])
        .toMatchObject({ timeAdded: null, timeInQueueSeconds: null });
    }
    expect(normalizeQueueResponse(raw([job({ time_added: Number.MAX_VALUE })]), receipt).items[0]?.timeAdded).toBeNull();
  });
  test("bounds basename characters after stripping paths without changing row count", () => {
    const result = normalizeQueueResponse(raw([job({ filename: `fixture/${"a".repeat(200)}.gcode` })]), receipt);
    expect(result.state).toBe("known");
    expect(result.items[0]?.filename).toHaveLength(160);
    expect(result.totalCount).toBe(1);
  });
  test("rejects invalid rows and unsafe display names, never echoes upstream text", () => {
    for (const filename of [null, 0, {}, "", " ", ".", "..", "fixture/", "fixture/..", "a".repeat(4097),
      "https://fixture.local/cube.gcode", "//fixture.local/cube.gcode", "C:\\private\\cube.gcode",
      "<img onerror=x>.gcode", "cube.gcode?api_key=fixture", "api_key-fixture.gcode", "Bearer fixture.gcode",
      "sk-proj-fixturecredential.gcode", "eyJhbGciOiJIUzI1NiJ9.fixture.signature.gcode", "fixture@hostname.gcode",
      ...["\u0000", "\n", "\r", "\u007f", "\u0085", "\u061c", "\u200e", "\u200f", "\u202e", "\u2066", "\u2028", "\u2029"].map(control => `fixture${control}/cube.gcode`)]) {
      const result = normalizeQueueResponse(raw([job({ filename })]), receipt);
      expect(result).toMatchObject({ state: "unavailable", reason: "malformed", items: [], totalCount: null });
      expect(Object.keys(result)).not.toContain("filename");
    }
    for (const row of [null, [], 0, "cube.gcode", {}, { filename: null }]) {
      expect(normalizeQueueResponse(raw([row]), receipt).reason).toBe("malformed");
    }
  });
  test("rejects provider credential shapes in visible, hidden and pre-truncation basenames", () => {
    // Synthetic patterns only; no real credentials or user filenames.
    const names = [
      `ghp_${"a".repeat(36)}.gcode`, `gho_${"a".repeat(36)}.gcode`,
      `github_pat_${"a".repeat(16)}.gcode`, `glpat-${"a".repeat(20)}.gcode`,
      `AKIA${"A".repeat(16)}.gcode`, `ASIA${"A".repeat(16)}.gcode`,
      `xoxb-${"0".repeat(10)}-${"0".repeat(10)}-synthetic.gcode`,
    ];
    for (const name of names) {
      for (const index of [0, QUEUE_MAX_VISIBLE_ITEMS, QUEUE_MAX_RAW_ITEMS - 1]) {
        const jobs = Array.from({ length: index + 1 }, () => job());
        jobs[index] = job({ filename: `fixtures/${name}` });
        const result = normalizeQueueResponse(raw(jobs), receipt);
        expect(result).toMatchObject({ state: "unavailable", reason: "malformed", items: [], totalCount: null });
        expect(JSON.stringify(result)).not.toContain(name);
      }
      for (const filename of [`copy-${name}`, `${"a".repeat(170)}-${name}`]) {
        expect(normalizeQueueResponse(raw([job({ filename })]), receipt)).toMatchObject({ state: "unavailable", items: [] });
      }
    }
  });
  test("provider-shaped filtering preserves ordinary names, short labels, Unicode and duplicate order", () => {
    const names = ["github mount.gcode", "ghp_mount.gcode", "github_pat_mount.gcode", "xoxb-mount.gcode", "AKIA bracket.gcode", "測試 (3).gcode", "測試 (3).gcode"];
    const result = normalizeQueueResponse(raw(names.map(filename => job({ filename }))), receipt);
    expect(result.state).toBe("known");
    expect(result.items.map(item => item.filename)).toEqual(names);
    expect(result.items.map(item => item.position)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });
  test("accepts exactly the raw bound, exposes first 100 plus total/truncation, validates hidden rows", () => {
    const jobs = Array.from({ length: QUEUE_MAX_RAW_ITEMS }, () => job());
    const full = normalizeQueueResponse(raw(jobs), receipt);
    expect(full).toMatchObject({ state: "known", totalCount: 1000, truncated: true });
    expect(full.items).toHaveLength(QUEUE_MAX_VISIBLE_ITEMS);
    expect(full.items[99]?.position).toBe(100);
    expect(normalizeQueueResponse(raw(jobs.slice(0, 100)), receipt).truncated).toBe(false);
    expect(normalizeQueueResponse(raw([...jobs, job()]), receipt).reason).toBe("too_large");
    jobs[999] = job({ filename: null });
    expect(normalizeQueueResponse(raw(jobs), receipt)).toMatchObject({ reason: "malformed", items: [], totalCount: null });
  });
});

describe("fixed read-only queue HTTP adapter using loopback fixtures only", () => {
  test("issues exact GET, rejects redirects, classifies auth/unsupported/server/malformed without raw errors", async () => {
    const requests: string[] = [];
    let code = 200; let body = JSON.stringify(raw());
    const fixture = Bun.serve({ hostname: "127.0.0.1", port: 0, fetch(request) {
      const url = new URL(request.url);
      requests.push(`${request.method} ${url.pathname}${url.search}`);
      expect(request.headers.get("accept")).toBe("application/json");
      expect(request.headers.get("authorization")).toBeNull();
      return new Response(body, { status: code, headers: code === 302 ? { location: "/forbidden" } : {} });
    } });
    try {
      const times = [new Date("2026-08-31T11:59:59.000Z"), new Date(receipt)];
      expect(await readMoonrakerQueue(fixture.url, () => times.shift()!)).toMatchObject({ state: "known",
        queueState: "paused", totalCount: 0, sourceObservedAt: receipt, receivedAt: receipt, checkedAt: receipt });
      for (const [status, reason] of [[404, "unsupported"], [405, "unsupported"], [401, "unauthorized"],
        [403, "unauthorized"], [500, "http_error"], [302, "http_error"], [204, "http_error"]] as const) {
        code = status; body = status === 204 ? "" : "private path /private/fixture api_key=fixture-credential";
        const result = await readMoonrakerQueue(fixture.url, () => new Date(receipt));
        expect(result).toMatchObject({ reason, sourceObservedAt: null, receivedAt: null, checkedAt: receipt, totalCount: null });
        expect(JSON.stringify(result)).not.toMatch(/private|api_key|credential|stack/);
      }
      code = 200;
      for (const badBody of ["malformed upstream credential", "null", JSON.stringify({ result: { queue_state: "paused" } })]) {
        body = badBody;
        expect((await readMoonrakerQueue(fixture.url)).reason).toBe("malformed");
      }
      expect(new Set(requests)).toEqual(new Set([`GET ${QUEUE_STATUS_ROUTE}`]));
      expect(requests).toHaveLength(11);
    } finally { fixture.stop(true); }
  });
  test("accepts exact 512-KiB body and rejects excess including multi-byte content", async () => {
    const valid = JSON.stringify(raw());
    let body = valid + " ".repeat(QUEUE_MAX_BYTES - Buffer.byteLength(valid));
    const fixture = Bun.serve({ hostname: "127.0.0.1", port: 0, fetch() { return new Response(body); } });
    try {
      expect((await readMoonrakerQueue(fixture.url)).state).toBe("known");
      body += " ";
      expect((await readMoonrakerQueue(fixture.url)).reason).toBe("too_large");
      body = "測".repeat(Math.ceil(QUEUE_MAX_BYTES / 3));
      expect((await readMoonrakerQueue(fixture.url)).reason).toBe("too_large");
      body = "x".repeat(QUEUE_MAX_BYTES * 2);
      expect((await readMoonrakerQueue(fixture.url)).reason).toBe("too_large");
    } finally { fixture.stop(true); }
  });
  test("does not inherit HTTP or ALL_PROXY and sends no requests to the proxy", async () => {
    let originReads = 0; let proxyReads = 0;
    const fixture = Bun.serve({ hostname: "127.0.0.1", port: 0, fetch() { originReads++; return Response.json(raw()); } });
    const proxy = Bun.serve({ hostname: "127.0.0.1", port: 0, fetch() { proxyReads++; return new Response("fixture proxy", { status: 407 }); } });
    const names = ["HTTP_PROXY", "HTTPS_PROXY", "ALL_PROXY", "http_proxy", "https_proxy", "all_proxy", "NO_PROXY", "no_proxy"];
    try {
      // Isolate proxy configuration: Bun may cache a process-wide proxy choice
      // after first fetch, even if process.env is subsequently restored.
      const env = { ...process.env };
      for (const name of names) env[name] = name.toLowerCase() === "no_proxy" ? "" : proxy.url.toString();
      const adapter = new URL("./adapters/moonraker-queue.ts", import.meta.url).pathname;
      const child = Bun.spawn([process.execPath, "--no-env-file", "--config=/dev/null", "--eval",
        `import { readMoonrakerQueue } from ${JSON.stringify(adapter)}; process.stdout.write(JSON.stringify(await readMoonrakerQueue(${JSON.stringify(fixture.url.toString())})));`,
      ], { env, stdout: "pipe", stderr: "pipe" });
      const output = await new Response(child.stdout).text();
      expect(await child.exited).toBe(0);
      expect(JSON.parse(output).state).toBe("known");
      expect(originReads).toBe(1); expect(proxyReads).toBe(0);
    } finally {
      fixture.stop(true); proxy.stop(true);
    }
  });
  test("rejects public origin, credentials, arbitrary path/query, fragment and unsupported protocol before contact", async () => {
    let reads = 0;
    const fixture = Bun.serve({ hostname: "127.0.0.1", port: 0, fetch() { reads++; return Response.json(raw()); } });
    try {
      for (const url of ["https://example.com/", "http://8.8.8.8/", "file:///private/fixture", "not a URL",
        `${fixture.url}arbitrary`, `${fixture.url}?query=private`, `${fixture.url}#fragment`,
        fixture.url.toString().replace("http://", "http://fixture:credential@")]) {
        expect(await readMoonrakerQueue(url, () => new Date(receipt))).toMatchObject({ state: "unavailable", reason: "not_configured", checkedAt: receipt });
      }
      expect(reads).toBe(0);
    } finally { fixture.stop(true); }
  });
  test("classifies refused transport without reflecting its origin or raw diagnostics", async () => {
    const fixture = Bun.serve({ hostname: "127.0.0.1", port: 0, fetch() { return Response.json(raw()); } });
    const url = fixture.url;
    fixture.stop(true);
    const result = await readMoonrakerQueue(url, () => new Date(receipt));
    expect(result).toMatchObject({ state: "unavailable", reason: "network", checkedAt: receipt });
    expect(JSON.stringify(result)).not.toMatch(/127\.0\.0\.1|curl|ECONN|http/);
  });
  test("bounds a stalled response to six seconds and does not claim observed empty", async () => {
    let release!: (response: Response) => void;
    const pending = new Promise<Response>(resolve => { release = resolve; });
    const fixture = Bun.serve({ hostname: "127.0.0.1", port: 0, fetch() { return pending; } });
    const started = performance.now();
    try {
      expect(await readMoonrakerQueue(fixture.url, () => new Date(receipt))).toMatchObject({
        state: "unavailable", reason: "timeout", totalCount: null, sourceObservedAt: null, checkedAt: receipt,
      });
      expect(performance.now() - started).toBeLessThan(8000);
    } finally { release(Response.json(raw())); fixture.stop(true); }
  }, 10_000);
});
