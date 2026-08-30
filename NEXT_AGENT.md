# Next agent

Resume from repository records, not chat history.

## Read first

1. `AGENTS.md`
2. `PROJECT_STATE.md`
3. `docs/requirements.md`
4. `docs/iterations/CURRENT` and every file in that iteration
5. decisions 0014 through 0021
6. `plugins/u1-print-studio/PACKAGING.md`
7. `docs/u1-print-studio-plugin-architecture.md`

## Current execution order

The user-directed priority is the composable read-only U1 observation feedback
loop under F0. Decision 0021's source slice is implemented and locally
validated: focused 720-pixel Instrument Strips, camera as a separate strip, and
no giant machine map. Preserve decision 0020's private fan-out, decision 0019's
mounted-widget activation, decision 0017's secure remote boundary, and decision
0016's local-first normal-user direction.

The secure source and compatibility repair are merged. Pull request 20 is
`4d4ea2f`; pull request 22 adds the camera-only presentation as `333bebe`.
Personal Marketplace version `0.2.0+codex.20260828194545` is installed. The
public service and separate private dashboard LaunchAgents are running.
Preserve OAuth state and every existing Serve/Funnel route.

The camera-only source slice merged through pull request 22 as `333bebe`.
Personal Marketplace version `0.2.0+codex.20260828194545` is installed and its
runtime hash matches the staged source. Decision 0018 adds
`open_printer_camera`, `camera-v1.html`, and the opt-in `/dashboard/camera`
test host. Existing Codex/ChatGPT tasks still require a new task to load the
new descriptor.

The decision-0019 source repair makes `open_printer_camera` the only
model-visible camera action. The app-only frame helper mints a one-time private
activation only after Go Live; stream open consumes it, and unanswered offers
release after 15 seconds. The focused descriptor is `camera-v2.html` with v1
served as a current-asset compatibility alias. Health and doctor report runtime
0.2.0, tool schema 3, and camera widget v2. Source validation passes with 71
tests and 417 assertions; delivery/install evidence is recorded separately.

Pull request 24 merged as `62acd4c`. Personal Marketplace version
`0.2.0+codex.20260828211031` is installed with source/stage/cache runtime hash
`74f5f654de2a52c21a33577ffd6520f1054eb71439668885986114177faa2398`.
The exact installed client verified three model-visible plus five app-only
tools, both camera-v2 and v1 resources, rejection of an old empty stream call,
a 135,547-byte real JPEG, one bounded offer with one ICE server, and explicit
Close. Public and dashboard health report schema 3/camera-v2; OAuth state and
Tailscale routing hashes stayed unchanged across restart. The private browser
rendered `Live · 24 FPS` and returned to Snapshot after Close.

Decision 0020 is implemented only in the current feature worktree. It adds
camera-v3 repeated-open camera-only presentation semantics and terminates one
private H264 printer upstream in the connector. Bounded independent downstream
viewer peers receive cloned RTP headers, separate ICE credentials, explicit
server Tailscale host candidates, independent Close, a 15-second answer
deadline, and last-viewer upstream release. `U1_CAMERA_MAX_VIEWERS` defaults to
16 and accepts 1 through 64. The first received RTP payload type selects the
exact H264 fmtp; downstream PLI feedback is coalesced onto the upstream
receiver; explicit generations reject peers that terminate during async open;
subscribe-then-inspect termination observers reject werift peers already
failed/closed before registration. Camera v2 and v1 remain aliases. Public
status, camera bytes, diagnostics, MCP, and exact HTTP envelopes exclude
printer identity, upstream signaling, raw errors, and JPEG metadata. No live
runtime or route has been changed.

The decision-0021 implementation adds one shared in-process observation store.
Plain presentation reads are cache-only; explicit due refreshes call the
upstream adapter, concurrent refreshes coalesce, and failed/offline refreshes
retain the last reachable values as stale with their original source time.
Every `observe_printer` call projects only its selected module. Progress,
thermals, and heads are implemented from normalized fields; jobs current state
is limited, and queue, fans, bed mesh, cavity, filament material/color, and
history remain honest unknown/unavailable values pending live mapping evidence.
Overview is deferred. Current resources are observation-v2 and camera-v4;
observation-v1 is a current-asset alias, while status v4/v3 and camera v3/v2/v1
serve frozen legacy bytes.

The implementation is a desktop-local read-only connector. A normal user must
not need Tailscale, MagicDNS, public DNS, manual OAuth, environment-file
editing, or Bun. Do not restore the stale direct-HTTP hosted widget path from
decision 0015.

## Current implementation

- `u1-print-studio setup` writes one owner-only local config containing a
  validated private printer origin and optional bounded explicit STUN URLs.
- `u1-print-studio doctor --offline` checks the configuration and safety
  contract without hardware access.
- `u1-print-studio mcp` starts the desktop stdio connector.
- The hosted widget contains no `fetch(` call and declares empty external CSP
  domains.
- Current descriptors point to `observation-v2.html` and `camera-v4.html`.
  Frozen status-v4/status-v3 and camera-v3/v2/v1 resources remain readable for
  retained cards. Plugin upgrades still require a new task for the current
  installed MCP process.
- Live offer, answer, ICE candidates, and close use MCP Apps `tools/call`.
- The connector alone invokes the U1's fixed Printer Operations adapter.
- The fan-out application service owns one private H264 printer upstream plus
  opaque downstream viewers, exact first-RTP codec selection, bounded upstream
  PLI feedback, peer-ID hiding, input bounds, concurrency, duration, expiry,
  abort, generation-safe opening, level-triggered terminal-state observation,
  and independent close.
- Snapshot fallback and the existing 1200 by 1500 PNG remain intact.
- The standalone dashboard may retain the exact HTTP signaling adapter for
  development compatibility.
- `.mcp.release.json` points to a staged self-contained executable; the source
  `.mcp.json` remains a Bun/env-file developer adapter.
- Public OAuth and MCP require standard HTTPS and `u1.monitor`; public
  `/auth/enroll*` rejects.
- A configured same-hostname private enrollment origin requires a distinct
  loopback port and binds an enrollment-only listener. Its health remains
  available after restart with an existing credential while enrollment returns
  404.
- HTTP env STUN overrides optional owner-config STUN. ICE defaults empty.
- TURN REST derives bounded per-peer credentials from configured TURN URLs
  and a server-only shared secret. The secret never leaves the server; derived
  credentials remain widget-private. Upstream printer ICE and downstream viewer
  ICE are distinct; reachable Tailscale host candidates can avoid TURN.
- The HTTP service may run from env without a standalone config. The stdio
  standalone continues to require its owner-only config.

Current source model-visible tools are exactly:

1. `observe_printer`, with required view `overview`, `progress`, `thermals`,
   `heads`, `jobs`, `queue`, `fans`, or `bed_mesh`
2. `open_printer_camera`

Current source app-only tools are exactly:

1. `refresh_printer_observation`
2. `show_u1_status`
3. `get_u1_status`
4. `get_u1_camera_frame`
5. `open_u1_camera_stream`
6. `answer_u1_camera_stream`
7. `add_u1_camera_ice_candidates`
8. `close_u1_camera_stream`

All are read-only. Stop if upload, start, pause, resume, cancel, G-code, generic
proxy, Control, or Admin behavior appears.

`show_u1_status` and `get_u1_status` are compatibility aliases only, not model
intents. Every non-camera view projects the same normalized observation and
preserves time, freshness, connection epoch, session identity, provenance, and
capability evidence. Camera retains its separate acquisition time and camera-v4
lifecycle. The one user-facing procedural observation skill is
`$u1-observe-printer`. The installed decision-0019 runtime is still the older
schema-3/camera-v2 three-visible/five-app-only surface until a fresh authorized
rollout; do not conflate it with current source.

## Validation boundary

The active iteration's `VALIDATION.md` records the exact commands. The final
software suite has 101 passing tests with 594 assertions. The macOS arm64
standalone runtime builds with dotenv/bunfig autoload disabled, receives a
validation-only ad-hoc signature, prints help, writes a schema-2 `0600`
configuration, preserves explicit STUN, and passes offline doctor without Bun
on its invocation path.

Browser fixture review accepted Progress, Thermals, Heads, and separate Camera
at a narrow inline viewport. This, the bundles, and the full suite are static or
fixture-only evidence. No live printer, install, service, OAuth state, or route
was contacted or changed for decision 0021.

The decision-0019 source suite has 71 passing Bun tests with 417 assertions.
Its compiled camera asset is embedded in the standalone runtime. A private
loopback source dashboard mounted the exact current camera component, obtained
a real snapshot, rendered live video at an observed 23 FPS, and returned to
snapshot after Close. Live state is gated on an actually rendered frame; play
rejection, no first frame, track termination, stall, and video error activate
snapshot fallback. This is private-browser/real-printer evidence, not installed
MCP-host evidence.

The software/source suite alone proves local static/software and simulated
protocol behavior only. It does not prove:

- Homebrew or npm installation;
- production signing, notarization, update, or rollback;
- an owner-selected open-source license or third-party notice review;
- another OS or architecture;
- a real TURN allocation;
- a mounted desktop or mobile MCP App;
- browser playback;
- physical safety or user outcome.

Separate post-merge evidence below accepts this machine's Personal Marketplace
installation, live public/private routing, and bounded read-only real-printer
status, snapshot metadata, offer, and close. It does not extend the source-suite
proof to other machines, distribution channels, control actions, or visible
playback.

Independent pre-merge review added regressions for rewriting a previously
broader-permission config and for closing a valid camera session when the rest
of its stream envelope is malformed. Both fixes are included in the passing
suite.

Pull request 18 merged the secure remote slice as `e298885`; pull request 20
merged the resource/lifecycle repair as `4d4ea2f`; pull request 22 merged the
camera-only presentation as `333bebe`. Personal Marketplace version
`0.2.0+codex.20260828194545` is installed; the exact staged and installed
standalone runtime hash is recorded in `VALIDATION.md`. The owner-only schema-2
config uses explicit STUN. The protected public service, private dashboard, and
separate enrollment listener are healthy; tailnet-only Serve 8447 reaches only
the enrollment listener and Funnel remains enabled only on 443.

An exact installed-cache client verified four model-visible plus four app-only
read-only tools and all three widget resources. The deployed private
`/dashboard/camera` displayed a real snapshot, rendered `Live · 25 FPS`, and
returned to snapshot after Close. Tailscale configuration stayed byte-stable
across service restart. Mounted ChatGPT/Codex playback is not yet accepted
because it requires a fresh task. No TURN service or shared secret is
configured.

## Next smallest action

Independently review and deliver the completed decision-0021 source slice through
a pull request. Do not install, restart, contact the live printer, or mutate
routes/auth state without fresh authorization. Then establish live read-only
mappings for unresolved domains, accept each focused module, and only afterward
compose overview and run the mounted user-outcome gate.

## Preserve

- Orca Preparation and Printer Operations remain peer subsystems.
- MCP, CLI, and optional HTTP are inbound adapters around shared application
  policy.
- Status, snapshots, live signaling, and this connector's printer operations
  remain read-only.
- Observation, recommendation, authorization, action, and verification remain
  distinct.
- Slicing, artifact validation, upload, start acknowledgement, observed
  printing, and physical acceptance remain separate evidence.
- Tailscale and personal OAuth remain optional developer adapters, never
  normal-user requirements. Enrollment is tailnet-only and TURN secrets stay
  server-side.
- Repository records are durable project memory.

## Copy-paste restart prompt

```text
Resume this repository from AGENTS.md, PROJECT_STATE.md, NEXT_AGENT.md,
docs/requirements.md, the active iteration, and decisions 0014 through 0021.
Review and deliver the completed decision-0021 source slice. Source exposes
exactly `observe_printer` with its closed eight-view enum plus
`open_printer_camera`; app-only refresh, legacy aliases, and five camera helpers
remain hidden. It uses observation-v2, camera-v4, frozen legacy resources, one
explicit-refresh/coalescing/stale-retention store, and selected-module
projections. Camera is separate and overview is deferred. Preserve decision
0020 fan-out and the secure remote boundaries. Do not mutate live
services/routes, install, publish, or contact a physical printer without fresh
approval.
```
