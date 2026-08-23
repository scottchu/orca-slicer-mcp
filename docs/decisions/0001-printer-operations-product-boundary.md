# 0001 — Printer operations is the product boundary

- Status: superseded by [0003](0003-two-peer-subsystems.md)
- Date: 2026-08-21
- Owners: project maintainers

## Context

The repository began with an `orca-slicer-mcp` framing. That name suggests a
tool centered on slicing, model configuration, and print submission. The actual
user problem extends across the active print: continuous observation,
notifications, remote control, diagnosis, human feedback, and eventually
bounded interventions such as live Z-offset adjustment.

An MCP server alone also does not provide the persistent lifecycle needed to
monitor a printer while no agent request is active.

## Decision

Treat the product as a real-time printer operations layer. A print session is
the central domain concept. A persistent operations service owns monitoring and
events, while MCP is one interface for agents. OrcaSlicer integration remains a
possible preparation adapter rather than the system boundary.

The directory and repository name remain unchanged while discovery is ongoing;
renaming is a separate decision.

## Consequences

- Monitoring, event history, notifications, and control precede slicing in the
  roadmap.
- Printer, camera, notification, and slicer integrations need adapter
  boundaries.
- Safety policy, authorization, and post-command verification are core domain
  behavior.
- A resident service is expected even if it initially shares a process with the
  MCP interface.
- The project should avoid claiming broad autonomy before observation and
  human-directed control are reliable.

## Validation

The decision is supported if one printer can be observed and controlled through
a print-session model without coupling the core to OrcaSlicer. Revisit it if
protocol discovery shows that reliable operations cannot be separated from a
specific vendor or preparation workflow.
