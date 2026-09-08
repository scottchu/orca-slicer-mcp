# Agent-readable observation and monitoring capabilities — 2026-09-08

The user accepted the proposed agent capability work after the monitoring-maturity
discussion. This authorizes implementation planning and the ensuing bounded
read-only capability slice; it does not attach a monitor to the current printer.
UI exploration and styling remain parked. Private Lab source integration and
records closure are complete through PR117/118; this is a new application slice.

## Adopted first-slice scope

The intended outcome is a complete agent-readable observation snapshot,
model-visible camera evidence, and truthful monitoring session continuity and
terminal rules through shared application use cases. Decision0057 adopts the architecture proposal with
explicit observational binding, strict complete-file/controller checks and
truthful cache receipts. Candidate implementation and author-focused checks are
complete; exact-source and targeted review are now approved as recorded below.
Mandatory full validation and guarded delivery remain pending. No durable daemon, external notification service, active monitoring,
printer control or completed-print outcome is claimed. New UI/DSL capabilities,
authentication, Tailscale and plugin changes are outside this slice.

Existing SESSION-001, OBS-002 through OBS-007, MON-001, CAM-001 through CAM-003,
DATA-004 and ARCH-001/002/004 frame the design: fresh evidence and explicit
unknown states, shared ports/use cases, independent camera timestamps, bounded
privacy-safe output and run identity. API-006 and MON-002 explicitly reconcile the additional tool-only intent,
nullable evidence, image privacy and limited continuity. SESSION-001 and full O1
acceptance remain open.

## Initial author preflight

The author read current project/next-agent/iteration records and relevant
requirements, then ran `git log -3 --format='%H %s'` and `git status --short`.
The fixed worktree/branch is at PR118 merge
`9d08702a779c31d8aa3009d75b2beff5d5e8e9ff` with clean status before these edits.
Only PROJECT_STATE, NEXT_AGENT, the active BRIEF/HANDOFF/VALIDATION and this new
record were edited during that preflight. Explicit Homebrew `rg` searches identified
superseded merge/validation wording, which current indexes now correct. Prior
comparison, image-proposal and Lab-merge evidence remains unchanged.

Design is delegated to the architecture owner; this author has not edited app
code, performed a new build/test, acquired a camera frame, contacted a printer,
started monitoring or changed any service. PR115/runtime0.4.15 remains the
recorded deployed baseline. Provisional0056, the private/unregistered Lab and its
known Unknown badge and extreme-decimal limits stay preserved.

The following implementation proceeded only after the architecture proposal and
domain review were accepted for this bounded slice.

## Implementation and affected consumers

The author read the architecture proposal, domain review and independent
coverage preflight. New application policy/use-case modules own the complete
allowlisted telemetry DTO, three-valued terminal checks, bounded observational
context and optional camera acquisition. New adapter evidence is produced by
readU1Status's same fixed query and stored separately from U1Status and
ObservationSnapshot. Exact-job keys never leave server-internal context; the
public mapper lists fields explicitly. Missing vendor exception, controller or
park facts remain unknown. Display filenames reuse safeDisplayFilename rather
than a new weaker policy.

The store owns due/coalesced acquisition and truthful query-receipt freshness.
Its lifetime also keys one bounded monitor context across MCP HTTP requests.
Camera completion only rechecks stored freshness/identity, never issues a second
telemetry query. Source-clock regression, reset/gap/epoch or expected mismatch
breaks continuity; uncertain expected calls withhold camera and cannot mint a
replacement token. Initial fresh active/paused observational binding is allowed
without native identity, with its limits explicit. SDK and HTTP cancellation
reach independent camera work without aborting other shared status consumers.

One strict tool-only declaration provides real input/output JSON schemas to SDK
and OAuth catalogs. JSON text mirrors the typed structuredContent, and optional
sanitized JPEG appears once as ImageContent. No widget template, image _meta,
live activation or new HTTP/CLI route is added. The20-second consumer deadline,
16KiB JSON and1MiB sanitized image bounds are explicit. JPEG structural validation
is not a full image decoder or visual diagnosis; the synthetic test fixture was
separately decoded. No new dependency or native runtime library is introduced.

Affected consumers are shared status normalization/store, MCP HTTP and stdio
registration, existing observation projections, camera result/version metadata,
OAuth inventory, CLI health/version and maintained monitor/setup inventory
instructions. Existing private Lab and widget renderers remain unchanged.
The mobile-setup skill edit only synchronizes the source inventory; no setup,
credential, authentication or plugin operation was performed.

## Version and artifact preservation

The new server candidate is runtime0.4.17/tool schema17, deliberately distinct
from separately preserved unpublished0.4.16 WIP. Observation21/Camera17 and the
client appInfo0.4.15 remain their exact original build identities. Independent
source review confirmed observation wire schema2, camera frame1/offer2 and
client handling do not depend on the global tool-schema/runtime number.
Decision0044's resource-URI cache identity forbids replacing bytes under the
same URI merely to synchronize an unrelated server version.

Before this clarification, all8 host-version widget build commands succeeded.
Those generated bytes were not adopted. The author preserved their exact bytes,
hashes and command logs, then restored only host/rpc.ts and these8 HTML files
from base9d08702: mcp-observation, mcp-camera, svelte-live-heads,
svelte-live-thermals, svelte-live-fans, svelte-live-queue, svelte-live-camera and
mcp-composable-lab-v2. The private unadopted-client manifest SHA256 is
`8157ff37a6a8d0eda610f76110eedf7fe7ec2177bbaee9bec8913406908247e4`.
This was a successful but unnecessary generation path, not a build failure.
All8 subsequent source/artifact checks passed. All15 tracked public files are
byte-identical to the base; no older production WIP was adopted.

## Actual author commands and results

Bun invocations used the explicit pinned1.4.0 executable with
`--no-env-file --config=/dev/null`; its directory was prefixed to PATH for child
commands. Python was not used by the implementation author. Shell searches used
explicit Homebrew rg. Source/record reads, Git identity/status/diff checks and
Node filesystem/hash/edit helpers ran in the fixed worktree only. Early source
lookups included nonexistent camera-frame.ts and unmatched optional shell globs;
those reads failed without changes or conclusions based on their output.

- A Node helper created a synthetic8x8 PPM; `sips -s format jpeg` generated the
  test JPEG, then `sips -s format png` decoded it and `sips -g pixelWidth -g
  pixelHeight` verified8x8 dimensions. Only the bounded synthetic fixture constant
  enters test source; generated image files and source/review reports stay private.
- Initial `bun test ./tests/server/print-monitor.test.ts`:9 pass/2 fail. Pinned
  ext-apps1.7.5 requires UI metadata, and nullable compatibility rewriting broke
  output-schema reference paths. The single registration helper now sends
  tool-only declarations to standard SDK registration and preserves canonical
  outputSchema JSON; existing input compatibility remains. The next run passed
  all11 initial cases.
- Scoped source review found the weaker filename filter, missing known source
  clock regression check, response freshness evaluated before camera wait, and
  controller-state coercion accepting arrays. Each was corrected with shared
  filename policy, explicit comparisons/reassessment and exact type checks;
  synthetic adversarial coverage was added. No independent reviewer authored
  application changes.
- Successive focused runs exposed only expected inventory/version assertion
  updates:46 pass/2 fail before model inventory synchronization, then91 pass/1
  fail while cameraActivation still expected global schema16. A targeted rerun
  isolated that remaining mismatch; its expected schema was updated to17.
- `bun run check` initially passed application types, later caught a test-only
  Buffer generic mismatch; comparing the exact base64 bytes as strings repaired
  the assertion type. Final `bun run check`: PASS.
- The final scoped command was `bun test` with exact `./tests/server/` paths for
  print-monitor, u1-status, observation-store, app, maintenance-usecases, jobs,
  materials, environment, queue, camera-routing-contract, personal-oauth, cli and
  status-dashboard test files:132 PASS,0 fail,1828 assertions across13 files.
  This includes16 new monitor cases: genuine MCP ImageContent/strict schemas in
  both catalogs, same-query connector receipt, loopback-only acquisition,
  cross-request token lifetime, cache/TTL freshness, terminal contradictions,
  source-clock/reset/mismatch, privacy and SDK cancellation/timeout. The retained
  `focused-final.log` SHA256 is
  `d54f8ba2935552b2588b51f2391c159b780458893c103f6f18945aa50cf9232f`.
- `bun run build:live-heads`, build:live-thermals, build:live-fans,
  build:live-queue, build:live-camera, build:mcp-camera, build:mcp-observation and
  build:mcp-composable-lab all passed before the client-version restoration.
  Corresponding `verify:` commands all passed afterward. `bun run build:server`
  passed for the source integration/HTTP fixtures. These editing-phase builds do
  not replace the required exact-candidate shipping build.
- Node hash/mode checks recorded510 app inputs in private
  `candidate-inputs.json`, SHA256
  `d096199946b2b9509cb609e34d7984418d7d3fc7ab91f95c3e309d387dbea5b2`;
  all15 public files match base9d08702. `git diff --check`: PASS.

All focused commands completed. Synthetic HTTP tests used ephemeral loopback
ports with finally teardown; in-memory MCP transports/clients were closed.
No user session, printer, camera device, credentials, external service or
plugin installation was touched. Model-readable protocol image evidence is
not actual-host multimodal acceptance or physical-printer evidence.

## Remaining gates

The candidate is frozen and independently source/targeted approved below.
One owner performs the unchanged mandatory full validation in the
normal guarded shipping workflow; the author has not run a full repository or
Operations.validate suite. Existing PR/merge/deployment/security/preservation
checks remain mandatory. No current candidate deployment, active-monitor owner,
strict native-run continuity, durable supervision, physical completion or final
user-outcome acceptance is claimed yet. UI/DSL remains parked with its recorded
limitations and provisional0056 intact.

## Fresh independent findings and pre-freeze correction

Before freeze, the separate verifier reproduced two defects with an isolated
in-memory/fake-clock probe: cancelling an expected-token consumer invalidated
its peer's shared run context, and a legitimate160-code-point supplementary
Unicode filename exceeded the output schema's255 UTF-16-unit bound. Neither
finding is physical-printer or actual-host evidence.

The author corrected only consumer ownership and the mismatched output bound.
Cancelled/timed-out consumers no longer write shared continuity state; real
telemetry acquisition failures retain their conservative behavior. A late
camera result may only invalidate its own still-current context reference,
never a peer's newer context. The output filename bound now accommodates320
UTF-16 units from the unchanged160-code-point safeDisplayFilename policy; no
credential/URL/Unicode privacy guard was weakened. Both reproductions became
permanent focused regression cases. The verifier independently reran its original
probe and reported both cases passing; original failure and corrected results
remain separately preserved in private evidence.

The author then ran `bun test ./tests/server/print-monitor.test.ts
./tests/server/app.test.ts ./tests/server/maintenance-usecases.test.ts` with the
same pinned executable and environment flags:41 PASS,0 fail,490 assertions,
including18 monitor cases. `bun run check` passed again. Other affected-consumer
checks from the earlier132-test run remain retained; no unrelated full suite
was repeated. The corrected focused log SHA256 is
`76677a43537ac42ff2bb93dc5f4fb8861bbd4c089c29adbf0aef597a1fc15c98`.

Final private `candidate-inputs-final.json` SHA256 is
`1d93b7b33c9c5fa7f7f8e996497c9b5fe3f85fb01399c77b6cdcae49199ad06d`,
covering510 app files. Compared with the earlier manifest, only the monitor
use case, output schema and monitor test changed; all retained public artifacts
and dependencies remain identical. This is the author freeze identity, not an
independent exact approval or a successful shipping gate.

## Independent exact-source and targeted approval

The separate reviewer/verifier approved application head
`3d270f54547fd282c3450c497c6475802d6de497`, tree
`5b120521bfae618517423f45a7e37833d534d3d2`, against base9d08702. Source review
found no remaining implementation blocker after the two corrections above.
The private `source-review-final.md` SHA256 is
`9b6784dab79c3b8daebb4f2a3c81526291cc7687bc674b35eb5d2de9dc6cc84a`.
This is approval to enter required shipping gates, not full validation or
release acceptance.

Independent actual targeted commands used pinned Bun with
`--no-env-file --config=/dev/null run` on retained adversarial-probe,
initial-reuse, receipt-race, terminal-egress, receipt-pair and jpeg-export
TypeScript scripts. Original two failures and corrected results remain separate.
Fresh checks passed for concurrent initial token reuse, older-camera/newer-peer
receipt preservation, seven terminal unknown/conflict cases, monitor plus five
legacy-projection privacy exclusions, and three concurrent consumers sharing
one acquisition/version/evidence receipt. This verifies those store/use-case
paths, not atomic native-printer run identity.

The verifier ran `uv run --no-project --with pillow` and Image.load on the
sanitized synthetic622-byte JPEG. It decoded as8×8 RGB, SHA256
`d5bf296b98ac94b4dfb7f8528f0cc2aa46f39b98b918b5b7ce51cc8d989a42ce`.
This proves the fixture image decodes; it is not actual-host multimodal or
physical camera acceptance. The server sanitizer remains explicitly structural.

Independent `uv run --no-project` identity/link checks plus Git status/show/
diff checks confirmed all510 app hashes/modes match the final author manifest,
all15 public files equal the base,107 relative links resolve, and exact HEAD is
clean. Private `frozen-identity.json` retains the results. All reviewer scripts
completed without leftover listeners/processes. No Operations.validate/full
suite, build, printer call, service operation or UI action was performed by the
independent review stage.

The current tail only updates the six documentation records. It retains the
approved510 application inputs and needs documentation-head approval retention;
mandatory full local validation, PR identity/merge, guarded deployment and
postverification are still pending the unchanged u1-ship workflow. No active
monitoring, durable supervision, strict native-run or physical outcome claim is
added by this approval.

## PR119 first shipping attempt and inventory-test correction

The independent shipping owner ran the unchanged operator on reviewed
`be64145366db4cdb626097a87bd80e9afc0e5cb5`. Operation
`pr119-20260908T074819-f6d7a3` stopped in `validate`: merged=false,
installed=false, rollback=not-needed. Its retained failure receipt SHA256 is
`bed0eae4cea1b0096804ef22ed8a8efe4eac3e55b839e6f03fb3cba4631a46be`.
No merge, install, service restart or printer operation occurred. This is a
failed required gate, not successful release evidence.

The verifier's bounded server diagnostic stopped at10 pass/1 fail: bed-mesh's
model-visible inventory still expected two tools after this slice adopted three.
Separate `uv run` service and ship simulator diagnostics passed44 and28 tests.
Their original logs and failure receipt remain preserved independently.

The author changed only that test's inventory assertion to the exact sorted
names `get_print_monitor_snapshot`, `observe_printer`, and
`open_printer_camera`. Its existing model/app-only visibility filter and
two-resource assertion remain intact. Explicit Homebrew rg searches of server
tests found no other stale two-tool inventory expectation; unrelated resource,
request and session counts were preserved. No operator, safety guard, runtime
implementation, dependency or generated asset changed.

The author alone ran the remaining25-file server subset, with pinned Bun1.4.0
and its directory prepended to child PATH, from the app directory:

```sh
bun --no-env-file --config=/dev/null test --bail ./tests/server/bed-mesh.test.ts ./tests/server/camera-dashboard-host.test.ts ./tests/server/camera-fanout.test.ts ./tests/server/camera-ice-config.test.ts ./tests/server/camera-relay.test.ts ./tests/server/camera-runtime.test.ts ./tests/server/camera-webrtc-http.test.ts ./tests/server/camera-webrtc-session.test.ts ./tests/server/composable-lab-mcp.test.ts ./tests/server/composable-presentation.test.ts ./tests/server/composable-preview.test.ts ./tests/server/kit-composable-route.test.ts ./tests/server/kit-env.test.ts ./tests/server/kit-fans.test.ts ./tests/server/kit-native-observations.test.ts ./tests/server/live-fans-package.test.ts ./tests/server/local-config.test.ts ./tests/server/mcp-widget-packages.test.ts ./tests/server/observation-presentation.test.ts ./tests/server/packaging.test.ts ./tests/server/prepared-artifact-validation.test.ts ./tests/server/private-lab.test.ts ./tests/server/queue-foundation.test.ts ./tests/server/request-lifetime.test.ts ./tests/server/upload-prepared-artifact.test.ts
```

Result:172 pass,0 fail,2068 assertions,7.00 seconds. This focused author check
does not replace the required operator retry. The retained command manifest
SHA256 is `adb5b70c64919ab178ffdf2746a170d2339458de216802fec8564b9c618a068f`;
log SHA256 is
`60692b8d6525ee061792110b4d4f4cd61375cb65a202d8e5c0ec90a2bb4b6ed4`.

A Node filesystem/SHA256 comparison checked all510 prior application inputs and
modes. Only `tests/server/bed-mesh.test.ts` differs; all implementation and
public artifact bytes remain unchanged. The new private input manifest SHA256
is `b6568241cbc327266ee6738d38e0bcde8fc9fc44de9286660713d271745b11b0`.
The prior manifest and application/source-targeted evidence remain preserved.
Next: independent exact review of this test/documentation correction, then PR
head verification and the unchanged mandatory shipping workflow. No full-run
PASS, merge, deployment, physical outcome or active-monitoring claim is added.

## PR119 completed guarded delivery and installed-byte verification

The independent reviewer approved corrected head
`133ee94eb1959d8260a1c3c6b834fbe819447264`; its correction report SHA256 is
`95b10e8e30e716069ff87b59f908366740a3133876ae75c431be4182408fd10d`.
The root updated the PR head. The sole shipping owner then ran
`uv run --no-project scripts/u1_ship.py --pr 119 --reviewed-sha 133ee94eb1959d8260a1c3c6b834fbe819447264 --bun /Users/scottchu/.asdf/installs/bun/1.4.0/bin/bun`
for a passing plan, then the same command with `--execute` (exit0). The
unchanged mandatory validator passed on this corrected candidate, followed by
guarded merge, exact-source staging, install dry-run, installation, explicit
restart of both services and verification. No required gate was skipped. The
operator does not export nested successful test counts; none are inferred here.

Successful operation `pr119-20260908T080317-9cbe3e` merged
`825b38135948574f832f94aa533d3bb58dd6e33a`. Its ordered parents are base9d08702
and reviewed133ee94; tree `6dc4173f351664f42ff297ea2fe3da47ea3c38fc`
exactly equals the reviewed tree. Installed release is
`20260908-825b381-pr119-20260908T080317-9cbe3e`; rollback was not needed.
Both public/dashboard services are loaded, healthy and integrity verified at
runtime0.4.17/schema17, observation21/Camera17. All82 static-asset responses and
84 security checks pass; private configuration/OAuth/routing preservation passes.
The canonical checkout remains main; the root fetched and fast-forwarded only
the task branch to the merged commit. The first failed attempt above remains
preserved and did not perform those external mutations.

The successful receipt SHA256 is
`fe779262b91483c41b81be001202c9a10807f4d532f2d01889bdda9efd6dccf6`;
installed manifest SHA256 is
`2866f33a0767e639b789470ac7a1338eee6426098e5630f193d32dc97ecfa9da`.
The independent shipping/installed verification report SHA256 is
`5d11819fa6a587e014a94367b8375efaf7c898a20b2f153e37abd92a94669539`.
Full receipts and logs remain private; this record owns the durable outcome.

The verifier matched actual installed Bun and server.js to the installed
manifest, then ran the retained installed-synthetic TypeScript probe with pinned
Bun `--no-env-file --config=/dev/null run`. A separate loopback HTTP child used
an ephemeral port and explicit synthetic configuration, without deployed OAuth
or service settings. Exact three-tool inventory, strict tool-only schema,
structured/text equality, safe filename, observational token semantics and
622-byte sanitized JPEG identity passed. The JPEG matches the earlier decoded
8×8 RGB fixture. Cached expected-token and repeated initial inspections preserve
the token; an unknown expected token returns none and withholds image acquisition.
Only three fixture GETs occurred: query, webcam discovery and synthetic JPEG.
Connections, child and fixture were closed in finally. Result SHA256 is
`2c6f0d5d936bc5a5bdca3046dd894321649e40bff7bb30c0940bdab1fd46cca0`.
An initial probe assumed an absent deployed CLI and failed ENOENT before starting
any fixture/child. Its retained precondition error led to the actual installed
Bun/server HTTP entrypoint; it was not a product failure or another deployment.

This proves installed software behavior against synthetic data, not real-printer
state, active monitoring, physical completion, phone UI or host multimodal
rendering. No real telemetry/camera was called. The root observed that this
existing conversation's tool catalog still omits the new tool; deployed server
capability and host refresh remain separate. No plugin reinstall or application
relaunch was attempted. UI remains parked, the Lab unregistered,0056 provisional
and known limitations preserved. Further product work is unspecified.

This delivery closure changes only six documentation records. The author used
Node filesystem/SHA256 checks against the prior510-input manifest and Git's
merged baseline, plus relative-link checks and `git diff --check`; application
bytes and modes are unchanged. The separate reviewer will verify this exact
closure head. Its bookkeeping PR has not yet merged; unchanged application bytes
require no second deployment. No tests or builds were repeated by this author.

## PR120 文件收尾完成（交接索引補正）

上一節記錄的是 PR120 合併前的文件作者時點。PR120 現已合併為
`2a3e280f2d634f3e4fbabbf7be307f524a3fd86b`，ordered parents 為 PR119
merge825b381 與 reviewed documentation head01aaddc；tree 與已核對的文件 head
相同。這是文件收尾，沒有第二次部署。後續本機移轉由
[新 worktree 交接](2026-09-08-worktree-handoff.md) 記錄；不要重播已完成的 PR。

## 2026-09-08 authorized one-shot host snapshot smoke test

After handoff, the user requested testing the new MCP snapshot and then a
connection refresh. Source checkpoint remained1d490fad19be96442421bf9e21984b629eaa1113.
The initial host catalog lacked the tool; the bounded connection diagnostic
performed no MCP protocol or printer call. Installed plugin configuration only
exposed stdio; no supported authenticated HTTP client was available to that
diagnostic. It did not inspect credential stores or probe protected endpoints.

The separate service owner ran
`uv run --no-project scripts/u1_service.py status` (exit0): public and dashboard
were loaded, healthy and integrity verified at0.4.17/schema17, observation21/
Camera17. The installed manifest SHA256 still matched
`2866f33a0767e639b789470ac7a1338eee6426098e5630f193d32dc97ecfa9da`.
No service restart was needed or performed. Primary's client initialization
attempts failed: app-server proxy initialization timed out, the documented
WebSocket control connection hung up, and Computer Use denied Codex access.
No reload request was sent. These failures remain private evidence and do not
prove a product-server defect. The tool subsequently appeared in the host
catalog; the cause of that change is unknown.

Primary invoked the actual remote V2
`mcp__codex_apps__u1_print_studio_get_print_monitor_snapshot` exactly once with
`{camera:"snapshot", expectedRunToken:null}`. It returned isError=false, fresh/
new/complete connector-receipt telemetry, a strict structured/text envelope and
one JPEG. This was real one-shot observation, not a synthetic fixture. Primary
received and visually inspected the image: interior/toolheads were visible,
while the bed and printed parts were outside the visible evidence. The returned
run remained unbound/no_active_run with null token and unknown artifact hash.
The terminal checklist supported the reported state, while boundRunVerified
remained false. No physical print-success or native-run verification follows.

A separate verifier used the saved response, without further printer calls:

- Pinned Bun1.4.0 with `--no-env-file --config=/dev/null run` executed a private
  validation script importing the existing production input/output schemas.
  Strict parsing, exactly one text and image block, parsed structured/text
  equality, JPEG saved-file/content/declared-length equality and timestamp
  ordering passed. Fresh/new/complete and unbound/null/unknown distinctions
  passed. No build, dependency installation or full suite ran.
- `sips -s format png` decoded the153786-byte JPEG;
  `sips -g pixelWidth -g pixelHeight` on the resulting PNG returned1920×1080.
  The verifier checked encoding and evidence consistency; primary owns visual
  interpretation. Camera/telemetry association remains the same request time
  window, not atomic acquisition.

Raw response, JPEG/PNG, commands and diagnostic results stay in ignored private
evidence; no filenames, temperatures, printer identifiers or image bytes enter
tracked records. Only current documentation records changed. No reload, service
restart, deployment, configuration/auth/Tailscale/plugin change, printer control
or continuous polling occurred. No active monitoring, durable supervision,
whole-print continuity, phone acceptance or physical completion is established.
The one-shot request is complete; await the next user task.
