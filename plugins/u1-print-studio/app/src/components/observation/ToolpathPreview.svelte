<script lang="ts">
  import type { Snippet } from 'svelte';
  import { Box, ArrowDown } from 'lucide-svelte';
  import type { DecodedToolpath } from '../../lib/toolpath';
  import TextSkeleton from '../common/TextSkeleton.svelte';
  import Stack from '../common/Stack.svelte';
  import Caption from '../common/Caption.svelte';
  import Name from '../common/Name.svelte';
  import Switch from '../common/Switch.svelte';
  import ChartFrame from '../common/ChartFrame.svelte';
  import ToolpathFrame from './ToolpathFrame.svelte';
  import ToolpathCanvas from './ToolpathCanvas.svelte';
  let { preview, filename, masked = false, terminal = false, reserveCanvas = false, summary }: { preview?: DecodedToolpath | null; filename?: string | null; masked?: boolean; terminal?: boolean; reserveCanvas?: boolean; summary: Snippet } = $props();
  const viewOptions = [{ value: '3d', label: '3D toolpath view', icon: Box }, { value: 'top', label: 'Top toolpath view', icon: ArrowDown }] as const;
  let view = $state<'3d' | 'top'>('3d');
  const acceptedGeometry = $derived(preview?.state === 'ready' ? preview.geometry : undefined);
  const geometry = $derived(masked ? undefined : acceptedGeometry);
  const layer = $derived(geometry && preview?.reason !== 'stale' ? preview?.currentLayerIndex ?? null : null);
  const message = $derived(preview?.state === 'loading' ? 'Preparing G-code preview' : preview?.state === 'unsupported' ? 'Preview unavailable for this G-code' : preview?.reason === 'too_large' ? 'Preview unavailable for this file size' : 'G-code preview unavailable');
  const description = $derived(geometry ? preview?.reason === 'stale' ? 'Last reported · layer unavailable' : layer === null ? 'Planned paths · layer unavailable' : `Planned paths · printer-reported layer ${layer + 1}` : message);
</script>
{#snippet controls()}
  {#if !masked}<Switch label="Toolpath view" options={viewOptions} value={view} disabled={!geometry} onchange={(next) => { view = next; }} />{/if}
{/snippet}

<Stack>
  {#if terminal}<Caption>{masked ? '\u00a0' : 'Last reported job'}</Caption>{/if}
  {#if !masked && filename}<Name text={filename} />{:else}<Caption>G-code preview</Caption>{/if}
  <ToolpathFrame {masked} compact={!geometry && !reserveCanvas} {summary} {controls} status={!geometry ? message : undefined}>
    <ChartFrame label="G-code preview" {description}>
      <ToolpathCanvas {geometry} {layer} {view} />
    </ChartFrame>
  </ToolpathFrame>
  {#if acceptedGeometry && (preview?.reason === 'stale' || preview?.currentLayerIndex === null)}<Caption>{#if masked}<TextSkeleton shape="Last reported · layer unavailable" />{:else}{description}{/if}</Caption>{/if}
  {#if acceptedGeometry}<Caption>{#if masked}<TextSkeleton shape={`Reported file · planned paths, not camera footage.${acceptedGeometry.opaqueMacros ? ' Macro motion is not shown.' : ''}`} />{:else}Reported file · planned paths, not camera footage.{acceptedGeometry.opaqueMacros ? ' Macro motion is not shown.' : ''}{/if}</Caption>{/if}
</Stack>
