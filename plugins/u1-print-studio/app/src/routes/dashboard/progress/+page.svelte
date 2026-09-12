<script lang="ts">
  import LiveProgressRoot from '../../../components/live/LiveProgressRoot.svelte';
  import { createProgressController } from '../../../lib/client/live/focused-controllers';
  import { httpObservationPort } from '../../../lib/client/live/http-observation-port';
  const controller = createProgressController(httpObservationPort('progress'));
</script>
<svelte:head><title>Print Progress</title></svelte:head>
<LiveProgressRoot {controller} />

