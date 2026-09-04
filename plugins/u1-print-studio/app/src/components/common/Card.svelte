<script lang="ts">
  import type { Snippet } from 'svelte';
  let { children, label, busy = false, tint = null, density = 'comfortable' }: {
    children: Snippet; label: string; busy?: boolean; tint?: string | null; density?: 'compact' | 'comfortable';
  } = $props();
  const safeTint = $derived(typeof tint === 'string' && /^#[0-9A-F]{6}$/u.test(tint) ? tint : null);
</script>

<article
  class="card"
  class:tinted={safeTint !== null}
  class:compact={density === 'compact'}
  style:--u1-composed-tint={safeTint ?? undefined}
  aria-label={label}
  aria-busy={busy}
  data-node-kind="Card"
>
  {@render children()}
</article>

<style>
  .card { --u1-composed-x: var(--u1-card-x); --u1-composed-y: var(--u1-space-4); min-width: 0; overflow: hidden; border: 1px solid var(--u1-line); border-radius: var(--u1-radius-card); background: var(--u1-surface); box-shadow: var(--u1-shadow); }
  .compact { --u1-composed-x: var(--u1-space-4); --u1-composed-y: var(--u1-space-3); }
  .tinted { background: color-mix(in srgb, var(--u1-composed-tint) 6%, var(--u1-surface)); }
  @media (forced-colors: active) { .tinted { background: Canvas; } }
</style>
