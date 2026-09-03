import { createHash } from "node:crypto";

import {
  PREPARATION_REQUIREMENTS_VERSION,
  PREPARATION_SCHEMA_VERSION,
  PREPARED_ARTIFACT_VALIDATOR_VERSION,
  hashPreparedArtifact,
  validatePreparedArtifact,
  type PreparedArtifactValidationInput,
  type PreparedArtifactValidationReceipt,
  type Sha256,
  type ValidationStatus,
} from "../preparation/prepared-artifact.js";

export const GUARDED_UPLOAD_DEADLINE_MS = 15_000;
const OPAQUE_ID = /^[A-Za-z0-9][A-Za-z0-9_-]{15,127}$/;
const SHA256 = /^[a-f0-9]{64}$/;

export type GuardedUploadRequest = {
  readonly preparedJobRevisionId: string;
  readonly validationReceiptId: string;
  readonly uploadAuthorizationId: string;
  readonly targetPreflightId: string;
  readonly idempotencyKey: string;
  readonly correlationId: string;
};
export type StoredPreparedArtifact = {
  readonly preparedJobRevisionId: string;
  readonly validationInput: PreparedArtifactValidationInput;
};
export type StoredValidationReceiptContent = {
  readonly schemaVersion: 1;
  readonly receiptId: string;
  readonly preparedJobRevisionId: string;
  readonly issuedAt: string;
  readonly expiresAt: string;
  readonly receipt: PreparedArtifactValidationReceipt;
};
export type StoredValidationReceipt = StoredValidationReceiptContent & { readonly digest: Sha256 };
export type UploadAuthorizationContent = {
  readonly schemaVersion: 1;
  readonly authorizationId: string;
  readonly action: "upload";
  readonly preparedJobRevisionId: string;
  readonly validationId: Sha256;
  readonly artifactSha256: Sha256;
  readonly manifestSha256: Sha256;
  readonly targetFingerprint: Sha256;
  readonly correlationId: string;
  readonly issuedAt: string;
  readonly expiresAt: string;
};
export type UploadAuthorization = UploadAuthorizationContent & { readonly digest: Sha256 };
export type UploadAuthorizationBinding = Omit<UploadAuthorizationContent, "issuedAt" | "expiresAt">;
export type TargetPreflightContent = {
  readonly schemaVersion: 1;
  readonly preflightId: string;
  readonly status: "passed" | "blocked" | "unavailable";
  readonly preparedJobRevisionId: string;
  readonly validationId: Sha256;
  readonly artifactSha256: Sha256;
  readonly manifestSha256: Sha256;
  readonly targetFingerprint: Sha256;
  readonly checkedAt: string;
  readonly expiresAt: string;
};
export type TargetPreflight = TargetPreflightContent & { readonly digest: Sha256 };

export type UploadAdapterOutcome =
  | { readonly status: "acknowledged"; readonly remoteArtifactId: string }
  | { readonly status: "rejected" }
  | { readonly status: "timeout" }
  | { readonly status: "transport_failed" }
  | { readonly status: "outcome_unknown"; readonly remoteArtifactId?: string };
export type UploadOutcomeStatus = UploadAdapterOutcome["status"];
export type GuardedUploadStatus = UploadOutcomeStatus | Exclude<ValidationStatus, "passed">;

export type GuardedUploadResult = {
  readonly schemaVersion: 1;
  readonly status: GuardedUploadStatus;
  readonly code: string;
  readonly actionId: string | null;
  readonly preparedJobRevisionId: string | null;
  readonly validationReceiptId: string | null;
  readonly validationId: Sha256 | null;
  readonly uploadAuthorizationId: string | null;
  readonly targetPreflightId: string | null;
  readonly correlationId: string | null;
  readonly artifactSha256: Sha256 | null;
  readonly manifestSha256: Sha256 | null;
  readonly targetFingerprint: Sha256 | null;
  readonly requiresVerification: boolean;
  readonly replay: boolean;
};
export type InternalUploadActionRecord = {
  readonly actionId: string;
  readonly requestFingerprint: Sha256;
  readonly result: Omit<GuardedUploadResult, "replay">;
  /** Trusted authorization-store transaction time. Never copied into model-visible results. */
  readonly authorizationConsumedAt: string | null;
  /** Operations-only locator. Never copied into model-visible results. */
  readonly remoteArtifactId: string | null;
};
export type UploadActionClaim =
  | { readonly status: "claimed"; readonly actionId: string }
  | { readonly status: "replay"; readonly actionId: string; readonly record: InternalUploadActionRecord | null }
  | { readonly status: "conflict" }
  | { readonly status: "unavailable" };
export type AuthorizationClaim =
  | { readonly status: "claimed"; readonly authorization: UploadAuthorization; readonly consumedAt: string }
  | { readonly status: "blocked"; readonly code: "not_found" | "expired" | "consumed" | "binding_mismatch" }
  | { readonly status: "unavailable" };

export type UploadDeadline = { readonly signal: AbortSignal; readonly close: () => void };
export type Clock = {
  readonly now: () => Date;
  readonly openDeadline: (milliseconds: number, parentSignal?: AbortSignal) => UploadDeadline;
};
export type PreparedArtifactStore = {
  readonly resolve: (preparedJobRevisionId: string, signal: AbortSignal) => Promise<StoredPreparedArtifact | null>;
};
export type ValidationReceiptStore = {
  readonly resolve: (validationReceiptId: string, signal: AbortSignal) => Promise<StoredValidationReceipt | null>;
};
export type AuthorizationStore = {
  /** Atomically checks expiry with the store's transactional clock and consumes a one-use authorization. */
  readonly claim: (request: {
    readonly authorizationId: string;
    readonly idempotencyKey: string;
    readonly requestFingerprint: Sha256;
    readonly expected: UploadAuthorizationBinding;
    readonly signal: AbortSignal;
  }) => Promise<AuthorizationClaim>;
};
export type TargetPreflightStore = {
  readonly resolve: (targetPreflightId: string, signal: AbortSignal) => Promise<TargetPreflight | null>;
};
export type UploadActionStore = {
  /** Atomically claims the key and persists a pending action before any external effect. */
  readonly claim: (request: {
    readonly idempotencyKey: string;
    readonly requestFingerprint: Sha256;
    readonly correlationId: string;
    readonly signal: AbortSignal;
  }) => Promise<UploadActionClaim>;
  readonly complete: (record: InternalUploadActionRecord, signal: AbortSignal) => Promise<void>;
};
export type PreparedArtifactUploadPort = {
  readonly upload: (request: {
    readonly artifactBytes: Uint8Array;
    readonly artifactSha256: Sha256;
    readonly manifestSha256: Sha256;
    readonly targetFingerprint: Sha256;
    readonly correlationId: string;
    readonly signal: AbortSignal;
  }) => Promise<UploadAdapterOutcome>;
};
export type GuardedUploadPorts = {
  readonly clock: Clock;
  readonly preparedArtifacts: PreparedArtifactStore;
  readonly validationReceipts: ValidationReceiptStore;
  readonly authorizations: AuthorizationStore;
  readonly targetPreflights: TargetPreflightStore;
  readonly actions: UploadActionStore;
  readonly uploader: PreparedArtifactUploadPort;
};

const canonicalize = (value: unknown): string => {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(",")}]`;
  return `{${Object.entries(value as Record<string, unknown>)
    .sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0)
    .map(([key, item]) => `${JSON.stringify(key)}:${canonicalize(item)}`).join(",")}}`;
};
const hash = (value: string): Sha256 => createHash("sha256").update(value).digest("hex");
const digestRecord = <T extends { readonly digest: Sha256 }>(record: T): Sha256 => {
  const { digest: _ignored, ...content } = record;
  return hash(canonicalize(content));
};
export const digestStoredValidationReceipt = (record: StoredValidationReceipt): Sha256 => digestRecord(record);
export const digestUploadAuthorization = (record: UploadAuthorization): Sha256 => digestRecord(record);
export const digestTargetPreflight = (record: TargetPreflight): Sha256 => digestRecord(record);
const validId = (value: unknown): value is string => typeof value === "string" && OPAQUE_ID.test(value);
const validDate = (value: unknown): value is string => typeof value === "string" && Number.isFinite(Date.parse(value));
const requestKeys = ["correlationId", "idempotencyKey", "preparedJobRevisionId", "targetPreflightId",
  "uploadAuthorizationId", "validationReceiptId"];
const validRequest = (request: GuardedUploadRequest): boolean => request !== null && typeof request === "object" &&
  Object.keys(request).sort().join("|") === requestKeys.join("|") && requestKeys.every(key => validId(request[key as keyof GuardedUploadRequest]));
const validValidationRecord = (record: StoredValidationReceipt): boolean => record?.schemaVersion === 1 &&
  validId(record.receiptId) && validId(record.preparedJobRevisionId) && SHA256.test(record.digest) &&
  validDate(record.issuedAt) && validDate(record.expiresAt) && record.receipt?.schemaVersion === 1 &&
  record.receipt.validatorVersion === PREPARED_ARTIFACT_VALIDATOR_VERSION &&
  record.receipt.requirementsVersion === PREPARATION_REQUIREMENTS_VERSION &&
  digestStoredValidationReceipt(record) === record.digest;
const validPreflight = (record: TargetPreflight): boolean => record?.schemaVersion === 1 && validId(record.preflightId) &&
  new Set(["passed", "blocked", "unavailable"]).has(record.status) && validId(record.preparedJobRevisionId) &&
  SHA256.test(record.validationId) && SHA256.test(record.artifactSha256) && SHA256.test(record.manifestSha256) &&
  SHA256.test(record.targetFingerprint) && validDate(record.checkedAt) && validDate(record.expiresAt) &&
  SHA256.test(record.digest) && digestTargetPreflight(record) === record.digest;
const validAuthorization = (record: UploadAuthorization): boolean => record?.schemaVersion === 1 &&
  validId(record.authorizationId) && record.action === "upload" && validId(record.preparedJobRevisionId) &&
  SHA256.test(record.validationId) && SHA256.test(record.artifactSha256) && SHA256.test(record.manifestSha256) &&
  SHA256.test(record.targetFingerprint) && validId(record.correlationId) && validDate(record.issuedAt) &&
  validDate(record.expiresAt) && SHA256.test(record.digest) && digestUploadAuthorization(record) === record.digest;

const result = (status: GuardedUploadStatus, code: string, fields: Partial<GuardedUploadResult> = {}): GuardedUploadResult => ({
  schemaVersion: PREPARATION_SCHEMA_VERSION, status, code, actionId: fields.actionId ?? null,
  preparedJobRevisionId: fields.preparedJobRevisionId ?? null, validationReceiptId: fields.validationReceiptId ?? null,
  validationId: fields.validationId ?? null, uploadAuthorizationId: fields.uploadAuthorizationId ?? null,
  targetPreflightId: fields.targetPreflightId ?? null, correlationId: fields.correlationId ?? null,
  artifactSha256: fields.artifactSha256 ?? null, manifestSha256: fields.manifestSha256 ?? null,
  targetFingerprint: fields.targetFingerprint ?? null, requiresVerification: fields.requiresVerification ?? false,
  replay: fields.replay ?? false,
});
const projectStoredResult = (stored: InternalUploadActionRecord["result"], replay: boolean): GuardedUploadResult =>
  result(stored.status, stored.code, {
    actionId: stored.actionId,
    preparedJobRevisionId: stored.preparedJobRevisionId,
    validationReceiptId: stored.validationReceiptId,
    validationId: stored.validationId,
    uploadAuthorizationId: stored.uploadAuthorizationId,
    targetPreflightId: stored.targetPreflightId,
    correlationId: stored.correlationId,
    artifactSha256: stored.artifactSha256,
    manifestSha256: stored.manifestSha256,
    targetFingerprint: stored.targetFingerprint,
    requiresVerification: stored.requiresVerification,
    replay,
  });
const activeReplay = (actionId: string, fields: Partial<GuardedUploadResult>): GuardedUploadResult =>
  result("outcome_unknown", "action_in_progress", { ...fields, actionId, requiresVerification: true, replay: true });
const storedResultKeys = ["actionId", "artifactSha256", "code", "correlationId", "manifestSha256",
  "preparedJobRevisionId", "requiresVerification", "schemaVersion", "status", "targetFingerprint",
  "targetPreflightId", "uploadAuthorizationId", "validationId", "validationReceiptId"];
const actionRecordKeys = ["actionId", "authorizationConsumedAt", "remoteArtifactId", "requestFingerprint", "result"];
const validStatusCode = (stored: InternalUploadActionRecord["result"]): boolean => {
  const policies: Partial<Record<GuardedUploadStatus, { readonly codes: ReadonlySet<string>; readonly verification: boolean }>> = {
    acknowledged: { codes: new Set(["upload_acknowledged_unverified"]), verification: true },
    rejected: { codes: new Set(["upload_rejected"]), verification: false },
    timeout: { codes: new Set(["upload_timeout"]), verification: true },
    transport_failed: { codes: new Set(["upload_transport_failed"]), verification: true },
    outcome_unknown: { codes: new Set(["upload_outcome_unknown"]), verification: true },
    blocked: { codes: new Set(["authorization_not_found", "authorization_expired", "authorization_consumed",
      "authorization_binding_mismatch", "validation_receipt_expired", "target_preflight_expired"]), verification: false },
    unavailable: { codes: new Set(["authorization_claim_unavailable", "request_cancelled_before_effect"]), verification: false },
    error: { codes: new Set(["authorization_claim_invalid", "clock_invalid"]), verification: false },
  };
  const policy = policies[stored.status];
  return policy !== undefined && policy.codes.has(stored.code) && stored.requiresVerification === policy.verification;
};
const validReplayRecord = (record: InternalUploadActionRecord, actionId: string, fingerprint: Sha256,
  fields: Partial<GuardedUploadResult>): boolean => {
  const consumedAtRequired = new Set([
    "authorization_binding_mismatch",
    "request_cancelled_before_effect", "upload_acknowledged_unverified", "upload_rejected", "upload_timeout",
    "upload_transport_failed", "upload_outcome_unknown",
  ]).has(record?.result?.code);
  const consumedAtOptional = new Set(["validation_receipt_expired", "target_preflight_expired", "clock_invalid"])
    .has(record?.result?.code);
  return record !== null && typeof record === "object" &&
  Object.keys(record).sort().join("|") === actionRecordKeys.join("|") &&
  record.result !== null && typeof record.result === "object" &&
  Object.keys(record.result).sort().join("|") === storedResultKeys.join("|") &&
  validStatusCode(record.result) && record.actionId === actionId && validId(record.actionId) &&
  record.requestFingerprint === fingerprint && record.result.actionId === actionId && record.result.schemaVersion === 1 &&
  record.result.preparedJobRevisionId === fields.preparedJobRevisionId &&
  record.result.validationReceiptId === fields.validationReceiptId && record.result.validationId === fields.validationId &&
  record.result.uploadAuthorizationId === fields.uploadAuthorizationId && record.result.targetPreflightId === fields.targetPreflightId &&
  record.result.correlationId === fields.correlationId && record.result.artifactSha256 === fields.artifactSha256 &&
  record.result.manifestSha256 === fields.manifestSha256 && record.result.targetFingerprint === fields.targetFingerprint &&
  (consumedAtRequired ? validDate(record.authorizationConsumedAt) : consumedAtOptional ?
    record.authorizationConsumedAt === null || validDate(record.authorizationConsumedAt) : record.authorizationConsumedAt === null) &&
  (record.remoteArtifactId === null || (typeof record.remoteArtifactId === "string" && record.remoteArtifactId.length > 0 &&
    record.remoteArtifactId.length <= 512 && !/[\p{Cc}\p{Cf}\p{Zl}\p{Zp}]/u.test(record.remoteArtifactId))) &&
  (record.result.status === "acknowledged" ? record.remoteArtifactId !== null :
    record.result.status === "outcome_unknown" || record.remoteArtifactId === null);
};

export const uploadPreparedArtifact = async (
  request: GuardedUploadRequest,
  ports: GuardedUploadPorts,
  options: { readonly signal?: AbortSignal } = {},
): Promise<GuardedUploadResult> => {
  if (!validRequest(request)) return result("error", "request_contract_invalid");
  const safeRequest = { preparedJobRevisionId: request.preparedJobRevisionId, validationReceiptId: request.validationReceiptId,
    uploadAuthorizationId: request.uploadAuthorizationId, targetPreflightId: request.targetPreflightId,
    idempotencyKey: request.idempotencyKey, correlationId: request.correlationId };
  let deadline: UploadDeadline;
  try { deadline = ports.clock.openDeadline(GUARDED_UPLOAD_DEADLINE_MS, options.signal); }
  catch { return result("unavailable", "deadline_unavailable"); }
  let actionId: string | null = null; let actionFingerprint: Sha256 | null = null;
  let authorizationConsumedAt: string | null = null;
  let boundFields: Partial<GuardedUploadResult> = { preparedJobRevisionId: safeRequest.preparedJobRevisionId,
    validationReceiptId: safeRequest.validationReceiptId, uploadAuthorizationId: safeRequest.uploadAuthorizationId,
    targetPreflightId: safeRequest.targetPreflightId, correlationId: safeRequest.correlationId };
  const complete = async (outcome: GuardedUploadResult, remoteArtifactId: string | null = null): Promise<GuardedUploadResult> => {
    if (!actionId || !actionFingerprint) return outcome;
    const { replay: _replay, ...storedResult } = outcome;
    const stored: InternalUploadActionRecord = { actionId, requestFingerprint: actionFingerprint,
      result: { ...storedResult, actionId }, authorizationConsumedAt, remoteArtifactId };
    try { await ports.actions.complete(stored, deadline.signal); return projectStoredResult(stored.result, false); }
    catch { return result("outcome_unknown", "action_record_unavailable", { ...boundFields, actionId, requiresVerification: true }); }
  };
  try {
    if (deadline.signal.aborted) return result("unavailable", "request_cancelled", boundFields);
    let prepared: StoredPreparedArtifact | null; let storedValidation: StoredValidationReceipt | null;
    let preflight: TargetPreflight | null;
    try {
      [prepared, storedValidation, preflight] = await Promise.all([
        ports.preparedArtifacts.resolve(safeRequest.preparedJobRevisionId, deadline.signal),
        ports.validationReceipts.resolve(safeRequest.validationReceiptId, deadline.signal),
        ports.targetPreflights.resolve(safeRequest.targetPreflightId, deadline.signal),
      ]);
    } catch { return result("unavailable", "trusted_evidence_unavailable", boundFields); }
    if (deadline.signal.aborted) return result("unavailable", "request_cancelled", boundFields);
    if (!prepared || prepared.preparedJobRevisionId !== safeRequest.preparedJobRevisionId ||
        prepared.validationInput.spec.preparationRevision !== safeRequest.preparedJobRevisionId) {
      return result("unavailable", "prepared_artifact_unavailable", boundFields);
    }
    const validation = validatePreparedArtifact(prepared.validationInput, { signal: deadline.signal });
    boundFields = { ...boundFields, validationId: validation.validationId, artifactSha256: validation.artifactSha256,
      manifestSha256: validation.manifestSha256, targetFingerprint: validation.targetFingerprint };
    if (validation.status !== "passed") return result(validation.status, "current_validation_not_passed", boundFields);
    if (!storedValidation) return result("unavailable", "validation_receipt_unavailable", boundFields);
    if (!validValidationRecord(storedValidation)) return result("error", "validation_receipt_invalid", boundFields);
    if (storedValidation.receiptId !== safeRequest.validationReceiptId ||
        storedValidation.preparedJobRevisionId !== safeRequest.preparedJobRevisionId ||
        storedValidation.receipt.status !== "passed" || storedValidation.receipt.validationId !== validation.validationId ||
        canonicalize(storedValidation.receipt) !== canonicalize(validation)) {
      return result("blocked", "validation_receipt_binding_mismatch", boundFields);
    }
    if (!preflight) return result("unavailable", "target_preflight_unavailable", boundFields);
    if (!validPreflight(preflight)) return result("error", "target_preflight_invalid", boundFields);
    if (preflight.status !== "passed") return result(preflight.status, "target_preflight_not_passed", boundFields);
    if (preflight.preflightId !== safeRequest.targetPreflightId || preflight.preparedJobRevisionId !== safeRequest.preparedJobRevisionId ||
        preflight.validationId !== validation.validationId || preflight.artifactSha256 !== validation.artifactSha256 ||
        preflight.manifestSha256 !== validation.manifestSha256 || preflight.targetFingerprint !== validation.targetFingerprint) {
      return result("blocked", "target_preflight_binding_mismatch", boundFields);
    }
    const artifactBytes = Uint8Array.from(prepared.validationInput.artifactBytes);
    if (hashPreparedArtifact(artifactBytes) !== validation.artifactSha256) {
      return result("blocked", "artifact_changed_after_validation", boundFields);
    }
    actionFingerprint = hash(canonicalize({ ...safeRequest, validationId: validation.validationId,
      artifactSha256: validation.artifactSha256, manifestSha256: validation.manifestSha256,
      targetFingerprint: validation.targetFingerprint, validationReceiptDigest: storedValidation.digest,
      preflightDigest: preflight.digest }));
    let actionClaim: UploadActionClaim;
    try { actionClaim = await ports.actions.claim({ idempotencyKey: safeRequest.idempotencyKey,
      requestFingerprint: actionFingerprint, correlationId: safeRequest.correlationId, signal: deadline.signal }); }
    catch { return result("unavailable", "action_claim_unavailable", boundFields); }
    if (actionClaim.status === "conflict") return result("blocked", "idempotency_key_conflict", boundFields);
    if (actionClaim.status === "unavailable") return result("unavailable", "action_claim_unavailable", boundFields);
    if (actionClaim.status === "replay") {
      if (!validId(actionClaim.actionId)) return result("error", "action_claim_invalid", boundFields);
      if (!actionClaim.record) return activeReplay(actionClaim.actionId, boundFields);
      return validReplayRecord(actionClaim.record, actionClaim.actionId, actionFingerprint, boundFields) ?
        projectStoredResult(actionClaim.record.result, true) : result("error", "action_record_invalid", boundFields);
    }
    actionId = actionClaim.actionId; boundFields = { ...boundFields, actionId };
    if (!validId(actionId)) return result("error", "action_claim_invalid", boundFields);
    let preAuthorizationNowMs: number;
    try { preAuthorizationNowMs = ports.clock.now().valueOf(); }
    catch { return complete(result("error", "clock_invalid", boundFields)); }
    if (!Number.isFinite(preAuthorizationNowMs)) return complete(result("error", "clock_invalid", boundFields));
    if (Date.parse(storedValidation.issuedAt) > preAuthorizationNowMs ||
        Date.parse(storedValidation.expiresAt) <= preAuthorizationNowMs) {
      return complete(result("blocked", "validation_receipt_expired", boundFields));
    }
    if (Date.parse(preflight.checkedAt) > preAuthorizationNowMs || Date.parse(preflight.expiresAt) <= preAuthorizationNowMs) {
      return complete(result("blocked", "target_preflight_expired", boundFields));
    }
    const expectedAuthorization: UploadAuthorizationBinding = { schemaVersion: 1,
      authorizationId: safeRequest.uploadAuthorizationId, action: "upload",
      preparedJobRevisionId: safeRequest.preparedJobRevisionId, validationId: validation.validationId!,
      artifactSha256: validation.artifactSha256!, manifestSha256: validation.manifestSha256!,
      targetFingerprint: validation.targetFingerprint!, correlationId: safeRequest.correlationId };
    let authorizationClaim: AuthorizationClaim;
    try { authorizationClaim = await ports.authorizations.claim({ authorizationId: safeRequest.uploadAuthorizationId,
      idempotencyKey: safeRequest.idempotencyKey, requestFingerprint: actionFingerprint,
      expected: expectedAuthorization, signal: deadline.signal }); }
    catch { return complete(result("unavailable", "authorization_claim_unavailable", boundFields)); }
    if (authorizationClaim.status === "unavailable") return complete(result("unavailable", "authorization_claim_unavailable", boundFields));
    if (authorizationClaim.status === "blocked") return complete(result("blocked", `authorization_${authorizationClaim.code}`, boundFields));
    const authorization = authorizationClaim.authorization;
    const claimedAt = authorizationClaim.consumedAt;
    const consumedAtMs = Date.parse(claimedAt);
    if (!validDate(claimedAt) || !Number.isFinite(consumedAtMs)) {
      return complete(result("error", "authorization_claim_invalid", boundFields));
    }
    authorizationConsumedAt = claimedAt;
    if (!validAuthorization(authorization) || authorization.authorizationId !== expectedAuthorization.authorizationId ||
        authorization.preparedJobRevisionId !== expectedAuthorization.preparedJobRevisionId ||
        authorization.validationId !== expectedAuthorization.validationId || authorization.artifactSha256 !== expectedAuthorization.artifactSha256 ||
        authorization.manifestSha256 !== expectedAuthorization.manifestSha256 || authorization.targetFingerprint !== expectedAuthorization.targetFingerprint ||
        authorization.correlationId !== expectedAuthorization.correlationId || Date.parse(authorization.issuedAt) > consumedAtMs ||
        Date.parse(authorization.expiresAt) <= consumedAtMs) {
      return complete(result("blocked", "authorization_binding_mismatch", boundFields));
    }
    let effectNowMs: number;
    try { effectNowMs = ports.clock.now().valueOf(); }
    catch { return complete(result("error", "clock_invalid", boundFields)); }
    if (!Number.isFinite(effectNowMs)) return complete(result("error", "clock_invalid", boundFields));
    if (Date.parse(storedValidation.issuedAt) > effectNowMs || Date.parse(storedValidation.expiresAt) <= effectNowMs) {
      return complete(result("blocked", "validation_receipt_expired", boundFields));
    }
    if (Date.parse(preflight.checkedAt) > effectNowMs || Date.parse(preflight.expiresAt) <= effectNowMs) {
      return complete(result("blocked", "target_preflight_expired", boundFields));
    }
    if (deadline.signal.aborted) return complete(result("unavailable", "request_cancelled_before_effect", boundFields));
    let adapterOutcome: UploadAdapterOutcome;
    try {
      adapterOutcome = await ports.uploader.upload({ artifactBytes, artifactSha256: validation.artifactSha256!,
        manifestSha256: validation.manifestSha256!, targetFingerprint: validation.targetFingerprint!,
        correlationId: safeRequest.correlationId, signal: deadline.signal });
    } catch {
      adapterOutcome = { status: "outcome_unknown" };
    }
    const requiresVerification = adapterOutcome.status === "acknowledged" || adapterOutcome.status === "timeout" ||
      adapterOutcome.status === "transport_failed" || adapterOutcome.status === "outcome_unknown";
    const code = adapterOutcome.status === "acknowledged" ? "upload_acknowledged_unverified" :
      adapterOutcome.status === "rejected" ? "upload_rejected" : adapterOutcome.status === "timeout" ? "upload_timeout" :
      adapterOutcome.status === "transport_failed" ? "upload_transport_failed" : "upload_outcome_unknown";
    const rawRemoteArtifactId = "remoteArtifactId" in adapterOutcome ? adapterOutcome.remoteArtifactId : undefined;
    const remoteArtifactId = typeof rawRemoteArtifactId === "string" && rawRemoteArtifactId.length > 0 &&
      rawRemoteArtifactId.length <= 512 && !/[\p{Cc}\p{Cf}\p{Zl}\p{Zp}]/u.test(rawRemoteArtifactId) ? rawRemoteArtifactId : null;
    if (adapterOutcome.status === "acknowledged" && remoteArtifactId === null) {
      return complete(result("outcome_unknown", "upload_outcome_unknown", { ...boundFields, requiresVerification: true }));
    }
    return complete(result(adapterOutcome.status, code, { ...boundFields, requiresVerification }), remoteArtifactId);
  } finally {
    deadline.close();
  }
};
