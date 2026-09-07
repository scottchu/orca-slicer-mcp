# 0056: Own visible spacing at the Smart summary boundary

Status: provisional private-Lab refinement, 2026-09-06.

The default's temperature-to-color gap remained larger than color-to-fan after
0055 established sequential rows. Per-reading two-line reserves and a noninteractive
44px floor were occupying the visible inter-attribute space.

Smart summaries use internal natural-height reading sizing with an 8px visible
value-bottom to next-label gap (within 1px). Actual wrapped text expands its reading;
empty font-relative structural tracks reserve the whole summary frame, with unused
space at the end. The generic Group accepts only internal single/double line row tokens;
the domain registry chooses the three-track structure. No hidden example content,
telemetry measurement, wire input or dynamic style is introduced.

All three Smart reading values use the same regular value token (1.25rem, 20px
at the default root size); label, title and status typography is unchanged. The
structural reserve uses that same value token rather than the old hero/quiet sizes.

This narrowly supersedes 0053/UI-003's per-reading fixed-viewport <=1px requirement
for Smart only. Its Card outer frame remains <=1px across loading, ready, unknown,
partial and acquisition error at supported widths/text scales. Internal reading
positions may reflow when real content wraps or becomes a neutral skeleton.
Explicit and other Demo compositions retain their reserved reading profile.
The summary-stack-v2 placement rule, order, spans, values and evidence remain unchanged.

Acceptance measures actual value and label boxes, including 320/390/1440px and
100/200% root text, legitimate decimal wrapping, error neutrality and fresh initial
error. The known extreme-decimal 320px/200% formatting limitation remains separate;
no new clipping, stale telemetry or acquisition authority is accepted.
