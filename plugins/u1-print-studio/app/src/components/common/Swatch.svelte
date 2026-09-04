<script lang="ts">
  import ColorSwatch from './ColorSwatch.svelte';
  import Skeleton from './Skeleton.svelte';
  import StaticSkeleton from './StaticSkeleton.svelte';
  let { label, color, display, state }: {
    label: string;
    color: string | null;
    display: string;
    state: 'known' | 'unknown' | 'unavailable' | 'loading';
  } = $props();
</script>
<div class="swatch-cell" data-node-kind="Swatch" data-value-state={state}>
  <span class="label">{label}</span>
  <span class="value-frame">
    {#if state === 'loading'}
      <span class="skeleton-slot"><Skeleton shape="value" /></span>
    {:else if state === 'unavailable'}
      <span class="skeleton-slot"><StaticSkeleton shape="value" /></span>
    {:else}
      <span class="value current"><ColorSwatch {color} /><span>{display}</span></span>
    {/if}
  </span>
</div>
<style>
  .swatch-cell { display: grid; gap: 3px; min-width: 0; }
  .label { color: var(--u1-muted); font-size: .8125rem; line-height: 1.35; }
  .value-frame { display: grid; min-width: 0; font-size: 1.25rem; font-weight: var(--u1-weight-strong); font-variant-numeric: tabular-nums; line-height: var(--u1-line-value); }
  .value-frame > * { grid-area: 1 / 1; min-width: 0; }
  .value-frame { min-height: 1lh; }
  .value { display: inline-flex; align-items: center; gap: 8px; min-width: 0; font-size: 1.25rem; font-weight: var(--u1-weight-strong); font-variant-numeric: tabular-nums; line-height: var(--u1-line-value); }
  .current, .skeleton-slot { align-self: start; }
  .skeleton-slot { display: block; height: 0; }
  .skeleton-slot :global([data-skeleton='value']) { width: min(8ch, 100%); height: 1lh; }
</style>
