import { afterEach, describe, expect, test } from "bun:test";

import {
  CAMERA_FRAME_ATTEMPT_TIMEOUTS_SECONDS,
  createCameraOfferRequest,
  extractFirstJpeg,
  normalizedCameraService,
  normalizedPrintState,
  normalizedToolState,
  resolveCameraUrl,
  stripJpegMetadata,
} from "./u1-status.js";

const originalPrinterUrl = process.env.MOONRAKER_BASE_URL;

afterEach(() => {
  if (originalPrinterUrl === undefined) {
    delete process.env.MOONRAKER_BASE_URL;
  } else {
    process.env.MOONRAKER_BASE_URL = originalPrinterUrl;
  }
});

describe("camera URL boundary", () => {
  test("accepts only HTTP camera routes on the configured printer origin", () => {
    process.env.MOONRAKER_BASE_URL = "http://printer.local:7125/";

    expect(resolveCameraUrl("/webcam/snapshot.jpg")?.toString()).toBe(
      "http://printer.local:7125/webcam/snapshot.jpg"
    );
    expect(
      resolveCameraUrl("http://printer.local:7125/webcam/snapshot.jpg")?.toString()
    ).toBe("http://printer.local:7125/webcam/snapshot.jpg");
    expect(resolveCameraUrl("http://other.test/webcam/snapshot.jpg")).toBeNull();
    expect(resolveCameraUrl("https://printer.local:7125/webcam/snapshot.jpg")).toBeNull();
    expect(resolveCameraUrl(123)).toBeNull();
  });

  test("rejects unsupported printer base protocols", () => {
    process.env.MOONRAKER_BASE_URL = "file:///private/printer";
    expect(() => resolveCameraUrl("/webcam/snapshot.jpg")).toThrow(
      "Printer URL must use http or https"
    );
  });
});

describe("camera ICE handoff", () => {
  test("sends the exact issued ephemeral servers to the printer request", () => {
    const issued = [{
      urls: ["turn:relay.example:3478"],
      username: "1700001800:nonce",
      credential: "derived-credential",
    }];
    const request = createCameraOfferRequest({
      hasStun: false,
      hasTurn: true,
      turnCredentialTtlSeconds: 1800,
      issue: () => issued,
    });
    expect(request.iceServers).toBe(issued);
    expect(request.payload.iceServers).toBe(issued);
  });
});

describe("streamed JPEG extraction", () => {
  test("budgets a slow first snapshot before bounded retry", () => {
    expect(CAMERA_FRAME_ATTEMPT_TIMEOUTS_SECONDS).toEqual([20, 10]);
  });

  test("returns the first complete JPEG without waiting for the response to close", () => {
    const bytes = Buffer.from([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x01, 0xff, 0xd9,
      0xff, 0xd8, 0x01, 0xff, 0xd9,
    ]);

    expect(extractFirstJpeg(bytes)).toEqual(bytes.subarray(0, 8));
  });

  test("waits for a complete, correctly framed JPEG", () => {
    expect(extractFirstJpeg(Buffer.from([0xff, 0xd8, 0x01]))).toBeNull();
    expect(extractFirstJpeg(Buffer.from([0x00, 0xff, 0xd8, 0xff, 0xd9]))).toBeNull();
  });

  test("strips EXIF, application, comments, and trailing identity metadata", () => {
    const segment = (marker: number, payload: Buffer) => {
      const header = Buffer.alloc(4);
      header[0] = 0xff;
      header[1] = marker;
      header.writeUInt16BE(payload.length + 2, 2);
      return Buffer.concat([header, payload]);
    };
    const jpeg = Buffer.concat([
      Buffer.from([0xff, 0xd8]),
      segment(0xe1, Buffer.from("Exif printer.local 192.168.50.44")),
      segment(0xe2, Buffer.from("device-serial-private")),
      segment(0xfe, Buffer.from("printer-mac-aa:bb:cc:dd:ee:ff")),
      segment(0xdb, Buffer.from([0x00, 0x01])),
      segment(0xda, Buffer.from([0x01, 0x01, 0x00, 0x00, 0x3f, 0x00])),
      Buffer.from([0x01, 0x02, 0xff, 0x00, 0x03, 0xff, 0xd0, 0x04]),
      Buffer.from([0xff, 0xd9]),
      Buffer.from("trailing-private-device-id"),
    ]);

    const stripped = stripJpegMetadata(jpeg);
    const text = stripped.toString("latin1");
    expect(stripped.subarray(0, 2)).toEqual(Buffer.from([0xff, 0xd8]));
    expect(stripped.subarray(-2)).toEqual(Buffer.from([0xff, 0xd9]));
    expect(stripped.indexOf(Buffer.from([0xff, 0xdb]))).toBeGreaterThan(-1);
    expect(stripped.indexOf(Buffer.from([0xff, 0xda]))).toBeGreaterThan(-1);
    for (const privateValue of [
      "printer.local",
      "192.168.50.44",
      "device-serial-private",
      "aa:bb:cc:dd:ee:ff",
      "trailing-private-device-id",
    ]) {
      expect(text).not.toContain(privateValue);
    }
  });
});

describe("closed public printer vocabulary", () => {
  test("maps upstream state and service strings to normalized values", () => {
    expect(normalizedPrintState("printing")).toBe("printing");
    expect(normalizedPrintState(undefined)).toBe("unknown");
    expect(normalizedPrintState("")).toBe("unknown");
    expect(normalizedPrintState("printer.local 192.168.50.44")).toBe("unknown");
    expect(normalizedToolState("PARKED")).toBe("PARKED");
    expect(normalizedToolState("device-serial-private")).toBe("UNKNOWN");
    expect(normalizedCameraService("webrtc-camerastreamer", true, true)).toBe(
      "webrtc"
    );
    expect(normalizedCameraService("printer.local/private-camera", true, true))
      .toBe("snapshot");
    expect(normalizedCameraService("device-serial-private", false, true)).toBeNull();
  });
});
