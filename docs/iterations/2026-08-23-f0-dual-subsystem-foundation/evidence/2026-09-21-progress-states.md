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
- Complete/cancelled/error: Last reported job, reported percent (not forced100),
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

Base `2733400`; pinned Bun1.4.0 locked dependency install completed. Runtime becomes
0.4.24, observation27, unchanged schema19/Camera18. Required records and shipping
skill were read; current order was updated before implementation.

The first component check rejected new native markup. The implementation was
reworked through existing common Stack/Name/Caption/TextSkeleton and the existing
domain ToolpathFrame. No native debt allowance or component guard was weakened.
Svelte diagnostics and component contracts subsequently passed.

Author focused tests: 69 tests passed across semantic Progress and the two existing
observation suites; the later added unknown-state facts test passed in an11-case
semantic run. Browser checks use saved real G-code with simulated telemetry,
not an active printer claim. Early30 cases covered320/390px and explicit0%-printing
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
wrong sort order and failed3 composable checks; the canonical manifest function
is used for the corrected identity. No guard was bypassed.

Independent exact review, full guarded shipment and installed-byte semantic
verification remain pending at this record stage. Actual revised phone/ChatGPT
and active-print outcomes are separate from fixtures and deployed-byte checks.

Final proposed candidate focused checks:70 UI tests pass, zero Svelte errors or
warnings, unchanged native-debt/component contract passes. Four full focused
server files (`live-fans-package`, `mcp-widget-packages`, `private-lab`,
`composable-preview`) pass23 tests/545 assertions with canonically measured pins.
The corrected author browser probe passes32 normal-width state cases, seven
320px/200% text states, idle-failure and recovery transitions, zero page errors
and no horizontal overflow. A screenshot state board was visually inspected.

Commands actually run with pinned Bun and no env/config loading: `ui:check`,
`ui:test` for the three observation files, `build:live-progress`,
`build:mcp-observation`, `ui:build`, `build:composable-preview`, and the four
focused server test files. Private Playwright probes use task-owned ephemeral
servers and close their browsers/connections in finally. `git diff --check`
passes. No physical-printer evidence is asserted.
