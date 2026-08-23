# M0 first-printer discovery handoff

## Current status

The product boundary, safety posture, roadmap, working requirements, and
continuity workflow are documented. No target printer or runtime has been
selected, and no product code exists.

## Completed work

- established a private GitHub repository and initial baseline;
- separated printer operations from the narrower OrcaSlicer framing;
- defined a trust ladder and four evidence layers;
- created stable working requirement IDs;
- opened M0 environment and protocol discovery as the active iteration.

## Changed paths

See the pull request delivering the continuity workflow. No runtime source,
printer configuration, or credentials are part of this iteration yet.

## Unresolved risks

- every target-environment field in `docs/environment.md` remains unknown;
- live command and Z-offset semantics are unverified;
- security and remote-access boundaries are undecided;
- the first notification channel is undecided.

## Next smallest action

Ask the user for the exact printer model, firmware, present connection method,
camera setup, candidate always-on host, notification destination, and whether
the first release must work outside the local network. Record those answers as
context, then verify the stable facts through read-only protocol discovery.

## Restart instructions

Follow `NEXT_AGENT.md`. Do not scaffold implementation or issue printer commands
until the target environment and read-only capability evidence are recorded.
