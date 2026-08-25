import { afterEach, describe, expect, test } from "bun:test";

import { extractFirstJpeg, resolveCameraUrl } from "./u1-status.js";

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
    process.env.MOONRAKER_BASE_URL = "http://printer.test:7125/";

    expect(resolveCameraUrl("/webcam/snapshot.jpg")?.toString()).toBe(
      "http://printer.test:7125/webcam/snapshot.jpg"
    );
    expect(
      resolveCameraUrl("http://printer.test:7125/webcam/snapshot.jpg")?.toString()
    ).toBe("http://printer.test:7125/webcam/snapshot.jpg");
    expect(resolveCameraUrl("http://other.test/webcam/snapshot.jpg")).toBeNull();
    expect(resolveCameraUrl("https://printer.test:7125/webcam/snapshot.jpg")).toBeNull();
    expect(resolveCameraUrl(123)).toBeNull();
  });

  test("rejects unsupported printer base protocols", () => {
    process.env.MOONRAKER_BASE_URL = "file:///private/printer";
    expect(() => resolveCameraUrl("/webcam/snapshot.jpg")).toThrow(
      "MOONRAKER_BASE_URL must use http or https"
    );
  });
});

describe("streamed JPEG extraction", () => {
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
});
