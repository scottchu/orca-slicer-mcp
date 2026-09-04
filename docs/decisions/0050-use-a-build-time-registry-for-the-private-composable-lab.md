# 0050 — Use a build-time registry for the private composable Lab

- Status: accepted for the isolated private-lab experiment; not accepted as production architecture or cutover
- Date: 2026-09-04
- Owners: project maintainers
- Milestone: F0 / UI-003

## Context

The version-2 private Lab proved that fixed T1 status, temperature, filament
color and typed fan relation can share one validated, provenance-bearing
composition. Its renderer still selected components through a hand-written
type chain, however, and the temperature-only `PercentageFill` created a
content background without an icon relationship. The rendered result made the
reserve geometry visible and biased the apparent text group upward.

The user selected build-time separation: common and domain elements should be
registered with their prop contracts, JSON should select only registered
elements, and no important module path should be supplied dynamically.

## Decision

For this private experiment, one pure TypeScript element registry is the closed
authority for exactly eight elements: built-in `Card`, `Title`, `Stack`, and
`Grid`, plus domain `HeadStatus`, `HeadTemperature`, `FilamentColor`, and
`FanRelation`. Each definition records its structural role, strict spec and
resolved prop schemas, child policy, and any field/source mapping. The registry
has no Svelte, server, reader, transport, filesystem, or runtime-registration
dependency. Spec and resolved-tree schemas construct their allowed child arrays,
tuple positions and cardinality directly from those policies; they do not keep
a second hand-written structural rule.

A client-only registry statically imports and binds one Svelte component for
each of the same eight names. A parity test rejects missing or extra bindings,
and compile-time exact checks compare every constructor with a separately owned
prop contract derived from the resolved node model. Every client entry owns its
resolved-node-typed props adapter and a child reader constrained by the pure
registry role. The recursive renderer dispatches only on whether that role can
carry children; it contains no concrete element-name branch. Its sole uniform
dynamic cast is sealed inside typed entry construction after constructor,
adapter, required props and node type agree, not exposed as an all-optional prop
surface.
All permitted constructors are therefore known and bundled at build time; JSON
cannot provide an import, module path, URL, expression, arbitrary component,
HTML, CSS, JavaScript, or style token.

Retire `PercentageFill` and its experiment-only surface. Do not retain a no-op
alias: old version-2 inputs containing that name fail strict validation before
any reader is called, and canonical JSON, resolved output and the generated MCP
resource omit it. Keep schema/tool/resource version 2 because this is a private,
provisional, unregistered Lab with no supported external version-2 consumer;
bump only the isolated MCP implementation version to `0.0.3-provisional`.
Preserve the unrelated common `PercentageBackground` used by Thermals and Fans,
and preserve Card's separately declared soft filament tint.

Visible-content centering belongs to common value primitives, not domain CSS or
wire styling. Metric, Badge and Swatch center their real label/value or skeleton
group within the existing structural reserve so the group aligns with the
reading icon while loading, error and known topology remains stable.

## Consequences

Adding an element now requires an authored build-time registry entry, strict
schemas, a static Svelte binding and review; an agent response cannot load new
code. Registry metadata can be reused by strict schema construction, planning,
correlation and rendering without merging server acquisition and client UI
layers.

This remains exploratory. The registry does not approve a general DSL,
DataTable, Queue, History, Camera, live printer mapping, production
registration, deployment, controls, authentication, Tailscale changes, or a
compatibility promise for private Lab payloads.

## Validation

Require exact eight-entry schema/component parity; strict prop and unknown-node
adversaries; rejection of prior `PercentageFill` input before reader calls;
absence of that node in canonical/resolved/generated output; unchanged
deduplicated acquisition, timestamp/provenance and fan ambiguity cases; static
error and animated loading skeletons; shared Thermals/Fans percentage consumer
coverage; and negative production registration/import inventory.

At 320, 390 and 720 pixels and at 100 and 200 percent text, known, loading,
error, partial and ambiguous states must retain topology and height within one
pixel, avoid overflow and tables/separators, and align every visible
label/value-or-skeleton union with its reading icon center within one pixel.
Bind review to the exact source, build, HTML and isolated MCP resource
identities. These tests remain synthetic software/protocol evidence only.
