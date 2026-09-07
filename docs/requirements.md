# Working requirements

These IDs stabilize discussion and validation while F0 discovery is active.
They are a working product contract, not proof that the selected OrcaSlicer or
printer environments support the described behavior.

## Session and observation

- **SESSION-001:** The system represents an active print as a session joining
  the observed printer-job identity, provenance state, printer capabilities,
  observations, events, commands, and outcome. A product-managed handoff links
  the exact prepared-job manifest and artifact hash; an externally originated
  job records provenance as unavailable or unknown.
- **OBS-001:** The system reports current printer state, progress, temperatures,
  and errors when the adapter exposes them.
- **OBS-002:** Every observation records its source and time; stale observations
  are distinguishable from current ones.
- **OBS-003:** Loss of connectivity or telemetry produces an explicit unknown or
  offline state, never an inferred success state.
- **OBS-004:** Dynamic state begins from a complete source snapshot and merges
  ordered subscription deltas without treating omitted fields as cleared.
- **OBS-005:** Reconnect creates a new connection epoch and obtains a complete
  snapshot before accepting new subscription deltas.
- **OBS-006:** Normal inbound status queries read application current state with
  source time and freshness; only an explicit refresh use case requests a new
  upstream snapshot.
- **OBS-007:** Every focused printer view is a pure read-only projection of one
  normalized current observation carrying source and receive times, freshness,
  connection epoch, session identity, provenance, capability evidence, and
  domain values. MCP, HTTP, CLI, widgets, and a later overview do not query or
  normalize the printer independently. Camera frames retain their own
  acquisition time.
- **OBS-008:** Current focused cards separate information above actions: useful
  titles, observation time, freshness and content are above one bottom
  refresh/retry footer with a persistent adjacent acquisition-error status.
  Decision0041 supersedes the former action-only footer and top-area failure
  rule: initial and failed-refresh acquisition errors show static neutral
  skeletons with no visible or accessible old telemetry, no floating error
  overlay and no header/body/footer/shell height jump. Permission policy remains enforced
  without repeated visible read-only labels or provenance/current-reading
  boilerplate. Successful age-stale/offline/missing-time states remain explicit
  in the information area; acquisition errors use the footer. Unimplemented domains do not render
  decorative charts as measured data. Host loading is bounded and malformed
  or missing delivery yields static neutral content with footer guidance and, when
  authorized by the existing workflow, a bottom retry action, not perpetual waiting.
- **OBS-009:** Bed Mesh is an on-demand operations-adapter read projected through
  the shared observation store, with independent acquisition time, 15-second
  attempt bound, freshness, and retained last-success state. It distinguishes
  unknown, unsupported, unavailable, an observed inactive mesh, and a valid
  active reported probe grid (including all-zero data). Only bounded complete
  `probed_matrix` data is shown; no interpolated substitution, saved-profile
  inventory, invented probe time, physical quality verdict, or calibration or
  profile mutation is permitted. The default interactive 3D height surface and
  retained 2D grid use the same reported samples and XY bounds. Connecting
  faces are visualization, not new measurements; no resampling or smoothing
  invents data. Preserve explicit XYZ mm units, height legend, numerical
  min/max/range, XY orientation and bounded, visibly disclosed Z exaggeration.
  Provide pointer/keyboard orbit/reset and a usable 2D fallback, with information
  above bottom local-view controls and Refresh. Decision 0027 retains adapter,
  normalization and state limits; decision 0030 supersedes its 2D-only display.
- **OBS-010:** Heads show bounded printer-reported vendor, type, subtype, color
  and presence from a fixed `print_task_config` read, mapped by physical array
  index + 1. Material has independent time/freshness, coalesced bounded demand,
  and stale last-success retention; fresh thermals cannot refresh its evidence.
  Missing fields/object remain unknown, endpoint unsupported and acquisition
  failure stay distinct, and arbitrary raw configuration never reaches public
  envelopes. This is firmware metadata, not an Orca preset or sync/write action.
  Decision 0029 fixes selected field names, normalization and acceptance.
  Tool cards use a soft 6% wash of validated actual filament color over white
  (respecting reported alpha), separate from the semantic amber active-state
  accent; changing filament color cannot change active status. Swatch/hex remain
  exact.
  Unknown color stays neutral with no copy action; valid hex has an accessible
  inline Copy action with truthful feedback. Refresh stays below information.
  Decision0039's latest refinement keeps swatch, whole natural hex and Copy
  on one line. Copy has a small borderless 16px glyph inside a 44px accessible
  target; hover/focus and exact clipboard feedback remain clear. Narrower cards
  fall to one column using a public font-relative minimum rather than wrapping
  the swatch, truncating hex, overlapping targets or orphaning Copy.
  Decision0041 adds balanced hover padding from the existing card inset while
  retaining the whole inline group, 16px glyph, 44px target and clear focus.
  Acquisition failures mask displayed material/thermal values and receipts;
  internal cache/order and independent domain timestamps remain unchanged.
  Loading/ready geometry, unknown/empty behavior and focus remain stable.
- **OBS-011:** All pending focused widgets remain in the active iteration's
  durable completion matrix when new feedback arrives. Apply the selected white
  visual language to all current cards and the directory; preserve real content,
  known/unknown/stale/failure semantics and independently invokable views.
  Progress uses a continuous strip of valid reported percent with independent
  layers/ETA, not rejected layer blocks or invented speed/height/completion.
  Real Queue, fans/chamber and History precede overview composition. Unsupported
  firmware and unimplemented software must never be conflated. Each release
  requires reviewed source, guarded shipment, both-service restart and scoped
  meaningful verification under decision 0028; earlier evidence is not reused
  as acceptance of changed bytes.
- **OBS-012:** Queue is an independently timed, read-only application-store
  domain acquired only by focused Queue demand through the fixed bounded
  operations-adapter endpoint. Retain the 15-second attempt TTL, coalescing,
  last-success stale retention and atomic concurrent-domain merge; fresh status
  cannot restamp Queue. Distinguish valid empty, retained stale empty, unknown,
  unsupported endpoint and unavailable acquisition. Show reported queue state,
  total count, at most 100 ordered safe basename rows, explicit omissions,
  optional reported added time and observed waiting duration, never print ETA
  or an advancing clock. Receipt/freshness information is above bottom Refresh;
  acquisition failure masks prior rows/receipts with static neutral skeletons
  and persistent adjacent footer status under0041. Retained stale empty in the
  store is not a successful empty UI after failed acquisition. Reject invalid or unsafe data even in hidden rows;
  IDs, paths, raw metadata/failures and credentials do not leave the adapter.
  Decision 0029 fixes integration/acceptance; no queue or file mutation is added.
- **OBS-013:** One independently timed, demand-only environment observation
  supplies Cavity temperature to `thermals` and fixed part/cavity/purifier fan
  facts to `fans`. It uses the exact decision-0029 object/field allowlist,
  physical Tool 1–4 mapping, finite °C/commanded-percent/RPM bounds, 15-second
  attempt TTL, coalescing, stale last-success retention, atomic domain merge and
  fixture isolation. Fresh printer status cannot restamp it. Distinguish known
  zero/off/stopped, nullable RPM not measured, purifier power not detected,
  component not reported, endpoint unsupported, unavailable and stale. Never
  infer fan health/fault from commanded speed versus RPM or use purifier desired
  temperature as a Cavity target. Information and independent freshness stay
  above one bottom Refresh. Decision0041 masks prior values/receipts on acquisition
  failure and locates persistent status beside Refresh, without changing cache,
  ordering or successful age-stale semantics. No fan/purifier/thermal control is added.
- **OBS-014:** Current Job and Job History are separate independently timed,
  demand-only application-store domains. `jobs` uses only the fixed bounded
  print_stats/virtual_sdcard query; `job_history` uses only the fixed descending
  first page of 20 history rows. Each has its own 15-second attempt TTL,
  coalescing, stale last-success retention, atomic merge and fixture isolation;
  neither acquires or restamps the other. Current Job treats only printing and
  paused as active and labels persisted filenames without implying a terminal or
  standby file is current. History preserves returned order/duplicates and
  treats count as returned-page length, not total; valid zero means no entries
  returned, not no past jobs. Only validated safe basenames and bounded
  allowlisted state/time/duration/filament/storage facts leave adapters. Raw
  paths, IDs, user, metadata, auxiliary data, file-existence and raw future
  statuses never do. Missing/partial, unknown, known empty, unsupported,
  unavailable and stale remain distinct. Each compact white card keeps its own
  information/freshness above one bottom Refresh; no pagination, row action,
  mutation or printer control is added. Acquisition failure uses0041's neutral
  masking/footer status; internal retained state, valid empty/unknown and
  successful age-stale evidence remain distinct. Decision 0025 fixes exact semantics.
- **OBS-015:** Overview is one compact read-only composition of the exact eight
  accepted focused projections: Progress, Thermals, Heads, Current Job, Job
  History, Queue, Fans and Bed Mesh. Explicit Overview demand acquires main
  status plus the six independent non-camera domains concurrently through their
  existing readers, receipts, 15-second attempt TTLs, coalescing, stale
  retention and fixture isolation. It adds no adapter, cache, timer or
  normalization path; static/index/health and unrelated focused views never
  fan out, and Camera remains separate. Each headline tile preserves its own
  state, source time, freshness and reason, while the header printer state/time
  belongs only to main status. Coverage is `complete` when all eight projections
  have known or retained stale data, `partial` when some but not all do, and
  `none` when none do; this is coverage, never overall health or freshness.
  Render one compact responsive white card with privacy-minimized headline
  facts, two columns collapsing to one and exactly one bottom Refresh. Do not
  embed full cards, lists, charts, mesh surfaces, navigation, pagination,
  controls, Camera/media, filenames, projects, IDs, raw rows or metadata.
  Decision 0021 fixes the projection and presentation boundary.
- **MON-001:** A standalone asynchronous monitoring workflow can attach to an
  evidenced current print and compose after observed printing for a broader
  print request. Preparation-only, upload-only and explicit start-only requests
  do not enroll it. One delegated owner binds the target and run identity, known
  artifact/manifest provenance and fresh evidence, chooses adaptive next checks,
  and reports meaningful updates and immediate alerts while the primary remains
  available. Duplicate requests reuse that owner. Telemetry and camera confidence
  remain distinct; bounded recovery and resumed monitoring require fresh identity
  verification, never automatic attachment to a different run. Verified print
  terminal outcomes, user-stopped monitoring and interrupted/unavailable execution
  are separate. Monitoring adds no printer control authority and makes no durable
  service or external-notification claim. Decision 0045 and the maintained
  u1-monitor-print skill own this active-conversation workflow.
- **CAM-001:** An available camera can provide a timestamped on-demand snapshot
  associated with the relevant session.
- **CAM-002:** Camera-derived diagnoses expose uncertainty and begin as advisory
  evidence rather than autonomous triggers.
- **CAM-003:** Camera images are separately timestamped on-demand,
  event-triggered, or bounded-interval observations; continuous video ingestion
  is not required for the first monitor.
- **CAM-004:** A user-opened continuous camera presentation creates an opaque,
  bounded downstream WebRTC signaling session with the connector. The
  connector terminates one shared H264 peer with the printer-advertised,
  same-origin `webrtc-camerastreamer` behind the private operations boundary
  and fans cloned encoded RTP packets into independent per-viewer tracks. An
  optional exact HTTP adapter may exchange an authenticated single-use grant
  for one such downstream session. Presentation FPS is measured in the browser.
  Viewer count, answer time, duration, candidates, and Close are independently
  bounded. ICE configuration defaults empty. A bounded explicit STUN list may
  be supplied as an external privacy and availability dependency; robust remote
  use may use per-viewer RFC5766 TURN REST credentials derived from a server-only
  shared secret. Validated snapshots remain an explicit fallback. This does not
  imply transcoding, persistent ingestion, or diagnostic quality.
- **CAM-005:** A hosted MCP App iframe performs no direct fetch to a LAN,
  Tailscale, or media-signaling URL. Offer, answer, bounded ICE candidates, and
  close cross the MCP Apps `tools/call` bridge; opaque session and offer data
  remain component-private. The local connector alone invokes the
  printer-advertised fixed signaling route.
- **CAM-006:** The printer upstream and viewer downstream use distinct bounded
  ICE-server sets. Each downstream viewer receives separately issued
  credentials and may use an explicitly advertised server Tailscale host
  candidate, STUN, or TURN. TURN usernames contain a bounded expiry and nonce,
  credentials are derived with HMAC-SHA1 from a server-only shared secret, and
  only downstream-derived credentials enter widget-private metadata. Printer
  origins, upstream SDP/candidates/peer IDs/tickets/credentials, session
  capabilities, and TURN secrets remain absent from every public or
  model-readable envelope.
- **CAM-007:** Closing or failing one viewer does not interrupt another. The
  shared printer upstream closes when the last viewer closes or fails. TURN is
  a fallback, not a prerequisite when a direct server host candidate is
  reachable.
- **CAM-008:** The independently accepted Camera source has a thin white header
  with icon/title and state/measured FPS/frame time. Its media extends edge to
  edge across the whole lower card, with square top media corners and bottom
  clipping supplied by the outer card radius and overflow containment. Camera
  has no footer or Refresh button. A persistent short safe failure reason
  overlays the media at bottom left, clear of the bottom-right controls; the
  compact header holds only icon/title/state/FPS/time. Decision0046 records this
  explicit user-approved Camera-only exception to decision0041's footer placement;
  other widgets retain their footer/Refresh/error contracts. Display/mode
  controls stay accessible at the media's bottom right. Decision0050 preserves
  the current delivered layout as baseline but selects a future Camera-only
  placement refinement: move the current top-right information plus truthful
  loading/error messaging into bottom overlays inside dynamic media. That
  migration is not implemented or visually/device accepted; it requires a
  separate candidate and preserves Auto/Live, media/session/control, privacy,
  fullscreen and frame-evidence semantics from decisions0046/0047. The current
  candidate uses only Auto / Live through generic common animated `Switch`,
  fixed at 88px wide and 44px high in the Camera media's
  bottom-right corner. Auto is the default for a new mount; remove the separate
  single-Snapshot mode. The latest user instruction supersedes old resource
  compatibility: retire prior version aliases, obsolete widget bundles and
  compatibility-only tests, and publish only current widget resources. Preserve
  the eight legacy renderers still required by the current observation resource,
  current behavior/security/lifecycle coverage, deployment backups and other
  worktrees. Historical URI/hash preservation is prior evidence, not a current
  requirement. Independently accepted `aaaf0a56` provides two MCP resources
  (observation17/Camera13), two public and six app-only tools. It removes30 old
  aliases, show/get_u1_status, `/camera-widget` and18 obsolete files (eight HTML,
  five unused source/build files and five compatibility-only tests). Active
  `/widget` serves current MCP observation; duplicate HTML/vendor injection is
  retired. Build-contract inventory follows current assets/routes, with retired
  route/resource/tool rejection coverage and unchanged hash/tamper/isolation/
  security/runtime-config-preservation/rollback/shipping guards. Required source
  acceptance passes and PR104 is deployed at `162dc68`; scoped installed-byte/
  synthetic Camera and Jobs behavior passes. Its first attempt stopped before merge/install
  because current binding validation
  rejected the installed historical PR101 manifest. New stage/ship manifests must
  use schema2/current binding; installed status/rollback must strictly validate
  supported historical schema1 Kit profiles with their original hashes/minimums/
  roles, while pre-Kit release-schema1 retains its six-asset minimum. This bounded
  guard repair is independently accepted at `b5a0d427`, including strict current
  stage rejection of old/missing manifests and read-only verification of BOTH
  installed PR101 services. The repaired release shipped through PR104 with BOTH
  services restarted; scoped installed-byte/synthetic behavior passes. No public
  alias or skipped guard returns, and phone Live reliability is unproved.
  Names appear only in tooltip/aria,
  superseding visible text/full-width mode controls. Keep44px targets, keyboard
  selection/focus and reduced-motion behavior; the switch must not overlap
  fullscreen or other display controls. Live failure automatically selects Auto. The user-selected
  one-word Auto label describes repeated accepted snapshots, not continuous
  video: one read at a time, with the next scheduled 1.5 seconds after completion.
  Choosing Live from Auto explicitly starts or retries Live; failure returns to
  Auto. A new mount never starts Live automatically or restores saved Live mode.
  Valid MCP opening-result hydration causes no redundant initial frame request;
  Auto schedules its next read 1.5 seconds after that accepted result completes.
  Missing initial delivery waits at most 15 seconds. Presence of private
  cameraFrame/cameraActivation keys or the DTO mediaType plus byteLength fields
  identifies a Camera delivery; authoritative malformed Camera delivery enters
  neutral error immediately. A host opening-result notification with bare
  isError: true also fails immediately without any Camera fields, preserving the
  existing opening-tool error behavior. Unrelated/unknown non-error deliveries
  do not complete the waiter or reset its original deadline. Both immediate
  failure and missing-delivery expiry schedule Auto retry after 1.5 seconds,
  with one acquisition at a time. Automatic polls produce no
  success message or success announcement. The removed manual Refresh UI must
  not be reintroduced to provide feedback. Same-mode selection is idempotent. The fixed controls remain reachable
  during error/connection, support keyboard selection and do not steal focus
  when the service changes mode. Camera connection lifecycle remains service-owned;
  components subscribe and render. Live-open user wait is bounded at 40 seconds;
  only that HostRpc call retains its response for 55 seconds, allowing the
  service to close an offer arriving after abandonment within the 15-second
  unanswered-lease window. A late offer must not revive disposed or switched
  state. Outstanding open/close work after disposal drains for at most 70 seconds.
  Keep the shared RPC default at 15 seconds, activation/local-answer/
  answer/candidate deadlines at 10 seconds, first-frame at 8 seconds, frame-stall
  at 5 seconds and disconnected-state grace at 3 seconds. This client budget
  correction is independently accepted and deployed through PR101; reliable
  phone Live remains unaccepted. It does not prove the cause of the reported
  phone fallback or extend other consumers' budgets.
  Hide/dispose cancel owned work. The same mounted card resumes its current
  explicit mode after hide/show; a new mount uses Auto and never reads or writes
  a saved Live preference. Local display
  rejection remains separate from acquisition failure. The Camera-only
  decision0041 exception changes status placement, not error evidence: failed
  acquisition still masks old media/telemetry with static neutral skeletons,
  and loading/failure/recovery retain stable card/media bounds. The mode controls
  add no grid, tint or telemetry overlay; state/FPS/time remain in the header.
  Only the short safe failure reason uses the bottom-left media overlay. It must
  stay readable and move one row above the bottom-right controls at narrow
  widths, inside the media without changing card/media bounds. Do not truncate time/FPS
  or shrink 44-pixel controls on narrow views. Snapshot/fallback time belongs to the
  accepted displayed JPEG's server receipt time; live time belongs to evidenced
  local rendered/decoded frames and freezes when they stop. Neither is claimed
  as sensor capture time. Only while live, an integer FPS value may appear
  between state and time after at least one second of actual presented/decoded
  frame-counter evidence. Omit unmeasured, invalid, reset, or stale FPS; timer
  callbacks are not frame counts. Clear FPS on exit and after 1.5 seconds
  without advancing frame evidence. Raw network diagnostics stay hidden. The bounded C08 diagnostic
  slice preserves service-owned `lastLiveFailure` with only these safe fields:
  stage (activation, offer, local-answer, answer, candidate, connection,
  first-frame, playback), outcome (timeout, rejected, failed, ended), finite
  bounded elapsedMs since that Live attempt began, connectionState (not-created,
  new, connecting, connected, disconnected, failed, closed), and boolean hadFrame
  based only on accepted presented/decoded-frame evidence. Capture the first
  winning failure before teardown. Only a short stage/outcome reason appears in
  the persistent bottom-left media overlay; elapsed/connection fields remain internal. No new panel,
  raw error, address, signaling data, session identifier, token or credential is
  exposed. An 8-second first-frame timeout retains stage first-frame internally;
  when not connected the overlay reason says Connection timed out. Successful Auto
  snapshots and frame Refresh retain the record; next explicit Live clears it.
  Cancellation, hide, disposal and stale epochs create no new failure. Preserve
  every deadline and watchdog; recording a failure causes no extra acquisition.
  The new Auto default follows the separate mode contract above. The earlier
  proposed generic Footer statusText change is superseded for this Camera slice;
  other widget footer behavior stays unchanged. The new presentation/diagnostic
  source is independently accepted and deployed through PR104 at `162dc68`;
  it does not establish the phone failure's cause.
  PR104 fullscreen uses same-document native/local CSS only. The current C01
  request supersedes that local-only direction: add acknowledged host fullscreen
  entry/exit while preserving the interactive-decoupled Svelte app, truthful
  granted mode and media/session continuity. Host-owned composer/chrome may
  remain; do not promise OS-wide fullscreen or treat local CSS as a host grant.
  Adopted decision0047 uses the existing HostRpc standard ui/request-display-mode
  with fullscreen/inline requests and partial host display-context subscription.
  A presentation service in src/lib/client owns one pending bounded request;
  Video subscribes/renders the acknowledged response/notification mode, without
  optimistic state or a CSS-only host fullscreen substitute. Fixed media layout
  starts only after the actual host grant; suspend intrinsic card-size
  notifications in fullscreen and resume one after actual inline return without
  remounting/reparenting the video. Host-driven exit is
  synchronized; Exit remains available during loading/error. Only explicit action
  focus is managed, and notifications never steal focus. Rejected/timed-out or
  disposed work must not affect the Camera session, persistent video DOM or Auto
  timers. Standalone/dashboard/Lab native fullscreen is confirmed by document
  state; otherwise report unavailable. Source d999399 implements this contract
  with independent scope approval and the required full gate, shipped in PR106
  at0660a07. Actual-host acceptance remains pending. Current-only versions are runtime0.4.12/
  schema16/observation18/Camera14, with no old aliases. Display changes cause no reconnect
  or additional acquisition.
  PiP is offered only through the existing
  live video's same-document native Picture in Picture API and makes zero host
  display-mode requests; hide the action when native PiP is unavailable. Both
  use feature detection and explicit rejection handling; API presence does not
  establish mobile support.

## Events and notifications

- **EVENT-001:** Session state transitions, observations, alerts,
  authorizations, commands, results, and post-action verification are retained
  as an ordered event history.
- **NOTIFY-001:** The system can notify the user about completion, failure,
  offline state, and requests for attention.
- **NOTIFY-002:** Delivery attempts, retries, deduplication, and final delivery
  state are observable.

## Control and verification

- **CTRL-001:** A command is offered only when supported by the connected
  printer's capability inventory and valid for the current session state.
- **CTRL-002:** Pause, resume, and cancel begin as explicitly user-directed
  commands.
- **CTRL-003:** Command intent, authorization, correlation identifier, adapter
  result, and post-command observation remain linked.
- **CTRL-004:** Acknowledgement, timeout, disconnection, and observed effect are
  distinct outcomes.
- **ADJUST-001:** Live tuning, including Z-offset, is disabled until the adapter
  establishes support, units, safe limits, persistence semantics, and a
  verification method for the target firmware.

## Safety and agency

- **SAFE-001:** Consequential or uncertain actions require explicit user
  authorization unless a bounded policy was separately pre-authorized.
- **SAFE-002:** Ambiguous state, insufficient evidence, or low confidence causes
  abstention or escalation rather than an optimistic action.
- **SAFE-003:** Agent policy cannot bypass printer firmware safety limits.
- **SAFE-004:** A bounded intervention specifies allowed deltas, stop
  conditions, re-observation, and escalation behavior.
- **SAFE-005:** Emergency stop, pause, resume, and cancel semantics are treated
  as adapter- and firmware-specific until tested on the target printer.

## Privacy and access

- **DATA-001:** Printer identifiers, local network details, camera evidence, and
  session history are private local data by default.
- **DATA-002:** Printer control is not exposed directly to the public internet.
- **DATA-003:** User models, projects, profiles, custom G-code, generated
  artifacts, local paths, and temporary files are private local data by default.
- **DATA-004:** The printer is never a public API, MCP resource, or widget peer.
  Public MCP, HTTP, health, widget, dashboard, and failure envelopes exclude
  printer IP/hostname/MAC/serial/device identity, Moonraker/camera URLs,
  upstream WebRTC SDP/candidates/peer IDs, printer credentials/tickets, raw
  upstream errors/stacks, and JPEG application/comment/trailing metadata.
- **AUTH-001:** The responsible boundary authenticates callers and records
  action-specific authority for upload, queue or selection changes, print start,
  and runtime commands regardless of which subsystem owns the action.
- **AUTH-002:** Remote Monitor sessions use short-lived audience- and
  scope-bound access tokens plus renewable sessions. Refresh tokens are opaque,
  stored only as hashes, bound to the original client, resource, and granted
  scope, rotated after one successful use, and expired without expanding
  authority.
- **AUTH-003:** A public camera relay begins only from an authenticated Monitor
  call that issues a short-lived, single-use media capability. The capability
  is absent from model-readable results and is bounded by lease duration and
  concurrency without expanding `u1.monitor`.
- **AUTH-004:** Public passkey enrollment routes reject every request. Passkey
  registration is served only from a distinct loopback listener intended for a
  tailnet-only Tailscale Serve HTTPS origin on a nonstandard port. The public
  and enrollment origins share one hostname and WebAuthn relying-party ID but
  verify their distinct origins. Public OAuth authorization and passkey
  assertion remain on standard HTTPS port 443. When the private origin is
  configured, its listener remains available for health checks even after
  enrollment; enrollment itself then returns 404 until a local reset creates a
  new one-time flow.

## API surfaces

- **API-001:** Monitor tools use an explicit read-only allowlist for status,
  capabilities, subscriptions, camera observations, health, and approved
  history reads.
- **API-002:** Control tools are separate from Monitor tools and enforce
  capability, state, authorization, correlation, and verification contracts.
- **API-003:** The first release exposes no Admin surface and no generic HTTP,
  JSON-RPC, or G-code passthrough.
- **API-004:** File, queue, database, webcam-configuration, account, service,
  update, and power mutations are classified as writes even when they do not
  immediately move or heat the printer.
- **API-005:** The source remote Monitor inventory contains exactly two
  model-visible presentation intents: `observe_printer`, with one required
  closed `view` enum, and `open_printer_camera`. The enum is exactly `overview`,
  `progress`, `thermals`, `heads`, `jobs`, `job_history`, `queue`, `fans`, and
  `bed_mesh`; `jobs` remains the stable Current Job selector while
  `job_history` independently selects Job History. Their selected modules do
  not combine current-job and history fields. Current Job and History retain
  independent acquisition, receipts and projections;
  unknown values and generic selector fields fail closed. Exactly eight
  app-only calls remain hidden: `refresh_printer_observation`, the temporary
  `show_u1_status` and `get_u1_status` compatibility aliases, and the five
  camera frame/signaling helpers. All observation tools are read-only and
  require `u1.monitor` where remote OAuth applies. `observation-v14` is the
  focused presentation resource. Every explicit camera open or reopen creates
  a fresh snapshot-first `camera-v10` presentation; Go Live, retry, Close, and
  fallback remain widget functionality rather than additional model commands.
  Observation-v13/v12/v11/v10/v9/v8/v7/v6/v5/v4/v3/v2/v1 and
  camera-v9/v8/v7/v6/v5/v4 are current-asset compatibility aliases.
  Frozen `status-v4`/`status-v3` and camera-v3/v2/v1 resources remain readable
  for retained mounted tasks without becoming a second observation path.
  Source target is runtime 0.4.8/tool schema 12 with twenty-six resources;
  this source contract does not claim deployment of those bytes to existing
  services. Observation and camera resources share one generated design-system
  fragment. Camera snapshot acquisition and decode terminate successfully or
  truthfully within twelve seconds, keep only one acquisition in flight, reject
  stale completions, and retain a previously accepted frame internally across
  retries. Decision0041 masks that frame during acquisition failure until new
  accepted evidence recovers the presentation; retention is not visible success.
  Only answer/candidate/close acknowledgements accommodate the existing raw
  Dashboard HTTP and wrapped MCP result shapes; frame/open envelopes remain
  strict. A supplemental candidate's typed 10-second timeout may preserve Live
  only for the current epoch/session, observed connected state and an accepted
  frame received less than 5 seconds ago. Invalid/rejected acknowledgements
  remain failures; first-frame 8s, stall 5s and disconnect 3s deadlines remain.
  Late acknowledgements cannot establish Live, clear failure or restore old work.
  Same-document fullscreen transitions preserve the existing media session.
  Heads and Overview present filament presence before material metadata: loaded
  retains sanitized material/color, known empty suppresses contradictory
  metadata, and unknown remains `N/A`. Fans use the fixed seven-row normalized
  projection without inferring absent speed or RPM. Bed Mesh renders only the
  reported grid, with exact 2D geometry and a locally bundled, exact-pinned
  Three.js/OrbitControls 3D view; no runtime asset fetch or printer control is
  added.

## Architecture and ontology

- **DEPLOY-001:** The optional personal HTTP deployment uses the existing
  owner-scoped process supervisor and a versioned release outside the mutable
  source checkout, with pinned runtime, file fingerprints, bounded readiness
  checks, and recoverable configuration switching. Lifecycle tooling remains
  local and allowlisted; no generic service or MCP Admin surface is added.
- **DEPLOY-002:** Private `/dashboard` and `/dashboard/` serve one static
  navigation directory for the ten accepted observation routes, including
  separate Current Job and Job History links. Existing `/dashboard/jobs`
  remains Current Job; `/dashboard/job_history` opens Job History. Each entry
  distinguishes implemented, partial, or unimplemented data coverage without
  implying live printer health. Focused routes select only accepted closed
  views. Public services do not expose these private routes. The implemented
  Overview uses `/dashboard/overview` and appears in the directory only with
  coverage-backed composition. Directory loading and health/static asset checks never
  implicitly mount widgets, invoke tools, or acquire printer status, snapshots,
  or video.
- **DEPLOY-003:** All HTTP requests in one service process share one application
  observation store. Process restarts, separate services, and host-owned stdio
  connectors remain separate state scopes; service liveness does not establish
  printer freshness, durable history, login, sleep, or physical acceptance.
- **UI-001:** Decision0043 uses one SvelteKit application at the app root with
  Bun retained: real API/dashboard/Lab routes, shared services and additional
  widget build targets. Routing and the native Fans page shipped in PR93;
  the nested static UI app has been retired. Current source extends native pages
  to Thermals, Heads and Queue using existing UI/controllers/services, delivered
  in PR97 alongside Fans. Other native renderers and product features remain
  separately tracked. Preserve role/auth/URL boundaries,
  zero acquisition during SSR and one observation flow on mount; account for
  remaining packaged renderers in `docs/sveltekit-route-migration.md`. Neither
  folder-only moves nor native page delivery complete remaining domain features.
  Shared `WidgetShell`,
  header, body, footer, observed metadata, 44-pixel icon action and chart-frame
  primitives own the visual anatomy. Components receive versioned normalized
  presentation values through props/host bridge only and make no direct
  printer, network, authentication or signaling request. The first private lab
  candidate is `/dashboard/lab/bed_mesh`; only the private dashboard server may
  serve that exact fixture route. It is absent from the public service,
  dashboard directory/focused route inventory and MCP resource inventory. The
  static page is deterministic, self-contained and production packaging excludes
  the generic embed scaffold. Bed Mesh 2D and 3D occupy the exact same
  responsive 4:3 `ChartFrame` `DOMRect` at 320/390/590/720 CSS-pixel widths,
  preserve reported samples and actual-mm labels, use icon-only 44-pixel bottom
  controls and non-flow local-action feedback. Acquisition failures instead use
  decision0041's persistent adjacent footer status and neutral skeletons, with
  retained renderers hidden/inert/inaccessible. They contain no explanatory prose in
  card flow. At those widths, 3D HTML axis/value labels are at least 12 CSS
  pixels, visible and non-overlapping, while the projected surface covers at
  least 70% of chart width and 42% of chart height at the normal default
  square-fixture view. Other supported rotations require containment and
  readable projected axes, not an impossible area minimum for an edge-on flat
  surface. Neutral 1x fitting is independent of bounded 0.75–3.5 user zoom:
  intentional detail zoom above 1x may crop the correctly projected geometry
  and labels at the fixed frame, while default/reset and all 1x orientations
  retain full containment. Data/resize preserve zoom/orbit; reset restores 1x.
  The floor, two camera-far grid walls and nondegenerate Z enclosure
  follow the actual data bounds; display padding never changes samples or
  summary measurements. Labels track true projected outer axis/tick anchors
  with quadrant hysteresis and measured outward placement. Data updates replace
  and dispose buffers without remounting or resetting orbit; 2D redraws reactively
  and preserves unequal physical X/Y spans. Runtime prop validation
  admits only canonical millisecond UTC source time plus bounded freshness and
  adapter-canonical profile metadata matching
  `^[\p{L}\p{N} _.-]{1,80}$`/Unicode, with empty/dot/dotdot rejection. It
  verifies supplied minimum, maximum and range against the finite matrix within
  `0.000001 mm`,
  then renders recomputed summary values. Decision 0032 fixes migration and
  cutover gates.
- **UI-002:** Before any MCP observation-resource cutover, the private Svelte
  lab exposes a directory and all nine closed observation views at exact
  `/dashboard/lab/*` paths from deterministic self-contained packages.
  Camera has a separate synthetic-only `/dashboard/lab/camera` candidate using
  the same visible LabControls. It is a compiled Svelte entry within the Kit
  project, not a live camera or a second SvelteKit adapter route. Exactly three
  nonempty valid inline HTML artifacts remain independently packaged. Decision0042
  removes repository individual and aggregate package byte ceilings; measured
  sizes remain observable, with normal production minification and no replacement cap.
  The directory and eight non-Bed/non-Camera views belong to the light
  artifact; Bed Mesh and Camera each use a closed explicit Svelte entry in the
  same project. The light graph excludes Three.js, OrbitControls, the Bed
  renderer and Bed fixture; Bed excludes other observations, Camera/media,
  live adapters and RPC. No final artifact may reference an external asset or
  dynamic import, and instrumented lab navigation, states, controls and
  refreshes execute without runtime fetch. Deterministic builds, exact hash/asset
  identity, schema/graph/security/CSP and self-contained-asset checks remain
  mandatory. Decision0032's historical byte thresholds and boundary tests are
  superseded only by0042's package-cap removal. Console and print thumbnails
  still require their own product decisions; removing caps does not add features.
  Bed Mesh's generic height legend sits vertically inside the shared chart's
  left edge as a 6px rail with one intrinsic Z(mm) caption. Existing visible
  Minimum/Maximum/Range facts replace duplicate chart endpoint numbers; the
  chart's accessible description carries exact top maximum and bottom minimum.
  Equal extrema produce uniform midpoint color; unknown/loading is neutral with
  identical geometry. The14px plot inset reserves room for a readable caption
  and projected XYZ labels, with zero caption/mesh overlap. It replaces the
  below-chart bar without adding card height, preserves the same 4:3 frame in
  2D/3D/loading/refresh, and retains all UI-001 fit/zoom/coverage gates at all
  four widths and 200% text. This lab-only refinement does not migrate the
  production Bed Mesh widget or modify production package bytes.
  Its two mode choices use the generic common Switch: 88x44 overall and two
  44x44 radio targets. The visible track fills the same44px action size as Button;
  its40x40 selected thumb keeps2px inset and moves44px in180ms with transform
  only (no transition under reduced motion). Each segment remains44px wide;
  Camera's current Auto/Live candidate is 88px overall; the older three-mode
  resource remains 132px as compatibility history. Use the shared action-size
  token; loading and ready keep identical geometry. This supersedes decision0032's
  historical32px track/28px thumb height; its2026-09-02 amendment records the change.
  Exactly one selected radio is tabbable; arrows wrap, Home/End select, and
  Space/Enter activate once. Controlled updates do not steal focus, selected
  clicks are no-ops, disabled controls cannot activate, and loading is inert
  with identical geometry and no selected state. The 4:3 chart element, mode
  callbacks, URL/history, separator and Reset semantics remain unchanged.
  Camera offers loading/connecting/snapshot/simulated-live/fallback/error/
  unsupported and restrictive native/unsupported/simulated-rejection policies.
  Native capabilities are feature-detected; FPS requires actual local presented
  frames, not fixture numbers. Its persistent video survives fullscreen/PiP
  toggles, all states keep media geometry, and normal mobile status stays top
  right. Enlarged text may reflow only when intrinsic space is insufficient.
  The unchanged restrictive private CSP and exact route-to-artifact shipping
  hashes apply independently to all three artifacts. Production Camera migration
  remains separate. Every view is independently callable, bridge-injected, synthetic-
  fixture marked and network-free, with strict domain validation and no raw or
  private identity. Shared tokens plus one header/body/footer inset owner keep
  cards compact and content-driven at 320/390/590/720; information precedes one
  bottom 44-pixel icon action. Local-action overlay feedback cannot change intrinsic
  height;0041 acquisition status occupies a reserved footer slot and persists
  independently of transient feedback. One authoritative local-action feedback state/timer makes the latest action replace
  every earlier message immediately. Async actions publish intent before
  awaiting and may settle only while their action generation remains current;
  stale success/failure cannot overwrite newer intent. Canonical titles and the Progress/Thermals/Heads/Jobs/History/Queue/
  Fans/Overview/Bed Mesh presentation rules are fixed by decision 0032's
  all-observation addendum. The canonical directory/child title must be the
  first and only non-empty title observed during initial parsing, before
  hydration. Existing production routes, tools, resources,
  authentication, Tailscale and public HTTP remain unchanged.

Implementation qualification: the current store bootstraps one acquisition on
its first `current()` demand. After initial acquisition, plain reads use the
cache and explicit due refreshes coalesce. Construction, health checks, and
static routes do not acquire printer data. This is not a subscription or
durable-monitor claim.

- **ARCH-001:** Domain and application modules do not depend on MCP, HTTP, CLI,
  Bun, Elixir, OrcaSlicer, Moonraker, or database framework types.
- **ARCH-002:** MCP, HTTP API, CLI, and future inbound surfaces invoke the same
  application use cases and safety policies through explicit ports.
- **ARCH-003:** The operations monitor can move from an in-process component to
  a separate daemon through versioned, language-neutral contracts without
  changing domain semantics.
- **ARCH-004:** MCP and optional media HTTP adapters do not own camera ticket,
  session, lease, concurrency, duration, or signaling-size policy. Those
  policies remain in an application service behind transport-independent
  ports. The printer-specific adapter owns the allowlisted upstream WebRTC
  exchange. A server-terminated fan-out service owns the shared upstream and
  independent downstream peers. Neither inbound adapter exposes a printer URL,
  upstream identity or signaling envelope, or generic proxy.
- **ARCH-005:** Host tool visibility is presentation metadata, not sufficient
  authorization. Camera stream allocation requires a current one-time
  widget-private application capability, and unanswered offers release their
  leases automatically within a bounded interval.
- **ONTO-001:** Prepared print job, printer, capability, print session,
  observation, event, recommendation, authorization, command intent, command
  result, verification, and outcome use the meanings defined in
  `docs/ontology.md` and decision 0003.
- **ONTO-002:** Observe, Recommend, Authorize, Act, Verify, and Administer remain
  distinct categories in interfaces, events, and tests.

## Orca Preparation

- **PREP-001:** The preparation subsystem accepts only declared input types and
  does not overwrite source models or projects.
- **PREP-002:** Each preparation request identifies the requested printer,
  filament, and process profiles plus their resolvable versions or fingerprints.
- **PREP-003:** Embedded project settings, inherited profile values, explicit
  overrides, and conflicts remain distinguishable and inspectable.
- **PREP-004:** A review bundle exposes the editable project representation,
  exact generated plate artifact, preparation manifest, and validation result
  without treating visual review as printer authorization.
- **PREP-005:** User review identifies the slicer edition and version, plate,
  project or artifact hash, and accepted or rejected revision. Correspondence
  review records explicit `PASS` or `FAIL` for the exact selected objects,
  orientation and arrangement, bound through a fresh challenge, reviewer class,
  artifact/manifest/layout identities and thumbnail hashes. Missing review,
  `FAIL`, stale challenge or any mismatch blocks prepared acceptance and upload.
  Reslicing, changing support annotations, or changing any bound input creates
  a new revision that requires renewed review.
- **PREP-006:** Support intent distinguishes automatic support settings,
  support-enforcer or blocker geometry, painted mesh facets, and intentionally
  modeled breakaway geometry. Facet annotations remain bound to the exact mesh
  identity and are not silently carried across remeshing.
- **PREP-007:** Every prepared artifact contains genuine, decodable, nonempty
  embedded thumbnail images of its exact selected plate/layout. Before prepared
  acceptance or upload, extract and decode the final artifact's images, verify
  their count, format and dimensions against the selected backend/target
  requirements, and inspect correspondence to the selected objects, orientation
  and arrangement. Bind the result to the final artifact hash and preparation
  revision. Configuration strings, standalone previews, blank placeholders and
  images from another revision do not satisfy the gate. Missing, invalid,
  incompatible, stale or unverified evidence blocks acceptance and upload.
  This visual identity check does not prove geometry, printability or safety.
- **PREP-008:** One transport-independent `validatePreparedArtifact`
  application use case consumes only trusted snapshots of the exact spec,
  manifest, artifact bytes, digest-bound resolved-settings receipt and
  challenge/digest-bound thumbnail-correspondence receipt. It emits a readonly
  receipt carrying schema/validator/requirements versions, deterministic
  validation identity, spec/manifest/artifact hashes, prepared-job revision,
  target fingerprint, source receipt IDs/digests, decoded thumbnail evidence,
  overall status and ordered rules. Required rules distinguish `passed`,
  `blocked`, `unavailable` and `error`; only `passed` is upload eligible. A
  skill or public transport accepts opaque IDs and resolves trusted records; it
  cannot supply raw paths/evidence, mint receipts or reinterpret success.
  Effective walls come from the bound resolver receipt, not manifest claims or
  extrusion-line counts. Thermal validation covers the schedule before the
  first provable positive extrusion delta, tracking extrusion mode, reset and
  active/inline tool; it binds that tool to explicit heated/unheated and
  required/not-required wait intent. Ambiguity is not success, shutdown after
  extrusion is not a startup failure, and command targets are not actual
  temperatures. Decision 0048's pure-core source is independently accepted;
  trusted adapters remain pending.
- **ORCA-001:** Every invocation records the exact OrcaSlicer edition and
  version, bounded inputs and outputs, exit result, and captured diagnostics.
- **ORCA-002:** Invocation success, output creation, and output validation are
  distinct states; a missing, stale, or invalid artifact cannot be reported as
  a successful prepared job.
- **ORCA-003:** The result reports available warnings and estimates and creates
  a versioned manifest containing schema, source, configuration, and output
  identities and hashes.
- **ORCA-004:** Custom G-code discovered in a model, project, or profile is
  surfaced and fingerprinted, then explicitly approved or rejected before it
  can be included in output. OrcaSlicer execution does not inherit unrelated
  credentials, gain unbounded file access, or execute unapproved host actions.
- **ORCA-005:** A successful slice is software-integration evidence only. It
  does not prove target compatibility, printability, safety, or physical success.
- **ORCA-006:** Backend selection is explicit per preparation request. The
  system does not silently substitute OrcaSlicer for Snapmaker Orca, or the
  reverse, and records the executable fingerprint and discovered capabilities.

## Preparation-to-operations handoff

- **HANDOFF-001:** A versioned handoff preserves its schema version,
  prepared-artifact identity and hash, manifest version, intended target,
  authorization context, and correlation identifiers.
- **HANDOFF-002:** Prepared, uploaded, selected or queued, start acknowledged,
  printing observed, and completed are distinct states.
- **HANDOFF-003:** Target and profile compatibility is checked before upload or
  start is offered; unknown or conflicting compatibility blocks the action.
- **HANDOFF-004:** Upload, queue or selection changes, and print start are
  separate intents and results with action-specific authorization. Each
  requires explicit authorization unless a bounded policy for that exact action
  was separately pre-authorized.
- **HANDOFF-005:** A print session advances from observed printer state, not
  solely from an upload or start acknowledgement. A product-managed handoff
  must link the session to the exact manifest and artifact hash; an externally
  originated job must record unavailable or unknown provenance explicitly.
- **HANDOFF-006:** Authorization binds the exact artifact hash, manifest and
  handoff schema versions, target, requested action, validity period, and retry
  scope. A change to any bound field requires renewed authorization.
- **HANDOFF-007:** The handoff carries PREP-007's thumbnail verification bound
  to the final artifact hash. After upload and before start, independently read
  the target's parsed thumbnail metadata for the uploaded artifact and match
  image count, format and dimensions to the local evidence as exposed by that
  target. Missing, conflicting or unavailable verification blocks start; an
  upload acknowledgement alone is insufficient. Any artifact change, including
  embedding or replacing images, requires renewed local verification and
  identity/authorization binding before the changed artifact is uploaded.
  Decision 0040 governs this workflow policy. Local source enforcement is
  independently accepted under PREP-008/HANDOFF-008; a supported adapter and
  target-parsed pre-start enforcement remain unimplemented.
- **HANDOFF-008:** One shared `uploadPreparedArtifact` coordinator is the only
  product upload seam. Its request contains opaque prepared-revision,
  validation-receipt, authorization, target-preflight, idempotency and
  correlation IDs. It snapshots records from trusted stores, reruns PREP-008,
  checks exact bindings and freshness against a trusted runtime clock, atomically
  claims one-use action-specific authority and action state, and invokes the
  printer adapter at most once. Accessors, polluted prototypes, cycles, malformed
  records, stale evidence, conflicts and cancellation before effect fail closed
  with zero calls. Stable replays reuse the recorded action; uncertain effects
  require verification and are never automatic retries. Acknowledged, rejected,
  timeout, transport-failed and unknown outcomes remain distinct. Raw paths,
  direct/manual transport and generic HTTP/Moonraker/G-code/admin passthrough
  cannot report a successful product handoff. The guarded result is not
  HANDOFF-007's target-parsed receipt and does not authorize start. Decision
  0048's pure core and injected-store/fake-port tests are independently accepted;
  durable stores, supported adapter, real uploader and target evidence remain
  pending.

## Expansion

- **PORT-001:** Normalized interfaces do not hide vendor-specific behavior that
  affects safety or command meaning.

## Requirement changes

- **UI-005:** The real Camera Svelte migration first replaces only the private
  `/dashboard/camera` child with `/dashboard/camera_widget`, using the reviewed
  shared host bridge and existing bounded frame/signaling application boundary.
  One persistent video survives native/CSS fullscreen and PiP; timestamps/FPS
  require decoded/presented evidence, stale async work cannot resurrect sessions,
  and page lifecycle releases only this viewer's lease. Typed private metadata,
  one-use activation, snapshot-first state and retained fallback are preserved.
  The single self-contained production HTML keeps deterministic/hash/schema/
  security checks and size reporting, with no repository byte ceiling under0042.
  Synthetic producers
  never enter its build graph. Legacy `/camera-widget` and MCP aliases remain
  as compatibility resources. PR99 delivers decision0044's bounded MCP
  Camera/Heads presentation cutover through self-contained shared
  Svelte resources while preserving legacy URI compatibility, private metadata
  and bridge-only acquisition/signaling. Camera v11 uses deterministic
  `mcp-camera.html` with a thin host-result entry: the shared service accepts and
  decodes the opening tool result without duplicate initial acquisition. Its
  bounded missing/malformed delivery fails neutrally for explicit Refresh; the
  dashboard keeps request bootstrap. That PR99 behavior is historical;
  CAM-008/decision0046's current candidate supersedes Camera's snapshot-first/
  manual-retry policy with default Auto and bounded automatic recovery, and the
  latest current-only widget policy retires old aliases/bundles and their
  compatibility-only tests. The current eight legacy renderers remain required.
  Independent simulated-host and exact served-resource evidence do not establish
  actual phone/plugin-host acceptance.
  See decisions0035/0044 and the active iteration for acceptance gates.

- **UI-004:** Every private observation lab view exposes shared bottom controls
  outside its card for closed synthetic scenario/lifecycle/freshness/value
  inspection, including loading skeletons and retained refresh. URL selections
  are validated and back/forward/reset work without acquisition. New state and
  skeleton compositions remain zero-raw; seven existing ready-body debts remain
  frozen. Camera follows separately with the same controls and synthetic-only
  media, not the production signaling widget. See decisions 0032 and 0033.
  Decision0041 supersedes0038's visible retained-error data and overlay notice:
  initial and failed-refresh acquisition errors retain static neutral structure
  with persistent status beside footer Retry. Internal known chart data/receipt
  and mounted renderer identity survive while hidden, inert and inaccessible.
  Retry stays in its existing bottom slot. No loading animation or busy claim persists
  after failure. Empty and unsupported states remain semantically distinct.
  A successful 2D Retry transfers focus to the selected mode radio only while
  the initiating action still owns active-document focus; user focus movement,
  mode/phase changes and stale work cancel recovery. Reset remains disabled in
  2D, while successful 3D Retry keeps the same enabled Reset focused.
  The same full-frame contract applies to every Lab and served widget,
  including legacy compatibility/MCP and Camera routes: initial acquisition
  error and failed refresh keep static public content/receipt placeholders and
  adjacent footer status, hiding old content and receipts. Successful unknown,
  unsupported, empty and age-stale states remain distinct; internal cache/epoch/
  ordering and local Copy/PiP/fullscreen feedback are not acquisition failure.
  Loading-to-error and ready-to-retained-error shell/header/body/footer bounds
  must remain equal at supported widths and 200% text, without acquisition by
  a skeleton. Unsupported capability stays distinct from missing/error data.
  Camera's latest user-approved CAM-008/decision0046 exception places its safe
  error reason in a persistent bottom-left media overlay and removes its footer/
  Refresh UI; the neutral/no-stale/stable-geometry obligations remain. Other
  widget footer rules are unchanged.
  The current packaged-layout remediation must compare actual MCP resource HTML
  with the corresponding Lab view and state at phone/desktop widths. The reported
  Progress missing body insets were reproduced by the author's390px paired
  capture: MCP body margin/padding0 versus Lab18px because `.u1-:host` cannot
  match `.u1-body`. The scoped selector repair must use existing tokens, preserve
  loading/error/recovery bounds and cover all eight active legacy consumers,
  including320px/200% text. Author d999399 checks48 ready-to-failure geometry
  observations across eight active legacy views,320/390/1024 widths and100/200%
  text. Independent review additionally accepts selected Progress320px/200%
  overflow/neutral-height/Retry-content recovery. Retry→Refresh focus remains
  lost in both baseline and candidate, an open U01 legacy gap. This is not a
  full overflow/recovery matrix. Do not expand it into P01's deferred Progress design
  or claim all legacy debt resolved. Lab-only checks cannot accept the MCP fix.
  Adoption and evidence are tracked per route in `docs/widget-delivery.md`;
  the requirement does not itself claim every route has been delivered.

- **UI-003:** Observation presentation uses closed DOM-owning leaf/layout
  primitives and zero-raw domain/feature composition. All shared UI primitives
  live in `src/components/common/*` with generic names such as Button, Icon and
  Switch. Decision0043's single-app layout shipped in PR93: pure TypeScript
  services/domain live in `src/lib`, server-only code in `lib/server` and real Kit
  routes in `src/routes`, with Bun retained. The former `src/lib/common` path is
  PR91 history. Native renderer coverage remains separately tracked; file moves
  alone do not complete it.
  Decision0049 accepts a provisional version-1 private-lab experiment, not
  production architecture or cutover. The exact version-2 private-Lab candidate
  keeps one fixed T1 subject and the four `HeadStatus`, `HeadTemperature`,
  `FilamentColor`, and `FanRelation` domain leaves, but restricts composition to
  a root `Card` whose header is `Title`, `Inline`, or the paired `identity`
  `Group` and whose body is one `Stack`, `Grid`, or paired `summary` Group; Row
  and Column are valid only inside an explicit summary override. It rejects
  version 1, `Table`, `DataTable` and unknown fields. Card density, title size, gap
  and columns are closed tokens. Title content is also a closed T1-derived token;
  arbitrary text or a claim about another entity is invalid. A strict spec
  rejects repeated presentation fields. Resolved validation must still require exact equality for any
  repeated field and between Card transform evidence, tint and visible
  FilamentColor under the same materials receipt. Global `error` permits only
  available or unavailable receipts and requires at least one unavailable;
  loading receipts and animated error skeletons are invalid while partial healthy
  evidence remains visible. Decision0051 supersedes the experiment's
  `PercentageFill`: version-2 JSON containing it is invalid before acquisition,
  and temperature renders without a dynamic fill. One pure TypeScript build-time
  registry owns exactly `Card`, `Title`, `Stack`, `Grid`, `Inline`, `Group`,
  `Row`, `Column`, `HeadStatus`, `HeadTemperature`, `FilamentColor`, and
  `FanRelation`, their roles, strict
  spec/resolved prop schemas, child policies and field/source metadata. Those
  child policies directly construct accepted spec and resolved tuple/array
  shape and cardinality rather than duplicating structural rules. A
  client-only registry binds those exact names to statically imported Svelte
  components with parity tests and exact compile-time compatibility against a
  separately owned prop map derived from the resolved node model; the dynamic
  rendering boundary is sealed behind registry-entry-owned typed props adapters
  and role-constrained child readers. The recursive renderer must dispatch only
  on child-bearing structural role, never on concrete element name; it may use
  one uniform cast only inside typed entry construction after constructor,
  adapter, required props and node agree, never an all-optional props surface.
  There
  is no runtime registration, dynamic
  import, module path, URL, expression or style token in the wire contract;
  common layout elements are built in and domain leaves remain outside common.
  Decision0052 adds only the private-Lab `balanced` composition. `Inline` has
  exact children `[Title, HeadStatus]`, closed `compact | regular` gap and
  `packed | split` distribution. A lead Grid and the leaf appearances
  `headerBadge`, `hero`, and `quiet` are closed optional inputs that resolve to
  explicit normalized modes and must remain structurally correlated. Lead layout
  uses a code-owned font-relative intrinsic rule: no caller-provided span,
  breakpoint, CSS, or sample-value reserve. Duplicate-field rejection traverses
  both Card header and body. The balanced spec is a neutral compact Card with a
  split title/status header, full-width hero temperature and adaptive secondary
  filament/fan content; it has no empty icon slot, divider, tint, gradient,
  Table, or Row. The existing card, compact and larger specs and default visuals
  remain canonical and unchanged.
  Decision 0053's 2026-09-06 spacing correction preserves information while
  compact summary vertical gaps become 8px, insets/stacked-row gaps 12px, and
  horizontal separation remains 20px. Internal typed density avoids compound
  padding. Temperature keeps two structural lines for valid decimal precision;
  the closed quiet vocabulary uses width/text-aware reserves. All evidence
  states retain <=1px fixed-viewport geometry. No DSL field or acquisition is added.
  Decision0053 adds smart semantic grouping before placement. `identity` accepts
  exactly Title then HeadStatus and resolves to the code-owned packed header;
  `summary` accepts temperature, filament and fan exactly once, forbids caller
  appearances, and normalizes smart input to that stable affinity order. Its
  `summary-stack-v2` rule (decision0055) resolves three full-width span-6 Rows
  in temperature, filament, fan order. The retired `summary-grid6-v1` literal
  is rejected rather than reinterpreted. An optional strict grid override may
  provide only six tracks, closed row/column gap tokens and one to six Rows;
  each Row has one to six Columns, every Column owns exactly one summary leaf
  and a closed one-through-six span, and each Row sums exactly to six. The
  build-time registry owns distinct child policies for identity, smart summary,
  explicit summary, and resolved summary so the first two retain exact tuple
  cardinality while a legal single explicit Row is accepted. A one-Row
  `2 + 2 + 2` override must preserve authored leaf order and still acquire
  status, materials, and environment once each. The
  resolver records `smart | explicit`, versioned rule, order, spans and
  intrinsic collapse. Explicit layout changes only placement and cannot change
  grouping, values, appearance, provenance, loading/error topology or the
  readability floor. Smart remains three sequential full-width rows at every width/text scale.
  The explicit paired demo keeps secondary readings together at 390/720 normal
  text and stacks at 320 normal text or 390/200-percent text.
  They add no holes, offsets, row span, overlap, caller breakpoint, style,
  markup, executable content, tint, gradient, divider, Table or printer icon.
  Resolved identity records `identity-packed-v1`; the exact rule
  literals version their code-owned algorithms, so later behavior must use a
  new registered literal rather than silently reinterpreting either rule.
  The prior A specs, hashes and default rendering remain unchanged. Balanced B
  keeps its spec/hash and shares the closed quiet-label refinement: visible
  `Configured color` with accessible `Configured filament color`.
  Strict canonical hash/spec/plan/source/topology/provenance
  correlation, deduplicated source readers, bounded values, `Unknown` for absent
  or ambiguous relations, input-shaped loading/error states, no arbitrary code
  or markup, and negative production-registration guards remain mandatory.
  Stable geometry reserves must be structural and may not embed sample status,
  telemetry, filament color, fan label, identifier, timestamp or private value
  as hidden or accessible content. Common value primitives center the visible
  label/value or skeleton group against each reading icon while preserving the
  same structural reserve across evidence states. Generated-resource and source-level guards
  must reject such evidence-like reserve content. Exact manifest `a6cfa40f…`
  and resource `170fb8f1…` have screenshot-first UI/UX, printer-domain and
  independent verification approval within this synthetic experiment boundary;
  that evidence does not amend decision0049 into a production commitment. The
  isolated Lab route and versioned MCP factory/
  resource prove only synthetic software/protocol behavior; production adoption,
  Camera, live mappings, mounted-host/device acceptance, printer authority and
  deployment remain pending. DataTable is not implemented or admitted to this
  T1 vocabulary. It may be explored for Queue or History only through a separate
  domain contract, ADR, implementation and review. The removed temperature
  decoration supplies no production precedent or percentage semantic.
  Any hosted composition preview must use a dedicated immutable server that
  verifies the fixed build artifact's canonical manifest before listening and
  preloads a closed allowlist containing only the exact private Lab page and its
  required hashed assets. It must not import production entrypoints, dashboards,
  tools, MCP, observation/printer, camera, auth, local configuration or process
  authority, and must not fall back to another build. Manifest validation and
  response loading must use one in-memory artifact snapshot, with no filesystem
  reread after validation or while serving. Every ordinary parsed unlisted
  origin-form route, query variant and method must return 404; CONNECT and
  Upgrade must be explicitly denied, while parser-invalid traffic may return
  400/close but must never expose preview/asset bytes or authority. Fixture state
  and dashboard tool-call surfaces are forbidden. This is a private-Lab safety
  requirement, not runtime, device or production acceptance. The generic
  `serve-kit-fixture.ts` host must not be used to relaunch either composable
  preview; historical v1 artifact hashes do not grant runtime authority.
  Existing props/variants express visual/
  content differences. Domain compositions and
  domain icon mappings remain outside common. Consolidate visual-only leaf
  variants without weakening AST/import guards or changing domain semantics;
  shared changes require all eight bundles and transitive-consumer coverage.
  This supersedes the prior shared-folder naming choice, not the semantic-token
  contract or service ownership. Shared degree,
  actual/target thermal, icon, label, name, caption and timestamp components
  preserve units, source time and unknown-versus-zero semantics. AST checks
  prevent new raw feature HTML/style/transport debt. Each widget gains a
  shape-matched loading state without fake values or focusable actions,
  aria-busy plus one state announcement, reduced-motion support and retained
  known data during healthy pending refresh; after acquisition failure0041 masks
  that data and keeps neutral failure presentation during Retry until accepted
  new evidence. Thermals is the first independently shippable
  migration; all-nine skeleton/gallery and remaining ready migrations stay
  explicitly pending until separately evidenced. See decision 0033.
  Its reusable `PercentageBackground` leaf accepts value/maximum, a strictly
  validated optional color and children. Only a finite nonnegative numerator
  and positive finite denominator produce a bounded decorative gradient; invalid
  ratios/colors are neutral. Text and actions remain unchanged, including
  over-target values. Decoration owns no spacing, clipping, sizing or progress
  semantics. Thermals is its first private-lab consumer; skeleton/ready seams,
  row geometry and enlarged-text readability must remain consistent.
  The subtle tint direction is 100 degrees inside an exact left-aligned,
  nonrepeating ratio-wide background; its represented fill boundary remains
  vertical and accurate at every height.
  Fans & Air reuses this gradient through seven zero-raw canonical rows and a
  shared 13-pixel MetricValue, with 14-pixel names, independent null/zero percent
  and RPM, and no inferred running/fault state. Its skeleton retains static
  names/icons without telemetry or fill; loading/ready geometry is equal across
  supported widths/modes and 200% text. Whole metrics may wrap without clipping.
  Decision 0034 extends the same composition to the first real Fans dashboard:
  a fixture-independent adapter preserves all seven channel IDs, reported/null/
  zero values through 1,000,000 RPM, purifier power/mode and domain receipts.
  One host bridge/controller owns selected-view-before-data, bounded requests,
  duplicate/late-result rejection, restart recovery, retained refresh/focus and
  BFCache lifecycle. Its exact private static asset has no acquisition capability.
  Decision0042 removes its repository byte ceiling; UI-002's remaining integrity,
  determinism, security and self-contained-asset requirements still apply.
  Other focused routes and generic MCP/legacy aliases stay unchanged until their
  own lossless parity, independent acceptance and guarded deployment.
  The next focused Thermals cutover preserves real `heater-bed`, nullable
  actual/target/active and heater state, field evidence and provenance. Cavity
  has no target and keeps independent receipt/freshness/state/reason metadata.
  Tool/bed values retain source-accepted finite numbers, with safe compact
  scientific display for extreme magnitudes and exact accessible input; Cavity
  retains its -273.15..999 C source bounds. Shared rows/loading and retained
  refresh keep geometry/focus; the exact private Thermals asset retains integrity,
  deterministic packaging and size reporting without a repository byte ceiling
  under0042. Generic MCP
  aliases and remaining focused widgets stay legacy until independently accepted.

When evidence changes one of these requirements, update it explicitly and
record a decision if the change affects architecture, safety, or product scope.
Do not let a printer limitation silently redefine the intended user outcome.
