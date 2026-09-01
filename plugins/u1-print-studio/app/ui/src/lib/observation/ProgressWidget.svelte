<script lang="ts">
  import { Clock3, Printer } from 'lucide-svelte';
  import ObservationFrame from './ObservationFrame.svelte';
  import { formatDuration, titleCase } from './format';
  import { validateProgress, type ProgressObservation } from './types';
  let { observation }: { observation: ProgressObservation } = $props();
  const progress = $derived(validateProgress(observation));
</script>

<ObservationFrame title="Print Progress" icon={Printer} observedAt={progress.sourceObservedAt} freshness={progress.freshness}>
  <div class="progress-top">
    <span class="observation-status">{titleCase(progress.state)}</span>
    <div class="percent">{Math.round(progress.percent)}<span>%</span></div>
  </div>
  <div class="progress-track" role="progressbar" aria-label="Print progress" aria-valuenow={progress.percent} aria-valuemin="0" aria-valuemax="100">
    <div class="progress-fill" style={`width:${progress.percent}%`}></div>
  </div>
  <div class="progress-detail"><span>Layer <strong>{progress.currentLayer}</strong> / {progress.totalLayers}</span><span><Clock3 aria-hidden="true" /> About {formatDuration(progress.etaSeconds)} left</span></div>
  <div class="elapsed"><Clock3 aria-hidden="true" /><div><span class="observation-label">Elapsed</span><strong>{formatDuration(progress.elapsedSeconds)}</strong></div></div>
</ObservationFrame>

<style>
  .progress-top { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
  .percent { color: var(--u1-positive); font-size: clamp(42px, 13vw, 68px); font-weight: 380; line-height: .95; letter-spacing: -.06em; font-variant-numeric: tabular-nums; }
  .percent span { margin-left: 2px; font-size: .52em; }
  .progress-track { height: 8px; margin-top: 18px; overflow: hidden; border-radius: 999px; background: var(--u1-soft); }
  .progress-fill { height: 100%; border-radius: inherit; background: var(--u1-accent); }
  .progress-detail { display: flex; justify-content: space-between; gap: 12px; margin-top: 12px; color: var(--u1-muted); font-size: 13px; font-variant-numeric: tabular-nums; }
  .progress-detail span { display: inline-flex; align-items: center; gap: 6px; }
  .progress-detail :global(svg) { width: 17px; height: 17px; }
  .progress-detail strong { color: #b27e00; font-weight: 650; }
  .elapsed { display: flex; align-items: center; gap: 10px; margin-top: 18px; padding-top: 16px; border-top: 1px solid var(--u1-line); }
  .elapsed > :global(svg) { width: 20px; height: 20px; color: var(--u1-muted); }
  .elapsed div { display: grid; gap: 3px; }
  .elapsed strong { font-size: 19px; font-weight: 560; font-variant-numeric: tabular-nums; }
  @media (max-width: 360px) { .progress-detail { font-size: 12px; } }
</style>
