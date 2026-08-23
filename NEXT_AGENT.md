# Next agent

Start with these repository records:

1. `PROJECT_STATE.md`
2. `docs/vision.md`, `docs/scope.md`, and `docs/roadmap.md`
3. `docs/requirements.md` and `docs/environment.md`
4. `docs/decisions/README.md` and its accepted decisions
5. `docs/iterations/CURRENT` and every file in that iteration

Do not use prior chat history as authority when it conflicts with these files.

## Exact baseline

- Branch point from `main`: `32762dd`
- Active iteration: `2026-08-23-f0-dual-subsystem-foundation`
- Product runtime: none
- Product evidence: planning and product-boundary records; local, non-mutating
  Orca and Snapmaker Orca discovery; plus redacted, read-only Moonraker HTTP,
  WebSocket, and webcam observations

## Immediate task

Current execution order is Orca Preparation discovery first. Continue with:

1. Select upstream OrcaSlicer `2.4.2` or Snapmaker Orca `2.3.5` for one
   non-user fixture and explicit complete profile.
2. Dry-run, slice, statically validate, and assemble a revisioned review bundle
   for preview in the matching GUI. Do not upload or start it.
3. Exercise support-enforcer and blocker round-trip only after the baseline
   fixture passes. Preserve user-painted support projects but do not synthesize
   facet painting without golden round-trip fixtures.
4. Resume Printer Operations with a compatible `printer.objects.subscribe`
   client, reconnect and freshness behavior, exact printer model, always-on
   host, notification destination, and network/authentication boundary.

Use `docs/orca-preparation-findings.md` as the discovery boundary. Draft the
review-bundle and prepared-artifact manifest from observed output, then record
facts in `docs/environment.md` and evidence in the active iteration's
`VALIDATION.md`.

The candidate Orca executables and first printer read-only status, camera
snapshot, object inventory, and WebSocket transport are already recorded. No
real slice, support round-trip, printer command, upload, or print start has been
accepted. Do not scaffold either runtime until the remaining F0 environment and
handoff questions have enough evidence.

## Preserve

- Run repository validation locally and do not configure or wait for hosted
  validation workflows.
- Orca Preparation and Printer Operations are peer subsystems.
- A prepared print job is the preparation aggregate; a print session is the
  execution aggregate.
- Observation, recommendation, authorization, action, and verification remain
  distinct stages.
- Consequential or uncertain actions default to explicit user authorization.
- OrcaSlicer is an adapter inside Preparation, not a later add-on around Printer
  Operations.
- MCP is only an inbound surface. Preserve the ontology and application ports
  so HTTP, CLI, or an extracted Elixir monitor daemon can reuse the same core.
- Preserve the hybrid monitoring model: full initial snapshot, ordered deltas,
  visible freshness, and full resynchronization after reconnect.
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
Treat MCP as a replaceable inbound surface and preserve the versioned monitor
contract so HTTP, CLI, and a possible Elixir daemon can reuse the same core.
For Orca Preparation, bind review to the exact backend, project and G-code
hashes. Treat any reslice or support change as a new review revision.
```
