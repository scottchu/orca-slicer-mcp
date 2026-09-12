<script lang="ts">
  import type { Snippet } from 'svelte';
  import { RefreshCw } from 'lucide-svelte';
  import Shell from './Shell.svelte';
  import Header from './Header.svelte';
  import Body from './Body.svelte';
  import Footer from './Footer.svelte';
  import Button from './Button.svelte';
  import Icon from './Icon.svelte';
  import Caption from './Caption.svelte';
  import Skeleton from './Skeleton.svelte';
  import StateAnnouncement from './StateAnnouncement.svelte';
  import StateSurface from './StateSurface/StateSurface.svelte';
  import type { Freshness } from '../../lib/client/live/presentation';
  type LucideIcon = typeof import('lucide-svelte')['Box'];
  let { title, icon: readingIcon, observedAt, freshness, children, stateKind = 'ready', placeholder = stateKind === 'loading', refreshing = false, onretry, meta: contentMeta, actionLabel, feedback = '', failureMessage = '' }: {
    title: string; icon: LucideIcon; observedAt: string | null; freshness: Freshness; children: Snippet;
    stateKind?: 'loading' | 'ready' | 'error' | 'unavailable'; placeholder?: boolean; refreshing?: boolean;
    onretry?: () => void; meta?: Snippet; lab?: boolean; actionLabel?: string; feedback?: string; failureMessage?: string;
  } = $props();
  const failed = $derived(stateKind === 'error' || stateKind === 'unavailable');
  const status = $derived(stateKind === 'loading' ? `Loading ${title}` : failed ? failureMessage || (stateKind === 'error' ? `Could not load ${title}` : `${title} unavailable`) : refreshing ? `Refreshing ${title}` : feedback || `${title} loaded`);
</script>
<StateAnnouncement text={status} />
<StateSurface phase={stateKind}>
  <Shell label={title} busy={stateKind === 'loading' || refreshing}>
    <Header {title}>
      {#snippet icon()}<Icon icon={readingIcon} />{/snippet}
      {#snippet meta()}{#if contentMeta}{@render contentMeta()}{:else}<Caption>{placeholder ? '' : observedAt === null ? 'Observation time unavailable' : new Date(observedAt).toLocaleTimeString()} {placeholder ? '' : freshness}</Caption>{/if}{/snippet}
    </Header>
    <Body>{@render children()}</Body>
    <Footer message={failed ? status : ''} visibleMessage={failed && status.includes('unsupported') ? 'Endpoint unsupported' : failed && status.includes('unavailable') ? 'Unavailable' : 'Could not load'}>
      {#snippet actions()}{#if stateKind === 'loading'}<Skeleton shape="action" />{:else}<Button label={actionLabel ?? `${failed ? 'Retry' : 'Refresh'} ${title}`} icon={RefreshCw} onclick={onretry} disabled={refreshing} />{/if}{/snippet}
    </Footer>
  </Shell>
</StateSurface>
