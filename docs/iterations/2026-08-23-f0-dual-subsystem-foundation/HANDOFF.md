# F0 dual-subsystem foundation handoff

## 2026-08-26 local-first rollout handoff

The user changed the execution order to the local-first open-source U1 Print
Studio rollout. Decision 0016 is accepted and partially supersedes decision
0015: the hosted MCP App now carries offer, answer, ICE candidates, and close
through the MCP Apps `tools/call` bridge. The widget contains no direct
`fetch(` call and declares empty external CSP domains. The exact HTTP signaling
adapter remains only for the standalone developer dashboard.

The smallest end-to-end desktop-local slice is implemented:

- `u1-print-studio setup`, `doctor`, and `mcp` form one onboarding/runtime
  contract for future Marketplace, Homebrew, and npm adapters;
- setup writes a `0600` versioned config and accepts only private, link-local,
  loopback, or `.local` printer origins without credentials or proxy paths;
- the connector invokes fixed read-only status, snapshot, and WebRTC signaling
  operations through the U1 Printer Operations adapter;
- the application service owns opaque sessions, peer-ID hiding, bounded offer,
  answer, per-call and cumulative ICE candidates, concurrency, expiry, abort,
  failure teardown, and idempotent close;
- snapshot fallback, read-only annotations, and the 1200 by 1500 PNG contract
  remain intact;
- `.mcp.release.json` starts a staged standalone executable without Bun or an
  env file, while `.mcp.json` remains the source developer adapter;
- `PACKAGING.md` records one setup/doctor path, current macOS arm64 evidence,
  and the unimplemented signing, notarization, cross-platform, update, and
  rollback gates.

The runtime contains exactly four model-visible read-only tools and three
app-only read-only signaling helpers as listed in `PROJECT_STATE.md`. It adds no
upload, start, pause, resume, cancel, G-code, generic proxy, Control, or Admin
tool.

Changed implementation paths are under `plugins/u1-print-studio/app/`, plus
the plugin release manifest, packaging contract, architecture/requirements,
decision 0016, and continuity records. See the branch diff for the exact set.

Validation is local-only. Forty-seven tests with 271 assertions currently pass,
the standalone macOS arm64 runtime runs without Bun, and offline setup/doctor
smoke passed without hardware access. Exact final commands and repository
checks are recorded in `VALIDATION.md`.

No physical printer, installed plugin, marketplace, OAuth state, package
registry, Homebrew tap, or hosted service was accessed or changed. Earlier
printer, Funnel, OAuth, and installed-plugin entries below are historical
evidence, not instructions for the normal-user path.

Unresolved risks are production signing/notarization, cross-platform artifacts,
channel installation/upgrade/rollback, the platform-`curl` dependency, and
fresh mounted-host WebRTC rendering. The private repository also has no license
file, so owner license selection and third-party notice review block any claim
or publication of an open-source distribution. Real-host or printer testing
requires new explicit authorization and must remain a separate evidence layer.

The next smallest action after review is either a reproducible unpublished
signed macOS packaging fixture or removal of the platform-`curl` runtime
dependency, selected from current evidence. Do not return to Tailscale/OAuth as
the normal path and do not publish or contact hardware.

## Historical iteration handoff

## Current status

The product contract remains one product with two peer subsystems: Orca
Preparation and Printer Operations. A redacted LAN Fluidd/Moonraker target,
read-only status, WebSocket transport, snapshots, and H264 WebRTC have been
observed for
Printer Operations. Upstream OrcaSlicer `2.4.2` and Snapmaker Orca `2.3.5`
were inspected locally. A later user-authorized Snapmaker U1 pilot sliced two
parts and completed a PETG print after substantial CLI debugging. Two later PLA
jobs also reached telemetry-verified completion. The repo-local plugin contains
four thin workflow skills and a read-only MCP Apps status-view prototype. No
preparation, control, or persistent-monitor runtime exists, and Snapmaker Orca
is not yet an accepted product backend. The remote read-only prototype now adds
a bounded WebRTC camera presentation through an application service; MCP,
exact signaling HTTP, and the printer adapter remain separate layers. An opt-in
status dashboard now mounts the exact production widget and emulates only its
read-only bridge calls on loopback port 8788. Private Tailscale Serve HTTPS
exposes it to the tailnet on port 8444; it is not a public dashboard or
real-host rendering evidence.

## Completed work

- independent product and architecture agents audited the old single-boundary
  framing;
- decision 0003 supersedes decision 0001 while preserving its history;
- authoritative records are aligned to the peer-subsystem model;
- repository contract, shell syntax, whitespace, link, and terminology checks
  pass;
- independent product and architecture reviewers passed the repaired contract;
- decisions 0004 through 0006 separate API surfaces, keep MCP replaceable, and
  define hybrid snapshot-plus-subscription monitoring;
- the ontology and monitoring model define runtime-neutral ports, freshness,
  connection epochs, and a possible later Elixir monitor daemon;
- read-only Moonraker status, temperature, object, auth, webcam, and WebSocket
  evidence is recorded without issuing a command or G-code;
- repository contract, shell syntax, whitespace, Markdown links, and current
  terminology checks pass after reconciliation onto `ba18104`.
- hosted repository validation was removed; required checks run locally before
  delivery.
- the current execution order moved to Orca Preparation discovery after the
  user's redirect; this does not make Printer Operations secondary;
- `docs/orca-preparation-findings.md` records executable fingerprints, CLI and
  macOS limitations, profile precedence, Snapmaker boundaries, collaborative
  preview, and manual-support representations;
- requirements now bind visual review to exact backend and artifact revisions
  and distinguish support settings, enforcer or blocker volumes, facet paint,
  and designed breakaway geometry.
- `docs/logs/2026-08-23-snapmaker-orca-u1-petg-print-pilot.md` preserves the
  later pilot chronology, crash exits, recovered `T2` mapping, artifact hash,
  and distinct upload/start/observed-completion evidence;
- `docs/knowledge/snapmaker-orca-cli-preparation.md` now incorporates only the
  repeatable lessons from the PETG pilot and two PLA repetitions.
- `docs/logs/2026-08-25-snapmaker-u1-pla-print-repetitions.md` records two PLA
  jobs, including object-level wall overrides, physical-to-logical tool
  mapping, bed-type loss, direct-3MF coordinate failure, and adaptive end-of-job
  monitoring. Both reached telemetry-verified completion; the first was
  physically accepted and the second awaits handling.
- decision 0007 and `plugins/u1-print-studio/` implement the user's revised
  order as three thin skills plus a concise Markdown status fallback;
- decision 0008 and
  `docs/logs/2026-08-25-u1-status-view-prototype.md` record the later explicit
  request for a read-only HTML status view before a shared CLI;
- the plugin now includes an MCP Apps server with `show_u1_status` and
  `get_u1_status`, a camera-first HTML/CSS widget, adaptive refresh, WebRTC
  `Go Live` and `Close`, PiP, and fullscreen. TypeScript, HTTP MCP, stdio MCP,
  current telemetry, and widget resource metadata passed local validation.
- the render tool now advertises both the standard MCP Apps resource URI and
  the OpenAI compatibility output template on its descriptor. Four integration
  and widget-contract tests pass, and the refreshed installed bundle plus both
  camera endpoints passed read-only smoke checks.
- decision 0009 replaces direct private-LAN media loading with a self-contained
  widget and read-only `get_u1_camera_frame` relay. Ten tests with 52
  assertions pass, and a bundled stdio smoke returned a valid real JPEG data
  URL after bounded retry.
- the same widget now has dynamic mobile viewport sizing, iOS safe-area support,
  44-pixel touch targets, compact breakpoints, and host intrinsic-height
  notification. Cross-device MCP connectivity and actual iOS rendering remain
  separate evidence.
- the cache-busted installed plugin
  `0.2.0+codex.20260825142747` passed descriptor, resource, current status, and
  real relayed-camera stdio smoke checks; the installed frame was a valid
  148,142-byte JPEG data URL kept in widget-private metadata.
- a later mounted card reported offline even though read-only probes from the
  laptop reached the configured private-LAN Moonraker status and webcam routes.
  The current thread exposed only the two older tools, identifying a stale
  in-thread MCP process rather than a current LAN outage;
- one real snapshot took 12.9 seconds, so the relay now uses bounded 20-second
  and 10-second attempts under a 40-second MCP tool budget. Twelve tests with
  54 assertions enforce the updated contract;
- the synchronized personal-marketplace source and exact installed cache
  `0.2.0+codex.20260825144906` passed validation. Its stdio smoke listed all
  three tools, returned reachable `complete` telemetry, and relayed a valid
  149,695-byte JPEG in private metadata.
- decision 0010 adds a personal-developer mobile boundary: the HTTP MCP service
  binds loopback and personal OAuth protects the single `u1.monitor` scope with
  authorization code, PKCE, dynamic-registration allowlisting, audience-bound
  tokens, and a user-verified passkey. Moonraker remains private.
- decision 0011 records the observed ChatGPT failure against an otherwise
  healthy `:8443` Funnel endpoint and moves the personal connection to standard
  HTTPS. Exact U1 paths route to loopback while the existing root service stays
  intact. It also keeps self-hosted versus hosted production distribution open.
- the intended iPhone passkey was enrolled and its one-time enrollment file was
  removed. Public health and OAuth metadata return successfully, while an
  unauthenticated public MCP request returns HTTP 401 with the expected
  protected-resource challenge.
- before decision 0014, after the user completed the corrected standard-port
  connection, the host exposed exactly the then-current three read-only tools
  and an authenticated
  `show_u1_status` call returned fresh `complete` telemetry at 100% (188/188),
  with inactive fully consumed storage, no exception, parked tools, and zero
  heater targets. Phone layout and relayed-camera rendering remain visual
  checks rather than inferred outcomes.
- decision 0012 adds a portable 1200 by 1500 PNG status projection to remote
  `show_u1_status` results for Codex hosts that do not mount MCP Apps
  components. It uses the same normalized observation as the widget, exposes
  no URL or control, and at that stage left local stdio plus remote refresh
  data-only. Decision 0014 later supersedes the local exclusion. A
  live complete observation was rendered and visually inspected locally;
  Codex-mobile display remains a user-visible check.
- after the first phone rendering was visually accepted, the user asked for a
  slightly larger presentation. The fallback now uses a portrait 2-by-2 metric
  layout and larger pixel type so the host can devote more vertical space to it
  on a phone without changing the data or safety contract.
- decision 0013 records why that previously working connection later failed:
  its 15-minute access token expired and the personal authorization server had
  issued no refresh token. Public health, OAuth discovery, and the MCP challenge
  remained healthy, isolating the failure to renewal rather than Funnel, MCP,
  or printer reachability.
- the authorization server now issues 30-day rotating refresh tokens bound to
  the client, exact MCP resource, and `u1.monitor` scope, persists only derived
  lookup hashes, rejects sequential and concurrent replay, and cannot expand
  scope. Version-1 state migrated in place while preserving the signing key,
  registered clients, and enrolled passkey; an owner-only dated backup was made
  outside the repository before the service restart.
- the repaired public endpoint advertises both `authorization_code` and
  `refresh_token`, continues to return the expected unauthenticated HTTP 401 MCP
  challenge, and at that stage exposed no additional tools or printer controls.
  The plugin was
  reinstalled as `0.2.0+codex.20260825234015`. Existing pre-repair host links
  must reconnect once. The user confirmed the repaired connection works
  immediately; successful host renewal after more than 15 minutes remains
  pending user-visible evidence.
- `docs/u1-print-studio-plugin-architecture.md` maps the current package,
  transports, OAuth boundary, observation adapter, presenters, MCP fields, and
  read-only runtime slice to the stable domain ontology. It explicitly records
  that the prototype still calls its observation adapter directly rather than
  implementing the planned application use case and persistent monitor ports.
- an earlier synchronized and installed plugin was
  `0.2.0+codex.20260825211428`. Its repository, personal-source, and installed
  bundles share SHA-256
  `6dfa78e49bbf81775ca3e62bd518f7399fff1a2c494583aae4032cc5f3e9c49d`;
  an installed-cache stdio smoke preserved the then-current three-tool
  inventory and text-only local render result.
- the plugin now includes `u1-mobile-status-setup`, which discovers each user's
  Tailscale MagicDNS hostname, preserves unrelated Funnel handlers, guides
  phone passkey enrollment and desktop Developer mode, verifies the exact
  four-tool remote read-only inventory, and keeps all control actions out of
  setup.
- decision 0015 supersedes the serial-JPEG live transport from decision 0014.
  The application service still owns one-time tickets, leases, concurrency,
  and duration; `u1-status` now performs allowlisted WebRTC signaling; the HTTP
  adapter serves only exact `POST`/`DELETE /media/camera.webrtc`; and H264 media
  flows through the browser peer connection.
- the remote HTTP MCP surface conditionally adds
  `open_u1_camera_stream`. Its one-time URL exists only in result `_meta`; the
  widget calls it once per `Go Live` intent and retains the old snapshot loop
  only as fallback. Local stdio remains a three-tool surface because it has no HTTPS
  media endpoint.
- the concurrent local PNG contract is preserved: every `show_u1_status` result
  carries the 1200 by 1500 PNG, while `get_u1_status` stays data-only.
- 29 tests with 144 assertions pass. The repository, synchronized personal
  source, and installed cache validate at
  `0.2.0+codex.20260826005742`; their stdio bundle hashes match.
- the live personal service now runs from the synchronized plugin source with
  OAuth state preserved. The exact `/media` Funnel handler was added without
  changing the unrelated root or existing OAuth/MCP handlers. Public missing
  ticket and unknown-path checks return 401 and 404 respectively.
- a bounded real-printer relay observation delivered two complete validated
  JPEGs over one multipart response in a final 2.6-second run. This proves the source,
  application iteration, and adapter path together, not mounted desktop or iOS
  rendering.
- the current branch passes 35 tests with 174 assertions after adding the
  status dashboard. `bun run dashboard` serves it on loopback, while
  `bun run dashboard:tailscale` derives a validated private MagicDNS HTTPS
  origin for the existing Serve listener. The normal service returns 404 for
  `/dashboard`, the dashboard service returns 404 for `/mcp`, and port 8444
  must never be Funnel-enabled.
- a real-printer smoke through private Tailscale Serve HTTPS on port 8444
  returned reachable status with camera available and delivered two multipart
  JPEG parts over the one-time relay in 1.42 seconds. No image was saved, and
  the unavailable in-app browser means visual layout quality remains
  unverified.
- the latest widget refinement replaces visible live, close, and automatic
  refresh labels with accessible icon controls, adds an icon camera-state
  indicator, keeps the grid above snapshot and continuous imagery, and gives
  camera, status/progress, each metric, and freshness independent skeleton
  states. Source, TypeScript, plugin, loopback, and private-HTTPS checks pass;
  no connected browser was available for visual inspection.
- the camera indicator is now deliberately neutral: its state dot, slash,
  pulse, and state-dependent colors are gone. The lower descriptive camera
  caption is replaced by a bottom-right mode chip for timestamped `Snapshot`,
  `Snapshot fallback`, or `Live` with the configured `up to 15 FPS` ceiling.
  Thirty-six tests with 185 assertions, TypeScript, bundling, plugin validation,
  the repository contract, and the currently served private widget source pass.
  Browser visual inspection is still pending because no browser runtime was
  connected.
- the card now uses the user-selected Snapmaker U1 palette: charcoal and warm
  white surfaces, yellow identity accents, orange paused or attention states,
  and red faults. The existing layout and read-only behavior are unchanged.
  Thirty-seven tests with 192 assertions, TypeScript, bundling, plugin
  validation, the repository contract, and private HTTPS source checks pass.
  `design-qa.md` remains blocked because no browser-rendered implementation
  screenshot was available for comparison with the supplied reference.
- the camera overlay now places presentation status on the left and the
  live/close icon on the right. Snapshot and snapshot-fallback states show a
  red disconnected-camera icon; live shows a pulsing green dot. Live FPS is no
  longer copied from the configured ceiling: the widget parses relayed JPEG
  frames and reports the observed presentation rate over a rolling five-second
  window. The exact one-time relay smoke delivered four frames at about 1.4 FPS.
  The official Snapmaker U1 stylesheet established the identity tokens
  (`#1c1e20`, `#1f1f1f`, `#242424`, `#ffcd00`, `#ff5f28`, and warm whites),
  while green and red remain separate semantic colors. Thirty-eight tests with
  207 assertions, TypeScript, bundling, and inline widget parsing pass; final
  plugin and repository checks are recorded in `VALIDATION.md`.

## Changed paths

See the branch diff. Repository guidance, Orca discovery, environment, scope,
architecture, roadmap, requirements, open questions, continuity records, the
read-only plugin runtime, and active iteration evidence are in scope. No user
model, private profile, generated G-code, printer address, or printer command is
included.

## Unresolved risks

- the first product Orca backend is unselected; one Snapmaker Orca path worked,
  but repeatability, synthetic fixtures, GUI parity, support round-trip,
  estimates, and deterministic behavior remain untested;
- the pilot printer is a Snapmaker U1; remaining environment details are
  unknown;
- no reusable profile resolver, crash preflight, manifest generator, or G-code
  semantic validator exists;
- the observed `wipe_tower_filament` exit `139` and incomplete-filament tool
  collapse have not yet been reproduced with clean non-user negative fixtures;
- the current LAN client is trusted by Moonraker, so product authorization and
  network boundaries remain unresolved;
- WebSocket transport works, but object subscription, reconnect, and freshness
  behavior remain unverified;
- camera reliability, lighting, and final lowered-bed visibility remain
  environment-dependent despite one usable in-progress PLA frame;
- no connected browser was available for this run, so host-rendered snapshot,
  relayed preview, close behavior, PiP, fullscreen, and adaptive refresh are
  unverified;
- the same conversation could not hot-reload the refreshed plugin metadata and
  exposed `show_u1_status` only through a programmatic wrapper, which returned
  text but did not mount the MCP App. A new conversation remains required for
  direct component validation;
- Bun and Node direct local-network sockets failed on this macOS host while the
  bounded system-curl adapter worked; portability remains unknown;
- the local stdio plugin is desktop-local. The selected personal Funnel and
  OAuth backend now supports rotating refresh tokens, and the remote result
  carries an inline image fallback. The repaired connection now works
  immediately, but a successful status call after more than 15 minutes remains
  required to prove host renewal. Interactive camera rendering remains
  separately unverified visual evidence;
- the snapshot endpoint was intermittently slow. One bounded retry recovered a
  packaged real-frame smoke, and one later frame took 12.9 seconds. The longer
  bounded relay now passes installed-cache transport checks, but repeated
  live-preview reliability is not yet host-validated. A provisional 3+3-second
  continuous-source budget failed to produce the two-frame proof and was
  replaced by the established 20+10-second bounded policy;
- the current Codex conversation retains a stale pre-reinstall three-tool MCP
  surface. It cannot prove the newly deployed remote four-tool inventory or
  mounted continuous relay; use a fresh thread and keep iOS visual evidence
  separate;
- manifest shape, compatibility checks, and upload/start ownership are open;
- multiple physical jobs completed, but product implementation, repeatable workflow,
  protocol, safety, and general user-outcome acceptance remain pending.
- the latest PLA job is telemetry-complete, but its output has not been handled
  and the final lowered-bed camera frame did not show the parts.

### Actual WebRTC live transport

- The old multipart snapshot loop and exact `/media/camera.mjpeg` route are
  removed from the live path. Snapshot acquisition remains only for explicit
  snapshot mode and degraded fallback.
- The widget now uses a receive-only browser `RTCPeerConnection`, a real
  `<video autoplay muted playsinline>` surface, printer keepalive responses,
  offer/answer/ICE signaling, and actual browser-presented frame counting.
- The live dashboard returned a private-ID-free H264 offer through the exact
  one-time signaling route. A separate decoder reached `connected` and received
  frames over the persistent peer connection; samples varied from 0.2 to 24.8
  FPS and therefore do not establish native-browser FPS.
- The protected service and private dashboard were restarted from synchronized
  source. Public old-MJPEG returned 404, invalid WebRTC ticket returned 401,
  and the private dashboard returned 200.
- TypeScript, 38 tests with 222 assertions, bundle, plugin validation,
  repository checks, and diff whitespace validation passed. Mounted browser
  playback remains the user-visible acceptance gate because no browser-control
  connection was available.
- The automatic-refresh button no longer renders a separate dot; enabled and
  paused behavior and accessible labels are unchanged.

## Next smallest action

Reload the private dashboard and verify the native browser's `Live` state and
measured FPS, then start a fresh authenticated host thread and verify the exact four-tool remote
inventory. If the component mounts, invoke `Go Live` once and separately record
continuous rendering, snapshot fallback if exercised, `Close`, PiP, fullscreen,
and iOS behavior. Also repeat `show_u1_status` after the access-token lifetime
to close the real-host renewal gate. Then resume synthetic non-user dry-slice
and negative fixtures. Do not expose Moonraker or build a shared CLI merely
because the manual commands exist.

## Restart instructions

Follow `NEXT_AGENT.md` and decisions 0003 through 0015. Do not infer that one
subsystem is secondary from the current execution order, and do not implement
or issue consequential actions before F0 discovery establishes the relevant
contracts.
