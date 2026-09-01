# 0031 — Unify U1 widget presentation and bound camera bootstrap

Date: 2026-08-31

Status: accepted for source validation; not yet shipped

## Decision

All current focused observation resources and the camera resource use one
versioned, locally injected CSS source with the same card, header, body, footer,
data-row and action anatomy. The self-contained resources make no stylesheet or
icon-network request. The Progress card keeps its headline result in the header
grid at mobile widths; information remains above bottom actions.

Camera bootstrap permits one in-flight acquisition and must accept and decode a
snapshot or terminate as unavailable within twelve seconds. A retained snapshot
survives failed, late and out-of-order work. Remounted live intent first restores
a truthful snapshot, then makes one bounded live attempt. Same-document
fullscreen changes presentation only and do not recreate the peer, track or
frame observer. Feedback is an in-media toast below the camera controls.

Bed Mesh uses exact-pinned, locally bundled Three.js and OrbitControls for the
orthographic 3D view, with an exact SVG 2D fallback. The committed generated
bundle is reproducible and checked against its source build. Its served bytes
retain the complete upstream MIT copyright, permission and notice text rather
than depending on a build-machine `node_modules` license file.

## Boundaries

- This does not add printer controls, routes, tools, authorization, or recording.
- Existing normalized observation data and adapter boundaries remain unchanged.
- Source and simulator tests do not prove browser/device rendering or physical
  printer behavior.

## 2026-09-01 accepted addendum — compact density and resilient display lifecycle

Every observation card and the camera now use the same width-tokenized compact
anatomy at 320, 390, 590 and 720 pixels. Header, body and actions-only footer
each own exactly one inset; cards have content-driven height, while controls,
camera media and Bed Mesh remain deliberately bounded. Overview stays two
columns from 390 pixels upward, Heads remains two columns through 720 pixels,
and the directory no longer reserves empty tile height. The canonical visible
labels are Overview, Print Progress, U1 Camera, Thermals, Heads & Filaments,
Current Job, Job History, Print Queue, Fans & Air and Bed Mesh. Stable selector
and tool identities, including `queue`, do not change.

Fullscreen never uses the host display-mode bridge because a host grant may
remount the resource and destroy live-media identity. Hosted and standalone
presentation use same-document native dashboard fullscreen when available and
otherwise use an in-document CSS viewport fallback. Entry and exit make no
camera request and preserve the video node, `srcObject`, peer, track and frame
observer. Pause and stalled events attempt playback recovery without closing
the peer, media track or signaling session; FPS clears until new rendered-frame
evidence recovers it.
The fullscreen dashboard, dedicated camera body and camera form one bounded flex
chain so preserved media also retains a non-zero rendered box. PiP never uses
the host display-mode bridge because mobile hosts may coerce that request to
fullscreen before returning or remount the resource. PiP is offered only when
the existing live video supports same-document native Picture in Picture;
unsupported environments hide the action. Native PiP entry and exit preserve
the video node, `srcObject`, peer, track and frame observer and make no host or
camera request. Host context events reporting PiP or fullscreen do not drive a
synthetic continuity state.
One pagehide/pageshow cycle may restore persisted live intent once, while a
fresh remount retains the existing one-attempt restore bound. Intrinsic-height
notifications follow content or display-mode changes, never FPS-only ticks.

Standalone host document, visible and iframe titles use the same canonical view
labels as their cards, including U1 Camera, Job History and Print Queue.

The addendum advances the source contract to runtime 0.4.8/schema 12,
observation-v14/camera-v10 and 26 resources, retaining observation-v13 and
camera-v9 as current-asset aliases. It changes presentation and camera
lifecycle resilience only; acquisition, printer, authorization, service and
network semantics remain unchanged.

Thermal strips remain at most 64 pixels tall at the four frozen widths. Empty
and Current Job panels are children of the sole `.u1-body` inset owner rather
than owning that inset themselves. Bed Mesh keeps one shared bounded chart frame
for both 2D and 3D modes; this presentation release does not reinterpret or
replace its reported geometry.
