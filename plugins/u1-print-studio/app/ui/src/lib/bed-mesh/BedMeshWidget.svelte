<script lang="ts">
  import { Box, Grid2X2, Grid3X3, RotateCcw } from 'lucide-svelte';
  import BedMesh2D from './BedMesh2D.svelte';
  import BedMesh3D from './BedMesh3D.svelte';
  import { meshPalette } from './palette';
  import { validateBedMeshObservation, type BedMeshObservation } from './types';
  import ChartFrame from '../ui/ChartFrame.svelte';
  import IconButton from '../ui/IconButton.svelte';
  import ObservedMeta from '../ui/ObservedMeta.svelte';
  import WidgetBody from '../ui/WidgetBody.svelte';
  import WidgetFooter from '../ui/WidgetFooter.svelte';
  import WidgetHeader from '../ui/WidgetHeader.svelte';
  import WidgetShell from '../ui/WidgetShell.svelte';

  let { observation }: { observation: BedMeshObservation } = $props();
  const mesh = $derived(validateBedMeshObservation(observation));
  let mode = $state<'3d' | '2d'>('3d');
  let resetKey = $state(0);
  let feedback = $state<string | null>(null);
  let feedbackTimer: ReturnType<typeof setTimeout> | undefined;

  function flash(message: string) {
    feedback = message;
    clearTimeout(feedbackTimer);
    feedbackTimer = setTimeout(() => { feedback = null; }, 1200);
  }
  function selectMode(next: '3d' | '2d') {
    mode = next;
    flash(next === '3d' ? '3D view' : '2D view');
  }
  function reset() {
    resetKey += 1;
    flash('View reset');
  }
</script>

{#snippet feedbackOverlay()}{feedback}{/snippet}

<WidgetShell label="Bed Mesh">
  {#snippet children()}
    <WidgetHeader title="Bed Mesh">
      {#snippet icon()}<Grid3X3 size={22} strokeWidth={1.8} />{/snippet}
      {#snippet meta()}<ObservedMeta observedAt={mesh.sourceObservedAt} freshness={mesh.freshness} />{/snippet}
    </WidgetHeader>
    <WidgetBody>
      {#snippet children()}
        <div class="mesh-kicker">Reported probe grid · {mesh.summary.columns} × {mesh.summary.rows}{mesh.fixture ? ' · Lab fixture' : ''}</div>
        <ChartFrame label={`Bed mesh ${mode === '3d' ? '3D surface' : '2D grid'}, ${mesh.summary.minimum.toFixed(3)} to ${mesh.summary.maximum.toFixed(3)} millimetres`} overlay={feedback ? feedbackOverlay : undefined}>
          {#if mode === '3d'}
            <BedMesh3D observation={mesh} {resetKey} />
          {:else}
            <BedMesh2D observation={mesh} />
          {/if}
        </ChartFrame>
        <div class="legend" aria-label={`Z height from ${mesh.summary.minimum.toFixed(3)} to ${mesh.summary.maximum.toFixed(3)} millimetres`}>
          <span>Z (mm)</span>
          <div class="legend-bar" style={`--mesh-palette:${meshPalette.join(',')}`}></div>
          <div class="legend-values"><span>{mesh.summary.minimum.toFixed(3)}</span><span>{mesh.summary.maximum.toFixed(3)}</span></div>
        </div>
        <dl class="summary">
          <div><dt>Minimum</dt><dd>{mesh.summary.minimum.toFixed(3)} mm</dd></div>
          <div><dt>Maximum</dt><dd>{mesh.summary.maximum.toFixed(3)} mm</dd></div>
          <div><dt>Range</dt><dd>{mesh.summary.range.toFixed(3)} mm</dd></div>
        </dl>
      {/snippet}
    </WidgetBody>
    <WidgetFooter>
      {#snippet actions()}
        <IconButton label="Show 3D bed mesh" icon={Box} pressed={mode === '3d'} onclick={() => selectMode('3d')} />
        <IconButton label="Show 2D bed mesh" icon={Grid2X2} pressed={mode === '2d'} onclick={() => selectMode('2d')} />
        <span class="action-separator" aria-hidden="true"></span>
        <IconButton label="Reset bed mesh view" icon={RotateCcw} onclick={reset} disabled={mode === '2d'} />
      {/snippet}
    </WidgetFooter>
  {/snippet}
</WidgetShell>

<style>
  .mesh-kicker { margin: 0 0 12px; color: var(--u1-muted); font-size: 13px; line-height: 1.4; }
  .legend { margin-top: 14px; color: var(--u1-muted); font-size: 12px; font-variant-numeric: tabular-nums; }
  .legend-bar { height: 8px; margin-top: 7px; border-radius: 999px; background: linear-gradient(90deg, var(--mesh-palette)); }
  .legend-values { display: flex; justify-content: space-between; margin-top: 5px; }
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
