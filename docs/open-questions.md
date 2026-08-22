# Open questions

These are discovery prompts, not an implementation backlog. The first group is
the immediate priority.

## First environment

- What exact printer model and firmware version should be supported first?
- How is it currently connected: LAN, USB, vendor cloud, OctoPrint, Moonraker,
  MQTT, or something else?
- Which commands are available during an active print, especially live Z-offset?
- Are command changes temporary for the session or persisted to the printer?
- What camera already exists, and what angle and lighting can it provide?
- Must control work away from the home network in the first release?
- Where should the first notifications arrive?

## Product behavior

- Which events deserve interruption versus passive history?
- What information makes a notification actionable?
- Which commands always require immediate confirmation?
- What bounded actions, if any, may be pre-authorized for a session?
- What is the required response when telemetry and camera evidence disagree?
- How should the system represent confidence without implying certainty?

## Runtime and data

- Should the first service and MCP interface be one deployable process?
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

- What product name reflects printer operations without implying OrcaSlicer is
  the core?
- Should this repository be renamed after the first architecture decision, or
  only once an implementation direction is proven?
