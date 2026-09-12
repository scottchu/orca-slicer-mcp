<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import BedMeshPanel from './BedMeshPanel.svelte';
  let props: Omit<ComponentProps<typeof BedMeshPanel>, 'attribution'> = $props();
  const showAttribution = $derived(!props.observation || !!props.failure || props.retrying || props.observation.fixture);
</script>
<BedMeshPanel observation={props.observation} loading={props.loading} refreshing={props.refreshing} failure={props.failure} retrying={props.retrying} onretry={props.onretry} selectedMode={props.selectedMode} onmode={props.onmode} receiptMeta={props.receiptMeta} refreshAction={props.refreshAction} emptyMessage={props.emptyMessage}>
  {#snippet attribution()}{showAttribution ? ' · Lab fixture' : ''}{/snippet}
</BedMeshPanel>
