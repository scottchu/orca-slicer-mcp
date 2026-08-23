# Product vision

## One-sentence definition

An agent-operated 3D-printing product that prepares jobs through OrcaSlicer and
provides guarded, real-time presence throughout printer execution.

## Product structure

The product has two peer subsystems:

1. **Orca Preparation** turns an identified model or project plus explicit
   printer, filament, and process configuration into an inspected, traceable
   prepared print job.
2. **Printer Operations** turns an observed printer job into a persistent print
   session with telemetry, camera evidence, events, notifications, authorized
   commands, and verification.

Neither subsystem is an adapter around the other. OrcaSlicer is an adapter
inside Preparation; vendor, camera, and notification integrations are adapters
inside Operations. A versioned handoff joins prepared-job provenance to the
observed print session.

## The problem

Preparing a reliable file and operating the resulting print are distinct parts
of one workflow. Users need preparation answers such as:

- Which printer, filament, and process profiles produced this artifact?
- Which overrides, warnings, estimates, and OrcaSlicer version apply?
- Did slicing create and validate the intended output without mutating input?

During execution, users still need answers to operational questions:

- Is the printer healthy and still making progress?
- Is the first layer adhering correctly?
- Has the print detached, tangled, or begun to fail?
- Does an alert require attention now?
- Can the problem be corrected safely without restarting?

The product addresses both reproducible preparation and uncertainty during the
print. A successful slice does not prove a safe or successful physical print.

## Product promise

The system should let an agent prepare a traceable job, surface configuration
and slicing results for inspection, then look, explain, notify, and act during
execution within explicit boundaries. The user should be able to trust what was
prepared and stop babysitting routine progress while retaining control over
consequential interventions.

## Domain concepts and handoff

### Prepared print job

A prepared print job joins:

- source model or project identity;
- OrcaSlicer and adapter versions;
- printer, filament, and process profile identities;
- explicit overrides, warnings, and estimates;
- output artifact identity, hash, and validation state.

The prepared print job is the aggregate. Its prepared artifact and versioned
manifest are the payload passed across the handoff boundary.

### Print session

A print session joins the things needed to understand an active print:

- job and source artifact identity;
- printer connection and capabilities;
- telemetry and camera observations;
- state transitions and alerts;
- recommendations, authorizations, and commands;
- verification after an intervention;
- outcome and session history.

The handoff links these aggregates without collapsing their states:

```text
source -> prepare -> slice -> inspect -> staged artifact
                                             |
                                             v
                              authorize upload or start
                                             |
                                             v
                              observe printer job -> session
```

Prepared does not mean uploaded; uploaded does not mean started; an accepted
start command does not mean printing was observed.

## Operations trust ladder

Capability should advance in this order:

1. **Observe:** report state, telemetry, progress, errors, and camera evidence.
2. **Notify:** deliver useful events without requiring an active conversation.
3. **Human-directed control:** execute an explicit pause, resume, cancel, or
   supported tuning request.
4. **Recommend:** diagnose cautiously and propose a bounded intervention.
5. **Guarded autonomy:** make only pre-authorized, bounded corrections, then
   re-observe and escalate when verification is weak.

Each level depends on evidence from the levels before it.

## Product principles

- **Remote presence before autonomy.** Reliable observation and explanation
  create value before autonomous correction is justified.
- **Capability-aware control.** Available commands come from the connected
  printer and its current state, not a universal command list.
- **Evidence accompanies claims.** Camera, telemetry, user feedback, and command
  results remain associated with the relevant session event.
- **Reversible actions first.** Prefer bounded, observable interventions and
  make stop conditions explicit.
- **Two peer subsystems.** Preparation and Operations can progress on different
  schedules, but neither is a later add-on to the other.
- **Explicit provenance.** A physical session links back to the exact prepared
  artifact and configuration when that handoff is available.
