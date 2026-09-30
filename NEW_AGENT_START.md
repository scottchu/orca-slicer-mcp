# Active entrypoint: U1 design system — primitives and composition

Current order changed on 2026-09-29: preserve completed source and sanitized
knowledge on main before reformat, then retire eligible worktrees safely.
This authorizes source-preservation merge independently of the pending visual
choice; it does not adopt gallery APIs/layout or authorize deployment. Read
[NEXT_AGENT.md](NEXT_AGENT.md), [recovery checklist](docs/reformat-recovery.md) and
[current evidence](docs/iterations/2026-08-23-f0-dual-subsystem-foundation/evidence/2026-09-29-reformat-preservation.md).
PR138 source preservation merged to verified main at
`5d210d4bc5859a0aa871ea1eedbe7a44a3fc69f8`; PR127 closed after exact preservation
verification. Off-machine private backup and removal still require verified
outcomes; neither is claimed by this entrypoint. Earlier transfer actions below remain complete.

Transfer intake is accepted, independent preservation verification passed, and
the exact caller conversation was reversibly archived through the supported CLI.
The canonical checkout is excluded from removal. All other worktrees, services,
releases, snapshots and evidence remain preserved. These completed actions must
not be replayed; exact operational identities remain in private receipts.

Read [PROJECT_STATE.md](PROJECT_STATE.md), [NEXT_AGENT.md](NEXT_AGENT.md),
[requirements](docs/requirements.md), and the iteration named by
[CURRENT](docs/iterations/CURRENT). The [handoff evidence](docs/iterations/2026-08-23-f0-dual-subsystem-foundation/evidence/2026-09-21-design-system-handoff.md)
records transfer boundaries. The [design-system proposal](docs/design-system-review.md)
and implemented [offline gallery](experiments/u1-design-system-gallery/README.md)
own the current scoped design work. [Gallery evidence](docs/iterations/2026-08-23-f0-dual-subsystem-foundation/evidence/2026-09-22-design-system-gallery.md)
records exact builds and scoped review; the next step is user visual selection
before production migration. Prior [audit evidence](docs/iterations/2026-08-23-f0-dual-subsystem-foundation/evidence/2026-09-22-design-system-audit.md)
retains its original boundaries.

The adopted hierarchy is foundations → primitives → small composed values →
domain components → widgets → pages. Visual direction and a broad migration are
not adopted. Acquisition stays outside presentational components. Continue with
role-separated design, implementation, validation and independent review.
Runtime 0.4.24 remains delivered; no deployment or printer operation is pending
from intake. Earlier entrypoints below are historical.


---

# U1 接手入口

## 現行狀態：固定 live widgets 與 Camera recovery 已發布 PR125

PR125 已合併為 `1716867af057d55b2e170215126dff429f4d000f`，部署版本為
runtime0.4.20/schema18/observation23/Camera18。獨立 exact review、完整
mandatory shipping、兩個服務明確重啟、health/integrity/exact assets/security
及 installed-byte 九個 native views 的 synthetic 驗證均完成。

先讀 [PROJECT_STATE.md](PROJECT_STATE.md)、[NEXT_AGENT.md](NEXT_AGENT.md)、
requirements 與 CURRENT 指向的 iteration。
[發布證據](docs/iterations/2026-08-23-f0-dual-subsystem-foundation/evidence/2026-09-11-fixed-widgets-camera-reliability.md)
保留兩次發布 gate 失敗、修復、實際命令與各層驗證結果。現行發布與記錄已完成；
下一步是與使用者檢視修復結果，不重播發布、清理或舊交接。
一次 real Overview 觀測及 local Chromium 連接實際 Camera 的 210.148 秒 Live
檢查已通過；同一 video 持續解碼、無 reload，離開後資源清理完成。這不等於
使用者 iPhone 驗收；actual phone reliability 與原 crash 原因仍未確認，C08 open。

Dynamic/composable 擴展保持停止，source/history 與 synthetic Lab 保留 private、
unregistered。保留全部 55 delivery IDs 及 Queue/Fans/History 其他 feature gaps。
無新增 printer controls、auth/Tailscale、plugin reinstall 或 active monitoring。
本次 records-only closure 不改 application bytes，不需要額外部署。

## 先前入口：歷史，已由上方現行任務取代

## 現行入口：PR123 已完成發布與記錄

Overview 子區塊故障隔離已合併與部署：runtime0.4.19/schema18/
observation22/Camera17。獨立 exact review、mandatory gates、兩個服務重啟、
health/integrity/exact assets 與 installed-byte synthetic 驗證均完成。
[本輪證據](docs/iterations/2026-08-23-f0-dual-subsystem-foundation/evidence/2026-09-08-overview-subview-isolation.md) 擁有實際命令與身份；
[NEXT_AGENT.md](NEXT_AGENT.md) 擁有後续順序：與使用者檢視修復結果。

目前沒有新產品任務或待補的記錄更新。修復後 actual-host／phone／physical
尚未驗收；無 printer call 或 active monitoring。上游 Job History malformed
原因未修復；UI／private DSL 與其他 WIP 仍保留停工狀態。

## 歷史 handoff 入口：已完成，禁止重播

下方交接、精確舊樹清理及 caller 可恢復封存全部完成。新名稱工具後來已呼叫，
使用者修復前截圖顯示 Overview 故障、Camera Live；不等於修復後驗收。
以下歷史限制與執行命令不能取代上方現行狀態。

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
