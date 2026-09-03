<script lang="ts">
  import type { Snippet } from 'svelte';
  let { children }: { children: Snippet } = $props();
</script>
<div class="row" data-node-kind="Row">{@render children()}</div>
<style>
  .row { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr)); min-width: 0; }
</style>
