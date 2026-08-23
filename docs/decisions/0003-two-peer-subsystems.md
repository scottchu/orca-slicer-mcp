# 0003 — Use two peer subsystems with an explicit handoff

- Status: accepted
- Date: 2026-08-23
- Owners: project maintainers
- Supersedes: [0001](0001-printer-operations-product-boundary.md)

## Context

Decision 0001 correctly identified that persistent observation and guarded
printer control cannot be reduced to an OrcaSlicer MCP wrapper. It overcorrected
by making Printer Operations the entire product boundary and moving OrcaSlicer
preparation to a later adapter. The clarified product has two substantive
capability groups, and neither is subordinate to the other.

Preparation attempts and physical execution also have different identities,
lifecycle states, risks, and evidence. Treating a sliced file as a print session
would erase provenance and encourage false success claims. Treating slicing as
an Operations adapter would hide the model, profile, inspection, and artifact
workflow that users expect from the product.

## Decision

The product has two peer subsystems:

1. **Orca Preparation** owns model or project intake, printer, filament, and
   process configuration, explicit overrides, OrcaSlicer invocation, result
   inspection, and production of an identifiable prepared print job and
   manifest. OrcaSlicer is an adapter inside this subsystem.
2. **Printer Operations** owns persistent print sessions, printer capability
   discovery, telemetry, camera observations, events, notifications,
   authorization, commands, and post-action verification. Printer, camera, and
   notification integrations remain adapters inside this subsystem.

The subsystems join through an explicit, versioned handoff. The prepared print
job is the aggregate; its artifact and manifest are the handoff payload and
carry source, configuration, tool-version, warning, estimate, and output
identity. Upload, queue or selection, print start, acknowledgement, and observed
printing are separate states. A product-managed print session links back to the
exact manifest and artifact hash and advances from observed printer state. An
externally originated job records unavailable or unknown provenance explicitly.

The exact ownership and transport for upload and start remain discovery
questions. Neither subsystem may silently mutate the other's state. Upload,
queue or selection changes, and print start each require action-specific
authorization unless a bounded policy for that exact action has separately been
approved. Authorization binds the artifact, manifest, target, action, validity,
and retry scope so it cannot be reused after a material change.

Current execution order may focus on one track while evidence or hardware for
the other is unavailable. That order is recorded in the active iteration and
does not change the peer product relationship.

## Consequences

- Product, architecture, roadmap, requirements, and status records report Orca
  Preparation, handoff, and Printer Operations separately.
- A real OrcaSlicer run is a labeled tool-integration subtype of
  Static/software evidence, not physical print evidence.
- A successful slice does not prove target compatibility, printability, safety,
  upload, start, or physical success.
- The resident-service rationale applies to Printer Operations; Preparation may
  be invoked on demand unless discovery demonstrates another need.
- Shared interfaces such as MCP may expose both subsystems without collapsing
  their ownership or lifecycle models.

## Validation

This decision is supported when each subsystem can evolve and be tested against
its own contract, and an integrated flow can link a prepared artifact to an
observed print session without implicit authorization or false success. Revisit
the boundary if real OrcaSlicer or printer evidence shows that the handoff
cannot be kept explicit without losing required vendor behavior.
