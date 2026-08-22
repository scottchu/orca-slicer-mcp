# Scope and safety boundary

This document describes the current product hypothesis. It is intentionally
narrower than the long-term vision.

## First useful scope

The first end-to-end release should support one known printer setup and one
local operator. It should:

- discover or configure a printer connection;
- expose a capability inventory for that printer;
- create and track a print session;
- report live printer state, temperatures, progress, and errors;
- capture an on-demand camera snapshot when a camera is available;
- retain a timestamped event history;
- notify the user when a print completes, fails, or needs attention;
- allow explicit user-directed pause, resume, and cancel commands;
- verify the observed state after every command.

The exact printer, protocol, camera source, and notification channel have not
yet been selected.

## Later scope

- uploading, slicing, and printer-specific job configuration;
- speed, fan, temperature, flow, and live Z-offset adjustment where supported;
- camera-assisted first-layer and failure assessment;
- bounded, pre-authorized intervention policies;
- multiple printers, users, and vendor adapters;
- richer automation and historical analysis.

## Explicitly out of the first release

- fully autonomous printer operation;
- unattended camera-based Z-offset correction;
- universal support for every printer or slicer;
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

- **Unit or simulated evidence:** useful for software behavior, not hardware
  safety.
- **Protocol evidence:** proves the observed behavior of a specific API or
  firmware version.
- **Physical-printer evidence:** proves behavior only for the tested printer,
  configuration, and conditions.
- **User outcome evidence:** shows that alerts or interventions actually reduce
  supervision or prevent failed prints.
