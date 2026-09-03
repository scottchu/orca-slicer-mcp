---
name: u1-prepare-print
description: Prepare a specific plate or set of objects for a Snapmaker U1 with a real slicer CLI, explicit profiles and tool mapping, and static G-code validation. Use for slicing and preparation only; do not upload or start a print.
---

# U1 Prepare Print

Produce a traceable prepared artifact without contacting the printer.

This skill orchestrates user intent and the supported preparation tools. It
does not replace or manually attest the repository's executable validation
policy.

## Required request data

Resolve the source model, selected plate or objects, Snapmaker U1 nozzle and
process profile, filament type, physical tool head, wall loops, support intent,
and any other user overrides. Preserve the source file unchanged. A reslice or
setting change is a new artifact revision.

Use `uv run` for every Python invocation. Do not call `python` or `python3`
directly.

## Preparation boundary

- Use the exact requested slicer edition and record its version.
- Treat embedded project settings, inherited presets, object-level overrides,
  and explicit overrides as separate inputs. Object overrides can defeat a
  global wall-loop change, so inspect them before slicing.
- Resolve the machine, process, and all four filament-slot profiles. Each slot
  must retain required inherited fields, including `filament_diameter` and
  `filament_is_support`.
- Map physical tool head `N` to zero-based G-code tool `T(N-1)` and verify the
  generated commands and per-tool filament usage.
- Treat direct multi-plate 3MF slicing as provisional. If it fails or retains
  incompatible global plate coordinates, isolate only the selected objects
  without changing mesh scale, orientation, instance count, or identity, then
  arrange them for the U1.
- Preserve the selected bed type. Verify actual `M140` and `M190` values;
  filament temperature fields alone do not prove a heated bed. Compare the
  schedule before the first provable positive extrusion delta with explicit
  `heated` or intentionally `unheated` intent. For heated intent, record whether
  wait is `required` or `not_required`; never infer that choice from generated
  commands. Track absolute/relative extrusion, `G92 E`, active tool and explicit
  inline tool so the first positive extrusion is bound to its declared tool
  intent. Other thermal authority models are unsupported by the first contract.
  A shutdown `S0` after extrusion is normal and a command target does not prove
  actual bed temperature. Ambiguous extrusion syntax or an unapproved startup
  command is `unavailable` or `error`, not guessed success.
- Do not infer support from a prior part. Inspect the selected geometry and
  preserve explicit support annotations when present.
- Keep child-process exit, artifact creation, and semantic validation distinct.
  Always statically validate movement, extrusion, bounds, temperatures, tool,
  wall loops, support state, layer count, object count, and filament usage.
  Resolve effective wall loops and provenance for every selected printable
  object, part, and modifier scope the backend exposes. Bind those facts in a
  digest-verified `ResolvedSettingsReceipt`; informational manifest claims are
  insufficient. Do not infer physical perimeter count from extrusion lines.
- Produce the matching-edition plate preview and ask the user to judge only the
  exact selected objects, orientation, and arrangement. Explain what is fixed
  and what remains adjustable, then obtain an explicit `PASS` or `FAIL`. Record
  that verdict and its reviewer class as review evidence for a future trusted
  adapter; the skill cannot mint the challenge or receipt. The adapter must bind
  a fresh challenge, artifact/manifest/layout identities and thumbnail hashes
  in a digest-bound `ThumbnailCorrespondenceReceipt`. `FAIL`, missing evidence
  or stale/mismatched bindings are not prepared acceptance.
- Extract and decode the final artifact's embedded thumbnails. Verify count,
  format, dimensions, nonempty image content, and correspondence to that same
  selected plate/layout. A thumbnail setting, standalone preview, placeholder,
  or image from another revision is not evidence.
- Once a supported adapter exposes the repository's pure
  `validatePreparedArtifact` use case, pass only opaque prepared-job and source
  receipt IDs. The adapter must resolve immutable trusted records and exact
  artifact bytes; never pass a caller-selected raw path or construct validation
  input directly. Accept only a current content-bound receipt with the expected
  schema, validator/requirements versions and deterministic `validationId` when
  its overall result is `passed`. Preserve `blocked`, `unavailable`, and `error`
  distinctly; all block upload. Never mint a receipt, reinterpret a finding, or
  substitute an ad hoc check for executable success.

The observed Snapmaker Orca `2.3.5` `wipe_tower_filament: "0"` crash is a
provisional guard, not a universal slicer rule. Preserve the exact failure and
stop rather than silently substituting another backend or profile.

## Result

Return the artifact path and hash plus a compact review of backend, plate or
objects, printer, process, filament, physical and logical tool, walls, support,
temperatures, layers, estimate, explicit correspondence verdict, embedded-image
evidence, and validation findings. When executable validation is available,
include its receipt ID, `validationId`, schema and validator/requirements
versions. Mark the result `prepared` only after
the exact content-bound validation receipt succeeds; never mark it `uploaded`,
`started`, or `printing`.

If executable validation is unavailable, report `validation unavailable` and
the prepared state as blocked. Do not promote a manual inspection, arbitrary
artifact path, or prior revision's receipt into a successful prepared result.

When working in the source repository, use
`docs/knowledge/snapmaker-orca-cli-preparation.md` for the maintained evidence
and unknowns. The pure contract is maintained in
`plugins/u1-print-studio/app/src/lib/server/preparation/prepared-artifact.ts`.
Decision 0048 defines the proposed shared receipt and guarded upload seam. No
supported skill/CLI adapter invokes that source yet; until one exists, report
executable validation unavailable rather than claiming a prepared result.
