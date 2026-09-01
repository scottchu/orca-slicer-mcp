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
  let { title, icon, observedAt, freshness, feedback = '', children }: {
    title: string;
    icon: LucideIcon;
    observedAt: string;
    freshness: LabFreshness;
    feedback?: string;
    children: Snippet;
  } = $props();
  const Icon = $derived(icon);
  let refreshFeedback = $state('');
  let timer: ReturnType<typeof setTimeout> | undefined;
  function refresh(): void {
    refreshFeedback = 'Lab fixture refreshed';
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => { refreshFeedback = ''; }, 1600);
  }
</script>

<WidgetShell label={title}>
  <WidgetHeader {title}>
    {#snippet icon()}<Icon aria-hidden="true" />{/snippet}
    {#snippet meta()}<span class="fixture-meta">Lab fixture · <ObservedMeta {observedAt} {freshness} /></span>{/snippet}
  </WidgetHeader>
  <WidgetBody>{@render children()}</WidgetBody>
  <WidgetFooter>
    {#snippet actions()}<IconButton label="Refresh lab fixture" icon={RefreshCw} onclick={refresh} />{/snippet}
  </WidgetFooter>
  {#if feedback || refreshFeedback}<div class="widget-feedback" role="status">{feedback || refreshFeedback}</div>{/if}
</WidgetShell>

<style>
  .fixture-meta { color: var(--u1-muted); }
  .widget-feedback { position: absolute; right: var(--u1-card-x); bottom: 74px; z-index: 8; max-width: calc(100% - (2 * var(--u1-card-x))); padding: 8px 11px; border-radius: 10px; color: #fff; background: rgb(28 30 32 / 86%); box-shadow: 0 5px 16px rgb(28 30 32 / 16%); font-size: 12px; line-height: 1.35; pointer-events: none; }
</style>
