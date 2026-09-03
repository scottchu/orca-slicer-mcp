<script lang="ts">
  import type { Snippet } from 'svelte';
  import Icon from './Icon.svelte';
  type Glyph = typeof import('lucide-svelte')['Box'];
  let { icon, children }: { icon: Glyph; children: Snippet } = $props();
</script>

<div class="reading" data-domain-reading>
  <Icon {icon} variant="bordered" />
  <div class="content">{@render children()}</div>
</div>

<style>
  .reading { display: grid; grid-template-columns: auto minmax(0, 1fr); align-items: center; gap: 12px; min-width: 0; min-height: 72px; padding: 10px var(--u1-card-x); }
  .content { min-width: 0; }
</style>
