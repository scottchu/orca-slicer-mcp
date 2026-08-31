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
        | explicit refresh or cached current observation
        v
shared observation store
  observation-store.ts
        |
        +--> coalesced due refresh -> u1-status.ts
        |                         -> bounded curl -> private Moonraker
        |
        +--> stale retained snapshot + connection epoch
        v
focused observation projector
  observation-presentation.ts
        |
        +--> one requested observation-v2 Instrument Strip
        +--> matching structuredContent and text summary
        +--> frozen legacy status projection for retained tasks

user Go Live intent
        |
        | MCP Apps tools/call; no iframe network request
        v
camera session application service
  opaque session -> lease -> bounded answer/ICE/close
        |                                      |
        | application ports                    | private upstream signaling
        v                                      v
MCP app-only signaling tools        server-terminated fan-out
  answer / candidates / close       one U1 peer -> viewer tracks
        |                                      ^
        v                                      |
browser RTCPeerConnection <==== H264 media ====+
                                               |
                                    u1-status camera adapter
                                    fixed private WebRTC route
                                               |
                                               v
                                    webrtc-camerastreamer
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
| Shared observation store | `app/src/observation-store.ts` | Owns the current snapshot identity, explicit due refresh, concurrent-read coalescing, stale retention, and connection epochs |
| Focused projector | `app/src/observation-presentation.ts` | Produces exactly one requested read-only module plus the shared observation envelope and explicit evidence states |
| Camera relay application service | `app/src/application/camera-relay.ts` | Owns ticket or direct lease, concurrency, and duration policy without MCP or HTTP types |
| WebRTC session service | `app/src/application/camera-webrtc.ts` | Owns opaque sessions and bounded offer, answer, ICE candidate, expiry, and close semantics |
| Camera fan-out service | `app/src/application/camera-fanout.ts` | Terminates one private H264 printer peer, creates independent downstream viewer peers, and owns shared-upstream release |
| Optional media inbound adapter | `app/src/adapters/camera-webrtc-http.ts` | Retains the standalone dashboard's exact ticketed HTTP signaling route over the same application service |
| Ticket codec adapter | `app/src/adapters/camera-ticket-codec.ts` | Issues opaque random ticket material and hashes it for in-memory lookup |
| Adapter-shaped status | `U1Status` | Normalized input captured by the shared observation store; not itself the public focused schema |
| Interactive observation presenter | `public/widget.html` | Renders one observation-v2 Instrument Strip and requests only app-private refresh for its selected view |
| Interactive camera presenter | `public/camera-widget.html` | Renders the separate camera-v4 snapshot-first Instrument Strip and owns Go Live, Close, retry, and fallback |
| Frozen compatibility presenters | `public/legacy-widget.html` and `legacy-camera-widget.html` | Preserve exact former status-v4/v3 and camera-v3/v2/v1 bytes for retained mounted tasks |
| Static presenter | `status-card-image.ts` | Renders a portable PNG from one `U1Status` snapshot |
| Workflow skills | `skills/` | Route focused one-shot observation through `u1-observe-printer` and guide setup, monitoring, preparation, and authorized start without becoming runtime authority |

The store implements the bounded current-state portion of
`QueryCurrentPrinterObservation`: after initial acquisition, plain reads are cache-only, explicit refresh
captures upstream only when the shared snapshot is due, concurrent callers
coalesce onto one read and observation identity, and failed/offline refreshes
retain the last reachable values as stale with their original source time.
This is not yet the decision-0006 resident subscription monitor, durable event
history, or full reconnect bootstrap; those remain later architecture gates.

## MCP interface

The desktop-local and optional HTTP MCP surfaces expose exactly two
model-visible presentation intents and eight hidden app-only helpers: one
focused refresh, two frozen-status compatibility aliases, and five camera
frame/signaling calls. Hosted widgets have no external fetch capability; both
transports route observation refresh and camera signaling through the host's
MCP Apps bridge.

| MCP member | Semantic category | Result contract |
| --- | --- | --- |
| `observe_printer` | Observe and present, model-visible | Requires one closed view from overview, progress, thermals, heads, jobs, queue, fans, or bed_mesh; returns one observation-v2 projection |
| `open_printer_camera` | Observe and present, model-visible | Reads one relayed snapshot and links a fresh camera-v4 camera-only presentation without allocating a stream session |
| `refresh_printer_observation` | Observe, app-only | Refreshes the mounted strip through the same store and projector without opening another widget |
| `show_u1_status` | Observe and present, app-only compatibility | Frozen retained-card alias returning the prior status payload, PNG, and status-v4 resource |
| `get_u1_status` | Observe, app-only compatibility | Frozen retained-card refresh alias returning the prior status payload without a new presentation |
| `get_u1_camera_frame` | Observe, app-only | Camera acquisition facts in structured data; JPEG bytes and an optional one-time live activation stay in widget-private result metadata |
| `open_u1_camera_stream` | Observe, app-only | After Go Live, consumes the current one-time widget activation and creates an opaque bounded session; offer and session material stay in widget-private result metadata |
| `answer_u1_camera_stream` | Observe, app-only | Accepts one bounded, idempotent WebRTC answer for the active session |
| `add_u1_camera_ice_candidates` | Observe, app-only | Accepts bounded and deduplicated ICE candidate batches |
| `close_u1_camera_stream` | Observe, app-only | Idempotently closes the session and releases its lease |
| `ui://u1-print-studio/observation-v2.html` | Current observation resource | Self-contained focused Instrument Strip with empty external CSP domains; observation-v1 is a current-asset alias |
| `ui://u1-print-studio/camera-v4.html` | Current camera resource | Separate focused snapshot-first camera strip with repeated-open identity, capability-gated live, and privacy-safe fallback diagnostics |
| `ui://u1-print-studio/status-v4.html` and `status-v3.html` | Frozen status resources | Exact former large-card bytes for mounted-task compatibility only |
| `ui://u1-print-studio/camera-v3.html`, `camera-v2.html`, and `camera-v1.html` | Frozen camera resources | Exact former camera bytes for mounted-task compatibility only |

`structuredContent` is the stable machine-readable projection. `content` is
what a model or ordinary chat host can consume. Result `_meta` carries
component-private data such as a relayed camera frame or short-lived ICE
credentials. Descriptor `_meta`
links `observe_printer` and `open_printer_camera` to their current UI resources.
Legacy aliases link only retained tasks to frozen resources. These fields solve different
problems and must not be conflated.

The normal local-first route is:

```text
Codex desktop -> stdio MCP -> observe_printer(view)
              -> shared store -> one focused structured projection
              -> desktop mounts observation-v2
              -> app-only refresh returns the same selected projection
              -> open_printer_camera mounts camera-v4 separately
              -> Go Live uses MCP Apps tools/call for bounded signaling
              -> connector terminates one private H264 U1 peer
              -> connector fans cloned RTP into independent viewer peers
              -> negotiation failure falls back to camera snapshots
```

The U1 is never the widget's WebRTC peer. Printer SDP, candidates, ICE
credentials, peer IDs, routes, and errors stop at the private operations
adapter. Each downstream viewer receives a server-owned offer and its own ICE
credentials. The runtime adds discovered Tailscale host addresses to downstream
candidate gathering so a tailnet-connected viewer may connect directly; TURN
is an optional fallback. `U1_CAMERA_MAX_VIEWERS` defaults to 16 and accepts only
1 through 64. Closing the final viewer closes the single printer upstream.

The optional developer HTTP route is:

```text
Codex/ChatGPT -> public HTTPS -> OAuth + passkey -> Streamable HTTP MCP
              -> observe_printer(view)
              -> text + focused structured projection + observation-v2 link
              -> open_printer_camera mounts the snapshot-first camera-v4 widget
              -> Go Live calls app-only open_u1_camera_stream once
              -> answer, ICE, and close stay on the MCP Apps tools/call bridge
              -> connector terminates one private H264 printer peer
              -> connector issues separate ICE credentials and a downstream offer
              -> browser negotiates an H264 RTCPeerConnection with the connector
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

The current plugin implements a narrow shared current observation of `Printer`
plus separately timestamped camera acquisition. `U1Status` normalizes raw
Moonraker fields; the store adds freshness, connection epoch, and session
provenance; observation-v2 projects one selected module. None is yet a durable
event, correlated print session, outcome, or verification record.

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
- Focused projectors never call Moonraker. They consume one store snapshot and
  preserve observation version, source time, receive time, freshness,
  connection epoch, session provenance, and capability evidence.
- Cavity, material/color, history, queue, fan/purifier, and bed-mesh objects
  remain advertised or unknown until their live read-only mappings are accepted.
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

Map the still-advertised live domains through explicit read-only adapter
fixtures, then add accepted focused projectors for jobs/history, queue,
fans/purifier, and bed mesh. Compose overview only after every focused module
passes. A resident monitor and event store come later, when subscription,
reconnect bootstrap, durable history, and multi-turn monitoring are implemented
and validated; the current explicit-refresh store does not claim those outcomes.
