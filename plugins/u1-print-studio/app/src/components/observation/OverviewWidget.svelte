<script lang="ts">
  import { Fan, FileClock, Grid3X3, History, Layers3, LayoutDashboard, ListOrdered, Printer, Thermometer } from 'lucide-svelte';
  import ObservationFrame from './ObservationFrame.svelte';
  import { titleCase } from '../../lib/client/observation/format';
  import { validateOverview, type OverviewObservation } from '../../lib/client/observation/types';
  import LoadingValue from '../common/LoadingValue.svelte';
  import { loadingObservation, type FailureProps } from '../../lib/client/observation/loading';
  type Props = FailureProps & ({ observation: OverviewObservation; loading?: false; refreshing?: boolean } | { loading: true; observation?: never; refreshing?: never });
  let { observation, loading: pending = false, refreshing = false, failure, onretry }: Props = $props();
  const loading = $derived(pending || !!failure);
  const accepted = $derived(loadingObservation(pending, observation, validateOverview));
  const overview = $derived(failure ? null : accepted);
</script>

<ObservationFrame title="Overview" icon={LayoutDashboard} observedAt={overview?.sourceObservedAt ?? null} freshness={overview?.freshness ?? 'unknown'} stateKind={failure ?? (pending ? 'loading' : 'ready')} placeholder={loading} {onretry} {refreshing}>
  <div class="overview-grid">
    <div class="overview-item"><Printer aria-hidden="true" /><span data-required-text>Progress</span><strong data-required-text><LoadingValue {loading} text={overview ? `${Math.round(overview.progress.percent)}%` : undefined} size="short" /></strong><small data-required-text><LoadingValue {loading} text={overview ? titleCase(overview.progress.state) : undefined} /></small></div>
    <div class="overview-item"><Thermometer aria-hidden="true" /><span data-required-text>Thermals</span><strong data-required-text><LoadingValue {loading} text={overview ? `${Math.round(overview.thermals.nozzleC)}°` : undefined} size="short" /></strong><small data-required-text><LoadingValue {loading} text={overview ? `${Math.round(overview.thermals.bedC)}° bed · ${Math.round(overview.thermals.cavityC)}° cavity` : undefined} words={[3, 3, 1, 3, 6]} size="long" /></small></div>
    <div class="overview-item"><Layers3 aria-hidden="true" /><span data-required-text>Heads</span><strong data-required-text><LoadingValue {loading} text={overview ? `${overview.heads.loaded} loaded` : undefined} words={[1, 6]} /></strong><small data-required-text><LoadingValue {loading} text={overview ? overview.heads.activeTool === null ? 'None active' : `T${overview.heads.activeTool} active` : undefined} words={[4, 6]} /></small></div>
    <div class="overview-item"><FileClock aria-hidden="true" /><span data-required-text>Current Job</span><strong data-required-text><LoadingValue {loading} text={overview ? titleCase(overview.jobs.state) : undefined} /></strong><small data-required-text>Observation</small></div>
    <div class="overview-item"><History aria-hidden="true" /><span data-required-text>History</span><strong data-required-text><LoadingValue {loading} text={overview?.jobHistory.returned} size="short" /></strong><small data-required-text>Recent records</small></div>
    <div class="overview-item"><ListOrdered aria-hidden="true" /><span data-required-text>Print Queue</span><strong data-required-text><LoadingValue {loading} text={overview?.queue.count} size="short" /></strong><small data-required-text><LoadingValue {loading} text={overview ? titleCase(overview.queue.state) : undefined} /></small></div>
    <div class="overview-item"><Fan aria-hidden="true" /><span data-required-text>Fans</span><strong data-required-text><LoadingValue {loading} text={overview?.fans.active} size="short" /></strong><small data-required-text>Active channels</small></div>
    <div class="overview-item"><Grid3X3 aria-hidden="true" /><span data-required-text>Bed Mesh</span><strong data-required-text><LoadingValue {loading} text={overview?.bedMesh.rangeMm.toFixed(3)} size="short" /></strong><small data-required-text>mm range</small></div>
  </div>
</ObservationFrame>

<style>
  .overview-grid { display: grid; grid-template-columns: 1fr; gap: 1px; font-size: var(--u1-type-name); overflow: hidden; border: 1px solid var(--u1-line); border-radius: var(--u1-radius-inner); background: var(--u1-line); }
  .overview-item { display: grid; grid-template-columns: 20px minmax(0, 1fr); grid-template-rows: auto auto auto; align-items: center; gap: 2px 8px; min-width: 0; padding: 10px 11px; background: var(--u1-surface); }
  .overview-item :global(svg) { grid-row: 1 / span 3; width: 19px; height: 19px; color: #69717a; }
  .overview-item span { color: var(--u1-muted); font-size: 11px; font-weight: 650; letter-spacing: .04em; text-transform: uppercase; }
  .overview-item strong { grid-column: 2; grid-row: 2; font-size: 17px; font-weight: 590; text-align: left; }
  .overview-item small { grid-column: 2; grid-row: 3; color: var(--u1-muted); font-size: 11px; line-height: 1.3; }
  @media (min-width: 390px) {
    .overview-grid { grid-template-columns: repeat(auto-fit, minmax(min(100%, max(8em, calc(50% - .5px))), 1fr)); }
  }
</style>
