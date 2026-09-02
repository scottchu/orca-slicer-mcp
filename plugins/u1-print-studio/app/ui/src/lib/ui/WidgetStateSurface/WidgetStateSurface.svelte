<script lang="ts">
  import type { Snippet } from 'svelte';
  import { staticStructure, type WidgetSurfacePhase } from './types';
  let { phase, children }: { phase: WidgetSurfacePhase; children: Snippet } = $props();
  const settled = $derived(staticStructure(phase));
</script>

<div data-widget-state-surface={phase} class:static-structure={settled}>
  {@render children()}
</div>

<style>
  .static-structure :global([data-skeleton]),
  .static-structure :global([data-loading-value]),
  .static-structure :global([data-loading-value] span) { animation: none; }
</style>
