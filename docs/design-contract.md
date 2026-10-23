# Current presentation design contract

This is the current ownership map for F0 / UI-003. Decisions own product meaning;
components and their code-owned tokens own dimensions. Historical captures and
handoffs record acceptance of a candidate, not another set of design rules.

## Rules that apply across widgets

- Keep real, unknown, empty, successful age-stale and acquisition-failure states
  distinct. Under decision0041, failed acquisition masks old telemetry with
  static neutral skeletons and persistent status; local action feedback does not
  invalidate healthy data. Preserve internal timestamps, ordering and cache.
- Information hierarchy, readable atomic values/units, visible keyboard focus,
  44px action targets, reduced motion and unclipped content are shared contracts.
  Keep decision0041's <=1px state geometry requirements at supported widths and
  enlarged text. This maintenance does not weaken those requirements.
- Common components own presentation only; domain adapters own domain labels,
  field mapping and semantic composition. Services own acquisition and lifecycle.
- A layout parent owns its gaps and inset; a leaf owns its internal icon/copy
  anatomy. Do not reach into descendant leaf styles to silently change density.

## Code ownership

Paths below are relative to `plugins/u1-print-studio/app/`.

| Responsibility | Owner |
| --- | --- |
| Shared spacing, semantic typography, action sizes, colors | `src/components/common/tokens.css` |
| Observation receipt time, state/reason suffix composition and closed field fallback | `src/components/observation/DomainReceipt.svelte`; callers retain source association, grouping and reason policy |
| Reading icon frame, content inset and regular/compact reserve | `src/components/common/Reading.svelte` |
| Label/value spacing, value typography and structural line reserve | `src/components/common/Metric.svelte`, `Swatch.svelte` |
| Semantic group layout/inset, six-track placement | `src/components/common/Group.svelte`, `Row.svelte`, `Column.svelte` |
| Closed T1 accessible labels and internal layout-to-leaf props | `src/components/composable/component-registry.ts` |
| Named synthetic text stress modes | `tests/browser/helpers/text-scale.ts` |
| Exact T1 alignment regression | `tests/browser/visual/composable-lab.spec.ts` |

## Current T1 variant

Decision0055 makes the default Smart summary three full-width rows in a single
reading direction: temperature, configured color, then fan relation. It uses
`summary-stack-v2`; explicit demo columns keep authored placement and intrinsic
collapse. No common CSS or leaf anatomy changes are required.

The executable tokens `--u1-group-gap`, `--u1-reading-icon-track`,
`--u1-reading-icon-gap` and `--u1-reading-copy-gap-compact` own the accepted
20px horizontal group separation, 32px icon track, 8px track/copy gap and 4px label/value gap.
The 2026-09-06 spacing correction uses 8px summary vertical gaps, 12px summary inset and
12px stacked-row gaps; compact summary row gaps are 4px. These reuse existing
spacing tokens and supersede the former uniform 20px vertical rhythm.
Centered hero/quiet glyphs remain 32px/24px, so their visible glyph/copy gaps
are 8px/12px. Title/status use the existing 12px identity gap. Default Reading
retains its 44px icon frame and 12px gap/content inset; compact is an explicit
client-only leaf prop, not caller CSS or a wire option. Card compact intent now
propagates through the typed render context; compact leaves own both outer and
content padding, avoiding stacked insets. Comfortable/default anatomy is retained.

The precise T1 regression remains scoped to this variant. Relative readability,
atomic units, focus, semantic states and stable recovery remain independent
requirements. Do not infer a new universal card shape from these dimensions.

Typography tokens are rem equivalents of the prior 13px label, 14px name and
20px value at a 16px root; hero/quiet values share the same scale at 24px/16px.
Structural text reserves use the label/value tokens and line-height rather than
opaque precomputed decimal constants. Compact readings keep a 44px minimum
frame. Temperature keeps two value lines because valid numeric precision is not
bounded. Quiet fan readings reserve one or two lines according to their content
container width and root-relative typography, with a 7rem threshold for the
closed label vocabulary. These reserves are identical across evidence states; the
current value and retained telemetry never choose a shorter frame. This replaces
redundant 104px/64px compact hero/quiet floors without removing narrow/enlarged
text wrapping or the <=1px fixed-viewport state geometry contract.

## Text scaling evidence

`scaleRootText` changes the root text preference; rem text and rem layout respond.
`doubleSyntheticText` stresses mixed legacy content by doubling root/rem text,
explicit px/vw font declarations and legacy px typography tokens once each.
Neither helper is browser zoom. px fonts can still scale with browser zoom;
actual browser zoom, phone text preferences and assistive speech remain separate
acceptance. Record the helper/mode used instead of claiming generic 200% coverage.

## Deliberate isolation

Production Inline/Stack and private LayoutInline/LayoutStack remain separate to
preserve their consumer contracts. Their future consolidation needs an explicit
adoption scope and transitive-consumer evidence; this cleanup neither promotes
the private Lab nor restores retired resources. Shared token changes require
renewed affected consumer/package checks even when normal-size appearance stays
the same. No Lab registration, printer control or new domain capability follows.
