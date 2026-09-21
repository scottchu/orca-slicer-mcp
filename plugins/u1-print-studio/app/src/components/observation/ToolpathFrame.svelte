<script lang="ts">
  import type { Snippet } from 'svelte';
  let { children, summary, controls }: { children: Snippet; summary: Snippet; controls: Snippet } = $props();
</script>

<div class="preview-panel">
  {@render children()}
  <div class="preview-summary">{@render summary()}</div>
</div>
<div class="preview-controls">{@render controls()}</div>

<style>
  .preview-panel { overflow: hidden; border: 1px solid var(--u1-line); border-radius: var(--u1-radius-inner); }
  .preview-panel :global([data-chart-frame]) { border: 0; border-radius: 0; }
  .preview-summary { padding: 12px; border-top: 1px solid var(--u1-line); background: var(--u1-surface); }
  .preview-controls { display: flex; align-items: center; flex-wrap: wrap; gap: 12px; }
  .preview-controls > :global(.caption) { flex: 1 1 10em; min-width: 0; }
</style>
