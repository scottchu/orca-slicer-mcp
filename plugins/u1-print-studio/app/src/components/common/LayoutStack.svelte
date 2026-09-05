<script lang="ts">
  import type { Snippet } from 'svelte';
  let { children, gap = 'regular', inset = false, composed = false }: {
    children: Snippet; gap?: 'compact' | 'regular' | 'relaxed'; inset?: boolean; composed?: boolean;
  } = $props();
</script>
<div class="stack" class:compact={gap === 'compact'} class:relaxed={gap === 'relaxed'} class:inset data-node-kind={composed ? 'Stack' : undefined}>{@render children()}</div>
<style>
  .stack { display: flex; flex-direction: column; gap: var(--u1-space-3); min-width: 0; }
  .stack.compact { gap: var(--u1-space-2); }
  .stack.relaxed { gap: var(--u1-space-5); }
  .stack.inset { padding: var(--u1-composed-y, var(--u1-space-4)) var(--u1-composed-x, var(--u1-card-x)); }
</style>
