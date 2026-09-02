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

### Project review roles

Use the project-scoped role matching the assigned question:

- `ui_ux_designer`: screenshot-first UI/UX, consistency and accessibility;
  `.codex/agents/ui_ux_designer.toml`.
- `printer_domain_expert`: printer information grouping and truthful domain
  semantics; `.codex/agents/printer_domain_expert.toml`.
- `agentic_architect`: agentic MCP/API contracts, authority and boundaries;
  `.codex/agents/agentic_architect.toml`.
- `maker_user`: simulated low-friction maker walkthrough and usability feedback;
  `.codex/agents/maker_user.toml`.

The role files own their detailed instructions; see `docs/project-agents.md`
for invocation and compatibility. Give each a bounded question and evidence
scope. Request multiple roles only when their distinct perspectives matter,
not as a mandatory gate for every small change. Design/persona feedback does
not replace independent implementation review, verification or user acceptance.

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

## Test strategy

- Map each change to affected behavior, transitive consumers, contracts and
  build inputs before choosing checks; shared changes require consumer coverage.
- Use focused tests while editing. Assign one owner to the expensive full
  required candidate regression on frozen application bytes, with recorded
  source/input identities; coordinate exclusive fixture ports instead of
  launching duplicate full runs.
- Keep independent source review and verification separate from authorship.
  Independent verification should use targeted checks and fresh adversarial
  cases, and match the full-run evidence to the exact candidate. Repeat a full
  suite when a mandatory gate, relevant broad impact or unresolved uncertainty
  requires it, not automatically because another role takes over.
- For a documentation-only tail, verify unchanged code, dependencies,
  configuration and generated assets, plus the diff and relevant documentation
  contracts. Bind retained application evidence to the new documentation head;
  do not repeat unaffected full builds or browser suites solely for bookkeeping.
- Relevant source, test, dependency, configuration or build-input changes
  invalidate affected evidence; renew the needed checks before acceptance.
  Record commands actually run, their identities, results and limits. Never
  claim an unrun test or carry changed-byte acceptance forward silently.
- Exception: all existing `u1-ship` required local-validation, exact-review,
  identity, security and preservation guards remain mandatory and unchanged.
  This cadence grants no skip flag, cache bypass, weakened gate or shipping
  automation change. Decision 0028's unchanged-application documentation-only
  no-deployment rule still applies.
- Tests must release their own handles, child processes, isolated browsers,
  fixture ports and watchers in `finally`/teardown, including failure paths.
  Release idle task-owned resources and finish bounded agents when done;
  preserve user applications, sessions, files, deployed runtimes and evidence logs.

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
