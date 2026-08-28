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
- **CAM-001:** An available camera can provide a timestamped on-demand snapshot
  associated with the relevant session.
- **CAM-002:** Camera-derived diagnoses expose uncertainty and begin as advisory
  evidence rather than autonomous triggers.
- **CAM-003:** Camera images are separately timestamped on-demand,
  event-triggered, or bounded-interval observations; continuous video ingestion
  is not required for the first monitor.
- **CAM-004:** A user-opened continuous camera presentation creates an opaque,
  bounded WebRTC signaling session with the printer-advertised, same-origin
  `webrtc-camerastreamer` behind the host and connector boundary. An optional
  exact HTTP adapter may exchange an authenticated single-use grant for that
  same application session. Video frames flow over the negotiated peer
  connection and presentation FPS is measured in the browser. ICE configuration
  defaults empty. A bounded explicit STUN list may be supplied as an external
  privacy and availability dependency; robust remote use prefers per-session
  RFC5766 TURN REST credentials derived from a server-only shared secret.
  Validated snapshots remain an explicit fallback. This does not imply
  persistent ingestion or diagnostic quality.
- **CAM-005:** A hosted MCP App iframe performs no direct fetch to a LAN,
  Tailscale, or media-signaling URL. Offer, answer, bounded ICE candidates, and
  close cross the MCP Apps `tools/call` bridge; opaque session and offer data
  remain component-private. The local connector alone invokes the
  printer-advertised fixed signaling route.
- **CAM-006:** The printer camera peer and mounted widget receive the same
  bounded ICE-server set for a camera session. TURN usernames contain a bounded
  expiry and nonce, TURN credentials are derived with HMAC-SHA1 from a
  server-only shared secret, and only derived credentials enter widget-private
  metadata. Printer origins, printer peer IDs, session capabilities, TURN
  secrets, and derived TURN credentials remain absent from model-readable
  content and structured content.

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
- **API-005:** The remote Monitor inventory contains exactly four model-visible
  tools (`show_u1_status`, `get_u1_status`, `get_u1_camera_frame`, and
  `open_printer_camera`) plus exactly four app-only signaling helpers
  (`open_u1_camera_stream`, `answer_u1_camera_stream`,
  `add_u1_camera_ice_candidates`, and `close_u1_camera_stream`). All eight are
  read-only and require `u1.monitor`. Opening the printer camera presents a
  snapshot-first widget; only an explicit Go Live interaction allocates a
  bounded stream session.

## Architecture and ontology

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
  ports. The printer-specific adapter owns the allowlisted WebRTC signaling
  exchange, and neither inbound adapter exposes printer URLs, printer peer
  identifiers, or a generic proxy.
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

When evidence changes one of these requirements, update it explicitly and
record a decision if the change affects architecture, safety, or product scope.
Do not let a printer limitation silently redefine the intended user outcome.
