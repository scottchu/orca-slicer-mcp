# 0005 — MCP is a replaceable inbound surface

- Status: accepted
- Date: 2026-08-23
- Owners: project maintainers

## Context

The first agent-facing interface is expected to be MCP, and the first runtime
may use Bun and TypeScript. Neither choice should define the Printer Operations
system itself. A later HTTP API, CLI, UI, automation worker, or extracted
monitor daemon must reuse the same concepts and policies rather than recreating
business logic around MCP tools.

There is also a plausible future split in which the persistent monitor runs as
an Elixir/OTP daemon while user-facing surfaces remain in another runtime. That
split is inexpensive only if the domain and monitor boundaries are explicit
before implementation.

## Decision

MCP is one replaceable inbound adapter. Domain ontology, application use cases,
safety policy, authorization, event semantics, and ports remain independent of
MCP and its transport.

All inbound surfaces, including MCP, HTTP API, CLI, and future UI or automation,
translate into the same application requests and receive the same domain
results. They do not call Moonraker directly and do not duplicate command or
authorization logic.

Define the monitor behind language-neutral ports and versioned event schemas.
It may begin in the same Bun process as the application and MCP adapter, then be
extracted to an Elixir daemon without changing domain meaning or public surface
semantics.

Use the vocabulary and categories in `docs/ontology.md`. Protocol-specific
types stop at adapter boundaries.

## Consequences

- MCP can be replaced or supplemented without rewriting the system core.
- Bun is compatible with the first implementation without becoming a domain
  dependency.
- Elixir remains a viable monitor-daemon implementation when supervision or
  multi-printer concurrency justifies extraction.
- Cross-process contracts require explicit schema versions, causal identifiers,
  freshness, and compatibility tests.
- Initial code carries small port-and-adapter boundaries even while deployed as
  one process.

## Validation

Architecture tests should reject imports from MCP, HTTP, CLI, Bun, Elixir, or
Moonraker adapters into domain modules. Contract tests should run the same use
cases through at least two inbound adapters before claiming replaceability.
Monitor extraction is proven only when an out-of-process test double or daemon
satisfies the same versioned contract without changing application tests.
