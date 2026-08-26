# U1 Print Studio app

This is the read-only MCP Apps dashboard for U1 Print Studio. It supports the
desktop-local stdio plugin and an OAuth-protected Streamable HTTP endpoint for
personal mobile developer testing. It does not slice, upload, start, pause,
cancel, or send G-code.

Every `show_u1_status` result also includes a self-contained PNG status card.
This lets a Codex host display the same fresh observation when it can call MCP
tools but cannot mount an MCP Apps component. It is an inline tool result, not
an external dashboard or public image URL. Component-capable hosts can still
mount the richer interactive widget.

## Local development

The repository root `.env` supplies `MOONRAKER_BASE_URL`. Keep that file local.

```sh
cd plugins/u1-print-studio/app
bun install
bun run check
bun run bundle
bun run start
```

The local HTTP development endpoint is `http://127.0.0.1:8787/mcp`. The desktop
plugin uses the separate stdio entry point declared in `../.mcp.json`.

For fast widget iteration without a ChatGPT host or plugin reinstall, start the
opt-in standalone status dashboard on its separate loopback port:

```sh
bun run dashboard
```

Open `http://127.0.0.1:8788/dashboard`. The page embeds the production widget and
emulates only the MCP Apps host calls that the widget uses: current status,
camera snapshot, and the user-clicked continuous camera relay. It deliberately
has no printer-control call. **Reload widget** rereads `public/widget.html`
directly from disk, so HTML and CSS edits need only a page reload; Bun watch
restarts the process for TypeScript changes.

To test from a phone on the same tailnet, keep the app on loopback and add a
private Tailscale Serve HTTPS listener on port 8444:

```sh
tailscale serve --bg --https=8444 --yes http://127.0.0.1:8788
bun run dashboard:tailscale
```

The startup log prints the exact private
`https://<magicdns-hostname>:8444/dashboard` URL. The app still binds only to
`127.0.0.1`; Tailscale Serve owns the tailnet listener and TLS. The phone must
have Tailscale connected.

`U1_STATUS_DASHBOARD=1` disables personal OAuth composition for that process and
enables the dashboard routes only on the dedicated service. The normal service
does not serve `/dashboard`, the dashboard-only process does not serve `/mcp`,
and port 8444 must remain Tailscale Serve-only rather than Funnel-enabled. This
is a development harness, not the public dashboard rejected by decision 0012
and not evidence of rendering inside a real ChatGPT host.

## Personal mobile status endpoint

Set these untracked root `.env` values in addition to `MOONRAKER_BASE_URL`:

```dotenv
U1_REMOTE_AUTH=personal
U1_PUBLIC_BASE_URL=https://your-device.example.ts.net
U1_OWNER_NAME=Your name
```

`U1_PUBLIC_BASE_URL` must use standard HTTPS port 443. The server remains bound
to `127.0.0.1`; Tailscale Funnel terminates public TLS. If the hostname is free,
proxy its root to the U1 service:

```sh
tailscale funnel --bg --https=443 --yes http://127.0.0.1:8787
```

If another root service already uses that hostname, preserve it and add exact
handlers for `/.well-known`, `/oauth`, `/auth`, `/mcp`, and `/media`, each
pointing to the same path on `127.0.0.1:8787`. The `/media` handler exposes only
the app's exact `/media/camera.mjpeg` route; it is not a printer or generic HTTP
proxy. Tailscale strips a matched incoming prefix unless the proxy target
includes it. Re-read `tailscale funnel status --json` and verify the existing
root handler is unchanged. A healthy public Funnel on `:8443` failed ChatGPT
OAuth discovery in the personal test, so do not use a nonstandard port without
a successful ChatGPT registration check.

On first start, the local service log prints the owner-only path containing one
one-time enrollment URL. Open the URL from that file on the intended iPhone and
create a passkey with user verification. After enrollment, the URL file is
removed. Runtime signing keys, the passkey public credential, and dynamically
registered OAuth
clients are written outside the repository under
`~/.local/share/u1-print-studio/` by default. Override the location with
`U1_AUTH_STATE_DIR`.

Before adding the endpoint, use ChatGPT on desktop or the web and enable
**Developer mode** under **Settings → Security and login**. Then open
`https://chatgpt.com/plugins`, select the plus button, and add the public URL
with `/mcp` appended, for example:

```text
https://your-device.example.ts.net/mcp
```

Developer mode availability can depend on account and workspace policy. The
Codex iPhone app does not expose these developer controls in its Security page;
register the connection on desktop or the web while signed into the same
account. Availability of that private developer connection in Codex mobile is
a separate product-surface check.

In the New Plugin form select **Server URL** and **OAuth**, leave discovered
Advanced OAuth settings unchanged, acknowledge the custom-server warning, and
create the connection. **Tunnel** means OpenAI Secure MCP Tunnel, not Tailscale
Funnel. Secure MCP Tunnel is useful for private development but is not a public
plugin distribution endpoint.

The personal authorization server provides OAuth authorization code plus PKCE,
dynamic client registration restricted to approved redirect origins,
protected-resource metadata, issuer identification, audience-bound JWT access
tokens, rotating opaque refresh tokens, and the single `u1.monitor` scope.
Access tokens last 15 minutes. Refresh tokens are bound to the client, resource,
and granted scope, stored only as hashes, rotated after one successful use, and
expire after 30 days without a successful rotation. This is a one-user developer
path, not a public-distribution identity architecture.

Connections created by an older server that did not issue refresh tokens must
link once more after updating and restarting the service. Preserve the OAuth
state and enrolled passkey; deleting state or re-enrolling the phone is not part
of this repair.

`bun run bundle` creates a self-contained ignored deployment artifact at
`dist/stdio.js`; local marketplace installation can use that bundle without
copying `node_modules`.

The widget provides:

- a server-relayed camera snapshot at the top without exposing the printer URL
  to the component;
- a `Go Live` button that calls `open_u1_camera_stream` once, then loads a
  short-lived continuous multipart MJPEG relay URL kept in tool-result `_meta`;
- a `Close` button that stops frame requests and returns to snapshot mode;
- printer progress, layer, active physical tool, temperatures, and time;
- adaptive read-only refresh through `get_u1_status`;
- inline, Picture in Picture, and fullscreen display modes;
- one responsive layout with iOS safe areas, dynamic viewport height, and
  touch-sized controls.

The PNG fallback provides current progress, layer, tool, bed, time, file,
camera availability, and observation time. It is static and intentionally has
no camera pixels or controls. A new tool call produces a new observation and
image.

The HTTP service owns short-lived one-time tickets, bounded leases, concurrency,
and serial frame iteration in an application service that does not depend on
MCP or HTTP types. The media adapter serves only exact `GET
/media/camera.mjpeg`; it validates the ticket, writes multipart JPEG parts, and
does not proxy caller-selected URLs. Each upstream frame remains a validated
raw JPEG acquired through the fixed read-only camera adapter.

If a host cannot open the continuous relay, the widget falls back to the
existing `get_u1_camera_frame` loop and waits 1.5 seconds after each completed
request. Neither path is the camera's advertised full-frame-rate WebRTC stream.
This keeps the private LAN origin out of the component and avoids overlapping
camera reads.

The local plugin uses a stdio MCP process and remains desktop-local. It exposes
the three status/snapshot tools and uses snapshot fallback because it has no
public media endpoint. The OAuth-protected HTTP connection adds the fourth
read-only `open_u1_camera_stream` tool and is the cross-device test path; its
availability and rendering in Codex on iPhone must be verified separately.
Moonraker and the printer camera remain private LAN dependencies; Funnel must
never proxy either one directly.

This is a self-hosted edition: each printer owner needs one always-on agent in
the printer's LAN. That agent may run on a desktop, NAS, or small server. A
future public product could instead use one hosted MCP service plus a per-owner
outbound LAN connector, but that is a separate architecture and operations
commitment.

The current macOS validation host allows the system `curl` process to reach the
printer but denies direct Bun and Node local-network sockets. The telemetry
adapter therefore invokes `curl` with a fixed read-only URL set and no shell.
This is an environment boundary, not a general Node limitation.
