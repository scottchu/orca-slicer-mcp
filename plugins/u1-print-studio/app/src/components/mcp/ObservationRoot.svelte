<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import type { HostRpc } from '../../lib/client/host/rpc';
  import { createObservationHost } from '../../lib/client/mcp/observation-host';
  import { createMcpHeads } from '../../lib/client/mcp/heads';
  import { mountLegacyObservation } from '../../lib/client/legacy/observation';
  import LiveHeadsRoot from '../live/LiveHeadsRoot.svelte';
  import Mount from '../common/Mount.svelte';
  import PageLayout from '../common/PageLayout.svelte';
  import Shell from '../common/Shell.svelte';
  import Header from '../common/Header.svelte';
  import Body from '../common/Body.svelte';
  import Footer from '../common/Footer.svelte';
  import Icon from '../common/Icon.svelte';
  import Skeleton from '../common/Skeleton.svelte';
  import StateAnnouncement from '../common/StateAnnouncement.svelte';
  import { Printer } from 'lucide-svelte';
  let { rpc }: { rpc: HostRpc } = $props();
  const host = untrack(() => createObservationHost(rpc));
  let current = $state(host.state());
  const heads = $derived(current.view === 'heads' ? createMcpHeads(rpc) : null);
  onMount(() => {
    const stop = host.subscribe((state) => { current = state; });
    return () => {
      stop();
      host.dispose();
    };
  });
</script>

{#if heads}
  <PageLayout name="heads"><LiveHeadsRoot controller={heads} /></PageLayout>
{:else if current.view}
  <Mount onready={(target) => mountLegacyObservation(target, rpc, current.view as Exclude<typeof current.view, 'heads' | null>)} />
{:else}
  <PageLayout name="pending-observation">
    <Shell label="Printer observation" busy={!current.failed}>
      <Header title="Printer observation" icon={printerIcon} />
      <Body><Skeleton shape="caption" /></Body>
      <Footer actions={pendingAction} message={current.failed ? 'Could not load. Reopen this card to try again.' : ''} />
      <StateAnnouncement text={current.failed ? 'Could not load. Reopen this card to try again.' : 'Loading printer observation'} />
    </Shell>
  </PageLayout>
{/if}
{#snippet printerIcon()}<Icon icon={Printer} />{/snippet}
{#snippet pendingAction()}<Skeleton shape="action" />{/snippet}
