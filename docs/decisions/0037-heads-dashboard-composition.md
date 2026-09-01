# Heads dashboard composition and parity

Date: 2026-09-01. Status: implementation candidate, not release acceptance.
Milestone: F0, UI-003 and OBS-010, continuing the existing per-view migration.

The bounded next slice replaces only the private Heads dashboard child and the
lab Heads composition. It reuses the independently accepted observation host
controller after that controller reaches reviewed main. The generic MCP resource,
legacy aliases, backend acquisition, printer controls, authentication and routing
authority stay unchanged.

Four keyed physical-tool cards use shared neutral CardGrid, InsetCard and
ColorSwatch leaves. The feature composites contain no raw DOM or style. Active
is independent of reported head state; inactivity never implies Parked. Actual
and target are independent nullable finite values, not restricted to lab ranges.
Known vendor/type/subtype remain readable, including retained metadata when
presence is false or unknown. A separate Materials receipt never inherits fresh
thermal time. Three accepted 64-character fields may form a 194-character label.

Only reported-present filament with validated RGB/RGBA gets its exact hex,
swatch, six-percent alpha-aware wash and bottom Copy action. Empty and unknown
presence show Empty and N/A respectively with gray backgrounds and no loaded
color or Copy. There is no separate filament-presence sentence. Semantic active
accent remains independent of color. Copy feedback is non-flow, generation
guarded, and cannot overwrite newer refresh/data; removal of a focused Copy
action has a deliberate local focus fallback.

Acceptance requires strict real DTO tests, zero-raw AST checks, four widths
(320/390/590/720) at normal and 200% text, truthful closed-preset skeleton
geometry, arbitrary long-text readability, retained-refresh/copy geometry and
focus, independent material/thermal freshness and all nullable/zero/alpha/state
cases. Exact private asset security and deterministic production packaging are
required before cutover. A measured separate 100,000-byte production limit is a
proposal requiring independent approval; lab limits remain 750,000/80,000 and
830,000 aggregate. No cap is silently widened. Local synthetic evidence is not
real-printer or actual-device acceptance. Exact independent candidate approval
precedes the existing guarded merge/deploy/BOTH restart/verification workflow.
