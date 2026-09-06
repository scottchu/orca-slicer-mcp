<script lang="ts">
  import type { Snippet } from 'svelte';
  let { children, label, relation, rowGap = 'regular', inset = true }: {
    children: Snippet;
    label: string;
    relation: 'identity' | 'summary';
    rowGap?: 'compact' | 'regular';
    inset?: boolean;
  } = $props();
</script>

<section
  class="group"
  class:identity={relation === 'identity'}
  class:summary={relation === 'summary'}
  class:compact={rowGap === 'compact'}
  class:inset
  role="group"
  aria-label={label}
  data-node-kind="Group"
  data-group-relation={relation}
>{@render children()}</section>

<style>
  .group { min-width: 0; }
  .identity { display: flex; align-items: center; flex-wrap: wrap; gap: var(--u1-space-3); }
  .identity.inset { padding: var(--u1-composed-y, var(--u1-space-4)) var(--u1-composed-x, var(--u1-card-x)) 0; }
  .summary { display: grid; gap: var(--u1-group-gap); container-type: inline-size; }
  .summary.compact { gap: var(--u1-space-4); }
  .summary.inset { padding: var(--u1-group-gap) var(--u1-composed-x, var(--u1-card-x)); }
</style>
