<script lang="ts">
  import type { Snippet } from 'svelte';
  let { children, label = 'Entity readings' }: { children: Snippet; label?: string } = $props();
</script>
<div class="table" role="group" aria-label={label} data-node-kind="Table">{@render children()}</div>
<style>
  .table { display: grid; min-width: 0; }
  .table :global(> [data-node-kind='Row'] + [data-node-kind='Row']) { border-top: 1px solid var(--u1-line); }
</style>
