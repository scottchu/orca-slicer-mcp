# Printer Operations Layer

> Working title. The repository directory still uses the earlier
> `orca-slicer-mcp` name while the product boundary is being clarified.

This project is exploring a real-time, agent-operated control and monitoring
layer for 3D printers. Slicing and model preparation are capabilities of the
system, not its center.

The intended product loop is:

```text
observe -> explain -> notify or propose -> authorize -> act -> verify
```

The project is currently in discovery and foundation work. There is no working
printer integration yet, and no claim of autonomous or unattended-safe printer
control.

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

Choose the first supported printer and connection path, then prove that a
resident local service can observe one real print session reliably. See the
[roadmap](docs/roadmap.md) for the exit criteria.

## Repository status

This repository intentionally contains documentation before implementation.
The runtime, language, deployment model, printer protocol, camera source, and
notification channel remain open decisions.

Run the technology-neutral repository contract check with:

```bash
./scripts/check-repository.sh
```
