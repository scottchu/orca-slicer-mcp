# Open questions

These are discovery prompts, not an implementation backlog. The first groups
cover the two peer subsystems and their handoff.

## Orca Preparation environment

- Should upstream OrcaSlicer `2.4.2` or Snapmaker Orca `2.3.5` be the first
  supported backend, and which target printer or workflow decides the choice?
- Which discovered CLI subset passes a real fixture slice and GUI-versus-CLI
  parity check for the selected backend?
- Which model/project input and output formats are required first?
- Where do printer, filament, and process profiles come from, and how are their
  versions or fingerprints captured?
- How are embedded project settings, profile inheritance, explicit overrides,
  and conflicts resolved and shown?
- Which warnings, estimates, thumbnails, previews, or plate data can be
  obtained reproducibly on macOS without the Linux-only progress pipe and
  result file?
- How are custom G-code, local paths, temporary files, output overwrite, and
  resource exhaustion bounded?
- Should the first manual-support slice support only enforcer and blocker
  volumes, or also generate Orca's mesh-facet painting bitstream?

## Printer Operations environment

- Which exact Snapmaker U1 firmware behaviors and vendor-specific semantics
  apply to the observed private-LAN Fluidd/Moonraker-compatible surface?
- Which commands are available during an active print, especially live Z-offset?
- Are command changes temporary for the session or persisted to the printer?
- What camera already exists, and what angle and lighting can it provide?
- Must control work away from the home network in the first release?
- Where should the first notifications arrive?

## Preparation-to-operations handoff

- What is the minimum prepared-artifact manifest and versioning scheme?
- Which compatibility checks must pass before upload or start is offered?
- Does upload belong to Preparation, Operations, or a handoff coordinator for
  the first environment?
- How are upload, queue or selection, start, acknowledgement, and observed
  printing represented as separate states?
- How is the prepared artifact correlated to the printer's job identity and
  eventual print session?
- Which retries are idempotent, and which require renewed authorization?

## Product behavior

- Which events deserve interruption versus passive history?
- What information makes a notification actionable?
- Which commands always require immediate confirmation?
- What bounded actions, if any, may be pre-authorized for a session?
- What is the required response when telemetry and camera evidence disagree?
- How should the system represent confidence without implying certainty?

## Runtime and data

- Should the first Bun deployment keep the Printer Operations monitor
  in-process, and what evidence would justify extracting it to an Elixir daemon?
- Which inbound surfaces follow MCP first, and which contract test proves HTTP
  or CLI can use the same application core?
- Where will it run: workstation, Raspberry Pi, NAS, or another always-on host?
- How much session history and camera evidence should be retained?
- Is local-only storage a requirement or merely the default?
- What authentication boundary protects printer control and remote access?

## Evaluation

- What constitutes a reliable end-to-end observation session?
- Which controlled failure scenarios can be reproduced safely?
- How will command acknowledgement be distinguished from observed effect?
- What image set is representative across plates, filament colors, lighting,
  and camera positions?
- How will user feedback be captured without treating it as infallible ground
  truth?

## Naming

- What product name reflects both Orca Preparation and Printer Operations
  without implying that either peer subsystem is the whole product?
- Should this repository be renamed after the first architecture decision, or
  only once an implementation direction is proven?
