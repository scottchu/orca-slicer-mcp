<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import type { HostRpc } from '../../lib/client/host/rpc';
  import { createComposableHost } from '../../lib/client/composable/host';
  import { createPlaceholderPresentation } from '../../lib/client/composable/presentation';
  import StatusLine from '../common/StatusLine.svelte';
  import PresentationRenderer from './PresentationRenderer.svelte';

  let { rpc }: { rpc: HostRpc } = $props();
  const host = untrack(() => createComposableHost(rpc));
  let current = $state(host.state());
  const presentation = $derived(current.presentation ?? (current.spec ? createPlaceholderPresentation(current.spec, current.failed ? 'error' : 'loading') : null));
  onMount(() => {
    const stop = host.subscribe((state) => { current = state; });
    return () => { stop(); host.dispose(); };
  });
</script>

{#if presentation}
  <PresentationRenderer {presentation} />
{:else}
  <StatusLine state={current.failed ? 'error' : 'loading'} text={current.failed ? 'Composition input is unavailable.' : 'Waiting for validated composition input.'} />
{/if}
