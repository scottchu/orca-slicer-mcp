# U1 widget completion tracks

Updated 2026-08-31. This is the authoritative execution queue for the user's
request to finish **all** pending widgets and apply the selected refined white
style throughout. New feedback adds or changes a row; it does not silently
cancel other rows. Older entries saying Queue/progress are deferred are history.

## Scope and current reality

Latest local A correction `acdb2e38553418b395269bf71814ec3a5f21af04` changes
green percentage text to `#499e69`/3.293:1 with a computed regression test.
Independent full validation passes 190 app/1,761 assertions, 21 lifecycle,
22 shipping, 20 isolated/399 assertions, TypeScript/bundles/six HTML checks.
Exact-SHA source-only review approves without findings (31 tests/448 assertions),
excluding uncommitted docs, visual QA and release approval. The new frozen
62-file manifest is `dca09a45ac122919bcc3621d2cfe182455bb4bfaf98375565d168ba5766e1ca0`.
PR41's confirmed open/draft remote head is `acdb2e3`.

F0 capability discovery and the O1 observation spine remain active, not complete.
Release A checkpoint `acdb2e38553418b395269bf71814ec3a5f21af04` is committed
and pushed as [draft PR41](https://github.com/scottchu/orca-slicer-mcp/pull/41),
open/draft status and exact remote head confirmed by the coordinator. Source
from main `bf3eb26` is implemented and frozen at runtime
0.4.0/schema 8/observation-v6/camera-v8 with sixteen resources. Independent full
software, final source-integrity and exact bundled-static gates pass. Visual
QA is blocked; the contrast P2 is resolved in source-approved `acdb2e3`, with
no merge/deployment. Both live
services were checked and remain PR38 `b565eec`, 0.3.5/schema 7/observation-v5/
camera-v7, without restart. Preserve unrelated/earlier checkouts; any reuse needs
explicit integration review. Queue foundation is locally committed as
`4fbb96c7201398c125006cafc5050b84a875af1e` on `feat/u1-queue-completion`;
independent bounded source/protocol review approves and closes the prior P2.
TypeScript, 40 tests/461 assertions and six independent tests/68 assertions pass.
Store/widget integration is next. Stacked B–E source work may continue while A awaits
visual permission; sequential reviewed release order is unchanged.

| Track | Current source coverage | Required delivery | State |
| --- | --- | --- | --- |
| A1 Printer-reported filament | Fixed read/store/Heads projection implemented; four physical slots and independent material freshness | Visual QA and deployed meaningful behavior; retain no preset-sync boundary | Source approved at `acdb2e3`; visual/release gates pending |
| A2 White foundation and index | White focused cards/index/host assets and local attributed icons implemented; coverage labels remain truthful | Reference-matched rendering, all states, accessibility and deployed behavior | Source approved; visual/release gates pending |
| A3 Camera reference | Header state/FPS/time outside genuine media, direct controls, snapshot feedback/card fullscreen; frame watchers retained | Reference rendering and native snapshot/live/close/PiP/fullscreen behavior | Source approved; visual/release gates pending |
| A4 Continuous progress | Contrast P2 corrected/revalidated in `acdb2e3`; continuous bar/layers/ETA/elapsed retained | Visual QA, without fabricated metrics or completion | Source approved; visual/release gates pending |
| B Queue | Three-file standalone adapter/model/test foundation approved locally at `4fbb96c`; prior privacy P2 closed | Integrate bounded store/projection/widget without queue mutations | Foundation source/protocol approved; widget integration remains active next |
| C Fans and chamber | Fans/purifier unimplemented; chamber thermal unknown | Real fixed fan/purifier/cavity reads, measured units and independent missing/power states; no controls | Active, after Queue |
| D Current Job and History | Independently callable split delivered; history unimplemented | Preserve `jobs`/`job_history` split; real bounded history page and useful current-job fields with explicit provenance | Active, after fans/chamber |
| E Overview | Explicitly deferred composition | Compose accepted focused domains from shared normalized state; no alternate normalization/acquisition path | Active, after focused-domain acceptance |
| F Bed Mesh | Real reported-grid behavior retained; white restyle implemented in A | Verify grid orientation, units, inactive/flat/stale meaning and no calibration | Source approved; visual/release gates pending |
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
| Browser and design | Reference and actual widget capture at matching state/viewport, 320/390/720 px, errors/unknown/stale/loading, interactions and keyboard/focus; `design-qa.md` passed | Blocked; allowed browser unavailable, isolated headless permission requested but not granted |
| Independent review | Separate role approves exact candidate SHA after all changes and evidence | `acdb2e3` source-only approved, 31/448 pass, no findings; uncommitted docs excluded; visual/release review blocked |
| Merge and deployment | PR, reviewed SHA, exact merged-build `u1-ship`, explicit restart of both public and dashboard services | Draft PR41 checkpoint pushed; merge/deployment blocked on required visual QA/review |
| Deployed behavior | Health/integrity/exact served assets plus meaningful scoped widget behavior; preserve OAuth/config/routes | Pending |
| Real-printer/user outcome | Read-only domain acquisition is recorded separately from rendered fixture, mounted-phone, and physical-print acceptance | Fixed material read succeeded for four heads; no mounted-device or physical acceptance |

Main coordinator found no available in-app or Chrome browser after runtime
discovery. A request for isolated headless visual QA is pending; this is a visual
gate, not a reason to drop domain work or claim a pass. Do not reuse an older
design-QA pass as approval of new assets.
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
