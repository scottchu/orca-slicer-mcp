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

The project is currently in discovery and foundation work. There is no working
OrcaSlicer or printer integration yet, and no claim of printable output,
autonomous control, or unattended-safe printer operation.

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
- [Environment boundary](docs/environment.md)
- [Open questions](docs/open-questions.md)
- [Decision records](docs/decisions/README.md)

## Current milestone

Define the first concrete OrcaSlicer and printer environments plus their
handoff contract. Current discovery may advance one track before the other;
that execution order does not make either subsystem secondary. See the
[roadmap](docs/roadmap.md) for dependency gates and exit criteria.

## Repository status

This repository intentionally contains documentation before implementation.
The OrcaSlicer invocation boundary, runtime, language, deployment model,
printer protocol, camera source, notification channel, and upload/start
ownership remain open decisions.

Run the technology-neutral repository contract check with:

```bash
./scripts/check-repository.sh
```
