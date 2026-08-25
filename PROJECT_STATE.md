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
- Interactive monitoring: a local MCP Apps prototype exposes read-only
  `show_u1_status`, `get_u1_status`, and `get_u1_camera_frame` tools, an HTML
  camera-first dashboard, adaptive refresh, PiP, and fullscreen. After the
  direct private-LAN camera iframe failed in the desktop host, status widget v2
  now relays validated JPEG frames through the read-only MCP boundary and has a
  responsive iOS-safe layout. The descriptor and widget contracts have
  integration tests. A later offline card was traced to a stale in-thread MCP
  process despite current LAN reachability; the slow-camera budget was repaired
  and the exact refreshed installed bundle passed telemetry and JPEG relay
  smoke. Standard HTTPS Funnel handlers now expose the same three read-only
  tools and OAuth paths without replacing an existing root service. Personal
  OAuth, PKCE, audience-bound tokens, and an enrolled user-verified phone
  passkey protect the endpoint. Public reachability and authentication rejection
  pass; a nonstandard-port ChatGPT fetch failed, while the repaired
  standard-port connection completed personal OAuth and exposed exactly the
  three read-only tools. An authenticated `show_u1_status` call returned fresh
  completion telemetry. Decision 0012 now adds a dependency-free inline PNG
  status projection to the remote render result while preserving the existing
  local desktop widget path. The PNG was generated and visually inspected from
  a fresh real-printer observation; display inside Codex mobile remains pending
  user-visible host evidence.
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
- Relayed camera loading, PiP, fullscreen, and adaptive refresh have not
  been exercised successfully inside a connected Codex host. The direct WebRTC
  iframe is no longer the portable baseline; a server-relayed near-live preview
  now passes MCP and real-camera tests under a bounded slow-source budget, but
  source responsiveness and valid JPEG payloads do not prove desktop or iOS
  rendering. Existing conversations do not hot-reload refreshed MCP tools.
- The local stdio plugin cannot itself provide a cross-device iOS backend. A
  personal developer backend now runs on the always-on Mac Mini behind
  standard-HTTPS Tailscale Funnel path handlers and personal OAuth. The current
  edition requires an always-on LAN agent per printer owner. A self-hosted
  distribution versus hosted MCP plus outbound LAN connector remains undecided;
  authenticated mobile tool connectivity now works. A standard MCP image
  fallback no longer depends on component mounting, but actual Codex-mobile
  image display and interactive camera rendering still require separate
  user-visible validation.
- Notification destination is unknown.
- Live command capabilities and persistence semantics, including Z-offset, are
  unknown for the target hardware.
- Monitor authentication and remote access are implemented for personal
  developer testing. Control authorization remains unimplemented; OAuth login
  alone must never authorize upload, start, cancel, or another printer action.

## Next action

Start a new Codex mobile conversation and visually verify that
`show_u1_status` displays the inline PNG status card. Record that result
separately from the already-passing authenticated telemetry and local PNG
inspection. If a host mounts the interactive component, validate its camera and
controls as a separate capability; the PNG itself is intentionally static. Do
not expose Moonraker directly, add control tools, or build a shared CLI until
the relevant authorization and repeated-use evidence exists.
