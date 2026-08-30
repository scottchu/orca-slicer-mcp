# Local-first packaging contract

Marketplace, Homebrew, and npm are delivery adapters around one executable and
one onboarding contract. This repository does not publish any of them.

| Channel | Runtime payload | Setup | Verification |
| --- | --- | --- | --- |
| Marketplace | platform executable staged at `app/runtime/u1-print-studio` | `u1-print-studio setup` | `u1-print-studio doctor` |
| Homebrew | the same platform executable | `u1-print-studio setup` | `u1-print-studio doctor` |
| npm | a platform package or launcher for the same executable contract | `u1-print-studio setup` | `u1-print-studio doctor` |

The current evidence supports an ephemeral macOS arm64 self-contained
executable built with `bun run bundle:runtime`. The build disables automatic
`.env` and `bunfig.toml` loading, embeds the current observation-v2 and
camera-v4 resources plus frozen legacy status and camera resources, and replaces
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
camera-widget version. The current source contract is runtime `0.3.0`, tool
schema `5`, observation widget `observation-v2`, and camera widget `camera-v4`.
The optional personal HTTP service returns the same contract from `/health`.
Upgrade verification must compare these values with the intended source before
asking a user to test a fresh task; process liveness alone is insufficient.

Plugin installation and upgrades take effect in a new ChatGPT or Codex task.
Existing tasks can retain the prior installed MCP process and widget resource
URI, so they are not an upgrade acceptance surface. The source server exposes
`observation-v1` as a current-asset alias while the focused surface converges.
For mounted-task compatibility it also preserves exact legacy bytes for status
v4/v3 (`57,450` bytes, SHA-256
`da9625f5832a4df4e34312999326d241299ed6de9bd4073a60d699d4478db437`)
and camera v3/v2/v1 (`33,725` bytes, SHA-256
`c8ef35062ae004ac571501ed99f2810465aa0e12cddbe965918b84d30b476203`).
The legacy status tool aliases are app-only and must not expand the exact two
model-visible presentation intents. Do not replace the portable relative
runtime command with a machine-specific absolute path to make an old task
appear current.

The final source build emitted `dist/stdio.js` at SHA-256
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
