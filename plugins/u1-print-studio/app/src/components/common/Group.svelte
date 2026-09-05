<script lang="ts">
  import type { Snippet } from 'svelte';
  let { children, relation, rowGap = 'regular', inset = true }: {
    children: Snippet;
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
  aria-label={relation === 'identity' ? 'Tool identity' : 'Tool summary'}
  data-node-kind="Group"
  data-group-relation={relation}
>{@render children()}</section>

<style>
  .group { min-width: 0; }
  .identity { display: flex; align-items: center; flex-wrap: wrap; gap: var(--u1-space-3); }
  .identity.inset { padding: var(--u1-composed-y, var(--u1-space-4)) var(--u1-composed-x, var(--u1-card-x)) 0; }
  .identity :global([data-node-kind='Title']) { flex: 0 1 auto; min-width: 0; padding: 0; }
  .summary { display: grid; gap: 20px; container-type: inline-size; }
  .summary.compact { gap: var(--u1-space-4); }
  .summary.inset { padding: 20px var(--u1-composed-x, var(--u1-card-x)); }
  .summary :global([data-domain-reading]) { min-height: 0; padding: 0; }
  .summary :global([data-node-kind='Metric']),
  .summary :global([data-node-kind='Swatch']) { gap: 4px; }
</style>
