# Existing ChatGPT connection recovery — 2026-09-21

## Scope

The user explicitly requested repair of the existing plugin connection.
The documentation source base is `9cb76c8e3fea78e32085e20929774395ef39dd27`.
This operational slice preserves the installed PR125 application, OAuth
registration and passkeys, unrelated routes and private dashboard. Draft
PR127 and its offline toolpath experiment remain isolated. Public-edge
reachability and observed ChatGPT reconnect are distinct acceptance gates.

## Existing-route reapply

At 20:40:40 UTC the operator ran:

```sh
tailscale funnel --bg --https=443 --set-path=/health http://127.0.0.1:8787/health
```

The command exited zero and the complete route configuration remained
byte-identical. This acknowledgement did not prove public publication. At
20:41:57 UTC independent Google and Cloudflare DNS-over-HTTPS queries still
returned Status 3 (NXDOMAIN) with no answers. No public edge or ChatGPT
reconnect success was established.

Independent source and local endpoint checks found the bare `/oauth` route
has no handler and its 404 is expected. Discovery advertises the standard-HTTPS
issuer, `/mcp` resource, `/oauth/authorize` authorization endpoint, POST
`/oauth/token`, authorization-code/refresh grants and S256. A bare `/oauth`
404 is not evidence that these actual OAuth endpoints are broken.

## Single publication transition

At 20:43:32 UTC the operator executed one independently reviewed transition
using the existing health handler:

```sh
tailscale serve --bg --https=443 --set-path=/health http://127.0.0.1:8787/health
tailscale funnel --bg --https=443 --set-path=/health http://127.0.0.1:8787/health
```

The second command was in cleanup/finally so the existing public setting was
restored even on failure. Both commands exited zero; the pair took 0.115 seconds.
Only the port-443 AllowFunnel flag changed temporarily. All TCP/Web handlers
remained intact, and the final entire configuration exactly matched its
pre-operation bytes. The existing application and OAuth state were untouched.

At 20:43:42 UTC Google public DNS changed from NXDOMAIN to Status 0 with answers.
Cloudflare still returned a negative cached result at 20:44 UTC, so propagation
was incomplete. These are before/after observations, not proof of the original
provider fault or its internal cause.

For both returned public relay addresses, bounded curl --resolve requests
retained normal certificate validation and returned health 200, OAuth discovery
200, protected-resource metadata 200, unauthenticated POST /mcp 401 and enrollment
404. The existing public root/dashboard probe returned 502 through an unrelated
preserved handler; it did not expose the private U1 dashboard, and no whole-edge
404 guarantee is claimed. Private relay addresses and configuration receipts
remain outside Git.

## Independent public-edge verification

At 20:44:07-08 UTC the independent verifier repeated bounded curl --resolve
requests through both Google-published public relay addresses, retaining the
configured hostname for SNI and normal TLS certificate validation. Health
returned 200 / runtime 0.4.20; both discovery documents returned 200 with the
expected issuer/resource endpoints. Unauthenticated POST /mcp returned 401
with its expected WWW-Authenticate challenge. Public /auth/enroll returned
404, and the expected bare /oauth 404 was confirmed. Google DNS-over-HTTPS
returned Status 0 and both addresses; Cloudflare still returned NXDOMAIN.

The verifier confirmed the final configuration exactly matched baseline and
all TCP/Web handlers stayed intact during the transition. Only the existing
port-443 AllowFunnel flag was temporarily removed and restored. The unrelated
public root/dashboard 502 does not show U1 dashboard exposure; the local U1
public-service dashboard route remained 404.

## Final preservation

At 20:45:04 UTC the operator ran a bounded `uv run --no-project python -`
check reusing the repository Operations.preserve and ServiceManager.status
helpers. Original environment/configuration, stable OAuth key/passkey identity,
routes and full plist bytes remained unchanged. Both services stayed healthy
and integrity-verified at runtime 0.4.20; this repair did not restart them again.
Authoritative `dig @nsN.dnsimple.com <configured-host> A +norecurse +time=2 +tries=1`
queries for N=1..4 returned correct public answers from three nameservers while
one still returned NXDOMAIN. The configured hostname is omitted for privacy.

## Acceptance and next action

A later bounded operator propagation check returned Status 0 from both Google
and Cloudflare DNS-over-HTTPS, and the previously failing authoritative
nameserver returned NOERROR with both public addresses. No further mutation
or restart occurred. At 20:47:31 UTC the independent verifier also observed
Status 0 and the correct public addresses from both Google and Cloudflare.
This supersedes the earlier partial-propagation state
for the checked resolvers; it does not claim every resolver globally updated.

Public-edge reachability is independently verified for the two published
relays, and DNS resolves across the checked resolvers. Actual ChatGPT
reconnect remains pending.
The primary asked the user to retry the existing Reconnect/sign-in flow; no
new registration, passkey reset or plugin installation was performed. The
next smallest action is the observed result of that reconnect.

Application code and deployment were unchanged. No printer query/control,
widget rendering or physical outcome was accepted by these endpoint checks.
Detailed runtime receipts and private addresses/configuration remain outside
Git. No unsupported internal publication-state field is used as causal proof.

## Documentation checks

`git diff --check` passed. `git status --short` and the scoped diff confirm
only five current Markdown records and this new evidence changed. An
in-process Node filesystem check resolved all 104 relative links across the
six files with zero missing targets. Application, dependency, configuration
and generated assets remain unchanged from the documentation source base;
no unaffected build, full regression or deployment was repeated. Exact
documentation review is a separate delivery gate.

## Subsequent user confirmation

The user later reported successful ChatGPT reconnection. The earlier pending
user-outcome gate is complete at the self-report layer; the primary then
received a separate request to implement live G-code Progress. This adds no
new OAuth operation or network/protocol verification.
