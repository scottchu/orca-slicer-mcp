<script lang="ts">
  import type { Snippet } from 'svelte';
  let { children }: { children: Snippet } = $props();
</script>

<div class="widget-body" data-widget-body>{@render children()}</div>

<style>
  .widget-body { min-width: 0; padding: 0 var(--u1-card-x) 18px; }
</style>
