import { describe, expect, test } from "bun:test";

import {
  CameraRelayClaimError,
  CameraRelayService,
  type CameraTicketCodec,
} from "./application/camera-relay.js";

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
    `https://relay.example/media/camera.mjpeg?ticket=${token}`,
};

describe("camera relay application service", () => {
  test("issues a short-lived ticket that can be claimed only once", () => {
    let now = Date.parse("2026-08-25T20:00:00.000Z");
    const relay = new CameraRelayService(
      { readFrame: async () => ({ bytes: new Uint8Array([1]), observedAt: "now" }) },
      codec(["one-time"]),
      { now: () => now, ticketTtlMilliseconds: 1_000 }
    );

    const opened = relay.open(locator);
    expect(opened).toEqual({
      url: "https://relay.example/media/camera.mjpeg?ticket=one-time",
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
      { readFrame: async () => ({ bytes: new Uint8Array([1]), observedAt: "now" }) },
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

  test("serializes frame reads and waits between completed observations", async () => {
    let reads = 0;
    let concurrent = 0;
    let maximumConcurrent = 0;
    const waits: number[] = [];
    const relay = new CameraRelayService(
      {
        readFrame: async () => {
          concurrent += 1;
          maximumConcurrent = Math.max(maximumConcurrent, concurrent);
          concurrent -= 1;
          reads += 1;
          return {
            bytes: new Uint8Array([reads]),
            observedAt: `frame-${reads}`,
          };
        },
      },
      codec(["stream"]),
      {
        frameIntervalMilliseconds: 250,
        wait: async (milliseconds, signal) => {
          waits.push(milliseconds);
          if (waits.length === 2) signal.throwIfAborted();
        },
      }
    );
    relay.open(locator);
    const lease = relay.claim("stream");
    const abortController = new AbortController();
    const frames: number[] = [];
    for await (const frame of lease.frames(abortController.signal)) {
      frames.push(frame.bytes[0] ?? 0);
      if (frames.length === 3) abortController.abort();
    }
    lease.release();

    expect(frames).toEqual([1, 2, 3]);
    expect(waits).toEqual([250, 250]);
    expect(maximumConcurrent).toBe(1);
  });
});
