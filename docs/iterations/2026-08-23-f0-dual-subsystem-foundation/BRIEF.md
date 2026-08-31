# F0 dual-subsystem foundation brief

- Iteration ID: `2026-08-23-f0-dual-subsystem-foundation`
- Date opened: 2026-08-23
- Working baseline: `32762dd`
- Status: active
- Subsystems and boundary: Orca Preparation, handoff boundary, and Printer Operations
- Current execution order: the user has explicitly authorized isolated
  headless-browser validation of decision 0023's reviewed widget source after
  the supported browser was unavailable. Exercise actual current assets with
  synthetic observations/media, inspect phone-width screenshots and display
  controls, and repair only bounded discovered presentation defects. The
  validator's final pass covers 67 observation and 22 camera captures with
  no overflow or console errors. Three screenshot-based P2 corrections address
  thermal numeric contrast, footer warning contrast, and Jobs wording.
  Independent follow-up review and scoped visual QA pass; the follow-up source
  and evidence are pushed as `643b5dd` through draft PR30. Next obtain separate
  authorization for merge/rollout and actual mounted-phone validation. Keep
  independent implementation, validation, and visual-review roles. Source is
  already delivered in draft PR30; the final independent visual disposition is
  in `design-qa.md`. This approval does not include merge, deployment, installation,
  services, printer access, or missing backend mappings. PR28/PR29 and the
  persistence rollout are historical
  delivered work, not tasks to repeat. No service, installation, OAuth,
  routing, Mac login/power, or printer-control change is included in this
  presentation slice. Orca Preparation discovery remains preserved and neither
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
