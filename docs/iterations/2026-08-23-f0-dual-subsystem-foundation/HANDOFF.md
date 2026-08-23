# F0 dual-subsystem foundation handoff

## Current status

The static product contract is corrected and independently reviewed in this
branch as one product with two peer subsystems: Orca Preparation and Printer
Operations. They are joined by an explicit prepared-job/session handoff. No
product runtime or environment evidence exists.

## Completed work

- independent product and architecture agents audited the old single-boundary
  framing;
- decision 0003 supersedes decision 0001 while preserving its history;
- authoritative records are aligned to the peer-subsystem model;
- repository contract, shell syntax, whitespace, link, and terminology checks
  pass;
- independent product and architecture reviewers passed the repaired contract.

## Changed paths

See the branch diff. The product contract, architecture, requirements, roadmap,
environment inventory, continuity records, and active iteration are in scope.

## Unresolved risks

- exact OrcaSlicer environment and automation behavior are unknown;
- exact printer environment and protocol remain unknown;
- manifest shape, compatibility checks, and upload/start ownership are open;
- all implementation, protocol, printer, and user-outcome acceptance is pending.

## Next smallest action

Gather the exact OrcaSlicer and printer environments through non-destructive
discovery and record the results in `docs/environment.md` and this iteration's
validation log. Begin with version/help/capability inspection; do not slice user
models, create production artifacts, or issue printer commands.

## Restart instructions

Follow `NEXT_AGENT.md` and decision 0003. Do not infer that one subsystem is
secondary from the current execution order, and do not implement or issue
consequential actions before F0 discovery establishes the relevant contracts.
