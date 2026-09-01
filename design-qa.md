# U1 focused-widget presentation QA — 2026-08-31

## 2026-09-01 Svelte Bed Mesh private lab foundation

final result: author corrections pass; formal and independent renewal required

Decision 0032 adds one exact private `/dashboard/lab/bed_mesh` fixture route
without replacing `/dashboard/bed_mesh` or adding a dashboard-directory/MCP
entry. Public HTTP returns 404. The candidate uses the established white card,
system type, restrained outline/shadow, local Lucide icons, information above
actions and exact 44-pixel controls. One shared 4:3 `ChartFrame` owns both modes;
feedback is a timed in-chart overlay and no instruction paragraph changes flow.

Real Chrome captured the actual private-handler response in 2D and 3D at 320,
390, 590 and 720 CSS pixels. Geometry assertions compare x, y, width and height
before/after each switch within 0.1 CSS pixel, enforce 4:3, and check no
horizontal overflow, console error or nonlocal request. The paired reference
comparison confirms the candidate fixes the reported defects: the 3D surface is
visibly colored and shaped rather than an almost blank plane, and the 2D/3D card
rhythm no longer jumps. The 2D map retains maximum Y above minimum Y and shares
the 3D fixture's exact range and palette. Fixture images and the combined
comparison remain ignored local test artifacts; private reference files are not
committed.

This pass is static/component/private-handler/real-browser evidence for the
synthetic lab only. The candidate was not deployed. Production
`/dashboard/bed_mesh`, MCP-host mounting, live reported data, touch/orbit
behavior on the user's phone and running services were not changed or accepted.
A later focused production cutover requires renewed exact review, compatibility
evidence and guarded rollout.

Independent review of exact candidate `7aef4b5` supersedes the earlier author
pass. Although 2D/3D geometry stayed equal, the 3D surface occupied only a thin
central band and its sprite-based XYZ/value labels rendered at effectively 3–6
pixels at phone widths and remained too small on larger fixtures. Renewal must
show a materially filled surface and measured 12-pixel-or-larger stable HTML
labels at all four frozen widths; screenshots and canvas visibility alone do
not close this block.

The renewed author candidate replaces sprites with nine stable HTML axis/bound
labels. Real Chrome through the actual private handler now measures every label
at 12 CSS pixels, visible and inside the shared frame with no pairwise overlap,
at 320, 390, 590 and 720 pixels. The surface derived from all fixture points
covers respectively 91.9--92.5% of frame width and 53.4--53.7% of frame height;
the full XYZ box/grid remains visible, and the 2D/3D frame DOMRects remain exact
matches. The original blocked phone reference and renewed 390-pixel capture
were inspected together, with 320- and 720-pixel captures also checked for end-
point readability. This closes the author correction only. Exact-candidate
independent visual review, user-device review and any production cutover remain
pending.

Formal review of exact candidate `a6363fd` also blocked the component bridge's
profile allowlist. The corrected author candidate now applies the adapter's
Unicode letter/number plus space/underscore/dot/hyphen rule and rejects path,
URL, bidi, markup, dot/dotdot and control adversaries. This correction does not
alter the measured visual result; renewed formal and independent exact-
candidate reviews remain pending.

## E compact Overview design frozen: implementation/visual acceptance pending

final result: blocked

Decision 0021's completion addendum and OBS-015 select one compact white
headline card rather than a status-only shortcut or eight embedded focused
cards. Explicit Overview demand composes Progress, Thermals, Heads, Current Job,
Job History, Queue, Fans and Bed Mesh while preserving each tile's own state,
time, freshness and reason. Two columns collapse to one; the header printer
state/time is main-status-only and one 44-pixel Refresh stays at the bottom.

The structured Overview module is itself privacy-minimized; rendering is not the
privacy boundary. It excludes filenames, project/model identity, IDs, raw rows,
history-total claims, Queue rows, mesh samples/profile, camera/media and runtime
details. Complete/partial/none means data coverage only, not overall health,
safety or freshness. Known empty/inactive counts as available coverage.

No E implementation screenshot, matched viewport/state comparison, browser
interaction, keyboard result, console inspection, deployment or live-printer
evidence exists. When source exists, capture at 320/390/720 pixels with complete,
partial and none coverage; mixed fresh/stale/empty/unsupported/unavailable tiles;
long localized labels; and zero/nonzero headline values. Verify no horizontal
overflow, clipped reason/time, hidden private identity, nested full cards, giant
map, decorative chart/surface, tile actions or false overall verdict. Confirm
visible focus and the single bottom Refresh. Source/deployment checks cannot turn
this result into a visual pass.

## D Current Job and real History deployed: visual acceptance unverified

final result: blocked

Decision 0025's addendum/OBS-014 retain the existing white focused-card system,
not a new visual direction. Current Job uses contextual file identity so a
persisted filename cannot look active: Printing/Paused, Loaded file, Last
reported job or Reported file. State, storage, duration, filament and byte facts
stay separately labeled. Job History uses `Latest jobs returned`, at most 20
rows in returned order, and page count only. Each row shows safe basename,
normalized status and reported time/duration/filament without IDs or actions.
Each card's own observation/freshness is above exactly one bottom Refresh.

PR51 exact head `30f1c7bb407d08d19d390acf2b5704a30eff010f` passed formal and
independent approval; exact release
`20260831-23f07e3-pr51-resume-20260831T191106-be85c4` is deployed to BOTH
explicitly restarted services. Tailnet index, Current Job and Job History return
200. One sanitized read of each card confirms known/fresh bounded semantics.
This is deployed-service and telemetry evidence, not rendered presentation
evidence.

No D implementation screenshot, matched viewport/state comparison, browser
interaction, keyboard result or console inspection exists. Source fixtures or
historical unimplemented-widget captures cannot accept changed assets. Typography,
wrapping, row density, spacing, contrast, icon fidelity, focus and content remain
visually unverified.

When available, capture both cards at 320/390/720 pixels: Current printing,
paused, standby-empty, persisted terminal, partial, stale, unsupported and
unavailable; History zero/one/20 rows, long safe names, every status, unknown
future status, null end, partial, stale, unsupported and unavailable. Verify no
horizontal overflow, false active/total/empty claims, raw/private fields, charts,
pagination or row actions; confirm 44-pixel bottom Refresh and visible focus.
Reviewed deployment/data checks precede the user's visual review but cannot turn
this result into a visual pass.

## C Fans & Chamber deployed: visual acceptance unverified

final result: blocked

Decision 0029/OBS-013 adapt the delivered white focused cards without a new
visual direction. Thermals gains a compact Cavity actual row with independent
time/freshness; Fans & Air uses compact grouped lists for four part-cooling fans,
Cavity fan and detected purifier exhaust/inner facts. Percent/RPM remain labeled
text, not decorative gauges or inferred health. Information stays above one
bottom Refresh action.

PR49 exact head `c14e92cfc655d0b7a6e7d0138650d7937789d7d1` was formally
and independently approved; exact release
`20260831-3ab4ed7-pr49-resume-20260831T182603-74d978` is deployed to BOTH
explicitly restarted services. Tailnet index, Fans and Thermals return 200; one
Fans and one Thermals POST confirm bounded known/fresh data semantics. This is
deployment and telemetry evidence, not rendered presentation evidence.

No implementation screenshot, matched viewport/state comparison, browser
interaction, keyboard result or console inspection exists for this rollout.
Historical widget captures do not accept changed Thermals/Fans assets.
Typography/wrapping, spacing/layout, color/contrast, icon
fidelity and content remain visually unverified.

When available, capture both cards at 320/390/720 pixels with mixed nonzero,
zero and null fan readings; purifier detected/not-detected; Cavity known/stale;
partial/unsupported/unavailable states. Check no overflow, honest units/copy,
independent times, 44-pixel Refresh/focus and absence of controls/health claims.
Standing reviewed merge/deploy/BOTH-restart/verify precedes the user's visual
review but never turns source or deployed-data checks into a visual pass.

## B Queue integration deployed: visual acceptance unverified

final result: blocked

Decision 0029/OBS-012 reuse the delivered white focused-card language rather
than adding a new visual direction. Target: top title/independent receipt,
freshness and queue-state/count summary; bounded ordered filename/Added/observed
waiting rows; explicit omission and empty/stale/failure states; bottom Refresh.
Author and independent software checks pass after formal review found
one singular omission-summary grammar defect. The minimal two-file correction
passes 44 focused tests/1,565 assertions and the full author gates. Renewed
independent checks cover 1/2/900 summaries and find no issue. Full evidence: 223 app
tests/3,150 assertions, 21 lifecycle, 22 shipping, 15 focused tests/7,049
assertions, TypeScript/diff checks, three bundles/code signing and six exact
emitted assets. No screenshot,
matched viewport/state comparison, keyboard interaction or console inspection
exists for the new Queue widget. Fresh allowed-browser discovery is unavailable.
Historical Heads/Bed Mesh/other-widget evidence does not accept changed Queue
assets. Typography/wrapping, spacing/layout, rendered contrast, icon fidelity
and copy/content remain visually unverified.

PR47 is merged and exact release
`20260831-6d76f9a-pr47-20260831T172710-645971` is deployed to BOTH explicitly
restarted services; health/integrity/static/security checks pass. The user has
the live Queue link. Deployment and scoped data checks do not supply a rendered
comparison, keyboard/device evidence or a visual pass; this result stays blocked.
Independent live evidence is bounded to one known/fresh paused-empty Queue read
and exact served-widget VM semantics. It confirms data behavior, not rendered
layout, interaction or user acceptance.

When browser access exists, capture 320/390/720-pixel layouts for known empty,
one and 100 displayed rows, long safe basenames, truncation, independently stale
and unavailable/unsupported states. Check complete readable names, no horizontal
overflow, omission clarity, focus/44-pixel Refresh and truthful waiting copy.
The user authorizes reviewed merge → deploy → restart BOTH services → verify
before their visual review; this changes ordering, never turns this report into
a visual/device pass.

## Current Heads reference refinement: visual acceptance unverified

final result: blocked

Source visual truth is the latest user-selected Heads attachment, opened by the
design role: 1554 × 1012 pixels, private source path intentionally outside Git.
Decision 0029's addendum specifies the adapted target: four softly tinted actual-
color tool cards inside white, exact swatch/hex/Copy, unchanged real state and
independent freshness. Bottom Refresh intentionally supersedes its top placement
in the reference; white filament does not inherit the image's amber active wash.

Implementation screenshot/path, CSS viewport, device density and normalization:
unavailable. No same-state full-view or focused-region comparison, browser
interaction or console inspection has occurred. Fresh allowed-browser discovery
returns none. All five fidelity surfaces remain unverified: typography/wrapping,
spacing/responsive rhythm, colors/contrast, icon/data-swatch fidelity, and
copy/content. Existing system fonts and Feather icons are retained; no generated
image is required for native data colors. Source fixtures are not visual proof.
The frozen 0.4.2/observation-v8 source has author test evidence recorded in
VALIDATION; it does not alter this visual disposition.
PR45 is now merged and exact release
`20260831-90d9f9d-pr45-20260831T152746-190348` is deployed. BOTH services were
explicitly restarted and pass health/integrity/static/security checks. The user
has the live Heads review link. This supplies no screenshot or actual-device
native clipboard evidence; this report remains blocked, not passed.
Independent one-shot Heads acquisition and 35 exact served-widget VM assertions
pass; matching source behavior and calculated contrast are not rendered QA.

When available, capture the actual Heads view at 320/390/720 and four-column
widths with valid white/black/brown colors, unknown/invalid color, mixed real
states and independently stale material. Compare matching source/content
regions, check the gentle wash and opaque text, Copy keyboard/focus/success/
denial/unavailable states, bottom Refresh, overflow and console errors. No
visual mismatch or correction history is invented before captures exist.

The user's standing reviewed merge → exact-build deploy → restart BOTH services
→ verify order remains in effect for their visual review. This overrides
predeployment visual ordering only; no source or deployed-service pass converts
this report into rendered/actual-device acceptance.

## Current F Bed Mesh surface: visual acceptance unverified

final result: blocked

Decision 0030 selects the supplied Fluidd Bed Mesh screenshot's orbitable XYZ
surface inside the existing white card, not its dark dashboard/profile controls.
The reference was opened by the design role; private attachments are not
committed. Source target is 0.4.1/schema 8/observation-v7/camera-v8 with seventeen
resources. The historical 2D Bed Mesh and release A reviews below do not accept
these changed assets.

There is no rendered F implementation screenshot, matched viewport/state,
density-normalized comparison, console inspection or browser interaction
evidence. The coordinator's fresh in-app selection failed and browser discovery
returned none. Full-view and focused-region visual comparisons are therefore
unavailable. Software production-script/VM fixtures cannot establish fonts,
spacing/layout, colors/contrast, chart legibility/asset fidelity or copy/wrapping
as rendered; all five fidelity surfaces remain visually unverified.

When an allowed browser is available, capture the actual 3D and 2D white card
at 320/390/720 px with active, flat, stale, inactive and unavailable states.
Compare the adapted target at matching viewport/state and record image/CSS
dimensions and density. Check XYZ/height legend and exaggeration, unclipped
surface, bottom controls, pointer/focused-keyboard orbit, Home/Reset, mode and
height changes, fallback, focus, narrow wrapping and console errors. No rendered
F finding or visual pass is asserted before those captures exist.

The user authorizes merge → deploy → explicitly restart BOTH services → verify
for their visual review. This overrides predeployment visual-QA ordering only;
the unavailable browser does not re-block that sequence or convert this result
to passed. Exact-SHA source approval, shipping guards, installed-byte and scoped
behavior verification remain separate requirements. PR43 is now merged and
deployed as `20260831-92a62c0-pr43-20260831T150042-2e7c64`; both services were
restarted and passed operator health/integrity/static/security checks. This
does not supply rendered-browser evidence. Actual-device/visual acceptance
remains unverified, and this report remains blocked, not passed.

## Release A: deployed white foundation, visual acceptance still unverified

final result: blocked

Decision 0029 and the active iteration's `WIDGET_TRACKS.md` define the current
reference: white cards and directory, camera state/measured FPS/frame time in
the header outside genuine media, and continuous reported-percent progress.
They supersede the historical camera-bottom and segmented-progress reviews
below. No historical pass accepts the new source or assets.

The coordinator's allowed-browser discovery found no available in-app or
Chrome client. Isolated headless-browser permission has been requested but
not granted. No current reference-to-render comparison, screenshot, browser
interaction result, accessibility pass, or visual approval is claimed.
Source inspection and deterministic DOM/media fixtures are software evidence
only; they do not substitute for this visual gate.

Resume with an allowed browser, or explicit permission for an isolated
headless browser, against the frozen release-A source. Capture the selected
reference and actual widgets at matching state and viewport, including
320/390/720 pixels, white-on-dark-host, unknown/stale/loading/failure states,
and snapshot/live/Close/PiP/fullscreen plus keyboard/focus behavior. Keep
private reference attachments and real camera evidence outside Git. Then
record a new scoped disposition; exact-SHA independent review, shipping,
deployed behavior, and actual-device acceptance remain separate gates.

## Historical dispositions — not acceptance of current release A

## Camera bottom status and single frame observer — independent review

Scoped source and rendered review: passed. The latest CAM-008 exception moves
camera state/FPS/time bottom-left while preserving bottom-right controls;
earlier top-status camera reviews below are historical placements. Observation
cards retain their information-above/actions-below structure.

1. **Bottom layout — passed.** Product Design audit guidance informed opening
   all six final native-media captures. Live 320/dark wraps its complete pill
   above the right-aligned controls; 390/dark and 720/dark fit both groups in
   one row. Snapshot and rejection 320/dark remain readable; rejection feedback
   stays above and does not overlap either bottom group. The controls retain
   their 44-pixel targets, with no visible clipping or horizontal overflow.
2. **Repeated setup — passed.** The reviewer compared the native 390-pixel
   before/after images and actual callback report: repeated same-peer setup
   previously duplicated frame counts and removed FPS while video continued;
   the fixed capture retains 31 FPS with unique native presented-frame counts.
   This confirms a reproducible product defect, not its occurrence on the
   user's inaccessible device. Canvas media was local; no printer or RTC
   network was involved and frame counters/timestamps were not fabricated.
3. **Regression boundary — passed.** Independent camera/app checks passed
   46 tests and 365 assertions. Prior callbacks and decoded intervals are
   cancelled; generation checks reject queued callbacks from older same-peer
   observers. Frame measurement, stale expiry, snapshot clocks, display
   rejection and signaling authority retain their existing boundaries.

Reviewed camera SHA-256:
`1f706d665a5f811793160b2afb2cd620bb381903673bc5047e159c1948ba6cac`.
Iteration `VALIDATION.md` owns full native-browser, fixture and packaging
evidence. This accepts source and isolated browser behavior, not deployment,
actual phone playback, the user's FPS symptom resolution or physical safety.

## Live-only measured FPS — independent source and rendered review

Scoped result: passed against decision 0023's latest FPS supersession and
CAM-008. Product Design audit guidance informed opening all five final
synthetic captures; this does not reinstate hidden network diagnostics.

1. **Live information — passed.** Presented-counter 29 FPS at 320/dark and
   30 FPS at 390/light, plus decoded-counter 30 FPS at 720/dark, keep the full
   state/rate/time pill readable above unchanged bottom display/live controls.
2. **Non-live information — passed.** Snapshot 320/dark and fallback 320/light
   show the accepted snapshot time without FPS. No clipping or overlap with
   the 44-pixel controls was visible in any reviewed capture.
3. **Truthful measurement — passed.** The reviewer independently ran the
   camera/app suites: 44 tests and 359 assertions passed. Presented and decoded
   counter families no longer mix within one measurement window; missing or
   invalid metadata cannot invent a spike. Startup, stale expiry, pause,
   close, peer replacement and the existing stalled-frame fallback are covered.
   An additional isolated VM probe confirmed missing presented metadata does
   not substitute an unrelated decoded count. No real camera was accessed.

Reviewed camera SHA-256:
`375bcbefbee47e1d01a958ad2441594e66b95ff65aa55242d5b058709dcc6182`.
The validator separately records five actual captures and twelve browser
behavior checks, with zero unexpected requests/errors. Iteration
`VALIDATION.md` owns the complete repository and packaging evidence.
This accepts scoped source and synthetic rendering, not deployed FPS,
physical camera rate, phone playback, PiP support or full accessibility.

## Reported Bed Mesh and shipping workflow — independent review

Scoped result: passed against decisions 0027 and 0028, with no unresolved
blocking findings. Product Design audit guidance informed actual inspection
of all nine final Bed Mesh captures, not acceptance from source alone.

1. **Reported grid — passed.** Normal 390/light, flat 320/light and hostile-
   profile 720/dark captures show compact rectangular data, readable bounds
   and minimum/maximum/range. Flat data stays uniformly colored; an unsafe
   profile is omitted without losing valid readings. Extreme 320/dark axes
   now fit; compact visible labels retain precise accessible bounds.
2. **Freshness and absence — passed.** Stale 720/dark, inactive 390/dark,
   retained-inactive 320/dark, unsupported 320/light and malformed 390/light
   remain distinguishable. Missing/failed data does not invent a flat grid or
   observation time. Information and errors stay above the single bottom
   Refresh action. No clipping was visible in these nine images.
3. **Acquisition and isolation — passed.** Independent reviewer execution of
   the adapter/store/projection/widget suites passed 51 tests and 1,303
   assertions. Review covered fixed bounded GET, whole-matrix validation,
   own-domain freshness, retained inactive data, races and selected-view-only
   acquisition. Camera and frozen resources remain outside the change.
4. **Shipping workflow — passed in isolation.** All 21 script fixtures pass.
   Three additional mocked CLI forward scenarios cover authorized execution,
   read-only plan and missing reviewed identity, with no real GitHub/service/
   HTTP operation. The skill requires exact independent review and fresh
   full-sequence authority; missing authority stops before execution. The
   reviewer-found pinned-runtime PATH mismatch is fixed by checking that bare
   `bun` resolves to the chosen executable. Guards, exact merged-tree staging,
   both-service verification and single captured-snapshot rollback were reviewed.

Reviewed SHA-256: widget
`23cf86a83143ba7480521baf12c0e05ee7777faea350de29cde055fd63ffbce5`;
shipping script
`49448de3ca32ba52917ec900d478901e2ec3590c887fa5cabddf4e67c9254978`;
shipping skill
`b1d7547e5ccb46f1014be28b351883d5ec45deb2eb3371771e7926c6c9e557e8`.
The validator's final browser report is
`c7c6409a6bd3c20f82c8c1033faee0991f806381dc5bc99e7dcd6b2158c88908`;
iteration `VALIDATION.md` records the complete software/protocol gates.
This accepts source and scoped synthetic rendering, not a new rollout,
real-printer mesh accuracy, phone-mounted behavior or full accessibility.
Queue work and rejected progress styling remain excluded and unresolved.

## Current Job and Job History — independent rendered review

Scoped result: passed against decision 0025, with no blocking source or visual
findings. Product Design review guidance informed inspection of all six actual
captures in the current `jobs-captures` collection, not earlier widget images.

1. **Current Job — passed.** The 390/light known-job card contains filename and
   storage only; the 320/dark missing-identity card explicitly says identity is
   unknown. Neither has a history panel or claims the printer is idle.
2. **Job History — passed.** The 390/light and 720/dark cards show the separate
   title, unavailable observation time and explicit not-implemented message.
   No current filename, fabricated history row or known-empty success appears.
   Both card types retain information above content and a single 44-pixel
   Refresh action below, with no clipping or removed boilerplate.
3. **Directory — passed.** The 320/light and 720/dark captures show nine
   readable entries, including adjacent Current Job and Job History with
   distinct Partial/Not implemented labels. The validator's actual-browser
   checks separately verify tab order, visible focus and history navigation.

The reviewer independently ran the projection/widget suites: 30 tests and
1,085 assertions passed, including stale/unknown facts, selected-view refresh,
escaping and existing layer/bridge behavior. Camera and frozen legacy assets
are unchanged from `47bfd37`. The validator records nine additional cases,
30 route checks and zero acquisition, external-request or error counters in
the private report; iteration `VALIDATION.md` owns the full validation record.

Reviewed SHA-256: observation HTML
`96bc93a05960f8a9af1923d93ceda0db0a33814eac5a3ef1a5e8e5e42554b572`;
directory HTML
`267acf63214c9ab23df92007a3fd3667b247d66f7d76fcb3c9116c1ed75acbc2`;
projection source
`2ec8a9b17c76d7d4d7d0ec6e3a995408a35c4855076fed173d0e124abbe63d7e`.
This accepts source and scoped synthetic rendering, not implemented history,
deployment, actual mobile/MCP-host behavior or full accessibility compliance.

## Current placement: information above, actions below

Scoped result: passed, with no blocking findings. The user's latest rule and
decision 0023's supersession govern this review. Earlier observation-footer
timestamps and bottom-left camera information in the records below are
historical accepted placements, now superseded rather than rules to restore.
Product Design review guidance informed inspection of all ten current captures.

1. **Observation information and actions — passed.** Progress, Heads and
   Thermals captures at 320/390 pixels show observation time under the title
   and only Refresh at the bottom. The 720-pixel stale view and 320-pixel
   refresh-failure view retain readable top feedback without clipping. Domain
   content and segmented-layer rendering remain intact; no removed permission
   or provenance boilerplate returns.
2. **Failed loading — passed.** The actual deadline capture keeps explanatory
   text above bottom Retry and invents no observation time. Separate browser
   checks cover all eight shared observation layouts, Retry recovery, and
   preservation of pending state/top errors during segmented regrouping.
3. **Camera information stack — passed.** Snapshot/live information sits at
   the top, display rejection flows below it, and unavailable text is top-aligned
   with only the decorative camera icon centered. Bottom-right display/live
   controls remain distinct, full-sized and unobstructed. The validator also
   checks narrow rejection stacking and loading without actionable controls.

The reviewer independently passed 71 focused tests/1,576 assertions and
verified identical camera JavaScript and layer-calculation bytes against the
prior source. Exact reviewed observation/camera HTML hashes are
`3fe2bb3460ddb8e75ddb19b363b396a859c64822601db9b2d6781b8cce6e4f2b` and
`0a66e1cc0c75e6769655d60cf92bc50ba80b2fc98ebb2ca6f23559fd07e0a483`.
The external `info-layout-captures` collection and iteration `VALIDATION.md`
record exact synthetic-browser evidence. This accepts source and scoped rendered
layout, not deployment, actual mobile-host/PiP, full accessibility compliance,
new printer mappings or physical/user acceptance.

## Camera bottom-right controls — independent rendered review

Scoped result: passed against decision 0023's latest placement refinement,
with no blocking findings. Product Design review guidance informed inspection
of all five current validator captures and the bounded DOM/CSS change.

1. **Snapshot at 320/390/720 pixels — passed.** PiP, Fullscreen and Go Live
   form one bottom-right cluster with unchanged icons and 44-pixel targets,
   separated by 8-pixel gaps. At 320 pixels the complete status/time stays left
   on the preceding line; the cluster neither shrinks nor wraps internally.
2. **Synthetic live at 390 pixels — passed.** Close occupies the final position
   beside the same display controls, with the live state/time retained left.
3. **Rejection at 320 pixels — passed.** Feedback occupies the freed top inset
   without touching the two-row bottom overlay or obscuring its controls.

The separate validator report confirms hidden unsupported controls and a full
missing-time label without overlap. Source review verifies unchanged button
identities, accessible names and DOM control order; the entire media script
is byte-identical to the prior reviewed source. The reviewer independently
passed 51 focused tests/556 assertions. This does not claim a new native-phone
PiP, keyboard/screen-reader audit, transport test or deployment acceptance.

External evidence remains under the logical `camera-controls-captures`
collection. Reviewed camera HTML SHA-256:
`c7691461c0500370f01d5d2a40bd88229045a3e9d1ad4b5a4b9f468ab233c526`.
The fixture uses synthetic images/video and substituted host/RTC behavior;
no real camera, printer or service was accessed. Earlier reviews remain below.

## Segmented layer progress — independent rendered review

Scoped result: passed against decision 0023's dated refinement, with no
blocking source or visual findings. Product Design review guidance informed
comparison of the user's continuous-bar reference with the rendered completed
card, followed by inspection of all twelve current validator screenshots.
The external screenshot crop and fixture outer padding/background differ;
pixel-identical screenshot framing is not claimed. The source diff preserves
the surrounding card layout and footer while replacing the strip itself.

1. **Grouped and completed progress — passed.** The 390-pixel light/dark and
   882-pixel dark captures retain title, state, percentage, layer/time caption
   and one bottom timestamp/refresh footer. The 14-pixel yellow/neutral blocks
   and 2-pixel gaps are distinct, including when every block is filled.
2. **Missing, zero and small totals — passed.** Missing layers use a neutral
   track with explicit unavailable text, not a zero observation. Zero retains
   empty blocks; the ten-layer case shows three filled and seven empty blocks.
3. **Fractional groups and narrow/wide reflow — passed.** Additional captures
   at 320/light and 720/dark show layer 126 of 461, a genuinely partly filled
   group, and an independently unchanged 67.4-percent headline. No clipped
   card text or overflow was found in the inspected images.

The reviewer independently ran 58 focused tests/1,441 assertions. Source
review verifies safe integer bins, single layer-progressbar semantics, hidden
decorative blocks, and bar-only regrouping. A missing media-query listener
could initially abort rendering; guarded modern/legacy registration and
fallback tests resolve that review finding. Validator behavior checks separately
cover pending refresh, retained errors/time, and no additional acquisition.

External evidence uses the logical `layer-captures` collection. Reviewed widget
SHA-256: `974153b569af5ba4c9ec4e69454c91f62acd1f5cb0bb23fd0d993e36ea074dfb`.
Final report SHA-256:
`4661992712cfc7bbf9c9506ede4be715ec339fbab1863e0a7fcd0848ef61996a`.
This is isolated synthetic-browser/source acceptance, not deployment, native
phone or screen-reader acceptance, real-printer evidence, or physical completion.
Earlier directory and focused-widget reviews remain unchanged below.

## Private widget directory — independent rendered review

Scoped result: passed against decision 0024, with no blocking visual findings.
The independent formal reviewer opened all six current screenshots captured by
the separate validator: 320, 390 and 720 CSS pixels, each in light and dark mode.
Product Design review guidance informed inspection of hierarchy, readability,
wrapping and interaction affordances; this is not a new redesign.

1. **Narrow directory, 320 pixels — passed in both themes.** The heading and
   release-coverage explanation fit without clipping. All eight whole-card
   links have readable titles, text labels and naturally wrapped descriptions.
   Partial/unimplemented entries remain visually openable; they do not imply
   live printer health or appear disabled.
2. **Phone-width directory, 390 pixels — passed in both themes.** The one-column
   rhythm and inset cards remain consistent. Heads & Filaments and the longer
   unavailable-domain descriptions fit without collisions or truncated copy.
3. **Wide directory, 720 pixels — passed in both themes.** Two columns preserve
   row-major reading order and clear whole-card link affordances. Spacing,
   rounded surfaces and muted secondary text match the existing visual system.

No timestamps, refresh controls, permission/provenance captions or fabricated
previews appear. Coverage labels use text, not color alone. Semantic anchors
and focus CSS were inspected; the validator separately records all-eight
keyboard order, first-link activation and zero overflow/acquisition.

Evidence remains outside Git under the logical `directory-captures` collection.
The reviewed HTML SHA-256 is
`1ffc53eefa9842d0741680f1e14d636bb8b2c84401a8382d8c222f39bc263d1b`;
the matching report SHA-256 is
`985905efc0ac9a4436a22f7220b5949d28c2a7951291a0621583c70cc4c40aa3`.
Capture conditions and representative fingerprints are in `VALIDATION.md`.
Focused destinations during keyboard activation were synthetic stubs. This
accepts rendered navigation only, not full accessibility, deployed routing,
iPhone behavior, real printer/camera reachability, missing mappings or the user's
final outcome. Existing focused-widget QA and its heater-state follow-up remain
unchanged below.

## Current gate: isolated headless rendered fixtures

Scoped result: passed. No actionable P0/P1/P2 findings remain in the inspected
rendered fixture presentation. This accepts the decision-0023 visual refinement
in isolated desktop Chrome, not a deployed widget, real camera, native iPhone
PiP, or an implemented printer-data domain.

The user explicitly authorized isolated headless-browser validation after the
connected-browser gate below was blocked. The independent validator captured
the production HTML in Chrome 152.0.7977.65 with synthetic observations and
clearly labeled synthetic JPEG/canvas video. This design reviewer opened those
captures and paired source/current comparison images; source tests alone were
not used as visual acceptance.

### Targets, normalization, and evidence locations

- Source visual truth: the supplied Heads and Filaments and Camera phone
  attachments, plus the explicit requested delta in decision 0023. Removing
  their header clutter is intentional, not a mismatch to restore.
- Source visual truth paths: external attachments kept outside Git, identified
  below by logical name and SHA-256. Both are 590 by 1280 pixels. Their original
  embedded CSS viewport, screenshot scaling, and device-pixel ratio are unknown.
- Heads comparison crop: source x=0, y=156, width=590, height=779. Camera crop:
  source x=0, y=605, width=590, height=445. These remove ChatGPT/phone chrome and
  the unrelated notification while retaining the old widget headers to show
  the requested change. Crops are scaled by 390/590 for visual comparison;
  this is not a claim of exact original CSS density.
- Implementation screenshot paths: external evidence directories named
  `captures-accepted` for final observation states, `captures-final` for the
  unchanged camera, and `design-comparisons` for paired images. Absolute
  temporary paths and private screenshots are deliberately not committed.
- Capture CSS widths: 320, 390, and 720; light and dark themes; extra thermal
  checks at 400 and 410. Device scale factor is 1, locale en-GB, timezone UTC.
  Final iframe height is fitted to content, not the initial 1000-pixel harness
  height. Example final images: Heads 390 by 534, live Camera 390 by 220.
- Heads fixture reproduces the four head identities, active T1, 220/220 and
  parked 30/0, 31/0, 32/0 temperatures. Timestamp is deliberately fixed fixture
  data, not the source phone time. Camera uses labeled synthetic artwork and
  media, not the private printer photograph; comparison accepts image framing,
  masks, overlays, and control legibility, not actual camera-image quality.
- Final observation asset SHA-256:
  `86cf5f4a4e6e29f8aa99cb14c947d20992b7b022c91c75f08642eea0a09837d0`.
  Camera asset remains
  `05634036e524693a2c9f9c0f817629968326175a22b98be85d3c28c484ee5e85`.

Representative evidence manifest (full manifests remain beside external
captures):

| Logical evidence | SHA-256 |
| --- | --- |
| Heads source attachment | `ca9d505c9e3a8799fbe0b1720dbb8a76a85d4659bdb2d5d7149fa261636d638e` |
| Camera source attachment | `0addbbdb31de6bacd82a90ec3c77fb4bf492330dc1a4ab9883df0d11ed150404` |
| heads-source-vs-current.png | `7121ed2b9329685aa4932ac16750cbe9dcbe1ce0cd65a402e347a54cdfa19406` |
| camera-source-vs-current.png | `078b120eeb6b929368b2150db3eb6745863127b887d647cc7f7d8020d678daac` |
| heads-fresh-390-light.png | `83c2173063b0bcdf05cf00df94f57c57bc2e0ac4928850cd58fa60ceee6b81b9` |
| jobs-fresh-320-light.png | `2524e4c3a7a0e2efbd6ff0ee88e4319513b65fbb98573b40bd80a368c0d20159` |
| thermals-fresh-390-light.png | `42d9d934d30d7612b0b5d71c9de9e71f93b999ece30c8359ae6c7181e6020212` |
| progress-stale-390-light.png | `c1c17de1c1d4a0c2b84285f9178fb86f9a3e6158ab82112be0273f8501cd96c9` |
| camera-fresh-390-light-live.png | `4066aff1f9ca0aa0740e1e9e23eaea5539f2b0889b05ca44968ef635e7be2b3c` |

### Full-view and focused comparisons

`heads-source-vs-current.png` and `camera-source-vs-current.png` put the source
and rendered implementation in each same comparison image. The heads comparison
preserves title, two-column phone/four-column wide layout, four physical
identities, yellow active marker, and unknown-material text while replacing
the clutter with one footer. Camera loses the redundant heading and network
details, gaining a short state/time overlay and display controls.

`heads-t1-focus.png` compares the first head cards at normalized width with
2x enlargement. `camera-overlay-focus.png` compares the old and new lower image
overlays at 2x enlargement. These checks made small labels, icon strokes,
rounded borders, and the requested debug-to-time replacement readable. The
different camera subject is a deliberate synthetic fixture, not a substituted
production asset or evidence of real printer video.

### Findings and comparison history

Initial headless inspection found three P2 issues; it did not pass immediately:

1. **P2, resolved: low-contrast active thermal values.**
   `thermals-fresh-390-light.png` initially displayed yellow numerals on white,
   approximately 1.89:1 contrast. The author changed numeric text to `--ink`
   while keeping yellow on the active rail and roundel. Same-state recaptures
   at phone and wide sizes show clear dark/light numerals. Approximate contrast
   is now 16.72:1 on white, with the appropriate light ink in dark mode.
2. **P2, resolved: internal vocabulary in Jobs.**
   `jobs-fresh-320-light.png` initially exposed bare `known` and an explanation
   about accepted normalization. The author changed these to `Current job`,
   `History not implemented`, and `Previous jobs aren't available in this view
   yet.` Same-width recapture verifies plain, unclipped copy without claiming
   history exists.
3. **P2, resolved: low-contrast footer warnings.**
   Stale/offline/refresh-failure text initially used red with approximately
   3.79:1 contrast on white. Final same-state light/dark captures and browser
   computed styles confirm light rgb(184,50,50) and dark rgb(255,133,133),
   approximately 5.93:1 and 7.02:1 against their card surfaces. The label still
   communicates state in text, independently of color.

Initial fixture screenshots also included blank space below cards because the
harness initialized its iframe at 1000 pixels. The validator corrected the
harness height and recaptured. That was a capture-normalization correction,
not a product-layout finding or an implementation fix.

**P3 follow-up, nonblocking:** the thermal bed row says `Unknown` for its heater
state beside valid actual/target values. `Heater state unknown` would clarify
which fact is missing. Cavity and other unmapped domains remain a separate
capability task; this pass does not convert them into working measurements.

### Five required fidelity surfaces

- **Fonts and typography:** title/body hierarchy, weights, line heights,
  tabular time, and head labels remain coherent in paired crops. Final numeric
  and warning contrasts are corrected. No clipped labels were found in the
  inspected phone/wide states. Source phone rasterization and exact font
  density are unknown, so pixel-identical antialiasing is not claimed.
- **Spacing and layout rhythm:** four head cards retain the selected layout;
  footer timestamp and 44-pixel refresh align below content. Thermal actual
  and target stay visible at 320/390 and the 400/410 breakpoint checks. Camera
  controls and longest missing-time overlay fit 320 pixels without overlap.
  Desktop rounded surfaces and mobile inset rhythm remain consistent.
- **Colors and tokens:** charcoal/white surfaces and yellow active markers
  remain consistent with the source. Live green versus fallback red is also
  text-labeled. Final warning and value contrast fixes preserve that hierarchy.
- **Image quality and asset fidelity:** camera mask/radius, overlay placement,
  icon legibility, and synthetic frame scaling are visually checked. Private
  source photographs are comparison references only; the fixture does not
  establish real JPEG sharpness, streaming compression, or physical visibility.
- **Copy and content:** no visible read-only/header boilerplate, transport/FPS
  debug, synthetic thermal traces, or mesh grids remain. Missing mappings say
  `Not implemented yet`; malformed loading has a finite error and Retry.
  Snapshot/live/fallback times occupy the image, with no separate camera footer.

### Rendered interaction and evidence boundaries

The validator's final observation report records 67 captures with no console
errors, external requests, or measured horizontal overflow. Camera records
cover snapshot/live/fallback at all three widths and both themes, missing time,
display rejection/coercion, and native fullscreen exit. Twelve synthetic
live-clock advance/stall-freeze checks and a native Chrome fullscreen check
pass; keyboard Tab reaches Refresh and Enter produces the next fixture result.
These tests use exact production HTML with a bounded synthetic host/transport.

No fixture acquires printer telemetry or real media. Host PiP is synthetic
request/response behavior; native iPhone picture-in-picture, actual ChatGPT
mounting, assistive-technology announcements, real mobile touch, service
deployment, and unmapped printer data remain unverified. A headless PASS does
not close those gates or erase the historical blocked checks below.

### Next implementation checklist

- Preserve the final reviewed assets and attach independent formal source
  review before changing PR delivery state.
- After separately authorized rollout, verify the actual phone's mounted
  card, camera timestamp/fallback behavior, fullscreen/PiP, and navigation.
- Implement missing printer-data domains through their own evidence boundary;
  do not interpret accepted empty-state presentation as data implementation.

## Historical connected-browser gate before headless authorization

## Current comparison target

- Source visual truth: the user-supplied phone screenshots of Heads and
  Filaments, snapshot/live Camera, and repeated Waiting cards, together with
  the requested footer/overlay changes in decision 0023. Attachments remain
  outside the repository; private camera images are not copied or committed.
- Source visual truth path: external conversation attachments, deliberately
  not persisted as repository paths.
- Source image dimensions: supplied phone captures are 590 by 1280 pixels;
  the exact embedded card CSS viewport and device scale are not established.
- Implementation: current `public/widget.html` and `public/camera-widget.html`.
- Implementation screenshot path: unavailable; no connected supported browser.
- Intended check viewports: 320, 390, and 720 CSS pixels wide. No implementation
  screenshot dimensions, device scale, or density normalization are claimed.
- States: all eight focused projections; missing, stale, offline and failed
  delivery; camera snapshot, connecting, fallback, live and display-mode exits.
- Primary interactions tested in a browser: none. VM tests are recorded in the
  active iteration and are not a rendered interaction check.
- Browser console errors checked: no; the browser was unavailable.

## Full-view and focused-region comparison

Blocked. The source screenshots were supplied in the conversation, but a
matching rendered implementation could not be captured. There is no valid
paired full-view or focused-region comparison, no normalized density match,
and no basis for claiming pixel fidelity or responsive polish.

## Findings

- [P1] Rendered acceptance unavailable.
  - Location: observation footer, narrow thermal/head layouts, camera status
    and display-mode controls.
  - Evidence: supported browser selection reported no available browser; the
    root's browser inventory was empty.
  - Impact: source tests cannot establish readable spacing, no overflow,
    touch/focus behavior, accessible announcements, or iPhone fullscreen/PiP.
  - Next check: capture the exact changed assets and compare with the supplied
    target at matching widths/states, then test the mounted phone host.

## Required fidelity surfaces

- Fonts and typography: rendered family/weight, wrapping, timestamp width and
  title hierarchy unverified.
- Spacing and layout rhythm: bottom-footers and image overlays specified by
  decision 0023; rendered balance and 320-pixel collisions unverified.
- Colors and tokens: existing tokens retained by design; contrast, fallback
  signaling and live status distinction not visually accepted.
- Image quality and asset fidelity: no new camera capture or implementation
  image inspected; retained JPEG and live-video behavior has separate software
  tests, not visual fidelity acceptance.
- Copy and content: independent production-script tests verify no repeated
  permission chrome and honest missing/unknown states; visual truncation and
  assistive-technology presentation remain unverified.

## Comparison history and implementation checklist

- Initial current pass: blocked before rendered comparison. No visual
  correction or post-fix screenshot is claimed.
- Capture matching light/dark states at phone and strip widths.
- Compare title/content/footer and camera-only image anatomy together with
  the supplied source; inspect keyboard/touch focus and overflow.
- Exercise snapshot load/failure, live-frame stall/fallback, fullscreen/PiP
  entry/rejection/exit and screen-reader announcements in the actual host.
- Keep unmapped queue/fan/mesh/cavity/filament/history domains explicit; no
  chart placeholders may be accepted as measured values.

Historical connected-browser result: blocked

## Historical status-card theme QA

- Source visual truth: external user attachment, `Screenshot 2026-08-26 at 11.40.27 AM.png` (not retained in the repository)
- Brand source: official Snapmaker U1 page and its served stylesheet, `https://www.snapmaker.com/snapmaker-u1`
- Implementation: private status dashboard `/dashboard?reload=6`
- Source pixels: 1532 x 700
- Intended implementation viewport: 1123 x 994 CSS pixels at device scale 1
- Implementation screenshot: unavailable because the configured in-app browser runtime reported no connected browser
- State: completed print with camera available; desktop dashboard
- Density normalization: not performed because no implementation capture was available

## Full-view comparison evidence

Blocked. The source reference was opened and inspected. The implementation
served the expected Snapmaker theme tokens and camera-mode structure over
private HTTPS, but HTTP and source checks are not rendered visual evidence.

## Focused region comparison evidence

Blocked for the same reason. The intended mapping is limited to the existing
card's color system: official Snapmaker charcoal surfaces, warm-white content,
yellow as the identifying accent, and orange for paused or attention states.
Green and red are separate semantic colors for positive/connected and
negative/disconnected feedback. The latest interaction change also puts camera
mode status on the left and its live/close action on the right.

## Findings

- [P1] Browser-rendered comparison is unavailable.
  - Location: full status card and camera overlay.
  - Evidence: the browser inventory was empty, so no implementation screenshot,
    interaction check, or console check could be captured.
  - Impact: token correctness is verified, but contrast, balance, and visual
    fidelity cannot be accepted from source code or HTTP responses alone.
  - Fix: reconnect the in-app browser, reload the private dashboard, capture the
    completed snapshot state, and compare it with the source reference.

## Required fidelity surfaces

- Fonts and typography: unchanged by scope; rendered weight and antialiasing are unverified.
- Spacing and layout rhythm: unchanged by scope; rendered layout is unverified.
- Colors and visual tokens: official-page charcoal, warm white, yellow, and orange tokens are present in the served widget; semantic green/red are separate; rendered balance and contrast are unverified.
- Image quality and asset fidelity: camera imagery is unchanged; snapshot/fallback now uses the existing disconnected-camera icon and live uses a pulsing dot; live rendering is unverified.
- Copy and content: live FPS is measured from delivered JPEG frames rather than copied from configuration.

## Comparison history

- Initial pass: blocked before comparison because no browser-rendered implementation capture was available.

## Implementation checklist

- Reconnect the in-app browser.
- Reload `/dashboard?reload=6`.
- Capture the completed snapshot state at 1123 x 994.
- Check the camera action, progress, status, metric, and refresh accents for contrast.
- Capture live, snapshot, and snapshot-fallback states if exercised; verify the
  left status/right action order, the semantic indicators, and the measured-FPS
  transition.

Historical status-card result: blocked

Current final result: blocked
