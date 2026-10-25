<script lang="ts">
  import type { Evidence, Freshness } from '../../lib/client/live/presentation';
  import Caption from '../common/Caption.svelte';
  import ObservedMeta from './ObservedMeta.svelte';
  import { titleCase } from '../../lib/client/observation/format';
  let {
    observedAt,
    freshness,
    state,
    reason = null,
    loading = false,
    groupedTime = true,
    includeNotRequestedReason = false,
    fallbackState,
  }: {
    observedAt: string | null;
    freshness: Freshness;
    state?: Evidence;
    reason?: string | null;
    loading?: boolean;
    groupedTime?: boolean;
    includeNotRequestedReason?: boolean;
    fallbackState?: 'not_reported';
  } = $props();
  // Cavity's field fallback is separate from receipt evidence and keeps its
  // existing sentence-case label; an explicit receipt state takes precedence.
  const displayedState = $derived(state && state !== 'known' && state !== 'stale' ? titleCase(state) : fallbackState === 'not_reported' ? 'Not reported' : null);
  const displayedReason = $derived(reason && (includeNotRequestedReason || reason !== 'not_requested') ? reason : null);
</script>
<Caption><ObservedMeta {observedAt} {freshness} {loading} {groupedTime} />{#if !loading && displayedState} · {displayedState}{/if}{#if !loading && displayedReason} · {titleCase(displayedReason)}{/if}</Caption>
