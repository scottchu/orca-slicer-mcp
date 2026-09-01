# 0034: Migrate live widgets through shared host adapters

- Status: accepted design; implementation and delivery acceptance pending
- Date: 2026-09-01
- Milestone: F0 / UI-001, UI-003, OBS-001

## Context

The user requires completing the existing Svelte migration, including real
loading and retained refresh behavior. The private lab is synthetic and is not
a production adapter. Its fixtures must never be presented as real data.

## Decision

Use an interactive-decoupled UI in the existing application. Preserve backend
tools, authorization, acquisition boundaries and CSP. This is not a server
rewrite. The first bounded production cutover is the Fans dashboard; the generic
MCP resource and other eight focused routes remain on their existing renderer
until their real adapters and behavior have parity.

One shared `lib/host/rpc.ts` owns initialization, the parent-only message
listener, request IDs/deadlines and disposal. MCP Apps `ui/initialize`, tool-input,
tool-result and `tools/call` are primary. Compatibility globals feed the same
input/result stream, never a second calling transport. Camera will reuse this
bridge through its separately reviewed typed transport adapter.

Fixture-independent models and strict normalized-envelope adapters preserve
zero, unknown, unsupported, unavailable, stale and valid empty states, domain
source/received/checked times, capability evidence and reasons. Fans preserves
seven stable IDs, independently reported percentage/RPM, purifier power/state/
mode, and the real 1,000,000 RPM bound. Real data never receives `fixture: true`.

The host supplies selected view before data. A view-locked controller starts with
structural loading, coalesces refresh, retains accepted data/time/focus/layout
during refresh, rejects malformed/wrong-view data, and ignores late results after
a superseding event or disposal. Errors use non-flow feedback. Versions may reset
after restart: lower-version recovery and same-version freshness updates are
valid, not globally monotonic ordering.

Within a mounted view, compare the real envelope receive time before its
process-local version: reject earlier receipts; for equal receipts in the same
connection epoch, reject lower versions. A later receipt may carry a lower
version after server restart. Same-version freshness updates remain valid.
Malformed or wrong-view notifications are ignored without settling an unrelated
refresh; a malformed response to that refresh reports its own failure. Standard
host events supersede compatibility replay for their event kind. Preserve tool
private metadata at the bridge, but never project it as observation data.

The Fans heading uses the fan-domain receipt/source time, not the status envelope
time. Production packaging has a separate self-contained Fans entry and explicit
isolation checks; it neither embeds nor changes the 750,000-byte private-lab cap.

The live root is zero-raw and keeps components mounted. Primitives are shared
with the lab; production bundles exclude fixture producers, lab controls, test
harnesses and synthetic camera media. Later alias/artifact retirement requires
explicit parity evidence, not merely a successful build.

## Acceptance and boundaries

- Adapters test bounds, unknown/zero, receipts, malformed and wrong views;
  bridge tests cover duplicate/reordered/deadline/disposal/compatibility.
- Controller tests cover single-flight, retained refresh, failure recovery,
  lower-version restart and same-version freshness without invented time.
- Four-width/200%-text browser checks prove loading/refresh bounds, readable
  values and focus. Deterministic packaging proves production/lab isolation.
- Fresh independent validation/review precedes PR merge, exact deploy, explicit
  restart of both services and verification.
- Synthetic host checks do not prove phone, camera or printer behavior. No
  printer controls, authentication changes or transport expansion is added.

## Documentation basis

The existing split application is retained rather than scaffolded anew.
[Official UI guidance](https://developers.openai.com/apps-sdk/build/chatgpt-ui)
supports standards-first bridge events and updates to mounted UI;
[the reference](https://developers.openai.com/apps-sdk/reference) identifies
compatibility globals as additive. Repository restart/evidence semantics take
precedence over generic monotonic-event examples.
