<script lang="ts">
  import type { Snippet } from 'svelte';
  let { label, children, overlay }: { label: string; children: Snippet; overlay?: Snippet } = $props();
</script>

<div class="chart-frame" role="img" aria-label={label} data-chart-frame>
  <div class="chart-content">{@render children()}</div>
  {#if overlay}<div class="chart-overlay" aria-live="polite">{@render overlay()}</div>{/if}
</div>

<style>
  .chart-frame { position: relative; width: 100%; aspect-ratio: 4 / 3; overflow: hidden; border: 1px solid var(--u1-line); border-radius: var(--u1-radius-inner); background: linear-gradient(180deg, #ffffff 0%, var(--u1-canvas) 100%); }
  .chart-content { position: absolute; inset: 0; min-width: 0; min-height: 0; }
  .chart-content :global(canvas) { display: block; width: 100%; height: 100%; }
  .chart-overlay { position: absolute; right: 12px; bottom: 12px; max-width: calc(100% - 24px); padding: 8px 11px; border: 1px solid rgba(28, 30, 32, 0.08); border-radius: 10px; color: #fff; background: rgba(28, 30, 32, 0.82); box-shadow: 0 5px 16px rgba(28, 30, 32, 0.16); font-size: 12px; line-height: 1.35; pointer-events: none; }
</style>
