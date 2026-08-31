# 0023 — Use quiet observation footers and camera overlays

- Status: accepted for the user-requested presentation refinement; implementation acceptance pending
- Date: 2026-08-31
- Owners: project maintainers

## Context

The user's mounted phone screenshots show useful focused content surrounded by
repeated permission, source, freshness, and debug chrome. Heads and Filaments
has a useful title, but its header, provenance row, and global footer repeat
information. Camera has a redundant title and observation header while the
image overlay exposes ICE transport and FPS. The user explicitly requests
consistent quiet footers for non-camera views and image-only camera state,
timestamp, fullscreen, and picture-in-picture controls.

This addresses F0's focused-observation comprehension question and refines
decision 0021's selected Instrument Strips. It is not a new visual direction,
the deferred overview, or acceptance of unnormalized printer domains.

## Decision

### Shared non-camera card anatomy

- Preserve the existing focused title and useful content: print progress,
  thermal rows, physical head cards, and honest unavailable-domain panels.
- Remove visible `Read only` copy and lock badges from current observation and
  camera widgets. Also remove the command/version line, repeated `Current
  reading` copy, duplicate provenance row, and global permission note.
- Render one footer inside each non-camera card, below its content. Its left
  side is `Observed HH:MM:SS` in the viewer's locale; its right side is the
  existing refresh icon with accessible name `Refresh observation`.
- The footer uses a subtle top divider, a 12-pixel gap, 12-pixel top and
  18-pixel bottom spacing, and the card's existing horizontal inset (24 pixels
  normally, 18 pixels on narrow screens). Refresh retains a 44-by-44-pixel
  minimum target. Timestamp text is 12 pixels with a readable line height and
  tabular numerals; it wraps instead of colliding with the control.
- Fresh state needs no extra label. Append `Stale`, `Offline`, or `Freshness
  unknown` when applicable. Missing time is `Observation time unavailable`,
  never an epoch date or current wall clock. Retained stale values keep their
  original source time. Refresh failure is visible without clearing useful
  retained data or marking it current.
- Source, observation version, provenance, capability evidence, and permission
  policy remain in the structured result. Removing repeated decoration does
  not remove evidence or weaken the read-only boundary.

### Camera anatomy and states

- Camera is the image surface, without an external heading, permission
  caption, timestamp row, refresh control, or footer. Preserve its existing
  rounded image and visual tokens; do not rebuild it as a status dashboard.
- The lower-left overlay contains only the state and a truthful time:
  `Snapshot · HH:MM:SS`, `Fallback · HH:MM:SS`, or `Live · HH:MM:SS`.
  Use `Time unavailable` when an accepted image has no valid time.
- Connecting with a retained image may say `Connecting · HH:MM:SS`, retaining
  that image's time. With no image, show `Connecting` and then an honest
  `Camera unavailable` if acquisition fails. Never imply a black or unloaded
  video is live. Fallback has a non-green semantic indicator and concise
  accessible explanation; network debugging text stays out of normal chrome.
- The lower-right action remains explicit Go Live or Close. Fullscreen and
  picture-in-picture controls occupy the upper-right overlay. Remove the
  redundant upper-left camera symbol. Use existing icon language, 44-pixel
  targets, at least 8-pixel separation, and 12-to-16-pixel image-edge insets.
  State/time and controls must not overlap at 320-pixel width.
- Hide ICE path, candidate type, transport, configured mode, and FPS from
  normal presentation. No new debugging panel is required for this slice.
- Fullscreen and PiP use supported host display-mode requests when available,
  with feature-detected native video/browser alternatives. A supported host
  may map PiP to fullscreen on mobile; do not claim a floating phone window
  from API availability alone. Native video PiP is offered only with live
  media. Unsupported controls are absent, and rejected requests leave the
  current presentation intact with concise local feedback.

### Truthful camera time

- Snapshot and fallback time belongs to the JPEG actually displayed, not the
  latest attempted refresh. Preserve it through image-load and mode changes;
  replace it only when a new accepted image successfully loads. Failed
  refreshes and connection errors do not retimestamp a retained image.
- The camera adapter's successful JPEG acquisition time is the server's
  receipt time. It is not a camera-sensor capture timestamp. Do not discard
  that returned time in favor of the start of the acquisition request.
- Live time is the local time of the latest evidenced rendered/received video
  frame, not the snapshot time or a free-running clock. Update visible text
  at most once per second while genuine frame callbacks or independently
  advancing decoded-frame evidence continues. Stop advancing on a stalled,
  paused, ended, failed, or closed stream and preserve bounded fallback.
- A `playing` event alone cannot justify an indefinitely advancing live clock.
  If frame evidence is unavailable, show unknown time instead of inventing
  freshness. Do not equate the snapshot/server and live/client clocks with
  printer acquisition time or use them as synchronization evidence.
- Announce mode transitions accessibly, not every frame or clock tick. The
  clock itself must not be an assertive or continuously updating live region.

### Loading is not an implementation claim

- Distinguish initial pending data, malformed or failed host delivery,
  successfully loaded but unknown/unavailable domain values, and retained stale
  data. Pending work must end at a bounded deadline with explanatory feedback;
  it cannot remain a generic `Waiting` card forever.
- A known non-camera view may offer `Retry` through the existing app-only
  observation path. If the host has supplied no usable view or bridge, explain
  that the card should be reopened rather than inventing a view or a success.
- Queue, fans, bed mesh, cavity, filament identity/color/sensors, and job
  history remain explicitly unknown/unavailable wherever current adapter
  mappings are absent. Their shells are not implemented data capabilities.
  Remove decorative traces or charts that could be mistaken for measured
  history when no series exists. Remove the gray bed-mesh grid when no
  normalized grid exists; use a compact explanatory empty state instead.
  Preserve actual measured numbers. Do not fill gaps with demo values.

## Compatibility and safety

This supersedes only decision 0021's permanent visible read-only/time-header
requirement. Observation provenance, stale retention, separate camera time,
the exact two model-visible intents, app-only helpers, activation, fan-out,
privacy, and read-only authority remain unchanged. Preserve frozen legacy
resource bytes for retained tasks; current resource versioning must make a
fresh task's assets distinguishable. Deployment, installation, service,
authentication, routing, and printer-control changes require their own scope
and evidence.

## Validation

1. At phone widths and the accepted 720-pixel strip size, current views contain
   no visible permission/debug boilerplate and no horizontal overflow. Useful
   titles/content remain; every non-camera footer has time and one refresh.
2. Fresh, stale, offline, missing-time, pending, delivery-error, and unavailable
   fixtures remain visually distinct. Retry and refresh have finite busy
   states, remain keyboard accessible, and do not fabricate observations. No
   hardcoded thermal waveform or mesh-cell grid appears as pseudo-telemetry.
3. Snapshot time survives image load and mode changes; failed acquisition and
   image decode do not update retained-image time. Camera unavailable never
   becomes Live solely from a signaling acknowledgement.
4. Live frame evidence advances the overlay, a stall freezes it, fallback
   displays the accepted JPEG's time, and Close preserves session cleanup.
   Repeated timestamps do not cause screen-reader announcements every second.
5. Unsupported and rejected fullscreen/PiP paths preserve the camera. Supported
   host/native transitions and exit behavior are tested separately; iPhone
   mounted behavior remains unaccepted until exercised by the user or browser.
6. Static/software, synthetic frame/host tests, rendered fixture comparison,
   installed runtime, real printer, and mounted user outcomes are reported as
   separate layers. The supplied screenshots identify the requested change;
   they do not prove the new implementation.

## 2026-08-31 refinement — segmented layer progress

The user requests that the existing continuous progress strip become visible
filled/empty layer blocks. This is a bounded refinement to the same focused
card, not a new dashboard, telemetry field, or observation path. It addresses
F0's layer-progress comprehension question. The prior deployed card and quiet
footer are the baseline; all surrounding layout and copy remain unchanged
except an unavailable layer caption when valid layer data is absent.

- Preserve the bar's current position and 14-pixel height, with 2-pixel gaps
  and modest 2-pixel block corners. Filled portions use the current yellow
  accent; remaining portions use the neutral track color. Do not add labels,
  legends, tick numbers, animation, tooltips, or controls around the strip.
- Use at most 24 blocks at viewport widths up to 480 CSS pixels and at most
  48 above that width. The block count is the smaller of that budget and the
  valid total layer count. A small count displays one block per layer;
  hundreds of layers use consecutive groups instead of unreadable hairlines.
  Responsive regrouping must not fetch data or reset observation freshness.
- For total `T`, current layer `C`, and block count `B`, block `i` represents
  the interval from `floor(i * T / B)` to `floor((i + 1) * T / B)`.
  Its fill is zero before that interval, full at or beyond its end, and the
  proportional fraction within that one current group. Do not round a partial
  group upward to imply additional layers. At `C = 0` all blocks are empty;
  at `C = T` all are filled. This is current reported layer position, not proof
  that a layer or print has physically completed.
- The segmented strip uses only current/total layer values. Keep the existing
  large reported print percentage independently unchanged: file/job progress
  need not equal layer position. Do not derive one from the other, silently
  reconcile disagreement, or infer completion from either value.
- Layer data is valid only when both values are safe integers, total is
  positive, and current lies inclusively between zero and total. Missing,
  fractional, negative, over-total, nonfinite, or otherwise invalid values
  produce an unfilled neutral track and `Layer progress unavailable` in the
  existing layer-caption position. Do not substitute percentage, clamp
  invalid values into plausible layer positions, or invent a layer count.
  The neutral unavailable track is not a zero-layer observation.
- Expose one `progressbar`, labelled `Layer progress`, with minimum zero,
  maximum total, current value, and `Layer C of T` value text when valid.
  When grouping, value text also states `Grouped into B blocks`; individual
  decorative blocks stay hidden from assistive technology. Unavailable data
  omits the current-value attribute and explicitly announces unavailable layer
  progress rather than indeterminate active work. No new keyboard stop or
  live-region announcement is needed.
- Acceptance covers small totals, zero/start/end, large grouped totals and
  partial groups, narrow/wide regrouping, differing percent/layer ratios,
  missing/invalid values, light/dark contrast, unchanged bottom footers, and
  absence of overflow at 320/390/720 CSS pixels. Source tests and synthetic
  browser captures remain separate from deployed or physical-printer proof.
- This request authorizes source changes and local validation only. Prior
  PR30 merge/rollout authority is complete, not permission to merge, deploy,
  install a plugin, restart services, contact the printer, or expand domains.
