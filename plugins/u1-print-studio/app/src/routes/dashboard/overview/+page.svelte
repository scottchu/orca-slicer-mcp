<script lang="ts">
  import LiveOverviewRoot from '../../../components/live/LiveOverviewRoot.svelte';
  import { createOverviewController } from '../../../lib/client/live/focused-controllers';
  import { httpObservationPort } from '../../../lib/client/live/http-observation-port';
  const controller = createOverviewController(httpObservationPort('overview'));
</script>
<svelte:head><title>Printer Overview</title></svelte:head>
<LiveOverviewRoot {controller} />

