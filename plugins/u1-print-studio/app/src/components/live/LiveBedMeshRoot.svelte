<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import { RefreshCw } from 'lucide-svelte';
  import type { createBedMeshController } from '../../lib/client/live/bed-mesh-controller';
  import BedMeshPanel from '../bed-mesh/BedMeshPanel.svelte';
  import DomainReceipt from '../observation/DomainReceipt.svelte';
  import Button from '../common/Button.svelte';
  import Skeleton from '../common/Skeleton.svelte';
  let { controller }: { controller: ReturnType<typeof createBedMeshController> } = $props();
  let current = $state(untrack(() => controller.getState()));
  const observation = $derived(current.observation);
  const loading = $derived(current.phase === 'loading' && !observation);
  const failure = $derived(current.failure === 'error' ? 'error' : current.failure ? 'unavailable' : undefined);
  const emptyMessage = $derived(current.failure === 'unsupported' ? current.failureReason === 'not_reported' ? 'Bed mesh object not reported' : 'Bed mesh endpoint unsupported' : current.failure === 'unavailable' ? 'Bed mesh unavailable'
    : observation?.status === 'no_active_mesh' ? observation.state === 'stale' ? 'Last observed: no active bed mesh' : 'No active bed mesh'
    : observation?.state === 'unknown' ? 'Bed mesh not observed' : undefined);
  const emptyLabel = $derived(current.failure === 'unsupported' ? current.failureReason === 'not_reported' ? 'Object not reported' : 'Endpoint unsupported'
    : current.failure === 'unavailable' ? 'Unavailable'
    : observation?.status === 'no_active_mesh' ? 'No active mesh'
    : observation?.state === 'unknown' ? 'Not observed' : undefined);
  const refresh = () => { void controller.refresh(); };
  onMount(() => {
    const unsubscribe = controller.subscribe(state => { current = state; }); controller.start();
    return () => { unsubscribe(); controller.dispose(); };
  });
</script>
<BedMeshPanel observation={observation?.mesh ?? undefined} {loading} refreshing={current.refreshing} {failure}
  retrying={current.refreshing && !!current.failure} onretry={refresh} {emptyMessage} {emptyLabel}>
  {#snippet receiptMeta()}<DomainReceipt observedAt={observation?.receipt.sourceObservedAt ?? null} freshness={observation?.receipt.freshness ?? 'unknown'} state={observation?.state ?? 'unknown'} reason={observation?.receipt.reason ?? null} loading={loading || !!current.failure} />{/snippet}
  {#snippet refreshAction()}{#if loading || failure === 'error'}<Skeleton shape="action" />{:else}<Button label="Refresh Bed Mesh" icon={RefreshCw} onclick={refresh} busy={current.refreshing} />{/if}{/snippet}
</BedMeshPanel>
