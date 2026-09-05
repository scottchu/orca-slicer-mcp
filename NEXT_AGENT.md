# Next agent

## Immediate: review the exact merge-only integration candidate

Independently review the integration of `origin/main`
`6f53a6435a3f38a92e4d2b4713ae025a97d7097a` into the private Lab branch from
pre-integration head `76bf955d583ad3ab98a20c80324c795be2c9da01`. Verify the merge has two parents,
the 60-path application manifest remains
`e5886589ff7dc60ba0fe867956b3e11e490f941d63cc0ccda3f09fb784307770`, and only
durable-record identity binding follows the application freeze.

The hard preservation gate is exact, not visual inference: current production
`Inline.svelte`, `Stack.svelte`, widget entrypoints, `app.ts` registration and all
seven production widget resources must remain byte-identical to `origin/main`.
The private registry alone must import additive `LayoutInline.svelte` and
`LayoutStack.svelte`; the Lab MCP factory/tool/resource must remain absent from
production registration. Confirm the upload-receipt decision remains 0048 and
the Lab records are uniquely renumbered 0049-0053 without lost history.

Do not run `scripts/u1_ship.py --execute`: it intentionally continues from merge
through deployment and both production restarts, which the user's one-off
merge-only authorization prohibits. Do not push, open a PR, install, deploy,
restart production or preview, or mutate auth, Tailscale, plugin or printer state.
The general shipping policy is not weakened; any later release returns to its
normal guarded path.

## Preserve the reviewed mobile alignment candidate

Preserve, do not silently extend, the CSS-only candidate at 29-path application
manifest `b98548ad5ac3a56388bda6ba12216a4f4dd0a63449d8fd3ea3b56044579d1279`.
The exact compiled identities are 115-file Kit
`300d0b95c2560addc40c2ada30dbfafe0d01dec1ebb5e4939791f69939b324be`,
101,404-byte HTML `80a495c99aa254757c22cd853c68f8c1dc7ba4d7950efbbc47b191d6698e1ea9`
and 167,441-byte MCP
`8e37ea45b8e47d9652374cf4001908a39b220dd559d2562aecd7231396b31086`.
The target-versus-fresh-Unknown normalized comparison is `47bf2cd6...`; the
Smart/Explicit 390px Card crop is byte-identical at `513cf9e8...`.

Independently verify hero/quiet Reading alone uses a 32px icon column, existing
32/24px glyphs, 8px gap and zero content padding, while default Reading remains
44px/12px/12px. Every hero/quiet local content anchor must be 40px. At 390px
the two support Columns and direct Readings must have equal height; icon and
complete-content center deltas are <=1px; glyph/copy is 8-12px and stays below
20px sibling/group spacing. At 320px and 390px/200%, require exactly 20px
between intrinsically sized stacked Reading boxes. Confirm 720px/100% remains
3+3, identity gap remains 12px, Smart/Explicit geometry matches, state bounds
remain within 1px, and loading/error motion semantics stay neutral/stable.

Independent screenshot-first review **APPROVES** this exact identity with no
actionable P0-P2 finding after reopening the normalized same-state comparison,
state/responsive captures and production Heads precedent. `design-qa.md`
preserves the superseded **BLOCKED** history beneath that final disposition.
Independent source/protocol review also **APPROVES** and confirms no DSL,
schema, view-model, data, MCP factory/registration or canonical-spec drift.
Author evidence passes 114 UI tests, 23 server tests/474 assertions,
TypeScript/Svelte, deterministic artifacts and 12/12 Chrome.

Preserve the accepted private preview at clean documentation head `581c8b0` /
application commit `73cc1b9d`, PID 20816. Local 4200 and existing Tailnet 8451
serve exact 101,404-byte `80a495c9...` HTML plus 23 matching immutable assets;
nine closure cases per origin pass. Raw Tailscale Serve/Funnel hashes remain
`2eb56116...` with terminal LF / `063ecd46...` without; production PIDs 834/841
remain unchanged. Do not restart, PR, merge, deploy or touch production,
Tailscale, authentication, printer, Camera or plugin installation. Actual
Safari/iPhone, mounted ChatGPT, screen-reader and user-outcome gates remain
unproven. The user's final clarification was that this was both proximity and
alignment: do not regress icon/copy grouping or rely on leaf reserve for
between-item space while preserving only the shared centerline.

## Preserve the reviewed smart-grouping experiment

Decision0053 and the 28-path private-Lab application on
`codex/u1-composable-ui-experiment` have independent source/protocol and
screenshot-first design approval. Its exact application manifest is
`bc992eac167d1119bdda2289a46ac9e34f4978dcdd0d18cd7cfe19d379cab04b`;
115-file Kit manifest
`ee08234a369fc24b5e588b165fdd211380c040e4e5b3c02cad96875722abdec8`;
101,404-byte HTML
`243d84c6c237b3e4fb85c33b5c172b4a11bfe71c222adaebe97364ef8a754bb3`;
166,948-byte MCP
`ef6c06df914c9fc3c229a9de61421320f56f32376cbe460fee195b136715fb69`.
Author gates pass 114 UI/shared tests, 23 server/MCP/preview tests with 474
assertions, both compiler/contract gates, deterministic MCP, twice-reproduced
Kit and 12/12 isolated Chrome.

Source rereview **REQUESTED CHANGES** on superseded application `8a9cb04a...`:
its broad Group minimum rejected a valid one-Row explicit `2 + 2 + 2` layout.
The renewed registry has distinct executable child policies for identity,
smart summary, explicit summary and resolved summary. Verify exact two-child
identity and three-child smart summary are unchanged, while explicit/resolved
summary accepts one to six Rows. The focused regression must preserve authored
fan/temperature/filament order and call each source once; empty/seven-Row and
shortened identity/smart forms must reject before acquisition.

The renewed exact `bc992eac...` candidate closes that finding. Independent
source/protocol review approves fresh 114 UI tests, 23 server/MCP/preview tests
with 474 assertions, TypeScript/Svelte contracts, 22 invalid zero-reader cases,
the one-Row positive, 14 envelope tampers, exact artifact identities and
production isolation. Independent screenshot-first design review also approves
the exact source-valid candidate with no remaining P0-P2 finding. Preserve both
earlier failed-candidate histories; they are not waived by the final approval.

Preserve exact twelve-entry pure/client parity and static imports. `Group` must be
the semantic role; `Row` and `Column` must be layout roles. Each needs strict
spec/resolved props, executable child policy, independent exact Svelte props and
a typed registry adapter. `PresentationNode.svelte` may branch only on
registered root/semantic/layout roles, never concrete element names. The exact
rule literals are `identity-packed-v1` and `summary-grid6-v1`; they intentionally
version code-owned algorithms without changing schema version 2.
Directly verify the exact typed nested schema boundaries: Column, Row,
identity Group, smart-summary Group, explicit-summary Group and their resolved
counterparts must each have `z.ZodType` annotations with child schemas bound to
the corresponding alias. Column policy must accept only temperature, filament
and fan leaves; the source/type drift test must retain these annotations and
semantic/layout roles.

Adversarially verify the two-stage resolver. Semantic grouping must run first:
identity is exactly Title then HeadStatus and summary is temperature, filament
and fan exactly once with no caller appearance. Smart input may reorder leaves
but must normalize to temperature, filament, fan. Explicit placement may only
be a six-track grid with one to six Rows/Columns, one leaf per Column, spans
1..6 and every row summing to six. Reject holes, starts, offsets, row spans,
overlap, caller breakpoints/style/CSS/HTML/JavaScript/path/URL before acquisition
with `readerCalls=0`. Smart/Explicit must preserve semantic and geometry parity;
all three valid readers are called once; envelope tampering with relation,
layout source/rule, order, span, appearance, receipt, timestamp or provenance
must fail.

Inspect `design-qa.md` and the ignored combined comparison
`plugins/u1-print-studio/app/test-results/composable-lab-v2/comparison-smart-target-vs-implementation.png`
(`c2a096aa...`). The preceding independent design review remains durably
BLOCKED against superseded `988b90bc...`: it found a three-line quiet filament
label. The renewed candidate shows `Configured color` in at most two lines at
390px while an accessible `Configured filament color` names its fixed group.
Confirm default/A still visibly
renders the original full label, the shared Swatch contract change is exact,
and no wire copy option exists. Smart and Explicit should keep Title/status packed left,
temperature full-width, and filament/fan 3+3 at 390/720 normal text. Intrinsic
readability must stack the pair at 320 normal text and 390/200%, including for
Explicit. Known/loading/error/partial topology and height remain stable; loading
alone animates. Confirm the neutral Card has no tint, gradient, divider, Table
or printer icon. Existing A hashes (`7e9df236...`, `7bdc296...`, `cd278ddf...`)
and balanced B (`dfbf87e3...`) must remain unchanged; new Smart and Explicit
hashes are `d99581cf...` and `8bc2a4db...`.

The isolated MCP must remain `0.0.5-provisional`, one tool and immutable
resource `ui://u1-print-studio/experiments/composable-lab-v2-r3.html`, with a
negative production factory/inventory test. The subsequently authorized
preview-only restart moved the existing job from PID 86363 to 73981 on committed
source `79112a5`; local 4200 and existing Tailnet 8451 serve exact 101,404-byte
`243d84c6...` HTML plus all 23 matching immutable assets. Serve/Funnel hashes
remain `2eb56116...` with LF and `063ecd46...` without; production PIDs 834/841
are unchanged. Preserve this runtime. Do not touch production, printer, Camera,
authentication, Tailscale, open a PR, merge, deploy or install a plugin. No Safari/iPhone, mounted ChatGPT,
screen-reader, real-printer or user-outcome evidence exists. The MCP lifecycle
safeguard plan remains separate and unimplemented.

## Preserve the reviewed additive balanced candidate

Decision0052, screenshot-first design and independent source review **APPROVE**
the 32-path application manifest
`e225b0c4966177203461bb94685777898b39e4db014821ccfc5c9c3741aa0e95`,
115-file Kit manifest `5c22955182f278d4c934be1cc3d6f5099bb556109353098bff8593d942f9fd13`,
66,589-byte HTML `b212f9696c4ed5d0236edd17d4b5b0a9fbc8e6226d4ac21f90c7fafea769e509`,
and 154,183-byte MCP resource
`b1b3eb179fdafeff20c564db37f42873cfbae4ba7ac6168a9f70d23dbcf33890`.
Initial author gates passed 111 UI/shared tests, 21 server tests with 432
assertions, both compile/contract checks, deterministic MCP, twice-reproduced
Kit and 9/9 Chrome. After review found stale title-only Card schema casts, the
full Card child aliases now own both boundaries; a drift guard retains Inline.
Renewed affected evidence passes 16 client tests, 17 server/MCP tests with 114
assertions and TypeScript, with fresh MCP/Kit output byte-identical below.

The exact ninth registered type is common layout `Inline`; its
exact child order is `[Title, HeadStatus]`; Card slots, recursive duplicate
fields, closed tokens and correlated normalized appearances reject adversarial
inputs before readers. Confirm the balanced spec is neutral and additive, title
and badge share a row at 390/720 100%, 200% wrapping starts cleanly, temperature
is the full-width hero, secondary content collapses at 320 and 390/200%, and no
icon placeholder, divider, tint, gradient, Table, Row, arbitrary span/breakpoint
or renderer type branch exists. Existing A canonical hashes and rendering are
unchanged. Independent adversaries reject path/style/reversed Inline/duplicate
status before acquisition with zero reader calls, call all three readers once
for valid balanced input, and reject resolved order/mode/provenance tampering.

The independent visual disposition has no P0-P3 finding. Combined comparison
SHA-256 `96870d17…`, implementation crop `b8bd858a…`, and 200% capture
`01299e17…` remain attributed run evidence. No independent browser rerun or
`ui:check` occurred after the runtime-erased cast fix; author reconstruction
proved Kit/HTML/MCP byte identity.

Preserve the independently accepted live preview at source `f4a56bc…`, tree
`ab3d4fec…`, PID 86363. It runs the exact dedicated Bun script with no children
and only loopback 4200. Local and Tailnet 8451 serve 66,589-byte `b212f969…`
HTML plus 23 exact assets; closure SHA-256 is `52e80455…`. Nine focused HTTP
cases per origin pass: one valid empty-body HEAD plus eight fail-closed 404
adversaries. The observed Tailscale baseline is `2eb56116…`
with LF / `063ecd46…` without it; earlier recorded hashes were stale, while 8451
remained solely Tailnet HTTPS `/` to loopback 4200 with Funnel off. Production
PIDs 834/841 and listeners 8787/8789 plus 8788 are unchanged.

At 390x844, independent Chrome fallback inspected Known `3c92d790…`, Ambiguous
`8eb51e8f…`, Loading `c2f7bc04…` and Error `760f4233…`. Card/header/lead geometry
is stable, no overflow occurs, fan ambiguity is truthful, and loading/error
motion is correct. Do not alter 4200/8451, Tailscale, auth, printer, Camera,
production registration, open a PR, merge or deploy without new authority. No
Safari/iPhone, mounted ChatGPT, screen-reader, printer or user-outcome evidence
exists. The lifecycle safeguard plan remains separate and unimplemented.

## Preserve the accepted build-time registry experiment

The current commit on `codex/u1-composable-ui-experiment` descends from base
`cdfb9ac35f3bbb3cbabe75490db3fa7b4498ca5b`. Decision0051 and the
top sections of the active HANDOFF/VALIDATION describe the new candidate. Its
32-path application manifest is `af2099289ef1beefe59b6e10664a6933e89e2902fdacf68f50d65fc8f620ee2f`,
separate 113-file Kit manifest `aaa9b6a3…`, 49,994-byte Lab HTML SHA-256
`e85e3d1fc0673a0b86454f1616d043ed6d26708cd35403c070923493edafa28d`,
and 145,152-byte MCP resource SHA-256
`c8de7c1aa94e2f8dfa11471d8e348d6f8ea7929b7c981f8c0fb816aad7cc0e09`.

Screenshot-first UI/UX and independent exact-candidate review both **APPROVE**
that application identity. The two earlier review rounds requested executable
child-policy authority, independent component props, registry source mapping,
complete Fans consumer coverage, and finally removal of concrete renderer
dispatch/all-optional invocation. The accepted renderer now gets constructor,
props and children from typed entries and recurses by registered role only.

Design found that supplied old Tailnet screenshot `cc6974e3…` exposed a
temperature reserve outside the icon, visually biased content upward and could
imply progress. The accepted author/design 390px run `6482e985…` has no fill,
centers all four groups and preserves consistent spacing/hierarchy. Its direct
320/390/720 and 390/200% inspection found no clipping, overlap or overflow,
atomic `220° C`, sensible wrapping, healthy larger Grid and stable neutral
loading/error geometry without stale telemetry. Independent review freshly
passed 107 UI/shared tests, 20 server tests/405 assertions, both compilers/
component contracts, deterministic MCP and Kit reconstruction, 6/6 Chrome, a
zero-reader retired-fill/component-path adversary and the exact eight-entry
adapter walk. Its independent 390px run was `452a10c5…`; keep both PNG hashes as
separately attributed run evidence rather than deterministic artifact identity.

Independent runtime review **APPROVES** the current accepted preview from source
`2ffc29b7…`, tree `dbdae72e…`, PID 90967. Preserve the existing dedicated
worktree command, one loopback 4200 listener and Tailnet 8451 proxy. Local and
Tailnet serve exact 49,994-byte `e85e3d1f…` HTML and 21 byte-identical assets;
170 ordinary, 12 encoded/traversal/asset and eight raw-protocol cases are closed.
Serve/Funnel semantics are unchanged (`d52d4444…` including terminal LF,
`a255c74d…` without it), and production PIDs 834/841 remain preserved.

The fresh 24-case Tailnet Chrome matrix covered three shapes by four states at
390px and 100%/200% text: 0 state-height/overflow/label drift, maximum 0.0078125px
visible-center drift, metric value text scaled 20px to 40px, atomic target/unit, truthful
`Unknown`, neutral animated loading/static error, no Table/Row/percentage
background, and zero scenario requests/errors. A reviewer-owned ephemeral
102,274-byte screenshot SHA-256 `1639ae595ae5e8cb5600e5a5cdc9cdeb49960d2640a99a53f39e2981f2d849d0`
was centered and unclipped. Preserve the two preliminary harness false failures:
compact intentionally shows status plus filament only, not fan or four skeletons.

Do not restart/repoint this job or alter production registration, printer,
Camera, auth, Tailscale, open a PR, merge or deploy without new authorization.
The descriptor lifecycle safeguard plan remains a future host change. Runtime
evidence is not iPhone/Safari, mounted ChatGPT, screen-reader, public-Internet,
printer/Moonraker or user-outcome acceptance.

## Preserve the reviewed committed content-owned percentage candidate

Preserve the reviewed 37-path application manifest
`5d6c4ea093bd41ac6abd0a433f03c66ff393caa535facf15da59a248e7698aad`.
Review was bound to parent `dca554a18b18f1e34b3b03020bad7de695909f72`
plus its uncommitted application diff; those exact bytes are committed as
`0f5a0d4c4e6a2ac6417b78365d0ac96c8cff60ca`, tree
`fc6fdd48864e90a5d3ee9e808cf84f6a9a13236d`.
The AST is unchanged: only `PercentageFill { child: HeadTemperature }` owns the
typed actual/target decoration. Its new constrained content surface leaves the
icon and outer structural reserve unpainted and fixes 12px inline/8px block
inset without accepting CSS, colors, values or expressions.

Independent review first returned **REQUEST_CHANGES** after its isolated
candidate build exposed stale immutable-server pins. That build overwrote only
the ignored `build-kit-composable-v2`; the live process had preloaded the older
bytes and stayed untouched. Author validation reproduced exact
`Composable preview artifact identity mismatch`, then pinned the actual build
manifest `4b4209f994a179709974fcc10094fa6075388d3e139fb843ed820c0ad4aa8f38`
and hydration node `/_app/immutable/nodes/1.BHy6paUx.js`. The actual Lab HTML is
51,180 bytes at SHA-256
`5c3f2731223e7adbfeda48ba667826b49f02aa190a3dacb511dd2af71d30e6de`;
the unchanged 146,166-byte MCP resource is
`f865908ec6c0bbb3d9065cc843398528173ae34af1d4943e50a1657df34a501c`.

Renewed author checks pass 27/27 client tests, 20/20 server/MCP tests with 410
assertions, TypeScript, Svelte/component contracts, deterministic MCP
verification and 6/6 Chrome cases through the exact dedicated immutable server.
The refreshed focused test requires the new hydration node and rejects the old
one. Screenshot-first design and renewed independent verification both
**APPROVE** this exact application/build/HTML/MCP identity. Design measured 90
width/text/shape/state cases with 0px content-bound, label and state-height
drift, exact reserve/insets, no overflow/cross-cell paint and correct neutral,
motion and forced-color behavior. Independent verification freshly passed the
20/20 server/MCP, 42/42 combined shared-consumer, TypeScript, Svelte/contracts,
deterministic MCP, 6/6 Chrome, byte-identical same-path build and 4/4 focused
preview gates. No source review needs repeating unless application or build-
input bytes change. Do not restart or repoint the live 4200/8451 preview:
it now serves the reviewed 51,180-byte `5c3f2731…` HTML and all 23 assets from
clean source `c19e8adcae6e29a6179cb56d99f83ceb7d234374`, tree
`4baf879caa2858d29e6e3c4276a718a572d37526`, through the existing launchd job.
The only runtime mutation was `launchctl kickstart -k` for that exact job; no
Tailscale configuration changed, and raw Serve/Funnel SHA-256 remains
`d52d4444…` with no 8451 Funnel.

Independent runtime review **APPROVES** this exact running identity after its
fresh 120-case local+Tailnet matrix. Standard Upgrade returned empty 404 at both
origins. Preserve the narrower transport observation: immediate
`socket.end(request)` half-close returned empty local 404/64 and Tailnet proxy
502/84, with no Lab/asset marker; it is fail-closed proxy transport behavior,
not a server safety blocker. Acceptance remains limited to the synthetic
private Lab. There is no iPhone/Safari, phone/device, mounted ChatGPT host,
screen-reader, live printer/Moonraker, Camera, auth, public-Internet,
production/deployment or user-outcome evidence.
This subsequent documentation correction leaves application/build/HTML/MCP bytes
unchanged and does not broaden the approvals.

## Preserve the approved authority-free v2 private preview

The prior v2 runtime was withdrawn after independent review found that the
generic fixture exposed dashboard routes and could fall back to the real camera
adapter when its camera dependency was omitted. The reviewer did not invoke the
camera. Only HTTPS 8451 and `com.openai.u1-composable-v2-preview` were removed;
4200 was freed and the then-current Serve/Funnel state returned to `d5e0f1b6…`.
Subsequent independent review found the v1 generic fixture likely shared the
same camera fallback; it was not invoked. Endpoint-only cleanup removed 8450
and `com.openai.u1-composable-preview`. At that cleanup checkpoint, ports
4199/4200, both preview labels, and TCP/Web/Funnel 8450/8451 were absent. Raw
Serve/Funnel status was the exact
pre-v1 `fab7b9df…` baseline; production jobs and TCP/Funnel 443/10000 remain.

The current committed repair is source
`ed504c7a9bbded66831ac35fb5cf2531a929d2cb`, tree
`e33d56896994bd9571a6c0b2a73e3afbb9b8ea5e`. Its dedicated
manifest-verifying immutable server is at
`plugins/u1-print-studio/app/scripts/serve-composable-preview.ts`.
It serves exact `GET`/`HEAD` for `/dashboard/lab/composition` and the closed set
of required hashed assets only. It does not import production entrypoints,
dashboard tools, MCP, observation/printer, camera, auth, configuration or child
process code. Ordinary parsed non-allowlisted origin-form paths and methods are
404; focused tests include static
import-graph guards, traversal/encoding adversaries and an outbound canary. An
architecture exact gate found that its first implementation reread files after
manifest validation. The renewed implementation validates and serves cloned
bytes from one in-memory snapshot with no post-validation filesystem read. It
also explicitly denies CONNECT/Upgrade and returns deterministic 400/close for
parser-invalid traffic; no raw-protocol adversary can receive page/asset bytes.

Candidate identity is the 35-path application manifest
`c8c24103972ee7c0304b7b80c79206bc2eb65a14cde239224716480673a31148`.
The v2 build manifest `70f99dc83b1c77dd8ef617848679dc2004bd0344474d16d0b6b88aff0b35b34e`,
Lab HTML `e4be14ad…`, and MCP resource `170fb8f1…` remain unchanged. Author
checks pass 10 client tests, 20 server/MCP tests with 408 assertions,
TypeScript/Svelte/component contracts, deterministic MCP verification, the
separate build and four Chrome cases. Architecture and independent exact-source
review approve the `c8c241…` application identity committed by `ed504c7…`.
Those source approvals preceded the separately authorized runtime launch.

The exact committed preview now runs from head
`c44f4c368848a17549dd94ae2a3383fa25420c6e` under
`com.openai.u1-composable-v2-preview` on loopback `127.0.0.1:4200`, with only a
Tailnet HTTPS 8451 root proxy and no 8451 Funnel. Local and Tailnet Lab HTML is
the exact 51,156-byte `e4be14ad…` artifact; all 23 required hashed assets are
byte-identical. Raw current Serve/Funnel status is `d52d4444…`; pruning only
8451 restores exact baseline `fab7b9df…`. The v1 4199/8450 preview remains
offline, and production jobs plus Funnel 443/10000 remain unchanged.

Author, screenshot-first design and independent runtime verification each
**APPROVE** that exact running identity for the private synthetic Lab. Their
fresh forbidden-route/method/encoding and raw-protocol matrices found no page
or asset exposure outside the allowlist; runtime inspection found zero child,
outbound or sensitive-file access. Browser checks at 320/720 and 200% text
covered every client-local state with zero new network requests, zero overflow
and 0px state-height drift. Do not repeat source review unless application
bytes change, do not use `serve-kit-fixture.ts`, and do not broaden or restart
the preview. If cleanup is explicitly authorized, remove only this endpoint and
job with:

- `Tailscale serve --yes --https=8451 off`
- `launchctl remove com.openai.u1-composable-v2-preview`

The approvals do not establish real-printer, Moonraker/Klipper, Camera,
auth-flow, public-Internet, phone/device, screen-reader, production or user-
outcome acceptance, and do not approve this later records-only commit.

## Preserve the reviewed v2 presentation-AST private-Lab experiment

The UI-003/F0 v2 candidate has three exact-identity approvals at its 33-path
application source-set manifest
`a6cfa40f0f23e62832fa7696a41472c10097b8bbc36141cd5f87af2a4deb2580`
and isolated 145,363-byte v2 MCP resource SHA-256
`170fb8f1dc24cb2a6059b04cc22bce15fa018cbe823dea45f9f1945d94e897b4`.
Author checks pass 10 client tests, 16 server/MCP tests with 92 assertions,
Svelte/TypeScript/component contracts, deterministic MCP verification, the
separate Kit build and four Chrome cases.

Screenshot-first UI/UX **APPROVES** the exact identity: all 60 combinations of
320/720, 100%/200% text, card/compact/larger and known/loading/error/partial/
ambiguous measured 0px renderer-height drift and zero overflow. Skeleton minimum
was 64.58×17.5px; loading animated, error was static, reduced motion removed
animation, h1 was 56px over h2 at 44px, target/unit remained atomic, only Card
had a border, forced colors were neutral, and no reserve/sample sentinel was
present. Design report SHA-256 is
`64dfadbf482d6f10a85131404f5a354e3ce8ba18b99cdb1c91e1b34ab701c322`.

The project-scoped `printer_domain_expert` **APPROVES** the same identity after
fresh 16/16 server/MCP with 92 assertions and 10/10 client tests. It verified
T1/T2-title rejection, duplicate/direct-plus-wrapped field rejection, exact
tint/evidence/visible-color correlation, error/loading rejection, target-zero
known with neutral fill, all fan truth states, one read per source, distinct
timestamps, and partial healthy data with a static unavailable-fan skeleton.

Independent verification **APPROVES** the same identity after 27/27 focused
composable/percentage tests, 16/16 server/MCP, TypeScript, Svelte 0/0,
component contracts, byte-exact temporary MCP reconstruction and a fresh Chrome
matrix. It confirmed production-negative registration/imports and unchanged v1
resource/build/live response. One initial browser assertion expected a compact
partial skeleton despite compact not depending on environment; its corrected
dependency-shaped assertion passed and task-owned children were cleaned.

Earlier rejected manifests and failures remain in VALIDATION and must not be
treated as approval evidence. The accepted boundary is synthetic private-Lab
learning only. Three current Title tokens were rendered and two only
source-inspected; there was no screen reader, mounted host, phone/device, public
Internet, live Moonraker/Klipper, real printer, user outcome, production, or full
repository/browser-regression acceptance.

Keep scope fixed to T1 status, actual/target temperature, configured filament
color and fan relation. `PercentageFill` accepts only the typed temperature
leaf and derives decoration from validated actual/target evidence through the
common percentage primitive; invalid relations stay neutral. Do not add
arbitrary markup/style/value/expression inputs. Do not implement DataTable,
Queue, History or Camera. DataTable is only a future Queue/History hypothesis
pending its own contract and ADR.

Treat the percentage background as Lab-only. A production fill would require a
separate semantic contract because it could otherwise be mistaken for print
progress, heater authority, safety margin or target attainment.

The reviewed v1 bytes at source `518c644` remain historical artifact evidence
only. The generic preview is offline after the safety cleanup. Do not rebuild or
relaunch it with `serve-kit-fixture.ts`; any future v1 preview requires its own
authority-free immutable server and exact review. No printer, authentication,
runtime/Tailscale, production, PR, merge or deployment action belongs to this
experiment.

## Preserve the historical v1 artifact and keep its preview offline

Resume from decision0049 and the active iteration records. The frozen
source is `518c6440db1d624361a1a804754590def3e330e2`, tree
`a79032b72e04cab6d4dc32a26c4db47024aad5c3`; its application source-set
manifest is
`7e77c57543784bb223842b90ce57b9ae4555876b0a1f80225cc45c3e192578bd`;
the isolated 137,936-byte MCP resource SHA-256 is
`6103ba597d239299ed0845a704720f545ceee27802b7f1cfc4ae6d6f2aec9fe6`.
Independent `printer_domain_expert` review approved prior manifest
`4437e4f9f032cfffef3405227b7775c3f40dfb3a9326858bee478b2a826115fc`
after two request-changes rounds. A later formatting-only generator/source
cleanup produced the current identity and renewed every affected author check.
The project-scoped `printer_domain_expert`, acting as independent read-only
runtime verifier, now APPROVES the exact source/tree for this tailnet-only
preview. VALIDATION contains the final 8 client, 13 server/75 assertion,
checks/builds and four-browser-case evidence.

The withdrawn synthetic fixture previously returned local/Tailnet body SHA-256
`30d2d4b471f5872252a18c2d564faef025f5417098caa739c29d8e300cb1a6f5`.
Independent review later found its generic host likely shared the camera
fallback; the reviewer did not invoke it. Endpoint-only cleanup has already run:
8450 and `com.openai.u1-composable-preview` are removed, and 4199 remains free.
That cleanup restored raw Serve/Funnel baseline `fab7b9df…`; the separately
approved v2 runtime now accounts for the current 4200/8451 addition described
above. Production jobs plus 443/10000 remain preserved. Do not relaunch the
generic fixture or use a Serve/Funnel reset.

Treat it only as an isolated UI-003 private-lab experiment. Preserve fixed T1,
the four closed domain leaves/common layout nodes, strict correlated envelope,
deduplicated readers, per-value provenance/timestamps, `Unknown` relations,
stable loading/error structure, private route, production-negative inventory
and Lab-only MCP factory. Do not register it in production or infer live data,
printer truth, a general DSL, cutover, mounted-host/device acceptance or user
outcome. No PR, merge or deployment has been authorized for this experiment.

Decision0050 preserves the user's future Camera direction but no Camera files
changed: later move current top-right information plus loading/error messaging
into bottom overlays within dynamic media through a separate screenshot-first,
independently reviewed migration. Retain current media/session/control/
frame-evidence semantics until that migration is accepted.

Next action is user/product review of the provisional learning, if requested,
then a separately scoped decision for any production adoption. Current runtime
evidence came from the same enrolled host and proves no browser/device visual,
public Internet, real-printer, Camera, auth-flow or user outcome. Do not change
printer, production service, authentication or other Tailscale state.

## Immediate: deliver the accepted internal foundation through a PR

Use combined candidate `eb38763fc92579563dcad28fa3f83494b28b591b`, tree
`d2e9a0807deba19e7665543e570d31f550f0d763`. Independent documentation/skill
review APPROVES it with no blocking or high-severity finding and confirms that
application source remains exact `f90e0b54fe3a5e4fe9a1e62b9ad766afe615c2ff`,
tree `c5be31e7c744c70826a4cd2d98904bc20b4259f9`. The sole-owner full repository
gate passed exactly once with 627 Vitest tests/60 files, 251 Bun server tests/32
files/2,798 expects, 72 Python tests, Svelte zero errors/zero warnings and
repository contract OK. The worktree was clean and identities unchanged after
the run; exact review and command evidence is in VALIDATION.

The next action is PR review and repository delivery of this internal
foundation. This records-only tail leaves application, tests, contracts, skills,
dependencies, configuration and generated assets unchanged, so retain their
bound evidence without another full run. Do not deploy services or contact a
printer/network. Durable stores, a supported CLI/skill adapter, real uploader,
target-parsed HANDOFF-007 evidence, public mutation and start remain later
separately authorized work.

## Accepted core to preserve in delivery

The user selected the narrow deterministic seam proposed in
[decision 0048](docs/decisions/0048-guard-upload-with-content-bound-preparation-receipts.md).
The transport-independent `validatePreparedArtifact` and guarded
`uploadPreparedArtifact` pure core is accepted at
`f90e0b54fe3a5e4fe9a1e62b9ad766afe615c2ff`, tree
`c5be31e7c744c70826a4cd2d98904bc20b4259f9`. Preserve its exact trusted-receipt,
opaque-ID, runtime-snapshot, server-clock, one-use authorization, idempotency,
first-positive-extrusion/tool and truthful upload-outcome semantics.

The preparation skill retains a matching-edition preview and explicit user
correspondence `PASS`/`FAIL`. Local embedded-image verification remains before
upload; target-parsed thumbnail verification remains after upload and before
separately authorized start. Upload, start acknowledgement, observed printing,
monitoring, telemetry completion, camera evidence and physical acceptance stay
distinct.

Author TypeScript, combined 32-test/231-assertion fixtures and the focused
one-test/20-assertion MCP inventory guard pass. Independent architecture and
domain reviews APPROVE the exact source; exact evidence is in VALIDATION.

The next implementation slice after delivery needs its own user selection and
decision: inject durable stores and expose the core through the first narrow
trusted CLI adapter.
It must accept only opaque IDs and must not add a raw path, caller-built gates,
manual upload, public MCP mutation, generic printer transport or start action.
No such adapter, real uploader or target-parsed HANDOFF-007 receipt exists now.
Do not mark decision 0040 end-to-end enforcement complete, or infer printer,
network, start, deployment, print-quality or physical acceptance from the
accepted pure-core fixtures.


## Current deployment: PR106 host fullscreen and packaged body insets

PR106 merged as `0660a07fb1f14a67783e7474172bda3630d36ba6` and shipped release
`20260903-0660a07-pr106-20260903T100036-471de8`. BOTH services restarted and
verify loaded/healthy/integral at0.4.12/schema16/observation18/Camera14. All72
static and74 security checks pass; preservation=true, rollback not needed.
Exact review, receipt and scoped postverification are recorded in VALIDATION.

The release implements host-acknowledged fullscreen with persistent media and
corrects packaged legacy body insets using existing tokens. Installed-byte
Camera fullscreen and selected Progress layout/recovery checks pass with a
synthetic MCP host; actual phone fullscreen remains unverified.
C08 Live reliability and baseline Retry→Refresh focus loss remain open. The
selected Progress layout/recovery checks do not accept its deferred redesign.

Preserve host-owned composer/chrome, no OS-screen promise,55 IDs, two current
resources without aliases, eight active legacy renderers, monitor workflow,
Progress no-action, F07 discussion, separate c6 and unfinished Queue/Fans/Job
History. This rollout tail changes documentation only; no application rebuild,
full regression or service deployment is required for the tail.

## Historical deployment: PR104 Camera and current-only widgets

PR104 merged as `162dc68d0945feb4b3d2de7b638479560f2604d9`, preserving exact
reviewed `30e0649` tree, and is deployed. BOTH services restarted and verify
loaded/healthy/integral at runtime0.4.11/schema15/observation17/Camera13;72 static
and74 security checks pass, preservation is true and rollback was not needed.
Scoped postverification passes on installed Camera/Jobs HTML with synthetic MCP
data, plus exact served resources and retired-route rejection. This is not actual
ChatGPT phone or real Camera acceptance. Evidence is in VALIDATION.

Current resources are observation and Camera only, with two public/six app-only
tools; retired aliases/assets/routes stay removed. Camera defaults to quiet Auto,
uses Auto/Live with edge-to-edge media and the safe bottom-left failure reason.
Known historical deployment profiles remain strictly verifiable without restoring
public widget compatibility. All55 IDs, monitor workflow, eight active legacy
views, Progress no-action, unfinished product work and existing layout debt remain.
C08 phone reliability and host fullscreen are unresolved; Screen Sharing stays
paused. The completed PR104 records-only tail changed no application bytes and
needed no new deployment or full regression under decision0028.

## Earlier accepted source: Camera and current-only widgets

Exact `aaaf0a56a0df944a19384822decfc62712021c51` is independently accepted.
The source has only observation17/Camera13 resources and two public/six app-only
tools. Thirty old URI aliases, the two status compatibility tools, old Camera
HTTP route and18 obsolete files are removed; `/widget` serves current observation.
The eight legacy renderers used by current observation remain active. Deployment
backups, other worktrees and every shipping/integrity/security/preservation guard
remain intact. Required and scoped validation evidence is in VALIDATION.

Camera defaults to quiet Auto with an88px-by-44px Auto/Live icon Switch. Its
edge-to-edge media has no footer/Refresh; the persistent safe failure reason is
bottom left, controls bottom right, with stable narrow-layout separation.
Service-owned bootstrap, failure diagnostics and unchanged deadlines follow
CAM-008/decision0046. Progress's2px failure allocation and Bed's failed-renderer
release were scoped current-route fixes, not the deferred Progress redesign.

At this earlier source checkpoint, the next steps were documentation-only exact
review, guarded shipping, BOTH restarts and installed-resource verification;
PR101 was then deployed. PR104 completed those release steps as recorded above;
actual-device acceptance remains separate.
Retain all55 IDs, monitor workflow, current eight legacy views, unfinished Queue/
Fans/Job History, Progress no-action, F07 discussion and separate c6. C08 phone
reliability remains unresolved; host fullscreen is unimplemented, Screen Sharing
paused, and existing `.u1-:host` layout debt remains.

## Current handoff: independently reviewed monitoring workflow

[PR102](https://github.com/scottchu/orca-slicer-mcp/pull/102) carries independently
reviewed decision0045/MON-001 source; consult the PR for merge identity. Exact
`3ce5a8cf2975c2c38601ce9832fa49bc50900893` was approved after the decision-table
repair. The conflict resolution retains approved skill bytes and incoming main
`06e2a903` application bytes unchanged.

Use the existing monitor independently or compose it after an observed authorized
start. Preserve one owner, exact run binding, adaptive checks, bounded recovery,
explicit limited request scope and all thumbnail/control gates. Stopping
observation leaves the printer running. The primary remains available.

Both skill validators and manual fictional lifecycle walkthroughs passed; these
did not execute a model workflow or test actual host/printer behavior. This monitoring change adds no installed-plugin or service changes and no durable
service/notification claim. Incoming Camera changes retain their own evidence. Follow maintained source for repository work. Any installed-plugin adoption
or standardized one-shot observation tool is separate scope; do not install,
deploy or change runtime under this documentation tail. Preserve concurrent
Camera work and earlier acceptance gaps. Detailed retained identities and commands
are in active VALIDATION/HANDOFF.

## Current handoff: PR101 deployed, phone Live still open

PR101 `0710b4b` is deployed after exact `42cdaca` approval and BOTH restarts.
The 40 s Live-open wait/55 s per-call retention/70 s bounded disposal repair
preserves other deadlines and all 28 old resource aliases. Observation v16 and
Camera v12 are current at runtime 0.4.10/schema 14. Required and targeted checks
pass; installed-resource postdeployment behavior with synthetic media passes.

Latest user outcome: the first PR101 retry still failed, then Live connected after
a couple of retries, then failed again with about 10 s before fallback. The
success screenshot shows new-generation UI and Live/30 FPS; reliability is
unresolved. Next locate the failing connection phase;
exact resource identity and root cause remain unverified. Do not close C08 from
this single success or require another speculative fix. Native clipboard/OAuth
acceptance remains separate. Preserve
attempts 1–10 and the software/deployed/phone evidence boundaries in VALIDATION.
Screen Sharing stays paused; retain all 55 IDs, Progress no-action, F07 discussion,
separate c6 and unfinished Queue/Fans/Job History scope. No full test/build or
redeployment is required solely for this Markdown tail.

## Earlier handoff: PR99 MCP resources deployed

PR99 `4787c02` is deployed after exact `f782378` approval and BOTH service
restarts. Camera v11 and observation v15 now select the shared Svelte Camera
and Heads UI; eight other observation renderers and all old aliases remain.
Required gates pass; consult VALIDATION for exact evidence and prior failures.
Scoped postdeployment behavior verification passes on installed resources
with synthetic host data.

The user has now reported the refreshed UI working on the phone. Complete-hex
Copy and other device behaviors still need their own acceptance. Mounted cards do not replace their HTML on data
Refresh. Do not claim actual phone/OAuth/clipboard or real Live acceptance from
synthetic tests. No plugin reinstall or per-widget skill change was requested.

C08 is now resumed as above; Screen Sharing stays paused. The user reports Bun Local Network access allowed,
but its machine remains unconfirmed; the current isolated probe is recorded
above and does not establish LaunchAgent/phone behavior. Preserve all 55 IDs,
unfinished Queue/Fans/Job History work, Progress no-action, F07 class discussion,
separate c6 and unchanged loading policy. No printer reads/controls or auth/
network changes follow from this deployment. Docs-only tail needs no redeploy.

## Earlier deployment: PR97 native observation pages

PR97 merged as `aa85f4d3cd253f5177de8304ae5fb2ed7d5739e9`, preserving independently
approved350fb6e. Fans, Thermals, Heads and Queue now use native Kit pages at the
existing URLs, without iframes or new domain behavior. Other dashboard/Lab
renderers and unfinished product requirements remain in the delivery ledger.

The required gate passes574 UI,325 server/3951 assertions, eight packages and
34+27 Python tests. Seven formal-payload browser cases are retained by unchanged
application/payload hashes. Guarded shipping explicitly restarted BOTH services:
loaded/healthy/integrity,73 static/75 security checks and preservation pass, with
no rollback. Independent postverification passes all four320px native pages:
exact HTTPS assets, neutral failed-refresh geometry/footer, recovery and Heads
keyboard Copy with synthetic responses. No real printer or user clipboard access.
Detailed commands/hashes and all prior failures remain in VALIDATION, including
77f023e imports,29e4f07 fixture/build differences and the rejected stale output.

C08 and Screen Sharing stay paused until the user returns home; no Camera service
repair, real Live, physical-printer, BFCache or actual-device acceptance is claimed.
Keep all55 IDs, Progress no-action, F07 reactive-class discussion, separate c6 and
unchanged loading policy. The MCP Camera/Heads cutover above is the active next
slice; at-home Local Network inspection remains C08's external step. PR97's
Markdown-only rollout record required no additional deployment under0028.

### Retained PR95 source/deployment evidence

PR95 is merged as `44d4266634bbe2d102a056332726550cbfe068e8`, preserving independently
approved `fd642a5987bb8e35c9d5c272c73e4dce26ec882a` and tree
`a132ed2e12e77fd023a30e671cd1450f6870fed4`. The generic Switch now visibly matches
Button's44px action size, with a40px thumb/2px inset; Camera remains132px wide and
Bed88px. Only three consumer packages changed; the other12 public HTML files,
Camera lifecycle, dependencies and runtime are unchanged.

Required regression passes574 UI,322 server/3756 assertions, eight deterministic
packages and34+26 Python tests. Independent targeted browser evidence covers35
distinct cases (33 affected plus two fresh); the first34-pass/one-fixture-failure
run and single-case renewal are preserved. Another89 unaffected cases are retained
by input hashes; this is not a new323-case full browser run.

Guarded release `20260902-44d4266-pr95-20260902T155815-e97e1c` explicitly restarted
BOTH services and verified loaded/healthy/integral status,59 static/61 security
checks and preservation, with no rollback. Independent postverification passes
three320px consumer cases using exact HTTPS assets and synthetic data: Camera,
Camera Lab and Bed Lab retain44px geometry, loading/ready bounds and keyboard
behavior. No actual printer or Live acquisition was performed in this verification.

C08 remains unresolved: nine bounded attempts locate current Bun1.4 printer ICE
UDP sends failing with `EHOSTUNREACH`, while the same adapter under immutable1.3
reaches upstream RTP/offer. External STUN, local UDP and authenticated wire-byte
comparisons pass. Neither a Bun defect nor macOS Local Network denial is proved;
no Camera service repair was made. Actual probes have stopped.

The user has paused remote desktop diagnosis until returning home. Existing
client/server logs identify RSA-SRP failure; the user reports that interactive
local Directory verification accepted the same input. This does not identify the
Screen Sharing failure's cause. No Screen Sharing restart was executed by agents.
At-home inspection remains the next C08 external step; no further auth attempts,
settings changes or Camera probes are part of the native-page slice.

Preserve compact icon modes, footer errors, service-owned Camera lifecycle and
unchanged loading policy. All55 IDs, Progress no-action, F07 class discussion,
separate c6 and native-renderer/product backlog remain. The completed PR95
records-only tail retained application bytes without another deployment under0028.

## Earlier deployed baseline: PR93

PR93 `60cab96747775fd5715b4c626f99726e68b3d85c` is deployed from independently
approved7a0d398. Required574 UI/322 server/3756 assertions/eight packages/34+26
Python pass;323 browser coverage is321 retained plus two renewed Kit Fans cases.
BOTH services were explicitly restarted and verified healthy/integral, with59
static/61 security checks and preservation. Five independent served-UI cases pass
using exact HTTPS assets and synthetic tool/media data. See active VALIDATION for
source, shipment and postverification separately.

Keep the delivered single SvelteKit app and Bun1.4.0: generic components in
`src/components/common`, pure TypeScript services in `src/lib`, private server
code in `lib/server`, and framework routes in `src/routes`. Fans alone is native
Kit; other UI endpoints still return packaged HTML/iframe. Routing takeover does
not complete native-view migration. Existing URLs, roles/auth, service-owned
Camera lifecycle, no-env builds and protocol limits remain explicit.

Remaining native-renderer/product work follows the active C08 repair. Do not initiate Progress or the reactive Camera
class from their status/discussion entries; keep c6 separate. Preserve all55 IDs.
PR93 gives no new actual-camera, phone/native clipboard or physical-print acceptance.
The completed PR93 records-only tail required no application redeployment under0028.

### Earlier source checkpoint before decision0042

On `codex/u1-camera-icon-overlay` from `431b5d40a761919d638a35e2950874e3a5a29519`,
preserve existing animated `IconSegmentedControl` behavior in generic `Switch`:
Snapshot/Live/Auto icons only,
compact at the Camera image's bottom-right, with tooltip/aria names. Replace the
visible text/full-width placement; keep44px targets, keyboard/focus/reduced motion
and no overlap with fullscreen. Error text remains beside footer Refresh.
Service-owned mode/connection/Auto-fallback semantics stay unchanged.

Use adopted `src/lib/common/*` for all shared generic primitives. Button and Icon
variants replace the separate visual-only button/icon leaves; domain compositions
and domain icon mappings remain outside common. Do not rename semantic tokens or
mix Camera service, Progress, reactive-class or c6 work into this foundation.
Cover all shared consumers/all eight bundles, with one assigned full-run owner;
changing agents alone does not require another full regression.

The common/Button/Icon/Switch migration is implemented in source; `bun run check`
passes0errors/0warnings and AST, and one390px Camera modes case passes. Lab size
remains blocked at83446/80000 after an initial83901; initial Live94479/100000 fits.
The LabControls experiment saved nothing and was fully reverted. Fix the preliminary
source-derived local-fullscreen P1 (unselected radios included in its tab trap),
then continue legitimate common/Camera simplification and focused evidence. Caps,
dependencies, packaging pipeline and service semantics remain unchanged; there is
no claim that fitting the existing guard is impossible. Read-only architecture
review found no wrong graph dependency or bounded justified3446-byte saving that
preserves requirements. Obtain all eight final measurements and focused author
evidence before checkpointing; any cap change requires an explicit user decision,
not an assumed platform limit or a new threshold guessed from interim builds.

Renew affected focused tests/bundles before the assigned full gate, independent
exact review and guarded delivery. This correction is not yet verified/deployed;
PR89 remains the baseline. Keep C08 unclassified acquisition risk, all55 IDs,
Progress no-action, unimplemented reactive-class discussion and c6 separation.

## Deployed baseline: PR89 scoped verification and open Camera risk

PR89 is merged/deployed as `f0d7c178e59e72a9d1ed6324577d2e131ffb0f91`, matching
reviewed `ce065866c61eba159075da9d3bcbf642e9bd404d` tree
`a96e57fab0a5289d30ce406c68d3d6023e049d3d`. BOTH services were explicitly restarted
and verified healthy/integral;31 static/32 security checks and preservation pass.
Independent postverification passes15 manifest files,31 local routes, six merged
public assets and eight HTTPS served-widget cases. Actual Live had two successes
with17.100s/17.102s of advancing decoded samples, plus one unclassified acquisition
failure; C08 remains open. Auto new receipts and Snapshot4.5s with no ongoing reads
pass. The source gate passed559 UI,
304 app/3656assertions, eight packages,21 lifecycle/24 shipping;317 browser coverage
is256 retained+61 renewed with scoped controller4/Camera7, not a new full run.

Next diagnose the preserved C08 intermittent acquisition failure; two successes
do not explain it. Application bytes are unchanged: decision0028 requires no
repeat build, deployment or service restart. Continue only authorized ledger work;
Progress stays no action, CameraStream/$state stays discussion only, other
migrations and c6 stay separate. Do not infer phone/native/physical-print acceptance
from source, guarded ship or bounded real-camera observation.

## Historical: 092f84a test-only contract repair

Source-approved `092f84a9d5f0b3e282eaa4a30304e9c86cb0e132` passed559 UI/eight
packages/app TypeScript but stopped at301 app passes/3 obsolete assertions;
Python gates were not reached. Only `app.test.ts` now renews two legacy pins and
adjacent footer-status assertions:29PASS/281assertions,374 other tracked app files
unchanged. Commit the new candidate, renew exact review and the full required gate;
retain the failed run and scoped browser evidence. No ship yet: PR87 remains
deployed, all55 IDs persist, Progress and reactive-class work remain unimplemented.

## Historical: minimal NodeNext/dependency repair after f0c5e41

Candidate `f0c5e41be0ea6b01549717abe73ab8e0951cc4ec`, tree
`9a6c8cbbcc699b7f06bd6613ef0a2efd4e7173b8`, has coordinator-attributed
independent exact source APPROVE with no findings. Its full required repository
gate remains failed: compiler/AST,559 UI and five focused/three Lab deterministic
package checks passed, then app TypeScript stopped on missing installed
`three`/`@types/three` and Camera's type-only `./session` lacking `.js` under
NodeNext. App tests and Python lifecycle/shipping were not reached.

The author's correction is complete: only type-only `./session.js` changed;
frozen install restored eight existing locked packages. App TypeScript, one
HTTP/host/transport case, nine transport cases and Camera build verification pass.
All eight widget artifacts and transpiled JavaScript are byte-identical; package
and both lockfiles are unchanged. Next freeze the new SHA, then renew the full required repository
gate and independent exact review. Retain the61 targeted browser passes, four
fresh controller adversaries and prior Camera7 only when exact input/behavior
binding supports it;317 browser cases means256 retained plus61 renewed, not a
clean317-case full run. No automatic full-browser repeat for handoff is requested.
No `u1-ship` gate is waived. Preserve the failed logs and all55 ledger IDs;
PR87 remains deployed, c6 remains separate and Progress remains no action.

## Historical: e186c41 review repairs

The current working tree contains focused repairs on
`e186c41c15d65070bf51d3d756c6b6c6d9e5d9ac`; do not deploy that rejected candidate.
Freeze the new candidate after reviewing this diff and the current HANDOFF /
VALIDATION sections, then assign independent repair verification and the complete
required repository gate. The earlier gate stopped at557 UI passes / one Bed
selector failure; the one full browser run was301 pass /12 fail. Preserve those
logs and the seven passing independent Camera adversaries. Do not repeat an
unaffected full browser suite solely for handoff; all mandatory `u1-ship` gates
remain unchanged.

Author repairs restore `ready` after a successful duplicate RPC while duplicate
notifications cannot clear failed Retry, and preserve the combined legacy initial
error during Retry. Renewed Bed selectors retain both local and phase assertions;
Thermals explicitly tests age-stale success, timeout/offline neutral failure and
fresh recovery. Evidence:45 UI passes, compiler/AST, five package passes and22
browser cases covered as14 retained plus eight renewed passes. The new input/log
manifest and failure classifications are in VALIDATION; this is author evidence,
not independent approval. Four live bundle pins are updated; Camera and private
lab artifacts are unchanged. Next delivery must use the exact newly approved SHA.

Preserve existing changes, delivery-ledger backlog, all c6 separation and byte
caps. No Progress implementation was authorized in this repair. No new deployment
occurred, and PR87 remains the served baseline.

## Historical: resumed WIP branch

The coordinator verified a clean current checkout, fetched and checked out
`codex/u1-footer-error-skeletons` at remote checkpoint
`f9fe1eb0d5455b4a30937954b4ae8ff4e4b8d05c`, based on
`80280568589fb8cd2df7f8ab30c2f1faddcb3769`. The old worktree's archive and
unregistration are user-reported; do not recreate its cleanup, discard existing
changes, force checkout or delete other worktrees. The prior pack-up stop is
historical. Complete this WIP before considering it for shipping.
Start with the current [HANDOFF](docs/iterations/2026-08-23-f0-dual-subsystem-foundation/HANDOFF.md)
and [VALIDATION](docs/iterations/2026-08-23-f0-dual-subsystem-foundation/VALIDATION.md).
No full regression or independent exact approval exists for these uncommitted
bytes. Phase1 Svelte evidence is compiler/AST,158 unit,12 package and49 unique
browser cases retained+renewed; see VALIDATION for failures, renewals and hashes.
The reported packages/pins fit unchanged caps at their recorded phase1 identity;
subsequent Camera edits require renewed affected packaging/evidence.

Next smallest action: record the frozen candidate commit and begin the assigned
required regression. Final Camera renderer has3 UI,23+2 targeted browser and12
package tests/138 assertions, compiler/AST and package checks passing; Lab79375,
Live89770 and private aggregate928543 fit unchanged caps. Actual Live diagnosis and the two
scoped service repairs now have author evidence: raw HTTP acknowledgement
compatibility, then preservation of connected/fresh Live on a typed supplemental
candidate timeout. Frame/open validation, invalid-ack failure and all deadlines
remain unchanged. Fixed Snapshot / Live / Auto modes have service-owned effects;
Auto is the user's one-word label for repeated snapshot reads. The source-only
renderer has its final package/geometry evidence in VALIDATION; independent exact
review, full regression and guarded delivery remain.

The 55 service-test run retains 52 cases after synthetic-service changes; five
renewed synthetic cases give 57 covered cases, not one 57-test run. One actual
HTTP handler -> host -> Camera transport test passes. The real-camera diagnostic
uses a 91,063-byte candidate UI with the deployed host/backend: Live persisted to
20.4s, 444 decoded frames at 1920x1080, through the confirmed 10-second mDNS delay.
That is mixed evidence, not a new deployment or final exact-renderer acceptance.
Retain earlier failed diagnostics and phase1 evidence as scoped in VALIDATION.

Keep one expensive frozen full-run owner and separate reviewer/validator. The
four earlier preflight findings have focused author repairs, not exact approval.
Freeze only completed, focused-verified bytes, then
run the required full regression once under its assigned owner; independent
source review and targeted verification precede guarded PR merge/deployment with
both-service restart. Agent handoff alone does not invalidate retained evidence.
Project byte caps remain unchanged repo guards, not asserted OpenAI limits.
Preserve the separate source-only blocked `c6cfb4e` checkpoint and all ledger backlog.
The latest Progress request is status-only: do not start P01/P02/P03 in this slice.

PR87 observation stable error anatomy and inline Heads quiet Copy are deployed.
Camera remains separately blocked; Progress redesign is still unfinished.
The complete current route/evidence matrix is
[Widget delivery ledger](docs/widget-delivery.md).
PR87 merged as `96e466e2ffefd75dc0b2c1fce92b40c7ec30555d`, preserving the
independently approved tree `37a232ad86069584b4ec32562d603e5c0d577530`.
The coordinator's guarded receipt confirms BOTH services explicitly restarted,
loaded and healthy/integrity-verified;31 static and32 security checks pass,
preservation passes and rollback was not needed. Independent postverification
passes15 scoped downloaded-byte browser cases and exact service/asset checks.
The pre-existing public-root routing limitation remains open in the ledger;
this does not establish actual-phone, native clipboard or printer acceptance.
Source/test evidence and the263 retained plus9 renewed browser split remain
in VALIDATION, including the38 independent cases and artifact-loss limits.
Camera `c6cfb4e` remains source-only and blocked at81,989/80,000 bytes.
PR86 merged as `8b995ee`; its thumbnail policy remains binding.
This rollout-record change is documentation only: no additional application
build, browser suite, deployment or service restart under decision0028.
After independent review/merge of these records, continue the open ledger
without declaring Camera, Progress or all migrations complete.
Older sections below are historical, not current completion claims.

## Immediate: finish PR86 delivery of the reviewed thumbnail policy

Independent review approved policy `d08c88d8` with no findings.
[PR86](https://github.com/scottchu/orca-slicer-mcp/pull/86) already contains the
source/manual workflow rule. Bind this continuity-only tail to that review,
finish delivery through PR86 and verify the merge; do not recreate the PR or
repeat the completed policy review.
Apply local decoded-image verification before accepting or uploading any
prepared artifact, including the current unstarted job. After upload, verify
target-parsed thumbnail metadata before start. Configuration strings or an
earlier upload do not satisfy these ordered gates.

No application, plugin skill, build input or deployed service changes in this
slice. Decision 0028's documentation-only rule requires no deployment or
service restart. Runtime enforcement and target/physical display acceptance
remain unimplemented or unverified; preserve exact artifact and authorization
bindings during operations outside this repository policy work.

After delivery is verified, resume the previous widget order below without
marking unfinished Camera, Queue, Fans, Job History, Current Job, other migrations or thumbnail/Console/
widget-size features complete. See the active HANDOFF and VALIDATION records
for changed paths, evidence and limits.

## Previous delivered widget checkpoint

## Current: Heads Copy PR84 deployed and independently verified

PR84 merged as `0fe54f34e43f97dd9376e5a17b06efd342726455`, with the
independently approved tree `62af16d2dcc17bcf3c25e93c8fb7c4776a11c8db`.
The coordinator's guarded delivery receipt confirms BOTH existing services were
explicitly restarted, loaded and healthy/integrity-verified;31 static and32
security checks passed, preservation passed and no rollback occurred.
Independent postverification passed: 15 manifest hashes, nine HTTPS routes
(eight exact widget assets and Heads host), and 15 downloaded-CSP synthetic
behavior cases. Wide-RGBA transitions at 567/590/720px with 200% text remain
0px; whole hex, right-side 44px Copy and shared consumers passed.

The delivered Heads layout keeps44px Copy on the right, exact whole RGB/RGBA,
and public-width-driven loading/ready wrap. Source evidence remains44 focused,
514UI,300app/3557 assertions,21 lifecycle/24 shipping and248 browser PASS.
Separate independent36 targeted cases plus four packaged-consumer checks pass;
previous567/590/720 enlarged wide-RGBA transitions are0px. Failed first-candidate
evidence and the unchanged1px gate are preserved in VALIDATION.
This does not prove actual-phone typography, native OS focus or printer behavior.

Heads96660 and lightLab209516 are the only changed widget packages; six others,
all dependency/configuration/security/shipping inputs and caps are unchanged.
Camera Lab79776 still has224bytes headroom. Bed PR83 remains accepted prior work.

Next: integrate source-approved Camera retry checkpoint
`1c6920ef49804cdec789df33e3be0221fdecc887` with accepted main, renew actual
consumer packages/tests and obtain independent exact acceptance before release.
That checkpoint is not integrated, rebuilt or deployed; current Camera assets
must not be mistaken for its acceptance. Remaining all-widget error rollout,
Bed grid/legend/summary work, fixed Lab dock, Current Job PR79, other migrations,
Console/progress-thumbnail/widget-size features and recoverable cleanup stay open.
This six-record rollout update changes documentation only; decision0028 requires
no repeat build/browser suite, deployment or additional service restart.

## Earlier Bed candidate handoff (superseded where noted above)

Frozen application `1da084822fde1430c47aa58e332e50e453dbffad`, tree
`5ed792d20873e254067997d3c236147ca6b62294`, ordinarily integrates accepted
Heads/main `55078ea215768094bf1897b516726e2e4aa05bd8` via `d139091`.
Bed Lab now keeps initial-error structure and retained-error data/renderer/
receipt. Adopted independent UI/UX policy moves successful 2D Retry focus to
the selected 2D radio only while the current retry owns active-document focus;
Reset stays native-disabled. 3D keeps Reset focus. Blur, user focus movement,
mode/phase changes, cancellation and unmount prevent late focus recovery.
Shared leaf focus APIs own no connection/retry logic; ADR0038 records the policy.

Author gates on these frozen bytes pass: 21 focused Bed browser cases; the
single full browser run 235/235; required repository gate 504 UI, 300 app/
3,557 assertions, 21 lifecycle and 24 shipping tests; eight deterministic
packages and runtime bundles/signature/help. Independent targeted validation
reports 14 browser cases plus six fresh delayed-policy adversaries PASS.
Exact final-head source review/verification, PR and guarded deployment remain
pending. No Bed service, phone, real-printer or user-outcome acceptance.

All eight packages changed through shared leaf APIs; Lab sizes are
207630/632808/79776, total920214, within unchanged caps. Camera Lab has only
224 bytes headroom; later integration must remeasure, not raise its cap.
Owned browser/fixture sessions are closed and4179 is free. Existing Bed
320px/200% summary crowding and grid/legend redesign are outside this slice.

Coordinator-attributed Heads PR81 final postverification passed BOTH services,
15 manifest hashes, 11 HTTPS routes/eight unique assets and14 browser cases;
this does not accept Bed. Next order: finish Bed exact-candidate delivery,
then the newly reported mobile Heads color swatch/hex/Copy wrapping repair
with focused layout regression, then source-approved but unshipped Camera
retry checkpoint `1c6920e`. Keep Camera's old packaged assets distinct.
Other widget error rollouts, fixed Lab dock, PR79, migrations/features and
recoverable cleanup remain open; do not fold them into this frozen candidate.

## Earlier checkpoints (superseded where noted above)

## Current: Bed Lab error-frame source checkpoint; integration pending

Application `464d3e73d427e648a6b4c75be625eeaa49beaee9` from accepted
`4e869d8` implements ADR0038 for Bed Lab only. Compiler/AST, focused88 UI,
focused26 browser plus four unchanged-chart browser cases,19 app tests and
repeated three-Lab packaging pass. Only Bed Lab asset changes (631250 bytes);
all five production and other two Lab assets remain byte-identical.
Wait for accepted Heads PR81, integrate ordinary main, renew affected checks,
then assign one owner to the full frozen-candidate gates. Independent source
review/verification, PR, deployment and meaningful served behavior are pending.
Other nine widgets and production error rollout, Camera68259ead, fixed Lab
dock, unfinished migrations/features and recoverable cleanup remain open.

## Earlier implementation scope

From accepted4e869d8, implement decision0038's controlled shared presentation
foundation in Bed Lab only. Preserve chart/header/footer structure through
initial loading/error/retry; retain known renderer/data/receipt on refresh
failure. No whole-widget height guess, private skeleton template, cap increase,
production acquisition, printer action or release is part of implementation.
Source/unit/targeted browser and transitive packages precede frozen-candidate
independent acceptance. Heads repair, Camera68259ead, remaining widget error
rollout, fixed Lab dock and all earlier migration/feature tracks stay separate.

## Accepted-main history (superseded by the current Bed integration)

## Immediate: finish Heads exact-candidate delivery, then Bed and Camera

PR82 is merged as `707a018`; its four project roles are statically accepted,
not native-runtime verified. Preserve that accepted configuration during the
ordinary Heads PR81 merge. Bind the repaired test and retained application/
browser evidence to the clean final head, renew focused test/config checks,
and obtain separate exact source review and validation before guarded shipment.
Existing mandatory u1-ship gates remain required. Then integrate and validate
Bed Lab stable-error `c0323a4`, followed by Camera `4eb3106`'s explicit retry
repair. Current Job PR79 and every other track remain preserved and unfinished.
The ordinary merge is `b1c9a8c`; author focused29/config3 and exact application,
asset and retained-browser-log identity checks pass. The final records-only tail
must be included in independent exact-head approval, then pushed through PR81.

## Earlier Heads repair handoff

## Immediate: bind the PR81 test-only repair and retry guarded delivery

Test checkpoint `1e2e387d8cbbada99a23dfa01ad9b94265834f8d` has independent
source approval, independent 29/29 focused PASS and a complete author repository
gate PASS (483 UI, 300 app, 21 lifecycle, 24 shipping, eight package identities).
Only ObservationLoading.test.ts changes after the previous records head; no
application/browser inputs change from `c9d69cb`. Verify the final docs/remote
identity and bind retained 214-case browser evidence before retrying PR81.
The failed first ship operation merged/installed nothing; do not bypass a guard.

All test command sessions exited. No author browser or fixture was opened for
this repair. A subsequent read-only exec launch was rejected with OS error24;
the completed gate was unaffected. Do not broadly kill user/service processes.
Camera checkpoint `4eb3106` is separate and has an independently identified
same-live-scenario explicit-retry defect to fix after this Heads handoff. No
Camera release or completion is claimed; all broader tracks remain open.

## Next: independently accept and ship the small Heads material slice

Review frozen application `c9d69cb894ad1d28278fb1e56b6b9617c11af5f9`,
tree `3cca582bad7e2ff9d21b5f77f34fdc96aedcf266`. Focused 39 Chrome and
final 56 affected UI tests pass. The owned full browser run is 214/214 PASS;
match retained evidence to the exact candidate instead of repeating it automatically.

The material row uses shared Spool plus one naturally wrapping Caption.
Loading-only public `nominal | empty` shapes come from closed Lab controls,
never a reading/DTO/string length. Type/runtime guards reject ready or arbitrary
templates. Live root never opts in. No fixed heights, truncation or tolerance
waiver belongs here; arbitrary private initial length parity is not promised.

The documentation-only evidence tail preserves application bytes; obtain separate exact source
review and targeted independent validation before guarded PR merge/deploy/BOTH
service restart/served behavior verification. Preserve failed evidence and free
the isolated fixture port before handing it over (4179 is now released). Do not touch frozen PR79;
ordinary later integration must remeasure its tight Camera package cap.

All newer shared-state, fixed Lab dock, Camera, Progress, Bed and atomic-design
tracks remain recorded in WIDGET_TRACKS. Completed UIUX/printer audits are design
recommendations only, not delivered UI. No user browser, service or printer
state should be changed by independent source checks.
## Earlier project-role handoff (completed by merged PR82)

## Next: independently review the four project-agent definitions

Review `.codex/agents/`, `AGENTS.md` routing and `docs/project-agents.md` against
the latest requested UI/UX, printer-domain, agentic MCP/API and maker-user roles.
Run the focused configuration check and inspect authority, evidence and
author/reviewer separation; do not duplicate unaffected widget/browser suites.
Native named-agent loading remains unverified in the exposed current toolset.
After exact independent approval, merge the config/docs PR without service
deployment. Do not change global Codex configuration or claim a client reload.
Then resume the separate pending widget tracks recorded in PROJECT_STATE and
WIDGET_TRACKS; this priority neither merges them nor discards their checkpoints.

## Earlier checkpoints (superseded where noted above)

## Next: independently review the docs-only test-strategy PR

Review `AGENTS.md`'s seven Test strategy rules and the targeted identity/docs
evidence in the active `VALIDATION.md`. Do not rerun unaffected application or
browser suites for this documentation tail; do not bypass any existing shipping
guard for later widget releases. After review, merge this policy through its PR
without service deployment, as ADR0028 already allows for unchanged app bytes.
Keep Current Job PR79 `48f2060` untouched and resume its independent validation;
the remaining tracks in `PROJECT_STATE.md` and `WIDGET_TRACKS.md` stay open.

## Earlier checkpoints (superseded where noted above)

## Next: independent exact review and validation of the icon-toggle candidate

Application source `80229841fced7307aaf3eba850a8e60ef688c26a` has complete author
gates (455 UI,300 app,21 lifecycle,24 shipping,198 Chrome, runtime/signature and
repeated eight-package checks). Review the final PR head including its records
tail. Validate the two-option/loading contract, radio keyboard and native
Space/Enter once, external/reordered focus,32px track/44px targets, reduced
motion, exact mode/loading geometry, preserved legend/orbit/zoom/pixels/zero
fetch and all source/package boundaries. Port4179 is released.

Only `svelte-bed-mesh-lab.html` differs from accepted main4828ce04 public assets:
638,249 bytes/SHA37a48c3b…; three labs total921,919. No production renderer,
controller, IconButton, route or MCP cutover belongs here. After separate exact
approval the coordinator may use the guarded PR ship workflow; do not self-review.
The existing enlarged summary crowding/Observed spacing remain explicit debts.

After the immediate release, resume preserved Current Job5855223 and real
Bed194ea79 with ordinary accepted-main integration. All named tracks in
WIDGET_TRACKS remain open; nothing is lost by this execution-order change.

## Earlier author and integrated baseline records

## Immediate next: independently review and validate the slim-rail candidate

The author candidate ordinarily integrates accepted Queue main `7882670`.
Final repository/runtime gates and Chrome 182/182 pass. Independently review
the exact PR head and reproduce rail/caption clearance, accessible range,
flat/neutral colors, mode/loading geometry, mesh coverage/orbit/zoom and zero
fetch. Verify all eight packages deterministically: only Bed lab differs from
Queue; light/Bed/Camera are 204,875 / 634,045 / 78,795 bytes (917,715 total).
Then the coordinator may use guarded PR merge/deploy/BOTH restart/verification.
Author evidence is not independent approval or deployment. Port 4179 is free.
Keep real Bed phase two `194ea79` separate; its controller integration,
compact IconButton, keyboard/context-loss/font and crowded 320px/200% summary
remain follow-ups. Do not copy pending work or broaden this legend release.

## Historical author and integrated baseline records

## Immediate next: independent design for the HELD vertical legend

The isolated author candidate starts from accepted main `ff577fcb` and only
changes lab/shared chart presentation. Its last bounded browser run is 24/26:
all existing mesh/axis/orbit/zoom cases pass, but 320/390px with 200% text puts
849/412 colored pixels under the fixed-width legend label boxes. Determine
actual-glyph clearance, then design neutral 1x surface fitting around those
obstacles; do not continue heuristic fitting or loosen coverage/zoom gates.
The 320 frame is 258×193.5px, plot width242px and rail inset14px; enlarged
legend labels occupy about80px. Finish the four-width/200% browser,
deterministic three-package and existing coverage/zoom gates without loosening
them; then obtain exact-source independent review and validation before a PR
can ship. Production assets must remain identical. Keep the preserved real
Bed Mesh phase-two checkpoint `194ea79` separate until the immediate legend and
its Queue/Current Job shared-leaf dependencies are accepted and ordinarily
merged. Do not copy pending work between branches or bypass shipping guards.

## Integrated Queue baseline records
## Review frozen Queue candidate after delivered PR75

PR75's three-artifact private-lab split is delivered on accepted main
`ff577fcb5cf506c5a1699ad3ecf118e43afca8cd` (tree `8924189`). Attributed guarded
release `20260901-ff577fc-pr75-20260901T190836-b199a6` explicitly restarted BOTH
services: healthy/integrity verified,15 manifest hashes,30 static/31 security
checks, preservation true and no rollback; snapshot `20260901T190930-6f0cb3`
remains recoverable. Independent postdeployment checks verified actual HTTPS
three-artifact bytes/22 routes/CSP/method/isolation and downloaded-byte browser
30/30 plus wheel/reset1/1, zero runtime fetch at four widths/200% text. This is
deployed-service/synthetic evidence, not real-printer or phone acceptance.

Queue ordinarily merged that main as `a042be5`. Its strict real adapter,
zero-raw composition, exact private route and shared obsolete-success RPC repair
are frozen at application source `5c53d05ec15d76b5b5f413471a2ae8dee3326296`
(tree `155abfb5e436cf8e1cb344a6724fbc358feafc60`). Independently designed
intrinsic public-template skeletons now pass24/24 focused geometry cases and
Chrome174/174. Repository UI426/app300/lifecycle21/shipping24, compiler/AST,
deterministic packages, runtime/signature/help pass. Queue87,831 and light204,875
remain bounded; all exact hashes are recorded in VALIDATION and package tests.
No Queue shipment or final acceptance is claimed. Preserve prior failure history.

Next smallest action: independently validate and source-review the exact final
PR head, including its records-only tail, shared RPC repair across all consumers,
public-template isolation and all eight package hashes. Only after both roles
approve may the guarded PR merge/deploy/BOTH restart/verify proceed. Browser4179
is released to the separate lab legend author; coordinate exclusive reuse.

Remaining tracks stay open: Progress phase-one is held until the shared
obsolete-success fix is accepted; Overview checkpoint `136da4b` awaits independent
review; Current Job `4e50f7b` and History `379c1e7` have source approval only,
not delivered widgets. Real Bed Mesh composition, generic MCP/legacy migration,
new requested features and final recoverable cleanup are not complete.

## Historical checkpoints (superseded where noted above)

## Three-artifact private-lab split candidate — do not ship yet

Continue from exact application source `4a6c493`, which ordinarily merged
accepted/deployed Heads main `5ffca666e4ffa50c761ff54460f2d7dfc3466ad5`.
Verify exactly three inline
lab artifacts: light observation 199,819 bytes, Bed Mesh 629,880 and Camera
78,795 (908,494 aggregate). Preserve exact route/source-graph isolation and the
unchanged Camera lifecycle. Author deterministic, full browser and repository
gates pass; obtain separate exact-SHA validation/review before merge. The independently
renewed light limit is 250,000 bytes and leaves 50,181 bytes; its finite
allowance covers only Queue, Current Job, History, Progress and Overview, not
Console or thumbnails. Never loosen a cap or claim acceptance silently. No
deployment or cleanup is authorized from this author checkpoint alone.

## Current checkpoint: Heads candidate after delivered Bed Mesh PR73

Bed Mesh PR73 was independently accepted at source `2e9268`, merged and shipped
as `8c5756ddb4435ba94a494963556c94d15d05b6e5` (tree
`b37b7806fda5d004cb06d4d9ccb7799380d0a52f`). Attributed operator receipt:
release `20260901-8c5756d-pr73-20260901T175129-1e397e`, BOTH existing services
explicitly restarted and loaded/healthy/integrity verified; 29 static and 30
security checks PASS, preservation true, no rollback, retained snapshot
`20260901T175219-d7c334`. Attributed independent postdeployment PASS confirms
BOTH service identities,15 manifest hashes,8 exact private HTTPS assets/CSP,
20 isolation/status probes and8 browser checks on actual downloaded lab bytes
at four widths/normal200%. Wheel/pinch/reverse/reset, retained orbit/canvas,
reactive2D pixels and fixed4:3 pass;320enlarged/720normal captures were inspected.
This is deployed-service and synthetic browser evidence, not phone/printer
acceptance. Production Bed Mesh/MCP, inherited keyboard/WebGL fallback/fixed2D
font and the pre-existing unmatched-root502 remain outside accepted coverage.

Heads author source is frozen at `4d24446`: strict real DTO, generic card/color
leaves and zero-raw shared panel are implemented. Focused22 geometry cases and
the final163-case Chrome suite PASS at four widths/normal200%, including exact
<=1px skeleton bounds, Empty/N/A without Copy, retained refresh/copy/BFCache,
initial error/retry and obsolete-RPC races. The latter found and repaired a real
host omission: all three migrated focused widgets now receive initial errors.
Repository/runtime gates and six deterministic packages PASS. Heads remains an
unaccepted candidate pending exact independent source review and validation;
no Heads deployment occurred.
Decision0032 records the independently adopted finite lab budgets
756,000/80,000/836,000 and separate100,000 Heads allowance, not future automatic
growth. Client graphs, exact-source review and full combined gates remain due.

Next: exact independent Heads source review/validation and guarded shipment.
Queue → Current Job → History follow as separate bounded
migrations; Progress remains separate, real Bed Mesh adapter/shell follows its
renderer, and Overview is last. Current Job reported-null filename differs from
unreported; its lab progressPercent must never be invented from file position.
All remaining WIDGET_TRACKS stay open, including generic MCP/legacy cutover,
new requested features and final recoverable cleanup.

## Historical checkpoints (superseded where noted above)

## Current checkpoint: held Bed Mesh zoom renewal after delivered Thermals

Thermals PR72 is delivered on independently accepted merge
`6325c8792fc8cca1f1c73109aae717e774d87076`, tree
`e9b286b6be673a1d88f04bd5b227a91f40c4cb5b`. The attributed operator receipt
reports release `20260901-6325c87-pr72-20260901T172710-d336bd`, BOTH existing
services explicitly restarted, loaded/healthy/integrity verified at
runtime0.4.8/schema12/observation-v14/camera-v10,29 static/30 security checks
PASS, preservation true and no rollback. Snapshot `20260901T172800-d68cec`
is retained. Canonical main and8,689 ignored entries/recovery refs are preserved.
Camera PR71 and Fans PR70 are also delivered; older pending claims below are
historical. Independent Thermals postdeployment PASS verifies BOTH exact service
identities, 15 manifest hashes, seven private HTTPS assets with exact hashes /
no-store/CSP, 14 isolation/status probes and clean canonical main. Nine Chrome
checks on actual downloaded host/child bytes and CSP use synthetic responses:
four widths, normal/200% text, skeleton/retained refresh/time/focus, nullable and
extreme values and independent Cavity receipt. The validator inspected enlarged
320 and normal720 captures. External unmatched-root502 remains pre-existing and
unaccepted; actual printer/phone and stale installed-connector identity remain
unverified. These are attributed independent deployment/synthetic-browser facts,
not new author acquisition or device checks. No extra runtime change was made.

Bed Mesh PR73 candidate `85f89f9` is HELD despite137 passing browser cases:
independent real wheel input showed projected width452.28→448.55 instead of
the baseline461.84→628.30. Per-render frustum fitting canceled user zoom.
The accepted renewal fits at neutral1x, then applies independent bounded
0.75–3.5 detail zoom. Default/reset and all1x orbit containment gates remain
unchanged; intentional greater-than1x detail viewing may crop geometry/labels
at the fixed frame boundary. It must not silently refit the user's zoom away.
After explicit accepted-main merge `f0e25ba`, the author renewal passes 266 UI
units, 290 app tests/3,400 assertions, 21 lifecycle, 24 shipping and the full
152-case Chrome suite. All five packages are deterministic and bounded; runtime
bundles/signature/help and compiler/AST pass. Actual wheel/two-finger browser
input, pixels, identity, data/resize and reset regressions pass while every 1x
containment test remains unchanged. Observation lab is 749,560 bytes; its
440-byte reserve is not permission to raise the cap. Fresh exact independent
validation/source approval is still required before delivery.

This remains private-lab-only. Production Bed Mesh/MCP, keyboard/Home,
automatic WebGL-failure fallback and root-scaled2D labels remain open, as do
all other named WIDGET_TRACKS. No service, printer, authentication, Tailscale
or plugin action is part of this author repair.

## Historical checkpoints (superseded where noted above)

## Current checkpoint: Thermals renewal after delivered Camera PR71

Reviewed Camera main `0aa83a0f382574af1eb910d7cba61f2a28f88ace` is explicitly
integrated in this PR72 merge. Additive source/record conflicts are resolved;
renewed combined author gates PASS:256 UI,138 Chrome,290 app/3,400 assertions,
21 lifecycle and24 shipping tests, compiler/AST, five deterministic packages,
runtime bundles/signature/help. Exact independent validation/review is next;
no Thermals acceptance or deployment is claimed.
Fans PR70 and focused Camera PR71 are deployed. Thermals remains unshipped;
seven other observation cutovers, generic MCP/legacy replacement and all named
WIDGET_TRACKS remain open. Preserve existing widget-first execution order.

PR71 independently accepted `c9311eb`, merged as `0aa83a0` with tree
`af970729c41d041533d5d6f6c909a3a43d49a21b`, and shipped release
`20260901-0aa83a0-pr71-20260901T170551-59206e`. Operator reports BOTH explicitly
restarted, loaded/healthy/integrity verified at runtime0.4.8/schema12/obs14/camera10,
28 static and29 security checks passed, preservation true, no rollback needed;
snapshot `20260901T170638-b77ef9` retained. Canonical checkout/recovery refs and
8,689 ignored entries were preserved. Camera artifact89,919 bytes has SHA256
`b774fdfce6ec20a1732f2cef5cd5ec5dbbd93422810758c237eb9f7278423c10`.

Independent `live_camera_exact_validation` postdeployment PASS covers BOTH
service/plist identities,15 manifest hashes,6 exact private static routes with
no-store/CSP, and fetched-byte synthetic host/media behavior (five probes and
six hash checks). Public loopback rejects four private dashboard/lab routes.
External unmatched-root routes still return502 from an unrelated unavailable
upstream, including pre-existing widget routes: this is not a Camera-specific
regression, but external-root availability/isolation remains unaccepted. No
routing/auth changes were made. Actual phone/real-stream evidence remains
pending. The separately stale installed-plugin connection still requires
approval before reload/reinstallation; no such action occurred.


## Historical author and delivery checkpoints (superseded where noted above)

Resume from repository records, not chat history.

## Read first

1. `AGENTS.md`
2. `PROJECT_STATE.md`
3. `docs/requirements.md`
4. `docs/iterations/CURRENT` and every file in that iteration
5. decisions 0014 through 0025 and 0027 through 0032 (0026 is reserved for earlier Queue work)
6. `plugins/u1-print-studio/PACKAGING.md`
7. `docs/u1-print-studio-plugin-architecture.md`

## Current execution order

Bounded Bed Mesh candidate: obtain independent exact-SHA validation and source
review after the author pin, then guarded merge/deploy/BOTH restart/verification.
Reviewed Camera main `0aa83a0` is integrated and already shipped as release
`20260901-0aa83a0-pr71-20260901T170551-59206e`; do not repeat the older Camera
acceptance sequence below. Bed Mesh author browser evidence is 137/137 passing,
including real pixels, projected labels, reactive buffers and 200% text; newest
VALIDATION records all gates and unchanged package limits. Production Bed Mesh
and MCP remain legacy pending adapter parity. Thermals is separate concurrent
work; coordinate fixture port 4179 and integrate only explicitly reviewed main.
All remaining WIDGET_TRACKS stay open; earlier pending paragraphs are history.

Next action: independently validate/review the frozen real Thermals candidate,
then guarded merge/deploy/explicit BOTH restart/verify. Author final gates pass:
228 UI,130 Chrome,285 app/3,356 assertions,21 lifecycle,24 shipping, deterministic
packages and bundles/signature/help. This is not a deployed Thermals release.
Its branch is based on reviewed `db1c926`; if Camera ships first, explicitly
integrate that reviewed main and renew exact acceptance. Do not import the
unapproved Camera branch. No browser test server remains running from this author.

PR70 Fans is shipped on reviewed main `db1c926`; do not repeat its cutover.
Next bounded author slice is real Thermals only, sharing the reviewed bridge and
controller while preserving separate Cavity receipts and source-bound nullable
thermal facts. Required parity is in LIVE_PARITY/decision0034. Real Camera is a
separate coordinated branch; seven other observations and generic MCP still
require migration. Keep every named WIDGET_TRACKS obligation, not new features.
Latest actual PR70 operator and independent postcheck receipts are in
PROJECT_STATE/VALIDATION: exact assets/services and11 fetched-byte iframe cases
with synthetic replies pass. An unidentified connector produced historical
sparse data; do not equate that with current real-data/device acceptance or
silently change plugin/auth state. Thermals full gates and exact independent
acceptance must finish before another cutover is claimed.

### Historical next-action checkpoints

The prior pending PR70/Camera/lab instructions below are historical, superseded
by the current Thermals execution order above; they do not require reshipping
already accepted bytes.
Next acceptance: the real Camera dashboard candidate on explicitly merged
reviewed main `db1c926` (Fans PR70 delivered through release
`20260901-db1c926-pr70-20260901T162456-cc8038`; BOTH restarted/healthy/integrity,
27 static28 security checks per operator receipt). Camera is now host-wired and
has an exact private child route, but is not yet independently accepted or
deployed. Its89,919-byte artifact has a separate100,000-byte cap; existing lab
and Fans bytes stay unchanged. Newest VALIDATION records actual current gates
and the full129-before-final/focused8-after-final browser evidence distinction.
Run independent full-suite validation/source review of the final exact pin,
then guarded PR merge/deploy/explicit BOTH restart/verify. Keep the unchanged
legacy Camera/MCP aliases until their separately reviewed replacement. Do not
resume historical synthetic-Camera or Fans-pending instructions below.

Real Camera implementation is active after shipped synthetic PR69 `ef5b239`.
Decision0035 records the accepted dashboard-only migration and safety gates.
The typed-port checkpoint has transport/peer/playback adapters and38 focused
unit tests, but no real host binding, production artifact or route change. Merge
reviewed Fans/shared-HostRpc main next, then build the persistent VideoSurface,
zero-raw CameraWidget/root and exact private artifact. Do not treat synthetic
lab evidence as real Camera parity or retire reachable MCP/legacy assets.
Latest VALIDATION/HANDOFF distinguish this checkpoint from deployment evidence.

Next action: independent exact validation/review of renewed PR70 on merged
Camera baseline `ef5b239`, then guarded Fans-only cutover. Full combined author
gates pass: 183 UI units, 121 Chrome, 281 app/3,301 assertions, 21 lifecycle and
24 ship tests plus deterministic packages/bundles/signature/help. The initial
`e0e141a` was held; do not reuse that pin. New artifact hashes and actual PR69
rollout/postcheck attribution are in the newest VALIDATION entries. Camera lab
is already shipped; real Camera remains separate. No further feature expansion
belongs in this renewal while independent acceptance is pending.

The PR70 refresh-race renewal now explicitly integrates reviewed Camera main
`ef5b239`. Resolve and verify the combined source/packages/routes without
overwriting its Camera mapping, controls or two-artifact/aggregate budget.
Rerun full gates and freeze a new exact PR70 head for independent acceptance.
The Camera-candidate paragraphs below are preserved historical evidence, not
an instruction to redeploy Camera separately from this combined next release.

Camera lab PR69 is already deployed and independently post-verified on exact
`ef5b239`, release `20260901-ef5b239-pr69-20260901T160906-8d7501`. Its actual
operator/postcheck receipt is in VALIDATION. Do not confuse synthetic local-video
acceptance with the still-pending real Camera transport/session cutover.

PR70 `e0e141a` is independently held for a superseded-refresh rejection leaving
busy=true. The narrow finally-settlement correction has two passing controller
regressions and a passing real-iframe recovery/focus regression. Next integrate
the reviewed Camera merge, then renew full combined-tree gates and exact review;
do not ship the held head or reuse its earlier author green evidence as approval.

Current unshipped LIVE Fans candidate explicitly integrates reviewed main
`2d30b01`. Its real iframe/adapter/controller and private static asset are wired;
152 UI units, 104 Chrome cases and full app/lifecycle/shipping/bundle gates pass.
Obtain exact independent validation/review before the Fans-only cutover.
See decision 0034 and active `LIVE_PARITY.md` for the remaining-eight contract.
Do not infer live acceptance from the already shipped lab controls below.
Production Fans is 84,884 bytes, SHA-256
`f25bc9bd332e3fdd49a974db754ea2636ed099f065241bd373a9c0d4daa22605`;
lab is 748,888 bytes, SHA-256
`26a05eaf00188d26dd27e5f2700ae9172c8d4ba4491c785c9dffec1c38e56800`.
Independent approval is still required; no service state changed in author tests.
Next candidate: the synthetic Camera lab, integrated with reviewed main
`2d30b01`. It has an explicit private compiled-Svelte entry, shared controls and
zero-raw root/widget over generic layout/media/status leaves. Seven states,
restrictive display policies, truthful measured local FPS and persistent
fullscreen/PiP media are synthetic-only. Production Camera remains unchanged.
Observe decision0032's revised exact-two-artifact budgets750,000/80,000 and
830,000 aggregate; current748,482/78,688 =827,170. No third index or remote assets.
Run/inspect newest VALIDATION, freeze exact source, obtain independent validation
and formal review, then guarded merge/deploy/explicit BOTH restart/verify.
The pending real-session controller is not wired to host or production media.
LIVE Fans remains a separate author/branch with shared RPC ownership; explicitly
integrate its reviewed result later, not unreviewed copies. Historical Camera
unintegrated instructions below are superseded by this candidate, not by delivery.

PR67 is shipped and independently post-verified: reviewed `07e1c144`, merged
`c924bf9`, release `20260901-c924bf9-pr67-20260901T153250-99a666`. BOTH service
restarts, health/integrity, 25 static routes/assets, 26 security checks and
preservation passed. The private lab directory and nine routes serve exact
748,554-byte SHA-256 `83146f52f61fd9225877e3bd4ef7ee08798745083fc7232fa9e932399b007a1a`.
Independent isolated Chrome on fetched bytes confirms controls/loading/retained
refresh/source times, announcements and geometry. Actual-device/printer evidence
is still separate and pending. The earlier PR67-unshipped notes below are history.

Next: complete the already-authorized real Fans migration and Camera integration
on separate candidate branches, integrating exact reviewed main before their
acceptance. Do not switch the generic MCP observation resource until all nine
lossless adapters/alias parity are accepted. Preserve seven remaining ready-shell
debts and all feature obligations in WIDGET_TRACKS. This docs-only receipt has
no application change and must not trigger a second deploy/restart.

The approved ten old worktrees and stale nested clone are now recoverably
quarantined, with independent full-manifest preservation PASS. Do not reuse
their old paths or empty quarantine. Canonical clean main, original action and
recovery refs, five archived document edits, and active feature registrations
were verified. Cleanup does not retire still-needed production widget code.

Use active `WIDGET_TRACKS.md` as the finite unfinished-work checklist. Every
named feature remains queued after existing consolidation; none is cancelled.

PR67 head `8663d93` was independently rejected for real text clipping and an
incomplete correlated selection type. The renewed candidate corrects both and
requires fresh exact validation/review, not reuse of earlier author results.
Author compiler/AST, 126 UI units, 94 Chrome cases, deterministic 748,539-byte
package, 276 app/3,187 assertions, 21 lifecycle and 24 shipping tests pass;
bundles/signature/help pass. The browser suite now includes 168 closed-preset
text-visibility and ready/loading geometry combinations. No new feature track
should delay review and delivery. This is not merged, deployed or actual-device
accepted; the separate clean LIVE Fans preparation branch remains paused.

Subsequent independent visual review rejected `befbbd5` for a separated `0 %`
metric. The scoped end-alignment fix retains ready/loading geometry; the final
matrix has 200 combinations and 48 strict glyph/unit gap checks. Updated
artifact: 748,554 bytes (1,446-byte reserve). Fresh exact acceptance is required.
LIVE Fans has a separate uncommitted preparatory checkpoint (decision/shared
RPC/pure adapter/controller), paused without route changes; it is not part of
this lab candidate.

Latest user order: finish existing work, migrate/consolidate, merge/deploy/
explicitly restart BOTH services/verify, then clean up. Do not begin new feature
tracks. Complete the preserved all-nine lab-controls/loading candidate first
with exact independent validation and review; Camera integration and remaining
legacy replacements require their own explicit reviewed cutover boundaries.
Do not silently turn the lab PR into a production migration or delete working
legacy paths prematurely. The seven partly legacy ready shells are Overview,
Progress, Heads, CurrentJob, JobHistory, Queue and BedMesh; production observation
and camera routes/assets also remain legacy. Camera's authored Svelte checkpoint
is not integrated or shipped. Keep every remaining migration item open until
replacement and delivery evidence exists. Earlier execution orders below are
historical where they conflict with this consolidation-first order.

Current priority is visible private-lab lifecycle/scenario/value controls and
shape-matched loading for all nine observation views, followed promptly by the
separate synthetic Camera lab using the shared controls. See decisions 0032/0033
addenda. The controller accepts only closed examples, never JSON/URLs or live
transport. Preserve the seven legacy ready-body raw debts and the 750,000-byte
combined budget; Camera stays pending until its separate integration ships.
Reviewed main `cb37e3e` is explicitly integrated, including shipped slope PR65
and receipt PR66; the deployed application is `6b9b3e7`.
All earlier candidate priorities below are historical, not the current order.

PR65 is shipped: reviewed `f216c70`, merged `6b9b3e7`, exact guarded release
`20260901-6b9b3e7-pr65-20260901T142009-341331`. BOTH services were explicitly
restarted and are loaded/healthy/integrity verified; all 25 exact static and 26
security checks passed. Thermals and Fans private-lab bytes match the approved
727,096-byte artifact. This is service/static evidence, not phone or printer
acceptance. The shipping snapshot is retained and no rollback was needed.

Now resume preserved visible all-nine lab scenario/state controls and structural
loading, then separate synthetic Camera integration. Keep smaller visual Refresh,
content-aware compact/medium/full plus its separately reviewed MCP size parameter
and the remaining named widget tracks queued. Do not restart the completed slope
slice. These documentation-only receipt changes preserve application bytes and
need no extra service deployment; the earlier candidate instructions below are
superseded by this shipped checkpoint.

First review/deliver the isolated shared 100-degree percentage tint refinement;
then resume visible all-nine lab scenario/state controls and matched skeletons,
followed by separate synthetic Camera integration. The lab worktree is preserved
and is not included in this small refinement. New requests for smaller visual
Refresh (32-pixel surface/16-pixel glyph inside 44-pixel target) and content-aware
compact/medium/full presentation plus a separately reviewed MCP size parameter
remain queued, not silently included. All historical candidate instructions
below are superseded by this order. PR64 `e1f57f0` is merged with deployed app
bytes still matching PR63 `57a305b`.

PR63 is shipped: reviewed `0f78e69`, merged `57a305b`, exact guarded release
`20260901-57a305b-pr63-20260901T134952-9c86bd`. BOTH public/dashboard services
were explicitly restarted and passed loaded/healthy/integrity checks; 25 exact
static routes/assets and 26 security checks passed without rollback. See newest
PROJECT_STATE and active VALIDATION/HANDOFF sections for the actual receipt.
Pending-candidate instructions below are historical for this slice. Do not
redeploy unchanged application bytes merely to merge these rollout records.

Obtain user feedback on private `/dashboard/lab/fans`; production `/dashboard/fans`
still uses the unchanged legacy widget. Thermals and Fans are the two completed
zero-raw ready/state/skeleton compositions. Continue the seven remaining
ready/skeleton migrations, all-nine gallery, Bed Mesh axes, read-only Console,
model/layer progress, Camera lifecycle and separately reviewed cutovers. Actual
device/live-printer/user acceptance is still unclaimed. Preserve existing
dirty original-checkout changes and the frozen reviewed source branches.

Current candidate is Fans & Air on `codex/u1-fans-percentage`, aligned by clean
base fast-forward with PR62 merge `a3da16a`. Complete its exact independent
validation/review, then guarded PR merge/deploy/BOTH restart/scoped verification
for feedback. Its seven rows use shared PercentageBackground and compact
MetricValue plus truthful structural loading; no production cutover is included.
PR62 is shipped and independently postverified as recorded in PROJECT_STATE;
prior pending-PR62 directions below are historical. Preserve all remaining named
tracks and do not expand this slice to server/MCP architecture migration.

The current user priority is the PercentageBackground/Thermals refinement on
`codex/u1-percentage-background`, based on exact merged PR61 `e8edc38`. Decision
0033's addendum defines the closed value/max/color/children API, neutral invalid
ratios/colors, nonintercepting decoration and list-owned layout/seam contract.
Complete its exact author gates, independent validation and formal review, then
deliver the approved PR through guarded merge/deploy/BOTH restart/verification
for prompt feedback. Do not copy changes into the dirty original checkout.
New TypeScript/JavaScript uses arrow functions unless a concrete technical
requirement is documented; do not broadly rewrite unrelated code.

PR61 was merged and operator-verified as release
`20260901-e8edc38-pr61-20260901T125836-f29e60` on BOTH restarted services;
PROJECT_STATE records the attributed deployment checkpoint. The prior candidate
instructions below are historical, not the current execution order. This is
still the SvelteKit private lab, not a production migration. Preserve all-nine
skeleton/gallery, eight other composition migrations, Bed Mesh axes, read-only
Console, model/layer progress, Camera and per-widget cutovers as pending work.
Immediately after the PercentageBackground/Thermals release, apply the same
primitive to Fans & Air through shared composed rows, compact icon/name/percent/
RPM, neutral unknowns, responsive/skeleton tests and identical delivery gates.
Do not mix that follow-on source into the already frozen Thermals candidate.

Decision 0033/UI-003 is the immediate candidate on
`codex/u1-component-foundation-v1`, exact base `9a9038d`. Freeze the clean
author SHA only after current component/browser/deterministic/full repository
gates and top-of-file evidence are complete. Then perform independent exact-SHA
validation and formal review; renew findings on the same branch only after
stopping reviewers. If approved, ordinary PR merge followed by the standing
guarded U1 ship workflow must explicitly restart BOTH services and verify the
exact merge before returning the private lab URL. Never claim lab fixture,
static route or service health as live printer/device acceptance.

This first slice is intentionally only shared primitives plus fully composed
Thermals ready/loading/refreshing/unavailable/error. Do not widen it to the
remaining all-nine skeleton gallery or eight ready migrations. Preserve their
order and the Bed Mesh enclosure/outer-axis, private sanitized read-only
Console, truthful job-bound geometry progress, Camera lifecycle and per-widget
cutover tracks recorded in decision 0033. Production paths/assets/MCP/auth and
printer/camera remain untouched until separately reviewed scopes.

The current candidate is the all-observation Svelte private lab on isolated
branch `codex/u1-svelte-observation-lab`, based on merged `origin/main`
`f44bd06`. It adds `/dashboard/lab` plus the nine exact non-camera child views
from one 713,802-byte self-contained page (SHA-256
`565c731ef6199c81e5df4f758837c6980fb33d7cc349905d7f16c4acbf17e2eb`).
Camera is marked pending and unlinked. Production routes, MCP assets/inventory,
auth/Tailscale and public HTTP do not change.

Formal review blocked exact `8a6df9b` on post-mount child selection, raw
dot-segment normalization, RGBA rejection, mixed row clocks, Overview clipping
and overbroad validator claims. The renewal chooses the exact pathname during
initial browser creation from a neutral SSR marker, rejects literal/single/
double-encoded traversal before normalization, retains normalized RGB/RGBA
alpha, uses viewer-local row clocks and enforces frozen responsive contracts.

Re-review also required the canonical child title to be the first parsed
non-empty title and the accepted Heads six-percent RGBA-aware wash plus bottom
Copy interaction. The earliest inline bootstrap now owns title/route metadata;
Heads has three valid-color 44-pixel Copy actions, none for Empty/N/A, and one
shared non-flow Copy/Refresh feedback overlay. Review blocked `b3e0c7e` because
the overlay still combined two states and active status followed filament
color. The renewal has one authoritative state/timer for both action orders;
active uses semantic amber while wash/swatch alone follow filament color.
Exact `4e8788f` was subsequently blocked because an older pending clipboard
completion could overwrite newer Refresh. The renewal publishes Copy intent
synchronously, assigns one action generation, and ignores stale asynchronous
success/failure after any newer action.

Author evidence is green: Svelte check 0/0, Vitest 25/25, real Chrome 50/50 at
320/390/590/720, app 276/276 with 3,178 assertions, lifecycle 21/21, shipping
24/24, deterministic packaging, bundles/help/signature and unchanged production
asset hashes. Browser assertions cover the entire initial non-empty title
sequence, exact initial route, one visible panel, zero recorded layout shift,
no required-text clipping, Overview 1/2 columns, Heads semantic active accent,
RGBA wash/latest-action Copy/two columns and
unchanged Bed Mesh geometry. No
deployment, service, printer, camera, auth or Tailscale contact occurred. Next
is exact-SHA review, then ordinary PR delivery only if approved. Each production
migration remains a separate authorized slice.

PR58 exact reviewed head `0b4f1d3` merged as `2cd7d96`; guarded release
`20260901-2cd7d96-pr58-20260901T073117-6df842` runs on BOTH explicitly
restarted, loaded, healthy and integrity-verified services at runtime 0.4.8/
schema 12/observation-v14/camera-v10. Twelve local-plus-tailnet dashboard route
checks return 200 with byte-identical content, sixteen security checks pass and
no rollback occurred. No printer, camera or actual-device acceptance was
performed or claimed.

Decision 0032 also has an isolated implementation candidate for the incremental
Svelte 5/SvelteKit rewrite. It adds only `plugins/u1-print-studio/app/ui`,
app-level UI scripts and durable decision/iteration records. The private lab
route is `/dashboard/lab/bed_mesh`; the candidate packages one deterministic
self-contained `adapter-static` page into the existing private handler without
changing production `/dashboard/bed_mesh`, the directory or any MCP resource.
The public service returns 404 and the generic embed is not packaged.

The candidate's shared primitives are `WidgetShell`, `WidgetHeader`,
`WidgetBody`, `WidgetFooter`, `ObservedMeta`, `IconButton` and `ChartFrame`.
Bed Mesh accepts bridge-injected normalized props only. Independent review
blocked candidate `7aef4b5` because its equal geometry still contained a thin
3D strip and unreadably small sprite labels. The renewed branch-head candidate
uses nine stable 12-pixel HTML axis/bound labels, a full XYZ grid and an actual
projected surface covering 91.9--92.5% of chart width and 53.4--53.7% of chart
height at 320/390/590/720. All labels are visible, in-frame and non-overlapping;
the exact 4:3 3D/2D DOMRect remains invariant and controls remain 44 pixels.
Runtime props now validate freshness, canonical millisecond UTC source time,
bounded profile text, finite rectangular matrix data and supplied summary
agreement within `0.000001 mm`, then render exact recomputed summary values.

Formal review blocked exact candidate `a6363fd` because that profile guard had
not yet adopted the existing adapter allowlist. The corrected branch head uses
Unicode `^[\p{L}\p{N} _.-]{1,80}$`, trims outer spaces and rejects empty,
dot/dotdot, path, URL, bidi, markup and control values while retaining
international letters/numbers and the allowed separators.

Svelte check passes with zero errors/warnings, Vitest passes 8/8, two sequential
builds produce the same 669,506-byte page with SHA-256
`7eaf7f211bed3466665b61bb3d483e6309b9f17f7519f39cf6de44484dcc24ec`,
and full gates pass 274 app tests/2,974 assertions, 21 lifecycle and 24 shipping
tests plus bundles/signature. This is renewed author/implementation evidence,
not independent approval. Next: independently review the exact new branch-head
candidate. Do not deploy, contact services/printer or cut over a production
widget without a separately reviewed and authorized boundary.

PR56 is shipped. Exact reviewed head `e2702dc7a39c45665aa14155e85d13011d50526b`
merged as `cb7d06fdcc4de45f7fb5803fe2efee13364eba0f`, tree
`dc290de12aceebe134b6e3ceb78aa2e8d8789f73`; guarded release
`20260831-cb7d06f-pr56-20260831T234756-96fe19` runs on BOTH explicitly restarted,
loaded, healthy and integrity-verified services at runtime 0.4.7/schema 12/
observation-v13/camera-v9. Sixteen security checks pass, no rollback occurred,
both exact served widget hashes match, and all ten dashboard routes return 200
on both local and tailnet origins. Independent postdeployment validation is
PASS.

Move next to **user visual review and bounded product iteration**, not another
implementation or deployment track. The browser runtime was unavailable during
shipping, so iPhone layout, WebGL rendering/fallback, touch interaction and
live-camera/fullscreen continuity remain pending visual/device gates. No camera
or printer request was made during rollout verification. Preserve the
independently invokable focused cards and compact Overview, their separate
receipts/15-second TTLs/coalescing/stale retention, the closed read-only tool
surface and the no-control/privacy boundaries. Browser/device rendering and
physical user acceptance remain unverified.

### Shipped E compact Overview checkpoint

PR53 merged the Overview application as `4541ff12`; its first guarded shipment
failed the contradictory private Overview 200/404 verifier and verified rollback
snapshot `20260831T195837-6233d9` restored healthy runtime 0.4.5. PR54 head
`a9ad04a` fixed the verifier and merged as
`aa9bd9d609dbdca7c1e0124b4f760d5eb8ddf2c5` at
`2026-09-01T00:10:35Z`. Exact release
`20260831-aa9bd9d-pr54-20260831T201019-d7aa8a` runs on BOTH explicitly restarted,
loaded, healthy and integrity-verified services at runtime 0.4.6/schema 12/
observation-v12/camera-v8. Rollback snapshot `20260831T201038-575d7f` is retained
and was not needed. Configuration, OAuth and routes are preserved; sixteen
security checks pass. Exact served widget/index/status-host hash prefixes are
`a8a4…`/`49a5…`/`008d…`; tailnet index and Overview return 200. One private
Overview refresh reports complete coverage, all eight tiles known and all
contributing receipts fresh and timestamped. No private job, Queue or model data
is retained in this record.

### Shipped D Current Job/real History checkpoint

PR51 exact head `30f1c7bb407d08d19d390acf2b5704a30eff010f` passed formal and
independent approval and merged as `23f07e37de668fcbf2677a9a9b27bf01448cc8e7`.
Release `20260831-23f07e3-pr51-resume-20260831T191106-be85c4` runs on BOTH
explicitly restarted, loaded, healthy and integrity-verified services at 0.4.5/
schema 11/observation-v11/camera-v8. Sixteen security checks pass with config,
OAuth and routes preserved. Tailnet index/jobs/job_history return 200. One
sanitized Current Job and one History read confirm known/fresh bounded telemetry
semantics without retaining filenames, projects, IDs, raw rows or a history-
total claim. Visual/device acceptance remains unverified.

### Shipped C Fans & Chamber checkpoint

PR49 exact head `c14e92cfc655d0b7a6e7d0138650d7937789d7d1` was formally
and independently approved and merged as
`3ab4ed7813a8f2ba45ac63b3093480183c428f28`. Release
`20260831-3ab4ed7-pr49-resume-20260831T182603-74d978` runs on BOTH explicitly
restarted, loaded, healthy and integrity-verified services at 0.4.4/schema 10/
observation-v10/camera-v8. Sixteen security checks pass with config/OAuth/routes
preserved. Tailnet index/Fans/Thermals return 200. Exactly one Fans and one
Thermals POST at shared source time `2026-08-31T22:27:06.974Z` returned
known/fresh environment telemetry; browser/device visual acceptance, sensor
accuracy, health and safety remain unverified.

### Previous shipped Queue checkpoint

B Queue is shipped in PR47: exact reviewed `1068add`
was approved without findings and merged as
`6d76f9ac1c1c6daded28f3b0b945c934e56504e0`; guarded shipping installed
`20260831-6d76f9a-pr47-20260831T172710-645971`. BOTH services were explicitly
restarted and are loaded/healthy/integrity verified at 0.4.3/schema 9/
observation-v9/camera-v8. Fourteen static and sixteen security checks pass with
configuration/auth/routes preserved and no rollback. Independent postdeployment
checks confirm 15 exact manifest files, both service targets, three health/seven
exact local-tailnet static checks, and exactly one known/fresh paused-empty Queue
refresh at `2026-08-31T21:31:36.003Z`; exact served-widget semantics pass.
visual/browser/device acceptance remains unverified. At that checkpoint the
recorded order was C → D Current Job/History → E Overview; the authoritative top
section now records C/D/E shipped and visual review next.

### Previous Queue source checkpoint

B Queue began from PR46 merged base
`bd7abc8f07f7bbe1fdd47e45eabaf41b8b7110b2`. Decision 0029's Queue addendum and
OBS-012 specify the focused integration of foundation `4fbb96c`: application
store/independent receipt and attempt TTL, safe bounded projection and white
Queue card/index, top information with bottom Refresh, explicit empty/stale/
unknown/unsupported/unavailable semantics. Application implementation and
independent acceptance target runtime 0.4.3/tool schema 9/observation-v9/
camera-v8 with nineteen resources and observation-v8 retained. No new Queue
merge or deployment is claimed. Author checks pass 223 app tests/3,150
assertions. Independent checks pass the repository suites plus 21 lifecycle,
22 shipping and 15 focused tests/7,049 assertions, TypeScript/diff checks, three
bundles/code signing and six exact emitted assets. Formal review's singular-
summary grammar finding is corrected; renewed author and independent gates are
green with no findings. Proceed to exact-SHA review.
At this historical source checkpoint, preserve A/F/Heads and the planned C → D
→ E order. Exact-SHA approval and guarded shipping subsequently completed for B
and C as recorded above.
Browser discovery remains unavailable; visual/device acceptance is unverified,
not an automatic block on the user's deployment-first review order.

### Previous shipped Heads checkpoint

The user's Heads reference refinement is shipped in PR45. Decision 0029's
addendum fixes actual-color 6% white washes, exact solid swatch/hex and accessible
Copy, real tool/state/material/temperature, bottom Refresh and unchanged physical
mapping/presence/independent material freshness. Source is frozen at 0.4.2/schema
8/observation-v8/camera-v8 with eighteen resources; author checks pass 106 tests/
2,290 assertions and TypeScript. Independent validation passes 200 app/2,855,
21 lifecycle, 22 shipping, 86 fixtures/751 assertions and all bundles/exact
assets. Exact reviewed `e369ca4` was approved without findings and merged as
`90d9f9d353c7bca2c299ab7ae949ad81e7d4faca`; installed release
`20260831-90d9f9d-pr45-20260831T152746-190348` runs on BOTH explicitly restarted
services. Loaded health/integrity, fourteen static and sixteen security checks
pass with config/auth/routes preserved and no rollback. Independent postrelease
checks pass both fifteen-file manifests, three health/seven exact static checks,
one fresh four-head/material read and 35 exact served-widget VM assertions.
Browser/device visual and native clipboard acceptance
remain unverified. Merge these docs-only rollout records without redeploying
unchanged application bytes, then resume B Queue → C → D → E. Keep every pending
track and the standing guarded delivery sequence for future application changes.

F is now shipped: PR43 reviewed `41546d9e3ea841bdd23279694079719327f39f39`
merged as `92a62c04c22600ee802d7be3c0b27285135f6d33`; installed release
`20260831-92a62c0-pr43-20260831T150042-2e7c64` reports 0.4.1/schema 8/
observation-v7/camera-v8. The read-only plan and guarded execution passed;
BOTH services were explicitly restarted and are loaded/healthy/integrity
verified. Fourteen exact static and sixteen security checks pass, preserving
OAuth/environment/config/routes without rollback. Independent exact-release/
manifest, fourteen local/thirteen tailnet static and tailnet-health checks pass;
one private refresh returns a known/fresh active 11 by 11 mesh at
`2026-08-31T19:03:22.696Z`. Browser/device visual acceptance is unverified.
Merge only these docs-only rollout records without redeploying
unchanged app bytes, then integrate Queue while the user reviews F.

Previous release A was deployed in PR41: reviewed head
`744f7d06607526a10997b926d91b18087c4030cf` merged as
`b6142de6241cb2e1b6ac70b509f2d0b0e836f1d8`. Installed release
`20260831-b6142de-pr41-20260831T140555-84d50f` reported 0.4.0/schema 8/
observation-v6/camera-v8 on both explicitly restarted public/dashboard services.
Loaded health/integrity, fourteen static and sixteen security checks pass;
OAuth/environment/config/routes are preserved, no rollback needed. User
authority explicitly moved visual review after deployment for this release.
No automated or actual-device visual pass is claimed.
Independent checks additionally confirm the exact installed release, twelve
exact asset comparisons, four user-facing pages, fresh four-head materials and
a structurally valid real JPEG snapshot. This is not live-video or image-quality
acceptance.

The authoritative queue is the current iteration's `WIDGET_TRACKS.md` and
decisions 0029/0030. Complete **all** pending widgets; newer feedback does not
erase earlier requests. Sequential independently shipped slices are A materials,
white cards/index, selected camera and continuous progress (deployed),
F interactive reported Bed Mesh surface (deployed), B real Queue, C fans/chamber,
D Current Job/real History, and E composed overview. Bed Mesh was restyled
with A; the user's latest Fluidd reference now prioritizes its 3D surface
inside the white card, without the dark dashboard or printer/profile controls.
Preserve independently invokable skills and the jobs/history split. Keep
incomplete index labels truthful. Preserve unrelated
checkouts; inspect and integrate any earlier Queue WIP explicitly.

Current F checkpoint: source is 0.4.1/schema 8/observation-v7/camera-v8 with
seventeen resources. Formal review's P2 centroid-sort occlusion defect is
corrected; final widget `c800447` passes independent geometry/regression checks.
Final validation passes 194 app tests/2,731 assertions, 21 lifecycle, 22 shipping,
22 independent tests/1,162 assertions, TypeScript/repository and all bundles/
exact assets. Exact head `41546d9` was independently approved and shipped in
PR43; do not repeat its deployment. Preserve the
same-sample XYZ chart, visible height multiplier, pointer/keyboard orbit/reset,
and 2D fallback, preserving flat/inactive/unknown/stale and independent-time
semantics. Use no new printer reads, resampling or interpolated-matrix fallback.
For each subsequent widget, retain independent exact-SHA approval and guarded
merge → deploy exact merged bytes → explicitly restart BOTH services → verify. Fresh allowed
browser discovery is unavailable; preserve visual QA as unverified rather than
re-blocking the user's deployment-first visual-review order. Check VALIDATION
for actual source evidence before advancing this checkpoint.

The latest selected camera has status/FPS/frame time in a white header outside
the genuine image, superseding prior bottom-information overlays. Progress is
continuous amber with slim green reported percentage, not layer blocks. Do not
invent speed/height or other metrics. Material reads use the prefixed
`print_task_config` fields in decision 0029 and physical array index + 1, not
print mapping or local preset sync. Keep independent domain times/freshness.

Release A had sixteen resources; F adds observation-v7 for seventeen. Retain
real material metadata, white cards/index, camera header/snapshot feedback/
native fullscreen and continuous progress. The lower progress row is elapsed-only, without invented metrics;
the contrast P2 is resolved. These docs-only rollout records require no
redeployment of unchanged application bytes. Next integrate Queue while the
user reviews A/F. In particular,
visually assess camera's
muted combined state/FPS/time label against the reference's differentiated
text and vertical separators; no 1:1 fidelity claim is established by tests.
Queue's three-file standalone adapter/model/test foundation is locally committed as
`4fbb96c7201398c125006cafc5050b84a875af1e` on `feat/u1-queue-completion`.
Independent bounded source/protocol review approves it, closing the prior
credential-basename P2. TypeScript, 40 tests/461 assertions and six independent
tests/68 assertions pass. Its store/projection/widget integration remains next
now that F is shipped.
Continue source work in stacked B–E branches while A's user visual review is
pending; current sequential reviewed release order is A/F (deployed)→B→C→D→E;
there is no integrated Queue widget or rollout. Retain B–E in the queue.
Never claim an old design-QA pass for new assets. No printer control,
queue/history mutation, preset/project
write, auth/Tailscale change, plugin reinstall, or Mac login work is included.

## Historical execution checkpoints

Bottom-left camera information and bottom-right controls are implemented.
The reproduced missing-FPS defect is duplicate frame watchers after repeated
same-peer track events; prior watchers are now cancelled and stale callbacks
generation-guarded. Author checks pass 83 tests/862 assertions and TypeScript.
Independent native-browser evidence includes six captures and synthetic
playback retaining about 30/31 FPS after repetition. This is not proof of the user's device-specific cause
or an actual printer stream. Source 0.3.5/schema 7/observation-v5/camera-v7
(v6/v5/v4 aliases, fourteen resources) is now reviewed and deployed in PR38:
`a35c92c` reviewed, `b565eec` merged, release
`20260831-b565eec-pr38-20260831T130407-2e3c85`. Both services were explicitly
restarted and are healthy/integrity verified; fourteen static and sixteen
security checks pass with private configuration/authentication/routes
preserved, without rollback. Finish only this docs-only rollout-record merge;
source/tests are unchanged and need no redeployment. Queue/minimal-progress
work and actual user-device acceptance remain separate.

The live-only FPS slice is shipped in PR36: reviewed `40d359b`, merged
`3fc918e`, release `20260831-3fc918e-pr36-20260831T124701-e914a1`. Both U1
services were explicitly restarted and verified at 0.3.4/schema 7/
observation-v5/camera-v6, with fourteen static and sixteen security checks
passing and private configuration/authentication/routes preserved. No rollback
was needed. Its docs-only rollout record is merged without redeploying unchanged
app bytes. Queue/minimal-progress work and actual phone/
live-video acceptance remain separate pending tasks.

Previous PR34 rollout: reviewed head
`97b5106d29e1d5c3d3dde4aa7810724d2d3bcce1`, merged revision
`7194361d4a8d7a2291bcc64f1d053eae51a8d99c`, release
`20260831-7194361-pr34-20260831T121439-3ba53f`. The repository shipping workflow
completed local validation, guarded merge, exact-build install, explicit
restart of both U1 services, and verification. Both report 0.3.3/schema 7/
observation-v5/camera-v5, loaded/healthy/integrity verified. Fourteen static
and sixteen security checks pass; OAuth/configuration/routing are unchanged.
Independent live verification reads one known/fresh active 11 × 11 Bed Mesh
(-0.340833 to 0.066667 mm; range 0.407500 mm) and visually checks a real
269,416-byte JPEG. Neither establishes calibration quality or phone/live-video
acceptance; no printer controls or live stream were invoked.

The docs-only rollout record is merged in main `3eeb926`; no second service
deployment was needed for unchanged app bytes. Preserve rollback
material privately. Queue WIP remains in its separate checkout, while minimal
progress redesign and mounted-phone/live-video verification remain pending.
Do not resume an old failed shipping attempt or redeploy PR33 from the
historical instructions below.

## Pre-rollout checkpoint (superseded by successful PR34 shipment)

The repository-only `u1-ship` skill/script (decision 0028) and real read-only
Bed Mesh slice (0027) are implemented and software-validated. Finish final
independent approval of the exact committed head, create its PR, and use the
shipping workflow. Validation passes 165 app tests/2,200 assertions, 21
lifecycle and 21 shipping tests, 24 independent focused tests/228 assertions,
nine rendered captures, fifteen browser checks and twenty-eight routes,
with no external requests/unintended acquisitions; all three bundles,
signatures, asset comparisons and TypeScript pass. Seven independent shipping
method checks and skill validation also pass. The current task authorizes
merge, deployment of the merged build, restart of BOTH U1 services, and
verification; preserve OAuth/configuration/routing and do not reinstall the
plugin or control the printer. The source target is 0.3.3/schema 7/observation-v5;
it is not yet merged or deployed. Queue WIP remains excluded in its separate
checkout; minimal-progress feedback remains unresolved. Camera JPEG acquisition
is separately verified below, not mounted-phone/live-video behavior.

Urgent PR33 rollout is DONE: merged `7b9c4d4`, installed release
`20260831-7b9c4d4-widgets`, runtime 0.3.2/schema 6/observation-v4/camera-v5,
both services explicitly restarted, loaded/healthy/integrity verified.
Fourteen static and six security checks passed without printer observation,
control, plugin reinstall, or authentication/routing changes. Record new
rollouts separately; do not repeat this completed rollout from stale notes.
An additional independent pass verifies thirteen exact static and seven
security checks plus a visually inspected real JPEG (232,522 bytes, observed
`2026-08-31T15:50:03.971Z`). Snapshot acquisition works on this deployed release;
mounted-phone/live-video behavior and pending Bed Mesh remain separate gates.

## Historical source checkpoints

The pending-delivery, no-rollout-authority and live-0.3.1 wording below records
earlier checkpoints; it is superseded by the current execution order above.

Decision 0025's Current Job/Job History split is implemented in source.
Preserve `jobs` for Current Job and add only `job_history`, with separate
projections and directory entries. Unknown history must not become an empty
successful result, a current-job leak or a fabricated history timestamp.
Current source is runtime `0.3.2`, schema `6`, observation-v4; v3/v2/v1 are
current aliases, camera-v5 and frozen legacy bytes are unchanged. There are
nine observation values, nine directory links, eleven resources and unchanged
two-visible/eight-app-only tools. Independent validation passes 148 app tests/
2,011 assertions, 21 lifecycle tests, TypeScript, repository checks, all bundles/
signatures, widget comparisons and skill validation. Six rendered captures,
nine browser cases and thirty route checks pass with zero external requests,
browser errors or fixture acquisitions. Independent code/visual review approves
without findings, with 30 tests/1,085 assertions and all six captures checked.
Deliver a new
PR and merge after approval as the user authorized. Do not deploy, reinstall,
restart services, change auth/routes, contact the printer or implement history
acquisition under this split request. Information remains above actions.

PR32 merged as `47bfd37`; PR31 rollout records merged as `16169c0`. Do not
resume their old pending-delivery instructions below. Live services still run
release `20260831-48a106d-widgets` at `0.3.1`/schema `5`/observation-v3/camera-v5;
merged source and deployed bytes are distinct evidence layers.

Merged source in PR32 follows the user's latest principle: information above,
actions below. Observation title/time/freshness/errors are at the top;
Refresh/Retry alone occupy the footer. Camera status/time/feedback are at the
top, with display/live controls bottom right. This supersedes prior bottom-time
instructions. Layer math and camera JavaScript are unchanged, but both HTML
hashes change. Independent validation passes 144 app tests/1,931 assertions,
21 lifecycle tests, TypeScript, repository/bundle/signature checks, exact asset
comparisons and ten browser captures. Code/visual review approves without
findings, with 71 tests/1,576 assertions independently passing. Update PR32.
No deployment or merge authority is included. Prior records below describe
earlier accepted states, not placement instructions for the current source.

The previous source follow-up, delivered as `081929e` in PR32, moves camera PiP/fullscreen beside
Go Live/Close, preserving 44-pixel controls and complete timestamps through
narrow wrapping. Camera JavaScript and segmented-progress bytes are unchanged.
Independent validation passes 143 app tests/1,865 assertions, 21 lifecycle
tests, TypeScript, repository/bundle/signature checks and five browser captures.
Independent code/visual review approves without findings, with 51 tests/556
assertions independently passing. Update PR32, not a new PR.
Both refinements remain undeployed and require separate merge/rollout authority.

The user's segmented-layer progress strip is the delivered PR32 baseline. Read
decision 0023's dated refinement. Source implementation is complete in the
current observation HTML and its VM tests: 24/48 responsive block budgets,
valid layer-position fill rather than reported print percentage, partial
current groups, unavailable invalid data, and one accessible progressbar.
Card layout/footer, MCP/bridge, camera, schema and version labels are unchanged.
Independent validation passes 142 app tests/1,849 assertions, 21 lifecycle
tests, TypeScript, repository checks, three bundles/signature checks and exact
bundled/frozen asset comparisons. Twelve screenshots and eight isolated browser
behavior cases pass. Independent code and scoped visual review approve without
blocking findings; the reviewer independently passes 58 tests/1,441 assertions.
Update that existing PR with the separately reviewed camera follow-up. Do not merge, deploy, install, restart,
or contact the printer under the completed PR30 rollout authorization.
Source and installed baseline both say `0.3.1`/schema `5`/observation-v3/
camera-v5; require exact asset bytes to distinguish the segmented source from
the still-continuous deployed strip. The historical rollout paragraphs below
remain valid evidence, not current execution instructions.

The user authorized PR30 merge and rollout to the two existing HTTP services.
[PR30](https://github.com/scottchu/orca-slicer-mcp/pull/30) merged as
`48a106d2f17550bab8dc8648af1c7c247610a228` on 2026-08-31. Clean-source
staging, dry-run and paired installation passed for release
`20260831-48a106d-widgets`. Independent checks accept both services at runtime
`0.3.1`, schema `5`, observation-v3/camera-v5, exact static assets and preserved
private state/access boundaries. Directory-only deployed browser checks passed
at 390/light and 720/dark with no overflow, subrequests or errors. No plugin
reinstall occurred; do not repeat the completed rollout. Mac login/power,
auth/routes, printer access/control and missing-domain implementation remain
excluded from this authorization.

Decisions 0023/0024 are implemented and independently approved: runtime
`0.3.1`, schema `5`, observation-v3/camera-v5, quiet bottom footers and camera
overlays, finite host loading, and a static eight-link private directory at
both dashboard roots. Directory loading never mounts a widget or acquires
data/media; focused URLs remain unchanged and overview is deferred. The index
is embedded in the HTTP bundle, preserving older release asset requirements.
Observation-v2/v1 and camera-v4 are current aliases; frozen legacy bytes, ten
resource URIs, and two-visible/eight-app-only inventory remain compatible.

Final source validation passes 135 app tests/1,006 assertions, 21 lifecycle
tests, TypeScript, repository checks, all bundles/signing, six directory
captures, 20 route checks, and 12 keyboard checks with zero acquisition.
Earlier decision-0023 isolated fixtures captured 67 observation and 22 camera
states, with 13 camera behavior and three keyboard/unavailable checks passing.
Independent code and scoped visual review reports no findings; see
`design-qa.md`. This accepts source and synthetic rendered fixtures, not actual
iPhone/PiP, printer behavior, or user comprehension. The separately installed
personal plugin remains its PR28 version; do not imply the HTTP rollout updates
the plugin or an already-mounted host.

The following PR28/PR29 records are historical baseline and recovery evidence,
not instructions to repeat their installation or permission to broaden scope.

PR28 merged as `2160492a4ce63d1409673786ea02b253d7cfaace`, combining PR27's
exclusive camera routing with focused widgets and decision-0022 persistence.
Personal Marketplace version `0.2.0+codex.20260831033612` is installed from that
merge with exact runtime, production HTML, and all five skill folders verified.
The runtime source/stage/cache SHA-256 is
`c4029f18678e1839c0b005e37bc7401bf84bcc6ed7ef3d19155286253c2f018b`.
Prior personal source remains recoverable locally. The user authorized only
the existing two owner LaunchAgents with a versioned release/copied pinned Bun.
Mac automatic login/power, routing/auth changes, and printer controls remain
out of scope. Preserve decision 0020 fan-out, decision 0019 activation, decision
0017 secure remote access, and decision 0016's local-first normal-user direction.

Decision 0022 originally added fixed private focused routes defaulting to progress and a
shared observation store across HTTP calls within each process. It does not
create cross-process/restart storage, subscriptions, background camera, a root
daemon, or an MCP Admin tool. Health/static routes must not contact the printer.
Decision 0024 supersedes only the root redirect with static navigation.

The secure source and compatibility repair are merged. Pull request 20 is
`4d4ea2f`; pull request 22 adds the camera-only presentation as `333bebe`;
pull request 24 adds the activation repair as `62acd4c`; and pull request 26
merges decision 0020 as `4f9041c`. Preserve OAuth state and every existing
Serve/Funnel route.

The decision-0019 source repair makes `open_printer_camera` the only
model-visible camera action. The app-only frame helper mints a one-time private
activation only after Go Live; stream open consumes it, and unanswered offers
release after 15 seconds. The focused descriptor is `camera-v2.html` with v1
served as a current-asset compatibility alias. Health and doctor report runtime
0.2.0, tool schema 3, and camera widget v2. Source validation passes with 71
tests and 417 assertions; delivery/install evidence is recorded separately.

Historically, decision 0020 was installed from pull request 26 as Personal Marketplace version
`0.2.0+codex.20260830013924`. Both existing services then restarted and reported tool
schema 4 plus camera-v3; OAuth state and Tailscale routing stayed unchanged.
That earlier installed surface had exactly three model-visible tools and five
app-only helpers. Camera-v3 adds repeated-open camera-only presentation
semantics and one private H264 printer upstream with bounded independent
downstream peers, exact H264 payload selection, coalesced PLI feedback,
termination-race cleanup, distinct ICE credentials, independent Close, and
last-viewer upstream release.

The first user test after installation created a new conversation inside a
Codex Desktop process that still predated the reinstall. That process did not
expose `open_printer_camera`; the model selected `u1-monitor-print` and
substituted `show_u1_status`, mounting the entire status card. Treat this as an
unaccepted stale-host and guidance regression, not a camera-v3 widget build
result. The source guidance now routes standalone camera requests only to
`open_printer_camera`; if it is missing or its resource cannot load, report the
stale/unavailable connection and stop. Never call status, frame, or stream
helpers as a substitute. A full Codex Desktop quit and relaunch is required
before mounted acceptance.

The decision-0021 implementation adds one shared in-process observation store.
After initial acquisition, plain presentation reads are cache-only; explicit due refreshes call the
upstream adapter, concurrent refreshes coalesce, and failed/offline refreshes
retain the last reachable values as stale with their original source time.
Every `observe_printer` call projects only its selected module. Progress,
thermals, and heads are implemented from normalized fields; jobs current state
is limited, and queue, fans, bed mesh, cavity, filament material/color, and
history remain honest unknown/unavailable values pending live mapping evidence.
Overview is deferred. Current source resources are observation-v4 and camera-v5;
observation-v3/v2/v1 and camera-v4 are current-asset aliases, while status v4/v3 and camera v3/v2/v1
serve frozen legacy bytes.

The implementation is a desktop-local read-only connector. A normal user must
not need Tailscale, MagicDNS, public DNS, manual OAuth, environment-file
editing, or Bun. Do not restore the stale direct-HTTP hosted widget path from
decision 0015.

## Current implementation

- `u1-print-studio setup` writes one owner-only local config containing a
  validated private printer origin and optional bounded explicit STUN URLs.
- `u1-print-studio doctor --offline` checks the configuration and safety
  contract without hardware access.
- `u1-print-studio mcp` starts the desktop stdio connector.
- The hosted widget contains no `fetch(` call and declares empty external CSP
  domains.
- Current source descriptors point to `observation-v4.html` and `camera-v5.html`.
  Observation-v3/v2/v1 and camera-v4 are current aliases.
  Frozen status-v4/status-v3 and camera-v3/v2/v1 resources remain readable for
  retained cards. A plugin upgrade can require a
  full host-process quit and relaunch; a new task alone did not replace the MCP
  process retained by Codex Desktop in the observed regression.
- Live offer, answer, ICE candidates, and close use MCP Apps `tools/call`.
- The connector alone invokes the U1's fixed Printer Operations adapter.
- The fan-out application service owns one private H264 printer upstream plus
  opaque downstream viewers, exact first-RTP codec selection, bounded upstream
  PLI feedback, peer-ID hiding, input bounds, concurrency, duration, expiry,
  abort, generation-safe opening, level-triggered terminal-state observation,
  and independent close.
- Snapshot fallback and the existing 1200 by 1500 PNG remain intact.
- The standalone dashboard may retain the exact HTTP signaling adapter for
  development compatibility.
- `.mcp.release.json` points to a staged self-contained executable; the source
  `.mcp.json` remains a Bun/env-file developer adapter.
- Public OAuth and MCP require standard HTTPS and `u1.monitor`; public
  `/auth/enroll*` rejects.
- A configured same-hostname private enrollment origin requires a distinct
  loopback port and binds an enrollment-only listener. Its health remains
  available after restart with an existing credential while enrollment returns
  404.
- HTTP env STUN overrides optional owner-config STUN. ICE defaults empty.
- TURN REST derives bounded per-peer credentials from configured TURN URLs
  and a server-only shared secret. The secret never leaves the server; derived
  credentials remain widget-private. Upstream printer ICE and downstream viewer
  ICE are distinct; reachable Tailscale host candidates can avoid TURN.
- The HTTP service may run from env without a standalone config. The stdio
  standalone continues to require its owner-only config.

Current source model-visible tools are exactly:

1. `observe_printer`, with required view `overview`, `progress`, `thermals`,
   `heads`, `jobs`, `job_history`, `queue`, `fans`, or `bed_mesh`
2. `open_printer_camera`

Current source app-only tools are exactly:

1. `refresh_printer_observation`
2. `show_u1_status`
3. `get_u1_status`
4. `get_u1_camera_frame`
5. `open_u1_camera_stream`
6. `answer_u1_camera_stream`
7. `add_u1_camera_ice_candidates`
8. `close_u1_camera_stream`

All are read-only. Stop if upload, start, pause, resume, cancel, G-code, generic
proxy, Control, or Admin behavior appears.

`show_u1_status` and `get_u1_status` are compatibility aliases only, not model
intents. Every non-camera view projects the same normalized observation and
preserves time, freshness, connection epoch, session identity, provenance, and
capability evidence. Camera retains its separate acquisition time and camera-v5
lifecycle. The one user-facing procedural observation skill is
`$u1-observe-printer`. The current installed plugin carries schema 5,
observation-v2, camera-v4, and the same two-visible/eight-app-only inventory.
Earlier decision-0020 records are historical, not current installation claims.

## Validation boundary

The active iteration's `VALIDATION.md` records the exact commands. Decision
0021 passed 101 tests with 594 assertions before integration; PR27's standalone
camera routing slice passed 93 tests with 569 assertions on its separate tree.
The combined baseline passed TypeScript and 105 tests with 606 assertions before
persistence changes. The implemented focused-route/shared-store tree passes
TypeScript, 110 tests with 759 assertions, both stdio/runtime bundles, and local
signature checks. The pre-rollout lifecycle CLI passed 19 fixture tests;
the final race-repaired CLI passes 21. Independent review approved the combined source with no blocking findings, including the
repository contract and bundled health/static smoke with zero synthetic
printer reads. Post-merge installed/service evidence is recorded separately in
the active iteration. The macOS arm64
standalone runtime builds with dotenv/bunfig autoload disabled, receives a
validation-only ad-hoc signature, prints help, writes a schema-2 `0600`
configuration, preserves explicit STUN, and passes offline doctor without Bun
on its invocation path.

Browser fixture review accepted Progress, Thermals, Heads, and separate Camera
at a narrow inline viewport. This, the bundles, and the full suite are static or
fixture-only evidence. No live printer, install, service, OAuth state, or route
was contacted or changed for decision 0021.

The decision-0019 source suite has 71 passing Bun tests with 417 assertions.
Its compiled camera asset is embedded in the standalone runtime. A private
loopback source dashboard mounted the exact current camera component, obtained
a real snapshot, rendered live video at an observed 23 FPS, and returned to
snapshot after Close. Live state is gated on an actually rendered frame; play
rejection, no first frame, track termination, stall, and video error activate
snapshot fallback. This is private-browser/real-printer evidence, not installed
MCP-host evidence.

The software/source suite alone proves local static/software and simulated
protocol behavior only. It does not prove:

- Homebrew or npm installation;
- production signing, notarization, update, or rollback;
- an owner-selected open-source license or third-party notice review;
- another OS or architecture;
- a real TURN allocation;
- a mounted desktop or mobile MCP App;
- browser playback;
- physical safety or user outcome.

Separate post-merge evidence below accepts this machine's Personal Marketplace
installation, live public/private routing, and bounded read-only real-printer
status, snapshot metadata, offer, and close. It does not extend the source-suite
proof to other machines, distribution channels, control actions, or visible
playback.

Independent pre-merge review added regressions for rewriting a previously
broader-permission config and for closing a valid camera session when the rest
of its stream envelope is malformed. Both fixes are included in the passing
suite.

Historically, pull request 26 merged decision 0020 as `4f9041c`; Personal Marketplace version
`0.2.0+codex.20260830013924` was installed and both services then reported schema
4/camera-v3. That inventory was three model-visible tools plus five app-only
helpers. Earlier private-dashboard Live results belong to direct-session
predecessors and do not prove the installed fan-out or mounted host. No TURN
service or shared secret is configured.

## Next smallest action

Current Job and Job History pass independent validation and code/visual review.
Deliver a new PR and merge the approved slice under the
user's merge-as-we-go instruction. Use source runtime `0.3.2`, schema `6`,
observation-v4 and exact asset hashes from this slice's validation record.
Neither merge nor directory availability proves new deployed bytes or history
integration. Service/plugin rollout still requires separate authorization.

PR30 merge `48a106d` and paired rollout are complete with independent approval;
the `2026-08-31 authorized merged-service rollout validation` entry in
`VALIDATION.md` records those deployed checks. Next obtain
user feedback on the directory and focused widgets. Preserve OAuth state,
private env/config, every Serve/Funnel route, and unrelated canonical-checkout
documentation. Use health/static reads only for this gate; opening a focused
widget can acquire printer data and is not a hidden health check. The earlier
PR29 exact-label restart repair and its 21 lifecycle tests remain intact.
For a future separately authorized rollout, use
`uv run --no-project scripts/u1_service.py`: first
`stage --source ABS --bun ABS --release ID`, then
`install --release ID --dry-run`, then authorized `install --release ID`.
The source must be clean/committed. Follow with `status` and the intended
`start|stop|restart --service all|public|dashboard`; recover with
`rollback --snapshot ID` from the install result. The default state root is
`~/Library/Application Support/U1 Print Studio/service`, and releases copy Bun
to `bin/bun`; they do not depend on the original Bun binary remaining present.
Explicit private env is preserved, ambient dotenv/bunfig loading is disabled,
and relative effective auth/config paths fail before stops. A cold store still
acquires once on first demand; health/static requests never acquire.
A separate plugin upgrade may be needed
before a new MCP-host task has these assets; no plugin reinstall is included
here. Camera requests must never substitute a status card. Real-phone
fullscreen/PiP, mounted behavior, live mappings, two-viewer fan-out and overview
remain separate scope/evidence gates. Mac login/power remains deferred.

## Preserve

- Orca Preparation and Printer Operations remain peer subsystems.
- MCP, CLI, and optional HTTP are inbound adapters around shared application
  policy.
- Status, snapshots, live signaling, and this connector's printer operations
  remain read-only.
- Observation, recommendation, authorization, action, and verification remain
  distinct.
- Slicing, artifact validation, upload, start acknowledgement, observed
  printing, and physical acceptance remain separate evidence.
- Tailscale and personal OAuth remain optional developer adapters, never
  normal-user requirements. Enrollment is tailnet-only and TURN secrets stay
  server-side.
- Repository records are durable project memory.

## Copy-paste restart prompt

```text
Resume this repository from AGENTS.md, PROJECT_STATE.md, NEXT_AGENT.md,
docs/requirements.md, the active iteration, and decisions 0014 through 0025.
CURRENT: source-ready0025splitsjobs(CurrentJob)andjob_history;0.3.2/schema6/
observation-v4,aliases3/2/1,camera5,9views9directorylinks11resources,tools2+8.
Independent148tests2011assertions21lifecycle/allbundles/skillvalidationpass;
6captures9browsercases30routechecksalsopass; independentcode/visualreview
APPROVES30tests1085assertionsandall6captures,no findings. DelivernewPR,
thenmergeasexplicitlyauthorized. No deployment/plugin/services/printeraction.
PR32merged47bfd37andPR31recordsmerged16169c0;followingrecordsarehistorical.
The earlier source task was decision0023's dated segmented-layer refinement. Author
implementation and independent validation pass142app/1849assertions21lifecycle,
12screenshots8browsercases. Independentcode/visualreviewAPPROVES with58tests/
1441assertions passing; it is delivered in PR32. The camera-controls follow-up
081929e is also delivered. CURRENT principle supersedes bottomtime: information
TOP,actionsBOTTOM across observation/camera. Independent144tests1931assertions,
21lifecycle10captures andcode/visualapproval71tests1576assertions pass.
UpdateSAMEPR32. Neitherassetisdeployed;
unchanged0.3.1/schema5/observation-v3 labels do not establish exact installed bytes.
Prior merge/rollout authority is complete and does not authorize this new slice.
PR30 merged as48a106d after explicit merge+two-service-rollout authorization.
Decisions0023/0024 source and isolated visual fixtures independently pass.
Paired HTTP deployment and independent health/static/preservation checks pass;
consult the named authorized merged-service rollout VALIDATION entry.
Directory-only live browser captures pass.
Obtain actual user feedback separately; do not repeat the completed rollout.
Use exact existing owner LaunchAgents, versioned release/pinned Bun, a static
eight-link private directory, fixed focused routes, and one store per process.
Preserve existing OAuth state, private env, routes, and unrelated dirty docs.
Do not reinstall the personal plugin, change Mac power/login, auth or routes,
contact the printer, or implement missing mappings under this rollout. Source exposes
exactly `observe_printer` with its closed nine-view enum plus
`open_printer_camera`; app-only refresh, legacy aliases, and five camera helpers
remain hidden. Source uses observation-v4, camera-v5, frozen legacy resources, one
explicit-refresh/coalescing/stale-retention store, and selected-module
projections. Camera is separate and overview is deferred. Preserve decision
0020 fan-out and the secure remote boundaries. The personal plugin remains its
separate PR28 installation. Actual-phone/PiP, mounted widgets, real-printer
behavior, and user acceptance remain distinct from HTTP asset availability.
```
