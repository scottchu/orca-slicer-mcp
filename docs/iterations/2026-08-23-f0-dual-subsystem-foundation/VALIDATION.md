# F0 dual-subsystem foundation validation

## Environment

- Working baseline: `32762dd`
- OrcaSlicer environment: upstream OrcaSlicer `2.4.2` and Snapmaker Orca
  `2.3.5` observed as local candidates; Snapmaker Orca was used for one pilot,
  but the first product backend is not selected
- Printer: redacted private-LAN Snapmaker U1 with Fluidd/Moonraker
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
- Plist inspection plus each executable's `--help`: upstream bundle and banner
  reported `2.4.2`; Snapmaker bundle reported `2.3.5` and its CLI banner
  reported `01.10.01.50`. Both help commands returned `0`.
- Each executable's `--version`: both reported an invalid option and returned
  `254`, confirming that discovery must not require a conventional version
  flag.
- `shasum -a 256` on both executables: recorded the fingerprints in
  `docs/orca-preparation-findings.md`; `file` reported universal `arm64` and
  `x86_64` Mach-O executables.
- `jq` inspection of each bundled `profiles/Snapmaker.json`: both reported 19
  model variants; upstream profile bundle version `02.04.00.07`, Snapmaker Orca
  profile bundle version `02.02.50.02`.
- `python3 .../gcode_tool.py discover`: found upstream OrcaSlicer at the
  standard app-bundle path and did not discover Snapmaker Orca. This checks the
  external helper only; it is not product runtime evidence.
- Official v2.4.2 and v2.3.5 CLI source review confirmed macOS cannot rely on
  the Linux-only progress pipe or `result.json`; source review also identified
  support-enforcer and blocker volume types plus facet annotation serialization.
- No input model was loaded, no slice was run, no generated artifact was
  retained, and no printer request was issued during the initial Orca
  discovery. A later user-authorized pilot is recorded below.
- `bash -n scripts/check-repository.sh`: passed after recording Orca findings,
  collaborative preview, support representations, and the execution-order
  redirect.
- `./scripts/check-repository.sh`: passed locally with
  `repository contract: ok` after the same update.
- `git diff --check`: passed after the same update.
- Relative Markdown link extraction plus filesystem checks: passed after the
  new Orca Preparation discovery record was linked into the documentation map.
- Current-authority scan found no remaining print-session-as-product-center,
  Printer-Operations-first, or Orca-environment-unknown regression.

### Later user-authorized Snapmaker Orca pilot

This evidence occurred after the initial non-mutating discovery. Private input
files, resolved profiles, generated G-code, temporary paths, printer
identifiers, and runtime data are intentionally not retained.

- Direct private multi-plate 3MF attempts returned exits `232` and `253`; the
  correctly formed `--allow-newer-file --slice 2` attempt crashed with exit
  `139`.
- Reduced-input probes returned exits `205`, `239`, `254`, `232`, and `139`
  under different missing, incomplete, or invalid profile/export conditions.
- A resolved process retaining `wipe_tower_filament: "0"` crashed with exit
  `139`; removing or correcting it allowed this observed CLI path to proceed.
  Reproduction with a non-user negative fixture is still pending.
- Filament-slot profiles missing `filament_diameter` and
  `filament_is_support` collapsed the resolved physical-extruder count to one
  and selected `T0` despite explicit filament IDs.
- Adding complete required fields to all four filament slots restored four
  physical extruders and logical tool `T2` for physical extruder 3.
- The successful Snapmaker Orca invocation used two isolated STL objects,
  complete resolved machine/process settings, four complete filament profiles,
  explicit filament IDs `3,3`, and an isolated output directory. It returned
  exit `0`.
- Static inspection confirmed `T2` and the accepted core process and
  temperature settings before printer actions.
- Generated G-code SHA-256:
  `057f7e06d7d3da28329fe4588d1039c925c4bba74d23783573204448622d2d36`.
- With explicit user authorization, upload, start acknowledgement, observed
  printing, and completion were reached as distinct states. The printer
  reported `22/22` layers, `827.288` seconds, and no printer errors.
- The user later handled and assembled the physical parts. This proves a
  physical output for the pilot, while separate fit and mechanism failures
  prevent any CAD or mechanism acceptance claim.
- One zsh diagnostic wrapper assigned to the read-only `status` parameter and
  returned exit `1` even though its child slicer had completed. Future wrappers
  must capture and report wrapper and child exits separately.
- Full chronology: [pilot log](../../logs/2026-08-23-snapmaker-orca-u1-petg-print-pilot.md).
- Derived, still-provisional guidance:
  [Snapmaker Orca CLI preparation knowledge](../../knowledge/snapmaker-orca-cli-preparation.md).
- A later user-authorized PLA job provided a second real-printer handoff
  observation. The validated artifact was uploaded through direct LAN
  Moonraker only after its backend port was observed reachable; the upload
  response reported the complete artifact size, the start acknowledgement was
  recorded separately, and a fresh object query then reported `printing` with
  logical `T3`, corresponding to physical tool head 4, active. This remains
  manual operational evidence, not reusable product code or proof of print
  completion.
- During that later handoff, the reverse-proxy route and a temporarily
  unreachable direct backend produced misleading upload failures. Future
  operational clients must distinguish route reachability, bytes fully
  accepted, start acknowledgement, and observed printer state instead of
  treating one failed route as a preparation failure.
- `./scripts/check-repository.sh`: passed with `repository contract: ok` after
  adding the separate log, knowledge, current-state, validation, and handoff
  records.
- `git diff --check`: passed after the same update.
- Current-authority scan found only explicitly historical initial-discovery
  statements, not a current claim that no real slice or print occurred.
- Privacy scan of the new log and knowledge records found no absolute user or
  temporary paths and no private-LAN address literals.

## Requirement evidence

- `OBS-001`: partially supported for ready/standby state and temperature fields
  through one live query; progress during a real print is untested.
- `OBS-002`: not yet supported by product code; the source returned event time,
  but no durable observation or stale-state implementation exists.
- `OBS-003`: not tested; disconnect and reconnect behavior remain unknown.
- `CAM-001`: transport is supported by prior snapshots and the current camera
  advertisement. Host-rendered live view, session association, and timestamp
  persistence are not validated.
- `AUTH-001`: not supported by Moonraker trust alone. The current client is a
  trusted LAN client, so application-level caller authorization is still
  required before any control slice.
- `API-001` through `API-004`, `ARCH-001` through `ARCH-003`, `ONTO-001` through
  `ONTO-002`, `OBS-004` through `OBS-006`, and `CAM-003` are accepted as static
  contracts. The narrow read-only status prototype does not prove their full
  enforcement or behavior.
- The later pilot partially supports `ORCA-001`, `ORCA-002`, `ORCA-005`,
  `ORCA-006`, and the state separation in `HANDOFF-002`. It does not prove a
  product implementation because no manifest, product adapter, review bundle,
  authorization runtime, or session correlation exists.
- Notification and control runtime requirements remain unvalidated. The user
  outcome of obtaining two printed pieces was observed once; a repeatable
  preparation product outcome remains unvalidated.
- `PREP-004` through `PREP-006` and `ORCA-006` are accepted as static working
  requirements. Local discovery partially supports the feasibility of multiple
  explicit backends and Orca support representations, but no review bundle,
  support round-trip, or user acceptance record exists.

## Acceptance state

- Static/software: dual-subsystem, ontology, surface, monitoring, collaborative
  preparation review, and manual-support contracts are documented. Real
  installed CLI help and source boundaries were inspected. One later real
  Snapmaker Orca slice succeeded after multiple recorded crash and profile
  failures. A read-only MCP Apps monitor prototype exists; no preparation,
  control, or persistent-monitor runtime exists.
- Protocol/simulator: live Moonraker HTTP response shapes, WebSocket upgrade,
  and server notifications were observed; no fixture, simulator, object
  subscription, or reconnect test exists.
- Real printer: ready/standby telemetry, image transport, and three
  user-authorized U1 jobs through reported completion were observed. Product
  subscription, reconnect, command correlation, and safety behavior remain
  untested.
- User outcome: the PETG pieces were obtained once, and the first later PLA
  output was physically accepted. The second PLA job is telemetry-complete but
  awaits handling. The slow manual CLI debugging means the workflow itself is
  not accepted.

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
- A later Moonraker branch changed the root guidance back to a print-session
  central framing. The current update restores the accepted peer-subsystem
  contract without removing the useful monitoring records.
- The later Snapmaker Orca pilot repeatedly crashed or rejected incomplete
  configurations before a complete resolved-profile path succeeded. Its
  chronology and provisional guards are now preserved separately so the next
  agent must reproduce them before implementing automation.

## 2026-08-25 user-directed skill-first prototype

- Two PLA repetitions are recorded in a redacted chronological journal. Both
  reached `complete` with inactive virtual storage, full file progress, no
  exception, parked tools, and heater targets at zero. The first was physically
  accepted by the user; the second awaits handling.
- The second repetition separately verified physical tool head 2 as logical
  `T1`, three wall loops at global and object scope, support off, four objects,
  `188` layers, `220 C` nozzle, and `55 C` bed. A first prepared artifact with
  zero bed heat was uploaded for metadata inspection but was never started; the
  corrected artifact was separately validated and authorized.
- Direct multi-plate project slicing retained incompatible coordinates after
  profile resolution. Isolating the exact selected mesh, preserving four
  instances, and arranging them for the U1 produced a valid artifact.
- Monitoring used a fresh full telemetry and camera observation at each
  iteration, then chose the next check from state, recent progress, and
  estimated remaining time. `188/188` was not accepted as completion while the
  printer still reported `printing`.
- Decision 0007 records the user's revised maturation order. At that stage, the
  repo-local `u1-print-studio` plugin contained three thin skills and one visual
  status-card template but no runtime; the later status-view section records the
  explicitly authorized change.
- `uv run --no-project --with pyyaml python .../quick_validate.py <skill>`:
  passed for all three skills with `Skill is valid!`.
- `uv run --no-project --with pyyaml python .../validate_plugin.py
  plugins/u1-print-studio`: passed.
- `./scripts/check-repository.sh`: passed with `repository contract: ok`.
- `git diff --check`: passed.
- Relative Markdown link validation with a read-only Ruby scan: passed.
- Privacy and placeholder scans found no retained printer address, private
  model name, absolute user or temporary path, or unfinished plugin marker.

## 2026-08-25 read-only status-view prototype

- `bun install`: installed the MCP Apps, MCP SDK, TypeScript, and Node type
  dependencies and wrote the tracked Bun lockfile.
- `bun run check`: passed TypeScript compilation with no emit.
- HTTP `initialize` returned server `u1-print-studio` version `0.2.0`; HTTP
  `tools/list` returned only `show_u1_status` and `get_u1_status`, both marked
  read-only, non-destructive, closed-world, and idempotent.
- HTTP `tools/call` for `get_u1_status` returned a fresh real-printer
  observation with `complete`, `100%`, `188/188`, physical tool 2, camera
  availability, and no control action.
- HTTP `resources/read` returned `ui://u1-print-studio/status-v1.html` as
  `text/html;profile=mcp-app`, with the widget description and one runtime-only
  printer origin in each connect, resource, and frame CSP list.
- An MCP SDK stdio client launched the exact command represented by the plugin
  `.mcp.json`, listed both tools, and called `get_u1_status`. It returned the
  current complete state and camera availability.
- Direct Bun and Node local-network probes failed on the validation host while
  system `curl` succeeded. The implementation now calls `curl` without a shell,
  with a fixed base, fixed read-only routes, and bounded timeouts.
- Concurrent telemetry and webcam-list requests could contend. Serializing the
  telemetry read before webcam discovery repaired the stdio observation.
- Official Apps SDK reference material confirmed `requestDisplayMode` support
  for inline, Picture in Picture, and fullscreen. The widget feature-detects the
  host API and retains the MCP Apps bridge path.
- Browser visual QA was attempted, but this Codex session reported no available
  browser connection. Host rendering, camera load, live connection and close,
  PiP, fullscreen, and mounted adaptive refresh remain unverified.

### Same-day host-loop metadata repair

- `bun test src/*.test.ts`: passed `4` tests and `25` assertions covering the
  render-tool descriptor, read-only annotations, MCP App resource and CSP,
  result metadata separation, and camera-first widget control paths.
- `bun run check`: passed TypeScript compilation with the Bun test types.
- `bun run bundle`: rebuilt the self-contained stdio deployment artifact.
- `uv run --with pyyaml python .../validate_plugin.py
  plugins/u1-print-studio`: passed.
- `./scripts/check-repository.sh`: passed with `repository contract: ok`; the
  required local check now runs the U1 app TypeScript and Bun test suites.
- `git diff --check`: passed.
- The refreshed installed stdio bundle's `tools/list` advertised
  `_meta.ui.resourceUri` and the descriptor-level compatibility
  `openai/outputTemplate` on `show_u1_status`, while `get_u1_status` remained
  data-only.
- The same installed-bundle smoke test read the resource as
  `text/html;profile=mcp-app`, returned current `complete` and `100%` telemetry,
  and reported both camera routes without issuing a printer command.
- Separate bounded read-only camera requests returned HTTP 200 for a valid
  `1920x1080` JPEG snapshot and HTTP 200 for the advertised stream page.
- The existing conversation exposed the plugin only through a programmatic
  wrapper and did not mount the component after reinstall. Its stale tool
  surface later returned a telemetry transport failure even though the exact
  refreshed stdio bundle succeeded.
- The in-app browser inventory was empty. Snapshot rendering, `Go Live`,
  `Close`, PiP, fullscreen, and mounted adaptive refresh remain unverified and
  require a new conversation with the refreshed plugin enabled.
