---
name: u1-ship
description: Ship an independently reviewed U1 repository PR through local validation, guarded merge, exact-build deployment, restart of both U1 services, and verification. Use for U1 release requests, not printer operations or plugin installation.
---

# Ship U1

This repository-only operator skill uses `scripts/u1_ship.py` from the
repository root. It is not distributed inside the printer plugin and does
not grant printer-control authority. Read `AGENTS.md`, `PROJECT_STATE.md`,
`NEXT_AGENT.md`, and the active iteration before choosing the candidate.
The release contract is in
[decision 0028](../../../docs/decisions/0028-ship-reviewed-u1-source-through-one-operator-workflow.md).

## Select and authorize

Identify the PR, its full reviewed head SHA, and the existing absolute pinned
Bun executable. Confirm independent review approves those exact bytes and
the current task authorizes merge, deployment, restart of **both** public and
dashboard U1 services, and verification. The user may authorize this sequence
for the current task; do not infer permanent approval for future releases.
Review, ship, restart, plugin reinstall, and printer control remain distinct.

If approval or exact review evidence is missing, inspect/plan and ask for the
missing decision. Do not use `--execute`, manufacture a review record, or
replace independent acceptance with your own check. The script's SHA guard
verifies identity, not whether a human or independent reviewer approved it.

## Run the workflow

From the candidate repository root, first inspect help and the read-only plan:

```sh
uv run --no-project scripts/u1_ship.py --help
uv run --no-project scripts/u1_ship.py --pr <NUMBER> --reviewed-sha <FULL_SHA> --bun <ABSOLUTE_PINNED_BUN>
```

Once the scope and exact reviewed candidate are authorized, run the same
command with `--execute`. It must validate locally, guard PR/base/runtime
identity, merge that head, verify the merged tree, stage the exact merged
commit, install, explicitly restart both services, and verify loaded bytes,
static assets, and authentication/private-route boundaries. It delegates
lifecycle mechanics to `scripts/u1_service.py`; do not replace the sequence
with hand-written launchctl or guessed service paths.

If a guard fails, stop. Do not stash/discard unrelated changes, rebase or
auto-commit, bypass local tests, deploy the unmerged worktree, change OAuth or
Tailscale, or retry an external mutation blindly. A new candidate needs new
matching review. If an open PR becomes merged elsewhere, report the state;
do not pretend the original guarded sequence completed.

## Recovery and evidence

After a successful install, a restart/verification failure permits the
workflow's single rollback to its captured pre-install snapshot. A failed
install uses the lifecycle helper's own restoration. Preserve releases,
snapshots, and private receipts. If recovery is incomplete or uncertain,
report it and request direction; never loop rollback or undo the Git merge.

Report reviewed and merged revisions, installed release, both-service
verification, and any failed phase/rollback outcome. Update the active
iteration's validation/handoff and current state records with actual commands
and evidence, omitting secrets and private runtime paths. Distinguish local
tests, deployed-service checks, and actual phone/printer observations: healthy
services and matching HTML do not prove a live camera, bed mesh, or phone UI.
