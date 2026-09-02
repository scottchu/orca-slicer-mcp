# Keep Heads color and Copy coherent

Date: 2026-09-02. Status: adopted presentation direction; exact acceptance pending.
Milestone: F0, OBS-010/UI-003, refining decision0037 without a new data path.

The independent UI/UX inspection found that a ten-character ready value reserve
plus a wrapping footer pushed the44px Copy action into an orphan second row.
At390px, the132px card interior fits natural RGB but not full swatch/RGBA/Copy.
Forcing one unbreakable row or shrinking the action is therefore not acceptable.

Use a scoped InsetCard action-column variant: Copy stays in its own44px right
column. A reusable ColorValue owns the left group; the decorative swatch may
wrap above a whole naturally sized hex, but hex characters never split and Copy
never moves alone underneath. Empty/unknown retain their truthful label with no
button. Loading has no private text/color and an inert44px action skeleton.
Global Inline and LoadingValue behavior remain unchanged.

The scoped CardGrid minimum is the public maximum nine-character hex width,
plus44px action,4px gap and26px card insets. The measured current Chrome/font
stack maximum is83.065px at13px caption and161.027px at26px. A6.4-times-caption
bound therefore yields157.2px/240.4px minimum cards, permitting two cards at390px
normal but one at320px or390px enlarged text. It is a font-relative constraint,
not a device breakpoint or private value-derived measurement. Renew boundary
tests on font/token changes; this is not proof for untested platform typography.
Ready labels have no width reserve; loading's neutral9ch shape is public.
The subgroup's inline/stacked layout uses that same public maximum plus the
17px swatch and4px gap, not each ready label's actual width. This prevents
loading and wide RGBA from choosing different wrap points at enlarged sizes.

The inherited all-view850px shell limit and unconditional two-column assertion
cannot describe four content-sized Heads rows at320px. An independent contract
review replaces them for Heads only with row anatomy:12px card insets/gaps,
1px/3px card borders, a bounded two-line header, two natural body rows, and a
footer of1px border +8px inset +max(44px action, intrinsic color-group height).
Grid rows use the maximum intrinsic card height plus12px row gaps. All other
widgets keep850px; no transition, clipping or touch-target threshold is relaxed.

Acceptance requires coherent right-side Copy, exact RGB/RGBA including wide
public hexadecimal strings, whole-text containment,44px action, no text/icon
overlap or horizontal overflow, and unchanged closed-fixture loading/ready
geometry at320/390/590/720 with normal/200% text. Add checks around column
transitions; equal card heights alone do not establish useful layout. Preserve
copy success/rejection/busy focus, removed-action fallback, material receipts,
long-material wrapping and all acquisition/privacy contracts.

Only shared Heads presentation and its actual transitive packages change.
Other package bytes and all individual/aggregate limits remain unchanged.
Independent source review and targeted verification by agents other than the
author precede guarded PR delivery. Software/service and actual-device evidence
remain distinct; no printer command or real acquisition is authorized here.
