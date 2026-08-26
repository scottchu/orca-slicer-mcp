import { afterEach, describe, expect, test } from "bun:test";
import { mkdtempSync, readFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  normalizePrinterBaseUrl,
  readLocalConfig,
  writeLocalConfig,
} from "./local-config.js";

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
      schemaVersion: 1,
      printer: { baseUrl: "http://127.0.0.1:7125/" },
    });
    expect(readLocalConfig(configPath)).toEqual({
      schemaVersion: 1,
      printer: { baseUrl: "http://127.0.0.1:7125/" },
    });
    expect(JSON.parse(readFileSync(configPath, "utf8"))).toEqual({
      schemaVersion: 1,
      printer: { baseUrl: "http://127.0.0.1:7125/" },
    });
    if (process.platform !== "win32") {
      expect(statSync(configPath).mode & 0o777).toBe(0o600);
    }
  });
});
