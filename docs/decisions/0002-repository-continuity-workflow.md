# 0002 — Use lightweight repository continuity records

- Status: accepted
- Date: 2026-08-22
- Owners: project maintainers

## Context

Previous project conversations showed recurring failures when execution order,
accepted baselines, validation boundaries, and next actions existed only in chat
history. Durable handoffs and explicit restart boundaries made related projects
safer to resume. A multi-project CAD repository also demonstrated the value of
machine-checkable continuity contracts, while its full orchestration and
artifact workflow would be excessive for this single software product.

## Decision

Keep a lightweight continuity system in the repository:

- `PROJECT_STATE.md` for current state and acceptance;
- `NEXT_AGENT.md` for the restart route and copy-paste handoff;
- stable requirement IDs in `docs/requirements.md`;
- one active iteration named by `docs/iterations/CURRENT`;
- `BRIEF.md`, `VALIDATION.md`, and `HANDOFF.md` for material iterations;
- four distinct evidence layers: static/software, protocol/simulator, real
  printer, and user outcome;
- a technology-neutral repository structure check in local workflow and CI.

Use pull requests for trunk-bound work by default. Do not require GitHub
Projects or reproduce raw conversation transcripts in repository records.

## Consequences

- A fresh agent can resume from the repository without depending on session
  memory.
- Work pivots and unresolved risks remain visible across sessions.
- Hardware and user-outcome claims cannot be promoted from software-only tests.
- Material work carries a small documentation cost; trivial maintenance does
  not require a new iteration.
- Additional design or review records are added only when risk warrants them.

## Validation

The structure check verifies that required records and the active iteration are
present. The workflow is useful if another agent can identify the baseline,
requirements, acceptance state, and next action from repository files alone.
Revisit the decision if the records become duplicative, routinely stale, or
insufficient for safe printer-control changes.
