# 0014 — Separate the continuous camera relay from MCP and HTTP

- Status: accepted for the read-only prototype
- Date: 2026-08-25
- Owners: project maintainers

## Context

Decision 0009 replaced direct private-LAN camera URLs with repeated
`get_u1_camera_frame` calls. That path kept the widget portable, but every frame
required a new MCP request and base64 result. The user requested a continuous
read-only camera presentation while preserving MCP as a replaceable inbound
surface and keeping printer-specific behavior behind its adapter.

The standard-HTTPS personal endpoint can serve media from the same authenticated
origin, but an ordinary bearer URL would be easy to replay or leak into model
content. Implementing ticket, lease, concurrency, or iteration policy directly
inside the MCP tool or HTTP request handler would also make transports own
application behavior.

A concurrent host-compatibility change requires `show_u1_status` to retain its
self-contained PNG in both local and remote results. Component mounting and
image fallback remain independent representations of the same observation.

## Decision

Add a provisional continuous camera relay with these boundaries:

- `application/camera-relay.ts` owns short-lived one-time ticket state, lease
  claiming and release, pending and active concurrency limits, maximum stream
  duration, serial frame iteration, and bounded delay between completed reads.
  It depends only on application ports for frame acquisition, ticket coding,
  URL location, time, and waiting; it imports no MCP or HTTP types.
- `u1-status.ts` remains the printer-specific read-only observation adapter. It
  resolves only the printer-advertised same-origin snapshot route and returns a
  validated raw JPEG plus observation time. It does not know about tickets,
  multipart responses, MCP, or widget metadata.
- `adapters/camera-media-http.ts` locates the public media URL and serves only
  exact `GET /media/camera.mjpeg`. It claims a lease, writes
  `multipart/x-mixed-replace` JPEG parts, releases the lease on every exit, and
  is not a generic proxy.
- `server.ts` is the composition root. It wires the application service to the
  raw-JPEG source, cryptographic ticket codec, and HTTP adapter only for the
  personal HTTP service. The desktop stdio surface has no media route.
- `app.ts` exposes the read-only, non-idempotent
  `open_u1_camera_stream` tool only when the relay is composed. The model-visible
  result reports expiry and maximum duration; the one-time URL exists only in
  result `_meta` for the widget.
- The widget makes one MCP call for each explicit `Go Live` intent, loads the
  returned same-origin HTTPS URL into its image element, and stops on `Close`.
  If the tool or media load fails, it retains the existing non-overlapping
  `get_u1_camera_frame` loop as a fallback.
- The public deployment adds only an exact `/media` Funnel handler to the
  existing loopback service and preserves all other handlers. Moonraker and the
  printer camera are never direct Funnel targets.
- `show_u1_status` includes the portable PNG on both stdio and HTTP surfaces.
  This supersedes decision 0012 only where it excluded the PNG from local
  stdio results.

The relay remains Monitor-only under `u1.monitor`. It adds no upload, start,
pause, resume, cancel, tuning, generic protocol, G-code, or Admin capability.

## Consequences

- Continuous presentation no longer creates one MCP round trip and base64 copy
  per frame.
- A media ticket is a short-lived capability. It is single-use, absent from
  model-readable content, bounded by duration and concurrency, and invalid
  after a successful claim.
- The browser receives a public relay URL but never a private printer URL. A
  `no-referrer` image policy and no-store media headers reduce incidental
  disclosure.
- This relay iterates validated snapshot JPEGs. It is not proof of the camera's
  advertised WebRTC frame rate, hardware encoding throughput, persistent video
  ingestion, visual usefulness, or iOS host rendering.
- Local stdio hosts retain the PNG and snapshot fallback but do not advertise
  the HTTP-only stream-opening tool.
- The prototype still lacks the resident observation spine, session store, and
  reconnect behavior planned for O1.

## Validation

Require TypeScript compilation and tests that separately prove application
ticket expiry and replay behavior, bounded concurrency, serial frame reads,
exact media routing, multipart JPEG framing, non-proxy behavior, URL privacy,
widget fallback, the four-tool remote inventory, and the retained local PNG.

Bundle and validate the repository, personal source, and installed plugin.
Deploy the source without replacing OAuth state, add only the `/media` Funnel
handler, and verify local and public health, authentication rejection, exact
404 behavior, and a live one-time multipart stream carrying more than one valid
real-printer JPEG. Record mounted desktop and iOS behavior separately; protocol
success does not establish either host outcome.
