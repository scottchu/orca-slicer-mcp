# 0019 — Gate camera sessions behind mounted-widget activation

- Status: accepted for the user-authorized camera workflow repair
- Date: 2026-08-28
- Owners: project maintainers

## Context

The camera-only widget works in the private dashboard, but upgrades remain hard
to reason about across the local plugin cache, public HTTP MCP process, mounted
host descriptor cache, and existing conversation snapshots. An old ChatGPT
conversation continued to expose the formerly model-visible
`open_u1_camera_stream` descriptor. Calling it allocated one of two WebRTC
leases even though no current widget could answer or close the offer. Two stale
calls then made every current camera view report busy until the process was
restarted or the 30-minute lease expired.

The stable user intent is still one command: open the printer camera. Snapshot,
live negotiation, and fallback are implementation states inside that widget.
Host visibility metadata improves the UI but cannot be the server's only
authorization boundary because old descriptors can outlive an upgrade.

## Decision

- Keep `open_printer_camera` as the only model-visible camera command. Make
  `get_u1_camera_frame` app-only beside the four signaling helpers. The overall
  remote inventory is three model-visible read-only tools and five app-only
  read-only helpers.
- A Go Live interaction first calls the app-only frame helper with
  `authorizeLive: true`. The application camera relay issues a short-lived,
  one-time activation token. The token exists only in result `_meta`, never in
  model-readable content or structured content.
- `open_u1_camera_stream` requires that activation token and exchanges it for a
  bounded stream lease. Empty, replayed, expired, or fabricated calls fail
  before contacting the printer or consuming stream capacity. Visibility
  metadata remains defense in depth, not the authorization mechanism.
- A newly opened WebRTC session must receive its browser answer within 15
  seconds. Otherwise the application service aborts signaling and releases the
  lease automatically. Answered sessions retain their existing bounded maximum
  duration and explicit idempotent Close behavior.
- Bump the focused resource to `camera-v2.html` and keep `camera-v1.html`
  readable as a compatibility alias serving the same current asset. Existing
  cached JavaScript may still fail safely, but it cannot allocate a session
  without a current activation.
- Publish a small runtime contract on `/health`: base runtime version, tool
  schema version, and camera widget version. Rollout verification must compare
  these fields with the staged contract before declaring the restarted service
  current.
- Preserve the private enrollment listener, OAuth/passkeys, owner config,
  Tailscale Serve/Funnel handlers, read-only printer boundary, and all control
  exclusions. A rollout may restart the two existing U1 LaunchAgents only after
  source and packaged validation passes; it must compare OAuth state and
  Tailscale routing before and after.

This supersedes decision 0018 where it kept `get_u1_camera_frame`
model-visible and where an app-only stream call without a current widget grant
could allocate a session. It preserves decision 0018's presentation, fallback,
rendered-frame gate, and private dashboard boundaries.

## Consequences

- Old conversations can retain stale labels, but stale direct stream calls no
  longer starve the current widget.
- Users see one camera action. Snapshot refresh and signaling remain internal
  widget operations rather than separate user choices.
- A browser or host that cannot complete the answer promptly releases capacity
  automatically and moves to snapshot fallback.
- Models no longer acquire standalone JPEG frames through the MCP inventory.
  Monitoring can still present the status card and focused camera widget; image
  interpretation through a direct frame tool is deferred until it can be
  exposed without duplicating the camera UX.
- Health-version coherence makes a mixed source/runtime deployment observable,
  but existing mounted conversations still require a fresh task to load a new
  descriptor and resource URI.

## Validation

Require TypeScript, all Bun tests, both bundles, plugin and touched-skill
validation, repository checks, and whitespace checks. Tests must prove:

- exactly one model-visible camera command, three model-visible tools total,
  and five app-only helpers;
- the activation token is widget-private, one-time, bounded, required by stream
  open, and absent from model-readable fields;
- an unanswered session releases its lease rapidly while an answered session
  remains usable until Close or ordinary expiry;
- both camera resource URIs serve the exact current asset with empty external
  CSP domains;
- both widgets acquire activation only after explicit Go Live; and
- health reports tool schema 3 and camera widget `camera-v2`.

Record packaged/install, public edge, private dashboard, real-printer, mounted
Codex, mounted ChatGPT, and mobile evidence separately. A successful private
dashboard does not prove a mounted host, and no printer control is authorized.
