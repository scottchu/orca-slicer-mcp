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
0.4.22 and observation resource25; schema19 and Camera18 remain unchanged.
Generated asset hashes and inventory byte totals are measured after rebuilding.

## Author execution

- Read required state/order/requirements/current iteration and u1-ship skill;
  updated the active execution order before implementation.
- Pinned Bun1.4.0: install --frozen-lockfile; ui:check; build:live-progress;
  build:mcp-observation; ui:build. Svelte check and component contracts passed.
- The first component check correctly rejected native layout in a composite;
  moved the domain shell into a registered exact-tag leaf instead of bypassing
  the guard. One attempted editing command used the wrong working directory
  and changed no file; reran from the repository root.
- Focused Vitest Switch, ObservationWidgets and ObservationLoading:85 passes.
  Focused live artifact, MCP package and private Lab integrity:19 passes.
- Private author browser fixture used real saved G-code geometry with simulated
  layer122 of244, never a claim of actual printing. At320/390/600 light/dark and
  200% text, no document overflow or page errors; keyboard Top selection worked,
  canvas identity survived updates, failure masking and visible polling lifecycle
  stayed intact. Task-owned browser and fixture server closed in finally.

## Independent correction

Independent review found Unknown clipped by the new bounded panel despite no
page overflow. Its label now uses readable text sizing and can wrap, while
numeric percentage/unit stay atomic. Affected artifacts were rebuilt and pins
remeasured. Independent corrected browser verification passed22 checks, including
explicit Unknown text bounds at320/390 and200% text, keyboard44px radio targets,
known0/100 and unknown ARIA, retained canvas, and local-vs-whole failure masking.
Common primitives, parser, telemetry and authorization bytes remain unchanged.
Final source formatting was cleaned; diff whitespace check passes.

## Remaining gates

Independent exact candidate approval, unchanged mandatory shipping validation,
PR merge, exact installation, explicit restart of both services and meaningful
installed-byte verification are pending. Real active-print and actual ChatGPT/
phone outcomes remain separate; no print was started for this layout task.
