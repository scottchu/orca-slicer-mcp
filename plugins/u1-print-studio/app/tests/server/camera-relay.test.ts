import { describe, expect, test } from "bun:test";

import {
  CameraRelayClaimError,
  CameraRelayService,
  type CameraTicketCodec,
} from "../../src/lib/server/application/camera-relay.js";

function codec(tokens: string[]): CameraTicketCodec {
  return {
    issue: () => {
      const token = tokens.shift();
      if (!token) throw new Error("No test token available");
      return { token, digest: `digest:${token}` };
    },
    digest: (token) => `digest:${token}`,
  };
}

const locator = {
  locate: (token: string) =>
    `https://relay.example/media/camera.webrtc?ticket=${token}`,
};

describe("camera relay application service", () => {
  test("issues a short-lived ticket that can be claimed only once", () => {
    let now = Date.parse("2026-08-25T20:00:00.000Z");
    const relay = new CameraRelayService(
      codec(["one-time"]),
      { now: () => now, ticketTtlMilliseconds: 1_000 }
    );

    const opened = relay.open(locator);
    expect(opened).toEqual({
      url: "https://relay.example/media/camera.webrtc?ticket=one-time",
      expiresAt: "2026-08-25T20:00:01.000Z",
      maxDurationSeconds: 1800,
    });
    const lease = relay.claim("one-time");
    expect(() => relay.claim("one-time")).toThrow(CameraRelayClaimError);
    lease.release();
    now += 2_000;
  });

  test("distinguishes expired tickets and preserves a ticket while capacity is busy", () => {
    let now = 1_000;
    const relay = new CameraRelayService(
      codec(["first", "second", "expired"]),
      {
        now: () => now,
        ticketTtlMilliseconds: 100,
        maxConcurrentStreams: 1,
      }
    );

    relay.open(locator);
    const first = relay.claim("first");
    relay.open(locator);
    expect(() => relay.claim("second")).toThrow(
      new CameraRelayClaimError("busy")
    );
    first.release();
    const second = relay.claim("second");
    second.release();

    relay.open(locator);
    now += 101;
    expect(() => relay.claim("expired")).toThrow(
      new CameraRelayClaimError("expired")
    );
  });

  test("bounds the active lease duration", () => {
    let now = Date.parse("2026-08-26T16:00:00.000Z");
    const relay = new CameraRelayService(codec(["stream"]), {
      now: () => now,
      maxStreamDurationMilliseconds: 30_000,
    });
    relay.open(locator);
    const lease = relay.claim("stream");
    expect(lease.expiresAt).toBe("2026-08-26T16:00:30.000Z");
    lease.release();
    now += 30_000;
  });
});
