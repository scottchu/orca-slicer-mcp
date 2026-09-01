<script lang="ts">
  import type { Snippet } from 'svelte';
  import { RefreshCw } from 'lucide-svelte';
  import WidgetShell from '../ui/WidgetShell.svelte';
  import WidgetHeader from '../ui/WidgetHeader.svelte';
  import WidgetBody from '../ui/WidgetBody.svelte';
  import WidgetFooter from '../ui/WidgetFooter.svelte';
  import IconButton from '../ui/IconButton.svelte';
  import ObservedMeta from '../ui/ObservedMeta.svelte';
  import type { LabFreshness } from './types';

  type LucideIcon = typeof import('lucide-svelte')['Box'];
  type FeedbackAnnouncer = (message: string) => void;
  let { title, icon, observedAt, freshness, children }: {
    title: string;
    icon: LucideIcon;
    observedAt: string;
    freshness: LabFreshness;
    children: Snippet<[FeedbackAnnouncer]>;
  } = $props();
  const Icon = $derived(icon);
  let feedback = $state('');
  let timer: ReturnType<typeof setTimeout> | undefined;
  function announce(message: string): void {
    feedback = message;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => { feedback = ''; }, 1600);
  }
  function refresh(): void { announce('Lab fixture refreshed'); }
</script>

<WidgetShell label={title}>
  <WidgetHeader {title}>
    {#snippet icon()}<Icon aria-hidden="true" />{/snippet}
    {#snippet meta()}<span class="fixture-meta">Lab fixture · <ObservedMeta {observedAt} {freshness} /></span>{/snippet}
  </WidgetHeader>
  <WidgetBody>{@render children(announce)}</WidgetBody>
  <WidgetFooter>
    {#snippet actions()}<IconButton label="Refresh lab fixture" icon={RefreshCw} onclick={refresh} />{/snippet}
  </WidgetFooter>
  {#if feedback}<div class="widget-feedback" role="status">{feedback}</div>{/if}
</WidgetShell>

<style>
  .fixture-meta { color: var(--u1-muted); }
  .widget-feedback { position: absolute; right: var(--u1-card-x); bottom: 74px; z-index: 8; max-width: calc(100% - (2 * var(--u1-card-x))); padding: 8px 11px; border-radius: 10px; color: #fff; background: rgb(28 30 32 / 86%); box-shadow: 0 5px 16px rgb(28 30 32 / 16%); font-size: 12px; line-height: 1.35; pointer-events: none; }
</style>
