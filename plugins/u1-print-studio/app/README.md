# U1 Print Studio app

This is the read-only MCP Apps dashboard for U1 Print Studio. It supports the
desktop-local stdio plugin and an OAuth-protected Streamable HTTP endpoint for
personal mobile developer testing. It does not slice, upload, start, pause,
cancel, or send G-code.

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
handlers for `/.well-known`, `/oauth`, `/auth`, and `/mcp`, each pointing to the
same path on `127.0.0.1:8787`. Tailscale strips a matched incoming prefix unless
the proxy target includes it. Re-read `tailscale funnel status --json` and
verify the existing root handler is unchanged. A healthy public Funnel on
`:8443` failed ChatGPT OAuth discovery in the personal test, so do not use a
nonstandard port without a successful ChatGPT registration check.

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
tokens, and the single `u1.monitor` scope. This is a one-user developer path,
not a public-distribution identity architecture.

`bun run bundle` creates a self-contained ignored deployment artifact at
`dist/stdio.js`; local marketplace installation can use that bundle without
copying `node_modules`.

The widget provides:

- a server-relayed camera snapshot at the top without exposing the printer URL
  to the component;
- a `Go Live` button for a secure near-live preview refreshed through the
  read-only MCP boundary;
- a `Close` button that stops frame requests and returns to snapshot mode;
- printer progress, layer, active physical tool, temperatures, and time;
- adaptive read-only refresh through `get_u1_status`;
- inline, Picture in Picture, and fullscreen display modes;
- one responsive layout with iOS safe areas, dynamic viewport height, and
  touch-sized controls.

The relayed preview waits 1.5 seconds after each completed frame request. It is
not the camera's advertised full-frame-rate WebRTC stream. This keeps the
private LAN origin out of the component and provides a portable fallback for
sandboxed desktop and mobile hosts.

The local plugin uses a stdio MCP process and remains desktop-local. The
OAuth-protected HTTP MCP connection is the cross-device test path; its
availability and card rendering in Codex on iPhone must be verified separately.
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
