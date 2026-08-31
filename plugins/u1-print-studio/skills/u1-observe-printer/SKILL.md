---
name: u1-observe-printer
description: Show one focused read-only Snapmaker U1 observation view for a one-shot inspection. Use for overview, progress, thermals, heads and filaments, jobs, queue, fans, bed mesh, or camera; use u1-monitor-print for ongoing monitoring and separate skills for preparation or start.
---

# U1 Observe Printer

Present one focused, current U1 observation without starting an ongoing monitor
or authorizing a printer action.

## Choose one view

Use the view the user names. If no view can be inferred, ask which single view
they want rather than silently opening an overview.

- `overview`: a compact cross-domain summary, only when the user asks for an
  overview or general status.
- `progress`: print state, progress, layers, timing, and current job identity.
- `thermals`: reported chamber, bed, and heater readings and targets.
- `heads`: available print-head state, temperatures, and reported filament
  material or color.
- `jobs`: current or recent reported job facts.
- `queue`: read-only queued-job state.
- `fans`: available fan and purifier readings.
- `bed_mesh`: the currently reported bed-mesh or calibration facts.
- `camera`: the focused snapshot-first camera surface.

If the user requests several views, keep them composable: make one focused call
per requested view in the requested order. Do not replace them with the legacy
large status dashboard.

## Route the presentation

- For a non-camera view, call model-visible `observe_printer` with exactly one
  required `view` value from the list above. The mounted widget owns refresh
  through its app-only helper; do not call that helper directly.
- For `camera`, call model-visible `open_printer_camera`. The camera widget owns
  snapshot refresh, Go Live, bounded signaling, Close, retry, and fallback; do
  not call its app-only helpers directly.
- Do not use `show_u1_status` or `get_u1_status` as a substitute for a focused
  request. If the current task has stale tool descriptors and the focused tool
  is unavailable, report that mismatch instead of presenting the wrong view.

## Evidence and authority

Treat every result as a timestamped observation. Preserve explicit offline,
stale, unavailable, unknown, and partial-data states; never invent missing
chamber, fan, queue, mesh, head, filament, material, or color facts. Keep
printer-observed data distinct from preparation metadata or user statements.

This skill is read-only and one-shot. It does not schedule another check or
prove physical safety, print quality, completion, or material loading. If the
user asks for interpretation, label recommendations separately from observed
facts. If they ask to prepare, upload, start, pause, resume, cancel, tune, or
otherwise act, stop this workflow and use the appropriate separately authorized
workflow.
