<script lang="ts">
  import type { Snippet } from 'svelte';
  let { children, columns = 'one', gap = 'regular', inset = false }: {
    children: Snippet; columns?: 'one' | 'two'; gap?: 'compact' | 'regular' | 'relaxed'; inset?: boolean;
  } = $props();
</script>

<div class="grid" class:two={columns === 'two'} class:compact={gap === 'compact'} class:relaxed={gap === 'relaxed'} class:inset data-node-kind="Grid">{@render children()}</div>

<style>
  .grid { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--u1-space-3); min-width: 0; }
  .grid.two { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .grid.compact { gap: var(--u1-space-2); }
  .grid.relaxed { gap: var(--u1-space-5); }
  .grid.inset { padding: var(--u1-composed-y, var(--u1-space-4)) var(--u1-composed-x, var(--u1-card-x)); }
  @media (max-width: 520px) { .grid.two { grid-template-columns: minmax(0, 1fr); } }
</style>
