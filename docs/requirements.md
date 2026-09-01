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
  titles, observation time, freshness, failures, and content are above one
  bottom action-only refresh/retry footer. Permission policy remains enforced
  without repeated visible read-only labels or provenance/current-reading
  boilerplate. Stale/offline/missing source time and refresh failures stay
  explicit in the information area; unimplemented domains do not render
  decorative charts as measured data. Host loading is bounded and malformed
  or missing delivery yields top-area explanatory/reopen guidance and, when
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
  bottom Copy action with truthful feedback. Refresh stays below information.
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
  or an advancing clock. Receipt/freshness/failure information is above the
  bottom Refresh action. Reject invalid or unsafe data even in hidden rows;
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
  above one bottom Refresh; no fan/purifier/thermal control is added.
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
  mutation or printer control is added. Decision 0025 fixes exact semantics.
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
- **CAM-008:** Camera uses the latest selected white rounded-card reference:
  small camera-icon tile/title at top left; state/measured FPS/frame time in the
  white header above and outside the genuine image, with readable narrow
  wrapping. Display/live/snapshot controls stay bottom right and remain working
  and accessible; any overflow menu exposes real PiP/Go Live/Close actions.
  Rejection feedback stays above. No grid, tint, photo information overlay or
  redundant snapshot footer is added. This supersedes the former bottom-left
  information exception; information is above actions. Do not truncate time/FPS
  or shrink 44-pixel controls on narrow views. Snapshot/fallback time belongs to the
  accepted displayed JPEG's server receipt time; live time belongs to evidenced
  local rendered/decoded frames and freezes when they stop. Neither is claimed
  as sensor capture time. Only while live, an integer FPS value may appear
  between state and time after at least one second of actual presented/decoded
  frame-counter evidence. Omit unmeasured, invalid, reset, or stale FPS; timer
  callbacks are not frame counts. Clear FPS on exit and after 1.5 seconds
  without advancing frame evidence. Network diagnostics stay hidden.
  Fullscreen reflects same-document native or local CSS state and never requests
  a remount-capable host display mode. PiP is offered only through the existing
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
  stale completions, and retain a previously accepted frame across retries.
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
- **UI-001:** Focused-widget framework migration uses a parallel Svelte 5/
  SvelteKit static lab before any production cutover. Shared `WidgetShell`,
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
  controls and non-flow feedback overlays, and contain no explanatory prose in
  card flow. At those widths, 3D HTML axis/value labels are at least 12 CSS
  pixels, visible and non-overlapping, while the projected surface covers at
  least 70% of chart width and 42% of chart height. Runtime prop validation
  admits only canonical millisecond UTC source time plus bounded freshness and
  adapter-canonical profile metadata matching
  `^[\p{L}\p{N} _.-]{1,80}$`/Unicode, with empty/dot/dotdot rejection. It
  verifies supplied minimum, maximum and range against the finite matrix within
  `0.000001 mm`,
  then renders recomputed summary values. Decision 0032 fixes migration and
  cutover gates.
- **UI-002:** Before any MCP observation-resource cutover, the private Svelte
  lab exposes a directory and all nine closed observation views at exact
  `/dashboard/lab/*` paths from one deterministic self-contained package.
  Camera is explicitly pending a separate media-lifecycle migration and has no
  lab route. Every view is independently callable, bridge-injected, synthetic-
  fixture marked and network-free, with strict domain validation and no raw or
  private identity. Shared tokens plus one header/body/footer inset owner keep
  cards compact and content-driven at 320/390/590/720; information precedes one
  bottom 44-pixel icon action and overlay feedback cannot change intrinsic
  height. One authoritative feedback state/timer makes the latest action replace
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
  project or artifact hash, and accepted or rejected revision. Reslicing,
  changing support annotations, or changing any bound input creates a new
  revision that requires renewed review.
- **PREP-006:** Support intent distinguishes automatic support settings,
  support-enforcer or blocker geometry, painted mesh facets, and intentionally
  modeled breakaway geometry. Facet annotations remain bound to the exact mesh
  identity and are not silently carried across remeshing.
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

## Expansion

- **PORT-001:** Normalized interfaces do not hide vendor-specific behavior that
  affects safety or command meaning.

## Requirement changes

- **UI-003:** Observation presentation uses closed DOM-owning leaf/layout
  primitives and zero-raw domain/feature composition. Shared degree,
  actual/target thermal, icon, label, name, caption and timestamp components
  preserve units, source time and unknown-versus-zero semantics. AST checks
  prevent new raw feature HTML/style/transport debt. Each widget gains a
  shape-matched loading state without fake values or focusable actions,
  aria-busy plus one state announcement, reduced-motion support and retained
  known data during refresh. Thermals is the first independently shippable
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

When evidence changes one of these requirements, update it explicitly and
record a decision if the change affects architecture, safety, or product scope.
Do not let a printer limitation silently redefine the intended user outcome.
