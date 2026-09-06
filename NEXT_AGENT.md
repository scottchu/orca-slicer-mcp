# Next agent

## Immediate task: finish the same-information spacing correction

Read [current state](PROJECT_STATE.md), [requirements](docs/requirements.md),
the [brief](docs/iterations/2026-08-23-f0-dual-subsystem-foundation/BRIEF.md) and
[spacing evidence](docs/iterations/2026-08-23-f0-dual-subsystem-foundation/evidence/2026-09-06-composition-spacing.md).
PR111 / 0.4.13 remains deployed; the 0.4.14 spacing candidate is not a released
or independently approved build merely because author tests pass.

1. Task-owned fixture/browser cleanup and the narrow spacing implementation are
   complete. Review final Smart with the same four attributes; do not compare
   its content density against Compact's two-field subset.
2. Finish independent exact-candidate source review and targeted verification.
   Keep the legal-decimal two-line regression covered.
3. If approved, one release operator runs existing mandatory local/PR/ship guards,
   deploys the exact merged build, restarts both services and verifies scoped
   behavior. Do not duplicate a full regression merely for a reviewer handoff.

The user reports Camera Auto/Live worked at home and outside use worked well;
record this bounded observation without claiming long-duration or mounted-host
acceptance. C08 is not closed by health checks or synthetic results.

## Preserve

The Lab stays private and unregistered. No printer controls, authentication,
Tailscale or plugin reinstallation belongs to this task. Do not adopt unrelated
Camera planning. Preserve all [delivery IDs and gaps](docs/widget-delivery.md).
Intermittent tool file-descriptor pressure is not a reason to kill user sessions
or bypass required independent approval. History remains in the
[PR110 archive](docs/history/2026-09-05-pr110/README.md).
