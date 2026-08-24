# F0 dual-subsystem foundation handoff

## Current status

The product contract remains one product with two peer subsystems: Orca
Preparation and Printer Operations. A redacted LAN Fluidd/Moonraker target,
read-only status, WebSocket transport, and live snapshot have been observed for
Printer Operations. Upstream OrcaSlicer `2.4.2` and Snapmaker Orca `2.3.5`
were inspected locally. A later user-authorized Snapmaker U1 pilot sliced two
parts and completed a PETG print after substantial CLI debugging. No product
runtime exists, and Snapmaker Orca is not yet an accepted product backend.

## Completed work

- independent product and architecture agents audited the old single-boundary
  framing;
- decision 0003 supersedes decision 0001 while preserving its history;
- authoritative records are aligned to the peer-subsystem model;
- repository contract, shell syntax, whitespace, link, and terminology checks
  pass;
- independent product and architecture reviewers passed the repaired contract;
- decisions 0004 through 0006 separate API surfaces, keep MCP replaceable, and
  define hybrid snapshot-plus-subscription monitoring;
- the ontology and monitoring model define runtime-neutral ports, freshness,
  connection epochs, and a possible later Elixir monitor daemon;
- read-only Moonraker status, temperature, object, auth, webcam, and WebSocket
  evidence is recorded without issuing a command or G-code;
- repository contract, shell syntax, whitespace, Markdown links, and current
  terminology checks pass after reconciliation onto `ba18104`.
- hosted repository validation was removed; required checks run locally before
  delivery.
- the current execution order moved to Orca Preparation discovery after the
  user's redirect; this does not make Printer Operations secondary;
- `docs/orca-preparation-findings.md` records executable fingerprints, CLI and
  macOS limitations, profile precedence, Snapmaker boundaries, collaborative
  preview, and manual-support representations;
- requirements now bind visual review to exact backend and artifact revisions
  and distinguish support settings, enforcer or blocker volumes, facet paint,
  and designed breakaway geometry.
- `docs/logs/2026-08-23-snapmaker-orca-u1-petg-print-pilot.md` preserves the
  later pilot chronology, crash exits, recovered `T2` mapping, artifact hash,
  and distinct upload/start/observed-completion evidence;
- `docs/knowledge/snapmaker-orca-cli-preparation.md` promotes only provisional
  guards and defines repeated non-user fixtures as the gate before code, skill,
  or MCP work.

## Changed paths

See the branch diff. Repository guidance, Orca discovery, environment, scope,
architecture, roadmap, requirements, open questions, continuity records, and
the active iteration evidence are in scope. No runtime, user model, private
profile, generated G-code, printer address, or printer command is included.

## Unresolved risks

- the first product Orca backend is unselected; one Snapmaker Orca path worked,
  but repeatability, synthetic fixtures, GUI parity, support round-trip,
  estimates, and deterministic behavior remain untested;
- the pilot printer is a Snapmaker U1; remaining environment details are
  unknown;
- no reusable profile resolver, crash preflight, manifest generator, or G-code
  semantic validator exists;
- the observed `wipe_tower_filament` exit `139` and incomplete-filament tool
  collapse have not yet been reproduced with clean non-user negative fixtures;
- the current LAN client is trusted by Moonraker, so product authorization and
  network boundaries remain unresolved;
- WebSocket transport works, but object subscription, reconnect, and freshness
  behavior remain unverified;
- the observed camera frame was too dark for reliable diagnosis;
- manifest shape, compatibility checks, and upload/start ownership are open;
- one physical print completed, but product implementation, repeatable workflow,
  protocol, safety, and general user-outcome acceptance remain pending.

## Next smallest action

Use Snapmaker Orca `2.3.5` to run the synthetic two-object dry-slice fixture
defined in `docs/knowledge/snapmaker-orca-cli-preparation.md`. Record a new log,
then run the negative profile and `wipe_tower_filament` fixtures. Do not upload
or start them. Only after several runs distinguish stable guards from one-off
observations should reusable preparation code begin; skill and MCP packaging
come after that tested code.

## Restart instructions

Follow `NEXT_AGENT.md` and decisions 0003 through 0006. Do not infer that one
subsystem is secondary from the current execution order, and do not implement
or issue consequential actions before F0 discovery establishes the relevant
contracts.
