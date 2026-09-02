<script lang="ts">
  import { Copy, Spool, ThermometerSun } from 'lucide-svelte';
  import { headColor, headStateLabel, type HeadCardValue, type HeadId } from '../../lib/client/live/heads-presentation';
  import InsetCard from '../common/InsetCard.svelte';
  import ColorValue from '../common/ColorValue.svelte';
  import Inline from '../common/Inline.svelte';
  import Stack from '../common/Stack.svelte';
  import Name from '../common/Name.svelte';
  import Caption from '../common/Caption.svelte';
  import LoadingValue from '../common/LoadingValue.svelte';
  import TextSkeleton from '../common/TextSkeleton.svelte';
  import Icon from '../common/Icon.svelte';
  import Button from '../common/Button.svelte';
  import ActualTarget from './ActualTarget.svelte';
  import { materialLoadingTemplate, type MaterialLoadingShape } from '../../lib/client/observation/heads-loading';
  type Props = { physicalTool: HeadId; reading?: HeadCardValue; copying?: boolean; oncopy?: (id: HeadId, color: string) => void } & ({ loading: true; materialShape?: MaterialLoadingShape } | { loading?: false; materialShape?: never });
  let { physicalTool, reading, loading = false, materialShape, copying = false, oncopy }: Props = $props();
  const materialTemplate = $derived(materialLoadingTemplate(loading, materialShape));
  $effect.pre(() => { materialLoadingTemplate(loading, materialShape); });
  const color = $derived(headColor(reading?.presence ?? null, reading?.color ?? null));
</script>
<InsetCard label={`Tool ${physicalTool}`} color={color.color} neutral={!loading && color.neutral} active={reading?.active === true} actionAvailable={!loading && !!color.color} headerLines={2} footerLayout="content">
  {#snippet header()}
    <Name text={`T${physicalTool}`} />
    <Caption><LoadingValue {loading} text={loading ? undefined : headStateLabel(reading?.active ?? null, reading?.state ?? null)} /></Caption>
  {/snippet}
  <Stack>
    <Inline gap="tight"><Inline shrink={false}><Icon icon={Spool} /></Inline><Caption>{#if loading}<TextSkeleton shape={materialTemplate} />{:else}{reading?.material ?? '—'}{/if}</Caption></Inline>
    <Inline gap="tight"><Inline shrink={false}><Icon icon={ThermometerSun} /></Inline><ActualTarget actual={loading ? undefined : reading?.actual ?? null} target={loading ? undefined : reading?.target ?? null} {loading} compact /></Inline>
  </Stack>
  {#snippet footer()}
    {#if !loading && color.color}
      <Button variant="quiet" label={`Copy T${physicalTool} color ${color.color}`} icon={Copy} busy={copying} onclick={() => oncopy?.(physicalTool, color.color!)}><ColorValue color={color.color} text={color.label} /></Button>
    {:else}<ColorValue color={loading ? undefined : color.color} text={loading ? undefined : color.label} {loading} />{/if}
  {/snippet}
</InsetCard>
