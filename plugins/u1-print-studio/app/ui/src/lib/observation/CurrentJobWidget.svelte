<script lang="ts">
  import { Clock3, Database, FileClock, Gauge, Route } from 'lucide-svelte';
  import ObservationFrame from './ObservationFrame.svelte';
  import { formatDuration, titleCase } from './format';
  import { validateCurrentJob, type CurrentJobObservation } from './types';
  let { observation }: { observation: CurrentJobObservation } = $props();
  const job = $derived(validateCurrentJob(observation));
</script>

<ObservationFrame title="Current Job" icon={FileClock} observedAt={job.sourceObservedAt} freshness={job.freshness}>
  <div class="job-primary">
    <span class="observation-status">{titleCase(job.state)}</span>
    <strong>{Math.round(job.progressPercent)}%</strong>
  </div>
  <div class="job-track" aria-hidden="true"><span style={`width:${job.progressPercent}%`}></span></div>
  <div class="observation-metric-grid job-metrics">
    <div class="observation-metric"><Clock3 class="observation-icon" aria-hidden="true" /><span class="observation-label">Elapsed</span><strong>{formatDuration(job.elapsedSeconds)}</strong></div>
    <div class="observation-metric"><Route class="observation-icon" aria-hidden="true" /><span class="observation-label">Filament</span><strong>{(job.filamentUsedMm / 1000).toFixed(1)} m</strong></div>
    <div class="observation-metric"><Database class="observation-icon" aria-hidden="true" /><span class="observation-label">Storage</span><strong>{job.storageActive ? 'Active' : 'Idle'}</strong></div>
    <div class="observation-metric"><Gauge class="observation-icon" aria-hidden="true" /><span class="observation-label">Progress</span><strong>{Math.round(job.progressPercent)}%</strong></div>
  </div>
</ObservationFrame>

<style>
  .job-primary { display: flex; align-items: end; justify-content: space-between; gap: 16px; }
  .job-primary > strong { color: var(--u1-positive); font-size: 42px; font-weight: 420; line-height: 1; letter-spacing: -.05em; }
  .job-track { height: 8px; margin: 16px 0; overflow: hidden; border-radius: 99px; background: var(--u1-soft); }
  .job-track span { display: block; height: 100%; border-radius: inherit; background: var(--u1-accent); }
  .job-metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .observation-metric { display: grid; grid-template-columns: 20px minmax(0, 1fr); align-items: center; gap: 3px 8px; }
  .observation-metric strong { grid-column: 2; font-size: 16px; font-weight: 560; }
  @media (min-width: 590px) { .job-metrics { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
</style>
