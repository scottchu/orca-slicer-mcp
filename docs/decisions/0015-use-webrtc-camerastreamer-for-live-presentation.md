# 0015 — Use `webrtc-camerastreamer` for live camera presentation

- Status: accepted for the read-only prototype
- Date: 2026-08-26
- Owners: project maintainers

## Context

Decision 0014 called a serial relay of independent JPEG snapshots a continuous
camera presentation. That removed per-frame MCP calls but did not implement the
streaming behavior requested by the user, and its low effective frame rate was
not comparable with Fluidd's WebRTC view. The Snapmaker U1 advertises a
same-origin `webrtc-camerastreamer` signaling route and returns an H264 offer.

The component still must not receive a private printer URL, printer peer ID, or
generic proxy capability. Camera viewing remains read-only, explicitly opened,
bounded, and independently closable.

## Decision

- Keep the one-time grant, lease, concurrency, expiry, and duration policy in
  `application/camera-relay.ts`.
- Add a transport-independent WebRTC signaling port for offers, answers, ICE
  candidates, and session release.
- Keep the printer-specific signaling exchange in `u1-status.ts`, restricted to
  the advertised same-origin route for service `webrtc-camerastreamer`.
- Expose only exact `POST`, `DELETE`, and CORS preflight behavior at
  `/media/camera.webrtc`. The adapter accepts a small allowlist of signaling
  messages, binds them to a server-held printer peer ID, and is not a generic
  Moonraker proxy.
- The widget creates a receive-only `RTCPeerConnection`, presents its video
  track in a `<video autoplay muted playsinline>` element, answers the
  keepalive data channel, and closes the peer and signaling lease together.
- Measure frames actually presented by the browser with
  `requestVideoFrameCallback`, with playback-quality counters as a fallback.
- Retain `get_u1_camera_frame` only as explicit snapshot mode and degraded live
  fallback. It is not the live transport.

This supersedes the snapshot-iteration transport in decision 0014 while
preserving its authentication, privacy, application-boundary, and read-only
constraints.

## Consequences

- Live media is a persistent H264 WebRTC stream rather than repeated JPEG
  downloads.
- The application server carries signaling but not video frames. The browser
  must be able to reach at least one ICE candidate advertised by the printer;
  a remote client without LAN or subnet-router reachability may require TURN in
  a later deployment design.
- Independent decoder measurements can vary and do not prove mounted-browser
  performance. The UI reports observed presentation FPS instead of a target or
  marketing claim.
- Snapshot fallback remains lower-rate by design and is labeled separately.

## Validation

Require TypeScript compilation and tests for ticket exchange, replay rejection,
offer-ID privacy, answer and ICE forwarding, session release, exact route and
CORS behavior, widget peer negotiation, actual-frame FPS measurement, and the
absence of the old JPEG parser and `/media/camera.mjpeg` route.

Exercise a real H264 offer and decoded frames against the printer without
retaining media. Verify mounted desktop and iOS rendering separately because
protocol success does not prove either host outcome.
