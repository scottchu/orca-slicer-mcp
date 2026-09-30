# Reformat recovery checklist

The 2026-09-29 user order authorizes preserving completed source and durable
knowledge on main, then resolving worktrees before reformat. **Source preservation
is not design adoption or deployment.** [Current preservation evidence](iterations/2026-08-23-f0-dual-subsystem-foundation/evidence/2026-09-29-reformat-preservation.md)
owns actual completion. No off-machine backup or worktree removal is implied by
this checklist; the private backup destination remains to be chosen by the user.

## What Git preserves and what needs private backup

| Material | Durable source / recovery path | Separate preservation needed |
| --- | --- | --- |
| Gallery source and contracts | [Gallery README](../experiments/u1-design-system-gallery/README.md), [design-system review](design-system-review.md), [gallery evidence](iterations/2026-08-23-f0-dual-subsystem-foundation/evidence/2026-09-22-design-system-gallery.md) | Original screenshots, detailed browser/HTTP reports, exact output manifests and private review receipts are outside Git |
| Offline G-code experiment | [Experiment README](../experiments/gcode-preview/README.md), [original evidence](iterations/2026-08-23-f0-dual-subsystem-foundation/evidence/2026-09-21-gcode-preview.md) | User G-code, geometry, generated previews and private input/output correlation receipts must not enter Git |
| Transfer preservation | [Handoff evidence](iterations/2026-08-23-f0-dual-subsystem-foundation/evidence/2026-09-21-design-system-handoff.md) explains the accepted inventory contract | Original complete snapshot, manifests, overlay hashes, actual verification and archival receipts remain local/private |
| Work not yet on main | Review remote refs and each tree's tracked/untracked/ignored inventory | Unique WIP, local commits/refs, ignored outputs and symlink targets need verified disposition before a tree disappears |
| Services and local access | Tracked source/requirements and existing release records describe behavior | Runtime configuration, OAuth/passkey state, private identities, profiles, connection/service settings and historical logs need a protected private backup; Git is insufficient |

The current private inventory also found nine local branch refs containing 24
unique commits absent from origin heads/tags, plus three stashes containing nine
local-only commits. A private Git bundle is required in addition to source merge
and file backup; staging that bundle locally is not off-machine protection.
Private-bearing worktrees remain until their backup is verified.

Select an off-machine destination and confirm its access/recovery method before
copying private material. Record a private manifest, copy the selected material,
verify contents/hashes and test restoring representative files and Git refs from
the destination. A same-disk snapshot, dependency copy, clean checkout or merged
PR cannot protect against disk reformat. Keep secrets and backup-location details
out of repository commits and public PRs.

## Durable design knowledge to carry forward

- The adopted hierarchy is foundations → primitives → small composed values →
  domain components → widgets → pages. Existing tokens and components are the
  foundation. No new visual/API direction is adopted by preserving experiments.
- Cavity has no target; a heater's missing target is a different fact. Known zero
  must remain zero. The gallery proposes explicit No target without changing
  telemetry. Tools/bed and Cavity clocks are independently acquired; neither may
  restamp the other. Camera local presented-frame time is not upstream capture
  time or printer-status source time.
- Acquisition outcome, field availability/applicability, freshness, capability,
  lifecycle and local feedback remain distinct. Failed acquisition hides old
  telemetry/receipts; successful unknown/stale remains meaningful. Camera has a
  no-footer media-error exception. Local Progress preview failure preserves valid
  metrics; terminal jobs omit Remaining; a missing filename does not imply idle.
- Reuse has transitive impact: DegreeValue/ActualTarget reach Thermals and Heads;
  ReadingRow reaches Thermals/Fans; DurationValue currently serves Queue; Switch
  reaches Camera/Progress/Bed Mesh. Preserve private-composable consumers and
  guards without reviving the stopped dynamic experiment. Similar names alone
  do not justify merging or deleting components.
- Recovered older C08 planning recorded a request for longer connection allowance
  and faster cellular responsiveness after repeated roughly ten-second fallback.
  No numeric timeout or root cause was adopted. Diagnose actual phase and measure
  first-frame latency before changing budgets; later Camera release records own
  current behavior. This historical intent is not a reopened implementation task.
- Remaining design questions include no-target wording, receipt association,
  duration precision/missing-value vocabulary, row evidence qualifiers and
  spacing ownership. Common Frame's domain-type/copy coupling and parallel
  timestamp formatting deserve review, not an assumed acquisition leak or a
  preapproved refactor. F05 token rename and broader U01 consistency remain open.

These facts summarize the private inventory/domain/design reviews into durable
repository knowledge. The [baseline audit](iterations/2026-08-23-f0-dual-subsystem-foundation/evidence/2026-09-22-design-system-audit.md)
and [proposal](design-system-review.md) retain source links and acceptance limits.

## Reproduce after recovery

1. Clone verified remote main, verify the preserved source identities and read
   AGENTS, PROJECT_STATE, NEXT_AGENT and the current iteration. Restore private
   material from the verified backup separately; do not copy it into Git.
2. Restore the repository's declared toolchain/dependencies from package/lock
   files. The original gallery used Bun 1.4.0, Vite 7.3.6 and Svelte 5.57.0;
   version changes require fresh checks, not inherited byte identity. Surface was
   not needed. No production service should start just to inspect the gallery.
3. Follow the gallery README to build into a new private output directory, start
   its immutable loopback-only asset server and run the focused check command.
   The original final JS/CSS hashes and staged check attribution live in gallery
   evidence. Rebuilding never updates an already-running immutable preview;
   restart it explicitly. Optional private tailnet access requires restored or
   newly authorized configuration; historical access checks do not prove liveness.
4. Follow the G-code experiment README and run its synthetic unit tests through
   `uv run`. Actual-job replay requires the private original input and receipts;
   without them, use synthetic data and do not claim historical regeneration.
   Decompression and vertex/input/output budgets remain mandatory. Correlated
   historical metadata is not proof of exact bytes that physically printed.
5. Recapture the selected design and verify current behavior before resuming
   visual review. Synthetic 200% text is not phone zoom; modeled recovery is not
   production-controller recovery. User choice of No target, receipt placement
   and duration precision remains required before production migration.

Before retiring worktrees, verify remote ancestry or explicit private preservation
of unique commits, untracked/ignored content, symlink dependencies and active
runtime references. Preserve the canonical checkout. Service-owned source trees
need a safe runtime disposition; making `git worktree list` shorter is not a
substitute for preserving their dependencies. Record actual outcomes and unresolved
exceptions, then verify the final registered-worktree inventory. Reformat itself
is outside this task.
