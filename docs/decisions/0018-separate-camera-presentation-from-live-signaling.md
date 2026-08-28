# 0018 — Separate printer-camera presentation from live signaling

- Status: accepted for the user-authorized F0 camera-widget slice
- Date: 2026-08-28
- Owners: project maintainers

## Context

The status widget already contains snapshot and WebRTC behavior, but a mounted
host failure is hard to distinguish from status-card layout, MCP resource, or
camera transport failure. The existing model-visible
`open_u1_camera_stream` name also exposes one implementation mode as the user
intent. Opening the printer camera should present one camera surface; snapshot,
live video, and degraded fallback are states within that surface.

The private standalone dashboard can render live video, while mounted Codex and
ChatGPT widgets have not yet done so. The current personal deployment advertises
only host ICE candidates and one explicit STUN server; no TURN service is
configured. A focused widget improves isolation and diagnostics but cannot by
itself prove or repair cross-network WebRTC traversal.

## Decision

- Add `ui://u1-print-studio/camera-v1.html` as a self-contained camera-only MCP
  Apps resource. It reuses the current status widget's camera component markup,
  styling, icon-only Go Live and Close actions, mode pill, and
  loading/snapshot/live/fallback/unavailable states without the printer status
  and progress sections.
- Add model-visible `open_printer_camera` as the presentation command. It reads
  one relayed snapshot and links the camera resource. It does not allocate a
  WebRTC session.
- Make `open_u1_camera_stream` app-only. The widget invokes it only after the
  user chooses Go Live. Offer, answer, ICE candidate, and close operations
  remain read-only MCP Apps bridge calls with no direct widget fetch.
- Keep `get_u1_camera_frame` model-visible and data-only so callers can request
  a camera observation without mounting another component. The remote Monitor
  inventory therefore remains exactly four model-visible tools and now has
  exactly four app-only camera signaling helpers.
- Add `/dashboard/camera` to the explicitly enabled private dashboard process.
  Its host bridge mounts the exact same `camera-widget.html` served by the MCP
  resource. `/dashboard/camera` and `/camera-widget` remain absent from the
  ordinary server when dashboard mode is not composed.
- Keep external MCP resource CSP domains empty. The widget receives snapshots,
  offers, short-lived ICE credentials, answers, candidates, and close results
  only through `tools/call`.
- Preserve the existing combined status widget for compatibility. The focused
  camera resource is owned by `open_printer_camera`; this slice does not remove
  camera presentation from status cards retained by existing tasks.

This decision supersedes decision 0014 only where it made
`open_u1_camera_stream` model-visible, and extends decisions 0016 and 0017
without changing their local-first, authentication, enrollment, or TURN
boundaries.

## Consequences

- Models express the stable user intent—open the printer camera—without
  selecting a transport mode.
- Opening the camera always has a portable snapshot result. A live session is
  created only by an explicit widget interaction and is closed on Close,
  fallback, failure, or page exit.
- The additional app-only helper is an intentional interface change, not a new
  model capability. No printer control, generic proxy, or caller-selected media
  URL is introduced.
- The focused private route can isolate bridge, snapshot, negotiation, playback,
  and fallback stages. Success there is private-browser evidence only; it does
  not prove mounted Codex or ChatGPT playback.
- Live state requires an actually rendered browser video frame, not merely an
  `ontrack` callback or connected peer. Playback rejection, no first frame,
  track termination, video error, or stall closes the bounded session and
  activates snapshot fallback.
- With no configured TURN service and host-only printer candidates, mounted
  playback may still fall back to snapshots. A real relay allocation and
  mounted-host rendering remain separate acceptance gates.

## Validation

Require local TypeScript, Bun, bundle, plugin, repository, and whitespace checks
plus fixture tests that prove:

- `open_printer_camera` is model-visible, links only the camera resource, and
  returns a relayed snapshot without allocating a camera session;
- `open_u1_camera_stream` and answer, candidate, and close helpers are app-only;
- the inventory is exactly four model-visible and four app-only read-only tools;
- the camera resource has empty external CSP domains and contains no direct
  network fetch or caller-selected URL;
- `/dashboard/camera` mounts the same camera asset and both focused routes are
  absent when dashboard mode is disabled;
- snapshot hydration, explicit Go Live, bounded close, and automatic 1500 ms
  snapshot fallback remain present in the widget contract; and
- the focused widget camera-section markup stays identical to the current
  status widget camera section, while a rendered-frame gate prevents a blank
  video surface from being labeled Live.

Record source/software evidence separately from private-browser playback,
mounted-host playback, live TURN allocation, real-printer behavior, and user
outcome.
