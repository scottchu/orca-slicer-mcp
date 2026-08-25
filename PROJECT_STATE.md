# Project state

Last updated: 2026-08-25

## Baseline

- Canonical repository: `scottchu/orca-slicer-mcp` (private).
- Branch point from `main`: `32762dd`.
- Product boundary: one product with two peer subsystems, Orca Preparation and
  Printer Operations, joined by an explicit prepared-job/session handoff.
- Runtime implementation: a repo-local, read-only U1 MCP Apps status-view
  prototype exists; preparation and printer-control runtimes do not.

## Active iteration

- Iteration: `docs/iterations/2026-08-23-f0-dual-subsystem-foundation/`
- Status: active dual-environment discovery with a user-directed thin-skill
  layer and read-only interactive monitoring prototype.
- Roadmap milestone: F0 — Dual-environment and contract discovery.
- Evidence-maturation order: chronological journal, reviewed knowledge, thin
  skills, then the explicitly requested read-only status-view prototype and
  repeated host use. A shared CLI remains later and requires demonstrated
  value.

## Capability state

### Orca Preparation

- Candidate environments observed: upstream OrcaSlicer `2.4.2` and Snapmaker
  Orca `2.3.5` on macOS. One later Snapmaker Orca U1 pilot succeeded, but the
  first supported product backend is not yet selected.
- CLI help, executable fingerprints, profile boundary, macOS diagnostics
  limitations, and manual-support 3MF representations are documented in
  `docs/orca-preparation-findings.md`.
- The pilot required resolved machine/process data, four complete filament-slot
  profiles, and post-slice `T2` verification after repeated exits including
  `139`; its [log](docs/logs/2026-08-23-snapmaker-orca-u1-petg-print-pilot.md)
  and [provisional knowledge](docs/knowledge/snapmaker-orca-cli-preparation.md)
  are durable.
- A repo-local `u1-print-studio` plugin describes preparation, authorized start,
  and adaptive monitoring as three thin skills. It now also contains a
  read-only MCP Apps monitor, but no slicer, preparation, upload, start, control,
  or persistent-monitor runtime. Model/project intake, profile resolution,
  slicing, inspection, artifact validation, review bundles, and manifest remain
  unimplemented as product code.

### Preparation-to-operations handoff

- Artifact/manifest contract: not defined or implemented.
- Target compatibility, upload ownership, and start ownership: undecided.
- Printer-job/session correlation: not implemented.

### Printer Operations

- Printer connection: a redacted LAN Fluidd/Moonraker target is reachable;
  Moonraker HTTP and WebSocket paths are observed, but no adapter is implemented.
- Interactive monitoring: a local MCP Apps prototype exposes read-only
  `show_u1_status` and `get_u1_status` tools, an HTML camera-first dashboard,
  adaptive refresh, PiP, and fullscreen. The render descriptor now advertises
  both standard and compatibility template metadata and has integration tests;
  host-rendered camera and interaction validation remains pending in a new
  conversation because the repair thread could not hot-reload the component.
- Persistent monitoring: not implemented. The accepted runtime model still
  combines a full direct snapshot with ordered subscription deltas and
  reconnect resync.
- Camera observation: later PLA monitoring acquired usable in-progress frames
  showing attached upright parts without visible spaghetti. The final lowered
  bed moved the parts out of frame, and no persistent capture exists.
- Notifications and human-directed control: not implemented.
- Agent recommendations or guarded corrections: not implemented.
- API exposure: Monitor, Control, and Admin are separate surfaces. Monitor is an
  explicit read-only allowlist; Admin and generic protocol or G-code passthrough
  are excluded from the first release.
- Application boundary: MCP is a replaceable inbound adapter. Domain ontology,
  policies, and monitor ports are surface- and runtime-independent.
- Runtime direction: the read-only status prototype uses Bun, TypeScript, MCP
  Apps, and a dependency-free widget. An extracted Elixir monitor daemon remains
  possible through a versioned, language-neutral contract; no persistent or
  control runtime has been scaffolded.

## Acceptance state

- Static/software: repository foundation and dual-subsystem product contract
  checks passed; real installed Orca executables were inspected, and one later
  user-authorized Snapmaker Orca slice succeeded after recorded failures. The
  read-only status-view prototype compiles and its HTTP and stdio MCP paths
  return current telemetry; no preparation or control runtime exists.
- Delivery validation is local-only; no hosted validation workflow is
  configured or required.
- Protocol/simulator: live Moonraker read-only response shapes, WebSocket
  upgrade, and server notifications were observed; printer-object subscription,
  fixtures, and reconnect tests are pending.
- Real printer: ready/standby telemetry, live camera frames, one PETG job and
  two later PLA jobs reached telemetry-verified completion. Upload, start
  acknowledgement, observed printing, and completion were kept distinct for
  the PLA repetitions. Product subscription, reconnect, and command-correlation
  behavior remain untested.
- User outcome: the PETG pieces were obtained once, and the first PLA result was
  physically accepted by the user. The second PLA job is telemetry-complete but
  still awaits physical handling. The long manual CLI path is not accepted as
  a repeatable product workflow.

## Open risks and unknowns

- The first product Orca backend remains unselected between the two observed
  editions. One Snapmaker Orca path worked, but synthetic-fixture
  repeatability, complete-profile schema, deterministic behavior, GUI parity,
  and support round-tripping are unverified.
- The pilot printer is a Snapmaker U1 with a Moonraker-compatible connection
  path; broader target acceptance is unverified.
- The observed exit `139` guard and incomplete-filament tool collapse have not
  yet been reproduced with clean negative fixtures.
- Prepared-artifact schema and upload/start ownership are unknown.
- Always-on host, camera placement and lighting, and network boundary are
  unknown.
- Direct camera loading, WebRTC, PiP, fullscreen, and adaptive refresh have not
  been exercised inside a connected Codex host. MCP resource success does not
  prove their rendered behavior.
- Notification destination is unknown.
- Live command capabilities and persistence semantics, including Z-offset, are
  unknown for the target hardware.
- Authentication, authorization, and remote-access boundaries are undecided.

## Next action

Open the refreshed repo-local `u1-print-studio` plugin in a new Codex thread,
call `show_u1_status` directly, and visually exercise the HTML dashboard,
snapshot, WebRTC `Go Live` and `Close`, PiP, fullscreen, manual refresh, and one
adaptive refresh. Record each host-loop result separately. Do not build a shared
CLI until repeated use demonstrates a stable command shape and a meaningful
reduction in effort.
