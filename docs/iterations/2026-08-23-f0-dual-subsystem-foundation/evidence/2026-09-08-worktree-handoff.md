# 2026-09-08 新 worktree 完整交接

使用者授權建立新 worktree 交接全部資料，之後清理本次舊 comparison worktree。
此授權優先於舊任務的 fixed cwd/branch 指示；不是新產品、UI 或監控任務。
[NEW_AGENT_START.md](../../../../NEW_AGENT_START.md) 是繁中入口。

## 身份與已完成交付

Root 實際執行 `git worktree add -b codex/u1-agent-handoff-20260908
/Users/scottchu/.codex/worktrees/u1-agent-handoff-20260908
2a3e280f2d634f3e4fbabbf7be307f524a3fd86b`。
新 branch 為 `codex/u1-agent-handoff-20260908`；主 repository 仍為 main。
PR117、118、119、120 都已完成。PR120 是文件 merge，ordered parents 是
PR119 merge825b381 與 reviewed closure01aaddc，tree 完全相同；沒有第二次部署。
PR119 runtime0.4.17/schema17、observation21/Camera17 的服務與 synthetic 驗證
保持 [原有交付證據](2026-09-08-agent-monitor.md) 的範圍。

## 本機資料保存

作者先讀 required records、`git status --short`、`git branch --show-current`、
`git show --no-patch --format='%H%n%P%n%T' HEAD` 與 WIP preservation ref，
用 `du -sh` 盤點空間；舊 tree 約418MB，dependencies235MB，全部可保留。
Shell 搜尋使用 `/opt/homebrew/bin/rg`。Python inventory 與 preservation script
均透過 `uv run --no-project` 執行；沒有直接 Python、build 或測試指令。

Private preservation script 以 git tracked inventory 和不追蹤 symlink 的 filesystem
walk，排除 `.git`，將 ignored/untracked 檔案複製到新 tree 相同相對路徑。
新 tree 的 tracked files 沒有被覆蓋。舊 tracked files 另以相同相對結構存到
private original snapshot，讓本次文件更新後仍能找到舊原始 bytes。
使用 SHA256、file mode 與 symlink target 比對，所有既有目的地若有碰撞須完全
相同才接受；來源在複製前後雜湊相同。沒有刪除舊資料或改寫歷史 metadata。

Private `preservation-manifest.json` SHA256：
`e4cf1f2d770680acf81689c6135a66b1eee3378c4f77da94fe6de16c5c9050b9`。
共23,585 entries：23,566 regular files、19 symlinks、384,711,360 bytes；另有
2,402 directories。逐檔記錄 source/destination、hash/mode 或 link target。
清單包含 old→new prefix relocation map；歷史 metadata 的舊絕對路徑依此解讀，
不得把舊命令改写成新位置。只有 Vitest cache 的 `_svelte_metadata.json` 留有舊
prefix；它是 preserved cache，不是新 tree 的驗收結果，也不是 runtime authority。
全部19 symlinks 是完整保留且沒有 dangling 或指回舊 tree 的 target。

圖片、比較 gallery/metrics、依賴、build outputs、各輪失敗與成功 logs、exact-input
manifests、WIP archive 均保留。Private 檔案與生成物不提交 Git；root 的交接回覆
提供本機清單與路徑。WIP ref `codex/preserve-u1-lab-wip-20260908T102420Z`
仍指向 `ae80ecc76e95c5a7c37b478419b7d5c4ccc3e535`。

## 獨立核對與下一個動作

獨立驗證者已逐檔核對23,585 entries 的來源/目的地 hash、modes、19 links，
並確認舊 tree inventory 沒有 extra/missing，新 tree 沒有失效或舊目標 link。
結果保存在 private `preservation-verification.json`。這是資料保存驗證，不是
重跑產品測試。作者的交接 commit 另以 unchanged510 application inputs、
文件 links/diff 與角色分離核對保留既有交付證據。

新 agent 需讀入口並確認接手，獨立 reviewer 需核對 frozen 文件 head；root 在兩者
完成後才能移除舊 comparison worktree。本文作者沒有移除舊 tree，沒有操作其他
worktrees、printer、services、auth/Tailscale、plugin 或 chat-history database。
此本機交接只做 local branch commit，沒有新 PR/release/deployment。
UI parked；host catalog 可只讀重新 discover，不能為確認而呼叫印表機；沒有 active
monitoring。下一項產品工作未指定。0056 與 closed T1 four-leaf/Unknown14px/
extreme-decimal 等限制見入口，全部保持不變。
