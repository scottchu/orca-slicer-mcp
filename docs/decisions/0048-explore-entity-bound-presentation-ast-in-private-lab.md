# 0048 — Explore an entity-bound presentation AST in a private lab

- Status: accepted for the isolated private-lab experiment; not accepted as production architecture or cutover
- Date: 2026-09-03
- Owners: project maintainers
- Milestone: F0 / UI-003

## Context

The project needs evidence that an agent can request a small, reusable U1
presentation without gaining arbitrary markup, styling, script, transport, or
printer authority. Existing widget composition decisions constrain production
UI, but they do not answer whether a validated JSON presentation contract can
bind a subject once, plan its data acquisition, and preserve value-level
evidence through rendering.

This experiment is deliberately narrower than a general UI language. It covers
only tool head T1 status, actual/target temperature, configured filament color,
and a typed fan relation. Its synthetic private Lab and isolated MCP factory are
software/protocol evidence, not a production registration or architecture
commitment.

## Decision

Explore one versioned, strict JSON presentation AST with a fixed T1 subject.
The only domain leaves are `HeadStatus`, `HeadTemperature`, `FilamentColor`, and
`FanRelation`; each leaf owns its fixed icon, label, formatter, and source
mapping. `Card`, `Title`, `Table`, and `Row` are the only layout nodes. The AST
accepts no arbitrary HTML, CSS, JavaScript, icon, label, formatter, expression,
class, URL, or transport field.

Canonical validation precedes acquisition. The derived plan deduplicates each
required source group and never calls an unreferenced reader. The correlated
result envelope binds the canonical-spec SHA-256, exact derived dependencies,
exact source ledger, resolved topology, field-to-source mapping, source and
receipt timestamps, and leaf provenance. A filament tint is permitted only for
the declared soft-filament transform and only when its provenance-bearing color
evidence matches the materials receipt; unknown, loading, or unavailable color
stays neutral.

Fan identity is a closed typed relation. Zero or absent relations render
`Unknown` with `notReported`; multiple relations render `Unknown` with
`ambiguous`. A malformed environment relation or source is unavailable with
`sourceUnavailable` and a static error skeleton. An arbitrary source label
cannot become the primary role. Status vocabulary and display, temperature
bounds, and filament color are also closed before rendering. Loading uses
animated shape skeletons; error uses static neutral skeletons with persistent
distinct status space. Recovery UI is out of scope.

Reusable DOM-owning Svelte primitives remain under `src/components/common`,
while the four domain leaves and their semantics remain outside common. The Lab
route is dashboard-private and absent from navigation. Its MCP factory, tool,
resource, build, and verification proof are isolated; production factories and
registrations must not import or expose them. Static guards preserve the
read-only/no-authority boundary.

## Consequences

The prototype supplies a reviewable end-to-end learning artifact for UI-003,
including adversarial schema/correlation tests, exact source acquisition,
stable loading/error topology, and deterministic embedded resource evidence.
It does not select a general-purpose DSL, authorize a production route or tool,
or establish live data mapping, physical-printer truth, mounted-host behavior,
user outcome, deployment, or cutover. Any production adoption requires a new
decision and fresh exact-candidate review.

Camera is intentionally excluded. Decision 0049 records its separate future
composition direction without adding Camera nodes or changing Camera source in
this experiment.

## Validation

Acceptance for this experiment requires strict-schema adversaries; counting
readers; partial-failure preservation; correlated spec/hash/plan/source/
topology/provenance validation; zero/one/multiple/malformed fan cases; exact
input-shaped loading/error placeholders; static-error versus animated-loading
checks; accessibility and enlarged-text coverage; private/public route
isolation; explicit Lab-factory positive and production negative inventories;
and deterministic MCP resource build/verification.

Review must keep author, screenshot-first design, architecture, and independent
source approval distinct. Passing the private synthetic evidence does not prove
production suitability. Revisit this decision before adding subjects, fields,
nodes, actions, remote content, production registration, or Camera.
