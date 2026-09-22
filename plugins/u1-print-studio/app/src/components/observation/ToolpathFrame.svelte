<script lang="ts">
  import type { Snippet } from 'svelte';
  let { children, summary, controls, status, compact = false, masked = false }: { children: Snippet; summary: Snippet; controls: Snippet; status?: string; compact?: boolean; masked?: boolean } = $props();
</script>

<div class="preview-panel" class:compact class:masked>
  <div class="preview-viewport">
    {#if !compact}{@render children()}{/if}
    <div class="preview-controls">
      {#if status}<div class="preview-status" aria-live={masked ? undefined : "polite"} aria-hidden={masked ? true : undefined}>{status}</div>{/if}
      <div class="preview-actions">{#if !compact}{@render controls()}{/if}</div>
    </div>
  </div>
  <div class="preview-summary">{@render summary()}</div>
</div>

<style>
  .masked .preview-status { visibility: hidden; }
  .compact .preview-controls { position: static; padding: 16px 12px; }
  .compact .preview-status { position: static; padding: 0; color: var(--u1-muted); background: none; font-size: 14px; line-height: 1.4; max-width: none; }
  .compact .preview-actions { display: none; }
  .preview-panel { overflow: hidden; border: 1px solid var(--u1-line); border-radius: var(--u1-radius-inner); }
  .preview-viewport { position: relative; }
  .preview-panel :global([data-chart-frame]) { border: 0; border-radius: 0; }
  .preview-summary { padding: 12px; border-top: 1px solid var(--u1-line); background: var(--u1-surface); }
  .preview-controls { position: absolute; bottom: 10px; right: 10px; left: 10px; pointer-events: none; display: flex; align-items: flex-end; gap: 8px; }
  .preview-actions { pointer-events: auto; display: flex; flex: 0 0 auto; gap: 8px; margin-left: auto; }
  .preview-status { min-width: 0; max-width: 20em; padding: 5px 7px; border-radius: var(--u1-radius-control); background: rgb(28 30 32 / 86%); color: white; font-size: 12px; line-height: 1.25; overflow-wrap: anywhere; }
  @media (max-width: 420px) {
    .preview-status { position: absolute; left: 0; bottom: 54px; max-width: 100%; box-sizing: border-box; }
  }
</style>
