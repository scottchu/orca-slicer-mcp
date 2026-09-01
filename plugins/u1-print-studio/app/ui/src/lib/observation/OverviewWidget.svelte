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
    <div class="overview-item"><Printer aria-hidden="true" /><span>Progress</span><strong>{Math.round(overview.progress.percent)}%</strong><small>{titleCase(overview.progress.state)}</small></div>
    <div class="overview-item"><Thermometer aria-hidden="true" /><span>Thermals</span><strong>{Math.round(overview.thermals.nozzleC)}°</strong><small>{Math.round(overview.thermals.bedC)}° bed · {Math.round(overview.thermals.cavityC)}° cavity</small></div>
    <div class="overview-item"><Layers3 aria-hidden="true" /><span>Heads</span><strong>{overview.heads.loaded} loaded</strong><small>{overview.heads.activeTool === null ? 'None active' : `T${overview.heads.activeTool} active`}</small></div>
    <div class="overview-item"><FileClock aria-hidden="true" /><span>Current Job</span><strong>{titleCase(overview.jobs.state)}</strong><small>Observation</small></div>
    <div class="overview-item"><History aria-hidden="true" /><span>History</span><strong>{overview.jobHistory.returned}</strong><small>Recent records</small></div>
    <div class="overview-item"><ListOrdered aria-hidden="true" /><span>Print Queue</span><strong>{overview.queue.count}</strong><small>{titleCase(overview.queue.state)}</small></div>
    <div class="overview-item"><Fan aria-hidden="true" /><span>Fans</span><strong>{overview.fans.active}</strong><small>Active channels</small></div>
    <div class="overview-item"><Grid3X3 aria-hidden="true" /><span>Bed Mesh</span><strong>{overview.bedMesh.rangeMm.toFixed(3)}</strong><small>mm range</small></div>
  </div>
</ObservationFrame>

<style>
  .overview-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); overflow: hidden; border: 1px solid var(--u1-line); border-radius: var(--u1-radius-inner); }
  .overview-item { display: grid; grid-template-columns: 20px minmax(0, 1fr); gap: 3px 8px; min-width: 0; padding: 13px; border-right: 1px solid var(--u1-line); border-bottom: 1px solid var(--u1-line); }
  .overview-item:nth-child(even) { border-right: 0; }
  .overview-item:nth-last-child(-n + 2) { border-bottom: 0; }
  .overview-item :global(svg) { grid-row: span 2; width: 19px; height: 19px; color: #69717a; }
  .overview-item span { overflow: hidden; color: var(--u1-muted); font-size: 11px; font-weight: 650; letter-spacing: .04em; text-overflow: ellipsis; text-transform: uppercase; white-space: nowrap; }
  .overview-item strong { grid-column: 2; margin-top: 4px; overflow: hidden; font-size: 17px; font-weight: 590; text-overflow: ellipsis; white-space: nowrap; }
  .overview-item small { grid-column: 2; overflow: hidden; color: var(--u1-muted); font-size: 11px; line-height: 1.3; text-overflow: ellipsis; white-space: nowrap; }
  @media (min-width: 590px) {
    .overview-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    .overview-item:nth-child(even) { border-right: 1px solid var(--u1-line); }
    .overview-item:nth-child(4n) { border-right: 0; }
    .overview-item:nth-last-child(-n + 4) { border-bottom: 0; }
  }
</style>
