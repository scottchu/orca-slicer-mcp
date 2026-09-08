# Selected Smart direction in layout contexts — 2026-09-07

## User decision and current sequence

After viewing the images, the user selected proposal1 as an acceptable visual direction, then questioned
its width and how multiple cards would compose. This is direction selection,
not acceptance of its exact width, responsive behavior or implementation.

The authorized current round is three visual contexts of the same refined
direction1: a single card, two cards, and narrow-screen stacking. These are not
three new competing design directions. Present the contexts for user review,
then undertake any future implementation and independent verification under
the repository's existing workflow. This round changes no application code,
styling, build inputs or deployed service and creates no HTML application.

The prior [visual-direction evidence](2026-09-07-smart-visual-directions.md)
remains byte-preserved with SHA-256
`e1bd32b3d3fac126e8e0689d8f8a91498338de07739274b31e6eed6eccc82a96`;
its pending-selection state describes that earlier round. The prior
[comparison evidence](2026-09-07-dsl-widget-comparison.md) remains byte-preserved
at `fdcb0223cf89234f8a6965f65c418d1ae4c44f316a1d90854b6fba995d8c7473`.
Their existing source/package, Unknown, extreme-decimal, private-Lab, provisional
decision0056 and unpublished-WIP limits remain in force. PR115/runtime0.4.15
remains the recorded deployed baseline. Main and other worktrees are untouched.

## Ownership and evidence boundary

The design role owns the refined direction and three context prompts. The
coordinator orchestrates image generation and user review. The records author
only updates these durable records and preserves exact generated images and
metadata; it does not create designs, edit images or implement an app. A
separate reviewer checks concept content and the documentation/artifact tail.

Multiple-card concepts illustrate layout intent only; they do not add entities,
sources, controls, runtime multi-card composition or current DSL capabilities.
The current fixed-T1/four-leaf boundary remains unchanged. Generated images
cannot verify CSS width, responsive breakpoints, spacing, font size, state
geometry or physical behavior. Possible code-owned presentation/layout
contracts remain future work after user review, never implicit acceptance.

The records author read the current state/order/active iteration records and
ran `git status --short` plus SHA-256 checks before updating execution order.
The prior five modified current documents and two untracked evidence documents
were preserved. Exact generated-file identities and attributed review outcomes
are recorded below. All three contexts are delivered; layout review by the user
remains pending and implementation has not started.

## Delivered contexts and review

The coordinator generated single, double and narrow contexts sequentially,
reporting24.9s,23.2s and27.1s tool durations. Single used the selected proposal1
and actual browser comparison as references. Double/narrow used those same two
references plus the newly generated single image; their actual prompts include
the recorded consistency override. This third reference is generation guidance,
not evidence that the user accepted the refined single-card dimensions.

The records author copied all three original PNGs without editing or moving
them and verified source/copy SHA-256 equality, PNG signatures and file
dimensions with a Node filesystem/hash script. Local `image-manifest.json`
records actual reference hashes, prompt hash, selectedDirection1,
layoutReviewAccepted false and implementationStarted false.

| Context and logical image | Raster dimensions | SHA-256 |
| --- | --- | --- |
| Single: `01-single-card.png` | 1881x836 | `24f86f7daa7540fbcb5dbea86107ed6bcc35f9e5d0a9bc9c7b1a300caa75fad9` |
| Double: `02-two-cards.png` | 1881x836 | `7f9260e939cbfdef048a09746dc6196dcd87656d26300fc4c8d334c0af2f7878` |
| Narrow: `03-narrow-stack.png` | 1070x1470 | `acbc250552033fa1655eeb62e3417650fca3c02e37f70b875441d28e0c992902` |

The design author and separate `comparison_verify` reviewer inspected the exact
images. Both accepted them as same-direction layout intent: single leaves space
to its right, double places two copies side by side, narrow stacks two copies.
The latter two explicitly say `Layout copies · synthetic T1`. Every card retains
T1/Active, actual214.6°/target220°C,#E89B3C and Part cooling without field-name labels, nested
cards, added entities, actions or telemetry. Reviewer reports are retained
locally as `image-review.md` and independent `content-review.md`.

There are generated differences in card proportions, surrounding space,
typography and row rhythm; the images are not pixel-identical component
instances or a proven shared renderer. Prompted280px/150px/10px dimensions
remain intent, not CSS measurements or responsive acceptance. Natural width,
collection composition, divider and accessible-label contracts remain future
work. The next action is user review of these three contexts, not a repeat of
the earlier three-direction selection. No app, build, server or release ran.

Independent documentation/artifact verification by `comparison_verify` passed:
398 application/build/fixture inputs and4 preserved baseline files unchanged,
48 relative links valid, only8 intended WIP document paths, and all3 exact
source/copy PNG pairs with their2/3/3 actual references matching. The final
wording correctly records direction1 selected and width/layout review pending;
no image-stop instruction is inferred. The local `independent/docs-tail` report,
script and result retain the executed checks. This is the one-time record of
that completed tail; no full suite or product build was repeated.

The user subsequently accepted the layout direction for now and explicitly
parked further UI exploration and implementation; layout review is no longer
pending and the next non-UI task is unspecified. This is direction-level user
feedback, not implementation, runtime, physical or release acceptance.
