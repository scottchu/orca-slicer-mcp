# 0025 — Separate Current Job and Job History

- Status: accepted; source/rendered validation and independent code/visual review pass
- Date: 2026-08-31
- Owners: project maintainers

## Context

The user wants Current Job and Job History to be independently callable
widgets rather than two sections of one Jobs card. The current read-only
projection has limited current-job filename/storage fields and an explicitly
unknown history placeholder. No accepted job-history reader or normalization
exists; separating its presentation must not imply that history is implemented.

This addresses F0's focused-view composition and capability-comprehension
question. PR32's information-above/actions-below and segmented-progress work is
merged as `47bfd37fdc0959d67ec5c717718899692b688310`; it is the source baseline,
not a deployment claim. The user now authorizes merging each independently
validated slice through a PR, but does not authorize service/plugin rollout.

## Decision

### Stable separate intents

- Retain the existing closed `jobs` value and `/dashboard/jobs` path, now
  titled `Current Job`. Existing callers and bookmarks remain valid; do not
  introduce a duplicate `current_job` spelling or a generic selector.
- Add `job_history` and `/dashboard/job_history`, titled `Job History`, through
  the same `observe_printer` and app-only refresh surfaces. Natural-language
  requests for current/active job route to `jobs`; previous jobs/history route
  to `job_history`. An unqualified Jobs request retains current-job behavior.
- The exact view enum is now `overview`, `progress`, `thermals`, `heads`,
  `jobs`, `job_history`, `queue`, `fans`, and `bed_mesh`. The two model-visible
  and eight app-only tool counts, read-only allowlist and `u1.monitor` authority
  remain unchanged. No reprint, delete, cancel, queue mutation or Admin action
  is introduced.
- The `jobs` selected module contains current-job fields only. Remove its
  history submodule. The new `job_history` module has its own discriminant and
  explicit unknown/unimplemented history state, with `not_observed` provenance
  and no history acquisition time. It must not contain current-job filename,
  storage fields, or a fabricated historical record.
- Unknown history is not an empty successful result: do not show `No jobs`,
  zero completed jobs, an empty-history table, invented durations, or dummy
  records. An empty internal items collection remains explicitly unknown,
  never accepted evidence of no past jobs. Missing current-job identity also
  remains unknown, not proof that the printer is idle.

### Two focused cards and directory entries

- Current Job preserves only the existing filename/storage presentation,
  top observation information and bottom Refresh. Remove its history panel;
  do not add a redundant current-job subsection title beneath the card title.
- Job History uses the shared card anatomy with top information and bottom
  Refresh, showing `Not implemented yet` and `Previous jobs aren’t available
  yet.` Its top time is `Observation time unavailable` until actual history
  evidence exists; the enclosing printer-observation timestamp must not be
  presented as a history acquisition time.
- Both cards project the existing shared observation and use the selected
  view for refresh. History refresh must not introduce a history endpoint,
  fabricate a row or create a separate polling/normalization path. Shared
  envelope version/freshness metadata remains distinct from domain evidence.
- Replace the directory's single Jobs entry with adjacent entries:
  `Current Job` (`/dashboard/jobs`, `Partial`, `Current filename and storage
  details only.`), then `Job History` (`/dashboard/job_history`,
  `Not implemented`, `View available; job history is not implemented yet.`).
  All other entries keep their order, producing nine focused links including
  Camera and excluding deferred Overview. Directory loading remains static
  navigation with zero automatic observation/media acquisition.
- Preserve current typography, colors, responsive layout, accessible targets,
  information-above/actions-below, camera behavior and layer calculations.
  A standalone history shell is not completion of the history capability.

### Versioning and compatibility

- Report runtime `0.3.2` and tool schema `6` for the expanded closed enum and
  separated projection contract. Advertise `observation-v4` so a new task can
  distinguish the new renderer from older cached widget HTML.
- Keep observation-v3/v2/v1 as current-asset aliases. Camera stays camera-v5
  with camera-v4 as its existing current alias. All frozen status-v4/v3 and
  camera-v3/v2/v1 bytes remain identical: eleven readable resource URIs total.
- This supersedes decision 0021's combined Jobs view and eight-value enum and
  decision 0024's single Jobs entry/eight-link directory. It does not freeze
  an extra legacy observation asset or promise that an already-cached iframe
  updates automatically. Existing `jobs` invocations remain valid; fresh
  descriptors carry the new version and enum.
- Split source, tests, procedural routing guidance and documentation through
  one new PR; merge after required local validation and independent approval,
  as the user requested. Deployment, personal-plugin installation, service
  restart, authentication/routing changes, printer access and actual history
  integration remain separate work requiring their own scope and evidence.

## Observable acceptance

1. Tools accept exactly the nine view values; unknown values still fail closed.
   Current Job and Job History refresh only their selected projection, with
   no cross-domain payload leakage or new printer/history path.
2. Current Job has no history panel or history data; Job History has no current
   job panel or fabricated empty-history success and no invented history time.
3. Both private dashboard roots list exactly nine links; old Jobs bookmarks
   still open Current Job and the new history path opens Job History. Public
   dashboard rejection and zero-acquisition static routing remain unchanged.
4. Current/frozen resource inventory, schema/runtime/version metadata and
   bundled assets agree; legacy frozen bytes and camera behavior are retained.
5. Synthetic known/unknown/stale current-job and unimplemented-history cases,
   selected refresh, 320/390/720 light/dark layouts and keyboard navigation
   pass independent checks. History remains explicitly not implemented after
   refresh. No live-printer or actual mobile outcome is inferred from fixtures.
6. Updated procedural guidance exposes both natural-language intents without
   adding a runtime tool or requiring the user to know the stable `jobs` token.
