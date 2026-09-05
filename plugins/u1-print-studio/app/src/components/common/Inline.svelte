<script lang="ts">
  import type { Snippet } from 'svelte';
  let { children, align = 'center', gap = 'normal', shrink = true, label }: { children: Snippet; align?: 'center' | 'baseline'; gap?: 'normal' | 'tight'; shrink?: boolean; label?: string } = $props();
</script>

<span class="inline" class:baseline={align === 'baseline'} class:tight={gap === 'tight'} class:fixed={!shrink} role={label ? 'group' : undefined} aria-label={label}>{@render children()}</span>

<style>
  .inline { display: inline-flex; align-items: center; gap: var(--u1-space-2); min-width: 0; }
  .baseline { align-items: baseline; }
  .tight { gap: var(--u1-space-1); }
  .fixed { flex-shrink: 0; max-width: 100%; flex-wrap: wrap; justify-content: flex-end; }
</style>
