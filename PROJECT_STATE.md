# Project state

## Active continuation

The user now authorizes implementing agent-readable observation and monitoring
capabilities: a complete read-only snapshot, model-visible camera evidence, and
truthful session continuity and terminal rules through shared application use
cases. Decision0057 adopts the bounded first slice; implementation and author
focused checks are complete on the candidate. Exact independent review and
required guarded delivery remain pending. This request does not start monitoring the
current printer or establish a durable daemon. UI work remains parked.
[Agent-monitor evidence](docs/iterations/2026-08-23-f0-dual-subsystem-foundation/evidence/2026-09-08-agent-monitor.md) owns the new slice.

Private, unregistered Lab source integration is complete through PR117, merged
at `a6868fd8271489fbfef0025f95c3f7c0e1dc7e18`. The merge tree exactly matches
the independently approved head. No deployment, restart or printer call occurred.
UI work remains parked; existing simple widgets remain the product mainline and
DSL remains a private experiment. PR118 completed its documentation closure at
`9d08702a779c31d8aa3009d75b2beff5d5e8e9ff`. The subsequent user approval starts
the agent-monitor implementation slice above. [Merge-only evidence](docs/iterations/2026-08-23-f0-dual-subsystem-foundation/evidence/2026-09-08-lab-merge.md)
owns this execution and its boundaries.

The user selected proposal1 as the visual direction, then requested revision of
its width and multi-card composition. Three contexts of the same refined design
are delivered: single card, two cards and narrow-screen stacking. The user now
accepts the layout direction for the time being and has parked UI work. No more
UI exploration or implementation is pending; Lab-only source integration is complete.
This is not a new three-direction selection. The completed concept round included no application
code, styling, build or release. [Layout-context evidence](docs/iterations/2026-08-23-f0-dual-subsystem-foundation/evidence/2026-09-07-smart-layout-contexts.md)
owns that completed sequence; the previous concept images and evidence are preserved.

The requested existing-widget and matching DSL comparison is complete with seven
matched synthetic screenshot boards and independent source/runtime verification.
The ordinary390px Unknown badge wraps and increases the DSL Card by14px; this
remains an unresolved defect to address within the selected visual direction,
not the next isolated implementation task.
The comparison found a source/package mismatch; private packaging has now been
regenerated, independently validated and merged through PR117.
[Comparison evidence](docs/iterations/2026-08-23-f0-dual-subsystem-foundation/evidence/2026-09-07-dsl-widget-comparison.md)
owns findings, commands, identities and limits. Work continues on
`codex/u1-dsl-widget-comparison`, based on main
`acaaa7978f10b46642f8c29f56bab3ce4b82ae97`, in a separate worktree.
Transferred spacing/type source and decision0056 are provisional WIP, not an
accepted release. [NEXT_AGENT.md](NEXT_AGENT.md) owns the new execution order;
[handoff evidence](docs/iterations/2026-08-23-f0-dual-subsystem-foundation/evidence/2026-09-06-dsl-widget-comparison-handoff.md)
records the local migration and its limits. The canonical checkout is restored
to main; unrelated Camera WIP remains separately preserved.

## Baseline

PR115 consistent default is merged at `7584f62168c8861e95b8904e22021b9eeaf300eb`
and deployed: runtime 0.4.15, schema 16, observation 21 and Camera 17.
Both services passed restart, health, integrity and exact-asset verification.
PR109/110 integration and bookkeeping are complete. These are recorded release
observations, not a claim of continuous live monitoring.

## Active iteration

[F0 maintenance brief](docs/iterations/2026-08-23-f0-dual-subsystem-foundation/BRIEF.md)
now prioritizes the agent-readable observation/monitor contract and implementation. [Decision 0054](docs/decisions/0054-own-current-state-and-maintenance-evidence.md)
defines record ownership; [NEXT_AGENT.md](NEXT_AGENT.md) owns execution order.

| Workstream | Current status | Next bounded action |
| --- | --- | --- |
| Maintenance | PR111 reviewed, merged and deployed through unchanged shipping guards | Review the delivered result with the user |
| Production widgets | PR115 / 0.4.15 is deployed; both services and exact assets verified | Preserve truthful coverage; accept actual-device outcomes separately |
| Private composable Lab | PR117/118 integration and closure complete; UI work parked | Preserve private scope and known limits |
| Agent observation/monitoring | Candidate0.4.17/schema17 implemented; author focused checks pass, no active printer monitoring | Independent exact review and required guarded delivery |
| Preparation handoff | Decision 0048 pure core independently accepted | Supported adapters, durable storage and actual upload remain deferred |
| Camera C08 | User reports Auto/Live working at home and outside use working well | Preserve this self-report; long-duration and mounted-host acceptance remain separate |
| Remaining widget requests | [55-ID ledger](docs/widget-delivery.md) retains delivery and gaps | No new feature work during this maintenance slice |

Unrelated Camera planning in another worktree is preserved and is not adopted
by this maintenance candidate. Queue, Fans and Job History remain unfinished
at the product-coverage layer described in the ledger.

## Acceptance state — PR115 baseline

- **Static/software:** independent exact review, required application/operator
  gates, deterministic bundles and mandatory shipping validation pass.
- **Protocol/simulator:** final synthetic visual, composable and MCP consumer
  checks pass. PR115 installed native Lab state/geometry checks pass at 1440px / 100%
  and 320px / root200% with synthetic data;22 actual responses match the release. PR111's installed-byte Heads timeout/retry/typography, MCP
  Copy/recovery and Camera snapshot recovery remain attributed prior evidence. These do
  not establish actual ChatGPT host or device acceptance.
- **Deployed service:** PR115 is installed; both services restarted and passed
  health, integrity, exact assets, security and private-state preservation checks.
- **Real printer:** no new printer acceptance is claimed by maintenance.
- **User outcome:** user reports Camera Auto/Live working at home and outside use
  working well. Duration, outside mode coverage and mounted-host behavior remain
  separately unverified. Earlier Lab feedback concerned attribute spacing and
  inconsistent row/column placement; decision0055 records that correction.
  The user rejected the current source-derived Smart appearance, selected
  proposal1 from three concepts, and requested width/multi-card context revision
  before implementation. The user now accepts the direction for the time being
  and has stopped further UI work. This does not accept implementation or exact
  responsive behavior.

## Next action

Obtain independent exact review of the bounded agent-monitor candidate, then
complete the existing guarded PR/shipping workflow. UI work remains parked. Follow
[NEXT_AGENT.md](NEXT_AGENT.md), preserving evidence boundaries and existing release guards. Do not
register the Lab, control the printer, change auth/Tailscale or reinstall plugins.

[VALIDATION](docs/iterations/2026-08-23-f0-dual-subsystem-foundation/VALIDATION.md)
is the evidence index; [HANDOFF](docs/iterations/2026-08-23-f0-dual-subsystem-foundation/HANDOFF.md)
tracks remaining work. The [PR110 archive](docs/history/2026-09-05-pr110/README.md)
preserves all previous records and failures. Current summaries link evidence;
they do not duplicate command logs or require another PR to record themselves.
