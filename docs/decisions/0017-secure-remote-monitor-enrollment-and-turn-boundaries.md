# 0017 — Separate remote enrollment and require configurable TURN credentials

- Status: accepted for the user-authorized F0 secure remote monitor slice
- Date: 2026-08-27
- Owners: project maintainers

## Context

Decision 0016 made the desktop-local connector the normal-user direction and
kept the personal Funnel/OAuth service as an optional developer adapter. The
user has now authorized one bounded secure remote monitor slice for the current
personal deployment. The live service already exposes Streamable HTTP MCP and
personal OAuth on standard HTTPS, but its passkey enrollment handlers share the
public origin. Its WebRTC offer path also defaults to an empty ICE-server list,
which does not give remote ChatGPT or Codex clients a relay path when direct ICE
connectivity fails.

The deployed Tailscale configuration contains unrelated public and private
routes. This code slice must not mutate them. Real deployment remains a later,
coordinator-authorized action after repository decisions and tests pass.

## Decision

- Keep exactly four model-visible read-only tools and three app-only read-only
  signaling helpers. Do not add printer control, preparation, generic proxy, or
  Admin capability.
- Retain the public Streamable HTTP MCP resource and personal OAuth
  authorization-code, PKCE, refresh-token, and passkey assertion flow on
  standard HTTPS. Authenticate every public MCP request. App signaling uses the
  authenticated MCP Apps bridge; the optional exact media adapter retains its
  short-lived, single-use capability authentication.
- Remove passkey enrollment from the public application surface. Public
  `/auth/enroll` and descendant routes reject every request. A second
  loopback-only enrollment listener serves only those exact routes and a
  minimal health check. It must be exposed, if deployed, through a separately
  configured tailnet-only Tailscale Serve HTTPS origin on a nonstandard port
  with Funnel disabled. When the private origin is configured, the listener
  remains bound after enrollment so health stays testable; enrollment routes
  return 404 until a local reset creates a new one-time flow.
- Require the enrollment HTTPS hostname to match the public OAuth hostname so
  both origins share one WebAuthn relying-party ID. Registration verifies the
  tailnet-only enrollment origin; later OAuth assertions verify the public
  standard-HTTPS origin. The one-time enrollment URL contains the private Serve
  origin and remains in an owner-only runtime file.
- Add explicit ICE-server configuration at the Printer Operations composition
  boundary. A bounded `U1_STUN_URLS_JSON` list may restore STUN explicitly for
  the personal deployment, but the default remains empty and public STUN is not
  a hidden normal-user dependency. TURN uses bounded `turn:` or `turns:` URLs,
  a server-side `U1_TURN_SHARED_SECRET`, and a bounded TTL. Each camera-open
  request mints an RFC5766 TURN REST username in `expiry:random-nonce` form and
  a base64 HMAC-SHA1 credential. The same per-request ICE server configuration
  is sent to the printer camera peer and returned only in widget-private MCP
  result metadata for the browser peer. Static long-lived TURN usernames and
  passwords are not the recommended production path.
- Do not place TURN credentials, printer origins, printer peer identifiers, or
  signaling session IDs in model-readable content or structured content. Do
  not log them or persist them in repository records.
- Treat externally provisioned TURN service URLs and a shared secret as the
  prerequisite for claiming robust remote media. The secret stays server-side;
  only its per-session derived credential crosses the WebRTC protocol boundary.
  An explicit STUN-only deployment is a bounded compatibility step, not proof
  that remote peers can connect. Source and fixture tests can prove parsing,
  authentication, privacy, and propagation, but cannot prove relay allocation,
  mounted-host playback, or printer reachability.

This decision narrows decision 0010's enrollment exposure and extends decisions
0015 and 0016 with a TURN-capable remote media path. It preserves decision
0016's local-first normal-user direction and MCP Apps signaling bridge.

## Consequences

- Possession of an enrollment token is no longer sufficient from the public
  internet; enrollment additionally requires reachability to a tailnet-only
  origin.
- Public OAuth discovery and passkey assertions remain available to ChatGPT and
  Codex on standard HTTPS without making enrollment public.
- Remote media can use an authenticated TURN relay when direct browser-to-
  printer ICE paths fail. TURN operation incurs an external service,
  credential-rotation, bandwidth, availability, and privacy dependency.
- The application passes only derived short-lived TURN credentials to the two
  WebRTC peers. They remain unavailable to the model but are necessarily
  available to the mounted widget and printer camera process for the bounded
  session. The TURN shared secret never leaves the server.
- A configured public STUN service learns network metadata from both peers and
  adds an availability dependency. TURN is preferred for reliable remote use;
  neither STUN nor TURN is configured implicitly for local-first users.
- Existing Tailscale handlers, LaunchAgents, OAuth state, and live processes
  remain unchanged until the coordinator approves an exact deployment plan.

## Validation

Require local TypeScript, Bun, plugin, repository, and whitespace checks plus
fixture tests that prove:

- the public handler rejects every enrollment route while OAuth discovery,
  authorization, token, MCP, and health routes retain their contracts;
- the enrollment listener serves only exact enrollment handlers and its health
  route, never MCP, OAuth token, media, widget, or generic proxy behavior;
- configuring the private enrollment origin requires a distinct loopback port
  and keeps private health available after an existing credential suppresses
  the one-time enrollment URL;
- enrollment and public origins are HTTPS, share one hostname/RP ID, and use
  distinct origins, with enrollment on an explicit nonstandard port;
- incomplete TURN URL/shared-secret configuration and invalid TTLs fail closed;
  bounded STUN and TURN URLs are sanitized; RFC5766 TURN REST output is
  deterministic under fixture time and nonce; and the shared secret plus
  derived credentials do not appear in model-readable tool results;
- configured ICE servers reach both the printer offer request and the
  widget-private `RTCPeerConnection` configuration;
- the authenticated public inventory remains exactly four model-visible tools
  and three app-only helpers, all read-only.

Record static/software and simulated protocol evidence separately from public
edge, real TURN allocation, real-printer, mounted ChatGPT/Codex, and user-outcome
evidence. Do not mutate or claim any later layer during this implementation.
