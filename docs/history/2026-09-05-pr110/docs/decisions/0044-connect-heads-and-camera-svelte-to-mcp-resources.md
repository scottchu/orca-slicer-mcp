# 0044 — Connect Heads and Camera Svelte UI to MCP resources

- Status: PR99 exact source 獨立接受並部署；installed-resource synthetic postverification 通過，實際 phone/OAuth/clipboard 與 real Live 未驗收
- Date: 2026-09-02
- Owners: project maintainers
- Milestone: F0 / UI-001、UI-002、UI-003；delivery ledger F01、F08、X05

## Context

PR97 的 native dashboard pages 沒有改變 MCP resource routing。
`observe_printer` 的 active `observation-v14` 仍讀取 `public/widget.html`，
`open_printer_camera` 的 `camera-v10` 仍讀取 `public/camera-widget.html`。
使用者在 plugin 內看到舊 Heads 與 Camera UI，與這個實際 routing 相符；
widget 的資料 Refresh 不會完成 renderer migration。

Heads 與 Camera 已有可重用的 Svelte components、controllers 與 HostRpc。
但 observation tool 接受九種 view，不能把它的唯一 resource 直接換成
Heads-only artifact，也不能用未驗證的 per-result resource override 避開
tool descriptor。這次要求採用既有新版 UI，沒有要求重做其餘八種 view。

Author 的 MCP protocol/browser fixture 又確認：直接掛載 dashboard Camera
artifact 時，initial calls 是 `open_printer_camera({})` 接著
`get_u1_camera_frame({})`，synthetic frame count 為2。
`app/test-results/mcp-cutover-author/camera-bootstrap-count.log` 保留這個軟體
觀察。MCP 已由 opening tool 取得 initial snapshot，dashboard mount 的主動
request 會再讀一次，因此需要 explicit bootstrap contract；這不是實際
printer 讀取或 C08 root-cause 證據。

## Decision

保留 existing tool inventory、input/output schemas、annotations、authorization、
HTTP/stdio application use cases 與原有 dashboard URLs。這次只把 MCP Heads
與 Camera 接到既有 Svelte presentation，不新增 Heads 專用 tool。

| Active resource | New behavior | Compatibility |
| --- | --- | --- |
| `ui://u1-print-studio/observation-v15.html` | 九種 view 的 closed dispatcher；Heads 使用既有 `LiveHeadsRoot` 與 controller，其餘八種保留 legacy renderer | observation v1–v14 繼續讀取原 legacy HTML；status aliases 不變 |
| `ui://u1-print-studio/camera-v11.html` | 使用新 deterministic `mcp-camera.html`；薄 MCP entry 選擇 host-result bootstrap，共用既有 `LiveCameraRoot`、services 與 lifecycle | camera v1–v10 保留原對應 HTML 與語意；dashboard 保持 request bootstrap |

新 observation resource 是單一 self-contained artifact。只抽出 legacy
renderer 的 host 接線，讓一個 HostRpc owner 初始化、接收及派送 input/result、
執行 Refresh 並負責 disposal。Heads 使用現有 observation port/controller，
legacy adapter 保留既有 renderer、receipt 判讀及呈現，不新增一套 domain
normalization。純 TypeScript/JavaScript adapter 放在 `src/lib/client`，
UI composition 留在 `src/components`，widget entry 留在 `src/entrypoints/widgets`。

實作以原 HTML 作 immutable compatibility snapshot，明確抽出 legacy DOM
renderer 作新入口的 compatibility module；host adapter/dispatcher 維持 typed、
checked source。若 inherited renderer 的舊 JavaScript 需要局部 type-check
豁免，必須明列 inherited debt，不讓豁免涵蓋新增 dispatch、transport 或
lifecycle。用 ShadowRoot 隔離 legacy CSS，明確處理原 `:root`/`body` 規則、
inherited tokens、local DOM queries、focus 與 intrinsic height；不在 runtime
改寫整份 HTML 或讀入第二份 document。這個隔離仍需實際 renderer 測試，
不是 CSS/focus parity 已成立的宣告。

Dispatcher 只接受既有 closed view values。已知 tool input 約束結果的 view；
result-first、compatibility globals 與 notification replay 必須有明確測試。
錯誤、未知或互相矛盾的資料不能任意選擇 Heads、切換顯示其他 view，或造成
額外 acquisition。成功的 initial result 直接交給對應 controller/renderer，
不為了 mount 再讀一次 printer。Refresh 仍呼叫既有
`refresh_printer_observation({ view })`，pending/failed/recovered 狀態沿用0041。

示意 contract（不是新增 protocol）：

```ts
const observationUi = {
  ui: { resourceUri: 'ui://u1-print-studio/observation-v15.html' },
  'openai/outputTemplate': 'ui://u1-print-studio/observation-v15.html',
};
// tool input: { view: 'heads' }
// Refresh: tools/call('refresh_printer_observation', { view: 'heads' })
```

Tool registration、實際 `tools/list` 與任何現有重複 UI metadata references
必須指向同一個新 URI。Resource 使用既有 `RESOURCE_MIME_TYPE` 與空的
connect/resource/frame domain allowlists；不引入 fetch、外部 assets、nested
iframe、runtime HTML loader、eval 或第二個 calling transport。現有
`window.openai` compatibility 只補資料與已支援的 host capabilities。
UI resource 是 cache identity；舊 URI 不暗中換成新版 UI。
這符合 [OpenAI UI resource guidance](https://developers.openai.com/plugins/build/chatgpt-ui)。

Camera components 繼續訂閱/render，service 擁有 activation、peer、timers、
snapshot decode、模式與 release。Snapshot-first 不啟動 Live；明確選擇 Live
才走既有授權流程，失敗時呈現實際 Auto fallback 與 compact icon Switch。

Service 明確接受 `initialSnapshot: 'host-result' | 'request'`。
MCP 的薄 entry 選 `host-result`：有界等待 opening tool 的 initial delivery，
驗證並 decode 該結果，不因 mount 再呼叫 `get_u1_camera_frame`。
Missing 或 malformed initial delivery 進入 neutral error，讓使用者明確
Refresh 重試；不偷偷切換成自動 request。Dashboard 選 `request`，維持既有
mount acquisition。兩者共用 service-owned deadlines、generation、decode、
Refresh 與 disposal；UI 不取得 acquisition/lifecycle ownership。

| Entry | Initial source | Subsequent explicit Refresh |
| --- | --- | --- |
| MCP `mcp-camera.html` | `open_printer_camera` 的 host-delivered result；不另讀 frame | 既有 service 呼叫 `get_u1_camera_frame` |
| Dashboard `svelte-live-camera.html` | 既有 service 主動 request frame | 同一既有 service 路徑 |

所以新 MCP artifact 與 dashboard artifact 不宣稱 byte-identical；兩份
deterministic builds 的 entry policy 不同，presentation 與 Camera service
仍共用。這項調整修正 initial acquisition 契約，不擴大工具或網路 authority。

既有 frame、activation、session/SDP metadata 留在 component-private `_meta`。
Media 只進入既有必要的 decode/display 路徑；activation capability、session ID
與 SDP 不寫入 visible text、presentation attributes、storage 或 diagnostics。
Model-visible output 保留既有 schema，不加入 media 或 signaling payload。
`_meta` 不是 authorization；後端既有檢查與有界 frame/signaling contracts 保留。
見 [OpenAI tool result reference](https://developers.openai.com/plugins/reference)。

## Tradeoffs and consequences

採用 generic resource 的薄 adapter 需要覆蓋九種 view 的 lifecycle 與 CSS
隔離，但保留使用者原本「顯示 U1 Heads」的 tool workflow。新增 Heads tool
雖可避免拆接 legacy renderer，卻增加兩個可選入口與長期 routing 負擔；
這次不採用。未來可逐一擴充 closed renderer registry，不必新增同義 tool。

Legacy aliases 及八種 legacy presentations 繼續存在，所以 X05 全面退休仍未
完成。維持所有55 ledger IDs、Progress no-action、F07 reactive class 討論、
原 loading policy 與 separate c6 checkpoint。C08 Live connectivity 及 Screen
Sharing 仍暫停；這項 resource cutover 不是它們的 repair 或實際 Live 驗收。
0042 的 byte-cap removal 不變；production minification、size reporting、
integrity、determinism、security、consumer guards 與 shipping guards 全部保留。

## Validation and delivery boundary

1. Protocol fixtures 驗證 HTTP/stdio 的 advertised URI、resource MIME/content、
   schema 與 private metadata separation；用 synthetic stores，不讀實際 printer。
   比對所有舊 aliases 的原始 HTML identity，並覆蓋新 resource 的九種 view。
2. Browser fixtures 從真正 `resources/read` 回傳 HTML 掛載 widget，覆蓋 standard
   bridge 與 compatibility initial data、input/result 亂序、錯誤 view、重播、
   timeout、pending request teardown、Refresh single-flight 與 recovery。
   任一時刻只有一個 host calling transport；closed widget 不處理 late results。
   Legacy scope 另驗證 CSS tokens、shadow focus、outer height/resize 與 Bed
   WebGL disposal，不能因為 Heads 遷移而破壞其他八種 view。
3. Heads 在320/390/590/720寬度及200%文字下保留完整 hex、swatch、borderless
   Copy 的44px target；驗證 Copy 成功/拒絕與 Refresh 後舊 Copy 的失效。
   Initial/failed Refresh 是靜態 neutral skeleton，footer status 鄰接 Refresh，
   無舊 telemetry/ARIA/title 洩漏或非必要高度跳動。
4. Camera 使用 synthetic media 覆蓋 Snapshot/Live/Auto Switch、44px/132px
   geometry、fallback 真實模式、private metadata、lease cleanup 及 late offer。
   MCP opening tool 只取得一次 initial frame，mount 不再呼叫 frame tool；
   覆蓋 initial delivery 的成功、missing、malformed、重播、timeout 與 teardown，
   並驗證 explicit Refresh 可恢復。Dashboard request bootstrap 另保留 consumer
   coverage。兩份 artifact 各自核對 deterministic bytes 與實際 resource binding。
   保留 decoded-frame 與 observed-time/FPS 證據邊界，不拿 mocks 宣稱實際 Live。
5. 單一 owner 完成 required frozen-candidate validation，另有 exact independent
   review；依 u1-ship merge/deploy，明確 restart BOTH services，再核對實際
   served resources 與 scoped synthetic widget behavior。Source、protocol fixture、
   deployed service、actual host/phone 與 real-printer 證據分開記錄。

部署不會自動替換已掛載卡片或 host-retained metadata。Developer-mode MCP
connection 需在部署後 Refresh metadata 並開新 conversation；published plugin
使用 reviewed metadata snapshot，更新路徑另有 scan/review/publish。
這是 [OpenAI connection guidance](https://developers.openai.com/plugins/deploy/connect-chatgpt)
描述的不同階段。本次不代替使用者修改 auth、重新安裝 plugin 或 publishing；
實際 phone host 取得新版與完成互動之前，紀錄必須保持 actual-host acceptance
pending，不能只憑 dashboard、resource hash 或 fixture 宣稱已完成。
