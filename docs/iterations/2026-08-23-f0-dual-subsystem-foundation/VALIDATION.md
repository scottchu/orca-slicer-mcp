# F0 dual-subsystem foundation validation

## Environment

- Working baseline: `ba18104`
- OrcaSlicer environment: not selected
- Printer: redacted private-LAN Fluidd/Moonraker device; exact model unknown
- Observed software: Moonraker `1.5.2`, API `1.4.0`, printer software
  `1.5.2.13_20260722102206`
- Validators: primary agent plus independent product and architecture agents

## Commands and results

- `bash -n scripts/check-repository.sh`: passed on 2026-08-23.
- `./scripts/check-repository.sh`: passed with `repository contract: ok` on
  2026-08-23, including the single-active-iteration guard.
- `git diff --check`: passed on 2026-08-23.
- Relative Markdown link check using `perl` extraction plus filesystem checks:
  passed on 2026-08-23.
- Terminology scan excluding superseded decision 0001 and the historical M0
  iteration found no authoritative single-subsystem or deferred-Orca framing.
- Independent product consistency review: passed after all findings were
  repaired.
- Independent architecture and safety review: passed after mandatory managed
  provenance and validation records were repaired.
- `curl --connect-timeout 3 --max-time 8
  "$PRINTER_BASE_URL/server/info"`: HTTP 200 on 2026-08-23; Klippy connected,
  state `ready`, with no failed Moonraker components or warnings.
- `curl --connect-timeout 3 --max-time 8
  "$PRINTER_BASE_URL/printer/info"`: HTTP 200; printer reported `ready`.
- `curl --connect-timeout 3 --max-time 8
  "$PRINTER_BASE_URL/printer/objects/query?webhooks&print_stats&display_status&virtual_sdcard&extruder&heater_bed"`:
  HTTP 200; standby state, zero progress, temperature telemetry, and inactive
  virtual SD card were observed.
- `curl --connect-timeout 3 --max-time 8
  "$PRINTER_BASE_URL/server/webcams/list"`: HTTP 200; one enabled built-in
  `webrtc-camerastreamer` camera advertised snapshot and WebRTC paths.
- `curl --connect-timeout 3 --max-time 10
  "$PRINTER_BASE_URL/webcam/snapshot.jpg"`: HTTP 200; valid `1920x1080` JPEG.
  The temporary image was extremely dark and was not added to the repository.
- `curl --connect-timeout 3 --max-time 8
  "$PRINTER_BASE_URL/access/info"`: HTTP 200; the current LAN client reported
  `trusted: true` and `login_required: false`.
- `curl --connect-timeout 3 --max-time 8
  "$PRINTER_BASE_URL/printer/objects/list"`: HTTP 200; loaded objects include
  four extruders, job/session fields, motion, calibration, material sensors,
  power-loss, defect-detection, and vendor-specific extensions.
- `curl --connect-timeout 3 --max-time 8
  "$PRINTER_BASE_URL/printer/gcode/help"`: HTTP 200; 217 command names were
  advertised, including pause, resume, cancel, G-code offset, and velocity
  limit. No command was executed.
- A manual HTTP Upgrade request to `/websocket` with the printer origin returned
  `101 Switching Protocols` and live JSON-RPC process-stat notifications.
  Object subscription was not sent through this diagnostic client.
- `bash -n scripts/check-repository.sh`: rerun after reconciling the discovery
  records onto `ba18104` and passed on 2026-08-23.
- `./scripts/check-repository.sh`: rerun with `repository contract: ok` after
  decisions 0004 through 0006, ontology, and monitoring records were added.
- `git diff --check`: rerun and passed after the same update.
- Relative Markdown link check using `perl` extraction plus filesystem checks:
  rerun and passed after the same update.
- Authoritative terminology scan found no `Printer Management`, deferred-Orca,
  or MCP-as-system framing in current Markdown records.
- `bash -n scripts/check-repository.sh`: passed after hosted validation removal.
- `./scripts/check-repository.sh`: passed locally with
  `repository contract: ok` after hosted validation removal.
- `git diff --check`: passed after hosted validation removal.
- Repository scan for the removed automation terms, triggers, and job name:
  returned no matches.

## Requirement evidence

- `OBS-001`: partially supported for ready/standby state and temperature fields
  through one live query; progress during a real print is untested.
- `OBS-002`: not yet supported by product code; the source returned event time,
  but no durable observation or stale-state implementation exists.
- `OBS-003`: not tested; disconnect and reconnect behavior remain unknown.
- `CAM-001`: transport partially supported by one live snapshot; session
  association and timestamp persistence are not implemented.
- `AUTH-001`: not supported by Moonraker trust alone. The current client is a
  trusted LAN client, so application-level caller authorization is still
  required before any control slice.
- `API-001` through `API-004`, `ARCH-001` through `ARCH-003`, `ONTO-001` through
  `ONTO-002`, `OBS-004` through `OBS-006`, and `CAM-003` are accepted as static
  contracts. No runtime exists to prove enforcement or behavior.
- Orca Preparation, handoff, notification, control, and user-outcome
  requirements remain unvalidated.

## Acceptance state

- Static/software: dual-subsystem, ontology, surface, and monitoring contracts
  are documented; no runtime behavior was tested.
- Protocol/simulator: live Moonraker HTTP response shapes, WebSocket upgrade,
  and server notifications were observed; no fixture, simulator, object
  subscription, or reconnect test exists.
- Real printer: ready/standby telemetry and image transport were observed on one
  device; no active print, command, reconnect, or physical outcome was tested.
- User outcome: not evaluated.

## Failures, repairs, and reruns

- The first architecture review found authorization, provenance, dependency,
  custom G-code, and evidence-taxonomy gaps. They were repaired and re-reviewed.
- The first consistency review found two active iterations, combined
  upload/start language, privacy omissions, and stale framing. They were
  repaired and re-reviewed.
- Node's built-in WebSocket client emitted a generic handshake error when it did
  not send the Fluidd origin. A manual Upgrade request with the target origin
  succeeded. This isolates the failure to client handshake compatibility, but a
  full subscription client test is still required.
