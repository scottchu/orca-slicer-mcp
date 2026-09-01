# 0032: Migrate focused widgets through a private SvelteKit lab

- Date: 2026-09-01
- Status: accepted for the bounded foundation slice
- Scope: F0 read-only presentation architecture; no production cutover

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

## Decision

### Strangler migration, not a production replacement

- Add a Svelte 5 and SvelteKit static application as a parallel, private
  fixture lab. Its first route is `/dashboard/lab/bed_mesh`.
- Keep `/dashboard/bed_mesh`, every existing dashboard route, every MCP tool
  descriptor and every current/frozen resource byte authoritative and
  unchanged. The lab route is not registered by the existing HTTP server or
  MCP resource inventory in this slice.
- Build dashboard assets with `@sveltejs/adapter-static`. The lab has no server
  routes, SSR data loader, endpoint, proxy, service worker or runtime asset
  fetch. It is a candidate artifact, not a deployed service.
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

## Observable acceptance

1. A reproducible static build contains `/dashboard/lab/bed_mesh/index.html`
   and no server endpoint. Existing production files and route/resource
   registries have no diff.
2. Component tests cover the shared shell anatomy, bridge-only prop boundary,
   44-pixel icon controls, mode state, no prose in the chart flow and non-layout
   overlay feedback.
3. Real-browser tests at 320/390/590/720 measure one 4:3 `ChartFrame`, compare
   its exact `DOMRect` across 3D/2D switching, and report no horizontal overflow
   or console error.
4. Browser captures cover both modes at the same viewport and state. The 3D
   surface, XYZ grid and labels are readable; 2D and 3D use the same fixture,
   numerical range and palette.
5. Static scans and runtime request capture find no component-owned network,
   printer, authentication or signaling request. Local build assets are the
   only page dependencies.
6. Source/component/browser evidence remains separate from production route,
   deployed service, live-printer, MCP-host and user-device acceptance. This
   slice authorizes none of those later layers.

## Consequences

The project gains a typed component and token system plus a measurable visual
lab without risking the running U1 surfaces. It temporarily carries two UI
implementations; that duplication is deliberate and bounded by per-widget
cutover gates. Static assets add build-time Svelte/Vite/Three dependencies, but
normal user and printer runtime authority do not expand.
