<script lang="ts">
  import type { Snippet } from 'svelte';
  let { leading, trailing, active = false, label }: { leading: Snippet; trailing: Snippet; active?: boolean; label?: string } = $props();
</script>

<div class="reading-row" class:active role="listitem" aria-label={label} data-reading-row>
  {@render leading()}{@render trailing()}
</div>

<style>
  .reading-row { position: relative; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; min-width: 0; min-height: var(--u1-reading-height); height: var(--u1-reading-block-size, auto); gap: var(--u1-space-2) var(--u1-space-3); padding: var(--u1-space-3) var(--u1-reading-inset); border-bottom: var(--u1-reading-bottom, 0px) solid var(--u1-line); border-right: var(--u1-reading-right, 0px) solid var(--u1-line); }
  .reading-row.active::before { position: absolute; inset: var(--u1-space-2) auto var(--u1-space-2) 0; width: var(--u1-state-mark); border-radius: var(--u1-radius-control); background: var(--u1-accent); content: ''; }
</style>
