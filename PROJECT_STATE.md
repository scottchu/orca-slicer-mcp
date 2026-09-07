# Project state

## Baseline

PR115 consistent default is merged at `7584f62168c8861e95b8904e22021b9eeaf300eb`
and deployed: runtime 0.4.15, schema 16, observation 21 and Camera 17.
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
| Production widgets | PR115 / 0.4.15 is deployed; both services and exact assets verified | Preserve truthful coverage; accept actual-device outcomes separately |
| Private composable Lab | PR115 default uses three sequential full-width readings; other layouts are labeled Demo | Review the delivered default with the user |
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
  checks pass. PR115 installed native Lab state/geometry checks pass at 1440px / 100%
  and 320px / root200% with synthetic data;22 actual responses match the release. PR111's installed-byte Heads timeout/retry/typography, MCP
  Copy/recovery and Camera snapshot recovery remain attributed prior evidence. These do
  not establish actual ChatGPT host or device acceptance.
- **Deployed service:** PR115 is installed; both services restarted and passed
  health, integrity, exact assets, security and private-state preservation checks.
- **Real printer:** no new printer acceptance is claimed by maintenance.
- **User outcome:** user reports Camera Auto/Live working at home and outside use
  working well. Duration, outside mode coverage and mounted-host behavior remain
  separately unverified. The current Lab feedback concerns attribute spacing;
  the user then identified inconsistent row/column placement in the default.
  Decision0055 addresses that follow-up; the new default still awaits user acceptance.

## Next action

Review the [delivered consistent default](docs/iterations/2026-08-23-f0-dual-subsystem-foundation/evidence/2026-09-06-default-summary.md)
as described in [NEXT_AGENT.md](NEXT_AGENT.md),
preserving evidence boundaries and existing release guards. Do not
register the Lab, control the printer, change auth/Tailscale or reinstall plugins.

[VALIDATION](docs/iterations/2026-08-23-f0-dual-subsystem-foundation/VALIDATION.md)
is the evidence index; [HANDOFF](docs/iterations/2026-08-23-f0-dual-subsystem-foundation/HANDOFF.md)
tracks remaining work. The [PR110 archive](docs/history/2026-09-05-pr110/README.md)
preserves all previous records and failures. Current summaries link evidence;
they do not duplicate command logs or require another PR to record themselves.
