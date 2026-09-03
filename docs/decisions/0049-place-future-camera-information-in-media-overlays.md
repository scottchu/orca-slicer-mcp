# 0049 — Place future Camera information in media-bottom overlays

- Status: user-selected future design direction; implementation and acceptance pending
- Date: 2026-09-03
- Owners: project maintainers
- Milestone: F0 / CAM-008, UI-004

## Context

Decision 0046 places Camera identity, state, measured FPS, and accepted-frame
time in a compact top header, with safe failure text at the bottom of the media.
During the entity-bound composition experiment, the user selected a different
future Camera composition: let the dynamic media remain primary and move the
current top-right information together with loading/error messaging into
bottom overlays inside that media.

This selection is a design constraint for a later Camera migration. No Camera
file, node, session, transport, control, or packaged Camera resource changes in
the presentation-AST experiment.

## Decision

For a future separately implemented and reviewed Camera composition, move the
information currently presented at the top right, plus truthful loading and
error messaging, into bounded bottom overlays within the dynamic media. Preserve
legibility, collision avoidance, media visibility, safe-area behavior, enlarged
text, keyboard access, and stable loading/error geometry. The exact grouping,
responsive stacking, contrast, and overlay treatment require rendered design
acceptance before implementation is considered complete.

This refines and supersedes decision 0046 only for the future placement of
Camera header information. It does not change Auto/Live behavior, safe error
vocabulary, host-acknowledged fullscreen, persistent media identity, frame/FPS
evidence, session ownership, controls, timeouts, privacy, read-only acquisition,
or any other Camera lifecycle and evidence semantics in decisions 0046 and 0047.

## Consequences

Requirements can preserve the selected direction without falsely claiming it
exists. Current deployed Camera presentation remains the accepted baseline until
a separate candidate is implemented, visually reviewed, independently approved,
shipped, and verified. The current T1 presentation AST remains Camera-free.

No printer control, authentication, Tailscale, service, resource registration,
deployment, or physical-device claim follows from this decision.

## Validation

A later migration must provide screenshot-first phone and desktop evidence for
known, loading, error, recovery, fullscreen, and mode/control states; test safe
bottom-overlay separation at supported widths and 200% text; retain exact
media/session identity and frame-derived status semantics; and obtain independent
source plus actual packaged/mounted-host acceptance. Physical Camera reliability
and user outcome remain separate gates.
