# Orca Preparation discovery findings

- Observed: 2026-08-23
- Scope: local, non-mutating capability discovery and official-source review
- Evidence class: labeled real-Orca tool integration plus static source review
- Excluded: user models, production slicing, printer upload, print start, and
  physical-print claims

## Observed local candidates

| Candidate | Bundle version | CLI banner | Executable SHA-256 |
| --- | --- | --- | --- |
| OrcaSlicer | `2.4.2` | `OrcaSlicer-2.4.2` | `f22fe59f43f167503f11802d49a984787c896bd8a0ebc0c0af6cc6912b33a801` |
| Snapmaker Orca | `2.3.5` | `Snapmaker_Orca-01.10.01.50` | `4c30e59cf582dcc4f12e43741fcab2f97045e972065d465481ed3760678d0fbe` |

The observed macOS invocation paths are
`/Applications/OrcaSlicer.app/Contents/MacOS/OrcaSlicer` and
`/Applications/Snapmaker Orca.app/Contents/MacOS/Snapmaker_Orca`. Both are
universal `arm64` and `x86_64` Mach-O executables. These observations identify
available candidates; they do not select the first product backend.

`--help` returned exit code `0` and the CLI banner for both candidates.
`--version` is not a supported option in either observed build; it printed the
help text, reported an invalid option, and returned `254`. Capability discovery
should therefore parse a successful `--help`, read bundle metadata where
available, and fingerprint the executable rather than assuming a conventional
version command.

The repository-external G-code discovery helper found the upstream OrcaSlicer
path but did not discover Snapmaker Orca. Product discovery must allow an
explicit backend executable and must not treat the two editions as aliases.

Official release references:

- <https://github.com/OrcaSlicer/OrcaSlicer/releases/tag/v2.4.2>
- <https://github.com/Snapmaker/OrcaSlicer/releases/tag/v2.3.5>

## CLI preparation boundary

Both observed CLIs advertise STL and 3MF input, profile loading, arrange and
transform operations, plate slicing, and project, settings, slice-data, and STL
exports. The relevant preparation shape is:

```text
explicit executable
+ isolated data directory
+ input model or project
+ machine and process settings
+ filament settings
+ bounded output directory
-> one or more plate_N.gcode artifacts
```

Advertised controls include `--datadir`, `--load-settings`,
`--load-filaments`, `--outputdir`, `--arrange`, `--orient`, `--slice`,
`--export-3mf`, and `--export-settings`. Command-line settings take precedence
over loaded settings and filaments, which take precedence over embedded 3MF
values. The adapter must preserve those layers separately rather than reporting
only the resolved value.

Bundled vendor JSON files commonly inherit from other presets. A single child
fragment is not assumed to be a complete machine or process configuration.
The first fixture should use either a project saved by the selected Orca GUI
with embedded settings or an explicitly resolved and fingerprinted profile set.

The observed upstream Snapmaker profile bundle reports version `02.04.00.07`;
the Snapmaker Orca bundle reports `02.02.50.02`. Each lists 19 model variants
covering the A250 and A350 families, Artisan, J1, and U1. Profile presence is
slicing evidence only and does not prove that the same edition can connect to
or control every listed printer.

## macOS diagnostics and safety limits

The help text advertises `--pipe`, but the v2.4.2 upstream and v2.3.5 Snapmaker
sources compile CLI pipe callbacks and `result.json` recording only on Linux.
The macOS adapter must instead record process exit, bounded stdout and stderr,
output inventory, file timestamps and hashes, and independent G-code
validation. It must not promise progress events or `result.json` on the basis of
the help text alone.

`--no-check` bypasses validity checks and is not part of the normal product
surface. CLI post-processing scripts are explicitly unsupported. Custom G-code
inside projects or profiles remains subject to `ORCA-004`; an isolated
`--datadir` does not by itself make custom G-code safe.

Source references:

- <https://github.com/OrcaSlicer/OrcaSlicer/blob/v2.4.2/src/OrcaSlicer.cpp>
- <https://github.com/Snapmaker/OrcaSlicer/blob/v2.3.5/src/Snapmaker_Orca.cpp>

## Preview and collaborative validation

The provisional review bundle contains an editable project, exact generated
plate G-code, preparation manifest, and static validation result. The exact
G-code is authoritative for toolpath review. Opening the project and reslicing
may produce a different artifact and therefore creates a new revision.

A user review records at least:

- preparation revision and plate identity;
- slicer edition and version used for preview;
- project and G-code hashes;
- accepted or rejected result;
- layer-specific notes or screenshots when useful.

Static G-code checks, user visual review, upload authorization, start
authorization, observed printing, and physical outcome remain separate
evidence. A successful preview does not authorize either Printer Operations
action.

## Manual support representations

Orca provides two practical representations for deliberate support placement:

1. A volume with type `SupportEnforcer` or `SupportBlocker`.
2. Per-triangle painting serialized in 3MF as
   `slic3rpe:custom_supports`.

The first representation is the preferred initial automation boundary. An
agent can propose bounded box, cylinder, or feature-derived enforcer and blocker
volumes; the user can inspect them in the editable 3MF and inspect the resulting
support paths in the exact G-code. An enforcer expresses support intent but does
not promise that Orca will print a solid copy of the enforcer geometry.

Facet painting is technically serializable, but Orca encodes triangle states
and triangle subdivisions as a hexadecimal bitstream tied to mesh triangle
identity. Remeshing or replacing the source invalidates that assumption unless
painting is explicitly remapped and reviewed. The first implementation should
therefore preserve user-painted projects but should not synthesize facet paint
until golden round-trip fixtures exist.

Ordinary model geometry is not used as a hidden substitute for slicer support;
it may fuse to the model and lacks slicer-managed interface gaps. Designed
breakaway geometry is a separate explicit CAD request and review case.

Official references:

- <https://www.orcaslicer.com/wiki/print_prepare/prepare_support_painting>
- <https://github.com/OrcaSlicer/OrcaSlicer/blob/v2.4.2/src/slic3r/GUI/GUI_Factories.cpp>
- <https://github.com/OrcaSlicer/OrcaSlicer/blob/v2.4.2/src/libslic3r/Format/3mf.cpp>
- <https://github.com/OrcaSlicer/OrcaSlicer/blob/v2.4.2/src/libslic3r/Model.cpp>

## Snapmaker edition and printer boundary

Snapmaker Orca advertises remote printer monitoring and control in its GUI, but
the observed CLI exposes preparation operations and no upload, start, or monitor
command. GUI printer integration is not treated as a CLI contract. Snapmaker's
current product page states that the edition is optimized for U1 and that direct
machine connection for Artisan, Snapmaker 2.0, J1, and J1s is future work.

Upstream Orca includes a Snapmaker printer agent derived from its Moonraker
agent, but its presence in GUI source likewise does not expose a network-control
CLI. Orca Preparation does not call either private GUI integration.

Printer Operations must select by observed target and firmware rather than one
generic Snapmaker adapter:

| Family | Documented network boundary | Evidence limit |
| --- | --- | --- |
| U1 | Klipper, Moonraker, and Fluidd; Moonraker REST and WebSocket | Official firmware/source plus separate local read-only target evidence; exact local printer model still unknown |
| J1 and Artisan | SACP over TCP, port `8888` | Official protocol documentation; not tested here |
| Snapmaker 2.0 A250/A350 families | Snapmaker HTTP interface | Official protocol documentation; not tested here |

Official references:

- <https://www.snapmaker.com/en-EU/snapmaker-orca>
- <https://github.com/OrcaSlicer/OrcaSlicer/blob/v2.4.2/src/slic3r/Utils/SnapmakerPrinterAgent.cpp>
- <https://github.com/OrcaSlicer/OrcaSlicer/blob/v2.4.2/src/slic3r/Utils/MoonrakerPrinterAgent.cpp>
- <https://support.snapmaker.com/hc/en-us/articles/33344279396759-Snapmaker-U1-FAQ>
- <https://github.com/Snapmaker/u1-moonraker>
- <https://github.com/Snapmaker/Snapmaker-SACP/blob/main/docs/README.md>

## Unvalidated claims and next experiment

No real slice was executed during this discovery, so the following remain open:

- successful slicing of one non-user fixture with an explicit complete profile;
- output naming, estimates, warnings, and static validation on the observed
  macOS binaries;
- GUI-versus-CLI parity for the selected backend and profile;
- Snapmaker-specific Full Spectrum or multi-toolhead behavior through CLI;
- 3MF support-enforcer and blocker round-trip plus resulting G-code paths;
- preservation, not synthesis, of a user-painted support project;
- any upload, start, monitoring, or physical-print behavior.

The smallest next experiment is a no-printer review bundle from one synthetic
fixture and an explicit profile, using isolated data and output directories.
Run dry-run, slice, static G-code validation, and matching-GUI preview without
uploading the artifact.
