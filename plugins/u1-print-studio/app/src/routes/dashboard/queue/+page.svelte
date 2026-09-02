<script lang="ts">
  import LiveQueueRoot from '../../../components/live/LiveQueueRoot.svelte';
  import { createQueueController } from '../../../lib/client/live/queue-controller';
  import { httpObservationPort } from '../../../lib/client/live/http-observation-port';
  const controller = createQueueController(httpObservationPort('queue'));
</script>
<svelte:head><title>Print Queue</title></svelte:head>
<LiveQueueRoot {controller} />
