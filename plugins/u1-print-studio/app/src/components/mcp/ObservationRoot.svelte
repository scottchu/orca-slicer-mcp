<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import type { HostRpc } from '../../lib/client/host/rpc';
  import { createObservationHost } from '../../lib/client/mcp/observation-host';
  import { createMcpHeads } from '../../lib/client/mcp/heads';
  import { createFansController } from '../../lib/client/live/controller';
  import { createThermalsController } from '../../lib/client/live/thermals-controller';
  import { createQueueController } from '../../lib/client/live/queue-controller';
  import { observationPort } from '../../lib/client/live/observation-port';
  import { createProgressController, createJobsController, createHistoryController, createOverviewController } from '../../lib/client/live/focused-controllers';
  import { createBedMeshController } from '../../lib/client/live/bed-mesh-controller';
  import LiveHeadsRoot from '../live/LiveHeadsRoot.svelte';
  import LiveObservationRoot from '../live/LiveObservationRoot.svelte';
  import LiveThermalsRoot from '../live/LiveThermalsRoot.svelte';
  import LiveQueueRoot from '../live/LiveQueueRoot.svelte';
  import LiveProgressRoot from '../live/LiveProgressRoot.svelte';
  import LiveJobsRoot from '../live/LiveJobsRoot.svelte';
  import LiveHistoryRoot from '../live/LiveHistoryRoot.svelte';
  import LiveOverviewRoot from '../live/LiveOverviewRoot.svelte';
  import LiveBedMeshRoot from '../live/LiveBedMeshRoot.svelte';
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
  // Replayed host state must not replace a mounted controller for the same view.
  const selectedView = $derived(current.view);
  const heads = $derived(selectedView === 'heads' ? untrack(() => createMcpHeads(rpc)) : null);
  const fans = $derived(selectedView === 'fans' ? untrack(() => createFansController(observationPort(rpc, 'fans'))) : null);
  const thermals = $derived(selectedView === 'thermals' ? untrack(() => createThermalsController(observationPort(rpc, 'thermals'))) : null);
  const queue = $derived(selectedView === 'queue' ? untrack(() => createQueueController(observationPort(rpc, 'queue'))) : null);
  const progress = $derived(selectedView === 'progress' ? untrack(() => createProgressController(observationPort(rpc, 'progress'))) : null);
  const jobs = $derived(selectedView === 'jobs' ? untrack(() => createJobsController(observationPort(rpc, 'jobs'))) : null);
  const history = $derived(selectedView === 'job_history' ? untrack(() => createHistoryController(observationPort(rpc, 'job_history'))) : null);
  const overview = $derived(selectedView === 'overview' ? untrack(() => createOverviewController(observationPort(rpc, 'overview'))) : null);
  const mesh = $derived(selectedView === 'bed_mesh' ? untrack(() => createBedMeshController(observationPort(rpc, 'bed_mesh'))) : null);
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
{:else if fans}
  <PageLayout name="fans"><LiveObservationRoot controller={fans} /></PageLayout>
{:else if thermals}
  <PageLayout name="thermals"><LiveThermalsRoot controller={thermals} /></PageLayout>
{:else if queue}
  <PageLayout name="queue"><LiveQueueRoot controller={queue} /></PageLayout>
{:else if progress}
  <PageLayout name="progress"><LiveProgressRoot controller={progress} /></PageLayout>
{:else if jobs}
  <PageLayout name="jobs"><LiveJobsRoot controller={jobs} /></PageLayout>
{:else if history}
  <PageLayout name="job_history"><LiveHistoryRoot controller={history} /></PageLayout>
{:else if overview}
  <PageLayout name="overview"><LiveOverviewRoot controller={overview} /></PageLayout>
{:else if mesh}
  <PageLayout name="bed_mesh"><LiveBedMeshRoot controller={mesh} /></PageLayout>
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
