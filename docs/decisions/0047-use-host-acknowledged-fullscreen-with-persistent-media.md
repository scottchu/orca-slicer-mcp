# 0047 — Use host-acknowledged fullscreen with persistent media

- Status: shipped in PR106 at0660a07; installed-byte scoped checks PASS; actual-host acceptance pending
- Date: 2026-09-03
- Owners: project maintainers
- Milestone: F0 / CAM-008; delivery ledger C01

## Context

After PR104 the user reports that fullscreen still fills only the widget while
other delivered UI works. PR104 used native fullscreen or local CSS, with no host
presentation request. Filling an iframe cannot establish that the host granted a
larger presentation. This decision supersedes the fullscreen-only restriction in
0046/CAM-008; its Auto/Live, error, lifecycle and current-only resource contracts
remain intact. C08 intermittent phone Live is a separate unresolved outcome.

## Decision

Preserve the interactive-decoupled Svelte application. Hosted display negotiation
uses the existing HostRpc standard `ui/request-display-mode`: request `fullscreen`
to enter and `inline` to exit, with subscription to partial host display-context
updates. Do not create another transport or put host/lifecycle ownership in the
Camera component.

A presentation service in `src/lib/client` owns display state, capability context,
one pending bounded request and disposal. `Video` subscribes and renders that
state. Only an actual response or notification establishes the granted mode;
requested mode is not optimistic success. A host may decline or grant a different
mode. Partial context updates preserve fields they do not replace. No fake
CSS-only host fullscreen state is allowed. The media becomes fixed only after
an actual host fullscreen grant. Suspend intrinsic card-size notifications while
fullscreen is granted, then emit one resumed intrinsic measurement after actual
inline return; pending requests alone do not change that policy. Preserve the
same video element rather than remounting or reparenting it.

Host-driven exit must update the control. Exit remains reachable during Camera
loading/error. Explicit action focus may be managed, but notifications cannot
steal focus. Rejection, timeout and late/disposed work do not reconnect media,
replace the persistent video DOM, alter Camera session state or change Auto
polling timers. Display negotiation causes no extra printer/media acquisition.

Standalone/dashboard/Lab use native fullscreen only when document state confirms
it; otherwise the action is unavailable or reports rejection. Local CSS expansion
cannot masquerade as a native or host grant. Existing PiP remains an independent
same-document native operation on the same video element.

Host-owned composer/chrome may remain in fullscreen. The accepted outcome is the
host's acknowledged presentation mode, not an OS-wide screen guarantee. No new
authentication, network, printer control or plugin installation follows from this
decision. Preserve private metadata and all shipping/security/preservation guards.
Current widget resources remain exactly two; do not restore retired aliases.
PR106 deploys runtime0.4.12/schema16/observation18/Camera14 with BOTH service
restarts and exact integrity checks. Actual-host acceptance remains separate.

## Acceptance and evidence

Focused service/bridge tests must cover granted and differently granted modes,
partial context updates, host-driven exit, pending request bounds, rejection,
timeout, disposal and late messages. Verify fixed media and suspended intrinsic
size notifications only after grant, with one resumed update after inline.
Camera consumer checks must show the same
video/session and unchanged acquisition/timer ownership through enter/exit and
failure; focus changes occur only from explicit actions. Loading/error retains
Exit access. Native-only consumers need document-state success/rejection coverage.

Test real packaged MCP resource HTML through the shared bridge, including narrow
views, and separately record actual-host grant/entry/exit. A synthetic host can
prove protocol/rendering behavior, not the phone's presentation. Required frozen
validation, independent exact review, u1-ship with BOTH restarts and scoped
installed-resource verification remain mandatory before claiming delivery.

The concurrent Progress body-inset investigation compares actual packaged MCP
and corresponding Lab layout; it is not a Progress redesign or evidence that
fullscreen repaired C08. Keep all55 ledger IDs and prior release/test failures.
