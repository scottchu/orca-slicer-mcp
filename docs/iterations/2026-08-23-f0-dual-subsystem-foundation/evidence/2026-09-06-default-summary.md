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
immutable preview pins, runtime/resource version metadata and generated private
MCP plus seven production HTML resources.
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

## Acceptance at initial candidate freeze

Independent review and guarded release were pending at the initial freeze.
The completed outcomes below supersede that checkpoint; user acceptance remains separate.

## First guarded attempt and narrow repair

Independent source/visual verification approved152754c71fff695975591b3a7c3424694aff2f67
before the first guarded attempt. The operator stopped at validate, before merge
or installation. A captured diagnostic `scripts/check-repository.sh` run showed
647 client tests PASS and one stale presentation test expecting Smart to retain
the former [6,3,3] spans. Corrected that assertion to require Smart [6,6,6] and
Explicit [6,3,3]
independently; no application, generated asset or guard bytes changed. This new
candidate requires matching independent approval and the full mandatory operator
gate again. No shipping retry or later phase is claimed by this repair record.

The next diagnostic gate passed all648 client tests, then correctly rejected
`verify:live-fans`: five transitive native live resources had not yet been rebuilt
for the shared host version. Regenerated live fans/thermals/heads/queue/camera
with their existing build scripts and regenerated private Lab packages. All
seven production resources (those five plus MCP observation/Camera) match baseline
exactly after one0.4.14-to0.4.15 replacement per file; private general Lab packages
are byte-identical. The immutable composable preview rebuilt to the same manifest
and page hash above. No common CSS, application logic or shipping guard changed.

After all deterministic resource checks passed, the next diagnostic server gate
reported282 PASS and six outdated artifact-hash pins. Updated exact SHA256 pins
in live-fans-package.test.ts and mcp-widget-packages.test.ts from the rebuilt,
metadata-only resources; all other package assertions remain. Targeted package
checks then passed7 tests/75 assertions. Final current fresh-build strict reader
passes62 runtime files/81 routes, manifest deb60f236beea349e242bdc05b01ccfa50e92391aeec84d50caf33aec8465319.
The earlier674852ba manifest is superseded because the five native resources
now carry the coherent host version. Private composable/preview identities and
prior synthetic layout evidence are unchanged.

Final `scripts/check-repository.sh` PASS: UI/component contracts,648 client tests,
all required production/private deterministic package checks, TypeScript,
288 server tests,44 service tests and28 shipping-operator tests. This is the
captured diagnostic candidate gate; the maintained shipping operator must still
repeat its mandatory validation after exact approval. `git diff --check` PASS.

## Independent acceptance and guarded delivery

Independent reviewer approved exact5971dc6d21552f2bab6411850d213f5201cefde2:
31 source adversaries,42 synthetic browser states,8 targeted client tests and7
package tests PASS; all7 production HTML changes are one exact host-version
substitution. Fresh strict manifestdeb60f236beea349e242bdc05b01ccfa50e92391aeec84d50caf33aec8465319
passed independently. Lab source/resource/preview identities retained the earlier
visual evidence; no old placement algorithm was relabeled.

Read-only plan then `uv run --no-project scripts/u1_ship.py --pr 115
--reviewed-sha 5971dc6d21552f2bab6411850d213f5201cefde2 --bun <pinned Bun1.4.0>
--execute` completed all mandatory local validation and unchanged guards.
Merged7584f62168c8861e95b8904e22021b9eeaf300eb; operation
pr115-20260906T211851-90adfd; installed release
20260906-7584f62-pr115-20260906T211851-90adfd. Public and dashboard were explicitly
restarted, loaded/healthy/integrity verified at runtime0.4.15/schema16/obs21/cam17.
82 exact static assets and84 security checks passed; private state preserved;
no rollback needed. The first pre-merge failure remains recorded above.

The private MCP factory/resource remains unregistered and uninstalled; only
native Lab delivery is claimed. Real printer, actual phone, long-duration Camera
and actual ChatGPT mounted-host acceptance are not implied by this release.
This records-only tail does not change application/build inputs and needs no redeployment.

Independent installed native verification PASS on release7584f62:1440px/100%
and320px/root200%,12 transitions through initial Unknown, error, loading, known,
failed refresh and Unknown. Three aligned rows retained the same four fields,
no stale accessible telemetry, and card-relative state geometry within1px.
All22 actual responses matched the installed manifest;0 blocked requests and0
page errors. Installed strict inventory remained62 files/81 routes,deb60f236b… .
The first harness comparison used absolute y after screenshots had scrolled the
page; correcting it to card-relative coordinates passed without app changes.
Owned browser resources were closed. This is installed synthetic native evidence,
not private MCP registration or actual-device acceptance.

Records-only validation: changed-path inspection confirms exactly eight Markdown
files, no application/dependency/configuration/generated-asset changes; all changed
relative links resolve and `git diff --check` passes. Retain exact application
and installed evidence on the records head; no further deployment or record-only
follow-up is needed. Next action is user review of the delivered default.
