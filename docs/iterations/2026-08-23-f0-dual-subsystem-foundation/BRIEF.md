# F0 dual-subsystem foundation brief

- Iteration ID: `2026-08-23-f0-dual-subsystem-foundation`
- Date opened: 2026-08-23
- Working baseline: `32762dd`
- Status: active
- Subsystems and boundary: Orca Preparation, handoff boundary, and Printer Operations
- Latest priority (2026-08-31): bounded Heads reference refinement before Queue,
  under decision 0029/OBS-010. Preserve the white outer card; use soft 6% washes
  from actual valid filament colors, exact swatch/hex and accessible Copy, real
  tool/state/material/temperature, bottom Refresh and independent freshness.
  Source 0.4.2/schema 8/observation-v8/camera-v8 (eighteen resources) passes
  author 106 tests/2,290 assertions and TypeScript; independent 200 app/2,855,
  21 lifecycle, 22 shipping, 86 fixtures/751 and bundles/exact assets pass.
  PR45 reviewed `e369ca4` was approved and merged as `90d9f9d`; exact release
  `20260831-90d9f9d-pr45-20260831T152746-190348` is deployed. BOTH services were
  explicitly restarted and are loaded/healthy/integrity verified; fourteen
  static and sixteen security checks pass, config/auth/routes preserved,
  no rollback. Independent manifests/three health/seven static checks, one fresh
  four-head/material read and 35 exact served-widget VM assertions pass. Order is now
  A/F/Heads (deployed) → B → C → D → E; Queue integration is next. Browser/device
  visual and native clipboard acceptance remain unverified. These docs-only
  rollout records require no redeployment of unchanged application bytes.
- Current result (2026-08-31): PR43 reviewed head `41546d9` merged as `92a62c0`
  and shipped exact release `20260831-92a62c0-pr43-20260831T150042-2e7c64`.
  BOTH services were explicitly restarted and are loaded/healthy/integrity
  verified at 0.4.1/schema 8/observation-v7/camera-v8. Fourteen exact static and
  sixteen security checks pass; OAuth/environment/config/routes are preserved
  without rollback. Independent exact-release/manifest, fourteen local/thirteen
  tailnet static and tailnet-health checks pass; one private refresh returns
  a known/fresh active 11 by 11 mesh at `2026-08-31T19:03:22.696Z`.
  Visual/device acceptance remains unverified. Next integrate Queue while the
  user reviews F. These docs-only rollout records need no app redeployment.
- Previous result (2026-08-31): PR41 reviewed head `744f7d0` merged as `b6142de`
  and shipped via `u1-ship`, release `20260831-b6142de-pr41-20260831T140555-84d50f`.
  BOTH public/dashboard services were explicitly restarted and are loaded,
  healthy and integrity verified at 0.4.0/schema 8/observation-v6/camera-v8.
  Fourteen static and sixteen security checks pass; OAuth/environment/config/
  routes are preserved and no rollback was needed. The user explicitly
  authorized merge → deploy → verify before automated browser QA so they can
  visually review the result; visual/actual-device acceptance is not claimed.
  Source validation and exact-SHA review were not waived. A preliminary plan
  stopped on a dirty BRIEF edit without external mutation; a scoped commit,
  renewed exact-SHA review and successful final read-only plan resolved it.
  Independent verification confirms the exact installed release, twelve exact
  asset comparisons, four user-facing pages, fresh four-head material metadata
  and one structurally valid real JPEG; no visual/phone/live-video pass is claimed.
- Authoritative current work (2026-08-31): complete all pending read-only U1
  widgets and apply the selected white style. Decisions 0029/0030 and
  `WIDGET_TRACKS.md` supersede prior Queue/progress deferrals and camera overlay
  directions below. Release order: A materials + white cards/index + latest
  camera + continuous progress (deployed), F interactive reported Bed Mesh
  surface (deployed), B Queue, C fans/chamber, D Current Job/History, E composed overview.
  The user's new Fluidd Bed Mesh reference prioritizes its orbitable XYZ
  surface inside the existing white card; it does not request the dark
  dashboard or printer/profile controls. Reuse the same reported grid/bounds,
  explicit units/legend, disclosed bounded height exaggeration and 2D fallback;
  preserve all existing freshness/inactive/flat states. Retain independent
  invocation and truthful coverage labels. New feedback never silently cancels
  outstanding tracks. [PR41](https://github.com/scottchu/orca-slicer-mcp/pull/41)
  delivers A with sixteen resources. Progress lower
  metrics are elapsed-only, never fabricated from the reference. Independent
  software checks (190 app/1,761 assertions, 21 lifecycle, 22 shipping,
  20 isolated/399 assertions) and source review resolve the prior contrast P2;
  rendered visual QA remains unverified. Queue adapter/model/test foundation is
  locally committed as `4fbb96c` on `feat/u1-queue-completion` (three files);
  independent bounded source/protocol review approves, closing the prior P2.
  TypeScript, 40/461 and independent six/68 pass. Queue store/widget integration
  remains active after the bounded F enhancement. Stacked B–E source work may
  continue during A's user visual-review wait; the current sequential reviewed
  release order is A (deployed) → F → B → C → D → E.
  Ship every accepted slice through the existing guarded PR/review/exact-build/
  both-service restart and verification workflow. These docs-only rollout
  records need no redeployment. Decision 0030's Bed Mesh surface is implemented
  as 0.4.1/schema 8/observation-v7/camera-v8 with seventeen resources. The P2
  face-occlusion defect is corrected; final source passes 194 app/2,731
  assertions, 21 lifecycle, 22 shipping, 22 independent/1,162 assertions and
  TypeScript/repository/bundles/exact assets. Exact head `41546d9` was approved
  without blockers and shipped in PR43. Next complete Queue's integration.
  Follow the standing merge → deploy → restart
  BOTH → verify order for the user's visual review; unavailable automated browser
  access remains an explicit unverified visual gate, not a new delivery block.
  F0/O1 are not complete.
- Historical checkpoints follow; they are not the current execution queue.
- Current result and next action: bottom-left camera information and bottom-right
  controls are implemented. Repeated same-peer track events reproducibly started
  duplicate watchers and reset the FPS window; cancellation/generation guards
  now prevent that defect. Author evidence: 83 tests/862 assertions and TypeScript.
  Independent native-browser evidence: six captures and stable approximately
  30/31 FPS after repeated tracks in synthetic playback. The user's device cause and actual printer
  stream remain unverified. Source 0.3.5/schema 7/observation-v5/camera-v7
  (v6/v5/v4 aliases, fourteen resources) is shipped in PR38 (`a35c92c` reviewed,
  `b565eec` merged), release `20260831-b565eec-pr38-20260831T130407-2e3c85`.
  Both services were restarted and are healthy/integrity verified; fourteen
  static and sixteen security checks pass with private configuration/auth/routes
  preserved, without rollback. Finish only the docs-only rollout-record merge;
  source/tests are unchanged, so no redeployment. Queue/minimal-progress work
  and actual user-device acceptance remain deferred.
- Previous completed result: the measured live-FPS slice is reviewed and
  shipped in PR36 (`40d359b` reviewed, `3fc918e` merged), release
  `20260831-3fc918e-pr36-20260831T124701-e914a1`. Both U1 services were
  explicitly restarted and verified at runtime 0.3.4/schema 7/observation-v5/
  camera-v6. Fourteen static and sixteen security checks pass, private
  configuration/authentication/routes are preserved, and no rollback was needed.
  Its docs-only rollout record is merged without a second deployment for
  unchanged app bytes. Actual phone/live-video acceptance and queue/minimal-
  progress work remain separate pending tasks.
- Previous completed result: PR34's exact reviewed head `97b5106` merged
  as `7194361` and the repository shipping workflow completed deployment,
  explicit restart of BOTH U1 services, and verification. Installed release
  `20260831-7194361-pr34-20260831T121439-3ba53f` reports 0.3.3/schema 7/
  observation-v5/camera-v5; both services are loaded, healthy and integrity
  verified. Fourteen static and sixteen security checks pass with private
  configuration/authentication/routing preserved. Independent live checks
  confirm a known/fresh active 11 × 11 Bed Mesh (range 0.407500 mm) and a
  visually inspected real JPEG snapshot. No calibration, printer control,
  mounted-phone or live-video acceptance is claimed. Its docs-only rollout
  record needed no second deployment. Queue WIP,
  minimal-progress redesign and phone/live-video verification remain pending.
- Historical first release attempt, resolved: PR34's shipping run stopped before
  merge because Bun compilation left a generated hidden `.bun-build` app file.
  Apply decision 0028's narrowly scoped ignore/regression repair, independently
  approve the new exact head, then retry shipping. Do not relax other clean-tree
  guards. No new deployment occurred; verified PR33 is still running.
- Previous execution order (before successful PR34 shipment): the urgent rollout
  of already-merged PR33 is complete. Both public and dashboard services run
  release `20260831-7b9c4d4-widgets`, runtime 0.3.2/schema 6/observation-v4/
  camera-v5, explicitly restarted and healthy/integrity verified; fourteen
  static and six security checks pass. An independent follow-up also passes
  thirteen exact static/seven security checks and visually verifies a real
  JPEG snapshot; mounted-phone/live-video acceptance remains separate.
  Decision 0028's repository shipping skill/script and decision 0027's real
  read-only Bed Mesh slice are now implemented and software-validated, from a fixed operations-adapter query
  through independently fresh shared-store state to a compact 2D focused view.
  Preserve information above/actions below, distinguish inactive/missing/failed
  data, and accept a valid all-zero reported grid. Validation passes 165 app
  tests/2,200 assertions, 21 lifecycle and 21 shipping tests, 24 independent
  focused tests/228 assertions, nine captures/fifteen browser checks/twenty-eight
  routes, all three bundles/signatures/exact asset comparisons and TypeScript.
  Seven independent shipping method checks and skill validation also pass.
  Complete final independent exact-commit approval, then deliver/merge a new
  PR. The user's subsequent explicit
  authorization includes deploying that exact merged build, restarting BOTH
  public and dashboard U1 services, and verifying loaded release integrity and
  readiness. Preserve OAuth, configuration, and Tailscale routes; do not
  reinstall the plugin or control the printer.
  PR33 is already merged at `7b9c4d4`; runtime 0.3.3/schema 7/observation-v5 is
  this slice's source target, not an installed release. Queue WIP remains
  paused and excluded; the user's rejected progress styling and reported
  mounted-phone/live-video behavior remain unresolved; real JPEG acquisition
  is separately verified above.
  The previous deployment/restart authority gap is superseded, but rollout
  completion for Bed Mesh/the new operator workflow remains unverified until
  performed. The earlier runtime 0.3.1 service check is superseded by the
  completed PR33 rollout above, not evidence of Bed Mesh deployment.
- Previous execution order, completed and merged in PR33: decision 0025's Current Job and
  Job History widgets. Keep stable `jobs` for Current Job and add `job_history`
  for independently callable history; directory entries become separate.
  History remains explicitly unimplemented, without fabricated empty success
  or acquisition time. Preserve information above/actions below and source
  safety boundaries. Advance source to runtime 0.3.2/schema 6/observation-v4
  while retaining old observation aliases and frozen resources. Independent
  validation passes 148 app tests/2,011 assertions, 21 lifecycle tests,
  TypeScript/repository/bundle/signature/asset checks and skill validation.
  Six rendered captures, nine browser cases and thirty route checks pass with
  zero external requests/errors/acquisitions. Independent code/visual review
  approves without findings, with 30 tests/1,085 assertions and all six
  captures checked. Deliver through a new PR, then merge the validated
  slice under the user's latest merge-as-we-go authorization. PR32 is already
  merged as `47bfd37`; do not reopen its delivery task. No deployment, plugin
  install, service restart, auth/routing change, printer access or actual
  history-backend integration is authorized by this presentation split.
- Previous source slice, merged in PR32: apply the user's principle, information
  above and actionable buttons below, across current observation and camera
  widgets. Decision 0023's newest supersession and OBS-008/CAM-008 replace the
  earlier timestamp-at-bottom requirement: observation time/freshness/errors
  join the top title area; Refresh/Retry alone remain at the bottom right.
  Camera state/time/feedback move to a top stack, while PiP/Fullscreen/Live
  stay bottom right. Preserve all data, segmented-layer semantics and camera
  media behavior. Independent validation passes 144 app tests/1,931 assertions,
  21 lifecycle tests, repository/TypeScript/bundle/signature/asset checks and
  ten browser captures. Independent code/visual review approves without
  findings, with 71 tests/1,576 assertions passing. Update the same PR32.
  No deployment, merge, plugin/service, auth/routing or printer action is
  authorized by this layout refinement.
- Previous source follow-up, delivered as `081929e`: group camera fullscreen and picture-in-picture
  (its bottom status/time placement is superseded by the current principle)
  beside Go Live/Close at the bottom right, per decision 0023's newest dated
  refinement. Keep status/time left, accessible targets, responsive wrapping,
  and existing media/display behavior; no runtime signaling change. Validate
  and independently review this implemented layout-only follow-up in existing
  PR32. Independent validation passes 143 app tests/1,865 assertions,
  21 lifecycle tests, repository/TypeScript/bundle/signature checks and five
  captures. Independent code/visual review approves without findings, with
  51 tests/556 assertions passing. Camera JavaScript is byte-identical.
  Preserve its already delivered segmented-progress source and tests. No
  merge, deployment, plugin/service/auth/routing change or printer access is
  authorized by this request.
- Completed source baseline in PR32: the user's implemented segmented-layer progress
  refinement under decision 0023's dated addendum. Keep the existing card,
  reported percentage, and bottom timestamp/refresh footer; replace only the
  continuous strip with truthful layer-position blocks, responsively grouping
  large totals. Invalid or absent layers remain explicitly unavailable rather
  than borrowing print percentage. Separate author, validation, and independent
  review roles must verify source and rendered synthetic fixtures before PR
  delivery. Independent validation passes 142 app tests/1,849 assertions,
  21 lifecycle tests, repository/TypeScript/bundle/signature checks, twelve
  screenshots and eight browser cases. Independent code/visual review approves
  without blocking findings, with 58 tests/1,441 assertions independently passing.
  PR30 merge and rollout are complete historical evidence: release
  `20260831-48a106d-widgets` serves runtime `0.3.1`, schema `5`,
  observation-v3/camera-v5, quiet footers and the private eight-link directory.
  Do not repeat that rollout or treat its authorization as permission for this
  new source slice. Merge, service deployment/restart, plugin installation,
  authentication/routing changes, printer access/control, and missing-domain
  mappings remain excluded. Actual-phone/PiP and user comprehension remain
  separate gates. Orca Preparation discovery remains preserved and neither
  subsystem becomes secondary.
- Current evidence-maturation order: chronological journal, reviewed knowledge,
  thin workflow skills, the explicitly requested read-only status-view
  prototype, repeated host use and non-user fixtures, then a shared CLI only if
  it proves useful

## 2026-08-27 mounted-app recovery acceptance

- Keep `status-v4.html` as the only URI advertised by current tool descriptors,
  but serve `status-v3.html` as a compatibility resource for cards retained by
  an older task.
- Prove both resource URIs return the exact same self-contained widget and
  preserve empty external CSP domains.
- Keep the release executable path portable and relative to the installed
  plugin root. Diagnose an old task separately from the current installed
  runtime; plugin upgrade acceptance requires a new task.
- Treat the private `:8444` standalone dashboard as a separately supervised
  developer adapter. A 502 there must not be reported as an MCP, printer, or
  mounted-widget failure.
- For that mounted-app recovery slice, preserve exactly four model-visible and
  three app-only read-only tools. Decision 0018 below supersedes the current
  inventory with four app-only helpers. No printer control or media URL is
  added.

## 2026-08-28 camera-only presentation acceptance

- Add `open_printer_camera` as the stable presentation intent and remove
  `open_u1_camera_stream` from model visibility.
- Mount one snapshot-first `camera-v1.html` resource; Go Live, bounded stream
  signaling, Close, and automatic snapshot fallback stay inside the widget.
- Serve the exact camera widget at `/dashboard/camera` only when the private
  dashboard adapter is explicitly enabled.
- Preserve exactly four model-visible and now four app-only read-only tools.
  Do not add printer control or a direct media URL.
- Treat focused route success, mounted-host playback, TURN allocation, and
  user-visible success as separate evidence layers.

## 2026-08-28 camera workflow repair acceptance

- Keep exactly one model-visible camera command: `open_printer_camera`.
  Snapshot refresh, activation, stream open, answer, ICE, and Close remain
  app-only widget implementation details.
- Require a one-time private activation minted only after explicit Go Live.
  Stale direct stream calls must fail before printer access or lease allocation.
- Release unanswered WebRTC offers within 15 seconds and retain the existing
  explicit Close plus maximum-duration bounds for answered sessions.
- Advertise `camera-v2.html`, retain v1 as a current-asset compatibility alias,
  and expose tool schema 3 plus camera widget v2 from health and doctor.
- Validate, merge, stage, install, and restart only the existing U1 services.
  Preserve OAuth state and every Tailscale Serve/Funnel handler byte-for-byte,
  and keep source/software, installed runtime, public edge, private dashboard,
  mounted host, and user outcome as separate evidence.

## 2026-08-29 composable observation acceptance

- Follow decision 0021 and the user-selected Instrument Strips direction. The
  camera is a separate focused strip in the same 720-pixel visual system; do
  not build the rejected giant machine map.
- Expose exactly two model-visible presentation intents:
  `observe_printer`, with required enum values `overview`, `progress`,
  `thermals`, `heads`, `jobs`, `queue`, `fans`, and `bed_mesh`; and
  `open_printer_camera`. Keep refresh, camera frame, activation, signaling,
  retry, and Close helpers app-only.
- Use `u1-observe-printer` as the one user-facing observation skill. It routes
  natural language to those exact intents and does not add runtime authority.
- Project every non-camera view from one normalized current observation with
  source time, freshness, connection epoch, session identity, provenance,
  capability evidence, and domain values. Focused views must not own printer
  calls, normalization, or independent refresh loops.
- Treat camera acquisition time separately and preserve camera-v4
  snapshot-first, explicit Go Live/Close, repeated-open, fan-out, and privacy
  behavior. Camera v3/v2/v1 remain byte-preserving compatibility resources.
- Accept implemented `progress`, `thermals`, and `heads` projections from
  already normalized data and the aligned focused camera. Keep unnormalized
  cavity, materials/color, history, queue, fans/purifier, and bed-mesh values
  explicitly unknown until their live read-only source semantics are mapped.
- Render `Unavailable`, `Unknown`, `Stale`, and `Offline` explicitly. Do not
  turn missing fields into zero, infer filament color/material from a profile,
  or treat advertised object presence as runtime acceptance.
- Keep the exact former `status-v4.html` and `status-v3.html` bytes readable for
  mounted tasks. The new `overview` remains unavailable until all focused
  modules pass, then composes those exact projections with no second data path.
- This source slice remains static/fixture-only. It does not authorize
  live-printer contact, installation, service restart, routing/authentication
  changes, printer control, or publication.

## 2026-08-30 personal service persistence acceptance

- Decision 0022 addresses F0's deployment-lifetime question: a temporary design
  preview is not a persistent user entry point. Reuse the existing supervised
  protected HTTP and private dashboard services, not a new root daemon.
- Stage versioned bundled HTTP code/assets and copy the existing Bun runtime
  into release-local `bin/bun`. Use `scripts/u1_service.py` through `uv run`
  for stage/install/status/start/stop/restart/rollback; `install --dry-run`
  validates the staged release and effective private paths before any stop.
  Preserve private env configuration, OAuth state, exact labels, logs, and
  current routes. Provide bounded local install/status/start/stop/restart and
  rollback procedures; no MCP Admin surface or generic service manager.
- Serve exact private focused paths for progress, thermals, heads, jobs, queue,
  fans, bed mesh, and camera. Default `/dashboard` to progress; overview stays
  deferred. Public `/dashboard*` remains unavailable.
- Share one observation store across requests within each service process.
  A cold store performs its first acquisition on demand; subsequent plain reads
  use cached state and explicit due refreshes coalesce. Disable ambient
  dotenv/bunfig loading while preserving the explicit existing env-file.
  Do not claim cross-process/restart storage, subscriptions, background camera,
  automatic log rotation, boot-before-login, or availability while asleep.
- Repository/fixture acceptance precedes merge and authorized rollout. Local
  readiness checks use health/static routes only, without printer status or
  camera acquisition. Record deployed process, assets, route/auth preservation,
  mounted host, real-printer, and user outcome as distinct evidence layers.

## 2026-08-31 quiet focused-widget presentation acceptance

- Follow decision 0023. Keep useful titles, content, and head cards; remove
  visible read-only copy, duplicate provenance/current-reading lines, and
  command/version chrome. Put source time and one refresh control in a shared
  non-camera footer. Preserve explicit stale, offline, and unknown states.
- Camera has no external header/footer, observation line, or refresh control.
  Its image overlay carries Snapshot, Fallback, or Live with the accepted
  image/frame time. Network/FPS debug is hidden; fullscreen and PiP remain
  feature-detected presentation actions, never printer controls.
- Snapshot time remains bound to the successfully displayed JPEG and uses
  successful acquisition receipt time. Live time advances only with genuine
  video-frame evidence, freezes on stall, and is not called printer capture
  time. Failed refreshes must not retimestamp retained images.
- Fix finite host initialization/result-delivery states without replacing
  unknown/unavailable capabilities with demo values. A pending view must end
  in data or actionable failure. Queue, fans, bed mesh, cavity, filament
  identity, and job history are not accepted capabilities merely because a
  view is registered.
- Separate software/synthetic-host checks from rendered visual and mounted
  iPhone acceptance. Browser inventory is currently unavailable; source and
  HTTP checks cannot accept screenshots, fullscreen/PiP behavior, or the
  user's visual outcome.

## 2026-08-31 private widget-directory acceptance

- Follow decision 0024 and updated DEPLOY-002: private `/dashboard` and
  `/dashboard/` serve the same static directory, replacing only the earlier
  root-to-Progress redirect. All eight focused URLs remain unchanged.
- List Progress and Camera as implemented; Thermals, Heads & Filaments, and
  Jobs as partial with their missing domains named; Queue, Fans, and Bed Mesh
  as unimplemented data capabilities whose explanatory views remain openable.
  These labels describe release coverage, never live printer health.
- Use existing 720-pixel light/dark styling and compact keyboard-accessible
  links. No giant map, embedded widget, refresh/observation/permission chrome,
  search/filter system, external assets, or new client-side dependency.
- Prove root/focused routing, public rejection, exact hrefs, zero directory
  acquisition, no overflow at 320/390/720 pixels, and visible keyboard focus.
  Preserve quiet focused-card footer and camera behavior regressions.
- Source and synthetic browser evidence do not deploy the feature or prove
  mobile-host, printer, missing-domain, or user-outcome acceptance. Separate
  authorization remains necessary before merge or rollout.

## Outcome

Correct the durable product contract to two peer subsystems, then identify the
first concrete OrcaSlicer and printer environments and a provisional handoff
that can be validated without guessing.

## Scope

- supersede the single-boundary product decision;
- align product, architecture, roadmap, requirements, and continuity records;
- inventory the exact OrcaSlicer invocation and profile environment;
- inventory the exact printer, camera, host, notification, and network
  environment;
- classify read-only Monitor, authorized Control, and unexposed Admin surfaces;
- define direct-query, subscription, freshness, reconnect, and surface-neutral
  application boundaries;
- define preparation provenance and distinct upload/start/session states;
- preserve authorization, privacy, and evidence boundaries.

## Requirements

Primary discovery targets: `PREP-001` through `PREP-006`, `ORCA-001` through
`ORCA-006`, `HANDOFF-001` through `HANDOFF-006`, `SESSION-001`, `OBS-001`
through `OBS-006`, `CAM-001` through `CAM-007`, `CTRL-001`, `SAFE-001`,
`DATA-001` through `DATA-004`, `AUTH-001` through `AUTH-004`, `API-001` through `API-005`,
`ARCH-001` through `ARCH-005`, `ONTO-001` through `ONTO-002`, and `PORT-001`
in `docs/requirements.md`.

## Acceptance criteria

- current authoritative records describe the same two peer subsystems;
- OrcaSlicer is an adapter inside Preparation, not a later Operations adapter;
- prepared, uploaded, start acknowledged, and observed printing are distinct;
- a new accepted ADR supersedes decision 0001 without erasing its history;
- repository checks pass and a separate agent finds no unqualified old framing
  outside the superseded decision;
- Moonraker capabilities distinguish observed, advertised, and documented
  behavior without treating command discovery as authorization;
- MCP remains a replaceable surface around shared application use cases;
- implementation and hardware acceptance remain explicitly unclaimed.
- decision 0016 records the local-first bridge direction and supersedes only
  decision 0015's requirement that a hosted widget signal through exact HTTP;
- the hosted widget has no LAN, Tailscale, or media HTTP fetch path and declares
  empty external connect, resource, and frame CSP allowlists;
- the local connector reaches only fixed read-only status, snapshot, and
  `webrtc-camerastreamer` operations through the Printer Operations adapter;
- application-owned WebRTC sessions expose opaque session IDs and bounded
  offer, answer, ICE-candidate, expiry, concurrency, and idempotent close
  semantics without exposing the printer peer ID or a caller-selected URL;
- the MCP Apps bridge is the hosted signaling path; the existing exact HTTP
  adapter may remain for the standalone developer dashboard but is not a
  normal-user dependency;
- snapshot fallback still works, the existing status/snapshot tool contracts
  remain read-only, and every `show_u1_status` result retains its 1200 by 1500
  PNG fallback;
- Marketplace, Homebrew, and npm packaging point to one setup and doctor
  contract. Setup writes validated local configuration without manual
  environment-file editing, and release packaging has a self-contained-runtime
  direction so Bun is a build-time concern rather than a user prerequisite;
- local tests prove the static/software and simulated protocol boundaries.
  They do not claim physical-printer, mounted-host, package-installation, or
  user-outcome evidence;
- no upload, start, pause, resume, cancel, G-code, generic proxy, Control, or
  Admin tool exists; no external package or service is published or changed.
- decision 0017 records the separate private enrollment listener and
  configurable authenticated TURN boundary without changing the four plus
  three read-only tool inventory;
- public enrollment routes reject, while a separate loopback listener serves
  only enrollment and minimal health for a distinct tailnet-only Serve HTTPS
  origin sharing the public OAuth hostname and WebAuthn RP ID;
- public MCP and app signaling require OAuth `u1.monitor`, optional exact HTTP
  media signaling retains short-lived single-use capability authentication,
  and no generic public media route exists;
- bounded explicitly configured STUN plus short-lived TURN REST credentials
  reach the printer peer and only widget-private metadata; model-readable
  content contains no TURN credential, shared secret, printer origin, peer ID,
  or session capability;
- local fixtures prove static/software and simulated protocol behavior only.
  Public routing, TURN allocation, real-printer media, mounted ChatGPT/Codex
  playback, and user outcome remain unclaimed.

## Local-first safety boundary

- This slice is Monitor-only and read-only with respect to printer and user
  data. Signaling may create and tear down only bounded in-memory presentation
  sessions.
- Hosted widget code receives no printer URL, Tailscale URL, printer peer ID,
  credential, or generic network target. Session capabilities stay in
  widget-private tool metadata and expire automatically.
- The connector accepts one validated private or loopback printer origin and a
  fixed operation allowlist. It does not expose arbitrary HTTP, JSON-RPC, file,
  shell, or G-code access.
- Setup and doctor must not probe hardware during repository validation.
  Physical-printer access requires fresh explicit authorization and remains a
  separate evidence layer.
- Packaging work ends at local manifests, scripts, and ephemeral validation
  artifacts. Marketplace, npm, Homebrew, hosted services, OAuth state, and
  installed plugins are not changed by this iteration slice.
- Passkey enrollment is absent from the public handler even when a one-time
  token exists. Its dedicated listener binds loopback and is safe to expose only
  through a distinct non-Funnel Tailscale Serve HTTPS origin.
- STUN and TURN configuration is supplied outside the repository and defaults
  empty. Public STUN is an explicit privacy and availability dependency. The
  TURN shared secret stays server-only; only bounded derived credentials may
  enter the WebRTC protocol path to the printer peer and widget-private tool
  metadata.

## Initial explicit non-goals and later scope change

- selecting a runtime or scaffolding either subsystem;
- the original foundation pass excluded slicing user models and printer
  actions; a later explicit user request authorized one narrow slice-and-print
  pilot, now recorded separately without retaining private artifacts;
- future printer actions remain excluded without fresh explicit authorization;
- deciding upload/start ownership without observed environment evidence;
- claiming that documentation proves software, protocol, or hardware behavior.

## Risks and unknowns

- actual OrcaSlicer automation capabilities may differ by edition and version;
- upstream OrcaSlicer and Snapmaker Orca may accept the same CLI shape while
  producing edition-specific output or interpreting vendor project data
  differently;
- profile inheritance, embedded project configuration, and custom G-code may
  create safety or provenance conflicts;
- facet-painted support data is tied to exact mesh triangle identity and may be
  invalidated by remeshing;
- printer protocols may couple upload/start behavior to one vendor;
- a shared MCP facade could accidentally obscure subsystem ownership;
- the current LAN client is trusted by Moonraker, so upstream access does not
  establish product-level authorization;
- WebSocket transport works, but object subscription and reconnect semantics
  still need a compatible client test.

## Planned evidence

- repository contract and whitespace checks;
- terminology scan for superseded product claims;
- independent architecture and consistency reviews;
- redacted real-tool and read-only protocol discovery recorded here;
- local upstream OrcaSlicer and Snapmaker Orca capability discovery with
  executable fingerprints and explicit unvalidated behavior;
- `CAPABILITY_MATRIX.md` tied to the first printer protocol and evidence state;
- ontology, API surface, and hybrid monitoring decisions with static checks.

## Exit gate

The documentation correction is complete only when current records agree and
independent review passes. F0 discovery remains active until both concrete
environments and the provisional handoff have observed evidence.

## Decision 0020 fan-out acceptance addendum

- Every explicit camera open or reopen links a fresh camera-v3 camera-only
  presentation; camera v2 and v1 remain current-asset aliases.
- The connector terminates exactly one private H264 printer upstream while one
  or more bounded viewers are active. Each viewer has a separate downstream
  peer, ICE credential set, answer deadline, candidate budget, lease, and
  idempotent Close. Closing the last viewer releases the upstream.
- Downstream forwarding clones RTP packet headers into a dedicated track and
  advertises only the negotiated H264 profile. The slice does not transcode.
- Discovered server Tailscale addresses are explicit downstream host
  candidates. Direct tailnet ICE may succeed without TURN; optional TURN remains
  a separately provisioned fallback.
- No public or model-readable surface exposes printer identity, private routes,
  upstream signaling/ICE/credentials/tickets, raw errors, or JPEG metadata.
- Acceptance requires local contract proof and later separate real-printer,
  two-viewer, mounted-host, mobile ICE, and optional TURN evidence. Source tests
  do not authorize deployment or prove those later layers.
