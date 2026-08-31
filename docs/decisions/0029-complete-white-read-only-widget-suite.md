# 0029: Complete the white read-only widget suite

- Date: 2026-08-31
- Status: A deployed in PR41; Heads refinement implemented at 0.4.2, review/shipment pending; visual acceptance unverified
- Scope: F0/O1, OBS-007/008/010/011, CAM-008, API-005, decisions 0021/0025/0028

## Context and execution

The user explicitly requests all outstanding widgets, with persistent tracking,
and selects a refined white camera/progress style for the whole suite. A new
request must not silently displace earlier unfinished work. The active
iteration's `WIDGET_TRACKS.md` is the authoritative ordered delivery matrix.
Focused domains precede overview composition. Retain independently invokable
skills and the Current Job/Job History split; labels reflect delivered coverage.
This advances read-only discovery/observation, not O1's full-print/reconnect exit.

Use sequential independently releasable slices: shared white foundation,
materials, camera/progress; Queue; fans/chamber; real History/current-job
refinement; then overview. Each slice passes local and independent exact-SHA
review, PR merge, decision 0028 shipping, explicit restart of both existing
services, and exact assets plus meaningful widget verification. Preserve source,
protocol/browser, deployment, real-printer, and user-device evidence separately.

## Heads reference refinement (2026-08-31)

The latest selected Heads reference changes presentation only and takes the
next release slot before Queue; all unfinished tracks remain active. Retain the
white outer card and four physical tool cards, wrapping to two/one columns when
needed. Each tool card orders its actual tool/state, reported material label,
divided current/target temperature row, then exact swatch/hex and Copy action.
Keep Refresh at the bottom under OBS-008 despite its top placement in the image.

Tint each inner card with 6% of its validated reported color over white; for
eight-digit RGBA multiply that fraction by the reported alpha. Preserve the
exact six/eight-digit canonical hex and alpha in swatch, text and clipboard.
This is a solid presentation wash, not blur, a gradient, whole-card
opacity or an altered material value. White remains white; black becomes pale
neutral; unknown/invalid color stays neutral and never invents white/black data.
Active-state accents remain independent of filament color. Retain high-contrast
text, an exact-color swatch with a visible boundary, and canonical hex text.
Copy writes only the displayed validated hex on explicit activation, has a
44-pixel keyboard-accessible target, announces actual success/failure, and is
unavailable for unknown color. Clipboard capability is not assumed granted.

Reuse the system-font stack and locally attributed Feather icons. This data UI
needs no generated image assets. Do not copy reference temperatures, colors,
material labels or states into production. Retain physical index + 1 mapping,
presence and independent material time/freshness, including retained stale data;
no acquisition, normalization, tool inventory or printer-control expansion.

Source fixtures must cover tint derivation, valid white/black/color and invalid
input, unchanged state/freshness, copy success/rejection/unavailability and
keyboard semantics. Rendered narrow-layout/contrast/reference comparison remains
unverified while the allowed browser is unavailable. The user's standing
merge → exact-build deploy → restart BOTH services → verify order still applies;
it overrides predeployment visual ordering only, never creates a visual pass.

## Material acquisition boundary

Add only this fixed operations-adapter read:

`GET /printer/objects/query?print_task_config=filament_exist,filament_vendor,filament_type,filament_sub_type,filament_color_rgba,filament_color`

The raw field names include `filament_`. The response lives under
`result.status.print_task_config`; do not accept unprefixed aliases or copy raw
objects outward. Map parallel-array index 0–3 to physical head 1–4. Do not use
`extruder_map_table`, which belongs to print/preparation mapping, to relabel
physical hardware. Preserve existing temperature/active-head/presence semantics.
`filament_exist` describes separately reported material presence; it does not
override an independently observed filament sensor.

Disable redirects/proxy inheritance and bound connection/total time and body
size at least as tightly as the existing six-second/512-KiB bed-mesh adapter.
Accept no more than four entries per selected array, with absent per-slot fields
unknown, not shifted into another slot. Reject oversized or structurally invalid
arrays; do not silently truncate or report an empty success. Unqueried fields,
configuration, IDs/SKUs, URLs, paths, raw errors, credentials, and print mapping
never enter the normalized result or model/widget envelopes.

Vendor/type/subtype are nullable, trimmed, single-line labels of at most 64
characters. Use an allowlist of printable label characters; reject controls,
bidi formatting, markup, URL/path-like text and credential-looking values.
Empty strings and `NONE` mean unknown/not specified, not invented defaults.
Preserve the useful reported subtype without silently mapping it to a preset.

Prefer exact eight-hex `filament_color_rgba` in RRGGBBAA order, normalized to a
safe canonical color. A six-hex legacy `filament_color` string or bounded integer
may be accepted using the documented low 24 RGB bits. Never accept arbitrary
CSS, color URLs, NaN, fractions or unbounded integer coercion. Invalid colors
are unknown; no default white/black is invented. Visible swatches retain a text
hex equivalent, so color is not the only information channel.

The application owns an independent optional material reader using the bed-mesh
pattern: 15-second attempt TTL, coalesced concurrent demand, independent receipt
timestamp, checked-at/failure state, retained last-success stale data without
restamping, and atomic merge into the latest shared observation. Only focused
Heads demand enables it initially; later overview explicitly composes it.
Directory, health, static routes and unrelated views never acquire materials.
Injected fixtures cannot fall through to the real-printer reader.

Before demand, material capability is unknown. A successful omitted object
remains unknown/not reported; absence alone does not prove firmware inability.
404/405 means unsupported for the attempted endpoint, not proof that hardware
contains no filament. Malformed/auth/transport failures are unavailable.
Valid fields are known even when adjacent optional labels are missing. Fresh
temperature/status data must not promote stale material metadata or supply its
timestamp. Render `Printer-reported material` with its own time/freshness; keep
four stable physical head identities and explicit unknown vendor/type/color.
Firmware metadata is not the slicer's full preset. Local preset matching,
profile selection/sync and writes stay outside this read-only scope.

## White camera and progress supersession

The latest selected references supersede the bottom-left camera-information
exception in decision 0023/CAM-008 and the rejected segmented-layer progress.
Detailed anatomy is frozen in `WIDGET_TRACKS.md`: white rounded cards and index,
information above actions, genuine camera media with state/measured FPS/time in
the header outside the image, bottom-right working controls, and a continuous
amber progress strip beneath a slim green reported percentage. The camera
reference's photograph is a placement reference, not a generated replacement
for live/snapshot media. Existing measured-frame FPS and watcher guards remain.

Do not fabricate speed, height, completion, ETA precision, or unavailable domain
data to match reference text. Current Job and History remain distinct modules.
Bed Mesh retains numerical/orientation/state semantics while restyled. Missing
software coverage is `not implemented`, never a firmware `unsupported` claim.

## Acceptance and limits

Fixture gates cover exact route/field names, physical index mapping with a
deliberately shuffled unused mapping table, partial arrays, unsafe labels,
color precedence/format/bounds, zero/false presence, malformed/oversized inputs,
independent TTL/coalescing/failure retention/concurrency, zero acquisition from
static/unrelated reads, and safe projection to Heads. Browser gates compare the
actual source widget with the selected reference at matching viewport/state,
including white-on-dark-host, narrow layouts, stale/unknown/failure states,
working snapshot/live/close/PiP/fullscreen and focus/keyboard behavior.

Allowed-browser availability is currently blocked; isolated headless validation
awaits user permission. This does not waive the visual gate or authorize a
fabricated `design-qa.md` pass. Real camera frames, private history, credentials
and runtime receipts remain outside Git. No printer control, preset/project
write, queue/history mutation, auth/routing change, plugin reinstall, or Mac
login/power administration is implied by completing these read-only widgets.

## Primary source grounding

- [OrcaSlicer Snapmaker adapter at pinned commit 82cedc0](https://github.com/OrcaSlicer/OrcaSlicer/blob/82cedc03166504fb67cd69d2b4e570b527ebe95a/src/slic3r/Utils/SnapmakerPrinterAgent.cpp): raw parallel-array fields, physical slot indexing, RRGGBBAA and separate local preset matching.
- [Snapmaker bridge at pinned commit 761718a](https://github.com/Snapmaker/OrcaSlicer/blob/761718a5eaf6f52b818af236653f3807d091a613/src/slic3r/GUI/SSWCP.cpp): vendor/type/subtype labels and legacy low-24-bit integer/hex color representation.
- [Feather 4.29.2 camera icon](https://github.com/feathericons/feather/blob/v4.29.2/icons/camera.svg) and [MIT license](https://github.com/feathericons/feather/blob/v4.29.2/LICENSE): locally bundled new thin-outline icon source and required attribution.

These sources establish adapter conventions, not the current printer's firmware
version, actual loaded spools, profile compatibility, or physical acceptance.

## Release A source checkpoint

Exact correction `acdb2e38553418b395269bf71814ec3a5f21af04` passes independent
full validation and source-only review without findings (190 app/1,761
assertions, 21 lifecycle, 22 shipping, 20 isolated/399 assertions; reviewer
31/448). Approval excludes uncommitted docs, visual QA and release approval.
Stacked B–E source work may continue while A awaits browser permission, without
changing sequential reviewed release order or bypassing QA/shipping gates.

Source is 0.4.0/schema 8/observation-v6/camera-v8 with sixteen resources and
retained current/frozen aliases. Materials and the white presentation are
implemented; progress lower metrics are elapsed-only because the focused
projection contains no nozzle/bed/speed/height fields. Camera uses direct
accessible controls, genuine media, a header outside the image, snapshot refresh
feedback and native fullscreen on the card; frame/FPS watchers are unchanged.
Independent full software validation passes. Current visual QA is blocked on
allowed-browser access/ungranted isolated headless permission, not passed.
No new merge, deployment or restart is claimed; both checked services remain
0.3.5/schema 7/observation-v5/camera-v7. Queue foundation is active separately on
`feat/u1-queue-completion`, with B–E still in the durable completion queue.
The camera's combined muted state/FPS/time label differs from the reference's
differentiated text and thin dividers; visual QA must classify that fidelity
gap. Source tests do not establish a 1:1 visual match.
