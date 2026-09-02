<script lang="ts">
  import { onDestroy, type ComponentProps, type Snippet } from 'svelte';
  import { RefreshCw } from 'lucide-svelte';
  import WidgetShell from '../ui/WidgetShell.svelte';
  import WidgetHeader from '../ui/WidgetHeader.svelte';
  import WidgetBody from '../ui/WidgetBody.svelte';
  import WidgetFooter from '../ui/WidgetFooter.svelte';
  import IconButton from '../ui/IconButton.svelte';
  import ObservedMeta from '../ui/ObservedMeta.svelte';
  import Icon from '../ui/Icon.svelte';
  import Caption from '../ui/Caption.svelte';
  import FeedbackOverlay from '../ui/FeedbackOverlay.svelte';
  import Skeleton from '../ui/Skeleton.svelte';
  import StateAnnouncement from '../ui/StateAnnouncement.svelte';
  import WidgetStateSurface from '../ui/WidgetStateSurface/WidgetStateSurface.svelte';
  import type { LabFreshness } from './types';

  type LucideIcon = typeof import('lucide-svelte')['Box'];
  type FeedbackController = {
    begin: (message: string, autoClear?: boolean) => number;
    settle: (generation: number, message: string) => void;
  };
  let { title, icon, iconName, observedAt, freshness, children, stateKind, placeholder = stateKind === 'loading', refreshing = false, onretry }: {
    title: string;
    icon?: LucideIcon;
    iconName?: ComponentProps<typeof Icon>['name'];
    observedAt: string | null;
    freshness: LabFreshness;
    children: Snippet<[FeedbackController]>;
    stateKind?: 'loading' | 'ready' | 'unavailable' | 'error';
    refreshing?: boolean;
    placeholder?: boolean;
    onretry?: () => void;
  } = $props();
  const LegacyIcon = $derived(icon);
  let feedback = $state('');
  let timer: ReturnType<typeof setTimeout> | undefined;
  let generation = 0;
  $effect.pre(() => {
    // State changes supersede an earlier action's feedback, including pending
    // asynchronous completions. Legacy frames without state retain their flow.
    stateKind; refreshing;
    if (stateKind) {
      generation += 1;
      feedback = '';
      if (timer) clearTimeout(timer);
      timer = undefined;
    }
  });
  const clearLater = (current: number): void => {
    timer = setTimeout(() => {
      if (generation === current) feedback = '';
    }, 1600);
  };
  const begin = (message: string, autoClear = true): number => {
    const current = ++generation;
    feedback = message;
    if (timer) clearTimeout(timer);
    timer = undefined;
    if (autoClear) clearLater(current);
    return current;
  };
  const settle = (current: number, message: string): void => {
    if (generation !== current) return;
    feedback = message;
    if (timer) clearTimeout(timer);
    clearLater(current);
  };
  const controller: FeedbackController = { begin, settle };
  const refresh = (): void => { begin('Lab fixture refreshed'); };
  onDestroy(() => { if (timer) clearTimeout(timer); });
  const stateMessage = $derived(stateKind === 'loading' ? `Loading ${title}` : stateKind === 'error' ? `Could not load ${title}` : stateKind === 'unavailable' ? `${title} unavailable` : refreshing ? `Refreshing ${title}` : `${title} loaded`);
  const failureMessage = $derived(stateKind === 'error' || stateKind === 'unavailable' ? stateMessage : '');
</script>

{#if stateKind}<StateAnnouncement text={failureMessage || feedback || stateMessage} />{/if}
<WidgetStateSurface phase={stateKind ?? 'ready'}>
<WidgetShell label={title} busy={stateKind ? stateKind === 'loading' || refreshing : undefined}>
  <WidgetHeader {title}>
    {#snippet icon()}{#if iconName}<Icon name={iconName} />{:else if LegacyIcon}<LegacyIcon aria-hidden="true" />{/if}{/snippet}
    {#snippet meta()}<Caption>Lab fixture · <ObservedMeta {observedAt} {freshness} loading={placeholder} /></Caption>{/snippet}
  </WidgetHeader>
  <WidgetBody>{@render children(controller)}</WidgetBody>
  <WidgetFooter message={failureMessage}>
    {#snippet actions()}{#if stateKind === 'loading'}<Skeleton shape="action" />{:else}<IconButton label={failureMessage ? 'Retry lab fixture' : 'Refresh lab fixture'} icon={RefreshCw} onclick={failureMessage && onretry ? onretry : refresh} disabled={refreshing} />{/if}{/snippet}
  </WidgetFooter>
  <FeedbackOverlay message={failureMessage ? '' : feedback} announce={!stateKind} />
</WidgetShell>
</WidgetStateSurface>
