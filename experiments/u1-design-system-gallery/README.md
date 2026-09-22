# U1 primitives and composition gallery

A fixed, offline review artifact for F0 / F02 / F04 / U01. This is a proposed
visual contract, not a production API, widget migration or revived dynamic Lab.

The default compares a bounded composition of current imported thermal
primitives against a gallery-local Cavity no-target and receipt-group proposal.
It is explicitly **not** a reproduction of the full shipped Thermals widget.
Secondary sections compare the actual Progress duration formatter with shared
DurationValue and show the actual common Camera Switch without media services.
All inputs are synthetic. Fixed source times are formatted in the browser's
local time zone; no clock is advanced and no acquisition is performed.

## Run with the installed toolchain

From the repository root, choose a private absolute output directory outside
tracked source, then run:

```sh
bun --no-env-file --config=/dev/null experiments/u1-design-system-gallery/build.ts "$GALLERY_OUTPUT"
bun --no-env-file --config=/dev/null experiments/u1-design-system-gallery/serve.ts "$GALLERY_OUTPUT" 0
```

The server prints its loopback URL. Port zero chooses a free port. It validates
and preloads exactly three hashed assets once before listening. Only exact GET
routes `/`, `/gallery.js` and `/gallery.css` are served. Query variants, other
methods, Upgrade and CONNECT are denied. CSP disables connections, frames,
images and form submission. There are no production routes or service imports.
The artifact and module graph remain private generated evidence, not source.
Stop the task-owned server with Ctrl-C after review; rebuilding does not change
an already-running immutable server. Restart explicitly to review new bytes.

Focused author verification uses the installed isolated Chromium:

```sh
bun --no-env-file --config=/dev/null experiments/u1-design-system-gallery/check.ts "$GALLERY_URL" "$GALLERY_EVIDENCE"
```

It captures 320/390 maximum-width specimens at 100/200% synthetic text scaling,
checks five thermal cases, six modeled acquisition phases, masked accessibility,
static failure placeholders under normal motion, stable card height, keyboard
Switch selection, and a narrow outer page. Browsers close in `finally`.
This does not test production controllers, actual phones or physical printers.

## Contract boundaries

- Existing DegreeValue owns numeric formatting, units and precision-aware accessible value.
  ActualTarget owns applicable actual/target composition. The proposal preserves
  both and renders Cavity's explicit No target outside DegreeValue.
- Existing ReadingRow owns inset, wrapping and the reported-active stripe.
  Gallery composition owns independent receipt association and section spacing.
- Successful missing values remain distinct from structurally absent targets.
  Healthy refresh retains accepted values. Failure and pending Retry mask values
  and receipts. State controls model these presentations; they do not exercise
  real acquisition. Footer buttons change only their local synthetic specimen.
- Max card width is capped by available space. The author matrix uses a wide
  outer viewport so actual specimen widths are exactly 320 and 390px. At a
  390px outer viewport the cards are 366px after page insets. Text scaling changes
  specimen type tokens and is not browser zoom or operating-system Dynamic Type.
- The baseline minute formatter and proposed common duration precision remain a
  visible choice. Estimates alone receive About; terminal time has no Remaining.
- Camera is a labeled static contract reference plus an interactive common Switch.
  Selected Live does not claim advancing frames. No stream, snapshot or printer
  request exists.

Production source, dependencies, configuration, routes and generated public
resources are untouched. Any selected widget adoption needs its separate
consumer coverage, independent review and existing shipping guards.
