import { z } from 'zod';
const nonnegative = z.number().finite().min(0).max(Number.MAX_SAFE_INTEGER);
const integer = nonnegative.int();
const timestamp = z.string().datetime();
const nullableNumber = nonnegative.nullable();
const check = z.enum(['pass', 'fail', 'unknown']);
const state = z.enum(['standby', 'printing', 'paused', 'complete', 'error', 'cancelled', 'unknown']);
export const monitorInputSchema = z.object({
  camera: z.enum(['omit', 'snapshot']),
  expectedRunToken: z.string().regex(/^[a-f0-9-]{36}$/).nullable(),
}).strict();
export const monitorOutputSchema = z.object({
  schemaVersion: z.literal(1),
  receipt: z.object({ observationVersion: integer, observedAt: timestamp.nullable(), checkedAt: timestamp,
    freshness: z.enum(['fresh', 'stale', 'offline', 'unknown']), acquisition: z.enum(['new', 'cached']),
    completeness: z.enum(['complete', 'partial', 'unavailable']), timestampBasis: z.literal('connector_receipt'),
    sourceEventTimeSeconds: nullableNumber, connectionEpoch: integer.nullable() }).strict(),
  run: z.object({ token: z.string().regex(/^[a-f0-9-]{36}$/).nullable(),
    match: z.enum(['initial', 'observed_continuity', 'changed', 'uncertain', 'unbound']),
    reason: z.enum(['initial_observation', 'consistent_samples', 'token_unknown', 'connection_changed', 'observation_gap', 'job_changed', 'progress_reset', 'missing_evidence', 'no_active_run', 'source_clock_reset']),
    identityBasis: z.enum(['observational', 'unknown']), printerRunIdentityAvailable: z.literal(false), provenance: z.enum(['external', 'unknown']), artifactHash: z.null() }).strict(),
  telemetry: z.object({ state, filename: z.string().min(1).max(320).describe('Shared safeDisplayFilename caps at 160 Unicode code points, up to 320 UTF-16 units.').nullable(), percent: z.number().finite().min(0).max(100).nullable(),
    displayProgress: z.number().finite().min(0).max(1).nullable(), storageProgress: z.number().finite().min(0).max(1).nullable(),
    progressBasis: z.enum(['display', 'storage', 'unknown']), currentLayer: integer.nullable(), totalLayers: integer.nullable(), elapsedSeconds: nullableNumber,
    totalDurationSeconds: nullableNumber, estimatedRemainingSeconds: nullableNumber, estimateBasis: z.enum(['elapsed_progress_extrapolation', 'unknown']),
    storage: z.object({ active: z.boolean().nullable(), filePositionBytes: integer.nullable(), fileSizeBytes: integer.nullable() }).strict(),
    tools: z.array(z.object({ physicalTool: z.number().int().min(1).max(4), temperature: z.number().finite().min(0).max(500).nullable(), target: z.number().finite().min(0).max(500).nullable(),
      state: z.enum(['ACTIVE', 'PARKED', 'HEATING', 'COOLING', 'STANDBY', 'IDLE', 'UNKNOWN']).nullable(), active: z.boolean().nullable() }).strict()).max(4),
    bed: z.object({ temperature: z.number().finite().min(0).max(200).nullable(), target: z.number().finite().min(0).max(200).nullable() }).strict(),
    exceptionPresent: z.boolean().nullable(), controllerState: z.enum(['ready', 'shutdown', 'error', 'unknown']),
    messageCode: z.enum(['printer_message', 'printer_exception', 'controller_error']).nullable() }).strict(),
  terminal: z.object({ reportedState: z.enum(['complete', 'error', 'cancelled']).nullable(),
    assessment: z.enum(['not_terminal', 'reported_pending_checks', 'reported_consistent', 'unknown']), boundRunVerified: z.literal(false),
    checks: z.object({ fresh: check, executionInactive: check, fileFullyConsumed: check, noException: check, controllerReady: check, toolsParked: check, heaterTargetsZero: check }).strict() }).strict(),
  camera: z.object({ state: z.enum(['omitted', 'available', 'unavailable', 'withheld']), observedAt: timestamp.nullable(), byteLength: integer.max(1024 * 1024), mediaType: z.literal('image/jpeg').nullable(),
    reason: z.enum(['not_requested', 'camera_unavailable', 'too_large', 'invalid_image', 'run_uncertain', 'run_changed']).nullable(),
    association: z.enum(['same_request_time_window', 'unverified']), visualAssessment: z.literal('not_performed') }).strict(),
  retry: z.object({ retryable: z.boolean(), notBefore: timestamp.nullable(), reason: z.enum(['telemetry_unavailable', 'camera_unavailable']).nullable() }).strict(),
}).strict();
