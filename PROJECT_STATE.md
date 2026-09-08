# Project state

## Delivered naming change — PR121

`get_printer_snapshot`, `open_printer_view` and unchanged `open_printer_camera`
are delivered through PR121 merge `070713ce856c06cd8e1c448bfee387efc5fc9fe6`.
Current deployed baseline is runtime0.4.18/schema18, observation21/Camera17.
Independent exact review, mandatory shipping validation, both service restarts,
health/integrity,82 static responses,84 security checks and preservation passed.
Installed-byte synthetic checks passed. [Tool naming evidence](docs/iterations/2026-08-23-f0-dual-subsystem-foundation/evidence/2026-09-08-printer-tool-names.md) owns
actual commands, identities, the corrected probe precondition and limits.

The primary host catalog still shows the retired names; client refresh and a
new-name host call remain unaccepted. No extra printer call was made.
No new host, phone, physical or long-duration monitoring acceptance is claimed;
the earlier one-shot host test remains PR119 evidence. No active monitoring.
Delivery records are complete; next product work is unspecified. UI stays parked;
printer controls, auth/Tailscale and plugin reinstall remain outside scope.
The older sections below preserve prior milestones and their evidence boundaries;
PR119 runtime0.4.17 is historical, not the current deployed baseline.


## Active continuation

使用者已授權移轉至新 worktree；此指示優先於舊比較任務的固定目錄限制。
接手入口：[NEW_AGENT_START.md](NEW_AGENT_START.md)。PR117–120 均已完成；
交接後已完成使用者授權的一次 snapshot MCP 實測；未新增產品功能或發布。

Decision0057's bounded first agent-monitor slice is delivered through PR119,
merged at `825b38135948574f832f94aa533d3bb58dd6e33a`. The unchanged shipping
workflow completed mandatory validation, exact-build installation, both service
restarts, health/integrity,84 security checks and static-asset/preservation checks.
The PR119 runtime was0.4.17/schema17; observation21 and Camera17 client assets
remain unchanged. The first failed inventory gate and its correction remain in
the evidence record. No current-printer monitoring or durable daemon was started;
UI work remains parked. Further product work has not been specified.
[Agent-monitor evidence](docs/iterations/2026-08-23-f0-dual-subsystem-foundation/evidence/2026-09-08-agent-monitor.md) owns the new slice.

Private, unregistered Lab source integration is complete through PR117, merged
at `a6868fd8271489fbfef0025f95c3f7c0e1dc7e18`. The merge tree exactly matches
the independently approved head. No deployment, restart or printer call occurred.
UI work remains parked; existing simple widgets remain the product mainline and
DSL remains a private experiment. PR118 completed its documentation closure at
`9d08702a779c31d8aa3009d75b2beff5d5e8e9ff`. PR119 delivered the subsequent agent-monitor slice; PR120 completed its
documentation closure at `2a3e280f2d634f3e4fbabbf7be307f524a3fd86b`. [Merge-only evidence](docs/iterations/2026-08-23-f0-dual-subsystem-foundation/evidence/2026-09-08-lab-merge.md)
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
owns findings, commands, identities and limits. The original comparison branch
is historical; current work continues on `codex/u1-agent-handoff-20260908`,
based on PR120 merge `2a3e280f2d634f3e4fbabbf7be307f524a3fd86b`.
Transferred spacing/type source and decision0056 are provisional WIP, not an
accepted release. [NEXT_AGENT.md](NEXT_AGENT.md) owns the new execution order;
[handoff evidence](docs/iterations/2026-08-23-f0-dual-subsystem-foundation/evidence/2026-09-06-dsl-widget-comparison-handoff.md)
records the local migration and its limits. The canonical checkout is restored
to main; unrelated Camera WIP remains separately preserved.

## Baseline

PR119 was the preceding deployed runtime baseline:0.4.17/schema17, observation21
and Camera17. Both services passed restart, health, integrity and exact-asset
verification; detailed boundaries are in the agent-monitor evidence.

Historical PR115 consistent default was merged at `7584f62168c8861e95b8904e22021b9eeaf300eb`
and deployed as runtime 0.4.15, schema 16, observation 21 and Camera 17.
Both services passed restart, health, integrity and exact-asset verification.
PR109/110 integration and bookkeeping are complete. These are recorded release
observations, not a claim of continuous live monitoring.

## Active iteration

[F0 maintenance brief](docs/iterations/2026-08-23-f0-dual-subsystem-foundation/BRIEF.md)
records the delivered first agent-monitor slice; the next product task is unspecified. [Decision 0054](docs/decisions/0054-own-current-state-and-maintenance-evidence.md)
defines record ownership; [NEXT_AGENT.md](NEXT_AGENT.md) owns execution order.

| Workstream | Current status | Next bounded action |
| --- | --- | --- |
| Maintenance | PR111 reviewed, merged and deployed through unchanged shipping guards | Review the delivered result with the user |
| Production widgets | PR119 runtime0.4.17 deployed with unchanged observation21/Camera17 assets | Preserve truthful coverage; accept actual-device outcomes separately |
| Private composable Lab | PR117/118 integration and closure complete; UI work parked | Preserve private scope and known limits |
| Agent observation/monitoring | PR119 first slice deployed; no active printer monitoring | Review delivered capability and limits with the user; next product task unspecified |
| Preparation handoff | Decision 0048 pure core independently accepted | Supported adapters, durable storage and actual upload remain deferred |
| Camera C08 | User reports Auto/Live working at home and outside use working well | Preserve this self-report; long-duration and mounted-host acceptance remain separate |
| Remaining widget requests | [55-ID ledger](docs/widget-delivery.md) retains delivery and gaps | No new feature work during this maintenance slice |

Unrelated Camera planning in another worktree is preserved and is not adopted
by this maintenance candidate. Queue, Fans and Job History remain unfinished
at the product-coverage layer described in the ledger.

## Acceptance state — PR119 current baseline

- **Software/protocol:** independent exact review and unchanged mandatory shipping
  validation pass; installed-byte synthetic MCP inventory, data/image and
  continuity checks pass. Synthetic image decoding is not host rendering proof.
- **Deployed service:** both services run0.4.17/schema17;82 static responses,
  84 security checks, integrity and private-state preservation pass.
- **Host/real observation:** the new tool became available and one authorized
  remote MCP call returned fresh complete telemetry plus a decoded JPEG visible
  to the primary. Independent saved-response validation passed. The reported
  terminal state is unbound; the bed/parts were not visible. This is one-shot
  evidence, not physical completion, phone acceptance or active monitoring.
  Refresh causality is unknown; no reload request or service restart occurred.

### Historical PR115 acceptance

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

The first agent-monitor slice and authorized one-shot snapshot smoke test are
complete. Await the next user task; no ongoing monitoring is enrolled. UI work remains parked. Follow
[NEXT_AGENT.md](NEXT_AGENT.md), preserving evidence boundaries and existing release guards. Do not
register the Lab, control the printer, change auth/Tailscale or reinstall plugins.

[VALIDATION](docs/iterations/2026-08-23-f0-dual-subsystem-foundation/VALIDATION.md)
is the evidence index; [HANDOFF](docs/iterations/2026-08-23-f0-dual-subsystem-foundation/HANDOFF.md)
tracks remaining work. The [PR110 archive](docs/history/2026-09-05-pr110/README.md)
preserves all previous records and failures. Current summaries link evidence;
they do not duplicate command logs or require another PR to record themselves.
