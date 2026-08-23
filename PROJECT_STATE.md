# Project state

Last updated: 2026-08-23

## Baseline

- Canonical repository: `scottchu/orca-slicer-mcp` (private).
- Branch point from `main`: `32762dd`.
- Product boundary: one product with two peer subsystems, Orca Preparation and
  Printer Operations, joined by an explicit prepared-job/session handoff.
- Runtime implementation: none.

## Active iteration

- Iteration: `docs/iterations/2026-08-23-f0-dual-subsystem-foundation/`
- Status: active dual-environment discovery; Orca Preparation discovery is
  currently first in execution order after the user's redirect.
- Roadmap milestone: F0 — Dual-environment and contract discovery.

## Capability state

### Orca Preparation

- Candidate environments observed: upstream OrcaSlicer `2.4.2` and Snapmaker
  Orca `2.3.5` on macOS; the first supported backend is not yet selected.
- CLI help, executable fingerprints, profile boundary, macOS diagnostics
  limitations, and manual-support 3MF representations are documented in
  `docs/orca-preparation-findings.md`.
- Model/project intake, resolved profile loading, slicing, inspection, artifact
  validation, review bundles, and manifest remain unimplemented.

### Preparation-to-operations handoff

- Artifact/manifest contract: not defined or implemented.
- Target compatibility, upload ownership, and start ownership: undecided.
- Printer-job/session correlation: not implemented.

### Printer Operations

- Printer connection: a redacted LAN Fluidd/Moonraker target is reachable;
  Moonraker HTTP and WebSocket paths are observed, but no adapter is implemented.
- Persistent monitoring: not implemented. The accepted model combines a full
  direct snapshot with ordered subscription deltas and reconnect resync.
- Camera observation: one read-only `1920x1080` snapshot was acquired; the frame
  was too dark for reliable diagnosis and no persistent capture exists.
- Notifications and human-directed control: not implemented.
- Agent recommendations or guarded corrections: not implemented.
- API exposure: Monitor, Control, and Admin are separate surfaces. Monitor is an
  explicit read-only allowlist; Admin and generic protocol or G-code passthrough
  are excluded from the first release.
- Application boundary: MCP is a replaceable inbound adapter. Domain ontology,
  policies, and monitor ports are surface- and runtime-independent.
- Runtime direction: Bun and TypeScript are acceptable for a first in-process
  implementation; an extracted Elixir monitor daemon remains possible through
  a versioned, language-neutral contract. No runtime has been scaffolded.

## Acceptance state

- Static/software: repository foundation and dual-subsystem product contract
  checks passed; real installed Orca executables were inspected without slicing
  a user model or creating a production artifact. No product runtime exists.
- Delivery validation is local-only; no hosted validation workflow is
  configured or required.
- Protocol/simulator: live Moonraker read-only response shapes, WebSocket
  upgrade, and server notifications were observed; printer-object subscription,
  fixtures, and reconnect tests are pending.
- Real printer: ready/standby telemetry and one live camera frame were observed;
  no active print, command, reconnect, or physical effect was tested.
- User outcome: not evaluated.

## Open risks and unknowns

- The first Orca backend remains unselected between the two observed editions;
  real fixture slicing, profile completeness, GUI parity, and support
  round-tripping are unverified.
- Exact first printer model is unknown; a Moonraker-compatible firmware and
  connection path are now observed.
- Prepared-artifact schema and upload/start ownership are unknown.
- Always-on host, camera placement and lighting, and network boundary are
  unknown.
- Notification destination is unknown.
- Live command capabilities and persistence semantics, including Z-offset, are
  unknown for the target hardware.
- Authentication, authorization, and remote-access boundaries are undecided.

## Next action

Run the smallest no-printer Orca Preparation experiment: select one observed
backend, one non-user fixture, and one explicit complete profile; produce and
statically validate a revisioned review bundle for matching-GUI preview. Do not
upload or start it. Printer Operations subscription, reconnect, exact-model,
host, notification, and network-boundary discovery remain pending afterward.
