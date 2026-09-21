# Current-G-code Progress — 2026-09-21

## Intent and contract

The user accepted the offline real-file preview, then explicitly requested
design, implementation and shipment in the existing Progress card. This F0 /
widget P03 slice follows [decision0060](../../../decisions/0060-render-current-gcode-in-progress.md),
OBS-016 and API-007. The source base is the connection-recovery documentation
merge `32903a25f9d5e34bf16487700119a7087f2eb941`. Draft PR127 remains
preserved; it is not automatically merged.

The agreed boundary is a shared current-artifact service and Operations adapter
with bounded metadata-correlated reads, content/version-keyed compilation,
private geometry and small Progress updates. Model-visible telemetry remains
small. Fifteen-second visible printing/paused demand shares the status store
and never bypasses coalescing; hidden/idle/standalone cadence stays separate.
No printer control, upload/start, auth or network modification is included.

## Ownership and affected boundaries

- Architecture/documentation owner: decision0060, requirement and delivery
  records; authorship is not independent approval.
- Implementation owner: application/domain/cache/parser, Operations reader,
  existing MCP/HTTP/CLI wiring, private Progress decoder/controller/component,
  targeted tests and generated production assets.
- UI review: existing rendered Progress first; preserve Frame/freshness/footer,
  insert a dominant model above current metrics, minimal 3D/Top controls, no
  manual layer slider or autonomous spin.
- Independent application verification: architecture/documentation owner, who
  did not author application code or tests. This is not independent approval
  of that owner's design or records. The implementation owner runs the single
  mandatory shipping regression; the primary coordinates integration/release.

Shared consumers requiring coverage include Progress, agent monitor and
Overview status acquisition; existing refresh input compatibility and auth;
HTTP/MCP result delivery; decoder/cache races; and all changed shared
controller/components/build inputs. Pure geometry checks do not prove printer
execution, physical deposition, mounted ChatGPT or actual-phone behavior.

## Baseline evidence

The primary ran `uv run --no-project scripts/u1_service.py status`: both
existing services were loaded, healthy and integrity-verified at runtime 0.4.20 /
schema 18 / observation 23 / Camera 18. The primary also inspected
`uv run --no-project scripts/u1_ship.py --help`. These are baseline observations,
not acceptance of the new feature or authority for printer controls.

Official OpenAI tool-result privacy, interactive UI and tool-boundary guidance
and Moonraker file metadata/download documentation were consulted; links are
in decision0060. No source CAD, private G-code, printer identifiers or runtime
receipts are committed.

## Acceptance state

PR130 is merged and installed at runtime 0.4.21 / schema 19 / observation 24 /
Camera 18. Independent exact application review, mandatory shipping, explicit
both-service restart and independent meaningful installed-byte checks pass.
The final documentation-only closure preserves the delivered application.
Actual active-print, physical deposition and ChatGPT/phone outcomes remain
separate; no such acceptance is claimed by synthetic telemetry. Historical
pre-freeze and stopped-gate evidence below retains its original boundaries.

## Previous connection-recovery user outcome

After the public-route recovery, the user reported that ChatGPT reconnected.
This closes its user-confirmation follow-up as a self-reported outcome. No
new authentication/network operation or additional protocol claim follows.

## Planning-record checks

The documentation owner ran an owned-path `git diff --check` and an in-process
Node filesystem link check: all 180 relative links across the 11 owned records
resolved, with no whitespace errors. This checks documentation only;
application implementation, independent source review, parser/runtime/browser
evidence and shipping acceptance remain pending.

## Independent application checks before freeze

These checks ran against mutable application work based on
`32903a25f9d5e34bf16487700119a7087f2eb941`; they are findings and focused
software evidence, not approval of a frozen candidate. The reviewer authored
the architecture/records, but not the application or its repository tests.

The reviewer ran Bun with `--no-env-file --config=/dev/null` on private
`parser-adversarial-wip.ts`, `service-adapter-wip.ts`,
`decoder-wip.ts`, `lifecycle-wip.ts` and `browser-wip.mjs`. Private absolute
paths, downloaded G-code, generated geometry and screenshots remain outside
Git. The browser probe used Playwright Chromium and an ephemeral loopback
fixture; browser and server were closed in finally. No printer call or
production mutation was performed by these probes.

- Parser probes reproduced and the author corrected ambiguous duplicate layer
  directives, repeated tool activation without a fresh extrusion baseline,
  and nonzero coordinate offsets across tool changes. Fresh probes reject
  unsupported coordinate/baseline cases; duplicate directives clear mapping.
  Invalid arc radius rejects and partial retraction recovery starts the
  deposited segment at the recovered position. Explicit startup coordinate
  modifiers fail closed.
- Same-job newer receipts compile once and become ready; a matching known ID
  omits geometry. Transient download failure retries on a later receipt.
  Age-stale same-job geometry has no highlight; changed-file stale evidence
  clears. A superseded job aborts its request and cannot publish a late result;
  disposal aborts the replacement request. Expired compiler budget yields
  timeout.
- Adapter fixtures accept a nested filename with spaces, reject traversal and
  wrong metadata filename, and refuse redirects without following them.
  Decoder probes pass roundtrip and reject corrupt/base64/decoded-size/bounds
  input, cancellation, wrong receipt version/epoch/time and extra path keys.
- Generated-widget screenshots cover 320/390/600 widths, light/dark preference,
  200-percent root text, reduced motion, keyboard Top activation, stale,
  terminal, failed and standby states. No horizontal overflow or page errors
  occurred. The same canvas remains mounted; failed acquisition removes
  geometry, filename and numeric evidence and disables preview controls.
  Stale shows Last reported without a current highlight; terminal retains an
  explicit printer state and stored-file caveat.
- A simulated visible 15-second interval adds one tools/call; 45 seconds hidden
  adds none. Visibility resume adds one; pagehide suspends demand and pageshow
  resumes once. These are host-lifecycle simulations, not actual ChatGPT or
  physical-device observations.

The private real-file sample has 244 layers, 6,029 paths and 230,291 vertices;
its reported-layer declarations map consistently. Browser layer 122 was
simulated. Nominal geometry excludes disclosed firmware macro motion and
does not prove deposited material. The pre-freeze screenshot identified an
empty overlay decoration, already assigned to the author before final build.
Final generated-asset screenshots and focused probes must be rebound to the
frozen source and asset identity before independent acceptance.

## Frozen application verification

Application source: `a759ee89f9548caffaebdc34ac1dbd36fa8c3bba`. The
independent reviewer inspected the final parser, cache, adapter, decoder,
controller, shared observation policy, transport/privacy changes, runtime
cleanup and affected packaging/version inputs. No blocking application finding
remains. Design/documentation authorship is not independent approval of those
records; a separate reviewer checks the documentation tail.

The implementation owner reported these successful commands from the app root,
all prefixed with `bun --no-env-file --config=/dev/null`:

- `run check` and `run ui:check`: pass; zero UI errors/warnings.
- `test tests/server/progress-toolpath.test.ts tests/server/observation-store.test.ts`:
  15 tests / 98 assertions pass.
- `test tests/server/app.test.ts tests/server/status-dashboard.test.ts`:
  45 tests / 1,102 assertions pass.
- `run ui:test -- src/lib/client/live/controller.test.ts src/lib/client/live/http-observation-port.test.ts src/lib/client/live/focused-adapters.test.ts src/lib/client/mcp/fixed-observations.test.ts src/lib/client/live/progress-controller.test.ts`:
  68 tests pass, including visible/hidden/pagehide/pageshow/unmount scheduling.
- `run ui:build`, `run build:mcp-observation`,
  `run build:mcp-composable-lab`, `run build:server`: pass; all nine native
  observation bundles regenerated.

Initial author checks found and fixed a snippet prop/type issue, a generic
ChartFrame marker incorrectly classified as Bed Mesh code by the private-lab
guard, and a stale schema-version expectation. Actual Bed Mesh implementation
guards remain. A delayed superseded download failure cannot replace the
current artifact. Production runtime and standalone MCP ownership release the
store; monotonic compiler checks enforce the remaining deadline.

At 21:38 UTC the independent reviewer reran the private parser, service/adapter,
decoder, cancellation and browser scripts listed above, plus
`adversarial-wip.ts`, on the frozen application. Their historical filenames
and internal WIP labels are retained; the final receipt binds this rerun to
the exact source above. All expected acceptance/rejection cases pass. A later
repeat captured the tight final card; the empty overlay decoration is gone.
The matrix retains no overflow or page errors and the visible/suspension
call counts remain one/zero as described above. Every owned browser/server
was released.

The final Progress HTML is 99,325 bytes with SHA-256
`6c9f1ecda84618a6b6411ebff88b58453e3160fdb528d67ac30980b04b55d95a`.
The final generated-byte preview is independently accepted as software with
simulated telemetry; metadata correlation, physical deposition and actual
ChatGPT/phone outcome boundaries remain unchanged. Required shipping validation
and installed-service/widget checks have not run yet and are not inferred
from focused acceptance.

The final documentation tail passed owned-path `git diff --check`; all 179
relative links across its 11 records resolve. `git diff --name-only` against
the frozen application reports no application, dependency, configuration or
generated-asset changes in this tail. Focused application evidence is retained
on those unchanged bytes; the documentation owner did not rerun full builds
solely for bookkeeping.

## Stopped shipping attempt and identity-pin correction

The authorized `u1_ship.py --execute` attempt
`pr130-20260921T174350-72baef` stopped during local validation. It did not
merge, install or mutate either service; no rollback was required. The author
diagnosed 328 server tests: 313 passed and 15 failed against stale deterministic
artifact hashes/sizes and composable manifest pins. The generic ChartFrame
assertion was hidden behind an earlier hash failure and was corrected during
the follow-up; it was not separately observed among those 15 failures. Earlier focused
checks did not cover these old pins; their pass was not a full-gate claim.

Correction `054fc1991c52bd61f9544e3e25a6b7622ca01331` changes four package/preview
test files and the isolated composable-preview manifest/hydration pins only.
Production source, generated resources and dependencies remain unchanged. The
author ran pinned Bun with `--no-env-file --config=/dev/null test tests/server`
for the diagnostic. The targeted correction used `bun` from PATH (also 1.4.0)
with the same flags and
`test tests/server/live-fans-package.test.ts tests/server/private-lab.test.ts tests/server/mcp-widget-packages.test.ts tests/server/composable-preview.test.ts`:
23 tests pass with 545 assertions.
The independent reviewer recomputed all nine focused resource identities and
sizes, MCP/Lab hashes, the canonical composable manifest and page hash, and
confirmed the named hydration asset exists. All corrected pins match the
actual build. Strict manifest equality and route allowlisting remain; removing
the shared ChartFrame marker does not remove the WebGLRenderer, OrbitControls
or bed-mesh-fixture guards. No blocking delta finding remains.

The Progress resource retains the 99,325-byte hash recorded above, so its exact
parser/cache/browser evidence carries forward on unchanged production bytes.
The independent identity check and `git diff --name-only` verify that boundary.
The corrected combined candidate still requires exact review and a renewed
full mandatory shipping run; no failed gate is skipped or weakened.

## Successful delivery and installed-byte verification

- PR: [130](https://github.com/scottchu/orca-slicer-mcp/pull/130).
- Reviewed candidate: `3b91eb6f3ec68abb1ffa3a04df3b91294469aabd`.
- Merge: `d1d72ff593f6444fb2bc5c82957f7693ab558e18`.
- Release: `20260921-d1d72ff-pr130-20260921T175022-a5d03f`.

The operator ran this read-only plan and then the same command with
`--execute`; the placeholder omits only the private path of the existing
pinned Bun 1.4.0 executable:

`uv run --no-project scripts/u1_ship.py --pr 130 --reviewed-sha 3b91eb6f3ec68abb1ffa3a04df3b91294469aabd --bun <existing-absolute-pinned-Bun>`

The renewed full mandatory local validation passed. The guarded workflow
merged PR130, installed its exact build and explicitly restarted both existing
services. The operator then ran
`uv run --no-project scripts/u1_service.py status`: both were loaded, healthy
and integrity-verified at 0.4.21 / schema 19 / observation 24 / Camera 18.
The successful receipt records 123 static checks, 125 security checks and
preservation=true, with no rollback. Existing configuration, stable OAuth and
passkey identity, service definitions and routes were preserved. No printer
control, camera acquisition, authentication or network change was performed
for this feature release.

At 21:53 UTC the independent reviewer ran
`/usr/bin/curl --fail --silent --show-error --max-time 5 http://127.0.0.1:8788/dashboard/progress_widget`.
The actual focused Progress resource was 99,325 bytes and matched SHA-256
`6c9f1ecda84618a6b6411ebff88b58453e3160fdb528d67ac30980b04b55d95a`
exactly. A private `installed-browser.mjs` probe, executed with Bun
`--no-env-file --config=/dev/null`, used those served bytes with the existing
private geometry and simulated telemetry. The 320/390/600-width, light/dark
preference, 200-percent text, reduced-motion, keyboard, stale/terminal/failure/
standby and visible/hidden/page lifecycle matrix passed. There was no horizontal
overflow or page error; canvas identity remained stable, failures masked
geometry/filename/numbers, and hidden demand stopped. The reviewer inspected
the final tight card screenshot. Owned browser/server resources were closed
in finally; these checks made no printer calls.

This establishes meaningful behavior of the installed resource, beyond health
or a static hash. It still uses simulated layer/progress telemetry and a
fixture host. The next smallest outcome check is the user's Progress view
during a real active print in ChatGPT or on the phone. It does not require
another deployment, print start, authentication reset or network repair.

The final closure updates records and delivered P03/decision status only.
Application, dependencies, configuration and generated resources remain the
merged release. Unaffected builds/browser suites are not repeated and no
additional service deployment is needed for this documentation-only tail.
