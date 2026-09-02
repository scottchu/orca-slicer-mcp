<script lang="ts">
  import { onDestroy } from 'svelte';
  import { validateHeads, type HeadsObservation } from './types';
  import { loadingObservation, type FailureProps } from './loading';
  import { createCopyAction } from '../live/copy-action';
  import { headColor, type HeadCardValue, type HeadId } from '../live/heads-presentation';
  import { writeClipboard } from '../ui/clipboard';
  import HeadsPanel from './HeadsPanel.svelte';
  import type { MaterialLoadingShapes } from './heads-loading';
  type Props = FailureProps & ({ observation: HeadsObservation; loading?: false; refreshing?: boolean; materialShapes?: never } | { loading: true; observation?: never; refreshing?: never; materialShapes?: MaterialLoadingShapes });
  let { observation, loading = false, refreshing = false, materialShapes, failure, onretry }: Props = $props();
  const heads = $derived(loadingObservation(loading, observation, validateHeads));
  const items = $derived(heads?.items.map((head): HeadCardValue => ({ physicalTool: head.physicalTool, active: head.active, state: head.headState, material: head.material, presence: head.presence, color: head.color, actual: head.actualC, target: head.targetC })));
  const action = createCopyAction(writeClipboard);
  let current = $state(action.getState());
  const stop = action.subscribe((value) => { current = value; });
  $effect.pre(() => { heads; refreshing; action.invalidate(); });
  onDestroy(() => { stop(); action.dispose(); });
  const copy = (id: HeadId, color: string) => {
    const item = items?.find((item) => item.physicalTool === id);
    if (!refreshing && item && headColor(item.presence, item.color).color === color) void action.copy(id, color);
  };
</script>
<HeadsPanel {items} {materialShapes} observedAt={heads?.sourceObservedAt ?? null} freshness={heads?.freshness ?? 'unknown'} materials={heads ? { state: 'known', freshness: heads.freshness === 'offline' ? 'unknown' : heads.freshness, sourceObservedAt: heads.sourceObservedAt, receivedAt: heads.sourceObservedAt, checkedAt: heads.sourceObservedAt, reason: null } : undefined} phase={failure ?? (loading ? 'loading' : 'ready')} {refreshing} copying={current.copying} feedback={current.feedback} sourceLabel="Lab fixture · Head state & thermals" refreshLabel={failure ? 'Retry lab fixture' : 'Refresh lab fixture'} onrefresh={failure && onretry ? onretry : () => action.notify('Lab fixture refreshed')} oncopy={copy} />
