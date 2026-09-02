# SvelteKit route migration checklist

Decision0043's finite route inventory for `codex/u1-sveltekit-unified-app`.
All listed application routes now dispatch through actual Kit endpoints in source;
there is no old custom HTTP-router fallback. Only Fans uses a native Kit page.
Other UI endpoints serve existing packaged HTML; their iframe/native-renderer debt
remains separate from routing takeover. Exact independent/full acceptance and
shipment are pending. Final author evidence is105 focused tests/1466 assertions
and116 relocation checks under user-adopted Bun1.4.0; two payload manifests match.
Native close/finish events preserve generic request lease ownership without polling;
process-local adapter configuration preserves MCP body parity and endpoint limits.
This supports F08 without adding, removing or completing widget ledger IDs.

| Boundary | Existing methods and routes | Kit migration status |
| --- | --- | --- |
| Fans pilot | GET `/dashboard/fans`; POST `/dashboard/tools/call` | Native `dashboard/fans/+page.svelte` and `dashboard/tools/call/+server.ts`; focused author evidence, final acceptance pending |
| General | GET `/`, `/health`, `/widget` | Source implemented as Kit `+server.ts`; acceptance pending |
| MCP HTTP | GET/POST/DELETE/OPTIONS `/mcp` and `/mcp/*` | Kit `mcp/+server.ts` and prefix endpoint; author5 focused tests/47assertions cover GET SSE abort/DELETE/OPTIONS, negotiation and shared-consumer abort; final acceptance pending |
| Camera signaling | POST/DELETE/OPTIONS `/media/camera.webrtc` | Kit `media/camera.webrtc/+server.ts`; ticket/header/role/service semantics retained, acceptance pending |
| Dashboard directory | GET `/dashboard` and `/dashboard/` | Kit-served directory HTML; navigation remains acquisition-free, acceptance pending |
| Other focused pages | GET `/dashboard/{overview,progress,thermals,heads,jobs,job_history,queue,bed_mesh,camera}` | Kit `dashboard/[view]/+server.ts` serves existing packaged HTML/iframe; native UI migration remains open |
| Focused widget assets | GET `/dashboard/{fans,thermals,heads,queue,camera}_widget` | Kit exact widget paths; eight artifacts regenerated and focused author checks pass, final acceptance pending |
| Legacy Camera asset | GET `/camera-widget` | Source implemented as Kit `+server.ts`; acceptance pending |
| Lab directory | GET `/dashboard/lab` and `/dashboard/lab/` | Kit `dashboard/lab/+server.ts`; packaged synthetic HTML, acceptance pending |
| Lab views | GET `/dashboard/lab/{overview,progress,thermals,heads,jobs,job_history,queue,fans,bed_mesh,camera}`, each also accepting one trailing slash | Source implemented as Kit `+server.ts`; acceptance pending |
| OAuth discovery | GET `/.well-known/oauth-protected-resource`, `/.well-known/oauth-protected-resource/mcp`, `/.well-known/oauth-authorization-server`, `/.well-known/jwks.json` | Kit discovery/OAuth endpoints preserve configured basePath; acceptance pending |
| OAuth mutations | POST `/oauth/register`, `/oauth/token`, `/oauth/authorize/verify` | Kit OAuth endpoints retain existing authorization semantics; acceptance pending |
| OAuth authorization | GET `/oauth/authorize`, `/oauth/authorize/options` | Kit discovery/OAuth endpoints preserve configured basePath; acceptance pending |
| Isolated enrollment | GET `/auth/enroll`, `/auth/enroll/options`; POST `/auth/enroll/verify` | Kit auth endpoints plus isolated authorized listener adapter; public rejects all enrollment paths, acceptance pending |

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
shared-service entrypoint; widgets remain extra component build targets. Complete
integration requires independent route/role/lifecycle and relocation acceptance of
the implemented dispatch. Existing HTML renderers are explicit UI migration debt,
not a second HTTP router; folder-only moves do not prove integration.
