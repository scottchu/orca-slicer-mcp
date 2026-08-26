# Target environment

This file records observed facts for the first supported preparation and
operations environments. Do not commit credentials, local addresses, serial
numbers, access codes, camera recordings, user models, custom profiles, or
other identifying data.

## Current status

Two local Orca Preparation candidates are observed, and Snapmaker Orca `2.3.5`
was used for one user-authorized Snapmaker U1 print pilot. That pilot is
evidence for a candidate path, not selection of the first supported product
backend. The Printer Operations target is reachable on the user's private LAN;
the address is intentionally not recorded. Read-only Fluidd/Moonraker checks,
one PETG print, and two later PLA prints reached telemetry-verified completion.
A read-only local MCP Apps status-view prototype now returns current telemetry.
Remaining operating and product authorization boundaries are incomplete.

## Orca Preparation

- Editions and versions: upstream OrcaSlicer `2.4.2`; Snapmaker Orca `2.3.5`
- Invocation paths: standard macOS app-bundle executables recorded in
  `docs/orca-preparation-findings.md`; Snapmaker Orca was used for one pilot,
  but the first product backend is not selected
- Supported automation interface: both expose preparation CLI help; neither
  observed CLI exposes printer upload, start, or monitoring commands
- Accepted inputs advertised: STL and 3MF; two temporary STL inputs sliced in
  the pilot, while direct private multi-plate 3MF slicing crashed and synthetic
  fixture coverage remains pending
- Profile sources: bundled Snapmaker machine, process, and filament JSON plus
  embedded 3MF settings are observed; the pilot required complete resolved
  machine, process, and four-slot filament profiles
- Configuration precedence: command line, then loaded settings and filaments,
  then embedded 3MF; conflict reporting remains untested
- Outputs advertised: plate G-code plus 3MF, settings, slice-data, and STL
  exports; one real G-code artifact was validated and printed, while estimates,
  synthetic fixtures, and GUI parity remain untested
- Diagnostics: process exit and stdout or stderr are available; advertised
  progress pipe and `result.json` are Linux-only in the reviewed sources and
  cannot be assumed on macOS
- Preview boundary: matching-GUI review of the exact plate G-code is proposed;
  opening the editable 3MF and reslicing creates a new revision
- Manual support: enforcer and blocker volumes plus per-triangle annotations
  are represented in Orca 3MF; no round-trip fixture has run
- Temporary-file, overwrite, timeout, and resource-limit behavior: untested;
  isolated data and output directories are required for the first fixture
- Custom G-code: CLI post-processing scripts are unsupported; embedded or
  profile custom G-code remains untrusted and untested

## Printer

- Redacted label: first LAN target
- Vendor and model: Snapmaker U1 for the observed pilot
- Firmware and version: Moonraker `1.5.2`, API `1.4.0`; printer software reports
  `1.5.2.13_20260722102206`; exact vendor firmware identity remains unknown
- Connection path: private-LAN HTTP through Fluidd/nginx to Moonraker
- Available local or vendor APIs: Moonraker server, printer-object, webcam,
  authorization-info, and WebSocket notification paths observed read-only
- Active-print commands: unknown
- Live adjustment support and persistence: unknown
- Built-in safety and emergency behavior: unknown

## Camera

- Source and protocol: built-in camera through `webrtc-camerastreamer`
- Placement and field of view: unknown
- Lighting conditions: unknown
- Snapshot or stream access: snapshot returned JPEG `1920x1080`; WebRTC stream
  is advertised but was not exercised. A later bounded application relay
  returned two complete validated snapshot JPEGs over one multipart response;
  this does not establish WebRTC frame rate or mounted-host rendering. Later
  PLA snapshots were usable for in-progress diagnosis, while the lowered bed
  moved finished parts out of the final frame
- Advertised target frame rate: 15 FPS during the status-view prototype. The
  user reports installed hardware encoding capable of 30 FPS; that capability
  was not advertised or benchmarked in this run, and the view does not cap it
- Retention and privacy constraints: unknown

## Operations host

- Host type and operating system: personal macOS Mac Mini for the current
  developer deployment; broader supported hosts remain unknown
- Always-on expectation: the current self-hosted mobile path requires the Mac
  Mini LaunchAgent and Tailscale Funnel to remain available
- Printer network relationship: current validation client and printer are on a
  reachable private LAN; exact segmentation is unknown
- Validation-host networking: system `curl` reached the printer, while direct
  Bun and Node sockets failed. The prototype uses a bounded, no-shell curl
  adapter for fixed read-only routes; cause and portability remain unknown
- Service supervision and restart behavior: a user LaunchAgent runs the Bun
  HTTP service from the synchronized personal plugin source on loopback; a
  controlled restart preserved the owner-only OAuth state
- Local storage constraints: unknown

## User communication

- First notification destination: unknown
- Required urgency levels: unknown
- Delivery and retry expectations: unknown

## Access boundary

- Local-only versus remote access: Moonraker remains private LAN. A personal
  standard-HTTPS Tailscale Funnel exposes exact U1 service paths, including the
  ticketed `/media` prefix, while preserving an unrelated root service
- Authentication mechanism: personal OAuth protects MCP with one `u1.monitor`
  scope, short-lived access tokens, rotating refresh tokens, and an enrolled
  user-verified passkey. Camera media requires a short-lived one-time ticket
  minted by the authenticated Monitor tool. The trusted LAN Moonraker boundary
  is not treated as product authorization
- Authorized users or agents: one enrolled owner for the current personal
  developer deployment; broader identity architecture is undecided
- Audit and retention expectations: unknown

## Preparation-to-operations handoff

- Prepared artifact and manifest schema: unknown
- Target-printer compatibility check: unknown
- Upload ownership and transport: unknown
- Queue or selection semantics: unknown
- Print-start ownership and authorization: unknown
- Printer-job-to-session correlation: unknown

## Evidence log

Add only redacted, reproducible observations. Preparation entries name the
date, exact OrcaSlicer version, profile and fixture identities, method, command
result, input/output hashes, observed capability, and evidence path. Operations
entries name the date, method, firmware or endpoint context, observed
capability, and evidence path. Unknowns remain unknown until checked.

- **2026-08-23:** read-only HTTP queries observed Klippy connected and ready,
  standby job state, temperature telemetry, a configured built-in webcam, and a
  valid JPEG snapshot. The tested frame was extremely dark, so this proves
  image transport only, not usable visual diagnosis.
- **2026-08-23:** object inventory exposed four extruders and extensive standard
  and vendor-specific objects. WebSocket upgrade and server notifications were
  observed. See the active iteration's `CAPABILITY_MATRIX.md`; no printer
  command or G-code was executed.
- **2026-08-23:** local upstream OrcaSlicer `2.4.2` and Snapmaker Orca `2.3.5`
  executables were fingerprinted and their help, profile resources, macOS CLI
  behavior, and official source boundaries were inspected. No model was sliced
  and no artifact was sent to a printer during that initial discovery. See
  `docs/orca-preparation-findings.md`.
- **2026-08-23, later user-authorized pilot:** Snapmaker Orca `2.3.5` sliced two
  isolated objects for a Snapmaker U1 after repeated CLI and profile failures.
  The artifact was verified for logical tool `T2`, uploaded, started, observed
  printing, and observed complete at `22/22` layers. See the chronological
  [pilot log](logs/2026-08-23-snapmaker-orca-u1-petg-print-pilot.md) and its
  separate [provisional knowledge](knowledge/snapmaker-orca-cli-preparation.md).
- **2026-08-25, user-authorized PLA repetitions:** two U1 PLA jobs reached
  telemetry-verified completion with distinct slice, validation, upload, start
  acknowledgement, observed-printing, and completion evidence. The first was
  physically accepted by the user. The second used physical tool head 2, three
  wall loops, no support, and adaptive monitoring; its output awaits handling.
  See the redacted
  [chronological journal](logs/2026-08-25-snapmaker-u1-pla-print-repetitions.md).
- **2026-08-25, read-only status-view prototype:** a local MCP Apps server
  returned current U1 telemetry and advertised camera availability through HTTP
  and plugin stdio paths. Its widget includes snapshot, WebRTC `Go Live` and
  `Close`, PiP, fullscreen, and adaptive refresh, but no browser connection was
  available for host visual validation. See the
  [implementation journal](logs/2026-08-25-u1-status-view-prototype.md) and
  [derived knowledge](knowledge/u1-status-view.md).
- **2026-08-25, continuous read-only camera relay:** an application-owned
  one-time ticket and bounded lease drove two validated real-camera JPEGs over
  one exact multipart HTTP route. The public deployment added only the
  ticketed `/media` handler and preserved the existing root and OAuth/MCP
  routes. See the
  [chronological journal](logs/2026-08-25-u1-continuous-camera-relay.md).
