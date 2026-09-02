<script lang="ts">
  import LiveThermalsRoot from '../../../components/live/LiveThermalsRoot.svelte';
  import { createThermalsController } from '../../../lib/client/live/thermals-controller';
  import { httpObservationPort } from '../../../lib/client/live/http-observation-port';
  const controller = createThermalsController(httpObservationPort('thermals'));
</script>
<svelte:head><title>Thermals</title></svelte:head>
<LiveThermalsRoot {controller} />
