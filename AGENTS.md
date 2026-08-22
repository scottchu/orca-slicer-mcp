# Repository guidance

## Current phase

This project is in product discovery and foundation work. Do not treat the
provisional architecture as an implementation commitment.

## Working rules

- Treat a print session, not a sliced file, as the central product concept.
- Keep printer-specific behavior behind an adapter boundary.
- Separate observation, recommendation, authorization, action, and
  verification in both design and implementation.
- Default consequential or uncertain actions to explicit user authorization.
- Record product or architecture decisions in `docs/decisions/`.
- Add concrete acceptance evidence to roadmap milestones before marking them
  complete.
- Do not claim that simulation, mocks, or protocol tests prove safe behavior on
  physical hardware.
- Never commit credentials, camera recordings, local printer identifiers, or
  generated runtime data.

## Change workflow

Before a substantial implementation change:

1. Identify the roadmap milestone and open question it addresses.
2. State observable acceptance criteria and the relevant safety boundary.
3. Record a decision when the change commits the project to a product or
   architecture direction.
4. Implement the smallest end-to-end slice that can be verified.
5. Report simulated evidence and physical-printer evidence separately.
