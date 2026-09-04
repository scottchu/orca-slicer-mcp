<script lang="ts">
  import type { ResolvedNode } from '../../lib/composable/view-model';
  import Card from '../common/Card.svelte';
  import Title from '../common/Title.svelte';
  import Stack from '../common/Stack.svelte';
  import Grid from '../common/Grid.svelte';
  import PercentageBackground from '../common/PercentageBackground.svelte';
  import HeadStatus from './HeadStatus.svelte';
  import HeadTemperature from './HeadTemperature.svelte';
  import FilamentColor from './FilamentColor.svelte';
  import FanRelation from './FanRelation.svelte';
  import PresentationNode from './PresentationNode.svelte';

  let { node, subjectLabel = 'Tool head T1', busy = false }: { node: ResolvedNode; subjectLabel?: string; busy?: boolean } = $props();
</script>

{#if node.type === 'Card'}
  <Card label={subjectLabel} {busy} tint={node.tint?.color ?? null} density={node.density}>
    {#each node.children as child}<PresentationNode node={child} {subjectLabel} {busy} />{/each}
  </Card>
{:else if node.type === 'Title'}
  <Title text={node.text} size={node.size} />
{:else if node.type === 'Stack'}
  <Stack gap={node.gap} inset composed>{#each node.children as child}<PresentationNode node={child} {subjectLabel} {busy} />{/each}</Stack>
{:else if node.type === 'Grid'}
  <Grid columns={node.columns} gap={node.gap} inset>{#each node.children as child}<PresentationNode node={child} {subjectLabel} {busy} />{/each}</Grid>
{:else if node.type === 'PercentageFill'}
  <PercentageBackground value={node.child.value.state === 'known' ? node.child.value.actual : null} max={node.child.value.state === 'known' ? node.child.value.target : null}>
    <PresentationNode node={node.child} {subjectLabel} {busy} />
  </PercentageBackground>
{:else if node.type === 'HeadStatus'}
  <HeadStatus value={node.value} />
{:else if node.type === 'HeadTemperature'}
  <HeadTemperature value={node.value} />
{:else if node.type === 'FilamentColor'}
  <FilamentColor value={node.value} />
{:else if node.type === 'FanRelation'}
  <FanRelation value={node.value} />
{/if}
