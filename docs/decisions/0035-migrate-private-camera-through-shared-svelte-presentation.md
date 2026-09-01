# 0035 — Migrate private Camera through shared Svelte presentation

Status: accepted bounded implementation direction; exact source acceptance pending
Date: 2026-09-01

## Context and scope

UI-001/UI-003 and the active WIDGET_TRACKS require real Camera migration after
the independently shipped synthetic lab. The current dashboard and MCP Camera
still use legacy HTML. Lab calibration media cannot prove live transport parity
and must never become a production fallback. Role-separated design accepts the
following smallest dashboard-only cutover; it does not authorize a backend,
authentication, tool inventory or public resource migration.

## Decision

- Keep `/dashboard/camera` as the user route. Its existing private host may load
  one exact `/dashboard/camera_widget` self-contained compiled Svelte artifact.
  Preserve current Camera CSP, method/path isolation and source-derived shipping
  hashes. Independent budget review accepted exactly one production HTML capped
  at100,000 raw UTF-8 bytes after an89,404-byte measurement. Rebuild final bytes,
  enforce deterministic checking and negative budget/graph tests; do not borrow
  from either lab artifact's unchanged individual or aggregate budget.
- Reuse the independently reviewed shared HostRpc from the real Fans slice.
  One standard MCP Apps initialize/request/notification bridge owns transport;
  existing host compatibility metadata and saved authorized intent remain
  additive. Camera adds no listener, fetch, camera URL or alternate transport.
- A strict Camera transport adapter closes the existing five frame/signaling
  calls and validates private response metadata against backend limits. Opaque
  activation/session/signaling data never enters model-visible state, logs,
  storage or presentation DOM. The injected session owns generation, deadlines,
  answer/candidate acknowledgement, lease release and only this viewer's peer.
- One generic persistent VideoSurface owns DOM/media display and frame evidence;
  real CameraWidget is zero-raw composition. Fullscreen/PiP changes presentation
  only, preserving video, srcObject, tracks and peer identity. Lab producer code
  remains outside the entire production import graph.
- Snapshot-first acquisition never authorizes live. Only explicit Go Live or
  one saved authorized live-intent restoration activates the existing one-use
  capability flow. Frame operations expire at 10 seconds, decode at 1.5 seconds;
  first-frame/stall/disconnect deadlines are 8/5/3 seconds. Fallback polls at
  1.5 seconds without overlapping acquisition. Late offers release their own
  returned lease and never resurrect a closed or hidden widget.
- Source time commits only after image decode or advancing presented evidence.
  FPS needs a full one-second advancing-frame window and expires after 1.5
  seconds without evidence. Unknown FPS stays absent. Snapshot refresh during
  live video does not interrupt playback. Feedback is transient and out of flow.
- Pagehide disposes this viewer's work and retains only prior live intent;
  pageshow restores it at most once. Close clears that intent. Other viewers'
  sessions and the server's shared upstream remain untouched.

## Acceptance before cutover

Independent exact source review and separate validation must cover private
metadata validation, snapshot decode/generation races, late lease cleanup,
bounded startup/stall/disconnect, request rejection, parent/iframe epochs,
saved intent/BFCache and persistent native/CSS fullscreen/PiP. Fixture browser
tests must verify truthful FPS, non-flow feedback, one announcement and normal
top-right status with readable enlarged-text reflow at 320/390/590/720 widths.
Build graph checks exclude every lab producer/fixture, Three and observation
data. Private/public/method/path/CSP/cache tests and exact release inventory
are required. Static/protocol/browser evidence does not prove actual phone or
real-printer behavior; guarded delivery and those evidence layers stay separate.

Legacy `/camera-widget` and all MCP Camera aliases stay reachable and unchanged
until a separately reviewed parity/inventory cutover replaces them. This slice
must not be reported as the complete Camera/MCP migration while they remain.
