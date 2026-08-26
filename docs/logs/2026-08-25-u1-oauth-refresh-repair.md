# U1 personal OAuth refresh repair

- Date: 2026-08-25
- Scope: read-only remote Monitor authentication
- Evidence boundary: software and public OAuth protocol; no printer command

## Chronology

1. A Codex U1 status call failed before reaching a tool with `UNAUTHORIZED`,
   `oauth_refresh_token_missing`, and a reauthentication action.
2. The phone showed the additional-access sheet, but continuing produced
   `Failed to connect to U1 Print Studio`.
3. Fresh public probes returned HTTP 200 for health and both OAuth discovery
   documents. An unauthenticated MCP initialize returned the expected HTTP 401
   challenge. The service and standard-HTTPS Funnel route were therefore
   reachable.
4. Source inspection found a 15-minute access-token lifetime, metadata that
   advertised only `authorization_code`, and a token response with no refresh
   token. The earlier successful connection therefore had no renewable
   credential after access-token expiry.
5. The personal OAuth adapter was changed to advertise and implement rotating
   refresh tokens without changing the three-tool read-only surface or the
   `u1.monitor` scope.
6. The repaired service was deployed with the existing signing key, clients,
   and passkey preserved. The user then confirmed that the connection worked.
   This is immediate host evidence; it does not yet prove renewal after the
   15-minute access-token lifetime.

## Acceptance boundary

Local tests must prove state migration, hashed persistence, restart survival,
binding, rotation, replay rejection, expiry, and refreshed access to MCP. Public
probes must separately prove the deployed discovery and unauthenticated
challenge. The user must reconnect the existing host once because its old link
cannot acquire a refresh token retroactively. The user confirmed the repaired
connection works immediately. A successful host call after more than 15 minutes
is the final renewal outcome; it cannot be inferred from local tests or the
immediate call.
