<script lang="ts">
  import ColorSwatch from './ColorSwatch.svelte';
  import Skeleton from './Skeleton.svelte';
  import StaticSkeleton from './StaticSkeleton.svelte';
  let { label, color, display, state }: { label: string; color: string | null; display: string; state: 'known' | 'unknown' | 'unavailable' | 'loading' } = $props();
</script>
<div class="swatch-cell" data-node-kind="Swatch" data-value-state={state}>
  <span class="label">{label}</span>
  {#if state === 'loading'}
    <Skeleton shape="value" />
  {:else if state === 'unavailable'}
    <StaticSkeleton shape="value" />
  {:else}
    <span class="value"><ColorSwatch {color} /><span>{display}</span></span>
  {/if}
</div>
<style>
  .swatch-cell { display: grid; gap: 3px; min-width: 0; }
  .label { color: var(--u1-muted); font-size: .8125rem; line-height: 1.35; }
  .value { display: inline-flex; align-items: center; gap: 8px; min-width: 0; font-size: 1.25rem; font-weight: var(--u1-weight-strong); font-variant-numeric: tabular-nums; line-height: var(--u1-line-value); }
</style>
