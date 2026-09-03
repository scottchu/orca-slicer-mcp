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
  }) => Promise<unknown>;
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
const snapshotPlainData = (value: unknown): Readonly<Record<string, unknown>> | null => {
  try {
    if (value === null || typeof value !== "object" || Array.isArray(value)) return null;
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) return null;
    const descriptors = Object.getOwnPropertyDescriptors(value);
    const keys = Reflect.ownKeys(descriptors);
    if (keys.some(key => typeof key !== "string")) return null;
    const snapshot: Record<string, unknown> = Object.create(null) as Record<string, unknown>;
    for (const key of keys as string[]) {
      const descriptor = Reflect.get(descriptors, key) as PropertyDescriptor;
      if (!Object.hasOwn(descriptor, "value")) return null;
      snapshot[key] = descriptor.value;
    }
    return Object.freeze(snapshot);
  } catch {
    return null;
  }
};
type BoundarySnapshot = { readonly ok: true; readonly value: unknown } | { readonly ok: false };
const snapshotBoundaryValue = (value: unknown, ancestors: ReadonlySet<object> = new Set(), depth = 0): BoundarySnapshot => {
  if (value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return { ok: true, value };
  }
  if (value instanceof Uint8Array) {
    try {
      return Object.getPrototypeOf(value) === Uint8Array.prototype ?
        { ok: true, value: Uint8Array.from(value) } : { ok: false };
    } catch {
      return { ok: false };
    }
  }
  if (typeof value !== "object" || depth > 16 || ancestors.has(value)) return { ok: false };
  const nextAncestors = new Set(ancestors); nextAncestors.add(value);
  if (Array.isArray(value)) {
    try {
      if (Object.getPrototypeOf(value) !== Array.prototype) return { ok: false };
      const descriptors = Object.getOwnPropertyDescriptors(value);
      const keys = Reflect.ownKeys(descriptors);
      const lengthDescriptor = Reflect.get(descriptors, "length") as PropertyDescriptor | undefined;
      if (!lengthDescriptor || !Object.hasOwn(lengthDescriptor, "value") || !Number.isInteger(lengthDescriptor.value) ||
          lengthDescriptor.value < 0 || lengthDescriptor.value > 4096 || keys.some(key => typeof key !== "string") ||
          keys.length !== lengthDescriptor.value + 1) return { ok: false };
      const length = lengthDescriptor.value as number;
      const snapshot: unknown[] = [];
      for (let index = 0; index < length; index++) {
        const descriptor = Reflect.get(descriptors, String(index)) as PropertyDescriptor | undefined;
        if (!descriptor || !Object.hasOwn(descriptor, "value")) return { ok: false };
        const item = snapshotBoundaryValue(descriptor.value, nextAncestors, depth + 1);
        if (!item.ok) return item;
        snapshot.push(item.value);
      }
      return { ok: true, value: Object.freeze(snapshot) };
    } catch {
      return { ok: false };
    }
  }
  const data = snapshotPlainData(value);
  if (!data || Object.keys(data).length > 4096) return { ok: false };
  const snapshot: Record<string, unknown> = Object.create(null) as Record<string, unknown>;
  for (const [key, item] of Object.entries(data)) {
    const nested = snapshotBoundaryValue(item, nextAncestors, depth + 1);
    if (!nested.ok) return nested;
    snapshot[key] = nested.value;
  }
  return { ok: true, value: Object.freeze(snapshot) };
};
const snapshotBoundary = <T>(value: unknown): T | null => {
  const snapshot = snapshotBoundaryValue(value);
  return snapshot.ok ? snapshot.value as T : null;
};
const clockMilliseconds = (clock: Clock): number | null => {
  try {
    const value = clock.now();
    if (Object.getPrototypeOf(value) !== Date.prototype) return null;
    const milliseconds = Date.prototype.valueOf.call(value);
    return Number.isFinite(milliseconds) ? milliseconds : null;
  } catch {
    return null;
  }
};
const exactKeys = (snapshot: Readonly<Record<string, unknown>>, keys: ReadonlyArray<string>): boolean =>
  Object.keys(snapshot).sort().join("|") === keys.join("|");
const requestKeys = ["correlationId", "idempotencyKey", "preparedJobRevisionId", "targetPreflightId",
  "uploadAuthorizationId", "validationReceiptId"];
const snapshotRequest = (value: unknown): GuardedUploadRequest | null => {
  const request = snapshotPlainData(value);
  if (!request || !exactKeys(request, requestKeys) || !requestKeys.every(key => validId(request[key]))) return null;
  return Object.freeze({ preparedJobRevisionId: request.preparedJobRevisionId,
    validationReceiptId: request.validationReceiptId, uploadAuthorizationId: request.uploadAuthorizationId,
    targetPreflightId: request.targetPreflightId, idempotencyKey: request.idempotencyKey,
    correlationId: request.correlationId }) as GuardedUploadRequest;
};
const validValidationRecord = (record: StoredValidationReceipt): boolean => record?.schemaVersion === 1 &&
  exactKeys(record as unknown as Readonly<Record<string, unknown>>, ["digest", "expiresAt", "issuedAt",
    "preparedJobRevisionId", "receipt", "receiptId", "schemaVersion"]) &&
  validId(record.receiptId) && validId(record.preparedJobRevisionId) && SHA256.test(record.digest) &&
  validDate(record.issuedAt) && validDate(record.expiresAt) && record.receipt?.schemaVersion === 1 &&
  record.receipt.validatorVersion === PREPARED_ARTIFACT_VALIDATOR_VERSION &&
  record.receipt.requirementsVersion === PREPARATION_REQUIREMENTS_VERSION &&
  digestStoredValidationReceipt(record) === record.digest;
const validPreflight = (record: TargetPreflight): boolean => record?.schemaVersion === 1 && validId(record.preflightId) &&
  exactKeys(record as unknown as Readonly<Record<string, unknown>>, ["artifactSha256", "checkedAt", "digest", "expiresAt",
    "manifestSha256", "preflightId", "preparedJobRevisionId", "schemaVersion", "status", "targetFingerprint", "validationId"]) &&
  new Set(["passed", "blocked", "unavailable"]).has(record.status) && validId(record.preparedJobRevisionId) &&
  SHA256.test(record.validationId) && SHA256.test(record.artifactSha256) && SHA256.test(record.manifestSha256) &&
  SHA256.test(record.targetFingerprint) && validDate(record.checkedAt) && validDate(record.expiresAt) &&
  SHA256.test(record.digest) && digestTargetPreflight(record) === record.digest;
const validAuthorization = (record: UploadAuthorization): boolean => record?.schemaVersion === 1 &&
  exactKeys(record as unknown as Readonly<Record<string, unknown>>, ["action", "artifactSha256", "authorizationId",
    "correlationId", "digest", "expiresAt", "issuedAt", "manifestSha256", "preparedJobRevisionId", "schemaVersion",
    "targetFingerprint", "validationId"]) &&
  validId(record.authorizationId) && record.action === "upload" && validId(record.preparedJobRevisionId) &&
  SHA256.test(record.validationId) && SHA256.test(record.artifactSha256) && SHA256.test(record.manifestSha256) &&
  SHA256.test(record.targetFingerprint) && validId(record.correlationId) && validDate(record.issuedAt) &&
  validDate(record.expiresAt) && SHA256.test(record.digest) && digestUploadAuthorization(record) === record.digest;
const snapshotAuthorizationClaim = (value: unknown): AuthorizationClaim | null => {
  const claim = snapshotBoundary<Record<string, unknown>>(value);
  if (!claim || typeof claim.status !== "string") return null;
  if (claim.status === "unavailable") return exactKeys(claim, ["status"]) ? { status: "unavailable" } : null;
  if (claim.status === "blocked") {
    return exactKeys(claim, ["code", "status"]) &&
      new Set(["not_found", "expired", "consumed", "binding_mismatch"]).has(claim.code as string) ?
      { status: "blocked", code: claim.code as "not_found" | "expired" | "consumed" | "binding_mismatch" } : null;
  }
  if (claim.status !== "claimed" || !exactKeys(claim, ["authorization", "consumedAt", "status"]) ||
      !validDate(claim.consumedAt) || !validAuthorization(claim.authorization as UploadAuthorization)) return null;
  return Object.freeze({ status: "claimed", authorization: claim.authorization as UploadAuthorization,
    consumedAt: claim.consumedAt });
};

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
const snapshotActionClaim = (value: unknown): UploadActionClaim | null => {
  const claim = snapshotPlainData(value);
  if (!claim || typeof claim.status !== "string") return null;
  if (claim.status === "conflict" || claim.status === "unavailable") {
    return exactKeys(claim, ["status"]) ? { status: claim.status } : null;
  }
  if (claim.status === "claimed") {
    return exactKeys(claim, ["actionId", "status"]) ?
      { status: "claimed", actionId: claim.actionId as string } : null;
  }
  if (claim.status === "replay") {
    return exactKeys(claim, ["actionId", "record", "status"]) ?
      { status: "replay", actionId: claim.actionId as string,
        record: claim.record as InternalUploadActionRecord | null } : null;
  }
  return null;
};
const snapshotActionRecord = (value: unknown): InternalUploadActionRecord | null => {
  const record = snapshotPlainData(value);
  if (!record || !exactKeys(record, actionRecordKeys)) return null;
  const storedResult = snapshotPlainData(record.result);
  if (!storedResult || !exactKeys(storedResult, storedResultKeys)) return null;
  const resultSnapshot = Object.freeze({ schemaVersion: storedResult.schemaVersion, status: storedResult.status,
    code: storedResult.code, actionId: storedResult.actionId, preparedJobRevisionId: storedResult.preparedJobRevisionId,
    validationReceiptId: storedResult.validationReceiptId, validationId: storedResult.validationId,
    uploadAuthorizationId: storedResult.uploadAuthorizationId, targetPreflightId: storedResult.targetPreflightId,
    correlationId: storedResult.correlationId, artifactSha256: storedResult.artifactSha256,
    manifestSha256: storedResult.manifestSha256, targetFingerprint: storedResult.targetFingerprint,
    requiresVerification: storedResult.requiresVerification }) as InternalUploadActionRecord["result"];
  return Object.freeze({ actionId: record.actionId, requestFingerprint: record.requestFingerprint,
    result: resultSnapshot, authorizationConsumedAt: record.authorizationConsumedAt,
    remoteArtifactId: record.remoteArtifactId }) as InternalUploadActionRecord;
};
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
    "request_cancelled_before_effect", "upload_acknowledged_unverified", "upload_rejected", "upload_timeout",
    "upload_transport_failed", "upload_outcome_unknown",
  ]).has(record?.result?.code);
  const consumedAtOptional = new Set(["authorization_binding_mismatch", "validation_receipt_expired",
    "target_preflight_expired", "clock_invalid"])
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
const validRemoteArtifactId = (value: unknown): value is string => typeof value === "string" && value.length > 0 &&
  value.length <= 512 && !/[\p{Cc}\p{Cf}\p{Zl}\p{Zp}]/u.test(value);
const normalizeUploadAdapterOutcome = (value: unknown): UploadAdapterOutcome => {
  const candidate = snapshotPlainData(value);
  if (!candidate) return { status: "outcome_unknown" };
  const sortedKeys = Object.keys(candidate).sort().join("|");
  if (candidate.status === "acknowledged") {
    return sortedKeys === "remoteArtifactId|status" && validRemoteArtifactId(candidate.remoteArtifactId) ?
      { status: "acknowledged", remoteArtifactId: candidate.remoteArtifactId } : { status: "outcome_unknown" };
  }
  if (candidate.status === "rejected" || candidate.status === "timeout" || candidate.status === "transport_failed") {
    return sortedKeys === "status" ? { status: candidate.status } : { status: "outcome_unknown" };
  }
  if (candidate.status === "outcome_unknown") {
    if (sortedKeys === "status") return { status: "outcome_unknown" };
    return sortedKeys === "remoteArtifactId|status" && validRemoteArtifactId(candidate.remoteArtifactId) ?
      { status: "outcome_unknown", remoteArtifactId: candidate.remoteArtifactId } : { status: "outcome_unknown" };
  }
  return { status: "outcome_unknown" };
};

export const uploadPreparedArtifact = async (
  request: GuardedUploadRequest,
  ports: GuardedUploadPorts,
  options: { readonly signal?: AbortSignal } = {},
): Promise<GuardedUploadResult> => {
  const safeRequest = snapshotRequest(request);
  if (!safeRequest) return result("error", "request_contract_invalid");
  let deadline: UploadDeadline;
  try {
    const rawDeadline = ports.clock.openDeadline(GUARDED_UPLOAD_DEADLINE_MS, options.signal);
    const deadlineSnapshot = snapshotPlainData(rawDeadline);
    if (!deadlineSnapshot || !exactKeys(deadlineSnapshot, ["close", "signal"]) ||
        !(deadlineSnapshot.signal instanceof AbortSignal) || typeof deadlineSnapshot.close !== "function") {
      return result("unavailable", "deadline_unavailable");
    }
    deadline = { signal: deadlineSnapshot.signal, close: deadlineSnapshot.close as () => void };
  }
  catch { return result("unavailable", "deadline_unavailable"); }
  let actionId: string | null = null; let actionFingerprint: Sha256 | null = null;
  let authorizationConsumedAt: string | null = null;
  let boundFields: Partial<GuardedUploadResult> = { preparedJobRevisionId: safeRequest.preparedJobRevisionId,
    validationReceiptId: safeRequest.validationReceiptId, uploadAuthorizationId: safeRequest.uploadAuthorizationId,
    targetPreflightId: safeRequest.targetPreflightId, correlationId: safeRequest.correlationId };
  const complete = async (outcome: GuardedUploadResult, remoteArtifactId: string | null = null): Promise<GuardedUploadResult> => {
    if (!actionId || !actionFingerprint) return outcome;
    const storedResult = Object.freeze({ schemaVersion: outcome.schemaVersion, status: outcome.status, code: outcome.code,
      actionId, preparedJobRevisionId: outcome.preparedJobRevisionId, validationReceiptId: outcome.validationReceiptId,
      validationId: outcome.validationId, uploadAuthorizationId: outcome.uploadAuthorizationId,
      targetPreflightId: outcome.targetPreflightId, correlationId: outcome.correlationId,
      artifactSha256: outcome.artifactSha256, manifestSha256: outcome.manifestSha256,
      targetFingerprint: outcome.targetFingerprint, requiresVerification: outcome.requiresVerification });
    const stored = Object.freeze({ actionId, requestFingerprint: actionFingerprint, result: storedResult,
      authorizationConsumedAt, remoteArtifactId }) as InternalUploadActionRecord;
    const publicOutcome = projectStoredResult(stored.result, false);
    try { await ports.actions.complete(stored, deadline.signal); return publicOutcome; }
    catch { return result("outcome_unknown", "action_record_unavailable", { ...boundFields, actionId, requiresVerification: true }); }
  };
  try {
    if (deadline.signal.aborted) return result("unavailable", "request_cancelled", boundFields);
    let rawPrepared: StoredPreparedArtifact | null; let rawStoredValidation: StoredValidationReceipt | null;
    let rawPreflight: TargetPreflight | null;
    try {
      [rawPrepared, rawStoredValidation, rawPreflight] = await Promise.all([
        ports.preparedArtifacts.resolve(safeRequest.preparedJobRevisionId, deadline.signal),
        ports.validationReceipts.resolve(safeRequest.validationReceiptId, deadline.signal),
        ports.targetPreflights.resolve(safeRequest.targetPreflightId, deadline.signal),
      ]);
    } catch { return result("unavailable", "trusted_evidence_unavailable", boundFields); }
    if (deadline.signal.aborted) return result("unavailable", "request_cancelled", boundFields);
    const prepared = rawPrepared === null ? null : snapshotBoundary<StoredPreparedArtifact>(rawPrepared);
    const storedValidation = rawStoredValidation === null ? null : snapshotBoundary<StoredValidationReceipt>(rawStoredValidation);
    const preflight = rawPreflight === null ? null : snapshotBoundary<TargetPreflight>(rawPreflight);
    if (rawPrepared !== null && prepared === null) return result("error", "prepared_artifact_invalid", boundFields);
    if (rawStoredValidation !== null && storedValidation === null) return result("error", "validation_receipt_invalid", boundFields);
    if (rawPreflight !== null && preflight === null) return result("error", "target_preflight_invalid", boundFields);
    if (!prepared || !exactKeys(prepared as unknown as Readonly<Record<string, unknown>>,
      ["preparedJobRevisionId", "validationInput"]) ||
        !exactKeys(prepared.validationInput as unknown as Readonly<Record<string, unknown>>,
          ["artifactBytes", "correspondenceReceipt", "manifest", "resolvedSettingsReceipt", "spec"]) ||
        prepared.preparedJobRevisionId !== safeRequest.preparedJobRevisionId ||
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
    const artifactBytes = prepared.validationInput.artifactBytes;
    if (hashPreparedArtifact(artifactBytes) !== validation.artifactSha256) {
      return result("blocked", "artifact_changed_after_validation", boundFields);
    }
    actionFingerprint = hash(canonicalize({ ...safeRequest, validationId: validation.validationId,
      artifactSha256: validation.artifactSha256, manifestSha256: validation.manifestSha256,
      targetFingerprint: validation.targetFingerprint, validationReceiptDigest: storedValidation.digest,
      preflightDigest: preflight.digest }));
    let actionClaim: UploadActionClaim | null;
    try {
      const rawActionClaim = await ports.actions.claim({ idempotencyKey: safeRequest.idempotencyKey,
        requestFingerprint: actionFingerprint, correlationId: safeRequest.correlationId, signal: deadline.signal });
      actionClaim = snapshotActionClaim(rawActionClaim);
    }
    catch { return result("unavailable", "action_claim_unavailable", boundFields); }
    if (!actionClaim) return result("error", "action_claim_invalid", boundFields);
    if (actionClaim.status === "conflict") return result("blocked", "idempotency_key_conflict", boundFields);
    if (actionClaim.status === "unavailable") return result("unavailable", "action_claim_unavailable", boundFields);
    if (actionClaim.status === "replay") {
      if (!validId(actionClaim.actionId)) return result("error", "action_claim_invalid", boundFields);
      if (!actionClaim.record) return activeReplay(actionClaim.actionId, boundFields);
      const replayRecord = snapshotActionRecord(actionClaim.record);
      return replayRecord && validReplayRecord(replayRecord, actionClaim.actionId, actionFingerprint, boundFields) ?
        projectStoredResult(replayRecord.result, true) : result("error", "action_record_invalid", boundFields);
    }
    actionId = actionClaim.actionId; boundFields = { ...boundFields, actionId };
    if (!validId(actionId)) return result("error", "action_claim_invalid", boundFields);
    const preAuthorizationNowMs = clockMilliseconds(ports.clock);
    if (preAuthorizationNowMs === null) return complete(result("error", "clock_invalid", boundFields));
    if (Date.parse(storedValidation.issuedAt) > preAuthorizationNowMs ||
        Date.parse(storedValidation.expiresAt) <= preAuthorizationNowMs) {
      return complete(result("blocked", "validation_receipt_expired", boundFields));
    }
    if (Date.parse(preflight.checkedAt) > preAuthorizationNowMs || Date.parse(preflight.expiresAt) <= preAuthorizationNowMs) {
      return complete(result("blocked", "target_preflight_expired", boundFields));
    }
    const expectedAuthorization: UploadAuthorizationBinding = Object.freeze({ schemaVersion: 1,
      authorizationId: safeRequest.uploadAuthorizationId, action: "upload",
      preparedJobRevisionId: safeRequest.preparedJobRevisionId, validationId: validation.validationId!,
      artifactSha256: validation.artifactSha256!, manifestSha256: validation.manifestSha256!,
      targetFingerprint: validation.targetFingerprint!, correlationId: safeRequest.correlationId });
    let authorizationClaim: AuthorizationClaim | null;
    try {
      const rawAuthorizationClaim = await ports.authorizations.claim({ authorizationId: safeRequest.uploadAuthorizationId,
        idempotencyKey: safeRequest.idempotencyKey, requestFingerprint: actionFingerprint,
        expected: expectedAuthorization, signal: deadline.signal });
      authorizationClaim = snapshotAuthorizationClaim(rawAuthorizationClaim);
    }
    catch { return complete(result("unavailable", "authorization_claim_unavailable", boundFields)); }
    if (!authorizationClaim) return complete(result("error", "authorization_claim_invalid", boundFields));
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
    const effectNowMs = clockMilliseconds(ports.clock);
    if (effectNowMs === null) return complete(result("error", "clock_invalid", boundFields));
    if (Date.parse(storedValidation.issuedAt) > effectNowMs || Date.parse(storedValidation.expiresAt) <= effectNowMs) {
      return complete(result("blocked", "validation_receipt_expired", boundFields));
    }
    if (Date.parse(preflight.checkedAt) > effectNowMs || Date.parse(preflight.expiresAt) <= effectNowMs) {
      return complete(result("blocked", "target_preflight_expired", boundFields));
    }
    if (deadline.signal.aborted) return complete(result("unavailable", "request_cancelled_before_effect", boundFields));
    let adapterOutcome: UploadAdapterOutcome;
    try {
      const rawAdapterOutcome = await ports.uploader.upload({ artifactBytes, artifactSha256: validation.artifactSha256!,
        manifestSha256: validation.manifestSha256!, targetFingerprint: validation.targetFingerprint!,
        correlationId: safeRequest.correlationId, signal: deadline.signal });
      adapterOutcome = normalizeUploadAdapterOutcome(rawAdapterOutcome);
    } catch {
      adapterOutcome = { status: "outcome_unknown" };
    }
    const requiresVerification = adapterOutcome.status === "acknowledged" || adapterOutcome.status === "timeout" ||
      adapterOutcome.status === "transport_failed" || adapterOutcome.status === "outcome_unknown";
    const code = adapterOutcome.status === "acknowledged" ? "upload_acknowledged_unverified" :
      adapterOutcome.status === "rejected" ? "upload_rejected" : adapterOutcome.status === "timeout" ? "upload_timeout" :
      adapterOutcome.status === "transport_failed" ? "upload_transport_failed" : "upload_outcome_unknown";
    const remoteArtifactId = "remoteArtifactId" in adapterOutcome ? adapterOutcome.remoteArtifactId : null;
    return complete(result(adapterOutcome.status, code, { ...boundFields, requiresVerification }), remoteArtifactId);
  } finally {
    try { deadline.close(); } catch { /* Cleanup failures cannot change the recorded action outcome. */ }
  }
};
