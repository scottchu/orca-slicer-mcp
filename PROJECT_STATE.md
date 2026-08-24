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
- Evidence-maturation order: chronological log, reviewed knowledge, repeated
  fixtures, then code, skill, and MCP.

## Capability state

### Orca Preparation

- Candidate environments observed: upstream OrcaSlicer `2.4.2` and Snapmaker
  Orca `2.3.5` on macOS. One later Snapmaker Orca U1 pilot succeeded, but the
  first supported product backend is not yet selected.
- CLI help, executable fingerprints, profile boundary, macOS diagnostics
  limitations, and manual-support 3MF representations are documented in
  `docs/orca-preparation-findings.md`.
- The pilot required resolved machine/process data, four complete filament-slot
  profiles, and post-slice `T2` verification after repeated exits including
  `139`; its [log](docs/logs/2026-08-23-snapmaker-orca-u1-petg-print-pilot.md)
  and [provisional knowledge](docs/knowledge/snapmaker-orca-cli-preparation.md)
  are durable.
- Model/project intake, profile resolution, slicing, inspection, artifact
  validation, review bundles, and manifest remain unimplemented as product
  code.

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
  checks passed; real installed Orca executables were inspected, and one later
  user-authorized Snapmaker Orca slice succeeded after recorded failures. No
  product runtime exists.
- Delivery validation is local-only; no hosted validation workflow is
  configured or required.
- Protocol/simulator: live Moonraker read-only response shapes, WebSocket
  upgrade, and server notifications were observed; printer-object subscription,
  fixtures, and reconnect tests are pending.
- Real printer: ready/standby telemetry, one live camera frame, and one
  user-authorized U1 print through reported `22/22` completion were observed.
  Product subscription, reconnect, and command-correlation behavior remain
  untested.
- User outcome: two requested PETG parts were obtained once. The long CLI
  debugging path is not accepted as a repeatable workflow, and later fit and
  mechanism failures are separate design evidence.

## Open risks and unknowns

- The first product Orca backend remains unselected between the two observed
  editions. One Snapmaker Orca path worked, but synthetic-fixture
  repeatability, complete-profile schema, deterministic behavior, GUI parity,
  and support round-tripping are unverified.
- The pilot printer is a Snapmaker U1 with a Moonraker-compatible connection
  path; broader target acceptance is unverified.
- The observed exit `139` guard and incomplete-filament tool collapse have not
  yet been reproduced with clean negative fixtures.
- Prepared-artifact schema and upload/start ownership are unknown.
- Always-on host, camera placement and lighting, and network boundary are
  unknown.
- Notification destination is unknown.
- Live command capabilities and persistence semantics, including Z-offset, are
  unknown for the target hardware.
- Authentication, authorization, and remote-access boundaries are undecided.

## Next action

Run the first no-printer repetition from the provisional knowledge record using
Snapmaker Orca `2.3.5`, a synthetic two-object fixture, and explicit complete
profiles. Record a new chronological log and then reproduce the negative crash
and tool-collapse cases. Do not upload or start them. Promote only repeated
findings into code; skill and MCP work follow tested code. Printer Operations
subscription, reconnect, host, notification, and network-boundary discovery
remain pending afterward.
