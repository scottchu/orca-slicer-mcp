# Snapmaker Orca CLI preparation knowledge

- Derived from the [2026-08-23 PETG pilot](../logs/2026-08-23-snapmaker-orca-u1-petg-print-pilot.md)
  and [2026-08-25 PLA repetitions](../logs/2026-08-25-snapmaker-u1-pla-print-repetitions.md)
- Status: provisional knowledge from three successful printer handoffs and two
  telemetry-verified PLA completions
- Promotion gate: use the thin skills repeatedly before deciding whether a
  shared CLI would improve the workflow; retain non-user fixtures as the gate
  for universal guards or product-runtime claims

## What is currently known

The observed Snapmaker Orca `2.3.5` macOS CLI can produce valid U1 multi-tool
G-code, but a successful and safe invocation requires more than a valid mesh
and a named preset leaf.

For the observed four-extruder U1 path:

1. Machine, process, and filament inheritance must be resolved before launch.
2. All physical filament slots must retain required base fields; otherwise the
   slicer's tool inventory can collapse and change the requested tool.
3. Physical tool head `N` must be verified as zero-based logical G-code tool
   `T(N-1)` in the generated artifact and in per-tool filament use.
4. Process exit, artifact creation, and semantic artifact validation are three
   different checks.
5. Upload, start acknowledgement, printing observation, completion, and
   physical acceptance remain separate evidence.

## Provisional crash and correctness guards

These guards come from one environment and must be treated as regression
candidates rather than universal Orca behavior:

| Guard | Current reason |
| --- | --- |
| Reject unresolved child profile fragments | Machine-only and inherited process-leaf attempts failed or crashed. |
| Require `filament_diameter` for every loaded slot | Its omission accompanied collapse from four physical extruders to one. |
| Require `filament_is_support` for every loaded slot | Its omission accompanied the same incorrect tool inventory. |
| Flag `wipe_tower_filament: "0"` for this backend/version | The observed CLI path crashed with exit `139` until this value was removed or corrected. |
| Verify resolved extruder count | Requested filament IDs alone did not prevent an incorrect one-extruder result. |
| Inspect G-code tool commands | Exit `0` cannot prove that physical extruder 3 became `T2`. |
| Inspect object-level process overrides | A selected plate retained four-wall object overrides despite a different global wall count. |
| Preserve and verify the selected bed type | A successful slice with `55 C` filament hot-plate fields still emitted `M140 S0` and `M190 S0` when the bed type was absent. |
| Treat direct multi-plate coordinates as provisional | A selected plate retained global coordinates outside the U1 bed; isolated selected geometry arranged successfully. |
| Use a wrapper variable such as `rc`, never zsh `status` | `status` is read-only and created a false wrapper failure. |

An exit `139` should be retained as a slicer crash with the bounded invocation
and diagnostics, not normalized into a generic slice failure. Exits `205`,
`232`, `239`, `253`, and `254` were also observed under different invalid or
incomplete configurations and must remain distinguishable during future runs.

## Smallest repeatable preparation protocol

Before starting the process:

- fingerprint the Snapmaker Orca executable and record its bundle and CLI
  versions;
- copy or generate only non-user fixture inputs into an isolated run directory;
- resolve and fingerprint machine, process, and all filament-slot profiles;
- validate required filament fields and expected physical-extruder count;
- bind the intended physical extruder to its zero-based G-code tool;
- inventory custom G-code and reject it unless separately approved;
- use a new isolated output directory and ensure no stale artifact can satisfy
  the run.

After the process exits:

- record the child-process exit independently from the wrapper exit;
- require a newly created artifact;
- hash the artifact;
- statically inspect tool commands, temperatures, layer count, and core process
  values;
- inspect actual `M140` and `M190` commands rather than relying on filament
  temperature metadata;
- verify selected object count and any object-level wall or support overrides;
- fail the preparation request if the actual tool does not match the requested
  physical extruder;
- create a new revision for every reslice or configuration change.

No upload or print start belongs to this preparation protocol.

## Evidence ladder for the next runs

Each repetition gets its own chronological log and a compact result row. The
next stage should cover at least these independent cases:

1. A synthetic two-object STL fixture using the known resolved-profile path.
2. A synthetic multi-plate 3MF that tests plate selection and newer-file
   handling without private user data.
3. A negative fixture retaining the observed `wipe_tower_filament` value to
   determine whether exit `139` is repeatable.
4. A negative filament fixture missing one required inherited field to confirm
   that preflight blocks tool collapse before Orca launches.
5. Repeated successful dry slices that produce the same semantic configuration
   and explain any byte-level hash differences.

Printer upload or print-start repetitions require fresh explicit authorization
for the exact artifact and target. Dry-slice repetitions do not prove physical
printing.

## Current promotion path

The evidence should mature in this order:

```text
chronological run logs
  -> reviewed knowledge and explicit unknowns
  -> thin preparation, start, and monitoring skills
  -> repeated real use plus non-user fixtures and a regression matrix
  -> reusable CLI code only where repeated use proves value
  -> MCP tools that expose preparation and operations through separate,
     authorization-aware boundaries
```

Decision 0007 intentionally introduces thin skills before shared code so their
use can reveal which operations are stable and worth automating. The skills
must not present manual shell sequences as a supported runtime. If a shared CLI
is later justified, code should own deterministic profile resolution,
preflight, invocation, diagnostics, artifact validation, and operations
correlation. MCP still comes only after those contracts are stable and must not
collapse slice, upload, start, and observed printing into one opaque action.

## Handoff and monitoring knowledge

- An upload response shape can vary. Verify remote file metadata independently
  before start.
- A correct remote size is insufficient; verify material slot use, actual bed
  and nozzle temperatures, layers, and estimate.
- Start acknowledgement and fresh `printing` observation remain distinct.
- Monitoring chooses the next check after every sample. Stable middle sections
  tolerate longer intervals; final minutes require progressively shorter ones.
- `N/N` layers is not completion while state remains `printing`; end G-code can
  still be moving, heating, or parking.
- Camera and telemetry transports can fail independently. State camera
  confidence and retry without converting a snapshot failure into a printer
  error.
- Final camera views can lose the part when the bed lowers. Preserve earlier
  visual evidence and keep physical acceptance separate.

## Still unknown

- whether the `wipe_tower_filament` crash reproduces across clean fixtures and
  repeated processes;
- whether direct multi-plate 3MF slicing can be made reliable without reducing
  inputs to STL;
- exact GUI-versus-CLI parity for the local U1 profiles;
- which profile fields form the minimum complete schema for each backend
  version;
- whether identical inputs are byte-for-byte deterministic;
- timeout, cancellation, resource-limit, and concurrent-run behavior;
- a complete prepared-job manifest and explicit Preparation-to-Operations
  handoff implementation.
- which manual operations remain frequent and stable enough to justify a
  shared CLI;
- a calibrated remaining-time estimator for adaptive monitoring.
