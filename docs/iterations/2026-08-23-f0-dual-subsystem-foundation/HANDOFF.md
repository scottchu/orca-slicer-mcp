# F0 dual-subsystem foundation handoff

## Current accepted runtime: dedicated immutable v2 preview server

The first v2 preview runtime was withdrawn after independent
**REQUEST_CHANGES**: the generic fixture exposed dashboard routes and an omitted
camera dependency could fall back to the real camera adapter. The reviewer did
not invoke the camera. Cleanup removed only HTTPS 8451 and
`com.openai.u1-composable-v2-preview`; 4200 is free, raw Serve/Funnel state is
then restored at SHA-256 `d5e0f1b6…`. Later review found the v1 generic fixture
likely shared the same fallback; the reviewer did not invoke it. Endpoint-only
cleanup removed 8450 and `com.openai.u1-composable-preview`. At that cleanup
checkpoint, ports 4199/4200, both preview labels and TCP/Web/Funnel 8450/8451
were absent. Raw Serve/Funnel status was the exact pre-v1 `fab7b9df…` baseline;
production jobs and TCP/Funnel
443/10000 remain preserved.

The committed repair at source `ed504c7a9bbded66831ac35fb5cf2531a929d2cb`,
tree `e33d56896994bd9571a6c0b2a73e3afbb9b8ea5e`, adds
`scripts/serve-composable-preview.ts` and
`tests/server/composable-preview.test.ts`, and changes only the v2 Playwright
server command. It verifies fixed `build-kit-composable-v2` manifest `70f99dc8…`
before serving, preloads an exact page/hashed-asset map, and makes every ordinary
parsed non-allowlisted origin-form path or method 404. Static import guards and an outbound canary establish the
absence of production entrypoint, dashboard/MCP, printer/observation, camera,
auth/config and child-process authority in this server graph.

An architecture exact gate returned **REQUEST_CHANGES** on the first repair
because manifest validation and response loading used different filesystem
passes. The renewed server collects once, validates that exact in-memory
snapshot and derives cloned response bytes only from it; it performs no
post-validation filesystem read. The import guard now covers side-effect,
dynamic and CommonJS imports. CONNECT/Upgrade are explicitly denied and invalid
parser traffic returns deterministic 400/close; raw adversaries prove no 2xx,
preview/asset bytes or outbound authority.

Author gates pass 10 client tests, 20 server/MCP tests with 408 assertions,
TypeScript, Svelte/component contracts, deterministic MCP verification, the
separate v2 build and 4/4 Chrome cases. The 35-path application manifest is
`c8c24103972ee7c0304b7b80c79206bc2eb65a14cde239224716480673a31148`;
the build manifest `70f99dc8…`, Lab HTML `e4be14ad…` and v2 MCP resource
`170fb8f1…` remain unchanged. Exact commands and meaningful harness failures
are in VALIDATION. Architecture and independent exact-source review approve the
`c8c241…` application identity committed by `ed504c7…`.

The separately authorized runtime now runs exact source head
`c44f4c368848a17549dd94ae2a3383fa25420c6e` under launchd label
`com.openai.u1-composable-v2-preview`, bound only to `127.0.0.1:4200`. Tailnet-
only HTTPS 8451 proxies its root; 8451 has no Funnel. Local and Tailnet Lab
responses equal the 51,156-byte `e4be14ad…` HTML, and all 23 required hashed
assets are byte-identical. Current raw Serve/Funnel status is `d52d4444…`, and
removing only 8451 TCP/Web entries restores exact `fab7b9df…`. The v1 4199/8450
preview remains offline; production jobs and Funnel 443/10000 are unchanged.

Author runtime verification, screenshot-first design review and independent
runtime verification each **APPROVE** the exact head/application/build/HTML
identity. Forbidden ordinary routes/methods and encoded/traversal variants fail
closed, and raw CONNECT/Upgrade receives neither page nor asset bytes. Process
inspection found zero children, outbound connections or sensitive file
descriptors. Browser checks through the Tailnet endpoint covered 320/720 at
200% text and every client-local state with zero scenario network requests,
zero overflow and 0px state-height drift. These dispositions cover only the
synthetic private-Lab runtime, not this later documentation tail or production
adoption. There is no real-printer, Moonraker/Klipper, Camera invocation, auth-
flow, public-Internet, phone/device, screen-reader or user-outcome acceptance.

Preserve the running preview unless cleanup is explicitly authorized. Exact
endpoint-scoped cleanup is:

- `Tailscale serve --yes --https=8451 off`
- `launchctl remove com.openai.u1-composable-v2-preview`

Do not repeat source review unless application bytes change and never relaunch
with `serve-kit-fixture.ts`.

## Current accepted experiment: v2 Card/Stack/Grid private-Lab refinement

The UI-003/F0 v2 experiment has three exact-identity approvals. Its 33-path
changed/new application manifest is
`a6cfa40f0f23e62832fa7696a41472c10097b8bbc36141cd5f87af2a4deb2580`;
the isolated 145,363-byte MCP resource SHA-256 is
`170fb8f1dc24cb2a6059b04cc22bce15fa018cbe823dea45f9f1945d94e897b4`.
Author checks pass 10 client tests, 16 server/MCP tests with 92 assertions,
TypeScript/Svelte/component contracts, deterministic resource verification, a
separate Kit build and four Chrome cases. VALIDATION records exact commands,
harness failures, screenshot hashes and limits.

The first exact-candidate design gate requested changes: known/loading/error/
partial/ambiguous geometry diverged by 28–205px at 200% text, the larger 720px
temperature could leave `C` alone, and the fixed-pixel Lab h1 became smaller
than Card h2. The author repair uses font-relative structural reserve geometry
for each closed domain value and the persistent status line, without fake
domain/sample content; target and unit are nonbreaking; and the Lab h1 now scales
in rem.
Renewed Chrome asserts all five states for card/compact/larger at both 100% and
200%, 320/720, with no more than 1px state delta.

Independent exact-candidate review returned **REQUEST_CHANGES** on the
superseded 36-path manifest `3bfe7a…` and 145,207-byte resource `6f8c92…` because
the hidden `FilamentColor` reserve embedded `#E89B3C` as synthetic configured-
color evidence. Its fresh MCP/server run was 13/14, invalidating the earlier
14/14 author claim for that exact identity. The renewed candidate removes every
domain/sample reserve value and hidden status reserve text, uses only closed
structural sizing, and adds generated-resource exclusions plus static leaf/status
reserve audits. That rejected identity remains historical evidence only.

The next printer-domain exact gate returned **REQUEST_CHANGES** on superseded
manifest `0d65c458…` and resource `b529a0b6…`. It demonstrated that arbitrary
Title text could make the fixed T1 subject claim T2, duplicate resolved fields
and transform/visible filament color could disagree under one receipt, and a
global error could still carry a loading source. The renewed candidate replaces
Title text with closed T1-derived content tokens, rejects duplicate fields at
the strict spec boundary, enforces exact repeated-value and transform/tint/color
correlation, and makes error sources only available or unavailable with at least
one unavailable. Partial healthy values remain visible and all error skeletons
are static.

Screenshot-first UI/UX **APPROVES** exact manifest `a6cfa40f…` / resource
`170fb8f1…`: all 60 width/text/shape/state groups measured 0px renderer-height
drift and zero overflow, skeleton minimum was 64.58×17.5px, loading animated,
error remained static, reduced motion removed animation, h1 56px exceeded h2
44px, target/unit stayed atomic, only Card retained a border and forced colors
were neutral. No reserve/sample sentinel remained. Design report SHA-256 is
`64dfadbf482d6f10a85131404f5a354e3ce8ba18b99cdb1c91e1b34ab701c322`.

The project-scoped `printer_domain_expert` **APPROVES** the same identity after
fresh 16/16 server/MCP with 92 assertions and 10/10 client tests, including the
title, duplicate, tint/color, error/loading, target-zero, fan, dedup, timestamp
and partial-static-error adversaries. Independent verification **APPROVES** it
after 27/27 composable/percentage tests, 16/16 server/MCP, TypeScript, Svelte
0/0, component contracts, exact temporary MCP reconstruction and fresh Chrome.
Production registration/imports stayed negative and the v1 resource/build/live
response remained unchanged. One initial compact-partial browser expectation
ignored that compact has no environment dependency; the corrected dependency-
shaped assertion passed and owned children were cleaned.

Changed application paths are the composable schema/planner/view-model/envelope,
fixed specs, server acquisition/factory/fixture, client host placeholders,
Svelte renderer and common Card/Title/Stack/Grid/Reading primitives, private Lab
page, test-only separate Kit/fixture/Playwright configuration, MCP builder and
focused client/server/browser tests. The new generated resource is
`public/mcp-composable-lab-v2.html`; the v1 resource is unchanged.

The v2 wire contract binds T1 once and requires `Card` + `Title` + one `Stack`
or `Grid`. It rejects version 1, Table, Row, DataTable and arbitrary fields.
Layout/density/title tokens are closed. `PercentageFill` wraps only
`HeadTemperature` and derives decoration from its validated actual/target
evidence through common `PercentageBackground`; invalid relations are neutral.
Reader deduplication, exact envelope/provenance correlation, truthful fan
Unknown/unavailable distinctions, partial failures and stable loading/error
topology remain enforced. Production factory imports and inventory stay
negative; only the explicit Lab factory exposes the v2 tool/resource.

The percentage fill remains private-Lab-only and has no accepted production
meaning. Reusing it in production could falsely imply progress, heater
authority, safety margin or target attainment, so adoption needs a separate
semantic contract and review.

Next action, if requested, is user/product review or a separately scoped
production decision. Recompute the source-set identity after any future change
and renew affected review. DataTable is only a future Queue/History hypothesis
pending a separate contract and ADR; do not implement DataTable, Queue, History
or Camera in this slice.

Preserve the reviewed v1 bytes at source `518c644` as historical evidence only.
Its generic preview is offline after the safety cleanup. The v2 build uses
`build-kit-composable-v2`; do not overwrite v1 `build-kit` or relaunch either
preview with `serve-kit-fixture.ts`. No printer, auth, runtime/Tailscale,
production-service, PR, merge or deployment change is authorized.

Evidence remains synthetic private-Lab learning. Three current Title tokens
were rendered and the other two source-inspected. No screen reader, mounted
host, phone/device, public Internet, live Moonraker/Klipper, real printer, user
outcome, production or full repository/browser regression was accepted.

## Historical source: withdrawn tailnet-only presentation experiment preview

Frozen source `518c6440db1d624361a1a804754590def3e330e2`, tree
`a79032b72e04cab6d4dc32a26c4db47024aad5c3`, has the 45-path application
manifest
`7e77c57543784bb223842b90ce57b9ae4555876b0a1f80225cc45c3e192578bd`.
Its isolated MCP resource is 137,936 bytes at SHA-256
`6103ba597d239299ed0845a704720f545ceee27802b7f1cfc4ae6d6f2aec9fe6`.
Author checks pass 8 client tests, 13 server/MCP tests with 75 assertions,
TypeScript/Svelte/component contracts, deterministic resource verification,
the 62-file/80-route/62-hash server build and four Chrome cases at 320/720.
Exact commands, two independent request-changes rounds, screenshot-first design
evidence and final limits are in VALIDATION.
The printer-domain reviewer approved prior manifest
`4437e4f9f032cfffef3405227b7775c3f40dfb3a9326858bee478b2a826115fc`.
A later
whole-range whitespace check caused a formatting-only generator/source cleanup,
full affected author renewal and the identity above. The same project-scoped
`printer_domain_expert`, acting as independent read-only runtime verifier,
APPROVES the exact source/tree for this tailnet-only preview.

The withdrawn synthetic Lab previously returned byte-identical local/Tailnet
body SHA-256
`30d2d4b471f5872252a18c2d564faef025f5417098caa739c29d8e300cb1a6f5`.
Its historical before/after Serve/Funnel hashes were respectively
`fab7b9dfd4001784b7705fe2227cfc619ef58809586609ffb131282f117a535e`
and `d5e0f1b632d6e46581d6e1231fe9e9bdaee286a5ed8ef35820d93f308c0f1cc0`.
Pruning only the new HTTPS 8450 root proxy makes the after state canonically
identical to before; the Funnel allowlist was unchanged and 8450 had no Funnel.
After the later camera-fallback finding, endpoint-only cleanup executed
`Tailscale serve --yes --https=8450 off` followed by
`launchctl remove com.openai.u1-composable-preview`. Raw Serve/Funnel status
after that cleanup was the exact `fab7b9df…` pre-v1 baseline. Port 4199, the v1
label and 8450 remain absent; the separately approved v2 runtime now accounts
for current 4200/8451 as described above. Production jobs and 443/10000 remain.
Do not recommend or perform a generic-fixture relaunch.

Decision0048 accepts only the isolated private-lab experiment: fixed T1, four
closed domain leaves, common layout nodes, strict correlated envelopes,
deduplicated source acquisition, per-value timestamps/provenance, `Unknown` for
ambiguous fan relation, stable neutral error/loading structure, a private Lab
route, and a Lab-only MCP factory/tool/resource. Production registration remains
negative and unchanged. Do not infer a general UI DSL, production cutover, live
mapping, mounted-host behavior, printer truth, deployment, or user acceptance.

Decision0049 preserves a user-selected future Camera direction: move current
top-right information plus loading/error messaging into bottom overlays within
dynamic media. No Camera file changed. A separate screenshot-first candidate
must preserve media/session/control/frame-evidence semantics and pass source,
packaged-host and device review before adoption.

Next smallest action is user/product review of the provisional learning, if
requested. Do not PR, merge, deploy, register the Lab factory in production, or
change printer, authentication or unrelated Tailscale state. Evidence is from
the same enrolled host and is not browser/device visual, public-Internet,
real-printer, Camera, auth-flow or user-outcome acceptance. Any product adoption
requires a new decision and fresh exact-candidate evidence.

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

## Current handoff: independently reviewed monitoring source

[PR102](https://github.com/scottchu/orca-slicer-mcp/pull/102) carries independently
reviewed source; consult the PR for merge identity. Original source base:
`220190f05afd4f785f068254d43f1b0257e9af57`; incoming main incorporated during
conflict resolution: `06e2a903f9ad2426f3580e77e72d65d98cc96d60`. Independent review approved
`3ce5a8cf2975c2c38601ce9832fa49bc50900893`, tree
`9136c5bb13d592c044c546205064baf2343caf4d`, after a decision-table separator repair.

Source scope: monitor/start SKILL.md files; AGENTS routing; MON-001; decision0045
and index; PROJECT_STATE/NEXT_AGENT and the iteration's BRIEF/VALIDATION/HANDOFF.
Four continuity conflicts retain our monitoring prefix and the complete incoming
Camera records. Requirements merged both contracts; decision0045 has no collision.
Approved skill hashes are retained in VALIDATION. Against incoming main, this
change remains documentation/skills only: application, dependencies, configuration,
generated assets and shipping guards are byte-identical. Incoming application
tree `ffc95dccafab2289959a934cc2630339cf5a2d2e` has its own evidence below;
monitoring checks do not validate the Camera changes.

The existing standalone workflow binds one print owner to adaptive observations,
meaningful updates and immediate alerts, bounded recovery and verified outcomes.
Composition begins after observed printing; limited request scope remains limited.
Stopping monitoring does not control the printer. Structural validators and
manual fictional lifecycle walkthroughs passed without executing a model workflow
or using a real printer. No installed-plugin, actual-host or O1/O2 acceptance is
inferred.

Repository agents can follow the maintained source skill. Installed-plugin adoption
and the proposed standardized one-shot observation tools remain separate scope.
No application deployment, cache reinstall or runtime changes belong to this
records-only tail. Preserve concurrent Camera work and earlier evidence gaps.

## Current handoff: PR101 Camera deadline repair deployed

PR101 `0710b4bf55edc6908eef614df5fec48614044497` preserves independently
approved `42cdaca` tree and is deployed with BOTH services restarted. Required
checks, four independent timing adversaries and three scoped browser cases pass;
installed-resource postdeployment behavior with synthetic media passes. Detailed evidence and
prior failures remain in VALIDATION.

Only Live open gains 40 s user wait/55 s RPC retention, with disposed open/close
work bounded at 70 s; other deadlines stay unchanged. Observation v16/Camera v12,
runtime 0.4.10/schema 14 provide 30 resources and preserve all 28 old URI bytes.
The source changes are per-call HostRpc timing, service-owned cleanup, versioned
compatibility packages and affected tests/pins; no new UI or server timeout.

Latest outcome: after initially reporting the same PR101 failure, the user
reported Live connected after a couple of retries, then failed again after about
10 s. The success screenshot shows new compact Switch UI and Live/30 FPS; exact
resource URI is not established. Reliability is unresolved; locate the failing
phase without assuming a root cause. One success does not close C08. Attempt 10 remains isolated
upstream evidence and does not prove why the phone failed. Screen Sharing remains paused. Preserve all 55 IDs, Progress no-action,
F07 discussion, separate c6 and remaining product work. This docs-only tail
preserves application bytes and requires no deployment under0028.

## Earlier handoff: PR99 MCP resources deployed

PR99 merged `4787c02fd8f7ed8833e15d9127e7b9c78e9128ba`, preserving independently
approved `f782378` tree. The guarded release restarted BOTH services and verified
health/integrity/preservation. Scoped postdeployment behavior verification passes with synthetic host data; detailed commands, identities and failed attempts are in VALIDATION.

Camera v11 uses `mcp-camera.html` with shared UI/service and host-result initial
bootstrap; dashboard keeps request bootstrap. Observation v15 uses shared Svelte
Heads and eight existing renderers through one bridge/lifecycle. All 26 old
aliases remain. Changed areas are MCP entries/builds/fixtures, typed host/legacy
adapters, common Mount/host styling, Camera bootstrap/HostRpc, registrations,
versions and affected test/package inputs.

The user now reports renderer adoption on the phone; complete device, OAuth,
clipboard and reliable Live acceptance remain unverified; existing cards only refresh
data. No per-widget skill or plugin reinstall is required by the renderer cutover.

The user reports allowing Bun Local Network access; the machine is unconfirmed
and no LaunchAgent/phone acceptance follows from the current isolated probe. C08 is now resumed as above; Screen Sharing stays paused. Preserve all 55 IDs,
unfinished Queue/Fans/Job History work, Progress no-action, F07 class discussion,
separate c6 and unchanged loading policy. No printer/auth/network actions are
authorized by this record. Markdown-only tail preserves application bytes and
needs no redeployment under0028.

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

Delivered source paths are `src/routes/dashboard/{thermals,heads,queue}` page
pairs and closed native-path/CSP/build mappings, plus focused fixtures and the
shipping operator's unique empty candidate directory. Shared components, HTTP
observation port, controller and Camera lifecycle remain unchanged.

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

## Earlier deployed baseline: PR93 source accepted and shipped

PR93 merged `60cab96747775fd5715b4c626f99726e68b3d85c` from independently approved
`7a0d398c1652d1a7ae8aede8bf952f27bb3636cd`, tree
`d8a34948e29a4b93b62125d4aef0100a1ddd9f04`. Required regression passes574 UI,
322 server/3756 assertions, eight packages and34 lifecycle/26 shipping tests.
Browser evidence covers323 cases through321 retained plus two renewed Kit Fans
cases. The original976 rejection, focused repairs and exact renewal remain in
VALIDATION; no failed run is rewritten.

Delivered0043 scope is the one app-root SvelteKit project with Bun1.4.0,
components/common UI, pure TypeScript lib/server boundaries, actual Kit API and
UI routing, shared services and widget build targets. Only `/dashboard/fans`
is a native Kit page; remaining UI endpoints return packaged HTML/iframe.
`docs/sveltekit-route-migration.md` records that routing/rendering distinction.
Native events preserve request lease cleanup without polling. MCP body parity,
128KiB endpoint limits and explicit runtime configuration remain unchanged;
outer/nested Bun flags and the guarded Kit environment directory isolate builds.

Release `20260902-60cab96-pr93-20260902T142032-7f9bba` passed mandatory local,
bundle/codesign/exact-stage and preservation guards. BOTH services explicitly
restarted and verified loaded/healthy/integral;59 static/61 security checks pass,
rollback not needed. Five independent HTTPS served-UI cases pass: Kit Fans320/720,
Heads, Camera and Camera Lab. All tool/media data is synthetic; no actual printer
or real Live acquisition was performed. Do not infer actual-device acceptance.

Remaining native-renderer/product work stays behind the active C08 repair. All55
ledger IDs, Progress no-action, F07 class discussion and separate c6 remain.
The completed PR93 docs-only tail retained application evidence without another
deployment under0028. The new C08 code repair requires its own exact release gates.

### Earlier source checkpoint before decision0042

Branch `codex/u1-camera-icon-overlay` starts at
`431b5d40a761919d638a35e2950874e3a5a29519`. Latest user direction supersedes the
text/full-width mode placement: preserve existing animated `IconSegmentedControl`
behavior through generic `Switch`,
with Snapshot/Live/Auto icons only in a compact bottom-right overlay inside the
Camera media. Names belong in tooltip/aria. Preserve44px targets, keyboard/focus,
reduced-motion behavior and non-overlap with fullscreen; failure text remains in
the footer beside Refresh. Service-owned lifecycle/Auto fallback is unchanged.

The user adopted all shared primitives under `src/lib/common/*`, generically named
Button/Icon/Switch and styled/configured via props/variants. Consolidate visual-only
IconButton/QuietIconButton and IconGlyph/BorderedIcon variants; keep domain icon
mappings and Camera/Bed/other domain compositions outside common. The migration is
implemented in source, with acceptance pending; F05 token renaming is not in scope.
This shared move requires all eight package/consumer coverage, with one full-run
owner and separate exact review; no repeated full suite solely for agent handoff.

The implementation author owns application/tests/assets; this records pass changes
only five continuity/ledger files, requirements/0041 and one AGENTS working rule.
Author `bun run check` passes0errors/0warnings and AST; one390px synthetic Camera
modes test passes and its initial-error screenshot matches the compact overlay.
Lab remains blocked by the unchanged80000-byte guard:83901 initially,83446 after
Switch/Icon simplification. Initial Live94479 is within100000. A preliminary
source-derived UI/UX P1 identified unselected radios entering the local-fullscreen
tab trap; the author is fixing it. A LabControls experiment saved no bytes and was
fully reverted. Architect review is bounded to legitimate common/Camera
simplification; no cap/dependency/pipeline/service change is authorized here.
Read-only architecture review found no wrong graph dependency and no identified
bounded justified saving of the remaining3446bytes while preserving requirements;
that does not establish impossibility. Next finish focus work and collect all eight
final package measurements/focused evidence before checkpointing. A cap change
would require a separate explicit user decision, not a guessed new threshold.
Collect focused source/geometry/interaction/
package evidence, then the required
full gate, independent exact review and guarded delivery. No new tests or deployment
are run by this documentation author; reported checks are not full or independent
acceptance. PR89 stays deployed, C08 intermittent acquisition risk remains,
and all55 IDs, Progress no-action, F07 class discussion, c6 and byte caps are preserved.

## Deployed baseline: PR89 scoped verification and open Camera risk

Reviewed `ce065866c61eba159075da9d3bcbf642e9bd404d` merged through PR89 as
`f0d7c178e59e72a9d1ed6324577d2e131ffb0f91`, retaining tree
`a96e57fab0a5289d30ce406c68d3d6023e049d3d`. Guarded release
`20260902-f0d7c17-pr89-20260902T105400-686862` explicitly restarted BOTH services:
loaded/healthy/integrity pass,31 static/32 security checks and preservation pass,
rollback not needed. Independent postverification passes15 manifest files,31 local
routes, six merged public assets and eight HTTPS served-widget fixture cases.
Actual Live succeeded twice:20.122s/20.123s observation windows contained17.100s/
17.102s of advancing decoded samples, ending at547/502 decoded frames; the third
attempt also reached452 presented callbacks. The first acquisition failed for an
unclassified reason and remains C08 risk. Auto new receipts and Snapshot4.5s with
no ongoing reads pass; three owned Live leases closed200 and all browsers/runners
exited. This is scoped verification, not blanket Camera reliability acceptance.
The deployed scope is0041 failure masking/footer status across current packages/
compatibility paths, Heads inset, Snapshot/Live/Auto and the two scoped Live repairs;
this does not deliver every migration or the separate c6 checkpoint.

Exact source validation passed559 UI,304 app/3656assertions, eight deterministic
packages,21 lifecycle/24 shipping. Retained+renewed browser coverage is317 cases
(256+61), with independent controller4/Camera7 and explicit bindings. Earlier
failed runs remain in VALIDATION; software, guarded ship and postverification are
separate layers. Actual camera reads do not authorize printer controls or prove
physical prints, phones, native PiP/clipboard or general device compatibility.

Changed paths on this tail are only PROJECT_STATE, NEXT_AGENT, this HANDOFF,
VALIDATION and widget-delivery. Next diagnose the preserved intermittent C08
failure and retain all unrelated backlog. No additional app build,
deployment or restart under0028. Preserve all55 IDs, unfinished Progress/migrations,
F07 discussion, caps and c6 source/evidence; release only task-owned resources.

## Historical: 092f84a test-only repair awaiting freeze/full gate

Exact source-approved `092f84a9d5f0b3e282eaa4a30304e9c86cb0e132`, tree
`fc9db1af454cbc206c2b4adf4d621ea8f25cd463`, passed559 UI, eight package checks and
app TypeScript, then stopped at301 app passes/3 obsolete assertions; Python gates
did not run. Only `src/app.test.ts` renews two legacy pins and the adjacent footer
status contract, with29PASS/281assertions;374 other tracked app files are unchanged.
Next freeze that test-only change and these records, renew full required validation
and exact review. Failure receipts remain in VALIDATION. PR87 stays deployed;
all55 IDs, Progress no-action and the unimplemented reactive-class discussion remain.

## Historical: f0c5e41 source approval with incomplete required validation

Exact candidate `f0c5e41be0ea6b01549717abe73ab8e0951cc4ec`, tree
`9a6c8cbbcc699b7f06bd6613ef0a2efd4e7173b8`, received independent source APPROVE
with no findings (coordinator-attributed); the earlier P1/P2 repairs are covered.
The independent required repository run passed compiler/AST,559 UI tests and
five focused/three Lab deterministic package checks, then app TypeScript failed.
Missing installed app `three`/`@types/three` and a type-only `./session` import in
`ui/src/lib/camera/transport.ts` lacking NodeNext's `.js` suffix are separate
environment/source causes. App tests and Python lifecycle/shipping did not run.

Independent61 targeted browser and four fresh controller cases passed. The
per-case retention manifest covers256 prior passes plus61 renewed cases (317
covered, not one full317-case run);69 matching Camera/media inputs support the
seven earlier Camera adversaries. Preserve the failed gate and earlier e186c41
failures, not just passing portions. See current VALIDATION for exact receipts.

Author repair is complete: only `ui/src/lib/camera/transport.ts:1` changes its
type-only import to `./session.js`. Pinned frozen install restored eight existing
locked packages; app TypeScript, one actual HTTP/host/transport test, nine transport
tests and Camera build verification pass. All eight widget artifacts match
f0c5e41 byte-for-byte, transpiled JavaScript is unchanged, and package/lockfiles
are unchanged. These are focused author checks, not a passed full gate.
Next smallest action: freeze this source correction and records as a new
candidate for the full required repository gate and independent exact review.
The new source delta invalidates automatic reuse of f0c5e41's exact approval.
Retain browser/controller/Camera evidence only with explicit scope/hash binding;
do not repeat an unaffected full browser suite solely for handoff. No merge or
deployment occurred; PR87 remains deployed. Preserve all55 ledger IDs, byte caps,
service-owned Camera lifecycle and separate c6 source; Progress stays no action.
The validator's runners/browsers exited and4179 has no listener.

## Historical: e186c41 review repair, awaiting a new frozen candidate

The rejected candidate was `e186c41c15d65070bf51d3d756c6b6c6d9e5d9ac`, tree
`cfc4c6bd9b972652f06a8e5bda902a3c123f0a8e`. Preserve its complete independent
report and failed gate/browser logs; see the first VALIDATION section. The current
working tree contains only the following repair groups under
`plugins/u1-print-studio/app/`, plus these continuity records:

- `ui/src/lib/live/controller.ts` restores the accepted `ready` phase for an
  explicit duplicate RPC. A duplicate notification does not clear failure or
  change retained observation identity. A direct regression and four packaged
  consumer browser adversaries cover failed Retry, duplicates and recovery.
- `public/legacy-widget.html` keeps static initial-error state while Retry waits;
  the existing combined-status browser matrix now checks that pending interval,
  footer, accessibility masking and geometry before accepted recovery.
- Bed UI/browser tests target chart-local feedback and still assert the separate
  phase announcement. Thermals browser fixtures use null reason for age-stale
  success and separately assert timeout/offline masking, geometry and recovery.
- Four live bundles and `src/live-fans-package.test.ts` pins are renewed. Fans
  91362, Thermals91973, Heads96944 and Queue92936 fit unchanged100000-byte caps;
  focused production aggregate462985. No Camera/private lab package was rebuilt.

Focused author checks:45 UI passes, compiler/AST, five package passes/59
assertions, and22 unique browser cases via14 retained plus eight renewed passes.
The initial focused run also exposed an old offline-success assertion; the next
run exposed a test comparing failure geometry with an earlier, different ready
header. Both fixture/assertion corrections are recorded with failed logs. The
final Thermals matrix passes all eight cases without further application edits.

The private `review-repair-e186c41/inputs-and-results.json` manifest records all
application inputs,13 changed source/test/artifact paths, final bundle hashes and
log hashes. Its39 Camera-scope inputs match e186c41 exactly, preserving the scope
of prior Camera evidence. This does not certify the new whole candidate.
Next smallest action: freeze these completed repairs, obtain independent exact
review/targeted verification, and run the full required repository gate under its
assigned owner before guarded shipping. No new full browser run, merge, deploy,
printer or device acceptance is claimed. All owned test processes have exited;
fixture4179 is released. Keep remaining delivery-ledger work and c6 separate.

## Historical: resumed footer/skeleton WIP

The user has resumed remote checkpoint
`f9fe1eb0d5455b4a30937954b4ae8ff4e4b8d05c` on
`codex/u1-footer-error-skeletons`. The coordinator verified a clean current
checkout and fetched/checked out the exact branch. The old worktree is archived
and unregistered according to the user; there is no current cleanup request.
Preserve all existing work and other worktrees. No force checkout, restart from
main or c6 Camera integration belongs to this task.

Current order: record the source-frozen candidate commit after final Camera
renderer/geometry/package renewal, then run the required regression. The fixed
Snapshot / Live / Auto switch has service-owned transitions; components subscribe/
render. Preserve the existing phase1 footer/skeleton/Heads work; Camera Lab's two
obsolete-selector renewals pass alongside six retained cases. Then complete the required regression
with one owner, obtain independent review/targeted verification and ship through
the guarded PR/deployment workflow. Caps remain unchanged repo guards. Preserve
all ledger IDs/backlog and the separate source-only blocked c6 checkpoint.

Phase1 Svelte authorship now has compiler/AST,158 unit,12 package and49 unique
browser cases through retained+renewed runs. Shared/direct failure masking,
pending Copy invalidation, Queue bounded short/long allocation, width/font resize
release and Bed hidden renderer/Retry focus received focused repair/coverage.
Obsolete presentation assertions were renewed while cache/order semantics remain.
All eight packages have a phase1 identity record; light213926/Bed635242/Camera77725
and aggregate926893 fit unchanged caps. These are evolving uncommitted bytes;
new Camera changes invalidate affected pins/evidence, and no full gate is claimed.

The coordinator reports four source-preflight findings fixed with focused author
renewal, not independent exact approval. Phase2 author repairs now address raw
Dashboard acknowledgement rejection and a 10-second mDNS candidate timeout that
closed already-connected video. Only answer/candidate/close support both raw HTTP
and MCP wrappers; frame/open envelopes stay strict. The typed-timeout exception
requires the current live epoch/session, observed connection and an accepted frame
received less than 5 seconds ago; invalid/rejected acknowledgements and all
deadlines remain unchanged. A mixed candidate-UI/deployed-service actual-camera
check remained Live for20.4s, with444 decoded1920x1080 frames and explicit own-lease
close200. This is not final-renderer, deployment, phone or print acceptance.
Legacy/Camera author evidence is90 app tests/
1176 assertions,35 unit tests and scoped route checks; Camera Lab is six retained
plus two renewed passes, not a clean full run. The generic Bed footer/allocation,
Camera alias static transitions, combined font/viewport invalidation and camera
failure-through-Retry paths have focused source/test repairs. Camera phase2 may
change source and packages again; retain earlier evidence only for unchanged scope.
VALIDATION records attributed commands, failed runs, renewals and log identities.
No full regression, merge, deployment or actual-device acceptance is claimed.
Historical checkpoint inventories below remain useful provenance, not current
instructions to redo already covered work.

Phase2 changed boundaries: `ui/src/lib/camera/session.ts`, `transport.ts`,
`live-controller.ts`, real/Lab Camera roots/renderers and tests; new synthetic
service, `ui/TextSegmentedControl` and Camera-only `StaticWidgetStateSurface`;
the real-handler/host/transport integration in `src/status-dashboard.test.ts`;
affected Camera bundles/pins. All paths are under `plugins/u1-print-studio/app/`.
The static phase surface uses Camera's intrinsic fixed regions without the
numeric resize-allocation observer needed by variable widgets. Caps were reduced
through source graph work, not changed: final author Lab79375/80000,
Live89770/100000, private aggregate928543/980000 and live aggregate462929.
The one-word Auto header and intrinsic geometry have final focused renewal.

Service author report `phase2-report.json` is final at SHA256
`bd1188f404fa6ad035714a71ababc9067197dff4fdbb5a22225136ed395407d6`.
Its55-test run retains52 cases plus5 renewed synthetic tests, with one separate
HTTP integration pass. The renderer's final3 UI,23+2 browser and12 package tests/
138 assertions, compiler/AST and package checks pass; the older6 mode-browser
cases are superseded. Final `CAMERA-RENDERER-REPORT.md` and
`camera-renderer-identities.json` are under ignored `ui/test-results/camera-modes-author`.
Keep mixed
actual-camera evidence tied to its91,063-byte UI hash in VALIDATION; final served
Live needs its own bounded check after guarded deployment. All service-author
browsers/processes and own leases were released; preserve ignored diagnostic logs.

The user's Progress status question explicitly requested no action; P01/P02 remain
not started and P03 decision pending. Continue Camera only within the current slice.

## Historical pack-up record for saved f9fe1eb

The following pack-up instructions and pending receipts describe the earlier
checkpoint preparation only; the active resume order above supersedes its stop.

### Ready-to-paste new-task kickoff

After the coordinator verifies the push, fetch and check out the exact preserved
`codex/u1-footer-error-skeletons` checkpoint. The old worktree may be archived;
use the local recovery receipt rather than assuming it remains registered.
Read AGENTS, PROJECT_STATE, NEXT_AGENT, this current iteration and
`docs/widget-delivery.md` (the55-request ledger). Preserve this unfinished WIP,
the separate c6 Camera checkpoint and all other source/evidence. Finish the
current skeleton-on-acquisition-error + adjacent footer status + Heads Copy
inset scope, then address the newly recorded Camera fallback/stable-stage asks
in the user's order. This WIP is not independently validated or release-ready.
Local-only verifier planning pointers are in the separately preserved ignored
`plugins/u1-print-studio/app/ui/test-results/footer-packup-local.md`; they are
not included in a remote checkout.

The latest request supersedes the earlier same-worktree handoff: checkpoint
eligible WIP, push it, then recoverably clean up this worktree. Branch
`codex/u1-footer-error-skeletons` starts from accepted base
`80280568589fb8cd2df7f8ab30c2f1faddcb3769`, base tree
`17b8f37d73e8e280c0f72698a340d09714570ec6`. The checkpoint's Git HEAD records
the source identity; the coordinator supplies exact remote/archive receipts.
Push/archive are pending until separately verified. There is no release PR,
frozen application candidate, independent approval or deployment for this WIP.
Do not discard other preserved checkpoints or local evidence.

Adopted intent is decision0041: acquisition failure masks stale telemetry with
static neutral skeletons and a persistent footer status beside Refresh/Retry.
Internal ordering/cache may remain; local Copy/PiP/fullscreen rejection must not
mask healthy data. Heads retains whole inline swatch/hex/16px Copy with44px hit
area and balanced8px hover padding borrowed from the existing12px card inset.

### Checkpoint implementation inventory

Paths below are relative to `plugins/u1-print-studio/app/`:

- `ui/src/lib/ui/WidgetFooter.svelte`, `QuietIconButton.svelte`, new
  `IconGlyph.svelte`, new `RetainedLayer.svelte`,
  `WidgetStateSurface/WidgetStateSurface.svelte` and new `allocation.ts`:
  opt-in adjacent reserved footer status, padded Copy, registry-free glyph,
  mounted masked renderer layer and numeric-only layout allocation.
- `ui/src/lib/observation/ObservationFrame.svelte`, `HeadsPanel.svelte`,
  `HeadCard.svelte`; `ui/src/lib/lab/observation-props.ts`; all four
  `ui/src/lib/live/LiveObservationRoot.svelte`, `LiveThermalsRoot.svelte`,
  `LiveQueueRoot.svelte`, `LiveHeadsRoot.svelte`, plus `controller.ts` and
  `heads-controller.ts`: typed acquisition failure, neutral presentation,
  footer status and public row allocation; internal ordering remains.
- `ui/src/lib/bed-mesh/BedMeshWidget.svelte`: retained renderer is hidden/inert
  inside the public chart frame; receipt/legend/summary masked; footer notice.
- `ui/src/lib/camera/CameraLabWidget.svelte`, `CameraMedia.svelte`,
  `CameraWidget.svelte`, `session.ts`; `ui/src/lib/media/VideoSurface.svelte`:
  existing snapshot action moves to footer; persistent typed failure masking;
  session/video ownership stays mounted. No `c6cfb4e` source was read, copied or
  cherry-picked. `IconGlyph` was independently authored against current Icon's
  public visual/accessibility contract to avoid pulling the entire registry.
- `public/widget.html`, `camera-widget.html`, `legacy-camera-widget.html`,
  `legacy-widget.html`: partial compatibility presentation changes. Generic
  errors retain only numeric allocation (Bed renderer DOM additionally retained);
  combined status clears visible old values and separates action feedback;
  Camera paths mask failed media and add/move footer retry. **Not yet tested.**
- `ui/scripts/component-contract.ts`: explicit new-leaf/import inventories;
  strict zero-native-HTML composite policy remains. New
  `ui/tests/visual/footer-error-preview.spec.ts` is the only changed/new test.
- Rebuilt but not finally pinned: `public/svelte-live-heads.html`,
  `svelte-live-camera.html`, `svelte-observation-lab.html`,
  `svelte-bed-mesh-lab.html`, `svelte-camera-lab.html`. Other live packages still
  contain old shared bytes; Heads was built before the last footer-width tweak.
  Do not claim artifact coherence or carry these budgets as final acceptance.

Other checkpoint records: decision0041, this HANDOFF, VALIDATION, BRIEF,
PROJECT_STATE, NEXT_AGENT and the delivery-ledger current section.

### Excluded local material and preservation boundary

Only eligible source/tests/docs and five already tracked public widget bundles
are checkpointed. Ignored dependency/build/runtime material remains excluded:
app/UI `node_modules`, UI `.svelte-kit`, `build`, `build-live-camera`,
`build-live-heads`, UI `test-results`, and `scripts/__pycache__`.
Preserve all local logs/screenshots/traces and the private pack-up note intact
outside Git; a fresh checkout cannot recreate their evidence. The coordinator
owns whole-worktree quarantine and Git registration cleanup, not this author.
The bounded added-content privacy scan found no matching credential literals,
private keys, absolute local paths, private IPv4 addresses or tailnet hosts.
That is a preservation audit, not exhaustive secret detection or application
approval. No feature tests/builds ran during checkpoint preparation.

### Unfinished work / first resume checks

1. Finish/review partial legacy paths before more expansion: generic Bed custom
   footer still lacks the new common status slot; generic resize cleanup is not
   implemented; numeric allocation must handle initial/after-known0/1/20-row and
   successful-unknown short bodies without default-skeleton expansion/clipping.
   Combined status and all Camera compatibility edits have no fresh runtime
   evidence. Check adjacent action placement, no stale title/aria leakage,
   persistent failure during Retry and recovery only on accepted new data.
2. `WidgetStateSurface/allocation.ts` currently releases numeric allocations on
   root width change; font-only200% changes and complete resize/recovery/unmount
   adversaries are not covered. Bed masked renderer identity/orbit and2D Retry
   focus policy need renewal. Direct failure props outside the closed Lab route
   need review: do not assume changing Lab props masks every caller.
3. Existing tests still assert old visible retained telemetry/overlays and have
   **not** been updated or run: `controller.test.ts`,
   `lab/observation-props.test.ts`, `BedMeshState.test.ts`, ObservationLoading/
   ObservationWidgets, live roots; browser lab-states/widget-error-stability/
   served-error-stability/live-* and bed-error-state; app observation-widget/
   camera-widget/legacy contracts. Preserve cache/order tests; replace only
   superseded presentation assertions with static/neutral/accessibility/footer/
   geometry checks. The full suite is expected not to pass yet.
4. Requirements OBS-008/010/012/013/014, CAM-008, UI-001/UI-004 and ADR0038/0039
   cross-references still need explicit0041 supersession. No blanket completed
   all-widget claim: route coverage and asset pins await focused validation.
5. After focused code/test work, build all affected packages, verify unchanged
   caps, freeze exact app bytes, assign one full-run owner and distinct source
   review/targeted independent verification; only then use guarded PR delivery.

### Latest additional user asks (not implemented or diagnosed)

- Explain why repository raw-HTML budgets exist if no OpenAI limits are known.
  Current caps are project performance guards; official platform limits were
  not checked in this task. A question does not authorize raising any cap.
- Actual `/dashboard/camera` repeatedly falls back from Live. This report has
  **not** been diagnosed; synthetic render tests do not explain that runtime.
- Replace changing3/4 controls with stable Snapshot / Live / better-named
  Fallback stages; switch automatically when Live fails. “Auto snapshots” is a
  proposed label, requiring confirmation of its real semantics, not a delivered
  service or mode change. Separate local display-control failures from stream
  acquisition failures.

The unrelated Camera `c6cfb4e` feature checkpoint remains separate and blocked;
Progress, Bed grid/legend, PR79, other migrations, thumbnail/runtime and all
55 ledger items remain preserved. No printer/auth/Tailscale operations occurred.
Task-owned build processes, isolated browsers and4179 fixture exited; no user
tabs/sessions or deployed runtime were closed. Evidence stays in unique local
`ui/test-results/footer-preview-20260902-*` directories; do not overwrite them.
Independent source preflight and validation planning are complete/idle, not WIP
acceptance. If later importing validator-authored c6 source, reassign independent
verification accordingly. Start the next task from the verified remote
checkpoint using the kickoff above; consult the local recovery receipt for
separately archived evidence.

PR87 observation stable error anatomy and inline Heads quiet Copy are deployed.
Camera remains separately blocked; Progress redesign is still unfinished.
The complete current route/evidence matrix is
[Widget delivery ledger](../../widget-delivery.md).
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

Current changed source: shared observation frame/skeleton composition, four
live controllers/roots, closed Lab state/prop mapping, Heads quiet whole-row
Copy and public CardGrid minimum; legacy focused host/widget and combined status
failure presentation. Tests retain privacy, same-epoch ordering and keyboard
contracts. Camera-specific files and Glyph are excluded; that source-only
checkpoint exceeds its unchanged Lab cap. Do not claim all Camera errors fixed.
[PR87](https://github.com/scottchu/orca-slicer-mcp/pull/87) is merged/deployed.
This new branch starts from exact accepted merge `96e466e` and changes only
PROJECT_STATE, NEXT_AGENT, BRIEF, VALIDATION, HANDOFF, WIDGET_TRACKS and the
delivery ledger. Independent review and a docs-only PR merge remain next;
do not redeploy unchanged application bytes. All previous source checkpoints
and user work remain preserved.

Evidence-preservation limitation: the failed full-browser text log remains,
but Playwright default-output cleanup removed its original auto screenshots
and traces after independent classification. They are not claimed recoverable.
Renewed Queue outputs use separate directories; independent screenshots/JSON
remain intact. Follow up durable per-run evidence output without changing
the harness configuration in this slice. All owned processes/browsers ended;
4179 is free. Preserve user sessions and unique unfinished worktrees.

## Current: required print-thumbnail policy reviewed; PR86 delivery

Decision 0040 makes decoded embedded thumbnails mandatory for prepared
acceptance and upload; target-parsed thumbnail metadata follows upload and must
match local evidence before start. Local checks cover nonempty image content,
backend-compatible count/format/dimensions and exact selected plate/layout,
bound to the final artifact hash. The current unstarted job is subject to the
same rule. An earlier upload never implies start readiness.

Changed paths: `AGENTS.md`, `docs/requirements.md`,
`docs/knowledge/snapmaker-orca-cli-preparation.md`, decision 0040 and its index,
`PROJECT_STATE.md`, `NEXT_AGENT.md`, and this iteration's `BRIEF.md`,
`VALIDATION.md`, `HANDOFF.md`. All are documentation; no runtime, source skill,
dependency, configuration, asset, service or private artifact changes belong
to the candidate. The sanitized motivating observation is preset thumbnail
configuration with absent emitted image blocks.

Independent review approved source/manual workflow policy `d08c88d8` with no
findings; [PR86](https://github.com/scottchu/orca-slicer-mcp/pull/86) is open.
Next smallest action: bind this five-record continuity tail to the approved
policy, finish PR86 delivery and verify the merge. No full build/browser suite,
plugin installation or service restart is required for unchanged application
bytes under decision 0028. Backend automation, non-user thumbnail fixtures and
target/physical display evidence remain separate; thumbnails do not establish
geometry, printability or physical success.

Preserve accepted Heads PR84/Bed PR83 and resume the earlier widget order after
PR86 delivery is verified. Camera retry, all-widget errors, Bed layout, fixed Lab
dock, Current Job PR79, unfinished Queue/Fans/Job History migrations and other
widget/Console/progress-thumbnail/size/cleanup tracks remain open.

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

Changed source: controlled `ui/WidgetStateSurface/`; BedMeshWidget and Lab root
composition; Bed-only phase/controller types; `bed-mesh/retry-focus.ts`;
explicit focus APIs in IconButton and IconSegmentedControl; adjacent unit and
Bed browser tests; component AST contract; all eight rebuilt public artifacts
and app hash pins; ADR0038/UI004. The last tail changes only the six continuity
records and preserves frozen application1da0848. Next smallest action is exact
independent source/validation head binding, then coordinator-owned guarded PR
delivery; never author self-approval or manual service restart.

## Earlier checkpoints (superseded where noted above)

## Bed Lab error-frame checkpoint — focused gates passed; integration next

Application464d3e73d427e648a6b4c75be625eeaa49beaee9 adds controlled
`ui/WidgetStateSurface/`, BedMeshWidget/BedMeshLabRoot state composition,
Bed-only retained-error selection/fixture type, focused unit/browser tests,
AST registration, regenerated Bed asset/pin and ADR0038/UI004 records.
The wrapper always renders the same child snippet; it owns no RPC, state
machine, timer or announcer. Existing ChartFrame provides one non-flow notice.
Initial failure uses the existing skeleton structure statically, not telemetry;
unavailable is a presentation state, not inferred unsupported capability.
Only an actual provided retry callback exposes Retry. Bed Lab's300ms local
demo timer is canceled on selection/reset/popstate/unmount; retained phase
changes reuse fixture identity and original receipt. Existing ready chart,
legend, mode control and renderer implementation stay unchanged.

Focused88 UI,26 browser plus four original chart cases,19 app/220 assertions,
compiler/AST and repeated three-Lab packages pass; see VALIDATION commands.
All owned fixture/browser processes close through test teardown;4187 is checked
released. Evidence captures/logs remain ignored; no user editor/browser/session,
printer or deployed service was touched. No full-suite or release claim.

Next smallest action: wait for accepted Heads PR81, ordinary merge accepted main
into this branch, resolve only normal shared record/test/artifact integration,
renew affected evidence and run one owned full frozen-candidate regression.
Separate source review and targeted independent verification follow, then normal
guarded PR/merge/deploy/BOTH restart/served behavior verification. Do not deploy
this checkpoint directly. Camera68259ead, other nine widgets/live error rollout,
fixed Lab dock, real Bed migration and every existing feature/cleanup track stay
pending. Known320/200% summary crowding is inherited and not accepted as fixed.

## Accepted-main history (superseded by the current Bed integration)

## Heads accepted-main integration — author renewal complete

The six inherited repair records are preserved in commit `8f66edc`. Ordinary
integration of accepted PR82 main `707a018` adds only its project-agent
configuration, routing/guide, focused configuration test and continuity records.
Merge `b1c9a8c` preserves additive records without changing application inputs.
Focused29/config3 and exact delta/assets/retained browser-log checks pass; see
VALIDATION. Independent final source review, validation and guarded delivery
remain the next gates; no new deployment is claimed here.
After Heads, resume Bed Lab `c0323a4`, Camera `4eb3106` retry repair, then all
other preserved tracks. PR82 is merged, but native role invocation is unverified.
All author command sessions exited. No browser, fixture, watcher or connection
was started; user sessions, services and retained evidence were untouched.

## Earlier Heads repair handoff

## PR81 test-only local-gate repair ready for exact binding

Checkpoint `1e2e387d8cbbada99a23dfa01ad9b94265834f8d` changes only
ObservationLoading.test.ts after the previous final records. Its exact hidden
public-leaf exception is independently source-approved; independent 29 targeted
tests and final required repository validation pass (483 UI, 300 app, 21/24
lifecycle/shipping, eight unchanged packages). The earlier ship gate failed
before merge/install/restarts. Preserve its failure evidence and retry only
after independent final docs/remote identity and retained browser binding.

No runtime, assets, browser inputs, dependencies or guards changed from app
`c9d69cb`; no duplicate 214-case browser run was launched. Command sessions are
closed; no author fixture/browser is open. OS error24 blocked one subsequent
read-only launch after all required tests completed; preserve user/service
resources and do not infer unfinished children from that global symptom.
Camera `4eb3106` and its explicit-retry defect remain a separate unfinished
checkpoint, as do Bed/state/dock/Progress and all existing tracks.

## Heads material icon — frozen application, independent acceptance due

Application `c9d69cb894ad1d28278fb1e56b6b9617c11af5f9`, tree
`3cca582bad7e2ff9d21b5f77f34fdc96aedcf266`, base accepted PR80 `4e869d8`.
Later edits are continuity only. The owned full browser run passes 214/214;
separate source review and targeted validation are still required.

Changed runtime paths: shared `ui/Icon.svelte`; Heads HeadCard/HeadCards/
HeadsSkeleton/HeadsPanel/HeadsWidget composition; generic ObservationSkeleton
pass-through; closed Lab route/helper; pure observation loading-shape helper.
No adapter/controller/live-root/network/MCP/auth/service/shipping change.
Tests, AST import allowlists and exact package hashes are renewed.

One joined material text leaf plus nonshrinking 20px/1.8 Spool is shared by Live
and Lab. Fixed public `nominal | empty` loading shapes are selected only by
validated Lab controls, including all-empty/all-unknown and per-head overrides.
Ready data is not a template source; type/runtime guards reject ready overrides,
arbitrary strings, malformed lists and sparse lists. Live defaults stay unchanged.
Public finite templates guarantee tested closed fixture geometry, not arbitrary
private initial text lengths. 194-character actual labels remain naturally visible.

Focused 39 Chrome, final 56 affected UI, compiler/AST and 12 package/138 assertion
checks pass. Old 16/18 and 201/206 failures remain in ignored evidence storage.
A lazy-derived guard was caught by a component adversary and corrected with
pre-render effects; all 12 HeadCard cases then pass. No tolerance was loosened.
Detailed commands, hashes and evidence limits are in VALIDATION.

All eight final assets remain within caps; only Heads/light Lab change again
after the public-template repair. Spool's 462-byte Camera increment exceeds PR79's
old 318-byte headroom: later ordinary integration needs actual measurement and a
separately reviewed optimization if needed. Do not raise caps or copy pending code.
PR79 and all additive tracks remain intact. Playwright's isolated contexts and
fixture exited; lsof confirms no listener on4179. All author command sessions
completed. User sessions, services, worktrees and evidence remain preserved.
## Earlier project-role handoff (completed by merged PR82)

## Project-agent definitions — configuration handoff

Changed four `.codex/agents/*.toml` files, routing in `AGENTS.md`, the usage and
compatibility guide `docs/project-agents.md`, focused
`scripts/test_project_agents.py`, and the five required continuity records.
No application, asset, dependency, runtime, shipping automation or global Codex
configuration changed. The new script uses only Python stdlib through `uv run`.
Next: independent exact source/config review and PR merge, not deployment.
Native named-role discovery/invocation remains unverified; the current spawn
tool exposes no custom-agent-name parameter. Do not equate static parsing with
runtime selection or role behavior. All earlier widget tracks remain unfinished.
No browser, fixture server, model process, watcher or printer connection was
started for this slice; command/file handles close on completion.

## Earlier checkpoints (superseded where noted above)

## Test strategy policy handoff — docs only

Changed only `AGENTS.md`, `PROJECT_STATE.md`, `NEXT_AGENT.md` and active
BRIEF/VALIDATION/HANDOFF records. AGENTS is the sole policy definition; current
records cross-reference it without duplicating the rules. ADR0028 already covers
unchanged-application docs-only delivery, so no ADR/skill/script change is needed.
Next: independent exact documentation review, then normal PR merge without
deployment. Current Job PR79 and all pending tracks remain separate and intact.
No test fixture, browser, watcher or service was started; author command handles
are closed before handoff. Logs and user applications/files/runtime are retained.

## Earlier checkpoints (superseded where noted above)

## Bed Mesh icon toggle — author candidate ready for independent roles

Source80229841fced7307aaf3eba850a8e60ef688c26a is based only on accepted4828ce04.
Changed paths: generic IconSegmentedControl/icon-segmented guard plus units,
BedMeshWidget's mode composition, test-only harness/route/build registration,
updated radio selectors in existing regressions,16 new browser cases,
component frontier, exact Bed hash/artifact, UI-002/ADR0032 and current records.
Shared IconButton, controller, chart/renderer implementation, production and
other lab assets remain unchanged. Current Job5855223 was not copied/integrated.

Author gates:455 UI,300 app/3557 assertions,21 lifecycle,24 shipping, focused16,
full198, runtime/signature/help, repeated eight-package hashes. Browser4179 is
released. Separate exact source review and validation, then guarded PR delivery,
BOTH restart and scoped served-byte behavior verification remain next.

The control is one radiogroup with two icon choices, not a camera/host display
toggle. Mode changes still dispose/remount the existing chart content while the
ChartFrame identity/4:3 stays fixed; no renderer-persistence guarantee is added.
Known enlarged summary crowding and timestamp spacing await the preserved
real-Bed composition track194ea79 and are not whole-widget acceptance.
Resume Current Job5855223 after this immediate release by ordinary accepted-main
merge and renew its deferred full207/runtime/determinism/exact gates. Preserve
Progress, History, Overview and every new-feature/migration/cleanup track.

## Earlier author and integrated baseline records

## Slim vertical legend author handoff — ready for separate exact review

Ordinary Queue integration is `910355e`. Changed HeightLegend/ChartFrame leaves,
Bed lab composition, measured chart obstacles and projected 2D/3D label fitting;
added unit, graph/AST and four-width/200% browser evidence. The adopted 6px rail
has one intrinsic caption, no duplicate visible endpoint DOM or skeletons,
neutral loading and a uniform flat midpoint. Chart accessible description
retains exact maximum/minimum. Non-legend defaults stay unchanged.

Final full browser 182/182 and repository/runtime/eight-package gates pass.
Only Bed lab bytes differ from accepted Queue; no production Bed entry,
controller, compact IconButton, service, MCP, auth or printer change. Next:
separate exact-source review and independent validation, then coordinator-owned
guarded shipment if approved. Port 4179 is released. Preserve all historical
failure evidence below; do not treat author tests as independent approval.

Real Bed phase two remains separately preserved at `194ea79`, with keyboard,
context-loss/font/controller and accepted shared-leaf integration still due.
The current unchanged three-column Min/Max/Range summary is crowded at
320px/200% text; record and repair it in that broader composition slice.

## Historical author and integrated baseline records

## Vertical legend author candidate — HELD after bounded experiments

Changed generic HeightLegend, optional ChartFrame leading slot, measured chart
obstacles and Bed lab composition/rendering fit. The narrow left rail leaves
14px inset; visible legend endpoints reserve measured boxes and Z may use the
opposite true projected silhouette. 2D reserves legend clearance without
changing unequal physical spans; non-legend leaves preserve their defaults.
Added leaf/unit and four-width/normal200 packaged browser tests. No production
Bed entry, controller repair or compact IconButton is included. The full real
Bed phase-two work remains at `194ea79`; merge accepted dependencies later.

The wide-column experiment failed 320/200 colored surface and zoom gates.
A narrow-rail trial passed normal coverage and zoom but still clipped one
320/200 Y endpoint. Opposite-Z now passes every existing rotation/coverage/
pixel-zoom case, but a new surface-clearance probe finds849/412 colored pixels
under the legend's fixed6ch text boxes at320/390px with200% text. The boxes
overestimate short actual glyphs; the top-left title is visually crowded.
Focused26 ended24PASS/2FAIL. Independent layout design should measure glyphs
and include their exclusion rectangles in neutral1x surface fitting while
preserving14px rail, true projected axes, normal coverage and independent zoom.
An alternative for independent design is a narrow Z(mm) rail with accessible
endpoints and the existing visible Minimum/Maximum facts, avoiding duplicate
numeric labels in the chart. This is a proposal, not adopted permission to
remove visible values or weaken any acceptance gate.
Do not waive these failures, claim visual acceptance, or ship until the final
exact candidate passes and separate roles independently approve it.

## Integrated Queue baseline records
## Queue author handoff — exact review required, not release approval

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
(tree `155abfb5e436cf8e1cb344a6724fbc358feafc60`). Independent design's public
intrinsic-text template replaces estimated widths; focused24/24 geometry and
Chrome174/174 now pass. UI426/app300 with3,555 assertions/lifecycle21/shipping24,
compiler/AST, deterministic eight-package and runtime/signature/help gates pass.
No Queue shipment or final acceptance is claimed; exact independent validation
and source review remain required. Preserve all failure history in VALIDATION.

Changed areas include shared live controller and four consumer regressions,
Queue's focused route/host/build/ship inventory, ordered Queue rows and reusable
Name/BoxLabel/DateTimeValue loading shapes and generic TextSkeleton. The leaf is
bounded/control-safe/aria-hidden and uses actual browser typography, never real
telemetry as a loading template. Only lab Queue imports the closed synthetic
shapes; production uses neutral defaults. Locale equality is a closed tested
locale claim, not universal arbitrary-language geometry. Ready text remains
untruncated and production retained refresh remains fixed. AST and actual CLIENT
module graph guards are renewed; Queue graph128 excludes lab shapes and other
real-domain adapters. Browser4179 is released to the separate lab legend author.
The author inspected320 enlarged/720 normal screenshots; the visible Loading
label in that ready fixture is the reported machine queue state, not a skeleton.
Next: exact independent review/validation, then guarded shipment if accepted.
No deploy, service or printer action was performed by this author.

Remaining tracks stay open: Progress phase-one is held until the shared
obsolete-success fix is accepted; Overview checkpoint `136da4b` awaits independent
review; Current Job `4e50f7b` and History `379c1e7` have source approval only,
not delivered widgets. Real Bed Mesh composition, generic MCP/legacy migration,
new requested features and final recoverable cleanup are not complete.

## Historical checkpoints (superseded where noted above)

## Three-artifact private-lab split author checkpoint

Exact application source `4a6c493` ordinarily merges accepted/deployed Heads
main `5ffca66`. Changed source
splits fixtures and build graphs, adds an explicit Bed Mesh Svelte entry, maps
the exact private Bed route to its own inline bytes, and derives the shipping
manifest from the three route constants. Light excludes Bed/Three/Orbit; Bed
excludes other observation, Camera/media, live-adapter and RPC graphs; Camera is
unchanged. Current outputs are 199,819/629,880/78,795 bytes and 908,494
aggregate. Author UI335/app296/lifecycle21/shipping24/repository and Chrome164
gates pass. Independent exact-SHA validation/review remains required. Renewed
limits are 250,000/700,000/80,000 and 980,000 aggregate, leaving
50,181 light bytes for the finite Queue/Current Job/History/Progress/Overview
envelope; Console and thumbnails are excluded. No deployment, printer, auth,
MCP or public-route change is claimed.

## Heads implementation checkpoint (unaccepted)

Accepted Bed Mesh main8c5756d is integrated as0bb9ef6 after author checkpoint
a8ad5c7; both ADR sections and regenerated combined lab are preserved. See
decision0037 for the exact Heads contract and decision0032 for independently
reviewed packaging bounds. Added strict real Heads adapter/presentation,
generic CardGrid/InsetCard/ColorSwatch/color utility, zero-raw HeadCard/cards/
skeleton/panel, real/lab wrappers and shared clipboard-generation lifecycle.
Candidate private heads_widget route, host selection and source-derived ship
inventory preserve public isolation and legacy MCP aliases.

Do not ship without independent acceptance. Earlier mobile and all-empty/unknown geometry failures are
repaired with bounded generic header lines and optional footer action slot,
not arbitrary194-character material height. The empty slot is noninteractive;
Empty/N/A contain no Copy button, role or focusable placeholder. Focused22
renewal cases PASS, including all closed presets at four widths/normal200%,
strict<=1px geometry, actual default material single-line/zero-padding bounds
and long real metadata readability. Compact ActualTarget is an independently
approved opt-in; Thermals86,230 bytes has explicit renewed hash and all default
consumer cases PASS. Final Chrome163/163, repository contract and runtime/signing
gates PASS on frozen app source `4d24446`. The first162 run was161PASS/1FAIL and
exposed a real host initial-error omission; the shared focused-widget mapping now
forwards errors for Fans, Thermals and Heads, with exact retry regression coverage.
Independent exact-source and validation acceptance remain due.
No real printer/media acquisition or service change occurred in this author work.

Current bounded artifacts: observation755,217/756,000; Camera78,795/80,000;
two-lab aggregate834,012/836,000; Heads91,633/100,000. Client graph has235
modules and no real adapter/controller/host/Camera dependencies. The separate
Heads production graph excludes fixtures/lab/Camera/Three. Exact hashes are in
package assertions and must be independently reproduced before guarded ship.

Next migration order: Queue → Current Job → History; Progress separately,
real Bed Mesh adapter/shell after renderer, Overview last. Preserve all remaining
tracks. Current Job nullable/unreported filename and History mandatory sanitized
filename are distinct. Do not derive lab-only current-job progress from bytes.

## PR73 repaired candidate handoff

The new delta is restricted to neutral-fit/user-zoom separation in
`ui/src/lib/bed-mesh/BedMesh3D.svelte`, a detail-placement option in
`display.ts`, the test-only mesh identity/zoom probe and six new real-input
browser tests. The observation artifact/hash and current decision/requirements/
records are updated. Existing1x tests are unchanged. Reviewed Thermals main is
explicitly integrated as `f0e25ba`; no other unapproved feature branch is included.
Newest VALIDATION records full266/290/21/24/152 author gates and five hashes.

Next smallest action: independent exact-candidate source review and validation,
including the prior failing real-wheel reproduction, then guarded shipment only
after both approvals. Browser port4179 is released. Lab artifact reserve is only
440 bytes; future integration must measure the unchanged bounds early. Keep
all existing compatibility and remaining feature tracks; this is neither live
Bed Mesh nor complete decision0030 parity. No cleanup or printer action was taken.

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

## 2026-09-01 Bed Mesh combined candidate — exact review next

The author preserved the narrow implementation checkpoint and explicitly merged
reviewed Camera main `0aa83a0` into this branch. Camera's shipped private route,
artifact and bridge are unchanged; its operator release is
`20260901-0aa83a0-pr71-20260901T170551-59206e`, with BOTH restarts and
health/integrity verification. This author performed no service/printer action.

Changed application paths are the existing `ui/src/lib/bed-mesh` 3D/2D leaves,
new pure `display.ts`, and the regenerated observation lab HTML plus exact hash.
The chart-leaf AST inventory is updated; isolated test-only fixture/build routes
exercise real Three buffers and pixels without shipping test hooks. Existing
theme, frame, summaries, controls, dependencies and limits are unchanged.

The final layout reserves essential Z labels, measures tabular numeric glyphs,
and searches outward/along the projected edge before expanding the frustum.
This fixes the reproduced enlarged flat endpoint overlap and extreme-orbit
containment failures without hiding text or weakening their regression gates.
The full combined 137-case browser suite passes; author inspected normal 320/720
and enlarged/rotated captures. VALIDATION has exact commands, bounds and hashes.

Next: independent full exact-source validation and formal review of the pin,
then guarded delivery and separate served behavior checks. Preserve the earlier
failed evidence below. No production/MCP Bed Mesh cutover, live measurement
acquisition, actual Safari/phone or user-outcome acceptance is claimed. Thermals,
remaining ready-shell debt, Console, model progress, size API and all other
WIDGET_TRACKS remain open. Coordinate the exclusive fixture port 4179.

Known inherited lab limitations retained for the next chart/live-parity slice:
no focusable keyboard orbit/Home reset, no automatic WebGL-failure 2D fallback,
and fixed 12px 2D canvas labels under root-text enlargement. The present 200%
glyph tests cover 3D HTML labels only. Do not describe this candidate as complete
decision-0030 parity or infer actual-device behavior from local Chrome checks.

## 2026-09-01 Bed Mesh projected-enclosure author checkpoint

Decision0032's bounded private-lab refinement changes BedMesh3D/BedMesh2D plus
pure display/projection helpers, chart-leaf AST inventory and test-only geometry/
orbit fixtures. The same Three renderer/control instance survives data changes;
old buffers are disposed. The floor/two far walls/four uprights cannot collapse
on flat data. Actual-mm labels follow projected visible edges rather than CSS
corners; measured font changes refit without changing the4:3 frame. Rectangular
2D data retains physical aspect and redraws without resize. Existing palette,
controls, summaries, production mesh/MCP and budgets are unchanged.

Early author tests pass, but final rotation/enlarged-text/pixel evidence remains
pending. The first expanded browser attempt stopped on a test-only prototype
instrumentation error; the harness now captures BufferGeometry attributes and
OrbitControls rather than Three's instance-owned WebGLRenderer.render. An
import alias corrects a Vitest hoisting collision in the renderer stub. Neither
failure is accepted as application evidence. See VALIDATION for actual commands.
Next: complete exact focused browser checks/captures, full gates and independently
approve a frozen candidate. No release or actual-device/printer claim exists.

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

## LIVE Thermals author candidate ready; not shipped

Full final gates pass:228 UI,130 Chrome,285 app/3,356 assertions,21 lifecycle,
24 ship, compiler/AST/types, deterministic four artifacts and all bundles /
signature/help. Exact hashes and source-bound evidence are in newest VALIDATION.
Next: fresh independent exact validation/review; if Camera ships first, merge
that reviewed main and renew the candidate. Do not deploy unreviewed source or
claim actual-device acceptance. Browser4179 has been released to other authors.

Changed boundaries: shared typed observation controller/validation, strict real
Thermals adapter/presentation, six shared thermal rows and neutral nullable
activity, safe extreme degree formatting, opt-in grouped timestamp metadata,
zero-raw live root/entry, exact Thermals host/asset route and source-derived
shipping inventory. Fans uses the extracted common logic and retains all race
regressions. Tests cover actual normalized server output and synthetic iframe
behavior; Camera-specific source, bridge API, backend acquisition/auth and generic
MCP aliases are unchanged. Source baseline remains reviewed PR70 `db1c926`.

## 2026-09-01 Thermals follows shipped Fans

PR70 is shipped and independently postchecked on merge `db1c926`; full attributed
receipt and connector-runtime limitation are in newest VALIDATION. Do not repeat
its release or mistake a sparse historical connector response for the new server.
Current author scope is only real Thermals: fixture-independent adapter, shared
reviewed lifecycle, six compositional rows and separate Cavity evidence. Real
Camera is independently owned; explicitly integrate whichever reviewed main
ships first before final acceptance. Generic MCP and seven other observations
remain legacy until their own parity. All named WIDGET_TRACKS remain pending.
## 2026-09-01 real Camera dashboard candidate — review handoff

The candidate explicitly merged reviewed Fans main `db1c926` after committing
its typed-port foundation. Shared HostRpc source is reused unchanged. New
camera transport/peer/session/controller/runtime, generic media playback/
VideoSurface/MediaStatus and zero-raw CameraWidget/LiveCameraRoot implement the
real dashboard child. Synthetic Camera remains a separate import graph.

Private `/dashboard/camera` now selects exact `/dashboard/camera_widget` with
the unchanged Camera CSP. Host origin/child epochs reject stale replies and
release an allocated late lease after child replacement. Five existing calls,
backend acquisition, auth, public/MCP/legacy assets and other widgets remain
unchanged. Production build/contract/negative tests enforce one self-contained
HTML under100,000 raw UTF-8 bytes and reject lab/tests/Three/remote assets.
Shipping inventory adds its exact source-derived private hash; public/path/
method/cache/CSP and host regressions are included.

Current author gates and exact artifact hashes are in newest VALIDATION.
Before acceptance, a separate validator must run the full final129 browser
matrix and challenge native/PiP/timeout/lifecycle/metadata boundaries; the
author's full129 run preceded the final loadedmetadata/playing capability
listeners, followed by all8 final Camera browser cases. The latter includes
feature-detected native PiP entry or retained-playback rejection, explicitly
emulated Safari presentation API, native/CSS fullscreen, FPS expiry/stall,
retry/BFCache and four widths at200% text. No actual Safari/phone/printer proof.

Next: independent exact validation and source review, guarded PR merge/deploy/
BOTH restart and separate served behavior verification. Do not retire legacy
Camera/MCP resources or mark every widget migrated. Keep all remaining tracks.

## 2026-09-01 real Camera typed-port checkpoint

Decision0035 records the role-separated accepted real Camera dashboard-only
direction. New camera/transport.ts validates the existing five private frame/
signaling calls without a camera URL or message listener; camera/peer.ts binds
only a downstream receive-only peer; media/playback.ts preserves one supplied
video and producer-owned tracks. Their unit tests plus existing session tests
pass38/38 and compiler/AST pass. CameraOffer now describes bounded ICE fields;
candidate usernameFragment is retained. No fixture producer enters these files.

Next merge the reviewed real Fans/shared-HostRpc main, then implement generic
VideoSurface/MediaStatus, zero-raw CameraWidget/root, bootstrap/host lifecycle and
exact private `/dashboard/camera_widget` build/route. Production budget must be
measured and independently accepted. Preserve legacy `/camera-widget` and MCP
resources; do not claim complete migration or live/device parity from this
unwired checkpoint. No printer call or service change occurred.

## Renewed PR70 ready for independent exact acceptance

The held refresh race is corrected and reviewed main `ef5b239` is explicitly
integrated. Full combined author gates PASS: 183 UI units, 121 Chrome cases,
281 app tests/3,301 assertions, 21 lifecycle, 24 ship tests and deterministic
packages/bundles/signature/help. Next is fresh independent validation/review,
then guarded merge/deploy/BOTH restart/verification; no PR70 release is claimed.
Production Fans is 85,315 bytes; the two labs are 748,816 + 78,795 = 827,611.
Camera-specific source and budget contracts are preserved; shared generic busy
button code explains its 107-byte artifact change. The actual PR69 receipt below
is historical deployed evidence, not approval of this newer combined candidate.

PR69 is shipped and independently post-verified: reviewed `473cd000`, merged
`ef5b239`, release `20260901-ef5b239-pr69-20260901T160906-8d7501`. Both explicit
restarts, integrity, 26 static/27 security and preservation passed; rollback
snapshot retained. Separate postchecks cover exact runtime/file identities,
actual tailnet assets/CSP and downloaded-byte synthetic browser lifecycle.
Full attributed receipt is in VALIDATION. Real Camera remains a distinct pending
cutover; no physical stream or actual-phone acceptance is claimed.

## 2026-09-01 reviewed Camera baseline integrated into PR70 renewal

Main `ef5b239` is explicitly merged. Preserve Camera's source/leaf registry,
dedicated private route, build scripts and split lab budgets; the live Fans asset
remains a separate production entry. Merge resolutions combine registry/route/
shipping maps, regenerate rather than hand-edit packaged HTML, and preserve both
sets of tests. Next: full combined-tree validation, exact independent review and
guarded PR70 delivery. No PR70 deployment or hardware acceptance exists yet.

## 2026-09-01 held PR70 renewal before Camera integration

Do not ship `e0e141a`. Independent review/validation found the newer-observation
then old-RPC-rejection race left busy=true. The sole runtime correction is final
request settlement in the controller, retaining newer data and suppressing stale
error feedback. Two controller regressions and one actual iframe/host regression
pass after reproducing the failure. Integrate the reviewed Camera main next,
preserving its split artifacts/routes/budgets, then rerun combined-tree gates and
freeze a new exact head. No Camera source or running service has been changed.

## 2026-09-01 LIVE Fans end-to-end candidate, not shipped

The separate LIVE candidate adds strict fixture-independent Fans models/adapter,
one shared host RPC bridge, a view-locked controller, zero-raw live root and
shared FanReadings. Full author gates pass: 152 UI units, 104 Chrome cases,
280 app tests/3,265 assertions, 21 lifecycle, 24 ship tests and all bundles /
signature/help. The Fans-only private asset and existing host handoff are implemented;
generic MCP remains unchanged. Reviewed main `2d30b01` is explicitly integrated.
Next: independent exact validation/review and guarded delivery. Keep Camera's separate
integration and shared RPC dependency coordinated; do not duplicate listeners.

Changed boundaries: UI `lib/host`, `lib/live`, the shared FanReadings/busy
IconButton, production entry/build/package, Fans-only dashboard host/asset route,
tests and source-derived shipping inventory. Backend observation acquisition,
authorization, generic MCP resource and remaining renderer aliases are unchanged.
The active `LIVE_PARITY.md` preserves the remaining-eight mapping/fixture gates.
Do not delete reachable legacy renderer code before those cutovers are accepted.
Production/lab hashes and budget deltas are in the newest VALIDATION entry.
## 2026-09-01 synthetic Camera lab integrated candidate

Reviewed main `2d30b01` is explicitly integrated. This slice registers the
synthetic Camera state/controller/root/widget/media/status, one shared LabControls
dock, directory link and exact private route/title. A generic PageLayout owns
the root markup; CameraLabRoot and CameraLabWidget have zero raw DOM, enforced
by the AST registry. Browser location is a separate lab-only edge. Shared header
wrapping/controls sizing are opt-in; all nine existing widgets retain defaults.

The measured762,180-byte combined build and764,097-byte conservative Terser trial
failed the original750KB cap. Independent design review explicitly accepted
two entries/artifacts with750,000/80,000 and830,000 aggregate bounds. No Terser
dependency remains. Current748,482 observation+78,688 Camera=827,170. The
observation directory is not a third payload. Camera's graph excludes Three,
observations, host RPC and real session code; the private route maps to its own
hash in the shipping contract. Same restrictive CSP; no external asset requests.

Changed paths include camera source/tests, generic PageLayout, opt-in Header/
LabControls, AST registry, explicit Camera build and two-artifact package guards,
private route/public isolation/ship tests, generated lab HTML, requirements and
decision0032. Production HTML, camera backend, MCP, auth and aliases are unchanged.

Next: exact independent validator and formal reviewer must accept the frozen
candidate, then guarded PR merge/deploy/explicit BOTH restart/verify. Do not
claim live Camera migrated. Its separate DOM-free session controller has19
mock-port/clock tests but still needs host/real-peer/persistent-media binding,
review and production cutover. All remaining tracks stay open.

## 2026-09-01 PR67 delivered — migration continues separately

PR67 is complete through independent deployed-service/synthetic-browser checks:
reviewed `07e1c144`, merged `c924bf9`, identical tree `9198918a`, release
`20260901-c924bf9-pr67-20260901T153250-99a666`. BOTH explicit restarts and all
health/integrity/25-static/26-security/preservation gates pass. No rollback;
snapshot `20260901T153330-e4475a` retained. Independent directory/nine-route
fetches match exact 748,554-byte SHA-256
`83146f52f61fd9225877e3bd4ef7ee08798745083fc7232fa9e932399b007a1a`.
Fetched-byte isolated Chrome verifies controls, loading, retained refresh/time,
announcements and geometry. Actual phone/printer/camera proof remains pending.

All nine observation lab controls/loading paths are shipped; seven ready-shell
raw debts and all production cutovers are not thereby finished. Continue the
separate live Fans shared-RPC/adapter/controller candidate and Camera integration,
then remaining named tracks. Integrate reviewed main into each unreviewed
candidate before exact validation. Keep generic MCP resources/aliases intact
until all-nine replacement parity. No second deployment is required for these
sanitized receipt docs; detailed runtime reports remain private.

Cleanup handoff: the separately authorized operator moved ten redundant task
worktrees intact, preserving branch refs, registrations and all files. A distinct
validator (the receipt author, not the cleanup operator) freshly rehashed their
complete contents and independently passed before/fresh/after parity, canonical
ignored files and recovery refs, archived original documents and nested clone.
Active feature/current-validation worktrees remain registered. Only the empty
temporary parent was removed, nonrecursively; all material source remains
recoverable. Do not empty quarantine or assume production legacy code is retired.

## 2026-09-01 final compact-metric renewal

`befbbd5` also failed independent visual acceptance: short Progress values were
separated from `%` by the reserved numeric slot. The percentage group now uses
inherited end alignment, without shared-leaf coupling or changing slot geometry.
The strengthened matrix covers 200 preset/width/text-scale combinations and
48 numeric/unit adjacency checks; normal390/0% and enlarged390/100% captures
were inspected by the author. Artifact: 748,554 bytes, 1,446-byte reserve;
newest VALIDATION records actual commands/hash and acceptance limits.

Obtain fresh independent validation and formal review of the new exact head,
then guarded shipment; neither earlier head is approved. LIVE Fans' separate
uncommitted decision/RPC/adapter/controller preparation is safely paused and has
no route changes. Do not mix it into PR67. Camera and all other named tracks
remain pending. Independent cleanup postverification now passes; the ten
remaining old-worktree retirements are still pending, not silently completed.

## 2026-09-01 PR67 corrected candidate — fresh acceptance required

Do not deploy rejected head `8663d93`. Independent checks exposed visible text
clipping in four widgets and formal review found the selection type insufficiently
correlated. The renewal fixes Progress/Heads/CurrentJob/Overview shared layouts,
adds mapped closed per-view selection types and compile-negative checks, and
commits 168 preset/width/text-scale text-bounds/geometry regressions. Ready and
loading still use the same layout owners; no telemetry is hidden under loaders.

Renewed author evidence: compiler/AST/types, 126 units, 94 Chrome cases,
deterministic 748,539-byte package (1,461-byte reserve), 276 app tests/3,187
assertions, 21 lifecycle, 24 ship tests and all bundles/signature/help pass.
See newest VALIDATION for exact commands/hash and evidence boundaries.

Next: freeze a new exact PR67 head, independent validation and formal review,
then guarded merge/deploy/explicit BOTH restart/verification. Do not reuse
approval of any older head. The separate LIVE Fans preparation branch is clean
and paused; Camera remains separate and unintegrated. No production migration,
actual phone or printer acceptance is claimed. All named WIDGET_TRACKS remain.

Separately authorized cleanup: the operator reports canonical clean `main` at
`cb37e3e`, with the original five dirty documents privately archived after
independent preservation verification; `actions` and recovery refs remain.
All 9,005 ignored entries survived the switch unchanged. Only the approved stale
nested clone was subsequently quarantined intact (315 matching manifest entries)
and its empty temporary parent removed non-recursively. Recovery evidence is
retained privately; final independent post-cleanup verification and ten other
proposed old-worktree retirements remain pending. No feature/runtime change
occurred. This author did not perform or independently verify that cleanup.

## 2026-09-01 reviewer-ready all-nine lab controls

Author gates are complete: 126 UI units, 86 Chrome cases, compiler/AST,
deterministic package, 276 app/3,187 assertions, 21 lifecycle, 24 ship tests and
bundles/signature/help. Exact package is 748,478 bytes with 1,522-byte reserve;
see newest VALIDATION for its hash and actual command record. The candidate is
lab-only and not yet independently approved or deployed.

Changed areas: closed controller and validated per-view fixture factories;
shared bottom LabControls leaf; pure loading/terminal state boundaries; seven
existing ready shells reused for loading without observation data; shared
LoadingValue/ObservedMeta and degree placeholders; route-local URL state with
popstate cleanup; exact guards; unit/browser/package tests and current records.
Loading does not mount Three or any camera/transport. Known static names/icons
remain while values are skeletons. Refresh retains values and source timestamps.

Next smallest action: independent exact-SHA validation and formal review, then
guarded PR merge/deploy/explicit BOTH restart/verification with the user's
standing authority. Follow with a separate actual-receipt record. Camera author
must integrate only after this frozen shared slice is resolved, not race its
route/controller/registry/package files. WIDGET_TRACKS lists all unfinished
migration, cutover, feature and cleanup obligations. No original user changes
or previously reviewed worktrees were modified.

## 2026-09-01 consolidation-first resume

Finish the current all-nine private lab controls/loading candidate, run the full
author gate set, freeze exact source, obtain independent validation/review, and
only then guarded merge/deploy/BOTH restart/verify. Eight four-width/200%-text
major geometry browser cases passed; corrected unit assertions need rerun.
All interrupted local test processes have completed. The current source is
unreviewed and unshipped; do not advertise it as live.

Remaining migration debt is explicit: the seven Overview/Progress/Heads/
CurrentJob/JobHistory/Queue/BedMesh ready shells, production observation and
camera assets/routes, and the separately authored but unintegrated synthetic
Camera lab. Cleanup follows accepted replacements; do not remove working legacy
code or include production changes in this lab-only PR without reviewed scope.
Smaller Refresh, size/API modes and other new feature tracks wait until existing
consolidation and delivery are finished. Original dirty checkout is untouched.

## 2026-09-01 visible lab controls — unreviewed implementation checkpoint

`codex/u1-lab-scenarios` contains closed per-view controller/factories, shared
bottom LabControls, URL state, all-nine lifecycle wiring and seven legacy shells
reusing LoadingValue for structural loading. Compiler/AST and 110 unit tests
pass; browser keyboard selection and major geometry gates remain open. No
candidate is independently approved or delivered. Integrate latest reviewed
main explicitly, preserve separate source branches, then finish browser and
repository gates before freezing a review candidate.

Camera is separately authored and not included/linked here. Measure its combined
package budget before integration; current complete lab build leaves only 3,227
bytes before the slope change. Do not increase the cap or drop accepted features
silently. Preserve smaller visual Refresh, compact/medium/full and later MCP
size parameter, seven remaining ready migrations, Bed Mesh axes, Console,
model/layer progress and production cutovers as separate follow-on tracks.

## 2026-09-01 PR65 shared-gradient slope shipped

Reviewed `f216c70` merged as `6b9b3e7`, preserving exact tree
`1a3bc6fc10a2a12054ef9db32d7a120f1a3a906e`. Guarded release
`20260901-6b9b3e7-pr65-20260901T142009-341331` runs on BOTH explicitly restarted,
loaded/healthy/integrity-verified services. Twenty-five exact static asset/route
and twenty-six security checks pass; configuration/routing preservation is true.
No rollback occurred; snapshot `20260901T142049-5cf038` is retained. Actual commands
and sanitized evidence are in the newest VALIDATION section.

The private lab artifact is 727,096 bytes with SHA-256
`2803af9d2ff5c8172305b6fdfa042192f2cfcde10a83dea1c8d1872e5b145a94`.
Thermals and Fans share the slope refinement. Production widgets/MCP/auth/device
boundaries are unchanged. This is reviewed software and service/static evidence,
not actual phone, printer, live-camera or user acceptance.

Next smallest action: resume preserved all-nine visible lab controls/loading;
then integrate the separately authored synthetic Camera checkpoint. Keep smaller
visual Refresh, compact/medium/full plus later MCP size parameter, seven ready
migrations, Bed Mesh axes, read-only Console, model/layer progress and production
cutovers open. The original dirty checkout and reviewed source remain untouched.
These receipt-only records preserve application bytes and need no redeployment.

## 2026-09-01 shared-gradient slope candidate

The isolated `codex/u1-gradient-slope` branch starts at merged PR64 `e1f57f0`.
Only PercentageBackground CSS, its browser assertions, the deterministic lab
artifact/hash pin and required records change. Tint slopes at 100 degrees
inside an exact ratio-wide rectangle; the public component API and represented
values remain unchanged. Author evidence is in the newest VALIDATION section.
Freeze exact source, obtain separate validation/formal review, then use the
standing PR/guarded merge/deploy/BOTH restart/scoped verification workflow.

Resume preserved all-nine visible lab scenario/state controls and loading work
after this small delivery, then integrate the separately authored synthetic
Camera checkpoint using shared controls. Smaller visual Refresh and the later
compact/medium/full presentation/MCP parameter remain separate queued slices.
Do not drop seven remaining ready migrations, Bed Mesh axes, read-only Console,
model/layer progress or production cutovers. Original dirty checkout and prior
frozen source candidates remain untouched; no actual device/user claim exists.

## 2026-09-01 PR63 Fans private-lab slice shipped

Reviewed `0f78e69` merged as `57a305b` and guarded release
`20260901-57a305b-pr63-20260901T134952-9c86bd` runs on BOTH explicitly restarted,
loaded/healthy/integrity-verified U1 services. Twenty-five source-matching static
assets/routes and twenty-six security checks pass, with preservation true and
no rollback. Snapshot `20260901T135032-d34949` remains recoverable. Full sanitized
operator evidence is in the newest VALIDATION section.
Independent postdeployment validation also confirms the exact tailnet Fans
bytes/no-store response and BOTH service contracts; it does not claim phone,
printer or user acceptance.

The private SvelteKit lab contains the seven-row Fans shared-gradient/metric/
progressive-state composition. Production `/dashboard/fans` and all production
widget/MCP/auth/device boundaries remain unchanged. Use the lab for user feedback;
do not conflate static/service verification with actual phone or printer behavior.
These documentation-only receipt updates preserve exact application bytes and
need no service restart or redeployment.

Next smallest action is user review of the delivered Fans lab, followed by the
remaining explicitly tracked foundation/widget slices. Thermals and Fans now
have zero-raw ready/state/skeleton compositions. The all-nine skeleton
gallery, seven remaining ready/skeleton migrations, Bed Mesh axes/enclosure, read-only
Console, model/layer progress, Camera lifecycle and production cutovers remain
open. Server/MCP migration is an independent architecture question. Preserve the
original dirty checkout and frozen reviewed candidate branches.

## 2026-09-01 Fans & Air shared-background author candidate

Branch `codex/u1-fans-percentage` is aligned with exact PR62 merge `a3da16a`.
Changed source is the private-lab FansWidget/FanReading/FansSkeleton, shared
Stack/InfoPair/MetricValue, closed single-column ReadingList and nonshrinking
wrapping Inline options, and the central fan icon. Only Fans raw debt is
retired; no arbitrary feature markup/styles/import escape was added. Seven
canonical names/icons are structural loading content; values/mode remain hidden
until observed. Zero and unavailable percentage/RPM remain independent.

Four-width/200% browser evidence covers exact loading/ready geometry, all mode
labels, text-range containment at 100,000 RPM, nonmoving overlay feedback,
retained refresh, real gradient pixels, and unchanged Thermals regression gates.
Author commands/results are recorded in VALIDATION. Freeze this candidate,
obtain independent validation/formal review of its exact SHA, then deliver
through the standing PR/guarded ship/BOTH restart/scoped verification sequence.
No production widget or device acquisition changes are included.

PR62 prior deployment and independent postverification are attributed in
PROJECT_STATE, not claimed as this author's new checks. Continue remaining
all-widget skeleton/gallery, seven other ready composition migrations, Bed Mesh
axes/enclosure, read-only Console, model/layer progress, Camera lifecycle and
production cutovers. Server/MCP migration remains a separate architecture
discussion, not an implicit part of this slice.

## 2026-09-01 PercentageBackground / Thermals author candidate

Branch `codex/u1-percentage-background` starts at exact merged PR61 `e8edc38`.
Source changes add `ui/PercentageBackground.svelte` and its pure ratio/color
helpers, shared tint tokens, registered leaf/import contract, and the zero-raw
ThermalReading wrapper. ReadingList owns private seam/stretch tokens consumed
by ReadingRow; direct loading rows and wrapped ready rows preserve geometry.
No production widget, adapter, tool/resource, auth or acquisition code changes.
The generated private-lab asset and its frozen hash test are renewed.

Author evidence is in the newest VALIDATION section. Independent exact-SHA
validation and formal review must follow the frozen commit, then approved PR
merge/guarded deployment/BOTH-service restart and scoped verification. Prior
PR61 deployment is recorded as operator-attributed evidence in PROJECT_STATE,
not a check performed by this implementation role.

Next smallest slice: Fans & Air reuse of PercentageBackground with shared
icon/name, compact percentage/RPM rows, neutral unknowns and loading/responsive
tests. It is not implemented by this candidate. Preserve the remaining
all-widget skeleton/gallery, eight ready migrations, Bed Mesh reference axes,
read-only Console, job-bound model/layer progress, Camera lifecycle and
production-cutover tracks. No live printer, device or user acceptance is claimed.

## 2026-09-01 component foundation / Thermals state author candidate

Branch `codex/u1-component-foundation-v1` starts from exact merged PR60
`9a9038d`. Changed source is confined to `plugins/u1-print-studio/app/ui` plus
decision 0033/UI-003 and current iteration records. Shared closed primitives,
WidgetState, six-row Thermals loading, ActualTarget/ThermalReading composition
and the AST migration frontier are implemented; Thermals feature/domain files
have no native element/style/direct icon-library import. Existing production
renderer/assets/tools/routes/auth are unchanged. No server/device was contacted.

Author browser, deterministic package and full repository checks completed for
exact `9a4d02d`; formal review then blocked its aggregate-only raw-debt freeze
and fixed-height text-resize clipping. The renewed source freezes each legacy
file's exact sorted tag multiset, lets reading rows grow, and adds substitution
and required-text containment/non-overlap regressions. Renewed author gates pass
62 component tests, 54 real-Chrome cases, app 276/3,178, lifecycle 21,
shipping 24 and the repository contract. Two builds reproduce the 722,484-byte
package recorded in VALIDATION. Freeze this renewal as a new exact SHA, then
perform independent validation and formal review.
After exact approval only, PR merge and the
standing guarded deployment explicitly restart BOTH U1 services and verify the
served exact merge. Remaining all-nine skeleton/gallery, eight ready migrations,
Bed Mesh outer-axis enclosure, private sanitized read-only Console, truthful
layer-geometry progress, Camera and production cutovers remain separate named
slices in decision 0033.

## 2026-09-01 compact widget density and camera continuity — PR58 shipped

PR58 exact reviewed head `0b4f1d3` merged as `2cd7d96`. Guarded release
`20260901-2cd7d96-pr58-20260901T073117-6df842` runs on BOTH explicitly
restarted, loaded, healthy and integrity-verified services at runtime 0.4.8/
schema 12/observation-v14/camera-v10. Twelve local-plus-tailnet dashboard route
checks return 200 with byte-identical content, sixteen security checks pass and
no rollback occurred. No printer, camera or actual-device acceptance was
performed or claimed.

## 2026-09-01 all-observation Svelte private-lab candidate

Starting from exact merged main `f44bd06`, the isolated branch extends the
merged Svelte foundation to the private `/dashboard/lab` directory and all nine
non-camera observation candidates. One path-selected, self-contained static
page supplies synthetic Overview, Print Progress, Thermals, Heads & Filaments,
Current Job, Job History, Print Queue, Fans & Air and the unchanged Bed Mesh.
Camera is visibly pending and has no link or lab route.

Changed scope is `plugins/u1-print-studio/app/ui` components/fixtures/tests,
the deterministic private package, exact private-server route handling/tests,
shipping static-contract derivation and durable decision/iteration records.
Existing production dashboard HTML, widget/camera resources, tool inventory,
observation adapters/stores, auth and public routing are untouched. Components
accept only strict versioned normalized props and contain no acquisition code.

Formal review blocked exact `8a6df9b` on post-mount route selection, raw
dot-segment normalization, RGBA rejection, mixed row clocks, responsive
clipping and overbroad validator claims. The renewal emits a neutral zero-size
SSR marker and selects the exact pathname during initial browser creation,
rejects literal/single/double-encoded traversal from the raw target, retains
normalized RGB/RGBA alpha, uses viewer-local row clocks, and enforces Overview
1/2 columns, Heads two columns/content-driven height and canonical Thermals
labels/titles.

Re-review additionally caught a generic-to-canonical title mutation and the
missing accepted Heads wash/Copy interaction. The earliest inline bootstrap now
sets the canonical child title before hydration. Heads uses a six-percent wash
that preserves RGBA alpha, exposes one 44-pixel bottom Copy action for each of
the three valid colors, none for Empty/N/A, and shares one non-flow feedback
overlay with Refresh.

Exact `b3e0c7e` remained blocked: external Copy state could mask a newer
Refresh message, and the active border was incorrectly coupled to filament
color. `ObservationFrame` now owns the single feedback state/timer and passes
one announcer to Heads; Copy and Refresh replace each other in exact action
order. Active border uses `--u1-accent`; changing filament color changes only
the six-percent wash and exact swatch.

Exact `4e8788f` remained blocked on pending clipboard ordering. The corrected
controller begins Copy synchronously with persistent `Copying …`, increments
one generation for every action, and allows clipboard success/failure to settle
only the still-current generation. Deferred resolve and reject can no longer
replace a newer Refresh; a newer Copy still settles truthfully.

Author evidence passes 25 UI tests, 50 real-Chrome cases, 276 app tests/3,178
assertions, 21 lifecycle and 24 shipping tests, deterministic packaging, all
three bundles, help and signature. The exact package is 713,802 bytes with
SHA-256 `565c731ef6199c81e5df4f758837c6980fb33d7cc349905d7f16c4acbf17e2eb`.
The deliberate risk is the 36,198-byte headroom below 750 KB while local
Three.js coexists with eight compact views. Chrome measures one visible exact
route, exactly one canonical non-empty title from initial parsing, zero layout
shift and no required-text clipping at every frozen width; both Copy/Refresh
orders keep one latest-action overlay and change card height by less than 0.1
pixel. Bed Mesh remains unchanged. No merge/deploy/service/printer/camera/auth/
Tailscale contact occurred. Next: exact-candidate review; production cutovers
remain separate later slices.

## 2026-09-01 Svelte Bed Mesh private lab readability renewal

Decision 0032, UI-001 and the active migration addendum preserve the existing
focused routes/resources while the Svelte candidate matures at the exact private
`/dashboard/lab/bed_mesh` fixture route. The 669,506-byte self-contained static
page is imported into the private server bundle; public HTTP returns 404, the
ten-entry directory and `/dashboard/bed_mesh` are unchanged, and no MCP resource
or generic embed is packaged.

Shared components are `WidgetShell`, `WidgetHeader`, `WidgetBody`,
`WidgetFooter`, `ObservedMeta`, `IconButton` and `ChartFrame`. Bed Mesh receives
validated normalized props, uses one 4:3 frame for local Three.js 3D and Canvas
2D, preserves one palette/actual-mm summary, places icon-only 44-pixel actions
below information and uses a non-flow flash overlay. Validation admits only the
exact freshness enum, canonical millisecond UTC source time, bounded safe
profile text, finite rectangular matrix and consistent XY bounds; it verifies
the supplied summary within `0.000001 mm` and renders recomputed values. It has
no direct network or printer path.

Formal review blocked exact candidate `a6363fd` because profile validation did
not yet match the adapter rule. The corrected bridge accepts only Unicode
letters/numbers, ASCII space, underscore, dot and hyphen within 1--80 code
points, trims outer spaces and rejects empty/dot/dotdot. Component adversaries
cover traversal, URL, bidi, markup and controls; international-valid examples
remain accepted.

Independent review blocked exact earlier candidate `7aef4b5`: frame equality
passed, but its 3D surface remained a thin central strip and its sprite labels
were effectively 3--6 pixels. The renewed implementation uses a full XYZ grid
and nine stable 12-pixel HTML labels. Author evidence passes Svelte check, 8
Vitest tests, deterministic package verification, four real-Chrome private-
handler geometry/readability/screenshot cases and the complete repository gate
(274 app/2,974 assertions, 21 lifecycle and 24 shipping tests). At
320/390/590/720, the 3D and 2D `ChartFrame` DOMRects are equal within 0.1 CSS
pixel and 4:3; the real projected surface covers 91.9--92.5% of chart width and
53.4--53.7% of chart height; every label is visible, in-frame and pairwise
non-overlapping; and no overflow, console error or external request occurred.
Runtime/stdio/private-server bundles and the runtime signature pass. Exact
package SHA-256 is
`7eaf7f211bed3466665b61bb3d483e6309b9f17f7519f39cf6de44484dcc24ec`.

No deployment, service restart, printer/camera observation, auth/Tailscale
change, MCP registration or focused production cutover occurred. The next action
is renewed independent exact-SHA review. Deployment remains a later coordinator-owned
step; a focused Bed Mesh cutover is a separate slice.

## 2026-08-31 unified widget and camera reliability — shipped in PR56

Exact reviewed head `e2702dc7a39c45665aa14155e85d13011d50526b` merged in
PR56 as `cb7d06fdcc4de45f7fb5803fe2efee13364eba0f`, tree
`dc290de12aceebe134b6e3ceb78aa2e8d8789f73`. Guarded release
`20260831-cb7d06f-pr56-20260831T234756-96fe19` is installed on BOTH explicitly
restarted, loaded, healthy and integrity-verified services at runtime 0.4.7/
schema 12/observation-v13/camera-v9. Sixteen security checks pass and no
rollback occurred.

The served observation and camera hashes exactly match
`1d61271d773e532954f379c877ce58f54fad90ca996acda54e3ba4537504fb2c`
and `03c3d3a96cec99eef630c444f31f8a9ff6f1caf56d89d83d61d5a60eabb89dd0`.
All ten dashboard routes returned 200 on both local and tailnet origins;
independent postdeployment validation reports PASS.

The next smallest action is user visual/device review only. The browser runtime
was unavailable during rollout, so iPhone layout, WebGL rendering/fallback,
touch interaction and live-camera/fullscreen continuity remain pending. No
camera or printer request was made, and the deployment evidence does not prove
physical-printer behavior or user acceptance. This docs-only handoff does not
deploy, restart or contact either service.

## 2026-08-31 unified widget and camera reliability — source freeze

Decision 0031's smallest end-to-end source slice is frozen at runtime 0.4.7/
schema 12/observation-v13/camera-v9. It contains the shared generated CSS
contract, compact Progress layout, presence-first Heads/Overview, compact Fans,
local exact Three.js Bed Mesh with exact 2D fallback, and bounded camera
bootstrap/remount/fullscreen behavior. Compatibility aliases bring the resource
count to 24; tool, auth, route and printer-read boundaries are unchanged.

Author checks pass 263 tests/2,734 assertions, TypeScript, runtime/stdio/server
bundles and diff checks. The generated served vendor block retains the complete
Three.js MIT notice. Frozen SHA-256 values are
`1d61271d773e532954f379c877ce58f54fad90ca996acda54e3ba4537504fb2c`
for the observation widget,
`03c3d3a96cec99eef630c444f31f8a9ff6f1caf56d89d83d61d5a60eabb89dd0`
for camera and
`6f11808888df189fa83bac98169d85ab42bb10ef4c105037efa64cb7ccc9c1e2`
for shared CSS. Independent exact-byte validation is active. Do not edit or
regenerate the app candidate until it reports. If approved, next is the
standing formal review and guarded PR merge/deploy/restart-BOTH/verify
workflow. No deployment or visual/device acceptance is claimed.

## 2026-08-31 E compact Overview — shipped in PR54

PR53 merged the reviewed Overview application as `4541ff12`. Its first guarded
delivery reached verification, where the contradictory private Overview 200/404
check stopped the rollout. Verified rollback snapshot
`20260831T195837-6233d9` restored both healthy services at runtime 0.4.5. PR54
head `a9ad04a` corrected that verifier and merged as
`aa9bd9d609dbdca7c1e0124b4f760d5eb8ddf2c5` at
`2026-09-01T00:10:35Z`.

Guarded release `20260831-aa9bd9d-pr54-20260831T201019-d7aa8a` is installed on
BOTH explicitly restarted, loaded, healthy and integrity-verified services at
runtime 0.4.6/schema 12/observation-v12/camera-v8. Rollback snapshot
`20260831T201038-575d7f` is retained and was not needed. Configuration, OAuth
and routes were preserved; sixteen security checks pass. Served widget, index
and status-host hashes have exact verified prefixes `a8a4…`, `49a5…` and
`008d…`. Tailnet index and Overview each return 200.

Exactly one private Overview refresh reported coverage complete, all eight tiles
known, and every contributing receipt fresh and timestamped. This record retains
no raw response, filename, job row, identifier, model/project identity, private
path or other private payload. Browser/device visual behavior and physical user
acceptance remain unverified. All focused widget tracks are now delivered; next
is user visual review and bounded product iteration, not another implementation
track.

## 2026-08-31 E Overview guarded-delivery verifier correction

The E application source is merged, but guarded delivery must be renewed after
a contradictory verifier stopped the first attempt during post-install
verification: exact static verification correctly required private
`/dashboard/overview` to be 200 with its frozen hash, then a stale hard-coded
security tuple incorrectly required that same private route to be 404. The
guarded workflow rolled back and verified the prior services restored; no E
deployment remained. The minimal source repair deletes only that tuple. Security
still derives and verifies every dashboard route—including Overview and Camera—
as 404 on public port 8787, while static verification remains the sole exact
private Overview 200/hash authority.

The focused shipping suite passes 24 tests; the full repository gate passes 253
app tests/3,559 assertions, 21 lifecycle tests, 24 shipping tests, TypeScript and
repository policy. New fixtures also prove the scoped Overview static check and
security checker touch no tool-call, widget, camera-widget or observation
acquisition endpoint. This role made no Git delivery or remote GitHub call and
contacted no service, auth, Tailscale, printer or browser endpoint. The failed
shipment's verified rollback is guarded-workflow evidence, while a corrected E
deployment remains unclaimed. Next:
independently review and deliver this source-only correction, then rerun the
guarded exact-build deployment, explicit BOTH-service restart and scoped static,
security, health and runtime verification before offering the Overview URL.

## 2026-08-31 E compact Overview — source-complete handoff

The smallest E source slice is implemented and locally validated: exact
eight-projector privacy-minimized headlines, per-domain receipts and overall
coverage, explicit all-domain Overview demand through existing stores, one
responsive white card with one bottom Refresh, private route/index coverage,
and runtime 0.4.6/schema 12/observation-v12 plus observation-v11 compatibility.
Focused cards, Camera, the two-visible/eight-app-only tool inventory and all
existing adapters remain intact.

Changed application scope is `plugins/u1-print-studio/app` presentation,
widget, route/runtime wiring and durable tests, plus its `README.md` and plugin
`PACKAGING.md`. Current records and decisions describe the same frozen contract.
Repository checks pass 253 app tests/3,559 assertions, 21 lifecycle tests, 22
shipping tests, TypeScript and repository policy; all three bundles, standalone
help/signature and six exact asset comparisons pass. Independent validation
reports 926 assertions green, including hostile state/receipt/fact isolation,
mapped failure reasons and real initial/retained-offline composition. No
runtime, service, auth, printer or browser was
contacted. Next: exact candidate review and commit/PR delivery, followed by the
already-authorized exact-build deployment, explicit BOTH-service restart and
scoped verification. Visual/device and user acceptance remain open.

## 2026-08-31 E compact Overview — design handoff

Decision 0021's completion addendum, decision 0029 and OBS-015 freeze the final
composition boundary. Explicit Overview call/Refresh acquires main status plus
Materials, Environment, Queue, Bed Mesh, Current Job and Job History concurrently
through their existing independent readers, receipts, 15-second attempt TTLs,
coalescing, stale retention, atomic merge and fixture isolation. No adapter,
cache, timer or normalizer is added. Static/index/health and unrelated focused
views never fan out; Camera remains separate.

Build one privacy-minimized `OverviewModule` from the exact Progress, Thermals,
Heads, Current Job, Job History, Queue, Fans and Bed Mesh projector outputs. It
must not carry full nested modules and leave privacy to the DOM. Each tile has
explicit receipts keyed by contributor: Progress status; Thermals status plus
environment; Heads status plus materials; Current Job currentJob; History
jobHistory; Queue queue; Fans environment; Bed Mesh bedMesh. Header provenance
is status-only. Coverage complete/partial/none means all/some/none of the eight
have known or retained stale data; it is not freshness, health or safety.

Render one responsive compact white card with two headline columns collapsing
to one and exactly one bottom Refresh. Use only the bounded headline facts fixed
in decision 0021. Exclude full lists/cards, charts, mesh surface, filename,
project/model identity, bytes, IDs, raw rows/times/metadata, history-total claim,
Queue rows, profile, camera/media, navigation, pagination and controls.

Target private `/dashboard/overview`, a truthful directory entry, runtime 0.4.6/
schema 12/observation-v12/camera-v8, 22 resources with observation-v11 retained,
and unchanged two-visible/eight-app-only tools. Exact base for this docs pass is
`e7262d7426ab94dca264e04a9d7a32276f287ea1`. No E app/test/Git/service/printer/
browser mutation or implementation/deployment/live/visual evidence occurred.
Next: smallest source slice, independent fixtures and exact-candidate review,
then guarded PR merge/deploy, explicit BOTH-service restart and scoped verify.

## 2026-08-31 D Current Job/real History — shipped handoff

PR51 exact head `30f1c7bb407d08d19d390acf2b5704a30eff010f` passed formal and
independent approval and merged as
`23f07e37de668fcbf2677a9a9b27bf01448cc8e7` at
`2026-08-31T23:10:43Z`. Guarded shipping installed
`20260831-23f07e3-pr51-resume-20260831T191106-be85c4`; rollback snapshot
`20260831T191118-908e33` exists and was not needed. No D deployment failure
occurred. BOTH services were explicitly restarted and are loaded, healthy and
integrity verified at 0.4.5/schema 11/observation-v11/camera-v8. Sixteen security
checks pass with config/OAuth/routes preserved. Widget/index hashes have verified
prefixes `1830fa11…`/`e9847d7c…`; tailnet index/jobs/job_history return 200.

Source evidence passes 247 tests/3,402 assertions, 21 lifecycle, 22 shipping,
the corrected independent 197-assertion matrix, bundles, signing and exact assets.
Exactly one sanitized Current Job read was known/fresh and showed a complete
terminal job with inactive storage and equal reported file position/size.
Exactly one sanitized History read was known/fresh with 20 returned rows: 17
Completed and 3 Cancelled, preserving returned order. No filename, project/model,
job ID, row time, raw numeric runtime, raw row or history-total claim is retained
in repository evidence. These checks prove bounded telemetry semantics only;
browser/device visual and user acceptance remain unverified.

Decision 0025's addendum/OBS-014 remain the durable privacy, freshness, state and
presentation contract. These rollout-record edits are documentation-only and do
not redeploy unchanged app bytes. Preserve A/F/Heads/B/C/D. Next: E Overview,
composed only from accepted focused-domain projections without another query or
normalization path.

## 2026-08-31 C Fans & Chamber — shipped handoff

PR49 exact head `c14e92cfc655d0b7a6e7d0138650d7937789d7d1` was formally
and independently approved without findings and merged as
`3ab4ed7813a8f2ba45ac63b3093480183c428f28` at
`2026-08-31T22:21:37Z`. Exact release
`20260831-3ab4ed7-pr49-resume-20260831T182603-74d978` was installed after a
successful retry pinned the actual Bun 1.3.12 executable. Rollback snapshot
`20260831T182614-2d2722` exists; no rollback was required. BOTH services were
explicitly restarted and are loaded, healthy and integrity verified at runtime
0.4.4/tool schema 10/observation-v10/camera-v8. Sixteen security checks pass;
configuration, OAuth and routing were preserved. Frozen widget/index SHA-256 are
`af27b363c91934a69962e18f84f0a0cc16f231d3d5e93f51d1e652dea89d4f3d`
and `7381f1d19a25ba139328013b9456949ddd4e9a62d860b484f1477859eeb6b4b9`.
Tailnet index, Fans and Thermals each return 200.

Scoped verification made exactly one Fans and one Thermals POST. Both share
source observation time `2026-08-31T22:27:06.974Z`: Fans is known/fresh; Tool 1
reports speed 1 and 9131.8476 RPM, Tools 2–4 report zero speed/zero RPM, Cavity
fan reports speed 0.698039 and 2400.5964 RPM, purifier power detection is false
with null mode, and purifier fan rows are `not_reported`. Thermals environment is
known/fresh with Cavity 33°C. These are telemetry facts only, not proof of fan or
sensor accuracy, purifier installation, health, safety or physical acceptance.
No browser/device visual pass exists.

Two guarded-delivery failures preceded the successful install. Running the ship
wrapper after manual merge refused preflight with `PR must be open...` and made
no changes. The first post-merge stage selected an ASDF shim; dry-run failed with
`bun exit127`, performed no install or rollback, and left the old 0.4.3 services
verified. Staged release
`20260831-3ab4ed7-pr49-resume-20260831T182443-ab31ae` remained staged but
inactive and was never installed. The pinned Bun retry above succeeded. These
documentation-only rollout records do not
redeploy unchanged app bytes. Next: D Current Job/real History, then E Overview.

### Previous C source checkpoint

Decision 0029/OBS-013 define one shared, fixed read-only environment observation
for independently invokable Thermals and Fans & Air. Exact allowlist, mapping,
bounds, state taxonomy, 15-second TTL/coalescing/stale retention and white compact
presentation remain durable. The predeployment checkpoint claimed no live or
visual evidence; the scoped rollout evidence above supersedes that status only.

## 2026-08-31 B Queue integration — shipped handoff

PR47 shipped B Queue. Exact reviewed `1068add` was approved without findings
and merged as `6d76f9ac1c1c6daded28f3b0b945c934e56504e0`; guarded shipping installed
`20260831-6d76f9a-pr47-20260831T172710-645971`. BOTH public/dashboard services
were explicitly restarted and are loaded/healthy/integrity verified at 0.4.3/
schema 9/observation-v9/camera-v8. Fourteen static and sixteen security checks
pass, config/auth/routes are preserved, no rollback occurred, and installed
widget/index hashes match the frozen source. Independent checks confirm all 15
manifest files, both service targets, three health/seven exact local-tailnet
static checks, and exactly one known/fresh paused-empty Queue observation at
`2026-08-31T21:31:36.003Z`; exact served-widget semantics pass. Browser/
device visual acceptance remains unverified; the user has the live Queue link.
These rollout-record changes are documentation-only and require no second
deployment. Next implement C fans/chamber, preserving D/E. No raw Queue names,
IDs or payload were logged or retained; the postrelease check made no camera,
mesh, other-view, control, service, auth, routing or file mutation.

### Previous Queue source checkpoint

The user continues the full widget track after PR46 merged the Heads rollout
records at `bd7abc8f07f7bbe1fdd47e45eabaf41b8b7110b2`. Resume B Queue, preserving
deployed A/F/Heads and next C fans/chamber, D Current Job/History and E overview.
Decision 0029's integration addendum and OBS-012 record the design/acceptance
boundary: reuse foundation `4fbb96c`, independent receipt/attempt TTL/coalescing/
retained stale data, safe ordered bounded rows and omitted-count disclosure,
truthful empty/unknown/unsupported/unavailable states, white card with top
information and bottom Refresh. Candidate source is runtime 0.4.3/tool schema 9/
observation-v9/camera-v8 with nineteen resources and observation-v8 retained.
No new query surface, tool or queue/file control is added.
Author checks pass 223 app tests/3,150 assertions. Independent validation passes
those plus 21 lifecycle, 22 shipping and 15 focused tests/7,049 assertions,
TypeScript/diff checks, all three bundles/code signing and six exact emitted
assets. Formal review then found one singular omission-summary grammar defect;
the minimal correction changes only the widget and focused widget test. Renewed
author checks pass 44 focused tests/1,565 assertions and the full suite/build
gates above. Frozen widget/index SHA-256 values are respectively
`76d356cc287f11e400f896640162134bcabf8ca8b0ce883a2e46ed1024564092` and
`626348d296d8748e83c7a4e7732656694de3b1dc3ece259fb1e92bb1ce32c0b6`;
focused widget-test SHA-256 is
`5448fa6d6b57f02c95e2f2381957751c85006e95143550ac807827437945b51f`.
The three foundation files match `4fbb96c`. Renewed independent validation finds
no issues and made no runtime call; exact-SHA review was open at this source
checkpoint and completed in the PR47 rollout above.

Design-record changes: decision 0029, requirements, PROJECT_STATE, NEXT_AGENT,
this iteration's BRIEF/WIDGET_TRACKS/VALIDATION/HANDOFF, and design-qa. App code
is owned separately by implementation; final changed paths are frozen in the
candidate and passing source evidence is recorded above. No exact source approval,
Queue merge, deployment or browser/device pass is claimed by this checkpoint.

Next smallest action: finish store/projection/widget integration, validate and
independently approve the exact candidate, then use unchanged guarded PR merge,
exact-build deploy, explicit restart of BOTH existing services and scoped Queue
verification. The allowed browser remains unavailable; the user's deployment-
first review order does not create visual acceptance. Preserve auth/config/
routes, frozen assets and unrelated checkouts. Keep raw filenames, jobs and
private runtime receipts outside Git; no camera/Heads/Bed Mesh acquisition or
controls are required for this Queue slice.

Independent validation intended fixture-only predeployment work, but executing
the compiled `doctor --json` once caused one unintended general read-only status
observation and reported reachable. It did not query Queue/camera/mesh, mutate
printer/service/auth/config state, or retain the payload; runtime commands then
stopped. This does not consume the later one scoped postdeployment Queue check.

## 2026-08-31 Heads reference refinement — previous shipped handoff

The user prioritizes the selected Heads design before Queue: a white outer
container, softly washed actual filament colors per tool, real tool/state and
material/temperature rows, exact swatch/hex and accessible Copy. Decision 0029
records 6% validated color over white respecting alpha, neutral unknowns,
independent active state, unchanged physical mapping/presence/material freshness
and bottom Refresh.
Reuse system fonts and attributed Feather icons; no generated assets or new
printer reads/controls. A/F remain deployed; B–E remain active after this slice.

Design-record scope: decision 0029, requirements, this iteration's BRIEF,
WIDGET_TRACKS, VALIDATION and HANDOFF, PROJECT_STATE, NEXT_AGENT and design-qa.
Application scope is nine paths: `public/widget.html`, `src/app.ts`, and
`src/{app,bed-mesh,cli,observation-widget,personal-oauth,status-dashboard}.test.ts`,
plus `src/runtime-contract.ts`, all under `plugins/u1-print-studio/app/`.
Source is 0.4.2/schema 8/observation-v8/camera-v8, eighteen resources; author
checks pass 106 tests/2,290 assertions and TypeScript. VALIDATION records exact
commands and frozen hashes; camera/index/acquisition/shipping bytes are unchanged.
Independent validation passes 200 app/2,855 assertions, 21 lifecycle, 22 shipping,
86 fixtures/751 assertions and TypeScript/repository/bundles/signature/exact
assets. Exact formal review approved `e369ca4d53867b1904af5326b38f4b92b82ea3b0`
without findings and passes 41 widget/1,537. PR45 merged it as
`90d9f9d353c7bca2c299ab7ae949ad81e7d4faca` at `2026-08-31T19:27:56Z`;
guarded shipping installed `20260831-90d9f9d-pr45-20260831T152746-190348`.
BOTH services were explicitly restarted and are loaded/healthy/integrity
verified at 0.4.2/schema 8/observation-v8/camera-v8. Fourteen static and sixteen
security checks pass, config/auth/routes preserved, no rollback. Independent
postdeployment verification passes both fifteen-file manifests, three health/
seven exact static checks, one fresh four-head/material read and 35 exact
served-widget VM assertions. VALIDATION records independent status/material
receipt times and actual commands. Fresh
allowed-browser discovery is unavailable, so the current visual QA is blocked,
not passed. Actual-device/native clipboard acceptance is also unverified.

Next smallest action: merge these docs-only rollout records without another
application deployment, then resume Queue store/projection/widget integration.
The user has the live Heads review link; no visual pass is inferred from delivery.
Retain the guarded PR/exact-review/deploy/BOTH-service restart/verification
sequence for each later app change. This follow-up changes only eight rollout
record files, not requirements or the deployed nine application paths above.
Preserve auth/config/routes, frozen assets and all unrelated widget tracks;
no plugin reinstall or printer control.

## 2026-08-31 F reported Bed Mesh surface — previous shipped handoff

F is shipped in PR43: reviewed `41546d9e3ea841bdd23279694079719327f39f39`
merged as `92a62c04c22600ee802d7be3c0b27285135f6d33` at
`2026-08-31T19:00:51Z`. The read-only plan passed and guarded execution installed
`20260831-92a62c0-pr43-20260831T150042-2e7c64`. BOTH public/dashboard services
were explicitly restarted and are loaded/healthy/integrity verified at
0.4.1/schema 8/observation-v7/camera-v8. Fourteen exact static and sixteen
security checks pass; OAuth/environment/config/routes are preserved, no
rollback needed. Independent exact-release/manifest, fourteen local/thirteen
tailnet static and tailnet-health checks pass. Exactly one private refresh
returns a known/fresh active 11 by 11 mesh at `2026-08-31T19:03:22.696Z`;
visual/device acceptance remains unverified. VALIDATION records
the actual commands and exact source/merged/release identities.

At the earlier Bed Mesh checkpoint, the user's Fluidd reference prioritized a bounded interactive
3D reported-height surface inside the existing white card. Decision 0030 and
OBS-009 supersede only the 2D-only presentation and prior release ordering.
The order recorded then was A/F (deployed) → B Queue → C fans/chamber → D
Current Job/History → E overview. The authoritative top section now records B/C/D/E
shipped and visual review next. Keep independent invocation and
the Current Job/History split. A's exact deployment receipt is preserved below;
it is not acceptance of the new F source.

Implementation is 0.4.1/schema 8/observation-v7/camera-v8 with seventeen
resources. Formal review's P2 centroid-sort occlusion defect is corrected in
widget source. Final author freeze is
`c800447957bf8b7b386ddba7666941f625170db92107d31230c5f382378d77f6`, including
corrected reported-point draw order; author widget checks pass 35/1,415.
Independent final validation passes 194 app/2,731 assertions, 21 lifecycle,
22 shipping, 22 independent/1,162 assertions, TypeScript/repository and all
bundles/exact assets. Geometry sweeps, the original regression and point-order
checks pass; exact head `41546d9` was independently approved without blockers
before shipment. Numerical geometry
checks do not establish rendered-browser or user-device acceptance.
F's required behavior: same reported matrix/bounds, adjacent-point surface,
XYZ mm axes and numerical height legend, min/max/range/grid size, explicit
height exaggeration, pointer/keyboard orbit/reset, and retained 2D fallback.
No resampling, `mesh_matrix` substitution, extra acquisitions or printer/profile
controls. Preserve every valid vertex plus flat/inactive/unknown/stale states
and independent observation time; connecting faces add no measurements.
Bottom local controls are 3D/2D, height 1x/100x/300x (default 100x), Reset view
and existing Refresh. Keep copy compact, actions below information and
accessible narrow layouts. No camera, Queue or other-domain redesign is part
of this F slice.

Changed documentation: decision 0030, `docs/requirements.md`, this iteration's
`BRIEF.md`, `WIDGET_TRACKS.md`, `VALIDATION.md`, `HANDOFF.md`, `PROJECT_STATE.md`
and `NEXT_AGENT.md`; `design-qa.md` now explicitly records F as visually blocked/
unverified rather than borrowing an earlier result. Application scope is ten
paths under `plugins/u1-print-studio/app/`: `public/dashboard-index.html`,
`public/widget.html`, `src/app.test.ts`, `src/app.ts`, `src/bed-mesh.test.ts`,
`src/cli.test.ts`, `src/observation-widget.test.ts`, `src/personal-oauth.test.ts`,
`src/runtime-contract.ts`, and `src/status-dashboard.test.ts`. Camera bytes are
unchanged. Current corrected-source evidence and historical failed-checkpoint hashes
are in VALIDATION. This follow-up changes rollout documentation only, not the
merged application. The design role owns these records; the operator and
independent validator supply actual deployment/domain evidence.

Next smallest action: review/merge these docs-only rollout records without a
second application deployment, then integrate Queue's store/projection/widget
while the user reviews F. Retain the standing guarded exact-review/merge/deploy/
BOTH-service restart/verification sequence for each later application release.
Fresh allowed-browser discovery is unavailable, so rendered/browser/device
acceptance remains unverified rather than blocking this authorized order.
Source, simulator, real-printer acquisition, deployed behavior and physical
acceptance remain separate. Preserve OAuth/environment/config/routes and all shipping guards;
no printer controls, profile/queue/history writes, plugin reinstall or deferred
Mac administration is authorized.

## 2026-08-31 release A — previous shipped handoff

Release A is shipped. [PR41](https://github.com/scottchu/orca-slicer-mcp/pull/41)
merged reviewed `744f7d06607526a10997b926d91b18087c4030cf` as
`b6142de6241cb2e1b6ac70b509f2d0b0e836f1d8` at `2026-08-31T18:06:04Z`.
Installed release `20260831-b6142de-pr41-20260831T140555-84d50f` reports
0.4.0/schema 8/observation-v6/camera-v8. BOTH public/dashboard services were
explicitly restarted and are loaded, healthy and integrity verified. Fourteen
static and sixteen security checks pass, OAuth/environment/config/routes are
preserved, and no rollback was needed. The user explicitly authorized deployment
before automated browser QA to visually review it themselves; no rendered or
actual-device acceptance is claimed. Independent read-only verification confirms
both exact installed manifests/releases, health and four user-facing pages,
twelve exact asset comparisons, fresh material metadata for four physical heads
at `2026-08-31T18:08:02.427Z`, and a structurally valid 253,183-byte 1920 × 1080
JPEG at `2026-08-31T18:08:02.952Z`. No live activation, image-quality, browser,
phone or physical acceptance is inferred. Raw metadata/images remain private.

The user wants every pending read-only widget completed and all cards/index
restyled to the selected white reference. Decision 0029 and `WIDGET_TRACKS.md`
freeze this direction and supersede older deferrals/overlays below. Release A
combines material metadata, shared white foundation, selected camera and
continuous progress; B Queue, C fans/chamber, D Current Job/History, E overview
follow sequentially, with all unfinished rows retained as active. Existing
Bed Mesh is restyled with A. Invokable skills and jobs/history separation stay.

The delivered sixteen-resource application changes fixed material
adapter/model, shared store/Heads projection, app/server/dashboard plumbing,
white focused/camera/index/host HTML, runtime contract and associated tests.
Docs scope: decision 0029, requirements, project/next-agent state and current
iteration records/track matrix; the validator owns the current blocked
`design-qa.md`. The design role changed docs only and no frozen source bytes.
Camera uses genuine media, header information, working snapshot feedback and
native fullscreen on the card; frame/FPS watcher semantics remain unchanged.
Progress lower metrics are elapsed-only because nozzle/bed/speed/height are
not projected. Feather icons retain local MIT attribution; firmware material
labels are not Orca presets. VALIDATION records current approved-source hashes,
prior checkpoint findings and precise evidence boundaries. The earlier contrast
P2 is resolved; visual acceptance remains pending.

The preliminary read-only shipping plan stopped because a scoped BRIEF edit
was uncommitted; it performed no external mutation. The operator committed that
note, obtained renewed exact-SHA approval, reran a successful read-only plan,
then executed `u1-ship`. No guard was bypassed. VALIDATION records the exact
redacted operator commands and separate source/deployment evidence.

These docs-only rollout records on `docs/u1-pr41-rollout` change no application
bytes and need no new deployment. Next integrate Queue's store/projection/widget
while the user reviews the delivered A widgets.
Camera's
combined muted state/FPS/time text differs from the reference's differentiated
text/dividers and needs visual classification; do not claim 1:1 fidelity from
source/fixture results. Direct accessible controls are an allowed design choice.
Queue's standalone three-file adapter/model/test foundation is locally committed
as `4fbb96c7201398c125006cafc5050b84a875af1e` on `feat/u1-queue-completion`.
Independent bounded source/protocol review approves, closing the prior P2;
TypeScript, 40 tests/461 assertions and six independent tests/68 assertions pass.
Store/projection/widget integration is next; no integration, merge or deployment
is claimed. B–E source work may continue in stacked branches while
A's user visual review is pending; sequential reviewed release order is unchanged.
Preserve other dirty checkouts. No printer controls, queue/history mutation,
preset/project sync/write, auth/Tailscale change, plugin reinstall, or previously
deferred Mac login work enters this request. Other risks: independent material
freshness/privacy, unsupported versus unimplemented meaning, media regression,
and exact source-versus-deployed tracking for every release.

## 2026-08-31 bottom-left camera information and FPS repair — shipped in PR38

The user requests camera state/FPS/time bottom left because the top overlay
blocks the view, while display/live controls remain bottom right. CAM-008 and
decision 0023 record this camera-only exception and narrow wrapping: the
information gets the preceding left-aligned row when necessary, without
truncating time/FPS or shrinking/overlapping controls. Rejection feedback stays
at the top; network jargon remains hidden.

The layout and a reproduced missing-FPS product defect are fixed in source:
repeated same-peer track events previously started duplicate frame watchers,
whose repeated counters reset the measurement window. Cancelling prior frame
callbacks/decoded intervals and generation-guarding old callbacks prevents it.
Author checks pass 83 tests/862 assertions and TypeScript. Independent
native-browser evidence includes six captures at 320/390/720 px. Synthetic playback went from roughly
30 FPS to missing after repetition before the fix, and retains roughly 30/31
FPS afterwards. This does not establish the user's device-specific cause or
actual printer streaming. Source 0.3.5/schema 7/observation-v5/camera-v7, with
v6/v5/v4 aliases and fourteen resources, is independently reviewed and shipped
through `u1-ship`: reviewed `a35c92c813d669bef696fefbbc87ee7bd5390630`, merged
`b565eecc30ec394137483f4619a523807b59e538`, release
`20260831-b565eec-pr38-20260831T130407-2e3c85`. Both services were explicitly
restarted and are healthy/integrity verified. Fourteen static and sixteen
security checks pass, private configuration/authentication/routes are unchanged,
and no rollback was needed. Exact receipts remain private; validator-owned
`VALIDATION.md` records the source and deployed checks separately.
Next review/merge only these rollout records: source/tests are unchanged and
need no second deployment. Queue/minimal-progress work remains separate, and
no actual-user-device success is claimed from synthetic native playback.

## 2026-08-31 live-only measured FPS — shipped in PR36

The user requests FPS back only while live. Decision 0023/CAM-008 now permit
`Live · 29 FPS · time` in the top information pill, while network diagnostics
remain hidden and bottom actions stay unchanged. Use actual presented/decoded
counter deltas, not polling callbacks; omit startup, invalid/reset and stale
rates, clear on exit/peer change, and retain truthful frame/snapshot clocks.
The implemented source is runtime 0.3.4/camera-v6 (v5/v4 aliases), observation-v5/
schema 7 unchanged, thirteen resources and unchanged tool/view counts.

Independent review approved `40d359bd81df3523a32726172f64b045ab027e86`;
`u1-ship` merged PR36 as `3fc918e5c64b401f497f97144d9c81423877d852` and deployed
release `20260831-3fc918e-pr36-20260831T124701-e914a1`. Both U1 services were
explicitly restarted and are healthy/integrity verified at the contract above.
Fourteen static and sixteen security checks pass; OAuth/configuration/routes
are unchanged and no rollback was needed. `VALIDATION.md` records independent
source and post-shipment evidence; these checks do not prove phone/live-video
playback. Its docs-only rollout record is merged, with no second deployment
for unchanged app bytes. Queue WIP and minimal-progress changes
remain deferred. No printer control or plugin reinstall was performed.

## 2026-08-31 PR34 shipped and independently verified — current handoff

The repository `u1-ship` workflow successfully shipped PR34 after independent
approval of `97b5106d29e1d5c3d3dde4aa7810724d2d3bcce1`. The guarded merge
produced `7194361d4a8d7a2291bcc64f1d053eae51a8d99c`; staged and installed
release `20260831-7194361-pr34-20260831T121439-3ba53f` contains that exact
merged application. Both public and dashboard services were explicitly
restarted and are loaded/healthy/integrity verified at runtime 0.3.3/schema 7/
observation-v5/camera-v5. Fourteen static and sixteen security checks pass.
OAuth, environment, configuration, routes and preserved plist fields are
unchanged. The coordinator and independent validator separately verified the
result. The exact rollback snapshot and operation receipt remain private;
no rollback was required.

Actual operator commands (the runtime path is deliberately a placeholder):

```sh
uv run --no-project scripts/u1_ship.py --pr 34 --reviewed-sha 97b5106d29e1d5c3d3dde4aa7810724d2d3bcce1 --bun <ABSOLUTE_PINNED_BUN>
uv run --no-project scripts/u1_ship.py --pr 34 --reviewed-sha 97b5106d29e1d5c3d3dde4aa7810724d2d3bcce1 --bun <ABSOLUTE_PINNED_BUN> --execute
```

Independent live observation reads one known/fresh active reported Bed Mesh:
11 × 11 points, minimum -0.340833 mm, maximum 0.066667 mm, range 0.407500 mm.
A 269,416-byte real JPEG was opened and visually inspected as a coherent
printer interior. These prove read-only acquisition, not new calibration,
bed-quality/print-safety acceptance, mounted-phone UI, or live-video playback.
No printer controls, probing/calibration, live stream, or plugin reinstall
occurred. Commands and exact evidence boundaries are in `VALIDATION.md`.

Next review and merge this docs-only rollout record. Application bytes are
unchanged from the installed release, so do not redeploy for this record.
Queue work remains paused and isolated; minimal-progress design and
mounted-phone/live-video verification remain pending. Earlier failed-attempt
and pre-rollout instructions below are historical, not the next action.

## 2026-08-31 first PR34 shipping guard stop — resolved

The authorized shipping execution passed local validation, then stopped at
the merge-edge clean-tree guard. Bun compilation generated one hidden
`.bun-build` executable in the app directory (61,405,888 bytes, exactly the
pinned Bun bytes); tracked source remained unchanged. PR34 was not merged,
no installation/restart occurred, and verified PR33 remains deployed.
Decision 0028's bounded repair is to ignore only the app-directory compiler
scratch pattern while preserving every tracked/unrelated-untracked guard.
Keep the generated local copy out of Git and release assets; do not delete it
as part of the repair. Next validate the narrow ignore regression, obtain
independent approval for the new exact commit, and rerun the authorized
shipping workflow. Previous source validation does not by itself approve the
new revision or prove rollout completion.

## 2026-08-31 PR33 deployed; Bed Mesh and reusable shipping workflow next

The urgent already-merged PR33 rollout is complete at `7b9c4d4`, release
`20260831-7b9c4d4-widgets`: runtime 0.3.2/schema 6/observation-v4/camera-v5.
Both public and dashboard U1 services were explicitly restarted and verified
loaded/healthy with intact release fingerprints. Fourteen static route checks
and six public/private security checks pass. OAuth, environment, configuration,
routes and preserved plist fields are unchanged. This is service evidence,
not printer telemetry, camera streaming, or phone visual acceptance. A later
independent pass confirms both health contracts, thirteen exact static and
seven security checks, and a real 232,522-byte JPEG observed at
`2026-08-31T15:50:03.971Z`. Its coherent printer-interior image was visually
inspected. This separately verifies snapshot acquisition, not mounted-phone
or live-video behavior, and does not establish real Bed Mesh data.

Decision 0027's real Bed Mesh slice and decision 0028's repository operator
skill/script are implemented and software-validated. Passes: 165 app tests/
2,200 assertions, 21 lifecycle tests, 21 shipping tests, 24 independent focused
tests/228 assertions, nine actual widget captures, fifteen browser checks,
twenty-eight routes, and all three bundles/signatures/exact asset comparisons
and TypeScript. Seven independent shipping method checks and skill validation
also pass. Browser fixtures show no external requests or unintended
acquisition. The operator's separate read-only baseline passes both deployed
PR33 health contracts, fourteen static and sixteen security checks, with
private configuration preserved. Those baseline checks are not a new rollout.

Next obtain final independent approval of the exact committed candidate,
deliver the PR, and run the shipping workflow. The latter reuses
`u1_service.py` for validated merge, exact-build deployment, both-service
restart, verification and bounded rollback. The user's current explicit
authority includes that shipping sequence, but not printer control, plugin
reinstallation, or authentication/routing changes. Source target
0.3.3/schema 7/observation-v5 is not yet merged or deployed. Queue WIP is
paused in its separate checkout and must not be imported; unresolved minimal
progress design and mounted-phone/live-video behavior are not marked complete.

Current documentation scope adds ADR0027/0028, requirements and current
continuity updates; `.agents/skills/u1-ship` is repository-only and the operator
script/tests are implemented. Shipping script SHA-256 is
`49448de3ca32ba52917ec900d478901e2ec3590c887fa5cabddf4e67c9254978`.
Detailed actual commands, test scope and hashes belong in `VALIDATION.md`.
Earlier pending-delivery/live-0.3.1/no-
rollout-authority records below are historical and superseded by this entry.

## 2026-08-31 separate job widgets — current source handoff

Decision 0025 splits the Jobs presentation into independently callable Current
Job (`jobs`, existing private path) and Job History (`job_history`, new private
path). Each receives only its selected domain. History is explicitly unknown/
unimplemented with no observed history time or fabricated empty-list success;
this slice does not implement history acquisition. The directory now has nine
static links. Information remains above bottom-only actions.

Current source reports runtime `0.3.2`, schema `6`, observation-v4 with current
v3/v2/v1 aliases, unchanged camera-v5 and eleven readable resource URIs. Nine
observation enum values do not add tools: two model-visible and eight app-only
calls remain. Frozen legacy resources and media behavior stay unchanged.
Author checks pass 70 tests/1,596 assertions. Independent validation passes
148 app tests/2,011 assertions, 21 lifecycle tests, TypeScript, repository
checks, all three bundles/signatures, exact widget comparisons and offline
skill validation. Six actual browser captures, nine behavior cases and thirty
route checks pass across 320/390/720 light/dark fixtures, with zero external
requests, console/page errors and all seven acquisition counters at zero.
Independent code/visual review approves without findings; the reviewer passes
30 tests/1,085 assertions and inspects all six captures. Exact commands, hashes and evidence boundaries
belong in `VALIDATION.md`.

The runtime/test scope is the observation projections and rendering, exact
view/route/resource/version contracts, static directory, supporting regression
expectations and observation-skill routing. Documentation adds decision 0025,
requirements, architecture and continuity updates. No generic query, printer
write, history endpoint or independent refresh/normalization path is added.

Next deliver a new PR and merge the independently approved source under
the user's explicit merge-as-we-go instruction. PR32 already merged as
`47bfd37fdc0959d67ec5c717718899692b688310`, and PR31 records are merged as
`16169c0`; their older pending-delivery statements below are historical.
The live release remains `20260831-48a106d-widgets` at runtime `0.3.1`, schema
`5`, observation-v3/camera-v5. No rollout, plugin install, service restart,
auth/routing change, printer access or actual history integration is authorized
by this split. Source merge and simulated rendering are not deployed or
physical-printer acceptance. Unrelated canonical-checkout documents remain
untouched.

## 2026-08-31 information above, actions below — current source handoff

The user's latest principle supersedes earlier bottom observation-time and
bottom-left camera-status placement. Current source puts title/time/freshness
and failure information above content/actions; observation footers contain
only Refresh/Retry. Camera state/time/feedback form a top group, and
PiP/Fullscreen/Go Live/Close remain bottom right. Removed permission/source/
current-reading boilerplate stays absent. Layer math and camera JavaScript
remain unchanged; observation rendering and both HTML layouts change.

Current observation HTML SHA-256 is
`3fe2bb3460ddb8e75ddb19b363b396a859c64822601db9b2d6781b8cce6e4f2b`;
camera HTML SHA-256 is
`0a66e1cc0c75e6769655d60cf92bc50ba80b2fc98ebb2ca6f23559fd07e0a483`.
Author checks pass 59 tests/1,315 assertions. Independent validation passes
144 app tests/1,931 assertions, 21 lifecycle tests, TypeScript, repository
checks, all bundles/signatures, exact asset comparisons and ten captures.
Browser cases cover all eight observation headers/action footers, top refresh
failure through resize, actual bounded loading/retry recovery, and camera top
information with bottom controls at 320/390/720 without overlap. Independent
code and all-ten-capture visual review approve without findings; the reviewer
passes 71 tests/1,576 assertions. Next update existing PR32. This is not
deployed; prior merge/rollout authority does not carry forward. The earlier
handoffs below preserve their own evidence, not the current layout contract.
No new tool, plugin, service, auth/routing or printer action is included.

## 2026-08-31 camera-control grouping — previous PR32 source handoff

The existing open PR32 now has a source follow-up grouping PiP, fullscreen,
and Go Live/Close at the bottom right. Status/time stays left and wraps above
the intact 44-pixel controls when needed; rejection feedback uses the freed
top inset. Camera HTML and camera VM tests are the only new runtime/test paths;
camera JavaScript and the reviewed segmented-progress bytes remain unchanged.
Camera HTML SHA-256 is
`c7691461c0500370f01d5d2a40bd88229045a3e9d1ad4b5a4b9f468ab233c526`;
test SHA-256 is `4aab7ffc4134c4ff2d57b34313ba242a6c9411a9c3f03e075af30cc420508e5d`.
Author checks pass 39 tests/295 assertions. Independent validation passes
143 app tests/1,865 assertions, 21 lifecycle tests, TypeScript, repository
checks, all bundles/signatures and asset comparisons. Five browser captures
pass; code/visual review approves without findings and independently passes
51 tests/556 assertions. Reviewed 320-pixel wrapping preserves the full
timestamp and 44-pixel controls with 8-pixel gaps; wider views keep one row,
Live uses Close last, and rejection feedback stays clear above. Missing-time
and hidden-control geometry checks also pass. Next update the same PR32.
Neither this nor its segmented baseline is deployed. Schema/version labels,
services, plugins, auth/routes and printer state are untouched; prior PR30
rollout authorization does not carry forward. Source/browser fixtures do not
prove native phone PiP or real-printer behavior.

## 2026-08-31 segmented-layer progress — delivered PR32 source baseline

The user requested a segmented layer strip within the existing focused
progress card. Decision 0023's dated addendum records the bounded design:
24 blocks on narrow screens or 48 wide, one layer per block for small totals,
consecutive layer groups for large totals, proportional fill in the current
group, and a neutral unavailable track for invalid or missing layer values.
The large reported print percentage remains independent from layer position.
The quiet bottom observation/refresh footer and surrounding card are retained.

Runtime/test changes are limited to
`plugins/u1-print-studio/app/public/widget.html` and
`plugins/u1-print-studio/app/src/observation-widget.test.ts`. Their SHA-256s are
`974153b569af5ba4c9ec4e69454c91f62acd1f5cb0bb23fd0d993e36ea074dfb` and
`038438f1e4d8e781a31c7272c43a3beaf18e9b423d6158d396e79b8ce5b3b0ef`.
Design/continuity records are the decision-0023 addendum, this iteration's
BRIEF/HANDOFF/VALIDATION, PROJECT_STATE, and NEXT_AGENT. No camera, bridge,
MCP inventory, resource/schema/version, service, auth/routing or printer
behavior changes are included.

Author validation passes 19 executable VM tests/954 assertions. Independent
validation passes 142 app tests/1,849 assertions, 21 lifecycle tests,
TypeScript, repository checks, all three bundles/signature checks, exact
bundled observation-HTML comparison, and unchanged camera/frozen assets.
Twelve isolated rendered captures and eight browser behavior cases pass,
including differing percent/layer ratios, invalid/missing values, responsive
boundaries, pending/error resize, and narrow/wide fractional groups.
Independent code and scoped visual review approve with no blocking findings;
the reviewer independently passes 58 tests/1,441 assertions and inspects all
twelve captures, including both fractional-group views and the supplied
baseline comparison. This accepts the unchanged inner card layout, 14-pixel
bar position and footer, not pixel identity of outer screenshot crops/padding.
No acceptance is inferred from earlier PR30 evidence. Actual commands and hashes are in the newest
`VALIDATION.md` entry.

This independently reviewed source is delivered in PR32, now awaiting the
camera placement follow-up. It is not deployed: source and the installed baseline retain
runtime `0.3.1`, schema `5`, observation-v3/camera-v5, making exact source/asset
hashes essential. The previously authorized PR30 rollout is completed and its
records remain preserved below; its permission does not carry forward to a
new merge, installation, restart, plugin change, or printer acquisition.
Synthetic rendering does not prove deployed, mounted-phone, or physical-printer
behavior. No private artifacts or identifiers are committed.

## 2026-08-31 authorized PR30 service rollout — completed baseline handoff

The user explicitly authorized PR30 merge and deployment to the two existing
owner-supervised HTTP services. PR30 merged as
`48a106d2f17550bab8dc8648af1c7c247610a228`; the operator staged that clean
merged tree as release `20260831-48a106d-widgets`, dry-ran and installed the
pair successfully. Both services now report healthy runtime `0.3.1`, schema
`5`, observation-v3/camera-v5. HTTP bundle SHA-256 is
`71277c30c02f56efce570b2cabf9ea72c29d5810d873b4604b4b22bd6cc7aa31`,
matching the independently reviewed bundle.

The actual operator command forms below redact only private local arguments:

- `uv run --no-project scripts/u1_service.py stage --source <clean-merged-source> --bun <pinned-bun> --release 20260831-48a106d-widgets`
- `uv run --no-project scripts/u1_service.py install --release 20260831-48a106d-widgets --dry-run`
- `uv run --no-project scripts/u1_service.py install --release 20260831-48a106d-widgets`
- `uv run --no-project scripts/u1_service.py status`

All four passed from the clean merged source, without a state-root override.
Installation retained a recoverable prior-service snapshot;
its actual ID is kept in the private operator handoff, not Git. If recovery is
later authorized, use `uv run --no-project scripts/u1_service.py rollback
--snapshot <retained-install-snapshot-id>`. Rollback was not exercised during
this successful rollout. No personal-plugin reinstall, Mac login/power,
auth/route change, printer acquisition/control or new backend mapping occurred.

Independent post-install checks at 2026-08-31 14:02:22 UTC accept all four
local/HTTPS health contracts, both private directory roots with the exact
eight links, all eight focused static hosts and both current widget assets.
The public U1 backend rejects dashboard routes; public MCP remains 401,
public enrollment 404 and private enrollment health 200. The shared public
HTTPS origin's unrelated `text-to-cad` root fallback remains unchanged and
returns 200, not the U1 directory. Existing private env, OAuth, configuration,
Serve/Funnel routes and access boundaries are preserved.

The validator also opened only the deployed static directory in isolated
Chrome at 390/light and 720/dark. Both captures passed without overflow,
subrequests or console/page errors; no focused widget, camera, iframe or tool
was loaded. This accepts deployed navigation, not mounted iPhone hydration,
phone fullscreen/PiP, camera transport, printer telemetry or user outcome.
The merged-source gate remains 135 app tests/1,006 assertions plus 21
lifecycle tests; actual validator commands and hashes are in `VALIDATION.md`.

This rollout follow-up changes only `PROJECT_STATE.md`, `NEXT_AGENT.md`, and
the active iteration's `BRIEF.md`, `HANDOFF.md`, and `VALIDATION.md`. Runtime
source remains the merged tree. The canonical checkout's unrelated dirty docs
remain untouched. Personal plugin `0.2.0+codex.20260831033612` is still its
separate PR28 installation with observation-v2/camera-v4; HTTP deployment does
not update its executable or a retained host process.

Next deliver these rollout records through a docs-only PR, then obtain the
user's actual directory/focused-widget feedback. Do not repeat deployment or
silently reinstall the plugin. Queue, fans, bed mesh, cavity, material/color,
history and other missing mappings remain unimplemented or unknown; overview
remains deferred. Actual phone/PiP and printer checks need their own evidence.

The entries below preserve earlier source and rollout gates chronologically;
their pending delivery statements are superseded by this current handoff.

## 2026-08-31 private widget directory — source handoff

Decision 0024 implements the user's requested navigation entry point, not the
deferred composed overview. Source GETs for `/dashboard` and `/dashboard/`
return identical static HTML with exactly eight existing focused links and
truthful implementation labels. It does not acquire observations, mount
iframes, poll, or open camera media. Focused URLs, public rejection, MCP tools,
current widgets, and frozen compatibility bytes remain unchanged.

Changed runtime/test paths are `app/public/dashboard-index.html`,
`app/src/status-dashboard.ts`, and `app/src/status-dashboard.test.ts` under
`plugins/u1-print-studio`. The page is a Bun text import, so its bytes are
inlined into the HTTP bundle without changing the lifecycle tool's mandatory
external asset inventory or invalidating old rollback releases. Packaging and
architecture docs explain that choice; decision/requirements/BRIEF records
describe the product contract. Canonical checkout's unrelated changes remain
untouched.

Author verification ran `bun --no-env-file --config=/dev/null test
src/status-dashboard.test.ts` (12 passed, 261 assertions) and
`bun --no-env-file --config=/dev/null run check` (passed). These are software
and synthetic local-HTTP evidence, not deployed or physical-printer evidence.
Independent validation passes 135 app tests/1,006 assertions, 21 lifecycle
tests, TypeScript, repository checks, all bundles/signing, six directory
captures, 20 route checks and 12 keyboard checks with zero acquisition.
The copied HTTP bundle serves both roots with exact source HTML and all eight
focused static paths without an external index file. Independent code/visual
review inspected all six captures and reran 62 tests/651 assertions with no
findings. Its scoped visual disposition is in `design-qa.md`; actual validation
commands and artifact fingerprints are in `VALIDATION.md`.

The directory source and validated evidence are included in this PR30 follow-up.
Next obtain separate merge/rollout authorization, then confirm the actual user
view. No merge/deployment/plugin install, service restart, auth/Tailscale
changes, or real-printer access occurred. Local rendered navigation is not
deployed or actual phone acceptance.

## 2026-08-31 authorized headless follow-up — source handoff

After draft PR30 source delivery, the user explicitly authorized isolated
headless-browser validation because the supported browser was unavailable.
The validator exercised the exact current assets with synthetic observations
and media. Its final pass captured 67 observation and 22 camera states,
passed 13 camera behavior checks plus three keyboard/unavailable checks,
and found no final horizontal overflow or console errors. Native headless
fullscreen passed; synthetic live-clock behavior is not real printer video
or actual ChatGPT/iPhone PiP support. The independent visual disposition is
recorded in `design-qa.md`.

Independent screenshot review found three bounded P2 presentation defects,
now repaired: active thermal readings were low-contrast yellow; small warning
text lacked light-theme contrast; and Jobs exposed the internal `known` enum
and normalization jargon. The fixes preserve yellow accents, render readings
with ink, use contrasting light/dark warning colors, and label the current
job/history availability in plain language. They do not add a history,
queue, fan, mesh, cavity, or filament mapping. Runtime changes are limited to
`public/widget.html`, with eight extra contract assertions in `app.test.ts`.

Final current observation SHA-256:
`86cf5f4a4e6e29f8aa99cb14c947d20992b7b022c91c75f08642eea0a09837d0`.
Camera remains unchanged:
`05634036e524693a2c9f9c0f817629968326175a22b98be85d3c28c484ee5e85`.
The validator reports 134 app tests/939 assertions, 21 lifecycle tests,
TypeScript, repository contract, all three bundles and signature validation
passing on these bytes. Exact commands and evidence boundaries remain in
`VALIDATION.md`; screenshots and temporary fixture artifacts are not committed.

The initial implementation/source-only review is delivered in draft PR30 at
`db4e250`, followed by delivery-record commit `41c4715`. The bounded follow-up
source and evidence are committed and pushed as `643b5dd` through the existing
draft PR30. Independent
formal review approves the follow-up with no new findings and scoped visual
QA passes. The reviewer independently checked the 39-test/337-assertion
targeted suite, 67 observation/22 camera captures, 13 camera plus three
keyboard/unavailable behavior checks, 91 manifest hashes, and final screenshots.
The remote branch and open draft PR head matched `643b5dd` at the source
delivery check. Next obtain separate authorization for merge/rollout and
actual mounted-phone validation. Merge,
installation, services, routes/auth, and printer access were not authorized
by headless validation and are unchanged; separately scope rollout and actual
mounted mobile acceptance afterward.

Existing private focused URLs still serve deployed runtime 0.3.0. The
`/dashboard` redirect selects progress rather than the deferred composed
overview. A static 200 is only route evidence, not successful live mapping or
proof the polished assets are deployed. No private hostname is retained.

## 2026-08-31 quiet widget presentation — source handoff

Decision 0023 is the current execution order, refining the user's selected
Instrument Strips after mounted phone feedback. Source-only changes remove
visible read-only and duplicate observation chrome. Non-camera cards retain
their title/content and one bottom timestamp/refresh footer with exceptional
stale/offline/unknown and failed-refresh feedback. Camera is the image surface
with snapshot/fallback/live time overlay, Go Live/Close, and feature-detected
fullscreen/PiP. No network path or FPS appears in normal chrome.

The observation bridge now awaits a versioned initialize request, handles
complete initial and late result envelopes (including empty-output and warm
metadata-only cases), rejects foreign-parent messages, and terminates missing
or malformed loading with retry/reopen feedback. Independent VM fixtures
reproduced the baseline failures. They do not establish the exact iPhone host
failure cause. Real progress, physical heads, extruder/bed temperatures, and
limited current-job fields remain mapped. Queue/fans/bed-mesh/history/cavity/
material/color mappings remain unimplemented or unknown. Their shells do not
prove working capabilities; decorative thermal traces and gray mesh cells
were removed and unmapped cards say `Not implemented yet`.

Snapshot time propagates the JPEG's successful server receipt time and is
committed only after image decode; failed or out-of-order images cannot
retimestamp retained imagery. Live time advances only on rendered callbacks
or advancing decoded-frame counts and falls back after five seconds without
frame evidence. Late ICE diagnostics cannot relabel closed/fallback media.
These clocks are not camera-sensor capture time. Host-granted modes, including
PiP coercion to fullscreen, are reflected without optimistic state changes;
unsupported controls are absent and rejection leaves the camera open.

Current source reports runtime `0.3.1`, schema `5`, observation-v3/camera-v5.
Observation-v2/v1 and camera-v4 remain current-asset aliases. The frozen
status-v4/v3 and camera-v3/v2/v1 bytes are unchanged; ten resource URIs and
exactly two model-visible/eight app-only tools preserve compatibility.

Changed implementation scope is the four current HTML widget/host files,
`app.ts`, runtime contract, camera-frame timestamp forwarding, executable
camera/observation widget regressions, and related contract expectations.
Documentation scope is decision 0023/index, requirements, architecture,
packaging, `design-qa.md`, this iteration and project continuity records.
The canonical checkout's pre-existing dirty files were not touched.

Independent validation reports TypeScript, 134 app tests/931 assertions, 21
lifecycle fixtures, repository contract, all three bundles, and ad-hoc
signature checks passing. Exact commands and hashes are in `VALIDATION.md`.
The test tiers are static/software plus synthetic host/frame/protocol evidence.
No new live printer, service, plugin installation, OAuth, Tailscale, or Mac
login/power mutation occurred. The prior deployed release remains runtime
0.3.0/observation-v2/camera-v4. User screenshots accept only prior rendering,
not the current changes.

The available browser inventory is empty, so rendered viewport/layout,
fullscreen/PiP, and iPhone acceptance remain blocked and explicit in
`design-qa.md`. Source commit `db4e250` is pushed and delivered in
[draft PR30](https://github.com/scottchu/orca-slicer-mcp/pull/30).
Independent formal review approves source-only with no unresolved findings,
including a separate targeted 59-test/415-assertion rerun and verification of
the final widget fingerprints. Source delivery is complete. Next obtain an
authorized visual-validation path before treating the redesign as accepted,
then separately scope rollout. Do not deploy or implement missing backend domains as an implicit
extension. Historical persistence delivery below must not be repeated.

## 2026-08-30 persistence integration — historical handoff

The user explicitly authorized PR28 merge and persistent installed/server
delivery, while deferring Mac automatic login and power. Integration reconciles
PR27's standalone-camera fail-closed routing/full-host-reload instructions with
decision 0021's two-visible/eight-app-only focused surface. The canonical
checkout has unrelated dirty documentation and is preserved; integration work
occurs in a separate worktree.

Decision 0022 accepts reuse of the exact two existing owner LaunchAgents,
versioned bundled HTTP code/assets plus a release-local pinned Bun copy, preserved env/OAuth/routes,
fixed private focused routes defaulting to progress, and one observation store
per HTTP process. It adds no MCP Admin, root daemon, printer control, shared
cross-process storage, or background media. Existing logging is retained;
automatic rotation remains deferred.

Design/docs scope: decision 0022/index, requirements, packaging, active
brief/validation/handoff, project state, and next-agent record. Code scope is
HTTP/store injection, dashboard host/routes, and allowlisted local service
packaging/lifecycle tooling with fixtures. The combined pre-persistence baseline
passed TypeScript and 105 tests with 606 assertions. Pre-rollout source acceptance
passes TypeScript, 110 app tests with 759 assertions, 19 lifecycle fixture tests,
the repository contract, stdio/runtime/HTTP bundles, signature verification,
plugin/skill validation, and whitespace checks. Independent final review
approved the source with no blocking findings. PR28 then merged as
`2160492a4ce63d1409673786ea02b253d7cfaace`. The personal plugin installed as
`0.2.0+codex.20260831033612`, and the existing HTTP services were staged and
installed from that app revision. Runtime source/stage/cache SHA-256 is
`c4029f18678e1839c0b005e37bc7401bf84bcc6ed7ef3d19155286253c2f018b`;
all production HTML/five skills match. Independent installed MCP checks
verified the two-visible/eight-app-only surface and eight resource hashes.

Initial install readiness succeeded, but the first independent restart exposed
an asynchronous `launchctl bootout` race: public bootstrap was skipped while
the departing label still appeared loaded, and public readiness failed. An
explicit public start recovered it. The CLI now waits at most 30 seconds for
that exact label to disappear before a replacement start. Two regressions
raise lifecycle coverage to 21 tests; the original implementation fails the
delayed-removal regression. Independent code review approved the repair.
This script-only repair leaves the deployed app revision above unchanged.

Independent post-repair `restart` then replaced both processes and recovered
exact health contracts. A dashboard-only `SIGTERM` test recovered automatically
through KeepAlive without CLI start and without disturbing public service.
Final status reports both loaded/healthy/integrity-verified. Ten static paths
match the release, `/dashboard` redirects to progress, and public/private
rejections remain intact. Env/OAuth/config/routing hashes and preserved plist
fields are unchanged. Separately bounded progress/thermals reads shared one
observation version/source time; the printer was reachable, cavity remained
unknown, and one valid snapshot returned without activation, video, or control.
The final repository gate passes 110 app tests/759 assertions and 21 lifecycle
tests with independent approval. Exact commands and limits are in `VALIDATION.md`.

The implemented operator is `scripts/u1_service.py` with
`stage --source ABS --bun ABS --release ID`, `install --release ID --dry-run`,
`install --release ID`, `status`, `start|stop|restart --service
all|public|dashboard`, and `rollback --snapshot ID`, always through `uv run
--no-project`. The default root is `~/Library/Application Support/U1 Print
Studio/service`. Releases copy `bin/bun`, bundle `dist/server.js`, retain six
exact `public/` HTML assets plus emitted build assets, and contain an empty
bunfig and version/hash manifest. Source must be clean and committed. Explicit
private env and plist fields remain preserved; ambient dotenv/bunfig is
disabled and relative effective auth/config paths are rejected before stops.
Install returns a recoverable snapshot ID and restores exact prior plists and
loaded states on failure, or explicitly reports incomplete recovery.

Cold `current()` retains its existing initial acquisition behavior. After that
first demand, plain reads are cache-only; explicit due refreshes coalesce across
requests of one process. Constructing the handler, reading health, or fetching
static host/widget HTML performs no printer acquisition. `/dashboard` redirects
to progress; seven exact focused paths exist, camera remains separate, and
unknown/overview HTTP paths return 404. MCP overview remains explicitly deferred.

Next: review the repaired CLI plus completed rollout records, and deliver that small
follow-up through a pull request. Do not open a live widget as a hidden health check: initialization
can acquire a printer observation. Browser control is currently unavailable;
mounted visual, mobile, reboot/login/sleep, and user-outcome gates
remain distinct and unaccepted.
After the follow-up merges, fully reload the host for user visual acceptance
of the focused widgets, then scope remaining unknown live mappings.

The following entries are chronological historical evidence, not current
installation/version assertions or additional authorization.

## 2026-08-27 mounted-app recovery rollout

Pull request 20 merged the compatibility-resource repair as `4d4ea2f`.
Personal Marketplace version `0.2.0+codex.20260827215815` is installed from a
validated standalone arm64 executable. The exact installed-cache MCP smoke
listed and read identical v4 and v3 widget resources, retained exactly four
model-visible plus three app-only read-only tools, observed the configured
printer, obtained a JPEG and camera offer, and explicitly closed the session.
The prior personal source remains recoverable from Trash.

The public service was restarted after merge. Existing authenticated OAuth MCP
calls still return fresh status and JPEG metadata; public health is 200,
unauthenticated MCP is 401, public enrollment is 404, and private enrollment
health is 200. No OAuth replacement was required.

The private 8444 dashboard 502 was a separate process-supervision failure, not
an MCP, printer, or camera failure. A dedicated owner LaunchAgent now supervises
the loopback dashboard listener. Its first start exposed a missing Tailscale CLI
directory in the restricted `PATH`; that was repaired and re-bootstrapped.
Both the local listener and private HTTPS dashboard now return 200. A live
dashboard bridge smoke produced a 981-byte SDP offer with one ICE server and
then closed the bounded session. Existing Tailscale public, private, and
unrelated handlers were preserved.

The remaining acceptance gate is visual, not server-side: no browser-control
surface was connected, so visible playback, FPS, UI-triggered Close, PiP,
fullscreen, and mounted Codex/ChatGPT behavior are not accepted. Use a fresh
task after plugin upgrade, then reload the private dashboard and invoke Go Live
once. Keep snapshot and signaling evidence separate from visible playback
evidence.

## 2026-08-27 mounted-app recovery follow-up

The screenshots exposed three independent states: an old Codex task retained a
pre-upgrade local MCP snapshot, the registered remote connection requested the
old `status-v3.html` URI, and the optional private `:8444` dashboard had no
process listening behind its Serve route. The current installed standalone
binary exists, has a valid ad-hoc signature, resolves from the plugin-root cwd,
and starts from a clean environment; no machine-specific absolute command was
added.

At the pre-merge source stage, branch `scottchu/fix-u1-app-loading` kept current
descriptors on `status-v4.html` and registered `status-v3.html` as a
compatibility resource serving the exact same self-contained widget and empty
external CSP. Packaging and app documentation now require a new task after
installation or upgrade and explain that the standalone dashboard is
separately supervised. The monitor skill now describes the actual MCP Apps
signaling bridge rather than a stale relay-URL path.

TypeScript, 61 tests with 329 assertions, both bundles, compiled-resource smoke,
signature verification, plugin validation, both touched skill validators, and
whitespace checks pass. No printer command, control tool, live route change,
OAuth mutation, or mounted-host success is claimed by this source validation.

## 2026-08-27 secure remote Monitor handoff

The user changed execution order to the secure remote U1 Print Studio Monitor
slice. Decision 0017 is accepted for this slice and preserves decision 0016's
local-first normal-user direction. Source now keeps standard-HTTPS public OAuth
and Streamable HTTP MCP while moving passkey enrollment to a distinct
loopback-only listener intended for a tailnet-only Tailscale Serve origin.

The public runtime retains exactly four model-visible read-only tools and three
app-only read-only helpers. Public enrollment always rejects. A configured
private enrollment origin requires a distinct loopback port and stays healthy
after an existing credential suppresses enrollment. ICE defaults empty;
explicit STUN is available from HTTP env or the standalone owner-only config,
and robust remote use prefers per-session RFC5766 TURN REST credentials derived
from a server-only secret.

Implementation paths include `camera-ice-config.ts`, OAuth/server enrollment
composition, schema-2 local configuration and CLI setup, WebRTC offer handoff,
tests, decision/requirements/architecture records, packaging/app documentation,
and the mobile setup skill. Exact validation is in `VALIDATION.md`: TypeScript,
60 tests with 324 assertions, source and standalone bundles, offline standalone
STUN-preservation smoke, skill/plugin validation, repository checks, code
signature verification, and whitespace checks pass.

No live service, LaunchAgent, Tailscale route, OAuth state, installed plugin,
printer, or external service was changed. Public-edge, private Serve, TURN,
printer, mounted ChatGPT/Codex, and user-outcome evidence remain unclaimed.

The next action requires coordinator approval and external TURN provisioning.
Before deployment, capture the existing Serve/Funnel and LaunchAgent state,
choose an unused private Serve HTTPS port plus distinct loopback enrollment
port, and obtain TURN REST-compatible URLs/shared secret. Stage the executable
and owner config without replacing OAuth state. Restart only the exact U1
service; verify both loopback listeners first. Preserve every public handler,
keep public `/auth` mapped to the rejecting backend, add only the new private
Serve handler with Funnel disabled, and compare routing with the saved state.
Then verify public discovery/401/enrollment rejection, private health/enrollment
state, exact four-plus-three authenticated inventory, explicit STUN if chosen,
a real TURN allocation, and mounted playback separately in ChatGPT and Codex.
Rollback restores the prior runtime/env and removes only the newly added private
Serve handler. Do not deploy, merge, publish, or claim host success from this
handoff alone.

## 2026-08-26 local-first rollout handoff

The user changed the execution order to the local-first open-source U1 Print
Studio rollout. Decision 0016 is accepted and partially supersedes decision
0015: the hosted MCP App now carries offer, answer, ICE candidates, and close
through the MCP Apps `tools/call` bridge. The widget contains no direct
`fetch(` call and declares empty external CSP domains. The exact HTTP signaling
adapter remains only for the standalone developer dashboard.

Delivery is pull request https://github.com/scottchu/orca-slicer-mcp/pull/15
on branch `scottchu/local-first-rollout`.

The smallest end-to-end desktop-local slice is implemented:

- `u1-print-studio setup`, `doctor`, and `mcp` form one onboarding/runtime
  contract for future Marketplace, Homebrew, and npm adapters;
- setup writes a `0600` versioned config and accepts only private, link-local,
  loopback, or `.local` printer origins without credentials or proxy paths;
- the connector invokes fixed read-only status, snapshot, and WebRTC signaling
  operations through the U1 Printer Operations adapter;
- the application service owns opaque sessions, peer-ID hiding, bounded offer,
  answer, per-call and cumulative ICE candidates, concurrency, expiry, abort,
  failure teardown, and idempotent close;
- snapshot fallback, read-only annotations, and the 1200 by 1500 PNG contract
  remain intact;
- `.mcp.release.json` starts a staged standalone executable without Bun or an
  env file, while `.mcp.json` remains the source developer adapter;
- `PACKAGING.md` records one setup/doctor path, current macOS arm64 evidence,
  and the unimplemented signing, notarization, cross-platform, update, and
  rollback gates.

The runtime contains exactly four model-visible read-only tools and three
app-only read-only signaling helpers as listed in `PROJECT_STATE.md`. It adds no
upload, start, pause, resume, cancel, G-code, generic proxy, Control, or Admin
tool.

Changed implementation paths are under `plugins/u1-print-studio/app/`, plus
the plugin release manifest, packaging contract, architecture/requirements,
decision 0016, and continuity records. See the branch diff for the exact set.

Validation is local-only. Forty-nine tests with 275 assertions currently pass,
the standalone macOS arm64 runtime runs without Bun, and offline setup/doctor
smoke passed without hardware access. Exact final commands and repository
checks are recorded in `VALIDATION.md`.

Independent pre-merge review also verified that rewriting an existing config
tightens its permissions to `0600` and that a valid camera signaling session ID
is retained before stream-envelope validation so malformed responses still
take the bounded close path.

No physical printer, installed plugin, marketplace, OAuth state, package
registry, Homebrew tap, or hosted service was accessed or changed. Earlier
printer, Funnel, OAuth, and installed-plugin entries below are historical
evidence, not instructions for the normal-user path.

That boundary applies to the pre-merge rollout. After merge, the user explicitly
authorized a same-machine personal Marketplace install and read-only test.
Version `0.2.0+codex.20260827152101` installed with the staged standalone
runtime; live doctor reached the configured printer, and installed-cache MCP
smoke verified status, snapshot, WebRTC offer, and explicit close without any
printer control. Mounted Codex host rendering remains unverified because the
current task cannot hot-reload a reinstalled plugin.

Unresolved risks are production signing/notarization, cross-platform artifacts,
channel installation/upgrade/rollback, the platform-`curl` dependency, and
fresh mounted-host WebRTC rendering. The private repository also has no license
file, so owner license selection and third-party notice review block any claim
or publication of an open-source distribution. Real-host or printer testing
requires new explicit authorization and must remain a separate evidence layer.

The next smallest action after review is either a reproducible unpublished
signed macOS packaging fixture or removal of the platform-`curl` runtime
dependency, selected from current evidence. Do not return to Tailscale/OAuth as
the normal path and do not publish or contact hardware.

## Historical iteration handoff

## Current status

The product contract remains one product with two peer subsystems: Orca
Preparation and Printer Operations. A redacted LAN Fluidd/Moonraker target,
read-only status, WebSocket transport, snapshots, and H264 WebRTC have been
observed for
Printer Operations. Upstream OrcaSlicer `2.4.2` and Snapmaker Orca `2.3.5`
were inspected locally. A later user-authorized Snapmaker U1 pilot sliced two
parts and completed a PETG print after substantial CLI debugging. Two later PLA
jobs also reached telemetry-verified completion. The repo-local plugin contains
four thin workflow skills and a read-only MCP Apps status-view prototype. No
preparation, control, or persistent-monitor runtime exists, and Snapmaker Orca
is not yet an accepted product backend. The remote read-only prototype now adds
a bounded WebRTC camera presentation through an application service; MCP,
exact signaling HTTP, and the printer adapter remain separate layers. An opt-in
status dashboard now mounts the exact production widget and emulates only its
read-only bridge calls on loopback port 8788. Private Tailscale Serve HTTPS
exposes it to the tailnet on port 8444; it is not a public dashboard or
real-host rendering evidence.

## Completed work

- independent product and architecture agents audited the old single-boundary
  framing;
- decision 0003 supersedes decision 0001 while preserving its history;
- authoritative records are aligned to the peer-subsystem model;
- repository contract, shell syntax, whitespace, link, and terminology checks
  pass;
- independent product and architecture reviewers passed the repaired contract;
- decisions 0004 through 0006 separate API surfaces, keep MCP replaceable, and
  define hybrid snapshot-plus-subscription monitoring;
- the ontology and monitoring model define runtime-neutral ports, freshness,
  connection epochs, and a possible later Elixir monitor daemon;
- read-only Moonraker status, temperature, object, auth, webcam, and WebSocket
  evidence is recorded without issuing a command or G-code;
- repository contract, shell syntax, whitespace, Markdown links, and current
  terminology checks pass after reconciliation onto `ba18104`.
- hosted repository validation was removed; required checks run locally before
  delivery.
- the current execution order moved to Orca Preparation discovery after the
  user's redirect; this does not make Printer Operations secondary;
- `docs/orca-preparation-findings.md` records executable fingerprints, CLI and
  macOS limitations, profile precedence, Snapmaker boundaries, collaborative
  preview, and manual-support representations;
- requirements now bind visual review to exact backend and artifact revisions
  and distinguish support settings, enforcer or blocker volumes, facet paint,
  and designed breakaway geometry.
- `docs/logs/2026-08-23-snapmaker-orca-u1-petg-print-pilot.md` preserves the
  later pilot chronology, crash exits, recovered `T2` mapping, artifact hash,
  and distinct upload/start/observed-completion evidence;
- `docs/knowledge/snapmaker-orca-cli-preparation.md` now incorporates only the
  repeatable lessons from the PETG pilot and two PLA repetitions.
- `docs/logs/2026-08-25-snapmaker-u1-pla-print-repetitions.md` records two PLA
  jobs, including object-level wall overrides, physical-to-logical tool
  mapping, bed-type loss, direct-3MF coordinate failure, and adaptive end-of-job
  monitoring. Both reached telemetry-verified completion; the first was
  physically accepted and the second awaits handling.
- decision 0007 and `plugins/u1-print-studio/` implement the user's revised
  order as three thin skills plus a concise Markdown status fallback;
- decision 0008 and
  `docs/logs/2026-08-25-u1-status-view-prototype.md` record the later explicit
  request for a read-only HTML status view before a shared CLI;
- the plugin now includes an MCP Apps server with `show_u1_status` and
  `get_u1_status`, a camera-first HTML/CSS widget, adaptive refresh, WebRTC
  `Go Live` and `Close`, PiP, and fullscreen. TypeScript, HTTP MCP, stdio MCP,
  current telemetry, and widget resource metadata passed local validation.
- the render tool now advertises both the standard MCP Apps resource URI and
  the OpenAI compatibility output template on its descriptor. Four integration
  and widget-contract tests pass, and the refreshed installed bundle plus both
  camera endpoints passed read-only smoke checks.
- decision 0009 replaces direct private-LAN media loading with a self-contained
  widget and read-only `get_u1_camera_frame` relay. Ten tests with 52
  assertions pass, and a bundled stdio smoke returned a valid real JPEG data
  URL after bounded retry.
- the same widget now has dynamic mobile viewport sizing, iOS safe-area support,
  44-pixel touch targets, compact breakpoints, and host intrinsic-height
  notification. Cross-device MCP connectivity and actual iOS rendering remain
  separate evidence.
- the cache-busted installed plugin
  `0.2.0+codex.20260825142747` passed descriptor, resource, current status, and
  real relayed-camera stdio smoke checks; the installed frame was a valid
  148,142-byte JPEG data URL kept in widget-private metadata.
- a later mounted card reported offline even though read-only probes from the
  laptop reached the configured private-LAN Moonraker status and webcam routes.
  The current thread exposed only the two older tools, identifying a stale
  in-thread MCP process rather than a current LAN outage;
- one real snapshot took 12.9 seconds, so the relay now uses bounded 20-second
  and 10-second attempts under a 40-second MCP tool budget. Twelve tests with
  54 assertions enforce the updated contract;
- the synchronized personal-marketplace source and exact installed cache
  `0.2.0+codex.20260825144906` passed validation. Its stdio smoke listed all
  three tools, returned reachable `complete` telemetry, and relayed a valid
  149,695-byte JPEG in private metadata.
- decision 0010 adds a personal-developer mobile boundary: the HTTP MCP service
  binds loopback and personal OAuth protects the single `u1.monitor` scope with
  authorization code, PKCE, dynamic-registration allowlisting, audience-bound
  tokens, and a user-verified passkey. Moonraker remains private.
- decision 0011 records the observed ChatGPT failure against an otherwise
  healthy `:8443` Funnel endpoint and moves the personal connection to standard
  HTTPS. Exact U1 paths route to loopback while the existing root service stays
  intact. It also keeps self-hosted versus hosted production distribution open.
- the intended iPhone passkey was enrolled and its one-time enrollment file was
  removed. Public health and OAuth metadata return successfully, while an
  unauthenticated public MCP request returns HTTP 401 with the expected
  protected-resource challenge.
- before decision 0014, after the user completed the corrected standard-port
  connection, the host exposed exactly the then-current three read-only tools
  and an authenticated
  `show_u1_status` call returned fresh `complete` telemetry at 100% (188/188),
  with inactive fully consumed storage, no exception, parked tools, and zero
  heater targets. Phone layout and relayed-camera rendering remain visual
  checks rather than inferred outcomes.
- decision 0012 adds a portable 1200 by 1500 PNG status projection to remote
  `show_u1_status` results for Codex hosts that do not mount MCP Apps
  components. It uses the same normalized observation as the widget, exposes
  no URL or control, and at that stage left local stdio plus remote refresh
  data-only. Decision 0014 later supersedes the local exclusion. A
  live complete observation was rendered and visually inspected locally;
  Codex-mobile display remains a user-visible check.
- after the first phone rendering was visually accepted, the user asked for a
  slightly larger presentation. The fallback now uses a portrait 2-by-2 metric
  layout and larger pixel type so the host can devote more vertical space to it
  on a phone without changing the data or safety contract.
- decision 0013 records why that previously working connection later failed:
  its 15-minute access token expired and the personal authorization server had
  issued no refresh token. Public health, OAuth discovery, and the MCP challenge
  remained healthy, isolating the failure to renewal rather than Funnel, MCP,
  or printer reachability.
- the authorization server now issues 30-day rotating refresh tokens bound to
  the client, exact MCP resource, and `u1.monitor` scope, persists only derived
  lookup hashes, rejects sequential and concurrent replay, and cannot expand
  scope. Version-1 state migrated in place while preserving the signing key,
  registered clients, and enrolled passkey; an owner-only dated backup was made
  outside the repository before the service restart.
- the repaired public endpoint advertises both `authorization_code` and
  `refresh_token`, continues to return the expected unauthenticated HTTP 401 MCP
  challenge, and at that stage exposed no additional tools or printer controls.
  The plugin was
  reinstalled as `0.2.0+codex.20260825234015`. Existing pre-repair host links
  must reconnect once. The user confirmed the repaired connection works
  immediately; successful host renewal after more than 15 minutes remains
  pending user-visible evidence.
- `docs/u1-print-studio-plugin-architecture.md` maps the current package,
  transports, OAuth boundary, observation adapter, presenters, MCP fields, and
  read-only runtime slice to the stable domain ontology. It explicitly records
  that the prototype still calls its observation adapter directly rather than
  implementing the planned application use case and persistent monitor ports.
- an earlier synchronized and installed plugin was
  `0.2.0+codex.20260825211428`. Its repository, personal-source, and installed
  bundles share SHA-256
  `6dfa78e49bbf81775ca3e62bd518f7399fff1a2c494583aae4032cc5f3e9c49d`;
  an installed-cache stdio smoke preserved the then-current three-tool
  inventory and text-only local render result.
- the plugin now includes `u1-mobile-status-setup`, which discovers each user's
  Tailscale MagicDNS hostname, preserves unrelated Funnel handlers, guides
  phone passkey enrollment and desktop Developer mode, verifies the exact
  four-tool remote read-only inventory, and keeps all control actions out of
  setup.
- decision 0015 supersedes the serial-JPEG live transport from decision 0014.
  The application service still owns one-time tickets, leases, concurrency,
  and duration; `u1-status` now performs allowlisted WebRTC signaling; the HTTP
  adapter serves only exact `POST`/`DELETE /media/camera.webrtc`; and H264 media
  flows through the browser peer connection.
- the remote HTTP MCP surface conditionally adds
  `open_u1_camera_stream`. Its one-time URL exists only in result `_meta`; the
  widget calls it once per `Go Live` intent and retains the old snapshot loop
  only as fallback. Local stdio remains a three-tool surface because it has no HTTPS
  media endpoint.
- the concurrent local PNG contract is preserved: every `show_u1_status` result
  carries the 1200 by 1500 PNG, while `get_u1_status` stays data-only.
- 29 tests with 144 assertions pass. The repository, synchronized personal
  source, and installed cache validate at
  `0.2.0+codex.20260826005742`; their stdio bundle hashes match.
- the live personal service now runs from the synchronized plugin source with
  OAuth state preserved. The exact `/media` Funnel handler was added without
  changing the unrelated root or existing OAuth/MCP handlers. Public missing
  ticket and unknown-path checks return 401 and 404 respectively.
- a bounded real-printer relay observation delivered two complete validated
  JPEGs over one multipart response in a final 2.6-second run. This proves the source,
  application iteration, and adapter path together, not mounted desktop or iOS
  rendering.
- the current branch passes 35 tests with 174 assertions after adding the
  status dashboard. `bun run dashboard` serves it on loopback, while
  `bun run dashboard:tailscale` derives a validated private MagicDNS HTTPS
  origin for the existing Serve listener. The normal service returns 404 for
  `/dashboard`, the dashboard service returns 404 for `/mcp`, and port 8444
  must never be Funnel-enabled.
- a real-printer smoke through private Tailscale Serve HTTPS on port 8444
  returned reachable status with camera available and delivered two multipart
  JPEG parts over the one-time relay in 1.42 seconds. No image was saved, and
  the unavailable in-app browser means visual layout quality remains
  unverified.
- the latest widget refinement replaces visible live, close, and automatic
  refresh labels with accessible icon controls, adds an icon camera-state
  indicator, keeps the grid above snapshot and continuous imagery, and gives
  camera, status/progress, each metric, and freshness independent skeleton
  states. Source, TypeScript, plugin, loopback, and private-HTTPS checks pass;
  no connected browser was available for visual inspection.
- the camera indicator is now deliberately neutral: its state dot, slash,
  pulse, and state-dependent colors are gone. The lower descriptive camera
  caption is replaced by a bottom-right mode chip for timestamped `Snapshot`,
  `Snapshot fallback`, or `Live` with the configured `up to 15 FPS` ceiling.
  Thirty-six tests with 185 assertions, TypeScript, bundling, plugin validation,
  the repository contract, and the currently served private widget source pass.
  Browser visual inspection is still pending because no browser runtime was
  connected.
- the card now uses the user-selected Snapmaker U1 palette: charcoal and warm
  white surfaces, yellow identity accents, orange paused or attention states,
  and red faults. The existing layout and read-only behavior are unchanged.
  Thirty-seven tests with 192 assertions, TypeScript, bundling, plugin
  validation, the repository contract, and private HTTPS source checks pass.
  `design-qa.md` remains blocked because no browser-rendered implementation
  screenshot was available for comparison with the supplied reference.
- the camera overlay now places presentation status on the left and the
  live/close icon on the right. Snapshot and snapshot-fallback states show a
  red disconnected-camera icon; live shows a pulsing green dot. Live FPS is no
  longer copied from the configured ceiling: the widget parses relayed JPEG
  frames and reports the observed presentation rate over a rolling five-second
  window. The exact one-time relay smoke delivered four frames at about 1.4 FPS.
  The official Snapmaker U1 stylesheet established the identity tokens
  (`#1c1e20`, `#1f1f1f`, `#242424`, `#ffcd00`, `#ff5f28`, and warm whites),
  while green and red remain separate semantic colors. Thirty-eight tests with
  207 assertions, TypeScript, bundling, and inline widget parsing pass; final
  plugin and repository checks are recorded in `VALIDATION.md`.

## Changed paths

See the branch diff. Repository guidance, Orca discovery, environment, scope,
architecture, roadmap, requirements, open questions, continuity records, the
read-only plugin runtime, and active iteration evidence are in scope. No user
model, private profile, generated G-code, printer address, or printer command is
included.

## Unresolved risks

- the first product Orca backend is unselected; one Snapmaker Orca path worked,
  but repeatability, synthetic fixtures, GUI parity, support round-trip,
  estimates, and deterministic behavior remain untested;
- the pilot printer is a Snapmaker U1; remaining environment details are
  unknown;
- no reusable profile resolver, crash preflight, manifest generator, or G-code
  semantic validator exists;
- the observed `wipe_tower_filament` exit `139` and incomplete-filament tool
  collapse have not yet been reproduced with clean non-user negative fixtures;
- the current LAN client is trusted by Moonraker, so product authorization and
  network boundaries remain unresolved;
- WebSocket transport works, but object subscription, reconnect, and freshness
  behavior remain unverified;
- camera reliability, lighting, and final lowered-bed visibility remain
  environment-dependent despite one usable in-progress PLA frame;
- no connected browser was available for this run, so host-rendered snapshot,
  relayed preview, close behavior, PiP, fullscreen, and adaptive refresh are
  unverified;
- the same conversation could not hot-reload the refreshed plugin metadata and
  exposed `show_u1_status` only through a programmatic wrapper, which returned
  text but did not mount the MCP App. A new conversation remains required for
  direct component validation;
- Bun and Node direct local-network sockets failed on this macOS host while the
  bounded system-curl adapter worked; portability remains unknown;
- the local stdio plugin is desktop-local. The selected personal Funnel and
  OAuth backend now supports rotating refresh tokens, and the remote result
  carries an inline image fallback. The repaired connection now works
  immediately, but a successful status call after more than 15 minutes remains
  required to prove host renewal. Interactive camera rendering remains
  separately unverified visual evidence;
- the snapshot endpoint was intermittently slow. One bounded retry recovered a
  packaged real-frame smoke, and one later frame took 12.9 seconds. The longer
  bounded relay now passes installed-cache transport checks, but repeated
  live-preview reliability is not yet host-validated. A provisional 3+3-second
  continuous-source budget failed to produce the two-frame proof and was
  replaced by the established 20+10-second bounded policy;
- the current Codex conversation retains a stale pre-reinstall three-tool MCP
  surface. It cannot prove the newly deployed remote four-tool inventory or
  mounted continuous relay; use a fresh thread and keep iOS visual evidence
  separate;
- manifest shape, compatibility checks, and upload/start ownership are open;
- multiple physical jobs completed, but product implementation, repeatable workflow,
  protocol, safety, and general user-outcome acceptance remain pending.
- the latest PLA job is telemetry-complete, but its output has not been handled
  and the final lowered-bed camera frame did not show the parts.

### Actual WebRTC live transport

- The old multipart snapshot loop and exact `/media/camera.mjpeg` route are
  removed from the live path. Snapshot acquisition remains only for explicit
  snapshot mode and degraded fallback.
- The widget now uses a receive-only browser `RTCPeerConnection`, a real
  `<video autoplay muted playsinline>` surface, printer keepalive responses,
  offer/answer/ICE signaling, and actual browser-presented frame counting.
- The live dashboard returned a private-ID-free H264 offer through the exact
  one-time signaling route. A separate decoder reached `connected` and received
  frames over the persistent peer connection; samples varied from 0.2 to 24.8
  FPS and therefore do not establish native-browser FPS.
- The protected service and private dashboard were restarted from synchronized
  source. Public old-MJPEG returned 404, invalid WebRTC ticket returned 401,
  and the private dashboard returned 200.
- TypeScript, 38 tests with 222 assertions, bundle, plugin validation,
  repository checks, and diff whitespace validation passed. Mounted browser
  playback remains the user-visible acceptance gate because no browser-control
  connection was available.
- The automatic-refresh button no longer renders a separate dot; enabled and
  paused behavior and accessible labels are unchanged.

## Secure remote deployment — 2026-08-27

Pull request 18 merged as `e298885`. Personal Marketplace version
`0.2.0+codex.20260827202019` is installed with a source/stage/cache runtime hash
recorded in `VALIDATION.md`. The owner config is schema 2 and `0600` with one
explicit STUN URL. OAuth state was preserved across reload.

The public service is standard HTTPS and authenticated; health is 200, public
enrollment is 404, and unauthenticated MCP is 401. A separate loopback
enrollment listener is exposed only through tailnet Serve 8447. Its health is
200 and its MCP, OAuth-token, media, widget, and enrolled-state enrollment
routes are 404. Funnel remains enabled only on 443 and all prior handlers were
preserved.

The exact installed runtime verified four model-visible plus three app-only
read-only tools, reachable status, a 124,642-byte JPEG observation, H264 offer,
one configured ICE server, and explicit session close. The printer offer still
contained only host candidates. No browser surface was connected and no TURN
service was supplied, so mounted playback and robust arbitrary-network media
remain open evidence gates.

## Next smallest action

Start a fresh authenticated Codex or ChatGPT task so it loads the cache-busted
plugin. Invoke `open_printer_camera`, verify the camera-only resource mounts,
then record snapshot, Go Live, continuous rendering, Close, and fallback if
exercised. Test mobile separately. If host-only ICE fails, provision an
owner-approved TURN REST service and verify a real relay allocation before
retrying. Do not expose Moonraker or add printer controls.

## Camera-only presentation source slice — 2026-08-28

Decision 0018 separates user intent from transport. The model-visible
presentation tool is now `open_printer_camera`; it reads one snapshot and links
`ui://u1-print-studio/camera-v1.html` without allocating a WebRTC session.
`open_u1_camera_stream` moved to app-only visibility beside answer, ICE, and
close, leaving exactly four model-visible and four app-only read-only tools.

The new camera-only resource reuses the current status widget camera section
markup exactly. It retains the same 16:9 surface, grid overlay, loading
skeleton, camera icon, mode pill, icon-only Go Live/Close controls, snapshot,
live FPS, and fallback presentation without the printer status/progress body.
The exact same HTML is mounted by the explicitly composed
`/dashboard/camera` host; ordinary server mode returns 404 for both focused
routes.

Independent review found that the first implementation treated `ontrack` as
rendering success. The accepted implementation gates Live on the first browser-
rendered video frame. Playback rejection, eight seconds without a first frame,
track termination, stall, video error, connection failure, or prolonged
disconnect closes the bounded session and activates the 1500 ms snapshot
fallback. Review also found and resolved one stale three-helper statement.

Source validation passes with 69 Bun tests and 398 assertions, TypeScript,
plugin/skill validation, runtime bundle, ad-hoc signature verification,
repository contract, and whitespace checks. A private loopback source
dashboard then obtained a real snapshot, rendered live video at an observed
23 FPS, and returned to snapshot after Close. This proves the private test host
and real-printer read-only path on this machine only.

### Post-merge installation and deployed private test

Pull request 22 merged as `333bebe`. Personal Marketplace version
`0.2.0+codex.20260828194545` was release-staged and installed. Source, personal
stage, and installed runtime SHA-256 were
`b7c0151f01faaddf57aba04f884819ebef92c3254cdae74a09c7c88416af5be1`.
The replaced personal source remains recoverable from Trash at
`u1-print-studio-personal-source-20260828T195024Z`.

The exact installed-cache MCP client listed four model-visible and four
app-only tools, listed `camera-v1.html`, and read its 29,785-byte embedded
camera resource. Canonical `main` fast-forwarded to the merge, and the existing
public and private dashboard LaunchAgents restarted from the merged source.
Public health, private `/dashboard/camera`, and private `/camera-widget`
returned 200. The Tailscale Serve/Funnel configuration hash was identical
before and after restart.

The deployed private dashboard displayed a real snapshot, reached an actually
rendered `Live · 25 FPS`, and returned to snapshot after Close. The in-app
browser remains open on that private test page for user inspection. Mounted
Codex/ChatGPT playback still requires a fresh task; fallback under an actual
failure, mobile playback, and a real TURN allocation remain open.

## 2026-08-28 camera workflow repair source handoff

Decision 0019 addresses the stale-descriptor and leaked-lease failure observed
across ChatGPT, Codex, and the optional public/private services. The current
source exposes three model-visible read-only tools, with
`open_printer_camera` as the only camera action. `get_u1_camera_frame` and the
four signaling calls are app-only widget helpers.

Go Live now obtains one widget-private, one-time activation from the frame
helper and must consume it when opening the WebRTC session. An empty, replayed,
expired, or fabricated stream call fails before printer signaling or lease
allocation. A successfully opened offer that is not answered within 15 seconds
aborts and releases its lease automatically. Answered sessions retain bounded
duration, failure teardown, and explicit idempotent Close.

The focused resource is now `camera-v2.html`; `camera-v1.html` remains a
compatibility alias serving the exact current asset. `/health` and standalone
`doctor --json` expose runtime 0.2.0, tool schema 3, and camera widget v2 so a
rollout can distinguish process liveness from version coherence.

Static/software validation passes with TypeScript, 71 Bun tests and 417
assertions, both bundles, ad-hoc signature verification, plugin validation,
both touched skill validators, the repository contract, and whitespace checks.
No live service, OAuth state, Tailscale route, installed plugin, printer, or
mounted host was changed during this source gate. Delivery and each later
evidence layer must be recorded separately.

## Camera workflow repair post-merge rollout

Pull request 24 merged as `62acd4c`. The exact merge commit rebuilt the
standalone runtime and release-staged Personal Marketplace version
`0.2.0+codex.20260828211031`. Source, personal stage, and installed cache share
SHA-256
`74f5f654de2a52c21a33577ffd6520f1054eb71439668885986114177faa2398`.
The prior personal source is recoverable from Trash at
`u1-print-studio-personal-source-20260828T211017Z`.

Offline installed doctor reports runtime 0.2.0, tool schema 3, camera widget
v2, explicit STUN, fixed read-only operations, and disabled external widget
fetch. The exact installed MCP client listed three model-visible tools and five
app-only helpers, listed status v4/v3 plus camera v2/v1, rejected the stale
empty stream call without allocation, obtained a real 135,547-byte JPEG,
opened one bounded offer with one ICE server through a current activation, and
explicitly closed it.

The existing public and private dashboard LaunchAgents restarted from merged
source. Public and loopback dashboard health both report schema 3/camera-v2.
Public enrollment is 404, unauthenticated MCP is 401, private dashboard camera
and widget are 200, and private enrollment health is 200. OAuth state SHA-256
remained
`91072185057645f9fa776714b354638b2e4e5855ef48553c1dcaf5244c5a7df0`;
Tailscale Serve/Funnel status remained
`7dac599f0a80ff45802a7812dda5b67ac2042bc9f66121d18968a83c15d5eebe`.

The deployed private in-app browser showed a real Snapshot, passed the actual
rendered-frame gate at `Live · 24 FPS`, and returned to Snapshot after Close.
Mounted Codex/ChatGPT and mobile still require fresh tasks and are not inferred
from private-dashboard success. No printer control or route/auth mutation ran.

## Restart instructions

Follow `NEXT_AGENT.md` and decisions 0003 through 0020. Do not infer that one
subsystem is secondary from the current execution order, and do not implement
or issue consequential actions before F0 discovery establishes the relevant
contracts.

## Decision 0020 camera fan-out source handoff — 2026-08-28

The current feature worktree implements decision 0020 without changing the
installed plugin or any live process. `open_printer_camera` now links the
camera-v3 camera-only resource, marks repeated presentation intent as
non-idempotent, and returns a fresh opaque presentation ID. Camera v2 and v1
remain readable aliases. The full status render tool explicitly excludes
camera-only requests.

The runtime terminates one H264 printer WebRTC peer privately with bundled
pure-TypeScript `werift` and fans cloned encoded RTP packets into dedicated
downstream tracks. Each viewer receives a server-owned offer, separately issued
ICE credentials, discovered Tailscale host candidates, a 15-second answer
deadline, bounded lease/candidate budgets, and independent Close. Viewer count
defaults to 16 and is bounded from 1 through 64 by
`U1_CAMERA_MAX_VIEWERS`. The last viewer releases the only printer upstream.
The optional exact HTTP adapter accepts only a branded server-terminated fan-out
store and cannot be wired to the old direct printer session implementation.

Public status and camera envelopes use closed state/error/capability
vocabularies. JPEG APP0-APP15, COM, and trailing metadata are removed. Sentinel
tests exclude printer host/IP/MAC/device identity, Moonraker/camera routes,
upstream SDP/candidates/peer IDs/tickets/credentials, and raw upstream errors
from MCP and HTTP results. Visible widget diagnostics show only ICE mode,
candidate types/protocol, and allowlisted fallback reasons.

Final finisher review also replaced the remaining public status/frame object
spreads with exact field projections, so newly added or unexpected adapter
fields fail closed instead of silently entering MCP or dashboard results.
Current architecture, packaging, app, project-state, and restart records now
describe connector-terminated media and distinct upstream/viewer credentials
consistently. All four plugin skills and the plugin package validate.

A user screenshot of the still-deployed decision-0019 direct private path
showed Snapshot, a misleading immediate Fallback label during about three
seconds of ordinary ICE negotiation, and then rendered `Live · 28 FPS`. Both
source widgets now keep the retained snapshot in `Connecting` until the first
rendered frame and enter Fallback only after a terminal failure or timeout. The
screenshot is direct-path evidence only; neither it nor this source-only UI fix
accepts the new fan-out runtime.

Local static/software and simulated-protocol checks are recorded in
`VALIDATION.md`. No real printer, live service, installed plugin, OAuth state,
Tailscale route, mounted ChatGPT/Codex host, mobile viewer, or TURN allocation
was changed or accepted. The next delivery step is independent review and a
pull request from the validated branch commits; post-merge
install/restart requires fresh authorization.

## Decision 0020 independent media-core repair — 2026-08-29

Independent review blocked the first fan-out commit on four concrete media
core gaps. The follow-up keeps the same privacy and product boundary while:

- subscribing every downstream sender's picture-loss indication to one shared
  upstream receiver PLI bridge, coalesced and rate-limited to 500 ms;
- choosing the exact H264 fmtp by the first received RTP payload type and
  rejecting duplicate or unsupported mappings;
- binding every viewer reservation to an explicit live upstream generation and
  rejecting upstream/viewer termination during awaited opening or insertion;
- making track and first-RTP waits cancellable, with timers and event listeners
  removed on invalid SDP, signaling failure, success, timeout, or close.

Concrete werift adapter tests use two H264 payload types with the second one
received, two viewer PLI sources, and deferred termination/failure fixtures.
The final full suite and repository validators are recorded in
`VALIDATION.md`. No live deployment, service, route, OAuth state, installed
plugin, printer, mobile client, or TURN endpoint was contacted or changed.

Targeted re-review then found one remaining concrete-adapter race: a werift
peer could already be terminal before `onTerminated` registration and emit no
later event. The adapter now subscribes first, synchronously inspects current
connection state, invokes termination at most once, and returns an idempotent
unsubscriber. Actual-factory regressions cover an already-failed upstream and
an already-closed viewer; neither is published and both clean up fully.

## Decision 0021 composable observation design handoff — 2026-08-29

The user selected the Instrument Strips direction for the first shared
human-agent observation feedback loop. The target is a family of focused
720-pixel read-only widgets, not a giant machine map. Camera is a separate
focused strip in the same visual language. The current large overview is
retained for compatibility during construction and is composed from accepted
focused modules only after all of them exist.

Decision 0021 supersedes the exact current presentation inventory. The target
model-visible surface is exactly `observe_printer`, requiring one closed view
from `overview`, `progress`, `thermals`, `heads`, `jobs`, `queue`, `fans`, or
`bed_mesh`, plus `open_printer_camera`. Refresh and camera implementation calls
stay app-only. `show_u1_status` and `get_u1_status` leave model visibility at
the schema cutover; retained-task aliases may exist only as bounded app-only
compatibility paths.

Every non-camera view is a pure projection of one normalized current
observation with source time, freshness, connection epoch, session identity,
provenance, capability evidence, and domain values. A focused widget does not
query Moonraker or own polling, merging, or freshness. Camera keeps its own
acquisition time and the decision-0019/0020 activation, fan-out, retry, fallback,
and Close behavior.

The first implementation gate is the shared projection contract plus
`progress`, `thermals`, and `heads`, using already normalized fields. Cavity,
fans/purifier, filament material/color and sensors, jobs/history, queue, and bed
mesh require separate read-only adapter evidence before known values are shown.
Missing or conflicting data renders `Unavailable`, `Unknown`, `Stale`, or
`Offline`, never numeric zero or optimistic provenance.

Changed design/planning paths are decision 0021, its index, working
requirements, this active brief/handoff/validation set, `PROJECT_STATE.md`, and
`NEXT_AGENT.md`. No app code, skill, live printer, installed plugin, service,
OAuth state, or Tailscale route was changed by the design slice.

## Decision 0021 focused observation implementation handoff — 2026-08-30

The final source surface has exactly two model-visible read-only presentation
intents: `observe_printer` with required closed view `overview`, `progress`,
`thermals`, `heads`, `jobs`, `queue`, `fans`, or `bed_mesh`; and
`open_printer_camera`. Exactly eight implementation calls are app-only:
`refresh_printer_observation`, legacy `show_u1_status`/`get_u1_status`, and the
five frame/open/answer/ICE/close camera helpers. `$u1-observe-printer` is the
single procedural observation skill.

One shared in-process store owns the current normalized observation. Plain
presentation reads are cache-only; an explicit due refresh is the only upstream
read, concurrent refreshes coalesce, and failed/offline refreshes retain the last
reachable values as stale with their original source time and connection epoch.
Each request projects only its selected module. Progress, thermals, heads, and
the separate camera strip have accepted focused fixture presentations. Jobs is
limited to currently normalized state. Cavity, filament material/color and
sensors, jobs history, queue, fans/purifier, and bed mesh remain explicit
unknown/unavailable pending live read-only mapping evidence. Overview remains
deferred until every focused module is accepted.

The source contract is runtime `0.3.0`, schema `5`, `observation-v2`, and
`camera-v4`. `observation-v1` is a current-asset alias. Retained tasks receive
frozen status v4/v3 bytes (57,450 bytes, SHA-256
`da9625f5832a4df4e34312999326d241299ed6de9bd4073a60d699d4478db437`)
and camera v3/v2/v1 bytes (33,725 bytes, SHA-256
`c8ef35062ae004ac571501ed99f2810465aa0e12cddbe965918b84d30b476203`).
The current observation and camera assets hash to
`128975091b192369a83476f5d8664da494d4d4fa968ef5e7fc29fe730fd51d3f`
and `2cc7c28f7d692ff7880bfc5cd400d2032b05765ce1bb142ea5dac205c349bc8b`.

Final local validation passes TypeScript, 101 tests with 594 assertions, both
bundles, ad-hoc standalone signature verification, plugin/skill validation, the
repository contract, and whitespace checks. Browser fixture review at a narrow
inline viewport accepted Progress, Thermals, Heads, and Camera. This is
static/software and fixture-only evidence. No live printer, installation,
service, OAuth state, Tailscale route, mounted host, or user-outcome gate was
contacted or accepted. Next deliver the source through independent review and a
pull request; live mapping, overview composition, fresh-task mounting, and the
user's ten-second comprehension gate remain separate later work.
## Standalone camera routing regression source handoff — 2026-08-29

Pull request 26 merged decision 0020 as `4f9041c`, and Personal Marketplace
version `0.2.0+codex.20260830013924` was installed with both existing services
on schema 4/camera-v3. The first user attempt then created a new conversation
inside a Codex Desktop process that predated the reinstall. That process did
not expose `open_printer_camera`; the model selected `u1-monitor-print` and
substituted `show_u1_status`, so the whole status card mounted.

This branch applies the smallest source repair without changing camera-v3 or
the live runtime. Standalone camera requests in both monitor and mobile-setup
guidance must call only `open_printer_camera`. If the tool or resource is
unavailable, the guidance reports a stale/unavailable MCP connection, asks for
a plugin reload or full host relaunch, and stops. It explicitly prohibits
status, frame, or stream-helper substitution. Packaging now records that a new
conversation alone did not replace the retained desktop MCP process.

The plugin manifest uses the already-supported `interface.defaultPrompt`
field, keeps the supported maximum of three entries, and puts `Open my printer
camera.` first. Mobile setup now consistently reports the three model-visible
plus five app-only inventory. A focused Bun contract locks routing, fail-closed
behavior, inventory, starter prompts, and full-host reload guidance.

Changed paths are limited to the two procedural skills, plugin manifest,
packaging guidance, the focused contract test, and current continuity/
iteration records. TypeScript, 93 tests with 569 assertions, both bundles,
standalone signature verification, plugin validation, and both touched skill
validators pass. No printer, installed plugin, service, OAuth state, Tailscale
route, or mounted host was contacted or changed.

The exact-tree repository contract and whitespace check also pass. An
independent code and documentation reviewer reviewed exact commit
`4045f352729720d51d46ad8aa308c7e84c47d33a`, reran TypeScript, 93 tests with
569 assertions, both bundles, standalone signature verification, plugin and
both skill validators, the repository contract, and the whitespace check, then
returned **APPROVE** with no findings.

Next: deliver this approved non-main branch through a pull request. Do not
reinstall or restart without fresh rollout authorization. After rollout, fully
quit and relaunch Codex Desktop before invoking `open_printer_camera`; reject
any status-card substitution. Independent source approval does not accept the
mounted host or live camera. Real multi-viewer, mobile, and TURN acceptance
remain separate gates.
