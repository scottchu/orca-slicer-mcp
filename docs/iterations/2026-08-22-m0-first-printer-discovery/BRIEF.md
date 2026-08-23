# M0 first-printer discovery brief

- Iteration ID: `2026-08-22-m0-first-printer-discovery`
- Date opened: 2026-08-22
- Baseline: `main` at `26affbb`
- Status: active

## Outcome

Choose the first concrete printer environment and produce enough observed
protocol evidence to decide the first adapter and local deployment boundary.

## Scope

- exact printer model and firmware;
- connection and authentication paths;
- read-only telemetry and capability discovery;
- camera source and access method;
- candidate always-on host and network boundary;
- notification destination;
- active-print command inventory, without issuing consequential commands.

## Requirements

Primary discovery targets: `SESSION-001`, `OBS-001` through `OBS-003`,
`CAM-001`, `CTRL-001`, `ADJUST-001`, `DATA-001`, `DATA-002`, `AUTH-001`, and
`PORT-001` in `docs/requirements.md`.

## Explicit non-goals

- selecting an application language or framework before protocol discovery;
- implementing the resident service or MCP tools;
- issuing pause, cancel, temperature, motion, or Z-offset commands;
- camera-based diagnosis;
- slicing, upload, or print start;
- autonomous intervention.

## Risks and unknowns

- vendor API access may depend on cloud credentials or unsupported protocols;
- advertised capabilities may differ from active-print behavior;
- command acknowledgement may not reflect observed printer state;
- camera and printer may have different trust or network boundaries;
- remote access could expand security scope prematurely.

## Planned evidence

- redacted environment inventory in `docs/environment.md`;
- capability matrix tied to printer and firmware;
- reproducible read-only connection or protocol capture;
- tested reconnect or offline observation where safe;
- accepted ADRs for the first adapter and deployment boundary.

## Exit gate

M0 is complete only when the target environment is concrete, the read-only
connection path has observed evidence, and the next M1 vertical slice can state
its interfaces, safety boundary, and acceptance checks without guessing.
