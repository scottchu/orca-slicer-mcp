<script lang="ts">
  import ThermalsWidget from '../../src/lib/observation/ThermalsWidget.svelte';
  import { thermalsLabFixture } from '../../src/lib/fixtures/observations';
  import type { WidgetState } from '../../src/lib/observation/state';
  import type { ThermalsObservation } from '../../src/lib/observation/types';
  import '../../src/lib/common/tokens.css';
  let state = $state<WidgetState<ThermalsObservation>>({ kind: 'loading' });
  // Test-only bridge, never included by the production/private-lab entrypoint.
  Object.assign(window, { __setThermalsState(kind: 'loading' | 'ready' | 'refreshing' | 'unavailable' | 'error') {
    state = kind === 'ready' || kind === 'refreshing' ? { kind: 'ready', observation: thermalsLabFixture, refreshing: kind === 'refreshing' } : { kind };
  } });
</script>

<main><ThermalsWidget {state} /></main>

<style>
  main { width: min(100% - 24px, 720px); margin: 24px auto; }
  @media (min-width: 590px) { main { width: min(100% - 40px, 720px); margin-block: 40px; } }
</style>
