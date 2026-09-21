# Offline G-code preview experiment — 2026-09-21

## Actual-job extension — targeted checks complete

The user requested an actual prior print. The latest completed history entry
was selected as a stated default after the optional item choice remained
unanswered; the user did not explicitly identify that entry. This remains
F0 / P03 offline exploration in draft PR127, extending
`dcaa1199ee29f064c178384d1ccf03d74c1ef94f`. The final source below has
independent approval only for this offline scope. User review remains pending.

### Input correlation and initial failure

Bounded read-only history, current metadata and exact-file GET requests supplied
the local input. Size, modification time and opaque metadata identity match the
selected historical entry before and after download. No historical artifact
digest exists, so the current file is metadata-correlated with that job rather
than proven byte-identical to what printed. Private names, paths, job/printer
identifiers, raw history, input digest and geometry remain outside Git.

The approximately 7.256 MB input declares 244 layers. The previous 200,000
processed-vertex limit rejected it as designed. The bounded extension now
preserves 244 layers, 6,029 paths and 230,291 stored vertices, with one tool and
no deposition arcs. Diagnostic inspection with a larger temporary limit was
not a final parser acceptance or authorization for unbounded processing.

### Implemented experimental contract

- At most 500,000 processed vertices, including intermediate vertices later
  coalesced; at most 20,000,000 input bytes; inline output strictly below
  1,000,000 bytes.
- Versioned path-local signed integer XYZ deltas at normalized 1e-5 mm
  precision, deterministic gzip with mtime 0 and base64. Lossless means exact
  normalized parser geometry, not original arbitrary decimal strings or
  physical extrusion. No layer, path or stored vertex is dropped.
- At most 16,000,000 decoded bytes, enforced cumulatively while streaming
  browser decompression. Overflow cancels/releases the reader before JSON
  parsing. Schema, counts, safe integer deltas, cumulative coordinates and
  reconstructed ranges are checked before rendering.
- Missing decompression support, corrupt data, exceeded budgets and invalid
  geometry produce visible errors with disabled controls. The standalone page
  uses the same decoder and requires the same browser capability; it is not
  a decompression fallback. No external dependency or network fetch is added.

### Frozen identities and author checks

The records owner freshly hashed all five reusable source files and matched
the author's frozen receipt. Only four change in this extension; the standalone
template is unchanged.

| File | SHA-256 |
| --- | --- |
| preview.py | `8e7f49ff28ab95f209da005f11cbe708a4bb592d9f6bcc13c2f264b2b25ae28c` |
| preview.html | `dd26fff7665b551b9c1d8652e1869329670ff7eb416cd50a379d47c2e7f6edf0` |
| test_preview.py | `3054cad73f2874aba3f60931132a766b25152c31ceba719e339041b174ed39b3` |
| README.md | `64cfa70c5103060aae50048feea82bd7ef6881d4fae892b678c85ae5742a61f9` |
| standalone.html | `66655f7727b39ff0c5a8f82bc50df5da349d9d54d58aa16a85e43866840e3623` |

Author commands actually run (private arguments redacted):

```sh
uv run --no-project python -B -m unittest discover -s experiments/gcode-preview -p 'test_*.py'
uv run --no-project python -B experiments/gcode-preview/preview.py PRIVATE_SOURCE PRIVATE_FRAGMENT
uv run --no-project python -B PRIVATE_AUTHOR_ROUNDTRIP_SCRIPT PRIVATE_OUTPUT_DIRECTORY
```

All 16 author tests pass. Generation succeeds, and the separate roundtrip check
matches the complete normalized parser structure exactly, including every path,
point and metadata value; repeated encoding is deterministic. Decoded JSON is
3,826,104 bytes and base64 payload is 918,620 bytes. Final private outputs:

| Output | Bytes | SHA-256 |
| --- | --- | --- |
| Inline fragment | 931,621 | `c14ac1db55dae120518134b82dbd4a5142e8f8648904449007890ed17294fe68` |
| Standalone page | 932,902 | `7f255685493142d662e8f3e71702fc057b153eca19bc06a94c2a539773d6996d` |

The author used Node child-process tooling because the ordinary shell launcher
encountered file-descriptor error 24. No user process was terminated. The author
started no persistent server or browser and made no printer control, setting,
upload/start or camera request.

### Independent verification

The independent reviewer identified missing per-layer path-count and recomputed
bounds correlation; the author corrected both before freeze, and the relevant
adversarial cases now pass. The reviewer approved the exact source/output
identities above for offline scope. Commands actually run (private arguments
redacted):

```sh
uv run --no-project python -B PRIVATE_CODEC_CHECK PRIVATE_SOURCE PRIVATE_NORMALIZED
uv run --no-project python -B PRIVATE_OUTPUT_CHECK PRIVATE_SOURCE PRIVATE_FRAGMENT
uv run --no-project python -B -m unittest discover -s experiments/gcode-preview -p 'test_*.py'
git diff --check
```

The 12 independent codec checks, two output checks and rerun of the 16 author
tests pass. Codec coverage includes exact equality to the prior normalized
parser with only its diagnostic cap raised, deterministic bytes, processed
versus stored count limits, input/expanded limits, safe coordinates and small
or negative deltas. Output checks prove oversized inline output is rejected before writing and
exact regeneration of the actual fragment produces identical bytes. The final independent receipt matches the frozen identities.

Node-hosted Playwright checks used the exact standalone content for first,
middle and final layers (1/122/244), keyboard Home, Top/only-layer controls,
320 px layout and a 600 px dark view. No horizontal overflow, page errors or
network/printer requests occurred. A private instrumented copy proves every
browser-decoded geometry and metadata value equals the normalized parser
result. A cross-realm prototype-sensitive comparison was replaced with
recursive own-key equality and exact scalar comparison; this was a verification
harness correction, not a source change.

All 21 browser adversarial cases pass, covering count/schema mismatch, invalid
coordinates/tools/encoding, corrupt base64/gzip, declared and actual expansion
limits and unavailable decompression support. The 16,000,001-byte expansion
case cancels and releases its reader once each, with zero JSON parse calls.
Observed local readiness was 221 ms; the three layer-update/capture observations
were 44–60 ms. These are local observations, not device performance guarantees.
The reviewer closed every owned browser. Review used existing private inputs,
with no new printer I/O or dependency installation. An initial invocation at an
unavailable uv location failed before execution; the resolved uv executable
then ran the recorded commands successfully.

Screenshots retain the same overall silhouette as the source's embedded
thumbnail. This is a limited shape comparator, not a native slicer toolpath
comparison. Native Orca comparison and historical exact-byte proof remain
unavailable. The previous full repository check failure (missing `svelte-kit`)
remains recorded below; it was not rerun and no full-suite pass is claimed.

### Evidence boundaries and next action

Read-only real-printer history/metadata/file acquisition is distinct from the
offline parser and local browser checks. A reported completed history entry and
planned paths establish neither physical quality nor measured deposition.
Actual ChatGPT-host/phone acceptance and user review of this new result remain
unobserved. There is no live progress or artifact-to-session mapping.

Only the experimental files and six current records change. Production source,
configuration, dependencies and generated assets remain outside this candidate.
Keep PR127 a draft; no merge, release, deployment, auth/network modification or
printer action is accepted by this evidence. Present the offline prior-job
preview for user review. P02/P03 delivery and architecture adoption remain open.

## Prior small-artifact experiment — historical evidence

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
