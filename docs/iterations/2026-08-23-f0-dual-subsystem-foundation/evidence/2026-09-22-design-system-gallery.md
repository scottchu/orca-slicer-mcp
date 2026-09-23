# Offline design-system gallery evidence — 2026-09-22

Status: **implemented; scoped source/security/semantic and UX review passed;
user visual selection pending**. This is the authorized offline review artifact,
not a production widget migration or adopted component API. The completed
[baseline audit](2026-09-22-design-system-audit.md) retains its original scope.
[Gallery source and run instructions](../../../../experiments/u1-design-system-gallery/README.md)
are reviewable; generated outputs, screenshots and operational pointers stay private.

## Scope, ownership and preserved inputs

F0 / UI-001/003/004, F02/F04/U01. The UI/UX owner authored the brief and reviewed
rendered UX. A separate builder implemented seven files in
`experiments/u1-design-system-gallery`. A separate independent reviewer approved
source, graph isolation, preview boundaries and scoped semantics. The records
owner integrates evidence; no owner substitutes authorship for independent source
approval. No milestone, production visual direction or broad migration is adopted.

Base HEAD: `03149854a8e2380b08c5bd95274c6ed66f54020b`.
Existing `plugins/u1-print-studio/app/src` tree:
`41aaabe884154253a4c865451f13d47aac6d0ea6`.
Production/common source, dependencies, configuration and public generated assets
remain unchanged. The experiment adds isolated source/build inputs only and is
absent from production registration. Runtime 0.4.24 remains delivered; no existing
public/dashboard service was restarted or deployed.

Actual existing primitives/tokens are imported. The baseline is a bounded
imported-component thermal composition, **not the exact shipped Thermals widget**.
Local proposals add Cavity No target and separately associated source receipts.
Progress shows actual minute-resolution and common DurationValue groups with
matching inputs; Camera is a static contract reference plus interactive common
Switch. Selected Live is not evidence of frames. All observations are synthetic.

The coordinator ran `surface status`, which reported stopped, and `surface
doctor`, which lacked the selected default connection record. The local Surface
source contract, read through the skill's README symlink, requires Svelte 5.57.1;
the app package pins 5.57.0. This is a documented compatibility mismatch, not an
observed running Surface compiler. No Surface service was configured or started.
The gallery uses installed Bun 1.4.0, Vite 7.3.6 and Svelte 5.57.0 with a loopback
static preview.
No dependency install, production route, controller, media or printer call occurs.

## Actual commands and corrections

Commands below replace private output paths and the selected local port with
placeholders; exact invocations/results remain in private owner reports.
The builder ran from the repository root:

```sh
bun --no-env-file --config=/dev/null experiments/u1-design-system-gallery/build.ts <private-output>
bun --no-env-file --config=/dev/null experiments/u1-design-system-gallery/serve.ts <private-output> <local-port>
bun --no-env-file --config=/dev/null experiments/u1-design-system-gallery/check.ts <loopback-url> <private-evidence>
git diff --stat -- plugins/u1-print-studio/app
shasum -a 256 experiments/u1-design-system-gallery/*
```

The first build failed resolving Svelte internal exports through a folder alias;
explicit installed export aliases fixed it. The second failed for a missing
library CSS filename; an explicit gallery CSS filename fixed it. Later builds
passed. An initial author check revealed a 13px healthy-refresh geometry change at
320/200; shorter truthful status text corrected it. Early independent findings
corrected animated settled-failure placeholders, Tool 0 to canonical Tool 1,
missing accessible Active/Inactive labels and misleading fixed-width control
wording. Mobile first use gained a shorter introduction and proposal jump.

A later timing amendment added actual baseline/proposed elapsed/remaining groups
using the same 59/3661-second inputs. A UX check then found that Refresh text
extended beyond its shrinking button at 320/200 even though the page did not
overflow. Gallery-local nonshrinking button sizing and wrapping status text fixed
it; production Button was not edited. README accessibility wording was corrected
to precision-aware degree output; this documentation edit changed no artifact.

Affected amendments were checked with private `check-timing.ts` and
`check-footer.ts`, each executed using `bun --no-env-file --config=/dev/null`.
The UX owner used private `ux-final.ts`, `ux-probe.ts` and `ux-footer.ts` with the
same invocation prefix. The independent reviewer used private
`independent-browser.ts` (renewed for timing bytes) and `independent-footer.ts`;
source/graph/identity/privacy and raw socket checks used
`uv run --no-project python -`. Read-only Git and explicit Homebrew `rg` checks
supported source isolation. These commands did run; no full application suite or
independent duplicate build was run.

## Candidate attribution and author verification

| Candidate | JavaScript SHA256 | CSS SHA256 | Actual checks |
| --- | --- | --- | --- |
| Initial matrix | `7c5ea527d6eea09422e6e857acabda5b2d6a9ba6491c23a98caad74c6d3edb65` | `12f362a98c1f23b67d9c1510b07e42fd36e5a60ac0993167b09241c57130ba69` | 20 thermal combinations; 24 modeled phase/size observations; keyboard Switch and mobile overflow checks |
| Timing amendment | `04182ee81aef15da97629c69289c6fc1e7b4a506f37a2552e084575f9a16ca30` | `12f362a98c1f23b67d9c1510b07e42fd36e5a60ac0993167b09241c57130ba69` | Four affected timing captures at 320/390 outer widths and 100/200 text; both actual groups present, no overflow |
| Final footer amendment | `433de15e981bc7ae8b81e97e6c8d06ffc2532427733fee719c24b1f764b788c2` | `7e1b7bdfb205d7c2488b319d066e34f1812b15a28a2bb3bf688fcf050e2d2c8e` | 24 affected phase/width/text cases: button text containment, 44px minimum height, no card overflow, stable per-layout geometry |

The initial matrix is five thermal cases × two measured specimen widths × two
text sizes; the state matrix is six modeled phases × four size combinations.
It checks known/missing/inapplicable values, hidden failed reading accessibility,
static failure/retry under normal motion and geometry within 1px. Thermal semantic
source was unchanged by the timing amendment; the final amendment changes local
footer CSS. Earlier matrices retain their original output attribution, with
only affected evidence renewed. **The original full matrix was not run on final
bytes.** Historical candidate identities come from builder execution records;
final manifest and served bytes were freshly verified independently.

Exact specimen widths 320/390px were measured in a wide outer canvas. At 390px
outer width cards shrink to 366px after page insets. Width controls therefore say
maximum width. The gallery's 200% setting doubles specimen type tokens; it is
synthetic text scaling, not browser zoom or operating-system Dynamic Type.

## Independent verification and visual review

Independent source inspection covered all seven files. The compiled graph has
3,639 module IDs and 28 nondependency entries, including style virtual entries.
Project runtime imports are confined to the gallery, actual common components/
tokens, ActualTarget, ObservedMeta and pure format helpers. No acquisition,
controller, service, router, configuration, printer adapter, dynamic registry or
private Lab runtime enters the graph. Production-source reference and privacy
checks passed.

The preview binds loopback, verifies and preloads three hashed assets once, and
serves only exact GET `/`, `/gallery.js` and `/gallery.css`. Unknown/private/
source/directory/traversal/encoded/query/absolute-target/method/Upgrade/CONNECT
requests were denied in 18 independent HTTP/socket probes on the timing
candidate. Three allowed exact-asset responses also matched their hashes: 21
probes total. Server source was unchanged by
the footer amendment; all three final served hashes were rechecked. CSP blocks
connections, frames, images, objects and form submission. No directory or source
serving is available.

Independent browser checks on timing bytes exercised four fresh cases:
missing 320/200, zero 390/100, stale 390/200 and extreme 320/100. Each traversed
ready, healthy refresh, failure, local Retry and recovered presentation. They
confirmed separate value/applicability/active evidence, independent source times,
no restamping, static failed states, duration groups and terminal omission.
Common Switch End/Home/ArrowLeft wrap, focused 44px target and reduced-motion
behavior passed. Expanded 390/200 outer layout had no horizontal overflow;
there were zero page errors or off-allowlist requests. These are modeled gallery
transitions, not production-controller recovery.

Final affected independent checks asserted final JS identity and passed ten
states (ready/refresh/failure/retry/recovered at exact 320px specimen and 320px
outer viewport, both 200% text). Both cards preserved button text containment,
44px targets, no card/page overflow, static failure/retry and equal geometry
within each layout. Unchanged semantic checks are explicitly retained.

The UX owner inspected 11 timing-candidate capture steps: desktop/mobile first
use, visible first-Tab focus, four thermal width/text combinations, real duration
groups, Camera-reference keyboard control, mobile proposal jump and normal-motion
failure. The final footer amendment added two freshly inspected final-byte images:
desktop comparison and actual 320/200 missing-value comparison. Final served
hashes matched; at 320/200 Refresh measured 104.078 × 48px and Retry 77.531 × 48px,
with text contained and no ready/failure/retry card overflow. Unaffected grouping,
receipt/value, timing and navigation findings are retained for this narrow CSS
amendment. UX disposition: ready for user direction review, no scoped blocker.
The design author's UX review is distinct from independent source approval.

## Final exact identities

Final served `index.html` SHA256:
`b04bbf7ca61e974ee117a87513757c8ba72107d84f1722939c409ee32c980bd9`.
Final JS/CSS hashes are in the candidate table above. The independent identity
receipt matched all three responses and the following source hashes.

| Experiment source file | SHA256 |
| --- | --- |
| Gallery.svelte | `30f89cc508e108addc56f58c4743728506a715f2599b9d0a8d296971757b0486` |
| ThermalCard.svelte | `d34247610a2fb08225500fe96b5d1153b05d1142597a679f17d68de992b25391` |
| README.md | `b3b8d34a3f431030093778972cd3b6fb7078102e04ed316228395cc0991f2451` |
| build.ts | `cb8c3a992706576dc3eafce4034aebe7220fe8e556161eaa35f2af61a1ab02f9` |
| check.ts | `4810382da157ed8b85e7a636e09df161a52bf796d35bfefa6c5b729c7c5d3456` |
| main.ts | `49155f968e29c82bf74f479d63430c16df63ff9dde4ac6a5e1dc8d4b328620fc` |
| serve.ts | `7099c75defbbdf08d8d2a6ecd010ff1637fad66a5f07d3b355960a1542141d39` |

## Records, resources and next boundary

The records owner used `uv run --no-project python -` to advance current
entrypoint/state/order/iteration records and integrate owner evidence. Prior
audit/transfer evidence and history are unchanged. Author `git diff --check`
passed. A focused `uv run --no-project python -` check resolved all 33 relative
links in current sections/the proposal/evidence, found no new private operational
identifiers, and printed hashes of the eight gallery-record paths. Its
`git diff --exit-code HEAD -- plugins src scripts package.json bun.lockb uv.lock
.agents .codex .github` returned 0. These checks add no application/browser
acceptance. The separate private independent receipt owns exact frozen-document approval.

All owned browser contexts/processes and independent sockets closed in cleanup;
replaced preview instances were stopped. The requested final immutable loopback
preview remains builder/primary-owned for user review. Its exact location/process
identity stays private. README documents regeneration and explicit stop/restart;
rebuilding cannot mutate an already-running preview.

No full application suite, complete screen-reader/contrast/locale matrix,
actual-device, real Camera session, printer behavior or production-controller
acceptance is claimed. User selection remains open for No target, receipt
placement and duration precision. Source delivery may proceed as a draft PR;
no merge, widget migration, production deployment or service restart precedes
that visual choice. Later adopted application work retains every existing
consumer, independent-review and shipping gate.


## Later user-requested private tailnet access

The user separately authorized private Tailscale access to the completed gallery.
The operator snapshotted existing Serve configuration, then ran the supported
`tailscale serve --bg --https=<new-private-port> <loopback-backend>` command
(exit 0). Removing only the new TCP/Web proxy entries from the resulting
configuration reproduced the original exactly, including the existing Funnel
allowance. No public Funnel was added; existing routes, authentication and
production U1 services were preserved. Exact command values, URL, configuration
snapshots and process identity remain in private operational receipts.

The original preview process had stopped. An attempted detached launch did not
persist, and an early loopback request failed. The shell continued to create the
proxy before its upstream was working. The operator then restarted the exact
immutable gallery using the existing `serve.ts` invocation under retained
execution, with no rebuild. Subsequent operator checks passed HTTP 200 and the
final manifest's three asset hashes on both loopback HTTP and valid-TLS private
HTTPS. This records the recovered result without treating the earlier failed
request as success.

Independent verification passed: a fresh `tailscale serve status --json` matched
the operator's resulting configuration; all 20 existing TCP/Web routes and the
existing AllowFunnel entry were preserved, with no Funnel enabled on the new route.
All three private HTTPS assets returned 200 and matched the final manifest hashes
with default certificate/hostname validation enabled. This establishes private
access and preservation, not actual-phone or user visual acceptance. The access
change adds no application build or production deployment.
The loopback backend remains task-owned and must stay running for the proxy to
work; no durable-daemon behavior is claimed. The next product step remains user
visual selection. Documentation changes are limited to current order, handoff,
validation index and this operational evidence; all private operational details
remain outside repository records.

The records owner ran `git diff --check` and a focused
`uv run --no-project python -` check: all eight links in current sections/evidence
resolve, new content has no private operational pointers, and the experiment plus
production-input diff against HEAD is empty. These are documentation/preservation
checks only. The private independent receipt owns exact final-document approval.
