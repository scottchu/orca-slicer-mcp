<script lang="ts">
  import { Copy, Layers3, Thermometer } from 'lucide-svelte';
  import ObservationFrame from './ObservationFrame.svelte';
  import { validateHeads, type HeadsObservation } from './types';
  import LoadingValue from '../ui/LoadingValue.svelte';
  import { loadingObservation } from './loading';
  type FeedbackController = { begin: (message: string, autoClear?: boolean) => number; settle: (generation: number, message: string) => void };
  type Props = { observation: HeadsObservation; loading?: false; refreshing?: boolean } | { loading: true; observation?: never; refreshing?: never };
  let { observation, loading = false, refreshing = false }: Props = $props();
  const heads = $derived(loadingObservation(loading, observation, validateHeads));
  const items = $derived(heads?.items ?? [1, 2, 3, 4].map((physicalTool) => ({ physicalTool })));
  const copyColor = async (color: string, feedback: FeedbackController): Promise<void> => {
    const generation = feedback.begin(`Copying ${color}`, false);
    try {
      if (!navigator.clipboard) throw new Error('clipboard unavailable');
      await navigator.clipboard.writeText(color);
      feedback.settle(generation, `${color} copied`);
    } catch {
      feedback.settle(generation, `${color} copy unavailable`);
    }
  };
</script>

<ObservationFrame title="Heads & Filaments" icon={Layers3} observedAt={heads?.sourceObservedAt ?? null} freshness={heads?.freshness ?? 'unknown'} stateKind={loading ? 'loading' : 'ready'} {refreshing}>
  {#snippet children(feedback: FeedbackController)}
    <div class="head-grid">
      {#each items as head, index}
        {@const reading = heads?.items[index]}
        <section class:empty={reading?.presence !== true} class:active={reading?.active ?? false} class="head-card" style={`--head-color:${reading?.color ?? '#A7ADB4'}`} aria-label={`Tool ${head.physicalTool}`}>
          <div class="head-top"><strong>T{head.physicalTool}</strong><span class:neutral={!reading?.active} class:loading class="observation-status"><LoadingValue {loading} text={reading ? reading.active ? 'Active' : 'Parked' : undefined} /></span></div>
          <div class="material" data-head-material><LoadingValue {loading} text={reading ? reading.presence === false ? 'Empty' : reading.presence === null ? 'N/A' : reading.material ?? 'N/A' : undefined} size="long" words={[8, 6]} /></div>
          <div class="temperature"><Thermometer aria-hidden="true" /> <LoadingValue {loading} text={reading ? `${Math.round(reading.actualC)}° / ${Math.round(reading.targetC)}°` : undefined} words={[4, 1, 4]} /></div>
          {#if reading?.color}
            <button class="color copy-color" type="button" data-copy-color aria-label={`Copy T${head.physicalTool} color ${reading.color}`} onclick={() => copyColor(reading.color!, feedback)}>
              <span class="swatch" aria-hidden="true"></span><span>{reading.color}</span><Copy aria-hidden="true" />
            </button>
          {:else}
            <div class="color color-static"><span class="swatch" aria-hidden="true"></span><span><LoadingValue {loading} text={loading ? undefined : 'N/A'} /></span></div>
          {/if}
        </section>
      {/each}
    </div>
  {/snippet}
</ObservationFrame>

<style>
  .head-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, max(8em, calc(50% - 5px))), 1fr)); gap: 10px; font-size: var(--u1-type-name); }
  .head-card { min-width: 0; padding: 14px; overflow: hidden; border: 1px solid color-mix(in srgb, var(--head-color) 20%, var(--u1-line)); border-bottom-width: 3px; border-radius: var(--u1-radius-inner); background: color-mix(in srgb, var(--head-color) 6%, white); }
  .head-card.active { border-bottom-color: var(--u1-accent); }
  .loading::before { visibility: hidden; }
  .head-card.empty { --head-color: #A7ADB4 !important; background: #f3f4f5; }
  .head-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
  .head-top > strong { font-size: 22px; letter-spacing: -.04em; }
  .material { margin-top: 12px; font-size: 14px; line-height: 1.35; overflow-wrap: anywhere; }
  .temperature, .color { display: flex; align-items: center; gap: 7px; padding-top: 12px; border-top: 1px solid rgb(120 126 132 / 18%); font-size: 13px; font-variant-numeric: tabular-nums; }
  .temperature { margin-top: 12px; }
  .temperature :global(svg) { width: 17px; height: 17px; }
  .color { width: 100%; height: 44px; margin-top: 12px; color: var(--u1-muted); }
  .copy-color { display: grid; grid-template-columns: 17px minmax(0, 1fr) 20px; padding: 0; border: 0; border-top: 1px solid rgb(120 126 132 / 18%); background: transparent; text-align: left; cursor: pointer; }
  .copy-color > span:nth-child(2) { min-width: 0; overflow-wrap: anywhere; }
  .copy-color :global(svg) { width: 20px; height: 20px; }
  .copy-color:focus-visible { outline: 3px solid var(--u1-focus); outline-offset: 2px; }
  .color-static { padding-top: 0; }
  .swatch { width: 17px; height: 17px; flex: 0 0 auto; border: 1px solid rgb(28 30 32 / 22%); border-radius: 50%; background: var(--head-color); }
  @media (max-width: 350px) { .copy-color { font-size: 11px; } }
  @media (max-width: 350px) { .head-card { padding: 12px; } .head-top { align-items: flex-start; flex-direction: column; } }
</style>
