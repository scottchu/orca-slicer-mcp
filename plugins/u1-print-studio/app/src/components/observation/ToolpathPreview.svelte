<script lang="ts">
  import type { Snippet } from 'svelte';
  import { Box, ArrowDown } from 'lucide-svelte';
  import type { DecodedToolpath } from '../../lib/toolpath';
  import Stack from '../common/Stack.svelte';
  import Caption from '../common/Caption.svelte';
  import Name from '../common/Name.svelte';
  import Switch from '../common/Switch.svelte';
  import ChartFrame from '../common/ChartFrame.svelte';
  import ToolpathFrame from './ToolpathFrame.svelte';
  import ToolpathCanvas from './ToolpathCanvas.svelte';
  let { preview, filename, masked = false, summary }: { preview?: DecodedToolpath | null; filename?: string | null; masked?: boolean; summary: Snippet } = $props();
  const viewOptions = [{ value: '3d', label: '3D toolpath view', icon: Box }, { value: 'top', label: 'Top toolpath view', icon: ArrowDown }] as const;
  let view = $state<'3d' | 'top'>('3d');
  const geometry = $derived(!masked && preview?.state === 'ready' ? preview.geometry : undefined);
  const layer = $derived(geometry && preview?.reason !== 'stale' ? preview?.currentLayerIndex ?? null : null);
  const message = $derived(masked ? 'Preview unavailable' : preview?.state === 'loading' ? 'Preparing G-code preview' : preview?.reason === 'no_current_job' ? 'No active print' : preview?.state === 'unsupported' ? 'Preview unavailable for this G-code' : preview?.reason === 'too_large' ? 'Preview unavailable for this file size' : 'G-code preview unavailable');
  const description = $derived(geometry ? preview?.reason === 'stale' ? 'Last reported · layer unavailable' : layer === null ? 'Planned paths · layer unavailable' : `Planned paths · printer-reported layer ${layer + 1}` : message);
</script>
{#snippet controls()}
  <Switch label="Toolpath view" options={viewOptions} value={view} disabled={!geometry} onchange={(next) => { view = next; }} />
{/snippet}

<Stack>
  {#if !masked && filename}<Name text={filename} />{:else}<Caption>G-code preview</Caption>{/if}
  <ToolpathFrame {summary} {controls} status={!geometry ? message : undefined}>
    <ChartFrame label="G-code preview" {description}>
      <ToolpathCanvas {geometry} {layer} {view} />
    </ChartFrame>
  </ToolpathFrame>
  {#if geometry && (preview?.reason === 'stale' || layer === null)}<Caption>{description}</Caption>{/if}
  {#if geometry}<Caption>Reported file · planned paths, not camera footage.{geometry.opaqueMacros ? ' Macro motion is not shown.' : ''}</Caption>{/if}
</Stack>
