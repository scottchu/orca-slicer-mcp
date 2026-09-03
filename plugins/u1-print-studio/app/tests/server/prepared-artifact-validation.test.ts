import { describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { deflateSync } from "node:zlib";

import {
  MAX_GCODE_LINE_BYTES,
  MAX_GCODE_LINES,
  MAX_PNG_CHUNKS,
  MAX_THUMBNAIL_BASE64_BYTES,
  digestResolvedSettingsReceipt,
  digestThumbnailCorrespondenceReceipt,
  hashPreparationManifest,
  hashPreparationSpec,
  hashPreparedArtifact,
  hashStartupCommand,
  validatePreparedArtifact,
  type PreparedArtifactValidationInput,
  type PreparationManifest,
  type PreparationSpec,
  type ResolvedSettingsReceipt,
  type ThumbnailCorrespondenceReceipt,
} from "../../src/lib/server/preparation/prepared-artifact.js";

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
  const typeBytes = new TextEncoder().encode(type); const crcInput = new Uint8Array(4 + data.length);
  crcInput.set(typeBytes); crcInput.set(data, 4);
  const output = new Uint8Array(12 + data.length);
  output.set(uint32(data.length)); output.set(typeBytes, 4); output.set(data, 8);
  output.set(uint32(crc32(crcInput)), 8 + data.length);
  return output;
};
const join = (parts: ReadonlyArray<Uint8Array>): Uint8Array => {
  const output = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0)); let offset = 0;
  for (const part of parts) { output.set(part, offset); offset += part.length; }
  return output;
};
const png = (options: { blank?: boolean; ancillaryChunks?: number; extraChunkTypes?: ReadonlyArray<string>;
  splitIdatWithAncillary?: boolean; width?: number; height?: number } = {}): Uint8Array => {
  const width = options.width ?? 2; const height = options.height ?? 1; const header = new Uint8Array(13);
  header.set(uint32(width), 0); header.set(uint32(height), 4); header[8] = 8; header[9] = 2;
  const rows = new Uint8Array(height * (width * 3 + 1));
  for (let row = 0; row < height; row++) {
    const start = row * (width * 3 + 1); rows[start] = 0;
    for (let pixel = 0; pixel < width; pixel++) {
      rows[start + 1 + pixel * 3] = 255;
      if (!options.blank && pixel === width - 1) { rows[start + 1 + pixel * 3] = 0; rows[start + 3 + pixel * 3] = 255; }
    }
  }
  const compressed = deflateSync(rows); const midpoint = Math.floor(compressed.length / 2);
  const imageChunks = options.splitIdatWithAncillary ? [chunk("IDAT", compressed.subarray(0, midpoint)),
    chunk("tEXt", new Uint8Array()), chunk("IDAT", compressed.subarray(midpoint))] : [chunk("IDAT", compressed)];
  return join([new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", header),
    ...Array.from({ length: options.ancillaryChunks ?? 0 }, () => chunk("tEXt", new Uint8Array())),
    ...(options.extraChunkTypes ?? []).map(type => chunk(type, new Uint8Array())),
    ...imageChunks, chunk("IEND", new Uint8Array())]);
};

const validPng = png();
const thumbnailBlock = (image = validPng, header = "thumbnail begin 2x1"): string => {
  const base64 = Buffer.from(image).toString("base64");
  return `; ${header} ${base64.length}\n; ${base64}\n; thumbnail end`;
};
const gcode = (startup: string, thumbnails: ReadonlyArray<string> = [thumbnailBlock()]): Uint8Array =>
  new TextEncoder().encode(["; synthetic fixture", "M82", "G92 E0", startup, ...thumbnails,
    "G1 X1 E0.5", "M104 S0", "M140 S0", ""].join("\n"));
const heatedStartup = "M140 S60\nM190 S60\nM104 T0 S210\nM109 T0 S210";

type FixtureOptions = {
  artifactBytes?: Uint8Array;
  thermalIntent?: PreparationSpec["thermalIntent"];
  manifestWalls?: number;
  resolvedWalls?: number;
  settings?: "valid" | "missing" | "binding-mismatch" | "invalid-digest";
  correspondence?: "valid" | "missing" | "wrong-layout" | "invalid-digest";
  approvedCommands?: string[];
  reviewerClass?: ThumbnailCorrespondenceReceipt["reviewerClass"];
  challengeSha256?: string;
};
const fixture = (options: FixtureOptions = {}): PreparedArtifactValidationInput => {
  const artifactBytes = options.artifactBytes ?? gcode(heatedStartup);
  const spec: PreparationSpec = {
    schemaVersion: 1, preparationRevision: "prepared_revision_0001", targetFingerprint: sha("target"),
    backend: { id: "orca-slicer", version: "fixture-1", executableSha256: sha("executable") },
    plate: { layoutSha256: sha("layout") },
    objects: [{ objectId: "fixture-object", meshSha256: sha("mesh"), desiredWalls: 3 }],
    thermalIntent: options.thermalIntent ?? { bed: { mode: "heated", targetC: 60, wait: "required" },
      tools: [{ tool: 0, intent: { mode: "heated", targetC: 210, wait: "required" } }] },
    thumbnailRequirements: { images: [{ format: "png", width: 2, height: 1 }] },
  };
  const manifest: PreparationManifest = {
    schemaVersion: 1, preparationRevision: spec.preparationRevision, preparationSpecSha256: hashPreparationSpec(spec),
    artifact: { sha256: hashPreparedArtifact(artifactBytes), byteLength: artifactBytes.length, mediaType: "text/x.gcode" },
    targetFingerprint: spec.targetFingerprint, plateLayoutSha256: spec.plate.layoutSha256,
    resolvedProcess: { globalWalls: options.manifestWalls ?? 2, objects: [{ objectId: "fixture-object", meshSha256: sha("mesh"),
      walls: options.manifestWalls ?? 3, wallSource: "object_override" }] },
    resolvedSettingsReceiptId: "resolved_settings_0001", thumbnailConfiguration: { enabled: true },
  };
  const manifestHash = hashPreparationManifest(manifest);
  const settingsBase: Omit<ResolvedSettingsReceipt, "digest"> = {
    schemaVersion: 1, receiptId: "resolved_settings_0001", resolverVersion: "fixture-resolver/1",
    preparationRevision: options.settings === "binding-mismatch" ? "prepared_revision_9999" : spec.preparationRevision,
    preparationSpecSha256: hashPreparationSpec(spec), manifestSha256: manifestHash,
    artifactSha256: hashPreparedArtifact(artifactBytes), globalWalls: 2,
    objects: [{ objectId: "fixture-object", meshSha256: sha("mesh"), walls: options.resolvedWalls ?? 3, wallSource: "object_override" }],
    approvedStartupCommandSha256: (options.approvedCommands ?? []).map(hashStartupCommand),
  };
  let settings = { ...settingsBase, digest: "" } as ResolvedSettingsReceipt;
  settings = { ...settings, digest: digestResolvedSettingsReceipt(settings) };
  if (options.settings === "invalid-digest") settings = { ...settings, digest: sha("forged-settings") };
  const correspondenceBase: Omit<ThumbnailCorrespondenceReceipt, "digest"> = {
    schemaVersion: 1, receiptId: "correspondence_receipt_0001", decision: "accepted",
    reviewerClass: options.reviewerClass ?? "deterministic-fixture-reviewer",
    challengeSha256: options.challengeSha256 ?? sha("challenge"), preparationRevision: spec.preparationRevision,
    artifactSha256: hashPreparedArtifact(artifactBytes), manifestSha256: manifestHash,
    plateLayoutSha256: options.correspondence === "wrong-layout" ? sha("wrong-layout") : spec.plate.layoutSha256,
    thumbnails: [{ index: 0, sha256: hashPreparedArtifact(validPng), format: "png", width: 2, height: 1 }],
  };
  let correspondence = { ...correspondenceBase, digest: "" } as ThumbnailCorrespondenceReceipt;
  correspondence = { ...correspondence, digest: digestThumbnailCorrespondenceReceipt(correspondence) };
  if (options.correspondence === "invalid-digest") correspondence = { ...correspondence, digest: sha("forged-review") };
  return { spec, manifest, artifactBytes,
    resolvedSettingsReceipt: options.settings === "missing" ? null : settings,
    correspondenceReceipt: options.correspondence === "missing" ? null : correspondence };
};
const check = (input: PreparedArtifactValidationInput, id: string) =>
  validatePreparedArtifact(input).checks.find(item => item.id === id);

describe("trusted resolved-intent evidence", () => {
  test("ignores manifest wall claims and requires a bound resolver receipt", () => {
    expect(check(fixture({ manifestWalls: 3, settings: "missing" }), "resolved_walls"))
      .toMatchObject({ status: "unavailable", code: "resolved_walls_evidence_unavailable" });
    expect(check(fixture({ manifestWalls: 3, resolvedWalls: 4 }), "resolved_walls"))
      .toMatchObject({ status: "blocked", code: "resolved_walls_mismatch" });
    expect(check(fixture({ manifestWalls: 4, resolvedWalls: 3 }), "resolved_walls"))
      .toMatchObject({ status: "passed", code: "resolved_walls_match" });
    expect(check(fixture({ settings: "binding-mismatch" }), "resolved_settings"))
      .toMatchObject({ status: "blocked", code: "resolved_settings_binding_mismatch" });
  });
});

describe("ordered thermal validation", () => {
  const unheated = (tool = 0): PreparationSpec["thermalIntent"] =>
    ({ bed: { mode: "unheated" }, tools: [{ tool, intent: { mode: "unheated" } }] });

  test("requires explicit wait evidence and accepts M190/M109 R waits", () => {
    expect(check(fixture(), "thermal_intent")).toMatchObject({ status: "passed" });
    expect(check(fixture({ artifactBytes: gcode("M140 S60\nM104 T0 S210") }), "thermal_intent"))
      .toMatchObject({ status: "blocked" });
    expect(check(fixture({ artifactBytes: gcode("M190 R60\nM109 T0 R210") }), "thermal_intent"))
      .toMatchObject({ status: "passed" });
  });

  test("uses final pre-extrusion targets and ignores shutdown only after extrusion", () => {
    expect(check(fixture({ artifactBytes: gcode("M190 S60\nM109 T0 S210\nM140 S0") }), "thermal_intent"))
      .toMatchObject({ status: "blocked", code: "bed_thermal_intent_mismatch" });
    expect(check(fixture(), "thermal_intent")).toMatchObject({ status: "passed" });
    expect(check(fixture({ artifactBytes: gcode("M140 S60\nM190 S60\nM140 S0\nM140 S60\nM109 T0 S210") }), "thermal_intent"))
      .toMatchObject({ status: "blocked", code: "bed_thermal_intent_mismatch" });
  });

  test("tracks active T selection and honors an explicit inline T", () => {
    expect(check(fixture({ artifactBytes: gcode("T1\nG92 E0\nM104 S210"), thermalIntent: unheated(1) }), "thermal_intent"))
      .toMatchObject({ status: "blocked", code: "tool_thermal_intent_mismatch" });
    expect(check(fixture({ artifactBytes: gcode("M104 T1 S210"), thermalIntent: unheated(1) }), "thermal_intent"))
      .toMatchObject({ status: "blocked", code: "tool_thermal_intent_mismatch" });
  });

  test("fails closed for arbitrary startup commands unless their exact semantics fingerprint is trusted", () => {
    const artifactBytes = gcode("U1_BOOT BED=60");
    expect(check(fixture({ artifactBytes, thermalIntent: unheated() }), "thermal_intent"))
      .toMatchObject({ status: "unavailable", code: "thermal_startup_semantics_unapproved" });
    expect(check(fixture({ artifactBytes, thermalIntent: unheated(), approvedCommands: ["U1_BOOT BED=60"] }), "thermal_intent"))
      .toMatchObject({ status: "passed" });
  });

  test("uses extrusion delta so an absolute retraction cannot hide later startup semantics", () => {
    const absoluteRetraction = new TextEncoder().encode([
      "M82", "G92 E10", "G1 E9", "U1_BOOT BED=60", thumbnailBlock(), "G1 E11", "",
    ].join("\n"));
    expect(check(fixture({ artifactBytes: absoluteRetraction, thermalIntent: unheated() }), "thermal_intent"))
      .toMatchObject({ status: "unavailable", code: "thermal_startup_semantics_unapproved" });
    const relativeRetraction = new TextEncoder().encode([
      "M83", "G1 E-1", thumbnailBlock(), "G1 E0.5", "",
    ].join("\n"));
    expect(check(fixture({ artifactBytes: relativeRetraction, thermalIntent: unheated() }), "thermal_intent"))
      .toMatchObject({ status: "passed", code: "thermal_intent_verified" });
    const unknownMode = new TextEncoder().encode([thumbnailBlock(), "G1 E0.5", ""].join("\n"));
    expect(check(fixture({ artifactBytes: unknownMode, thermalIntent: unheated() }), "thermal_intent"))
      .toMatchObject({ status: "unavailable", code: "thermal_extrusion_boundary_unavailable" });
  });

  test("rejects duplicate interpreted parameters and firmware-dependent cold retract commands", () => {
    expect(check(fixture({ artifactBytes: gcode("M140 S60 S0\nM190 S60\nM109 T0 S210") }), "thermal_intent"))
      .toMatchObject({ status: "unavailable", code: "thermal_startup_semantics_unapproved" });
    expect(check(fixture({ artifactBytes: gcode("M190 S60\nM104 T0 T1 S210\nM109 T0 S210") }), "thermal_intent"))
      .toMatchObject({ status: "unavailable", code: "thermal_startup_semantics_unapproved" });
    expect(check(fixture({ artifactBytes: gcode("G10\nG11"), thermalIntent: unheated() }), "thermal_intent"))
      .toMatchObject({ status: "unavailable", code: "thermal_startup_semantics_unapproved" });
    const duplicateExtrusion = new TextEncoder().encode([
      "M83", "G1 E-1 E0.5", thumbnailBlock(), "G1 E0.5", "",
    ].join("\n"));
    expect(check(fixture({ artifactBytes: duplicateExtrusion, thermalIntent: unheated() }), "thermal_intent"))
      .toMatchObject({ status: "unavailable", code: "thermal_extrusion_boundary_unavailable" });
  });

  test("counts unsupported numeric spellings before interpreting safety parameters", () => {
    for (const startup of [
      "M140 S60 S0e0\nM190 S60\nM109 T0 S210",
      "M140 S60 S+0\nM190 S60\nM109 T0 S210",
      "M190 S60\nM104 T0 T+1 S210\nM109 T0 S210",
    ]) {
      expect(check(fixture({ artifactBytes: gcode(startup) }), "thermal_intent"))
        .toMatchObject({ status: "unavailable", code: "thermal_startup_semantics_unapproved" });
    }
    const alternateExtrusion = new TextEncoder().encode([
      "M83", "G1 E0.5 E-1e0", thumbnailBlock(), "G1 E0.5", "",
    ].join("\n"));
    expect(check(fixture({ artifactBytes: alternateExtrusion, thermalIntent: unheated() }), "thermal_intent"))
      .toMatchObject({ status: "unavailable", code: "thermal_extrusion_boundary_unavailable" });
  });
});

describe("bounded embedded-thumbnail evidence", () => {
  test("rejects missing, corrupt, blank and multiple unexpected thumbnails", () => {
    expect(check(fixture({ artifactBytes: gcode(heatedStartup, []) }), "embedded_thumbnails"))
      .toMatchObject({ status: "blocked", code: "thumbnail_missing" });
    const corrupt = Uint8Array.from(validPng); corrupt[0] = 0;
    expect(check(fixture({ artifactBytes: gcode(heatedStartup, [thumbnailBlock(corrupt)]) }), "embedded_thumbnails"))
      .toMatchObject({ status: "blocked", code: "thumbnail_invalid" });
    expect(check(fixture({ artifactBytes: gcode(heatedStartup, [thumbnailBlock(png({ blank: true }))]) }), "embedded_thumbnails"))
      .toMatchObject({ status: "blocked", code: "thumbnail_invalid" });
    expect(check(fixture({ artifactBytes: gcode(heatedStartup, [thumbnailBlock(), thumbnailBlock()]) }), "embedded_thumbnails"))
      .toMatchObject({ status: "blocked", code: "thumbnail_requirements_mismatch" });
  });

  test("rejects non-letter and reserved-bit PNG chunk types even with valid CRCs", () => {
    expect(check(fixture({ artifactBytes: gcode(heatedStartup, [thumbnailBlock(png({ extraChunkTypes: ["1BAD"] }))]) }),
      "embedded_thumbnails")).toMatchObject({ status: "blocked", code: "thumbnail_invalid" });
    expect(check(fixture({ artifactBytes: gcode(heatedStartup, [thumbnailBlock(png({ extraChunkTypes: ["texT"] }))]) }),
      "embedded_thumbnails")).toMatchObject({ status: "blocked", code: "thumbnail_invalid" });
    expect(check(fixture({ artifactBytes: gcode(heatedStartup,
      [thumbnailBlock(png({ splitIdatWithAncillary: true }))]) }), "embedded_thumbnails"))
      .toMatchObject({ status: "blocked", code: "thumbnail_invalid" });
    expect(check(fixture({ artifactBytes: gcode(heatedStartup,
      [thumbnailBlock(png({ extraChunkTypes: ["tEXt"] }))]) }), "embedded_thumbnails"))
      .toMatchObject({ status: "passed", code: "embedded_thumbnails_verified" });
  });

  test("bounds line length, line count, aggregate base64 and PNG chunks", () => {
    expect(check(fixture({ artifactBytes: new TextEncoder().encode(`; ${"x".repeat(MAX_GCODE_LINE_BYTES)}\n`) }), "gcode_parse"))
      .toMatchObject({ status: "error", code: "gcode_line_length_exceeded" });
    expect(check(fixture({ artifactBytes: new TextEncoder().encode(";\n".repeat(MAX_GCODE_LINES + 1)) }), "gcode_parse"))
      .toMatchObject({ status: "error", code: "gcode_line_count_exceeded" });
    const oversized = "A".repeat(MAX_THUMBNAIL_BASE64_BYTES + 4);
    const oversizedArtifact = new TextEncoder().encode(`; thumbnail begin 2x1 ${oversized.length}\n${oversized.match(/.{1,1000}/g)!.map(line => `; ${line}`).join("\n")}\n; thumbnail end\nG1 E1\n`);
    expect(check(fixture({ artifactBytes: oversizedArtifact }), "gcode_parse"))
      .toMatchObject({ status: "error", code: "thumbnail_base64_limit_exceeded" });
    expect(check(fixture({ artifactBytes: gcode(heatedStartup, [thumbnailBlock(png({ ancillaryChunks: MAX_PNG_CHUNKS }))]) }),
      "embedded_thumbnails")).toMatchObject({ status: "blocked", code: "thumbnail_invalid" });
  }, 20_000);

  test("rejects malformed UTF-8 and honors cancellation", () => {
    expect(check(fixture({ artifactBytes: new Uint8Array([0xff, 0xfe, 0xfd]) }), "gcode_parse"))
      .toMatchObject({ status: "error", code: "gcode_invalid_utf8" });
    const controller = new AbortController(); controller.abort();
    expect(validatePreparedArtifact(fixture(), { signal: controller.signal }).checks.find(item => item.id === "gcode_parse"))
      .toMatchObject({ status: "error", code: "validation_aborted" });
  });
});

describe("content-bound validation receipt", () => {
  test("binds trusted review digest, challenge and reviewer class into validation identity", () => {
    const base = validatePreparedArtifact(fixture());
    const reviewer = validatePreparedArtifact(fixture({ reviewerClass: "human-reviewer" }));
    const challenge = validatePreparedArtifact(fixture({ challengeSha256: sha("another-challenge") }));
    expect(base.status).toBe("passed");
    expect(new Set([base.validationId, reviewer.validationId, challenge.validationId]).size).toBe(3);
    expect(check(fixture({ correspondence: "wrong-layout" }), "thumbnail_correspondence"))
      .toMatchObject({ status: "blocked", code: "correspondence_binding_mismatch" });
    expect(check(fixture({ correspondence: "invalid-digest" }), "thumbnail_correspondence"))
      .toMatchObject({ status: "error", code: "correspondence_receipt_invalid" });
  });

  test("invalidates settings, review and validation identity after artifact mutation", () => {
    const input = fixture(); const before = validatePreparedArtifact(input);
    const after = validatePreparedArtifact({ ...input, artifactBytes: new Uint8Array([...input.artifactBytes, 10]) });
    expect(after.validationId).not.toBe(before.validationId);
    expect(after.checks.find(item => item.id === "artifact_identity")).toMatchObject({ status: "blocked" });
    expect(after.checks.find(item => item.id === "resolved_settings")).toMatchObject({ status: "blocked" });
    expect(after.checks.find(item => item.id === "thumbnail_correspondence")).toMatchObject({ status: "blocked" });
  });

  test("is deterministic and aggregates error above unavailable above blocked", () => {
    const input = fixture(); const first = validatePreparedArtifact(input); const second = validatePreparedArtifact(input);
    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
    expect(first.validationId).toBe(second.validationId);
    const unavailable = validatePreparedArtifact(fixture({ resolvedWalls: 4, correspondence: "missing" }));
    expect(unavailable.checks.some(item => item.status === "blocked")).toBe(true);
    expect(unavailable.status).toBe("unavailable");
    const error = validatePreparedArtifact(fixture({ artifactBytes: new Uint8Array([0xff]), resolvedWalls: 4, correspondence: "missing" }));
    expect(error.checks.some(item => item.status === "blocked")).toBe(true);
    expect(error.checks.some(item => item.status === "unavailable")).toBe(true);
    expect(error.status).toBe("error");
  });
});
