# 0008 — Build the read-only status view before a shared CLI

- Status: partially superseded by 0009
- Date: 2026-08-25
- Owners: project maintainers

## Context

Decision 0007 deferred a shared CLI, MCP server, persistent monitor, and app
backend until repeated skill use proved their value. After reviewing the
Markdown status card, the user explicitly requested a real HTML/CSS status
view, then requested Picture in Picture and a camera-first layout with a live
stream button and an explicit close control. This is a new execution-order
decision.

The visual monitor can be implemented without committing to preparation
automation or printer control. The current printer advertises a WebRTC camera
view and read-only Moonraker telemetry. Official Apps SDK host APIs support
inline, Picture in Picture, and fullscreen display modes.

## Decision

Implement a repo-local, read-only MCP Apps dashboard inside the existing
`u1-print-studio` plugin before building a shared CLI.

The dashboard exposes exactly two tools:

- `show_u1_status` renders the versioned HTML widget with a fresh observation;
- `get_u1_status` returns a fresh read-only observation for adaptive refresh
  without remounting the widget.

Both tools are idempotent and declare read-only, non-destructive annotations.
They can query only fixed Moonraker status and webcam-list routes. They cannot
upload, start, pause, resume, cancel, tune, or send G-code.

The camera occupies the top section. `Go Live` loads only the printer-advertised
WebRTC view; `Close` disconnects the live iframe and returns to snapshot mode.
The widget requests host `pip` or `fullscreen` mode through the supported Apps
SDK display API. It does not cap the camera frame rate; it reports and uses the
printer's advertised target.

This decision supersedes only the app/MCP deferral in decision 0007. The shared
preparation/operations CLI remains deferred until repeated use proves a stable,
valuable command boundary. Preparation and authorized printer control remain
separate from this monitor.

## Consequences

- The user can evaluate the actual monitoring experience before deciding which
  lower-level operations deserve a shared CLI.
- Runtime printer addresses remain in the root `.env` and dynamic widget
  metadata; they are not committed to the plugin or documentation.
- The widget needs host-level validation for camera loading, PiP, fullscreen,
  and repeated tool calls. Static HTML and MCP runtime success do not prove the
  host rendering loop.
- On the current macOS validation host, Bun and Node direct local-network
  sockets fail while system `curl` succeeds. The prototype therefore invokes
  `curl` without a shell and with fixed read-only routes. This is a provisional
  environment adapter, not a public CLI or portable network conclusion.
- Persistent background monitoring, subscriptions, reconnect resync, and
  notifications remain unimplemented.

## Validation

Require TypeScript compilation, plugin validation, HTTP and stdio MCP tool
listing, a real read-only status call, widget-resource inspection, standalone
HTML syntax checks, and repository checks. Separately record whether the
Codex-hosted widget, camera, live close control, PiP, fullscreen, and adaptive
refresh were visually exercised.
