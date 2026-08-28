# Project state

Last updated: 2026-08-28

## Baseline

- Canonical repository: `scottchu/orca-slicer-mcp` (private).
- Product boundary: Orca Preparation and Printer Operations are peer
  subsystems joined by an explicit prepared-job/print-session handoff.

## Active iteration

- Iteration: `docs/iterations/2026-08-23-f0-dual-subsystem-foundation/`.
- Roadmap milestone: F0 — Dual-environment and contract discovery.
- User-directed execution order: finish the secure remote U1 Print Studio
  Monitor slice before further host, preparation, or printer work.
- Decision 0017 adds a private enrollment listener plus explicit STUN and
  short-lived TURN REST boundaries while preserving decision 0016's local-first
  normal-user direction and MCP Apps signaling bridge.
- Pull request 20 merged the mounted-app compatibility repair as `4d4ea2f`.
  Personal Marketplace version `0.2.0+codex.20260827215815` is installed and
  the public service plus private dashboard are healthy.
- Decision 0018 accepts a dedicated snapshot-first camera presentation:
  `open_printer_camera` links `camera-v1.html`, while WebRTC allocation and
  follow-up signaling are app-only widget actions. The source slice is on
  `scottchu/camera-only-widget` pending pull-request delivery; it has not yet
  changed the installed plugin or live services.

## Implemented local-first slice

The repository contains the smallest desktop-local read-only connector slice:

- one shared `u1-print-studio setup`, `doctor`, and `mcp` CLI contract;
- owner-only versioned configuration accepting only private, link-local,
  loopback, or `.local` printer origins with no credentials, query, fragment,
  or proxy-shaped path;
- fixed-route status, snapshot, and `webrtc-camerastreamer` operations behind
  the U1 Printer Operations adapter;
- self-contained status and camera MCP Apps widgets with empty external CSP
  domains and no direct `fetch` call;
- the current `status-v4.html` widget plus a `status-v3.html` compatibility
  resource for cards retained across an upgrade;
- hosted offer, answer, ICE-candidate, and close signaling through MCP Apps
  `tools/call`;
- application-owned opaque WebRTC sessions with offer/answer/candidate size
  limits, per-call and cumulative candidate budgets, duration, expiry,
  concurrency, failure teardown, answer idempotency, and idempotent close;
- snapshot fallback and the existing 1200 by 1500 PNG status result;
- one release MCP manifest pointing to a staged standalone executable;
- one documented Marketplace/Homebrew/npm packaging contract around the same
  runtime and onboarding path;
- an ephemeral macOS arm64 executable that embeds its widget, disables
  automatic dotenv/bunfig loading, and runs without a Bun executable at
  runtime.

The self-contained artifact is local validation evidence only. Its ad-hoc
signature is not suitable for distribution. No package, marketplace entry,
installed plugin, OAuth state, or hosted service was changed.

## Implemented secure remote source slice

- Public personal OAuth and Streamable HTTP MCP require standard HTTPS and
  `u1.monitor`; public passkey enrollment routes return 404.
- A separately configured enrollment origin binds a distinct loopback-only
  listener with private health and exact enrollment routes. It stays bound
  after enrollment while enrollment itself returns 404.
- ICE defaults empty. Explicit bounded STUN may come from HTTP env or the
  standalone owner-only schema-2 config; setup preserves STUN on later rewrites.
- Preferred remote TURN uses bounded URLs plus a server-only shared secret.
  Each camera open derives an `expiry:nonce` username and base64 HMAC-SHA1
  credential shared only with the printer peer and widget-private metadata.
- The HTTP server keeps env-only deployment compatibility when no standalone
  config exists. An existing malformed optional config and partial TURN
  configuration fail closed.
- No live process, LaunchAgent, Serve/Funnel route, OAuth state, installed
  plugin, printer, or external service was changed.

## MCP surface

Model-visible read-only tools:

1. `show_u1_status`
2. `get_u1_status`
3. `get_u1_camera_frame`
4. `open_printer_camera`

App-only read-only signaling helpers:

1. `open_u1_camera_stream`
2. `answer_u1_camera_stream`
3. `add_u1_camera_ice_candidates`
4. `close_u1_camera_stream`

There is no upload, start, pause, resume, cancel, G-code, generic proxy,
Control, or Admin tool in the runtime. Preparation and authorized-start skills
remain procedural guidance; they are not runtime authority.

## Packaging and onboarding boundary

- Normal users do not need Tailscale, MagicDNS, public DNS, manual OAuth,
  environment-file editing, or Bun.
- `plugins/u1-print-studio/.mcp.release.json` starts
  `./app/runtime/u1-print-studio mcp`.
- `plugins/u1-print-studio/.mcp.json` remains a Bun and env-file source
  adapter for repository development only.
- The owner-only schema-2 config is the standalone path for optional explicit
  STUN because the packaged runtime does not load the repository `.env`.
- Marketplace, Homebrew, and npm are future delivery adapters. This slice does
  not claim installation, upgrades, rollback, signing, notarization, or
  cross-platform acceptance.
- The current printer adapter still invokes the platform `curl` executable
  with a fixed route and argument allowlist. Replacing that platform dependency
  remains an explicit runtime-hardening question.
- Tailscale Serve/Funnel, personal OAuth, and the exact
  `/media/camera.webrtc` adapter remain optional developer compatibility
  paths, never normal-user requirements.

## Capability state

### Orca Preparation

- Upstream OrcaSlicer `2.4.2` and Snapmaker Orca `2.3.5` were observed on
  macOS; the first supported backend remains unselected.
- One user-authorized Snapmaker Orca U1 PETG pilot and two PLA repetitions are
  recorded in `docs/logs/`. Those runs do not establish a reusable
  preparation runtime.
- Model/project intake, profile resolution, slicing, artifact validation,
  review bundles, and prepared-job manifests remain unimplemented product code.

### Preparation-to-operations handoff

- The prepared-artifact/manifest schema is not defined.
- Target compatibility, upload ownership, start ownership, and
  printer-job/session correlation remain open.

### Printer Operations

- The read-only U1 status, snapshot, PNG, and camera signaling slice is
  implemented.
- Persistent subscription monitoring, reconnect epochs, durable observations,
  notifications, recommendations, and control are not implemented.
- Status calls still invoke the observation adapter directly; the WebRTC
  session path is the first transport-independent application service.

## Acceptance state

### Static/software

- TypeScript checks pass.
- Sixty-nine tests with 398 assertions pass across MCP resource/tool contracts,
  enrollment isolation and restart behavior, standard HTTPS, exact four-plus-
  four visibility, STUN/TURN parsing and derivation, model privacy, env-only
  HTTP compatibility, config migration/preservation, PNG, rendered-frame live
  gating, fallback, session bounds, exact HTTP compatibility, OAuth, packaging,
  and dashboard allowlists.
- The source stdio bundle emits `stdio.js` plus status and camera widget assets.
- The macOS arm64 standalone runtime builds, verifies under an ad-hoc local
  signature, prints help, writes a schema-2 `0600` config, preserves explicit
  STUN on setup rewrite, and passes `doctor --offline` without contacting
  hardware. Malformed ICE URLs and partial TURN configuration fail closed.
- Personal Marketplace staging and installation passed on this macOS arm64
  machine. The installed cache used the standalone executable, matched the
  staged SHA-256, passed signature verification, reached the configured printer
  read-only, returned a JPEG snapshot and WebRTC offer, and explicitly closed
  the bounded camera session.

The active iteration's `VALIDATION.md` is authoritative for exact commands
and final repository-check results.

### Protocol/simulator

- Tests use in-memory MCP transports, loopback HTTP fixtures, and fake printer
  signaling. They prove contract behavior, not public routing, a TURN
  allocation, a real printer, or a mounted host.
- Earlier repository evidence records real read-only Moonraker and H264
  observations. It is not evidence for this newly composed local connector.

### Physical printer

- Post-merge read-only validation contacted the configured printer for status,
  one JPEG, and bounded H264 offers. No upload, start, pause, resume, cancel,
  G-code, or other printer-control action ran.
- Earlier authorized print and camera observations remain historical evidence
  in their dated logs and do not prove this slice.

### User outcome

- The secure remote source is merged, installed as
  `0.2.0+codex.20260827215815`, and deployed with public authenticated MCP plus
  tailnet-only enrollment. Public/private routes, both supervised services,
  installed-client resources, authenticated status and JPEG metadata, and
  bounded WebRTC offer/close checks passed. Mounted ChatGPT/Codex playback and
  visible browser video remain unverified because no browser-control surface
  was connected.

## Open risks and F0 questions

- Distribution targets, Developer ID signing, notarization, checksums, upgrade,
  rollback, and cross-platform packaging are unresolved.
- The private repository has no license file; license selection and
  third-party notice review block any claim or publication of an open-source
  distribution.
- The system-`curl` dependency and macOS local-network permission behavior
  need a dedicated portability decision.
- Native hosted-widget WebRTC rendering, FPS, UI-triggered Close, PiP,
  fullscreen, and fallback need fresh visual host evidence. Server-side open
  and close now pass against the real read-only camera path.
- No TURN REST service URLs or shared secret were supplied. Reliable remote
  media remains blocked on external provisioning plus observed allocation and
  mounted playback. Explicit STUN is only a compatibility step and discloses
  peer network metadata to its provider.
- The deployed route uses tailnet-only Serve 8447 to loopback 8789; Funnel is
  still enabled only on 443 and existing handlers were preserved.
- The first Orca backend and the prepared-job/session handoff remain open.
- Subscription, freshness, reconnect, history, notification destination, and
  remote identity/distribution boundaries remain open.
- A browser peer connection may receive network candidates in SDP as required
  for media; the prohibited behavior is direct iframe URL fetching or
  signaling, not the negotiated read-only WebRTC media path preserved by
  decision 0015.

## Next action

Use a fresh ChatGPT or Codex task to validate the cache-busted mounted widget,
then reload the private dashboard and record visible Go Live playback, FPS,
UI-triggered Close, PiP, and fullscreen separately. Keep the old-task MCP
snapshot, server-side signaling, mounted playback, TURN, printer protocol, and
user outcome as separate evidence layers.
