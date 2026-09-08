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

## Status

Implementation and focused author validation complete. Original candidate independent
review passed; PR123 is open. Mandatory shipping stopped before merge/install
on a stale artifact-hash assertion. The correction below needs independent delta
approval and a renewed mandatory operator run; delivery is not complete.
Baseline source main55a4e016; preserved handoff checkpoint361ccdd. Current branch
is codex/overview-subview-isolation-20260908 in the existing task worktree.
No physical-printer, phone, repaired actual-host or monitoring acceptance claimed.

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

## Candidate identity and limits

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

## Mandatory gate stop and exact artifact-pin correction

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
