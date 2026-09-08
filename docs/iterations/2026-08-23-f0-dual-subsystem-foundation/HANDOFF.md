# F0 maintenance handoff

## Active naming change — 2026-09-08

The user approved `get_printer_snapshot` and `open_printer_view`;
`open_printer_camera` is unchanged. This bounded catalog rename is now the next
authorized task, superseding the earlier awaiting-task wording below. Source
target is runtime0.4.18/schema18 with unchanged observation21/Camera17 assets;
PR119 runtime0.4.17/schema17 remains the deployed baseline until guarded delivery.
[Tool naming evidence](evidence/2026-09-08-printer-tool-names.md) owns actual checks, changed paths and remaining
gates. Next: independent exact review, then one owner runs mandatory shipping
validation and the existing guarded PR/release workflow. No active monitoring,
UI work, printer controls, auth/Tailscale or plugin reinstall is authorized.


## 新 worktree 交接

使用者已授權新 worktree 接手並在核對與接手确认後清理舊 comparison tree。
[繁中接手入口](../../../NEW_AGENT_START.md) 與
[保存證據](evidence/2026-09-08-worktree-handoff.md) 記錄本次順序。
PR117–120 與交接均已完成；後續明確授權的一次 snapshot MCP 實測亦已完成，
詳見下方 monitor evidence。沒有新部署或 active monitoring；UI 停工，等待新任務。

## Current work

The authorized one-shot host snapshot test is complete. The new remote MCP tool
returned real telemetry and a model-visible JPEG; independent saved-response
checks passed. No additional printer call, reload, restart or deployment followed.
The unbound reported terminal state and unseen bed/parts do not prove physical
success. No monitor is active; await the next user task. Changed records are
PROJECT_STATE, NEXT_AGENT, this HANDOFF/VALIDATION and the existing monitor
evidence; private response/image/check artifacts remain ignored.


Decision0057's bounded first agent-monitor slice is delivered through PR119,
merged at `825b38135948574f832f94aa533d3bb58dd6e33a`. The unchanged shipping
workflow completed mandatory validation, exact-build installation, both service
restarts, health/integrity,84 security checks and static-asset/preservation checks.
The current runtime is0.4.17/schema17; observation21 and Camera17 client assets
remain unchanged. The first failed inventory gate and its correction remain in
the evidence record. No current-printer monitoring or durable daemon was started;
UI work remains parked. Further product work has not been specified.
[Agent-monitor evidence](evidence/2026-09-08-agent-monitor.md) owns current commands, decisions and remaining gates.

PR117 completed private/unregistered Lab source integration at
`a6868fd8271489fbfef0025f95c3f7c0e1dc7e18`. The verified merge tree matches
the independently approved head; WIP preservation and production isolation remain
intact. No deployment, restart or printer call occurred. PR118 records closure is
also complete; do not repeat application validation or merge either PR again.
[Merge-only evidence](evidence/2026-09-08-lab-merge.md) owns the completed outcome.

The user selected proposal1 as the direction, then requested width and multi-card
layout revision. Three contexts of the same refined direction are delivered:
single card, two cards and narrow-screen stacking. The user accepts the layout
direction for now and has parked UI work. No further exploration, layout review,
implementation or isolated badge repair is pending; Lab-only source integration
is complete. This direction acceptance is not product/runtime/physical/release
acceptance. That completed concept round changed no app code, styling,
build inputs or deployed service and created no HTML app.
[Layout-context evidence](evidence/2026-09-07-smart-layout-contexts.md) owns the
new concept artifacts and record tail; prior evidence remains byte-preserved.

The reference-first comparison is complete: seven matched synthetic boards,
screenshot-first findings and independent source/runtime verification are in
[comparison evidence](evidence/2026-09-07-dsl-widget-comparison.md).
The390px Unknown badge defect remains preserved for any future UI work;
no repair or layout review is pending. Follow [NEXT_AGENT.md](../../../NEXT_AGENT.md). The original comparison branch and private preservation snapshot retain the
unfinished spacing/type changes; current work is on the new handoff branch.
no product-candidate acceptance or release is claimed.

[Transfer evidence](evidence/2026-09-06-dsl-widget-comparison-handoff.md) records the
33-file WIP preservation, separate Camera preservation, canonical-main restoration
and evidence boundaries. Changed WIP includes common Reading/Metric/Group/Swatch,
composable leaves/registry/props, affected tests, version pins and tracked widget
HTML; decision0056 remains provisional. Inspect these before editing. Private
recovery manifests retain the exact pre-transfer bytes and command log.

## Delivered maintenance

The user approved maintenance before new features. [BRIEF.md](BRIEF.md) records
scope and acceptance; [NEXT_AGENT.md](../../../NEXT_AGENT.md) owns execution order.
Record reorganization and scoped reliability/shared-use-case/CSS repairs are
implemented and delivered in PR111 after exact review and guarded release.
The current correction reduces composition spacing while preserving all four Smart
attributes. PR113 passed independent exact-source approval and the mandatory guarded release.
Installed synthetic native Lab behavior passed; later user feedback selected
a concept direction and parked UI work. No layout review remains pending.
[Spacing evidence](evidence/2026-09-06-composition-spacing.md) owns changed components,
actual checks, artifact identities and the existing extreme-decimal limitation.

## Changed paths and evidence

The current monitor slice adds the shared use case/policy, same-query adapter
evidence, strict MCP schema/registration, runtime version and affected tests;
it updates maintained skill inventory and decision0057/requirements/current
records. Existing client and widget bytes remain unchanged. Prior comparison,
visual-direction and Lab-merge evidence remains preserved.

The completed comparison changed only its evidence record, `PROJECT_STATE.md`,
`NEXT_AGENT.md`, and this iteration's brief/handoff/validation index. Local
generated screenshots, metrics, gallery and manifests remain private evidence;
application/build inputs and tracked widget HTML are unchanged.

Prior maintenance summaries: `PROJECT_STATE.md`, `NEXT_AGENT.md`, this iteration's brief,
handoff and validation index, `docs/widget-delivery.md`, `docs/continuity.md`,
`AGENTS.md` reporting instructions, and decision 0054/index. Complete prior records
and their relative-link closure are under `docs/history/2026-09-05-pr110/`.

The [maintenance evidence record](evidence/2026-09-05-maintenance.md) owns actual
commands, results, source identities, application changed paths, review and
shipping outcomes. Authors and reviewers append attributed evidence there.
Current summaries link it instead of copying its logs.

## Unresolved risks and next smallest action

PR111 / runtime 0.4.13 is the preserved prior deployed release. The single evidence record
binds the exact reviewed/merged commits, 510 application inputs, release receipt
and scoped installed-byte verification. The first pre-merge failure and its narrow
repair remain historical evidence. Shipping guards are unchanged.
Camera Auto/Live home use and outside use have positive user self-reports; C08
long-duration reliability and mounted-host behavior remain separately unaccepted.
Preparation pure-core acceptance does not implement its deferred adapters or authorize upload/start.
Preserve Lab isolation, the 55-ID ledger, unrelated work and existing private state.

Follow [NEXT_AGENT.md](../../../NEXT_AGENT.md) for the completed delivery and
unspecified next product task. UI remains parked. Unknown badge
wrapping still increases Card height by14px at390/100%, alongside the preserved
extreme-decimal narrow-screen limit. The former private resource mismatch was
resolved and independently validated in PR117.
PR119 / runtime0.4.17 is the current deployed baseline; PR115 remains historical.
Historical pending instructions are archived and must not be replayed. All previous
paths, observations, failures and recovery evidence remain in the
[PR110 snapshot](../../history/2026-09-05-pr110/README.md).
