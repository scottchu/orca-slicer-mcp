<script lang="ts">
  import Skeleton from './Skeleton.svelte';
  import Timestamp from './Timestamp.svelte';
  let { label, live = false, time = null, fps = null, loading = false, compact = false }: {
    label: string; live?: boolean; time?: string | null; fps?: number | null; loading?: boolean; compact?: boolean;
  } = $props();
  const rate = $derived(live && fps !== null && Number.isFinite(fps) && fps >= 0 ? Math.round(fps) : null);
</script>

<div class="media-status" class:compact data-media-status>
  {#if loading}<Skeleton shape="text" /><Skeleton shape="text" />
  {:else}
    <span class:live>{label}{#if compact && rate !== null}<span class="rate" data-media-fps>{rate} FPS</span>{/if}</span>
    <span class="metrics">{#if !compact && rate !== null}<span data-media-fps>{rate} FPS</span>{/if}{#if time}<Timestamp value={time} />{/if}</span>
  {/if}
</div>

<style>
  .media-status { display: flex; flex-direction: column; align-items: flex-end; justify-content: center; gap: 4px; width: 8.6667em; min-height: calc(4em + 4px); color: var(--u1-muted); font-size: 12px; line-height: 1.25; font-variant-numeric: tabular-nums; }
  .live { color: var(--u1-positive); }
  .metrics { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 3px 8px; }
  @media (max-width: 420px) { .media-status { width: 7.25em; } }
  .rate { margin-left: 8px; }
  .compact .metrics { flex-wrap: nowrap; }
  .compact { min-height: calc(2.5em + 4px); }
</style>
