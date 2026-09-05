<script lang="ts">
  import type { Snippet } from 'svelte';
  let { children, columns = 'one', gap = 'regular', inset = false, arrangement = 'uniform' }: {
    children: Snippet; columns?: 'one' | 'two'; gap?: 'compact' | 'regular' | 'relaxed'; inset?: boolean; arrangement?: 'uniform' | 'lead';
  } = $props();
</script>

<div class="grid" class:two={columns === 'two'} class:lead={arrangement === 'lead'} class:compact={gap === 'compact'} class:relaxed={gap === 'relaxed'} class:inset data-node-kind="Grid">{@render children()}</div>

<style>
  .grid { --u1-grid-gap: var(--u1-space-3); display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--u1-grid-gap); min-width: 0; }
  .grid.two { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .grid.two.lead { grid-template-columns: repeat(auto-fit, minmax(min(100%, max(9.5rem, calc((100% - var(--u1-grid-gap)) / 2))), 1fr)); }
  .grid.compact { --u1-grid-gap: var(--u1-space-2); }
  .grid.relaxed { --u1-grid-gap: var(--u1-space-5); }
  .grid.inset { padding: var(--u1-composed-y, var(--u1-space-4)) var(--u1-composed-x, var(--u1-card-x)); }
  .grid.lead > :global(:first-child) { grid-column: 1 / -1; }
  @media (max-width: 520px) { .grid.two:not(.lead) { grid-template-columns: minmax(0, 1fr); } }
</style>
