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
- Active iteration: `2026-08-22-m0-first-printer-discovery`
- Product runtime: none
- Product evidence: planning and repository workflow only

## Immediate task

Gather the exact target printer, firmware, connection path, camera, always-on
host, notification destination, and network boundary. Record observed facts in
`docs/environment.md` and protocol checks in the active iteration's
`VALIDATION.md`.

Do not scaffold a runtime or select a vendor adapter until this discovery
identifies the first concrete environment.

## Preserve

- A print session is the central product concept.
- Observation, recommendation, authorization, action, and verification remain
  distinct stages.
- Consequential or uncertain actions default to explicit user authorization.
- Slicing is a later capability, not the product boundary.
- Repository records capture durable decisions and evidence; raw conversation
  transcripts do not.

## Do not assume

- An API acknowledgement proves the requested printer state or physical effect.
- Camera inference is reliable across lighting, filament, plate, and viewpoint.
- A command supported by one printer or firmware is portable to another.
- Static or simulator checks prove real-printer safety.
- The printer available in another project is automatically the first target
  for this one.

## Copy-paste restart prompt

```text
Resume /Users/scottchu/Projects/personal/orca-slicer-mcp from the repository
records, not chat memory. Read PROJECT_STATE.md, NEXT_AGENT.md,
docs/requirements.md, docs/environment.md, accepted ADRs, and the iteration
named by docs/iterations/CURRENT. Continue only the next action recorded there.
Keep static/software, protocol/simulator, real-printer, and user-outcome
evidence separate. Do not choose a runtime or implement control until the M0
target environment and safety boundary are established.
```
