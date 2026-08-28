# Next agent

Resume from repository records, not chat history.

## Read first

1. `AGENTS.md`
2. `PROJECT_STATE.md`
3. `docs/requirements.md`
4. `docs/iterations/CURRENT` and every file in that iteration
5. decisions 0014 through 0019
6. `plugins/u1-print-studio/PACKAGING.md`
7. `docs/u1-print-studio-plugin-architecture.md`

## Current execution order

The user-directed priority is the U1 camera workflow repair under F0. Decision
0019 is current and preserves decision 0017's secure remote boundary plus
decision 0016's local-first normal-user direction.

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
- Current descriptors point to `status-v4.html`; `status-v3.html` is served as
  a compatibility resource for retained cards. Plugin upgrades still require
  a new task for the current installed MCP process.
- Live offer, answer, ICE candidates, and close use MCP Apps `tools/call`.
- The connector alone invokes the U1's fixed Printer Operations adapter.
- The WebRTC application service owns opaque sessions, peer-ID hiding, input
  bounds, concurrency, duration, expiry, abort, and close.
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
- TURN REST derives bounded per-session credentials from configured TURN URLs
  and a server-only shared secret. The secret never leaves the server; derived
  credentials remain widget-private and also reach the printer peer.
- The HTTP service may run from env without a standalone config. The stdio
  standalone continues to require its owner-only config.

Model-visible tools are exactly:

1. `show_u1_status`
2. `get_u1_status`
3. `open_printer_camera`

App-only tools in the decision-0019 workflow repair are exactly:

1. `get_u1_camera_frame`
2. `open_u1_camera_stream`
3. `answer_u1_camera_stream`
4. `add_u1_camera_ice_candidates`
5. `close_u1_camera_stream`

All are read-only. Stop if upload, start, pause, resume, cancel, G-code, generic
proxy, Control, or Admin behavior appears.

## Validation boundary

The active iteration's `VALIDATION.md` records the exact commands. The current
software suite has 71 passing tests with 417 assertions. The macOS arm64
standalone runtime builds with dotenv/bunfig autoload disabled, receives a
validation-only ad-hoc signature, prints help, writes a schema-2 `0600`
configuration, preserves explicit STUN, and passes offline doctor without Bun
on its invocation path.

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

Open a fresh Codex or ChatGPT task and invoke `open_printer_camera`. Verify that
the camera-only resource mounts, then record snapshot, Go Live, rendered video,
Close, and fallback if exercised. The installed cache and deployed private
dashboard already pass; do not collapse them into the remaining mounted-host
and mobile user-outcome gates.

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
docs/requirements.md, the active iteration, and decisions 0014 through 0019.
Treat the secure remote Monitor source slice as current: standard-HTTPS public
OAuth/MCP, public enrollment rejection, a separate tailnet-only enrollment
listener, explicit STUN, and preferred short-lived TURN REST credentials.
Preserve exactly three model-visible tools and five app-only helpers. Do not
mutate live services/routes, merge, publish, or contact a physical printer
without fresh approval.
```
