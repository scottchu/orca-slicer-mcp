import { readFileSync } from "node:fs";

import { describe, expect, test } from "bun:test";

import { buildWidgetVendorBundle, readWidgetSharedCss, readWidgetVendorBundle, THREE_LICENSE_NOTICE } from "./widget-vendor.js";

describe("self-contained bed mesh renderer bundle", () => {
  test("matches the exact pinned local Three.js and OrbitControls build", async () => {
    const html = readFileSync(new URL("../public/widget.html", import.meta.url), "utf8");
    const generated = await buildWidgetVendorBundle();
    expect(readWidgetVendorBundle(html)).toBe(generated);
    expect(generated).toContain('revision:"185"');
    expect(generated).toContain("U1BedMeshThree");
    expect(generated).toStartWith(THREE_LICENSE_NOTICE);
    expect(generated).toContain("Copyright © 2010-2026 three.js authors");
    expect(generated).toContain("The above copyright notice and this permission notice shall be included in");
    expect(generated).not.toMatch(/[ \t]+$/m);
    expect(generated).not.toMatch(/^ +\t/m);
    expect(html).not.toMatch(/(?:src|href)=["']https?:\/\//);
  });

  test("injects the exact shared component source into both widget resources", () => {
    const css = readFileSync(new URL("./widget-shared.css", import.meta.url), "utf8").trim();
    const observation = readFileSync(new URL("../public/widget.html", import.meta.url), "utf8");
    const camera = readFileSync(new URL("../public/camera-widget.html", import.meta.url), "utf8");
    expect(readWidgetSharedCss(observation)).toBe(css);
    expect(readWidgetSharedCss(camera)).toBe(css);
    for (const contract of [".u1-card", ".u1-header", ".u1-body", ".u1-data-row", ".u1-facts", ".u1-footer", ".u1-action"]) {
      expect(css).toContain(contract);
    }
    const withoutShared = (value: string) => value.replace(
      /\/\* BEGIN GENERATED U1 SHARED CSS \*\/[\s\S]*?\/\* END GENERATED U1 SHARED CSS \*\//,
      "",
    );
    const authoritativeLiterals = [
      "#1c1e20", "#6b7077", "#8b8d8e", "#fdfdfd", "#eceef0", "#f8f9fa",
      "#f4b927", "#ff5f28", "#499e69", "#b83232", "rgba(255, 205, 0, 0.9)",
      "0 5px 24px rgba(28, 30, 32, 0.055)",
    ];
    for (const resource of [observation, camera]) {
      for (const literal of authoritativeLiterals) expect(withoutShared(resource)).not.toContain(literal);
    }
  });

  test("locks compact density tokens at 320, 390, 590 and 720 widths", () => {
    const css = readFileSync(new URL("./widget-shared.css", import.meta.url), "utf8");
    const tokens = (block: string) => {
      for (const declaration of block.split("; ")) expect(css).toContain(declaration);
    };
    tokens("--u1-page-x: 18px; --u1-card-x: 24px; --u1-card-top: 24px; --u1-header-body-gap: 18px; --u1-icon-tile-size: 56px; --u1-size-title: 24px; --u1-body-bottom: 18px; --u1-footer-top: 12px; --u1-footer-bottom: 18px; --u1-row-y: 14px; --u1-grid-gap: 12px");
    expect(css).toContain("@media (max-width: 620px)");
    tokens("--u1-page-x: 8px; --u1-card-x: 18px; --u1-card-top: 18px; --u1-header-body-gap: 14px; --u1-icon-tile-size: 44px; --u1-size-title: 20px; --u1-body-bottom: 14px; --u1-footer-top: 10px; --u1-footer-bottom: 14px; --u1-row-y: 12px; --u1-grid-gap: 10px");
    expect(css).toContain("@media (max-width: 480px)");
    tokens("--u1-card-x: 16px; --u1-card-top: 16px; --u1-header-body-gap: 12px; --u1-body-bottom: 12px; --u1-footer-bottom: 12px; --u1-grid-gap: 8px");
    expect(css).toContain("@media (max-width: 340px)");
    tokens("--u1-card-x: 14px; --u1-icon-tile-size: 40px; --u1-size-title: 18px; --u1-row-y: 10px");
    expect(css).toContain("width: var(--u1-icon-tile-size); height: var(--u1-icon-tile-size)");
    expect(css).toContain(".u1-body { min-width: 0; margin: 0 var(--u1-card-x); padding: 0 0 var(--u1-body-bottom); }");
    expect(css).toContain(".u1-meta { margin-top: 4px;");
    expect(css).toContain("/ 1.35 var(--u1-font)");
    expect(css).toContain("--u1-leading-body: 1.4;");
    expect(css).toContain(".progress-instrument .progress-track { height: 8px; }");
    expect(css).toContain(".u1-header-result { grid-column: 2; grid-row: 2; justify-self: stretch; text-align: left; }");
  });
});
