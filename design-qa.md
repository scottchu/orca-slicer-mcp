# Smart-grouped composable Lab — author design QA

## Inputs and normalized comparison

- Selected target: conversation-selected Option 1 visual, kept outside the repository
- Target SHA-256: `34b6f2ebe00316c9acad8d67c0f0963b752d8c6a49389cda3b02a2cde50fd5d5`
- Smart card capture: `plugins/u1-print-studio/app/test-results/composable-lab-v2/composition-smart-card-known-390px.png`
- Smart card SHA-256: `3752e0f48c41dd75a8cef662c803d1736932f4bc78d8deb476d119e0d8450747`
- Normalized comparison: `plugins/u1-print-studio/app/test-results/composable-lab-v2/comparison-smart-target-vs-implementation.png`
- Comparison SHA-256: `c2a096aace24f385d38f86dc22cc70494e113d503d2172d1fd38edbdc14f06f4`

The 764 by 338 comparison places the previously normalized 374-pixel target
card beside the fresh Smart grouped implementation at the same card width. The
target is visual intent rather than executable input. Browser captures and the
comparison are ignored author-run evidence, not deterministic build identities.

The comparison confirms the intended information hierarchy: identity is one
packed Title plus HeadStatus group; temperature is the full-width primary
reading; filament and fan form the related secondary pair. The implementation
intentionally omits the target's printer icon and divider under the current
closed neutral-card contract. It uses no tint, gradient, percentage background,
table or fixed empty icon slot.

## Iteration history and findings

1. The preceding balanced layout encoded visual placement but left identity
   and summary relationships implicit. Its generic leaf reserves also produced
   visibly loose vertical spacing in the current card.
2. The additive resolver now groups semantics before placement. Identity is
   exactly Title plus HeadStatus and stays packed with a 12px gap. Summary owns
   temperature, filament and fan exactly once, with 20px group rhythm, 16px
   column spacing, 12px icon-to-text spacing and 4px label-to-value spacing.
3. Smart placement is code-owned: temperature spans all six logical tracks;
   filament and fan each span three. The explicit comparison authors the same
   Row/Column geometry. Pixel assertions confirm equal semantic order and equal
   geometry, while the JSON inputs remain different.
4. Group-local presentation removes the old fixed leaf height behavior without
   weakening stable states. Known, loading and error keep the same resolved
   topology and differ by at most 1px in the automated matrix.
5. Final author inspection covered Smart at 320, 390 and 720 CSS pixels at 100%,
   Smart at 390/200%, Explicit at 390/100%, and Smart loading/error at 390. The
   720 stage was narrowed after inspection so the card keeps the same focused
   reading width instead of stretching across the viewport.
6. Independent design review then blocked manifest `988b90bc...` because
   `Configured filament color` wrapped to three visible lines in the 390px 3+3
   row. The generic Swatch now supports a distinct accessible label. Quiet
   FilamentColor shows truthful `Configured color` in two lines while exposing
   the full `Configured filament color` to assistive technology; default/A
   rendering keeps its original full visible label. Type size, 3+3 placement,
   swatch/value atomicity and the wire contract are unchanged.
7. Independent source review later rejected application `8a9cb04a...`: the
   broad Group child policy required at least two children before the explicit
   relation validator could accept its documented one-Row form. Relation-shaped
   registry policies now preserve exact identity/smart cardinality while
   accepting explicit and resolved summaries with one to six Rows. This source
   correction changes no presentation geometry. The complete browser matrix
   was renewed, the Smart/Explicit card and comparison hashes remain identical,
   and the author re-inspected the normalized comparison above.

Author findings:

- PASS: 390/720 retain the 3+3 secondary pair at 100%; 320/100% and 390/200%
  collapse intrinsically to full-width stacked readings.
- PASS: the accessibility floor wins over either Smart or Explicit placement;
  the explicit override cannot suppress the collapse.
- PASS: Title and HeadStatus remain one packed identity group and wrap from the
  same left edge when needed.
- PASS: Smart and Explicit retain exact temperature, filament and fan content,
  order, spans and presentation appearances.
- PASS: the quiet 390px filament label is now two visible lines in both Smart
  and Explicit, while the full label remains the sole accessible label.
- PASS: loading/error remain neutral and layout-stable; only loading animates,
  and reduced motion stops that animation.
- PASS: no P0-P3 author visual finding remains in this bounded private-Lab gate.

Representative evidence SHA-256 values are `0bacf99c...` (Smart 320),
`cf67f76e...` (Smart 390), `b633a34d...` (Smart 720), `60f53ab1...` (Smart
390/200%), `0a8cad00...` (Explicit 390), `ac126a36...` (Smart loading 390) and
`9060f3f...` (Smart error 390). The exact full hashes are preserved by the
current iteration validation record.

Author design QA: **PASS after the P2 correction**. The exact independent
screenshot-first approval for `bc992eac...` is preserved below. Neither result
cover iPhone/Safari, mounted ChatGPT,
screen reader, physical printer/Moonraker, public Internet, production
registration, live-preview replacement or user-outcome acceptance. The
existing 4200/8451 preview was neither changed nor restarted.

final result: passed

---

# Smart-grouped composable Lab — final independent screenshot-first review

Disposition: **APPROVE** exact source-valid uncommitted application manifest
`bc992eac167d1119bdda2289a46ac9e34f4978dcdd0d18cd7cfe19d379cab04b`
within the synthetic private-Lab boundary. The preceding one-Row cardinality
defect is repaired in this renewed source candidate. No actionable P0, P1 or P2
design finding remains.

## Renewed exact evidence

The reviewer reopened the 853 by 1844 selected Option 1 target at SHA-256
`34b6f2ebe00316c9acad8d67c0f0963b752d8c6a49389cda3b02a2cde50fd5d5`
and the renewed 764 by 338 normalized target-versus-Smart comparison at
`plugins/u1-print-studio/app/test-results/composable-lab-v2/comparison-smart-target-vs-implementation.png`,
SHA-256
`c2a096aace24f385d38f86dc22cc70494e113d503d2172d1fd38edbdc14f06f4`.
The generated target has no CSS-viewport or DPR authority, so its card is used
only after width normalization. The comparison is both the full-card and
focused readable-region evidence; another crop would add no information.

Smart and Explicit 390px card captures are byte-identical 374 by 308 images at
SHA-256
`3752e0f48c41dd75a8cef662c803d1736932f4bc78d8deb476d119e0d8450747`.
This directly proves visual parity of the inferred grouping and the equivalent
explicit six-track Row/Column placement while their Lab selectors and canonical
JSON remain intentionally different.

The reviewer reopened Smart ready at 320, 390 and 720 CSS pixels
(`0bacf99c300972264c3941d71c819aa17a094f633abde1fb8319ddfd07a52a40`,
`cf67f76e0d4b29a5a742210b01b9c8804296ad1884c08fb149c7d8841a809d32`,
`b633a34db4b939e479f23c0e71bb5275ecc90dc9b83b03f1196d099849db3e49`),
Smart 390px/200%
(`60f53ab1a3952ebcc24f6a691b92e67d70e07ae723c2a6d9690dced4abfe6c6e`),
Explicit ready at 320, 390 and 720
(`9c3d16af5a488c3cb4b5e9fef26e64568399e947a1c9e8a549bc617b5a00a5be`,
`0a8cad0012745fd77af7256325aea26c0f4a090e75016b1300d6aa6859e8a3f9`,
`6e3078dc301a6d8a123c2f4fbea1086eb90fc963dcd1c932745d6a6a7e2d5d2c`),
Explicit 390px/200%
(`c61d23c287d9d111b2282e8d85855b39f297e799c7e1e707269548c1954b5d03`),
and Smart loading/error at 390
(`ac126a36553de55fe24d7cb8d4691a5ad55ac6147f7a52154258ded5302b6c2b`,
`9060f3f36ff21fa3e13234478cb272ddeb3c8a593b98c073090f01a724e14118`).
The browser captures are DPR 1; full-page height is 1500 at 100% and 2241 at
200%.

## Accepted fidelity surfaces

- **Grouping and layout:** Title and HeadStatus stay in one packed identity
  group with the approved 12px relationship rather than opposite card edges.
  At 390px/200% the badge wraps from the same left edge. Temperature remains the
  full-width primary reading. Filament and fan remain a 3+3 supporting pair at
  390/720 and collapse in source order at 320 and 390/200%, with no overlap,
  clipping or horizontal overflow.
- **Spacing and atomic readings:** the primary/supporting rhythm is compact and
  legible. Each Lucide icon remains attached to one label/value group;
  `214.6° / 220° C`, the amber swatch plus `#E89B3C`, and `Part cooling` stay
  atomic within their reading. Smart and Explicit preserve the same ordering
  and geometry.
- **Typography and copy:** existing system family, weights, line heights and
  hierarchy remain coherent. The corrected quiet label is visibly
  `Configured color` in at most two lines at 390px/100% and one line when space
  permits. Exact candidate source passes `Configured filament color` as the
  label's distinct accessible name, and both component and browser assertions
  require that full name; default/A presentation retains its original full
  visible label. Text is neither shrunk nor truncated.
- **Colors, surfaces, icons and image treatment:** neutral canvas/card, subtle
  border/shadow, muted labels, dark values and amber swatch use the established
  U1 tokens. There is no tint, gradient, percentage background, vertical
  divider, Table or printer icon. Omitting the generated target's printer icon,
  divider and halo remains an intentional accepted scope decision; no fake
  image, emoji, CSS art or custom SVG replacement appears.
- **States and accessibility:** ready, loading and acquisition-error captures
  retain the same reading topology and Card bounds. Loading uses neutral
  skeleton slots; error uses corresponding static neutral slots and the
  persistent status below the card, with no old values or overlay. The author
  12/12 browser run supplies the motion/reduced-motion, state-height and DOM
  assertions that still screenshots cannot independently prove. Row/Column add
  layout only and do not present a data-table interaction.

## Comparison history and limits

The earlier manifest `988b90bc...` was blocked for a three-line 390px filament
label; the renewed compact visible label closes that P2 in the captures above.
The later `8a9cb04a...` visual rereview remained blocked because independent
source review invalidated its Explicit one-Row cardinality. This renewed
`bc992eac...` source-valid manifest keeps the corrected visual bytes and closes
that source blocker; neither earlier disposition is waived or rewritten.

No browser, app code, server or runtime was changed by this reviewer. This
approval does not prove Safari/iPhone, mounted ChatGPT, manual keyboard
traversal, screen-reader speech, physical printer/Moonraker, public Internet,
production registration or user-outcome acceptance. Ambiguous/partial and
forced-colors behavior are browser-assertion rather than renewed independent
pixel evidence.

final result: passed

---

# Smart-grouped composable Lab — source-invalid visual rereview

Disposition: **BLOCKED** for exact uncommitted application manifest
`8a9cb04a839b8b4c7126bad1748e9b98477bddb5f8ce56f615f118db16a9daf8`.
Independent source review invalidated this candidate for an Explicit one-Row
cardinality defect before design approval was finalized. The visual evidence
below is retained as historical post-P2 evidence only; it cannot approve a
source-invalid exact candidate.

The reviewer opened the renewed 764 by 338 normalized comparison at SHA-256
`c2a096aace24f385d38f86dc22cc70494e113d503d2172d1fd38edbdc14f06f4`
and the Smart and Explicit 374 by 308 card captures. Both card captures are
byte-identical at SHA-256
`3752e0f48c41dd75a8cef662c803d1736932f4bc78d8deb476d119e0d8450747`.
The earlier visual P2 is corrected: at 390px/100% the quiet filament label is
now `Configured color` on two visible lines, with the swatch and hex kept
atomic. The author records the full `Configured filament color` accessible
label, but that semantic claim requires renewed exact-source verification on
the next valid candidate.

Smart ready captures inspected at 320, 390 and 720 are `0bacf99c...`,
`cf67f76e...` and `b633a34d...`; Smart 390px/200% is `60f53ab1...`.
Explicit ready captures at 320, 390 and 720 are `9c3d16af...`, `0a8cad00...`
and `6e3078dc...`; Explicit 390px/200% is `c61d23c2...`. Smart loading and
error at 390 are `ac126a36...` and `9060f3f3...`.

Within those screenshots, the packed identity stays close and wraps from the
same left edge, temperature remains primary, supporting readings are 3+3 at
390/720 and stack at 320 and 390/200%, and known/loading/error retain the same
neutral Card anatomy. No tint, gradient, divider, Table or printer icon is
visible. Those visual observations do not waive the source cardinality defect
or bind to a future manifest.

No app code, runtime or server was changed by this reviewer. A new frozen
manifest requires fresh exact-source binding and renewed captures/comparison
before approval. Safari/iPhone, mounted ChatGPT, keyboard, screen reader,
reduced-motion animation, physical printer/Moonraker, public Internet,
production and user-outcome evidence remain outside this review.

final result: blocked

---

# Smart-grouped composable Lab — independent screenshot-first design review

Disposition: **BLOCKED** for exact uncommitted application manifest
`988b90bc38b504ef1391752052f63076ad6a5f5eeb53b63363d530e420af25bb`.
The packed identity, semantic grouping, six-track behavior and state geometry
are accepted, but one actionable P2 typography/grouping mismatch remains at the
primary 390px mobile width.

## Evidence inspected

The reviewer opened the 853 by 1844 selected Option 1 target at SHA-256
`34b6f2ebe00316c9acad8d67c0f0963b752d8c6a49389cda3b02a2cde50fd5d5`,
the 764 by 345 normalized comparison
`plugins/u1-print-studio/app/test-results/composable-lab-v2/comparison-smart-target-vs-implementation.png`
at SHA-256
`13321a8679af3082b6f68b5cd9ab0b769ea89721b27d56333df5eb7735137539`,
and its 374 by 315 Smart card crop at SHA-256
`e6273661de00b8ccee4dfeb6992ac5132cbe95237c43fc5d43b6fd32facd03dc`.
The comparison is the required same-input full-card and focused-region view;
no further crop was needed because every label, value and icon is readable.
The generated target has no CSS viewport or DPR identity, so only its card was
width-normalized to the 374-pixel implementation card. It is visual intent, not
runtime evidence.

The reviewer also opened Smart ready captures at 320, 390 and 720 CSS pixels
(`cd3a92bb281a4fec29adbe2ceca037266c63de4ae24a8a322e31abdb9319a64a`,
`02459c62a18e57c200c586bfb4368978f1d2231beff415188374bccddbd7cd18`,
`d489ae46068edc655e0bef59e9e3591970ee6bf765d2e76be49434bb3688795f`),
Smart 390px/200% (`a45fcabc5d0cd47e547fde0283f87be1375f15397726d61ab13a8bde58733f87`),
Explicit ready at 320, 390 and 720
(`b354a3bc3951b1b32ca15c750e00fded4cf0dde1d83fb7bcb7e374b625531bb6`,
`c56efee01c1ce8a0bc5363266220ea6aa6bbf1e75162ae20d1777683810fe165`,
`f660cb9f0e28b50da581ed1003e564cc21c39fbe959ae6ac72e4123aeb83255b`),
Explicit 390px/200%
(`c95f8310e3f4a751c589a3c402b1864d13293a89210bf09b7076b06a061a59b0`),
and Smart loading/error at 390
(`d989b05d6fb96ddcefc9a00374fe3ac829107d89610ebeb52a759f26e635ccad`,
`865397b2b6277dd24cebdf148c5e58418794ce181083cadd4036a8ce3f75dcdd`).
These are DPR-1 browser captures with the CSS widths named in their filenames;
full-page pixel heights are 1500 at 100% and 2276 at 200%.

## Finding

- **P2 — the 390px 3+3 supporting row breaks the filament label into three
  lines.** In both Smart and Explicit 390px captures the visible label is
  `Configured` / `filament` / `color`, while the fan side uses one label line
  plus a two-line value. This exceeds the approved maximum two-line label and
  makes the two related readings scan as unequal blocks. The normalized target
  expresses the same relationship with a compact single-line label; literal
  one-line fidelity is not required at mobile width, but three lines at the
  primary viewport recreates the density/grouping problem the smart layer is
  intended to solve. Use a registry-owned truthful quiet-label treatment such
  as visible `Configured color` with the full `Configured filament color`
  accessible name, or another closed treatment that reaches at most two visible
  label lines without shrinking type, changing 3+3 placement or separating the
  swatch/value. Recapture Smart and Explicit at 390px/100% and renew the combined
  comparison.

## Accepted surfaces

- **Layout and spacing:** packed Title plus HeadStatus uses the approved 12px
  relationship at 390 and 720; at 200% the badge wraps from the same left edge.
  Temperature remains the span-6 primary reading. Supporting readings are 3+3
  at 390/720 and collapse in source order at 320 and 390/200%. Smart and
  Explicit card crops at 390 are byte-identical, proving exact visual parity;
  no overlap or horizontal overflow is visible.
- **Atomic readings and icons:** temperature target/unit, filament swatch/hex
  and fan value remain attached to their label and Lucide-family icon. The icon
  stroke, sizing and vertical alignment are consistent across inspected states.
- **Typography:** title, badge, muted labels, dominant temperature and quiet
  supporting values use the existing system scale and weights. The 200% view
  preserves reading order, atomic units and unclipped values. The P2 label wrap
  above is the only blocking typography issue.
- **Colors, surfaces and assets:** neutral canvas/card, restrained line/shadow,
  dark text, muted labels and amber swatch are coherent. There is no gradient,
  tint, percentage fill, divider, Table or printer icon. Omitting the target's
  printer icon/divider/halo remains an accepted scoped divergence; no raster or
  custom CSS/SVG substitute was introduced.
- **States and copy:** known content is truthful, loading uses neutral skeleton
  slots and error uses the same static neutral slots with persistent status
  below the card. Card topology and visible bounds remain stable. Motion and
  reduced-motion behavior rely on the recorded browser checks; still images
  alone cannot prove animation behavior.

## Review limits

No browser or runtime was launched or changed by this reviewer. The supplied
captures do not prove Safari/iPhone, mounted ChatGPT, keyboard traversal,
screen-reader output, reduced-motion animation, physical printer/Moonraker,
public Internet, production registration or user-outcome acceptance. Ambiguous
fan `Unknown`, partial state and forced-colors behavior were not present in the
new Smart/Explicit screenshot set and remain assertion rather than independent
pixel evidence.

final result: blocked

---

# Balanced composable Lab — retained reviewed design QA

## Inputs

- Selected target: conversation-selected Option 1 visual, kept outside the repository
- Target SHA-256: `34b6f2ebe00316c9acad8d67c0f0963b752d8c6a49389cda3b02a2cde50fd5d5`
- Implementation card capture: `plugins/u1-print-studio/app/test-results/composable-lab-v2/composition-balanced-card-known-390px.png`
- Implementation card SHA-256: `b8bd858af9a33fc90e19f49ec95269e5728299e98fde9beadc1c4a17e70e3182`
- 200% full-page capture: `plugins/u1-print-studio/app/test-results/composable-lab-v2/composition-balanced-known-390px-200-percent.png`
- 200% capture SHA-256: `01299e17c72392b317f15e6276531ca51c6018043deac13caa01afd347baeedc`

These are author-owned, nondeterministic browser/image-run artifacts rather than
build identities. The selected target is visual intent, not executable input.

## Normalized comparison

The author cropped the selected target to its card surface, normalized it to the
374 CSS-pixel implementation card width, and placed it beside the fresh 390px
implementation capture. The combined comparison is
`plugins/u1-print-studio/app/test-results/composable-lab-v2/comparison-balanced-target-vs-implementation.png`,
764 by 336 pixels, SHA-256
`96870d17fbd56d4023cde221aaa0f2583950319ba8806dec2515e2e2b76f2ef4`.

The comparison confirms the selected hierarchy rather than pixel imitation:
subject and status share the header, actual/target temperature is the full-width
lead, and filament/fan readings form the secondary pair. The implementation
uses existing product tokens and domain icons. It deliberately omits the target's
printer icon and vertical divider because the approved B contract forbids a
header icon/empty slot and separator. It also remains a neutral Card without
tint or gradient. The known fixture truthfully displays `Part cooling`; unknown
and ambiguous fixture states separately display `Unknown`.

At 390px/100%, the title and status remain on one row, the temperature value is
visibly dominant, and the secondary pair remains two columns. At 320px and
390px/200%, the pair collapses through the code-owned font-relative intrinsic
track minimum. At 390px/200%, the status wraps to the next line start, the target
and unit remain atomic, and no content clips or overflows.

## Iteration history

1. The first balanced browser run exposed a zero-width header loading skeleton
   and 4–16px state-height drift at 100%; the header badge received a structural
   width and state-scaled reserve.
2. The next run exposed 5–81px drift at 200%, caused by real header and hero text
   exceeding one-line skeleton geometry. The common badge reserve became
   line-height-aware, hero/quiet emphasis was bounded at a 1.5 ratio, and the
   hero's two-line structural reserve was corrected.
3. An initial auto-fit lead Grid admitted more than two columns at 720px. Its
   intrinsic formula now caps the layout at two tracks while collapsing at
   320px/100% and 390px/200%, without a wire breakpoint or span.
4. The resulting nine-test Chrome matrix passed at 320, 390 and 720px. It covers
   all four composition shapes, six balanced evidence states at 100% and 200%
   root text, reduced motion, exact topology and responsive geometry.

## Author findings

- PASS: one-row 390/720 header at 100%; wrapped badge starts at the title edge
  when the 390px/200% header wraps.
- PASS: hero value text is at least 1.3 times quiet secondary value text.
- PASS: all balanced state-height deltas are at most 1px at both text scales.
- PASS: loading skeletons animate normally and stop under reduced motion; error
  skeletons are static and neutral; partial state retains healthy evidence.
- PASS: no Table, Row, divider, tint, percentage background, gradient, printer
  icon, empty header slot, horizontal overflow, or scenario request appeared.
- PASS: all three A canonical hashes remain unchanged and their default visual
  modes remain unchanged.

## Independent screenshot-first review

Disposition: **APPROVE** exact application manifest
`e225b0c4966177203461bb94685777898b39e4db014821ccfc5c9c3741aa0e95`
within the synthetic private-Lab boundary. No actionable P0, P1 or P2 visual
finding remains; no P3 correction is required for this gate.

This disposition is renewed from the previously reviewed `83ea7b11...`
application identity after inspecting the exact source-only repair. The two
runtime-schema boundaries now cast through `CardNode['children']` and
`ResolvedCardNode['children']` instead of stale title-only tuple spellings; the
client test adds a source/type drift guard requiring `Inline` in both aliases.
These are runtime-erased TypeScript authority changes plus test-only coverage:
no Svelte component, style/token, renderer, balanced spec, fixture, route,
dependency or configuration changed. Fresh identity checks reproduce the
unchanged 115-file Kit manifest `5c22955182f278d4c934be1cc3d6f5099bb556109353098bff8593d942f9fd13`,
66,589-byte HTML `b212f9696c4ed5d0236edd17d4b5b0a9fbc8e6226d4ac21f90c7fafea769e509`
and 154,183-byte MCP resource
`b1b3eb179fdafeff20c564db37f42873cfbae4ba7ac6168a9f70d23dbcf33890`.
The normalized comparison `96870d17...`, card crop `b8bd858a...` and 200%
capture `01299e17...` are byte-identical. The prior visual findings therefore
bind to the renewed application identity without a new browser run.

The reviewer opened the 853x1844 selected target, the 374x306 implementation
card crop, the 764x336 normalized combined comparison and the 390x2310
200%-text full-page capture directly. The implementation capture is from a 390
CSS-pixel viewport at DPR 1; the generated target has no browser CSS/DPR
identity, so its card was compared only after width normalization to 374
pixels. The combined comparison is the primary evidence and is already a
focused, readable card-region comparison; a further crop was unnecessary.

Required fidelity surfaces:

- **Fonts and typography:** the implementation retains the existing system
  family and U1 weight/size tokens. Title, header badge, muted labels, hero
  temperature and quiet secondary values keep the target's hierarchy; the hero
  is visibly dominant without overpowering the subject title. The 200% capture
  wraps the status, hero value and secondary readings cleanly, with `220° C`
  remaining atomic and no truncation.
- **Spacing and layout rhythm:** the 390px card keeps title/status inline, one
  full-width temperature lead and a visually aligned two-column secondary row.
  Icons are centered against their complete label/value groups. The
  implementation card is taller than the normalized target because the known
  `Part cooling` value wraps and code-owned stable reserves remain present;
  this does not change hierarchy or interface density enough to constitute a
  P2 mismatch. The 200% layout collapses to one column without overlap.
- **Colors and visual tokens:** the candidate uses the established neutral
  canvas/surface, line, shadow, muted-label and amber-swatch tokens. There is no
  tint, gradient, percentage fill or decorative halo. Contrast remains clear
  in the inspected captures.
- **Image/icon fidelity:** the temperature, filament and fan marks are one
  consistent Lucide stroke family, sharp at capture density and optically
  quiet. Omitting the target's printer icon and empty slot is the accepted
  architecture divergence; omitting its vertical divider and generated halo is
  also deliberate. No image asset is replaced by placeholder, emoji or CSS
  art.
- **Copy and content:** the target shows `Unknown`, while the matched
  implementation capture intentionally uses the known fixture and truthfully
  shows `Part cooling`. This state mismatch prevents literal copy comparison,
  but is not design drift: the same exact browser matrix separately requires
  absent and ambiguous relations to render `Unknown`. Labels and subject copy
  otherwise agree with the selected hierarchy.

Responsive/state evidence was inspected at two levels. The actual 390px/100%
and 390px/200% balanced captures show no clipping or horizontal overflow. The
passed exact-candidate browser result covers balanced at 320, 390 and 720 CSS
pixels, both text scales, and known/unknown/ambiguous/loading/error/partial
states: topology is stable, state-height range is at most 1px, the 100% header
centers within 1px with at least 8px separation, the secondary pair collapses
at 320 and at 390/200%, and reduced-motion loading plus static error behavior
pass. Current-candidate 720px loading/error screenshots of the shared leaves
were also inspected: both preserve the same neutral slots and persistent status
region, while only loading animates. The earlier zero-width skeleton, 4-16px
100% drift, 5-81px 200% drift and over-expanded 720px Grid are therefore closed
by post-fix evidence rather than waived.

Implementation checklist: none for this bounded visual gate.

Independent review limits: there is no direct saved balanced 320px or 720px
screenshot, so those widths are geometry/assertion evidence rather than
independent pixel inspection. No new browser was launched. iPhone/Safari,
mounted ChatGPT, keyboard traversal beyond the recorded focus check, screen
reader, physical printer/Moonraker, public Internet, production registration,
live-preview replacement and user-outcome acceptance remain untested.

final result: passed

## Initial result and limits

Author design QA: **PASS for independent screenshot-first review** of the
synthetic private-Lab candidate. This report is not independent approval and may
be revised by the assigned UI/UX reviewer.

final result: passed

The evidence does not cover iPhone/Safari, mounted ChatGPT, screen reader,
physical printer/Moonraker, public Internet, production registration, runtime
preview replacement, or user-outcome acceptance. The existing live 4200/8451
preview was not changed or restarted.

---

# Historical design QA retained unchanged

# U1 focused-widget presentation QA — 2026-08-31

## 2026-09-01 Svelte all-observation lab formal-review renewal

Source visual truth: the user Progress reference at private attachment
`94609837-90DF-45EC-865D-A405934331EE/1-Pasted-Image-1.jpg` (590 × 1280
pixels) plus Decision 0032's explicit responsive contracts. Implementation:
`plugins/u1-print-studio/app/ui/test-results/progress-590.png` (590 × 1100,
590 CSS-pixel viewport, DPR 1) and the renewed 320/390/590/720 captures for all
views. The source and implementation were placed together at equal 590-pixel
display width in `/tmp/u1-progress-qa-comparison.png`; the temporary comparison
is not committed. Their data states differ (4% production capture versus 64%
synthetic fixture), so comparison is limited to hierarchy, density and visual
system rather than value equality.

Full-view comparison confirms the same white card, outlined icon tile, dark
system typography, lightweight green percentage, continuous amber bar,
layer/ETA row and bottom Refresh. The lab intentionally removes the reference's
unused vertical card space and adds the required `Lab fixture` disclosure.
Focused Progress inspection was sufficient for shared shell/token fidelity;
separate automated captures cover each domain's content layout.

Required fidelity surfaces: typography preserves the system family and clear
headline/value hierarchy without clipping; spacing uses one consistent inset
owner and content-driven body; color tokens preserve white/gray, green state and
amber progress accents; imagery uses local Lucide interface icons and Bed Mesh's
real code-rendered data surface with no missing raster asset; copy uses all nine
canonical titles and the explicit synthetic-fixture disclosure.

Earlier comparison history: formal review found post-mount wrong-screen/height
transition and Overview label clipping. The fix selects the exact pathname at
initial browser component creation from neutral SSR and changes Overview to one
column at 320/two at 390+, with content-driven rows. Post-fix Chrome records one
visible route, zero layout-shift entries and no required-text clipping at all
four widths. Heads stays two columns without reserved material height; Bed Mesh
geometry is unchanged. No actionable P0/P1/P2 visual finding remains. Residual
P3: the lab disclosure is visually denser than production, intentionally, and
package weight remains a software risk rather than a visual defect.

Primary interactions tested: every bottom Refresh produces overlay-only
feedback without changing card height or source time; Bed Mesh 2D/3D controls
preserve the same frame. Browser console and nonlocal requests are clean.

Parser-title and Heads renewal: the actual 320- and 390-pixel Heads captures
were inspected after re-review. Loaded cards retain a deliberately subtle
six-percent wash while the half-alpha blue fixture is visibly quieter than its
opaque equivalent; Empty/N/A stays neutral. Swatch, normalized hex and one Copy
icon form the bottom information/action row without adding reserved blank space.
The temporary Copy confirmation overlays the card and disappears without moving
the grid or footer. Automated early-document instrumentation also records only
the canonical title, never a visible or metadata-level generic-to-specific
transition. No new actionable visual finding remains.

Latest-action/active-state renewal: active status now keeps the shared amber
accent when the active tool's filament color is changed; only the subtle wash
and swatch change. Copy → Refresh and Refresh → Copy each render one overlay
with the latest message and no card-height delta, avoiding both overlap and a
stale semantic state.

Async-order renewal: Copy now displays `Copying …` on press. Deferred clipboard
resolve/reject after a newer Refresh leaves the Refresh message intact; when
Copy is newest, its success/failure replaces the progress message truthfully.
All cases retain one overlay and the same card geometry.

final result: passed

## 2026-09-01 Svelte Bed Mesh private lab foundation

final result: author corrections pass; formal and independent renewal required

Decision 0032 adds one exact private `/dashboard/lab/bed_mesh` fixture route
without replacing `/dashboard/bed_mesh` or adding a dashboard-directory/MCP
entry. Public HTTP returns 404. The candidate uses the established white card,
system type, restrained outline/shadow, local Lucide icons, information above
actions and exact 44-pixel controls. One shared 4:3 `ChartFrame` owns both modes;
feedback is a timed in-chart overlay and no instruction paragraph changes flow.

Real Chrome captured the actual private-handler response in 2D and 3D at 320,
390, 590 and 720 CSS pixels. Geometry assertions compare x, y, width and height
before/after each switch within 0.1 CSS pixel, enforce 4:3, and check no
horizontal overflow, console error or nonlocal request. The paired reference
comparison confirms the candidate fixes the reported defects: the 3D surface is
visibly colored and shaped rather than an almost blank plane, and the 2D/3D card
rhythm no longer jumps. The 2D map retains maximum Y above minimum Y and shares
the 3D fixture's exact range and palette. Fixture images and the combined
comparison remain ignored local test artifacts; private reference files are not
committed.

This pass is static/component/private-handler/real-browser evidence for the
synthetic lab only. The candidate was not deployed. Production
`/dashboard/bed_mesh`, MCP-host mounting, live reported data, touch/orbit
behavior on the user's phone and running services were not changed or accepted.
A later focused production cutover requires renewed exact review, compatibility
evidence and guarded rollout.

Independent review of exact candidate `7aef4b5` supersedes the earlier author
pass. Although 2D/3D geometry stayed equal, the 3D surface occupied only a thin
central band and its sprite-based XYZ/value labels rendered at effectively 3–6
pixels at phone widths and remained too small on larger fixtures. Renewal must
show a materially filled surface and measured 12-pixel-or-larger stable HTML
labels at all four frozen widths; screenshots and canvas visibility alone do
not close this block.

The renewed author candidate replaces sprites with nine stable HTML axis/bound
labels. Real Chrome through the actual private handler now measures every label
at 12 CSS pixels, visible and inside the shared frame with no pairwise overlap,
at 320, 390, 590 and 720 pixels. The surface derived from all fixture points
covers respectively 91.9--92.5% of frame width and 53.4--53.7% of frame height;
the full XYZ box/grid remains visible, and the 2D/3D frame DOMRects remain exact
matches. The original blocked phone reference and renewed 390-pixel capture
were inspected together, with 320- and 720-pixel captures also checked for end-
point readability. This closes the author correction only. Exact-candidate
independent visual review, user-device review and any production cutover remain
pending.

Formal review of exact candidate `a6363fd` also blocked the component bridge's
profile allowlist. The corrected author candidate now applies the adapter's
Unicode letter/number plus space/underscore/dot/hyphen rule and rejects path,
URL, bidi, markup, dot/dotdot and control adversaries. This correction does not
alter the measured visual result; renewed formal and independent exact-
candidate reviews remain pending.

## E compact Overview design frozen: implementation/visual acceptance pending

final result: blocked

Decision 0021's completion addendum and OBS-015 select one compact white
headline card rather than a status-only shortcut or eight embedded focused
cards. Explicit Overview demand composes Progress, Thermals, Heads, Current Job,
Job History, Queue, Fans and Bed Mesh while preserving each tile's own state,
time, freshness and reason. Two columns collapse to one; the header printer
state/time is main-status-only and one 44-pixel Refresh stays at the bottom.

The structured Overview module is itself privacy-minimized; rendering is not the
privacy boundary. It excludes filenames, project/model identity, IDs, raw rows,
history-total claims, Queue rows, mesh samples/profile, camera/media and runtime
details. Complete/partial/none means data coverage only, not overall health,
safety or freshness. Known empty/inactive counts as available coverage.

No E implementation screenshot, matched viewport/state comparison, browser
interaction, keyboard result, console inspection, deployment or live-printer
evidence exists. When source exists, capture at 320/390/720 pixels with complete,
partial and none coverage; mixed fresh/stale/empty/unsupported/unavailable tiles;
long localized labels; and zero/nonzero headline values. Verify no horizontal
overflow, clipped reason/time, hidden private identity, nested full cards, giant
map, decorative chart/surface, tile actions or false overall verdict. Confirm
visible focus and the single bottom Refresh. Source/deployment checks cannot turn
this result into a visual pass.

## D Current Job and real History deployed: visual acceptance unverified

final result: blocked

Decision 0025's addendum/OBS-014 retain the existing white focused-card system,
not a new visual direction. Current Job uses contextual file identity so a
persisted filename cannot look active: Printing/Paused, Loaded file, Last
reported job or Reported file. State, storage, duration, filament and byte facts
stay separately labeled. Job History uses `Latest jobs returned`, at most 20
rows in returned order, and page count only. Each row shows safe basename,
normalized status and reported time/duration/filament without IDs or actions.
Each card's own observation/freshness is above exactly one bottom Refresh.

PR51 exact head `30f1c7bb407d08d19d390acf2b5704a30eff010f` passed formal and
independent approval; exact release
`20260831-23f07e3-pr51-resume-20260831T191106-be85c4` is deployed to BOTH
explicitly restarted services. Tailnet index, Current Job and Job History return
200. One sanitized read of each card confirms known/fresh bounded semantics.
This is deployed-service and telemetry evidence, not rendered presentation
evidence.

No D implementation screenshot, matched viewport/state comparison, browser
interaction, keyboard result or console inspection exists. Source fixtures or
historical unimplemented-widget captures cannot accept changed assets. Typography,
wrapping, row density, spacing, contrast, icon fidelity, focus and content remain
visually unverified.

When available, capture both cards at 320/390/720 pixels: Current printing,
paused, standby-empty, persisted terminal, partial, stale, unsupported and
unavailable; History zero/one/20 rows, long safe names, every status, unknown
future status, null end, partial, stale, unsupported and unavailable. Verify no
horizontal overflow, false active/total/empty claims, raw/private fields, charts,
pagination or row actions; confirm 44-pixel bottom Refresh and visible focus.
Reviewed deployment/data checks precede the user's visual review but cannot turn
this result into a visual pass.

## C Fans & Chamber deployed: visual acceptance unverified

final result: blocked

Decision 0029/OBS-013 adapt the delivered white focused cards without a new
visual direction. Thermals gains a compact Cavity actual row with independent
time/freshness; Fans & Air uses compact grouped lists for four part-cooling fans,
Cavity fan and detected purifier exhaust/inner facts. Percent/RPM remain labeled
text, not decorative gauges or inferred health. Information stays above one
bottom Refresh action.

PR49 exact head `c14e92cfc655d0b7a6e7d0138650d7937789d7d1` was formally
and independently approved; exact release
`20260831-3ab4ed7-pr49-resume-20260831T182603-74d978` is deployed to BOTH
explicitly restarted services. Tailnet index, Fans and Thermals return 200; one
Fans and one Thermals POST confirm bounded known/fresh data semantics. This is
deployment and telemetry evidence, not rendered presentation evidence.

No implementation screenshot, matched viewport/state comparison, browser
interaction, keyboard result or console inspection exists for this rollout.
Historical widget captures do not accept changed Thermals/Fans assets.
Typography/wrapping, spacing/layout, color/contrast, icon
fidelity and content remain visually unverified.

When available, capture both cards at 320/390/720 pixels with mixed nonzero,
zero and null fan readings; purifier detected/not-detected; Cavity known/stale;
partial/unsupported/unavailable states. Check no overflow, honest units/copy,
independent times, 44-pixel Refresh/focus and absence of controls/health claims.
Standing reviewed merge/deploy/BOTH-restart/verify precedes the user's visual
review but never turns source or deployed-data checks into a visual pass.

## B Queue integration deployed: visual acceptance unverified

final result: blocked

Decision 0029/OBS-012 reuse the delivered white focused-card language rather
than adding a new visual direction. Target: top title/independent receipt,
freshness and queue-state/count summary; bounded ordered filename/Added/observed
waiting rows; explicit omission and empty/stale/failure states; bottom Refresh.
Author and independent software checks pass after formal review found
one singular omission-summary grammar defect. The minimal two-file correction
passes 44 focused tests/1,565 assertions and the full author gates. Renewed
independent checks cover 1/2/900 summaries and find no issue. Full evidence: 223 app
tests/3,150 assertions, 21 lifecycle, 22 shipping, 15 focused tests/7,049
assertions, TypeScript/diff checks, three bundles/code signing and six exact
emitted assets. No screenshot,
matched viewport/state comparison, keyboard interaction or console inspection
exists for the new Queue widget. Fresh allowed-browser discovery is unavailable.
Historical Heads/Bed Mesh/other-widget evidence does not accept changed Queue
assets. Typography/wrapping, spacing/layout, rendered contrast, icon fidelity
and copy/content remain visually unverified.

PR47 is merged and exact release
`20260831-6d76f9a-pr47-20260831T172710-645971` is deployed to BOTH explicitly
restarted services; health/integrity/static/security checks pass. The user has
the live Queue link. Deployment and scoped data checks do not supply a rendered
comparison, keyboard/device evidence or a visual pass; this result stays blocked.
Independent live evidence is bounded to one known/fresh paused-empty Queue read
and exact served-widget VM semantics. It confirms data behavior, not rendered
layout, interaction or user acceptance.

When browser access exists, capture 320/390/720-pixel layouts for known empty,
one and 100 displayed rows, long safe basenames, truncation, independently stale
and unavailable/unsupported states. Check complete readable names, no horizontal
overflow, omission clarity, focus/44-pixel Refresh and truthful waiting copy.
The user authorizes reviewed merge → deploy → restart BOTH services → verify
before their visual review; this changes ordering, never turns this report into
a visual/device pass.

## Current Heads reference refinement: visual acceptance unverified

final result: blocked

Source visual truth is the latest user-selected Heads attachment, opened by the
design role: 1554 × 1012 pixels, private source path intentionally outside Git.
Decision 0029's addendum specifies the adapted target: four softly tinted actual-
color tool cards inside white, exact swatch/hex/Copy, unchanged real state and
independent freshness. Bottom Refresh intentionally supersedes its top placement
in the reference; white filament does not inherit the image's amber active wash.

Implementation screenshot/path, CSS viewport, device density and normalization:
unavailable. No same-state full-view or focused-region comparison, browser
interaction or console inspection has occurred. Fresh allowed-browser discovery
returns none. All five fidelity surfaces remain unverified: typography/wrapping,
spacing/responsive rhythm, colors/contrast, icon/data-swatch fidelity, and
copy/content. Existing system fonts and Feather icons are retained; no generated
image is required for native data colors. Source fixtures are not visual proof.
The frozen 0.4.2/observation-v8 source has author test evidence recorded in
VALIDATION; it does not alter this visual disposition.
PR45 is now merged and exact release
`20260831-90d9f9d-pr45-20260831T152746-190348` is deployed. BOTH services were
explicitly restarted and pass health/integrity/static/security checks. The user
has the live Heads review link. This supplies no screenshot or actual-device
native clipboard evidence; this report remains blocked, not passed.
Independent one-shot Heads acquisition and 35 exact served-widget VM assertions
pass; matching source behavior and calculated contrast are not rendered QA.

When available, capture the actual Heads view at 320/390/720 and four-column
widths with valid white/black/brown colors, unknown/invalid color, mixed real
states and independently stale material. Compare matching source/content
regions, check the gentle wash and opaque text, Copy keyboard/focus/success/
denial/unavailable states, bottom Refresh, overflow and console errors. No
visual mismatch or correction history is invented before captures exist.

The user's standing reviewed merge → exact-build deploy → restart BOTH services
→ verify order remains in effect for their visual review. This overrides
predeployment visual ordering only; no source or deployed-service pass converts
this report into rendered/actual-device acceptance.

## Current F Bed Mesh surface: visual acceptance unverified

final result: blocked

Decision 0030 selects the supplied Fluidd Bed Mesh screenshot's orbitable XYZ
surface inside the existing white card, not its dark dashboard/profile controls.
The reference was opened by the design role; private attachments are not
committed. Source target is 0.4.1/schema 8/observation-v7/camera-v8 with seventeen
resources. The historical 2D Bed Mesh and release A reviews below do not accept
these changed assets.

There is no rendered F implementation screenshot, matched viewport/state,
density-normalized comparison, console inspection or browser interaction
evidence. The coordinator's fresh in-app selection failed and browser discovery
returned none. Full-view and focused-region visual comparisons are therefore
unavailable. Software production-script/VM fixtures cannot establish fonts,
spacing/layout, colors/contrast, chart legibility/asset fidelity or copy/wrapping
as rendered; all five fidelity surfaces remain visually unverified.

When an allowed browser is available, capture the actual 3D and 2D white card
at 320/390/720 px with active, flat, stale, inactive and unavailable states.
Compare the adapted target at matching viewport/state and record image/CSS
dimensions and density. Check XYZ/height legend and exaggeration, unclipped
surface, bottom controls, pointer/focused-keyboard orbit, Home/Reset, mode and
height changes, fallback, focus, narrow wrapping and console errors. No rendered
F finding or visual pass is asserted before those captures exist.

The user authorizes merge → deploy → explicitly restart BOTH services → verify
for their visual review. This overrides predeployment visual-QA ordering only;
the unavailable browser does not re-block that sequence or convert this result
to passed. Exact-SHA source approval, shipping guards, installed-byte and scoped
behavior verification remain separate requirements. PR43 is now merged and
deployed as `20260831-92a62c0-pr43-20260831T150042-2e7c64`; both services were
restarted and passed operator health/integrity/static/security checks. This
does not supply rendered-browser evidence. Actual-device/visual acceptance
remains unverified, and this report remains blocked, not passed.

## Release A: deployed white foundation, visual acceptance still unverified

final result: blocked

Decision 0029 and the active iteration's `WIDGET_TRACKS.md` define the current
reference: white cards and directory, camera state/measured FPS/frame time in
the header outside genuine media, and continuous reported-percent progress.
They supersede the historical camera-bottom and segmented-progress reviews
below. No historical pass accepts the new source or assets.

The coordinator's allowed-browser discovery found no available in-app or
Chrome client. Isolated headless-browser permission has been requested but
not granted. No current reference-to-render comparison, screenshot, browser
interaction result, accessibility pass, or visual approval is claimed.
Source inspection and deterministic DOM/media fixtures are software evidence
only; they do not substitute for this visual gate.

Resume with an allowed browser, or explicit permission for an isolated
headless browser, against the frozen release-A source. Capture the selected
reference and actual widgets at matching state and viewport, including
320/390/720 pixels, white-on-dark-host, unknown/stale/loading/failure states,
and snapshot/live/Close/PiP/fullscreen plus keyboard/focus behavior. Keep
private reference attachments and real camera evidence outside Git. Then
record a new scoped disposition; exact-SHA independent review, shipping,
deployed behavior, and actual-device acceptance remain separate gates.

## Historical dispositions — not acceptance of current release A

## Camera bottom status and single frame observer — independent review

Scoped source and rendered review: passed. The latest CAM-008 exception moves
camera state/FPS/time bottom-left while preserving bottom-right controls;
earlier top-status camera reviews below are historical placements. Observation
cards retain their information-above/actions-below structure.

1. **Bottom layout — passed.** Product Design audit guidance informed opening
   all six final native-media captures. Live 320/dark wraps its complete pill
   above the right-aligned controls; 390/dark and 720/dark fit both groups in
   one row. Snapshot and rejection 320/dark remain readable; rejection feedback
   stays above and does not overlap either bottom group. The controls retain
   their 44-pixel targets, with no visible clipping or horizontal overflow.
2. **Repeated setup — passed.** The reviewer compared the native 390-pixel
   before/after images and actual callback report: repeated same-peer setup
   previously duplicated frame counts and removed FPS while video continued;
   the fixed capture retains 31 FPS with unique native presented-frame counts.
   This confirms a reproducible product defect, not its occurrence on the
   user's inaccessible device. Canvas media was local; no printer or RTC
   network was involved and frame counters/timestamps were not fabricated.
3. **Regression boundary — passed.** Independent camera/app checks passed
   46 tests and 365 assertions. Prior callbacks and decoded intervals are
   cancelled; generation checks reject queued callbacks from older same-peer
   observers. Frame measurement, stale expiry, snapshot clocks, display
   rejection and signaling authority retain their existing boundaries.

Reviewed camera SHA-256:
`1f706d665a5f811793160b2afb2cd620bb381903673bc5047e159c1948ba6cac`.
Iteration `VALIDATION.md` owns full native-browser, fixture and packaging
evidence. This accepts source and isolated browser behavior, not deployment,
actual phone playback, the user's FPS symptom resolution or physical safety.

## Live-only measured FPS — independent source and rendered review

Scoped result: passed against decision 0023's latest FPS supersession and
CAM-008. Product Design audit guidance informed opening all five final
synthetic captures; this does not reinstate hidden network diagnostics.

1. **Live information — passed.** Presented-counter 29 FPS at 320/dark and
   30 FPS at 390/light, plus decoded-counter 30 FPS at 720/dark, keep the full
   state/rate/time pill readable above unchanged bottom display/live controls.
2. **Non-live information — passed.** Snapshot 320/dark and fallback 320/light
   show the accepted snapshot time without FPS. No clipping or overlap with
   the 44-pixel controls was visible in any reviewed capture.
3. **Truthful measurement — passed.** The reviewer independently ran the
   camera/app suites: 44 tests and 359 assertions passed. Presented and decoded
   counter families no longer mix within one measurement window; missing or
   invalid metadata cannot invent a spike. Startup, stale expiry, pause,
   close, peer replacement and the existing stalled-frame fallback are covered.
   An additional isolated VM probe confirmed missing presented metadata does
   not substitute an unrelated decoded count. No real camera was accessed.

Reviewed camera SHA-256:
`375bcbefbee47e1d01a958ad2441594e66b95ff65aa55242d5b058709dcc6182`.
The validator separately records five actual captures and twelve browser
behavior checks, with zero unexpected requests/errors. Iteration
`VALIDATION.md` owns the complete repository and packaging evidence.
This accepts scoped source and synthetic rendering, not deployed FPS,
physical camera rate, phone playback, PiP support or full accessibility.

## Reported Bed Mesh and shipping workflow — independent review

Scoped result: passed against decisions 0027 and 0028, with no unresolved
blocking findings. Product Design audit guidance informed actual inspection
of all nine final Bed Mesh captures, not acceptance from source alone.

1. **Reported grid — passed.** Normal 390/light, flat 320/light and hostile-
   profile 720/dark captures show compact rectangular data, readable bounds
   and minimum/maximum/range. Flat data stays uniformly colored; an unsafe
   profile is omitted without losing valid readings. Extreme 320/dark axes
   now fit; compact visible labels retain precise accessible bounds.
2. **Freshness and absence — passed.** Stale 720/dark, inactive 390/dark,
   retained-inactive 320/dark, unsupported 320/light and malformed 390/light
   remain distinguishable. Missing/failed data does not invent a flat grid or
   observation time. Information and errors stay above the single bottom
   Refresh action. No clipping was visible in these nine images.
3. **Acquisition and isolation — passed.** Independent reviewer execution of
   the adapter/store/projection/widget suites passed 51 tests and 1,303
   assertions. Review covered fixed bounded GET, whole-matrix validation,
   own-domain freshness, retained inactive data, races and selected-view-only
   acquisition. Camera and frozen resources remain outside the change.
4. **Shipping workflow — passed in isolation.** All 21 script fixtures pass.
   Three additional mocked CLI forward scenarios cover authorized execution,
   read-only plan and missing reviewed identity, with no real GitHub/service/
   HTTP operation. The skill requires exact independent review and fresh
   full-sequence authority; missing authority stops before execution. The
   reviewer-found pinned-runtime PATH mismatch is fixed by checking that bare
   `bun` resolves to the chosen executable. Guards, exact merged-tree staging,
   both-service verification and single captured-snapshot rollback were reviewed.

Reviewed SHA-256: widget
`23cf86a83143ba7480521baf12c0e05ee7777faea350de29cde055fd63ffbce5`;
shipping script
`49448de3ca32ba52917ec900d478901e2ec3590c887fa5cabddf4e67c9254978`;
shipping skill
`b1d7547e5ccb46f1014be28b351883d5ec45deb2eb3371771e7926c6c9e557e8`.
The validator's final browser report is
`c7c6409a6bd3c20f82c8c1033faee0991f806381dc5bc99e7dcd6b2158c88908`;
iteration `VALIDATION.md` records the complete software/protocol gates.
This accepts source and scoped synthetic rendering, not a new rollout,
real-printer mesh accuracy, phone-mounted behavior or full accessibility.
Queue work and rejected progress styling remain excluded and unresolved.

## Current Job and Job History — independent rendered review

Scoped result: passed against decision 0025, with no blocking source or visual
findings. Product Design review guidance informed inspection of all six actual
captures in the current `jobs-captures` collection, not earlier widget images.

1. **Current Job — passed.** The 390/light known-job card contains filename and
   storage only; the 320/dark missing-identity card explicitly says identity is
   unknown. Neither has a history panel or claims the printer is idle.
2. **Job History — passed.** The 390/light and 720/dark cards show the separate
   title, unavailable observation time and explicit not-implemented message.
   No current filename, fabricated history row or known-empty success appears.
   Both card types retain information above content and a single 44-pixel
   Refresh action below, with no clipping or removed boilerplate.
3. **Directory — passed.** The 320/light and 720/dark captures show nine
   readable entries, including adjacent Current Job and Job History with
   distinct Partial/Not implemented labels. The validator's actual-browser
   checks separately verify tab order, visible focus and history navigation.

The reviewer independently ran the projection/widget suites: 30 tests and
1,085 assertions passed, including stale/unknown facts, selected-view refresh,
escaping and existing layer/bridge behavior. Camera and frozen legacy assets
are unchanged from `47bfd37`. The validator records nine additional cases,
30 route checks and zero acquisition, external-request or error counters in
the private report; iteration `VALIDATION.md` owns the full validation record.

Reviewed SHA-256: observation HTML
`96bc93a05960f8a9af1923d93ceda0db0a33814eac5a3ef1a5e8e5e42554b572`;
directory HTML
`267acf63214c9ab23df92007a3fd3667b247d66f7d76fcb3c9116c1ed75acbc2`;
projection source
`2ec8a9b17c76d7d4d7d0ec6e3a995408a35c4855076fed173d0e124abbe63d7e`.
This accepts source and scoped synthetic rendering, not implemented history,
deployment, actual mobile/MCP-host behavior or full accessibility compliance.

## Current placement: information above, actions below

Scoped result: passed, with no blocking findings. The user's latest rule and
decision 0023's supersession govern this review. Earlier observation-footer
timestamps and bottom-left camera information in the records below are
historical accepted placements, now superseded rather than rules to restore.
Product Design review guidance informed inspection of all ten current captures.

1. **Observation information and actions — passed.** Progress, Heads and
   Thermals captures at 320/390 pixels show observation time under the title
   and only Refresh at the bottom. The 720-pixel stale view and 320-pixel
   refresh-failure view retain readable top feedback without clipping. Domain
   content and segmented-layer rendering remain intact; no removed permission
   or provenance boilerplate returns.
2. **Failed loading — passed.** The actual deadline capture keeps explanatory
   text above bottom Retry and invents no observation time. Separate browser
   checks cover all eight shared observation layouts, Retry recovery, and
   preservation of pending state/top errors during segmented regrouping.
3. **Camera information stack — passed.** Snapshot/live information sits at
   the top, display rejection flows below it, and unavailable text is top-aligned
   with only the decorative camera icon centered. Bottom-right display/live
   controls remain distinct, full-sized and unobstructed. The validator also
   checks narrow rejection stacking and loading without actionable controls.

The reviewer independently passed 71 focused tests/1,576 assertions and
verified identical camera JavaScript and layer-calculation bytes against the
prior source. Exact reviewed observation/camera HTML hashes are
`3fe2bb3460ddb8e75ddb19b363b396a859c64822601db9b2d6781b8cce6e4f2b` and
`0a66e1cc0c75e6769655d60cf92bc50ba80b2fc98ebb2ca6f23559fd07e0a483`.
The external `info-layout-captures` collection and iteration `VALIDATION.md`
record exact synthetic-browser evidence. This accepts source and scoped rendered
layout, not deployment, actual mobile-host/PiP, full accessibility compliance,
new printer mappings or physical/user acceptance.

## Camera bottom-right controls — independent rendered review

Scoped result: passed against decision 0023's latest placement refinement,
with no blocking findings. Product Design review guidance informed inspection
of all five current validator captures and the bounded DOM/CSS change.

1. **Snapshot at 320/390/720 pixels — passed.** PiP, Fullscreen and Go Live
   form one bottom-right cluster with unchanged icons and 44-pixel targets,
   separated by 8-pixel gaps. At 320 pixels the complete status/time stays left
   on the preceding line; the cluster neither shrinks nor wraps internally.
2. **Synthetic live at 390 pixels — passed.** Close occupies the final position
   beside the same display controls, with the live state/time retained left.
3. **Rejection at 320 pixels — passed.** Feedback occupies the freed top inset
   without touching the two-row bottom overlay or obscuring its controls.

The separate validator report confirms hidden unsupported controls and a full
missing-time label without overlap. Source review verifies unchanged button
identities, accessible names and DOM control order; the entire media script
is byte-identical to the prior reviewed source. The reviewer independently
passed 51 focused tests/556 assertions. This does not claim a new native-phone
PiP, keyboard/screen-reader audit, transport test or deployment acceptance.

External evidence remains under the logical `camera-controls-captures`
collection. Reviewed camera HTML SHA-256:
`c7691461c0500370f01d5d2a40bd88229045a3e9d1ad4b5a4b9f468ab233c526`.
The fixture uses synthetic images/video and substituted host/RTC behavior;
no real camera, printer or service was accessed. Earlier reviews remain below.

## Segmented layer progress — independent rendered review

Scoped result: passed against decision 0023's dated refinement, with no
blocking source or visual findings. Product Design review guidance informed
comparison of the user's continuous-bar reference with the rendered completed
card, followed by inspection of all twelve current validator screenshots.
The external screenshot crop and fixture outer padding/background differ;
pixel-identical screenshot framing is not claimed. The source diff preserves
the surrounding card layout and footer while replacing the strip itself.

1. **Grouped and completed progress — passed.** The 390-pixel light/dark and
   882-pixel dark captures retain title, state, percentage, layer/time caption
   and one bottom timestamp/refresh footer. The 14-pixel yellow/neutral blocks
   and 2-pixel gaps are distinct, including when every block is filled.
2. **Missing, zero and small totals — passed.** Missing layers use a neutral
   track with explicit unavailable text, not a zero observation. Zero retains
   empty blocks; the ten-layer case shows three filled and seven empty blocks.
3. **Fractional groups and narrow/wide reflow — passed.** Additional captures
   at 320/light and 720/dark show layer 126 of 461, a genuinely partly filled
   group, and an independently unchanged 67.4-percent headline. No clipped
   card text or overflow was found in the inspected images.

The reviewer independently ran 58 focused tests/1,441 assertions. Source
review verifies safe integer bins, single layer-progressbar semantics, hidden
decorative blocks, and bar-only regrouping. A missing media-query listener
could initially abort rendering; guarded modern/legacy registration and
fallback tests resolve that review finding. Validator behavior checks separately
cover pending refresh, retained errors/time, and no additional acquisition.

External evidence uses the logical `layer-captures` collection. Reviewed widget
SHA-256: `974153b569af5ba4c9ec4e69454c91f62acd1f5cb0bb23fd0d993e36ea074dfb`.
Final report SHA-256:
`4661992712cfc7bbf9c9506ede4be715ec339fbab1863e0a7fcd0848ef61996a`.
This is isolated synthetic-browser/source acceptance, not deployment, native
phone or screen-reader acceptance, real-printer evidence, or physical completion.
Earlier directory and focused-widget reviews remain unchanged below.

## Private widget directory — independent rendered review

Scoped result: passed against decision 0024, with no blocking visual findings.
The independent formal reviewer opened all six current screenshots captured by
the separate validator: 320, 390 and 720 CSS pixels, each in light and dark mode.
Product Design review guidance informed inspection of hierarchy, readability,
wrapping and interaction affordances; this is not a new redesign.

1. **Narrow directory, 320 pixels — passed in both themes.** The heading and
   release-coverage explanation fit without clipping. All eight whole-card
   links have readable titles, text labels and naturally wrapped descriptions.
   Partial/unimplemented entries remain visually openable; they do not imply
   live printer health or appear disabled.
2. **Phone-width directory, 390 pixels — passed in both themes.** The one-column
   rhythm and inset cards remain consistent. Heads & Filaments and the longer
   unavailable-domain descriptions fit without collisions or truncated copy.
3. **Wide directory, 720 pixels — passed in both themes.** Two columns preserve
   row-major reading order and clear whole-card link affordances. Spacing,
   rounded surfaces and muted secondary text match the existing visual system.

No timestamps, refresh controls, permission/provenance captions or fabricated
previews appear. Coverage labels use text, not color alone. Semantic anchors
and focus CSS were inspected; the validator separately records all-eight
keyboard order, first-link activation and zero overflow/acquisition.

Evidence remains outside Git under the logical `directory-captures` collection.
The reviewed HTML SHA-256 is
`1ffc53eefa9842d0741680f1e14d636bb8b2c84401a8382d8c222f39bc263d1b`;
the matching report SHA-256 is
`985905efc0ac9a4436a22f7220b5949d28c2a7951291a0621583c70cc4c40aa3`.
Capture conditions and representative fingerprints are in `VALIDATION.md`.
Focused destinations during keyboard activation were synthetic stubs. This
accepts rendered navigation only, not full accessibility, deployed routing,
iPhone behavior, real printer/camera reachability, missing mappings or the user's
final outcome. Existing focused-widget QA and its heater-state follow-up remain
unchanged below.

## Current gate: isolated headless rendered fixtures

Scoped result: passed. No actionable P0/P1/P2 findings remain in the inspected
rendered fixture presentation. This accepts the decision-0023 visual refinement
in isolated desktop Chrome, not a deployed widget, real camera, native iPhone
PiP, or an implemented printer-data domain.

The user explicitly authorized isolated headless-browser validation after the
connected-browser gate below was blocked. The independent validator captured
the production HTML in Chrome 152.0.7977.65 with synthetic observations and
clearly labeled synthetic JPEG/canvas video. This design reviewer opened those
captures and paired source/current comparison images; source tests alone were
not used as visual acceptance.

### Targets, normalization, and evidence locations

- Source visual truth: the supplied Heads and Filaments and Camera phone
  attachments, plus the explicit requested delta in decision 0023. Removing
  their header clutter is intentional, not a mismatch to restore.
- Source visual truth paths: external attachments kept outside Git, identified
  below by logical name and SHA-256. Both are 590 by 1280 pixels. Their original
  embedded CSS viewport, screenshot scaling, and device-pixel ratio are unknown.
- Heads comparison crop: source x=0, y=156, width=590, height=779. Camera crop:
  source x=0, y=605, width=590, height=445. These remove ChatGPT/phone chrome and
  the unrelated notification while retaining the old widget headers to show
  the requested change. Crops are scaled by 390/590 for visual comparison;
  this is not a claim of exact original CSS density.
- Implementation screenshot paths: external evidence directories named
  `captures-accepted` for final observation states, `captures-final` for the
  unchanged camera, and `design-comparisons` for paired images. Absolute
  temporary paths and private screenshots are deliberately not committed.
- Capture CSS widths: 320, 390, and 720; light and dark themes; extra thermal
  checks at 400 and 410. Device scale factor is 1, locale en-GB, timezone UTC.
  Final iframe height is fitted to content, not the initial 1000-pixel harness
  height. Example final images: Heads 390 by 534, live Camera 390 by 220.
- Heads fixture reproduces the four head identities, active T1, 220/220 and
  parked 30/0, 31/0, 32/0 temperatures. Timestamp is deliberately fixed fixture
  data, not the source phone time. Camera uses labeled synthetic artwork and
  media, not the private printer photograph; comparison accepts image framing,
  masks, overlays, and control legibility, not actual camera-image quality.
- Final observation asset SHA-256:
  `86cf5f4a4e6e29f8aa99cb14c947d20992b7b022c91c75f08642eea0a09837d0`.
  Camera asset remains
  `05634036e524693a2c9f9c0f817629968326175a22b98be85d3c28c484ee5e85`.

Representative evidence manifest (full manifests remain beside external
captures):

| Logical evidence | SHA-256 |
| --- | --- |
| Heads source attachment | `ca9d505c9e3a8799fbe0b1720dbb8a76a85d4659bdb2d5d7149fa261636d638e` |
| Camera source attachment | `0addbbdb31de6bacd82a90ec3c77fb4bf492330dc1a4ab9883df0d11ed150404` |
| heads-source-vs-current.png | `7121ed2b9329685aa4932ac16750cbe9dcbe1ce0cd65a402e347a54cdfa19406` |
| camera-source-vs-current.png | `078b120eeb6b929368b2150db3eb6745863127b887d647cc7f7d8020d678daac` |
| heads-fresh-390-light.png | `83c2173063b0bcdf05cf00df94f57c57bc2e0ac4928850cd58fa60ceee6b81b9` |
| jobs-fresh-320-light.png | `2524e4c3a7a0e2efbd6ff0ee88e4319513b65fbb98573b40bd80a368c0d20159` |
| thermals-fresh-390-light.png | `42d9d934d30d7612b0b5d71c9de9e71f93b999ece30c8359ae6c7181e6020212` |
| progress-stale-390-light.png | `c1c17de1c1d4a0c2b84285f9178fb86f9a3e6158ab82112be0273f8501cd96c9` |
| camera-fresh-390-light-live.png | `4066aff1f9ca0aa0740e1e9e23eaea5539f2b0889b05ca44968ef635e7be2b3c` |

### Full-view and focused comparisons

`heads-source-vs-current.png` and `camera-source-vs-current.png` put the source
and rendered implementation in each same comparison image. The heads comparison
preserves title, two-column phone/four-column wide layout, four physical
identities, yellow active marker, and unknown-material text while replacing
the clutter with one footer. Camera loses the redundant heading and network
details, gaining a short state/time overlay and display controls.

`heads-t1-focus.png` compares the first head cards at normalized width with
2x enlargement. `camera-overlay-focus.png` compares the old and new lower image
overlays at 2x enlargement. These checks made small labels, icon strokes,
rounded borders, and the requested debug-to-time replacement readable. The
different camera subject is a deliberate synthetic fixture, not a substituted
production asset or evidence of real printer video.

### Findings and comparison history

Initial headless inspection found three P2 issues; it did not pass immediately:

1. **P2, resolved: low-contrast active thermal values.**
   `thermals-fresh-390-light.png` initially displayed yellow numerals on white,
   approximately 1.89:1 contrast. The author changed numeric text to `--ink`
   while keeping yellow on the active rail and roundel. Same-state recaptures
   at phone and wide sizes show clear dark/light numerals. Approximate contrast
   is now 16.72:1 on white, with the appropriate light ink in dark mode.
2. **P2, resolved: internal vocabulary in Jobs.**
   `jobs-fresh-320-light.png` initially exposed bare `known` and an explanation
   about accepted normalization. The author changed these to `Current job`,
   `History not implemented`, and `Previous jobs aren't available in this view
   yet.` Same-width recapture verifies plain, unclipped copy without claiming
   history exists.
3. **P2, resolved: low-contrast footer warnings.**
   Stale/offline/refresh-failure text initially used red with approximately
   3.79:1 contrast on white. Final same-state light/dark captures and browser
   computed styles confirm light rgb(184,50,50) and dark rgb(255,133,133),
   approximately 5.93:1 and 7.02:1 against their card surfaces. The label still
   communicates state in text, independently of color.

Initial fixture screenshots also included blank space below cards because the
harness initialized its iframe at 1000 pixels. The validator corrected the
harness height and recaptured. That was a capture-normalization correction,
not a product-layout finding or an implementation fix.

**P3 follow-up, nonblocking:** the thermal bed row says `Unknown` for its heater
state beside valid actual/target values. `Heater state unknown` would clarify
which fact is missing. Cavity and other unmapped domains remain a separate
capability task; this pass does not convert them into working measurements.

### Five required fidelity surfaces

- **Fonts and typography:** title/body hierarchy, weights, line heights,
  tabular time, and head labels remain coherent in paired crops. Final numeric
  and warning contrasts are corrected. No clipped labels were found in the
  inspected phone/wide states. Source phone rasterization and exact font
  density are unknown, so pixel-identical antialiasing is not claimed.
- **Spacing and layout rhythm:** four head cards retain the selected layout;
  footer timestamp and 44-pixel refresh align below content. Thermal actual
  and target stay visible at 320/390 and the 400/410 breakpoint checks. Camera
  controls and longest missing-time overlay fit 320 pixels without overlap.
  Desktop rounded surfaces and mobile inset rhythm remain consistent.
- **Colors and tokens:** charcoal/white surfaces and yellow active markers
  remain consistent with the source. Live green versus fallback red is also
  text-labeled. Final warning and value contrast fixes preserve that hierarchy.
- **Image quality and asset fidelity:** camera mask/radius, overlay placement,
  icon legibility, and synthetic frame scaling are visually checked. Private
  source photographs are comparison references only; the fixture does not
  establish real JPEG sharpness, streaming compression, or physical visibility.
- **Copy and content:** no visible read-only/header boilerplate, transport/FPS
  debug, synthetic thermal traces, or mesh grids remain. Missing mappings say
  `Not implemented yet`; malformed loading has a finite error and Retry.
  Snapshot/live/fallback times occupy the image, with no separate camera footer.

### Rendered interaction and evidence boundaries

The validator's final observation report records 67 captures with no console
errors, external requests, or measured horizontal overflow. Camera records
cover snapshot/live/fallback at all three widths and both themes, missing time,
display rejection/coercion, and native fullscreen exit. Twelve synthetic
live-clock advance/stall-freeze checks and a native Chrome fullscreen check
pass; keyboard Tab reaches Refresh and Enter produces the next fixture result.
These tests use exact production HTML with a bounded synthetic host/transport.

No fixture acquires printer telemetry or real media. Host PiP is synthetic
request/response behavior; native iPhone picture-in-picture, actual ChatGPT
mounting, assistive-technology announcements, real mobile touch, service
deployment, and unmapped printer data remain unverified. A headless PASS does
not close those gates or erase the historical blocked checks below.

### Next implementation checklist

- Preserve the final reviewed assets and attach independent formal source
  review before changing PR delivery state.
- After separately authorized rollout, verify the actual phone's mounted
  card, camera timestamp/fallback behavior, fullscreen/PiP, and navigation.
- Implement missing printer-data domains through their own evidence boundary;
  do not interpret accepted empty-state presentation as data implementation.

## Historical connected-browser gate before headless authorization

## Current comparison target

- Source visual truth: the user-supplied phone screenshots of Heads and
  Filaments, snapshot/live Camera, and repeated Waiting cards, together with
  the requested footer/overlay changes in decision 0023. Attachments remain
  outside the repository; private camera images are not copied or committed.
- Source visual truth path: external conversation attachments, deliberately
  not persisted as repository paths.
- Source image dimensions: supplied phone captures are 590 by 1280 pixels;
  the exact embedded card CSS viewport and device scale are not established.
- Implementation: current `public/widget.html` and `public/camera-widget.html`.
- Implementation screenshot path: unavailable; no connected supported browser.
- Intended check viewports: 320, 390, and 720 CSS pixels wide. No implementation
  screenshot dimensions, device scale, or density normalization are claimed.
- States: all eight focused projections; missing, stale, offline and failed
  delivery; camera snapshot, connecting, fallback, live and display-mode exits.
- Primary interactions tested in a browser: none. VM tests are recorded in the
  active iteration and are not a rendered interaction check.
- Browser console errors checked: no; the browser was unavailable.

## Full-view and focused-region comparison

Blocked. The source screenshots were supplied in the conversation, but a
matching rendered implementation could not be captured. There is no valid
paired full-view or focused-region comparison, no normalized density match,
and no basis for claiming pixel fidelity or responsive polish.

## Findings

- [P1] Rendered acceptance unavailable.
  - Location: observation footer, narrow thermal/head layouts, camera status
    and display-mode controls.
  - Evidence: supported browser selection reported no available browser; the
    root's browser inventory was empty.
  - Impact: source tests cannot establish readable spacing, no overflow,
    touch/focus behavior, accessible announcements, or iPhone fullscreen/PiP.
  - Next check: capture the exact changed assets and compare with the supplied
    target at matching widths/states, then test the mounted phone host.

## Required fidelity surfaces

- Fonts and typography: rendered family/weight, wrapping, timestamp width and
  title hierarchy unverified.
- Spacing and layout rhythm: bottom-footers and image overlays specified by
  decision 0023; rendered balance and 320-pixel collisions unverified.
- Colors and tokens: existing tokens retained by design; contrast, fallback
  signaling and live status distinction not visually accepted.
- Image quality and asset fidelity: no new camera capture or implementation
  image inspected; retained JPEG and live-video behavior has separate software
  tests, not visual fidelity acceptance.
- Copy and content: independent production-script tests verify no repeated
  permission chrome and honest missing/unknown states; visual truncation and
  assistive-technology presentation remain unverified.

## Comparison history and implementation checklist

- Initial current pass: blocked before rendered comparison. No visual
  correction or post-fix screenshot is claimed.
- Capture matching light/dark states at phone and strip widths.
- Compare title/content/footer and camera-only image anatomy together with
  the supplied source; inspect keyboard/touch focus and overflow.
- Exercise snapshot load/failure, live-frame stall/fallback, fullscreen/PiP
  entry/rejection/exit and screen-reader announcements in the actual host.
- Keep unmapped queue/fan/mesh/cavity/filament/history domains explicit; no
  chart placeholders may be accepted as measured values.

Historical connected-browser result: blocked

## Historical status-card theme QA

- Source visual truth: external user attachment, `Screenshot 2026-08-26 at 11.40.27 AM.png` (not retained in the repository)
- Brand source: official Snapmaker U1 page and its served stylesheet, `https://www.snapmaker.com/snapmaker-u1`
- Implementation: private status dashboard `/dashboard?reload=6`
- Source pixels: 1532 x 700
- Intended implementation viewport: 1123 x 994 CSS pixels at device scale 1
- Implementation screenshot: unavailable because the configured in-app browser runtime reported no connected browser
- State: completed print with camera available; desktop dashboard
- Density normalization: not performed because no implementation capture was available

## Full-view comparison evidence

Blocked. The source reference was opened and inspected. The implementation
served the expected Snapmaker theme tokens and camera-mode structure over
private HTTPS, but HTTP and source checks are not rendered visual evidence.

## Focused region comparison evidence

Blocked for the same reason. The intended mapping is limited to the existing
card's color system: official Snapmaker charcoal surfaces, warm-white content,
yellow as the identifying accent, and orange for paused or attention states.
Green and red are separate semantic colors for positive/connected and
negative/disconnected feedback. The latest interaction change also puts camera
mode status on the left and its live/close action on the right.

## Findings

- [P1] Browser-rendered comparison is unavailable.
  - Location: full status card and camera overlay.
  - Evidence: the browser inventory was empty, so no implementation screenshot,
    interaction check, or console check could be captured.
  - Impact: token correctness is verified, but contrast, balance, and visual
    fidelity cannot be accepted from source code or HTTP responses alone.
  - Fix: reconnect the in-app browser, reload the private dashboard, capture the
    completed snapshot state, and compare it with the source reference.

## Required fidelity surfaces

- Fonts and typography: unchanged by scope; rendered weight and antialiasing are unverified.
- Spacing and layout rhythm: unchanged by scope; rendered layout is unverified.
- Colors and visual tokens: official-page charcoal, warm white, yellow, and orange tokens are present in the served widget; semantic green/red are separate; rendered balance and contrast are unverified.
- Image quality and asset fidelity: camera imagery is unchanged; snapshot/fallback now uses the existing disconnected-camera icon and live uses a pulsing dot; live rendering is unverified.
- Copy and content: live FPS is measured from delivered JPEG frames rather than copied from configuration.

## Comparison history

- Initial pass: blocked before comparison because no browser-rendered implementation capture was available.

## Implementation checklist

- Reconnect the in-app browser.
- Reload `/dashboard?reload=6`.
- Capture the completed snapshot state at 1123 x 994.
- Check the camera action, progress, status, metric, and refresh accents for contrast.
- Capture live, snapshot, and snapshot-fallback states if exercised; verify the
  left status/right action order, the semantic indicators, and the measured-FPS
  transition.

Historical status-card result: blocked

Current final result: blocked
