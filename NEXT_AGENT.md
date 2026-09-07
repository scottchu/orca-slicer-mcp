# Next agent

## Immediate task: existing widgets versus DSL compositions

Continue from `codex/u1-dsl-widget-comparison`, a local WIP checkpoint based on
main `acaaa7978f10b46642f8c29f56bab3ce4b82ae97`. Use a separate worktree in the
new Codex Desktop conversation. Keep the canonical checkout on main; never
switch it to a feature branch. The visible new conversation remains a user
Desktop action, not an already-created thread.

1. Read AGENTS.md, PROJECT_STATE.md, requirements and the active iteration.
   Preserve the transferred spacing/type WIP and provisional decision0056.
2. Inspect existing widgets and capture their current presentation using
   synthetic data. Select overlapping information that the closed DSL supports.
3. Compose that information with the existing DSL and compare screenshots under
   matched data, evidence state, viewport and text scale. Check labels, value font
   size/weight, visible attribute gaps, alignment, grouping and wrapping.
4. Report unsupported fields or interactions explicitly. Do not fabricate DSL
   capabilities or change grouping merely to make screenshots look similar.
5. Present concrete comparison findings before more styling or release. Then
   scope the smallest supported repair, with delegated implementation and
   independent review/verification under the existing repository workflow.

The current closed DSL is limited to the fixed T1 subject and HeadStatus,
HeadTemperature, FilamentColor and FanRelation leaves. These do not establish
complete Heads or Thermals widget parity; identify the supported overlap first.

PR115 / runtime0.4.15 remains the recorded deployed baseline. The local0.4.16,
observation22, Camera18 and private-Lab revision7 edits are unpublished WIP.
Earlier tests do not accept these changed bytes. No product tests or deployment
were run as part of the handoff; see the
[transfer evidence](docs/iterations/2026-08-23-f0-dual-subsystem-foundation/evidence/2026-09-06-dsl-widget-comparison-handoff.md).

## Preserve

Keep the Lab private and unregistered, existing information truthful, and the
extreme-decimal narrow-screen limitation explicit. Preserve unrelated Camera
planning and the original detached worktree. No printer controls, authentication,
Tailscale or plugin reinstallation belongs to this comparison. Keep the
[delivery ledger](docs/widget-delivery.md) and all shipping guards unchanged.
Camera home/outside success remains user-reported, without long-duration or
mounted-host acceptance. Do not kill user sessions to address tool FD pressure.
