# F0 dual-subsystem foundation handoff

## Current status

The product contract remains one product with two peer subsystems: Orca
Preparation and Printer Operations. A redacted LAN Fluidd/Moonraker target,
read-only status, WebSocket transport, and live snapshot have been observed for
Printer Operations. No product runtime exists, and Orca Preparation discovery
remains pending.

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

## Changed paths

See the branch diff. The hosted workflow, delivery guidance, continuity
records, and validation history are in scope.

## Unresolved risks

- exact OrcaSlicer environment and automation behavior are unknown;
- exact printer model and remaining environment details are unknown;
- the current LAN client is trusted by Moonraker, so product authorization and
  network boundaries remain unresolved;
- WebSocket transport works, but object subscription, reconnect, and freshness
  behavior remain unverified;
- the observed camera frame was too dark for reliable diagnosis;
- manifest shape, compatibility checks, and upload/start ownership are open;
- all implementation, protocol, printer, and user-outcome acceptance is pending.

## Next smallest action

Continue Printer Operations read-only discovery with a compatible object
subscription, reconnect behavior, exact model, host, notifications, and network
boundary. Then gather the OrcaSlicer environment and provisional handoff. Do
not slice user models, create production artifacts, or issue printer commands.

## Restart instructions

Follow `NEXT_AGENT.md` and decisions 0003 through 0006. Do not infer that one
subsystem is secondary from the current execution order, and do not implement
or issue consequential actions before F0 discovery establishes the relevant
contracts.
