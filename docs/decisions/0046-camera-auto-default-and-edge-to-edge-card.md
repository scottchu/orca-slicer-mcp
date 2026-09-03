# 0046 — Camera Auto default and edge-to-edge card

- Status: user-adopted direction; candidate validation, independent approval and deployment pending
- Date: 2026-09-03
- Owners: project maintainers
- Milestone: F0 / CAM-008, UI-004; delivery ledger C04, C06, C08

## Context

PR101 is deployed with Snapshot/Live/Auto, Camera footer and Refresh. Subsequent
phone feedback records failure, one Live/30 FPS success after retries, and another
failure after about 10 seconds. Local served-dashboard probes did not reproduce
that failure, so its stage and root cause remain unresolved.

The user selected default automatic snapshots, two modes, quiet polling and a
compact card with edge-to-edge lower media. The final failure placement is a
bottom-left overlay on the Camera media; the intermediate footer/header-slot
proposals are superseded. This record changes presentation and diagnosability,
not the evidence needed to close C08.

## Decision

Camera alone supersedes decision0041's footer/error placement and decision0044's
snapshot-first/manual-retry bootstrap. Other widgets retain their footer/Refresh
and adjacent error contracts. Keep all immutable compatibility resource bytes;
new current resources carry the new behavior.

- Use a thin header containing icon/title/state, measured FPS and accepted frame
  time. Remove the Camera footer and Refresh button. The media spans the full
  lower card edge with square top corners; outer-card radius and overflow
  containment clip the bottom corners.
- Keep generic animated icon `Switch` at bottom right, 88px wide and 44px high,
  with only Auto/Live. Auto is the default; remove single-Snapshot mode. Preserve
  keyboard/focus, reduced motion and accessible labels/targets.
- Render only the safe short failure reason persistently at bottom left inside
  the media. At narrow widths move it one row above the controls within that
  same media, without collision or greater card height. No reserved header error
  row or footer remains. Successful Auto recovery does not clear this reason;
  the next explicit Live attempt clears it.
- Auto makes one snapshot request at a time and schedules the next 1.5 seconds
  after completion. Automatic polling produces no success message or success
  announcement. A new mount neither reads nor writes saved Live intent; only an
  explicit Live choice starts Live. The same mounted card resumes its explicit
  current mode after hide/show. Live failure returns to actual Auto behavior.
- MCP validates/decodes a valid opening result without another initial frame
  request, then schedules Auto after 1.5 seconds. Missing delivery waits at most
  15 seconds; authoritative malformed/error delivery enters neutral error
  immediately. These errors schedule Auto retry after 1.5 seconds. Dashboard
  retains request bootstrap. Neither path overlaps acquisition or revives stale
  work after mode change, hide or disposal.

The service owns connections, timers, modes, decode and cleanup; components
subscribe and render. The closed `lastLiveFailure` contract in CAM-008 captures
the first winning stage/outcome before teardown, with bounded elapsed time,
connection state and actual frame-evidence boolean. It persists through Auto and
clears on the next Live attempt. Cancellation, hide, disposal and stale epochs
create no failure. Only a short safe stage/outcome label reaches the overlay;
raw errors, addresses, signaling, credentials and session identifiers never do.
All existing deadlines, watchdogs, authorization and acquisition guards remain.
This diagnostic record causes no additional acquisition.

Neutral acquisition-error skeletons, hidden stale media/telemetry and stable
loading/error/recovery geometry remain required. Accepted decoded/presented
frames alone support Live/FPS; timed callbacks do not. The prior generic Footer
statusText proposal is not required. Planned Camera v13/observation v17 and shared
consumer artifacts require final build/resource evidence before acceptance.

## Consequences

Current records may adopt this direction before candidate code passes; the
PR101 three-mode release remains the deployed baseline until guarded shipment.
All 55 ledger IDs remain, including eight legacy MCP observation views, unfinished
Queue/Fans/Job History, Progress no-action, F07 discussion and separate c6.
Screen Sharing remains paused. No authentication, network or printer-control
change follows from this decision.

Existing fullscreen uses same-document native API or local CSS. A host fullscreen
API exists, but host display-mode integration is unfinished and outside this
slice; this decision does not claim phone fullscreen works.

## Validation and delivery boundary

Cover default Auto, quiet single-flight polling, valid/missing/malformed MCP
bootstrap, hide/show, late results and disposal in real/synthetic service tests.
Verify diagnostic retention through Auto, safe labels, reset/cancellation and
unchanged timeout guards. Test actual current MCP resources and affected shared
consumers, with old aliases bound to unchanged hashes.

Rendered checks must cover narrow/desktop and enlarged text: 44px controls,
88px Switch, readable bottom-left reason clear of controls, edge clipping and
stable card/media geometry without stale accessible telemetry. Source, synthetic
media, actual served dashboard and phone outcomes are distinct evidence layers.
A single owner runs required frozen-candidate validation, followed by exact
independent approval and u1-ship deployment/restart of BOTH services plus scoped
installed-resource behavior. Reliable phone Live remains a separate open gate.
