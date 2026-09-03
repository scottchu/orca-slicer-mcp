# 0048 — Guard upload with content-bound preparation receipts

- Status: proposed; pure-core source independently accepted, adapters pending
- Date: 2026-09-03
- Owners: project maintainers
- Milestone: F0 / P1 / I1

## Context

Decision 0003 leaves exact upload ownership and transport open while requiring
an explicit, versioned preparation-to-operations handoff. Decision 0007 defers a
shared CLI until repeated skill use reveals stable operations. The later print
repetitions now show the same high-value checks recurring: effective object
overrides, tool mapping, thermal commands, plate identity and embedded
thumbnails must all be resolved against the final artifact before upload.

Manual skill steps preserve intent but do not make the boundary deterministic.
A later upload can name different bytes, reuse stale review evidence, trust a
caller-supplied clock or gate, or retry an uncertain external effect. Putting
preparation policy inside a printer adapter would instead collapse the peer
subsystem boundary that decision 0003 protects.

Decision 0040 already requires local embedded-thumbnail verification before
upload and target-parsed thumbnail verification after upload. Its end-to-end
enforcement remains incomplete: the accepted source below is internal pure core
with injected stores and a fake upload port, not a supported workflow adapter or
real target integration.

## Decision

Adopt the following proposed application seam:

1. Orca Preparation owns pure `validatePreparedArtifact`. It accepts only an
   internal trusted snapshot containing `PreparationSpec`, `PreparationManifest`,
   final artifact bytes, a digest-bound `ResolvedSettingsReceipt` and a
   challenge/digest-bound `ThumbnailCorrespondenceReceipt`. A future public
   adapter accepts opaque IDs and resolves these records from trusted stores;
   it never accepts raw artifact paths or caller-constructed evidence.
2. Validation emits a readonly `PreparedArtifactValidationReceipt` with schema,
   validator and requirements versions, deterministic `validationId`, exact
   preparation-spec/manifest/artifact hashes, prepared-job revision, target
   fingerprint, resolved-settings and correspondence receipt IDs/digests,
   decoded thumbnail evidence, overall status and ordered checks. `passed`,
   `blocked`, `unavailable` and `error` remain distinct; only `passed` is upload
   eligible. The receipt is evidence, not upload or start authority.
3. A shared handoff coordinator owns pure `uploadPreparedArtifact`. Its public
   request contains only opaque prepared-revision, validation-receipt,
   upload-authorization, target-preflight, idempotency and correlation IDs. The
   coordinator resolves and snapshots trusted records, reruns validation,
   verifies exact digests/bindings/freshness with a trusted runtime clock,
   atomically claims one-use authorization and idempotent action state, then
   invokes the printer-specific upload port at most once.
4. Boundary snapshots reject accessors, prototype pollution, cycles, malformed
   shapes and mutable data before they become authority. Stores, clock,
   deadlines and upload port are injected contracts in this slice; no durable
   implementation or real uploader is implied.
5. Upload outcomes remain truthful: `acknowledged`, `rejected`, `timeout`,
   `transport_failed` and `outcome_unknown` are not collapsed. Acknowledged and
   ambiguous outcomes require later verification and are not retried as new
   effects. Stable replay reads the stored action record. Private remote artifact
   identity and authorization-consumption time stay in the internal record, not
   the model-visible result.

Validation of thermal intent is scoped to commands before the first provable
positive extrusion delta. It tracks absolute/relative extrusion, `G92 E`, active
tool selection and an explicit inline tool. The first positive extrusion must
use a declared tool whose heated/unheated and required/not-required wait intent
matches the observed schedule. Unprovable extrusion boundaries, unknown startup
semantics and ambiguous parameters fail closed as `unavailable` or `error`.
Shutdown commands after extrusion do not invalidate a valid startup schedule,
and command targets never prove actual temperature.

Effective wall evidence comes from the bound resolver receipt, not informational
manifest claims or extrusion-line counts. Thumbnail extraction proves bounded,
decodable, nonblank PNG evidence; layout correspondence still requires the
explicit reviewer receipt bound to the same artifact, manifest, plate-layout
hash and thumbnail hashes. These checks do not prove geometry, printability or
physical safety.

The first planned public transport is a narrow local CLI calling these same use
cases through trusted stores. MCP mutation exposure remains deferred until CLI
and adapter evidence stabilizes the schemas, denial reasons, replay and recovery
semantics. Neither transport may weaken identity, authority, freshness or
single-effect guards.

After guarded upload, decision 0040's target-parsed thumbnail comparison remains
a separate pre-start gate. Start authorization, start request, acknowledgement,
observed printing, monitoring, printer completion, camera evidence and physical
acceptance remain separate states and evidence.

## Consequences

- Decision 0003 gains a proposed concrete ownership split without subordinating
  either peer: Preparation validates, Operations owns target/transport behavior,
  and the coordinator guards the handoff.
- Decision 0007's promotion threshold is met only for this repeated narrow core.
  It does not justify a general printer CLI, MCP mutation tools, persistent
  monitoring or arbitrary passthrough.
- Skills remain user-intent and orchestration guidance. They cannot mint trusted
  receipts, supply raw evidence to the core, call source modules directly or
  declare upload success.
- The user remains the authority for visual correspondence and subjective
  intent through an explicit `PASS`/`FAIL` challenge bound to the exact revision
  and evidence hashes.
- The pure source can prove deterministic decisions, bound evidence, one-use
  authority and zero/one fake-port effects. It cannot prove durable-store
  behavior, real upload, target parsing, printer safety, print quality or user
  acceptance.

## Validation

Pure-core acceptance requires independent architecture and printer-domain
review of one exact candidate plus non-user fixtures covering:

- trusted effective-wall evidence and rejection of manifest-only claims;
- required/not-required waits, intentional unheated targets, active/inline tool
  selection and the first positive extrusion boundary;
- ambiguous syntax, unknown unapproved startup semantics, bounded G-code/PNG
  parsing and missing/corrupt/blank/stale thumbnail evidence;
- content-bound settings, correspondence and validation receipt identities;
- trusted-store lookup, runtime snapshots, server-clock expiry, one-use
  authorization, idempotency conflict/replay and cancellation;
- zero upload-port calls for every pre-effect denial and one call for a fully
  bound request; and
- truthful, stored handling of acknowledgement, rejection, timeout, transport
  failure and unknown outcome without an automatic duplicate effect.

The proposed decision remains unaccepted at the transport/product level until a
supported adapter and durable stores preserve the same contract. A later real
target gate must separately verify target-parsed thumbnail metadata before
start. No printer, network, upload, start, service deployment or installed-plugin
change is required for pure-core validation.
