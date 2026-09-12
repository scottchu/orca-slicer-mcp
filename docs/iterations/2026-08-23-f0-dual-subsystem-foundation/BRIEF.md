# F0 dual-subsystem foundation brief

## Delivered slice — Camera recovery and fixed live widgets

The user stopped dynamic/composable expansion on 2026-09-11, requested existing
fixed Lab widgets in live use, and reported Camera dropping after about three
minutes followed by repeated crash/reload behavior. The screenshots show `Live
reply timed out` then `Could not load camera`; they establish visible failure,
not its cause. Camera reliability comes first; fixed-widget adoption follows.

F0 / CAM-008, UI-003, UI-004 and OBS-011 are addressed by
[decision0059](../../decisions/0059-prioritize-camera-reliability-and-fixed-live-widgets.md). PR125 delivers Camera and all nine fixed observation
views. MCP Fans/Thermals/Queue reuse existing live adapters; Heads is already
native. Progress/Current Job/History/Overview/Bed Mesh add live presentation
adapters. This sequence is implementation order, not separate releases.
Independent review, required shipping, both-service restarts and scoped
installed verification are complete at runtime0.4.20/schema18/observation23/Camera18. No synthetic DTO casts or null-to-zero substitutions; preserve PR123's local Overview failure isolation and distinguish
native renderer adoption from unfinished product-feature coverage.

Acceptance: Camera survives sustained-use cases beyond the reported three-minute
boundary, delayed replies, failed snapshot acquisition and lifecycle cleanup
without overlapping sessions or recovery loops. A delayed answer timeout must
not close connected freshly presented video. Failed Auto snapshots use bounded
1.5/3/6/12/24/30-second backoff, reset after an accepted frame; healthy cadence
stays unchanged. Live-media claims require decoded/presented-frame evidence.
Each fixed widget preserves receipts, freshness, unknown/zero/stale/failure
semantics, focus and stable failure geometry through real adapters.

Use independent exact review, a single required-regression owner and every
existing shipping guard, both-service restart and scoped behavior verification.
Static/software, simulator, deployed-service, printer and actual-phone evidence
remain separate. Keep all 55 ledger IDs and product gaps. Dynamic expansion
stops; its source/history and synthetic Lab stay private and unregistered while
fixed components may enter live routes. No printer controls, auth/Tailscale
changes or plugin reinstallation. [Current evidence](evidence/2026-09-11-fixed-widgets-camera-reliability.md)
owns commands and outcomes; [NEXT_AGENT](../../../NEXT_AGENT.md) owns order.

## Prior briefs — historical; superseded as execution instructions

## Completed slice: Overview subview isolation

F0 production-widget maintenance under OBS-015/decision0021 is delivered through
PR123. A problematic subview cannot blank healthy Overview siblings; UI-004
whole-request masking remains intact. [Repair evidence](evidence/2026-09-08-overview-subview-isolation.md) owns
acceptance and actual verification, including the corrected pin-gate failure
and the synthetic probe precondition failure. Both service and installed-byte
synthetic acceptance passed. Current records are complete; review the repaired
result with the user. No repaired host/phone/physical acceptance is claimed.

No upstream adapter, private-DSL, redesign or printer work was added. Those
workstreams remain parked or unresolved.

## Historical briefs — superseded by the completed slice above

The following handoff and earlier release orders are historical, completed steps.
Follow [NEXT_AGENT.md](../../../NEXT_AGENT.md), not those old execution orders.

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
詳見 monitor evidence。沒有新部署或 active monitoring；UI 停工，等待新任務。

- Status: active
- Current slice: agent-readable observation/monitor capabilities; UI work parked
- Decision: [0054](../../decisions/0054-own-current-state-and-maintenance-evidence.md)

## Execution order

Decision0057's bounded first agent-monitor slice is delivered through PR119,
merged at `825b38135948574f832f94aa533d3bb58dd6e33a`. The unchanged shipping
workflow completed mandatory validation, exact-build installation, both service
restarts, health/integrity,84 security checks and static-asset/preservation checks.
The PR119 runtime was0.4.17/schema17; observation21 and Camera17 client assets
remain unchanged. The first failed inventory gate and its correction remain in
the evidence record. No current-printer monitoring or durable daemon was started;
UI work remains parked. Further product work has not been specified.
[Agent-monitor evidence](evidence/2026-09-08-agent-monitor.md) owns contract, implementation and validation progress.

PR117 completed private/unregistered Lab integration at
`a6868fd8271489fbfef0025f95c3f7c0e1dc7e18`, with the exact reviewed tree and
ordered merge parents verified. No deployment, restart, production registration
or printer call occurred. PR118 completed the records closure. The subsequent
agent-monitor authorization changes execution order as described above. See
[merge-only evidence](evidence/2026-09-08-lab-merge.md).

The user selected proposal1 from the previous three directions and then
requested width/multi-card refinement. The same refined direction is delivered
in three contexts: single card, two cards and narrow-screen stacking. The user
accepts the direction for now and has stopped further UI exploration and
implementation. The subsequent source-integration task is described above. Do not reopen
direction selection or resume an isolated badge fix. No application code,
styling, build, HTML application or release belonged to that concept round.
[Layout-context evidence](evidence/2026-09-07-smart-layout-contexts.md) owns that
completed sequence. The prior visual-direction and comparison evidence remain
byte-preserved with their limitations.

The requested comparison is complete with seven matched synthetic screenshot
boards and independent source/runtime verification. Its
[evidence record](evidence/2026-09-07-dsl-widget-comparison.md) owns results.
The comparison identified the ordinary390px Unknown badge wrap and14px Card increase;
the source/packaged DSL mismatch was also explicit and is now repackaged for
the completed PR117 merge. The UI repair scope is recorded;
there is no automatic release continuation. Preserve decision0056 and
the extreme-decimal narrow-screen limitation. No repair has been implemented.

PR111 maintenance is delivered. The user then prioritized cleanup followed by
spacing: retain the same information and make adjacent attributes easier to read.
Task-owned resources were released; the system-wide file-descriptor cause remains
unresolved. The user clarified that the default switches from a full-width
temperature row to paired color/fan columns without an evident relationship.
The three-row default, demo labeling, focused verification, independent exact
review and guarded delivery are complete. The preceding user request asked to inspect existing widgets, compose overlapping
information with the closed DSL, and compare matched screenshots before more
styling or release. Preserve the partial spacing/type implementation and
decision0056 as provisional WIP; its 8px gap and 1.25rem font choices are not
accepted outcomes. Report unsupported capabilities explicitly. The separate
worktree/local checkpoint handoff is recorded in
[transfer evidence](evidence/2026-09-06-dsl-widget-comparison-handoff.md). See
[default summary evidence](evidence/2026-09-06-default-summary.md); the earlier
[spacing evidence](evidence/2026-09-06-composition-spacing.md) remains historical.

The completed maintenance sequence remains:

1. Make current records concise and preserve historical evidence without loss.
2. Repair scoped reliability, shared application-use-case and CSS contract issues
   identified in the review, with focused affected-consumer verification.
3. Obtain independent source review and verification of the frozen candidate;
   assign one owner to the required full candidate regression.
4. Deliver the approved widget maintenance through the existing `u1-ship`
   workflow under standing release authorization, including both service restarts,
   exact served assets and scoped meaningful behavior verification.
5. Review the result with the user before expanding the product or private Lab.

## Observable acceptance

The new slice must define bounded agent-readable data/image contracts, preserve
freshness and independent evidence times, bind monitor continuity to a verified
run, and distinguish observed terminal outcomes from lost or stopped monitoring.
Decision0057 defines the first-slice contract. Implementation, independent review, mandatory
validation and guarded PR119 delivery are complete. No active-monitor, native-run or physical acceptance is claimed.

The following concept/comparison acceptance remains historical:

This round delivers three contexts of the same selected direction and a clear
user-review step for width/composition. It separates current fixed-T1/four-leaf
support from proposed layout changes. Images are not CSS measurements,
implementation or runtime evidence. The user accepts the direction for now;
UI work is parked, without implementation/runtime/physical/release acceptance.

This comparison's acceptance is limited to inspectable same-data/state/viewport/
root-text evidence, explicit supported overlap and gaps, concrete findings and a
bounded next repair. It does not accept the transferred WIP or physical hardware.
The following delivered-maintenance criteria remain historical context:

- Current records name completed PR109/110, separate merged Lab from deployed
  production, and provide one next action per workstream without stale tasks.
- Historical files and their relative-link targets remain byte-identical to
  the recorded source commit; current summaries link to one maintenance evidence
  record instead of repeating commands and artifact identities.
- Changed reliability/use-case/CSS behavior receives focused consumer coverage;
  the private Lab stays private and production behavior remains explicit.
- Independent review, required full regression and shipping evidence bind to the
  exact candidate. Software, protocol, deployed service, real printer and user
  outcomes remain separate acceptance claims.

## Boundary and deferred work

No printer controls, authentication, Tailscale, plugin reinstallation or Lab
production registration is included. Preserve all 55 delivery-ledger IDs and
unfinished Queue, Fans and Job History coverage. C08 Camera reliability remains
open unless specific new evidence accepts it. The accepted preparation pure core
has no supported adapter or actual uploader acceptance. Unrelated Camera planning
from another worktree is not adopted by this slice.

[Current state](../../../PROJECT_STATE.md) owns workstream status;
[handoff](HANDOFF.md) owns remaining work; [validation](VALIDATION.md) links the
single evidence record. The [PR110 archive](../../history/2026-09-05-pr110/README.md)
preserves the complete previous brief and historical acceptance criteria.
