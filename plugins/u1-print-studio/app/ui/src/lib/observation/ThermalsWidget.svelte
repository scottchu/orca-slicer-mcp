<script lang="ts">
  import { Bed, Box, Thermometer, ThermometerSun } from 'lucide-svelte';
  import ObservationFrame from './ObservationFrame.svelte';
  import { validateThermals, type ThermalsObservation } from './types';
  let { observation }: { observation: ThermalsObservation } = $props();
  const thermals = $derived(validateThermals(observation));
  const labels = ['Tool 1', 'Tool 2', 'Tool 3', 'Tool 4', 'Heater bed', 'Cavity'];
</script>

<ObservationFrame title="Thermals" icon={ThermometerSun} observedAt={thermals.sourceObservedAt} freshness={thermals.freshness}>
  <div class="observation-list thermal-list">
    {#each thermals.readings as reading, index}
      <div class:active={reading.active} class="observation-row thermal-row">
        <div class="thermal-name">
          {#if reading.id === 'bed'}<Bed class="observation-icon" aria-hidden="true" />
          {:else if reading.id === 'cavity'}<Box class="observation-icon" aria-hidden="true" />
          {:else}<Thermometer class="observation-icon" aria-hidden="true" />{/if}
          <span>{labels[index]}</span>
        </div>
        <div class="temperature"><strong>{Math.round(reading.actualC)}°</strong><span>/ {reading.targetC === null ? '—' : `${Math.round(reading.targetC)}°`}</span></div>
      </div>
    {/each}
  </div>
</ObservationFrame>

<style>
  .thermal-list { display: grid; grid-template-columns: 1fr; }
  .thermal-row { position: relative; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .thermal-row.active::before { position: absolute; inset: 9px auto 9px 0; width: 3px; border-radius: 99px; background: var(--u1-accent); content: ''; }
  .thermal-name { display: flex; align-items: center; gap: 9px; min-width: 0; font-size: 14px; font-weight: 560; }
  .temperature { display: flex; align-items: baseline; gap: 5px; white-space: nowrap; font-variant-numeric: tabular-nums; }
  .temperature strong { font-size: 20px; font-weight: 620; }
  .temperature span { color: var(--u1-muted); font-size: 13px; }
  @media (min-width: 590px) {
    .thermal-list { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .thermal-row:nth-child(odd) { border-right: 1px solid var(--u1-line); }
    .thermal-row:nth-last-child(2) { border-bottom: 0; }
  }
</style>
