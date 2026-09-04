<script lang="ts">
  import Skeleton from './Skeleton.svelte';
  import StaticSkeleton from './StaticSkeleton.svelte';
  let { label, display, state }: {
    label: string;
    display: string;
    state: 'known' | 'unknown' | 'unavailable' | 'loading';
  } = $props();
</script>
<div class="badge-cell" data-node-kind="Badge" data-value-state={state}>
  <span class="label">{label}</span>
  <span class="badge-frame">
    {#if state === 'loading'}<span class="skeleton-slot"><Skeleton shape="value" /></span>{:else if state === 'unavailable'}<span class="skeleton-slot"><StaticSkeleton shape="value" /></span>{:else}<span class="badge current">{display}</span>{/if}
  </span>
</div>
<style>
  .badge-cell { display: grid; gap: 5px; min-width: 0; }
  .label { color: var(--u1-muted); font-size: .8125rem; line-height: 1.35; }
  .badge-frame { display: grid; align-items: center; min-width: 0; font-size: .875rem; font-weight: var(--u1-weight-name); line-height: 1.25; }
  .badge-frame > * { grid-area: 1 / 1; min-width: 0; }
  .badge-frame { min-height: calc(1lh + 10px); }
  .badge { width: fit-content; max-width: 100%; padding: 4px 9px; border: 1px solid var(--u1-line); border-radius: 999px; background: var(--u1-canvas); overflow-wrap: anywhere; font-size: .875rem; font-weight: var(--u1-weight-name); line-height: 1.25; }
  .current, .skeleton-slot { align-self: center; }
  .skeleton-slot { display: grid; align-items: center; min-height: calc(1lh + 10px); }
  .skeleton-slot :global([data-skeleton='value']) { width: min(7ch, 100%); height: calc(1lh + 10px); border-radius: 999px; }
</style>
