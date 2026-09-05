<script lang="ts">
  import type { Snippet } from 'svelte';
  let { children, columnGap = 'regular', collapse = 'intrinsic' }: {
    children: Snippet;
    columnGap?: 'compact' | 'regular';
    collapse?: 'intrinsic';
  } = $props();
</script>

<div class="row" class:compact={columnGap === 'compact'} data-collapse={collapse} data-node-kind="Row">{@render children()}</div>

<style>
  .row { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); column-gap: 16px; min-width: 0; }
  .row.compact { column-gap: var(--u1-space-3); }
</style>
