<script lang="ts">
  import { Layers3, RefreshCw } from 'lucide-svelte';
  import type { Freshness } from '../../lib/client/live/presentation';
  import type { HeadCardValue, HeadId, HeadsPresentation } from '../../lib/client/live/heads-presentation';
  import HeadCards from './HeadCards.svelte';
  import HeadsSkeleton from './HeadsSkeleton.svelte';
  import Shell from '../common/Shell.svelte';
  import Header from '../common/Header.svelte';
  import Body from '../common/Body.svelte';
  import Footer from '../common/Footer.svelte';
  import StateAnnouncement from '../common/StateAnnouncement.svelte';
  import StateSurface from '../common/StateSurface/StateSurface.svelte';
  import ObservedMeta from './ObservedMeta.svelte';
  import DomainReceipt from './DomainReceipt.svelte';
  import Caption from '../common/Caption.svelte';
  import Icon from '../common/Icon.svelte';
  import Button from '../common/Button.svelte';
  import Skeleton from '../common/Skeleton.svelte';
  import FeedbackOverlay from '../common/FeedbackOverlay.svelte';
  import Stack from '../common/Stack.svelte';
  import InfoPair from '../common/InfoPair.svelte';
  import Label from '../common/Label.svelte';
  import { checkedMaterialShapes, type MaterialLoadingShapes } from '../../lib/client/observation/heads-loading';
  let { items, observedAt = null, freshness = 'unknown', materials, phase, materialShapes, refreshing = false, copying = null, feedback = '', sourceLabel = 'Head state & thermals', refreshLabel = 'Refresh Heads & Filaments', onrefresh, oncopy }: {
    items?: HeadCardValue[]; observedAt?: string | null; freshness?: Freshness; materials?: HeadsPresentation['materials']; phase: 'loading' | 'ready' | 'error' | 'unavailable'; materialShapes?: MaterialLoadingShapes; refreshing?: boolean; copying?: HeadId | null; feedback?: string; sourceLabel?: string; refreshLabel?: string; onrefresh?: () => void; oncopy?: (id: HeadId, color: string) => void;
  } = $props();
  const loading = $derived(phase === 'loading');
  const failed = $derived(phase === 'error' || phase === 'unavailable');
  const placeholder = $derived(!items || failed);
  const shapes = $derived(checkedMaterialShapes(placeholder, materialShapes));
  $effect.pre(() => { checkedMaterialShapes(placeholder, materialShapes); });
  const notice = $derived(failed ? feedback || (phase === 'error' ? 'Could not load Heads & Filaments' : 'Heads & Filaments unavailable') : feedback);
  const announcement = $derived(loading ? 'Loading Heads & Filaments' : refreshing ? 'Refreshing Heads & Filaments' : notice || 'Heads & Filaments loaded');
</script>
<StateAnnouncement text={announcement} />
<StateSurface {phase}>
<Shell label="Heads & Filaments" busy={loading || refreshing}>
  <Header title="Heads & Filaments">
    {#snippet icon()}<Icon icon={Layers3} />{/snippet}
    {#snippet meta()}<Caption>{sourceLabel} · <ObservedMeta {observedAt} {freshness} loading={placeholder} groupedTime /></Caption>{/snippet}
  </Header>
  <Body>
      <Stack>
        <InfoPair>
          {#snippet label()}<Label text="Materials" tone="muted" />{/snippet}
          {#snippet value()}<DomainReceipt observedAt={materials?.sourceObservedAt ?? null} freshness={materials?.freshness ?? 'unknown'} state={materials?.state} reason={materials?.reason} loading={placeholder} includeNotRequestedReason />{/snippet}
        </InfoPair>
        {#if items && !placeholder}<HeadCards {items} {copying} {oncopy} />{:else}<HeadsSkeleton materialShapes={shapes} />{/if}
      </Stack>
  </Body>
  <Footer message={failed ? notice : ''}>
    {#snippet actions()}{#if loading}<Skeleton shape="action" />{:else}<Button label={refreshLabel} icon={RefreshCw} onclick={onrefresh} busy={refreshing} />{/if}{/snippet}
  </Footer>
  <FeedbackOverlay message={failed ? '' : notice} announce={false} />
</Shell>
</StateSurface>
