# F0 dual-subsystem foundation validation

## 2026-08-27 post-merge app recovery and live read-only acceptance

### Delivery and installed runtime

- Pull request 20 merged the compatibility-resource repair as `4d4ea2f`.
- Personal Marketplace version `0.2.0+codex.20260827215815` was release-staged,
  validated, and installed. The staged and installed standalone executables
  both had SHA-256
  `2f9398965871c3eefbfac872e6829583ee37a54089a2450f2550d614b8011c12`;
  the installed arm64 Mach-O passed ad-hoc signature verification.
- `codex mcp get u1-print-studio` resolved the portable relative release
  command from the exact installed plugin-root cwd. No user-specific absolute
  path was introduced.
- An exact installed-cache stdio client listed the four model-visible plus
  three app-only read-only tools, listed and read both `status-v4.html` and
  `status-v3.html` with identical content, observed standby status, obtained a
  259,389-byte JPEG, opened one bounded camera offer with one ICE server, and
  explicitly closed it.
- The replaced personal source was moved to a recoverable Trash quarantine.
  Its machine-local path is intentionally not recorded in the repository.

### Deployed service and evidence boundary

- The existing public service was restarted only after the merge. Its
  LaunchAgent and the new separately supervised dashboard LaunchAgent both
  reported `running`.
- Public health, private dashboard page and health, and private enrollment
  health each returned HTTP 200. Unauthenticated MCP returned 401 and public
  enrollment returned 404.
- The existing authenticated remote MCP connection remained usable after the
  restart: it observed standby status and fresh snapshot metadata reporting an
  available 255,860-byte `image/jpeg`.
- The private dashboard bridge opened a real read-only camera session with a
  981-byte SDP offer and one ICE server, then returned `closed: true` for the
  explicit close.
- Existing Tailscale handlers were inspected after deployment. Public 443
  still maps only the prior exact public handlers, private 8444 maps to the
  dashboard listener, private 8447 maps to the enrollment listener, and
  unrelated 8445/8446 handlers remain present. This recovery did not mutate
  routing.
- The first dashboard LaunchAgent start failed because its restricted `PATH`
  omitted the installed Tailscale CLI directory. Adding that fixed path and
  re-bootstrapping the exact dashboard agent repaired the 502; the service now
  listens on loopback and the private HTTPS dashboard returns 200.
- No connected browser-control surface was available. Server-side
  offer/session/close and snapshot transport are accepted, but visible mounted
  video, FPS, UI-triggered Close, PiP, and fullscreen remain unaccepted
  user-outcome evidence.
- No upload, start, pause, resume, cancel, G-code, route mutation, credential
  replacement, or other printer-control action ran.
- `./scripts/check-repository.sh` reran after recording deployment evidence:
  TypeScript passed, 61 tests with 329 assertions passed, and the repository
  contract reported `ok`.
- `git diff --check` passed after the same record update.

## 2026-08-27 mounted-app recovery source validation

### Acceptance and evidence boundary

- Milestone: F0 dual-environment and contract discovery.
- Keep current tool descriptors on `status-v4.html`, read the immediately
  preceding `status-v3.html` URI for retained cards, and preserve empty external
  CSP plus the exact four model-visible and three app-only read-only tools.
- Keep the release runtime command relative to the installed plugin root. A
  machine-specific absolute path is not an acceptable open-source packaging
  repair.
- Static/software and simulated MCP evidence do not prove mounted playback.
  The private `:8444` standalone dashboard is a separately supervised developer
  adapter and its 502 does not prove an MCP or printer failure.

### Diagnosis and commands

- The exact installed cache executable existed, was arm64 Mach-O, passed
  `codesign -vvv --verify`, and printed help from both its plugin-root cwd and a
  minimal clean environment.
- `codex mcp list` resolved the current release command to the exact installed
  plugin-root cwd. The failing task requested `status-v3.html`, identifying a
  retained pre-upgrade task snapshot rather than a missing current executable.
- `bun run check`: passed.
- `bun test src/*.test.ts`: passed 61 tests with 329 assertions. The new
  regression lists and reads both resource URIs and proves identical widget
  HTML, MCP Apps MIME type, and empty external CSP.
- `bun run bundle` and `bun run bundle:runtime`: passed. The standalone runtime
  passed signature verification and printed help.
- An exact compiled stdio client launched the standalone runtime with `/tmp` as
  its cwd, listed v4 and v3, read both resources at 52,470 bytes, and proved
  their text identical.
- Plugin Creator validation passed. Skill Creator validation passed for
  `u1-monitor-print` and `u1-mobile-status-setup`. `git diff --check` passed.
- No live service, OAuth state, Serve/Funnel route, printer, or installed plugin
  was changed during source validation.

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

### Continuous read-only camera relay

- The moved diff and backup stash were inspected before editing. The stash
  `move-u1-camera-media-relay-to-orca-worktree` remained untouched and was not
  reapplied.
- `bun install --frozen-lockfile` restored missing worktree dependencies without
  changing `bun.lock`.
- `bun run check`: passed after the final source-budget correction.
- `bun test`: passed 29 tests with 144 assertions across application ticket and
  lease policy, exact multipart HTTP routing, MCP result privacy, local and
  remote PNG contracts, OAuth, widget fallback, and raw JPEG validation.
- Skill Creator `quick_validate.py` passed for
  `u1-mobile-status-setup` and `u1-monitor-print` using `uv run`.
- `bun run bundle` produced the self-contained stdio artifact. Plugin Creator
  validation passed for repository source, synchronized personal source, and
  installed cache.
- The plugin cachebuster helper replaced the prior suffix and the final
  reinstall produced `0.2.0+codex.20260826005742`. Repository, personal-source,
  and installed bundles share SHA-256
  `6913657ebe92cbcfe372170023545080390953a2e96f9c65412a068e17b31fd1`.
- An exact installed-cache stdio smoke listed the three local read-only tools,
  returned a fresh reachable observation, and returned `text` plus a valid
  1200 by 1500 PNG. The HTTP-only stream tool is intentionally absent from
  stdio.
- The first real-camera harness used a provisional 3-second plus 3-second frame
  budget and did not deliver two frames within its 30-second lease. The
  temporary harness was stopped. Reusing the established 20-second plus
  10-second bounded source policy then delivered two complete JPEGs over one
  multipart response in 1.9 seconds, HTTP 200, with the exact boundary and
  430,390 transferred bytes. After abort-listener and backpressure-close
  cleanup, the final synchronized source repeated the proof in 2.6 seconds with
  428,954 bytes. No image was retained.
- The live LaunchAgent was moved only from the canonical checkout to the
  synchronized personal plugin source. Owner-only plist and OAuth-state backups
  were created outside the repository, and OAuth state remained byte-for-byte
  unchanged across restart.
- Tailscale Funnel retained the unrelated root plus exact `/.well-known`,
  `/auth`, `/health`, `/mcp`, and `/oauth` handlers. Deployment added only
  `/media` mapped to the same loopback prefix.
- Local and public health returned HTTP 200. Public OAuth metadata retained
  authorization code, refresh token, PKCE S256, and only `u1.monitor`.
  Unauthenticated MCP returned HTTP 401; exact media without a ticket returned
  HTTP 401; an unknown media path returned HTTP 404; the unrelated root still
  returned HTTP 200.
- The current Codex conversation retained its pre-reinstall three-tool MCP
  surface and later returned a stale offline observation. That is not treated
  as current deployment or printer evidence. A new thread is required to prove
  the remote four-tool inventory and mounted widget.
- Static/software, exact public protocol, and real-printer JPEG evidence pass.
  Mounted desktop and iOS continuous rendering, fallback behavior, Close, PiP,
  fullscreen, and real-host OAuth renewal remain separate user-visible gates.
- No printer control or G-code was implemented or invoked.

### Standalone read-only status dashboard

- `bun install --frozen-lockfile` restored this worktree's missing app
  dependencies without changing `bun.lock`.
- `bun run check`: passed.
- `bun test src/*.test.ts`: passed 34 tests with 161 assertions. The added
  contracts prove the production widget is hosted by the harness, only
  status/snapshot/stream calls are accepted, a control-shaped call is rejected,
  `/dashboard` is absent unless explicitly enabled, a derived external origin
  must be a private MagicDNS HTTPS hostname on a dedicated non-443 port, and
  the dashboard-only process returns 404 for the ordinary `/mcp` route.
- A dedicated status-dashboard process stayed bound to `127.0.0.1:8788`
  without changing or restarting the installed loopback 8787 service. Private
  Tailscale Serve HTTPS on port 8444 proxies only the tailnet to that process;
  the existing public port-443 Funnel routes were preserved and port 8444 has
  no Funnel permission.
- The user could not open the earlier raw tailnet-IP port. Tailscale reported
  the iPhone online and active, but ping used DERP and did not establish a
  direct connection. That observation motivated replacing the raw app bind
  with loopback plus Tailscale Serve; it does not by itself prove whether the
  failed TCP connection was an ACL, firewall, or path issue.
- The exact private HTTPS `/dashboard` route returned the bridge host and live
  reachable `complete` telemetry with camera available. A one-time HTTPS relay
  delivered two multipart JPEG parts, HTTP 200, in 1.42 seconds with 144,083
  transferred bytes. No image was saved.
- The in-app browser runtime was unavailable, so the harness was not visually
  inspected in this run. HTTP integration and real-printer camera evidence do
  not prove browser layout quality or ChatGPT host rendering.
- The dashboard is opt-in and read-only. The app remains on loopback, is absent
  from the normal service, and its dedicated Tailscale Serve port must not be
  Funnel-enabled. No printer control or G-code was implemented or invoked.
- `bun run bundle` rebuilt the ignored local stdio artifact successfully.
  Plugin Creator validation passed with its transient YAML dependency. No
  cachebuster, marketplace edit, reinstall, or deployed-service replacement
  was performed because the harness runs directly from the branch.

### Icon controls, persistent grid, and component skeletons

- Acceptance boundary: this refinement changes only the read-only widget UI.
  It must not add a printer command, expand the standalone bridge tool allowlist,
  or expose a camera URL to model-readable output.
- `bun test src/*.test.ts`: passed 35 tests with 174 assertions, including the
  icon-only control, persistent-grid, and component-loading-state contract.
- `bun run check`: passed TypeScript validation.
- Plugin Creator `validate_plugin.py` passed through
  `uv run --with pyyaml`; the transient dependency did not change project
  dependencies.
- Loopback `GET /widget?standalone=1` served the new icon/grid/skeleton source.
  Loopback and private Tailscale HTTPS `GET /dashboard` both returned HTTP 200.
- Live read-only bridge calls completed, but the printer was offline at that
  observation: status was `offline` with camera unavailable, and the camera
  frame result was unavailable with zero bytes. This verifies the unavailable
  state path, not live camera rendering or printer reachability.
- No browser was connected to the in-app browser runtime, so visual layout,
  animation quality, and live/snapshot transitions remain user-visible review
  gates. No cachebuster, plugin reinstall, printer command, or G-code action was
  performed.

### Neutral camera indicator and explicit presentation mode

- Acceptance boundary: the persistent camera grid remains unchanged; the
  top-left camera icon has no state dot, slash, pulse, or state-dependent
  color; and the bottom-right overlay is the sole visible camera-mode text.
- Snapshot mode now reports `Snapshot` with the frame time, snapshot fallback
  reports `Snapshot fallback`, and continuous mode reports `Live` with the
  configured rate as an honest `up to 15 FPS` ceiling rather than measured FPS.
  The old build-plate title and secure-snapshot caption were removed.
- `bun test src/*.test.ts`: passed 36 tests with 185 assertions, including the
  neutral-icon and bottom-right mode-label contract.
- `bun run check`, `bun run bundle`, Plugin Creator validation through
  `uv run --no-project --with pyyaml`, `./scripts/check-repository.sh`, and
  `git diff --check`: passed.
- The exact private HTTPS widget source contains the new mode labels and none
  of the removed title, secure-snapshot caption, or camera-status dot. Private
  HTTPS `/dashboard` returned HTTP 200, and its read-only status bridge returned
  reachable `complete` telemetry with camera available and a configured target
  of 15 FPS.
- The browser-control runtime reported no available browser, so the refreshed
  snapshot, fallback, and live layouts remain a user-visible review gate. No
  cachebuster, plugin reinstall, printer command, or G-code action was
  performed.

### Snapmaker card theme

- Acceptance boundary: this pass changes only the existing read-only card's
  visual tokens. Layout, copy, camera relay behavior, bridge calls, tools, and
  printer behavior remain unchanged.
- A user-supplied Snapmaker U1 website screenshot established the palette:
  charcoal and warm white form the base, Snapmaker yellow identifies the card,
  orange is reserved for paused or attention state, and red remains reserved
  for faults. The implementation applies yellow to the camera grid, live and
  refresh actions, status treatment, progress fill, and the camera/content
  divider in light and dark color schemes.
- `bun test src/*.test.ts`: passed 37 tests with 192 assertions, including the
  Snapmaker theme-token contract. `bun run check`, `bun run bundle`, Plugin
  Creator validation through `uv run --no-project --with pyyaml`,
  `./scripts/check-repository.sh`, and `git diff --check`: passed.
- Private HTTPS `/dashboard?reload=5` returned HTTP 200. The exact served widget
  contained the yellow and orange tokens plus branded divider and no legacy
  green or lime token declarations.
- Product Design QA is recorded in `design-qa.md` with `final result: blocked`.
  The source reference was inspected, but the in-app browser runtime reported
  no connected browser, so no implementation screenshot, visual comparison,
  interaction check, or console check was available. No cachebuster, plugin
  reinstall, printer command, or G-code action was performed.

### Semantic camera modes and measured relay FPS

- Acceptance boundary: camera mode status is left-aligned and the mode action
  is right-aligned; snapshot/fallback displays a red disconnected-camera icon;
  live displays a pulsing green dot; and the FPS label reflects observed frame
  presentation rather than the configured relay ceiling. The camera remains
  read-only and no printer-control surface is added.
- The widget now fetches the exact one-time media URL permitted by the MCP
  result, parses complete JPEG frames from the multipart byte stream, presents
  them through the existing snapshot element, and computes FPS from frame
  observations in a rolling five-second window. Until two frames arrive it
  reports `Live · measuring FPS`.
- The exact private relay delivered four complete frames at an observed 1.4 FPS
  during the smoke check. This is transport/presentation evidence, not a claim
  about the camera sensor's native frame rate.
- `bun test src/*.test.ts`: passed 38 tests with 207 assertions.
- `bun run check`, `bun run bundle`, and an independent parse of the inline
  widget module: passed. Private HTTPS `/dashboard?reload=6` returned HTTP 200
  and served the measured-FPS widget source.
- Plugin Creator validation through `uv run --no-project --with pyyaml`,
  `./scripts/check-repository.sh`, and `git diff --check`: passed.
- The identity palette is grounded in the official Snapmaker U1 page stylesheet:
  charcoal `#1c1e20`, `#1f1f1f`, and `#242424`; yellow `#ffcd00`; orange
  `#ff5f28`; and warm white surfaces. Semantic green `#32c86e` and red
  `#ff6161` are deliberately outside the brand palette and communicate
  positive/connected versus negative/disconnected state.
- Browser-rendered comparison and interaction QA remain blocked because the
  configured browser-control runtime reported no connected browser. No plugin
  reinstall, printer command, or G-code action was performed.

### Actual WebRTC camera presentation

- Acceptance boundary: `Go Live` must negotiate the printer's advertised
  `webrtc-camerastreamer`; no repeated snapshot transport may be called live;
  snapshots remain an explicitly labeled fallback; printer controls and a
  generic proxy remain absent.
- `bun run check` and `bun test src/*.test.ts`: passed 38 tests with 220
  assertions. The contracts cover a real `<video>` element,
  `RTCPeerConnection`, H264 offer handling, answer and ICE forwarding,
  printer-peer-ID privacy, ticket replay rejection, bounded lease teardown,
  CORS, and removal of the old MJPEG route and JPEG stream parser.
- `bun run bundle`, Plugin Creator validation through
  `uv run --no-project --with pyyaml`, `./scripts/check-repository.sh`, and
  `git diff --check`: passed.
- The private dashboard's exact ticketed signaling route returned an H264 offer
  of 981 bytes plus the reference STUN server without exposing the printer peer ID, and session deletion
  released the lease. A separate `aiortc` receiver reached `connected`, decoded
  frames over the persistent peer connection, and closed the session without
  retaining media. Software-decoder samples varied from 0.2 to 24.8 FPS; that
  variability is not native-browser performance evidence.
- Plugin `0.2.0+codex.20260826165531` was validated, reinstalled, and both the
  protected service and private dashboard were restarted. Public
  `/media/camera.mjpeg` returns 404, invalid WebRTC tickets return 401, and
  private `/dashboard?reload=10` returns 200 while serving the WebRTC widget.
- No connected browser was available to the control runtime, so visible native
  playback, browser-measured FPS, and ChatGPT/iOS mounting remain separate
  user-visible acceptance evidence. No printer control or G-code action ran.

### Automatic-refresh icon cleanup

- Removed the decorative status-dot pseudo-element from the automatic-refresh
  button. Enabled and paused behavior, accessible labels, and icon color remain
  unchanged.
- `bun run check`, `bun test src/*.test.ts`, and `bun run bundle`: passed 38
  tests with 222 assertions, including absence of both dot selectors.

## Local-first connector and MCP Apps signaling bridge — 2026-08-26

### Acceptance and safety boundary

- Milestone: F0 dual-environment and contract discovery.
- Open questions addressed: the first normal-user Printer Operations host and
  network boundary, reuse of one application session service from MCP and
  optional HTTP adapters, and the smallest packaging/onboarding evidence.
- Decision 0016 and the active brief recorded acceptance criteria before code
  implementation. Decision 0016 partially supersedes 0015 only for hosted
  signaling transport.
- This validation is read-only static/software and simulated protocol evidence.
  It does not prove a mounted host, another machine, package installation,
  physical-printer behavior, or user outcome.
- No printer, installed plugin, marketplace, package registry, Homebrew tap,
  OAuth state, Tailscale service, or other hosted service was accessed or
  changed.

### Commands and results

From `plugins/u1-print-studio/app`:

- `bun run check`: passed.
- `bun test src/*.test.ts`: passed 49 tests with 275 assertions across nine
  files. Coverage includes empty hosted CSP, no widget `fetch(` call, MCP Apps
  signaling tool names, app-only helper visibility, private session metadata,
  snapshot fallback wiring, existing status/snapshot/PNG contracts, fixed HTTP
  adapter routes, offer/answer/ICE bounds, expiry, concurrency, cumulative
  candidate teardown, configuration permissions, and release packaging.
- `bun run bundle`: passed and emitted ignored `dist/stdio.js` plus the embedded
  `dist/widget.html` asset. An earlier run failed because the old `--outfile`
  form cannot emit both files; the script now uses an explicit output directory
  and deterministic entry/asset names.
- `bun run bundle:runtime`: passed with Bun 1.3.12 and produced an ignored
  macOS arm64 standalone executable. The builder disables automatic dotenv and
  bunfig loading, embeds the widget, removes Bun's invalid emitted signature on
  this macOS 26.5.2 host, applies an ad-hoc local signature, and verifies it.
- `./dist/u1-print-studio --help`: passed without invoking a Bun executable.
- `./dist/u1-print-studio setup --printer-url http://127.0.0.1:7125 --config
  <temporary-directory>/config.json --json`: passed and wrote the temporary
  configuration.
- `./dist/u1-print-studio doctor --offline --config
  <temporary-directory>/config.json --json`: passed with
  `printerObservation: skipped-offline`; it did not contact hardware.
- `stat -f '%Sp %N' <temporary-directory>/config.json`: reported `-rw-------`.
- `codesign -vvv --verify ./dist/u1-print-studio`: reported valid on disk and
  satisfied its designated requirement for the ad-hoc validation signature.

From the repository root:

- `uv run --no-project --with pyyaml python
  /Users/scottchu/.codex/skills/.system/plugin-creator/scripts/validate_plugin.py
  plugins/u1-print-studio`: passed.
- `git diff --check`: passed before final record updates.
- `./scripts/check-repository.sh`: initially identified the required
  `PROJECT_STATE.md` headings after that file was condensed. The headings were
  restored. A subsequent run exposed a millisecond-boundary test flake where a
  nominal 30-second lease displayed as 29 seconds; the presentation duration
  now rounds up while the absolute expiry remains authoritative.
- Final `./scripts/check-repository.sh`: passed, including TypeScript and all 49
  tests with 275 assertions.
- Final `git diff --check`: passed.

### Independent pre-merge review

- A pre-existing config file could retain broader permissions because the
  creation mode passed to `writeFileSync` only applies when a file is created.
  The writer now explicitly applies `0600` after every non-Windows write, and a
  regression starts from an existing `0644` file.
- A malformed camera stream envelope could contain a valid session ID but fail
  validation before the widget retained it for teardown. The widget now retains
  a valid ID before envelope validation, so snapshot fallback closes the
  bounded session; a widget contract regression enforces that ordering.
- `bun test src/local-config.test.ts src/app.test.ts`: passed 19 tests with 140
  assertions.
- `bun run bundle` and `bun run bundle:runtime`: passed; the regenerated macOS
  arm64 executable remained valid on disk and satisfied its designated
  requirement.
- Plugin validation passed with `uv run --no-project --with pyyaml`, and
  `git diff --check` passed before these record updates.

### Packaging evidence boundary

- `.mcp.release.json` invokes only the staged executable's `mcp` subcommand and
  contains no Bun, env-file, Tailscale, DNS, or OAuth setup.
- `PACKAGING.md` maps Marketplace, Homebrew, and npm to the same setup/doctor
  contract. No channel metadata was published or installed.
- The ephemeral macOS executable and all temporary configuration/build smoke
  files were removed after validation. Source and manifests are the delivered
  artifacts.
- Developer ID signing, notarization, checksums, cross-platform builds,
  installation, upgrades, rollback, owner-selected licensing and third-party
  notices, and elimination of the platform `curl` dependency remain unverified
  gates.

### Delivery

- Implementation commit: `3145a77` on non-main branch
  `scottchu/local-first-rollout`.
- Pull request: https://github.com/scottchu/orca-slicer-mcp/pull/15.
- No hosted validation workflow was configured or awaited.

## Post-merge personal Marketplace installation — 2026-08-27

### Authorization and evidence boundary

- The user explicitly authorized merge, install, and test after independent
  review. Pull request 15 merged as `d5a734e65b04a5af9b458cc310f45cb40dcfbd40`.
- This is same-machine installation plus real-printer read-only protocol
  evidence. No upload, start, pause, resume, cancel, G-code, or other printer
  control tool or action ran.
- The current Codex task could not hot-reload the reinstalled plugin, so mounted
  iframe rendering, Go Live playback, PiP, fullscreen, and fallback remain a
  separate fresh-task user-outcome gate.

### Release staging and installation

- The merged plugin source was copied into the personal Marketplace source.
  The standalone macOS arm64 executable was staged at
  `app/runtime/u1-print-studio`.
- Codex plugin validation requires the MCP descriptor at `.mcp.json`. The
  release staging copy therefore replaced the developer descriptor with the
  contents of `.mcp.release.json`; it did not install Bun or an environment-file
  dependency.
- Plugin validation passed, `--help` passed, and the plugin-creator cachebuster
  advanced the staged version to `0.2.0+codex.20260827152101`.
- `codex plugin add u1-print-studio@personal`: passed. `codex plugin list`
  reported the new version installed and enabled.
- The staged and installed executables had the same SHA-256
  `624957b927e930bce975f714de1729381b20f67a598654010453dcbc9e1e8d52`.
  The installed executable passed `codesign -vvv --verify`.
- Installed-runtime setup and offline doctor passed against a temporary
  loopback config; its mode was `0600`. The temporary smoke directory was moved
  to Trash after validation.

### Installed read-only smoke

- Setup migrated the existing private printer origin into the default local
  config without printing or persisting that identifier in the repository.
- Installed-runtime `doctor --json`: passed with configuration, fixed
  read-only allowlist, MCP Apps signaling, and external-widget-fetch checks all
  healthy; `printerObservation` was `reachable`.
- A direct MCP stdio client launched the exact installed standalone executable.
  `tools/list` returned four model-visible tools and the three app-only bounded
  signaling helpers.
- `get_u1_status` returned a reachable printer and available camera;
  `get_u1_camera_frame` returned relayed `image/jpeg` data;
  `open_u1_camera_stream` returned an MCP Apps offer; and
  `close_u1_camera_stream` confirmed explicit teardown.
- The installer replaced the previous cache version; rollback requires
  restaging a prior Git version rather than selecting an old cache directory.
  A mistakenly resolved, unused staging copy was moved to a dated Trash
  quarantine outside the repository rather than deleted.

## Secure remote Monitor source slice — 2026-08-27

### Acceptance and safety boundary

- Milestone: F0 dual-environment and contract discovery.
- Decision 0017 records the user-authorized slice: standard-HTTPS public OAuth
  and Streamable HTTP MCP, a separate loopback enrollment listener for a
  tailnet-only Serve origin, explicit bounded STUN, and preferred per-session
  RFC5766 TURN REST credentials.
- The public inventory remains exactly four model-visible read-only tools and
  three app-only read-only signaling helpers. No upload, start, pause, resume,
  cancel, G-code, generic proxy, Control, or Admin capability was added.
- This run is static/software and simulated-protocol evidence only. It did not
  restart or inspect the live process, alter the LaunchAgent, Tailscale Serve or
  Funnel, OAuth state, installed plugin, or contact a printer. Coordinator
  diagnostics were treated as pre-change constraints, not revalidated or
  mutated deployment evidence.

### Implemented contracts

- Public `/auth/enroll` and descendants return 404. The enrollment-only handler
  exposes only private `/health` plus exact enrollment routes; MCP, OAuth token,
  media, widget, and unknown routes return 404.
- `U1_ENROLLMENT_BASE_URL` must use the public OAuth hostname on a distinct
  nonstandard HTTPS origin. Configuring it requires a distinct loopback
  `U1_ENROLLMENT_PORT`. The listener remains bound after restart with an
  existing credential: private health remains available and enrollment stays
  404 until a local reset creates a new one-time flow.
- Public OAuth is restricted to standard HTTPS port 443. Public MCP continues
  to require audience- and scope-bound `u1.monitor` tokens; optional exact HTTP
  signaling retains its single-use capability authentication.
- ICE defaults empty. The standalone owner-only schema-2 config accepts and
  preserves bounded repeatable `--stun-url` values; schema 1 reads with an empty
  STUN migration. The HTTP server can use env ICE configuration without any
  standalone config and fails if an existing optional config is malformed.
- TURN configuration accepts bounded `turn:` and `turns:` URLs plus a
  server-only shared secret and a 1800-to-3600-second TTL. Each camera request
  derives `expiry:nonce` plus base64 HMAC-SHA1 credentials and gives the exact
  same ephemeral ICE set to the printer offer and widget-private result
  metadata. The shared secret never leaves the server; derived credentials,
  sessions, printer URLs, and printer peer IDs remain outside model-readable
  content and structured content.
- Malformed ICE coverage rejects wrong schemes, empty TURN addresses,
  credential-bearing URLs, unsupported query parameters, duplicate or
  oversized lists, partial TURN configuration, invalid secret lengths, and
  invalid or out-of-range TTLs and ports.

### Commands and results

From `plugins/u1-print-studio/app`:

- `bun install --frozen-lockfile`: passed and restored this worktree's missing
  dependencies without changing the lockfile.
- `bun run check`: passed TypeScript compilation with no emit.
- `bun test src/*.test.ts`: passed 60 tests with 324 assertions across ten
  files. Coverage includes the enrollment split and post-enrollment restart,
  env-only HTTP compatibility, owner-config STUN preservation, malformed ICE
  rejection, deterministic TURN REST derivation, exact printer/browser ICE
  handoff, model-result privacy, authenticated four-plus-three tool inventory,
  bounded sessions, fallback, PNG, packaging, and existing status contracts.
- `bun run bundle`: passed and emitted the ignored stdio bundle plus widget.
- `bun run bundle:runtime`: passed and produced the ignored macOS arm64
  standalone executable; its ad-hoc validation signature verified.
- Standalone `--help`: passed and advertised repeatable `--stun-url` setup.
- Standalone `setup` against a temporary loopback printer origin with one
  fixture STUN URL: passed and wrote schema 2. A second setup changed only the
  fixture printer origin and preserved STUN. `doctor --offline --json` passed
  with `iceTraversal: explicit-stun-only` and skipped printer observation.
  The temporary config mode was `0600`; it contained no TURN setting or secret.
  The temporary directory was removed after the smoke check.
- `codesign -vvv --verify ./dist/u1-print-studio`: passed.

From the repository root:

- U1 mobile setup `quick_validate.py` through
  `uv run --no-project --with pyyaml`: passed with `Skill is valid!`.
- Plugin Creator `validate_plugin.py` through
  `uv run --no-project --with pyyaml`: passed.
- `./scripts/check-repository.sh`: passed, including TypeScript and all 60 Bun
  tests with 324 assertions; final output was `repository contract: ok`.
- `git diff --check`: passed.

### Unverified later layers and blocker

- No public-edge request was made, so standard-HTTPS discovery, public
  enrollment rejection, private Serve health, preserved live handlers, and
  unauthenticated public rejection remain deployment evidence gates.
- No TURN service URL or shared secret was supplied. A real TURN allocation,
  credential expiry/refresh behavior, bandwidth, and relay availability remain
  externally blocked. Explicit STUN can be a compatibility deployment step but
  does not prove reliable remote media.
- No printer or mounted host was contacted. ChatGPT and Codex WebRTC playback,
  snapshot fallback, Close, PiP, fullscreen, and user outcome remain
  unobserved. No mounted-host success is claimed.

## Post-merge secure remote deployment — 2026-08-27

### Delivery and installation

- Pull request 18 merged the secure source slice as `e298885`. Independent
  reruns passed the repository contract with 60 Bun tests and 324 assertions,
  both bundles, the setup skill validator, the plugin validator, signature
  verification, and whitespace checks.
- Personal Marketplace version `0.2.0+codex.20260827202019` was release-staged
  and installed. Source, staged, and installed standalone runtimes shared
  SHA-256 `d6f5f23f90c532e86acb0b3c7a0fc32f10d7deeede73bb267be66c13ec33fac1`.
  The prior personal source is recoverable from Trash at
  `u1-print-studio-personal-source-20260827T201915Z`.
- The owner config migrated from schema 1 to schema 2 with mode `0600` and one
  explicit STUN URL. Offline doctor reported `explicit-stun-only`; no printer
  origin or credential was recorded here.

### Live public and private boundaries

- OAuth state SHA-256 was unchanged across the service reload. The LaunchAgent
  now runs the merged repository app rather than the replaceable Marketplace
  staging source; its previous plist is recoverable from Trash at
  `com.scottchu.u1-print-studio.plist.20260827T202600Z`.
- Loopback public and enrollment health returned 200 on ports 8787 and 8789.
  Public standard-HTTPS health returned 200, public enrollment returned 404,
  and unauthenticated public MCP returned 401 with `u1.monitor` resource
  metadata. OAuth discovery published only standard-HTTPS endpoints.
- Existing Serve/Funnel routes were preserved. Tailnet-only Serve port 8447
  proxies only to the enrollment listener; private health returned 200 while
  private MCP, token, media, widget, and enrolled-state enrollment routes all
  returned 404. Funnel remained enabled only on port 443.

### Installed and real-printer read-only evidence

- An exact installed-cache stdio client listed seven tools: four model-visible
  read-only tools and three app-only signaling helpers. Status reported the
  printer reachable, a relayed JPEG observation reported 124,642 bytes, an
  H264 offer included one configured ICE server, and explicit local session
  close returned true. No printer-control tool or action ran.
- A direct bounded printer offer confirmed the STUN config reached the printer,
  but its SDP still contained only `host` candidates and no server-reflexive or
  relay candidate. This does not prove internet-routable media.
- Browser discovery returned no connected browser surface. Mounted ChatGPT and
  Codex playback, fallback, PiP, fullscreen, and user-visible success therefore
  remain unverified. No TURN REST service URL or shared secret was supplied, so
  a real relay allocation and reliable arbitrary-network playback remain
  externally blocked.

## Camera-only presentation source validation — 2026-08-28

### Static, software, and simulated protocol evidence

- `bun run check`: passed.
- `bun test src/app.test.ts src/status-dashboard.test.ts`: passed after the
  final visual/lifecycle corrections with 30 focused tests.
- `./scripts/check-repository.sh`: passed with 69 Bun tests and 398 assertions;
  final output was `repository contract: ok`.
- `git diff --check`: passed.
- Both edited plugin skills passed Skill Creator `quick_validate.py` through
  `uv run --no-project --with pyyaml`.
- Plugin Creator `validate_plugin.py` passed through
  `uv run --no-project --with pyyaml`.
- `bun run bundle`: passed and emitted `camera-widget.html` as a distinct
  embedded asset alongside `widget.html`.
- `bun run bundle:runtime`: passed; the macOS arm64 standalone runtime was
  ad-hoc signed and `codesign` reported it valid on disk and satisfying its
  designated requirement.
- A compiled-runtime stdio client listed exactly four model-visible tools
  (`show_u1_status`, `get_u1_status`, `get_u1_camera_frame`, and
  `open_printer_camera`) plus four app-only helpers
  (`open_u1_camera_stream`, answer, candidate, and close), listed
  `camera-v1.html`, and read a camera-only embedded resource.
- Regression tests prove `open_printer_camera` returns a snapshot without
  opening a session, both MCP and `/dashboard/camera` serve the same HTML,
  focused routes are absent from ordinary server mode, external CSP lists are
  empty, the widget has no `fetch(` or caller-selected URL, camera markup is
  exactly equal to the current status widget camera section, the module script
  parses under strict semantics, and Live requires a rendered frame.

### Private browser and real-printer read-only evidence

- A separate source dashboard ran on loopback port 8791 without changing the
  installed plugin, LaunchAgents, OAuth state, or Tailscale routes.
- The in-app browser opened `/dashboard/camera`; the host reported its bridge
  ready and the focused widget displayed a current real camera snapshot using
  the exact existing camera component presentation.
- One user-authorized read-only Go Live interaction negotiated successfully.
  The widget did not label the connection Live until a rendered frame callback,
  then reported an observed `Live · 23 FPS`. Close released the session and
  returned the same component to Snapshot.
- The temporary source server was stopped after the check.

### Evidence boundary

- The private loopback source dashboard proves this machine's test host,
  bridge, real snapshot, rendered live path, and Close behavior. It does not
  prove the not-yet-installed plugin, mounted Codex/ChatGPT resources, mobile
  playback, arbitrary-network traversal, or snapshot fallback under a real
  failure.
- No TURN server is configured. No live TURN allocation or relay candidate was
  observed, so robust remote mounted playback remains unproven.
- No printer control, upload, start, pause, resume, cancel, G-code, generic
  proxy, or Admin action ran.

## Camera-only post-merge install and private deployment — 2026-08-28

### Delivery and installation

- Pull request 22 merged the source slice as `333bebe`.
- Plugin Creator cache-busted and validated Personal Marketplace version
  `0.2.0+codex.20260828194545`. Release staging came from the exact merged Git
  tree, replaced the developer MCP descriptor with `.mcp.release.json`, and
  embedded the validated standalone runtime. No `.env`, `node_modules`, or
  `dist` directory entered the staged plugin.
- The prior personal plugin source was moved, not deleted, to recoverable Trash
  quarantine `u1-print-studio-personal-source-20260828T195024Z`.
- `codex plugin add u1-print-studio@personal` installed the cache-busted
  version. Staged and installed runtimes shared SHA-256
  `b7c0151f01faaddf57aba04f884819ebef92c3254cdae74a09c7c88416af5be1`.
  `codex mcp get u1-print-studio` resolved the portable relative runtime command
  in the installed cache.
- An exact installed-cache stdio client listed model-visible
  `show_u1_status`, `get_u1_status`, `get_u1_camera_frame`, and
  `open_printer_camera`; app-only stream open, answer, ICE, and close; and
  status-v4, status-v3, and camera-v1 resources. The camera resource was 29,785
  bytes and contained the rendered-frame gate without printer-status markup.

### Existing-service restart and deployed private test

- The canonical clean `main` checkout fast-forwarded to `333bebe`. Existing
  `com.scottchu.u1-print-studio` and
  `com.scottchu.u1-print-studio-dashboard` LaunchAgents were restarted with
  their already loaded configuration; no plist, OAuth, enrollment, or
  Tailscale command changed configuration.
- Public health returned 200. Private `/dashboard/camera` and
  `/camera-widget` returned 200. The Tailscale Serve/Funnel status SHA-256 was
  `7dac599f0a80ff45802a7812dda5b67ac2042bc9f66121d18968a83c15d5eebe`
  both before and after restart.
- The deployed private camera host reported its bridge ready and displayed a
  fresh real snapshot. Go Live reached the rendered-frame gate and reported
  `Live · 25 FPS`; Close returned to Snapshot. The test used only read-only
  camera calls.

### Remaining evidence boundary

- Installed-cache MCP contracts and the deployed private browser are verified.
  A fresh Codex or ChatGPT task is still required to prove the new
  `open_printer_camera` mounted resource in those hosts; this existing task
  cannot hot-load the reinstalled descriptor.
- No TURN server or relay allocation was added. The successful private browser
  path does not prove arbitrary-network mounted playback, failure fallback, or
  mobile playback.
- No printer control, preparation, upload, start, pause, resume, cancel, G-code,
  generic proxy, or Admin action ran.

## Camera workflow repair source validation — 2026-08-28

### Acceptance and safety boundary

- Decision 0019 makes `open_printer_camera` the only model-visible camera
  action. The complete inventory is three model-visible plus five app-only
  read-only tools under the existing `u1.monitor` boundary.
- A one-time widget-private activation is required before stream allocation;
  stale direct stream calls fail before printer access or capacity use.
- Unanswered offers release after 15 seconds. Answered sessions retain the
  existing maximum duration and explicit Close behavior.
- This section is source/software and simulated-protocol evidence only. It did
  not mutate an installed plugin, LaunchAgent, OAuth state, Tailscale route, or
  printer.

### Commands and results

- `bun install --frozen-lockfile`: restored worktree dependencies without
  changing the lockfile.
- `bun run check`: passed TypeScript compilation.
- `bun test src/*.test.ts`: passed 71 tests with 417 assertions. Regressions
  cover model/app visibility, private activation, rejection before allocation,
  one-time replay failure, unanswered-session cleanup, v2/v1 resource parity,
  widget Go Live flow, and runtime health schema.
- `bun run bundle` and `bun run bundle:runtime`: passed. The standalone macOS
  arm64 runtime received its validation-only ad-hoc signature.
- `codesign -vvv --verify ./dist/u1-print-studio`: reported valid on disk and
  satisfied its designated requirement.
- Plugin Creator validation passed through `uv run --no-project --with
  pyyaml`. Skill Creator validation passed for `u1-monitor-print` and
  `u1-mobile-status-setup` through the same `uv` boundary.
- `./scripts/check-repository.sh`: passed, including TypeScript and all 71 tests
  with 417 assertions; final output was `repository contract: ok`.
- `git diff --check`: passed.

### Unverified later layers

- Release staging, Personal Marketplace cache-busting/install, exact
  installed-cache MCP, public health/OAuth, private dashboard, real-printer
  snapshot/offer, mounted Codex/ChatGPT, and mobile behavior remain separate
  gates until explicitly recorded.
- No TURN server is configured, so arbitrary-network relay behavior remains
  unproven. No printer control was added or invoked.

## Camera workflow repair post-merge rollout — 2026-08-28

### Delivery and installed runtime

- Pull request 24 merged as `62acd4c`. Canonical `main` fast-forwarded to that
  merge before release staging.
- The exact merged source rebuilt and ad-hoc signed the standalone runtime.
  Plugin Creator cache-busted the staged personal source to
  `0.2.0+codex.20260828211031`; validation and standalone help passed before
  replacement. The prior source moved to recoverable Trash quarantine
  `u1-print-studio-personal-source-20260828T211017Z`.
- `codex plugin add u1-print-studio@personal` installed and enabled the new
  version. Source, stage, and cache executables share SHA-256
  `74f5f654de2a52c21a33577ffd6520f1054eb71439668885986114177faa2398`;
  the installed executable passed `codesign -vvv --verify`.
- Exact installed `doctor --offline --json` reported runtime 0.2.0, tool schema
  3, camera widget v2, valid owner configuration, explicit STUN, fixed
  read-only operations, MCP Apps signaling, and disabled external widget fetch.

### Installed-cache and real-printer read-only evidence

- The exact installed standalone MCP listed model-visible
  `show_u1_status`, `get_u1_status`, and `open_printer_camera`; app-only frame,
  stream open, answer, ICE, and close helpers; and status-v4/status-v3 plus
  camera-v2/camera-v1 resources. Camera-v2 read as 30,282 bytes.
- Calling the old `open_u1_camera_stream` shape with empty arguments returned an
  MCP error and allocated no session. A current app-only frame call then minted
  an activation and returned a 135,547-byte real JPEG. Consuming the activation
  produced one bounded MCP Apps offer with one ICE server; explicit Close
  returned true. No token, session ID, credential, or SDP was printed.

### Service restart and edge verification

- Only the existing `com.scottchu.u1-print-studio` and
  `com.scottchu.u1-print-studio-dashboard` LaunchAgents were restarted. Both
  returned to `running`.
- Loopback public health and dashboard health returned runtime 0.2.0, tool
  schema 3, and camera widget v2. Public standard-HTTPS health returned the same
  contract. Public enrollment returned 404, unauthenticated MCP returned 401,
  private dashboard camera and widget returned 200, and private enrollment
  health returned 200.
- OAuth state SHA-256 was
  `91072185057645f9fa776714b354638b2e4e5855ef48553c1dcaf5244c5a7df0`
  before and after restart. Tailscale Serve/Funnel JSON SHA-256 was
  `7dac599f0a80ff45802a7812dda5b67ac2042bc9f66121d18968a83c15d5eebe`
  before and after restart. No OAuth, passkey, enrollment, LaunchAgent plist, or
  Tailscale configuration was replaced.

### Private browser evidence and remaining gates

- The deployed private camera dashboard displayed a real Snapshot. One Go Live
  click passed the browser-rendered-frame gate and reported `Live · 24 FPS`.
  Close returned the same widget to Snapshot.
- A later user screenshot of that still-deployed decision-0019 direct path
  showed Snapshot, an incorrect immediate Fallback label during roughly three
  seconds of ordinary ICE setup, and then rendered `Live · 28 FPS`. This is
  additional real evidence that the current direct private path can render; it
  is not decision-0020 fan-out acceptance. The source widgets now retain the
  snapshot while labeling this pre-frame state `Connecting` and reserve
  Fallback for an actual terminal failure or timeout. That UI repair remains
  source-only until a later authorized rollout.
- This proves the private dashboard host, real-printer read-only path, current
  widget activation, rendered live media, and UI Close on this machine. It does
  not prove mounted Codex/ChatGPT, mobile, a real TURN allocation, or arbitrary
  network traversal; those require fresh separate tasks.
- No upload, start, pause, resume, cancel, G-code, generic proxy, Control, or
  Admin action ran.

## Decision 0020 camera fan-out source validation — 2026-08-28

### Acceptance and safety boundary

- Camera v3 is the only current focused descriptor. Every explicit
  `open_printer_camera` call produces a fresh presentation ID; camera v2 and v1
  read the same current camera-only asset.
- The connector owns one private H264 upstream and independent bounded
  downstream viewers. Printer signaling and identity never cross the inbound
  MCP/HTTP boundary. Each viewer has separate ICE credentials and Close; final
  viewer release closes the upstream.
- This is static/software and simulated-protocol evidence. No installed plugin,
  LaunchAgent, OAuth/passkey/enrollment state, Tailscale route, public service,
  real printer, mounted host, mobile client, or TURN server was contacted or
  changed.

### Commands and results

From `plugins/u1-print-studio/app`:

- `bun install --frozen-lockfile`: passed with 152 installs across 146 packages
  and no lockfile change.
- `bun run check`: passed TypeScript.
- `bun test src/*.test.ts`: passed 81 tests with 513 assertions across 12 files.
- `bun run bundle`: passed; emitted a 2.72 MB `stdio.js`, 33.73 KB camera asset,
  and 57.45 KB status asset from 588 modules.
- `bun run bundle:runtime`: passed; compiled and ad-hoc signed the standalone
  validation runtime.

From the repository root:

- `./plugins/u1-print-studio/app/dist/u1-print-studio --help`: passed and
  reported the shared setup, doctor, and MCP commands.
- `codesign -vvv --verify
  ./plugins/u1-print-studio/app/dist/u1-print-studio`: reported valid on disk
  and satisfied its designated requirement.
- The standalone runtime was invoked through `env -i PATH=/usr/bin:/bin` for
  `--help`, two `setup` calls against temporary loopback origins, and
  `doctor --offline --json`. The second setup preserved the explicit fixture
  STUN URL, doctor reported schema 4/camera-v3 with
  `printerObservation: skipped-offline`, and the temporary schema-2 config was
  mode `0600`. No Bun executable or printer access was used on that invocation
  path; the temporary config was removed after validation.
- Plugin Creator `validate_plugin.py` through `uv run --no-project --with
  pyyaml`: passed for `plugins/u1-print-studio`.
- Skill Creator `quick_validate.py` through the same `uv` boundary passed for
  all four plugin skills: mobile setup, monitor, prepare, and authorized start.
- `./scripts/check-repository.sh`: passed, including TypeScript and all 81 tests
  with 513 assertions; final output was `repository contract: ok`.
- `git diff --check`: passed.

### Regression evidence

- Fan-out fixtures prove two viewers share one upstream, receive different
  downstream ICE credentials, close independently, and release the upstream
  only after the final close. Capacity, 15-second unanswered cleanup, upstream
  termination, and opaque HTTP ticket session IDs are bounded.
- Runtime fixtures prove viewer capacity defaults to 16 and rejects values
  outside 1 through 64. Only Tailscale CGNAT/IPv6 interface addresses are added
  as explicit downstream host candidates.
- The concrete adapter is H264-only, uses the exact negotiated codec/profile,
  creates a dedicated forwarding track per viewer, and clones each RTP packet
  header. No VP8 or transcoding path is advertised.
- The exact HTTP adapter accepts only a branded
  `server-terminated-fanout` session store. MCP and HTTP sentinel tests exclude
  printer hostname/IP/MAC/device/peer identity, upstream SDP/ICE/credentials,
  and raw upstream failures from public responses.
- Status/tool/camera service fields use closed vocabularies. JPEG regression
  tests remove APP0-APP15, COM, and trailing identity metadata before widget
  `_meta`. Widget/dashboard failures use allowlisted public diagnostics.
- Widget regressions prove an activation-time frame refresh retains the
  existing snapshot as `Connecting`, not Fallback, in both camera-only and
  status widgets. Both wait for a rendered frame before Live and enter Fallback
  only through an explicit failure or the bounded no-frame timeout.
- Final finisher review replaced public status/frame object spreads with exact
  field projections. The privacy regression injects unexpected host, MAC,
  route, and peer fields and proves they are absent alongside known-field and
  JPEG sentinels. TypeScript, all tests, both bundles, standalone/offline
  smoke, plugin/skill validators, the repository contract, and whitespace were
  rerun after that repair.

### Unverified later layers

- No real U1 H264 offer was terminated by `werift`; codec/profile compatibility
  and sustained packet forwarding remain unverified on hardware.
- The 28 FPS screenshot belongs to the deployed direct-session predecessor and
  does not prove the server-terminated fan-out or camera-v3 state machine.
- No two real viewers, camera-v3 mounted host, tailnet-direct mobile candidate
  selection, real STUN path, or TURN allocation was observed.
- The bundled `werift` dependency adds no separate user install, but owner
  license selection and third-party notice review remain publication gates.
- No release cache-buster, install, service restart, merge, push, or public
  rollout occurred in this validation.

## Decision 0020 independent media-core repair validation — 2026-08-29

### Acceptance and safety boundary

- This follow-up addresses independent review findings without changing the
  accepted connector-termination, camera-v3, read-only, or printer-identity
  privacy boundary.
- Software evidence must show downstream PLI feedback reaches the shared
  upstream receiver without amplification, the first RTP payload type selects
  one exact H264 fmtp, and peers that terminate during async opening never enter
  the active session store.
- All checks remained local and offline. No printer, installed plugin,
  LaunchAgent, OAuth/passkey/enrollment state, Tailscale route, public edge,
  mounted host, mobile client, STUN endpoint, or TURN endpoint was contacted or
  changed.

### Commands and results

From `plugins/u1-print-studio/app`:

- `bun install --frozen-lockfile`: passed with 152 installs across 146 packages
  and no change.
- `bun run check`: passed TypeScript.
- `bun test src/camera-fanout.test.ts`: passed 10 tests with 67 assertions.
- `bun test src/*.test.ts`: passed 87 tests with 547 assertions across 12
  files.
- `bun run bundle`: passed from 588 modules; emitted a 2.73 MB `stdio.js`,
  33.73 KB camera asset, and 57.45 KB status asset.
- `bun run bundle:runtime`: passed, compiled the standalone runtime, and
  applied its validation-only ad-hoc signature.

From the repository root:

- The standalone runtime passed `--help` and `codesign -vvv --verify`.
- Through `env -i PATH=/usr/bin:/bin`, the standalone runtime completed two
  `setup` calls against a temporary loopback fixture and `doctor --offline
  --json`. The rewrite preserved explicit STUN, the config mode was `0600`, and
  doctor reported schema 4/camera-v3 with `printerObservation:
  skipped-offline`. The temporary config was removed.
- Plugin Creator `validate_plugin.py` passed through `uv run --no-project
  --with pyyaml` for `plugins/u1-print-studio`.
- Skill Creator `quick_validate.py` passed through the same `uv` boundary for
  all four plugin skills: mobile setup, monitor, prepare, and authorized start.
- `./scripts/check-repository.sh`: passed, including TypeScript and all 87 tests
  with 547 assertions; final output was `repository contract: ok`.
- `git diff --check`: passed.

### Regression evidence

- A concrete werift adapter fixture negotiates two H264 payload types and sends
  the first RTP packet on the second. The downstream source preserves that
  payload type and its exact profile/fmtp; duplicate or non-H264 mappings fail
  closed.
- Two concrete downstream sender PLI events produce one immediate and one
  coalesced upstream receiver PLI. Closing the first viewer unsubscribes only
  its feedback path; the second viewer continues requesting keyframes and is
  not closed. The production interval is 500 ms.
- Deferred fixtures terminate the upstream while `openViewer` is awaiting and
  return a viewer that already terminated during its awaited open. Explicit
  generations/alive rechecks reject both, release leases, and close the shared
  upstream once.
- Invalid SDP and `sendAnswer` failure fixtures prove track and first-RTP event
  subscriptions return to baseline. A direct 60-second track wait cancellation
  also removes its subscription immediately rather than retaining its timer.

### Unverified later layers

- A real U1 may use different H264 payload/fmtp behavior; real receiver PLI,
  sustained fan-out, peer failure, and reconnect remain unobserved.
- No real two-viewer playback, mounted camera-v3 host, iPhone/mobile path,
  tailnet-direct ICE selection, real STUN traversal, H264 browser decode, or
  TURN allocation is accepted by these fixtures.
- The deployed direct private-path screenshot remains evidence only for the
  decision-0019 predecessor. It does not accept this fan-out repair.
- No push, merge, release staging, install, service restart, route/auth change,
  or printer control occurred.
