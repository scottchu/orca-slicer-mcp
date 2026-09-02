# 0041: Present acquisition failures as neutral skeletons with footer status

Decision0042 supersedes this record's byte-cap preservation clauses: the user
explicitly authorized removal of repository individual/aggregate widget package
ceilings. Integrity/determinism/security and all shipping guards remain; earlier
sizes and blocked checks below are historical evidence, not renewed cap authority.

Status: PR89 deployed with scoped verification; C08 intermittent acquisition risk
remains open. The latest Camera icon-overlay correction is accepted for
implementation, with source migration implemented but new exact validation and
deployment pending. Current Camera Lab exceeds its unchanged byte guard; focused
size/focus work remains, without a cap, dependency, pipeline or service change.

Latest placement refinement: reuse existing animated `IconSegmentedControl`
behavior through generic common `Switch` for
Snapshot/Live/Auto as a compact icon-only overlay inside the Camera media's
bottom-right corner. Labels are tooltip/aria only. This supersedes the earlier
visible-text/full-width mode placement. Preserve44px targets, keyboard/focus,
reduced motion and no fullscreen overlap. Acquisition-error text remains beside
footer Refresh; service-owned modes, Auto fallback and read-only lifecycle are
unchanged. This does not authorize a reactive-class refactor, Progress or c6 work,
or any change to repository byte caps.

The user also adopts `src/lib/common/*` for all shared UI primitives, generically
named Button/Icon/Switch with props/variants for visual/content differences.
Consolidate the visual-only button/icon leaves; domain compositions and domain
icon mappings remain outside common. This direction is implemented in source with
acceptance pending, not a semantic-token rename or Camera service refactor. Shared migration
requires all eight packages/transitive consumers and existing AST guards under
one required full-regression owner; agent handoff alone is not a repeat-full trigger.

Explicit supersession: OBS-008/010/012/013/014, CAM-008, UI-001/003/004 and
the related UI-002/API-005 presentation clauses now follow this decision for
acquisition failure. Earlier0038 visible retained-error values/receipts and
floating notices are historical; its cache/epoch/order, renderer identity and
guarded Bed Retry focus contracts remain. Decision0039's inline color group and
44px target remain, with the hover-padding refinement below.

The latest user request supersedes decision 0038's visible retained-data error
presentation and the action-only footer clauses in OBS-008 and related widget
requirements. A settled acquisition failure presents static neutral skeletons,
not cached telemetry, and a persistent status adjacent to the existing footer
Refresh/Retry. Ready, loading and failure reserve the same public footer anatomy.
Transient Copy or local display-control rejection remains action feedback and
does not mask otherwise valid data. Empty, unknown and age-stale success remain
distinct from acquisition failure.

Internal cache, session epochs and ordering are retained. Mounted Bed renderers
and camera media keep lifecycle ownership while hidden, inert and inaccessible;
they cannot provide skeleton sizing text. Numeric rendered-region dimensions and
bounded structural row allocation may preserve layout across failure, with
resize/recovery cleanup. No private strings or fabricated DTOs size placeholders.

CAM-008 is narrowly refined: move the existing snapshot refresh into an always
present footer beside its failure status, rather than adding a second action.
Fullscreen/PiP authority and connection ownership remain unchanged. The resumed
user request requires fixed Snapshot / Live / Auto modes; Auto is the explicit
one-word public label. Snapshot stops continuous work and reads once. Auto reads
one snapshot at a time, scheduling the next read 1.5 seconds after completion;
actual deployed fallback receipts advance about every 2 seconds. Live failure
selects Auto immediately and masks retained media/time until a fresh image is
accepted and decoded. Choosing Live again from Auto retries Live; selecting the
current mode does not duplicate work. The three controls remain reachable during
failure/connection, with keyboard selection and no automatic focus stealing.
Local fullscreen/PiP rejection does not change acquisition state.

The implementation proposal keeps these effects in the real/synthetic Camera
services; components subscribe/render. Mode change, hide and disposal invalidate
old work, cancel owned timers and release owned peers/leases. In-document resume
preserves Auto rather than silently reopening Live; fresh presentations retain
the snapshot-first contract. No c6 source is integrated.

Two observed failures motivated the scoped source repair. Dashboard returns raw
answer/candidate/close acknowledgements whereas MCP wraps them in
`structuredContent`; only those three acknowledgements accept both existing
shapes. Frame/open validation and tool/authority contracts remain strict and
unchanged. A successful acknowledgement is not evidence of connected media.
After that repair, an actual mDNS candidate took 10,007ms while another candidate
completed in 2ms and a selected pair already carried decoded video. The existing
10-second supplemental-candidate deadline then closed healthy Live. Only a typed
candidate timeout may preserve an already-live stream, and only for the current
epoch/session, observed connected state and an accepted frame received less than
5 seconds ago. Invalid/rejected acknowledgements still fail; first-frame 8s,
stall 5s, disconnect 3s and candidate 10s deadlines remain. Late results cannot
clear failure or restore an old mode/session. No server, auth or network change
is part of this remedy. Author evidence and remaining gates are in VALIDATION;
authorship is not independent approval.

The compatibility boundary follows the standard structured result shape while
explicitly accommodating this repository's existing HTTP acknowledgements;
private media/signaling data remains outside model-visible results. See the
[official MCP tool-result contract](https://modelcontextprotocol.io/specification/2025-11-25/server/tools#structured-content)
and [OpenAI tool-result reference](https://developers.openai.com/plugins/reference#tool-results).
Camera Lab 80,000 and Live 100,000 raw-byte caps remain repository guards, not
asserted OpenAI limits. History introduced Lab's guard in `db7643f` and Live's
separate guard in `c9311eb` after an approximately 89.4k measured artifact; this
record grants no cap increase.

Heads keeps one inline swatch/whole-hex/16px Copy group. Balanced hover padding
may use the existing card inset without consuming text width, overlapping other
targets, reducing the accessible 44px target or clipping the focus indicator.

Acceptance requires route-specific ready/loading/initial and refreshed failure
geometry within 1px, including 320/390/desktop and 200% text; persistent adjacent
footer feedback; no visible or accessible failed telemetry; public static
skeletons; correct Retry/order/lifecycle recovery; and balanced Copy hover/focus
insets. Variable lists and long material labels need structural allocation
coverage. Software/synthetic evidence does not establish device or printer
acceptance. Auth, CSP, acquisition, dependencies and shipping guards are unchanged.
