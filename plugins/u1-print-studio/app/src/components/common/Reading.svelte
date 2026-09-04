<script lang="ts">
  import type { Snippet } from 'svelte';
  import Icon from './Icon.svelte';
  type Glyph = typeof import('lucide-svelte')['Box'];
  let { icon, contentInset = 'reading', children }: {
    icon: Glyph;
    contentInset?: 'reading' | 'child';
    children: Snippet;
  } = $props();
</script>

<div class="reading" data-domain-reading>
  <Icon {icon} variant="bordered" />
  <div class="content" class:child-inset={contentInset === 'child'}>{@render children()}</div>
</div>

<style>
  .reading { display: grid; grid-template-columns: auto minmax(0, 1fr); align-items: center; gap: var(--u1-space-3); min-width: 0; min-height: 68px; padding: var(--u1-space-2) 0; }
  .content { min-width: 0; padding: var(--u1-space-2) var(--u1-space-3); }
  .content.child-inset { padding: 0; }
</style>
