<script lang="ts">
  import { validateCurrentJob, type CurrentJobObservation } from './types';
  import { loadingObservation } from './loading';
  import type { CurrentJobValue } from './current-job-value';
  import CurrentJobPanel from './CurrentJobPanel.svelte';
  type Props = { observation: CurrentJobObservation; loading?: false; refreshing?: boolean } | { loading: true; observation?: never; refreshing?: never };
  let { observation, loading = false, refreshing = false }: Props = $props();
  let feedback = $state('');
  const fixture = $derived(loadingObservation(loading, observation, validateCurrentJob));
  const known = <T,>(value: T | null) => ({ reported: value !== null, value });
  const job = $derived<CurrentJobValue | undefined>(fixture ? {
    printState: known(fixture.state), filename: { reported: fixture.filenameReported, value: fixture.filename },
    storageActive: known(fixture.storageActive), filePositionBytes: known(fixture.filePositionBytes), fileSizeBytes: known(fixture.fileSizeBytes),
    printDurationSeconds: known(fixture.printDurationSeconds), totalDurationSeconds: known(fixture.totalDurationSeconds), filamentUsedMillimeters: known(fixture.filamentUsedMillimeters)
  } : undefined);
</script>

<CurrentJobPanel {job} observedAt={fixture?.sourceObservedAt ?? null} freshness={fixture?.freshness ?? 'unknown'} evidence="known" phase={loading ? 'loading' : 'ready'} {refreshing} {feedback} sourceLabel="Lab fixture" refreshLabel="Refresh lab fixture" onrefresh={() => { feedback = 'Lab fixture refreshed'; }} />
