# 0020 — Terminate printer media at a private fan-out boundary

- Status: accepted for the user-authorized multi-viewer camera repair
- Date: 2026-08-28
- Owners: project maintainers

## Context

The camera presentation could allocate only a small number of direct printer
WebRTC peers. A retained or duplicated mobile card could therefore make a later
camera request report busy. More importantly, directly forwarding the
printer's offer would make upstream SDP, LAN candidates, peer identifiers, and
device metadata part of a public MCP or widget response. The printer is a
private operations adapter, not an external API, MCP resource, or browser peer.

The user wants any bounded number of simultaneous camera presentations while
the connector maintains only one real camera stream from the U1. A phone on the
same tailnet previously reached the stream without TURN, so TURN must remain an
optional fallback rather than a prerequisite. Normal users must not install a
separate media daemon on their computer.

## Decision

- The Bun/standalone connector terminates one H264 WebRTC peer with the printer
  on the private LAN. Printer offers, candidates, ICE credentials, peer IDs,
  tickets, URLs, and errors end at this boundary.
- The connector creates one independent server-owned WebRTC peer per viewer and
  forwards encoded H264 RTP from the shared upstream. Each viewer receives a
  dedicated forwarding track with cloned RTP packet headers; no sender reuses
  or mutates the shared upstream track and no transcoding is implied.
- The downstream offer advertises the exact upstream H264 codec and profile
  selected by the payload type of the first received media RTP packet.
  Ambiguous or unsupported payload mappings fail closed. VP8 is not advertised
  because the connector does not transcode.
- Picture-loss feedback from every downstream sender is bridged to the shared
  upstream receiver. Viewer PLIs are coalesced and rate-limited so simultaneous
  cards do not amplify RTCP traffic; feedback failure does not close peers.
- Each downstream viewer receives its own ICE/TURN REST credentials. The
  printer's upstream ICE set is never reused downstream. The connector
  explicitly adds discovered Tailscale host addresses so a tailnet-connected
  client can select a direct host path; configured STUN and TURN remain optional
  downstream alternatives.
- `U1_CAMERA_MAX_VIEWERS` bounds viewer fan-out from 1 through 64 and defaults
  to 16. Each viewer retains a one-time activation, 15-second answer deadline,
  bounded lease, candidate budgets, independent idempotent Close, and failure
  teardown. Explicit upstream generations and viewer-alive checks prevent a
  peer that terminated during async opening from being inserted. The last
  viewer releases the single printer upstream.
- Werift termination observers subscribe before inspecting current connection
  state. An already `failed` or `closed` peer is reported exactly once even if
  no later state-change event arrives; unsubscription is idempotent.
- The optional exact `/media/camera.webrtc` compatibility adapter may accept
  only a session store branded `server-terminated-fanout`; it cannot be wired to
  the old direct printer session service. Its original one-time public ticket
  remains the opaque downstream session ID.
- `open_printer_camera` links `camera-v3.html`, is non-idempotent presentation
  intent, and produces a fresh server-owned presentation ID on every explicit
  open/reopen request. Camera v2 and v1 remain readable aliases of the current
  camera-only asset. Snapshot, live, retry, Close, and fallback stay inside the
  widget.
- Public status uses closed state, tool-state, camera-capability, and error
  vocabularies. Relayed JPEGs lose APP0-APP15, COM, and trailing metadata.
  Public MCP, HTTP, health, widget, dashboard, and failure envelopes must not
  contain a printer IP/hostname/MAC/serial/device ID, Moonraker or camera URL,
  upstream SDP/candidate/peer ID, printer credentials/tickets, or raw upstream
  error/stack. Server-owned viewer IDs, server ICE candidates, normalized model
  aliases, and derived per-viewer TURN credentials remain allowed only where
  required by the private widget protocol.
- The media implementation is the MIT-licensed pure-TypeScript `werift`
  dependency bundled into the existing standalone runtime. It adds no separate
  normal-user process or install step. License and third-party notice review
  still gates any open-source release claim.

This supersedes decisions 0017 and 0019 only where they assumed that the
printer peer and widget shared one ICE set or that each viewer negotiated
directly with the printer. Their OAuth, enrollment, activation, read-only,
resource compatibility, and rendered-frame boundaries remain in force.

## Consequences

- Multiple camera cards no longer consume multiple printer camera peers.
- Closing one card does not interrupt another; closing the last card tears down
  the only printer stream.
- Tailnet-direct playback can work without TURN when the host candidate is
  reachable. TURN improves traversal when direct candidates fail but is not a
  logical requirement for fan-out.
- The connector now owns media termination and therefore consumes per-viewer
  CPU, sockets, and memory. Capacity is explicit and bounded.
- A passing protocol suite does not prove the U1's real H264 profile, sustained
  fan-out, mobile ICE selection, browser playback, or TURN allocation.

## Validation

Require TypeScript, Bun tests, both bundles, standalone signature/help, plugin
and touched-skill validation, repository checks, and whitespace checks. Tests
must prove one upstream for multiple viewers, unique downstream ICE
credentials, independent Close, last-viewer release, answer timeout, viewer
capacity, Tailscale candidate discovery, H264-only forwarding boundaries,
first-RTP payload/profile selection, coalesced upstream PLI feedback, async
termination-race cleanup, already-terminal peer rejection, cancellable
track/RTP waits,
legacy HTTP fan-out branding, repeated camera presentations, widget URI
compatibility, closed public diagnostics, JPEG metadata stripping, and sentinel
absence across public MCP/HTTP envelopes.

Real-printer, multi-viewer, mounted Codex/ChatGPT, mobile, direct tailnet ICE,
STUN, and TURN remain separate post-source evidence gates. This decision does
not authorize a live deployment, service restart, route change, printer
control, or publication.
