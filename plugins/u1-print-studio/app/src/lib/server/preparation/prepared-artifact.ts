import { createHash } from "node:crypto";
import { inflateSync } from "node:zlib";

export const PREPARATION_SCHEMA_VERSION = 1 as const;
export const MAX_PREPARED_ARTIFACT_BYTES = 64 * 1024 * 1024;
export const MAX_PREPARATION_OBJECTS = 64;
export const MAX_THUMBNAILS = 8;
const MAX_TEXT_LENGTH = 128;
const MAX_THUMBNAIL_BASE64_BYTES = 4 * 1024 * 1024;
const SHA256 = /^[a-f0-9]{64}$/;

export type Sha256 = string;
export type ThermalIntent =
  | { readonly mode: "unheated" }
  | { readonly mode: "heated"; readonly targetC: number; readonly wait: "required" | "not_required" };
export type PreparationSpec = {
  readonly schemaVersion: typeof PREPARATION_SCHEMA_VERSION;
  readonly preparationRevision: string;
  readonly targetFingerprint: Sha256;
  readonly backend: { readonly id: "orca-slicer" | "snapmaker-orca"; readonly version: string; readonly executableSha256: Sha256 };
  readonly plate: { readonly layoutSha256: Sha256 };
  readonly objects: ReadonlyArray<{ readonly objectId: string; readonly meshSha256: Sha256; readonly desiredWalls: number }>;
  readonly thermalIntent: {
    readonly bed: ThermalIntent;
    readonly tools: ReadonlyArray<{ readonly tool: number; readonly intent: ThermalIntent }>;
  };
  readonly thumbnailRequirements: {
    readonly images: ReadonlyArray<{ readonly format: "png"; readonly width: number; readonly height: number }>;
  };
};

export type PreparationManifest = {
  readonly schemaVersion: typeof PREPARATION_SCHEMA_VERSION;
  readonly preparationRevision: string;
  readonly preparationSpecSha256: Sha256;
  readonly artifact: { readonly sha256: Sha256; readonly byteLength: number; readonly mediaType: "text/x.gcode" };
  readonly targetFingerprint: Sha256;
  readonly plateLayoutSha256: Sha256;
  readonly resolvedProcess: {
    readonly globalWalls: number;
    readonly objects: ReadonlyArray<{
      readonly objectId: string;
      readonly meshSha256: Sha256;
      readonly walls: number;
      readonly wallSource: "global" | "object_override";
    }>;
  };
  readonly thumbnailConfiguration: { readonly enabled: boolean };
};

export type ThumbnailEvidence = {
  readonly index: number;
  readonly sha256: Sha256;
  readonly format: "png";
  readonly width: number;
  readonly height: number;
};

/**
 * Records an explicit exact-plate visual inspection. The core verifies every
 * binding in this receipt; it does not claim to infer layout from pixels.
 */
export type ThumbnailCorrespondenceReceipt = {
  readonly schemaVersion: typeof PREPARATION_SCHEMA_VERSION;
  readonly decision: "accepted" | "rejected";
  readonly evidenceKind: "human-inspection" | "deterministic-fixture";
  readonly preparationRevision: string;
  readonly artifactSha256: Sha256;
  readonly manifestSha256: Sha256;
  readonly plateLayoutSha256: Sha256;
  readonly thumbnails: ReadonlyArray<ThumbnailEvidence>;
};

export type PreparedArtifactValidationInput = {
  readonly spec: PreparationSpec;
  readonly manifest: PreparationManifest;
  readonly artifactBytes: Uint8Array;
  readonly correspondenceReceipt: ThumbnailCorrespondenceReceipt | null;
};

export type ValidationStatus = "passed" | "blocked" | "unavailable" | "error";
export type PreparedArtifactCheck = {
  readonly id: "contract" | "artifact_identity" | "manifest_binding" | "resolved_walls" |
    "thermal_intent" | "embedded_thumbnails" | "thumbnail_correspondence";
  readonly status: ValidationStatus;
  readonly code: string;
};
export type PreparedArtifactValidationReceipt = {
  readonly schemaVersion: typeof PREPARATION_SCHEMA_VERSION;
  readonly validationId: Sha256 | null;
  readonly status: ValidationStatus;
  readonly artifactSha256: Sha256 | null;
  readonly manifestSha256: Sha256 | null;
  readonly preparationSpecSha256: Sha256 | null;
  readonly preparationRevision: string | null;
  readonly targetFingerprint: Sha256 | null;
  readonly thumbnails: ReadonlyArray<ThumbnailEvidence>;
  readonly checks: ReadonlyArray<PreparedArtifactCheck>;
};
export type PreparedArtifactValidationResult = PreparedArtifactValidationReceipt;

type DecodedPng = { width: number; height: number; meaningful: boolean };
type ExtractionResult =
  | { status: "passed"; thumbnails: ThumbnailEvidence[] }
  | { status: "blocked" | "unavailable" | "error"; code: string; thumbnails: [] };

const text = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0 && value.length <= MAX_TEXT_LENGTH &&
  !/[\p{Cc}\p{Cf}\p{Zl}\p{Zp}]/u.test(value);
const hash = (bytes: Uint8Array | string): Sha256 => createHash("sha256").update(bytes).digest("hex");
const positiveInteger = (value: unknown, maximum = 10_000): value is number =>
  Number.isInteger(value) && Number(value) > 0 && Number(value) <= maximum;
const validThermalIntent = (intent: ThermalIntent): boolean =>
  intent?.mode === "unheated" || (intent?.mode === "heated" &&
    Number.isFinite(intent.targetC) && intent.targetC > 0 && intent.targetC <= 500 &&
    new Set(["required", "not_required"]).has(intent.wait));

const canonicalize = (value: unknown): string => {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(",")}]`;
  return `{${Object.entries(value as Record<string, unknown>)
    .sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0)
    .map(([key, item]) => `${JSON.stringify(key)}:${canonicalize(item)}`).join(",")}}`;
};

export const hashPreparationSpec = (spec: PreparationSpec): Sha256 => hash(canonicalize(spec));
export const hashPreparationManifest = (manifest: PreparationManifest): Sha256 => hash(canonicalize(manifest));
export const hashPreparedArtifact = (artifactBytes: Uint8Array): Sha256 => hash(artifactBytes);

const validSpec = (spec: PreparationSpec): boolean => {
  if (spec?.schemaVersion !== PREPARATION_SCHEMA_VERSION || !text(spec.preparationRevision) ||
      !SHA256.test(spec.targetFingerprint) || !SHA256.test(spec.backend?.executableSha256) ||
      !text(spec.backend?.version) || !new Set(["orca-slicer", "snapmaker-orca"]).has(spec.backend?.id) ||
      !SHA256.test(spec.plate?.layoutSha256) || !Array.isArray(spec.objects) ||
      spec.objects.length === 0 || spec.objects.length > MAX_PREPARATION_OBJECTS ||
      !validThermalIntent(spec.thermalIntent?.bed) || !Array.isArray(spec.thermalIntent?.tools) ||
      spec.thermalIntent.tools.length > 16 || !Array.isArray(spec.thumbnailRequirements?.images) ||
      spec.thumbnailRequirements.images.length === 0 ||
      spec.thumbnailRequirements.images.length > MAX_THUMBNAILS) return false;
  const objectIds = new Set<string>();
  for (const object of spec.objects) {
    if (!text(object.objectId) || objectIds.has(object.objectId) || !SHA256.test(object.meshSha256) ||
        !positiveInteger(object.desiredWalls, 32)) return false;
    objectIds.add(object.objectId);
  }
  const tools = new Set<number>();
  for (const tool of spec.thermalIntent.tools) {
    if (!Number.isInteger(tool.tool) || tool.tool < 0 || tool.tool > 15 || tools.has(tool.tool) ||
        !validThermalIntent(tool.intent)) return false;
    tools.add(tool.tool);
  }
  return spec.thumbnailRequirements.images.every(image => image.format === "png" &&
    positiveInteger(image.width, 4096) && positiveInteger(image.height, 4096) &&
    image.width * image.height <= 16_777_216);
};

const validManifest = (manifest: PreparationManifest): boolean => {
  if (manifest?.schemaVersion !== PREPARATION_SCHEMA_VERSION || !text(manifest.preparationRevision) ||
      !SHA256.test(manifest.preparationSpecSha256) || !SHA256.test(manifest.artifact?.sha256) ||
      !positiveInteger(manifest.artifact?.byteLength, MAX_PREPARED_ARTIFACT_BYTES) ||
      manifest.artifact?.mediaType !== "text/x.gcode" || !SHA256.test(manifest.targetFingerprint) ||
      !SHA256.test(manifest.plateLayoutSha256) || !positiveInteger(manifest.resolvedProcess?.globalWalls, 32) ||
      !Array.isArray(manifest.resolvedProcess?.objects) ||
      manifest.resolvedProcess.objects.length === 0 ||
      manifest.resolvedProcess.objects.length > MAX_PREPARATION_OBJECTS ||
      typeof manifest.thumbnailConfiguration?.enabled !== "boolean") return false;
  const ids = new Set<string>();
  return manifest.resolvedProcess.objects.every(object => {
    if (!text(object.objectId) || ids.has(object.objectId) || !SHA256.test(object.meshSha256) ||
        !positiveInteger(object.walls, 32) || !new Set(["global", "object_override"]).has(object.wallSource)) return false;
    ids.add(object.objectId);
    return object.wallSource !== "global" || object.walls === manifest.resolvedProcess.globalWalls;
  });
};

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
const readUint32 = (bytes: Uint8Array, offset: number): number =>
  (((bytes[offset]! << 24) | (bytes[offset + 1]! << 16) | (bytes[offset + 2]! << 8) | bytes[offset + 3]!) >>> 0);
const paeth = (left: number, above: number, upperLeft: number): number => {
  const estimate = left + above - upperLeft;
  const leftDistance = Math.abs(estimate - left);
  const aboveDistance = Math.abs(estimate - above);
  const upperLeftDistance = Math.abs(estimate - upperLeft);
  return leftDistance <= aboveDistance && leftDistance <= upperLeftDistance ? left :
    aboveDistance <= upperLeftDistance ? above : upperLeft;
};

const decodePng = (bytes: Uint8Array): DecodedPng | null => {
  const signature = [137, 80, 78, 71, 13, 10, 26, 10];
  if (bytes.length < 45 || !signature.every((byte, index) => bytes[index] === byte)) return null;
  let offset = 8;
  let width = 0; let height = 0; let bitDepth = 0; let colorType = -1; let interlace = -1;
  const idat: Uint8Array[] = [];
  let sawHeader = false; let sawEnd = false;
  while (offset + 12 <= bytes.length) {
    const length = readUint32(bytes, offset);
    if (length > MAX_THUMBNAIL_BASE64_BYTES || offset + 12 + length > bytes.length) return null;
    const typeBytes = bytes.subarray(offset + 4, offset + 8);
    const type = Buffer.from(typeBytes).toString("ascii");
    const data = bytes.subarray(offset + 8, offset + 8 + length);
    const expectedCrc = readUint32(bytes, offset + 8 + length);
    const crcInput = new Uint8Array(4 + length);
    crcInput.set(typeBytes); crcInput.set(data, 4);
    if (crc32(crcInput) !== expectedCrc) return null;
    if (type === "IHDR") {
      if (sawHeader || offset !== 8 || length !== 13) return null;
      width = readUint32(data, 0); height = readUint32(data, 4);
      bitDepth = data[8]!; colorType = data[9]!; interlace = data[12]!; sawHeader = true;
      if (!positiveInteger(width, 4096) || !positiveInteger(height, 4096) || width * height > 16_777_216 ||
          bitDepth !== 8 || !new Set([0, 2, 4, 6]).has(colorType) || data[10] !== 0 || data[11] !== 0 || interlace !== 0) return null;
    } else if (type === "IDAT") {
      if (!sawHeader || sawEnd) return null;
      idat.push(data);
    } else if (type === "IEND") {
      if (length !== 0) return null;
      sawEnd = true; offset += 12; break;
    } else if (/^[A-Z]/.test(type)) {
      // Unknown critical chunks affect decoding semantics and cannot be ignored.
      return null;
    }
    offset += 12 + length;
  }
  if (!sawHeader || !sawEnd || idat.length === 0 || offset !== bytes.length) return null;
  const compressedLength = idat.reduce((sum, chunk) => sum + chunk.length, 0);
  const compressed = new Uint8Array(compressedLength);
  let cursor = 0;
  for (const chunk of idat) { compressed.set(chunk, cursor); cursor += chunk.length; }
  const bytesPerPixel = colorType === 0 ? 1 : colorType === 2 ? 3 : colorType === 4 ? 2 : 4;
  const rowBytes = width * bytesPerPixel;
  let inflated: Uint8Array;
  try { inflated = inflateSync(compressed, { maxOutputLength: height * (rowBytes + 1) }); }
  catch { return null; }
  if (inflated.length !== height * (rowBytes + 1)) return null;
  const decoded = new Uint8Array(height * rowBytes);
  let sourceOffset = 0;
  for (let row = 0; row < height; row++) {
    const filter = inflated[sourceOffset++]!;
    if (filter > 4) return null;
    const rowOffset = row * rowBytes;
    for (let column = 0; column < rowBytes; column++) {
      const raw = inflated[sourceOffset++]!;
      const left = column >= bytesPerPixel ? decoded[rowOffset + column - bytesPerPixel]! : 0;
      const above = row > 0 ? decoded[rowOffset - rowBytes + column]! : 0;
      const upperLeft = row > 0 && column >= bytesPerPixel ? decoded[rowOffset - rowBytes + column - bytesPerPixel]! : 0;
      const predictor = filter === 0 ? 0 : filter === 1 ? left : filter === 2 ? above :
        filter === 3 ? Math.floor((left + above) / 2) : paeth(left, above, upperLeft);
      decoded[rowOffset + column] = (raw + predictor) & 0xff;
    }
  }
  let firstPixel: string | null = null; let varied = false; let visible = false;
  for (let pixel = 0; pixel < width * height; pixel++) {
    const position = pixel * bytesPerPixel;
    const alpha = colorType === 4 ? decoded[position + 1]! : colorType === 6 ? decoded[position + 3]! : 255;
    if (alpha > 0) visible = true;
    const value = Array.from(decoded.subarray(position, position + bytesPerPixel)).join(",");
    if (firstPixel === null) firstPixel = value;
    else if (value !== firstPixel) varied = true;
  }
  return { width, height, meaningful: visible && varied };
};

const strictBase64 = (value: string): Uint8Array | null => {
  if (!value || value.length > MAX_THUMBNAIL_BASE64_BYTES || value.length % 4 !== 0 ||
      !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value)) return null;
  const decoded = Buffer.from(value, "base64");
  return decoded.length > 0 && decoded.toString("base64") === value ? decoded : null;
};

const extractThumbnails = (artifactBytes: Uint8Array, spec: PreparationSpec): ExtractionResult => {
  const source = new TextDecoder("utf-8", { fatal: false }).decode(artifactBytes).replaceAll("\r\n", "\n");
  const lines = source.split("\n");
  const thumbnails: ThumbnailEvidence[] = [];
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const match = /^;\s*thumbnail(?:_(PNG|JPG|JPEG))?\s+begin\s+(\d+)x(\d+)\s+(\d+)\s*$/i.exec(lines[lineIndex]!);
    if (!match) continue;
    if (thumbnails.length >= MAX_THUMBNAILS) return { status: "error", code: "thumbnail_count_out_of_bounds", thumbnails: [] };
    const declaredFormat = match[1]?.toLowerCase();
    if (declaredFormat === "jpg" || declaredFormat === "jpeg") {
      return { status: "unavailable", code: "thumbnail_format_not_decodable", thumbnails: [] };
    }
    const declaredWidth = Number(match[2]); const declaredHeight = Number(match[3]); const declaredLength = Number(match[4]);
    const encoded: string[] = [];
    let foundEnd = false;
    for (lineIndex += 1; lineIndex < lines.length; lineIndex++) {
      if (/^;\s*thumbnail(?:_(?:PNG|JPG|JPEG))?\s+end\s*$/i.test(lines[lineIndex]!)) { foundEnd = true; break; }
      const payload = /^;\s*([A-Za-z0-9+/=]+)\s*$/.exec(lines[lineIndex]!);
      if (!payload) return { status: "blocked", code: "thumbnail_invalid", thumbnails: [] };
      encoded.push(payload[1]!);
    }
    const base64 = encoded.join("");
    if (!foundEnd || declaredLength !== base64.length) return { status: "blocked", code: "thumbnail_invalid", thumbnails: [] };
    const bytes = strictBase64(base64);
    const png = bytes ? decodePng(bytes) : null;
    if (!png || png.width !== declaredWidth || png.height !== declaredHeight || !png.meaningful) {
      return { status: "blocked", code: "thumbnail_invalid", thumbnails: [] };
    }
    thumbnails.push({ index: thumbnails.length, sha256: hash(bytes!), format: "png", width: png.width, height: png.height });
  }
  if (thumbnails.length === 0) return { status: "blocked", code: "thumbnail_missing", thumbnails: [] };
  const required = spec.thumbnailRequirements.images;
  if (thumbnails.length !== required.length || thumbnails.some((thumbnail, index) => {
    const expected = required[index];
    return !expected || thumbnail.format !== expected.format || thumbnail.width !== expected.width || thumbnail.height !== expected.height;
  })) return { status: "blocked", code: "thumbnail_requirements_mismatch", thumbnails: [] };
  return { status: "passed", thumbnails };
};

const thermalCheck = (artifactBytes: Uint8Array, spec: PreparationSpec): PreparedArtifactCheck => {
  const lines = new TextDecoder("utf-8", { fatal: false }).decode(artifactBytes).replaceAll("\r\n", "\n").split("\n");
  const extrusionIndex = lines.findIndex(line => /^\s*G(?:0|1)\b(?=[^;]*\bE(?:\d|\.))/i.test(line) &&
    Number(/\bE(-?(?:\d+(?:\.\d*)?|\.\d+))/i.exec(line)?.[1] ?? 0) > 0);
  if (extrusionIndex < 0) return { id: "thermal_intent", status: "unavailable", code: "thermal_extrusion_boundary_unavailable" };
  const commands = lines.slice(0, extrusionIndex).map(line => line.split(";", 1)[0]!.trim()).filter(Boolean);
  const unknownHeatMacro = commands.some(line =>
    /^(?:PRINT_START|START_PRINT|[A-Z0-9_]*(?:HEAT|TEMP|PREHEAT)[A-Z0-9_]*)\b/i.test(line) &&
    !/^M(?:104|109|140|190)\b/i.test(line));
  if (unknownHeatMacro) {
    return { id: "thermal_intent", status: "unavailable", code: "thermal_intent_unverified" };
  }
  const temperatures = (pattern: RegExp): number[] => commands.flatMap(line => {
    const match = pattern.exec(line);
    return match ? [Number(match[1])] : [];
  }).filter(value => Number.isFinite(value));
  const bedSet = temperatures(/^M140\b[^;]*\bS(-?(?:\d+(?:\.\d*)?|\.\d+))/i);
  const bedWait = temperatures(/^M190\b[^;]*\bS(-?(?:\d+(?:\.\d*)?|\.\d+))/i);
  const toolValues = (tool: number, command: "M104" | "M109"): number[] => commands.flatMap(line => {
    if (!new RegExp(`^${command}\\b`, "i").test(line)) return [];
    const target = /\bS(-?(?:\d+(?:\.\d*)?|\.\d+))/i.exec(line);
    const selectedTool = /\bT(\d+)/i.exec(line);
    return target && Number(selectedTool?.[1] ?? 0) === tool ? [Number(target[1])] : [];
  }).filter(value => Number.isFinite(value));
  const matches = (setValues: number[], waitValues: number[], intent: ThermalIntent): boolean => {
    const values = [...setValues, ...waitValues];
    if (intent.mode === "unheated") return values.every(value => value === 0);
    const target = (value: number) => Math.abs(value - intent.targetC) <= 0.01;
    return values.some(target) && (intent.wait === "not_required" || waitValues.some(target));
  };
  if (!matches(bedSet, bedWait, spec.thermalIntent.bed)) {
    return { id: "thermal_intent", status: "blocked", code: "bed_thermal_intent_mismatch" };
  }
  for (const tool of spec.thermalIntent.tools) {
    if (!matches(toolValues(tool.tool, "M104"), toolValues(tool.tool, "M109"), tool.intent)) {
      return { id: "thermal_intent", status: "blocked", code: "tool_thermal_intent_mismatch" };
    }
  }
  return { id: "thermal_intent", status: "passed", code: "thermal_intent_verified" };
};

const correspondenceCheck = (
  receipt: ThumbnailCorrespondenceReceipt | null,
  spec: PreparationSpec,
  manifestHash: Sha256,
  artifactHash: Sha256,
  thumbnails: ThumbnailEvidence[],
): PreparedArtifactCheck => {
  if (receipt === null) return { id: "thumbnail_correspondence", status: "unavailable", code: "correspondence_receipt_missing" };
  if (receipt.schemaVersion !== PREPARATION_SCHEMA_VERSION ||
      !new Set(["accepted", "rejected"]).has(receipt.decision) ||
      !new Set(["human-inspection", "deterministic-fixture"]).has(receipt.evidenceKind) ||
      !text(receipt.preparationRevision) || !SHA256.test(receipt.artifactSha256) ||
      !SHA256.test(receipt.manifestSha256) || !SHA256.test(receipt.plateLayoutSha256) ||
      !Array.isArray(receipt.thumbnails) || receipt.thumbnails.length === 0 ||
      receipt.thumbnails.length > MAX_THUMBNAILS || receipt.thumbnails.some((thumbnail, index) =>
        thumbnail.index !== index || thumbnail.format !== "png" || !SHA256.test(thumbnail.sha256) ||
        !positiveInteger(thumbnail.width, 4096) || !positiveInteger(thumbnail.height, 4096))) {
    return { id: "thumbnail_correspondence", status: "error", code: "correspondence_receipt_invalid" };
  }
  if (receipt.decision !== "accepted") return { id: "thumbnail_correspondence", status: "blocked", code: "correspondence_rejected" };
  if (receipt.preparationRevision !== spec.preparationRevision || receipt.artifactSha256 !== artifactHash ||
      receipt.manifestSha256 !== manifestHash || receipt.plateLayoutSha256 !== spec.plate.layoutSha256 ||
      canonicalize(receipt.thumbnails) !== canonicalize(thumbnails)) {
    return { id: "thumbnail_correspondence", status: "blocked", code: "correspondence_binding_mismatch" };
  }
  return { id: "thumbnail_correspondence", status: "passed", code: "correspondence_bound" };
};

export const validatePreparedArtifact = (input: PreparedArtifactValidationInput): PreparedArtifactValidationResult => {
  const base = { schemaVersion: PREPARATION_SCHEMA_VERSION, validationId: null,
    artifactSha256: null, manifestSha256: null, preparationSpecSha256: null,
    preparationRevision: null, targetFingerprint: null, thumbnails: [] as ThumbnailEvidence[] };
  if (!validSpec(input?.spec) || !validManifest(input?.manifest) || !(input?.artifactBytes instanceof Uint8Array) ||
      input.artifactBytes.length === 0 || input.artifactBytes.length > MAX_PREPARED_ARTIFACT_BYTES) {
    return { ...base, status: "error", checks: [{ id: "contract", status: "error", code: "input_contract_invalid" }] };
  }
  const specHash = hashPreparationSpec(input.spec);
  const manifestHash = hashPreparationManifest(input.manifest);
  const artifactHash = hashPreparedArtifact(input.artifactBytes);
  const checks: PreparedArtifactCheck[] = [{ id: "contract", status: "passed", code: "input_contract_valid" }];
  checks.push(input.manifest.artifact.sha256 === artifactHash && input.manifest.artifact.byteLength === input.artifactBytes.length ?
    { id: "artifact_identity", status: "passed", code: "artifact_identity_bound" } :
    { id: "artifact_identity", status: "blocked", code: "artifact_identity_mismatch" });
  checks.push(input.manifest.preparationSpecSha256 === specHash &&
    input.manifest.preparationRevision === input.spec.preparationRevision &&
    input.manifest.targetFingerprint === input.spec.targetFingerprint &&
    input.manifest.plateLayoutSha256 === input.spec.plate.layoutSha256 ?
    { id: "manifest_binding", status: "passed", code: "manifest_bound" } :
    { id: "manifest_binding", status: "blocked", code: "manifest_binding_mismatch" });
  const resolved = new Map(input.manifest.resolvedProcess.objects.map(object => [object.objectId, object]));
  const wallsMatch = input.spec.objects.length === resolved.size && input.spec.objects.every(object => {
    const actual = resolved.get(object.objectId);
    return actual?.meshSha256 === object.meshSha256 && actual.walls === object.desiredWalls;
  });
  checks.push(wallsMatch ? { id: "resolved_walls", status: "passed", code: "resolved_walls_match" } :
    { id: "resolved_walls", status: "blocked", code: "resolved_walls_mismatch" });
  checks.push(thermalCheck(input.artifactBytes, input.spec));
  const extraction = extractThumbnails(input.artifactBytes, input.spec);
  checks.push({ id: "embedded_thumbnails", status: extraction.status, code: extraction.status === "passed" ?
    "embedded_thumbnails_verified" : extraction.code });
  if (extraction.status === "passed") {
    checks.push(correspondenceCheck(input.correspondenceReceipt, input.spec, manifestHash, artifactHash, extraction.thumbnails));
  } else {
    checks.push({ id: "thumbnail_correspondence", status: "unavailable", code: "thumbnail_evidence_unavailable" });
  }
  const failure = checks.find(check => check.status !== "passed");
  const validationId = hash(canonicalize({
    contract: "prepared-artifact-validation/v1", preparationSpecSha256: specHash,
    manifestSha256: manifestHash, artifactSha256: artifactHash, thumbnails: extraction.status === "passed" ? extraction.thumbnails : [], checks,
  }));
  return {
    schemaVersion: PREPARATION_SCHEMA_VERSION,
    validationId,
    status: failure?.status ?? "passed",
    artifactSha256: artifactHash,
    manifestSha256: manifestHash,
    preparationSpecSha256: specHash,
    preparationRevision: input.spec.preparationRevision,
    targetFingerprint: input.spec.targetFingerprint,
    thumbnails: extraction.status === "passed" ? extraction.thumbnails : [],
    checks,
  };
};
