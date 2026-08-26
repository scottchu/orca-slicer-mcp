# Roadmap

The product has two peer delivery tracks plus an integration gate. Milestone
labels express dependencies and evidence boundaries, not product hierarchy.
Preparation and Operations may advance in parallel or in a user-directed order.
A milestone is complete only when its exit evidence is recorded.

## F0 — Dual-environment and contract discovery

**Goal:** identify the first concrete OrcaSlicer and printer environments and
define the preparation-to-operations boundary without guessing.

- identify the OrcaSlicer edition, version, invocation path, profile sources,
  supported input/output behavior, and automation limitations;
- identify the first printer model, firmware, protocol, and capability set;
- identify camera, notification, operations host, and network boundaries;
- define the provisional prepared-artifact manifest and target compatibility
  checks;
- decide where upload and start belong while keeping them separate and
  explicitly authorized;
- document file, credential, custom G-code, command, and privacy boundaries.

**Exit evidence:** reproducible read-only discovery against a named OrcaSlicer
version and printer environment, capability matrices, a proposed handoff
contract, and accepted decisions for the first adapter boundaries. Discovery
does not prove a prepared artifact is printable or a printer is safe to control.

## Orca Preparation track

### P1 — Safe on-demand vertical slice

**Goal:** turn one supported input and explicit profile set into a staged,
traceable artifact without upload or print start.

- isolated, non-destructive input handling;
- explicit printer, filament, and process profile identities;
- bounded invocation of a pinned OrcaSlicer version;
- captured exit state, diagnostics, warnings, and estimates;
- artifact validation, hashing, and preparation manifest;
- minimum target-identity compatibility checks required before handoff;
- deterministic failure for missing, stale, or invalid output.

**Exit evidence:** a real OrcaSlicer integration run is reproducible from the
recorded fixture and profiles and produces a validated artifact plus manifest.
This is software-integration evidence only.

### P2 — Configuration and inspection workflow

**Goal:** make configuration choices and preparation results inspectable before
handoff.

- profile inheritance and embedded-project precedence;
- explicit overrides and conflict reporting;
- richer target compatibility and custom G-code preflight;
- a revisioned review bundle containing the editable project, exact plate
  artifact, manifest, and static validation result;
- matching-edition preview and user acceptance bound to backend, plate, and
  artifact identities;
- inspectable support settings, enforcer or blocker volumes, and preserved
  facet annotations without silent remapping across mesh revisions;
- plate, preview, and estimate access where the discovered Orca boundary allows;
- stable preparation states and result inspection through MCP.

**Exit evidence:** fixtures cover accepted, rejected, conflicting, timed-out,
invalid-artifact, support-revision, and renewed-review paths without silent
profile selection, input mutation, or reuse of stale acceptance.

## Printer Operations track

### O1 — Persistent observation spine

**Goal:** observe one real printer reliably without controlling it.

- resident service lifecycle and configuration;
- printer connection and reconnection behavior;
- normalized state and capability inventory;
- surface-independent application ports and versioned monitor contracts;
- initial snapshots, ordered subscription deltas, visible freshness, and full
  resynchronization after reconnect;
- print-session state machine and event log;
- on-demand status and camera snapshot through MCP;
- a user-opened, bounded continuous camera presentation whose ticket, lease,
  concurrency, and serial-iteration policy is independent of MCP and HTTP;
- fixture or simulator tests plus a real-printer observation run.

**Exit evidence:** the service tracks a complete real print from start to final
state, survives a tested reconnect scenario, and records no impossible state
transitions. Domain tests run without an MCP transport, an adapter contract test
proves MCP is not the only possible inbound surface, and continuous camera
presentation evidence separates application policy, exact-route protocol,
real-printer frames, and mounted-host rendering.

### O2 — Notifications

**Goal:** remove the need to poll routine print progress.

- completion, failure, offline, and attention events;
- notification routing and delivery status;
- deduplication, retry, and quieting behavior;
- useful messages that link back to session evidence.

**Exit evidence:** controlled scenarios produce one timely, actionable message
each, with retries and duplicates accounted for.

### O3 — Human-directed control

**Goal:** execute explicit commands safely and verify their effects.

- pause, resume, and cancel for supported states;
- capability and state preconditions;
- authorization and audit records;
- command correlation, timeout, and post-action verification;
- deny-by-default behavior for unsupported or ambiguous requests.

**Exit evidence:** a hardware test matrix demonstrates accepted, rejected,
timed-out, and disconnected command paths without false success reports.

### O4 — Assisted diagnosis

**Goal:** turn telemetry, images, and user feedback into cautious
recommendations.

- first-layer observation workflow;
- explicit uncertainty and evidence presentation;
- human feedback capture;
- recommendation policies and bounded adjustment proposals;
- false-positive and false-negative review.

**Exit evidence:** an evaluation set establishes where recommendations are
useful and where the system must abstain. No autonomous correction is implied.

### O5 — Guarded interventions

**Goal:** apply pre-authorized, bounded adjustments and verify their effects.

- printer-specific adjustment limits and persistence semantics;
- policy scopes, stop conditions, and escalation;
- observe-adjust-reobserve loops;
- rollback or safe-stop behavior where meaningful;
- live Z-offset only after the target hardware contract is proven.

**Exit evidence:** controlled physical tests show bounded behavior, reliable
verification, and safe abstention under lost or ambiguous observations.

## I1 — Prepared-job to print-session handoff

**Goal:** connect the peer subsystems without turning slice, upload, start, and
observed printing into one implicit action.

- artifact and manifest identity across the boundary;
- target compatibility and capability checks;
- separate upload and start intents, authorization, results, and retries;
- printer-job correlation and post-start observation;
- print session linked to the exact manifest and artifact hash. Sessions that
  originate outside I1 record unavailable or unknown provenance separately.

**Dependency gate:** requires P1 including its minimum compatibility check, O1,
and an accepted handoff/authorization contract. Richer P2 and O2 work may
proceed independently where their own dependencies are met.

**Exit evidence:** controlled integration and physical-printer tests show each
state transition and failure path without false success. An upload or start
acknowledgement alone is protocol evidence, not observed printing.

## E1 — Ecosystem expansion

**Goal:** add broader integrations without weakening either subsystem contract.

- richer Orca project and profile workflows;
- additional printer, camera, slicer, and notification adapters;
- multiple printers, users, and preparation environments;
- richer automation and historical analysis.

**Exit evidence:** each adapter satisfies the relevant preparation, handoff,
session, capability, authorization, and verification contracts.
