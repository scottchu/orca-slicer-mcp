<script lang="ts">
  import PercentageBackground from '../../src/lib/ui/PercentageBackground.svelte';
  import '../../src/lib/ui/tokens.css';
  let { value = 50, max = 100, color, onclick = () => {} }: {
    value?: number | null; max?: number | null; color?: string; onclick?: () => void;
  } = $props();
</script>

<PercentageBackground {value} {max} {color}>
  <section aria-label="Example card" class="example-card">
    <span>Actual {value ?? 'unknown'} / Target {max ?? 'unknown'}</span>
    <button {onclick}>Example action</button>
  </section>
</PercentageBackground>

<style>
  .example-card { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; padding: 16px; border: 1px solid var(--u1-line); border-radius: var(--u1-radius-inner); }
  button { min-width: 44px; min-height: 44px; }
  button:focus-visible { outline: 3px solid var(--u1-focus); outline-offset: 3px; }
</style>
