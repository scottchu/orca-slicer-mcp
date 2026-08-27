# 0016 — Use a local connector and the MCP Apps bridge for hosted signaling

- Status: accepted for the F0 local-first rollout slice
- Date: 2026-08-26
- Owners: project maintainers

## Context

Decision 0015 moved live camera presentation from repeated JPEG requests to the
printer-advertised H264 `webrtc-camerastreamer`, but its hosted widget still
received an exact signaling URL and fetched it directly. The validated personal
developer path also required Tailscale Funnel, MagicDNS, public DNS routing,
manual OAuth, environment-file configuration, and a Bun runtime. Those are
useful developer adapters, not an easy normal-user installation boundary.

F0 still asks where the operations host and network boundary live, which
inbound surfaces can reuse the application core, and which distribution model
is supported by evidence. The user directed the next slice to be local-first
and open-source without publishing packages or contacting the printer.

## Decision

- Make a desktop-local connector the normal-user boundary for this F0 slice.
  It invokes only fixed read-only operations through the Printer Operations
  adapter; the widget never fetches or signals to a printer or private-network
  URL. Negotiated WebRTC media remains peer-to-peer as preserved from 0015.
- Carry hosted widget status, snapshots, WebRTC session creation, answers,
  ICE candidates, and close requests through MCP Apps `tools/call`. Use
  app-visible signaling tools for protocol steps that the model does not need
  to select.
- Keep WebRTC session policy in a transport-independent application service.
  It owns opaque session IDs, printer-peer-ID hiding, input bounds, concurrency,
  duration, expiry, abort, and idempotent release. MCP and HTTP remain inbound
  adapters and contain no caller-selected proxy behavior.
- Keep the exact HTTP WebRTC signaling path only as an optional standalone
  developer adapter when useful. Tailscale, MagicDNS, Funnel, and personal OAuth
  are never normal-user requirements.
- Preserve `show_u1_status`, `get_u1_status`, `get_u1_camera_frame`, snapshot
  fallback, the PNG result, and read-only annotations. Add no printer control,
  preparation, upload, start, file, G-code, generic proxy, or Admin capability.
- Provide one `setup` and `doctor` command contract for Marketplace, Homebrew,
  and npm packaging. Setup stores validated local configuration rather than
  requiring environment-file edits. Release packaging targets a self-contained
  executable; Bun may build and test it but is not a normal-user prerequisite.
- Implement and validate only local source, manifests, and ephemeral package
  artifacts in this slice. Do not publish or replace any installed or hosted
  service.

This supersedes decision 0015 only where that decision made exact HTTP
signaling part of the hosted widget path. It preserves decision 0015's WebRTC
media choice, read-only scope, application-policy ownership, fixed printer
adapter, bounded sessions, snapshot fallback, and separate mounted-host and
physical evidence gates.

## Consequences

- A hosted MCP App iframe has no direct LAN or Tailscale fetch and can declare
  empty external network CSP allowlists.
- Desktop-local use no longer needs a public endpoint, OAuth enrollment, DNS,
  or Tailscale. Cross-device use remains a separate future distribution and
  identity decision.
- The signaling lifecycle becomes testable once at the application boundary
  and reusable from MCP Apps and the optional exact HTTP adapter.
- Marketplace, Homebrew, and npm remain packaging adapters around one runtime
  and onboarding contract, but successful local packaging is not publication
  or proof of installation on another machine.
- Live media still flows over the negotiated peer connection. Software tests
  cannot prove printer reachability, native browser playback, or physical
  safety.

## Validation

Require local TypeScript and repository checks plus tests that prove:

- the hosted widget uses `tools/call` for every signaling step and contains no
  direct media-signaling fetch;
- CSP external allowlists are empty and private URLs and printer peer IDs never
  enter model-visible results;
- session creation, answer, bounded ICE candidates, expiry, concurrency,
  repeated close, and failure teardown are enforced by the application service;
- the optional exact HTTP adapter maps only its fixed route and signaling
  message allowlist to the same application service;
- signaling failure activates snapshot fallback;
- the existing read-only status, snapshot, and 1200 by 1500 PNG contracts pass;
- setup and offline doctor share one configuration contract, require no env-file
  edit, and an ephemeral self-contained runtime can be built and invoked without
  a Bun executable on its runtime path.

Record static/software and simulated protocol evidence separately. Do not
access a physical printer, publish a package, alter OAuth state, or claim
Marketplace, Homebrew, npm, desktop-host, iOS, or user-outcome acceptance.
