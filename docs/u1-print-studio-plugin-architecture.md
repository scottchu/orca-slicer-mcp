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
        | MCP Apps tools/call; no iframe network request
        v
camera session application service
  opaque session -> lease -> bounded answer/ICE/close
        |                                      ^
        | application ports                    | allowlisted offer/answer/ICE
        v                                      |
MCP app-only signaling tools          u1-status camera adapter
  answer / candidates / close         fixed private WebRTC route
        |
        v
browser RTCPeerConnection <====== H264 media ======> webrtc-camerastreamer
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
| Local onboarding | `app/src/cli.ts` and `local-config.ts` | Provides the shared `setup`, `doctor`, and `mcp` contract without environment-file editing |
| Remote transport | `app/src/server.ts` | Terminates Streamable HTTP after the OAuth boundary and invokes the same MCP app |
| Enrollment transport | `app/src/server.ts` | Binds a second loopback-only listener for private health and exact passkey enrollment routes; it exposes no MCP, OAuth token, media, or widget route |
| Identity boundary | `app/src/personal-oauth.ts` | Personal authorization code, PKCE, distinct public assertion/private enrollment origins, token audience, and `u1.monitor` scope |
| ICE credential boundary | `app/src/camera-ice-config.ts` | Reads explicit bounded STUN and derives per-session RFC5766 TURN REST credentials from a server-only shared secret |
| Observation adapter | `app/src/u1-status.ts` | Queries the allowlisted Moonraker status and camera paths and normalizes their response |
| Camera relay application service | `app/src/application/camera-relay.ts` | Owns ticket or direct lease, concurrency, and duration policy without MCP or HTTP types |
| WebRTC session service | `app/src/application/camera-webrtc.ts` | Owns opaque sessions and bounded offer, answer, ICE candidate, expiry, and close semantics |
| Optional media inbound adapter | `app/src/adapters/camera-webrtc-http.ts` | Retains the standalone dashboard's exact ticketed HTTP signaling route over the same application service |
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

The desktop-local and optional HTTP MCP surfaces share status and camera UI
resources, three model-visible read-only tools, and five app-only camera
helpers. Hosted widgets have no external fetch capability; both transports
route snapshots and signaling through the host's MCP Apps bridge.

| MCP member | Semantic category | Result contract |
| --- | --- | --- |
| `show_u1_status` | Observe and present | Text, `U1Status`, and a PNG card; links the HTML resource |
| `get_u1_status` | Observe | Text plus fresh `U1Status`; no UI resource and no image, so widget refresh stays quiet |
| `get_u1_camera_frame` | Observe, app-only | Camera acquisition facts in structured data; JPEG bytes and an optional one-time live activation stay in widget-private result metadata |
| `open_printer_camera` | Observe and present | Reads one relayed snapshot and links the camera-only widget without allocating a stream session |
| `open_u1_camera_stream` | Observe, app-only | After Go Live, consumes the current one-time widget activation and creates an opaque bounded session; offer and session material stay in widget-private result metadata |
| `answer_u1_camera_stream` | Observe, app-only | Accepts one bounded, idempotent WebRTC answer for the active session |
| `add_u1_camera_ice_candidates` | Observe, app-only | Accepts bounded and deduplicated ICE candidate batches |
| `close_u1_camera_stream` | Observe, app-only | Idempotently closes the session and releases its lease |
| `ui://u1-print-studio/status-v4.html` | Presentation resource | Self-contained MCP Apps HTML with empty external CSP domains |
| `ui://u1-print-studio/camera-v2.html` | Presentation resource | Snapshot-first camera-only MCP Apps HTML with capability-gated live and automatic snapshot-fallback states; v1 is a compatibility alias |

`structuredContent` is the stable machine-readable projection. `content` is
what a model or ordinary chat host can consume. Result `_meta` carries
component-private data such as a relayed camera frame or short-lived ICE
credentials. Descriptor `_meta`
links `show_u1_status` and `open_printer_camera` to their UI resources. These fields solve different
problems and must not be conflated.

The normal local-first route is:

```text
Codex desktop -> stdio MCP -> show_u1_status
              -> text + U1Status + PNG + UI resource link
              -> desktop mounts the widget or displays the PNG
              -> Go Live uses MCP Apps tools/call for bounded signaling
              -> connector alone calls the U1's fixed private route
              -> negotiation failure falls back to camera snapshots
```

The optional developer HTTP route is:

```text
Codex/ChatGPT -> public HTTPS -> OAuth + passkey -> Streamable HTTP MCP
              -> show_u1_status
              -> text + U1Status + PNG + UI resource link
              -> host mounts the widget if supported, otherwise shows the PNG
              -> open_printer_camera mounts the snapshot-first camera widget
              -> Go Live calls app-only open_u1_camera_stream once
              -> answer, ICE, and close stay on the MCP Apps tools/call bridge
              -> explicit STUN or derived TURN REST credentials reach both peers
              -> browser and printer negotiate an H264 RTCPeerConnection
```

Passkey enrollment is a separate route graph:

```text
tailnet client -> private Serve HTTPS port -> enrollment-only loopback listener
               -> private health or one-time passkey registration
public Funnel -> public loopback listener -> /auth/enroll* always 404
```

The standalone dashboard may retain the exact `/media/camera.webrtc` HTTP
adapter for development compatibility. Tailscale and personal OAuth remain
optional developer adapters; neither is part of normal setup or packaging and
neither authorizes future control actions merely because login succeeded.

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
- MCP maps a `Go Live` request and its app-only signaling calls to an
  application use case but does not own sessions, leases, concurrency,
  duration, or signaling policy.
- A current widget must mint a one-time activation through the app-only frame
  helper before stream open. Old cached descriptors cannot allocate a lease,
  and an unanswered offer releases its lease after 15 seconds.
- The hosted iframe has empty external CSP domains and never fetches LAN,
  Tailscale, or media signaling URLs directly.
- Public OAuth and MCP use standard HTTPS. Passkey enrollment uses a distinct
  same-hostname, nonstandard private Serve origin and loopback listener; public
  enrollment always rejects.
- ICE defaults empty. Explicit STUN is a disclosed privacy and availability
  dependency. TURN REST derives bounded credentials per camera request; the
  shared secret stays server-side and derived credentials stay model-private.
- The media HTTP adapter knows the exact signaling message allowlist and HTTP
  status codes but not how tickets are issued or which printer route is used.
- The printer adapter performs fixed-route WebRTC signaling and separately
  yields validated snapshot observations; it knows nothing about MCP tools,
  browser URLs, HTTP responses, or relay leases.
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
