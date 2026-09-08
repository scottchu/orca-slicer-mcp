# Next agent

## Active naming change — 2026-09-08

The user approved `get_printer_snapshot` and `open_printer_view`;
`open_printer_camera` is unchanged. This bounded catalog rename is now the next
authorized task, superseding the earlier awaiting-task wording below. Source
target is runtime0.4.18/schema18 with unchanged observation21/Camera17 assets;
PR119 runtime0.4.17/schema17 remains the deployed baseline until guarded delivery.
[Tool naming evidence](docs/iterations/2026-08-23-f0-dual-subsystem-foundation/evidence/2026-09-08-printer-tool-names.md) owns actual checks, changed paths and remaining
gates. Next: independent exact review, then one owner runs mandatory shipping
validation and the existing guarded PR/release workflow. No active monitoring,
UI work, printer controls, auth/Tailscale or plugin reinstall is authorized.


## Current task: agent observation/monitor capabilities; UI work remains parked

使用者已授權移轉至新 worktree；此指示優先於舊比較任務的固定目錄限制。
接手入口：[NEW_AGENT_START.md](NEW_AGENT_START.md)。PR117–120 均已完成；
本次只保存本機證據與交接，不新增產品功能或發布。

目前目錄為 `/Users/scottchu/.codex/worktrees/u1-agent-handoff-20260908`，
分支 `codex/u1-agent-handoff-20260908`，基底 PR120 merge
`2a3e280f2d634f3e4fbabbf7be307f524a3fd86b`。舊 branch/cwd/checkpoint 的
限制僅是歷史；canonical checkout 維持 main。先讀交接入口和 required records，
核對 private preservation manifest，再由獨立驗證者與新接手 agent 確認。
舊 comparison worktree 清理已完成，以本機 cleanup receipt 的 completed 記錄為準；
保全資料與其他 worktrees 維持原狀，不重播清理。
後續明確授權的一次 snapshot MCP 實測已完成；目前等待新指令，不追加輪詢。

1. The [agent-monitor first slice](docs/iterations/2026-08-23-f0-dual-subsystem-foundation/evidence/2026-09-08-agent-monitor.md) is delivered through PR119 at
   `825b38135948574f832f94aa533d3bb58dd6e33a`, runtime0.4.17/schema17 with
   unchanged observation21/Camera17 assets. Mandatory shipping and both service
   restarts/verification completed. Review the delivered capability and limits
   with the user; the next product task is not specified. Do not replay the
   completed implementation, review, merge or deployment as a pending action.
   The new tool is now available; the authorized one-shot remote snapshot test
   and independent saved-response checks passed. No reload request was sent;
   refresh causality is unknown. Await the next user task. Do not infer active
   monitoring, physical completion or phone acceptance from this single sample.
2. Do not start monitoring the current printer merely because capability work
   is authorized. Do not claim durable background monitoring, active ownership,
   print success, or deployment without corresponding evidence. No new UI, DSL
   capability, printer controls, authentication or Tailscale work is included.
3. PR117 source integration, PR118 records closure, PR119 release and PR120
   release-record closure are complete. Do not
   recreate those merges or rerun their full suites for bookkeeping. Preserve
   [merge-only evidence](docs/iterations/2026-08-23-f0-dual-subsystem-foundation/evidence/2026-09-08-lab-merge.md),
   comparison images and all historical records. Simple widgets remain the
   product mainline; the private Lab remains unregistered.
4. UI work stays parked. Preserve selected-direction concepts, provisional0056,
   the390px Unknown badge/Card+14px defect and extreme-decimal narrow-screen
   limitation. These are not fixes or accepted current UI behavior. Earlier
   application evidence does not accept changed monitor implementation bytes.

The current closed DSL is limited to the fixed T1 subject and HeadStatus,
HeadTemperature, FilamentColor and FanRelation leaves. These do not establish
complete Heads or Thermals widget parity; preserve the recorded overlap limits.

PR119 / runtime0.4.17 is now deployed; PR115 / runtime0.4.15 is historical.
The unrelated local0.4.16, observation22 and Camera18 WIP remains preserved
outside the delivered slice. Private-Lab revision7 is still experimental and
unregistered. The original transfer performed no product tests or deployment;
that historical boundary is recorded in the
[transfer evidence](docs/iterations/2026-08-23-f0-dual-subsystem-foundation/evidence/2026-09-06-dsl-widget-comparison-handoff.md).

## Preserve

Keep the Lab private and unregistered, existing information truthful, and the
extreme-decimal narrow-screen limitation explicit. Preserve unrelated Camera
planning and the original detached worktree. No printer controls, authentication,
Tailscale or plugin reinstallation belongs to this comparison. Keep the
[delivery ledger](docs/widget-delivery.md) and all shipping guards unchanged.
Camera home/outside success remains user-reported, without long-duration or
mounted-host acceptance. Do not kill user sessions to address tool FD pressure.
