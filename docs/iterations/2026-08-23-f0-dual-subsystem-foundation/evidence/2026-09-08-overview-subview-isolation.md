# Overview subview isolation — 2026-09-08

## Scope and acceptance

F0 production-widget maintenance under OBS-015 and decision0021. User evidence
shows Overview blanked by a Job History unavailable/malformed receipt while its
sibling domains had results. Existing UI-004 whole-acquisition neutral failure
remains mandatory; no new product/architecture decision is introduced.

Accept initial partial Overview, refresh from known to partial, tile recovery,
unknown/unsupported/invalid headline distinctions and truthful coverage without
showing old failed-tile values. A failed request or invalid Overview envelope
still masks all old data. Shared focused renderers keep their acquisition failure
behavior. Repair the client gate only, not the upstream Job History adapter.

Affected consumers: actual self-contained MCP observation resource and dashboard
Overview, plus eight retained legacy views sharing the renderer gate; MCP Heads
shares the bundle but uses its Svelte renderer. Camera assets and private DSL
are unchanged. Build inputs are the legacy renderer, shared entry/build graph,
runtime/observation resource version pins and matching test expectations.

## Status — delivered through PR123

Reviewed corrected candidate `cbd70e6609a28dafc412bd6f25d741d1e23c40cf` merged as
`71b007852f02cda291bbe41c598e93a63576ace5`; the merge tree equals the approved
`a611ba06fc5673325ae9a87235207e776a8588d6`. Mandatory shipping and installed-byte
synthetic checks passed. Runtime0.4.19/schema18/observation22/Camera17 is deployed.
Release and current record updates are complete. Review repaired behavior with
the user; actual repaired host, phone and physical acceptance remain unobserved.
No printer call, controls or active monitoring occurred.

The author/review/gate entries below retain their chronological evidence scope;
requirements phrased before release are fulfilled by the successful delivery
record later in this file, not pending work.

## Author evidence

All commands below ran from the app directory with pinned Bun1.4.0.
`bun` here denotes the existing pinned executable, with
`--no-env-file --config=/dev/null` on every invocation.

- `bun run build:mcp-observation`: PASS; regenerated current-only HTML.
- `bun run verify:mcp-observation`: PASS; deterministic exact949400-byte HTML.
- `bun run test:mcp-widgets --grep 'Overview (initial|refresh)'`: first run
  1 pass/6 failures; test fixture Progress was unknown, contrary to the authored
  seven-known-siblings expectation. Fixture now supplies explicit bounded known
  Progress. Second run7 pass/1 failure was an accidentally duplicated test helper
  referencing out-of-scope `receipt`; corrected without product changes.
- `bun run test:mcp-widgets --grep 'Overview (initial|refresh)|MCP retained|MCP legacy failed|active legacy body|dashboard current MCP'`: PASS27 tests,30.1s.
  Seven new exact-resource tests cover initial unavailable/malformed, unsupported,
  unknown, invalid headline and failed retained receipt; MCP/dashboard refresh
  partial/recovery, successful age-stale versus failed-retained masking, whole
  isError and invalid-envelope masking/recovery. Existing consumers cover all
  eight legacy views,48 width/text-scale geometry observations and five current
  dashboard routes. Author screenshot inspection confirms seven readable siblings,
  unavailable Job History with Invalid response, and partial coverage.
- `bun test tests/server/observation-presentation.test.ts tests/server/cli.test.ts tests/server/status-dashboard.test.ts tests/server/personal-oauth.test.ts tests/server/app.test.ts`: PASS61 tests/1092 assertions.
- `bun run ui:test src/lib/client/legacy/observation.test.ts`: PASS1 envelope test.

The Playwright-managed fixture/browser teardown completed; the sole browser owner
released4182 before independent verification. No full shipping regression was
run by the author. Tests are synthetic software/protocol evidence only.

## Original candidate identity and limits — before delivery

Candidate runtime0.4.19/schema18/observation22/Camera17 changes only the observation
asset. Failed retained receipt reasons mask that tile's values and old receipt;
successful age-stale observations remain visible. The ordinary unavailable and
unsupported receipt labels remain intact. Envelope rejection masks the whole
composition; a main-status outage alone does not suppress independent domains.

Application input manifest contains511 tracked app files; SHA256
`33030c05b87a73946db5d919bb71991f63af31992be57f41309757e396d84a7e`.
Observation HTML SHA256 `b47c918839be9378ada2ad7d2068ad14d25ce7d5abd1d3f3d8a8c9a3787e2558`.
The exact private manifest and author screenshots are held in ignored evidence.
Camera HTML and unrelated preserved WIP were not adopted or regenerated.

Independent review and one operator's unchanged mandatory shipping workflow must
accept the exact commit before delivery. This slice does not repair the upstream
Job History adapter or complete parked Queue/Fans/History work; no physical print,
phone, actual repaired host or active-monitor acceptance is claimed.

## Historical mandatory gate stop and exact artifact-pin correction

Independent review approved original candidate
`a472576ec5a6d956cba41cd1c12168bee3c0876c`, including fresh synthetic adversarial
checks of simultaneous retained-domain failures, main-status outage with healthy
independent domains, whole errors and corrupt-order rejection/recovery.
PR123 was opened. The sole shipping operator ran:

`uv run --no-project scripts/u1_ship.py --pr 123 --reviewed-sha a472576ec5a6d956cba41cd1c12168bee3c0876c --bun /Users/scottchu/.asdf/installs/bun/1.4.0/bin/bun --execute`

It exited1 at validate, before merge/install; rollback was unnecessary. No service
restart or printer acquisition occurred. Its approved read-only diagnostic
`PATH=/Users/scottchu/.asdf/installs/bun/1.4.0/bin:$PATH ./scripts/check-repository.sh`
also exited1. Svelte reported0 errors/0 warnings;63 Vitest files/648 tests,
TypeScript and live/MCP/private-Lab determinism passed. Server tests reached
305 pass/1 fail with3913 assertions; Python operator gates were not reached.

The sole failure was `tests/server/mcp-widget-packages.test.ts:20`,
“mcp-observation is the registered, closed production artifact”: its expected
SHA still named baseline40bdd39aa5181bfa60afd2d64b968bfe15ce9ecd822c8e6ed3d4480f87498ebd
instead of the approved generated b47c918839be9378ada2ad7d2068ad14d25ce7d5abd1d3f3d8a8c9a3787e2558.
The author missed this separate artifact identity expectation. Only that exact
SHA literal is corrected; every closed-artifact check remains enforced.
Original private shipping logs, receipt, manifest and approval remain preserved.

The author ran only `bun --no-env-file --config=/dev/null test tests/server/mcp-widget-packages.test.ts`
with pinned Bun1.4.0 from the app directory: exit0,2 tests PASS/20 assertions,51ms.
No build, browser, full gate, push, merge or deployment was repeated by the author.

The revised511-file manifest SHA256 is `b5aaf6450bc387061f6667270da1ba4aed7fbe76c288d4d1bb9e3e0914b0d6df`.
Exact hash comparison to the original manifest finds510 unchanged inputs and
only the artifact-test expectation changed. All production source, configuration,
dependencies, build scripts, generated assets and browser tests are identical.
Thus the27 author browser cases and independent adversarial browser evidence
remain bound to unchanged application bytes, including observation HTML
`b47c918839be9378ada2ad7d2068ad14d25ce7d5abd1d3f3d8a8c9a3787e2558`.
This mapping does not waive the renewed independent exact approval or mandatory
shipping gates. The new candidate remains unshipped until those pass.

## Successful guarded delivery and installed-byte verification

Independent delta review approved corrected candidate
`cbd70e6609a28dafc412bd6f25d741d1e23c40cf`; approval SHA256
`925ba1acd7f9699e71bde29d1eeb193037a0a857ecdeedffa19e948b5fa840c4`.
The operator pushed that branch, ran the read-only plan, then ran:

`uv run --no-project scripts/u1_ship.py --pr 123 --reviewed-sha cbd70e6609a28dafc412bd6f25d741d1e23c40cf --bun /Users/scottchu/.asdf/installs/bun/1.4.0/bin/bun --execute`

Exit0; mandatory repository/app/TypeScript/operator/signing validation passed.
The operator does not expose successful nested test totals, so none are inferred.
PR123 merge is `71b007852f02cda291bbe41c598e93a63576ace5`, with ordered parents
main55a4e016 and reviewed cbd70e6; its tree exactly equals the approved tree.
Release `20260908-71b0078-pr123-20260908T143048-071e8e` installed; both public
and dashboard services explicitly restarted, loaded and passed health/integrity
at runtime0.4.19/schema18/observation22/Camera17. All82 static responses,84
security checks and preservation passed. No rollback was needed.

The scoped installed-client verification command was:

`PATH=/Users/scottchu/.asdf/installs/bun/1.4.0/bin:$PATH REVIEW_SHA=cbd70e6609a28dafc412bd6f25d741d1e23c40cf node tmp/overview-subview-isolation-20260908/shipping/installed-probe.mjs`

The initial run exited1 because the ignored probe supplied non-status History
unavailable freshness `offline` instead of the required `unknown`. The widget
correctly isolated the invalid headline. Only the probe input was corrected;
product bytes were unchanged. Original script/result/log files remain preserved
with `.invalid-fixture-failure`; teardown passed. The corrected scoped run exited0.

Nine installed-byte results passed: initial partial with seven healthy siblings,
complete baseline, refresh to History unavailable/Invalid response with partial
coverage, ordinary age-stale display, two failed-retained domains masked from
visible/raw-DOM/accessibility content, main-status outage preserving independent
History/Queue, outer-error masking/recovery, corrupt-order masking/recovery, and
no page errors with one exact installed-resource delivery. The operator's390px
screenshot review confirms all eight tiles, seven Available plus Job History
Unavailable/Invalid response, partial coverage and Refresh. Browser/fixture
teardown passed; `lsof -nP -iTCP:4182 -sTCP:LISTEN` exited1 with no listener.

Evidence identities (private receipts are retained unchanged):

- Completed shipping summary SHA256: `8b2e6d8e23031cb335a9a21fb7a57329e78647696e785be65757911090ba19b6`.
- Full operator receipt SHA256: `453287b1d09cb666e0b353c7ea5f95f288808afc301d1d45518b2d4c71dfa2ad`.
- Installed release manifest SHA256: `54aba866ec0bae72dfbefa911022904bb1242e67c7beee71ea5e24f9310dec28`.
- Installed synthetic receipt SHA256: `c338ef840d12f3ec6a9d1cd6cced13ed45c8ee141956c5fe8a97e1f674b2eb67`.
- Observation HTML SHA256: `b47c918839be9378ada2ad7d2068ad14d25ce7d5abd1d3f3d8a8c9a3787e2558`.

These establish software, deployed-service integrity and installed-byte synthetic
MCP behavior, not repaired actual-host/phone/physical acceptance. The user's
earlier Overview failure/Camera Live screenshots remain pre-fix host evidence.
The upstream Job History malformed response cause remains unresolved; UI redesign,
private DSL, unrelated WIP and other unfinished delivery-ledger coverage remain
parked. No printer acquisition, auth/Tailscale/plugin change or monitoring occurred.

## Documentation-only closure

The author verified a clean source branch and equal approved/merged trees with
`git diff --exit-code HEAD 71b007852f02cda291bbe41c598e93a63576ace5`, then created
`codex/overview-subview-record-closure-20260908` directly from that merge. The
original implementation branch/checkpoint and ignored evidence were preserved;
canonical/main and other worktrees were untouched.

A read-only `uv run --no-project -` hash/link audit compares all511 application
files against the corrected manifest, checks only seven Markdown files changed,
and verifies local relative-link targets. `git diff --check` verifies the tail.
The audit evidence is saved privately. Application source, tests, configuration,
dependencies, build inputs and generated assets remain exact shipped bytes.
Existing accepted application evidence therefore applies to this documentation
head. No product tests, builds or deployment are repeated solely for this tail,
per decisions0028/0054. Current records are complete; user review is the next
action, without assuming actual-host, phone or physical acceptance.
