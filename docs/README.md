# Documentation map

The documents here separate durable decisions from current hypotheses.

| Document | Purpose | Stability |
| --- | --- | --- |
| [Vision](vision.md) | Product direction and user outcome | Directional |
| [Scope](scope.md) | Current boundaries and safety invariants | Revisit each milestone |
| [Roadmap](roadmap.md) | Ordered learning and delivery milestones | Expected to change |
| [Architecture](architecture.md) | Provisional system shape | Hypothesis |
| [Workflow](workflow.md) | How changes and evidence are handled | Working agreement |
| [Continuity](continuity.md) | Durable state, iterations, and handoff | Working agreement |
| [Requirements](requirements.md) | Stable product and safety requirement IDs | Working draft |
| [Environment](environment.md) | Target OrcaSlicer, hardware, and deployment facts | Discovery record |
| [Open questions](open-questions.md) | Decisions that still need evidence | Active backlog |
| [Decision records](decisions/README.md) | Durable choices and their context | Append-only history |

Current execution state is indexed from [`PROJECT_STATE.md`](../PROJECT_STATE.md),
and the shortest restart route is [`NEXT_AGENT.md`](../NEXT_AGENT.md). The active
iteration is named by [`iterations/CURRENT`](iterations/CURRENT).

Documentation should state whether a claim is a goal, a hypothesis,
static/software evidence including a labeled real-Orca tool-integration
subcategory, protocol/simulator evidence, evidence observed on a real printer,
or a user outcome. Report Orca Preparation, handoff, and Printer Operations
status separately.
