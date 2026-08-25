# 0009 — Relay camera frames through the monitor boundary

- Status: accepted
- Date: 2026-08-25
- Owners: project maintainers

## Context

The first status-view prototype gave its sandboxed widget the printer's private
LAN snapshot and WebRTC URLs. The printer endpoints responded to server-side
read-only probes, but the live camera did not render in the desktop component
and the local stdio-backed plugin was not usable as a mobile iOS camera path.
Allowlisting a private origin in component CSP does not make that origin
reachable from every host, remove mixed-content and private-network controls,
or make a desktop-local MCP process available cross-device.

The user requested a camera view that works on desktop and a mobile-compatible
widget. Printer camera data and identifiers remain private local data under
`DATA-001`, and the trusted Moonraker LAN surface must not be exposed directly
to the public internet.

## Decision

Keep the status view as an interactive, decoupled, read-only MCP App and add one
data-only monitor tool, `get_u1_camera_frame`. The server resolves only the
printer-advertised snapshot route on the configured printer origin, fetches a
bounded JPEG through the existing read-only adapter, validates its file
signature, and returns the image only in widget-private result metadata.

The widget no longer receives or embeds private printer URLs. Its component CSP
has no external connect, resource, or frame origins. `Go Live` starts a
non-overlapping relayed preview loop with a 1.5-second delay between completed
frame calls; `Close` stops that loop and preserves the latest snapshot. This is
a secure near-live preview, not the printer's advertised 15 FPS WebRTC video.

Make the same component adapt to narrow mobile viewports with dynamic viewport
height, iOS safe-area insets, 44-pixel touch targets, one-column compact
metrics, host safe-area signals, and intrinsic-height notifications. Do not
create a separate mobile-only widget.

Cross-device iOS use requires the private MCP HTTP server to be reachable by a
supported mobile product surface. A Secure MCP Tunnel is the preferred
discovery candidate because it uses an outbound-only path and does not expose
Moonraker. Tunnel configuration, authentication, always-on host ownership, and
actual iOS host validation remain separate work and are not implied by this
component change.

This decision supersedes the direct camera URL and exactly-two-tool portions of
decision 0008. Its read-only scope, preparation boundary, control exclusion,
and shared-CLI deferral remain accepted.

## Consequences

- Desktop and mobile widgets use the same camera transport and never contact
  the printer LAN origin directly.
- Camera frames add MCP payload and bandwidth overhead. At the observed JPEG
  size, continuous preview should remain user-initiated and stop promptly.
- Transient camera timeouts remain visible; the adapter retries each frame at
  most once and the live loop never overlaps calls.
- Full-frame-rate video still needs a separately designed authenticated media
  relay. The near-live preview must not be described as 15 FPS WebRTC.
- Static, MCP, real-endpoint, desktop-host, and iOS-host evidence remain
  separate. Responsive source and tests do not prove iOS rendering.

## Validation

Require TypeScript compilation, same-origin and protocol rejection tests,
in-memory MCP tool/resource tests, mobile layout contract tests, a bundled
stdio call returning a valid relayed JPEG data URL, plugin validation, and the
repository contract. Record desktop and iOS visual host loops separately when
those surfaces are available.
