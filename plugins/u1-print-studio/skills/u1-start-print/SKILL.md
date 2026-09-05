---
name: u1-start-print
description: Upload and start an exact validated G-code artifact on a Snapmaker U1 after explicit authorization, preflight checks, upload verification, and observed printing. Do not use for slicing or ongoing monitoring.
---

# U1 Start Print

Move one exact prepared artifact across the preparation-to-operations boundary.

This skill orchestrates authorization, guarded handoff, and observed state. It
does not replace the executable upload guard or expose a manual transport path.

## Authorization and preflight

Require fresh user authorization that identifies the artifact and target. A
general request to prepare a model does not authorize upload or start.

Before upload, verify current evidence that:

- the printer is reachable, ready, and not already printing;
- no printer exception is active;
- every heater target is safe for standby;
- the build plate is empty from direct user confirmation or a sufficiently
  clear current camera observation;
- the artifact passed static validation for this U1, filament, tool, bed type,
  temperatures, and requested process settings;
- the exact artifact, manifest, intended target, and explicit user
  correspondence `PASS` are bound by a current successful
  `validatePreparedArtifact` receipt; and
- local embedded-thumbnail evidence is present in that receipt for the exact
  selected plate/layout, as required by PREP-007 and decision 0040.

The supported handoff adapter must accept only opaque prepared-revision,
validation-receipt, one-use upload-authorization, target-preflight, idempotency
and correlation IDs. It resolves and snapshots the underlying records from
trusted stores, uses its trusted runtime clock and reruns validation. Never pass
raw artifact bytes, paths, caller time, caller-built gates or mutable records as
authority.

If the executable validator or a required receipt is unavailable, stop before
upload. A manual inspection, arbitrary local path, prior revision, or upload
authorization cannot substitute for a successful receipt.

## Handoff

Keep these states distinct and record evidence for each:

1. Invoke the shared `uploadPreparedArtifact` coordinator through that adapter.
   It is the only product upload path. It atomically claims the idempotency key,
   one-use authorization and action record before any external effect. Do not
   directly upload an arbitrary path or use raw HTTP, Moonraker, G-code, or
   admin passthrough. A pre-effect denial invokes the printer adapter zero times;
   a fully bound new request invokes it at most once.
2. Preserve the readonly guarded result and its replay/verification flags.
   Keep `acknowledged`, `rejected`, `timeout`, `transport_failed` and
   `outcome_unknown` distinct. A stable replay is the stored action result, not
   a new upload. Acknowledged or ambiguous effects require read-only
   reconciliation and must not be retried automatically.
3. Verify the remote size and metadata against the local artifact. Check tool
   usage, material, temperatures, layers, and estimate; do not rely only on the
   upload response shape.
4. Independently read target-parsed thumbnail metadata for the uploaded
   artifact and match its exposed image count, format, and dimensions to the
   receipt-bound local evidence. Missing, conflicting, or unavailable evidence
   blocks start even when upload succeeded.
5. Recheck printer readiness immediately before start.
6. Obtain or confirm separate fresh authorization for the exact start action,
   artifact, manifest, target, validity, and retry scope. Upload authorization
   and a guarded-upload result do not authorize start.
7. Send one start request and retain its acknowledgement separately.
8. Query fresh printer state until the exact filename is observed as
   `printing` with active virtual storage and the intended logical tool or its
   preheat target.

If upload or start outcome is ambiguous, do not retry. Resolve current target
state with read-only observations first. Never expose or use generic G-code,
HTTP, Moonraker, or admin passthrough as a substitute for this bounded workflow.

If preparation is wrong, return to `$u1-prepare-print` and require renewed
authorization for the new artifact. Do not modify G-code in this skill.

## Result

Report validation receipt, upload authorization, guarded-upload result and remote
verification, target-parsed thumbnail verification, start authorization, start
acknowledgement, and observed printer state as separate lines. `result: ok` is
not proof of physical motion or extrusion.

## Compose with monitoring

For a broader "Print this" request, after step 8 hand off the exact observed run
to the standalone [$u1-monitor-print](../u1-monitor-print/SKILL.md) workflow.
Include the private target/job identity, known artifact hash and manifest,
upload/start evidence, and fresh printing observation. The coordinator assigns
one monitoring owner and remains available; report monitoring active only after
that owner accepts the binding and next check. If monitoring cannot be enrolled,
report the observed print state and the supervision gap separately.

Explicit start-only requests stop after the result above. Preparation-only and
upload-only requests do not start a print or enroll monitoring. Composition does
not weaken authorization, preflight, or PREP-007/HANDOFF-007: local embedded
thumbnail validation stays before upload, and matching target-parsed thumbnail
metadata stays before start. A start acknowledgement alone never enrolls the
monitor or proves printing. Monitoring grants no pause, resume or cancel action.

The pure validation and guarded coordinator sources are maintained in
`plugins/u1-print-studio/app/src/lib/server/preparation/prepared-artifact.ts`
and `plugins/u1-print-studio/app/src/lib/server/application/upload-prepared-artifact.ts`.
Decision 0048 defines their proposed seam. No supported skill/CLI adapter or
real uploader invokes those sources yet; until an adapter exists, report the
handoff blocked rather than fall back to manual upload.
