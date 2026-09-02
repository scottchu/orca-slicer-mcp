<script lang="ts">
  import type { Snippet } from 'svelte';
  type LucideIcon = typeof import('lucide-svelte')['Box'];
  let { label, icon, children, busy = false, onclick }: { label: string; icon: LucideIcon; children?: Snippet; busy?: boolean; onclick?: () => void } = $props();
  const Icon = $derived(icon);
</script>

<button type="button" class:content={!!children} aria-label={label} title={label} aria-disabled={busy || undefined} onclick={() => { if (!busy) onclick?.(); }}>
  {#if children}{@render children()}{/if}
  <Icon size={16} strokeWidth={1.8} aria-hidden="true" />
</button>

<style>
  button { display: inline-grid; place-items: center; width: var(--u1-action-size); min-width: var(--u1-action-size); height: var(--u1-action-size); padding: 0; border: 0; border-radius: var(--u1-radius-control); color: var(--u1-muted); background: transparent; cursor: pointer; touch-action: manipulation; }
  /* Borrow 8px of the existing 12px card inset on each side. Padding therefore
     balances the hover surface without reducing the whole-hex content width. */
  .content { box-sizing: border-box; width: calc(100% + 16px); margin-inline: -8px; padding-inline: 8px; grid-template-columns: minmax(0, 1fr) 16px; gap: var(--u1-space-1); text-align: left; }
  .content :global(> :first-child) { justify-self: start; }
  button:hover { color: var(--u1-ink); background: var(--u1-soft); }
  button:focus-visible { outline: 3px solid var(--u1-focus); outline-offset: 2px; }
  button[aria-disabled="true"] { cursor: default; opacity: .45; }
</style>
