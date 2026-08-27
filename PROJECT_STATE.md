# Project state

Last updated: 2026-08-26

## Baseline

- Canonical repository: `scottchu/orca-slicer-mcp` (private).
- Product boundary: Orca Preparation and Printer Operations are peer
  subsystems joined by an explicit prepared-job/print-session handoff.

## Active iteration

- Iteration: `docs/iterations/2026-08-23-f0-dual-subsystem-foundation/`.
- Roadmap milestone: F0 — Dual-environment and contract discovery.
- User-directed execution order: finish the local-first open-source U1 Print
  Studio rollout before further host, preparation, or printer work.
- Decision 0016 supersedes decision 0015 only for hosted signaling transport:
  the hosted widget now uses the MCP Apps bridge rather than directly calling
  the exact media HTTP route.
- Delivery: branch `scottchu/local-first-rollout`, pull request
  https://github.com/scottchu/orca-slicer-mcp/pull/15.

## Implemented local-first slice

The repository contains the smallest desktop-local read-only connector slice:

- one shared `u1-print-studio setup`, `doctor`, and `mcp` CLI contract;
- owner-only versioned configuration accepting only private, link-local,
  loopback, or `.local` printer origins with no credentials, query, fragment,
  or proxy-shaped path;
- fixed-route status, snapshot, and `webrtc-camerastreamer` operations behind
  the U1 Printer Operations adapter;
- one self-contained MCP Apps widget with empty external CSP domains and no
  direct `fetch` call;
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

## MCP surface

Model-visible read-only tools:

1. `show_u1_status`
2. `get_u1_status`
3. `get_u1_camera_frame`
4. `open_u1_camera_stream`

App-only read-only signaling helpers:

1. `answer_u1_camera_stream`
2. `add_u1_camera_ice_candidates`
3. `close_u1_camera_stream`

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
- Forty-nine tests with 275 assertions pass across MCP resource/tool
  contracts, PNG dimensions/signature, widget no-fetch/CSP, snapshot fallback
  wiring, local configuration, packaging manifests, session bounds/privacy,
  exact HTTP compatibility, OAuth regression, and dashboard allowlists.
- The source stdio bundle emits `stdio.js` plus its widget asset.
- The macOS arm64 standalone runtime builds, verifies under an ad-hoc local
  signature, prints help, writes a `0600` config, and passes
  `doctor --offline` without contacting hardware. Rewriting an existing config
  now explicitly tightens its mode to `0600`, and malformed camera stream
  envelopes retain any valid session ID long enough for bounded teardown.

The active iteration's `VALIDATION.md` is authoritative for exact commands
and final repository-check results.

### Protocol/simulator

- Tests use in-memory MCP transports, loopback HTTP fixtures, and fake printer
  signaling. They prove contract behavior, not a real printer or mounted host.
- Earlier repository evidence records real read-only Moonraker and H264
  observations. It is not evidence for this newly composed local connector.

### Physical printer

- No physical printer was accessed or controlled for this rollout.
- Earlier authorized print and camera observations remain historical evidence
  in their dated logs and do not prove this slice.

### User outcome

- Marketplace, Homebrew, npm, fresh-host widget mounting, installation on
  another machine, iOS rendering, and normal-user onboarding are unverified.

## Open risks and F0 questions

- Distribution targets, Developer ID signing, notarization, checksums, upgrade,
  rollback, and cross-platform packaging are unresolved.
- The private repository has no license file; license selection and
  third-party notice review block any claim or publication of an open-source
  distribution.
- The system-`curl` dependency and macOS local-network permission behavior
  need a dedicated portability decision.
- Native hosted-widget WebRTC rendering, Close, PiP, fullscreen, and fallback
  need fresh host evidence after explicit authorization to contact a printer.
- The first Orca backend and the prepared-job/session handoff remain open.
- Subscription, freshness, reconnect, history, notification destination, and
  remote identity/distribution boundaries remain open.
- A browser peer connection may receive network candidates in SDP as required
  for media; the prohibited behavior is direct iframe URL fetching or
  signaling, not the negotiated read-only WebRTC media path preserved by
  decision 0015.

## Next action

Review the local-first pull request and repository records. Do not publish or
install it externally. The next smallest implementation gate is a reproducible
signed packaging fixture for one channel or removal of the system-`curl`
runtime dependency, chosen from new evidence. Mounted-host or real-printer
validation requires fresh explicit authorization and must be recorded in its
own evidence layer.
