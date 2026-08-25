# F0 dual-subsystem foundation handoff

## Current status

The product contract remains one product with two peer subsystems: Orca
Preparation and Printer Operations. A redacted LAN Fluidd/Moonraker target,
read-only status, WebSocket transport, and live snapshot have been observed for
Printer Operations. Upstream OrcaSlicer `2.4.2` and Snapmaker Orca `2.3.5`
were inspected locally. A later user-authorized Snapmaker U1 pilot sliced two
parts and completed a PETG print after substantial CLI debugging. Two later PLA
jobs also reached telemetry-verified completion. The repo-local plugin contains
three thin workflow skills and a read-only MCP Apps status-view prototype. No
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
- the local stdio plugin is desktop-local. Mobile iOS use requires an
  authenticated reachable MCP backend, an always-on LAN host, and a separately
  verified product surface. Secure MCP Tunnel is the preferred private
  candidate but is not configured;
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

Open the refreshed plugin in a new desktop Codex thread and call
`show_u1_status` directly. Visually test the HTML dashboard, relayed snapshot,
`Go Live` and `Close`, PiP, fullscreen, manual refresh, and one adaptive refresh.
Record each host result separately. Then choose an authenticated always-on host
and Secure MCP Tunnel setup before repeating the loop on iOS. Resume synthetic
non-user dry-slice and negative fixtures afterward. Do not expose Moonraker or
build a shared CLI merely because the manual commands exist.

## Restart instructions

Follow `NEXT_AGENT.md` and decisions 0003 through 0009. Do not infer that one
subsystem is secondary from the current execution order, and do not implement
or issue consequential actions before F0 discovery establishes the relevant
contracts.
