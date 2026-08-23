# Working agreement

## Development posture

Work in small vertical slices. A useful slice crosses the necessary boundaries
to answer one real question—for example, printer telemetry through the resident
service and MCP tool—without building unrelated framework.

Execution order is part of the active contract. If the user changes the
priority—for example, from implementation to protocol discovery or from camera
inference to real-printer observation—record the pivot and stop work on the
superseded phase.

## Before implementation

For a substantial change, write down:

1. the user or operational problem;
2. the roadmap milestone and open question it addresses;
3. the smallest observable acceptance criteria;
4. the safety class and required authorization;
5. how success will be verified in simulation and, when relevant, on hardware.

Create a decision record if the work commits the project to a protocol, runtime,
storage model, security boundary, or product behavior.

## Git workflow

- `main` should remain understandable and runnable once code exists.
- Use short-lived branches for trunk-bound work and deliver through a pull
  request unless the user explicitly overrides that route for a specific
  change.
- Keep commits focused on one coherent change.
- Do not commit secrets, local printer data, camera recordings, logs, caches, or
  unrelated generated artifacts.
- Include generated artifacts only when they are intentional deliverables and
  their source and regeneration path are documented.
- Do not introduce a lockfile-free dependency setup; once a runtime is chosen,
  commit its manifest and lockfile together.

## Verification levels

Report evidence with its actual boundary:

- static checks and unit tests;
- protocol fixtures or simulator tests;
- integration tests against a controlled endpoint;
- physical-printer tests;
- user-observed outcome.

Passing a lower level never implies that a higher one passed.

Use these four acceptance layers consistently:

1. **Static/software:** deterministic code, state-machine, and policy checks.
2. **Protocol/simulator:** behavior against fixtures, emulators, or a controlled
   API endpoint.
3. **Real printer:** observed behavior on the named printer and firmware under
   the recorded conditions.
4. **User outcome:** evidence that the system reduced supervision, alerted at
   the right time, or supported a safe intervention.

An acknowledgement from a printer API is not the same as an observed physical
effect. Lost or ambiguous telemetry is not success.

## Change review checklist

- Does the change preserve the separation between observation, authorization,
  action, and verification?
- Can lost connectivity or an ambiguous response be mistaken for success?
- Are printer capabilities and current state checked before a command?
- Is sensitive local data minimized and excluded from Git?
- Are timeout, retry, duplication, and reconnection behaviors explicit?
- Is the evidence sufficient for the claim being made?
- Did the change resolve an open question or create a new one?

## Decision records

Decision records live in `docs/decisions/` and use the supplied template. Mark
them `proposed`, `accepted`, `superseded`, or `rejected`. Prefer superseding an
accepted record to silently rewriting its history.

## Continuity and handoff

The detailed continuity contract is in `docs/continuity.md`. For material work,
open or identify an iteration before implementation. Keep exact commands and
evidence in its `VALIDATION.md`; keep current status, unresolved risks, and the
next smallest action in `HANDOFF.md`.

Before pausing, update `PROJECT_STATE.md` and `NEXT_AGENT.md`. A new agent should
be able to resume without reading the prior conversation.
