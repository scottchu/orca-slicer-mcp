# 0022 — Supervise versioned personal HTTP services

- Status: accepted for the user-authorized personal service-persistence slice
- Date: 2026-08-30
- Owners: project maintainers

## Context

The focused widgets were handed off through temporary preview servers. Those
processes later stopped, leaving dead preview links even though the separate
personal HTTP services were supervised. The two existing user LaunchAgents
already request startup at login and recovery after termination, but execute
TypeScript from a mutable development checkout. The private dashboard also
defaults to the deliberately unavailable overview, and a new MCP server per
HTTP request creates a new observation store instead of reusing process state.

The user now authorizes merging the focused-widget work and making the existing
services persistent. Mac automatic login, power, sleep, system-daemon setup,
and unrelated services remain out of scope. Orca Preparation and Printer
Operations remain peer subsystems; this is a personal deployment adapter, not
a new product Admin surface or normal-user dependency.

## Decision

### Persistent entry points, on-demand printer work

- Reuse the exact two existing owner LaunchAgents for protected OAuth/MCP and
  the private standalone dashboard. Preserve their labels, environment,
  logging paths, authentication, and current loopback/Tailscale routing.
- Keep their existing `RunAtLoad` and `KeepAlive` policy. Do not add a root
  daemon, socket-activation broker, root privileges, or a new background
  monitoring loop. User LaunchAgents run within the logged-in user session;
  persistence does not imply boot-before-login or availability during sleep.
- Construct one observation store per HTTP service process. Inject that store
  into every request-scoped MCP server and the dashboard adapter. Explicit due
  refreshes share in-flight work and freshness across clients of that process.
  A cold store acquires its first observation on demand; plain reads after
  initial acquisition are cache-only until an explicit due refresh.
  Health checks and static HTML requests do not acquire printer observations.
- The two service processes and a separately host-owned stdio connector do not
  share memory. State is not durable across process restarts. A future shared
  monitor or database requires a separate decision; this slice does not claim
  globally one printer read or a persistent subscription.
- Camera remains snapshot-first and user-activated. Existing bounded leases,
  independent Close, last-viewer upstream release, and privacy boundaries are
  unchanged. A server restart can terminate active camera presentations.

### Stable focused private URLs

- The private `/dashboard` entry selects progress, not the deferred overview.
- Exact routes select `progress`, `thermals`, `heads`, `jobs`, `queue`, `fans`,
  or `bed_mesh` beneath `/dashboard/`. `/dashboard/camera` remains the separate
  camera presentation. Unknown routes and generic selectors fail closed.
- Each route mounts the same production widget and fixed read-only bridge;
  route selection is not a new data schema, printer request, or MCP tool.
- The protected public listener must not expose the private dashboard routes.
  No Serve/Funnel, OAuth, enrollment, firewall, or public URL change is needed.
- Unknown live mappings and overview remain unavailable as required by
  decision 0021. A stable route is not proof of a known printer value.

### Versioned local deployment and recovery

- Stage a bundled HTTP entry point and exact widget/host assets in an
  owner-only versioned release directory outside the checkout. Pin the existing
  Bun executable by copying it to release-local `bin/bun`, and record its
  fingerprint plus release-file hashes and source
  revision in a local manifest. No printer identity or secret enters Git.
- Keep deployment configuration outside the release; reuse the existing
  explicit env-file path without copying secrets into the bundle. Preserve
  OAuth state and every existing service environment value.
  Disable ambient dotenv/bunfig loading. Reject relative effective auth/config
  paths before any service stop so a new working directory cannot relocate
  private state silently.
- Provide a repository-local operator script for stage, install, status,
  start, stop, restart, and rollback, limited to the two known services. This
  is an authorized local deployment tool, never an MCP Admin command or generic
  service manager.
- Installation switches only the required executable/working-directory
  references after staging and validation. Retain exact prior plist/release
  records for recovery. Failed readiness must report failure and restore the
  previous service configuration, not leave a successful-install claim.
- Verify loopback health and the intended runtime/schema/widget versions,
  not just a listening PID. Static focused routes must also return the current
  host/widget bytes. Do not call printer status or camera tools as an implicit
  deployment health check.
- Reuse existing stdout/stderr logs. Automatic log rotation is deferred and
  must not be claimed as implemented by supervision alone.

## Consequences

The browser has stable private entry points independent of a task's temporary
preview lifetime. A checkout update cannot change the running release's code.
The existing process supervisor handles liveness while printer and camera work
remain demand-driven. Local deployment gains an explicit recovery procedure.

This is personal macOS deployment, not a signed/notarized public distribution.
The release-local pinned Bun copy, private configuration, user login, host power/network,
and existing routes remain dependencies; replacing the original Bun installation
does not remove the release copy. Existing host-retained MCP
processes may still require a full host quit/relaunch after plugin installation.
Public and private services each own their own cache and camera lifecycle.

## Validation

1. Fixed-route tests accept each focused private URL, select the exact view,
   preserve camera, default to progress, and reject unsupported routes. The
   public server continues to reject `/dashboard*`.
2. Distinct HTTP MCP requests reuse one injected store; due simultaneous
   refreshes coalesce and agree on observation version/source time. Dashboard
   injection uses the same application contract. Tests use synthetic readers.
3. Lifecycle fixtures preserve unrelated plist fields, environment, logs,
   labels, and routes; stage hashes, owner-only paths, pinned runtime,
   readiness, rollback, and failure handling are tested without live services.
4. Run the repository suite, type checks, relevant packaging/skill validation,
   and independent code/safety review before merging and installing.
5. After separately recorded authorized installation, verify exact runtime and
   asset fingerprints, both service states, loopback health/version contracts,
   static focused routes, and unchanged OAuth/routing evidence. A controlled
   restart is separate host-service evidence; crash, reboot, login, sleep,
   real-printer, mounted-host, and user-outcome claims require their own tests.

Reference: [Apple's launchd programming guide](https://developer.apple.com/library/archive/documentation/MacOSX/Conceptual/BPSystemStartup/Chapters/CreatingLaunchdJobs.html).
