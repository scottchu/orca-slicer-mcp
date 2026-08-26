# F0 dual-subsystem foundation brief

- Iteration ID: `2026-08-23-f0-dual-subsystem-foundation`
- Date opened: 2026-08-23
- Working baseline: `32762dd`
- Status: active
- Subsystems and boundary: Orca Preparation, handoff boundary, and Printer Operations
- Current execution order: implement the user-directed local-first open-source
  U1 Print Studio rollout before further host, preparation, or printer work.
  The smallest slice is a desktop-local connector plus hosted MCP App widget:
  all hosted status, snapshot, and WebRTC signaling requests cross the MCP Apps
  `tools/call` bridge, while printer access remains behind the Printer
  Operations adapter. Normal users must not need Tailscale, MagicDNS, public
  DNS, manual OAuth, environment-file editing, or Bun. Preserve the standalone
  exact-HTTP signaling adapter only as an optional developer path. Do not
  publish a package or contact physical hardware during this implementation.
  Orca Preparation discovery remains preserved and neither subsystem becomes
  secondary.
- Current evidence-maturation order: chronological journal, reviewed knowledge,
  thin workflow skills, the explicitly requested read-only status-view
  prototype, repeated host use and non-user fixtures, then a shared CLI only if
  it proves useful

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

Primary discovery targets: `PREP-001` through `PREP-006`, `ORCA-001` through
`ORCA-006`, `HANDOFF-001` through `HANDOFF-006`, `SESSION-001`, `OBS-001`
through `OBS-006`, `CAM-001` through `CAM-005`, `CTRL-001`, `SAFE-001`,
`DATA-001` through `DATA-003`, `AUTH-001` through `AUTH-003`, `API-001` through `API-004`,
`ARCH-001` through `ARCH-004`, `ONTO-001` through `ONTO-002`, and `PORT-001`
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
- decision 0016 records the local-first bridge direction and supersedes only
  decision 0015's requirement that a hosted widget signal through exact HTTP;
- the hosted widget has no LAN, Tailscale, or media HTTP fetch path and declares
  empty external connect, resource, and frame CSP allowlists;
- the local connector reaches only fixed read-only status, snapshot, and
  `webrtc-camerastreamer` operations through the Printer Operations adapter;
- application-owned WebRTC sessions expose opaque session IDs and bounded
  offer, answer, ICE-candidate, expiry, concurrency, and idempotent close
  semantics without exposing the printer peer ID or a caller-selected URL;
- the MCP Apps bridge is the hosted signaling path; the existing exact HTTP
  adapter may remain for the standalone developer dashboard but is not a
  normal-user dependency;
- snapshot fallback still works, the existing status/snapshot tool contracts
  remain read-only, and every `show_u1_status` result retains its 1200 by 1500
  PNG fallback;
- Marketplace, Homebrew, and npm packaging point to one setup and doctor
  contract. Setup writes validated local configuration without manual
  environment-file editing, and release packaging has a self-contained-runtime
  direction so Bun is a build-time concern rather than a user prerequisite;
- local tests prove the static/software and simulated protocol boundaries.
  They do not claim physical-printer, mounted-host, package-installation, or
  user-outcome evidence;
- no upload, start, pause, resume, cancel, G-code, generic proxy, Control, or
  Admin tool exists; no external package or service is published or changed.

## Local-first safety boundary

- This slice is Monitor-only and read-only with respect to printer and user
  data. Signaling may create and tear down only bounded in-memory presentation
  sessions.
- Hosted widget code receives no printer URL, Tailscale URL, printer peer ID,
  credential, or generic network target. Session capabilities stay in
  widget-private tool metadata and expire automatically.
- The connector accepts one validated private or loopback printer origin and a
  fixed operation allowlist. It does not expose arbitrary HTTP, JSON-RPC, file,
  shell, or G-code access.
- Setup and doctor must not probe hardware during repository validation.
  Physical-printer access requires fresh explicit authorization and remains a
  separate evidence layer.
- Packaging work ends at local manifests, scripts, and ephemeral validation
  artifacts. Marketplace, npm, Homebrew, hosted services, OAuth state, and
  installed plugins are not changed by this iteration slice.

## Initial explicit non-goals and later scope change

- selecting a runtime or scaffolding either subsystem;
- the original foundation pass excluded slicing user models and printer
  actions; a later explicit user request authorized one narrow slice-and-print
  pilot, now recorded separately without retaining private artifacts;
- future printer actions remain excluded without fresh explicit authorization;
- deciding upload/start ownership without observed environment evidence;
- claiming that documentation proves software, protocol, or hardware behavior.

## Risks and unknowns

- actual OrcaSlicer automation capabilities may differ by edition and version;
- upstream OrcaSlicer and Snapmaker Orca may accept the same CLI shape while
  producing edition-specific output or interpreting vendor project data
  differently;
- profile inheritance, embedded project configuration, and custom G-code may
  create safety or provenance conflicts;
- facet-painted support data is tied to exact mesh triangle identity and may be
  invalidated by remeshing;
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
- local upstream OrcaSlicer and Snapmaker Orca capability discovery with
  executable fingerprints and explicit unvalidated behavior;
- `CAPABILITY_MATRIX.md` tied to the first printer protocol and evidence state;
- ontology, API surface, and hybrid monitoring decisions with static checks.

## Exit gate

The documentation correction is complete only when current records agree and
independent review passes. F0 discovery remains active until both concrete
environments and the provisional handoff have observed evidence.
