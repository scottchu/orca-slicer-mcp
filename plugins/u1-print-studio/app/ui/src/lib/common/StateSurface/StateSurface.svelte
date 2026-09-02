<script lang="ts">
  import { onMount, type Snippet } from 'svelte';
  import { staticStructure, type SurfacePhase } from './types';
  import { createSurfaceAllocation } from './allocation';
  let { phase, children }: { phase: SurfacePhase; children: Snippet } = $props();
  const settled = $derived(staticStructure(phase));
  let root: HTMLDivElement;
  let allocation: ReturnType<typeof createSurfaceAllocation> | undefined;
  onMount(() => { allocation = createSurfaceAllocation(root); return () => allocation?.dispose(); });
  $effect.pre(() => { const failed = phase === 'error' || phase === 'unavailable'; allocation?.before(failed); });
  $effect(() => { phase; allocation?.after(); });
</script>

<div bind:this={root} data-widget-state-surface={phase} class:static-structure={settled}>
  {@render children()}
</div>

<style>
  .static-structure :global([data-skeleton]),
  .static-structure :global([data-loading-value]),
  .static-structure :global([data-loading-value] span) { animation: none; }
</style>
