# Project state

Last updated: 2026-08-31

## Baseline

- Canonical repository: `scottchu/orca-slicer-mcp` (private).
- Product boundary: Orca Preparation and Printer Operations are peer
  subsystems joined by an explicit prepared-job/print-session handoff.

## Active iteration

- Current source slice: decision 0023's user-requested quiet footers,
  image-only camera overlay/display controls, and bounded host-loading repair.
  Source commit `db4e250` is pushed and delivered in
  [draft PR30](https://github.com/scottchu/orca-slicer-mcp/pull/30).
  Independent formal review approves the source-only change with no unresolved
  findings. Initial source delivery is complete. The user then explicitly
  authorized isolated headless-browser validation, now completed against
  synthetic observations/media; actual mobile-host and deployment acceptance
  remain separate. The three screenshot-grounded follow-up fixes and evidence
  are committed and pushed as `643b5dd`; they are not deployed.
  Independent formal review now approves the headless follow-up with no new
  findings, and scoped visual QA passes. Delivery through existing draft PR30
  is complete; the source delivery check verified its open draft head at
  `643b5dd`, matching the remote branch.
  Source reports runtime `0.3.1`, schema `5`, observation-v3/camera-v5;
  observation-v2/v1 and camera-v4 remain current aliases, and all previously
  frozen legacy bytes remain unchanged. Two model-visible/eight app-only
  read-only tools are unchanged; ten resource URIs preserve compatibility.
  This source has not been installed or deployed. The deployed release facts
  below remain historical installed evidence, not this slice's acceptance.
- Progress, extruder/bed thermals, physical heads, and limited current-job
  fields are mapped. Queue, fans, bed mesh, cavity, material/color, and history
  remain unmapped or unknown; their cards are not implemented data capabilities.
  Decorative thermal waves and bed-mesh cells were removed. A strict synthetic
  host reproduced incorrect observation initialization and missing metadata
  hydration; source fixes add an awaited request handshake, full-envelope
  hydration, finite loading failure/retry, and retained stale refresh feedback.
  This does not establish the exact cause of the user's phone screenshot.
- Isolated headless validation captured 67 observation and 22 camera cases,
  passed 13 camera behavior checks plus three keyboard/unavailable checks,
  and found no horizontal overflow or console errors on the final assets.
  Independent screenshot review identified three bounded P2 fixes: active
  thermal numbers now use ink color, footer warnings have contrasting
  light/dark colors, and Jobs uses reader-facing copy instead of internal
  availability/normalization terminology. The final source gate passes
  134 app tests/939 assertions, 21 lifecycle tests, all bundles and signature
  verification. See `design-qa.md` for the independent visual disposition.
  Synthetic browser/media behavior is not mounted ChatGPT iPhone, real
  printer, or deployed-version acceptance; those remain unclaimed.
- Existing private focused URLs serve the previously deployed runtime 0.3.0;
  `/dashboard` redirects to progress, not a composed overview. Static HTTP
  success proves route availability only, not missing-domain mappings or
  deployment of this PR. No private hostname is retained here.

- Iteration: `docs/iterations/2026-08-23-f0-dual-subsystem-foundation/`.
- Roadmap milestone: F0 — Dual-environment and contract discovery.
- PR28 merged the focused widgets, PR27 routing integration, and decision-0022
  persistence slice as `2160492a4ce63d1409673786ea02b253d7cfaace`.
  The user authorized the installed/server rollout, not Mac login/power changes,
  printer controls, or route/auth changes.
- Personal Marketplace version `0.2.0+codex.20260831033612` is installed from
  that merge. Source, stage, and installed standalone runtime match SHA-256
  `c4029f18678e1839c0b005e37bc7401bf84bcc6ed7ef3d19155286253c2f018b`;
  all production HTML and five skill folders match, including
  `$u1-observe-printer`. Plugin and ad-hoc signature validation pass. Prior
  personal source remains in recoverable local Trash; no source/cache was
  edited by hand and the base plugin version remains `0.2.0`.
- Decision 0022 reuses the two existing owner LaunchAgents with versioned
  bundled HTTP releases and a release-local pinned Bun copy. Stable private focused routes default
  to progress. One observation store is shared across HTTP requests within
  each process; separate services/stdio and process restarts remain separate
  state scopes. Implementation and rollout evidence are tracked below and in
  the active iteration, not inferred from this accepted design.
- Decision 0017 adds a private enrollment listener plus explicit STUN and
  short-lived TURN REST boundaries while preserving decision 0016's local-first
  normal-user direction and MCP Apps signaling bridge.
- Pull request 20 merged the mounted-app compatibility repair as `4d4ea2f`.
  Its status-v3/status-v4 compatibility boundary remains in the current
  installed runtime.
- Decision 0018 accepts a dedicated snapshot-first camera presentation:
  `open_printer_camera` links `camera-v1.html`, while WebRTC allocation and
  follow-up signaling are app-only widget actions. Pull request 22 merged as
  `333bebe`; Personal Marketplace version
  `0.2.0+codex.20260828194545` was installed then. The public service and private
  dashboard were restarted at that stage without changing Tailscale
  routing.
- Decision 0019 records the earlier user-authorized workflow repair.
  `open_printer_camera` is the only model-visible camera command and links
  `camera-v2.html`; v1 remains readable as a compatibility alias. A current
  widget must mint a one-time private activation before stream allocation, and
  unanswered offers release their lease after 15 seconds. Health exposes tool
  schema 3 and camera widget v2 for rollout coherence.
- Pull request 24 merged decision 0019 as `62acd4c`. Personal Marketplace
  version `0.2.0+codex.20260828211031` was installed from that merge with
  runtime SHA-256
  `74f5f654de2a52c21a33577ffd6520f1054eb71439668885986114177faa2398`.
  Both existing U1 LaunchAgents then ran schema 3/camera-v2. OAuth state and
  Tailscale routing hashes were unchanged across restart. The deployed private
  dashboard showed Snapshot, rendered `Live · 24 FPS`, and returned to Snapshot
  after Close.
- Decision 0020 merged through pull request 26 as `4f9041c`. It replaces direct
  printer-to-viewer sessions with one private server-terminated H264 upstream
  and bounded independent downstream peers. Camera v3 is a fresh repeated-open
  camera-only resource; v2 and v1 remain current-asset aliases. Public
  envelopes use closed vocabularies, strip JPEG metadata, and exclude printer
  identity and upstream signaling. Independent media-core review additionally
  requires exact first-RTP H264 payload/profile selection, rate-limited shared
  upstream PLI feedback, async termination cleanup, and level-triggered
  rejection of werift peers already failed/closed before observer registration.
  Personal Marketplace version `0.2.0+codex.20260830013924` was rebuilt from
  the merge and installed; both existing services restarted on schema 4 and
  camera-v3 without changing OAuth state or Tailscale routing.
- A fresh conversation in the still-running pre-install Codex Desktop process
  did not expose `open_printer_camera`. The model selected the monitoring skill
  and substituted `show_u1_status`, mounting the entire status card. That is a
  stale host-process descriptor plus a procedural-routing regression, not
  evidence that the rebuilt camera-v3 resource contains status markup. PR27,
  merged as `473e482`, requires standalone camera requests to call only
  `open_printer_camera` and fail closed when it is unavailable; a full host quit
  and relaunch remains required for mounted acceptance.
- Decision 0021 is implemented in the current source slice. The user selected
  720-pixel Instrument Strips, rejected a giant machine map, and requires camera
  as its own focused strip. Exactly `observe_printer`, with the closed views
  `overview`, `progress`, `thermals`, `heads`, `jobs`, `queue`, `fans`, and
  `bed_mesh`, plus `open_printer_camera` are the two model-visible presentation
  intents. Every non-camera view projects one shared normalized observation.
  `$u1-observe-printer` is the single procedural skill routing natural language
  to that surface. Focused progress, thermals, heads, and camera presentations
  passed local browser-fixture review; overview remains intentionally deferred
  until the focused module set is accepted. PR28 and the installed plugin now
  carry this contract; live and mounted acceptance are separately recorded.

## Implemented local-first slice

The repository contains the smallest desktop-local read-only connector slice:

- one shared `u1-print-studio setup`, `doctor`, and `mcp` CLI contract;
- owner-only versioned configuration accepting only private, link-local,
  loopback, or `.local` printer origins with no credentials, query, fragment,
  or proxy-shaped path;
- fixed-route status, snapshot, and `webrtc-camerastreamer` operations behind
  the U1 Printer Operations adapter;
- one shared observation store: after initial acquisition, plain reads are cache-only, explicit refreshes
  call the upstream adapter only when due, concurrent refreshes coalesce, and a
  failed refresh retains last reachable values as stale with their source time;
- focused observation and camera MCP Apps widgets with empty external CSP
  domains and no direct `fetch` call;
- current `observation-v3.html` and `camera-v5.html` resources,
  observation-v2/v1 and camera-v4 current-asset aliases, and exact frozen legacy status
  v4/v3 and camera v3/v2/v1 bytes for retained tasks;
- selected-module projections for progress, thermals, and heads; unsupported or
  not-yet-mapped domains remain explicit `unknown`/`unavailable`, and overview
  remains deferred rather than reconstructing the retired large card;
- hosted offer, answer, ICE-candidate, and close signaling through MCP Apps
  `tools/call`;
- application-owned opaque WebRTC sessions with offer/answer/candidate size
  limits, per-call and cumulative candidate budgets, duration, expiry,
  concurrency, failure teardown, answer idempotency, and idempotent close;
- snapshot fallback and the existing 1200 by 1500 PNG status result;
- one release MCP manifest pointing to a staged standalone executable;
- one documented Marketplace/Homebrew/npm packaging contract around the same
  runtime and onboarding path;
- an ephemeral macOS arm64 executable that embeds its widget, disables
  automatic dotenv/bunfig loading, and runs without a Bun executable at
  runtime.

The pre-integration decision-0021 source validation passed with 101 tests and
594 assertions, TypeScript, both bundles, ad-hoc signature verification, plugin and
skill validation, the repository contract, and whitespace checks. Browser
fixture review accepted the focused Progress, Thermals, Heads, and Camera
presentations at a narrow inline viewport. Exact hashes and commands are
recorded in the active iteration. That pre-integration evidence is static or
fixture-only; post-merge installed/service evidence is recorded separately.
PR27's separate tree passed 93 tests with 569 assertions. The combined baseline
passed TypeScript and 105 tests with 606 assertions before persistence changes.
The implemented focused-route/shared-store slice passes TypeScript and 110
tests with 759 assertions, stdio/runtime bundles, and local signature checks.
Before rollout, the lifecycle CLI passed 19 local fixture tests. Independent
pre-rollout review approved the combined source with no blocking findings and verified the
repository contract plus isolated bundled health/static readiness with zero
synthetic printer reads. Post-merge rollout evidence is recorded separately.

The post-merge rollout exposed an asynchronous `bootout` race during a real
controlled restart after initial installation had passed. Public service was
recovered explicitly. The subsequent CLI-only repair waits for exact-label
removal before restart, bounded to 30 seconds, and passes 21 lifecycle tests
with independent approval. It does not change deployed app revision `2160492`.
Post-repair controlled restart and dashboard-only SIGTERM/KeepAlive recovery
passed independently. Both services report loaded, healthy, integrity-verified
runtime `0.3.0`, schema `5`, observation-v2, and camera-v4. Static paths and
public/private rejection checks pass; private env/OAuth/config/routes and
preserved plist fields are unchanged. This is tested local service recovery,
not Mac reboot/login/sleep or mounted-browser acceptance.

The self-contained artifact remains locally and ad-hoc signed and is not
suitable for publication. No Homebrew or npm package was published.

## Implemented secure remote source slice

- Public personal OAuth and Streamable HTTP MCP require standard HTTPS and
  `u1.monitor`; public passkey enrollment routes return 404.
- A separately configured enrollment origin binds a distinct loopback-only
  listener with private health and exact enrollment routes. It stays bound
  after enrollment while enrollment itself returns 404.
- ICE defaults empty. Explicit bounded STUN may come from HTTP env or the
  standalone owner-only schema-2 config; setup preserves STUN on later rewrites.
- Preferred remote TURN uses bounded URLs plus a server-only shared secret.
  The printer upstream and every downstream viewer derive separate
  `expiry:nonce` usernames and base64 HMAC-SHA1 credentials. Only a viewer's
  credential enters its widget-private metadata.
- The HTTP server keeps env-only deployment compatibility when no standalone
  config exists. An existing malformed optional config and partial TURN
  configuration fail closed.
- These source-level contracts do not themselves establish a live outcome;
  post-merge installed/service checks are recorded separately below and in the
  active iteration.

## Current source MCP surface

Model-visible read-only tools:

1. `observe_printer`, requiring `overview`, `progress`, `thermals`, `heads`,
   `jobs`, `queue`, `fans`, or `bed_mesh`
2. `open_printer_camera`

App-only read-only tools:

1. `refresh_printer_observation`
2. `show_u1_status` (legacy alias)
3. `get_u1_status` (legacy alias)
4. `get_u1_camera_frame`
5. `open_u1_camera_stream`
6. `answer_u1_camera_stream`
7. `add_u1_camera_ice_candidates`
8. `close_u1_camera_stream`

There is no upload, start, pause, resume, cancel, G-code, generic proxy,
Control, or Admin tool in the runtime. Preparation and authorized-start skills
remain procedural guidance; they are not runtime authority.

The current source reports runtime `0.3.1`, tool schema `5`, observation widget
`observation-v3`, and camera widget `camera-v5`. `show_u1_status` and
`get_u1_status` are superseded model intents and survive only as app-only
compatibility aliases. Frozen status-v4/status-v3 and camera-v3/v2/v1 resources
remain byte-identical for retained tasks. The current installed plugin has the
same schema-5 tools, but remains observation-v2/camera-v4 until a separately
authorized rollout. Historical schema-4/camera-v3 records below describe
earlier deployments, not the current plugin.

## Packaging and onboarding boundary

- Personal HTTP lifecycle is implemented by `scripts/u1_service.py`: stage a
  clean committed source, dry-run/install one versioned release, report status,
  start/stop/restart the two allowlisted services, and rollback by snapshot ID.
  The default owner-only state root is `~/Library/Application Support/U1 Print
  Studio/service`. Releases include a copied `bin/bun`, bundled HTTP entry,
  exact assets, empty bunfig, and hash/version manifest. The original Bun path
  can change without removing the release copy. Explicit private env is
  preserved; ambient dotenv/bunfig loading and relative auth/config paths are
  rejected before service replacement. See `plugins/u1-print-studio/PACKAGING.md`
  for exact CLI syntax. This personal adapter does not establish public
  distribution or Mac boot/login/sleep acceptance. Post-merge local rollout
  evidence remains a separate layer from these source fixtures.
- Normal users do not need Tailscale, MagicDNS, public DNS, manual OAuth,
  environment-file editing, or Bun.
- `plugins/u1-print-studio/.mcp.release.json` starts
  `./app/runtime/u1-print-studio mcp`.
- `plugins/u1-print-studio/.mcp.json` remains a Bun and env-file source
  adapter for repository development only.
- The owner-only schema-2 config is the standalone path for optional explicit
  STUN because the packaged runtime does not load the repository `.env`.
- Marketplace, Homebrew, and npm are future delivery adapters. This slice does
  not claim installation, upgrades, rollback, signing, notarization, or
  cross-platform acceptance.
- The current printer adapter still invokes the platform `curl` executable
  with a fixed route and argument allowlist. Replacing that platform dependency
  remains an explicit runtime-hardening question.
- Tailscale Serve/Funnel, personal OAuth, and the exact
  `/media/camera.webrtc` adapter remain optional developer compatibility
  paths, never normal-user requirements.

## Capability state

### Orca Preparation

- Upstream OrcaSlicer `2.4.2` and Snapmaker Orca `2.3.5` were observed on
  macOS; the first supported backend remains unselected.
- One user-authorized Snapmaker Orca U1 PETG pilot and two PLA repetitions are
  recorded in `docs/logs/`. Those runs do not establish a reusable
  preparation runtime.
- Model/project intake, profile resolution, slicing, artifact validation,
  review bundles, and prepared-job manifests remain unimplemented product code.

### Preparation-to-operations handoff

- The prepared-artifact/manifest schema is not defined.
- Target compatibility, upload ownership, start ownership, and
  printer-job/session correlation remain open.

### Printer Operations

- The read-only U1 observation, focused projection, snapshot, PNG, and camera
  signaling slice is implemented.
- One in-process observation store preserves freshness, connection epochs, and
  stale last-reachable values across explicit, due, coalesced refreshes. Plain
  presentation reads after initial acquisition do not contact the printer;
  a cold `current()` still bootstraps one acquisition on demand.
- Persistent subscription monitoring, process-restart persistence, durable
  history, notifications, recommendations, and control are not implemented.
- Jobs history, queue, fans, bed mesh, cavity, filament material/color, and
  sensor mappings remain unknown until separately evidenced against live
  read-only data.

## Acceptance state

### Static/software

- TypeScript checks pass.
- Before integration, 101 tests with 594 assertions passed across the prior camera,
  security, packaging, and dashboard boundaries plus exact two-visible/eight-
  app-only tool visibility, view-enum closure, selected-module projection,
  explicit-refresh coalescing, stale retention, provenance, and current/frozen
  resource compatibility.
- The source stdio bundle emits `stdio.js` plus current observation/camera and
  frozen legacy status/camera widget assets. Runtime, tool, observation, and
  current source camera versions are `0.3.1`, `5`, `observation-v3`, and `camera-v5`.
- Earlier local browser fixture review at a roughly 589 by 844 viewport accepted the
  focused Progress, Thermals, Heads, and separate Camera presentations. Captures
  were not added to the repository. That review predates decision 0023 and
  does not accept the present polish; the new visual gate remains blocked.
- PR27 adds regressions for exclusive standalone-camera guidance, fail-closed
  stale-host behavior, plugin starter prompts, and full host-process reload.
- The macOS arm64 standalone runtime builds, verifies under an ad-hoc local
  signature, prints help, writes a schema-2 `0600` config, preserves explicit
  STUN on setup rewrite, and passes `doctor --offline` without contacting
  hardware. Malformed ICE URLs and partial TURN configuration fail closed.
- Current Personal Marketplace staging and installation passed on this macOS
  arm64 machine as `0.2.0+codex.20260831033612` from PR28. A fresh independent
  MCP client verifies exactly two model tools, eight app-only helpers, and all
  eight resource hashes. This is installed-runtime evidence, not mounted-host,
  mobile, or real multi-viewer fan-out acceptance.

The active iteration's `VALIDATION.md` is authoritative for exact commands
and final repository-check results.

### Protocol/simulator

- Tests use in-memory MCP transports, loopback HTTP fixtures, and fake printer
  signaling. They prove contract behavior, not public routing, a TURN
  allocation, a real printer, or a mounted host.
- Earlier repository evidence records real read-only Moonraker and H264
  observations. It is not evidence for this newly composed local connector.

### Physical printer

- Current post-repair bounded read-only checks returned reachable progress and
  thermals with one shared observation version/source time. Cavity remained
  unknown. One valid JPEG snapshot returned without activation, live video, or
  printer control. This is telemetry/snapshot evidence, not print-quality,
  physical safety, or mounted rendering acceptance.
- Earlier post-merge read-only validation contacted the configured printer for status,
  one JPEG, and bounded H264 offers. No upload, start, pause, resume, cancel,
  G-code, or other printer-control action ran.
- Earlier authorized print and camera observations remain historical evidence
  in their dated logs and do not prove this slice.

### User outcome

- The current installed plugin carries schema 5/observation-v2/camera-v4.
  Earlier host attempts retained a stale descriptor and substituted a status
  card; the new installed descriptor check is not mounted-widget acceptance.
- The focused Progress, Thermals, Heads, and Camera layouts passed local browser
  fixture review only. A new mounted task, remaining live domain mappings, overview,
  mobile behavior, and the user's quick-comprehension feedback loop remain
  unverified outcomes.

## Open risks and F0 questions

- Distribution targets, Developer ID signing, notarization, checksums, upgrade,
  rollback, and cross-platform packaging are unresolved.
- The private repository has no license file; license selection and
  third-party notice review block any claim or publication of an open-source
  distribution.
- The system-`curl` dependency and macOS local-network permission behavior
  need a dedicated portability decision.
- Native hosted-widget WebRTC rendering, FPS, UI-triggered Close, PiP,
  fullscreen, and fallback need fresh visual host evidence. Server-side open
  and close now pass against the real read-only camera path.
- Creating a new conversation does not refresh an MCP process retained by an
  already-running desktop host. Current camera acceptance requires fully quitting
  and relaunching that host; procedural guidance now fails closed instead of
  substituting a status card when `open_printer_camera` is absent.
- No TURN REST service URLs or shared secret were supplied. Reliable remote
  media remains blocked on external provisioning plus observed allocation and
  mounted playback. Explicit STUN is only a compatibility step and discloses
  peer network metadata to its provider.
- The deployed route uses tailnet-only Serve 8447 to loopback 8789; Funnel is
  still enabled only on 443 and existing handlers were preserved.
- The first Orca backend and the prepared-job/session handoff remain open.
- Live mappings remain unresolved for cavity, filament material/color and
  sensors, jobs/history, queue, fans/purifier, and bed mesh. Those views must
  remain honest `unknown`/`unavailable` until read-only adapter evidence exists.
- The overview remains deferred until every focused module is accepted, and a
  fresh mounted task plus the user's ten-second comprehension gate remain open.
- Subscription transport, process-restart persistence, durable history,
  notification destination, and remote identity/distribution boundaries remain
  open. The implemented store is explicit-refresh application state, not a
  resident monitor.
- A browser peer connection may receive network candidates in SDP as required
  for media; the prohibited behavior is direct iframe URL fetching or
  signaling, not the negotiated read-only WebRTC media path preserved by
  decision 0015.

## Next action

Decision 0023 source commit `db4e250` has independent source-only approval and
is delivered in draft PR30. The authorized isolated headless pass is now
complete, with independent follow-up approval and scoped visual QA passing.
The three bounded fixes and evidence are pushed as `643b5dd` through existing
draft PR30. Next obtain separate authorization for merge/rollout, followed by actual
mounted iPhone acceptance of snapshot/live/fallback/fullscreen/PiP. Do not
install, restart services, mutate OAuth/routes, or implement missing data
domains as an implicit extension of this presentation change. The persistence
delivery actions below are historical and must not be repeated for this slice.

Deliver the independently validated CLI race repair and accurate rollout
records through a follow-up PR; controlled restart and KeepAlive recovery pass.
After that follow-up merges, fully reload the host and obtain user visual
acceptance of focused widgets, then scope the remaining unknown live mappings.
PR28 and installed app revision `2160492` are already delivered. Preserve all
OAuth state and Serve/Funnel routes and the separate task's canonical-checkout
dirty documentation. Mac automatic login and power changes are deferred.
Browser control is currently unavailable; static HTTP success does not accept
visual rendering. Mounted focused widgets, live mappings, two-viewer fan-out,
mobile ICE, and overview composition remain separate evidence gates.
