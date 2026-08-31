# 0027: Observe the reported bed mesh on demand

- Date: 2026-08-31
- Status: accepted; reviewed, merged in PR34, deployed and read-only live acquisition verified
- Scope: F0 read-only observation feedback loop, OBS-007/008/009 and API-005

## Context and priority

The user requested implementation of Bed Mesh. This is the next bounded slice,
ahead of the paused queue work and unresolved minimal-progress/camera feedback.
PR33's Current Job/Job History split is merged at `7b9c4d4`. Decision 0026 is
reserved for the separate paused queue design; none of that unfinished code is
part of this slice. The user's subsequent explicit authorization now covers
completing the locally validated, independently reviewed Bed Mesh slice,
merging its PR, deploying that exact merged build, restarting both public and
dashboard U1 services, and verifying them. This supersedes the earlier
merge-only boundary. Preserve OAuth, configuration, and Tailscale routes; no
plugin reinstall or printer control is authorized. The subsequent urgent PR33
rollout now reports runtime 0.3.2/schema 6/observation-v4/camera-v5 on both
restarted, verified services. Subsequently PR34 merged as `7194361` and the
shipping workflow deployed runtime 0.3.3/schema 7/observation-v5/camera-v5,
restarted both services and verified them. One independent read-only live
observation confirms a known/fresh active 11 × 11 reported mesh. This is not
calibration quality or physical print acceptance; a Git merge alone never
establishes loaded bytes.

## Acquisition and normalized meaning

Use one operations adapter with the fixed read-only route
`GET /printer/objects/query?bed_mesh=profile_name,mesh_min,mesh_max,probed_matrix`.
There is no caller-supplied URL, object selector, G-code, profile action, probe,
calibration, save/load, or control surface. Disable redirects and bound the
request to three seconds connecting, six seconds total, and 512 KiB response
bytes. Only the four selected fields enter normalization; do not expose saved
profile inventories, raw errors, configuration, or interpolated `mesh_matrix`.

The primary data is **Reported probe grid**, not raw independent measurements
at every cell. Klipper may apply zero-reference adjustment, substituted values,
or round-bed edge extrapolation. Never silently substitute the interpolated
matrix. Accept a complete rectangular matrix of 2–64 rows and 2–64 columns
(at most 4,096 finite numeric cells), with two finite XY bounds at each end,
strictly increasing X and Y extents, and finite derived minimum/maximum/range.
Absolute coordinates and heights are bounded to 1,000,000 mm as a defensive
numeric limit, not a physical quality or safety threshold. Reject malformed,
ragged, out-of-bound, or oversized data as a whole; no truncation or resampling.
All-zero nonempty grids are valid flat data, not missing meshes.

Only Klipper's exact inactive shape—empty profile name, both bounds `[0,0]`,
and `probed_matrix: [[]]`—means a successful **No active mesh** observation.
A valid response omitting `bed_mesh` means the object was not reported
(`unsupported`), not an observed empty mesh. HTTP 404/405 similarly describe an
unsupported endpoint, not a printer capability verdict. Malformed envelopes,
missing selected fields, authentication errors, other HTTP failures, and
transport failures are unavailable. Before acquisition the state is unknown.
An optional profile label is at most 80 printable single-line characters;
omit the entire label if it contains path-like content, controls, or bidi
formatting (including U+061C/U+200E/U+200F). Invalid label content never leaks
through errors or discards an otherwise valid active grid.

## Shared state and freshness

The existing application store owns an optional dedicated bed-mesh reader;
injected status-only fixtures must not fall through to a real printer reader.
Only a focused bed-mesh demand enables `includeBedMesh`; ordinary status,
other views, directory, health, and asset reads never acquire this domain.
Bed mesh has its own 15-second attempt TTL and in-flight coalescing, independent
of the status adaptive interval. Explicit Refresh respects that bound.

Successful active and inactive reads each retain their own receipt timestamp.
That timestamp says when the server observed the reported mesh, **not when the
bed was probed**; Klipper's monotonic `eventtime` is not converted into a fake
wall-clock probe time. A later failure retains the last successful active or
inactive result as stale without restamping it. A successful inactive result
clears a previous grid. Fresh status must not promote stale mesh data, and
failed status must not demote independently fresh mesh data. Each domain update
advances the shared observation version and merges against the latest snapshot
so concurrent status/mesh completion cannot overwrite the other domain.

## Focused presentation and compatibility

Keep the current vanilla HTML widget, bridge, closed `bed_mesh` selector, and
single application projection. Show a compact 2D reported grid, not a 3D
machine or an implied physical bed outline. Matrix columns increase with X and
rows with Y; display maximum Y above minimum Y and minimum X to the left.
Label XY extents in mm, without assuming front/back. Show minimum, maximum,
range (three decimal places, mm), and columns × rows. The small map uses a
neutral height scale, a uniform color for a zero range, accessible textual
summary/axis values, and no reliance on color alone. Do not interpolate between
reported cells or infer level, good/bad, compensation effectiveness, or print
safety. Retain information at the top and only Refresh/Retry at the bottom.

The source contract becomes runtime 0.3.3/schema 7/observation-v5, retaining
observation-v4/v3/v2/v1 as current-asset aliases and every frozen resource.
Camera-v5 and all camera media behavior remain unchanged. Inventory stays two
model-visible intents, eight app-only tools, nine observation selectors, and
nine directory links; the added observation alias makes twelve resources.
After source acceptance the directory describes Bed Mesh's implemented grid,
bounds, and height range, not live hardware verification. Queue stays
unimplemented on this branch. Previously rejected progress styling is not
changed or represented as newly accepted by this bed-mesh slice.

## Acceptance boundary

Independent fixture validation must prove the exact bounded adapter route;
status-only and static reads' zero mesh acquisition; independent TTL, duplicate
coalescing, failure retention and concurrent domain merges; malformed/oversized
rejection; omitted object versus inactive versus all-zero success; label
privacy; and no interpolated fallback. An asymmetric rectangular fixture must
prove all four XY corners and summary values in the actual rendered map.
Inspect actual source widgets at 320/390/720 px in light/dark, including active,
flat, inactive, unsupported, and retained-stale states, readable top metadata,
and the bottom action. Verify resource aliases/frozen bytes, unchanged camera,
tool counts, schema, bundles, and routes. Software/protocol/browser fixtures
do not establish installed service, real-printer data, or user acceptance.
After source acceptance and merge, the authorized rollout must separately
verify the exact merged release, integrity, and readiness of both restarted
U1 services. Preserve existing routing/authentication and record software,
service, and any read-only live observation evidence separately; never infer
camera or bed-mesh availability solely from service health.

## Primary sources checked

- [Moonraker printer object queries](https://moonraker.readthedocs.io/en/latest/external_api/printer/): fixed field selection, omission of unknown objects/attributes, and monotonic event time.
- [Klipper bed-mesh status](https://www.klipper3d.org/Status_Reference.html#bed_mesh): active mesh fields are distinct from the saved profile inventory.
- [Klipper Bed Mesh](https://www.klipper3d.org/Bed_Mesh.html): probe-coordinate bounds, interpolation, and zero-reference semantics.
- [Klipper bed_mesh implementation](https://github.com/Klipper3d/klipper/blob/master/klippy/extras/bed_mesh.py): inactive defaults, ascending XY matrix indices, and reported/interpolated grid distinction.
- [Apps SDK UI reference](https://developers.openai.com/apps-sdk/reference/): retain existing tool-result/bridge contracts and versioned resource identity.
