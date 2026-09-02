<script lang="ts">
  import { Clock3, Database, FileClock, Gauge, Route } from 'lucide-svelte';
  import ObservationFrame from './ObservationFrame.svelte';
  import { formatDuration, titleCase } from './format';
  import { validateCurrentJob, type CurrentJobObservation } from './types';
  import LoadingValue from '../ui/LoadingValue.svelte';
  import { loadingObservation, type FailureProps } from './loading';
  type Props = FailureProps & ({ observation: CurrentJobObservation; loading?: false; refreshing?: boolean } | { loading: true; observation?: never; refreshing?: never });
  let { observation, loading = false, refreshing = false, failure, onretry }: Props = $props();
  const job = $derived(loadingObservation(loading, observation, validateCurrentJob));
</script>

<ObservationFrame title="Current Job" icon={FileClock} observedAt={job?.sourceObservedAt ?? null} freshness={job?.freshness ?? 'unknown'} stateKind={failure ?? (loading ? 'loading' : 'ready')} placeholder={loading} {onretry} {refreshing}>
  <div class="job-primary">
    <span class="observation-status" class:loading><LoadingValue {loading} text={job ? titleCase(job.state) : undefined} words={[9]} /></span>
    <strong><LoadingValue {loading} text={job ? `${Math.round(job.progressPercent)}%` : undefined} size="short" words={[5]} /></strong>
  </div>
  <div class="job-track" aria-hidden="true"><span style={`width:${job?.progressPercent ?? 0}%`}></span></div>
  <div class="observation-metric-grid job-metrics">
    <div class="observation-metric"><Clock3 class="observation-icon" aria-hidden="true" /><span class="observation-label">Elapsed</span><strong><LoadingValue {loading} text={job ? formatDuration(job.elapsedSeconds) : undefined} words={[3, 3]} /></strong></div>
    <div class="observation-metric"><Route class="observation-icon" aria-hidden="true" /><span class="observation-label">Filament</span><strong><LoadingValue {loading} text={job ? `${(job.filamentUsedMm / 1000).toFixed(1)} m` : undefined} words={[4, 1]} /></strong></div>
    <div class="observation-metric"><Database class="observation-icon" aria-hidden="true" /><span class="observation-label">Storage</span><strong><LoadingValue {loading} text={job ? job.storageActive ? 'Active' : 'Idle' : undefined} /></strong></div>
    <div class="observation-metric"><Gauge class="observation-icon" aria-hidden="true" /><span class="observation-label">Progress</span><strong><LoadingValue {loading} text={job ? `${Math.round(job.progressPercent)}%` : undefined} /></strong></div>
  </div>
</ObservationFrame>

<style>
  .job-primary { display: flex; flex-wrap: wrap; align-items: end; justify-content: space-between; gap: 16px; }
  .loading::before { visibility: hidden; }
  .job-primary > strong { color: var(--u1-positive); font-size: 42px; font-weight: 420; line-height: 1; letter-spacing: -.05em; }
  .job-track { height: 8px; margin: 16px 0; overflow: hidden; border-radius: 99px; background: var(--u1-soft); }
  .job-track span { display: block; height: 100%; border-radius: inherit; background: var(--u1-accent); }
  .job-metrics { grid-template-columns: repeat(auto-fit, minmax(min(100%, max(8em, calc(50% - 8px))), 1fr)); font-size: var(--u1-type-name); }
  .observation-metric { display: grid; grid-template-columns: 20px minmax(0, 1fr); align-items: center; gap: 3px 8px; }
  .observation-metric strong { grid-column: 2; font-size: 16px; font-weight: 560; }
  @media (min-width: 590px) { .job-metrics { grid-template-columns: repeat(auto-fit, minmax(min(100%, max(8em, calc(25% - 12px))), 1fr)); } }
</style>
