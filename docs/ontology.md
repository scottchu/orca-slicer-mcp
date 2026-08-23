# Printer Operations ontology and operation categories

This document defines the stable vocabulary shared by the peer subsystems,
their handoff, application use cases, events, storage, and every inbound or
outbound adapter. MCP, HTTP, CLI, Bun, Elixir, OrcaSlicer, Moonraker, and
database representations map to this vocabulary; they do not define it.

## Domain concepts

| Concept | Meaning | Boundary rule |
| --- | --- | --- |
| Printer | A configured physical printer identity and its connection context | Vendor addresses and credentials stay inside adapters and private configuration |
| Capability | A supported observation or action with adapter-specific constraints | Presence does not prove safe runtime semantics |
| Job artifact | A prepared input such as G-code plus identity and provenance | It is not an active print by itself |
| Prepared print job | The Preparation aggregate joining source, profiles, OrcaSlicer version, artifact, validation, manifest, and provenance | It does not imply upload, start, or observed printing |
| Print session | The lifecycle joining a job artifact, printer, observations, events, commands, verification, and outcome | Central concept of Printer Operations |
| Handoff | A versioned, authorized link from an exact prepared job to upload, start, and an observed printer job | Preserves distinct states and exact artifact provenance |
| Observation | A timestamped fact reported by a named source | Carries freshness and may become stale or unknown |
| Camera observation | An image reference and acquisition metadata | Transport success is not a diagnosis |
| Event | An immutable ordered record of something observed or attempted | Carries type, time, source, and causal links |
| Recommendation | An advisory interpretation or proposed bounded action | Includes evidence and uncertainty; grants no authority |
| Authorization | A scoped grant from an identified authority | Separate from recommendation and command execution |
| Command intent | A requested consequential effect with parameters and preconditions | Exists before adapter execution |
| Command result | The adapter's acknowledgement, rejection, timeout, or transport failure | Is not proof of physical effect |
| Verification | A later observation evaluated against the intended effect | Required to distinguish acknowledgement from outcome |
| Outcome | The final known session result or an explicit unknown state | Never inferred optimistically from missing data |

## Process categories

Every use case and event belongs to one primary category:

1. **Observe:** acquire, normalize, timestamp, or query facts.
2. **Recommend:** interpret evidence and propose an action without authority.
3. **Authorize:** grant or deny a specific action or bounded policy.
4. **Act:** issue a command after capability, state, and authorization checks.
5. **Verify:** re-observe and compare the result with the command intent.
6. **Administer:** mutate host, service, credentials, configuration, updates, or
   broad device power outside the normal print-session control loop.

These categories must remain separate even if one user-facing workflow spans
several of them.

## API surface mapping

| Surface | Allowed categories | Examples |
| --- | --- | --- |
| Monitor | Observe | Current status, capabilities, subscriptions, snapshots, health, selected history |
| Control | Authorize, Act, Verify | Explicit pause, resume, and cancel workflows |
| Admin | Administer | Host reboot, service management, updates, credentials, broad configuration |

Recommendation is an application capability that consumes observations. It is
not permission to call Control. Admin is absent from the first release.

## Surface-independent application boundary

Inbound adapters translate their protocol into application requests:

```text
MCP get_printer_status ----\
HTTP GET /printer/status ---+--> QueryCurrentPrinterState
CLI printer status --------/
```

The application response is a domain result. Each adapter serializes that
result for its own protocol. Core modules must not import MCP tool types, HTTP
request types, CLI parsers, Bun server objects, or Elixir process structures.

## Monitor extraction boundary

The monitor begins in-process but is addressed through ports that can later be
implemented by a separate daemon:

- `ObservationSource`: supplies normalized observations and connection state;
- `ObservationSubscription`: supplies ordered observation deltas and lifecycle
  events;
- `MonitorHealth`: reports connection, freshness, retry, and subscription
  health;
- `ObservationStore`: persists and queries observations and events.

Cross-process versions of these ports use versioned, language-neutral schemas.
The transport is deliberately undecided; HTTP, WebSocket, Unix socket, or a
message bus may implement the same contract. Extracting the monitor to Elixir
must not change domain identifiers, categories, event meaning, or application
use cases.

## Event envelope

A durable event should be representable with these transport-neutral fields:

- `event_id` and schema version;
- `session_id` when associated with a print;
- opaque `printer_id`;
- process category and event type;
- source and source timestamp;
- recorded timestamp;
- `correlation_id` and `causation_id` where applicable;
- typed payload;
- freshness, confidence, or authorization metadata when required by the event.

Exact serialization remains an implementation decision. The semantic fields
must survive transport and runtime changes.
