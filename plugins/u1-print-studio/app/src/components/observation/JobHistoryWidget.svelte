<script lang="ts">
  import { validateJobHistory, type JobHistoryObservation } from '../../lib/client/observation/types';
  import { loadingObservation, type FailureProps } from '../../lib/client/observation/loading';
  import HistoryPanel from './HistoryPanel.svelte';
  import Caption from '../common/Caption.svelte';
  import ObservedMeta from './ObservedMeta.svelte';
  type Props = FailureProps & ({ observation: JobHistoryObservation; loading?: false; refreshing?: boolean; rows?: number } | { loading: true; observation?: never; refreshing?: never; rows?: number });
  let { observation, loading = false, refreshing = false, failure, onretry, rows = 4 }: Props = $props();
  const accepted = $derived(loadingObservation(loading, observation, validateJobHistory));
  let feedback = $state('');
  $effect(() => { loading; refreshing; failure; feedback = ''; });
  const refresh = () => { if (failure && onretry) onretry(); else feedback = 'Lab fixture refreshed'; };
</script>
{#snippet meta()}<Caption>Lab fixture · <ObservedMeta observedAt={failure ? null : accepted?.sourceObservedAt ?? null} freshness={failure ? 'unknown' : accepted?.freshness ?? 'unknown'} loading={loading || !!failure} /></Caption>{/snippet}
{#if accepted}
  <HistoryPanel observation={accepted} {failure} {refreshing} onretry={refresh} {meta} {feedback} actionLabel={failure ? 'Retry lab fixture' : 'Refresh lab fixture'} />
{:else}
  <HistoryPanel loading {failure} onretry={refresh} {meta} {feedback} actionLabel={failure ? 'Retry lab fixture' : 'Refresh lab fixture'} rows={rows} />
{/if}
