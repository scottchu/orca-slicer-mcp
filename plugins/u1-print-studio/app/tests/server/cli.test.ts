import { afterEach, describe, expect, test } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { runCli } from "../../src/entrypoints/cli.js";
import { writeLocalConfig } from "../../src/lib/server/local-config.js";

const temporaryDirectories: string[] = [];

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

describe("doctor contract reporting", () => {
  test("reports runtime, tool, observation, and camera versions in JSON and text", async () => {
    const directory = mkdtempSync(path.join(tmpdir(), "u1-doctor-test-"));
    temporaryDirectories.push(directory);
    const configPath = path.join(directory, "config.json");
    writeLocalConfig("http://127.0.0.1:7125", configPath);
    const output: string[] = [];
    const originalLog = console.log;
    console.log = (...values: unknown[]) => {
      output.push(values.map(String).join(" "));
    };
    try {
      await runCli(["doctor", "--offline", "--json", "--config", configPath]);
      const json = JSON.parse(output.pop()!) as {
        contract: Record<string, unknown>;
      };
      expect(json.contract).toEqual({
        runtimeVersion: "0.4.18",
        toolSchemaVersion: 18,
        observationWidgetVersion: "observation-v21",
        cameraWidgetVersion: "camera-v17",
      });

      await runCli(["doctor", "--offline", "--config", configPath]);
      expect(output.join("\n")).toContain(
        "0.4.18 / tool schema 18 / observation-v21 / camera-v17"
      );
    } finally {
      console.log = originalLog;
    }
  });
});
