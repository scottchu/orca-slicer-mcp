# Orca Preparation and Printer Operations

This project is exploring one 3D-printing product with two peer subsystems:

- **Orca Preparation** owns model or project intake, printer, filament, and
  process configuration, slicing, result inspection, and production of an
  identifiable prepared print job. OrcaSlicer is an adapter and tool boundary
  inside this subsystem.
- **Printer Operations** owns persistent print sessions, live observation,
  notifications, authorized control, and post-action verification.

The subsystems meet at an explicit print-job-to-print-session handoff. That
handoff preserves artifact and configuration provenance, separates slicing,
upload, start, and observed printing, and never treats an acknowledgement as
proof of a physical result.

The intended operations loop is:

```text
observe -> explain -> notify or propose -> authorize -> act -> verify
```

The project is currently in discovery and foundation work. A narrow
desktop-local read-only U1 status, snapshot, and camera-signaling connector now
exists; no reusable Orca Preparation runtime, printer-control runtime,
autonomous control, or unattended-safe printer operation is claimed.

## Start here

- [Current project state](PROJECT_STATE.md)
- [Next-agent restart route](NEXT_AGENT.md)
- [Product vision](docs/vision.md)
- [Scope and safety boundary](docs/scope.md)
- [Roadmap](docs/roadmap.md)
- [Provisional architecture](docs/architecture.md)
- [Working agreement](docs/workflow.md)
- [Project continuity](docs/continuity.md)
- [Working requirements](docs/requirements.md)
- [Domain ontology](docs/ontology.md)
- [U1 Print Studio plugin architecture](docs/u1-print-studio-plugin-architecture.md)
- [Monitoring model](docs/monitoring-model.md)
- [Environment boundary](docs/environment.md)
- [Open questions](docs/open-questions.md)
- [Decision records](docs/decisions/README.md)

## Current milestone

Define the first concrete OrcaSlicer and printer environments plus their
handoff contract. Current discovery may advance one track before the other;
that execution order does not make either subsystem secondary. See the
[roadmap](docs/roadmap.md) for dependency gates and exit criteria.

## Repository status

This repository intentionally keeps implementation behind evidence and
decision records. The local-first read-only connector is one F0 slice, not a
commitment for the full product runtime. The first Orca backend, signed
distribution targets, persistent monitor, notification channel, prepared-job
manifest, and upload/start ownership remain open decisions.

Run the technology-neutral repository contract check with:

```bash
./scripts/check-repository.sh
```
