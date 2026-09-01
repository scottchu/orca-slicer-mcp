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
The exact private asset route is `/dashboard/fans_widget`, loaded only by the
existing `/dashboard/fans` host. It performs no acquisition itself, accepts GET
only, has no network/media capability in CSP and allows only same-origin framing.
The separate production Fans artifact is bounded at 100,000 bytes; this does not
relax or replace the lab cap. Source-derived ship inventory adds its exact hash
and public-isolation probe. Eight other focused hosts and all MCP aliases retain
their existing renderer. Camera packaging has a separate decision/author.

Duplicate observations must not settle or invalidate an active refresh. Real
newer responses are still compared against the latest accepted receipt, even if
a same-version freshness notification arrives while they are pending. A persisted
pagehide retains the mounted session for BFCache; nonpersisted disposal is final.
Host reload generations reject replies belonging to a replaced iframe. A generic
busy icon-button state uses aria-disabled and guards activation without removing
keyboard focus; ordinary disabled behavior stays unchanged for existing callers.

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

## Thermals follow-on boundary (2026-09-01)

After reviewed Fans PR70, the next bounded cutover is only `/dashboard/thermals`.
Its exact private `/dashboard/thermals_widget` asset uses the same host bridge
and a shared typed observation controller, retaining every reviewed ordering,
single-flight, superseded-rejection, BFCache and focus regression. Other seven
focused observations and generic MCP resources remain on existing renderers.
No backend query, authentication, capability or printer control changes.

The fixture-independent adapter preserves six stable identities, including real
`heater-bed`, independent nullable actual/target/active/heater-state fields,
each field's evidence state and each reading's provenance/capability. Cavity has
no target; its environment state, reported state, receipt/check/source times,
freshness and reason remain independent of status. Source normalization accepts
all finite tool/bed temperatures but bounds Cavity at -273.15 through 999 C;
the UI must not silently impose the narrower synthetic lab fixture bounds.
Unknown is not zero, inactive is not unknown, overshoot is not clamped text.

Reuse shared thermal rows/degree/percentage primitives without raw feature DOM,
with a six-row structural skeleton and retained refresh. Four-width/200%-text
readability and loading/refresh bounds, real server projection compatibility,
strict malformed/wrong-view rejection, unknown/zero/source-bound cases and the
existing Fans regression suite gate acceptance. Production Thermals has its own
self-contained <=100,000-byte artifact, separate from the unchanged individual
and aggregate lab budgets. Exact static route/public-isolation shipping checks
must include it before guarded delivery. This records scope, not completed
implementation or actual-device acceptance.

Bounded independent presentation design review accepted an explicitly scoped
Tools/bed status header and one compact independent Cavity receipt row above
the six shared readings. Keep its skeleton structure identical; do not repeat
provenance paragraphs per channel. Unknown active is neutral; false is labeled
Inactive rather than inferring an Idle heater state. An opt-in grouped
timestamp slot prevents splitting time from AM/PM while retaining loading
geometry; existing metadata defaults remain unchanged. This design disposition
is not implementation validation or independent exact-candidate approval.

## Print Queue follow-on boundary (2026-09-01)

The next existing migration after the independently accepted Heads foundation
is Print Queue, addressing F0 / UI-003 and OBS-012. First develop its isolated
strict real-envelope adapter and tests on reviewed Thermals main; consume shared
composition only after Heads reaches accepted main, never a pending branch.
The bounded cutover replaces only the child of `/dashboard/queue` with exact
private `/dashboard/queue_widget`. Generic MCP aliases and backend acquisition
remain unchanged. Production packaging proposes a separately reviewed 100,000
raw-byte cap; this is not permission to increase either lab budget.

Preserve independent queue receipt, freshness, checked time, reason and evidence;
four queue states, nullable total count, first 100 rows of at most 1,000 jobs,
explicit truncation, safe filenames, nullable added time and observed waiting
duration. Queue state `loading` is a reported machine state, not UI skeleton
mode. Waiting duration never advances locally and is not print ETA. Duplicate
filenames remain separate ordered records; exposed position identifies a row's
slot, not durable job identity. Missing facts never become zero or empty success.

Acceptance requires real-producer compatibility, malformed/private-extra and
wrong-view rejection, all count/state/time bounds, duplicate/reordered rows,
independent clocks and retained stale empty versus unobserved state. Compose
zero-raw Queue rows/skeleton/root from closed shared leaves, with top information,
bottom icon refresh and non-flow feedback. All sanitized filenames remain
readable at 320/390/590/720 and 200% text. Loading uses truthful structural slots;
unknown arbitrary live row counts may resize on first data. Closed lab presets
must match loading geometry and refresh must retain rows/time/focus without
layout shift. No fabricated row count or enormous blank reserve is acceptable.

Reuse the reviewed generic RPC/controller ordering, refresh race, lifecycle and
host-generation protection. Exact private route, CSP/no-store, public/path/method
isolation, source-derived shipping inventory and deterministic graph/budget
checks precede independent exact-SHA approval and guarded paired-service release.
This record is a scope contract, not source, deployment, printer or device
acceptance. No printer controls, new acquisition, auth/Tailscale or plugin change.

### Queue integration and shared loading decision

The accepted PR75 three-artifact baseline is explicitly merged before final
Queue composition. Its light250,000/Bed700,000/Camera80,000/aggregate980,000
limits remain unchanged. The separately adopted focused-production inventory
contains at most ten named widgets and is capped at1,550,000 raw UTF-8 bytes;
only present production Svelte entries count, never labs, hosts or index.
The final ten-entry acceptance remains future work. Queue is individually
bounded at100,000 bytes now; this is not an allowance for unrelated features.

Independent source review of another consumer exposed an obsolete-success
race in the shared controller. An accepted notification invalidates any RPC
started earlier, regardless of the reply's claimed version or receipt. Its
flight still settles; retry remains available. Duplicate/invalid notifications
do not acquire arrival ownership, and receipt-ordered process restart without
an intervening accepted notification remains legitimate. All four existing
observation consumers require the same regression, not a Queue-only workaround.

Independent design adopted intrinsic public text templates for exact closed-lab
skeleton geometry after estimated character widths failed. The generic
TextSkeleton leaf uses a bounded control-safe, aria-hidden inert text node;
actual inherited glyph metrics and whitespace determine wrapping. Name and
DateTimeValue accept templates only in loading variants; numeric index/name
templates use tabular zero glyphs. Lab shapes derive solely from the closed
synthetic layout and fixed public date format, never a real filename/receipt.
Production uses neutral defaults, promises no exact unknown first-row count,
and retains real content during refresh. Ready metadata is not truncated and
no fixed card reserve or weakened one-pixel geometry gate is permitted. Locale
matching is demonstrated for the tested closed locale, not every arbitrary
localized date format. This design decision does not replace exact candidate
validation or authorize shipment.

## Documentation basis

Queue implementation-order clarification: ordered-record leaves are independent
of Heads card leaves and may be authored on already accepted foundation main.
Do not copy unaccepted Heads source. The candidate's lab growth is subject to
the unchanged aggregate/individual guards; the held752,183-byte observation
measurement requires a separately reviewed packaging decision, not an automatic
per-widget cap increase. Production100,000 remains a review proposal until exact
candidate approval. This does not change privacy, semantics or acceptance gates.

The existing split application is retained rather than scaffolded anew.
[Official UI guidance](https://developers.openai.com/apps-sdk/build/chatgpt-ui)
supports standards-first bridge events and updates to mounted UI;
[the reference](https://developers.openai.com/apps-sdk/reference) identifies
compatibility globals as additive. Repository restart/evidence semantics take
precedence over generic monotonic-event examples.
