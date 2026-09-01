<script lang="ts">
  import type { Snippet } from 'svelte';
  let { children, label, columns = 'responsive' }: { children: Snippet; label: string; columns?: 'single' | 'responsive' } = $props();
</script>

<div class="reading-list" class:responsive={columns === 'responsive'} role="list" aria-label={label}>{@render children()}</div>

<style>
  .reading-list { display: grid; grid-template-columns: 1fr; overflow: hidden; border: 1px solid var(--u1-line); border-radius: var(--u1-radius-inner); }
  .reading-list > :global(*) { min-width: 0; --u1-reading-block-size: 100%; --u1-reading-bottom: 1px; --u1-reading-right: 0px; }
  .reading-list > :global(:last-child) { --u1-reading-bottom: 0px; }
  @media (min-width: 590px) {
    .reading-list.responsive { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .reading-list.responsive > :global(:nth-child(odd)) { --u1-reading-right: 1px; }
    .reading-list.responsive > :global(:nth-last-child(2)) { --u1-reading-bottom: 0px; }
  }
</style>
