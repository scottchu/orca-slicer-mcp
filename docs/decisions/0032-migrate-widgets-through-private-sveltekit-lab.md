# 0032: Migrate focused widgets through a private SvelteKit lab

## 2026-09-01 projected Bed Mesh enclosure refinement

The existing private-lab Three/OrbitControls renderer gains a genuine floor and
two camera-far vertical grid walls. Four uprights and the selected axis edges
remain available for flat and nonflat measurements. A pure reversible transform
maps actual millimetres into centered display coordinates; padded, nondegenerate
nice Z bounds affect presentation only, never reported samples or summaries.

X/Y labels follow coherent camera-near outer base edges and Z follows an outer
silhouette upright. True world anchors are projected after orbit/resize, with
quadrant hysteresis, measured outward labels and a fitted orthographic frustum.
Essential titles/endpoints stay readable and contained; intermediate labels may
be thinned first. The normal default square fixture retains the existing 70%
width/42% height coverage gate. Other supported rotations require containment
and readable anchors, not an impossible area minimum for an edge-on flat plane.

Prop changes replace/dispose surface color/position/index and enclosure buffers
without remounting the renderer or resetting the orbit. The 2D leaf redraws on
data changes and respects unequal physical X/Y spans. Font changes refit labels.
Existing 4:3 frame, palette, summaries and icon-only bottom controls remain; no
height-scale/helper prose, dependency, acquisition, new product route or public/
MCP cutover is introduced. Raw markup is confined to existing chart leaves.
The existing 750,000/80,000/830,000 raw-byte package limits remain unchanged.
Source/buffer/browser evidence, deployed-service behavior and actual-device/
printer acceptance remain separate. This design does not approve source or ship.

## 2026-09-01 synthetic Camera packaging addendum

Role-separated design review accepted a second private self-contained artifact
after measured integration exceeded the existing bound: 762,180 bytes with
the current minifier; conservative pinned Terser 5.44.1/two passes produced
764,097. No unsafe flags, property mangling or dropped features were used.
The rejected minifier trial is not retained as a build dependency.

The observation directory and nine views retain the SvelteKit adapter-static
entry. Camera is an explicit separately compiled Svelte entry in that same
project, sharing primitives and LabControls. It is not described as a second
Kit adapter route. Exactly two decoded/raw UTF-8 HTML payloads are permitted:
observation <=750,000 bytes, Camera <=80,000, sum <=830,000. The directory
remains inside observation; no third index payload exists. These explicit
reviewed bounds supersede only the earlier one-artifact Camera exclusion.
Per-file and aggregate negative tests, deterministic output comparisons and
the complete browser suite remain required; future growth does not raise caps.

The Camera source graph excludes Three, observations, host RPC and the real
Camera session controller. It creates only a labeled local calibration canvas
and optionally its captureStream video, never a printer photo/device/network
request. Scenario and capability values are closed. Simulated-live FPS requires
advancing presented/decoded frames over a second and expires when stale.
One video/stream/track identity survives fullscreen/PiP presentation changes;
unsupported restricts capabilities, and simulated rejection calls no native API.

Only exact private `/dashboard/lab/camera` (plus its trailing slash) receives
the Camera artifact. The unchanged restrictive lab CSP/no-store/method and raw
traversal guards apply to both. Shipping derives the exact route-to-file hash
from source; it cannot treat Camera as observation bytes. No public route,
production camera, MCP resource/alias, auth, service topology or acquisition
contract changes. Static routes must not invoke printer dependencies.

Normal320/390/590/720 headers retain top-right status. Opt-in shared header
wrapping and font-aware status/controls allow intrinsically necessary enlarged-
text reflow without hiding/shrinking text or changing existing nine headers.
All seven states require glyph containment/non-overlap and equal card/media
geometry within each width/text setting; 200% need not match normal-size height.
Feedback remains a single non-flow overlay/announcer and controls stay44px.

Accepted architecture is not exact-source validation, delivery, phone, printer
or user acceptance. Production Camera migration remains separately gated.

- Date: 2026-09-01
- Status: accepted for the bounded private-lab slice
- Scope: F0 read-only presentation architecture; private fixture route only

## 2026-09-01 visible scenario laboratory addendum

Each observation route adds a shared compact, keyboard-accessible LabControls
dock after and outside its measured widget card. Preview lifecycle (loading,
ready, refreshing, unavailable, error), fixture scenario, freshness and bounded
values are independent closed choices. Queue state is explicitly distinct from
preview Loading. Per-view factories validate every resolved fixture through the
existing strict observation validator. Invalid query values normalize to safe
defaults; only closed local selections persist in the URL, with back/forward
restoring them. No runtime/global test harness or arbitrary JSON input ships.

Ready-refreshing retains the chosen fixture and source timestamp. Loading has
structural skeletons, one announcement and no fake telemetry or focusable
widget actions; scenario controls remain available outside the card. Terminal
states remain explicit. Freshness/value inputs are disabled outside ready and
refreshing. Reset affects only the current local preview. Controls may change
synthetic values, never printer, file, service, auth or media state.

Camera is a separate immediate follow-on and remains unlinked until delivered.
Its shared controller uses a discriminated camera scenario rather than invalid
observation-lifecycle combinations. Existing production routes, resources and
live-camera transport remain authoritative and unchanged. Both slices share
the existing 750,000-byte deterministic self-contained package budget.

## Context

The shipped focused widgets are self-contained vanilla HTML resources. They
preserve the closed MCP, observation-store and private-dashboard contracts, but
repeated visual refinements have accumulated renderer-local layout and state
rules. The user has selected an incremental SvelteKit rewrite so shared spacing,
type, action placement and chart geometry are implemented once rather than
patched independently. The latest Bed Mesh review exposed the first measurable
defect: changing between 3D and 2D changes the chart's vertical space, and the
3D surface can become unreadable.

A framework rewrite cannot silently replace proven routing, authentication,
tool, resource, acquisition or compatibility behavior. A new application shell
also must not become a second printer client or a public dashboard.

Independent visual review of candidate `7aef4b5` blocked acceptance: its frame
was stable, but the projected 3D surface occupied only a thin central band and
Three.js sprite labels rendered at effectively unreadable sizes. The same review
also identified that a typed prop alone was not a sufficient runtime bridge
contract because freshness/source metadata and matrix-derived summary agreement
were not verified.

Formal review of renewed candidate `a6363fd` found one remaining mismatch:
profile text was length/trim/control bounded but did not yet apply the existing
Moonraker adapter's canonical allowlist, so path, URL, markup and bidirectional-
control payloads could cross the component bridge.

## Decision

### Strangler migration, not a production replacement

- Add a Svelte 5 and SvelteKit static application as a parallel, private
  fixture lab. Its first route is `/dashboard/lab/bed_mesh`.
- Keep `/dashboard/bed_mesh`, every existing focused dashboard route, every MCP
  tool descriptor and every current/frozen resource byte authoritative and
  unchanged. The private dashboard server alone may register the exact lab
  route `/dashboard/lab/bed_mesh`; it is excluded from the dashboard directory,
  focused-route inventory, MCP resource inventory and public HTTP service.
- Build dashboard assets with `@sveltejs/adapter-static`. The lab has no Svelte
  server route, SSR data loader, endpoint, proxy, service worker or runtime
  asset fetch. Its deterministic self-contained HTML is compiled into the
  existing private dashboard server and served only by an exact path match.
- The generic library/embed scaffold remains a development experiment. Its
  approximately 994 KB output is neither generated by the production server
  build nor included in the lifecycle asset inventory or release manifest.
- A later widget moves only after its focused Svelte component has exact data,
  state, privacy, accessibility, browser-geometry and compatibility evidence.
  Cutover requires a separate decision or addendum, exact review, guarded
  rollout and explicit compatibility plan. Migration may stop or roll back per
  widget without changing the normalized observation contract.

### Bridge-injected presentation boundary

- Svelte components accept a versioned, already-normalized presentation value
  through component props. They do not import printer adapters, observation
  readers, HTTP/MCP composition roots, credentials or private configuration.
- Future MCP Apps and private-dashboard hosts may translate their existing
  bridge envelope into those props. Components do not call `fetch`, WebSocket,
  WebRTC, Moonraker, Tailscale or a caller-selected URL.
- The fixture-lab page uses a committed synthetic Bed Mesh fixture only. Its
  data is visibly scoped to the lab and is not current printer evidence.
- This boundary preserves the exact two model-visible/eight app-only tool
  inventory, closed view enum, `u1.monitor` authority and all decision-0027/
  0030 acquisition, normalization, privacy and read-only rules.

### Shared Svelte presentation foundation

- Define shared design tokens and the primitives `WidgetShell`, `WidgetHeader`,
  `WidgetBody`, `WidgetFooter`, `ObservedMeta`, `IconButton` and `ChartFrame`.
  Widgets compose these primitives instead of redefining card chrome.
- Information remains above actions. Icon-only actions are exactly 44 by 44 CSS
  pixels, have library-sourced icons, accessible names, titles, focus states and
  selected state where applicable. Transient feedback is an overlay that does
  not alter document flow.
- `ChartFrame` owns one responsive 4:3 box. Bed Mesh 2D and 3D render into the
  same element and exact `DOMRect`; switching modes replaces only chart content.
  At 320, 390, 590 and 720 CSS-pixel page widths, frame width, height, top and
  left must remain equal before and after the switch within browser subpixel
  tolerance. No explanatory paragraph occupies card flow.
- Bed Mesh uses every supplied reported sample and the supplied XY bounds. The
  3D renderer uses local Three.js with an orthographic camera, real Z axes/grid,
  bounded automatic display exaggeration and deterministic adjacent triangles.
  The 2D renderer retains the same coordinate orientation and height palette.
  Summary values and axis labels remain actual millimetres.
- 3D axis and bound/value labels are stable HTML overlays, never perspective-
  scaled sprites. Their computed size is at least 12 CSS pixels at every frozen
  viewport. The initial real projected surface occupies at least 70% of the
  chart width and 42% of its height; labels stay inside the frame and do not
  overlap one another.
- Runtime bridge validation accepts only the exact freshness enum, a null or
  canonical millisecond UTC ISO observation time, and profile text matching
  `^[\p{L}\p{N} _.-]{1,80}$` with the Unicode flag. Outer spaces are trimmed;
  empty, `.` and `..` values are rejected. This is the established Moonraker
  adapter canonical rule and excludes path/URL separators, colons, markup
  delimiters, controls and bidirectional formatting characters. Validation
  also requires a finite matrix and valid XY bounds. It recomputes minimum,
  maximum and range
  from every matrix cell and requires supplied summary values to agree within
  an absolute `0.000001 mm` tolerance. The recomputed values become the
  rendering source of truth so surface, legend, accessible label and numerical
  summary cannot disagree.

## Observable acceptance

1. A reproducible static build contains `/dashboard/lab/bed_mesh/index.html`;
   two clean builds have the same SHA-256 and production packaging includes
   only that self-contained lab page, never the generic embed bundle.
2. Component tests cover the shared shell anatomy, bridge-only prop boundary,
   44-pixel icon controls, mode state, no prose in the chart flow and non-layout
   overlay feedback.
3. Real-browser tests at 320/390/590/720 measure one 4:3 `ChartFrame`, compare
   its exact `DOMRect` across 3D/2D switching, and report no horizontal overflow
   or console error. They also measure at least 12-pixel visible, non-overlapping
   HTML axis/value labels and the actual camera-projected surface bound against
   the 70%-wide/42%-high coverage floor.
4. Browser captures cover both modes at the same viewport and state. The 3D
   surface, XYZ grid and labels are readable; 2D and 3D use the same fixture,
   numerical range and palette.
5. Static scans and runtime request capture find no component-owned network,
   printer, authentication or signaling request. Local build assets are the
   only page dependencies.
6. The private dashboard returns 200 only for the exact lab route (plus its
   optional trailing slash), while the public service and nested/encoded/path-
   traversal variants return 404. GET is the only accepted method and no lab
   request acquires an observation, camera frame or media session.
7. Existing `/dashboard/bed_mesh`, directory links, focused route/tool
   verification, MCP descriptors/resources, auth and Tailscale behavior remain
   byte/behavior compatible. Source/component/browser evidence remains separate
   from deployed service, live-printer, MCP-host and user-device acceptance.
8. Component fixtures reject invalid freshness/source/profile values, including
   path, URL, bidi, markup, dot/dotdot and control adversaries, nonfinite cells
   and summaries inconsistent with the matrix. International Unicode letters/
   numbers plus internal spaces, underscores, dots and hyphens remain valid;
   within-tolerance summaries are normalized to exact recomputed values.

## Consequences

The project gains a typed component and token system plus a measurable visual
lab without replacing the running U1 surfaces. It temporarily carries two UI
implementations; that duplication is deliberate and bounded by per-widget
cutover gates. The private server bundle grows by the self-contained Bed Mesh
lab page; the public bundle, generic embed, normal user authority and printer
runtime authority do not expand.

## 2026-09-01 all-observation private-lab addendum

### Context

The Bed Mesh foundation is merged, while the eight other observation views
still rely only on the production vanilla renderer. The user requires the full
Svelte observation system to mature together in the private lab before any MCP
resource is cut over. Camera is deliberately excluded because its media-session,
fullscreen and Picture-in-Picture lifecycle needs a separate migration.

### Decision

- Extend the private lab to exact `/dashboard/lab/` plus
  `/dashboard/lab/{overview,progress,thermals,heads,jobs,job_history,queue,fans,bed_mesh}`.
  One deterministic self-contained SvelteKit package selects only from that
  closed pathname set. The private server may serve the same bytes for each
  exact path and optional trailing slash. Case, nested, encoded and public
  variants remain unavailable.
- The lab directory lists all nine observation views and names Camera as pending
  its lifecycle migration without linking or registering a camera lab route.
  Existing production `/dashboard/*`, directory entries, MCP tools/resources,
  auth, Tailscale and public HTTP remain unchanged.
- Every view accepts one versioned bridge-injected presentation value and applies
  a strict domain validator before rendering. Fixtures are synthetic, visibly
  marked `Lab fixture`, and contain no raw filenames, paths, URLs, identifiers,
  printer identity, credentials or live telemetry. Components make no network,
  printer, camera, auth or signaling request.
- All focused cards reuse the shared tokens and exactly one `WidgetHeader`,
  `WidgetBody` and `WidgetFooter` inset owner. Information stays above actions;
  icon-only actions remain 44 pixels and feedback is an overlay that cannot
  change intrinsic card height. Canonical titles are Overview, Print Progress,
  Thermals, Heads & Filaments, Current Job, Job History, Print Queue, Fans & Air
  and Bed Mesh.
- Progress uses a prominent reported percentage, one continuous 8-pixel bar,
  layers, ETA and elapsed time. Thermals uses compact Tool 1--4, Heater bed and
  Cavity rows. Heads uses weak actual-color washes for loaded material and a
  neutral gray Empty/N/A treatment without redundant presence prose. Current
  Job and Job History remain separate. Fans use library icons, a restrained
  percentage fill and compact right-aligned RPM without Commanded/Measured
  labels. Overview remains a compact eight-domain summary. The accepted Bed
  Mesh component and its 4:3 geometry/readability contract remain unchanged.

### Observable acceptance

1. Component and validator tests cover every view, adversarial enum/number/time/
   label/color/shape values, canonical headings, shared anatomy, one footer
   action and overlay feedback with stable intrinsic height.
2. Real Chrome captures every view at 320/390/590/720 CSS pixels. Tests enforce
   no horizontal overflow, no clipped 44-pixel action, common tokens/insets,
   canonical title, readable content-driven height, zero console error and zero
   nonlocal request. Refresh feedback does not move or resize the card.
3. The same deterministic self-contained package serves every exact private lab
   path. The directory and view selection work from pathname alone. No external
   asset, runtime fetch, generic embed or camera code ships in the package.
4. Private exact routes return 200 without observation/media acquisition;
   public, encoded, traversal, nested, case and camera-lab paths return 404.
   Existing production route/resource/tool byte and behavior contracts remain
   green through repository and shipping gates.

### Consequences

The private server bundle grows because the lab temporarily carries Svelte
presentations beside all production renderers and includes local Three.js for
Bed Mesh. Bundle size is evidence and a review risk, not permission to split in
runtime fetches or cut over production. Every observation component remains an
independently callable candidate; cutover still occurs in separately reviewed
per-widget slices.

### Formal-review renewal

Exact candidate `8a6df9b` exposed six acceptance gaps. The renewed candidate
fixes them without expanding runtime scope:

- Static SSR emits a neutral zero-size marker and initial browser creation
  selects the exact closed pathname before mount; child loads do not render the
  directory branch or resize after mounting.
- The private handler examines the raw request target before WHATWG URL
  normalization and rejects literal, once-encoded and twice-encoded `..`.
- Heads accepts canonical six/eight-digit hex, normalizes case and retains RGBA
  alpha. History and Queue clocks use the viewer-local basis of header metadata.
- Overview is one column at 320 and two at 390/590/720. Heads stays two columns
  through 720 without reserved material height. Thermals and browser titles use
  their exact canonical labels.
- Tests now cover every view's applicable enum, number, time, shape, order,
  label and color boundaries plus route/title/visibility/layout-shift/columns/
  clipping at all frozen widths. Bed Mesh acceptance remains unchanged.

### Parser-title and Heads interaction renewal

Re-review found two remaining gaps without changing the migration boundary:

- The neutral SSR marker prevented wrong body content, but a generic title was
  still parsed before the canonical child title. The earliest inline app-head
  bootstrap now selects the exact closed pathname, title and route marker before
  Svelte head output or hydration. Browser instrumentation must observe exactly
  one non-empty title for the directory and every direct child route.
- Heads applies the accepted six-percent validated filament-color wash over
  white through CSS `color-mix`, retaining the effect of an RGBA alpha byte.
  Every valid hex exposes an accessible 44-pixel bottom Copy action; Empty/N/A
  has none. Copy and Refresh share one truthful non-flow feedback overlay so
  neither interaction changes intrinsic height or creates competing toasts.

### Latest-action and semantic-active renewal

Exact `b3e0c7e` showed that one rendered overlay is insufficient if Copy and
Refresh retain separate state: an older Copy could mask a newer Refresh. The
shared `ObservationFrame` therefore owns one feedback value, one timer and one
announcer used by every frame action. Each action replaces the previous value
immediately, so Copy → Refresh and Refresh → Copy both display only the latest
truth without overlap or geometry change.

Active tool state is semantic, not filament-derived. The active border uses the
shared amber `--u1-accent`; changing a valid filament color may change only its
six-percent RGBA-aware wash and exact swatch/hex.

### Asynchronous action-order renewal

Exact `4e8788f` showed that a single state/timer is still insufficient if an
asynchronous Copy does not record intent until after `clipboard.writeText`.
Every feedback action now increments one generation and writes its intent
immediately. Copy begins with persistent `Copying …`; its later truthful success
or failure settles only when its generation is still current. Any newer Refresh
or Copy invalidates the older completion without spawning another timer or
status node.
