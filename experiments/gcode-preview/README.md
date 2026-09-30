# Offline planned-toolpath experiment

A private F0/P03 feasibility experiment. This code has no production imports,
network calls, printer access, live progress mapping or deployment registration.
It reconstructs nominal extrusion centerlines from an annotated Orca/Klipper
G-code file. It does not recover CAD solids or verify physical deposition.

Run from the repository root, choosing private paths outside Git:

```sh
uv run --no-project python experiments/gcode-preview/preview.py "$PRIVATE_GCODE" "$PRIVATE_PREVIEW"
uv run --no-project python -m unittest discover -s experiments/gcode-preview -p 'test_*.py'
```

The output is an inline HTML fragment with embedded geometry and a SHA-256 of
the exact input bytes. It contains no input path, filename or arbitrary comments.
Keep the geometry and generated HTML outside Git. The viewer performs no network
requests. An adjacent `-standalone.html` file includes a local stylesheet and
needs no external resources. It is only a local review surface.

Supported: millimeter XYZ linear moves, independent G90/G91 and M82/M83 modes,
G92 coordinate/extrusion resets with explicit axes (bare G92 is rejected),
retraction debt and partial recovery, one-turn
G17 incremental-I/J G2/G3 arcs (0.02 mm maximum chord error, <=10 degree steps),
and Orca `LAYER_CHANGE`/`Z` annotations. Absolute E requires a sliced-region G92 E
baseline. Tool identity must be declared before deposition; changing tools in
the sliced region is rejected. This is deliberately a single-tool experiment.
Input is bounded to 20,000,000 bytes and 500,000 processed vertices, including
vertices coalesced into prior paths; inline output must be under 1,000,000 bytes.
The raised vertex budget supports the selected larger printer file and remains
an enforced offline experiment limit.

Path-local signed integer deltas at the parser's existing 0.00001 mm precision
are deterministically gzip-compressed and base64-embedded. Encoding verifies
exact numeric round-trip and JavaScript safe-integer limits; it does not round
further, simplify or drop geometry. Native DecompressionStream is required by
both inline and standalone views. The decoder caps cumulative expanded bytes
at 16,000,000 while reading, validates schema, counts and coordinate bounds, and
keeps controls disabled until ready. Unsupported decoding, malformed data or
exceeded budgets show an unavailable state with no geometry.

Startup before the first layer and end routines from PRINT_END are excluded.
Travel, retraction and stationary extrusion do not become deposited paths.
Z hops do not create layers. Unknown sliced-region commands/parameters and
unsupported coordinate modes reject the file. Two known per-layer firmware
macros are disclosed as unexpanded; nominal paths assume they restore slicer
state. Their hidden motion and physical effects cannot be inferred here.

The renderer projects the real 3D path coordinates orthographically onto canvas.
It draws future paths faintly, earlier paths solid and the selected preview layer
highlighted, with no time or observed-completion semantics. This lightweight
centerline rendering has no mesh surface, bead widths, depth buffer or material
colors. View presets provide keyboard access alongside drag rotation. An
only-selected-layer option supports comparison of first/middle/final layers.

Author synthetic tests verify parsing behavior. Independent source, browser and
historical witness checks are recorded in the active iteration evidence record.
A fresh native Orca comparison and user visual acceptance remain separate gates.
