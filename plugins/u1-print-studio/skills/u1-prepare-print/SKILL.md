---
name: u1-prepare-print
description: Prepare a specific plate or set of objects for a Snapmaker U1 with a real slicer CLI, explicit profiles and tool mapping, and static G-code validation. Use for slicing and preparation only; do not upload or start a print.
---

# U1 Prepare Print

Produce a traceable prepared artifact without contacting the printer.

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
  filament temperature fields alone do not prove a heated bed.
- Do not infer support from a prior part. Inspect the selected geometry and
  preserve explicit support annotations when present.
- Keep child-process exit, artifact creation, and semantic validation distinct.
  Always statically validate movement, extrusion, bounds, temperatures, tool,
  wall loops, support state, layer count, object count, and filament usage.

The observed Snapmaker Orca `2.3.5` `wipe_tower_filament: "0"` crash is a
provisional guard, not a universal slicer rule. Preserve the exact failure and
stop rather than silently substituting another backend or profile.

## Result

Return the artifact path and hash plus a compact review of backend, plate or
objects, printer, process, filament, physical and logical tool, walls, support,
temperatures, layers, estimate, and validation findings. Mark the result
`prepared`, never `uploaded`, `started`, or `printing`.

When working in the source repository, use
`docs/knowledge/snapmaker-orca-cli-preparation.md` for the maintained evidence
and unknowns.
