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
  import TextSkeleton from '../ui/TextSkeleton.svelte';
  import Icon from '../ui/Icon.svelte';
  import IconButton from '../ui/IconButton.svelte';
  import Skeleton from '../ui/Skeleton.svelte';
  import ActualTarget from './ActualTarget.svelte';
  import { materialLoadingTemplate, type MaterialLoadingShape } from './heads-loading';
  type Props = { physicalTool: HeadId; reading?: HeadCardValue; copying?: boolean; oncopy?: (id: HeadId, color: string) => void } & ({ loading: true; materialShape?: MaterialLoadingShape } | { loading?: false; materialShape?: never });
  let { physicalTool, reading, loading = false, materialShape, copying = false, oncopy }: Props = $props();
  const materialTemplate = $derived(materialLoadingTemplate(loading, materialShape));
  $effect.pre(() => { materialLoadingTemplate(loading, materialShape); });
  const color = $derived(headColor(reading?.presence ?? null, reading?.color ?? null));
</script>
<InsetCard label={`Tool ${physicalTool}`} color={color.color} neutral={!loading && color.neutral} active={reading?.active === true} actionAvailable={!loading && !!color.color} headerLines={2}>
  {#snippet header()}
    <Name text={`T${physicalTool}`} />
    <Caption><LoadingValue {loading} text={loading ? undefined : headStateLabel(reading?.active ?? null, reading?.state ?? null)} /></Caption>
  {/snippet}
  <Stack>
    <Inline gap="tight"><Inline shrink={false}><Icon name="spool" /></Inline><Caption>{#if loading}<TextSkeleton shape={materialTemplate} />{:else}{reading?.material ?? '—'}{/if}</Caption></Inline>
    <Inline gap="tight"><Inline shrink={false}><Icon name="thermals" /></Inline><ActualTarget actual={loading ? undefined : reading?.actual ?? null} target={loading ? undefined : reading?.target ?? null} {loading} compact /></Inline>
  </Stack>
  {#snippet footer()}
    <Inline gap="tight"><ColorSwatch color={color.color} /><Caption><LoadingValue {loading} text={loading ? undefined : color.label} words={[10]} /></Caption></Inline>
  {/snippet}
  {#snippet actions()}
    {#if loading}<Skeleton shape="action" />{:else if color.color}<IconButton label={`Copy T${physicalTool} color ${color.color}`} icon={Copy} busy={copying} onclick={() => oncopy?.(physicalTool, color.color!)} />{/if}
  {/snippet}
</InsetCard>
