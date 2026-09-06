<script lang="ts">
  import type { ResolvedNode } from '../../lib/composable/view-model';
  import { resolveRegisteredNode, type PresentationRenderContext } from './component-registry';
  import PresentationNode from './PresentationNode.svelte';

  let { node, subjectLabel = 'Tool head T1', busy = false, context }: { node: ResolvedNode; subjectLabel?: string; busy?: boolean; context?: PresentationRenderContext } = $props();
  const registered = $derived(resolveRegisteredNode(node, context ?? { subjectLabel, busy }));
  const Component = $derived(registered.component);
</script>

{#if registered.role === 'root' || registered.role === 'layout' || registered.role === 'semantic'}
  <Component {...registered.props}>
    {#each registered.children ?? [] as child}<PresentationNode node={child} context={registered.childContext} />{/each}
  </Component>
{:else}
  <Component {...registered.props} />
{/if}
