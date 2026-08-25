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

## Host-loop repair attempt

A later same-day Codex thread called `show_u1_status` through the host's
programmatic tool wrapper. The tool returned model-readable telemetry but no
mounted component. Inspection found that the standard `_meta.ui.resourceUri`
was present on the tool descriptor, while the OpenAI compatibility
`openai/outputTemplate` key was incorrectly returned as result metadata instead
of being advertised on the descriptor.

The render tool now advertises both descriptor keys and result metadata contains
only the camera routes intended for the widget. Four Bun tests cover tool
annotations and template discovery, MCP App resource MIME and CSP, model-visible
status plus widget-only camera metadata, and the camera-first snapshot, live,
close, refresh, PiP, and fullscreen paths. TypeScript compilation, bundling,
plugin validation, repository validation, and the tests passed.

The refreshed installed stdio bundle listed both tools, advertised both template
keys, served the MCP App resource, returned current `complete` telemetry, and
reported both snapshot and stream routes. Separate read-only camera probes
returned HTTP 200 for a `1920x1080` JPEG snapshot and HTTP 200 for the advertised
stream page.

This existing conversation remained bound to its pre-refresh programmatic tool
surface and did not mount the component. A later call through that stale surface
also reported a telemetry transport failure while the exact refreshed installed
bundle succeeded. The in-app browser inventory was empty, so visual browser QA
could not be substituted. The installed fix therefore has stronger static,
protocol, and real-endpoint evidence, but a new conversation with a direct MCP
App tool call is still required before claiming that the card, live camera, or
controls render in Codex.

## Mobile and camera transport repair

The user then reported that the local card appeared on desktop but not iOS and
that the live camera was unavailable even in the desktop widget. This separated
two failures: the component needed a narrow-viewport layout, while the local
stdio MCP process and private LAN camera origin were not a cross-device media
path.

Decision 0009 replaced direct private-LAN image and iframe loading with a
server-relayed camera frame. `get_u1_camera_frame` resolves only the
printer-advertised same-origin snapshot route, fetches a bounded JPEG, validates
its signature, and returns the data URL only in widget-private result metadata.
The widget's external CSP allowlists are now empty. Its user-started near-live
loop waits 1.5 seconds after each completed frame request and stops on `Close`;
it is not described as the advertised 15 FPS WebRTC stream.

The same widget now uses `viewport-fit=cover`, dynamic viewport height, CSS and
host-provided safe-area insets, 44-pixel touch targets, compact one-column
metrics below 380 pixels, and intrinsic-height notification. Official plugin
guidance supports mobile inline cards, but actual iOS use still needs an
authenticated reachable MCP backend. Secure MCP Tunnel is the current private
connectivity candidate; it was not configured during this repair.

TypeScript compilation passed. Ten Bun tests with 52 assertions passed for
tool/resource metadata, the relayed-frame privacy contract, same-origin and
protocol rejection, the near-live loop, iPhone layout contracts, and host
display APIs. A direct real-camera call returned a valid JPEG data URL, and the
bundled stdio server returned current `complete` status plus a relayed JPEG of
148,023 bytes after bounded retry. The camera endpoint was observed to time out
intermittently and sometimes kept a chunked JPEG response open. Route caching,
one retry, and first-complete-JPEG stream parsing were added; the live loop
remains non-overlapping.

The tested marketplace source was cache-busted and reinstalled as
`0.2.0+codex.20260825142747`. An exact installed-cache stdio smoke listed all
three tools, served `status-v2` with the MCP App MIME type and empty external
CSP lists, confirmed the mobile and relay source contracts, returned reachable
printer telemetry, and returned a valid 148,142-byte JPEG data URL in private
camera-frame metadata.

The in-app browser was unavailable. Two bounded local headless-Chrome render
attempts also failed to produce screenshots and their spawned processes were
stopped. Therefore desktop appearance, iOS appearance, actual image rendering,
PiP, fullscreen, and mounted interaction remain unverified host evidence.
