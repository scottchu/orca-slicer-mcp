<script lang="ts">
  import ThermalsWidget from '../../../src/components/observation/ThermalsWidget.svelte';
  import { thermalsLabFixture } from '../../../src/lib/client/fixtures/observations';
  import type { WidgetState } from '../../../src/lib/client/observation/state';
  import type { ThermalsObservation } from '../../../src/lib/client/observation/types';
  import '../../../src/components/common/tokens.css';
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
