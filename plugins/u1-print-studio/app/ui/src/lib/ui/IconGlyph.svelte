<script lang="ts">
  type Glyph = typeof import('lucide-svelte')['Box'];
  type Accessibility = { decorative?: true; label?: never } | { decorative: false; label: string };
  let { icon, decorative = true, label }: { icon: Glyph } & Accessibility = $props();
  const Symbol = $derived(icon);
</script>

<Symbol size={20} strokeWidth={1.8} aria-hidden={decorative ? true : undefined} role={decorative ? undefined : 'img'} aria-label={decorative ? undefined : label} />
