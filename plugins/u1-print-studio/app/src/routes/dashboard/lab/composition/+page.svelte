<script lang="ts">
  import PresentationRenderer from '../../../../components/composable/PresentationRenderer.svelte';
  import type { ComposableViewModel } from '../../../../lib/composable/view-model';
  import type { PageData } from './$types';
  let { data }: { data: PageData } = $props();
  let scenario = $state('unknown');
  let variant = $state('smart');
  const selected = $derived(data.presentations[scenario][variant] as { canonicalSpec: unknown; viewModel: ComposableViewModel });
</script>

<svelte:head><title>Composable UI experiment</title></svelte:head>

<main>
  <header class="intro">
    <p class="eyebrow">Provisional F0 / UI-003 experiment</p>
    <h1>Entity-bound composition lab v2</h1>
    <p>The default summary reads from top to bottom. Other layouts are capability demos, not recommended alternatives. All values here are synthetic.</p>
  </header>

  <section class="controls" aria-label="Composition controls">
    <label>Evidence scenario
      <select bind:value={scenario}>
        <option value="unknown">Unknown fan relation</option>
        <option value="ambiguous">Ambiguous fan relation</option>
        <option value="known">Known fan relation</option>
        <option value="loading">Loading sources</option>
        <option value="partial">Partial source failure</option>
        <option value="error">Acquisition failure</option>
      </select>
    </label>
    <label>Layout preview
      <select bind:value={variant}>
        <option value="smart">Default: stacked summary</option>
        <option value="explicit">Demo: custom columns</option>
        <option value="card">Demo: entity card</option>
        <option value="compact">Demo: compact grid</option>
        <option value="larger">Demo: larger composition</option>
        <option value="balanced">Demo: balanced hierarchy</option>
      </select>
    </label>
  </section>

  <section class:larger={variant === 'larger' || variant === 'balanced'} class="stage" aria-label="Rendered composition">
    <PresentationRenderer presentation={selected.viewModel} />
  </section>

  <section class="inspect" aria-label="Composition inspection">
    <details open>
      <summary>Canonical JSON wire contract</summary>
      <pre>{JSON.stringify(selected.canonicalSpec, null, 2)}</pre>
    </details>
    <details>
      <summary>Deduplicated source plan and provenance</summary>
      <pre>{JSON.stringify({ canonicalSpecSha256: selected.viewModel.canonicalSpecSha256, dependencies: selected.viewModel.dependencies, generatedAt: selected.viewModel.generatedAt, sources: selected.viewModel.sources, resolvedTree: selected.viewModel.root }, null, 2)}</pre>
    </details>
  </section>

  <p class="boundary">Synthetic, read-only software evidence. No printer, camera, authentication, remote acquisition, or action path is used.</p>
</main>

<style>
  main { width: min(100% - 24px, 880px); margin: 0 auto; padding: 28px 0 44px; }
  .intro { margin: 0 auto 20px; max-width: 700px; text-align: center; }
  .eyebrow { margin: 0 0 5px; color: var(--u1-focus); font-size: 12px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
  h1 { margin: 0; font-size: clamp(1.75rem, 7vw, 2.5rem); line-height: 1.1; letter-spacing: -.035em; }
  .intro p:last-child { margin: 10px auto 0; color: var(--u1-muted); line-height: 1.55; }
  .controls { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin: 0 auto 16px; max-width: 700px; padding: 14px; border: 1px solid var(--u1-line); border-radius: var(--u1-radius-inner); background: var(--u1-surface); }
  label { display: grid; gap: 6px; color: var(--u1-muted); font-size: 13px; font-weight: 600; }
  select { min-width: 0; min-height: 44px; padding: 8px 34px 8px 10px; border: 1px solid var(--u1-line); border-radius: var(--u1-radius-control); color: var(--u1-ink); background: var(--u1-canvas); font: inherit; }
  select:focus-visible, summary:focus-visible { outline: 3px solid #6f4d00; outline-offset: 2px; }
  .stage { width: min(100%, 590px); margin: 0 auto; }
  .stage.larger { width: min(100%, 760px); }
  .inspect { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-top: 22px; }
  details { min-width: 0; border: 1px solid var(--u1-line); border-radius: var(--u1-radius-inner); background: var(--u1-surface); }
  summary { min-height: 44px; padding: 12px 14px; cursor: pointer; font-weight: 600; }
  pre { max-height: 340px; margin: 0; overflow: auto; border-top: 1px solid var(--u1-line); padding: 14px; color: #34383d; background: var(--u1-canvas); font: 12px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace; white-space: pre-wrap; overflow-wrap: anywhere; }
  .boundary { margin: 18px 0 0; color: var(--u1-muted); font-size: 13px; text-align: center; }
  @media (max-width: 520px) { .controls, .inspect { grid-template-columns: 1fr; } main { width: min(100% - 16px, 880px); padding-top: 18px; } }
</style>
