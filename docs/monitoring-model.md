# Printer Operations monitoring model

This document defines when Printer Operations performs a direct query and when
it maintains continuous state. Both are forms of observation. The difference is
whether the product needs one point-in-time value or a trustworthy sequence of
changes.

## Observation modes

### Direct query

A direct query requests a point-in-time snapshot through a printer adapter. It
is appropriate when data is static, changes rarely, is explicitly requested,
or can be reconstructed from a durable upstream source.

Direct query answers: **What does the source report now?**

### Continuous subscription

A continuous subscription maintains a persistent connection and consumes
ordered state deltas and lifecycle notifications. It is appropriate when a
transition may require notification, may be missed between polls, or contributes
to print-session history.

Continuous subscription answers: **What changed, when, and in what order?**

## Data classification

| Data | Direct query | Continuous state | Reason |
| --- | --- | --- | --- |
| Moonraker and Klippy readiness | Bootstrap and refresh | Connection lifecycle | Disconnect and reconnect must be observed without a user request |
| Firmware and API version | On connect | No | Changes only across restart or update |
| Loaded printer objects and capabilities | On connect or configuration change | No | Capability discovery is relatively static |
| Current printer and job state | Initial snapshot and explicit refresh | Yes | Printing, pause, completion, cancel, and failure transitions matter |
| Progress, layers, and duration | Initial snapshot | During an active session | Values change throughout a print |
| Temperatures, targets, and power | Initial snapshot | During relevant states | Needed for current state, verification, and selected alerts |
| Filament, entanglement, defect, and exception signals | Initial snapshot when available | Yes | Short-lived transitions may be missed by polling |
| Webcam configuration | On connect or change notification | No | Camera metadata changes rarely |
| Camera image | On demand, event-triggered, or bounded interval | Not as printer-object state | A snapshot is evidence with its own acquisition time |
| Camera live stream | User-interface concern | Optional | A monitor need not ingest or retain a permanent video stream |
| Files and G-code metadata | On demand | No | File contents and metadata are separately durable |
| Job history | On demand | Optional history notifications | Historical records can be queried after the fact |
| Monitor health and freshness | Query current value | Maintained internally | Consumers must distinguish current, stale, offline, and unknown data |

## Hybrid connection sequence

```text
connect
  -> query server info
  -> wait until Klippy is ready
  -> query capabilities
  -> query a complete initial state snapshot
  -> open or confirm the WebSocket subscription
  -> merge ordered diffs into current state
  -> record relevant transitions as session events
```

A subscription delta is not a complete state. For example, an update containing
only a new extruder temperature must be merged with the initial snapshot and
prior updates. The monitor never interprets an omitted field as cleared or
unchanged without the adapter contract defining that meaning.

## Disconnect and resynchronization

When the source connection is lost:

1. mark the affected state `stale`, `offline`, or `unknown` according to known
   evidence;
2. retain the last value with its original source time rather than presenting
   it as current;
3. emit a connection lifecycle event;
4. retry with bounded backoff;
5. after reconnect, repeat server readiness and full-snapshot bootstrap;
6. start a new connection epoch before merging new subscription deltas.

The monitor does not infer that a print completed successfully while it was
disconnected.

## Application and surface behavior

The monitor owns upstream Moonraker connections and reconstructs current state.
Normal MCP, HTTP, CLI, or UI status queries call the same application use case,
which reads that current state and its freshness metadata.

```text
MCP / HTTP / CLI
       |
QueryCurrentPrinterState
       |
current state + source time + freshness + connection epoch
```

An explicit refresh use case may request a new upstream snapshot, but inbound
adapters do not call Moonraker directly. This preserves a single normalization,
freshness, authorization, and event path across all surfaces.

## Minimum acceptance evidence

- initial snapshot plus later deltas reconstruct the expected current state;
- a missing delta field does not erase existing state;
- disconnect immediately makes freshness visible to every surface;
- reconnect obtains a complete snapshot before accepting a new delta stream;
- a transition between two user queries remains present in session history;
- camera acquisition time is distinct from printer telemetry time;
- the same current-state use case serves MCP and a non-MCP test adapter.
