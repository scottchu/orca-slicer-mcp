# U1 status-view knowledge

- Derived from: [2026-08-25 status-view prototype](../logs/2026-08-25-u1-status-view-prototype.md)
- Status: provisional from one implementation and MCP runtime pass
- Promotion gate: exercise the mounted widget in Codex across printing,
  finishing, complete, offline, camera failure, and reconnect states

## Stable boundaries

- Monitoring is read-only. Rendering and refresh tools must never expose
  upload, start, pause, cancel, tuning, arbitrary URL, or G-code behavior.
- `show_u1_status` owns widget creation. `get_u1_status` owns a fresh data
  snapshot without a template so repeated refresh does not remount the widget.
- `structuredContent` contains concise model-visible telemetry. Camera routes
  remain in widget-only metadata.
- The widget resource uses `text/html;profile=mcp-app`, a versioned URI, and a
  runtime CSP restricted to the configured printer origin.
- PiP and fullscreen are host display modes for the whole widget. The live
  camera remains a separate WebRTC connection inside the camera-first section.
- Closing live view clears the iframe source and returns to snapshot mode. It
  does not affect the printer camera service.
- The view does not impose a camera frame-rate cap. It reports the target
  advertised by the printer and lets WebRTC negotiate the actual stream.

## Current environment findings

- The current camera advertises `webrtc-camerastreamer`, a snapshot route, a
  WebRTC view, and a 15 FPS target. The user's hardware encoder may support 30
  FPS, but 30 FPS was not advertised or benchmarked in this run.
- On the current macOS host, direct Bun and Node local-network sockets failed
  while system `curl` succeeded. The provisional adapter executes `curl` with
  an argument array, no shell, fixed routes, and timeouts.
- Starting telemetry and webcam requests concurrently could cause telemetry to
  time out. Query telemetry first; treat webcam discovery failure as a camera
  degradation, not a printer-offline result.
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

- direct private-LAN image loading from the hosted widget;
- mixed-content and local-network policy for the WebRTC iframe;
- `Go Live` connection success and `Close` teardown inside Codex;
- PiP and fullscreen layout behavior;
- repeated adaptive refresh without remounting;
- accessibility and responsive appearance in the actual host.
