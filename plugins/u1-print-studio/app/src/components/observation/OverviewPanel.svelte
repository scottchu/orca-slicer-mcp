<script lang="ts">
  import type { Snippet } from 'svelte';
  import { Fan, FileClock, Grid3X3, History, Layers3, LayoutDashboard, ListOrdered, Printer, Thermometer } from 'lucide-svelte';
  import ObservationFrame from '../common/Frame.svelte';
  import { formatClock, titleCase } from '../../lib/client/observation/format';
  import type { OverviewObservation } from '../../lib/client/observation/types';
  import LoadingValue from '../common/LoadingValue.svelte';
  import { type FailureProps } from '../../lib/client/observation/loading';
  import type { OverviewPresentation } from '../../lib/client/live/focused-presentation';
  import Caption from '../common/Caption.svelte';
  type Props = FailureProps & { lab?: boolean; meta?: Snippet; actionLabel?: string; feedback?: string; failureMessage?: string } & ({ observation: OverviewObservation; live?: never; loading?: false; refreshing?: boolean } | { live: OverviewPresentation; observation?: never; loading?: false; refreshing?: boolean } | { loading: true; live?: never; observation?: never; refreshing?: never });
  let { observation, live, loading: pending = false, refreshing = false, failure, onretry, lab = true, meta, actionLabel, feedback, failureMessage }: Props = $props();
  const loading = $derived(pending || !!failure);
  const accepted = $derived(live ? null : (pending ? null : observation ?? null));
  const overview = $derived(failure ? null : accepted);
  const current = $derived(failure ? null : live);
  const primary = (index: number, fallback: string | number | undefined) => lab ? fallback : current?.tiles[index].primary;
  const secondary = (index: number, fallback: string | undefined) => lab ? fallback : current?.tiles[index].secondary;
</script>

{#snippet receipts(index: number)}
  {#if !lab && !loading && current}
    {#each current.tiles[index].receipts as receipt}
      <Caption>{receipt.label} · {titleCase(receipt.value.state)} · {receipt.value.sourceObservedAt === null ? 'Observation time unavailable' : `Observed ${formatClock(receipt.value.sourceObservedAt)}`} · {titleCase(receipt.value.freshness)}{receipt.value.reason ? ` · ${titleCase(receipt.value.reason)}` : ''}</Caption>
    {/each}
  {/if}
{/snippet}

<ObservationFrame title="Overview" icon={LayoutDashboard} observedAt={current?.sourceObservedAt ?? overview?.sourceObservedAt ?? null} freshness={current?.freshness ?? overview?.freshness ?? 'unknown'} stateKind={failure ?? (pending ? 'loading' : 'ready')} placeholder={loading} {onretry} {refreshing} {lab} {meta} {actionLabel} {feedback} {failureMessage}>
  {#if !lab && !loading && current}<Caption>Coverage {current.coverage}</Caption>{/if}
  <div class="overview-grid">
    <div class="overview-item" data-overview-tile="progress" data-overview-state={loading ? 'loading' : current?.tiles[0].state}><Printer aria-hidden="true" /><span data-required-text>Progress</span><strong data-required-text><LoadingValue {loading} text={loading ? undefined : (primary(0, overview ? `${Math.round(overview.progress.percent)}%` : undefined))} size="short" /></strong><small data-required-text><LoadingValue {loading} text={loading ? undefined : (secondary(0, overview ? titleCase(overview.progress.state) : undefined))} />{@render receipts(0)}</small></div>
    <div class="overview-item" data-overview-tile="thermals" data-overview-state={loading ? 'loading' : current?.tiles[1].state}><Thermometer aria-hidden="true" /><span data-required-text>Thermals</span><strong data-required-text><LoadingValue {loading} text={loading ? undefined : (primary(1, overview ? `${Math.round(overview.thermals.nozzleC)}°` : undefined))} size="short" /></strong><small data-required-text><LoadingValue {loading} text={loading ? undefined : (secondary(1, overview ? `${Math.round(overview.thermals.bedC)}° bed · ${Math.round(overview.thermals.cavityC)}° cavity` : undefined))} words={lab ? [3, 3, 1, 3, 6] : undefined} size="long" />{@render receipts(1)}</small></div>
    <div class="overview-item" data-overview-tile="heads" data-overview-state={loading ? 'loading' : current?.tiles[2].state}><Layers3 aria-hidden="true" /><span data-required-text>Heads</span><strong data-required-text><LoadingValue {loading} text={loading ? undefined : (primary(2, overview ? `${overview.heads.loaded} loaded` : undefined))} words={lab ? [1, 6] : undefined} /></strong><small data-required-text><LoadingValue {loading} text={loading ? undefined : (secondary(2, overview ? overview.heads.activeTool === null ? 'None active' : `T${overview.heads.activeTool} active` : undefined))} words={lab ? [4, 6] : undefined} />{@render receipts(2)}</small></div>
    <div class="overview-item" data-overview-tile="jobs" data-overview-state={loading ? 'loading' : current?.tiles[3].state}><FileClock aria-hidden="true" /><span data-required-text>Current Job</span><strong data-required-text><LoadingValue {loading} text={loading ? undefined : (primary(3, overview ? titleCase(overview.jobs.state) : undefined))} /></strong><small data-required-text><LoadingValue {loading} text={loading ? undefined : (secondary(3, 'Observation'))} />{@render receipts(3)}</small></div>
    <div class="overview-item" data-overview-tile="job_history" data-overview-state={loading ? 'loading' : current?.tiles[4].state}><History aria-hidden="true" /><span data-required-text>History</span><strong data-required-text><LoadingValue {loading} text={loading ? undefined : (primary(4, overview?.jobHistory.returned))} size="short" /></strong><small data-required-text><LoadingValue {loading} text={loading ? undefined : (secondary(4, 'Recent records'))} />{@render receipts(4)}</small></div>
    <div class="overview-item" data-overview-tile="queue" data-overview-state={loading ? 'loading' : current?.tiles[5].state}><ListOrdered aria-hidden="true" /><span data-required-text>Print Queue</span><strong data-required-text><LoadingValue {loading} text={loading ? undefined : (primary(5, overview?.queue.count))} size="short" /></strong><small data-required-text><LoadingValue {loading} text={loading ? undefined : (secondary(5, overview ? titleCase(overview.queue.state) : undefined))} />{@render receipts(5)}</small></div>
    <div class="overview-item" data-overview-tile="fans" data-overview-state={loading ? 'loading' : current?.tiles[6].state}><Fan aria-hidden="true" /><span data-required-text>Fans</span><strong data-required-text><LoadingValue {loading} text={loading ? undefined : (primary(6, overview?.fans.active))} size="short" /></strong><small data-required-text><LoadingValue {loading} text={loading ? undefined : (secondary(6, 'Active channels'))} />{@render receipts(6)}</small></div>
    <div class="overview-item" data-overview-tile="bed_mesh" data-overview-state={loading ? 'loading' : current?.tiles[7].state}><Grid3X3 aria-hidden="true" /><span data-required-text>Bed Mesh</span><strong data-required-text><LoadingValue {loading} text={loading ? undefined : (primary(7, overview?.bedMesh.rangeMm.toFixed(3)))} size="short" /></strong><small data-required-text><LoadingValue {loading} text={loading ? undefined : (secondary(7, 'mm range'))} />{@render receipts(7)}</small></div>
  </div>
</ObservationFrame>

<style>
  .overview-grid { display: grid; grid-template-columns: 1fr; gap: 1px; font-size: var(--u1-type-name); overflow: hidden; border: 1px solid var(--u1-line); border-radius: var(--u1-radius-inner); background: var(--u1-line); }
  .overview-item { display: grid; grid-template-columns: 20px minmax(0, 1fr); grid-template-rows: auto auto auto; align-items: center; gap: 2px 8px; min-width: 0; padding: 10px 11px; background: var(--u1-surface); }
  .overview-item :global(svg) { grid-row: 1 / span 3; width: 19px; height: 19px; color: #69717a; }
  .overview-item span { color: var(--u1-muted); font-size: 11px; font-weight: 650; letter-spacing: .04em; text-transform: uppercase; }
  .overview-item strong { grid-column: 2; grid-row: 2; font-size: 17px; font-weight: 590; text-align: left; overflow-wrap: anywhere; }
  .overview-item small { grid-column: 2; grid-row: 3; color: var(--u1-muted); font-size: 11px; line-height: 1.3; overflow-wrap: anywhere; }
  .overview-item small :global(.caption) { display: block; font-size: inherit; }
  @media (min-width: 390px) {
    .overview-grid { grid-template-columns: repeat(auto-fit, minmax(min(100%, max(8em, calc(50% - .5px))), 1fr)); }
  }
</style>
