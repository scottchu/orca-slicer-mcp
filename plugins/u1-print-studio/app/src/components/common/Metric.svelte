<script lang="ts">
  import Skeleton from './Skeleton.svelte';
  import StaticSkeleton from './StaticSkeleton.svelte';
  let { label, display, state, reserveLines = 1, wrap = 'anywhere', appearance = 'default' }: {
    label: string;
    display: string;
    state: 'known' | 'unknown' | 'unavailable' | 'loading';
    reserveLines?: 1 | 2;
    wrap?: 'anywhere' | 'words';
    appearance?: 'default' | 'hero' | 'quiet';
  } = $props();
</script>
<div class="metric" class:two-lines={reserveLines === 2} class:hero={appearance === 'hero'} class:quiet={appearance === 'quiet'} data-node-kind="Metric" data-value-state={state}>
  <span class="label">{label}</span>
  <span class="value-frame" class:words={wrap === 'words'}>
    {#if state === 'loading'}<span class="skeleton-slot"><Skeleton shape="value" /></span>{:else if state === 'unavailable'}<span class="skeleton-slot"><StaticSkeleton shape="value" /></span>{:else}<span class="value current">{display}</span>{/if}
  </span>
</div>
<style>
  .metric { display: grid; align-content: center; gap: 3px; min-width: 0; }
  .metric.two-lines { min-height: calc(4.096875rem + 3px); }
  .label { color: var(--u1-muted); font-size: .8125rem; line-height: 1.35; }
  .value-frame { display: grid; min-width: 0; font-size: 1.25rem; font-weight: var(--u1-weight-strong); font-variant-numeric: tabular-nums; line-height: var(--u1-line-value); }
  .hero .value-frame { font-size: 1.5rem; }
  .quiet .value-frame { font-size: 1rem; }
  .hero.two-lines { min-height: calc(.8125rem * 1.35 + 3px + 2 * 1.5rem * var(--u1-line-value)); }
  .value-frame > * { grid-area: 1 / 1; min-width: 0; }
  .value { overflow-wrap: anywhere; }
  .words .value { overflow-wrap: normal; }
  .current, .skeleton-slot { align-self: center; }
  .skeleton-slot { display: grid; align-items: center; min-height: 1lh; }
  .skeleton-slot :global([data-skeleton='value']) { width: min(8ch, 100%); height: 1lh; }
</style>
