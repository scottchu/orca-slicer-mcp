# Project state

Last updated: 2026-08-25

## Baseline

- Canonical repository: `scottchu/orca-slicer-mcp` (private).
- Branch point from `main`: `317dfd1`.
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
- A repo-local `u1-print-studio` plugin describes mobile status setup,
  preparation, authorized start, and adaptive monitoring as four thin skills.
  It now also contains a
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
- Interactive monitoring: the local stdio MCP Apps prototype exposes three
  read-only status/snapshot tools, an HTML camera-first dashboard, adaptive
  refresh, PiP, fullscreen, and a 1200 by 1500 PNG on every
  `show_u1_status` result. The OAuth-protected HTTP surface conditionally adds a
  fourth read-only `open_u1_camera_stream` tool. Its one-time URL is
  widget-private; the widget makes one call per `Go Live` intent and retains
  non-overlapping snapshot polling as fallback. Decision 0014 keeps ticket,
  lease, concurrency, duration, and serial iteration in an application service,
  validated raw JPEG acquisition in the printer adapter, and exact multipart
  response handling in an HTTP adapter. The public service now has one exact
  `/media` Funnel handler in addition to the preserved root and OAuth/MCP paths.
  Personal OAuth, PKCE, renewable audience-bound tokens, and the enrolled
  user-verified passkey remain unchanged. Public 401/404 boundaries pass, and a
  bounded real-printer proof delivered two complete JPEGs over one multipart
  response. A fresh authenticated four-tool inventory and mounted desktop/iOS
  rendering remain separate host evidence.
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
- Application boundary: MCP is a replaceable inbound adapter. The camera relay
  is the first implemented transport-independent application service; status
  queries still call the observation adapter directly. Domain ontology,
  policies, and planned monitor ports remain surface- and runtime-independent.
- Runtime direction: the read-only status prototype uses Bun, TypeScript, MCP
  Apps, and a dependency-free widget. An extracted Elixir monitor daemon remains
  possible through a versioned, language-neutral contract; no persistent or
  control runtime has been scaffolded.

## Acceptance state

- Static/software: repository foundation and dual-subsystem product contract
  checks passed; real installed Orca executables were inspected, and one later
  user-authorized Snapmaker Orca slice succeeded after recorded failures. The
  read-only status-view prototype compiles. Twenty-nine tests with 144
  assertions cover OAuth renewal, status and PNG contracts, application-owned
  camera tickets and leases, exact multipart routing, URL privacy, serial frame
  reads, and snapshot fallback; no preparation or control runtime exists.
- Delivery validation is local-only; no hosted validation workflow is
  configured or required.
- Protocol/simulator: live Moonraker read-only response shapes, WebSocket
  upgrade, server notifications, and exact ticketed multipart behavior were
  observed; printer-object subscription, fixtures, and reconnect tests are
  pending.
- Real printer: ready/standby telemetry, live camera frames including two
  complete JPEGs in one bounded multipart relay, one PETG job and
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
- The personal always-on host and network boundary are observed, but camera
  placement, lighting, portability to other hosts, and production distribution
  remain unknown.
- Continuous relay loading, snapshot fallback, Close, PiP, fullscreen, and
  adaptive refresh have not been exercised on the newly deployed four-tool
  surface inside a fresh connected Codex host. Exact public routing and valid
  real JPEGs do not prove desktop or iOS rendering. Existing conversations do
  not hot-reload refreshed MCP tools.
- The local stdio plugin cannot itself provide a cross-device iOS backend. A
  personal developer backend now runs on the always-on Mac Mini behind
  standard-HTTPS Tailscale Funnel path handlers and personal OAuth. The current
  edition requires an always-on LAN agent per printer owner. A self-hosted
  distribution versus hosted MCP plus outbound LAN connector remains undecided;
  the backend now supports renewable authenticated connectivity, and the user
  confirmed the repaired connection works immediately. A standard MCP image
  fallback no longer depends on component mounting, but refreshed Codex-host
  access after more than 15 minutes and interactive camera rendering still
  require separate user-visible validation.
- Notification destination is unknown.
- Live command capabilities and persistence semantics, including Z-offset, are
  unknown for the target hardware.
- Monitor authentication and remote access are implemented for personal
  developer testing. Control authorization remains unimplemented; OAuth login
  alone must never authorize upload, start, cancel, or another printer action.

## Next action

Start a fresh authenticated host thread, confirm exactly the four remote
read-only tools, and test one `Go Live` intent. Record continuous relay,
snapshot fallback if exercised, Close, PiP, fullscreen, desktop mount, and iOS
mount separately. A status call after the access-token lifetime still needs to
prove real-host renewal. Do not expose Moonraker directly, add control tools, or
build a shared CLI until the relevant authorization and repeated-use evidence
exists.
