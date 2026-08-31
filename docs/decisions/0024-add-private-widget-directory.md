# 0024 — Add a private widget directory

- Status: accepted for the user-requested source slice; validation and deployment are separate
- Date: 2026-08-31
- Owners: project maintainers

## Context

The user needs one stable entry point that shows which focused widgets exist
and what each can currently display. The private dashboard root previously
redirected to Progress, so it could not serve that purpose. The deployed older
widget chrome also still differs from decision 0023's reviewed source; adding
a directory does not itself deploy that refinement or implement missing data.

This addresses F0's discoverability and capability-comprehension question. A
navigation directory is not the deferred overview or the rejected giant
machine map. It should let the user choose one view without opening all views
or silently acquiring printer observations and camera media.

## Decision

### Entry point and content

- Both private `/dashboard` and `/dashboard/` serve the same static directory.
  They no longer redirect to Progress. All eight existing focused paths remain
  independently addressable and keep their existing behavior.
- Use the heading `Printer widgets` and a short explanation: `Open a focused
  view. Availability describes this release, not printer status.`
- Show exactly these eight ordinary same-tab links, in this order. Paths are
  origin-relative and fixed, never derived from a caller-supplied target.

| Title | Path | Implementation label | Description |
| --- | --- | --- | --- |
| Progress | `/dashboard/progress` | Implemented | Print state, progress, layers and remaining time. |
| Camera | `/dashboard/camera` | Implemented | Snapshots and live view. |
| Thermals | `/dashboard/thermals` | Partial | Extruder and bed temperatures. Chamber readings are not implemented yet. |
| Heads & Filaments | `/dashboard/heads` | Partial | Head state and temperatures. Filament material and color are not implemented yet. |
| Jobs | `/dashboard/jobs` | Partial | Current-job details. Job history is not implemented yet. |
| Queue | `/dashboard/queue` | Not implemented | View available; queue data is not implemented yet. |
| Fans | `/dashboard/fans` | Not implemented | View available; fan and purifier readings are not implemented yet. |
| Bed Mesh | `/dashboard/bed_mesh` | Not implemented | View available; bed-mesh data is not implemented yet. |

- Labels describe this source release's implemented data coverage, not
  current connection state, measured printer capability, freshness, or physical
  acceptance. Unimplemented links remain usable so the user can inspect their
  honest explanatory views; they must not appear disabled or falsely ready.
- The directory does not include Overview, a composed status card, totals,
  fabricated previews, live indicators, timestamps, refresh controls, or the
  removed read-only/current-reading/provenance chrome. Decision 0023 continues
  to govern focused-card footers and camera overlays unchanged.

### Presentation

- Reuse the current plain HTML, system type, light/dark tokens, yellow accent,
  rounded surfaces, and 720-pixel maximum content width. No new visual system,
  dependency, remote font, icon library, or generated mockup is required.
- Use a compact list/card grid with a single column on narrow screens and at
  most two columns when space permits. Each link has its title, text-based
  implementation label, short description, and optional decorative chevron.
  Status is never communicated through color alone.
- The complete row/card is one semantic anchor, at least 44 pixels high, with
  a clear keyboard focus indicator. Keep the title/label readable at 320 pixels
  without horizontal overflow; descriptions wrap normally. Do not introduce
  search, filters, menus, or nested interactive controls for eight entries.

### No acquisition or authority expansion

- Loading the directory is navigation only: no iframe, widget mount, tool
  invocation, fetch, polling, camera image, video, WebRTC allocation, or printer
  acquisition. It needs no client-side script or external assets.
- Preserve the private-dashboard enablement boundary. Public `/dashboard*`
  routes remain unavailable; the directory does not broaden authentication,
  routing, enrollment, Monitor authority, or the closed MCP inventory.
- This supersedes only decision 0022's root-to-Progress redirect. Focused
  route semantics, shared observation store, deferred Overview, all safety
  boundaries, and frozen compatibility resources remain unchanged.
- Source implementation and local validation are authorized. Merge, service
  rollout, plugin installation, authentication/routing changes, missing-domain
  adapter work, and printer control require their own authority and evidence.

## Observable acceptance

1. Private GETs for `/dashboard` and `/dashboard/` return equivalent directory
   HTML with exactly the eight expected hrefs and coverage descriptions.
   Neither root redirects, and all accepted focused URLs keep working.
2. The public handler still rejects dashboard roots and focused paths; unknown
   selectors do not become generic routes or caller-selected targets.
3. Route and browser fixtures prove directory loading makes zero printer,
   observation-tool, camera, iframe, or nonlocal asset requests. Construction,
   health, and static reads remain acquisition-free.
4. Screenshots at 320, 390, and 720 CSS pixels in light and dark modes show
   readable labels and descriptions without overflow. Keyboard navigation
   reaches all eight anchors in their visual order with visible focus.
5. Existing current-widget checks retain bottom timestamp/refresh placement,
   absent redundant chrome, and truthful camera behavior. Directory work does
   not reintroduce it in a surrounding host.
6. Tests, isolated rendered fixtures, deployed runtime, mounted mobile views,
   and real-printer evidence remain distinct. A directory label is not proof
   that the printer or camera is currently reachable.
