# Next agent

Resume from repository records, not chat history.

## Read first

1. `AGENTS.md`
2. `PROJECT_STATE.md`
3. `docs/requirements.md`
4. `docs/iterations/CURRENT` and every file in that iteration
5. decisions 0014 through 0025
6. `plugins/u1-print-studio/PACKAGING.md`
7. `docs/u1-print-studio-plugin-architecture.md`

## Current execution order

Decision 0025's Current Job/Job History split is implemented in source.
Preserve `jobs` for Current Job and add only `job_history`, with separate
projections and directory entries. Unknown history must not become an empty
successful result, a current-job leak or a fabricated history timestamp.
Current source is runtime `0.3.2`, schema `6`, observation-v4; v3/v2/v1 are
current aliases, camera-v5 and frozen legacy bytes are unchanged. There are
nine observation values, nine directory links, eleven resources and unchanged
two-visible/eight-app-only tools. Independent validation passes 148 app tests/
2,011 assertions, 21 lifecycle tests, TypeScript, repository checks, all bundles/
signatures, widget comparisons and skill validation. Six rendered captures,
nine browser cases and thirty route checks pass with zero external requests,
browser errors or fixture acquisitions. Independent code/visual review approves
without findings, with 30 tests/1,085 assertions and all six captures checked.
Deliver a new
PR and merge after approval as the user authorized. Do not deploy, reinstall,
restart services, change auth/routes, contact the printer or implement history
acquisition under this split request. Information remains above actions.

PR32 merged as `47bfd37`; PR31 rollout records merged as `16169c0`. Do not
resume their old pending-delivery instructions below. Live services still run
release `20260831-48a106d-widgets` at `0.3.1`/schema `5`/observation-v3/camera-v5;
merged source and deployed bytes are distinct evidence layers.

Merged source in PR32 follows the user's latest principle: information above,
actions below. Observation title/time/freshness/errors are at the top;
Refresh/Retry alone occupy the footer. Camera status/time/feedback are at the
top, with display/live controls bottom right. This supersedes prior bottom-time
instructions. Layer math and camera JavaScript are unchanged, but both HTML
hashes change. Independent validation passes 144 app tests/1,931 assertions,
21 lifecycle tests, TypeScript, repository/bundle/signature checks, exact asset
comparisons and ten browser captures. Code/visual review approves without
findings, with 71 tests/1,576 assertions independently passing. Update PR32.
No deployment or merge authority is included. Prior records below describe
earlier accepted states, not placement instructions for the current source.

The previous source follow-up, delivered as `081929e` in PR32, moves camera PiP/fullscreen beside
Go Live/Close, preserving 44-pixel controls and complete timestamps through
narrow wrapping. Camera JavaScript and segmented-progress bytes are unchanged.
Independent validation passes 143 app tests/1,865 assertions, 21 lifecycle
tests, TypeScript, repository/bundle/signature checks and five browser captures.
Independent code/visual review approves without findings, with 51 tests/556
assertions independently passing. Update PR32, not a new PR.
Both refinements remain undeployed and require separate merge/rollout authority.

The user's segmented-layer progress strip is the delivered PR32 baseline. Read
decision 0023's dated refinement. Source implementation is complete in the
current observation HTML and its VM tests: 24/48 responsive block budgets,
valid layer-position fill rather than reported print percentage, partial
current groups, unavailable invalid data, and one accessible progressbar.
Card layout/footer, MCP/bridge, camera, schema and version labels are unchanged.
Independent validation passes 142 app tests/1,849 assertions, 21 lifecycle
tests, TypeScript, repository checks, three bundles/signature checks and exact
bundled/frozen asset comparisons. Twelve screenshots and eight isolated browser
behavior cases pass. Independent code and scoped visual review approve without
blocking findings; the reviewer independently passes 58 tests/1,441 assertions.
Update that existing PR with the separately reviewed camera follow-up. Do not merge, deploy, install, restart,
or contact the printer under the completed PR30 rollout authorization.
Source and installed baseline both say `0.3.1`/schema `5`/observation-v3/
camera-v5; require exact asset bytes to distinguish the segmented source from
the still-continuous deployed strip. The historical rollout paragraphs below
remain valid evidence, not current execution instructions.

The user authorized PR30 merge and rollout to the two existing HTTP services.
[PR30](https://github.com/scottchu/orca-slicer-mcp/pull/30) merged as
`48a106d2f17550bab8dc8648af1c7c247610a228` on 2026-08-31. Clean-source
staging, dry-run and paired installation passed for release
`20260831-48a106d-widgets`. Independent checks accept both services at runtime
`0.3.1`, schema `5`, observation-v3/camera-v5, exact static assets and preserved
private state/access boundaries. Directory-only deployed browser checks passed
at 390/light and 720/dark with no overflow, subrequests or errors. No plugin
reinstall occurred; do not repeat the completed rollout. Mac login/power,
auth/routes, printer access/control and missing-domain implementation remain
excluded from this authorization.

Decisions 0023/0024 are implemented and independently approved: runtime
`0.3.1`, schema `5`, observation-v3/camera-v5, quiet bottom footers and camera
overlays, finite host loading, and a static eight-link private directory at
both dashboard roots. Directory loading never mounts a widget or acquires
data/media; focused URLs remain unchanged and overview is deferred. The index
is embedded in the HTTP bundle, preserving older release asset requirements.
Observation-v2/v1 and camera-v4 are current aliases; frozen legacy bytes, ten
resource URIs, and two-visible/eight-app-only inventory remain compatible.

Final source validation passes 135 app tests/1,006 assertions, 21 lifecycle
tests, TypeScript, repository checks, all bundles/signing, six directory
captures, 20 route checks, and 12 keyboard checks with zero acquisition.
Earlier decision-0023 isolated fixtures captured 67 observation and 22 camera
states, with 13 camera behavior and three keyboard/unavailable checks passing.
Independent code and scoped visual review reports no findings; see
`design-qa.md`. This accepts source and synthetic rendered fixtures, not actual
iPhone/PiP, printer behavior, or user comprehension. The separately installed
personal plugin remains its PR28 version; do not imply the HTTP rollout updates
the plugin or an already-mounted host.

The following PR28/PR29 records are historical baseline and recovery evidence,
not instructions to repeat their installation or permission to broaden scope.

PR28 merged as `2160492a4ce63d1409673786ea02b253d7cfaace`, combining PR27's
exclusive camera routing with focused widgets and decision-0022 persistence.
Personal Marketplace version `0.2.0+codex.20260831033612` is installed from that
merge with exact runtime, production HTML, and all five skill folders verified.
The runtime source/stage/cache SHA-256 is
`c4029f18678e1839c0b005e37bc7401bf84bcc6ed7ef3d19155286253c2f018b`.
Prior personal source remains recoverable locally. The user authorized only
the existing two owner LaunchAgents with a versioned release/copied pinned Bun.
Mac automatic login/power, routing/auth changes, and printer controls remain
out of scope. Preserve decision 0020 fan-out, decision 0019 activation, decision
0017 secure remote access, and decision 0016's local-first normal-user direction.

Decision 0022 originally added fixed private focused routes defaulting to progress and a
shared observation store across HTTP calls within each process. It does not
create cross-process/restart storage, subscriptions, background camera, a root
daemon, or an MCP Admin tool. Health/static routes must not contact the printer.
Decision 0024 supersedes only the root redirect with static navigation.

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

Historically, decision 0020 was installed from pull request 26 as Personal Marketplace version
`0.2.0+codex.20260830013924`. Both existing services then restarted and reported tool
schema 4 plus camera-v3; OAuth state and Tailscale routing stayed unchanged.
That earlier installed surface had exactly three model-visible tools and five
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

The decision-0021 implementation adds one shared in-process observation store.
After initial acquisition, plain presentation reads are cache-only; explicit due refreshes call the
upstream adapter, concurrent refreshes coalesce, and failed/offline refreshes
retain the last reachable values as stale with their original source time.
Every `observe_printer` call projects only its selected module. Progress,
thermals, and heads are implemented from normalized fields; jobs current state
is limited, and queue, fans, bed mesh, cavity, filament material/color, and
history remain honest unknown/unavailable values pending live mapping evidence.
Overview is deferred. Current source resources are observation-v4 and camera-v5;
observation-v3/v2/v1 and camera-v4 are current-asset aliases, while status v4/v3 and camera v3/v2/v1
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
- Current source descriptors point to `observation-v4.html` and `camera-v5.html`.
  Observation-v3/v2/v1 and camera-v4 are current aliases.
  Frozen status-v4/status-v3 and camera-v3/v2/v1 resources remain readable for
  retained cards. A plugin upgrade can require a
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

Current source model-visible tools are exactly:

1. `observe_printer`, with required view `overview`, `progress`, `thermals`,
   `heads`, `jobs`, `job_history`, `queue`, `fans`, or `bed_mesh`
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
capability evidence. Camera retains its separate acquisition time and camera-v5
lifecycle. The one user-facing procedural observation skill is
`$u1-observe-printer`. The current installed plugin carries schema 5,
observation-v2, camera-v4, and the same two-visible/eight-app-only inventory.
Earlier decision-0020 records are historical, not current installation claims.

## Validation boundary

The active iteration's `VALIDATION.md` records the exact commands. Decision
0021 passed 101 tests with 594 assertions before integration; PR27's standalone
camera routing slice passed 93 tests with 569 assertions on its separate tree.
The combined baseline passed TypeScript and 105 tests with 606 assertions before
persistence changes. The implemented focused-route/shared-store tree passes
TypeScript, 110 tests with 759 assertions, both stdio/runtime bundles, and local
signature checks. The pre-rollout lifecycle CLI passed 19 fixture tests;
the final race-repaired CLI passes 21. Independent review approved the combined source with no blocking findings, including the
repository contract and bundled health/static smoke with zero synthetic
printer reads. Post-merge installed/service evidence is recorded separately in
the active iteration. The macOS arm64
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

Historically, pull request 26 merged decision 0020 as `4f9041c`; Personal Marketplace version
`0.2.0+codex.20260830013924` was installed and both services then reported schema
4/camera-v3. That inventory was three model-visible tools plus five app-only
helpers. Earlier private-dashboard Live results belong to direct-session
predecessors and do not prove the installed fan-out or mounted host. No TURN
service or shared secret is configured.

## Next smallest action

Current Job and Job History pass independent validation and code/visual review.
Deliver a new PR and merge the approved slice under the
user's merge-as-we-go instruction. Use source runtime `0.3.2`, schema `6`,
observation-v4 and exact asset hashes from this slice's validation record.
Neither merge nor directory availability proves new deployed bytes or history
integration. Service/plugin rollout still requires separate authorization.

PR30 merge `48a106d` and paired rollout are complete with independent approval;
the `2026-08-31 authorized merged-service rollout validation` entry in
`VALIDATION.md` records those deployed checks. Next obtain
user feedback on the directory and focused widgets. Preserve OAuth state,
private env/config, every Serve/Funnel route, and unrelated canonical-checkout
documentation. Use health/static reads only for this gate; opening a focused
widget can acquire printer data and is not a hidden health check. The earlier
PR29 exact-label restart repair and its 21 lifecycle tests remain intact.
For a future separately authorized rollout, use
`uv run --no-project scripts/u1_service.py`: first
`stage --source ABS --bun ABS --release ID`, then
`install --release ID --dry-run`, then authorized `install --release ID`.
The source must be clean/committed. Follow with `status` and the intended
`start|stop|restart --service all|public|dashboard`; recover with
`rollback --snapshot ID` from the install result. The default state root is
`~/Library/Application Support/U1 Print Studio/service`, and releases copy Bun
to `bin/bun`; they do not depend on the original Bun binary remaining present.
Explicit private env is preserved, ambient dotenv/bunfig loading is disabled,
and relative effective auth/config paths fail before stops. A cold store still
acquires once on first demand; health/static requests never acquire.
A separate plugin upgrade may be needed
before a new MCP-host task has these assets; no plugin reinstall is included
here. Camera requests must never substitute a status card. Real-phone
fullscreen/PiP, mounted behavior, live mappings, two-viewer fan-out and overview
remain separate scope/evidence gates. Mac login/power remains deferred.

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
docs/requirements.md, the active iteration, and decisions 0014 through 0025.
CURRENT: source-ready0025splitsjobs(CurrentJob)andjob_history;0.3.2/schema6/
observation-v4,aliases3/2/1,camera5,9views9directorylinks11resources,tools2+8.
Independent148tests2011assertions21lifecycle/allbundles/skillvalidationpass;
6captures9browsercases30routechecksalsopass; independentcode/visualreview
APPROVES30tests1085assertionsandall6captures,no findings. DelivernewPR,
thenmergeasexplicitlyauthorized. No deployment/plugin/services/printeraction.
PR32merged47bfd37andPR31recordsmerged16169c0;followingrecordsarehistorical.
The earlier source task was decision0023's dated segmented-layer refinement. Author
implementation and independent validation pass142app/1849assertions21lifecycle,
12screenshots8browsercases. Independentcode/visualreviewAPPROVES with58tests/
1441assertions passing; it is delivered in PR32. The camera-controls follow-up
081929e is also delivered. CURRENT principle supersedes bottomtime: information
TOP,actionsBOTTOM across observation/camera. Independent144tests1931assertions,
21lifecycle10captures andcode/visualapproval71tests1576assertions pass.
UpdateSAMEPR32. Neitherassetisdeployed;
unchanged0.3.1/schema5/observation-v3 labels do not establish exact installed bytes.
Prior merge/rollout authority is complete and does not authorize this new slice.
PR30 merged as48a106d after explicit merge+two-service-rollout authorization.
Decisions0023/0024 source and isolated visual fixtures independently pass.
Paired HTTP deployment and independent health/static/preservation checks pass;
consult the named authorized merged-service rollout VALIDATION entry.
Directory-only live browser captures pass.
Obtain actual user feedback separately; do not repeat the completed rollout.
Use exact existing owner LaunchAgents, versioned release/pinned Bun, a static
eight-link private directory, fixed focused routes, and one store per process.
Preserve existing OAuth state, private env, routes, and unrelated dirty docs.
Do not reinstall the personal plugin, change Mac power/login, auth or routes,
contact the printer, or implement missing mappings under this rollout. Source exposes
exactly `observe_printer` with its closed nine-view enum plus
`open_printer_camera`; app-only refresh, legacy aliases, and five camera helpers
remain hidden. Source uses observation-v4, camera-v5, frozen legacy resources, one
explicit-refresh/coalescing/stale-retention store, and selected-module
projections. Camera is separate and overview is deferred. Preserve decision
0020 fan-out and the secure remote boundaries. The personal plugin remains its
separate PR28 installation. Actual-phone/PiP, mounted widgets, real-printer
behavior, and user acceptance remain distinct from HTTP asset availability.
```
