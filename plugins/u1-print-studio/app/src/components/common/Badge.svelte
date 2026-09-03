<script lang="ts">
  import Skeleton from './Skeleton.svelte';
  import StaticSkeleton from './StaticSkeleton.svelte';
  let { label, display, state }: { label: string; display: string; state: 'known' | 'unknown' | 'unavailable' | 'loading' } = $props();
</script>
<div class="badge-cell" data-node-kind="Badge" data-value-state={state}>
  <span class="label">{label}</span>
  {#if state === 'loading'}<Skeleton shape="value" />{:else if state === 'unavailable'}<StaticSkeleton shape="value" />{:else}<span class="badge">{display}</span>{/if}
</div>
<style>
  .badge-cell { display: grid; gap: 5px; min-width: 0; }
  .label { color: var(--u1-muted); font-size: .8125rem; line-height: 1.35; }
  .badge { width: fit-content; max-width: 100%; padding: 4px 9px; border: 1px solid var(--u1-line); border-radius: 999px; background: var(--u1-canvas); overflow-wrap: anywhere; font-size: .875rem; font-weight: var(--u1-weight-name); line-height: 1.25; }
</style>
