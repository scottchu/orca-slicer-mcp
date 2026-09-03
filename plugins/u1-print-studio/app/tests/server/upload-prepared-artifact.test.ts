import { describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { deflateSync } from "node:zlib";

import {
  digestResolvedSettingsReceipt,
  digestThumbnailCorrespondenceReceipt,
  hashPreparationManifest,
  hashPreparationSpec,
  hashPreparedArtifact,
  validatePreparedArtifact,
  type PreparedArtifactValidationInput,
  type PreparationManifest,
  type PreparationSpec,
  type ResolvedSettingsReceipt,
  type ThumbnailCorrespondenceReceipt,
} from "../../src/lib/server/preparation/prepared-artifact.js";
import {
  digestStoredValidationReceipt,
  digestTargetPreflight,
  digestUploadAuthorization,
  uploadPreparedArtifact,
  type GuardedUploadPorts,
  type GuardedUploadRequest,
  type InternalUploadActionRecord,
  type StoredValidationReceipt,
  type TargetPreflight,
  type UploadAdapterOutcome,
  type UploadAuthorization,
} from "../../src/lib/server/application/upload-prepared-artifact.js";

const sha = (value: string): string => createHash("sha256").update(value).digest("hex");
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
const u32 = (value: number): Uint8Array => new Uint8Array([
  (value >>> 24) & 0xff, (value >>> 16) & 0xff, (value >>> 8) & 0xff, value & 0xff,
]);
const chunk = (type: string, data: Uint8Array): Uint8Array => {
  const name = new TextEncoder().encode(type); const crcInput = new Uint8Array(name.length + data.length);
  crcInput.set(name); crcInput.set(data, name.length);
  const output = new Uint8Array(12 + data.length);
  output.set(u32(data.length)); output.set(name, 4); output.set(data, 8); output.set(u32(crc32(crcInput)), 8 + data.length);
  return output;
};
const image = (): Uint8Array => {
  const header = new Uint8Array(13); header.set(u32(2)); header.set(u32(1), 4); header[8] = 8; header[9] = 2;
  const parts = [new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", header),
    chunk("IDAT", deflateSync(new Uint8Array([0, 255, 0, 0, 0, 0, 255]))), chunk("IEND", new Uint8Array())];
  const output = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0)); let offset = 0;
  for (const part of parts) { output.set(part, offset); offset += part.length; }
  return output;
};
const thumbnail = image(); const base64 = Buffer.from(thumbnail).toString("base64");
const artifact = (): Uint8Array => new TextEncoder().encode([
  "M82", "G92 E0", "M140 S60", "M190 S60", "M104 T0 S210", "M109 T0 S210",
  `; thumbnail begin 2x1 ${base64.length}`, `; ${base64}`, "; thumbnail end", "G1 E0.5", "M104 S0", "M140 S0", "",
].join("\n"));

const buildValidationInput = (options: { walls?: number; settings?: "missing"; correspondence?: "invalid" } = {}): PreparedArtifactValidationInput => {
  const bytes = artifact();
  const spec: PreparationSpec = {
    schemaVersion: 1, preparationRevision: "prepared_revision_0001", targetFingerprint: sha("target"),
    backend: { id: "orca-slicer", version: "fixture-1", executableSha256: sha("executable") },
    plate: { layoutSha256: sha("layout") }, objects: [{ objectId: "fixture-object", meshSha256: sha("mesh"), desiredWalls: 3 }],
    thermalIntent: { bed: { mode: "heated", targetC: 60, wait: "required" },
      tools: [{ tool: 0, intent: { mode: "heated", targetC: 210, wait: "required" } }] },
    thumbnailRequirements: { images: [{ format: "png", width: 2, height: 1 }] },
  };
  const manifest: PreparationManifest = {
    schemaVersion: 1, preparationRevision: spec.preparationRevision, preparationSpecSha256: hashPreparationSpec(spec),
    artifact: { sha256: hashPreparedArtifact(bytes), byteLength: bytes.length, mediaType: "text/x.gcode" },
    targetFingerprint: spec.targetFingerprint, plateLayoutSha256: spec.plate.layoutSha256,
    resolvedProcess: { globalWalls: 2, objects: [{ objectId: "fixture-object", meshSha256: sha("mesh"), walls: 3,
      wallSource: "object_override" }] }, resolvedSettingsReceiptId: "resolved_settings_0001",
    thumbnailConfiguration: { enabled: true },
  };
  const manifestHash = hashPreparationManifest(manifest);
  let settings = { schemaVersion: 1 as const, receiptId: "resolved_settings_0001", resolverVersion: "fixture-resolver/1",
    preparationRevision: spec.preparationRevision, preparationSpecSha256: hashPreparationSpec(spec), manifestSha256: manifestHash,
    artifactSha256: hashPreparedArtifact(bytes), globalWalls: 2, objects: [{ objectId: "fixture-object", meshSha256: sha("mesh"),
      walls: options.walls ?? 3, wallSource: "object_override" as const }], approvedStartupCommandSha256: [], digest: "" };
  settings = { ...settings, digest: digestResolvedSettingsReceipt(settings as ResolvedSettingsReceipt) };
  let correspondence = { schemaVersion: 1 as const, receiptId: "correspondence_receipt_0001", decision: "accepted" as const,
    reviewerClass: "deterministic-fixture-reviewer" as const, challengeSha256: sha("challenge"),
    preparationRevision: spec.preparationRevision, artifactSha256: hashPreparedArtifact(bytes), manifestSha256: manifestHash,
    plateLayoutSha256: spec.plate.layoutSha256,
    thumbnails: [{ index: 0, sha256: hashPreparedArtifact(thumbnail), format: "png" as const, width: 2, height: 1 }], digest: "" };
  correspondence = { ...correspondence,
    digest: digestThumbnailCorrespondenceReceipt(correspondence as ThumbnailCorrespondenceReceipt) };
  if (options.correspondence === "invalid") correspondence = { ...correspondence, digest: sha("forged") };
  return { spec, manifest, artifactBytes: bytes,
    resolvedSettingsReceipt: options.settings === "missing" ? null : settings as ResolvedSettingsReceipt,
    correspondenceReceipt: correspondence as ThumbnailCorrespondenceReceipt };
};

const request = (overrides: Partial<GuardedUploadRequest> = {}): GuardedUploadRequest => ({
  preparedJobRevisionId: "prepared_revision_0001", validationReceiptId: "validation_receipt_0001",
  uploadAuthorizationId: "upload_authorization_0001", targetPreflightId: "target_preflight_0001",
  idempotencyKey: "idempotency_key_0001", correlationId: "correlation_id_0001", ...overrides,
});

type HarnessOptions = {
  validationInput?: PreparedArtifactValidationInput;
  storedValidationInput?: PreparedArtifactValidationInput;
  validationRecord?: "missing" | "expired" | "mismatch";
  validationExpiresAt?: string;
  preflight?: "missing" | "blocked" | "unavailable" | "mismatch";
  preflightExpiresAt?: string;
  authorization?: "expired" | "mismatch";
  authorizationExpiresAt?: string;
  authorizationClaimedAt?: string;
  coordinatorTimes?: ReadonlyArray<string>;
  adapterOutcome?: UploadAdapterOutcome;
  upload?: GuardedUploadPorts["uploader"]["upload"];
  replayRecord?: "polluted-result" | "polluted-record" | "invalid-status-code" | "invalid-verification";
};
const harness = (options: HarnessOptions = {}) => {
  const validationInput = options.validationInput ?? buildValidationInput();
  const validation = validatePreparedArtifact(options.storedValidationInput ?? validationInput);
  const storedReceiptValue = options.validationRecord === "mismatch" ?
    { ...validation, validationId: sha("other-validation") } : validation;
  let storedValidation = { schemaVersion: 1 as const, receiptId: "validation_receipt_0001",
    preparedJobRevisionId: "prepared_revision_0001", issuedAt: "2026-09-03T11:00:00.000Z",
    expiresAt: options.validationExpiresAt ?? (options.validationRecord === "expired" ?
      "2026-09-03T11:30:00.000Z" : "2026-09-03T13:00:00.000Z"),
    receipt: storedReceiptValue, digest: "" };
  storedValidation = { ...storedValidation,
    digest: digestStoredValidationReceipt(storedValidation as StoredValidationReceipt) };
  let preflight = { schemaVersion: 1 as const, preflightId: "target_preflight_0001",
    status: options.preflight === "blocked" ? "blocked" as const : options.preflight === "unavailable" ? "unavailable" as const : "passed" as const,
    preparedJobRevisionId: "prepared_revision_0001", validationId: validation.validationId!,
    artifactSha256: validation.artifactSha256!, manifestSha256: validation.manifestSha256!,
    targetFingerprint: options.preflight === "mismatch" ? sha("other-target") : validation.targetFingerprint!,
    checkedAt: "2026-09-03T11:55:00.000Z", expiresAt: options.preflightExpiresAt ?? "2026-09-03T12:30:00.000Z",
    digest: "" };
  preflight = { ...preflight, digest: digestTargetPreflight(preflight as TargetPreflight) };
  let authorization = { schemaVersion: 1 as const, authorizationId: "upload_authorization_0001", action: "upload" as const,
    preparedJobRevisionId: "prepared_revision_0001", validationId: validation.validationId!,
    artifactSha256: validation.artifactSha256!, manifestSha256: validation.manifestSha256!,
    targetFingerprint: options.authorization === "mismatch" ? sha("other-target") : validation.targetFingerprint!,
    correlationId: "correlation_id_0001", issuedAt: "2026-09-03T11:50:00.000Z",
    expiresAt: options.authorizationExpiresAt ?? (options.authorization === "expired" ?
      "2026-09-03T11:59:00.000Z" : "2026-09-03T12:30:00.000Z"), digest: "" };
  authorization = { ...authorization, digest: digestUploadAuthorization(authorization as UploadAuthorization) };
  const actions = new Map<string, { fingerprint: string; actionId: string; record: InternalUploadActionRecord | null }>();
  let actionCounter = 0; let authorizationConsumed = false; let uploadCalls = 0; let deadlineCloses = 0;
  let authorizationClaimHadNow = false;
  let coordinatorTimeIndex = 0;
  const coordinatorTimes = options.coordinatorTimes ?? ["2026-09-03T12:00:00.000Z"];
  const deadlineControllers: AbortController[] = []; const deadlineDurations: number[] = [];
  const ports: GuardedUploadPorts = {
    clock: {
      now: () => new Date(coordinatorTimes[Math.min(coordinatorTimeIndex++, coordinatorTimes.length - 1)]!),
      openDeadline: (milliseconds, parent) => {
        deadlineDurations.push(milliseconds);
        const controller = new AbortController(); deadlineControllers.push(controller);
        const abort = () => controller.abort();
        if (parent?.aborted) controller.abort(); else parent?.addEventListener("abort", abort, { once: true });
        return { signal: controller.signal, close: () => { deadlineCloses += 1; parent?.removeEventListener("abort", abort); } };
      },
    },
    preparedArtifacts: { resolve: async id => id === "prepared_revision_0001" ?
      { preparedJobRevisionId: id, validationInput } : null },
    validationReceipts: { resolve: async id => id === "validation_receipt_0001" && options.validationRecord !== "missing" ?
      storedValidation as StoredValidationReceipt : null },
    targetPreflights: { resolve: async id => id === "target_preflight_0001" && options.preflight !== "missing" ?
      preflight as TargetPreflight : null },
    actions: {
      claim: async claim => {
        const existing = actions.get(claim.idempotencyKey);
        if (existing) return existing.fingerprint === claim.requestFingerprint ?
          { status: "replay" as const, actionId: existing.actionId, record: existing.record } : { status: "conflict" as const };
        actionCounter += 1; const actionId = `upload_action_${String(actionCounter).padStart(4, "0")}`;
        actions.set(claim.idempotencyKey, { fingerprint: claim.requestFingerprint, actionId, record: null });
        return { status: "claimed" as const, actionId };
      },
      complete: async record => {
        const entry = [...actions.entries()].find(([, value]) => value.actionId === record.actionId);
        if (!entry) throw new Error("missing action");
        let replayRecord: unknown = record;
        if (options.replayRecord === "polluted-result") replayRecord = {
          ...record, result: { ...record.result, remoteArtifactId: "private-leak", idempotencyKey: "private-key" },
        };
        if (options.replayRecord === "polluted-record") replayRecord = { ...record, idempotencyKey: "private-key" };
        if (options.replayRecord === "invalid-status-code") replayRecord = {
          ...record, result: { ...record.result, status: "acknowledged", code: "upload_rejected" },
        };
        if (options.replayRecord === "invalid-verification") replayRecord = {
          ...record, result: { ...record.result, requiresVerification: false },
        };
        actions.set(entry[0], { ...entry[1], record: replayRecord as InternalUploadActionRecord });
      },
    },
    authorizations: {
      claim: async claim => {
        authorizationClaimHadNow ||= "now" in claim;
        const transactionNow = new Date(options.authorizationClaimedAt ?? "2026-09-03T12:00:00.000Z");
        if (authorizationConsumed) return { status: "blocked" as const, code: "consumed" as const };
        if (Date.parse(authorization.expiresAt) <= transactionNow.valueOf()) {
          return { status: "blocked" as const, code: "expired" as const };
        }
        if (authorization.authorizationId !== claim.expected.authorizationId ||
            authorization.preparedJobRevisionId !== claim.expected.preparedJobRevisionId ||
            authorization.validationId !== claim.expected.validationId || authorization.artifactSha256 !== claim.expected.artifactSha256 ||
            authorization.manifestSha256 !== claim.expected.manifestSha256 || authorization.targetFingerprint !== claim.expected.targetFingerprint ||
            authorization.correlationId !== claim.expected.correlationId) return { status: "blocked" as const, code: "binding_mismatch" as const };
        authorizationConsumed = true;
        return { status: "claimed" as const, authorization: authorization as UploadAuthorization,
          consumedAt: transactionNow.toISOString() };
      },
    },
    uploader: { upload: async uploadRequest => {
      uploadCalls += 1;
      if (options.upload) return options.upload(uploadRequest);
      return options.adapterOutcome ?? { status: "acknowledged", remoteArtifactId: "/private/remote-artifact.gcode" };
    } },
  };
  return { ports, validationInput, abortDeadline: () => deadlineControllers.at(-1)?.abort(),
    get uploadCalls() { return uploadCalls; }, get deadlineCloses() { return deadlineCloses; },
    get deadlineDurations() { return deadlineDurations; },
    get authorizationClaimHadNow() { return authorizationClaimHadNow; },
    get completedRecords() { return [...actions.values()].flatMap(entry => entry.record ? [entry.record] : []); } };
};

describe("trusted guarded-upload boundary", () => {
  test("rejects raw caller gates and caller time before resolving or uploading", async () => {
    const run = harness();
    const forged = { ...request(), now: "1999-01-01T00:00:00.000Z", artifactBytes: artifact(), authorization: {} };
    expect(await uploadPreparedArtifact(forged as unknown as GuardedUploadRequest, run.ports)).toMatchObject({
      status: "error", code: "request_contract_invalid", actionId: null,
    });
    expect(run.uploadCalls).toBe(0);
    expect(run.deadlineCloses).toBe(0);
  });

  test("uses server time for expired validation and authorization", async () => {
    for (const options of [{ validationRecord: "expired" }, { authorization: "expired" }] as HarnessOptions[]) {
      const run = harness(options); const output = await uploadPreparedArtifact(request(), run.ports);
      expect(output.status).toBe("blocked"); expect(run.uploadCalls).toBe(0); expect(run.deadlineCloses).toBe(1);
    }
  });

  test("fails closed when authorization or freshness expires during asynchronous claims", async () => {
    const authorizationExpiry = harness({ authorizationExpiresAt: "2026-09-03T12:00:01.000Z",
      authorizationClaimedAt: "2026-09-03T12:00:02.000Z" });
    const authorizationExpired = await uploadPreparedArtifact(request(), authorizationExpiry.ports);
    expect(authorizationExpired).toMatchObject({
      status: "blocked", code: "authorization_expired",
    });
    expect(await uploadPreparedArtifact(request(), authorizationExpiry.ports)).toEqual({ ...authorizationExpired, replay: true });
    expect(authorizationExpiry.uploadCalls).toBe(0); expect(authorizationExpiry.authorizationClaimHadNow).toBe(false);

    const validationExpiry = harness({ validationExpiresAt: "2026-09-03T12:00:01.000Z",
      preflightExpiresAt: "2026-09-03T13:00:00.000Z", authorizationExpiresAt: "2026-09-03T13:00:00.000Z",
      authorizationClaimedAt: "2026-09-03T12:00:01.500Z",
      coordinatorTimes: ["2026-09-03T12:00:00.000Z", "2026-09-03T12:00:02.000Z"] });
    const validationExpired = await uploadPreparedArtifact(request(), validationExpiry.ports);
    expect(validationExpired).toMatchObject({
      status: "blocked", code: "validation_receipt_expired",
    });
    expect(await uploadPreparedArtifact(request(), validationExpiry.ports)).toEqual({ ...validationExpired, replay: true });
    expect(validationExpiry.uploadCalls).toBe(0);

    const preflightExpiry = harness({ validationExpiresAt: "2026-09-03T13:00:00.000Z",
      preflightExpiresAt: "2026-09-03T12:00:01.000Z", authorizationExpiresAt: "2026-09-03T13:00:00.000Z",
      authorizationClaimedAt: "2026-09-03T12:00:01.500Z",
      coordinatorTimes: ["2026-09-03T12:00:00.000Z", "2026-09-03T12:00:02.000Z"] });
    const preflightExpired = await uploadPreparedArtifact(request(), preflightExpiry.ports);
    expect(preflightExpired).toMatchObject({
      status: "blocked", code: "target_preflight_expired",
    });
    expect(await uploadPreparedArtifact(request(), preflightExpiry.ports)).toEqual({ ...preflightExpired, replay: true });
    expect(preflightExpiry.uploadCalls).toBe(0);
  });

  test("keeps every missing or mismatched trusted gate at zero effects", async () => {
    const variants: HarnessOptions[] = [
      { validationInput: buildValidationInput({ settings: "missing" }) },
      { validationInput: buildValidationInput({ walls: 4 }) },
      { validationInput: buildValidationInput({ correspondence: "invalid" }) },
      { validationRecord: "missing" }, { validationRecord: "mismatch" },
      { preflight: "missing" }, { preflight: "blocked" }, { preflight: "unavailable" }, { preflight: "mismatch" },
      { authorization: "mismatch" },
    ];
    for (const options of variants) {
      const run = harness(options); expect((await uploadPreparedArtifact(request(), run.ports)).status).not.toBe("acknowledged");
      expect(run.uploadCalls).toBe(0);
    }
  });

  test("rejects artifact bytes mutated after the stored validation receipt", async () => {
    const original = buildValidationInput();
    const mutated = { ...original, artifactBytes: new Uint8Array([...original.artifactBytes, 10]) };
    const mutatedRun = harness({ validationInput: mutated, storedValidationInput: original });
    expect((await uploadPreparedArtifact(request(), mutatedRun.ports)).status).not.toBe("acknowledged");
    expect(mutatedRun.uploadCalls).toBe(0);
  });
});

describe("idempotent authorization and effect outcomes", () => {
  test("sequential replay three times performs one effect and returns the stable record", async () => {
    const run = harness(); const first = await uploadPreparedArtifact(request(), run.ports);
    const second = await uploadPreparedArtifact(request(), run.ports); const third = await uploadPreparedArtifact(request(), run.ports);
    expect(first).toMatchObject({ status: "acknowledged", code: "upload_acknowledged_unverified", requiresVerification: true, replay: false });
    expect(second).toEqual(third); expect(second).toEqual({ ...first, replay: true }); expect(run.uploadCalls).toBe(1);
    expect(run.deadlineDurations).toEqual([15_000, 15_000, 15_000]);
    expect(run.completedRecords[0]?.authorizationConsumedAt).toBe("2026-09-03T12:00:00.000Z");
    expect(JSON.stringify(first)).not.toMatch(/remote-artifact|authorizationConsumedAt/);
  });

  test("concurrent replay reports the active action without a duplicate effect", async () => {
    let release!: (outcome: UploadAdapterOutcome) => void;
    const pending = new Promise<UploadAdapterOutcome>(resolve => { release = resolve; });
    const run = harness({ upload: async () => pending });
    const firstPromise = uploadPreparedArtifact(request(), run.ports);
    while (run.uploadCalls === 0) await Promise.resolve();
    const concurrent = await uploadPreparedArtifact(request(), run.ports);
    expect(concurrent).toMatchObject({ status: "outcome_unknown", code: "action_in_progress", replay: true });
    expect(run.uploadCalls).toBe(1);
    release({ status: "acknowledged", remoteArtifactId: "internal-remote-id" });
    const first = await firstPromise; const replay = await uploadPreparedArtifact(request(), run.ports);
    expect(first.status).toBe("acknowledged"); expect(replay).toEqual({ ...first, replay: true }); expect(run.uploadCalls).toBe(1);
  });

  test("a different idempotency key cannot reuse the consumed authorization", async () => {
    const run = harness(); expect((await uploadPreparedArtifact(request(), run.ports)).status).toBe("acknowledged");
    const second = await uploadPreparedArtifact(request({ idempotencyKey: "idempotency_key_0002" }), run.ports);
    expect(second).toMatchObject({ status: "blocked", code: "authorization_consumed" });
    expect(run.uploadCalls).toBe(1);
  });

  test("preserves every adapter outcome truthfully and never duplicates ambiguous effects", async () => {
    for (const outcome of [
      { status: "acknowledged", remoteArtifactId: "private-id" }, { status: "rejected" }, { status: "timeout" },
      { status: "transport_failed" }, { status: "outcome_unknown", remoteArtifactId: "private-possible-id" },
    ] as UploadAdapterOutcome[]) {
      const run = harness({ adapterOutcome: outcome }); const first = await uploadPreparedArtifact(request(), run.ports);
      const replay = await uploadPreparedArtifact(request(), run.ports);
      expect(first.status).toBe(outcome.status); expect(replay.status).toBe(outcome.status); expect(run.uploadCalls).toBe(1);
      expect(first.requiresVerification).toBe(outcome.status !== "rejected");
      expect(JSON.stringify([first, replay])).not.toMatch(/private-id|possible-id/);
    }
  });

  test("fails closed on polluted or semantically malformed trusted replay records", async () => {
    for (const replayRecord of ["polluted-result", "polluted-record", "invalid-status-code", "invalid-verification"] as const) {
      const run = harness({ replayRecord });
      expect((await uploadPreparedArtifact(request(), run.ports)).status).toBe("acknowledged");
      const replay = await uploadPreparedArtifact(request(), run.ports);
      expect(replay).toMatchObject({ status: "error", code: "action_record_invalid", replay: false });
      expect(JSON.stringify(replay)).not.toMatch(/private-leak|private-key|remoteArtifactId|idempotencyKey/);
      expect(run.uploadCalls).toBe(1);
    }
  });

  test("cancellation before effect is zero-call; abort after effect begins is outcome unknown and consumed", async () => {
    const before = harness(); const controller = new AbortController(); controller.abort();
    expect(await uploadPreparedArtifact(request(), before.ports, { signal: controller.signal })).toMatchObject({
      status: "unavailable", code: "request_cancelled",
    });
    expect(before.uploadCalls).toBe(0); expect(before.deadlineCloses).toBe(1);

    const during = harness({ upload: async uploadRequest => new Promise((_resolve, reject) => {
      uploadRequest.signal.addEventListener("abort", () => reject(new Error("synthetic abort")), { once: true });
      queueMicrotask(() => during.abortDeadline());
    }) });
    const first = await uploadPreparedArtifact(request(), during.ports);
    expect(first).toMatchObject({ status: "outcome_unknown", code: "upload_outcome_unknown", requiresVerification: true });
    const replay = await uploadPreparedArtifact(request(), during.ports);
    expect(replay.status).toBe("outcome_unknown"); expect(during.uploadCalls).toBe(1); expect(during.deadlineCloses).toBe(2);
  });
});
