# 新 agent 接手入口（2026-09-08）

請用繁體中文接手。先核對現況並保留所有既有資料，不要開始新的 UI、監控或發布。

## 目前位置與順序

- 工作目錄：`/Users/scottchu/.codex/worktrees/u1-agent-handoff-20260908`
- 分支：`codex/u1-agent-handoff-20260908`
- 起點：PR120 merge `2a3e280f2d634f3e4fbabbf7be307f524a3fd86b`
- 使用者的新移轉授權優先於舊比較任務的 fixed cwd/branch 指示。主 repository
  維持 main；不要修改其他 worktree。
- 先讀 [AGENTS.md](AGENTS.md)、[PROJECT_STATE.md](PROJECT_STATE.md)、
  [NEXT_AGENT.md](NEXT_AGENT.md)、[requirements](docs/requirements.md)，再依
  [CURRENT](docs/iterations/CURRENT) 讀該 iteration 的 BRIEF/HANDOFF/VALIDATION。
- 核對本次 [保存證據](docs/iterations/2026-08-23-f0-dual-subsystem-foundation/evidence/2026-09-08-worktree-handoff.md)
  和本機 private preservation manifest，向 root 回報已接手。舊 worktree 只有在
  獨立驗證及新 agent 接受後由 root 移除；作者沒有執行清理。
  實際清理狀態以本機 `tmp/worktree-handoff-20260908/cleanup-receipt.json`
  為準：root 會在操作後記 actual command/result。先看 receipt，勿重播清理。

## 已完成與未驗收邊界

PR117 為 private Lab source integration，PR118 是其文件收尾；PR119 已完成
agent-readable monitor 第一 slice 的獨立 review、mandatory gates、PR merge、
exact-build 安裝、兩個服務明確重啟與驗證。PR120 是文件收尾，不重複部署。
目前 runtime **0.4.17 / schema17 / observation21 / Camera17**。成功 release 綁定
PR119 merge `825b38135948574f832f94aa533d3bb58dd6e33a`；完整成功與首次 gate
失敗在 [monitor evidence](docs/iterations/2026-08-23-f0-dual-subsystem-foundation/evidence/2026-09-08-agent-monitor.md)。

已部署 tool 為 `get_print_monitor_snapshot`，可傳回 presence-aware structured/text
證據及可供模型讀取的 JPEG。Installed-byte synthetic 檢查通過，並非真實印表機、
手機或 host multimodal 驗收。舊 session catalog 仍沒有新 tool；可先只讀重新
搜尋/discover 工具目錄，不呼叫印表機、不重裝 plugin、不改 auth/Tailscale。
重新 discover 成功也不等於影像判讀或 active monitoring 已驗收。

沒有正在監控本機印表機，也沒有 durable daemon、notifications 或歷史 join。
Token 只代表 process-local observational continuity，不是 authorization/native run
proof；12 分鐘 gap、source clock/epoch/counters/job 改變可能要求重新綁定。
同名工作在兩次 poll 之間替換仍有不可辨識限制；報告一致終態不等於 physical success。
O1/SESSION-001 完整能力仍 open。下一項產品工作未指定。

## UI、DSL 與 WIP

UI 已停工。使用者暫時接受方向1與 single/two-card/narrow-stack 概念，沒有授權
繼續 styling。圖片不是 CSS responsive 驗收。Closed DSL 僅 **T1** 與
**HeadStatus、HeadTemperature、FilamentColor、FanRelation**，private/unregistered；
不可宣稱完整 Heads/Thermals parity。普通390px/100% Unknown badge 斷字使 Card
增加14px、extreme-decimal narrow-screen limitation、provisional decision0056 均保留。

WIP 保留 ref：`codex/preserve-u1-lab-wip-20260908T102420Z`，指向
`ae80ecc76e95c5a7c37b478419b7d5c4ccc3e535`。原 local0.4.16、observation22、
Camera18 與 private-Lab revision7 的 preserved bytes 仍在本機保存資料中；不要將
歷史未發布 WIP 誤套回目前已部署版本。原始比較、圖片、metrics、gallery、失敗與
修正 logs、各 input manifest、dependencies 和 symlinks 均已複製，private 清單
提供 old→new prefix 與逐檔 destination。歷史 metadata 不改寫、不偽造舊執行路徑。

## 工作方式

Shell 搜尋一律用 `/opt/homebrew/bin/rg`；Python 與 dependency 操作用 `uv run`。
不要使用 Orca IDE skills/hooks。不要操作印表機、服務、auth/Tailscale、plugin、
其他 worktree、使用者 session 或 Codex chat-history database。

主 agent 只協調；material design、implementation、validation、independent review
依 AGENTS.md 有界委派且角色分離。新的 code 變更用 focused checks；完整昂貴 gates
只給一個 owner 跑在 frozen candidate 上。文件交接只核 unchanged inputs、links、
diff 和保存清單，不因換 agent 重跑已驗收完整 suite。所有 shipping guards 保持不變。
本交接只需要本機 branch commit，沒有新的 PR、release 或 deployment。
