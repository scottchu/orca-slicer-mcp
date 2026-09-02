<script lang="ts">
  import { AlertTriangle, CheckCircle2, History, XCircle } from 'lucide-svelte';
  import ObservationFrame from './ObservationFrame.svelte';
  import { formatClock, formatDuration, titleCase } from '../../lib/client/observation/format';
  import { validateJobHistory, type JobHistoryObservation } from '../../lib/client/observation/types';
  import LoadingValue from '../common/LoadingValue.svelte';
  import { loadingObservation, structureCount, type FailureProps } from '../../lib/client/observation/loading';
  type Props = FailureProps & ({ observation: JobHistoryObservation; loading?: false; refreshing?: boolean; rows?: never } | { loading: true; observation?: never; refreshing?: never; rows?: number });
  let { observation, loading: pending = false, refreshing = false, rows = 4, failure, onretry }: Props = $props();
  const loading = $derived(pending || !!failure);
  const accepted = $derived(loadingObservation(pending, observation, validateJobHistory));
  const history = $derived(failure ? null : accepted);
  const items = $derived(history?.items ?? Array.from({ length: structureCount(accepted?.items.length ?? rows, 20) }, (_, index) => ({ position: index + 1 })));
</script>

<ObservationFrame title="Job History" icon={History} observedAt={history?.sourceObservedAt ?? null} freshness={history?.freshness ?? 'unknown'} stateKind={failure ?? (pending ? 'loading' : 'ready')} placeholder={loading} {onretry} {refreshing}>
  <div class="observation-list">
    {#each items as item, index}
      <div class="observation-row history-row">
        <div class="history-status">
          {#if loading}<History aria-hidden="true" />
          {:else if history?.items[index].status === 'completed'}<CheckCircle2 class="completed" aria-hidden="true" />
          {:else if history?.items[index].status === 'cancelled'}<XCircle aria-hidden="true" />
          {:else}<AlertTriangle aria-hidden="true" />{/if}
          <div><strong><LoadingValue {loading} text={history ? titleCase(history.items[index].status) : undefined} /></strong><span><LoadingValue {loading} text={history ? formatClock(history.items[index].endedAt) : undefined} size="long" /></span></div>
        </div>
        <span><LoadingValue {loading} text={history ? formatDuration(history.items[index].durationSeconds) : undefined} /></span>
      </div>
    {/each}
  </div>
</ObservationFrame>

<style>
  .history-row { display: flex; align-items: center; justify-content: space-between; gap: 14px; }
  .history-status { display: flex; align-items: center; gap: 10px; min-width: 0; }
  .history-status :global(svg) { width: 19px; height: 19px; color: var(--u1-muted); }
  .history-status :global(svg.completed) { color: var(--u1-positive); }
  .history-status div { display: grid; gap: 2px; }
  .history-status strong { font-size: 14px; font-weight: 600; }
  .history-status span, .history-row > span { color: var(--u1-muted); font-size: 12px; font-variant-numeric: tabular-nums; }
</style>
