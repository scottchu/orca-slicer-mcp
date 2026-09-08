---
name: u1-monitor-print
description: Run a standalone asynchronous, read-only Snapmaker U1 print monitor, or compose it after an authorized print start. Use for "Monitor this print" and ongoing monitoring through an evidenced outcome; a one-shot status or camera request stays a focused observation.
---

# U1 Monitor Print

Observe the active print through an evidenced reported outcome, preserving the
strength and limitations of run binding. Monitoring is
read-only: do not pause, resume, cancel, tune, or issue G-code without fresh
authorization for that exact action.

## Invocation and ownership

Invoke this skill independently for "Monitor this print". For a broader
"Print this" request, the coordinator composes prepare → authorized start →
this monitor, handing off only after fresh observation of the exact job as
printing. Preparation-only, upload-only and explicit start-only requests do
not enroll a monitor. A start acknowledgement is an intermediate update,
not a verified print outcome.

Assign one delegated, read-only monitoring owner for the bound print session.
The primary stays available for conversation and delivers the owner's meaningful
updates and immediate alerts. Deduplicate a repeated request against the current
owner instead of starting a second observation loop. If delegation or capacity
is unavailable, say monitoring has not started; retain the handoff and resolve
capacity with the user instead of silently taking over the primary's turn.

Before reporting monitoring active, the owner accepts a private handoff with:

- the target printer and exact job filename, plus the print-session identity
  when exposed; filename alone cannot distinguish a repeated run;
- the artifact hash and preparation/operations evidence references when known;
  an externally started job keeps unavailable provenance explicitly unknown;
- a fresh complete observation that binds the active run, its timestamp and
  start/progress evidence, separate camera confidence, and the next check due;
- the monitoring owner's identity, last successful observation and bounded
  retry plan. Keep private identities and images out of repository records.

A paused job can be monitored; pausing is not a terminal outcome. If a standalone
request finds no identifiable active run, report current evidence and do not
attach to a later job automatically. Never infer an artifact hash from a filename.

Native session identity is used when exposed; its absence does not prohibit an
explicit observational binding. With fresh active/paused filename and start/
progress evidence, disclose that the service token is process-local continuity
context, not a native run ID or printer authority. Same-name replacement between
polls can escape detection even with increasing counters. Full SESSION-001/O1
acceptance remains open. A single snapshot call does not itself enroll an owner.

## Asynchronous lifecycle

Repeat: acquire timestamped telemetry and available camera evidence → compare
job identity → assess progress, anomalies and confidence → choose the next due
time → publish a meaningful update when warranted → wait interruptibly → repeat.
Check that the same run remains bound on every sample. Record the next due time
and its reason; waits must allow user steering and prompt owner messages.
Report startup/first-layer evidence, material phase or estimate changes, requested
status and terminal outcomes. Stable polls need not produce repetitive cards.

Alert immediately on observed printer errors, apparent visual failures or lost
telemetry. Camera-only loss lowers visual confidence and is not a printer error.
For a telemetry outage, mark the state unknown, retain the last successful sample
and make at most three read-only recovery attempts over three minutes. Recovered
telemetry must be a fresh complete snapshot of the same run before normal cadence
resumes. If those attempts fail, end the owner as monitoring unavailable and
report the gap; do not claim the print failed or continue claiming supervision.

Re-entering after interruption or "resume monitoring" requires a fresh complete
snapshot and comparison with the retained run identity and last progress. A new
run, changed filename, unexplained progress reset or uncertain identity requires
an explicit new binding; never silently follow another print. Resuming monitoring
does not send a printer resume command.

End this owner on a verified complete, failed or cancelled print, an explicit
"stop monitoring", or an interrupted/unavailable monitoring workflow. These are
separate outcomes: stopping observation leaves the printer running. Report the
last evidence, confidence and reason; release only task-owned timers, sessions
and handles. An error, missing sample or layer N/N alone is not a terminal print.

This skill defines agent orchestration while the active conversation and worker
execution are available. It does not install a daemon, survive app/host shutdown,
or provide durable background supervision or external notifications. On a lost
owner, report interruption and retain a private handoff for explicit resumption;
do not promise checks or alerts after execution has stopped.

## Each observation

Use model-visible `get_print_monitor_snapshot` for routine agent evidence:
`{ camera: "snapshot", expectedRunToken: null }` for initial inspection, then
return its opaque token in subsequent calls. Choose `camera: "omit"` when no
new visual evidence is needed. The tool returns complete allowlisted status
facts, a strict structured/text envelope and, when available, one model-visible
JPEG. It creates no widget, stream activation, background task or printer action.
The token has a12-minute observational window, extended only by a new consistent
receipt; cached data is not a second observation. Read acquisition, observedAt,
checkedAt, completeness and freshness together. Do not count cached receipts as
fresh repeated evidence or override the store's due-refresh policy.

Changed/uncertain/unknown token, source-clock regression, reconnect, observation
gap or progress reset requires reporting the lost binding and explicit rebind;
those expected-token calls neither mint a replacement token nor acquire camera.
An initial null token can obtain camera without a native run UUID. Camera and
telemetry are not atomic: association is only the same request time window,
with independent receipt time. An unavailable/withheld image lowers visual
confidence and cannot erase valid telemetry. If the tool is absent, report the
capability unavailable; do not treat widget summaries or private metadata as
complete agent evidence or silently replace the missing tool.

Capture a timestamped complete snapshot of job state, exact filename, virtual
storage activity and byte progress, current and total layers, elapsed time,
tool states and temperatures, bed state, messages, and exceptions. Acquire a
separate timestamped camera snapshot when available. A transport success does
not make the image diagnostically useful; state visual confidence explicitly.

Do not use a fixed polling interval. After every observation, estimate the
remaining time from slicer estimate, elapsed time, byte progress, layer
progress, and recent rates when available, then choose and state the next check:

- during startup and first-layer work, check in roughly 30–60 seconds;
- during a stable middle with substantial time remaining, check less often,
  normally 5–10 minutes;
- within about 10 minutes of completion, check every 1–3 minutes;
- within about 3 minutes, check every 20–60 seconds;
- when all layers are reported but state is still `printing`, check every
  15–30 seconds until end G-code finishes.

These are decision guides, not timers. Shorten the interval for warnings,
visual uncertainty, unexpected rate changes, or end-of-print transitions.

Immediately alert on printer errors, connectivity loss, detached objects,
spaghetti, or another visually obvious failure. Describe evidence and
uncertainty; do not infer success from silence.

## Standalone camera requests

Treat a request such as "Open printer camera" as a focused camera presentation,
not as a request to open or refresh the monitoring dashboard. For standalone
camera requests, call only model-visible `open_printer_camera`; never substitute
app-only `get_u1_camera_frame` or `open_u1_camera_stream`.

If `open_printer_camera` is missing from the current tool inventory or its
camera resource cannot be loaded, report that the current MCP
connection/descriptor is stale or unavailable and stop. Ask the user to reload
the plugin connection or fully quit and relaunch the host before retrying. Never
open the status card as a camera fallback.

## Terminal evidence

Layer `N/N` is insufficient while state remains `printing`. Completion requires
fresh complete telemetry showing `complete`, inactive virtual storage, positive
known file size with exactly equal valid file position, explicitly absent
exception, explicitly parked tools, ready controller, and all heater targets
zero. Missing evidence stays unknown. Target zero does not mean cold/safe to touch.
The tool's `reported_consistent` means its checklist supports the printer's
reported state; `boundRunVerified` remains false in this slice. Describe an
observationally tracked reported completion with that limitation, not a proven
native-bound or physical result. Do not close the broader SESSION/O1 gap from it.
A failed or cancelled outcome requires fresh printer-reported terminal state
for the bound run and inactive execution; report the reason when available.
A concerning image alone remains an advisory failure observation. If terminal
state is reported but execution is still active or inconsistent, keep observing
with a short interval and describe the uncertainty.

Take a final camera snapshot when available. If the lowered bed moves the parts out of frame,
say so and preserve the strongest earlier visual evidence instead of claiming
an unseen physical result.

Use `observe_printer` with `view: "progress"` when a focused progress card
is requested or useful for communication; use the data tool for routine polling. Use `view: "overview"` only when the user requests a general overview or
the monitoring decision genuinely needs cross-domain state. Other focused
views may be requested separately without reopening a large combined dashboard.

Use `open_printer_camera` when the user wants the focused snapshot-first camera
surface. Snapshot acquisition and live signaling are internal widget
operations. On Go Live, the widget uses app-only `get_u1_camera_frame` to mint a
one-time private activation, consumes it with app-only
`open_u1_camera_stream`, and exchanges bounded answer, ICE, and close messages
through the MCP Apps `tools/call` bridge. An unanswered offer is released
automatically after 15 seconds. If live negotiation fails, the widget falls
back to non-overlapping snapshots. `Close` must disconnect the relay and return
to snapshot mode. Neither path is evidence of the printer-advertised full frame
rate, and these controls do not authorize printer actions.

When the app host or widget is unavailable, report the same focused observation
through its structured, text, or inline-image fallback. Always explain why the
next check time is appropriate.
