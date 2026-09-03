<script lang="ts">
  import Skeleton from './Skeleton.svelte';
  import StaticSkeleton from './StaticSkeleton.svelte';
  let { label, display, state }: { label: string; display: string; state: 'known' | 'unknown' | 'unavailable' | 'loading' } = $props();
</script>
<div class="metric" data-node-kind="Metric" data-value-state={state}>
  <span class="label">{label}</span>
  {#if state === 'loading'}<Skeleton shape="value" />{:else if state === 'unavailable'}<StaticSkeleton shape="value" />{:else}<span class="value">{display}</span>{/if}
</div>
<style>
  .metric { display: grid; gap: 3px; min-width: 0; }
  .label { color: var(--u1-muted); font-size: .8125rem; line-height: 1.35; }
  .value { min-width: 0; overflow-wrap: anywhere; font-size: 1.25rem; font-weight: var(--u1-weight-strong); font-variant-numeric: tabular-nums; line-height: var(--u1-line-value); }
</style>
