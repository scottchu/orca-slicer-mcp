<script lang="ts">
  import { Fan, FileClock, Grid3X3, History, Layers3, LayoutDashboard, ListOrdered, Printer, Thermometer } from 'lucide-svelte';
  import ObservationFrame from './ObservationFrame.svelte';
  import { titleCase } from './format';
  import { validateOverview, type OverviewObservation } from './types';
  let { observation }: { observation: OverviewObservation } = $props();
  const overview = $derived(validateOverview(observation));
</script>

<ObservationFrame title="Overview" icon={LayoutDashboard} observedAt={overview.sourceObservedAt} freshness={overview.freshness}>
  <div class="overview-grid">
    <div class="overview-item"><Printer aria-hidden="true" /><span data-required-text>Progress</span><strong data-required-text>{Math.round(overview.progress.percent)}%</strong><small data-required-text>{titleCase(overview.progress.state)}</small></div>
    <div class="overview-item"><Thermometer aria-hidden="true" /><span data-required-text>Thermals</span><strong data-required-text>{Math.round(overview.thermals.nozzleC)}°</strong><small data-required-text>{Math.round(overview.thermals.bedC)}° bed · {Math.round(overview.thermals.cavityC)}° cavity</small></div>
    <div class="overview-item"><Layers3 aria-hidden="true" /><span data-required-text>Heads</span><strong data-required-text>{overview.heads.loaded} loaded</strong><small data-required-text>{overview.heads.activeTool === null ? 'None active' : `T${overview.heads.activeTool} active`}</small></div>
    <div class="overview-item"><FileClock aria-hidden="true" /><span data-required-text>Current Job</span><strong data-required-text>{titleCase(overview.jobs.state)}</strong><small data-required-text>Observation</small></div>
    <div class="overview-item"><History aria-hidden="true" /><span data-required-text>History</span><strong data-required-text>{overview.jobHistory.returned}</strong><small data-required-text>Recent records</small></div>
    <div class="overview-item"><ListOrdered aria-hidden="true" /><span data-required-text>Print Queue</span><strong data-required-text>{overview.queue.count}</strong><small data-required-text>{titleCase(overview.queue.state)}</small></div>
    <div class="overview-item"><Fan aria-hidden="true" /><span data-required-text>Fans</span><strong data-required-text>{overview.fans.active}</strong><small data-required-text>Active channels</small></div>
    <div class="overview-item"><Grid3X3 aria-hidden="true" /><span data-required-text>Bed Mesh</span><strong data-required-text>{overview.bedMesh.rangeMm.toFixed(3)}</strong><small data-required-text>mm range</small></div>
  </div>
</ObservationFrame>

<style>
  .overview-grid { display: grid; grid-template-columns: 1fr; overflow: hidden; border: 1px solid var(--u1-line); border-radius: var(--u1-radius-inner); }
  .overview-item { display: grid; grid-template-columns: 20px minmax(0, 1fr) auto; grid-template-rows: auto auto; align-items: center; gap: 2px 8px; min-width: 0; padding: 10px 11px; border-right: 1px solid var(--u1-line); border-bottom: 1px solid var(--u1-line); }
  .overview-item { border-right: 0; }
  .overview-item:last-child { border-bottom: 0; }
  .overview-item :global(svg) { grid-row: 1 / span 2; width: 19px; height: 19px; color: #69717a; }
  .overview-item span { color: var(--u1-muted); font-size: 11px; font-weight: 650; letter-spacing: .04em; text-transform: uppercase; }
  .overview-item strong { grid-column: 3; grid-row: 1 / span 2; font-size: 17px; font-weight: 590; text-align: right; }
  .overview-item small { grid-column: 2; color: var(--u1-muted); font-size: 11px; line-height: 1.3; }
  @media (min-width: 390px) {
    .overview-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .overview-item { grid-template-columns: 20px minmax(0, 1fr); grid-template-rows: auto auto auto; border-right: 1px solid var(--u1-line); }
    .overview-item:nth-child(even) { border-right: 0; }
    .overview-item:nth-last-child(-n + 2) { border-bottom: 0; }
    .overview-item :global(svg) { grid-row: 1 / span 3; }
    .overview-item strong { grid-column: 2; grid-row: 2; text-align: left; }
    .overview-item small { grid-row: 3; }
  }
</style>
