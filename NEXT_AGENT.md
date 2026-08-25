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
- Product runtime: one repo-local read-only MCP Apps status-view prototype with
  desktop stdio and a personal OAuth-protected Tailscale Funnel endpoint;
  preparation, control, and persistent monitoring remain unimplemented
- Product evidence: planning and product-boundary records; local Orca and
  Snapmaker Orca discovery; one PETG and two PLA jobs through distinct
  preparation, handoff, observation, and telemetry-completion evidence; plus
  redacted Moonraker HTTP, WebSocket, and webcam observations

## Immediate task

Current execution order is the user-directed status-view host validation pass.
Continue with:

1. Read the [pilot log](docs/logs/2026-08-23-snapmaker-orca-u1-petg-print-pilot.md)
   as chronology, then the separate
   [provisional knowledge](docs/knowledge/snapmaker-orca-cli-preparation.md).
2. Read decisions 0007 and 0008, both 2026-08-25 journals, and the plugin under
   `plugins/u1-print-studio/`. The skills remain workflow guidance; only the
   read-only status view is a runtime prototype.
3. The direct private-LAN camera iframe failed in the desktop component. The
   plugin now uses decision 0009's same-origin server relay and a third
   read-only `get_u1_camera_frame` tool. A later mounted offline card was traced
   to a stale in-thread MCP process despite successful current LAN probes. The
   slow-camera budget is now 20 seconds plus one 10-second retry under a
   40-second MCP timeout. Twelve status tests with 54 assertions passed before
   the remote-auth slice, and an installed bundle returned reachable status plus
   a real relayed JPEG.
4. Treat iOS as a separate backend and host loop. Decision 0010 selects a
   personal OAuth-protected Tailscale Funnel endpoint for developer testing.
   The Mac Mini endpoint is live, rejects unauthenticated MCP requests, and the
   intended phone passkey is enrolled. Enable ChatGPT Developer mode, add the
   remote `/mcp` connection from the Plugins page, complete OAuth login, and
   confirm exactly `show_u1_status`, `get_u1_status`, and
   `get_u1_camera_frame`, all read-only with `u1.monitor`. Then check whether
   the private developer connection appears in Codex on iPhone. If it does,
   call `show_u1_status` in a new conversation and visually test the relayed
   snapshot, `Go Live`, `Close`, PiP, fullscreen, manual refresh, and one
   adaptive refresh. Never expose Moonraker or its camera directly.
5. Use Snapmaker Orca `2.3.5` for one synthetic two-object dry-slice repetition
   with explicit complete profiles. Record it as a new log. Do not upload or
   start it.
6. Run non-user negative fixtures for `wipe_tower_filament: "0"` and missing
   inherited filament fields. Determine whether exit `139` and tool-inventory
   collapse reproduce; do not encode one-run correlations as universal rules.
7. Repeat successful dry slices, explain any hash differences, and build a
   regression matrix. Use the thin skills on repeated requests and record where
   they reduce confusion or still require ad hoc work. Build a shared CLI only
   after that evidence proves it useful; broader MCP and control surfaces remain
   later.
8. Exercise support-enforcer and blocker round-trip only after the baseline
   fixtures pass. Preserve user-painted support projects but do not synthesize
   facet painting without golden round-trip fixtures.
9. Resume Printer Operations with a compatible `printer.objects.subscribe`
   client, reconnect and freshness behavior, U1 vendor semantics, always-on
   host, notification destination, and network/authentication boundary.

Use `docs/orca-preparation-findings.md` as the discovery boundary. Draft the
review-bundle and prepared-artifact manifest from observed output, then record
facts in `docs/environment.md` and evidence in the active iteration's
`VALIDATION.md`.

The candidate Orca executables, first printer status, camera snapshot, object
inventory, and WebSocket transport are recorded. One real slice, upload, start,
observed print, and completion also occurred under explicit user direction, but
not through product code. No support round-trip or reusable preparation runtime
has been accepted. Do not scaffold either product subsystem until repeated
fixtures establish stable preparation and handoff behavior.

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
- Preserve the current maturation order: journal, knowledge, thin skills, the
  explicitly authorized read-only status-view prototype, repeated host
  evidence, then a shared CLI only if useful.
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
Read the 2026-08-23 Snapmaker Orca pilot and 2026-08-25 PLA repetition journals
as chronological evidence and the knowledge document as provisional guidance.
Use the four thin u1-print-studio skills and visually validate the explicitly
authorized read-only status-view prototype. Then repeat synthetic dry-slice and
negative fixtures before writing reusable preparation code. Do not upload or
start future artifacts without fresh explicit authorization. Build a shared
CLI only if repeated use proves it useful.
Treat MCP as a replaceable inbound surface and preserve the versioned monitor
contract so HTTP, CLI, and a possible Elixir daemon can reuse the same core.
For Orca Preparation, bind review to the exact backend, project and G-code
hashes. Treat any reslice or support change as a new review revision.
```
