# Provisional architecture

This is a hypothesis to guide discovery, not an implementation commitment.

```text
                         User / agent / automation
                                    |
                              MCP interface
                      /                             \
          Orca Preparation                    Printer Operations
 source + profiles -> OrcaSlicer        resident service <-> event store
                         |                |          |          |
       PreparedPrintJob aggregate        printer    camera   notification
     (artifact + versioned manifest)     adapter    adapter      adapter
                         |                  |
                         +--- handoff ------+
                                  |
                       authorize upload intent
                                  |
                             upload result
                                  |
                        authorize start intent
                                  |
                       start acknowledgement
                                  |
                                  v
                         printer or vendor API
                                  |
                       observed job -> PrintSession
```

The two top-level subsystems are peers. The handoff between them is a contract,
not shared mutable ownership.

## Runtime shape

MCP provides request/response tools for an agent, but monitoring must continue
when no agent turn is active. A persistent local service is therefore expected
to own printer connections, consume telemetry, track sessions, evaluate event
rules, and deliver notifications.

The MCP interface may expose both subsystems to agents. It should not be the
only process keeping a print alive or monitored. Preparation may initially be
on demand; discovery must not assume it needs the same resident lifecycle.

## Orca Preparation components

### OrcaSlicer adapter

Invokes an identified OrcaSlicer version with bounded files, profiles, and
configuration. It captures exit state, diagnostics, statistics, and output
identity without claiming undocumented CLI behavior.

### Preparation record and artifact store

Retains source identity, profile versions, overrides, warnings, estimates,
OrcaSlicer version, and output hashes. Inputs are not overwritten, and staged
artifacts are not automatically uploaded or started.

## Printer Operations components

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

## Shared MCP interface

Offers narrow Preparation tools for inputs, profiles, slice requests, and
result inspection plus Operations tools for printers, sessions, observations,
authorized commands, and event history. Long-running monitoring belongs to the
operations service.

## Handoff contract

The provisional handoff is:

```text
PreparationRequest -> PreparedPrintJob(artifact + versioned manifest)
                    -> authorized upload intent -> upload result
                    -> authorized start intent -> start acknowledgement
                    -> observed printer job
                    -> PrintSession linked to exact artifact provenance
```

The contract must preserve target compatibility, authorization, correlation,
and observed outcome. Exact ownership of upload and start remains open until
the first OrcaSlicer and printer environments are known.

## Boundaries still to validate

- whether the first printer is best served by a vendor API, Moonraker, OctoPrint,
  MQTT, or another protocol;
- how the first supported OrcaSlicer version can be invoked and which project,
  profile, preview, and output operations are actually available;
- how embedded project configuration and external profile sources are resolved;
- where upload and start belong without coupling either subsystem to one vendor;
- whether the operations service and MCP server should initially be one process;
- required event-store durability and replay semantics;
- camera transport and storage policy;
- local-only versus remote-access deployment;
- notification transport and authentication.
