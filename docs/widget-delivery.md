# Widget delivery ledger

Current scope index, 2026-09-05. Preserve all 55 request IDs below. Their retained
status text records accepted work and explicit gaps; it is not a new runtime or
actual-device observation. [PROJECT_STATE.md](../PROJECT_STATE.md) owns workstream
status and [NEXT_AGENT.md](../NEXT_AGENT.md) owns maintenance-first execution order.

## Deployment and maintenance

PR106 remains the last accepted deployed release (runtime 0.4.12/schema 16,
observation 18/Camera 14) until exact maintenance shipping is verified. PR109 and
PR110 merged the isolated composable Lab and its records; no current widget was
replaced and no Lab production registration or deployment was accepted.

The user approved scoped reliability/shared-use-case/CSS maintenance before new
features. See the [current evidence index](iterations/2026-08-23-f0-dual-subsystem-foundation/VALIDATION.md).
Do not mark requests complete from source integration, health checks or synthetic
fixtures alone. Queue, Fans, Job History and C08 retain their stated gaps.
Historical route inventories and deployment narratives are preserved in the
[exact PR110 ledger snapshot](history/2026-09-05-pr110/docs/widget-delivery.md);
retired compatibility routes in those narratives are not current contracts.

## Complete request accounting


IDs preserve the independent history audit; acceptance/next action is explicit.

| IDs / request | Status and evidence | Acceptance / next smallest action |
| --- | --- | --- |
| F01 SvelteKit checked-in project | Partial:10 Lab routes/five focused Svelte views; four native pages through PR97; MCP Heads/Camera through PR99 | Reuse delivered UI/controllers/services after native Fans; noiframe page acceptance does not finish remaining views or domain features |
| F02 shared primitive composition | Common/Button/Icon/Switch shipped PR91; app-root components/common integration shipped PR93 | Preserve all-eight consumer/AST/security coverage; other raw-markup debt remains |
| F03 PercentageBackground + slight slope | Delivered: Thermals/Fans, 100-degree tint | Preserve exact ratio and truthful over-target numbers |
| F04 src/lib/ui vs src/components |0043 one app-root components/common and pure TypeScript lib separation independently accepted and shipped PR93 | Preserve generic primitives/domain composition boundary; native renderer migration remains F01 |
| F05 generic semantic tokens | Not started; --u1 tokens remain | Inventory consumers and controlled alias transition |
| F06 arrow functions | Adopted AGENTS | Apply to changed JS/TS; document genuine exceptions |
| F07 component-owned folders/services | Partial; PR89 delivers real/synthetic Camera service separation | Thin subscribers/renderers. CameraStream with $state is discussion only, not authorized or implemented; retain a framework-neutral service. |
| F08 whole server/MCP SvelteKit migration |0043 shared app/routing PR93; four native pages PR97; bounded MCP Heads/Camera cutover PR99 | Four native pages are deployed; remaining UI routes serve packaged HTML/iframe. Preserve URL/auth/role/MCP lifetime and relocation contracts |
| F09 self-contained widget HTML |0042 individual/aggregate byte caps removed, independently accepted and shipped PR91 | Preserve self-contained assets, CSP/security, integrity, determinism, minification and size reporting during0043 |
| U01 density/grouping/consistent language | Partial; author reproduces390px MCP body0 inset vs Lab18px from unmatched .u1-:host selector | Bounded .u1-body repair shipped in PR106;48 ready/error observations plus selected Progress320px/200% overflow/recovery pass. Retry→Refresh focus remains lost in both v17/v18 (unchanged legacy renderer); no focus recovery, full matrix, P01 redesign or broad cleanup claimed |
| U02 smaller Refresh visual | Not started in delivered shared component | Compact visible glyph/control, 44px accessible target |
| U03 small borderless Copy | PR89 deployed; scoped HTTPS served-byte verification PASS | One44px-high color-row target,16px glyph,8px symmetric inset; native clipboard acceptance separate |
| U04 swatch + whole hex same line | Deployed PR87; supersedes ADR0039 stacking | Atomic row keeps390normal two columns; preserve exact served behavior |
| U05 no orphan Copy row | Delivered PR84 | Preserve exact clipboard/busy/focus and zero-jump regressions |
| U06 Generic PLA + material icon | Delivered PR81/PR84 | Preserve full material and exact RGB/RGBA/empty semantics |
| L01 all loading states, no Waiting collapse | PR89 deployed across current Lab/focused/compatibility packages | Preserve explicit loading/failure route matrix; actual-device acceptance separate |
| L02 every Lab has controls/Camera | Delivered PR67/69 basics | Extend closed retained-error cases consistently |
| L03 fixed bottom Lab dock | Not started | Safe-area/reserved space, short viewport and 200% text/keyboard |
| L04 compact/medium/full + MCP size | Not started | Closed size contract with distinct information hierarchy |
| L05 all-widget stable acquisition-error presentation | PR89 deployed0041; source route matrix and scoped served-widget verification PASS | Static neutral failures, adjacent footer status, no stale telemetry; Camera-only0046 exception and current-route allocation/release shipped PR104; scoped installed-byte/synthetic Camera and Jobs behavior PASS. Retain resize/short-content/Retry guards and C08 risk |
| L06 variable list fixed height | Decision pending | Choose bounded scroll vs content height; do not infer from skeleton rule |
| C01 fullscreen video continuity | Active: user reports PR104 fullscreen stays widget-sized; host fullscreen integration requested | Require acknowledged host mode/entry/exit with no Camera reconnect; preserve interactive-decoupled app and allow host composer/chrome. No OS-wide promise. ADR0047 shipped in PR106; installed-byte scoped checks PASS; actual-host acceptance pending |
| C02 Camera in Lab and SvelteKit | Delivered PR69/71 | Does not imply latest service/status repair delivered |
| C03 connecting/disconnected icons/red dot | Source-only separate checkpoint c6cfb4e | Integrate separately and independently verify;0042 removes historical repo cap blocker |
| C04 consistent two/three status slots | aaaf0a56 independently accepted: default Auto, Auto/Live only,88px-by-44px icon Switch; no single-Snapshot or footer/Refresh | Quiet polling, edge-to-edge media, persistent bottom-left safe reason and bounded bootstrap/recovery accepted in source. PR104 deployed after profile repair/BOTH restarts; scoped installed-byte/synthetic Camera and Jobs behavior PASS. C08 reliability stays open |
| C05 Unsupported wording | Source-only display fallback clarification | Browser capability is not printer/camera offline |
| C06 connection lifecycle service | PR89 real/synthetic Camera service separation deployed | Service owns modes/connections/timers; components subscribe/render; no c6 source mixing |
| C07 same-live explicit Retry | Source-only c6cfb4e; author86 UI/12 Chrome | Independent/final integrated acceptance pending;0042 removes historical repo cap blocker |
| C08 served Camera still old | PR101 phone failure, one Live/30 FPS success after retries, then another failure with about 10 s before fallback. Reliability unresolved; exact URI/phase/root cause unconfirmed | PR101 bounded open/late-cleanup repair is independently accepted and deployed; scoped synthetic postverification passes; actual phone Live remains open. Retain attempts 1–12 and user-reported Bun permission allowance; local served-dashboard success did not reproduce phone failure. Safe failure-stage diagnostics/Auto presentation shipped PR104 with scoped synthetic postverification; actual phone reliability remains unresolved. Screen Sharing stays paused; require service-owned repair, decoded-frame proof and exact release gates before Live closure |
| P01 Progress local gradient/layer bricks | Not started | Adopt latest visual contract; no full-card tint or stale strip spec |
| P02 exact active-Gcode thumbnail | Not started | Bounded identity-correlated genuine image; no arbitrary URL fetch |
| P03 object layer-gradient rendering | Decision pending | Distinguish illustrative image fill from actual Z/layer geometry |
| P04 required embedded thumbnail gates | Policy delivered PR86 | Local decoded/hash/plate proof, then target metadata; runtime enforcement open |
| B01 reported 3D surface/projected axes | Partial: Lab delivered, real migration source-only | Preserve reported samples; real mobile/WebGL unverified |
| B02 equal 2D/3D frame | Delivered Lab | Preserve 4:3 mode/resize/loading parity; legacy separately checked |
| B03 vertical Z(mm) rail inside canvas | Delivered PR77 | Final inset/endpoints request still open |
| B04 animated 2D/3D switch | Delivered PR78 | Keyboard/reduced-motion and chart identity preserved |
| B05 orbit grid expands/shrinks | Not started | Separate fixed fit/frustum from orbit; zoom remains independent |
| B06 inset Z rail + endpoints/range in plot | Not started | Actual extrema vs padded axes, no duplicate bottom summary/overlap |
| B07 Bed error collapse | PR89 neutral masking/footer in Lab and generic legacy Bed | Preserve initial/failed-refresh geometry and Lab guarded Retry focus; real Svelte migration stays open |
| B08 real Bed Svelte migration | Source-only 194ea79 / 2338530 | Integrate current main; keyboard, fallback and 200% 2D labels |
| X01 read-only Console | Not started | Bounded sanitized observation contract, no command input/send |
| X02 Current Job Svelte | Source-only PR79 / 48f2060 | Integrate/remeasure; filename/state grouping, not duplicate percent |
| X03 History Svelte and record identity | Source-only 379c1e7 adapter | Basename/outcome/date/duration and bounded-list design |
| X04 Overview Svelte/domain grouping | Source-only 1a3b4f4 adapter | Eight truthful domain summaries, no invented fields |
| X05 no remaining legacy/MCP aliases | aaaf0a56 independently accepted: only two resources;30 old aliases/two tools/old Camera route and18 obsolete files retired | PR104 deployed with profile repair and no public compatibility restoration; scoped installed-byte/synthetic Camera and Jobs behavior PASS. Eight legacy renderers still used by current observation remain active; their Svelte migration is unfinished. No actual-host acceptance claimed |
| X06 material/profile/color sync | Decision pending | No unreviewed write/sync authority |
| G01 focused/transitive tests rule | Delivered PR80 AGENTS | One frozen full-run owner, independent targeted checks, ship guards intact |
| G02 role-separated delegation | Adopted AGENTS | Author cannot self-approve; disclose actual capacity limits |
| G03 UIUX and printer-domain critique | Audits completed, implementation partial | Apply screenshot/domain findings; do not claim findings fixed |
| G04 four project role definitions | Delivered PR82 | Native named-role loading unverified; role files/manual fallback explicit |
| G05 merge/deploy before completion | PR101 exact independent approval, guarded merge/deployment and BOTH restarts PASS; scoped synthetic postverification PASS | Keep source/service/device layers separate; C08 intermittent failure and other backlog remain open |
| G06 tmp/worktree/resource cleanup | Partial; ten redundant trees quarantined; current handles closed | Retain unique work; follow up per-run test evidence directories to avoid default cleanup loss |
| G07 persistence/status/longest stage | Ongoing workflow | Report actual stage/blocker; continue authorized open queue |
| G08 Chinese + English technical terms | Ongoing preference | Not a request to translate the application UI |
