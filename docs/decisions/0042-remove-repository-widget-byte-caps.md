# 0042: Remove repository widget package byte caps

Status: Accepted by explicit user direction; removal implemented with author-focused
evidence, independent full validation/exact acceptance and delivery pending.

The individual and aggregate widget HTML ceilings were repository-defined guards,
not established OpenAI platform limits. They blocked the adopted common UI
foundation/Camera overlay and encouraged source simplification solely to reduce
bytes. The user explicitly authorized removing these ceilings, not substituting a
larger arbitrary number. This supersedes the byte-cap clauses of decisions0032–0035,
0041 and requirements UI-002/003/005; historical measurements/failures remain evidence.

Remove individual and aggregate repository widget/package byte ceilings from
enforcement and obsolete tests. Retain byte-size observability and normal production
minification. Prefer clean, precise, readable and well-separated source; do not add
source complexity solely to chase package size. Preserve meaningful DOM/accessibility
fixes when evaluating earlier size-only micro-optimizations.

Integrity/hash pins, deterministic builds, nonempty valid artifacts, schema and
component/import boundaries, security/CSP, self-contained assets and closed graphs
remain mandatory. Runtime/protocol/resource limits are not package byte caps and
remain unchanged. All `u1-ship` PR review, exact identity, local validation, service
lifecycle and preservation guards remain in force; no skip or release bypass is added.

Finish cap removal with common primitives and the compact Camera icon overlay,
regenerate all eight bundles/pins, run affected focused tests, then assign one owner
to the necessary frozen repository/browser regression. Independent exact review,
guarded merge/deployment, both-service restarts and meaningful postverification
follow. Removal is not complete until source/enforcement impact and tests are
verified. C08, other ledger work, Progress, reactive-class discussion and the separate
c6 checkpoint retain their existing scope/status.
