<script lang="ts">
  import { AlertTriangle, CheckCircle2, History, XCircle } from 'lucide-svelte';
  import ObservationFrame from '../common/Frame.svelte';
  import { formatClock, formatDuration, titleCase } from '../../lib/client/observation/format';
  import type { JobHistoryObservation } from '../../lib/client/observation/types';
  import LoadingValue from '../common/LoadingValue.svelte';
  import { structureCount, type FailureProps } from '../../lib/client/observation/loading';
  import type { Snippet } from 'svelte';
  import type { HistoryPresentation } from '../../lib/client/live/focused-presentation';
  import Caption from '../common/Caption.svelte';
  type Props = FailureProps & { lab?: boolean; meta?: Snippet; actionLabel?: string; feedback?: string; failureMessage?: string } & ({ observation: JobHistoryObservation; live?: never; loading?: false; refreshing?: boolean; rows?: never } | { live: HistoryPresentation; observation?: never; loading?: false; refreshing?: boolean; rows?: never } | { loading: true; live?: never; observation?: never; refreshing?: never; rows?: number });
  let { observation, live, loading: pending = false, refreshing = false, rows = 4, failure, onretry, lab = true, meta, actionLabel, feedback, failureMessage }: Props = $props();
  const loading = $derived(pending || !!failure);
  const accepted = $derived(live ? { sourceObservedAt: live.receipt.sourceObservedAt, freshness: live.receipt.freshness, items: live.items.map(item => ({ ...item, endedAt: item.endTime, durationSeconds: item.printDurationSeconds })) } : (pending ? null : observation ?? null));
  const history = $derived(failure ? null : accepted);
  const items = $derived(history?.items ?? Array.from({ length: structureCount(accepted?.items.length ?? rows, 20) }, (_, index) => ({ position: index + 1 })));
</script>

<ObservationFrame title="Job History" icon={History} observedAt={history?.sourceObservedAt ?? null} freshness={history?.freshness ?? 'unknown'} stateKind={failure ?? (pending ? 'loading' : 'ready')} placeholder={loading} {onretry} {refreshing} {lab} {meta} {actionLabel} {feedback} {failureMessage}>
  {#if !lab && !loading && live}<Caption>{live.pageCount === null ? 'History not observed' : `${live.pageCount} recent records returned`}</Caption>{/if}
  <div class="observation-list">
    {#each items as item, index}
      <div class="observation-row history-row" class:live-row={!lab}>
        <div class="history-status">
          {#if loading}<History aria-hidden="true" />
          {:else if history?.items[index].status === 'completed'}<CheckCircle2 class="completed" aria-hidden="true" />
          {:else if history?.items[index].status === 'cancelled'}<XCircle aria-hidden="true" />
          {:else if history?.items[index].status === 'in_progress' || history?.items[index].status === 'unknown'}<History aria-hidden="true" />
          {:else}<AlertTriangle aria-hidden="true" />{/if}
          <div><strong><LoadingValue {loading} text={loading ? undefined : (live && !loading ? live.items[index]?.filename : history ? titleCase(history.items[index].status) : undefined)} /></strong><span><LoadingValue {loading} text={loading ? undefined : (live && !loading ? `${titleCase(live.items[index].status)} · ${live.items[index].endTime === null ? 'End time not reported' : new Date(live.items[index].endTime!).toLocaleString()}` : history?.items[index].endedAt ? formatClock(history.items[index].endedAt!) : 'Time unknown')} size="long" /></span>
            {#if !lab}<Caption><LoadingValue {loading} text={loading ? undefined : (live?.items[index]?.startTime == null ? 'Start time not reported' : `Started ${new Date(live.items[index].startTime!).toLocaleString()}`)} /></Caption><Caption><LoadingValue {loading} text={loading ? undefined : (live?.items[index]?.totalDurationSeconds == null ? 'Total duration unknown' : `Total ${formatDuration(live.items[index].totalDurationSeconds!)}`)} /> · <LoadingValue {loading} text={loading ? undefined : (live?.items[index]?.filamentUsedMillimeters == null ? 'Filament unknown' : `${live.items[index].filamentUsedMillimeters} mm filament`)} /></Caption>{/if}
          </div>
        </div>
        <span><LoadingValue {loading} text={loading ? undefined : (history?.items[index].durationSeconds == null ? 'Duration unknown' : formatDuration(history.items[index].durationSeconds!))} /></span>
      </div>
    {/each}
  </div>
</ObservationFrame>

<style>
  .history-row { display: flex; align-items: center; justify-content: space-between; gap: 14px; }
  .history-status { display: flex; align-items: center; gap: 10px; min-width: 0; }
  .live-row .history-status { flex: 1; }
  .live-row .history-status div { min-width: 0; width: 100%; }
  .live-row > span { flex: none; }
  .history-status :global(svg) { width: 19px; height: 19px; color: var(--u1-muted); }
  .history-status :global(svg.completed) { color: var(--u1-positive); }
  .history-status div { display: grid; gap: 2px; }
  .live-row .history-status div { overflow-wrap: anywhere; }
  .history-status strong { font-size: 14px; font-weight: 600; }
  .history-status span, .history-row > span { color: var(--u1-muted); font-size: 12px; font-variant-numeric: tabular-nums; }
</style>
