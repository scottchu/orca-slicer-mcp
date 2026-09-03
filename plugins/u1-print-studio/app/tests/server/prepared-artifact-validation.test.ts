import { describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { deflateSync } from "node:zlib";

import {
  hashPreparationManifest,
  hashPreparationSpec,
  hashPreparedArtifact,
  validatePreparedArtifact,
  type PreparedArtifactValidationInput,
  type PreparationManifest,
  type PreparationSpec,
  type ThumbnailCorrespondenceReceipt,
} from "../../src/lib/server/preparation/prepared-artifact.js";
import {
  uploadPreparedArtifact,
  type PreparedArtifactUploadPort,
  type UploadAuthorization,
  type UploadPreflight,
} from "../../src/lib/server/application/upload-prepared-artifact.js";

const sha = (label: string): string => createHash("sha256").update(label).digest("hex");
const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let index = 0; index < 256; index++) {
    let value = index;
    for (let bit = 0; bit < 8; bit++) value = (value & 1) === 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    table[index] = value >>> 0;
  }
  return table;
})();
const crc32 = (bytes: Uint8Array): number => {
  let value = 0xffffffff;
  for (const byte of bytes) value = crcTable[(value ^ byte) & 0xff]! ^ (value >>> 8);
  return (value ^ 0xffffffff) >>> 0;
};
const uint32 = (value: number): Uint8Array => new Uint8Array([
  (value >>> 24) & 0xff, (value >>> 16) & 0xff, (value >>> 8) & 0xff, value & 0xff,
]);
const chunk = (type: string, data: Uint8Array): Uint8Array => {
  const typeBytes = new TextEncoder().encode(type);
  const crcInput = new Uint8Array(typeBytes.length + data.length);
  crcInput.set(typeBytes); crcInput.set(data, typeBytes.length);
  const result = new Uint8Array(12 + data.length);
  result.set(uint32(data.length)); result.set(typeBytes, 4); result.set(data, 8);
  result.set(uint32(crc32(crcInput)), 8 + data.length);
  return result;
};
const png = (): Uint8Array => {
  const header = new Uint8Array(13);
  header.set(uint32(2), 0); header.set(uint32(1), 4); header[8] = 8; header[9] = 2;
  const scanline = new Uint8Array([0, 255, 0, 0, 0, 0, 255]);
  const parts = [new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", header),
    chunk("IDAT", deflateSync(scanline)), chunk("IEND", new Uint8Array())];
  const output = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let offset = 0;
  for (const part of parts) { output.set(part, offset); offset += part.length; }
  return output;
};

const thumbnailBytes = png();
const withImage = (prefix: string, imageBytes: Uint8Array, header = "thumbnail begin 2x1"): Uint8Array => {
  const base64 = Buffer.from(imageBytes).toString("base64");
  return new TextEncoder().encode([
  "; synthetic fixture",
  prefix,
  `; ${header} ${base64.length}`,
  `; ${base64}`,
  "; thumbnail end",
  "G1 X1 E0.5",
  "M104 S0",
  "M140 S0",
  "",
  ].join("\n"));
};
const withThumbnail = (prefix: string): Uint8Array => withImage(prefix, thumbnailBytes);
const heatedGcode = (): Uint8Array => withThumbnail("M140 S60\nM190 S60\nM104 T0 S210\nM109 T0 S210");

const spec = (overrides: Partial<PreparationSpec> = {}): PreparationSpec => ({
  schemaVersion: 1,
  preparationRevision: "fixture-r1",
  targetFingerprint: sha("target"),
  backend: { id: "orca-slicer", version: "fixture-1", executableSha256: sha("executable") },
  plate: { layoutSha256: sha("layout") },
  objects: [{ objectId: "fixture-object", meshSha256: sha("mesh"), desiredWalls: 3 }],
  thermalIntent: { bed: { mode: "heated", targetC: 60, wait: "required" },
    tools: [{ tool: 0, intent: { mode: "heated", targetC: 210, wait: "required" } }] },
  thumbnailRequirements: { images: [{ format: "png", width: 2, height: 1 }] },
  ...overrides,
});

const fixture = (options: {
  artifactBytes?: Uint8Array;
  resolvedWalls?: number;
  layoutSha256?: string;
  thermalIntent?: PreparationSpec["thermalIntent"];
  receipt?: "accepted" | "missing";
} = {}): PreparedArtifactValidationInput => {
  const artifactBytes = options.artifactBytes ?? heatedGcode();
  const preparationSpec = spec({
    ...(options.layoutSha256 ? { plate: { layoutSha256: options.layoutSha256 } } : {}),
    ...(options.thermalIntent ? { thermalIntent: options.thermalIntent } : {}),
  });
  const manifest: PreparationManifest = {
    schemaVersion: 1,
    preparationRevision: preparationSpec.preparationRevision,
    preparationSpecSha256: hashPreparationSpec(preparationSpec),
    artifact: { sha256: hashPreparedArtifact(artifactBytes), byteLength: artifactBytes.length, mediaType: "text/x.gcode" },
    targetFingerprint: preparationSpec.targetFingerprint,
    plateLayoutSha256: preparationSpec.plate.layoutSha256,
    resolvedProcess: { globalWalls: 2, objects: [{ objectId: "fixture-object", meshSha256: sha("mesh"),
      walls: options.resolvedWalls ?? 3, wallSource: "object_override" }] },
    thumbnailConfiguration: { enabled: true },
  };
  const receipt: ThumbnailCorrespondenceReceipt = {
    schemaVersion: 1,
    decision: "accepted",
    evidenceKind: "deterministic-fixture",
    preparationRevision: preparationSpec.preparationRevision,
    artifactSha256: manifest.artifact.sha256,
    manifestSha256: hashPreparationManifest(manifest),
    plateLayoutSha256: preparationSpec.plate.layoutSha256,
    thumbnails: [{ index: 0, sha256: hashPreparedArtifact(thumbnailBytes), format: "png", width: 2, height: 1 }],
  };
  return { spec: preparationSpec, manifest, artifactBytes,
    correspondenceReceipt: options.receipt === "missing" ? null : receipt };
};

const check = (input: PreparedArtifactValidationInput, id: string) =>
  validatePreparedArtifact(input).checks.find(item => item.id === id);

describe("deterministic prepared-artifact validation", () => {
  test("accepts effective object override 3 and rejects global 2/object override 4 for desired 3", () => {
    expect(check(fixture({ resolvedWalls: 3 }), "resolved_walls")).toEqual({
      id: "resolved_walls", status: "passed", code: "resolved_walls_match",
    });
    expect(check(fixture({ resolvedWalls: 4 }), "resolved_walls")).toEqual({
      id: "resolved_walls", status: "blocked", code: "resolved_walls_mismatch",
    });
  });

  test("checks thermal intent before extrusion while allowing intentional unheated and end shutdown", () => {
    expect(check(fixture(), "thermal_intent")).toMatchObject({ status: "passed" });
    const zero = fixture({ artifactBytes: withThumbnail("M140 S0\nM190 S0\nM104 T0 S0\nM109 T0 S0") });
    expect(check(zero, "thermal_intent")).toEqual({
      id: "thermal_intent", status: "blocked", code: "bed_thermal_intent_mismatch",
    });
    const unheatedIntent: PreparationSpec["thermalIntent"] = { bed: { mode: "unheated" }, tools: [{ tool: 0, intent: { mode: "unheated" } }] };
    expect(check(fixture({ artifactBytes: withThumbnail("M140 S0\nM104 T0 S0"), thermalIntent: unheatedIntent }), "thermal_intent"))
      .toMatchObject({ status: "passed" });
    expect(check(fixture({ artifactBytes: withThumbnail("PRINT_START BED=60 HOTEND=210") }), "thermal_intent"))
      .toEqual({ id: "thermal_intent", status: "unavailable", code: "thermal_intent_unverified" });
    const setOnly = fixture({ artifactBytes: withThumbnail("M140 S60\nM104 T0 S210") });
    expect(check(setOnly, "thermal_intent")).toMatchObject({ status: "blocked", code: "bed_thermal_intent_mismatch" });
    const noWaitIntent: PreparationSpec["thermalIntent"] = {
      bed: { mode: "heated", targetC: 60, wait: "not_required" },
      tools: [{ tool: 0, intent: { mode: "heated", targetC: 210, wait: "not_required" } }],
    };
    expect(check(fixture({ artifactBytes: withThumbnail("M140 S60\nM104 T0 S210"), thermalIntent: noWaitIntent }), "thermal_intent"))
      .toMatchObject({ status: "passed" });
    expect(check(fixture({ artifactBytes: withThumbnail("START_PRINT BED=0"), thermalIntent: unheatedIntent }), "thermal_intent"))
      .toMatchObject({ status: "unavailable", code: "thermal_intent_unverified" });
  });

  test("requires a fully decoded embedded PNG despite enabled thumbnail configuration", () => {
    const noThumbnail = new TextEncoder().encode("M140 S60\nM190 S60\nM104 T0 S210\nM109 T0 S210\nG1 E0.5\n");
    expect(check(fixture({ artifactBytes: noThumbnail }), "embedded_thumbnails")).toEqual({
      id: "embedded_thumbnails", status: "blocked", code: "thumbnail_missing",
    });
    expect(check(fixture(), "embedded_thumbnails")).toEqual({
      id: "embedded_thumbnails", status: "passed", code: "embedded_thumbnails_verified",
    });
    const corrupt = Uint8Array.from(thumbnailBytes); corrupt[0] = 0;
    expect(check(fixture({ artifactBytes: withImage("M140 S60\nM104 T0 S210", corrupt) }), "embedded_thumbnails"))
      .toMatchObject({ status: "blocked", code: "thumbnail_invalid" });
    expect(check(fixture({ artifactBytes: withImage("M140 S60\nM104 T0 S210", thumbnailBytes, "thumbnail begin 3x1") }),
      "embedded_thumbnails")).toMatchObject({ status: "blocked", code: "thumbnail_invalid" });
    expect(check(fixture({ artifactBytes: withImage("M140 S60\nM104 T0 S210", new Uint8Array([255, 216, 255, 217]),
      "thumbnail_JPG begin 2x1") }), "embedded_thumbnails"))
      .toMatchObject({ status: "unavailable", code: "thumbnail_format_not_decodable" });
  });

  test("binds visual correspondence to the exact plate rather than claiming pixel understanding", () => {
    const base = fixture();
    const input = { ...base, correspondenceReceipt: {
      ...base.correspondenceReceipt!, plateLayoutSha256: sha("different-layout"),
    } };
    expect(check(input, "thumbnail_correspondence")).toEqual({
      id: "thumbnail_correspondence", status: "blocked", code: "correspondence_binding_mismatch",
    });
    expect(check(fixture({ receipt: "missing" }), "thumbnail_correspondence")).toEqual({
      id: "thumbnail_correspondence", status: "unavailable", code: "correspondence_receipt_missing",
    });
  });

  test("invalidates artifact and receipt evidence after any byte mutation", () => {
    const input = fixture();
    const mutated = { ...input, artifactBytes: new Uint8Array([...input.artifactBytes, 10]) };
    const result = validatePreparedArtifact(mutated);
    expect(result.status).toBe("blocked");
    expect(result.checks.find(item => item.id === "artifact_identity")).toEqual({
      id: "artifact_identity", status: "blocked", code: "artifact_identity_mismatch",
    });
    expect(result.checks.find(item => item.id === "thumbnail_correspondence")).toMatchObject({
      status: "blocked", code: "correspondence_binding_mismatch",
    });
  });

  test("returns byte-for-byte deterministic result data for identical inputs", () => {
    const input = fixture();
    const first = validatePreparedArtifact(input); const second = validatePreparedArtifact(input);
    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
    expect(first.status).toBe("passed");
    expect(first.validationId).toBe(second.validationId);
    const mutated = validatePreparedArtifact({ ...input, artifactBytes: new Uint8Array([...input.artifactBytes, 10]) });
    expect(mutated.validationId).not.toBe(first.validationId);
  });
});

describe("guarded prepared-artifact upload use case", () => {
  const gates = (validation: PreparedArtifactValidationInput) => {
    const result = validatePreparedArtifact(validation);
    const authorization: UploadAuthorization = { schemaVersion: 1, action: "upload",
      artifactSha256: result.artifactSha256!, manifestSha256: result.manifestSha256!,
      targetFingerprint: validation.spec.targetFingerprint, expiresAt: "2026-09-03T13:00:00.000Z", remainingAttempts: 1 };
    const preflight: UploadPreflight = { schemaVersion: 1, status: "passed",
      artifactSha256: result.artifactSha256!, manifestSha256: result.manifestSha256!,
      targetFingerprint: validation.spec.targetFingerprint };
    return { authorization, preflight };
  };

  test("calls uploader zero times for every non-pass and once for a fully bound candidate", async () => {
    let calls = 0;
    const port: PreparedArtifactUploadPort = { upload: async request => {
      calls += 1;
      expect(hashPreparedArtifact(request.artifactBytes)).toBe(request.artifactSha256);
      return { remoteArtifactId: "synthetic-remote-receipt" };
    } };
    const valid = fixture(); const validGates = gates(valid);
    const wall = fixture({ resolvedWalls: 4 });
    const thermal = fixture({ artifactBytes: withThumbnail("M140 S0\nM104 T0 S0") });
    const macro = fixture({ artifactBytes: withThumbnail("PRINT_START BED=60 HOTEND=210") });
    const noThumbnail = fixture({ artifactBytes: new TextEncoder().encode("M140 S60\nM104 T0 S210\nG1 E0.5\n") });
    const receiptBase = fixture(); const wrongReceipt = { ...receiptBase, correspondenceReceipt: {
      ...receiptBase.correspondenceReceipt!, plateLayoutSha256: sha("wrong-layout"),
    } };
    const mutationBase = fixture(); const mutation = { ...mutationBase,
      artifactBytes: new Uint8Array([...mutationBase.artifactBytes, 10]) };
    for (const validation of [wall, thermal, macro, noThumbnail, wrongReceipt, mutation]) {
      const gate = gates(validation);
      expect((await uploadPreparedArtifact({ validation, ...gate, now: "2026-09-03T12:00:00.000Z" }, port)).status)
        .not.toBe("uploaded");
      expect(calls).toBe(0);
    }
    expect((await uploadPreparedArtifact({ validation: valid, ...validGates, authorization: null,
      now: "2026-09-03T12:00:00.000Z" }, port)).status).toBe("blocked");
    expect(calls).toBe(0);
    expect((await uploadPreparedArtifact({ validation: valid, ...validGates,
      preflight: { ...validGates.preflight, status: "unavailable" }, now: "2026-09-03T12:00:00.000Z" }, port)).status)
      .toBe("unavailable");
    expect(calls).toBe(0);
    expect(await uploadPreparedArtifact({ validation: valid, ...validGates,
      now: "2026-09-03T12:00:00.000Z" }, port)).toMatchObject({
      status: "uploaded", code: "upload_accepted", remoteArtifactId: "synthetic-remote-receipt",
    });
    expect(calls).toBe(1);
  });
});
