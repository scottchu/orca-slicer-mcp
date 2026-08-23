# Target environment

This file records observed facts for the first supported preparation and
operations environments. Do not commit credentials, local addresses, serial
numbers, access codes, camera recordings, user models, custom profiles, or
other identifying data.

## Current status

Two local Orca Preparation candidates are observed, but the first supported
backend is not selected. A first Printer Operations target is reachable on the
user's private LAN. The address is intentionally not recorded. Read-only
Fluidd/Moonraker and camera checks succeeded on 2026-08-23; the exact printer
model and remaining operating environment are incomplete.

## Orca Preparation

- Editions and versions: upstream OrcaSlicer `2.4.2`; Snapmaker Orca `2.3.5`
- Invocation paths: standard macOS app-bundle executables recorded in
  `docs/orca-preparation-findings.md`; first backend not selected
- Supported automation interface: both expose preparation CLI help; neither
  observed CLI exposes printer upload, start, or monitoring commands
- Accepted inputs advertised: STL and 3MF; real fixture loading remains untested
- Profile sources: bundled Snapmaker machine, process, and filament JSON plus
  embedded 3MF settings are observed; complete inheritance resolution remains
  untested
- Configuration precedence: command line, then loaded settings and filaments,
  then embedded 3MF; conflict reporting remains untested
- Outputs advertised: plate G-code plus 3MF, settings, slice-data, and STL
  exports; real output, estimates, and GUI parity remain untested
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
- Vendor and model: unknown
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
  is advertised but was not exercised
- Retention and privacy constraints: unknown

## Operations host

- Host type and operating system: unknown
- Always-on expectation: unknown
- Printer network relationship: current validation client and printer are on a
  reachable private LAN; exact segmentation is unknown
- Service supervision and restart behavior: unknown
- Local storage constraints: unknown

## User communication

- First notification destination: unknown
- Required urgency levels: unknown
- Delivery and retry expectations: unknown

## Access boundary

- Local-only versus remote access: unknown
- Authentication mechanism: tested read-only endpoints returned successfully
  without credentials; `/access/info` reports the current LAN client as trusted
  with login not required. Control authorization and trust rules are untested
- Authorized users or agents: unknown
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
  and no artifact was sent to a printer. See
  `docs/orca-preparation-findings.md`.
