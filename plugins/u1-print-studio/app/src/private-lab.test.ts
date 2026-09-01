import { describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const html = readFileSync(
  new URL("../public/svelte-bed-mesh-lab.html", import.meta.url),
  "utf8"
);
const appPackage = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8")
) as { scripts: Record<string, string> };

describe("private Svelte Bed Mesh lab package", () => {
  test("freezes one deterministic self-contained static page", () => {
    expect(Buffer.byteLength(html)).toBeLessThanOrEqual(750_000);
    expect(createHash("sha256").update(html).digest("hex")).toBe(
      "744ce87b3510d425dec9248ee55a7770a97ef3f635ec8269d1d31279ea0ff680"
    );
    expect(html).toContain('data-private-lab="bed_mesh"');
    expect(html).toContain('data-chart-frame=""');
    expect(html).not.toMatch(/<script\b[^>]*\bsrc\s*=/i);
    expect(html).not.toMatch(/<link\b[^>]*\brel\s*=\s*["']stylesheet/i);
    expect(html).not.toMatch(
      /<(?:img|audio|video|source|iframe)\b[^>]*\bsrc\s*=\s*["'](?!data:)/i
    );
  });

  test("keeps the generic embed outside production packaging", () => {
    expect(appPackage.scripts["ui:build"]).not.toContain("embed");
    expect(appPackage.scripts["bundle:server"]).not.toContain("embed");
    expect(appPackage.scripts["ui:build:embed"]).toContain("build:embed");
    expect(html).not.toContain("u1-widgets.js");
  });
});
