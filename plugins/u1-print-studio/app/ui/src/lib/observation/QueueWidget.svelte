<script lang="ts">
  import { Clock3, ListOrdered } from 'lucide-svelte';
  import ObservationFrame from './ObservationFrame.svelte';
  import { formatClock, formatDuration, titleCase } from './format';
  import { validateQueue, type QueueObservation } from './types';
  let { observation }: { observation: QueueObservation } = $props();
  const queue = $derived(validateQueue(observation));
</script>

<ObservationFrame title="Print Queue" icon={ListOrdered} observedAt={queue.sourceObservedAt} freshness={queue.freshness}>
  <div class="queue-summary"><span class="observation-status">{titleCase(queue.queueState)}</span><strong>{queue.items.length}<span> queued</span></strong></div>
  {#if queue.items.length}
    <div class="observation-list queue-list">
      {#each queue.items as item}
        <div class="observation-row queue-row">
          <span class="position">{item.position}</span>
          <div><strong>Queued item {item.position}</strong><span>Added {formatClock(item.addedAt)}</span></div>
          <span class="wait"><Clock3 aria-hidden="true" />{formatDuration(item.waitingSeconds)}</span>
        </div>
      {/each}
    </div>
  {:else}
    <div class="empty-state">Queue empty</div>
  {/if}
</ObservationFrame>

<style>
  .queue-summary { display: flex; align-items: center; justify-content: space-between; gap: 14px; margin-bottom: 14px; }
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
