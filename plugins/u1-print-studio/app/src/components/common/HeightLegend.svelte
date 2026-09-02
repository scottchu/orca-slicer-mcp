<script lang="ts">
  import Skeleton from './Skeleton.svelte';
  let { minimum, maximum, label = 'Z', unit = 'mm', palette, orientation = 'vertical', placement = 'start', showEndpoints = true }: { minimum: number | null; maximum: number | null; label?: string; unit?: string; palette: string[]; orientation?: 'vertical' | 'horizontal'; placement?: 'start' | 'end'; showEndpoints?: boolean } = $props();
  const known = $derived(minimum !== null && maximum !== null && Number.isFinite(minimum) && Number.isFinite(maximum) && minimum <= maximum);
  const midpoint = $derived(palette.length % 2 ? palette[Math.floor(palette.length / 2)] : `color-mix(in srgb,${palette[palette.length / 2 - 1]},${palette[palette.length / 2]} 50%)`);
  const colors = $derived(!known ? ['#e7e9ec', '#e7e9ec'] : minimum === maximum ? [midpoint, midpoint] : palette);
  const format = (value: number) => Math.abs(value) >= 10_000 || (Math.abs(value) > 0 && Math.abs(value) < 0.001) ? Number(value.toPrecision(3)).toExponential().replace('e+', 'e') : Number(value.toFixed(3)).toString();
</script>

<div class="height-legend" class:horizontal={orientation === 'horizontal'} class:end={placement === 'end'} class:rail-only={!showEndpoints} data-height-legend data-orientation={orientation} aria-label={known ? `${label} height, minimum ${minimum} ${unit}, maximum ${maximum} ${unit}` : `Loading ${label} height legend`}>
  <span class="legend-title" data-chart-obstacle>{label} ({unit})</span>
  {#if showEndpoints}<span class="endpoint high" data-chart-obstacle title={known ? `${maximum} ${unit}` : undefined}>{#if known}{format(maximum!)}{:else}<Skeleton shape="fill" />{/if}</span>{/if}
  <span class="gradient" style={`--height-palette:${colors.join(',')}`} aria-hidden="true"></span>
  {#if showEndpoints}<span class="endpoint low" data-chart-obstacle title={known ? `${minimum} ${unit}` : undefined}>{#if known}{format(minimum!)}{:else}<Skeleton shape="fill" />{/if}</span>{/if}
</div>

<style>
  .height-legend { display: grid; grid-template-rows: auto auto minmax(16px, 1fr) auto; justify-items: start; gap: 4px; width: 6ch; height: 100%; padding: 8px 0; color: var(--u1-muted); font: 600 0.75rem/1.2 var(--u1-font); font-variant-numeric: tabular-nums; }
  .legend-title,.endpoint { display: block; width: 100%; text-align: left; white-space: nowrap; }
  .endpoint { min-height: 1.2em; }
  .gradient { width: 6px; height: 100%; min-height: 16px; border-radius: 999px; background: linear-gradient(to top,var(--height-palette)); }
  .end { justify-self: end; }
  .rail-only { width: max-content; grid-template-rows: auto minmax(16px, 1fr); }
  .rail-only .legend-title { width: max-content; }
  .horizontal { width: 100%; height: auto; grid-template-columns: auto minmax(16px,1fr) auto; grid-template-rows: auto auto; align-items: center; }
  .horizontal .legend-title { grid-column: 1 / -1; }
  .horizontal .low { grid-column: 1; grid-row: 2; }
  .horizontal .gradient { grid-column: 2; grid-row: 2; width: 100%; height: 6px; min-height: 0; background: linear-gradient(to right,var(--height-palette)); }
  .horizontal .high { grid-column: 3; grid-row: 2; }
  .horizontal.rail-only { width: 100%; grid-template-columns: minmax(16px,1fr); }
  .horizontal.rail-only .gradient { grid-column: 1; }
</style>
