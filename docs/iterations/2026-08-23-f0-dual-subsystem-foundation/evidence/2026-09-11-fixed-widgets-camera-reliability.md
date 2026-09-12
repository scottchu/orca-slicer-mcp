# Fixed live widgets and Camera reliability — 2026-09-11

## Scope and baseline

Decision0059's fixed-widget direction is delivered through PR125: Camera recovery
and all nine fixed observation views ship together at runtime0.4.20/schema18/
observation23/Camera18. Reviewed head `373e4e05994284d84d578fa28bf9784bdb949bf0`
merged as `1716867af057d55b2e170215126dff429f4d000f`; release
`20260912-1716867-pr125-20260912T005903-cfae3d` passed mandatory shipment,
explicit restarts of both services, integrity/exact assets/security and scoped
installed verification. The final sections own exact commands and outcomes,
including nine installed synthetic views, one real Overview observation and a
210.148-second real Camera Live check from local desktop Chrome.

Two pre-merge shipping stops and the original 431-pass/3-failure full browser
collection remain recorded alongside their verified corrections and affected
closure. No second complete 434-case green run is claimed. Preserve all 55
ledger IDs and separate product gaps; actual iPhone recovery and the original
crash cause remain unverified. Dynamic expansion is stopped, its source/history
private and unregistered. Earlier planning and pending-status paragraphs below
retain their dated execution context; release and record closure are complete.

Initial inspection found an older checkout at acaaa7978f10b46642f8c29f56bab3ce4b82ae97.
Before edits, the coordinator fast-forwarded to origin/main/PR124 at
7bcf99939d2f24f0e4b82fc164d9dfcecf6f2c44 on
codex/u1-fixed-widgets-camera-reliability. The direction owner reread current
records and allocated decision0059 because0056–0058 already existed.
Recorded deployed baseline is PR123 merge71b007852f02cda291bbe41c598e93a63576ace5,
runtime0.4.19/schema18/observation22/Camera17.

Coordinator-reported actual read-only command:
`uv run --no-project scripts/u1_service.py status` PASS, public and dashboard
loaded=true, healthy=true, integrity=verified at the above versions. This checks
service baseline without Camera acquisition; it proves no sustained media or
actual-phone behavior. Pinned Bun is1.4.0.

## User evidence and boundaries

The user reports Camera dropping after about three minutes and repeatedly
crashing/reloading. Two phone screenshots show `Live reply timed out` then
neutral placeholders with `Could not load camera`. Visible failures are image
evidence; duration/repetition are user reports. Root cause, exact failing
resource, browser-process crash and successful actual-phone repair are unverified. Private
attachments are not copied into the repository. Earlier positive home/outside
reports remain historical and do not close this newer C08 report.

## Direction-record author work

Read required current state/order/requirements/CURRENT and active brief/handoff/
validation, decision index and widget ledger using direct reads and explicit
Homebrew rg. Actual identity commands: `git status --short`, `git rev-parse HEAD`
and `git branch --show-current`. The first proposed atomic patch failed before
any edits because duplicate delete/add operations targeted the same file. An
initial decision0055 read used an incorrect filename, then the indexed file was
read. Neither failure changed application bytes or represents a test result.

Direction changes: PROJECT_STATE, NEXT_AGENT, active BRIEF/HANDOFF/VALIDATION,
requirements, decision0059/index, this evidence and C08 in widget-delivery.
Prior record bodies remain preserved under explicit historical scope.
Application authors/reviewers append changed paths, actual commands/results and
source/build identities here. One owner records the frozen candidate full run;
source review and independent targeted/adversarial verification are separate.
No implementation, candidate acceptance or new release is claimed by this edit.

## Contract reference and remaining acceptance

Coordinator checked official [ChatGPT UI guide](https://developers.openai.com/plugins/build/chatgpt-ui)
and [reference](https://developers.openai.com/plugins/reference); preserve the
existing interactive, decoupled host bridge without new tools/schemas/auth.

Keep static/software, protocol/simulator, deployed-service, real-printer and
actual-phone results separate. Live-media claims require decoded/presented
frames; synthetic timed success or health/assets cannot close C08. Lab visuals
cannot accept live adapter/route coverage. Record exact independent review,
mandatory gates, PR/merge/build identities, both restarts and scoped meaningful
installed verification only after they occur. Continue remaining fixed widgets
after the first candidate.

Direction-tail checks: `git diff --check` PASS; `uv run --no-project`
comparison of delivery-ledger IDs against HEAD PASS, all55 unchanged. These
are documentation checks, not application or independent verification.

## Independent Camera source review and targeted verification

Reviewer: `domain_review` (printer-domain role, no application authorship).
Reviewed the working-tree Camera diff against HEAD
`7bcf99939d2f24f0e4b82fc164d9dfcecf6f2c44`. This is bounded approval of the
Camera patch identified below, not frozen whole-candidate or shipping approval.

Actual commands: `git diff --` with the four Camera paths below; direct source
reads; `command -v bun`; `bun --version` (1.4.0); `git rev-parse HEAD`; and
`shasum -a 256` on those four files. From `plugins/u1-print-studio/app`, ran:

```sh
bun --no-env-file --config=/dev/null run ui:test src/lib/client/camera/session.test.ts src/lib/client/camera/host-deadlines.test.ts src/lib/client/camera/live-controller.test.ts
```

PASS: three files, 62 tests (38 session, 8 host deadlines, 16 live controller).
Reviewed identities, all relative to `plugins/u1-print-studio/app/`:

| Path | SHA-256 |
| --- | --- |
| `src/lib/client/camera/session.ts` | `1e3348543b0f0699552307178d474788a4ebee3374e05d8874aa1ffa41862cbd` |
| `src/lib/client/camera/session.test.ts` | `e2ad0bde413b88c6ba617aed481ab9d13c5ff4c3efcc7d9f7264cacb71481980` |
| `src/lib/client/camera/host-deadlines.test.ts` | `b2029f37b4792cab722427fe2c3fd2c4fdc5ab22454dfa8efc7bfcb7cf7a1ef6` |
| `src/lib/client/camera/live-controller.test.ts` | `76d16bce235ca80bc3804c5fc89c8d89bcb96d65157b243354fbe853f592f81c` |

Also executed an independent, ephemeral stdin probe with
`bun --no-env-file --config=/dev/null - <<'TS'` from that app directory. The probe
imported the actual `createCameraSession` and `node:assert/strict`, used an
in-memory timer scheduler and deferred synthetic ports, and exercised three
fresh adversarial cases:

- Connected peer with one presented frame then repeated identical frame counts
  every second: playback still times out and closes exactly once.
- Connected peer with pending answer followed by `pageHide`, then late answer
  resolution and 15 seconds of simulated time: no Live resurrection, one close,
  zero timers.
- Two failed Auto snapshots followed by a pending host-image decode, `pageHide`,
  late successful decode, then failed `pageShow` acquisition: canceled decode
  does not reset the failure counter; no new acquisition at 5,999 milliseconds,
  one acquisition at 6,000 milliseconds. Final disposal leaves zero timers.

All three assertions passed. The probe wrote no repository file, opened no
network connection or browser, and disposed each session in `finally`. No full
suite or build was run by this reviewer.

No blocking Camera finding: answer timeout exemption still requires current
session intent/epoch, connected state, Live phase and accepted advancing frame
evidence received less than five seconds ago. Explicit rejection, playback
stall, disconnect and lifecycle cleanup remain effective. Failure backoff is
bounded at 30 seconds and resets only after accepted decode; canceled decode
does not supply that acceptance.

These are source and synthetic software/protocol results. The 210-second test
uses simulated frame events; it does not prove real media duration, repair of
the reported phone crash, actual-host behavior or its root cause. No printer
read, stream, command or physical acceptance occurred. Later changed Camera
bytes invalidate this bounded review; whole-candidate review remains pending.

The same reviewer sent source-derived constraints directly to both live-widget
authors: preserve independent nullable Progress fields; Current Job reported/value
metadata without inventing progress or ETA; all eight History statuses, nullable
times and returned-page count; Overview per-tile receipts and reported-fan versus
active-fan meaning; and Bed Mesh probed-grid semantics, valid all-zero active mesh,
source bounds, no-active versus unavailable, and server receipt versus calibration
time. Those are design constraints, not acceptance of unfinished adapters.

## Camera and Bed Mesh author evidence

Author: `camera_fix`, based on `7bcf99939d2f24f0e4b82fc164d9dfcecf6f2c44`.
Camera changed only the four client paths identified by the reviewer above.
The screenshot label maps to the answer-stage 10-second client deadline; there
is no three-minute client expiry or Camera page-reload call. The default server
stream lease remains 30 minutes, with its existing 15-second answer bound. This
does not identify the cause of a phone-process crash.

Camera now keeps current connected, advancing video when only the answer reply
reaches its deadline. Actual rejection and first-frame/playback/disconnect
guards remain. Repeated failed Auto acquisition waits 1.5, 3, 6, 12, 24 and then
at most 30 seconds after completion; accepted decode restores the healthy
1.5-second cadence. Hidden/disposed work cannot reset this failure counter.

All commands below ran from `plugins/u1-print-studio/app` unless stated otherwise.
The pinned command prefix is
`/Users/scottchu/.asdf/installs/bun/1.4.0/bin/bun --no-env-file --config=/dev/null`.

- Initial `bun x vitest run` of session/host-deadlines failed before collection
  because dependencies were absent; Bun fetched transient tooling. The tracked
  dependency files did not change. `bun install --frozen-lockfile` used installed
  Bun1.4.0, followed by pinned `install --frozen-lockfile --ignore-scripts`
  (323 installs checked, no changes).
- Pinned `x vitest run src/lib/client/camera/session.test.ts src/lib/client/camera/host-deadlines.test.ts`
  first failed because `.svelte-kit/tsconfig.json` was absent. Pinned
  `x svelte-kit sync` passed. Repeating that test command before implementation
  gave 44 PASS and two expected failures: a healthy connected stream tore down
  at 10,000ms with `stage=answer`, and failure polling repeated at 1.5 seconds.
- Final pinned `x vitest run src/lib/client/camera/session.test.ts src/lib/client/camera/host-deadlines.test.ts src/lib/client/camera/live-controller.test.ts src/lib/client/camera/transport.test.ts src/lib/client/camera/peer.test.ts src/lib/client/camera/failure.test.ts`
  passed 87 tests in six files. One intermediate run had the old resume-cadence
  assertion fail; it now expects 3 seconds after missing bootstrap plus a failed
  resumed read. The final rerun at 22:51:32 passed after adding `finally` cleanup
  to the new cases.

The host-deadline regression runs the actual HostRpc and Camera controller for
211 simulated seconds with presented-frame events, one peer, one answer call
and no automatic stream reopen. It preserves the missing-reply stream through
the underlying host deadline, then confirms disconnect closure. Negative
unconnected, no-frame and rejected-answer cases still close; a stalled frame
while the answer is pending still produces the playback failure. The failure
cadence test runs three simulated minutes, confirms the cap and reset after
decode, and confirms hide/disposal stops timers.

Bed Mesh authored paths, relative to app root:

- `src/lib/client/live/bed-mesh-adapter.ts`, `bed-mesh-presentation.ts` and
  `bed-mesh-controller.ts` validate/map the public operations projection into
  the existing generic `u1.bed-mesh.presentation.v1` renderer input. No fixture
  marker is added. Matrix values/order, source bounds and summary are checked;
  no interpolation, profile substitution or invented receipt is introduced.
  Main-status and mesh-domain receipts remain distinct.
- `src/components/live/LiveBedMeshRoot.svelte`,
  `src/entrypoints/widgets/live-bed-mesh.ts` and additive
  `src/components/bed-mesh/BedMeshWidget.svelte` props connect the real controller
  to the existing native 2D/3D view. Domain metadata, no-active/unknown messages,
  Lab-marker opt-out and an explicit Refresh slot preserve the Lab defaults.
  Failure masks retained renderers inert/aria-hidden and masks receipts; existing
  Reset/Retry and guarded 2D focus recovery remain in the shared widget.
- `tests/browser/fixtures/live-bed-mesh.ts`,
  `src/lib/client/live/bed-mesh-adapter.test.ts` and
  `bed-mesh-controller.test.ts` provide synthetic producer envelopes and tests.

Final pinned `x vitest run src/lib/client/live/bed-mesh-adapter.test.ts src/lib/client/live/bed-mesh-controller.test.ts src/lib/client/bed-mesh/BedMeshState.test.ts src/lib/client/bed-mesh/BedMeshWidget.test.ts src/lib/client/bed-mesh/retry-focus.test.ts`
passed 36 tests in five files at 22:58:50. Coverage includes actual normalizer
outputs for 64x64 flat grids at zero and +/-1,000,000, observed no-active sentinel,
unknown/not-reported/unsupported/unavailable, private/malformed fields, independent
stale receipt, local controls without acquisition, failed-refresh masking and
successful 2D Retry focus. The first run had one test-only failure because it
looked for a `time` element while existing ObservedMeta uses a span; it now checks
the actual formatted independent receipt and masking. Root `git diff --check`
passed. No full suite, generated-asset build, browser/phone/printer acquisition,
deployment or physical acceptance was performed by this author. Shared route/
bundle integration and independent review remain owned by other agents.

## Independent UI/UX baseline — fixed Lab only

Reviewer: `ui_review`; baseline source HEAD
`7bcf99939d2f24f0e4b82fc164d9dfcecf6f2c44`. No application code or assets were
changed by this reviewer. The current unbuilt application WIP was not accepted.
The source-independent static Lab HTML bytes served for these captures were:

- `public/svelte-observation-lab.html`: SHA256
  `559e550ed7115d59e9190b9abf56d584aa99148eef6aa1ba9494e45d65349c1c`.
- `public/svelte-bed-mesh-lab.html`: SHA256
  `5ba57e92cdcfc2e2e4f56f545bd62891f46be7b79c0f82f06c4d169e56f5868c`.
- `public/svelte-camera-lab.html`: SHA256
  `c6b49974a68dd3dbd228d3d1a2426efa8bbf99ffea5adaf3b19f74695b8cbc57`.

Executed from app root: `PORT=4179 bun --no-env-file --config=/dev/null run
scripts/serve-private-lab-fixture.ts` failed because the port was already in use.
No existing listener was stopped. The same command with `PORT=4197` started an
isolated static Lab fixture whose status/frame acquisition callbacks throw.
CUA attempts to create an in-app Browser and fallback Chrome tab both returned
`Browser is not available`; no CUA screenshot or interaction is claimed.
The repository-authorized isolated Playwright baseline probe then ran with
Bun1.4.0 and headless Chrome. It captured each of the ten fixed routes at
390x1200, 100% text: Overview, Progress, Thermals, Heads, Current Job, History,
Queue, Fans, Bed Mesh and Camera. The reviewer opened and inspected all ten saved
PNGs. Every route reported document scrollWidth390. The baseline compact
header/body/footer structure, Lab controls and domain-specific existing bodies
are the comparison reference; no redesign is requested or accepted.

Private ignored review artifacts retain the probe, browser version, route text,
viewport metrics and named route screenshots. They are synthetic evidence and
are not committed. These captures cover ready/default states only. Candidate
live bindings, 320px/200% text, loading/error/unknown/empty, keyboard/focus,
reduced-motion behavior and sustained Camera recovery remain unaccepted here.
The prepared independent Camera probe targets more than210 real wall-clock
seconds of synthetic canvas-capture media, one persistent video and peer,
continued presented-frame callbacks, object-URL counts, delayed answer response,
Auto failure/backoff/recovery and lifecycle cleanup. It has not yet run: the
single build owner must first freeze and generate the integrated candidate.
No printer data, actual ChatGPT host, phone, physical outcome or release was
observed. The initial user-supplied phone screenshots remain separate evidence
of visible failure with unproven cause. The reviewer closed the isolated
Playwright context/browser in `finally` and stopped only its4197 fixture.

## Additional fixed-widget integration authored by camera_fix

At the architect's bounded request, this author also added
`src/components/live/LiveProgressRoot.svelte`, `LiveJobsRoot.svelte`,
`LiveHistoryRoot.svelte` and `LiveOverviewRoot.svelte`,
`src/lib/client/live/focused-controllers.ts`, their four
`src/entrypoints/widgets/live-{progress,jobs,history,overview}.ts` entrypoints,
and `src/routes/dashboard/{progress,jobs,job_history,overview}/+page.svelte`
with matching `+page.ts`. The Bed Mesh native route gained the same page pair
under `dashboard/bed_mesh`.

These wrappers use the shared observation controller, subscribe/start/dispose
lifecycle and fixed live widget props. Jobs/History supply independent domain
receipt metadata; Overview's explicit failure classifier leaves validation of
each tile to its adapter so main-status offline does not mask healthy independent
domains. The architect owns those adapters, widget prop contracts, shared ports,
build/route registration and the Overview per-tile semantics. Root
`git diff --check` passed after these files were added. Their integrated compiler,
consumer tests and generated-route checks remain pending with the integration
owner; authoring these wrappers is not separate acceptance of those unfinished
contracts. No new host transport, polling loop or printer authority was added.

## Interim independent live-adapter review — open findings

Reviewer `domain_review` read the in-progress adapters, controllers, native
widgets and actual server normalizers/projectors. No application edit, full
suite, build, network or printer operation was performed. These findings were
sent directly to the responsible authors and coordinator; they remain open
until corrected bytes and targeted checks are independently reviewed.

- Independent Current Job, History and Bed Mesh observations must not become
  acquisition failures solely because the separate top-level status receipt is
  offline. Their own failed/stale acquisition reason must still mask old data.
- Progress uses the status producer's filename/layer contract, not the stricter
  Current Job filename or synthetic Lab bounds. A safe but unsupported optional
  identity must not unexpectedly blank all otherwise accepted Progress values.
- The new filename validator's blanket provider-prefix rejection differed from
  the actual `safeDisplayFilename` boundary-plus-token-shape rule. The already
  accepted harmless `github_pat_fixture.gcode` is a concrete regression case.
- Overview must preserve source-specific bounds: tools/bed accept finite thermal
  values, while Cavity owns the narrower range; joined material labels can reach
  194 characters and are not filenames. Bed Mesh `unsupported/not_reported` is
  an actual normalized source result, not malformed data.
- Preserve unsupported versus unavailable in persistent public failure text.
  Masking receipt values must not erase the safe failure classification.
- Keep delivered Current Job file position/size and History start time, total
  duration and filament facts visible as secondary information. The coordinator
  confirmed this parity requirement. Normal `in_progress` History records should
  not receive an error warning icon.
- Production panels must not carry runtime Lab defaults/attribution/validators.
  Bed Mesh's production matrix validator is legitimate, but its `Lab fixture`
  branch needs separation. Existing production import/content guards stay intact.

Actual independent reproduction command, from `plugins/u1-print-studio/app`:

```sh
bun --no-env-file --config=/dev/null - <<'TS'
import {adaptBedMesh} from './src/lib/client/live/bed-mesh-adapter.ts';
import {acquisitionFailure} from './src/lib/client/live/controller.ts';
import {liveBedMeshResult} from './tests/browser/fixtures/live-bed-mesh.ts';
import {adaptProgress} from './src/lib/client/live/progress-adapter.ts';
import {safeDisplayFilename} from './src/lib/server/adapters/moonraker-queue.ts';
import {basename} from './src/lib/client/live/focused-validation.ts';
const input=liveBedMeshResult().structuredContent;
const mesh=adaptBedMesh({...input,freshness:'offline',reachable:false,sourceObservedAt:null});
console.log('fresh independent mesh under offline status',mesh.state,mesh.receipt.freshness,'controller failure:',acquisitionFailure(mesh));
const p={...input,view:'progress',module:{kind:'progress',state:'known',capabilityEvidence:'observed',provenance:{source:'moonraker',sourceObservedAt:input.sourceObservedAt,detail:'synthetic'},fields:Object.fromEntries(Object.entries({percent:10,currentLayer:2,totalLayers:20,elapsedSeconds:10,estimatedRemainingSeconds:90,filename:'part,rev1.gcode'}).map(([k,v])=>[k,{state:'known',value:v}]))}};
try{adaptProgress(p);console.log('comma filename accepted')}catch{console.log('comma filename rejects entire progress')}
const name='github_pat_fixture.gcode';console.log('server filename:',safeDisplayFilename(name));try{basename(name);console.log('client filename accepted')}catch{console.log('client rejects server-accepted filename')}
TS
```

Observed output:

```text
fresh independent mesh under offline status known fresh controller failure: error
comma filename rejects entire progress
server filename: github_pat_fixture.gcode
client rejects server-accepted filename
```

This probe reproduces pre-fix defects, not acceptance. It uses synthetic fixture
input and actual source imports without acquisition. The authors were asked for
targeted source-normalizer-to-adapter cases covering these differences, 194-character
material, finite tool thermal extremes, Cavity bounds and not-reported support.
Sources were still changing; no frozen identity or release approval is asserted.

## Bed Mesh review corrections and release-scope reconciliation

`camera_fix` addressed the Bed-specific source findings before acceptance.
`BedMeshPanel.svelte` now owns the existing DOM/CSS, renderer retention and
guarded local focus behavior without Lab attribution or a runtime Lab branch.
`BedMeshWidget.svelte` is a zero-raw Lab wrapper injecting the attribution
snippet; `LiveBedMeshRoot.svelte` imports the Panel directly. Shared production
graph guards remain mandatory; the integration owner owns exact debt relocation
and graph/build registration rather than weakening the synthetic marker gate.

The architect had already changed `bed-mesh-controller.ts` to the shared
`domainAcquisitionFailure` classifier. The Bed author preserved that edit and
added a regression: offline main status cannot mask a known/fresh independent
mesh receipt, while a stale mesh with a failed timeout receipt remains masked.
The footer now distinguishes `not_reported` as `Bed mesh object not reported`
from actual `unsupported` endpoint evidence. Main-status metadata does not
restamp the mesh receipt or change those support meanings.

Actual command from the app root, using the pinned Bun prefix above:
`x vitest run src/lib/client/live/bed-mesh-adapter.test.ts src/lib/client/live/bed-mesh-controller.test.ts src/lib/client/bed-mesh/BedMeshState.test.ts src/lib/client/bed-mesh/BedMeshWidget.test.ts src/lib/client/bed-mesh/retry-focus.test.ts`
PASS: 38 tests in five files at 23:05:51. Existing Lab attribution, initial/error
topology, retained renderer and Retry focus cases still pass after extraction;
the two new live cases cover independent freshness and exact support wording.
Root `git diff --check` passed. No browser build or served-byte acceptance was
performed by this correction author. SHA-256 recorded with `shasum -a 256`:

| Path relative to app root | SHA-256 |
| --- | --- |
| `src/components/bed-mesh/BedMeshPanel.svelte` | `a95b4736faca7eef8036225fcfaf73517e8b0f9538ace562adc380884ea82a5c` |
| `src/components/bed-mesh/BedMeshWidget.svelte` | `6ac2fa95478758839d44d50934c336c3f63a3e6e7a51f5b9c6b0c612575a444f` |
| `src/components/live/LiveBedMeshRoot.svelte` | `f211b8f9334b22f2f001c18c2def55f60cd46ead6bedbf40f035c7691b695d23` |
| `src/lib/client/live/bed-mesh-controller.ts` | `a01d0bdc57f5f77dfb0de8c3dec71a15d5bc9ead6dff0186b278e6e1b32db309` |

The coordinator confirmed one integrated release candidate for Camera and all
nine fixed observation views. `camera_fix` reconciled only current scope/index
paragraphs in PROJECT_STATE, NEXT_AGENT, NEW_AGENT_START, BRIEF, HANDOFF,
VALIDATION, requirements, decision0059, widget-delivery and this evidence's
opening. The first-three/remaining-five wording is implementation order, not
separate releases. Earlier logs/history remain preserved. Integration and review
remain underway; no new acceptance or release is claimed by those records.
An actual `uv run --no-project -` inline comparison extracted ledger IDs with
`^\| ([A-Za-z][0-9]+)\b` from HEAD and the working file, asserted equality and
count55, and passed. Product feature gaps remain separate from renderer adoption.

## Independent Camera browser soak — fixed Camera18 resource

Validator: `domain_review`, independent of Camera application authorship. This
is execution/behavior verification, not UI-designer acceptance. The UI reviewer
prepared the initial soak script (SHA-256
`d20e3b9c4b2ea00abc97903c50a57b0b11cc66afd51430cdc2fcea8789d5d68a`).
The validator read it and the existing test-only Camera Peer fixture, then
derived a private probe with a minimal loopback host, fixed resource hash check,
single-load assertion and bounded object-URL assertions. This avoids importing
the unfinished observation server build. The derived probe SHA-256 is
`897a50d3d6acab1a3578db43069820e8577c97a68922450aacf9335e009e2697`.

Actual preparation used `mkdir -p`, `cp`, `shasum -a 256`, and `uv run --no-project -`
to derive the private probe and make its two copied HTML inputs read-only.
Execution used `bun --no-env-file --config=/dev/null` with that probe file;
its private invocation and outputs are preserved outside tracked records.
No production source, configuration or runtime was changed. Tested bytes:

| Input | SHA-256 | Scope |
| --- | --- | --- |
| `public/mcp-camera.html` | `c983e7b0e4f7da8c7b913e6b45516df87fb1ca176fc157159bf8167fc42871b7` | Exact immutable resource used in browser |
| `public/svelte-live-camera.html` | `1bed20ce48f74c6ebc89d488e0eedb6be33a89095034d10d4cd1c00d60754e97` | Copied and identified; this soak did not exercise dashboard HTML |
| `src/lib/client/camera/session.ts` | `1e3348543b0f0699552307178d474788a4ebee3374e05d8874aa1ffa41862cbd` | Unchanged from the earlier independent source review |

PASS on Chrome153.0.8010.37,390×1000 viewport. The test used the actual bundled
widget and host bridge with browser `canvas.captureStream(15)` media and the
existing test-only Peer/signaling replacement. It delayed the answer request
acknowledgement16 seconds while frames were already presented. Across210,044 ms
of real browser time, eight samples showed the same video element, one iframe
load, one opened Peer, zero closed Peers and one live track. Presented callbacks
advanced0/450/900/1350/1800/2250/2700/3150; video currentTime advanced from1.269 to
211.276 seconds. The widget remained Live15FPS without a reload; active object
URLs remained0 in these samples. The210-second screenshot was inspected.

The same browser switched to Auto, then received synthetic acquisition failures.
The inspected failure screenshot shows neutral image/receipt placeholders and
persistent `Could not load camera`. Observed frame request gaps were approximately
1.508/3.009/6.008/12.009 seconds, followed by accepted recovery after failures were
disabled. The30-second cap is covered by the earlier source tests, not this
shorter browser failure tail. After `pagehide`, live tracks=0, active object
URLs=0, Peer opens=1 and closes=1. No page errors were recorded. `finally` closed
the owned context/browser and loopback server; the process completed and
`lsof -nP -iTCP:4182 -sTCP:LISTEN` found no listener.

Private synthetic output identities: result JSON
`afae6606ed4af2286fbbff7b9976708caacdd31281844c56e0a9cae824de5a6a`,
210-second screenshot
`d5b945fe448ce5a94e63b27adc23ca4ea4f4df70b246ea4193d90b8b863de136`,
failure screenshot
`54d0748ebb5e92f8af2869a4911481498736bf7122212d741405dad4ee7b5caf`.
The validator read the JSON through `uv run --no-project -` and inspected both
screenshots. These browser/synthetic results do not establish actual phone,
ChatGPT-host, real camera, network WebRTC or physical-printer reliability, and
do not identify the reported phone crash's root cause. Retain this evidence only
while the identified Camera application/resource bytes remain unchanged.

## Artifact contracts, native route inventory and final Bed correction

Author: `camera_fix`. This tail preserves all shipping mechanics and gates.
`scripts/check-repository.sh` adds the five new required verification commands:
`verify:live-progress`, `verify:live-jobs`, `verify:live-job_history`,
`verify:live-overview` and `verify:live-bed_mesh`. No prior command was removed,
and no u1_ship mechanics, skip/cache behavior or security check was changed.

Updated current contract expectations to runtime0.4.20/schema18/observation23/
Camera18 in `tests/server/{app,cli,personal-oauth,status-dashboard}.test.ts` and
the two current URI literals in `tests/browser/mcp/widgets.spec.ts`; the
architect owns that browser file's native-selector migration. Retired-resource
negative coverage now includes every earlier observation1–22 and Camera1–17 URI.
The dashboard host test requires all nine fixed views to select their exact
native child route. The five new asset routes gain exact-byte, private-only,
no-acquisition, GET-only, malformed-path and CSP coverage alongside existing
native route cases. Bed Mesh alone permits its required Three renderer and
must contain 2D/3D/OrbitControls markers; all views still reject Lab/media and
external-resource contamination.

`public/dashboard-index.html` describes nine observation entries as `Live view`
and Camera as `Auto / Live`; it preserves existing capability-limit descriptions
instead of asserting requested product features are implemented. Its SHA-256 is
`6884362148a08da30b0963cdf981510792b330c4fa0400a7e24ecb15ba6be45a`.
The test asserts exactly nine plus one labels and no Implemented badge.

The reviewer also identified a retained stale mesh whose failed read reports
`not_reported`. `bed-mesh-controller.ts` now explicitly classifies that domain
receipt as unsupported, so the retained surface/receipt is masked with the
existing `Bed mesh object not reported` explanation. It does not infer that the
endpoint itself is unsupported. A new real-root test starts with a valid mesh,
accepts the stale failed receipt and verifies inert/aria-hidden masking, hidden
receipt and exact wording. Final controller SHA-256:
`289948cd9124e31ff1e9dd95b1518e9ef0d8882fcf826b8888043a71166eff51`.
This supersedes the earlier controller hash in the preceding correction entry.

Actual checks (app directory, pinned Bun1.4.0 prefix recorded above):

- `x vitest run src/lib/client/live/bed-mesh-adapter.test.ts src/lib/client/live/bed-mesh-controller.test.ts`:
  PASS20 tests in two files, including the new retained-not-reported case.
- An initial `test tests/server/app.test.ts tests/server/cli.test.ts tests/server/personal-oauth.test.ts tests/server/status-dashboard.test.ts`
  attempt ran before the integrated Kit build existed. App resource cases passed,
  then missing `build-kit/handler.js` caused OAuth/dashboard prerequisite failures
  and socket resets; the author stopped that task-owned process with interrupt
  (exit130). This attempt supplies no combined server acceptance.
- After the build owner produced final widget packages,
  `test tests/server/app.test.ts tests/server/cli.test.ts tests/server/live-fans-package.test.ts tests/server/mcp-widget-packages.test.ts tests/server/private-lab.test.ts`:
  PASS34 tests/346 assertions. After Kit generation,
  `test tests/server/status-dashboard.test.ts tests/server/personal-oauth.test.ts`:
  PASS43 tests/1,053 assertions. Those tests use isolated synthetic stores and
  temporary services; no deployed auth/network configuration was changed.
- Root `bash -n scripts/check-repository.sh` and `git diff --check`: PASS.
  `shasum -a 256` and `wc -c` read actual final artifacts before updating the
  literal hash/size expectations below. No full suite ran under this author.

`tests/server/live-fans-package.test.ts` now binds all nine observation packages
to their exact hashes and the ten-artifact inventory including Camera to exact
sizes (1,474,378 bytes total, no byte cap). Current artifact identities:

| Artifact in public/ | Bytes | SHA-256 |
| --- | ---: | --- |
| `svelte-live-fans.html` | 88684 | `b7a1b63811fb09ab6e8d093ca9ce2308528cbb0e746adf95998d15225b68d2a6` |
| `svelte-live-thermals.html` | 94752 | `a9a5a68908844182850749d517f1b0e9ed7bff13edb94e09b4c30566d000084a` |
| `svelte-live-heads.html` | 98464 | `7a6705204804584e0933c2d69d55f452793b395f5322cb5c9551f094384ae9f7` |
| `svelte-live-queue.html` | 90205 | `d599a1bc27bd1f7742e763cc5d7c14083be8ce35f276e2bf8c84ade2df5ca320` |
| `svelte-live-progress.html` | 82319 | `665741e20188c00bc227afe44e4a87997d99a311f150ebeb15981d28f2b09083` |
| `svelte-live-jobs.html` | 87951 | `7ba56d8d05fcdad0cfe69f3f85f5b0e9866157cdbfa1e59cb33e7a8cf29ed408` |
| `svelte-live-job_history.html` | 86160 | `c3d55c710de433681e6c90bb0ab1ad95e4d7b9044e287ccc1ca1581efa66951a` |
| `svelte-live-overview.html` | 96959 | `8044da761fe1d8b4cdcf2b7af2419b435e8236381c878e359da014bd8c7f3438` |
| `svelte-live-bed_mesh.html` | 648788 | `b6f09f2483082af836d7031c313c495b23dfb40a6d058083057dca198ea9054e` |
| `svelte-live-camera.html` | 100096 | `1bed20ce48f74c6ebc89d488e0eedb6be33a89095034d10d4cd1c00d60754e97` |

MCP observation hash `e8a1c78bc25d95c990f917a6a57f0f0cb60639a19e4b140875449a8f1c27d5d9`
and Camera hash `c983e7b0e4f7da8c7b913e6b45516df87fb1ca176fc157159bf8167fc42871b7`
are pinned in `mcp-widget-packages.test.ts`. Private Lab observation and Bed hashes
are renewed in `private-lab.test.ts` to
`22fb127482a3cce3ffb0fe8a3a45743007380d416e3c8a1ff6d72e85289e2029` and
`8703c2ceaa049b88edab0d64a623500970324d62e24b96ac722c3f164b5df49d`;
synthetic Camera remains `c6b49974a68dd3dbd228d3d1a2426efa8bbf99ffea5adaf3b19f74695b8cbc57`.
These author checks bind software/static/protocol contracts, not physical media,
actual ChatGPT/phone outcomes, deployment or independent whole-candidate approval.

## Independent fixed-widget browser matrix — first candidate findings

Validator `domain_review` copied the exact MCP observation resource
`e8a1c78bc25d95c990f917a6a57f0f0cb60639a19e4b140875449a8f1c27d5d9`
to a private read-only input and ran a private Playwright probe using
`bun --no-env-file --config=/dev/null`. The probe uses the actual self-contained
native resource, existing host fixture, actual source normalizers/projectors and
synthetic observations, with a task-owned loopback server on4182. No production
server, printer data, camera or UI-designer acceptance is involved.

The initial probe had two fixture/assertion errors: purifier fan fields must be
nested `{ speed }` objects, and `textContent` includes hidden structural footer
reserve text. The validator corrected the fixture and used visible `innerText`,
preserving the first attempt privately. Those probe errors are not product defects.

The corrected run covers all nine native observation views at390px and320px with
200% root text,18 cases total. Each exercised ready, failed Refresh, Retry,
unknown and age-stale; applicable domains also exercised unsupported, empty/
no-active, and Overview malformed-History isolation. It recorded no page errors
or document horizontal overflow. Failed acquisition hid the prior job/queue/
history identities; recovery worked. Sixteen cases finished all planned stages;
both Bed Mesh cases stopped at the unknown-state semantic finding below.

Blocking findings sent directly to the authors:

- Bed Mesh unknown state has a successful ready-phase observation, but the
  visible footer says `Could not load`. The correct unknown/no-active message
  reaches only a hidden announcement and the footer's accessible label because
  `Footer` hardcodes visible failure text. Unknown and observed no-active require
  truthful visible wording. Tests of aggregate `textContent` miss this defect.
- Job History390px ready-to-failure shell height grows17.1875px. The other17
  sampled ready-to-failure height differences are0; this is not full geometry
  acceptance because the History case fails and empty-state tails differ.
- Screenshot comparison with the UI reviewer's baseline shows overlapping Heads
  primary words in live Overview390px (`T2` and `Generic PETG`), fragmented color
  text, and overlapping ETA words in Progress320px/200% text. Document overflow
  checks cannot detect these interior glyph collisions. The synthetic fixed-word
  reserves must not overlap longer live content.
- Unsupported classification must be visually legible where it matters, not
  present only in hidden announcements or accessible labels.

Probe SHA-256 `0ba62825dc16480e2d69b5f5effbe8c8f743c2f8335ad1f367c3ce231b077f3c`;
result JSON `39d538d2cfb47481e6e4e137873934b6fbbd7c49b6cea758507f3afe80b0bdde`;
log `f3f38899fc61884c0b4df4cb013dc4438a160cba0ed3230a30ecab1a72d1413a`.
Private screenshots include every ready/error pair. The validator inspected the
History pair, Overview baseline/current pair and narrow enlarged Progress/Jobs.
The probe closes each owned context in `finally`, then browser and server; its
process completed. This candidate is not independently approved. Required source
fixes invalidate the affected packaged-resource evidence and require renewal.

Additional independent source-only stdin probes passed before this browser run:
all eight History statuses, epoch start time, null end time and zero duration
survive actual normalization/projection/adaptation; retained not-reported
materials quarantine only the Overview Heads tile; age-only stale Bed Mesh
remains readable while not-reported acquisition masks it. These targeted results
do not override the browser findings or grant exact candidate approval.

## Fixed observation implementation author evidence before visual corrections

Author: `live_lab_contract`. All nine MCP observation branches now consume the
fixed native Svelte roots; five additional native dashboard routes and packaged
entrypoints cover Progress, Current Job, Job History, Overview and Bed Mesh.
Existing Lab fixture wrappers remain private, with production-safe Panels sharing
their existing markup and style. Typed adapters preserve nullable source fields,
independent domain receipts, bounded history pages, source filename/material
privacy policy, and Overview's per-domain failure isolation. No printer reads or
controls, authentication changes or deployment were performed by this author.

The shared host integration derives the selected view independently from changing
input/result envelopes. This prevents same-view host replay from replacing a
controller while a child remains subscribed to an older controller. Failed reads
mask retained values and receipts; retry and cleanup use the existing controller
lifecycle. Failed `not_reported` receipts are distinct from ordinary age-stale
observations. History preserves page-local positions, all statuses and nullable
secondary fields; byte position never becomes print progress. Small positive
filament readings remain exact millimeters. No new DSL or composable behavior
was implemented.

Actual author checks from the app directory, using pinned Bun1.4.0 with
`--no-env-file --config=/dev/null`:

- `run ui:test src/lib/client/mcp/fixed-observations.test.ts src/lib/client/mcp/observation-host.test.ts src/lib/client/live/controller.test.ts src/lib/client/live/thermals-controller.test.ts src/lib/client/live/queue-controller.test.ts`: PASS51 after fixing the same-view controller replay issue; an earlier three-case refresh failure identified that issue.
- `run ui:test src/lib/client/live/focused-adapters.test.ts src/lib/client/mcp/fixed-observations.test.ts src/lib/client/live/controller.test.ts src/lib/client/live/heads-controller.test.ts src/lib/client/live/thermals-controller.test.ts src/lib/client/live/queue-controller.test.ts src/lib/client/live/bed-mesh-controller.test.ts src/lib/client/live/graph-contract.test.ts`: PASS113 in eight files.
- `run ui:test src/lib/client/mcp/fixed-observations.test.ts src/lib/client/observation/ObservationWidgets.test.ts src/lib/client/observation/ObservationLoading.test.ts`: PASS89 in three files after adding two visible small-filament checks. Counts overlap the preceding command and are not a unique-test total. An earlier display run exposed loading values carrying text; explicit undefined loading inputs fixed those privacy-guard failures.
- `x svelte-check --tsconfig ./tsconfig.json`: zero errors and warnings.
- `run scripts/check-components.ts` and root `git diff --check`: PASS.
- `run build:live-camera`, `run build:mcp-camera`, `run build:mcp-observation`, and each of `run build:live-fans`, `run build:live-thermals`, `run build:live-heads`, `run build:live-queue`, `run build:live-progress`, `run build:live-jobs`, `run build:live-job_history`, `run build:live-overview`, `run build:live-bed_mesh`: PASS. `run ui:build` also rebuilt private Lab packages successfully. Exact artifact bytes and hashes are recorded in the preceding contract-author table.
- `run build`: the initial Kit build correctly rejected missing explicit prerender entries for the five new native routes. After adding exactly those routes to `svelte.config.js`, the rerun passed and produced `build-kit/handler.js`. No crawler or shipping guard was weakened.

The pre-visual-correction production source/build-input fingerprint contained359
files: recursive `src` and `scripts` excluding test/spec sources plus package,
lockfile and Svelte/Vite/TypeScript configuration. The SHA-256 of sorted
`app-relative path + NUL + file SHA-256 + LF` records was
`cb5f1a4be3c5ef7f4498f9340b3eac839bfb0955d23e17997952e80e02088207`.
This is an author diagnostic identity on the worktree based on `7bcf999`, not an
exact shipping SHA or independent approval. The subsequent independent browser
review found visible text overlap, History failure geometry and hidden failure
classification issues; the affected source/package acceptance is superseded
pending the correction checks below. Camera bytes remain independently frozen.
No full candidate suite ran under this author; no fixture ports or task-owned
processes remain from these checks. Software/protocol evidence does not prove
physical media, ChatGPT device behavior or deployed-service acceptance.

## Fixed observation visual correction author tail

The independent browser review found actual glyph overlap in live Progress ETA
and Overview Heads strings despite zero horizontal page overflow. Live Progress
and Overview now omit the Lab-specific `LoadingValue.words` reservations; text
wraps naturally and loading still receives no telemetry. Overview receipt text
also wraps naturally while retaining separate domain timestamps/freshness.
Lab fixture word reservations are preserved. The History live row gives its
status/text column the available flex width, preventing narrow placeholder
columns from adding wrapped lines during failure; no hidden observed text or
cloned DOM is used to reserve geometry.

`Footer` adds an optional visibleMessage string while preserving its existing
message announcement and default visible phrase for unchanged consumers.
`Frame` visibly distinguishes Endpoint unsupported, Unavailable and Could not
load. Two actual-root tests check rendered footer text and visibility before
and after an endpoint-unsupported result followed by a failed retry. The Bed
Mesh author separately supplies bounded, visible domain-state messages through
this same additive prop.

Author commands after the visual correction:

- `bun --no-env-file --config=/dev/null run ui:test src/lib/client/mcp/fixed-observations.test.ts src/lib/client/observation/ObservationWidgets.test.ts src/lib/client/observation/ObservationLoading.test.ts src/lib/client/observation/ThermalsState.test.ts`: PASS92 in four files.
- After adding the two visible classification cases, `bun --no-env-file --config=/dev/null run ui:test src/lib/client/mcp/fixed-observations.test.ts`: PASS32; counts overlap the prior run.
- `bun --no-env-file --config=/dev/null x svelte-check --tsconfig ./tsconfig.json`: zero errors/warnings. `bun --no-env-file --config=/dev/null run scripts/check-components.ts` and `git diff --check`: PASS, including a second final guard/diff check after Bed's source tail.
- Each of the nine `build:live-*` observation scripts, `build:mcp-observation`, `ui:build` and `build` ran again and passed. Updated artifacts are recorded by the package-contract author; MCP observation is759736 bytes with SHA-256 `94f6ed3a993cb6601d6f705c6e69b1612629baa177a058009cdbbd60fefd0643`. All three Camera artifact hashes remain unchanged from the frozen identities above.

The updated359-file production source/build-input fingerprint, using the same
algorithm above, is
`abdf21eecf6fc3f5c55f241945172ffd19c15b0c96a35c777edf442b945edc26`.
This supersedes the earlier author fingerprint; it remains a precommit
diagnostic identity, not independent approval. Independent review is rerunning
the affected visual matrix on the new immutable MCP bundle.

The author also strengthens the existing MCP/dashboard browser tests to inspect
native visible timestamps instead of relying solely on now-absent legacy time
elements: capture ready clock strings, require real ready clocks in Progress and
Overview, and reject those strings/receipt text on failed cards. Overview's
failed History tile and whole-envelope failures explicitly reject rendered
observation clocks. Dashboard Bed Mesh failure checks retain exact canvas node
identity plus inert and aria-hidden masking. The existing renderer teardown test
covers disposal on unmount; its rerun belongs to the Bed author. These browser
test edits await the independent browser/full-regression owner; this author did
not run that expensive suite or reserve any fixture port.

## Final fixed-source freeze after retained failure reason correction

A Bed Mesh browser sequence revealed that retained display evidence could keep
an earlier receipt reason after a newer unsupported/not-reported acquisition.
The shared controller now publishes the latest validated acquisition's safe
`failureReason` separately from the retained display observation. Accepted and
explicit duplicate results update it; successful reads and RPC failure clear it.
This preserves the last canvas resource while allowing the Bed root to distinguish
Object not reported from Endpoint unsupported truthfully. It adds only internal
client state, with no external schema/tool or authorization change. Bed-specific
sequence and unmount evidence belongs to the Bed author.

The final source pass also removes Lab word reservations from live Jobs filename,
filament and duration values, completing the same natural-wrap correction for
these variable source strings. Lab fixture layout remains unchanged. The Bed
author restores the optional actual profile label using the existing composition;
absent profiles are omitted and failed observations mask the label.

Actual author checks after these changes:

- `bun --no-env-file --config=/dev/null run ui:test src/lib/client/live/controller.test.ts src/lib/client/live/heads-controller.test.ts src/lib/client/live/queue-controller.test.ts src/lib/client/live/thermals-controller.test.ts src/lib/client/mcp/fixed-observations.test.ts`: PASS71 in five files.
- `bun --no-env-file --config=/dev/null run ui:test src/lib/client/mcp/fixed-observations.test.ts src/lib/client/observation/ObservationWidgets.test.ts src/lib/client/observation/ObservationLoading.test.ts`: PASS91 in three files after the Jobs natural-wrap correction. The two commands overlap.
- All nine observation `build:live-*` scripts, `build:mcp-observation`, `ui:build` and `build` ran again successfully. The final Bed Panel source write preceded its focused, MCP, private and Kit compilation. `run scripts/check-components.ts`: PASS.

The final precommit359-file production source/build-input fingerprint is
`67ae86cea69ed61ab7261ac340e55107e8e4fbc34f180532c2b5f5036f5a575f`,
using the same algorithm above. Final MCP observation is760295 bytes, SHA-256
`7bb29016d9188a932bb3fcd35782393e0086a6347b31a59ddc1377eb9721cf8f`.
The final nine focused and private package identities are maintained in the
contract-author tail. Camera artifacts remain unchanged. This supersedes prior
author source/package fingerprints and is submitted for independent final
binding; no full regression, exact-SHA approval, deployment or device acceptance
is claimed by this author. All author build/test processes completed without
owned fixture ports.

Final frozen-source `bun --no-env-file --config=/dev/null x svelte-check --tsconfig ./tsconfig.json`
completed with zero errors/warnings, and root `git diff --check` passed after the
last package-pin edits. These renew the focused static check on the final source.


## Bed visible-state correction and renewed artifact contracts

Independent real-browser review of the earlier MCP package found successful
unknown/no-active Bed states displaying the Footer's fixed visible “Could not
load” phrase. The previous component assertions included hidden live-announcement
text, so they did not establish the visible result. Bed now supplies the additive
Footer visible label: Not observed, No active mesh, Endpoint unsupported, Object
not reported, or Unavailable. The full domain message remains the accessible
notice. An age-stale no-active result also keeps its visible Stale receipt.

A new actual-package browser regression then found that an unavailable result
following a retained successful mesh kept the old receipt reason. The shared
controller author added separate latest accepted failureReason metadata; Bed
reads it while the old mesh resource remains retained and inert. An endpoint
unsupported result followed by not_reported now changes the visible classification
without reviving the retained matrix. RPC failures remain acquisition failures.

The optional validated server-reported profile is restored in the existing Bed
kicker, explicitly labelled Profile. Missing profiles are omitted; loading/error
values contain no profile text. The existing kicker participates in generic
StateSurface geometry allocation via data-record, and long safe profile strings
wrap within its width. No new raw element or common geometry mechanism was added.
The Lab anatomy assertion now includes its explicit fixture profile and separate
Lab attribution; production bundles still reject the Lab fixture marker.

Changed Bed paths: components/bed-mesh/BedMeshPanel.svelte,
components/live/LiveBedMeshRoot.svelte, lib/client/live/bed-mesh-controller.test.ts,
lib/client/bed-mesh/BedMeshWidget.test.ts, and the new
`tests/browser/mcp/bed-mesh-states.spec.ts` under the application. Shared Footer
and controller changes and all regeneration remained with the architect.

Actual author commands below ran from `plugins/u1-print-studio/app`, with
`/Users/scottchu/.asdf/installs/bun/1.4.0/bin/bun --no-env-file --config=/dev/null`
as the executable/prefix:

- `run ui:test src/lib/client/live/bed-mesh-controller.test.ts src/lib/client/live/bed-mesh-adapter.test.ts src/lib/client/bed-mesh/renderers.test.ts src/lib/client/bed-mesh/BedMeshState.test.ts src/lib/client/bed-mesh/BedMeshWidget.test.ts src/lib/client/bed-mesh/retry-focus.test.ts`: final PASS43 in six files. This includes exact accepted ranges, independent freshness, failure reason transitions, no invented surface, profile masking, actual 2D retained canvas identity and guarded focus recovery. The existing real BedMesh3D lifecycle test (only WebGLRenderer mocked) checks replacement/final geometry disposal, renderer disposal/context loss and canvas removal on unmount. An intermediate run passed42/43 because the old Lab text assertion lacked the newly displayed profile; after the explicit profile label/anatomy update the same command passed43/43.
- `x playwright test --config playwright.mcp.config.ts tests/browser/mcp/bed-mesh-states.spec.ts`: final PASS2 against MCP observation `7bb29016…`, at390 px/100% root text and320 px/200% root text. It reads actual visible innerText for unknown, no-active, stale no-active, unsupported endpoint, object not reported, and retained not-reported states. It also proves a76-character profile is visible then removed from error text; shell/header/body/footer/chart bounds remain exactly equal across ready→failed refresh; keyboard Retry returns owned focus to selected2D mode; retained failures are inert; no page overflow or page errors occurred. An earlier run on `94f6ed3a…` failed both configurations at the newly exposed retained-reason transition; those failures are superseded by the final passing run after the shared metadata correction.
- `test tests/server/live-fans-package.test.ts tests/server/mcp-widget-packages.test.ts tests/server/private-lab.test.ts`: PASS19,218 assertions. Pins were recalculated from actual regenerated bytes using `uv run python`; all nine native observation artifacts and MCP/private observation/Bed packages were renewed. No guard, size cap, skip flag or shipping mechanism was weakened.
- Root `git diff --check`: PASS after the source/test correction and again after the final pin/evidence append.

The native artifact measurements below supersede the earlier package table.
They are integrity measurements, not byte budgets or an independent shipping
approval. The10-artifact sum including native Camera is1,477,617 bytes.

| Native package | Bytes | SHA-256 |
| --- | ---: | --- |
| fans | 88864 | `045406518f2ef1c2e23bbb2e954c34c4c179d06f6c5649a350dfd9cc9f3f528b` |
| thermals | 94932 | `330896db8327d766052f66f3daf3fb4a00022beec9b4ac5cfd0ce4f27e9d1658` |
| heads | 98644 | `b74e1cb8b9750dcb47cfb901cd0da673036ec4e34b2fe233f3329658857afc05` |
| queue | 90384 | `a1858663df6f97200d956bc146d591f04f205669d14d2b7692fc0545e5e8b5e5` |
| progress | 82836 | `ca69683341d4136aeb51cbe66deed1c2a67a914b52c5f77be09fe4ae2cd7e1c2` |
| jobs | 88467 | `231cc23eab6a74714b6df87e92438d89796ad2b5e43958d379177e67a0c0578a` |
| job_history | 86801 | `ef389c65d0fe150352913b6d95bd7d7dc219eaebaef258330f5743c1b188cc1a` |
| overview | 96900 | `7cb0ad15f8d476833730a0c3d0ccbbd95c434e8bf69e67a44e414bb8c69cb5b8` |
| bed_mesh | 649693 | `fa8c7282b1cfdfd3762112039a2109846407d100aaaafe648fa6cda4ff2be69b` |
| camera | 100096 | `1bed20ce48f74c6ebc89d488e0eedb6be33a89095034d10d4cd1c00d60754e97` |

| Other package | Bytes | SHA-256 |
| --- | ---: | --- |
| mcp-observation | 760295 | `7bb29016d9188a932bb3fcd35782393e0086a6347b31a59ddc1377eb9721cf8f` |
| mcp-camera | 100154 | `c983e7b0e4f7da8c7b913e6b45516df87fb1ca176fc157159bf8167fc42871b7` |
| svelte-observation-lab | 172285 | `9f2ad0a23bb364c34958a96f26469dbf98262b73d1a089af5de68da91e73921a` |
| svelte-bed-mesh-lab | 639188 | `058453ca77c234c924ad76d98377d6882328d93212262b2c3755d5676b3c3d11` |
| svelte-camera-lab | 83798 | `c6b49974a68dd3dbd228d3d1a2426efa8bbf99ffea5adaf3b19f74695b8cbc57` |

All three Camera artifact hashes remain identical to the previously frozen
Camera candidates. This author did not run the full suite, rebuild packages,
operate printers, or deploy services. Fixture port4182 was exclusively coordinated
with the independent reviewer and released by Playwright teardown; no author
browser or server remains. The independent reviewer owns final matrix/full
regression and exact candidate acceptance. Synthetic browser/software evidence
does not prove real media, the user's phone crash cause, or actual-device repair.


### Independent reviewer final-matrix attempt on 7bb29016 (not accepted)

The independent domain/source reviewer ran the complete synthetic nine-view
matrix against an immutable copy of MCP observation SHA-256
`7bb29016d9188a932bb3fcd35782393e0086a6347b31a59ddc1377eb9721cf8f`.
Actual command from repository root: `bun --no-env-file --config=/dev/null
 tmp/domain-widget-review-20260911/final-matrix.ts` (single command, continued
here only for readability). The script was derived from the previously recorded
reviewer matrix, bound to the new hash, with optional reported Bed profile,
unsupported-to-not_reported, and accepted large finite Current Job values added.
It uses real source normalizers/projector, synthetic tool results, the actual
MCP iframe package, and Chrome on an exclusively owned loopback fixture at4184.
The320px configuration doubles every element's pre-existing computed font-size
inside the widget shell, including fixed-pixel text. This is stronger than the
prior root-font-only enlargement. The390px configuration retains normal text.

All18 configurations completed their applicable ready/error/Retry, unknown,
age-stale, unsupported, empty, partial Overview isolation, latest Bed reason,
and Current Job stress checks. All18 ready/error shell height deltas were zero;
page errors were zero. Reported profile text was visible when ready and absent
when failed. Process/browser/context/server teardown completed and4184 was free.
These programmatic results do not establish visual acceptance: independent
inspection of all nine enlarged ready screenshots found three blockers:
Progress42% is clipped by the right shell edge; an accepted large filament
number in Current Job is clipped; Bed summary labels and adjacent numeric
values collide at actual200% text. Overview, Thermals, Heads, Fans, Queue and
History enlarged screenshots showed no comparable glyph collision. The three
findings were sent to their respective source authors. Full expensive browser
regression and exact candidate approval remain pending the corrections.

Privacy-safe local review artifacts remain uncommitted. SHA-256 identities:

| Artifact | SHA-256 |
| --- | --- |
| final-matrix.ts | `08a1fdc07e62b219251df6ab00d0c97fa1025831f641030af26abab14942cfe6` |
| final-matrix.json | `49bd9ec7dff8146deab118651c4e46f1826e33e8fe9f17fb6553128f5b40c5b6` |
| final-matrix.log | `629cd528aa95e6c8719a7ef2d7b41fc577a20a742f742b4ce8f47b63cd6b04f8` |
| final-progress-320-2x-ready.png | `dce3c57bcfd9958501ad87ca62bfea3eeff43786ada6e17bec23d3ccfe6f85bc` |
| final-jobs-320-2x-stress.png | `8eb782790694817e4960aad4169a483f011ac9eb0ffd9b2be15288b0c928a260` |
| final-bed_mesh-320-2x-ready.png | `1e6a6ec8194be265e70cc26df2c3d44b6f23d0d30fd3d6ce5b52e85da321e33c` |

This is independent source/protocol/browser validation, not UI-designer signoff,
real-printer observation, an actual iPhone reproduction, or physical approval.
The unchanged Camera package retains its earlier independently bound210-second
synthetic decode soak; no repeated Camera soak was needed for these changes.


### Independent closed source-field parity audit

The independent reviewer read all nine live adapters, their shared validation
and controller helpers, the actual observation projector, and the status,
Moonraker jobs/history, queue, environment, materials and Bed normalizers.
This is a source-contract audit of the delivered read-only producers; it is not
an assertion about arbitrary Moonraker/Klipper versions or physical telemetry.
The audited field groups and source boundaries are:

| View | Source fields, units and uncertainty preserved | Constraint result |
| --- | --- | --- |
| Progress | Status state; percent0–100; independent current/total layer; elapsed and derived remaining seconds; nullable field evidence; status basename with punctuation accepted but not rendered in this card | Focused adapter no longer borrows Lab1M layer cap; numeric fields remain finite/nonnegative. Percent, layers and estimate are not converted into one another. |
| Current Job | printState, safe filename, storageActive, filePositionBytes/fileSizeBytes, total/print duration seconds, filamentUsedMillimeters; reported/value distinguishes missing, explicit null and zero | Source filename privacy boundary mirrored. Source emits numeric values≤MAX_SAFE and integer file bytes; client accepts a wider finite nonnegative numeric domain. This permissiveness causes no rejection or loss of producer-accepted data and is recorded as a validation limitation, not a new source capability. |
| History | Ordered positions1–20, safe filename, all8statuses including unknown/in_progress, nullable start/end timestamps, print/total duration seconds and filament mm, pageCount matching returned items | Page count is returned-page count. Neutral unknown/in-progress display avoids claiming completion. Numeric client upper bound is wider than source≤MAX_SAFE, similarly recorded as a validation limitation. |
| Queue | Four queue states ready/loading/starting/paused, total≤1000, visible first100, truncated flag, source-safe filename, nullable nonnegative timeAdded and wait-at-observation seconds | Source bounds match. Paused is explicitly queue state; no print pause inference. Zero and empty remain observed facts. |
| Thermals | Four tool channels plus bed and cavity; actual/target/active/heater-state evidence independent; finite tool/bed degrees, cavity−273.15…999°C; own environment receipt | Source bounds match. Target0 is displayed as a target; no cold/health verdict. Missing cavity target remains absent. |
| Heads | Physical identities1–4, nullable active/state/actual/target; vendor/type/subtype≤64 each, joined material≤194, normalized6/8-digit color, nullable reportedPresence; own material receipt | Source character/privacy/color forms and lengths match. Configured material/color do not create active state; reportedPresence remains independent. |
| Fans | Seven fixed channels, reported speed fraction0–1→percent, reported nullable RPM0–1M, purifier power evidence and four normalized modes | Source bounds match. Reported fan count is not an active count; commanded speed/RPM do not establish health. |
| Bed Mesh | Exact reported probed matrix2–64 per axis, cells/bounds±1M, ascending bounds, summary min/max/range matching cells, optional safe profile≤80; active/no_active_mesh/unknown/unsupported/unavailable distinct | Source bounds match. Range up to2M is mathematical span, not a pass/fail result. Profile is labelled, optional, and masked on acquisition failure. Latest failureReason does not borrow the retained mesh reason. |
| Overview | Eight fixed tiles with each source receipt: Progress state/percent/layers/ETA; active tool/bed/cavity temperatures; head/material/color/presence; Current Job state/storage; History page/status counts; Queue state/count; Fans reported count/purifier; Bed active/grid/range | All duplicated bounds match source except the final two identified remnants: Progress tile layer1M cap and ETA MAX_SAFE cap. Both were sent together to the author for source-aligned correction before final binding. Thermal finite/cavity bounds, material194, History20, Queue1000, Fans7 and Bed64/±1M/range2M checked as a closed set. |

The final two remnants were reproduced with fresh stdin Bun invocations importing
focusedSnapshot, createObservationPresentation and adaptOverview from their
actual source paths: source currentLayer2000000/totalLayers3000000 projected a
known42% tile but the client quarantined it; source remainingSeconds1e30 likewise
became an unavailable tile despite being finite. These were software synthetic
counterexamples, not observations of a printer or a plausible time estimate.

Shared receipt handling was also reviewed: an independent domain's fresh receipt
survives unrelated outer status offline; failed retained not_reported receipts
are masked; age-only stale remains visible; Overview quarantines only its failed
tile; full acquisition failure masks all retained values and clocks. The Footer
visibleMessage prop is additive with its prior default unchanged. Production
Panels own extracted existing DOM/CSS, while original Widget components remain
Lab wrappers; build guards retain fixture/server/Camera exclusion and specifically
allow the real Bed renderer only in the Bed package. No shipping skip/guard
weakening was found in the inspected diff.

On candidate MCP `ccc991042633506e76fe4780b5659685a390ff6ff56865d78b2d3968deab8f4b`,
independent `bun --no-env-file --config=/dev/null x playwright test --config
playwright.mcp.config.ts tests/browser/mcp/fixed-text-bounds.spec.ts
tests/browser/mcp/bed-mesh-states.spec.ts --workers=1` ran from the app: PASS6.
The reviewer also reran six independent matrix configurations (three affected
panels×390 normal/320 actual computed200%) and inspected the three enlarged
glyph screenshots: Progress percentage, extreme Current Job filament and Bed
summary now fit and remain readable. Five geometry deltas were zero; normal
Progress was1px. A normal Progress screenshot initially captured the fixture's
initial150px iframe before its asynchronous size message; polling the owned
iframe height and recapturing showed the full card. That capture race is not
claimed as a product crash. No page errors occurred. Final Overview numeric
correction, package identities and whole-suite evidence are still pending here.


## Bed text-scaling correction and current record handoff

The independent review subsequently doubled actual computed text, including
fixed-pixel text. Its320 px Bed screenshot showed Minimum/Maximum/Range labels
and numbers colliding in the fixed three-column summary. Earlier root-text-only
browser checks did not cover this failure. The summary now fits columns using
an intrinsic font-relative9ch minimum; labels, exact values and mm units remain
unchanged, with no sample-data reserve or hidden telemetry. The maintained Bed
browser case now uses the shared synthetic text-only scaling helper that doubles
px/rem text, checks actual glyph Range bounds within each summary cell, and
retains ready/error geometry plus guarded2D keyboard focus checks. The independent
reviewer owns execution of this updated browser case and the complete browser
regression; this author did not duplicate those runs.

A bounded producer/client parity check confirms64×64 grids, ±1,000,000 bounds and
cells, a2,000,000 height span and80 Unicode profile code points remain accepted.
It found one optional-profile mapping defect: the server checked raw dot/dotdot
before trimming, so a padded dot label could become an invalid canonical client
label and suppress an otherwise valid mesh. Under the coordinator's bounded
assignment, the server now trims before label validation. Empty, dot, dotdot and
other unsafe optional labels are omitted while the valid grid survives; the
client's unsafe-profile guard remains unchanged. This also preserves the exact
no-active sentinel rather than inventing a mesh/profile identity.

Actual additional author commands from repository root, using
`/Users/scottchu/.asdf/installs/bun/1.4.0/bin/bun --no-env-file --config=/dev/null`:

- `run --cwd plugins/u1-print-studio/app ui:test src/lib/client/live/bed-mesh-controller.test.ts src/lib/client/bed-mesh/BedMeshWidget.test.ts src/lib/client/bed-mesh/BedMeshState.test.ts`: PASS20 after the summary CSS change.
- `run --cwd plugins/u1-print-studio/app ui:test src/lib/client/live/bed-mesh-adapter.test.ts`: final PASS17 after the producer canonicalization fix. This includes four invalid optional-label producer→adapter cases and a valid80-code-point astral Unicode profile with a2,000,000 mesh range; the prior13-case run predates the optional-label fix.
- `test plugins/u1-print-studio/app/tests/server/bed-mesh.test.ts`: PASS12,141 assertions, including bounded normalization, isolated synthetic HTTP acquisition, independent cache receipts and selected-view MCP/HTTP composition. Its ephemeral fixtures were released.
- The intermediate `ccc99104…` artifact pins were renewed with `uv run python`, and `test tests/server/live-fans-package.test.ts tests/server/mcp-widget-packages.test.ts tests/server/private-lab.test.ts` from root passed19/218 assertions. Subsequent architect-owned range-parity corrections require the final pin renewal below; this intermediate pass is not final-candidate acceptance.

The four current status tops in PROJECT_STATE, NEXT_AGENT and the active
iteration's HANDOFF/VALIDATION now point here. They distinguish authored/frozen
candidate work from pending independent review, full required regression and
guarded shipment. Existing55 delivery IDs, feature gaps, C08 and unaccepted
actual-device behavior remain unchanged; no release completion is claimed.
During the initial documentation-only pass, a `uv run python` inventory of560
application/configuration/test/artifact inputs and the required repository gate
matched its pre-edit SHA-256 identity, and current relative links/evidence anchors
validated. The subsequent explicitly assigned source corrections above supersede
that initial documentation-only identity; final candidate binding belongs to the
independent reviewer and unchanged shipping gates.

## Strict text-scaling and final duplicated-range corrections — author

The independent computed200% screenshots superseded the earlier freeze: the
Progress percent children escaped their flex parent's measured width, and a long
Jobs filament value escaped its metric column. Progress's live header now uses
font-relative auto-fit grid columns so its status and percent stack when their
actual text needs more room. The percent group and layer-detail groups can wrap
inside their allocated width. Jobs live metrics allow long exact numeric strings
to wrap within the grid column. No font-size reduction, truncation, hidden sample
text or value rounding was introduced. Lab-specific header layout is unchanged.
Bed Mesh's corresponding font-relative summary correction is recorded by its
author above.

`tests/browser/mcp/fixed-text-bounds.spec.ts` adds four actual-package cases using
the maintained `doubleSyntheticText` helper, real source projections, long safe
filenames and maximum-safe-integer filament usage. Text-node Range rectangles,
including percent/unit glyphs, must stay within the card body. The independent
browser owner ran the six focused Progress/Jobs/Bed cases on candidate `ccc991…`
and inspected the corrected screenshots; those results belong to its evidence.
An initial compiler invocation caught this new test passing a Locator to the
Page/Frame helper. Passing the actual widget Frame fixed that test typing error;
the final compiler check below passes.

The requested closed source-range pass checked the four focused adapters and all
Overview projections against current producers. It found two remaining copied
Overview bounds: a one-million layer limit and the default maximum-safe-integer
ETA limit. Overview now accepts the same safe-integer layer range as focused
Progress and the same nonnegative finite ETA range. Both Progress adapters also
remove an invented current-layer <= total-layers relationship, preserving the
independently reported source fields. Paired producer-to-adapter tests cover
2,000,000/3,000,000 layers, an inverted independent pair and a finite1e30 ETA.
The review also confirmed source-specific temperature/material/count/grid bounds;
Jobs/History clients retain their pre-existing broader nonnegative numeric
acceptance without expanding this patch's scope. Bed's optional-profile source
canonicalization and adversarial Unicode/profile tests are recorded separately.

Actual author commands for this final correction:

- `bun --no-env-file --config=/dev/null run ui:test src/lib/client/mcp/fixed-observations.test.ts src/lib/client/observation/ObservationWidgets.test.ts src/lib/client/observation/ObservationLoading.test.ts`: PASS91 after the strict layout fixes.
- `bun --no-env-file --config=/dev/null run ui:test src/lib/client/live/focused-adapters.test.ts src/lib/client/mcp/fixed-observations.test.ts`: PASS44 after the duplicated-range and independent-layer fixes. Counts overlap prior commands.
- The strict CSS round ran `build:live-progress`, `build:live-jobs`, `build:live-bed_mesh`, `build:mcp-observation`, `ui:build` and `build`: PASS. After closing every known audit correction, one final round ran `build:live-progress`, `build:live-overview`, `build:mcp-observation` and `build:server`: PASS. The integrated server build includes Kit and the Bed producer correction, emitting100 files,114 static routes and100 runtime hashes.
- Final `bun --no-env-file --config=/dev/null x svelte-check --tsconfig ./tsconfig.json`: zero errors/warnings. `run scripts/check-components.ts` and root `git diff --check`: PASS.

Final author production source/build-input fingerprint (same359-file algorithm):
`ceed08f04901b3e5b77db7c8e7cd3005c79262d4dae4e6aeee8ec9bc12b1c3dd`.
MCP observation is760877 bytes, SHA-256
`1a6c3c727a6d02cae654a0876f3f1fb73add9df08b8ee6c477d4ebee92310b18`.
The integrated local server build-manifest SHA-256 is
`a97a6cb249391a5e056fd70d8c1fcc1d11f77d21598ee28e8da7655fe39c1f58`;
it identifies this author build, not an exact shipping build/review SHA.
Final package pins and table follow under the contract author's ownership.
Earlier author source/package fingerprints are superseded. Camera bytes remain
unchanged. The independent owner receives these exact inputs for final browser,
source and required release validation. This author ran no full suite, deployed
service, physical-printer or actual-device validation and holds no fixture ports
or running task processes.


### Final pin renewal after all known corrections

The contract author recalculated the final Progress/Overview/MCP pins from the
architect's final generated bytes, retaining the other matching pins.
From repository root,
`/Users/scottchu/.asdf/installs/bun/1.4.0/bin/bun --no-env-file --config=/dev/null test plugins/u1-print-studio/app/tests/server/live-fans-package.test.ts plugins/u1-print-studio/app/tests/server/mcp-widget-packages.test.ts plugins/u1-print-studio/app/tests/server/private-lab.test.ts`
passed19 tests/218 assertions. A `uv run python` check also confirmed all three
Camera hashes unchanged and valid current-top links/evidence anchors. Final
`git diff --check` passed. No browser suite or build was run by this author in
this final renewal; the independent reviewer owns affected browser/full checks.

These final artifact measurements supersede previous author pin tables. The10
native artifacts total1,478,200 bytes; measurements are not size caps. The four
current status tops point to this correction section and state authored/frozen,
with final independent review, full required regression and guarded shipment
pending. No author implementation remains pending unless review finds an issue.

| Final artifact | Bytes | SHA-256 |
| --- | ---: | --- |
| svelte-live-fans | 88864 | `045406518f2ef1c2e23bbb2e954c34c4c179d06f6c5649a350dfd9cc9f3f528b` |
| svelte-live-thermals | 94932 | `330896db8327d766052f66f3daf3fb4a00022beec9b4ac5cfd0ce4f27e9d1658` |
| svelte-live-heads | 98644 | `b74e1cb8b9750dcb47cfb901cd0da673036ec4e34b2fe233f3329658857afc05` |
| svelte-live-queue | 90384 | `a1858663df6f97200d956bc146d591f04f205669d14d2b7692fc0545e5e8b5e5` |
| svelte-live-progress | 83191 | `3336bec42d7dad7060ab83301df7709efb398e3f8d86c85f75267857ced895f5` |
| svelte-live-jobs | 88644 | `a2a39f8628e40394b7c1d99d214783c6f8d11a18ec67119c6585e3bba2398b5a` |
| svelte-live-job_history | 86801 | `ef389c65d0fe150352913b6d95bd7d7dc219eaebaef258330f5743c1b188cc1a` |
| svelte-live-overview | 96932 | `ead65b392a9820c9efee6213225c8fa25dedebe21b0433da474594457bef9ced` |
| svelte-live-bed_mesh | 649712 | `534654f64decf5b1c6cef4bd25e81428fe30630e7c3c3a417ea9f7da91a05d16` |
| svelte-live-camera | 100096 | `1bed20ce48f74c6ebc89d488e0eedb6be33a89095034d10d4cd1c00d60754e97` |
| mcp-observation | 760877 | `1a6c3c727a6d02cae654a0876f3f1fb73add9df08b8ee6c477d4ebee92310b18` |
| mcp-camera | 100154 | `c983e7b0e4f7da8c7b913e6b45516df87fb1ca176fc157159bf8167fc42871b7` |
| svelte-observation-lab | 172936 | `019118d2e002763acd9c4c5dc03fd57c0f35329fd1017e4fbe5f09173ed8da47` |
| svelte-bed-mesh-lab | 639207 | `0915e02d7ba74ced59b89269e67b745460ff15f9f8da138bbaf1955cabcf5520` |
| svelte-camera-lab | 83798 | `c6b49974a68dd3dbd228d3d1a2426efa8bbf99ffea5adaf3b19f74695b8cbc57` |


### Independent final source closure and eighteen-case package matrix

The closed audit's remaining Overview layer/ETA restrictions were corrected.
Progress and Overview also preserve temporarily disagreeing current/total layer
fields independently rather than rejecting the entire observation. The optional
Bed profile is normalized after trimming; unusable labels are omitted while the
valid measured matrix remains available. A fresh reviewer stdin Bun probe using
the actual source projector/adapters passed3M/2M independent layers, finite1e30
ETA, and four invalid optional Bed labels with an observed all-zero active grid.
No source-semantic blocker remains from the bounded audit. Wider numeric client
validation already disclosed above remains a limit; no new source capability,
printer read/control or hardware claim is implied.

The independent reviewer then ran `bun --no-env-file --config=/dev/null
tmp/domain-widget-review-20260911/accepted-matrix.ts` from repository root
against immutable MCP observation760877 bytes, SHA-256
`1a6c3c727a6d02cae654a0876f3f1fb73add9df08b8ee6c477d4ebee92310b18`.
All18 configurations passed the full applicable state matrix described above,
with zero page errors and no visible failed-state profile/filename leakage.
Seventeen ready/error shell-height differences were0px; normal Progress was1px.
The nine320px screenshots use actual computed text doubled per element, and
all nine390px screenshots use normal text. Final Progress, Current Job stress,
Bed and Overview enlarged glyph screenshots were inspected against the earlier
reported collisions: those blockers are closed. The remaining six views retain
the previously inspected readable layout. Iframe height is now synchronized
before capture. All owned browsers, contexts and fixture4184 were released.

| Final local review artifact | SHA-256 |
| --- | --- |
| accepted-matrix.ts | `763cfa91a75f8cbcae19ef4fdbddf6a015ffb36bad672e1c9999590c566807ca` |
| accepted-matrix.json | `1aa9cac71897533c0642fcfb9439f49d6d8e900bc94497e2d33fe11dc8bf001f` |
| accepted-matrix.log | `846e58d359d844f9c658193db342983416718f71addd31a22daedb5f1292b3ea` |
| accepted-progress-320-2x-ready.png | `f7bfb68dc06b96a428931f62fc25dcc3e9bd33234cdc41504535a2a5f2ca8376` |
| accepted-jobs-320-2x-stress.png | `aeb89ea59463123bb8f0f449c45766ea6cd268ebad4bbf1c06b156b2709fb74b` |
| accepted-bed_mesh-320-2x-ready.png | `a4ee10ff32b83b3a52b44dd64087893a11d934fecc0158ed299b654418f67373` |

These filenames identify local reviewer artifacts, not release approval. Exact
committed-head binding, the complete affected browser suites and all unchanged
mandatory shipping gates remain pending at this paragraph. This is synthetic
software/browser evidence, not actual iPhone repair acceptance or real media.


### Independent frozen-head full-browser attempt: bbee9bd, blocked

The reviewer bound the affected browser regression to committed application head
`bbee9bd12022e9a56267b0576bc7ff4269958507`. The original Playwright inventories
were read with `bun --no-env-file --config=/dev/null x playwright test --list`
and the same command with `--config playwright.mcp.config.ts --list`:361 visual
tests in30 files and61 MCP tests in8 files. All103 files below the original tests
directory were recorded before execution; canonical inventory SHA-256
`af5225ca779f734f278d52bf4b24586d0913ac191ec79bce791349f3e2a2928b`.

An unrelated user CAD playground already owned4179 and was preserved. The
reviewer made a temporary same-depth full tests copy and visual config using
4197, original fixture4181, and workers1. Exactly five request-origin guard
literals in bed-mesh-legend, fans-state, live-heads, percentage-background and
thermals-state changed from4179 to4197; their same-origin rejection assertions
were preserved. The only config differences were testDir, outputDir and the
private fixture's port/baseURL. reuseExistingServer:false remained unchanged.
An initial driver preflight expected four literals and stopped before any build
or test; inspecting the complete inventory found the fifth existing guard in
live-heads. The driver then asserted the exact five filenames/counts. No original
test or application file was modified by this allocation.

Actual wrapper invocation from repository root was `uv run --no-project python
tmp/domain-widget-review-20260911/run-full-browser.py
bbee9bd12022e9a56267b0576bc7ff4269958507`. The wrapper executed the following
from the app using pinned Bun1.4.0 with `--no-env-file --config=/dev/null`:

- `run build`: PASS,6.006s.
- `run scripts/build-state-harness.ts`: PASS,6.633s.
- `run scripts/build-camera-harness.ts`: PASS,1.415s.
- `x playwright test --config .review-playwright.config.ts --workers=1`: deliberately stopped by graceful SIGINT of the owned Playwright process after the repeated wrong-fixture failures were diagnosed; exit130 after251.023s. Final report:60 passed,18 failed,1 interrupted,282 did not run. This is not a complete visual-suite pass.
- After owned visual teardown, the reviewer separately ran original `x playwright test --config playwright.mcp.config.ts --workers=1`:53 passed,8 failed in1.9min. All61 MCP cases ran.

The closed actionable set from this attempt is:

1. Twelve Bed visual failures are real initial loading/error→ready geometry changes: six bed-error-state cases at line67 and six bed-mesh-legend cases at line108. Shell height differs18.1875px at narrow normal text and36.390625px with enlarged text. Existing≤1px requirements remain; the added optional Profile kicker is under author diagnosis.
2. Six completed composable visual failures (and one interrupted case) came from the existing aggregate visual config aiming `/dashboard/lab/composition` at the static private-Lab fixture, which responds404. The maintained dedicated immutable composable preview/config is the required target; generic Kit returning200 is not an acceptable replacement under the requirements. The author must route the preserved tests through that dedicated fixture, not remove them.
3. Six MCP dashboard cases failed because the MCP fixture serves the dashboard host but omits the newly requested native `*_widget` routes. Trace evidence shows404 for those assets. Production dashboardPage already has those mappings. The fixture must exercise those actual packaged routes while retaining its host/tool-call assertions.
4. MCP presentation-layout at1024px/normal text reports a22px Progress ready→error height difference at line82. The author must distinguish an early measurement race from an actual layout allocation defect and preserve the geometry requirement.
5. The Thermals hostile isError-with-retained-DTO test expects visible `Could not load Thermals`; the existing Footer intentionally displays `Could not load` with the complete domain message in aria-label/title. The test should assert both real visible and accessible contracts without changing the product's established compact wording or losing its retained-DTO rejection assertion.

The reviewer released4197/4181/4182 and removed only the owned temporary test
copy/config in finally. The full original test inventory remained byte-identical;
HEAD remained bbee9bd. All failure traces/screenshots were copied into private
review storage before author reruns could overwrite them. Source/package edit
lock was released only after both collection phases ended. No release approval,
shipping execution or deployed/real-printer acceptance is granted by this attempt.
Camera source/packages remained unchanged and its prior synthetic210-second
proof remains bound to their hashes, independent of these failed gates.

| Private review artifact | SHA-256 |
| --- | --- |
| full-browser.json | `40351d821f6a6fbb73352a2eef414386d8c6a6e25d5a9a760963c08d08bfbee5` |
| full-browser.log | `39010b0456abdfd00dcbcb9a20fa9d59febcf294a4f1486ae292c71c1c81e7ea` |
| full-mcp-bbee9bd.log | `4d04193a3da57b463ce69e70172a285cb344b19d83c1d3983719b0c9d533305c` |
| run-full-browser.py | `017b4c20187f5f58ca542dbe1bb22dc5d0857c444f13787b5a207874f19b178c` |
| original-visual-inventory.txt | `5a23e8598404926cc9de03adcaee086a0b40ca202dd5ab48f0dde4fa42a54fed` |
| original-mcp-inventory.txt | `c7e3e47b0dddbfedb6809001626ffa5f17f7ba32b6049f19da0862b1d8036d7f` |
| bbee9bd-failure-artifact-manifest.json (137 artifacts) | `0c3ae6832871933b1b4f4007ab59c695e4a36233c0307cdf9019d34c897fe8d1` |


## Bed initial geometry and profile viewport correction

The frozen-candidate visual regression found a shared cause in Bed initial
failure/retry and legend geometry tests: the optional profile appeared only on
ready, adding one caption line after an initial loading/error state. Ready-to-
retained-error geometry and renderer/focus tests did not exercise that missing
initial structure. The author made no source/package edits while that regression
held its edit lock; the coordinator released the lock for this bounded repair.

The grid/dimensions caption and Lab attribution retain their original grouping.
The profile now occupies a permanent generic TextViewport slot, at least44px or
one line of text, whichever is larger. Ready values contain the exact full
validated profile with a Profile label. Long values scroll horizontally without
ellipsis, with a directional cue, native touch scrolling, and keyboard access
only when actual content overflows. Arrow keys/Home/End scroll that region;
Tab remains untrapped. Absent profiles leave a blank inert/aria-hidden slot;
initial/loading/error uses only a generic skeleton. Retained failure removes the
actual value and its accessible metadata rather than keeping private text as a
layout reserve. Resize observation recalculates overflow and is disconnected on
unmount. No whole-card clipping, sample profile reserve or synthetic identity was
introduced.

One local, documented Svelte a11y_no_noninteractive_tabindex annotation explains
why an overflowing read-only region must support keyboard scrolling; runtime
focus is removed when content fits. No global checker or shipping guard was
weakened and no false button/textbox role was used. The first integrated type
check rejected aria-description in the pinned Svelte HTML props; the final
implementation uses supported aria-describedby pointing only to static public
scrolling instructions. No dependency was changed.

Actual author validation from repository root:

`/Users/scottchu/.asdf/installs/bun/1.4.0/bin/bun --no-env-file --config=/dev/null run --cwd plugins/u1-print-studio/app ui:test src/lib/client/common/TextViewport.test.ts src/lib/client/bed-mesh/BedMeshWidget.test.ts src/lib/client/bed-mesh/BedMeshState.test.ts src/lib/client/live/bed-mesh-controller.test.ts src/lib/client/bed-mesh/retry-focus.test.ts`

Final result: PASS33 tests in five files, including common exact-content,
overflow/keyboard behavior, absent/loading privacy, accessible description and
observer cleanup, plus existing Bed consumer/state/focus checks. An initial
common assertion counted public inter-element whitespace as nonempty; it was
corrected to test absence of actual content. Root `git diff --check` passed.

The maintained MCP Bed file retains its original two state cases and adds12
initial→error→ready→retained-error cases: absent/short/80-code-point astral
profiles at320/390 px and normal/true200% text. They assert exact region bounds,
full accessible value, overflow-only focus, last-character visibility after End,
Home/arrow scrolling, no ellipsis, blank absence, no stale error value and
unchanged2D recovery checks. This increases the complete MCP inventory from61
to73; no original case was removed. The independent reviewer owns executing
these changed browser cases and the renewed full candidate regression. This
author has not yet run the newly added browser matrix or any full suite.

Author source identities for this correction (diagnostic, not independent
approval):

| Path under application | SHA-256 |
| --- | --- |
| src/components/common/TextViewport.svelte | `909b0671f1841a4ce3246ed4bd2f0c6c38b1124ac58fa31b35cc06b12770ae6a` |
| src/components/bed-mesh/BedMeshPanel.svelte | `e75be20c0746775c6017544a47a0556cba9a43c35b5de62b6cea74d61ba52caf` |
| src/lib/client/common/TextViewport.test.ts | `39805ed46f6531221787da56d49995123442c51bddff02087a174e27197a1e4e` |
| tests/browser/mcp/bed-mesh-states.spec.ts | `dc4848428ad8d84bb0084675d886c79713d7b542c162a1e387f1d71d5109a779` |

Affected package generation, exact guard entries and preview/fixture corrections
remain architect-owned. Their final pins are renewed after the single build;
earlier artifact acceptance is not carried across changed bytes. No printer,
real-media, actual-phone or deployment acceptance follows from these checks.

## Full-regression correction batch — integration author

The independent full-run closure above invalidated the prior freeze. The author
kept all existing cases while correcting their fixture routing:

- The default visual config excludes only `composable-lab.spec.ts`; the full
  browser command explicitly runs its existing dedicated config once, alongside
  the general visual and MCP configs. Composition still uses the dedicated
  immutable preview server, not the generic Kit host. `build:composable-preview`
  generates its existing dedicated Kit output, and both the full-browser command
  and required repository check supply that prerequisite. No existing gate was
  removed or bypassed.
- The MCP fixture delegates only the five existing focused dashboard paths and
  their exact `_widget` child paths to production `dashboardPage`. This preserves
  exact assets, CSP and method policy while leaving all tool acquisition inside
  the synthetic fixture and its existing call log. No broad route fallback or
  production acquisition was introduced.
- Thermals' regression now asserts the established visible `Could not load`
  text plus its full accessible `Could not load Thermals` label. The original
  retained-reading exclusion remains. Geometry checks explicitly wait for the
  ready opening result before measuring.

Waiting for ready did not fix the Progress1024/100% failure: the focused rerun
still measured22px growth. A separate isolated browser measurement established
that header94px, footer75px and progress header64.59px stayed fixed, while the
layer/ETA detail group grew from17px to39px when blank flex children wrapped.
The Panel now allocates those logical groups with a font-relative auto-fit grid.
A temporary CSS probe confirmed equal386.59px shell heights; the subsequent
compiled-package regression below confirms the actual source fix. No global
StateSurface rewrite, hidden observed text or sample-value reserve was used.

The new generic TextViewport is registered with exactly two div and three span
native nodes. Existing feature debt limits remain unchanged. An integrated
compiler check caught unsupported `aria-description` typing; the Bed author
replaced it with supported `aria-describedby` referencing constant public help
text, and the affected packages were rebuilt. Its private-value, keyboard,
resize and cleanup evidence is recorded under the Bed author.

Actual integration checks and builds:

- Before and after config edits, `bun --no-env-file --config=/dev/null x playwright test --list --reporter=json`, and the corresponding command with `--config playwright.composable.config.ts`, captured actual discovered case identities. A read-only Python set comparison run through `uv run --no-project python` proved361 original visual cases =345 general +16 dedicated, with empty intersection and no omitted or added case. The canonical original inventory SHA-256 is `dcb43ff55c7f41e9584493787d61ddc9597573419b26353d4457aa645fee1706`.
- The MCP `--list --config playwright.mcp.config.ts --reporter=json` inventory contains73 cases. Comparing its file/title identities to the independent completed61-case run proved every original case remains, with exactly12 additional initial-profile geometry cases. The full command therefore schedules434 cases:345 +16 +73.
- All nine observation `build:live-*` scripts, `build:mcp-observation`, `ui:build`, `build:server` and `build:composable-preview` ran successfully after the supported accessibility correction. The integrated server contains100 runtime files and114 static routes. Camera artifacts remain unchanged.
- The dedicated preview was regenerated from current source; its explicit manifest pin is `d5165f7103ecf3170ee784a6fbe089b1522d66b0296ff5ad5ad1f79cfef9c73a`, exact page hash is `b64043e67d4971ad2541261c7ee4153821b0182527df07a3b0089d511ec81ff2`, and its required observed hydration asset is `nodes/1.rPLmEOf4.js`. No automatic repinning or relaxed manifest acceptance was added.
- `bun --no-env-file --config=/dev/null test tests/server/composable-preview.test.ts`: the first run exposed one remaining old hydration-asset literal in the test; after updating that exact pin, PASS4 tests/323 assertions. Snapshot immutability, tamper rejection, closed routes/methods/protocol variants and no authority fallback remain covered.
- `bun --no-env-file --config=/dev/null x playwright test --config playwright.mcp.config.ts --grep 'fixed native body padding and neutral geometry 1024 100%|MCP Bed |dashboard current MCP|MCP native failed Refresh|dashboard Overview refresh'`: PASS22 in23.0 seconds on final generated bytes. This includes all14 Bed state/profile cases, five native dashboard flows, Overview dashboard isolation, Progress1024 geometry and Thermals failure privacy. The task-owned4182 fixture and browser closed afterward.
- Final integrated `x svelte-check --tsconfig ./tsconfig.json`: zero errors/warnings; `run scripts/check-components.ts`, root `bash -n scripts/check-repository.sh` and `git diff --check`: PASS. No author full browser run or dedicated16-case browser repeat was performed; the independent owner runs the complete434-case candidate regression.

Final production source/build-input diagnostic fingerprint, with the same
algorithm and now360 files including TextViewport:
`52c458a5ef872d10c1771957398b547084bc839831755970b10423c279c89111`.
The eight-file browser orchestration fingerprint is
`80f4617af4403b79944d269ceadb0ee1a6be5c50cfe1c57dcbfe9c9edcb2f93b`:
repository-relative sorted path/NUL/file-hash/LF records for app package.json,
the three Playwright configs, both preview/MCP fixture scripts, preview server
test and root check-repository.sh. The integrated local server build-manifest
hash is `169b2b74548beec6a7b91046bb282516227b42d59443d8f25cdde1aa801b4338`.
Final MCP observation is763760 bytes with SHA-256
`17c37f227ca76e880a6f62179c97176a52705f4a6de30a8a5bbca0f35615b7b8`.
The contract author records final package pins/table next. These diagnostic
identities supersede prior author fingerprints and do not replace exact-SHA
independent approval or shipping validation. No deployment, printer or actual
phone validation was performed by this author; no task-owned resources remain.


### Final viewport candidate artifact pins

Source candidate `2048925f9848c11ef5d1824be5b358bddb274a58` contains the
viewport/fixture corrections, maintained original tests and all renewed pins.
The contract author used `uv run python` to calculate actual artifact identities
and updated only the five changed pins plus the native inventory total. From
repository root,
`/Users/scottchu/.asdf/installs/bun/1.4.0/bin/bun --no-env-file --config=/dev/null test plugins/u1-print-studio/app/tests/server/live-fans-package.test.ts plugins/u1-print-studio/app/tests/server/mcp-widget-packages.test.ts plugins/u1-print-studio/app/tests/server/private-lab.test.ts`
passed19 tests/218 assertions. The architect separately records22 focused MCP
passes, including all14 Bed cases; this is not this author's independent review.
The reviewer owns the renewed434-case browser regression and final exact review.
No application mutation or build was performed during that frozen run.

The following15 artifact identities supersede earlier pin tables. Native
artifacts total1,481,084 bytes. All three Camera hashes remain unchanged.
These are integrity measurements, not byte caps or device/release acceptance.
The four current status tops link this correction, mark all known source work
and packages authored/frozen, and leave independent final review, the full
required regression and guarded shipment pending. No author implementation or
record-update task remains outstanding unless review finds another issue.

| Final artifact | Bytes | SHA-256 |
| --- | ---: | --- |
| svelte-live-fans | 88864 | `045406518f2ef1c2e23bbb2e954c34c4c179d06f6c5649a350dfd9cc9f3f528b` |
| svelte-live-thermals | 94932 | `330896db8327d766052f66f3daf3fb4a00022beec9b4ac5cfd0ce4f27e9d1658` |
| svelte-live-heads | 98644 | `b74e1cb8b9750dcb47cfb901cd0da673036ec4e34b2fe233f3329658857afc05` |
| svelte-live-queue | 90384 | `a1858663df6f97200d956bc146d591f04f205669d14d2b7692fc0545e5e8b5e5` |
| svelte-live-progress | 83307 | `4acad1be4350618cdfa900e993c2bc4e198a7484b6ee3f17659cca5d7212a3a4` |
| svelte-live-jobs | 88644 | `a2a39f8628e40394b7c1d99d214783c6f8d11a18ec67119c6585e3bba2398b5a` |
| svelte-live-job_history | 86801 | `ef389c65d0fe150352913b6d95bd7d7dc219eaebaef258330f5743c1b188cc1a` |
| svelte-live-overview | 96932 | `ead65b392a9820c9efee6213225c8fa25dedebe21b0433da474594457bef9ced` |
| svelte-live-bed_mesh | 652480 | `5b255499505463e8dfdbc5b1b608ed1b0f519fd91f3c684cd03d4b0112eebeac` |
| svelte-live-camera | 100096 | `1bed20ce48f74c6ebc89d488e0eedb6be33a89095034d10d4cd1c00d60754e97` |
| mcp-observation | 763760 | `17c37f227ca76e880a6f62179c97176a52705f4a6de30a8a5bbca0f35615b7b8` |
| mcp-camera | 100154 | `c983e7b0e4f7da8c7b913e6b45516df87fb1ca176fc157159bf8167fc42871b7` |
| svelte-observation-lab | 173052 | `59d5de025124fc5c87bc9be7a62bda824bbb5c8b1d9aa022116e40fa50d8cdce` |
| svelte-bed-mesh-lab | 641969 | `cd3f033f0add582039e92745f49d2e6cd7d3390741d79fa5f65353b4484edda3` |
| svelte-camera-lab | 83798 | `c6b49974a68dd3dbd228d3d1a2426efa8bbf99ffea5adaf3b19f74695b8cbc57` |

Final documentation verification: current relative links/evidence anchors and `git diff --check` pass; only the five current Markdown records differ from the frozen source commit. No application bytes changed for this record tail.


## History Lab typography scope correction after complete 434-case collection

The independent frozen `2048925f9848c11ef5d1824be5b358bddb274a58` browser collection completed with 431 passing cases and three History Lab failures at 320px with actual computed text doubled. This is a failed candidate result, not full acceptance. The retained-error trace localized one-record geometry to body 140→107px and shell 509.15625→476.15625px, with header 278.5625px and footer 88.59375px unchanged. Four and twenty records reproduced the same 33px per-row difference.

The sole application correction scopes the newly introduced `overflow-wrap: anywhere` rule in `HistoryPanel.svelte` to `.live-row .history-status div`. The Lab selector returns to its prior display/grid/gap behavior; production live wrapping remains. No DTO, lifecycle, shared allocation, test expectation, fixture authority, dependency, version or Camera source changes accompany this correction. The original three failing browser specifications remain intact for independent closure.

Author commands actually run from the app directory, in this order, with pinned Bun 1.4.0 and `--no-env-file --config=/dev/null`:

- `bun run ui:check`: Svelte diagnostics zero errors/warnings; existing component contracts pass.
- `bun run build:live-job_history`, `bun run build:mcp-observation`, `bun run ui:build`, `bun run build:composable-preview`, and `bun run build`: all pass. Other existing native packages remain unchanged; the private packaging rebuild retains Bed and Camera byte identities.
- The dedicated immutable preview manifest was explicitly renewed to `1c245ee21587982716ea5e9fb0006194e2c9d93aef190b370af2d2b6b49f436f`, page hash to `871e6f56f71c09581ceaa9abfc3a90b8dee6a47d03d76d533a35659802e42710`; the hydration path remains `nodes/1.rPLmEOf4.js`. No route, CSP, import, method or snapshot guard changed.
- `bun test tests/server/composable-preview.test.ts`: 4 pass, 323 assertions, including immutable snapshot, tamper denial and authority isolation.
- `bun run build:server`: pass, 100 files / 114 static routes / 100 hashes.

Author source identity: HistoryPanel SHA-256 `d9abdd0a4c8fb80ee3a590549af7994e0acd31913697c996d283fc5c79e39378`; 360-file production source/build-input fingerprint `d1b8004d492d5f6df0706cf90235005a4d751145039d0c3d0d8962d310871bb6` using the preceding section's sorted app-relative path/NUL/file-SHA/newline method. The three affected packaged outputs are native History `08eb659f5bda1d2a14a14e58d1c8e0c0c25e57cc2509a76ee23f2f1c330f1746` (86889 bytes), MCP observation `874684492c770c976c3706ca2c2d9860403380a5a01580c8283ca29bcf526e87` (763848 bytes), and private observation Lab `0f0d7e0e1b9b6bc23168f666517dc6fa4350a3cd8897a16c16d723bcd27dbbcb` (173140 bytes).

The author ran no duplicate full browser suite and owns no fixture listener. Independent affected History/consumer closure and fresh observation matrix, exact-candidate review, mandatory shipping gates, deployment and actual-device acceptance remain separate pending evidence.


### Final History scope-correction artifact contracts

After the architect's single-selector History correction and regeneration, the
contract author verified the actual three affected artifact sizes/hashes and
updated only `tests/server/live-fans-package.test.ts`,
`tests/server/mcp-widget-packages.test.ts` and `tests/server/private-lab.test.ts`.
The native inventory sum is now1,481,172 bytes. The other12 artifacts match the
preceding full viewport-candidate table exactly, including all three Camera
packages; this was checked against actual public bytes with `uv run python`.

From repository root,
`/Users/scottchu/.asdf/installs/bun/1.4.0/bin/bun --no-env-file --config=/dev/null test plugins/u1-print-studio/app/tests/server/live-fans-package.test.ts plugins/u1-print-studio/app/tests/server/mcp-widget-packages.test.ts plugins/u1-print-studio/app/tests/server/private-lab.test.ts`
passed19 tests/218 assertions. `git diff --check` passed. This author performed
no application edits, builds, preview-pin edits, browser runs or deployments in
this tail. The architect owns the actual selector/build/preview results; exact
candidate acceptance and required regression remain coordinator/reviewer-owned.

The following rows supersede only their corresponding rows in the preceding
15-artifact table. Other measurements and Camera identities remain unchanged.

| Artifact | Bytes | SHA-256 |
| --- | ---: | --- |
| svelte-live-job_history | 86889 | `08eb659f5bda1d2a14a14e58d1c8e0c0c25e57cc2509a76ee23f2f1c330f1746` |
| mcp-observation | 763848 | `874684492c770c976c3706ca2c2d9860403380a5a01580c8283ca29bcf526e87` |
| svelte-observation-lab | 173140 | `0f0d7e0e1b9b6bc23168f666517dc6fa4350a3cd8897a16c16d723bcd27dbbcb` |


## Independent complete frozen browser collection and History closure boundary

Reviewer `/root/domain_review` completed the exact `2048925f9848c11ef5d1824be5b358bddb274a58` candidate collection before releasing the edit lock. All 434 browser cases ran: default visual **342 pass / 3 fail**, dedicated immutable composition **16 pass**, and MCP **73 pass**; total **431 pass / 3 fail**, with no skipped or interrupted cases. This is a failed full candidate result. All three failures are the History Lab 320px / actual computed-text 200% geometry cases identified above: `footer-error-preview.spec.ts`, `lab-states.spec.ts`, and `lab-text-bounds.spec.ts`, respectively 33px per row, 132px for four rows, and 660px for twenty rows. The live/MCP suite had no failure.

The reviewer ran `uv run --no-project python tmp/domain-widget-review-20260911/run-candidate-browser.py 2048925f9848c11ef5d1824be5b358bddb274a58`. The private wrapper used pinned Bun 1.4.0, `--no-env-file --config=/dev/null`, and from the app directory ran `run build`, `run build:composable-preview`, `run scripts/build-state-harness.ts`, `run scripts/build-camera-harness.ts`, then `x playwright test --config .review-playwright.config.ts --workers=1`, `x playwright test --config playwright.composable.config.ts --workers=1`, and `x playwright test --config playwright.mcp.config.ts --workers=1`. Four build/harness phases passed (5.661s, 5.631s, 6.112s, 1.403s). Browser phases completed in 433.341s, 17.841s and 90.312s.

The default fixture allocation preserved the pre-existing user-owned port 4179 process. A temporary same-depth full test copy changed only five exact origin literals from 4179 to owned port 4197: `bed-mesh-legend`, `fans-state`, `live-heads`, `percentage-background`, and `thermals-state`. Assertions were unchanged. Its temporary config changed only testDir, outputDir and port/baseURL; `reuseExistingServer: false`, all guards and the dedicated immutable preview host remained intact. The 103-file original test inventory SHA-256 was `f4f1662f777157eac3e9d8aeea4ac31fc6c85e87bcd715060728596c90623302`; original/default-copy config hashes were `20e6ee1ce0acda8aec779ae070ec7df16b5361c30d152efd3a20d2b5b24e5728` / `7254410c426c22e51ca1ee84bb827fc98dd71edb79dac9376d25c4d6e4504f16`. Exact inventory comparison proves 361 original visual cases = 345 default + 16 dedicated, with zero overlap or omissions; MCP preserves all original 61 plus the 12 new Bed initial-profile cases. The wrapper verified unchanged original tests and HEAD, removed its temporary config/test copy in finally, and released 4197/4181/4182/4184. The user-owned 4179 service remained intact.

Private reproducibility identities (synthetic artifacts only, not committed): wrapper SHA-256 `7103a852dfe2cd47b90888791fa9a841dfd4a6e81e499d128385d75b9202805c`; metadata `99a602ca70f97faadd3a8129a4e431963d073c39cf7b94b153b67531cfe23c84`; complete log `3eba75099dba551a120a900953e0563196a203e54ed18e223a8f906db80f6a43`; inventory proof `30cbc176749f9459126dbe8a34c53aed2df994cfa8f645ac002959893ed99aec`; 189-file screenshot/trace/result manifest `03b8c2813201170a07a704d25a376c63c6fca5855e080ccf7eeffff7ba9a2c77`.

Before that collection, the independently owned immutable `17c37f...` MCP matrix passed 18/18 (nine views × 390px normal / 320px every computed font doubled), with zero page errors, stable ready/error geometry, visible unknown/empty/reason distinctions, retained-value masking, Retry, age-only stale, Overview tile isolation and Jobs long-value stress. Script/result/log SHA-256: `09921a7e43d9c45980ea5a6404fb76c117817bcb4f28ed40ff31f8b392e5ce02`, `4e314ddf4271ed2c2710d360f649534482e5645298544f532bbb65800fb696b5`, `629cd528aa95e6c8719a7ef2d7b41fc577a20a742f742b4ce8f47b63cd6b04f8`. Current Progress and Bed screenshots at both scales were inspected for readable full values and restored geometry. This successful native matrix did not supersede the separate Lab failures.

Independent source review of the subsequent narrow History correction confirms the only application change scopes the existing wrapping rule to `.live-row`; DTOs, lifecycle, shared primitives, source contracts and Camera are unchanged. Preview/security/package-test differences renew exact identities only. Under the repository test cadence, closure will renew all affected History/shared browser consumers plus the fresh nine-view matrix, retaining unaffected frozen collection evidence explicitly. A second complete 434-case run is not implied; all mandatory `u1-ship` guards still must run unchanged. No release approval, deployment, real-printer or actual-phone acceptance is claimed by this collection.


## Independent final History closure and source acceptance — 7ca0c8cd

Reviewer `/root/domain_review` approves the application/source candidate `7ca0c8cd4625939eccb3a514acbe2f9fd759e95f` after independent source review and affected verification. The exact nine-file diff from the complete-collection candidate consists of one application selector correction, its three generated packages, and exact preview/package integrity pins. No browser test, dependency, source contract, lifecycle, shared primitive or Camera implementation changed. This approval is local software acceptance; final documentation-head identity review and unchanged mandatory shipping gates remain required.

Actual command: `uv run --no-project python tmp/domain-widget-review-20260911/run-history-closure.py 7ca0c8cd4625939eccb3a514acbe2f9fd759e95f`. Pinned Bun 1.4.0 with `--no-env-file --config=/dev/null` ran four sequential Playwright commands, all `--workers=1`: temporary equivalent visual config with complete `footer-error-preview`, `lab-states`, `lab-text-bounds`, `widget-error-stability`, `lab-controls`, `lab-runtime-isolation` specifications (**50 pass**, 147.264s); the same config with `observation-lab` and `header-typography`, `--grep '[Hh]istory'` (**7 pass**, 5.519s); unchanged `playwright.composable.config.ts` (**16 pass**, 17.841s); unchanged `playwright.mcp.config.ts` with `presentation-layout`, `dashboard-current`, `widgets`, `overview-isolation`, `--grep 'fixed native body|job_history|Overview|overview'` (**17 pass**, 29.799s). Total **90/90 pass**, no skip/failure. All three original failures passed inside their complete unchanged specifications, including 320px actual doubled text and the full closed record-count/preset matrix. The later History filter selects additional affected cases, not omissions from those three specifications.

The same documented 4197 fixture allocation and five exact origin substitutions preserved all authority assertions. The temporary copies/config were removed in finally; original tests and HEAD were unchanged. Source test inventory hash `858efba94ddd2b18dc9e4de402ec6e7ca4e26452d3daf7965d8729c1d464a151`; private wrapper/metadata/log SHA-256 `4d8173f33156ac3579621059000d41d982d0e1b827e57f3cbd428f35e11f61f4`, `289762ff29e06f19b8dab6cf040064ab20526816675b9c8f2a4906704e6161f8`, `cfb3123c5bd50588f88b388230b69bddcb499a1c195fb3af34896ff8244b1310`.

Fresh independent immutable MCP `874684492c770c976c3706ca2c2d9860403380a5a01580c8283ca29bcf526e87` matrix: **18/18 pass**, zero page errors, all ready/error height deltas exactly zero. Nine views at 390px normal and 320px every computed font doubled cover ready, acquisition failure/masking, Retry, unknown, age-only stale, applicable unsupported/empty, latest Bed reason, visible safe profile, Jobs long filename/large finite metrics, and Overview failed-tile isolation. Command: pinned Bun `run tmp/domain-widget-review-20260911/874684-matrix.ts`. Script/result/log hashes: `d29a10a9a8b0bc13089fc71882b4d5874cd54c7b765feb12e9c4e1390037f347`, `77ffbd7300e45ae184cde9c9630fc512cc5e1541a474b6352cf3c4ba2f219854`, `6a41e9a8d933a85adbbd7780b51910ecf3e6d46f2455dfedfcaba2bb30d7796f`.

The matrix command's extra Lab screenshot appendix initially failed because per-node inline font overrides disappear when Lab replaces nodes; this does not invalidate its completed 18 native records, and its nonzero exit is preserved. The reviewer reran only that appendix using the maintained CSSOM `doubleSyntheticText` helper (`run .../874684-lab-screenshots.ts`): pass, exact Lab ready/error shell 296×740.15625px at 320px actual doubled text. Both screenshots were inspected: complete status/time/duration text remains readable, error neutralizes the actual values, and outer allocation is identical. Screenshot hashes `90a0937da5628538fb985b81a370fb5d77ca5ae8f88bca6870e6ac583d070216` / `b87b524393a0b67a55918a67182f340dc7af1228456c81b607d12f827065e00f`; appendix script/log hashes `f660b2c2f1a73a11b55f5e34907e6ae18d85da83e51c6c9d58bc4553329d3e83` / `524e27d1258f44971aa1ccbaf16e2550f82d6b5c55f59562e2ef60afc972e031`. No application or maintained-test change was made for this harness correction.

Affected source and transitive consumers are closed. Retained evidence is the original complete 434-case collection on `2048925f` with its three explicitly failed cases, plus this fresh 90-case closure and 18-case final matrix on the narrow corrected candidate; this is not a claim that another complete 434-case run passed. Unchanged Camera source/package identities retain the independent 210-second synthetic decoded-media soak and cleanup/backoff evidence. All task-owned fixtures and browsers were released; user resources were preserved. Actual printer streams, deployment and the user's iPhone remain separate from these results.

## Pre-shipment documentation closure

After the independent final History closure above, the documentation author
updated the current tops of PROJECT_STATE, NEXT_AGENT, NEW_AGENT_START, active
BRIEF/HANDOFF/VALIDATION and this evidence, plus directly stale native-delivery
wording in `docs/widget-delivery.md`. The records now distinguish independently
verified source from pending guarded shipment. They preserve the original full
431-pass/3-failure collection and subsequent affected closure; no second full
434-case green run is claimed. All 55 ledger IDs, separate Queue/Fans/History
product gaps, actual-phone uncertainty and existing authority gates remain.

Actual checks: `git diff --name-only HEAD` and `git ls-files --others
--exclude-standard`, checked through `uv run --no-project python`, confirmed
exactly eight changed Markdown files, no untracked files and no application,
configuration, dependency or generated-asset changes from reviewed source
`7ca0c8cd4625939eccb3a514acbe2f9fd759e95f`. The same check compared the ledger
ID sequence against HEAD (55 unchanged) and resolved all 15 current-section
relative links. `git diff --check` passed. No build or browser suite was rerun
for this documentation-only tail. Final documentation-head review and every
mandatory shipping gate remain required; release outcomes will be appended
when observed.


## Exact documentation-head approval and first guarded ship failure

Independent reviewer `/root/domain_review` approved exact documentation head `6a48e4855dc66d910192bbd9f44b5b5dab21c579` after verifying clean HEAD and that its diff from approved source `7ca0c8cd` contains only eight Markdown records. Application source, browser tests, configuration, dependencies and packages were unchanged; current records preserve the failed full-collection history and successful affected closure honestly. `git diff --check` passed.

The reviewer read the maintained `u1-ship` skill and invoked `uv run --no-project scripts/u1_ship.py --help`, then the read-only plan with `--pr 125 --reviewed-sha 6a48e4855dc66d910192bbd9f44b5b5dab21c579 --bun /Users/scottchu/.asdf/installs/bun/1.4.0/bin/bun`. Plan passed with reviewed tree `ff592696452dbe5b8b4dfcb2c86003ffec2af87c`, base `7bcf99939d2f24f0e4b82fc164d9dfcecf6f2c44`, Bun 1.4.0 / SHA-256 `539598c775882420b9d8deb7dc14d845f20f7d26f5600c50ab067dde6ac3f3bf`.

The same command with `--execute` stopped at mandatory `validate`: `Local repository/app/TypeScript/operator test gate failed`. Result: `ok=false`, `merged=false`, `installed=false`, rollback `not-needed`. No merge, deployment or service restart occurred. The operator did not bypass the gate or retry an external mutation.

To expose the child failure hidden by the guarded operator, the reviewer ran only the original local diagnostic command `PATH=/Users/scottchu/.asdf/installs/bun/1.4.0/bin:$PATH ./scripts/check-repository.sh` with a private log. It exited 2 at `tsc --noEmit -p tsconfig.server.json`: `src/lib/client/live/observation-port.ts(1,30)` TS2835 requires explicit `.js` in its type-only HostRpc import under NodeNext, and the unresolved type causes TS7006 at `(12,43)` for `event`. Earlier phases passed: Svelte zero errors/warnings, component guards, 68 Vitest files / 729 tests, and all deterministic native/MCP/private package checks. Later gate phases did not run and are not claimed. The author received a bounded type-import correction request; configuration and shipping guards must remain unchanged. A corrected exact candidate requires independent binding and a fresh complete unchanged operator invocation.

Private ship/diagnostic log SHA-256: `cf3d4c8e6ad034e4e2622aba11224c4f68505cf9e7269f97da522b98f1de03b8` / `047334acbdac09f555cf3583849ec3bd62ec4eb3bf582c52ebef8a9f264da391`. These are local software/operator failure results; existing deployed services and actual printer/device acceptance are unchanged.


## NodeNext type-only import correction after mandatory validation stopped

The mandatory shipping validation on `6a48e4855dc66d910192bbd9f44b5b5dab21c579` stopped before merge, installation or service changes. Its server TypeScript check rejected the extensionless `HostRpc` type import in `src/lib/client/live/observation-port.ts` (TS2835); the consequent unresolved callback type produced TS7006. The bounded correction adds `.js` to that one type-only import. It does not change `tsconfig`, callback behavior, contracts, dependencies, package versions or required gates.

Author commands actually run from the app directory with pinned Bun 1.4.0:

- `bun --no-env-file --config=/dev/null run check` and the operator's exact `bun --no-env-file --config=/dev/null x tsc --noEmit -p tsconfig.server.json`: pass with no diagnostics.
- `bun --no-env-file --config=/dev/null run ui:check`: zero Svelte errors/warnings and component contracts pass.
- `bun --no-env-file --config=/dev/null x vitest run src/lib/client/live/controller.test.ts src/lib/client/live/http-observation-port.test.ts src/lib/client/live/graph-contract.test.ts src/lib/client/live/fans-adapter.test.ts`: 4 files / 62 tests pass, covering controller lifecycle, HTTP port and source graph boundaries.
- A `Bun.Transpiler({loader: "ts", target: "browser"})` comparison of the exact old/new module source emitted identical JavaScript, SHA-256 `0200df3ffcb2af5e4d8c9d222ec4bc3f5d713d21b9ae1d2d785e97a0d4e832f0`. This confirms type erasure for this edit; it is not a claim that a new full build ran.
- `git diff --exit-code HEAD -- plugins/u1-print-studio/app/public`: pass, all committed packaged assets unchanged. No packages were regenerated and no full browser suite was run by the author.

Changed source SHA-256 is `ec1b6042003cd1ead97f34ceda77d67ac015a85019bfa69e9fbe3cf1151025ed`; the 360-file production source/build-input fingerprint is now `cbd0656936068c00879f6a979780a75a8cc72c605842e1bc1d42b269d6072864` under the same sorted app-relative path/NUL/file-SHA/newline method. Independent approval must bind to the new commit, and the shipping operator must rerun all mandatory validation unchanged. Prior browser evidence can be assessed against this exact type-only diff and unchanged artifact bytes; this author evidence does not grant independent approval or deployment acceptance. No owned fixture processes or ports remain.


Independent reviewer `/root/domain_review` verified the NodeNext correction is exactly the type-only import suffix, with source SHA-256 `ec1b6042003cd1ead97f34ceda77d67ac015a85019bfa69e9fbe3cf1151025ed`. A fresh pinned Bun.Transpiler comparison of the approved predecessor and corrected file produced identical JavaScript, SHA-256 `0200df3ffcb2af5e4d8c9d222ec4bc3f5d713d21b9ae1d2d785e97a0d4e832f0`. The reviewer independently reran pinned Bun `x tsc --noEmit -p tsconfig.server.json`: pass. Public generated artifacts have no diff. The correction changes type resolution only, so the preceding exact browser/Camera evidence is retained; a fresh exact-head approval and complete unchanged mandatory shipping workflow remain required. No browser guard or shipping phase is skipped by this reasoning.

Documentation retry tail: current PROJECT_STATE, NEXT_AGENT, HANDOFF, VALIDATION
and this evidence now identify corrected source
`6a84e3552d88d99ab69095f64c185d6a0382e482`, the pre-merge shipping stop, retained
browser evidence and pending renewed exact-head/all-mandatory shipment checks.
`uv run --no-project python` checked `git diff --name-only HEAD` and
`git ls-files --others --exclude-standard`: exactly five Markdown-only diffs,
no untracked files and no application/configuration/dependency/package changes
from that source. All seven current-section relative links resolve;
`git diff --check` passes. No build, browser run or service change was performed
for this documentation-only update. The PR description draft was renewed with
the same failed-gate/correction boundary.


## Corrected exact-head approval and production route-inventory gate failure

Independent reviewer `/root/domain_review` approved `2e72dace38d99ea1774765b2d7fe65b07d570b67` after verifying a clean worktree, five Markdown-only changes after the independently checked type-import source `6a84e3552d88d99ab69095f64c185d6a0382e482`, and unchanged packages/browser inputs. The fresh read-only `u1_ship.py` plan passed with tree `c024156391e28ab65620b2f99d85669687ce05ab`. The reviewer ran the complete unchanged command with `--pr 125 --reviewed-sha 2e72dace38d99ea1774765b2d7fe65b07d570b67 --bun /Users/scottchu/.asdf/installs/bun/1.4.0/bin/bun --execute`.

This attempt passed the full mandatory repository/app/TypeScript/operator gate and production bundle/signing stages, then stopped at the newly generated candidate's strict static build contract: `Invalid or incomplete Kit build contract`. Result remains `merged=false`, `installed=false`, rollback `not-needed`; no service restart or deployment occurred. Later phases are not claimed. The operator was not bypassed or blindly retried.

Read-only invocation of `read_current_build_manifest()` on this exact generated output exposed `ValueError: Generated static file is missing its route`. The five unserved generated files are `prerendered/dashboard/{bed_mesh,job_history,jobs,overview,progress}.html`. Source review traced this to the incomplete production cutover: `build-server.ts` still maps these five route names to the former static dashboard host, while `NATIVE_DASHBOARD_VIEWS` in `route-policy.ts` still lists only four earlier native views. Its `DASHBOARD_PAGES` widget allowlist also omits the five new `_widget` paths. Existing fixture and packaged-component successes do not establish correctness of this production router mapping; this remains a blocking production integration defect.

The author received a bounded correction request to bind all nine native pages and exact ten widget paths through the central production policy/build inventory, retire the five superseded host mappings, and renew actual production route/compiled manifest/security tests. It must preserve the complete-output validator, private/public boundary, methods and all shipping guards. Deleting generated native pages or weakening inventory checks is not an acceptable closure. Frontend/browser evidence may be retained only if its exact inputs remain unchanged; production server/build-policy evidence must be renewed before a new exact-head approval and complete unchanged shipping invocation.

Private stopped-operator log SHA-256 `864e40452ff2ae7890f330d8928f77ef83c4acecd3f5349224be5f4b771efd8b`; rejected manifest SHA-256 `3d43846432fd42e84647debe033d783a1d865e60bd5e12ae49f6b0b0fd38fb05`. Existing services and actual printer/device evidence remain unchanged.


## Production route inventory and compiled build correction

The second mandatory shipping attempt stopped at the unchanged static build completeness guard before merge or installation. The build contained five newly prerendered native pages, while its producer still mapped their URLs to the legacy host HTML. Production `NATIVE_DASHBOARD_VIEWS` also retained only the prior four views, and the widget route allowlist omitted the new five. Prior MCP fixture success did not cover this production policy mismatch.

The bounded correction derives the nine native views from the existing exact ten dashboard views by excluding Camera, uses the same ten-view list for the widget allowlist and build producer, and removes the five obsolete host mappings. Every native page now maps to its actual prerendered HTML. No shipping validator, service, authority, route method, CSP or manifest completeness requirement changed.

`tests/server/compiled-dashboard-routes.test.ts` is a new production integration regression. It invokes the actual build producer into an isolated output, imports that output's compiled server and handler, and injects a synthetic observation store through the existing production dispatcher. Explicit nine-native/ten-widget expected inventories prevent silent route expansion. It checks all generated static files are routed and hashed, exact served bytes and hashes, native pages without iframe hosts, public denial, method denial, invalid aliases/raw targets, and zero observation acquisition. Sockets, transports, child process and owned temporary outputs are released in `finally`; the test does not call `startServer` or access printer/Tailscale settings.

Author commands actually run from the app directory, using pinned Bun 1.4.0 with `--no-env-file --config=/dev/null`:

- `bun x tsc --noEmit -p tsconfig.server.json`: pass.
- `bun test tests/server/compiled-dashboard-routes.test.ts`: 1 test, 487 assertions pass against a real freshly compiled output.
- `bun run ui:check`: zero Svelte errors/warnings; existing component contracts pass.
- `bun run build:server`: producer completed with 99 files, 114 static routes and 99 file hashes. This intermediate output was subsequently rejected by the independent unchanged Python validator because the schema still requires the immutable host resource even with no native routes pointing to it. It is not an accepted final build; all valid prerenders were retained.
- `bun run build:composable-preview`: pass. Its manifest `1c245ee21587982716ea5e9fb0006194e2c9d93aef190b370af2d2b6b49f436f`, page and hydration bytes remain unchanged, so no pins changed.
- `bun test tests/server/kit-native-observations.test.ts tests/server/kit-fans.test.ts tests/server/status-dashboard.test.ts`: 42 tests, 1342 assertions pass.
- `bun test tests/server/composable-preview.test.ts`: 4 tests, 323 assertions pass.
- `git diff --exit-code HEAD -- public`: pass, all widget packages including Camera are unchanged; no full browser suite was run by the author.

Rejected intermediate compiled manifest SHA-256 is `9f0054183409a433768a0a6cca97cc65f2e4fb08bade345fd2b199a55172d9bf`, compiled server `307b54cf036552daaebb811d41f208d61d7e2f5c3c6f8a69aa4bbfc364197708`, and handler `0ee881df64429e90efa5b6643286ad379def3729269c7eda5f5c6749bda41080`. The 360-file source/build-input fingerprint is `ef4309994205653ae93c6dd8c90640633e9ba67183a3aa8a34acb92ff59f4b71` under the existing sorted path/NUL/file-SHA/newline method. Source identities are route-policy `482bebc9b6d5e8e99ada1f5be8bf0bdfe1ade32bcbe1b8597b75f13eb0cd002f`, build-server `a359de81dcb47679d7e7b02fdae55251e31539c06177c518ddb600714dce45f7`, and new compiled regression `b3a7af1f87d727fade815c62391440a889eef983d0e0103a7026b35295b89a21`.

The exact clean staging output is retained privately for the independent operator's unchanged Python manifest validator and compiled-browser review; it is not substituted with the incremental dist directory. Author fixture ports 4181/4182/4183 were confirmed free after checks. Independent exact-SHA approval, unchanged mandatory shipping validation, deployment verification and actual-device acceptance remain separate gates.


### Required immutable resource preservation and final producer check

The independent unchanged Python schema check rejected the intermediate 99-file output above because `static-contract/status-dashboard-host.html` remains a required schema resource. The producer now copies that immutable resource with an empty URL list. All nine native routes still point to their actual prerenders; no legacy route mapping was restored and the shipping schema/validator remains unchanged.

The new compiled regression now invokes `uv run --no-project python` to call the actual `scripts/u1_build_contract.py::read_current_build_manifest` on its generated output. It also verifies the required host resource matches the committed public bytes and has no route. Its generated-file completeness assertion follows the existing schema's client/prerender rule; it no longer incorrectly requires every immutable schema resource to have a URL.

Final author commands/results: `bun --no-env-file --config=/dev/null test tests/server/compiled-dashboard-routes.test.ts` passes 1 test / 475 assertions, including the unchanged Python validator and actual compiled dispatcher. `bun --no-env-file --config=/dev/null run build:server` produces 100 files / 114 static routes / 100 hashes. A separate `uv run --no-project python` invocation imports `read_current_build_manifest` from the unchanged scripts directory and validates this final clean staging output successfully. No incremental dist extras were passed to the closed-output validator.

Final manifest SHA-256 `183c58faaae1378cd0dada90182e4c3631736f66bf10368d1d37c23717fe6ec0` supersedes rejected `9f005418…`. Compiled server `307b54cf036552daaebb811d41f208d61d7e2f5c3c6f8a69aa4bbfc364197708` and handler `0ee881df64429e90efa5b6643286ad379def3729269c7eda5f5c6749bda41080` remain identical between those two outputs because the final correction preserves a required static resource only. Final build-server source SHA is `2726e21915876174cca3750322761d0e59223aec968203fea6ac327ec634a207`, compiled regression SHA is `3ad02dd88500969fce370c896b3fc47e17cb42ed68e713a19ac6d18f48c6b4fb`, and the 360-file source/build-input fingerprint is `6507ea69ef7ac716949304c2fe7c027b84766912dac9202024f48aefb00efb15`. The route-policy source and all packaged UI, Camera and dedicated preview identities from the preceding section remain unchanged.

The final clean output was handed to the independent reviewer for direct schema recheck and compiled-production browser validation. Exact-candidate approval and the next complete mandatory shipping validation still remain required; author tests do not substitute for either.


## Independent production router closure — 6b29d2f8

Reviewer `/root/domain_review` independently approves corrected source `6b29d2f8de33e258166e5c301f4137e9ad2fb40b`, binding the reviewed source diff and fresh compiled-output verification below. The only application/build changes since the previous candidate are central nine-native/ten-widget route derivation and the build producer's exact mapping/resource-copy correction; the new maintained test exercises the real compiled dispatcher and unchanged shipping validator. Public denial, method restrictions, raw-target rejection and shipping schema remain intact. The required former host resource remains an immutable unserved asset; its five superseded route bindings are removed. All frontend/widget/Camera packages are unchanged.

The reviewer called unchanged `read_current_build_manifest()` on the exact clean staging output with manifest SHA-256 `183c58faaae1378cd0dada90182e4c3631736f66bf10368d1d37c23717fe6ec0`: **pass**, 100 files / 114 static routes. Compiled server SHA-256 `307b54cf036552daaebb811d41f208d61d7e2f5c3c6f8a69aa4bbfc364197708`; handler `0ee881df64429e90efa5b6643286ad379def3729269c7eda5f5c6749bda41080`. This closes both generated-route completeness and required-resource preservation under the original operator validator.

A fresh independent private browser harness imported that actual compiled `server.js` export and compiled `handler.js`, injected the existing synthetic observation store, and served the real production dispatcher on owned loopback ports. It did not use the source-only MCP/static fixture dispatcher, start the production server environment, read a printer or change auth. Browser tool responses were synthetic and intercepted at the documented dashboard tool boundary. Commands used pinned Bun 1.4.0 `run tmp/domain-widget-review-20260911/compiled-route-host.ts <exact-staging-output>` then `run tmp/domain-widget-review-20260911/compiled-native-matrix.ts`.

Compiled native browser result: **14/14 pass**, zero page errors, zero iframes in every native page, ready/error height deltas exactly zero. It covers all nine views at 390px normal and the five newly routed views at 320px actual computed text doubled; ready/failure/Retry/unknown/age-stale and applicable empty/unsupported/Overview isolation/Bed latest-reason/profile/Jobs large-value scenarios pass. Current compiled Progress, History and Bed screenshots at 320px enlarged text were inspected; necessary values remain readable and previous geometry fixes persist. Private host/script/result/log hashes are `76504d8083ef012adf52d9333d6c9b8e5b37e0cefd268b8418f3f0fd8933ac4c`, `3bba5a3a7851d00fd92272a23d07730ccdbbf0d1e732a46d89b579605bfba509`, `21069e2445e0713c703b3f7b64846acae8f0057de50ca744b958ef77248671b5`, `5b3942ec11bb2d04ecd78b287bb18ce38bd08c446a85f15691eac7dbb45ddb8f`.

The reviewer inspected the new 475-assertion compiled integration test and its actual author result, covering exact native/widget bytes and hashes, public denial, method/alias/traversal rejection, no SSR acquisitions and cleanup. It is additional maintained coverage, with no replaced or weakened earlier tests. The independent host was gracefully stopped and both owned 4181/4183 listeners released; all other user services were preserved. Prior unchanged UI and Camera evidence is retained explicitly; the affected production dispatcher/build evidence is newly established here. Final documentation-head binding and another complete unchanged mandatory `u1-ship` invocation remain required. No deployment or actual-device acceptance is claimed by this closure.

Documentation production-route retry tail: PROJECT_STATE, NEXT_AGENT, HANDOFF,
VALIDATION, this evidence scope and the PR draft now identify independently
checked source `6b29d2f8de33e258166e5c301f4137e9ad2fb40b`. They preserve both
pre-merge shipping stops, the renewed compiled-route proof, unchanged UI/Camera
evidence and pending fresh exact-head approval/full mandatory shipping workflow.
Actual `uv run --no-project python` checks of `git diff --name-only HEAD`,
`git ls-files --others --exclude-standard` and current relative links passed:
five Markdown-only diffs, no untracked files or application/configuration/
dependency/package changes, seven valid links. `git diff --check` passed.
No application edit, build, test or service action was performed for this tail.


## Successful guarded release and installed behavior — PR125

Independent reviewer/operator `/root/domain_review` approved exact final head `373e4e05994284d84d578fa28bf9784bdb949bf0` after verifying clean HEAD, five Markdown-only changes after approved source `6b29d2f8`, unchanged application/build/test/package inputs, accurate retained-evidence boundaries, and `git diff --check`. The fresh read-only plan passed with reviewed tree `00e6ebc85d7ea8206822a0262d9c8b8310b8eb98`.

The reviewer ran `uv run --no-project scripts/u1_ship.py --pr 125 --reviewed-sha 373e4e05994284d84d578fa28bf9784bdb949bf0 --bun /Users/scottchu/.asdf/installs/bun/1.4.0/bin/bun --execute`. **PASS, phase complete**: every unchanged mandatory repository/app/TypeScript/operator test, production bundle/signing and exact build-contract phase ran; guarded merge, isolated exact merged source, stage, install dry-run, installation, explicit restart of BOTH existing services and final verification passed. No skip, cache bypass or manual service mutation was used. The two earlier failed attempts remain recorded above.

PR125 merged as `1716867af057d55b2e170215126dff429f4d000f`. Installed release `20260912-1716867-pr125-20260912T005903-cfae3d`; operator receipt identity `pr125-20260912T005903-cfae3d`. Both public and dashboard services are loaded, healthy and integrity-verified at runtime0.4.20 / schema18 / observation-v23 / camera-v18. **115 served static-asset checks and 117 security checks pass**, preservation verified, rollback not-needed. The public and dashboard `/widget` bytes both match MCP observation `874684492c770c976c3706ca2c2d9860403380a5a01580c8283ca29bcf526e87`; all native pages and widget assets match the exact validated build. Private operator log/summary SHA-256 `8510d1d2ca4a8d140551fc5fb841be5ef8de85b0c440893266dbdd14754a1c42` / `77ad561e947a572f03e6a17a45eb56facd9003512d03190dfc9f43c6e4d97f86`.

Postdeployment meaningful browser verification used the actual installed dashboard URLs on the existing local service with only tool responses intercepted as synthetic. All nine native views passed ready→failure/masking→Retry, unknown, age-stale and applicable unsupported/empty/Overview isolation/Bed profile and reason/Jobs large-value behavior at 390px: **9/9 pass**, no page errors and every ready/error height delta zero. This verifies installed widget behavior, not physical telemetry. Pinned Bun ran `deployed-native-matrix.ts`; private script/result/log hashes `6903537f1c5c2bf9fb3584a48e8ca1c33aa879eb448470cfc27b6963212f94aa`, `4d440bd9876410bffc8f82bc329ea10e83ba6e8c9a856b55633d8df9f38effb9`, `c4c5b2e78d365a363771a0f59d7aaa653bf27ca7169e9cabcd8a5f8862510aa1`. Its isolated browser was closed; it did not send printer controls or change authentication/routing.

## Bounded real observation and explicit Live camera acceptance

Under the coordinator's explicit bounded read-only authorization, the reviewer opened the deployed local dashboard in isolated Chrome. One real Overview request rendered its eight domain tiles; one tile remained locally unavailable. No private telemetry values were retained, and this does not establish every domain as available or healthy. The first Camera visit remained in the product's default **Auto** mode: 16 snapshot tool requests and zero page errors, with no Live request. Its lack of decoded video was a missing explicit-Live test precondition, not a product Live failure. An earlier duplicate-variable parse error prevented script execution entirely; neither reviewer-harness issue changed application source. All those initial browser handles were closed. Auto/Overview result SHA-256 `5742be9b52b51341fdd7387518c28ca282adeebea5330203a3c3ff59d6145e8e`.

The reviewer then ran only the explicit Live camera check, selecting the existing Live radio through the installed application. The real printer-camera transport established **1920×1080 video** and ran for **210148ms** after the first decoded playback sample, crossing the reported three-minute boundary. Fifteen samples show media time **0.113→210.237 seconds**, playback-quality `totalVideoFrames` **8→6298**, readyState4 throughout, a live media track, the same video element, **zero frame navigations/reloads and zero page errors**. Exactly one open-stream request, one answer request, two ICE-candidate requests and one close-stream request were observed; there was no second stream-open attempt. This is real camera transport evidence from local desktop Chrome, separate from the earlier synthetic delayed-answer/backoff tests.

Teardown used the existing application pagehide lifecycle: the owned video source was cleared and its captured media track reached `ended`; the close-stream request was observed once, then the isolated browser/context closed. No camera image/recording, private identifier, SDP or token was saved or committed. The check sent no printer-control command, auth change, routing change or service mutation. Pinned Bun ran `deployed-real-live-camera.ts`; private script/result/log SHA-256 `679699623d20c14c51097447399bc562f1a845139fa714ff08b982212569bdbb`, `18e4ad65c88155d180f3fea31aa6110151e4d1ad12c8f563603fc80fb8c99e9f`, `07971ecabba1ff55ab4a00c87264cc0082751bb4c1942f807ed19cc104b3059b`.

This successful 3.5-minute run does not identify the original phone crash cause or establish iPhone/ChatGPT-host acceptance; C08's actual-device boundary remains open. Service health, synthetic protocol coverage, installed synthetic behavior, real Overview partial availability, real desktop camera playback and actual phone outcomes remain separate evidence layers. The remaining work is documentation-only release closure and exact unchanged-input review, with no further deployment required for unchanged application bytes.

## Final durable release-record closure

The documentation owner reconciled PROJECT_STATE, NEXT_AGENT, NEW_AGENT_START,
active BRIEF/HANDOFF/VALIDATION, decision0059 and its index, the 55-ID widget
ledger and this evidence. Current records distinguish reviewed head, merged
source and installed release; retain both shipping failures and affected
browser closure; and record the completed release, both-service verification,
installed synthetic behavior and bounded real observations. No completed
implementation, shipping, test or record-update task remains in current next
actions. Actual iPhone retest and explicit future feature choices remain open;
local desktop Live success does not close C08 or the original crash cause.

Actual documentation checks used `uv run --no-project python` with
`git ls-files -z`, `git diff --name-only HEAD`,
`git ls-files --others --exclude-standard` and file SHA-256 comparisons:
all **585 tracked non-Markdown inputs** remain identical to deployed merge
`1716867af057d55b2e170215126dff429f4d000f`, including application, dependency,
configuration, tests and generated artifacts. Their sorted path/NUL/file-SHA/
newline fingerprint is
`e0091fc4d1fbe029cd2b579808ab5ce1d9e8163945b72387e656d62c66a62bc6`.
Exactly ten Markdown files changed, no untracked files remained, all 55 ledger
IDs retained their sequence and all 72 current-section relative links resolved.
`git diff --check` passed. The concise records-only PR description is prepared.

This tail runs no application build, test suite, printer operation or service
mutation. Matching released application evidence is retained for independent
binding to the final documentation commit; decision0028 requires no additional
deployment for unchanged application bytes. All requested durable records are
complete, with detailed evidence kept in this single record.
