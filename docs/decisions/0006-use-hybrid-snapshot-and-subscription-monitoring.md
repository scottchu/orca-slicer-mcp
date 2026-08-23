# 0006 — Use hybrid snapshot and subscription monitoring

- Status: accepted
- Date: 2026-08-23
- Owners: project maintainers

## Context

Moonraker supports point-in-time HTTP queries and persistent WebSocket
subscriptions. Direct queries are simple and useful for capabilities, current
snapshots, camera images, files, and history. They cannot reliably capture
short-lived events or state transitions while no user is asking. Subscription
updates, however, are deltas and cannot reconstruct complete state without an
initial snapshot and reconnect rules.

## Decision

Use a hybrid observation model:

- direct queries bootstrap server readiness, capabilities, complete current
  state, camera snapshots, and other on-demand or relatively static data;
- persistent subscriptions maintain dynamic printer, job, progress,
  temperature, sensor, error, and connection state;
- the monitor merges ordered deltas into an initial full snapshot and records
  relevant transitions as session events;
- disconnect makes state stale, offline, or unknown, and reconnect requires a
  new complete snapshot and connection epoch before accepting new deltas;
- normal MCP, HTTP, CLI, and UI status requests query application current state
  rather than calling Moonraker directly.

Camera images remain separately timestamped observations. A permanent video
ingest is not required for the first monitor.

Follow the classifications and acceptance evidence in
`docs/monitoring-model.md`.

## Consequences

- The product can notify on transitions that occur between user requests.
- Current state includes source time, freshness, and connection epoch rather
  than presenting cached values as live facts.
- The resident monitor owns reconnection, resubscription, state reconstruction,
  and event recording.
- Direct refresh remains possible as an explicit application use case.
- Tests need complete snapshots, partial deltas, disconnects, duplicate or
  reordered events, and reconnect fixtures.

## Validation

Protocol fixtures should prove correct snapshot-plus-delta reconstruction and
freshness behavior. A real-printer run should record a complete print lifecycle
and a safe reconnect observation. Neither passing fixture tests nor receiving a
WebSocket notification proves physical printer behavior.
