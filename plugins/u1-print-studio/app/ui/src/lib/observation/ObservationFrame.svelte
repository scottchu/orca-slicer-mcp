<script lang="ts">
  import { onDestroy, type Snippet } from 'svelte';
  import { RefreshCw } from 'lucide-svelte';
  import Shell from '../common/Shell.svelte';
  import Header from '../common/Header.svelte';
  import Body from '../common/Body.svelte';
  import Footer from '../common/Footer.svelte';
  import Button from '../common/Button.svelte';
  import ObservedMeta from './ObservedMeta.svelte';
  import Icon from '../common/Icon.svelte';
  import { observationIcons, type ObservationIconName } from './icons';
  import Caption from '../common/Caption.svelte';
  import FeedbackOverlay from '../common/FeedbackOverlay.svelte';
  import Skeleton from '../common/Skeleton.svelte';
  import StateAnnouncement from '../common/StateAnnouncement.svelte';
  import StateSurface from '../common/StateSurface/StateSurface.svelte';
  import type { LabFreshness } from './types';

  type LucideIcon = typeof import('lucide-svelte')['Box'];
  type FeedbackController = {
    begin: (message: string, autoClear?: boolean) => number;
    settle: (generation: number, message: string) => void;
  };
  let { title, icon, iconName, observedAt, freshness, children, stateKind, placeholder = stateKind === 'loading', refreshing = false, onretry }: {
    title: string;
    icon?: LucideIcon;
    iconName?: ObservationIconName;
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
<StateSurface phase={stateKind ?? 'ready'}>
<Shell label={title} busy={stateKind ? stateKind === 'loading' || refreshing : undefined}>
  <Header {title}>
    {#snippet icon()}{#if iconName}<Icon icon={observationIcons[iconName]} />{:else if LegacyIcon}<Icon icon={LegacyIcon} />{/if}{/snippet}
    {#snippet meta()}<Caption>Lab fixture · <ObservedMeta {observedAt} {freshness} loading={placeholder} /></Caption>{/snippet}
  </Header>
  <Body>{@render children(controller)}</Body>
  <Footer message={failureMessage}>
    {#snippet actions()}{#if stateKind === 'loading'}<Skeleton shape="action" />{:else}<Button label={failureMessage ? 'Retry lab fixture' : 'Refresh lab fixture'} icon={RefreshCw} onclick={failureMessage && onretry ? onretry : refresh} disabled={refreshing} />{/if}{/snippet}
  </Footer>
  <FeedbackOverlay message={failureMessage ? '' : feedback} announce={!stateKind} />
</Shell>
</StateSurface>
