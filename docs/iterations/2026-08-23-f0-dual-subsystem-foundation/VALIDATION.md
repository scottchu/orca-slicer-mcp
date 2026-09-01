# F0 dual-subsystem foundation validation

## 2026-09-01 Bed Mesh combined author gates — independent acceptance pending

Reviewed Camera main `0aa83a0f382574af1eb910d7cba61f2a28f88ace` was explicitly
merged after preserving the narrow Bed Mesh checkpoint. Attributed operator
receipt: Camera release `20260901-0aa83a0-pr71-20260901T170551-59206e`, tree
`af970729c41d041533d5d6f6c909a3a43d49a21b`, BOTH services restarted and
health/integrity verified. That prior shipment is not new author printer/device
evidence and does not claim this Bed Mesh candidate has been deployed.

Actual final commands, pinned Bun 1.3.12 and normal Node PATH:

- Repository `./scripts/check-repository.sh`: PASS, 221 UI units in 23 files,
  Svelte/TypeScript zero errors/warnings and AST contract pass, deterministic
  production Fans/Camera and both private labs, 286 app tests / 3,345 assertions,
  21 lifecycle and 24 shipping tests, `repository contract: ok`.
- UI `bun run test:browser`: 137/137 Chrome PASS on the combined Camera/Fans/
  Bed Mesh source and exact packaged bytes. This includes the eight expanded
  Bed Mesh cases (320/390/590/720, normal and 200% root text): flat zero, flat
  nonzero, all-negative 3×7, asymmetric rectangular 11×11, tiny-range 2×2 and
  tilted 64×64 updates; seven quadrant/boundary azimuths at both supported
  18°/74° polar limits; measured glyph containment/nonoverlap; reset; retained
  camera/canvas and changed actual geometry/color buffers with disposal.
  Each data fixture requires actual colored screenshot pixels, not merely an
  invisible bounding element. The 2D switch retains the identical 4:3 frame;
  changed data changes its pixels without resize. Surface colors are not
  required to fill an impossible minimum area in edge-on flat rotations.
- Four default packaged-route cases within that full suite retain at least
  70% frame width and 42% height surface coverage, contained 12px axis labels,
  equal 2D/3D frame DOMRects and no external request or console error.
- Supplemental UI `bun x playwright test tests/visual/bed-mesh.spec.ts
  --workers=1`: 4/4 PASS after the full run, same source/bytes. Measured default
  coverage at 320/390/590/720 is respectively 81.1/84.8/90.5/92.4% width and
  46.7/48.8/52.1/53.2% height, with exact mode frame equality in every case.
- App `bun run bundle:widget-vendor`, `bun run bundle`, `bun run bundle:server`,
  `bun run bundle:runtime`, `codesign --verify --verbose=2 dist/u1-print-studio`
  and `dist/u1-print-studio --help`: PASS.
- `git diff --check`: PASS.

Author personally inspected final default 320/720 full-page captures and the
320 enlarged reset/orbit plus 720 normal orbit captures. The actual surface,
floor and two rear grid walls remain visible; true outer-edge labels are
readable and separated. Captures are local generated test evidence, not checked
into Git, and the reference screenshots informed structure only, not theme or
copied measurement values. Existing summaries and controls remain unchanged.

Final raw UTF-8 artifacts (SHA-256):

| Artifact | Bytes | SHA-256 |
| --- | ---: | --- |
| Observation lab | 749,150 | `8233becb8f75a4d2bb48658cd82ecb1f2a59df80f42f6a1dcbb5080cf3a055e1` |
| Camera lab, unchanged | 78,795 | `af0aa5bbdce1ece711efa97a3bd041ffddf04648df1f0b040ab7aa59712e1b5a` |
| Production Fans, unchanged | 85,315 | `b28ee10c695bb8d0296fa0d161b9962c578fdecabbd0f18ec1b525d408d23be1` |
| Production Camera, unchanged | 89,919 | `b774fdfce6ec20a1732f2cef5cd5ec5dbbd93422810758c237eb9f7278423c10` |

The two labs total 827,945 bytes; unchanged limits remain 750,000 observation,
80,000 Camera and 830,000 aggregate. No new dependency, route, cap increase,
unsafe minification or dropped feature was used to fit. The redundant surface
edge overlay was removed; real grid/axis geometry remains.

The first final repository run failed solely because `private-lab.test.ts`
still pinned the prior artifact hash; its 285/286 pass is not counted as a full
pass. The exact rebuilt hash was updated, then the complete gate above passed.
Earlier real label-overlap/containment and test-harness failures below remain
recorded and were corrected without weakening the expanded assertions.

Evidence boundary: author static/software, local fixtures and Chrome only.
Independent exact validation, formal source review, Bed Mesh merge/deployment/
BOTH restart and served-behavior verification are still required. No actual
printer, user phone/Safari, live Bed Mesh adapter or MCP cutover is accepted.
All other migration and named feature tracks remain open.

Preliminary independent source inspection identified existing parity debt,
explicitly outside this bounded refinement: the lab has no focusable keyboard
orbit/Home reset contract, no automatic fallback when WebGL creation fails,
and the 2D canvas labels remain fixed 12px when root text is enlarged. The 200%
label assertions above apply to projected 3D labels, not 2D canvas text. This
candidate does not claim full decision-0030 interaction parity; the next live
chart cutover must address and independently verify all three gaps.

## 2026-09-01 Bed Mesh early author checkpoint — not acceptance

The corrected test harness now exercises actual rendering. Normal320 passes its
full data/orbit/pixel case. Enlarged320 correctly blocks the checkpoint for
Z-endpoint collisions and a subsequent extreme-orbit label containment defect;
measured numeric widths, endpoint offsets and bounded collision/frustum fitting
are being corrected without weakening assertions. This checkpoint must not ship.

Pinned Bun1.3.12, existing frozen UI/app lockfile installs; no dependency changes.
Commands actually run: UI `bun run check` (0 errors/0 warnings, AST pass),
`bun run test -- src/lib/bed-mesh` (16 pass), and `bun run test` (193 pass).
The direct geometry test verifies exact sample-to-display round trips, topology,
flat0/nonzero/negative/tiny/tilted/64×64 matrices, asymmetric bounds and14 grid
uprights across quadrants. Renderer tests capture actual Three buffers and verify
changed colors/positions, retained camera/canvas, reset-key-only behavior and
replacement/final disposal; the2D test verifies reactive rectangular cell geometry.

`bun run build`, `bun run package:private-lab` pass. Early observation bytes
748,711, Camera unchanged78,795, aggregate827,506; these are checkpoint bytes,
not a frozen candidate. Existing750,000/80,000/830,000 bounds are preserved.
Four actual Chrome default checks pass at320/390/590/720: same4:3 mode bounds,
contained12px labels, default surface81.9–92.8%width/47.2–53.4%height. Author
personally inspected normal320/720 screenshots plus the supplied graph reference;
subsequent axis-midpoint refinements require renewed visual evidence.

An overbroad filename filter matched the worktree name and started129 tests.
It was deliberately stopped at the first known new test-harness startup failure:
114 existing tests passed, one new case timed out, three were interrupted and11
did not run. The test-only hook incorrectly assumed WebGLRenderer.render lives
on its prototype. It now captures BufferGeometry and OrbitControls instead.
An attempted nonbrowser full repository gate later caught a Vitest imported-name
collision in an arrow-property stub; importing testing-library render under a
distinct alias fixes it and the focused renderer tests pass again. No failed or
interrupted run is claimed as a full pass. Final expanded browser and exact full
repository gates, independent review/validation and guarded delivery remain open.
No service, printer, real camera, auth, Tailscale or user-device action occurred.

## 2026-09-01 real Camera dashboard author gates

Reviewed main `db1c926` is explicitly integrated; its shipped Fans/shared-RPC
source is unchanged. With pinned Bun1.3.12 and normal Node PATH, actual commands:

- Repository `./scripts/check-repository.sh`: PASS,211 UI units, Svelte/TS/AST
  zero errors/warnings, exact deterministic Fans/Camera/two-lab packaging,
  286 app tests/3,345 assertions,21 lifecycle24 shipping tests. This includes
  the new UTF-8 byte/graph negative tests and exact private/public Camera routes.
- UI `bun run build:live-camera`, `bun run check`, and
  `bun run test -- src/lib/camera src/lib/media`: PASS,57 focused tests including
  prior synthetic tests, real transport/session/peer/controller and playback.
- UI `bun run test:browser`:129/129 Chrome PASS on the integrated candidate
  before the final narrow loadedmetadata/playing capability-readiness listeners.
- UI `bun x playwright test tests/visual/live-camera.spec.ts --workers=1`:
  final8/8 PASS on current rebuilt bytes, including normal/200% text at
  320/390/590/720, skeleton-to-ready geometry, snapshot-first host calls,
  measured local-video FPS, native Chromium fullscreen, local fullscreen with
  unchanged video/srcObject/track, non-flow snapshot feedback,5s stall fallback,
  retry and one-time persisted-page restoration. Final cases additionally
  exercise feature-detected native PiP entry or graceful rejection, emulated
  Safari presentation API and rejected fullscreen without disconnecting.
  Normal/enlarged390 screenshots were visually inspected for compact anatomy
  and readable status. Fixture media is generated only in test source; it is
  absent from the production graph and does not prove actual printer/device use.
- App `bun run bundle:widget-vendor`, `bun run bundle`, `bun run bundle:server`,
  `bun run bundle:runtime`, `codesign --verify --verbose=2 dist/u1-print-studio`
  and `dist/u1-print-studio --help`: PASS. Server/runtime/signature/help reran
  after the final host and presentation source changes.
- `git diff --check`: PASS.

Final production Camera:89,919 raw UTF-8 bytes, SHA-256
`b774fdfce6ec20a1732f2cef5cd5ec5dbbd93422810758c237eb9f7278423c10`.
Independently reviewed cap100,000; one explicit compiled-Svelte entry and no
runtime imports/assets. Existing Fans85,315 and two labs748,816 +78,795
=827,611 are byte-unchanged from reviewed main. Their separate caps remain.

One exploratory `bun test src` command selected UI Vitest files in Bun's
non-DOM runner; it was discarded, not counted as a gate. An intermediate
repository rerun caught asset mismatch while the author rebuilt mutable Camera
bytes during its test process; it was also discarded. The final repository
command above ran against stabilized source/artifact and passed all gates.

Evidence boundary: author software/protocol/local Chrome only. Independent
validation must run the full129 matrix against the final frozen pin, then formal
review and guarded release remain mandatory. No real printer/camera acquisition,
service restart or actual-user-device acceptance occurred in these author gates.

## 2026-09-01 real Camera typed-port checkpoint

On reviewed PR69 merge `ef5b239`, author ran from the app's ui directory using
the pinned Bun1.3.12 installation and normal Node:

- `bun run check`: Svelte/TypeScript zero errors/warnings, AST contracts pass.
- `bun run test -- src/lib/camera/transport.test.ts src/lib/camera/session.test.ts src/lib/camera/peer.test.ts src/lib/media/playback.test.ts`:
  38/38 pass (8 transport,19 session,6 peer,5 playback).

The initial transport ceiling test exposed regex stack exhaustion at a4MiB
frame. A flat bounded base64 validation scan fixes it; the full-byte-ceiling
regression now passes. Other checks cover exact source time/JPEG bytes, strict
downstream metadata/ICE/SDP bounds, invalid outgoing requests, malformed returned
lease release, unchanged singleflight/deadline session behavior, peer/track
ownership, stale callbacks and persistent-video playback recovery.

This is author pure/mock-browser-port evidence only, not independent acceptance,
production integration, actual browser rendering or real printer acquisition.
No artifact or route changed. Next integrate reviewed shared HostRpc main before
the end-to-end Camera presentation/build/route slice; full gates remain pending.

## 2026-09-01 renewed PR70 combined-tree author gate PASS

The refresh-rejection correction and explicit `ef5b239` merge have now been
verified together. Commands actually rerun with pinned Bun 1.3.12 and normal
Node PATH: UI `bun run build`, `bun run package:private-lab`,
`bun run build:live-fans`, full `bun run test:browser`; repository
`./scripts/check-repository.sh`; app vendor/stdio/server/runtime bundle scripts,
`codesign --verify --verbose=2 dist/u1-print-studio`, executable `--help`, and
`git diff --check`. All pass. Counts: 183 UI units, 121 Chrome cases, 281 app
tests / 3,301 assertions, 21 lifecycle and 24 ship tests. Both deterministic lab
rebuilds and the deterministic production rebuild pass their exact comparisons.

The full browser matrix includes Camera state/capability/layout/media lifecycle,
all earlier observation regressions and eleven live Fans iframe cases. The new
case proves V12 → pending refresh → V15 notification → rejected old RPC retains
V15/time/layout/focus, clears busy without stale feedback and permits a V16
refresh. Two unit regressions also cover a same-version freshness supersession;
both were demonstrated failing before the narrow finally-settlement fix. No
clipping/geometry tolerance, composition guard or package limit was weakened.

Renewed packaged artifacts:

- Production Fans: 85,315 bytes, SHA-256
  `b28ee10c695bb8d0296fa0d161b9962c578fdecabbd0f18ec1b525d408d23be1`,
  below its 100,000-byte bound.
- Observation lab: 748,816 bytes, SHA-256
  `4ec4b2f03c26affbc89784ff3ea55e47b8be62be83cbc5d3054849eb0ef11840`,
  +334 versus shipped PR69, 1,184 bytes below 750,000.
- Camera lab: 78,795 bytes, SHA-256
  `af0aa5bbdce1ece711efa97a3bd041ffddf04648df1f0b040ab7aa59712e1b5a`,
  +107 from the shared generic busy button, 1,205 bytes below 80,000.
- Two-lab aggregate: 827,611 bytes, 2,389 below 830,000. Production Fans is not
  included in or substituted for that explicitly reviewed two-lab bound.

The source-derived inventory tests now cover 27 static asset/routes and 28
security checks, including both distinct Camera-lab and production-Fans assets.
These are test counts, not actual deployment checks for PR70. Independent
validation/review of the renewed immutable commit remains mandatory; the earlier
held `e0e141a` must not ship. No running service, physical printer, real camera
stream or actual-user device was used in these author gates.

## 2026-09-01 actual PR69 Camera lab rollout and independent postcheck

Attributed delivery-operator receipt: independently approved head
`473cd000399aa0eb5d9f548b0f75e54dbbd0309f`, tree
`f3399abfb25345fcf419e1ed9c37cb20c16cf842`, merged as
`ef5b239dddcc0fdf0b0bcc08daeeca2ef15dea24` with identical tree. Guarded release
`20260901-ef5b239-pr69-20260901T160906-8d7501` explicitly restarted BOTH
existing services. Health/integrity, runtime 0.4.8/schema 12/observation-v14 /
camera-v10, 26 static and 27 security checks passed; preservation=true, no
rollback needed, snapshot `20260901T160950-ad9fec` retained. Canonical checkout's
8,689 ignored entries and recovery refs were preserved.

The distinct `camera_exact_validation` agent independently confirmed both running
launchd/plist identities, active manifest and all 15 file hashes match the exact
release/revision, with healthy/integrity status. Actual tailnet directory with
and without slash, nine observation lab routes and Camera returned 200/no-store,
restrictive CSP and exact approved artifacts: observation 748,482 bytes, SHA-256
`bba36db142abc32eb11792265d7ba888f987ff43e502fa32ee50e93c29caec77`;
Camera 78,688 bytes, SHA-256
`de731c01ab92726e73be444fe70036f380d4df6172e895e5477db14ea8a87fba`.
Downloaded Camera bytes with their real CSP passed nine independent Chrome
probes / 56 state-width-text combinations, including native fullscreen/PiP and
CSS fallback retaining media identity, with no network/device acquisition.
Canonical checkout was clean at the merge. Detailed receipts remain private.

This is independently attributed deployed-service/static and synthetic-browser
evidence, not an iPhone, real printer stream or completed production Camera
migration. The actual receipt is included with the next reviewed Fans source
candidate; it does not request a documentation-only extra deployment/restart.

## 2026-09-01 combined Camera baseline for renewed PR70

Explicitly integrated reviewed main `ef5b239dddcc0fdf0b0bcc08daeeca2ef15dea24`
(PR69), preserving Camera artifact routing, closed controls, source boundaries
and the 750,000/80,000/830,000 private-lab limits. Conflict resolution combines
the two route/registry/ship inventories and regenerates the deterministic HTML.
The superseded-request fix remains confined to the live Fans controller.
New full combined-tree gates are pending; prior `e0e141a` author green tests do
not override its independent rejection or establish the integrated candidate.

## 2026-09-01 PR70 superseded rejection — reproduced and narrowly corrected

Independent review/validation held `e0e141a`: V12 → refresh → notification V15
→ RPC rejection retained V15 but left refreshing=true after the flight ended.
Two new author controller cases reproduced that exact failure, including the
same-version freshness variant (eight prior tests passed, two new tests failed).
The correction releases single-flight and clears busy in finally, even when the
obsolete failure is intentionally suppressed. It preserves the accepted object,
phase and feedback, and never publishes after disposal.

Actual focused commands: UI `bun run test -- src/lib/live/controller.test.ts`
passes all ten after the fix; `bun run build:live-fans` succeeds; and
`bun run test:browser -- live-fans.spec.ts --grep 'superseded rejected RPC'`
passes the real parent/iframe RPC error, retained V15 value/time/geometry/focus,
re-enabled Refresh and successful subsequent V16 request. Pinned Bun 1.3.12,
normal Node PATH, synthetic intercepted HTTP only; no printer/service change.
The temporary renewed production artifact is 84,926 bytes, SHA-256
`8f8595e944cdcb6111012affa8660391026023fdb0c5417fce05368df9fc52e1`.
Full gates and independent exact acceptance must be repeated after the imminent
reviewed Camera merge is explicitly integrated. This is not an approved release.

## 2026-09-01 LIVE Fans exact-candidate author gates

Actual final commands, pinned Bun 1.3.12 with normal Node PATH:

- UI `bun run check`, focused `bun run test -- src/lib/live src/lib/host`,
  `bun run build:live-fans`, `bun run build`, `bun run package:private-lab`,
  focused `bun run test:browser -- live-fans.spec.ts`, then full
  `bun run test:browser`: PASS. Full Chrome result is 104 cases, including ten
  production-iframe cases and all existing Thermals/Fans/lab geometry regressions.
- Repository `./scripts/check-repository.sh`: PASS, compiler/AST and 152 UI units,
  deterministic production/lab rebuild checks, 280 app tests/3,265 assertions,
  21 service-lifecycle and 24 ship tests, `repository contract: ok`.
- App `bun run bundle:widget-vendor`, `bun run bundle`, `bun run bundle:server`,
  `bun run bundle:runtime`, `codesign --verify --verbose=2 dist/u1-print-studio`
  and executable `--help`: PASS. `git diff --check`: PASS.

The production iframe uses the actual private route/CSP and parent bridge with
intercepted synthetic tool responses, not a fake presentation setter. Four
widths (320/390/590/720) × normal/200% text cover every fan at the real 1,000,000
RPM bound, one-pixel loading/ready region parity, retained source time, values,
focus and geometry during refresh, null/zero/fractional values, error/retry and
no unexpected network requests. Persisted page lifecycle and actual browser
back/forward retain or restore exactly one mounted widget/bridge. Author
screenshots at normal and 200% text were inspected; no clipping was observed.

Separate pre-review found duplicate result notifications invalidating a pending
newer result and pagehide disposing BFCache state. Both now have regressions;
same-version freshness notifications likewise cannot discard the newer response.
Host navigation generations reject pre-reload initial notifications and request
replies. A real existing-server projection test (injected no-device reader) proves
the strict adapter accepts unavailable domain data without inventing readings.

Packaging evidence: production Fans 84,884 bytes, SHA-256
`f25bc9bd332e3fdd49a974db754ea2636ed099f065241bd373a9c0d4daa22605`, below
its separate 100,000-byte bound. Shared leaf extraction/busy-state changes add
334 bytes to the observation lab: 748,888 bytes, SHA-256
`26a05eaf00188d26dd27e5f2700ae9172c8d4ba4491c785c9dffec1c38e56800`,
leaving 1,112 bytes under the unchanged 750,000-byte lab cap. The two artifacts
total 833,772 bytes; the production artifact is not a second lab payload or a
silent relaxation of the lab bound. Import-graph and packaged-marker guards
exclude lab producers/controls, test harnesses, Three and media acquisition.

Static/private-route tests add exact GET/no-store/CSP, prohibited methods,
encoded/traversal/suffix rejection and public 404 coverage. The source-derived
ship inventory now has one additional static asset and security probe; this is
tested inventory, not a claim that a release has occurred. Full browser startup
once refused another agent's occupied port; it was rerun only after that agent's
suite released it. No reused test server or weakened gate was used.

All results above are author software/synthetic-host evidence. Fresh independent
validation and formal review of the frozen commit must precede guarded merge,
exact deployment, BOTH service restarts and post-verification. No actual printer,
camera, user phone, auth, Tailscale or running service was changed or observed.

## 2026-09-01 LIVE Fans current author checkpoint

UI compiler/AST check and the focused adapter/controller/RPC unit run actually
pass: 25 tests (12 adapter, eight controller, five bridge). Ten browser cases pass
against the real packaged iframe/host with synthetic intercepted tool results:
four widths, 200% text, all seven rows at 1,000,000 RPM, initial loading parity,
retained refresh/time/focus, failure/retry, persisted lifecycle and back/forward.
The new busy icon-button state preserves focus while suppressing duplicate
activation; native disabling initially failed this test and was corrected.
The package is 84,884 bytes, excludes lab producers/controls, Three and media,
and has an explicit production import-graph guard. Seventeen dashboard tests pass,
including actual existing server projection compatibility, static route isolation
and pre-reload reply generations. Full gates and fresh independent acceptance
remain pending; these tests do not establish printer or actual-device behavior.
## 2026-09-01 synthetic Camera lab author validation

The reviewed packaging/layout design is recorded in decision0032. Source builds
two explicit self-contained entries: SvelteKit observation/directory and a
compiled Svelte Camera entry. Current deterministic output identities:

- Observation748,482 bytes, SHA-256
  `bba36db142abc32eb11792265d7ba888f987ff43e502fa32ee50e93c29caec77`.
- Camera78,688 bytes, SHA-256
  `de731c01ab92726e73be444fe70036f380d4df6172e895e5477db14ea8a87fba`.
- Aggregate827,170 bytes; limits750,000/80,000 and830,000 total are unchanged
  from the explicit split decision. Both HTML comparisons and negative size/
  asset tests are required. Camera's bundler checks no Three, host, observation,
  bed-mesh or real session module and no dynamic/runtime imports.

Actual commands with Bun1.3.12 and normal Node PATH:

```text
cd plugins/u1-print-studio/app/ui
bun run check
bun run test
bun run build
bun run package:private-lab
bun run test:browser
cd ../../../..
./scripts/check-repository.sh
cd plugins/u1-print-studio/app
bun run bundle:widget-vendor
bun run bundle
bun run bundle:server
bun run bundle:runtime
codesign --verify --verbose=2 dist/u1-print-studio
dist/u1-print-studio --help
```

Final source after PageLayout extraction passed155UI units, compiler/AST,
277app tests/3,223 assertions,21lifecycle and24ship tests,110Chrome cases and
the complete repository contract. `ui:verify` rebuilt both artifacts and matched
their exact bytes. Bundles/signature/help and `git diff --check` passed on that
final source. One incorrect Python module-style invocation failed
to import the script sibling and named a nonexistent lifecycle file; the correct
repository direct commands are `uv run --no-project scripts/test_u1_service.py`
and `uv run --no-project scripts/test_u1_ship.py`. The first corrected run passed
21lifecycle tests and exposed two stale26-security-count expectations; both now
expect27 because the exact private Camera route adds one public-isolation check.

Camera browser coverage includes seven states at320/390/590/720 normal and200%
text (56combinations), real glyph containment/non-overlap, equal card/header/body/
media geometry within a text setting, normal top-right status,44px actions,
closedURL/reset/back-forward behavior and loading without an active stream.
The7isolated media tests cover actual local presented-frame FPS, expiration,
startup/stall deadlines, native/CSSfullscreen and PiP identity, simulated failures,
single non-flow announcement and track cleanup under the exact restrictive CSP.
The200%320px screenshot was visually inspected: title and right-aligned status
no longer overlap. Other screenshots and exact bytes require independent review.

All evidence is software or local synthetic Chrome. No actual printer, camera
device, phone, deployed service or user acceptance is claimed by this candidate.

## 2026-09-01 independent cleanup preservation and receipt-only checks

The cleanup operator moved exactly ten approved redundant task worktrees intact
with `git worktree move`; no force-removal, global clean/prune, branch deletion
or permanent source deletion was used. The separately approved nested clone was
quarantined intact; only its empty parent was removed using nonrecursive `rmdir`.

Independent verification was performed by the receipt author, who did not
perform these cleanup operations. An inline `uv run python -` read-only check
used independent SHA-256/lstat/symlink traversal and tar-member inspection,
plus `git worktree list --porcelain`, `git status --porcelain`, `git rev-parse`,
`git merge-base --is-ancestor` and ignored-file enumeration. Actual result PASS:

- Every current quarantined worktree exactly matches its before, fresh-pre-move
  and after manifests for file bytes, types, modes and symlink targets. Only the
  registered root Git pointer is excluded, because Git updates it during a move.
- All ten old paths are absent and new registrations, HEADs and retained branch
  refs match; both untracked independent diagnostic specs remain present.
- Canonical checkout is clean `main` at `c924bf9`; the original action/recovery
  refs match. All 8,689 current ignored entries match the pre/post-PR67 manifests;
  the original 9,005-entry pre/post-main-switch manifests also match each other.
- All 315 nested-clone entries match current quarantine and archive contents;
  archive/patch checksums pass. The five historical original document files match
  their safe archive-member allowlist and recorded hashes; archive/patch
  checksums pass. No private paths, user-document contents or their hashes are
  committed here.
- Active lab, LIVE Fans, Camera and current-validator worktrees remain present
  and registered. No claim of an independent byte-for-byte baseline comparison
  for those actively changing excluded trees is made.

This verifies recoverability, not runtime behavior. The independent check made
no source, service, build, printer or quarantine mutation. Detailed recovery
manifests remain private; do not empty the recoverable quarantine.

Receipt-only author commands actually run: `git diff --check`,
`git diff --quiet c924bf9 -- plugins scripts .agents AGENTS.md`, and
`PATH=<pinned Bun 1.3.12 plus normal Node PATH> ./scripts/check-repository.sh`.
All pass, including 126 UI units, 276 app tests/3,187 assertions, 21 lifecycle
and 24 ship tests, ending `repository contract: ok`. Only five record files
change; application/plugin/operator trees are identical to the deployed merge.
Fresh independent docs review is still required; no second deploy/restart is
appropriate for unchanged application bytes.

## 2026-09-01 PR67 actual shipment and independent postcheck

Attribution: the separate validator passed exact `07e1c144` (full compiler/AST,
126 units, 94 Chrome cases, deterministic package, app/lifecycle/shipping gates,
168 original clipping cases and 48 isolated adjacency cases). The latter showed
exactly 2px number/unit spacing and zero loading-geometry difference across
normal/200% text and all four widths. Formal review approved the same immutable
head. Author results alone were not treated as approval; rejected `8663d93` and
`befbbd5` were not deployed.

The delivery operator actually ran the documented shipping help, read-only plan,
then `uv run scripts/u1_ship.py --pr 67 --reviewed-sha
07e1c144df9debbbb20b92c1bb0b2ad7b10bc03a --bun <pinned Bun 1.3.12> --execute`.
This receipt intentionally omits machine-private paths. Result:

- Merge `c924bf9a0e225f96a1b4163cdb90c83751545e6a`, exact reviewed tree
  `9198918a05ddb08bf503369413125b8b4bc120cb`.
- Release `20260901-c924bf9-pr67-20260901T153250-99a666`.
- BOTH existing services explicitly restarted; loaded/healthy/integrity verified,
  runtime 0.4.8, runtime schema 12, observation-v14 and camera-v10.
- 25 static asset/route checks, 26 security checks and preservation checks pass.
- No rollback needed; snapshot `20260901T153330-e4475a` retained.

The separate post-deployment validator confirmed loaded launchd/plist/source
identities match this release and merge. Actual tailnet lab directory plus nine
routes returned 200/no-store with restrictive CSP and exact 748,554 bytes,
SHA-256 `83146f52f61fd9225877e3bd4ef7ee08798745083fc7232fa9e932399b007a1a`.
Isolated Chrome ran against fetched server bytes and passed all-nine controls,
retained refresh/source times, skeletons without active content, one loading
announcement, stable major geometry and no external requests. The detailed
verification report remains private, not committed runtime data.

These are attributed independent software, deployed-service and synthetic Chrome
results. No actual-user-browser, iPhone, printer or camera acceptance is claimed.
The receipt-only change does not alter deployed application bytes and needs no
additional restart/deploy under decision 0028.

## 2026-09-01 compact Progress metric — final renewed author checks

Independent visual review of `befbbd5` rejected its separated `0 %` display
despite automated checks passing. The percentage layout owner now sets inherited
`text-align: end`; no shared leaf internals or other widget alignment are changed.
Ready/loading slot bounds remain intact. The 4% regression uses a compiled
test-only fixture; the public lab's closed choices are unchanged. The harness
is served only by the local test server, never by application routes or bundles.

Repeated actual commands: UI `bun run check`, `bun run build`,
`bun run package:private-lab`, full `bun run test:browser`, repository
`./scripts/check-repository.sh`, app `bun run bundle:widget-vendor`,
`bun run bundle`, `bun run bundle:server`, `bun run bundle:runtime`,
`codesign --verify --verbose=2 dist/u1-print-studio`, executable `--help`, and
`git diff --check`, all with pinned Bun and normal Node PATH. All pass: compiler/
AST/types, 126 UI units, 94 Chrome cases, deterministic package, 276 app tests /
3,187 assertions, 21 lifecycle and 24 ship tests, bundles/signature/help.

The text-bound regression now includes 0/4/25/50/75/100 at every tested width
and normal/200% text: 200 total preset combinations, including 48 adjacency
checks. Number-to-unit glyph gap must be nonnegative and no greater than
`max(4px, 0.2 * numeric font size)`, with original text containment and
ready/loading one-pixel bounds unchanged. The final focused command
`bun run test:browser -- lab-text-bounds.spec.ts` passed the stronger matrix;
the final full run also includes the isolated 4% harness.
Author screenshots of normal 390px/0% and 200%-text 390px/100% show joined,
readable displays. Independent final rendering acceptance is still required;
neither these tests nor screenshots are actual-device/printer evidence.

Package: 748,554 bytes, SHA-256
`83146f52f61fd9225877e3bd4ef7ee08798745083fc7232fa9e932399b007a1a`;
21,458 bytes above deployed PR65 and 1,446 bytes below the unchanged cap.
No live branch code, production route or printer acquisition is included.

Later independent cleanup postcheck also passed, attributed to its validator:
canonical main/ref equality, all 9,005 switch-manifest entries, 8,689 remaining
ignored entries after the approved temporary clone removal, and all 315
quarantined/archive entries matched. The ten other proposed worktree targets
remain registered and unmoved. This does not alter runtime or feature acceptance.

## 2026-09-01 PR67 renewal after independent rejection

Independent validation of `8663d93` found 25 clipped-case groups in 168 closed
preset/width/text-scale combinations, despite the earlier author suite passing.
Progress percentages, Heads hex codes, Current Job labels/percent and Overview
state text were visually confirmed clipped. Formal review also required a true
mapped view/scenario/closed-values discriminated union. These were acceptance
failures; the old head must not ship.

The correction uses shared ready/loading text slots and font-aware grid/wrap
rules, without truncation, smaller fonts, hidden telemetry or relaxed bounds.
Overview separators are grid-owned so adaptive column counts retain seams.
The controller now correlates each view, scenario and closed variable map;
compile-negative cases reject wrong scenarios, keys, values and camera kinds.
The committed `lab-text-bounds.spec.ts` adds all 168 regression combinations:
visible text ranges must remain inside clipping ancestors within one pixel;
major ready/loading regions retain the same one-pixel bound. Loading still has
no action buttons, progress values or canvas.

Actual renewed commands (pinned Bun 1.3.12, normal Node on PATH):

```text
cd plugins/u1-print-studio/app/ui
bun run check
bun run test
bun run build
bun run package:private-lab
bun run test:browser
cd ../../../..
./scripts/check-repository.sh
cd plugins/u1-print-studio/app
bun run bundle:widget-vendor
bun run bundle
bun run bundle:server
bun run bundle:runtime
codesign --verify --verbose=2 dist/u1-print-studio
dist/u1-print-studio --help
```

Results: compiler zero errors/warnings, exact AST guards and type-negative
checks pass; 126 UI units, all 94 Chrome cases, deterministic package, 276 app
tests/3,187 assertions, 21 lifecycle and 24 ship tests pass. All four bundles,
signature and executable help pass. The exact lab artifact is 748,539 bytes,
SHA-256 `64f5fa2445b7ea0ec0213a4e5940434c65b1b9f8914a5d12442bd4b5a714c271`:
21,443 bytes above deployed PR65, with 1,461 bytes below the unchanged 750,000
cap. Seven legacy ready-shell native-tag multisets remain unchanged.
`git diff --check` also passes after the renewal records were updated.

These are renewed author software/synthetic-Chrome checks only. A new immutable
head must independently pass and receive formal approval before guarded
delivery. No production route, service, camera acquisition, printer or actual
phone was exercised. Earlier green author evidence below remains historical,
not evidence that the rejected head was acceptable.

### Separately authorized workspace cleanup — attributed operator receipt

The cleanup operator reports the canonical checkout is now clean `main` at
`cb37e3e`. Before switching, a separate validator confirmed preservation of the
five original uncommitted documents; a private binary patch and per-file hashes
were archived. Original `actions` at `c18e6f3` and a recovery ref remain. The
guarded reverse patch, no-overwrite-ignore switch and fast-forward-only pin
preserved all 9,005 ignored entries (content, type, mode and symlink evidence).

The separately approved stale nested source clone was then moved intact into
private quarantine: all 315 manifest entries matched before/after, with a
separate archive, one-line patch and HEAD recovery ref retained. Its empty
temporary parent was removed non-recursively. No feature, runtime, service,
printer or authentication change occurred. Ten proposed old task-worktree
retirements remain pending; active/runtime/historical/Orca trees were untouched.
These facts are attributed to the cleanup operator, not rerun by this author;
final independent post-cleanup verification remains pending. Private paths and
user-document hashes are deliberately not committed.

## 2026-09-01 all-nine lab controls — completed author gate set

Actual local commands, with pinned Bun 1.3.12 on PATH and normal Node available:

```text
cd plugins/u1-print-studio/app/ui
bun run check
bun run test
bun run build
bun run package:private-lab
bun run test:browser
cd ../../../..
./scripts/check-repository.sh
cd plugins/u1-print-studio/app
bun run bundle:widget-vendor
bun run bundle
bun run bundle:server
bun run bundle:runtime
codesign --verify --verbose=2 dist/u1-print-studio
dist/u1-print-studio --help
git diff --check
```

Final results: compiler zero errors/warnings; exact AST composition guards pass;
126 UI unit tests pass; 86 Chrome cases pass; deterministic package verification
passes; 276 app tests with 3,187 assertions pass; 21 lifecycle and 24 shipping
tests pass. Vendor/server/stdio/runtime bundles, macOS signature and runtime help
pass. New browser cases cover all nine closed control docks at four widths,
keyboard selection, reload/back/forward/reset, disabled-state rules, no external
requests, default and known-empty loading geometry, retained refresh/source time,
terminal states and document overflow. Major card/header/body/footer/list/chart
bounds remain within one CSS pixel at 320/390/590/720 and 200% text. Existing
gradient, fan, thermal, mesh, title/bootstrap and compatibility checks remain.

The packaged lab is 748,478 bytes, SHA-256
`596fb409bb336cb4ba147b4aaeb7f2472ab97be8b9f8784238f1a5a33cf0e348`:
21,382 bytes above deployed PR65 and 1,522 bytes below the unchanged 750,000 cap.
Camera is not included. No cap increase, production asset/transport change,
external chunk, CSP change or acquisition was introduced.

Failures found and corrected before this final pass: intrinsic empty-word slot
sizing, proportional-font material wrapping, metadata wrapping, and queue field
widths. Ready/loading now share the same layout/value owners; no hidden ready
telemetry or fixture observation is mounted for loading. Overview's shared narrow
layout places the metric below its label to avoid an enlarged-text auto-column
collision. Two unit structure/whitespace assertions and four browser label
locators were updated to match the new visible controls without relaxing checks.

These are author software/synthetic-browser results, not independent review,
deployment, actual phone, camera or printer evidence. Separate exact-candidate
validation and formal approval are still required before guarded delivery.

## 2026-09-01 resumed consolidation checkpoint

The interrupted author processes completed; no lab Vite/Vitest/Playwright process
remained on resume. Current committed base is `e5972f2`, which explicitly merged
reviewed main `cb37e3e`; ongoing source changes are not yet frozen or approved.
`bun run check` passed compiler (zero errors/warnings) and exact composition
guards. `bun run test:browser -- lab-states.spec.ts` passed all eight cases:
all nine views at 320/390/590/720, ordinary and 200% text, major ready/loading
geometry within one pixel, retained refresh geometry/source time, terminal
states and document overflow. These are synthetic Chrome checks, not device or
deployment acceptance. The preceding unit run was 124/126; the two outdated
structure/whitespace assertions were corrected but await a fresh full run.

The user now prioritizes finishing existing work and migration/delivery/cleanup
before new features. This checkpoint does not claim Camera integration, seven
legacy ready-shell retirement or production route cutover. No service was
restarted and no printer/camera acquisition occurred during these author checks.

## 2026-09-01 visible lab state controls — work-in-progress author checkpoint

Pinned Bun frozen installs, UI compiler/AST, all 110 unit tests, build and
private-lab packaging ran. Compiler/AST and unit tests pass. Initial complete
nine-view lifecycle build is 746,773 bytes before merging the tiny slope change;
the 750,000 cap is unchanged and Camera must await a measured budget decision.
Four-width controller browser tests reached working URL reload/back/forward/
reset checks but fail the synthetic keyboard-select sequence; this is open,
not browser acceptance. Major loading/ready geometry and enlarged-text gates
have not yet completed. No live service, printer or camera acquisition occurred.

The approved minimal design reuses the seven existing raw layout shells/CSS
with a registered LoadingValue leaf. Loading receives no observation object,
only bounded row-count structure, and Bed Mesh does not mount Three/WebGL.
New state/skeleton wrappers are zero-raw; legacy exact raw-tag debts are not
expanded and are not claimed fully migrated. This checkpoint is not a release.

## 2026-09-01 PR65 guarded merge/deploy/BOTH restart verification

Separate implementation, independent validation and independent formal review
approved exact `f216c70b9844b9e536676c403546b3eb116805b2`, tree
`1a3bc6fc10a2a12054ef9db32d7a120f1a3a906e`. The coordinator relayed approvals and
the user's standing widget-release authorization. The reviewer subsequently
acted as delivery operator; the independent validator remained separate.

Actual commands from the clean, frozen candidate checkout:

```text
uv run --no-project scripts/u1_ship.py --help
uv run --no-project scripts/u1_ship.py --pr 65 --reviewed-sha f216c70b9844b9e536676c403546b3eb116805b2 --bun <absolute-pinned-bun-1.3.12>
uv run --no-project scripts/u1_ship.py --pr 65 --reviewed-sha f216c70b9844b9e536676c403546b3eb116805b2 --bun <absolute-pinned-bun-1.3.12> --execute
```

The verified Bun SHA-256 is
`39e644cea4e6db24a3af36013695655d6f789b4b98f1f13bacb882ac6e5c3c18`; its local
absolute path is intentionally omitted. Help/read-only preflight passed first.
Execution passed identity, fetch-base, preflight, local validation, matching-head
merge guards, exact merged-source isolation, stage, dry-run, install, explicit
restart-both and final verification without bypass.

- Merge: `6b9b3e7e09ccfad89ed542a52a69f5126407da4b`; exact reviewed tree preserved.
- Operation: `pr65-20260901T142009-341331`; phase complete, ok true,
  merged true, installed true.
- Release: `20260901-6b9b3e7-pr65-20260901T142009-341331`.
- BOTH public/dashboard: explicitly restarted, loaded true, healthy true,
  integrity verified; runtime 0.4.8/schema 12/observation-v14/camera-v10.
- Static asset/routes: 25 passing; security checks: 26 passing; configuration,
  environment and routing preservation: true.
- Lab artifact: 727,096 bytes, SHA-256
  `2803af9d2ff5c8172305b6fdfa042192f2cfcde10a83dea1c8d1872e5b145a94`;
  exact Thermals/Fans lab routes match. Existing production assets are unchanged.
- Rollback: not needed; retained snapshot `20260901T142049-5cf038`.

Independent postdeployment validation also reports PASS: actual tailnet Thermals
and Fans lab routes each return 200 with `Cache-Control: no-store` and the exact
727,096-byte approved content/hash. Independently inspected service status and
selected plist/manifest identities confirm BOTH loaded/healthy/integrity states
at the exact release and merged source above. No acquisition was performed.

Independent predeployment software validation reported compiler/AST success,
88 unit, 66 Chrome, 276 app/3,182 assertions, 21 lifecycle and 24 shipping tests,
deterministic packaging, bundles/signature/help and clean source. Eight extra
isolated Chrome cases at four widths and normal/200% text verified upper/lower
ratio edges including fractional fills, unknown/zero/clamping, child identity,
focus/events and geometry. A tall fixture's 3–6 red-channel vertical difference
established genuine sloped tint rather than only a CSS-angle string. These are
attributed independent fixture results, not this operator's new browser checks.

This release establishes reviewed source plus exact service/static/security
delivery, not actual phone rendering, live camera, physical printer or user
acceptance. No printer acquisition, auth provisioning, Tailscale change or plugin
reinstallation was performed. The separate rollout-record branch changes only
documentation and needs no additional deployment when app bytes remain equal.

Receipt-branch checks actually run: frozen Bun installs in app/UI, then the full
`./scripts/check-repository.sh` with pinned Bun on PATH passed compiler/AST,
88 UI unit tests, deterministic package verification, 276 app/3,182 assertions,
21 lifecycle and 24 shipping tests. The first attempt in the new checkout stopped
at missing `svelte-kit` before dependencies were installed; no source was changed
to resolve it. `git diff --check` and `git diff --exit-code 6b9b3e7 -- plugins
scripts .agents AGENTS.md` passed. Only the five current state/iteration receipt
documents change. Plugin tree `5fcc4555140d5b8435bbeff05372704c0dae6ed4` and app
tree `c77795604e025c6e3ea6229f5ef7ea01b7367bcc` remain equal to the shipped merge.
Exact independent review is required before the documentation-only PR merge.

## 2026-09-01 subtle percentage-gradient slope author evidence

This isolated private-lab refinement uses 100-degree tint inside an exactly
ratio-sized nonrepeating background rectangle. No public API, production
widget, transport, auth or camera code changes. The larger lab-controls and
synthetic Camera candidates remain in separate preserved branches.

Commands actually run with pinned Bun 1.3.12: frozen app/UI installs; UI
`bun run check`, `bun run test`, `bun run build`, `bun run package:private-lab`,
focused `bun run test:browser -- percentage-background.spec.ts` then full
`bun run test:browser`; repository `./scripts/check-repository.sh` with pinned
Bun on PATH; app `bun run bundle:widget-vendor`, `bun run bundle`,
`bun run bundle:server`, `bun run bundle:runtime`,
`codesign -vvv --verify dist/u1-print-studio`, and `dist/u1-print-studio --help`.

Compiler/AST and all 88 unit tests pass. Eight focused real-Chrome cases pass at
320/390/590/720, including upper/lower-row pixel samples before/after the exact
0/25/50/100-percent and over-target boundaries, neutral invalid ratios, 100-degree
computed gradient, no repeat, unchanged child DOM identity/events/focus,
unchanged geometry and forced-colors suppression. Thermals and Fans both use
the same gradient leaf; existing seams and enlarged Thermals layout pass.

The deterministic artifact is 727,096 bytes, SHA-256
`2803af9d2ff5c8172305b6fdfa042192f2cfcde10a83dea1c8d1872e5b145a94`,
only 38 bytes above shipped PR63 and 22,904 below the unchanged 750,000-byte
hard cap. The already exceeded 720,000 soft target remains explicit review
risk, not an implicit cap increase. Bundles, runtime signature/help pass.

Full Chrome passes 66/66. The repository gate passes compiler/AST, 88 unit,
deterministic package verification, 276 app tests/3,182 assertions, 21 lifecycle
and 24 shipping tests. `git diff --check` passes; rebuilding production vendor
assets introduces no production diff. Required records and remaining execution
order are updated without changing those running surfaces.

Evidence is author synthetic software/browser only, not independent approval,
deployed-service, live-printer, actual-device or user acceptance. Exact
independent review/validation precedes PR merge and guarded BOTH-service delivery.

## 2026-09-01 PR63 guarded merge/deploy/BOTH restart verification

Independent validation and formal review approved exact
`0f78e6924cbaca5a576ee552c7e14e38cb9e1a92`, tree
`402b9450cfe83faaa2f8e5b89c3884981131a260`, before execution. Root relayed both
approvals and the user's scoped standing widget-release authorization. The
implementation agent then acted as delivery operator, not as independent
reviewer or validator.

Actual commands from the frozen clean candidate checkout:

```text
uv run --no-project scripts/u1_ship.py --help
uv run --no-project scripts/u1_ship.py --pr 63 --reviewed-sha 0f78e6924cbaca5a576ee552c7e14e38cb9e1a92 --bun <absolute-pinned-bun-1.3.12>
uv run --no-project scripts/u1_ship.py --pr 63 --reviewed-sha 0f78e6924cbaca5a576ee552c7e14e38cb9e1a92 --bun <absolute-pinned-bun-1.3.12> --execute
```

The absolute local executable path is intentionally omitted from this
repository record. Its verified Bun SHA-256 is
`39e644cea4e6db24a3af36013695655d6f789b4b98f1f13bacb882ac6e5c3c18`.
The fresh read-only plan passed before execution. The workflow then completed
identity/fetch-base/preflight, required local validation, matching-head merge,
exact merged-tree isolation, stage, dry-run, install, explicit restart-both and
final verification, with no bypass or extra device acquisition.

- Merge: `57a305b31ff408bbff4988fc3eeaa518d24b5411`; merged tree equals the
  approved source tree.
- Operation: `pr63-20260901T134952-9c86bd`; phase complete, ok true,
  installed true, merged true.
- Release: `20260901-57a305b-pr63-20260901T134952-9c86bd`.
- BOTH public/dashboard: explicitly restarted, loaded true, healthy true,
  integrity verified; runtime 0.4.8/schema 12/observation-v14/camera-v10.
- Exact static asset/routes: 25 passing; security checks: 26 passing;
  configuration/routing/environment preservation: true.
- Private lab artifact: 727,058 bytes, SHA-256
  `74ad17deadd33e8373402b3b2c204830bd686fa06e369f46fff0604cc01baa41`, including
  exact served Fans/Thermals lab routes. Existing production assets are unchanged.
- Rollback: not needed; retained snapshot `20260901T135032-d34949`.

This establishes reviewed source delivery and exact deployed-service/static/
security verification. The independent software suite separately passed 88 unit,
66 Chrome, 276 app/3,182 assertions, 21 lifecycle and 24 shipping tests plus
additional all-row maximum-RPM/mode/geometry checks. These are not real-device,
live-camera, physical-printer or user-outcome acceptance. No printer, camera,
auth provisioning, Tailscale change or plugin reinstallation was performed.

Rollout-record changes are documentation-only and retain identical application
bytes; no second deployment is required by decision 0028.

Independent postdeployment validation subsequently reported PASS: tailnet
`/dashboard/lab/fans` returned HTTP 200 with `Cache-Control: no-store` and the
exact 727,058 bytes/hash above, compared byte-for-byte with approved source.
The documented service-status command independently confirmed BOTH loaded,
healthy, integrity-verified service contracts at the same runtime/schema/resource
versions. This attributed independent checkpoint proves service/static rollout,
not a new phone/user/printer observation.

For this separate documentation-only branch, `git diff --check`, the exact
five-file change list, and `git diff --exit-code <merge> -- plugins scripts
.agents AGENTS.md` verify format/scope and unchanged application/operator bytes.
Exact review of the documentation commit remains required before ordinary PR
merge; the original reviewed application worktree remains clean and unchanged.

## 2026-09-01 Fans & Air shared-background author evidence

Commands actually run with pinned Bun 1.3.12: frozen app/UI installs; UI
`bun run check`, `bun run test`, `bun run build`, `bun run package:private-lab`,
focused `bun run test:browser -- fans-state.spec.ts` then full
`bun run test:browser`; repository `./scripts/check-repository.sh` with pinned
Bun on PATH; app `bun run bundle:widget-vendor`, `bun run bundle`,
`bun run bundle:server`, `bun run bundle:runtime`,
`codesign -vvv --verify dist/u1-print-studio`, `dist/u1-print-studio --help`;
and `git diff --check`.

- Compiler 0 errors/warnings and exact AST frontier pass. 88 unit tests cover
  canonical fan structure, independent null/zero metrics, fractional percent
  display versus raw gradient, 100,000 RPM, shared loading, refresh retention,
  closed terminal states and all existing component/domain regressions.
- Focused Chrome passes all four widths (320/390/590/720), normal and 200% text.
  Every canonical purifier mode plus null retains exact loading/ready shell,
  list and seven-row geometry. Static names/icons stay visible but loading has
  no telemetry, fill or controls. Maximum RPM text ranges remain within their
  metric/row bounds; whole metrics wrap when necessary. Real rendered gradient
  pixels, neutral unknowns/zeros, frozen refresh source time, single overlay,
  icon-only 44-pixel actions, reduced-motion and no external request pass.
- Initial focused failures exposed a 320-pixel/enlarged metric-group overflow
  and purifier-placeholder line-height mismatch. Bounded whole-metric wrapping,
  shared minimum slots and InfoPair line-height resolved them. Test-only
  geometry now uses document coordinates so click-induced browser scrolling is
  not mistaken for layout shift. An initial unit fixture accidentally retained
  both observation and state props; the test now uses the intended state API.
- Repeated build and repository `ui:verify` reproduce 727,058 bytes, SHA-256
  `74ad17deadd33e8373402b3b2c204830bd686fa06e369f46fff0604cc01baa41`.
  This is +3,046 bytes from PR62, leaving 22,942 below the unchanged 750,000-byte
  hard cap. The previously exceeded 720,000 soft target still needs explicit
  reviewer disposition; it is not silently raised.
- Full Chrome suite passes 66/66, including all 62 prior ready/state/Bed Mesh
  cases and the four new multi-state Fans cases. Thermals' responsive columns,
  seams, degree values, loading and enlarged-text geometry remain unchanged.
- Repository gate, app 276/276 (3,182 assertions), lifecycle 21/21, shipping
  24/24, production bundles, runtime
  signature/help and diff checks pass. Only the private lab artifact changes;
  generating production vendor assets introduces no production diff.

Evidence is author synthetic-fixture/static/software only. Exact independent
review, deployment and actual device/user acceptance are distinct later gates.
No printer, camera, auth or live service was contacted by this implementation.

## 2026-09-01 PercentageBackground / Thermals author evidence

Executed with pinned Bun 1.3.12 after frozen installs in both app/UI:
UI `bun run check`, `bun run test`, `bun run build`,
`bun run package:private-lab`, `bun run test:browser`; repository
`PATH=<pinned-bun>:$PATH ./scripts/check-repository.sh`; app
`bun run bundle:widget-vendor`, `bun run bundle`, `bun run bundle:server`,
`bun run bundle:runtime`, `codesign -vvv --verify dist/u1-print-studio`,
`dist/u1-print-studio --help`, and `git diff --check`.

- Compiler: 0 errors/warnings; exact AST frontier passes. 79/79 unit cases
  include 17 new ratio/color/child-interaction cases, strict line-terminator
  rejection, reactive values and preserved accessible child measurements.
- Chrome: 62/62 cases include all prior 54, plus eight new four-width cases.
  Coverage includes actual sampled blue-filled/transparent pixels, 0/25/50/
  100/over-target/unknown ratios, unchanged child semantics, keyboard/pointer
  action, no decorative layout/overflow/motion, forced-colors suppression,
  normal/list seam parity and full-height peers at 200% text. Existing loading/
  ready/frame/row geometry, 44-pixel actions, source-time, overlay, routes,
  title, Bed Mesh and nonlocal-request checks remain green.
- Initial author probes caught a 200% peer-row seam gap, resolved by list-owned
  stretch; a generic test initially compared differently wrapping child text
  against a fixed height, corrected to assert exact wrapper/child bounds.
  Early color review caught terminal-line-break acceptance; explicit length and
  negative cases now reject it. Initial app hash failure was the expected stale
  prior artifact pin, renewed only after deterministic generation.
- Repeated build plus repository `ui:verify` reproduces 724,012 bytes, SHA-256
  `50d8297d169d1a3c65238a9042924f3e80ea684057ac68f5ce2dc5c078eec4e2`.
  Delta from PR61 is +1,528 bytes, reserve 25,988 under the unchanged 750,000-byte
  hard cap. The pre-existing 720,000 soft target remains exceeded and requires
  explicit reviewer disposition, not a weakened limit.
- App 276/276, 3,181 assertions; lifecycle 21/21; shipping 24/24; repository
  contract, all bundles, runtime signature/help and diff checks pass. The
  production generated vendor build introduces no changed production asset.

This is author synthetic-fixture/static/software evidence only. It is not
independent approval, deployment, live telemetry, actual-device, physical printer
or user acceptance. No printer, camera, auth or live service was contacted.

## 2026-09-01 component foundation / Thermals progressive-state author evidence

Commands run from `plugins/u1-print-studio/app/ui` with pinned Bun `1.3.12`:
`bun run check`, `bun run test`, two `bun run build` plus
`bun run package:private-lab`, and `bun run test:browser --
thermals-state.spec.ts observation-lab.spec.ts bed-mesh.spec.ts`. From the app
and repository roots: app `ui:verify`, TypeScript/app tests,
`uv run --no-project scripts/test_u1_service.py`,
`uv run --no-project scripts/test_u1_ship.py`, `check-repository.sh`, and
`git diff --check`.

- Svelte check: 0 errors, 0 warnings; AST component frontier passes.
- Vitest: 62/62. Coverage includes primitive formatting/ARIA/closed props,
  degree null/zero/negative, actual-target order, source timestamp, invalid
  WidgetState envelopes, six-row loading/no fake telemetry/no action, refresh
  retention, stale-feedback invalidation and deliberate AST bypass fixtures.
- Real Chrome: 54/54. Four progressive Thermals cases plus all prior 50 ready
  lab/Bed Mesh cases pass at 320/390/590/720. Loading/ready header, shell and
  row geometry match; six rows have no fake telemetry/control; reduced-motion,
  forced-colors, refreshing retention, terminal states, 44-pixel action,
  overflow and nonlocal-request gates pass. The exact state harness is test-only
  and absent from packaged/static routes.
- Two builds reproduce one 722,484-byte package with SHA-256
  `dd4f727d615fc7730db76f96b1b33e1371338b046737afc82d87d12a086b3b67`.
  This is 27,516 bytes below the 750,000-byte hard bound, but 2,484 above the
  provisional 720,000-byte soft target; exact review must explicitly accept or
  require a correction without weakening the required composition.
- Full gates: app 276/276 with 3,178 assertions, lifecycle 21/21, shipping
  24/24, and repository contract pass. `git diff --check` passes.

This is synthetic fixture/static software evidence only. It is not independent
approval, deployment, live telemetry, real-printer, actual-device or user
acceptance. No service, printer, camera, auth or Tailscale surface was contacted.

## 2026-09-01 asynchronous feedback-order renewal

Formal review blocked exact `4e8788f`: Heads awaited the clipboard before
announcing Copy, allowing an older completion to overwrite a newer Refresh.
The correction stayed inside the synthetic private lab and contacted no service,
device, auth or Tailscale surface.

Commands actually run after correction:

```text
cd plugins/u1-print-studio/app/ui
bun run check
bun run test
bun run build
bun run package:private-lab
bun run test:browser -- observation-lab.spec.ts bed-mesh.spec.ts

cd ..
bun run ui:verify
bun run ui:verify
bun run check
bun run test
bun run bundle:widget-vendor
bun run bundle
bun run bundle:server
bun run bundle:runtime
codesign -vvv --verify dist/u1-print-studio
dist/u1-print-studio --help

cd ../../..
uv run --no-project scripts/test_u1_service.py
uv run --no-project scripts/test_u1_ship.py
./scripts/check-repository.sh
git diff --check
```

Results:

- Svelte check passes 0/0 and Vitest 25/25. Deferred-promise tests cover stale
  clipboard resolve and reject after newer Refresh plus current Copy resolve and
  reject after Refresh. Copy intent appears synchronously, stale completion is
  ignored, and exactly one latest status node remains.
- Real Chrome passes 50/50. A controlled clipboard verifies the same four order/
  outcome cases at 320/390/590/720, one overlay and under-0.1-pixel card-height
  delta. All title, accent/wash, readability, overflow, nonlocal-request and Bed
  Mesh 4:3 checks remain green.
- Two sequential verification builds reproduce one 713,802-byte self-contained
  page, 36,198 bytes below 750 KB, SHA-256
  `565c731ef6199c81e5df4f758837c6980fb33d7cc349905d7f16c4acbf17e2eb`.
- Full gates pass 276 app tests/3,178 assertions, 21 lifecycle and 24 shipping
  tests. The stdio bundle is 2,811,271 bytes (SHA-256
  `a2e911646c79619858466035225cb51c4977ca9b8755727d75bbef4292f98660`),
  the server bundle is 3,867,535 bytes (SHA-256
  `481a146768225a110364b01533baf9224a6f8d632f5aca965a3d52bd1fa1c500`)
  and the signed runtime is 65,229,648 bytes (SHA-256
  `fa38b1f49ff740ce831460c6d52a7160ed0001a96957ec194095160d82de3102`).
  Signature and help checks pass. Production widget and host hashes remain
  unchanged from the frozen values below.

This is author static/software and synthetic-fixture browser evidence only. It
does not prove independent approval, deployment, MCP cutover, live telemetry,
camera/printer behavior, actual-device rendering or user acceptance.

## 2026-09-01 latest-action and semantic-active renewal

Formal review blocked exact `b3e0c7e`: Copy and Refresh rendered one overlay but
retained two states, allowing stale Copy to mask newer Refresh; the active border
also followed filament color instead of semantic state. The correction remained
inside the synthetic private lab and contacted no service, device, auth or
Tailscale surface.

Commands actually run after correction:

```text
cd plugins/u1-print-studio/app/ui
bun run check
bun run test
bun run build
bun run package:private-lab
bun run test:browser -- observation-lab.spec.ts bed-mesh.spec.ts

cd ..
bun run ui:verify
bun run ui:verify
bun run check
bun run test
bun run bundle:widget-vendor
bun run bundle
bun run bundle:server
bun run bundle:runtime
codesign -vvv --verify dist/u1-print-studio
dist/u1-print-studio --help

cd ../../..
uv run --no-project scripts/test_u1_service.py
uv run --no-project scripts/test_u1_ship.py
./scripts/check-repository.sh
git diff --check
```

Results:

- Svelte check passes 0/0 and Vitest 24/24. Component regressions exercise
  Copy → Refresh and Refresh → Copy, require exactly one status node with the
  latest message, and vary the active tool's canonical color independently.
- Real Chrome passes 50/50. At 320/390/590/720, both action orders immediately
  replace one feedback overlay and preserve card height within 0.1 pixel. A live
  custom-property mutation changes the active card wash while its border remains
  the exact computed semantic amber accent. All title, readability, overflow,
  nonlocal-request and Bed Mesh 4:3 checks remain green.
- Two sequential verification builds reproduce one 713,594-byte self-contained
  page, 36,406 bytes below 750 KB, SHA-256
  `097c9620af5125cb6ce65c820f6b3ce3e67e324d51c91115c6845cbab1878dd7`.
- Full gates pass 276 app tests/3,178 assertions, 21 lifecycle and 24 shipping
  tests. Bundles/signature/help pass: `dist/stdio.js` is 2,811,271 bytes/
  `a2e911646c79619858466035225cb51c4977ca9b8755727d75bbef4292f98660`;
  `dist/server.js` is 3,867,324 bytes/
  `0b92d73ad36ae29bac5fa981412a7b1e0ea401d10afde37498aab9f31063c4c7`;
  `dist/u1-print-studio` is 65,229,648 bytes/
  `fa38b1f49ff740ce831460c6d52a7160ed0001a96957ec194095160d82de3102`.
  Existing production widget/camera/host hashes remain unchanged.

This is author static/software and synthetic-fixture browser evidence only. It
does not prove independent approval, deployment, MCP cutover, live telemetry,
camera/printer behavior, actual-device rendering or user acceptance.

## 2026-09-01 parser-title and Heads interaction renewal

Re-review blocked exact `9dc6470`: child routes still mutated from generic
`Observation Lab` to the canonical title during parsing, and Heads did not yet
implement the already accepted six-percent RGBA-aware wash and bottom Copy
interaction. No service, printer, camera, auth or Tailscale surface was
contacted while correcting the static private lab.

Commands actually run after the final correction:

```text
cd plugins/u1-print-studio/app/ui
bun run check
bun run test
bun run build
bun run package:private-lab

cd ..
bun run ui:verify
bun run ui:verify
bun run check
bun run test
bun run ui:test:browser
bun run bundle:widget-vendor
bun run bundle
bun run bundle:server
bun run bundle:runtime
codesign -vvv --verify dist/u1-print-studio
dist/u1-print-studio --help

cd ../../..
uv run --no-project scripts/test_u1_service.py
uv run --no-project scripts/test_u1_ship.py
./scripts/check-repository.sh
git diff --check
```

Results:

- Svelte check passes 0/0 and Vitest 24/24. The Heads component test proves
  canonical RGBA reaches the card, only three valid colors expose Copy, Empty/
  N/A does not, the exact normalized hex reaches `navigator.clipboard`, and
  feedback is truthful.
- Real Chrome passes 50/50. MutationObserver instrumentation from initial
  parsing records exactly one non-empty canonical title for the directory and
  all nine child routes, never generic-to-canonical mutation. At every frozen
  width the computed Tool 3 wash exactly matches `color-mix` with the canonical
  eight-digit color at six percent and differs from its opaque equivalent.
  Copy actions are 44 pixels and Copy feedback changes card height by less than
  0.1 pixel. All prior route/layout/readability and Bed Mesh 4:3 checks pass.
- Two sequential verification builds reproduce one 713,867-byte self-contained
  page, 36,133 bytes below 750 KB, SHA-256
  `19ce12161bc169596035ddc92d0e914d4b4d3cfb0ced5ee6ccfd0682cc34299c`.
- Full gates pass 276 app tests/3,178 assertions, 21 lifecycle and 24 shipping
  tests. Bundles/signature/help pass: `dist/stdio.js` is 2,811,271 bytes/
  `a2e911646c79619858466035225cb51c4977ca9b8755727d75bbef4292f98660`;
  `dist/server.js` is 3,867,597 bytes/
  `74c8c00500c463b82f69249d004cd198e285ffef65fa334ad945ede955799787`;
  `dist/u1-print-studio` is 65,229,648 bytes/
  `fa38b1f49ff740ce831460c6d52a7160ed0001a96957ec194095160d82de3102`.
  Existing production widget/camera/host hashes remain unchanged.

This is renewed author static/software, synthetic-fixture browser and private-
handler evidence. It does not prove independent approval, deployment, MCP
cutover, live telemetry, camera/printer behavior, actual-device rendering or
user acceptance.

## 2026-09-01 all-observation Svelte formal-review renewal

Formal review blocked exact `8a6df9b` on initial route rendering, raw traversal,
RGBA compatibility, clock consistency, responsive readability and overbroad
validator claims. No service, printer, camera, auth or Tailscale surface was
contacted while correcting those findings.

Commands actually run after the final correction:

```text
cd plugins/u1-print-studio/app/ui
bun run check
bun run test

cd ..
bun run ui:test:browser
bun run ui:verify
bun run ui:verify
bun run check
bun run test
bun run bundle:widget-vendor
bun run bundle
bun run bundle:server
bun run bundle:runtime
codesign -vvv --verify dist/u1-print-studio
dist/u1-print-studio --help

cd ../../..
uv run --no-project scripts/test_u1_service.py
uv run --no-project scripts/test_u1_ship.py
./scripts/check-repository.sh
git diff --check
```

Results:

- Svelte check passes 0/0 and Vitest 23/23. Validators accept bounded canonical
  fixtures and reject the tested envelope, extra-key, enum, numeric, time,
  shape, order, unsafe-label, contradictory-presence and malformed-color cases.
  Heads normalizes six/eight-digit RGB/RGBA uppercase while retaining alpha;
  this is not a claim about arbitrary untested inputs.
- Raw TCP requests prove literal `/../`, once-encoded `%2e%2e` and twice-encoded
  `%252e%252e` cannot normalize into an allowed route. Exact private GET/non-GET,
  public isolation and zero-acquisition contracts remain green.
- Real Chrome passes 40/40 at 320/390/590/720. Every direct route has its exact
  canonical title and route marker, one visible panel, zero recorded layout
  shift, and no required-text clipping, overflow, console error or nonlocal
  request. Overview measures one/two columns, Heads two with `0px` material
  min-height, Thermals labels are exact, feedback preserves geometry/time and
  Bed Mesh retains paired 4:3 geometry and readable projection.
- Two sequential builds reproduce one 713,119-byte self-contained page, 36,881
  bytes below 750 KB, SHA-256
  `7be3e2c912c04233299b2089bb9f368bed891e11e0c4d1a28f843b5fe93a14cc`.
- Full gates pass 276 app tests/3,175 assertions, 21 lifecycle and 24 shipping
  tests. Bundles/signature/help pass: `dist/stdio.js` is 2,811,271 bytes/
  `a2e911646c79619858466035225cb51c4977ca9b8755727d75bbef4292f98660`;
  `dist/server.js` is 3,866,842 bytes/
  `cac1816abc6c4dfc21f9dda2f25b59e1f91b407dbdf983a22f883c68f1de5541`;
  `dist/u1-print-studio` is 65,229,648 bytes/
  `fa38b1f49ff740ce831460c6d52a7160ed0001a96957ec194095160d82de3102`.
  Existing production widget/camera/host hashes remain unchanged.

This is renewed author static/software, synthetic-fixture browser and private-
handler evidence. It does not prove independent approval, deployment, MCP
cutover, live telemetry, camera/printer behavior, actual-device rendering or
user acceptance.

## 2026-09-01 compact widget density and camera continuity — PR58 deployed

PR58 exact reviewed head `0b4f1d3` merged as `2cd7d96`. Guarded release
`20260901-2cd7d96-pr58-20260901T073117-6df842` runs on BOTH explicitly
restarted, loaded, healthy and integrity-verified services at runtime 0.4.8/
schema 12/observation-v14/camera-v10. Twelve local-plus-tailnet dashboard route
checks return 200 with byte-identical content, sixteen security checks pass and
no rollback occurred.

This is reviewed Git, release, service, health, integrity, security and static-
route evidence. It does not establish printer, camera or actual-device
acceptance; none of those surfaces was contacted or claimed.

## 2026-09-01 all-observation Svelte private-lab author evidence

Implementation ran only in the isolated
`codex/u1-svelte-observation-lab` worktree from exact merged main `f44bd06`.
No service, printer, camera, auth or Tailscale surface was contacted.

Commands actually run:

```text
cd plugins/u1-print-studio/app/ui
bun install --frozen-lockfile
bun run check
bun run test
bun run test:browser

cd ..
bun install --frozen-lockfile
bun run ui:verify
bun run ui:verify
bun run bundle:widget-vendor
bun run bundle
bun run bundle:server
bun run bundle:runtime
codesign -vvv --verify dist/u1-print-studio
dist/u1-print-studio --help

cd ../../..
uv run --no-project scripts/test_u1_ship.py
./scripts/check-repository.sh
git diff --check
```

Results:

- Svelte check passes with zero errors/warnings. Vitest passes 20/20 across
  shared tokens/anatomy, Bed Mesh and all eight new components/strict bridge
  validators. Adversarial cases reject extra identity/path fields, invalid
  envelopes/times/enums/shapes, nonfinite/out-of-range numbers, unsafe material
  text, contradictory empty-head metadata and reordered fixed domains.
- Real Chrome passes 40/40 through the actual private handler at
  320/390/590/720. The directory has nine links and unlinked Camera pending.
  Every new view has one header/body/footer owner, exact shared inset, one
  44-by-44 bottom Refresh, no overflow, console error or nonlocal request, and
  overlay feedback changes neither card height nor observed timestamp. Bed Mesh
  retains its paired exact 4:3 2D/3D frame and readability contract.
- The actual captures were compared with the user-selected Progress and Heads
  references. Progress retains the large lightweight percentage, continuous
  8-pixel amber bar, layers/ETA and elapsed hierarchy without the reference's
  unused whitespace. Heads preserves actual-color weak washes and makes Empty/
  N/A neutral gray. Fans & Air is icon-led with restrained percent background
  fill and compact right-aligned RPM; Overview is eight compact tiles.
- The private handler returns identical bytes for the exact directory and nine
  child routes with optional trailing slash (20 GET checks), restrictive CSP
  and zero acquisition callbacks. Camera-lab, nested, encoded, traversal and
  case variants return 404; all exact non-GETs return 405. Public/local normal
  service routes return 404. Shipping derives the ten private paths and records
  26 isolation checks without widening permitted read routes.
- Two sequential verification builds reproduce one self-contained 717,295-byte
  package, below the 750 KB bound, with SHA-256
  `0842f9b316421886285e6be74b39a92700e508aa8cba48695b59a3446c1a2f5c`.
  It contains no external asset, acquisition endpoint, Camera implementation or
  generic embed.
- The full repository gate passes 275 app tests/3,168 assertions, 21 lifecycle
  tests, 24 shipping tests and repository policy. Bundles pass: `dist/stdio.js`
  is 2,811,271 bytes/SHA-256
  `a2e911646c79619858466035225cb51c4977ca9b8755727d75bbef4292f98660`;
  `dist/server.js` is 3,870,447 bytes/SHA-256
  `05e70250d26b8899bc5a82aa69b3d9cf477418a315dfcfa8dfdfc71c4c259509`;
  `dist/u1-print-studio` is 65,229,648 bytes/SHA-256
  `fa38b1f49ff740ce831460c6d52a7160ed0001a96957ec194095160d82de3102`
  and its required signature/help contract passes.
- Existing production SHA-256 remains
  `a01768e408f3566d6e93aea4ea208930dfcd9e21e71ba372a15f8e7a306450e9`
  for `widget.html`,
  `43e4d030dff321a8eb18d9794fe0e3e71f0ddce4b3027a8533f83db01b0f9405`
  for `camera-widget.html`,
  `4460ae500cd8e5fb04edeabc48af8462f40048c4e6494d3be8ef7f87bc487a0c`
  for the status host and
  `25c50f7ca45c76d7d914922d461b56fe009993aba99bed341dff2df0434926f2`
  for the camera host.

This proves author static/software, fixture-browser, bridge-validation,
deterministic-package and private/public-isolation behavior. It does not prove
independent approval, deployment, MCP-host behavior, live telemetry, camera,
printer safety, actual-device rendering or user acceptance.

## 2026-09-01 Svelte Bed Mesh canonical-profile renewal

Formal review blocked exact candidate `a6363fd`: the Svelte bridge guarded
profile length, trimming and C0 controls, but did not yet apply the established
Moonraker adapter allowlist. The corrected guard uses Unicode
`^[\p{L}\p{N} _.-]{1,80}$`, trims outer spaces and rejects empty, `.` and `..`.
No runtime boundary changed and no deployed service, printer, camera, auth or
Tailscale surface was contacted.

Commands actually run:

```text
cd plugins/u1-print-studio/app/ui
bun run check
bun run test

cd ..
bun run ui:build
bun run ui:verify
bun run ui:verify
bun run ui:test:browser

cd ../../..
./scripts/check-repository.sh

cd plugins/u1-print-studio/app
bun run bundle:widget-vendor
bun run bundle
bun run bundle:server
bun run bundle:runtime
codesign -vvv --verify dist/u1-print-studio

cd ../../..
git diff --check
```

Results:

- Svelte check passes with zero errors/warnings. Vitest passes 8/8. The six Bed
  Mesh tests now reject traversal (`../../private/path`), URL, bidirectional-
  override, markup, dot/dotdot, newline and tab profiles at the rendered
  component bridge. Japanese and Cyrillic letters, numbers, internal spaces,
  underscore, dot and hyphen remain accepted; allowed outer spaces normalize
  to the trimmed canonical label.
- Two sequential verification builds reproduce the same 669,506-byte self-
  contained package with SHA-256
  `7eaf7f211bed3466665b61bb3d483e6309b9f17f7519f39cf6de44484dcc24ec`.
  The generic embed remains excluded.
- Real Chrome remains 4/4 at 320/390/590/720 with the exact same 4:3 2D/3D
  `ChartFrame` DOMRects, nine exact 12-pixel visible/in-frame/non-overlapping
  labels, 91.9--92.5% by 53.4--53.7% projected surface coverage, 44-pixel
  controls, no overflow, no console error and no nonlocal request.
- The full repository gate passes TypeScript, 274 app tests with 2,974
  assertions, 21 lifecycle tests, 24 shipping tests and the repository
  contract. Private route/hash/CSP and public-lab denial checks remain green.
- Renewed bundles pass: `dist/server.js` is 3,822,253 bytes with SHA-256
  `f84cc4e54765a8edb38992a7daffd073485a9858f527e152775fa3deb60deb17`;
  `dist/stdio.js` is 2,811,271 bytes with SHA-256
  `a2e911646c79619858466035225cb51c4977ca9b8755727d75bbef4292f98660`;
  `dist/u1-print-studio` is 65,229,648 bytes with SHA-256
  `fa38b1f49ff740ce831460c6d52a7160ed0001a96957ec194095160d82de3102`;
  its required code signature verifies.

This is renewed author static/software, bridge-security, deterministic-
packaging, server-isolation and local real-browser fixture evidence. Exact-
candidate formal and independent review remain required. Production cutover is
still a separate reviewed slice.

## 2026-09-01 Svelte Bed Mesh readability and bridge-contract renewal `a6363fd` — blocked by formal profile review

Independent review blocked exact candidate `7aef4b5`: its 2D/3D frame equality
was real, but the projected 3D surface remained a thin central strip and the
perspective-scaled sprite labels were effectively 3--6 pixels. The renewed
candidate keeps the exact private-lab and production-isolation boundary while
correcting those defects and strengthening runtime prop validation. No deployed
service, printer, camera, auth or Tailscale surface was contacted.

Commands actually run:

```text
cd plugins/u1-print-studio/app/ui
bun run check
bun run test

cd ..
bun run ui:verify
bun run ui:verify
bun run ui:test:browser

cd ../../..
./scripts/check-repository.sh

cd plugins/u1-print-studio/app
bun run bundle:widget-vendor
bun run bundle
bun run bundle:server
bun run bundle:runtime
codesign -vvv --verify dist/u1-print-studio

cd ../../..
git diff --check
```

Results:

- Svelte check passes with zero errors/warnings. Vitest passes 6/6: two shared-
  foundation tests and four Bed Mesh component/bridge tests. Rejection coverage
  includes invalid freshness, noncanonical/impossible source times, unsafe
  profile metadata, malformed/non-finite matrices and supplied minimum/maximum/
  range disagreement beyond `0.000001 mm`; within-tolerance input is normalized
  to exact recomputed matrix values.
- Two sequential clean static builds produce the same 669,454-byte self-
  contained page with SHA-256
  `682a32d24e1dbced9f3cd41d2db1a905583bd630e53a7234a8cc741d4cdec588`.
  The generic embed remains absent from the production manifest/package.
- Real Chrome through the actual private handler passes 4/4 at 320, 390, 590
  and 720 pixels. Exact 3D and 2D `ChartFrame` DOMRects remain respectively
  258x193.5 at x31/y134.375, 328x246 at x31/y134.375, 500x375 at
  x45/y165.1875 and 630x472.5 at x45/y165.1875 CSS pixels. Each pair is equal
  within 0.1 CSS pixel and 4:3.
- The actual camera-projected surface bound is 237.109375x103.265625,
  302.125x131.5625, 461.84375x201.125 and 582.578125x253.703125 CSS pixels at
  those widths: 91.9--92.5% of frame width and 53.4--53.7% of frame height.
  All nine exact X/Y/Z and bound/value labels compute to 12 pixels, remain
  visible and in-frame, and have no pairwise overlap. The full grid/surface is
  readable in paired captures; no overflow, console error or nonlocal request
  occurs and controls remain 44 pixels.
- The full repository gate passes TypeScript, 274 app tests with 2,974
  assertions, 21 lifecycle tests, 24 shipping tests and the repository
  contract. Private exact-route/static-byte/CSP tests and the explicit public-
  lab denial remain green.
- Renewed bundles pass: `dist/server.js` is 3,822,202 bytes with SHA-256
  `30c476991cccf94fe79bf7766ffaf7a0071c6654dea05f60bc21ad06ea76e260`;
  `dist/stdio.js` is 2,811,271 bytes with SHA-256
  `a2e911646c79619858466035225cb51c4977ca9b8755727d75bbef4292f98660`;
  `dist/u1-print-studio` is 65,229,648 bytes with SHA-256
  `fa38b1f49ff740ce831460c6d52a7160ed0001a96957ec194095160d82de3102`;
  its required code signature verifies.
- Existing production SHA-256 remains
  `a01768e408f3566d6e93aea4ea208930dfcd9e21e71ba372a15f8e7a306450e9`
  for `widget.html`,
  `43e4d030dff321a8eb18d9794fe0e3e71f0ddce4b3027a8533f83db01b0f9405`
  for `camera-widget.html`,
  `4460ae500cd8e5fb04edeabc48af8462f40048c4e6494d3be8ef7f87bc487a0c`
  for the status host and
  `25c50f7ca45c76d7d914922d461b56fe009993aba99bed341dff2df0434926f2`
  for the camera host.

This is renewed author static/software, packaging, server-isolation and local
real-browser fixture evidence. Exact-candidate independent review remains
required. It does not establish deployed service behavior, live printer data,
MCP-host rendering, touch/device behavior or user acceptance. Production
focused cutover remains a separate reviewed slice.

## 2026-09-01 Svelte Bed Mesh private lab package `7aef4b5` — blocked by independent visual review

Implementation ran in an isolated worktree on branch
`codex/u1-svelte-bed-mesh-foundation`. The branch merged exact current
`origin/main` `2cd7d96b07d23002524c605259e8e27af4eeb198` normally, without
rebasing, as merge commit `55ace2b`. No deployed service, printer, camera, auth
or Tailscale surface was contacted.

Commands actually run:

```text
cd plugins/u1-print-studio/app
bun run ui:verify
bun run ui:test:browser
bun run check
bun test src/status-dashboard.test.ts src/private-lab.test.ts
uv run --no-project ../../../scripts/test_u1_ship.py
bun run bundle:widget-vendor
bun run bundle
bun run bundle:server
bun run bundle:runtime
codesign -vvv --verify dist/u1-print-studio

cd ../../..
./scripts/check-repository.sh
git diff --check
```

Results:

- Svelte check passes with zero errors/warnings and Vitest passes 4 component
  tests. Two clean `adapter-static` builds package byte-identical output:
  671,615 bytes with SHA-256
  `744ce87b3510d425dec9248ee55a7770a97ef3f635ec8269d1d31279ea0ff680`.
  The page is self-contained and the generic development embed is absent from
  the production build, manifest and package.
- One agent-only attempt to run two Vite builds concurrently in the same
  checkout raced on `.svelte-kit` and failed with a missing generated manifest.
  No repository workflow does this. Sequential clean builds were then run
  twice and passed with the identical hash above; future verification must keep
  UI builds sequential within one checkout.
- The private handler serves only exact `/dashboard/lab/bed_mesh` and its
  optional trailing slash. Tests prove the public service, nested/encoded/case
  variants return 404; POST returns 405; private GET returns the exact packaged
  bytes with restrictive CSP; and neither private nor public static handling
  calls observation, camera or media acquisition hooks. The directory,
  `/dashboard/bed_mesh`, MCP resources and production widget assets remain
  unchanged. The candidate shipping contract has seventeen security checks
  because it adds the explicit public-lab denial.
- Real Chrome passes four private-handler geometry/screenshot cases at
  320/390/590/720. Exact 3D and 2D `ChartFrame` DOMRects are respectively
  258×193.5 at x31/y134.375, 328×246 at x31/y134.375, 500×375 at
  x45/y165.1875 and 630×472.5 at x45/y165.1875 CSS pixels. Each pair is equal
  within 0.1 CSS pixel and exactly 4:3. Controls are 44 pixels and there is no
  horizontal overflow, console error or external request. Paired captures stay
  under ignored `ui/test-results`.
- The full repository gate passes TypeScript, 274 app tests with 2,974
  assertions, 21 lifecycle tests and 24 shipping tests. Runtime, stdio and
  private-server bundles build and the standalone runtime code signature is
  valid.
- Bundle evidence: `dist/server.js` is 3,824,340 bytes with SHA-256
  `6dce49785d3f71241b3d7d39decec85c737bd218b30c8c6d91d15a9c3a63cf54`;
  `dist/stdio.js` is 2,811,271 bytes with SHA-256
  `a2e911646c79619858466035225cb51c4977ca9b8755727d75bbef4292f98660`;
  `dist/u1-print-studio` is 65,229,648 bytes with SHA-256
  `fa38b1f49ff740ce831460c6d52a7160ed0001a96957ec194095160d82de3102`.
- Existing production asset SHA-256 remains `a01768e408f3566d6e93aea4ea208930dfcd9e21e71ba372a15f8e7a306450e9`
  for `widget.html`, `43e4d030dff321a8eb18d9794fe0e3e71f0ddce4b3027a8533f83db01b0f9405`
  for `camera-widget.html`, `4460ae500cd8e5fb04edeabc48af8462f40048c4e6494d3be8ef7f87bc487a0c`
  for the status host and `25c50f7ca45c76d7d914922d461b56fe009993aba99bed341dff2df0434926f2`
  for the camera host.

This is author static/software, packaging, server-isolation and local real-
browser fixture evidence. It does not establish independent review, deployed
service behavior, live printer data, MCP-host rendering, touch/device behavior
or user acceptance. Production focused cutover remains a separate reviewed
slice.
## 2026-09-01 compact widget density and camera continuity — author candidate

The source candidate advances to runtime 0.4.8/schema 12/observation-v14/
camera-v10 with 26 resources. Observation-v13 and camera-v9 remain readable
current-asset aliases. Stable selectors, tools, acquisition, authorization and
printer boundaries are unchanged; user-visible Queue is now Print Queue.

Commands actually run from `plugins/u1-print-studio/app`:

```text
bun run bundle:widget-vendor
bun run check
bun test src/*.test.ts
bun run bundle:runtime
bun run bundle
bun run bundle:server
```

Results: TypeScript passes; 271 tests/2,936 assertions pass; runtime, stdio and
server bundles build; the standalone runtime satisfies its designated code-sign
requirement. Deterministic coverage includes the 320/390/590/720 density
contract, multiple listeners for one DOM event, hosted native/local fullscreen
identity continuity with zero host display-mode or camera calls, same-peer
pause/stall recovery, FPS reset/recovery, one bounded
pagehide/pageshow restore and no intrinsic-height notification on FPS-only
ticks. Headless Chromium additionally measures a non-zero camera and video box
for local and native fullscreen at an exact 390 × 844 viewport, and thermal rows
at no more than 64 pixels at 320/390/590/720. PiP makes zero host display-mode
requests, native enter/exit preserve video/media/session/track/observer identity,
and unsupported PiP is hidden without state mutation. Host-reported fullscreen
or PiP never drives synthetic presentation state. Job History/Print Queue remain
canonical card, host-document and iframe labels, nested panels have one inset
owner, and 2D/3D Bed Mesh share one bounded chart-frame height.

Frozen SHA-256:

- `public/widget.html`: `a01768e408f3566d6e93aea4ea208930dfcd9e21e71ba372a15f8e7a306450e9`
- `public/camera-widget.html`: `43e4d030dff321a8eb18d9794fe0e3e71f0ddce4b3027a8533f83db01b0f9405`
- `src/widget-shared.css`: `111eae4226d62272d27972f66978455770677e5409ed0d714afd88fad361f7cb`
- `public/dashboard-index.html`: `c2d3ab47c2abdc4f4570bbfab35f1216ddddef9d10aef8e969ac5747d2e806e1`
- `public/status-dashboard-host.html`: `4460ae500cd8e5fb04edeabc48af8462f40048c4e6494d3be8ef7f87bc487a0c`
- `public/camera-dashboard-host.html`: `25c50f7ca45c76d7d914922d461b56fe009993aba99bed341dff2df0434926f2`

This is author static/software, simulator and automated local headless-Chromium
layout evidence only. No service, network, auth, Tailscale, camera, printer,
deployment or actual-device render/physical acceptance occurred. Independent
validation and formal review remain required before merge or guarded delivery.

## 2026-08-31 unified widget and camera reliability — PR56 deployed

PR56 exact reviewed head
`e2702dc7a39c45665aa14155e85d13011d50526b` merged as
`cb7d06fdcc4de45f7fb5803fe2efee13364eba0f` with tree
`dc290de12aceebe134b6e3ceb78aa2e8d8789f73`. The guarded workflow installed
release `20260831-cb7d06f-pr56-20260831T234756-96fe19`, explicitly restarted
BOTH services, and verified both loaded, healthy and integrity-matched at
runtime 0.4.7/schema 12/observation-v13/camera-v9. Sixteen security checks
passed. No rollback occurred.

Exact served SHA-256:

- observation widget:
  `1d61271d773e532954f379c877ce58f54fad90ca996acda54e3ba4537504fb2c`
- camera widget:
  `03c3d3a96cec99eef630c444f31f8a9ff6f1caf56d89d83d61d5a60eabb89dd0`

All ten dashboard routes returned HTTP 200 from both the local and tailnet
origins. Independent postdeployment validation reports PASS for the exact
release, health/integrity contract, security checks, served hashes and route
matrix.

This is Git/deployment/service/static-route evidence only. The browser runtime
was unavailable, so no rendered browser or device check occurred. In
particular, iPhone responsive layout, WebGL render/fallback, touch interaction
and live-camera/fullscreen continuity remain pending visual acceptance. The
verification made no camera-frame, live-stream or printer-observation request.
It does not establish physical-printer behavior or user outcome.

## 2026-08-31 unified widget and camera reliability — frozen author candidate

The frozen source targets runtime 0.4.7/schema 12/observation-v13/camera-v9,
retaining observation-v12 and camera-v8 as current-asset compatibility aliases
for 24 total resources. The closed two-visible/eight-app-only tool surface,
read-only boundary, routing and authorization are unchanged.

Commands actually run from `plugins/u1-print-studio/app`:

```text
bun run bundle:widget-vendor
bun run check
bun test src/*.test.ts
bun run bundle:runtime
bun run bundle
bun run bundle:server
git diff --check
```

Results: TypeScript passes; 263 tests/2,734 assertions pass; runtime, stdio and
server bundles build; the standalone runtime satisfies its designated code-sign
requirement; generated Three.js/shared-CSS assets match their reproducible
sources; the served vendor block retains the complete Three.js MIT copyright,
permission and notice text; diff check is clean. Focused camera tests pass
29/193, including the
twelve-second acquisition/decode bound, one-in-flight and late response races,
snapshot-before-one-remount-restore success/failure, measured FPS, persistent
errors and fullscreen peer/track/node/observer identity with zero tool calls.

Frozen SHA-256:

- `public/widget.html`: `1d61271d773e532954f379c877ce58f54fad90ca996acda54e3ba4537504fb2c`
- `public/camera-widget.html`: `03c3d3a96cec99eef630c444f31f8a9ff6f1caf56d89d83d61d5a60eabb89dd0`
- `src/widget-shared.css`: `6f11808888df189fa83bac98169d85ab42bb10ef4c105037efa64cb7ccc9c1e2`

This is static/software and simulator evidence only. Independent validation is
in progress. No Git delivery, deployment, service restart, auth/Tailscale/
printer contact, browser/device render or physical acceptance occurred here.

## 2026-08-31 E compact Overview — PR54 deployed

PR53 merged the reviewed application as `4541ff12`. Its guarded deployment
reached verification but stopped when the exact private Overview static 200/hash
check was followed by the stale private 404 security assertion. Verified rollback
snapshot `20260831T195837-6233d9` restored both healthy services at runtime
0.4.5. PR54 head `a9ad04a` corrected that verifier and merged as
`aa9bd9d609dbdca7c1e0124b4f760d5eb8ddf2c5` at
`2026-09-01T00:10:35Z`.

Exact release `20260831-aa9bd9d-pr54-20260831T201019-d7aa8a` runs on BOTH
explicitly restarted, loaded, healthy and integrity-verified services at runtime
0.4.6/schema 12/observation-v12/camera-v8. Rollback snapshot
`20260831T201038-575d7f` is retained and was not needed. Configuration, OAuth and
routes were preserved. Sixteen security checks pass. Served widget/index/status-
host hash prefixes are exactly `a8a4…`/`49a5…`/`008d…`; tailnet index and Overview
return 200.

Exactly one private Overview refresh returned complete coverage with all eight
tiles known and every contributing receipt fresh and timestamped. This is
sanitized telemetry and deployment evidence only: no raw payload, filename, job
row, identifier, model/project identity or private path is recorded. It does not
prove browser/device rendering, physical behavior or user acceptance, which
remain unverified.

## 2026-08-31 E Overview shipping-verifier correction

The first guarded E delivery reached post-install verification, where it exposed
a contradictory source check: the exact static contract required private
`/dashboard/overview` on port 8788 to return 200 with the frozen host hash,
while `check_security` separately hard-coded the same private route as 404. The
guarded workflow rolled back and verified the prior services restored; no E
deployment remained from that failed attempt. The security checker now derives every focused
dashboard route from the contract only for public port 8787 isolation and no
longer repeats a private Overview assertion. Private Overview remains covered
by the exact static-asset verifier. This correction does not replace either
boundary and does not add an acquisition, camera, tool-call, service, auth or
printer request.

`uv run --no-project scripts/test_u1_ship.py` passes **24 tests**. Regressions
prove private Overview is called once by the scoped static check and never by
the security checker; public Overview and Camera routes remain required 404s;
public Overview exposure fails; body/hash mismatch fails the static check; the
scoped Overview static check and security checker contact no acquisition,
widget, camera-widget, observation or tool endpoint; and the dynamic
security count is derived from the current dashboard inventory and equals 16
for E. `./scripts/check-repository.sh` passes TypeScript, **253 app tests with
3,559 assertions**, **21 lifecycle tests**, **24 shipping tests** and the
repository contract.

This correction is source and fixture evidence only. This role made no Git
delivery or remote GitHub call and contacted no service, auth, Tailscale,
printer or browser endpoint. The preceding failed
shipment's rollback/restoration evidence belongs to the guarded workflow, not to
these local tests. No corrected E deployment, loaded-runtime or visual/user-
acceptance claim is made. A renewed reviewed delivery must rerun the full guarded
verification.

## 2026-08-31 E compact Overview — source-complete candidate

The application candidate implements the frozen E contract without a new
reader, cache, timer or normalizer. Explicit Overview demand reuses main status
and all six independent optional stores concurrently, then produces only the
eight privacy-minimized headline projections with their contributor receipts.
The private index and `/dashboard/overview` route are implemented at runtime
0.4.6/schema 12/observation-v12/camera-v8 with observation-v11 retained, 22
resources and the unchanged two-visible/eight-app-only tools.

`./scripts/check-repository.sh` passed TypeScript, **253 app tests with 3,559
assertions**, **21 lifecycle tests**, **24 shipping tests** and the repository
contract. Focused optional-domain regressions pass **48 tests/494 assertions**.
All three bundles built; standalone `--help` and `codesign -vvv --verify`
passed; six emitted HTML assets exactly match source. SHA-256 is
`a8a4ac06c136cb2769c0c7c51db323fa61e5c4c47251f97804c80d93ad2c22b4`
for `public/widget.html`,
`49a523c56dc00963c2e060e3be23b608b9f866b92ff8e0f8d780716e638d40b4`
for `public/dashboard-index.html`, and
`9f5596444b47d4290d2f5425ebcba0251bec181945eda5f4dfe5b212dcc35754`
for the validation-only signed runtime. Independent validation reports **926
assertions** green with no remaining source finding. This includes hostile
tile-state/receipt/headline mismatches, bounded mapped reasons, all 720 domain
completion orders, and real store→projection→widget initial/retained-offline
cases. Offline status-backed headlines are neutralized while independent stale
or fresh cavity evidence remains renderable.

This is static/software and local fixture evidence only. No Git delivery,
service, auth, Tailscale, printer, mounted-host, browser/device visual or user
acceptance is claimed.

## 2026-08-31 E compact Overview — design/source checkpoint

The design role inspected current repository contracts and exact source with
read-only `git status`, `git rev-parse`, `cat`, `sed` and `rg` commands. Exact
base was `e7262d7426ab94dca264e04a9d7a32276f287ea1`. Current source still projects
Overview as deferred while already maintaining six independently timed domains
for Materials, Environment, Queue, Bed Mesh, Current Job and Job History. This
establishes the implementation gap and reuse boundary; it is not runtime proof.

Decision 0021's completion addendum, decision 0029 and OBS-015 freeze explicit
Overview fan-out to main status plus those six domains, exact reuse of the eight
accepted projectors, per-domain receipts, privacy-minimized structured content,
coverage-only complete/partial/none and one compact top-information/single-bottom-
Refresh card. No new reader/cache/timer/normalizer, giant map, nested full card,
camera/media, private job/Queue/mesh detail, navigation or control is accepted.
Target is 0.4.6/schema 12/observation-v12/camera-v8, 22 resources with
observation-v11 retained and unchanged two-visible/eight-app-only tools.

No app/test/Git/service/printer/browser mutation occurred in this design pass.
No E software, protocol, exact-SHA, deployment, live-printer, rendered visual or
user acceptance is claimed. `git diff --check` is the only design-record gate;
all later evidence must be recorded separately.

## 2026-08-31 D Current Job/real History — PR51 deployed

Exact PR51 head `30f1c7bb407d08d19d390acf2b5704a30eff010f` passed formal and
independent approval. It merged as
`23f07e37de668fcbf2677a9a9b27bf01448cc8e7` at
`2026-08-31T23:10:43Z`. Guarded shipping installed exact release
`20260831-23f07e3-pr51-resume-20260831T191106-be85c4` and created rollback
snapshot `20260831T191118-908e33`; no rollback was required and no D deployment
failure occurred. BOTH services were explicitly restarted and are loaded,
healthy and integrity verified at **0.4.5/schema 11/observation-v11/camera-v8**.
Sixteen security checks pass; configuration, OAuth and routes were preserved.
Served widget/index SHA-256 prefixes are respectively `1830fa11…` and
`e9847d7c…`. Tailnet index, Current Job and Job History each returned 200.

Source gates pass **247 tests/3,402 assertions**, **21 lifecycle** and **22
shipping** checks. The corrected independent matrix passes **197 assertions**,
not the earlier provisional 213 count. Required bundles, signing and exact-asset
checks pass.

Exactly **one Current Job POST** returned known/fresh at
`2026-08-31T23:11:46.006Z`: `printState=complete`, storage inactive and reported
file position equal to reported file size. No filename, model/project identity or
raw numeric runtime value is recorded. This proves only a last-reported terminal
job with no active storage, not a currently active job or job outcome acceptance.

Exactly **one Job History POST** returned known/fresh at
`2026-08-31T23:11:46.255Z`: page count 20, with 17 Completed and 3 Cancelled rows
in preserved returned order. No filename, job ID, row time, raw row or grand-
total claim is recorded. This proves only the bounded returned-page projection at
that instant. Browser/device visual evidence was unavailable; visual and user
acceptance remain unverified. These rollout records are documentation-only and
do not require another deployment.

## 2026-08-31 D Current Job/real History — design/source checkpoint

The design role read current repository contracts and exact source with these
read-only commands:

```sh
git status --short
git rev-parse HEAD
cat AGENTS.md
cat docs/iterations/CURRENT
cat docs/decisions/0025-separate-current-job-and-job-history.md
sed -n '1,180p' docs/decisions/0029-complete-white-read-only-widget-suite.md
sed -n '1,150p' docs/requirements.md
sed -n '225,290p' docs/requirements.md
rg -n "job_history|Current Job|Job History|jobs" plugins/u1-print-studio/app/src
```

Exact base was `517f1de05c27d6ad32bc3c2a4d702ecf29b77033`. Current source
projects `jobs` only from shared status filename/storage and hard-codes
`job_history` as unknown/not implemented; it has no independent receipt or real
history normalization. Queue already provides the bounded private filename
pattern but not a shared Current/History reader. These findings define the gap;
they are not implementation or runtime evidence.

The official Moonraker History API, Printer query API and printer-object
reference were inspected at their current documentation URLs. They establish:
history `count` is rows returned, the fixed list parameters, seven statuses and
the private/raw response fields; print_stats and virtual_sdcard field units and
their persistence after pause/completion/error until reset or a new job. They do
not establish the connected U1's current objects, history availability, data
accuracy, printer health or physical acceptance.

Decision 0025's addendum, decision 0029 and OBS-014 now freeze: exact fixed GETs,
separate receipts/15-second attempt TTL/coalescing/stale retention/fixture
isolation; safe-basename/private-field exclusion; contextual persisted-filename
semantics; all current/history statuses; page-only count/order/duplicates; exact
bounds/units and empty/partial/unsupported/unavailable states; and two compact
top-information/single-bottom-Refresh cards with no controls. Target is 0.4.5/
schema 11/observation-v11/camera-v8, 21 resources with observation-v10 retained
and unchanged two-visible/eight-app-only tools.

No app/test/Git/service/printer/browser mutation occurred in that design pass.
Source, independent, exact-SHA, release and scoped live evidence subsequently
completed in the rollout above; rendered visual and user acceptance remain
separate and unverified. `git diff --check` was its only design-record gate.

## 2026-08-31 C Fans & Chamber — PR49 deployed

Exact PR49 head `c14e92cfc655d0b7a6e7d0138650d7937789d7d1` passed formal
and independent approval without findings and merged as
`3ab4ed7813a8f2ba45ac63b3093480183c428f28` at
`2026-08-31T22:21:37Z`. Exact release
`20260831-3ab4ed7-pr49-resume-20260831T182603-74d978` and rollback snapshot
`20260831T182614-2d2722` were produced with the actual pinned Bun 1.3.12 runtime.
BOTH services were explicitly restarted and are loaded, healthy and integrity
verified at **0.4.4/schema 10/observation-v10/camera-v8**. Sixteen security checks
pass; configuration, OAuth and routing were preserved and no rollback occurred.
Widget/index SHA-256 values are
`af27b363c91934a69962e18f84f0a0cc16f231d3d5e93f51d1e652dea89d4f3d`
and `7381f1d19a25ba139328013b9456949ddd4e9a62d860b484f1477859eeb6b4b9`.
Tailnet index, Fans and Thermals each returned 200.

Exactly **one Fans POST and one Thermals POST** shared
`sourceObservedAt=2026-08-31T22:27:06.974Z`. Fans was known/fresh: Tool 1 speed
1/RPM 9131.8476; Tools 2–4 speed 0/RPM 0; Cavity fan speed 0.698039/RPM
2400.5964; purifier `powerDetected=false`, mode null, exhaust/inner fan rows
`not_reported`. Thermals environment was known/fresh and Cavity was known at
33°C. This proves only the bounded telemetry projection at that instant. It does
not prove sensor/RPM accuracy, fan or purifier health, safety, installation or
physical acceptance. Browser/device rendering and visual acceptance remain
unverified.

Deployment chronology preserves two non-installing failures. The ship wrapper,
invoked after manual merge, refused preflight with `PR must be open...` and made
no changes. A first post-merge stage selected an ASDF shim; dry-run failed
`bun exit127`, made no install or rollback, and the old 0.4.3 services remained
verified. Bad staged release
`20260831-3ab4ed7-pr49-resume-20260831T182443-ab31ae` remained staged but
inactive and was never installed. Retrying with the actual Bun 1.3.12 executable
produced the successful release above.

## 2026-08-31 C Fans & Chamber — frozen source evidence

The design role read current contracts/source and inspected pinned primary
sources without contacting the printer:

```sh
git clone --depth 1 --filter=blob:none https://github.com/Snapmaker/u1-klipper.git <TEMP>/u1-klipper
git -C <TEMP>/u1-klipper sparse-checkout set config klippy/extras
git -C <TEMP>/u1-klipper sparse-checkout add lava
git -C <TEMP>/u1-klipper rev-parse HEAD
```

The resolved source was `10f2f69714c059f1dee0423db4f515b8a01f5388`.
`lava/printer.cfg`, `klippy/extras/fan.py` and `purifier.py`, plus Moonraker's
printer-object reference, ground decision 0029/OBS-013's exact fixed route,
names, fields, units and purifier detection/mode semantics. This is public
source/config evidence, not proof of the connected printer's current firmware,
object availability, purifier installation, sensor accuracy, fan operation or
physical safety. The temporary clone is outside the repository. Historical
cavity/fan/purifier results below are not reused as current evidence.

The source target was runtime 0.4.4/schema 10/observation-v10/camera-v8, twenty
resources with observation-v9 retained and unchanged two-visible/eight-app-only
tools. The design pass made no app/Git/service/printer mutation; source approval,
release and scoped live evidence subsequently completed in the rollout above.
Author gates passed 234 tests/3,263 assertions, TypeScript and the required
build/signing checks. Independent validation passed 18 focused tests/1,134
assertions including the exact production widget VM and 120 race orders, plus
the repository, lifecycle, shipping, three-bundle/code-signing and six exact-
asset gates. Formal and independent review approved the exact PR49 head recorded
above without findings. Source validation used software fixtures only.
The allowed browser remains unavailable; no screenshot, interaction, device or
visual pass is claimed. `git diff --check` is the only design-record hygiene
gate and will be recorded after initial freeze.

## 2026-08-31 B Queue integration — PR47 deployed

Formal review approved exact head `1068add` without findings. PR47 merged it as
`6d76f9ac1c1c6daded28f3b0b945c934e56504e0`; guarded shipping installed exact
release `20260831-6d76f9a-pr47-20260831T172710-645971`. BOTH public/dashboard
services were explicitly restarted and are loaded, healthy and integrity
verified at **0.4.3/schema 9/observation-v9/camera-v8**. **Fourteen exact static
and sixteen security checks pass**; configuration/authentication/routes were
preserved and no rollback occurred. Installed widget/index match frozen hashes
`76d356cc287f11e400f896640162134bcabf8ca8b0ce883a2e46ed1024564092`
and `626348d296d8748e83c7a4e7732656694de3b1dc3ece259fb1e92bb1ce32c0b6`.
Independent postdeployment verification confirms all **15 manifest files** and
both service targets match merged source/release; both are loaded/healthy/
integrity verified. **Three health and seven exact local/tailnet static checks**
pass, including widget, directory and Queue host assets.

Exactly **one** private Queue refresh returned a **known/fresh, paused, empty**
Queue with source/checked time `2026-08-31T21:31:36.003Z`, total/displayed count
zero, not truncated, at observation version 2. The exact served widget executed
in a transient VM and verifies truthful current-empty/state/time semantics, no
ETA, bounded rows, information above one bottom Refresh, and corrected grammar.
No raw filename, job ID or payload was persisted/logged; no camera, mesh, other-
view, control, service, auth, routing or file mutation occurred in this pass.
Visual/browser/device acceptance remains unverified. This docs-only rollout
record does not require another deployment.

## 2026-08-31 B Queue integration — frozen source evidence

The design role read current contracts and active records, then inspected the
reviewed foundation using these actual read-only commands:

```sh
git show --stat 4fbb96c7201398c125006cafc5050b84a875af1e
git show 4fbb96c:plugins/u1-print-studio/app/src/application/queue-observation.ts
git show 4fbb96c:plugins/u1-print-studio/app/src/adapters/moonraker-queue.ts
```

Decision 0029's Queue addendum and OBS-012 now specify focused integration and
software/protocol acceptance without broadening read authority. Foundation
evidence below remains historical source/protocol evidence, not proof of the
new integrated widget. The candidate contract is runtime 0.4.3/tool schema 9/
observation-v9/camera-v8 with nineteen resources, retaining observation-v8 and
prior aliases without adding tools. Author checks pass **223 app tests/3,150
assertions**. Independent validation passes those repository suites plus **21
lifecycle, 22 shipping and 15 focused tests/7,049 assertions**, TypeScript/diff
checks, all three bundles/code signing and six exact emitted HTML assets. The
three foundation files match `4fbb96c`. Frozen widget SHA-256 is
`76d356cc287f11e400f896640162134bcabf8ca8b0ce883a2e46ed1024564092`;
index is `626348d296d8748e83c7a4e7732656694de3b1dc3ece259fb1e92bb1ce32c0b6`.
Formal review found the prior singular summary `1 jobs`; author changed only
the widget and focused test to render `1 job is not displayed` while preserving
the plural form. Focused author checks pass 44 tests/1,565 assertions; full
223/3,150, TypeScript/diff, three-bundle and code-signing gates reran green.
Focused test SHA-256 is
`5448fa6d6b57f02c95e2f2381957751c85006e95143550ac807827437945b51f`.
Renewed independent validation specifically covers singular 1, plural 2 and
large-count 900 omission summaries, finds no issues, and made no runtime calls.
Exact-SHA review and release receipts were pending at this source checkpoint
and completed in the rollout above; no Queue acquisition, merge, service
deployment/restart or visual/device pass is claimed by the source evidence alone.

Historical predeployment boundary correction: during final contract inspection the validator ran the
compiled `dist/u1-print-studio doctor --json`; that command unintentionally
performed **one general read-only status observation** and reported reachable.
It performed no Queue, camera or mesh read; no control, service, auth or config
mutation; and retained no payload. Runtime commands stopped afterward. The
source validation results above remain fixture-backed, and this event does not
replace the one scoped postdeployment Queue observation completed in the PR47
rollout record above.

The coordinator reports fresh allowed-browser runtime URL selection failed and
browser inventory was empty. Rendered/layout/keyboard/browser acceptance remains
unverified. The user's standing exact-review/merge/deploy/BOTH-service restart/
verification order allows their own visual review after delivery; software and
deployed-byte evidence must stay separate from it. No raw Queue payload,
private basename or local identifier is retained in repository records.

## 2026-08-31 Heads reference refinement — PR45 deployed

Independent formal review approved exact head
`e369ca4d53867b1904af5326b38f4b92b82ea3b0` without findings, independently
passing 41 widget tests/1,537 assertions. Guarded execution merged PR45 at
`2026-08-31T19:27:56Z` as `90d9f9d353c7bca2c299ab7ae949ad81e7d4faca` and
installed `20260831-90d9f9d-pr45-20260831T152746-190348`. Actual operator command
(private pinned runtime path redacted):

```sh
uv run --no-project scripts/u1_ship.py --pr 45 --reviewed-sha e369ca4d53867b1904af5326b38f4b92b82ea3b0 --bun <ABSOLUTE_PINNED_BUN> --execute
```

Execution completed in 18.3 seconds. BOTH public/dashboard services were
explicitly restarted and are loaded, healthy and integrity verified at
**0.4.2/schema 8/observation-v8/camera-v8**. **Fourteen exact static and sixteen
security checks pass**; configuration/authentication/routes were preserved,
no rollback. Installed widget matches
`419ec788ea4b9546e93c31a46419ed13b4490b57a64f337e7e7ccc6d8ad43214`;
camera and index bytes are unchanged. Independent postdeployment verification
passes, with actual read-only commands:

```sh
uv run --no-project scripts/u1_service.py status
plutil -convert json -o - <PRIVATE_SERVICE_PLIST>
tailscale serve status --json
```

The plist command ran for both existing services. Inline Node file/crypto
checks independently hash all **fifteen manifest files per service** and confirm
both selected releases/source match the merged identity above. Inline Node
HTTP/HTTPS requests pass **three health checks** (both local services and private
tailnet dashboard) and **seven exact static checks** (public widget, plus local/
tailnet widget, directory and Heads route). No on-disk validation script/report
was created.

Exactly **one** private `POST /dashboard/tools/call` invoked
`refresh_printer_observation` with `{view: heads}`: all **four physical heads**
are known, status is fresh at `2026-08-31T19:30:19.879Z`, and material is
independently known/fresh at `2026-08-31T19:30:20.028Z`. The exact served widget
executed against that payload in an inline Node VM passes **35 assertions**:
all four valid colors derive matching wash/swatch/hex/copy data, while physical
identity, active state and independent freshness are retained. Calculated
secondary-text contrast is at least **5.51:1**. This proves deployed bytes and
production-script behavior against a real read-only payload, not browser layout
or native clipboard behavior. No further acquisition, copy, camera/mesh/control,
service/auth/routing mutation or file edit occurred in this independent pass;
raw payload/palette never reached disk/log and were discarded from retained
Node state. The user has the live Heads review link; browser/device visual and
native clipboard acceptance remain unverified. These docs-only rollout records
change no application bytes and require no new deployment.

## 2026-08-31 Heads reference refinement — historical frozen source checkpoint

The design role opened the exact selected 1554 × 1012 Heads image and read the
current contract/iteration. Decision 0029's addendum and OBS-010 record the
bounded actual-color wash/exact-hex-copy contract; no acquisition or controls
are added. Source is 0.4.2/schema 8/observation-v8/camera-v8, eighteen resources,
with observation-v7 retained as a current-asset alias. The coordinator
reports fresh allowed-browser discovery returned no available browser. No
implementation screenshot, matched comparison, browser interaction or console
check exists for this refinement. Visual/device acceptance remains unverified.
The user's standing reviewed merge/deploy/BOTH-service restart/verify order
remains in effect. Actual design-role checks: Product Design's
`user_context_preflight.py` ran through `uv run --no-project` and reported no
saved context; `git diff --check` passed. Unified shell startup failed with
`Too many open files`; read-only Node file/process access allowed these checks
without changing service state.

Author checks ran in the app directory with pinned Bun 1.3.12:

```sh
bun --no-env-file --config=/dev/null install --frozen-lockfile
bun --no-env-file --config=/dev/null test src/observation-widget.test.ts src/app.test.ts src/bed-mesh.test.ts src/cli.test.ts src/status-dashboard.test.ts src/personal-oauth.test.ts
bun --no-env-file --config=/dev/null run check
git diff --check
```

All pass: **106 tests/2,290 assertions**, TypeScript and whitespace checks.
The initial observation-v7 alias expectation was corrected, then the complete
focused command reran. No dependency or lockfile change. Frozen widget SHA-256:
`419ec788ea4b9546e93c31a46419ed13b4490b57a64f337e7e7ccc6d8ad43214`;
focused test: `f3eae6a8a5fa36ec1c0117a1822604172b68a4f035421bca818f829480a8ce46`.
Camera remains unchanged at
`32c8038a4abe5d8f9277294a5fd50584930dd4a24ea2bfc2546af32d8c847f4e`;
index, normalized acquisition, mapping, and shipping scripts are unchanged.
Independent validation on those exact widget/test hashes passes:

```sh
bash scripts/check-repository.sh
bun run bundle
bun run bundle:server
bun run bundle:runtime
codesign -vvv --verify dist/u1-print-studio
git diff --check
```

The repository command ran from root with pinned Bun 1.3.12 on PATH; bundle and
signature commands ran from the app directory. Results: **200 app tests/2,855
assertions, 21 lifecycle, 22 shipping**, TypeScript and repository contracts pass.
All three bundles/signature checks pass; **six emitted HTML assets plus inlined
index** compare exactly with source. Six non-widget public assets and Bed Mesh/
Progress function blocks are byte-identical to baseline `8336c19`.

Separately, the validator executed an inline `node:vm` production-script harness
through `mcp__node_repl__js` (no on-disk fixture script): **seven scenario groups,
86 fixtures/751 assertions** pass. Coverage includes 63 RGB/alpha combinations,
16 invalid inputs, stale/presence/injection/physical slots, accessibility
structure, and Copy success/rejection/unavailable/duplicate/detached/refresh
behavior. Worst calculated text contrast is **5.5126:1**. Harness-only grid-regex
and template-literal decoding corrections did not change product bytes. Initial
formal source review reports no findings and independently passes **41 widget
tests/1,537 assertions**; exact committed-candidate approval remains pending.
These are source/VM/arithmetic checks, not browser or real-printer evidence.
No Heads merge, deployment or restart is claimed by this source checkpoint.

## 2026-08-31 F reported Bed Mesh surface — PR43 deployed

Independent exact-head approval bound
`41546d9e3ea841bdd23279694079719327f39f39`. The read-only shipping plan passed,
then guarded execution merged PR43 at `2026-08-31T19:00:51Z` as
`92a62c04c22600ee802d7be3c0b27285135f6d33` and installed exact release
`20260831-92a62c0-pr43-20260831T150042-2e7c64`. Actual operator commands
(the private pinned runtime path is deliberately redacted):

```sh
uv run --no-project scripts/u1_ship.py --pr 43 --reviewed-sha 41546d9e3ea841bdd23279694079719327f39f39 --bun <ABSOLUTE_PINNED_BUN>
uv run --no-project scripts/u1_ship.py --pr 43 --reviewed-sha 41546d9e3ea841bdd23279694079719327f39f39 --bun <ABSOLUTE_PINNED_BUN> --execute
```

Execution completed: BOTH public/dashboard services were explicitly restarted,
loaded, healthy and integrity verified at **0.4.1/schema 8/observation-v7/
camera-v8**. **Fourteen exact static and sixteen security checks pass**.
OAuth/environment/config/routes were preserved; no rollback was needed.
Installed widget matches `c800447957bf8b7b386ddba7666941f625170db92107d31230c5f382378d77f6`;
index matches `6e195671cee0ee8aad37a20aa9582472796a7cffff5ee8f88f455467600397af`;
camera bytes are unchanged. Private receipts remain outside Git.

Separate independent post-release verification passes. Actual read-only
commands (private paths deliberately redacted):

```sh
uv run --no-project scripts/u1_service.py status
uv run --no-project <PRIVATE_VALIDATION_DIR>/verify-live.py
shasum -a 256 <PRIVATE_VALIDATION_DIR>/verify-live.py <PRIVATE_VALIDATION_DIR>/POSTSHIP_REPORT.json
```

Both services match the exact release/source above, with **fifteen installed
manifest files per release** verified. **Fourteen local and thirteen tailnet
exact static checks**, plus tailnet health, pass. Widget and unchanged camera
bytes match the expected source. Exactly **one** private Bed Mesh refresh
returns **known/fresh/active, 11 by 11, 121 vertices**, with its own receipt
`2026-08-31T19:03:22.696Z` and valid bounds/summary. No raw matrix, labels,
printer identity or private host is recorded. The validator made zero other
printer/camera calls and no service/auth/routing writes; only private
verification files were created outside Git. Redacted report SHA-256:
`74360c0801ee0bc663fd7073a0ba0edcd1f57e9c72db93cdb864571bdfef1a58`;
script SHA-256:
`7c1ba838ba502df3037a0256be148e47193a185e2ad7bc954b95434f7a1b6710`.
These checks establish deployed bytes and one read-only domain acquisition,
not rendered chart behavior, calibration quality or device/visual acceptance.
The user has the live Bed Mesh link for visual review; automated and actual-
device visual acceptance remain unverified. No printer controls, calibration,
profile mutation, auth/routing change or plugin reinstall occurred. These
docs-only rollout records change no app bytes and require no new deployment.

## 2026-08-31 F source checkpoint — historical predeployment evidence

Decision 0030 and OBS-009 record the user's selected Fluidd surface interaction
inside the delivered white card. Current order is A (deployed) → F → B → C →
D → E; all other widget tracks remain active. F implementation
targets 0.4.1/schema 8/observation-v7/camera-v8 with seventeen resources.
The **P2 centroid-depth-sort occlusion defect is corrected**. On intermediate
corrected widget `ae8df4d02fe9f2bd117262925c6201b1597252c7d9d79306dc4d7df8d980d34f`,
formal review provisionally approved source, with independent
per-point geometry checks reporting **1,134 scenes/26,185 overlapping points,
zero wrong front faces**. The separate validator's sweep reports **810 scenes,
115,560 points, 17,751 overlapping points, zero wrong front faces**, and the
original reproducer passes. These are numerical/software checks, not browser
captures or an exhaustive proof over all possible input data. Final corrected
source validation is recorded below; exact-candidate-commit approval remains pending.
No merge, deployment, service restart or real-printer result is established by
this source checkpoint. The confirmed deployed baseline remains the release A
receipt below; its evidence does not validate changed F bytes.

### Final corrected source — independently validated, exact-commit review pending

The final small correction places each reported point after its last incident
face so point marks do not draw through nearer surface faces. Frozen widget
SHA-256 is
`c800447957bf8b7b386ddba7666941f625170db92107d31230c5f382378d77f6`;
observation-widget test SHA-256 is
`7cf184f1b356e39d6b67b5f35680ab2aad69486eb5d2f6b9d1363a10779977c6`.
The author reports **35 widget tests/1,415 assertions**, TypeScript and
`git diff --check` passing on this final freeze. The separate validator completed
the final rerun on those exact widget/test hashes:

- `PATH=<PINNED_BUN_DIR>:$PATH ./scripts/check-repository.sh`: **194 app tests/
  2,731 assertions**, **21 lifecycle**, **22 shipping**, TypeScript and repository
  checks pass.
- The four private fixture test commands shown in the historical baseline
  command block below were rerun unchanged: **22 tests/1,162 assertions** pass.
  Geometry covers **810 scenes/115,560 probe points/17,751 overlapping points**
  with **zero wrong front faces**; original P2 reproducer and independent
  marker-last-incident-face order both pass. Also covered: 64 by 64 data
  (**4,096 vertices/7,938 faces**), zero/nonzero flat grids, extreme/subnormal
  bounds, local controls with zero acquisition calls, state and privacy.
- All seventeen resources return exact bytes with empty external CSP and zero
  acquisition. Two visible/eight app-only tools and 0.4.1/schema 8/observation-v7/
  camera-v8 pass. Camera bytes remain unchanged.
- All three bundle commands, compiled `--help`, offline doctor, `codesign`
  verification and the private bundle verifier in the command block below were
  rerun successfully. Six exact source/dist HTML comparisons and embedded-index
  equality pass, as does `git diff --check`.
- Before/after 62-file tracked app/script manifest is identical:
  `5c4b01132e21c49672fcb778a22be0b2edc6c32ae48bfbd94419d95e57fe9620`.
  Compiled runtime SHA-256:
  `a348749a6f52aaa7cb801848e4a245c7bfad11a0e88277b278139692e77fe98f`;
  server bundle:
  `424a855bdeab500d11cb27efdb7433f6f91499c05383d49415e71352a68c59c9`;
  stdio bundle:
  `fb95d3f6775e55bf1d445758b4d171fdbbef71eb7d8c197baa565f486ac33d1b`.
  Index remains `6e195671cee0ee8aad37a20aa9582472796a7cffff5ee8f88f455467600397af`;
  camera remains `32c8038a4abe5d8f9277294a5fd50584930dd4a24ea2bfc2546af32d8c847f4e`.

The independent reviewer provisionally approves final `c800447` source without
blockers; its checks pass **75 tests/1,807 assertions**, with **1,134 scenes**
and **884 strict marker/face-center checks**. Earlier intermediate overlapping-
point checks are identified above; these are scoped runs, not additive totals.
No unresolved software finding remains. Exact-commit review still must bind the
committed candidate including these records. Validator private fixtures stay
outside Git; no hardware, service, Git, authentication or routing mutation was
performed by validation. Browser/design/device/live/deployment acceptance is
not established. The earlier 99-test author run and pre-fix green counts below
are historical only; they do not replace this final rerun.

### Historical provisional evidence — occlusion defect subsequently corrected

The author ran the following with the pinned runtime; the absolute runtime
path is deliberately redacted. Working directory was `plugins/u1-print-studio/app`:

```sh
<ABSOLUTE_PINNED_BUN> --no-env-file --config=/dev/null test src/observation-widget.test.ts src/bed-mesh.test.ts src/app.test.ts src/cli.test.ts src/status-dashboard.test.ts src/personal-oauth.test.ts
<ABSOLUTE_PINNED_BUN> --no-env-file --config=/dev/null run check
git diff --check
```

Results: **99 tests/1,484 assertions**, TypeScript and diff check pass. These
author checks do not resolve the subsequently identified occlusion defect and
are not independent acceptance of the corrected candidate. Provisional hashes:

- widget: `9bcf4cf0f952e6613819a2665c528b57fe1d33ae5fdcecbbccca12ff0d1c90dd`;
- index: `6e195671cee0ee8aad37a20aa9582472796a7cffff5ee8f88f455467600397af`.

Do not freeze or ship these bytes based on this passing test count. The separate
validator subsequently reported a pre-fix baseline pass: **193 app tests/2,049
assertions**, **21 lifecycle**, **22 shipping**, TypeScript/repository checks,
**19 independent tests/1,133 assertions**, three bundles and ad-hoc signature.
Its 62-file manifest was
`602e7d2db11fea5ac33a5056d9b7a7b1c229fabdcaba279faa5d0cdbd4daec78`.
This was provisional, not final acceptance: the centroid-order assertion did
not establish correct per-point face occlusion. The added regression and
post-fix geometry results above supersede that earlier claim.

Actual independent baseline commands, with private paths redacted:

```sh
PATH=<PINNED_BUN_DIR>:$PATH ./scripts/check-repository.sh
bun --no-env-file --config=/dev/null test <PRIVATE_VALIDATION_DIR>/independent-state.test.ts <PRIVATE_VALIDATION_DIR>/independent-math.test.ts <PRIVATE_VALIDATION_DIR>/independent-controls.test.ts <PRIVATE_VALIDATION_DIR>/independent-compatibility.test.ts
# The three bundle commands ran from plugins/u1-print-studio/app.
bun --no-env-file --config=/dev/null run bundle
bun --no-env-file --config=/dev/null run bundle:server
bun --no-env-file --config=/dev/null run bundle:runtime
<COMPILED_RUNTIME> --help
<COMPILED_RUNTIME> doctor --offline --config <PRIVATE_FIXTURE_CONFIG> --json
codesign -vvv --verify <COMPILED_RUNTIME>
bun --no-env-file --config=/dev/null run <PRIVATE_VALIDATION_DIR>/verify-bundles.ts
git diff --check
```

The bundle verifier confirmed six exact assets and the embedded index. After
adding the per-point occlusion assertion, the independent math run instead
reported **6 pass/1 fail, 914 assertions** and reproduced a nearer surface
being overdrawn by a farther surface. This failing regression supersedes the
earlier passing depth-order claim. The subsequent correction passes this
regression; neither source acceptance nor release follows from those historical
green counts alone.

Design-role actions actually completed: read the selected reference, current
renderer/model/projection and decisions 0027/0029; record decision 0030 and
update OBS-009/BRIEF/WIDGET_TRACKS. The Product Design saved-context preflight
ran read-only through `uv run --no-project` and reported no saved context.
This is design/source inspection, not implementation or independent validation.

Validated software gates cover exact reported vertices/XY mapping, triangulation
without resampling, true disclosed Z multiplier, finite projection/fitting,
numerical axes/legend, asymmetric/flat/extreme/maximum-size fixtures,
pointer/keyboard/reset/mode behavior, 2D fallback and unchanged acquisition,
state/privacy/compatibility/camera boundaries. The separate validator's actual
commands and frozen source hashes are recorded above; synthetic-DOM or
production-script VM results are software evidence, not rendered-browser QA.

The coordinator's fresh in-app browser selection failed and subsequent browser
discovery returned none. Browser/design/device acceptance is **unverified**.
The user's standing sequence permits exact-SHA review → PR merge → exact-build
deploy → explicitly restart BOTH existing services → verify for their visual
review without re-blocking on unavailable automated browser access. Preserve
shipping guards and record actual operator/deployed behavior separately when
performed. No F release evidence exists yet; no calibration, printer control,
auth/routing change or plugin reinstall is authorized.

## 2026-08-31 release A deployed — operator verification

The user explicitly authorized merge → deploy → verify before automated browser
QA to perform their own visual review. Only that ordering gate was changed;
local tests, exact-SHA review, shipping guards and safety boundaries remained.
The final reviewer approved `744f7d06607526a10997b926d91b18087c4030cf` for guarded
shipping under this authority, confirming application/scripts unchanged from
the independently tested source and matching the 62-file manifest below.

An initial **read-only plan** stopped on an uncommitted BRIEF authority edit,
before any external mutation. A scoped documentation commit and renewed
exact-SHA review resolved the dirty-tree condition; no guard was bypassed.
The final read-only plan passed before execution. Actual operator commands
(the private pinned runtime path is deliberately a placeholder):

```sh
uv run --no-project scripts/u1_ship.py --pr 41 --reviewed-sha 744f7d06607526a10997b926d91b18087c4030cf --bun <ABSOLUTE_PINNED_BUN>
uv run --no-project scripts/u1_ship.py --pr 41 --reviewed-sha 744f7d06607526a10997b926d91b18087c4030cf --bun <ABSOLUTE_PINNED_BUN> --execute
```

Execution completed successfully. PR41 merged at `2026-08-31T18:06:04Z` as
`b6142de6241cb2e1b6ac70b509f2d0b0e836f1d8`; installed release
`20260831-b6142de-pr41-20260831T140555-84d50f` reports **0.4.0/schema 8/
observation-v6/camera-v8**. Both public/dashboard services were explicitly
restarted and are loaded, healthy and integrity verified. **Fourteen static
asset and sixteen security checks pass**. OAuth/environment/configuration/
routes are preserved and no rollback was needed. Private receipts remain
outside Git. No printer controls, auth/routing changes or plugin reinstall
occurred. Application bytes are unchanged by the subsequent rollout records;
those docs use a separate PR, not another service deployment.

Independent live verification completed separately using
`uv run --no-project scripts/u1_service.py status`, read-only plist/release
verification and
`bun --no-env-file --config=/dev/null run <PRIVATE_VERIFICATION_DIR>/verify-live.ts`.
The private verifier path is deliberately redacted. Results:

- Both services are loaded/healthy/integrity verified, with exact installed
  release `20260831-b6142de-pr41-20260831T140555-84d50f` and merged source
  `b6142de6241cb2e1b6ac70b509f2d0b0e836f1d8`. Both loopback health endpoints
  return HTTP 200 and the current version contract.
- All four user-facing tailnet directory/camera/progress/heads pages return
  HTTP 200 HTML. Six source-defined assets match exact source bytes on both
  loopback and tailnet: **twelve independent comparisons**, distinct from the
  operator's fourteen static checks above.
- The source-defined private `refresh_printer_observation` request with
  `view: heads` returns HTTP 200, four physical slots, and **known/fresh**
  materials observed at `2026-08-31T18:08:02.427Z`. Vendor/type/color/reported
  presence are available for all four, subtype for one. No real labels,
  colors, names, identities or raw rows are recorded.
- The source-defined private `get_u1_camera_frame` request with empty arguments
  returns HTTP 200, image/jpeg, **253,183 bytes**, **1920 × 1080**, observed at
  `2026-08-31T18:08:02.952Z`, with valid structural markers. No JPEG was retained,
  live session activated or printer control invoked. This proves snapshot
  acquisition, not image quality, playback, browser/phone or physical acceptance.
- The validator performed no service/auth/routing writes and left no background
  process. Redacted private report SHA-256:
  `989c72c510b92c5657c72184d254b7e85f22b84ddf77ce63b5577ebb5494870c`;
  private script SHA-256:
  `0fba7b6bf6f7594fb9d39bcea24dd94744cbd4203d318b08ecaa506ed86c008c`.

HTML availability is not a rendered visual, camera playback or actual-device pass.
The prior automated visual gate remains unverified, not retrospectively passed.

## 2026-08-31 release A source checkpoint — historical predeployment evidence

Latest local correction: `acdb2e38553418b395269bf71814ec3a5f21af04` changes
percentage text to `#499e69`, computed contrast 3.293:1, and adds its regression
test. Author reports **31 tests/448 assertions** and TypeScript passing.
New focused HTML SHA-256:
`3c97b730290f9b4f35065fd57bcd8f7dbe0680bc0d5339c79a8c6212537fbd9b`.
Independent full revalidation of this exact commit passes:

- `./scripts/check-repository.sh`: **190 app tests/1,761 assertions**, **21
  lifecycle**, **22 shipping**, TypeScript and repository contract.
- The same three isolated independent fixture files named below: **20 tests/
  399 assertions**. All three bundles/signature, runtime help/offline doctor,
  six source/dist HTML comparisons and diff check pass.
- Actual CSS text contrast independently computes **3.292557043498492:1**.
  The 62-file manifest is identical before/after:
  `dca09a45ac122919bcc3621d2cfe182455bb4bfaf98375565d168ba5766e1ca0`.
  Camera/directory hashes below are unchanged; focused widget uses the new
  hash above. Compiled runtime SHA-256:
  `5dde3102cb7859095c8d7b3d6146d37396b5586455eb898ba8a3e76ae652df20`.
- Independent exact-SHA **source-only review approved**, no findings;
  reviewer checks pass **31 tests/448 assertions**, including contrast.
  Approval excludes uncommitted documentation changes, blocked visual QA and
  exact-release approval. No browser/printer/service operation is inferred.

At this predeployment checkpoint PR41's open/draft remote head was `acdb2e3`. The
prior findings/test counts/manifest below are historical checkpoint evidence,
not unresolved contrast findings or current-source hashes.

### Historical prior A checkpoint, superseded by approved acdb2e3

Committed/pushed checkpoint: `a8ac630550b4b193d1538810f45f5eb5aac7a56a`,
[draft PR41](https://github.com/scottchu/orca-slicer-mcp/pull/41). The coordinator
confirmed `OPEN`, draft status and the exact remote head. Independent exact-SHA
source review: **changes requested**, one P2 percentage-text contrast finding
in `app/public/widget.html`: `#60b982` on white measures 2.397:1, below the 3:1
large-text threshold. Reviewer synthetic checks pass **59 tests/671 assertions**
(camera/observation 51/581, material normalization/store 8/90), and its 62-file
manifest matches the frozen value below. No other bounded material/privacy/
concurrency/compatibility blocker was found. Correct and re-review a new exact
candidate; this is neither visual acceptance nor release approval.

Source contract: runtime 0.4.0/tool schema 8/observation-v6/camera-v8, sixteen
resources with retained aliases. Material read/store/Heads and white
focused/camera/index/host presentation are implemented. Progress's lower row is
elapsed-only because no other reference metric is projected; camera uses direct
controls, truthful snapshot refresh feedback and card-level native fullscreen,
with frame/FPS watcher semantics unchanged. This is not merged/deployed source.

Author-reported software evidence: materials 23 tests/202 assertions, Heads
4/40, app 14/120; UI 79/832 and TypeScript pass. Earlier independent exploratory
passes were material 36/459 and UI 6/105. These are scoped runs, not additive
full-suite counts and not browser/physical evidence.

The independent validator ran on the frozen source:

- `./scripts/check-repository.sh`: TypeScript, **189 app tests/1,757 assertions**,
  **21 lifecycle tests**, **22 shipping tests**, and repository contract pass.
- Separate isolated synthetic fixtures: **20 tests/399 assertions** pass via
  `bun --no-env-file --config=/dev/null test <PRIVATE_VALIDATION_DIR>/independent-materials.test.ts <PRIVATE_VALIDATION_DIR>/independent-widget.test.ts <PRIVATE_VALIDATION_DIR>/independent-bundled-static.test.ts`.
  The placeholder redacts actual private paths; generated results remain outside Git.
- All three bundle commands, compiled-binary `codesign` verification, runtime
  `--help`, `doctor --offline`, and six source/dist HTML byte comparisons
  pass. App inventory tests establish the sixteen-resource contract.
- Bundled HTTP checks cover thirteen exact asset routes, health and two
  rejected routes (33 assertions), with zero status/material/mesh/camera
  acquisitions. These are isolated static-route tests, not deployed behavior.
- The 62 app/script-file frozen source manifest SHA-256 is
  `59ee92a7b2180a225b451f13f9ff54db3721634a004437316594bb241bf157f0`.
  It is identical before/after all runs. No formal exact-commit approval is
  claimed here. Final source asset SHA-256 values:

  - focused widget: `fc03a24c48ede9fea1ae22607e74fa31c5ca1c07cb92856efe7e1cc7e9c2bf2b`;
  - camera: `32c8038a4abe5d8f9277294a5fd50584930dd4a24ea2bfc2546af32d8c847f4e`;
  - directory: `0e0daa7448d981c0e4115c3f19871f2802bdaf7347f774d0e215f894273f301e`.

### Shared observation and deployment boundaries

Separate real-printer evidence: the fixed selected-fields `print_task_config`
GET succeeded at `2026-08-31T17:28:34.793Z` with valid material metadata for all
four physical heads. No real per-head labels/colors/raw payload are committed.
This proves read-only data acquisition, not correct mounted-widget rendering,
local Orca preset matching, loaded-spool compatibility or physical acceptance.

Separate deployed baseline: coordinator checked both existing service health
responses and both still report **0.3.5/schema 7/observation-v5/camera-v7**.
No new deployment, restart, GitHub merge, authentication/routing change, printer
control or plugin reinstall occurred during this checkpoint.

The coordinator's browser runtime could not obtain `iab`; after troubleshooting
the browser list was empty. Isolated headless permission was requested but is
not granted. The validator's current `design-qa.md` explicitly says **blocked**.
There are no current reference-to-render captures, browser interaction results,
visual approval or actual-device acceptance. The combined muted camera
state/FPS/time label still differs from the reference's differentiated text and
vertical separators; visual QA must assess that fidelity gap. Direct controls
are an allowed design choice, not a claim of exact visual identity.
Draft PR41 records this software-only state; merge/ship must wait for required
visual QA and exact-release review. Queue foundation is locally committed as
`4fbb96c7201398c125006cafc5050b84a875af1e` on `feat/u1-queue-completion`:
standalone adapter/model/tests, three files only. Independent bounded
source/protocol review **approves**, closing the prior provider-shaped
credential-basename P2 from `c4e0754`. Independently rerun TypeScript,
**40 tests/461 assertions** and the unchanged six independent fixtures
(**68 assertions**) pass; exact HEAD, clean worktree and diff check confirmed.
The explicit provider-pattern checks run before filename truncation.

Final adapter SHA-256: `416d6084ee81e052d12f2c53e87788a5d17e2f79ebbbc376579ce9d45d670f59`;
test SHA-256: `fd9b9aeaa9714804523996e595207bfe89dd3f06d801ae497d282d908ab06596`;
unchanged private fixture SHA-256:
`7a67caa07842a26728b6bb7c51071a75178eb5aeae3053cdea261610384b4a28`.
No store/projection/widget integration, visual/release/deployment or printer
acceptance is implied. B–E source work may continue in stacked branches during A's visual
permission wait; sequential independently reviewed release order is unchanged.

## 2026-08-31 all-widget completion design checkpoint

Design-role evidence only; no new implementation, independent review, merged
source, deployment, restart or mounted-device acceptance is established here.

- Read repository guidance/current state/requirements/iteration, roadmap,
  bed-mesh adapter/store/projection and accepted decisions 0025/0027/0028.
  `git log -3 --oneline` confirmed starting main `bf3eb26` and its policy merge.
- Read Product Design image-to-code/router/critical/user-context instructions;
  `uv run <PRODUCT_DESIGN_SKILL>/scripts/user_context_preflight.py` returned
  no saved user context. Skill root is redacted here, not a repository artifact.
  Opened both selected camera/progress references; retained genuine camera
  media and froze white/header/continuous-progress anatomy in the track matrix.
- Read pinned primary source through HTTPS: OrcaSlicer `82cedc0`
  `SnapmakerPrinterAgent.cpp` and Snapmaker `761718a` `SSWCP.cpp` (decision 0029
  links). Confirmed actual `filament_`-prefixed arrays, positional slots,
  RRGGBBAA, and legacy integer low-24-bit color. This is source-contract
  evidence, not a current firmware/version or spool observation.
- Coordinator reports browser discovery found neither in-app nor Chrome
  availability; isolated headless permission was requested. Visual capture,
  interaction checks and new design-QA acceptance remain pending.
- A separate read-only capability researcher reports at
  `2026-08-31T17:24:39Z`: `GET /server/job_queue/status` succeeded with paused
  state and zero rows; `GET /server/history/list?limit=3&start=0&order=desc`
  returned three completed rows; fixed cavity/fan/purifier object queries
  returned 25 C, zero speed/RPM and purifier power not detected respectively.
  These are observed-data capability checks, not implemented widgets or
  physical-print acceptance. No private row names/IDs/raw data are recorded.
- `git diff --check` passed after the design records/requirements were updated.
  This is whitespace hygiene only, not independent software or visual review.

All new release gates in `WIDGET_TRACKS.md` are pending until their owning
implementer, validator, reviewer and operator record commands actually run.

## 2026-08-31 PR38 bottom-status/FPS deployment verification

After the operator shipped reviewed head
`a35c92c813d669bef696fefbbc87ee7bd5390630`, merged as
`b565eecc30ec394137483f4619a523807b59e538`, and restarted both services, the
independent validator ran
`bun --no-env-file --config=/dev/null run verify-bottom-live.ts` from an
outside-repository verification directory.

- Both live health responses returned 200 with **runtime 0.3.5 / schema 7 /
  observation v5 / camera v7**.
- The private camera asset returned 200 and exact reviewed SHA-256
  `1f706d665a5f811793160b2afb2cd620bb381903673bc5047e159c1948ba6cac`.
  The existing private tailnet `/dashboard/camera` page also returned 200.
- All four probes were health/static GETs. No tool, snapshot, stream, printer
  operation, service mutation, or authentication/routing change was invoked.

The redacted report remains outside Git, SHA-256
`f407ec8f7fb4743c8d3c41b39f1db0b9aa4235242b186a62dc32af21a76e76f8`.
This independently verifies deployed contract and exact asset availability.
The native-browser regression below proves the software repair with synthetic
local video; neither layer proves the user's currently mounted device has
refreshed or that real-printer live FPS is visible there. Operator-owned full
14-static/16-security, integrity and preservation checks are separate evidence.

## 2026-08-31 Bottom camera status and native frame-observer regression

The user's bottom-left camera information request is a camera-only layout
exception. Observation-card anatomy is unchanged. The missing-FPS report was
investigated with real browser media/frame callbacks, separately from the
earlier manually supplied counter fixtures and without contacting the printer.

### Reproduced mechanism and repair

- The independent `capture-native.mjs` fixture used a local canvas video
  stream with the browser's native `requestVideoFrameCallback` timestamps and
  `presentedFrames` metadata. It did not override clocks, counters, video
  playback state, or frame-callback scheduling. Only peer signaling and MCP
  host replies were synthetic; no RTC network or printer media was used.
- On the previous camera source, ordinary native playback correctly showed
  about 30 FPS at 320/390/720 pixels. Repeating the same peer's `ontrack` event
  reproduced missing FPS while video remained live. Actual callback metadata
  showed duplicate counter pairs, for example 46/46, 47/47 through 55/55.
  Multiple observer chains repeatedly invalidated the FPS baseline. This is
  reproduced software-defect evidence, not proof of the user's phone cause.
- On the final source, retiring the previous observer and generation-guarding
  callbacks preserved FPS after the same repeated-track event. The native
  regression displayed 31 FPS rather than losing the rate; normal runs were
  approximately 30.2–30.4 presented frames per second and displayed 30 FPS.

### Final independent gates

- `./scripts/check-repository.sh`: **172 app tests / 2,253 assertions**, **21
  lifecycle tests**, **22 shipping tests**, TypeScript and repository contract
  passed. Source is **0.3.5 / schema 7 / observation v5 / camera v7**; camera
  v6/v5/v4 remain current aliases, with fourteen total resource URIs.
- App commands `bun --no-env-file --config=/dev/null run bundle`,
  `run bundle:server`, `run bundle:runtime`,
  `codesign -vvv --verify dist/u1-print-studio`, and current camera source/dist
  `cmp` passed. Observation HTML and both frozen legacy HTML assets remain
  byte-identical to the merged baseline. `git diff --check` passed.
- `node capture-native.mjs <FIXTURE_ORIGIN> --final` and the same command with
  `--duplicate --final` passed on the frozen source. Six final review images
  were opened: native live at 320/390/720, snapshot and rejected display mode
  at 320, and repeated-track playback at 390. Native measured rates matched
  the displayed rounded FPS; the complete timestamps, bottom-left status and
  bottom-right 44-pixel controls had no overlap or horizontal overflow.
  Narrow widths wrapped the information above the intact control cluster.
- The additional `--fallback --final` run checked native live-to-fallback
  behavior at 320 pixels in the actual DOM. Fallback kept its full snapshot
  time, omitted FPS, and preserved all three 44-pixel controls without overlap.
  All native runs reported zero external requests and zero page errors.
- Browser contexts closed in `finally`. The exact owned fixture server was
  identified and stopped after validation. No user browser profile, real
  camera acquisition, service mutation, authentication/routing change or
  printer command was involved. Actual user-device confirmation and exact
  merged-build deployment remain separate gates.

SHA-256 fingerprints (reports and images remain outside Git):

- Final camera: `1f706d665a5f811793160b2afb2cd620bb381903673bc5047e159c1948ba6cac`
- Native pre-fix reproduction: `57ca2da36c04df8099d770d8ec5d62f637332692b1ebcb9aa1b6181d2ce853e6`
- Final native/layout report: `10749eadf74b25c0b8fe09e98eef8b12070f35542c5f19492fc9212ca22261a6`
- Final repeated-track report: `a6d759172ed3ed1452509a236e2150dce7bd7cf9d3c1bc5c1b7293d4be5fcff0`
- Final fallback DOM report: `e94291541f112d61bc09cc66fc5ee4fb962626db7db1795c8ab7283840bd7d56`

## 2026-08-31 PR36 FPS deployment verification

The operator's successful shipping workflow merged reviewed head
`40d359bd81df3523a32726172f64b045ab027e86` as
`3fc918e5c64b401f497f97144d9c81423877d852` and restarted both services.
The independent validator then ran
`bun --no-env-file --config=/dev/null run verify-live.ts` from the isolated
outside-repository verification directory.

- Both live health endpoints returned 200 and **runtime 0.3.4 / schema 7 /
  observation v5 / camera v6**.
- The private served camera widget returned 200 with exact reviewed SHA-256
  `375bcbefbee47e1d01a958ad2441594e66b95ff65aa55242d5b058709dcc6182`.
  The existing private tailnet `/dashboard/camera` page also returned 200.
- An initial verification assumption expected the public camera-asset path to
  be available; it correctly returned 404. The corrected verifier checks the
  intended private camera asset. No runtime or routing change was needed.
- Every probe was a health or static GET. No tool call, snapshot acquisition,
  stream allocation, printer operation, authentication/configuration change,
  or service mutation was performed by the validator.

The redacted outside-repository report SHA-256 is
`090530662d0aad25b86a16c620e5df539aab945df992ed206bfbf389a85511af`.
This verifies deployed contract/asset availability, not real-camera FPS,
live-video playback or mounted-phone behavior. The operator's complete
14-static/16-security, integrity and preservation checks are separate evidence;
the independent synthetic FPS checks below remain the measured display proof.

## 2026-08-31 Independent live-camera FPS validation

The user-requested FPS restoration was validated against the exact current
camera source, using synthetic local frame counts and media only. This gate
did not contact a real camera, mutate services, or establish phone/live-video
acceptance. Network-path diagnostics remain absent from visible camera chrome.

- Independent `./scripts/check-repository.sh` passed TypeScript, **170 app
  tests / 2,247 assertions**, **21 lifecycle tests**, **22 shipping tests**, and
  the repository contract. The source reports runtime **0.3.4**, schema **7**,
  observation **v5**, camera **v6**, with camera-v5/v4 current aliases and
  thirteen total resource URIs.
- From the app directory, `bun --no-env-file --config=/dev/null run bundle`,
  `run bundle:server`, `run bundle:runtime`,
  `codesign -vvv --verify dist/u1-print-studio`, and
  `cmp public/camera-widget.html dist/camera-widget.html` passed. Current
  observation HTML and both frozen legacy HTML files are unchanged from the
  merged baseline. `git diff --check` passed.
- The independent command `node capture.mjs <FIXTURE_ORIGIN>` captured **five
  actual-widget images**, all opened by the validator, and passed **twelve
  browser behavior cases**. The isolated host served exact production HTML;
  its media and MCP replies were synthetic and no real peer network existed.
  Screens covered snapshot at 320/dark, rVFC 29 FPS at 320/dark, rVFC 30 FPS at
  390/light, fallback at 320/light and decoded-counter 30 FPS at 720/dark.
- Controlled `presentedFrames` deltas produced 29 and rounded 30 FPS only
  after the one-second measurement window. Both playback-quality and WebKit
  decoded-counter fallbacks measured frame deltas, not four polling ticks per
  second. Repeated counters did not fabricate new frames. Missing, reset,
  invalid and backward counters/times cleared the estimate; missing rVFC
  metadata never switched to an unrelated decoded-counter value.
- The real 1.5-second no-frame expiry hid FPS without advancing the displayed
  time or prematurely entering the existing stall fallback. Close/reopen
  discarded the previous window, and a captured old-peer callback could not
  relabel a newly opened session. Snapshot, loading, unavailable, fallback and
  paused video showed no FPS. Selected ICE fixture stats deliberately included
  `prflx`, `host` and `udp`; none appeared in the visible mode label.
- Narrow screenshots retained the complete time and the existing bottom-right
  44-pixel PiP/fullscreen/Live-or-Close controls without information/action
  overlap or horizontal overflow. The browser report records **zero external
  requests, zero unexpected fixture requests and zero page errors**. Browser
  contexts closed in `finally`; the exact owned fixture server was stopped
  after validation. No user browser profile was used.

Camera HTML SHA-256:
`375bcbefbee47e1d01a958ad2441594e66b95ff65aa55242d5b058709dcc6182`.
Outside-repository browser report SHA-256:
`0f6ac34282a2e1cfda0e419b0ccacff4576b3098c8dc572b3a8544f5f023d3f1`.
These are source/software and synthetic-rendering results. Exact merged-build
deployment and served-asset verification must be recorded separately; neither
would prove real camera FPS or a mounted phone's display behavior.

## 2026-08-31 PR34 deployed-source and real-observation verification

After the authorized shipping workflow merged
`7194361d4a8d7a2291bcc64f1d053eae51a8d99c`, installed that exact merged source
and restarted both U1 services, the independent validator ran
`bun --no-env-file --config=/dev/null run verify-bed-mesh-live.ts
<CLEAN_MERGED_SOURCE> --authorized-postship` from an outside-repository
verification directory. `<CLEAN_MERGED_SOURCE>` replaces the operator's exact
private isolated source path; it was not the unmerged author worktree.

- Both live health responses reported **0.3.3 / schema 7 / observation v5 /
  camera v5**. All **14 static checks** matched the merged source byte-for-byte,
  including both directory roots, focused hosts and current widgets.
- All **16 security checks** passed: every public dashboard route remained
  unavailable, public enrollment remained 404, unauthenticated public MCP
  returned 401 with its challenge, both private listeners rejected MCP, and
  private enrollment health remained available. Separate GET checks of the
  existing private tailnet `/dashboard/` and `/dashboard/bed_mesh` links also
  returned 200 with exact merged-source bytes.
- Exactly one private `refresh_printer_observation(view="bed_mesh")` returned
  **known, fresh, active** reported probe data: **11 × 11**, minimum
  **-0.340833 mm**, maximum **0.066667 mm**, range **0.4075 mm**. Matrix dimensions,
  finite values and ascending bounds were checked. This is a real read of the
  printer's already reported grid, not a new probe, calibration, flatness
  certification or physical-print acceptance. Its observation timestamp is
  server receipt time, not the time that the grid was physically measured.
- Exactly one `get_u1_camera_frame` call, without live authorization, returned
  an available JPEG. The validator opened the image and confirmed a coherent
  printer-interior snapshot. This does not prove live video, ICE/TURN, an
  iPhone/ChatGPT-mounted widget, or user visual acceptance.
- No printer-control, calibration/probe, plugin, authentication, configuration
  or service mutation was performed by the validator. Operator-owned restart,
  integrity and preservation evidence remains distinct from these independent
  health/static/security/data checks.

The redacted report and camera image remain outside Git; no profile name,
printer identifier, private origin/path, full matrix or image was committed.
Report SHA-256:
`ed409fb9db4be681015dda94b35700beb22f079b743e0e20f40167407c00ec68`.
These live results supersede the earlier pending-deployment boundary for
Bed Mesh below; they do not change the paused/unimplemented Queue status.

## 2026-08-31 Shipping build-scratch guard follow-up

The operator's first authorized PR34 shipping attempt at reviewed head
`5a73932476e93e271fd91c4e0f3611696a3c6337` passed its local gates, then stopped
at the clean-tree merge-edge guard because the pinned Bun compiler left a
generated runtime scratch copy in the app directory. The operator reported
no merge or service mutation; this was a safe stop, not a deployment success.

The follow-up ignores only that app-local compiler filename pattern:
a dot, sixteen lowercase hexadecimal digits, a hyphen, eight hexadecimal
digits, and `.bun-build`. It does not ignore unrelated files, similarly named
files elsewhere, malformed names or tracked changes. The shipping script and
its clean-tree guard are unchanged.

- Independent `uv run --no-project scripts/test_u1_ship.py` passed **22 tests**,
  including a real isolated Git regression for the precise ignore pattern and
  retained dirty-tree rejection.
- Independent `./scripts/check-repository.sh` passed again: **165 app tests /
  2,200 assertions**, **21 lifecycle tests**, **22 shipping tests**, TypeScript
  and the repository contract. Earlier 21-test shipping counts below record
  the earlier frozen gate rather than this follow-up.
- The implementation role separately reported a successful 594-module
  `bundle:runtime` and signature check using the actual pinned release-local
  Bun, with the generated scratch no longer appearing as unexpected Git dirt.
  This does not claim that the next guarded shipping attempt has run.
- Current SHA-256: `.gitignore`
  `eca2c77db6f8af1b3ea42b87a58c97e09813b705bd610df35c3470b7dcebfbd6`;
  shipping tests
  `538029f89ca01614d91c821bdea77aef973b112109917545b28c938ac5298fc8`;
  unchanged shipping script
  `49448de3ca32ba52917ec900d478901e2ec3590c887fa5cabddf4e67c9254978`.

## 2026-08-31 Independent reported Bed Mesh validation

This gate validates the isolated Bed Mesh source slice on baseline `7b9c4d4`.
The paused queue worktree was not tested or changed. Bed Mesh production
deployment and real-printer acceptance are not inferred from these fixtures;
the separate PR33 live check below concerns the previously deployed release.

### Source, protocol and packaging

- `./scripts/check-repository.sh` passed TypeScript, **165 app tests / 2,200
  assertions**, **21 lifecycle tests**, **21 shipping-script tests**, and the
  repository contract on the final source below.
- The independent outside-repository command
  `bun --no-env-file --config=/dev/null test independent.test.ts` passed
  **24 tests / 228 assertions**. Six tests exercised the actual curl adapter
  against an ephemeral loopback HTTP fixture: the exact probed-only GET,
  receipt timestamps, no redirects, HTTP/auth/error classification, malformed
  and oversized bodies, disconnection, the real six-second deadline, and
  rejected origins. No printer or real camera was contacted.
- Normalization checks covered asymmetric 2-by-3 orientation, valid all-zero
  data, the complete no-active sentinel, absent versus malformed objects,
  rejection of interpolated fallback, rectangular/finite/coordinate/64-by-64
  limits, and omission of path/control/bidi/private profile information.
- Application checks covered independent 15-second mesh versus 300-second
  status TTL, no background acquisition, cache/coalescing, stale populated
  and inactive retention without retimestamping, successful inactive clearing,
  both cross-domain completion orders, projection isolation, and first-ever
  thrown status failure with a successful fresh mesh.
- Actual SDK calls and actual HTTP handlers verified selected-view acquisition,
  absent-reader no-network behavior, and the production default shared-store
  wiring across separate HTTP MCP app instances. The fixture process pinned
  its only upstream origin to loopback. Two initial fixture failures were
  corrected: the full ten-tool SDK inventory requires a camera-controller
  stub, and Bun's `closeAllConnections()` stopped the timeout fixture listener
  before the final suite. Neither correction changed product code.
- `bun --no-env-file --config=/dev/null run bundle`, `run bundle:server`,
  `run bundle:runtime`, `codesign -vvv --verify dist/u1-print-studio`, and both
  current-widget source/dist `cmp` checks passed. Independent
  `bun --no-env-file --config=/dev/null run packaging.ts` compared all six
  distributed assets, decoded the HTTP bundle's embedded directory exactly,
  and read all **12 resource URIs** through the SDK with zero acquisitions.
  Observation v5/v4/v3/v2/v1, preserved status aliases, and all current/legacy
  camera resources mapped to their expected source bytes.
- Current camera HTML, both frozen legacy HTML assets, and `u1_service.py`
  remained byte-identical to `7b9c4d4`. Runtime contract is **0.3.3 / schema 7 /
  observation v5 / camera v5**, with two model-visible and eight app-only tools.

### Actual isolated browser evidence

`node capture.mjs <FIXTURE_ORIGIN>` loaded the exact source widget through an
isolated synthetic bridge, not a mock replacement UI. Chrome 152 captured
**nine images**, all opened by the validator, with **15 behavior checks** and
**28 private/public/invalid route checks**. Widths 320/390/720 and light/dark
states covered asymmetric normal, flat, stale, inactive, retained inactive,
unsupported, malformed, hostile profile and extreme high-precision bounds.
DOM-only cases additionally covered offline status with fresh mesh, the full
4,096-cell grid, unknown and unavailable states.

- Four distinct corner titles proved X increases rightward and Y increases
  upward; min/max/range and the domain's own receipt time matched the fixture.
  Flat grids had a uniform fill. Unknown/error states had no fabricated grid
  or timestamp. Selected refresh called only `bed_mesh`; failed widget refresh
  preserved the grid/time and placed the error in the header.
- An actual narrow-screen failure exposed clipped long Y-axis labels. The
  author changed visible axes to bounded compact labels while keeping complete
  bounds in accessible text and precise per-cell titles. All nine final
  captures passed axis bounding-box, no-overflow, information-top and
  44-pixel bottom-action checks. The redundant visible explanatory paragraph
  was removed; the receipt-versus-probe-time distinction remains accessible.
- The final browser report records zero external requests, zero console/page
  errors and zero status/mesh/camera/session-acquisition counters. The static
  directory has nine links, with Bed Mesh implemented and Queue still not
  implemented. This is not phone-mounted or physical-bed acceptance.
- Browser contexts closed in `finally`; the exact owned fixture server was
  identified and terminated successfully. Artifacts remain outside Git.
  Intermittent shell process-limit errors were handled through the existing
  isolated Node execution path, without killing unrelated processes.

Frozen SHA-256 evidence:

- Widget: `23cf86a83143ba7480521baf12c0e05ee7777faea350de29cde055fd63ffbce5`
- Adapter: `c6522e0429f0b9338292a3c3f90d6be9936bd058754a75ab300bc553f4f2f9cb`
- Store: `991ba530f1acb5fa65da3ae143ab3be939b781254bbe6e632b240af0c73aa995`
- Directory: `66fda75a7f849febd35f09c6557027984a363fbbebbf996aaf3387e49b0424be`
- Browser report: `c7c6409a6bd3c20f82c8c1033faee0991f806381dc5bc99e7dcd6b2158c88908`
- Independent protocol fixture: `903435cd9eee64dfe6b300e53cdfa95fd69e8d757a61e58df5364e306e2f1df1`

### Repository shipping workflow checks

The final full gate above includes the shipping script's 21 fixture tests.
The independent command `uv run --no-project ship_independent.py` additionally
passed **seven method-level tests** outside the repository, rerun after the
pinned-runtime fix. They invoked the actual `Operations.verify`, `restart`
and `validate` methods with synthetic lower-level dependencies rather than
only replacing the complete orchestration methods.

These checks exercised each service's loaded/healthy/integrity/runtime/release
identity, changed manifests and preserved-configuration rejection, static and
security failure propagation, exactly both restart targets, and early stop at
each of six local command failures. They parsed the actual source's **14 static
assets/routes and 16 security checks**, injected failures at each boundary,
and verified the HTTP helper's fixed ports/routes, disabled proxies/redirects,
timeout and bounded response handling. No real GitHub, launchctl, service,
printer or camera action was used in these fixtures.

Skill Creator's structural check passed via
`uv run --offline --no-project --with pyyaml
<SKILL_CREATOR>/scripts/quick_validate.py .agents/skills/u1-ship`.
`<SKILL_CREATOR>` substitutes for the installed local skill path. Structural
validation is not a behavioral skill approval; the independent reviewer's
forward scenarios are separate. The validator did not invoke `--execute`.

Final SHA-256 fingerprints:

- Shipping script: `49448de3ca32ba52917ec900d478901e2ec3590c887fa5cabddf4e67c9254978`
- Shipping tests: `49c8924b48c6c0aa8c202f0304a0a0f1b074398d54d564088da61958420349a9`
- Repository gate: `37f0d63ff5308dd0e84f65e2b95f690bf24cae3252da575de29fe3cf9f80f1ad`
- Shipping skill: `b1d7547e5ccb46f1014be28b351883d5ec45deb2eb3371771e7926c6c9e557e8`

## 2026-08-31 Independent PR33 live verification while Bed Mesh is in progress

After the authorized operator deployed merged PR33 (`7b9c4d4`), the independent
validator ran `bun --no-env-file --config=/dev/null run verify-pr33.ts` from
an isolated, outside-repository verification directory. This was a read-only
check of the already deployed Current Job/Job History release, not acceptance
of the unmerged Bed Mesh implementation.

- Both service health responses reported **0.3.2 / schema 6 / observation v4 /
  camera v5**. Thirteen static responses matched the clean merged source
  byte-for-byte: both directory roots, both current widget assets, and all nine
  focused hosts.
- Seven boundary checks passed: public directory, Job History and enrollment
  routes rejected with 404; unauthenticated public MCP returned 401 with its
  authentication challenge; private dashboard and enrollment MCP routes
  returned 404; private enrollment health remained available.
- One explicitly authorized read-only `get_u1_camera_frame` call through the
  private dashboard bridge returned an available JPEG. `authorizeLive` was
  omitted. The validator opened the saved image and confirmed a coherent
  printer-interior snapshot. No live-view session, camera authorization token,
  printer control, authentication change, or service mutation was performed.
- The verifier, redacted report and camera image remain outside Git. The
  report SHA-256 is
  `918a39c438c989d9b2a460fe38e1f2af755d0ed32b02227d0902685f3529411a`.
  Private origins, runtime identifiers and camera contents are not copied
  into repository records.

This proves the PR33 deployment's service/static/security boundaries and one
real snapshot response. It does not prove a mounted iPhone/ChatGPT widget,
live video, ICE/TURN connectivity, Bed Mesh acquisition, or physical-print
acceptance. Operator-owned configuration/authentication/route-preservation
evidence is separate from these independent probes.

## 2026-08-31 Current Job and Job History split validation

This source-only change preserves `jobs` as Current Job and adds the separate
`job_history` view. History normalization remains unimplemented; a widget and
route are not evidence that previous jobs were acquired. Information remains
at the top and actions at the bottom. No service deployment, plugin change,
real-printer observation, or hardware acceptance was performed in this gate.

- Independent `./scripts/check-repository.sh` passed TypeScript, **148 app
  tests / 2,011 assertions**, **21 lifecycle tests**, and the repository
  contract. This includes current/history projection separation, explicit
  unknown history provenance, missing-current-identity semantics, selected
  refresh isolation, the closed route/tool inventory and compatibility
  resources, plus existing segmented-progress and camera regressions.
  Runtime reports are **0.3.2 / schema 6 / observation v4 / camera v5**;
  observation v3/v2/v1 aliases remain readable. The inventory is eleven
  resource URIs and two model-visible plus eight app-only tools.
- `bun run bundle`, `bun run bundle:server`, `bun run bundle:runtime`,
  `codesign -vvv --verify dist/u1-print-studio`, and both current-widget
  source/dist `cmp` checks passed. A separate Bun assertion decoded the
  HTTP bundle's embedded directory string and compared it exactly with its
  source. The segmented layer-position/render/update block exactly matches
  merge baseline `47bfd37`; current camera HTML and both frozen legacy HTML
  files are unchanged against that baseline. `git diff --check` passed.
- Skill validation initially reported missing `yaml` in the no-project
  interpreter. The bounded offline retry succeeded without installation or
  live plugin mutation, from `plugins/u1-print-studio/app`:
  `uv run --offline --no-project --with pyyaml
  <SKILL_CREATOR>/scripts/quick_validate.py
  ../skills/u1-observe-printer`.
  `<SKILL_CREATOR>` replaces the local installed skill path in this sanitized
  command record.
  The source routes current/active/unqualified Jobs requests to `jobs` and
  previous-job/history requests to `job_history`.
- The independent `jobs-server.ts` loopback fixture used the actual source
  HTTP handler and exact production widget HTML. Its injected printer-status,
  camera-frame and five camera-session operations throw if called; all seven
  counters remained **zero**. Synthetic current-job data was passed through
  the actual projection factory. The inspected fixture host supplied bridge
  responses; it did not call an operations adapter or access printer media.
- `node capture-jobs.mjs <loopback-fixture-origin>` passed **30 HTTP route
  checks**: both directory roots return exact source with no-store/CSP;
  POST on either root returns 405; all nine focused hosts return exact
  production host HTML with hidden host chrome; both roots and all nine
  focused routes return 404 from the public-disabled handler; six invalid
  paths, including the unintroduced `current_job` alias, fail closed.
- **Six actual screenshots**, all opened and visually inspected, cover
  Current Job at 390/light, unknown current identity at 320/dark, Job History
  at 390/light and 720/dark, and the nine-link directory at 320/light and
  720/dark. Fresh isolated Chrome **152.0.7977.65**, Playwright **1.55.0**,
  device scale 1, `en-GB` and UTC were used. All layouts fit without
  horizontal overflow, and controls/links meet 44-pixel targets. History
  displays “Not implemented yet” and an unavailable observation time, not
  an empty-history success or the current job's filename.
- **Nine additional checks** passed: three projection assertions; selected
  refresh and foreign-view-result isolation for each of the two cards; and
  complete nine-link keyboard order, visible focus and a stubbed history-link
  destination at each directory width. The history module contains no
  current-job data and has `unknown` / `not_implemented`, `not_observed`
  provenance and null source time. Missing current identity remains unknown,
  not “No active job”. Each click emits exactly its own selected-view refresh.
  No initial observation-widget tool calls, external requests, or console/page
  errors occurred in these fixtures. The shared observation envelope is not
  claimed as proof that history was obtained.
- Fresh browser contexts and the browser closed through the harness cleanup;
  the exact validator-owned fixture process was terminated and its session
  exited successfully. Repeated transient exec-spawn “Too many open files”
  failures delayed validation, but no user process was killed. One initial
  harness assertion incorrectly expected a `data-view` attribute; it was
  corrected to exact host-source comparison. A literal bundle comparison
  also needed JavaScript escape decoding. Neither was a production defect.
  All required gates subsequently completed on the frozen source below.

Artifact fingerprints (SHA-256; fixture files and captures remain outside Git):

| Artifact | SHA-256 |
| --- | --- |
| Current observation HTML | `96bc93a05960f8a9af1923d93ceda0db0a33814eac5a3ef1a5e8e5e42554b572` |
| Observation projection | `2ec8a9b17c76d7d4d7d0ec6e3a995408a35c4855076fed173d0e124abbe63d7e` |
| Directory HTML | `267acf63214c9ab23df92007a3fd3667b247d66f7d76fcb3c9116c1ed75acbc2` |
| Unchanged current camera HTML | `0a66e1cc0c75e6769655d60cf92bc50ba80b2fc98ebb2ca6f23559fd07e0a483` |
| Independent jobs capture report | `1f382ab0b7e211bf3c47ae31177fc9257d417f64e901ead7f904a6e46b16e1d8` |
| Current Job, 390/light | `81bca4f7ec4ee524d5d866b82df1f2a293ee5b818ec72e08f74648b85f05c3dd` |
| Unknown current identity, 320/dark | `fe9c66f89462f194c7601fce8033842b51f45c99cd95a2d6f736148257985438` |
| Job History, 390/light | `0c36d9b334316c9375a0896bc62040a3e99304e99a40bd2de0ec4cdf5a9b91cd` |
| Job History, 720/dark | `e344d9cc08a47bd37958b8612de2df578c7dc6888acf44ec72f7d2198366c077` |
| Directory, 320/light | `3b4e7c6b472e020339ed9c6af6c603985c0b5c67fb5f9ff853e7f42dcfc19d32` |
| Directory, 720/dark | `ca2eb4d29857496eb7c781c9b97b3131d784630d7f8d6e241a257a60cda68716` |

## 2026-08-31 top-information and bottom-actions validation

The user's newest direction supersedes the earlier bottom-timestamp placement:
observation time, freshness and refresh errors now belong beneath the title;
only actions remain in the footer. Camera information occupies a top stack,
including loading/unavailable text and display feedback; its previously
reviewed control cluster remains at bottom right. Earlier entries below record
historical acceptance, not instructions to restore the superseded placement.

- The independent `./scripts/check-repository.sh` run passed TypeScript,
  **144 app tests / 1,931 assertions**, **21 lifecycle tests**, and the repository
  contract. Existing segmented-layer and camera behavior regressions passed
  alongside the new header/footer and loading-guidance structure tests.
- All three bundle commands, standalone signature verification, and exact
  source/bundled comparisons for both current widget assets passed. The
  camera module script exactly matches `081929e`; both frozen legacy HTML
  files remain unchanged. Current observation and camera HTML intentionally
  changed, so their earlier whole-file hashes are not claimed unchanged.
  `git diff --check` passed.
- A reused, inspected loopback fixture served exact production HTML to fresh
  isolated Chrome `152.0.7977.65` contexts through Playwright 1.55.0. Captures
  used device scale factor 1, `en-GB`, UTC and selected light/dark themes.
  Camera JPEG/canvas-video data and host signaling were synthetic; an RTC
  substitute prevented real media-peer creation. Requests were restricted to
  the loopback fixture/data URLs, with service workers and background
  networking disabled. Zero external requests and console/page errors were
  recorded.
- **Ten screenshots** cover Progress at 390/light, Heads at 390/dark,
  Thermals at 320/light, stale Progress at 720/dark, refresh failure at
  320/dark, loading failure at 390/light, and camera Snapshot at 320, Live at
  390, display rejection at 720 and unavailable state at 320. The validator
  opened and inspected all ten actual captures. Every checked layout fits
  without horizontal overflow; informational content precedes actions.
- **Fourteen additional DOM/behavior cases passed.** Eight verify each
  shared observation view independently: exactly one timestamp in its header,
  refresh errors in the header, one action-only footer, 44-pixel controls,
  and none of the removed read-only/current-reading/provenance copy. These
  capture-only mounts made no tool calls.
- The remaining six cases cover: a real 15-second loading deadline with
  guidance above the Retry-only footer and recovery to supplied data;
  pending/error resize preservation; camera Live-to-Close placement;
  narrow display-rejection stacking; camera loading information at the top
  without controls; and a complete missing-time camera label at the top.
- The resize check inspects the **actual browser DOM**, not the VM test's
  stand-in node. After an explicit synthetic refresh, 390-to-720 regrouping
  preserved the disabled button and header time. After a supplied failure,
  720-to-390 regrouping preserved the exact visible header error and time.
  There was only the one explicitly requested fixture refresh.
- Camera information and the three unchanged bottom controls do not overlap.
  Display feedback flows below the top status pill at both 720 and 320 pixels.
  At 320, `Snapshot · Time unavailable` remains fully visible at the top,
  without clipping, with all three 44-pixel actions below it. Loading and
  unavailable messages are top information; only the decorative empty-camera
  icon remains centered.

Actual commands were `bun --no-env-file --config=/dev/null run
fixture-server.ts`, `U1_INFO_FIXTURE_ORIGIN=<loopback-fixture-origin> node
capture-info-layout.mjs`, and the bounded supplementary
`check-info-missing-time.mjs` command with the same origin. App checks used
`bun run bundle`, `bun run bundle:server`, `bun run bundle:runtime`,
`codesign -vvv --verify dist/u1-print-studio`, and `cmp` for both HTML assets.
An exact module-script extraction/comparison against Git confirmed camera
JavaScript identity; `git diff --exit-code 081929e --` with the two legacy
asset paths confirmed their identity. Reports and captures remain outside Git.
All browser contexts and the fixture server were closed after verification.

| Final artifact | SHA-256 |
| --- | --- |
| Observation widget | `3fe2bb3460ddb8e75ddb19b363b396a859c64822601db9b2d6781b8cce6e4f2b` |
| Camera widget | `0a66e1cc0c75e6769655d60cf92bc50ba80b2fc98ebb2ca6f23559fd07e0a483` |
| Unchanged camera module script | `2d53b9ab7c30456f6ccfdc6519b05a442f92df2a5ab605fa859c5fe968b44811` |
| Private logical information-layout report | `6d30d233c106079c12b3d759f3fc9bb70a486dd4c9610c41391d13d6114ccc78` |
| `info-progress-fresh-390-light.png` | `403be51ca8072fb9c26e74b24aded1a11e3ff47aaa1deb4328d82ba9428d7eb3` |
| `info-camera-snapshot-320.png` | `058577994e74208d7c13b23981d8a16a5aa680f4d8a50588d4ab9eae8ab38707` |
| `info-progress-loading-failure-390-light.png` | `3fefde548ce8f0093acd18e7f225718c703a5179f49bfc1f5013e2b1c9066ad4` |

This accepts source/software and rendered synthetic fixtures. Independent
formal/design review owns its own verdict. No real printer, production service,
live private URL, plugin, authentication state or routing was accessed or
changed. Merge, deployment, actual mobile-host behavior and user acceptance
remain separate for this newest PR32 refinement.

## 2026-08-31 bottom camera-control cluster validation

The independent validator checked the narrow presentation follow-up that
moves PiP and fullscreen beside Live/Close. Only the current camera markup and
styles change; exact module-script comparison against `ba09653` passed with
the unchanged JavaScript hash recorded below. The segmented observation widget
and both frozen legacy HTML files also matched `ba09653` exactly. This does
not alter their previously recorded evidence or deploy either PR32 refinement.

- `./scripts/check-repository.sh` passed TypeScript, **143 app tests / 1,865
  assertions**, **21 lifecycle tests**, and the repository contract. The
  independent rerun includes the author-added bottom-cluster regression plus
  existing camera display, frame-time, live, fallback and visibility tests.
- `bun run bundle`, `bun run bundle:server`, `bun run bundle:runtime`,
  `codesign -vvv --verify dist/u1-print-studio`, and exact source/bundled camera
  `cmp` passed. `git diff --check` passed.
- The inspected existing isolated camera fixture served exact production
  HTML with a synthetic JPEG and a synthetic canvas video track. An explicitly
  substituted RTC adapter prevented peer/network media creation. Chrome
  `152.0.7977.65`, Playwright 1.55.0, a fresh context, device scale factor 1,
  `en-GB`, UTC and dark mode captured **five screenshots**: supported Snapshot
  controls at 320/390/720 pixels, Live at 390, and rejected display mode at 320.
  The validator opened all five actual captures for inspection.
- All supported controls share the same bottom-right parent in PiP,
  fullscreen, Live/Close order. Measured targets are at least 44 by 44 pixels,
  with 8-pixel gaps; controls never shrink, wrap internally, overlap the status
  pill, or leave the image. At 320 pixels the complete status pill stays on a
  row above the right-aligned cluster. There are no remaining top controls,
  document overflow, console/page errors, or external requests.
- **Five focused behavior cases passed**: Live-to-Close retains the cluster;
  host-bridge fullscreen/PiP each enter and exit through the relocated buttons;
  genuinely unsupported controls remain hidden when both host and native
  capabilities are absent in the fixture; rejected display feedback remains
  above and separate from the bottom controls at 320; and the longer
  `Snapshot · Time unavailable` pill stays fully visible without clipping,
  ellipsis or control overlap at 320.
- The host display responses are simulated grants and the video is synthetic.
  These checks exercise the existing production handlers and browser layout;
  they do not establish native phone PiP, actual fullscreen host behavior,
  printer camera transport or physical acceptance.

Actual commands were `bun --no-env-file --config=/dev/null run
fixture-server.ts` and `U1_CAMERA_FIXTURE_ORIGIN=<loopback-fixture-origin>
node capture-camera-controls.mjs`. Requests were restricted to the loopback
fixture/data URLs, service workers were blocked, and background networking
was disabled. Private fixture scripts, screenshots and the logical report
remain outside Git. The browser/context and loopback fixture were stopped
after the final pass. No production service, private live URL, plugin,
authentication state, routing or printer was accessed or changed.

| Final artifact | SHA-256 |
| --- | --- |
| Camera widget | `c7691461c0500370f01d5d2a40bd88229045a3e9d1ad4b5a4b9f468ab233c526` |
| Unchanged camera module script | `2d53b9ab7c30456f6ccfdc6519b05a442f92df2a5ab605fa859c5fe968b44811` |
| Unchanged segmented observation widget | `974153b569af5ba4c9ec4e69454c91f62acd1f5cb0bb23fd0d993e36ea074dfb` |
| Private logical camera-control report | `38083b9e8e0bba3a93dbd37b4561fdb492566d17ecc7e753a70d82572af64b09` |
| `camera-controls-320-snapshot.png` | `58b73851b532ed541ffd517f7477262fe88fbfe201bb036d1aaf87d132bc59cc` |
| `camera-controls-720-snapshot.png` | `93233d2aa707c2048ad93826789925a32892b63267acf41a5dcd766f5ce9bed5` |
| `camera-controls-320-rejection.png` | `851fed0a44e08a00ca217b58898021c022dbfee3cac094d91b8bc12ffcf9ee3d` |

This accepts source/software and isolated synthetic rendering only. Independent
formal/design review owns its separate verdict; merge, rollout, actual mounted
mobile behavior and user acceptance remain separate for this follow-up.

## 2026-08-31 segmented layer-progress validation

The independent validator checked decision 0023's segmented-bar addendum
against the actual current observation HTML, using synthetic observations on
an isolated loopback host. The user's screenshot was opened as the reference;
the requested delta is the bar, not a redesign of the card or footer. No
production service, printer, camera, plugin, authentication or route was read
or changed during this source slice. Previous PR30 rollout evidence below does
not accept deployment of this later change.

### Executed source and browser checks

- `./scripts/check-repository.sh` passed TypeScript, **142 app tests / 1,849
  assertions**, **21 lifecycle tests**, and the repository contract. The
  author-added executable VM cases cover small and grouped totals, safe-integer
  boundaries, zero/end positions, unavailable values, independent percentage,
  accessible values and responsive regrouping. The validator reran that gate
  independently after the author declared the source ready.
- In the app directory, `bun run bundle`, `bun run bundle:server`,
  `bun run bundle:runtime`, `codesign -vvv --verify dist/u1-print-studio`, and
  `cmp public/widget.html dist/widget.html` passed. `git diff --check` passed.
- `git diff --exit-code 16169c0 --` with the current camera and both frozen
  legacy HTML paths passed. Their SHA-256 values remain unchanged; the slice
  does not modify camera behavior or retained legacy resources.
- Chrome `152.0.7977.65` with Playwright 1.55.0, a fresh isolated context,
  device scale factor 1, `en-US` and `America/Toronto` captured **12 screenshots**
  of exact production HTML. Service workers were blocked, background networking
  disabled, and requests restricted to the synthetic loopback fixture/data
  URLs. Every production-widget response was compared byte-for-byte with the
  final source. There were zero external requests or console/page errors.
- Captures cover partial 230/461, complete 461/461 and missing layers at
  390 pixels in light and dark modes; zero and small totals at 390; partial and
  complete at an 882-by-290 reference-sized viewport; and differing 126/461
  layers versus 67.4-percent reported progress at 320/light and 720/dark.
  Full iframe captures include its actual content height instead of clipping
  the footer to the viewport. The validator opened the reference and actual
  partial, complete, mobile, missing-data and fractional-bin images.
- Every valid track retains 14-pixel height and 2-pixel gaps, has at most
  24 narrow or 48 wide blocks, and exposes the exact layer count and grouping
  through one accessible progressbar. Each block's fill was independently
  checked using BigInt integer-bin boundaries; at most one bin is fractional,
  without rounding ahead. Decorative blocks are hidden from assistive
  technology. Zero is empty, 461/461 is full, and a small total has one block
  per layer rather than a fixed number of decorative blocks.
- **Eight additional browser cases** passed: differing percentage/layers,
  invalid over-total layers, unknown percentage with known layers, widths
  320/480/481/720, and a pending-refresh/error resize sequence. Missing or
  invalid layers remain an unfilled neutral track with no current-value ARIA
  attribute and an unavailable caption, even when percentage is known.
- Resize from 390 to 720 preserved the disabled pending-refresh button and
  observation time; resize back after a synthetic failure preserved the error
  and time. Exactly one explicitly clicked fixture refresh occurred, with no
  resize-triggered data request. All capture-only cases made zero tool calls.
  Each checked card retained one bottom observation-time/refresh footer and
  fitted its viewport without horizontal overflow.

Actual private harness commands were `bun --no-env-file --config=/dev/null
run layer-server.ts` and `U1_LAYER_ORIGIN=<loopback-fixture-origin> node
capture-layers.mjs`. The final run included the reviewer's two requested
fractional-bin captures. Private scripts, supplied screenshot, reports and
captures remain outside Git. The isolated browser/context were closed and
the fixture listener was stopped after validation. Independent formal/design
review owns its separate verdict; these assertions alone do not establish it.

| Final artifact | SHA-256 |
| --- | --- |
| Observation widget | `974153b569af5ba4c9ec4e69454c91f62acd1f5cb0bb23fd0d993e36ea074dfb` |
| Unchanged camera widget | `05634036e524693a2c9f9c0f817629968326175a22b98be85d3c28c484ee5e85` |
| Unchanged frozen legacy status | `da9625f5832a4df4e34312999326d241299ed6de9bd4073a60d699d4478db437` |
| Unchanged frozen legacy camera | `c8ef35062ae004ac571501ed99f2810465aa0e12cddbe965918b84d30b476203` |
| Private logical layer report | `4661992712cfc7bbf9c9506ede4be715ec339fbab1863e0a7fcd0848ef61996a` |
| `layers-partial-882-dark.png` | `19e37ac5f4c2ffd3e4b910bd60bbfe742e6e2b7055fa67c1a53f7c27f00a5284` |
| `layers-complete-882-dark.png` | `4b5133a8d66699e851c28113ac276b1fa02821a0c4e5166e51526f445f9f231f` |
| `layers-mismatch-320-light.png` | `9f58b705425110e92e37e717ea240e0de15435d186d2f8578c24737d0f4044c2` |
| `layers-mismatch-720-dark.png` | `c05f638ff5dd6857a79f4e17f0105686be5f9dbb6cef8a03474c53b9769de2f9` |

This is static/software and rendered synthetic-host evidence only. Reported
layer position is not proof of completed physical layers or a completed print.
Merge, deployment, mounted-host behavior, real-printer data and user acceptance
remain separate gates for this segmented-bar change.

## 2026-08-31 authorized merged-service rollout validation

The user authorized merging PR30 and deploying it through the two existing
owner-scoped U1 services. The coordinator merged reviewed head
`1113e05ba0027b80ea6f2cf375a64cfc1704ea47` as
`48a106d2f17550bab8dc8648af1c7c247610a228` and verified equal source trees.
The independent validator reran `./scripts/check-repository.sh` on the clean
reviewed head: TypeScript, **135 app tests / 1,006 assertions**, **21 lifecycle
tests**, and the repository contract passed. The operator separately staged,
dry-ran and installed the merged release; this validator performed no lifecycle
writes, authentication rotation, tool calls or printer acquisition.

### Independently observed deployed result

- Before installation, local public/private and their HTTPS health routes
  reported runtime `0.3.0`, schema `5`, observation-v2 and camera-v4. The
  private `/dashboard` returned 307 and `/dashboard/` returned 404. All eight
  old focused hosts returned 200; old widget asset hashes did not match the
  reviewed new source. This confirmed the user's screenshots showed the
  deployed older presentation, not the corrected source awaiting rollout.
- After the operator reported stable paired installation, the independent
  check at **2026-08-31 14:02:22 UTC** found all four health responses at
  runtime `0.3.1`, schema `5`, observation-v3 and camera-v5. Public auth stayed
  `personal-oauth`; private auth stayed `local-only`.
- Both private directory roots now returned **200 with exact reviewed HTML**,
  including all eight fixed links. Each focused static host also returned 200
  and exactly matched its reviewed observation or camera host. `/widget` and
  `/camera-widget` were byte-identical to the reviewed quiet-footer and
  image-only camera assets. `git diff --exit-code 48a106d --
  plugins/u1-print-studio/app` verified the comparison source still matched
  the merged application tree.
- A fresh isolated Chrome browser opened only the deployed static directory
  at 390 pixels/light and 720 pixels/dark. Both actual HTTPS response bodies
  matched source; both screenshots showed the eight entries without overflow.
  The browser recorded only two directory document requests, zero subrequests,
  zero blocked requests and zero console/page errors. No focused widget,
  iframe, image, video or tool was loaded. The validator inspected both saved
  screenshots; this is deployed navigation evidence, not a new comprehensive
  design review or mounted-phone/printer acceptance.
- Unauthenticated public MCP remained **401**, public enrollment remained
  **404**, and private enrollment health remained **200** over both loopback
  and its existing private HTTPS origin. The public U1 process rejected both
  directory roots and all eight focused paths with **404**.
- The shared public HTTPS origin has a preexisting unrelated root handler:
  `/dashboard` and `/dashboard/` there return its `text-to-cad` document with
  **200**, not the U1 directory. That content hash was unchanged before/after.
  Do not incorrectly report a public-edge 404 or rewrite the unrelated root.
  The private dashboard port remains outside Funnel.
- Independent before/after SHA-256 comparisons of the existing environment
  file, OAuth state, local configuration and raw Tailscale Serve JSON were all
  equal during this check. No values or credentials were printed or committed.
  Existing Funnel-enabled ports and every Serve route were unchanged.

Actual validation commands were `node check.mjs baseline`, `node check.mjs
after`, and `node capture-live-directory.mjs` in the isolated validation
directory. The static adapter used bounded `curl --noproxy '*'` GETs without
redirects and hashed response bodies; file/Serve comparisons recorded hashes
only. Private scripts, reports and screenshots remain outside Git. Browser
contexts and the browser were closed after captures. Both prior loopback
directory-fixture servers were also stopped; no test server remains running.

| Deployed/check artifact | SHA-256 |
| --- | --- |
| Directory response | `1ffc53eefa9842d0741680f1e14d636bb8b2c84401a8382d8c222f39bc263d1b` |
| Observation widget response | `86cf5f4a4e6e29f8aa99cb14c947d20992b7b022c91c75f08642eea0a09837d0` |
| Camera widget response | `05634036e524693a2c9f9c0f817629968326175a22b98be85d3c28c484ee5e85` |
| Private baseline report | `6564c1a6c4478e5f6f5db81d5096f0cbb08d0118a9221f41ad3b92d0ffde5d84` |
| Private after report | `ffd4586cc234654277f0f313b80c43dcc93f3c3a3ccf5eae4d34da736c8da859` |
| Private deployed-browser report | `91a065a4d2749d5fec7cae04227de9e0933cc766424682f59264d0275e3123cb` |
| `deployed-directory-390-light.png` | `2ced4f5fc9ddad88edbab85a7818df20db485fb1dc6e7332ea14cc12a9fde672` |
| `deployed-directory-720-dark.png` | `e92bcb4b066a65fac4085ce8b59e9335388226f258a4b67d9030987e55b6bdd4` |

This accepts merged-source deployment, static assets, navigation rendering and
preserved access boundaries. No local plugin reinstallation was performed.
Actual mounted ChatGPT/iPhone hydration, native phone PiP, real-printer data,
camera transport and physical/user acceptance remain separate. Queue, fans,
bed mesh and other previously unmapped domains remain unimplemented; deployment
does not expand their capability labels into measured data.

## 2026-08-31 private widget directory validation

Decision 0024's directory was checked against the exact production HTML and
private HTTP handler, without production service, printer, camera, plugin,
authentication, routing, merge, or deployment changes. Both private roots now
serve navigation rather than acquiring observations or composing an overview.
The isolated headless path continues the user's explicit approval recorded
below; it does not establish deployed or mounted-phone acceptance.

### Static routes and rendered interaction

- The independent fixture ran the production `createRequestHandler` on an
  ephemeral loopback listener. Injected status, frame, authorization, stream
  open, answer, candidates and close functions counted and rejected any call.
  Every acquisition counter remained **zero** through all checks.
- Twenty independent route checks passed: both roots returned 200 with exact
  source HTML, no redirect, `no-store`, and restrictive CSP; POST returned 405
  with `Allow: GET`; six unknown/encoded/nested paths returned 404; and the
  disabled/public handler rejected both roots and all eight focused paths.
  This tests handler boundaries locally, not the production public edge.
- Chrome `152.0.7977.65`, Playwright 1.55.0, fresh isolated contexts,
  device scale factor 1, `en-GB` and UTC captured **six screenshots** at
  320, 390 and 720 CSS pixels in light and dark modes. Only the fixture origin
  and data URLs were allowed, service workers were blocked, and background
  networking was disabled. No external page requests or console/page errors
  were recorded.
- All captures fit their viewport without horizontal overflow. Each page had
  exactly eight ordinary same-tab links in the prescribed order; every anchor
  was at least 44 by 44 CSS pixels. There were no scripts, iframes, buttons,
  timestamps, removed permission/provenance copy, or automatic widget loads.
- Twelve keyboard checks passed across the six cases: Tab reached the first
  anchor with a visible outline, Enter navigated to its fixed path, and all
  eight anchors were subsequently reached in order. Destination documents were
  intercepted synthetic stubs, not live widget/printer pages. The independent
  design verdict belongs to `design-qa.md`, not these layout assertions.

### Repository and distribution checks

- `./scripts/check-repository.sh` passed TypeScript, **135 app tests / 1,006
  assertions**, **21 lifecycle tests**, and the repository contract. The
  durable dashboard suite covers exact links/content, both roots, method and
  private/public boundaries, focused routes, and zero acquisition.
- In the app directory, `bun run bundle`, `bun run bundle:server`,
  `bun run bundle:runtime`, and `codesign -vvv --verify dist/u1-print-studio`
  all passed. `git diff --check` passed.
- A second isolated fixture imported the actual HTTP bundle copied into a
  release-shaped directory containing only the preexisting six public assets.
  No `dashboard-index.html` file was supplied. Both roots still returned exact
  source HTML, all eight focused static paths returned 200, and all acquisition
  counters stayed zero. This proves the text import embeds the index in the
  HTTP bundle rather than creating a new external runtime-file requirement.
- `git diff --exit-code 00d2c95 -- scripts/u1_service.py
  scripts/test_u1_service.py` passed. Lifecycle asset requirements and manifest
  verification remain unchanged; the existing offline lifecycle suite passed.
  No real old release or rollback was operated. The CLI/stdio runtime does not
  serve HTTP routes, so its unchanged bytes do not need to include this index.
- Current observation and camera source hashes remain unchanged from the
  accepted quiet-footer/camera-overlay pass below. Directory work did not
  restore removed chrome or change those widget behaviors.

Actual harness command forms were `bun --no-env-file --config=/dev/null run
directory-server.ts`, `U1_DIRECTORY_ORIGIN=<loopback-fixture-origin> node
capture-directory.mjs`, and the same fixture with
`U1_DIRECTORY_ENTRY=<isolated-http-bundle>`. A Node assertion checked the copied
bundle's two exact root responses, eight focused paths and acquisition counts.
Temporary adapters, reports and screenshots remain outside Git. Only logical
names and fingerprints are retained here.

| Artifact | SHA-256 |
| --- | --- |
| Directory HTML | `1ffc53eefa9842d0741680f1e14d636bb8b2c84401a8382d8c222f39bc263d1b` |
| HTTP bundle | `71277c30c02f56efce570b2cabf9ea72c29d5810d873b4604b4b22bd6cc7aa31` |
| Unchanged stdio bundle | `aed5f6143babb067b0b9460d1d25fe3c1eb2fbbba32a27e7e73622bc115f58ce` |
| Unchanged standalone CLI | `c6719c0844ca83f50168a2a1ba1ba4dfd5bc22ba4faf8d7a00b45b115019cb15` |
| Private logical directory report | `985905efc0ac9a4436a22f7220b5949d28c2a7951291a0621583c70cc4c40aa3` |
| `directory-320-light.png` | `a3744c3623f7be0e5eb0c15ca684ba80f8d58344311c89e698eb18a1a5b4de82` |
| `directory-390-dark.png` | `02af7f5bed9ce11f7df650504908de592ab91b6f40facc805bc0cf50f302a33f` |
| `directory-720-light.png` | `9f270609574295e446c6d37bcabb553826a5738323bf451073da050efbd1bb9d` |

This accepts source/software and isolated rendered navigation only. The live
dashboard remains on the prior release until separately authorized rollout;
missing telemetry domains, the composed overview, real-printer behavior and
the user's actual phone experience remain unimplemented or unaccepted as
previously recorded.

## 2026-08-31 authorized isolated headless-browser validation

Source/evidence delivery is complete at commit
`643b5dde19d55f6ebed8c572033f726d97599d32`. The coordinator verified the
successful push, matching origin branch and PR30 head, `state: OPEN`, and
`isDraft: true`; the source tree was clean after delivery. This records the
actual source delivery check, not a claim that a later documentation-only
commit has the same hash. Merge, deployment, and actual phone acceptance
remain separately authorized gates.

After the supported browser proved unavailable, the user explicitly approved
an isolated headless-browser check. The validator used a temporary browser
profile/context, the installed Chrome executable, Playwright 1.55.0 installed
only in a temporary fixture directory, and a loopback-only ephemeral fixture
server. Exact production HTML bytes were served unchanged. Request routing
allowed only that fixture origin and data URLs; service workers were blocked,
browser background networking was disabled, and no non-fixture page request
was observed. No production service, printer, plugin, auth state, route, merge
or deployment was changed.

### Captures and behavioral evidence

- Chrome reported `152.0.7977.65`; device scale factor 1, `en-GB`, UTC,
  light/dark color schemes. All eight focused views were captured at 320,
  390 and 720 CSS pixels, plus thermal boundary checks at 400 and 410 pixels.
- Final evidence contains **91 raw screenshots**: 67 final observation
  captures, 22 camera captures, and two additional keyboard/unavailable
  captures. The final observation report records the same widget source hash
  for every capture. Camera bytes remained unchanged throughout the check.
- Every recorded document width fits its requested viewport. Visible controls
  in the main capture matrix have at least 44-by-44-pixel targets. These checks
  do not by themselves constitute a complete accessibility audit.
- Actual browser behavior exercised fresh, stale, offline, missing time/data,
  malformed delivery, refresh failure, a real 15-second loading deadline, and
  retry recovery to a supplied 84-percent observation. Keyboard Tab focused
  Refresh and Enter successfully invoked the selected-view refresh.
- Synthetic JPEGs exercised the real browser image decoder. A synthetic canvas
  stream exercised the production video element and rendered-frame callbacks;
  an explicitly substituted RTC adapter prevented network peer creation. All
  six width/theme camera cases advanced time only while frames arrived,
  froze when frames stopped, and fell back to the accepted JPEG time. This is
  real browser rendering of synthetic media, not real WebRTC/printer evidence.
- Host-mode success, rejection and PiP-to-fullscreen coercion were exercised
  through the fixture bridge. Separately, native Chrome fullscreen entered
  with an actual non-null `document.fullscreenElement` and exited successfully.
  Native phone PiP, floating windows and iPhone host behavior remain untested.
- The recorded 16 explicit boolean interaction checks all passed. Final
  capture runs reported zero page/console errors and zero external page
  requests. The initial synthetic-live fixture failed because its cached
  stream envelope omitted the required transport field; the fixture was
  corrected and the entire camera matrix was rerun successfully. That failure
  was not classified as a production defect.
- Initial captures retained a 1000-pixel fixture viewport, producing blank
  space below cards. Those originals remain separate. Accepted recaptures size
  the iframe to the production main content and its padding; no production
  layout was changed to compensate for a fixture artifact.

The independent designer compared supplied source crops and rendered captures,
then requested three bounded fixes: active-temperature contrast, internal Jobs
copy, and warning/error contrast. The author made those changes. The validator
recaptured the full observation matrix after the last fix. Final computed
warning colors are `rgb(184, 50, 50)` on the light card and `rgb(255, 133, 133)`
on the dark card. Paired visual comparisons and the design verdict belong to
`design-qa.md`; the validator does not substitute assertions for that verdict.

### Final commands and fingerprints

Actual command forms below redact only temporary directory/port values. The
one-off harness, reports, screenshots and supplied private attachments are
retained outside Git; durable VM regressions remain in the app test suite.

- In `<isolated-fixture-root>`, `npm install --ignore-scripts --no-audit --no-fund`
  installed the pinned Playwright dependency without downloading a browser.
- `bun run fixture-server.ts` started the allowlisted loopback fixture adapter.
- `U1_FIXTURE_ORIGIN=<loopback-fixture-origin> node capture.mjs` ran the full
  capture and synthetic-camera interaction matrix.
- `U1_FIXTURE_ORIGIN=<loopback-fixture-origin> U1_OUTPUT_DIR=<final-capture-dir>
  U1_OBSERVATIONS_ONLY=1 node capture.mjs` recaptured final observation bytes.
- `node check-interactions.mjs` checked computed warning colors, keyboard
  refresh and camera-unavailable behavior. `node make-manifest.mjs` recorded
  logical screenshot names, pixel sizes and SHA-256 fingerprints.
- Final `./scripts/check-repository.sh` passed TypeScript,
  **134 app tests / 939 assertions**, **21 lifecycle tests**, and the repository
  contract. `bun run bundle`, `bun run bundle:server`, `bun run bundle:runtime`,
  `codesign -vvv --verify dist/u1-print-studio`, exact source/bundled-widget
  `cmp` checks, and `git diff --check` passed after all three visual fixes.

| Final artifact | SHA-256 |
| --- | --- |
| Observation widget | `86cf5f4a4e6e29f8aa99cb14c947d20992b7b022c91c75f08642eea0a09837d0` |
| Camera widget | `05634036e524693a2c9f9c0f817629968326175a22b98be85d3c28c484ee5e85` |
| Stdio bundle | `aed5f6143babb067b0b9460d1d25fe3c1eb2fbbba32a27e7e73622bc115f58ce` |
| HTTP bundle | `30e1127a2d63292fd5141457753681ea4211f0d13c13464736e3b4871eeaaf78` |
| Standalone validation runtime | `c6719c0844ca83f50168a2a1ba1ba4dfd5bc22ba4faf8d7a00b45b115019cb15` |
| Private logical capture manifest | `0fd623f3138bcaf3e01dcea84677b87d24ecfe9e49cf4535c1a9ff3a1239a4c7` |
| `heads-fresh-390-light.png` (390 by 534) | `83c2173063b0bcdf05cf00df94f57c57bc2e0ac4928850cd58fa60ceee6b81b9` |
| `thermals-fresh-390-light.png` (390 by 899) | `42d9d934d30d7612b0b5d71c9de9e71f93b999ece30c8359ae6c7181e6020212` |
| `jobs-fresh-320-light.png` (320 by 354) | `2524e4c3a7a0e2efbd6ff0ee88e4319513b65fbb98573b40bd80a368c0d20159` |
| `progress-refresherror-390-light.png` (390 by 250) | `b50c19ba66be01523e2be4307dd2436f8ac8121096c89cf9922f035ace9c1ff2` |
| `camera-fresh-390-light-live.png` (390 by 220) | `4066aff1f9ca0aa0740e1e9e23eaea5539f2b0889b05ca44968ef635e7be2b3c` |
| `camera-fresh-390-light-fallback.png` (390 by 220) | `e51368ca36e5e456130cc1e5300a82848a4bc01e27438b332a340783c4dd59d0` |

This accepts an isolated desktop rendering/fixture layer. Actual mobile MCP
mounting, public camera transport, native phone PiP, installation and user
acceptance remain separate gates. Unmapped printer domains remain unimplemented.

## 2026-08-31 independent widget diagnosis and presentation validation

### Baseline truth assessment

The user's supplied phone screenshots show repeated generic waiting shells
after requesting several focused cards. That is observed user-outcome failure,
not evidence that every underlying measurement was fabricated. Independent
read-only inspection of the deployed V2-connected MCP surface returned valid
schema-2 selected-module results for all eight views. The calls shared
observation version 4 and source time `2026-08-31T11:33:28.573Z`; the server
reported reachable/fresh. No camera stream, printer control, authentication,
service, or routing mutation was performed.

| Focused view | Actual implemented data | Explicit missing implementation |
| --- | --- | --- |
| Progress | Real print state, percentage, layers and duration; this read returned 83 percent and layer 371 of 461 | Remaining time is an estimate; no preparation/session correlation |
| Thermals | Four tool actual/target temperatures and bed actual/target; active tool 220/220 and bed 65/65 degrees C in this read | Cavity, heater power and complete heater-state semantics |
| Heads and filaments | Four physical tool slots, actual/target temperatures, available head/active state | Filament material, color and sensor mapping |
| Jobs | Current observed job identity and storage position/size | History and prepared-job correlation |
| Queue | Named unknown-domain response | Queue acquisition/normalization; an empty array is not an observed empty queue |
| Fans and purifier | Named unknown-domain response | Fan/purifier acquisition and semantics; no observed zero-speed claim |
| Bed mesh | Named unknown-domain response | Grid/profile acquisition and normalization; no measured mesh |
| Overview | Explicit unavailable/deferred response | Composition intentionally deferred until focused modules are accepted |

Code evidence is `observation-presentation.ts` (`projectProgress`,
`projectThermals`, `projectHeads`, `projectJobs`, `projectUnknown`, and
`projectOverview`), `observation-store.ts`, and the fixed object-query boundary
in `u1-status.ts`. The unimplemented mappings are hardcoded unknown/null/empty
projections, not a finding that the printer cannot provide those domains.
Private filenames, identifiers, images, and runtime paths are intentionally
not retained in this record.

### Independently reproduced loading defects

Before production edits, the validator executed the exact inline observation
script with `bun -e` and `node:vm` against a synthetic parent/DOM boundary.
Three distinct baseline cases retained `Waiting for printer observation`:

1. A cold mount emitted `ui/initialize` as a notification without a request ID
   or protocol version, then announced initialized without an acknowledged
   response. The camera used a request/response handshake instead.
2. An empty `window.openai.toolOutput` masked a usable structured result in
   `toolResponseMetadata.mcp_tool_result`.
3. A later `openai:set_globals` event carrying metadata only was ignored.

A valid preloaded queue result rendered the named Unknown card immediately.
Thus unsupported domain rendering and the generic waiting shell are separate
problems. The baseline also had no bounded loading failure or retry feedback.
The standalone dashboard accepted the initialized notification even without a
completed handshake, so that permissive fixture did not exercise the cold-host
failure. These are demonstrated software defects; no device bridge log was
captured, so the exact iPhone event path remains unproven.

The baseline thermal SVG trace was a fixed decorative waveform, not sampled
history, and its gray bed-mesh cells did not represent a normalized grid.
Those data-like decorations are removed rather than counted as implemented
telemetry.

### Independent executable validation

- `bun install --frozen-lockfile`: passed, 145 packages, no lockfile change.
- `bun test src/observation-widget.test.ts`: passed 12 tests / 111 assertions
  against the production inline script. The independent validator owns this
  regression file; the production author owns the widget changes.
- Covered: request/response initialization ordering, protocol version and ID;
  direct/nested/metadata result shapes; empty-output and delayed-metadata
  recovery; three isolated mounted-script instances; view isolation; foreign
  and malformed results; finite waiting with reopen/retry guidance; selected
  app-only retry; failed refresh retaining source time, values and stale label;
  one footer per view; missing-time/offline semantics; absence of pseudo-charts.
- Separate formal review found that a new metadata-only event could still be
  masked by an older valid global output. The author prioritized the event
  payload, and independent regressions for both metadata-envelope names prove
  that an existing 42-percent card updates to a supplied 84-percent result.
  This closes a warm-update defect beyond the original empty-output case.
- An interim `bun run check` caught the expected observation-resource tuple
  mismatch while alias/version updates were still in progress. Final full-tree
  results are recorded below after the author hands off stable source.

### Final source gate after warm-update and narrow-thermal repairs

- From the app directory, `bun run check` passed, then
  `bun test src/*.test.ts` initially passed 132 tests / 917 assertions before
  the warm-update and JPEG receipt-time regressions were added. That count is
  intermediate, not the final acceptance count.
- From repository root, `./scripts/check-repository.sh` first passed TypeScript,
  134 app tests / 929 assertions and 21 lifecycle tests after both added
  regressions. Formal review then found a pre-existing narrow-screen selector
  that hid the Actual thermal reading below 390 pixels. The author removed
  that hiding rule and placed the identity above both Actual and Target cells.
  This is a source-level layout repair, not rendered viewport acceptance.
- The final repeated `./scripts/check-repository.sh` passed TypeScript,
  **134 app tests / 931 assertions**, **21 lifecycle tests**, and
  `repository contract: ok` after the narrow-screen repair and two additional
  structural assertions. All three bundles and signature checks below were
  rerun against those final bytes.
- From the app directory, `bun run bundle`, `bun run bundle:server`,
  `bun run bundle:runtime`, and `codesign -vvv --verify dist/u1-print-studio`
  passed. Signing is local ad-hoc validation, not distribution signing.
- `git diff --check` passed. The independent validator did not modify
  production sources, installed plugins, services, OAuth state or routes.

Validated SHA-256 fingerprints:

| Artifact | SHA-256 |
| --- | --- |
| Current observation widget | `488d6b44faabed6884dbc214cb4f7b7ff3d7f7f0723b21b042ea1ec8ec3a1fd2` |
| Current camera widget | `05634036e524693a2c9f9c0f817629968326175a22b98be85d3c28c484ee5e85` |
| Independent observation VM tests | `c675f15364dbf0e675a25d079ce2600417b4a41304f130388469ef14c00075eb` |
| Camera VM tests | `196e8097f0c2798058fe1ccfe2e9d6f8abbc2f52ae0376bd6acefec45ee15526` |
| Frozen legacy status widget | `da9625f5832a4df4e34312999326d241299ed6de9bd4073a60d699d4478db437` |
| Frozen legacy camera widget | `c8ef35062ae004ac571501ed99f2810465aa0e12cddbe965918b84d30b476203` |
| Stdio bundle | `aed5f6143babb067b0b9460d1d25fe3c1eb2fbbba32a27e7e73622bc115f58ce` |
| HTTP bundle | `30e1127a2d63292fd5141457753681ea4211f0d13c13464736e3b4871eeaaf78` |
| Standalone validation runtime | `4adcc4fc7c92e9435add3a1c5ca0e582f37d98fb9a8a3b632b1ed938d5e0a4d3` |

These tests use deterministic VM, DOM and host fixtures. They do not emulate
the actual ChatGPT mobile host, browser layout, accessibility tree, native
fullscreen/PiP, or camera decoding. They are software/protocol evidence only.

### Initial rendered and user-outcome boundary before authorized fallback

At this initial stage the supported browser runtime reported no available browser. The root's
supported discovery check returned an empty inventory; no raw browser bypass
was attempted. Product Design comparison, phone-width screenshots, focus,
overflow, console inspection, and mounted fullscreen/PiP were blocked.
`design-qa.md` initially recorded `final result: blocked`. Supplied screenshots establish
the old layout and failure, not acceptance of the new code. No release install,
service restart, or live test of the changed assets is established here.

### Source review and draft delivery

- Independent formal reviewer verdict: **APPROVE, source-only**, with no
  unresolved findings. Its targeted suite passed 59 tests / 415 assertions,
  and the reviewer verified the exact final observation/camera fingerprints
  above plus the independent 134-test/931-assertion and 21-lifecycle-test gate.
- Source commit `db4e250` is pushed and delivered in
  [draft PR30](https://github.com/scottchu/orca-slicer-mcp/pull/30).
  At initial delivery, `gh pr view 30 --json url,isDraft,state,headRefOid`
  returned an open draft at source commit `db4e250`; a documentation-only
  follow-up does not change reviewed implementation bytes. This completes source delivery,
  not merge, rendered acceptance, installation, or service rollout.
- Next action is an authorized visual-validation path while the supported
  browser remains unavailable, followed by separately scoped rollout after
  acceptance. Unimplemented backend mappings remain unimplemented.
- The delivery-record follow-up changes only `PROJECT_STATE.md`,
  `NEXT_AGENT.md`, this validation record and the current `HANDOFF.md`;
  `git diff --check` passes without changing accepted implementation bytes.

## 2026-08-30 post-merge persistence rollout and restart repair

### Delivery and installed plugin

- PR28 merged as `2160492a4ce63d1409673786ea02b253d7cfaace`. This is the
  deployed app revision; the subsequent repair changes only local lifecycle
  tooling and does not require rebuilding or replacing that HTTP release.
- `bun run bundle:runtime` and `codesign -vvv --verify` passed on the merged
  source. A tracked-source archive was staged with its standalone executable
  and the release `.mcp.json` descriptor. Existing personal source was moved
  to recoverable local Trash before replacement; private backup paths are not
  recorded here.
- Plugin Creator `read_marketplace_name.py` returned `personal` and the
  existing CLI inventory confirmed the intended local source. Its default
  `update_plugin_cachebuster.py` helper preserved base `0.2.0` and generated
  `0.2.0+codex.20260831033612`. `codex plugin add u1-print-studio@personal`
  installed that version. No marketplace or installed-cache file was edited
  by hand.
- Source/stage/cache standalone SHA-256 is
  `c4029f18678e1839c0b005e37bc7401bf84bcc6ed7ef3d19155286253c2f018b`.
  All six production HTML files and five skill folders match merged source.
  Plugin Creator validation and Skill Creator validation for the new observation
  skill passed through the `uv` Python boundary. The installed ad-hoc signature
  check passed separately through `codesign`.
- An independent fresh installed-runtime MCP client verified exactly two
  model-visible and eight app-only tools, all eight resource hashes, and the
  new observation skill without invoking printer tools. This accepts the
  installed descriptor/resources, not a host-mounted widget.

### Service installation and observed restart failure

- The operator ran `uv run --no-project scripts/u1_service.py stage`,
  `install --dry-run`, and `install` with inspected absolute source/Bun paths
  and local release identifiers. Both existing services initially passed
  readiness from the immutable merged release, with copied pinned Bun.
- Independent static checks accepted ten host/asset responses, the progress
  redirect, health/version contracts, public/private route rejection, and
  preserved explicit env/plist fields. No printer acquisition was part of
  those service/static checks.
- The first independent `uv run --no-project scripts/u1_service.py restart`
  (defaulting to all services) failed public-service readiness. The public label disappeared
  after `bootout`; the dashboard was not restarted. A separate explicit
  `start --service public` recovered public readiness. This was a real
  lifecycle defect; successful initial installation did not prove restart.
- Cause: `launchctl bootout` can return before asynchronous job removal.
  `start_one` saw the still-listed job, skipped bootstrap, and then the old job
  disappeared. The repair waits for that exact label to become absent, bounded
  to 30 seconds, before allowing a replacement bootstrap. Timeout fails
  explicitly rather than claiming restart success.
- `uv run --no-project scripts/test_u1_service.py` passed **21 lifecycle
  tests**. Two new tests cover delayed removal and bounded timeout; replacing
  the method with its original implementation fails the delayed-removal
  regression. Independent review approved the narrowly scoped CLI repair.
- Final `./scripts/check-repository.sh` passed TypeScript, **110 app tests /
  759 assertions**, **21 lifecycle tests**, and `repository contract: ok`.
  `git diff --check` passed. Independent final review approved the CLI repair
  and bounded live persistence evidence. Reviewed script SHA-256 is
  `869630f7bed0c2e82408a4b494e527f612ccb476d8b47375ed34fa5021c9e420`;
  regression-test SHA-256 is
  `5a367637bdf8dc0d2716b184ef63cb3841c40ba8ad5c875b8a51ff52670c19c3`.

### Post-repair service and bounded printer evidence

- `uv run --no-project scripts/u1_service.py restart` succeeded after the
  repair: both services received replacement processes and reached the exact
  runtime `0.3.0`, schema `5`, observation-v2, and camera-v4 health contracts.
- The independent validator sent `SIGTERM` to only the exact existing dashboard
  LaunchAgent with `launchctl kill`. KeepAlive replaced that process and
  recovered readiness without any CLI start; the public process remained
  unaffected. This accepts tested process-termination recovery, not reboot,
  automatic login, sleep, arbitrary crash modes, or continuous availability.
- Final `uv run --no-project scripts/u1_service.py status` reported both
  services loaded, healthy, and release integrity verified. Ten static
  host/asset responses matched merged bytes, `/dashboard` returned a 307
  progress redirect, public dashboard routes returned 404, unauthenticated
  public MCP returned 401, and private-dashboard MCP returned 404.
- Independent before/after hashes for private env, OAuth state, owner config,
  and Tailscale routing were unchanged; preserved plist fields matched the
  recovery snapshot. No private values, identifiers, process IDs, or routing
  hostnames are recorded here.
- Separately authorized read-only checks posted only the allowlisted
  `refresh_printer_observation` calls for progress and thermals plus one
  `get_u1_camera_frame` call with empty arguments to the private bridge.
  Progress and thermals reused one observation version/source time and
  reported a reachable printer; cavity stayed explicitly unknown. One valid
  JPEG snapshot was returned. No camera activation, live stream, or printer
  control was requested, and no image bytes or job data were retained in Git.
- A fresh installed MCP client listed/read descriptors and resources only.
  Browser control was unavailable. Visible rendering, mounted Codex/ChatGPT,
  mobile, live video/two-viewer fan-out, and user comprehension remain open.

No upload, start-print, pause, resume, cancel, tuning, G-code, route/auth reset,
Mac automatic login/power change, or mounted-browser acceptance is implied.

## 2026-08-30 persistence integration — pre-rollout evidence

- Milestone: F0. Decision 0022 addresses durable personal HTTP entry points,
  process-scoped shared observations, and recoverable versioned deployment.
- User authorization covers PR28 integration/merge and installed/server
  rollout. Mac login/power, routing/auth changes, and printer controls remain
  excluded. Existing unrelated canonical-checkout edits are preserved.
- Read-only configuration inspection confirmed two existing owner LaunchAgents
  with `RunAtLoad=true` and `KeepAlive=true`, both launching source TypeScript
  through a pinned Bun. The private dashboard uses loopback 8788; protected MCP
  defaults to 8787; private enrollment is configured on 8789. Secrets and local
  printer identifiers were neither printed nor recorded.
- Integrator ran `bun install --frozen-lockfile`, `bun run check`, and the full
  Bun test suite after resolving PR27/PR28 conflicts: **105 tests, 606
  assertions passed**. This is the pre-persistence combined baseline only.
- Final `bun run check` and `bun test src/*.test.ts`: **110 tests, 759
  assertions passed**. `bun run bundle` and `bun run bundle:runtime` passed;
  the local standalone ad-hoc signature is valid. `bun run bundle:server`
  emits the separate bundled HTTP entry and production assets.
- `uv run --no-project scripts/test_u1_service.py`: **19 fixture tests
  passed**. CLI `--help` and `stage --help` matched the documented flags.
  Fixtures cover plist/env preservation, no-stop dry-run, hash/inventory/Bun
  integrity rejection, owner-only/symlink/path checks, loaded-state reporting,
  lifecycle locking, readiness versions, failed-install restoration, explicit
  rollback recovery, stage copying/immutability, and Bun env precedence.
- `./scripts/check-repository.sh`: passed TypeScript, the 110-test/759-assertion
  app suite, all 19 lifecycle tests, and `repository contract: ok`.
  `git diff --check`, plugin validation, and touched skill validation passed.
- Independent final reviewer: **APPROVE**, no blocking findings. Independently
  ran the repository check and verified the exact 10 bundled static host/asset
  responses, progress redirect, and health in an isolated loopback smoke with
  **zero synthetic printer-reader calls**. Verified real Bun explicit env-file
  and plist environment precedence, no ambient dotenv loading, and rejection
  of relative private auth/config paths. This is source/software and fixture
  evidence, not an installed service or mounted-browser result.
- Focused route tests prove the seven named views, public rejection, unknown
  paths, and selected-route-only initialization/refresh. VM bridge tests prove
  source/origin validation, no query-derived selectors, visible initial failure,
  and explicit reload retry. Distinct sequential and concurrent HTTP MCP
  requests share one due-aware snapshot/version; dashboard injection uses that
  same store contract. Frozen status and camera hashes remain unchanged.
- A cold `current()` still acquires the initial observation on demand. Only
  subsequent plain reads are cache-only. Health/static requests never call it;
  this source slice does not add acquisition at startup or a background loop.
- Live deployment, controlled service restart, auth/routing preservation,
  focused HTML/version readiness, mounted host, real printer, and user outcome
  require separate results. Browser control is currently unavailable and no
  visual acceptance is inferred from HTTP success.

## 2026-08-27 post-merge app recovery and live read-only acceptance

### Delivery and installed runtime

- Pull request 20 merged the compatibility-resource repair as `4d4ea2f`.
- Personal Marketplace version `0.2.0+codex.20260827215815` was release-staged,
  validated, and installed. The staged and installed standalone executables
  both had SHA-256
  `2f9398965871c3eefbfac872e6829583ee37a54089a2450f2550d614b8011c12`;
  the installed arm64 Mach-O passed ad-hoc signature verification.
- `codex mcp get u1-print-studio` resolved the portable relative release
  command from the exact installed plugin-root cwd. No user-specific absolute
  path was introduced.
- An exact installed-cache stdio client listed the four model-visible plus
  three app-only read-only tools, listed and read both `status-v4.html` and
  `status-v3.html` with identical content, observed standby status, obtained a
  259,389-byte JPEG, opened one bounded camera offer with one ICE server, and
  explicitly closed it.
- The replaced personal source was moved to a recoverable Trash quarantine.
  Its machine-local path is intentionally not recorded in the repository.

### Deployed service and evidence boundary

- The existing public service was restarted only after the merge. Its
  LaunchAgent and the new separately supervised dashboard LaunchAgent both
  reported `running`.
- Public health, private dashboard page and health, and private enrollment
  health each returned HTTP 200. Unauthenticated MCP returned 401 and public
  enrollment returned 404.
- The existing authenticated remote MCP connection remained usable after the
  restart: it observed standby status and fresh snapshot metadata reporting an
  available 255,860-byte `image/jpeg`.
- The private dashboard bridge opened a real read-only camera session with a
  981-byte SDP offer and one ICE server, then returned `closed: true` for the
  explicit close.
- Existing Tailscale handlers were inspected after deployment. Public 443
  still maps only the prior exact public handlers, private 8444 maps to the
  dashboard listener, private 8447 maps to the enrollment listener, and
  unrelated 8445/8446 handlers remain present. This recovery did not mutate
  routing.
- The first dashboard LaunchAgent start failed because its restricted `PATH`
  omitted the installed Tailscale CLI directory. Adding that fixed path and
  re-bootstrapping the exact dashboard agent repaired the 502; the service now
  listens on loopback and the private HTTPS dashboard returns 200.
- No connected browser-control surface was available. Server-side
  offer/session/close and snapshot transport are accepted, but visible mounted
  video, FPS, UI-triggered Close, PiP, and fullscreen remain unaccepted
  user-outcome evidence.
- No upload, start, pause, resume, cancel, G-code, route mutation, credential
  replacement, or other printer-control action ran.
- `./scripts/check-repository.sh` reran after recording deployment evidence:
  TypeScript passed, 61 tests with 329 assertions passed, and the repository
  contract reported `ok`.
- `git diff --check` passed after the same record update.

## 2026-08-27 mounted-app recovery source validation

### Acceptance and evidence boundary

- Milestone: F0 dual-environment and contract discovery.
- Keep current tool descriptors on `status-v4.html`, read the immediately
  preceding `status-v3.html` URI for retained cards, and preserve empty external
  CSP plus the exact four model-visible and three app-only read-only tools.
- Keep the release runtime command relative to the installed plugin root. A
  machine-specific absolute path is not an acceptable open-source packaging
  repair.
- Static/software and simulated MCP evidence do not prove mounted playback.
  The private `:8444` standalone dashboard is a separately supervised developer
  adapter and its 502 does not prove an MCP or printer failure.

### Diagnosis and commands

- The exact installed cache executable existed, was arm64 Mach-O, passed
  `codesign -vvv --verify`, and printed help from both its plugin-root cwd and a
  minimal clean environment.
- `codex mcp list` resolved the current release command to the exact installed
  plugin-root cwd. The failing task requested `status-v3.html`, identifying a
  retained pre-upgrade task snapshot rather than a missing current executable.
- `bun run check`: passed.
- `bun test src/*.test.ts`: passed 61 tests with 329 assertions. The new
  regression lists and reads both resource URIs and proves identical widget
  HTML, MCP Apps MIME type, and empty external CSP.
- `bun run bundle` and `bun run bundle:runtime`: passed. The standalone runtime
  passed signature verification and printed help.
- An exact compiled stdio client launched the standalone runtime with `/tmp` as
  its cwd, listed v4 and v3, read both resources at 52,470 bytes, and proved
  their text identical.
- Plugin Creator validation passed. Skill Creator validation passed for
  `u1-monitor-print` and `u1-mobile-status-setup`. `git diff --check` passed.
- No live service, OAuth state, Serve/Funnel route, printer, or installed plugin
  was changed during source validation.

## Environment

- Working baseline: `32762dd`
- OrcaSlicer environment: upstream OrcaSlicer `2.4.2` and Snapmaker Orca
  `2.3.5` observed as local candidates; Snapmaker Orca was used for one pilot,
  but the first product backend is not selected
- Printer: redacted private-LAN Snapmaker U1 with Fluidd/Moonraker
- Observed software: Moonraker `1.5.2`, API `1.4.0`, printer software
  `1.5.2.13_20260722102206`
- Validators: primary agent plus independent product and architecture agents

## Commands and results

- `bash -n scripts/check-repository.sh`: passed on 2026-08-23.
- `./scripts/check-repository.sh`: passed with `repository contract: ok` on
  2026-08-23, including the single-active-iteration guard.
- `git diff --check`: passed on 2026-08-23.
- Relative Markdown link check using `perl` extraction plus filesystem checks:
  passed on 2026-08-23.
- Terminology scan excluding superseded decision 0001 and the historical M0
  iteration found no authoritative single-subsystem or deferred-Orca framing.
- Independent product consistency review: passed after all findings were
  repaired.
- Independent architecture and safety review: passed after mandatory managed
  provenance and validation records were repaired.
- `curl --connect-timeout 3 --max-time 8
  "$PRINTER_BASE_URL/server/info"`: HTTP 200 on 2026-08-23; Klippy connected,
  state `ready`, with no failed Moonraker components or warnings.
- `curl --connect-timeout 3 --max-time 8
  "$PRINTER_BASE_URL/printer/info"`: HTTP 200; printer reported `ready`.
- `curl --connect-timeout 3 --max-time 8
  "$PRINTER_BASE_URL/printer/objects/query?webhooks&print_stats&display_status&virtual_sdcard&extruder&heater_bed"`:
  HTTP 200; standby state, zero progress, temperature telemetry, and inactive
  virtual SD card were observed.
- `curl --connect-timeout 3 --max-time 8
  "$PRINTER_BASE_URL/server/webcams/list"`: HTTP 200; one enabled built-in
  `webrtc-camerastreamer` camera advertised snapshot and WebRTC paths.
- `curl --connect-timeout 3 --max-time 10
  "$PRINTER_BASE_URL/webcam/snapshot.jpg"`: HTTP 200; valid `1920x1080` JPEG.
  The temporary image was extremely dark and was not added to the repository.
- `curl --connect-timeout 3 --max-time 8
  "$PRINTER_BASE_URL/access/info"`: HTTP 200; the current LAN client reported
  `trusted: true` and `login_required: false`.
- `curl --connect-timeout 3 --max-time 8
  "$PRINTER_BASE_URL/printer/objects/list"`: HTTP 200; loaded objects include
  four extruders, job/session fields, motion, calibration, material sensors,
  power-loss, defect-detection, and vendor-specific extensions.
- `curl --connect-timeout 3 --max-time 8
  "$PRINTER_BASE_URL/printer/gcode/help"`: HTTP 200; 217 command names were
  advertised, including pause, resume, cancel, G-code offset, and velocity
  limit. No command was executed.
- A manual HTTP Upgrade request to `/websocket` with the printer origin returned
  `101 Switching Protocols` and live JSON-RPC process-stat notifications.
  Object subscription was not sent through this diagnostic client.
- `bash -n scripts/check-repository.sh`: rerun after reconciling the discovery
  records onto `ba18104` and passed on 2026-08-23.
- `./scripts/check-repository.sh`: rerun with `repository contract: ok` after
  decisions 0004 through 0006, ontology, and monitoring records were added.
- `git diff --check`: rerun and passed after the same update.
- Relative Markdown link check using `perl` extraction plus filesystem checks:
  rerun and passed after the same update.
- Authoritative terminology scan found no `Printer Management`, deferred-Orca,
  or MCP-as-system framing in current Markdown records.
- `bash -n scripts/check-repository.sh`: passed after hosted validation removal.
- `./scripts/check-repository.sh`: passed locally with
  `repository contract: ok` after hosted validation removal.
- `git diff --check`: passed after hosted validation removal.
- Repository scan for the removed automation terms, triggers, and job name:
  returned no matches.
- Plist inspection plus each executable's `--help`: upstream bundle and banner
  reported `2.4.2`; Snapmaker bundle reported `2.3.5` and its CLI banner
  reported `01.10.01.50`. Both help commands returned `0`.
- Each executable's `--version`: both reported an invalid option and returned
  `254`, confirming that discovery must not require a conventional version
  flag.
- `shasum -a 256` on both executables: recorded the fingerprints in
  `docs/orca-preparation-findings.md`; `file` reported universal `arm64` and
  `x86_64` Mach-O executables.
- `jq` inspection of each bundled `profiles/Snapmaker.json`: both reported 19
  model variants; upstream profile bundle version `02.04.00.07`, Snapmaker Orca
  profile bundle version `02.02.50.02`.
- `python3 .../gcode_tool.py discover`: found upstream OrcaSlicer at the
  standard app-bundle path and did not discover Snapmaker Orca. This checks the
  external helper only; it is not product runtime evidence.
- Official v2.4.2 and v2.3.5 CLI source review confirmed macOS cannot rely on
  the Linux-only progress pipe or `result.json`; source review also identified
  support-enforcer and blocker volume types plus facet annotation serialization.
- No input model was loaded, no slice was run, no generated artifact was
  retained, and no printer request was issued during the initial Orca
  discovery. A later user-authorized pilot is recorded below.
- `bash -n scripts/check-repository.sh`: passed after recording Orca findings,
  collaborative preview, support representations, and the execution-order
  redirect.
- `./scripts/check-repository.sh`: passed locally with
  `repository contract: ok` after the same update.
- `git diff --check`: passed after the same update.
- Relative Markdown link extraction plus filesystem checks: passed after the
  new Orca Preparation discovery record was linked into the documentation map.
- Current-authority scan found no remaining print-session-as-product-center,
  Printer-Operations-first, or Orca-environment-unknown regression.

### Later user-authorized Snapmaker Orca pilot

This evidence occurred after the initial non-mutating discovery. Private input
files, resolved profiles, generated G-code, temporary paths, printer
identifiers, and runtime data are intentionally not retained.

- Direct private multi-plate 3MF attempts returned exits `232` and `253`; the
  correctly formed `--allow-newer-file --slice 2` attempt crashed with exit
  `139`.
- Reduced-input probes returned exits `205`, `239`, `254`, `232`, and `139`
  under different missing, incomplete, or invalid profile/export conditions.
- A resolved process retaining `wipe_tower_filament: "0"` crashed with exit
  `139`; removing or correcting it allowed this observed CLI path to proceed.
  Reproduction with a non-user negative fixture is still pending.
- Filament-slot profiles missing `filament_diameter` and
  `filament_is_support` collapsed the resolved physical-extruder count to one
  and selected `T0` despite explicit filament IDs.
- Adding complete required fields to all four filament slots restored four
  physical extruders and logical tool `T2` for physical extruder 3.
- The successful Snapmaker Orca invocation used two isolated STL objects,
  complete resolved machine/process settings, four complete filament profiles,
  explicit filament IDs `3,3`, and an isolated output directory. It returned
  exit `0`.
- Static inspection confirmed `T2` and the accepted core process and
  temperature settings before printer actions.
- Generated G-code SHA-256:
  `057f7e06d7d3da28329fe4588d1039c925c4bba74d23783573204448622d2d36`.
- With explicit user authorization, upload, start acknowledgement, observed
  printing, and completion were reached as distinct states. The printer
  reported `22/22` layers, `827.288` seconds, and no printer errors.
- The user later handled and assembled the physical parts. This proves a
  physical output for the pilot, while separate fit and mechanism failures
  prevent any CAD or mechanism acceptance claim.
- One zsh diagnostic wrapper assigned to the read-only `status` parameter and
  returned exit `1` even though its child slicer had completed. Future wrappers
  must capture and report wrapper and child exits separately.
- Full chronology: [pilot log](../../logs/2026-08-23-snapmaker-orca-u1-petg-print-pilot.md).
- Derived, still-provisional guidance:
  [Snapmaker Orca CLI preparation knowledge](../../knowledge/snapmaker-orca-cli-preparation.md).
- A later user-authorized PLA job provided a second real-printer handoff
  observation. The validated artifact was uploaded through direct LAN
  Moonraker only after its backend port was observed reachable; the upload
  response reported the complete artifact size, the start acknowledgement was
  recorded separately, and a fresh object query then reported `printing` with
  logical `T3`, corresponding to physical tool head 4, active. This remains
  manual operational evidence, not reusable product code or proof of print
  completion.
- During that later handoff, the reverse-proxy route and a temporarily
  unreachable direct backend produced misleading upload failures. Future
  operational clients must distinguish route reachability, bytes fully
  accepted, start acknowledgement, and observed printer state instead of
  treating one failed route as a preparation failure.
- `./scripts/check-repository.sh`: passed with `repository contract: ok` after
  adding the separate log, knowledge, current-state, validation, and handoff
  records.
- `git diff --check`: passed after the same update.
- Current-authority scan found only explicitly historical initial-discovery
  statements, not a current claim that no real slice or print occurred.
- Privacy scan of the new log and knowledge records found no absolute user or
  temporary paths and no private-LAN address literals.

## Requirement evidence

- `OBS-001`: partially supported for ready/standby state and temperature fields
  through one live query; progress during a real print is untested.
- `OBS-002`: not yet supported by product code; the source returned event time,
  but no durable observation or stale-state implementation exists.
- `OBS-003`: not tested; disconnect and reconnect behavior remain unknown.
- `CAM-001`: transport is supported by prior snapshots and the current camera
  advertisement. Host-rendered live view, session association, and timestamp
  persistence are not validated.
- `AUTH-001`: not supported by Moonraker trust alone. The current client is a
  trusted LAN client, so application-level caller authorization is still
  required before any control slice.
- `API-001` through `API-004`, `ARCH-001` through `ARCH-003`, `ONTO-001` through
  `ONTO-002`, `OBS-004` through `OBS-006`, and `CAM-003` are accepted as static
  contracts. The narrow read-only status prototype does not prove their full
  enforcement or behavior.
- The later pilot partially supports `ORCA-001`, `ORCA-002`, `ORCA-005`,
  `ORCA-006`, and the state separation in `HANDOFF-002`. It does not prove a
  product implementation because no manifest, product adapter, review bundle,
  authorization runtime, or session correlation exists.
- Notification and control runtime requirements remain unvalidated. The user
  outcome of obtaining two printed pieces was observed once; a repeatable
  preparation product outcome remains unvalidated.
- `PREP-004` through `PREP-006` and `ORCA-006` are accepted as static working
  requirements. Local discovery partially supports the feasibility of multiple
  explicit backends and Orca support representations, but no review bundle,
  support round-trip, or user acceptance record exists.

## Acceptance state

- Static/software: dual-subsystem, ontology, surface, monitoring, collaborative
  preparation review, and manual-support contracts are documented. Real
  installed CLI help and source boundaries were inspected. One later real
  Snapmaker Orca slice succeeded after multiple recorded crash and profile
  failures. A read-only MCP Apps monitor prototype exists; no preparation,
  control, or persistent-monitor runtime exists.
- Protocol/simulator: live Moonraker HTTP response shapes, WebSocket upgrade,
  and server notifications were observed; no fixture, simulator, object
  subscription, or reconnect test exists.
- Real printer: ready/standby telemetry, image transport, and three
  user-authorized U1 jobs through reported completion were observed. Product
  subscription, reconnect, command correlation, and safety behavior remain
  untested.
- User outcome: the PETG pieces were obtained once, and the first later PLA
  output was physically accepted. The second PLA job is telemetry-complete but
  awaits handling. The slow manual CLI debugging means the workflow itself is
  not accepted.

## Failures, repairs, and reruns

- The first architecture review found authorization, provenance, dependency,
  custom G-code, and evidence-taxonomy gaps. They were repaired and re-reviewed.
- The first consistency review found two active iterations, combined
  upload/start language, privacy omissions, and stale framing. They were
  repaired and re-reviewed.
- Node's built-in WebSocket client emitted a generic handshake error when it did
  not send the Fluidd origin. A manual Upgrade request with the target origin
  succeeded. This isolates the failure to client handshake compatibility, but a
  full subscription client test is still required.
- A later Moonraker branch changed the root guidance back to a print-session
  central framing. The current update restores the accepted peer-subsystem
  contract without removing the useful monitoring records.
- The later Snapmaker Orca pilot repeatedly crashed or rejected incomplete
  configurations before a complete resolved-profile path succeeded. Its
  chronology and provisional guards are now preserved separately so the next
  agent must reproduce them before implementing automation.

## 2026-08-25 user-directed skill-first prototype

- Two PLA repetitions are recorded in a redacted chronological journal. Both
  reached `complete` with inactive virtual storage, full file progress, no
  exception, parked tools, and heater targets at zero. The first was physically
  accepted by the user; the second awaits handling.
- The second repetition separately verified physical tool head 2 as logical
  `T1`, three wall loops at global and object scope, support off, four objects,
  `188` layers, `220 C` nozzle, and `55 C` bed. A first prepared artifact with
  zero bed heat was uploaded for metadata inspection but was never started; the
  corrected artifact was separately validated and authorized.
- Direct multi-plate project slicing retained incompatible coordinates after
  profile resolution. Isolating the exact selected mesh, preserving four
  instances, and arranging them for the U1 produced a valid artifact.
- Monitoring used a fresh full telemetry and camera observation at each
  iteration, then chose the next check from state, recent progress, and
  estimated remaining time. `188/188` was not accepted as completion while the
  printer still reported `printing`.
- Decision 0007 records the user's revised maturation order. At that stage, the
  repo-local `u1-print-studio` plugin contained three thin skills and one visual
  status-card template but no runtime; the later status-view section records the
  explicitly authorized change.
- `uv run --no-project --with pyyaml python .../quick_validate.py <skill>`:
  passed for all three skills with `Skill is valid!`.
- `uv run --no-project --with pyyaml python .../validate_plugin.py
  plugins/u1-print-studio`: passed.
- `./scripts/check-repository.sh`: passed with `repository contract: ok`.
- `git diff --check`: passed.
- Relative Markdown link validation with a read-only Ruby scan: passed.
- Privacy and placeholder scans found no retained printer address, private
  model name, absolute user or temporary path, or unfinished plugin marker.

## 2026-08-25 read-only status-view prototype

- `bun install`: installed the MCP Apps, MCP SDK, TypeScript, and Node type
  dependencies and wrote the tracked Bun lockfile.
- `bun run check`: passed TypeScript compilation with no emit.
- HTTP `initialize` returned server `u1-print-studio` version `0.2.0`; HTTP
  `tools/list` returned only `show_u1_status` and `get_u1_status`, both marked
  read-only, non-destructive, closed-world, and idempotent.
- HTTP `tools/call` for `get_u1_status` returned a fresh real-printer
  observation with `complete`, `100%`, `188/188`, physical tool 2, camera
  availability, and no control action.
- HTTP `resources/read` returned `ui://u1-print-studio/status-v1.html` as
  `text/html;profile=mcp-app`, with the widget description and one runtime-only
  printer origin in each connect, resource, and frame CSP list.
- An MCP SDK stdio client launched the exact command represented by the plugin
  `.mcp.json`, listed both tools, and called `get_u1_status`. It returned the
  current complete state and camera availability.
- Direct Bun and Node local-network probes failed on the validation host while
  system `curl` succeeded. The implementation now calls `curl` without a shell,
  with a fixed base, fixed read-only routes, and bounded timeouts.
- Concurrent telemetry and webcam-list requests could contend. Serializing the
  telemetry read before webcam discovery repaired the stdio observation.
- Official Apps SDK reference material confirmed `requestDisplayMode` support
  for inline, Picture in Picture, and fullscreen. The widget feature-detects the
  host API and retains the MCP Apps bridge path.
- Browser visual QA was attempted, but this Codex session reported no available
  browser connection. Host rendering, camera load, live connection and close,
  PiP, fullscreen, and mounted adaptive refresh remain unverified.

### Same-day host-loop metadata repair

- `bun test src/*.test.ts`: passed `4` tests and `25` assertions covering the
  render-tool descriptor, read-only annotations, MCP App resource and CSP,
  result metadata separation, and camera-first widget control paths.
- `bun run check`: passed TypeScript compilation with the Bun test types.
- `bun run bundle`: rebuilt the self-contained stdio deployment artifact.
- `uv run --with pyyaml python .../validate_plugin.py
  plugins/u1-print-studio`: passed.
- `./scripts/check-repository.sh`: passed with `repository contract: ok`; the
  required local check now runs the U1 app TypeScript and Bun test suites.
- `git diff --check`: passed.
- The refreshed installed stdio bundle's `tools/list` advertised
  `_meta.ui.resourceUri` and the descriptor-level compatibility
  `openai/outputTemplate` on `show_u1_status`, while `get_u1_status` remained
  data-only.
- The same installed-bundle smoke test read the resource as
  `text/html;profile=mcp-app`, returned current `complete` and `100%` telemetry,
  and reported both camera routes without issuing a printer command.
- Separate bounded read-only camera requests returned HTTP 200 for a valid
  `1920x1080` JPEG snapshot and HTTP 200 for the advertised stream page.
- The existing conversation exposed the plugin only through a programmatic
  wrapper and did not mount the component after reinstall. Its stale tool
  surface later returned a telemetry transport failure even though the exact
  refreshed stdio bundle succeeded.
- The in-app browser inventory was empty. Snapshot rendering, `Go Live`,
  `Close`, PiP, fullscreen, and mounted adaptive refresh remain unverified and
  require a new conversation with the refreshed plugin enabled.

### Mobile layout and relayed-camera repair

- Official OpenAI plugin documentation confirmed that plugins can be used in
  ChatGPT Chat or Work on mobile, that inline cards can expand to the mobile
  display area without nested scrolling, and that mobile PiP may be presented
  as fullscreen. This is product-surface guidance, not evidence for this local
  plugin on iOS.
- The desktop component's direct private-LAN camera path was replaced by a
  read-only `get_u1_camera_frame` MCP tool. The widget no longer receives
  printer URLs or embeds a nested camera iframe; its CSP external origin lists
  are empty.
- `bun run check`: passed after the relay and responsive-layout change.
- `bun test src/*.test.ts`: passed 10 tests and 52 assertions covering the MCP
  render descriptor, three read-only tools, self-contained MCP App resource,
  private frame metadata, same-origin and protocol rejection,
  first-complete-JPEG stream extraction, relayed preview start/stop, mobile
  breakpoints, safe areas, touch targets, and host display APIs.
- `bun run bundle`: rebuilt the self-contained stdio artifact with widget URI
  `ui://u1-print-studio/status-v2.html`.
- A real read-only source call returned a valid JPEG data URL. The snapshot was
  146,574 bytes in that observation; its base64 payload was not printed.
- A bundled stdio MCP smoke called `get_u1_status` and
  `get_u1_camera_frame` without calling `show_u1_status`. It returned current
  `complete` telemetry and a valid relayed JPEG data URL of 148,023 bytes.
- The camera snapshot endpoint timed out intermittently during repeated smoke
  calls and sometimes kept a chunked JPEG response open after sending partial
  bytes. The adapter now caches the printer-advertised same-origin route,
  extracts the first complete JPEG without waiting for connection close, and
  retries a frame at most once; the widget's 1.5-second loop never overlaps
  calls.
- The marketplace source and installed cache were validated after reinstall as
  `0.2.0+codex.20260825142747`. An exact installed-cache stdio smoke listed all
  three tools, served `status-v2` as `text/html;profile=mcp-app` with empty
  external CSP lists, confirmed the mobile/relay source contracts, returned
  reachable telemetry, and returned a valid 148,142-byte JPEG data URL in
  widget-private metadata.
- The in-app browser was unavailable. Two local headless-Chrome render attempts
  also failed to produce screenshots and were stopped. Responsive source,
  contracts, and valid JPEG transport do not prove desktop or iOS rendering.
- No Secure MCP Tunnel, public endpoint, or iOS host was configured. Cross-device
  connectivity and visual validation remain pending, and Moonraker was not
  exposed.

### LAN reachability and slow-camera repair

- Read-only system-`curl` probes from the current laptop returned HTTP 200 for
  the configured Moonraker `/server/info` and `/server/webcams/list` routes.
  Route inspection selected the current Wi-Fi interface. No printer identifier
  or private address is retained here.
- The mounted card still reported offline through the current Codex MCP
  connection, and that connection listed only `show_u1_status` and
  `get_u1_status`. The refreshed contract requires the additional
  `get_u1_camera_frame` tool, so this is stale host-process evidence rather than
  a current LAN failure.
- Webcam inventory advertised the built-in `webrtc-camerastreamer`, a
  same-origin snapshot route, and a same-origin WebRTC route. A direct bounded
  snapshot probe returned HTTP 200, `image/jpeg`, and 150,523 bytes in 12.9
  seconds.
- The camera relay now allows a 20-second first attempt and one 10-second retry;
  `.mcp.json` allows 40 seconds. A test asserts that the MCP tool budget exceeds
  webcam discovery plus both bounded frame attempts.
- `bun run check`: passed.
- `bun test src/*.test.ts`: passed 12 tests with 54 assertions.
- `bun run bundle`: rebuilt the self-contained stdio artifact.
- A source-level real-camera call returned a valid 143,387-byte JPEG in 4.7
  seconds without printing its payload.
- `uv run --no-project --with pyyaml python .../validate_plugin.py
  /Users/scottchu/plugins/u1-print-studio`: passed for the synchronized personal
  marketplace source.
- The cache-busted plugin was reinstalled as
  `0.2.0+codex.20260825144906`. An exact installed-cache stdio smoke listed all
  three tools, returned reachable `complete` status with camera availability,
  and returned a valid 149,695-byte JPEG data URL in widget-private metadata.
- `uv run --no-project --with pyyaml python .../validate_plugin.py
  plugins/u1-print-studio`: passed for the durable repository source.
- `./scripts/check-repository.sh`: passed with `repository contract: ok` and
  reran the 12 tests with 54 assertions.
- `git diff --check`: passed.
- A private-address scan across repository records and plugin source was clean.
- The current thread cannot hot-reload its already-connected MCP process. A new
  thread remains required to prove mounted desktop rendering. iOS additionally
  requires an authenticated reachable MCP backend on an always-on host with a
  private route to the printer; no such backend or tunnel was configured.

### Personal mobile OAuth and setup skill

- Decision 0010 records the selected personal-developer boundary: a dedicated
  Tailscale Funnel HTTPS origin forwards to a loopback-only Streamable HTTP MCP
  server. Moonraker and its camera are not Funnel targets.
- OAuth tests cover the RFC 7636 PKCE vector, root and path-aware discovery,
  approved and rejected dynamic registrations, unauthenticated challenges,
  accepted signed tokens, wrong audiences, and missing scopes.
- `bun run check` and `bun test src/*.test.ts` passed before the onboarding-skill
  addition with 17 tests and 74 assertions. Final rerun evidence follows in the
  delivery record.
- The public health endpoint returned HTTP 200. Protected-resource metadata
  named the exact `/mcp` resource and only `u1.monitor`; an unauthenticated MCP
  initialize returned HTTP 401 with the expected `WWW-Authenticate` metadata
  URL and scope.
- Tailscale Funnel status showed an existing port-443 root proxy preserved and
  the dedicated U1 port-8443 root proxy mapped only to `127.0.0.1:8787`.
- The macOS LaunchAgent was running with umask `077`, using the ignored local
  environment. OAuth state and the enrollment-link file were owner-only and
  outside the repository.
- The intended phone completed user-verified passkey enrollment. Local state
  reported enrollment without displaying credential material, and the one-time
  enrollment-link file was absent afterward.
- `u1-mobile-status-setup` passed Skill Creator validation. The full plugin also
  passed Plugin Creator validation with four skills.
- ChatGPT Developer mode, authenticated connection, exact remote tool
  discovery, and iOS card rendering remain user-interface evidence still to be
  completed. The Codex iPhone Security and Plugins screens did not expose the
  desktop/web developer controls.
- Final local delivery rerun: `bun run bundle`, `bun run check`, and
  `bun test src/*.test.ts` passed with 17 tests and 74 assertions;
  `./scripts/check-repository.sh` passed with `repository contract: ok`; and
  `git diff --check` passed.
- Skill Creator validation passed for the installed
  `u1-mobile-status-setup`; Plugin Creator validation passed for the personal
  marketplace source. The plugin was reinstalled as
  `0.2.0+codex.20260825200215`.
- SHA-256 for the bundled stdio artifact matched across the repository,
  personal marketplace source, and installed cache. This proves exact local
  packaging, not authenticated remote or iOS behavior.

### Standard-HTTPS OAuth discovery repair

- ChatGPT's New Plugin form selected Server URL and OAuth for the correct
  `:8443/mcp` endpoint, then failed before OAuth with `Cannot connect to host
  ...:8443 ssl:default [None]`.
- Public DNS returned Tailscale Funnel edge addresses. Direct TLS requests to
  two public IPv4 edge addresses returned HTTP 200 for `/health`, proving the
  failure was not general Funnel reachability.
- Decision 0011 moves the personal endpoint to standard HTTPS port 443 while
  preserving the existing root handler. Exact `/.well-known`, `/oauth`,
  `/auth`, `/mcp`, and `/health` handlers route to the loopback U1 service.
- The first path-handler configuration stripped the matched prefix and returned
  the backend root or HTTP 404. Targets were corrected to retain each backend
  prefix; this is preserved as setup-skill guidance rather than hidden repair.
- Through a public Funnel edge on standard port 443, `/health` returned the
  personal-OAuth marker; authorization-server metadata named the standard-port
  issuer, endpoints, PKCE S256, and `u1.monitor`; protected-resource metadata
  named the exact `/mcp` resource; and unauthenticated MCP returned HTTP 401
  with the correct metadata URL and scope.
- The unrelated root handler continued returning HTTP 200. The old port-8443
  handler was removed only after the standard-port public checks passed.
- The existing passkey remained enrolled because the relying-party ID hostname
  did not change, and the one-time enrollment-link file remained absent.
- After the user completed the standard-port registration and passkey flow, the
  connected host exposed exactly `show_u1_status`, `get_u1_status`, and
  `get_u1_camera_frame`. An authenticated `show_u1_status` call succeeded and
  returned a fresh reachable `complete` observation at 100% (188/188 layers),
  inactive storage at full file position, no exception, all four tools parked,
  and zero heater targets. This proves the authenticated read-only tool path;
  user-visible iOS layout and relayed-camera behavior remain separate visual
  evidence.
- Delivery rerun after recording that evidence: `bun run bundle`, `bun run
  check`, and `bun test src/*.test.ts` passed with 17 tests and 74 assertions;
  setup-skill validation passed; `./scripts/check-repository.sh` returned
  `repository contract: ok`; repository and personal-source Plugin Creator
  validation passed; and `git diff --check` passed.
- The synchronized plugin was reinstalled as
  `0.2.0+codex.20260825201641`. SHA-256 for `app/dist/stdio.js` matched the
  repository, personal marketplace source, and installed cache at
  `d259b492d097c55e7c0a56ff2adf27866c168dd593d4037611a44acb2dcc9944`.

### Codex mobile image fallback

- Decision 0012 records a host-compatible representation change rather than a
  new dashboard: remote OAuth calls to `show_u1_status` include a self-contained
  PNG generated from the same normalized observation in `structuredContent`.
  Local stdio calls and remote `get_u1_status` refresh calls remain data-only.
- The PNG renderer is dependency-free, emits only `IHDR`, compressed pixel
  data, and `IEND`, and includes no printer URL, public image URL, camera bytes,
  or control affordance.
- A contract test decoded the remote render result, verified the standard PNG
  signature, and read dimensions of 1200 by 1500. A separate contract test
  proves the remote refresh result does not add an image.
- A fresh real-printer observation was rendered locally and visually inspected.
  It showed `complete`, 100%, 188/188 layers, inactive storage, the observed
  parked tool and zero heater targets, elapsed time, file identity, observation
  time, and camera availability. The generated inspection artifact was kept
  outside the repository.
- `bun run check`: passed.
- `bun test src/*.test.ts`: passed 19 tests with 83 assertions.
- `bun run bundle`: rebuilt the self-contained stdio artifact.
- `uv run --no-project --with pyyaml python .../quick_validate.py
  ../skills/u1-mobile-status-setup`: passed with `Skill is valid!`.
- `uv run --no-project --with pyyaml python .../validate_plugin.py ..`: passed
  for the repository plugin source.
- `./scripts/check-repository.sh`: passed with `repository contract: ok` and
  reran the 19 tests with 83 assertions.
- `git diff --check`: passed.
- The LaunchAgent was restarted against the changed repository source and the
  standard-HTTPS public health route returned the personal-OAuth marker. This
  proves service restart and routing, not an authenticated remote image call.
- Codex mobile image display remains user-visible host evidence. The current
  local Codex tool connection intentionally follows the stdio path and returned
  text plus the interactive-widget contract without a duplicate PNG.
- Plugin Creator validation passed for the synchronized personal source and the
  exact installed cache. The plugin was reinstalled as
  `0.2.0+codex.20260825203920`.
- SHA-256 for the bundled stdio artifact matched across the repository,
  personal marketplace source, and installed cache at
  `acba2fc887c68249a9552a485f3ae9995936ff015da808858d2dfd53fef2b522`.
- An exact installed-cache stdio smoke listed only the three expected tools,
  returned a fresh reachable `complete` observation, and returned only text in
  `content`. This confirms the working local desktop path did not acquire a
  duplicate PNG; it does not prove a new desktop host mounted the component.
- The first Codex mobile PNG rendering was user-visible and visually accepted;
  the user specifically liked the pixel style and requested that it be a little
  larger. The follow-up portrait layout preserves that style while changing the
  four metrics from one compact row to a larger 2-by-2 grid. The new layout
  requires a fresh visual inspection and phone-host confirmation below.
- A fresh real-printer observation was rendered through the revised 1200 by
  1500 path and visually inspected. The larger state, percentage, progress bar,
  two-row metrics, truncated file identity, observation timestamp, and refresh
  hint all fit without clipping. This is local visual evidence; phone-host
  sizing remains the user's next confirmation.
- The loopback service was restarted against the revised source. The first
  immediate public health probe returned a transient HTTP 502 during restart;
  the next probe returned HTTP 200 with the personal-OAuth marker and the new
  process remained running.
- Plugin Creator validation passed for the repository source, synchronized
  personal source, and exact installed cache. The portrait update was
  reinstalled as `0.2.0+codex.20260825211428`.
- SHA-256 for the rebuilt stdio bundle matched across all three locations at
  `6dfa78e49bbf81775ca3e62bd518f7399fff1a2c494583aae4032cc5f3e9c49d`.
- An exact installed-cache stdio smoke again listed only the three read-only
  tools, returned reachable `complete` telemetry, and kept local content
  text-only so the desktop widget path remains unchanged.

### Renewable personal OAuth repair

- A live Codex call failed before tool execution with `UNAUTHORIZED`,
  `oauth_refresh_token_missing`, and a reauthentication action. The phone's
  additional-access flow then reported that it could not connect to U1 Print
  Studio.
- Concurrent public probes still returned HTTP 200 for `/health`, protected
  resource metadata, and authorization-server metadata. Unauthenticated `/mcp`
  returned the expected HTTP 401 challenge. Source inspection then showed a
  15-minute access token, authorization-code-only discovery, and no refresh
  token in the token response. This supports a renewal failure, not a general
  service, Funnel, printer, or camera outage.
- `bun run check`: passed.
- `bun test src/*.test.ts`: passed 22 tests with 115 assertions. The added
  contracts cover version-1 state migration, discovery and DCR metadata,
  initial issuance, authorization-code replay, owner-only hashed persistence,
  restart recovery, client/resource/scope binding, rotation, sequential and
  concurrent replay, 30-day expiry, and MCP authentication with a refreshed
  access token.
- `bun run bundle`: rebuilt the self-contained stdio artifact; remote personal
  OAuth remains an HTTP-service concern and did not alter the stdio tool bundle.
- The setup skill, repository plugin source, synchronized personal source, and
  exact installed cache passed their respective Skill Creator and Plugin
  Creator validation. `./scripts/check-repository.sh` returned `repository
  contract: ok`, and `git diff --check` passed.
- The plugin cachebuster and reinstall flow produced
  `0.2.0+codex.20260825234015`. SHA-256 for `app/dist/stdio.js` remained matched
  across repository, personal source, and installed cache at
  `6dfa78e49bbf81775ca3e62bd518f7399fff1a2c494583aae4032cc5f3e9c49d`.
- Before restart, the live authorization state was version 1 with two registered
  clients and an enrolled credential. An owner-only dated backup was created
  outside the repository. Restart migrated the state to version 2 while
  preserving the signing key identifier, both clients, and the credential.
  No secret or private runtime path is recorded here.
- Post-deployment public health and both discovery documents returned HTTP 200;
  authorization-server metadata now advertises `authorization_code` and
  `refresh_token`, PKCE S256, the standard-HTTPS issuer, and only `u1.monitor`.
  The protected resource still names the exact `/mcp` audience, and
  unauthenticated MCP still returns HTTP 401 with the expected challenge.
- This satisfies static/software and public-protocol evidence for `AUTH-002`.
  A pre-repair connection cannot gain a refresh token retroactively. After
  deployment, the user confirmed that the repaired connection works
  immediately. Another call after more than 15 minutes remains the separate
  real-host renewal gate. No printer command was issued during diagnosis,
  implementation, deployment, or validation.

### Transport-independent image fallback and third PLA completion

- A current-thread local stdio `show_u1_status` call returned fresh normalized
  telemetry but only text content. Source inspection isolated the omission to
  `includeImageCard: Boolean(securitySchemes)`: OAuth presence had been used as
  a proxy for host iframe capability.
- Decision 0012 was corrected so every `show_u1_status` result carries the
  same-observation 1200 by 1500 PNG fallback. `get_u1_status` remains data-only
  for mounted-widget refreshes.
- Local and remote render contract tests passed with 9 tests and 56 assertions;
  the local test now requires `image/png`. TypeScript validation passed after
  restoring the personal source's locked dependencies.
- Plugin Creator validation passed for the personal marketplace source. The
  exact installed cache `0.2.0+codex.20260826003532` reran the 9 render tests
  successfully. Existing conversations still do not hot-reload replaced MCP
  processes; a new conversation remains the pickup boundary.
- During the same read-only monitoring session, a user-authorized third PLA job
  reached fresh telemetry-verified completion at 98/98 layers: state
  `complete`, inactive virtual storage at full file position, no exception,
  all four tools parked, and all heater targets zero. The strongest earlier
  camera frame showed five attached upright objects without visible spaghetti.
  The final frame was dark after the bed lowered and lights turned off, so no
  unseen physical-result claim is made.

### Continuous read-only camera relay

- The moved diff and backup stash were inspected before editing. The stash
  `move-u1-camera-media-relay-to-orca-worktree` remained untouched and was not
  reapplied.
- `bun install --frozen-lockfile` restored missing worktree dependencies without
  changing `bun.lock`.
- `bun run check`: passed after the final source-budget correction.
- `bun test`: passed 29 tests with 144 assertions across application ticket and
  lease policy, exact multipart HTTP routing, MCP result privacy, local and
  remote PNG contracts, OAuth, widget fallback, and raw JPEG validation.
- Skill Creator `quick_validate.py` passed for
  `u1-mobile-status-setup` and `u1-monitor-print` using `uv run`.
- `bun run bundle` produced the self-contained stdio artifact. Plugin Creator
  validation passed for repository source, synchronized personal source, and
  installed cache.
- The plugin cachebuster helper replaced the prior suffix and the final
  reinstall produced `0.2.0+codex.20260826005742`. Repository, personal-source,
  and installed bundles share SHA-256
  `6913657ebe92cbcfe372170023545080390953a2e96f9c65412a068e17b31fd1`.
- An exact installed-cache stdio smoke listed the three local read-only tools,
  returned a fresh reachable observation, and returned `text` plus a valid
  1200 by 1500 PNG. The HTTP-only stream tool is intentionally absent from
  stdio.
- The first real-camera harness used a provisional 3-second plus 3-second frame
  budget and did not deliver two frames within its 30-second lease. The
  temporary harness was stopped. Reusing the established 20-second plus
  10-second bounded source policy then delivered two complete JPEGs over one
  multipart response in 1.9 seconds, HTTP 200, with the exact boundary and
  430,390 transferred bytes. After abort-listener and backpressure-close
  cleanup, the final synchronized source repeated the proof in 2.6 seconds with
  428,954 bytes. No image was retained.
- The live LaunchAgent was moved only from the canonical checkout to the
  synchronized personal plugin source. Owner-only plist and OAuth-state backups
  were created outside the repository, and OAuth state remained byte-for-byte
  unchanged across restart.
- Tailscale Funnel retained the unrelated root plus exact `/.well-known`,
  `/auth`, `/health`, `/mcp`, and `/oauth` handlers. Deployment added only
  `/media` mapped to the same loopback prefix.
- Local and public health returned HTTP 200. Public OAuth metadata retained
  authorization code, refresh token, PKCE S256, and only `u1.monitor`.
  Unauthenticated MCP returned HTTP 401; exact media without a ticket returned
  HTTP 401; an unknown media path returned HTTP 404; the unrelated root still
  returned HTTP 200.
- The current Codex conversation retained its pre-reinstall three-tool MCP
  surface and later returned a stale offline observation. That is not treated
  as current deployment or printer evidence. A new thread is required to prove
  the remote four-tool inventory and mounted widget.
- Static/software, exact public protocol, and real-printer JPEG evidence pass.
  Mounted desktop and iOS continuous rendering, fallback behavior, Close, PiP,
  fullscreen, and real-host OAuth renewal remain separate user-visible gates.
- No printer control or G-code was implemented or invoked.

### Standalone read-only status dashboard

- `bun install --frozen-lockfile` restored this worktree's missing app
  dependencies without changing `bun.lock`.
- `bun run check`: passed.
- `bun test src/*.test.ts`: passed 34 tests with 161 assertions. The added
  contracts prove the production widget is hosted by the harness, only
  status/snapshot/stream calls are accepted, a control-shaped call is rejected,
  `/dashboard` is absent unless explicitly enabled, a derived external origin
  must be a private MagicDNS HTTPS hostname on a dedicated non-443 port, and
  the dashboard-only process returns 404 for the ordinary `/mcp` route.
- A dedicated status-dashboard process stayed bound to `127.0.0.1:8788`
  without changing or restarting the installed loopback 8787 service. Private
  Tailscale Serve HTTPS on port 8444 proxies only the tailnet to that process;
  the existing public port-443 Funnel routes were preserved and port 8444 has
  no Funnel permission.
- The user could not open the earlier raw tailnet-IP port. Tailscale reported
  the iPhone online and active, but ping used DERP and did not establish a
  direct connection. That observation motivated replacing the raw app bind
  with loopback plus Tailscale Serve; it does not by itself prove whether the
  failed TCP connection was an ACL, firewall, or path issue.
- The exact private HTTPS `/dashboard` route returned the bridge host and live
  reachable `complete` telemetry with camera available. A one-time HTTPS relay
  delivered two multipart JPEG parts, HTTP 200, in 1.42 seconds with 144,083
  transferred bytes. No image was saved.
- The in-app browser runtime was unavailable, so the harness was not visually
  inspected in this run. HTTP integration and real-printer camera evidence do
  not prove browser layout quality or ChatGPT host rendering.
- The dashboard is opt-in and read-only. The app remains on loopback, is absent
  from the normal service, and its dedicated Tailscale Serve port must not be
  Funnel-enabled. No printer control or G-code was implemented or invoked.
- `bun run bundle` rebuilt the ignored local stdio artifact successfully.
  Plugin Creator validation passed with its transient YAML dependency. No
  cachebuster, marketplace edit, reinstall, or deployed-service replacement
  was performed because the harness runs directly from the branch.

### Icon controls, persistent grid, and component skeletons

- Acceptance boundary: this refinement changes only the read-only widget UI.
  It must not add a printer command, expand the standalone bridge tool allowlist,
  or expose a camera URL to model-readable output.
- `bun test src/*.test.ts`: passed 35 tests with 174 assertions, including the
  icon-only control, persistent-grid, and component-loading-state contract.
- `bun run check`: passed TypeScript validation.
- Plugin Creator `validate_plugin.py` passed through
  `uv run --with pyyaml`; the transient dependency did not change project
  dependencies.
- Loopback `GET /widget?standalone=1` served the new icon/grid/skeleton source.
  Loopback and private Tailscale HTTPS `GET /dashboard` both returned HTTP 200.
- Live read-only bridge calls completed, but the printer was offline at that
  observation: status was `offline` with camera unavailable, and the camera
  frame result was unavailable with zero bytes. This verifies the unavailable
  state path, not live camera rendering or printer reachability.
- No browser was connected to the in-app browser runtime, so visual layout,
  animation quality, and live/snapshot transitions remain user-visible review
  gates. No cachebuster, plugin reinstall, printer command, or G-code action was
  performed.

### Neutral camera indicator and explicit presentation mode

- Acceptance boundary: the persistent camera grid remains unchanged; the
  top-left camera icon has no state dot, slash, pulse, or state-dependent
  color; and the bottom-right overlay is the sole visible camera-mode text.
- Snapshot mode now reports `Snapshot` with the frame time, snapshot fallback
  reports `Snapshot fallback`, and continuous mode reports `Live` with the
  configured rate as an honest `up to 15 FPS` ceiling rather than measured FPS.
  The old build-plate title and secure-snapshot caption were removed.
- `bun test src/*.test.ts`: passed 36 tests with 185 assertions, including the
  neutral-icon and bottom-right mode-label contract.
- `bun run check`, `bun run bundle`, Plugin Creator validation through
  `uv run --no-project --with pyyaml`, `./scripts/check-repository.sh`, and
  `git diff --check`: passed.
- The exact private HTTPS widget source contains the new mode labels and none
  of the removed title, secure-snapshot caption, or camera-status dot. Private
  HTTPS `/dashboard` returned HTTP 200, and its read-only status bridge returned
  reachable `complete` telemetry with camera available and a configured target
  of 15 FPS.
- The browser-control runtime reported no available browser, so the refreshed
  snapshot, fallback, and live layouts remain a user-visible review gate. No
  cachebuster, plugin reinstall, printer command, or G-code action was
  performed.

### Snapmaker card theme

- Acceptance boundary: this pass changes only the existing read-only card's
  visual tokens. Layout, copy, camera relay behavior, bridge calls, tools, and
  printer behavior remain unchanged.
- A user-supplied Snapmaker U1 website screenshot established the palette:
  charcoal and warm white form the base, Snapmaker yellow identifies the card,
  orange is reserved for paused or attention state, and red remains reserved
  for faults. The implementation applies yellow to the camera grid, live and
  refresh actions, status treatment, progress fill, and the camera/content
  divider in light and dark color schemes.
- `bun test src/*.test.ts`: passed 37 tests with 192 assertions, including the
  Snapmaker theme-token contract. `bun run check`, `bun run bundle`, Plugin
  Creator validation through `uv run --no-project --with pyyaml`,
  `./scripts/check-repository.sh`, and `git diff --check`: passed.
- Private HTTPS `/dashboard?reload=5` returned HTTP 200. The exact served widget
  contained the yellow and orange tokens plus branded divider and no legacy
  green or lime token declarations.
- Product Design QA is recorded in `design-qa.md` with `final result: blocked`.
  The source reference was inspected, but the in-app browser runtime reported
  no connected browser, so no implementation screenshot, visual comparison,
  interaction check, or console check was available. No cachebuster, plugin
  reinstall, printer command, or G-code action was performed.

### Semantic camera modes and measured relay FPS

- Acceptance boundary: camera mode status is left-aligned and the mode action
  is right-aligned; snapshot/fallback displays a red disconnected-camera icon;
  live displays a pulsing green dot; and the FPS label reflects observed frame
  presentation rather than the configured relay ceiling. The camera remains
  read-only and no printer-control surface is added.
- The widget now fetches the exact one-time media URL permitted by the MCP
  result, parses complete JPEG frames from the multipart byte stream, presents
  them through the existing snapshot element, and computes FPS from frame
  observations in a rolling five-second window. Until two frames arrive it
  reports `Live · measuring FPS`.
- The exact private relay delivered four complete frames at an observed 1.4 FPS
  during the smoke check. This is transport/presentation evidence, not a claim
  about the camera sensor's native frame rate.
- `bun test src/*.test.ts`: passed 38 tests with 207 assertions.
- `bun run check`, `bun run bundle`, and an independent parse of the inline
  widget module: passed. Private HTTPS `/dashboard?reload=6` returned HTTP 200
  and served the measured-FPS widget source.
- Plugin Creator validation through `uv run --no-project --with pyyaml`,
  `./scripts/check-repository.sh`, and `git diff --check`: passed.
- The identity palette is grounded in the official Snapmaker U1 page stylesheet:
  charcoal `#1c1e20`, `#1f1f1f`, and `#242424`; yellow `#ffcd00`; orange
  `#ff5f28`; and warm white surfaces. Semantic green `#32c86e` and red
  `#ff6161` are deliberately outside the brand palette and communicate
  positive/connected versus negative/disconnected state.
- Browser-rendered comparison and interaction QA remain blocked because the
  configured browser-control runtime reported no connected browser. No plugin
  reinstall, printer command, or G-code action was performed.

### Actual WebRTC camera presentation

- Acceptance boundary: `Go Live` must negotiate the printer's advertised
  `webrtc-camerastreamer`; no repeated snapshot transport may be called live;
  snapshots remain an explicitly labeled fallback; printer controls and a
  generic proxy remain absent.
- `bun run check` and `bun test src/*.test.ts`: passed 38 tests with 220
  assertions. The contracts cover a real `<video>` element,
  `RTCPeerConnection`, H264 offer handling, answer and ICE forwarding,
  printer-peer-ID privacy, ticket replay rejection, bounded lease teardown,
  CORS, and removal of the old MJPEG route and JPEG stream parser.
- `bun run bundle`, Plugin Creator validation through
  `uv run --no-project --with pyyaml`, `./scripts/check-repository.sh`, and
  `git diff --check`: passed.
- The private dashboard's exact ticketed signaling route returned an H264 offer
  of 981 bytes plus the reference STUN server without exposing the printer peer ID, and session deletion
  released the lease. A separate `aiortc` receiver reached `connected`, decoded
  frames over the persistent peer connection, and closed the session without
  retaining media. Software-decoder samples varied from 0.2 to 24.8 FPS; that
  variability is not native-browser performance evidence.
- Plugin `0.2.0+codex.20260826165531` was validated, reinstalled, and both the
  protected service and private dashboard were restarted. Public
  `/media/camera.mjpeg` returns 404, invalid WebRTC tickets return 401, and
  private `/dashboard?reload=10` returns 200 while serving the WebRTC widget.
- No connected browser was available to the control runtime, so visible native
  playback, browser-measured FPS, and ChatGPT/iOS mounting remain separate
  user-visible acceptance evidence. No printer control or G-code action ran.

### Automatic-refresh icon cleanup

- Removed the decorative status-dot pseudo-element from the automatic-refresh
  button. Enabled and paused behavior, accessible labels, and icon color remain
  unchanged.
- `bun run check`, `bun test src/*.test.ts`, and `bun run bundle`: passed 38
  tests with 222 assertions, including absence of both dot selectors.

## Local-first connector and MCP Apps signaling bridge — 2026-08-26

### Acceptance and safety boundary

- Milestone: F0 dual-environment and contract discovery.
- Open questions addressed: the first normal-user Printer Operations host and
  network boundary, reuse of one application session service from MCP and
  optional HTTP adapters, and the smallest packaging/onboarding evidence.
- Decision 0016 and the active brief recorded acceptance criteria before code
  implementation. Decision 0016 partially supersedes 0015 only for hosted
  signaling transport.
- This validation is read-only static/software and simulated protocol evidence.
  It does not prove a mounted host, another machine, package installation,
  physical-printer behavior, or user outcome.
- No printer, installed plugin, marketplace, package registry, Homebrew tap,
  OAuth state, Tailscale service, or other hosted service was accessed or
  changed.

### Commands and results

From `plugins/u1-print-studio/app`:

- `bun run check`: passed.
- `bun test src/*.test.ts`: passed 49 tests with 275 assertions across nine
  files. Coverage includes empty hosted CSP, no widget `fetch(` call, MCP Apps
  signaling tool names, app-only helper visibility, private session metadata,
  snapshot fallback wiring, existing status/snapshot/PNG contracts, fixed HTTP
  adapter routes, offer/answer/ICE bounds, expiry, concurrency, cumulative
  candidate teardown, configuration permissions, and release packaging.
- `bun run bundle`: passed and emitted ignored `dist/stdio.js` plus the embedded
  `dist/widget.html` asset. An earlier run failed because the old `--outfile`
  form cannot emit both files; the script now uses an explicit output directory
  and deterministic entry/asset names.
- `bun run bundle:runtime`: passed with Bun 1.3.12 and produced an ignored
  macOS arm64 standalone executable. The builder disables automatic dotenv and
  bunfig loading, embeds the widget, removes Bun's invalid emitted signature on
  this macOS 26.5.2 host, applies an ad-hoc local signature, and verifies it.
- `./dist/u1-print-studio --help`: passed without invoking a Bun executable.
- `./dist/u1-print-studio setup --printer-url http://127.0.0.1:7125 --config
  <temporary-directory>/config.json --json`: passed and wrote the temporary
  configuration.
- `./dist/u1-print-studio doctor --offline --config
  <temporary-directory>/config.json --json`: passed with
  `printerObservation: skipped-offline`; it did not contact hardware.
- `stat -f '%Sp %N' <temporary-directory>/config.json`: reported `-rw-------`.
- `codesign -vvv --verify ./dist/u1-print-studio`: reported valid on disk and
  satisfied its designated requirement for the ad-hoc validation signature.

From the repository root:

- `uv run --no-project --with pyyaml python
  /Users/scottchu/.codex/skills/.system/plugin-creator/scripts/validate_plugin.py
  plugins/u1-print-studio`: passed.
- `git diff --check`: passed before final record updates.
- `./scripts/check-repository.sh`: initially identified the required
  `PROJECT_STATE.md` headings after that file was condensed. The headings were
  restored. A subsequent run exposed a millisecond-boundary test flake where a
  nominal 30-second lease displayed as 29 seconds; the presentation duration
  now rounds up while the absolute expiry remains authoritative.
- Final `./scripts/check-repository.sh`: passed, including TypeScript and all 49
  tests with 275 assertions.
- Final `git diff --check`: passed.

### Independent pre-merge review

- A pre-existing config file could retain broader permissions because the
  creation mode passed to `writeFileSync` only applies when a file is created.
  The writer now explicitly applies `0600` after every non-Windows write, and a
  regression starts from an existing `0644` file.
- A malformed camera stream envelope could contain a valid session ID but fail
  validation before the widget retained it for teardown. The widget now retains
  a valid ID before envelope validation, so snapshot fallback closes the
  bounded session; a widget contract regression enforces that ordering.
- `bun test src/local-config.test.ts src/app.test.ts`: passed 19 tests with 140
  assertions.
- `bun run bundle` and `bun run bundle:runtime`: passed; the regenerated macOS
  arm64 executable remained valid on disk and satisfied its designated
  requirement.
- Plugin validation passed with `uv run --no-project --with pyyaml`, and
  `git diff --check` passed before these record updates.

### Packaging evidence boundary

- `.mcp.release.json` invokes only the staged executable's `mcp` subcommand and
  contains no Bun, env-file, Tailscale, DNS, or OAuth setup.
- `PACKAGING.md` maps Marketplace, Homebrew, and npm to the same setup/doctor
  contract. No channel metadata was published or installed.
- The ephemeral macOS executable and all temporary configuration/build smoke
  files were removed after validation. Source and manifests are the delivered
  artifacts.
- Developer ID signing, notarization, checksums, cross-platform builds,
  installation, upgrades, rollback, owner-selected licensing and third-party
  notices, and elimination of the platform `curl` dependency remain unverified
  gates.

### Delivery

- Implementation commit: `3145a77` on non-main branch
  `scottchu/local-first-rollout`.
- Pull request: https://github.com/scottchu/orca-slicer-mcp/pull/15.
- No hosted validation workflow was configured or awaited.

## Post-merge personal Marketplace installation — 2026-08-27

### Authorization and evidence boundary

- The user explicitly authorized merge, install, and test after independent
  review. Pull request 15 merged as `d5a734e65b04a5af9b458cc310f45cb40dcfbd40`.
- This is same-machine installation plus real-printer read-only protocol
  evidence. No upload, start, pause, resume, cancel, G-code, or other printer
  control tool or action ran.
- The current Codex task could not hot-reload the reinstalled plugin, so mounted
  iframe rendering, Go Live playback, PiP, fullscreen, and fallback remain a
  separate fresh-task user-outcome gate.

### Release staging and installation

- The merged plugin source was copied into the personal Marketplace source.
  The standalone macOS arm64 executable was staged at
  `app/runtime/u1-print-studio`.
- Codex plugin validation requires the MCP descriptor at `.mcp.json`. The
  release staging copy therefore replaced the developer descriptor with the
  contents of `.mcp.release.json`; it did not install Bun or an environment-file
  dependency.
- Plugin validation passed, `--help` passed, and the plugin-creator cachebuster
  advanced the staged version to `0.2.0+codex.20260827152101`.
- `codex plugin add u1-print-studio@personal`: passed. `codex plugin list`
  reported the new version installed and enabled.
- The staged and installed executables had the same SHA-256
  `624957b927e930bce975f714de1729381b20f67a598654010453dcbc9e1e8d52`.
  The installed executable passed `codesign -vvv --verify`.
- Installed-runtime setup and offline doctor passed against a temporary
  loopback config; its mode was `0600`. The temporary smoke directory was moved
  to Trash after validation.

### Installed read-only smoke

- Setup migrated the existing private printer origin into the default local
  config without printing or persisting that identifier in the repository.
- Installed-runtime `doctor --json`: passed with configuration, fixed
  read-only allowlist, MCP Apps signaling, and external-widget-fetch checks all
  healthy; `printerObservation` was `reachable`.
- A direct MCP stdio client launched the exact installed standalone executable.
  `tools/list` returned four model-visible tools and the three app-only bounded
  signaling helpers.
- `get_u1_status` returned a reachable printer and available camera;
  `get_u1_camera_frame` returned relayed `image/jpeg` data;
  `open_u1_camera_stream` returned an MCP Apps offer; and
  `close_u1_camera_stream` confirmed explicit teardown.
- The installer replaced the previous cache version; rollback requires
  restaging a prior Git version rather than selecting an old cache directory.
  A mistakenly resolved, unused staging copy was moved to a dated Trash
  quarantine outside the repository rather than deleted.

## Secure remote Monitor source slice — 2026-08-27

### Acceptance and safety boundary

- Milestone: F0 dual-environment and contract discovery.
- Decision 0017 records the user-authorized slice: standard-HTTPS public OAuth
  and Streamable HTTP MCP, a separate loopback enrollment listener for a
  tailnet-only Serve origin, explicit bounded STUN, and preferred per-session
  RFC5766 TURN REST credentials.
- The public inventory remains exactly four model-visible read-only tools and
  three app-only read-only signaling helpers. No upload, start, pause, resume,
  cancel, G-code, generic proxy, Control, or Admin capability was added.
- This run is static/software and simulated-protocol evidence only. It did not
  restart or inspect the live process, alter the LaunchAgent, Tailscale Serve or
  Funnel, OAuth state, installed plugin, or contact a printer. Coordinator
  diagnostics were treated as pre-change constraints, not revalidated or
  mutated deployment evidence.

### Implemented contracts

- Public `/auth/enroll` and descendants return 404. The enrollment-only handler
  exposes only private `/health` plus exact enrollment routes; MCP, OAuth token,
  media, widget, and unknown routes return 404.
- `U1_ENROLLMENT_BASE_URL` must use the public OAuth hostname on a distinct
  nonstandard HTTPS origin. Configuring it requires a distinct loopback
  `U1_ENROLLMENT_PORT`. The listener remains bound after restart with an
  existing credential: private health remains available and enrollment stays
  404 until a local reset creates a new one-time flow.
- Public OAuth is restricted to standard HTTPS port 443. Public MCP continues
  to require audience- and scope-bound `u1.monitor` tokens; optional exact HTTP
  signaling retains its single-use capability authentication.
- ICE defaults empty. The standalone owner-only schema-2 config accepts and
  preserves bounded repeatable `--stun-url` values; schema 1 reads with an empty
  STUN migration. The HTTP server can use env ICE configuration without any
  standalone config and fails if an existing optional config is malformed.
- TURN configuration accepts bounded `turn:` and `turns:` URLs plus a
  server-only shared secret and a 1800-to-3600-second TTL. Each camera request
  derives `expiry:nonce` plus base64 HMAC-SHA1 credentials and gives the exact
  same ephemeral ICE set to the printer offer and widget-private result
  metadata. The shared secret never leaves the server; derived credentials,
  sessions, printer URLs, and printer peer IDs remain outside model-readable
  content and structured content.
- Malformed ICE coverage rejects wrong schemes, empty TURN addresses,
  credential-bearing URLs, unsupported query parameters, duplicate or
  oversized lists, partial TURN configuration, invalid secret lengths, and
  invalid or out-of-range TTLs and ports.

### Commands and results

From `plugins/u1-print-studio/app`:

- `bun install --frozen-lockfile`: passed and restored this worktree's missing
  dependencies without changing the lockfile.
- `bun run check`: passed TypeScript compilation with no emit.
- `bun test src/*.test.ts`: passed 60 tests with 324 assertions across ten
  files. Coverage includes the enrollment split and post-enrollment restart,
  env-only HTTP compatibility, owner-config STUN preservation, malformed ICE
  rejection, deterministic TURN REST derivation, exact printer/browser ICE
  handoff, model-result privacy, authenticated four-plus-three tool inventory,
  bounded sessions, fallback, PNG, packaging, and existing status contracts.
- `bun run bundle`: passed and emitted the ignored stdio bundle plus widget.
- `bun run bundle:runtime`: passed and produced the ignored macOS arm64
  standalone executable; its ad-hoc validation signature verified.
- Standalone `--help`: passed and advertised repeatable `--stun-url` setup.
- Standalone `setup` against a temporary loopback printer origin with one
  fixture STUN URL: passed and wrote schema 2. A second setup changed only the
  fixture printer origin and preserved STUN. `doctor --offline --json` passed
  with `iceTraversal: explicit-stun-only` and skipped printer observation.
  The temporary config mode was `0600`; it contained no TURN setting or secret.
  The temporary directory was removed after the smoke check.
- `codesign -vvv --verify ./dist/u1-print-studio`: passed.

From the repository root:

- U1 mobile setup `quick_validate.py` through
  `uv run --no-project --with pyyaml`: passed with `Skill is valid!`.
- Plugin Creator `validate_plugin.py` through
  `uv run --no-project --with pyyaml`: passed.
- `./scripts/check-repository.sh`: passed, including TypeScript and all 60 Bun
  tests with 324 assertions; final output was `repository contract: ok`.
- `git diff --check`: passed.

### Unverified later layers and blocker

- No public-edge request was made, so standard-HTTPS discovery, public
  enrollment rejection, private Serve health, preserved live handlers, and
  unauthenticated public rejection remain deployment evidence gates.
- No TURN service URL or shared secret was supplied. A real TURN allocation,
  credential expiry/refresh behavior, bandwidth, and relay availability remain
  externally blocked. Explicit STUN can be a compatibility deployment step but
  does not prove reliable remote media.
- No printer or mounted host was contacted. ChatGPT and Codex WebRTC playback,
  snapshot fallback, Close, PiP, fullscreen, and user outcome remain
  unobserved. No mounted-host success is claimed.

## Post-merge secure remote deployment — 2026-08-27

### Delivery and installation

- Pull request 18 merged the secure source slice as `e298885`. Independent
  reruns passed the repository contract with 60 Bun tests and 324 assertions,
  both bundles, the setup skill validator, the plugin validator, signature
  verification, and whitespace checks.
- Personal Marketplace version `0.2.0+codex.20260827202019` was release-staged
  and installed. Source, staged, and installed standalone runtimes shared
  SHA-256 `d6f5f23f90c532e86acb0b3c7a0fc32f10d7deeede73bb267be66c13ec33fac1`.
  The prior personal source is recoverable from Trash at
  `u1-print-studio-personal-source-20260827T201915Z`.
- The owner config migrated from schema 1 to schema 2 with mode `0600` and one
  explicit STUN URL. Offline doctor reported `explicit-stun-only`; no printer
  origin or credential was recorded here.

### Live public and private boundaries

- OAuth state SHA-256 was unchanged across the service reload. The LaunchAgent
  now runs the merged repository app rather than the replaceable Marketplace
  staging source; its previous plist is recoverable from Trash at
  `com.scottchu.u1-print-studio.plist.20260827T202600Z`.
- Loopback public and enrollment health returned 200 on ports 8787 and 8789.
  Public standard-HTTPS health returned 200, public enrollment returned 404,
  and unauthenticated public MCP returned 401 with `u1.monitor` resource
  metadata. OAuth discovery published only standard-HTTPS endpoints.
- Existing Serve/Funnel routes were preserved. Tailnet-only Serve port 8447
  proxies only to the enrollment listener; private health returned 200 while
  private MCP, token, media, widget, and enrolled-state enrollment routes all
  returned 404. Funnel remained enabled only on port 443.

### Installed and real-printer read-only evidence

- An exact installed-cache stdio client listed seven tools: four model-visible
  read-only tools and three app-only signaling helpers. Status reported the
  printer reachable, a relayed JPEG observation reported 124,642 bytes, an
  H264 offer included one configured ICE server, and explicit local session
  close returned true. No printer-control tool or action ran.
- A direct bounded printer offer confirmed the STUN config reached the printer,
  but its SDP still contained only `host` candidates and no server-reflexive or
  relay candidate. This does not prove internet-routable media.
- Browser discovery returned no connected browser surface. Mounted ChatGPT and
  Codex playback, fallback, PiP, fullscreen, and user-visible success therefore
  remain unverified. No TURN REST service URL or shared secret was supplied, so
  a real relay allocation and reliable arbitrary-network playback remain
  externally blocked.

## Camera-only presentation source validation — 2026-08-28

### Static, software, and simulated protocol evidence

- `bun run check`: passed.
- `bun test src/app.test.ts src/status-dashboard.test.ts`: passed after the
  final visual/lifecycle corrections with 30 focused tests.
- `./scripts/check-repository.sh`: passed with 69 Bun tests and 398 assertions;
  final output was `repository contract: ok`.
- `git diff --check`: passed.
- Both edited plugin skills passed Skill Creator `quick_validate.py` through
  `uv run --no-project --with pyyaml`.
- Plugin Creator `validate_plugin.py` passed through
  `uv run --no-project --with pyyaml`.
- `bun run bundle`: passed and emitted `camera-widget.html` as a distinct
  embedded asset alongside `widget.html`.
- `bun run bundle:runtime`: passed; the macOS arm64 standalone runtime was
  ad-hoc signed and `codesign` reported it valid on disk and satisfying its
  designated requirement.
- A compiled-runtime stdio client listed exactly four model-visible tools
  (`show_u1_status`, `get_u1_status`, `get_u1_camera_frame`, and
  `open_printer_camera`) plus four app-only helpers
  (`open_u1_camera_stream`, answer, candidate, and close), listed
  `camera-v1.html`, and read a camera-only embedded resource.
- Regression tests prove `open_printer_camera` returns a snapshot without
  opening a session, both MCP and `/dashboard/camera` serve the same HTML,
  focused routes are absent from ordinary server mode, external CSP lists are
  empty, the widget has no `fetch(` or caller-selected URL, camera markup is
  exactly equal to the current status widget camera section, the module script
  parses under strict semantics, and Live requires a rendered frame.

### Private browser and real-printer read-only evidence

- A separate source dashboard ran on loopback port 8791 without changing the
  installed plugin, LaunchAgents, OAuth state, or Tailscale routes.
- The in-app browser opened `/dashboard/camera`; the host reported its bridge
  ready and the focused widget displayed a current real camera snapshot using
  the exact existing camera component presentation.
- One user-authorized read-only Go Live interaction negotiated successfully.
  The widget did not label the connection Live until a rendered frame callback,
  then reported an observed `Live · 23 FPS`. Close released the session and
  returned the same component to Snapshot.
- The temporary source server was stopped after the check.

### Evidence boundary

- The private loopback source dashboard proves this machine's test host,
  bridge, real snapshot, rendered live path, and Close behavior. It does not
  prove the not-yet-installed plugin, mounted Codex/ChatGPT resources, mobile
  playback, arbitrary-network traversal, or snapshot fallback under a real
  failure.
- No TURN server is configured. No live TURN allocation or relay candidate was
  observed, so robust remote mounted playback remains unproven.
- No printer control, upload, start, pause, resume, cancel, G-code, generic
  proxy, or Admin action ran.

## Camera-only post-merge install and private deployment — 2026-08-28

### Delivery and installation

- Pull request 22 merged the source slice as `333bebe`.
- Plugin Creator cache-busted and validated Personal Marketplace version
  `0.2.0+codex.20260828194545`. Release staging came from the exact merged Git
  tree, replaced the developer MCP descriptor with `.mcp.release.json`, and
  embedded the validated standalone runtime. No `.env`, `node_modules`, or
  `dist` directory entered the staged plugin.
- The prior personal plugin source was moved, not deleted, to recoverable Trash
  quarantine `u1-print-studio-personal-source-20260828T195024Z`.
- `codex plugin add u1-print-studio@personal` installed the cache-busted
  version. Staged and installed runtimes shared SHA-256
  `b7c0151f01faaddf57aba04f884819ebef92c3254cdae74a09c7c88416af5be1`.
  `codex mcp get u1-print-studio` resolved the portable relative runtime command
  in the installed cache.
- An exact installed-cache stdio client listed model-visible
  `show_u1_status`, `get_u1_status`, `get_u1_camera_frame`, and
  `open_printer_camera`; app-only stream open, answer, ICE, and close; and
  status-v4, status-v3, and camera-v1 resources. The camera resource was 29,785
  bytes and contained the rendered-frame gate without printer-status markup.

### Existing-service restart and deployed private test

- The canonical clean `main` checkout fast-forwarded to `333bebe`. Existing
  `com.scottchu.u1-print-studio` and
  `com.scottchu.u1-print-studio-dashboard` LaunchAgents were restarted with
  their already loaded configuration; no plist, OAuth, enrollment, or
  Tailscale command changed configuration.
- Public health returned 200. Private `/dashboard/camera` and
  `/camera-widget` returned 200. The Tailscale Serve/Funnel status SHA-256 was
  `7dac599f0a80ff45802a7812dda5b67ac2042bc9f66121d18968a83c15d5eebe`
  both before and after restart.
- The deployed private camera host reported its bridge ready and displayed a
  fresh real snapshot. Go Live reached the rendered-frame gate and reported
  `Live · 25 FPS`; Close returned to Snapshot. The test used only read-only
  camera calls.

### Remaining evidence boundary

- Installed-cache MCP contracts and the deployed private browser are verified.
  A fresh Codex or ChatGPT task is still required to prove the new
  `open_printer_camera` mounted resource in those hosts; this existing task
  cannot hot-load the reinstalled descriptor.
- No TURN server or relay allocation was added. The successful private browser
  path does not prove arbitrary-network mounted playback, failure fallback, or
  mobile playback.
- No printer control, preparation, upload, start, pause, resume, cancel, G-code,
  generic proxy, or Admin action ran.

## Camera workflow repair source validation — 2026-08-28

### Acceptance and safety boundary

- Decision 0019 makes `open_printer_camera` the only model-visible camera
  action. The complete inventory is three model-visible plus five app-only
  read-only tools under the existing `u1.monitor` boundary.
- A one-time widget-private activation is required before stream allocation;
  stale direct stream calls fail before printer access or capacity use.
- Unanswered offers release after 15 seconds. Answered sessions retain the
  existing maximum duration and explicit Close behavior.
- This section is source/software and simulated-protocol evidence only. It did
  not mutate an installed plugin, LaunchAgent, OAuth state, Tailscale route, or
  printer.

### Commands and results

- `bun install --frozen-lockfile`: restored worktree dependencies without
  changing the lockfile.
- `bun run check`: passed TypeScript compilation.
- `bun test src/*.test.ts`: passed 71 tests with 417 assertions. Regressions
  cover model/app visibility, private activation, rejection before allocation,
  one-time replay failure, unanswered-session cleanup, v2/v1 resource parity,
  widget Go Live flow, and runtime health schema.
- `bun run bundle` and `bun run bundle:runtime`: passed. The standalone macOS
  arm64 runtime received its validation-only ad-hoc signature.
- `codesign -vvv --verify ./dist/u1-print-studio`: reported valid on disk and
  satisfied its designated requirement.
- Plugin Creator validation passed through `uv run --no-project --with
  pyyaml`. Skill Creator validation passed for `u1-monitor-print` and
  `u1-mobile-status-setup` through the same `uv` boundary.
- `./scripts/check-repository.sh`: passed, including TypeScript and all 71 tests
  with 417 assertions; final output was `repository contract: ok`.
- `git diff --check`: passed.

### Unverified later layers

- Release staging, Personal Marketplace cache-busting/install, exact
  installed-cache MCP, public health/OAuth, private dashboard, real-printer
  snapshot/offer, mounted Codex/ChatGPT, and mobile behavior remain separate
  gates until explicitly recorded.
- No TURN server is configured, so arbitrary-network relay behavior remains
  unproven. No printer control was added or invoked.

## Camera workflow repair post-merge rollout — 2026-08-28

### Delivery and installed runtime

- Pull request 24 merged as `62acd4c`. Canonical `main` fast-forwarded to that
  merge before release staging.
- The exact merged source rebuilt and ad-hoc signed the standalone runtime.
  Plugin Creator cache-busted the staged personal source to
  `0.2.0+codex.20260828211031`; validation and standalone help passed before
  replacement. The prior source moved to recoverable Trash quarantine
  `u1-print-studio-personal-source-20260828T211017Z`.
- `codex plugin add u1-print-studio@personal` installed and enabled the new
  version. Source, stage, and cache executables share SHA-256
  `74f5f654de2a52c21a33577ffd6520f1054eb71439668885986114177faa2398`;
  the installed executable passed `codesign -vvv --verify`.
- Exact installed `doctor --offline --json` reported runtime 0.2.0, tool schema
  3, camera widget v2, valid owner configuration, explicit STUN, fixed
  read-only operations, MCP Apps signaling, and disabled external widget fetch.

### Installed-cache and real-printer read-only evidence

- The exact installed standalone MCP listed model-visible
  `show_u1_status`, `get_u1_status`, and `open_printer_camera`; app-only frame,
  stream open, answer, ICE, and close helpers; and status-v4/status-v3 plus
  camera-v2/camera-v1 resources. Camera-v2 read as 30,282 bytes.
- Calling the old `open_u1_camera_stream` shape with empty arguments returned an
  MCP error and allocated no session. A current app-only frame call then minted
  an activation and returned a 135,547-byte real JPEG. Consuming the activation
  produced one bounded MCP Apps offer with one ICE server; explicit Close
  returned true. No token, session ID, credential, or SDP was printed.

### Service restart and edge verification

- Only the existing `com.scottchu.u1-print-studio` and
  `com.scottchu.u1-print-studio-dashboard` LaunchAgents were restarted. Both
  returned to `running`.
- Loopback public health and dashboard health returned runtime 0.2.0, tool
  schema 3, and camera widget v2. Public standard-HTTPS health returned the same
  contract. Public enrollment returned 404, unauthenticated MCP returned 401,
  private dashboard camera and widget returned 200, and private enrollment
  health returned 200.
- OAuth state SHA-256 was
  `91072185057645f9fa776714b354638b2e4e5855ef48553c1dcaf5244c5a7df0`
  before and after restart. Tailscale Serve/Funnel JSON SHA-256 was
  `7dac599f0a80ff45802a7812dda5b67ac2042bc9f66121d18968a83c15d5eebe`
  before and after restart. No OAuth, passkey, enrollment, LaunchAgent plist, or
  Tailscale configuration was replaced.

### Private browser evidence and remaining gates

- The deployed private camera dashboard displayed a real Snapshot. One Go Live
  click passed the browser-rendered-frame gate and reported `Live · 24 FPS`.
  Close returned the same widget to Snapshot.
- A later user screenshot of that still-deployed decision-0019 direct path
  showed Snapshot, an incorrect immediate Fallback label during roughly three
  seconds of ordinary ICE setup, and then rendered `Live · 28 FPS`. This is
  additional real evidence that the current direct private path can render; it
  is not decision-0020 fan-out acceptance. The source widgets now retain the
  snapshot while labeling this pre-frame state `Connecting` and reserve
  Fallback for an actual terminal failure or timeout. That UI repair remains
  source-only until a later authorized rollout.
- This proves the private dashboard host, real-printer read-only path, current
  widget activation, rendered live media, and UI Close on this machine. It does
  not prove mounted Codex/ChatGPT, mobile, a real TURN allocation, or arbitrary
  network traversal; those require fresh separate tasks.
- No upload, start, pause, resume, cancel, G-code, generic proxy, Control, or
  Admin action ran.

## Decision 0020 camera fan-out source validation — 2026-08-28

### Acceptance and safety boundary

- Camera v3 is the only current focused descriptor. Every explicit
  `open_printer_camera` call produces a fresh presentation ID; camera v2 and v1
  read the same current camera-only asset.
- The connector owns one private H264 upstream and independent bounded
  downstream viewers. Printer signaling and identity never cross the inbound
  MCP/HTTP boundary. Each viewer has separate ICE credentials and Close; final
  viewer release closes the upstream.
- This is static/software and simulated-protocol evidence. No installed plugin,
  LaunchAgent, OAuth/passkey/enrollment state, Tailscale route, public service,
  real printer, mounted host, mobile client, or TURN server was contacted or
  changed.

### Commands and results

From `plugins/u1-print-studio/app`:

- `bun install --frozen-lockfile`: passed with 152 installs across 146 packages
  and no lockfile change.
- `bun run check`: passed TypeScript.
- `bun test src/*.test.ts`: passed 81 tests with 513 assertions across 12 files.
- `bun run bundle`: passed; emitted a 2.72 MB `stdio.js`, 33.73 KB camera asset,
  and 57.45 KB status asset from 588 modules.
- `bun run bundle:runtime`: passed; compiled and ad-hoc signed the standalone
  validation runtime.

From the repository root:

- `./plugins/u1-print-studio/app/dist/u1-print-studio --help`: passed and
  reported the shared setup, doctor, and MCP commands.
- `codesign -vvv --verify
  ./plugins/u1-print-studio/app/dist/u1-print-studio`: reported valid on disk
  and satisfied its designated requirement.
- The standalone runtime was invoked through `env -i PATH=/usr/bin:/bin` for
  `--help`, two `setup` calls against temporary loopback origins, and
  `doctor --offline --json`. The second setup preserved the explicit fixture
  STUN URL, doctor reported schema 4/camera-v3 with
  `printerObservation: skipped-offline`, and the temporary schema-2 config was
  mode `0600`. No Bun executable or printer access was used on that invocation
  path; the temporary config was removed after validation.
- Plugin Creator `validate_plugin.py` through `uv run --no-project --with
  pyyaml`: passed for `plugins/u1-print-studio`.
- Skill Creator `quick_validate.py` through the same `uv` boundary passed for
  all four plugin skills: mobile setup, monitor, prepare, and authorized start.
- `./scripts/check-repository.sh`: passed, including TypeScript and all 81 tests
  with 513 assertions; final output was `repository contract: ok`.
- `git diff --check`: passed.

### Regression evidence

- Fan-out fixtures prove two viewers share one upstream, receive different
  downstream ICE credentials, close independently, and release the upstream
  only after the final close. Capacity, 15-second unanswered cleanup, upstream
  termination, and opaque HTTP ticket session IDs are bounded.
- Runtime fixtures prove viewer capacity defaults to 16 and rejects values
  outside 1 through 64. Only Tailscale CGNAT/IPv6 interface addresses are added
  as explicit downstream host candidates.
- The concrete adapter is H264-only, uses the exact negotiated codec/profile,
  creates a dedicated forwarding track per viewer, and clones each RTP packet
  header. No VP8 or transcoding path is advertised.
- The exact HTTP adapter accepts only a branded
  `server-terminated-fanout` session store. MCP and HTTP sentinel tests exclude
  printer hostname/IP/MAC/device/peer identity, upstream SDP/ICE/credentials,
  and raw upstream failures from public responses.
- Status/tool/camera service fields use closed vocabularies. JPEG regression
  tests remove APP0-APP15, COM, and trailing identity metadata before widget
  `_meta`. Widget/dashboard failures use allowlisted public diagnostics.
- Widget regressions prove an activation-time frame refresh retains the
  existing snapshot as `Connecting`, not Fallback, in both camera-only and
  status widgets. Both wait for a rendered frame before Live and enter Fallback
  only through an explicit failure or the bounded no-frame timeout.
- Final finisher review replaced public status/frame object spreads with exact
  field projections. The privacy regression injects unexpected host, MAC,
  route, and peer fields and proves they are absent alongside known-field and
  JPEG sentinels. TypeScript, all tests, both bundles, standalone/offline
  smoke, plugin/skill validators, the repository contract, and whitespace were
  rerun after that repair.

### Unverified later layers

- No real U1 H264 offer was terminated by `werift`; codec/profile compatibility
  and sustained packet forwarding remain unverified on hardware.
- The 28 FPS screenshot belongs to the deployed direct-session predecessor and
  does not prove the server-terminated fan-out or camera-v3 state machine.
- No two real viewers, camera-v3 mounted host, tailnet-direct mobile candidate
  selection, real STUN path, or TURN allocation was observed.
- The bundled `werift` dependency adds no separate user install, but owner
  license selection and third-party notice review remain publication gates.
- No release cache-buster, install, service restart, merge, push, or public
  rollout occurred in this validation.

## Decision 0020 independent media-core repair validation — 2026-08-29

### Acceptance and safety boundary

- This follow-up addresses independent review findings without changing the
  accepted connector-termination, camera-v3, read-only, or printer-identity
  privacy boundary.
- Software evidence must show downstream PLI feedback reaches the shared
  upstream receiver without amplification, the first RTP payload type selects
  one exact H264 fmtp, and peers that terminate during async opening never enter
  the active session store.
- All checks remained local and offline. No printer, installed plugin,
  LaunchAgent, OAuth/passkey/enrollment state, Tailscale route, public edge,
  mounted host, mobile client, STUN endpoint, or TURN endpoint was contacted or
  changed.

### Commands and results

From `plugins/u1-print-studio/app`:

- `bun install --frozen-lockfile`: passed with 152 installs across 146 packages
  and no change.
- `bun run check`: passed TypeScript.
- `bun test src/camera-fanout.test.ts`: passed 12 tests with 82 assertions.
- `bun test src/*.test.ts`: passed 89 tests with 557 assertions across 12
  files.
- `bun run bundle`: passed from 588 modules; emitted a 2.73 MB `stdio.js`,
  33.73 KB camera asset, and 57.45 KB status asset.
- `bun run bundle:runtime`: passed, compiled the standalone runtime, and
  applied its validation-only ad-hoc signature.

From the repository root:

- The standalone runtime passed `--help` and `codesign -vvv --verify`.
- Through `env -i PATH=/usr/bin:/bin`, the standalone runtime completed two
  `setup` calls against a temporary loopback fixture and `doctor --offline
  --json`. The rewrite preserved explicit STUN, the config mode was `0600`, and
  doctor reported schema 4/camera-v3 with `printerObservation:
  skipped-offline`. The temporary config was removed.
- Plugin Creator `validate_plugin.py` passed through `uv run --no-project
  --with pyyaml` for `plugins/u1-print-studio`.
- Skill Creator `quick_validate.py` passed through the same `uv` boundary for
  all four plugin skills: mobile setup, monitor, prepare, and authorized start.
- `./scripts/check-repository.sh`: passed, including TypeScript and all 89 tests
  with 557 assertions; final output was `repository contract: ok`.
- `git diff --check`: passed.

### Regression evidence

- A concrete werift adapter fixture negotiates two H264 payload types and sends
  the first RTP packet on the second. The downstream source preserves that
  payload type and its exact profile/fmtp; duplicate or non-H264 mappings fail
  closed.
- Two concrete downstream sender PLI events produce one immediate and one
  coalesced upstream receiver PLI. Closing the first viewer unsubscribes only
  its feedback path; the second viewer continues requesting keyframes and is
  not closed. The production interval is 500 ms.
- Deferred fixtures terminate the upstream while `openViewer` is awaiting and
  return a viewer that already terminated during its awaited open. Explicit
  generations/alive rechecks reject both, release leases, and close the shared
  upstream once.
- Invalid SDP and `sendAnswer` failure fixtures prove track and first-RTP event
  subscriptions return to baseline. A direct 60-second track wait cancellation
  also removes its subscription immediately rather than retaining its timer.
- Actual-factory fixtures begin with an upstream already `failed` and a viewer
  already `closed`, emit no later connection event, and prove both opens fail
  without publishing a session. Each peer closes once, both leases release,
  and every termination subscription is removed.

### Unverified later layers

- A real U1 may use different H264 payload/fmtp behavior; real receiver PLI,
  sustained fan-out, peer failure, and reconnect remain unobserved.
- No real two-viewer playback, mounted camera-v3 host, iPhone/mobile path,
  tailnet-direct ICE selection, real STUN traversal, H264 browser decode, or
  TURN allocation is accepted by these fixtures.
- The deployed direct private-path screenshot remains evidence only for the
  decision-0019 predecessor. It does not accept this fan-out repair.
- No push, merge, release staging, install, service restart, route/auth change,
  or printer control occurred.

## Decision 0021 focused observation source validation — 2026-08-30

### Acceptance and safety boundary

- The source implements the selected Instrument Strips direction, exact two-
  intent model-visible surface, shared explicit-refresh observation store,
  selected-module projections, missing-value/provenance semantics, focused-view
  inventory, and frozen compatibility resources.
- Plain presentation calls are cache-only. Explicit due refreshes are the only
  upstream reads, concurrent refreshes coalesce, and refresh failure retains
  last reachable values as stale with the original source time. Overview stays
  unavailable until all focused modules are accepted.
- No printer, installed plugin, LaunchAgent, OAuth/passkey/enrollment state,
  Tailscale route, public edge, mounted host, mobile client, STUN endpoint, or
  TURN endpoint was contacted or changed.

### Commands and results

- From `plugins/u1-print-studio/app`, `bun run check` passed TypeScript;
  `bun test src/*.test.ts` passed 101 tests with 594 assertions; `bun run bundle`
  and `bun run bundle:runtime` passed.
- `dist/stdio.js` is SHA-256
  `be255f625137079a64b17031b36ffb5e2ba4a46264e6ac56679448bcb04fac16`;
  the ad-hoc-signed macOS arm64 `dist/u1-print-studio` is SHA-256
  `062e7cf9c826198db82457401ea8b28aae8eaa347b2485e245556fdc04971ddf`.
  Standalone help and `codesign -vvv --verify` passed.
- Current observation/camera assets are SHA-256
  `128975091b192369a83476f5d8664da494d4d4fa968ef5e7fc29fe730fd51d3f`
  and `2cc7c28f7d692ff7880bfc5cd400d2032b05765ce1bb142ea5dac205c349bc8b`.
  Frozen status v4/v3 bytes remain 57,450 bytes at
  `da9625f5832a4df4e34312999326d241299ed6de9bd4073a60d699d4478db437`;
  frozen camera v3/v2/v1 bytes remain 33,725 bytes at
  `c8ef35062ae004ac571501ed99f2810465aa0e12cddbe965918b84d30b476203`.
- Plugin Creator validation and Skill Creator validation for all five plugin
  skills passed through the repository's `uv` boundary.
- `./scripts/check-repository.sh` passed, including TypeScript and all 101 tests
  with 594 assertions; final output was `repository contract: ok`.
- `git diff --check` passed. A focused consistency scan confirmed the exact
  two-visible/eight-app-only inventory, required eight-view enum,
  observation-v2/camera-v4 contract, frozen legacy resources, and deferred
  overview across durable records.
- Local browser fixture review at roughly 589 by 844 pixels accepted the focused
  Progress, Thermals, Heads, and separate Camera presentations. Captures remain
  outside the repository.

### Unverified later layers

- Live mappings remain unresolved for cavity, filament material/color and
  sensors, jobs/history, queue, fans/purifier, and bed mesh. Their known-value
  semantics are not accepted by static fixtures.
- No fresh mounted Codex/ChatGPT task, mobile host, live normalized observation,
  overview composition, accessibility audit, or user ten-second comprehension
  gate is accepted by this source evidence.
- No release staging, installation, service restart, route/auth mutation,
  printer contact, printer control, merge, or publication occurred.
## Standalone camera routing regression source validation — 2026-08-29

### Acceptance and safety boundary

- Milestone: F0 dual-environment and contract discovery. The open question is
  whether a standalone "Open printer camera" request can ever be redirected to
  the status workflow when the current camera descriptor is unavailable.
- Acceptance requires both monitor and setup guidance to call only the
  model-visible `open_printer_camera` tool for that intent. Missing tools or
  resource-read failures must be reported as stale/unavailable connection state;
  `show_u1_status`, `get_u1_status`, `get_u1_camera_frame`, and
  `open_u1_camera_stream` are prohibited substitutes.
- The inventory remains exactly three model-visible tools plus five app-only
  helpers. Camera-v3, fan-out, privacy, OAuth, enrollment, ICE, and read-only
  boundaries are unchanged.
- This change is local source/software evidence only. It did not push, merge,
  reinstall, restart, mutate a service or route, contact a printer, or verify a
  mounted host.

### Prior rollout and observed regression

- Pull request 26 previously merged decision 0020 as `4f9041c`. Personal
  Marketplace version `0.2.0+codex.20260830013924` was rebuilt from that merge
  and installed; both existing services restarted on schema 4/camera-v3 while
  OAuth state and Tailscale routing stayed unchanged.
- A new conversation inside a Codex Desktop process started before that
  reinstall still lacked `open_printer_camera`. It selected the monitor skill
  and called `show_u1_status`, mounting the entire status card. This is
  stale-host-process and guidance-regression evidence. It is not evidence that
  the rebuilt camera-v3 resource includes status-card markup.
- The packaging record now requires a fully new host process for upgrade
  acceptance when the host predates installation. A new conversation alone is
  not sufficient evidence.

### Implemented contract

- `u1-monitor-print` and `u1-mobile-status-setup` contain the same exclusive
  routing guard and fail-closed reload guidance.
- Mobile setup wording now names exactly three model-visible tools and five
  app-only helpers; stale four-tool completion wording is absent.
- Plugin Creator's supported `interface.defaultPrompt` array now has three
  entries, within the schema's three-prompt limit, with `Open my printer
  camera.` first. No unsupported manifest field was added.
- `camera-routing-contract.test.ts` locks the exclusive routing text, failure
  behavior, inventory, supported starter prompts, and fresh-host-process
  packaging guidance.

### Commands and results

From `plugins/u1-print-studio/app`:

- `bun install --frozen-lockfile`: passed with 145 packages installed and no
  lockfile change.
- `bun test src/camera-routing-contract.test.ts`: passed 4 tests with 12
  assertions.
- `bun run check`: passed TypeScript compilation.
- `bun test src/*.test.ts`: passed 93 tests with 569 assertions across 13
  files.
- `bun run bundle`: passed from 588 modules and emitted the 2.73 MB stdio
  bundle plus 33.73 KB camera and 57.45 KB status assets.
- `bun run bundle:runtime`: passed and produced the validation-only ad-hoc
  signed standalone runtime.
- `codesign -vvv --verify ./dist/u1-print-studio`: reported valid on disk and
  satisfied its designated requirement.

From the repository root:

- Plugin Creator validation through `uv run --no-project --with pyyaml`:
  passed.
- Skill Creator validation through the same `uv` boundary passed for both
  touched skills: `u1-monitor-print` and `u1-mobile-status-setup`.

- `./scripts/check-repository.sh`: passed on the exact documented tree,
  including TypeScript and all 93 tests with 569 assertions; final output was
  `repository contract: ok`.
- `git diff --check`: passed on the same tree.

### Unverified later layers

- The exact source is independently approved but has not been merged,
  release-staged, reinstalled, or loaded by a freshly relaunched host.
- A full Codex Desktop quit/relaunch and an actual `open_printer_camera` call
  remain the next mounted-host gate. Any status-card substitution is a failure.
- Real U1 fan-out, two simultaneous viewers, mobile ICE, and TURN remain
  separate evidence gates. No printer-control action is authorized.

### Independent review

- Role: independent code and documentation reviewer, separate from the
  implementation role.
- Exact reviewed commit:
  `4045f352729720d51d46ad8aa308c7e84c47d33a`.
- Verdict: **APPROVE**, with no findings.
- The reviewer independently verified `bun run check`, the full 93-test and
  569-assertion suite, `bun run bundle`, `bun run bundle:runtime`, standalone
  `codesign` verification, Plugin Creator validation, both touched Skill
  Creator validations, `./scripts/check-repository.sh`, and
  `git diff --check`.
- This approval accepts the source routing guard, manifest-supported prompt,
  three-plus-five inventory wording, test contract, and durable records. It
  does not accept mounted-host behavior, the live camera, a new installed
  plugin, or user outcome. Those remain blocked on a full Codex Desktop quit
  and relaunch followed by an observed `open_printer_camera` mount.
