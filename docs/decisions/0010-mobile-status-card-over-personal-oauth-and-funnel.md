# 0010 — Deliver the mobile status card over personal OAuth and Funnel

- Status: accepted for personal developer testing
- Date: 2026-08-25
- Owners: project maintainers

## Context

The read-only U1 status component works through a desktop-local stdio plugin,
but an iPhone cannot reach that local MCP process. The user explicitly changed
the execution order: make the existing status card work on iOS before building
upload, start, or cancel authorization.

OpenAI plugin clients require a Streamable HTTP MCP endpoint for remote use and
OAuth 2.1 for private user data. Secure MCP Tunnel would keep the endpoint
private, but it uses the OpenAI Platform and is not the selected path for this
personal subscription-backed workflow. The Mac Mini already runs Tailscale and
can publish a path through Funnel without exposing Moonraker itself.

## Decision

Deliver the existing read-only status and relayed-camera tools first through a
dedicated Tailscale Funnel HTTPS origin backed by the local Streamable HTTP server.
Moonraker and its camera remain private LAN dependencies and are never direct
Funnel targets.

Protect the remote MCP endpoint with a narrow personal OAuth 2.1 authorization
server that supports authorization code plus PKCE, dynamic client registration,
protected-resource metadata, issuer identification, and audience-bound access
tokens. The single operator authenticates with a WebAuthn passkey requiring
user verification, which normally presents Face ID on the enrolled iPhone.
The public OAuth surface grants only `u1.monitor` during this slice.

Keep the desktop stdio transport local and unchanged. Remote OAuth policy is an
inbound-adapter concern; the status observation and camera-relay use cases do
not depend on OAuth, HTTP, Tailscale, or MCP types.

Do not expose upload, start, pause, resume, cancel, generic HTTP, JSON-RPC, or
G-code tools in this slice. OAuth identity establishes who is calling; it does
not authorize a consequential printer action. A later control slice must add
one-use, exact-action authorization and preserve capability checks, intent,
acknowledgement, and post-action observation separately.

This is a personal developer deployment, not a public-distribution identity
architecture. Reassess the self-hosted authorization server against an
established identity provider before sharing the plugin with other users.

## Consequences

- The iOS host can receive the same widget and relayed JPEG without learning a
  private printer address.
- The Funnel endpoint is useful only while the Mac Mini service and Tailscale are
  running.
- Access tokens are short-lived and audience-bound; passkey credentials and
  signing keys are runtime secrets stored outside the repository.
- Losing the enrolled passkey requires a local recovery and re-enrollment
  procedure.
- Status-card rendering, OAuth correctness, Funnel reachability, real camera
  relay, and iOS visual acceptance remain separate evidence gates.
- Developer MCP registration happens in ChatGPT on desktop or the web. Whether
  that private developer connection appears in Codex on iPhone is a separate
  product-surface gate; public plugins are shared across ChatGPT and Codex, but
  local and repository plugin availability can vary by surface.
- No printer-control safety claim follows from this decision.

## Validation

Require local tests for OAuth metadata, redirect allowlisting, PKCE, token
audience and scope checks, unauthenticated MCP challenges, and authenticated
tool/resource calls. Validate the exact public metadata and MCP URLs without
publishing credentials. Then enroll one passkey and test the developer plugin
on iOS, recording widget mount, telemetry, relayed snapshot, refresh, near-live
preview, close, PiP, and fullscreen separately.
