import { describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";

const html = readFileSync(
  new URL("../public/svelte-observation-lab.html", import.meta.url),
  "utf8"
);
const appPackage = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8")
) as { scripts: Record<string, string> };

describe("private Svelte observation lab package", () => {
  test("freezes one deterministic self-contained static page", () => {
    expect(Buffer.byteLength(html)).toBeLessThanOrEqual(750_000);
    expect(createHash("sha256").update(html).digest("hex")).toBe(
      "dd4f727d615fc7730db76f96b1b33e1371338b046737afc82d87d12a086b3b67"
    );
    expect(html).toContain('data-route-bootstrap');
    for (const marker of [
      "Overview", "Print Progress", "Thermals", "Heads & Filaments",
      "Current Job", "Job History", "Print Queue", "Fans & Air", "Bed Mesh",
      "Pending lifecycle migration"
    ]) expect(html).toContain(marker);
    expect(html).toContain('data-chart-frame=""');
    expect(html).not.toMatch(/<script\b[^>]*\bsrc\s*=/i);
    expect(html).not.toMatch(/<link\b[^>]*\brel\s*=\s*["']stylesheet/i);
    expect(html).not.toMatch(
      /<(?:img|audio|video|source|iframe)\b[^>]*\bsrc\s*=\s*["'](?!data:)/i
    );
  });

  test("selects exact private paths synchronously before body layout", () => {
    const routeSource = readFileSync(new URL("../ui/src/routes/+page.svelte", import.meta.url), "utf8");
    const appShell = readFileSync(new URL("../ui/src/app.html", import.meta.url), "utf8");
    expect(routeSource).not.toContain("onMount");
    expect(routeSource).not.toContain("<svelte:head>");
    expect(routeSource).toContain("browser ? viewFromPath(window.location.pathname) : undefined");
    expect(routeSource).toContain("data-route-bootstrap");
    expect(routeSource).toContain("SSR emits only a neutral zero-size bootstrap marker");
    expect(appShell.indexOf("document.title = titles[route] ?? 'Observation Lab'")).toBeGreaterThan(0);
    expect(appShell.indexOf("document.title = titles[route] ?? 'Observation Lab'")).toBeLessThan(
      appShell.indexOf("%sveltekit.head%")
    );
  });

  test("contains no acquisition path or non-local request primitive", () => {
    const observationSources = readdirSync(new URL("../ui/src/lib/observation/", import.meta.url))
      .filter((name) => name.endsWith(".svelte") || (name.endsWith(".ts") && !name.endsWith(".test.ts")))
      .map((name) => readFileSync(new URL(`../ui/src/lib/observation/${name}`, import.meta.url), "utf8"))
      .join("\n") + readFileSync(new URL("../ui/src/routes/+page.svelte", import.meta.url), "utf8");
    expect(observationSources).not.toMatch(/\b(?:fetch|WebSocket|EventSource|XMLHttpRequest)\s*\(/);
    expect(observationSources).not.toMatch(/https?:\/\//);
    expect(html).not.toContain("camera-widget");
    expect(html).not.toContain("/dashboard/tools/call");
  });

  test("keeps the generic embed outside production packaging", () => {
    expect(appPackage.scripts["ui:build"]).not.toContain("embed");
    expect(appPackage.scripts["bundle:server"]).not.toContain("embed");
    expect(appPackage.scripts["ui:build:embed"]).toContain("build:embed");
    expect(html).not.toContain("u1-widgets.js");
  });
});
