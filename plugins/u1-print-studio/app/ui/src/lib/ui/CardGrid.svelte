<script lang="ts">
  import type { Snippet } from 'svelte';
  let { children }: { children: Snippet } = $props();
</script>
<div class="card-grid">{@render children()}</div>
<style>
  .card-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, max(8em, calc(50% - 6px))), 1fr)); gap: var(--u1-space-3); font-size: var(--u1-type-name); min-width: 0; }
</style>
