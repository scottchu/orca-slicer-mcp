<script lang="ts">
  import { RefreshCw } from 'lucide-svelte';
  import type { Freshness } from '../live/presentation';
  import type { HeadCardValue, HeadId, HeadsPresentation } from '../live/heads-presentation';
  import { titleCase } from './format';
  import HeadCards from './HeadCards.svelte';
  import HeadsSkeleton from './HeadsSkeleton.svelte';
  import WidgetShell from '../ui/WidgetShell.svelte';
  import WidgetHeader from '../ui/WidgetHeader.svelte';
  import WidgetBody from '../ui/WidgetBody.svelte';
  import WidgetFooter from '../ui/WidgetFooter.svelte';
  import StateAnnouncement from '../ui/StateAnnouncement.svelte';
  import StatePanel from '../ui/StatePanel.svelte';
  import ObservedMeta from '../ui/ObservedMeta.svelte';
  import Caption from '../ui/Caption.svelte';
  import Icon from '../ui/Icon.svelte';
  import IconButton from '../ui/IconButton.svelte';
  import Skeleton from '../ui/Skeleton.svelte';
  import FeedbackOverlay from '../ui/FeedbackOverlay.svelte';
  import Stack from '../ui/Stack.svelte';
  import InfoPair from '../ui/InfoPair.svelte';
  import Label from '../ui/Label.svelte';
  let { items, observedAt = null, freshness = 'unknown', materials, phase, refreshing = false, copying = null, feedback = '', sourceLabel = 'Head state & thermals', refreshLabel = 'Refresh Heads & Filaments', onrefresh, oncopy }: {
    items?: HeadCardValue[]; observedAt?: string | null; freshness?: Freshness; materials?: HeadsPresentation['materials']; phase: 'loading' | 'ready' | 'error'; refreshing?: boolean; copying?: HeadId | null; feedback?: string; sourceLabel?: string; refreshLabel?: string; onrefresh?: () => void; oncopy?: (id: HeadId, color: string) => void;
  } = $props();
  const loading = $derived(phase === 'loading');
  const announcement = $derived(loading ? 'Loading Heads & Filaments' : refreshing ? 'Refreshing Heads & Filaments' : feedback || 'Heads & Filaments loaded');
</script>
<StateAnnouncement text={announcement} />
<WidgetShell label="Heads & Filaments" busy={loading || refreshing}>
  <WidgetHeader title="Heads & Filaments">
    {#snippet icon()}<Icon name="heads" />{/snippet}
    {#snippet meta()}<Caption>{sourceLabel} · <ObservedMeta {observedAt} {freshness} {loading} groupedTime /></Caption>{/snippet}
  </WidgetHeader>
  <WidgetBody>
    {#if items || loading}
      <Stack>
        <InfoPair>
          {#snippet label()}<Label text="Materials" tone="muted" />{/snippet}
          {#snippet value()}<Caption><ObservedMeta observedAt={materials?.sourceObservedAt ?? null} freshness={materials?.freshness ?? 'unknown'} {loading} groupedTime />{#if materials && materials.state !== 'known' && materials.state !== 'stale'} · {titleCase(materials.state)}{/if}{#if materials?.reason} · {titleCase(materials.reason)}{/if}</Caption>{/snippet}
        </InfoPair>
        {#if items}<HeadCards {items} {copying} {oncopy} />{:else}<HeadsSkeleton />{/if}
      </Stack>
    {:else}<StatePanel title="Heads & Filaments" reason="error" />{/if}
  </WidgetBody>
  <WidgetFooter>
    {#snippet actions()}{#if loading}<Skeleton shape="action" />{:else}<IconButton label={refreshLabel} icon={RefreshCw} onclick={onrefresh} busy={refreshing} />{/if}{/snippet}
  </WidgetFooter>
  <FeedbackOverlay message={feedback} announce={false} />
</WidgetShell>
