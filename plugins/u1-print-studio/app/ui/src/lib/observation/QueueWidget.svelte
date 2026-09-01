<script lang="ts">
  import { Clock3, ListOrdered } from 'lucide-svelte';
  import ObservationFrame from './ObservationFrame.svelte';
  import { formatClock, formatDuration, titleCase } from './format';
  import { validateQueue, type QueueObservation } from './types';
  import LoadingValue from '../ui/LoadingValue.svelte';
  import { loadingObservation, structureCount } from './loading';
  type Props = { observation: QueueObservation; loading?: false; refreshing?: boolean; rows?: never } | { loading: true; observation?: never; refreshing?: never; rows?: number };
  let { observation, loading = false, refreshing = false, rows = 3 }: Props = $props();
  const queue = $derived(loadingObservation(loading, observation, validateQueue));
  const items = $derived(queue?.items ?? Array.from({ length: structureCount(rows, 100) }, (_, index) => ({ position: index + 1 })));
</script>

<ObservationFrame title="Print Queue" icon={ListOrdered} observedAt={queue?.sourceObservedAt ?? null} freshness={queue?.freshness ?? 'unknown'} stateKind={loading ? 'loading' : 'ready'} {refreshing}>
  <div class="queue-summary"><span class="observation-status" class:loading><LoadingValue {loading} text={queue ? titleCase(queue.queueState) : undefined} /></span><strong><LoadingValue {loading} text={queue?.items.length} size="short" /><span> queued</span></strong></div>
  {#if items.length}
    <div class="observation-list queue-list">
      {#each items as item, index}
        <div class="observation-row queue-row">
          <span class="position" class:loading><LoadingValue {loading} text={queue ? item.position : undefined} size="short" /></span>
          <div><strong><LoadingValue {loading} text={queue ? `Queued item ${item.position}` : undefined} words={[7, 5, 2]} size="long" /></strong><span><LoadingValue {loading} text={queue ? `Added ${formatClock(queue.items[index].addedAt)}` : undefined} words={[6, 6, 3]} size="long" /></span></div>
          <span class="wait"><Clock3 aria-hidden="true" /><LoadingValue {loading} text={queue ? formatDuration(queue.items[index].waitingSeconds) : undefined} words={[4]} size="short" /></span>
        </div>
      {/each}
    </div>
  {:else}
    <div class="empty-state"><LoadingValue {loading} text={queue ? 'Queue empty' : undefined} size="long" /></div>
  {/if}
</ObservationFrame>

<style>
  .queue-summary { display: flex; align-items: center; justify-content: space-between; gap: 14px; margin-bottom: 14px; }
  .loading::before { visibility: hidden; }
  .position.loading { background: var(--u1-soft); }
  .queue-summary > strong { font-size: 22px; }
  .queue-summary > strong span { color: var(--u1-muted); font-size: 12px; font-weight: 500; }
  .queue-row { display: grid; grid-template-columns: 28px minmax(0, 1fr) auto; align-items: center; gap: 10px; }
  .position { display: grid; place-items: center; width: 28px; height: 28px; border-radius: 9px; color: #856300; background: #fff6dc; font-size: 12px; font-weight: 700; }
  .queue-row div { display: grid; gap: 2px; }
  .queue-row strong { font-size: 14px; font-weight: 590; }
  .queue-row div span { color: var(--u1-muted); font-size: 12px; }
  .wait { display: flex; align-items: center; gap: 5px; color: var(--u1-muted); font-size: 12px; font-variant-numeric: tabular-nums; }
  .wait :global(svg) { width: 15px; height: 15px; }
  .empty-state { padding: 20px; border: 1px dashed var(--u1-line); border-radius: var(--u1-radius-inner); color: var(--u1-muted); text-align: center; }
</style>
