# U1 Print Studio app

This is the read-only MCP Apps dashboard for the repo-local U1 Print Studio
plugin. It does not slice, upload, start, pause, cancel, or send G-code.

## Local development

The repository root `.env` supplies `MOONRAKER_BASE_URL`. Keep that file local.

```sh
cd plugins/u1-print-studio/app
bun install
bun run check
bun run bundle
bun run start
```

The HTTP development endpoint is `http://localhost:8787/mcp`. The plugin uses
the separate stdio entry point declared in `../.mcp.json`.

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

The local plugin uses a stdio MCP process and therefore remains desktop-local.
Cross-device iOS use also requires the HTTP MCP server to be connected through
an authenticated private path such as OpenAI Secure MCP Tunnel. Do not expose
Moonraker or the printer camera directly to the public internet.

The current macOS validation host allows the system `curl` process to reach the
printer but denies direct Bun and Node local-network sockets. The telemetry
adapter therefore invokes `curl` with a fixed read-only URL set and no shell.
This is an environment boundary, not a general Node limitation.
