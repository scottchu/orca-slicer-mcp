# Product vision

## One-sentence definition

A real-time, agent-operated control and monitoring layer that gives a user
remote presence at their 3D printer with guarded agency.

## The problem

Preparing a file is only the beginning of a print. During execution, users
still need answers to operational questions:

- Is the printer healthy and still making progress?
- Is the first layer adhering correctly?
- Has the print detached, tangled, or begun to fail?
- Does an alert require attention now?
- Can the problem be corrected safely without restarting?

The main pain is uncertainty and required supervision during the print, not
only the work required to slice it.

## Product promise

The system should let an agent look, explain, notify, and act within explicit
boundaries. The user should be able to stop babysitting routine progress while
retaining control over consequential interventions.

## Central domain concept: print session

A print session joins the things needed to understand an active print:

- job and source artifact identity;
- printer connection and capabilities;
- telemetry and camera observations;
- state transitions and alerts;
- recommendations, authorizations, and commands;
- verification after an intervention;
- outcome and session history.

## Trust ladder

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
- **Slicing is an adapter.** OrcaSlicer can be one preparation path without
  defining the product boundary.
