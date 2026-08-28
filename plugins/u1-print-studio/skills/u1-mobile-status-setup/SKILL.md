---
name: u1-mobile-status-setup
description: Set up the U1 Print Studio read-only status card on a new user's phone through a standard-HTTPS Tailscale Funnel endpoint, personal OAuth, and phone passkey enrollment. Use when a user asks to configure, install, connect, onboard, or troubleshoot the U1 mobile status widget, Tailscale address, Funnel endpoint, OAuth login, Face ID, passkey, Server URL, or Tunnel choice. Do not enable upload, start, cancel, or other printer controls.
---

# U1 Mobile Status Setup

Set up one user's read-only U1 status card without exposing their printer directly or weakening authentication. Walk the user through the few phone interactions that cannot be completed on their behalf.

## Safety and scope

- Configure only the four read-only tools: `show_u1_status`, `get_u1_status`,
  `get_u1_camera_frame`, and `open_printer_camera`. Stream allocation and its
  three follow-up signaling operations are app-only widget helpers.
- Keep upload, start, cancel, pause, resume, and printer commands out of this setup. Those require a separate implementation and a fresh per-action authorization boundary.
- Bind the MCP service to `127.0.0.1`; expose it only through Tailscale Funnel.
- Never ask the user to paste printer credentials, private profiles, OAuth signing keys, passkey credential material, enrollment state, or bearer tokens into chat.
- A passkey is enrolled on the user's intended phone. It is not a password or secret string to collect.
- Call the public Tailscale value a MagicDNS hostname, not an IP address. Funnel TLS uses the hostname.
- Preserve every unrelated Tailscale Serve or Funnel route. Never use a blanket reset as part of setup or rollback.
- Use standard HTTPS port 443 for ChatGPT registration. Tailscale Funnel supports other ports, but a real ChatGPT OAuth-discovery attempt against `:8443` failed before reaching the otherwise healthy public edge.
- Keep authentication mandatory on every public MCP request. If passkey recovery is needed, perform local re-enrollment; never add a public unauthenticated bypass.
- Keep every public `/auth/enroll` route rejecting. Serve enrollment and its
  health check only from a second loopback listener through a distinct
  tailnet-only Tailscale Serve HTTPS port with Funnel disabled.
- Do not assume a default STUN service. Configure bounded STUN explicitly for a
  compatibility test and prefer short-lived RFC5766 TURN REST credentials for
  robust remote media. Never collect or display the TURN shared secret.

## Evidence boundaries

Report these separately:

1. Local software evidence: server checks and tests pass on the Mac.
2. Public-edge evidence: HTTPS health, OAuth discovery, and unauthenticated rejection work through Funnel.
3. MCP evidence: the authenticated client discovers exactly the four read-only tools.
4. Printer evidence: returned telemetry and camera data came from the configured real printer.
5. iOS evidence: the host visibly rendered either the interactive component or
   the inline PNG fallback; interactive controls are evidence only on hosts
   that mounted the component.

An earlier layer never proves a later one. Do not call the iOS setup complete until the user confirms the rendered card on the phone.

## Setup workflow

### 1. Inspect before changing anything

Locate the installed plugin source and its `app` directory. Read `app/README.md` before configuring it. Confirm Bun and Tailscale are installed, Tailscale is signed in, and the U1 status service can already reach the user's Moonraker-compatible endpoint locally.

Complete developer connection setup in ChatGPT on desktop or the web, not in the Codex iPhone security screen. Guide the user to ChatGPT **Settings → Security and login → Developer mode** and turn it on. Developer mode availability can depend on account or workspace policy. Then open `https://chatgpt.com/plugins` in a browser signed into the same account and use its plus button. Do not mistake the absence of these controls in Codex on iPhone for an MCP or Tailscale failure.

Inspect, but do not print secrets from, the existing environment configuration. Confirm it can provide:

```text
MOONRAKER_BASE_URL=<private printer endpoint>
U1_REMOTE_AUTH=personal
U1_PUBLIC_BASE_URL=<public Funnel origin>
U1_ENROLLMENT_BASE_URL=https://<same-magicdns-hostname>:<private-serve-port>
U1_ENROLLMENT_PORT=<distinct-loopback-port>
U1_OWNER_NAME=<display name>
```

Do not replace an existing `MOONRAKER_BASE_URL` unless the user asks.

Run `tailscale status --json` and read `Self.DNSName`, removing its final dot. If it is missing, stop and help the user enable MagicDNS or sign in to Tailscale.

Run `tailscale funnel status --json` and save the current routing state for
comparison. Prefer a dedicated hostname on HTTPS port 443. If the hostname
already has a root service on port 443, preserve it and add exact path handlers
for `/.well-known`, `/oauth`, `/auth`, `/mcp`, and `/media`; `/health` is
optional. The `/media` prefix must map back to backend `/media`, where the
application accepts only exact `GET /media/camera.mjpeg` with a short-lived
one-time ticket. Tailscale path handlers strip their matched prefix unless the
proxy target includes it, so map each incoming prefix to the same backend
prefix and verify the result. Do not replace the root handler.

Set:

```text
U1_PUBLIC_BASE_URL=https://<magicdns-hostname>
```

Do not append `/mcp` to `U1_PUBLIC_BASE_URL`.

Choose a currently unused nonstandard Serve HTTPS port for the enrollment
origin and a distinct loopback backend port. Preserve every current Serve and
Funnel handler. Never reuse an occupied private port or enable Funnel on the
enrollment port. The enrollment hostname must match the public hostname so the
two origins share one WebAuthn RP ID.

For the installed standalone runtime, add any explicit compatibility STUN URL
through repeatable `u1-print-studio setup --stun-url <url>` arguments; setup
preserves valid STUN entries. For the HTTP service, `U1_STUN_URLS_JSON` is an
explicit override. Record that public STUN observes peer network metadata and
adds an availability dependency. For robust remote use provision TURN URLs and
a server-held shared secret through `U1_TURN_URLS_JSON`,
`U1_TURN_SHARED_SECRET`, and a bounded
`U1_TURN_CREDENTIAL_TTL_SECONDS`. Partial TURN configuration must stop startup.

### 2. Prove the service locally

Install dependencies and run the checks described in `app/README.md`. In this repository use Bun for the TypeScript app and `uv run` for every Python command.

Start the HTTP service on loopback and verify its local health endpoint before creating a public route. Confirm an unauthenticated local MCP request is rejected with HTTP 401 and a `WWW-Authenticate` header referring to the protected-resource metadata.

Confirm the separate enrollment listener is also bound to loopback. Its
`/health` must identify only the enrollment surface; `/mcp`, `/oauth`, `/media`,
and `/widget` must return 404. The public listener must return 404 for
`/auth/enroll` and all descendants even when a one-time token exists.

For a persistent macOS setup, create a user LaunchAgent from the user's actual plugin path. Do not hard-code another user's home directory. Give runtime directories, state, and logs owner-only permissions. The service must continue to bind only to `127.0.0.1`.

### 3. Add one Funnel route

Map only the required standard-HTTPS origin or exact path handlers to the local
loopback service. Re-read `tailscale funnel status --json` and verify all
pre-existing handlers remain unchanged. When sharing an origin, verify that
`/mcp` reaches backend `/mcp`, `/.well-known` reaches backend `/.well-known`,
`/oauth` reaches backend `/oauth`, `/auth` reaches backend `/auth`, and
`/media` reaches backend `/media` rather than backend `/`. Verify an
unrecognized `/media` path returns HTTP 404; do not expose a generic proxy.

Through the public origin, verify:

- `/health` returns HTTP 200;
- `/.well-known/oauth-protected-resource` names `<origin>/mcp` as the resource;
- `/.well-known/oauth-authorization-server` advertises authorization code, PKCE S256, dynamic client registration, and the expected issuer;
- an unauthenticated POST to `/mcp` returns HTTP 401, not printer data;
- dynamic registration accepts the documented ChatGPT callback and rejects an unrelated attacker origin.

Do not publish the endpoint until these checks pass.

Add the enrollment listener only to the chosen tailnet-only Serve HTTPS port.
Verify `/health` through that private origin, verify Funnel is disabled on the
port, and compare all unrelated handlers with the saved routing state. Keep the
public `/auth` handler mapped to the public backend so enrollment attempts are
rejected rather than falling through to an unrelated root service.

### 4. Enroll the intended phone

Find the one-time enrollment URL in the owner-only runtime file named by
`app/README.md`. Confirm it uses the private Serve origin, not the public Funnel
origin. Show that URL only to the user who owns the service and ask them to open
it on the iPhone they intend to use. Explain that iOS will create a passkey and
normally confirm it with Face ID or the device passcode.

Wait for the user to complete enrollment. Then verify locally that the OAuth state contains an enrolled credential without displaying the credential material. Confirm the one-time enrollment link has been removed or is invalid. Do not restart the service while enrollment is pending unless a new link is intentionally required; a restart can invalidate an earlier link.

### 5. Register on desktop, then test mobile availability

Guide the user through the current ChatGPT developer/plugin connection flow documented by OpenAI on desktop or the web. The remote MCP URL is:

```text
https://<magicdns-hostname>/mcp
```

The OAuth login should redirect to the personal authorization page. Ask the user to approve with the enrolled passkey. Do not substitute an OpenAI API key or a ChatGPT subscription credential; neither authenticates this personal MCP endpoint.

In the New Plugin form choose **Server URL**, not **Tunnel**. Choose **OAuth**, keep dynamically discovered OAuth settings, acknowledge the custom-server warning, and create the connection. Secure MCP Tunnel is a separate OpenAI Platform path for private development and does not support public plugin submission.

After connection, verify that the authenticated inventory contains exactly:

```text
show_u1_status
get_u1_status
get_u1_camera_frame
open_printer_camera
```

Each tool must be read-only and require `u1.monitor`. Stop if any control tool is present.

OpenAI documents public plugins as shared across ChatGPT and Codex, but says local and repository marketplace availability can vary by surface. Treat the private developer connection's appearance in Codex on iPhone as a separate observation, not an assumption. If it does not appear after registration and refresh on the same account, report that private developer testing works in ChatGPT but Codex mobile requires a supported distribution path; do not weaken authentication or publish publicly merely to bypass that limitation.

### 6. Verify the real iOS card

Start a new phone conversation and ask to show the U1 monitor widget. Verify, in order:

1. the host renders either the interactive widget or the inline PNG status
   card rather than only a text summary;
2. printer telemetry is current and internally consistent;
3. if the interactive widget mounted, a camera snapshot loads when the printer
   provides one;
4. `Go Live` makes one MCP call and then displays the continuous relay, or
   visibly falls back to non-overlapping per-frame snapshots;
5. if the interactive widget mounted, refresh and adaptive timing behave
   correctly;
6. Close, Picture in Picture, and fullscreen are tested separately only on
   component-capable hosts.

The PNG is a static projection of one observation, not a degraded interactive
dashboard. Refresh it with a new `show_u1_status` call. Do not expect camera
pixels or controls inside the PNG.

Record which checks were observed by the user. Do not infer visual acceptance from a successful MCP response or a desktop rendering.

For remote live acceptance, distinguish local candidates, explicit STUN, and
TURN-relayed evidence. STUN success does not prove TURN. Do not claim reliable
ChatGPT and Codex playback until a real allocation using a derived short-lived
TURN REST credential and mounted playback on each host are observed.

## Recovery and rollback

- If Codex reports `oauth_refresh_token_missing` for a connection created by an
  older U1 service, update and restart the service while preserving OAuth state,
  then reconnect once from ChatGPT desktop or web. Do not delete the enrolled
  passkey. If a newly linked connection repeats the failure, confirm discovery
  advertises `refresh_token` and exercise one bounded refresh exchange without
  printing or recording either token.
- If the passkey is lost, require local access to create a new one-time enrollment and invalidate the old credential. Keep the public endpoint authenticated throughout recovery.
- If the service fails, inspect loopback health and local logs before changing Funnel.
- To roll back, remove only the exact U1 Funnel port or handler created by this workflow, then compare status with the saved pre-change routing state.
- Unload only the exact LaunchAgent created for U1 Print Studio.
- Preserve OAuth state by default. Delete it only when the user explicitly requests complete re-enrollment and understands that existing clients will stop authenticating.

## Completion report

Report the discovered MagicDNS hostname, standard-HTTPS MCP URL, preserved
Funnel and Serve handlers, private enrollment health, four-tool inventory, ICE
mode (local candidates, explicit STUN, or TURN REST), and each evidence boundary. Redact
credentials and tokens. State that this self-hosted edition requires an
always-on LAN agent per printer owner; it may run on a desktop, NAS, or small
server. Keep a future hosted broker plus local outbound connector as a separate
product decision rather than implying this developer setup is already a
plug-and-play public product. End with the smallest unresolved phone action, if
any, and keep control actions explicitly deferred.
