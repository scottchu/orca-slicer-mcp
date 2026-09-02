<script lang="ts">
  import { Box, Grid2X2, Grid3X3, RotateCcw } from 'lucide-svelte';
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
  import LoadingValue from '../ui/LoadingValue.svelte';
  import Skeleton from '../ui/Skeleton.svelte';
  import StateAnnouncement from '../ui/StateAnnouncement.svelte';
  import { loadingObservation } from '../observation/loading';
  import { onDestroy } from 'svelte';

  type Props = { observation: BedMeshObservation; loading?: false; refreshing?: boolean } | { loading: true; observation?: never; refreshing?: never };
  let { observation, loading = false, refreshing = false, selectedMode, onmode }: Props & { selectedMode?: '3d' | '2d'; onmode?: (mode: '3d' | '2d') => void } = $props();
  const mesh = $derived(loadingObservation(loading, observation, validateBedMeshObservation));
  let localMode = $state<'3d' | '2d'>('3d');
  const modeOptions = [{ value: '3d', label: '3D surface', icon: Box }, { value: '2d', label: '2D grid', icon: Grid2X2 }] as const;
  const mode = $derived(selectedMode ?? localMode);
  let resetKey = $state(0);
  let feedback = $state<string | null>(null);
  let feedbackTimer: ReturnType<typeof setTimeout> | undefined;

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
  onDestroy(() => clearTimeout(feedbackTimer));
</script>

{#snippet feedbackOverlay()}{feedback}{/snippet}

{#if loading || refreshing}<StateAnnouncement text={loading ? 'Loading Bed Mesh' : 'Refreshing Bed Mesh'} />{/if}
<WidgetShell label="Bed Mesh" busy={loading || refreshing}>
  {#snippet children()}
    <WidgetHeader title="Bed Mesh">
      {#snippet icon()}<Grid3X3 size={22} strokeWidth={1.8} />{/snippet}
      {#snippet meta()}<ObservedMeta observedAt={mesh?.sourceObservedAt ?? null} freshness={mesh?.freshness ?? 'unknown'} {loading} />{/snippet}
    </WidgetHeader>
    <WidgetBody>
      {#snippet children()}
        <div class="mesh-kicker">Reported probe grid · <LoadingValue {loading} text={mesh ? `${mesh.summary.columns} × ${mesh.summary.rows}` : undefined} />{loading || mesh?.fixture ? ' · Lab fixture' : ''}</div>
        <ChartFrame label={mesh ? `Bed mesh ${mode === '3d' ? '3D surface' : '2D grid'}, ${mesh.summary.minimum.toFixed(3)} to ${mesh.summary.maximum.toFixed(3)} millimetres` : 'Loading bed mesh'} description={mesh ? `Z height in millimetres; top ${mesh.summary.maximum}, bottom ${mesh.summary.minimum}` : 'Z height in millimetres; range unavailable'} overlay={feedback ? feedbackOverlay : undefined}>
          {#snippet leading()}<HeightLegend minimum={mesh?.summary.minimum ?? null} maximum={mesh?.summary.maximum ?? null} palette={meshPalette} orientation="vertical" placement="start" showEndpoints={false} />{/snippet}
          {#if !mesh}<Skeleton shape="chart" />
          {:else if mode === '3d'}
            <BedMesh3D observation={mesh} {resetKey} />
          {:else}
            <BedMesh2D observation={mesh} />
          {/if}
        </ChartFrame>
        <dl class="summary">
          <div><dt>Minimum</dt><dd><LoadingValue {loading} text={mesh?.summary.minimum.toFixed(3)} /> mm</dd></div>
          <div><dt>Maximum</dt><dd><LoadingValue {loading} text={mesh?.summary.maximum.toFixed(3)} /> mm</dd></div>
          <div><dt>Range</dt><dd><LoadingValue {loading} text={mesh?.summary.range.toFixed(3)} /> mm</dd></div>
        </dl>
      {/snippet}
    </WidgetBody>
    <WidgetFooter>
      {#snippet actions()}
        {#if loading}<IconSegmentedControl label="Bed mesh view" options={modeOptions} loading />{:else}
          <IconSegmentedControl label="Bed mesh view" options={modeOptions} value={mode} onchange={selectMode} />
        {/if}
        <span class="action-separator" aria-hidden="true"></span>
        {#if loading}<Skeleton shape="action" />{:else}<IconButton label="Reset bed mesh view" icon={RotateCcw} onclick={reset} disabled={mode === '2d'} />{/if}
      {/snippet}
    </WidgetFooter>
  {/snippet}
</WidgetShell>

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
