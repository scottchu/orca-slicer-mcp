# 0030: Present the reported bed mesh as an interactive surface

- Date: 2026-08-31
- Status: reviewed, merged in PR43 and deployed; visual/device acceptance unverified
- Scope: F0/O1 read-only observation, OBS-008/009/011 and API-005
- Supersedes: decision 0027's 2D-only presentation and decision 0029's release
  ordering only; their acquisition, privacy, state and delivery boundaries remain

## Selected reference and priority

The user supplied a Fluidd Bed Mesh screenshot during the white-widget redesign.
Use its central orbitable, colored XYZ height surface and visible numerical
height scale as the selected interaction reference. Retain the delivered white
rounded card, existing typography and locally attributed Feather icons. This
is a focused Bed Mesh enhancement, not a dark Fluidd dashboard clone. The
reference's profile-management controls, matrix selector, endstops and filament
panels are outside this request. No reference image or private attachment path
is committed; this description records the relevant visual intent.

The current ordered releases are A (already deployed), F Bed Mesh surface,
B Queue, C fans/chamber, D Current Job/History, and E overview. The new priority
does not cancel the remaining tracks or their unfinished acceptance. G's
independent invocation/route checks apply to each release. This answers the
bounded open question of how to inspect the shape of the already reported
height grid; it does not complete F0/O1 or establish calibration quality.

## Data and geometry contract

Use exactly the current normalized `probed_matrix` and XY bounds projected
through the shared application store. The fixed read-only adapter, independent
15-second attempt bound, concurrency behavior, timestamps and stale retention
remain unchanged. No new printer query, model-visible tool, selector, URL,
profile inventory, capability inference or mutation is added. Never substitute
Klipper's interpolated `mesh_matrix`.

An active mesh opens in **3D surface** mode. Column index increases X and row
index increases Y. Vertex `(column, row)` uses the reported height and the same
uniform XY coordinate mapping between the reported bounds as the existing 2D
grid. Keep every accepted vertex, including the 64 by 64 limit. Join adjacent
vertices into consistently triangulated faces for visualization only: no
resampling, spline smoothing, extra sampled points or invented measured values.
Label the data **Reported probe grid**, not raw physical measurements, and show
the explanation **Surface connects reported points; it adds no measurements.**
The renderable surface is a code-native data chart (Canvas or SVG), not an
illustration, screenshot replacement or generated image asset.
Keep the connecting-faces explanation as a small caption or accessible chart
description, not a large warning panel or repeated provenance boilerplate.

Use one common physical scale for X and Y, preserving their aspect ratio.
Show labeled X, Y and Z axes in mm with actual numerical extents/height values;
never invent front/back orientation or a machine/physical-bed outline. A scene
may be centered for fitting, but Z labels, color, tooltips and numerical
summaries retain the reported height, not the centered scene value. Fit the
entire chart into its viewport with room for labels, including unusual finite
bounds. The surface must not be clipped when changing the height multiplier.

Use a low-to-high blue/teal-to-amber height palette with a numerical legend
marked **Z (mm)** and its exact lower/upper values; it denotes relative reported
height only, never good/bad or safe/unsafe. Preserve three-decimal mm minimum,
maximum and range plus columns by rows, optional sanitized profile, independent
observation time and freshness above the controls. Expose the same numerical
summary to assistive technology; color is not the only information channel.
An all-zero or other flat matrix remains a valid flat surface with a uniform
color and equal minimum/maximum, not an empty or failed mesh.

## Smallest coherent interaction set

Keep information above a single bottom action area. Its controls are:

1. **3D surface / 2D grid** mode toggle with an explicit selected state.
2. **Height exaggeration** native select: **1x**, **100x**, **300x**; default
   **100x**. The selected multiplier also appears in the chart information as
   **Height exaggerated 100x** (or **Height scale 1x**). It applies to Z relative
   to the common XY scale and changes no reported value or color scale.
3. **Reset view**, returning only local orbit and height to their initial
   state; it does not query or modify the printer.
4. The existing **Refresh/Retry**, retaining its acquisition bound.

Do not add wireframe, flat-plane, profile, zoom, color-scale sliders or a second
control panel in this slice. Reuse existing licensed icons when needed; visible
text controls are preferable to unexplained new symbols.

The focused 3D chart supports pointer drag and keyboard arrow-key orbit with
visible focus. Show concise drag/arrow-key/Home instructions in the information
area. Home resets view, equivalent to Reset view. Bound pitch to an above-plane
range (15 to 75 degrees), wrap yaw, avoid upside-down presentation, and start
in a readable oblique view. No autoplay/inertia or continuous animation is
needed. Orbit must not trigger Refresh, change values or swallow keyboard
navigation outside the focused chart. Keep 44 px control targets and responsive
wrapping at 320/390/720 px; actions must not overflow or overlap the chart.

Retain **2D grid** as a user-selectable fallback with the existing orientation:
maximum Y above minimum Y and minimum X left of maximum X, explicit mm axes
and per-cell XYZ values. If the 3D rendering capability fails, retain that
usable grid and show a short explanation rather than a blank chart. In 2D,
height/orbit controls are hidden or disabled and cannot change grid values.
Mode changes are local only. A new successful inactive observation clears both
views; unknown, unsupported, unavailable and retained-stale states retain their
existing meaning without a decorative fabricated surface. A failed refresh
never restamps or promotes old mesh data.

## Observable acceptance and release boundary

Separate implementer, validator and reviewer roles must establish:

- An asymmetric rectangular fixture maps each of the four corners, rows and
  columns to the same XYZ values in 3D and 2D; triangle vertices never add or
  replace reported samples. Negative, positive, flat, stale and extreme valid
  bounds remain finite and truthfully labeled. Test the 64 by 64 maximum.
- Pointer/keyboard orbit, pitch limits, Home/Reset, mode selection and all
  height options work without changing values or issuing acquisition calls;
  Refresh alone preserves the existing bridge/store route and bounded demand.
- Every known/inactive/unknown/unsupported/unavailable/stale state still works.
  Source assertions and fixtures establish no new queries, `mesh_matrix`
  substitution, network dependencies, printer controls or private data leaks.
- Actual browser captures at 320/390/720 px compare the adapted selected target
  against the rendered white card, checking labels/legend, focus, fallback,
  pointer/keyboard controls, states, no clipping and no console errors. Source
  or synthetic-DOM checks alone are not browser/design acceptance.
- Required local repository validation, bundles, signatures, current/frozen
  resource compatibility, unchanged camera behavior, truthful directory labels
  and independent exact-candidate-SHA approval pass before the guarded PR.

The standing user order is merge, deploy the exact merged build, explicitly
restart BOTH existing public/dashboard services, then verify so the user can
visually review. Unavailable automated browser access does not re-block that
authorized sequence; record visual QA as unverified/blocked, never passed.
At this design checkpoint the coordinator's fresh in-app browser selection
failed and browser discovery returned no available browser. No new visual
acceptance is claimed from that absence.
Retain shipping guards and separately verify loaded health/integrity, exact
served assets and meaningful scoped behavior. Neither service health nor a
successful read-only real mesh acquisition proves rendered/user-device quality,
calibration quality, compensation effectiveness or safe physical printing.

No calibration, probe, home, clear, save, load, delete, printer control,
queue/history mutation, auth/Tailscale change, plugin reinstall or deferred
Mac-administration work is authorized. Preserve all other widget tracks.
