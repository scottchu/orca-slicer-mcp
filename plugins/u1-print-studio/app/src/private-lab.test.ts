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
      "0842f9b316421886285e6be74b39a92700e508aa8cba48695b59a3446c1a2f5c"
    );
    expect(html).toContain('data-private-lab="directory"');
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
