<script lang="ts">
  import { Clock3, Printer } from 'lucide-svelte';
  import ObservationFrame from './ObservationFrame.svelte';
  import { formatDuration, titleCase } from './format';
  import { validateProgress, type ProgressObservation } from './types';
  import LoadingValue from '../common/LoadingValue.svelte';
  import { loadingObservation, type FailureProps } from './loading';
  type Props = FailureProps & ({ observation: ProgressObservation; loading?: false; refreshing?: boolean } | { loading: true; observation?: never; refreshing?: never });
  let { observation, loading: pending = false, refreshing = false, failure, onretry }: Props = $props();
  const loading = $derived(pending || !!failure);
  const accepted = $derived(loadingObservation(pending, observation, validateProgress));
  const progress = $derived(failure ? null : accepted);
</script>

<ObservationFrame title="Print Progress" icon={Printer} observedAt={progress?.sourceObservedAt ?? null} freshness={progress?.freshness ?? 'unknown'} stateKind={failure ?? (pending ? 'loading' : 'ready')} placeholder={loading} {onretry} {refreshing}>
  <div class="progress-top">
    <span class="observation-status" class:loading><LoadingValue {loading} text={progress ? titleCase(progress.state) : undefined} words={[9]} /></span>
    <div class="percent"><LoadingValue {loading} text={progress ? Math.round(progress.percent) : undefined} size="short" words={[3]} /><span class:loading-unit={loading} aria-hidden={loading ? true : undefined}>%</span></div>
  </div>
  <div class="progress-track" role={loading ? undefined : 'progressbar'} aria-hidden={loading ? true : undefined} aria-label={loading ? undefined : 'Print progress'} aria-valuenow={progress?.percent} aria-valuemin={loading ? undefined : 0} aria-valuemax={loading ? undefined : 100}>
    <div class="progress-fill" style={`width:${progress?.percent ?? 0}%`}></div>
  </div>
  <div class="progress-detail"><span>Layer <strong><LoadingValue {loading} text={progress?.currentLayer} size="short" /></strong> / <LoadingValue {loading} text={progress?.totalLayers} size="short" /></span><span><Clock3 aria-hidden="true" /> <LoadingValue {loading} text={progress ? `About ${formatDuration(progress.etaSeconds)} left` : undefined} words={[5, 2, 3, 4]} size="long" /></span></div>
  <div class="elapsed"><Clock3 aria-hidden="true" /><div><span class="observation-label">Elapsed</span><strong><LoadingValue {loading} text={progress ? formatDuration(progress.elapsedSeconds) : undefined} words={[3, 3]} /></strong></div></div>
</ObservationFrame>

<style>
  .progress-top { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px; }
  .loading::before { visibility: hidden; }
  .loading-unit { visibility: hidden; }
  .percent { display: flex; flex: none; align-items: baseline; text-align: end; padding-inline-end: .08em; color: var(--u1-positive); font-size: clamp(42px, 13vw, 68px); font-weight: 380; line-height: .95; letter-spacing: -.06em; font-variant-numeric: tabular-nums; }
  .percent span { margin-left: 2px; font-size: .52em; }
  .progress-track { height: 8px; margin-top: 18px; overflow: hidden; border-radius: 999px; background: var(--u1-soft); }
  .progress-fill { height: 100%; border-radius: inherit; background: var(--u1-accent); }
  .progress-detail { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 12px; margin-top: 12px; color: var(--u1-muted); font-size: 13px; font-variant-numeric: tabular-nums; }
  .progress-detail span { display: inline-flex; align-items: center; gap: 6px; }
  .progress-detail :global(svg) { width: 17px; height: 17px; }
  .progress-detail strong { color: #b27e00; font-weight: 650; }
  .elapsed { display: flex; align-items: center; gap: 10px; margin-top: 18px; padding-top: 16px; border-top: 1px solid var(--u1-line); }
  .elapsed > :global(svg) { width: 20px; height: 20px; color: var(--u1-muted); }
  .elapsed div { display: grid; gap: 3px; }
  .elapsed strong { font-size: 19px; font-weight: 560; font-variant-numeric: tabular-nums; }
  @media (max-width: 360px) { .progress-detail { font-size: 12px; } }
</style>
