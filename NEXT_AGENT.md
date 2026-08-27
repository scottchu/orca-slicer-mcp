# Next agent

Resume from repository records, not chat history.

## Read first

1. `AGENTS.md`
2. `PROJECT_STATE.md`
3. `docs/requirements.md`
4. `docs/iterations/CURRENT` and every file in that iteration
5. decisions 0014 through 0017
6. `plugins/u1-print-studio/PACKAGING.md`
7. `docs/u1-print-studio-plugin-architecture.md`

## Current execution order

The user-directed priority is the secure remote U1 Print Studio Monitor slice
under F0. Decision 0017 is current and preserves decision 0016's local-first
normal-user direction.

The secure source and compatibility repair are merged. Pull request 20 is
`4d4ea2f`; Personal Marketplace version
`0.2.0+codex.20260827215815` is installed. The public service and separate
private dashboard LaunchAgents are running. Preserve OAuth state and every
existing Serve/Funnel route.

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
3. `get_u1_camera_frame`
4. `open_u1_camera_stream`

App-only tools are exactly:

1. `answer_u1_camera_stream`
2. `add_u1_camera_ice_candidates`
3. `close_u1_camera_stream`

All are read-only. Stop if upload, start, pause, resume, cancel, G-code, generic
proxy, Control, or Admin behavior appears.

## Validation boundary

The active iteration's `VALIDATION.md` records the exact commands. The current
software suite has 61 passing tests with 329 assertions. The macOS arm64
standalone runtime builds with dotenv/bunfig autoload disabled, receives a
validation-only ad-hoc signature, prints help, writes a schema-2 `0600`
configuration, preserves explicit STUN, and passes offline doctor without Bun
on its invocation path.

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
merged the resource/lifecycle repair as `4d4ea2f`. Personal Marketplace version
`0.2.0+codex.20260827215815` is installed; the exact staged and installed
standalone runtime hash is recorded in `VALIDATION.md`. The owner-only schema-2
config uses explicit STUN. The protected public service, private dashboard, and
separate enrollment listener are healthy; tailnet-only Serve 8447 reaches only
the enrollment listener and Funnel remains enabled only on 443. Existing OAuth
still authorizes remote status and snapshot calls. Public enrollment is 404 and
unauthenticated MCP is 401.

An exact installed-cache client verified the four model-visible plus three
app-only read-only tools, both current and compatibility widget resources,
reachable status, a real JPEG, H264 offer, and close. The private dashboard
also returned 200 and completed a real offer/close bridge smoke. No
browser-control surface was connected, so visible dashboard video and mounted
ChatGPT/Codex playback are not accepted. No TURN service or shared secret is
configured.

## Next smallest action

Open a fresh Codex or ChatGPT task, invoke the status card and Go Live once,
then separately reload the private dashboard and record whether visible video,
FPS, Close, PiP, and fullscreen work. The server, authentication, snapshot,
widget-resource, offer, and close layers already pass; do not collapse them
into the remaining mounted/visible user-outcome gate.

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
docs/requirements.md, the active iteration, and decisions 0014 through 0017.
Treat the secure remote Monitor source slice as current: standard-HTTPS public
OAuth/MCP, public enrollment rejection, a separate tailnet-only enrollment
listener, explicit STUN, and preferred short-lived TURN REST credentials.
Preserve exactly four model-visible tools and three app-only helpers. Do not
mutate live services/routes, merge, publish, or contact a physical printer
without fresh approval.
```
