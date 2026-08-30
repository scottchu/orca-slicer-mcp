import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

const monitorSkill = readFileSync(
  new URL("../../skills/u1-monitor-print/SKILL.md", import.meta.url),
  "utf8"
);
const mobileSetupSkill = readFileSync(
  new URL("../../skills/u1-mobile-status-setup/SKILL.md", import.meta.url),
  "utf8"
);
const packagingGuidance = readFileSync(
  new URL("../../PACKAGING.md", import.meta.url),
  "utf8"
);
const pluginManifest = JSON.parse(
  readFileSync(new URL("../../.codex-plugin/plugin.json", import.meta.url), "utf8")
) as {
  interface: { defaultPrompt: string[] };
};

const exclusiveRouting =
  "For standalone camera requests, call only model-visible `open_printer_camera`; never substitute " +
  "`show_u1_status`, `get_u1_status`, app-only `get_u1_camera_frame`, or app-only " +
  "`open_u1_camera_stream`.";
const normalizeWhitespace = (value: string): string =>
  value.replace(/\s+/g, " ").trim();

describe("standalone camera routing guidance", () => {
  test("fails closed instead of substituting the status workflow", () => {
    for (const guidance of [monitorSkill, mobileSetupSkill]) {
      const normalized = normalizeWhitespace(guidance);
      expect(normalized).toContain(exclusiveRouting);
      expect(normalized).toContain(
        "Never open the status card as a camera fallback."
      );
      expect(normalized).toContain(
        "the current MCP connection/descriptor is stale or unavailable"
      );
    }
  });

  test("keeps the documented inventory at three model tools plus five app helpers", () => {
    expect(mobileSetupSkill).toContain(
      "exactly three model-visible\n   tools and exactly five app-only helpers"
    );
    expect(mobileSetupSkill).not.toContain("exactly the four read-only tools");
    expect(mobileSetupSkill).not.toContain("four-tool inventory");
  });

  test("offers the supported focused-camera starter prompt", () => {
    expect(pluginManifest.interface.defaultPrompt).toEqual([
      "Open my printer camera.",
      "Prepare this model for my Snapmaker U1.",
      "Monitor my U1 print with adaptive status cards.",
    ]);
    expect(pluginManifest.interface.defaultPrompt.length).toBeLessThanOrEqual(3);
  });

  test("requires a fresh host process after plugin replacement", () => {
    expect(normalizeWhitespace(packagingGuidance)).toContain(
      "Fully quit and relaunch a host that predates the install before upgrade acceptance; a new task alone is not sufficient evidence."
    );
  });
});
