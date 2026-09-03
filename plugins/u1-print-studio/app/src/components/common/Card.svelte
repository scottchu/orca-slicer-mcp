<script lang="ts">
  import type { Snippet } from 'svelte';
  let { children, label, busy = false, tint = null }: {
    children: Snippet; label: string; busy?: boolean; tint?: string | null;
  } = $props();
  const safeTint = $derived(typeof tint === 'string' && /^#[0-9A-F]{6}$/u.test(tint) ? tint : null);
</script>

<article
  class="card"
  class:tinted={safeTint !== null}
  style:--u1-composed-tint={safeTint ?? undefined}
  aria-label={label}
  aria-busy={busy}
  data-node-kind="Card"
>
  {@render children()}
</article>

<style>
  .card { min-width: 0; overflow: hidden; border: 1px solid var(--u1-line); border-radius: var(--u1-radius-card); background: var(--u1-surface); box-shadow: var(--u1-shadow); }
  .tinted { background: color-mix(in srgb, var(--u1-composed-tint) 6%, var(--u1-surface)); }
  @media (forced-colors: active) { .tinted { background: Canvas; } }
</style>
