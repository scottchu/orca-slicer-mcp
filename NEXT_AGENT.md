# Next agent

Start with these repository records:

1. `PROJECT_STATE.md`
2. `docs/vision.md`, `docs/scope.md`, and `docs/roadmap.md`
3. `docs/requirements.md` and `docs/environment.md`
4. `docs/decisions/README.md` and its accepted decisions
5. `docs/iterations/CURRENT` and every file in that iteration

Do not use prior chat history as authority when it conflicts with these files.

## Exact baseline

- Main baseline: `26affbb`
- Working baseline: `be883d3`
- Active iteration: `2026-08-23-f0-dual-subsystem-foundation`
- Product runtime: none
- Product evidence: planning, repository workflow, and product-boundary records
  only

## Immediate task

Gather both concrete environments:

1. OrcaSlicer edition/version, invocation path, supported automation behavior,
   input/output formats, and printer/filament/process profile sources.
2. Printer model/firmware, connection path, camera, always-on host,
   notification destination, and network boundary.

Draft the prepared-artifact manifest and upload/start ownership questions from
observed behavior. Record facts in `docs/environment.md` and evidence in the
active iteration's `VALIDATION.md`.

Do not scaffold either runtime or select adapters until F0 identifies the first
concrete environments and an evidence-backed handoff boundary.

## Preserve

- Orca Preparation and Printer Operations are peer subsystems.
- A prepared print job is the preparation aggregate; a print session is the
  execution aggregate.
- Observation, recommendation, authorization, action, and verification remain
  distinct stages.
- Consequential or uncertain actions default to explicit user authorization.
- OrcaSlicer is an adapter inside Preparation, not a later add-on around Printer
  Operations.
- Slicing, artifact validation, upload, start acknowledgement, and observed
  printing remain distinct states and evidence.
- Repository records capture durable decisions and evidence; raw conversation
  transcripts do not.

## Do not assume

- An API acknowledgement proves the requested printer state or physical effect.
- Camera inference is reliable across lighting, filament, plate, and viewpoint.
- A command supported by one printer or firmware is portable to another.
- A successful OrcaSlicer process proves printer compatibility or printability.
- A project or profile from another environment establishes the first target.
- Static or simulator checks prove real-printer safety.
- The printer available in another project is automatically the first target
  for this one.

## Copy-paste restart prompt

```text
Resume /Users/scottchu/Projects/personal/orca-slicer-mcp from the repository
records, not chat memory. Read PROJECT_STATE.md, NEXT_AGENT.md,
docs/requirements.md, docs/environment.md, accepted ADRs, and the iteration
named by docs/iterations/CURRENT. Treat Orca Preparation and Printer Operations
as peer subsystems joined by an explicit prepared-job/session handoff. Continue
only the next action recorded there. Keep static/software evidence, including
labeled real-Orca tool integration, separate from protocol/simulator,
real-printer, and user-outcome evidence. Do not choose runtimes or implement
consequential actions until the F0 environment, handoff, and safety boundaries
are established.
```
