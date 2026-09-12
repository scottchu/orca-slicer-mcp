# 0059 — Prioritize Camera reliability and fixed live widgets

- Status: implemented and released in PR125; scoped software/service verification complete, actual-phone acceptance open
- Date: 2026-09-11
- Milestone: F0 / CAM-008, UI-003, UI-004, OBS-011

The user stopped dynamic/composable expansion on 2026-09-11, requested existing
fixed Lab widgets in live use, and reported Camera dropping after about three
minutes followed by repeated crash/reload behavior. The screenshots show `Live
reply timed out` then `Could not load camera`; they establish visible failure,
not its cause. Camera reliability comes first; fixed-widget adoption follows.

Stop the dynamic/composable experiment's expansion; preserve source/history and
negative production-registration guards. Historical decisions0049/0051–0056
remain constraints on that preserved private experiment, not a live-widget plan.
The synthetic Lab remains isolated; fixed components may enter live routes
through existing normalized read-only observations and shared host adapters.

First implement Camera reliability and MCP Fans/Thermals/Queue using existing
live adapters/roots; Heads is already native. Then add live presentation
adapters for Progress/Current Job/History/Overview/Bed Mesh. Never cast fixture
DTOs into live input or replace null with zero. Preserve PR123's local Overview
failure isolation and all 55 delivery IDs, including unfinished product coverage.
This is implementation order within one release candidate covering Camera and
all nine fixed observation views, including already-native Heads. PR125 delivers
that integrated scope; the sequence does not imply separate releases.
Native renderer adoption does not close unrelated product-feature gaps or
actual-device acceptance.

A delayed answer timeout must not close connected freshly presented video.
Failed Auto snapshot acquisition uses 1.5/3/6/12/24/30-second backoff, reset after
an accepted frame; healthy cadence is unchanged. Verify sustained cases beyond
three minutes, recovery and cleanup. These are acceptance criteria, not a
confirmed explanation for the phone failure.

Keep receipts, source freshness, unknown/zero/stale/failure semantics, focus and
failure geometry. Preserve the existing interactive bridge and tools/schemas;
no new catalog or auth model is needed. Independent exact review, required
regression, unchanged shipping guards, both-service restart and scoped behavior
verification remain mandatory. Software, simulator, deployed-service, printer
and actual-phone evidence stay separate. No printer controls, authentication,
Tailscale changes or plugin reinstallation is authorized.

See [current evidence](../iterations/2026-08-23-f0-dual-subsystem-foundation/evidence/2026-09-11-fixed-widgets-camera-reliability.md).
