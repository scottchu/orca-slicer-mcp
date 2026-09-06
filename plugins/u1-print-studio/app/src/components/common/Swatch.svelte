<script lang="ts">
  import ColorSwatch from './ColorSwatch.svelte';
  import Skeleton from './Skeleton.svelte';
  import StaticSkeleton from './StaticSkeleton.svelte';
  let { label, accessibleLabel, color, display, state, appearance = 'default', density = 'regular' }: {
    label: string;
    accessibleLabel?: string;
    color: string | null;
    display: string;
    state: 'known' | 'unknown' | 'unavailable' | 'loading';
    density?: 'regular' | 'compact';
    appearance?: 'default' | 'quiet';
  } = $props();
</script>
<div class:compact={density === 'compact'} class="swatch-cell" class:quiet={appearance === 'quiet'} data-node-kind="Swatch" data-value-state={state}>
  <span class="label" role={accessibleLabel && accessibleLabel !== label ? 'group' : undefined} aria-label={accessibleLabel && accessibleLabel !== label ? accessibleLabel : undefined}>{label}</span>
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
  .swatch-cell { display: grid; gap: var(--u1-reading-copy-gap); min-width: 0; }
  .swatch-cell.compact { gap: var(--u1-reading-copy-gap-compact); }
  .label { color: var(--u1-muted); font-size: var(--u1-type-label); line-height: var(--u1-line-label); }
  .value-frame { display: grid; align-items: center; min-width: 0; font-size: var(--u1-type-value); font-weight: var(--u1-weight-strong); font-variant-numeric: tabular-nums; line-height: var(--u1-line-value); }
  .value-frame > * { grid-area: 1 / 1; min-width: 0; }
  .value-frame { min-height: 1lh; }
  .value { display: inline-flex; align-items: center; gap: 8px; min-width: 0; font-size: var(--u1-type-value); font-weight: var(--u1-weight-strong); font-variant-numeric: tabular-nums; line-height: var(--u1-line-value); }
  .quiet .value-frame, .quiet .value { font-size: var(--u1-type-value-quiet); }
  .current, .skeleton-slot { align-self: center; }
  .skeleton-slot { display: grid; align-items: center; min-height: 1lh; }
  .skeleton-slot :global([data-skeleton='value']) { width: min(8ch, 100%); height: 1lh; }
</style>
