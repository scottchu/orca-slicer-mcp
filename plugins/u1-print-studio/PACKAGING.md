# Local-first packaging contract

## Personal persistent HTTP adapter

The repository-only `$u1-ship` skill and `scripts/u1_ship.py` add decision
0028's guarded validate/merge/deploy/restart-both/verify workflow around the
lifecycle helper below. The independently reviewed workflow successfully
shipped PR34; the skill is not part of the distributed printer plugin.

Decision [0022](../../docs/decisions/0022-supervise-versioned-personal-http-services.md)
adds a separate personal deployment path: bundle the HTTP entry point and
exact public assets into an owner-only versioned release, copy/fingerprint the
existing Bun executable into that release, and reuse the two existing user LaunchAgents. This is
not the self-contained stdio executable below and does not change its portable
Marketplace manifest.

The local lifecycle tool stages, installs, reports status, starts, stops,
restarts, and rolls back only those known services. It preserves their private
env-file, environment values, OAuth state, logs, and existing routing. Stage
and readiness checks use fixture data or loopback health/static routes, never
implicit printer observations. Prior plist/release records remain recoverable.
The operator procedure and actual acceptance evidence belong in the active
iteration; accepted design alone does not prove deployment.

PR28 merged this workflow as `2160492a4ce63d1409673786ea02b253d7cfaace`.
The personal plugin was separately rebuilt/staged and installed as
`0.2.0+codex.20260831033612`; source/stage/cache standalone SHA-256 is
`c4029f18678e1839c0b005e37bc7401bf84bcc6ed7ef3d19155286253c2f018b`.
All production HTML and five skills match merged source. Signature and plugin
validation pass; the previous personal source remains recoverable locally.
This is installation evidence, not mounted-host or browser acceptance.

The implemented operator entry point is `scripts/u1_service.py`, always run
through `uv run --no-project`. Its default state root is
`~/Library/Application Support/U1 Print Studio/service`; `--state-root` accepts
an explicit absolute alternative before the subcommand. Stage requires a
clean, committed app source and a new release identifier:

```sh
uv run --no-project scripts/u1_service.py stage --source /absolute/repository --bun /absolute/bun --release RELEASE_ID
uv run --no-project scripts/u1_service.py install --release RELEASE_ID --dry-run
uv run --no-project scripts/u1_service.py install --release RELEASE_ID
uv run --no-project scripts/u1_service.py status
uv run --no-project scripts/u1_service.py restart --service all
uv run --no-project scripts/u1_service.py stop --service dashboard
uv run --no-project scripts/u1_service.py start --service dashboard
uv run --no-project scripts/u1_service.py rollback --snapshot SNAPSHOT_ID
```

Replace placeholders with inspected local values, not values copied from
another machine. `start`, `stop`, and `restart` accept only `all`, `public`, or
`dashboard`; installation covers the two existing services together. Retain
the returned `rollbackSnapshot` identifier. Neither staging nor `--dry-run`
stops a service, but staging creates local release files.

A release contains `bin/bun`, `dist/server.js` and its emitted assets, the six
fixed production HTML assets under `public/`, an empty `bunfig.toml`, and
`manifest.json` with source revision, runtime/asset hashes, and expected health
versions. Release files are owner-readable, with owner execute only for Bun and
directories. The original Bun path is not required after the verified copy;
the release itself must remain present. `bun run bundle:server` provides the
standalone HTTP build command for source validation.

Install retains the explicit existing `--env-file`, preserves plist environment
and logging fields, disables ambient dotenv/bunfig loading, and preflights
effective auth/config paths before stopping either service. Relative private
state/config paths fail closed instead of silently moving state when the
working directory changes. Failed readiness restores the exact saved plists
and prior loaded states, or reports a recovery failure and snapshot identifier.

The initial rollout exposed an asynchronous `launchctl bootout` restart race.
The lifecycle tool now waits for the exact departing label to become absent,
bounded to 30 seconds, before starting its replacement; timeout reports
failure. The repair has 21 lifecycle tests and independent code approval.
Successful installation and service health are not proof of restart recovery;
actual post-repair controlled restart and dashboard-only SIGTERM/KeepAlive
recovery passed independently and are recorded separately in the active
iteration. Both services ended loaded, healthy, and integrity-verified with
private env/OAuth/config/routing and preserved plist fields unchanged. The
script-only repair does not change the deployed app
revision or its widget hashes.

Decision 0024's `public/dashboard-index.html` is imported as text and inlined
in the HTTP bundle; it is not a seventh required external release asset.
The fixed lifecycle asset inventory and its fingerprint verification stay
unchanged so previously staged releases remain valid rollback targets.

Private stable entries are `/dashboard/progress`, `/dashboard/thermals`,
`/dashboard/heads`, `/dashboard/jobs`, `/dashboard/job_history`, `/dashboard/queue`, `/dashboard/fans`,
`/dashboard/bed_mesh`, and `/dashboard/camera`. In the current source,
`/dashboard` and `/dashboard/` serve the same static widget directory with
implementation-coverage labels. It loads no observations, widgets, or camera
media. Source decision 0025 lists nine focused entries, with `/dashboard/jobs`
retained for Current Job and `/dashboard/job_history` separately exposing
unimplemented history. PR38 is deployed as
`20260831-b565eec-pr38-20260831T130407-2e3c85`, serving the nine-entry directory
at runtime 0.3.5/schema 7/observation-v5/camera-v7. Both services are restarted
and verified; earlier PR34 evidence separately confirms read-only Bed Mesh acquisition.
Source merge alone never updates loaded services.
The HTTP overview route stays absent; the MCP overview
view stays explicitly deferred. Public dashboard routes remain unavailable. Every process shares
one observation store across its HTTP calls, not across other services or
restarts. A cold store acquires its first observation on demand; later plain
reads use the cache and explicit due refreshes coalesce. User login and host availability are dependencies; automatic
login/power settings, a root daemon, and log rotation are not part of this slice.

## Portable stdio distribution

Marketplace, Homebrew, and npm are delivery adapters around one executable and
one onboarding contract. This repository does not publish any of them.

| Channel | Runtime payload | Setup | Verification |
| --- | --- | --- | --- |
| Marketplace | platform executable staged at `app/runtime/u1-print-studio` | `u1-print-studio setup` | `u1-print-studio doctor` |
| Homebrew | the same platform executable | `u1-print-studio setup` | `u1-print-studio doctor` |
| npm | a platform package or launcher for the same executable contract | `u1-print-studio setup` | `u1-print-studio doctor` |

The current evidence supports an ephemeral macOS arm64 self-contained
executable built with `bun run bundle:runtime`. The build disables automatic
`.env` and `bunfig.toml` loading, embeds the current observation-v5 and
camera-v7 resources plus frozen legacy status and camera resources, and replaces
Bun 1.3.12's invalid emitted macOS signature with an ad-hoc signature for local
execution. Bun is a build and test dependency, not a runtime prerequisite for
that artifact. The read-only printer adapter currently invokes the platform
`curl` binary with a fixed route and argument allowlist; eliminating that
platform dependency is a separate runtime-hardening gate.

The ad-hoc signature is validation-only. Cross-platform binaries, Developer ID
signing, notarization, checksums, channel metadata, upgrades, rollback, and
actual installation are future evidence gates.

The source-tree `.mcp.json` remains a Bun-based developer adapter. A Marketplace
release stages the executable and copies the `.mcp.release.json` descriptor into
the staged plugin's required `.mcp.json` path; the Codex plugin validator does
not accept an alternate MCP descriptor filename. The release staging process
must not rewrite user configuration or require an environment file. Homebrew
and npm packaging must invoke the same `setup`, `doctor`, and `mcp` subcommands
rather than adding channel-specific onboarding logic.

`setup` accepts one private, link-local, or loopback HTTP(S) printer origin and
writes an owner-only versioned configuration file. It rejects credentials,
queries, fragments, non-root paths, and public hosts. `doctor --offline`
validates configuration and safety contracts without touching hardware;
ordinary `doctor` adds one read-only observation through the connector.
Repeatable `--stun-url` values are optional, bounded, stored in that same
owner-only configuration, and preserved by later setup rewrites. This is the
standalone Marketplace/Homebrew/npm path for explicit STUN because the runtime
does not load a repository `.env`. No STUN default is embedded. Public STUN is
an external privacy and availability dependency; authenticated TURN REST is the
preferred robust remote path and remains a separately provisioned server-side
deployment concern.

A same-machine personal Marketplace installation has now exercised this staging
contract. Publication, another-machine installation, Homebrew, and npm remain
unverified.

Every channel's `doctor --json` reports one runtime contract containing the
base runtime version, tool-schema version, observation-widget version, and
camera-widget version. The current source contract is runtime `0.3.5`, tool
schema `7`, observation widget `observation-v5`, and camera widget `camera-v7`.
These versions match the verified PR38 service rollout; documentation-only
records need no redeployment of unchanged application bytes.
Observation-v4/v3/v2/v1 and camera-v6/v5/v4 remain current-asset aliases.
The expanded closed enum has nine values; two model-visible/eight app-only tool
counts are unchanged. Fourteen resource URIs retain current/frozen compatibility.
The optional personal HTTP service returns the same contract from `/health`.
Upgrade verification must compare these values with the intended source before
asking a user to test a fresh task; process liveness alone is insufficient.

Plugin installation and upgrades require a newly loaded MCP process. Existing
tasks can retain the prior process and widget URI, and one observed Codex
Desktop process retained them even after a new conversation. Fully quit and
relaunch a host that predates the install before upgrade acceptance; a new task
alone is not sufficient evidence. The source server exposes
`observation-v4`, `observation-v3`, `observation-v2`, `observation-v1`, and `camera-v6`/`camera-v5`/`camera-v4` as current-asset aliases
while fresh descriptors advertise observation-v5 and camera-v7.
For mounted-task compatibility it also preserves exact legacy bytes for status
v4/v3 (`57,450` bytes, SHA-256
`da9625f5832a4df4e34312999326d241299ed6de9bd4073a60d699d4478db437`)
and camera v3/v2/v1 (`33,725` bytes, SHA-256
`c8ef35062ae004ac571501ed99f2810465aa0e12cddbe965918b84d30b476203`).
The legacy status tool aliases are app-only and must not expand the exact two
model-visible presentation intents. Do not replace the portable relative
runtime command with a machine-specific absolute path to make an old task
appear current.

The pre-integration decision-0021 source build emitted `dist/stdio.js` at SHA-256
`be255f625137079a64b17031b36ffb5e2ba4a46264e6ac56679448bcb04fac16`
and the macOS arm64 `dist/u1-print-studio` at SHA-256
`062e7cf9c826198db82457401ea8b28aae8eaa347b2485e245556fdc04971ddf`.
Its current observation and camera assets hash to
`128975091b192369a83476f5d8664da494d4d4fa968ef5e7fc29fe730fd51d3f`
and `2cc7c28f7d692ff7880bfc5cd400d2032b05765ce1bb142ea5dac205c349bc8b`.
These are ignored local static/software artifacts only: no release staging,
installation, service restart, or publication occurred.

This private repository currently has no license file. Do not describe or
publish an artifact as an open-source distribution until the owner selects a
license and repository ownership/dependency notices are reviewed. License
selection is a release gate, not an implementation detail to infer here.

The camera fan-out implementation adds the MIT-licensed pure-TypeScript
`werift` dependency to the bundled runtime. It does not add a normal-user
daemon or package-install step, but `werift` and its transitive dependency
notices must be included in the ownership/dependency review before publication.
