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

### Upgrade behavior

After installing or upgrading the Marketplace plugin, start a new ChatGPT or
Codex task before testing it. Existing tasks may still refer to the previous
installed MCP process and widget URI. The current-only source candidate targets
`ui://u1-print-studio/observation-v17.html` and the separate `camera-v13.html`;
old version aliases and compatibility-only resources are being retired. The
current observation resource retains all nine selectors, including eight legacy
renderers still used by current functionality. Active `/widget` serves current
MCP observation; the obsolete `/camera-widget` route and duplicate HTML retire.
Current tool/resource/build inventories require the cleanup candidate's final
validation; prior 32-resource/30-alias acceptance is historical. PR101 remains
the deployed baseline until exact review and guarded shipment complete.
A failure from an old task is not evidence that the current staged
runtime is missing; verify the installed descriptor, executable, and a fresh
task separately.

## Source development

The current source is one SvelteKit application with user-adopted Bun 1.4.0, one
`package.json`, and one frozen `bun.lock`. PR93 independently validated and
deployed the unified routing/runtime; only Fans is a native Kit page, as below.
There is no nested `ui` dependency installation.

- `src/components/common` contains shared generic UI primitives; other
  component folders compose domain views. CSS lives with components.
- `src/lib/client` contains pure TypeScript presentation/controllers and
  transport ports; `src/lib/server` contains private services and use cases.
- `src/routes` owns actual Kit API, dashboard, and Lab routing. Only
  `/dashboard/fans` currently uses a native prerendered/hydrated Kit page.
  Other dashboard/Lab/widget routes serve existing packaged HTML through Kit
  endpoints; that routing integration does not complete native UI migration.
- `src/entrypoints/widgets` builds the eight self-contained widget artifacts
  from shared components. `src/entrypoints/stdio-main.ts` uses the same server
  services for MCP stdio.

Run source commands from this application root:

```sh
cd plugins/u1-print-studio/app
bun install --frozen-lockfile
bun run ui:check
bun run check
bun run build:server
bun run dashboard
```

`build:server` runs the Kit build and bundles its official adapter-node handler
for the same Bun runtime. Its output includes `dist/server.js`, `handler.js`,
client/prerendered files, and a closed `build-manifest.json`; the thin HTTP
bootstrap preserves the existing raw-target, role, body, and lifecycle guards.
The bootstrap uses native close/finish events to retain newly created resources
until response completion or abort, without socket polling. Its process-local
`U1_KIT_BODY_SIZE_LIMIT=Infinity` avoids imposing the adapter's default512KiB cap
on the existing MCP transport; explicit128KiB endpoint limits remain unchanged.
This does not modify a user `.env` or LaunchAgent.
Build/test package commands disable Bun dotenv/config autoload at each nested
invocation. The repository checker does the same at its outer boundary. Kit reads
only the guarded `config/no-dotenv` directory, whose sole permitted entry is
`.gitkeep`; explicit runtime process/env-file behavior is preserved separately.
It does not introduce a Node runtime. The untracked repository-root `.env` is
an explicit development convenience, not a release build input.

Use `bun run ui:test -- <affected test paths>` for focused client tests and
`bun test <affected tests/server paths>` for server tests. The separate
`build:live-*`/`verify:live-*` commands build/check focused production widgets;
`ui:build`/`ui:verify` build/check the three private Lab packages. The root
repository checker and guarded shipping workflow own required full validation;
do not repeat full suites merely because another agent takes over.

The source `../.mcp.json` is a Bun adapter. `bun run dashboard` serves the
private loopback directory at `http://127.0.0.1:8788/dashboard` with the same
process-owned services used by MCP. Public/dashboard role and authentication
boundaries remain explicit. Camera connection lifecycle remains in its service;
components subscribe and render.

The synthetic Svelte Lab is available only from the private dashboard at
`/dashboard/lab` and its ten named children: `overview`, `progress`, `thermals`,
`heads`, `jobs`, `job_history`, `queue`, `fans`, `bed_mesh`, and `camera`.
It is absent from MCP resource inventory. Lab widgets select the exact closed
pathname before mount, preserving the initial title and avoiding a
post-mount directory-to-widget transition.

The current-only cleanup removes the orphan legacy vendor-injection pipeline
and duplicate widget HTML. Current self-contained resource builds retain local
pinned dependencies, required license notices, deterministic bytes and no runtime
asset fetches. Build-contract minimums follow current assets/routes, with negative
coverage for retired routes/resources/tools. Hash/tamper/isolation/security,
runtime-configuration preservation, rollback and exact-build shipping guards
remain. Decision0042 removed repository widget/package byte caps; production
minification and size reporting remain.

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
successfully shipped PR34. It reuses `scripts/u1_service.py`, requires
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
the deployed PR34 release has verified real JPEG and Bed Mesh observations; that evidence is
recorded in the active iteration and does not prove mounted-phone/live-video
behavior, calibration quality, or physical print acceptance.
