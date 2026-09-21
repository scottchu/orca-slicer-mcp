<script lang="ts">
  import type { Snippet } from 'svelte';
  import { Clock3, Printer } from 'lucide-svelte';
  import ObservationFrame from '../common/Frame.svelte';
  import { formatDuration, titleCase } from '../../lib/client/observation/format';
  import type { ProgressObservation } from '../../lib/client/observation/types';
  import LoadingValue from '../common/LoadingValue.svelte';
  import { type FailureProps } from '../../lib/client/observation/loading';
  import type { ProgressPresentation } from '../../lib/client/live/focused-presentation';
  import ToolpathPreview from './ToolpathPreview.svelte';
  type Props = FailureProps & { lab?: boolean; meta?: Snippet; actionLabel?: string; feedback?: string; failureMessage?: string } & ({ observation: ProgressObservation; live?: never; loading?: false; refreshing?: boolean } | { live: ProgressPresentation; observation?: never; loading?: false; refreshing?: boolean } | { loading: true; observation?: never; live?: never; refreshing?: never });
  let { observation, live, loading: pending = false, refreshing = false, failure, onretry, lab = true, meta, actionLabel, feedback, failureMessage }: Props = $props();
  const loading = $derived(pending || !!failure);
  const accepted = $derived(live ? { sourceObservedAt: live.sourceObservedAt, freshness: live.freshness, state: live.printerState, percent: live.fields.percent.value, currentLayer: live.fields.currentLayer.value, totalLayers: live.fields.totalLayers.value, elapsedSeconds: live.fields.elapsedSeconds.value, etaSeconds: live.fields.estimatedRemainingSeconds.value } : (pending ? null : observation ?? null));
  const progress = $derived(failure ? null : accepted);
</script>

<ObservationFrame title="Print Progress" icon={Printer} observedAt={progress?.sourceObservedAt ?? null} freshness={progress?.freshness ?? 'unknown'} stateKind={failure ?? (pending ? 'loading' : 'ready')} placeholder={loading} {onretry} {refreshing} {lab} {meta} {actionLabel} {feedback} {failureMessage}>
  {#if !lab}<ToolpathPreview preview={live?.preview} filename={live?.fields.filename.value} masked={loading} />{/if}
  <div class="progress-top" class:live={!lab}>
    <span class="observation-status" class:loading><LoadingValue {loading} text={loading ? undefined : (progress ? titleCase(progress.state) : undefined)} words={lab ? [9] : undefined} /></span>
    <div class="percent"><LoadingValue {loading} text={loading ? undefined : (progress?.percent == null ? 'Unknown' : Math.round(progress.percent))} size="short" words={lab ? [3] : undefined} /><span class:loading-unit={loading} aria-hidden={loading ? true : undefined}>{progress?.percent == null && !loading ? '' : '%'}</span></div>
  </div>
  <div class="progress-track" role={loading || progress?.percent == null ? undefined : 'progressbar'} aria-hidden={loading || progress?.percent == null ? true : undefined} aria-label={loading ? undefined : 'Print progress'} aria-valuenow={progress?.percent ?? undefined} aria-valuemin={loading ? undefined : 0} aria-valuemax={loading ? undefined : 100}>
    <div class="progress-fill" style={`width:${progress?.percent ?? 0}%`}></div>
  </div>
  <div class="progress-detail" class:live={!lab}><span>Layer <strong><LoadingValue {loading} text={loading ? undefined : (progress?.currentLayer ?? 'Unknown')} size="short" /></strong> / <LoadingValue {loading} text={loading ? undefined : (progress?.totalLayers ?? 'Unknown')} size="short" /></span><span><Clock3 aria-hidden="true" /> <LoadingValue {loading} text={loading ? undefined : (progress?.etaSeconds == null ? 'Estimate unknown' : `About ${formatDuration(progress.etaSeconds)} left`)} words={lab ? [5, 2, 3, 4] : undefined} size="long" /></span></div>
  <div class="elapsed"><Clock3 aria-hidden="true" /><div><span class="observation-label">Elapsed</span><strong><LoadingValue {loading} text={loading ? undefined : (progress?.elapsedSeconds == null ? 'Unknown' : formatDuration(progress.elapsedSeconds))} words={lab ? [3, 3] : undefined} /></strong></div></div>
</ObservationFrame>

<style>
  .progress-top { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px; }
  .progress-top.live { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, max(8em, calc(50% - 8px))), 1fr)); }
  .progress-top.live .percent { min-width: 0; max-width: 100%; flex-wrap: wrap; justify-content: flex-end; overflow-wrap: anywhere; }
  .progress-detail.live { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 12em), 1fr)); }
  .progress-detail.live > span { flex-wrap: wrap; min-width: 0; max-width: 100%; overflow-wrap: anywhere; }
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
