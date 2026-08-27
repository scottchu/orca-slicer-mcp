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
`.env` and `bunfig.toml` loading, embeds the widget resource, and replaces Bun
1.3.12's invalid emitted macOS signature with an ad-hoc signature for local
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

Plugin installation and upgrades take effect in a new ChatGPT or Codex task.
Existing tasks can retain the prior installed MCP process and widget resource
URI, so they are not an upgrade acceptance surface. The server keeps the
immediately preceding widget URI readable as a compatibility alias so already
rendered cards can recover their UI resource while users move to a new task.
Do not replace the portable relative runtime command with a machine-specific
absolute path to make an old task appear current.

This private repository currently has no license file. Do not describe or
publish an artifact as an open-source distribution until the owner selects a
license and repository ownership/dependency notices are reviewed. License
selection is a release gate, not an implementation detail to infer here.
