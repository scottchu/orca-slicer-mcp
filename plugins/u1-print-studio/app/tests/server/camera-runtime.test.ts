import { describe, expect, test } from "bun:test";

import {
  cameraMaxViewersFromEnvironment,
  tailscaleHostAddresses,
} from "../../src/lib/server/camera-runtime.js";

describe("camera fan-out runtime configuration", () => {
  test("uses a bounded configurable viewer count", () => {
    expect(cameraMaxViewersFromEnvironment({})).toBe(16);
    expect(cameraMaxViewersFromEnvironment({ U1_CAMERA_MAX_VIEWERS: "32" }))
      .toBe(32);
    for (const value of ["0", "65", "1.5", "many"]) {
      expect(() =>
        cameraMaxViewersFromEnvironment({ U1_CAMERA_MAX_VIEWERS: value })
      ).toThrow("U1_CAMERA_MAX_VIEWERS must be an integer from 1 to 64");
    }
  });

  test("advertises only discovered Tailscale host addresses downstream", () => {
    expect(tailscaleHostAddresses({
      en0: [{
        address: "192.168.50.10",
        netmask: "255.255.255.0",
        family: "IPv4",
        mac: "00:00:00:00:00:01",
        internal: false,
        cidr: "192.168.50.10/24",
      }],
      utun7: [
        {
          address: "100.91.2.3",
          netmask: "255.192.0.0",
          family: "IPv4",
          mac: "00:00:00:00:00:00",
          internal: false,
          cidr: "100.91.2.3/10",
        },
        {
          address: "fd7a:115c:a1e0::1234",
          netmask: "ffff:ffff:ffff::",
          family: "IPv6",
          mac: "00:00:00:00:00:00",
          internal: false,
          cidr: "fd7a:115c:a1e0::1234/48",
          scopeid: 0,
        },
      ],
    })).toEqual(["100.91.2.3", "fd7a:115c:a1e0::1234"]);
  });
});
