<script lang="ts">
  import { Clock3, Database, FileClock, Gauge, Route } from 'lucide-svelte';
  import ObservationFrame from '../common/Frame.svelte';
  import { formatDuration, titleCase } from '../../lib/client/observation/format';
  import type { CurrentJobObservation } from '../../lib/client/observation/types';
  import LoadingValue from '../common/LoadingValue.svelte';
  import { type FailureProps } from '../../lib/client/observation/loading';
  import type { Snippet } from 'svelte';
  import type { JobsPresentation, Reported } from '../../lib/client/live/focused-presentation';
  import Caption from '../common/Caption.svelte';
  import InfoPair from '../common/InfoPair.svelte';
  type Props = FailureProps & { lab?: boolean; meta?: Snippet; actionLabel?: string; feedback?: string; failureMessage?: string } & ({ observation: CurrentJobObservation; live?: never; loading?: false; refreshing?: boolean } | { live: JobsPresentation; observation?: never; loading?: false; refreshing?: boolean } | { loading: true; live?: never; observation?: never; refreshing?: never });
  let { observation, live, loading: pending = false, refreshing = false, failure, onretry, lab = true, meta, actionLabel, feedback, failureMessage }: Props = $props();
  const loading = $derived(pending || !!failure);
  const accepted = $derived(live ? null : (pending ? null : observation ?? null));
  const job = $derived(failure ? null : accepted);
  const current = $derived(failure ? null : live);
  const reportedText = <T,>(field: Reported<T> | undefined, format: (value: T) => string): string => field?.value == null ? field?.reported ? 'Unknown' : 'Not reported' : format(field.value);
</script>

<ObservationFrame title="Current Job" icon={FileClock} observedAt={current?.receipt.sourceObservedAt ?? job?.sourceObservedAt ?? null} freshness={current?.receipt.freshness ?? job?.freshness ?? 'unknown'} stateKind={failure ?? (pending ? 'loading' : 'ready')} placeholder={loading} {onretry} {refreshing} {lab} {meta} {actionLabel} {feedback} {failureMessage}>
  <div class="job-primary" class:live={!lab}>
    <span class="observation-status" class:loading><LoadingValue {loading} text={loading ? undefined : (lab ? job ? titleCase(job.state) : undefined : reportedText(current?.printState, titleCase))} words={lab ? [9] : undefined} /></span>
    <strong><LoadingValue {loading} text={loading ? undefined : (lab ? job ? `${Math.round(job.progressPercent)}%` : undefined : reportedText(current?.filename, value => value))} size="short" words={lab ? [5] : undefined} /></strong>
  </div>
  {#if lab}<div class="job-track" aria-hidden="true"><span style={`width:${job?.progressPercent ?? 0}%`}></span></div>{/if}
  <div class="observation-metric-grid job-metrics" class:live={!lab}>
    <div class="observation-metric"><Clock3 class="observation-icon" aria-hidden="true" /><span class="observation-label">{lab ? 'Elapsed' : 'Print duration'}</span><strong><LoadingValue {loading} text={loading ? undefined : (lab ? job ? formatDuration(job.elapsedSeconds) : undefined : reportedText(current?.printDurationSeconds, formatDuration))} words={lab ? [3, 3] : undefined} /></strong></div>
    <div class="observation-metric"><Route class="observation-icon" aria-hidden="true" /><span class="observation-label">Filament</span><strong><LoadingValue {loading} text={loading ? undefined : (lab ? job ? `${(job.filamentUsedMm / 1000).toFixed(1)} m` : undefined : reportedText(current?.filamentUsedMillimeters, value => `${value} mm`))} words={lab ? [4, 1] : undefined} /></strong></div>
    <div class="observation-metric"><Database class="observation-icon" aria-hidden="true" /><span class="observation-label">Storage</span><strong><LoadingValue {loading} text={loading ? undefined : (lab ? job ? job.storageActive ? 'Active' : 'Idle' : undefined : reportedText(current?.storageActive, value => value ? 'Active' : 'Inactive'))} /></strong></div>
    <div class="observation-metric"><Gauge class="observation-icon" aria-hidden="true" /><span class="observation-label">{lab ? 'Progress' : 'Total duration'}</span><strong><LoadingValue {loading} text={loading ? undefined : (lab ? job ? `${Math.round(job.progressPercent)}%` : undefined : reportedText(current?.totalDurationSeconds, formatDuration))} /></strong></div>
  </div>
  {#if !lab}
    <InfoPair>{#snippet label()}<Caption>File position</Caption>{/snippet}{#snippet value()}<LoadingValue {loading} text={loading ? undefined : (reportedText(current?.filePositionBytes, value => `${value} bytes`))} />{/snippet}</InfoPair>
    <InfoPair>{#snippet label()}<Caption>File size</Caption>{/snippet}{#snippet value()}<LoadingValue {loading} text={loading ? undefined : (reportedText(current?.fileSizeBytes, value => `${value} bytes`))} />{/snippet}</InfoPair>
  {/if}
</ObservationFrame>

<style>
  .job-primary { display: flex; flex-wrap: wrap; align-items: end; justify-content: space-between; gap: 16px; }
  .loading::before { visibility: hidden; }
  .job-primary > strong { color: var(--u1-positive); font-size: 42px; font-weight: 420; line-height: 1; letter-spacing: -.05em; }
  .job-primary.live { align-items: start; flex-direction: column; margin-bottom: 16px; }
  .job-primary.live > strong { font-size: 16px; line-height: 1.4; letter-spacing: normal; overflow-wrap: anywhere; }
  .job-track { height: 8px; margin: 16px 0; overflow: hidden; border-radius: 99px; background: var(--u1-soft); }
  .job-track span { display: block; height: 100%; border-radius: inherit; background: var(--u1-accent); }
  .job-metrics { grid-template-columns: repeat(auto-fit, minmax(min(100%, max(8em, calc(50% - 8px))), 1fr)); font-size: var(--u1-type-name); }
  .observation-metric { display: grid; grid-template-columns: 20px minmax(0, 1fr); align-items: center; gap: 3px 8px; }
  .job-metrics.live .observation-metric strong { min-width: 0; overflow-wrap: anywhere; }
  .observation-metric strong { grid-column: 2; font-size: 16px; font-weight: 560; }
  @media (min-width: 590px) { .job-metrics { grid-template-columns: repeat(auto-fit, minmax(min(100%, max(8em, calc(25% - 12px))), 1fr)); } }
</style>
