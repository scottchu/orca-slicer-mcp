# Project state

## Baseline

Source baseline: PR109 private Lab and PR110 records are merged at
`8cc6eb18c44fb1ac0a3a92ead9a3a0e725bb50cc`. The PR110 bookkeeping task is done.
The accepted deployment record remains PR106, runtime 0.4.12, schema 16,
observation 18 and Camera 14, until maintenance shipping is verified. These are
recorded deployment facts, not a fresh live-health claim.

## Active iteration

[F0 maintenance brief](docs/iterations/2026-08-23-f0-dual-subsystem-foundation/BRIEF.md)
now puts maintenance before feature expansion. [Decision 0054](docs/decisions/0054-own-current-state-and-maintenance-evidence.md)
defines record ownership; [NEXT_AGENT.md](NEXT_AGENT.md) owns execution order.

| Workstream | Current status | Next bounded action |
| --- | --- | --- |
| Maintenance | Header/Bed scoped repair independently accepted; final artifacts and focused checks pass | Complete renewed full verification, exact review and required release |
| Production widgets | PR106 is the last accepted deployment | Preserve current coverage until exact maintenance release passes |
| Private composable Lab | PR109/110 source integration complete; no production registration | Preserve isolation; return to a user walkthrough after maintenance |
| Preparation handoff | Decision 0048 pure core independently accepted | Supported adapters, durable storage and actual upload remain deferred |
| Camera C08 | Actual-phone Live reliability unresolved | Keep open; synthetic success or healthy services cannot close it |
| Remaining widget requests | [55-ID ledger](docs/widget-delivery.md) retains delivery and gaps | No new feature work during this maintenance slice |

Unrelated Camera planning in another worktree is preserved and is not adopted
by this maintenance candidate. Queue, Fans and Job History remain unfinished
at the product-coverage layer described in the ledger.

## Acceptance state

- **Static/software:** prior Lab and preparation pure-core acceptance is retained.
  Maintenance passed a pre-Header full software gate; the Header correction
  invalidates affected evidence, so current full acceptance remains pending.
- **Protocol/simulator:** historical fixtures and scoped installed-byte checks
  remain attributed to their original candidates; maintenance needs new evidence.
- **Deployed service:** PR106 remains the accepted record; no new shipping result
  is claimed. Exact release checks and meaningful changed behavior are distinct.
- **Real printer:** no new printer acceptance is claimed by maintenance.
- **User outcome:** phone Camera reliability, mounted-host behavior and the
  composable Lab's usefulness remain separately unverified.

## Next action

Complete the approved maintenance in [NEXT_AGENT.md](NEXT_AGENT.md), preserving
existing authorization, role separation and mandatory `u1-ship` gates. Do not
register the Lab, control the printer, change auth/Tailscale or reinstall plugins.

[VALIDATION](docs/iterations/2026-08-23-f0-dual-subsystem-foundation/VALIDATION.md)
is the evidence index; [HANDOFF](docs/iterations/2026-08-23-f0-dual-subsystem-foundation/HANDOFF.md)
tracks remaining work. The [PR110 archive](docs/history/2026-09-05-pr110/README.md)
preserves all previous records and failures. Current summaries link evidence;
they do not duplicate command logs or require another PR to record themselves.
