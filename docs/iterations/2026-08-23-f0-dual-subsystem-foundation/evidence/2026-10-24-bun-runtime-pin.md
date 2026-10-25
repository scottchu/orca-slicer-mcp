# Adopt the existing Bun 1.4.2 runtime

This records the bounded runtime adoption and pause at that checkpoint.
[Subsequent package acceptance](2026-10-24-receipt-package-acceptance.md) records
the user's later resumption; historical check results below retain their scope.

## User decision and bounded acceptance

The user first selected preserving the code candidate while pausing full
validation, then explicitly selected Bun 1.4.2. Adopt the already installed
runtime; do not install Bun 1.4.0 or infer that full regression/deployment resumes.
This updates decision0043's current runtime selection without rewriting its
historical Bun 1.4.0/1.3.12 compatibility evidence.

Baseline is draft PR140 head
`df6b3e607402340b210b43dc47229f3bf9c555fa`. Acceptance for this bounded
change is an exact 1.4.2 package-manager declaration, consistent current source
records, verified installed runtime identity, unchanged dependency resolutions
and operator/security guard algorithms, focused fixture checks and a preserved
draft candidate for independent review. Full compatibility acceptance, package
regeneration, release identity changes, full required regression, merge,
deployment and service restart remain paused or pending.

## Inventory and plan

1. Update the sole executable runtime declaration, app packageManager, from
   `bun@1.4.0` to `bun@1.4.2`. No .bun-version/.tool-versions declaration
   exists. No new runtime manager/configuration is introduced.
2. Preserve `@types/bun` and transitive `bun-types` at locked 1.4.0: they
   are compiler declarations, not the runtime executable. The lock workspace
   contains dependency specifications and no packageManager field; changing
   only that declaration does not require dependency resolution changes.
3. Record the adopted version and exact local identity in decision0043 and
   current development/state/order records. Retain old evidence under its
   original candidate and runtime; adoption does not retroactively convert
   earlier diagnostic checks into a complete runtime-compatibility pass.
4. Run only focused metadata/identity and existing operator fixture checks:
   changed binary rejection, exact PATH binding, immutable staging and hashed
   installation boundaries. Do not run the paused full regression or regenerate
   all application packages.
5. Freeze, commit and push the same draft PR; obtain independent review of the
   exact runtime-pin candidate. No merge or deployment.

Existing operators accept an explicit absolute executable, bind its SHA256 and
PATH identity, detect mutation and preserve the manifest/runtime build contract.
Those algorithms remain unchanged. This decision neither permits arbitrary
runtime substitution nor introduces a new operator refactor.

## Observed identity and resume checkpoint

The installed macOS arm64 executable reports version `1.4.2` and revision
`744846f844374847c902b5e7fd59b4342a51ef99`. Local binary SHA256 is
`35d20dd0263e5c950194434b925454fdfa9ba6e4467da960410fa05b08a7a5b5`.
The revision matches the commit returned by
`gh api repos/oven-sh/bun/git/ref/tags/bun-v1.4.2` and the
[official release](https://github.com/oven-sh/bun/releases/tag/bun-v1.4.2).
This verifies reported revision/tag correspondence and local identity, not an
official archive/binary checksum or full runtime compatibility.

Fresh flow-git/flow-implement selection succeeded. The assigned task worktree is
clean apart from retained ignored node_modules/SvelteKit configuration, with no
pending Flow runtime directories. Previously retained design/review artifacts
were inspected; no matching live writer/server was observed. No unrelated
artifact was removed. Primary main remains preserved.

The existing lock SHA256 before this change is
`b09c318f1a9319dbe547626c0a0e2675b0d2f797eb6d725f3368c1ebf927a2cb`.
Read-only `bun --no-env-file --config=/dev/null pm ls` from the app resolves
the existing declared dependencies and retains the type packages at 1.4.0.
An initial invocation from the repository root found no package.json; the app
directory invocation succeeded. No install or dependency upgrade was performed.

## Implemented result and focused checks

The sole executable/configuration change is app packageManager
`bun@1.4.0` → `bun@1.4.2`. Current app README, environment, decision0043,
route-migration note and active state/order/iteration records now distinguish
runtime selection from historical acceptance and the current user pause.
The prior receipt evidence links this subsequent amendment without rewriting
its original facts. No new runtime gate, dependency upgrade or operator refactor
was added.

The installed exact executable ran a bounded metadata assertion through
`bun --no-env-file --config=/dev/null -e`: packageManager equals its reported
1.4.2, revision equals the official tag, all other package fields equal the
baseline, and the lock hash remains the exact value above. The lock has no
packageManager metadata to regenerate. All assertions passed.

Command actually run from the task repository root:

```sh
uv run --no-project --directory scripts -m unittest \
  test_u1_ship.MechanicalGuardTests.test_pinned_bun_content_change_fails \
  test_u1_ship.MechanicalGuardTests.test_bare_bun_must_be_the_pinned_executable \
  test_u1_ship.MechanicalGuardTests.test_stage_rejects_runtime_change_even_with_same_static_assets \
  test_u1_service.LifecycleTests.test_bun_hash_mismatch_blocks_install \
  test_u1_service.LifecycleTests.test_stage_builds_closed_kit_inventory_and_is_immutable
```

**5/5 fixtures passed**, with no real GitHub/service/printer action. They verify
that the unchanged guards reject executable mutation/substitution, changed
staged runtime and hash mismatch, while retaining closed immutable staging.
They are operator fixtures, not Bun 1.4.2 HTTP/disconnect compatibility tests.

`git diff --exit-code df6b3e6 -- scripts plugins/u1-print-studio/app/src
plugins/u1-print-studio/app/tests plugins/u1-print-studio/app/public
plugins/u1-print-studio/app/bun.lock` passed. Existing request-body,
disconnect/lifetime, role/auth, exact executable/hash/PATH, signature,
integrity and preservation algorithms remain unchanged; their full acceptance
is not inferred. `git diff --check` passed.

Full repository/browser/transport regression, build/package regeneration,
release identities, merge, deployment and both-service restart were **not run**,
following the user's pause. No runtime was installed. The existing U1 deployment
root/configuration remains absent according to the previous checkpoint; it was
not provisioned or changed.

Independent exact-candidate runtime-pin review and draft PR readback follow
the candidate freeze. The prior receipt source approval remains scoped to its
unchanged components; this runtime selection does not replace release approval.

The first independent runtime-pin review found one current-handoff wording issue:
the previous records-only tail's unchanged app-tree statement needed an explicit
`df6b3e6` historical scope because packageManager configuration now changes.
That statement is corrected; application source/generated-byte preservation is
kept separate from the new runtime declaration. No code or runtime-identity
finding was reported; final exact-head approval is still pending.
