# Design-system audit and proposal evidence — 2026-09-22

Scope: F0 / UI-001, UI-003, UI-004; F02/F04/U01. The [proposal](../../../design-system-review.md)
is a review artifact, not adopted visual direction or implementation acceptance.
Transfer outcomes are recorded separately in [handoff evidence](2026-09-21-design-system-handoff.md).

## Identities and ownership

Source HEAD: `03149854a8e2380b08c5bd95274c6ed66f54020b` on the non-main design
branch. `plugins/u1-print-studio/app/src` tree: `41aaabe884154253a4c865451f13d47aac6d0ea6`.
The inventory owner inspected actual imports and consumers; the printer-domain
role independently reviewed semantic contracts; the UI/UX role captured and
inspected the current baseline; a separate records owner integrated this proposal.
Independent documentation/source-evidence review passed within the scope
recorded below. No author review substitutes for independent approval.

The supplied Thermals phone image was inspected by the UI/UX role; its source
build/text scale is unspecified and it is not a fresh current-device capture.
Prior Progress images remain historical. New captures use exact current
self-contained Thermals, Progress and Camera resources with repository synthetic
fixtures and a generated Camera JPEG. No printer/service observation occurred.
All screenshots, scripts, detailed reports and raw DOM data remain private.

| Verified resource | Bytes | SHA256 |
| --- | --- | --- |
| Thermals | 94,947 | `a8b412efb4a54490881ee594114c6e82e624c883df00ccdd03d87251a492d890` |
| Progress | 108,006 | `9febe6d639b14e30b5cf6b344f9092ccb3eac4f976c17dc0d7bce1a1e9ea47ed` |
| Camera | 100,096 | `1bed20ce48f74c6ebc89d488e0eedb6be33a89095034d10d4cd1c00d60754e97` |

## Actual operations and results

Source/domain owners ran read-only Git identity/status, explicit
`/opt/homebrew/bin/rg`, file reads, and `uv run --no-project python -` for exact
relative import resolution. The final inventory maps 60 common Svelte files,
excluding test imports from its runtime-source table. It does not infer bundle
reachability from substring matches. They ran no builds or tests. Initial
exploratory searches for two nonexistent Lab locations were corrected by reading
the actual entrypoints; no source absence is inferred from those misses.

The UI/UX owner ran, from the app directory:

- `bun --no-env-file --config=/dev/null run verify:live-thermals` — passed; generated resource exactly matches committed HTML.
- `bun --no-env-file --config=/dev/null run verify:live-progress` — passed; exact match.
- `bun --no-env-file --config=/dev/null run verify:live-camera` — passed; exact match.
- `bun --no-env-file --config=/dev/null <private-audit-directory>/capture.ts` — first run stopped before capture because the harness omitted the initial host result; corrected private harness completed 12 captures.

The in-app browser was unavailable with an empty inventory, so the owner used
repository-installed isolated Chromium under the existing synthetic-capture
scope. The private harness fulfilled only its synthetic document URL, emulated
the existing host bridge and aborted other network requests. It opened no server
or port. Every context and the owned browser closed in `finally`.
Before build checks, existing output directories/build graphs were copied
privately. New outputs were moved privately afterward and original directories
restored, including restoring the prior absence of the Progress build directory.
The private before/after hash record preserves this operation. Public HTML and
application source remained unchanged; copied old outputs are not new-build
acceptance. No full regression was run.

The records owner's first inline Node edit failed to parse and performed no
writes. A subsequent `uv run --no-project python -` edit reconciled the seven
handoff records and added the proposal/evidence. Current local operational
identifiers were removed from the new entrypoint; older historical sections were
preserved. Exact transfer identities remain in private receipts.

## Selected fresh baseline captures

All 12 PNGs were reopened and visually inspected by the UI/UX owner. Raw records
include source hashes, text/accessible labels, bounds, controls and first-Tab
focus. Every case had no page error, escaped network request or horizontal page
overflow. Viewport height was 1600px; reduced motion was enabled throughout.

| Case | Renderer / synthetic state | Width / text |
| --- | --- | --- |
| 01 | Thermals ready with independent receipts | 390 / 100% |
| 02 | Thermals initial loading | 390 / 100% |
| 03 | Thermals initial acquisition error | 390 / 100% |
| 04 | Thermals missing actual/target with stale Cavity | 320 / 200% |
| 05 | Progress active, local preview unavailable | 390 / 100% |
| 06 | Progress fresh Standby, compact No active print | 390 / 100% |
| 07 | Progress unknown, distinct from idle | 390 / 100% |
| 08 | Progress active, local preview unavailable | 320 / 200% |
| 09 | Progress initial acquisition error | 320 / 200% |
| 10 | Camera Auto, decoded synthetic frame | 390 / 100% |
| 11 | Camera initial acquisition error | 390 / 100% |
| 12 | Camera Auto, decoded synthetic frame | 320 / 200% |

Text 200% uses the maintained CSSOM text-doubling helper, not browser zoom,
iOS Dynamic Type or actual-device settings. Separate initial Thermals captures
01–03 have equal shell/header/body/footer/row bounds (shell 366 × 500.375px;
rows 49px); Camera 10–11 retain equal observed frame geometry. These are separate
presentations, not proof of failed-refresh transition preservation. First Tab
was probed after screenshots; focus-ring appearance and complete keyboard
navigation were not captured.

## Findings and limits

Cavity no-target and a missing heater target both render a dash and accessible
“Target: Temperature unavailable”. This is a source-and-capture semantic gap.
Independent observation times remain valid; the issue to review is association
and grammar. Current Progress preserves metrics during local preview failure,
distinguishes idle from unknown and wraps timing groups at the enlarged sample.
Its value/spacing markup differs from shared leaves in source. Thermals failure
says “Refresh Thermals” while Progress says “Retry Print Progress”; recovery
behavior was not tested by these shots. Camera preserves its approved media-local
error/no-footer exception. [The proposal](../../../design-system-review.md)
converts these findings into a bounded reuse/contract gallery.

No full 320/390 × 100/200 matrix, desktop, locale/long-label matrix, screen-reader
experience, focus-ring audit, healthy-refresh/failure/retry/recovery transition,
valid toolpath canvas, actual Camera Live/PiP/fullscreen, installed-service,
real-printer or actual-phone acceptance is claimed. All active Progress samples
had unavailable previews, so they provide no rendered-toolpath acceptance.
No proposed gallery or application candidate exists yet.

## Documentation verification

The records owner ran `git diff --check` (exit 0) and a focused
`uv run --no-project python -` checker over all nine authored records. All 33
relative links in newly authored/current sections resolve; no new private local
path, caller/successor identity or service host was found. Historical sections
were excluded from this new-content privacy scope and preserved. The checker
also ran `git diff --exit-code HEAD -- plugins src scripts package.json bun.lockb
uv.lock .agents .codex .github` (exit 0), confirming no tracked application,
dependency, configuration or generated-asset changes in those input scopes.
Document hashes were printed for the separate independent reviewer. These are
author checks, not independent approval.

The independent reviewer inspected all nine authored documents (including the
three untracked Markdown files), all 12 PNGs, source findings and exact captured
resource hashes. The reviewer independently repeated the 33-link, added-content
privacy, diff-whitespace and unchanged tracked-input checks; all passed. Handoff
manifest/overlay/receipt digests match. Restored ignored outputs matched the
original manifest across 8,134 entries with zero issues. The private review
records exact document hashes, commands and results; source/evidence/documentation
approval does not accept a gallery implementation or visual direction. The
completion-only tail advances current records to gallery work and retains every
limitation above.
No application build or full suite is required solely for this unchanged-input
Markdown tail; all later application shipping gates remain intact.
