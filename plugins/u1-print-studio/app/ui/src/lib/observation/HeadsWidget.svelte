<script lang="ts">
  import { Layers3, Thermometer } from 'lucide-svelte';
  import ObservationFrame from './ObservationFrame.svelte';
  import { validateHeads, type HeadsObservation } from './types';
  let { observation }: { observation: HeadsObservation } = $props();
  const heads = $derived(validateHeads(observation));
</script>

<ObservationFrame title="Heads & Filaments" icon={Layers3} observedAt={heads.sourceObservedAt} freshness={heads.freshness}>
  <div class="head-grid">
    {#each heads.items as head}
      <section class:empty={head.presence !== true} class:active={head.active} class="head-card" style={`--head-color:${head.color ?? '#A7ADB4'}`} aria-label={`Tool ${head.physicalTool}`}>
        <div class="head-top"><strong>T{head.physicalTool}</strong><span class:neutral={!head.active} class="observation-status">{head.active ? 'Active' : 'Parked'}</span></div>
        <div class="material">{head.presence === false ? 'Empty' : head.presence === null ? 'N/A' : head.material ?? 'N/A'}</div>
        <div class="temperature"><Thermometer aria-hidden="true" /> {Math.round(head.actualC)}° / {Math.round(head.targetC)}°</div>
        <div class="color"><span class="swatch" aria-hidden="true"></span><span>{head.color ?? 'N/A'}</span></div>
      </section>
    {/each}
  </div>
</ObservationFrame>

<style>
  .head-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
  .head-card { min-width: 0; padding: 14px; overflow: hidden; border: 1px solid color-mix(in srgb, var(--head-color) 20%, var(--u1-line)); border-radius: var(--u1-radius-inner); background: color-mix(in srgb, var(--head-color) 8%, white); }
  .head-card.active { border-bottom: 3px solid var(--head-color); }
  .head-card.empty { --head-color: #A7ADB4 !important; background: #f3f4f5; }
  .head-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
  .head-top > strong { font-size: 22px; letter-spacing: -.04em; }
  .material { min-height: 37px; margin-top: 19px; font-size: 14px; line-height: 1.35; }
  .temperature, .color { display: flex; align-items: center; gap: 7px; padding-top: 12px; border-top: 1px solid rgb(120 126 132 / 18%); font-size: 13px; font-variant-numeric: tabular-nums; }
  .temperature { margin-top: 12px; }
  .temperature :global(svg) { width: 17px; height: 17px; }
  .color { margin-top: 12px; color: var(--u1-muted); }
  .swatch { width: 17px; height: 17px; flex: 0 0 auto; border: 1px solid rgb(28 30 32 / 22%); border-radius: 50%; background: var(--head-color); }
  @media (max-width: 350px) { .head-card { padding: 12px; } .head-top { align-items: flex-start; flex-direction: column; } }
  @media (min-width: 590px) { .head-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); } .head-card { padding: 14px 12px; } .head-top { align-items: flex-start; flex-direction: column; } }
</style>
