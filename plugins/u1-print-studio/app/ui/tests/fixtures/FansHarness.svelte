<script lang="ts">
  import FansWidget from '../../src/lib/observation/FansWidget.svelte';
  import { fansLabFixture } from '../../src/lib/fixtures/observations';
  import type { WidgetState } from '../../src/lib/ui/state';
  import type { FansObservation } from '../../src/lib/observation/types';
  import '../../src/lib/ui/tokens.css';
  let state = $state<WidgetState<FansObservation>>({ kind: 'loading' });
  Object.assign(window, { __setFansState: (kind: 'loading' | 'ready' | 'refreshing' | 'unavailable' | 'error', edge = false, mode?: FansObservation['purifierMode']) => {
    const observation = structuredClone(fansLabFixture);
    if (mode !== undefined) observation.purifierMode = mode;
    if (edge) {
      observation.items[0].percent = null; observation.items[0].rpm = 0;
      observation.items[1].percent = 0; observation.items[1].rpm = null;
      observation.items[2].percent = 33.3; observation.items[2].rpm = 100_000;
    }
    state = kind === 'ready' || kind === 'refreshing' ? { kind: 'ready', observation, refreshing: kind === 'refreshing' } : { kind };
  } });
</script>
<main><FansWidget {state} /></main>
<style>
  main { width: min(100% - 24px, 720px); margin: 24px auto; }
  @media (min-width: 590px) { main { width: min(100% - 40px, 720px); margin-block: 40px; } }
</style>
