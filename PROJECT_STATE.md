# Project state

Last updated: 2026-08-23

## Baseline

- Canonical repository: `scottchu/orca-slicer-mcp` (private).
- Main baseline: initial repository foundation at `26affbb` on `main`.
- Working baseline for this iteration: `be883d3`.
- Product boundary: one product with two peer subsystems, Orca Preparation and
  Printer Operations, joined by an explicit prepared-job/session handoff.
- Runtime implementation: none.

## Active iteration

- Iteration: `docs/iterations/2026-08-23-f0-dual-subsystem-foundation/`
- Status: active product-boundary and dual-environment discovery.
- Roadmap milestone: F0 — Dual-environment and contract discovery.

## Capability state

### Orca Preparation

- OrcaSlicer version and invocation boundary: not selected or implemented.
- Model/project intake and profile resolution: not implemented.
- Slicing, inspection, artifact validation, and manifest: not implemented.

### Preparation-to-operations handoff

- Artifact/manifest contract: not defined or implemented.
- Target compatibility, upload ownership, and start ownership: undecided.
- Printer-job/session correlation: not implemented.

### Printer Operations

- Printer connection: not selected or implemented.
- Persistent monitoring and camera observation: not implemented.
- Notifications and human-directed control: not implemented.
- Agent recommendations or guarded corrections: not implemented.

## Acceptance state

- Static/software: repository foundation and dual-subsystem product contract
  checks passed on the working branch; no product runtime exists.
- Protocol/simulator: not started.
- Real printer: not started.
- User outcome: not evaluated.

## Open risks and unknowns

- First OrcaSlicer edition, version, invocation path, profile sources, and
  supported automation behavior are unknown.
- First printer model, firmware, and connection protocol are unknown.
- Prepared-artifact schema and upload/start ownership are unknown.
- Always-on host, camera source, and network boundary are unknown.
- Notification destination is unknown.
- Live command capabilities and persistence semantics, including Z-offset, are
  unknown for the target hardware.
- Authentication, authorization, and remote-access boundaries are undecided.

## Next action

Complete the active F0 brief with the exact first OrcaSlicer and printer
environments and a provisional handoff contract. Then record real-tool and
read-only protocol evidence before choosing subsystem runtimes or adapters.
