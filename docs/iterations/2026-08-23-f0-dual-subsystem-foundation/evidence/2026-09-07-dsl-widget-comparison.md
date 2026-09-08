# Existing widgets and closed DSL comparison — 2026-09-07

## Scope and identity

The user explicitly started the comparison in the isolated
`codex/u1-dsl-widget-comparison` worktree, checkpoint
`ae80ecc76e95c5a7c37b478419b7d5c4ccc3e535`. The checkpoint was clean on takeover;
the transferred spacing/type changes are committed WIP, not accepted product
bytes. No application source or tracked generated resource is changed by this
comparison. Decision0056 stays provisional. PR115/runtime0.4.15 remains the
recorded deployed baseline; local0.4.16/observation22/Camera18/private revision7
are unpublished.

This is a synthetic comparison of current source-derived Heads and Thermals
resources with the existing Smart T1 DSL composition. It does not establish
complete Heads/Thermals parity, production registration, real-printer behavior,
mounted-host/device acceptance or user acceptance. Styling and release are
deferred until the comparison is reported.

## Author commands and packaging findings

The capture author read the required current records and inspected the maintained
resource builders, host bridge, synthetic fixtures and closed DSL composer.
The private `COMMANDS.md` records the actual command sequence and failures;
`manifest.json` binds tracked input files, fixture bytes, author harness and
generated artifacts. These are local evidence, deliberately not committed.

- A task-owned dependency symlink reused the existing dependency installation.
  The initial `bun --no-env-file --config=/dev/null run verify:mcp-composable-lab`
  failed because generated `.svelte-kit/tsconfig.json` was absent.
- `bun --no-env-file --config=/dev/null x svelte-kit sync` generated the local
  metadata. Repeating the scoped composable check built 3,680 modules, then
  failed `Composable experiment resource differs from source`.
- `bun --no-env-file --config=/dev/null run verify:live-heads` and
  `bun --no-env-file --config=/dev/null run verify:live-thermals` passed.
  Their source-derived HTML exactly equals tracked HTML. These are packaging
  checks, not full behavioral acceptance.
- `bun --no-env-file --config=/dev/null run test-results/dsl-widget-comparison/generate.ts`
  produced ignored comparison resources with the original builders' exact
  HTML wrappers; it did not overwrite tracked files. Shell searches used the
  explicitly requested Homebrew `rg`. The capture author needed no Python
  command; the separate design role used `uv run --no-project` for its saved
  context preflight and metric summaries.

| Resource | Tracked SHA-256 | Source-derived SHA-256 |
| --- | --- | --- |
| Heads | `0fb29f9e6e9afcf963f2886d7eedf71d153b3aaeffeb6751fe8bc962ccaa84b4` | same |
| Thermals | `121c068270e3a5b3cc1bc863ad66872a1b50796828af748a15d9eb8f0071231b` | same |
| DSL v2 | `9070b2c3d8e8fc15617b456a30f5dd9241f49d38d020d2c9c868b67784a9d5e9` | `c0d82f9e889c3c1f0c39866b40edae4239bfb0a74285be4c98470623c9a73c61` |

The DSL mismatch is an explicit outstanding packaging finding. Screenshots use
the source-derived DSL bytes; earlier tests and tracked HTML cannot accept them.
Do not silently carry tracked-resource or prior-release acceptance forward.

## Matched data and safety boundary

The single synthetic fixture uses source time `2026-09-07T12:00:00.000Z` and
receipt time `2026-09-07T12:00:00.250Z`. T1 ready values are activity `active`,
actual/target `214.6/220` Celsius and configured RGB `#E89B3C`. Heads' opaque
RGBA `#E89B3CFF` has the same color, not a fabricated DSL alpha capability.
Ready/unknown results retain available receipts; unknown sets overlapping
activity, thermal and color values to missing. The error case makes all three
DSL sources unavailable and returns acquisition failure to each existing widget.
This compares global failure with global failure, not partial failure with a
whole-widget error. Other production rows remain contextual reference content.

Heads' `Heating` and Thermals' heater-state details remain their truthful source
projections; the DSL activity leaf does not reproduce those separate values.
DSL FanRelation is intentionally shown as DSL-only: reported relation/role is
neither production fan percentage/RPM nor Heads/Thermals overlap. Unsupported
content includes T2–T4, bed/cavity temperatures, material/vendor/subtype, filament
presence, configured alpha, Copy, Refresh/Retry controls and production receipts.
The DSL's status enum and thermal bounds also differ from production contracts.

Every panel uses the same iframe width and root text setting. Normal root text
is 16px; 200% is root32px for every resource, not browser zoom. Conditions are
ready390/100%, ready720/100%, ready320/100%, ready390/200%, ready320/200%,
unknown390/100% and error390/100%. This is a bounded representative matrix;
the existing extreme-decimal narrow-screen limitation remains open.

The author served one immutable loopback-only allowlist of preloaded, hashed
HTML. Its process imports only filesystem/hash/HTTP libraries; composition and
fixture generation finish before hosting. No production entrypoint, live
observation, camera, auth or printer adapter is started. Query variants,
unlisted routes/methods, CONNECT and Upgrade are denied. CSP forbids connections.
Only synthetic host messages provide opening results. An initial author host
omitted Heads/Thermals opening result delivery and displayed Loading; the host
was corrected and those initial views are not accepted ready evidence.

The served manifest is
`1c00e97c65924d9577e4d47166b14974740e12b9046acb65e9c7b8627ddbf100`.
The final manifest adds fixture input and author harness identities:
`bf5351856ec4475c9144a7d76a25f175c7fe631b9bc300e3cf819c5f72b33afb`.
The served page/resource/fixture bytes are identical across this metadata tail;
both exact manifest files are retained locally. Fixture SHA-256 is
`ca74c5e03648430f2e7438bce548c69c32e9cd417b6229f54e6a997bf5a2a72a`.

## Role-separated evidence

The capture author owns fixture/build/immutable hosting. The UI/UX designer owns
browser screenshots and screenshot-first findings. A separate non-author owns
independent source/contract review followed by targeted runtime verification;
these are reported separately and do not repeat unaffected full suites.
The coordinator integrates these reports and remains available to the user.

The UI/UX reviewer accepted seven browser boards. Every board shows complete
Heads and Thermals reference widgets beside the source-derived Smart T1
composition. Local `gallery.html` links the unchanged PNGs and per-case DOM
metrics; it works offline after the fixture server stops. Logical screenshot
identities (not committed generated artifacts):

| Screenshot | SHA-256 |
| --- | --- |
| `01-ready-390-100.png` | `da5c00599dc8dc74792601c36fcd2e7a34f7d7bf8a93d6b1ac91238e6de32dbd` |
| `02-ready-390-200.png` | `4bcbc3e8eb0652af99843f78605c349bd756afdb101e696d78fe95b526dabf08` |
| `03-ready-320-100.png` | `2947a7ee8d9f9321db1373f0473a214a4856b3af5cceb9b35d545a3a2d4c204a` |
| `04-ready-320-200.png` | `d87c6dc3ba1db43e10b6918b5ff8e87209b6f391cd428dad51f947a387c3db7c` |
| `05-unknown-390-100.png` | `cc21de53f4f6d182ae324d023dd7c71c325916f4c42cf3d296750fde947eb0a2` |
| `06-error-390-100.png` | `7cffa5182c3b0e660cf27165fb3e2e0cdd20d99257818f73c648e4ac4eaf17fe` |
| `07-ready-720-100.png` | `c72d4521015aa6e695fd6dd8d267b97c8a9c37ef64d2fe2f5207f1981ca7063f` |

Independent `comparison_verify` source review approved the exact generator,
server, fixture mappings and source-derived wrapper within this comparison
boundary. `source-audit.mjs` checked398 enumerated input hashes,10 artifact
hashes, fixture hash and exact wrapper/inline guards without rebuilding.
This does not attest installed dependency package content beyond lock/package
inputs and author build provenance.

Its separate fresh runtime verification ran `runtime-verify.mjs`,
`badge-verify.mjs` and `fixture-verify.mjs`:10 actual HTTP hashes matched;
9 rejection probes passed; all3 frames across7 pages matched configured
viewport widths and16/32px roots;28 browser requests stayed on the loopback
origin, with no page errors or outside-origin attempts. All sampled frames
settled without aria-busy and without horizontal document overflow. Fresh
fixture checks matched raw T1 values, normalized color, evidence and receipts.
Reviewer-owned browsers closed in `finally`; sockets ended. No full regression
or duplicate build ran.

The reviewer's first runtime assertion incorrectly expected literal214.6 in
every renderer. Heads/Thermals actually round the shared raw214.6 to215°;
DSL preserves214.6°. That failed assumption is retained in the private
`runtime-first-assumption-failure.json`. Correcting the assertion required no
artifact/source change. It is a presentation finding, not unequal input.

## Findings and smallest next repair

1. **Unknown status wraps at ordinary390px/100%.** Independent DOM Range
   checks place `Unkno` and `wn` on separate lines. Active header frame is
   88x44px; Unknown is88x58px. Card height changes from258.640625px to
   272.640625px, a14px increase against the outer-frame <=1px contract.
   This is an open WIP defect, not an accepted geometry exception.
2. **Same data does not mean the same visible precision.** Heads/Thermals show
   215° for the raw214.6°C while DSL shows214.6°. Their label and state
   projections also differ; the comparison preserves them rather than making
   fixtures or grouping imitate each other.
3. **The sampled text doubles under the matched root preference.** The recorded
   ready390 metrics show Heads'13px readings become26px, Thermals'20px actual
   becomes40px, and DSL's20px values/13px labels become40px/26px. Every frame
   changes from root16px to32px. These measurements support the sampled text
   enlargement; this remains a root-font preference, not browser zoom.
4. **The information hierarchy differs.** At390px/100%, Heads actual, target
   and color are13px/400; Thermals actual is20px/620 and target13px/400.
   Smart's temperature, color and fan values are all20px/620, with13px/400
   labels. Equalizing Smart's values therefore does not reproduce Thermals'
   actual/target emphasis. This is a design choice to discuss, not authority
   for a global font change.
5. **Smart's visible line-box gaps and alignment are consistent here.** The
   design reviewer measured4px label-to-value and8px value-to-next-label gaps
   for both adjacent readings at390px/100%, with all content left edges at57px.
   These are DOM line-box bounds, not pixel-level glyph ink gaps. Smart keeps
   temperature/color/fan in three ordered rows. Heads changes from two tool
   columns at390/100% to one at320 or enlarged text; Thermals uses two columns
   at720px. Those different information groups were not modified for resemblance.

The smallest next repair is closed-vocabulary status badge readability and
stable structural reserve across ready/unknown/error at supported widths/text
settings. The source's5.5rem badge frame, horizontal padding and word wrapping
are the bounded area to investigate. Do not insert evidence-like hidden reserve
text, change global typography, add DSL capability or reorder groups as part of
that scope. The source/package mismatch must be addressed with the affected
build checks when a real candidate is prepared. No styling repair, release or
hardware action was performed by this comparison.

Loading, retained refresh, partial source failure, age-stale receipts, other DSL
variants, clipboard/Retry interactions and extreme-decimal narrow screens are
outside these seven cases. Earlier evidence stays bound to its own bytes.

## Record tail and resource teardown

Only this evidence record, PROJECT_STATE.md, NEXT_AGENT.md and the active
BRIEF/HANDOFF/VALIDATION records changed. Requirements and decision0056 remain
unchanged. Local evidence retains the author command log, served/final
manifests, seven original screenshots and metrics, design report and separate
independent source/runtime reports. Files copied into the local gallery retain
their original SHA-256. Generated artifacts and machine-local paths are not
committed.

After both reviewers finished, the capture author stopped only the task-owned
comparison server with Ctrl-C; it exited0 and its shutdown log confirms close.
`lsof -nP -iTCP:4196 -sTCP:LISTEN` found no listener. The author checked the
task-created dependency path was a symlink and removed only that link with
`unlink`; the shared dependency installation was not modified. The designer
reset its viewport and closed its task-owned browser tab; the verifier closed
its own browser processes and sockets. No user session or other worktree was
cleaned up. The offline gallery remains inspectable without a running server.

The next action is to review these completed comparison results and the already
bounded badge repair scope with the user. Implementation has not started. No
pending capture, record update or automatic release is carried forward from
this completed comparison.

Independent documentation-tail verification by `comparison_verify` passed on
the corrected report bytes:398 application/build/fixture inputs unchanged,
39 relative documentation links valid,7 original screenshot hashes matching,
and only the6 intended durable documents changed. Requirements, decision0056
and tracked generated application assets are unchanged. The reviewer checked
the corrected root-scale description against actual metrics and confirmed that
the old new-conversation pending instruction is removed. Its local
`docs-tail-verification.md` has SHA-256
`a30a10aad2d9f9087cf6d68e96fde8f249333c184ebc7cdc6a6096a0e53e5c79`;
this paragraph records that completed verification once. No unaffected build,
full browser suite or release was repeated for this documentation-only tail.
