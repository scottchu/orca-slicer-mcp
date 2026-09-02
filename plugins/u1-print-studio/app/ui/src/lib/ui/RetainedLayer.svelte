<script lang="ts">
  import type { Snippet } from 'svelte';
  let { masked, children }: { masked: boolean; children: Snippet } = $props();
</script>

<div class:masked inert={masked} aria-hidden={masked} data-retained-layer>{@render children()}</div>

<style>
  div { position: absolute; inset: 0; }
  .masked { visibility: hidden; pointer-events: none; }
</style>
