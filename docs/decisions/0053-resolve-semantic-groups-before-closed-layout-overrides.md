# 0053 — Resolve semantic groups before closed layout overrides

- Status: accepted for the isolated private-lab experiment; not accepted as production architecture or cutover
- Date: 2026-09-05
- Owners: project maintainers
- Milestone: F0 / UI-003

## Context

Decision0052 proved a balanced hierarchy with closed `Inline` and `Grid`
tokens, but those placement nodes could not express why title/status and the
three T1 readings belong together. The visible result could satisfy a grid
shape while retaining loose spacing and a split identity header. The user now
wants smart grouping first, with an explicit six-column DSL override only when
placement needs to be stated.

## Decision

Add build-time registered common `Group`, `Row`, and `Column` elements, bringing
the private vocabulary to exactly twelve entries. `Group` has the semantic role;
`Row` and `Column` retain structural layout roles. Every entry owns strict spec
and resolved schemas, a child policy, a static Svelte import, an independent
typed prop contract and a registry adapter. The recursive renderer continues to
branch only on registered child-bearing roles (`semantic` or `layout`) and
never on an element name.

Resolve every grouped Card in two deterministic stages. The first stage
validates relations and members. `identity` accepts exactly `Title` followed by
`HeadStatus`; its packed 12-pixel relationship and header-badge appearance are
code-owned. `summary` accepts `HeadTemperature`, `FilamentColor`, and
`FanRelation` exactly once. Callers cannot supply their appearances. Smart
summary input may list those three leaves in any order; registry affinity
normalizes them to temperature, filament, then fan and records
`defaultRule: summary-grid6-v1`.

Resolved identity records `defaultRule: identity-packed-v1`. These exact `-v1`
literals version the two code-owned algorithms independently of schema version
2; a future behavioral change must introduce a new registered literal and
decision instead of silently reinterpreting either rule.

The second stage applies placement. With no override, the `summary-grid6-v1`
rule creates one six-track temperature row and one three-plus-three filament/fan
row. An explicit override may provide only
`{ kind: grid, tracks: 6, rowGap, columnGap }` and one to six `Row` children.
Each Row contains one to six Columns; every Column has a closed integer
`colSpan` from one through six and exactly one summary leaf, and every Row must
sum to exactly six. Explicit placement preserves authored row/column order but
cannot change membership, value, appearance, provenance or evidence state.
Resolved output records `layoutSource: smart | explicit`, the versioned default
rule, exact spans, Row column gap and `collapse: intrinsic`.

The Group registry owns distinct executable child policies for identity, smart
summary, explicit summary, and resolved summary shapes. Identity therefore
remains an exact two-item tuple, smart summary remains an exact three-item
tuple, and explicit/resolved summary accepts one to six Row children. A legal
single explicit Row may contain three span-2 Columns; it is not rejected by a
broader Group minimum before relation-specific validation runs.

Intrinsic readability remains code-owned and overrides placement when needed:
three-plus-three remains paired at 390 and 720 pixels at normal text size, then
stacks at 320 pixels and at 390 pixels with 200-percent text. No override can
disable that floor. Group gaps are 20 pixels, column gap is 16 pixels,
label/value gap is four pixels and icon/text gap is 12 pixels. The neutral Card
has no tint, gradient, divider, table or printer icon. Loading, error and partial
states retain the same resolved structure.

Quiet FilamentColor uses the code-owned visible label `Configured color` so the
390-pixel three-track column remains at most two label lines, while the generic
Swatch exposes `Configured filament color` as the full accessible label. This is
not a wire copy field or caller-controlled content. Default/A visible copy and
type size remain unchanged; balanced B retains its spec/hash and shares this
quiet-label presentation refinement.

The three A specifications and Decision0052 balanced B specification remain
unchanged. Schema/tool version remains 2 because this is an unsupported private
experiment. The isolated implementation becomes `0.0.5-provisional`, with
immutable resource
`ui://u1-print-studio/experiments/composable-lab-v2-r3.html`. Production
registration remains unchanged.

## Consequences

An AI can state a small domain relationship and optionally select a validated
placement without controlling CSS, breakpoints or executable behavior. Smart
layout remains predictable and inspectable; explicit rows are an override of
placement rather than a second semantic model. Future relations, grid features
or collection/table elements require new closed registry work and review.

This decision does not approve general layout authoring, runtime component
registration, HTML, CSS, JavaScript, paths, URLs, holes, offsets, row spans,
overlap, caller breakpoints, Queue/History tables, live printer mapping,
Camera, controls, authentication, Tailscale changes, plugin installation,
production registration, deployment or user-outcome acceptance.

## Validation

Require exact twelve-entry pure/client parity and static imports; strict group,
row, column, span, row-sum, appearance and placement adversaries before any
reader call; unchanged A/B canonical hashes and default rendering; equal smart
and explicit resolved semantics and geometry for the supplied comparison; one
status, materials and environment read each; and full envelope correlation of
relations, layout source, rules, order, spans, appearances, source receipts,
timestamps and provenance.
Also require a valid one-Row explicit `2 + 2 + 2` case that preserves authored
leaf order and performs exactly one acquisition per referenced source.

At 320, 390 and 720 CSS pixels and 100/200-percent text, exercise smart and
explicit known, unknown, ambiguous, loading, error and partial states. Require
state geometry within one pixel, packed identity, the specified paired/collapsed
secondary behavior, atomic temperature target/unit, no overflow, animated
loading, static neutral error, reduced motion, forced colors, visible focus and
absence of tint, gradient, divider, table or printer icon. Bind review to exact
source, Kit, HTML, MCP resource and visual evidence identities. These remain
synthetic software/protocol results, not mounted-host, device or printer proof.
