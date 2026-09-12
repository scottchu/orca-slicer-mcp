<script lang="ts">
  import { Box, Grid2X2, Grid3X3, RotateCcw, RefreshCw } from 'lucide-svelte';
  import BedMesh2D from './BedMesh2D.svelte';
  import BedMesh3D from './BedMesh3D.svelte';
  import { meshPalette } from '../../lib/client/bed-mesh/palette';
  import { validateBedMeshObservation, type BedMeshObservation } from '../../lib/client/bed-mesh/types';
  import ChartFrame from '../common/ChartFrame.svelte';
  import HeightLegend from '../common/HeightLegend.svelte';
  import Button from '../common/Button.svelte';
  import Switch from '../common/Switch.svelte';
  import ObservedMeta from '../observation/ObservedMeta.svelte';
  import Body from '../common/Body.svelte';
  import Footer from '../common/Footer.svelte';
  import Header from '../common/Header.svelte';
  import Shell from '../common/Shell.svelte';
  import StateSurface from '../common/StateSurface/StateSurface.svelte';
  import LoadingValue from '../common/LoadingValue.svelte';
  import TextViewport from '../common/TextViewport.svelte';
  import Skeleton from '../common/Skeleton.svelte';
  import RetainedLayer from '../common/RetainedLayer.svelte';
  import StateAnnouncement from '../common/StateAnnouncement.svelte';
  import { loadingObservation } from '../../lib/client/observation/loading';
  import { onDestroy, tick, type Snippet } from 'svelte';
  import { createRetryFocusRecovery } from '../../lib/client/bed-mesh/retry-focus';

  type Props = { observation?: BedMeshObservation; loading?: boolean; refreshing?: boolean; failure?: 'error' | 'unavailable'; retrying?: boolean; onretry?: () => void };
  let { observation, loading = false, refreshing = false, failure, retrying = false, onretry, selectedMode, onmode, receiptMeta, refreshAction, emptyMessage, emptyLabel, attribution }: Props & {
    selectedMode?: '3d' | '2d'; onmode?: (mode: '3d' | '2d') => void;
    receiptMeta?: Snippet; refreshAction?: Snippet; emptyMessage?: string; emptyLabel?: string; attribution?: Snippet;
  } = $props();
  const placeholder = $derived(!observation || !!failure || retrying);
  const mesh = $derived.by(() => {
    if (loading && observation || !observation && !loading && !failure && !retrying && !emptyMessage) throw new Error('Invalid bed mesh presentation state');
    return loadingObservation(!observation, observation, validateBedMeshObservation);
  });
  const surfacePhase = $derived(failure ?? (retrying ? 'error' : loading ? 'loading' : refreshing ? 'refreshing' : 'ready'));
  const retryAction = $derived((failure === 'error' || retrying) && !!onretry);
  const showAction = $derived(!placeholder || retryAction && !!onretry);
  let localMode = $state<'3d' | '2d'>('3d');
  const modeOptions = [{ value: '3d', label: '3D surface', icon: Box }, { value: '2d', label: '2D grid', icon: Grid2X2 }] as const;
  const mode = $derived(selectedMode ?? localMode);
  let action = $state<ReturnType<typeof Button>>();
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
  const notice = $derived(failure === 'error' || retrying ? 'Could not load bed mesh' : failure === 'unavailable' ? emptyMessage ?? 'Bed mesh unavailable' : emptyMessage ?? null);

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

<StateSurface phase={surfacePhase}>
<StateAnnouncement text={notice || (loading ? 'Loading Bed Mesh' : refreshing ? 'Refreshing Bed Mesh' : 'Bed Mesh loaded')} />
<Shell label="Bed Mesh" busy={loading || refreshing}>
  {#snippet children()}
    <Header title="Bed Mesh">
      {#snippet icon()}<Grid3X3 size={22} strokeWidth={1.8} />{/snippet}
      {#snippet meta()}{#if receiptMeta}{@render receiptMeta()}{:else}<ObservedMeta observedAt={mesh?.sourceObservedAt ?? null} freshness={mesh?.freshness ?? 'unknown'} loading={placeholder} />{/if}{/snippet}
    </Header>
    <Body>
      {#snippet children()}
        <div class="mesh-kicker" data-record>Reported probe grid · <LoadingValue loading={placeholder} text={!placeholder && mesh ? `${mesh.summary.columns} × ${mesh.summary.rows}` : undefined} />{@render attribution?.()}</div>
        <TextViewport label="Bed mesh profile" loading={loading || !!failure || retrying} text={placeholder || !mesh?.profile ? undefined : `Profile: ${mesh.profile}`} />
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
    </Body>
    <Footer message={notice ?? ''} visibleMessage={failure === 'error' || retrying ? 'Could not load' : emptyLabel ?? emptyMessage ?? 'Could not load'}>
      {#snippet actions()}
        {#if placeholder}<Switch label="Bed mesh view" options={modeOptions} loading />{:else}
          <Switch bind:this={modeControl} label="Bed mesh view" options={modeOptions} value={mode} onchange={selectMode} />
        {/if}
        <span class="action-separator" aria-hidden="true"></span>
        {#if showAction}<Button bind:this={action} label={retryAction ? 'Retry bed mesh' : 'Reset bed mesh view'} icon={retryAction ? RefreshCw : RotateCcw} onclick={retryAction ? onretry : reset} busy={retrying} disabled={!retryAction && mode === '2d'} />{:else}<Skeleton shape="action" />{/if}
        {@render refreshAction?.()}
      {/snippet}
    </Footer>
  {/snippet}
</Shell>
</StateSurface>

<style>
  .mesh-kicker { margin: 0 0 12px; color: var(--u1-muted); font-size: 13px; line-height: 1.4; overflow-wrap: anywhere; }
  .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 9ch), 1fr)); gap: 12px; margin: 18px 0 0; padding: 0; }
  .summary div { min-width: 0; }
  dt { color: var(--u1-muted); font-size: 11px; line-height: 1.3; text-transform: uppercase; letter-spacing: 0.08em; }
  dd { margin: 5px 0 0; font-size: 16px; line-height: 1.35; font-variant-numeric: tabular-nums; }
  .action-separator { width: 1px; height: 28px; margin: 0 2px; background: var(--u1-line); }
  @media (max-width: 360px) {
    .summary { gap: 8px; }
    dd { font-size: 14px; }
  }
</style>
