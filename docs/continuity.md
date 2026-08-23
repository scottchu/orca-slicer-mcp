# Project continuity

## Purpose

The repository is the durable source of project state. Agent sessions and chat
summaries are useful context, but another agent must be able to determine the
baseline, intent, evidence, risks, and next action from repository files alone.

This workflow is intentionally lighter than the continuity system used by
multi-project CAD repositories. It applies to one printer-operations product
and becomes more detailed only when the risk or implementation scope requires
it.

## Stable and current records

- `docs/vision.md`, `docs/scope.md`, and `docs/roadmap.md` describe product
  direction and ordered milestones.
- `docs/requirements.md` gives stable IDs to working product and safety
  requirements.
- `docs/decisions/` preserves durable decisions and superseded rationale.
- `docs/environment.md` records the concrete printer and deployment facts that
  were actually observed.
- `PROJECT_STATE.md` is the concise current-state index.
- `NEXT_AGENT.md` is the shortest restart route and copy-paste handoff prompt.
- `docs/iterations/CURRENT` names the active iteration directory.

## When an iteration is required

Open or identify an iteration before work that does any of the following:

- selects a runtime, protocol, printer adapter, storage model, or security
  boundary;
- implements a vertical product slice;
- adds or changes a command that can affect an active print;
- evaluates camera-based diagnosis or agent intervention;
- makes a claim about behavior on a real printer;
- spans multiple sessions or needs a deliberate handoff.

Small documentation corrections and mechanical maintenance do not require a new
iteration unless they change the product contract.

## Iteration records

Each iteration contains at least:

- `BRIEF.md`: exact baseline, outcome, scope, non-goals, requirements, risks,
  and planned evidence;
- `VALIDATION.md`: commands that actually ran, results, failures, environment,
  and the acceptance layer each result supports;
- `HANDOFF.md`: current status, changed paths, unresolved risks, and the next
  smallest action.

Add a separate design or review document only when the decision or risk merits
it. Do not create paperwork that merely repeats an ADR, pull request, or test
output.

## Evidence ladder

Every material claim belongs to exactly one current acceptance layer:

1. **Static/software:** code, state machines, schemas, and policy logic.
2. **Protocol/simulator:** fixtures, emulators, recorded exchanges, or a
   controlled API endpoint.
3. **Real printer:** the named printer and firmware under recorded conditions.
4. **User outcome:** whether the system reduced supervision or supported a
   timely, safe decision.

An earlier layer cannot establish a later one. Camera interpretation begins as
an inference. Human feedback is valuable physical evidence but does not
silently change product requirements. Contradictions stay visible until they
are resolved.

## During work

- Record material changes in direction when they happen. If the user redirects
  the phase, stop the superseded work and update the active brief or handoff.
- Record exact commands and summarized outcomes; never invent a validation run.
- Preserve failed approaches that could otherwise be repeated.
- Tie protocol and real-printer claims to the tested firmware, capability set,
  configuration, and relevant commit or candidate fingerprint.
- Keep credentials, local addresses, camera recordings, and printer identifiers
  out of Git. Use redacted labels where identity is not essential.

## Before pausing or handing off

1. Update the active `VALIDATION.md` and `HANDOFF.md`.
2. Update `PROJECT_STATE.md` to match the repository and observed environment.
3. Update `NEXT_AGENT.md` with one precise immediate task.
4. Verify `./scripts/check-repository.sh`.
5. Report acceptance and unknowns at all four evidence layers.

Do not store raw chat transcripts or agent diaries. Summarize only durable
facts, decisions, failures, evidence, and next actions.

## Restart boundary

If the repository contains ambiguous baselines, conflicting evidence, or an
untrusted candidate, stop implementation. Create an explicit iteration that
identifies the last trusted revision, rejected or uncertain branches, required
regressions, and the smallest experiment that can restore confidence.
