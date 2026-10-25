# Project state

## Active work — behavior-preserving code and design cleanup

The user now prioritizes cleanup under the accepted six-layer design system.
The first bounded slice consolidates receipt composition for Fans, Heads
Materials and Thermals Cavity in the existing domain component. Copy, placement,
source association, loading geometry and consumer-specific policies stay fixed;
gallery visual adoption and broad migration remain pending.

[Current evidence](docs/iterations/2026-08-23-f0-dual-subsystem-foundation/evidence/2026-10-23-receipt-composition-cleanup.md)
owns scope, consumer inventory, acceptance and actual checks. Source cleanup and
85 focused diagnostic tests pass; checkpoint `4e3cf3bf` has independent source
approval and is preserved in [draft PR140](https://github.com/scottchu/orca-slicer-mcp/pull/140).
The user adopts installed Bun 1.4.2 and has now resumed full cleanup acceptance.
Runtime-pin checkpoint `d3445b0` has independent source approval.
[Package-acceptance evidence](docs/iterations/2026-08-23-f0-dual-subsystem-foundation/evidence/2026-10-24-receipt-package-acceptance.md)
owns renewed packages, version identities and required verification. Nine
affected packages and measured pins are regenerated; 85 client and 20 package/CLI
checks pass. Full independent local-gate/release acceptance remains pending;
the supported existing U1 service
root is absent. Historical runtime 0.4.24 is not a fresh liveness claim.
[NEXT_AGENT.md](NEXT_AGENT.md)
owns execution order. Older preservation orders below are superseded for this
task, with their unresolved backup concerns retained separately.

## Active work — pre-reformat source and knowledge preservation

The user requests completed work and durable knowledge on main, with no dangling
worktrees before reformat. Source-preservation merge of the isolated gallery is
now authorized; the prior draft-only restriction is superseded for that purpose.
Visual adoption and production migration remain pending, with no deployment.

[Recovery checklist](docs/reformat-recovery.md) maps repository source, private
backup necessities and unresolved design choices. [Current evidence](docs/iterations/2026-08-23-f0-dual-subsystem-foundation/evidence/2026-09-29-reformat-preservation.md)
owns actual integration/preservation results. PR138 merged to main at
`5d210d4bc5859a0aa871ea1eedbe7a44a3fc69f8`; exact reviewed source and preserved
PR127 files were verified, and PR127 closed as superseded. Off-machine private
backup and worktree retirement remain incomplete. The backup destination still
needs the user's selection; local disk pressure limits staging. [NEXT_AGENT.md](NEXT_AGENT.md)
owns the active order; prior gallery and release records remain historical evidence.

## Active work — gallery ready for visual selection

The isolated [component gallery](experiments/u1-design-system-gallery/README.md)
is implemented. It compares imported current thermal primitives with explicit
No target and source-associated receipt groups, compares actual Progress/common
duration formatting, and includes a Camera contract reference/common Switch.
The baseline is a bounded imported-component composition, not the exact shipped
Thermals widget. Gallery APIs/layout remain proposals.

Scoped author checks and screenshot-first UX review support review readiness;
[gallery evidence](docs/iterations/2026-08-23-f0-dual-subsystem-foundation/evidence/2026-09-22-design-system-gallery.md)
records exact output versions and independent verification. User visual selection
is next: no-target treatment, receipt placement and duration precision.
Production source, common components, dependencies and public assets are unchanged;
runtime 0.4.24 remains delivered. [NEXT_AGENT.md](NEXT_AGENT.md) owns the current
order. Earlier audit/proposal records follow as history.


## Active work — design-system audit and review proposal

The accepted hierarchy is foundations, primitives, small composed values,
domain components, widgets and pages. Transfer acceptance, independent
preservation verification and exact caller archival are complete. The canonical
checkout and other worktrees/services/evidence remain preserved; intake is not a
pending action.

The [review proposal](docs/design-system-review.md) maps existing common
components, state contracts and a bounded gallery plan. Its
[audit evidence](docs/iterations/2026-08-23-f0-dual-subsystem-foundation/evidence/2026-09-22-design-system-audit.md)
separates source findings from selected fresh synthetic captures. The proposed
first slice is temperature/current-target/no-target plus independent observation
time, with a Progress time-group comparison and Camera contract reference.
Visual direction and implementation remain unaccepted. No application source or
runtime behavior changes are claimed; runtime 0.4.24 remains delivered.
[NEXT_AGENT.md](NEXT_AGENT.md) owns the current execution order. Earlier sections
below are historical.


## Current release — Progress semantic states repaired

PR136 merged at `8b3c3bedb8a6a9c2220ba14360e7a4baa701ca54` and deployed
runtime 0.4.24 / schema 19 / observation 27 / Camera 18. Standby now has a
compact no-active-print view; unknown, offline, preview-local failure, terminal
jobs and whole acquisition failure retain distinct semantics. Both existing
services restarted and passed health, identity, integrity and preservation.

[Evidence](docs/iterations/2026-08-23-f0-dual-subsystem-foundation/evidence/2026-09-21-progress-states.md) owns exact review, shipping and scoped installed
verification. Actual revised phone/ChatGPT and active-print outcomes remain
separate. [NEXT_AGENT.md](NEXT_AGENT.md) owns the next user review opportunity.

## Current release — Progress canvas controls and timing delivered

PR134 merged at `43389ab3b64cfcfbf13368c2af0c3e986e5cbc5f` and shipped
runtime 0.4.23 / schema 19 / observation 26 / Camera 18. The common 3D/Top
switch now sits inside the render viewport at Camera’s bottom-right inset.
Layer joins percentage/bar; Elapsed and Remaining share a responsive time group.
Both existing services restarted and passed identity, health and preservation.

[Slice evidence](docs/iterations/2026-08-23-f0-dual-subsystem-foundation/evidence/2026-09-21-progress-canvas-toggle.md) owns independent review, required shipping and
installed verification. Actual active-print and revised phone/ChatGPT outcomes
remain separate. Current records are complete; this unchanged-application tail
requires no additional deployment. [NEXT_AGENT.md](NEXT_AGENT.md) owns next action.

## Current release — refined Progress panel delivered

PR132 merged at `9c94bd1e48efe4f00dd066f63aba2928b882a286` and shipped
runtime 0.4.22 / schema 19 / observation 25 / Camera 18. Both existing services were
explicitly restarted and verified. Progress now uses the common Camera-style
3D/Top switch and places status, percentage and bar in the model panel's bottom.
Unknown values remain readable; acquisition/cache/layer semantics are unchanged.

[Slice evidence](docs/iterations/2026-08-23-f0-dual-subsystem-foundation/evidence/2026-09-21-progress-layout.md) owns the correction, exact review,
mandatory shipping, preservation and installed verification. The record tail
changes documentation only and needs no additional deployment. Actual active
print and ChatGPT/phone acceptance remain separate. [NEXT_AGENT.md](NEXT_AGENT.md)
owns the next user review opportunity.

## Current release — G-code Progress delivered

PR130 merged at `d1d72ff593f6444fb2bc5c82957f7693ab558e18` and shipped
runtime 0.4.21 / schema 19 / observation 24 / Camera 18. Both existing services
were explicitly restarted and verified. Progress now renders bounded cached
G-code paths for the reported file, with verified reported-layer mapping and
15-second visible printing/paused updates through the shared observation store.

[Slice evidence](docs/iterations/2026-08-23-f0-dual-subsystem-foundation/evidence/2026-09-21-live-gcode-progress.md) owns the stopped first gate, corrected
exact review, successful mandatory shipment, preservation and independent
installed-byte rendering checks. The final record tail changes documentation
only and requires no deployment. Metadata correlation is not execution-byte
identity or measured deposition; actual active-print/ChatGPT/phone outcome
remains separate from software and installed-fixture acceptance.

P03's bounded slice is delivered; P02 thumbnails and unrelated gaps remain
separate. The earlier ChatGPT reconnection follow-up is complete by user report.
[NEXT_AGENT.md](NEXT_AGENT.md) owns the next observation opportunity.

## Prior operational status — historical evidence

## Public U1 route recovered — ChatGPT confirmation pending

The user-requested connection repair restored public DNS answers across the
checked resolvers and verified U1 HTTPS endpoints through both returned public
relays with valid TLS. Actual ChatGPT reconnect remains unaccepted.

[Recovery evidence](docs/iterations/2026-08-23-f0-dual-subsystem-foundation/evidence/2026-09-21-connection-recovery.md) owns exact actions, preservation and
independent public-edge results. The installed PR125 application, OAuth
identity, unrelated routes and private dashboard were preserved. Draft PR127
remains isolated. [NEXT_AGENT.md](NEXT_AGENT.md) owns the user confirmation gate.

## Existing server refresh completed — 2026-09-21

Both existing U1 services were restarted through the supported lifecycle
command. The installed PR125 release remains runtime 0.4.20 / schema 18 /
observation 23 / Camera 18; latest main changes only documentation, so no new
application build or installation was needed.

[Refresh evidence](docs/iterations/2026-08-23-f0-dual-subsystem-foundation/evidence/2026-09-21-runtime-refresh.md) owns actual commands, identities,
verification and limits. Draft PR127 remains an isolated offline experiment.
No printer controls, authentication, Tailscale changes or plugin reinstallation
were included. ChatGPT reconnect and external reachability are separate from
this service refresh; [NEXT_AGENT.md](NEXT_AGENT.md) owns the next action.

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

[Release evidence](docs/iterations/2026-08-23-f0-dual-subsystem-foundation/evidence/2026-09-11-fixed-widgets-camera-reliability.md) owns exact review, two stopped shipping attempts,
subsequent corrections, successful shipment and scoped behavior results. The
complete browser collection remains 431 passes/3 failures followed by verified
affected closure; no second complete 434-case green run is claimed.

Release records are complete. Review the repaired experience with the user;
no additional deployment is needed for this unchanged-application documentation
tail. [NEXT_AGENT.md](NEXT_AGENT.md) owns the remaining user-review boundary.

Dynamic expansion stays stopped and its source/history private and unregistered.
Preserve all 55 delivery IDs and separate Queue/Fans/History product gaps,
upstream History malformed-response uncertainty and unrelated WIP. No printer
controls, auth/Tailscale changes or plugin reinstallation were included.

## Prior state — historical, superseded as execution instructions

## Delivered Overview subview isolation — PR123

PR123 is merged at `71b007852f02cda291bbe41c598e93a63576ace5` and deployed as
runtime0.4.19/schema18/observation22/Camera17. Independent exact review, mandatory
shipping gates, both service restarts, health/integrity, exact assets and
installed-byte synthetic behavior passed. A failed subview stays local while
healthy Overview tiles remain readable; whole-request failures still mask old
readings. [Repair evidence](docs/iterations/2026-08-23-f0-dual-subsystem-foundation/evidence/2026-09-08-overview-subview-isolation.md) owns commands and identities.

Release and record updates are complete. Repaired actual-host, phone and physical
acceptance remain unobserved; next action is review with the user, not another
release. Upstream Job History malformed responses remain unresolved. No printer
call or monitoring was started. UI redesign/private DSL and unrelated WIP stay
parked. [NEXT_AGENT.md](NEXT_AGENT.md) owns current execution order.

## Historical records — superseded by the delivered state above

The following handoff, catalog and prior-release paragraphs retain their original
time scope. Their cleanup/archive and release steps are complete, never pending
actions. New-name tools were subsequently called; the user's pre-fix screenshots
show Overview failure and Camera Live. These do not accept repaired host behavior.

## Current MCP client handoff — 2026-09-08

PR121 release and PR122 record closure are complete. A new real CLI task is
requested to refresh the host catalog, using new worktree
`/Users/scottchu/.codex/worktrees/u1-mcp-client-handoff-20260908` and branch
`codex/u1-mcp-client-handoff-20260908` from PR122 merge55a4e016.
[New entrypoint](NEW_AGENT_START.md) and
[handoff evidence](docs/iterations/2026-08-23-f0-dual-subsystem-foundation/evidence/2026-09-08-mcp-client-handoff.md) own exact identities, preservation and order.
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
