# U1 widget completion tracks

Updated 2026-08-31. This is the authoritative execution queue for the user's
request to finish **all** pending widgets and apply the selected refined white
style throughout. New feedback adds or changes a row; it does not silently
cancel other rows. Older entries saying Queue/progress are deferred are history.

## Scope and current reality

Release A is deployed: [PR41](https://github.com/scottchu/orca-slicer-mcp/pull/41)
reviewed `744f7d06607526a10997b926d91b18087c4030cf` merged as
`b6142de6241cb2e1b6ac70b509f2d0b0e836f1d8`; installed release
`20260831-b6142de-pr41-20260831T140555-84d50f` runs 0.4.0/schema 8/
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

F0/O1 and B–E remain unfinished. Preserve unrelated checkouts; any reuse needs
explicit integration review. Queue foundation is locally committed as
`4fbb96c7201398c125006cafc5050b84a875af1e` on `feat/u1-queue-completion`;
independent bounded source/protocol review approves and closes the prior P2.
TypeScript, 40 tests/461 assertions and six independent tests/68 assertions pass.
Store/widget integration is next. Stacked B–E source work may continue while
the user visually reviews A; sequential reviewed release order is unchanged.

| Track | Current source coverage | Required delivery | State |
| --- | --- | --- | --- |
| A1 Printer-reported filament | Fixed read/store/Heads projection deployed; four physical slots and independent material freshness | User visual review; retain no preset-sync boundary | Deployed in PR41; independent fresh four-head material read passes |
| A2 White foundation and index | White focused cards/index/host assets and local attributed icons deployed; truthful coverage labels | Reference-matched rendering, states and accessibility | Deployed in PR41; user visual acceptance pending |
| A3 Camera reference | Header outside genuine media, direct controls, snapshot feedback/card fullscreen deployed; watchers retained | Rendered/native snapshot/live/close/PiP/fullscreen acceptance | Deployed in PR41; user/device acceptance pending |
| A4 Continuous progress | Contrast correction, continuous bar/layers/ETA/elapsed deployed | User visual review, without fabricated metrics/completion | Deployed in PR41; visual acceptance pending |
| B Queue | Three-file standalone adapter/model/test foundation approved locally at `4fbb96c`; prior privacy P2 closed | Integrate bounded store/projection/widget without queue mutations | Foundation source/protocol approved; widget integration remains active next |
| C Fans and chamber | Fans/purifier unimplemented; chamber thermal unknown | Real fixed fan/purifier/cavity reads, measured units and independent missing/power states; no controls | Active, after Queue |
| D Current Job and History | Independently callable split delivered; history unimplemented | Preserve `jobs`/`job_history` split; real bounded history page and useful current-job fields with explicit provenance | Active, after fans/chamber |
| E Overview | Explicitly deferred composition | Compose accepted focused domains from shared normalized state; no alternate normalization/acquisition path | Active, after focused-domain acceptance |
| F Bed Mesh | Real reported-grid behavior retained; white restyle deployed in A | Visual orientation/units/state verification, no calibration | Deployed in PR41; restyled visual acceptance pending |
| G Invokable skills and routes | Focused observation and camera skills delivered | Retain closed selectors and existing invocation; update source guidance/coverage as domains ship, without plugin reinstall | Active acceptance across releases |

Releases A, B, C, D, and E are independently shippable end-to-end slices.
A includes the shared visual foundation and material projection because their
Heads/card changes need coordinated integration. F ships with A; G is checked
for every release. A new user priority may reorder the queue, but each remaining
row stays active with a next action or an explicit user-approved pause.

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
- Bed mesh, thermals, heads, jobs/history, queue, fans, overview, and directory
  use the same visual vocabulary without replacing real domain content with
  decorative gauges or implied healthy empty states.

## Required gates per release

| Gate | Evidence required | Current new-release status |
| --- | --- | --- |
| Source and protocol | Fixed read-only adapters, finite bounds, normalization/privacy tests, store/projection tests, repository checks, bundles/signatures/aliases | `acdb2e3` pass: 190 app/1,761 assertions, 21 lifecycle, 22 shipping; independent 20/399; bundles, six HTML checks and new frozen manifest |
| Browser and design | Reference and actual widget capture at matching state/viewport, narrow layouts, states/interactions/accessibility | Unverified; user explicitly authorized A deployment first for their visual review; no pass claimed |
| Independent review | Separate role approves exact candidate SHA after all changes and evidence | `744f7d0` approved for guarded shipment under explicit visual-order override; app/script manifest unchanged |
| Merge and deployment | PR, reviewed SHA, exact merged-build `u1-ship`, explicit restart of both public and dashboard services | Complete: PR41 merged `b6142de`, exact release installed and both services restarted |
| Deployed behavior | Health/integrity/exact served assets plus meaningful scoped widget behavior; preserve OAuth/config/routes | Operator 14-static/16-security pass; independent exact release, 12 assets, four pages, fresh Heads and actual JPEG pass |
| Real-printer/user outcome | Read-only domain acquisition is recorded separately from rendered fixture, mounted-phone, and physical-print acceptance | Fresh material read for four heads and structural JPEG acquisition pass; no visual/phone/live-video or physical acceptance |

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
