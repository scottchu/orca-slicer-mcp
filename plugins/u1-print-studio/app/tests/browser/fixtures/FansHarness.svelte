<script lang="ts">
  import FansWidget from '../../../src/components/observation/FansWidget.svelte';
  import { fansLabFixture } from '../../../src/lib/client/fixtures/observations';
  import type { WidgetState } from '../../../src/lib/client/observation/state';
  import type { FansObservation } from '../../../src/lib/client/observation/types';
  import '../../../src/components/common/tokens.css';
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
