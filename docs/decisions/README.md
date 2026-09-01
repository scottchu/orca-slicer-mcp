# Decision records

Decision records capture choices that would otherwise be rediscovered or
silently changed.

## Index

| ID | Decision | Status |
| --- | --- | --- |
| [0001](0001-printer-operations-product-boundary.md) | Printer operations is the product boundary | Superseded by 0003 |
| [0002](0002-repository-continuity-workflow.md) | Use lightweight repository continuity records | Accepted |
| [0003](0003-two-peer-subsystems.md) | Two peer subsystems with an explicit handoff | Accepted |
| [0004](0004-separate-monitor-control-and-admin-api-surfaces.md) | Separate monitor, control, and admin API surfaces | Accepted |
| [0005](0005-mcp-is-a-replaceable-inbound-surface.md) | MCP is a replaceable inbound surface | Accepted |
| [0006](0006-use-hybrid-snapshot-and-subscription-monitoring.md) | Use hybrid snapshot and subscription monitoring | Accepted |
| [0007](0007-prototype-skills-before-shared-cli.md) | Prototype skills before a shared CLI | Partially superseded by 0008 |
| [0008](0008-build-read-only-status-view-before-shared-cli.md) | Build the read-only status view before a shared CLI | Partially superseded by 0009 |
| [0009](0009-relay-camera-frames-through-monitor-boundary.md) | Relay camera frames through the monitor boundary | Partially superseded by 0014 |
| [0010](0010-mobile-status-card-over-personal-oauth-and-funnel.md) | Deliver the mobile status card over personal OAuth and Funnel | Partially superseded by 0011 |
| [0011](0011-use-standard-https-and-keep-distribution-model-open.md) | Use standard HTTPS and keep the distribution model open | Accepted for personal developer testing |
| [0012](0012-return-an-image-fallback-for-non-component-hosts.md) | Return an image fallback for non-component hosts | Partially superseded by 0014 |
| [0013](0013-rotate-personal-oauth-refresh-tokens.md) | Rotate personal OAuth refresh tokens | Accepted for personal developer testing |
| [0014](0014-separate-continuous-camera-relay-from-mcp-and-http.md) | Separate the continuous camera relay from MCP and HTTP | Partially superseded by 0015 |
| [0015](0015-use-webrtc-camerastreamer-for-live-presentation.md) | Use webrtc-camerastreamer for live camera presentation | Partially superseded by 0016 |
| [0016](0016-use-local-connector-and-mcp-apps-bridge.md) | Use a local connector and the MCP Apps bridge for hosted signaling | Accepted for the F0 local-first rollout slice |
| [0017](0017-secure-remote-monitor-enrollment-and-turn-boundaries.md) | Separate remote enrollment and require configurable TURN credentials | Accepted for the user-authorized F0 secure remote monitor slice |
| [0018](0018-separate-camera-presentation-from-live-signaling.md) | Separate camera presentation from live signaling | Partially superseded by 0019 |
| [0019](0019-gate-camera-sessions-behind-mounted-widget-activation.md) | Gate camera sessions behind mounted-widget activation | Partially superseded by 0020 |
| [0020](0020-terminate-printer-media-at-private-fanout-boundary.md) | Terminate printer media at a private fan-out boundary | Accepted for the user-authorized multi-viewer camera repair |
| [0021](0021-compose-focused-read-only-observation-widgets.md) | Compose focused read-only observation widgets | Accepted for the user-selected observation feedback loop |
| [0022](0022-supervise-versioned-personal-http-services.md) | Supervise versioned personal HTTP services | Accepted for the user-authorized personal service-persistence slice |
| [0023](0023-use-quiet-observation-footers-and-camera-overlays.md) | Use quiet observation footers and camera overlays | Accepted design; source validation and rendered acceptance tracked separately |
| [0024](0024-add-private-widget-directory.md) | Add a private widget directory | Accepted for the user-requested navigation-only source slice |
| [0025](0025-separate-current-job-and-job-history.md) | Separate Current Job and Job History | Accepted for the user-requested independently callable job views |
| [0027](0027-observe-reported-bed-mesh-on-demand.md) | Observe the reported bed mesh on demand | Accepted; deployed and read-only live acquisition verified |
| [0028](0028-ship-reviewed-u1-source-through-one-operator-workflow.md) | Ship reviewed U1 source through one operator workflow | Accepted; successful reviewed PR34 shipment verified |
| [0029](0029-complete-white-read-only-widget-suite.md) | Complete the white read-only widget suite | Accepted; shipped, visual acceptance pending |
| [0030](0030-present-reported-bed-mesh-as-interactive-surface.md) | Present the reported bed mesh as an interactive surface | Accepted; shipped, visual acceptance pending |
| [0031](0031-unify-u1-widgets-and-bound-camera-bootstrap.md) | Unify U1 widget presentation and bound camera bootstrap | Accepted; shipped, visual acceptance pending |
| [0032](0032-migrate-widgets-through-private-sveltekit-lab.md) | Migrate focused widgets through a private SvelteKit lab | Accepted for the bounded foundation slice |
| [0033](0033-compose-observation-widgets-from-closed-primitives.md) | Compose observation widgets from closed primitives | Accepted for first Thermals foundation slice |

Decision 0026 is reserved for the paused queue work outside this source slice.

Copy [the template](template.md) for new records. Accepted records should be
superseded by a new record rather than rewritten to change their conclusion.
