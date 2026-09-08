# 0057: Expose bounded agent monitoring evidence through one shared use case

Status: accepted first-slice direction, 2026-09-08; implementation acceptance pending.

The user authorized agent-readable observation/image and monitoring capability
work after PR117/118, while parking UI work. Existing focused widget projections
omit monitoring checks and camera JPEGs live in widget-private metadata. Missing
vendor exception facts were previously indistinguishable from an explicitly
empty exception object. This slice adds evidence acquisition, not a daemon or
complete run-identity system.

## Selected contract

Add one tool-only `get_print_monitor_snapshot`, with strict required `camera`
(`omit` or `snapshot`) and nullable `expectedRunToken` inputs. One declaration
owns SDK registration, real outputSchema and OAuth catalog representation. The
existing two presentation intents, six app-only helpers, resource inventory and
`u1.monitor` enforcement remain; the new total is three model-visible tools and
six app-only helpers. It creates no widget, live activation or printer action.

The shared observation store remains the only telemetry acquisition policy:
one due read, coalesced concurrent callers, unchanged TTL and no force bypass.
A separate server-only evidence sibling from the same fixed query retains field
presence, connector query-receipt time, source monotonic eventtime, controller
state, exception, valid integer bytes and vendor tool states. It never spreads
into existing widget/status envelopes. Exact path hashes stay server-private;
display filenames reuse the existing credential/URL/Unicode privacy policy.
Repeated cached receipts do not refresh their evidence time or continuity window.
Camera completion rechecks cached telemetry freshness without another query.

The application returns complete bounded status facts, including explicit nulls,
independent progress sources and an explicitly derived elapsed/progress estimate.
MCP returns the validated envelope as structured content and JSON text; optional
sanitized JPEG appears only once as ImageContent, never base64 in the DTO or
widget-private metadata. JPEG output is capped at1MiB (existing upstream4MiB
bound retained), structurally validated and metadata-stripped; image decoding
and visual interpretation remain consumer evidence. No transcoder, native
library or automatic image-health diagnosis is introduced. The request has a
20-second consumer deadline; cooperative cancellation aborts independent camera
work but cannot cancel another consumer's coalesced status acquisition.

## Observational continuity and terminal limits

A single bounded context lives with each shared store. An initial fresh active
or paused observation with job/start/progress evidence may receive a random
36-character token. Native run UUID availability is not a prerequisite for that
explicit observational binding. The token is neither source identity nor
permission. It cannot prove continuity across a same-name replacement that
catches up between polls; artifact correlation stays unknown.

Expected-token mismatch, missing evidence, epoch change, source-clock regression,
job change, counter reset or a gap over12 minutes returns changed/uncertain,
withholds camera and never silently mints a replacement token. Cache reads do
not extend the window. A new explicit initial inspection may establish another
observational context. No history/status join, durable storage, subscription,
notification or automatic monitor owner is added.

A `complete` state is only `reported_consistent` with fresh complete telemetry,
explicit inactive execution, positive known file size and exactly equal valid
file position, explicit no-exception, ready controller, all four tools explicitly
parked and all heater targets zero. Overshoot is invalid, 0/0 is not full, and
unknown facts cannot pass. Error/cancelled reports require fresh state and
inactive execution; paused is not terminal. Zero target does not mean cold.
Every terminal result keeps `boundRunVerified:false`: reported consistency is
not exact-run or physical success. SESSION-001 and the complete O1 execution
loop remain open. Maintained monitoring orchestration retains explicit owner,
adaptive cadence, bounded recovery, observational-binding disclosure and the
no-durable-service boundary.

## Alternatives and validation

Expanding widget projections would couple agent evidence to presentation.
Per-field micro-tools would fragment acquisition. A daemon/history correlation
system would require a separately validated lifecycle and identity contract.
The selected slice is one transport-independent use case that future adapters
may share; it adds no HTTP/CLI surface just for symmetry.

Validate strict SDK/OAuth schemas, same-store concurrency and receipts, terminal
contradictions, nullable malformed fields, reset/gap/restart contexts, private
field exclusion, genuine synthetic image delivery, cancellation and bounded
teardown. Keep software, protocol, actual-host multimodal and physical-printer
acceptance separate. Existing required shipping guards remain unchanged.
