# Progress semantic state repair

## Scope and acceptance

F0 / P03, OBS-003/008/011/016. User phone evidence rejects the prior Standby
layout: its empty 4:3 canvas, disabled toggle, zero percent and unknown job metrics
were treated as acceptable by earlier structural checks. This repair changes
presentation only, preserving acquisition, cadence, geometry and auth contracts.

- Fresh reachable Standby: compact No active print, observation freshness and
  Refresh; no filename, model, toggle, percentage/bar, layer or duration fields.
- Stale Standby: compact Last reported: no active print; never assert current idle.
- Unknown/offline: explicit unknown/unavailable wording, never infer idle from
  missing filename, missing geometry or zero progress. Unknown printer state with
  independently supplied job facts retains those facts.
- Printing/paused: retain reported status and valid independent facts, including
  valid zero. A finite supplied remaining estimate stays estimated; absent means
  Unknown. No countdown or invented heating state.
- Complete/cancelled/error: Last reported job, reported percent (not forced 100),
  Print time and no Remaining. Reported job error is not acquisition failure.
- Preview unavailable/unsupported/preparing: compact local explanation with
  healthy numeric progress, no empty canvas or disabled view controls.
- Whole acquisition failure: retain the last accepted compact/model anatomy,
  mask old values/receipts/model and controls, use neutral static structure and
  the common footer Retry status. Initial loading/failure retains its own shape.

Geometry appears only for an accepted ready preview. Existing Camera-style
inside-canvas switch, grouped layers/progress and paired time metrics remain.
No printer query/control, authentication, Tailscale or plugin change is included.

## Execution and focused evidence

Base `2733400`; pinned Bun 1.4.0 locked dependency install completed. Runtime becomes
0.4.24, observation 27, unchanged schema 19 / Camera 18. Required records and shipping
skill were read; current order was updated before implementation.

The first component check rejected new native markup. The implementation was
reworked through existing common Stack/Name/Caption/TextSkeleton and the existing
domain ToolpathFrame. No native debt allowance or component guard was weakened.
Svelte diagnostics and component contracts subsequently passed.

Author focused tests: 69 tests passed across semantic Progress and the two existing
observation suites; the later added unknown-state facts test passed in an 11-case
semantic run. Browser checks use saved real G-code with simulated telemetry,
not an active printer claim. Early 30 cases covered 320/390px and explicit0%-printing
with missing filename; enlarged text and state board are retained privately.

One initial private unsupported fixture used invalid reason `unsupported` and
correctly fell back to generic unavailability. It is not unsupported acceptance;
corrected `unsupported_gcode` and `preparing` fixtures assert their specific text.
An isError-only host notification did not exercise acquisition failure; corrected
unavailable acquisition envelopes exercise masking. Earlier invalid private
fixture outcomes are not silently reused.

Independent feedback caught a floating preview-failure badge and disabled
controls during whole acquisition failure. Both are suppressed while geometry
is retained. Public caption slots also retain neutral skeletons so failure does
not shorten the accepted model anatomy. Paused finite/null estimates are checked
separately; no UI-only estimate suppression remains.

All affected live/MCP/private-Lab outputs and immutable composable identities
are rebuilt and measured. The first hand-calculated aggregate manifest used the
wrong sort order and failed 3 composable checks; the canonical manifest function
is used for the corrected identity. No guard was bypassed.

Independent exact review, full guarded shipment and installed-byte semantic
verification remain pending at that earlier record stage. Actual revised phone/ChatGPT
and active-print outcomes are separate from fixtures and deployed-byte checks.

Final proposed candidate focused checks: 70 UI tests pass, zero Svelte errors or
warnings, unchanged native-debt/component contract passes. Four full focused
server files (`live-fans-package`, `mcp-widget-packages`, `private-lab`,
`composable-preview`) pass 23 tests/545 assertions with canonically measured pins.
The corrected author browser probe passes 32 normal-width state cases, seven
320px/200% text states, idle-failure and recovery transitions, zero page errors
and no horizontal overflow. A screenshot state board was visually inspected.

Commands actually run with pinned Bun and no env/config loading: `ui:check`,
`ui:test` for the three observation files, `build:live-progress`,
`build:mcp-observation`, `ui:build`, `build:composable-preview`, and the four
focused server test files. Private Playwright probes use task-owned ephemeral
servers and close their browsers/connections in finally. `git diff --check`
passes. No physical-printer evidence is asserted.

## Exact review and guarded shipment

Independent review approved `eea8b0e5d675b1d8b433ccc484b4234137eb5d3e` with
125 MCP checks/captures at 320/390px and 100/200% root text, plus 32 separate
native dashboard artifact checks. Initial loading is asserted before timeout,
correct enums assert exact specific messages, paused finite/null estimates are
separate, and idle/active/unsupported/terminal failure/retry/recovery is verified.
The corrected masked state and accepted screenshot board were visually reviewed.

The read-only plan and authorized guarded execution passed:

`uv run --no-project scripts/u1_ship.py --pr 136 --reviewed-sha eea8b0e5d675b1d8b433ccc484b4234137eb5d3e --bun <existing-absolute-pinned-Bun>`

The same command with `--execute` passed all unchanged mandatory repository,
application, TypeScript, operator and production-build gates, guarded the merge
and staged the exact merged tree. PR136 merged at
`8b3c3bedb8a6a9c2220ba14360e7a4baa701ca54`, installing release
`20260921-8b3c3be-pr136-20260921T200633-834041`.
Both public and dashboard services were explicitly restarted and verified loaded,
healthy and integrity-matched at runtime 0.4.24 / schema 19 / observation 27 /
Camera 18. All 121 static checks, 123 security checks and private-state
preservation passed. No stopped shipping gate or rollback occurred.

Final served Progress SHA256:
`9febe6d639b14e30b5cf6b344f9092ccb3eac4f976c17dc0d7bce1a1e9ea47ed`.
MCP observation:
`1f4a2d8800e19ca63c33697a2760157fa3484cc31703377ade625cd9b30e4f0c`.

PR attachment was attempted separately; the desktop API did not return and its
waiting cell was terminated after 31 seconds. No successful attachment is claimed.

## Independent installed acceptance and record closure

Fresh independent public/dashboard health checks report 0.4.24 / schema 19 /
observation 27 / Camera 18. Fetched installed MCP and dashboard Progress HTML
match the exact approved hashes above. Fresh installed-byte checks pass 35 MCP
and 35 dashboard semantic/transition/keyboard cases, with zero page errors;
all 70 resulting card screenshots were visually inspected. Coverage includes
idle/active/unsupported/terminal failure, retry and recovery; initial loading
and acquisition error; finite/null paused estimates; offline; and clearing a
persisted prior filename when a fresh Standby observation arrives.

These are installed application bytes driven by saved G-code and simulated
telemetry. No actual printer query was made; the compact idle screenshot is
synthetic, not a current-printer observation. The user's earlier phone capture
establishes the rejected 0.4.23 behavior only. Revised actual phone/ChatGPT and
active-print outcomes remain unobserved and separately accepted.

The final record tail changes exactly six Markdown files. Application,
dependency, configuration and generated inputs match deployed merge
`8b3c3bedb8a6a9c2220ba14360e7a4baa701ca54`; all 130 relative links and
`git diff --check` pass. Under decision0028 no unaffected full build, regression
or deployment is repeated solely for records. State/order/brief/handoff and
validation updates are complete here; next is the user's normal-host review.
