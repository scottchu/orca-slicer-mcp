# Moonraker capability matrix for the first Printer Operations target

- Observed: 2026-08-23
- Target: redacted private-LAN Fluidd/Moonraker device
- Scope: read-only discovery; no printer command or G-code was issued
- Moonraker: `1.5.2`, API `1.4.0`

## Evidence labels

- **Observed:** a read-only request succeeded against the target.
- **Advertised:** the target listed the component, object, command, or URL, but
  its runtime semantics were not exercised.
- **Documented:** present in official Moonraker documentation but not yet
  verified against this target.

## Transport and access

| Capability | Target evidence | State | Product use |
| --- | --- | --- | --- |
| HTTP server and printer info | `GET /server/info`, `GET /printer/info` returned HTTP 200 | Observed | Bootstrap connection and Klippy readiness |
| Printer object inventory | `GET /printer/objects/list` returned the loaded object names | Observed | Build capability inventory after Klippy is ready |
| Printer object snapshot | `GET /printer/objects/query?...` returned job, progress, and temperatures | Observed | Initial state and low-rate fallback polling |
| WebSocket transport | `/websocket` completed HTTP 101 and emitted JSON-RPC process-stat notifications | Observed | Persistent state and lifecycle notifications |
| Printer object subscription | `printer.objects.subscribe` over WebSocket | Documented | Preferred live status path; target response still needs a compatible client test |
| Camera inventory | `GET /server/webcams/list` returned one enabled built-in camera | Observed | Discover camera metadata and relative URLs |
| Camera snapshot | Advertised snapshot URL returned a valid `1920x1080` JPEG | Observed | On-demand session evidence; tested frame was too dark for diagnosis |
| Camera stream | WebRTC URL advertised by `webrtc-camerastreamer` | Advertised | Optional live UI; not required for the first snapshot slice |
| Current client trust | `GET /access/info` returned `login_required: false`, `trusted: true` | Observed | Discovery only; must not become the product authorization model |

## Observed printer-object groups

The target reports standard Klipper objects plus vendor-specific extensions.
This grouping is an adapter discovery aid, not a normalized schema commitment.

| Domain | Representative loaded objects | Evidence boundary |
| --- | --- | --- |
| Lifecycle and job | `webhooks`, `print_stats`, `display_status`, `virtual_sdcard`, `pause_resume` | Object presence observed; standby fields queried |
| Thermal and air | `extruder` through `extruder3`, `heater_bed`, cavity temperature, multiple fans, purifier | Four extruders and sensors advertised; only active extruder and bed temperatures queried |
| Motion and calibration | `toolhead`, `gcode_move`, `motion_report`, `bed_mesh`, `probe`, `manual_probe`, TMC driver objects | Advertised only |
| Material handling | motion and entanglement sensors for four extruders, left and right filament-feed objects | Advertised only |
| Recovery and diagnosis | `exception_manager`, `power_loss_check`, `defect_detection`, `machine_state_manager`, `system_stats` | Advertised only |
| Supporting services | `mqtt`, `timelapse`, camera service, Moonraker history and job queue components | Advertised by printer or server info |

## Command inventory: not authorized or validated

`GET /printer/gcode/help` returned 217 command names. Among them were `PAUSE`,
`RESUME`, `CANCEL_PRINT`, `SET_GCODE_OFFSET`, and `SET_VELOCITY_LIMIT`. Official
Moonraker HTTP endpoints also document start, pause, resume, cancel, emergency
stop, host restart, and firmware restart.

This evidence proves discoverability only. It does not establish:

- which session states permit each command;
- vendor-specific macro behavior or side effects;
- acknowledgement versus observed physical effect;
- safe limits, units, or persistence for Z-offset and tuning;
- reconnect, timeout, duplicate-request, or partial-failure behavior.

No control endpoint or G-code command was called during discovery.

## Accepted product exposure

Decision [0004](../../decisions/0004-separate-monitor-control-and-admin-api-surfaces.md)
classifies operations by consequence:

| Product surface | Initial contents | Policy |
| --- | --- | --- |
| Monitor | Status, capabilities, object subscription, camera snapshot, health, selected history reads | Explicit read-only allowlist |
| Control | Later explicit pause, resume, and cancel tools | Separate authorization, state checks, correlation, and verification |
| Admin | Host, service, update, credential, power, and broad configuration operations | Absent from first release |

Generic HTTP, JSON-RPC, and G-code passthrough are prohibited MCP tools. File,
queue, database, camera-configuration, and account mutations remain writes even
when they have no immediate physical effect.

## First adapter boundary suggested by evidence

1. Use HTTP to discover server state, authorization context, loaded objects,
   camera metadata, and the initial printer snapshot.
2. Use a persistent WebSocket JSON-RPC connection for object subscriptions and
   Klippy disconnect or lifecycle notifications.
3. Treat a camera snapshot as a separate timestamped observation associated
   with a print session; do not infer diagnosis from transport success.
4. Keep commands behind a capability, state, authorization, correlation, and
   post-command observation boundary.
5. Represent connection loss as unknown or offline, then repeat the documented
   server-info readiness sequence before resubscribing.

## Security finding

The current LAN client is trusted and can read Moonraker without credentials.
Official Moonraker behavior gives trusted clients broad access, while untrusted
HTTP clients require JWT or an API key. The product must authenticate its own
control callers and must not expose this trusted LAN surface to the public
internet. A later discovery step should inspect the intended network boundary
without recording addresses, keys, or credentials.

## Remaining tests

- capture a successful `printer.objects.subscribe` response with an explicit
  compatible WebSocket client and verify diff notifications;
- capture a future print through a product-compatible subscription client from
  initial snapshot through final state; one pilot's layer progress and
  completion were observed manually but not through the proposed runtime;
- test safe disconnect and reconnect handling without stopping a print;
- determine the Snapmaker U1 vendor-specific object semantics;
- define and test authorization separately from Moonraker trusted-client status;
- test control and live adjustment only under an approved hardware matrix.

## Official references

- Moonraker External API introduction:
  <https://moonraker.readthedocs.io/en/latest/external_api/introduction/>
- Printer administration and printer objects:
  <https://moonraker.readthedocs.io/en/latest/external_api/printer/>
- Authorization and authentication:
  <https://moonraker.readthedocs.io/en/latest/external_api/authorization/>
- Webcam management:
  <https://moonraker.readthedocs.io/en/latest/external_api/webcams/>
- JSON-RPC notifications:
  <https://moonraker.readthedocs.io/en/latest/external_api/jsonrpc_notifications/>
