# Target environment

This file records observed facts for the first supported preparation and
operations environments. Do not commit credentials, local addresses, serial
numbers, access codes, camera recordings, user models, custom profiles, or
other identifying data.

## Current status

The first OrcaSlicer environment remains unknown. A first Printer Operations
target is reachable on the user's private LAN. The address is intentionally not
recorded. Read-only Fluidd/Moonraker and camera checks succeeded on 2026-08-23;
the exact printer model and remaining operating environment are incomplete.

## Orca Preparation

- OrcaSlicer edition and version: unknown
- Executable or invocation path: unknown
- Supported headless or automation interface: unknown
- Accepted input formats and project behavior: unknown
- Printer, filament, and process profile sources: unknown
- Configuration precedence and embedded project conflicts: unknown
- Output formats, diagnostics, estimates, and preview access: unknown
- Temporary-file, overwrite, and resource-limit behavior: unknown
- Custom G-code handling and trust boundary: unknown

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
