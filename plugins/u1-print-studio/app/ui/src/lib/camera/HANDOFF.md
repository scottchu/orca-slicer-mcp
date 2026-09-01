# Synthetic Camera lab checkpoint

The synthetic Camera is integrated as a separate private lab candidate, not
yet independently accepted or deployed. It is not a production-camera migration.

## Current integrated candidate (2026-09-01)

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
Current outputs:748,482 observation+78,551 Camera=827,033 aggregate.
No cap bypass, external asset or production change is included. Camera's build
graph rejects Three, host/observation/bed-mesh code and the real session module.
The ship guard maps the exact Camera route to its own generated artifact hash.

Actual author checks so far:155UI units and compiler/AST pass;277app tests /
3,223assertions pass; isolated7Chrome lifecycle cases pass;9Camera-route cases
pass including56state/width/text combinations, glyph containment/non-overlap,
state geometry, top-right normal status, URL/reset/history/hostile input and
loading without an active stream. Full suite, deterministic rebuild, repository
gates, records, exact freeze/review and guarded delivery remain to finish.
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

## Integration still required

- Integrate the shared `LabControls` registry and exact private Camera route,
  directory link and first-title bootstrap. Do not add another control toolbar.
- Replace the temporary direct Camera glyph import in `CameraLabWidget` with
  the shared central `Icon` registry's camera name.
- Register the composite's closed imports and exact leaf tag multisets in the
  AST frontier. Full `bun run check` is intentionally not claimed yet.
- Merge the isolated browser harness build into normal browser validation or
  explicitly include its config/script in required gates.
- Measure the joint deterministic self-contained package against the unchanged
  750,000-byte hard cap; no combined artifact measurement exists yet.
- Update UI-002/ADR0032 and the active iteration/state/handoff records through
  the integration owner before exact independent review and guarded delivery.
- Preserve production camera bytes, MCP/auth and both service boundaries.

This is author synthetic/software evidence only. The shared-control author owns
integration and durable top-level records; no source is copied into a dirty
checkout and no merge/deployment permission is implied by this checkpoint.
