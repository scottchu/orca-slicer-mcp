<script lang="ts">
  import LiveObservationRoot from '../../../components/live/LiveObservationRoot.svelte';
  import { createFansController } from '../../../lib/client/live/controller';
  import { httpObservationPort } from '../../../lib/client/live/http-observation-port';
  const controller = createFansController(httpObservationPort('fans'));
</script>
<svelte:head><title>Fans &amp; Air</title></svelte:head>
<LiveObservationRoot {controller} />
