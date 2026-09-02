# 0038: Preserve widget structure through errors

- Date: 2026-09-01
- Status: accepted presentation direction; first Bed Lab implementation pending
- Milestone: F0 / UI-003 and UI-004

## Decision

Loading and initial acquisition failure retain the widget's own neutral
structure. Failure stops its loading animation and busy semantics; it does not
replace a chart-sized widget with a short error card. A compact persistent
notice occupies an existing non-flow overlay. Retry belongs in the existing
bottom action slot and remains keyboard accessible with a 44px hit target.
Do not reserve a guessed whole-widget height or derive skeleton templates from
private values to make geometry tests pass.

The shared WidgetStateSurface is controlled presentation only. Its content
subtree remains mounted across retained-state updates. Acquisition, retention,
retry scheduling, media tracks and renderer lifetimes stay with their existing
owners. A refresh failure preserves known data and its source receipt; it must
not restamp old data or recreate the renderer merely to show an error.
Successful empty/no-active data and unsupported capability remain distinct
from acquisition error. Static placeholders are not an assertion of empty data.

## All-route adoption (2026-09-02)

Apply this contract to every current Lab and served observation presentation,
including legacy generic/MCP aliases; the first Bed-only rollout was not global
completion. The route matrix in [widget-delivery](../widget-delivery.md) records
actual source/deployed coverage. Compare complete header/body/footer/shell
geometry. Initial failure keeps neutral metadata shapes too, while an existing
receipt stays visible and unchanged on retained failure. Unavailable capability
is explicit in the overlay without inventing a valid empty reading. Retry owns
its existing action slot; no acquisition is introduced into skeleton rendering.

For the four Svelte observation controllers, valid unavailable/unsupported
envelopes preserve last known/stale display evidence only within the same
non-null connection epoch. An independently retained latest acceptance receipt
orders later events even when the display receipt remains old. New or unknown
epochs and valid empty/unknown data never borrow an earlier connection's data.
Legacy focused envelopes require an explicit matching epoch for this same
retention; request rejection retains the existing mounted view. The older
combined status-v3/v4 format has no connection epoch: its notice describes only
the last accepted status in that mounted compatibility card, not session proof.
Camera-specific compatibility header/media adoption remains a separately
blocked track, not implicitly completed by these observation changes.

## First bounded application

Apply the foundation to Bed Mesh Lab only, using closed synthetic states and
the current chart/header/footer structure. Preserve mode controls, theme,
legend/grid and reported sample semantics. The Lab exercises initial failure
and retained-refresh failure without printer, RPC or network acquisition.
Other widget and production-error migrations remain separately tracked.
This supersedes the former short-card error presentation for this route only;
decision 0033's component, privacy and progressive-state boundaries remain.

## Acceptance boundary

Test loading/error/retry geometry at 320/390/590/720 and normal/200% text;
stopped error animation, truthful aria-busy and one announcement, accessible
retry/focus, retained renderer/data/receipt identity, no WebGL allocation for
initial placeholders, closed URL selections and cleanup. Shared defaults,
source-graph isolation and existing byte caps must hold. Synthetic software
evidence does not establish production RPC behavior or device acceptance.

## Successful Retry focus handoff

Independent UI/UX review selected a guarded focus handoff, not an enabled
no-op Reset or a global change to disabled-button semantics. In 2D, successful
Retry makes Reset native-disabled; only if the initiating Retry still owns
focus in the active document may focus move to the currently selected 2D radio.
Use explicit shared-leaf focus methods and prevent scrolling; do not click,
change mode, flash feedback or recreate the renderer. In 3D, the same enabled
Reset retains focus. Mode/phase changes, user focus movement or window blur,
cancellation, obsolete completion and unmount cancel recovery. Capture ownership
before the disabled-state DOM patch and check generation again after rendering.
Focus leases release their listeners on success, cancellation and teardown.
Targeted leaf/policy tests and real browser keyboard/no-steal checks cover this
contract; dispatching a blur event is not actual-device or OS-window evidence.
