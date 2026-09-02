<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import type { createCurrentJobController } from './current-job-controller';
  import CurrentJobPanel from '../observation/CurrentJobPanel.svelte';
  let { controller }: { controller: ReturnType<typeof createCurrentJobController> } = $props();
  let current = $state(untrack(() => controller.getState()));
  onMount(() => {
    const unsubscribe = controller.subscribe((state) => { current = state; });
    controller.start();
    return () => { unsubscribe(); controller.dispose(); };
  });
</script>

<CurrentJobPanel job={current.observation ?? undefined} observedAt={current.observation?.receipt.sourceObservedAt ?? null} freshness={current.observation?.receipt.freshness ?? 'unknown'} evidence={current.observation?.state ?? 'unknown'} reason={current.observation?.receipt.reason} phase={current.phase} refreshing={current.refreshing} feedback={current.feedback} onrefresh={() => { void controller.refresh(); }} />
