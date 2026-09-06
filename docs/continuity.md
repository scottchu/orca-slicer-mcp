# Project continuity

## Purpose

The repository is the durable source of project state. Agent sessions and chat
summaries are useful context, but another agent must be able to determine the
baseline, intent, evidence, risks, and next action from repository files alone.

This workflow is intentionally lighter than the continuity system used by
multi-project CAD repositories. It applies to one product with Orca Preparation
and Printer Operations subsystems and becomes more detailed only when the risk
or implementation scope requires it.

## Stable and current records

- `docs/vision.md`, `docs/scope.md`, and `docs/roadmap.md` describe product
  direction and ordered milestones.
- `docs/requirements.md` gives stable IDs to working product and safety
  requirements.
- `docs/decisions/` preserves durable decisions and superseded rationale.
- `docs/environment.md` records the concrete OrcaSlicer, printer, and deployment
  facts that were actually observed.
- `PROJECT_STATE.md` is the concise current-state index.
- `NEXT_AGENT.md` is the shortest restart route and copy-paste handoff prompt.
- `docs/iterations/CURRENT` names the active iteration directory.

## When an iteration is required

Open or identify an iteration before work that does any of the following:

- selects a runtime, protocol, printer adapter, storage model, or security
  boundary;
- selects an OrcaSlicer invocation, profile, artifact, or handoff contract;
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
- `VALIDATION.md`: links the single evidence record for each bounded slice,
  where actual attributed commands, results, failures, identities and acceptance
  boundaries are recorded once;
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

A real OrcaSlicer invocation is recorded as software/tool-integration evidence
inside the first layer. It is stronger than a mock for the named tool version,
but it does not establish printer compatibility or physical behavior.

## During work

- Record material changes in direction when they happen. If the user redirects
  the phase, stop the superseded work and update the active brief or handoff.
- Record exact commands and summarized outcomes; never invent a validation run.
- Preserve failed approaches that could otherwise be repeated.
- Tie protocol and real-printer claims to the tested firmware, capability set,
  configuration, and relevant commit or candidate fingerprint.
- Tie real-Orca claims to the exact executable version, input fixture, profile
  identities, overrides, command, exit result, and output hash.
- Keep credentials, local addresses, camera recordings, and printer identifiers
  out of Git. Use redacted labels where identity is not essential.

## Before pausing or handing off

1. Append actual commands/results and boundaries to the active slice evidence
   record and link it from `VALIDATION.md`; update `HANDOFF.md` with remaining work.
2. Update `PROJECT_STATE.md` as a short current-state index, linking evidence.
3. Update `NEXT_AGENT.md` with one precise immediate task, not completed bookkeeping.
4. Follow `AGENTS.md` test strategy: required full candidate/release gates remain
   mandatory; a documentation-only tail checks unchanged application/build inputs
   and relevant documentation contracts without repeating unaffected full suites.
5. Report acceptance and unknowns at all four evidence layers.

[Decision 0054](decisions/0054-own-current-state-and-maintenance-evidence.md)
owns this reporting refinement. Preserve superseded records in a source-bound
archive with relative links intact; historical instructions are not current work.
Do not duplicate evidence or introduce another workflow framework.

Do not store raw chat transcripts or agent diaries. Summarize only durable
facts, decisions, failures, evidence, and next actions.

## Restart boundary

If the repository contains ambiguous baselines, conflicting evidence, or an
untrusted candidate, stop implementation. Create an explicit iteration that
identifies the last trusted revision, rejected or uncertain branches, required
regressions, and the smallest experiment that can restore confidence.
