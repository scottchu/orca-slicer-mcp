---
name: u1-start-print
description: Upload and start an exact validated G-code artifact on a Snapmaker U1 after explicit authorization, preflight checks, upload verification, and observed printing. Do not use for slicing or ongoing monitoring.
---

# U1 Start Print

Move one exact prepared artifact across the preparation-to-operations boundary.

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
  temperatures, and requested process settings.

## Handoff

Keep these states distinct and record evidence for each:

1. Upload the exact artifact once.
2. Verify the remote size and metadata against the local artifact. Check tool
   usage, material, temperatures, layers, and estimate; do not rely only on the
   upload response shape.
3. Recheck printer readiness immediately before start.
4. Send one start request and retain its acknowledgement separately.
5. Query fresh printer state until the exact filename is observed as
   `printing` with active virtual storage and the intended logical tool or its
   preheat target.

If start outcome is ambiguous, do not retry. Resolve current printer state with
read-only observations first. Never expose or use generic G-code, HTTP, or
admin passthrough as a substitute for this bounded workflow.

If preparation is wrong, return to `$u1-prepare-print` and require renewed
authorization for the new artifact. Do not modify G-code in this skill.

## Result

Report upload verification, start acknowledgement, and observed printer state
as separate lines. `result: ok` is not proof of physical motion or extrusion.

## Compose with monitoring

For a broader "Print this" request, after step 5 hand off the exact observed run
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
