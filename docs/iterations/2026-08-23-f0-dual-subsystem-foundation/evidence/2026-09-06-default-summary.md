# Default summary consistency — 2026-09-06

## Scope and evidence boundary

F0 / UI-003, decision0055. User review identified the default's abrupt full-row
to paired-column change. Smart now uses three full-width rows (temperature,
configured color, fan); title/status identity, fields, appearances and common
CSS remain unchanged. Lab choices distinguish Default from capability Demo.
Canonical input/hash and source acquisition are unchanged. Registered resolved
rule is summary-stack-v2; the retired v1 literal and old mixed geometry are
rejected. Explicit authored order/spans and intrinsic collapse remain supported.

Source changes: server resolver, client placeholders, resolved registry/schema,
envelope correlation, Lab copy, focused server/client/browser expectations,
immutable preview pins, runtime/resource version metadata and generated MCP HTML.
Runtime/host0.4.15, schema16, observation21, Camera17, private r6/0.0.8-provisional.
Only private composable behavior changes; public HTML changes because coherent
host-version metadata changes. No printer/authentication/network/plugin or
production Lab registration action is included.

## Author validation

Commands ran in app with pinned Bun1.4.0 and --no-env-file --config=/dev/null;
Python commands used uv run --no-project. These are author software/synthetic
checks, not independent acceptance or actual-device evidence.

- `bun run ui:check`: 0 errors/0 warnings; component contracts PASS.
- `bun test tests/server/composable-presentation.test.ts`:16 PASS, including new
  retired-rule/mixed-layout rejection and unchanged explicit2+2+2 acquisition.
- `bun run ui:test src/lib/client/composable/component-registry.test.ts`:4 PASS.
- `bun run build:mcp-composable-lab`, `build:mcp-observation`, `build:mcp-camera`:
  generated exact resources; isolated and normal Kit `bun run build`:PASS.
- `bun x playwright test --config playwright.composable.config.ts`:16 PASS,
  all six variants,320/390/720,100/200% text, state geometry, focus, reduced motion,
  forced colors and threshold checks. Smart and Explicit now have intentionally
  different placement; within-state geometry checks remain.
- `bun test tests/server/composable-presentation.test.ts tests/server/composable-lab-mcp.test.ts tests/server/composable-preview.test.ts`:23 PASS after
  updating the changed page's exact hash pin. Initial run failed solely on the
  previous page hash; no guard was removed.
- `bun x playwright test --config playwright.mcp.config.ts composable-slot-bounds.spec.ts widgets.spec.ts`:34 PASS, private valid-decimal slots and affected
  production MCP Heads/Camera/legacy resource, recovery and sizing consumers.

Current-run before capture used deployed synthetic route /dashboard/lab/composition,
Unknown/Smart,1280x720,16px root. Candidate captures use immutable synthetic Lab
at320/390/720 and100/200% root text. Author inspected actual screenshot files:
390 known card has one reading direction and intact labels/icons/units;200%
wraps temperature without splitting target/unit. An in-app clipped screenshot
showed capture scaling mismatch and was excluded; accepted images came from
actual Playwright captures. No actual phone/browser-host/printer result is inferred.
Screenshots/logs stay outside version control. Existing extreme-decimal320/200%
formatting limitation is preserved and not expanded into this layout correction.

Preview canonical manifest:67adf17bbb98cc40138d0e32f71a0dc6fe67c2f719ff7f68b485615de7c725ac.
Preview HTML:01735ea82495236c7381cc6cd99311db129ef17ba8cb699f6fc91aed846d9c41.
Preview4218 and owned browser/viewport were released to the independent reviewer;
author test processes release their own fixtures. User apps/services remain intact.

- `bun run build:server`:PASS; the strict reader rejected pre-existing dist
  because it contained extra legacy build files. Rebuilt with the unchanged
  `scripts/build-server.ts --outdir <fresh task directory>`; Python
  `read_current_build_manifest` PASS,62 runtime files/81 static routes. No old
  files were deleted and no guard changed.
- `bun test tests/server/kit-composable-route.test.ts` after normal current build:
  5 PASS (238 assertions), public/dashboard exact-route boundaries.
- `git diff --check`:PASS.

Exact build manifest: 674852bac4ff31806b2b8d409648c35e57f857a22ef7bdca223b9ff02057098a.
MCP resource SHA256: private887a5b8dfaa674ce181c931a2916b6cc351f84e9fcb82ecd53e4f89026041c48;
observation40bdd39aa5181bfa60afd2d64b968bfe15ce9ecd822c8e6ed3d4480f87498ebd;
Camera19851dbf982727e95569f367e3b3d0717e39f1ed65628644f74e00eb28535252.

## Acceptance still pending

Independent exact review/verification, mandatory guarded release with both
service restarts and scoped installed-byte verification remain separate gates.
No deployment or user acceptance of this candidate is claimed here.
