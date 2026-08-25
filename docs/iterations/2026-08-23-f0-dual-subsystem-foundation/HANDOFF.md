# F0 dual-subsystem foundation handoff

## Current status

The product contract remains one product with two peer subsystems: Orca
Preparation and Printer Operations. A redacted LAN Fluidd/Moonraker target,
read-only status, WebSocket transport, and live snapshot have been observed for
Printer Operations. Upstream OrcaSlicer `2.4.2` and Snapmaker Orca `2.3.5`
were inspected locally. A later user-authorized Snapmaker U1 pilot sliced two
parts and completed a PETG print after substantial CLI debugging. Two later PLA
jobs also reached telemetry-verified completion. The repo-local plugin contains
four thin workflow skills and a read-only MCP Apps status-view prototype. No
preparation, control, or persistent-monitor runtime exists, and Snapmaker Orca
is not yet an accepted product backend.

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
- after the user completed the corrected standard-port connection, the host
  exposed exactly the three read-only tools and an authenticated
  `show_u1_status` call returned fresh `complete` telemetry at 100% (188/188),
  with inactive fully consumed storage, no exception, parked tools, and zero
  heater targets. At that point, phone layout and relayed-camera rendering
  remained visual checks rather than inferred outcomes.
- decision 0012 adds a portable 1200 by 1500 PNG status projection to remote
  `show_u1_status` results for Codex hosts that do not mount MCP Apps
  components. It uses the same normalized observation as the widget, exposes
  no URL or control, and leaves local stdio plus remote refresh data-only. A
  live complete observation was rendered and visually inspected locally;
  Codex-mobile display remained a user-visible check until the later user
  confirmation below.
- after the first phone rendering was visually accepted, the user asked for a
  slightly larger presentation. The fallback now uses a portrait 2-by-2 metric
  layout and larger pixel type so the host can devote more vertical space to it
  on a phone without changing the data or safety contract.
- the larger portrait PNG was subsequently displayed in Codex mobile and the
  user confirmed that it was good. This closes the static image host check; it
  does not validate the interactive component, relayed camera, PiP, fullscreen,
  or adaptive refresh.
- `docs/u1-print-studio-plugin-architecture.md` maps the current package,
  transports, OAuth boundary, observation adapter, presenters, MCP fields, and
  read-only runtime slice to the stable domain ontology. It explicitly records
  that the prototype still calls its observation adapter directly rather than
  implementing the planned application use case and persistent monitor ports.
- the synchronized and installed plugin is
  `0.2.0+codex.20260825211428`. Its repository, personal-source, and installed
  bundles share SHA-256
  `6dfa78e49bbf81775ca3e62bd518f7399fff1a2c494583aae4032cc5f3e9c49d`;
  an installed-cache stdio smoke preserved the three-tool inventory and
  text-only local render result.
- the plugin now includes `u1-mobile-status-setup`, which discovers each user's
  Tailscale MagicDNS hostname, preserves unrelated Funnel handlers, guides
  phone passkey enrollment and desktop Developer mode, verifies the exact
  three-tool read-only inventory, and keeps all control actions out of setup.

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
  OAuth backend now passes an authenticated remote tool call, and the remote
  result carries an inline image fallback. Actual image display is now
  user-confirmed for the larger portrait PNG in Codex mobile; interactive
  camera rendering remains separately unverified visual evidence;
- the snapshot endpoint was intermittently slow. One bounded retry recovered a
  packaged real-frame smoke, and one later frame took 12.9 seconds. The longer
  bounded relay now passes installed-cache transport checks, but repeated
  live-preview reliability is not yet host-validated;
- manifest shape, compatibility checks, and upload/start ownership are open;
- multiple physical jobs completed, but product implementation, repeatable workflow,
  protocol, safety, and general user-outcome acceptance remain pending.
- the latest PLA job is telemetry-complete, but its output has not been handled
  and the final lowered-bed camera frame did not show the parts.

## Next smallest action

Run one synthetic two-object dry-slice repetition with explicit complete
Snapmaker Orca `2.3.5` profiles, then run non-user negative fixtures for
`wipe_tower_filament: "0"` and missing inherited filament fields. Do not upload
or start an artifact. If a host mounts the interactive component, verify its
relayed snapshot and controls as a separate capability. Do not expose Moonraker
or build a shared CLI merely because the manual commands exist.

## Restart instructions

Follow `NEXT_AGENT.md` and decisions 0003 through 0011. Do not infer that one
subsystem is secondary from the current execution order, and do not implement
or issue consequential actions before F0 discovery establishes the relevant
contracts.
