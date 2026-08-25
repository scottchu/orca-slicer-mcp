# U1 Print Studio app

This is the read-only MCP Apps dashboard for the repo-local U1 Print Studio
plugin. It does not slice, upload, start, pause, cancel, or send G-code.

## Local development

The repository root `.env` supplies `MOONRAKER_BASE_URL`. Keep that file local.

```sh
cd plugins/u1-print-studio/app
bun install
bun run check
bun run start
```

The HTTP development endpoint is `http://localhost:8787/mcp`. The plugin uses
the separate stdio entry point declared in `../.mcp.json`.

The widget provides:

- a camera snapshot at the top;
- a `Go Live` button for the printer's advertised WebRTC view;
- a `Close` button that disconnects the live iframe and returns to snapshot;
- printer progress, layer, active physical tool, temperatures, and time;
- adaptive read-only refresh through `get_u1_status`;
- inline, Picture in Picture, and fullscreen display modes.

The live view uses the camera's advertised target frame rate. The UI does not
cap it at a fixed value.

The current macOS validation host allows the system `curl` process to reach the
printer but denies direct Bun and Node local-network sockets. The telemetry
adapter therefore invokes `curl` with a fixed read-only URL set and no shell.
This is an environment boundary, not a general Node limitation.
