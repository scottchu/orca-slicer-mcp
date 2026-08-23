# F0 dual-subsystem foundation validation

## Environment

- Working baseline: `be883d3`
- OrcaSlicer environment: not selected
- Printer and firmware: not selected
- Validators: primary agent plus independent product and architecture agents

## Commands and results

- `bash -n scripts/check-repository.sh`: passed on 2026-08-23.
- `./scripts/check-repository.sh`: passed with `repository contract: ok` on
  2026-08-23, including the single-active-iteration guard.
- `git diff --check`: passed on 2026-08-23.
- Relative Markdown link check using `perl` extraction plus filesystem checks:
  passed on 2026-08-23.
- Terminology scan excluding superseded decision 0001 and the historical M0
  iteration found no authoritative single-subsystem or deferred-Orca framing.
- Independent product consistency review: passed after all findings were
  repaired.
- Independent architecture and safety review: passed after mandatory managed
  provenance and validation records were repaired.

## Requirement evidence

Current work is limited to the static product contract. No OrcaSlicer,
protocol, simulator, printer, or user-outcome requirement has been validated.

## Acceptance state

- Static/software: dual-subsystem documentation contract and repository checks
  passed on the working branch; no runtime behavior was tested.
- Protocol/simulator: not started.
- Real printer: not started.
- User outcome: not evaluated.

## Failures, repairs, and reruns

- The first architecture review found authorization, provenance, dependency,
  custom G-code, and evidence-taxonomy gaps. They were repaired and re-reviewed.
- The first consistency review found two active iterations, combined
  upload/start language, privacy omissions, and stale framing. They were
  repaired and re-reviewed.
