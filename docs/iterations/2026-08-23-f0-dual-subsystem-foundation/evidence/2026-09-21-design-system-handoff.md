# Design-system handoff — 2026-09-21

The user authorized a fresh conversation to continue coherent design-system
work. The accepted hierarchy is foundations, primitives, small composed values,
domain components, widgets and pages. No specific new theme or broad migration
is accepted by this hierarchy alone.

Base: PR137 merge `03149854a8e2380b08c5bd95274c6ed66f54020b`; deployed
application remains PR136/runtime 0.4.24. The canonical source was clean with no
tracked WIP. A fresh non-main worktree received the complete non-Git inventory:
57,097 source entries, including 51,213 regular files, ignored/untracked data,
dependencies and symlinks. A private snapshot preserves the original source.
Seven explicit Markdown overlay files account for the destination's additional
entry. Original manifest and overlay hashes remain preserved privately.

Independent preservation verification passed on 2026-09-22 before intake was
accepted. Source, snapshot and destination matched content hashes, sizes,
permission modes and link targets, allowing only the explicit overlay in the
destination. Manifest SHA256:
`9fc58ce51ca76ee7626f87ab318f3c1548dd4d3c607b7f6c56d128b5fae91ff3`;
overlay SHA256:
`7274f15e7d8a7545af0e9cf267326ed7b1a94ad0d090a086300472bfe22f05b7`;
independent verification receipt SHA256:
`fa97dc2c71d13c173a0f968796fe56693dd215712f7528c254167411d787fdcc`.
Git administrative internals, extended attributes, ACLs, timestamps and hardlink
topology were outside the preservation contract. Branch/HEAD, clean staged diff
and worktree registration were checked separately.

Actual operations, recorded in private receipts: Git status/rev-parse/worktree
inventory and worktree creation; `uv run --no-project python` preservation and
independent-verification scripts; hash/mode/link comparison; then supported
`codex archive <exact caller thread>`. Archive exited 0 and reported that the
caller session was archived. Its exact command, identity, output and timestamp
remain private. Intake acceptance and caller archival are separate completed
outcomes; neither must be replayed. Default thread-list visibility was not
verified by the receipt.

Old-root removal is **excluded-canonical-checkout**. No worktree was removed.
The canonical source, all other worktrees, services, releases, snapshots and
evidence remain preserved. No history database was manipulated or process
terminated. Copied outputs are preservation evidence, not a current build.
No product tests, deployment, printer call or design-system validation occurred
during transfer. The preceding audit did not run because agent-thread capacity
was exhausted; the [successor audit](2026-09-22-design-system-audit.md) has its own
evidence and does not relabel that attempt as completed.
