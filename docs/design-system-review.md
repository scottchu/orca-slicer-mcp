# U1 design system — primitives and composition

Status: **offline gallery implemented and ready for user visual selection**.
The user authorized the bounded review artifact; its [source and run instructions](../experiments/u1-design-system-gallery/README.md)
reuse current primitives/tokens with isolated proposed wrappers. The layered
hierarchy is adopted; visual direction, new component APIs and broad widget
migration are not. The baseline is a bounded imported-component reference, not
the exact shipped Thermals widget. [Gallery evidence](iterations/2026-08-23-f0-dual-subsystem-foundation/evidence/2026-09-22-design-system-gallery.md)
owns actual implementation, validation and review outcomes. This addresses F0 / UI-001,
UI-003 and UI-004, with F02 shared composition, F04 boundaries and open U01
consistency in the [delivery ledger](widget-delivery.md). No delivery item is
closed. [Audit evidence](iterations/2026-08-23-f0-dual-subsystem-foundation/evidence/2026-09-22-design-system-audit.md)
separates actual observations from proposed acceptance.

## Reuse the foundation already present

Each level composes lower levels. The common directory is not an empty design
system: it contains 60 Svelte components, including fixed-widget primitives and
preserved private-composable APIs with different responsibilities.

| Adopted layer | Existing source | Proposed responsibility |
| --- | --- | --- |
| Foundations | [tokens.css](../plugins/u1-print-studio/app/src/components/common/tokens.css), host styles | Type, color, space, radius and control targets; retain current values |
| Primitives | [Button](../plugins/u1-print-studio/app/src/components/common/Button.svelte), Icon, Switch, Label, Name, Caption, Inline, Stack, ReadingRow, state/skeleton surfaces | Generic layout, focus, control and text mechanics; no domain inference |
| Small composed values | [DegreeValue](../plugins/u1-print-studio/app/src/components/common/DegreeValue.svelte), DurationValue, MetricValue, Timestamp, DateTimeValue | Units, precision, known/missing/loading display, atomic value grouping and accessible text |
| Domain components | [ActualTarget](../plugins/u1-print-studio/app/src/components/observation/ActualTarget.svelte), ThermalReading, ObservedMeta, DomainReceipt, ToolpathPreview | Target applicability, observation association, estimate/lifecycle labels and local preview outcomes |
| Widgets | [LiveThermalsRoot](../plugins/u1-print-studio/app/src/components/live/LiveThermalsRoot.svelte), ProgressPanel, CameraWidget | Information grouping and domain-specific state anatomy |
| Pages | Existing dashboard routes | Compose accepted widgets and responsive placement |

Controllers, adapters and services keep acquisition, clocks, ordering, retries,
cache and media lifecycle. Presentational components receive values and evidence.
F05 token renaming, private dynamic composition and page migration remain outside
this slice. Similar names such as Inline/LayoutInline or ColorValue/Swatch do
not establish duplicate contracts or authorize deletion.

## Gaps the gallery should resolve

1. **Target applicability:** Cavity has no target, but its current pair renders
   the same dash and accessible “Target: Temperature unavailable” as an unknown
   heater target. The domain composition needs an explicit no-target case;
   DegreeValue should retain its generic numeric job.
2. **Observation association:** Tools & bed and Cavity have valid independent
   receipts. Their current header grouping competes with row labels. Reuse time
   formatting while letting the domain associate each receipt with its source.
   Camera snapshot time and locally observed live-frame time retain their own
   provenance.
3. **Value reuse:** [ProgressPanel](../plugins/u1-print-studio/app/src/components/observation/ProgressPanel.svelte)
   still owns percent/status/time markup and spacing. Its minute-resolution
   duration and “Unknown” differ from shared DurationValue and MetricValue.
   Compare named precision and missing-value policies before replacing them.
4. **Spacing ownership:** Propose outer inset in frame/body, row inset in
   ReadingRow, label/value gap in composed values, and section gap in domain
   composition. Preserve intentional Camera anatomy and enlarged-text wrapping.
5. **Recovery wording:** Captured Thermals failure retains “Refresh Thermals”
   while Progress says “Retry Print Progress”. Review action wording as a shared
   contract; no recovery defect or fix was established by the static captures.

The source inventory maps these gaps to current consumers; the screenshots show
selected current renderings. Neither establishes a full accessibility or
transition pass.

## First reviewable gallery

The implemented offline gallery uses fixed components and synthetic inputs,
with an imported-component baseline beside proposed examples. Keep existing colors,
typography and tokens. Start with **temperature → current/target/no-target →
thermal row → independent observation receipts**. Show one Progress
elapsed/remaining comparison to test reuse; Camera supplies a contract reference
and common Switch comparison, with no migration.

| Specimen | Required comparison |
| --- | --- |
| Temperature value | Known nonzero/zero, missing, negative/decimal/extreme accepted values; unit and accessible name |
| Thermal pair | Known actual/target; independently missing actual or applicable target; Cavity no-target |
| Thermal row/group | Channel identity, reported active marker, coherent alignment and independent tools/bed versus Cavity receipts |
| Observation time | Known/missing time, different source times, one stale group beside one fresh group; no synthetic restamping |
| Progress time comparison | Elapsed versus estimated remaining, zero/missing/long duration; terminal Print time with no Remaining; explicit precision choice |
| Widget references | Thermals loading/failure/ready; Progress no-job versus unknown and preview-local failure; Camera media-local failure exception |

Document value availability/applicability, freshness, acquisition outcome,
domain lifecycle and local feedback as separate dimensions. A resolved render
mode may control a shared visual surface; it must not replace the richer
semantic contract. Successful unknown, stale or empty data is not acquisition
failure. Settled acquisition failure masks old values/receipts with static neutral
structure; healthy pending refresh may retain accepted data. Camera keeps its
[current no-footer exception](requirements.md), and a failed Progress preview
keeps valid metrics. No component invents a target, ETA, freshness or print state.

Review each applicable specimen at 320/390px and normal/200% text, with readable
units, no orphaned value/unit group, accessible missing versus inapplicable
meaning, and 44px keyboard controls where present. Compare loading/error/ready
anatomy and explicit refresh/failure/retry/recovery sequences separately from
static examples. Include reduced motion and visible focus. The baseline audit covers only selected current-renderer cases. The separate
gallery evidence records its executed author matrix and targeted amendments;
no full matrix is silently carried onto changed bytes.

The gallery now makes Cavity No target wording/slot treatment, independent
receipt placement and duration precision reviewable. These are the next user
visual decisions before broad migration. No new ADR adopts a visual/API direction at this proposal stage.

## Consumer and validation boundary

Temperature changes reach Thermals **and Heads** through ActualTarget.
ReadingRow/Inline changes reach Thermals, Fans and Heads as applicable.
DurationValue changes retain Queue behavior before adding Progress. Switch
changes reach Camera, Progress and Bed Mesh. Token/chrome/state changes require
all affected fixed and preserved private consumers and existing component/graph
guards; no blanket exception is proposed.

After visual selection, assign the smallest implementation, targeted verification
and independent source review to separate owners. One owner runs required full
candidate regression when application bytes freeze. An adopted widget change
still follows exact review, local shipping guards, PR/merge, exact-build delivery,
both service restarts and meaningful installed checks. This isolated gallery and its documentation require no production deployment. Synthetic evidence does not establish real-printer or
actual-phone acceptance.
