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
Optional repeatable `--stun-url` values add a bounded explicit STUN list to the
same owner-only config and survive later setup rewrites. The default remains
empty; no public STUN service is a hidden normal-user dependency. A configured
STUN service learns peer network metadata and adds an availability dependency.
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

`open_printer_camera` mounts the camera-only resource with one relayed snapshot.
When the user then selects Go Live, the widget sends `tools/call` messages
through the MCP Apps host bridge:

1. `get_u1_camera_frame` returns the current snapshot and a one-time live
   activation only in widget-private result metadata.
2. `open_u1_camera_stream` consumes that activation, creates an opaque,
   duration- and concurrency-bounded session, and returns the offer only in
   widget-private result metadata. Unanswered offers release after 15 seconds.
3. `answer_u1_camera_stream` submits one bounded answer.
4. `add_u1_camera_ice_candidates` accepts bounded, deduplicated candidates.
5. `close_u1_camera_stream` idempotently releases the session.

All five camera helpers are app-only tools hidden from model-visible inventory.
The connector alone talks to the U1's fixed signaling route; the printer peer
identifier and origin never enter widget or model-readable data. The connector
terminates that private H264 peer and creates an independent read-only peer for
each viewer. If downstream negotiation fails, the existing
`get_u1_camera_frame` snapshot loop remains available.

`show_u1_status` still includes a 1200 x 1500 PNG status card for hosts that
cannot mount an MCP Apps component.

### Upgrade behavior

After installing or upgrading the Marketplace plugin, start a new ChatGPT or
Codex task before testing it. Existing tasks may still refer to the previous
installed MCP process and widget URI. Current source descriptors point to
`ui://u1-print-studio/observation-v5.html` and the separate `camera-v5.html`.
Observation-v4/v3/v2/v1 and camera-v4 serve current-asset compatibility aliases;
status-v4/v3 and camera-v3/v2/v1 preserve frozen older presentation bytes.
The source contract is runtime 0.3.3/schema 7, with twelve resources, nine
observation selectors, and unchanged two-visible/eight-app-only tool counts.
Bed Mesh is software-validated, pending final exact-commit review and shipping;
the deployed PR33 services remain runtime 0.3.2/schema 6/observation-v4/camera-v5
until the next verified rollout. A failure from an old task is not evidence that the current staged
runtime is missing; verify the installed descriptor, executable, and a fresh
task separately.

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
without a host, `bun run dashboard` serves the standalone loopback status
directory at `http://127.0.0.1:8788/dashboard` and the focused camera widget at
`http://127.0.0.1:8788/dashboard/camera`. The camera route mounts the same HTML
as `ui://u1-print-studio/camera-v5.html` (v4 is a current alias; v3/v2/v1
retain frozen compatibility bytes). Both use the same tool-call shape
while retaining the exact HTTP signaling adapter for development coverage.

The runtime uses bundled pure-TypeScript `werift` peers to terminate one H264
printer stream locally and fan it out to independent downstream viewers. No
separate media service is installed. `U1_CAMERA_MAX_VIEWERS` defaults to 16 and
accepts 1 through 64. Discovered Tailscale host addresses are advertised only
on downstream server-owned offers; optional STUN/TURN configuration provides
additional paths. Printer offer SDP, candidates, peer identity, and LAN
addresses never enter a public response.

The repository-only `$u1-ship` skill and `scripts/u1_ship.py` define a guarded
operator sequence for locally validated review, merge, exact-build deployment,
restart of both services, verification, and bounded rollback. The new script
is software-validated, pending final exact-commit review. It reuses `scripts/u1_service.py`, requires
explicit task authority, and is not installed as part of the printer plugin.

The standalone dashboard is a separate opt-in process. A Tailscale Serve route
to port 8788 returns 502 whenever that process is not supervised and running;
the public MCP service on port 8787 does not implicitly start it. Treat this
dashboard as developer diagnostics, not as the plugin's mounted UI.

## Secure remote developer adapter

The user-authorized personal remote slice keeps Streamable HTTP MCP plus OAuth
authorization, PKCE, refresh tokens, and passkey assertion on
`U1_PUBLIC_BASE_URL`, which must use standard HTTPS port 443. Every MCP request
requires `u1.monitor`. Optional exact HTTP WebRTC signaling remains protected by
the short-lived single-use capability issued from an authenticated Monitor
request.

Passkey enrollment is not part of the public surface. Public
`/auth/enroll` and descendant routes always return 404. Configure the private
surface with both:

```text
U1_ENROLLMENT_BASE_URL=https://<same-magicdns-hostname>:<private-serve-port>
U1_ENROLLMENT_PORT=<distinct-loopback-port>
```

The process binds a second enrollment-only listener to `127.0.0.1`. That
listener serves only `/health` and the exact enrollment routes and must be
exposed only through a separate tailnet-only Tailscale Serve HTTPS port with
Funnel disabled. It remains bound after enrollment so private health can be
verified; enrollment routes then return 404 until a local reset creates a new
one-time flow. The public and private origins share a hostname and WebAuthn RP
ID but verify their distinct origins. The one-time private URL remains in the
owner-only runtime link file.

ICE configuration is explicit. `U1_STUN_URLS_JSON` overrides owner-config STUN
for the HTTP service. Robust remote use should additionally configure:

```text
U1_TURN_URLS_JSON=["turn:relay.example:3478?transport=udp","turns:relay.example:5349?transport=tcp"]
U1_TURN_SHARED_SECRET=<server-side secret>
U1_TURN_CREDENTIAL_TTL_SECONDS=1800
```

Do not commit or print the shared secret. Each camera open derives a bounded
RFC5766 TURN REST username (`expiry:nonce`) and base64 HMAC-SHA1 credential. The
shared secret never leaves the server. The printer upstream and each downstream
viewer receive separate derived credentials; only the downstream viewer's
credential enters widget-private metadata. No derived credential, printer URL,
peer ID, or session capability enters model-readable results. Partial TURN
configuration and invalid TTLs fail closed. STUN-only is a compatibility path,
not evidence of reliable remote media; real TURN allocation and mounted
ChatGPT/Codex playback require separate observation.

Tailscale Serve/Funnel and personal OAuth remain optional developer adapters;
they are not part of installation, setup, doctor, or the normal-user
architecture. Never reset Tailscale routing. Preserve unrelated handlers and
do not change a live LaunchAgent, Funnel, Serve route, OAuth state, or installed
plugin until source checks pass and the coordinator approves an exact plan.

## Self-contained runtime evidence

`bun run bundle:runtime` builds the ignored macOS arm64 executable at
`dist/u1-print-studio`, disables automatic `.env` and `bunfig.toml`
loading, embeds the widget, and applies an ad-hoc signature for local
validation. The executable can run `--help`, `setup`, `doctor --offline`,
and `mcp` without an installed Bun runtime.

The ad-hoc signature is not a distribution signature. Cross-platform builds,
Developer ID signing, notarization, release checksums, installers, upgrades,
rollback, and external channel publication remain later evidence gates.

Source fixtures do not access or control physical printer hardware. Separately,
the deployed PR33 release has a verified real JPEG snapshot; that evidence is
recorded in the active iteration and does not prove mounted-phone/live-video
behavior or pending Bed Mesh data.
