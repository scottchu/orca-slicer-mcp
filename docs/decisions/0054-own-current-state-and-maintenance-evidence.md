# 0054: Own current state and maintenance evidence once

- Date: 2026-09-05
- Status: accepted direction; implementation and release acceptance pending
- Scope: repository continuity and the user-approved maintenance slice

## Decision

The user paused feature expansion to assess usefulness, CSS rules, refactoring and
workflow cost, then approved fixing the findings. Complete scoped reliability,
shared application-use-case and CSS contract maintenance before new features.
Preserve the private Lab experiment and all current production boundaries.

Current records own distinct questions:

| Record | Ownership |
| --- | --- |
| PROJECT_STATE.md | Current source/deployment/workstream status and acceptance gaps |
| NEXT_AGENT.md | One current execution order and immediate action |
| Active BRIEF.md | Goal, observable acceptance, scope and non-goals |
| Active HANDOFF.md | Changed paths, remaining risks and next unfinished step |
| Active VALIDATION.md | Index to the single evidence record for each bounded slice |
| Slice evidence record | Actual attributed commands/results, failures, source/input identities, review and delivery evidence |
| Widget delivery ledger | All 55 stable request IDs, delivered coverage and unresolved gaps |

Summaries link detailed evidence rather than copying identical commands, SHA
blocks or delivery narratives. Evidence is append-only within a slice; corrections
explicitly supersede prior claims without erasing failures. A completed records
PR is not its own next action and a record need not contain its own final commit
SHA. Source and delivery identities remain exact where they support acceptance.

The previous PR110 records are archived with an exact source-commit/hash manifest
and their relative-link closure. Archived Current headings, instructions and skill
copies are historical context, not live status or maintained authority. Preserve
history and recovery evidence; do not replace it with a lossy summary.

## Verification and delivery boundary

This changes reporting ownership only. Keep role separation, affected-consumer
coverage, focused editing checks, independent targeted/adversarial verification,
one required full-run owner, evidence invalidation, resource teardown, and every
mandatory `u1-ship` local-validation/identity/security/preservation/recovery guard.
No skip flag, cached shipping acceptance or new workflow framework is introduced.

Standing widget release authorization covers this requested maintenance through
reviewed PR merge, exact merged-build deployment, both existing service restarts
and verification. It does not authorize printer controls, authentication,
Tailscale, plugin reinstall or private-Lab production registration. PR106 remains
the accepted deployment until the new release is verified. C08 actual-phone
reliability, preparation adapters, unfinished widget coverage and user outcomes
retain their separate acceptance boundaries.

## Evidence

The active [validation index](../iterations/2026-08-23-f0-dual-subsystem-foundation/VALIDATION.md)
links the maintenance record. The [PR110 archive](../history/2026-09-05-pr110/README.md)
preserves prior commands and state. No application or physical acceptance follows
from reorganizing the records.
