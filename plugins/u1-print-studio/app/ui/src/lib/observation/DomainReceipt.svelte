<script lang="ts">
  import type { Evidence, Freshness } from '../live/presentation';
  import Caption from '../ui/Caption.svelte';
  import ObservedMeta from '../ui/ObservedMeta.svelte';
  import { titleCase } from './format';
  let { observedAt, freshness, state, reason = null, loading = false }: { observedAt: string | null; freshness: Freshness; state: Evidence; reason?: string | null; loading?: boolean } = $props();
</script>
<Caption><ObservedMeta {observedAt} {freshness} {loading} groupedTime />{#if !loading && state !== 'known' && state !== 'stale'} · {titleCase(state)}{/if}{#if !loading && reason && reason !== 'not_requested'} · {titleCase(reason)}{/if}</Caption>
