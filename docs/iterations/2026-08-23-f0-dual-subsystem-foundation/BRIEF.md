# F0 dual-subsystem foundation brief

- Iteration ID: `2026-08-23-f0-dual-subsystem-foundation`
- Date opened: 2026-08-23
- Working baseline: `ba18104`
- Status: active
- Subsystems and boundary: Orca Preparation, handoff boundary, and Printer Operations
- Current execution order: Printer Operations read-only discovery first; Orca
  Preparation remains pending and is not secondary

## Outcome

Correct the durable product contract to two peer subsystems, then identify the
first concrete OrcaSlicer and printer environments and a provisional handoff
that can be validated without guessing.

## Scope

- supersede the single-boundary product decision;
- align product, architecture, roadmap, requirements, and continuity records;
- inventory the exact OrcaSlicer invocation and profile environment;
- inventory the exact printer, camera, host, notification, and network
  environment;
- classify read-only Monitor, authorized Control, and unexposed Admin surfaces;
- define direct-query, subscription, freshness, reconnect, and surface-neutral
  application boundaries;
- define preparation provenance and distinct upload/start/session states;
- preserve authorization, privacy, and evidence boundaries.

## Requirements

Primary discovery targets: `PREP-001` through `PREP-003`, `ORCA-001` through
`ORCA-005`, `HANDOFF-001` through `HANDOFF-006`, `SESSION-001`, `OBS-001`
through `OBS-006`, `CAM-001` through `CAM-003`, `CTRL-001`, `SAFE-001`,
`DATA-001` through `DATA-003`, `AUTH-001`, `API-001` through `API-004`,
`ARCH-001` through `ARCH-003`, `ONTO-001` through `ONTO-002`, and `PORT-001`
in `docs/requirements.md`.

## Acceptance criteria

- current authoritative records describe the same two peer subsystems;
- OrcaSlicer is an adapter inside Preparation, not a later Operations adapter;
- prepared, uploaded, start acknowledged, and observed printing are distinct;
- a new accepted ADR supersedes decision 0001 without erasing its history;
- repository checks pass and a separate agent finds no unqualified old framing
  outside the superseded decision;
- Moonraker capabilities distinguish observed, advertised, and documented
  behavior without treating command discovery as authorization;
- MCP remains a replaceable surface around shared application use cases;
- implementation and hardware acceptance remain explicitly unclaimed.

## Explicit non-goals

- selecting a runtime or scaffolding either subsystem;
- slicing user models or creating production artifacts; non-mutating version,
  help, capability, and fixture discovery is allowed;
- issuing printer commands, G-code, or other mutating requests; redacted
  read-only connection and protocol discovery is allowed;
- deciding upload/start ownership without observed environment evidence;
- claiming that documentation proves software, protocol, or hardware behavior.

## Risks and unknowns

- actual OrcaSlicer automation capabilities may differ by edition and version;
- profile inheritance, embedded project configuration, and custom G-code may
  create safety or provenance conflicts;
- printer protocols may couple upload/start behavior to one vendor;
- a shared MCP facade could accidentally obscure subsystem ownership;
- the current LAN client is trusted by Moonraker, so upstream access does not
  establish product-level authorization;
- WebSocket transport works, but object subscription and reconnect semantics
  still need a compatible client test.

## Planned evidence

- repository contract and whitespace checks;
- terminology scan for superseded product claims;
- independent architecture and consistency reviews;
- redacted real-tool and read-only protocol discovery recorded here;
- `CAPABILITY_MATRIX.md` tied to the first printer protocol and evidence state;
- ontology, API surface, and hybrid monitoring decisions with static checks.

## Exit gate

The documentation correction is complete only when current records agree and
independent review passes. F0 discovery remains active until both concrete
environments and the provisional handoff have observed evidence.
