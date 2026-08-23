# Provisional architecture

This is a hypothesis to guide discovery, not an implementation commitment.

```text
                         User / agent / automation
                                    |
                    MCP / HTTP API / CLI / future UI
                                    |
                            inbound adapters
                                    |
                 application use cases and ontology
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

## Runtime shape and surface boundary

MCP is one replaceable inbound adapter, not the system boundary. HTTP, CLI, and
future surfaces translate into the same application use cases and domain
results. They do not call OrcaSlicer, Moonraker, or a printer directly and do
not duplicate safety or authorization policy.

MCP provides request/response tools for an agent, but monitoring must continue
when no agent turn is active. A persistent local service is therefore expected
to own printer connections, consume telemetry, track sessions, evaluate event
rules, and deliver notifications.

Inbound surfaces may expose both subsystems to agents or users. None should be
the only process keeping a print alive or monitored. Preparation may initially
be on demand; discovery must not assume it needs the same resident lifecycle.

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

The service exposes application ports rather than MCP-specific handlers. A
first deployment may keep the monitor in one Bun and TypeScript process. The
monitor boundary remains language-neutral so a later Elixir daemon can satisfy
the same contract without changing domain semantics or inbound surfaces.

### Monitor port

Defines observation source, subscription, health, and storage contracts. It
follows `docs/monitoring-model.md`: bootstrap with complete direct queries,
maintain dynamic state through subscriptions, expose freshness, and
resynchronize from a new snapshot after reconnect. Inbound surfaces read the
application's reconstructed current state rather than bypassing it.

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

## Replaceable inbound surfaces

MCP initially offers narrow Preparation tools for inputs, profiles, slice
requests, and result inspection plus Operations tools for printers, sessions,
observations, authorized commands, and event history. Equivalent HTTP API, CLI,
or future interfaces invoke the same application ports. Long-running monitoring
belongs to the operations service.

Monitor, Control, and Admin are separate product surfaces. The first release
exposes read-only Monitor operations, keeps Control behind distinct explicit
authorization, and exposes no Admin surface or generic HTTP, JSON-RPC, or
G-code passthrough.

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

- whether the first adapter should target the observed Moonraker-compatible
  surface directly and how vendor extensions affect that boundary;
- how the first supported OrcaSlicer version can be invoked and which project,
  profile, preview, and output operations are actually available;
- how embedded project configuration and external profile sources are resolved;
- where upload and start belong without coupling either subsystem to one vendor;
- whether the first Bun deployment keeps the monitor in-process and what
  evidence would justify extracting it to an Elixir daemon;
- required event-store durability and replay semantics;
- camera transport and storage policy;
- local-only versus remote-access deployment;
- notification transport and authentication.
