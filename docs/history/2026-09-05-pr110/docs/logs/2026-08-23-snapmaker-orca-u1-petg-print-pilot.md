# Snapmaker Orca U1 PETG print pilot log

- Date: 2026-08-23
- Evidence type: chronological experiment log
- Preparation backend: Snapmaker Orca `2.3.5`
- CLI banner: `Snapmaker_Orca-01.10.01.50`
- Target: Snapmaker U1 with a `0.4 mm` nozzle
- Outcome: slice and user-authorized print completed; the path to a valid
  artifact required substantial CLI debugging

## Purpose and privacy boundary

The user asked to select only the second plate from a private multi-plate 3MF,
slice its two parts with PETG assigned to physical extruder 3, and print them.
The private model, local paths, resolved local profiles, generated G-code,
printer identifiers, and runtime records are not retained in this repository.
This log retains only the settings, hashes, state transitions, failures, and
lessons needed to reproduce the behavior with a non-user fixture.

This is an experiment record, not a product capability claim. A later
knowledge note extracts provisional reusable guidance from this log.

## Requested job

| Field | Requested or accepted value |
| --- | --- |
| Plate | Second plate only |
| Objects | Two cam-plate parts |
| Printer profile | `Snapmaker U1 (0.4 nozzle) - Local` |
| Process | `0.20 Standard @Snapmaker U1 (0.4 nozzle)` |
| Filament | Snapmaker PETG |
| Physical extruder | 3 |
| Logical G-code tool | `T2` |
| Support | Off |
| Sparse infill | 15% |
| Wall loops | 2 |
| Nozzle temperature | 250 C first layer; 245 C afterward |
| Textured-bed temperature | 70 C |

The `T2` distinction is important: the user-facing physical extruder number is
one-based, while the G-code tool index is zero-based.

## Chronological run log

### 1. Direct project slicing did not establish a usable path

The first attempts passed the private 3MF directly to the Snapmaker Orca CLI
and selected its second plate.

| Attempt | Result | Observation |
| --- | --- | --- |
| Direct `--slice 2` | Exit `232` | The project was not accepted by the initial invocation. |
| `--allow-newer-file 1 --slice 2` | Exit `253` | `--allow-newer-file` is a flag, not a flag-value pair. |
| `--allow-newer-file --slice 2` | Exit `139` | The syntactically corrected invocation crashed with a segmentation fault. |

Exporting another project 3MF did not create a reliable shortcut: the exported
project still encountered version handling and exit `139` when sliced. The
successful pilot therefore did not come from proving direct private-3MF
round-trip compatibility.

### 2. Reduced inputs exposed profile-resolution failures

The two target objects were isolated as temporary STL inputs outside the
repository. Reduced slicing attempts produced several distinct exit results:

| Configuration | Result | What it established |
| --- | --- | --- |
| Minimal STL, no explicit profiles | Exit `205` | A mesh alone was insufficient. |
| Resolved machine only | Exit `239` | Machine configuration alone was insufficient. |
| Machine plus inherited process leaf | Exit `139` | A child preset was not a safe complete CLI process profile. |
| Other invalid export/configuration probes | Exits `254`, `232`, and `139` | Argument, compatibility, and process crashes needed separate classification. |

Bundled profile JSON files use inheritance. Passing a named leaf preset did
not provide the complete resolved values the CLI path needed.

### 3. One process setting correlated with the repeatable crash

The resolved process data still contained:

```json
{"wipe_tower_filament":"0"}
```

In this observed Snapmaker Orca CLI path, retaining that leaf produced exit
`139`; removing or correcting it allowed slicing to advance. This is a
single-environment observation and remains a regression hypothesis until it is
reproduced with a non-user fixture across multiple runs.

### 4. An incomplete filament profile silently broke tool selection

Early temporary filament JSON files omitted inherited base fields including:

- `filament_diameter`
- `filament_is_support`

The slicer then resolved only one physical extruder and emitted or selected
`T0`, despite receiving `--load-filament-ids '3,3'`. Supplying complete
resolved filament profiles for all four U1 extruder slots restored four
physical extruders and the required `T2` output.

This was a semantic failure, not merely a process-exit failure: a CLI exit of
zero would not have made a `T0` artifact acceptable for this request.

### 5. A shell wrapper briefly obscured one result

One diagnostic wrapper attempted to assign to zsh's read-only `status`
parameter. The wrapper returned exit `1` even though the slicer log showed that
the child process had finished. Future wrappers must capture the result in a
task-specific variable such as `rc` and report wrapper and slicer exits
separately.

### 6. Successful preparation path

The first successful invocation used two isolated STL inputs, a complete
resolved machine/process configuration, four complete resolved filament
profiles, and explicit material assignment:

```text
Snapmaker_Orca --debug 3
  --load-settings '<resolved-machine.json>;<resolved-process.json>'
  --load-filaments '<slot-1.json>;<slot-2.json>;<slot-3.json>;<slot-4.json>'
  --load-filament-ids '3,3'
  --slice 0
  --outputdir '<isolated-output-directory>'
  '<left-object.stl>' '<right-object.stl>'
```

The slicer returned exit `0`. Before any printer action, the output was checked
for four resolved physical extruders, `T2` commands, the accepted process and
temperature settings, output existence, and a stable SHA-256.

Generated G-code SHA-256:
`057f7e06d7d3da28329fe4588d1039c925c4bba74d23783573204448622d2d36`

The source and resolved-profile hashes were not captured in a product manifest,
so this run is not a complete implementation of `PREP-002`, `PREP-005`, or
`HANDOFF-001`.

## Preparation-to-print state evidence

The states below remain separate even though the pilot completed end to end:

| State | Evidence from this pilot |
| --- | --- |
| Slice invocation succeeded | Snapmaker Orca returned exit `0`. |
| Artifact created | A plate G-code file existed in the isolated output directory. |
| Artifact semantically validated | The file used `T2` and matched the accepted core settings. |
| Upload authorized and attempted | The user explicitly requested slicing and printing; the artifact was sent to the selected U1. |
| Start acknowledged | The printer accepted the user-authorized start request. |
| Printing observed | The target reported active layer progress. |
| Completion observed | The target reported `22/22` layers, `827.288` seconds, and no printer errors. |
| Physical parts observed | The printed pieces were later handled and assembled by the user. |
| Mechanism accepted | No. Physical assembly exposed separate fit and mechanism-design failures. |

The observed physical parts prove that this specific artifact was printed, but
they do not validate the proposed locking mechanism, dimensions, wear, or a
generalized automated workflow.

## Result

The requested PETG parts were sliced with logical tool `T2` and printed on the
Snapmaker U1. The user outcome for obtaining the two printed parts was achieved.
The operational experience was poor because the CLI crash ladder, profile
inheritance, and tool-mapping failure required a long manual investigation.

The next evidence step is not immediate product code. It is to reproduce the
preflight checks and success path several times with non-user fixtures, record
each run, and only then promote stable findings into automation.
