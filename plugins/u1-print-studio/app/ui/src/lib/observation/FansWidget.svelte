<script lang="ts">
  import { Fan } from 'lucide-svelte';
  import ObservationFrame from './ObservationFrame.svelte';
  import { titleCase } from './format';
  import { validateFans, type FansObservation } from './types';
  let { observation }: { observation: FansObservation } = $props();
  const fans = $derived(validateFans(observation));
  const labels = ['Tool 1', 'Tool 2', 'Tool 3', 'Tool 4', 'Cavity', 'Purifier exhaust', 'Purifier inner'];
</script>

<ObservationFrame title="Fans & Air" icon={Fan} observedAt={fans.sourceObservedAt} freshness={fans.freshness}>
  <div class="fan-mode"><span class="observation-label">Purifier</span><strong>{fans.purifierMode === null ? 'N/A' : titleCase(fans.purifierMode)}</strong></div>
  <div class="observation-list fan-list">
    {#each fans.items as fan, index}
      <div class="observation-row fan-row" style={`--fan-fill:${fan.percent ?? 0}%`} data-fan-fill={fan.percent ?? 'na'}>
        <span class="fill" aria-hidden="true"></span>
        <Fan class={(fan.rpm ?? 0) > 0 ? 'fan-icon spinning' : 'fan-icon'} aria-hidden="true" />
        <strong data-required-text>{labels[index]}</strong>
        <span class="percent">{fan.percent === null ? 'N/A' : `${Math.round(fan.percent)}%`}</span>
        <span class="rpm">{fan.rpm === null ? 'N/A' : `${fan.rpm.toLocaleString('en-US')} RPM`}</span>
      </div>
    {/each}
  </div>
</ObservationFrame>

<style>
  .fan-mode { display: flex; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
  .fan-mode strong { font-size: 13px; font-weight: 570; }
  .fan-row { position: relative; display: grid; grid-template-columns: 22px minmax(0, 1fr) 42px 82px; align-items: center; gap: 9px; isolation: isolate; }
  .fill { position: absolute; inset: 0 auto 0 0; z-index: -1; width: var(--fan-fill); background: rgb(244 185 39 / 10%); }
  :global(.fan-icon) { width: 20px; height: 20px; color: #69717a; }
  .fan-row > strong { min-width: 0; font-size: 13px; font-weight: 580; line-height: 1.2; overflow-wrap: anywhere; }
  .percent { color: #9a7100; font-size: 13px; font-weight: 650; text-align: right; font-variant-numeric: tabular-nums; }
  .rpm { color: var(--u1-muted); font-size: 11px; text-align: right; white-space: nowrap; font-variant-numeric: tabular-nums; }
  @media (max-width: 350px) { .fan-row { grid-template-columns: 19px minmax(0, 1fr) 38px 70px; gap: 6px; padding-inline: 10px; } .rpm { font-size: 10px; } }
</style>
