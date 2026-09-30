# Pre-reformat source and knowledge preservation — 2026-09-29

Status: source-preservation merge complete; private backup and worktree retirement
remain incomplete. The user's new
order is completed work and durable knowledge on main, with dangling worktrees
resolved before computer reformat. This supersedes draft-only/no-merge-before-
visual-choice restrictions for **source preservation**. It does not adopt gallery
visual/API proposals, authorize production migration/deployment, or prove backup.

## Candidate and evidence scope

Initial local HEAD: `59952336b6ea2e3f7ec47e5f9f7fcbe1aa7c94b0`, with a clean
working tree before current records were edited. The completed design-system
gallery and tailnet-access records are preserved from that source. The original
gallery delivery was independently approved at
`971c7e85e0544b2ce2ad3713fcf49a90c853c60c` and opened as PR138; this historical
receipt is source provenance, not fresh proof of current remote PR/preview state.

The candidate also preserves the isolated G-code preview from PR127 source
`69c9d63aa631fdc2c365b57b77946cb6bc98be7c`: five experiment files and its
[original evidence](2026-09-21-gcode-preview.md). Old PR127 current-state/order
files are deliberately not overlaid onto current records. The imported evidence
retains its original outcomes and failures, including the then-missing
`svelte-kit` full-check failure, historical private-input/render checks and
unaccepted user/production outcomes. Current validation will be recorded
separately; no historical result is relabeled as a fresh run.

## Durable knowledge and private inventory

[Recovery checklist](../../../reformat-recovery.md) separates reproducible source
from required private backup: manifests/snapshots and receipts, actual user inputs,
rendered evidence, local-only WIP/refs, private runtime/auth/access configuration
and service dependencies. It preserves source-grounded state semantics, consumer
coverage, unresolved design choices, reproduction steps and known limitations.
No raw conversations, images, model/G-code geometry, local operational identifiers,
credentials or private configuration enter repository records.

The records owner read the active repository guidance/state/order/iteration,
requirements, gallery README/evidence and the private audit/domain/gallery
receipts. Commands actually run: Git status/branch/rev-parse; explicit Homebrew
`rg`; file reads; `git show` of the PR127 evidence; and
`uv run --no-project python -` for current-order updates and exact historical
evidence import. The G-code evidence was imported byte-identically from its
stated source commit; imported SHA256 is
`24f703d1021eededf0ee6b10e2b92d089432ed0fe0ecef468d2c6d2e8026d6bd`.
Author `git diff --check` passed. A focused `uv run --no-project python -` check
resolved 27 relative links in new/current documentation, found no new private
operational identifiers, confirmed exact historical-evidence bytes and an empty
production-input diff against HEAD. No build, application test, printer action,
service change, backup transfer or worktree removal was performed by this owner.

## Recovered local-only C08 planning knowledge

Two older worktrees based on
`289c39f9e4736335707d1a8da725a4f60a95ab7c` contained the same six modified
Markdown records: NEXT_AGENT, PROJECT_STATE, iteration BRIEF/HANDOFF/VALIDATION
and widget-delivery. The records owner inspected their dirty diff, compared each
full file byte-for-byte through `uv run --no-project python -`, and searched the
current records with explicit Homebrew `rg`. All six pairs matched. Exact
private inventory/hashes remain with the preservation verifier.

The substantive addition was a historical post-PR106 user report: Live still
fell back after roughly ten seconds, with a request for longer connection
allowance and faster response over cellular access. The exact host surface,
mounted resource, failure reason and failed stage had not been established.
The proposed next investigation was to measure connection/first-frame phases,
then consider a coherent bounded wait/cleanup contract and measurable latency
improvement. No numeric timeout extension, implementation, root cause, new
application test or successful phone outcome had been adopted in those edits.
Their own validation was documentation-only; attempts 1–12 retained their
original limits without phone acceptance. A longer timeout alone would not establish faster connection
or a root-cause fix.

Preserve this as historical user intent and diagnostic caution, not the current
execution plan. Later [decision0059](../../../decisions/0059-prioritize-camera-reliability-and-fixed-live-widgets.md)
and [PR125 evidence](2026-09-11-fixed-widgets-camera-reliability.md) supersede
that old implementation order; actual-phone acceptance remains separate in the
[current C08 ledger](../../../widget-delivery.md). Do not overlay stale PR106 delivery labels, old Progress
no-action wording or old renderer inventories onto current indices. Raw modified
records still require their private-backup disposition before removal; this
summary does not assert that copying/deleting any tree has occurred.

## Current private-inventory findings

The coordinated inventory found 24 registered worktree HEADs, all covered by
live remote-origin history. Twenty-two were already ancestors of remote main;
the offline G-code experiment and gallery were the two unmerged heads at that
inspection. That does not account for every local ref: nine local branch refs
retain 24 unique commits unreachable from any current origin head/tag, and
three stashes retain nine local-only commits. Preserve these in a verified
private Git bundle alongside file-level private material; merging completed
experiments to main cannot substitute for that backup.

Private bundle staging is deferred until a suitable destination and capacity are
available; no bundle was created. No off-machine destination, transfer or
restoration pass is claimed. Private-bearing worktrees remain until
their backup gate is satisfied. Exact ref identities, file inventories and
bundle paths stay in private receipts rather than public records.

## Current candidate software validation

A separate validation owner completed all eight local gate steps with pinned
Bun 1.4.0 (binary SHA256
`539598c775882420b9d8deb7dc14d845f20f7d26f5600c50ab067dde6ac3f3bf`).
The 590 recorded source/input hashes and modes remained unchanged across the run;
private logs/manifests retain the exact input set and output identities.
Actual commands, with private output locations replaced by placeholders:

1. App `bun --no-env-file --config=/dev/null install --frozen-lockfile --ignore-scripts`.
2. Root `./scripts/check-repository.sh`.
3. App `bun --no-env-file --config=/dev/null run bundle`.
4. App `bun --no-env-file --config=/dev/null run bundle:server`.
5. App `bun --no-env-file --config=/dev/null run bundle:runtime`.
6. `codesign -vvv --verify <generated-runtime>`.
7. App `bun --no-env-file --config=/dev/null run build:server --outdir <private-candidate>`.
8. Root `git diff --check`.

All eight returned 0 on the completed run. Repository checks included UI 741
passing tests across 70 files, server 328 across 40 files, lifecycle 44 and
shipping 28, plus artifact parity. Bundles, runtime code-sign verification and
fresh server/static manifest passed. This is local software/build acceptance,
not shipment, deployed-service checks, printer behavior or user visual selection.

The first run failed at the repository gate with a transient `ECONNRESET` in
the materials tests. That failed attempt remains preserved. The targeted
materials rerun passed 11 tests, the complete server rerun passed 328, and the
complete eight-step run above then passed. No application-source fix is claimed
for the transient failure; the later success does not erase its evidence.

## Outstanding acceptance layers

- Source: completed as recorded below; no repeat merge is pending.
- Private backup: destination awaits user selection and local disk pressure
  limits staging. No off-machine copy, integrity check or restore test is claimed.
  A same-disk snapshot is insufficient.
- Worktrees: private inventory and dependency/disposition verification are being
  coordinated separately. No removal or final no-dangling-tree result is claimed.
- Runtime/user: existing historical runtime 0.4.24 evidence remains unchanged.
  No fresh liveness, actual-device, printer or visual-adoption outcome follows
  from source preservation. Reformat and production recovery are not performed.

Actual validation/integration and disposition results will be recorded by their
owners. Exact local inventory and backup-location details remain in private
receipts; sanitized completion facts belong here. No production deployment is
required for unchanged application inputs plus isolated experiment preservation.


## Completed source-preservation integration

PR138 merged reviewed candidate `95dd1a8` as
`5d210d4bc5859a0aa871ea1eedbe7a44a3fc69f8`. The operator read PR state, fetched
origin, and verified remote main, merge parents (prior main `0314985` plus the
reviewed candidate), and exact reviewed tree equality. All five PR127 experiment
files plus its evidence matched their preserved source exactly before PR127 was
closed as superseded. Source branches remain preserved. The canonical checkout
and current task branch were fast-forwarded to the verified merged main. Exact
commands/results and candidate approval remain in private delivery receipts.

The validation owner also reported a fresh 16-test G-code unit pass using
`uv run --no-project python -m unittest discover -s experiments/gcode-preview -p 'test_*.py'`
and a fresh gallery build reproducing all three recorded final asset hashes.
That gallery build used shell Bun 1.4.2; the eight mandatory steps above used
pinned Bun 1.4.0. No fresh gallery browser matrix is claimed. This preserves the
actual focused results separately from historical PR127 checks.

Remote preservation of completed source does not preserve the remaining 24
local-only branch commits, three stashes/nine related commits, private evidence,
credentials or ignored files. Local disk pressure and the missing user-selected
off-machine destination prevent backup/removal closure. No worktree removal,
off-machine backup, reformat, production deployment or visual adoption occurred
as part of this source integration. The next action is private backup destination
selection and verified preservation before retirement.

Postmerge record closure passed `git diff --check` and a focused
`uv run --no-project python -` check of 18 current-section/evidence links,
new-content privacy and unchanged experiment/production inputs against merged
HEAD. No build or browser suite was repeated for this documentation-only tail;
the private independent receipt owns exact final-document approval.
