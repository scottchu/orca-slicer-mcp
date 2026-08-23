# Repository guidance

## Current phase

This project is in product discovery and foundation work. Do not treat the
provisional architecture as an implementation commitment.

## Working rules

- Treat a print session, not a sliced file, as the central product concept.
- Keep printer-specific behavior behind an adapter boundary.
- Separate observation, recommendation, authorization, action, and
  verification in both design and implementation.
- Default consequential or uncertain actions to explicit user authorization.
- Record product or architecture decisions in `docs/decisions/`.
- Add concrete acceptance evidence to roadmap milestones before marking them
  complete.
- Do not claim that simulation, mocks, or protocol tests prove safe behavior on
  physical hardware.
- Never commit credentials, camera recordings, local printer identifiers, or
  generated runtime data.
- Treat repository files as durable project memory. Chat history can help find
  evidence, but it does not replace current repository records.
- Before material work, read `PROJECT_STATE.md`, `NEXT_AGENT.md`,
  `docs/requirements.md`, and the iteration named by
  `docs/iterations/CURRENT`.
- Keep static/software, protocol/simulator, real-printer, and user-outcome
  evidence separate. Passing an earlier layer never proves a later one.
- When a user changes execution order, update the active iteration and follow
  the new order immediately instead of continuing a stale plan.
- Do not copy raw conversations into the repository. Preserve decisions,
  observations, failures, commands, and unresolved risks that can affect later
  work.

## Change workflow

Before a substantial implementation change:

1. Identify the roadmap milestone and open question it addresses.
2. State observable acceptance criteria and the relevant safety boundary.
3. Record a decision when the change commits the project to a product or
   architecture direction.
4. Implement the smallest end-to-end slice that can be verified.
5. Report simulated evidence and physical-printer evidence separately.

Before stopping or handing off material work:

1. Update the active iteration's `VALIDATION.md` with commands that actually
   ran and the evidence boundary they support.
2. Update its `HANDOFF.md` with changed paths, unresolved risks, and the next
   smallest action.
3. Update `PROJECT_STATE.md` and `NEXT_AGENT.md` so another agent can resume
   from repository files alone.

## GitHub delivery

- Develop trunk-bound changes on a non-`main` branch and deliver them through a
  pull request unless the user explicitly overrides that route for a specific
  change.
- Keep pull requests concise and point to repository records for detailed
  rationale and evidence.
- GitHub Projects are not required for planning or delivery.
- `.github/repository-policy.toml` records the intended policy; it does not
  claim that GitHub branch protection is configured.
