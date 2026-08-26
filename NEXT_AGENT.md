# Next agent

Start with these repository records:

1. `PROJECT_STATE.md`
2. `docs/vision.md`, `docs/scope.md`, and `docs/roadmap.md`
3. `docs/requirements.md` and `docs/environment.md`
4. `docs/decisions/README.md` and its accepted decisions
5. `docs/iterations/CURRENT` and every file in that iteration

Do not use prior chat history as authority when it conflicts with these files.

## Exact baseline

- Branch point from `main`: `317dfd1`
- Active iteration: `2026-08-23-f0-dual-subsystem-foundation`
- Product runtime: one repo-local read-only MCP Apps status-view prototype with
  desktop stdio and a personal OAuth-protected standard-HTTPS Tailscale Funnel
  endpoint. The remote surface has a bounded WebRTC camera presentation whose
  application policy is separate from MCP and exact-route HTTP; preparation,
  control, and persistent monitoring remain unimplemented. An opt-in status
  dashboard on loopback port 8788 mounts the exact widget and emulates only its
  read-only bridge; private Tailscale Serve HTTPS exposes it on port 8444
- Product evidence: planning and product-boundary records; local Orca and
  Snapmaker Orca discovery; one PETG and two PLA jobs through distinct
  preparation, handoff, observation, and telemetry-completion evidence; plus
  redacted Moonraker HTTP, WebSocket, and webcam observations

## Immediate task

Current execution order is the user-directed continuous-camera host validation
pass. Continue with:

1. Read decisions 0014 and 0015, then inspect the plugin. Decision 0015
   supersedes the old serial-JPEG live transport. The application service owns
   tickets, leases, concurrency, and duration; MCP only grants a private URL;
   exact-route HTTP forwards an allowlisted offer/answer/ICE exchange; and the
   widget receives H264 through a browser `RTCPeerConnection`. Snapshots remain
   only the explicit snapshot and degraded fallback path.
2. The deployed personal plugin is
   `0.2.0+codex.20260826005742`. Its exact `/media` Funnel handler preserves the
   unrelated root and existing OAuth/MCP routes. Missing tickets return 401,
   unknown media paths return 404, OAuth state survived restart unchanged, and
   a real-printer proof negotiated an H264 offer and decoded frames over a
   persistent peer connection. Do not expose Moonraker or its camera directly.
   For rapid UI work, run `bun run dashboard` for loopback. For a phone on the
   same tailnet, preserve the private Serve listener on port 8444 and run
   `bun run dashboard:tailscale`, then open the printed `/dashboard` URL. Never
   Funnel-enable port 8444, and do not count the harness as real ChatGPT-host
   rendering evidence. The branch widget now has icon-only live/close/refresh
   controls, a persistent camera grid, and independent component skeletons. Its
   top-left camera icon is visually neutral across states. The bottom camera
   row puts the timestamped `Snapshot`, `Snapshot fallback`, or measured-FPS
   `Live` status on the left and its live/close action on the right. Snapshot
   and fallback show a red disconnected-camera icon; live shows a pulsing green
   dot. The current identity palette is official Snapmaker charcoal, warm white,
   yellow, and orange; semantic green and red remain reserved for positive and
   negative connection/state feedback. Keep those behaviors when iterating.
   `design-qa.md` remains blocked until a
   browser-rendered screenshot can be compared with the supplied reference.
3. Start a fresh authenticated desktop or mobile thread because the prior
   conversation cannot hot-reload tools. Confirm exactly four remote read-only
   tools: `show_u1_status`, `get_u1_status`, `get_u1_camera_frame`, and
   `open_u1_camera_stream`. Stop if any control tool is present.
4. If the component mounts, test one `Go Live` intent and record WebRTC
   rendering, snapshot fallback if exercised, Close, PiP, and fullscreen as
   separate host evidence. Record desktop and iOS outcomes separately. If only
   the PNG appears, that is a valid non-component result but not camera evidence.
5. Make another read-only status call after the access-token lifetime to close
   the real-host refresh-token gate. Do not infer renewal from local tests or
   immediate access.
6. Then use Snapmaker Orca `2.3.5` for one synthetic two-object dry-slice
   repetition with explicit complete profiles. Record it as a new log. Do not
   upload or start it.
7. Run non-user negative fixtures for `wipe_tower_filament: "0"` and missing
   inherited filament fields. Determine whether exit `139` and tool-inventory
   collapse reproduce; do not encode one-run correlations as universal rules.
8. Repeat successful dry slices, explain hash differences, and build a
   regression matrix. Exercise support-enforcer and blocker round-trip only
   after baseline fixtures pass; preserve user-painted support projects.
9. Resume Printer Operations with `printer.objects.subscribe`, reconnect and
   freshness behavior, U1 vendor semantics, notification destination, and the
   remaining persistent-monitor boundary.
10. Keep the production distribution model open. The current self-hosted
    edition needs one always-on LAN agent per printer owner; a hosted MCP plus
    outbound LAN connector remains a separate decision.

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
