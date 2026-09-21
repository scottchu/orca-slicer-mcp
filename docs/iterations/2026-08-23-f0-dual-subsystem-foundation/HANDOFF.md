# F0 maintenance handoff

## Offline G-code preview ready for user review — 2026-09-21

The experimental candidate contains five reusable files under
`experiments/gcode-preview/`, plus PROJECT_STATE, NEXT_AGENT, this iteration's
BRIEF/HANDOFF/VALIDATION and [experiment evidence](evidence/2026-09-21-gcode-preview.md).
Base is `d5cc3bda8c86b3ae93dc398fdc7db33db1841a56`; branch is
`codex/gcode-progress-preview-20260921`. Exact file hashes in the evidence
record bind the source and private rendered outputs without exposing geometry.

Author and independent targeted checks are complete. The 13 author tests and
15 independent parser cases pass; desktop/narrow/dark browser checks show
keyboard layer selection, correct layer/Z, distinct rendering and no page
errors/external/printer requests. Reviewer-owned browsers were closed. The full
repository check failed on missing `svelte-kit`, not a claimed full pass.

Next smallest action is user review of the offline preview. Fresh native Orca
comparison remains unavailable; the historical custom witness is not native
slicer evidence. Unsupported G-code and nominal visual stroke widths limit
geometry claims; commands do not establish physical deposition. Live session
correlation, production integration and P02/P03 acceptance remain deferred.
Preserve private outputs outside Git, prior release evidence and unrelated work.
This is a draft experimental candidate with no merge/deployment acceptance.

## Delivered fixed live widgets and Camera recovery — PR125

PR125 is merged at `1716867af057d55b2e170215126dff429f4d000f` and deployed as
runtime0.4.20/schema18/observation23/Camera18. Independently reviewed head
`373e4e05994284d84d578fa28bf9784bdb949bf0` passed the unchanged mandatory
shipping workflow. Release `20260912-1716867-pr125-20260912T005903-cfae3d`
was installed; both existing services were explicitly restarted and verified
loaded, healthy and integrity-matched. Exact assets, 115 static checks,
117 security checks and preservation passed; no rollback occurred.

All nine fixed observations now use real adapters and native components on
live dashboard/MCP routes alongside Camera. The installed dashboard synthetic
matrix passed all nine views with zero page errors and stable failure geometry.
One bounded real read-only Overview request returned eight tiles with one local
failure, preserving available sibling tiles. One explicit real Camera Live session in
local Chromium ran 210.148 seconds with advancing playback frames/media time, the same video
element and no reload, navigation or page error; pagehide released its media
and viewer. This local browser/actual-printer result does not establish iPhone
reliability or resolve the reported Camera crash cause; C08 remains open.

[Release evidence](evidence/2026-09-11-fixed-widgets-camera-reliability.md) owns the actual commands, source/package identities,
failed attempts, corrections and scoped installed/real observations. Changed
application areas include Camera lifecycle/backoff, fixed live adapters/roots,
production-safe panels, MCP/native routing, compiled route inventory and
transitive contracts. Application implementation and shipping are complete.

Current indices, iteration, ledger and decision status are reconciled. The next
smallest action is user review of the repaired experience, as recorded in
[NEXT_AGENT](../../../NEXT_AGENT.md). No redundant deployment is needed for
this documentation-only tail; earlier unchanged application evidence remains
bound to the merge and final documentation head.

Dynamic expansion stays stopped and its source/history private and unregistered.
Preserve all 55 delivery IDs and separate Queue/Fans/History product gaps,
upstream History malformed-response uncertainty and unrelated WIP. No printer
controls, auth/Tailscale changes or plugin reinstallation were included.

## Prior handoffs — historical; superseded as execution instructions

## Current outcome: PR123 delivered

Overview failure isolation is implemented, independently approved, merged and
deployed. Both services and meaningful installed-byte synthetic cases passed.
[Repair evidence](evidence/2026-09-08-overview-subview-isolation.md) owns commands, identities, the two preserved
release/probe failures and their corrections. Current record updates are complete.

The next smallest action is user review of repaired Overview behavior. Actual
host/phone/physical acceptance remains unobserved; no printer call or monitoring
is authorized by this record. Upstream Job History malformed responses remain
unresolved. Camera assets, private DSL and unrelated WIP remain preserved.

This closure changes only PROJECT_STATE, NEXT_AGENT, entrypoint, current
BRIEF/HANDOFF/VALIDATION and the existing repair evidence. All511 application
inputs match the shipped candidate; no additional deployment is required for
this documentation-only tail under decision0028.

## Historical handoffs — completed, not pending actions

Do not replay any earlier cleanup/archive, review or release sequence below.

## Current MCP client handoff — 2026-09-08

PR121 release and PR122 record closure are complete. A new real CLI task is
requested to refresh the host catalog, using new worktree
`/Users/scottchu/.codex/worktrees/u1-mcp-client-handoff-20260908` and branch
`codex/u1-mcp-client-handoff-20260908` from PR122 merge55a4e016.
[New entrypoint](../../../NEW_AGENT_START.md) and
[handoff evidence](evidence/2026-09-08-mcp-client-handoff.md) own exact identities, preservation and order.
The successor must verify preservation and accept intake before removing only
the prior u1-agent-handoff worktree, preserving its branch, and reversibly
archiving caller01a0811e-4b1b-7721-84ee-b823e38a40be. The NEW private cleanup
receipt owns actual outcomes; earlier completed cleanup/archive is not repeated.
Then inspect the actual MCP tool catalog read-only and wait. No printer call,
product test, deployment or monitoring is included. Current server remains
0.4.18/schema18, observation21/Camera17; old-task catalog still showed old names.
All previous records below retain their historical scope and limits.


## Delivered naming change — PR121

`get_printer_snapshot`, `open_printer_view` and unchanged `open_printer_camera`
are delivered through PR121 merge `070713ce856c06cd8e1c448bfee387efc5fc9fe6`.
Current deployed baseline is runtime0.4.18/schema18, observation21/Camera17.
Independent exact review, mandatory shipping validation, both service restarts,
health/integrity,82 static responses,84 security checks and preservation passed.
Installed-byte synthetic checks passed. [Tool naming evidence](evidence/2026-09-08-printer-tool-names.md) owns
actual commands, identities, the corrected probe precondition and limits.

No new host, phone, physical or long-duration monitoring acceptance is claimed;
the earlier one-shot host test remains PR119 evidence. No active monitoring.
Delivery records are complete; next product work is unspecified. UI stays parked;
printer controls, auth/Tailscale and plugin reinstall remain outside scope.
The older sections below preserve prior milestones and their evidence boundaries;
PR119 runtime0.4.17 is historical, not the current deployed baseline.


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
The PR119 runtime was0.4.17/schema17; observation21 and Camera17 client assets
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
PR119 / runtime0.4.17 is the preceding deployed baseline; PR115 remains historical.
Historical pending instructions are archived and must not be replayed. All previous
paths, observations, failures and recovery evidence remain in the
[PR110 snapshot](../../history/2026-09-05-pr110/README.md).
