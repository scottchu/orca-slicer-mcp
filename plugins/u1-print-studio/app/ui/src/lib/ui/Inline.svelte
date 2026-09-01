<script lang="ts">
  import type { Snippet } from 'svelte';
  let { children, align = 'center', gap = 'normal', label }: { children: Snippet; align?: 'center' | 'baseline'; gap?: 'normal' | 'tight'; label?: string } = $props();
</script>

<span class="inline" class:baseline={align === 'baseline'} class:tight={gap === 'tight'} role={label ? 'group' : undefined} aria-label={label}>{@render children()}</span>

<style>
  .inline { display: inline-flex; align-items: center; gap: var(--u1-space-2); min-width: 0; }
  .baseline { align-items: baseline; }
  .tight { gap: var(--u1-space-1); }
</style>
