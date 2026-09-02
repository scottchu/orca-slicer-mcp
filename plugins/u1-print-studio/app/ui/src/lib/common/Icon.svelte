<script lang="ts">
  type Glyph = typeof import('lucide-svelte')['Box'];
  type Accessibility = { decorative?: true; label?: never } | { decorative: false; label: string };
  let { icon, variant = 'plain', size = 20, decorative = true, label }: { icon: Glyph; variant?: 'plain' | 'bordered'; size?: number } & Accessibility = $props();
  const Glyph = $derived(icon);
</script>

{#snippet glyph()}<Glyph {size} strokeWidth={1.8} aria-hidden={decorative ? true : undefined} role={decorative ? undefined : 'img'} aria-label={decorative ? undefined : label} />{/snippet}
{#if variant === 'bordered'}<span class="bordered-icon">{@render glyph()}</span>{:else}{@render glyph()}{/if}

<style>
  .bordered-icon { display: inline-grid; place-items: center; width: var(--u1-action-size); height: var(--u1-action-size); border: 1px solid var(--u1-line); border-radius: var(--u1-radius-control); background: var(--u1-canvas); }
</style>
