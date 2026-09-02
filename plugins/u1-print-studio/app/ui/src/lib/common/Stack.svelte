<script lang="ts">
  import type { Snippet } from 'svelte';
  let { children }: { children: Snippet } = $props();
</script>
<div class="stack">{@render children()}</div>
<style>
  .stack { display: flex; flex-direction: column; gap: var(--u1-space-3); min-width: 0; }
</style>
