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
complete; separate independent review and guarded delivery remain pending. No durable daemon, external notification service, active monitoring,
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

Freeze the candidate for independent exact-source review and fresh targeted
verification. One owner performs the unchanged mandatory full validation in the
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
