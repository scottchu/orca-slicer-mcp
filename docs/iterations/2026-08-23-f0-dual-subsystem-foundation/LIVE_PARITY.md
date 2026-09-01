# Remaining live-widget parity gates

2026-09-01 read-only source inventory, supplied by the separate implementation
pre-reviewer against reviewed main `2d30b01`. This records future acceptance work;
it does not expand the current Fans-only candidate or claim those widgets migrated.
Source authority: `app/src/observation-presentation.ts`, the domain observation
types in `app/src/application/`, and the existing renderer/aliases in `app.ts`.
Compare those with UI observation/Bed Mesh types before each bounded cutover.

All live models are fixture-independent. Preserve schema/view-kind/version,
receive time/connection epoch, field state/reported/null, independent domain
receipts/reasons/capability and privacy. Never cast a normalized result into a
`fixture: true` lab model or invent missing metrics to match lab cards.

| View | Lossless mapping and required fixtures before cutover |
| --- | --- |
| Overview | Preserve eight tiles/coverage and independent status/environment/materials/job/history/queue/mesh receipts. Active-head metadata is not a loaded-head count; reported fan count is not an active-fan count. Cover complete/partial/none, offline status with fresh environment, one stale domain, isolated invalid tile, zero versus null. |
| Progress | Six nullable fields: percent, current/total layer, elapsed, remaining, filename; preserve cancelled/error/unknown/offline states. Cover missing fields independently, zero/100/fractional percent and zero elapsed. Filename is not model/layer geometry evidence. |
| Thermals | Map real `heater-bed` identity, independently nullable actual/target/active, heater state and provenance. Cavity has no target and an independent environment receipt/reported state/reason. Cover actual-only/target-only, zero targets, stale/missing cavity with fresh tools, offline status with fresh cavity, overshoot and real accepted bounds. |
| Heads | Preserve head state; inactive does not mean Parked. Thermal and material receipts differ. Presence false/null/true remain distinct; metadata retained alongside false must not enable loaded color/copy. Cover unknown/nonparked states, missing temperatures, stale materials with fresh thermals, RGB/RGBA alpha and copy failure/focus. |
| Current Job | Preserve reported-null filename versus unreported unknown, byte position/size, print/total duration, filament, storage false versus unknown and seven states. No real progressPercent is supplied: byte fraction must not be presented as physical progress. Cover partial fields, standby loaded/empty, zero/safe-integer bytes, fractional durations and stale retention. |
| Job History | Preserve all eight statuses, nullable filename/start/end/metrics, print/total durations, filament and pageCount/domain receipt. Cover in-progress with no end time, empty returned page versus unavailable, 20 rows, stale last page and sanitized filenames. Zero rows is not proof of no historical jobs. |
| Print Queue | Preserve filename, nullable time-added/wait, totalCount up to 1,000, truncation and first 100 rows. Cover four queue states, 0/1/100/101/1,000 counts, partial times, known-empty stale versus unobserved, and reordering. Wait is a receipt fact, not a running clock or ETA. |
| Bed Mesh | Preserve active/no-active/null state, nullable matrix/bounds/summary/receipt. Chart adapter is active-only and maps min/max to minimum/maximum. Cover asymmetric rows-Y/columns-X, nonzero XY bounds, flat/negative heights, 2×2 through 64×64, absent profile and invalid dimensions/summary. Successful no-active clears the old chart; failed stale refresh retains it. Preserve selected 2D/3D mode and never mount Three for loading. |

Current `observation-v14` and `v13` through `v1` aliases still reach `widget.html`;
legacy `status-v4`/`status-v3` reach frozen `legacy-widget.html`. Public/private
`/widget` and eight remaining focused hosts still require those renderers. Do not
switch the generic MCP resource or remove reachable artifacts before all-nine
lossless parity, compatibility tests, independent review and deployed acceptance.
Camera's separate media lifecycle and actual-device boundaries remain tracked.
