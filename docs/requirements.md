# Working requirements

These IDs stabilize discussion and validation while M0 discovery is active.
They are a working product contract, not proof that the target printer supports
the described behavior.

## Session and observation

- **SESSION-001:** The system represents an active print as a session joining
  job identity, printer capabilities, observations, events, commands, and
  outcome.
- **OBS-001:** The system reports current printer state, progress, temperatures,
  and errors when the adapter exposes them.
- **OBS-002:** Every observation records its source and time; stale observations
  are distinguishable from current ones.
- **OBS-003:** Loss of connectivity or telemetry produces an explicit unknown or
  offline state, never an inferred success state.
- **CAM-001:** An available camera can provide a timestamped on-demand snapshot
  associated with the relevant session.
- **CAM-002:** Camera-derived diagnoses expose uncertainty and begin as advisory
  evidence rather than autonomous triggers.

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
- **AUTH-001:** The operations service authenticates control callers and records
  the authority for consequential commands.

## Preparation and expansion

- **PREP-001:** Slicing, configuration, upload, and print start remain adapters
  around the printer-operations session model.
- **PORT-001:** Normalized interfaces do not hide vendor-specific behavior that
  affects safety or command meaning.

## Requirement changes

When evidence changes one of these requirements, update it explicitly and
record a decision if the change affects architecture, safety, or product scope.
Do not let a printer limitation silently redefine the intended user outcome.
