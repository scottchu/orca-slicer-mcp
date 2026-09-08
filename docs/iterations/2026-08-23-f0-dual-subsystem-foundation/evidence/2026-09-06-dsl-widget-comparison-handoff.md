# DSL widget comparison handoff — 2026-09-06

## Scope and identity

The user changed order to inspecting existing widgets, composing equivalent
information with the closed DSL, and comparing screenshots before further
styling or release. They also requested a separate worktree and visible new
Codex Desktop conversation, with the canonical checkout kept on main.

The local checkpoint branch is `codex/u1-dsl-widget-comparison`, based on main
`acaaa7978f10b46642f8c29f56bab3ce4b82ae97`. A new worktree holds the transferred
WIP. This checkpoint preserves unfinished work; it is not an independently
accepted product candidate. No remote push, PR, merge or deployment is part of
this handoff. Desktop conversation creation remains a user action.

## Actual transfer evidence

The migration operator ran a `uv run --no-project -` script using Git subprocesses,
SHA-256, file-mode checks and byte-preserving file copies. Its exact Git command
log, before/after manifests, binary patches and original changed files are
retained in the private recovery directory communicated at handoff. Machine-local
paths and temporary evidence are deliberately excluded from this repository.

Observed before mutation:

- Canonical checkout: `codex/u1-camera-connection-budget` at
  `289c39f9e4736335707d1a8da725a4f60a95ab7c`, six modified tracked documents.
- DSL source: `codex/u1-visible-reading-gaps` at the main base above,
  32 modified tracked files and one untracked decision0056 file.
- Original detached worktree: the Camera base above and six separate modified
  documents; it was fingerprinted and left untouched.

Results:

- Backups retained all original changed files, modes, statuses and hashes.
- New Camera worktree passed six-file SHA-256/mode/status parity.
- New DSL worktree passed 33-file SHA-256/mode/status parity.
- Source fingerprints were rechecked before restoring only enumerated tracked
  paths. The old untracked ADR was moved into recovery storage after verification.
- Canonical checkout returned to clean main at the stated base; Camera retained
  its original branch in its own worktree. The old DSL checkout became clean and
  detached at the same main base. All original branches remain retained.
- The original detached worktree passed an unchanged fingerprint check.
- Ignored source evidence/resources were left in place. No broad cleanup occurred.

After parity, only current handoff records were revised for the new execution
order, plus this evidence record. A local checkpoint includes the transferred
source, provisional ADR and updated records. The pre-transfer backup remains
unchanged so the exact preservation result can be verified independently.

## Product evidence boundary and next action

No product tests, builds, browser captures, independent product approval or
service actions ran in this migration. Earlier partial author checks cannot be
carried forward as acceptance for the unfinished transferred bytes. Local
runtime0.4.16 / observation22 / Camera18 / private revision7 changes remain
unpublished. PR115 / runtime0.4.15 remains the recorded deployed baseline.

Next inspect existing widgets with synthetic data, choose overlapping DSL
capabilities, and capture paired screenshots with identical data, state,
viewport and text scale. Compare value fonts, visible gaps, grouping, alignment
and wrapping. Report unsupported capabilities before deciding any further CSS
change. Preserve private-Lab, truthful telemetry and all existing release guards.
