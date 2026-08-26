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

### Mobile layout and relayed-camera repair

- Official OpenAI plugin documentation confirmed that plugins can be used in
  ChatGPT Chat or Work on mobile, that inline cards can expand to the mobile
  display area without nested scrolling, and that mobile PiP may be presented
  as fullscreen. This is product-surface guidance, not evidence for this local
  plugin on iOS.
- The desktop component's direct private-LAN camera path was replaced by a
  read-only `get_u1_camera_frame` MCP tool. The widget no longer receives
  printer URLs or embeds a nested camera iframe; its CSP external origin lists
  are empty.
- `bun run check`: passed after the relay and responsive-layout change.
- `bun test src/*.test.ts`: passed 10 tests and 52 assertions covering the MCP
  render descriptor, three read-only tools, self-contained MCP App resource,
  private frame metadata, same-origin and protocol rejection,
  first-complete-JPEG stream extraction, relayed preview start/stop, mobile
  breakpoints, safe areas, touch targets, and host display APIs.
- `bun run bundle`: rebuilt the self-contained stdio artifact with widget URI
  `ui://u1-print-studio/status-v2.html`.
- A real read-only source call returned a valid JPEG data URL. The snapshot was
  146,574 bytes in that observation; its base64 payload was not printed.
- A bundled stdio MCP smoke called `get_u1_status` and
  `get_u1_camera_frame` without calling `show_u1_status`. It returned current
  `complete` telemetry and a valid relayed JPEG data URL of 148,023 bytes.
- The camera snapshot endpoint timed out intermittently during repeated smoke
  calls and sometimes kept a chunked JPEG response open after sending partial
  bytes. The adapter now caches the printer-advertised same-origin route,
  extracts the first complete JPEG without waiting for connection close, and
  retries a frame at most once; the widget's 1.5-second loop never overlaps
  calls.
- The marketplace source and installed cache were validated after reinstall as
  `0.2.0+codex.20260825142747`. An exact installed-cache stdio smoke listed all
  three tools, served `status-v2` as `text/html;profile=mcp-app` with empty
  external CSP lists, confirmed the mobile/relay source contracts, returned
  reachable telemetry, and returned a valid 148,142-byte JPEG data URL in
  widget-private metadata.
- The in-app browser was unavailable. Two local headless-Chrome render attempts
  also failed to produce screenshots and were stopped. Responsive source,
  contracts, and valid JPEG transport do not prove desktop or iOS rendering.
- No Secure MCP Tunnel, public endpoint, or iOS host was configured. Cross-device
  connectivity and visual validation remain pending, and Moonraker was not
  exposed.

### LAN reachability and slow-camera repair

- Read-only system-`curl` probes from the current laptop returned HTTP 200 for
  the configured Moonraker `/server/info` and `/server/webcams/list` routes.
  Route inspection selected the current Wi-Fi interface. No printer identifier
  or private address is retained here.
- The mounted card still reported offline through the current Codex MCP
  connection, and that connection listed only `show_u1_status` and
  `get_u1_status`. The refreshed contract requires the additional
  `get_u1_camera_frame` tool, so this is stale host-process evidence rather than
  a current LAN failure.
- Webcam inventory advertised the built-in `webrtc-camerastreamer`, a
  same-origin snapshot route, and a same-origin WebRTC route. A direct bounded
  snapshot probe returned HTTP 200, `image/jpeg`, and 150,523 bytes in 12.9
  seconds.
- The camera relay now allows a 20-second first attempt and one 10-second retry;
  `.mcp.json` allows 40 seconds. A test asserts that the MCP tool budget exceeds
  webcam discovery plus both bounded frame attempts.
- `bun run check`: passed.
- `bun test src/*.test.ts`: passed 12 tests with 54 assertions.
- `bun run bundle`: rebuilt the self-contained stdio artifact.
- A source-level real-camera call returned a valid 143,387-byte JPEG in 4.7
  seconds without printing its payload.
- `uv run --no-project --with pyyaml python .../validate_plugin.py
  /Users/scottchu/plugins/u1-print-studio`: passed for the synchronized personal
  marketplace source.
- The cache-busted plugin was reinstalled as
  `0.2.0+codex.20260825144906`. An exact installed-cache stdio smoke listed all
  three tools, returned reachable `complete` status with camera availability,
  and returned a valid 149,695-byte JPEG data URL in widget-private metadata.
- `uv run --no-project --with pyyaml python .../validate_plugin.py
  plugins/u1-print-studio`: passed for the durable repository source.
- `./scripts/check-repository.sh`: passed with `repository contract: ok` and
  reran the 12 tests with 54 assertions.
- `git diff --check`: passed.
- A private-address scan across repository records and plugin source was clean.
- The current thread cannot hot-reload its already-connected MCP process. A new
  thread remains required to prove mounted desktop rendering. iOS additionally
  requires an authenticated reachable MCP backend on an always-on host with a
  private route to the printer; no such backend or tunnel was configured.

### Personal mobile OAuth and setup skill

- Decision 0010 records the selected personal-developer boundary: a dedicated
  Tailscale Funnel HTTPS origin forwards to a loopback-only Streamable HTTP MCP
  server. Moonraker and its camera are not Funnel targets.
- OAuth tests cover the RFC 7636 PKCE vector, root and path-aware discovery,
  approved and rejected dynamic registrations, unauthenticated challenges,
  accepted signed tokens, wrong audiences, and missing scopes.
- `bun run check` and `bun test src/*.test.ts` passed before the onboarding-skill
  addition with 17 tests and 74 assertions. Final rerun evidence follows in the
  delivery record.
- The public health endpoint returned HTTP 200. Protected-resource metadata
  named the exact `/mcp` resource and only `u1.monitor`; an unauthenticated MCP
  initialize returned HTTP 401 with the expected `WWW-Authenticate` metadata
  URL and scope.
- Tailscale Funnel status showed an existing port-443 root proxy preserved and
  the dedicated U1 port-8443 root proxy mapped only to `127.0.0.1:8787`.
- The macOS LaunchAgent was running with umask `077`, using the ignored local
  environment. OAuth state and the enrollment-link file were owner-only and
  outside the repository.
- The intended phone completed user-verified passkey enrollment. Local state
  reported enrollment without displaying credential material, and the one-time
  enrollment-link file was absent afterward.
- `u1-mobile-status-setup` passed Skill Creator validation. The full plugin also
  passed Plugin Creator validation with four skills.
- ChatGPT Developer mode, authenticated connection, exact remote tool
  discovery, and iOS card rendering remain user-interface evidence still to be
  completed. The Codex iPhone Security and Plugins screens did not expose the
  desktop/web developer controls.
- Final local delivery rerun: `bun run bundle`, `bun run check`, and
  `bun test src/*.test.ts` passed with 17 tests and 74 assertions;
  `./scripts/check-repository.sh` passed with `repository contract: ok`; and
  `git diff --check` passed.
- Skill Creator validation passed for the installed
  `u1-mobile-status-setup`; Plugin Creator validation passed for the personal
  marketplace source. The plugin was reinstalled as
  `0.2.0+codex.20260825200215`.
- SHA-256 for the bundled stdio artifact matched across the repository,
  personal marketplace source, and installed cache. This proves exact local
  packaging, not authenticated remote or iOS behavior.

### Standard-HTTPS OAuth discovery repair

- ChatGPT's New Plugin form selected Server URL and OAuth for the correct
  `:8443/mcp` endpoint, then failed before OAuth with `Cannot connect to host
  ...:8443 ssl:default [None]`.
- Public DNS returned Tailscale Funnel edge addresses. Direct TLS requests to
  two public IPv4 edge addresses returned HTTP 200 for `/health`, proving the
  failure was not general Funnel reachability.
- Decision 0011 moves the personal endpoint to standard HTTPS port 443 while
  preserving the existing root handler. Exact `/.well-known`, `/oauth`,
  `/auth`, `/mcp`, and `/health` handlers route to the loopback U1 service.
- The first path-handler configuration stripped the matched prefix and returned
  the backend root or HTTP 404. Targets were corrected to retain each backend
  prefix; this is preserved as setup-skill guidance rather than hidden repair.
- Through a public Funnel edge on standard port 443, `/health` returned the
  personal-OAuth marker; authorization-server metadata named the standard-port
  issuer, endpoints, PKCE S256, and `u1.monitor`; protected-resource metadata
  named the exact `/mcp` resource; and unauthenticated MCP returned HTTP 401
  with the correct metadata URL and scope.
- The unrelated root handler continued returning HTTP 200. The old port-8443
  handler was removed only after the standard-port public checks passed.
- The existing passkey remained enrolled because the relying-party ID hostname
  did not change, and the one-time enrollment-link file remained absent.
- After the user completed the standard-port registration and passkey flow, the
  connected host exposed exactly `show_u1_status`, `get_u1_status`, and
  `get_u1_camera_frame`. An authenticated `show_u1_status` call succeeded and
  returned a fresh reachable `complete` observation at 100% (188/188 layers),
  inactive storage at full file position, no exception, all four tools parked,
  and zero heater targets. This proves the authenticated read-only tool path;
  user-visible iOS layout and relayed-camera behavior remain separate visual
  evidence.
- Delivery rerun after recording that evidence: `bun run bundle`, `bun run
  check`, and `bun test src/*.test.ts` passed with 17 tests and 74 assertions;
  setup-skill validation passed; `./scripts/check-repository.sh` returned
  `repository contract: ok`; repository and personal-source Plugin Creator
  validation passed; and `git diff --check` passed.
- The synchronized plugin was reinstalled as
  `0.2.0+codex.20260825201641`. SHA-256 for `app/dist/stdio.js` matched the
  repository, personal marketplace source, and installed cache at
  `d259b492d097c55e7c0a56ff2adf27866c168dd593d4037611a44acb2dcc9944`.

### Codex mobile image fallback

- Decision 0012 records a host-compatible representation change rather than a
  new dashboard: remote OAuth calls to `show_u1_status` include a self-contained
  PNG generated from the same normalized observation in `structuredContent`.
  Local stdio calls and remote `get_u1_status` refresh calls remain data-only.
- The PNG renderer is dependency-free, emits only `IHDR`, compressed pixel
  data, and `IEND`, and includes no printer URL, public image URL, camera bytes,
  or control affordance.
- A contract test decoded the remote render result, verified the standard PNG
  signature, and read dimensions of 1200 by 1500. A separate contract test
  proves the remote refresh result does not add an image.
- A fresh real-printer observation was rendered locally and visually inspected.
  It showed `complete`, 100%, 188/188 layers, inactive storage, the observed
  parked tool and zero heater targets, elapsed time, file identity, observation
  time, and camera availability. The generated inspection artifact was kept
  outside the repository.
- `bun run check`: passed.
- `bun test src/*.test.ts`: passed 19 tests with 83 assertions.
- `bun run bundle`: rebuilt the self-contained stdio artifact.
- `uv run --no-project --with pyyaml python .../quick_validate.py
  ../skills/u1-mobile-status-setup`: passed with `Skill is valid!`.
- `uv run --no-project --with pyyaml python .../validate_plugin.py ..`: passed
  for the repository plugin source.
- `./scripts/check-repository.sh`: passed with `repository contract: ok` and
  reran the 19 tests with 83 assertions.
- `git diff --check`: passed.
- The LaunchAgent was restarted against the changed repository source and the
  standard-HTTPS public health route returned the personal-OAuth marker. This
  proves service restart and routing, not an authenticated remote image call.
- Codex mobile image display remains user-visible host evidence. The current
  local Codex tool connection intentionally follows the stdio path and returned
  text plus the interactive-widget contract without a duplicate PNG.
- Plugin Creator validation passed for the synchronized personal source and the
  exact installed cache. The plugin was reinstalled as
  `0.2.0+codex.20260825203920`.
- SHA-256 for the bundled stdio artifact matched across the repository,
  personal marketplace source, and installed cache at
  `acba2fc887c68249a9552a485f3ae9995936ff015da808858d2dfd53fef2b522`.
- An exact installed-cache stdio smoke listed only the three expected tools,
  returned a fresh reachable `complete` observation, and returned only text in
  `content`. This confirms the working local desktop path did not acquire a
  duplicate PNG; it does not prove a new desktop host mounted the component.
- The first Codex mobile PNG rendering was user-visible and visually accepted;
  the user specifically liked the pixel style and requested that it be a little
  larger. The follow-up portrait layout preserves that style while changing the
  four metrics from one compact row to a larger 2-by-2 grid. The new layout
  requires a fresh visual inspection and phone-host confirmation below.
- A fresh real-printer observation was rendered through the revised 1200 by
  1500 path and visually inspected. The larger state, percentage, progress bar,
  two-row metrics, truncated file identity, observation timestamp, and refresh
  hint all fit without clipping. This is local visual evidence; phone-host
  sizing remains the user's next confirmation.
- The loopback service was restarted against the revised source. The first
  immediate public health probe returned a transient HTTP 502 during restart;
  the next probe returned HTTP 200 with the personal-OAuth marker and the new
  process remained running.
- Plugin Creator validation passed for the repository source, synchronized
  personal source, and exact installed cache. The portrait update was
  reinstalled as `0.2.0+codex.20260825211428`.
- SHA-256 for the rebuilt stdio bundle matched across all three locations at
  `6dfa78e49bbf81775ca3e62bd518f7399fff1a2c494583aae4032cc5f3e9c49d`.
- An exact installed-cache stdio smoke again listed only the three read-only
  tools, returned reachable `complete` telemetry, and kept local content
  text-only so the desktop widget path remains unchanged.

### Renewable personal OAuth repair

- A live Codex call failed before tool execution with `UNAUTHORIZED`,
  `oauth_refresh_token_missing`, and a reauthentication action. The phone's
  additional-access flow then reported that it could not connect to U1 Print
  Studio.
- Concurrent public probes still returned HTTP 200 for `/health`, protected
  resource metadata, and authorization-server metadata. Unauthenticated `/mcp`
  returned the expected HTTP 401 challenge. Source inspection then showed a
  15-minute access token, authorization-code-only discovery, and no refresh
  token in the token response. This supports a renewal failure, not a general
  service, Funnel, printer, or camera outage.
- `bun run check`: passed.
- `bun test src/*.test.ts`: passed 22 tests with 115 assertions. The added
  contracts cover version-1 state migration, discovery and DCR metadata,
  initial issuance, authorization-code replay, owner-only hashed persistence,
  restart recovery, client/resource/scope binding, rotation, sequential and
  concurrent replay, 30-day expiry, and MCP authentication with a refreshed
  access token.
- `bun run bundle`: rebuilt the self-contained stdio artifact; remote personal
  OAuth remains an HTTP-service concern and did not alter the stdio tool bundle.
- The setup skill, repository plugin source, synchronized personal source, and
  exact installed cache passed their respective Skill Creator and Plugin
  Creator validation. `./scripts/check-repository.sh` returned `repository
  contract: ok`, and `git diff --check` passed.
- The plugin cachebuster and reinstall flow produced
  `0.2.0+codex.20260825234015`. SHA-256 for `app/dist/stdio.js` remained matched
  across repository, personal source, and installed cache at
  `6dfa78e49bbf81775ca3e62bd518f7399fff1a2c494583aae4032cc5f3e9c49d`.
- Before restart, the live authorization state was version 1 with two registered
  clients and an enrolled credential. An owner-only dated backup was created
  outside the repository. Restart migrated the state to version 2 while
  preserving the signing key identifier, both clients, and the credential.
  No secret or private runtime path is recorded here.
- Post-deployment public health and both discovery documents returned HTTP 200;
  authorization-server metadata now advertises `authorization_code` and
  `refresh_token`, PKCE S256, the standard-HTTPS issuer, and only `u1.monitor`.
  The protected resource still names the exact `/mcp` audience, and
  unauthenticated MCP still returns HTTP 401 with the expected challenge.
- This satisfies static/software and public-protocol evidence for `AUTH-002`.
  A pre-repair connection cannot gain a refresh token retroactively. After
  deployment, the user confirmed that the repaired connection works
  immediately. Another call after more than 15 minutes remains the separate
  real-host renewal gate. No printer command was issued during diagnosis,
  implementation, deployment, or validation.

### Transport-independent image fallback and third PLA completion

- A current-thread local stdio `show_u1_status` call returned fresh normalized
  telemetry but only text content. Source inspection isolated the omission to
  `includeImageCard: Boolean(securitySchemes)`: OAuth presence had been used as
  a proxy for host iframe capability.
- Decision 0012 was corrected so every `show_u1_status` result carries the
  same-observation 1200 by 1500 PNG fallback. `get_u1_status` remains data-only
  for mounted-widget refreshes.
- Local and remote render contract tests passed with 9 tests and 56 assertions;
  the local test now requires `image/png`. TypeScript validation passed after
  restoring the personal source's locked dependencies.
- Plugin Creator validation passed for the personal marketplace source. The
  exact installed cache `0.2.0+codex.20260826003532` reran the 9 render tests
  successfully. Existing conversations still do not hot-reload replaced MCP
  processes; a new conversation remains the pickup boundary.
- During the same read-only monitoring session, a user-authorized third PLA job
  reached fresh telemetry-verified completion at 98/98 layers: state
  `complete`, inactive virtual storage at full file position, no exception,
  all four tools parked, and all heater targets zero. The strongest earlier
  camera frame showed five attached upright objects without visible spaghetti.
  The final frame was dark after the bed lowered and lights turned off, so no
  unseen physical-result claim is made.
