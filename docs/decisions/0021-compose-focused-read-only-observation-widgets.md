# 0021 — Compose focused read-only observation widgets

- Status: accepted; focused suite shipped through D and Overview composition active
- Date: 2026-08-29
- Owners: project maintainers

## Context

The current U1 Monitor exposes one large status card plus a separate camera
presentation. The large card couples camera, progress, temperatures, and host
controls into one presentation even when the user or agent needs one fact. Its
exact inventory of `show_u1_status`, `get_u1_status`, and
`open_printer_camera` also makes presentation and data retrieval look like
separate product concepts.

The user wants a smaller MCP surface and small composable widgets that make the
same printer evidence easy for a person and an agent to inspect. Fluidd is the
capability baseline, including thermal history, multiple extruders, job
history, queue, fans, and bed mesh. The selected presentation is the
**Instrument Strips** direction: focused 720-pixel-wide surfaces with one clear
question, strong value alignment, restrained separators, and Snapmaker yellow
reserved for current or active state. The user explicitly rejected a giant
machine map. Camera remains its own focused strip in the same visual system.

Current software already observes progress, layers, elapsed and estimated
remaining time, four extruder temperatures and targets, active tool, bed
temperature and target, printer state, and camera availability. Cavity
temperature, fans and purifier, filament sensors, bed mesh, job history, and
job queue were advertised during read-only discovery but are not accepted
runtime observations. Filament material and color are not currently observed.

## Decision

### One observation and projection boundary

- Printer Operations owns one normalized `CurrentPrinterObservation` read
  model. It carries source and receive times, freshness, connection epoch,
  printer and print-session identity, provenance, capability evidence, and the
  available domain values.
- `QueryCurrentPrinterObservation` is the only normal application use case
  used by MCP, HTTP, CLI, focused widgets, and the later overview. A focused
  presentation does not query Moonraker, reconstruct state, schedule polling,
  or define freshness independently.
- The monitor obtains a complete initial snapshot, merges ordered subscription
  deltas, and reboots the observation after reconnect as required by decision
  0006. On-demand history, queue, mesh, or static capability reads enter the
  same normalized observation boundary before presentation; an inbound view
  never becomes a generic printer-protocol proxy.
- A pure read-only projection selects the fields for one view. The model-readable
  structured result and the visible widget are projections of the same version
  of the same observation. Widget-private metadata may contain only bounded
  presentation material that must remain hidden from the model.
- A camera frame remains a separately timestamped observation. Camera
  activation, signaling, media, retry, fallback, and Close preserve decisions
  0019 and 0020 and do not become part of the shared telemetry clock.

### Exact model-visible presentation inventory

The target Monitor inventory contains exactly two model-visible presentation
intents:

1. `observe_printer`, with one required closed `view` enum;
2. `open_printer_camera`, for every explicit open, view, reopen, or additional
   camera request.

The `observe_printer` enum contains exactly:

1. `overview`
2. `progress`
3. `thermals`
4. `heads`
5. `jobs`
6. `job_history`
7. `queue`
8. `fans`
9. `bed_mesh`

Unknown view values fail closed. The tool is not a generic query language, URL,
object-name, JSON-RPC, HTTP, G-code, or field-selection surface.

`show_u1_status` and `get_u1_status` are superseded as model-visible intents.
The widget may use one app-only `refresh_printer_observation` projection call so
refresh does not create another widget. Existing camera frame and signaling
helpers remain app-only and hidden. Tool visibility remains presentation
metadata rather than authorization; every observation path still requires the
Monitor policy and `u1.monitor` where remote OAuth applies.

The plugin's user-facing procedural entry is `u1-observe-printer`. It teaches
and routes natural-language observation requests to the closed
`observe_printer` views or the separate `open_printer_camera` intent. It is not
another runtime tool, printer-protocol adapter, or source of authority.

### Focused view inventory

- `progress`: printer state, percent, current and total layer, filename when
  safe, elapsed time, estimated remaining time, and session provenance.
- `thermals`: Tool 1 through Tool 4, heater bed, and cavity rows with actual,
  target, heater power when observed, and a bounded recent series. Active
  heating is emphasized without treating target equality as safety proof.
- `heads`: four physical head/filament cards with active state, temperature,
  target, material, text-labeled color, and available motion, entanglement, or
  load-sensor facts. Printer observation and preparation-manifest identity
  remain distinct provenance sources.
- `jobs`: the contextual current or last-reported job with bounded state,
  storage, duration and filament facts. A persisted filename never implies an
  active print. Reprint is excluded.
- `job_history`: the bounded latest returned page with safe basenames,
  normalized outcome, duration and filament facts. It never claims grand total,
  pagination or current-job authority.
- `queue`: position, source, estimate, and state only. Add, remove, reorder,
  select, or start remain writes and are excluded.
- `fans`: named part, cavity, exhaust, or purifier rows with commanded power,
  measured RPM, and mode only when the adapter reports those distinct facts.
- `bed_mesh`: an observed top-down height field with sample density, minimum,
  maximum, range, profile identity, and observation time. Calibration and
  profile mutation are excluded.
- `overview`: a later composition of the accepted focused projections. It has
  no independent schema, adapter call, timer, normalization, or monolithic
  widget implementation.
- camera: a separate snapshot-first Instrument Strip reached only through
  `open_printer_camera`. It keeps the current explicit Go Live and Close
  semantics and is never embedded into another focused view.

The focused implementation order is `progress`, `thermals`, `heads`, camera
visual alignment, `fans`, `jobs`, `queue`, and `bed_mesh`. The `overview` view
must report unavailable until every focused module is accepted, then compose
those exact modules. The legacy large overview is not incrementally rewritten
or used as the source of the focused modules.

### Evidence and missing-value semantics

- Freshness is one of `fresh`, `stale`, `offline`, or `unknown`. A retained
  stale value keeps its original source time and is not presented as current.
- Capability evidence is one of `observed`, `advertised`, `unsupported`, or
  `unknown`. Advertised object presence does not prove usable runtime meaning.
- A field value is `known`, `unavailable`, or `unknown`. `Unavailable` means
  the current normalized source explicitly cannot supply it. `Unknown` means
  evidence is missing, stale beyond its accepted use, conflicting, or not yet
  normalized. Neither state is rendered as numeric zero, an empty swatch, or a
  successful condition.
- Print provenance is product-managed only when the observed printer job is
  correlated to the exact prepared-job manifest and artifact hash. Otherwise
  it is explicitly external, unavailable, or unknown. A slicer profile color
  or material is not silently presented as physically loaded filament.
- Every strip displays its observation time and read-only state. Critical
  facts remain text-labeled; color, icon, animation, or chart shape is never
  the only carrier of meaning.

### Compatibility and rollout

- The current `status-v4.html` and `status-v3.html` resource URIs remain
  readable for retained mounted tasks. During focused-module construction they
  continue serving the existing large overview rather than a partial hybrid.
- After all focused modules and `overview` composition pass acceptance, those
  legacy URIs may render the composed overview through the same projection
  functions. They must not retain a separate observation or polling path.
- `show_u1_status` and `get_u1_status` disappear from model visibility at the
  schema cutover. If retained tasks require callable aliases, they may remain
  temporarily app-only and route to the new overview/refresh use cases; they
  cannot expand authority or become a second source of truth.
- `open_printer_camera` keeps its stable name, non-idempotent presentation
  semantics, camera-v3 resource, and v2/v1 resource aliases.
- Health, doctor, packaging, source tests, and installed-client smoke tests
  report the new tool schema and resource versions together. Existing tasks
  may retain cached descriptors and require a fresh task after upgrade.
- No source decision authorizes installation, service restart, OAuth or route
  mutation, live-printer contact, printer control, or publication. Those remain
  separate post-merge authorization and evidence gates.

This decision supersedes requirement API-005 and earlier decision language
only where they require exactly three model-visible tools or treat the large
status card as the primary observation presentation. Decisions 0019 and 0020
remain authoritative for camera activation, signaling, fan-out, privacy, and
resource compatibility.

## Consequences

- The agent can request one bounded observation intent while the user receives
  a small matching visual surface.
- Focused widgets cannot drift in timestamps, freshness, or normalized meaning
  because they share one observation and projection path.
- Supporting Fluidd-like capability breadth requires additional read-only
  adapter discovery and fixtures; a visual placeholder does not accept a
  printer field.
- The enum and pure projections keep the public MCP surface small, but every
  newly normalized domain still requires explicit privacy and allowlist review.
- The overview is intentionally later. This avoids recreating the current
monolith before the composable feedback loop has been accepted.

## Overview completion addendum (2026-08-31)

All eight focused projections are now accepted, so `overview` may advance from
deferred to composition. An explicit Overview call or Refresh acquires main
status plus Materials, Environment, Queue, Bed Mesh, Current Job and Job History
concurrently. It reuses those domains' existing readers, receipts, 15-second
attempt TTLs, coalescing, stale-last-success retention, atomic merge and fixture
isolation. It adds no adapter, cache, timer or normalizer. Static, directory,
health and unrelated focused requests never trigger this fan-out; Camera remains
a separate observation and presentation.

Overview composes the exact Progress, Thermals, Heads, Current Job, Job History,
Queue, Fans and Bed Mesh projectors from one observation version. One domain's
failure cannot suppress or restamp another. Every headline tile retains its own
state, source time, freshness and reason. The header printer state and time are
explicitly main-status facts. `complete`, `partial` and `none` describe only
projection coverage: respectively all, some or none of the eight projections
have known or retained stale data. They are never a synthetic health, safety or
freshness verdict; known-empty and known-inactive domains still count as
available coverage.

The visible result is one compact white card with a two-column headline grid
that collapses to one column. It does not embed the full focused cards:

- Progress shows printer state, percent, layer and ETA, never filename.
- Thermals shows active tool, bed and Cavity facts.
- Heads shows active physical tool plus material, color and presence, retaining
  the independent material receipt.
- Current Job shows contextual reported state and storage only, never filename
  or bytes.
- Job History shows returned-page count and normalized status aggregate, never
  names, IDs, times, raw rows or a total claim.
- Queue shows queue state and count, never filenames.
- Fans shows reported component count and purifier detection/mode facts without
  a health inference.
- Bed Mesh shows active/inactive, dimensions and range, never the surface or
  profile identity.

Information remains above exactly one 44-pixel bottom Refresh. There is no tile
navigation or action, pagination, chart, 3D surface, control, camera/media,
filename, project/model identity, raw row/path/ID/metadata or runtime detail.
The structured result is a privacy-minimized headline composition of the exact
projector outputs, not an alternate normalization.

A status-plus-material Overview was rejected because it would omit accepted
Queue, History, Fans and Mesh projections while falsely completing the promised
composition. Embedding all full cards was rejected because it recreates the
giant map the user explicitly declined. The compact headline composition is the
smallest contract that satisfies both boundaries.

Implementation adds private `/dashboard/overview` and its truthful directory
entry. The payload target is runtime 0.4.6/tool schema 12/observation-v12/
camera-v8 with twenty-two resources and observation-v11 retained. The exact two
model-visible and eight app-only tools remain unchanged. Source acceptance does
not establish deployment or browser/device visual acceptance.

## Validation

Before implementation is accepted:

1. Tool discovery exposes exactly `observe_printer` and
   `open_printer_camera` as model-visible presentation intents; app-only refresh
   and signaling helpers remain hidden.
2. `observe_printer` requires and validates the exact nine-value enum and
   rejects extra view names and generic selector fields.
3. Progress, thermals, and heads fixtures rendered together carry the same
   observation version, source time, freshness, connection epoch, and session
   provenance. Camera time remains independent.
4. No focused view calls a printer adapter directly or owns a refresh loop.
   All model-readable and visible values match their exact projections.
5. Missing, stale, advertised-only, and conflicting fixtures render explicit
   `Unavailable`, `Unknown`, `Stale`, or `Offline` labels rather than zero or
   optimistic state.
6. At 720 pixels wide and phone breakpoints, every strip has no horizontal
   overflow, retains readable type and 44-pixel interactive targets, and uses
   text in addition to color. Camera is a separate focused strip.
7. Queue, jobs, fans, thermals, and bed-mesh paths are statically read-only;
   mutation, calibration, reprint, temperature, fan, macro, G-code, generic
   proxy, Control, and Admin paths remain absent.
8. `overview` is unavailable until all focused modules pass. Its accepted
   implementation composes those modules and introduces no new data path.
9. Current legacy resource URIs remain readable through the cutover; cached
   old tasks and fresh new tasks are tested separately.
10. Static/software, simulated protocol, real-printer, mounted-host, and user
    outcome evidence remain separately reported. The user outcome gate asks
    whether, within ten seconds, the user can identify print state and progress,
    unexpected thermal state, active head/material evidence, and observation
    freshness.
11. The `u1-observe-printer` skill routes progress, thermal, head, job, queue,
    fan, bed-mesh, overview, and camera language only to the exact accepted
    presentation intents and does not claim physical or later-layer acceptance.
