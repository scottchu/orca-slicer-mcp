import { createHash } from "node:crypto";
import { inflateSync } from "node:zlib";

export const PREPARATION_SCHEMA_VERSION = 1 as const;
export const PREPARED_ARTIFACT_VALIDATOR_VERSION = "prepared-artifact-validator/2" as const;
export const PREPARATION_REQUIREMENTS_VERSION = "preparation-requirements/1" as const;
export const MAX_PREPARED_ARTIFACT_BYTES = 64 * 1024 * 1024;
export const MAX_GCODE_LINES = 1_000_000;
export const MAX_GCODE_LINE_BYTES = 16 * 1024;
export const MAX_PREPARATION_OBJECTS = 64;
export const MAX_THUMBNAILS = 8;
export const MAX_THUMBNAIL_BASE64_BYTES = 4 * 1024 * 1024;
export const MAX_PNG_CHUNKS = 256;
export const MAX_PNG_COMPRESSED_BYTES = 4 * 1024 * 1024;
export const MAX_PNG_DECODED_BYTES = 64 * 1024 * 1024;
const MAX_TEXT_LENGTH = 128;
const SHA256 = /^[a-f0-9]{64}$/;
const OPAQUE_ID = /^[A-Za-z0-9][A-Za-z0-9_-]{15,127}$/;

export type Sha256 = string;
export type ValidationStatus = "passed" | "blocked" | "unavailable" | "error";
export type ThermalIntent =
  | { readonly mode: "unheated" }
  | { readonly mode: "heated"; readonly targetC: number; readonly wait: "required" | "not_required" };
export type PreparationSpec = {
  readonly schemaVersion: 1;
  /** Opaque prepared-job revision ID; never a path or user label. */
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
  readonly schemaVersion: 1;
  readonly preparationRevision: string;
  readonly preparationSpecSha256: Sha256;
  readonly artifact: { readonly sha256: Sha256; readonly byteLength: number; readonly mediaType: "text/x.gcode" };
  readonly targetFingerprint: Sha256;
  readonly plateLayoutSha256: Sha256;
  /** Informational slicer declaration only; never trusted as effective-wall evidence. */
  readonly resolvedProcess: {
    readonly globalWalls: number;
    readonly objects: ReadonlyArray<{
      readonly objectId: string;
      readonly meshSha256: Sha256;
      readonly walls: number;
      readonly wallSource: "global" | "object_override";
    }>;
  };
  readonly resolvedSettingsReceiptId: string;
  readonly thumbnailConfiguration: { readonly enabled: boolean };
};
export type ResolvedSettingsReceiptContent = {
  readonly schemaVersion: 1;
  readonly receiptId: string;
  readonly resolverVersion: string;
  readonly preparationRevision: string;
  readonly preparationSpecSha256: Sha256;
  readonly manifestSha256: Sha256;
  readonly artifactSha256: Sha256;
  readonly globalWalls: number;
  readonly objects: ReadonlyArray<{
    readonly objectId: string;
    readonly meshSha256: Sha256;
    readonly walls: number;
    readonly wallSource: "global" | "object_override";
  }>;
  /** Exact normalized custom startup lines approved as having known non-thermal semantics. */
  readonly approvedStartupCommandSha256: ReadonlyArray<Sha256>;
};
export type ResolvedSettingsReceipt = ResolvedSettingsReceiptContent & { readonly digest: Sha256 };
export type ThumbnailEvidence = {
  readonly index: number;
  readonly sha256: Sha256;
  readonly format: "png";
  readonly width: number;
  readonly height: number;
};
export type ThumbnailCorrespondenceReceiptContent = {
  readonly schemaVersion: 1;
  readonly receiptId: string;
  readonly decision: "accepted" | "rejected";
  readonly reviewerClass: "human-reviewer" | "deterministic-fixture-reviewer";
  readonly challengeSha256: Sha256;
  readonly preparationRevision: string;
  readonly artifactSha256: Sha256;
  readonly manifestSha256: Sha256;
  readonly plateLayoutSha256: Sha256;
  readonly thumbnails: ReadonlyArray<ThumbnailEvidence>;
};
export type ThumbnailCorrespondenceReceipt = ThumbnailCorrespondenceReceiptContent & { readonly digest: Sha256 };

/**
 * Internal validation input. Public adapters must accept only opaque IDs and
 * resolve these immutable trusted records before calling this pure function.
 */
export type PreparedArtifactValidationInput = {
  readonly spec: PreparationSpec;
  readonly manifest: PreparationManifest;
  readonly artifactBytes: Uint8Array;
  readonly resolvedSettingsReceipt: ResolvedSettingsReceipt | null;
  readonly correspondenceReceipt: ThumbnailCorrespondenceReceipt | null;
};
export type PreparedArtifactCheck = {
  readonly id: "contract" | "artifact_identity" | "manifest_binding" | "resolved_settings" | "resolved_walls" |
    "gcode_parse" | "thermal_intent" | "embedded_thumbnails" | "thumbnail_correspondence";
  readonly status: ValidationStatus;
  readonly code: string;
};
export type PreparedArtifactValidationReceipt = {
  readonly schemaVersion: 1;
  readonly validatorVersion: typeof PREPARED_ARTIFACT_VALIDATOR_VERSION;
  readonly requirementsVersion: typeof PREPARATION_REQUIREMENTS_VERSION;
  readonly validationId: Sha256 | null;
  readonly status: ValidationStatus;
  readonly artifactSha256: Sha256 | null;
  readonly manifestSha256: Sha256 | null;
  readonly preparationSpecSha256: Sha256 | null;
  readonly preparationRevision: string | null;
  readonly targetFingerprint: Sha256 | null;
  readonly resolvedSettingsReceiptId: string | null;
  readonly resolvedSettingsReceiptDigest: Sha256 | null;
  readonly correspondenceReceiptId: string | null;
  readonly correspondenceReceiptDigest: Sha256 | null;
  readonly thumbnails: ReadonlyArray<ThumbnailEvidence>;
  readonly checks: ReadonlyArray<PreparedArtifactCheck>;
};
export type PreparedArtifactValidationResult = PreparedArtifactValidationReceipt;

type HeaterState = { target: number | null; changedAt: number; waitedAt: number };
type ThermalTrace = {
  bed: HeaterState;
  tools: Map<number, HeaterState>;
  extrusionFound: boolean;
  firstExtrusionTool: number | null;
  extrusionBoundaryUnprovable: boolean;
  unknownStartup: boolean;
};
type ThumbnailBlock = { format: string | null; width: number; height: number; base64: string };
type ParsedGcode = { status: "passed" | "error"; code: string; thermal: ThermalTrace; thumbnails: ThumbnailBlock[] };

const hash = (value: Uint8Array | string): Sha256 => createHash("sha256").update(value).digest("hex");
const canonicalize = (value: unknown): string => {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(",")}]`;
  return `{${Object.entries(value as Record<string, unknown>)
    .sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0)
    .map(([key, item]) => `${JSON.stringify(key)}:${canonicalize(item)}`).join(",")}}`;
};
const receiptDigest = <T extends { readonly digest: Sha256 }>(receipt: T): Sha256 => {
  const { digest: _ignored, ...content } = receipt;
  return hash(canonicalize(content));
};
const cleanText = (value: unknown): value is string => typeof value === "string" && value.length > 0 &&
  value.length <= MAX_TEXT_LENGTH && !/[\p{Cc}\p{Cf}\p{Zl}\p{Zp}]/u.test(value);
const opaqueId = (value: unknown): value is string => typeof value === "string" && OPAQUE_ID.test(value);
const positiveInteger = (value: unknown, maximum: number): value is number => Number.isInteger(value) && Number(value) > 0 && Number(value) <= maximum;

export const hashPreparedArtifact = (bytes: Uint8Array): Sha256 => hash(bytes);
export const hashPreparationSpec = (spec: PreparationSpec): Sha256 => hash(canonicalize(spec));
export const hashPreparationManifest = (manifest: PreparationManifest): Sha256 => hash(canonicalize(manifest));
export const hashStartupCommand = (normalizedCommand: string): Sha256 => hash(normalizedCommand);
export const digestResolvedSettingsReceipt = (receipt: ResolvedSettingsReceipt): Sha256 => receiptDigest(receipt);
export const digestThumbnailCorrespondenceReceipt = (receipt: ThumbnailCorrespondenceReceipt): Sha256 => receiptDigest(receipt);

const validThermalIntent = (intent: ThermalIntent): boolean => intent?.mode === "unheated" ||
  (intent?.mode === "heated" && Number.isFinite(intent.targetC) && intent.targetC > 0 && intent.targetC <= 500 &&
    new Set(["required", "not_required"]).has(intent.wait));
const validSpec = (spec: PreparationSpec): boolean => {
  if (spec?.schemaVersion !== 1 || !opaqueId(spec.preparationRevision) || !SHA256.test(spec.targetFingerprint) ||
      !cleanText(spec.backend?.version) || !new Set(["orca-slicer", "snapmaker-orca"]).has(spec.backend?.id) ||
      !SHA256.test(spec.backend?.executableSha256) || !SHA256.test(spec.plate?.layoutSha256) ||
      !Array.isArray(spec.objects) || spec.objects.length === 0 || spec.objects.length > MAX_PREPARATION_OBJECTS ||
      !validThermalIntent(spec.thermalIntent?.bed) || !Array.isArray(spec.thermalIntent?.tools) ||
      spec.thermalIntent.tools.length > 16 || !Array.isArray(spec.thumbnailRequirements?.images) ||
      spec.thumbnailRequirements.images.length === 0 || spec.thumbnailRequirements.images.length > MAX_THUMBNAILS) return false;
  const objects = new Set<string>(); const tools = new Set<number>();
  for (const object of spec.objects) {
    if (!cleanText(object.objectId) || objects.has(object.objectId) || !SHA256.test(object.meshSha256) ||
        !positiveInteger(object.desiredWalls, 32)) return false;
    objects.add(object.objectId);
  }
  for (const tool of spec.thermalIntent.tools) {
    if (!Number.isInteger(tool.tool) || tool.tool < 0 || tool.tool > 15 || tools.has(tool.tool) || !validThermalIntent(tool.intent)) return false;
    tools.add(tool.tool);
  }
  return spec.thumbnailRequirements.images.every(image => image.format === "png" && positiveInteger(image.width, 4096) &&
    positiveInteger(image.height, 4096) && image.width * image.height <= 16_777_216);
};
const validResolvedObjects = (objects: PreparationManifest["resolvedProcess"]["objects"] | ResolvedSettingsReceipt["objects"],
  globalWalls: number): boolean => {
  const ids = new Set<string>();
  return objects.every(object => cleanText(object.objectId) && !ids.has(object.objectId) && ids.add(object.objectId) &&
    SHA256.test(object.meshSha256) && positiveInteger(object.walls, 32) &&
    new Set(["global", "object_override"]).has(object.wallSource) &&
    (object.wallSource !== "global" || object.walls === globalWalls));
};
const validManifest = (manifest: PreparationManifest): boolean => manifest?.schemaVersion === 1 &&
  opaqueId(manifest.preparationRevision) && SHA256.test(manifest.preparationSpecSha256) && SHA256.test(manifest.artifact?.sha256) &&
  positiveInteger(manifest.artifact?.byteLength, MAX_PREPARED_ARTIFACT_BYTES) && manifest.artifact?.mediaType === "text/x.gcode" &&
  SHA256.test(manifest.targetFingerprint) && SHA256.test(manifest.plateLayoutSha256) && opaqueId(manifest.resolvedSettingsReceiptId) &&
  positiveInteger(manifest.resolvedProcess?.globalWalls, 32) && Array.isArray(manifest.resolvedProcess?.objects) &&
  manifest.resolvedProcess.objects.length > 0 && manifest.resolvedProcess.objects.length <= MAX_PREPARATION_OBJECTS &&
  validResolvedObjects(manifest.resolvedProcess.objects, manifest.resolvedProcess.globalWalls) &&
  typeof manifest.thumbnailConfiguration?.enabled === "boolean";
const validResolvedSettings = (receipt: ResolvedSettingsReceipt): boolean => receipt?.schemaVersion === 1 && opaqueId(receipt.receiptId) &&
  cleanText(receipt.resolverVersion) && opaqueId(receipt.preparationRevision) && SHA256.test(receipt.preparationSpecSha256) &&
  SHA256.test(receipt.manifestSha256) && SHA256.test(receipt.artifactSha256) && SHA256.test(receipt.digest) &&
  positiveInteger(receipt.globalWalls, 32) && Array.isArray(receipt.objects) && receipt.objects.length > 0 &&
  receipt.objects.length <= MAX_PREPARATION_OBJECTS && validResolvedObjects(receipt.objects, receipt.globalWalls) &&
  Array.isArray(receipt.approvedStartupCommandSha256) && receipt.approvedStartupCommandSha256.length <= 32 &&
  receipt.approvedStartupCommandSha256.every((value, index, values) => SHA256.test(value) && values.indexOf(value) === index);

const newHeater = (): HeaterState => ({ target: null, changedAt: -1, waitedAt: -1 });
const allowedStartupCommands = new Set([
  "G0", "G1", "G4", "G20", "G21", "G28", "G29", "G90", "G91", "G92",
  "M17", "M18", "M73", "M82", "M83", "M84", "M106", "M107", "M117", "M118", "M201", "M203",
  "M204", "M205", "M220", "M221", "M400", "M420", "M500", "M900",
]);
type InterpretedParameter =
  | { readonly status: "absent" }
  | { readonly status: "present"; readonly value: number }
  | { readonly status: "ambiguous" };
const interpretedParameter = (command: string, names: string): InterpretedParameter => {
  const interpretedNames = new Set(names.toUpperCase());
  const tokens = command.split(" ").filter(token => interpretedNames.has(token[0]?.toUpperCase() ?? ""));
  if (tokens.length === 0) return { status: "absent" };
  if (tokens.length !== 1) return { status: "ambiguous" };
  const match = new RegExp(`^[${names}](-?(?:\\d+(?:\\.\\d*)?|\\.\\d+))$`, "i").exec(tokens[0]!);
  if (!match) return { status: "ambiguous" };
  const value = Number(match[1]);
  return Number.isFinite(value) ? { status: "present", value } : { status: "ambiguous" };
};
const commandOpcode = (command: string): string | null =>
  /^([GMT]\d+)(?=\s|$)/i.exec(command)?.[1]?.toUpperCase() ?? null;
const setHeater = (state: HeaterState, target: number, sequence: number, wait: boolean): void => {
  if (state.target !== target) { state.target = target; state.changedAt = sequence; }
  if (wait) state.waitedAt = sequence;
};
const thermalCommand = (command: string, trace: ThermalTrace, activeTool: number, sequence: number): boolean => {
  const code = commandOpcode(command);
  if (!code || !new Set(["M104", "M109", "M140", "M190"]).has(code)) return false;
  const wait = code === "M109" || code === "M190";
  const targetParameter = interpretedParameter(command, wait ? "SR" : "S");
  if (targetParameter.status !== "present" || targetParameter.value < 0 || targetParameter.value > 500) {
    trace.unknownStartup = true;
    return true;
  }
  const target = targetParameter.value;
  if (code === "M140" || code === "M190") setHeater(trace.bed, target, sequence, wait);
  else {
    const inlineTool = interpretedParameter(command, "T");
    if (inlineTool.status === "ambiguous") { trace.unknownStartup = true; return true; }
    const tool = inlineTool.status === "present" ? inlineTool.value : activeTool;
    if (!Number.isInteger(tool) || tool < 0 || tool > 15) { trace.unknownStartup = true; return true; }
    const state = trace.tools.get(tool) ?? newHeater(); trace.tools.set(tool, state); setHeater(state, target, sequence, wait);
  }
  return true;
};

const parseGcode = (bytes: Uint8Array, approved: ReadonlySet<Sha256>, signal?: AbortSignal): ParsedGcode => {
  const thermal: ThermalTrace = { bed: newHeater(), tools: new Map(), extrusionFound: false, firstExtrusionTool: null,
    extrusionBoundaryUnprovable: false, unknownStartup: false };
  const thumbnails: ThumbnailBlock[] = [];
  let source: string;
  try { source = new TextDecoder("utf-8", { fatal: true }).decode(bytes); }
  catch { return { status: "error", code: "gcode_invalid_utf8", thermal, thumbnails }; }
  let offset = 0; let lines = 0; let encodedTotal = 0; let activeTool = 0; let sequence = 0;
  let extrusionMode: "absolute" | "relative" | null = null;
  const extruderPositions = new Map<number, number>();
  let block: { format: string | null; width: number; height: number; declared: number; chunks: string[] } | null = null;
  while (offset <= source.length) {
    if ((lines & 1023) === 0 && signal?.aborted) return { status: "error", code: "validation_aborted", thermal, thumbnails };
    const newline = source.indexOf("\n", offset); const end = newline < 0 ? source.length : newline;
    let line = source.slice(offset, end); if (line.endsWith("\r")) line = line.slice(0, -1);
    lines += 1;
    if (lines > MAX_GCODE_LINES) return { status: "error", code: "gcode_line_count_exceeded", thermal, thumbnails };
    if (Buffer.byteLength(line, "utf8") > MAX_GCODE_LINE_BYTES) return { status: "error", code: "gcode_line_length_exceeded", thermal, thumbnails };
    if (block) {
      if (/^;\s*thumbnail(?:_(?:PNG|JPG|JPEG))?\s+end\s*$/i.test(line)) {
        const base64 = block.chunks.join("");
        if (base64.length !== block.declared) return { status: "error", code: "thumbnail_length_mismatch", thermal, thumbnails };
        thumbnails.push({ format: block.format, width: block.width, height: block.height, base64 }); block = null;
      } else {
        const payload = /^;\s*([A-Za-z0-9+/=]+)\s*$/.exec(line)?.[1];
        if (!payload) return { status: "error", code: "thumbnail_block_malformed", thermal, thumbnails };
        encodedTotal += payload.length;
        if (encodedTotal > MAX_THUMBNAIL_BASE64_BYTES) return { status: "error", code: "thumbnail_base64_limit_exceeded", thermal, thumbnails };
        block.chunks.push(payload);
      }
    } else {
      const begin = /^;\s*thumbnail(?:_(PNG|JPG|JPEG))?\s+begin\s+(\d+)x(\d+)\s+(\d+)\s*$/i.exec(line);
      if (begin) {
        if (thumbnails.length >= MAX_THUMBNAILS) return { status: "error", code: "thumbnail_count_exceeded", thermal, thumbnails };
        block = { format: begin[1]?.toLowerCase() ?? null, width: Number(begin[2]), height: Number(begin[3]),
          declared: Number(begin[4]), chunks: [] };
      } else if (!thermal.extrusionFound) {
        const command = line.split(";", 1)[0]!.trim().replaceAll(/\s+/g, " ");
        if (command) {
          sequence += 1;
          const selected = /^T(\d+)$/i.exec(command);
          const code = commandOpcode(command);
          if (selected) {
            activeTool = Number(selected[1]);
            if (activeTool < 0 || activeTool > 15) thermal.unknownStartup = true;
          } else if (code === "M82") extrusionMode = "absolute";
          else if (code === "M83") extrusionMode = "relative";
          else if (code === "G92") {
            const position = interpretedParameter(command, "E");
            if (position.status === "present") extruderPositions.set(activeTool, position.value);
            else if (position.status === "ambiguous" || /(?:^|\s)E/i.test(command)) thermal.extrusionBoundaryUnprovable = true;
          } else if ((code === "G0" || code === "G1") && /(?:^|\s)E/i.test(command)) {
            const commandedParameter = interpretedParameter(command, "E");
            if (commandedParameter.status !== "present" || extrusionMode === null) thermal.extrusionBoundaryUnprovable = true;
            else if (extrusionMode === "relative") {
              const commanded = commandedParameter.value;
              if (commanded > 0) { thermal.extrusionFound = true; thermal.firstExtrusionTool = activeTool; }
              const current = extruderPositions.get(activeTool);
              if (current !== undefined) extruderPositions.set(activeTool, current + commanded);
            } else {
              const commanded = commandedParameter.value;
              const current = extruderPositions.get(activeTool);
              if (current === undefined) thermal.extrusionBoundaryUnprovable = true;
              else if (commanded - current > 0) { thermal.extrusionFound = true; thermal.firstExtrusionTool = activeTool; }
              extruderPositions.set(activeTool, commanded);
            }
          } else if (!thermalCommand(command, thermal, activeTool, sequence)) {
            if ((!code || !allowedStartupCommands.has(code)) && !approved.has(hashStartupCommand(command))) thermal.unknownStartup = true;
          }
        }
      }
    }
    if (newline < 0) break;
    offset = newline + 1;
  }
  if (block) return { status: "error", code: "thumbnail_block_unterminated", thermal, thumbnails };
  return { status: "passed", code: "gcode_parsed", thermal, thumbnails };
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
const read32 = (bytes: Uint8Array, offset: number): number =>
  (((bytes[offset]! << 24) | (bytes[offset + 1]! << 16) | (bytes[offset + 2]! << 8) | bytes[offset + 3]!) >>> 0);
const paeth = (left: number, above: number, upperLeft: number): number => {
  const estimate = left + above - upperLeft;
  const leftDistance = Math.abs(estimate - left); const aboveDistance = Math.abs(estimate - above);
  const upperLeftDistance = Math.abs(estimate - upperLeft);
  return leftDistance <= aboveDistance && leftDistance <= upperLeftDistance ? left : aboveDistance <= upperLeftDistance ? above : upperLeft;
};
const decodePng = (bytes: Uint8Array): { width: number; height: number; meaningful: boolean } | null => {
  const signature = [137, 80, 78, 71, 13, 10, 26, 10];
  if (bytes.length < 45 || !signature.every((byte, index) => bytes[index] === byte)) return null;
  let offset = 8; let chunkCount = 0; let compressedLength = 0; let width = 0; let height = 0; let colorType = -1;
  let header = false; let ended = false; let idatSeen = false; let idatRunEnded = false;
  const compressedParts: Uint8Array[] = [];
  while (offset + 12 <= bytes.length) {
    chunkCount += 1; if (chunkCount > MAX_PNG_CHUNKS) return null;
    const length = read32(bytes, offset); if (offset + 12 + length > bytes.length) return null;
    const typeBytes = bytes.subarray(offset + 4, offset + 8); const type = Buffer.from(typeBytes).toString("ascii");
    const asciiLetter = (byte: number): boolean => (byte >= 65 && byte <= 90) || (byte >= 97 && byte <= 122);
    if (!Array.from(typeBytes).every(asciiLetter) || typeBytes[2]! < 65 || typeBytes[2]! > 90) return null;
    const data = bytes.subarray(offset + 8, offset + 8 + length); const crcInput = new Uint8Array(4 + length);
    crcInput.set(typeBytes); crcInput.set(data, 4);
    if (crc32(crcInput) !== read32(bytes, offset + 8 + length)) return null;
    if (type === "IHDR") {
      if (header || offset !== 8 || length !== 13) return null;
      width = read32(data, 0); height = read32(data, 4); colorType = data[9]!; header = true;
      if (!positiveInteger(width, 4096) || !positiveInteger(height, 4096) || width * height > 16_777_216 ||
          data[8] !== 8 || !new Set([0, 2, 4, 6]).has(colorType) || data[10] !== 0 || data[11] !== 0 || data[12] !== 0) return null;
    } else if (type === "IDAT") {
      if (!header || ended || idatRunEnded) return null;
      idatSeen = true;
      compressedLength += length; if (compressedLength > MAX_PNG_COMPRESSED_BYTES) return null; compressedParts.push(data);
    } else if (type === "IEND") {
      if (length !== 0) return null; ended = true; offset += 12; break;
    } else {
      if (/^[A-Z]/.test(type)) return null;
      if (idatSeen) idatRunEnded = true;
    }
    offset += 12 + length;
  }
  if (!header || !ended || compressedParts.length === 0 || offset !== bytes.length) return null;
  const compressed = new Uint8Array(compressedLength); let cursor = 0;
  for (const part of compressedParts) { compressed.set(part, cursor); cursor += part.length; }
  const pixelBytes = colorType === 0 ? 1 : colorType === 2 ? 3 : colorType === 4 ? 2 : 4;
  const rowBytes = width * pixelBytes; const inflatedLength = height * (rowBytes + 1);
  if (inflatedLength > MAX_PNG_DECODED_BYTES) return null;
  let inflated: Uint8Array;
  try { inflated = inflateSync(compressed, { maxOutputLength: inflatedLength }); } catch { return null; }
  if (inflated.length !== inflatedLength) return null;
  const decoded = new Uint8Array(height * rowBytes); let sourceOffset = 0;
  for (let row = 0; row < height; row++) {
    const filter = inflated[sourceOffset++]!; if (filter > 4) return null;
    const rowOffset = row * rowBytes;
    for (let column = 0; column < rowBytes; column++) {
      const raw = inflated[sourceOffset++]!;
      const left = column >= pixelBytes ? decoded[rowOffset + column - pixelBytes]! : 0;
      const above = row > 0 ? decoded[rowOffset - rowBytes + column]! : 0;
      const upperLeft = row > 0 && column >= pixelBytes ? decoded[rowOffset - rowBytes + column - pixelBytes]! : 0;
      const prediction = filter === 0 ? 0 : filter === 1 ? left : filter === 2 ? above : filter === 3 ?
        Math.floor((left + above) / 2) : paeth(left, above, upperLeft);
      decoded[rowOffset + column] = (raw + prediction) & 0xff;
    }
  }
  let first: string | null = null; let varied = false; let visible = false;
  for (let pixel = 0; pixel < width * height; pixel++) {
    const position = pixel * pixelBytes;
    visible ||= (colorType === 4 ? decoded[position + 1]! : colorType === 6 ? decoded[position + 3]! : 255) > 0;
    const value = Array.from(decoded.subarray(position, position + pixelBytes)).join(",");
    if (first === null) first = value; else varied ||= value !== first;
  }
  return { width, height, meaningful: visible && varied };
};
const strictBase64 = (value: string): Uint8Array | null => {
  if (!value || value.length % 4 !== 0 || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value)) return null;
  const bytes = Buffer.from(value, "base64");
  return bytes.length > 0 && bytes.toString("base64") === value ? bytes : null;
};
const validateThumbnails = (blocks: ThumbnailBlock[], spec: PreparationSpec): {
  check: PreparedArtifactCheck; evidence: ThumbnailEvidence[];
} => {
  if (blocks.length === 0) return { check: { id: "embedded_thumbnails", status: "blocked", code: "thumbnail_missing" }, evidence: [] };
  const evidence: ThumbnailEvidence[] = [];
  for (const [index, block] of blocks.entries()) {
    if (block.format === "jpg" || block.format === "jpeg") return {
      check: { id: "embedded_thumbnails", status: "unavailable", code: "thumbnail_format_not_decodable" }, evidence: [],
    };
    const bytes = strictBase64(block.base64); const png = bytes ? decodePng(bytes) : null;
    if (!png || !png.meaningful || png.width !== block.width || png.height !== block.height) return {
      check: { id: "embedded_thumbnails", status: "blocked", code: "thumbnail_invalid" }, evidence: [],
    };
    evidence.push({ index, sha256: hash(bytes!), format: "png", width: png.width, height: png.height });
  }
  const requirements = spec.thumbnailRequirements.images;
  if (evidence.length !== requirements.length || evidence.some((item, index) => {
    const required = requirements[index];
    return !required || item.format !== required.format || item.width !== required.width || item.height !== required.height;
  })) return { check: { id: "embedded_thumbnails", status: "blocked", code: "thumbnail_requirements_mismatch" }, evidence: [] };
  return { check: { id: "embedded_thumbnails", status: "passed", code: "embedded_thumbnails_verified" }, evidence };
};
const validateThermal = (trace: ThermalTrace, spec: PreparationSpec): PreparedArtifactCheck => {
  if (trace.extrusionBoundaryUnprovable) {
    return { id: "thermal_intent", status: "unavailable", code: "thermal_extrusion_boundary_unavailable" };
  }
  if (!trace.extrusionFound) return { id: "thermal_intent", status: "unavailable", code: "thermal_extrusion_boundary_unavailable" };
  if (trace.firstExtrusionTool === null) {
    return { id: "thermal_intent", status: "unavailable", code: "thermal_extrusion_boundary_unavailable" };
  }
  if (trace.unknownStartup) return { id: "thermal_intent", status: "unavailable", code: "thermal_startup_semantics_unapproved" };
  const matches = (state: HeaterState | undefined, intent: ThermalIntent): boolean => {
    const target = state?.target ?? null;
    if (intent.mode === "unheated") return target === null || target === 0;
    return target !== null && Math.abs(target - intent.targetC) <= 0.01 &&
      (intent.wait === "not_required" || (state?.waitedAt ?? -1) >= (state?.changedAt ?? 0));
  };
  const declared = new Map(spec.thermalIntent.tools.map(item => [item.tool, item.intent]));
  const extrusionIntent = declared.get(trace.firstExtrusionTool);
  if (!extrusionIntent) return { id: "thermal_intent", status: "blocked", code: "extrusion_tool_undeclared" };
  if (!matches(trace.tools.get(trace.firstExtrusionTool), extrusionIntent)) {
    return { id: "thermal_intent", status: "blocked", code: "extrusion_tool_thermal_intent_mismatch" };
  }
  if (!matches(trace.bed, spec.thermalIntent.bed)) return { id: "thermal_intent", status: "blocked", code: "bed_thermal_intent_mismatch" };
  for (const [tool, state] of trace.tools) {
    if (!declared.has(tool) && state.target !== null && state.target !== 0) {
      return { id: "thermal_intent", status: "blocked", code: "undeclared_tool_thermal_target" };
    }
  }
  for (const [tool, intent] of declared) {
    if (!matches(trace.tools.get(tool), intent)) return { id: "thermal_intent", status: "blocked", code: "tool_thermal_intent_mismatch" };
  }
  return { id: "thermal_intent", status: "passed", code: "thermal_intent_verified" };
};
const aggregateStatus = (checks: ReadonlyArray<PreparedArtifactCheck>): ValidationStatus => {
  const severity: Record<ValidationStatus, number> = { passed: 0, blocked: 1, unavailable: 2, error: 3 };
  return checks.reduce<ValidationStatus>((status, check) => severity[check.status] > severity[status] ? check.status : status, "passed");
};

export const validatePreparedArtifact = (
  input: PreparedArtifactValidationInput,
  options: { readonly signal?: AbortSignal } = {},
): PreparedArtifactValidationReceipt => {
  const base = { schemaVersion: 1 as const, validatorVersion: PREPARED_ARTIFACT_VALIDATOR_VERSION,
    requirementsVersion: PREPARATION_REQUIREMENTS_VERSION, validationId: null, artifactSha256: null,
    manifestSha256: null, preparationSpecSha256: null, preparationRevision: null, targetFingerprint: null,
    resolvedSettingsReceiptId: null, resolvedSettingsReceiptDigest: null, correspondenceReceiptId: null,
    correspondenceReceiptDigest: null, thumbnails: [] as ThumbnailEvidence[] };
  if (!validSpec(input?.spec) || !validManifest(input?.manifest) || !(input?.artifactBytes instanceof Uint8Array) ||
      input.artifactBytes.length === 0 || input.artifactBytes.length > MAX_PREPARED_ARTIFACT_BYTES) {
    return { ...base, status: "error", checks: [{ id: "contract", status: "error", code: "input_contract_invalid" }] };
  }
  const specHash = hashPreparationSpec(input.spec); const manifestHash = hashPreparationManifest(input.manifest);
  const artifactHash = hashPreparedArtifact(input.artifactBytes);
  const checks: PreparedArtifactCheck[] = [{ id: "contract", status: "passed", code: "input_contract_valid" }];
  checks.push(input.manifest.artifact.sha256 === artifactHash && input.manifest.artifact.byteLength === input.artifactBytes.length ?
    { id: "artifact_identity", status: "passed", code: "artifact_identity_bound" } :
    { id: "artifact_identity", status: "blocked", code: "artifact_identity_mismatch" });
  checks.push(input.manifest.preparationSpecSha256 === specHash && input.manifest.preparationRevision === input.spec.preparationRevision &&
    input.manifest.targetFingerprint === input.spec.targetFingerprint && input.manifest.plateLayoutSha256 === input.spec.plate.layoutSha256 ?
    { id: "manifest_binding", status: "passed", code: "manifest_bound" } :
    { id: "manifest_binding", status: "blocked", code: "manifest_binding_mismatch" });
  const settings = input.resolvedSettingsReceipt;
  const settingsValid = settings !== null && validResolvedSettings(settings) && digestResolvedSettingsReceipt(settings) === settings.digest;
  const settingsBound = settingsValid && settings.receiptId === input.manifest.resolvedSettingsReceiptId &&
    settings.preparationRevision === input.spec.preparationRevision && settings.preparationSpecSha256 === specHash &&
    settings.manifestSha256 === manifestHash && settings.artifactSha256 === artifactHash;
  checks.push(settings === null ? { id: "resolved_settings", status: "unavailable", code: "resolved_settings_receipt_missing" } :
    !settingsValid ? { id: "resolved_settings", status: "error", code: "resolved_settings_receipt_invalid" } :
    !settingsBound ? { id: "resolved_settings", status: "blocked", code: "resolved_settings_binding_mismatch" } :
    { id: "resolved_settings", status: "passed", code: "resolved_settings_bound" });
  const resolved = settingsBound ? new Map(settings.objects.map(object => [object.objectId, object])) :
    new Map<string, ResolvedSettingsReceipt["objects"][number]>();
  const wallsMatch = settingsBound && input.spec.objects.length === resolved.size && input.spec.objects.every(object => {
    const actual = resolved.get(object.objectId);
    return actual?.meshSha256 === object.meshSha256 && actual.walls === object.desiredWalls;
  });
  checks.push(!settingsBound ? { id: "resolved_walls", status: "unavailable", code: "resolved_walls_evidence_unavailable" } : wallsMatch ?
    { id: "resolved_walls", status: "passed", code: "resolved_walls_match" } :
    { id: "resolved_walls", status: "blocked", code: "resolved_walls_mismatch" });
  const parsed = parseGcode(input.artifactBytes, new Set(settingsBound ? settings.approvedStartupCommandSha256 : []), options.signal);
  checks.push({ id: "gcode_parse", status: parsed.status, code: parsed.code });
  checks.push(parsed.status === "passed" ? validateThermal(parsed.thermal, input.spec) :
    { id: "thermal_intent", status: "unavailable", code: "thermal_evidence_unavailable" });
  const thumbnail = parsed.status === "passed" ? validateThumbnails(parsed.thumbnails, input.spec) : {
    check: { id: "embedded_thumbnails", status: "unavailable", code: "thumbnail_evidence_unavailable" } as PreparedArtifactCheck,
    evidence: [] as ThumbnailEvidence[],
  };
  checks.push(thumbnail.check);
  const correspondence = input.correspondenceReceipt;
  const correspondenceShape = correspondence !== null && correspondence.schemaVersion === 1 && opaqueId(correspondence.receiptId) &&
    new Set(["accepted", "rejected"]).has(correspondence.decision) &&
    new Set(["human-reviewer", "deterministic-fixture-reviewer"]).has(correspondence.reviewerClass) &&
    SHA256.test(correspondence.challengeSha256) && SHA256.test(correspondence.digest) &&
    opaqueId(correspondence.preparationRevision) && SHA256.test(correspondence.artifactSha256) &&
    SHA256.test(correspondence.manifestSha256) && SHA256.test(correspondence.plateLayoutSha256) &&
    Array.isArray(correspondence.thumbnails) && correspondence.thumbnails.length > 0 &&
    correspondence.thumbnails.length <= MAX_THUMBNAILS && correspondence.thumbnails.every((item, index) =>
      item.index === index && item.format === "png" && SHA256.test(item.sha256) &&
      positiveInteger(item.width, 4096) && positiveInteger(item.height, 4096));
  const correspondenceValid = correspondenceShape && digestThumbnailCorrespondenceReceipt(correspondence!) === correspondence!.digest;
  const correspondenceBound = correspondenceValid && correspondence!.preparationRevision === input.spec.preparationRevision &&
    correspondence!.artifactSha256 === artifactHash && correspondence!.manifestSha256 === manifestHash &&
    correspondence!.plateLayoutSha256 === input.spec.plate.layoutSha256 &&
    canonicalize(correspondence!.thumbnails) === canonicalize(thumbnail.evidence);
  checks.push(correspondence === null ? { id: "thumbnail_correspondence", status: "unavailable", code: "correspondence_receipt_missing" } :
    !correspondenceValid ? { id: "thumbnail_correspondence", status: "error", code: "correspondence_receipt_invalid" } :
    correspondence.decision !== "accepted" ? { id: "thumbnail_correspondence", status: "blocked", code: "correspondence_rejected" } :
    !correspondenceBound ? { id: "thumbnail_correspondence", status: "blocked", code: "correspondence_binding_mismatch" } :
    { id: "thumbnail_correspondence", status: "passed", code: "correspondence_bound" });
  const status = aggregateStatus(checks);
  const settingsDigest = settingsValid ? settings.digest : null; const correspondenceDigest = correspondenceValid ? correspondence!.digest : null;
  const validationId = hash(canonicalize({ validatorVersion: PREPARED_ARTIFACT_VALIDATOR_VERSION,
    requirementsVersion: PREPARATION_REQUIREMENTS_VERSION, artifactHash, manifestHash, specHash,
    targetFingerprint: input.spec.targetFingerprint, preparationRevision: input.spec.preparationRevision,
    resolvedSettingsReceiptId: settingsValid ? settings.receiptId : null, resolvedSettingsReceiptDigest: settingsDigest,
    resolverVersion: settingsValid ? settings.resolverVersion : null,
    correspondenceReceiptId: correspondenceValid ? correspondence!.receiptId : null,
    correspondenceReceiptDigest: correspondenceDigest, reviewerClass: correspondenceValid ? correspondence!.reviewerClass : null,
    challengeSha256: correspondenceValid ? correspondence!.challengeSha256 : null,
    layoutSha256: input.spec.plate.layoutSha256, thumbnailRequirements: input.spec.thumbnailRequirements,
    thumbnails: thumbnail.evidence, checks }));
  return { schemaVersion: 1, validatorVersion: PREPARED_ARTIFACT_VALIDATOR_VERSION,
    requirementsVersion: PREPARATION_REQUIREMENTS_VERSION, validationId, status, artifactSha256: artifactHash,
    manifestSha256: manifestHash, preparationSpecSha256: specHash, preparationRevision: input.spec.preparationRevision,
    targetFingerprint: input.spec.targetFingerprint, resolvedSettingsReceiptId: settingsValid ? settings.receiptId : null,
    resolvedSettingsReceiptDigest: settingsDigest, correspondenceReceiptId: correspondenceValid ? correspondence!.receiptId : null,
    correspondenceReceiptDigest: correspondenceDigest, thumbnails: thumbnail.evidence, checks };
};
