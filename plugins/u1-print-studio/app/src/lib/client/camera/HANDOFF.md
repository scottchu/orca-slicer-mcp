# Camera service navigation and historical checkpoints

## Current contract (2026-09-03)

Use repository CAM-008, decision0046, the active iteration and delivery ledger
for authoritative scope and acceptance. The Auto/Live presentation and safe
failure diagnostics are a candidate; PR101 remains deployed until the new exact
candidate passes independent review and guarded shipment. Phone Live reliability
is unresolved. Dated checkpoints below retain earlier evidence and superseded
names, mode policies and byte caps; they are not current implementation contracts.

Paths are relative to the app root:

- `src/components/camera/LiveCameraRoot.svelte`, `CameraWidget.svelte`,
  `CameraMedia.svelte` and `CameraStatus.svelte` compose/render live Camera;
  `CameraLabRoot.svelte` and `CameraLabWidget.svelte` compose the synthetic Lab.
- `src/components/common/Video.svelte` owns the persistent media element;
  common `Button`, `Icon` and `Switch` remain generic UI primitives.
- `src/lib/client/camera/session.ts`, `live-controller.ts`, `runtime.ts` and
  `peer.ts` own the real service, transport, connection and cleanup boundaries.
  `synthetic-session.ts` supplies the Lab service; `state.ts`, `mode-options.ts`
  and `failure.ts` define presentation state, modes and safe failure mapping.
- `src/entrypoints/widgets/mcp-camera.ts` chooses host-result bootstrap;
  `live-camera.ts` chooses dashboard request bootstrap. They share presentation
  and services; components subscribe/render rather than own acquisition.

A new card defaults to Auto with only Auto/Live, without reading/writing saved
Live intent. The same mounted card resumes its explicit mode after hide/show.
Auto is single-flight and schedules the next read 1.5 seconds after completion;
automatic polls emit no success feedback or announcements. The compact Camera
has no footer or Refresh button. Its 88px-by-44px Switch stays bottom right, with
the persistent short safe failure reason bottom left inside edge-to-edge media.
Narrow layouts move that reason one row up inside the media without growing
the card or overlapping controls. Header content remains icon/title/state/FPS/time.

MCP accepts/decodes a valid opening result without a redundant initial request,
then schedules Auto after 1.5 seconds. Private cameraFrame/cameraActivation keys
or the DTO mediaType plus byteLength fields identify Camera delivery.
Authoritative malformed Camera delivery immediately becomes neutral error. A
bare isError: true host opening-result notification also fails immediately
without Camera fields; unrelated/unknown non-error delivery leaves the original
waiter/deadline active. Missing delivery expires at 15 seconds. Immediate failure or expiry then
schedules Auto retry after 1.5 seconds. Dashboard retains request bootstrap.
Hide/dispose invalidate owned work; stale responses cannot revive media/session.

PR101 established a 40-second Live-open user wait and 55-second retention only
for that HostRpc call, with abandoned open/close work draining at most 70 seconds.
Keep the shared RPC default 15 seconds; activation/local-answer/answer/candidate
10 seconds, first-frame 8 seconds, frame-stall 5 seconds and disconnect grace
3 seconds. This candidate changes none of those deadlines or watchdogs.

Service-owned lastLiveFailure records the first winning closed stage/outcome
before teardown and persists through Auto recovery. The next explicit Live
attempt clears it; cancellation/hide/dispose/stale epochs do not create a new
failure. Only the safe short reason is visible; elapsed/connection/frame-evidence
fields remain internal and no raw signaling/error/credential data is exposed.
Neutral acquisition failures mask stale media/telemetry without changing bounds.
Fullscreen remains same-document native/local CSS; host fullscreen integration
is unfinished. This source contract does not establish actual phone acceptance.

## Historical evidence

Decision0042 removed repository package byte caps. Earlier measurements, build
names, paths and pending status below describe their dated checkpoints only.

## Historical integrated candidate (2026-09-01)

Shared LabControls now exposes seven closed states and three restrictive
display policies with URL/reset/back-forward lifecycle. The directory links
the exact private Camera route; first title is U1 Camera. Shared Icon and AST
leaf/composite boundaries are registered. One persistent synthetic video keeps
fullscreen/PiP identity. Normal status is top-right; opt-in font-aware header
reflow fixes the author-observed320px/200% title/status glyph overlap without
changing existing observation header behavior.

Independent packaging design accepted explicit observation/Camera compiled
entries with750,000/80,000 and830,000 aggregate limits after the762,180-byte
combined build and764,097-byte conservative Terser trial exceeded the old cap.
Current outputs:748,482 observation+78,688 Camera=827,170 aggregate.
No cap bypass, external asset or production change is included. Camera's build
graph rejects Three, host/observation/bed-mesh code and the real session module.
The ship guard maps the exact Camera route to its own generated artifact hash.

Final author checks:155UI units/compilerAST,277app tests/3,223assertions,
21lifecycle24ship, full110Chrome cases, deterministic two-artifact rebuild,
bundles/signature/help and diff gate pass. The browser suite includes7isolated
lifecycle cases and9Camera-route cases covering56state/width/text combinations,
glyph containment/non-overlap, state geometry, top-right normal status, URL/
reset/history/hostile input and loading without an active stream. A generic
PageLayout owns main markup; CameraLabRoot and CameraLabWidget are strict
zero-raw composites. The lab-location edge alone handles URL/browser history.
Exact independent validation/review and guarded delivery remain to finish.
One attempted Python module-invocation used the wrong import/path arrangement;
the repository's direct `uv run --no-project scripts/test_u1_*.py` commands
are the authoritative rerun, not that failed invocation.

## Isolated real-session controller checkpoint (2026-09-01)

The separate live-migration design was accepted by the role-separated designer
before this bounded implementation. `session.ts` now adds a DOM-free controller
with injected parsed transport, snapshot decoder, peer factory and scheduler.
It does not bind the host bridge or production route and imports no synthetic
fixture. The transport surface is frame/authorize, open, answer, candidates and
close; the shared host-RPC author remains responsible for the sole MCP Apps
bridge, with additive existing host compatibility. There is no new tool or
server/adapter change. Private activation, session, offer, answer and candidate
values never enter the published presentation state.

Observable controller acceptance covers snapshot-first explicit authorization,
singleflight refresh and live opening, decode-before-time commit, generations,
10-second operations, 1.5-second decode, late-open lease cleanup, eight-second
first presented frame, five-second stall, three-second disconnect grace,
one-second measured FPS/1.5-second expiry, retained snapshots, bounded fallback
polling, explicit Close, pagehide/pageshow and once-only saved-intent restore.
The injected peer adapter must own and dispose only this viewer's tracks and
observers. Display/fullscreen/PiP stay outside this controller: the persistent
media component must not invoke Close or replace its video on display changes.

Author command `bun x vitest run src/lib/camera/session.test.ts` passed all
19 deterministic fake-clock/port tests. These are software tests without host,
network, media hardware or a printer; no live cutover is established. The
`bun x svelte-check --tsconfig ./tsconfig.json` compiler run found zero errors
and zero warnings. Independent review of
this controller, hostile parsed-port inputs, actual peer/decoder binding,
browser lifetime integration, packaging and production acceptance remain open.
The controller is paused at this checkpoint for independent validation of the
unrelated observation-only PR67 renewal.

This remains the existing interactive-decoupled app, not a new scaffold. The
Apps SDK and OpenAI Docs skills were used to preserve component-initiated
calls without remounting and the widget-private metadata boundary, grounded in
the current official [UI guide](https://developers.openai.com/plugins/build/chatgpt-ui)
and [reference](https://developers.openai.com/plugins/reference). No direct
camera URL request or unrelated API-key setup was introduced.

## Contract

`CameraLabWidget` accepts `scenario`, `capabilityPolicy`, and `onscenario`.
Scenario options are exported as `CAMERA_SCENARIOS` (`value`, `label` pairs):
loading, connecting, snapshot, live, fallback, error, unsupported. The visible
live label is **Simulated live**. Capability options are `CAMERA_CAPABILITIES`:
native, unsupported, denied. Invalid policy restricts native display support.

All media is a code-native calibration pattern. A persistent local canvas
captures into one persistent video element; there is no device, recording,
printer image, URL, host bridge, peer connection, or network acquisition. FPS
comes only from advancing presented/decoded video frames spanning a second.
Stale evidence clears FPS and stops claiming playback; startup is bounded to
five seconds. Fullscreen/PiP operations leave video/stream/track identity intact.
Unsupported restricts native capabilities while allowing local CSS fullscreen;
denied reports an explicitly simulated failure without calling the native API.

## Author evidence

Commands actually run with pinned Bun 1.3.12:

- `bun install --frozen-lockfile` in app and UI.
- `bun x svelte-kit sync` and `bun x svelte-check --tsconfig ./tsconfig.json`:
  zero errors/warnings after correcting one test-only DOM type.
- `bun run scripts/build-camera-harness.ts`.
- `bun x vitest run src/lib/camera/state.test.ts`: 3 passing tests.
- `bun x playwright test --config camera.playwright.config.ts`: 7 passing
  Chrome tests. Four widths (320/390/590/720) cover all seven states, equal
  card/media geometry, 16:9 media, top-right status, 44-pixel actions, reduced
  motion, measured FPS, native fullscreen and PiP enter/exit, CSS fullscreen
  Escape, simulated rejection, one announcement, non-flow feedback, retained
  media identity, and stopped tracks after unmount. Missing capture support
  reports unavailable and no FPS/PiP. Two additional browser regressions cover
  FPS expiration independently of drawing ticks, a frozen last-frame time,
  five-second post-frame stall termination and the five-second first-frame
  deadline. No nonlocal request occurred.

The harness uses the existing lab's restrictive response CSP without any
`media-src` allowance. Local `srcObject` playback works under that policy.
No policy broadening is needed based on this Chrome evidence. Actual iPhone,
real camera, deployed service and user acceptance remain unverified.

Initial browser tests exposed waiting for `play()` before the first canvas draw
and a three-pixel FPS header growth. Starting the draw loop first and reserving
the full status text block fixed those defects. A native PiP exit assertion
needed to await the real asynchronous state transition on entry and exit.

## Live-camera migration gap (proposal, not accepted implementation)

The production `public/camera-widget.html` still owns host JSON-RPC,
snapshot acquisition/decode, WebRTC session lifetime and display rendering in
one file. `public/camera-dashboard-host.html` translates the same iframe bridge
into private dashboard tool calls. The existing application camera relay,
WebRTC, fan-out and operations-adapter modules remain reusable unchanged.

The proposed split for independent design review is a host-only typed
`lib/host/camera-bridge.ts`, injected-port/timer `lib/camera/session.ts`, one
persistent `lib/media/VideoSurface.svelte`, and a real-source
`lib/camera/CameraWidget.svelte`. The synthetic canvas producer remains lab-only;
production must never consume fixture-specific types or manufacture a live
source. This proposal does not authorize that cutover or rename current files.

Preserve snapshot-first presentation, 10-second tool and 1.5-second decode
deadlines, singleflight/generation retention, one-time private activation,
open/answer/ICE/close sequencing, private metadata boundaries, one video per
mounted camera, one-second measured FPS/1.5-second expiry, eight-second first
frame deadline, five-second rendered-frame stall, three-second disconnect grace,
retained snapshots/fallback, explicit Close cleanup, pagehide/pageshow intent,
same-document fullscreen/PiP and all current/frozen compatibility resources.
Synthetic Chrome evidence does not establish any host, backend, actual device
or live-printer acceptance for that separate migration.

## Remaining acceptance

The shared controls, exact route/directory/title, central Camera icon, strict
AST layers, normal browser harness and explicit two-artifact packaging are now
integrated and recorded in UI-002/ADR0032 and active state/handoff. Freeze source,
obtain independent exact validation/formal review, then guarded delivery and
service verification. Production Camera bytes, MCP/auth and both service
boundaries stay unchanged. Source/browser evidence alone is not device or
live-printer acceptance. The real-session controller remains a separate dormant
source checkpoint, excluded from both lab build graphs and not host-wired.
