# Roadmap

The roadmap is ordered by risk reduction and trust, not feature count. A
milestone is complete only when its exit evidence is recorded.

## M0 — Product and hardware discovery

**Goal:** choose the first concrete environment and remove foundational
unknowns.

- identify the first printer model and firmware version;
- inventory its local and vendor APIs and live-control capabilities;
- identify the camera source and network topology;
- choose the first notification destination;
- decide local-only versus remote-access expectations;
- document the command safety and authorization policy.

**Exit evidence:** a tested connection spike or protocol capture, a capability
matrix, and accepted decision records for the initial adapter and deployment
boundary.

## M1 — Persistent observation spine

**Goal:** observe one real printer reliably without controlling it.

- resident service lifecycle and configuration;
- printer connection and reconnection behavior;
- normalized state and capability inventory;
- print-session state machine and event log;
- on-demand status and camera snapshot through MCP;
- fixture or simulator tests plus a real-printer observation run.

**Exit evidence:** the service tracks a complete real print from start to final
state, survives a tested reconnect scenario, and records no impossible state
transitions.

## M2 — Notifications

**Goal:** remove the need to poll routine print progress.

- completion, failure, offline, and attention events;
- notification routing and delivery status;
- deduplication, retry, and quieting behavior;
- useful messages that link back to session evidence.

**Exit evidence:** controlled scenarios produce one timely, actionable message
each, with retries and duplicates accounted for.

## M3 — Human-directed control

**Goal:** execute explicit commands safely and verify their effects.

- pause, resume, and cancel for supported states;
- capability and state preconditions;
- authorization and audit records;
- command correlation, timeout, and post-action verification;
- deny-by-default behavior for unsupported or ambiguous requests.

**Exit evidence:** a hardware test matrix demonstrates accepted, rejected,
timed-out, and disconnected command paths without false success reports.

## M4 — Assisted diagnosis

**Goal:** turn telemetry, images, and user feedback into cautious
recommendations.

- first-layer observation workflow;
- explicit uncertainty and evidence presentation;
- human feedback capture;
- recommendation policies and bounded adjustment proposals;
- false-positive and false-negative review.

**Exit evidence:** an evaluation set establishes where recommendations are
useful and where the system must abstain. No autonomous correction is implied.

## M5 — Guarded interventions

**Goal:** apply pre-authorized, bounded adjustments and verify their effects.

- printer-specific adjustment limits and persistence semantics;
- policy scopes, stop conditions, and escalation;
- observe-adjust-reobserve loops;
- rollback or safe-stop behavior where meaningful;
- live Z-offset only after the target hardware contract is proven.

**Exit evidence:** controlled physical tests show bounded behavior, reliable
verification, and safe abstention under lost or ambiguous observations.

## M6 — Preparation and ecosystem expansion

**Goal:** add slicing and broader integrations without changing the core model.

- OrcaSlicer adapter and job configuration;
- upload and start workflow;
- additional printer, camera, and notification adapters;
- multi-printer operations and richer automations.

**Exit evidence:** each adapter satisfies the same session, capability,
authorization, and verification contracts.
