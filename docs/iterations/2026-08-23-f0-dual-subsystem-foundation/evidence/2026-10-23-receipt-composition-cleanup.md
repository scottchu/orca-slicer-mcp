# Receipt composition cleanup

## Intent, baseline and accepted scope

The user prioritizes code and design cleanup after adopting foundations,
primitives, small composed values, domain components, widgets and pages.
This supersedes the earlier preservation-first execution order for this task.
F0 / UI-003, F02 shared composition, F04 boundaries and open U01 consistency
are affected; no milestone or unfinished Queue/Fans/History feature is closed.

Source baseline is main `d13a52d5ec3599a0728214b611bb6cd2654e02de`.
The expected result is one receipt composition owner with unchanged visible
copy, placement, loading anatomy and independent source times. Source inspection
found repeated Caption/ObservedMeta/state/reason composition in the Fans header,
Heads Materials row and Thermals Cavity row, beside the existing DomainReceipt
used by Queue, Current Job, History and Bed Mesh.

The coordinator accepted the bounded receipt-only implementation. DomainReceipt
remains in the observation domain: it composes generic Caption and ObservedMeta
presentation, while callers supply domain evidence. Its optional state preserves
absence; groupedTime defaults true; includeNotRequestedReason defaults false;
fallbackState is closed to `not_reported`. The fallback is shown only when no
explicit non-known/non-stale state is shown. These named options preserve
existing consumer policies without accepting arbitrary markup or merging
independently timed sources. Existing consumers retain their defaults.

## Source inventory and consumer boundary

| Layer / source | Concrete finding and disposition |
| --- | --- |
| Foundations / common tokens and host styles | Already own shared dimensions; unchanged |
| Primitives / 60 common Svelte components | Existing design system, not an empty foundation; unchanged |
| Small values / DegreeValue, MetricValue, DurationValue, Timestamp, DateTimeValue | Different numeric, precision, missing-value and accessibility contracts; unchanged |
| Domain / ActualTarget | Shared by Thermals and Heads; Cavity target applicability remains a separate unresolved visual/semantic adoption |
| Domain / ObservedMeta, DomainReceipt | Consolidate repeated receipt composition; preserve all timestamps and slot widths |
| Widgets / LiveObservationRoot, HeadsPanel, LiveThermalsRoot | Migrate only repeated receipt markup, with no reordering or new acquisition |
| Pages / dashboard and MCP entries | Existing transitive consumers; no route or page changes |
| Private Inline/LayoutInline, Stack/LayoutStack, ColorValue/Swatch | Similar names do not imply duplicate contracts; preserve deliberate isolation |
| Progress duration markup | Minute precision and Unknown differ from detailed DurationValue and its exact accessible seconds; defer migration |

Direct receipt consumers after migration are Fans, Heads Materials, Cavity,
Queue, Current Job, History and Bed Mesh. HeadsPanel also serves the synthetic
Lab. Thermals and Fans retain their own controllers. Shared component/import
guards and each affected production build remain required; no guard exemption
or printer capability follows from this cleanup.

## Execution and acceptance

1. Record scope/order and source observations before application edits.
2. Extend the existing domain component and replace the three duplicated
   compositions. Keep domain labels, source association and fallback inputs in
   their existing callers.
3. Check known/stale/unknown/unsupported/unavailable and absent states,
   not_requested filtering/retention, Cavity fallback precedence, independent
   timestamps, grouped/ungrouped slot widths and masked acquisition failure.
   Run affected author tests, component/import checks and affected builds.
4. Freeze a candidate for independent source review and targeted verification.
   One separate owner runs required full regression on exact application bytes.
5. Deliver through the existing PR and u1-ship guards only after prerequisites,
   exact independent approval and mandatory checks are satisfied; restart both
   existing services and verify meaningful installed behavior.

No visual redesign, receipt relocation, target wording adoption, duration-policy
selection, token changes, private-Lab expansion, printer read/control,
authentication/network change or unrelated preservation cleanup is included.
Gallery direction remains pending. Intended UI effect is none.

## Actual observations and commands

- Read AGENTS, current state/order, requirements, active iteration,
  design-system review and design contract; invoked installed flow-git,
  flow-plan and flow-implement successfully.
- Inspected primary Git status/worktrees/remotes: clean main, one existing
  worktree; `git ls-remote origin refs/heads/main` matched the baseline.
- Created isolated branch `design-system-cleanup-20261023` from that baseline;
  the primary checkout remains on main.
- Inspected pending Flow runtime/handoff locations before writes: none existed.
  Proposed Flow locations are not ignored, so no runtime artifacts are written
  there. Task-owned diagnostic artifacts stay outside Git.
- `bun --version` returned 1.4.2; `asdf where bun 1.4.0` returned
  `Version not installed`. The app declares Bun 1.4.0. Only the existing 1.4.2
  executable was found. Checks with 1.4.2 are diagnostic, not a shipping waiver.
- `uv --version` returned 0.12.23. GitHub CLI authentication and origin access
  are available. Credential material is excluded from this record.
- The supported U1 service root is absent on this host. Historical runtime
  0.4.24 delivery is repository evidence, not verified current-host liveness.
  No service was provisioned or contacted.

## Source checkpoint and diagnostic results

Implemented four production Svelte source changes: DomainReceipt and its three
migrated consumers. Three component import allowlists replace only the affected
imports. No native-tag guard, zero-raw composition rule or transport boundary is
relaxed. Two author test files add 21 domain-policy and 10 consumer/lifecycle
presentation cases. Existing consumer coverage remains intact.

The cleanup removes three locally owned receipt-state compositions, two local
reason branches and the local Cavity fallback branch in favor of one existing
domain composition owner. Total source lines increase because the shared prop
contract is explicit; this is an ownership cleanup, not a byte/line reduction.
No style, token, ordering, controller, adapter or source timestamp changes.

Commands actually run from the app with existing Bun 1.4.2 and no env/config
loading:

- `bun --no-env-file --config=/dev/null run ui:check` passed twice, including
  the final author test files: zero errors/warnings and all component/import
  guards. A later source comment changes no executable bytes.
- `bun --no-env-file --config=/dev/null x --no-install vitest run` with
  DomainReceipt, ObservedMeta, HeadCard, ThermalsState, FansState and graph-contract
  initially passed 68/75 tests. Seven new expectations incorrectly assumed
  whitespace around Svelte conditional suffix boundaries. The application
  preserved the old boundaries; expectations were corrected, rather than
  changing inherited rendering.
- The same focused command plus ReceiptConsumers passed **85/85 tests across
  seven files**. Cases cover default existing-receipt policies, optional/absent
  state, not_requested filtering/retention, exact sentence-case Cavity fallback,
  precedence, independent source clocks, grouped/ungrouped slot widths, healthy
  refresh retention and settled failure masking. These are jsdom software
  checks, not browser geometry, physical-device or printer acceptance.
- `git diff --check` passed.

The separate design owner supports the receipt-only scope from source, with all
consumer-specific policies retained. Their declared-dependency frozen install
used existing Bun 1.4.2 (316 packages). The first isolated gallery build failed
because generated SvelteKit config was absent; an attempted serve then failed
before listening. Existing `svelte-kit sync` repaired that build prerequisite;
the gallery rebuilt successfully with 3,639 modules and unchanged historical
gallery output hashes. The task-owned loopback server was stopped. No application
source, lockfile or dependency declaration was changed by that owner.

Fresh visual capture was **not run**: the browser security policy rejected the
capture path and prohibited alternate capture surfaces. No alternate route was
attempted. Historical output-hash parity does not establish current responsive,
200% text, focus, reduced-motion or visual acceptance. Closure of the
task-created empty browser tab remains unverified and is retained as uncertain;
no user tab was changed.

The independent reviewer retracted an initial baseline/candidate DOM comparison
claim after a nonempty sentinel failed: empty captures could have explained
the zero-difference result. That result is not acceptance and no source
regression follows from the harness failure. The harness had resolved Svelte's
server entry, where flushSync was a no-op; it was repaired to resolve the client
entry and require actual nonempty receipt DOM plus a final Cavity sentinel.

The corrected independent check approved the exact clean source checkpoint
`4e3cf3bf15ac3f6a0e084a07b8e249e3ad368034`, with no correctness/regression
findings within this scope. Its external harness ran through
`bun --no-env-file --config=/dev/null run` with existing Bun 1.4.2, installed
Svelte 5.57.0 and jsdom, without a browser or server. **4,212 valid-source
initial DOM comparisons and 48 reactive checkpoints passed, zero differences**.
Comparisons covered exact text nodes/whitespace, attributes, tree shape, slot
widths and loading accessibility; compiler comments were excluded.
Evidence-state/freshness/reason/time/loading combinations, absent source
objects, Cavity fallback and unchanged existing-receipt defaults were included.
Malformed present-source objects without required state were excluded from the
adapter-valid matrix. A mandatory nonempty sentinel verified the exact Cavity
fallback/reason text. The original 4,884 comparison claim remains invalid and
must not be used as acceptance.

The reviewer inspected all 15 committed files, all default receipt callers,
shared leaves, masking/lifecycle expressions and six-channel adapter validation;
`git diff --check` against the baseline passed. This is independent source
and diagnostic software approval, not generated-package, browser geometry,
release or deployed-service acceptance.

Tracked generated package builds and hash/version updates are **pending** the
pinned-runtime decision. The current source checkpoint is intentionally not a
shipping candidate: existing packages still represent the baseline. No
mandatory full shipping gate, deployment, service restart, real-printer or
actual-device acceptance is claimed. Missing pinned runtime and existing
deployment target block delivery; the coordinator owns resolving those
prerequisites without weakening shipping guards.

## Preservation and current endpoint

[Draft PR140](https://github.com/scottchu/orca-slicer-mcp/pull/140) preserves the
source checkpoint. `git push --set-upstream origin design-system-cleanup-20261023`
and `gh pr create --draft` succeeded; remote branch and PR head/base/draft
readback matched the exact source checkpoint and main. Hosted validation is
not configured or awaited, following repository policy. No merge occurred.

This records-only tail retains the reviewed app subtree
`acf0328fc9254b1e866ca16741104b10b94f7fc6`. Source, author tests, guards,
dependency declarations/lockfile, build inputs, configuration, generated
packages and runtime identities in that subtree remain unchanged from the
reviewed checkpoint; only authoritative Markdown records change. Relevant
local links and the final diff are checked before committing the tail; affected
application evidence is retained on that explicit unchanged-byte basis.

The active task worktree, ignored declared dependencies and generated SvelteKit
configuration are retained for pinned-runtime regeneration and further
verification; no unrelated worktree or private material was removed. Temporary
design/review raw outputs remain private until the coordinator finishes evidence
reconciliation. Their servers/writers have stopped; the uncertain empty browser
tab is not automatically manipulated through another surface. Continuing source
work can resume from repository records alone. The deployment prerequisite
decision and generated package acceptance remain open, so this task is incomplete.
