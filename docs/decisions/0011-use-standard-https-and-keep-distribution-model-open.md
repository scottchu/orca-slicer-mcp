# 0011 — Use standard HTTPS and keep the distribution model open

- Status: accepted for personal developer testing
- Date: 2026-08-25
- Owners: project maintainers

## Context

Decision 0010 selected a dedicated Tailscale Funnel origin on port 8443 for the
personal mobile status card. Public-edge probes reached that endpoint and its
OAuth metadata, but ChatGPT's New Plugin form failed before OAuth with
`Cannot connect to host ...:8443`. This separated general Funnel reachability
from actual OpenAI client compatibility.

The same Tailscale hostname already serves an unrelated root application on
standard HTTPS port 443. Tailscale Funnel supports longer, path-specific
handlers, but it strips the matched incoming prefix unless the proxy target
includes that prefix.

The user also clarified the intended longer-term use case: other printer owners
should be able to download and configure the product for their own network and
printer. That raises a product-distribution decision beyond the personal test.

## Decision

For personal developer testing, expose the U1 MCP and OAuth surface on standard
HTTPS port 443. Preserve the existing root handler and route only
`/.well-known`, `/oauth`, `/auth`, `/mcp`, and optional `/health` prefixes to the
loopback U1 service, retaining each prefix in its backend target. Set the public
base URL to the hostname origin without a nonstandard port.

Require an actual ChatGPT OAuth-discovery attempt in addition to local and
public-edge probes. Tailscale support for a port does not prove that an OpenAI
product will connect to it.

Keep the current implementation explicitly self-hosted: each printer owner
needs an always-on agent inside their LAN, but that agent may run on a desktop,
NAS, Raspberry Pi, or similar host. Each owner supplies a unique authenticated
public endpoint or another supported private connection.

Do not yet select the production distribution architecture. Evaluate at least:

- self-hosted endpoints, which minimize central infrastructure but impose
  per-owner networking and OAuth setup;
- one hosted MCP and identity service plus a per-owner outbound LAN connector,
  which provides one published plugin URL but creates hosted security,
  reliability, privacy, and operating responsibilities;
- OpenAI Secure MCP Tunnel for private development, noting that official OpenAI
  documentation says it does not support public plugin submission.

## Consequences

- The personal connection uses `https://<hostname>/mcp` with Server URL and
  OAuth in the New Plugin form.
- The unrelated port-443 root service remains in place; only exact U1 paths are
  added.
- The old port-8443 Funnel handler can be removed after standard-port validation.
- A downloadable self-hosted edition is not equivalent to a zero-setup public
  plugin. The local-agent requirement must be explicit in onboarding.
- A hosted production gateway remains a future product decision, not an
  implementation commitment inferred from this personal pilot.

## Validation

Verify public-edge HTTP 200 for health and both OAuth metadata documents,
HTTP 401 plus the correct protected-resource challenge for unauthenticated MCP,
preservation of the existing root handler, enrolled-passkey continuity, and a
successful ChatGPT New Plugin OAuth fetch on the standard-port URL. Record
authenticated tool inventory and iOS card rendering separately.
