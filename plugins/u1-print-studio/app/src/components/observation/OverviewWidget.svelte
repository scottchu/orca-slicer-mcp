<script lang="ts">
  import { validateOverview, type OverviewObservation } from '../../lib/client/observation/types';
  import { loadingObservation, type FailureProps } from '../../lib/client/observation/loading';
  import OverviewPanel from './OverviewPanel.svelte';
  import Caption from '../common/Caption.svelte';
  import ObservedMeta from './ObservedMeta.svelte';
  type Props = FailureProps & ({ observation: OverviewObservation; loading?: false; refreshing?: boolean } | { loading: true; observation?: never; refreshing?: never });
  let { observation, loading = false, refreshing = false, failure, onretry }: Props = $props();
  const accepted = $derived(loadingObservation(loading, observation, validateOverview));
  let feedback = $state('');
  $effect(() => { loading; refreshing; failure; feedback = ''; });
  const refresh = () => { if (failure && onretry) onretry(); else feedback = 'Lab fixture refreshed'; };
</script>
{#snippet meta()}<Caption>Lab fixture · <ObservedMeta observedAt={failure ? null : accepted?.sourceObservedAt ?? null} freshness={failure ? 'unknown' : accepted?.freshness ?? 'unknown'} loading={loading || !!failure} /></Caption>{/snippet}
{#if accepted}
  <OverviewPanel observation={accepted} {failure} {refreshing} onretry={refresh} {meta} {feedback} actionLabel={failure ? 'Retry lab fixture' : 'Refresh lab fixture'} />
{:else}
  <OverviewPanel loading {failure} onretry={refresh} {meta} {feedback} actionLabel={failure ? 'Retry lab fixture' : 'Refresh lab fixture'} />
{/if}
