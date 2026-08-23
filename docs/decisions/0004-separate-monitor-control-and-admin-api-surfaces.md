# 0004 — Separate monitor, control, and admin API surfaces

- Status: accepted
- Date: 2026-08-23
- Owners: project maintainers

## Context

Moonraker exposes observation, configuration, printer-control, and host
administration through one HTTP and JSON-RPC API family. HTTP method alone is
not a sufficient safety classification: a WebSocket subscription is logically
read-only despite requiring a request, while a generic G-code request can cause
arbitrary physical effects.

The first Printer Operations slice needs reliable observation without silently
acquiring control or host-administration authority. The current LAN client is
also trusted by Moonraker, so the upstream connection does not provide the
product's caller-authorization boundary.

## Decision

Classify API operations by consequence and expose three separate product
surfaces:

1. **Monitor:** an explicit read-only allowlist for status, capabilities,
   printer-object queries and subscriptions, camera metadata and snapshots,
   health, and selected history reads.
2. **Control:** explicit capability-aware tools for approved printer actions.
   Pause, resume, and cancel are the first candidates, each requiring user
   authorization, state preconditions, correlation, and post-action
   observation.
3. **Admin:** host power, reboot, shutdown, services, updates, credentials,
   configuration mutation, and similarly broad operations. This surface is not
   exposed in the first release.

Do not expose generic HTTP, generic JSON-RPC, or generic G-code passthrough
through MCP. File, queue, database, webcam-configuration, and account mutations
are writes even when they do not immediately move or heat the printer.

Monitor and Control may share an internal Moonraker connection, but they must
retain separate tool namespaces, policy checks, authorization, audit records,
and tests. Moonraker trusted-client status never substitutes for product-level
authorization.

## Consequences

- The first implementation can ship Monitor without linking control handlers.
- New Moonraker endpoints are denied until explicitly classified and added to
  an allowlist.
- A compromised or mistaken Monitor caller cannot submit G-code or reach host
  administration through a generic escape hatch.
- Control evidence remains distinct from observation evidence.
- Some convenient debugging operations require a local developer path rather
  than a production MCP tool.

## Validation

Static validation should prove that Monitor tools route only to the approved
read operations and that no generic passthrough exists. Later protocol and
hardware tests must show that Control enforces authorization, preconditions,
correlation, and post-command observation. Admin endpoints remain absent from
the first-release tool inventory.
