# Progress rendering-panel layout refinement

## Scope and acceptance

F0 / P03, OBS-011 and OBS-016. The user's delivered-card screenshot exposed
cramped text/icon view buttons and a disconnected percentage/bar. Reuse the
unchanged common Camera Switch for 3D/Top, with 44px targets and accessible
option names. Keep the model's 4:3 space and put one status/percentage/bar
summary in normal flow at the bottom of the same visual panel, outside the
chart's image semantics. Keep layer/ETA and elapsed information below.

Acquisition, cache, geometry, reported-layer mapping, provenance, polling and
privacy contracts remain unchanged. Unknown percentage is readable without a
percent sign or determinate progressbar. Local preview failures retain numeric
telemetry; whole acquisition failures mask old values and geometry. Camera,
authentication, Tailscale and printer controls are outside scope.

## Candidate and affected consumers

Base: PR131 main 2c5696a. Changes are ProgressPanel, ToolpathPreview and the
three-div domain leaf ToolpathFrame. The component contract registers the leaf
and exact composite imports; no common primitive or guard is weakened.
ProgressPanel also serves the private Lab, so its generated artifact and tests
are included alongside live Progress and MCP observation. Runtime advances to
0.4.22 and observation resource25; schema 19 and Camera 18 remain unchanged.
Generated asset hashes and inventory byte totals are measured after rebuilding.

## Author execution

- Read required state/order/requirements/current iteration and u1-ship skill;
  updated the active execution order before implementation.
- Pinned Bun 1.4.0: install --frozen-lockfile; ui:check; build:live-progress;
  build:mcp-observation; ui:build. Svelte check and component contracts passed.
- The first component check correctly rejected native layout in a composite;
  moved the domain shell into a registered exact-tag leaf instead of bypassing
  the guard. One attempted editing command used the wrong working directory
  and changed no file; reran from the repository root.
- Focused Vitest Switch, ObservationWidgets and ObservationLoading: 85 passes.
  Focused live artifact, MCP package and private Lab integrity:19 passes.
- Private author browser fixture used real saved G-code geometry with simulated
  layer 122 of 244, never a claim of actual printing. At320/390/600 light/dark and
  200% text, no document overflow or page errors; keyboard Top selection worked,
  canvas identity survived updates, failure masking and visible polling lifecycle
  stayed intact. Task-owned browser and fixture server closed in finally.

## Independent correction

Independent review found Unknown clipped by the new bounded panel despite no
page overflow. Its label now uses readable text sizing and can wrap, while
numeric percentage/unit stay atomic. Affected artifacts were rebuilt and pins
remeasured. Independent corrected browser verification passed 22 checks, including
explicit Unknown text bounds at 320/390 and 200% text, keyboard 44px radio targets,
known 0/100 and unknown ARIA, retained canvas, and local-vs-whole failure masking.
Common primitives, parser, telemetry and authorization bytes remain unchanged.
Final source formatting was cleaned; diff whitespace check passes.

## Acceptance boundaries

Independent exact review, required shipment and installed checks are recorded
below. Real active-print and actual ChatGPT/phone outcomes remain separate;
no print was started for this layout task.

## Stopped first shipping gate

Exact c58b8de8dd26a598e23db274b6c378b43d719502 received independent approval.
PR132 plan passed. The unchanged --execute command stopped in local validation
before merge/install (operation pr132-20260921T182300-7c34f2); rollback was not
needed. A captured pinned-Bun server diagnostic passed 325 tests and failed 3
composable-preview artifact-identity checks. The isolated preview's aggregate
Kit manifest still pinned earlier generated output. Its measured canonical
manifest is now b2a69562f1780fbf79572eb499b07f26af8db3c8a3aae512ebd7e8c34570f96a.
Only the exact identity constant changes; the guard, routes and behavior remain
unchanged. This transitive generated-build consumer is included in final review.

The focused correction exposed the corresponding prerendered composition-page
hash pin; it was also remeasured as
41ccf1677c267671a2c6a5364adbaacd47f0aa6f47c01fad7f4f7f7c40f32957.
The subsequent focused composable-preview suite passed 4 tests / 328 assertions,
including immutable snapshot and denied-route behavior. Live/MCP/Lab assets and
application source are unchanged from the independently verified candidate.

## Successful guarded shipment

Independent review approved corrected head
`19bde0340e9885252b6dcb03130024151b0309c0` with unchanged accepted application
and generated-widget bytes. The read-only plan and then the same command with
`--execute` passed using the existing pinned Bun 1.4.0 executable:

`uv run --no-project scripts/u1_ship.py --pr 132 --reviewed-sha 19bde0340e9885252b6dcb03130024151b0309c0 --bun <existing-absolute-pinned-Bun>`

The unchanged mandatory repository/app/TypeScript/operator and production-build
checks passed. Guarded merge produced
`9c94bd1e48efe4f00dd066f63aba2928b882a286`; exact merged-source staging installed
release `20260921-9c94bd1-pr132-20260921T182653-503771`. Both existing public and
dashboard services were explicitly restarted and reported loaded, healthy and
integrity-verified at runtime 0.4.22/schema 19/observation 25/Camera 18.
All 121 static response checks, 123 security checks and private-state preservation
passed. No rollback occurred. No authentication, Tailscale, plugin reinstall or
printer operation was performed.

The PR attachment API was called but did not return after several minutes;
its waiting tool cell was terminated. The PR itself exists and merged normally;
no successful desktop attachment is claimed.

## Independent installed behavior and record closure

Independent acquisition of actual served MCP observation and dashboard Progress
widget bytes matched the approved hashes. Both fresh health responses matched
runtime 0.4.22 / schema 19 / observation 25 / Camera 18. The reviewer then ran
22 browser checks against the installed widget using saved real G-code geometry
and simulated telemetry, including responsive light/dark views, enlarged text,
keyboard control, unknown bounds, numeric0/100, failure masking and retained
canvas identity. Fresh installed screenshots were visually reviewed. No printer
acquisition or physical-print acceptance was part of this verification.

Current state/order/brief/handoff/validation records are closed once here.
The final record-only commit changes documentation, with application source,
dependencies, configuration and generated assets identical to merged PR132.
Retain application acceptance on those unchanged bytes; no additional deployment
or broad regression is needed solely for this tail under decision0028.
The next action is user review in the normal host; actual active-print and
ChatGPT/phone outcomes remain separate from this installed synthetic evidence.
