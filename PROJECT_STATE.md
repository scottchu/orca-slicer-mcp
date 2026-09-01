# Project state

Last updated: 2026-09-01

## Baseline

- Canonical repository: `scottchu/orca-slicer-mcp` (private).
- Product boundary: Orca Preparation and Printer Operations are peer
  subsystems joined by an explicit prepared-job/print-session handoff.

## Active iteration

### Live Fans migration — separate next slice (2026-09-01)

Renewed PR67 remains frozen for independent acceptance. A separate branch starts
decision 0034: fixture-independent Fans presentation, strict real adapter,
shared host RPC and retained-refresh controller, then only Fans dashboard
cutover. Backend/authentication and generic MCP resources remain unchanged.
Integrate exact reviewed main before this branch's acceptance; nothing in this
next slice is yet shipped.

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
Artifact: 748,539 bytes, unchanged cap 750,000. Fresh exact independent
validation/review and guarded delivery remain pending; author green gates do
not override the rejected earlier head or imply actual-device/live acceptance.

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
