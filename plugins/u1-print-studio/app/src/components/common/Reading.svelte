<script lang="ts">
  import type { Snippet } from 'svelte';
  import Icon from './Icon.svelte';
  type Glyph = typeof import('lucide-svelte')['Box'];
  let { icon, children, appearance = 'default' }: {
    icon: Glyph;
    children: Snippet;
    appearance?: 'default' | 'hero' | 'quiet';
  } = $props();
  const iconVariant = $derived(appearance === 'default' ? 'bordered' : 'plain');
  const iconSize = $derived(appearance === 'hero' ? 32 : appearance === 'quiet' ? 24 : 20);
</script>

<div class="reading" class:hero={appearance === 'hero'} class:quiet={appearance === 'quiet'} data-domain-reading data-reading-appearance={appearance}>
  <span class="icon-frame"><Icon {icon} variant={iconVariant} size={iconSize} /></span>
  <div class="content">{@render children()}</div>
</div>

<style>
  .reading { display: grid; grid-template-columns: auto minmax(0, 1fr); align-items: center; gap: var(--u1-space-3); min-width: 0; min-height: 68px; padding: var(--u1-space-2) 0; }
  .icon-frame { display: inline-grid; place-items: center; width: var(--u1-action-size); height: var(--u1-action-size); }
  .reading.hero, .reading.quiet { grid-template-columns: var(--u1-space-8) minmax(0, 1fr); gap: var(--u1-space-2); }
  .reading.hero .icon-frame, .reading.quiet .icon-frame { width: var(--u1-space-8); }
  .reading.hero { min-height: 104px; }
  .reading.quiet { min-height: 64px; }
  .content { min-width: 0; padding: var(--u1-space-2) var(--u1-space-3); }
  .reading.hero .content, .reading.quiet .content { padding: 0; }
</style>
