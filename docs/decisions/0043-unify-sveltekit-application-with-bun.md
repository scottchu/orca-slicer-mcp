# 0043: Unify the SvelteKit application while retaining Bun

Status: Accepted and deployed in PR93. Independent source/software acceptance
covers the single-app routing and shared-service integration; only Fans is a native
Kit page. Other native-renderer work and actual-device/printer acceptance remain separate.

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
provides a Request/Response MCP core. Select official `@sveltejs/adapter-node`5.5.7's
generated handler under user-adopted Bun1.4.0, with a thin `node:http`-compatible
bootstrap for raw-target rejection, transport completion and shutdown. No Node
executable, second backend or extra HTTP framework is introduced. SvelteKit owns
the actual page/API/MCP routes; shared services own domain behavior.

The isolated author probe showed native `svelte-adapter-bun`1.0.1 normalized three
forbidden traversal targets before both request/platform inspection. The selected
handler passed12 checks and seven path observations after correcting response-before-
request-cancel cleanup for chunked413. Keep both failures as evidence. The probe
exercised bounded JSON MCP POST responses only; it does not establish production
SSE/GET lifetimes, full method/auth/role parity or application integration. See
active VALIDATION for commands, identities, scope and remaining gates.

The user installed Bun1.4.0; adopt that exact runtime for this candidate. Its
revision is `34cbb9a40b4bd1bd767d134a7065e66c2432a676`, binary SHA256
`539598c775882420b9d8deb7dc14d845f20f7d26f5600c50ab067dde6ac3f3bf`,
matching the checksum-verified official release. The same bounded disconnect probe
failed four of six cases on1.3.12 and passes six on1.4.0. Preserve that negative
evidence; do not restore the user-removed old runtime. Use native response/socket
close events, without polling or private runtime internals. Generic request lifetime
owns newly created Camera leases until HTTP finish or abort; finish transfers
ownership without claiming client receipt, media success or physical acceptance.

Preserve MCP request-body parity: baseline111470's StreamableHTTP SDK/Hono path
has no configured finite MCP body cap. Set supported adapter
`U1_KIT_BODY_SIZE_LIMIT=Infinity` in the bootstrap process before importing the
handler, using the adapter's `U1_KIT_` prefix. Do not edit user environment files or
LaunchAgents. The adapter's default512KiB would silently narrow that contract;
existing128KiB dashboard/OAuth/Camera endpoint readers remain mandatory. This is
protocol parity, separate from0042's package-byte-cap removal. The bounded12-case
probe tests up to1MiB and does not claim arbitrary-size practicality. See
[adapter-node body configuration](https://svelte.dev/docs/kit/adapter-node#Environment-variables-BODY_SIZE_LIMIT)
and active VALIDATION for source/runtime distinctions and exact reports.

Build isolation applies at both Bun process boundaries and the framework loader:
outer/nested build and test commands disable dotenv/bunfig autoload; Kit uses a
source-owned, guarded `.gitkeep`-only environment directory while Vite envDir is
false. Explicit runtime process/env-file behavior remains separate and unchanged.
No user environment file is edited or copied into build fixtures or releases.

Accept the pilot only with exact route/service and role-isolation evidence, shared
widget parity, relevant frozen regression and independent review. Complete routing
integration requires accounting for every remaining compatibility route. Keep C08,
Progress, the reactive Camera class discussion and the separate c6 checkpoint at
their existing scope; this direction does not complete those requests.
