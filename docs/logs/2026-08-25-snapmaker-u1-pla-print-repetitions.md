# Snapmaker U1 PLA print repetitions

- Date: 2026-08-25
- Evidence type: chronological experiment journal
- Preparation backend: Snapmaker Orca `2.3.5`
- Target: Snapmaker U1 with a `0.4 mm` nozzle
- Outcome: two user-authorized PLA jobs reached telemetry-verified completion;
  the first output was physically accepted by the user, while the second still
  awaits handling

## Privacy and evidence boundary

This journal omits the private model and project names, local and printer
addresses, generated artifacts, resolved private paths, and runtime images. It
retains only settings, state transitions, failures, repairs, and acceptance
boundaries that can improve a later non-user fixture or manual repetition.

## First PLA repetition

The first requested plate used the U1 `0.20 Standard` process, PLA on physical
tool head 4 (`T3` in G-code), three wall loops, and no support.

Preparation, artifact creation, static validation, upload, start
acknowledgement, observed printing, and observed completion were kept separate.
The printer ultimately reported `380/380`, full file progress, `complete`, no
exception, parked tools, and heater targets returning to zero. A final camera
frame showed the lowered platform and no obvious failure, but only part of the
printed object remained in frame. The user later reported that the print was
acceptable, providing physical-outcome evidence beyond telemetry.

## Second PLA repetition chronology

The second requested plate contained four instances of one axis mesh. The job
used the same U1 process, PLA on physical tool head 2 (`T1`), three wall loops,
and support disabled.

1. Printer telemetry showed ready standby, inactive virtual storage, parked
   tools, zero heater targets, and no exception. The user directly confirmed
   that the build plate was empty.
2. Project inspection found a global two-wall setting but a four-wall
   object-level override on the selected objects. Both levels had to be changed
   or verified to satisfy the requested three walls.
3. Direct multi-plate 3MF slicing with leaf profiles reproduced exit `139`.
   Resolving machine, process, and all four filament-slot inheritance chains
   advanced the slicer, but the selected plate retained global coordinates
   outside the U1 bed and still failed.
4. The selected watertight axis mesh was isolated without changing geometry.
   Four identical STL inputs were arranged for the U1 with explicit physical
   tool assignment. Snapmaker Orca returned exit `0`.
5. The first isolated artifact passed a general static validator but contained
   `M140 S0` and `M190 S0`. The missing selected bed type meant the loaded
   filament's `55 C` hot-plate field was not actually used. The artifact was
   uploaded during handoff validation but never started.
6. The process was resliced with `High Temp Plate` preserved. Static inspection
   then confirmed `M140 S55`, `M190 S55`, `T1`, three wall loops, support off,
   four objects, four complete PLA slots, `188` layers, and filament use only
   in slot 2. Bounds, movement, extrusion, and temperature validation passed.
7. The corrected remote artifact was verified independently for complete size,
   `55 C` first-layer bed temperature, `220 C` first-layer nozzle temperature,
   `188` layers, and slot-2 material use. The start request returned `ok`; a
   fresh observation separately reported the exact job `printing`, active
   virtual storage, tool 2 preheating, and no exception.
8. Camera and telemetry monitoring observed four upright attached parts at
   `158/188`, then shortened the next-check interval as the job approached its
   end. `188/188` was not treated as complete while job state remained
   `printing` and end G-code was still active.
9. Final telemetry reported `complete`, `100%`, full file position, inactive
   virtual storage, `188/188`, no exception, parked tools, and all heater
   targets at zero after about 32 minutes 24 seconds of print duration. The
   final camera frame showed the lowered platform, placing the parts out of
   view; the strongest visual evidence remains the earlier intact in-progress
   frame. Physical handling remains unverified.

## Monitoring lesson

A fixed polling interval is inferior to choosing the next observation after
each sample. Startup and first-layer checks need short delays; stable middle
sections can use longer delays; the final minutes should shorten progressively.
When all layers are reported but state is still `printing`, checks should occur
within tens of seconds until end G-code produces a terminal state.

Camera transport and telemetry can also fail independently. One direct backend
camera route returned `404` and one snapshot timed out while telemetry remained
healthy. Camera retry must not be normalized into a printer fault.

## Result and next evidence

The repetitions provide useful human-operated workflows for preparation,
authorized start, and adaptive monitoring. They do not yet justify a shared
CLI implementation. The user directed the project to record this journal,
promote reviewed knowledge, and create thin skills first. Reusable CLI code
will be considered only after repeated use shows which steps deserve stable
automation.
