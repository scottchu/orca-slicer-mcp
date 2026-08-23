# Scope and safety boundary

This document describes the current product hypothesis. It is intentionally
narrower than the long-term vision.

## First useful scope

The first end-to-end release should support one known OrcaSlicer setup, one
known printer setup, and one local operator.

### Orca Preparation

It should:

- accept a supported model or project without overwriting the input;
- identify the selected printer, filament, and process profiles;
- record explicit configuration overrides and conflicts;
- invoke a known OrcaSlicer version through a bounded adapter;
- distinguish invocation success, artifact creation, and artifact validation;
- report warnings, estimates, and an identifiable output artifact;
- retain enough provenance to reproduce or explain the prepared job.

### Printer Operations

It should:

- discover or configure a printer connection;
- expose a capability inventory for that printer;
- create and track a print session;
- report live printer state, temperatures, progress, and errors;
- capture an on-demand camera snapshot when a camera is available;
- retain a timestamped event history;
- notify the user when a print completes, fails, or needs attention;
- allow explicit user-directed pause, resume, and cancel commands;
- verify the observed state after every command.

### Handoff

The first integrated release should link the prepared artifact and manifest to
an observed printer job and subsequent print session. Upload, selection or
queueing, start, and observation remain distinct. The exact ownership of upload
and start across the subsystem boundary is still a discovery question.

The exact OrcaSlicer invocation path, profile sources, printer, protocol,
camera source, and notification channel have not yet been selected.

## Later scope

- richer project editing, plate arrangement, and preview workflows;
- multiple OrcaSlicer versions and profile repositories;
- speed, fan, temperature, flow, and live Z-offset adjustment where supported;
- camera-assisted first-layer and failure assessment;
- bounded, pre-authorized intervention policies;
- multiple printers, users, and vendor adapters;
- richer automation and historical analysis.

## Explicitly out of the first release

- fully autonomous printer operation;
- unattended camera-based Z-offset correction;
- universal support for every printer or slicer;
- silent profile selection or arbitrary custom G-code execution;
- bundling slice, upload, and start into one implicit action;
- bypassing printer firmware limits or built-in safety controls;
- exposing printer control directly to the public internet;
- claiming a successful command without post-command observation;
- treating a visual model prediction as proof of a physical condition.

## Safety invariants

These are product requirements, not optional implementation details:

1. Every command is checked against the printer capability inventory and the
   current session state.
2. Consequential actions have an explicit authorization record.
3. Commands are idempotent where possible and carry a correlation identifier.
4. The service records intent, command result, and post-action observation.
5. Loss of telemetry, ambiguous state, or low-confidence diagnosis cannot be
   interpreted as success.
6. Agent policy cannot override firmware safety limits.
7. Emergency stop, pause, and cancel semantics are printer-specific and must be
   tested on the target hardware before being relied upon.
8. Camera data and printer identifiers are private local data by default.
9. User models, projects, profiles, custom G-code, generated artifacts, and
   temporary paths are private and potentially safety-relevant.
10. Preparation never authorizes upload or print start implicitly, and Printer
    Operations never mutates preparation profiles silently.
11. Monitor, Control, and Admin operations remain separate product surfaces.
12. The first release provides no generic HTTP, JSON-RPC, or G-code passthrough
    and exposes no host-administration tools.
13. MCP is an inbound adapter, not the system core; HTTP, CLI, and future
    surfaces reuse the same application use cases and policies.

## Example: live Z-offset

Z-offset illustrates the boundary between a useful loop and unsafe automation:

```text
observe -> diagnose -> propose bounded delta -> authorize -> apply
   ^                                                   |
   +---------------- re-observe -----------------------+
```

Before adjustment is enabled, the adapter must establish whether the printer
supports it during an active print, the units and limits, whether changes are
persistent, and how the effect can be verified. Camera assessment begins as a
recommendation, not an autonomous trigger.

## Definition of evidence

- **Static/software evidence:** deterministic code and unit checks, including a
  separately labeled real-tool integration subtype. A named OrcaSlicer version
  producing and validating an artifact for recorded inputs and profiles does
  not prove printer compatibility, printability, or physical success.
- **Protocol/simulator evidence:** proves behavior against fixtures, emulators,
  controlled endpoints, or a specific observed API or firmware version.
- **Physical-printer evidence:** proves behavior only for the tested printer,
  configuration, and conditions.
- **User outcome evidence:** shows that alerts or interventions actually reduce
  supervision or prevent failed prints.
