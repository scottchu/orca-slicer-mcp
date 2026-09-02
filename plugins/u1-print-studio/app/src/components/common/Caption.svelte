<script lang="ts">
  import type { Snippet } from 'svelte';
  let { children }: { children: Snippet } = $props();
</script>

<span class="caption">{@render children()}</span>

<style>
  .caption { color: var(--u1-muted); font-size: var(--u1-type-label); line-height: var(--u1-line-copy); }
</style>
