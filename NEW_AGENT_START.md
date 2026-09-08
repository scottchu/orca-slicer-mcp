# 新 MCP client task 接手入口（2026-09-08）

## 現行入口：Overview 子區塊故障隔離

MCP handoff、指定舊樹清理與 caller 可恢復封存均已完成，以本機 receipts
為準，不可重播下方歷史流程。新名稱工具已呼叫；使用者截圖顯示 Overview
故障、Camera Live。這不是實體列印或 phone 驗收。

本 task 在既有 worktree、分支 codex/overview-subview-isolation-20260908
修復單一子區塊使整張 Overview 隱藏的問題。作者實作與聚焦驗證完成；
依 [NEXT_AGENT.md](NEXT_AGENT.md) 接續獨立 review 與既有 guarded shipping。
[本輪證據](docs/iterations/2026-08-23-f0-dual-subsystem-foundation/evidence/2026-09-08-overview-subview-isolation.md) 記錄命令與界線。
禁止重播 handoff、操作印表機或改動其他 WIP；下方內容完整保留為歷史。

請用繁體中文接手。這是真實新 CLI task 的新 worktree；不可再建立下一個。
先讀使用者層級 `/Users/scottchu/.codex/skills/handoff/SKILL.md`，再讀 AGENTS、
PROJECT_STATE、NEXT_AGENT、docs/requirements、CURRENT 指向的 BRIEF/HANDOFF/VALIDATION，
以及 [本次保存證據](docs/iterations/2026-08-23-f0-dual-subsystem-foundation/evidence/2026-09-08-mcp-client-handoff.md)。

## 精確位置與身份

- 新目錄：`/Users/scottchu/.codex/worktrees/u1-mcp-client-handoff-20260908`
- 新分支：`codex/u1-mcp-client-handoff-20260908`
- 原始 HEAD：`55a4e016675901db76bf8c99432c3700c2794f49`（PR122 merge）
- 唯一待清理舊目錄：`/Users/scottchu/.codex/worktrees/u1-agent-handoff-20260908`
- 唯一待封存原 task：`01a0811e-4b1b-7721-84ee-b823e38a40be`，由原主 agent 的 CODEX_THREAD_ID 精確取得。
- 本 task ID 必須來自本身可信 CLI runtime；不可把 subagent ID 當作本 task。

## 接手、清理、封存與續做順序

1. 核對 cwd/branch/HEAD、clean index，以及新 private dir
   `tmp/mcp-client-handoff-20260908/preservation-manifest.json`、獨立 review 與
   `cleanup-receipt.json`。所有舊樹項目（除了 Git 行政 pointer）已完整保存；
   原 tracked bytes 在 source-tracked，現行 tracked 文件只有本次交接更新。
   manifest 擁有 hashes、modes、links 和 old→new prefix map；歷史證據原文不改。
2. 獨立保全驗證通過且本 task 接受交接後，只清理上列精確舊 task worktree，
   保留其 branch/checkpoint refs。Receipt 已完成項目勿重播；缺資料先停下保全。
3. 正式 CLI `codex archive 01a0811e-4b1b-7721-84ee-b823e38a40be` 已獲明確授權，
   身份核對後執行；記 actual command/result。只封存，不 delete/kill 或修改 history database。
   CLI 拒絕時報實際失敗、不繞過。清理和封存是分開結果，均寫 receipt。
4. 僅唯讀檢查實際可用 MCP catalog 是否出現 `get_printer_snapshot`、
   `open_printer_view`、`open_printer_camera`；不要呼叫印表機或開始監控。
   報告 server 已發布與本 task 工具可用性之差異，回傳本 task 可點 deeplink 後等待。

## 現行產品與邊界

PR121 rename 與 PR122 records closure 已完成。已部署 **0.4.18/schema18，
observation21/Camera17**，兩個服務重啟、mandatory gates、獨立 review、installed-byte
synthetic 均通過。舊 task 的實際 catalog 仍顯示舊名稱，這是此次移轉目的；
新 task tool discovery 不等於 real-host 呼叫、圖片判讀或 physical acceptance。
原 PR119 一次 snapshot 實測保留，不是新版名稱或完整列印驗收。
沒有 active monitoring；下一項產品工作未指定，禁止自行追加產品工作。

UI 停工；DSL private/unregistered 僅 T1 四 leaves。保留 provisional0056、
390px Unknown Card+14px、extreme-decimal limitation，以及未發布0.4.16/obs22/cam18
WIP refs 與全部 private evidence。不要採用舊 WIP 為已部署版本。

先前 comparison worktree 及 task `01a07a0a-b1f4-7ab3-91ea-b2bb84cf3380`
已完成清理/封存，其 nested receipts 是歷史完成記錄，不得重做。
Canonical `/Users/scottchu/Projects/personal/orca-slicer-mcp` 與 main、其他
worktrees、services、plugins、auth/Tailscale、使用者 session 均不得修改。
不使用 Orca IDE skills/hooks。Shell 搜尋僅 `/opt/homebrew/bin/rg`；Python 僅 `uv run`。
本輪沒有產品測試、PR/push、部署或 printer call；只做交接與上述已授權收尾。
