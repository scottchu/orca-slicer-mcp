# Next agent

Resume from repository records, not chat history.

## Read first

1. `AGENTS.md`
2. `PROJECT_STATE.md`
3. `docs/requirements.md`
4. `docs/iterations/CURRENT` and every file in that iteration
5. decisions 0014, 0015, and 0016
6. `plugins/u1-print-studio/PACKAGING.md`
7. `docs/u1-print-studio-plugin-architecture.md`

## Current execution order

The user-directed priority is the local-first open-source U1 Print Studio
rollout under F0. Decision 0016 is the current architecture record.

Delivery is pull request https://github.com/scottchu/orca-slicer-mcp/pull/15
from branch `scottchu/local-first-rollout`.

The implementation is a desktop-local read-only connector. A normal user must
not need Tailscale, MagicDNS, public DNS, manual OAuth, environment-file
editing, or Bun. Do not restore the stale direct-HTTP hosted widget path from
decision 0015.

## Current implementation

- `u1-print-studio setup` writes one owner-only local config containing a
  validated private printer origin.
- `u1-print-studio doctor --offline` checks the configuration and safety
  contract without hardware access.
- `u1-print-studio mcp` starts the desktop stdio connector.
- The hosted widget contains no `fetch(` call and declares empty external CSP
  domains.
- Live offer, answer, ICE candidates, and close use MCP Apps `tools/call`.
- The connector alone invokes the U1's fixed Printer Operations adapter.
- The WebRTC application service owns opaque sessions, peer-ID hiding, input
  bounds, concurrency, duration, expiry, abort, and close.
- Snapshot fallback and the existing 1200 by 1500 PNG remain intact.
- The standalone dashboard may retain the exact HTTP signaling adapter for
  development compatibility.
- `.mcp.release.json` points to a staged self-contained executable; the source
  `.mcp.json` remains a Bun/env-file developer adapter.

Model-visible tools are exactly:

1. `show_u1_status`
2. `get_u1_status`
3. `get_u1_camera_frame`
4. `open_u1_camera_stream`

App-only tools are exactly:

1. `answer_u1_camera_stream`
2. `add_u1_camera_ice_candidates`
3. `close_u1_camera_stream`

All are read-only. Stop if upload, start, pause, resume, cancel, G-code, generic
proxy, Control, or Admin behavior appears.

## Validation boundary

The active iteration's `VALIDATION.md` records the exact commands. The current
software suite has 49 passing tests with 275 assertions. The macOS arm64
standalone runtime builds with dotenv/bunfig autoload disabled, receives a
validation-only ad-hoc signature, prints help, writes a `0600` configuration,
and passes offline doctor without Bun on its invocation path.

This proves local static/software and simulated protocol behavior only. It does
not prove:

- a Marketplace, Homebrew, or npm installation;
- production signing, notarization, update, or rollback;
- an owner-selected open-source license or third-party notice review;
- another OS or architecture;
- a mounted desktop or mobile MCP App;
- real-printer connectivity or browser playback;
- physical safety or user outcome.

No physical printer was contacted for this rollout.

Independent pre-merge review added regressions for rewriting a previously
broader-permission config and for closing a valid camera session when the rest
of its stream envelope is malformed. Both fixes are included in the passing
suite.

## Next smallest action

First review the delivered pull request and confirm all repository checks still
pass. Then choose one evidence-backed follow-up:

1. create a reproducible signed/notarized macOS packaging fixture without
   publishing it; or
2. remove the platform-`curl` runtime dependency while preserving fixed
   routes and macOS local-network behavior.

Do not publish, update an installed plugin, mutate a marketplace, or contact a
printer without a new explicit user request. If the user authorizes mounted
host or printer validation, keep host rendering, read-only protocol evidence,
physical-printer evidence, and user outcome in separate records.

## Preserve

- Orca Preparation and Printer Operations remain peer subsystems.
- MCP, CLI, and optional HTTP are inbound adapters around shared application
  policy.
- Status, snapshots, live signaling, and this connector's printer operations
  remain read-only.
- Observation, recommendation, authorization, action, and verification remain
  distinct.
- Slicing, artifact validation, upload, start acknowledgement, observed
  printing, and physical acceptance remain separate evidence.
- Tailscale and personal OAuth may remain optional developer adapters, never
  normal-user requirements.
- Repository records are durable project memory.

## Copy-paste restart prompt

```text
Resume this repository from AGENTS.md, PROJECT_STATE.md, NEXT_AGENT.md,
docs/requirements.md, the active iteration, and decisions 0014 through 0016.
Treat the local-first read-only connector and MCP Apps tools/call signaling
bridge as the current F0 execution order. Do not reintroduce direct iframe
fetches, normal-user Tailscale/OAuth/env/Bun requirements, printer controls, or
generic proxy behavior. Run local validation only. Do not publish or contact a
physical printer without fresh explicit authorization.
```
