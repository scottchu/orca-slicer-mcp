<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import { RefreshCw } from 'lucide-svelte';
  import type { createFansController } from '../../lib/client/live/controller';
  import { titleCase } from '../../lib/client/observation/format';
  import FanReadings from '../observation/FanReadings.svelte';
  import FansSkeleton from '../observation/FansSkeleton.svelte';
  import Shell from '../common/Shell.svelte';
  import Header from '../common/Header.svelte';
  import Body from '../common/Body.svelte';
  import Footer from '../common/Footer.svelte';
  import StateAnnouncement from '../common/StateAnnouncement.svelte';
  import StateSurface from '../common/StateSurface/StateSurface.svelte';
  import DomainReceipt from '../observation/DomainReceipt.svelte';
  import Icon from '../common/Icon.svelte';
  import { observationIcons } from '../../lib/client/observation/icons';
  import Button from '../common/Button.svelte';
  import Skeleton from '../common/Skeleton.svelte';
  import FeedbackOverlay from '../common/FeedbackOverlay.svelte';
  import Stack from '../common/Stack.svelte';
  import InfoPair from '../common/InfoPair.svelte';
  import Label from '../common/Label.svelte';
  let { controller }: { controller: ReturnType<typeof createFansController> } = $props();
  let current = $state(untrack(() => controller.getState()));
  const observation = $derived(current.observation);
  const unavailable = $derived(!!observation && (observation.state === 'unavailable' || observation.state === 'unsupported'));
  const placeholder = $derived(!observation || unavailable || !!current.failure);
  const notice = $derived(current.feedback || (unavailable ? 'Fans & Air ' + (observation?.state === 'unsupported' ? 'endpoint unsupported' : 'unavailable') : ''));
  const announcement = $derived(current.phase === 'loading' ? 'Loading Fans & Air' : current.refreshing ? 'Refreshing Fans & Air' : notice || 'Fans & Air loaded');
  onMount(() => {
    const unsubscribe = controller.subscribe((state) => { current = state; });
    controller.start();
    return () => { unsubscribe(); controller.dispose(); };
  });
</script>
<StateAnnouncement text={announcement} />
<StateSurface phase={current.failure ? 'error' : unavailable ? 'unavailable' : current.phase}>
<Shell label="Fans & Air" busy={current.phase === 'loading' || current.refreshing}>
  <Header title="Fans & Air">
    {#snippet icon()}<Icon icon={observationIcons.fan} />{/snippet}
    {#snippet meta()}<DomainReceipt observedAt={observation?.receipt.sourceObservedAt ?? null} freshness={observation?.receipt.freshness ?? 'unknown'} state={observation?.state} loading={placeholder} groupedTime={false} />{/snippet}
  </Header>
  <Body>
    {#if observation && !placeholder}
      <Stack>
        <InfoPair reserve="label">
          {#snippet label()}<Label text="Purifier" tone="muted" />{/snippet}
          {#snippet value()}<Label text={observation.purifier.mode === null ? 'N/A' : titleCase(observation.purifier.mode)} />{/snippet}
        </InfoPair>
        <InfoPair reserve="label">
          {#snippet label()}<Label text="Power" tone="muted" />{/snippet}
          {#snippet value()}<Label text={observation.purifier.powerDetected === null ? 'N/A' : observation.purifier.powerDetected ? 'Detected' : 'Not detected'} />{/snippet}
        </InfoPair>
        <FanReadings items={observation.items} />
      </Stack>
    {:else}<FansSkeleton includePower />{/if}
  </Body>
  <Footer message={current.failure || unavailable ? notice : ''}>
    {#snippet actions()}{#if current.phase === 'loading'}<Skeleton shape="action" />{:else}<Button label="Refresh Fans & Air" icon={RefreshCw} onclick={() => { void controller.refresh(); }} busy={current.refreshing} />{/if}{/snippet}
  </Footer>
  <FeedbackOverlay message={current.failure || unavailable ? '' : notice} announce={false} />
</Shell>
</StateSurface>
