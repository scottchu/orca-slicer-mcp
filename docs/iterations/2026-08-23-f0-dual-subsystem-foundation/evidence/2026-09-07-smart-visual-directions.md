# Smart visual directions — 2026-09-07

## User direction and execution order

After viewing the completed widget/DSL comparison, the user rejected Smart's
overall visual appearance and chose visual proposals before implementation.
Overall Smart visual redesign now precedes an isolated Unknown badge fix.
The badge defect remains evidence to address within a selected direction; it is
not the current implementation task.

The current work is exactly three image proposals, followed by user selection,
then separately delegated implementation and independent verification. This
round changes no application code, styling, build inputs or deployed service.
Generated proposal images are visual concepts, not rendered application
screenshots, implemented DSL capabilities or product acceptance.

## Preservation and scope

Work stays on `codex/u1-dsl-widget-comparison` at checkpoint
`ae80ecc76e95c5a7c37b478419b7d5c4ccc3e535`. The preceding six uncommitted
comparison/current-record documents and all transferred WIP are preserved.
[Comparison evidence](2026-09-07-dsl-widget-comparison.md) retains its exact
synthetic screenshots, findings, commands, source/package identities and
independent evidence. Its bounded comparison acceptance does not make these
new concepts implemented or verified runtime behavior.

PR115/runtime0.4.15 remains the recorded deployed baseline.
Local0.4.16/observation22/Camera18/private-Lab revision7 stay unpublished.
Decision0056 is provisional; the private Lab remains unregistered. The tracked
DSL/source mismatch, Unknown badge wrapping and extreme-decimal narrow-screen
limitation remain open. Main and other worktrees are untouched.

The current closed DSL supports only fixed T1 with HeadStatus,
HeadTemperature, FilamentColor and FanRelation. Proposals must distinguish
possible presentation changes from capabilities already supported by this
contract. They cannot claim complete Heads/Thermals parity or add printer
authority, controls, new telemetry, auth/Tailscale or plugin behavior.

## Role ownership and evidence

- `comparison_design` owns the three visual directions, prompts and design
  interpretation, including potential presentation changes and remaining gaps.
- The coordinator orchestrates ImageGen with those prompts and remains the
  user's point of contact; concept generation does not implement the product.
- `comparison_capture` owns only durable records and byte-preserving local
  artifact storage in this round. It does not author designs or modify images.
- `comparison_verify` independently checks the documentation/artifact tail and
  unchanged application boundaries without rerunning unaffected full suites.

The records author reread AGENTS.md, PROJECT_STATE.md, NEXT_AGENT.md,
requirements and CURRENT's BRIEF/HANDOFF/VALIDATION, and ran `git status --short`
before editing. Status retained the prior five modified current documents and
the untracked comparison evidence. The active execution order was updated
immediately to the user's new direction. Exact image identities and completed
review results are attributed separately below. Image delivery is complete;
the user has not yet selected a direction.

## Design-role brief

The design role reviewed the actual ready390 comparison screenshot and recorded
that the user's objection covers labels, multiple card surfaces and the overall
spacing/hierarchy. The user specifically wanted the visible field-name labels
removed; the final prompts superseded the initial label-bearing brief before
generation. This does not overturn the earlier measured8px gaps. The final
three directions are:

1. **Aligned reading rows:** three icon/value rows with a common right edge;
   actual temperature is visually stronger than target. No field-name labels.
2. **Compact tool summary:** T1/activity and temperature share the top line;
   color and fan follow on separate full-width lines. No field-name labels.
3. **Temperature-led reading:** a separate temperature lead beneath T1/activity;
   quiet full-width color and fan lines follow. No field-name labels.

All three retain the fixed T1 activity, actual/target temperature, configured
RGB color and fan relation. They use one surface and do not add T2–T4, material
details, controls or production receipts. The third direction deliberately does
not reintroduce paired color/fan columns rejected in the earlier user feedback.

The designer identifies future internal leaf appearances and accessible-label
contracts as potential implementation work. Inline/row presentation is not
permission to send arbitrary CSS/markup or pretend unregistered props exist.
Any new closed prop or rule literal needs an explicit later decision and
validation; source acquisition and domain authority do not expand. User
selection, unknown/error geometry, narrow/enlarged text and shared-consumer
checks remain later gates, not properties proved by generated concepts.

## Delivered proposal identities

The coordinator generated exactly three independent images sequentially, each
using the actual inspected comparison screenshot as a referenced image. They
were displayed once in the user conversation in the order below. The reported
generation durations were17.8s,16.3s and17.2s respectively; these are tool-run
durations, not product performance measurements. The reference screenshot's
SHA-256 is
`da5c00599dc8dc74792601c36fcd2e7a34f7d7bf8a93d6b1ac91238e6de32dbd`.

The records author used a Node filesystem/hash script to copy the original PNGs
without moving or changing them, verified source/copy SHA-256 equality, checked
the PNG signature and recorded raster dimensions. The author copied the design
brief/prompts into the same private evidence directory. No image was cropped,
redrawn, recomposed or otherwise edited.

| Display order and direction | Local logical image | Raster dimensions | SHA-256 |
| --- | --- | --- | --- |
| 1. 平列讀值 / aligned reading rows | `01-aligned-reading-rows.png` | 1647x955 | `619a2863f8fa89e28ec0f006a63d723add4e3fdd1d412009eede51c24adf5dbc` |
| 2. 工具摘要 / compact tool summary | `02-compact-tool-summary.png` | 1793x877 | `5c619aa2dacb239992b5d459c20baaf6f3af2b87eae72be60dda6b7daaec7ce0` |
| 3. 溫度主讀值 / temperature-led reading | `03-temperature-led-reading.png` | 1672x941 | `fd7c3493172a35eb399f89b937cb694212830203e9f2678ea69e2d5d098c871c` |

`image-manifest.json` retains source/copy identities, original local paths,
display order and an explicit null user selection. Raster dimensions are image
file metadata, not verified CSS size, viewport, spacing, font size or responsive
behavior. Generated concepts must not be passed off as runtime screenshots or
as direct expressions already admitted by the current closed DSL.

The next action is user selection among these three delivered proposals.
Implementation, styling, application builds and release have not started.

## Design and independent content review

The prompt author inspected all three exact outputs and recorded their actual
differences in `ideation-image-review.md`:1 has two thin dividers;2 has no
divider and places temperature in the header, with a generated thermometer icon
at the far left;3 has a temperature lead, one divider and more apparent blank
space. These are observations of concepts, not measured implementation spacing.
The initial `ideation-brief.md` is retained as design history; the final
`ideation-prompts.json` and output review own the label-free delivered proposals.

The separate `comparison_verify` role inspected all three original PNGs and
approved their content/contract boundary for user selection. Each image shows
T1, Active,214.6°/220°C,#E89B3C and Part cooling once, with one Card surface and
no visible field-name labels, nested cards, added telemetry or controls. The
reviewer checked exact PNG signatures, hashes and encoded dimensions using
`uv run --no-project -`; its local `design-contract-review.md` and
`image-identities.json` retain that independent evidence. No image revision was
required by this bounded content review, and user preference remains pending.

Explicit future presentation gaps:

- Options1/3 include dividers absent from the current closed Smart vocabulary.
- Option2 places temperature in the identity/header, outside the current
  identity tuple and Smart summary contract.
- All three omit visible labels and therefore require deliberate future
  internal appearances and accessible names; option3 also omits some current
  reading icons. No accessible tree is proved by a raster image.

Neither reviewer claims these proposals serialize through today's DSL. They
preserve the four data meanings without expanding acquisition or printer
authority. They do not prove exact swatch RGB pixels,390px behavior, compact
height, font size, Unknown repair, enlarged text, error neutrality, state
geometry, extreme decimals, actual device or physical behavior. Option3's
stronger temperature emphasis and apparent extra space remain user-preference
questions, not accepted compactness.

## Independent record and artifact tail

`comparison_verify` completed the documentation/artifact check with
`git status --short`, record/manifest reads, `git diff --stat`, a focused
`uv run --no-project` verifier script and explicit Homebrew `rg` searches.
Result: PASS for this proposal-only scope. All398 enumerated application/build/
dependency/fixture inputs remain unchanged; requirements and provisional0056
match the checkpoint; the prior comparison evidence remains exactly
`fdcb0223cf89234f8a6965f65c418d1ae4c44f316a1d90854b6fba995d8c7473`.
Only the intended7 WIP document paths exist, all45 relative links resolve,
and all3 original/copied PNG pairs, display order and reference-image identity
match. User selection is null and implementation has not started.

The reviewer confirmed the final label-free concepts, current user-selection
order, preserved limitations and explicitly future divider/header/accessibility
contracts. `git diff --check` passed. Its local
`docs-tail-verification.md` SHA-256 is
`2603af99904de98e1077acb83a9a3de52d542451196268ccf78d9be225841672`.
This paragraph records the completed result once. No browser, application
build, full suite, runtime launch or service action was repeated for this tail.
