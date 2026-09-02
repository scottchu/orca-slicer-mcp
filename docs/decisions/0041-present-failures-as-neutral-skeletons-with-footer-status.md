# 0041: Present acquisition failures as neutral skeletons with footer status

Status: Accepted for implementation; not yet validated or deployed.

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
Live/fullscreen/PiP controls and connection ownership remain unchanged. This
does not integrate the separate Camera service feature checkpoint or increase
any package cap.

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
