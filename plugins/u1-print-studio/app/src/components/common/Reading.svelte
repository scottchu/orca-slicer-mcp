<script lang="ts">
  import type { Snippet } from 'svelte';
  import Icon from './Icon.svelte';
  type Glyph = typeof import('lucide-svelte')['Box'];
  let { icon, children, appearance = 'default', density = 'regular', sizing = 'reserved' }: {
    icon: Glyph;
    children: Snippet;
    density?: 'regular' | 'compact';
    sizing?: 'reserved' | 'natural';
    appearance?: 'default' | 'hero' | 'quiet';
  } = $props();
  const iconVariant = $derived(appearance === 'default' ? 'bordered' : 'plain');
  const iconSize = $derived(appearance === 'hero' ? 32 : appearance === 'quiet' ? 24 : 20);
</script>

<div class:natural={sizing === 'natural'} class:compact={density === 'compact'} class="reading" class:hero={appearance === 'hero'} class:quiet={appearance === 'quiet'} data-domain-reading data-reading-appearance={appearance}>
  <span class="icon-frame"><Icon {icon} variant={iconVariant} size={iconSize} /></span>
  <div class:natural={sizing === 'natural'} class:compact={density === 'compact'} class="content">{@render children()}</div>
</div>

<style>
  .reading { display: grid; grid-template-columns: auto minmax(0, 1fr); align-items: center; gap: var(--u1-space-3); min-width: 0; min-height: 68px; padding: var(--u1-space-2) 0; }
  .icon-frame { display: inline-grid; place-items: center; width: var(--u1-action-size); height: var(--u1-action-size); }
  .reading.hero, .reading.quiet { grid-template-columns: var(--u1-reading-icon-track) minmax(0, 1fr); gap: var(--u1-reading-icon-gap); }
  .reading.hero .icon-frame, .reading.quiet .icon-frame { width: var(--u1-reading-icon-track); }
  .reading.hero { min-height: 104px; }
  .reading.quiet { min-height: 64px; }
  .reading.compact { min-height: var(--u1-action-size); padding: 0; }
  .content { min-width: 0; padding: var(--u1-space-2) var(--u1-space-3); }
  .reading.hero .content, .reading.quiet .content, .content.compact { padding: 0; }
  .reading.natural { min-height: 0; padding: 0; }
  .reading.natural .icon-frame { height: auto; }
  .content.compact { container: reading-copy / inline-size; }
</style>
