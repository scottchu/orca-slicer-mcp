# Next agent

Resume from repository records, not chat history.

## Read first

1. `AGENTS.md`
2. `PROJECT_STATE.md`
3. `docs/requirements.md`
4. `docs/iterations/CURRENT` and every file in that iteration
5. decisions 0014 through 0020
6. `plugins/u1-print-studio/PACKAGING.md`
7. `docs/u1-print-studio-plugin-architecture.md`

## Current execution order

The user-directed priority is the U1 camera fan-out and privacy repair under
F0. Decision 0020 is current and preserves decision 0019's mounted-widget
activation, decision 0017's secure remote boundary, and decision 0016's
local-first normal-user direction.

The secure source and compatibility repair are merged. Pull request 20 is
`4d4ea2f`; pull request 22 adds the camera-only presentation as `333bebe`;
pull request 24 adds the activation repair as `62acd4c`; and pull request 26
merges decision 0020 as `4f9041c`. Preserve OAuth state and every existing
Serve/Funnel route.

The decision-0019 source repair makes `open_printer_camera` the only
model-visible camera action. The app-only frame helper mints a one-time private
activation only after Go Live; stream open consumes it, and unanswered offers
release after 15 seconds. The focused descriptor is `camera-v2.html` with v1
served as a current-asset compatibility alias. Health and doctor report runtime
0.2.0, tool schema 3, and camera widget v2. Source validation passes with 71
tests and 417 assertions; delivery/install evidence is recorded separately.

Decision 0020 is installed from pull request 26 as Personal Marketplace version
`0.2.0+codex.20260830013924`. Both existing services restarted and report tool
schema 4 plus camera-v3; OAuth state and Tailscale routing stayed unchanged.
The installed surface remains exactly three model-visible tools and five
app-only helpers. Camera-v3 adds repeated-open camera-only presentation
semantics and one private H264 printer upstream with bounded independent
downstream peers, exact H264 payload selection, coalesced PLI feedback,
termination-race cleanup, distinct ICE credentials, independent Close, and
last-viewer upstream release.

The first user test after installation created a new conversation inside a
Codex Desktop process that still predated the reinstall. That process did not
expose `open_printer_camera`; the model selected `u1-monitor-print` and
substituted `show_u1_status`, mounting the entire status card. Treat this as an
unaccepted stale-host and guidance regression, not a camera-v3 widget build
result. The source guidance now routes standalone camera requests only to
`open_printer_camera`; if it is missing or its resource cannot load, report the
stale/unavailable connection and stop. Never call status, frame, or stream
helpers as a substitute. A full Codex Desktop quit and relaunch is required
before mounted acceptance.

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
  a compatibility resource for retained cards. A plugin upgrade can require a
  full host-process quit and relaunch; a new task alone did not replace the MCP
  process retained by Codex Desktop in the observed regression.
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
software suite has 93 passing tests with 569 assertions. The macOS arm64
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

Pull request 26 merged decision 0020 as `4f9041c`; Personal Marketplace version
`0.2.0+codex.20260830013924` is installed and both services report schema
4/camera-v3. The exact inventory is three model-visible tools plus five app-only
helpers. Earlier private-dashboard Live results belong to direct-session
predecessors and do not prove the installed fan-out or mounted host. No TURN
service or shared secret is configured.

## Next smallest action

Deliver the independently approved standalone-camera routing guard through a
pull request. Do not reinstall or restart anything without fresh rollout
authorization. After rollout, fully quit and relaunch the host before invoking
`open_printer_camera`; a status-card substitution is failure. Separately observe
one real printer upstream shared by two viewers, closing one without
interrupting the other, final upstream release, camera-v3 repeated mounts,
mobile tailnet-direct ICE, and TURN only if an owner-approved relay is
configured.

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
docs/requirements.md, the active iteration, and decisions 0014 through 0020.
Treat the decision-0020 camera fan-out and privacy source slice as current: one
private server-terminated H264 printer upstream, bounded independent downstream
viewers, distinct upstream/viewer ICE credentials, camera-v3, standard-HTTPS
public OAuth/MCP, public enrollment rejection, and a separate tailnet-only
enrollment listener. Preserve exactly three model-visible tools and five
app-only helpers. Do not mutate live services/routes, merge, publish, or contact
a physical printer without fresh approval.
```
