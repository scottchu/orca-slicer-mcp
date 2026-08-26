# U1 Print Studio app

This directory contains the desktop-local, read-only MCP App for U1 Print
Studio. The connector observes one Snapmaker U1 through the printer-operations
adapter and exposes status, snapshots, and bounded WebRTC signaling. It does
not expose upload, start, pause, resume, cancel, G-code, arbitrary URLs, or a
generic printer proxy.

## Normal-user path

All planned delivery channels use the same executable and two onboarding
commands:

```sh
u1-print-studio setup
u1-print-studio doctor
```

`setup` asks for one private, link-local, loopback, or `.local` printer
origin and writes a versioned owner-only configuration. It rejects embedded
credentials, public hosts, queries, fragments, and proxy-shaped paths.
`doctor --offline` validates the local contract without contacting a printer;
ordinary `doctor` adds one read-only status observation.

The release MCP declaration in `../.mcp.release.json` starts:

```sh
./app/runtime/u1-print-studio mcp
```

That path does not require Bun, Tailscale, MagicDNS, public DNS, OAuth setup, or
environment-file editing. Marketplace, Homebrew, and npm packaging remain
unpublished adapters around this same contract; see `../PACKAGING.md`.

## Hosted widget boundary

The widget is a self-contained MCP Apps resource with empty external
`connectDomains`, `resourceDomains`, and `frameDomains`. It never fetches a
LAN, Tailscale, or media URL.

When the user requests live video, the widget sends `tools/call` messages
through the MCP Apps host bridge:

1. `open_u1_camera_stream` creates an opaque, duration- and concurrency-bounded
   session and returns the offer only in widget-private result metadata.
2. `answer_u1_camera_stream` submits one bounded answer.
3. `add_u1_camera_ice_candidates` accepts bounded, deduplicated candidates.
4. `close_u1_camera_stream` idempotently releases the session.

The last three helpers are app-only tools hidden from model-visible inventory.
The connector alone talks to the U1's fixed signaling route; the printer peer
identifier and origin never enter widget or model-readable data. Video flows
over the negotiated read-only peer connection. If negotiation fails, the
existing `get_u1_camera_frame` snapshot loop remains available.

`show_u1_status` still includes a 1200 x 1500 PNG status card for hosts that
cannot mount an MCP Apps component.

## Source development

Bun and the untracked root `.env` are developer-only conveniences:

```sh
cd plugins/u1-print-studio/app
bun install
bun run check
bun test src/*.test.ts
bun run bundle
bun run start
```

The source `../.mcp.json` is intentionally a Bun adapter. For widget work
without a host, `bun run dashboard` serves the standalone loopback dashboard
at `http://127.0.0.1:8788/dashboard`. It uses the same tool-call shape while
retaining the exact HTTP signaling adapter for development coverage.

Tailscale Serve/Funnel and personal OAuth remain optional legacy developer
adapters in `server.ts`; they are not part of installation, setup, doctor, or
the normal-user architecture.

## Self-contained runtime evidence

`bun run bundle:runtime` builds the ignored macOS arm64 executable at
`dist/u1-print-studio`, disables automatic `.env` and `bunfig.toml`
loading, embeds the widget, and applies an ad-hoc signature for local
validation. The executable can run `--help`, `setup`, `doctor --offline`,
and `mcp` without an installed Bun runtime.

The ad-hoc signature is not a distribution signature. Cross-platform builds,
Developer ID signing, notarization, release checksums, installers, upgrades,
rollback, and external channel publication remain later evidence gates.

No local validation in this slice accesses or controls physical printer
hardware.
