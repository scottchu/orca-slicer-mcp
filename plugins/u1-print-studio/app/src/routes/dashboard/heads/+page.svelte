<script lang="ts">
  import LiveHeadsRoot from '../../../components/live/LiveHeadsRoot.svelte';
  import { createHeadsController } from '../../../lib/client/live/heads-controller';
  import { httpObservationPort } from '../../../lib/client/live/http-observation-port';
  const controller = createHeadsController(
    httpObservationPort('heads'),
    (text) => navigator.clipboard?.writeText(text) ?? Promise.reject(new Error('Clipboard unavailable'))
  );
</script>
<svelte:head><title>Heads &amp; Filaments</title></svelte:head>
<LiveHeadsRoot {controller} />
