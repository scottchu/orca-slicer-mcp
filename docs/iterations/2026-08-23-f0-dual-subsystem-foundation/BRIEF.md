# F0 dual-subsystem foundation brief

- Status: active
- Current slice: compact composition spacing after maintenance and resource cleanup
- Decision: [0054](../../decisions/0054-own-current-state-and-maintenance-evidence.md)

## Execution order

PR111 maintenance is delivered. The user then prioritized cleanup followed by
spacing: retain the same information and make adjacent attributes easier to read.
Task-owned resources were released; the system-wide file-descriptor cause remains
unresolved. The current order is spacing correction, independent visual/source
review, guarded delivery, then user review before expanding the product.
See [spacing evidence](evidence/2026-09-06-composition-spacing.md).

The completed maintenance sequence remains:

1. Make current records concise and preserve historical evidence without loss.
2. Repair scoped reliability, shared application-use-case and CSS contract issues
   identified in the review, with focused affected-consumer verification.
3. Obtain independent source review and verification of the frozen candidate;
   assign one owner to the required full candidate regression.
4. Deliver the approved widget maintenance through the existing `u1-ship`
   workflow under standing release authorization, including both service restarts,
   exact served assets and scoped meaningful behavior verification.
5. Review the result with the user before expanding the product or private Lab.

## Observable acceptance

- Current records name completed PR109/110, separate merged Lab from deployed
  production, and provide one next action per workstream without stale tasks.
- Historical files and their relative-link targets remain byte-identical to
  the recorded source commit; current summaries link to one maintenance evidence
  record instead of repeating commands and artifact identities.
- Changed reliability/use-case/CSS behavior receives focused consumer coverage;
  the private Lab stays private and production behavior remains explicit.
- Independent review, required full regression and shipping evidence bind to the
  exact candidate. Software, protocol, deployed service, real printer and user
  outcomes remain separate acceptance claims.

## Boundary and deferred work

No printer controls, authentication, Tailscale, plugin reinstallation or Lab
production registration is included. Preserve all 55 delivery-ledger IDs and
unfinished Queue, Fans and Job History coverage. C08 Camera reliability remains
open unless specific new evidence accepts it. The accepted preparation pure core
has no supported adapter or actual uploader acceptance. Unrelated Camera planning
from another worktree is not adopted by this slice.

[Current state](../../../PROJECT_STATE.md) owns workstream status;
[handoff](HANDOFF.md) owns remaining work; [validation](VALIDATION.md) links the
single evidence record. The [PR110 archive](../../history/2026-09-05-pr110/README.md)
preserves the complete previous brief and historical acceptance criteria.
