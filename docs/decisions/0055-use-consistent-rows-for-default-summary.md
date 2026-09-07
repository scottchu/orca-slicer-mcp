# 0055 — Use consistent rows for the default summary

- Status: accepted direction for the isolated private Lab; implementation acceptance pending
- Date: 2026-09-06
- Milestone: F0 / UI-003

## Context and decision

The default placed temperature on its own row, then color and fan side by side.
User review found that abrupt direction change hard to read. Their relationship
is membership in the same T1 summary, not an extra color/fan subgroup.

Replace Smart's default with registered `summary-stack-v2`: temperature, color,
and fan each occupy one full-width span-6 Row, in that order at every width.
The identity title/status group, information, appearance and spacing stay intact.
This supersedes decision0053's `summary-grid6-v1` placement algorithm. The old
literal is retired and rejected, never assigned new geometry. Both Smart and
Explicit report the new defaultRule; Explicit continues to record and honor its
authored spans/order with the intrinsic readability floor. No schema input,
canonical spec/hash, reader, domain relationship or vocabulary entry is added.

The default preview is identified as a stacked summary. Every other option is
labeled Demo, with plain help distinguishing capability demonstrations from the
default. The main explanation does not require understanding grid tracks or DSL.

Server ready resolution, client loading/error placeholders, strict resolved
schemas and envelope correlation agree on three Smart rows. Reject the retired
rule and the old mixed geometry carrying the new rule. Preserve explicit
2 + 2 + 2, source deduplication and all existing negative-input guards.

## Acceptance and boundary

At 320/390/720 widths and 100/200 percent text, Smart must keep three sequential
full-width readings, aligned icons/labels, atomic target/unit and fixed state
geometry within 1px. Explicit keeps its separate authored placement; geometry
parity between Smart and Explicit is no longer an acceptance condition.
Loading/error/partial/Unknown distinctions and no stale accessible telemetry
remain unchanged. Existing extreme-decimal narrow-text limitations remain a
separate formatting task. No real printer, authentication, network policy,
plugin install or production Lab registration is included.

Immutable resource becomes r6 / 0.0.8-provisional. Runtime and host versions stay
coherent at 0.4.15, observation-v21 and camera-v17 (schema16 unchanged); compiled
public metadata changes require renewed asset checks. Mandatory shipping and
independent exact review are unchanged. See the active iteration's
[default summary evidence](../iterations/2026-08-23-f0-dual-subsystem-foundation/evidence/2026-09-06-default-summary.md).
