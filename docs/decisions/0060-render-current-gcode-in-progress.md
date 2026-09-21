# 0060 — Render current G-code in Progress

- Status: accepted and shipped in PR130; physical-print and actual-host outcomes remain separate
- Date: 2026-09-21
- Milestone: F0 / widget P03, OBS-011, OBS-016, API-007

## Context

The user accepted an offline real-file toolpath preview and explicitly requested
design, implementation and shipment in the current Progress card. Cached
geometry should make subsequent monitoring updates small and inexpensive.
The present monitor identifies only observational continuity: its filename hash
is not a content digest, its artifactHash is null, and layer/byte positions do
not measure physical deposition. The new view must preserve those distinctions.

This retains the existing interactive-decoupled SvelteKit/MCP Apps architecture.
Orca Preparation and Printer Operations remain peer subsystems; reading an
externally originated file does not invent a prepared-job handoff or authorize
slicing, upload, start, other printer control or a native run identity.

## Selected contract

A shared application service owns current-artifact observation and compiled
geometry caching. Only a focused Progress demand requests this domain. The
Operations adapter obtains a validated server-only relative G-code path from
the existing status acquisition, reads fixed same-origin metadata, reads that
file under the gcodes root, and rechecks metadata. It accepts no caller URL,
path or arbitrary file selector and follows no redirects. Full printer paths,
raw G-code/comments, upstream URLs and errors remain server-only.

Require consistent filename, positive size and modified-time metadata before
and after download, exact byte length, and unchanged accepted job/connection
evidence. Optional source UUID adds correlation but is not a content digest.
Hash the exact downloaded bytes and key geometry by that digest plus parser
and encoding versions. Bind each delivered result to its accepted observation version, receipt time
and connection epoch. Newer receipts for the same job do not invalidate an
in-flight content compilation by themselves. Recheck existing-store freshness and identity after
acquisition/compilation without issuing an independent printer query. Changed,
expired or ambiguous evidence must not attach an old model to the current job.

Binding is explicitly metadata_correlated, not proof of the exact bytes
executing or previously printed. Same-name replacement preserving all checked
metadata remains undetectable without a trusted execution-time digest. Managed
prepared-artifact/run binding is deferred; do not change the existing monitor
artifactHash/null contract as a shortcut.

The model-visible Progress result stays small. Versioned toolpath metadata and
geometry travel only in component-private result _meta.progressToolpath. The
existing app refresh accepts optional knownToolpathId only for Progress; an
exact validated match suppresses geometry transfer, while a missing/mismatched
hint returns the current geometry. The hint never selects a file or confers
authority. Existing calls without the hint remain valid. Existing remote
u1.monitor enforcement, private HTTP access and CLI application-use-case
boundaries remain authoritative; hints, visibility and opaque IDs are not
security enforcement. No new tool or external widget fetch is introduced.

Illustrative private envelope (final schemas must be strict and tested):

```ts
{
  schemaVersion: 1,
  observationVersion: number,
  connectionEpoch: number | null,
  observedAt: string | null,
  previewId: string | null,
  binding: 'metadata_correlated' | 'uncertain' | 'changed',
  state: 'loading' | 'ready' | 'unavailable' | 'unsupported',
  reason: string | null, // closed enum, never an upstream message
  currentLayerIndex: number | null,
  geometry?: EncodedToolpathV1
}
```

## Geometry and truthfulness

Reconstruct nominal extrusion centerlines from supported plain Orca/Klipper
G-code; do not recover CAD solids or execute embedded instructions. Preserve
all accepted normalized paths and points. Map printer-reported layer values
through explicit SET_PRINT_STATS_INFO evidence in the exact artifact rather
than assuming annotation indexes match. Missing, conflicting or out-of-range
mapping leaves the model inspectable with no live layer highlight. Never
compute model height from percent or present a byte cursor as nozzle position.

Support T0–T3 only where coordinate/extrusion state can be established safely.
Tool activation invalidates uncertain coordinates; absolute extrusion requires
an explicit G92 E baseline per activation. Unknown motion-affecting commands
and unsupported dialects fail closed. Any narrowly allowed opaque per-layer
macro must be disclosed as unexpanded; nominal paths cannot establish its
hidden movement or physical effects. Unsupported geometry leaves ordinary
Progress values usable. Do not silently simplify or discard paths to fit.

Printing, paused and terminal reported-file states may show the correlated
stored-file preview. Standby/no file clears the prior model. Paused never
advances by extrapolation; terminal state remains printer-reported and does
not prove physical completion. Failed acquisition masks current geometry, filename and telemetry under
decision0041. Age-only stale successful evidence may retain a previously
accepted same-job/epoch model with a Last reported label and its receipt,
but clears the live highlight and starts no new artifact read/compilation.
Unknown/new job or epoch clears the model. An unavailable layer with otherwise
fresh supported geometry is distinct from an unavailable preview.

## Bounds, efficiency and lifecycle

Initial limits: 20,000,000 input bytes, 500,000 processed vertices, 16,000,000
normalized/decoded bytes and under 1,000,000 encoded geometry bytes. These are
protocol resource bounds, not reinstated widget-package byte caps. Use bounded
metadata responses, a 20-second request/acquisition budget, one in-flight
compilation, at most two cached compiled artifacts and 2,000,000 total encoded
cache bytes. Release raw bytes after compilation. Cache and pending work are
private process-local state; a restart clears the server cache. A client hint
cannot revive a ready result without current identity validation. Validate decoded
byte/count/coordinate limits before allocating/rendering unbounded structures.
The initial numeric result returns promptly with loading/preparing while one
service-owned, deadline-bound compilation runs. It publishes only into the
private cache; the next authorized demand revalidates the current binding
before attaching geometry. There is no server background retry loop. Repeated
unsupported input is negatively cached against unchanged metadata; transient
retry obeys due-demand bounds. Cancellation before job creation must not start
work. Superseding identity/epoch or runtime disposal cancels owned pending work.
Cancellation, timeout and superseded results must release owned resources;
periodic checks or isolation must bound compiler work as well as network waits.

A visible mounted Progress service schedules settled, nonoverlapping refreshes.
For printing/paused state, an explicit internal Progress demand shortens the
shared status due interval to 15 seconds. It never bypasses the shared
single-flight acquisition or its 15-second minimum. Idle/background and
standalone agent-monitor cadence remain unchanged. Metadata revalidation is
coalesced with accepted status receipts, not a second periodic printer loop.
Repeated known-artifact updates transfer only the small private state envelope.

The view subscribes and renders. Services own timers, request cancellation,
visibility/page lifecycle and recovery; hidden/unmounted views stop demand.
No perpetual animation or model-driven redraw loop is added. Reproject on
view/size changes and redraw on accepted layer changes. Preserve Frame,
reported percent/layer/ETA/elapsed and shared footer. The first production
slice uses 3D/Top controls without a manual layer slider.

## Tradeoffs and deferred work

Keeping geometry in existing refresh metadata avoids a second generic file
tool and direct widget network access. It requires backward-compatible input
validation and client cache/result-correlation tests. Content hashing amortizes
compilation but cannot strengthen metadata correlation into execution identity.
A bounded decoder may reject larger files; truthful fallback is preferable to
an incomplete model. Fine-grained byte-position estimates, bead meshes, source
CAD, camera-based quality claims, durable monitoring and P02 thumbnail delivery
are outside this slice.

## Observable acceptance

- Exact supported geometry and layer mapping pass independent synthetic and
  adversarial checks, including multi-tool resets, unsupported macros, unknown
  mapping, oversized/corrupt input and decoder exhaustion.
- Repeated/concurrent same-artifact requests perform one download/compile;
  changed metadata/job/epoch, progress rollback and delayed replies cannot
  display an old current model. Missing/failed metadata yields a local fallback.
- Progress plus monitor/Overview share one due status read; no read occurs
  before 15 seconds, and unchanged idle/standalone cadence is demonstrated.
- First/known/changed artifact payloads, privacy boundaries, old-input
  compatibility, authorization and every affected transport have contract tests.
- Desktop/narrow/200-percent-text, keyboard, reduced motion, pause, failure,
  hide/pagehide/BFCache and teardown checks preserve meaningful rendering and
  release resources. Software tests do not establish physical deposition.
- Independent exact review, mandatory shipping checks, both-service restart,
  exact served assets and meaningful installed-widget checks precede delivery.
  Actual printer, mounted ChatGPT/phone and user outcomes remain separate.

## Sources and evidence

Current official guidance was checked on 2026-09-21: [tool-result privacy and
metadata](https://developers.openai.com/plugins/reference), [interactive UI
bridge](https://developers.openai.com/plugins/build/chatgpt-ui), [tool hints
and authorization boundaries](https://developers.openai.com/plugins/plan/tools),
and [Moonraker metadata/file download](https://moonraker.readthedocs.io/en/latest/external_api/file_manager/).

[Slice evidence](../iterations/2026-08-23-f0-dual-subsystem-foundation/evidence/2026-09-21-live-gcode-progress.md)
owns actual commands, identities and acceptance as implementation proceeds.

## Presentation refinement — 2026-09-21

The user requested the Camera common Switch for local 3D/Top selection and
percentage/bar integration into the model panel. Use a normal-flow bottom
summary outside the chart image semantics, keeping one accessible progressbar
and atomic numeric percentage. This changes layout only; every acquisition,
identity, cache, layer and authority boundary above remains unchanged.
