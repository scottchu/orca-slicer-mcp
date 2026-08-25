# U1 status view prototype

- Date: 2026-08-25
- Evidence type: chronological implementation journal
- App archetype: interactive, decoupled MCP Apps widget
- Scope: read-only monitoring only

## User-directed sequence

1. The Markdown status card was accepted as information but identified as not
   being HTML.
2. The user requested a real HTML/CSS interactive, automatically updating
   plugin view.
3. The user asked whether Picture in Picture was supported. Official Apps SDK
   reference material confirmed that the host display API accepts `pip` as well
   as inline and fullscreen modes.
4. The user requested the camera as the top section, an overlaid `Go Live`
   control for live viewing, and a `Close` control after connection.
5. The user reported hardware encoding capable of 30 FPS. The current camera
   advertisement remained 15 FPS during this run. The UI was designed not to
   impose a fixed cap, so a later advertised 30 FPS target requires no UI
   change. Hardware capability itself was not benchmarked.

## Implementation

The existing `u1-print-studio` plugin was extended with a TypeScript MCP Apps
server and a dependency-free HTML/CSS/JavaScript widget. The widget renders a
camera-first dashboard, progress, layers, active physical tool, tool and bed
temperatures, elapsed and estimated remaining time, freshness, adaptive next
check, manual refresh, automatic refresh, PiP, and fullscreen.

The server exposes `show_u1_status` as the render tool and `get_u1_status` as a
data-only refresh tool. Both are read-only and retry-safe. Camera snapshot and
WebRTC URLs remain widget-only runtime metadata. Dynamic CSP allows only the
configured printer origin for image, connection, and iframe use.

The mounted widget calls only `get_u1_status` and schedules each next read from
the returned recommendation. The live button loads the printer-advertised
WebRTC page. The close button clears the iframe source and returns to snapshot
mode.

## Environment observation

The current macOS host allowed the system `curl` process to reach the private
printer but rejected direct Bun and Node local-network sockets. The server was
changed to launch `curl` with an argument array, no shell, a fixed printer base
from `.env`, fixed read-only routes, and bounded timeouts. No generic URL,
command, or G-code passthrough was added.

Concurrent status and webcam requests could contend and cause the status read
to time out. The adapter was changed to query telemetry first and camera
configuration second. The stdio MCP call then returned the live printer state
and camera availability.

## Validation boundary

TypeScript compilation passed. HTTP MCP initialization, tool listing, resource
reading, and a real read-only status call passed. The plugin stdio command also
listed and called the tools successfully. The widget resource used the MCP Apps
HTML MIME type and included one runtime-only origin in its connect, resource,
and frame CSP lists.

No browser connection was available in this Codex session. The host-rendered
appearance, direct camera snapshot, WebRTC iframe, close transition, PiP,
fullscreen, and repeated mounted-widget refresh still require visual host-loop
validation. This is not inferred from source or MCP success.
