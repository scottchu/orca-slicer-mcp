import { describe, expect, test } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { createCameraIceServerProvider } from "../../src/lib/server/camera-ice-config.js";
import { createServerCameraIceServerProvider } from "../../src/entrypoints/server.js";

describe("camera ICE configuration", () => {
  test("defaults empty and accepts bounded explicit STUN from owner config", () => {
    expect(createCameraIceServerProvider({}).issue()).toEqual([]);
    const provider = createCameraIceServerProvider({}, {
      configuredStunUrls: ["stun:stun.example:3478"],
    });
    expect(provider.hasStun).toBe(true);
    expect(provider.hasTurn).toBe(false);
    expect(provider.issue()).toEqual([
      { urls: ["stun:stun.example:3478"] },
    ]);
  });

  test("mints bounded RFC5766 TURN REST credentials per request", () => {
    const provider = createCameraIceServerProvider({
      U1_STUN_URLS_JSON: '["stun:stun.example:3478"]',
      U1_TURN_URLS_JSON:
        '["turn:relay.example:3478?transport=udp","turns:relay.example:5349?transport=tcp"]',
      U1_TURN_SHARED_SECRET: "fixture-shared-secret-32-bytes!!",
      U1_TURN_CREDENTIAL_TTL_SECONDS: "1800",
    }, {
      now: () => 1_700_000_000_000,
      nonce: () => "fixture-nonce",
    });

    expect(provider.hasTurn).toBe(true);
    expect(provider.turnCredentialTtlSeconds).toBe(1800);
    expect(provider.issue()).toEqual([
      { urls: ["stun:stun.example:3478"] },
      {
        urls: [
          "turn:relay.example:3478?transport=udp",
          "turns:relay.example:5349?transport=tcp",
        ],
        username: "1700001800:fixture-nonce",
        credential: "D9t0qoqkhN9UhHBcnebFL5QtQBk=",
      },
    ]);
    expect(JSON.stringify(provider)).not.toContain("fixture-shared-secret");
  });

  test("fails closed for partial TURN, invalid TTL, credentials in URLs, and malformed STUN", () => {
    expect(() => createCameraIceServerProvider({
      U1_TURN_URLS_JSON: '["turn:relay.example:3478"]',
    })).toThrow("requires both");
    expect(() => createCameraIceServerProvider({
      U1_TURN_SHARED_SECRET: "fixture-shared-secret-32-bytes!!",
    })).toThrow("requires both");
    expect(() => createCameraIceServerProvider({
      U1_TURN_URLS_JSON: '["turn:relay.example:3478"]',
      U1_TURN_SHARED_SECRET: "fixture-shared-secret-32-bytes!!",
      U1_TURN_CREDENTIAL_TTL_SECONDS: "7200",
    })).toThrow("must be an integer");
    expect(() => createCameraIceServerProvider({
      U1_TURN_URLS_JSON: '["turn:user:password@relay.example:3478"]',
      U1_TURN_SHARED_SECRET: "fixture-shared-secret-32-bytes!!",
    })).toThrow("invalid ICE server URL");
    expect(() => createCameraIceServerProvider({
      U1_TURN_URLS_JSON: '["turn:"]',
      U1_TURN_SHARED_SECRET: "fixture-shared-secret-32-bytes!!",
    })).toThrow("invalid ICE server URL");
    expect(() => createCameraIceServerProvider({
      U1_TURN_URLS_JSON: '["turn:relay.example:99999"]',
      U1_TURN_SHARED_SECRET: "fixture-shared-secret-32-bytes!!",
    })).toThrow("invalid ICE server URL");
    expect(() => createCameraIceServerProvider({
      U1_STUN_URLS_JSON: '["https://generic-proxy.example"]',
    })).toThrow("invalid ICE server URL");
  });

  test("lets the remote server use env ICE configuration without a standalone config", () => {
    const directory = mkdtempSync(path.join(tmpdir(), "u1-server-no-config-"));
    try {
      const provider = createServerCameraIceServerProvider({
        U1_PRINT_STUDIO_CONFIG: path.join(directory, "missing.json"),
        U1_STUN_URLS_JSON: '["stun:stun.example:3478"]',
      });
      expect(provider.issue()).toEqual([
        { urls: ["stun:stun.example:3478"] },
      ]);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });
});
