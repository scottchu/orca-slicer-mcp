# Project state

Last updated: 2026-08-22

## Baseline

- Canonical repository: `scottchu/orca-slicer-mcp` (private).
- Accepted baseline: initial repository foundation at `26affbb` on `main`.
- Product boundary: real-time printer operations; slicing is one later adapter.
- Runtime implementation: none.

## Active iteration

- Iteration: `docs/iterations/2026-08-22-m0-first-printer-discovery/`
- Status: active discovery.
- Roadmap milestone: M0 — Product and hardware discovery.

## Capability state

- Printer connection: not selected or implemented.
- Persistent monitoring: not implemented.
- Camera observation: not configured.
- Notifications: not configured.
- Human-directed control: not implemented.
- Agent recommendations or autonomous corrections: not implemented.
- Slicing and upload: intentionally deferred.

## Acceptance state

- Static/software: repository foundation only; no product runtime exists.
- Protocol/simulator: not started.
- Real printer: not started.
- User outcome: not evaluated.

## Open risks and unknowns

- First printer model, firmware, and connection protocol are unknown.
- Always-on host, camera source, and network boundary are unknown.
- Notification destination is unknown.
- Live command capabilities and persistence semantics, including Z-offset, are
  unknown for the target hardware.
- Authentication, authorization, and remote-access boundaries are undecided.

## Next action

Complete the active M0 discovery brief with the exact first environment. Then
record tested protocol evidence and decide the first printer adapter and local
deployment boundary before choosing the application runtime.
