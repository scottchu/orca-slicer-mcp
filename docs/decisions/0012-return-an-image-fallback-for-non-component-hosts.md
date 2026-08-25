# 0012 — Return an image fallback for non-component hosts

- Status: accepted for the read-only prototype
- Date: 2026-08-25
- Owners: project maintainers

## Context

The local Codex desktop host mounts the MCP Apps resource linked from
`show_u1_status`, but the connected Codex iPhone host returned only the textual
tool summary. Authenticated MCP connectivity and fresh printer telemetry were
already proven, so the missing card is a host-rendering capability difference,
not evidence of an OAuth, Funnel, or printer failure.

The user does not want a separate web dashboard. Fluidd already covers that
fallback, while this plugin should provide a useful visual directly inside the
conversation.

## Decision

Keep the HTML MCP Apps widget as the rich representation for component-capable
hosts. For the OAuth-protected remote form of `show_u1_status`, also return a
self-contained PNG status card in the standard MCP tool-result `content` array.
Generate the PNG from the same normalized `U1Status` observation returned in
`structuredContent`.

Do not add a dashboard URL, public image URL, camera URL, printer address, or
control action. The PNG contains only raster pixels and standard PNG framing;
it has no metadata fields carrying dynamic source values. Keep
`get_u1_status` data-only so an interactive widget can refresh without adding a
new image to every internal tool call.

The desktop-local stdio form does not add the PNG because that host already
mounts the widget. The remote OAuth form adds it because it is the path used by
cross-device and non-component clients. This is presentation negotiation at an
inbound adapter, not a new domain concept.

## Consequences

- Codex mobile can display a current visual status even when it cannot mount an
  MCP Apps iframe.
- Component-capable remote hosts may receive both representations; host-level
  suppression or explicit capability negotiation can be evaluated later.
- The fallback is a static observation. It has no live controls, camera image,
  adaptive refresh loop, Picture in Picture, or fullscreen behavior.
- Image generation stays dependency-free and does not require an external
  dashboard or rendering service.
- A successful image payload still does not prove that a particular phone host
  displayed it; that remains user-visible host evidence.

## Validation

Contract tests must prove that remote `show_u1_status` returns text, the
normalized status object, and a valid mobile-first 1200 by 1500 PNG; local
`show_u1_status` and remote `get_u1_status` must remain data-only. Visual
inspection must use fresh real-printer telemetry. The user must separately
confirm that a new Codex mobile conversation displays the image.
