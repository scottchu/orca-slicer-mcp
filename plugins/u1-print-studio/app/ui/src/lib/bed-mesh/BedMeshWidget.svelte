<script lang="ts">
  import { Box, Grid2X2, Grid3X3, RotateCcw, RefreshCw } from 'lucide-svelte';
  import BedMesh2D from './BedMesh2D.svelte';
  import BedMesh3D from './BedMesh3D.svelte';
  import { meshPalette } from './palette';
  import { validateBedMeshObservation, type BedMeshObservation } from './types';
  import ChartFrame from '../ui/ChartFrame.svelte';
  import HeightLegend from '../ui/HeightLegend.svelte';
  import IconButton from '../ui/IconButton.svelte';
  import IconSegmentedControl from '../ui/IconSegmentedControl.svelte';
  import ObservedMeta from '../ui/ObservedMeta.svelte';
  import WidgetBody from '../ui/WidgetBody.svelte';
  import WidgetFooter from '../ui/WidgetFooter.svelte';
  import WidgetHeader from '../ui/WidgetHeader.svelte';
  import WidgetShell from '../ui/WidgetShell.svelte';
  import WidgetStateSurface from '../ui/WidgetStateSurface/WidgetStateSurface.svelte';
  import LoadingValue from '../ui/LoadingValue.svelte';
  import Skeleton from '../ui/Skeleton.svelte';
  import RetainedLayer from '../ui/RetainedLayer.svelte';
  import StateAnnouncement from '../ui/StateAnnouncement.svelte';
  import { loadingObservation } from '../observation/loading';
  import { onDestroy, tick } from 'svelte';
  import { createRetryFocusRecovery } from './retry-focus';

  type Props = { observation?: BedMeshObservation; loading?: boolean; refreshing?: boolean; failure?: 'error' | 'unavailable'; retrying?: boolean; onretry?: () => void };
  let { observation, loading = false, refreshing = false, failure, retrying = false, onretry, selectedMode, onmode }: Props & { selectedMode?: '3d' | '2d'; onmode?: (mode: '3d' | '2d') => void } = $props();
  const placeholder = $derived(!observation || !!failure || retrying);
  const mesh = $derived.by(() => {
    if (loading && observation || !observation && !loading && !failure && !retrying) throw new Error('Invalid bed mesh presentation state');
    return loadingObservation(!observation, observation, validateBedMeshObservation);
  });
  const surfacePhase = $derived(failure ?? (retrying ? 'error' : loading ? 'loading' : refreshing ? 'refreshing' : 'ready'));
  const retryAction = $derived((failure === 'error' || retrying) && !!onretry);
  const showAction = $derived(!placeholder || retryAction && !!onretry);
  let localMode = $state<'3d' | '2d'>('3d');
  const modeOptions = [{ value: '3d', label: '3D surface', icon: Box }, { value: '2d', label: '2D grid', icon: Grid2X2 }] as const;
  const mode = $derived(selectedMode ?? localMode);
  let action = $state<ReturnType<typeof IconButton>>();
  let modeControl = $state<{ focusSelected: () => void }>();
  const retryFocus = createRetryFocusRecovery({
    captureFocus: () => action?.captureFocus(),
    canRecoverFocus: () => action?.canRecoverFocus() ?? false,
    focusSelected: () => modeControl?.focusSelected(),
    afterRender: tick
  });
  $effect.pre(() => retryFocus.update({ retrying, mode, ready: !!mesh && !loading && !refreshing && !failure }));
  let resetKey = $state(0);
  let feedback = $state<string | null>(null);
  let feedbackTimer: ReturnType<typeof setTimeout> | undefined;
  const notice = $derived(failure === 'error' || retrying ? 'Could not load bed mesh' : failure === 'unavailable' ? 'Bed mesh unavailable' : null);

  const flash = (message: string) => {
    feedback = message;
    clearTimeout(feedbackTimer);
    feedbackTimer = setTimeout(() => { feedback = null; }, 1200);
  };
  const selectMode = (next: '3d' | '2d') => {
    localMode = next;
    onmode?.(next);
    flash(next === '3d' ? '3D view' : '2D view');
  };
  const reset = () => {
    resetKey += 1;
    flash('View reset');
  };
  onDestroy(() => { clearTimeout(feedbackTimer); retryFocus.dispose(); });
</script>

{#snippet feedbackOverlay()}{feedback}{/snippet}

<WidgetStateSurface phase={surfacePhase}>
<StateAnnouncement text={notice || (loading ? 'Loading Bed Mesh' : refreshing ? 'Refreshing Bed Mesh' : 'Bed Mesh loaded')} />
<WidgetShell label="Bed Mesh" busy={loading || refreshing}>
  {#snippet children()}
    <WidgetHeader title="Bed Mesh">
      {#snippet icon()}<Grid3X3 size={22} strokeWidth={1.8} />{/snippet}
      {#snippet meta()}<ObservedMeta observedAt={mesh?.sourceObservedAt ?? null} freshness={mesh?.freshness ?? 'unknown'} loading={placeholder} />{/snippet}
    </WidgetHeader>
    <WidgetBody>
      {#snippet children()}
        <div class="mesh-kicker">Reported probe grid · <LoadingValue loading={placeholder} text={!placeholder && mesh ? `${mesh.summary.columns} × ${mesh.summary.rows}` : undefined} />{placeholder || mesh?.fixture ? ' · Lab fixture' : ''}</div>
        <ChartFrame label={!placeholder && mesh ? `Bed mesh ${mode === '3d' ? '3D surface' : '2D grid'}, ${mesh.summary.minimum.toFixed(3)} to ${mesh.summary.maximum.toFixed(3)} millimetres` : loading ? 'Loading bed mesh' : 'Bed mesh unavailable'} description={!placeholder && mesh ? `Z height in millimetres; top ${mesh.summary.maximum}, bottom ${mesh.summary.minimum}` : 'Z height in millimetres; range unavailable'} overlay={!notice && feedback ? feedbackOverlay : undefined}>
          {#snippet leading()}<HeightLegend minimum={!placeholder ? mesh?.summary.minimum ?? null : null} maximum={!placeholder ? mesh?.summary.maximum ?? null : null} palette={meshPalette} orientation="vertical" placement="start" showEndpoints={false} />{/snippet}
          {#if placeholder}<Skeleton shape="chart" />{/if}
          <RetainedLayer masked={placeholder}>
          {#if mesh && mode === '3d'}
            <BedMesh3D observation={mesh} {resetKey} />
          {:else if mesh}
            <BedMesh2D observation={mesh} />
          {/if}
          </RetainedLayer>
        </ChartFrame>
        <dl class="summary">
          <div><dt>Minimum</dt><dd><LoadingValue loading={placeholder} text={placeholder ? undefined : mesh?.summary.minimum.toFixed(3)} /> mm</dd></div>
          <div><dt>Maximum</dt><dd><LoadingValue loading={placeholder} text={placeholder ? undefined : mesh?.summary.maximum.toFixed(3)} /> mm</dd></div>
          <div><dt>Range</dt><dd><LoadingValue loading={placeholder} text={placeholder ? undefined : mesh?.summary.range.toFixed(3)} /> mm</dd></div>
        </dl>
      {/snippet}
    </WidgetBody>
    <WidgetFooter message={notice ?? ''}>
      {#snippet actions()}
        {#if placeholder}<IconSegmentedControl label="Bed mesh view" options={modeOptions} loading />{:else}
          <IconSegmentedControl bind:this={modeControl} label="Bed mesh view" options={modeOptions} value={mode} onchange={selectMode} />
        {/if}
        <span class="action-separator" aria-hidden="true"></span>
        {#if showAction}<IconButton bind:this={action} label={retryAction ? 'Retry bed mesh' : 'Reset bed mesh view'} icon={retryAction ? RefreshCw : RotateCcw} onclick={retryAction ? onretry : reset} busy={retrying} disabled={!retryAction && mode === '2d'} />{:else}<Skeleton shape="action" />{/if}
      {/snippet}
    </WidgetFooter>
  {/snippet}
</WidgetShell>
</WidgetStateSurface>

<style>
  .mesh-kicker { margin: 0 0 12px; color: var(--u1-muted); font-size: 13px; line-height: 1.4; }
  .summary { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin: 18px 0 0; padding: 0; }
  .summary div { min-width: 0; }
  dt { color: var(--u1-muted); font-size: 11px; line-height: 1.3; text-transform: uppercase; letter-spacing: 0.08em; }
  dd { margin: 5px 0 0; font-size: 16px; line-height: 1.35; font-variant-numeric: tabular-nums; }
  .action-separator { width: 1px; height: 28px; margin: 0 2px; background: var(--u1-line); }
  @media (max-width: 360px) {
    .summary { gap: 8px; }
    dd { font-size: 14px; }
  }
</style>
