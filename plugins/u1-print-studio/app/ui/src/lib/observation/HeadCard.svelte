<script lang="ts">
  import { Copy } from 'lucide-svelte';
  import { headColor, headStateLabel, type HeadCardValue, type HeadId } from '../live/heads-presentation';
  import InsetCard from '../ui/InsetCard.svelte';
  import ColorSwatch from '../ui/ColorSwatch.svelte';
  import Inline from '../ui/Inline.svelte';
  import Stack from '../ui/Stack.svelte';
  import Name from '../ui/Name.svelte';
  import Caption from '../ui/Caption.svelte';
  import LoadingValue from '../ui/LoadingValue.svelte';
  import Icon from '../ui/Icon.svelte';
  import IconButton from '../ui/IconButton.svelte';
  import Skeleton from '../ui/Skeleton.svelte';
  import ActualTarget from './ActualTarget.svelte';
  let { physicalTool, reading, loading = false, copying = false, oncopy }: { physicalTool: HeadId; reading?: HeadCardValue; loading?: boolean; copying?: boolean; oncopy?: (id: HeadId, color: string) => void } = $props();
  const color = $derived(headColor(reading?.presence ?? null, reading?.color ?? null));
</script>
<InsetCard label={`Tool ${physicalTool}`} color={color.color} neutral={!loading && color.neutral} active={reading?.active === true} actionAvailable={!loading && !!color.color}>
  {#snippet header()}
    <Name text={`T${physicalTool}`} />
    <Caption><LoadingValue {loading} text={loading ? undefined : headStateLabel(reading?.active ?? null, reading?.state ?? null)} /></Caption>
  {/snippet}
  <Stack>
    <Caption><LoadingValue {loading} text={loading ? undefined : reading?.material ?? '—'} size="long" /></Caption>
    <Inline gap="tight"><Inline shrink={false}><Icon name="thermals" /></Inline><ActualTarget actual={loading ? undefined : reading?.actual ?? null} target={loading ? undefined : reading?.target ?? null} {loading} compact /></Inline>
  </Stack>
  {#snippet footer()}
    <Inline gap="tight"><ColorSwatch color={color.color} /><Caption><LoadingValue {loading} text={loading ? undefined : color.label} words={[10]} /></Caption></Inline>
    {#if loading}<Skeleton shape="action" />{:else if color.color}<IconButton label={`Copy T${physicalTool} color ${color.color}`} icon={Copy} busy={copying} onclick={() => oncopy?.(physicalTool, color.color!)} />{/if}
  {/snippet}
</InsetCard>
