# Working agreement

## Development posture

Work in small vertical slices. A useful slice crosses the necessary boundaries
to answer one real question—for example, printer telemetry through the resident
service and MCP tool—without building unrelated framework.

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
- Use short-lived branches for implementation work.
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
