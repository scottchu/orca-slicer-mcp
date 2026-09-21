# Progress canvas toggle placement

## Scope and acceptance

F0 / P03, OBS-011/016. User phone feedback requests the existing Camera-style
switch inside the rendering canvas. Match common Video’s bottom-right 10px
inset, accessible sibling placement outside ChartFrame role=img, 44px keyboard
targets, and non-overlapping fallback status at narrow and enlarged text widths.
Retain the 4:3 model viewport and existing bottom status/percentage/bar.

Only domain layout and measured/versioned generated consumers change; common
Switch, Camera, geometry, caching, layer mapping, telemetry and cadence stay
unchanged. No printer controls, auth/network changes or plugin reinstall.

## Execution

Base c0ed2d8. Read required current records and u1-ship instructions; updated
execution order before app validation. Installed locked dependencies with pinned
Bun 1.4.0 using install --frozen-lockfile. Runtime becomes 0.4.23 and observation
26; schema 19 and Camera 18 remain unchanged.

The user then requested clearer grouping: Layer joins percentage/bar in the
render summary, with Elapsed and Remaining together in one responsive row below.
The duplicate visible layer caption is removed; ChartFrame retains its accessible
planned-path/reported-layer description. Estimated values keep About wording;
missing estimates remain explicitly unknown. The private Lab shares this grouping.

## Candidate verification

- Pinned Bun 1.4.0: `ui:check` passes (zero Svelte errors/warnings; component
  contracts pass). Common primitives and bounded native debt remain unchanged.
- `ui:test` for Switch, ObservationWidgets and ObservationLoading: 85 passes.
- Rebuilt `build:live-progress`, `build:mcp-observation`, `ui:build` and
  `build:composable-preview`; measured all affected static identities/sizes.
- Full focused server files `live-fans-package`, `mcp-widget-packages`,
  `private-lab` and `composable-preview`: 23 passes / 545 assertions, including
  aggregate immutable manifest and prerendered page identity before freezing.
- Author browser checks use saved real G-code geometry with simulated telemetry,
  never an active print claim: 320/390/600 light/dark, 200% text, keyboard Top,
  retained canvas, stale/terminal/failure/standby and visible polling lifecycle.
  No page errors or horizontal document overflow; task-owned resources closed.
- Early independent screenshot caught the Layer row shrinking around its gaps;
  granting that row available width restores one line at ordinary phone width.
  Reviewer also requested pointer pass-through outside controls and visible stale
  or unavailable-layer descriptions. Both corrections are included before freeze.
- The user-provided phone screenshot proves the earlier 0.4.22 Standby layout
  was seen on their phone, not active geometry acceptance. New-revision phone
  and actual active-print acceptance remain distinct from these fixture checks.

Final Progress artifact SHA256:
`30f801b7a79cf58d57010dc6ebf06ba7691d2112b2067b680209d10b8c342d9e`.
MCP observation: `88c0e4d1e10f498f97c72ad9a161e133951ab2c690081c5447ed3496e0493d7c`.
Private Lab: `29fb30c80963033d8a1f614527121631f5777845852c06b16c6849cf47557a07`.
Immutable composable manifest:
`d8c0fbef56ea36385697bed3457e1be6d27f25b59da0b40c9bea9a6e40962de1`;
prerender page: `703955f7027b17c66c69e3fc05fa5a9451067acfc490b19fe9d8097f8efd2c09`.

## Exact review and successful guarded shipment

Independent review approved `6d96a37eddd489b3375a4d18c8c256215d8fdf5a` with
25 fresh browser checks and visual inspection. The reviewer independently
remeasured the exact MCP, aggregate immutable manifest and prerender page pins.
Ready, no-job, loading, unsupported, failure, stale, keyboard and 320/390px at
100/200% text were covered. Layer stays on one line at ordinary phone width;
status and controls do not overlap, and the canvas remains mounted.

The read-only plan and authorized execution both passed:

`uv run --no-project scripts/u1_ship.py --pr 134 --reviewed-sha 6d96a37eddd489b3375a4d18c8c256215d8fdf5a --bun <existing-absolute-pinned-Bun>`

The same command with `--execute` ran the unchanged mandatory repository/app/
TypeScript/operator and production-build gates, guarded merge and exact merged
staging. PR134 merged at `43389ab3b64cfcfbf13368c2af0c3e986e5cbc5f`, installing
`20260921-43389ab-pr134-20260921T194010-688d87`. Both public and dashboard services
were explicitly restarted and verified loaded, healthy and integrity-matched at
runtime 0.4.23 / schema 19 / observation 26 / Camera 18. All 121 static response
checks, 123 security checks and private-state preservation passed. No stopped
shipping gate or rollback occurred. Auth, network, plugin and printer control
were unchanged.

The author’s attempted standby fixture set numeric values to null without their
matching evidence-state updates; the strict client correctly showed whole
acquisition failure. That screenshot was relabeled and preserved as a malformed
fixture failure, not Standby evidence. The reviewer’s valid no-job fixture and
screenshot establish Standby/unknown-layer/0m behavior. This was a private fixture
correction, with no application change or acceptance carried from invalid input.

The PR attachment API was called separately but did not return; its waiting cell
was terminated. PR creation and guarded shipment completed normally; no successful
desktop attachment is claimed.

## Independent installed acceptance and record closure

Fresh public/dashboard health responses report 0.4.23 / schema 19 / observation
26 / Camera 18. The reviewer acquired actual served MCP and dashboard Progress
widget bytes and verified their exact approved hashes. A fresh 25-check browser
run against installed bytes passed, with ready and valid no-job screenshots
visually inspected. This uses saved G-code geometry and simulated telemetry;
no printer acquisition, active-print, physical or revised phone/ChatGPT acceptance
is claimed.

Current state/order/brief/handoff/validation records are closed once here. The
final tail changes only these six Markdown files; application, dependency,
configuration and generated bytes are identical to merged PR134. Relative links
and diff whitespace are checked; retained application evidence remains bound to
the unchanged application tree. Under decision0028 no extra build, full regression
or service deployment is required solely for documentation integration.
