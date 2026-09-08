# 0058: Name printer tools by their result

- Status: accepted direction; implementation verification pending
- Date: 2026-09-08
- Scope: API-005/API-006 and O1 agent observation; UI work remains parked

## Decision

The user accepted `get_printer_snapshot` for the bounded telemetry and optional
image result, `open_printer_view` for the existing focused observation widget,
and unchanged `open_printer_camera`. Monitoring is a consumer workflow, not a
separate kind of snapshot. The focused view is not the private DSL.

This supersedes only the public names `get_print_monitor_snapshot` and
`observe_printer`. Neither retired name is registered or accepted as an alias.
There remain exactly three model-visible tools and six app-only helpers when
camera signaling is configured. `refresh_printer_observation` and the five
camera helpers keep their existing names and authority.

Inputs, outputs, u1.monitor enforcement, annotations, shared observation store,
run-token continuity, cancellation and image sanitation remain unchanged.
Internal monitoring use-case/schema names remain meaningful implementation names.
Runtime0.4.18/tool schema18 identifies the breaking catalog revision. Unchanged
widget bytes keep observation21/Camera17 and their existing resource URIs.
Maintained skills and callers adopt the current names; installed plugin caches
are not reinstalled by this change. A host with an old catalog must refresh its
normal MCP connection; old tool calls fail instead of silently changing meaning.

## Acceptance and boundaries

Both ordinary and OAuth catalogs must advertise only current names; retired
calls must fail without status or camera acquisition. Existing focused-view,
camera, scope, strict schema and widget-helper tests continue to pass. Generated
widget package verification must establish unchanged bytes before retaining URIs.
Independent exact review and all existing shipping gates remain mandatory.

This rename does not start monitoring, control the printer, extend DSL, or prove
physical completion, host refresh, phone behavior or long-duration monitoring.
The earlier one-shot snapshot evidence remains bound to PR119 and its old name.
