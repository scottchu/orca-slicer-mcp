# Project state

Last updated: 2026-08-30

## Baseline

- Canonical repository: `scottchu/orca-slicer-mcp` (private).
- Product boundary: Orca Preparation and Printer Operations are peer
  subsystems joined by an explicit prepared-job/print-session handoff.

## Active iteration

- Iteration: `docs/iterations/2026-08-23-f0-dual-subsystem-foundation/`.
- Roadmap milestone: F0 — Dual-environment and contract discovery.
- User-directed execution order: integrate PR27 with the focused-widget PR28,
  validate and independently review, merge, and deliver decision 0022's
  persistent personal HTTP services. The user authorizes the installed/server
  rollout, not Mac login/power changes, printer controls, or route/auth changes.
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
  `0.2.0+codex.20260828194545` is installed. The public service and private
  dashboard were restarted from merged source without changing Tailscale
  routing.
- Decision 0019 is the active user-authorized workflow repair.
  `open_printer_camera` is the only model-visible camera command and links
  `camera-v2.html`; v1 remains readable as a compatibility alias. A current
  widget must mint a one-time private activation before stream allocation, and
  unanswered offers release their lease after 15 seconds. Health exposes tool
  schema 3 and camera widget v2 for rollout coherence.
- Pull request 24 merged decision 0019 as `62acd4c`. Personal Marketplace
  version `0.2.0+codex.20260828211031` is installed from that merge with
  runtime SHA-256
  `74f5f654de2a52c21a33577ffd6520f1054eb71439668885986114177faa2398`.
  Both existing U1 LaunchAgents run schema 3/camera-v2. OAuth state and
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
  until the focused module set is accepted. No installed or live runtime has
  this source contract yet.

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
- current `observation-v2.html` and `camera-v4.html` resources, an
  `observation-v1.html` current-asset alias, and exact frozen legacy status
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
recorded in the active iteration. All evidence is static/software or fixture
only; install, service restart, public edge, real-printer observation, mounted
Codex/ChatGPT, and mobile remain later evidence gates.
PR27's separate tree passed 93 tests with 569 assertions. The combined baseline
passed TypeScript and 105 tests with 606 assertions before persistence changes.
The implemented focused-route/shared-store slice passes TypeScript and 110
tests with 759 assertions, stdio/runtime bundles, and local signature checks.
The lifecycle CLI passes 19 local fixture tests. Independent final review
approved the combined source with no blocking findings and verified the
repository contract plus isolated bundled health/static readiness with zero
synthetic printer reads. Merge/install/live rollout remain separate evidence.

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
- No live process, LaunchAgent, Serve/Funnel route, OAuth state, installed
  plugin, printer, or external service was changed.

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

The current source reports runtime `0.3.0`, tool schema `5`, observation widget
`observation-v2`, and camera widget `camera-v4`. `show_u1_status` and
`get_u1_status` are superseded model intents and survive only as app-only
compatibility aliases. Frozen status-v4/status-v3 and camera-v3/v2/v1 resources
remain byte-identical for retained tasks. Earlier installed-runtime records
describe schema 4/camera-v3 and a three-visible/five-app-only inventory;
reverify actual installation during the authorized rollout rather than treating
historical records as evidence for this source surface.

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
  distribution, live rollout, or Mac boot/login/sleep acceptance.
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
  camera versions are `0.3.0`, `5`, `observation-v2`, and `camera-v4`.
- Local browser fixture review at a roughly 589 by 844 viewport accepted the
  focused Progress, Thermals, Heads, and separate Camera presentations. Captures
  were not added to the repository.
- PR27 adds regressions for exclusive standalone-camera guidance, fail-closed
  stale-host behavior, plugin starter prompts, and full host-process reload.
- The macOS arm64 standalone runtime builds, verifies under an ad-hoc local
  signature, prints help, writes a schema-2 `0600` config, preserves explicit
  STUN on setup rewrite, and passes `doctor --offline` without contacting
  hardware. Malformed ICE URLs and partial TURN configuration fail closed.
- Personal Marketplace staging and installation passed on this macOS arm64
  machine for decision 0020 as version
  `0.2.0+codex.20260830013924`. Both existing services report schema 4 and
  camera-v3. That is installed-runtime and service evidence, not mounted-host,
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

- Post-merge read-only validation contacted the configured printer for status,
  one JPEG, and bounded H264 offers. No upload, start, pause, resume, cancel,
  G-code, or other printer-control action ran.
- Earlier authorized print and camera observations remain historical evidence
  in their dated logs and do not prove this slice.

### User outcome

- The last recorded installed runtime is decision 0020 schema 4/camera-v3.
  Its first mounted attempt retained a stale host descriptor and incorrectly
  substituted a status card; installed/service health is not mounted acceptance.
- The focused Progress, Thermals, Heads, and Camera layouts passed local browser
  fixture review only. A new mounted task, live normalized values, overview,
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
  already-running desktop host. Camera-v3 acceptance requires fully quitting
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

Commit and merge decision 0022's validated, independently approved lifecycle
and focused-route/store slice through
PR28, then perform the user-authorized installed/server rollout. Preserve all
OAuth state and Serve/Funnel routes and the separate task's canonical-checkout
dirty documentation. Mac automatic login and power changes are deferred.
Browser control is currently unavailable; static HTTP success does not accept
visual rendering. Mounted focused widgets, live mappings, two-viewer fan-out,
mobile ICE, and overview composition remain separate evidence gates.
