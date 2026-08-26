# U1 status-view knowledge

- Derived from: [2026-08-25 status-view prototype](../logs/2026-08-25-u1-status-view-prototype.md)
  and [continuous camera relay](../logs/2026-08-25-u1-continuous-camera-relay.md)
- Status: provisional from one implementation and MCP runtime pass
- Promotion gate: exercise the mounted widget in Codex across printing,
  finishing, complete, offline, camera failure, and reconnect states

## Stable boundaries

- Monitoring is read-only. Rendering and refresh tools must never expose
  upload, start, pause, cancel, tuning, arbitrary URL, or G-code behavior.
- `show_u1_status` owns widget creation. `get_u1_status` owns a fresh data
  snapshot without a template so repeated refresh does not remount the widget.
- `structuredContent` contains concise model-visible telemetry. Camera bytes
  and one-time media URLs remain in widget-only result metadata.
- The widget resource uses `text/html;profile=mcp-app`, a versioned URI, and a
  runtime CSP restricted to the public relay origin, never the printer origin.
- The remote HTTP surface adds `open_u1_camera_stream`; local stdio omits it
  because it has no HTTPS media route. The tool's model-readable result carries
  only expiry and duration while `_meta` carries the one-time URL.
- Ticket, lease, concurrency, and duration belong to an application service
  without MCP or HTTP dependencies. Allowlisted WebRTC signaling stays in the
  printer adapter, and the media adapter serves only exact `POST` and `DELETE
  /media/camera.webrtc` without exposing the printer peer ID.
- PiP and fullscreen are host display modes for the whole widget. `Go Live`
  makes one MCP call, negotiates an H264 RTCPeerConnection, and reports browser-
  presented FPS; if that fails, the old non-overlapping snapshot loop is the
  fallback.
- Closing live view removes the media source and returns to snapshot mode. It
  does not affect the printer camera service.
- Every `show_u1_status` result carries a portable PNG. `get_u1_status` remains
  data-only so adaptive widget refresh does not add image results.

## Current environment findings

- The current camera advertises `webrtc-camerastreamer`, a snapshot route, a
  WebRTC signaling route, and a 15 FPS target. A real offer negotiated H264 and
  produced video frames over a persistent peer connection. Independent
  software-decoder measurements varied from 0.2 to 24.8 FPS, so only the
  browser-presented counter should be treated as the current viewing FPS.
- On the current macOS host, direct Bun and Node local-network sockets failed
  while system `curl` succeeded. The provisional adapter executes `curl` with
  an argument array, no shell, fixed routes, and timeouts.
- Starting telemetry and webcam requests concurrently could cause telemetry to
  time out. Query telemetry first; treat webcam discovery failure as a camera
  degradation, not a printer-offline result.
- Reuse the 20-second first camera attempt plus one 10-second retry on this
  environment. A provisional 3+3-second continuous-source budget failed its
  first two-frame proof, while the established budget later delivered two
  complete JPEGs over one connection in 1.9 seconds and repeated after cleanup
  in 2.6 seconds. This is environment evidence, not a universal camera timeout.
- The completion snapshot can be visually weak after the build plate lowers.
  Keep telemetry completion distinct from physical acceptance.

## Adaptive refresh

The server recommends the next refresh from state, progress, estimated
remaining time, and exception presence. The mounted widget owns the timer and
can pause or manually refresh. It calls only `get_u1_status`.

This remains polling, not persistent monitoring. It does not implement ordered
subscriptions, freshness epochs, reconnect resynchronization, notifications,
or an always-on host.

## Unverified host behavior

- the fresh remote four-tool inventory after plugin reinstall;
- continuous relay rendering and snapshot fallback inside Codex;
- `Go Live` connection success and `Close` teardown inside Codex;
- PiP and fullscreen layout behavior;
- repeated adaptive refresh without remounting;
- accessibility and responsive appearance in the actual desktop host;
- mounted iOS behavior and real-host access-token renewal.
