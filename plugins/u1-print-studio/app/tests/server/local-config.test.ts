import { afterEach, describe, expect, test } from "bun:test";
import {
  chmodSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  normalizePrinterBaseUrl,
  readLocalConfig,
  readOptionalLocalConfig,
  writeLocalConfig,
} from "../../src/lib/server/local-config.js";

const temporaryDirectories: string[] = [];

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

describe("local-first setup configuration", () => {
  test("accepts private origins and rejects public or proxy-shaped input", () => {
    expect(normalizePrinterBaseUrl("http://192.168.1.20:7125")).toBe(
      "http://192.168.1.20:7125/"
    );
    expect(normalizePrinterBaseUrl("http://u1.local:7125")).toBe(
      "http://u1.local:7125/"
    );
    expect(() => normalizePrinterBaseUrl("https://example.com")).toThrow();
    expect(() => normalizePrinterBaseUrl("http://192.168.1.20/proxy")).toThrow();
    expect(() => normalizePrinterBaseUrl("http://user:secret@192.168.1.20")).toThrow();
  });

  test("writes and rereads one owner-only versioned configuration", () => {
    const directory = mkdtempSync(path.join(tmpdir(), "u1-config-test-"));
    temporaryDirectories.push(directory);
    const configPath = path.join(directory, "nested", "config.json");

    expect(writeLocalConfig("http://127.0.0.1:7125", configPath)).toEqual({
      schemaVersion: 2,
      printer: { baseUrl: "http://127.0.0.1:7125/" },
      camera: { stunUrls: [] },
    });
    expect(readLocalConfig(configPath)).toEqual({
      schemaVersion: 2,
      printer: { baseUrl: "http://127.0.0.1:7125/" },
      camera: { stunUrls: [] },
    });
    expect(JSON.parse(readFileSync(configPath, "utf8"))).toEqual({
      schemaVersion: 2,
      printer: { baseUrl: "http://127.0.0.1:7125/" },
      camera: { stunUrls: [] },
    });
    if (process.platform !== "win32") {
      expect(statSync(configPath).mode & 0o777).toBe(0o600);
    }
  });

  test("migrates schema 1 in memory and preserves explicit STUN on setup rewrites", () => {
    const directory = mkdtempSync(path.join(tmpdir(), "u1-config-stun-test-"));
    temporaryDirectories.push(directory);
    const configPath = path.join(directory, "config.json");
    writeFileSync(configPath, JSON.stringify({
      schemaVersion: 1,
      printer: { baseUrl: "http://127.0.0.1:7125" },
    }), { mode: 0o600 });
    expect(readLocalConfig(configPath).camera.stunUrls).toEqual([]);

    writeLocalConfig("http://127.0.0.1:7125", configPath, {
      stunUrls: ["stun:stun.example:3478"],
    });
    writeLocalConfig("http://u1.local:7125", configPath);

    expect(readLocalConfig(configPath)).toEqual({
      schemaVersion: 2,
      printer: { baseUrl: "http://u1.local:7125/" },
      camera: { stunUrls: ["stun:stun.example:3478"] },
    });
  });

  test("returns null only when an optional server config is absent", () => {
    const directory = mkdtempSync(path.join(tmpdir(), "u1-config-optional-test-"));
    temporaryDirectories.push(directory);
    const configPath = path.join(directory, "missing.json");
    expect(readOptionalLocalConfig(configPath)).toBeNull();
    writeFileSync(configPath, "not json\n", { mode: 0o600 });
    expect(() => readOptionalLocalConfig(configPath)).toThrow(
      "configuration is not valid JSON"
    );
  });

  test("tightens an existing configuration file to owner-only permissions", () => {
    if (process.platform === "win32") return;
    const directory = mkdtempSync(path.join(tmpdir(), "u1-config-mode-test-"));
    temporaryDirectories.push(directory);
    const configPath = path.join(directory, "config.json");
    writeFileSync(configPath, "{}\n", { encoding: "utf8", mode: 0o644 });
    chmodSync(configPath, 0o644);

    writeLocalConfig("http://127.0.0.1:7125", configPath);

    expect(statSync(configPath).mode & 0o777).toBe(0o600);
  });
});
