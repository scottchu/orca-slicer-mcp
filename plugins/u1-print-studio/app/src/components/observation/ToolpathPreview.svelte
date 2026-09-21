<script lang="ts">
  import { Box, ArrowDown } from 'lucide-svelte';
  import type { DecodedToolpath } from '../../lib/toolpath';
  import Stack from '../common/Stack.svelte';
  import Caption from '../common/Caption.svelte';
  import Name from '../common/Name.svelte';
  import Inline from '../common/Inline.svelte';
  import Button from '../common/Button.svelte';
  import ChartFrame from '../common/ChartFrame.svelte';
  import ToolpathCanvas from './ToolpathCanvas.svelte';
  let { preview, filename, masked = false }: { preview?: DecodedToolpath | null; filename?: string | null; masked?: boolean } = $props();
  let view = $state<'3d' | 'top'>('3d');
  const geometry = $derived(!masked && preview?.state === 'ready' ? preview.geometry : undefined);
  const layer = $derived(geometry && preview?.reason !== 'stale' ? preview?.currentLayerIndex ?? null : null);
  const message = $derived(masked ? 'Preview unavailable' : preview?.state === 'loading' ? 'Preparing G-code preview' : preview?.reason === 'no_current_job' ? 'No active print' : preview?.state === 'unsupported' ? 'Preview unavailable for this G-code' : preview?.reason === 'too_large' ? 'Preview unavailable for this file size' : 'G-code preview unavailable');
  const description = $derived(geometry ? preview?.reason === 'stale' ? 'Last reported · layer unavailable' : layer === null ? 'Planned paths · layer unavailable' : `Planned paths · printer-reported layer ${layer + 1}` : message);
</script>
{#snippet unavailableOverlay()}{message}{/snippet}
<Stack>
  {#if !masked && filename}<Name text={filename} />{:else}<Caption>G-code preview</Caption>{/if}
  <ChartFrame label="G-code preview" {description} overlay={!geometry ? unavailableOverlay : undefined}>
    <ToolpathCanvas {geometry} {layer} {view} />
  </ChartFrame>
  <Inline>
    <Button label="3D toolpath view" icon={Box} pressed={view === '3d'} disabled={!geometry} onclick={() => { view = '3d'; }}>3D</Button>
    <Button label="Top toolpath view" icon={ArrowDown} pressed={view === 'top'} disabled={!geometry} onclick={() => { view = 'top'; }}>Top</Button>
    <Caption>{description}</Caption>
  </Inline>
  {#if geometry}<Caption>Reported file · planned paths, not camera footage.{geometry.opaqueMacros ? ' Macro motion is not shown.' : ''}</Caption>{/if}
</Stack>
