<script lang="ts">
  import Skeleton from './Skeleton.svelte';
  import StaticSkeleton from './StaticSkeleton.svelte';
  let { label, display, state, reserveLines = 1, wrap = 'anywhere', appearance = 'default', density = 'regular', sizing = 'reserved' }: {
    label: string;
    display: string;
    state: 'known' | 'unknown' | 'unavailable' | 'loading';
    reserveLines?: 1 | 2;
    wrap?: 'anywhere' | 'words';
    density?: 'regular' | 'compact';
    sizing?: 'reserved' | 'natural';
    appearance?: 'default' | 'hero' | 'quiet';
  } = $props();
</script>
<div class:natural={sizing === 'natural'} class:compact={density === 'compact'} class="metric" class:two-lines={reserveLines === 2} class:hero={appearance === 'hero'} class:quiet={appearance === 'quiet'} data-node-kind="Metric" data-value-state={state}>
  <span class="label">{label}</span>
  <span class="value-frame" class:words={wrap === 'words'}>
    {#if state === 'loading'}<span class="skeleton-slot"><Skeleton shape="value" /></span>{:else if state === 'unavailable'}<span class="skeleton-slot"><StaticSkeleton shape="value" /></span>{:else}<span class="value current">{display}</span>{/if}
  </span>
</div>
<style>
  .metric { display: grid; align-content: center; gap: var(--u1-reading-copy-gap); min-width: 0; }
  .metric.two-lines { min-height: calc(var(--u1-type-label) * var(--u1-line-label) + var(--u1-reading-copy-gap) + 2 * var(--u1-type-value) * var(--u1-line-value)); }
  .metric.compact { --reserved-lines: 2; --reading-value-size: var(--u1-type-value); gap: var(--u1-reading-copy-gap-compact); }
  .metric.compact.hero { --reading-value-size: var(--u1-type-value-hero); }
  .metric.compact.quiet { --reading-value-size: var(--u1-type-value-quiet); }
  /* Temperatures retain two lines: valid decimals have no precision cap.
     Only the bounded quiet label vocabulary can reduce its width-aware slot. */
  .metric.compact.two-lines { min-height: calc(var(--u1-type-label) * var(--u1-line-label) + var(--u1-reading-copy-gap-compact) + var(--reserved-lines) * var(--reading-value-size) * var(--u1-line-value)); }
  @container reading-copy (min-width: 7rem) { .metric.compact.quiet.two-lines { --reserved-lines: 1; } }
  .label { color: var(--u1-muted); font-size: var(--u1-type-label); line-height: var(--u1-line-label); }
  .value-frame { display: grid; min-width: 0; font-size: var(--u1-type-value); font-weight: var(--u1-weight-strong); font-variant-numeric: tabular-nums; line-height: var(--u1-line-value); }
  .hero .value-frame { font-size: var(--u1-type-value-hero); }
  .quiet .value-frame { font-size: var(--u1-type-value-quiet); }
  .hero.two-lines { min-height: calc(var(--u1-type-label) * var(--u1-line-label) + var(--u1-reading-copy-gap) + 2 * var(--u1-type-value-hero) * var(--u1-line-value)); }
  .metric.natural .value-frame { font-size: var(--u1-type-value); }
  .metric.natural.two-lines { min-height: 0; align-content: start; }
  .value-frame > * { grid-area: 1 / 1; min-width: 0; }
  .value { overflow-wrap: anywhere; }
  .words .value { overflow-wrap: normal; }
  .current, .skeleton-slot { align-self: center; }
  .skeleton-slot { display: grid; align-items: center; min-height: 1lh; }
  .skeleton-slot :global([data-skeleton='value']) { width: min(8ch, 100%); height: 1lh; }
</style>
