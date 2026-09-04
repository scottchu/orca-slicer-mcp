# 0051 — Add a balanced private-Lab composition variant

- Status: accepted for the isolated private-lab experiment; not accepted as production architecture or cutover
- Date: 2026-09-04
- Owners: project maintainers
- Milestone: F0 / UI-003

## Context

Decision0050 closed the version-2 private composable Lab around eight build-time
registered elements and removed the misleading temperature fill. The accepted A
examples prove uniform Stack and Grid composition, but they do not test a compact
information hierarchy with status in the header, one lead reading, and two quiet
secondary readings. A selected visual direction supplies that next isolated
question without authorizing arbitrary layout or styling.

## Decision

Add one Lab-only `balanced` B specification while preserving the canonical A
`card`, `compact`, and `larger` specifications. Add the existing generic common
`Inline` primitive as the ninth and final registered element. Its presentation
contract is a layout with exact children `[Title, HeadStatus]`, closed
`compact|regular` gap, and closed `packed|split` distribution. A Card header may
be either `Title` or `Inline`; its body remains exactly `Stack|Grid`.

Grid gains one optional closed `lead` arrangement, normalized to
`uniform|lead` in resolved output. Lead makes only its first child span the
available columns and uses a code-owned font-relative intrinsic minimum so the
secondary pair remains two columns when space permits and collapses without a
wire breakpoint or span. Leaves gain only their own optional closed appearance:
`HeadStatus.headerBadge`, `HeadTemperature.hero`, and
`FilamentColor|FanRelation.quiet`. Resolved nodes always carry the normalized
appearance. Header badges are valid only in Inline; hero temperature is valid
only as the first lead Grid child; quiet color/fan readings are valid only in
secondary lead positions. Duplicate fields are rejected recursively across the
header and body.

The balanced specification is a compact neutral Card without a filament tint.
It uses regular/split Inline with large subject Title and headerBadge status,
then a two-column regular/lead Grid containing hero temperature followed by
quiet filament color and fan relation. It adds no printer icon or empty icon
slot to the header, divider, Table, Row, gradient, arbitrary span, breakpoint,
style, path, URL, markup, or executable field.

All constructors remain statically imported in the client registry with exact
nine-entry parity and registry-owned typed adapters. The renderer remains
role-only. Schema and tool version stay 2; the isolated implementation becomes
`0.0.4-provisional` and its private resource URI is revised to
`ui://u1-print-studio/experiments/composable-lab-v2-r2.html`. Production
registration remains unchanged.

## Consequences

The B example can test header hierarchy, adaptive lead layout, finite visual
emphasis and input-shaped loading/error geometry without becoming a general CSS
or component language. Status and temperature still share one deduplicated
status receipt; timestamps, value provenance, truthful unknown/ambiguous fan
relations, partial healthy evidence and neutral failure behavior remain intact.

This decision does not approve live printer mapping, Camera, controls,
authentication, Tailscale changes, production registration, plugin installation,
deployment, Queue/History tables, mounted ChatGPT behavior, physical-printer
truth, or user-outcome acceptance.

## Validation

Require strict adversaries for unknown elements and arbitrary code/style/path
fields; Inline order, Card slots, nesting, tokens and distribution; incompatible
appearances and lead order; duplicate status across header/body; resolved
mode/order/provenance mismatch; exact nine-entry schema/component parity; and
unchanged canonical hashes and default rendering for all three A specifications.
Invalid input must reject before any reader call.

At 320, 390 and 720 CSS pixels and 100/200 percent root text, exercise balanced
known, unknown, ambiguous, loading, error and partial states. Require exact
topology, state heights within one pixel, neutral Card surface, no overflow,
atomic temperature target/unit, hero value at least 1.3 times secondary value
text, correct header alignment/wrapping, adaptive secondary collapse, animated
loading, static error, reduced-motion compliance, and absence of Table, Row,
separator, tint, gradient and scenario acquisition. Bind review to exact source,
Kit, HTML, MCP resource and screenshot identities. This remains synthetic
software/protocol evidence only.
