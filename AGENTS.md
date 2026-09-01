# Repository guidance

## Current phase

This project is in product discovery and foundation work. Do not treat the
provisional architecture as an implementation commitment.

## Working rules

- Treat Orca Preparation and Printer Operations as peer subsystems. A prepared
  print job is the preparation aggregate; a print session is the execution
  aggregate.
- Keep their handoff explicit and traceable. Slicing, upload, start, command
  acknowledgement, and observed printing are distinct states and evidence.
- Keep OrcaSlicer behind the preparation boundary and printer-specific behavior
  behind the operations adapter boundary; neither subsystem is an adapter
  around the other.
- Keep printer-specific behavior behind an adapter boundary.
- Separate observation, recommendation, authorization, action, and
  verification in both design and implementation.
- Default consequential or uncertain actions to explicit user authorization.
- Record product or architecture decisions in `docs/decisions/`.
- Add concrete acceptance evidence to roadmap milestones before marking them
  complete.
- Do not claim that simulation, mocks, or protocol tests prove safe behavior on
  physical hardware.
- Never commit credentials, camera recordings, local printer identifiers, user
  models or projects, private profiles, custom G-code, generated artifacts,
  temporary paths, or runtime data.
- Treat repository files as durable project memory. Chat history can help find
  evidence, but it does not replace current repository records.
- Use `uv` for every Python invocation and dependency operation in this
  repository. Run Python tools through `uv run`; do not call `python` or
  `python3` directly.
- Prefer arrow functions in new or changed TypeScript/JavaScript. Use a function
  declaration only when a specific technical requirement needs it and document
  that reason; do not bulk-rewrite unrelated code to enforce this convention.
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

## Agent orchestration

- The primary agent coordinates the work: observe current reality, clarify the
  expected reality and gaps with the user, assign bounded work, integrate the
  resulting evidence, and remain available for user conversation.
- Delegate all material design, implementation, validation, and independent
  review to role-separated agents. The primary agent must not silently replace
  any of those roles or present its own check as independent review.
- The primary agent may inspect read-only evidence, facilitate decisions,
  coordinate dependencies, and orchestrate integration and delivery of agent
  outputs.
- If the required agents or capacity are unavailable, disclose that constraint
  and wait or ask the user how to proceed instead of performing the material
  work directly.

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
- Run required repository validation locally. Do not configure or wait for
  hosted validation workflows.
- Standing user authorization for each requested U1 widget change includes
  completing local tests and independent approval of the exact candidate SHA,
  merging through a PR, deploying the exact merged build through
  `.agents/skills/u1-ship` and `scripts/u1_ship.py`, explicitly restarting BOTH
  existing public and dashboard U1 services, and verifying health, integrity,
  exact served assets, and scoped meaningful widget behavior before claiming
  completion. Keep software, deployed-service, real-printer, and actual-device
  evidence distinct; health/static checks alone do not prove widget behavior.
- Keep dashboard index implementation labels truthful to delivered coverage;
  unfinished Queue, Fans, and Job History work remains unfinished. This standing
  release authorization does not authorize printer controls, authentication or
  Tailscale changes, or plugin reinstallation. Preserve the existing shipping
  guards and stop on failures; do not bypass them or infer broader authority.
  Documentation-only policy or rollout-record changes require no additional
  service deployment when application bytes are unchanged. See decision 0028.
- Keep pull requests concise and point to repository records for detailed
  rationale and evidence.
- GitHub Projects are not required for planning or delivery.
- `.github/repository-policy.toml` records the intended policy; it does not
  claim that GitHub branch protection is configured.
