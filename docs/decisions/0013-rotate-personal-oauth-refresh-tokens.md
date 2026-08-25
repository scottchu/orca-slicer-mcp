# 0013 — Rotate personal OAuth refresh tokens

- Status: accepted for personal developer testing
- Date: 2026-08-25
- Owners: project maintainers

## Context

The first standard-HTTPS U1 connection completed authorization and could call
the three read-only tools. Its access token expired after 15 minutes. The
personal authorization server had advertised and implemented only the
authorization-code grant, so it returned no refresh token. A later Codex call
reported `oauth_refresh_token_missing`, and the phone's additional-access flow
could not reconnect the app. At the same time, public health, protected-resource
metadata, authorization-server metadata, and the unauthenticated MCP challenge
were healthy. This isolated the failure to session renewal rather than the MCP
server, Funnel, printer, or camera.

## Decision

Keep 15-minute audience- and scope-bound access tokens. Add opaque refresh
tokens that:

- are valid for 30 days from their most recent successful rotation;
- are bound to the registered client, exact MCP resource, and granted scope;
- cannot add scope during refresh;
- rotate after one successful use, including concurrent-replay rejection;
- are persisted only by SHA-256-derived lookup keys, never in plaintext;
- remain inside the owner-only personal OAuth state file;
- are removed after expiry.

Advertise `refresh_token` in authorization-server and dynamic-registration
metadata. Migrate version-1 OAuth state to version 2 while preserving the
signing keys, enrolled passkey, and registered clients. A fresh authorization
replaces older refresh sessions for that client and resource.

This renewal grant continues to authorize only `u1.monitor`. It does not add or
authorize upload, start, pause, resume, cancel, generic protocol, or G-code
tools.

## Consequences

- A newly linked Codex connection can renew access without repeating Face ID
  every 15 minutes.
- Connections created before this decision have no refresh token and must link
  once more after the repaired service is deployed. Existing passkey enrollment
  and registered clients do not need to be deleted.
- A lost refresh response or rejected replay requires normal reauthorization.
- Successful use extends the personal session by another 30 days. Local state
  deletion, passkey recovery, or client removal remains the revocation boundary
  for this prototype.
- This remains a one-user developer authorization server. Reassess it against an
  established identity provider before broader distribution.

## Validation

Require tests for version-1 migration, discovery and DCR metadata, initial token
issuance, hashed persistence, restart recovery, client/resource/scope binding,
rotation, sequential and concurrent replay, expiry, and authenticated MCP use
with a refreshed access token. Separately verify the deployed public metadata
and 401 challenge. Finally, reconnect once through the real host and observe a
successful call after the original 15-minute access-token lifetime; local tests
or public probes do not prove that host outcome.
