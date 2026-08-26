# U1 Print Studio plugin architecture and ontology mapping

This document explains the current read-only plugin prototype in terms of the
project's stable architecture and ontology. The code is intentionally smaller
than the target architecture. Where it shortcuts an intended boundary, that is
called out rather than presented as finished product structure.

## One plugin, several layers

```text
Codex or ChatGPT host
        |
        | MCP tool call and resource request
        v
inbound MCP adapter
  app.ts + stdio.ts or server.ts
        |
        | current prototype query
        v
read-only observation adapter
  u1-status.ts -> bounded curl -> private Moonraker
        |
        v
normalized U1Status observation
        |
        +--> structuredContent for the model and widget
        +--> text summary for every host
        +--> MCP Apps HTML resource for component-capable hosts
        +--> PNG status projection for any non-component host

user Go Live intent
        |
        | one authenticated MCP call; URL stays in result _meta
        v
camera relay application service
  one-time ticket -> lease -> bounded serial frame iteration
        |                                      ^
        | application ports                    | validated raw JPEG
        v                                      |
exact media HTTP adapter              u1-status camera adapter
  GET /media/camera.mjpeg             fixed private Moonraker route
```

The same observation has multiple representations. The HTML widget and PNG
card are presenters; neither is the printer state itself. MCP is the current
inbound protocol, not the core product boundary.

## Current abstractions

| Abstraction | Current implementation | Responsibility |
| --- | --- | --- |
| Plugin package | `.codex-plugin/plugin.json` | Discovery metadata, skills, and MCP server declaration |
| Inbound adapter | `app/src/app.ts` | Declares tools and resources, maps calls to results, and chooses host representations |
| Local transport | `app/src/stdio.ts` | Runs the MCP server as a desktop-local child process |
| Remote transport | `app/src/server.ts` | Terminates Streamable HTTP after the OAuth boundary and invokes the same MCP app |
| Identity boundary | `app/src/personal-oauth.ts` | Personal authorization code, PKCE, passkey verification, token audience, and `u1.monitor` scope |
| Observation adapter | `app/src/u1-status.ts` | Queries the allowlisted Moonraker status and camera paths and normalizes their response |
| Camera relay application service | `app/src/application/camera-relay.ts` | Owns ticket, lease, concurrency, duration, and serial frame-iteration policy without MCP or HTTP types |
| Media inbound adapter | `app/src/adapters/camera-media-http.ts` | Serves only the exact ticketed multipart MJPEG route and maps HTTP outcomes |
| Ticket codec adapter | `app/src/adapters/camera-ticket-codec.ts` | Issues opaque random ticket material and hashes it for in-memory lookup |
| Domain-shaped projection | `U1Status` | One versioned, timestamped current observation used by all presenters |
| Interactive presenter | `public/widget.html` | Renders and refreshes status in MCP Apps hosts and requests relayed camera frames |
| Static presenter | `status-card-image.ts` | Renders a portable PNG from one `U1Status` snapshot |
| Workflow skills | `skills/` | Guide setup, preparation, authorized start, and monitoring without becoming runtime authority |

The camera relay is the first implemented application service with explicit
transport-independent ports. The important present limitation is that
`app.ts` still calls `readU1Status` directly for telemetry. The prototype has a
typed dependency seam for tests, but it does not yet implement the full
`QueryCurrentPrinterState` application use case, resident monitor, observation
store, or `ObservationSource` port described in the target architecture.

## MCP interface

The remote HTTP MCP surface has one UI resource and exactly four read-only
tools. The desktop stdio surface omits the stream-opening tool because it has no
HTTPS media route and keeps the three status/snapshot tools.

| MCP member | Semantic category | Result contract |
| --- | --- | --- |
| `show_u1_status` | Observe and present | Text, `U1Status`, and a PNG card; links the HTML resource |
| `get_u1_status` | Observe | Text plus fresh `U1Status`; no UI resource and no image, so widget refresh stays quiet |
| `get_u1_camera_frame` | Observe | Camera acquisition facts in structured data; JPEG bytes stay in widget-private result metadata |
| `open_u1_camera_stream` | Observe | Remote-only one-time relay grant; expiry and duration are model-readable while the URL stays in widget-private result metadata |
| `ui://u1-print-studio/status-v3.html` | Presentation resource | Self-contained MCP Apps HTML with only the public media origin in its resource CSP |

`structuredContent` is the stable machine-readable projection. `content` is
what a model or ordinary chat host can consume. Result `_meta` carries
component-private data such as a relayed camera frame. Descriptor `_meta`
links `show_u1_status` to its UI resource. These fields solve different
problems and must not be conflated.

The local route is:

```text
Codex desktop -> stdio MCP -> show_u1_status
              -> text + U1Status + PNG + UI resource link
              -> desktop mounts the widget or displays the PNG
              -> Go Live falls back to get_u1_camera_frame snapshots
```

The cross-device route is:

```text
Codex/ChatGPT -> public HTTPS -> OAuth + passkey -> Streamable HTTP MCP
              -> show_u1_status
              -> text + U1Status + PNG + UI resource link
              -> host mounts the widget if supported, otherwise shows the PNG
              -> Go Live calls open_u1_camera_stream once
              -> widget loads one-time /media/camera.mjpeg URL
```

Tailscale Funnel provides public TLS routing. OAuth authenticates and scopes the
caller. Neither one supplies printer semantics, and neither authorizes future
control actions merely because login succeeded.

## Ontology

The full domain ontology remains larger than this read-only slice:

```text
PreparedPrintJob --authorized Handoff--> PrintSession --targets--> Printer
                                               |
                                               +--> Observation
                                               |      +--> CameraObservation
                                               |
                                               +--> Recommendation
                                               +--> Authorization
                                               +--> CommandIntent
                                               +--> CommandResult
                                               +--> Verification
                                               +--> Outcome
```

The current plugin implements only a narrow view of `Printer` and
`Observation`, plus camera acquisition. Its `U1Status` object is a current-state
projection assembled from several raw Moonraker fields. It is not yet a durable
event, print session, outcome, or verification record.

The process ontology is:

```text
observe -> recommend -> authorize -> act -> verify
                              \
                               administer is a separate surface
```

This plugin currently exposes only **observe**. The setup skill performs local
administrative configuration outside the public MCP tool inventory. The
prepare and start skills describe human-guided workflows, but the app runtime
does not implement Preparation or Control.

## Boundary rules

- Moonraker types stop inside the observation adapter; hosts receive normalized
  status rather than vendor response bodies.
- Printer and camera addresses remain private; the widget never connects to
  them directly.
- MCP maps an authenticated `Go Live` request to an application use case but
  does not own tickets, leases, concurrency, timing, or frame iteration.
- The media HTTP adapter knows multipart framing and status codes but not how
  tickets are issued or which printer route supplies frames.
- The printer adapter yields validated raw JPEG observations but knows nothing
  about MCP tools, browser URLs, HTTP responses, or relay leases.
- OAuth identity and scope answer who may call Monitor. A future upload, start,
  pause, resume, or cancel must still have a separate action-specific
  authorization, command intent, adapter result, and post-action observation.
- A tool result, status card, or camera frame is evidence of an observation,
  not proof of physical part acceptance.
- Skills are procedural guidance. They are not application services and do not
  bypass runtime policy.

## Intended next abstraction step

Repeated evidence should justify extracting `QueryCurrentPrinterState` from
the MCP adapter and placing an `ObservationSource` port in front of the current
Moonraker code. That same use case could then serve MCP, HTTP, CLI, or a future
native app without duplicating normalization or safety policy. A resident
monitor and event store come only when subscription, reconnect, freshness, and
multi-turn monitoring behavior are implemented and validated.
