<script lang="ts">
  import { RefreshCw } from 'lucide-svelte';
  import type { Evidence, Freshness } from '../live/presentation';
  import type { CurrentJobValue, CurrentJobLoadingShapes } from './current-job-value';
  import CurrentJobFacts from './CurrentJobFacts.svelte';
  import WidgetShell from '../ui/WidgetShell.svelte';
  import WidgetHeader from '../ui/WidgetHeader.svelte';
  import WidgetBody from '../ui/WidgetBody.svelte';
  import WidgetFooter from '../ui/WidgetFooter.svelte';
  import StateAnnouncement from '../ui/StateAnnouncement.svelte';
  import StatePanel from '../ui/StatePanel.svelte';
  import DomainReceipt from './DomainReceipt.svelte';
  import Caption from '../ui/Caption.svelte';
  import Icon from '../ui/Icon.svelte';
  import IconButton from '../ui/IconButton.svelte';
  import Skeleton from '../ui/Skeleton.svelte';
  import FeedbackOverlay from '../ui/FeedbackOverlay.svelte';
  let { job, shapes, observedAt = null, freshness = 'unknown', evidence = 'unknown', reason = null, phase, refreshing = false, feedback = '', sourceLabel = 'Printer reported', refreshLabel = 'Refresh Current Job', onrefresh }: {
    job?: CurrentJobValue; shapes?: CurrentJobLoadingShapes; observedAt?: string | null; freshness?: Freshness; evidence?: Evidence; reason?: string | null;
    phase: 'loading' | 'ready' | 'error'; refreshing?: boolean; feedback?: string; sourceLabel?: string; refreshLabel?: string; onrefresh?: () => void;
  } = $props();
  const loading = $derived(phase === 'loading');
  const announcement = $derived(loading ? 'Loading Current Job' : refreshing ? 'Refreshing Current Job' : feedback || 'Current Job loaded');
</script>

<StateAnnouncement text={announcement} />
<WidgetShell label="Current Job" busy={loading || refreshing}>
  <WidgetHeader title="Current Job">
    {#snippet icon()}<Icon name="jobs" />{/snippet}
    {#snippet meta()}<Caption>{sourceLabel} · <DomainReceipt {observedAt} {freshness} state={evidence} {reason} {loading} /></Caption>{/snippet}
  </WidgetHeader>
  <WidgetBody>
    {#if job || loading}<CurrentJobFacts {job} {shapes} />{:else}<StatePanel title="Current Job" reason="error" />{/if}
  </WidgetBody>
  <WidgetFooter>
    {#snippet actions()}{#if loading}<Skeleton shape="action" compact />{:else}<IconButton compact label={phase === 'error' ? 'Retry Current Job' : refreshLabel} icon={RefreshCw} onclick={onrefresh} busy={refreshing} />{/if}{/snippet}
  </WidgetFooter>
  <FeedbackOverlay message={feedback} announce={false} />
</WidgetShell>
