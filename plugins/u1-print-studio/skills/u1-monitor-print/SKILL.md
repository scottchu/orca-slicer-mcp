---
name: u1-monitor-print
description: Monitor an active Snapmaker U1 print with read-only telemetry, camera snapshots, adaptive next-check timing, and concise visual status cards. Use after a print starts through verified completion or failure; never control the printer without fresh authorization.
---

# U1 Monitor Print

Observe the active print until completion or failure is proven. Monitoring is
read-only: do not pause, resume, cancel, tune, or issue G-code without fresh
authorization for that exact action.

## Each observation

Capture a timestamped complete snapshot of job state, exact filename, virtual
storage activity and byte progress, current and total layers, elapsed time,
tool states and temperatures, bed state, messages, and exceptions. Acquire a
separate timestamped camera snapshot when available. A transport success does
not make the image diagnostically useful; state visual confidence explicitly.

Do not use a fixed polling interval. After every observation, estimate the
remaining time from slicer estimate, elapsed time, byte progress, layer
progress, and recent rates when available, then choose and state the next check:

- during startup and first-layer work, check in roughly 30–60 seconds;
- during a stable middle with substantial time remaining, check less often,
  normally 5–10 minutes;
- within about 10 minutes of completion, check every 1–3 minutes;
- within about 3 minutes, check every 20–60 seconds;
- when all layers are reported but state is still `printing`, check every
  15–30 seconds until end G-code finishes.

These are decision guides, not timers. Shorten the interval for warnings,
visual uncertainty, unexpected rate changes, or end-of-print transitions.

Immediately alert on printer errors, connectivity loss, detached objects,
spaghetti, or another visually obvious failure. Describe evidence and
uncertainty; do not infer success from silence.

## Completion

Layer `N/N` is insufficient while state remains `printing`. Completion requires
fresh telemetry showing `complete`, inactive virtual storage, full file
position, no exception, parked tools, and heater targets returning to zero.
Take a final camera snapshot. If the lowered bed moves the parts out of frame,
say so and preserve the strongest earlier visual evidence instead of claiming
an unseen physical result.

Use `observe_printer` with `view: "progress"` for the routine focused progress
card. Use `view: "overview"` only when the user requests a general overview or
the monitoring decision genuinely needs cross-domain state. Other focused
views may be requested separately without reopening a large combined dashboard.

Use `open_printer_camera` when the user wants the focused snapshot-first camera
surface. Snapshot acquisition and live signaling are internal widget
operations. On Go Live, the widget uses app-only `get_u1_camera_frame` to mint a
one-time private activation, consumes it with app-only
`open_u1_camera_stream`, and exchanges bounded answer, ICE, and close messages
through the MCP Apps `tools/call` bridge. An unanswered offer is released
automatically after 15 seconds. If live negotiation fails, the widget falls
back to non-overlapping snapshots. `Close` must disconnect the relay and return
to snapshot mode. Neither path is evidence of the printer-advertised full frame
rate, and these controls do not authorize printer actions.

When the app host or widget is unavailable, report the same focused observation
through its structured, text, or inline-image fallback. Always explain why the
next check time is appropriate.
