<script lang="ts">
  import type { Snippet } from 'svelte';
  let {
    children,
    align = 'center',
    gap = 'normal',
    shrink = true,
    label,
    distribution = 'packed',
    inset = false,
    composed = false,
  }: {
    children: Snippet;
    align?: 'center' | 'baseline';
    gap?: 'normal' | 'tight' | 'compact' | 'regular';
    shrink?: boolean;
    label?: string;
    distribution?: 'packed' | 'split';
    inset?: boolean;
    composed?: boolean;
  } = $props();
</script>

{#if composed}
  <div class="inline composed" class:baseline={align === 'baseline'} class:tight={gap === 'tight'} class:regular={gap === 'regular'} class:fixed={!shrink} class:split={distribution === 'split'} class:inset role={label ? 'group' : undefined} aria-label={label} data-node-kind="Inline">{@render children()}</div>
{:else}
  <span class="inline" class:baseline={align === 'baseline'} class:tight={gap === 'tight'} class:regular={gap === 'regular'} class:fixed={!shrink} class:split={distribution === 'split'} class:inset role={label ? 'group' : undefined} aria-label={label}>{@render children()}</span>
{/if}

<style>
  .inline { display: inline-flex; align-items: center; gap: var(--u1-space-2); min-width: 0; }
  .baseline { align-items: baseline; }
  .tight { gap: var(--u1-space-1); }
  .regular { gap: var(--u1-space-3); }
  .fixed { flex-shrink: 0; max-width: 100%; flex-wrap: wrap; justify-content: flex-end; }
  .composed { display: flex; width: 100%; flex-wrap: wrap; }
  .inline.inset { padding: var(--u1-composed-y, var(--u1-space-4)) var(--u1-composed-x, var(--u1-card-x)) 0; }
  .inline :global([data-node-kind='Title']) { min-width: 0; padding: 0; }
  .composed :global([data-node-kind='Title']) { flex-shrink: 0; max-width: 100%; }
  .inline.split :global([data-node-kind='Title']) { margin-inline-end: auto; }
</style>
