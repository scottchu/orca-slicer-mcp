# Project agents

Four reusable Codex custom agents live in this repository, not in a temporary
workspace or personal global configuration. Their TOML files are authoritative:

| Name | Question it answers | Definition |
| --- | --- | --- |
| `ui_ux_designer` | Is the experience consistent, clear and accessible? | [Role](../.codex/agents/ui_ux_designer.toml) |
| `printer_domain_expert` | Is the printer information useful and semantically correct? | [Role](../.codex/agents/printer_domain_expert.toml) |
| `agentic_architect` | Are MCP/API contracts coherent, bounded and safe to orchestrate? | [Role](../.codex/agents/agentic_architect.toml) |
| `maker_user` | Can a low-CAD-knowledge maker discover and complete the task easily? | [Role](../.codex/agents/maker_user.toml) |

The printer expert understands frontend/API-server/firmware separation in the
Fluidd, Moonraker and Klipper ecosystem and verifies version-dependent facts.
The maker is an explicitly simulated persona, not real user research: a printer
owner with basic OpenSCAD/Python who wants original designs without a CAD course.

## Use

From a Codex session opened in this project, ask for a role by name and supply
the scope, evidence and expected output. For example:

- “Use `ui_ux_designer` to capture and critique the synthetic Lab's loading/error
  transitions at mobile and desktop widths. Return prioritized findings; no UI edits.”
- “Use `printer_domain_expert` to review Progress and Queue grouping against the
  current DTOs. Explain missing or excessive information; no real-printer reads.”
- “Use `agentic_architect` to propose the read-only Console MCP/API contract,
  privacy boundary and acceptance checks. Do not implement or query the printer.”
- “Use `maker_user` for a first-use walkthrough of the assigned design preview.
  Report confusing steps in first person; do not upload or start a print.”

Combine roles only when distinct perspectives are useful. State whether a task
is critique, design or implementation. An author cannot independently approve
their own implementation. These roles neither run continuously nor acquire
extra authority; review feedback does not authorize deployment or printer work.

## Configuration and compatibility

The [official OpenAI custom-agent documentation](https://learn.chatgpt.com/docs/agent-configuration/subagents)
defines standalone project files under `.codex/agents/`, with `name`,
`description` and `developer_instructions`. No registry entry or new
`.codex/config.toml` is needed here. Filenames match their configured names.

These definitions omit model, reasoning, sandbox, approval, tool/MCP and skill
overrides. They leave session settings to the parent and any existing explicit
spawn/default configuration; no model or permission change is introduced.
Application source, build inputs, services and printer state are unaffected.

Static TOML validation is not proof that a particular running client discovered
or selected these roles. The authoring session's exposed spawn tool has no
custom-agent-name selector, so native loading/invocation remains unverified.
If a client cannot select a named role, report that limitation. A coordinator
may explicitly supply the relevant file's instructions to an ordinary bounded
subagent as a fallback, but must label it as such rather than claiming native
role loading. Do not install plugins, change global settings or raise limits
to hide a compatibility problem.

## Focused validation

Run `uv run --no-project scripts/test_project_agents.py`. It checks the local
minimal schema, exact role names, configuration inheritance and documentation
links. Review the instruction text separately for meaning and scope. These are
configuration/source checks, not an LLM behavior evaluation, screenshot audit,
native-client loading test or physical-printer acceptance. This config/docs-only
change does not need full widget suites or a service restart; application
releases still obey every existing `u1-ship` gate.
