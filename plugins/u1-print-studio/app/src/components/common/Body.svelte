<script lang="ts">
  import type { Snippet } from 'svelte';
  let { children, flush = false }: { children: Snippet; flush?: boolean } = $props();
</script>

<div class="widget-body" class:flush data-widget-body>{@render children()}</div>

<style>
  .widget-body { min-width: 0; padding: 0 var(--u1-card-x) 18px; }
  .flush { padding: 0; }
</style>
