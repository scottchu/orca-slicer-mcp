<script lang="ts">
  import type { ResolvedNode } from '../../lib/composable/view-model';
  import { resolveRegisteredNode } from './component-registry';
  import PresentationNode from './PresentationNode.svelte';

  let { node, subjectLabel = 'Tool head T1', busy = false }: { node: ResolvedNode; subjectLabel?: string; busy?: boolean } = $props();
  const registered = $derived(resolveRegisteredNode(node, { subjectLabel, busy }));
  const Component = $derived(registered.component);
</script>

{#if registered.role === 'root' || registered.role === 'layout' || registered.role === 'semantic'}
  <Component {...registered.props}>
    {#each registered.children ?? [] as child}<PresentationNode node={child} {subjectLabel} {busy} />{/each}
  </Component>
{:else}
  <Component {...registered.props} />
{/if}
