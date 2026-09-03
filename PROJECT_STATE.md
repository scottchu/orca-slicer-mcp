# Project state

## Current work: edge-to-edge Camera, Auto/Live and safe failure overlay

The user-approved Camera candidate removes the footer and Refresh button. Keep a
thin icon/title/state/FPS/time header; media fills the whole lower edge, with
square top corners and bottom corners clipped by the outer card. A persistent
short safe failure reason overlays the media at bottom left; controls remain at
bottom right. At narrow widths the reason moves one row up inside the media,
without collision or card-height change. Decision0046 supersedes Camera's
0041 footer placement only; other widget footer/error rules remain unchanged.

Default Auto uses only Auto/Live in the 88px-by-44px icon Switch. Automatic polls
emit no success feedback or announcements. New mounts never restore/start Live;
the same mounted card resumes its explicit mode after hide/show. Valid MCP
opening-result hydration makes no extra initial read, then schedules Auto 1.5s
after completion. Missing delivery waits at most 15s; a recognizable Camera
malformed delivery or host opening-result `isError: true` enters neutral error
immediately, followed by Auto retry after 1.5s. That error flag needs no Camera
fields; unrelated/unknown non-error deliveries preserve the bounded wait.
CAM-008 defines the Camera discriminators.

On `codex/u1-camera-failure-stage` from `06e2a90`, service-owned sanitized
lastLiveFailure persists through Auto; only its safe reason is visible in the
media overlay. Timeouts/watchdogs stay unchanged. This improves diagnosability
and presentation, without proving the phone failure's cause. The earlier footer/
reserved-header proposals are superseded. Planned Camera v13/observation v17 and
old-alias preservation await final shared-component build evidence.

Source validation, exact independent review and deployment remain pending;
PR101 stays deployed. Preserve all 55 IDs, attempts 1–12 and the phone failure/
success/failure sequence; C08 reliability is unresolved. Screen Sharing stays paused.

## Current workflow slice: standalone asynchronous monitor

[PR102](https://github.com/scottchu/orca-slicer-mcp/pull/102) carries independently
reviewed source for decision0045/MON-001; consult the PR for merge identity.
Independent review approved `3ce5a8cf2975c2c38601ce9832fa49bc50900893`, including
the decision-index repair. The existing monitor is independently invocable and
composed after observed printing, with one delegated owner and explicit run,
recovery and terminal-evidence boundaries.

Two skill validators, diff/identity checks and manual fictional lifecycle
walkthroughs pass. These are instruction/source evidence, not model execution,
real-printer, actual-device or durable notification tests. The branch incorporates incoming main `06e2a903f9ad2426f3580e77e72d65d98cc96d60`
without modifying its application tree `ffc95dccafab2289959a934cc2630339cf5a2d2e`.
This workflow adds no installation or service changes. VALIDATION separates retained
skill evidence from incoming Camera application evidence; our checks do not
validate those incoming application changes. O1/O2 and earlier product gaps remain open. Repository agents can use the
maintained source workflow; installed-plugin adoption and proposed standardized
one-shot observation tools remain separate work, without implied installation,
runtime changes or printer authority.

## Current deployment: PR101 Camera open/cleanup repair

PR101 `0710b4bf55edc6908eef614df5fec48614044497` is deployed after exact
`42cdaca` independent approval and BOTH service restarts. Live open now waits
40 s; only that HostRpc call retains a result for 55 s, with disposal bounded
at 70 s. Other deadlines remain unchanged. Current resources are observation
v16/Camera v12, runtime 0.4.10/schema 14; all 28 prior URI bytes are preserved.

Required validation, independent targeted checks and installed-resource
postdeployment behavior with synthetic media pass; full identities and prior failures are in
VALIDATION. After PR101 the user first reported the same failure, then reported
Live connected after a couple of retries, then failed again after about 10 s.
The success screenshot shows the new compact Switch and Live/30 FPS. Reliability
is unresolved; neither the exact resource URI nor failure phase is confirmed.
C08 remains open. The
deadline defect and isolated attempt 10 do not prove the phone failure's cause. Screen Sharing stays paused; all 55 IDs and remaining
product scope stay open as recorded. This docs-only tail needs no redeployment.

## Earlier deployment: PR99 MCP Camera and Heads

PR99 merged as `4787c02fd8f7ed8833e15d9127e7b9c78e9128ba` and is deployed after
exact independent approval of `f782378`. Camera v11 now serves shared Svelte
Camera through `mcp-camera.html`; observation v15 serves shared Svelte Heads
and retains the other eight renderers. All 26 old resource aliases remain.

Required local and browser gates pass; guarded shipping restarted BOTH services
and verified health, integrity and preservation. Postdeployment scoped behavior
verification passes on installed resources with synthetic host data. Detailed identities, commands and earlier failed
attempts remain in VALIDATION. Actual ChatGPT phone/OAuth/clipboard acceptance
and real Camera Live are not established by this release.

Keep all 55 ledger IDs, unfinished Queue/Fans/Job History product work, Progress
no-action, F07 reactive-class discussion, separate c6 and unchanged loading
policy. At PR99 deployment C08 and Screen Sharing were paused; the user's Bun Local Network
allow report had no confirmed machine or retest at that checkpoint; see the
current isolated probe above. This Markdown-only rollout
record preserves application bytes and needs no redeployment under0028.

## Earlier deployment: PR97 native observation pages

PR97 merged as `aa85f4d3cd253f5177de8304ae5fb2ed7d5739e9`, preserving independently
approved350fb6e. Fans, Thermals, Heads and Queue now use native Kit pages at the
existing URLs, without iframes or new domain behavior. Other dashboard/Lab
renderers and unfinished product requirements remain in the delivery ledger.

The required gate passes574 UI,325 server/3951 assertions, eight packages and
34+27 Python tests. Seven formal-payload browser cases are retained by unchanged
application/payload hashes. Guarded shipping explicitly restarted BOTH services:
loaded/healthy/integrity,73 static/75 security checks and preservation pass, with
no rollback. Independent postverification passes all four320px native pages:
exact HTTPS assets, neutral failed-refresh geometry/footer, recovery and Heads
keyboard Copy with synthetic responses. No real printer or user clipboard access.
Detailed commands/hashes and all prior failures remain in VALIDATION, including
77f023e imports,29e4f07 fixture/build differences and the rejected stale output.

C08 and Screen Sharing stay paused until the user returns home; no Camera service
repair, real Live, physical-printer, BFCache or actual-device acceptance is claimed.
Keep all55 IDs, Progress no-action, F07 reactive-class discussion, separate c6 and
unchanged loading policy. The MCP Camera/Heads cutover above is the active next
slice; at-home Local Network inspection remains C08's external step. PR97's
Markdown-only rollout record required no additional deployment under0028.

### Retained PR95 source/deployment evidence

PR95 is merged as `44d4266634bbe2d102a056332726550cbfe068e8`, preserving independently
approved `fd642a5987bb8e35c9d5c272c73e4dce26ec882a` and tree
`a132ed2e12e77fd023a30e671cd1450f6870fed4`. The generic Switch now visibly matches
Button's44px action size, with a40px thumb/2px inset; Camera remains132px wide and
Bed88px. Only three consumer packages changed; the other12 public HTML files,
Camera lifecycle, dependencies and runtime are unchanged.

Required regression passes574 UI,322 server/3756 assertions, eight deterministic
packages and34+26 Python tests. Independent targeted browser evidence covers35
distinct cases (33 affected plus two fresh); the first34-pass/one-fixture-failure
run and single-case renewal are preserved. Another89 unaffected cases are retained
by input hashes; this is not a new323-case full browser run.

Guarded release `20260902-44d4266-pr95-20260902T155815-e97e1c` explicitly restarted
BOTH services and verified loaded/healthy/integral status,59 static/61 security
checks and preservation, with no rollback. Independent postverification passes
three320px consumer cases using exact HTTPS assets and synthetic data: Camera,
Camera Lab and Bed Lab retain44px geometry, loading/ready bounds and keyboard
behavior. No actual printer or Live acquisition was performed in this verification.

C08 remains unresolved: nine bounded attempts locate current Bun1.4 printer ICE
UDP sends failing with `EHOSTUNREACH`, while the same adapter under immutable1.3
reaches upstream RTP/offer. External STUN, local UDP and authenticated wire-byte
comparisons pass. Neither a Bun defect nor macOS Local Network denial is proved;
no Camera service repair was made. Actual probes have stopped.

The user has paused remote desktop diagnosis until returning home. Existing
client/server logs identify RSA-SRP failure; the user reports that interactive
local Directory verification accepted the same input. This does not identify the
Screen Sharing failure's cause. No Screen Sharing restart was executed by agents.
At-home inspection remains the next C08 external step; no further auth attempts,
settings changes or Camera probes are part of the native-page slice.

Preserve compact icon modes, footer errors, service-owned Camera lifecycle and
unchanged loading policy. All55 IDs, Progress no-action, F07 class discussion,
separate c6 and native-renderer/product backlog remain. The completed PR95
records-only tail retained application bytes without another deployment under0028.

## Earlier deployed baseline: PR93 single-app Kit integration

PR93 merged as `60cab96747775fd5715b4c626f99726e68b3d85c`, preserving independently
approved `7a0d398c1652d1a7ae8aede8bf952f27bb3636cd` and tree
`d8a34948e29a4b93b62125d4aef0100a1ddd9f04`. Required regression passes574 UI,
322 server/3756 assertions, eight deterministic packages and34+26 Python tests.
Browser coverage is321 retained cases plus two renewed actual Kit Fans cases,
not another323-case full run. The rejected976 run and its repairs remain in VALIDATION.

Decision0043's one app root, `src/components/common`, pure TypeScript `src/lib`,
private `lib/server` and actual `src/routes` are deployed under Bun1.4.0 and
adapter-node5.5.7. Only Fans is a native prerendered/hydrated Kit page; other
UI routes serve packaged HTML/iframe through Kit endpoints. There is no old
custom HTTP-router fallback. Widgets and MCP stdio share application services.
Native close events retain generic request lease ownership without polling;
MCP body parity and128KiB endpoint limits remain. Outer/nested build commands
and Kit's guarded environment directory isolate build inputs.

Guarded release `20260902-60cab96-pr93-20260902T142032-7f9bba` passed exact stage,
mandatory local/bundle/codesign gates and preservation. BOTH services explicitly
restarted, loaded, healthy and integrity-verified;59 static/61 security checks pass,
with no rollback. Independent scoped served-UI verification passes five cases:
Kit Fans320/720, Heads, Camera and Camera Lab, using exact HTTPS assets and
synthetic tool/media data. No actual printer or real Live acquisition was performed.

Remaining native-renderer/product work stays in the ledger behind the active
C08 connectivity diagnosis and repair.
All55 ledger IDs remain: Progress is no action, F07 reactive class is discussion,
c6 remains separate, and no actual-device/printer acceptance is inferred. Byte
caps stay removed; integrity/security/determinism and shipping guards remain.
The completed PR93 records-only tail required no extra application deployment
under0028; the current code repair must pass its own required release gates.

### Earlier source checkpoint before decision0042

The latest user correction is active on `codex/u1-camera-icon-overlay`, based on
`431b5d40a761919d638a35e2950874e3a5a29519`: reuse the existing animated
`IconSegmentedControl` behavior, consolidated as generic `Switch`, for
Snapshot/Live/Auto as a compact icon-only overlay
inside the Camera image's bottom-right corner. Labels appear only in tooltip/aria;
this supersedes the visible text/full-width mode control placement. Preserve44px
targets, keyboard/focus, reduced motion and separation from fullscreen controls.
Acquisition-error text stays beside footer Refresh. Camera service/mode/Auto
fallback and read-only lifecycle semantics remain unchanged.

The user also adopted `src/lib/common/*` for all shared UI primitives, with generic
names: Button, Icon, Switch. Props/variants express visual/content differences;
domain compositions and domain icon mappings stay outside common. Consolidate
IconButton/QuietIconButton into Button and IconGlyph/BorderedIcon into Icon variants
without changing domain behavior or semantic tokens. Common/Button/Icon/Switch
source migration is implemented, but not accepted or deployed. Shared migration affects all eight
packages and requires consumer coverage under one full-regression owner.

Author `bun run check` passes0errors/0warnings and AST; one390px synthetic Camera
modes case passes, with an initial error screenshot matching the compact overlay.
Camera Lab remains blocked by its unchanged80000-byte guard:83901 initially,
83446 after focused Switch/Icon simplification. Initial Live94479 fits100000.
A preliminary source-derived UI/UX P1 found local-fullscreen tab trapping includes
unselected radios; its focused repair is in progress. A LabControls size experiment
saved no bytes and was fully reverted. No full/independent acceptance is claimed.

Read-only architecture review found no wrong graph dependency and no identified
bounded simplification that recovers the remaining3446bytes while preserving the
requirements; this is not proof that fitting is impossible. Next finish the focus
repair and obtain all eight final package measurements/focused evidence before
checkpointing. Any cap change needs a separate explicit user decision; no new cap
is proposed from these interim sizes. Then renew consumer geometry/interaction/
package checks, then required full validation, independent exact review and guarded
delivery. No new acceptance or deployment yet; PR89 below remains deployed and
C08's intermittent unclassified acquisition risk remains open. All55 ledger IDs,
Progress no-action, F07 reactive-class discussion, c6 separation and repo caps remain.

## Deployed baseline: PR89 scoped verification and open Camera risk

PR89 merged as `f0d7c178e59e72a9d1ed6324577d2e131ffb0f91`, preserving independently
reviewed `ce065866c61eba159075da9d3bcbf642e9bd404d` and tree
`a96e57fab0a5289d30ce406c68d3d6023e049d3d`. Decision0041's static neutral
acquisition-error skeletons/footer status, Heads balanced Copy inset, and
service-owned Snapshot/Live/Auto with the two scoped Live repairs are deployed.
The guarded receipt confirms BOTH services explicitly restarted, loaded, healthy
and integrity-verified;31 static/32 security checks and preservation passed,
with no rollback. Independent postverification passes15 manifest files,31 local
routes, six merged public assets and eight HTTPS served-widget fixture cases.
Actual HTTPS Live succeeded twice, with advancing decoded frames for17.100s and
17.102s after first samples; one earlier acquisition failed for an unclassified
reason. Auto acquired new snapshots and Snapshot stayed quiet for4.5s. C08 remains
open; these successes do not establish reliability on every attempt.

Independent exact-source validation passed559 UI,304 app/3656assertions, eight
deterministic packages,21 lifecycle and24 shipping tests. Browser evidence is317
covered cases via256 retained+61 renewed, plus four controller/seven Camera
adversaries with input bindings, not one317-case full run. VALIDATION preserves
earlier failures and distinct source/ship/post evidence. No phone, native clipboard/
PiP, physical print or broader printer-control acceptance is claimed.

This branch updates only five rollout records from exact merged f0d7c17; under
decision0028 unchanged application bytes require no repeat build or deployment.
Next diagnose C08's preserved intermittent acquisition failure and continue only
authorized backlog work; no further app deployment belongs to this records tail.
Preserve all55 ledger IDs and open migrations, Progress P01/P02/P03, F07 reactive
class discussion, separate c6 checkpoint and unchanged repo byte caps.

## Historical: 092f84a test-contract repair ready for a new candidate

`092f84a9d5f0b3e282eaa4a30304e9c86cb0e132` has independent exact source approval,
but its required gate stopped at301 app passes/3 obsolete assertions after559 UI,
eight packages and app TypeScript passed; Python gates were not reached. The author
renewed only `app.test.ts`'s two legacy hash pins and adjacent footer-status
contract:29PASS/281assertions, with374 other tracked app files byte-identical.
Freeze this test-only repair and records, then renew the full required gate and
exact review. PR87 remains deployed;55 ledger IDs, Progress no-action and the
unimplemented reactive-class discussion remain unchanged. See VALIDATION.

## Historical: minimal TypeScript repair and f0c5e41 gate

Exact candidate `f0c5e41be0ea6b01549717abe73ab8e0951cc4ec`, tree
`9a6c8cbbcc699b7f06bd6613ef0a2efd4e7173b8`, has independent source-review
APPROVE with no findings, as reported by the coordinator. The earlier P1/P2
repairs are accepted by that source review. Required validation is incomplete:
compiler/AST,559 UI tests and five focused/three Lab deterministic package checks
passed, then app TypeScript failed. App tests and Python lifecycle/shipping gates
did not run. Missing installed app `three`/`@types/three` and a type-only Camera
`./session` import missing NodeNext's `.js` suffix are separate causes.

Independent verification passed61 targeted browser and four fresh controller
adversaries. Its per-case retention record supports256 prior passes plus61 renewed
cases (317 covered, not one317-test full run). Seven earlier independent Camera
cases remain scoped to69 matching Camera/media inputs. VALIDATION preserves the
failed gate, exact hashes and retention limits. Source approval is not shipping
acceptance, and does not automatically approve subsequent edits.

The author corrected only `transport.ts:1` to type-only `./session.js` and restored
eight already-locked packages. App TypeScript, one actual HTTP/host/transport
test, nine transport tests and Camera build verification pass. All eight widget
artifacts match f0c5e41 byte-for-byte; transpiled JavaScript and package/lock files
are unchanged. This is focused author evidence, not a renewed full gate.
Next freeze a new candidate, renew the full required repository gate and independent
exact review before guarded `u1-ship`. No new merge/deployment is claimed; PR87
remains deployed. All55 ledger IDs, caps and separate c6 checkpoint remain intact;
Progress remains status-only with no implementation authorization.

## Historical: focused repair after candidate e186c41 validation

Candidate `e186c41c15d65070bf51d3d756c6b6c6d9e5d9ac` was not accepted. Its
required repository run passed compiler/AST then stopped at557 UI passes and one
obsolete Bed selector; later gates did not run. Its single full browser run had
301 passes and12 failures: four Bed selectors and eight Thermals fixtures still
expected the prior error presentation. Seven independent Camera adversaries pass.
These failed-run records are preserved in VALIDATION.

The current working tree repairs two separate review findings: a successful
explicit duplicate receipt after failed Retry now restores `ready`, while a
duplicate notification preserves failure; combined legacy initial-error Retry
keeps the static failure/footer until accepted data. Bed tests distinguish local
chart feedback from phase announcements. Thermals tests distinguish successful
age-stale receipts from timeout/offline failures and verify subsequent recovery.
Focused author evidence is45 UI tests, compiler/AST, five package tests and22
unique browser cases through14 retained plus eight renewed passes. This is not a
clean full-suite pass or independent approval of the repair.

The four affected live bundles/pins are coherent: Fans91362, Thermals91973,
Heads96944, Queue92936 bytes; focused production aggregate462985. Camera and
private lab bundles retain their prior hashes;39 scoped Camera inputs match the
failed candidate exactly. Caps, dependencies and shipping guards are unchanged.
Next: freeze a new candidate, obtain independent repair review/verification, run
the full required repository gate with its assigned owner, then complete guarded
`u1-ship`. PR87 remains deployed; no new merge/deployment or device acceptance is
claimed. Preserve all delivery-ledger requirements and the separate c6 checkpoint.

## Historical: resumed footer/skeleton checkpoint

The user resumed branch `codex/u1-footer-error-skeletons` at saved remote
checkpoint `f9fe1eb0d5455b4a30937954b4ae8ff4e4b8d05c`, based on accepted
`80280568589fb8cd2df7f8ab30c2f1faddcb3769`. The coordinator verified the current
checkout was clean and fetched/checked out that exact branch. The prior worktree
is archived and unregistered according to the user; no new cleanup is requested.
Preserve existing modifications, other worktrees and private evidence. The
earlier pack-up stop is superseded by this implementation request. This is an
unvalidated WIP checkpoint, not an approved, merged or deployable candidate.
Read the current section of
[HANDOFF](docs/iterations/2026-08-23-f0-dual-subsystem-foundation/HANDOFF.md)
for the exact changed-path groups, remaining work and next smallest check;
[VALIDATION](docs/iterations/2026-08-23-f0-dual-subsystem-foundation/VALIDATION.md)
records only commands actually completed.

Current UI request: all acquisition failures show static neutral skeletons and
persistent footer status beside Refresh, not stale telemetry or floating error
overlays; Heads Copy keeps balanced hover inset and one inline color group.
Phase1 now has attributed focused Svelte evidence: compiler/AST,158 unit cases,
12 package tests and49 unique browser cases through retained+renewed runs, not a
clean full-suite pass. Direct callers, Queue short/long allocation, font/width
resize and Bed retained renderer/focus were repaired; full evidence is in
VALIDATION. Source preflight identified four findings subsequently repaired with
focused renewal; this is not independent approval of an exact frozen candidate.
The working candidate remains uncommitted. Phase2 now repairs two observed Live
failures: raw Dashboard acknowledgements rejected by an MCP-only parser, then a
10-second mDNS candidate timeout closing already-connected, fresh video. The
acknowledgement-only compatibility adapter preserves strict frame/open envelopes;
the typed candidate-timeout exception requires the same live epoch/session,
observed connected state and a frame received less than 5 seconds ago. Invalid
acknowledgements and all existing deadlines remain unchanged. Fixed Snapshot /
Live / Auto modes are service-owned; Auto repeatedly reads snapshots and is
selected automatically after Live failure. Components subscribe/render.

Attributed phase2 evidence is 55 service tests, with 52 retained and 5 renewed
synthetic tests after the final synthetic service change, plus one actual
HTTP-handler/host/transport integration test. This is 57 covered cases, not one
57-test run. A bounded actual-camera check substituted a 91,063-byte candidate UI
into an isolated browser using the unchanged deployed host/backend: it remained
Live at 20.4s with 444 decoded frames at 1920x1080, beyond the slow candidate
deadline. This is mixed candidate/deployed-service evidence, not a new deployment,
exact final-renderer acceptance or phone acceptance. Earlier failed traces are
retained in VALIDATION. Legacy/Camera phase1 evidence remains scoped there.

Renderer author now reports 3 UI, 23+2 targeted browser and 12 package tests
(138 assertions), compiler/AST and package checks passing on source-frozen bytes.
Camera Lab79375/80000 and Live89770/100000 fit unchanged caps; private aggregate
928543 and focused production aggregate462929. Next: record the frozen candidate
commit and assign one full-regression owner, obtain
separate independent review/verification, and complete guarded `u1-ship` delivery.
Widget byte caps are unchanged repository guards, not asserted OpenAI limits.
The unrelated Camera
`c6cfb4e` checkpoint remains separate, source-only and blocked. PR87 below remains
the deployed application; the following older current headings are historical.

The latest Progress question requested status only; P01/P02 remain not started
and P03 decision pending. All 55 delivery-ledger IDs remain accounted for.

PR87 observation stable error anatomy and inline Heads quiet Copy are deployed.
Camera remains separately blocked; Progress redesign is still unfinished.
The complete current route/evidence matrix is
[Widget delivery ledger](docs/widget-delivery.md).
PR87 merged as `96e466e2ffefd75dc0b2c1fce92b40c7ec30555d`, preserving the
independently approved tree `37a232ad86069584b4ec32562d603e5c0d577530`.
The coordinator's guarded receipt confirms BOTH services explicitly restarted,
loaded and healthy/integrity-verified;31 static and32 security checks pass,
preservation passes and rollback was not needed. Independent postverification
passes15 scoped downloaded-byte browser cases and exact service/asset checks.
The pre-existing public-root routing limitation remains open in the ledger;
this does not establish actual-phone, native clipboard or printer acceptance.
Source/test evidence and the263 retained plus9 renewed browser split remain
in VALIDATION, including the38 independent cases and artifact-loss limits.
Camera `c6cfb4e` remains source-only and blocked at81,989/80,000 bytes.
PR86 merged as `8b995ee`; its thumbnail policy remains binding.
This rollout-record change is documentation only: no additional application
build, browser suite, deployment or service restart under decision0028.
After independent review/merge of these records, continue the open ledger
without declaring Camera, Progress or all migrations complete.
Older sections below are historical, not current completion claims.

## Current: required print-thumbnail policy reviewed; PR86 delivery

The latest user priority adds decision 0040's required embedded-thumbnail gate
to AGENTS, PREP-007/HANDOFF-007 and maintained preparation knowledge. Local
decoded image content and exact plate/layout correspondence must be verified
and bound to the final artifact hash before prepared acceptance or upload;
target-parsed thumbnail metadata must be verified after upload before start.
This applies to current unstarted jobs. Thumbnail settings alone are
insufficient, and missing or unverified evidence blocks the corresponding gate.

The source/manual agent workflow policy at `d08c88d8` has independent approval
with no findings. [PR86](https://github.com/scottchu/orca-slicer-mcp/pull/86)
is open for delivery; this continuity tail needs final identity binding and
merge verification. Application/build inputs, plugin skills and deployed
services are unchanged; automated enforcement, geometry, printability and physical display
acceptance are not claimed. VALIDATION records the documentation-only checks.
After delivery is verified, resume the prior widget order below. Heads PR84/Bed
PR83 retain their existing evidence, while Camera retry, all-widget error work, Bed layout,
fixed Lab dock, Current Job PR79, other migrations, Console/progress-thumbnail/
widget-size features and recoverable cleanup remain unfinished.

## Previous delivered widget checkpoint

## Current: Heads Copy PR84 deployed and independently verified

PR84 merged as `0fe54f34e43f97dd9376e5a17b06efd342726455`, with the
independently approved tree `62af16d2dcc17bcf3c25e93c8fb7c4776a11c8db`.
The coordinator's guarded delivery receipt confirms BOTH existing services were
explicitly restarted, loaded and healthy/integrity-verified;31 static and32
security checks passed, preservation passed and no rollback occurred.
Independent postverification passed: 15 manifest hashes, nine HTTPS routes
(eight exact widget assets and Heads host), and 15 downloaded-CSP synthetic
behavior cases. Wide-RGBA transitions at 567/590/720px with 200% text remain
0px; whole hex, right-side 44px Copy and shared consumers passed.

The delivered Heads layout keeps44px Copy on the right, exact whole RGB/RGBA,
and public-width-driven loading/ready wrap. Source evidence remains44 focused,
514UI,300app/3557 assertions,21 lifecycle/24 shipping and248 browser PASS.
Separate independent36 targeted cases plus four packaged-consumer checks pass;
previous567/590/720 enlarged wide-RGBA transitions are0px. Failed first-candidate
evidence and the unchanged1px gate are preserved in VALIDATION.
This does not prove actual-phone typography, native OS focus or printer behavior.

Heads96660 and lightLab209516 are the only changed widget packages; six others,
all dependency/configuration/security/shipping inputs and caps are unchanged.
Camera Lab79776 still has224bytes headroom. Bed PR83 remains accepted prior work.

Next: integrate source-approved Camera retry checkpoint
`1c6920ef49804cdec789df33e3be0221fdecc887` with accepted main, renew actual
consumer packages/tests and obtain independent exact acceptance before release.
That checkpoint is not integrated, rebuilt or deployed; current Camera assets
must not be mistaken for its acceptance. Remaining all-widget error rollout,
Bed grid/legend/summary work, fixed Lab dock, Current Job PR79, other migrations,
Console/progress-thumbnail/widget-size features and recoverable cleanup stay open.
This six-record rollout update changes documentation only; decision0028 requires
no repeat build/browser suite, deployment or additional service restart.

## Earlier Bed candidate handoff (superseded where noted above)

Frozen application `1da084822fde1430c47aa58e332e50e453dbffad`, tree
`5ed792d20873e254067997d3c236147ca6b62294`, ordinarily integrates accepted
Heads/main `55078ea215768094bf1897b516726e2e4aa05bd8` via `d139091`.
Bed Lab now keeps initial-error structure and retained-error data/renderer/
receipt. Adopted independent UI/UX policy moves successful 2D Retry focus to
the selected 2D radio only while the current retry owns active-document focus;
Reset stays native-disabled. 3D keeps Reset focus. Blur, user focus movement,
mode/phase changes, cancellation and unmount prevent late focus recovery.
Shared leaf focus APIs own no connection/retry logic; ADR0038 records the policy.

Author gates on these frozen bytes pass: 21 focused Bed browser cases; the
single full browser run 235/235; required repository gate 504 UI, 300 app/
3,557 assertions, 21 lifecycle and 24 shipping tests; eight deterministic
packages and runtime bundles/signature/help. Independent targeted validation
reports 14 browser cases plus six fresh delayed-policy adversaries PASS.
Exact final-head source review/verification, PR and guarded deployment remain
pending. No Bed service, phone, real-printer or user-outcome acceptance.

All eight packages changed through shared leaf APIs; Lab sizes are
207630/632808/79776, total920214, within unchanged caps. Camera Lab has only
224 bytes headroom; later integration must remeasure, not raise its cap.
Owned browser/fixture sessions are closed and4179 is free. Existing Bed
320px/200% summary crowding and grid/legend redesign are outside this slice.

Coordinator-attributed Heads PR81 final postverification passed BOTH services,
15 manifest hashes, 11 HTTPS routes/eight unique assets and14 browser cases;
this does not accept Bed. Next order: finish Bed exact-candidate delivery,
then the newly reported mobile Heads color swatch/hex/Copy wrapping repair
with focused layout regression, then source-approved but unshipped Camera
retry checkpoint `1c6920e`. Keep Camera's old packaged assets distinct.
Other widget error rollouts, fixed Lab dock, PR79, migrations/features and
recoverable cleanup remain open; do not fold them into this frozen candidate.

## Earlier checkpoints (superseded where noted above)

## Current: Bed Lab error-frame source checkpoint; integration pending

Application `464d3e73d427e648a6b4c75be625eeaa49beaee9` from accepted
`4e869d8` implements ADR0038 for Bed Lab only. Compiler/AST, focused88 UI,
focused26 browser plus four unchanged-chart browser cases,19 app tests and
repeated three-Lab packaging pass. Only Bed Lab asset changes (631250 bytes);
all five production and other two Lab assets remain byte-identical.
Wait for accepted Heads PR81, integrate ordinary main, renew affected checks,
then assign one owner to the full frozen-candidate gates. Independent source
review/verification, PR, deployment and meaningful served behavior are pending.
Other nine widgets and production error rollout, Camera68259ead, fixed Lab
dock, unfinished migrations/features and recoverable cleanup remain open.

## Earlier implementation scope

From accepted4e869d8, implement decision0038's controlled shared presentation
foundation in Bed Lab only. Preserve chart/header/footer structure through
initial loading/error/retry; retain known renderer/data/receipt on refresh
failure. No whole-widget height guess, private skeleton template, cap increase,
production acquisition, printer action or release is part of implementation.
Source/unit/targeted browser and transitive packages precede frozen-candidate
independent acceptance. Heads repair, Camera68259ead, remaining widget error
rollout, fixed Lab dock and all earlier migration/feature tracks stay separate.

## Accepted-main history (superseded by the current Bed integration)

## Current: resume Heads delivery after accepted project-role integration

Accepted main `707a018a3e3c64b885bc1ece13f2795ae2bb546d` (PR82) is ordinarily
integrated as `b1c9a8c` into PR81, preserving both histories and all six Heads
repair records. PR82's four project roles passed independent static review and
were merged; native named-role loading remains unverified. No service restart
was needed for that configuration/docs-only change.

Current order: final exact Heads test/config/identity acceptance and guarded
delivery; then Bed Lab stable-error checkpoint `c0323a4`; then Camera `4eb3106`
explicit same-live-scenario retry repair and remaining validation. Neither
checkpoint is released. All other WIDGET_TRACKS remain open. The merged role
configuration and its new focused test do not change widget application inputs;
retained 214-browser evidence requires explicit final-head identity binding.
Author renewal passes 29 focused UI tests, three project-role checks, the exact
14-path delta allowlist and all eight asset identities. Final independent
acceptance and guarded delivery remain pending; no service/printer claim.

## Earlier Heads repair checkpoint

## Current: Heads PR81 shipping-gate test repair

The first guarded shipment stopped at local validation; PR81 was not merged or
installed and no services restarted. The inherited loading test rejected the
deliberately hidden public `Generic PLA` skeleton. Test-only checkpoint
`1e2e387d8cbbada99a23dfa01ad9b94265834f8d` (tree
`94f127adb482d90586d851b85d86b5bda08ec844`) admits only exact public,
noninteractive Heads material skeleton leaves; private, visible, accessible and
non-Heads telemetry guards remain. Independent source review and 29 targeted
tests pass. The final required repository gate passes: 483 UI, 300 app/3,557
assertions, 21 lifecycle, 24 shipping tests and all eight exact packages.

Runtime, assets, dependencies, configuration, browser inputs and shipping guards
remain identical to frozen app `c9d69cb`; its 214/214 browser evidence is retained
for independent identity-bound reuse, not rerun. The final records tail and PR
head still need independent identity confirmation before the coordinator retries
guarded delivery. All unfinished tracks below remain open.

## Current: Heads material icon — frozen author candidate

Application source `c9d69cb894ad1d28278fb1e56b6b9617c11af5f9`, tree
`3cca582bad7e2ff9d21b5f77f34fdc96aedcf266`, from accepted PR80 main
`4e869d8`. The shared Spool icon sits beside one continuous, naturally wrapping
material string in both Lab and Live. Earlier split-word Lab markup caused the
reported gap; current mapping was already joined and is not rewritten.

Independent design's public loading-only `nominal | empty` shapes preserve
closed Lab fixtures without using resolved observations or private text. Live
root keeps its default public template. Exact arbitrary private-length loading
parity is not claimed. Focused 39 browser cases, final 56 affected UI tests,
compiler/AST and 12 package tests/138 assertions pass. The required full candidate
browser run passes 214/214; independent acceptance and guarded PR delivery remain
pending. Earlier 16/18 and 201/206 failures are retained, not waived.

Heads is 94,264 bytes; light/Bed/Camera labs are 207,111/638,718/79,257
(925,086 total), within unchanged caps. Spool adds 462 Camera bytes: PR79's
separate 318-byte headroom needs a real integration measurement before shipping;
no cap rise or unreviewed optimization is authorized. No service or printer
acceptance is claimed.

Current Job PR79 `48f2060` remains separate. Independent deployed-Lab UIUX and
printer-information audits are complete as recommendations, not implementation.
Preserved priorities: fixed bottom Lab controls, shared loading/error frames,
Camera three-slot states/lifecycle, atomic spacing/actions, Progress local fill/
layer design and thumbnail feasibility, and stable Bed framing/inset summaries.
All earlier migrations, Console, filament sync, sizes, tokens and recoverable
cleanup stay open; see WIDGET_TRACKS.
## Earlier project-role candidate (merged through PR82)

## Current: project review roles — configuration candidate

The latest user priority is reusable project-scoped agents: `ui_ux_designer`,
`printer_domain_expert`, `agentic_architect` and `maker_user`. Their standalone
definitions are in `.codex/agents/`; `docs/project-agents.md` describes routing,
inheritance and the unverified native-client loading boundary. This is a bounded
F0 agent-configuration/documentation change from accepted PR80 main `4e869d8`.
No widget, application build input, service or printer is changed. Independent
review and PR merge remain pending; no runtime agent-loading acceptance is claimed.

The previous test-strategy policy is merged through PR80. Preserve the separate
unfinished widget tracks: Heads PR81 checkpoint `1e2e387` and its uncommitted
continuity tail, Camera `4eb3106` with its known same-scenario live Retry issue,
Bed error foundation `c0323a4` pending accepted-main integration, Current Job
PR79, Progress, History, Overview, real Bed and every remaining WIDGET_TRACKS
item. Those coordinator-attributed checkpoints are not accepted by this change.

## Earlier checkpoints (superseded where noted above)

## Current: repository test strategy — docs-only review pending

The latest user priority is now recorded in `AGENTS.md` under Test strategy:
impact-based focused checks, one owned full candidate run, separate independent
verification and evidence-bound docs-only tails. Existing shipping guards are
unchanged. This branch starts at accepted/deployed/postverified PR78 `177d326`;
it changes no application bytes and requires no service restart under ADR0028.
Current Job PR79 stays frozen at `48f2060` with source approval and independent
validation pending. Progress `25673dd`, History `379c1e7`, Overview `1a3b4f4`,
real Bed `194ea79` and all migration/feature/cleanup tracks remain unfinished.
This policy candidate still needs independent documentation review and PR merge.

## Earlier checkpoints (superseded where noted above)

## Current: Bed Mesh icon-toggle author candidate, exact review next

The latest additive user priority is implemented independently of pending Jobs:
application source `80229841fced7307aaf3eba850a8e60ef688c26a`, tree
`5dd9210ad01605cf4678da8a069ee8764333ef9f`, from accepted main `4828ce04`.
One reusable controlled icon segmented leaf replaces the two Bed mode buttons;
keyboard, reduced motion, inert loading and unchanged chart identity are tested.
Full author evidence passes:455 UI,300 app/3,557 assertions,21 lifecycle,24
shipping,198 Chrome, runtime/signature/help and repeated eight-package builds.
Only Bed lab changes:638,249 bytes; labs total921,919 within unchanged limits.
No source acceptance or shipment is claimed. Independent exact review and
validation precede guarded PR merge/deploy/BOTH restart/scoped verification.

PR77's prior release `20260901-4828ce0-pr77-20260901T204905-260700` is attributed
deployed/postverified: BOTH restarted,31static/32security; independent15 hashes,
13HTTPS/24raw-isolation checks and8 downloaded-byte browser cases passed.
Its accepted Bed asset was634,045 bytes/SHA5127c317…; this candidate is different.
Known 320px/200% Min/Max/Range crowding and Observed-time spacing remain unchanged,
not evidence of whole-widget polish. Real Bed composition is still pending.

Current Job `5855223` is preserved (focused49/UI500/app311/lifecycle21/shipping24
pass; full207/runtime/final determinism/PR due). Progress `b9c5008` phase-one has
independent source approval; phase-two checkpoint `b694b2c` ordinarily integrates
PR77 as `0f55b56` and has non-browser UI502/app315/lifecycle21/shipping24,
nine-package/runtime gates only. Its browser/PR/deploy/exact review remain due.
History `379c1e7` and Overview `1a3b4f4`
retain phase-two source approval only. Real Bed `194ea79`, generic MCP/legacy,
Console, model thumbnail, filament sync, size variants, token cleanup and
recoverable cleanup remain open. No plugin/routing/phone/printer acceptance.

## Earlier author and integrated baseline records

## Current: slim vertical legend author gates complete, review pending

Accepted Queue main `7882670778627128214d74bcee62fe20f5ddbf7a` is ordinarily
merged as `910355e`. Independent design replaces duplicate chart endpoint
numbers with a 6px left rail and one intrinsic Z(mm) caption; exact extrema
remain in the chart's accessible description and visible summary below.
The fixed 4:3 frame, 14px inset, true projected axes and existing fit/zoom
gates pass without waivers. Final author evidence: UI 439, app 300 (3,556
assertions), lifecycle 21, shipping 24, eight deterministic packages and
Chrome 182/182. Only the Bed lab asset changes from the accepted Queue base:
634,045 bytes; three labs total 917,715. All five production assets match.
Independent exact-source review/validation and guarded delivery remain due.
No deployment, printer or actual-device acceptance is claimed. The unchanged
three-column summary remains visually crowded at 320px/200% text and belongs
to the preserved real-Bed composition follow-up at `194ea79`.

## Historical author and integrated baseline records

## Immediate vertical Bed Mesh legend — HELD author candidate

User execution order now prioritizes a narrow vertical Z(mm) legend inside the
left chart edge, as a lab/shared-renderer slice from accepted main `ff577fcb`.
Generic HeightLegend/ChartFrame composition removes the below-chart bar;
measured legend text and the opposite true Z silhouette preserve plotting room.
All existing frame, coverage, zoom, readability and isolation gates remain.
The full-height wide-column experiment failed 320px/200% mesh coverage and is
not accepted. The narrow-rail/opposite-Z candidate passes existing coverage,
rotation and pixel-zoom checks, but the new surface/legend-box overlap check
fails at 320/390px with 200% text (849/412 colored pixels). The fixed 6ch boxes
overestimate short glyphs, so the next role must separate actual-glyph clearance
from empty label width and include surface clearance in neutral fitting.
Focused browser result is 24/26; full renewal and PR are held, not waived.
Real Bed Mesh phase two remains preserved at `194ea79`, including its pending
Queue controller and accepted Current Job compact-IconButton dependencies.
No production package, controller, service, printer, MCP or auth change belongs
to this immediate slice.

## Integrated Queue baseline records
## Current: delivered PR75, Queue author candidate ready for exact review

PR75's three-artifact private-lab split is delivered on accepted main
`ff577fcb5cf506c5a1699ad3ecf118e43afca8cd` (tree `8924189`). Attributed guarded
release `20260901-ff577fc-pr75-20260901T190836-b199a6` explicitly restarted BOTH
services: healthy/integrity verified,15 manifest hashes,30 static/31 security
checks, preservation true and no rollback; snapshot `20260901T190930-6f0cb3`
remains recoverable. Independent postdeployment checks verified actual HTTPS
three-artifact bytes/22 routes/CSP/method/isolation and downloaded-byte browser
30/30 plus wheel/reset1/1, zero runtime fetch at four widths/200% text. This is
deployed-service/synthetic evidence, not real-printer or phone acceptance.

Queue ordinarily merged that main as `a042be5`. Its strict real adapter,
zero-raw composition, exact private route and shared obsolete-success RPC repair
are frozen at application source `5c53d05ec15d76b5b5f413471a2ae8dee3326296`
(tree `155abfb5e436cf8e1cb344a6724fbc358feafc60`). Independent design's inert
public-template leaf replaces the failed estimated widths. Focused geometry24/24
and full Chrome174/174 pass with per-record<=1px bounds at four widths/200%.
UI426, app300/3,555 assertions, lifecycle21, shipping24, compiler/AST,
deterministic packages and runtime/signature/help pass. Queue is87,831 bytes;
five focused production entries total444,546; labs total913,550 within unchanged
limits. Separate exact-source review/validation and guarded shipment are still
required. No Queue shipment or final acceptance is claimed. Failure history is
preserved in VALIDATION.md. Browser4179 has been released to the separate lab
legend author; no service or printer changes occurred.

Remaining tracks stay open: Progress phase-one is held until the shared
obsolete-success fix is accepted; Overview checkpoint `136da4b` awaits independent
review; Current Job `4e50f7b` and History `379c1e7` have source approval only,
not delivered widgets. Real Bed Mesh composition, generic MCP/legacy migration,
new requested features and final recoverable cleanup are not complete.

## Historical checkpoints (superseded where noted above)

## Three-artifact private-lab split candidate — author gates complete

Accepted and deployed Heads main `5ffca666e4ffa50c761ff54460f2d7dfc3466ad5`
is ordinarily merged into the split branch. The private lab now builds exactly
three inline artifacts and maps light observation, Bed Mesh and Camera routes
to distinct source-derived hashes. Current authored sizes are 199,819,
629,880 and 78,795 raw UTF-8 bytes (908,494 aggregate). Route, graph and cap
tests pass locally. UI 335, app 296, lifecycle 21, shipping 24, repository and
full Chrome 164/164 pass, including zero runtime fetch through all lab controls.
The independently renewed 250,000-byte light cap leaves 50,181 bytes and the
980,000 aggregate leaves 71,506. This finite envelope covers Queue, Current Job,
History, Progress and Overview only; Console and thumbnails are excluded.
Exact application source is `4a6c493`; independent exact-SHA validation and
review remain required. Nothing is merged, deployed or accepted by this author
checkpoint.

## Current checkpoint: Heads candidate after delivered Bed Mesh PR73

Bed Mesh PR73 was independently accepted at source `2e9268`, merged and shipped
as `8c5756ddb4435ba94a494963556c94d15d05b6e5` (tree
`b37b7806fda5d004cb06d4d9ccb7799380d0a52f`). Attributed operator receipt:
release `20260901-8c5756d-pr73-20260901T175129-1e397e`, BOTH existing services
explicitly restarted and loaded/healthy/integrity verified; 29 static and 30
security checks PASS, preservation true, no rollback, retained snapshot
`20260901T175219-d7c334`. Attributed independent postdeployment PASS confirms
BOTH service identities,15 manifest hashes,8 exact private HTTPS assets/CSP,
20 isolation/status probes and8 browser checks on actual downloaded lab bytes
at four widths/normal200%. Wheel/pinch/reverse/reset, retained orbit/canvas,
reactive2D pixels and fixed4:3 pass;320enlarged/720normal captures were inspected.
This is deployed-service and synthetic browser evidence, not phone/printer
acceptance. Production Bed Mesh/MCP, inherited keyboard/WebGL fallback/fixed2D
font and the pre-existing unmatched-root502 remain outside accepted coverage.

Heads author source is frozen at `4d24446`: strict real DTO, generic card/color
leaves and zero-raw shared panel are implemented. Focused22 geometry cases and
the final163-case Chrome suite PASS at four widths/normal200%, including exact
<=1px skeleton bounds, Empty/N/A without Copy, retained refresh/copy/BFCache,
initial error/retry and obsolete-RPC races. The latter found and repaired a real
host omission: all three migrated focused widgets now receive initial errors.
Repository/runtime gates and six deterministic packages PASS. Heads remains an
unaccepted candidate pending exact independent source review and validation;
no Heads deployment occurred.
Decision0032 records the independently adopted finite lab budgets
756,000/80,000/836,000 and separate100,000 Heads allowance, not future automatic
growth. Client graphs, exact-source review and full combined gates remain due.

Next: exact independent Heads source review/validation and guarded shipment.
Queue → Current Job → History follow as separate bounded
migrations; Progress remains separate, real Bed Mesh adapter/shell follows its
renderer, and Overview is last. Current Job reported-null filename differs from
unreported; its lab progressPercent must never be invented from file position.
All remaining WIDGET_TRACKS stay open, including generic MCP/legacy cutover,
new requested features and final recoverable cleanup.

## Historical checkpoints (superseded where noted above)

## Current checkpoint: held Bed Mesh zoom renewal after delivered Thermals

Thermals PR72 is delivered on independently accepted merge
`6325c8792fc8cca1f1c73109aae717e774d87076`, tree
`e9b286b6be673a1d88f04bd5b227a91f40c4cb5b`. The attributed operator receipt
reports release `20260901-6325c87-pr72-20260901T172710-d336bd`, BOTH existing
services explicitly restarted, loaded/healthy/integrity verified at
runtime0.4.8/schema12/observation-v14/camera-v10,29 static/30 security checks
PASS, preservation true and no rollback. Snapshot `20260901T172800-d68cec`
is retained. Canonical main and8,689 ignored entries/recovery refs are preserved.
Camera PR71 and Fans PR70 are also delivered; older pending claims below are
historical. Independent Thermals postdeployment PASS verifies BOTH exact service
identities, 15 manifest hashes, seven private HTTPS assets with exact hashes /
no-store/CSP, 14 isolation/status probes and clean canonical main. Nine Chrome
checks on actual downloaded host/child bytes and CSP use synthetic responses:
four widths, normal/200% text, skeleton/retained refresh/time/focus, nullable and
extreme values and independent Cavity receipt. The validator inspected enlarged
320 and normal720 captures. External unmatched-root502 remains pre-existing and
unaccepted; actual printer/phone and stale installed-connector identity remain
unverified. These are attributed independent deployment/synthetic-browser facts,
not new author acquisition or device checks. No extra runtime change was made.

Bed Mesh PR73 candidate `85f89f9` is HELD despite137 passing browser cases:
independent real wheel input showed projected width452.28→448.55 instead of
the baseline461.84→628.30. Per-render frustum fitting canceled user zoom.
The accepted renewal fits at neutral1x, then applies independent bounded
0.75–3.5 detail zoom. Default/reset and all1x orbit containment gates remain
unchanged; intentional greater-than1x detail viewing may crop geometry/labels
at the fixed frame boundary. It must not silently refit the user's zoom away.
After explicit accepted-main merge `f0e25ba`, the author renewal passes 266 UI
units, 290 app tests/3,400 assertions, 21 lifecycle, 24 shipping and the full
152-case Chrome suite. All five packages are deterministic and bounded; runtime
bundles/signature/help and compiler/AST pass. Actual wheel/two-finger browser
input, pixels, identity, data/resize and reset regressions pass while every 1x
containment test remains unchanged. Observation lab is 749,560 bytes; its
440-byte reserve is not permission to raise the cap. Fresh exact independent
validation/source approval is still required before delivery.

This remains private-lab-only. Production Bed Mesh/MCP, keyboard/Home,
automatic WebGL-failure fallback and root-scaled2D labels remain open, as do
all other named WIDGET_TRACKS. No service, printer, authentication, Tailscale
or plugin action is part of this author repair.

## Historical checkpoints (superseded where noted above)

## Current checkpoint: Thermals renewal after delivered Camera PR71

Reviewed Camera main `0aa83a0f382574af1eb910d7cba61f2a28f88ace` is explicitly
integrated in this PR72 merge. Additive source/record conflicts are resolved;
renewed combined author gates PASS:256 UI,138 Chrome,290 app/3,400 assertions,
21 lifecycle and24 shipping tests, compiler/AST, five deterministic packages,
runtime bundles/signature/help. Exact independent validation/review is next;
no Thermals acceptance or deployment is claimed.
Fans PR70 and focused Camera PR71 are deployed. Thermals remains unshipped;
seven other observation cutovers, generic MCP/legacy replacement and all named
WIDGET_TRACKS remain open. Preserve existing widget-first execution order.

PR71 independently accepted `c9311eb`, merged as `0aa83a0` with tree
`af970729c41d041533d5d6f6c909a3a43d49a21b`, and shipped release
`20260901-0aa83a0-pr71-20260901T170551-59206e`. Operator reports BOTH explicitly
restarted, loaded/healthy/integrity verified at runtime0.4.8/schema12/obs14/camera10,
28 static and29 security checks passed, preservation true, no rollback needed;
snapshot `20260901T170638-b77ef9` retained. Canonical checkout/recovery refs and
8,689 ignored entries were preserved. Camera artifact89,919 bytes has SHA256
`b774fdfce6ec20a1732f2cef5cd5ec5dbbd93422810758c237eb9f7278423c10`.

Independent `live_camera_exact_validation` postdeployment PASS covers BOTH
service/plist identities,15 manifest hashes,6 exact private static routes with
no-store/CSP, and fetched-byte synthetic host/media behavior (five probes and
six hash checks). Public loopback rejects four private dashboard/lab routes.
External unmatched-root routes still return502 from an unrelated unavailable
upstream, including pre-existing widget routes: this is not a Camera-specific
regression, but external-root availability/isolation remains unaccepted. No
routing/auth changes were made. Actual phone/real-stream evidence remains
pending. The separately stale installed-plugin connection still requires
approval before reload/reinstallation; no such action occurred.


## Historical author and delivery checkpoints (superseded where noted above)

Last updated: 2026-09-01

## Baseline

- Canonical repository: `scottchu/orca-slicer-mcp` (private).
- Product boundary: Orca Preparation and Printer Operations are peer
  subsystems joined by an explicit prepared-job/print-session handoff.

## Active iteration

The bounded private-lab Bed Mesh correction explicitly integrates reviewed
Camera main `0aa83a0f382574af1eb910d7cba61f2a28f88ace`. It replaces fixed
CSS-corner labels with projected axes, a nondegenerate padded-mm grid enclosure
and persistent reactive 3D/2D renderers. The combined 137-case browser gate
passes, including four widths, 200% text, actual surface pixels, data updates,
disposal and supported orbit limits. Independent exact validation/review and
Bed Mesh delivery remain pending; production Bed Mesh and MCP are unchanged.
Decision 0032 and newest VALIDATION/HANDOFF record the current candidate.

Camera PR71 is already delivered per the operator receipt: merge `0aa83a0`,
tree `af970729c41d041533d5d6f6c909a3a43d49a21b`, release
`20260901-0aa83a0-pr71-20260901T170551-59206e`, BOTH services restarted and
health/integrity verified. This is attributed deployment evidence, not a new
author device/printer check. Earlier Camera-pending sections below are history.
Thermals and all other unfinished WIDGET_TRACKS remain separate open work.

Thermals author candidate is ready for independent exact validation/review:
228 UI tests,130 Chrome cases,285 app tests/3,356 assertions,21 lifecycle and24
ship tests pass, with compiler/AST/type gates, deterministic packaging and all
bundles/signature/help. Only the Thermals dashboard is newly selected; no new
MCP alias or production Camera cutover is included. It is not merged/deployed.
Artifacts: Thermals86,140; Fans85,654; observation lab749,112; Camera lab78,795
bytes. All individual budgets and827,907/830,000 lab aggregate pass. Before
acceptance, integrate any subsequently reviewed Camera main and renew gates;
never consume its unapproved candidate. Exact hashes/evidence are in VALIDATION.

Current bounded work: LIVE Thermals dashboard migration from reviewed Fans
merge `db1c926b3c8276e56911221a19b9b9300db53990`. Preserve independent status and
Cavity evidence, six shared rows and reviewed bridge/refresh behavior. Real
Camera continues separately; other seven observations and generic MCP remain
unmigrated. See decision0034 and LIVE_PARITY; no new feature track is opened.

PR70 is actually shipped: reviewed `dbdfc390`, merge `db1c926`, release
`20260901-db1c926-pr70-20260901T162456-cc8038`. Operator reports BOTH explicit
restarts healthy/integrity verified, 27 static/28 security checks and preservation
PASS; rollback unnecessary, snapshot `20260901T162541-5d87ef` retained. All 8,689
ignored entries/recovery refs preserved. Independent postcheck also PASS:
exact running release/source/15 manifest hashes and served bytes/CSP, plus11
real-iframe cases using fetched assets and synthetic tool replies. A separate
model-visible call returned a historical sparse placeholder from an unidentified
connector runtime; current real-data/device acceptance is not claimed and no
plugin/auth update is included. Full attributed evidence is in VALIDATION.

### Historical checkpoints (superseded current claims retained as evidence)

The following unshipped/pending PR70 and earlier-candidate paragraphs describe
their checkpoints at the time, not the current delivered state above.
### Real Camera dashboard candidate — exact review next (2026-09-01)

Reviewed Fans PR70 main `db1c926` is explicitly integrated. Its operator receipt
reports release `20260901-db1c926-pr70-20260901T162456-cc8038`, BOTH services
restarted, healthy/integrity verified,27 static/28 security checks passing.
The shared bridge is delivered; earlier Fans-pending paragraphs are historical.

The real Camera candidate now binds that bridge to strict private frame/offer
parsers, the bounded session and one persistent generic VideoSurface. Zero-raw
CameraWidget/LiveCameraRoot replace only the private dashboard child at exact
`/dashboard/camera_widget`; `/dashboard/camera` remains stable. Existing Camera
CSP, backend and authorization are unchanged. Legacy `/camera-widget` and MCP
aliases remain unchanged and pending a separate parity cutover.

Production Camera is89,919 bytes (independently accepted separate100,000 cap),
with no synthetic media, lab/observation data, tests, Three or runtime assets.
Lab and production Fans bytes are unchanged. Current author repository gates
pass211 UI units,286 app/3,345 assertions,21 lifecycle24 ship plus deterministic
packaging/compiler/AST and bundles/signature/help. Full129 Chrome cases passed
before the final capability-readiness listener change; final focused8 cases
also pass on current bytes. Independent exact validation must run the full
matrix on the frozen pin. No Camera delivery or real-printer/device acceptance
is claimed. All other WIDGET_TRACKS remain active.

### Real Camera dashboard migration — typed-port checkpoint (2026-09-01)

Synthetic Camera PR69 is shipped as reviewed merge `ef5b239`. Continue the
separate real Camera dashboard-only cutover under decision0035: typed private
frame/signaling adapter, one peer/session owner and persistent video display.
The checkpoint adds transport, downstream-peer and playback adapters with38
focused passing unit tests plus clean Svelte/AST checks. It is not wired to a
host, route or production artifact yet. No acquisition was performed. Integrate
reviewed real Fans main before importing its shared HostRpc; preserve the old
`/camera-widget` and MCP aliases until separate parity acceptance. Production
packaging needs an independently reviewed measured budget, separate from
unchanged lab limits. All other WIDGET_TRACKS remain open.

Renewed PR70 author gates now pass on the explicitly integrated PR69 baseline:
183 UI units, 121 Chrome cases, 281 app tests/3,301 assertions, 21 lifecycle and
24 ship tests, deterministic packages and all bundles/signature/help. The held
`e0e141a` race is covered by both controller and real-iframe regressions; this
new candidate still requires independent exact-SHA validation/review. Current
artifacts: production Fans 85,315 bytes; observation lab 748,816; Camera lab
78,795; lab aggregate 827,611. All three individual limits and the 830,000-byte
two-lab aggregate remain enforced. No renewed PR70 deployment is claimed.

Current integration checkpoint: reviewed PR69 Camera merge
`ef5b239dddcc0fdf0b0bcc08daeeca2ef15dea24` is explicitly integrated into the
unshipped PR70 renewal. The operator reported successful Camera-only deployment
and both restarts; independent post-deployment evidence is recorded separately.
Preserve its two private lab artifacts, exact Camera route and 750,000/80,000 /
830,000-byte individual/aggregate bounds. The third artifact here is production
Fans, not another lab payload. Full combined-tree gates and fresh exact PR70
acceptance are pending; earlier Camera-candidate and PR70 author notes below
are historical where superseded by this checkpoint.

PR69 actual shipment is independently post-verified: exact reviewed `473cd000`,
merge `ef5b239`, release `20260901-ef5b239-pr69-20260901T160906-8d7501`, BOTH
restarts, 26 static/27 security checks, preservation and integrity pass. The
separate validator checked runtime/source identities and downloaded Camera
bytes/CSP through nine probes and 56 state-width-text combinations. Production
Camera remains legacy; this acceptance is for the synthetic private lab only.
See newest VALIDATION for hashes, rollback snapshot and role attribution.

### Live Fans migration — separate next slice (2026-09-01)

Independent review/validation held PR70 head `e0e141a`: a newer notification
followed by rejection of the older pending refresh left the UI permanently busy.
The narrow renewal settles request completion without replacing accepted values
or showing the obsolete error. Two new controller regressions reproduced the
failure before the fix and now pass; the real-iframe rejection/retry/focus case
also passes. Integrate the imminent reviewed Camera merge before renewed full
gates and exact acceptance. Earlier author green results do not approve this head.

PR67 and its receipt PR68 are delivered; reviewed main `2d30b01` is explicitly
integrated into this separate unshipped candidate. Decision 0034 implements
fixture-independent Fans models, strict adapter, shared host RPC and retained
refresh, plus a Fans-only private dashboard asset. Author gates pass: 152 UI
units, 104 Chrome cases, 280 app tests/3,265 assertions, 21 lifecycle and 24 ship
tests, deterministic packages and bundles/signature/help. Independent exact
acceptance remains pending. Backend/authentication and generic MCP resources are
unchanged. Other eight observation cutovers and Camera remain separate work.
Production Fans is 84,884 bytes; lab is 748,888 bytes, within its unchanged
750,000-byte cap. These are software/synthetic-browser results, not live-printer
or actual-user-device acceptance.
### Synthetic Camera lab candidate — next visible slice (2026-09-01)

The Camera candidate integrates reviewed main `2d30b01` and provides an exact
private lab route linked from the directory, shared visible state/capability
controls, structural loading, measured local-video FPS and persistent media
across fullscreen/PiP. It uses only an explicitly labeled calibration fixture;
production Camera, host transport, resources and printer acquisition are unchanged.
CameraLabRoot/CameraLabWidget are zero-raw composites over a generic PageLayout
and registered media/status leaves. Normal mobile status stays top-right;
200% text may reflow without overlap and without changing other widget headers.

Role-separated packaging design accepted exactly two self-contained artifacts:
observation <=750,000 bytes, Camera <=80,000, combined <=830,000. Current bytes
are748,482 +78,688 =827,170. Camera is an explicit compiled Svelte entry within
the Kit project; observation remains adapter-static and owns the directory.
No third payload, runtime asset requests, Three or real transport enters Camera.
Exact private route-to-file shipping hashes and unchanged restrictive CSP apply.

Author validation is recorded in the newest active VALIDATION. Exact independent
validation/review, guarded merge/deploy/BOTH restart and user-device acceptance
remain pending; this is not yet visible on the server. The pure real Camera
session controller remains a separate injected-port checkpoint, not a live cutover.
Preserve all remaining WIDGET_TRACKS; the existing PR67 rollout below is complete.

### All-nine private lab controls/loading shipped — PR67 (2026-09-01)

Independently validated and approved head
`07e1c144df9debbbb20b92c1bb0b2ad7b10bc03a` merged as
`c924bf9a0e225f96a1b4163cdb90c83751545e6a`, with identical reviewed tree
`9198918a05ddb08bf503369413125b8b4bc120cb`. Guarded release
`20260901-c924bf9-pr67-20260901T153250-99a666` explicitly restarted BOTH
services; loaded, healthy and integrity verification passed. All 25 static
asset/route and 26 security checks passed; preservation checks passed, rollback
was unnecessary, and snapshot `20260901T153330-e4475a` is retained.

Independent post-deployment checks confirmed directory plus nine private lab
routes return HTTP 200/no-store, exact 748,554-byte artifact SHA-256
`83146f52f61fd9225877e3bd4ef7ee08798745083fc7232fa9e932399b007a1a`, and
restrictive CSP. Isolated Chrome on fetched server bytes verified all nine
control docks, retained refresh/source times, loading without active content,
one announcement, stable major geometry and no external requests. This is
deployed-service/synthetic-browser evidence, not the user's phone or printer.

The next existing migration work is separate: real Fans adapter/shared host
controller and Camera integration. Production observation/camera remain legacy;
seven ready-shell raw debts remain. Earlier unshipped/rejected PR67 paragraphs
below are historical. Keep all named WIDGET_TRACKS open until their own evidence
exists; no second service deployment is needed for this receipt-only update.

Approved source cleanup is also complete and independently preservation-checked:
ten redundant worktrees were moved intact to recoverable private quarantine,
with branches, registrations, ignored contents and two diagnostic files retained.
Canonical `main` is clean at `c924bf9`; all 8,689 remaining ignored entries and
recovery refs match. Five historical document edits and the separate 315-entry
nested clone remain archived/recoverable. Active work is not retired; no runtime
or printer change is part of this cleanup. See the newest VALIDATION receipt.

### Consolidate, migrate, deliver and clean up — latest user order (2026-09-01)

The finite source/state/cutover/delivery checklist is in the active iteration's
`WIDGET_TRACKS.md`; all named feature obligations remain queued, not cancelled.

Finish existing work before starting any new feature track. First complete and
independently validate/review the preserved all-nine private-lab controls and
loading slice, then use guarded merge/deploy/explicit BOTH restart/verification.
Continue the already-started Camera integration and migration cleanup under
separate reviewed boundaries; do not declare remaining legacy code migrated or
delete it before replacement routes and behavior are accepted. Smaller Refresh,
size modes and all other new feature additions wait behind consolidation.

The current lab work is not shipped. Seven ready layout shells remain partly
legacy: OverviewWidget, ProgressWidget, HeadsWidget, CurrentJobWidget,
JobHistoryWidget, QueueWidget and BedMeshWidget. Production observation and
camera assets/routes remain legacy too. The separate synthetic Camera Svelte
checkpoint is not yet integrated into a deployed lab route. No production
cutover, live camera, printer or actual-device acceptance is implied.

Independent checks rejected PR67 head `8663d93`: required text was clipped in
Progress, Heads, Current Job and Overview, and its selection type did not fully
correlate each view with closed scenarios/values. The renewed candidate fixes
those shared ready/loading layouts and supplies a mapped discriminated union.
Author compiler/AST, 126 UI units, 94 Chrome cases (including 168 preset/width/
text-scale combinations), deterministic packaging, 276 app tests/3,187
assertions, 21 lifecycle and 24 ship tests plus bundles/signature/help pass.
Independent visual review of successor `befbbd5` then found excessive spacing
between a short progress number and its percent unit. The percentage group now
uses inherited end alignment without changing its loading slot or other widgets.
The final regression matrix covers 200 preset/width/text-scale combinations,
including 48 number/unit adjacency checks. Artifact: 748,554 bytes, unchanged
cap 750,000. Fresh exact independent validation/review and guarded delivery
remain pending; author green gates do not override either rejected earlier head
or imply actual-device/live acceptance.

### Visible lab lifecycle/scenario controls — current priority (2026-09-01)

The next user-directed UI-003 slice adds a visible shared control dock below
every private lab observation card. Closed lifecycle, coherent synthetic data,
freshness and bounded value examples replace the route's fixed ready-only
fixture. All nine views gain loading/refreshing/unavailable/error inspection;
no arbitrary JSON, transport or printer acquisition is introduced. Camera follows
in a separate synthetic-only media-lifecycle slice using the same control system;
it stays explicitly pending until its route is reviewed and delivered.

This candidate started at `e1f57f0` and explicitly integrates reviewed main
`cb37e3e`, including shipped slope PR65 and receipt PR66. The currently deployed
application is exact `6b9b3e7`. The hard private-lab package cap remains 750,000
bytes (22,904 bytes reserve before the lab-controls slice).
Seven legacy ready-body raw-debt multisets remain frozen, not falsely marked
fully compositional. Bed Mesh axes/enclosure, read-only Console, model/layer
progress, remaining ready migrations and production cutovers remain open.

### Shared percentage-gradient slope shipped — PR65 (2026-09-01)

Exact independently validated and reviewed head
`f216c70b9844b9e536676c403546b3eb116805b2` merged as
`6b9b3e7e09ccfad89ed542a52a69f5126407da4b`, preserving reviewed tree
`1a3bc6fc10a2a12054ef9db32d7a120f1a3a906e`. Guarded release
`20260901-6b9b3e7-pr65-20260901T142009-341331` runs on BOTH explicitly restarted
public/dashboard services, loaded, healthy and integrity verified at
0.4.8/schema 12/observation-v14/camera-v10. Twenty-five exact static asset/route
checks and twenty-six security checks pass; preservation is true. No rollback
was needed; snapshot `20260901T142049-5cf038` is retained.

Thermals and Fans private-lab backgrounds now use the subtle 100-degree tint
inside the exact percentage-width rectangle. The artifact is 727,096 bytes,
SHA-256 `2803af9d2ff5c8172305b6fdfa042192f2cfcde10a83dea1c8d1872e5b145a94`.
Production widgets, MCP and device acquisition are unchanged. Source/browser
fixtures and deployed-service evidence remain separate; no actual phone,
printer, live-camera or user acceptance is claimed.

Independent postdeployment checks confirm both actual tailnet Thermals/Fans
routes return 200/no-store with those exact bytes, and both service identities
match the installed release/merge with health and integrity verified. This is
independent service/static evidence, not a device-render observation.

Resume visible all-nine lab scenario/state controls and structural loading,
then the separate synthetic Camera integration. Smaller visual Refresh,
content-aware compact/medium/full plus a separately reviewed MCP size parameter,
seven remaining ready migrations, Bed Mesh axes, read-only Console, model/layer
progress and production cutovers remain open. These rollout records change no
application bytes and need no additional deployment.

### Subtle percentage-gradient slope — current bounded refinement (2026-09-01)

The shared PercentageBackground tint now slopes gently at 100 degrees inside
an exactly ratio-wide rectangle. The current 12%→4% wash is unchanged; zero,
invalid and over-target semantics, child identity and layout remain unchanged.
This isolated private-lab slice precedes the in-progress visible all-nine
scenario/state controls and skeleton work so it can be reviewed and delivered
promptly. Camera remains a separately authored synthetic-only follow-on using
the same lab controls, not production signaling.

The latest additional UI requests remain queued separately: a 32-pixel visual
Refresh surface with a 16-pixel glyph inside the existing 44-pixel accessible
target, then content-aware compact/medium/full presentation and its separately
reviewed MCP size parameter. No such API or size behavior is implemented here.
Seven remaining ready migrations, Bed Mesh axes, read-only Console, model/layer
progress and production cutovers remain open. Current deployed application is
still PR63 `57a305b`; documentation PR64 `e1f57f0` changed no runtime bytes.

### Fans & Air shared component slice shipped — PR63 (2026-09-01)

Exact independently validated and formally approved head
`0f78e6924cbaca5a576ee552c7e14e38cb9e1a92` merged as
`57a305b31ff408bbff4988fc3eeaa518d24b5411`, with identical reviewed tree
`402b9450cfe83faaa2f8e5b89c3884981131a260`. Guarded release
`20260901-57a305b-pr63-20260901T134952-9c86bd` runs on BOTH explicitly restarted
public/dashboard services, each loaded, healthy and integrity verified at
0.4.8/schema 12/observation-v14/camera-v10. Twenty-five exact static asset/route
checks and twenty-six security checks passed; preservation checks passed.
Rollback was not needed; snapshot `20260901T135032-d34949` is retained.

The shipped private SvelteKit lab artifact is 727,058 bytes, SHA-256
`74ad17deadd33e8373402b3b2c204830bd686fa06e369f46fff0604cc01baa41`.
The private lab Fans and Thermals routes serve those exact bytes. Production
widgets/assets, tool inventory, adapters, auth and routing are unchanged.
Source/browser-fixture and deployed-service acceptance are evidenced separately;
this rollout made no printer or camera observation and claims no actual-device,
live-printer or user acceptance. These rollout records change documentation only
and require no second service deployment.

Independent postdeployment validation also confirms tailnet `/dashboard/lab/fans`
returns 200 with `Cache-Control: no-store` and byte-identical approved content,
plus BOTH loaded/healthy/integrity-verified service contracts. This is attributed
independent service/static evidence, not actual phone/printer acceptance.

Thermals and Fans now have zero-raw ready/state/skeleton compositions. Next:
user feedback on the shipped Fans lab while the seven remaining ready/skeleton
compositions, all-nine skeleton gallery, Bed Mesh axes/enclosure,
read-only Console, model/layer progress, Camera and production cutovers remain
explicitly open. Server/MCP migration is a separate open architecture question,
not an implementation commitment from the capability discussion.

### Fans & Air compositional percentage rows — current author candidate (2026-09-01)

The user-directed next slice is implemented on merged PR62 `a3da16a`: private
SvelteKit Fans now composes seven PercentageBackground/FanReading rows, shared
MetricValue, Stack/InfoPair and single-column ReadingList. Static fan names/icons
remain during loading; only telemetry/mode are skeletons. Null/zero remain
distinct, enlarged values wrap, and refresh retains known values/source time.
Exact independent validation/review and delivery are pending; production widgets
remain unchanged. Remaining skeleton/gallery, seven ready migrations, Bed Mesh
axes, Console, model/layer progress, Camera and production cutovers are not lost.

PR62 was approved and shipped from exact `ac690ae` as merge
`a3da16a94f85bd6ddd1b8bd3c3b2828422ac0189`, release
`20260901-a3da16a-pr62-20260901T133020-38372f`. The operator reports BOTH
services explicitly restarted, loaded/healthy/integrity verified, 25 exact
asset/routes and 26 security checks passing. Rollback was unnecessary; snapshot
`20260901T133059-947eea` is retained. Independent postdeployment validation
reports the tailnet Thermals lab returned 200/no-store and exact 724,012-byte
SHA-256 `50d8297d169d1a3c65238a9042924f3e80ea684057ac68f5ce2dc5c078eec4e2`.
Both services report 0.4.8/schema 12/observation-v14/camera-v10. This is attributed
operator/validator service evidence, not this author's rerun or actual device,
live-printer, live-camera or user acceptance.

### PercentageBackground — active private-lab refinement (2026-09-01)

The current user-directed UI-003 slice adds reusable PercentageBackground and
uses it in the SvelteKit Thermals composition. It preserves ratio text and
active semantics, bounds the decorative fill, rejects invalid ratios/colors,
accepts children without adding layout, and keeps ready/skeleton row geometry.
Its implementation is isolated from production renderers and acquisition.
Exact independent validation and review are next before PR delivery and the
standing merge/deploy/BOTH-service restart/verification workflow.

PR61 is no longer merely the candidate described below: it merged as
`e8edc3847866ef6d0d07a2dc32f5e3d0e8132586`. Recovery/ship operator evidence
reports guarded release `20260901-e8edc38-pr61-20260901T125836-f29e60`, BOTH
public/dashboard services explicitly restarted, loaded, healthy and integrity
verified, 25 exact asset/routes checks and 26 security/enrollment checks. The
rollback snapshot `20260901T125915-f81d5e` was retained but not needed. These are
attributed prior deployment checks, not repeated by this implementation role.
Production widgets remain legacy; this refinement changes the SvelteKit private
lab only. No printer, live-camera, actual-device or user acceptance is implied.

The next requested slice is Fans & Air reuse of PercentageBackground with shared
icon/name and compact percentage/RPM rows, neutral unknowns and progressive-state
tests. It is not included in this Thermals source candidate.
All-nine skeleton/gallery, eight remaining zero-raw ready migrations, Bed Mesh
reference axes/grid enclosure, read-only Console, truthful job-bound model/layer
progress, Camera lifecycle and production cutovers remain ordered follow-ons.

### Svelte component foundation and Thermals progressive state — author candidate (2026-09-01)

Decision 0033/UI-003 now has a bounded private-lab author candidate based on
merged PR60 `9a9038d`. It introduces closed typed leaf/layout primitives,
zero-native-element ActualTarget/ThermalReading/Thermals compositions, a
central icon registry, shared WidgetState and shape-matched six-row Thermals
loading. Loading contains no telemetry or actionable control; ready refresh
retains data and source time; unavailable/error are closed. An AST frontier
rejects native HTML/style/HTML injection, unregistered components/imports and
transport/global escapes in migrated composites while bounding the eight
untouched ready-widget raw debts. Production assets, routes, tools, resources,
auth and services remain unchanged and uncontacted.

Author checks pass Svelte 0/0, 62 component tests, 54 real-Chrome cases and the
full repository gate (276 app/3,178 assertions, lifecycle 21, shipping 24).
Two builds reproduce a 722,484-byte self-contained package with SHA-256
`dd4f727d615fc7730db76f96b1b33e1371338b046737afc82d87d12a086b3b67`.
The hard reserve is 27,516 bytes; this is 2,484 bytes above the provisional
720,000-byte soft target and requires explicit reviewer disposition. Exact
independent re-review is required before PR/merge/deploy. This is synthetic static/software evidence,
not deployed-service, live-printer, actual-device or user acceptance.

The next ordered slices remain explicit: all-nine skeleton companions/gallery,
remaining eight zero-raw ready migrations; Bed Mesh camera-aware outer axes and
full grid enclosure; bounded sanitized private read-only Console with no input;
job-bound model thumbnail then real layer-geometry progress; Camera lifecycle;
and separately reviewed production cutovers. None is implemented here.

### All-observation Svelte private-lab candidate — review pending (2026-09-01)

Decision 0032/UI-002 now has an isolated candidate for the complete non-camera
observation lab. One deterministic self-contained SvelteKit page serves the
private `/dashboard/lab` directory and exact Overview, Progress, Thermals,
Heads, Current Job, Job History, Print Queue, Fans & Air and Bed Mesh fixture
paths. Camera is visibly pending and unlinked. Production `/dashboard/*`, MCP
tools/resources, auth/Tailscale and public HTTP remain unchanged; no runtime,
service or device was contacted.

Every new view uses strict versioned synthetic-fixture validation, the shared
header/body/footer anatomy, compact user-selected visual hierarchy and one
bottom 44-pixel Refresh with non-flow feedback. Bed Mesh is the merged approved
component without source changes.

Formal review blocked exact `8a6df9b`: child URLs first rendered the directory
and switched only after mount; WHATWG normalization could alias raw dot-segment
requests; Heads rejected canonical RGBA; row clocks mixed UTC and viewer-local
time; Overview clipped facts; and validator evidence was too broad. The renewed
source emits a neutral zero-size SSR marker, chooses the exact browser pathname
during component creation rather than after mount, and synchronously marks the
closed route. The handler rejects literal/single/double-encoded dot segments
from the raw target before normalization. Heads retains normalized RGB/RGBA
alpha, row clocks are viewer-local, Overview is one column at 320 and two
thereafter, and Heads stays two columns through 720 without reserved material
height.

Re-review then found that parser-time title history still included generic
`Observation Lab` before the canonical child title and that Heads did not yet
carry the accepted six-percent RGBA-aware wash/Copy interaction. The earliest
inline bootstrap now owns the exact first non-empty document title before
hydration. Heads uses the accepted wash, three valid-color bottom Copy actions,
no action for Empty/N/A, and one shared overlay for Copy/Refresh feedback.

Exact `b3e0c7e` was then blocked because that shared overlay still had two
competing states: stale Copy could mask a later Refresh. Its active border also
followed filament color. The renewal gives `ObservationFrame` one authoritative
feedback state/timer and one announcer used by both actions; the last action
always replaces the message. Active uses the semantic amber accent independently
while only wash and swatch follow filament color.

Exact `4e8788f` was then blocked on asynchronous ordering: Copy announced only
after awaiting the clipboard, so an older completion could overwrite a newer
Refresh. Copy now begins a persistent `Copying …` state synchronously and holds
its action generation. Clipboard success/failure settles only if that generation
is still current; any newer action invalidates the completion.

Real Chrome passes 50/50 cases at 320/390/590/720 with exactly one canonical
non-empty title from initial parsing, one visible route, zero recorded layout
shift, no required-text clipping, overflow, console error or nonlocal request,
and stable Refresh/Copy feedback geometry/source time. Bed Mesh retains its
exact 4:3/equal-mode contract. The package is 713,802 bytes, 36,198 below the
750 KB bound, with SHA-256
`565c731ef6199c81e5df4f758837c6980fb33d7cc349905d7f16c4acbf17e2eb`.
Full author gates pass 25 UI tests, 276 app tests/3,178 assertions, 21 lifecycle
tests, 24 shipping tests, deterministic builds, three bundles, help and code
signature. Production hashes remain unchanged. This is renewed author fixture/
software evidence only; exact independent review is next before any PR, merge,
deployment or cutover.

### Compact widget density and camera continuity shipped in PR58 (2026-09-01)

PR58 exact reviewed head `0b4f1d3` merged as `2cd7d96`. Guarded release
`20260901-2cd7d96-pr58-20260901T073117-6df842` runs on BOTH explicitly
restarted, loaded, healthy and integrity-verified services at runtime 0.4.8/
schema 12/observation-v14/camera-v10. All twelve local-plus-tailnet dashboard
route checks return 200 with byte-identical content; sixteen security checks
pass and no rollback occurred. This is release/service/static-route evidence,
not printer, camera or actual-device acceptance; none of those surfaces was
contacted or claimed.

### Svelte widget foundation candidate — private lab only (2026-09-01)

Decision 0032 records an incremental Svelte 5/SvelteKit migration. An isolated
source candidate adds shared widget primitives and a synthetic Bed Mesh lab at
`/dashboard/lab/bed_mesh`; its build accepts only injected normalized props and
contains no printer/network client. Existing production `/dashboard/bed_mesh`,
MCP tools/resources, auth and compatibility assets remain unchanged.

Independent review blocked candidate `7aef4b5`: equal frame geometry concealed
an unreadably thin 3D projection and effectively 3--6 pixel sprite labels. The
renewed source candidate replaces those sprites with nine stable 12-pixel HTML
axis/bound labels, fits the actual projected surface to 91.9--92.5% of chart
width and 53.4--53.7% of chart height, and validates freshness, canonical source
time, bounded profile text, finite matrix data and matrix-derived summary
agreement within `0.000001 mm` before rendering recomputed values.

Formal review then blocked exact candidate `a6363fd`: its profile guard did not
yet match the established adapter canonical allowlist and admitted path, URL,
markup and bidirectional-control values. The corrected bridge uses Unicode
`^[\p{L}\p{N} _.-]{1,80}$`, trims outer spaces and rejects empty, `.` and `..`;
adversarial and international-valid component fixtures cover that boundary.

The renewed deterministic 669,506-byte self-contained page, SHA-256
`7eaf7f211bed3466665b61bb3d483e6309b9f17f7519f39cf6de44484dcc24ec`,
is wired only to the private dashboard's exact lab route. Public HTTP, the
ten-entry directory, focused production routes and MCP resources remain
unchanged. Svelte check passes with zero errors/warnings and Vitest passes 8/8.
Real Chrome through the private handler passes at 320/390/590/720: one exact 4:3
`ChartFrame` has unchanged x/y/width/height across 3D/2D, every label is visible,
in-frame and pairwise non-overlapping, controls are 44 pixels, and no overflow,
console error or nonlocal request occurs. The full repository gate passes 274
app tests/2,974 assertions, 21 lifecycle tests and 24 shipping tests; exact
private/public isolation and deterministic package hashes pass. This is renewed
implementation-role evidence only; independent exact-candidate review remains
required. The candidate is unmerged and undeployed, and no running service,
printer, camera, auth or Tailscale surface was contacted or changed.

### Unified widget and camera reliability shipped in PR56 (2026-08-31)

PR56's exact reviewed head
`e2702dc7a39c45665aa14155e85d13011d50526b` merged as
`cb7d06fdcc4de45f7fb5803fe2efee13364eba0f`, tree
`dc290de12aceebe134b6e3ceb78aa2e8d8789f73`. Guarded release
`20260831-cb7d06f-pr56-20260831T234756-96fe19` is installed on BOTH explicitly
restarted, loaded, healthy and integrity-verified services at runtime 0.4.7/
schema 12/observation-v13/camera-v9. Sixteen security checks pass and no
rollback was required.

Served SHA-256 matches the reviewed source exactly:
`1d61271d773e532954f379c877ce58f54fad90ca996acda54e3ba4537504fb2c`
for the observation widget and
`03c3d3a96cec99eef630c444f31f8a9ff6f1caf56d89d83d61d5a60eabb89dd0`
for camera. All ten dashboard routes returned 200 on both local and tailnet
origins. Independent postdeployment validation reports PASS.

This establishes reviewed Git delivery, guarded deployment, BOTH-service
restart, health/integrity/security and exact static-route evidence. The browser
runtime was unavailable, so iPhone layout, WebGL rendering/fallback, touch
interaction and live-camera/fullscreen continuity remain visually unaccepted.
No camera or printer request was made for this rollout verification, and no
physical-printer or user-outcome acceptance is claimed.

### Authoritative current work: complete all U1 widgets (2026-08-31)

**All focused widget tracks, including E compact Overview, are shipped.** PR53
merged the Overview application as `4541ff12`; its first guarded delivery reached
verification but stopped on the contradictory private Overview 200/404 check.
The workflow restored healthy runtime 0.4.5 from verified rollback snapshot
`20260831T195837-6233d9`. PR54 head `a9ad04a` corrected only that verifier and
merged as `aa9bd9d609dbdca7c1e0124b4f760d5eb8ddf2c5` at
`2026-09-01T00:10:35Z`. Exact release
`20260831-aa9bd9d-pr54-20260831T201019-d7aa8a` now runs on BOTH explicitly
restarted, loaded, healthy and integrity-verified services at runtime 0.4.6/
schema 12/observation-v12/camera-v8. Rollback snapshot
`20260831T201038-575d7f` is retained and was not needed. Configuration, OAuth and
routes were preserved; sixteen security checks pass. Served widget, index and
status-host hashes have verified prefixes `a8a4…`, `49a5…` and `008d…`; tailnet
index and Overview return 200. Exactly one private Overview refresh reported
complete coverage: all eight tiles known and every contributing receipt fresh
and timestamped. No raw payload, filename, row, identifier, model, project or
private path is retained. Browser/device visual review and physical user
acceptance remain unverified; the next step is user visual review and bounded
product iteration, not another widget implementation track.

**D Current Job/real History is shipped.** PR51 exact head
`30f1c7bb407d08d19d390acf2b5704a30eff010f` was approved by the formal reviewer
and independent validator, then merged as
`23f07e37de668fcbf2677a9a9b27bf01448cc8e7` at `2026-08-31T23:10:43Z`.
Exact release `20260831-23f07e3-pr51-resume-20260831T191106-be85c4` runs on BOTH
explicitly restarted, loaded, healthy and integrity-verified services at runtime
0.4.5/schema 11/observation-v11/camera-v8. Sixteen security checks pass with
configuration, OAuth and routes preserved. Tailnet index, Current Job and Job
History return 200. Exactly one sanitized Current Job read was known/fresh and
reported a completed terminal job with inactive storage; exactly one sanitized
History read was known/fresh with 20 returned rows. This proves bounded telemetry
semantics only, not filenames/projects, a currently active job, grand-total
history, visual/device behavior or user acceptance. At this D checkpoint E was
next; the authoritative section above records E shipped.

### Previous shipped C checkpoint

**C Fans & Chamber is shipped.** PR49 exact head
`c14e92cfc655d0b7a6e7d0138650d7937789d7d1` was formally and independently
approved, then merged as `3ab4ed7813a8f2ba45ac63b3093480183c428f28` at
`2026-08-31T22:21:37Z`. Exact release
`20260831-3ab4ed7-pr49-resume-20260831T182603-74d978` runs on BOTH explicitly
restarted, loaded, healthy and integrity-verified services at runtime 0.4.4/tool
schema 10/observation-v10/camera-v8. Sixteen security checks pass; configuration,
OAuth and routing were preserved. Tailnet index, Fans and Thermals return 200;
served widget/index hashes match frozen source. Exactly one Fans and one Thermals
POST shared source time `2026-08-31T22:27:06.974Z` and returned known/fresh
environment facts, including Cavity 33°C. These are telemetry facts, not sensor-
accuracy, health or safety proof. Browser/device visual acceptance is unverified.
At that C checkpoint, E Overview remained next; all tracks are now shipped as
recorded above.

### Previous shipped Queue checkpoint

**B Queue is shipped.** PR47's reviewed `1068add` was approved without findings
and merged as `6d76f9ac1c1c6daded28f3b0b945c934e56504e0`; guarded shipping installed
`20260831-6d76f9a-pr47-20260831T172710-645971`. BOTH services were explicitly
restarted and are loaded/healthy/integrity verified at runtime 0.4.3/tool schema
9/observation-v9/camera-v8. Fourteen static and sixteen security checks pass;
configuration/auth/routes are preserved and no rollback occurred. Independent
verification confirms 15 exact manifest files, both service targets, three
health/seven exact local-tailnet static checks and exactly one private Queue
refresh: known/fresh paused empty at `2026-08-31T21:31:36.003Z`. The exact served
widget passes current-empty/state/time/no-ETA/bounds/top-information/single-bottom-
Refresh behavior. User/browser/device visual acceptance remains unverified.
At that Queue checkpoint, C, D and E remained next; all are now shipped as
recorded above.

### Previous Queue source checkpoint

The user's continuation resumed **B Queue integration** after PR46 merged the
Heads rollout records at `bd7abc8f07f7bbe1fdd47e45eabaf41b8b7110b2`.
Decision 0029's Queue addendum and OBS-012 bound the existing foundation's
store/projection/widget integration: independent receipt/freshness/15-second
attempt TTL, bounded ordered safe filenames, truthful empty/stale/failure
states, top information and bottom Refresh, without Queue mutations. Source
candidate is runtime 0.4.3/tool schema 9/observation-v9/camera-v8 with nineteen
resources and observation-v8 retained; validation and exact-candidate review
are active. Author checks pass 223 app tests/3,150 assertions; independent
validation passes those plus 21 lifecycle, 22 shipping and 15 focused tests/
7,049 assertions, TypeScript, diff checks, three bundles/code signing and six
exact emitted assets. Formal review's singular-summary grammar finding is fixed
in only widget/test bytes; renewed author and independent checks pass with no
findings. This source was subsequently approved and shipped as recorded above.
Preserve shipped A/F/Heads and the order C fans/chamber →
D Current Job/History → E overview, plus independent invocation. The latest
allowed-browser discovery remains unavailable. The standing exact-review → PR
merge → exact-build deploy → restart BOTH services → verify sequence remains
authorized for the user's subsequent visual review.

### Previous shipped Heads checkpoint

Latest user priority is the Heads reference refinement in decision 0029:
soft actual-filament-color tool-card washes inside the white container, real
state/material/temperature, exact swatch/hex and accessible Copy, with Refresh
remaining below information. This presentation-only slice is deployed in
[PR45](https://github.com/scottchu/orca-slicer-mcp/pull/45); current order is
A/F/Heads (deployed) → B Queue → C → D → E.
Mapping, independent material freshness and all unfinished tracks are preserved.
Source is 0.4.2/schema 8/observation-v8/camera-v8 with eighteen resources;
author checks pass 106 tests/2,290 assertions and TypeScript. Independent checks
pass 200 app/2,855 assertions, 21 lifecycle, 22 shipping, 86 fixtures/751
assertions, TypeScript/repository/bundles/signature/exact assets. Exact reviewed
`e369ca4d53867b1904af5326b38f4b92b82ea3b0` merged as
`90d9f9d353c7bca2c299ab7ae949ad81e7d4faca`; exact release
`20260831-90d9f9d-pr45-20260831T152746-190348` was deployed and BOTH services
explicitly restarted. Both are loaded/healthy/integrity verified; fourteen
static and sixteen security checks pass, configuration/auth/routes preserved,
no rollback. Independent postdeployment verification passes: fifteen manifest
files per service, three health/seven exact static checks, and one fresh Heads
read with independent material time; exact served-widget VM behavior passes
35 assertions for all four heads. Automated/
actual-device visual and native clipboard acceptance remain unverified. These
docs-only rollout records need no app redeployment; Queue integration is next.

F Bed Mesh is shipped in [PR43](https://github.com/scottchu/orca-slicer-mcp/pull/43):
reviewed `41546d9e3ea841bdd23279694079719327f39f39` merged as
`92a62c04c22600ee802d7be3c0b27285135f6d33`; installed release
`20260831-92a62c0-pr43-20260831T150042-2e7c64` runs 0.4.1/schema 8/
observation-v7/camera-v8. The read-only shipping plan passed, then the operator
deployed the exact merged build and explicitly restarted BOTH services.
Both are loaded/healthy/integrity verified; fourteen exact static and sixteen
security checks pass, OAuth/environment/config/routes preserved, no rollback.
Independent checks confirm both exact installed releases/source, fifteen
manifest files per release, fourteen local and thirteen tailnet exact static
checks plus tailnet health. Exactly one private Bed Mesh refresh returns a
known/fresh active 11 by 11 grid at `2026-08-31T19:03:22.696Z`, with valid bounds/
summary. Visual/device acceptance remains unverified; the user has the live review link.
These docs-only rollout records do not change application bytes or require
another deployment. Queue store/projection/widget integration is next.

Previous release A was merged and deployed in [PR41](https://github.com/scottchu/orca-slicer-mcp/pull/41), which
merged reviewed `744f7d06607526a10997b926d91b18087c4030cf` as
`b6142de6241cb2e1b6ac70b509f2d0b0e836f1d8`; installed release
`20260831-b6142de-pr41-20260831T140555-84d50f` ran 0.4.0/schema 8/
observation-v6/camera-v8. Both public/dashboard services were explicitly
restarted and are loaded, healthy and integrity verified. Fourteen static and
sixteen security checks pass, preserving OAuth/environment/config/routes;
no rollback was needed. The user explicitly authorized deployment before
automated browser QA so they can visually review the delivered widgets.
Rendered/actual-device visual acceptance remains unverified, not passed.
Independent read-only checks confirm the exact installed release, twelve exact
asset comparisons, four user-facing pages, fresh material metadata for four
physical heads, and a structurally valid real 1920 × 1080 JPEG snapshot.

The user requests all pending widgets and a unified refined white style.
Decisions 0029/0030 and the active iteration's `WIDGET_TRACKS.md` own the durable
queue: A materials + white cards/index + latest camera + continuous progress
(deployed); F interactive reported Bed Mesh surface (deployed); B Queue
(deployed); C Fans & Chamber (deployed); D Current Job/real History; E composed
Overview. The latest Fluidd Bed Mesh
reference prioritizes an orbitable 3D height surface inside the existing white
card, not its dark dashboard or printer/profile controls. Independently
invokable skills and the Current Job/History split stay intact. New feedback
does not cancel unfinished tracks. E remains active; A/F/B/C/D visual acceptance
is still pending. Old deferral wording
below is historical. F0/O1 milestone completion is not claimed.

F's bounded design is recorded in decision 0030. The 0.4.1/schema 8/
observation-v7/camera-v8 source has seventeen resources and is deployed in PR43.
Formal review's P2 centroid-sort occlusion defect is corrected; independent
per-point geometry sweeps and the original regression pass on final widget
`c800447957bf8b7b386ddba7666941f625170db92107d31230c5f382378d77f6`.
Independent final validation passes 194 app tests/2,731 assertions, 21 lifecycle,
22 shipping, 22 independent tests/1,162 assertions, TypeScript, repository and
all bundles/exact assets. The reviewer approved exact head `41546d9` without
blockers before shipment. These software checks are not rendered-browser
acceptance. The surface uses the same normalized
reported grid and XY bounds with no new acquisitions, resampling or
`mesh_matrix` substitution. It adds XYZ mm axes/height legend, explicit bounded
height exaggeration, pointer/keyboard orbit/reset and a retained 2D fallback.
Reported points and connecting visualization faces do not establish independent
physical measurements or bed quality. Flat/inactive/unknown/stale semantics,
independent time, bottom controls and existing read-only limits remain.
Follow the standing merge → exact-build deploy → explicitly restart BOTH
services → verify order for user visual review. Fresh allowed-browser discovery
is unavailable; visual/browser/device acceptance remains unverified, not a
source-test pass or a new block on the authorized delivery sequence.

Release A retains sixteen resources and adds real
printer-reported materials and white focused cards/index, camera information
outside the image with working snapshot feedback/native fullscreen, and
continuous reported-percent progress. The lower progress row contains only
elapsed time; other reference metrics are not projected and are not fabricated.
Frame/FPS watcher semantics are unchanged and the contrast P2 is resolved.
Software evidence remains 190 app/1,761 assertions, 21 lifecycle, 22 shipping,
20 isolated/399 assertions, TypeScript/bundles and exact assets; final reviewed
candidate preserves that application manifest. A preliminary read-only ship
plan stopped on an uncommitted BRIEF edit; scoped commit and renewed exact-SHA
review resolved it without bypassing guards or external mutation. The final
read-only plan passed before execution. These rollout records change no
application bytes and need no extra deployment. Next integrate Queue while
the user reviews A/F. Keep software, deployed, real-printer and user-device evidence distinct.
Queue foundation is
locally committed as `4fbb96c7201398c125006cafc5050b84a875af1e` on
`feat/u1-queue-completion`: standalone adapter/model/tests only. Independent
bounded source/protocol approval closes the prior credential-basename P2;
TypeScript, 40 tests/461 assertions and six independent tests/68 assertions pass.
Store/projection/widget integration is active next, without any Queue
merge or deployment.
Source work may continue in stacked B–E branches while the user reviews A;
current independently reviewed release order is A/F (deployed) → B → C → D → E.
Read-only capability research confirms Queue/History/cavity/fans endpoints can
return real data; they are software gaps, not proven unsupported hardware.
No printer controls, preset/project writes, auth/Tailscale changes, plugin
reinstall, or previously deferred Mac login work is authorized by this scope.

### Historical delivered checkpoints

- Current result: bottom-left camera information and bottom-right controls are
  implemented with narrow wrapping. A reproduced product defect let repeated
  same-peer track events start duplicate frame watchers, repeatedly resetting
  the FPS window. The fix cancels prior watchers and rejects old-generation
  callbacks; the user's device-specific cause remains unverified. Author
  checks pass 83 tests/862 assertions and TypeScript. Independent native-browser
  evidence includes six captures and playback retaining approximately 30/31 FPS
  after repetition.
  Source is 0.3.5/schema 7/observation-v5/camera-v7, with camera-v6/v5/v4 aliases
  and fourteen resources. PR38 reviewed head `a35c92c813d669bef696fefbbc87ee7bd5390630`
  merged as `b565eecc30ec394137483f4619a523807b59e538` and shipped through
  `u1-ship`, release `20260831-b565eec-pr38-20260831T130407-2e3c85`.
  Both services were explicitly restarted and are healthy/integrity verified;
  fourteen static and sixteen security checks pass with private configuration,
  authentication and routes preserved. No rollback was needed. Next merge only
  these rollout records; source/tests are unchanged and need no redeployment.
  Queue and minimal-progress work remain deferred.
- Previous result: live-only measured FPS is reviewed, merged in PR36 and
  deployed through `u1-ship`. Reviewed head `40d359bd81df3523a32726172f64b045ab027e86`
  merged as `3fc918e5c64b401f497f97144d9c81423877d852`; installed release
  `20260831-3fc918e-pr36-20260831T124701-e914a1` reports runtime 0.3.4/schema 7/
  observation-v5/camera-v6. Both U1 services were explicitly restarted and are
  healthy/integrity verified; fourteen static and sixteen security checks
  passed with OAuth/configuration/routes preserved. No rollback was needed.
  Source fixtures validate measured FPS, not actual phone/live-video playback.
  Its docs-only rollout record is merged without a second app deployment.
  This is the deployed baseline for the new camera refinement above.
- Previous result (2026-08-31): PR34 is merged and deployed. Independently
  reviewed head `97b5106d29e1d5c3d3dde4aa7810724d2d3bcce1` merged as
  `7194361d4a8d7a2291bcc64f1d053eae51a8d99c`; `$u1-ship` completed the
  guarded merge, exact-build deployment, explicit restart of BOTH services,
  and verification. Installed release
  `20260831-7194361-pr34-20260831T121439-3ba53f` reports runtime 0.3.3/schema 7/
  observation-v5/camera-v5. Both services are loaded, healthy, and integrity
  verified; fourteen static and sixteen security checks pass with OAuth,
  configuration and routes preserved. The coordinator and independent validator
  separately confirm the deployed state. Rollback material remains private.
- Independent live evidence: one read-only Bed Mesh observation is known,
  fresh and active, with an 11 × 11 reported grid, minimum -0.340833 mm,
  maximum 0.066667 mm and range 0.407500 mm. A 269,416-byte camera JPEG was
  visually inspected and shows a coherent printer interior. No calibration,
  printer control, live-video session, or phone visual acceptance occurred.
  Queue remains paused in its separate checkout; minimal-progress design and
  mounted-phone/live-video verification remain pending. The docs-only rollout
  record is merged; it did not require another application deployment.
- Previous pre-rollout checkpoint: decision 0028's repository-only shipping skill/
  script and decision 0027's real read-only Bed Mesh slice are implemented and
  software-validated, ready for final exact-commit review and PR delivery.
  Validation passes 165 app tests/2,200 assertions, 21 lifecycle tests,
  21 shipping tests, 24 independent focused tests/228 assertions, nine actual
  widget captures, fifteen browser checks and twenty-eight routes, with no
  external requests or unintended acquisitions. Seven independent shipping
  method checks and skill validation also pass. All three bundles, signatures,
  exact assets and TypeScript pass. Source is runtime 0.3.3/schema 7/observation-v5
  with camera-v5 and the existing tool/view inventory unchanged. Queue WIP
  stays paused in its separate checkout. The user's rejected progress styling
  remains unresolved; the prior camera report has verified JPEG acquisition
  but mounted-phone/live-video acceptance is still separate.
  Explicit task authority covers reviewed merge, exact merged-build deployment,
  restart of BOTH U1 services, and verification; it does not cover printer
  controls, plugin reinstall, or authentication/routing changes.
  New-source merge and rollout have not occurred. Finish independent approval
  of the exact committed head, then use the repository shipping workflow.
- PR33 is merged at `7b9c4d4` and its urgent rollout is complete: release
  `20260831-7b9c4d4-widgets`, runtime 0.3.2/schema 6/observation-v4/camera-v5.
  Both services were explicitly restarted and are loaded, healthy, and
  integrity verified. Fourteen static and six security checks pass, with
  environment, OAuth, configuration, and routes preserved. This is deployed
  service evidence. A separate independent pass verifies both health contracts,
  thirteen exact static and seven security checks, plus a real 232,522-byte
  JPEG observed at `2026-08-31T15:50:03.971Z`; visual inspection shows a coherent
  printer interior. This proves snapshot acquisition, not mounted-phone or
  live-video operation, and does not verify pending Bed Mesh data. Historical
  pending-merge, no-rollout-authority, and live-0.3.1 statements below describe
  earlier checkpoints and do not override this current state.
- Previous source checkpoint: decision 0025's independently callable Current Job and Job
  History views are implemented in source. Stable `jobs` and `/dashboard/jobs`
  now present only Current Job; `job_history` and its private path present
  explicitly unimplemented history, not an empty success or observed history
  time. The static directory has nine entries. Source is runtime `0.3.2`,
  schema `6`, observation-v4 with v3/v2/v1 aliases, camera-v5 unchanged, eleven
  resource URIs, nine observation enum values, and unchanged two-visible/eight-
  app-only tool counts. Independent validation passes 148 app tests/2,011
  assertions, 21 lifecycle tests, TypeScript, repository checks, all bundles/
  signatures, widget comparisons and skill validation. Six rendered captures,
  nine browser cases and thirty route checks pass with zero external requests,
  browser errors or fixture acquisitions. Independent code/visual review
  approves without findings; the reviewer passes 30 tests/1,085 assertions and
  inspects all six captures. Deliver
  through a new PR and merge after those gates under the user's merge-as-we-go
  authorization. Deployment, plugin installation, services, auth/routes and
  printer access/history-backend work remain excluded.
- PR32 is merged as `47bfd37fdc0959d67ec5c717718899692b688310`; PR31's
  rollout records are also merged as `16169c0`. Their older pending-delivery
  wording below is historical, not current execution guidance. The live
  release remains `20260831-48a106d-widgets`, runtime `0.3.1`, schema `5`,
  observation-v3/camera-v5. Source merge does not update that release.
- Merged PR32 baseline: the user's latest information-above/actions-below principle
  is implemented in source across current focused widgets. Observation time,
  freshness and refresh failures are at the top; bottom footers contain only
  Refresh/Retry. Camera status/time/feedback are at the top and display/live
  controls stay bottom right. This explicitly supersedes earlier bottom-time
  placement; historical evidence below is not current layout guidance.
  Layer calculations and camera JavaScript remain unchanged, though both HTML
  asset hashes change. Independent validation passes 144 app tests/1,931
  assertions, 21 lifecycle tests, TypeScript, repository/bundle/signature checks,
  exact asset comparisons and ten browser captures. Independent code/visual
  review approves without findings, with 71 tests/1,576 assertions passing.
  Next update the same PR32 with this reviewed source.
  Source remains undeployed, with no new merge/rollout authority.
- Previous PR32 follow-up, delivered as `081929e`: camera PiP and fullscreen sit beside Go Live/Close in one
  bottom-right cluster, with status/time left and narrow-screen wrapping.
  Source-only DOM/CSS changes preserve camera JavaScript and the reviewed
  segmented-progress bytes. Independent validation passes 143 app tests/1,865
  assertions, 21 lifecycle tests, TypeScript, repository/bundle/signature checks,
  and five browser captures. Independent code/visual review approves with no
  findings; the reviewer passes 51 tests/556 assertions. Next update existing
  PR32, not a new PR. Neither PR32 refinement is deployed;
  no merge, installation, restart or printer access is authorized here.
- Delivered PR32 source baseline: the user's segmented-layer progress refinement is implemented
  in source under decision 0023's dated addendum. Only the current observation
  HTML and its VM regressions change at runtime/test level. Layer-position
  blocks group large totals at 24 narrow or 48 wide, preserve independent
  reported print percentage and the bottom footer, and explicitly handle
  invalid/unknown layers. Independent validation passes 142 app tests/1,849
  assertions, 21 lifecycle tests, TypeScript, repository checks, all three
  bundles/signature checks, and exact bundled/frozen asset comparisons.
  Twelve isolated screenshots and eight browser behavior cases pass.
  Independent code and scoped visual review approve with no blocking findings;
  the reviewer independently passes 58 tests/1,441 assertions. Next deliver
  the camera follow-up through the same open PR32. Neither is deployed.
  Source and deployed baseline both
  retain runtime `0.3.1`, schema `5`, observation-v3/camera-v5, so version strings
  alone do not prove segmented assets are installed. Preserve the prior PR30
  rollout records; that completed authorization does not authorize this
  slice's merge, deployment, service restart, plugin install, or printer access.
- Completed baseline: the user authorized PR30 merge and rollout to the two existing
  HTTP services. PR30 merged as `48a106d2f17550bab8dc8648af1c7c247610a228`
  on 2026-08-31. Versioned release `20260831-48a106d-widgets` is installed;
  both services are healthy at runtime `0.3.1`, schema `5`, observation-v3/
  camera-v5. Independent checks confirm exact directory/focused assets and
  unchanged private configuration and routes. Deployed directory-only browser
  captures at 390/light and 720/dark passed without overflow, subrequests or
  errors. No personal-plugin reinstall, Mac login/power, auth/route changes,
  printer access, or missing-domain work is included in this authorization.
- Decision 0024 adds a private widget directory at both
  `/dashboard` and `/dashboard/`, replacing the source root redirect while
  preserving all eight focused paths. It labels Progress/Camera implemented,
  Thermals/Heads/Jobs partial, and Queue/Fans/Bed Mesh not implemented. These
  describe software coverage, not printer health. The static page has no
  script, iframe, polling, or observation/camera acquisition. It is inlined
  into the HTTP bundle; lifecycle asset requirements remain unchanged for
  older-release rollback compatibility. Decision 0023's bottom footer and
  removed redundant chrome are preserved without additional widget changes.
  Independent validation passes 135 app tests/1,006 assertions, 21 lifecycle
  tests, TypeScript, repository checks, bundles/signing, six rendered directory
  captures, 20 route checks and 12 keyboard checks with zero acquisition.
  A release-shaped copy of the HTTP bundle serves the exact directory without
  an external index file. Independent code/visual review reports no findings;
  its scoped disposition is in `design-qa.md`. PR30 includes this source and
  validated evidence. Actual-phone and mounted-host acceptance remain separate.
- Decision 0023's user-requested quiet footers,
  image-only camera overlay/display controls, and bounded host-loading repair.
  Source commit `db4e250` was initially delivered in
  [PR30](https://github.com/scottchu/orca-slicer-mcp/pull/30), now merged.
  Independent formal review approves the source-only change with no unresolved
  findings. Initial source delivery is complete. The user then explicitly
  authorized isolated headless-browser validation, now completed against
  synthetic observations/media. At that stage, actual mobile-host and
  deployment acceptance were separate and pending; the rollout above now
  supplies the deployment evidence. The three screenshot-grounded follow-up fixes and evidence
  were committed and pushed as `643b5dd` before the directory follow-up.
  Independent formal review now approves the headless follow-up with no new
  findings, and scoped visual QA passes. Delivery through existing draft PR30
  was complete; that source delivery check verified its then-open draft head at
  `643b5dd`, matching the remote branch.
  Source reports runtime `0.3.1`, schema `5`, observation-v3/camera-v5;
  observation-v2/v1 and camera-v4 remain current aliases, and all previously
  frozen legacy bytes remain unchanged. Two model-visible/eight app-only
  read-only tools are unchanged; ten resource URIs preserve compatibility.
  The earlier installed-release facts below remain historical evidence, not
  this slice's deployment or mounted acceptance.
- Progress, extruder/bed thermals, physical heads, and limited current-job
  fields are mapped. Queue, fans, bed mesh, cavity, material/color, and history
  remain unmapped or unknown; their cards are not implemented data capabilities.
  Decorative thermal waves and bed-mesh cells were removed. A strict synthetic
  host reproduced incorrect observation initialization and missing metadata
  hydration; source fixes add an awaited request handshake, full-envelope
  hydration, finite loading failure/retry, and retained stale refresh feedback.
  This does not establish the exact cause of the user's phone screenshot.
- Isolated headless validation captured 67 observation and 22 camera cases,
  passed 13 camera behavior checks plus three keyboard/unavailable checks,
  and found no horizontal overflow or console errors on the final assets.
  Independent screenshot review identified three bounded P2 fixes: active
  thermal numbers now use ink color, footer warnings have contrasting
  light/dark colors, and Jobs uses reader-facing copy instead of internal
  availability/normalization terminology. The final source gate passes
  134 app tests/939 assertions, 21 lifecycle tests, all bundles and signature
  verification. See `design-qa.md` for the independent visual disposition.
  Synthetic browser/media behavior alone is not mounted ChatGPT iPhone,
  real-printer or deployed-version acceptance. The separate rollout above
  accepts deployment; mounted-phone and new real-printer outcomes remain unclaimed.
- Before this rollout, private focused URLs served runtime 0.3.0 and
  `/dashboard` redirected to progress. The new directory is navigation, not a
  composed overview. Static HTTP success proves route/asset availability only,
  not missing-domain mappings or actual-phone rendering. No private hostname
  is retained here.

- Iteration: `docs/iterations/2026-08-23-f0-dual-subsystem-foundation/`.
- Roadmap milestone: F0 — Dual-environment and contract discovery.
- PR28 merged the focused widgets, PR27 routing integration, and decision-0022
  persistence slice as `2160492a4ce63d1409673786ea02b253d7cfaace`.
  The user authorized the installed/server rollout, not Mac login/power changes,
  printer controls, or route/auth changes.
- Personal Marketplace version `0.2.0+codex.20260831033612` is installed from
  that merge. Source, stage, and installed standalone runtime match SHA-256
  `c4029f18678e1839c0b005e37bc7401bf84bcc6ed7ef3d19155286253c2f018b`;
  all production HTML and five skill folders match, including
  `$u1-observe-printer`. Plugin and ad-hoc signature validation pass. Prior
  personal source remains in recoverable local Trash; no source/cache was
  edited by hand and the base plugin version remains `0.2.0`.
- Decision 0022 reuses the two existing owner LaunchAgents with versioned
  bundled HTTP releases and a release-local pinned Bun copy. Its original
  progress-root redirect is superseded by decision 0024's static directory.
  One observation store is shared across HTTP requests within
  each process; separate services/stdio and process restarts remain separate
  state scopes. Implementation and rollout evidence are tracked below and in
  the active iteration, not inferred from this accepted design.
- Decision 0017 adds a private enrollment listener plus explicit STUN and
  short-lived TURN REST boundaries while preserving decision 0016's local-first
  normal-user direction and MCP Apps signaling bridge.
- Pull request 20 merged the mounted-app compatibility repair as `4d4ea2f`.
  Its status-v3/status-v4 compatibility boundary remains in the current
  installed runtime.
- Decision 0018 accepts a dedicated snapshot-first camera presentation:
  `open_printer_camera` links `camera-v1.html`, while WebRTC allocation and
  follow-up signaling are app-only widget actions. Pull request 22 merged as
  `333bebe`; Personal Marketplace version
  `0.2.0+codex.20260828194545` was installed then. The public service and private
  dashboard were restarted at that stage without changing Tailscale
  routing.
- Decision 0019 records the earlier user-authorized workflow repair.
  `open_printer_camera` is the only model-visible camera command and links
  `camera-v2.html`; v1 remains readable as a compatibility alias. A current
  widget must mint a one-time private activation before stream allocation, and
  unanswered offers release their lease after 15 seconds. Health exposes tool
  schema 3 and camera widget v2 for rollout coherence.
- Pull request 24 merged decision 0019 as `62acd4c`. Personal Marketplace
  version `0.2.0+codex.20260828211031` was installed from that merge with
  runtime SHA-256
  `74f5f654de2a52c21a33577ffd6520f1054eb71439668885986114177faa2398`.
  Both existing U1 LaunchAgents then ran schema 3/camera-v2. OAuth state and
  Tailscale routing hashes were unchanged across restart. The deployed private
  dashboard showed Snapshot, rendered `Live · 24 FPS`, and returned to Snapshot
  after Close.
- Decision 0020 merged through pull request 26 as `4f9041c`. It replaces direct
  printer-to-viewer sessions with one private server-terminated H264 upstream
  and bounded independent downstream peers. Camera v3 is a fresh repeated-open
  camera-only resource; v2 and v1 remain current-asset aliases. Public
  envelopes use closed vocabularies, strip JPEG metadata, and exclude printer
  identity and upstream signaling. Independent media-core review additionally
  requires exact first-RTP H264 payload/profile selection, rate-limited shared
  upstream PLI feedback, async termination cleanup, and level-triggered
  rejection of werift peers already failed/closed before observer registration.
  Personal Marketplace version `0.2.0+codex.20260830013924` was rebuilt from
  the merge and installed; both existing services restarted on schema 4 and
  camera-v3 without changing OAuth state or Tailscale routing.
- A fresh conversation in the still-running pre-install Codex Desktop process
  did not expose `open_printer_camera`. The model selected the monitoring skill
  and substituted `show_u1_status`, mounting the entire status card. That is a
  stale host-process descriptor plus a procedural-routing regression, not
  evidence that the rebuilt camera-v3 resource contains status markup. PR27,
  merged as `473e482`, requires standalone camera requests to call only
  `open_printer_camera` and fail closed when it is unavailable; a full host quit
  and relaunch remains required for mounted acceptance.
- Historical decision-0021 baseline, now extended by decision 0025: the user selected
  720-pixel Instrument Strips, rejected a giant machine map, and requires camera
  as its own focused strip. At that stage `observe_printer`, with the closed views
  `overview`, `progress`, `thermals`, `heads`, `jobs`, `queue`, `fans`, and
  `bed_mesh`, plus `open_printer_camera` are the two model-visible presentation
  intents. Every non-camera view projects one shared normalized observation.
  `$u1-observe-printer` is the single procedural skill routing natural language
  to that surface. Focused progress, thermals, heads, and camera presentations
  passed local browser-fixture review; overview remains intentionally deferred
  until the focused module set is accepted. PR28 and the installed plugin
  carried this earlier contract; current source additionally has `job_history`.
  Live and mounted acceptance are separately recorded.

## Implemented local-first slice

The repository contains the smallest desktop-local read-only connector slice:

- one shared `u1-print-studio setup`, `doctor`, and `mcp` CLI contract;
- owner-only versioned configuration accepting only private, link-local,
  loopback, or `.local` printer origins with no credentials, query, fragment,
  or proxy-shaped path;
- fixed-route status, snapshot, and `webrtc-camerastreamer` operations behind
  the U1 Printer Operations adapter;
- one shared observation store: after initial acquisition, plain reads are cache-only, explicit refreshes
  call the upstream adapter only when due, concurrent refreshes coalesce, and a
  failed refresh retains last reachable values as stale with their source time;
- focused observation and camera MCP Apps widgets with empty external CSP
  domains and no direct `fetch` call;
- current `observation-v4.html` and `camera-v5.html` resources,
  observation-v3/v2/v1 and camera-v4 current-asset aliases, and exact frozen legacy status
  v4/v3 and camera v3/v2/v1 bytes for retained tasks;
- selected-module projections for progress, thermals, and heads; unsupported or
  not-yet-mapped domains remain explicit `unknown`/`unavailable`, and overview
  remains deferred rather than reconstructing the retired large card;
- hosted offer, answer, ICE-candidate, and close signaling through MCP Apps
  `tools/call`;
- application-owned opaque WebRTC sessions with offer/answer/candidate size
  limits, per-call and cumulative candidate budgets, duration, expiry,
  concurrency, failure teardown, answer idempotency, and idempotent close;
- snapshot fallback and the existing 1200 by 1500 PNG status result;
- one release MCP manifest pointing to a staged standalone executable;
- one documented Marketplace/Homebrew/npm packaging contract around the same
  runtime and onboarding path;
- an ephemeral macOS arm64 executable that embeds its widget, disables
  automatic dotenv/bunfig loading, and runs without a Bun executable at
  runtime.

The pre-integration decision-0021 source validation passed with 101 tests and
594 assertions, TypeScript, both bundles, ad-hoc signature verification, plugin and
skill validation, the repository contract, and whitespace checks. Browser
fixture review accepted the focused Progress, Thermals, Heads, and Camera
presentations at a narrow inline viewport. Exact hashes and commands are
recorded in the active iteration. That pre-integration evidence is static or
fixture-only; post-merge installed/service evidence is recorded separately.
PR27's separate tree passed 93 tests with 569 assertions. The combined baseline
passed TypeScript and 105 tests with 606 assertions before persistence changes.
The implemented focused-route/shared-store slice passes TypeScript and 110
tests with 759 assertions, stdio/runtime bundles, and local signature checks.
Before rollout, the lifecycle CLI passed 19 local fixture tests. Independent
pre-rollout review approved the combined source with no blocking findings and verified the
repository contract plus isolated bundled health/static readiness with zero
synthetic printer reads. Post-merge rollout evidence is recorded separately.

The earlier PR28/PR29 rollout exposed an asynchronous `bootout` race during a real
controlled restart after initial installation had passed. Public service was
recovered explicitly. The subsequent CLI-only repair waits for exact-label
removal before restart, bounded to 30 seconds, and passes 21 lifecycle tests
with independent approval. It does not change deployed app revision `2160492`.
Post-repair controlled restart and dashboard-only SIGTERM/KeepAlive recovery
passed independently. At that gate both services reported loaded, healthy, integrity-verified
runtime `0.3.0`, schema `5`, observation-v2, and camera-v4. Static paths and
public/private rejection checks pass; private env/OAuth/config/routes and
preserved plist fields are unchanged. This is tested local service recovery,
not Mac reboot/login/sleep or mounted-browser acceptance.

The self-contained artifact remains locally and ad-hoc signed and is not
suitable for publication. No Homebrew or npm package was published.

## Implemented secure remote source slice

- Public personal OAuth and Streamable HTTP MCP require standard HTTPS and
  `u1.monitor`; public passkey enrollment routes return 404.
- A separately configured enrollment origin binds a distinct loopback-only
  listener with private health and exact enrollment routes. It stays bound
  after enrollment while enrollment itself returns 404.
- ICE defaults empty. Explicit bounded STUN may come from HTTP env or the
  standalone owner-only schema-2 config; setup preserves STUN on later rewrites.
- Preferred remote TURN uses bounded URLs plus a server-only shared secret.
  The printer upstream and every downstream viewer derive separate
  `expiry:nonce` usernames and base64 HMAC-SHA1 credentials. Only a viewer's
  credential enters its widget-private metadata.
- The HTTP server keeps env-only deployment compatibility when no standalone
  config exists. An existing malformed optional config and partial TURN
  configuration fail closed.
- These source-level contracts do not themselves establish a live outcome;
  post-merge installed/service checks are recorded separately below and in the
  active iteration.

## Current source MCP surface

Model-visible read-only tools:

1. `observe_printer`, requiring `overview`, `progress`, `thermals`, `heads`,
   `jobs`, `job_history`, `queue`, `fans`, or `bed_mesh`
2. `open_printer_camera`

App-only read-only tools:

1. `refresh_printer_observation`
2. `show_u1_status` (legacy alias)
3. `get_u1_status` (legacy alias)
4. `get_u1_camera_frame`
5. `open_u1_camera_stream`
6. `answer_u1_camera_stream`
7. `add_u1_camera_ice_candidates`
8. `close_u1_camera_stream`

There is no upload, start, pause, resume, cancel, G-code, generic proxy,
Control, or Admin tool in the runtime. Preparation and authorized-start skills
remain procedural guidance; they are not runtime authority.

The current source reports runtime `0.3.2`, tool schema `6`, observation widget
`observation-v4`, and camera widget `camera-v5`. `show_u1_status` and
`get_u1_status` are superseded model intents and survive only as app-only
compatibility aliases. Frozen status-v4/status-v3 and camera-v3/v2/v1 resources
remain byte-identical for retained tasks. The installed plugin retains the
schema-5 enum without `job_history`, and observation-v2/camera-v4 until a
separately authorized rollout. Tool counts remain two-visible/eight-app-only.
Historical schema-4/camera-v3 records below describe
earlier deployments, not the current plugin.

## Packaging and onboarding boundary

- Personal HTTP lifecycle is implemented by `scripts/u1_service.py`: stage a
  clean committed source, dry-run/install one versioned release, report status,
  start/stop/restart the two allowlisted services, and rollback by snapshot ID.
  The default owner-only state root is `~/Library/Application Support/U1 Print
  Studio/service`. Releases include a copied `bin/bun`, bundled HTTP entry,
  exact assets, empty bunfig, and hash/version manifest. The original Bun path
  can change without removing the release copy. Explicit private env is
  preserved; ambient dotenv/bunfig loading and relative auth/config paths are
  rejected before service replacement. See `plugins/u1-print-studio/PACKAGING.md`
  for exact CLI syntax. This personal adapter does not establish public
  distribution or Mac boot/login/sleep acceptance. Post-merge local rollout
  evidence remains a separate layer from these source fixtures.
- Normal users do not need Tailscale, MagicDNS, public DNS, manual OAuth,
  environment-file editing, or Bun.
- `plugins/u1-print-studio/.mcp.release.json` starts
  `./app/runtime/u1-print-studio mcp`.
- `plugins/u1-print-studio/.mcp.json` remains a Bun and env-file source
  adapter for repository development only.
- The owner-only schema-2 config is the standalone path for optional explicit
  STUN because the packaged runtime does not load the repository `.env`.
- Marketplace, Homebrew, and npm are future delivery adapters. This slice does
  not claim installation, upgrades, rollback, signing, notarization, or
  cross-platform acceptance.
- The current printer adapter still invokes the platform `curl` executable
  with a fixed route and argument allowlist. Replacing that platform dependency
  remains an explicit runtime-hardening question.
- Tailscale Serve/Funnel, personal OAuth, and the exact
  `/media/camera.webrtc` adapter remain optional developer compatibility
  paths, never normal-user requirements.

## Capability state

### Orca Preparation

- Upstream OrcaSlicer `2.4.2` and Snapmaker Orca `2.3.5` were observed on
  macOS; the first supported backend remains unselected.
- One user-authorized Snapmaker Orca U1 PETG pilot and two PLA repetitions are
  recorded in `docs/logs/`. Those runs do not establish a reusable
  preparation runtime.
- Model/project intake, profile resolution, slicing, artifact validation,
  review bundles, and prepared-job manifests remain unimplemented product code.

### Preparation-to-operations handoff

- The prepared-artifact/manifest schema is not defined.
- Target compatibility, upload ownership, start ownership, and
  printer-job/session correlation remain open.

### Printer Operations

- The read-only U1 observation, focused projection, snapshot, PNG, and camera
  signaling slice is implemented.
- One in-process observation store preserves freshness, connection epochs, and
  stale last-reachable values across explicit, due, coalesced refreshes. Plain
  presentation reads after initial acquisition do not contact the printer;
  a cold `current()` still bootstraps one acquisition on demand.
- Persistent subscription monitoring, process-restart persistence, durable
  history, notifications, recommendations, and control are not implemented.
- Jobs history, queue, fans, bed mesh, cavity, filament material/color, and
  sensor mappings remain unknown until separately evidenced against live
  read-only data.

## Acceptance state

### Static/software

- TypeScript checks pass.
- Before integration, 101 tests with 594 assertions passed across the prior camera,
  security, packaging, and dashboard boundaries plus exact two-visible/eight-
  app-only tool visibility, view-enum closure, selected-module projection,
  explicit-refresh coalescing, stale retention, provenance, and current/frozen
  resource compatibility.
- The source stdio bundle emits `stdio.js` plus current observation/camera and
  frozen legacy status/camera widget assets. Runtime, tool, observation, and
  current source camera versions are `0.3.2`, `6`, `observation-v4`, and `camera-v5`.
- Earlier local browser fixture review at a roughly 589 by 844 viewport accepted the
  focused Progress, Thermals, Heads, and separate Camera presentations. Captures
  were not added to the repository. That review predates decision 0023 and
  does not accept the present polish. Decision 0023/0024 isolated headless
  visual gates now pass; actual mobile-host rendering remains unaccepted.
- PR27 adds regressions for exclusive standalone-camera guidance, fail-closed
  stale-host behavior, plugin starter prompts, and full host-process reload.
- The macOS arm64 standalone runtime builds, verifies under an ad-hoc local
  signature, prints help, writes a schema-2 `0600` config, preserves explicit
  STUN on setup rewrite, and passes `doctor --offline` without contacting
  hardware. Malformed ICE URLs and partial TURN configuration fail closed.
- Current Personal Marketplace staging and installation passed on this macOS
  arm64 machine as `0.2.0+codex.20260831033612` from PR28. A fresh independent
  MCP client verifies exactly two model tools, eight app-only helpers, and all
  eight resource hashes. This is installed-runtime evidence, not mounted-host,
  mobile, or real multi-viewer fan-out acceptance.

The active iteration's `VALIDATION.md` is authoritative for exact commands
and final repository-check results.

### Protocol/simulator

- Tests use in-memory MCP transports, loopback HTTP fixtures, and fake printer
  signaling. They prove contract behavior, not public routing, a TURN
  allocation, a real printer, or a mounted host.
- Earlier repository evidence records real read-only Moonraker and H264
  observations. It is not evidence for this newly composed local connector.

### Physical printer

- Earlier PR28/PR29 post-repair bounded read-only checks returned reachable progress and
  thermals with one shared observation version/source time. Cavity remained
  unknown. One valid JPEG snapshot returned without activation, live video, or
  printer control. This is telemetry/snapshot evidence, not print-quality,
  physical safety, or mounted rendering acceptance.
- Earlier post-merge read-only validation contacted the configured printer for status,
  one JPEG, and bounded H264 offers. No upload, start, pause, resume, cancel,
  G-code, or other printer-control action ran.
- Earlier authorized print and camera observations remain historical evidence
  in their dated logs and do not prove this slice.

### User outcome

- The current installed plugin carries schema 5/observation-v2/camera-v4.
  Earlier host attempts retained a stale descriptor and substituted a status
  card; the new installed descriptor check is not mounted-widget acceptance.
- The focused Progress, Thermals, Heads, and Camera layouts passed local browser
  fixture review only. A new mounted task, remaining live domain mappings, overview,
  mobile behavior, and the user's quick-comprehension feedback loop remain
  unverified outcomes.

## Open risks and F0 questions

- Distribution targets, Developer ID signing, notarization, checksums, upgrade,
  rollback, and cross-platform packaging are unresolved.
- The private repository has no license file; license selection and
  third-party notice review block any claim or publication of an open-source
  distribution.
- The system-`curl` dependency and macOS local-network permission behavior
  need a dedicated portability decision.
- Native hosted-widget WebRTC rendering, FPS, UI-triggered Close, PiP,
  fullscreen, and fallback need fresh visual host evidence. Server-side open
  and close now pass against the real read-only camera path.
- Creating a new conversation does not refresh an MCP process retained by an
  already-running desktop host. Current camera acceptance requires fully quitting
  and relaunching that host; procedural guidance now fails closed instead of
  substituting a status card when `open_printer_camera` is absent.
- No TURN REST service URLs or shared secret were supplied. Reliable remote
  media remains blocked on external provisioning plus observed allocation and
  mounted playback. Explicit STUN is only a compatibility step and discloses
  peer network metadata to its provider.
- The deployed route uses tailnet-only Serve 8447 to loopback 8789; Funnel is
  still enabled only on 443 and existing handlers were preserved.
- The first Orca backend and the prepared-job/session handoff remain open.
- Bounded read-only mappings now exist for cavity, filament material/color and
  sensors, jobs/history, queue, fans/purifier, and bed mesh. Their reported
  facts remain telemetry evidence, not sensor-accuracy, printer-health or
  physical-safety proof.
- The compact Overview is implemented in source from the accepted focused
  projections; deployment, a fresh mounted task and the user's ten-second
  comprehension gate remain open.
- Subscription transport, process-restart persistence, durable history,
  notification destination, and remote identity/distribution boundaries remain
  open. The implemented store is explicit-refresh application state, not a
  resident monitor.
- A browser peer connection may receive network candidates in SDP as required
  for media; the prohibited behavior is direct iframe URL fetching or
  signaling, not the negotiated read-only WebRTC media path preserved by
  decision 0015.

## Next action

Decision 0025's job split passes independent validation and code/visual review.
Deliver a new PR and merge the approved source under the user's explicit
merge-as-we-go instruction. Source is `0.3.2`/schema `6`/observation-v4; the
still-installed `0.3.1` release is not updated by source delivery or merge.
No rollout, service restart, plugin installation or printer access is included.
The following paragraph preserves completed deployment evidence, not
instructions to repeat it.

PR30 `48a106d` is merged and its paired HTTP-service rollout independently
accepted for health, exact directory/focused assets, access boundaries and
private-state preservation. Retain the local rollback snapshot; no rollback
was needed. The personal plugin was not part of this rollout. Next obtain the
user's actual directory and focused-widget visual feedback; mounted iPhone snapshot/live/
fallback/fullscreen/PiP remain separate gates, not consequences of static HTTP
success. Preserve OAuth state, Serve/Funnel routes, and the canonical checkout's
unrelated dirty documentation. PR28/PR29 persistence delivery is historical;
Mac login/power, remaining live mappings, two-viewer fan-out, mobile ICE, and
overview composition are not implicitly authorized by this deployment.
