# 2026-09-05 state and implementation maintenance evidence

## Current disposition

Local application, browser and bundle acceptance is complete for the identities
in the final section. Exact final-commit review and guarded delivery remain next.
PR106 is still the recorded deployed release; no new service/device acceptance is
claimed. Earlier pending/failure statements below are dated checkpoints and are
superseded only by their explicit correction or final acceptance section.

## Historical scope and baseline checkpoint

The user approved fixing the reviewed current-state issues before feature work.
Baseline source is PR110 merge `8cc6eb18c44fb1ac0a3a92ead9a3a0e725bb50cc`.
PR109 and PR110 are done; PR106 remains the recorded deployment until verified
maintenance shipping. [Decision 0054](../../../decisions/0054-own-current-state-and-maintenance-evidence.md)
owns concise record/evidence responsibilities.

Application authors are addressing the HTTP refresh timeout, shared observation
and snapshot use cases, common cache helpers and tool declarations, plus Group
layout ownership, typography scale and related test naming. Planned candidate
labels are runtime 0.4.13/schema 16/observation 19/Camera 15; these labels are not
accepted source or deployed-service evidence. Application source is not frozen.
The private Lab stays private. This slice does not adopt unrelated Camera planning,
close C08, implement deferred preparation adapters or complete missing widgets.

## Documentation author evidence

Status: authored; independently reviewed at the checkpoint below; later tails need scoped reconciliation. Changed current records are
`PROJECT_STATE.md`, `NEXT_AGENT.md`, active `BRIEF.md`, `HANDOFF.md`, `VALIDATION.md`,
`docs/widget-delivery.md`, `docs/continuity.md`, the narrow `AGENTS.md` reporting
paragraph and decision 0054/index. The exact historical mirror and manifest live
under `docs/history/2026-09-05-pr110/`.

Actual documentation-author commands:

- `git show 8cc6eb18c44fb1ac0a3a92ead9a3a0e725bb50cc:<path>` and
  `uv run --no-project -` read the six prior records, built their relative-link
  closure, and wrote an exact fourteen-file snapshot plus SHA-256 manifest.
- `uv run --no-project <LOCAL_DOCS_CHECK>` compares every archive byte/size/hash
  against that source commit, checks relative Markdown targets, compares all 55
  ledger rows exactly, proves the narrow AGENTS reporting-only change and unchanged
  role/test/shipping guards, and executes the existing documentation portion of
  `scripts/check-repository.sh` only. The local helper is not a repository framework
  or test dependency; its path is redacted.
- The first helper run passed archive, 119 link targets, 55 rows, unchanged guards
  and existing documentation contracts, then `git diff --check` detected one extra
  blank line at the new ledger EOF. The author removed that blank line; no ledger
  row or historical byte changed. The corrected rerun is recorded below.

The corrected helper rerun exits 0: fourteen exact archives, 119 relative-link
targets, all 55 unchanged ledger rows, unchanged non-reporting AGENTS and shipping
scripts, existing documentation contracts, and `git diff --check` all pass. The
helper SHA-256 is `5ba2f7f4bf6fda5d695963048e630d1c18880e0a208acfa8b61603e7997c9edd`. No application/full build/browser suite ran for this
documentation subtask. At the documentation author checkpoint, the five current project/iteration entrance files totaled
189 lines (52 state, 31 next, 47 brief, 36 handoff, 23 validation); the current
ledger is 84 lines. Detailed historical bytes remain preserved, not deleted.

Documentation authorship is not independent review, application acceptance or
new deployed-service behavior evidence.

## Coordinator preimplementation deployed-status observation

The coordinator reports these actual commands from this candidate worktree:

- `uv run --no-project scripts/u1_service.py status`: exit 0; both existing
  services loaded/healthy/integrity verified at runtime 0.4.12/schema 16,
  observation 18/Camera 14.
- `uv run --no-project scripts/u1_ship.py --help`: exit 0.

This is preimplementation deployed-status observation, not scoped widget behavior,
new deployment, printer observation or actual-device acceptance. No printer or
service mutation is attributed to these commands.

## Historical application author checkpoints

Backend author `lab_reflection` implemented the 20,000 ms HTTP observation
fetch/body deadline and disposal settlement, shared observation/snapshot use cases,
six-domain cache mechanism, and paired typed tool declarations. Paths under app:
`src/lib/client/live/http-observation-port{,.test}.ts`, `src/lib/client/host/rpc.ts`,
`src/lib/server/{app,dashboard-tools,observation-store,observation-payload,camera-payload,tool-registration,runtime-contract,composable-lab-mcp}.ts`,
`src/lib/server/application/{observe-printer,refresh-camera-frame,domain-observation-cache}.ts`,
`tests/server/maintenance-usecases.test.ts` and release-identity expectations.
The author's 21-path frozen manifest is
`667ccc93fdb5e82f1822ad06365c2bea96f286e1463c87a577ad1e48a7eaa26f`.

Actual backend author commands from the app directory:

- `bun install --frozen-lockfile`: PASS; 316 packages, lockfile unchanged.
- `bun --no-env-file --config=/dev/null x svelte-kit sync`: PASS after a focused
  client run initially lacked generated tsconfig. Repeated focused HTTP/controller
  tests then passed 23 tests. Final `x vitest run` over
  `src/lib/client/live/{http-observation-port,controller,heads-controller,thermals-controller,queue-controller}.test.ts`
  passed 43 tests across five files.
- `bun --no-env-file --config=/dev/null x tsc --noEmit -p tsconfig.server.json`:
  final PASS after SDK-edge generic support and test wire-capture typing repairs.
  `x svelte-check --tsconfig ./tsconfig.json`: final zero errors/warnings.
- `bun --no-env-file --config=/dev/null test` over
  `tests/server/{maintenance-usecases,observation-store,app,materials,environment,queue,jobs,bed-mesh}.test.ts`:
  72 PASS/3 FAIL/764 assertions. The three HTTP material/environment/mesh failures
  were missing `build-kit/handler.js`, before behavior ran; the full owner later
  renewed each successfully on the pre-Header candidate below.
- Focused `test` over `maintenance-usecases`, `observation-store`, `app`, `jobs`,
  and `queue`: 42 PASS/514 assertions after correcting a test that inspected SDK
  `Client.listTools()` rather than the raw extension-bearing wire response.
  Final `test tests/server/maintenance-usecases.test.ts`: 9 PASS/231 assertions.
- Temporary baseline/candidate raw `tools/list` capture with in-memory clients:
  deep equality PASS for all four OAuth x Camera configurations, including
  top-level `securitySchemes`. A nullable constrained-integer representation
  mismatch was repaired before this pass. The comparison deliberately excludes
  changed release labels. Temporary capture sources were removed in `finally`.

CSS author `css_design_audit` owns common Group/Title/Reading/Metric/Swatch/Row
and semantic tokens, the typed client-only composable context and its registry,
domain leaf compositions, shared `tests/browser/helpers/text-scale.ts`, affected
browser test callsites, `docs/design-contract.md` and the corrected decision 0053.
No spec, resolved-tree, acquisition, canonical hash or production registration
change belongs to that CSS work. Actual author checks before Header renewal:

- `bun --no-env-file --config=/dev/null run ui:test src/lib/client/composable
  src/lib/client/common`: 18 files/172 PASS. This preceded the final minimum-height
  correction; corresponding browser geometry was renewed separately.
- `run ui:check`: renderer import-boundary repair passed Svelte/AST; a later
  concurrent SDK generic failure was handed back to its author. The new Heads
  test's cleanup typing was repaired with `parentNode?.removeChild(element)`;
  renewed `ui:check` passed zero errors/warnings and AST. This changed a test input,
  not application or generated artifact bytes.
- Isolated baseline/candidate `U1_COMPOSABLE_KIT_OUT=build-kit-composable-v2
  bun --no-env-file --config=/dev/null run build`: PASS. An initial local manifest
  sort mismatch failed closed; corrected tooling used the existing canonical
  manifest function. One invalid `uv run -c` invocation failed before work.
- Isolated `bun --no-env-file --config=/dev/null x playwright test --config
  playwright.audit.config.ts`: final 12/12 PASS across three widths and both root
  text sizes, states, semantic shapes, Smart/Explicit parity and isolation guards.
  Earlier 9 PASS/3 FAIL came from a hardcoded fixture origin; comparing the exact
  configured origin retained the no-external-request assertion. A fresh screenshot
  comparison independently exposed a hero-height regression; explicit compact
  104/64/64 px minima and exact tests repaired it before the final 12-case pass.
- Isolated production Heads root-preference case and fresh baseline capture:
  one PASS each. At 390px/100%, Smart T1 baseline/candidate PNGs are byte-identical
  (`513cf9e8eb511e1ed08e23d0f7a089105004c93ee2ee26f4908f46df0170d4e4`);
  Heads baseline/candidate PNGs likewise match
  (`6f1b5a891a53b6ba6804add420c894e7ef5189310cb3f1b39f9ff5fb95772f43`).
  These two samples do not accept all common consumers or actual-device scaling.

The subsequent Header hierarchy finding below reopens affected CSS acceptance.
All author checks here are attributed software/synthetic evidence, not independent
approval or physical-printer acceptance.

## Independent review checkpoints

Independent reviewer `maintenance_review` did not author the application or
records. Scoped documentation review independently verified fourteen archive files,
all 55 exact ledger rows, 121 relative targets, unchanged role/test/shipping guards,
and `git diff --check`. A separating blank before ADR0054 was corrected and
independently closed. Documentation checkpoint manifest:
`ae896554894ed37d973d38f9028cea0195844a642f9fcaa73b57e265c3aef5cb`;
subsequent evidence/status tails need scoped reconciliation.

Actual independent application checks from the app:

- `bun --no-env-file --config=/dev/null run ui:test
  src/lib/client/live/http-observation-port.test.ts`: 4 PASS; seven new temporary
  HTTP adversarial cases PASS (invalid limits, disposal/isolation, stalled body,
  late failure, concurrent success and recovery, with no unhandled rejection).
- `bun --no-env-file --config=/dev/null test
  tests/server/maintenance-usecases.test.ts tests/server/observation-store.test.ts
  tests/server/app.test.ts`: 27 PASS/375 assertions.
- Temporary backend adversarial script: six scenario groups PASS for cache races,
  zero/null/failure/TTL semantics, snapshot preservation under activation failure,
  and current-only OAuth/Camera inventory/schema rejection before acquisition.
  Script SHA-256 `7ebba0778db77fd06deaaedcdf9eeff8661008cf53f535711e23c8d4b46932c1`.
- `run ui:test src/lib/client/composable/component-registry.test.ts
  src/lib/client/live/http-observation-port.test.ts`: 8 PASS. An isolated Chrome
  helper adversary passed root-only scaling/restoration and synthetic mixed-unit
  doubling at default and nondefault roots; browser closed in `finally`.
  Script SHA-256 `c18c75635c9df0b7734adb2f5075f0b4bed48028eb35d7bd286ebfb02162353f`.
- Fresh source comparison verified all 21 backend manifest paths and unchanged
  pure spec/schema/view-model/resolver/route-policy/Kit-transport sources. The
  final pre-Header 51-path changed/new source/test manifest was
  `9ee9deae6a7f42378fec0a0e49ba406998b5a444c1530b935ecf2fe22c398908`.

The independent reviewer inspected eleven author-generated synthetic screenshots
using the project UI/UX instructions-based role fallback, without claiming native
role loading or fresh screenshot authorship. Normal T1 and Heads samples were
independently confirmed byte-identical; Unknown/error and responsive examples
remained truthful/readable. Visual manifest:
`98b73ac094b03b224a2a0068486f35e1834715764cc34257c3fdde9a9b361774`.

**Historical correction, closed in the Header section below:** initial visual review called mixed Heading/Caption scaling
an existing limitation. The coordinator challenged that classification; independent
source tracing confirmed an introduced hierarchy inversion at 390px/root200%:
baseline heading20/caption13 became heading20/caption26. The earlier nonblocking
classification is superseded. Shared Header semantic rem title/meta, focused ratio
and heading-above-caption assertions, fresh screenshots and independent renewal
are required before full acceptance. C08 and actual-device acceptance remain open.
No exact-SHA release approval or current Header-candidate full pass is claimed.

## Guarded release and postverification

Pending. Record reviewed/merged SHA, exact release/build identity, both services,
health/integrity/static/security/preservation, meaningful changed widget behavior
and any failed phase or rollback. PR106 remains the last accepted deployment
until this section has verified results. A documentation-only tail does not trigger
another service rollout when application/build inputs are unchanged.

## Evidence limits and next action

Software/fixtures do not establish actual-phone Camera reliability, a mounted
ChatGPT host, real-printer safety or user benefit. C08 remains open. Continue the
first unfinished step in [NEXT_AGENT.md](../../../../NEXT_AGENT.md); update current
summaries with links to completed evidence, not duplicated narratives.

## Historical full-validation owner: initial artifact and type-check attempt

The documentation author separately owns application artifact generation/full
validation; this is not independent approval of their documentation. Backend and
CSS authors explicitly froze their source before these commands. Pinned Bun 1.4.0
has SHA-256 `539598c775882420b9d8deb7dc14d845f20f7d26f5600c50ab067dde6ac3f3bf`.
The initial 507-file application/scripts/plugin input manifest was
`f216574ec0e9c21df4203e2a956f3d9f1777f7f61b18292cbd660430b42a3253`.

Actual commands from the app directory use pinned Bun with
`--no-env-file --config=/dev/null`:

- `run build:live-fans`, `build:live-thermals`, `build:live-heads`,
  `build:live-queue`, `build:live-camera`, `build:mcp-observation`,
  `build:mcp-camera`, `ui:build`, and `build:mcp-composable-lab`: all PASS.
  These regenerate eleven current/private HTML artifacts; host/index files are
  not silently reconstructed from unrelated sources.
- `U1_COMPOSABLE_KIT_OUT=build-kit-composable-v2 bun --no-env-file
  --config=/dev/null x vite build`: PASS. The existing
  `canonicalComposablePreviewManifest()` computes
  `b3cc6201e69471baec97eba6a26b832bf5cd0833124edde7012ce14550c1bbc5`.
  The 101,333-byte page is
  `d0705858517df46f8b44f5878c60751eae17d0742d6ac8fd445af3e3ace4186e`.
  The existing exact manifest and page pins were renewed; hydration node
  `1.CxZFb8Cp.js` remains unchanged.
- `bun --no-env-file --config=/dev/null test tests/server/composable-preview.test.ts`:
  4 PASS. The resulting 507-file source/input manifest is
  `5feb809eeb9644f0b6a8b25a5df1e7ec66b526ebf6b66e52812ff29dd9a9856e`.
- Root `./scripts/check-repository.sh`, with PATH resolving Bun to the pinned
  executable: FAIL at initial `ui:check`, before UI/server/full suite execution.
  Svelte reports one TypeScript error in the new
  `tests/browser/visual/kit-native-observations.spec.ts:37`: Node has no `remove`
  method in the inferred handle type. No full-pass or browser acceptance is claimed.
  The CSS author owns the narrow test-typing repair; renewed evidence follows only
  after that changed test input is frozen again. No shipping guard was bypassed.

These are build/static/private-fixture observations. No deployment, actual-device
or real-printer behavior is established by this attempt.

## Pre-Header full candidate: passed software, then reopened

After the test cleanup-only repair, the input manifest was
`901ae251403cdb7ee6fd3cc0b26def48555fa663eff6a01b43f879e672d6b165`.
The second actual `./scripts/check-repository.sh` passed UI/type/deterministic
checks, then reported 273 server PASS/10 FAIL/3,423 assertions. All ten failures
were obsolete exact artifact hash/size expectations after intentional regeneration.
The artifact owner renewed only literal hashes, five sizes and their sum in
`tests/server/{private-lab,live-fans-package,mcp-widget-packages}.test.ts`.
Their focused `bun --no-env-file --config=/dev/null test <three-files>` passed
14 tests/150 assertions; application/artifact bytes stayed unchanged.

The resulting 507-file application/scripts/plugin manifest was
`7b4cf36c24e4cf3634edc9a0622646818adc8331a87081f858640ddb1ceb3b70`.
The third actual root `./scripts/check-repository.sh` passed completely:
63 UI files/648 tests; 36 server files/283 tests/3,517 assertions;
44 lifecycle and 28 shipping tests; all required deterministic resource checks;
final `repository contract: ok`. Material, environment and bed-mesh HTTP cases
that previously lacked Kit each passed after the fresh Kit build. This complete
software pass belongs to the pre-Header bytes only. Header changes invalidate
affected evidence; do not carry this pass forward to the new candidate.

Process correction: after future affected-artifact regeneration, renew exact
package acceptance pins and run focused package checks before the expensive full
gate. This avoids expected snapshot changes forcing a full repeat, without changing
any guard or adding a workflow framework.

## Interrupted broad browser run and bounded Bed clock proof

`bun --no-env-file --config=/dev/null run scripts/build-state-harness.ts` and
`run scripts/build-camera-harness.ts` both passed. The owner then ran pinned
`bun --no-env-file --config=/dev/null x playwright test` with every explicit
`tests/browser/visual/*.spec.ts` except `composable-lab.spec.ts`, using
`--workers=1` and the default synthetic fixtures. Composable belongs to its
separate exact-artifact fixture; no generic `test:browser` pass is claimed.
The run collected 315 cases on the pre-Header artifacts. At the coordinator's
Header-review stop, actual results were 51 PASS, one FAIL, one interrupted and
262 not run, elapsed 87.08 seconds, exit 130. SIGINT to the task-owned Playwright
runner allowed teardown; both fixture processes exited and ports 4179/4181
were free. No user browser or service was stopped.

The real failure was `bed-error-state.spec.ts` initial failure at 320px/normal:
the Retry button had already become Reset before the transient busy assertion.
The Camera 720px case was interrupted and is not a separate behavior failure.
Failure screenshots/traces remain preserved in task evidence.

Bounded same-artifact follow-up commands:

- `bun --no-env-file --config=/dev/null x playwright test
  tests/browser/visual/bed-error-state.spec.ts --grep
  'initial failure.*320, enlarged=false' --workers=1 --repeat-each=3`
  with a separate output directory: 3/3 PASS.
- Task-only copies of that test added the same 500 ms Node-side delay after click.
  The running-clock control reproduced the exact missing-Retry failure. The
  otherwise identical paused-clock control passed 3/3, retaining all original
  busy/focus/geometry/recovery assertions. These commands used the same old built
  bytes and default synthetic fixtures; they are not Header acceptance.
  Both temporary specs were removed in `finally`, and fixture ports were free.

This controlled comparison demonstrates a test timer race rather than evidence
requiring a printer/product repair. The CSS author owns the minimal permanent
paused-clock test correction; independent review and affected reruns remain
required. Latest Header-focused author checks are still being finalized; no new
full candidate or release acceptance follows from these partial results.

## Header and Bed scoped closure; final artifact renewal

The CSS author froze shared Header semantic sizes at normal/mobile/compact
1.5/1.25/1.125 rem and Header metadata at the label token. At a 16 px root this
preserves 24/20/18 px titles and 13 px metadata. Existing icon/action dimensions
and breakpoints remain unchanged. The native Heads test now checks title scaling,
heading dominance over caption and no page overflow. The initial Bed retry matrix
uses a fixed installed clock plus `pauseAt` before click, while retaining every
original busy/focus/geometry/44px/recovery assertion and `fastForward(301)`.

Independent reviewer `maintenance_review` closed the Header P2 after opening all
eight final source-bound screenshots and inspecting the final Header/Bed changes.
The 100% Heads sample is independently byte-identical to baseline. Final sampled
visual/source binding manifest:
`ff610e85db5def64b544f3da90b0eec188c8238ce45d9d4146042fbdc12804aa`.
The reviewer's 52-path source/test checkpoint is
`b9fb3df19290868a66a596062c63744dbe5bad64987bdc3c38127e10015fa3d6`.
No blocking scoped source/visual finding remains; full generated candidate and
exact commit approval remain separate. The author reported 31 Header/native,
two MCP fallback and eight Bed cases passing, plus zero-diagnostic Svelte/AST.

After this scoped closure the sole full owner reran all eleven artifact-generation
commands listed above, plus dedicated composable and default Kit builds: PASS.
The expected hashes/sizes in the three package tests and the exact preview pins
were renewed before full regression. The dedicated Kit manifest is
`7d4898f501e67bd9253a57f5eb24e4a8bbfa2388c7dae3946611cc256e7e5c0c`;
its 101,333-byte page is
`93380af7efafc58c6368834422a641fffbea40e8a6fd5a215f6a3eb542b7f135`.
Hydration node `1.CxZFb8Cp.js` remains unchanged.

Actual final integrated focused commands/results:

- `bun --no-env-file --config=/dev/null test
  tests/server/private-lab.test.ts tests/server/live-fans-package.test.ts
  tests/server/mcp-widget-packages.test.ts tests/server/composable-preview.test.ts`:
  18 PASS/458 assertions.
- `bun --no-env-file --config=/dev/null x playwright test
  tests/browser/visual/header-typography.spec.ts
  tests/browser/visual/kit-native-observations.spec.ts
  tests/browser/visual/bed-error-state.spec.ts --grep
  'Header|shared typography|initial failure' --workers=1` with a separate output
  directory: 39 PASS (16.2 seconds).
- `bun --no-env-file --config=/dev/null x playwright test --config
  playwright.mcp.config.ts tests/browser/mcp/header-typography.spec.ts` with a
  separate output directory: two PASS (1.3 seconds).

The final 509-file application/scripts/plugin input manifest is
`e59e3c4e9bae4b9ad8bdf61d0898f91dcd2d662eaba818ae2bd472139753dbbe`.
It includes generated public bytes and final tests. Current resource labels are
runtime 0.4.13/schema 16/observation 19/Camera 15; private Lab r4/0.0.6-provisional.
Mandatory full repository, complete browser consumer coverage, runtime bundles,
exact commit review and shipping acceptance are still pending for this identity.
No production service or printer action was performed by the validation owner.

## Final local acceptance and remaining release gate

Source checkpoint `0a96c3671bc61b9cf094342b1df4218ab865ac27` binds the
509-input full-gate manifest
`e59e3c4e9bae4b9ad8bdf61d0898f91dcd2d662eaba818ae2bd472139753dbbe`.
After independent review found the remaining MCP test's px/vw-only enlargement
helper did not scale rem-based Heads text, the CSS author changed only
`tests/browser/mcp/widgets.spec.ts` to the existing shared synthetic text helper
and added measured title/name/caption/degree doubling assertions. Four enlarged
Heads cases passed on an isolated fixture and independent review accepted the
narrow test correction. No application, dependency, generated asset, shared helper
or build configuration changed.

The final 509-input manifest is
`035e6d9576862a38cf103186df0fc6608ee84e2d8810f0b0aa0fc5960eac9d86`.
Exactly 508 inputs match the full-gate manifest; only that MCP test differs.
Manifest serialization is SHA-256 of UTF-8 concatenated lines sorted by
repository-relative POSIX path: `<file-sha256>  <path>\n`, with two spaces and a
real newline. It includes Git tracked/untracked non-ignored files under
`plugins/u1-print-studio/app`, `scripts` and
`plugins/u1-print-studio/.codex-plugin`; JSON storage formatting is not the digest
input. All final 509 file hashes and all fifteen public HTML sizes/hashes were
rechecked after validation and remain exact.

Actual final validation-owner commands and results:

| Command / scope | Result and boundary |
| --- | --- |
| Root `./scripts/check-repository.sh`, pinned Bun on PATH, on the full-gate identity above | PASS: zero-diagnostic Svelte/AST; 63 UI files/648 tests; 36 server files/283 tests/3,517 assertions; 44 lifecycle and 28 shipping tests; required deterministic package checks; `repository contract: ok` |
| `bun --no-env-file --config=/dev/null x playwright test <every non-composable visual spec> --workers=1 --max-failures=1`, separate output | 345/345 PASS in 438.94 seconds; includes Header, native HTTP, current production consumers, Lab states, geometry, text stress, focus and recovery on synthetic fixtures |
| `bun --no-env-file --config=/dev/null x playwright test --config playwright.composable.config.ts --max-failures=1`, separate output | 12/12 PASS in 16.0 seconds; exact private Lab fixture, three widths, states, semantic/geometry parity and root-text cases |
| App-directory `bun --no-env-file --config=/dev/null x playwright test --config playwright.mcp.config.ts --max-failures=1`, separate output, after the final MCP test repair | 46/46 PASS in 1.1 minutes, including measured enlarged Heads and Camera consumers |
| `bun --no-env-file --config=/dev/null run ui:check` after the final MCP test repair | PASS: zero Svelte errors/warnings and existing component contracts |
| `bun --no-env-file --config=/dev/null run bundle`, `bundle:server`, `bundle:runtime` | All PASS; ad-hoc validation signing only, no distribution/notarization claim |
| `codesign -vvv --verify dist/u1-print-studio`; `dist/u1-print-studio --help` | PASS, without printer/configuration operations |
| Second `run bundle`; second `run build:server --outdir <EMPTY_TASK_OUTPUT>` | Reproduced identical stdio and complete server manifests; all declared files checked in both outputs |

The unchanged application full gate and unaffected 345/12 browser evidence are
retained across the MCP-test-only change; affected MCP behavior and type checking
were renewed. This is not a claim that `./scripts/check-repository.sh` ran again
on the test-tail head, or that the generic `test:browser` command passed. The
existing shipping workflow must still execute every mandatory local gate.

The first attempted final MCP invocation used the repository root by mistake.
Bunx resolved/downloaded seven temporary cache dependencies, then exited 1 because
`playwright.mcp.config.ts` was absent there, before tests or fixtures ran. No
repository package/lockfile changed. The corrected app-directory command used
the installed pinned Playwright 1.62.1 and produced the 46-case pass above.
The failed invocation is retained; it supplies no acceptance evidence.

Reproduced stdio SHA-256:
`6392905541edee385fa36548a77b3a24ad326843bf37ef3146593b3ac4e15a75`.
The identical server build manifests contain 62 runtime files and 80 static routes;
manifest file SHA-256:
`0933d2554c2300b306f2a8015b8a0bc46d592789c380a290338765b1b36bd13a`.
Both complete file closures were hash-checked. Final registered MCP resources are
observation 949,331 bytes /
`1808af7d9002e80f7ced44392d06a288dc8e8fe4e877cd8cc8d341db3dceb93a`,
and Camera 99,943 bytes /
`d90d64a961efbab4e7a318ddb222b887f3dce3cffc0ba1c874ea796e097bbe0e`.
The private composable v2 resource is 169,184 bytes /
`8970d28e0429c78cbf39b7532163f7c25f5b3568f55616c63aeda3b483d9b310`.
Its route/registration boundaries are unchanged. Source, generated artifacts and
all tests remain fixed for the coordinator's next exact candidate commit.

Task-owned browser/fixture processes exited; `lsof` found no listeners on
4179/4181/4182/4184 after completion. No user browser, deployed service, printer,
authentication or Tailscale state was changed by this validation owner. The
coordinator owns exact-commit independent review, PR111 delivery and the unchanged
`u1-ship` workflow. Actual-phone C08, mounted-host and user outcomes remain open.

Final private log identities (actual command output retained outside Git):

| Log | SHA-256 |
| --- | --- |
| `15-header-full-repository.log` | `d461057268805fba843784ef0cc1b7b70a5a3781eaea04d99a9d105a77496320` |
| `16-final-browser.log` | `628b13fd2cf43793b7bc5b7139642e4dfce2afdd9682f61d5d2ca1a6187f65d3` |
| `17-final-composable.log` | `e08f0a203b1141fb19d5cca1e39f950d56016861ca6ec3fe9718624ba7aeff98` |
| `18-runtime-bundles.log` | `84dfc5d034894984dfc54732030569c7dacbe13dd242b1d74c2220035545f9d2` |
| `19-final-mcp.log` | `1c06b858aeb4380670dfe4f4da95bab2f22a0d5beac5fa127e1681f0ca945b0f` |
| `20-final-mcp-cwd-corrected.log` | `70af1e48dd20f30189d054f868474823a4c01238470e7900f1c2a41e34e88703` |
| `21-final-mcp-typecheck.log` | `331d2197a0d6fef5efeed19c67e5a4521e8baa9c39ec7fc7a23355fc3482b4e5` |

## Latest checkpoint: pre-merge ship failure and narrow Kit route repair

The coordinator's first guarded PR111 attempt on reviewed
`9faaa999856d5b6b81ac425666547cf974e88a5e`, operation
`pr111-20260905T234927-36e684`, stopped during validation with
`Invalid or incomplete Kit build contract`. Merge and install were false;
rollback was unnecessary. Fresh coordinator status confirmed both existing
services healthy/integrity-verified at 0.4.12 / schema 16 / observation 18 /
Camera 14; PR111 remained open. No deployment or authorization boundary changed.

The unchanged `read_current_build_manifest` reproduced the precise error
`Generated static file is missing its route` in both the failed fresh ship output
and the earlier repeated bundle. Their identical `0933d255…` manifest included
`prerendered/dashboard/lab/composition/__data.json` without a static route.
Earlier full tests and byte/determinism checks had not called the semantic reader
on their real output; they did not establish shipping-contract acceptance.
Both failed outputs are preserved. The guard correctly stopped the release.

The repair retains the legitimate SvelteKit server-load artifact and explicitly
maps only `/dashboard/lab/composition/__data.json` to dashboard GET, separately
from HTML pages. Its fixed synthetic six-scenario/six-variant body is 69,918 bytes,
SHA-256 `1a6e9ff222a192136f202e1534fc61201b06f69f386860ccec4e8c1bfbd6b7fc`.
Public requests remain 404, dashboard non-GET requests 405, and existing raw-target,
prefix and neighboring-path isolation remains enforced. No generic data-route
wildcard, file omission, production MCP registration or shipping-guard change was
introduced. The CSS author owns the two source edits and new route test;
the independent reviewer approved their scoped source/adversarial evidence.

Validation owner commands on frozen repair inputs:

| Actual check | Result and boundary |
| --- | --- |
| Pinned Bun `run build:server --outdir <EMPTY_TASK_A>` and a second empty output | PASS; two complete 62-file / 81-route manifests byte-identical |
| `uv run --no-project` invoking unchanged `scripts.u1_build_contract.read_current_build_manifest` on both fresh outputs | PASS semantic contract, hashes and complete inventory; only `server.js` changed from failed output, all other 61 files and prior 80 route declarations identical |
| Pinned Bun `test tests/server/kit-composable-route.test.ts tests/server/kit-native-observations.test.ts` after fresh build | PASS: 8 tests / 457 assertions; page/data bytes, GET/public/mutation/query/prefix/raw-target isolation, native consumers and zero acquisition |
| Task-only Bun/Chrome integration loading the exact fresh `handler.js` on port 4218 | PASS direct SSR/hydration, six local scenarios/four shapes, exact data bytes, no page errors/nonlocal requests/observation reads; browser/server released in finally |
| `uv run --no-project` source/output parity | PASS: 510 inputs, only build-server and route-policy changed plus one route test added; remaining 507 prior inputs and all 15 public HTML artifacts exact |

The renewed canonical input identity is
`ec863ddc22cb6b43278ce81ea63281f8ac98644dce5cd22e0fdad7ffe87f4106`
(`route-repair-input-manifest.json`, the same sorted `sha256  path\n` serialization).
Both repaired build manifest files hash to
`eaedab7f794735b40a5e9f1fc3f4c5eafedb83e1b4fb1702d041585abf0c0ffe`.
Unchanged UI/client/prerendered bytes retain the earlier 345 visual, 12 private Lab
and 46 MCP evidence. No extra full suite was claimed for this route repair;
the next guarded ship must execute every mandatory gate on the new exact candidate.
Final exact-SHA approval, merge, deployment and served-behavior acceptance remain
pending. Existing version identities and actual-device/C08 limits remain unchanged.

Repair log identities (private outputs retained outside Git):

| Log | SHA-256 |
| --- | --- |
| `22-failed-kit-contract-diagnosis.log` | `1d6c1c063ed5d4c8c27da4811befd4ea9978253315c5c8a452ff2cbc460440d6` |
| `23-route-repair-build-a.log` | `de89ed69e79c6c8ff5492db3dd655c2b5ae1b9414d328114f14fbb9c9a63275a` |
| `24-route-repair-build-b.log` | `231d7049c5894eff147f9f8b09140766c7a68fae112333122cdc25679f80c2f9` |
| `25-route-repair-semantic-contract.log` | `5fb1f2fa9ef901800cc46ed843a4d02530b24943c4b87b16332cdb0783a1b125` |
| `26-route-repair-built-hydration.log` | `58d879db6e0e4fffb02aa79e20cd61a7ef9c6c9960596d7c535be7c524b6a5f7` |
| `27-route-repair-fresh-kit-tests.log` | `3c5fea46f41ebe9ce4cd1876820f23c60f3bd31c9174bd0e191d32fd7573590e` |
| `28-route-repair-final-parity.log` | `c037ccf3d4782c73fac1a4e612dccef9f608d3242ccea7da5cd8c2090320f629` |

Records-tail checks: `git diff --check` passed; `uv run --no-project` verified
24 changed-record relative links and the frozen 510 input hashes. `lsof` found
no remaining listener on task port 4218. No full suite or deployed request was
run by this validation owner for this records tail.
