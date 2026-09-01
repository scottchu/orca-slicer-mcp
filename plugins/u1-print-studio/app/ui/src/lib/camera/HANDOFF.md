# Synthetic Camera lab checkpoint

This isolated author checkpoint is not registered in the lab routes, packaged,
independently accepted, or deployed. It is not a production-camera migration.

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
