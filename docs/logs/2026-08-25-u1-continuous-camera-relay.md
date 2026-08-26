# U1 continuous camera relay

- Date: 2026-08-25
- Scope: read-only continuous camera presentation
- Evidence boundary: static/software, public protocol, real printer, and
  mounted-host outcomes are recorded separately

## User-directed sequence

1. Preserve the moved uncommitted implementation and the backup stash named
   `move-u1-camera-media-relay-to-orca-worktree`; do not reapply the stash.
2. Keep MCP strictly separate from server and application business logic.
3. Replace per-frame MCP polling as the primary `Go Live` path with one MCP
   grant followed by a continuous media response; retain polling as fallback.
4. Preserve the concurrent plugin cachebuster work and the local PNG result
   contract.
5. Validate, deploy only the exact new Tailscale media handler, collect
   read-only live evidence, and deliver through a pull request.

## Acceptance boundary

- Application policy owns tickets, leases, concurrency, maximum duration, and
  serial frame iteration without MCP or HTTP dependencies.
- The printer adapter yields only validated raw JPEG observations.
- The HTTP adapter serves only exact `GET /media/camera.mjpeg` and cannot proxy
  arbitrary paths or URLs.
- The HTTP MCP surface exposes four read-only tools. The one-time media URL is
  widget-private `_meta`, never model-readable `content` or
  `structuredContent`.
- The widget makes one stream-opening MCP call per user intent and falls back
  to the old non-overlapping snapshot loop on failure.
- `show_u1_status` retains a PNG in local and remote results.
- The existing Funnel root and OAuth/MCP handlers remain unchanged; only an
  exact `/media` handler is added.
- No printer control is implemented or invoked.

## Evidence

### Static/software

- Initial dependency-free worktree validation could not start because the moved
  worktree had no `node_modules`; `bun install --frozen-lockfile` restored the
  locked dependencies without changing the lockfile.
- `bun run check && bun test`: passed 29 tests with 143 assertions before the
  documentation and skill update. The final delivery rerun is recorded in the
  active iteration validation record.
- The repaired concurrent expectation requires a valid PNG from local
  `show_u1_status`; it is intentionally preserved.
- The first real-source harness used the provisional 3-second plus 3-second
  per-frame budget. It produced no two-frame result within the 30-second stream
  window, and its diagnostic client then waited after iteration stopped. The
  temporary loopback harness was interrupted; the deployed service was not
  involved.
- The composition was corrected to reuse the established 20-second first
  attempt plus one 10-second retry from `readU1CameraJpeg`. This changes only
  the camera-source budget; ticket, lease, HTTP, MCP, and widget contracts are
  unchanged.
- Skill Creator validation passed for both changed skills. Plugin Creator
  validation passed for the repository source, synchronized personal source,
  and exact installed cache.
- The final plugin cachebuster is `0.2.0+codex.20260826005742`. The repository,
  personal source, and installed stdio bundles share SHA-256
  `6913657ebe92cbcfe372170023545080390953a2e96f9c65412a068e17b31fd1`.
- An installed-cache stdio smoke exposed only the intended three local tools,
  reached the configured printer, and returned text plus a valid 1200 by 1500
  PNG. The remote-only stream tool is absent from stdio because stdio has no
  HTTPS media route.

### Public protocol

- Before the change, the standard-HTTPS Funnel origin had an unrelated root
  proxy plus exact `/.well-known`, `/auth`, `/health`, `/mcp`, and `/oauth`
  handlers. Deployment added only `/media` and preserved every prior target.
- The service LaunchAgent now runs from the synchronized personal plugin source
  while retaining the existing ignored environment file. Its plist and OAuth
  state were backed up owner-only before restart. The OAuth state remained
  byte-for-byte unchanged after both service restarts.
- Local and public `/health` returned HTTP 200 with the personal-OAuth marker.
  Public OAuth metadata still advertises authorization code, refresh token,
  PKCE S256, and only `u1.monitor`; protected-resource metadata still names the
  exact `/mcp` audience.
- Unauthenticated public MCP returned HTTP 401. Exact
  `/media/camera.mjpeg` without a ticket returned HTTP 401 locally and
  publicly, while an unknown `/media` path returned HTTP 404 in both places.
  The unrelated public root continued to return HTTP 200.
- A fresh authenticated four-tool inventory requires a newly linked or
  refreshed host. The current conversation retained its pre-reinstall
  three-tool surface and was not treated as deployment evidence.

### Real printer

- With the corrected production source budget, the relay application service
  and exact HTTP media adapter returned HTTP 200 with
  `multipart/x-mixed-replace; boundary=u1-camera-frame` and carried two complete
  validated JPEGs over one connection. The bounded observation took 1.9
  seconds and transferred 430,390 bytes. No image was retained.
- After repairing abort-listener and backpressure-close cleanup, the final
  synchronized source repeated the same two-frame proof in 2.6 seconds with
  428,954 transferred bytes. The HTTP boundary and both JPEG markers remained
  valid; no image was retained.
- A current thread-level status call used a stale MCP process and reported
  offline even though the exact installed-cache smoke and real-camera relay
  succeeded. That stale result is not evidence of current printer or service
  unreachability.
- No printer command, upload, start, pause, resume, cancel, tuning, or G-code
  request was issued.

### Mounted desktop and iOS

- Pending separate host-visible evidence. A valid tool result or media stream
  does not prove that either host mounted or displayed it.
