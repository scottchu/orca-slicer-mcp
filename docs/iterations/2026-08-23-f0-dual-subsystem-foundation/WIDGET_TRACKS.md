# Widget completion tracks

Updated 2026-09-01. Latest user order: finish existing implementation, complete
migration and delivery, finish queued features, then clean up superseded code.
No listed track is cancelled. Private fixtures do not prove live behavior.

PR67 heads `8663d93` and `befbbd5` were independently rejected for text clipping,
incomplete correlated selection types, and subsequently separated number/unit
spacing. Final head `07e1c144` corrected those failures and passed fresh exact
independent validation and review before shipment. The regression matrix retains
200 combinations, including 48 adjacency checks; earlier rejected heads were
not deployed.

## Current slice: all-nine private lab controls and loading

PR67 shipped: reviewed `07e1c144`, merged `c924bf9`, both services restarted and
independently post-verified. All nine observation control/loading paths below
are delivered; production cutovers, Camera and seven ready-shell debts remain.

| Track | Source/composition | State controls | Live cutover | Delivery |
| --- | --- | --- | --- | --- |
| Thermals | Zero-raw composite, shared actual/target/degree/percentage primitives | Shipped five-state controls and closed examples | Pending | PR67 deployed/post-verified |
| Fans & Air | Zero-raw composite, seven shared percentage rows | Shipped five-state controls and closed examples | Pending | PR67 deployed/post-verified |
| Overview | Explicit native-tag ready-shell debt | Shipped shared loading shell and controls | Pending | PR67 deployed/post-verified |
| Print Progress | Explicit native-tag ready-shell debt | Shipped shared loading shell and controls | Pending | PR67 deployed/post-verified |
| Heads & Filaments | Explicit native-tag ready-shell debt | Shipped shared loading shell and controls | Pending | PR67 deployed/post-verified |
| Current Job | Explicit native-tag ready-shell debt | Shipped shared loading shell and controls | Pending | PR67 deployed/post-verified |
| Job History | Explicit native-tag ready-shell debt | Shipped bounded row/empty loading and controls | Pending | PR67 deployed/post-verified |
| Print Queue | Explicit native-tag ready-shell debt | Shipped bounded row/empty loading and controls | Pending | PR67 deployed/post-verified |
| Bed Mesh | Svelte/Three chart, native-tag shell debt | Shipped controls; no Three mount while loading | Pending | PR67 deployed/post-verified |
| Camera | Candidate zero-raw root/widget, shared PageLayout and registered media/status leaves | Candidate seven states, restrictive capabilities, loading, URL/reset/history | Pending; pure session checkpoint not wired, production remains legacy | Exact independent acceptance and delivery pending |

Acceptance progression: author software tests → separate exact-SHA validation →
separate formal review → PR merge → exact deployment → explicit BOTH service
restart → static/security/integrity verification → actual-device/user feedback.
Only completed layers may be accepted. Current geometry tests are synthetic
Chrome, not phone, WebRTC or printer evidence.

## Remaining migration and cleanup

The separate LIVE Fans candidate is the current production cutover slice.
`LIVE_PARITY.md` records the read-only remaining-eight acceptance inventory;
those adapters and generic resource replacement remain pending.

- [x] Independently approve/deliver this controls/loading candidate and persist
  the actual rollout receipt.
- [x] Recoverably quarantine the specifically approved ten redundant worktrees
  and stale nested clone; independently verify full preservation. Active feature
  work, runtime/rollback trees and required legacy code are not retired by this.
- [ ] Independently accept/deliver the integrated synthetic Camera lab candidate.
  Decision0032's reviewed split permits exactly two artifacts:750,000 observation,
  80,000 Camera,830,000 aggregate; candidate748,482+78,688=827,170. The directory
  stays in observation. No real Camera migration is inferred from these fixtures.
- [ ] Retire the seven remaining ready-shell raw-tag debts using shared
  primitives; retain exact composition guards.
- [ ] Review/implement live observation transport and each focused-widget
  cutover; lab state selection is not production loading behavior.
- [ ] Review/implement live Camera cutover, startup/fullscreen-exit continuity,
  non-shifting snapshot feedback and truthful FPS.
- [ ] Inventory production HTML/assets, host routes and MCP resource aliases
  before retirement; required compatibility readers remain until replaced.
- [ ] After accepted replacements and delivery, remove superseded widget code,
  stale artifacts and temporary scaffolding with an explicit scope; preserve
  user work, recovery snapshots and required compatibility behavior.

## Named feature obligations after existing consolidation

- [ ] Bed Mesh reference-style visible-side axes and readable Z enclosure/grid,
  stable 2D/3D bounds, icon-only mode/reset controls.
- [ ] Read-only Console widget, with no command/control capability.
- [ ] Truthful model thumbnail/layer-progress visualization, distinguishing
  visual preview from actual sliced-layer evidence.
- [ ] Filament material/profile/color synchronization discovery and verified
  integration, preserving loaded/empty/unknown distinctions.
- [ ] Consistent compact spacing/type/color/icon foundations, correct headings,
  gray empty filament state and compact fan metrics in remaining widgets.
- [ ] Resolve generic color-token naming and remaining legacy `--u1` aliases
  in old ready shells; the arrow-function convention is already adopted.
- [ ] Smaller Refresh visual: 32-pixel surface/16-pixel glyph within a 44-pixel
  accessible target.
- [ ] Content-aware compact/medium/full presentation and separately reviewed MCP
  size parameter, without silent transport/API expansion.

Whole-server/MCP migration to SvelteKit remains an architecture question from a
capability discussion, not an approved replacement commitment. Each live cutover
needs its own boundary/evidence before cleanup is accepted.

## Earlier track evidence and acceptance details

The current checklist above supersedes earlier execution order, not these
historical delivery records or their unresolved device-acceptance boundaries.

# U1 widget completion tracks

Updated 2026-08-31. This is the authoritative execution queue for the user's
request to finish **all** pending widgets and apply the selected refined white
style throughout. New feedback adds or changes a row; it does not silently
cancel other rows. Older entries saying Queue/progress are deferred are history.

## Scope and current reality

### SvelteKit migration foundation — active, private lab only

Decision 0032 adds a private static fixture lab and shared Svelte component
anatomy. Bed Mesh is the first candidate because its 2D/3D vertical jump is
measurable. This track does not replace `/dashboard/bed_mesh`, register an MCP
resource or contact the printer. The exact synthetic lab page may be packaged
into the existing private dashboard server, while public HTTP, the dashboard
directory and the generic embed bundle remain excluded. It is accepted only when the
same 4:3 chart frame survives mode switches at 320/390/590/720 with readable
real-sample 3D/2D output, 44-pixel icon controls, overlay feedback, no direct
network path, deterministic static packaging, private 200/public 404 isolation,
no acquisition and browser screenshot evidence. Per-widget production cutover is
a later separately reviewed track; every existing focused widget remains active.

Independent review blocks exact candidate `7aef4b5`: frame equality passed, but
the 3D surface remained a thin central strip and its perspective-scaled labels
were unreadable. Renewal adds explicit initial surface-projection coverage,
12-pixel non-overlapping HTML axis/value label checks and strict runtime
freshness/source/profile plus matrix-summary consistency validation. Geometry
alone is no longer sufficient visual evidence.

The renewed author candidate now measures 91.9--92.5% × 53.4--53.7% surface
coverage and nine 12-pixel visible, in-frame and non-overlapping labels at all
four widths; bridge malformed/inconsistent fixtures and deterministic private
packaging pass. Independent exact-candidate renewal remains pending, so this
track is not accepted or eligible for production cutover yet.

Formal review then blocks exact candidate `a6363fd` on profile canonicalization:
the corrected bridge now uses the adapter's Unicode letters/numbers plus ASCII
space/underscore/dot/hyphen allowlist, trims outer spaces and rejects empty,
dot/dotdot and path/URL/bidi/markup/control adversaries. International-valid
fixtures remain accepted. A new exact-candidate review is still required.

The active next slice extends that merged foundation to every non-camera
observation view before any MCP cutover. One private package serves a lab
directory plus independently callable Overview, Print Progress, Thermals, Heads
& Filaments, Current Job, Job History, Print Queue, Fans & Air and Bed Mesh
paths. Each receives strict synthetic bridge data, uses the shared compact
header/body/footer/action anatomy and gets real-Chrome coverage at
320/390/590/720. Camera remains pending its separate media-lifecycle migration;
production routes/resources and public HTTP do not change.

The bounded product-iteration refinement is shipped in PR56. Reviewed
`e2702dc7a39c45665aa14155e85d13011d50526b` merged as
`cb7d06fdcc4de45f7fb5803fe2efee13364eba0f`; guarded release
`20260831-cb7d06f-pr56-20260831T234756-96fe19` runs on BOTH explicitly restarted,
healthy and integrity-verified services at runtime 0.4.7/schema 12/
observation-v13/camera-v9. Sixteen security checks, exact served hashes and all
ten local-plus-tailnet dashboard routes pass; independent postdeployment
validation is PASS and no rollback occurred.

The shared design system, refined Progress/Heads/Fans/Bed Mesh and camera
reliability are deployed without cancelling or recombining any focused
invocation. The remaining track is visual/device acceptance: iPhone layout,
WebGL render/fallback, touch interaction and live-camera/fullscreen behavior are
pending because the browser runtime was unavailable. Rollout verification made
no camera or printer request.

All focused widget tracks are delivered. E Overview shipped in PR54 as exact
release `20260831-aa9bd9d-pr54-20260831T201019-d7aa8a` on BOTH restarted,
healthy and integrity-verified services at runtime 0.4.6/schema 12/
observation-v12/camera-v8. Sixteen security checks and exact served-asset checks
pass; one private Overview refresh reported complete coverage, all eight tiles
known and every receipt fresh/timestamped. Preserve independently invokable
focused cards and their truthful empty/partial/unknown/unsupported/unavailable/
stale states. Current priority is user visual review and bounded product
iteration. All cards still require browser/device visual acceptance.

Previous shipped priority: **D Current Job/real History**. PR51 exact approved
head `30f1c7b` merged as `23f07e3`; release
`20260831-23f07e3-pr51-resume-20260831T191106-be85c4` runs on BOTH explicitly
restarted, healthy/integrity-verified services at 0.4.5/schema 11/observation-v11/
camera-v8. Sixteen security checks pass with config/OAuth/routes preserved.
Tailnet index/jobs/job_history return 200. One sanitized Current read confirms a
last-reported complete terminal job with inactive storage; one sanitized History
read confirms a 20-row returned page with order preserved. No private identity,
raw runtime or history-total claim is retained. Full evidence is in VALIDATION;
visual/device acceptance remains unverified.

Previous shipped priority: **C Fans & Chamber**. Exact PR49 head `c14e92c` was
formally and independently approved and merged as `3ab4ed7`; exact release
`20260831-3ab4ed7-pr49-resume-20260831T182603-74d978` runs on BOTH explicitly
restarted, healthy/integrity-verified services at 0.4.4/schema 10/observation-v10/
camera-v8. Sixteen security checks pass with config/OAuth/routes preserved.
Tailnet index/Fans/Thermals return 200. Exactly one Fans and one Thermals POST at
shared source time `2026-08-31T22:27:06.974Z` confirms bounded known/fresh
environment projections. This is telemetry, not health/safety/accuracy or visual
evidence. Full delivery chronology and evidence are in VALIDATION.

Previous priority: C began after B Queue shipped in PR47. Exact
reviewed `1068add` merged as `6d76f9a`; release
`20260831-6d76f9a-pr47-20260831T172710-645971` runs on BOTH explicitly restarted,
healthy/integrity-verified services at 0.4.3/schema 9/observation-v9/camera-v8.
Fourteen static and sixteen security checks pass with config/auth/routes
preserved and no rollback. Independent checks confirm 15 exact manifest files,
both service targets, three health/seven static checks, one known/fresh paused-
empty Queue observation and exact served-widget semantics. Full evidence is in VALIDATION;
visual/browser/device acceptance remains unverified. That checkpoint's order was
C → D → E; the authoritative top section now records C/D/E shipped and visual
review next.

Previous priority: **B Queue integration** after PR46's merged Heads rollout
records (`bd7abc8`). Decision 0029's Queue addendum/OBS-012 bind the existing
reviewed foundation to the shared store, independent receipt/attempt TTL,
safe bounded projection and white focused card/index. No new Queue release is
claimed at this historical checkpoint until the runtime 0.4.3/tool schema 9/observation-v9/camera-v8 candidate
with nineteen resources and retained observation-v8 passes exact review, merge,
deployment, BOTH-service restart and scoped verification. A/F/Heads remain deployed; C fans/chamber, D Current Job/
History and E overview remain active afterward. Browser/device acceptance is
unverified; the standing deployment-first user-review order remains.
Author checks pass 223 app tests/3,150 assertions. Independent validation passes
those plus 21 lifecycle, 22 shipping and 15 focused tests/7,049 assertions,
TypeScript/diff checks, three bundles/code signing and six exact emitted assets.
Formal review's singular-summary grammar correction passes renewed author and
independent gates without findings; exact-SHA review was open at this source
checkpoint and completed in the PR47 rollout above.

Previous shipped priority: Heads reference refinement, a presentation-only follow-up to
A1/A2 under decision 0029. Use actual-filament-color soft washes inside the white
container with exact swatch/hex and accessible Copy; preserve real state and
independent material freshness. This slice precedes Queue without cancelling
B–E. Source 0.4.2/schema 8/observation-v8/camera-v8 (eighteen resources) passes
author 106 tests/2,290 assertions and TypeScript. Independent checks pass 200 app/
2,855, 21 lifecycle, 22 shipping, 86 fixtures/751 and all bundles/exact assets.
Exact reviewed `e369ca4` was approved and merged in PR45 as
`90d9f9d353c7bca2c299ab7ae949ad81e7d4faca`; installed release
`20260831-90d9f9d-pr45-20260831T152746-190348` runs on BOTH explicitly restarted,
loaded/healthy/integrity-verified services. Fourteen static and sixteen security
checks pass; config/auth/routes preserved, no rollback. Independent postrelease
verification passes both fifteen-file manifests, three health/seven static
checks, one fresh four-head/material read and 35 exact served-widget VM
assertions. Visual/device and native clipboard acceptance remain
unverified; Queue integration is next.

F is deployed in [PR43](https://github.com/scottchu/orca-slicer-mcp/pull/43):
reviewed `41546d9e3ea841bdd23279694079719327f39f39` merged as
`92a62c04c22600ee802d7be3c0b27285135f6d33`; exact release
`20260831-92a62c0-pr43-20260831T150042-2e7c64` runs 0.4.1/schema 8/
observation-v7/camera-v8. Both services were explicitly restarted and are
loaded/healthy/integrity verified; fourteen exact static and sixteen security
checks pass, OAuth/environment/config/routes preserved, no rollback. Independent
exact-release/manifest, fourteen local/thirteen tailnet static and tailnet-health
checks pass. One private refresh returns a known/fresh active 11 by 11 mesh at
`2026-08-31T19:03:22.696Z`; visual/device acceptance remains unverified.
Heads refinement is deployed; Queue integration is next. Docs-only rollout
records do not redeploy unchanged application bytes.

Previous release A was deployed in [PR41](https://github.com/scottchu/orca-slicer-mcp/pull/41):
reviewed `744f7d06607526a10997b926d91b18087c4030cf` merged as
`b6142de6241cb2e1b6ac70b509f2d0b0e836f1d8`; installed release
`20260831-b6142de-pr41-20260831T140555-84d50f` ran 0.4.0/schema 8/
observation-v6/camera-v8 with sixteen resources. Both services were explicitly
restarted and are loaded/healthy/integrity verified; fourteen static and sixteen
security checks pass, OAuth/environment/config/routes preserved, no rollback.
The user's explicit instruction moved visual review after deployment for A;
visual/actual-device acceptance remains unverified, not passed. Software evidence
is 190 app/1,761 assertions, 21 lifecycle, 22 shipping, 20 isolated/399 assertions
plus TypeScript/bundles/exact assets. Final exact-SHA review retained all guards.
Independent live checks confirm exact installed release, twelve exact asset
comparisons, four user-facing pages, fresh four-head material metadata and a
structurally valid real JPEG. They do not establish visual/device acceptance.

Historical pre-Queue checkpoint: the user's Fluidd Bed Mesh screenshot
prioritized decision 0030's
interactive reported-height surface inside the existing white card. It does
not request Fluidd's dark dashboard, interpolated-matrix selector or printer
controls. At that checkpoint the release order was A/F/Heads (deployed) → B →
C → D → E, B–E were unfinished, and Queue store/widget integration was next.
The current top section and matrix supersede that history: B, C, D and E are
shipped; visual acceptance remains open for every track. Preserve unrelated checkouts;
any reuse needs explicit integration review. Queue foundation is locally committed as
`4fbb96c7201398c125006cafc5050b84a875af1e` on `feat/u1-queue-completion`;
independent bounded source/protocol review approves and closes the prior P2.
TypeScript, 40 tests/461 assertions and six independent tests/68 assertions pass.
That standalone foundation was subsequently integrated and shipped in PR47 as
recorded above. D–E work may continue while the user visually reviews A/F/B/C;
no unfinished track is cancelled by the new priority.

| Track | Current source coverage | Required delivery | State |
| --- | --- | --- | --- |
| A1 Printer-reported filament | Fixed read/store/Heads projection deployed; four physical slots and independent material freshness | User visual review; retain no preset-sync boundary | Deployed in PR41; independent fresh four-head material read passes |
| A2 White foundation and index | White focused cards/index/host assets and local attributed icons deployed; truthful coverage labels | Reference-matched rendering, states and accessibility | Deployed in PR41; user visual acceptance pending |
| A3 Camera reference | Header outside genuine media, direct controls, snapshot feedback/card fullscreen deployed; watchers retained | Rendered/native snapshot/live/close/PiP/fullscreen acceptance | Deployed in PR41; user/device acceptance pending |
| A4 Continuous progress | Contrast correction, continuous bar/layers/ETA/elapsed deployed | User visual review, without fabricated metrics/completion | Deployed in PR41; visual acceptance pending |
| A5 Heads reference refinement | Deployed in PR45 at 0.4.2: actual-color soft wash, exact swatch/hex and Copy; material acquisition retained | User visual/native-clipboard review | Both-service and independent live-read/served-widget checks pass; visual/device acceptance unverified |
| F Bed Mesh | Interactive same-sample surface and retained 2D grid deployed in PR43 at 0.4.1 | User visual review of XYZ/legend/exaggeration, pointer/keyboard orbit/reset and 2D fallback | P2 corrected; reviewed and shipped, visual/device acceptance pending |
| B Queue | Fixed bounded adapter, independent store/projection and white Queue card/index shipped in PR47 | User visual review; preserve no-mutation boundary | Deployed to both restarted services; exact/static/scoped verification recorded separately, visual/device acceptance unverified |
| C Fans and chamber | Fixed environment route, independent store/projection and two focused cards shipped in PR49 | User visual review; preserve distinct commanded-percent/RPM/state semantics and no controls/health inference | Deployed to both restarted services; scoped one-Fans/one-Thermals telemetry verification passes, visual/device acceptance unverified |
| D Current Job and History | Fixed independent Current/History reads, stores, projections and white cards shipped in PR51 | User visual review; preserve privacy, contextual identity, page-only count and no-control boundary | Deployed to both restarted services; sanitized scoped telemetry verification passes, visual/device acceptance unverified |
| E Overview | Explicit fan-out over existing domains and privacy-minimized composition of eight accepted projectors shipped in PR54 | User visual review; preserve compact headline-only card, per-domain receipts, coverage-only summary and no alternate acquisition path | Deployed to both restarted services; exact static/security/scoped refresh verification passes, visual/device acceptance unverified |
| G Invokable skills and routes | Focused observation and camera skills delivered across all widget tracks | Retain closed selectors and existing invocation; update only through bounded product iteration, without plugin reinstall | Delivered; user invocation/visual acceptance remains open |

Releases A, F surface, B, C, D, and E are independently shipped end-to-end slices.
A includes the shared visual foundation and material projection because their
Heads/card changes need coordinated integration. F's white restyle shipped
with A; the new F surface shipped separately in PR43. G is checked
for every release. No widget implementation row remains; the next action is
user visual review and bounded product iteration.

## Visual contract

Decision 0029 supersedes the camera-only bottom-information exception and the
rejected segmented progress. Use the user's latest selected camera and progress
references, not earlier overlays. The reference descriptions below are durable;
private attachment paths/images are not committed.

- Shared foundation: white/near-white surface even inside a dark host, dark
  charcoal text, muted secondary information, restrained neutral outline/shadow,
  rounded cards, generous whitespace, system sans typography, consistent
  library icons. Use Feather 4.29.2's MIT-licensed thin rounded outlines for new
  camera/progress tiles and controls, bundled locally with attribution; no
  network icon requests or handmade replacement paths. Keep readable contrast,
  keyboard focus, and 44 px controls.
  Reuse the existing vanilla assets, bridge, routes, and application store.
- Information sits above actions. Titles, observation times, freshness,
  capability/failure explanations are readable without entering a control menu.
  Actions occupy the bottom, with Refresh/Retry right aligned for focused cards.
- Heads: four equal inner cards, wrapping to two/one columns; actual tool/state,
  material label, divided current/target temperature, then exact solid swatch,
  canonical hex and 44-pixel accessible Copy with truthful outcome feedback.
  Blend valid color 6% over white, respecting reported alpha, for the solid card
  wash; white stays white,
  black becomes pale neutral, unknown stays neutral without invented color/copy.
  Keep active accents independent and all text opaque/readable. Refresh remains
  bottom despite its top position in the selected screenshot. Reuse system
  fonts/Feather icons; no generated assets or hardcoded reference readings.
- Camera: small camera-icon tile and `U1 Camera` at top left. State dot/text,
  measured live FPS and frame time sit in the white header at right, wrapping
  above the image on narrow widths without truncation. No grid, tint, dark
  status/photo overlay, redundant snapshot footer, or invented camera image.
  Genuine media remains intact. Bottom-right fullscreen/snapshot/More controls
  may match the reference; More must expose working, accessible PiP and Go Live/
  Close actions, or use clear direct controls. Do not leave decorative buttons.
- Progress: title and observed time above; large lightweight green percentage
  is the reported print percentage, never inferred from layer count. The thin
  continuous amber bar uses that valid percentage. Layers and approximate ETA
  remain independent values beneath it. `Complete` requires observed completed
  state, not percent alone. Release A's lower row contains observed elapsed time
  only: nozzle/bed/speed/height are not in the focused progress projection and
  must not be invented to match reference labels. No assumed-layer-thickness
  height calculation. Missing/stale states stay explicit.
- Current Job and History: keep separate cards and receipts. Current uses a
  contextual identity label—Printing/Paused, Loaded file, Last reported job or
  Reported file—and separately labeled state/storage/duration/filament/byte
  facts. History uses `Latest jobs returned`, a page-only count and at most 20
  ordered rows with safe basename, status and reported time/duration/filament.
  Use plain lists/dividers and readable wrapping, not charts or a giant map.
  Neither card has pagination or row actions; each has one bottom Refresh.
- Bed mesh, thermals, heads, jobs/history, queue, fans, overview, and directory
  use the same visual vocabulary without replacing real domain content with
  decorative gauges or implied healthy empty states.
- Queue: reported queue state and total count above an ordered safe-basename
  list, with optional Added and observed waiting duration (not ETA/live clock).
  Show at most 100 rows plus explicit omitted count; wrap long filenames.
  Independent receipt/freshness/failure information stays above bottom Refresh.
  Valid known zero rows means empty; stale zero rows means last observed empty.
  Unknown/unsupported/unavailable never becomes empty or a fabricated timestamp.
- Fans & Chamber: retain Thermals as the independently invokable home for
  actual-only Cavity °C, with environment time/freshness visible on that row.
  Fans & Air groups four physical part-cooling rows and Cavity/purifier air
  handling. Show commanded percent and measured RPM as separate facts; no dial,
  spin animation or healthy/fault color. Purifier `Not detected`, RPM `Not
  measured`, component `Not reported`, known Off/Stopped, stale, unsupported and
  unavailable are explicit. Keep one bottom Refresh action on each focused card.
- Bed Mesh surface (decision 0030): default oblique interactive 3D chart on
  white, retaining every reported sample at its existing XY bounds. Connect
  adjacent points only, with no resampling/smoothing or `mesh_matrix` fallback.
  Information above actions includes Reported probe grid, XYZ mm axes,
  numerical low/high height legend, min/max/range, grid size, time/freshness,
  selected exaggeration and the visualization-only faces explanation. Keep
  XY's physical aspect ratio; never infer front/back or calibration quality.
  Bottom controls are 3D/2D mode, Height exaggeration (1x/100x/300x, default
  100x), Reset view and Refresh. Pointer drag/focused arrows orbit, Home resets;
  bounded pitch and no autoplay. Retain exact-oriented 2D grid and explicit
  rendering-failure fallback. Valid flat data is uniformly colored, not empty.

## Required gates per release

| Gate | Evidence required | Current new-release status |
| --- | --- | --- |
| Source and protocol | Fixed read-only adapters, finite bounds, normalization/privacy tests, store/projection tests, repository checks, bundles/signatures/aliases | `acdb2e3` pass: 190 app/1,761 assertions, 21 lifecycle, 22 shipping; independent 20/399; bundles, six HTML checks and new frozen manifest |
| Browser and design | Reference and actual widget capture at matching state/viewport, narrow layouts, states/interactions/accessibility | Unverified; user explicitly authorized A deployment first for their visual review; no pass claimed |
| Independent review | Separate role approves exact candidate SHA after all changes and evidence | `744f7d0` approved for guarded shipment under explicit visual-order override; app/script manifest unchanged |
| Merge and deployment | PR, reviewed SHA, exact merged-build `u1-ship`, explicit restart of both public and dashboard services | Complete: PR41 merged `b6142de`, exact release installed and both services restarted |
| Deployed behavior | Health/integrity/exact served assets plus meaningful scoped widget behavior; preserve OAuth/config/routes | Operator 14-static/16-security pass; independent exact release, 12 assets, four pages, fresh Heads and actual JPEG pass |
| Real-printer/user outcome | Read-only domain acquisition is recorded separately from rendered fixture, mounted-phone, and physical-print acceptance | Fresh material read for four heads and structural JPEG acquisition pass; no visual/phone/live-video or physical acceptance |

The table above records release A, not acceptance of F's changed bytes. For the
new F surface, implementation and the P2 occlusion correction pass final
independent software validation: 194 app/2,731 assertions, 21 lifecycle,
22 shipping, 22 independent/1,162 assertions, TypeScript/repository/bundles and
exact assets. Exact source `41546d9` was approved without blockers and shipped
in PR43; the current receipt is above. Browser/device visual acceptance
is unverified. Asymmetric,
flat, stale, inactive, invalid and maximum-size fixtures verify software
geometry, units, local controls and unchanged acquisition/state semantics. The standing
order is merge → deploy exact merged build → explicitly restart BOTH services
→ verify for user visual review. Unavailable automated browser access does not
re-block that order, and never becomes a visual pass. No source/service success
proves physical-bed quality or safe printing.

Main coordinator found no available in-app or Chrome browser after runtime
discovery. The user then explicitly requested deployment for their own visual
review, overriding only predeployment visual-QA order. No automated visual pass
is claimed; do not reuse an old design-QA pass as approval of new assets.
Camera's current combined muted state/FPS/time text differs from the reference's
differentiated state/metrics and vertical dividers. Visual QA must assess it;
this record makes no 1:1 fidelity claim. Direct accessible controls instead of
the reference's More menu are within the recorded design choice.

The read-only capability researcher reports successful live Queue, History,
cavity, fan, and purifier queries on 2026-08-31. This establishes endpoint/data
availability, not widget implementation. Queue was paused with zero rows;
history returned three rows; cavity reported 25 C; fans reported zero speed/RPM;
purifier reported power not detected. Power absence is not missing firmware
support. Detailed redacted evidence belongs in VALIDATION; no private jobs,
IDs, model names, camera frames, or raw payloads enter Git.

Out of scope: printer controls, queue/history mutations, calibration, slicing,
project/preset sync or writes, auth/Tailscale changes, plugin reinstall, and
previously deferred Mac login/power work. Read-only firmware material metadata
is not an Orca filament preset; local preset matching is a separate preparation
operation and is not inferred here.
