# 0028: Ship reviewed U1 source through one operator workflow

- Date: 2026-08-31
- Status: accepted; reviewed and exercised through successful PR34 merge/deploy/restart/verification
- Scope: repository operator tooling, not the distributed printer plugin

## Decision and authority

The user requested a repository skill backed by a script that performs the
complete validated merge, deployment, restart, and verification sequence.
Provide `.agents/skills/u1-ship` and `scripts/u1_ship.py`, reusing
`scripts/u1_service.py` for staging, installation, both-service lifecycle,
integrity, and rollback. Do not create another supervisor or remote Admin tool.
Repository skill discovery does not require reinstalling the printer plugin.

The canonical invocation from a repository checkout is:

```sh
uv run --no-project scripts/u1_ship.py --pr <NUMBER> --reviewed-sha <FULL_SHA> --bun <ABSOLUTE_PINNED_BUN>
```

This defaults to a read-only plan. Add `--execute` only when the current task
authorizes merge, deploy, restart of both U1 services, and verification, and
independent review approves the exact candidate SHA. A skill invocation or a
passed SHA does not itself establish either approval. The script checks
mechanical identity; the coordinating agent verifies the review evidence.

## Fail-closed sequence

1. Check the canonical repository identity, clean non-main candidate checkout,
   full reviewed SHA equal to HEAD and the open PR head, PR base `main`, and
   pinned executable Bun identity. Fetch the current base during execution and
   require its ancestry in the reviewed head before merging. Reject stale-base,
   changed-head, dirty, wrong-repository, or missing-review conditions; do not
   rebase, commit, bypass review, or ask hosted CI to substitute for local gates.
   Plan mode may inspect local/read-only remote metadata but performs no build,
   dependency installation, fetch, merge, staging, or service mutation.
2. Run the required local repository, app, TypeScript, lifecycle/operator tests,
   all production bundles, tool-signature, and exact asset checks using the
   pinned runtime. Fail before external writes if any gate fails. Recheck
   reviewed HEAD, clean tree, PR head, base, and Bun identity at the merge edge.
3. Merge only that PR with a matching-head guard, without admin/auto-merge or
   branch deletion. Fetch the actual merged revision and require its tree to
   equal the reviewed tree. If the base raced or the merged tree differs,
   stop before deployment; report that the Git merge already occurred.
4. Stage only a clean isolated checkout of that merged commit, through the
   existing lifecycle helper. Verify the staged manifest and exact source
   revision; dry-run install, then install and retain its rollback snapshot.
5. Explicitly restart **both** public and dashboard U1 services. Verify both
   loaded/healthy/integrity states, exact installed revision and current runtime,
   schema and resource contract, source-matching served static assets/routes,
   private-route isolation, public authentication rejection, and enrollment
   health. Derive expected route/assets from the shipped source contract rather
   than permanently fixing this workflow to an older widget count. Do not
   invoke observation/camera tools as a side effect of deployment verification.

Preserve OAuth, environment, configuration, Tailscale routing, and unrelated
plist fields. Never include secrets/private host identifiers in committed
reports. Releases, rollback snapshots, and local operation receipts remain
outside Git. Successful health/static/security gates prove service rollout,
not real printer data, camera streaming, physical safety, or an iPhone render.

## Failure and recovery

The first authorized PR34 execution passed local validation but stopped safely
at the merge-edge clean-tree guard: Bun's compile step left one hidden
`.bun-build` scratch executable in the app directory. Its 61,405,888 bytes
matched the exact pinned Bun executable; tracked source was unchanged. Neither
merge nor deployment occurred. Classify only
`/plugins/u1-print-studio/app/.*.bun-build` as ignored generated compiler
scratch, alongside existing build artifacts. Keep the clean-tree guard intact
for tracked changes and all other untracked files. Do not globally ignore
hidden files, suppress untracked-file checks, delete the scratch automatically,
or include it in release assets. A regression must distinguish this scratch
from an unrelated untracked app file and a tracked modification. The fix needs
a new exact reviewed commit before retrying the shipping command.

Stop on the first failed phase. Before installation, do not mutate services.
The existing lifecycle helper owns failed-install restoration. Once installation
has succeeded, any restart or final verification failure triggers at most one
rollback to the exact captured pre-install snapshot, followed by restoration
verification and a nonzero result. Do not loop rollback/restart, choose an
arbitrary older release, undo the Git merge, delete evidence, or claim success
because restoration worked. Report the failed phase, merge/install state,
rollback disposition, and the next operator action. A partial or uncertain
recovery requires human direction.

## Acceptance

Independent fixture tests must exercise plan non-mutation; repository/head/base
and runtime guards; each local-gate failure; merge races; staged revision/tree
identity; both-service verification; static/security mismatch; exact bounded
rollback; and rollback failure. No fixture may contact the real printer or
mutate real services/GitHub. Independently forward-test the skill with both a
fully authorized reviewed release and an ambiguous ship request lacking
approval. Only the former may propose `--execute`. Record actual deployment
separately from script fixture evidence.

## Current rollout context

The workflow's authorized PR34 execution now completed successfully: exact
reviewed head `97b5106` merged as `7194361`, was staged/deployed, and both U1
services explicitly restarted. They report runtime 0.3.3/schema 7/
observation-v5/camera-v5 with loaded/healthy/integrity verification, fourteen
static and sixteen security checks passing. Independent verification agrees;
private configuration and routing are preserved. The prior compiler-scratch
guard failure is resolved by the narrowly scoped ignore and regression tests,
not a relaxed clean-tree guard. Recovery material remains private; no rollback
was required. The following PR33 account is the pre-workflow baseline.

The urgent already-merged PR33 rollout was completed before this automation:
release `20260831-7b9c4d4-widgets`, runtime 0.3.2/schema 6/observation-v4/camera-v5,
both services explicitly restarted and healthy/integrity verified. Fourteen
static checks and six public/private security checks passed. This is evidence
for that deployed release, not proof that the new script or pending Bed Mesh
source is accepted. Keep the paused queue work in its separate checkout.

Repository skill placement follows [the official skill documentation](https://learn.chatgpt.com/docs/build-skills).
