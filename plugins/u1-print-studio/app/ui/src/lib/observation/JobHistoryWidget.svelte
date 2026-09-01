<script lang="ts">
  import { AlertTriangle, CheckCircle2, History, XCircle } from 'lucide-svelte';
  import ObservationFrame from './ObservationFrame.svelte';
  import { formatClock, formatDuration, titleCase } from './format';
  import { validateJobHistory, type JobHistoryObservation } from './types';
  let { observation }: { observation: JobHistoryObservation } = $props();
  const history = $derived(validateJobHistory(observation));
</script>

<ObservationFrame title="Job History" icon={History} observedAt={history.sourceObservedAt} freshness={history.freshness}>
  <div class="observation-list">
    {#each history.items as item}
      <div class="observation-row history-row">
        <div class="history-status">
          {#if item.status === 'completed'}<CheckCircle2 class="completed" aria-hidden="true" />
          {:else if item.status === 'cancelled'}<XCircle aria-hidden="true" />
          {:else}<AlertTriangle aria-hidden="true" />{/if}
          <div><strong>{titleCase(item.status)}</strong><span>{formatClock(item.endedAt)}</span></div>
        </div>
        <span>{formatDuration(item.durationSeconds)}</span>
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
