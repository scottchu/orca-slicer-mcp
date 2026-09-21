# Existing runtime refresh — 2026-09-21

## Scope and identity

The user explicitly requested a server refresh. This F0 maintenance slice
restarts both existing U1 services using the supported lifecycle command. It
does not deploy draft PR127 or adopt its offline toolpath experiment.

The clean source base and remote main were both
`d5cc3bda8c86b3ae93dc398fdc7db33db1841a56`. Comparison with deployed PR125
`1716867af057d55b2e170215126dff429f4d000f` found only ten documentation
files changed. The existing release
`20260912-1716867-pr125-20260912T005903-cfae3d` was retained without rebuilding
or installing application bytes. No new ADR or product direction is adopted.

Acceptance is both services restarted, loaded, healthy and integrity-matched,
with exact served assets and private configuration preserved. This does not
prove ChatGPT reconnection, widget behavior, printer state or physical outcome.

## Operator commands and observed results

The operator ran these commands in the isolated documentation worktree:

```sh
git status --short
git ls-remote origin refs/heads/main
git diff --name-only 1716867af057d55b2e170215126dff429f4d000f HEAD
uv run --no-project scripts/u1_service.py --help
uv run --no-project scripts/u1_service.py status
uv run --no-project scripts/u1_service.py restart --service all
```

Bounded `uv run --no-project python -` checks before and after the restart reused
the existing ServiceManager and u1_ship Operations preservation, static_contract,
check_static, check_security and verify helpers. They did not call shipping
execute or weaken its guards. The restart command exited zero. Public and
dashboard processes both changed and began on September 21 at 16:25:44 and
16:25:46 America/Toronto, respectively. Both were loaded, healthy and verified
at runtime 0.4.20 / schema 18 / observation 23 / Camera 18.

Both before and after checks passed 115 static checks and 117 security checks.
Environment, local configuration, stable OAuth signing and passkey identity,
routes and full service plist bytes were preserved. No operational phase
failed and no rollback occurred. Detailed runtime receipts remain private.
No authentication, Tailscale, printer-control or plugin-installation change
was performed.

## Independent verification

Commands run independently included `git rev-parse HEAD origin/main`,
`git status --porcelain`, the deployed-source `git diff --name-only` above,
and `uv run --no-project scripts/u1_service.py status`. The verifier used
`launchctl print` for each existing service domain and `ps -p` with
`-o pid=,lstart=,etime=` for the resulting processes. Bounded native curl
requests checked local `/mcp`, `/dashboard/` and the exact installed dashboard
CSS; separate ten-second curl requests queried Google and Cloudflare
DNS-over-HTTPS. Private domains and process identifiers are intentionally
omitted. Node filesystem/crypto checks compared protected files and the
served CSS hash with the release manifest.

At 20:27 UTC, the independent verifier repeated source/main comparison and
lifecycle status, inspected launchctl and process start times, and confirmed
both services restarted on the unchanged pinned release. Native curl checks
matched dashboard CSS to its manifest SHA-256, confirmed an unauthenticated
public MCP request returned 401 with the expected WWW-Authenticate header, and
confirmed the public dashboard route remained unavailable (404). Four protected
environment, plist and configuration file hashes were unchanged; operator
static/security receipts were corroborated. OAuth preservation covered stable
key and passkey identity fingerprints, not whole mutable authorization JSON
or every client/token record.

Independent Google and Cloudflare DNS-over-HTTPS queries both returned
Status 3 (NXDOMAIN) for the configured public hostname. Local native-curl
checks use the available private route and do not establish external HTTPS
reachability. The missing public DNS and ChatGPT reconnect outcome remain
unresolved; this refresh made no network or authentication change.

## Evidence boundaries

- Static/software: unchanged application inputs; existing PR125 release evidence
  remains scoped to its original checks. No new full build or regression pass
  is claimed for this documentation-only tail.
- Deployed service: supported both-service restart and operator health, identity,
  exact static-asset, security and preservation checks passed.
- Protocol/simulator, real printer and user outcome: no new acceptance claimed.
  In particular, a successful restart does not establish ChatGPT reconnect or
  external public reachability.

## Documentation closure

`git diff --check`, `git status --short` and `git diff --name-only HEAD`
confirmed a clean documentation diff limited to the five current records
and this new evidence file. An in-process Node filesystem check verified
16 required nonempty records, the unique CURRENT active iteration, the required
status-index headings and 98 relative links with zero missing targets across
the six changed files. No application, dependency, configuration or generated
asset file changed from source base `d5cc3bd`; retained application evidence
therefore remains bound to that unchanged input set and the final
documentation head. Independent review of the exact documentation candidate
is a separate delivery gate. No unaffected production suite was rerun.
