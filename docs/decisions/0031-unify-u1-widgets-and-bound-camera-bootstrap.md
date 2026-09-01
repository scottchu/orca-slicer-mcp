# 0031 — Unify U1 widget presentation and bound camera bootstrap

Date: 2026-08-31

Status: accepted for source validation; not yet shipped

## Decision

All current focused observation resources and the camera resource use one
versioned, locally injected CSS source with the same card, header, body, footer,
data-row and action anatomy. The self-contained resources make no stylesheet or
icon-network request. The Progress card keeps its headline result in the header
grid at mobile widths; information remains above bottom actions.

Camera bootstrap permits one in-flight acquisition and must accept and decode a
snapshot or terminate as unavailable within twelve seconds. A retained snapshot
survives failed, late and out-of-order work. Remounted live intent first restores
a truthful snapshot, then makes one bounded live attempt. Same-document
fullscreen changes presentation only and do not recreate the peer, track or
frame observer. Feedback is an in-media toast below the camera controls.

Bed Mesh uses exact-pinned, locally bundled Three.js and OrbitControls for the
orthographic 3D view, with an exact SVG 2D fallback. The committed generated
bundle is reproducible and checked against its source build. Its served bytes
retain the complete upstream MIT copyright, permission and notice text rather
than depending on a build-machine `node_modules` license file.

## Boundaries

- This does not add printer controls, routes, tools, authorization, or recording.
- Existing normalized observation data and adapter boundaries remain unchanged.
- Source and simulator tests do not prove browser/device rendering or physical
  printer behavior.
