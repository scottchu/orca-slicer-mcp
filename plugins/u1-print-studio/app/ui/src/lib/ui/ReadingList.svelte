<script lang="ts">
  import type { Snippet } from 'svelte';
  let { children, label }: { children: Snippet; label: string } = $props();
</script>

<div class="reading-list" role="list" aria-label={label}>{@render children()}</div>

<style>
  .reading-list { display: grid; grid-template-columns: 1fr; overflow: hidden; border: 1px solid var(--u1-line); border-radius: var(--u1-radius-inner); }
  @media (min-width: 590px) { .reading-list { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
</style>
