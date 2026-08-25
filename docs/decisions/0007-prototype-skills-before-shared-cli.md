# 0007 — Prototype skills before a shared CLI

- Status: accepted
- Date: 2026-08-25
- Owners: project maintainers

## Context

One PETG pilot and two PLA repetitions exposed useful preparation, handoff, and
monitoring behaviors, but they also exposed environment-specific crashes,
profile inheritance, embedded object overrides, plate-coordinate failures,
bed-type loss, route differences, and camera uncertainty. Encoding the current
shell path as a reusable CLI would prematurely turn observed correlations into
an implementation contract.

The user changed the maturation order after the PLA repetitions: preserve the
chronological journal and reviewed knowledge, then create three thin skills and
a plugin-level status presentation. A shared CLI should come later only if
repeated use proves it useful.

## Decision

Create a repo-local `u1-print-studio` plugin with three peer workflow skills:

- preparation produces and validates an artifact without printer contact;
- print start performs an explicitly authorized upload and start handoff with
  separate acknowledgements and observations;
- monitoring remains read-only, chooses its next check adaptively, and renders
  concise visual status cards.

The skills capture decision guidance and safety boundaries only. They contain
no reusable slicer, printer, or monitoring scripts. The journal and knowledge
records remain the authority for provisional behavior and unknowns.

Defer a shared CLI, MCP server, persistent monitor, and interactive app backend
until repeated skill use identifies stable operations and demonstrates that
automation would improve the user outcome.

## Consequences

- The three user workflows become discoverable without presenting current
  manual commands as a supported runtime.
- Status presentation can improve immediately while remaining grounded in
  telemetry and camera uncertainty.
- Manual execution remains slower and can still vary by environment.
- Each skill use supplies evidence about stable inputs, outputs, checks, and
  failure modes for a later CLI contract.
- The peer-subsystem architecture is preserved: preparation is distinct from
  printer operations, while start and monitor remain separate operations
  surfaces.

## Validation

Validate plugin and skill structure locally and run repository contract,
whitespace, link, and privacy checks. Revisit the deferral only after several
additional uses show repeated command shapes, stable profile resolution,
predictable handoff semantics, and a clear reduction in user effort. A
beautiful status card alone does not prove a persistent monitoring runtime.
