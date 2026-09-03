<script lang="ts">
  import type { ComposableViewModel } from '../../lib/composable/view-model';
  import Stack from '../common/Stack.svelte';
  import StatusLine from '../common/StatusLine.svelte';
  import PresentationNode from './PresentationNode.svelte';
  let { presentation }: { presentation: ComposableViewModel } = $props();
  const subjectLabel = $derived(`Tool head ${presentation.subject.id}`);
  const status = $derived(presentation.state === 'loading'
    ? 'Loading composition. Recovery controls are outside this prototype.'
    : presentation.state === 'error'
      ? 'Some sources are unavailable. Recovery controls are outside this prototype.'
      : `Composition for ${presentation.subject.id} is ready. Recovery controls are outside this prototype.`);
</script>

<Stack>
  <PresentationNode node={presentation.root} {subjectLabel} busy={presentation.state === 'loading'} />
  <StatusLine text={status} state={presentation.state} />
 </Stack>
