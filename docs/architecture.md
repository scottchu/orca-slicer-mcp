# Provisional architecture

This is a hypothesis to guide discovery, not an implementation commitment.

```text
User / agent / automation
           |
      MCP interface
           |
Printer operations service  <---->  event and session store
     |          |       |
 printer     camera   notification
 adapter     adapter      adapter
     |
 printer or vendor API
```

## Why a resident service

MCP provides request/response tools for an agent, but monitoring must continue
when no agent turn is active. A persistent local service is therefore expected
to own printer connections, consume telemetry, track sessions, evaluate event
rules, and deliver notifications.

The MCP interface should expose the service to agents; it should not be the
only process keeping a print alive or monitored.

## Provisional components

### Printer operations service

Owns print-session state, command authorization, command correlation,
post-action verification, and event generation.

### Printer adapter

Translates a vendor protocol into normalized observations and capability-aware
commands. It must preserve vendor-specific semantics when normalization would
hide an important safety difference.

### Camera adapter

Captures timestamped images or streams and associates observations with a print
session. Image interpretation should be distinct from image acquisition.

### Notification adapter

Delivers completion, failure, and attention events. Delivery state belongs in
the event history so a sent alert is distinguishable from a delivered one.

### Event and session store

Retains state transitions, observations, recommendations, authorizations,
commands, results, and outcomes. The initial implementation may be local and
single-user.

### MCP interface

Offers narrow tools such as inspecting printers and sessions, requesting an
observation, issuing an authorized command, and reviewing event history. Long
running monitoring belongs to the service.

## Boundaries still to validate

- whether the first printer is best served by a vendor API, Moonraker, OctoPrint,
  MQTT, or another protocol;
- whether the operations service and MCP server should initially be one process;
- required event-store durability and replay semantics;
- camera transport and storage policy;
- local-only versus remote-access deployment;
- notification transport and authentication.
