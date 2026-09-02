<script lang="ts">
  import type { Evidence, Freshness } from '../../lib/client/live/presentation';
  import Caption from '../common/Caption.svelte';
  import ObservedMeta from './ObservedMeta.svelte';
  import { titleCase } from '../../lib/client/observation/format';
  let { observedAt, freshness, state, reason = null, loading = false }: { observedAt: string | null; freshness: Freshness; state: Evidence; reason?: string | null; loading?: boolean } = $props();
</script>
<Caption><ObservedMeta {observedAt} {freshness} {loading} groupedTime />{#if !loading && state !== 'known' && state !== 'stale'} · {titleCase(state)}{/if}{#if !loading && reason && reason !== 'not_requested'} · {titleCase(reason)}{/if}</Caption>
