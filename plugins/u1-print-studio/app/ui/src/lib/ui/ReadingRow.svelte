<script lang="ts">
  import type { Snippet } from 'svelte';
  let { leading, trailing, active = false, label }: { leading: Snippet; trailing: Snippet; active?: boolean; label?: string } = $props();
</script>

<div class="reading-row" class:active role="listitem" aria-label={label} data-reading-row>
  {@render leading()}{@render trailing()}
</div>

<style>
  .reading-row { position: relative; display: flex; align-items: center; justify-content: space-between; min-width: 0; height: var(--u1-reading-height); gap: var(--u1-space-3); padding: var(--u1-space-3) var(--u1-reading-inset); border-bottom: 1px solid var(--u1-line); }
  .reading-row:last-child { border-bottom: 0; }
  .reading-row.active::before { position: absolute; inset: var(--u1-space-2) auto var(--u1-space-2) 0; width: var(--u1-state-mark); border-radius: var(--u1-radius-control); background: var(--u1-accent); content: ''; }
  @media (min-width: 590px) {
    .reading-row:nth-child(odd) { border-right: 1px solid var(--u1-line); }
    .reading-row:nth-last-child(2) { border-bottom: 0; }
  }
</style>
