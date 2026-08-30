# F0 dual-subsystem foundation handoff

## 2026-08-27 mounted-app recovery rollout

Pull request 20 merged the compatibility-resource repair as `4d4ea2f`.
Personal Marketplace version `0.2.0+codex.20260827215815` is installed from a
validated standalone arm64 executable. The exact installed-cache MCP smoke
listed and read identical v4 and v3 widget resources, retained exactly four
model-visible plus three app-only read-only tools, observed the configured
printer, obtained a JPEG and camera offer, and explicitly closed the session.
The prior personal source remains recoverable from Trash.

The public service was restarted after merge. Existing authenticated OAuth MCP
calls still return fresh status and JPEG metadata; public health is 200,
unauthenticated MCP is 401, public enrollment is 404, and private enrollment
health is 200. No OAuth replacement was required.

The private 8444 dashboard 502 was a separate process-supervision failure, not
an MCP, printer, or camera failure. A dedicated owner LaunchAgent now supervises
the loopback dashboard listener. Its first start exposed a missing Tailscale CLI
directory in the restricted `PATH`; that was repaired and re-bootstrapped.
Both the local listener and private HTTPS dashboard now return 200. A live
dashboard bridge smoke produced a 981-byte SDP offer with one ICE server and
then closed the bounded session. Existing Tailscale public, private, and
unrelated handlers were preserved.

The remaining acceptance gate is visual, not server-side: no browser-control
surface was connected, so visible playback, FPS, UI-triggered Close, PiP,
fullscreen, and mounted Codex/ChatGPT behavior are not accepted. Use a fresh
task after plugin upgrade, then reload the private dashboard and invoke Go Live
once. Keep snapshot and signaling evidence separate from visible playback
evidence.

## 2026-08-27 mounted-app recovery follow-up

The screenshots exposed three independent states: an old Codex task retained a
pre-upgrade local MCP snapshot, the registered remote connection requested the
old `status-v3.html` URI, and the optional private `:8444` dashboard had no
process listening behind its Serve route. The current installed standalone
binary exists, has a valid ad-hoc signature, resolves from the plugin-root cwd,
and starts from a clean environment; no machine-specific absolute command was
added.

At the pre-merge source stage, branch `scottchu/fix-u1-app-loading` kept current
descriptors on `status-v4.html` and registered `status-v3.html` as a
compatibility resource serving the exact same self-contained widget and empty
external CSP. Packaging and app documentation now require a new task after
installation or upgrade and explain that the standalone dashboard is
separately supervised. The monitor skill now describes the actual MCP Apps
signaling bridge rather than a stale relay-URL path.

TypeScript, 61 tests with 329 assertions, both bundles, compiled-resource smoke,
signature verification, plugin validation, both touched skill validators, and
whitespace checks pass. No printer command, control tool, live route change,
OAuth mutation, or mounted-host success is claimed by this source validation.

## 2026-08-27 secure remote Monitor handoff

The user changed execution order to the secure remote U1 Print Studio Monitor
slice. Decision 0017 is accepted for this slice and preserves decision 0016's
local-first normal-user direction. Source now keeps standard-HTTPS public OAuth
and Streamable HTTP MCP while moving passkey enrollment to a distinct
loopback-only listener intended for a tailnet-only Tailscale Serve origin.

The public runtime retains exactly four model-visible read-only tools and three
app-only read-only helpers. Public enrollment always rejects. A configured
private enrollment origin requires a distinct loopback port and stays healthy
after an existing credential suppresses enrollment. ICE defaults empty;
explicit STUN is available from HTTP env or the standalone owner-only config,
and robust remote use prefers per-session RFC5766 TURN REST credentials derived
from a server-only secret.

Implementation paths include `camera-ice-config.ts`, OAuth/server enrollment
composition, schema-2 local configuration and CLI setup, WebRTC offer handoff,
tests, decision/requirements/architecture records, packaging/app documentation,
and the mobile setup skill. Exact validation is in `VALIDATION.md`: TypeScript,
60 tests with 324 assertions, source and standalone bundles, offline standalone
STUN-preservation smoke, skill/plugin validation, repository checks, code
signature verification, and whitespace checks pass.

No live service, LaunchAgent, Tailscale route, OAuth state, installed plugin,
printer, or external service was changed. Public-edge, private Serve, TURN,
printer, mounted ChatGPT/Codex, and user-outcome evidence remain unclaimed.

The next action requires coordinator approval and external TURN provisioning.
Before deployment, capture the existing Serve/Funnel and LaunchAgent state,
choose an unused private Serve HTTPS port plus distinct loopback enrollment
port, and obtain TURN REST-compatible URLs/shared secret. Stage the executable
and owner config without replacing OAuth state. Restart only the exact U1
service; verify both loopback listeners first. Preserve every public handler,
keep public `/auth` mapped to the rejecting backend, add only the new private
Serve handler with Funnel disabled, and compare routing with the saved state.
Then verify public discovery/401/enrollment rejection, private health/enrollment
state, exact four-plus-three authenticated inventory, explicit STUN if chosen,
a real TURN allocation, and mounted playback separately in ChatGPT and Codex.
Rollback restores the prior runtime/env and removes only the newly added private
Serve handler. Do not deploy, merge, publish, or claim host success from this
handoff alone.

## 2026-08-26 local-first rollout handoff

The user changed the execution order to the local-first open-source U1 Print
Studio rollout. Decision 0016 is accepted and partially supersedes decision
0015: the hosted MCP App now carries offer, answer, ICE candidates, and close
through the MCP Apps `tools/call` bridge. The widget contains no direct
`fetch(` call and declares empty external CSP domains. The exact HTTP signaling
adapter remains only for the standalone developer dashboard.

Delivery is pull request https://github.com/scottchu/orca-slicer-mcp/pull/15
on branch `scottchu/local-first-rollout`.

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

Validation is local-only. Forty-nine tests with 275 assertions currently pass,
the standalone macOS arm64 runtime runs without Bun, and offline setup/doctor
smoke passed without hardware access. Exact final commands and repository
checks are recorded in `VALIDATION.md`.

Independent pre-merge review also verified that rewriting an existing config
tightens its permissions to `0600` and that a valid camera signaling session ID
is retained before stream-envelope validation so malformed responses still
take the bounded close path.

No physical printer, installed plugin, marketplace, OAuth state, package
registry, Homebrew tap, or hosted service was accessed or changed. Earlier
printer, Funnel, OAuth, and installed-plugin entries below are historical
evidence, not instructions for the normal-user path.

That boundary applies to the pre-merge rollout. After merge, the user explicitly
authorized a same-machine personal Marketplace install and read-only test.
Version `0.2.0+codex.20260827152101` installed with the staged standalone
runtime; live doctor reached the configured printer, and installed-cache MCP
smoke verified status, snapshot, WebRTC offer, and explicit close without any
printer control. Mounted Codex host rendering remains unverified because the
current task cannot hot-reload a reinstalled plugin.

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

## Secure remote deployment — 2026-08-27

Pull request 18 merged as `e298885`. Personal Marketplace version
`0.2.0+codex.20260827202019` is installed with a source/stage/cache runtime hash
recorded in `VALIDATION.md`. The owner config is schema 2 and `0600` with one
explicit STUN URL. OAuth state was preserved across reload.

The public service is standard HTTPS and authenticated; health is 200, public
enrollment is 404, and unauthenticated MCP is 401. A separate loopback
enrollment listener is exposed only through tailnet Serve 8447. Its health is
200 and its MCP, OAuth-token, media, widget, and enrolled-state enrollment
routes are 404. Funnel remains enabled only on 443 and all prior handlers were
preserved.

The exact installed runtime verified four model-visible plus three app-only
read-only tools, reachable status, a 124,642-byte JPEG observation, H264 offer,
one configured ICE server, and explicit session close. The printer offer still
contained only host candidates. No browser surface was connected and no TURN
service was supplied, so mounted playback and robust arbitrary-network media
remain open evidence gates.

## Next smallest action

Start a fresh authenticated Codex or ChatGPT task so it loads the cache-busted
plugin. Invoke `open_printer_camera`, verify the camera-only resource mounts,
then record snapshot, Go Live, continuous rendering, Close, and fallback if
exercised. Test mobile separately. If host-only ICE fails, provision an
owner-approved TURN REST service and verify a real relay allocation before
retrying. Do not expose Moonraker or add printer controls.

## Camera-only presentation source slice — 2026-08-28

Decision 0018 separates user intent from transport. The model-visible
presentation tool is now `open_printer_camera`; it reads one snapshot and links
`ui://u1-print-studio/camera-v1.html` without allocating a WebRTC session.
`open_u1_camera_stream` moved to app-only visibility beside answer, ICE, and
close, leaving exactly four model-visible and four app-only read-only tools.

The new camera-only resource reuses the current status widget camera section
markup exactly. It retains the same 16:9 surface, grid overlay, loading
skeleton, camera icon, mode pill, icon-only Go Live/Close controls, snapshot,
live FPS, and fallback presentation without the printer status/progress body.
The exact same HTML is mounted by the explicitly composed
`/dashboard/camera` host; ordinary server mode returns 404 for both focused
routes.

Independent review found that the first implementation treated `ontrack` as
rendering success. The accepted implementation gates Live on the first browser-
rendered video frame. Playback rejection, eight seconds without a first frame,
track termination, stall, video error, connection failure, or prolonged
disconnect closes the bounded session and activates the 1500 ms snapshot
fallback. Review also found and resolved one stale three-helper statement.

Source validation passes with 69 Bun tests and 398 assertions, TypeScript,
plugin/skill validation, runtime bundle, ad-hoc signature verification,
repository contract, and whitespace checks. A private loopback source
dashboard then obtained a real snapshot, rendered live video at an observed
23 FPS, and returned to snapshot after Close. This proves the private test host
and real-printer read-only path on this machine only.

### Post-merge installation and deployed private test

Pull request 22 merged as `333bebe`. Personal Marketplace version
`0.2.0+codex.20260828194545` was release-staged and installed. Source, personal
stage, and installed runtime SHA-256 were
`b7c0151f01faaddf57aba04f884819ebef92c3254cdae74a09c7c88416af5be1`.
The replaced personal source remains recoverable from Trash at
`u1-print-studio-personal-source-20260828T195024Z`.

The exact installed-cache MCP client listed four model-visible and four
app-only tools, listed `camera-v1.html`, and read its 29,785-byte embedded
camera resource. Canonical `main` fast-forwarded to the merge, and the existing
public and private dashboard LaunchAgents restarted from the merged source.
Public health, private `/dashboard/camera`, and private `/camera-widget`
returned 200. The Tailscale Serve/Funnel configuration hash was identical
before and after restart.

The deployed private dashboard displayed a real snapshot, reached an actually
rendered `Live · 25 FPS`, and returned to snapshot after Close. The in-app
browser remains open on that private test page for user inspection. Mounted
Codex/ChatGPT playback still requires a fresh task; fallback under an actual
failure, mobile playback, and a real TURN allocation remain open.

## 2026-08-28 camera workflow repair source handoff

Decision 0019 addresses the stale-descriptor and leaked-lease failure observed
across ChatGPT, Codex, and the optional public/private services. The current
source exposes three model-visible read-only tools, with
`open_printer_camera` as the only camera action. `get_u1_camera_frame` and the
four signaling calls are app-only widget helpers.

Go Live now obtains one widget-private, one-time activation from the frame
helper and must consume it when opening the WebRTC session. An empty, replayed,
expired, or fabricated stream call fails before printer signaling or lease
allocation. A successfully opened offer that is not answered within 15 seconds
aborts and releases its lease automatically. Answered sessions retain bounded
duration, failure teardown, and explicit idempotent Close.

The focused resource is now `camera-v2.html`; `camera-v1.html` remains a
compatibility alias serving the exact current asset. `/health` and standalone
`doctor --json` expose runtime 0.2.0, tool schema 3, and camera widget v2 so a
rollout can distinguish process liveness from version coherence.

Static/software validation passes with TypeScript, 71 Bun tests and 417
assertions, both bundles, ad-hoc signature verification, plugin validation,
both touched skill validators, the repository contract, and whitespace checks.
No live service, OAuth state, Tailscale route, installed plugin, printer, or
mounted host was changed during this source gate. Delivery and each later
evidence layer must be recorded separately.

## Camera workflow repair post-merge rollout

Pull request 24 merged as `62acd4c`. The exact merge commit rebuilt the
standalone runtime and release-staged Personal Marketplace version
`0.2.0+codex.20260828211031`. Source, personal stage, and installed cache share
SHA-256
`74f5f654de2a52c21a33577ffd6520f1054eb71439668885986114177faa2398`.
The prior personal source is recoverable from Trash at
`u1-print-studio-personal-source-20260828T211017Z`.

Offline installed doctor reports runtime 0.2.0, tool schema 3, camera widget
v2, explicit STUN, fixed read-only operations, and disabled external widget
fetch. The exact installed MCP client listed three model-visible tools and five
app-only helpers, listed status v4/v3 plus camera v2/v1, rejected the stale
empty stream call without allocation, obtained a real 135,547-byte JPEG,
opened one bounded offer with one ICE server through a current activation, and
explicitly closed it.

The existing public and private dashboard LaunchAgents restarted from merged
source. Public and loopback dashboard health both report schema 3/camera-v2.
Public enrollment is 404, unauthenticated MCP is 401, private dashboard camera
and widget are 200, and private enrollment health is 200. OAuth state SHA-256
remained
`91072185057645f9fa776714b354638b2e4e5855ef48553c1dcaf5244c5a7df0`;
Tailscale Serve/Funnel status remained
`7dac599f0a80ff45802a7812dda5b67ac2042bc9f66121d18968a83c15d5eebe`.

The deployed private in-app browser showed a real Snapshot, passed the actual
rendered-frame gate at `Live · 24 FPS`, and returned to Snapshot after Close.
Mounted Codex/ChatGPT and mobile still require fresh tasks and are not inferred
from private-dashboard success. No printer control or route/auth mutation ran.

## Restart instructions

Follow `NEXT_AGENT.md` and decisions 0003 through 0020. Do not infer that one
subsystem is secondary from the current execution order, and do not implement
or issue consequential actions before F0 discovery establishes the relevant
contracts.

## Decision 0020 camera fan-out source handoff — 2026-08-28

The current feature worktree implements decision 0020 without changing the
installed plugin or any live process. `open_printer_camera` now links the
camera-v3 camera-only resource, marks repeated presentation intent as
non-idempotent, and returns a fresh opaque presentation ID. Camera v2 and v1
remain readable aliases. The full status render tool explicitly excludes
camera-only requests.

The runtime terminates one H264 printer WebRTC peer privately with bundled
pure-TypeScript `werift` and fans cloned encoded RTP packets into dedicated
downstream tracks. Each viewer receives a server-owned offer, separately issued
ICE credentials, discovered Tailscale host candidates, a 15-second answer
deadline, bounded lease/candidate budgets, and independent Close. Viewer count
defaults to 16 and is bounded from 1 through 64 by
`U1_CAMERA_MAX_VIEWERS`. The last viewer releases the only printer upstream.
The optional exact HTTP adapter accepts only a branded server-terminated fan-out
store and cannot be wired to the old direct printer session implementation.

Public status and camera envelopes use closed state/error/capability
vocabularies. JPEG APP0-APP15, COM, and trailing metadata are removed. Sentinel
tests exclude printer host/IP/MAC/device identity, Moonraker/camera routes,
upstream SDP/candidates/peer IDs/tickets/credentials, and raw upstream errors
from MCP and HTTP results. Visible widget diagnostics show only ICE mode,
candidate types/protocol, and allowlisted fallback reasons.

Final finisher review also replaced the remaining public status/frame object
spreads with exact field projections, so newly added or unexpected adapter
fields fail closed instead of silently entering MCP or dashboard results.
Current architecture, packaging, app, project-state, and restart records now
describe connector-terminated media and distinct upstream/viewer credentials
consistently. All four plugin skills and the plugin package validate.

A user screenshot of the still-deployed decision-0019 direct private path
showed Snapshot, a misleading immediate Fallback label during about three
seconds of ordinary ICE negotiation, and then rendered `Live · 28 FPS`. Both
source widgets now keep the retained snapshot in `Connecting` until the first
rendered frame and enter Fallback only after a terminal failure or timeout. The
screenshot is direct-path evidence only; neither it nor this source-only UI fix
accepts the new fan-out runtime.

Local static/software and simulated-protocol checks are recorded in
`VALIDATION.md`. No real printer, live service, installed plugin, OAuth state,
Tailscale route, mounted ChatGPT/Codex host, mobile viewer, or TURN allocation
was changed or accepted. The next delivery step is independent review and a
pull request from the validated branch commits; post-merge
install/restart requires fresh authorization.

## Decision 0020 independent media-core repair — 2026-08-29

Independent review blocked the first fan-out commit on four concrete media
core gaps. The follow-up keeps the same privacy and product boundary while:

- subscribing every downstream sender's picture-loss indication to one shared
  upstream receiver PLI bridge, coalesced and rate-limited to 500 ms;
- choosing the exact H264 fmtp by the first received RTP payload type and
  rejecting duplicate or unsupported mappings;
- binding every viewer reservation to an explicit live upstream generation and
  rejecting upstream/viewer termination during awaited opening or insertion;
- making track and first-RTP waits cancellable, with timers and event listeners
  removed on invalid SDP, signaling failure, success, timeout, or close.

Concrete werift adapter tests use two H264 payload types with the second one
received, two viewer PLI sources, and deferred termination/failure fixtures.
The final full suite and repository validators are recorded in
`VALIDATION.md`. No live deployment, service, route, OAuth state, installed
plugin, printer, mobile client, or TURN endpoint was contacted or changed.

Targeted re-review then found one remaining concrete-adapter race: a werift
peer could already be terminal before `onTerminated` registration and emit no
later event. The adapter now subscribes first, synchronously inspects current
connection state, invokes termination at most once, and returns an idempotent
unsubscriber. Actual-factory regressions cover an already-failed upstream and
an already-closed viewer; neither is published and both clean up fully.

## Decision 0021 composable observation design handoff — 2026-08-29

The user selected the Instrument Strips direction for the first shared
human-agent observation feedback loop. The target is a family of focused
720-pixel read-only widgets, not a giant machine map. Camera is a separate
focused strip in the same visual language. The current large overview is
retained for compatibility during construction and is composed from accepted
focused modules only after all of them exist.

Decision 0021 supersedes the exact current presentation inventory. The target
model-visible surface is exactly `observe_printer`, requiring one closed view
from `overview`, `progress`, `thermals`, `heads`, `jobs`, `queue`, `fans`, or
`bed_mesh`, plus `open_printer_camera`. Refresh and camera implementation calls
stay app-only. `show_u1_status` and `get_u1_status` leave model visibility at
the schema cutover; retained-task aliases may exist only as bounded app-only
compatibility paths.

Every non-camera view is a pure projection of one normalized current
observation with source time, freshness, connection epoch, session identity,
provenance, capability evidence, and domain values. A focused widget does not
query Moonraker or own polling, merging, or freshness. Camera keeps its own
acquisition time and the decision-0019/0020 activation, fan-out, retry, fallback,
and Close behavior.

The first implementation gate is the shared projection contract plus
`progress`, `thermals`, and `heads`, using already normalized fields. Cavity,
fans/purifier, filament material/color and sensors, jobs/history, queue, and bed
mesh require separate read-only adapter evidence before known values are shown.
Missing or conflicting data renders `Unavailable`, `Unknown`, `Stale`, or
`Offline`, never numeric zero or optimistic provenance.

Changed design/planning paths are decision 0021, its index, working
requirements, this active brief/handoff/validation set, `PROJECT_STATE.md`, and
`NEXT_AGENT.md`. No app code, skill, live printer, installed plugin, service,
OAuth state, or Tailscale route was changed by the design slice.

## Decision 0021 focused observation implementation handoff — 2026-08-30

The final source surface has exactly two model-visible read-only presentation
intents: `observe_printer` with required closed view `overview`, `progress`,
`thermals`, `heads`, `jobs`, `queue`, `fans`, or `bed_mesh`; and
`open_printer_camera`. Exactly eight implementation calls are app-only:
`refresh_printer_observation`, legacy `show_u1_status`/`get_u1_status`, and the
five frame/open/answer/ICE/close camera helpers. `$u1-observe-printer` is the
single procedural observation skill.

One shared in-process store owns the current normalized observation. Plain
presentation reads are cache-only; an explicit due refresh is the only upstream
read, concurrent refreshes coalesce, and failed/offline refreshes retain the last
reachable values as stale with their original source time and connection epoch.
Each request projects only its selected module. Progress, thermals, heads, and
the separate camera strip have accepted focused fixture presentations. Jobs is
limited to currently normalized state. Cavity, filament material/color and
sensors, jobs history, queue, fans/purifier, and bed mesh remain explicit
unknown/unavailable pending live read-only mapping evidence. Overview remains
deferred until every focused module is accepted.

The source contract is runtime `0.3.0`, schema `5`, `observation-v2`, and
`camera-v4`. `observation-v1` is a current-asset alias. Retained tasks receive
frozen status v4/v3 bytes (57,450 bytes, SHA-256
`da9625f5832a4df4e34312999326d241299ed6de9bd4073a60d699d4478db437`)
and camera v3/v2/v1 bytes (33,725 bytes, SHA-256
`c8ef35062ae004ac571501ed99f2810465aa0e12cddbe965918b84d30b476203`).
The current observation and camera assets hash to
`128975091b192369a83476f5d8664da494d4d4fa968ef5e7fc29fe730fd51d3f`
and `2cc7c28f7d692ff7880bfc5cd400d2032b05765ce1bb142ea5dac205c349bc8b`.

Final local validation passes TypeScript, 101 tests with 594 assertions, both
bundles, ad-hoc standalone signature verification, plugin/skill validation, the
repository contract, and whitespace checks. Browser fixture review at a narrow
inline viewport accepted Progress, Thermals, Heads, and Camera. This is
static/software and fixture-only evidence. No live printer, installation,
service, OAuth state, Tailscale route, mounted host, or user-outcome gate was
contacted or accepted. Next deliver the source through independent review and a
pull request; live mapping, overview composition, fresh-task mounting, and the
user's ten-second comprehension gate remain separate later work.
