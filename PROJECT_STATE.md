# Project state

## Baseline

PR111 maintenance is merged at `4dea3e2cced0d70060476cd641db4a795b865bb8`
and deployed: runtime 0.4.13, schema 16, observation 19 and Camera 15.
Both services passed restart, health, integrity and exact-asset verification.
PR109/110 integration and bookkeeping are complete. These are recorded release
observations, not a claim of continuous live monitoring.

## Active iteration

[F0 maintenance brief](docs/iterations/2026-08-23-f0-dual-subsystem-foundation/BRIEF.md)
now puts maintenance before feature expansion. [Decision 0054](docs/decisions/0054-own-current-state-and-maintenance-evidence.md)
defines record ownership; [NEXT_AGENT.md](NEXT_AGENT.md) owns execution order.

| Workstream | Current status | Next bounded action |
| --- | --- | --- |
| Maintenance | PR111 reviewed, merged and deployed through unchanged shipping guards | Review the delivered result with the user |
| Production widgets | PR111 / 0.4.13 is deployed; health, integrity and exact assets verified | Preserve truthful coverage; accept actual-device outcomes separately |
| Private composable Lab | PR109/110 source integration complete; no production registration | Preserve isolation; return to a user walkthrough after maintenance |
| Preparation handoff | Decision 0048 pure core independently accepted | Supported adapters, durable storage and actual upload remain deferred |
| Camera C08 | Actual-phone Live reliability unresolved | Keep open; synthetic success or healthy services cannot close it |
| Remaining widget requests | [55-ID ledger](docs/widget-delivery.md) retains delivery and gaps | No new feature work during this maintenance slice |

Unrelated Camera planning in another worktree is preserved and is not adopted
by this maintenance candidate. Queue, Fans and Job History remain unfinished
at the product-coverage layer described in the ledger.

## Acceptance state

- **Static/software:** independent exact review, required application/operator
  gates, deterministic bundles and mandatory shipping validation pass.
- **Protocol/simulator:** final synthetic visual, composable and MCP consumer
  checks pass. Independent installed-byte Heads timeout/retry/typography, MCP
  Copy/recovery and Camera snapshot recovery pass under synthetic data. These do
  not establish actual ChatGPT host or device acceptance.
- **Deployed service:** PR111 is installed; both services restarted and passed
  health, integrity, exact assets, security and private-state preservation checks.
- **Real printer:** no new printer acceptance is claimed by maintenance.
- **User outcome:** phone Camera reliability, mounted-host behavior and the
  composable Lab's usefulness remain separately unverified.

## Next action

Review the delivered result with the user as described in [NEXT_AGENT.md](NEXT_AGENT.md),
preserving evidence boundaries and existing release guards. Do not
register the Lab, control the printer, change auth/Tailscale or reinstall plugins.

[VALIDATION](docs/iterations/2026-08-23-f0-dual-subsystem-foundation/VALIDATION.md)
is the evidence index; [HANDOFF](docs/iterations/2026-08-23-f0-dual-subsystem-foundation/HANDOFF.md)
tracks remaining work. The [PR110 archive](docs/history/2026-09-05-pr110/README.md)
preserves all previous records and failures. Current summaries link evidence;
they do not duplicate command logs or require another PR to record themselves.
