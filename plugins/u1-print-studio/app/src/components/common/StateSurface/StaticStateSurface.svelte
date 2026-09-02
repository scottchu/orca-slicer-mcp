<script lang="ts">
  import type { Snippet } from 'svelte';
  import { staticStructure, type SurfacePhase } from '../../../lib/client/common/StateSurface/types';
  // Fixed media geometry needs phase styling, with no row allocation observer.
  let { phase, children }: { phase: SurfacePhase; children: Snippet } = $props();
</script>

<div data-widget-state-surface={phase} class:static-structure={staticStructure(phase)}>
  {@render children()}
</div>

<style>
  .static-structure :global([data-skeleton]),
  .static-structure :global([data-loading-value]),
  .static-structure :global([data-loading-value] span) { animation: none; }
</style>
