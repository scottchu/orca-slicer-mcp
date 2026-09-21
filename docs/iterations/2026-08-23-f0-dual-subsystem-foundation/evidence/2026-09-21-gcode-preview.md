# Offline G-code preview experiment — 2026-09-21

## Status and ownership

Implemented: user-approved exploratory F0 / P03 slice, not a production
architecture decision or delivery of P02/P03. Source base is
`d5cc3bda8c86b3ae93dc398fdc7db33db1841a56`; branch is
`codex/gcode-progress-preview-20260921`. Implementation owns
`experiments/gcode-preview/`; separate architecture/records ownership does not
constitute independent source approval. Independent targeted review has completed on the exact file identities below;
this does not constitute production adoption, merge or deployment approval.

## Problem and bounded proposal

A percentage fill cannot show the selected artifact's actual planned layers.
The first experiment reads an existing real G-code artifact and renders its
planned extrusion with an offline layer slider. It asks whether this view is
useful before introducing live telemetry or an artifact/session handoff.

A source mesh gives a clean outline but omits sliced infill/support/toolpaths.
G-code provides the planned paths, subject to parser support, without recovering
editable source CAD or physical deposition. Prefer G-code for this experiment.
Render at least first, middle and final layer states and label them as preview
selection rather than reported printing. A historical custom toolpath witness can provide a limited comparator; it is
not a native slicer screenshot. Fresh native comparison requires new observed
evidence.

The conceptual internal data contract is an artifact digest plus parser version,
bounded extrusion segments, recorded layer/Z/tool attribution and explicit
diagnostics. Byte offsets may be retained for traceability but have no live
progress meaning here. A layer selection is local presentation state. Unknown
layer/startup attribution stays unknown or separately labeled. No MCP, HTTP or
production CLI contract is adopted. Shared preparation and operations boundaries
remain unchanged; a future preview would consume shared artifact/observation
use cases, not acquire a printer independently.

## Observable acceptance

1. Exact input bytes are read without mutation and hashed privately; rendered
   geometry and private receipt bind to that input and parser identity. Private
   paths, source names, geometry, G-code, screenshots and generated output do
   not enter Git. Repository tests use synthetic, non-user fixtures only.
2. Supported modal movement, absolute/relative extrusion, resets, tool changes
   and retract/de-retract behavior receive targeted checks. Zero/negative
   extrusion and travels do not silently become deposited material. Unsupported
   or ambiguous geometry commands are rejected or visibly disclosed as partial;
   resource bounds and malformed inputs have explicit outcomes.
3. First/middle/final screenshots show the same artifact, distinguish selected
   and other layers, and expose recorded layer/Z. Slider keyboard operation and
   narrow layout are checked. Labels do not claim measured completion.
4. A separate verifier reviews source identity, runs adversarial targeted cases
   and inspects rendering. Retain exact scoped results, including failures and
   unresolved comparison limits; author checks are not independent approval.
5. The experiment performs no printer I/O, telemetry acquisition, upload/start,
   production import/registration, package/production configuration change or
   deployment. Offline input remains data and is never executed as G-code.
6. Task-owned processes, browsers and fixtures close in teardown; preserve user
   sessions. Final records name remaining user review without implying approval.

## Intake and comparison limits

- Records owner ran `git rev-parse HEAD`, `git branch --show-current` and
  `git status --short` during intake: the base/branch above matched and the
  worktree was initially clean. Read AGENTS, PROJECT_STATE, NEXT_AGENT, current
  BRIEF/HANDOFF/VALIDATION and relevant requirements/ledger using file reads and
  `/opt/homebrew/bin/rg`.
- The first combined documentation patch failed because its VALIDATION heading
  context did not match. A follow-up read confirmed no partial documentation
  changes. The current-order records were subsequently written through Node
  filesystem operations, preserving earlier content. Unified shell execution
  later encountered file-descriptor error24; alternate Node tooling is used
  without terminating user processes.
- Coordinator reports the real artifact is from Snapmaker Orca2.3.5 and has
  16 declared layers. This is intake metadata, not independently verified parser
  or rendering acceptance. Source names, paths and geometry remain private.
- A fresh native Orca screenshot attempt is unavailable: CUA reported
  `cgWindowNotFound` after an application-open attempt. No fresh native visual
  comparison pass is claimed. Existing historical custom toolpath witness PNG and analysis JSON retain
  their original scope only; neither is native slicer evidence.


## Implemented source and author evidence

The candidate contains only five reusable files under
`experiments/gcode-preview/`. The records owner freshly hashed these files and
confirmed the author-reported SHA-256 identities:

| File | SHA-256 |
| --- | --- |
| preview.py | `b0661acfe58297e18413170abc6f7d6091f13bded2e1c849346f2a5ee7e73355` |
| preview.html | `809c258333d6c86ebeb0914d9b1d9472fb50acfb3efec85bcf410af4bce69447` |
| standalone.html | `66655f7727b39ff0c5a8f82bc50df5da349d9d54d58aa16a85e43866840e3623` |
| test_preview.py | `1625daa156f237e442e6d2afbdb80a5e1a82f78dcc2ee1be7aad49693ccd7030` |
| README.md | `557aa58eaad82b8ad514e86faff66b87d4969090827c936fc0610968831aad65` |

The author executed:

```sh
uv run --no-project python -B -m unittest discover -s experiments/gcode-preview -p 'test_*.py'
```

Result: all 13 author tests passed. The following is a redacted template of the
actual generation command; exact input/output paths and input digest remain in
private task evidence, not Git:

```sh
uv run --no-project python -B experiments/gcode-preview/preview.py PRIVATE_SOURCE PRIVATE_FRAGMENT
```

Generation succeeded with 16 layers and 9,484 vertices. Private output identities
are recorded here without geometry or locations: inline fragment 270,909 bytes,
SHA-256 `b7e6ef561e912da152e01c26e9ebd60bee66e676b448194faae930d67bdfb776`;
standalone page 272,190 bytes, SHA-256
`77d2ecf17ba90958c55a7d2464c5b5f925c51d3130324626d89dca15cf0e0631`.

Independent findings led to corrections for full-circle arcs, unsupported
startup modes, unknown absolute-extrusion baseline, bare G92, reflected top
view and an initial wrapper with external CDN dependencies. The final candidate
uses the local dependency-free standalone template. This preserves the failed
intermediate approach without treating it as accepted output. The author
started no server/process requiring continued ownership and removed generated
bytecode cache.

## Independent evidence

The reviewer reports 15 of 15 fresh adversarial parser cases passing on the
final parser digest above, and exact first/middle/final layer bounds agreement
with the historical custom toolpath witness. That witness is prior analysis,
not native slicer output. Desktop, 320px narrow and dark 600px browser checks
passed: keyboard selection of layers1/8/16 produced correct Z values and
distinct images; top/only-layer views were compared with the historical witness.
There were no page errors, external requests or printer requests. The reviewer
closed owned browsers. These are offline software/rendering checks.

The independent full repository command `./scripts/check-repository.sh` was
attempted and failed with exit127 because `svelte-kit` was unavailable in the
fresh worktree without application node_modules. No full-repository pass is
claimed. Production input bytes remain unchanged; do not treat targeted
experiment checks as a passing production release gate. Independent documentation checks examined 98 links with zero broken targets.
The reviewer confirmed an unchanged production tree and exactly six current
records plus five generic experiment source files, with no private input or
generated artifacts in the candidate. The private reviewed-hashes receipt and
independent review report remain outside Git.

Records owner `git diff --check` passed after source/evidence integration.
This is a draft experimental candidate; no merge or deployment was performed
or accepted by these results.

## Evidence boundaries and next action

- Static/software: 13 author tests and 15 independent adversarial parser cases
  passed; final scoped browser checks passed. Full repository check failed on
  the missing dependency as recorded above.
- Protocol/simulator: no protocol work; offline interaction acceptance is
  separate from real-printer behavior.
- Real-printer: none acquired or claimed for this experiment.
- User outcome: offline direction approved; rendered result not yet accepted.

The offline result is ready for user review with its parser/comparison limits. Live Progress integration, durable artifact/session
linkage, source retention policy and production adoption remain open questions
for a later bounded task. No full production regression or deployment is
required for this isolated experiment; production bytes are outside its scope.
