import {
  PREPARATION_SCHEMA_VERSION,
  hashPreparedArtifact,
  validatePreparedArtifact,
  type PreparedArtifactValidationInput,
  type Sha256,
  type ValidationStatus,
} from "../preparation/prepared-artifact.js";

export type UploadAuthorization = {
  readonly schemaVersion: typeof PREPARATION_SCHEMA_VERSION;
  readonly action: "upload";
  readonly artifactSha256: Sha256;
  readonly manifestSha256: Sha256;
  readonly targetFingerprint: Sha256;
  readonly expiresAt: string;
  readonly remainingAttempts: number;
};
export type UploadPreflight = {
  readonly schemaVersion: typeof PREPARATION_SCHEMA_VERSION;
  readonly status: "passed" | "blocked" | "unavailable";
  readonly artifactSha256: Sha256;
  readonly manifestSha256: Sha256;
  readonly targetFingerprint: Sha256;
};
export type PreparedArtifactUploadPort = {
  readonly upload: (request: {
    readonly artifactBytes: Uint8Array;
    readonly artifactSha256: Sha256;
    readonly manifestSha256: Sha256;
    readonly targetFingerprint: Sha256;
  }) => Promise<{ readonly remoteArtifactId: string }>;
};
export type GuardedUploadResult = {
  readonly schemaVersion: typeof PREPARATION_SCHEMA_VERSION;
  readonly status: "uploaded" | Exclude<ValidationStatus, "passed">;
  readonly code: string;
  readonly artifactSha256: Sha256 | null;
  readonly manifestSha256: Sha256 | null;
  readonly preparationRevision: string | null;
  readonly targetFingerprint: Sha256 | null;
  readonly validationId: Sha256 | null;
  readonly authorizationExpiresAt: string | null;
  readonly remoteArtifactId: string | null;
};

const SHA256 = /^[a-f0-9]{64}$/;
const result = (status: GuardedUploadResult["status"], code: string, artifactSha256: Sha256 | null,
  manifestSha256: Sha256 | null, preparationRevision: string | null, targetFingerprint: Sha256 | null,
  validationId: Sha256 | null, authorizationExpiresAt: string | null = null,
  remoteArtifactId: string | null = null): GuardedUploadResult => ({
  schemaVersion: PREPARATION_SCHEMA_VERSION, status, code, artifactSha256, manifestSha256,
  preparationRevision, targetFingerprint, validationId, authorizationExpiresAt, remoteArtifactId,
});

export const uploadPreparedArtifact = async (input: {
  readonly validation: PreparedArtifactValidationInput;
  readonly authorization: UploadAuthorization | null;
  readonly preflight: UploadPreflight | null;
  readonly now: string;
}, port: PreparedArtifactUploadPort): Promise<GuardedUploadResult> => {
  const validation = validatePreparedArtifact(input.validation);
  const details = [validation.preparationRevision, validation.targetFingerprint, validation.validationId] as const;
  if (validation.status !== "passed") {
    return result(validation.status, "local_validation_not_passed", validation.artifactSha256, validation.manifestSha256, ...details);
  }
  const artifactHash = validation.artifactSha256!; const manifestHash = validation.manifestSha256!;
  const authorization = input.authorization;
  const expiresAt = authorization ? Date.parse(authorization.expiresAt) : NaN;
  const now = Date.parse(input.now);
  if (!authorization || authorization.schemaVersion !== PREPARATION_SCHEMA_VERSION || authorization.action !== "upload" ||
      authorization.artifactSha256 !== artifactHash || authorization.manifestSha256 !== manifestHash ||
      authorization.targetFingerprint !== input.validation.spec.targetFingerprint ||
      !Number.isInteger(authorization.remainingAttempts) || authorization.remainingAttempts < 1 ||
      !Number.isFinite(expiresAt) || !Number.isFinite(now) || expiresAt <= now) {
    return result("blocked", "upload_authorization_invalid", artifactHash, manifestHash, ...details);
  }
  const preflight = input.preflight;
  if (!preflight) return result("unavailable", "upload_preflight_missing", artifactHash, manifestHash, ...details,
    authorization.expiresAt);
  if (preflight.schemaVersion !== PREPARATION_SCHEMA_VERSION ||
      !new Set(["passed", "blocked", "unavailable"]).has(preflight.status)) {
    return result("error", "upload_preflight_invalid", artifactHash, manifestHash, ...details, authorization.expiresAt);
  }
  if (preflight.status !== "passed") return result(preflight.status, "upload_preflight_not_passed", artifactHash, manifestHash,
    ...details, authorization.expiresAt);
  if (!SHA256.test(preflight.artifactSha256) ||
      preflight.artifactSha256 !== artifactHash || preflight.manifestSha256 !== manifestHash ||
      preflight.targetFingerprint !== input.validation.spec.targetFingerprint) {
    return result("blocked", "upload_preflight_binding_mismatch", artifactHash, manifestHash, ...details, authorization.expiresAt);
  }
  // Snapshot and re-hash the exact bytes passed to the port. This closes the
  // local mutation gap without granting the validator any upload capability.
  const artifactBytes = Uint8Array.from(input.validation.artifactBytes);
  if (hashPreparedArtifact(artifactBytes) !== artifactHash) {
    return result("blocked", "artifact_changed_after_validation", artifactHash, manifestHash, ...details, authorization.expiresAt);
  }
  try {
    const uploaded = await port.upload({ artifactBytes, artifactSha256: artifactHash,
      manifestSha256: manifestHash, targetFingerprint: input.validation.spec.targetFingerprint });
    if (typeof uploaded?.remoteArtifactId !== "string" || uploaded.remoteArtifactId.length === 0 ||
        uploaded.remoteArtifactId.length > 128 || /[\p{Cc}\p{Cf}\p{Zl}\p{Zp}]/u.test(uploaded.remoteArtifactId)) {
      return result("error", "upload_receipt_invalid", artifactHash, manifestHash, ...details, authorization.expiresAt);
    }
    return result("uploaded", "upload_accepted", artifactHash, manifestHash, ...details, authorization.expiresAt,
      uploaded.remoteArtifactId);
  } catch {
    return result("error", "upload_failed", artifactHash, manifestHash, ...details, authorization.expiresAt);
  }
};
