# SvelteKit route migration checklist

Decision0043 routing integration is independently accepted and deployed in PR93
`60cab967`, matching reviewed7a0d398. All listed application routes dispatch through
actual Kit endpoints; there is no old custom HTTP-router fallback. Only Fans is
a native Kit page. Other UI endpoints still serve packaged HTML/iframe, whose
native-renderer debt remains open. Required source/role/lifecycle and isolated
relocation checks passed; guarded deployment passed59 static/61 security checks.
Scoped served-UI behavior is separately recorded in active VALIDATION.

Bun1.4.0 native close/finish events preserve generic request lease ownership without
polling. MCP body parity,128KiB endpoint limits, role/auth and URL contracts remain.
The table records routing shipment, not real-printer, phone or onboarding acceptance.
It does not add/remove widget ledger IDs or complete all native widget migrations.

| Boundary | Existing methods and routes | Kit migration status |
| --- | --- | --- |
| Fans pilot | GET `/dashboard/fans`; POST `/dashboard/tools/call` | Native `dashboard/fans/+page.svelte` and `dashboard/tools/call/+server.ts`; native page/shared-service routing shipped PR93 |
| General | GET `/`, `/health`, `/widget` | Kit `+server.ts` routing shipped PR93 |
| MCP HTTP | GET/POST/DELETE/OPTIONS `/mcp` and `/mcp/*` | Kit `mcp/+server.ts` and prefix endpoint; routing shipped PR93; independent software/protocol coverage includes GET SSE abort, negotiation and shared-consumer isolation |
| Camera signaling | POST/DELETE/OPTIONS `/media/camera.webrtc` | Kit `media/camera.webrtc/+server.ts`; routing shipped PR93 with ticket/header/role/service semantics retained; actual Live reliability remains C08 |
| Dashboard directory | GET `/dashboard` and `/dashboard/` | Kit-served directory HTML; routing shipped PR93; navigation remains acquisition-free |
| Other focused pages | GET `/dashboard/{overview,progress,thermals,heads,jobs,job_history,queue,bed_mesh,camera}` | Kit `dashboard/[view]/+server.ts` serves existing packaged HTML/iframe; native UI migration remains open |
| Focused widget assets | GET `/dashboard/{fans,thermals,heads,queue,camera}_widget` | Kit exact widget paths; routing and deterministic artifacts shipped PR93 |
| Legacy Camera asset | GET `/camera-widget` | Kit `+server.ts` routing shipped PR93 |
| Lab directory | GET `/dashboard/lab` and `/dashboard/lab/` | Kit `dashboard/lab/+server.ts`; packaged synthetic HTML routing shipped PR93 |
| Lab views | GET `/dashboard/lab/{overview,progress,thermals,heads,jobs,job_history,queue,fans,bed_mesh,camera}`, each also accepting one trailing slash | Kit `+server.ts` routing shipped PR93 |
| OAuth discovery | GET `/.well-known/oauth-protected-resource`, `/.well-known/oauth-protected-resource/mcp`, `/.well-known/oauth-authorization-server`, `/.well-known/jwks.json` | Kit discovery/OAuth endpoints routing shipped PR93; configured basePath preserved |
| OAuth mutations | POST `/oauth/register`, `/oauth/token`, `/oauth/authorize/verify` | Kit OAuth endpoints routing shipped PR93; existing authorization semantics retained |
| OAuth authorization | GET `/oauth/authorize`, `/oauth/authorize/options` | Kit discovery/OAuth endpoints routing shipped PR93; configured basePath preserved |
| Isolated enrollment | GET `/auth/enroll`, `/auth/enroll/options`; POST `/auth/enroll/verify` | Kit auth endpoints plus isolated authorized listener adapter; routing shipped PR93; public rejection retained, actual onboarding acceptance separate |

Braced lists enumerate existing names, not arbitrary route matching. Preserve the
existing MCP prefix contract and public/dashboard service roles; inventory entries
do not grant either role new access. New Kit `/_app/*` assets require an explicit
dashboard manifest allowlist and public rejection. Kit `__data` requests obey the
same route-role gate and must not acquire telemetry. Role rejection precedes static
serving. Preserve raw-target checks, body limits, abort/response completion,
shutdown cleanup, OAuth basePath and origin behavior through framework dispatch.

The Fans HTTP-page and widget host-RPC ports share presentation/controller semantics;
Kit routes and MCP entries share application services. Do not copy the probe's
synthetic acquisition on SSR into production navigation. MCP stdio remains a
shared-service entrypoint; widgets remain extra component build targets. Independent route/role/lifecycle and relocation evidence accepts the shipped
dispatch. Existing HTML renderers are explicit UI migration debt,
not a second HTTP router; folder-only moves do not prove integration.
