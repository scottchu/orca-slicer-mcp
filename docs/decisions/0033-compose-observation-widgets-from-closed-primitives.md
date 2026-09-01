# 0033: Compose observation widgets from closed primitives

- Date: 2026-09-01
- Status: accepted for the bounded private-lab foundation
- Milestone: F0 / UI-003; no production cutover

## Decision

The user requires small reusable foundations, not duplicated HTML in each
widget. Four layers make that requirement executable: DOM-owning leaf
primitives, layout leaves, zero-DOM domain composites, and styleless feature
widgets. Host adapters alone own acquisition. Components receive normalized
props and emit semantic callbacks; they never acquire printer data.

Closed primitives provide icons, bordered icons, labels, circle/box labels,
names, captions, source timestamps and degree values. ActualTarget composes two
DegreeValue instances; ThermalReading composes that pair with its name and
library icon. Layout leaves own rows, insets and responsive columns. Public
props do not expose arbitrary HTML tags, classes, styles or raw HTML. The
existing icon registry is centralized for migrated components. Existing raw
feature debt is frozen by an AST guard until each feature is migrated.

## Smallest shipping slice

Thermals is first: six canonical rows (Tool 1–4, Heater bed, Cavity), actual /
target with Celsius accessibility, distinct zero and unavailable values,
semantic active marks, unchanged source time, compact rows and one bottom
44-pixel action. Its feature and domain composites contain no native HTML,
style block or direct icon-library import. Existing lab title/routing,
clipboard generations and all production assets remain unchanged.

WidgetState distinguishes loading, ready (optionally refreshing), unavailable
and error. Loading has no observation or fake measurement; known data stays
visible during refresh. Shared skeleton leaves occupy ready-layout geometry,
are hidden from assistive technology and have no actions. One status announcer
reports state, the shell exposes aria-busy, opacity-only motion respects reduced
motion, and forced-colors retains the silhouette. Thermals implements this
first; its loading mode reserves exactly six rows and the footer action space.

## Acceptance and boundary

- AST checks reject raw elements, HTML injection, inline styles/classes,
  special/dynamic elements, direct icon imports and transport APIs in migrated
  feature/composite files; invalid fixtures prove the check fails.
- Component tests cover values, ARIA, closed states, no fake loading values,
  no loading controls, source-time preservation and refresh retention.
- Browser checks preserve ready geometry at 320/390/590/720; loading and ready
  use the same row/frame geometry. Production routes/resources/auth stay intact.
- Deterministic package remains below 750,000 bytes; added byte cost is recorded.
- Author software/fixture evidence is not independent, deployed, physical or
  user acceptance. Exact review precedes PR/merge, guarded deployment, explicit
  BOTH-service restart and scoped verification, then user feedback.

## Ordered follow-on tracks

Ship this bounded slice promptly; do not wait for the entire rewrite. Then add
all nine skeleton companions and a private skeleton gallery, migrate the eight
remaining ready views to zero-raw composition, and separately deliver the Bed
Mesh reference grid box with single visible X/Y/Z axes (theme unchanged), a
read-only Console with no command input, model-progress imagery based on real
sliced-layer geometry (never perspective-image bands), Camera lifecycle
migration, and independently reviewed per-widget production cutovers. None of
these pending tracks is implemented or physically accepted by this slice.

## PercentageBackground refinement (2026-09-01)

The next user-directed slice adds one registered DOM-owning decoration leaf,
`PercentageBackground`, to the SvelteKit private lab. Its closed API is
`value: number | null`, `max: number | null`, optional `color: string`, and a
Svelte `children` snippet. It accepts children unchanged and does not own card
insets, borders, clipping, radius, sizing, semantics or actions. An opaque child
surface would cover the decoration; consumers use a transparent content surface
and keep any rounded outer clipping at the existing surface/layout owner.

Finite nonnegative values and a finite positive maximum yield a left-to-right
fill clamped to 0–100%. For example, 220/200 fills the available background but
the child still displays 220/200. Null, nonfinite, negative values, or a zero,
negative or missing maximum produce no fill. This is decorative ratio
information, not heater safety, readiness or a redundant ARIA progressbar.
Thermals retains its real actual/target text and separate active/idle semantics.

Omitted color uses the semantic accent token. Overrides must be exactly seven
characters matching `#RRGGBB`; unsupported CSS names/functions, whitespace,
line terminators, alpha or injection strings produce no fill and never reach
CSS. Shared 12%→4% tint tokens produce the gradient only inside the filled
region; the remainder is transparent. There is no animation, overlay layer or
pointer interception, and forced-colors suppresses the decorative background.

ThermalReading composes this wrapper around ReadingRow with zero raw markup.
ReadingList owns positional seams and grid stretch through private inherited
layout tokens; ReadingRow applies them inside its existing border box. This
keeps direct skeleton rows and decorated ready rows at the same dimensions,
including unequal-height peers at 200% text. No other widget, production route,
MCP resource, acquisition boundary or service is changed by implementation.

Acceptance includes normal/over-maximum/invalid ratios, strict color inputs,
reactive child content and pointer/keyboard actions, actual rendered gradient
pixels, no new wrapper spacing or clipping, four-width row/seam/loading parity,
200% readability, deterministic packaging and unchanged production assets.
Exact independent validation and review precede ordinary PR merge and guarded
deployment/BOTH-service restart. This small feedback slice comes before, and
does not replace, the named follow-on tracks above.
