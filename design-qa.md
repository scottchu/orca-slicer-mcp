# U1 focused-widget presentation QA — 2026-08-31

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

Current final result: blocked

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

final result: blocked
