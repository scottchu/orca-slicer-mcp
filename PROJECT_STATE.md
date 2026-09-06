# Project state

## Baseline

PR113 spacing is merged at `c61b82b74c484ed106d7c96247cf59e4d6fa9f33`
and deployed: runtime 0.4.14, schema 16, observation 20 and Camera 16.
Both services passed restart, health, integrity and exact-asset verification.
PR109/110 integration and bookkeeping are complete. These are recorded release
observations, not a claim of continuous live monitoring.

## Active iteration

[F0 maintenance brief](docs/iterations/2026-08-23-f0-dual-subsystem-foundation/BRIEF.md)
puts cleanup and spacing review before feature expansion. [Decision 0054](docs/decisions/0054-own-current-state-and-maintenance-evidence.md)
defines record ownership; [NEXT_AGENT.md](NEXT_AGENT.md) owns execution order.

| Workstream | Current status | Next bounded action |
| --- | --- | --- |
| Maintenance | PR111 reviewed, merged and deployed through unchanged shipping guards | Review the delivered result with the user |
| Production widgets | PR113 / 0.4.14 is deployed; both services and exact assets verified | Preserve truthful coverage; accept actual-device outcomes separately |
| Private composable Lab | PR113 spacing is independently approved and deployed, preserving the same four Smart attributes | Review the delivered layout with the user |
| Preparation handoff | Decision 0048 pure core independently accepted | Supported adapters, durable storage and actual upload remain deferred |
| Camera C08 | User reports Auto/Live working at home and outside use working well | Preserve this self-report; long-duration and mounted-host acceptance remain separate |
| Remaining widget requests | [55-ID ledger](docs/widget-delivery.md) retains delivery and gaps | No new feature work during this maintenance slice |

Unrelated Camera planning in another worktree is preserved and is not adopted
by this maintenance candidate. Queue, Fans and Job History remain unfinished
at the product-coverage layer described in the ledger.

## Acceptance state

- **Static/software:** independent exact review, required application/operator
  gates, deterministic bundles and mandatory shipping validation pass.
- **Protocol/simulator:** final synthetic visual, composable and MCP consumer
  checks pass. Installed native Lab state/geometry checks pass at 390px / 100%
  and 320px / 200% with synthetic data. PR111's installed-byte Heads timeout/retry/typography, MCP
  Copy/recovery and Camera snapshot recovery remain attributed prior evidence. These do
  not establish actual ChatGPT host or device acceptance.
- **Deployed service:** PR113 is installed; both services restarted and passed
  health, integrity, exact assets, security and private-state preservation checks.
- **Real printer:** no new printer acceptance is claimed by maintenance.
- **User outcome:** user reports Camera Auto/Live working at home and outside use
  working well. Duration, outside mode coverage and mounted-host behavior remain
  separately unverified. The current Lab feedback concerns attribute spacing;
  the final spacing has not yet received user acceptance.

## Next action

Review the [delivered spacing correction](docs/iterations/2026-08-23-f0-dual-subsystem-foundation/evidence/2026-09-06-composition-spacing.md)
as described in [NEXT_AGENT.md](NEXT_AGENT.md),
preserving evidence boundaries and existing release guards. Do not
register the Lab, control the printer, change auth/Tailscale or reinstall plugins.

[VALIDATION](docs/iterations/2026-08-23-f0-dual-subsystem-foundation/VALIDATION.md)
is the evidence index; [HANDOFF](docs/iterations/2026-08-23-f0-dual-subsystem-foundation/HANDOFF.md)
tracks remaining work. The [PR110 archive](docs/history/2026-09-05-pr110/README.md)
preserves all previous records and failures. Current summaries link evidence;
they do not duplicate command logs or require another PR to record themselves.
