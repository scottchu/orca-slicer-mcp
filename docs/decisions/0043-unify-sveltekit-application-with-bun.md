# 0043: Unify the SvelteKit application while retaining Bun

Status: Accepted next direction after PR91; implementation and adapter acceptance pending.

Use one SvelteKit application at `plugins/u1-print-studio/app`, retaining Bun for
runtime/tooling. This is a repository choice, not a requirement to remove Bun,
adopt Node or introduce another framework. The nested `app/ui` project is not the
permanent architecture. A folder-only move does not satisfy this decision.

The target `app/src/components` owns UI and generic `components/common/Button`,
Icon and Switch primitives; props/variants express differences and domain
compositions stay outside common. `src/lib` owns pure TypeScript domain/services/
transport, with server-private code in `lib/server`. Actual SvelteKit API,
dashboard and Lab routes belong in `src/routes`. Preserve existing public and
private URLs, including `/dashboard/lab`, rather than renaming user-facing routes.
This supersedes the permanent nested static-app/folder assumptions in0032–0035
and UI-001/UI-003; the delivered `ui/src/lib/common` remains PR91's source layout.

Start with a real SvelteKit Fans page and its existing `tools/call` URL using one
shared service. Prove the route invokes that service through the framework;
relabeling folders or proxying every request forever is insufficient. Enumerate
remaining compatibility routes as a finite migration list and then integrate
the remaining routing. Widgets remain extra self-contained build targets from
shared components; the MCP stdio entry uses shared services without owning UI.

Preserve public/dashboard service roles, authorization/authentication semantics,
observation scope, MCP contracts, Camera's service-owned lifecycle and all existing
shipping/preservation guards. The installed MCP SDK's Web Standard transport
provides a path without requiring Node HTTP objects; adapter compatibility still
needs a bounded probe and is not accepted merely by this decision. No dependency,
runtime, service or routing implementation changes occur in this records tail.

Accept the pilot only with exact route/service and role-isolation evidence, shared
widget parity, relevant frozen regression and independent review. Complete routing
integration requires accounting for every remaining compatibility route. Keep C08,
Progress, the reactive Camera class discussion and the separate c6 checkpoint at
their existing scope; this direction does not complete those requests.
