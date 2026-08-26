# Snapmaker U1 status-card theme QA

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
